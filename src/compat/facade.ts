import type { AutoFirmaClient } from "../core/client.js";
import { Batch } from "../core/batch.js";
import { LEGACY_VALUES } from "../core/constants.js";
import { AutoFirmaError, normalizeError } from "../core/errors.js";
import type { ClientConfig, KeyStore, SignatureResult } from "../core/types.js";
import { createAutoFirmaClient, type CreateClientOptions } from "../browser/factory.js";
import { downloadRemoteData } from "../browser/network.js";
import { checkTime } from "../browser/time.js";
import { base64ToText, textToBase64 } from "../encoding/index.js";
import { dialogMessages, localizedHelp, resolveDialogLocale } from "../ui/locales.js";
import type { DialogHelpKind, DevicePlatform } from "../ui/locales.js";
import type {
  LegacyAutoScript,
  LegacyErrorCallback,
  LegacyOptions,
  LegacySignCallback,
} from "./types.js";

const disposers: WeakMap<LegacyAutoScript, () => void> = new WeakMap();
export function disposeLegacyAutoScript(api: LegacyAutoScript): void {
  disposers.get(api)?.();
}

function getCurrentPlatform(): DevicePlatform {
  if (typeof navigator === "undefined") return "desktop";
  if (/Android|Kindle|Silk\//i.test(navigator.userAgent)) return "android";
  if (
    /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  )
    return "ios";
  return "desktop";
}

export function createLegacyAutoScript(options: LegacyOptions = {}): LegacyAutoScript {
  let client: AutoFirmaClient | null = options.client ?? null;
  let connection: CreateClientOptions = options.connection ?? {};
  let config: Partial<ClientConfig> = connection.config ?? {};
  let batch: Batch | null = null;
  let localBatch = false;
  let lastError: AutoFirmaError | null = null;
  let pending = false;
  let timeGate: Promise<void> = Promise.resolve();
  let timeGateError: unknown = null;
  let locale = "es_ES";
  const current = (): AutoFirmaClient => {
    if (!client)
      throw new AutoFirmaError(
        "unsupported",
        "Call cargarAppAfirma before invoking native operations.",
      );
    return client;
  };
  const idle = (): void => {
    if (pending || client?.busy) throw new AutoFirmaError("busy", "An operation is active.");
  };
  const configure = (changes: Partial<ClientConfig>): void => {
    idle();
    client?.configure(changes);
    config = { ...config, ...changes };
  };
  const run = <Result>(
    start: () => Promise<Result>,
    success: ((result: Result) => void) | undefined,
    error: LegacyErrorCallback | undefined,
    native = true,
  ): void => {
    if (native && pending) {
      error?.("java.lang.IllegalStateException", "An operation is active.", null);
      return;
    }
    if (native) pending = true;
    lastError = null;
    if (native) options.support?.showLoading();
    void (native ? timeGate : Promise.resolve()).then(start).then(
      (result) => {
        if (native) {
          pending = false;
          options.support?.close();
        }
        success?.(result);
      },
      (cause: unknown) => {
        if (native) pending = false;
        lastError = normalizeError(cause);
        if (native && cause !== timeGateError) {
          const platform = getCurrentPlatform();
          let helpKind: DialogHelpKind | null = null;
          if (lastError.code === "AS300302") helpKind = "service";
          else if (lastError.code === "AS620025") helpKind = "recovering";
          else if (lastError.kind === "network") helpKind = "connection";
          else if (lastError.kind === "timeout") helpKind = "timeout";
          else if (lastError.kind === "unsupported" && /WebCrypto/i.test(lastError.message))
            helpKind = "insecure";
          else if (lastError.kind === "unsupported" && platform !== "desktop")
            helpKind = "unsupported";
          const localized = helpKind
            ? localizedHelp(
                locale,
                helpKind,
                platform,
                typeof navigator !== "undefined" && /Firefox/i.test(navigator.userAgent),
              )
            : undefined;
          const retryable = helpKind === "connection" || helpKind === "timeout";
          const help =
            localized && retryable
              ? {
                  ...localized,
                  action: {
                    label: dialogMessages(locale).retryOperation,
                    run: () => run(start, success, error, native),
                  },
                }
              : localized;
          options.support?.showError(help ? dialogMessages(locale).error : lastError.message, help);
        }
        error?.(lastError.nativeType ?? "java.lang.Exception", lastError.message, lastError.code);
      },
    );
  };
  const signature = (
    start: () => Promise<SignatureResult>,
    success: LegacySignCallback | undefined,
    error: LegacyErrorCallback | undefined,
  ): void =>
    run(
      start,
      (result) => success?.(result.signature, result.certificate, result.extraInfo),
      error,
    );
  const load = (clientAddress?: string, keyStore?: KeyStore): void => {
    idle();
    if (clientAddress && !connection.intermediate) {
      const origin = new URL(clientAddress).origin;
      connection = {
        ...connection,
        intermediate: {
          storageUrl: `${origin}/afirma-signature-storage/StorageService`,
          retrieveUrl: `${origin}/afirma-signature-retriever/RetrieveService`,
        },
      };
    }
    if (keyStore) config = { ...config, keyStore };
    const next = (options.createClient ?? createAutoFirmaClient)({
      ...connection,
      config,
      websocket: {
        ...connection.websocket,
        retries: api.AUTOFIRMA_CONNECTION_RETRIES,
        retryDelayMs: api.AUTOFIRMA_LAUNCHING_TIME,
      },
      https: {
        ...connection.https,
        retries: api.AUTOFIRMA_CONNECTION_RETRIES,
        retryDelayMs: api.AUTOFIRMA_LAUNCHING_TIME,
      },
    });
    client?.dispose();
    client = next;
  };
  const api: LegacyAutoScript = {
    ...LEGACY_VALUES,
    cargarAppAfirma: load,
    cargarMiniApplet: load,
    sign(data, algorithm, format, params, success, error) {
      signature(
        () => current().sign({ data, algorithm, format, properties: params ?? "" }),
        success,
        error,
      );
    },
    coSign(data, _ignoredData, algorithm, format, params, success, error) {
      signature(
        () => current().cosign({ data, algorithm, format, properties: params ?? "" }),
        success,
        error,
      );
    },
    cosign(data, algorithm, format, params, success, error) {
      signature(
        () => current().cosign({ data, algorithm, format, properties: params ?? "" }),
        success,
        error,
      );
    },
    counterSign(data, algorithm, format, params, success, error) {
      signature(
        () => current().counterSign({ data, algorithm, format, properties: params ?? "" }),
        success,
        error,
      );
    },
    createBatch(algorithm, format, suboperation, extraParams) {
      batch = new Batch(algorithm, format, suboperation, extraParams);
    },
    addDocumentToBatch(id, datareference, format, suboperation, extraparams) {
      if (!batch) throw new TypeError("Create a batch first.");
      batch.add({
        id,
        datareference,
        ...(format ? { format } : {}),
        ...(suboperation ? { suboperation } : {}),
        ...(extraparams ? { extraparams } : {}),
      });
    },
    setLocalBatchProcess(local) {
      localBatch = local;
    },
    signBatchProcess(stop, preUrl, postUrl, filters, success, error) {
      const selected = batch;
      batch = null;
      run(
        async () => {
          if (!selected) throw new TypeError("Create a batch first.");
          return current().signBatchProcess(selected, stop, {
            local: localBatch,
            ...(preUrl ? { preSignerUrl: preUrl } : {}),
            ...(postUrl ? { postSignerUrl: postUrl } : {}),
            properties: filters ?? "",
          });
        },
        (result) => success?.(result.result, result.certificate),
        error,
      );
    },
    signBatch(data, preUrl, postUrl, params, success, error) {
      run(
        () =>
          current().signBatch({
            data,
            json: false,
            local: localBatch,
            ...(preUrl ? { preSignerUrl: preUrl } : {}),
            ...(postUrl ? { postSignerUrl: postUrl } : {}),
            properties: params ?? "",
          }),
        (result) => success?.(result.result, result.certificate),
        error,
      );
    },
    selectCertificate(params, success, error) {
      run(() => current().selectCertificate(params ?? ""), success, error);
    },
    signAndSaveToFile(signOperation, data, algorithm, format, params, filename, success, error) {
      signature(
        () =>
          current().signAndSave({
            signOperation,
            data,
            algorithm,
            format,
            properties: params ?? "",
            filename,
          }),
        success,
        error,
      );
    },
    getCurrentLog(_success, error) {
      error?.(
        "java.lang.UnsupportedOperationException",
        "Native logs are unavailable.",
        "AS500010",
      );
    },
    saveDataToFile(data, title, filename, extensions, description, success, error) {
      run(
        () => current().saveDataToFile({ data, title, filename, extensions, description }),
        () => success?.("OK"),
        error,
      );
    },
    getFileNameContentBase64(title, extensions, description, filePath, success, error) {
      run(
        () => current().loadFiles({ title, extensions, description, filePath }),
        (result) => {
          const file = result.files[0]!;
          success?.(file.name, file.data);
        },
        error,
      );
    },
    getMultiFileNameContentBase64(title, extensions, description, filePath, success, error) {
      run(
        () => current().loadFiles({ title, extensions, description, filePath, multiple: true }),
        (result) =>
          success?.(
            result.files.map((file) => file.name),
            result.files.map((file) => file.data),
          ),
        error,
      );
    },
    checkTime(type, maxMillis, url) {
      if (!type || type === "CT_NO" || (maxMillis !== undefined && maxMillis < 0)) {
        timeGateError = null;
        timeGate = Promise.resolve();
        return timeGate;
      }
      const check = async (): Promise<void> => {
        const endpoint = url ?? (typeof location === "undefined" ? "" : location.href);
        if (!endpoint || endpoint.startsWith("file:")) return;
        const result = await checkTime(
          endpoint,
          maxMillis === undefined || maxMillis === 0 ? {} : { maxSkewMs: maxMillis },
        );
        if (result.valid) {
          timeGateError = null;
          return;
        }
        const messages = dialogMessages(locale);
        const clientTime = new Date();
        const serverTime = new Date(result.serverTime);
        const formatTime = (value: Date): string => value.toLocaleString(locale.replace("_", "-"));
        const required = type === "CT_OBLIGATORY";
        const message = [
          required ? messages.checkTimeError : messages.checkTimeWarn,
          `${messages.checkTimeLocalTime}: ${formatTime(clientTime)}`,
          `${messages.checkTimeServerTime}: ${formatTime(serverTime)}`,
        ].join("\n");
        if (required) {
          timeGateError = new AutoFirmaError("native", message);
          options.support?.showError(message);
          throw timeGateError;
        }
        if (options.support?.showWarning) options.support.showWarning(message);
        else options.support?.showError(message);
      };
      timeGateError = null;
      timeGate = check();
      if (type !== "CT_OBLIGATORY") timeGate = timeGate.catch(() => {});
      void timeGate.catch(() => {});
      return timeGate;
    },
    setKeyStore(keyStore) {
      configure({ keyStore });
    },
    setForceWSMode(force) {
      idle();
      connection = { ...connection, transport: force ? "intermediate" : "auto" };
      if (client) load();
    },
    setServlets(storageUrl, retrieveUrl) {
      idle();
      connection = {
        ...connection,
        intermediate: { ...connection.intermediate, storageUrl, retrieveUrl },
      };
      if (client) load();
    },
    setPortRange(min, max) {
      idle();
      const lower = Math.max(1024, min);
      const upper = Math.min(65535, max ?? lower);
      if (!Number.isInteger(lower) || !Number.isInteger(upper) || upper < lower)
        throw new RangeError("Invalid port range.");
      const ports = new Set<number>();
      while (ports.size < Math.min(3, upper - lower + 1))
        ports.add(lower + (crypto.getRandomValues(new Uint32Array(1))[0]! % (upper - lower + 1)));
      connection = {
        ...connection,
        websocket: { ...connection.websocket, ports: [...ports] },
        https: { ...connection.https, ports: [...ports] },
      };
      if (client) load();
    },
    setStickySignatory(sticky) {
      configure({ sticky });
    },
    setLocale(value) {
      locale = resolveDialogLocale(value);
      options.support?.setLocale(locale);
    },
    setMinimumClientVersion(minimumVersion) {
      configure({ minimumVersion });
    },
    setAppName(appName) {
      configure({ appName });
    },
    setServiceTimeout(serviceTimeoutMs) {
      configure({ serviceTimeoutMs });
    },
    enableProgressDialog(progressDialog) {
      configure({ progressDialog });
    },
    getErrorMessage() {
      return lastError?.message ?? null;
    },
    getErrorType() {
      return lastError?.nativeType ?? (lastError ? "java.lang.Exception" : null);
    },
    getErrorCode() {
      return lastError?.code ?? null;
    },
    getErrorCodeNumber() {
      return lastError?.code?.slice(2) ?? null;
    },
    getBase64FromText(text) {
      return text === null ? null : textToBase64(text);
    },
    getTextFromBase64(value) {
      return value === null ? null : base64ToText(value);
    },
    downloadRemoteData(url, success, error) {
      run(() => downloadRemoteData(url), success, error, false);
    },
    isAndroid() {
      return typeof navigator !== "undefined" && /Android|Kindle/i.test(navigator.userAgent);
    },
    isIOS() {
      return (
        typeof navigator !== "undefined" &&
        (/iPad|iPhone|iPod/i.test(navigator.userAgent) ||
          (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1))
      );
    },
    echo() {
      current();
      return "Cliente JavaScript";
    },
    setForceAFirma() {},
    setJnlpService() {},
    isJNLP() {
      return false;
    },
    needNativeAppInstalled() {
      return true;
    },
  };
  disposers.set(api, () => {
    client?.dispose();
    client = null;
    options.support?.close();
  });
  return api;
}
