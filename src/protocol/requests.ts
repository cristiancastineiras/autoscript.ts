import { PROTOCOL_VERSION, VERSION_CODE } from "../core/constants.js";
import type { ExtraParams } from "../core/types.js";
import { textToBase64 } from "../encoding/utf8.js";
import { isUrl, wireData, type OperationSettings, type WireOperation } from "./operation.js";

/** Valor de un parametro. `null`/`undefined` (y la cadena `"null"`) se omiten. */
export type ParamValue = string | number | boolean | null | undefined;

/** Parametro de una URL de invocacion. Los `raw` se envian sin codificar (dialecto WebSocket). */
export interface Param {
  readonly key: string;
  readonly value: ParamValue;
  readonly raw?: boolean;
}

function param(key: string, value: ParamValue, raw = false): Param {
  return raw ? { key, value, raw } : { key, value };
}

function present(value: ParamValue): value is string | number | boolean {
  return value !== null && value !== undefined && value !== "null";
}

/** Serializa los parametros con `&`. `encodeAll` ignora la marca `raw`. */
export function serializeParams(params: readonly Param[], encodeAll = false): string {
  return params
    .filter((entry) => present(entry.value))
    .map(
      ({ key, value, raw }) =>
        `${key}=${raw && !encodeAll ? String(value) : encodeURIComponent(String(value))}`,
    )
    .join("&");
}

