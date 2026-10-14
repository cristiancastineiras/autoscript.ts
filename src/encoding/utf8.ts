import { decodeBase64, encodeBase64, type Base64Options } from "./base64.js";

let encoder: TextEncoder | undefined;
let decoder: TextDecoder | undefined;

/** Codifica texto en UTF-8 (los pares sustitutos se codifican correctamente). */
export function encodeUtf8(text: string): Uint8Array<ArrayBuffer> {
  encoder ??= new TextEncoder();
  return encoder.encode(text);
}

/** Decodifica UTF-8. Las secuencias invalidas se sustituyen por U+FFFD. */
export function decodeUtf8(bytes: Uint8Array): string {
  decoder ??= new TextDecoder();
  return decoder.decode(bytes);
}

/** Codifica texto como Base64 de sus bytes UTF-8. No altera los saltos de linea. */
export function textToBase64(text: string, options?: Base64Options): string {
  return encodeBase64(encodeUtf8(text), options);
}

/** Decodifica Base64 (estandar o URL-safe) que contiene texto UTF-8. */
export function base64ToText(value: string): string {
  return decodeUtf8(decodeBase64(value));
}
