export { defineConfig } from "./config.js";
export type { AutoscriptConfig } from "./config.js";
export { defineClientConfig } from "./config.js";
export { AutoFirmaClient } from "./client.js";
export { Batch } from "./batch.js";
export { AutoFirmaError } from "./errors.js";
export type { ErrorKind } from "./errors.js";
export type {
  BatchDefinition,
  BatchDocument,
  BatchRequest,
  BatchResult,
  CertificateResult,
  ClientConfig,
  ExecuteOptions,
  FileResult,
  FilesResult,
  KeyStore,
  LoadRequest,
  OperationContext,
  OperationRequest,
  OperationResult,
  Properties,
  SavedResult,
  SelectCertificateRequest,
  SignAndSaveRequest,
  SignatureResult,
  SignOperation,
  SignRequest,
  Transport,
} from "./types.js";