function escapeProperty(text: string, key: boolean): string {
  const escaped = text
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll("\r", "\\r")
    .replaceAll("\t", "\\t");
  return key ? escaped.replace(/[=: #!]/g, "\\$&") : escaped.replace(/^[ #!]/, "\\$&");
}

/**
 * Convierte los `extraParams` al formato de Properties de Java que espera Autofirma. Un texto
 * se envia tal cual; un objeto se serializa escapando claves y valores.
 */
export function serializeExtraParams(extraParams: ExtraParams | null | undefined): string | null {
  if (extraParams === null || extraParams === undefined) return null;
  if (typeof extraParams === "string") return extraParams;
  return Object.entries(extraParams)
    .filter((entry): entry is [string, string | number | boolean] => present(entry[1]))
    .map(([key, value]) => `${escapeProperty(key, true)}=${escapeProperty(String(value), false)}`)
    .join("\n");
}

/** Nombre de aplicacion que se muestra en Autofirma: el configurado o el dominio de la pagina. */
export function appName(settings: OperationSettings, hostname: string | null): string | null {
  return settings.appName || hostname || null;
}

function serviceTimeout(settings: OperationSettings): number | null {
  return settings.serviceTimeout !== null && settings.serviceTimeout >= 0
    ? settings.serviceTimeout
    : null;
}

function sticky(settings: OperationSettings): Param[] {
  return [
    param("sticky", settings.stickySignatory),
    ...(settings.resetSticky ? [param("resetsticky", true)] : []),
  ];
}

function withMinimumVersion(settings: OperationSettings, params: readonly Param[]): Param[] {
  return settings.minimumClientVersion
    ? [param("mcv", settings.minimumClientVersion), ...params]
    : [...params];
}

/** Nombre de la operacion en la URL `afirma://`. */
export function operationName(operation: WireOperation): string {
  return operation.kind === "sign" ? operation.operation : operation.kind;
}

/**
 * Parametros de una operacion en el dialecto WebSocket: `properties`, `ksb64`, `dat` y
 * `servicetimeout` viajan en Base64 URL-safe sin codificar y el resto con `encodeURIComponent`.
 */
export function websocketParams(
  operation: WireOperation,
  settings: OperationSettings,
  session: string,
  hostname: string | null,
): Param[] {
  const id = [param("op", operationName(operation)), param("idsession", session)];
  const extra = (value: string | null): Param =>
    param("properties", value === null ? null : textToBase64(value, { urlSafe: true }), true);
  const keyStore = param(
    "ksb64",
    settings.keyStore === null ? null : textToBase64(settings.keyStore, { urlSafe: true }),
    true,
  );
  const timeout = param("servicetimeout", serviceTimeout(settings), true);
  const name = param("appname", appName(settings, hostname));
  const data = (value: string | null): Param => {
    const prepared = wireData(value);
    return param("dat", prepared, prepared !== null && !isUrl(prepared));
  };
  switch (operation.kind) {
    case "selectcert":
      return [...id, extra(operation.extraParams), keyStore, ...sticky(settings)];
    case "sign":
      return [
        ...id,
        param("algorithm", operation.algorithm),
        param("format", operation.format),
        extra(operation.extraParams),
        keyStore,
        ...sticky(settings),
        name,
        data(operation.data),
        timeout,
      ];
    case "signandsave":
      return [
        ...id,
        param("cop", operation.operation),
        param("algorithm", operation.algorithm),
        param("format", operation.format),
        extra(operation.extraParams || null),
        param("filename", operation.fileName),
        keyStore,
        ...sticky(settings),
        name,
        data(operation.data),
        timeout,
      ];
    case "batch":
      return [
        ...id,
        param("batchpresignerurl", operation.preSignerUrl),
        param("batchpostsignerurl", operation.postSignerUrl),
        extra(operation.extraParams),
        keyStore,
        ...sticky(settings),
        name,
        param("needcert", true),
        data(operation.data),
        ...(operation.json
          ? [
              param("jsonbatch", true),
              ...(operation.local ? [param("localBatchProcess", true)] : []),
            ]
          : []),
        timeout,
      ];
    case "load":
      return [
        ...id,
        param("title", operation.title),
        param("exts", operation.extensions),
        param("desc", operation.description),
        param("filePath", operation.filePath),
        param("multiload", operation.multiple),
      ];
    case "save":
      return [
        ...id,
        param("title", operation.title),
        param("filename", operation.fileName),
        param("exts", operation.extension),
        param("desc", operation.description),
        data(operation.data),
      ];
  }
}

/** URL de operacion del dialecto WebSocket, que se envia por el socket. */
export function websocketUrl(
  operation: WireOperation,
  settings: OperationSettings,
  session: string,
  hostname: string | null,
): string {
  const params = withMinimumVersion(
    settings,
    websocketParams(operation, settings, session, hostname),
  );
  return `afirma://${encodeURIComponent(operationName(operation))}?${serializeParams(params)}`;
}

/** Parametros de una operacion en el dialecto del servicio HTTPS local. */
export function httpsParams(
  operation: WireOperation,
  settings: OperationSettings,
  hostname: string | null,
): Param[] {
  const op = param("op", operationName(operation));
  const extra = (value: string | null): Param =>
    param("properties", value === null ? null : textToBase64(value));
  const keyStore = [
    param("keystore", settings.keyStore),
    param("ksb64", settings.keyStore === null ? null : textToBase64(settings.keyStore)),
  ];
  const name = param("appname", appName(settings, hostname));
  const timeout = param("servicetimeout", serviceTimeout(settings));
  switch (operation.kind) {
    case "selectcert":
      return [op, extra(operation.extraParams), ...keyStore, ...sticky(settings)];
    case "sign":
      return [
        op,
        ...keyStore,
        param("algorithm", operation.algorithm),
        param("format", operation.format),
        extra(operation.extraParams),
        param("dat", wireData(operation.data)),
        ...sticky(settings),
        name,
        timeout,
      ];
    case "signandsave":
      return [
        op,
        param("cop", operation.operation),
        ...keyStore,
        param("algorithm", operation.algorithm),
        param("format", operation.format),
        extra(operation.extraParams),
        param("filename", operation.fileName),
        param("dat", wireData(operation.data)),
        ...sticky(settings),
        name,
        timeout,
      ];
    case "batch":
      return [
        op,
        ...keyStore,
        param("batchpresignerurl", operation.preSignerUrl),
        param("batchpostsignerurl", operation.postSignerUrl),
        extra(operation.extraParams),
        param("dat", wireData(operation.data)),
        param("needcert", true),
        ...sticky(settings),
        name,
        ...(operation.json ? [param("jsonbatch", true)] : []),
        ...(operation.local ? [param("localBatchProcess", true)] : []),
      ];
    case "load":
      return [
        op,
        param("title", operation.title),
        param("exts", operation.extensions),
        param("desc", operation.description),
        param("filePath", operation.filePath),
        param("multiload", operation.multiple),
      ];
    case "save":
      return [
        op,
        param("title", operation.title),
        param("filename", operation.fileName),
        param("exts", operation.extension),
        param("desc", operation.description),
        param("dat", wireData(operation.data)),
      ];
  }
}

/** URL de operacion del dialecto HTTPS local (todos los valores codificados). */
export function httpsUrl(
  operation: WireOperation,
  settings: OperationSettings,
  hostname: string | null,
): string {
  const params = withMinimumVersion(settings, httpsParams(operation, settings, hostname));
  return `afirma://${encodeURIComponent(operationName(operation))}?${serializeParams(params, true)}`;
}

/** Contexto del certificado fijado en el servidor intermedio. */
export interface IntermediateSticky {
  readonly mobile: boolean;
  readonly certificate: string | null;
}

/** Sustituye los filtros de `extraParams` por uno que selecciona el certificado indicado. */
export function addSignatoryCertificate(certificate: string, extraParams: string | null): string {
  const kept = (extraParams ?? "")
    .split("\n")
    .filter(
      (line) =>
        line &&
        !line.startsWith("filters=") &&
        !line.startsWith("filter=") &&
        !line.startsWith("filters.") &&
        !line.startsWith("headless="),
    );
  return [...kept, `filters=encodedcert:${certificate}`, "headless=true"].join("\n");
}

function intermediateExtra(
  settings: OperationSettings,
  stickyState: IntermediateSticky,
  extraParams: string | null,
): Param[] {
  const params: Param[] = [];
  let properties = extraParams;
  if (settings.stickySignatory) {
    if (stickyState.mobile) {
      params.push(...sticky(settings));
    } else if (!settings.resetSticky && stickyState.certificate) {
      properties = addSignatoryCertificate(stickyState.certificate, properties);
    }
  }
  if (properties) params.push(param("properties", textToBase64(properties)));
  return params;
}

/** Parametros propios de cada operacion en el dialecto del servidor intermedio. */
export function intermediateOperationParams(
  operation: WireOperation,
  settings: OperationSettings,
  stickyState: IntermediateSticky,
): Param[] {
  const keyStore = param("ksb64", settings.keyStore ? textToBase64(settings.keyStore) : null);
  const timeout = param("servicetimeout", serviceTimeout(settings));
  const optional = (key: string, value: ParamValue): Param[] => (value ? [param(key, value)] : []);
  switch (operation.kind) {
    case "selectcert":
      return [keyStore, ...intermediateExtra(settings, stickyState, operation.extraParams)];
    case "sign":
      return [
        keyStore,
        ...optional("format", operation.format),
        ...optional("algorithm", operation.algorithm),
        timeout,
        ...intermediateExtra(settings, stickyState, operation.extraParams),
        ...optional("dat", wireData(operation.data)),
      ];
    case "signandsave":
      return [
        ...optional("cop", operation.operation),
        keyStore,
        ...optional("format", operation.format),
        ...optional("algorithm", operation.algorithm),
        ...optional("filename", operation.fileName),
        timeout,
        ...intermediateExtra(settings, stickyState, operation.extraParams),
        ...optional("dat", wireData(operation.data)),
      ];
    case "batch":
      return [
        keyStore,
        ...optional("batchpresignerurl", operation.preSignerUrl),
        ...optional("batchpostsignerurl", operation.postSignerUrl),
        ...(operation.json && operation.local ? [param("localBatchProcess", true)] : []),
        timeout,
        ...intermediateExtra(settings, stickyState, operation.extraParams),
        param("needcert", true),
        ...(operation.json ? [param("jsonbatch", true)] : []),
        ...optional("dat", wireData(operation.data)),
      ];
    case "save":
      return [
        ...optional("title", operation.title),
        ...optional("filename", operation.fileName),
        ...optional("extension", operation.extension),
        ...optional("description", operation.description),
        ...optional("dat", wireData(operation.data)),
      ];
    case "load":
      return [];
  }
}

/** Parametros comunes que el servidor intermedio agrega a cada operacion. */
export interface IntermediateEnvelope {
  readonly id: string;
  readonly appName: string | null;
  readonly desKey: string;
  readonly cipher: string | null;
  readonly storage: string;
  readonly progressDialog: boolean;
  readonly mobile: boolean;
}

/** Agrega a los parametros de operacion los comunes del servidor intermedio. */
export function intermediateParams(
  operation: WireOperation,
  params: readonly Param[],
  envelope: IntermediateEnvelope,
): Param[] {
  return [
    ...params,
    param("ver", PROTOCOL_VERSION),
    param("op", operationName(operation)),
    param("id", envelope.id),
    param("appname", envelope.appName),
    param("key", envelope.desKey),
    param("cipher", envelope.cipher),
    param("stservlet", envelope.storage),
    ...(envelope.progressDialog ? [] : [param("dlgload", false)]),
    ...(envelope.mobile ? [] : [param("aw", true)]),
  ];
}

/**
 * URL de invocacion del servidor intermedio. En Chrome para Android se construye como Intent
 * para que el sistema abra Autofirma App.
 */
export function intermediateUrl(
  operation: string,
  params: readonly Param[],
  settings: Pick<OperationSettings, "minimumClientVersion">,
  intent: boolean,
): string {
  const query = serializeParams([
    param("jvc", VERSION_CODE),
    param("mcv", settings.minimumClientVersion),
    ...params,
  ]);
  return intent
    ? `intent://${operation}?${query}#Intent;scheme=afirma;package=es.gob.afirma;end`
    : `afirma://${operation}?${query}`;
}

/** URL de arranque de los canales locales (`afirma://websocket` y `afirma://service`). */
export function launchUrl(
  channel: "websocket" | "service",
  ports: readonly number[],
  session: string,
  progressDialog: boolean,
): string {
  return `afirma://${channel}?ports=${ports.join(",")}&v=${PROTOCOL_VERSION}&jvc=${VERSION_CODE}&idsession=${session}${progressDialog ? "" : "&dlgload=false"}`;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\r", "&#13;")
    .replaceAll("\n", "&#10;")
    .replaceAll("\t", "&#9;");
}

/** XML con la configuracion de la operacion que se sube al servidor intermedio. */
export function intermediateXml(operation: string, params: readonly Param[]): string {
  const entries = params
    .filter((entry) => present(entry.value))
    .map(({ key, value }) => `<e k="${escapeXml(key)}" v="${escapeXml(String(value))}"/>`)
    .join("");
  return `<${operation}>${entries}</${operation}>`;
}
