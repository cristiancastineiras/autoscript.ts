import type { KeyStore } from "../core/constants.js";
import type { BatchResult } from "../core/types.js";
import type { SupportDialogApi } from "../ui/dialog.js";

/** Callback de error: tipo (excepcion Java), mensaje y codigo `ASxxxxxx` (vacio si no hay). */
export type LegacyErrorCallback = (type: string, message: string, code: string) => void;
/** Callback de exito de firma: firma, certificado y datos adicionales (JSON en texto). */
export type LegacySignCallback = (
  signatureB64: string,
  certificateB64: string | null,
  extraData: string | null,
) => void;
/** Callback de exito de lote: resultado JSON (o texto en lotes XML) y certificado. */
export type LegacyBatchCallback = (
  result: BatchResult | string,
  certificateB64: string | null,
) => void;

/** Objeto global `AutoScript` (y `MiniApplet`) con la interfaz del script original. */
export interface LegacyAutoScript {
  readonly VERSION: string;
  readonly CHECKTIME_NO: "CT_NO";
  readonly CHECKTIME_RECOMMENDED: "CT_RECOMMENDED";
  readonly CHECKTIME_OBLIGATORY: "CT_OBLIGATORY";
  readonly KEYSTORE_WINDOWS: "WINDOWS";
  readonly KEYSTORE_APPLE: "APPLE";
  readonly KEYSTORE_PKCS12: "PKCS12";
  readonly KEYSTORE_PKCS11: "PKCS11";
  readonly KEYSTORE_MOZILLA: "MOZ_UNI";
  readonly KEYSTORE_SHARED_NSS: "SHARED_NSS";
  readonly KEYSTORE_JAVA: "JAVA";
  readonly KEYSTORE_JCEKS: "JCEKS";
  readonly KEYSTORE_JAVACE: "JAVACE";
  readonly KEYSTORE_DNIE: "DNIEJAVA";
  /** Espera entre intentos de conexion (modificable, como en el original). */
  AUTOFIRMA_LAUNCHING_TIME: number;
  /** Intentos de conexion (modificable, como en el original). */
  AUTOFIRMA_CONNECTION_RETRIES: number;
  /** @deprecated Sin uso; se conserva por compatibilidad con el MiniApplet. */
  readonly JAVA_ARGUMENTS: null;
  /** @deprecated Sin uso; se conserva por compatibilidad con el MiniApplet. */
  readonly SYSTEM_PROPERTIES: null;

