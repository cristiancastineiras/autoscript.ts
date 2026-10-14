import { describe, expect, test } from "vitest";
import { downloadRemoteData } from "../src/browser/download.js";
import { createEnvironment, detectPlatform, openUrl } from "../src/browser/environment.js";
import { checkTime } from "../src/browser/time.js";
import { fakeEnvironment } from "./support/fake-env.js";

describe("deteccion de plataforma", () => {
  test.each([
    ["Mozilla/5.0 (Linux; Android 15) Chrome/141.0 Mobile", 0, { android: true, chrome: true }],
    ["Mozilla/5.0 (Linux; U; Android 4.0.3; KFTT) Silk/3.4", 0, { android: true }],
    ["Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)", 5, { ios: true }],
    ["Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15", 5, { ios: true }],
    ["Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15", 0, {}],
    ["Mozilla/5.0 (Windows NT 10.0; rv:140.0) Gecko/20100101 Firefox/140.0", 0, { firefox: true }],
  ])("%s", (agent, touch, expected) => {
    expect(detectPlatform(agent, touch)).toEqual({
      android: false,
      ios: false,
      firefox: false,
      chrome: false,
      ...expected,
    });
  });
});

describe("entorno", () => {
  test("sin navegador se puede importar y crear, pero no abrir Autofirma", () => {
    const env = createEnvironment({});
    expect(env.webSocketSupported).toBe(false);
    expect(env.location).toBeNull();
    expect(() => env.launch("afirma://websocket")).toThrow();
    expect(() => env.createWebSocket("wss://127.0.0.1:1")).toThrow(/WebSocket/);
  });

  test("invoca fetch y los temporizadores como metodos de la ventana", async () => {
    const receivers: unknown[] = [];
    const host = {
      fetch(this: unknown) {
        receivers.push(this);
        return Promise.resolve(new Response("ok"));
      },
      setTimeout(this: unknown, callback: () => void) {
        receivers.push(this);
        callback();
        return 1;
      },
      clearTimeout(this: unknown) {
        receivers.push(this);
      },
    };
    const env = createEnvironment(host as never);
    await env.fetch("https://a.es");
    env.setTimeout(() => undefined, 10);
    env.clearTimeout(1);
    expect(receivers).toEqual([host, host, host]);
  });

  test("Chrome navega directamente; otros navegadores usan un iframe oculto", () => {
    const appended: { id: string; src: string; style: { display: string } }[] = [];
    let removed = 0;
    const host = {
      location: { href: "" },
      document: {
        getElementById: () => ({ remove: () => (removed += 1) }),
        createElement: () => ({ style: { display: "" } }) as never,
        body: { append: (node: never) => appended.push(node) },
      },
    } as never as Parameters<typeof openUrl>[1];
    openUrl("afirma://a", host, detectPlatform("Chrome/141"));
    expect((host.location as { href: string }).href).toBe("afirma://a");
    openUrl("afirma://b", host, detectPlatform("Firefox/140"));
    expect(appended[0]).toMatchObject({
      id: "iframeAfirma",
      src: "afirma://b",
      style: { display: "none" },
    });
    expect(removed).toBe(1);
  });
});

function withDate(date: Date | null) {
  return fakeEnvironment({
    fetch: () => new Response(null, { headers: date ? { Date: date.toUTCString() } : {} }),
  });
}

describe("comprobacion horaria", () => {
  test("detecta el desfase con la cabecera Date", async () => {
    const result = await checkTime({ environment: withDate(new Date(Date.now() - 600_000)) });
    expect(result?.exceeded).toBe(true);
    expect(result?.skew).toBeGreaterThan(590_000);
    const ok = await checkTime({ environment: withDate(new Date()), maxSkew: 60_000 });
    expect(ok?.exceeded).toBe(false);
  });

  test("sin cabecera, en local o sin red no se comprueba", async () => {
    expect(await checkTime({ environment: withDate(null) })).toBeNull();
    expect(await checkTime({ environment: fakeEnvironment() })).toBeNull();
    expect(
      await checkTime({ environment: withDate(new Date()), url: "file:///c:/a.html" }),
    ).toBeNull();
  });
});

describe("descarga de datos remotos", () => {
  test("devuelve Base64 y rechaza los errores HTTP", async () => {
    const env = fakeEnvironment({
      fetch: (url) =>
        new Response(url.endsWith("404") ? "no" : new Uint8Array([0xfb, 0xff]), {
          status: url.endsWith("404") ? 404 : 200,
        }),
    });
    await expect(downloadRemoteData("https://a.es/doc", { environment: env })).resolves.toBe(
      "+/8=",
    );
    await expect(downloadRemoteData("https://a.es/404", { environment: env })).rejects.toThrow(
      /HTTP 404/,
    );
    await expect(
      downloadRemoteData("https://a.es/x", { environment: fakeEnvironment() }),
    ).rejects.toThrow(/descargar/);
  });
});
