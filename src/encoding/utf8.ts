import { decodeBase64, encodeBase64, type Base64Options } from "./base64.js";

export function encodeUtf8(text: string): Uint8Array {
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = text.charCodeAt(++index);
      if (!(next >= 0xdc00 && next <= 0xdfff)) throw new TypeError("Lone UTF-16 surrogate.");
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      throw new TypeError("Lone UTF-16 surrogate.");
    }
  }
  return new TextEncoder().encode(text);
}

export function decodeUtf8(bytes: Uint8Array): string {
  return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
}

export function textToBase64(text: string, options: Base64Options = {}): string {
  return encodeBase64(encodeUtf8(text), options);
}

export function base64ToText(value: string, options: Base64Options = {}): string {
  return decodeUtf8(decodeBase64(value, options));
}
