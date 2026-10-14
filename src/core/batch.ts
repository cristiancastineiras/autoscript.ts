import { textToBase64 } from "../encoding/utf8.js";
import { serializeExtraParams } from "../protocol/requests.js";
import type { ExtraParams, SignAlgorithm, SignFormat, SignOperation } from "./types.js";

/** Configuracion por defecto de las firmas de un lote. */
export interface BatchOptions {
  /** Algoritmo comun a todo el lote (no se puede cambiar por documento). */
  readonly algorithm: SignAlgorithm;
  readonly format: SignFormat;
  /** Operacion por defecto. Si se omite, `sign`. */
  readonly operation?: SignOperation | null;
  readonly extraParams?: ExtraParams | null;
}

/** Documento de un lote, con su configuracion particular opcional. */
export interface BatchDocument {
  /** Identificador unico dentro del lote; el resultado se relaciona por este id. */
  readonly id: string;
  /** Referencia a los datos para el gestor de documentos (o los datos, en lotes locales). */
  readonly reference: string;
  readonly format?: SignFormat | null;
  readonly operation?: SignOperation | null;
  readonly extraParams?: ExtraParams | null;
}

interface SingleSign {
  readonly id: string;
  readonly datareference: string;
  readonly format?: string;
  readonly suboperation?: string;
  readonly extraparams?: string;
}

/** Peticion JSON de lote tal como la recibe Autofirma. */
export interface BatchRequestJson {
  readonly algorithm: string;
  readonly format: string;
  readonly suboperation: string;
  readonly extraparams?: string;
  readonly singlesigns: readonly SingleSign[];
  readonly stoponerror: boolean;
}

function encodeExtra(extraParams: ExtraParams | null | undefined): string | undefined {
  const text = serializeExtraParams(extraParams);
  return text ? textToBase64(text) : undefined;
}

/**
 * Lote de firmas trifasicas (o locales). Los ids se validan en tiempo constante y el lote se
 * serializa al firmar, por lo que puede reutilizarse.
 */
export class Batch {
  readonly #options: BatchOptions;
  readonly #documents: Map<string, SingleSign> = new Map();

  constructor(options: BatchOptions) {
    if (!options.algorithm || !options.format)
      throw new TypeError("El lote necesita un algoritmo y un formato de firma.");
    this.#options = options;
  }

  /** Numero de documentos del lote. */
  get size(): number {
    return this.#documents.size;
  }

  /**
   * Agrega un documento al lote.
   * @throws {Error} Si falta el id o la referencia, o si el id ya existe.
   */
  add(document: BatchDocument): this {
    if (!document.id || document.reference === null || document.reference === undefined)
      throw new Error("No se ha indicado el id o datareference de la firma");
    if (this.#documents.has(document.id))
      throw new Error(`El id de la firma a agregar = "${document.id}" ya existe en el lote`);
    const extraparams = encodeExtra(document.extraParams);
    this.#documents.set(document.id, {
      id: document.id,
      datareference: document.reference,
      ...(document.format ? { format: document.format } : {}),
      ...(document.operation ? { suboperation: document.operation } : {}),
      ...(extraparams ? { extraparams } : {}),
    });
    return this;
  }

  /** Estructura JSON del lote. */
  toJSON(stopOnError = false): BatchRequestJson {
    const extraparams = encodeExtra(this.#options.extraParams);
    return {
      algorithm: this.#options.algorithm,
      format: this.#options.format,
      suboperation: this.#options.operation ?? "sign",
      ...(extraparams ? { extraparams } : {}),
      singlesigns: [...this.#documents.values()],
      stoponerror: stopOnError,
    };
  }

  /** Lote codificado para Autofirma (JSON en Base64 URL-safe). */
  encode(stopOnError = false): string {
    return textToBase64(JSON.stringify(this.toJSON(stopOnError)), { urlSafe: true });
  }
}