  cargarAppAfirma(clientAddress?: string | null, keystore?: KeyStore | string | null): void;
  /** @deprecated Alias de `cargarAppAfirma`. */
  cargarMiniApplet(clientAddress?: string | null, keystore?: KeyStore | string | null): void;
  sign(
    dataB64: string | null,
    algorithm: string,
    format: string,
    params: string | null,
    successCallback?: LegacySignCallback | null,
    errorCallback?: LegacyErrorCallback | null,
  ): void;
  /** Cofirma. `dataB64` se ignora: Autofirma no admite cofirmar aportando los datos. */
  coSign(
    signB64: string | null,
    dataB64: string | null,
    algorithm: string,
    format: string,
    params: string | null,
    successCallback?: LegacySignCallback | null,
    errorCallback?: LegacyErrorCallback | null,
  ): void;
  cosign(
    signB64: string | null,
    algorithm: string,
    format: string,
    params: string | null,
    successCallback?: LegacySignCallback | null,
    errorCallback?: LegacyErrorCallback | null,
  ): void;
  counterSign(
    signB64: string | null,
    algorithm: string,
    format: string,
    params: string | null,
    successCallback?: LegacySignCallback | null,
    errorCallback?: LegacyErrorCallback | null,
  ): void;
  createBatch(
    algorithm: string,
    format: string,
    suboperation?: string | null,
    extraparams?: string | null,
  ): void;
  addDocumentToBatch(
    id: string,
    datareference: string,
    format?: string | null,
    suboperation?: string | null,
    extraparams?: string | null,
  ): void;
  setLocalBatchProcess(isLocalBatchProcess: boolean): void;
  signBatchProcess(
    stopOnError: boolean,
    batchPreSignerUrl: string | null,
    batchPostSignerUrl: string | null,
    certFilters: string | null,
    successCallback?: LegacyBatchCallback | null,
    errorCallback?: LegacyErrorCallback | null,
  ): void;
  /** Firma de lote XML (mecanismo heredado). */
  signBatch(
    batchB64: string,
    batchPreSignerUrl: string | null,
    batchPostSignerUrl: string | null,
    params: string | null,
    successCallback?: LegacyBatchCallback | null,
    errorCallback?: LegacyErrorCallback | null,
  ): void;
  selectCertificate(
    params: string | null,
    successCallback?: ((certificateB64: string) => void) | null,
    errorCallback?: LegacyErrorCallback | null,
  ): void;
  signAndSaveToFile(
    operationId: string,
    dataB64: string | null,
    algorithm: string,
    format: string,
    params: string | null,
    outputFileName: string | null,
    successCallback?: LegacySignCallback | null,
    errorCallback?: LegacyErrorCallback | null,
  ): void;
  /** No operativo: devuelve el error AS500010. */
  getCurrentLog(
    successCallback?: ((log: string) => void) | null,
    errorCallback?: LegacyErrorCallback | null,
  ): void;
  saveDataToFile(
    dataB64: string,
    title: string | null,
    fileName: string | null,
    extension: string | null,
    description: string | null,
    successCallback?: ((status?: string) => void) | null,
    errorCallback?: LegacyErrorCallback | null,
  ): void;
  getFileNameContentBase64(
    title: string | null,
    extensions: string | null,
    description: string | null,
    filePath: string | null,
    successCallback?: ((fileName: string, dataB64: string) => void) | null,
    errorCallback?: LegacyErrorCallback | null,
  ): void;
  getMultiFileNameContentBase64(
    title: string | null,
    extensions: string | null,
    description: string | null,
    filePath: string | null,
    successCallback?: ((fileNames: string[], datasB64: string[]) => void) | null,
    errorCallback?: LegacyErrorCallback | null,
  ): void;
  checkTime(checkType?: string | null, maxMillis?: number | null, checkURL?: string | null): void;
  setKeyStore(ksType: KeyStore | string | null): void;
  /** Fuerza el servidor intermedio ("WebService"), no WebSocket. */
  setForceWSMode(force: boolean): void;
  setServlets(storageServlet: string, retrieverServlet: string): void;
  setPortRange(minRangeLimit?: number | null, maxRangeLimit?: number | null): void;
  setStickySignatory(sticky: boolean): void;
  setLocale(locale: string | null): void;
  setMinimumClientVersion(version: string | null): void;
  setAppName(name: string | null): void;
  setServiceTimeout(timeoutMs: number | null): void;
  enableProgressDialog(showDlg: boolean): void;
  getErrorMessage(): string;
  getErrorType(): string;
  getErrorCode(): string;
  getErrorCodeNumber(): string | null;
  getBase64FromText(plainText: string | null): string | null;
  getTextFromBase64(dataB64: string | null): string | null;
  downloadRemoteData(
    url: string | URL,
    successCallback?: ((dataB64: string) => void) | null,
    errorCallback?: ((error: Error) => void) | null,
  ): void;
  isAndroid(): boolean;
  isIOS(): boolean;
  /** Devuelve siempre "Cliente JavaScript". */
  echo(): string;
  /** @deprecated Sin efecto. */
  setForceAFirma(): void;
  /** @deprecated Sin efecto. */
  setJnlpService(): void;
  /** @deprecated Siempre `false`. */
  isJNLP(): false;
  /** @deprecated Siempre `true`. */
  needNativeAppInstalled(): true;
}

/** Objeto global `Base64` del script original. */
export interface LegacyBase64 {
  /** Codifica texto (UTF-8) en Base64. */
  encode(input: string, urlSafe?: boolean): string;
  /** Decodifica Base64 a texto (UTF-8). */
  decode(input: string, urlSafe?: boolean): string;
  encodeArrayBuffer(input: ArrayBuffer | ArrayBufferView, urlSafe?: boolean): string;
  encodeByteArray(input: ArrayLike<number>, urlSafe?: boolean): string;
}

/** Globals que registra la distribucion `autoscript.js`. */
export interface LegacyGlobals {
  readonly AutoScript: LegacyAutoScript;
  readonly MiniApplet: LegacyAutoScript;
  readonly SupportDialog: SupportDialogApi;
  readonly Base64: LegacyBase64;
}
