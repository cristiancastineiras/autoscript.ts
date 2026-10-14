export type SignOperation = "sign" | "cosign" | "countersign";
export type Properties = string | Readonly<Record<string, string | number | boolean>>;
export type KeyStore =
  | "WINDOWS"
  | "APPLE"
  | "PKCS12"
  | "PKCS11"
  | "MOZ_UNI"
  | "SHARED_NSS"
  | "JAVA"
  | "JCEKS"
  | "JAVACE"
  | "DNIEJAVA";

export interface SignRequest {
  readonly operation: SignOperation;
  readonly data: string | null;
  readonly algorithm: string;
  readonly format: string;
  readonly properties?: Properties;
}

export interface BatchDocument {
  readonly id: string;
  readonly datareference: string;
  readonly format?: string;
  readonly suboperation?: SignOperation;
  readonly extraparams?: string;
}

export interface BatchDefinition {
  readonly algorithm: string;
  readonly format: string;
  readonly suboperation: SignOperation;
  readonly extraparams?: string;
  readonly singlesigns: readonly BatchDocument[];
}

export interface BatchRequest {
  readonly operation: "batch";
  readonly data: string;
  readonly json: boolean;
  readonly local?: boolean;
  readonly preSignerUrl?: string;
  readonly postSignerUrl?: string;
  readonly properties?: Properties;
}

export interface SaveRequest {
  readonly operation: "save";
  readonly data: string;
  readonly title?: string;
  readonly filename?: string;
  readonly extensions?: string;
  readonly description?: string;
}

export interface LoadRequest {
  readonly operation: "load";
  readonly title?: string;
  readonly extensions?: string;
  readonly description?: string;
  readonly filePath?: string;
  readonly multiple?: boolean;
}

export interface SelectCertificateRequest {
  readonly operation: "selectcert";
  readonly properties?: Properties;
}

export interface SignAndSaveRequest extends Omit<SignRequest, "operation"> {
  readonly operation: "signandsave";
  readonly signOperation: SignOperation;
  readonly filename: string;
}

export type OperationRequest =
  | SignRequest
  | SignAndSaveRequest
  | BatchRequest
  | SaveRequest
  | LoadRequest
  | SelectCertificateRequest;
export interface SignatureResult {
  readonly signature: string;
  readonly certificate: string | null;
  readonly extraInfo: string | null;
}
export interface CertificateResult {
  readonly certificate: string;
}
export interface FileResult {
  readonly name: string;
  readonly data: string;
}
export interface FilesResult {
  readonly files: readonly FileResult[];
}
export interface BatchResult {
  readonly result: unknown;
  readonly certificate: string | null;
}
export interface SavedResult {
  readonly saved: true;
}
export type OperationResult =
  | SignatureResult
  | CertificateResult
  | FilesResult
  | BatchResult
  | SavedResult;
export interface ExecuteOptions {
  readonly signal?: AbortSignal;
}

export interface Transport {
  readonly kind: "websocket" | "https" | "intermediate";
  execute(request: OperationRequest, context: OperationContext): Promise<string>;
  dispose(): void;
}

export interface OperationContext {
  readonly signal: AbortSignal;
  readonly config: ClientConfig;
  readonly resetSticky: boolean;
}

export interface ClientConfig {
  readonly timeoutMs: number;
  readonly maxResponseLength: number;
  readonly keyStore: KeyStore | null;
  readonly sticky: boolean;
  readonly appName: string | null;
  readonly minimumVersion: string | null;
  readonly serviceTimeoutMs: number;
  readonly progressDialog: boolean;
}
