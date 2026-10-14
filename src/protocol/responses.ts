import {
  AutoFirmaError,
  ERRORS,
  EXCEPTION,
  parseNativeError,
  type NativeErrorCodes,
} from "../core/errors.js";
import type { BatchResult, LoadedFile } from "../core/types.js";
import { fromBase64UrlSafe } from "../encoding/base64.js";
import { base64ToText } from "../encoding/utf8.js";
import type { NativeResult, WireOperation } from "./operation.js";

/** Codigos de error genericos del canal WebSocket. */
export const WEBSOCKET_CODES: NativeErrorCodes = {
  memory: ERRORS.WEBSOCKET_MEMORY_ERROR,
  unknown: ERRORS.WEBSOCKET_UNKNOWN_ERROR,
};

/** Codigos de error genericos del canal HTTPS local. */
export const SOCKET_CODES: NativeErrorCodes = {
  memory: ERRORS.SOCKET_MEMORY_ERROR,
  unknown: ERRORS.SOCKET_UNKNOWN_ERROR,
};

/** Lanza el error nativo que contenga la respuesta, si lo hay. */
export function throwIfNativeError(data: string, codes: NativeErrorCodes): void {
  const error = parseNativeError(data, codes);
  if (error) throw error;
}

/** Interpreta el resultado de un lote: JSON en Base64 o, en lotes XML, el texto recibido. */
export function parseBatchResult(result: string): BatchResult | string {
  try {
    const parsed: unknown = JSON.parse(base64ToText(result));
    if (parsed !== null && typeof parsed === "object") return parsed as BatchResult;
  } catch {
    // Lote XML o resultado no JSON: se devuelve tal cual, como el script original.
  }
  return result;
}

function parseFiles(data: string, multiple: boolean): readonly LoadedFile[] {
  if (data.indexOf(":") <= 0)
    throw AutoFirmaError.from(EXCEPTION.GENERIC, ERRORS.WEBSOCKET_INVALID_RESP);
  const entries = data.split("|");
  return (multiple ? entries : entries.slice(0, 1)).map((entry) => {
    const separator = entry.indexOf(":");
    return separator === -1
      ? { name: entry, data: "" }
      : { name: entry.slice(0, separator), data: fromBase64UrlSafe(entry.slice(separator + 1)) };
  });
}

/**
 * Interpreta la respuesta de los canales locales (WebSocket y HTTPS). Una firma sin
 * certificado llega doblemente codificada; con certificado, como `cert|firma[|datosExtra]`.
 */
export function parseLocalResponse(
  operation: WireOperation,
  data: string,
  codes: NativeErrorCodes,
): NativeResult {
  throwIfNativeError(data, codes);
  switch (operation.kind) {
    case "save":
      if (data !== "OK" && data !== "SAVE_OK")
        throw AutoFirmaError.from(EXCEPTION.GENERIC, codes.unknown);
      return { type: "saved", status: data };
    case "load":
      return { type: "files", files: parseFiles(data, operation.multiple) };
    case "selectcert":
      return { type: "certificate", certificate: fromBase64UrlSafe(data) };
    case "batch": {
      const separator = data.indexOf("|");
      return separator === -1
        ? { type: "batch", result: parseBatchResult(data), certificate: null }
        : {
            type: "batch",
            result: parseBatchResult(fromBase64UrlSafe(data.slice(0, separator))),
            certificate: fromBase64UrlSafe(data.slice(separator + 1)),
          };
    }
    case "sign":
    case "signandsave": {
      const [first = "", second, ...rest] = data.split("|");
      if (second === undefined)
        return {
          type: "signature",
          signature: fromBase64UrlSafe(base64ToText(first)),
          certificate: null,
          extraData: null,
        };
      return {
        type: "signature",
        certificate: fromBase64UrlSafe(first),
        signature: fromBase64UrlSafe(second),
        extraData: rest.length > 0 ? base64ToText(rest.join("")) : null,
      };
    }
  }
}

/**
 * Interpreta los campos ya descifrados que devuelve el servidor intermedio (cada uno en
 * Base64 estandar).
 */
export function parseIntermediateFields(
  operation: WireOperation,
  fields: readonly string[],
): NativeResult {
  const [first = "", second, third] = fields.map(fromBase64UrlSafe);
  switch (operation.kind) {
    case "batch":
      return { type: "batch", result: parseBatchResult(first), certificate: second ?? null };
    case "selectcert":
      return { type: "certificate", certificate: first };
    case "save":
      return { type: "saved", status: "OK" };
    case "load":
      throw AutoFirmaError.from(EXCEPTION.UNSUPPORTED, ERRORS.UPLOAD_FILE_SERVER);
    case "sign":
    case "signandsave":
      return second === undefined
        ? { type: "signature", signature: first, certificate: null, extraData: null }
        : {
            type: "signature",
            certificate: first,
            signature: second,
            extraData: third === undefined ? null : base64ToText(third),
          };
  }
}
