import { isMobile, sleep } from "../browser/environment.js";
import { AutoFirmaError, ERRORS, EXCEPTION } from "../core/errors.js";
import {
  aesCipher,
  aesDecipherFields,
  createAesConfig,
  desCipher,
  desDecipherFields,
  encodeCipherConfig,
  isDesField,
  type CipherConfig,
} from "../crypto/wire.js";
import { toBase64UrlSafe } from "../encoding/base64.js";
import { encodeUtf8 } from "../encoding/utf8.js";
import type { NativeResult, WireOperation } from "../protocol/operation.js";
import {
  appName,
  intermediateOperationParams,
  intermediateParams,
  intermediateUrl,
  intermediateXml,
  operationName,
  type Param,
} from "../protocol/requests.js";
import {
  parseIntermediateFields,
  throwIfNativeError,
  WEBSOCKET_CODES,
} from "../protocol/responses.js";
import { newDesKey, newSessionId } from "../protocol/session.js";
import { resolveServlets } from "./servlets.js";
import type { OperationContext, Transport } from "./transport.js";

/** Longitud maxima de la URL de invocacion; por encima, los datos se suben al servidor. */
const MAX_URL_LENGTH = 2000;
const FORM = { "Content-Type": "application/x-www-form-urlencoded" } as const;

/**
 * Comunicacion con Autofirma mediante un servidor intermedio: la pagina invoca la aplicacion
 * por protocolo y recoge el resultado del RetrieveService. Es el canal de Autofirma App en
 * Android e iOS y el modo forzado con `setForceWSMode(true)`.
 */
export class IntermediateTransport implements Transport {
  readonly kind = "intermediate" as const;
  /** Autofirma ya ha demostrado soportar AES: las subidas siguientes se cifran con AES. */
  #advancedCipher = false;
  /** Certificado fijado cuando `stickySignatory` esta activo en escritorio. */
  #stickyCertificate: string | null = null;
  #disposed = false;

  async execute(operation: WireOperation, context: OperationContext): Promise<NativeResult> {
    if (this.#disposed)
      throw new AutoFirmaError(EXCEPTION.ILLEGAL_STATE, "El cliente de Autofirma se ha liberado");
    const { env, settings, dialogs } = context;
    if (operation.kind === "load")
      throw AutoFirmaError.from(
        EXCEPTION.UNSUPPORTED,
        operation.multiple ? ERRORS.UPLOAD_MULTIPLE_FILE_SERVER : ERRORS.UPLOAD_FILE_SERVER,
      );
    const servlets = resolveServlets(settings.servlets, env.location);
    const mobile = isMobile(env.platform);
    const subtle = env.crypto.subtle as SubtleCrypto | undefined;
    const desKey = newDesKey(env.crypto);
    let config: CipherConfig = { legDes: desKey };
    if (subtle) config = createAesConfig(env.crypto, desKey);
    else if (env.location?.protocol !== "https:") await dialogs?.showInsecureContextWarning();

    const id = newSessionId(env.crypto);
    const name = operationName(operation);
    const intent = env.platform.chrome && env.platform.android;
    const params = intermediateParams(
      operation,
      intermediateOperationParams(operation, settings, {
        mobile,
        certificate: this.#stickyCertificate,
      }),
      {
        id,
        appName: appName(settings, env.location?.hostname ?? null),
        desKey,
        cipher: config.algo ? encodeCipherConfig(config) : null,
        storage: servlets.storage,
        progressDialog: settings.progressDialog,
        mobile,
      },
    );
    let url = intermediateUrl(name, params, settings, intent);
    if (url.length > MAX_URL_LENGTH) {
      dialogs?.showLoading();
      const fileId = newSessionId(env.crypto);
      const xmlParams: Param[] = settings.minimumClientVersion
        ? [...params, { key: "mcv", value: settings.minimumClientVersion }]
        : params;
      const xml = encodeUtf8(intermediateXml(name, xmlParams));
      const payload =
        this.#advancedCipher && subtle && config.algo
          ? toBase64UrlSafe(await aesCipher(subtle, config, xml))
          : desCipher(xml, desKey);
      await this.#upload(servlets.storage, fileId, payload, context);
      url = intermediateUrl(
        name,
        [
          { key: "fileid", value: fileId },
          { key: "rid", value: id },
          { key: "rtservlet", value: servlets.retriever },
          { key: "stservlet", value: servlets.storage },
          { key: "key", value: desKey },
          { key: "cipher", value: config.algo ? encodeCipherConfig(config) : null },
        ],
        settings,
        intent,
      );
      if (url.length > MAX_URL_LENGTH)
        throw AutoFirmaError.from(EXCEPTION.ILLEGAL_ARGUMENT, ERRORS.TOO_LONG_URL);
    }

    dialogs?.showLoading();
    try {
      env.launch(url);
    } catch (cause) {
      throw AutoFirmaError.from(EXCEPTION.APP_NOT_FOUND, ERRORS.WEBSERVER_INVOICE_APP, {
        cause,
        dialog: "connecting-afirma",
      });
    }
    const response = await this.#poll(servlets.retriever, id, mobile, context);
    return this.#interpret(operation, response, config, context);
  }

  dispose(): void {
    this.#disposed = true;
    this.#stickyCertificate = null;
  }

  async #upload(
    storage: string,
    fileId: string,
    payload: string,
    context: OperationContext,
  ): Promise<void> {
    let response: Response;
    try {
      response = await context.env.fetch(storage, {
        method: "POST",
        headers: FORM,
        body: `op=put&v=1_0&id=${fileId}&dat=${payload}`,
        cache: "no-store",
        signal: context.signal,
      });
    } catch (cause) {
      context.signal.throwIfAborted();
      throw AutoFirmaError.from(EXCEPTION.IO, ERRORS.UPLOADING_TO_SERVER, { cause });
    }
    if (!response.ok)
      throw AutoFirmaError.from(EXCEPTION.IO, ERRORS.UPLOADING_TO_APP, {
        dialog: "connecting-service",
      });
  }

