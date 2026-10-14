import { AutoFirmaError } from "../core/errors.js";
import { encodeBase64 } from "../encoding/index.js";

export async function readBytes(
  response: Response,
  limit: number,
  signal: AbortSignal,
): Promise<Uint8Array> {
  if (!response.ok) throw new AutoFirmaError("network", `HTTP ${response.status}.`);
  signal.throwIfAborted();
  if (Number(response.headers.get("content-length")) > limit)
    throw new AutoFirmaError("protocol", "Response exceeds configured limit.");
  if (!response.body) return new Uint8Array();
  const reader = response.body.getReader();
  const abort = (): void => {
    void reader.cancel(signal.reason).catch(() => {});
  };
  signal.addEventListener("abort", abort, { once: true });
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      signal.throwIfAborted();
      if (done) break;
      size += value.length;
      if (size > limit) {
        await reader.cancel();
        throw new AutoFirmaError("protocol", "Response exceeds configured limit.");
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    return bytes;
  } finally {
    signal.removeEventListener("abort", abort);
    reader.releaseLock();
  }
}

export async function postText(
  url: string,
  body: string,
  signal: AbortSignal,
  limit: number,
  fetcher: typeof fetch = globalThis.fetch,
): Promise<string> {
  const response = await fetcher(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    signal,
    cache: "no-store",
    credentials: "omit",
    redirect: "error",
  });
  const bytes = await readBytes(response, limit, signal);
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

export interface DownloadOptions {
  readonly signal?: AbortSignal;
  readonly maxBytes?: number;
  readonly fetch?: typeof fetch;
}
export async function downloadRemoteData(
  url: string,
  options: DownloadOptions = {},
): Promise<string> {
  const address = new URL(url);
  if (!/^https?:$/.test(address.protocol) || address.username || address.password)
    throw new TypeError("Expected HTTP(S) URL without credentials.");
  const signal = options.signal ?? new AbortController().signal;
  const limit = options.maxBytes ?? 64 * 1024 * 1024;
  if (!Number.isSafeInteger(limit) || limit <= 0)
    throw new RangeError("maxBytes must be positive.");
  const response = await (options.fetch ?? globalThis.fetch)(address, {
    signal,
    credentials: "omit",
    redirect: "error",
  });
  return encodeBase64(await readBytes(response, limit, signal));
}
