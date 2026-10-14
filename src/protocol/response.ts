import { base64ToText, decodeBase64, encodeBase64 } from "../encoding/index.js";
import { AutoFirmaError, checkNativeError } from "../core/errors.js";
import type { OperationRequest, OperationResult } from "../core/types.js";

function standard(value: string): string {
  return encodeBase64(
    decodeBase64(value.replaceAll("+", "-").replaceAll("/", "_"), { urlSafe: true }),
  );
}

export function parseResponse(
  request: OperationRequest,
  value: string,
  maxLength: number,
  singleEncoded = false,
): OperationResult {
  if (value.length === 0) throw new AutoFirmaError("protocol", "Empty native response.");
  if (value.length > maxLength)
    throw new AutoFirmaError("protocol", "Response exceeds configured limit.");
  checkNativeError(value);
  if (request.operation === "save") {
    if (value !== "OK" && value !== "SAVE_OK")
      throw new AutoFirmaError("protocol", "Invalid save response.");
    return { saved: true };
  }
  if (request.operation === "load") {
    const files = value.split("|").map((entry) => {
      const separator = entry.indexOf(":");
      if (separator <= 0) throw new AutoFirmaError("protocol", "Invalid file response.");
      return Object.freeze({
        name: entry.slice(0, separator),
        data: standard(entry.slice(separator + 1)),
      });
    });
    if (!request.multiple && files.length !== 1)
      throw new AutoFirmaError("protocol", "Unexpected multiple files.");
    return { files: Object.freeze(files) };
  }
  if (request.operation === "selectcert") return { certificate: standard(value) };
  const fields = value.split("|");
  if (fields.length > 3 || fields.some((field) => !field))
    throw new AutoFirmaError("protocol", "Invalid response fields.");
  const first = fields[0]!;
  if (request.operation === "batch") {
    let result: unknown = first;
    try {
      result = JSON.parse(base64ToText(standard(first)));
    } catch {}
    return { result, certificate: fields[1] === undefined ? null : standard(fields[1]) };
  }
  if (fields.length === 1) {
    const signature = singleEncoded ? base64ToText(standard(first)) : first;
    return { signature: standard(signature), certificate: null, extraInfo: null };
  }
  return {
    certificate: standard(first),
    signature: standard(fields[1]!),
    extraInfo: fields[2] === undefined ? null : base64ToText(standard(fields[2])),
  };
}
