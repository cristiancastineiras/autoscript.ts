import { textToBase64 } from "../encoding/index.js";
import type { BatchDefinition, BatchDocument, SignOperation } from "./types.js";

export class Batch {
  readonly #definition: Omit<BatchDefinition, "singlesigns">;
  readonly #documents: Map<string, BatchDocument> = new Map();

  constructor(
    algorithm: string,
    format: string,
    suboperation: SignOperation = "sign",
    extraparams?: string,
  ) {
    if (!algorithm || !format) throw new TypeError("Batch algorithm and format are required.");
    this.#definition = {
      algorithm,
      format,
      suboperation,
      ...(extraparams === undefined ? {} : { extraparams }),
    };
  }

  add(document: BatchDocument): this {
    if (!document.id || !document.datareference)
      throw new TypeError("Document id and reference are required.");
    if (this.#documents.has(document.id)) throw new TypeError("Duplicate batch document id.");
    this.#documents.set(document.id, Object.freeze({ ...document }));
    return this;
  }

  snapshot(): BatchDefinition {
    if (this.#documents.size === 0) throw new TypeError("Cannot sign an empty batch.");
    return Object.freeze({
      ...this.#definition,
      singlesigns: Object.freeze([...this.#documents.values()]),
    });
  }

  encode(stopOnError: boolean): string {
    const snapshot = this.snapshot();
    return textToBase64(
      JSON.stringify({
        ...snapshot,
        ...(snapshot.extraparams === undefined
          ? {}
          : { extraparams: textToBase64(snapshot.extraparams) }),
        singlesigns: snapshot.singlesigns.map((document) =>
          Object.assign(
            {},
            document,
            document.extraparams === undefined
              ? {}
              : { extraparams: textToBase64(document.extraparams) },
          ),
        ),
        stoponerror: stopOnError,
      }),
    );
  }
}
