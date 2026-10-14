import { createEnvironment, type Environment } from "../browser/environment.js";
import type { NativeResult, OperationSettings, WireOperation } from "../protocol/operation.js";
import { serializeExtraParams } from "../protocol/requests.js";
import { checkServlets, resolveServlets } from "../transports/servlets.js";
import type { Transport } from "../transports/transport.js";
import type { Batch } from "./batch.js";
import { AUTOFIRMA_CONNECTION_RETRIES, AUTOFIRMA_LAUNCHING_TIME } from "./constants.js";
import { abortError, AutoFirmaError, ERRORS, EXCEPTION, toAutoFirmaError } from "./errors.js";
import type {
  BatchSignResult,
  ClientSettings,
  ExtraParams,
  LoadedFile,
  LoadRequest,
  MultiSignRequest,
  OperationDialogs,
  OperationOptions,
  SaveRequest,
  SelectCertificateRequest,
  ServiceStatus,
  SignAndSaveRequest,
  SignOperation,
  SignRequest,
  SignResult,
  TransportKind,
} from "./types.js";

/** Configuracion por defecto de un cliente. */
export const DEFAULT_SETTINGS: ClientSettings = Object.freeze({
  keyStore: null,
  stickySignatory: false,
  appName: null,
  minimumClientVersion: null,
  serviceTimeout: null,
  progressDialog: true,
  portRange: null,
  servlets: null,
  connectionRetries: AUTOFIRMA_CONNECTION_RETRIES,
  launchingTime: AUTOFIRMA_LAUNCHING_TIME,
});

/** Opciones de un {@link AutoFirmaClient}. */
export interface AutoFirmaClientOptions extends Partial<ClientSettings> {
  /** Canal de comunicacion con Autofirma. */
  readonly transport: Transport;
  /** Dialogos de carga y error. Por defecto no se muestra ninguno. */
  readonly dialogs?: OperationDialogs | null;
  /** Dependencias del navegador. Por defecto, las de `globalThis`. */
  readonly environment?: Environment;
  /** Estado de los servicios del servidor intermedio, si se comparte entre clientes. */
  readonly services?: ServiceStatus;
}

/** Peticion de firma de un lote JSON. */
export interface BatchSignRequest extends OperationOptions {
  /** Lote a firmar, o un lote ya codificado con {@link Batch.encode}. */
  readonly batch: Batch | string;
  /** Detener el lote en el primer error (solo si `batch` es un {@link Batch}). */
  readonly stopOnError?: boolean;
  /** Servicio de prefirma de lotes. Debe omitirse en lotes locales. */
  readonly preSignerUrl?: string | null;
  /** Servicio de postfirma de lotes. Debe omitirse en lotes locales. */
  readonly postSignerUrl?: string | null;
  /** Filtros de certificados (`certFilters`). */
  readonly extraParams?: ExtraParams | null;
  /** Firma monofasica: Autofirma firma en local y devuelve las firmas. Solo escritorio. */
  readonly local?: boolean;
}

/** Peticion de firma de un lote XML heredado. */
export interface XmlBatchSignRequest extends OperationOptions {
  /** Definicion XML del lote en Base64. */
  readonly batch: string;
  readonly preSignerUrl?: string | null;
  readonly postSignerUrl?: string | null;
  readonly extraParams?: ExtraParams | null;
  readonly local?: boolean;
}

function unexpected(): AutoFirmaError {
  return AutoFirmaError.from(EXCEPTION.GENERIC, ERRORS.WEBSOCKET_INVALID_RESP);
}

function abortable<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const abort = (): void => reject(signal.reason);
    signal.addEventListener("abort", abort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener("abort", abort);
        resolve(value);
      },
      (error: unknown) => {
        signal.removeEventListener("abort", abort);
        reject(error);
      },
    );
  });
}

/**
 * Cliente de Autofirma con API de promesas. Mantiene una sola operacion nativa activa: las
 * firmas de un mismo Autofirma son secuenciales.
 *
 * @example
 * ```ts
 * const client = createAutoFirmaClient();
 * const { signature } = await client.sign({ data, algorithm: "SHA512withRSA", format: "CAdES" });
 * ```
 */
export class AutoFirmaClient {
  /** Estado de las comprobaciones del servidor intermedio. */
  readonly services: ServiceStatus;
  readonly #transport: Transport;
  readonly #env: Environment;
  #dialogs: OperationDialogs | null;
  #settings: ClientSettings;
  #resetSticky = false;
  #active: AbortController | null = null;
  #gate: Promise<void> | null = null;
  #lastError: AutoFirmaError | null = null;
  #disposed = false;

