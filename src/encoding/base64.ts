export interface Base64Options {
  readonly urlSafe?: boolean;
  readonly padding?: boolean;
}

export function encodeBase64(bytes: Uint8Array, options: Base64Options = {}): string {
  const chunks: string[] = [];
  for (let offset = 0; offset < bytes.length; offset += 16_384) {
    chunks.push(String.fromCharCode(...bytes.subarray(offset, offset + 16_384)));
  }
  let value = btoa(chunks.join(""));
  if (options.urlSafe) value = value.replaceAll("+", "-").replaceAll("/", "_");
  return options.padding === false ? value.replace(/=+$/, "") : value;
}

export function decodeBase64(value: string, options: Base64Options = {}): Uint8Array {
  const alphabet = options.urlSafe ? /^[\w-]*={0,2}$/ : /^[A-Za-z0-9+/]*={0,2}$/;
  const raw = value.replace(/=+$/, "");
  const padding = value.length - raw.length;
  const expected = (4 - (raw.length % 4)) % 4;
  if (!alphabet.test(value) || expected === 3 || (padding > 0 && padding !== expected)) {
    throw new TypeError("Invalid Base64 encoding.");
  }
  const binary = atob(raw.replaceAll("-", "+").replaceAll("_", "/") + "=".repeat(expected));
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  if (encodeBase64(bytes, { ...options, padding: false }) !== raw) {
    throw new TypeError("Noncanonical Base64 encoding.");
  }
  return bytes;
}
