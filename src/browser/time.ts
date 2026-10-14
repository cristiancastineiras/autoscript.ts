import { AutoFirmaError } from "../core/errors.js";
import { deadline } from "../core/lifecycle.js";

export interface TimeCheckOptions {
  readonly maxSkewMs?: number;
  readonly timeoutMs?: number;
  readonly signal?: AbortSignal;
  readonly fetch?: typeof fetch;
  readonly now?: () => number;
}
export interface TimeCheckResult {
  readonly valid: boolean;
  readonly skewMs: number;
  readonly serverTime: number;
}

export async function checkTime(
  url: string,
  options: TimeCheckOptions = {},
): Promise<TimeCheckResult> {
  const threshold = options.maxSkewMs ?? 300_000;
  const timeout = options.timeoutMs ?? 10_000;
  if (
    !Number.isFinite(threshold) ||
    threshold < 0 ||
    !Number.isSafeInteger(timeout) ||
    timeout <= 0
  )
    throw new RangeError("Invalid time check limits.");
  const address = new URL(url);
  if (!/^https?:$/.test(address.protocol) || address.username || address.password)
    throw new TypeError("Time endpoint must be HTTP(S) without credentials.");
  const scope = deadline(timeout, options.signal);
  try {
    const response = await (options.fetch ?? globalThis.fetch)(address, {
      method: "HEAD",
      signal: scope.signal,
      cache: "no-store",
      credentials: "omit",
      redirect: "error",
    });
    scope.signal.throwIfAborted();
    if (!response.ok) throw new AutoFirmaError("network", `Time endpoint HTTP ${response.status}.`);
    const header = response.headers.get("Date");
    const serverTime = header === null ? NaN : Date.parse(header);
    if (!Number.isFinite(serverTime))
      throw new AutoFirmaError("protocol", "Missing or invalid server Date header.");
    const skewMs = Math.abs((options.now ?? Date.now)() - serverTime);
    return { valid: skewMs <= threshold, skewMs, serverTime };
  } finally {
    scope.dispose();
  }
}