  /**
   * Consulta el RetrieveService hasta obtener una respuesta. `err-06` (aun no hay resultado) y
   * los fallos de red se reintentan; `#wait` indica que Autofirma esta trabajando y reinicia la
   * cuenta de intentos.
   */
  async #poll(
    retriever: string,
    id: string,
    mobile: boolean,
    context: OperationContext,
  ): Promise<string> {
    const { env, signal, dialogs, services } = context;
    const maxIterations = mobile ? 15 : 10;
    const wait = mobile ? 4000 : 3000;
    let iterations = 0;
    let connected = false;
    for (;;) {
      await sleep(env, wait, signal);
      if (iterations > maxIterations) {
        dialogs?.close();
        throw AutoFirmaError.from(EXCEPTION.TIMEOUT, ERRORS.WEBSERVER_INVOICE_APP_TIMEOUT, {
          dialog: connected || !services.compatible ? "connecting-service" : "connecting-afirma",
        });
      }
      const it = iterations;
      iterations += 1;
      let response: Response;
      try {
        response = await env.fetch(retriever, {
          method: "POST",
          headers: FORM,
          body: `op=get&v=1_0&id=${id}&it=${it}`,
          cache: "no-store",
          signal,
        });
      } catch {
        // En iOS la primera consulta tras abrir Autofirma puede fallar: se sigue intentando.
        signal.throwIfAborted();
        continue;
      }
      if (!response.ok) {
        dialogs?.close();
        throw new AutoFirmaError(
          EXCEPTION.IO,
          `${ERRORS.WEBSERVER_ERROR_CONNECTING_SERVICE.message} (Status: ${response.status})`,
          ERRORS.WEBSERVER_ERROR_CONNECTING_SERVICE.code,
          { dialog: "connecting-service" },
        );
      }
      const text = await response.text();
      if (text.slice(0, 6).toLowerCase() === "err-06") continue;
      dialogs?.close();
      if (text.slice(0, 5).toLowerCase() === "#wait") {
        iterations = 0;
        connected = true;
        continue;
      }
      return text;
    }
  }

  async #interpret(
    operation: WireOperation,
    response: string,
    config: CipherConfig,
    context: OperationContext,
  ): Promise<NativeResult> {
    const text = response.replace(/\r?\n$/, "");
    throwIfNativeError(text, WEBSOCKET_CODES);
    if (text === "OK" || text === "SAVE_OK") return { type: "saved", status: text };
    const fields = text.split("|");
    const subtle = context.env.crypto.subtle as SubtleCrypto | undefined;
    let plain: string[];
    if (subtle && config.algo && !isDesField(fields[0] ?? "")) {
      plain = await aesDecipherFields(subtle, config, fields);
      this.#advancedCipher = true;
    } else {
      plain = desDecipherFields(fields, config.legDes);
    }
    const result = parseIntermediateFields(operation, plain);
    if (!context.settings.stickySignatory) this.#stickyCertificate = null;
    else if (result.type === "certificate") this.#stickyCertificate = result.certificate;
    else if ((result.type === "signature" || result.type === "batch") && result.certificate)
      this.#stickyCertificate = result.certificate;
    return result;
  }
}
