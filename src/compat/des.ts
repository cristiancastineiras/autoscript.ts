import des from "des.js";
import { decodeBase64, encodeBase64, encodeUtf8 } from "../encoding/index.js";
import type { LegacyCipher } from "../transports/wire-crypto.js";

export function createLegacyDesCipher(key?: string): LegacyCipher {
  if (key === undefined) {
    let value: number;
    do {
      value = crypto.getRandomValues(new Uint32Array(1))[0]!;
    } while (value >= 4_200_000_000);
    key = String(value % 100_000_000).padStart(8, "0");
  }
  if (!/^\d{8}$/.test(key)) throw new TypeError("Legacy DES keys must contain eight ASCII digits.");
  const bytes = encodeUtf8(key);
  let disposed = false;
  const transform = (input: Uint8Array, type: "encrypt" | "decrypt"): Uint8Array => {
    if (disposed) throw new Error("Cipher is disposed.");
    if (input.length === 0) return new Uint8Array();
    const cipher = des.DES.create({ type, key: Array.from(bytes), padding: false });
    return new Uint8Array([...cipher.update(Array.from(input)), ...cipher.final()]);
  };
  return {
    key,
    encrypt(input) {
      const padding = (8 - (input.length % 8)) % 8;
      const padded = new Uint8Array(input.length + padding);
      padded.set(input);
      return `${padding}.${encodeBase64(transform(padded, "encrypt"), { urlSafe: true })}`;
    },
    decrypt(value, last) {
      if (!/^[0-7]\./.test(value)) throw new TypeError("Invalid DES envelope.");
      const encrypted = decodeBase64(value.slice(2), { urlSafe: true });
      if (encrypted.length === 0 || encrypted.length % 8 !== 0)
        throw new TypeError("Invalid DES block length.");
      const decoded = transform(encrypted, "decrypt");
      const trim = Number(value[0]) + (last ? 8 : 0);
      if (trim > decoded.length) throw new TypeError("Invalid DES padding.");
      return decoded.slice(0, decoded.length - trim);
    },
    dispose() {
      disposed = true;
      bytes.fill(0);
    },
  };
}
