export interface LocalTransportOptions {
  readonly ports?: readonly number[];
  readonly launch?: (url: string) => void;
  readonly launchDelayMs?: number;
  readonly retryDelayMs?: number;
  readonly retries?: number;
  readonly probeTimeoutMs?: number;
}

export function randomSession(): string {
  const alphabet = "1234567890abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

export function localPorts(ports?: readonly number[]): readonly number[] {
  if (ports !== undefined) {
    if (
      ports.length === 0 ||
      ports.length > 3 ||
      new Set(ports).size !== ports.length ||
      ports.some((port) => !Number.isInteger(port) || port < 1024 || port > 65535)
    )
      throw new RangeError("Provide one to three distinct ports in [1024, 65535].");
    return Object.freeze([...ports]);
  }
  const selected = new Set<number>();
  while (selected.size < 3)
    selected.add(49152 + (crypto.getRandomValues(new Uint16Array(1))[0]! % 16384));
  return Object.freeze([...selected]);
}

export function localLaunch(
  kind: "websocket" | "service",
  ports: readonly number[],
  session: string,
  progress: boolean,
): string {
  return `afirma://${kind}?ports=${ports.join(",")}&v=4&jvc=4&idsession=${session}${progress ? "" : "&dlgload=false"}`;
}
