import { describe, expect, test } from "vitest";
import { createAutoFirmaClient } from "../src/browser/factory.js";
import type { OperationDialogs } from "../src/core/types.js";
import { textToBase64 } from "../src/encoding/utf8.js";
import { resolveServlets } from "../src/transports/servlets.js";
import { b64url, fakeEnvironment, text, type FetchHandler } from "./support/fake-env.js";
import { nativeDes, params } from "./support/harness.js";

const ui = (): OperationDialogs & { readonly calls: string[] } => {
  const calls: string[] = [];
  return {
    calls,
    showLoading: () => calls.push("loading"),
    close: () => calls.push("close"),
    showError: (kind) => (calls.push(`error:${kind}`), Promise.resolve(false)),
    showInsecureContextWarning: () => (calls.push("insecure"), Promise.resolve()),
    isOpen: () => false,
  };
};

/** Servicio HTTPS local simulado: responde al eco en el puerto indicado y ejecuta operaciones. */
function localService(results: string[], alive: () => boolean = () => true): FetchHandler {
  let parts: string[] = [];
  return (_url, init) => {
    if (!alive()) throw new TypeError("refused");
    const body = String(init.body).replace(/idsession=\w+@EOF$/, "");
    if (body.startsWith("echo=")) return text(b64url("OK"));
    if (body.startsWith("cmd=")) {
      parts = [results.shift() ?? "CANCEL"];
      return text(b64url("1"));
    }
    if (body.startsWith("send=")) return text(b64url(parts[0]!));
    return text("desconocido", 404);
  };
}

describe("HTTPS local", () => {
  test("reutiliza el puerto y relanza Autofirma si deja de responder", async () => {
    let alive = true;
    const env = fakeEnvironment({
      webSocket: false,
      fetch: localService(["Q0VS", "Q0VS"], () => alive),
    });
    const client = createAutoFirmaClient({ environment: env, connectionRetries: 2 });
    await expect(client.selectCertificate()).resolves.toBe("Q0VS");
    await expect(client.selectCertificate()).resolves.toBe("Q0VS");
    expect(env.launches).toHaveLength(1);
    alive = false;
    await expect(client.selectCertificate()).rejects.toMatchObject({ code: "AS620020" });
    expect(env.launches).toHaveLength(2);
  });

  test("un 404 del servicio es un error de comunicacion", async () => {
    const env = fakeEnvironment({
      webSocket: false,
      fetch: (_url, init) =>
        String(init.body).startsWith("echo=")
          ? text(b64url("OK"))
          : text("Recurso no encontrado", 404),
    });
    const client = createAutoFirmaClient({ environment: env });
    await expect(client.selectCertificate()).rejects.toMatchObject({
      code: "AS420503",
      message: "Recurso no encontrado",
    });
  });

  test("MEMORY_ERROR al recuperar la respuesta", async () => {
    const env = fakeEnvironment({ webSocket: false, fetch: localService(["MEMORY_ERROR"]) });
    const client = createAutoFirmaClient({ environment: env });
    await expect(client.sign({ algorithm: "SHA256", format: "CAdES" })).rejects.toMatchObject({
      code: "AS620021",
    });
  });
});

interface IntermediateServer {
  readonly fetch: FetchHandler;
  readonly launches: () => Map<string, string>;
}

function intermediateServer(
  respond: (request: Map<string, string>, call: number) => Response,
  env: { launches: string[] },
): IntermediateServer {
  let calls = 0;
  const launches = (): Map<string, string> => params(env.launches.at(-1) ?? "");
  return {
    launches,
    fetch: (url, init) => {
      const form = new URLSearchParams(String(init.body ?? ""));
      if (url.endsWith("?op=check")) return text("OK");
      if (form.get("op") === "put") return text("OK");
      calls += 1;
      return respond(launches(), calls);
    },
  };
}

