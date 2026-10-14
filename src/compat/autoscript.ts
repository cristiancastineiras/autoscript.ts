import { downloadRemoteData } from "../browser/download.js";
import {
  createEnvironment,
  hostPlatform,
  isMobile,
  type Environment,
  type HostWindow,
} from "../browser/environment.js";
import { createTransport, selectTransport } from "../browser/factory.js";
import { checkTime } from "../browser/time.js";
import { Batch } from "../core/batch.js";
import { AutoFirmaClient } from "../core/client.js";
import {
  AUTOFIRMA_CONNECTION_RETRIES,
  AUTOFIRMA_LAUNCHING_TIME,
  CHECKTIME,
  KEYSTORE,
  VERSION,
} from "../core/constants.js";
import { AutoFirmaError, ERRORS, EXCEPTION, toAutoFirmaError } from "../core/errors.js";
import type { ClientSettings, ServiceStatus, Servlets, SignOperation } from "../core/types.js";
import { encodeBase64 } from "../encoding/base64.js";
import { base64ToText, textToBase64 } from "../encoding/utf8.js";
import { normalizePortRange } from "../protocol/session.js";
import { checkServlets, resolveServlets } from "../transports/servlets.js";
import { SupportDialog } from "../ui/dialog.js";
import type {
  LegacyAutoScript,
  LegacyBase64,
  LegacyErrorCallback,
  LegacyGlobals,
} from "./types.js";

/** Ventana desde la que se ejecuta la fachada. */
export type LegacyHostWindow = HostWindow & { readonly alert?: (message: string) => void };

/** Opciones de {@link createAutoScript}. */
export interface AutoScriptOptions {
  /** Ventana del navegador. Por defecto, `globalThis`. */
  readonly window?: LegacyHostWindow;
  /** Dependencias del navegador (para pruebas). */
  readonly environment?: Environment;
  /** Dialogo de soporte. Por defecto se crea uno con el aspecto original. */
  readonly dialog?: SupportDialog;
}

type Callback<A extends unknown[]> = ((...args: A) => void) | null | undefined;

/** Texto plano de un mensaje HTML de los idiomas (para `alert`). */
function plainText(document: Document | undefined, html: string): string {
  if (!document) return html.replace(/<[^>]*>/g, "");
  const template = document.createElement("template");
  template.innerHTML = html;
  return template.content.textContent ?? html;
}

/** Objeto `Base64` del script original, con UTF-8 correcto y sin alterar los saltos de linea. */
export function createLegacyBase64(): LegacyBase64 {
  return {
    encode: (input, urlSafe) => textToBase64(String(input), { urlSafe: urlSafe === true }),
    decode: (input, _urlSafe) => base64ToText(String(input)),
    encodeArrayBuffer: (input, urlSafe) =>
      encodeBase64(
        ArrayBuffer.isView(input)
          ? new Uint8Array(input.buffer, input.byteOffset, input.byteLength)
          : new Uint8Array(input),
        { urlSafe: urlSafe === true },
      ),
    encodeByteArray: (input, urlSafe) =>
      encodeBase64(Uint8Array.from(input), { urlSafe: urlSafe === true }),
  };
}

/**
 * Crea los objetos `AutoScript`, `MiniApplet`, `SupportDialog` y `Base64` con la interfaz y el
 * comportamiento del autoscript.js original, sin registrar nada en la ventana.
 */
