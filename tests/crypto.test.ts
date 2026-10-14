import { readFileSync } from "node:fs";
import { webcrypto } from "node:crypto";
import vm from "node:vm";
import { describe, expect, test } from "vitest";
import { desDecrypt, desEncrypt } from "../src/crypto/des.js";
import {
  aesCipher,
  aesDecipherFields,
  createAesConfig,
  desCipher,
  desDecipherFields,
  encodeCipherConfig,
  isDesField,
} from "../src/crypto/wire.js";
import { decodeBase64, encodeBase64 } from "../src/encoding/base64.js";
import { base64ToText, encodeUtf8 } from "../src/encoding/utf8.js";
import { nativeAes, nativeDes } from "./support/harness.js";

interface OriginalCipher {
  des(key: string, message: string, encrypt: number, mode: number, iv: null): string;
  stringToBase64(text: string): string;
  base64ToString(text: string): string;
}

const Cipher = (() => {
  const source = readFileSync(new URL("../Estudio/autoscript.js", import.meta.url), "utf8");
  const context = vm.createContext({});
  vm.runInContext(
    `${source.slice(source.indexOf("var Cipher = {"))}; this.Cipher = Cipher;`,
    context,
  );
  return (context as { Cipher: OriginalCipher }).Cipher;
})();

const binary = (bytes: Uint8Array): string => String.fromCharCode(...bytes);
const hex = (bytes: Uint8Array): string => Buffer.from(bytes).toString("hex");

describe("DES heredado", () => {
  test("vector conocido de FIPS 46", () => {
    const key = Buffer.from("133457799BBCDFF1", "hex");
    const plain = Buffer.from("0123456789ABCDEF", "hex");
    expect(hex(desEncrypt(key, plain))).toBe("85e813540f0ab405");
    expect(hex(desDecrypt(key, desEncrypt(key, plain)))).toBe("0123456789abcdef");
  });

  test("identico al Cipher.des del original (ECB, relleno de ceros)", () => {
    for (let length = 0; length < 130; length += 1) {
      const data = webcrypto.getRandomValues(new Uint8Array(length));
      const key = String(length * 7_654_321)
        .slice(0, 8)
        .padStart(8, "0");
      const expected = Cipher.des(key, binary(data), 1, 0, null);
      expect(binary(desEncrypt(encodeUtf8(key), data))).toBe(expected);
      expect(binary(desDecrypt(encodeUtf8(key), desEncrypt(encodeUtf8(key), data)))).toBe(
        Cipher.des(key, expected, 0, 0, null),
      );
    }
  });

  test("la clave debe tener 8 bytes", () => {
    expect(() => desEncrypt(new Uint8Array(7), new Uint8Array(8))).toThrow(RangeError);
  });

  test("formato de subida igual al cipherDES original", () => {
    const xml = encodeUtf8('<sign><e k="dat" v="QUJD"/></sign>');
    const expected = `${(8 - (xml.length % 8)) % 8}.${Cipher.stringToBase64(
      Cipher.des("12345678", binary(xml), 1, 0, null),
    )
      .replace(/\+/g, "-")
      .replace(/\//g, "_")}`;
    expect(desCipher(xml, "12345678")).toBe(expected);
  });

  test("descifra respuestas multi-campo recortando el ultimo bloque", () => {
    const fields = [encodeUtf8("certificado"), encodeUtf8("firma"), encodeUtf8("{}")];
    const encrypted = nativeDes(fields, "87654321").split("|");
    expect(encrypted.every(isDesField)).toBe(true);
    expect(desDecipherFields(encrypted, "87654321").map(base64ToText)).toEqual([
      "certificado",
      "firma",
      "{}",
    ]);
  });
});

describe("AES-256-CBC con WebCrypto", () => {
  test("configuracion compartida con Autofirma", () => {
    const config = createAesConfig(webcrypto as Crypto, "00001234");
    expect(decodeBase64(config.key!)).toHaveLength(32);
    expect(decodeBase64(config.iv!)).toHaveLength(16);
    expect(JSON.parse(base64ToText(encodeCipherConfig(config)))).toEqual({
      algo: "AES",
      key: config.key,
      iv: config.iv,
      legDes: "00001234",
    });
  });

  test("cifra subidas y descifra respuestas", async () => {
    const config = createAesConfig(webcrypto as Crypto, "00001234");
    const subtle = webcrypto.subtle as SubtleCrypto;
    const encrypted = await aesCipher(subtle, config, encodeUtf8("datos"));
    expect(isDesField(encrypted)).toBe(false);
    const fields = (
      await nativeAes([encodeUtf8("uno"), encodeUtf8("dos")], encodeCipherConfig(config))
    ).split("|");
    expect((await aesDecipherFields(subtle, config, fields)).map(base64ToText)).toEqual([
      "uno",
      "dos",
    ]);
  });

  test("errores de cifrado y descifrado con codigos AS200007/AS200008", async () => {
    const subtle = webcrypto.subtle as SubtleCrypto;
    const broken = {
      algo: "AES" as const,
      key: encodeBase64(new Uint8Array(5)),
      iv: "",
      legDes: "1",
    };
    await expect(aesCipher(subtle, broken, encodeUtf8("x"))).rejects.toMatchObject({
      code: "AS200007",
    });
    await expect(aesDecipherFields(subtle, broken, ["QUJD"])).rejects.toMatchObject({
      code: "AS200008",
    });
  });
});
