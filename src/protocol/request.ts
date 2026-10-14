import { decodeBase64, textToBase64 } from "../encoding/index.js";
import type { OperationContext, OperationRequest, Properties } from "../core/types.js";

export type Dialect = "websocket" | "https" | "intermediate";
export type Parameter = readonly [key: string, value: string];

function escapeProperty(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/[=:#! ]/g, "\\$&");
}

function escapeXml(value: string): string {
  for (const character of value) {
    const code = character.codePointAt(0)!;
    if (
      (code < 32 && code !== 9 && code !== 10 && code !== 13) ||
      (code >= 0xd800 && code <= 0xdfff) ||
      code === 0xfffe ||
      code === 0xffff
    )
      throw new TypeError("Invalid XML character.");
  }
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\r", "&#13;")
    .replaceAll("\n", "&#10;")
    .replaceAll("\t", "&#9;");
}

export function serializeProperties(properties: Properties = ""): string {
  if (typeof properties === "string") return properties;
  return Object.entries(properties)
    .map(([key, value]) => `${escapeProperty(key)}=${escapeProperty(String(value))}`)
    .join("\n");
}

export function operationParameters(
  request: OperationRequest,
  context: OperationContext,
  dialect: Dialect,
): Parameter[] {
  const { config, resetSticky } = context;
  const parameters: Parameter[] = [];
  const add = (key: string, value: string | number | boolean | null | undefined): void => {
    if (value !== null && value !== undefined) parameters.push([key, String(value)]);
  };
  const encode = (value: string): string =>
    textToBase64(value, { urlSafe: dialect === "websocket" });
  if (
    request.operation === "sign" ||
    request.operation === "cosign" ||
    request.operation === "countersign" ||
    request.operation === "signandsave"
  ) {
    if (!request.algorithm || !request.format)
      throw new TypeError("Algorithm and format are required.");
    add("algorithm", request.algorithm);
    add("format", request.format);
    add("appname", config.appName);
    if (config.serviceTimeoutMs > 0) add("servicetimeout", config.serviceTimeoutMs);
    if (request.operation === "signandsave") {
      add("cop", request.signOperation);
      add("filename", request.filename);
    }
  }
  if (request.operation === "selectcert" || "algorithm" in request) {
    if (dialect !== "intermediate") {
      add("ksb64", config.keyStore === null ? null : encode(config.keyStore));
      if (dialect === "https") add("keystore", config.keyStore);
    }
    add("sticky", config.sticky);
    add("resetsticky", resetSticky);
  }
  if (request.operation === "batch") {
    if (!request.local && (!request.preSignerUrl || !request.postSignerUrl))
      throw new TypeError("Remote batches require pre/post signer URLs.");
    add("batchpresignerurl", request.preSignerUrl);
    add("batchpostsignerurl", request.postSignerUrl);
    add("needcert", true);
    if (request.json) add("jsonbatch", true);
    if (request.local) add("localBatchProcess", true);
  }
  if ("properties" in request) add("properties", encode(serializeProperties(request.properties)));
  if (request.operation === "load" || request.operation === "save") {
    add("title", request.title);
    add(dialect === "intermediate" ? "extension" : "exts", request.extensions);
    add(dialect === "intermediate" ? "description" : "desc", request.description);
    if (request.operation === "load") {
      add("filePath", request.filePath);
      add("multiload", request.multiple ?? false);
    } else add("filename", request.filename);
  }
  if ("data" in request && request.data !== null) {
    if (typeof request.data !== "string")
      throw new TypeError("Document data must be Base64 or an HTTP(S) reference.");
    const data = /^https?:\/\//i.test(request.data)
      ? request.data
      : request.data.replaceAll("+", "-").replaceAll("/", "_");
    if (/^https?:\/\//i.test(data)) {
      const address = new URL(data);
      if (address.username || address.password)
        throw new TypeError("Document URLs must not contain credentials.");
    } else decodeBase64(data, { urlSafe: true });
    add("dat", data);
  }
  return parameters;
}

export function buildOperationUrl(
  operation: string,
  parameters: readonly Parameter[],
  minimumVersion: string | null = null,
  dialect: Dialect = "https",
): string {
  if (!/^[a-z]+$/.test(operation)) throw new TypeError("Invalid operation name.");
  const pairs: Parameter[] =
    minimumVersion === null ? [...parameters] : [["mcv", minimumVersion], ...parameters];
  const raw = new Set(["properties", "ksb64", "dat", "servicetimeout"]);
  return `afirma://${operation}?${pairs.map(([key, value]) => `${encodeURIComponent(key)}=${dialect === "websocket" && raw.has(key) && !/^https?:\/\//i.test(value) ? value : encodeURIComponent(value)}`).join("&")}`;
}

export function buildXml(operation: string, parameters: readonly Parameter[]): string {
  if (!/^[a-z]+$/.test(operation)) throw new TypeError("Invalid XML root.");
  return `<${operation}>${parameters.map(([key, value]) => `<e k="${escapeXml(key)}" v="${escapeXml(value)}"/>`).join("")}</${operation}>`;
}
