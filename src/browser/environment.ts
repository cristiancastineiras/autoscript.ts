/** Socket minimo que necesitan los transportes (compatible con `WebSocket`). */
export interface WebSocketLike {
  readonly readyState: number;
  send(data: string): void;
  close(): void;
  addEventListener(type: "open" | "close" | "error", listener: () => void): void;
  addEventListener(type: "message", listener: (event: { readonly data: unknown }) => void): void;
}

/** Caracteristicas del dispositivo y navegador que condicionan el protocolo. */
export interface Platform {
  readonly android: boolean;
  readonly ios: boolean;
  readonly firefox: boolean;
  readonly chrome: boolean;
}

/** Datos de la pagina que se usan para construir peticiones. */
export interface PageLocation {
  readonly origin: string;
  readonly hostname: string;
  readonly protocol: string;
  readonly href: string;
}

/** Dependencias del navegador que usan los transportes. Se pueden sustituir en pruebas. */
export interface Environment {
  readonly fetch: typeof fetch;
  /** El navegador ofrece WebSocket. */
  readonly webSocketSupported: boolean;
  readonly createWebSocket: (url: string) => WebSocketLike;
  /** Abre una URL `afirma://` o `intent://` para arrancar Autofirma. */
  readonly launch: (url: string) => void;
  readonly platform: Platform;
  readonly location: PageLocation | null;
  readonly crypto: Crypto;
  readonly setTimeout: (callback: () => void, milliseconds: number) => unknown;
  readonly clearTimeout: (handle: unknown) => void;
}

/** Ventana (o `globalThis`) de la que se toman las dependencias por defecto. */
export type HostWindow = Partial<
  Pick<
    Window & typeof globalThis,
    | "fetch"
    | "WebSocket"
    | "navigator"
    | "location"
    | "document"
    | "crypto"
    | "setTimeout"
    | "clearTimeout"
  >
>;

/** Detecta la plataforma con las mismas reglas que el script original. */
export function detectPlatform(userAgent: string, maxTouchPoints = 0): Platform {
  const agent = userAgent.toUpperCase();
  return {
    android: /ANDROID|SILK\/|KFJWI|KFJWA|KFTT|KFOT|KINDLE FIRE/.test(agent),
    ios: /IPAD|IPOD|IPHONE/.test(agent) || (agent.includes("MACINTOSH") && maxTouchPoints > 1),
    firefox: agent.includes("FIREFOX"),
    chrome: agent.includes("CHROME/") || agent.includes("CHROMIUM"),
  };
}

/** Plataforma de la ventana indicada, o de escritorio si no hay navegador. */
export function hostPlatform(host: HostWindow = globalThis): Platform {
  const navigator = host.navigator;
  return detectPlatform(navigator?.userAgent ?? "", navigator?.maxTouchPoints ?? 0);
}

/** Indica si el dispositivo es movil (Android o iOS). */
export function isMobile(platform: Platform): boolean {
  return platform.android || platform.ios;
}

/**
 * Abre la URL de invocacion. Chrome, iOS y Firefox para Android navegan directamente; el resto
 * usa un iframe oculto para que la pagina no navegue si el protocolo no esta registrado.
 */
export function openUrl(url: string, host: HostWindow, platform: Platform): void {
  const document = host.document;
  if (!document || platform.chrome || platform.ios || (platform.android && platform.firefox)) {
    if (!host.location) throw new Error("No hay una pagina desde la que abrir Autofirma.");
    host.location.href = url;
    return;
  }
  document.getElementById("iframeAfirma")?.remove();
  const frame = document.createElement("iframe");
  frame.id = "iframeAfirma";
  frame.width = "1";
  frame.height = "1";
  frame.style.display = "none";
  frame.src = url;
  document.body.append(frame);
}

function missing(name: string): never {
  throw new Error(`El entorno no ofrece ${name}.`);
}

/** Crea el entorno a partir de una ventana, con las sustituciones indicadas. */
export function createEnvironment(
  host: HostWindow = globalThis,
  overrides: Partial<Environment> = {},
): Environment {
  const platform = overrides.platform ?? hostPlatform(host);
  const location = host.location;
  const crypto = overrides.crypto ?? host.crypto ?? globalThis.crypto;
  return {
    // Se invocan como metodos de la ventana: sin ella algunos navegadores dan "Illegal invocation".
    fetch:
      overrides.fetch ??
      ((input, init) => (host.fetch ? host.fetch(input, init) : missing("fetch"))),
    webSocketSupported:
      overrides.webSocketSupported ??
      (overrides.createWebSocket !== undefined || typeof host.WebSocket === "function"),
    createWebSocket:
      overrides.createWebSocket ??
      ((url) => new (host.WebSocket ?? missing("WebSocket"))(url) as WebSocketLike),
    launch: overrides.launch ?? ((url) => openUrl(url, host, platform)),
    platform,
    location:
      overrides.location ??
      (location
        ? {
            origin: location.origin,
            hostname: location.hostname,
            protocol: location.protocol,
            href: location.href,
          }
        : null),
    crypto,
    setTimeout:
      overrides.setTimeout ??
      ((callback, milliseconds) =>
        host.setTimeout
          ? host.setTimeout(callback, milliseconds)
          : setTimeout(callback, milliseconds)),
    clearTimeout:
      overrides.clearTimeout ??
      ((handle) =>
        host.clearTimeout ? host.clearTimeout(handle as number) : clearTimeout(handle as number)),
  };
}

/** Espera abortable. */
export function sleep(env: Environment, milliseconds: number, signal: AbortSignal): Promise<void> {
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const abort = (): void => {
      env.clearTimeout(handle);
      reject(signal.reason);
    };
    const handle = env.setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, milliseconds);
    signal.addEventListener("abort", abort, { once: true });
  });
}