export function createAutoScript(options: AutoScriptOptions = {}): LegacyGlobals {
  const host: LegacyHostWindow = options.window ?? (globalThis as LegacyHostWindow);
  const env = options.environment ?? createEnvironment(host);
  const dialog =
    options.dialog ??
    new SupportDialog({
      ...(host.document ? { document: host.document } : {}),
      platform: env.platform,
    });

  let client: AutoFirmaClient | null = null;
  let settings: Partial<ClientSettings> = {};
  let storageServlet: string | null = null;
  let retrieverServlet: string | null = null;
  let forceWSMode = false;
  let localBatchProcess = false;
  let batch: Batch | null = null;
  let servicesChecked = false;
  let severeTimeDelay = false;
  let timeGate: Promise<void> | null = null;
  let lastError: AutoFirmaError | null = null;
  // Comun a todos los clientes que se creen, como las variables globales del original.
  const services: ServiceStatus = { checked: false, failing: false, compatible: true };

  const mobile = (): boolean => isMobile(hostPlatform(host));

  const configure = (changes: Partial<ClientSettings>): void => {
    settings = { ...settings, ...changes };
    client?.configure(changes);
  };

  const fail = (error: unknown, callback: Callback<Parameters<LegacyErrorCallback>>): void => {
    lastError = toAutoFirmaError(error);
    callback?.(lastError.type, lastError.message, lastError.code ?? "");
  };

  const requireClient = (): AutoFirmaClient => {
    if (client) return client;
    throw new Error("Autofirma no esta cargado. Llame antes a AutoScript.cargarAppAfirma().");
  };

  /** Ejecuta una operacion del cliente y traduce el resultado a los callbacks heredados. */
  const run = <T>(
    start: (client: AutoFirmaClient) => Promise<T>,
    success: (result: T) => void,
    error: Callback<Parameters<LegacyErrorCallback>>,
  ): void => {
    const current = requireClient();
    current.configure({
      launchingTime: api.AUTOFIRMA_LAUNCHING_TIME,
      connectionRetries: api.AUTOFIRMA_CONNECTION_RETRIES,
    });
    lastError = null;
    start(current).then(success, (cause: unknown) => fail(cause, error));
  };

  const servlets = (): Servlets | null =>
    storageServlet && retrieverServlet
      ? { storage: storageServlet, retriever: retrieverServlet }
      : null;

  /** Comprueba los servicios del servidor intermedio y avisa si fallan. */
  const checkServices = (target: Servlets, compatibility: boolean): void => {
    // Si ya hay un dialogo abierto, hay una operacion en marcha: no se molesta al usuario.
    if (dialog.isOpen()) return;
    servicesChecked = true;
    void checkServlets(env, target).then((ok) => {
      services.checked = true;
      services.failing = !ok;
      services.compatible = ok || !compatibility;
      if (!ok)
        void dialog.showError(
          compatibility ? "no-compatible-procedure" : "checking-service",
          services,
        );
    });
  };

  const signature =
    (operation: SignOperation) =>
    (
      data: string | null,
      algorithm: string,
      format: string,
      params: string | null,
      success?: Callback<[string, string | null, string | null]>,
      error?: Callback<Parameters<LegacyErrorCallback>>,
    ): void =>
      run(
        (current) =>
          operation === "sign"
            ? current.sign({ data: data || null, algorithm, format, extraParams: params })
            : operation === "cosign"
              ? current.coSign({ signature: data || null, algorithm, format, extraParams: params })
              : current.counterSign({
                  signature: data || null,
                  algorithm,
                  format,
                  extraParams: params,
                }),
        (result) => success?.(result.signature, result.certificate, result.extraData),
        error,
      );

  const cosign = signature("cosign");

  const api: LegacyAutoScript = {
    VERSION,
    CHECKTIME_NO: CHECKTIME.NO,
    CHECKTIME_RECOMMENDED: CHECKTIME.RECOMMENDED,
    CHECKTIME_OBLIGATORY: CHECKTIME.OBLIGATORY,
    KEYSTORE_WINDOWS: KEYSTORE.WINDOWS,
    KEYSTORE_APPLE: KEYSTORE.APPLE,
    KEYSTORE_PKCS12: KEYSTORE.PKCS12,
    KEYSTORE_PKCS11: KEYSTORE.PKCS11,
    KEYSTORE_MOZILLA: KEYSTORE.MOZILLA,
    KEYSTORE_SHARED_NSS: KEYSTORE.SHARED_NSS,
    KEYSTORE_JAVA: KEYSTORE.JAVA,
    KEYSTORE_JCEKS: KEYSTORE.JCEKS,
    KEYSTORE_JAVACE: KEYSTORE.JAVACE,
    KEYSTORE_DNIE: KEYSTORE.DNIE,
    AUTOFIRMA_LAUNCHING_TIME,
    AUTOFIRMA_CONNECTION_RETRIES,
    JAVA_ARGUMENTS: null,
    SYSTEM_PROPERTIES: null,

    cargarAppAfirma(clientAddress, keystore) {
      if (dialog.enabled) dialog.installStyles();
      if (severeTimeDelay) {
        console.warn(
          "Se ha detectado un desfase grave entre la hora del sistema y la del servidor. Se cancela la carga del cliente de firma",
        );
        return;
      }
      const kind = selectTransport(env, forceWSMode);
      const intermediate = kind === "intermediate";
      if (intermediate && !servlets())
        settings = { ...settings, servlets: resolveServlets(null, env.location, clientAddress) };
      client?.dispose();
      client = new AutoFirmaClient({
        ...settings,
        keyStore: keystore || (env.platform.firefox ? KEYSTORE.MOZILLA : null),
        transport: createTransport(kind),
        environment: env,
        dialogs: dialog,
        services,
      });
      settings = { ...settings, keyStore: client.settings.keyStore };
      client.waitFor(timeGate);
      if (intermediate && !servicesChecked) {
        const configured = servlets();
        checkServices(
          configured ?? resolveServlets(null, env.location, clientAddress),
          configured === null && mobile(),
        );
      }
    },
    cargarMiniApplet(clientAddress, keystore) {
      api.cargarAppAfirma(clientAddress, keystore);
    },

    sign: signature("sign"),
    coSign(signB64, _dataB64, algorithm, format, params, success, error) {
      cosign(signB64, algorithm, format, params, success, error);
    },
    cosign,
    counterSign: signature("countersign"),

    createBatch(algorithm, format, suboperation, extraparams) {
      batch = new Batch({
        algorithm,
        format,
        operation: (suboperation || null) as SignOperation | null,
        extraParams: extraparams || null,
      });
    },
    addDocumentToBatch(id, datareference, format, suboperation, extraparams) {
      if (!id || datareference === null || datareference === undefined)
        throw new Error("No se ha indicado el id o datareference de la firma");
      if (!batch)
        throw new Error(
          "No hay ningun lote creado. Es necesario crear uno antes de agregar firmas",
        );
      batch.add({
        id,
        reference: datareference,
        format: format || null,
        operation: (suboperation || null) as SignOperation | null,
        extraParams: extraparams || null,
      });
    },
    setLocalBatchProcess(isLocalBatchProcess) {
      localBatchProcess = Boolean(isLocalBatchProcess);
    },
    signBatchProcess(stopOnError, preSignerUrl, postSignerUrl, certFilters, success, error) {
      if (!batch)
        throw new Error("No hay ningun lote creado. Es necesario crear uno antes de firmar.");
      const encoded = batch.encode(Boolean(stopOnError));
      batch = null;
      run(
        (current) =>
          current.signBatch({
            batch: encoded,
            preSignerUrl,
            postSignerUrl,
            extraParams: certFilters,
            local: localBatchProcess,
          }),
        (result) => success?.(result.result, result.certificate),
        error,
      );
    },
    signBatch(batchB64, preSignerUrl, postSignerUrl, params, success, error) {
      run(
        (current) =>
          current.signBatchXml({
            batch: batchB64,
            preSignerUrl,
            postSignerUrl,
            extraParams: params,
            local: localBatchProcess,
          }),
        (result) => success?.(result.result, result.certificate),
        error,
      );
    },
    selectCertificate(params, success, error) {
      run(
        (current) => current.selectCertificate({ extraParams: params }),
        (cert) => success?.(cert),
        error,
      );
    },
    signAndSaveToFile(operationId, dataB64, algorithm, format, params, fileName, success, error) {
      run(
        (current) =>
          current.signAndSave({
            operation: operationId as SignOperation,
            data: dataB64 || null,
            algorithm,
            format,
            extraParams: params,
            fileName,
          }),
        (result) => success?.(result.signature, result.certificate, result.extraData),
        error,
      );
    },
    getCurrentLog(_success, error) {
      error?.(
        EXCEPTION.UNSUPPORTED,
        ERRORS.NON_OPERATIVE_JS_METHOD.message,
        ERRORS.NON_OPERATIVE_JS_METHOD.code,
      );
    },

    saveDataToFile(dataB64, title, fileName, extension, description, success, error) {
      run(
        (current) =>
          current.saveDataToFile({ data: dataB64, title, fileName, extension, description }),
        (status) => success?.(status),
        error,
      );
    },
    getFileNameContentBase64(title, extensions, description, filePath, success, error) {
      run(
        (current) => current.loadFile({ title, extensions, description, filePath }),
        (file) => success?.(file.name, file.data),
        error,
      );
    },
    getMultiFileNameContentBase64(title, extensions, description, filePath, success, error) {
      run(
        (current) => current.loadFiles({ title, extensions, description, filePath }),
        (files) =>
          success?.(
            files.map((file) => file.name),
            files.map((file) => file.data),
          ),
        error,
      );
    },

    checkTime(checkType, maxMillis, checkURL) {
      if (!checkType || checkType === CHECKTIME.NO || (!!maxMillis && maxMillis <= 0)) return;
      const obligatory = checkType === CHECKTIME.OBLIGATORY;
      timeGate = checkTime({
        url: checkURL ?? null,
        maxSkew: maxMillis ?? null,
        environment: env,
      }).then((result) => {
        if (!result?.exceeded) return;
        const messages = dialog.messages;
        const text = plainText(
          host.document,
          [
            obligatory ? messages.checktime_err : messages.checktime_warn,
            `${messages.checktime_local_time}: ${result.clientTime.toLocaleString()}`,
            `${messages.checktime_server_time}: ${result.serverTime.toLocaleString()}`,
          ].join("\n"),
        );
        host.alert?.(text);
        if (obligatory) {
          severeTimeDelay = true;
          throw new AutoFirmaError(EXCEPTION.ILLEGAL_STATE, text);
        }
      });
      timeGate.catch(() => undefined);
      client?.waitFor(timeGate);
    },
    setKeyStore(ksType) {
      configure({ keyStore: ksType ?? null });
      client?.resetStickySignatory();
    },
    setForceWSMode(force) {
      forceWSMode = Boolean(force);
    },
    setServlets(storage, retriever) {
      dialog.close();
      if (forceWSMode || mobile()) checkServices({ storage, retriever }, false);
      storageServlet = storage;
      retrieverServlet = retriever;
      configure({ servlets: servlets() });
    },
    setPortRange(minRangeLimit, maxRangeLimit) {
      configure({ portRange: normalizePortRange(minRangeLimit, maxRangeLimit) });
    },
    setStickySignatory(sticky) {
      configure({ stickySignatory: Boolean(sticky) });
    },
    setLocale(locale) {
      dialog.setLocale(locale);
    },
    setMinimumClientVersion(version) {
      configure({ minimumClientVersion: version || null });
    },
    setAppName(name) {
      configure({ appName: name || null });
    },
    setServiceTimeout(timeoutMs) {
      configure({ serviceTimeout: timeoutMs ?? null });
    },
    enableProgressDialog(showDlg) {
      configure({ progressDialog: Boolean(showDlg) });
    },

    getErrorMessage: () => lastError?.message ?? "",
    getErrorType: () => lastError?.type ?? "",
    getErrorCode: () => lastError?.code ?? "",
    getErrorCodeNumber: () => lastError?.codeNumber ?? null,

    getBase64FromText: (text) =>
      text === null || text === undefined ? null : textToBase64(String(text)),
    getTextFromBase64: (dataB64) =>
      dataB64 === null || dataB64 === undefined ? null : base64ToText(String(dataB64)),
    downloadRemoteData(url, success, error) {
      downloadRemoteData(url, { environment: env }).then(
        (data) => success?.(data),
        (cause: unknown) => error?.(toAutoFirmaError(cause)),
      );
    },

    isAndroid: () => hostPlatform(host).android,
    isIOS: () => hostPlatform(host).ios,
    echo: () => "Cliente JavaScript",
    setForceAFirma() {},
    setJnlpService() {},
    isJNLP: () => false,
    needNativeAppInstalled: () => true,
  };

  return {
    AutoScript: api,
    MiniApplet: api,
    SupportDialog: dialog.api,
    Base64: createLegacyBase64(),
  };
}

/** Nombres de los globals que registra {@link installAutoScript}. */
export const LEGACY_GLOBAL_NAMES = ["AutoScript", "MiniApplet", "SupportDialog", "Base64"] as const;

/**
 * Registra `AutoScript`, `MiniApplet`, `SupportDialog` y `Base64` en la ventana, como hacia el
 * script original al cargarse.
 */
export function installAutoScript(options: AutoScriptOptions = {}): LegacyGlobals {
  const target = (options.window ?? globalThis) as Record<string, unknown>;
  const globals = createAutoScript(options);
  for (const name of LEGACY_GLOBAL_NAMES)
    Object.defineProperty(target, name, {
      value: globals[name],
      writable: true,
      configurable: true,
      enumerable: true,
    });
  return globals;
}
