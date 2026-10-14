import { readFileSync } from "node:fs";
import { webcrypto } from "node:crypto";
import { JSDOM, type DOMWindow } from "jsdom";
import { desDecrypt, desEncrypt } from "../../src/crypto/des.js";
import { decodeBase64, encodeBase64 } from "../../src/encoding/base64.js";
import { base64ToText, decodeUtf8, encodeUtf8, textToBase64 } from "../../src/encoding/utf8.js";
import { installAutoScript } from "../../src/compat/autoscript.js";
import type { LegacyGlobals } from "../../src/compat/types.js";

export const PAGE_URL = "https://sede.example.gob.es/tramite/firma.html";
export const SAFARI_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15";
export const FIREFOX_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0";
export const ANDROID_UA =
  "Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Mobile Safari/537.36";

const ORIGINAL_SOURCE = readFileSync(
  new URL("../../Estudio/autoscript.js", import.meta.url),
  "utf8",
);

/** Implementacion bajo prueba: el script original o la reescritura. */
export type Flavor = "original" | "modern";

export interface HttpExchange {
  readonly method: string;
  readonly url: string;
  readonly body: string;
}

export interface HttpReply {
  readonly status: number;
  readonly body: string;
}

/** Comportamiento del Autofirma simulado. */
export interface NativeBehavior {
  /** Respuestas (texto del canal) a cada operacion, en orden; `#wait` incluido. */
  readonly results?: readonly string[];
  /** Autofirma esta instalado y responde. */
  readonly installed?: boolean;
  /** Respuesta del servidor intermedio: campos en claro antes de cifrar, o texto literal. */
  readonly intermediate?: {
    readonly fields?: readonly Uint8Array[];
    readonly raw?: string;
    readonly pending?: number;
    readonly wait?: number;
  };
  /** Respuesta HTTP de los servicios `op=check`. */
  readonly servletStatus?: number;
}

/** Datos que la pagina ha enviado a Autofirma o a los servicios. */
export interface Capture {
  readonly launches: string[];
  readonly socketMessages: string[];
  readonly http: HttpExchange[];
  /** XML subido al servidor intermedio, ya descifrado. */
  readonly uploads: string[];
  readonly alerts: string[];
}

export interface Page {
  readonly window: DOMWindow;
  readonly capture: Capture;
  readonly globals: LegacyGlobals;
  /** Espera a que la cola de temporizadores rapidos se vacie. */
  settle(): Promise<void>;
}

export interface PageOptions {
  readonly flavor: Flavor;
  readonly userAgent?: string;
  readonly maxTouchPoints?: number;
  readonly websocket?: boolean;
  readonly secure?: boolean;
  readonly native?: NativeBehavior;
  readonly url?: string;
}

/** Parametros de una URL `afirma://op?...` (los valores se decodifican). */
export function params(url: string): Map<string, string> {
  const query = url.slice(url.indexOf("?") + 1).split("#")[0] ?? "";
  const map = new Map<string, string>();
  for (const pair of query.split("&")) {
    if (!pair) continue;
    const index = pair.indexOf("=");
    map.set(pair.slice(0, index), decodeURIComponent(pair.slice(index + 1)));
  }
  return map;
}

