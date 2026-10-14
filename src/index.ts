// SDK moderno de AutoScript: API de promesas, tipado y sin efectos al importarse.

export {
  AUTOFIRMA_CONNECTION_RETRIES,
  AUTOFIRMA_LAUNCHING_TIME,
  CHECKTIME,
  KEYSTORE,
  PROTOCOL_VERSION,
  VERSION,
  VERSION_CODE,
  type CheckTimeType,
  type KeyStore,
} from "./core/constants.js";
export {
  AutoFirmaError,
  ERRORS,
  EXCEPTION,
  type AutoFirmaErrorOptions,
  type ErrorDescriptor,
  type ErrorDialogKind,
} from "./core/errors.js";
export type {
  BatchResult,
  BatchSignOutcome,
  BatchSignResult,
  BatchSignState,
  ClientSettings,
  ExtraParams,
  LoadedFile,
  LoadRequest,
  MultiSignRequest,
  OperationDialogs,
  OperationOptions,
  PortRange,
  SaveRequest,
  SelectCertificateRequest,
  ServiceStatus,
  Servlets,
  SignAlgorithm,
  SignAndSaveRequest,
  SignFormat,
  SignOperation,
  SignRequest,
  SignResult,
  TransportKind,
} from "./core/types.js";
export {
  Batch,
  type BatchDocument,
  type BatchOptions,
  type BatchRequestJson,
} from "./core/batch.js";
export {
  AutoFirmaClient,
  DEFAULT_SETTINGS,
  type AutoFirmaClientOptions,
  type BatchSignRequest,
  type XmlBatchSignRequest,
} from "./core/client.js";
export {
  createAutoFirmaClient,
  createTransport,
  selectTransport,
  type CreateClientOptions,
} from "./browser/factory.js";
export {
  createEnvironment,
  detectPlatform,
  type Environment,
  type HostWindow,
  type PageLocation,
  type Platform,
  type WebSocketLike,
} from "./browser/environment.js";
export {
  checkTime,
  DEFAULT_MAX_TIME_SKEW,
  type CheckTimeOptions,
  type CheckTimeResult,
} from "./browser/time.js";
export { downloadRemoteData, type DownloadOptions } from "./browser/download.js";
export { WebSocketTransport } from "./transports/websocket.js";
export { HttpsTransport } from "./transports/https.js";
export { IntermediateTransport } from "./transports/intermediate.js";
export { checkServlets, resolveServlets } from "./transports/servlets.js";
export type { OperationContext, Transport } from "./transports/transport.js";
export type { NativeResult, OperationSettings, WireOperation } from "./protocol/operation.js";
export { serializeExtraParams } from "./protocol/requests.js";
export * from "./encoding/index.js";
