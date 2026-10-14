/** Opciones de codificacion Base64. */
export interface Base64Options {
  /** Usa el alfabeto URL-safe (`-` y `_` en lugar de `+` y `/`). Mantiene el relleno `=`. */
  readonly urlSafe?: boolean;
}

/** API nativa `Uint8Array.prototype.toBase64` (ES2026), si el entorno la ofrece. */
interface NativeToBase64 {
  toBase64(options: { alphabet: "base64" | "base64url" }): string;
}

/** API nativa `Uint8Array.fromBase64` (ES2026), si el entorno la ofrece. */
interface NativeFromBase64 {
  fromBase64(value: string): Uint8Array<ArrayBuffer>;
}

const CHUNK_SIZE = 0x8000;

/** Convierte Base64 estandar en Base64 URL-safe sin validar el contenido. */
export function toBase64UrlSafe(value: string): string {
  return value.replaceAll("+", "-").replaceAll("/", "_");
}

/** Convierte Base64 URL-safe en Base64 estandar sin validar el contenido. */
export function fromBase64UrlSafe(value: string): string {
  return value.replaceAll("-", "+").replaceAll("_", "/");
}

/** Codifica bytes en Base64. Usa la implementacion nativa del motor cuando existe. */
export function encodeBase64(bytes: Uint8Array, options: Base64Options = {}): string {
  const native = bytes as Uint8Array & Partial<NativeToBase64>;
  if (typeof native.toBase64 === "function")
    return native.toBase64({ alphabet: options.urlSafe ? "base64url" : "base64" });
  const chunks: string[] = [];
  for (let offset = 0; offset < bytes.length; offset += CHUNK_SIZE)
    chunks.push(
      String.fromCharCode.apply(
        null,
        bytes.subarray(offset, offset + CHUNK_SIZE) as unknown as number[],
      ),
    );
  const binary = chunks.join("");
  const value = btoa(binary);
  return options.urlSafe ? toBase64UrlSafe(value) : value;
}

/**
 * Decodifica Base64 estandar o URL-safe. Es tolerante como el decodificador original:
 * ignora saltos de linea y caracteres ajenos al alfabeto y completa el relleno.
 *
 * @throws {TypeError} Si la longitud de los datos no puede corresponder a Base64.
 */
export function decodeBase64(value: string): Uint8Array<ArrayBuffer> {
  let normalized = fromBase64UrlSafe(value).replace(/[^A-Za-z0-9+/]/g, "");
  const remainder = normalized.length % 4;
  if (remainder === 1) throw new TypeError("Los datos no son Base64 validos.");
  if (remainder !== 0) normalized += "=".repeat(4 - remainder);
  const native = Uint8Array as Uint8ArrayConstructor & Partial<NativeFromBase64>;
  if (typeof native.fromBase64 === "function") return native.fromBase64(normalized);
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}
