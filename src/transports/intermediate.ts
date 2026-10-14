import { AutoFirmaError, checkNativeError, normalizeError } from "../core/errors.js";
import { delay } from "../core/lifecycle.js";
import type { OperationContext, OperationRequest, Transport } from "../core/types.js";
import {
  buildOperationUrl,
  buildXml,
  operationParameters,
  serializeProperties,
  type Parameter,
} from "../protocol/request.js";
import { encodeUtf8 } from "../encoding/index.js";
import { detectMobile, launchNative } from "../browser/launch.js";
import { postText } from "../browser/network.js";
import { randomSession } from "./session.js";
import { createWireCipher, type LegacyCipher, type WireCipher } from "./wire-crypto.js";

export interface IntermediateOptions {
  readonly storageUrl: string;
  readonly retrieveUrl: string;
  readonly launch?: (url: string) => void;
  readonly fetch?: typeof fetch;
  readonly mobile?: boolean;
  readonly androidIntent?: boolean;
  readonly pollDelayMs?: number;
  readonly maxPolls?: number;
  readonly maxUrlLength?: number;
  readonly legacyCipher?: () => LegacyCipher;
  readonly forceLegacyCipher?: boolean;
  readonly allowInsecureServices?: boolean;
  readonly createCipher?: () => Promise<WireCipher>;
}

export class IntermediateTransport implements Transport {
  readonly kind = "intermediate" as const;
  readonly #options: IntermediateOptions;
  #advancedSupported: boolean = false;
  #certificate: string | null = null;
  #disposed: boolean = false;
  #busy: boolean = false;
  #active: AbortController | null = null;

  constructor(options: IntermediateOptions) {
    for (const value of [options.storageUrl, options.retrieveUrl]) {
      const url = new URL(value);
      if (
        url.username ||
        url.password ||
        (url.protocol !== "https:" && !(options.allowInsecureServices && url.protocol === "http:"))
      )
        throw new TypeError("Servlets require HTTPS without embedded credentials.");
    }
    for (const value of [options.maxPolls ?? 15, options.maxUrlLength ?? 2000])
      if (!Number.isSafeInteger(value) || value < 1)
        throw new RangeError("Invalid intermediate limits.");
    this.#options = { ...options };
  }

