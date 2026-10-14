import { afterEach, describe, expect, it, vi } from "vitest";
import { defineClientConfig } from "../src/core/config.js";
import type { OperationContext, OperationRequest } from "../src/core/types.js";
import { base64ToText, encodeBase64, textToBase64 } from "../src/encoding/index.js";
import { WebSocketTransport, type Socket } from "../src/transports/websocket.js";
import { HttpsTransport } from "../src/transports/https.js";
import { IntermediateTransport } from "../src/transports/intermediate.js";
import type { WireCipher } from "../src/transports/wire-crypto.js";
import { localPorts } from "../src/transports/session.js";
import { downloadRemoteData, readBytes } from "../src/browser/network.js";

const request: OperationRequest = {
  operation: "sign",
  data: "YQ==",
  algorithm: "SHA256withRSA",
  format: "CAdES",
};
function context(): OperationContext {
  return { signal: new AbortController().signal, config: defineClientConfig(), resetSticky: false };
}
class FakeSocket extends EventTarget implements Socket {
  readyState: number = 0;
  readonly sent: string[] = [];
  constructor() {
    super();
    queueMicrotask(() => {
      if (this.readyState === 3) return;
      this.readyState = 1;
      this.dispatchEvent(new Event("open"));
    });
  }
  send(data: string): void {
    this.sent.push(data);
    queueMicrotask(() =>
      this.dispatchEvent(
        new MessageEvent("message", { data: data.startsWith("echo=") ? "OK" : "YQ==|Yg==" }),
      ),
    );
  }
  close(): void {
    this.readyState = 3;
    this.dispatchEvent(new Event("close"));
  }
}

class ScenarioSocket extends EventTarget implements Socket {
  readyState: number = 0;
  readonly sent: string[] = [];
  readonly mode: string;
  constructor(mode: string) {
    super();
    this.mode = mode;
    if (mode !== "never-open")
      queueMicrotask(() => {
        this.readyState = 1;
        this.dispatchEvent(new Event(mode === "open-error" ? "error" : "open"));
      });
  }
  send(data: string): void {
    this.sent.push(data);
    if (this.mode === "throw" && data.startsWith("afirma")) throw new Error("send failed");
    queueMicrotask(() => {
      if (this.mode === "socket-error" && data.startsWith("afirma")) {
        this.dispatchEvent(new Event("error"));
        return;
      }
      const value: unknown = data.startsWith("echo")
        ? "OK"
        : this.mode === "number"
          ? 42
          : this.mode === "large"
            ? "x".repeat(100)
            : this.mode === "wait" && data.startsWith("afirma")
              ? "#wait"
              : "YQ==|Yg==";
      this.dispatchEvent(new MessageEvent("message", { data: value }));
    });
  }
  close(): void {
    this.readyState = 3;
    this.dispatchEvent(new Event("close"));
  }
}

function fakeCipher(fields: readonly string[] = ["YQ==", "Yg=="]): WireCipher {
  return {
    parameters: [["key", "12345678"]],
    encrypt: vi.fn(async () => "0.encrypted"),
    decryptFields: vi.fn(async () => ({ fields, advanced: true })),
    dispose: vi.fn(),
  };
}

