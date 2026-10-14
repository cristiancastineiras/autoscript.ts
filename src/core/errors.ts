export type ErrorKind =
  | "cancelled"
  | "busy"
  | "timeout"
  | "disposed"
  | "network"
  | "protocol"
  | "unsupported"
  | "native";

export class AutoFirmaError extends Error {
  override readonly name: string = "AutoFirmaError";
  readonly kind: ErrorKind;
  readonly code: string | null;
  readonly nativeType: string | null;

  constructor(
    kind: ErrorKind,
    message: string,
    code: string | null = null,
    nativeType: string | null = null,
    cause?: unknown,
  ) {
    super(message, { cause });
    this.kind = kind;
    this.code = code;
    this.nativeType = nativeType;
  }
}

export function normalizeError(error: unknown): AutoFirmaError {
  if (error instanceof AutoFirmaError) return error;
  return new AutoFirmaError(
    "network",
    error instanceof Error ? error.message : "AutoFirma operation failed.",
    null,
    null,
    error,
  );
}

export function checkNativeError(value: string): void {
  if (value === "CANCEL")
    throw new AutoFirmaError(
      "cancelled",
      "Operation cancelled.",
      "AS500001",
      "es.gob.afirma.core.AOCancelledOperationException",
    );
  if (value === "NULL" || value === "MEMORY_ERROR")
    throw new AutoFirmaError("native", value, value === "NULL" ? "AS620019" : "AS620018");
  if (value.startsWith("SAF_")) throw new AutoFirmaError("native", value, value);
  if (value.startsWith("err-")) {
    const match = /^err-(\d+):=\s*(?:([A-Z0-9_]{8}) - )?(.*)$/s.exec(value);
    throw new AutoFirmaError(
      match?.[1] === "11" ? "cancelled" : "native",
      match?.[3] ?? value,
      match?.[2] ?? null,
      "java.lang.Exception",
    );
  }
}
