import type { BatchResult, ClientSettings, LoadedFile, SignOperation } from "../core/types.js";

/** Operacion normalizada que se transmite a Autofirma. */
export type WireOperation =
  | { readonly kind: "selectcert"; readonly extraParams: string | null }
  | {
      readonly kind: "sign";
      readonly operation: SignOperation;
      readonly data: string | null;
      readonly algorithm: string;
      readonly format: string;
      readonly extraParams: string | null;
    }
  | {
      readonly kind: "signandsave";
      readonly operation: SignOperation;
      readonly data: string | null;
      readonly algorithm: string;
      readonly format: string;
      readonly extraParams: string | null;
      readonly fileName: string | null;
    }
  | {
      readonly kind: "batch";
      /** Lote JSON (`true`) o XML heredado (`false`). */
      readonly json: boolean;
      readonly data: string;
      readonly preSignerUrl: string | null;
      readonly postSignerUrl: string | null;
      readonly extraParams: string | null;
      readonly local: boolean;
    }
  | {
      readonly kind: "load";
      readonly multiple: boolean;
      readonly title: string | null;
      readonly extensions: string | null;
      readonly description: string | null;
      readonly filePath: string | null;
    }
  | {
      readonly kind: "save";
      readonly data: string;
      readonly title: string | null;
      readonly fileName: string | null;
      readonly extension: string | null;
      readonly description: string | null;
    };

/** Configuracion congelada al inicio de cada operacion. */
export interface OperationSettings extends ClientSettings {
  /** Pide a Autofirma que olvide el certificado fijado. */
  readonly resetSticky: boolean;
}

/** Resultado de una operacion ya interpretado por el transporte. */
export type NativeResult =
  | {
      readonly type: "signature";
      readonly signature: string;
      readonly certificate: string | null;
      readonly extraData: string | null;
    }
  | { readonly type: "certificate"; readonly certificate: string }
  | {
      readonly type: "batch";
      readonly result: BatchResult | string;
      readonly certificate: string | null;
    }
  | { readonly type: "files"; readonly files: readonly LoadedFile[] }
  | { readonly type: "saved"; readonly status: string };

/** Indica si los datos son una URL http(s) en lugar de Base64. */
export function isUrl(data: string): boolean {
  return /^https?:\/\/./i.test(data);
}

/** Prepara datos Base64 para el protocolo: alfabeto URL-safe y sin saltos de linea. */
export function wireData(data: string | null): string | null {
  if (!data) return null;
  if (isUrl(data)) return data;
  return data
    .replace(/[\r\n]/g, "")
    .replaceAll("+", "-")
    .replaceAll("/", "_");
}
