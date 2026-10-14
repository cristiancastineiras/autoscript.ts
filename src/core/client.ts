import type { Batch } from "./batch.js";
import { defineClientConfig } from "./config.js";
import { AutoFirmaError, normalizeError } from "./errors.js";
import { abortable, deadline } from "./lifecycle.js";
import { parseResponse } from "../protocol/response.js";
import type {
  BatchRequest,
  BatchResult,
  ClientConfig,
  ExecuteOptions,
  FilesResult,
  LoadRequest,
  OperationRequest,
  OperationResult,
  Properties,
  SaveRequest,
  SignAndSaveRequest,
  SignatureResult,
  SignRequest,
  Transport,
} from "./types.js";

export class AutoFirmaClient {
  readonly #transport: Transport;
  #config: ClientConfig;
  #active: AbortController | null = null;
  #disposed: boolean = false;
  #resetSticky: boolean = false;
  #lastError: AutoFirmaError | null = null;

  constructor(transport: Transport, options: Partial<ClientConfig> = {}) {
    this.#transport = transport;
    this.#config = defineClientConfig(options);
  }

  get config(): ClientConfig {
    return this.#config;
  }
  get busy(): boolean {
    return this.#active !== null;
  }
  get lastError(): AutoFirmaError | null {
    return this.#lastError;
  }

  configure(options: Partial<ClientConfig>): void {
    if (this.#disposed) throw new AutoFirmaError("disposed", "Client is disposed.");
    if (this.busy) throw new AutoFirmaError("busy", "Cannot configure an active operation.");
    const config = defineClientConfig({ ...this.#config, ...options });
    if (config.keyStore !== this.#config.keyStore || config.sticky !== this.#config.sticky)
      this.#resetSticky = true;
    this.#config = config;
  }

  async execute(request: OperationRequest, options: ExecuteOptions = {}): Promise<OperationResult> {
    if (this.#disposed) throw new AutoFirmaError("disposed", "Client is disposed.");
    if (this.busy) throw new AutoFirmaError("busy", "A native operation is already active.");
    const controller = new AbortController();
    this.#active = controller;
    this.#lastError = null;
    const scope = deadline(this.#config.timeoutMs, controller.signal);
    const abort = (): void =>
      controller.abort(
        new AutoFirmaError(
          "cancelled",
          "Operation aborted locally.",
          null,
          null,
          options.signal?.reason,
        ),
      );
    if (options.signal?.aborted) abort();
    else options.signal?.addEventListener("abort", abort, { once: true });
    try {
      scope.signal.throwIfAborted();
      const snapshot = Object.freeze({
        ...request,
        ...("properties" in request && typeof request.properties === "object"
          ? { properties: Object.freeze({ ...request.properties }) }
          : {}),
      });
      const value = await abortable(
        this.#transport.execute(snapshot, {
          config: this.#config,
          signal: scope.signal,
          resetSticky: this.#resetSticky,
        }),
        scope.signal,
      );
      scope.signal.throwIfAborted();
      this.#resetSticky = false;
      return parseResponse(
        snapshot,
        value,
        this.#config.maxResponseLength,
        this.#transport.kind !== "intermediate",
      );
    } catch (error) {
      this.#lastError = normalizeError(error);
      throw this.#lastError;
    } finally {
      scope.dispose();
      options.signal?.removeEventListener("abort", abort);
      this.#active = null;
    }
  }

  async sign(
    request: Omit<SignRequest, "operation">,
    options?: ExecuteOptions,
  ): Promise<SignatureResult> {
    return this.#signature({ ...request, operation: "sign" }, options);
  }
  async cosign(
    request: Omit<SignRequest, "operation">,
    options?: ExecuteOptions,
  ): Promise<SignatureResult> {
    return this.#signature({ ...request, operation: "cosign" }, options);
  }
  async counterSign(
    request: Omit<SignRequest, "operation">,
    options?: ExecuteOptions,
  ): Promise<SignatureResult> {
    return this.#signature({ ...request, operation: "countersign" }, options);
  }
  async signAndSave(
    request: Omit<SignAndSaveRequest, "operation">,
    options?: ExecuteOptions,
  ): Promise<SignatureResult> {
    return this.#signature({ ...request, operation: "signandsave" }, options);
  }
  async #signature(
    request: SignRequest | SignAndSaveRequest,
    options?: ExecuteOptions,
  ): Promise<SignatureResult> {
    const result = await this.execute(request, options);
    if (!("signature" in result))
      throw new AutoFirmaError("protocol", "Expected signature result.");
    return result;
  }
  async selectCertificate(properties: Properties = "", options?: ExecuteOptions): Promise<string> {
    const result = await this.execute({ operation: "selectcert", properties }, options);
    if (!("certificate" in result) || result.certificate === null)
      throw new AutoFirmaError("protocol", "Expected certificate result.");
    return result.certificate;
  }
  async signBatch(
    request: Omit<BatchRequest, "operation">,
    options?: ExecuteOptions,
  ): Promise<BatchResult> {
    const result = await this.execute({ ...request, operation: "batch" }, options);
    if (!("result" in result)) throw new AutoFirmaError("protocol", "Expected batch result.");
    return result;
  }
  async signBatchProcess(
    batch: Batch,
    stopOnError: boolean,
    request: Omit<BatchRequest, "operation" | "data" | "json">,
    options?: ExecuteOptions,
  ): Promise<BatchResult> {
    return this.signBatch({ ...request, data: batch.encode(stopOnError), json: true }, options);
  }
  async saveDataToFile(
    request: Omit<SaveRequest, "operation">,
    options?: ExecuteOptions,
  ): Promise<void> {
    await this.execute({ ...request, operation: "save" }, options);
  }
  async loadFiles(
    request: Omit<LoadRequest, "operation"> = {},
    options?: ExecuteOptions,
  ): Promise<FilesResult> {
    const result = await this.execute({ ...request, operation: "load" }, options);
    if (!("files" in result)) throw new AutoFirmaError("protocol", "Expected file result.");
    return result;
  }
  cancel(): void {
    this.#active?.abort(new AutoFirmaError("cancelled", "Operation aborted locally."));
  }
  dispose(): void {
    if (this.#disposed) return;
    this.#disposed = true;
    this.cancel();
    this.#transport.dispose();
  }
}