describe("servidor intermedio", () => {
  test("agota el sondeo sin respuesta", async () => {
    const env = fakeEnvironment({ secure: false });
    const server = intermediateServer(() => text("err-06:= No existe"), env);
    const dialogs = ui();
    const client = createAutoFirmaClient({
      environment: {
        ...env,
        fetch: async (input, init) => server.fetch(String(input), init ?? {}),
      },
      transport: "intermediate",
      dialogs,
    });
    await expect(client.selectCertificate()).rejects.toMatchObject({ code: "AS620024" });
    expect(dialogs.calls).toContain("error:connecting-afirma");
  });

  test("error HTTP del servicio de recuperacion", async () => {
    const env = fakeEnvironment();
    const server = intermediateServer(() => text("", 503), env);
    const client = createAutoFirmaClient({
      environment: {
        ...env,
        fetch: async (input, init) => server.fetch(String(input), init ?? {}),
      },
      transport: "intermediate",
    });
    await expect(client.selectCertificate()).rejects.toMatchObject({
      code: "AS620025",
      message: expect.stringContaining("(Status: 503)"),
    });
  });

  test("fallos de red al consultar se reintentan; #wait reinicia la cuenta", async () => {
    const env = fakeEnvironment({ secure: false });
    const server = intermediateServer((request, call) => {
      if (call === 1) throw new TypeError("status 0");
      if (call < 14) return text("#wait");
      return text(nativeDes([new TextEncoder().encode("CERT")], request.get("key")!));
    }, env);
    const client = createAutoFirmaClient({
      environment: {
        ...env,
        fetch: async (input, init) => server.fetch(String(input), init ?? {}),
      },
      transport: "intermediate",
    });
    await expect(client.selectCertificate()).resolves.toBe(textToBase64("CERT"));
  });

  test("subida fallida: HTTP (AS620015) y red (AS300302)", async () => {
    const big = textToBase64("x".repeat(3000));
    for (const [response, code] of [
      [() => text("", 500), "AS620015"],
      [() => Promise.reject(new TypeError("red")), "AS300302"],
    ] as const) {
      const env = fakeEnvironment({
        fetch: (url) => (url.includes("Storage") ? response() : text("err-06")),
      });
      const client = createAutoFirmaClient({ environment: env, transport: "intermediate" });
      await expect(
        client.sign({ data: big, algorithm: "SHA256", format: "CAdES" }),
      ).rejects.toMatchObject({ code });
    }
  });

  test("contexto http sin WebCrypto avisa antes de usar DES", async () => {
    const env = fakeEnvironment({
      secure: false,
      location: {
        origin: "http://sede.gob.es",
        hostname: "sede.gob.es",
        protocol: "http:",
        href: "http://sede.gob.es/",
      },
    });
    const server = intermediateServer(
      (request) => text(nativeDes([new TextEncoder().encode("C")], request.get("key")!)),
      env,
    );
    const dialogs = ui();
    const client = createAutoFirmaClient({
      environment: {
        ...env,
        fetch: async (input, init) => server.fetch(String(input), init ?? {}),
      },
      transport: "intermediate",
      dialogs,
    });
    await client.selectCertificate();
    expect(dialogs.calls[0]).toBe("insecure");
    expect(server.launches().has("cipher")).toBe(false);
  });

  test("Chrome en Android invoca Autofirma App con un Intent", async () => {
    const env = fakeEnvironment({ platform: { android: true, chrome: true }, secure: false });
    const server = intermediateServer(
      (request) => text(nativeDes([new TextEncoder().encode("C")], request.get("key")!)),
      env,
    );
    const client = createAutoFirmaClient({
      environment: {
        ...env,
        fetch: async (input, init) => server.fetch(String(input), init ?? {}),
      },
    });
    expect(client.transport).toBe("intermediate");
    await client.selectCertificate();
    expect(env.launches[0]).toMatch(/^intent:\/\/selectcert\?jvc=4&/);
    expect(env.launches[0]).not.toContain("aw=true");
  });

  test("la carga de ficheros no esta disponible", async () => {
    const client = createAutoFirmaClient({
      environment: fakeEnvironment(),
      transport: "intermediate",
    });
    await expect(client.loadFile()).rejects.toMatchObject({ code: "AS500008" });
    await expect(client.loadFiles()).rejects.toMatchObject({ code: "AS500009" });
  });

  test("resolucion de los servicios por defecto", () => {
    expect(resolveServlets(null, null, "https://sede.gob.es/app/inicio")).toEqual({
      storage: "https://sede.gob.es/afirma-signature-storage/StorageService",
      retriever: "https://sede.gob.es/afirma-signature-retriever/RetrieveService",
    });
    expect(() => resolveServlets(null, null)).toThrow(/guardado de datos/);
  });
});
