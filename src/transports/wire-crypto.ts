import { AutoFirmaError } from "../core/errors.js";
import { decodeBase64, encodeBase64, textToBase64 } from "../encoding/index.js";
import type { Parameter } from "../protocol/request.js";

export interface LegacyCipher {
  readonly key: string;
  encrypt(bytes: Uint8Array): string;
  decrypt(value: string, last: boolean): Uint8Array;
  dispose(): void;
}
export interface DecodedFields {
  readonly fields: readonly string[];
  readonly advanced: boolean;
}
export interface WireCipher {
  readonly parameters: readonly Parameter[];
  encrypt(bytes: Uint8Array, advanced: boolean): Promise<string>;
  decryptFields(fields: readonly string[]): Promise<DecodedFields>;
  dispose(): void;
}

export async function createWireCipher(
  legacyFactory?: () => LegacyCipher,
  forceLegacy = false,
): Promise<WireCipher> {
  const legacy = legacyFactory?.();
  try {
    if (forceLegacy && !legacy)
      throw new AutoFirmaError("unsupported", "Legacy DES must be explicitly configured.");
    const subtle = forceLegacy ? null : globalThis.crypto?.subtle;
    if (!forceLegacy && !subtle)
      throw new AutoFirmaError("unsupported", "WebCrypto is required; no automatic DES downgrade.");
    const key = subtle
      ? await subtle.generateKey({ name: "AES-CBC", length: 256 }, true, ["encrypt", "decrypt"])
      : null;
    const exported = key && subtle ? new Uint8Array(await subtle.exportKey("raw", key)) : null;
    const iv = subtle ? crypto.getRandomValues(new Uint8Array(16)) : null;
    const parameters: Parameter[] = legacy ? [["key", legacy.key]] : [];
    if (exported && iv)
      parameters.push([
        "cipher",
        textToBase64(
          JSON.stringify({
            algo: "AES",
            key: encodeBase64(exported),
            iv: encodeBase64(iv),
            legDes: legacy?.key ?? null,
          }),
        ),
      ]);
    return {
      parameters,
      async encrypt(bytes, advanced) {
        if (advanced && subtle && key && iv)
          return encodeBase64(
            new Uint8Array(
              await subtle.encrypt({ name: "AES-CBC", iv }, key, new Uint8Array(bytes)),
            ),
            { urlSafe: true },
          );
        if (!legacy)
          throw new AutoFirmaError(
            "unsupported",
            "Initial large uploads require opt-in DES until AES support is negotiated.",
          );
        return legacy.encrypt(bytes);
      },
      async decryptFields(fields) {
        const decoded: string[] = [];
        let advanced = false;
        for (const [index, value] of fields.entries()) {
          if (/^[0-7]\./.test(value)) {
            if (!legacy)
              throw new AutoFirmaError(
                "unsupported",
                "Native client requested disabled DES compatibility.",
              );
            decoded.push(encodeBase64(legacy.decrypt(value, index === fields.length - 1)));
          } else {
            if (!subtle || !key || !iv)
              throw new AutoFirmaError("protocol", "Unexpected AES response.");
            const bytes = decodeBase64(value, { urlSafe: true });
            decoded.push(
              encodeBase64(
                new Uint8Array(
                  await subtle.decrypt({ name: "AES-CBC", iv }, key, new Uint8Array(bytes)),
                ),
              ),
            );
            advanced = true;
          }
        }
        return { fields: decoded, advanced };
      },
      dispose() {
        legacy?.dispose();
        exported?.fill(0);
        iv?.fill(0);
      },
    };
  } catch (error) {
    legacy?.dispose();
    throw error;
  }
}