/** Sustituye los valores aleatorios por marcadores para comparar implementaciones. */
export function normalize(text: string): string {
  return text
    .replace(/idsession=[0-9a-zA-Z]{20}/g, "idsession=ID")
    .replace(/ports=[\d,]+/g, "ports=P")
    .replace(/([?&])(id|rid|fileid)=[0-9a-zA-Z]{20}/g, "$1$2=ID")
    .replace(/([?&])key=\d{8}/g, "$1key=DESKEY")
    .replace(/([?&])cipher=[^&]+/g, "$1cipher=CIPHER")
    .replace(/(k="(?:id|rid)" v=")[0-9a-zA-Z]{20}/g, "$1ID")
    .replace(/(k="key" v=")\d{8}/g, "$1DESKEY")
    .replace(/(k="cipher" v=")[^"]+/g, "$1CIPHER");
}

/** Quita un parametro de una URL de invocacion. */
export function without(url: string, ...keys: string[]): string {
  let result = url;
  for (const key of keys)
    result = result.replace(new RegExp(`([?&])${key}=[^&]*&?`), "$1").replace(/[?&]$/, "");
  return result;
}

function desKeyBytes(key: string): Uint8Array {
  return encodeUtf8(key);
}

/** Cifra campos de respuesta en el formato DES de Autofirma (`relleno.datos`). */
export function nativeDes(fields: readonly Uint8Array[], key: string): string {
  return fields
    .map((field, index) => {
      const padding = (8 - (field.length % 8)) % 8;
      const extra = index === fields.length - 1 ? 8 : 0;
      const plain = new Uint8Array(field.length + padding + extra);
      plain.set(field);
      return `${padding}.${encodeBase64(desEncrypt(desKeyBytes(key), plain), { urlSafe: true })}`;
    })
    .join("|");
}

/** Cifra campos de respuesta con AES-256-CBC y la configuracion `cipher` recibida. */
export async function nativeAes(fields: readonly Uint8Array[], cipher: string): Promise<string> {
  const config = JSON.parse(base64ToText(cipher)) as { key: string; iv: string };
  const key = await webcrypto.subtle.importKey("raw", decodeBase64(config.key), "AES-CBC", false, [
    "encrypt",
  ]);
  const iv = decodeBase64(config.iv);
  const parts = await Promise.all(
    fields.map(async (field) =>
      encodeBase64(
        new Uint8Array(
          await webcrypto.subtle.encrypt({ name: "AES-CBC", iv }, key, new Uint8Array(field)),
        ),
        {
          urlSafe: true,
        },
      ),
    ),
  );
  return parts.join("|");
}

async function decryptUpload(payload: string, launch: Map<string, string>): Promise<string> {
  const dot = payload.indexOf(".");
  if (dot !== -1 && /^\d+$/.test(payload.slice(0, dot))) {
    const plain = desDecrypt(
      desKeyBytes(launch.get("key") ?? ""),
      decodeBase64(payload.slice(dot + 1)),
    );
    return decodeUtf8(plain.subarray(0, plain.length - Number(payload.slice(0, dot))));
  }
  const config = JSON.parse(base64ToText(launch.get("cipher") ?? "")) as {
    key: string;
    iv: string;
  };
  const key = await webcrypto.subtle.importKey("raw", decodeBase64(config.key), "AES-CBC", false, [
    "decrypt",
  ]);
  const plain = await webcrypto.subtle.decrypt(
    { name: "AES-CBC", iv: decodeBase64(config.iv) },
    key,
    decodeBase64(payload),
  );
  return decodeUtf8(new Uint8Array(plain));
}

/** Crea una pagina con un Autofirma simulado y carga la implementacion indicada. */
export function createPage(options: PageOptions): Page {
  const native = options.native ?? {};
  const capture: Capture = { launches: [], socketMessages: [], http: [], uploads: [], alerts: [] };
  const dom = new JSDOM(
    "<!doctype html><html><head></head><body><main id='app'>Tramite</main></body></html>",
    {
      url: options.url ?? PAGE_URL,
      runScripts: "outside-only",
      pretendToBeVisual: true,
    },
  );
  const window = dom.window;
  const userAgent = options.userAgent ?? SAFARI_UA;
  Object.defineProperty(window.navigator, "userAgent", { get: () => userAgent });
  Object.defineProperty(window.navigator, "maxTouchPoints", {
    get: () => options.maxTouchPoints ?? 0,
  });
  Object.defineProperty(window.navigator, "platform", {
    get: () => ((options.maxTouchPoints ?? 0) > 1 ? "MacIntel" : "Win32"),
  });
  const secure = options.secure ?? true;
  const crypto = {
    getRandomValues: <T extends ArrayBufferView | null>(array: T): T =>
      webcrypto.getRandomValues(array as never) as T,
    ...(secure ? { subtle: webcrypto.subtle } : {}),
  };
  Object.defineProperty(window, "crypto", { value: crypto, configurable: true });
  window.alert = (message?: unknown) => {
    capture.alerts.push(String(message));
  };
  (window as unknown as { console: Console }).console.log = () => undefined;

  // Temporizadores instantaneos con orden FIFO para que las esperas de minutos tarden milisegundos.
  let pending = 0;
  const realSetTimeout = globalThis.setTimeout;
  const realClearTimeout = globalThis.clearTimeout;
  const handles = new Map<number, ReturnType<typeof setTimeout>>();
  let nextHandle = 1;
  window.setTimeout = ((
    callback: (...args: unknown[]) => void,
    _ms?: number,
    ...args: unknown[]
  ) => {
    const handle = nextHandle++;
    pending += 1;
    handles.set(
      handle,
      realSetTimeout(() => {
        handles.delete(handle);
        pending -= 1;
        callback(...args);
      }, 0),
    );
    return handle;
  }) as typeof window.setTimeout;
  window.clearTimeout = ((handle?: number) => {
    const timer = handle === undefined ? undefined : handles.get(handle);
    if (timer !== undefined) {
      realClearTimeout(timer);
      handles.delete(handle!);
      pending -= 1;
    }
  }) as typeof window.clearTimeout;

  // Estado del Autofirma simulado.
  const listening = new Set<number>();
  const results = [...(native.results ?? [])];
  let intermediateRequest: Map<string, string> | null = null;
  const storage = new Map<string, string>();
  let retrieveCalls = 0;

  const onLaunch = (url: string): void => {
    capture.launches.push(url);
    if (native.installed === false) return;
    const launch = params(url);
    if (url.startsWith("afirma://websocket") || url.startsWith("afirma://service")) {
      const port = Number((launch.get("ports") ?? "").split(",")[0]);
      listening.add(port);
      return;
    }
    intermediateRequest = launch;
    retrieveCalls = 0;
  };
  new window.MutationObserver((mutations) => {
    for (const mutation of mutations)
      for (const node of mutation.addedNodes)
        if ((node as Element).id === "iframeAfirma")
          onLaunch((node as HTMLIFrameElement).getAttribute("src") ?? "");
  }).observe(window.document.body, { childList: true });

  const nextResult = (): string => results.shift() ?? "CANCEL";

  // WebSocket simulado con API de propiedades (on*) y de eventos.
  class FakeWebSocket extends window.EventTarget {
    static readonly CONNECTING = 0;
    static readonly OPEN = 1;
    static readonly CLOSING = 2;
    static readonly CLOSED = 3;
    readyState = 0;
    onopen: ((event: Event) => void) | null = null;
    onclose: ((event: Event) => void) | null = null;
    onerror: ((event: Event) => void) | null = null;
    onmessage: ((event: MessageEvent) => void) | null = null;
    readonly port: number;
    constructor(readonly url: string) {
      super();
      this.port = Number(url.split(":").at(-1));
      window.setTimeout(() => {
        if (this.readyState !== 0) return;
        if (listening.has(this.port)) {
          this.readyState = 1;
          this.#fire(new window.Event("open"));
        } else {
          this.readyState = 3;
          this.#fire(new window.Event("error"));
          this.#fire(new window.Event("close"));
        }
      }, 0);
    }
    #fire(event: Event): void {
      const handler = (this as unknown as Record<string, unknown>)[`on${event.type}`];
      if (typeof handler === "function") handler.call(this, event);
      this.dispatchEvent(event);
    }
    send(message: string): void {
      if (this.readyState !== 1) throw new Error("socket cerrado");
      capture.socketMessages.push(message);
      const reply = message.startsWith("echo=") ? "OK" : nextResult();
      window.setTimeout(() => this.#fire(new window.MessageEvent("message", { data: reply })), 0);
    }
    close(): void {
      if (this.readyState === 3) return;
      const wasOpen = this.readyState === 1;
      this.readyState = 3;
      if (wasOpen) this.#fire(new window.Event("close"));
    }
  }
  if (options.websocket === false) {
    // Sin WebSocket se fuerza el canal HTTPS local en ambas implementaciones.
    delete (window as unknown as Record<string, unknown>)["WebSocket"];
  } else {
    (window as unknown as Record<string, unknown>)["WebSocket"] = FakeWebSocket;
  }

  // Servicio HTTPS local y servicios del servidor intermedio.
  const fragments: string[] = [];
  let responseParts: string[] = [];
  const handle = async (method: string, url: string, body: string): Promise<HttpReply> => {
    capture.http.push({ method, url, body });
    const address = new URL(url);
    if (address.hostname === "127.0.0.1") {
      const port = Number(address.port);
      if (!listening.has(port)) throw new TypeError("connection refused");
      const command = body.replace(/idsession=[0-9a-zA-Z]+@EOF$/, "");
      if (command.startsWith("echo="))
        return { status: 200, body: textToBase64("OK", { urlSafe: true }) };
      const answer = (): HttpReply => {
        const operation = fragments.splice(0).join("");
        capture.socketMessages.push(operation);
        const result = nextResult();
        if (operation.startsWith("afirma://save"))
          return { status: 200, body: textToBase64(result, { urlSafe: true }) };
        responseParts = result.match(/[\s\S]{1,7}/g) ?? [""];
        return { status: 200, body: textToBase64(String(responseParts.length), { urlSafe: true }) };
      };
      if (command.startsWith("cmd=")) {
        fragments.push(base64ToText(command.slice(4)));
        return answer();
      }
      if (command.startsWith("fragment=")) {
        const [, part, total, data] = command.split("@");
        fragments.push(base64ToText(data ?? ""));
        return {
          status: 200,
          body: textToBase64(part === total ? "OK" : "MORE_DATA_NEED", { urlSafe: true }),
        };
      }
      if (command.startsWith("firm=")) return answer();
      if (command.startsWith("send=")) {
        const part = Number(command.split("@")[1]);
        return {
          status: 200,
          body: textToBase64(responseParts[part - 1] ?? "", { urlSafe: true }),
        };
      }
      return { status: 404, body: "comando desconocido" };
    }
    const form = new URLSearchParams(method === "GET" ? address.search : body);
    if (form.get("op") === "check") return { status: native.servletStatus ?? 200, body: "OK" };
    if (address.pathname.endsWith("StorageService") && form.get("op") === "put") {
      storage.set(form.get("id") ?? "", form.get("dat") ?? "");
      return { status: 200, body: "OK" };
    }
    if (address.pathname.endsWith("RetrieveService") && form.get("op") === "get") {
      retrieveCalls += 1;
      const request = intermediateRequest;
      const behavior = native.intermediate ?? {};
      if (!request || retrieveCalls <= (behavior.pending ?? 1))
        return { status: 200, body: "err-06:= No existe" };
      if (retrieveCalls <= (behavior.pending ?? 1) + (behavior.wait ?? 0))
        return { status: 200, body: "#wait" };
      if (request.has("fileid")) {
        const xml = await decryptUpload(storage.get(request.get("fileid") ?? "") ?? "", request);
        capture.uploads.push(xml);
      }
      if (behavior.raw !== undefined) return { status: 200, body: behavior.raw };
      const fields = behavior.fields ?? [encodeUtf8("FIRMA")];
      const cipher = request.get("cipher");
      const text =
        cipher && secure
          ? await nativeAes(fields, cipher)
          : nativeDes(fields, request.get("key") ?? "");
      return { status: 200, body: text };
    }
    return { status: 404, body: "no encontrado" };
  };

  class FakeXMLHttpRequest {
    readyState = 0;
    status = 0;
    statusText = "";
    responseText = "";
    response: unknown = null;
    responseType = "";
    onreadystatechange: (() => void) | null = null;
    onload: (() => void) | null = null;
    onerror: ((event: unknown) => void) | null = null;
    #method = "GET";
    #url = "";
    open(method: string, url: string): void {
      this.#method = method;
      this.#url = url;
      this.readyState = 1;
    }
    setRequestHeader(): void {}
    overrideMimeType(): void {}
    send(body?: string): void {
      pending += 1;
      void handle(this.#method, new URL(this.#url, window.location.href).href, body ?? "").then(
        (reply) => {
          pending -= 1;
          this.readyState = 4;
          this.status = reply.status;
          this.responseText = reply.body;
          this.response = new TextEncoder().encode(reply.body).buffer;
          this.onreadystatechange?.();
          this.onload?.();
        },
        () => {
          pending -= 1;
          this.readyState = 4;
          this.status = 0;
          this.onreadystatechange?.();
          this.onerror?.({ target: this });
        },
      );
    }
  }
  (window as unknown as Record<string, unknown>)["XMLHttpRequest"] = FakeXMLHttpRequest;
  (window as unknown as Record<string, unknown>)["fetch"] = async (
    input: string | URL,
    init: RequestInit = {},
  ) => {
    pending += 1;
    try {
      const reply = await handle(
        init.method ?? "GET",
        new URL(String(input), window.location.href).href,
        String(init.body ?? ""),
      );
      return new Response(reply.body, {
        status: reply.status,
        headers: { Date: new Date().toUTCString() },
      });
    } finally {
      pending -= 1;
    }
  };

  let globals: LegacyGlobals;
  if (options.flavor === "original") {
    window.eval(ORIGINAL_SOURCE);
    const scope = window as unknown as LegacyGlobals;
    globals = {
      AutoScript: scope.AutoScript,
      MiniApplet: scope.MiniApplet,
      SupportDialog: scope.SupportDialog,
      Base64: scope.Base64,
    };
  } else {
    globals = installAutoScript({ window: window as never });
  }

  const settle = async (): Promise<void> => {
    for (let idle = 0; idle < 5;) {
      await new Promise((resolve) => realSetTimeout(resolve, 1));
      idle = pending === 0 ? idle + 1 : 0;
    }
  };

  return { window, capture, globals, settle };
}

/** Resultado de una llamada con callbacks heredados. */
export interface Outcome {
  readonly ok: boolean;
  readonly args: unknown[];
}

/** Ejecuta una llamada con callbacks heredados y espera a que termine. */
export async function invoke(
  page: Page,
  call: (success: (...args: unknown[]) => void, error: (...args: unknown[]) => void) => void,
): Promise<Outcome> {
  let done: Outcome | undefined;
  const outcome = new Promise<Outcome>((resolve) => {
    call(
      (...args) => resolve((done = { ok: true, args })),
      (...args) => resolve((done = { ok: false, args })),
    );
  });
  await Promise.race([outcome, page.settle()]);
  if (!done) await Promise.race([outcome, new Promise((resolve) => setTimeout(resolve, 50))]);
  return done ?? { ok: false, args: ["SIN RESPUESTA"] };
}
