import { AutoFirmaError, ERRORS, EXCEPTION } from "../core/errors.js";
import { decodeBase64, encodeBase64, fromBase64UrlSafe } from "../encoding/base64.js";
import { encodeUtf8, textToBase64 } from "../encoding/utf8.js";
import { desDecrypt, desEncrypt } from "./des.js";

/**
 * Configuracion de cifrado que se comparte con Autofirma para los datos que pasan por el
 * servidor intermedio. `legDes` es la clave DES heredada; `key` e `iv`, los de AES-256-CBC.
 */
export interface CipherConfig {
  readonly algo?: "AES";
  readonly key?: string;
  readonly iv?: string;
  readonly legDes: string;
}

const AES_CBC = "AES-CBC";

/** Crea una configuracion AES-256-CBC con clave e IV aleatorios (requiere WebCrypto). */
export function createAesConfig(crypto: Crypto, desKey: string): CipherConfig {
  return {
    algo: "AES",
    key: encodeBase64(crypto.getRandomValues(new Uint8Array(32))),
    iv: encodeBase64(crypto.getRandomValues(new Uint8Array(16))),
    legDes: desKey,
  };
}

/** Codifica la configuracion en el parametro `cipher` (JSON en Base64). */
export function encodeCipherConfig(config: CipherConfig): string {
  return textToBase64(
    JSON.stringify({ algo: config.algo, key: config.key, iv: config.iv, legDes: config.legDes }),
  );
}

/** Cifra con DES heredado: `relleno.base64url(DES-ECB(datos))`. */
export function desCipher(data: Uint8Array, desKey: string): string {
  const padding = (8 - (data.length % 8)) % 8;
  return `${padding}.${encodeBase64(desEncrypt(encodeUtf8(desKey), data), { urlSafe: true })}`;
}

/**
 * Descifra los campos DES heredados de una respuesta. Al ultimo campo se le retiran ademas
 * ocho bytes, como hace el script original para el formato de Autofirma.
 */
export function desDecipherFields(fields: readonly string[], desKey: string): string[] {
  const key = encodeUtf8(desKey);
  return fields.map((field, index) => {
    const dot = field.indexOf(".");
    const padding = Number.parseInt(field.slice(0, dot), 10) || 0;
    const plain = desDecrypt(key, decodeBase64(field.slice(dot + 1)));
    const trim = padding + (index === fields.length - 1 ? 8 : 0);
    return encodeBase64(plain.subarray(0, Math.max(0, plain.length - trim)));
  });
}

function aesKey(subtle: SubtleCrypto, config: CipherConfig): Promise<CryptoKey> {
  return subtle.importKey("raw", decodeBase64(config.key ?? ""), { name: AES_CBC }, false, [
    "encrypt",
    "decrypt",
  ]);
}

/** Cifra con AES-256-CBC. Devuelve Base64 estandar. */
export async function aesCipher(
  subtle: SubtleCrypto,
  config: CipherConfig,
  data: Uint8Array<ArrayBuffer>,
): Promise<string> {
  try {
    const key = await aesKey(subtle, config);
    const iv = decodeBase64(config.iv ?? "");
    return encodeBase64(new Uint8Array(await subtle.encrypt({ name: AES_CBC, iv }, key, data)));
  } catch (cause) {
    throw AutoFirmaError.from(EXCEPTION.GENERIC, ERRORS.CIPHERING_ERROR, { cause });
  }
}

/** Descifra con AES-256-CBC los campos de una respuesta. Devuelve Base64 estandar. */
export async function aesDecipherFields(
  subtle: SubtleCrypto,
  config: CipherConfig,
  fields: readonly string[],
): Promise<string[]> {
  try {
    const key = await aesKey(subtle, config);
    const iv = decodeBase64(config.iv ?? "");
    return await Promise.all(
      fields.map(async (field) => {
        const data = decodeBase64(fromBase64UrlSafe(field));
        return encodeBase64(new Uint8Array(await subtle.decrypt({ name: AES_CBC, iv }, key, data)));
      }),
    );
  } catch (cause) {
    throw AutoFirmaError.from(EXCEPTION.GENERIC, ERRORS.DECIPHERING_ERROR, { cause });
  }
}

/** Indica si un campo de respuesta usa el formato DES heredado (`relleno.datos`). */
export function isDesField(field: string): boolean {
  return field.includes(".");
}