  async execute(request: OperationRequest, context: OperationContext): Promise<string> {
    if (this.#disposed) throw new AutoFirmaError("disposed", "Transport is disposed.");
    if (this.#busy) throw new AutoFirmaError("busy", "Transport is busy.");
    if (request.operation === "load")
      throw new AutoFirmaError(
        "unsupported",
        "Native file loading is unavailable through intermediate services.",
      );
    const mobile = this.#options.mobile ?? detectMobile();
    if (mobile && request.operation === "batch" && request.local)
      throw new AutoFirmaError("unsupported", "Local batches are unavailable on mobile.");
    if (mobile && "data" in request && !request.data)
      throw new AutoFirmaError("unsupported", "Mobile signing requires document data.");
    context.signal.throwIfAborted();
    this.#active = new AbortController();
    context = { ...context, signal: AbortSignal.any([context.signal, this.#active.signal]) };
    this.#busy = true;
    let cipher: WireCipher | null = null;
    try {
      if (context.resetSticky || !context.config.sticky) this.#certificate = null;
      let effective = request;
      if (!mobile && context.config.sticky && this.#certificate && "properties" in request) {
        effective = {
          ...request,
          properties: `${serializeProperties(request.properties)}\nfilters=encodedcert:${this.#certificate}\nheadless=true`,
        };
      }
      const operation = operationParameters(effective, context, "intermediate");
      cipher = await (this.#options.createCipher?.() ??
        createWireCipher(this.#options.legacyCipher, this.#options.forceLegacyCipher));
      context.signal.throwIfAborted();
      const id = randomSession();
      const parameters: Parameter[] = [
        ...operation,
        ["ver", "4"],
        ["op", request.operation],
        ["id", id],
        ["stservlet", this.#options.storageUrl],
        ...cipher.parameters,
      ];
      if (!parameters.some(([key]) => key === "appname") && context.config.appName)
        parameters.push(["appname", context.config.appName]);
      if (!mobile) parameters.push(["aw", "true"]);
      if (!context.config.progressDialog) parameters.push(["dlgload", "false"]);
      let url = buildOperationUrl(
        request.operation,
        [["jvc", "4"], ...parameters],
        context.config.minimumVersion,
        "intermediate",
      );
      if (url.length > (this.#options.maxUrlLength ?? 2000)) {
        const fileId = randomSession();
        const xmlParameters: Parameter[] = context.config.minimumVersion
          ? [...parameters, ["mcv", context.config.minimumVersion]]
          : parameters;
        const encrypted = await cipher.encrypt(
          encodeUtf8(buildXml(request.operation, xmlParameters)),
          this.#advancedSupported,
        );
        await this.#post(
          this.#options.storageUrl,
          new URLSearchParams({ op: "put", v: "1_0", id: fileId, dat: encrypted }).toString(),
          context,
          "AS300302",
        );
        url = buildOperationUrl(
          request.operation,
          [
            ["jvc", "4"],
            ["fileid", fileId],
            ["rid", id],
            ["rtservlet", this.#options.retrieveUrl],
            ["stservlet", this.#options.storageUrl],
            ...cipher.parameters,
          ],
          context.config.minimumVersion,
          "intermediate",
        );
        if (url.length > (this.#options.maxUrlLength ?? 2000))
          throw new AutoFirmaError("protocol", "Launch URI exceeds configured limit.");
      }
      context.signal.throwIfAborted();
      (this.#options.launch ?? launchNative)(
        this.#options.androidIntent
          ? url.replace("afirma://", "intent://") +
              "#Intent;scheme=afirma;package=es.gob.afirma;end"
          : url,
      );
      let iteration = 0;
      while (iteration < (this.#options.maxPolls ?? (mobile ? 15 : 10))) {
        await delay(this.#options.pollDelayMs ?? (mobile ? 4000 : 3000), context.signal);
        const response = (
          await this.#post(
            this.#options.retrieveUrl,
            new URLSearchParams({ op: "get", v: "1_0", id, it: String(++iteration) }).toString(),
            context,
            "AS620025",
          )
        ).trimEnd();
        if (response.startsWith("err-06")) continue;
        if (response === "#wait") {
          iteration = 0;
          continue;
        }
        checkNativeError(response);
        if (response === "OK" || response === "SAVE_OK") return response;
        const fields = response.split("|");
        if (fields.length > 3 || fields.some((field) => !field))
          throw new AutoFirmaError("protocol", "Invalid intermediate response fields.");
        const decoded = await cipher.decryptFields(fields);
        context.signal.throwIfAborted();
        this.#advancedSupported ||= decoded.advanced;
        if (context.config.sticky)
          this.#certificate =
            request.operation === "selectcert"
              ? (decoded.fields[0] ?? null)
              : request.operation === "batch"
                ? (decoded.fields[1] ?? null)
                : decoded.fields.length > 1
                  ? (decoded.fields[0] ?? null)
                  : this.#certificate;
        return decoded.fields.join("|");
      }
      throw new AutoFirmaError("timeout", "Intermediate polling exhausted.", "AS620024");
    } finally {
      cipher?.dispose();
      this.#busy = false;
      this.#active = null;
    }
  }

  async #post(
    url: string,
    body: string,
    context: OperationContext,
    networkErrorCode: string,
  ): Promise<string> {
    try {
      return await postText(
        url,
        body,
        context.signal,
        context.config.maxResponseLength,
        this.#options.fetch,
      );
    } catch (error) {
      const failure = normalizeError(error);
      if (failure.kind === "network")
        throw new AutoFirmaError(
          "network",
          failure.message,
          networkErrorCode,
          failure.nativeType,
          failure,
        );
      throw failure;
    }
  }

  dispose(): void {
    this.#disposed = true;
    this.#active?.abort(new AutoFirmaError("disposed", "Transport is disposed."));
    this.#certificate = null;
  }
}
