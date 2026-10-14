import { afterEach, describe, expect, it, vi } from "vitest";
import { createLegacyAutoScript, disposeLegacyAutoScript } from "../src/compat/facade.js";
import { installGlobals } from "../src/compat/globals.js";
import { AutoFirmaClient } from "../src/core/client.js";
import type { OperationRequest, Transport } from "../src/core/types.js";
import { checkTime } from "../src/browser/time.js";
import { createAutoFirmaClient } from "../src/browser/factory.js";
import { AutoFirmaError } from "../src/core/errors.js";
import { launchNative, detectMobile } from "../src/browser/launch.js";
import { randomSession, localPorts } from "../src/transports/session.js";
import { deadline } from "../src/core/lifecycle.js";
import { dialogMessages } from "../src/ui/locales.js";
import type { DialogHelp } from "../src/ui/locales.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

function call(
  invoke: (done: (...args: unknown[]) => void, fail: (...args: unknown[]) => void) => void,
): Promise<unknown[]> {
  return new Promise((resolve, reject) =>
    invoke(
      (...args) => resolve(args),
      (...args) => reject(new Error(String(args))),
    ),
  );
}

describe("legacy public contract", () => {
  it("downloads concurrently with request-owned callbacks and no native time gate", async () => {
    const responses = new Map<string, (response: Response) => void>();
    vi.stubGlobal(
      "fetch",
      (url: URL) =>
        new Promise<Response>((resolve) => {
          responses.set(url.href, resolve);
        }),
    );
    const api = createLegacyAutoScript();
    expect(api.getErrorType()).toBe(null);
    expect(api.getErrorCode()).toBe(null);
    expect(api.getErrorCodeNumber()).toBe(null);
    const first = call((done, fail) => api.downloadRemoteData("https://host/a", done, fail));
    const second = call((done, fail) => api.downloadRemoteData("https://host/b", done, fail));
    await vi.waitFor(() => expect(responses.size).toBe(2));
    responses.get("https://host/b")!(new Response("b"));
    responses.get("https://host/a")!(new Response("a"));
    expect(await first).toEqual(["YQ=="]);
    expect(await second).toEqual(["Yg=="]);
    await expect(
      call((done, fail) => api.downloadRemoteData("file:///x", done, fail)),
    ).rejects.toThrow();
    api.getCurrentLog();
    await api.checkTime("CT_RECOMMENDED");
    api.setForceWSMode(false);
    api.setServlets("https://store", "https://retrieve");
    api.cargarAppAfirma();
    disposeLegacyAutoScript(api);
  });
  it("preserves 60 keys, 42 functions and aliases without registering globals", () => {
    const api = createLegacyAutoScript();
    expect(Object.keys(api)).toHaveLength(60);
    expect(Object.values(api).filter((value) => typeof value === "function")).toHaveLength(42);
    expect(api.coSign.length).toBe(7);
    expect(api.cosign.length).toBe(6);
    expect(api.cargarMiniApplet).toBe(api.cargarAppAfirma);
    expect(api.getBase64FromText(null)).toBe(null);
    expect(api.getTextFromBase64(null)).toBe(null);
    expect(api.getTextFromBase64(api.getBase64FromText("a\r\nb"))).toBe("a\r\nb");
    expect(api.isJNLP()).toBe(false);
    expect(api.needNativeAppInstalled()).toBe(true);
    api.setForceAFirma();
    api.setJnlpService();
    const error = vi.fn();
    api.getCurrentLog(undefined, error);
    expect(error).toHaveBeenCalledWith(
      "java.lang.UnsupportedOperationException",
      expect.any(String),
      "AS500010",
    );
  });
  it("routes callbacks and retains independent errors", async () => {
    const requests: OperationRequest[] = [];
    const transport: Transport = {
      kind: "websocket",
      execute: async (request) => {
        requests.push(request);
        return request.operation === "selectcert" ? "YQ==" : "YQ==|Yg==";
      },
      dispose() {},
    };
    const api = createLegacyAutoScript({ client: new AutoFirmaClient(transport) });
    const signed = new Promise<void>((resolve, reject) =>
      api.coSign(
        "YQ==",
        "IGNORED",
        "SHA256withRSA",
        "CAdES",
        "a=b",
        (sig) => {
          expect(sig).toBe("Yg==");
          resolve();
        },
        (_type, message) => reject(new Error(message)),
      ),
    );
    await signed;
    expect(requests[0]).toMatchObject({
      operation: "cosign",
      data: "YQ==",
      algorithm: "SHA256withRSA",
    });
    expect(api.echo()).toBe("Cliente JavaScript");
    const error = createLegacyAutoScript();
    await new Promise<void>((resolve) =>
      error.sign("YQ==", "a", "b", null, undefined, () => resolve()),
    );
    expect(error.getErrorType()).toBe("java.lang.Exception");
    expect(error.getErrorMessage()).toBeTruthy();
    expect(api.getErrorMessage()).toBe(null);
    disposeLegacyAutoScript(api);
  });
  it("installs and restores globals only explicitly", () => {
    const target: Record<string, unknown> = { AutoScript: "previous" };
    expect(() => installGlobals({ target })).toThrow();
    const installed = installGlobals({ target, overwrite: true });
    expect(target["MiniApplet"]).toBe(installed.AutoScript);
    expect(Object.keys(installed.SupportDialog)).toHaveLength(20);
    installed.dispose();
    installed.dispose();
    expect(target).toEqual({ AutoScript: "previous" });
  });
  it("selects explicit transport without browser side effects", () => {
    for (const transport of ["auto", "websocket", "https"] as const)
      createAutoFirmaClient({ transport }).dispose();
    expect(() => createAutoFirmaClient({ transport: "intermediate" })).toThrow();
    createAutoFirmaClient({
      transport: "intermediate",
      intermediate: {
        storageUrl: "https://service/store",
        retrieveUrl: "https://service/retrieve",
      },
    }).dispose();
  });
  it("checks Date asynchronously and rejects malformed or missing headers", async () => {
    const server = Date.UTC(2026, 0, 1);
    const fetcher: typeof fetch = async () =>
      new Response(null, { headers: { Date: new Date(server).toUTCString() } });
    expect(
      await checkTime("https://example.test", {
        fetch: fetcher,
        now: () => server + 1000,
        maxSkewMs: 2000,
      }),
    ).toMatchObject({ valid: true, skewMs: 1000 });
    expect(
      await checkTime("https://example.test", {
        fetch: fetcher,
        now: () => server + 1000,
        maxSkewMs: 500,
      }),
    ).toMatchObject({ valid: false });
    await expect(
      checkTime("https://example.test", { fetch: async () => new Response(null) }),
    ).rejects.toThrow();
    await expect(checkTime("file:///x")).rejects.toThrow();
    await expect(checkTime("https://example.test", { timeoutMs: 0 })).rejects.toThrow();
  });
  it("delegates all native callbacks through the same client", async () => {
    const adapter: Transport = {
      kind: "websocket",
      execute: async (request) =>
        request.operation === "batch"
          ? "opaque|YQ=="
          : request.operation === "selectcert"
            ? "YQ=="
            : request.operation === "load"
              ? request.multiple
                ? "a:YQ==|b:Yg=="
                : "a:YQ=="
              : request.operation === "save"
                ? "OK"
                : "YQ==|Yg==",
      dispose: vi.fn(),
    };
    const client = new AutoFirmaClient(adapter);
    const support = {
      showLoading: vi.fn(),
      close: vi.fn(),
      showError: vi.fn(),
      setLocale: vi.fn(),
    };
    const api = createLegacyAutoScript({ client, support });
    expect(await call((done, fail) => api.sign("YQ==", "a", "b", null, done, fail))).toEqual([
      "Yg==",
      "YQ==",
      null,
    ]);
    await call((done, fail) => api.cosign("YQ==", "a", "b", "", done, fail));
    await call((done, fail) => api.counterSign("YQ==", "a", "b", "", done, fail));
    await call((done, fail) =>
      api.signAndSaveToFile("sign", "YQ==", "a", "b", "", "out", done, fail),
    );
    expect(await call((done, fail) => api.selectCertificate(null, done, fail))).toEqual(["YQ=="]);
    expect(
      await call((done, fail) => api.saveDataToFile("YQ==", "t", "f", "pdf", "d", done, fail)),
    ).toEqual(["OK"]);
    expect(
      await call((done, fail) => api.getFileNameContentBase64("t", "pdf", "d", "p", done, fail)),
    ).toEqual(["a", "YQ=="]);
    expect(
      await call((done, fail) =>
        api.getMultiFileNameContentBase64("t", "pdf", "d", "p", done, fail),
      ),
    ).toEqual([
      ["a", "b"],
      ["YQ==", "Yg=="],
    ]);
    api.setLocalBatchProcess(true);
    api.createBatch("a", "b", "sign", "x=y");
    api.addDocumentToBatch("a", "ref", "PAdES", "cosign", "k=v");
    api.addDocumentToBatch("b", "ref");
    expect(
      await call((done, fail) => api.signBatchProcess(true, null, null, null, done, fail)),
    ).toEqual(["opaque", "YQ=="]);
    await call((done, fail) =>
      api.signBatch("YQ==", "https://pre", "https://post", null, done, fail),
    );
    api.createBatch("a", "b", "sign");
    api.addDocumentToBatch("a", "ref");
    await call((done, fail) =>
      api.signBatchProcess(false, "https://pre", "https://post", "", done, fail),
    );
    await expect(
      call((done, fail) => api.signBatchProcess(true, null, null, "", done, fail)),
    ).rejects.toThrow();
    expect(() => api.addDocumentToBatch("a", "ref")).toThrow();
    api.setAppName("App");
    api.setMinimumClientVersion("1.9");
    api.setKeyStore("PKCS12");
    api.setStickySignatory(true);
    api.setServiceTimeout(100);
    api.enableProgressDialog(false);
    api.setLocale("en_US");
    expect(client.config).toMatchObject({
      appName: "App",
      serviceTimeoutMs: 100,
      sticky: true,
      progressDialog: false,
    });
    expect(support.setLocale).toHaveBeenCalledWith("en_US");
    disposeLegacyAutoScript(api);
  });
  it("configures before loading and recreates transport only while idle", () => {
    const factory = vi.fn(
      () => new AutoFirmaClient({ kind: "websocket", execute: async () => "", dispose() {} }),
    );
    const api = createLegacyAutoScript({ createClient: factory });
    api.setAppName("App");
    api.setPortRange(50000);
    api.cargarAppAfirma("https://service/path", "PKCS12");
    expect(factory.mock.calls).toHaveLength(1);
    api.setServlets("https://store", "https://retrieve");
    api.setForceWSMode(true);
    api.setForceWSMode(false);
    api.setPortRange(50000, 50002);
    api.cargarMiniApplet();
    expect(factory.mock.calls).toHaveLength(6);
    expect(() => api.setPortRange(60000, 50000)).toThrow();
    disposeLegacyAutoScript(api);
  });
  it("prevents pending operations from mixing state and retains coded errors", async () => {
    const api = createLegacyAutoScript({
      client: new AutoFirmaClient({
        kind: "websocket",
        execute: async () => {
          throw new AutoFirmaError("native", "bad", "AS123456", "java.lang.Exception");
        },
        dispose() {},
      }),
    });
    const failed = new Promise<void>((resolve) =>
      api.sign(null, "a", "b", "", undefined, () => resolve()),
    );
    const busy = vi.fn();
    api.sign(null, "a", "b", "", undefined, busy);
    expect(busy).toHaveBeenCalledWith("java.lang.IllegalStateException", expect.any(String), null);
    expect(() => api.setStickySignatory(true)).toThrow();
    await failed;
    expect(api.getErrorCode()).toBe("AS123456");
    expect(api.getErrorCodeNumber()).toBe("123456");
    disposeLegacyAutoScript(api);
  });
  it("supports globals Base64 and preserves user replacements on uninstall", () => {
    const target: Record<string, unknown> = {};
    const installation = installGlobals({ target });
    const base = target["Base64"] as {
      encode(text: string, safe?: boolean): string;
      decode(text: string, safe?: boolean): string;
      encodeArrayBuffer(bytes: ArrayBuffer, safe?: boolean): string;
      encodeByteArray(bytes: Uint8Array, safe?: boolean): string;
    };
    expect(base.decode(base.encode("a"))).toBe("a");
    expect(base.decode(base.encode("\u{1f600}", true), true)).toBe("\u{1f600}");
    expect(base.encodeArrayBuffer(new Uint8Array([255]).buffer)).toBe("/w==");
    expect(base.encodeArrayBuffer(new Uint8Array([255]).buffer, true)).toBe("_w==");
    expect(base.encodeByteArray(new Uint8Array([255]))).toBe("/w==");
    expect(base.encodeByteArray(new Uint8Array([255]), true)).toBe("_w==");
    target["MiniApplet"] = "changed";
    installation.dispose();
    expect(target["MiniApplet"]).toBe("changed");
    expect(() =>
      installGlobals({
        target: Object.defineProperty({}, "AutoScript", { value: true }),
        overwrite: true,
      }),
    ).toThrow();
  });
  it("checks browser launch and mobile routing without opening real applications", () => {
    expect(() => launchNative("afirma://sign")).toThrow();
    const window = { location: { href: "" } };
    vi.stubGlobal("window", window);
    launchNative("afirma://sign");
    expect(window.location.href).toBe("afirma://sign");
    launchNative("intent://sign");
    expect(window.location.href).toBe("intent://sign");
    expect(() => launchNative("javascript:bad")).toThrow();
    expect(detectMobile()).toBe(false);
    const api = createLegacyAutoScript();
    for (const userAgent of ["Android", "iPhone", "desktop"]) {
      vi.stubGlobal("navigator", { userAgent, platform: "Linux", maxTouchPoints: 0 });
      expect(api.isAndroid()).toBe(userAgent === "Android");
      expect(api.isIOS()).toBe(userAgent === "iPhone");
      expect(detectMobile()).toBe(userAgent !== "desktop");
    }
    vi.stubGlobal("navigator", { userAgent: "desktop", platform: "MacIntel", maxTouchPoints: 2 });
    expect(api.isIOS()).toBe(true);
    expect(detectMobile()).toBe(true);
    expect(() => createAutoFirmaClient()).toThrow();
    const ports = localPorts();
    expect(new Set(ports).size).toBe(3);
    expect(randomSession()).toMatch(/^\w{20}$/);
  });
  it("gates mandatory time checks and allows opt-out", async () => {
    vi.stubGlobal(
      "fetch",
      async () =>
        new Response(null, { headers: { Date: new Date(Date.now() - 600_000).toUTCString() } }),
    );
    const support = { showLoading() {}, close() {}, showError: vi.fn(), setLocale() {} };
    const api = createLegacyAutoScript({ support });
    await expect(api.checkTime("CT_OBLIGATORY", 1000, "https://clock")).rejects.toThrow();
    await api.checkTime("CT_RECOMMENDED", undefined, "https://clock");
    expect(support.showError).toHaveBeenCalled();
    await api.checkTime("CT_NO");
    vi.stubGlobal("location", { href: "https://clock" });
    vi.stubGlobal(
      "fetch",
      async () => new Response(null, { headers: { Date: new Date().toUTCString() } }),
    );
    await api.checkTime("CT_OBLIGATORY");
    vi.stubGlobal("fetch", async () => new Response(null, { status: 500 }));
    await api.checkTime("CT_RECOMMENDED", 1, "https://clock");
    await expect(checkTime("https://clock")).rejects.toThrow();
    const controller = new AbortController();
    const scope = deadline(10, controller.signal);
    controller.abort();
    expect(scope.signal.aborted).toBe(true);
    scope.dispose();
  });
  it("localizes recommended and mandatory time-check messages", async () => {
    vi.stubGlobal(
      "fetch",
      async () =>
        new Response(null, {
          headers: { Date: new Date(Date.now() - 600_000).toUTCString() },
        }),
    );
    const support = {
      showLoading: vi.fn(),
      close: vi.fn(),
      showError: vi.fn(),
      showWarning: vi.fn(),
      setLocale: vi.fn(),
    };
    const api = createLegacyAutoScript({ support });
    api.setLocale("en_US");
    await api.checkTime("CT_RECOMMENDED", 1_000, "https://clock");
    const warning = support.showWarning.mock.calls[0]?.[0];
    expect(warning).toContain(dialogMessages("en_US").checkTimeWarn);
    expect(warning).toContain(`${dialogMessages("en_US").checkTimeLocalTime}:`);
    expect(warning).toContain(`${dialogMessages("en_US").checkTimeServerTime}:`);
    await expect(api.checkTime("CT_OBLIGATORY", 1_000, "https://clock")).rejects.toMatchObject({
      kind: "native",
    });
    expect(support.showError.mock.calls[0]?.[0]).toContain(dialogMessages("en_US").checkTimeError);
    vi.stubGlobal(
      "fetch",
      async () => new Response(null, { headers: { Date: new Date().toUTCString() } }),
    );
    await api.checkTime("CT_OBLIGATORY", 0, "https://clock");
    await api.checkTime("", 1_000, "https://clock");
    await api.checkTime("CT_RECOMMENDED", -1, "https://clock");
  });
  it("shows localized connection help with a user-triggered retry", async () => {
    let attempts = 0;
    const adapter: Transport = {
      kind: "websocket",
      async execute() {
        attempts += 1;
        if (attempts === 1) throw new AutoFirmaError("network", "Local socket unavailable.");
        return "YQ==|Yg==";
      },
      dispose() {},
    };
    const support = {
      showLoading: vi.fn(),
      close: vi.fn(),
      showError: vi.fn(),
      showWarning: vi.fn(),
      setLocale: vi.fn(),
    };
    const api = createLegacyAutoScript({ client: new AutoFirmaClient(adapter), support });
    api.setLocale("en_US");
    let resolveRetry: (() => void) | undefined;
    await new Promise<void>((resolve) =>
      api.sign(
        "YQ==",
        "SHA256withRSA",
        "CAdES",
        null,
        () => resolveRetry?.(),
        (_type, message) => {
          expect(message).toBe("Local socket unavailable.");
          resolve();
        },
      ),
    );
    const help = support.showError.mock.calls[0]?.[1] as DialogHelp | undefined;
    expect(support.showError.mock.calls[0]?.[0]).toBe(dialogMessages("en_US").error);
    expect(help?.text).toContain(dialogMessages("en_US").errorConnectingAutoFirma);
    expect(help?.links?.[0]?.url).toBe(dialogMessages("en_US").pcDownloadUrl);
    expect(help?.action?.label).toBe(dialogMessages("en_US").retryOperation);
    const retried = new Promise<void>((resolve) => {
      resolveRetry = resolve;
    });
    help?.action?.run();
    await retried;
    expect(attempts).toBe(2);
    disposeLegacyAutoScript(api);
  });
  it.each([
    ["AS300302", "errorConnectingService"],
    ["AS620025", "errorConnectingServerRecovering"],
  ] as const)("maps intermediate error %s to localized %s help", async (code, key) => {
    const adapter: Transport = {
      kind: "intermediate",
      async execute() {
        throw new AutoFirmaError("network", "HTTP 503.", code);
      },
      dispose() {},
    };
    const support = {
      showLoading: vi.fn(),
      close: vi.fn(),
      showError: vi.fn(),
      showWarning: vi.fn(),
      setLocale: vi.fn(),
    };
    const api = createLegacyAutoScript({ client: new AutoFirmaClient(adapter), support });
    api.setLocale("ca_ES");
    await new Promise<void>((resolve) =>
      api.sign("YQ==", "SHA256withRSA", "CAdES", null, undefined, () => resolve()),
    );
    const help = support.showError.mock.calls[0]?.[1] as DialogHelp | undefined;
    expect(help?.text).toBe(dialogMessages("ca_ES")[key]);
    disposeLegacyAutoScript(api);
  });
});
