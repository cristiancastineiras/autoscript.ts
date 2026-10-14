import type { ClientConfig } from "./types.js";

export interface AutoscriptConfig {
  readonly timeoutMs: number;
}

export function defineConfig(options: Partial<AutoscriptConfig> = {}): Readonly<AutoscriptConfig> {
  const timeoutMs = options.timeoutMs ?? 30_000;
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0)
    throw new RangeError("timeoutMs must be a positive safe integer.");
  return Object.freeze({ timeoutMs });
}

export function defineClientConfig(options: Partial<ClientConfig> = {}): ClientConfig {
  const config: ClientConfig = {
    timeoutMs: 120_000,
    maxResponseLength: 64 * 1024 * 1024,
    keyStore: null,
    sticky: false,
    appName: null,
    minimumVersion: null,
    serviceTimeoutMs: 0,
    progressDialog: true,
    ...options,
  };
  for (const value of [config.timeoutMs, config.maxResponseLength]) {
    if (!Number.isSafeInteger(value) || value <= 0)
      throw new RangeError("Limits must be positive safe integers.");
  }
  if (!Number.isSafeInteger(config.serviceTimeoutMs) || config.serviceTimeoutMs < 0)
    throw new RangeError("serviceTimeoutMs must be a nonnegative safe integer.");
  if (typeof config.sticky !== "boolean" || typeof config.progressDialog !== "boolean")
    throw new TypeError("Flags must be boolean.");
  return Object.freeze(config);
}
