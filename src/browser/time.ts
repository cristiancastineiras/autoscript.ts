import { createEnvironment, type Environment } from "./environment.js";

/** Desfase maximo por defecto entre la hora local y la del servidor: 5 minutos. */
export const DEFAULT_MAX_TIME_SKEW = 300_000;

/** Opciones de {@link checkTime}. */
export interface CheckTimeOptions {
  /** URL de la que tomar la cabecera `Date`. Por defecto, la propia pagina. */
  readonly url?: string | URL | null;
  /** Desfase maximo permitido en milisegundos. */
  readonly maxSkew?: number | null;
  readonly signal?: AbortSignal;
  readonly environment?: Environment;
}

/** Resultado de la comprobacion horaria. */
export interface CheckTimeResult {
  readonly clientTime: Date;
  readonly serverTime: Date;
  /** Diferencia absoluta en milisegundos. */
  readonly skew: number;
  /** El desfase supera el maximo permitido. */
  readonly exceeded: boolean;
}

/**
 * Compara la hora local con la cabecera `Date` del servidor de forma asincrona (el original
 * usaba una peticion sincrona, obsoleta). Devuelve `null` si no se puede comprobar: pagina
 * local, servidor sin cabecera `Date` o error de red.
 */
export async function checkTime(options: CheckTimeOptions = {}): Promise<CheckTimeResult | null> {
  const env = options.environment ?? createEnvironment();
  const url = options.url ? String(options.url) : env.location?.href;
  if (!url || url.startsWith("file:")) return null;
  let header: string | null;
  try {
    const response = await env.fetch(url, {
      method: "HEAD",
      cache: "no-store",
      ...(options.signal ? { signal: options.signal } : {}),
    });
    header = response.headers.get("Date");
  } catch {
    options.signal?.throwIfAborted();
    return null;
  }
  const clientTime = new Date();
  const serverTime = new Date(header ?? 0);
  if (!header || !(serverTime.getTime() > 0)) return null;
  const skew = Math.abs(clientTime.getTime() - serverTime.getTime());
  const maxSkew = options.maxSkew && options.maxSkew > 0 ? options.maxSkew : DEFAULT_MAX_TIME_SKEW;
  return { clientTime, serverTime, skew, exceeded: skew > maxSkew };
}
