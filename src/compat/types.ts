import type { LEGACY_VALUES } from "../core/constants.js";
import type { KeyStore, SignOperation } from "../core/types.js";
import type { CreateClientOptions } from "../browser/factory.js";
import type { AutoFirmaClient } from "../core/client.js";
import type { DialogHelp } from "../ui/locales.js";

export interface LegacySupport {
  showLoading(): void;
  showError(message: string, help?: DialogHelp): void;
  showWarning?(message: string, help?: DialogHelp): void;
  close(): void;
  setLocale(locale: string): void;
}

export type LegacyErrorCallback = (type: string, message: string, code: string | null) => void;
export type LegacySignCallback = (
  signature: string,
  certificate: string | null,
  extraInfo: string | null,
) => void;
export type LegacyBatchCallback = (result: unknown, certificate: string | null) => void;
export type LegacyFileCallback = (name: string, data: string) => void;
export type LegacyMultiFileCallback = (names: string[], data: string[]) => void;
export type LegacyValues = {
  -readonly [Key in keyof typeof LEGACY_VALUES]: (typeof LEGACY_VALUES)[Key];
};
export interface LegacyOptions {
  readonly client?: AutoFirmaClient;
  readonly connection?: CreateClientOptions;
  readonly createClient?: (options: CreateClientOptions) => AutoFirmaClient;
  readonly support?: LegacySupport;
}

export interface LegacyAutoScript extends LegacyValues {
  cargarAppAfirma(clientAddress?: string, keyStore?: KeyStore): void;
  cargarMiniApplet(clientAddress?: string, keyStore?: KeyStore): void;
  sign(
    data: string | null,
    algorithm: string,
    format: string,
    params: string | null,
    success?: LegacySignCallback,
    error?: LegacyErrorCallback,
  ): void;
  coSign(
    signature: string,
    data: string | null,
    algorithm: string,
    format: string,
    params: string | null,
    success?: LegacySignCallback,
    error?: LegacyErrorCallback,
  ): void;
  cosign(
    signature: string,
    algorithm: string,
    format: string,
    params: string | null,
    success?: LegacySignCallback,
    error?: LegacyErrorCallback,
  ): void;
  counterSign(
    signature: string,
    algorithm: string,
    format: string,
    params: string | null,
    success?: LegacySignCallback,
    error?: LegacyErrorCallback,
  ): void;
  createBatch(
    algorithm: string,
    format: string,
    suboperation: SignOperation,
    extraParams?: string,
  ): void;
  addDocumentToBatch(
    id: string,
    reference: string,
    format?: string,
    suboperation?: SignOperation,
    extraParams?: string,
  ): void;
  setLocalBatchProcess(local: boolean): void;
  signBatchProcess(
    stopOnError: boolean,
    preUrl: string | null,
    postUrl: string | null,
    filters: string | null,
    success?: LegacyBatchCallback,
    error?: LegacyErrorCallback,
  ): void;
  signBatch(
    data: string,
    preUrl: string | null,
    postUrl: string | null,
    params: string | null,
    success?: LegacyBatchCallback,
    error?: LegacyErrorCallback,
  ): void;
  selectCertificate(
    params: string | null,
    success?: (certificate: string) => void,
    error?: LegacyErrorCallback,
  ): void;
  signAndSaveToFile(
    operation: SignOperation,
    data: string | null,
    algorithm: string,
    format: string,
    params: string | null,
    filename: string,
    success?: LegacySignCallback,
    error?: LegacyErrorCallback,
  ): void;
  getCurrentLog(success?: (log: string) => void, error?: LegacyErrorCallback): void;
  saveDataToFile(
    data: string,
    title: string,
    filename: string,
    extension: string,
    description: string,
    success?: (result?: string) => void,
    error?: LegacyErrorCallback,
  ): void;
  getFileNameContentBase64(
    title: string,
    extensions: string,
    description: string,
    filePath: string,
    success?: LegacyFileCallback,
    error?: LegacyErrorCallback,
  ): void;
  getMultiFileNameContentBase64(
    title: string,
    extensions: string,
    description: string,
    filePath: string,
    success?: LegacyMultiFileCallback,
    error?: LegacyErrorCallback,
  ): void;
  checkTime(type: string, maxMillis?: number, url?: string): Promise<void>;
  setKeyStore(keyStore: KeyStore | null): void;
  setForceWSMode(force: boolean): void;
  setServlets(storage: string, retrieve: string): void;
  setPortRange(min: number, max?: number): void;
  setStickySignatory(sticky: boolean): void;
  setLocale(locale: string): void;
  setMinimumClientVersion(version: string): void;
  setAppName(name: string): void;
  setServiceTimeout(timeout: number): void;
  enableProgressDialog(show: boolean): void;
  getErrorMessage(): string | null;
  getErrorType(): string | null;
  getErrorCode(): string | null;
  getErrorCodeNumber(): string | null;
  getBase64FromText(text: string | null): string | null;
  getTextFromBase64(data: string | null): string | null;
  downloadRemoteData(
    url: string,
    success?: (data: string) => void,
    error?: LegacyErrorCallback,
  ): void;
  isAndroid(): boolean;
  isIOS(): boolean;
  echo(): string;
  setForceAFirma(): void;
  setJnlpService(): void;
  isJNLP(): false;
  needNativeAppInstalled(): true;
}
