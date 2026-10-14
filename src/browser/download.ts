import { AutoFirmaError, EXCEPTION } from "../core/errors.js";
import { encodeBase64 } from "../encoding/base64.js";
import { createEnvironment, type Environment } from "./environment.js";

/** Opciones de {@link downloadRemoteData}. */
export interface DownloadOptions {
  readonly signal?: AbortSignal;
  readonly environment?: Environment;
}

/**
 * Descarga datos de una URL y los devuelve en Base64. A diferencia del original, los errores
 * HTTP (404, 500...) tambien rechazan la promesa y cada descarga es independiente.
 */
export async function downloadRemoteData(
  url: string | URL,
  options: DownloadOptions = {},
): Promise<string> {
  const env = options.environment ?? createEnvironment();
  let response: Response;
  try {
    response = await env.fetch(String(url), options.signal ? { signal: options.signal } : {});
  } catch (cause) {
    options.signal?.throwIfAborted();
    throw new AutoFirmaError(EXCEPTION.IO, "No se pudieron descargar los datos", null, { cause });
  }
  if (!response.ok)
    throw new AutoFirmaError(
      EXCEPTION.IO,
      `No se pudieron descargar los datos (HTTP ${response.status})`,
    );
  return encodeBase64(new Uint8Array(await response.arrayBuffer()));
}