  constructor(options: AutoFirmaClientOptions) {
    const { transport, dialogs, environment, services, ...settings } = options;
    this.services = services ?? { checked: false, failing: false, compatible: true };
    this.#transport = transport;
    this.#env = environment ?? createEnvironment();
    this.#dialogs = dialogs ?? null;
    this.#settings = Object.freeze({ ...DEFAULT_SETTINGS, ...settings });
  }

  /** Canal que usa el cliente. */
  get transport(): TransportKind {
    return this.#transport.kind;
  }

  /** Dependencias del navegador que usa el cliente. */
  get environment(): Environment {
    return this.#env;
  }

  /** Configuracion actual. */
  get settings(): ClientSettings {
    return this.#settings;
  }

  /** Hay una operacion en curso. */
  get busy(): boolean {
    return this.#active !== null;
  }

  /** Ultimo error de una operacion, o `null`. */
  get lastError(): AutoFirmaError | null {
    return this.#lastError;
  }

  /** Dialogos de carga y error. */
  get dialogs(): OperationDialogs | null {
    return this.#dialogs;
  }

  set dialogs(dialogs: OperationDialogs | null) {
    this.#dialogs = dialogs;
  }

  /**
   * Cambia la configuracion. Cambiar el almacen o desactivar `stickySignatory` hace que
   * Autofirma olvide el certificado fijado en la siguiente operacion.
   */
  configure(changes: Partial<ClientSettings>): this {
    const previous = this.#settings;
    const next = Object.freeze({ ...previous, ...changes });
    if (
      ("keyStore" in changes && next.keyStore !== previous.keyStore) ||
      (previous.stickySignatory && !next.stickySignatory)
    )
      this.#resetSticky = true;
    this.#settings = next;
    return this;
  }

  /** Pide a Autofirma que olvide el certificado fijado en la siguiente operacion. */
  resetStickySignatory(): void {
    this.#resetSticky = true;
  }

  /**
   * Hace que las operaciones esperen a la promesa indicada (por ejemplo, una comprobacion de
   * hora obligatoria). Si se rechaza, las operaciones fallan con ese error.
   */
  waitFor(gate: Promise<unknown> | null): void {
    this.#gate = gate ? gate.then(() => undefined) : null;
    this.#gate?.catch(() => undefined);
  }

  /** Firma datos. */
  async sign(request: SignRequest): Promise<SignResult> {
    return this.#signature(request, "sign", request.data ?? null);
  }

  /** Cofirma una firma existente. */
  async coSign(request: MultiSignRequest): Promise<SignResult> {
    return this.#signature(request, "cosign", request.signature ?? null);
  }

  /** Contrafirma una firma existente. */
  async counterSign(request: MultiSignRequest): Promise<SignResult> {
    return this.#signature(request, "countersign", request.signature ?? null);
  }