const failingFetch: typeof fetch = async () => new Response("failed", { status: 503 });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("transport contracts", () => {
  it.each([false, true])("uses intermediate default polling for mobile=%s", async (mobile) => {
    vi.useFakeTimers();
    vi.stubGlobal("window", { location: { href: "" } });
    const transport = new IntermediateTransport({
      storageUrl: "https://service/store",
      retrieveUrl: "https://service/retrieve",
      mobile,
      createCipher: async () => fakeCipher(),
      fetch: async () => new Response("encrypted"),
    });
    const operation = transport.execute(request, context());
    await vi.advanceTimersByTimeAsync(mobile ? 4001 : 3001);
    expect(await operation).toBe("YQ==|Yg==");
    transport.dispose();
  });
  it.each(["selectcert", "batch", "single"])(
    "retains sticky certificates for %s responses",
    async (mode) => {
      const launch = vi.fn();
      const transport = new IntermediateTransport({
        storageUrl: "https://service/store",
        retrieveUrl: "https://service/retrieve",
        launch,
        pollDelayMs: 0,
        createCipher: async () => fakeCipher(mode === "batch" ? ["e30="] : ["YQ=="]),
        fetch: async () => new Response("encrypted"),
      });
      const operation: OperationRequest =
        mode === "selectcert"
          ? { operation: "selectcert", properties: "" }
          : mode === "batch"
            ? { operation: "batch", data: "e30=", json: true, local: true }
            : { ...request, properties: "" };
      expect(
        await transport.execute(operation, {
          ...context(),
          config: defineClientConfig({ sticky: true }),
        }),
      ).toBe(mode === "batch" ? "e30=" : "YQ==");
      transport.dispose();
    },
  );
  it("owns the first validated socket and closes losers", async () => {
    const sockets: FakeSocket[] = [];
    const launch = vi.fn();
    const transport = new WebSocketTransport({
      ports: [50001, 50002, 50003],
      launch,
      launchDelayMs: 0,
      createSocket() {
        const socket = new FakeSocket();
        sockets.push(socket);
        return socket;
      },
    });
    expect(await transport.execute(request, context())).toBe("YQ==|Yg==");
    expect(launch.mock.calls[0]?.[0]).toMatch(
      /^afirma:\/\/websocket\?ports=50001,50002,50003&v=4&jvc=4&idsession=/,
    );
    expect(sockets.filter((socket) => socket.readyState === 1)).toHaveLength(1);
    expect(sockets[0]?.sent[1]).toMatch(/^afirma:\/\/sign\?/);
    await transport.execute(request, context());
    expect(launch).toHaveBeenCalledTimes(1);
    transport.dispose();
    expect(sockets.every((socket) => socket.readyState === 3)).toBe(true);
    await expect(transport.execute(request, context())).rejects.toMatchObject({ kind: "disposed" });
  });
  it("reports constructor failure without touching an absent socket", async () => {
    const transport = new WebSocketTransport({
      ports: [50000],
      launch() {},
      launchDelayMs: 0,
      retryDelayMs: 0,
      retries: 1,
      createSocket() {
        throw new Error("blocked");
      },
    });
    await expect(transport.execute(request, context())).rejects.toMatchObject({ kind: "network" });
    for (const ports of [[], [80], [50000, 50000], [1, 2, 3, 4]])
      expect(() => localPorts(ports)).toThrow();
  });
  it.each([1_000_000, 40])(
    "implements HTTPS command/fragment execution at size %i",
    async (fragmentSize) => {
      const bodies: string[] = [];
      const fetcher = vi.fn<typeof fetch>(async (_url, init) => {
        const body = String(init?.body);
        bodies.push(body);
        let response = "";
        if (body.startsWith("echo=")) response = "OK";
        else if (body.startsWith("fragment=")) {
          const fields = body.split("@");
          response = fields[1] === fields[2] ? "OK" : "MORE_DATA_NEED";
        } else if (body.startsWith("send=@1@2")) response = "YQ==|";
        else if (body.startsWith("send=@2@2")) response = "Yg==";
        else response = "2";
        return new Response(textToBase64(response, { urlSafe: true }));
      });
      const transport = new HttpsTransport({
        ports: [50000],
        launch() {},
        launchDelayMs: 0,
        fetch: fetcher,
        fragmentSize,
      });
      expect(await transport.execute(request, context())).toBe("YQ==|Yg==");
      expect(bodies.every((body) => /idsession=\w{20}@EOF$/.test(body))).toBe(true);
      expect(bodies.some((body) => body.startsWith(fragmentSize === 40 ? "firm=" : "cmd="))).toBe(
        true,
      );
      if (fragmentSize > 40) {
        const command = bodies.find((body) => body.startsWith("cmd="))!;
        expect(
          base64ToText(command.slice(4, command.lastIndexOf("idsession=")), { urlSafe: true }),
        ).toContain("afirma://sign?");
      }
      transport.dispose();
      await expect(transport.execute(request, context())).rejects.toMatchObject({
        kind: "disposed",
      });
    },
  );
  it("posts intermediate data, polls waits and disposes encryption", async () => {
    const cipher: WireCipher = {
      parameters: [["key", "12345678"]],
      encrypt: vi.fn(async () => "0.encrypted"),
      decryptFields: vi.fn(async () => ({ fields: ["YQ==", "Yg=="], advanced: true })),
      dispose: vi.fn(),
    };
    const bodies: URLSearchParams[] = [];
    let poll = 0;
    const fetcher = vi.fn<typeof fetch>(async (_url, init) => {
      const body = new URLSearchParams(String(init?.body));
      bodies.push(body);
      return new Response(
        body.get("op") === "put"
          ? "OK"
          : ++poll === 1
            ? "err-06:= pending"
            : poll === 2
              ? "#wait"
              : "encrypted|encrypted",
      );
    });
    const launch = vi.fn();
    const transport = new IntermediateTransport({
      storageUrl: "https://service/store",
      retrieveUrl: "https://service/retrieve",
      launch,
      pollDelayMs: 0,
      fetch: fetcher,
      createCipher: async () => cipher,
    });
    expect(
      await transport.execute({ ...request, data: encodeBase64(new Uint8Array(3000)) }, context()),
    ).toBe("YQ==|Yg==");
    expect(bodies[0]?.get("op")).toBe("put");
    expect(launch.mock.calls[0]?.[0]).toContain("fileid=");
    expect(bodies.at(-1)?.get("it")).toBe("1");
    expect(cipher.dispose).toHaveBeenCalledTimes(1);
    await expect(transport.execute({ operation: "load" }, context())).rejects.toMatchObject({
      kind: "unsupported",
    });
    transport.dispose();
    await expect(transport.execute(request, context())).rejects.toMatchObject({ kind: "disposed" });
    expect(
      () =>
        new IntermediateTransport({
          storageUrl: "http://service/store",
          retrieveUrl: "https://service/retrieve",
        }),
    ).toThrow();
  });
  it("handles HTTP errors, bounded bodies, downloads and abort", async () => {
    const signal = new AbortController().signal;
    await expect(readBytes(new Response("", { status: 404 }), 10, signal)).rejects.toMatchObject({
      kind: "network",
    });
    await expect(readBytes(new Response("large"), 1, signal)).rejects.toMatchObject({
      kind: "protocol",
    });
    await expect(
      readBytes(new Response("x", { headers: { "content-length": "20" } }), 10, signal),
    ).rejects.toMatchObject({ kind: "protocol" });
    expect(await readBytes(new Response(null), 10, signal)).toEqual(new Uint8Array());
    expect(
      await downloadRemoteData("https://example.test/data", {
        fetch: async () => new Response(new Uint8Array([255])),
      }),
    ).toBe("/w==");
    await expect(downloadRemoteData("file:///x")).rejects.toThrow();
    await expect(downloadRemoteData("https://example.test", { maxBytes: 0 })).rejects.toThrow();
    const controller = new AbortController();
    controller.abort();
    await expect(readBytes(new Response("x"), 10, controller.signal)).rejects.toThrow();
  });
  it.each(["open-error", "never-open", "throw", "socket-error", "number", "large"])(
    "cleans up WebSocket failure %s",
    async (mode) => {
      const sockets: ScenarioSocket[] = [];
      const transport = new WebSocketTransport({
        ports: [50000],
        launch() {},
        launchDelayMs: 0,
        retryDelayMs: 0,
        retries: 1,
        probeTimeoutMs: 5,
        createSocket() {
          const socket = new ScenarioSocket(mode);
          sockets.push(socket);
          return socket;
        },
      });
      const scope = context();
      await expect(
        transport.execute(request, {
          ...scope,
          config: defineClientConfig({ maxResponseLength: 50 }),
        }),
      ).rejects.toThrow();
      expect(sockets.every((socket) => socket.readyState === 3)).toBe(true);
      transport.dispose();
    },
  );
  it("polls #wait and supports default launch/socket dependencies", async () => {
    vi.useFakeTimers();
    let socket: ScenarioSocket | undefined;
    vi.stubGlobal("WebSocket", function SocketConstructor() {
      const candidate = new ScenarioSocket("wait");
      socket ??= candidate;
      return candidate;
    });
    vi.stubGlobal("window", { location: { href: "" } });
    const transport = new WebSocketTransport();
    const operation = transport.execute(request, context());
    await vi.advanceTimersByTimeAsync(5001);
    expect(await operation).toBe("YQ==|Yg==");
    expect(socket?.sent.at(-1)).toMatch(/^getresult\?idsession=/);
    transport.dispose();
  });
  it("aborts direct disposal and rejects a second transport operation", async () => {
    const transport = new WebSocketTransport({ ports: [50000], launch() {}, launchDelayMs: 100 });
    const operation = transport.execute(request, context());
    await expect(transport.execute(request, context())).rejects.toMatchObject({ kind: "busy" });
    transport.dispose();
    await expect(operation).rejects.toMatchObject({ kind: "disposed" });
  });
  it.each(["NO", "0", "1025", "CANCEL", "bad-ack"])(
    "rejects HTTPS protocol failure %s",
    async (reply) => {
      const fetcher: typeof fetch = async (_url, init) => {
        const body = String(init?.body);
        const response = body.startsWith("echo") ? (reply === "NO" ? "NO" : "OK") : reply;
        return new Response(textToBase64(response, { urlSafe: true }));
      };
      const transport = new HttpsTransport({
        ports: [50000],
        launch() {},
        launchDelayMs: 0,
        retryDelayMs: 0,
        retries: 1,
        fetch: fetcher,
        ...(reply === "bad-ack" ? { fragmentSize: 40 } : {}),
      });
      await expect(transport.execute(request, context())).rejects.toThrow();
    },
  );
  it("handles HTTPS default dependencies, retries, save and limits", async () => {
    vi.stubGlobal("window", { location: { href: "" } });
    let probes = 0;
    vi.stubGlobal("fetch", async (_url: unknown, init?: RequestInit) => {
      if (String(init?.body).startsWith("echo") && probes++ === 0) throw new Error("unavailable");
      return new Response(
        textToBase64(String(init?.body).startsWith("echo") ? "OK" : "SAVE_OK", { urlSafe: true }),
      );
    });
    const transport = new HttpsTransport({ ports: [50000], launchDelayMs: 0, retryDelayMs: 0 });
    expect(await transport.execute({ operation: "save", data: "YQ==" }, context())).toBe("SAVE_OK");
    transport.dispose();
    expect(() => new HttpsTransport({ fragmentSize: 0 })).toThrow();
    const tiny = new HttpsTransport({
      ports: [50000],
      launch() {},
      launchDelayMs: 0,
      fragmentSize: 1,
      maxFragments: 1,
    });
    await expect(tiny.execute(request, context())).rejects.toMatchObject({ kind: "protocol" });
    const tooLarge = new HttpsTransport({
      ports: [50000],
      launch() {},
      launchDelayMs: 0,
      fetch: async (_url, init) =>
        new Response(
          textToBase64(
            String(init?.body).startsWith("echo")
              ? "OK"
              : String(init?.body).startsWith("cmd")
                ? "1"
                : "long-response",
            { urlSafe: true },
          ),
        ),
    });
    await expect(
      tooLarge.execute(request, {
        ...context(),
        config: defineClientConfig({ maxResponseLength: 10 }),
      }),
    ).rejects.toThrow();
    const pending = new HttpsTransport({ launch() {}, launchDelayMs: 100 });
    const operation = pending.execute(request, context());
    await expect(pending.execute(request, context())).rejects.toMatchObject({ kind: "busy" });
    pending.dispose();
    await expect(operation).rejects.toMatchObject({ kind: "disposed" });
  });
  it.each([
    "short",
    "upload",
    "mobile",
    "intent",
    "sticky",
    "selectcert",
    "batch",
    "save",
    "fields",
    "limit",
    "exhausted",
  ])("covers intermediate mode %s", async (mode) => {
    const cipher = fakeCipher(
      mode === "selectcert" ? ["YQ=="] : mode === "batch" ? ["e30=", "YQ=="] : ["YQ==", "Yg=="],
    );
    const launch = vi.fn();
    const options = {
      storageUrl: "https://service/store",
      retrieveUrl: "https://service/retrieve",
      launch,
      pollDelayMs: 0,
      maxPolls: 1,
      createCipher: async () => cipher,
      mobile: mode === "mobile",
      androidIntent: mode === "intent",
      ...(mode === "limit" ? { maxUrlLength: 1 } : {}),
    };
    const fetcher = vi.fn<typeof fetch>(async (_url, init) => {
      const body = new URLSearchParams(String(init?.body));
      return new Response(
        body.get("op") === "put"
          ? "OK"
          : mode === "save"
            ? "OK\r\n"
            : mode === "exhausted"
              ? "err-06:= pending"
              : mode === "fields"
                ? "a|b|c|d"
                : "encrypted",
      );
    });
    const transport = new IntermediateTransport({ ...options, fetch: fetcher });
    const operation: OperationRequest =
      mode === "selectcert"
        ? { operation: "selectcert", properties: "" }
        : mode === "batch"
          ? { operation: "batch", data: "e30=", json: true, local: true }
          : mode === "save"
            ? { operation: "save", data: "YQ==" }
            : {
                ...request,
                properties: "a=b",
                ...(mode === "upload" ? { data: encodeBase64(new Uint8Array(3000)) } : {}),
              };
    const scope = {
      ...context(),
      config: defineClientConfig({
        sticky: mode === "sticky",
        appName: "App",
        minimumVersion: "1.9",
        progressDialog: false,
      }),
    };
    if (["fields", "limit", "exhausted"].includes(mode))
      await expect(transport.execute(operation, scope)).rejects.toThrow();
    else {
      expect(await transport.execute(operation, scope)).toBe(
        mode === "save"
          ? "OK"
          : mode === "batch"
            ? "e30=|YQ=="
            : mode === "selectcert"
              ? "YQ=="
              : "YQ==|Yg==",
      );
      expect(launch).toHaveBeenCalledTimes(1);
      if (mode === "intent")
        expect(launch.mock.calls[0]?.[0]).toContain(
          "#Intent;scheme=afirma;package=es.gob.afirma;end",
        );
      if (mode === "sticky") {
        await transport.execute(operation, scope);
        const url = new URL(launch.mock.calls[1]?.[0]);
        expect(base64ToText(url.searchParams.get("properties")!)).toContain(
          "filters=encodedcert:YQ==",
        );
        await transport.execute(operation, { ...scope, resetSticky: true });
        expect(
          base64ToText(new URL(launch.mock.calls[2]?.[0]).searchParams.get("properties")!),
        ).not.toContain("encodedcert");
      }
      if (mode === "upload") {
        await transport.execute(operation, scope);
        expect(cipher.encrypt).toHaveBeenLastCalledWith(expect.any(Uint8Array), true);
      }
    }
    transport.dispose();
  });
  it("rejects mobile restrictions and terminates disposed polling", async () => {
    const common = {
      storageUrl: "https://service/store",
      retrieveUrl: "https://service/retrieve",
      mobile: true,
      launch() {},
      pollDelayMs: 0,
    };
    const mobile = new IntermediateTransport(common);
    await expect(mobile.execute({ ...request, data: null }, context())).rejects.toMatchObject({
      kind: "unsupported",
    });
    await expect(
      mobile.execute({ operation: "batch", data: "YQ==", json: true, local: true }, context()),
    ).rejects.toMatchObject({ kind: "unsupported" });
    const adapter = new IntermediateTransport({ ...common, fetch: async () => new Response("OK") });
    const operation = adapter.execute({ operation: "save", data: "YQ==" }, context());
    await expect(adapter.execute(request, context())).rejects.toMatchObject({ kind: "busy" });
    adapter.dispose();
    await expect(operation).rejects.toMatchObject({ kind: "disposed" });
    const http = new IntermediateTransport({
      storageUrl: "http://service/store",
      retrieveUrl: "http://service/retrieve",
      allowInsecureServices: true,
      launch() {},
      pollDelayMs: 0,
      fetch: async () => new Response("SAVE_OK"),
    });
    expect(await http.execute({ operation: "save", data: "YQ==" }, context())).toBe("SAVE_OK");
    http.dispose();
    expect(() => new IntermediateTransport({ ...common, maxPolls: 0 })).toThrow();
  });
  it("preserves distinct storage and retrieve failure codes for localized help", async () => {
    const options = {
      storageUrl: "https://service/store",
      retrieveUrl: "https://service/retrieve",
      launch() {},
      pollDelayMs: 0,
      createCipher: async () => fakeCipher(),
    };
    const retrieving = new IntermediateTransport({ ...options, fetch: failingFetch });
    await expect(retrieving.execute(request, context())).rejects.toMatchObject({
      kind: "network",
      code: "AS620025",
    });
    const uploading = new IntermediateTransport({
      ...options,
      fetch: failingFetch,
      maxUrlLength: 1,
    });
    await expect(
      uploading.execute({ ...request, data: encodeBase64(new Uint8Array(3000)) }, context()),
    ).rejects.toMatchObject({ kind: "network", code: "AS300302" });
  });
  it("aborts a streaming HTTP body and keeps parallel downloads independent", async () => {
    const controller = new AbortController();
    const stream = new ReadableStream<Uint8Array>({
      cancel() {
        return Promise.reject(new Error("cancel failed"));
      },
    });
    const reading = readBytes(new Response(stream), 10, controller.signal);
    controller.abort(new Error("aborted"));
    await expect(reading).rejects.toThrow("aborted");
    const responses = new Map<string, (response: Response) => void>();
    vi.stubGlobal(
      "fetch",
      (url: URL) =>
        new Promise<Response>((resolve) => {
          responses.set(url.href, resolve);
        }),
    );
    const first = downloadRemoteData("https://host/a");
    const second = downloadRemoteData("https://host/b");
    responses.get("https://host/b")!(new Response("b"));
    responses.get("https://host/a")!(new Response("a"));
    expect(await first).toBe("YQ==");
    expect(await second).toBe("Yg==");
  });
});
