import { webcrypto } from "node:crypto";
import type { Environment, Platform, WebSocketLike } from "../../src/browser/environment.js";
import { textToBase64 } from "../../src/encoding/utf8.js";

/** Respuesta HTTP simulada. */
export type FetchHandler = (url: string, init: RequestInit) => Response | Promise<Response>;

/** Socket simulado controlado por la prueba. */
export class FakeSocket extends EventTarget {
  readyState = 0;
  readonly sent: string[] = [];
  readonly port: number;
  constructor(
    readonly url: string,
    readonly onSend: (socket: FakeSocket, message: string) => void,
  ) {
    super();
    this.port = Number(url.split(":").at(-1));
  }
  open(): void {
    this.readyState = 1;
    this.dispatchEvent(new Event("open"));
  }
  fail(): void {
    this.readyState = 3;
    this.dispatchEvent(new Event("error"));
    this.dispatchEvent(new Event("close"));
  }
  receive(data: string): void {
    this.dispatchEvent(Object.assign(new Event("message"), { data }));
  }
  send(message: string): void {
    if (this.readyState !== 1) throw new Error("cerrado");
    this.sent.push(message);
    this.onSend(this, message);
  }
  close(): void {
    if (this.readyState === 3) return;
    const open = this.readyState === 1;
    this.readyState = 3;
    if (open) this.dispatchEvent(new Event("close"));
  }
}

export interface FakeEnvironment extends Environment {
  readonly launches: string[];
  readonly sockets: FakeSocket[];
  readonly requests: { url: string; init: RequestInit }[];
}

export interface FakeEnvironmentOptions {
  readonly platform?: Partial<Platform>;
  /** Autofirma escucha en el primer puerto tras arrancar (canal WebSocket). */
  readonly installed?: boolean;
  /** Respuestas a las operaciones por WebSocket, en orden. */
  readonly socketResults?: string[];
  readonly fetch?: FetchHandler;
  readonly secure?: boolean;
  readonly webSocket?: boolean;
  readonly location?: { origin: string; hostname: string; protocol: string; href: string } | null;
}

/** Entorno de pruebas con un Autofirma simulado por WebSocket y `fetch` programable. */
export function fakeEnvironment(options: FakeEnvironmentOptions = {}): FakeEnvironment {
  const launches: string[] = [];
  const sockets: FakeSocket[] = [];
  const requests: { url: string; init: RequestInit }[] = [];
  const listening = new Set<number>();
  const results = options.socketResults ?? [];
  const env: FakeEnvironment = {
    launches,
    sockets,
    requests,
    fetch: async (input, init = {}) => {
      requests.push({ url: String(input), init });
      if (!options.fetch) throw new TypeError("sin red");
      return options.fetch(String(input), init);
    },
    webSocketSupported: options.webSocket ?? true,
    createWebSocket: (url) => {
      const socket = new FakeSocket(url, (target, message) => {
        const reply = message.startsWith("echo=") ? "OK" : results.shift();
        if (reply !== undefined) setTimeout(() => target.receive(reply), 0);
      });
      sockets.push(socket);
      setTimeout(() => {
        if (socket.readyState !== 0) return;
        if (listening.has(socket.port)) socket.open();
        else socket.fail();
      }, 0);
      return socket as unknown as WebSocketLike;
    },
    launch: (url) => {
      launches.push(url);
      const ports = /ports=([\d,]+)/.exec(url)?.[1];
      if (ports && options.installed !== false) listening.add(Number(ports.split(",")[0]));
    },
    platform: { android: false, ios: false, firefox: false, chrome: false, ...options.platform },
    location:
      options.location === undefined
        ? {
            origin: "https://sede.gob.es",
            hostname: "sede.gob.es",
            protocol: "https:",
            href: "https://sede.gob.es/tramite",
          }
        : options.location,
    crypto: {
      getRandomValues: (array: never) => webcrypto.getRandomValues(array),
      ...(options.secure === false ? {} : { subtle: webcrypto.subtle }),
    } as unknown as Crypto,
    setTimeout: (callback) => setTimeout(callback, 0),
    clearTimeout: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
  };
  return env;
}

/** Respuesta de texto. */
export function text(body: string, status = 200): Response {
  return new Response(body, { status });
}

/** Texto en Base64 URL-safe, como responde el servicio HTTPS local. */
export function b64url(value: string): string {
  return textToBase64(value, { urlSafe: true });
}