  /** Firma, cofirma o contrafirma y guarda el resultado en disco. */
  async signAndSave(request: SignAndSaveRequest): Promise<SignResult> {
    const result = await this.#run(
      {
        kind: "signandsave",
        operation: request.operation ?? "sign",
        data: request.data ?? null,
        algorithm: request.algorithm,
        format: request.format,
        extraParams: serializeExtraParams(request.extraParams),
        fileName: request.fileName ?? null,
      },
      request,
      true,
    );
    if (result.type !== "signature") throw unexpected();
    return {
      signature: result.signature,
      certificate: result.certificate,
      extraData: result.extraData,
    };
  }

  /** Pide al usuario un certificado y devuelve su parte publica en Base64. */
  async selectCertificate(request: SelectCertificateRequest = {}): Promise<string> {
    const result = await this.#run(
      { kind: "selectcert", extraParams: serializeExtraParams(request.extraParams) },
      request,
      true,
    );
    if (result.type !== "certificate") throw unexpected();
    return result.certificate;
  }

  /** Firma un lote JSON. */
  async signBatch(request: BatchSignRequest): Promise<BatchSignResult> {
    const data =
      typeof request.batch === "string"
        ? request.batch
        : request.batch.encode(request.stopOnError ?? false);
    return this.#batch(request, data, true);
  }

  /** Firma un lote XML (mecanismo heredado). */
  async signBatchXml(request: XmlBatchSignRequest): Promise<BatchSignResult> {
    return this.#batch(request, request.batch, false);
  }

  /** Guarda datos en disco mediante Autofirma. Devuelve el estado (`OK` o `SAVE_OK`). */
  async saveDataToFile(request: SaveRequest): Promise<string> {
    const result = await this.#run(
      {
        kind: "save",
        data: request.data,
        title: request.title ?? null,
        fileName: request.fileName ?? null,
        extension: request.extension ?? null,
        description: request.description ?? null,
      },
      request,
      false,
    );
    if (result.type !== "saved") throw unexpected();
    return result.status;
  }

  /** Pide al usuario un fichero mediante Autofirma. No disponible por servidor intermedio. */
  async loadFile(request: LoadRequest = {}): Promise<LoadedFile> {
    const [file] = await this.#load(request, false);
    if (!file) throw unexpected();
    return file;
  }

  /** Pide al usuario uno o varios ficheros mediante Autofirma. */
  async loadFiles(request: LoadRequest = {}): Promise<readonly LoadedFile[]> {
    return this.#load(request, true);
  }

  /**
   * Comprueba los servicios del servidor intermedio y actualiza {@link services}.
   * @param compatibility Si falla, marca el tramite como incompatible con el dispositivo.
   */
  async checkServices(compatibility = false): Promise<boolean> {
    const servlets = resolveServlets(this.#settings.servlets, this.#env.location);
    const ok = await checkServlets(this.#env, servlets);
    this.services.checked = true;
    this.services.failing = !ok;
    this.services.compatible = ok || !compatibility;
    return ok;
  }

  /** Aborta la espera de la operacion en curso. */
  abort(reason?: unknown): void {
    this.#active?.abort(abortError(reason));
  }

  /** Libera el canal y aborta la operacion en curso. */
  dispose(): void {
    if (this.#disposed) return;
    this.#disposed = true;
    this.abort();
    this.#transport.dispose();
  }

  async #signature(
    request: SignRequest | MultiSignRequest,
    operation: SignOperation,
    data: string | null,
  ): Promise<SignResult> {
    const result = await this.#run(
      {
        kind: "sign",
        operation,
        data,
        algorithm: request.algorithm,
        format: request.format,
        extraParams: serializeExtraParams(request.extraParams),
      },
      request,
      true,
    );
    if (result.type !== "signature") throw unexpected();
    return {
      signature: result.signature,
      certificate: result.certificate,
      extraData: result.extraData,
    };
  }

  async #batch(
    request: BatchSignRequest | XmlBatchSignRequest,
    data: string,
    json: boolean,
  ): Promise<BatchSignResult> {
    const result = await this.#run(
      {
        kind: "batch",
        json,
        data,
        preSignerUrl: request.preSignerUrl ?? null,
        postSignerUrl: request.postSignerUrl ?? null,
        extraParams: serializeExtraParams(request.extraParams),
        local: request.local ?? false,
      },
      request,
      true,
    );
    if (result.type !== "batch") throw unexpected();
    return { result: result.result, certificate: result.certificate };
  }

  async #load(request: LoadRequest, multiple: boolean): Promise<readonly LoadedFile[]> {
    const result = await this.#run(
      {
        kind: "load",
        multiple,
        title: request.title ?? null,
        extensions: request.extensions ?? null,
        description: request.description ?? null,
        filePath: request.filePath ?? null,
      },
      request,
      false,
    );
    if (result.type !== "files") throw unexpected();
    return result.files;
  }

  async #run(
    operation: WireOperation,
    options: OperationOptions,
    consumesSticky: boolean,
  ): Promise<NativeResult> {
    if (this.#disposed)
      throw new AutoFirmaError(EXCEPTION.ILLEGAL_STATE, "El cliente de Autofirma se ha liberado");
    if (this.#active)
      throw new AutoFirmaError(
        EXCEPTION.ILLEGAL_STATE,
        "Ya hay una operacion de Autofirma en curso",
      );
    const controller = new AbortController();
    this.#active = controller;
    this.#lastError = null;
    // Se enlaza la senal externa a mano (AbortSignal.any no existe en Safari < 17.4).
    const external = options.signal;
    const forward = (): void => controller.abort(external?.reason);
    if (external?.aborted) forward();
    else external?.addEventListener("abort", forward, { once: true });
    const signal = controller.signal;
    const settings: OperationSettings = { ...this.#settings, resetSticky: this.#resetSticky };
    if (consumesSticky) this.#resetSticky = false;
    try {
      if (this.#gate) await abortable(this.#gate, signal);
      for (;;) {
        try {
          return await this.#transport.execute(operation, {
            settings,
            signal,
            env: this.#env,
            dialogs: this.#dialogs,
            services: this.services,
          });
        } catch (error) {
          const failure = signal.aborted ? abortError(signal.reason) : toAutoFirmaError(error);
          const choice =
            failure.dialog && !signal.aborted
              ? this.#dialogs?.showError(failure.dialog, this.services)
              : null;
          if (choice && (await abortable(choice, signal))) continue;
          throw failure;
        }
      }
    } catch (error) {
      if (signal.aborted) this.#dialogs?.close();
      this.#lastError = signal.aborted ? abortError(signal.reason) : toAutoFirmaError(error);
      throw this.#lastError;
    } finally {
      external?.removeEventListener("abort", forward);
      this.#active = null;
    }
  }
}
