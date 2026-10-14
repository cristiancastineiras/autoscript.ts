import { readFileSync } from "node:fs";
import vm from "node:vm";
import { describe, test } from "vitest";
import { desEncrypt } from "../src/crypto/des.js";
import { encodeBase64 } from "../src/encoding/base64.js";
import { textToBase64 } from "../src/encoding/utf8.js";

interface Original {
  readonly Base64: {
    encode(text: string, urlSafe?: boolean): string;
    encodeArrayBuffer(buffer: ArrayBuffer): string;
  };
  readonly Cipher: {
    des(key: string, message: string, encrypt: number, mode: number, iv: null): string;
  };
}

/** Codecs del autoscript.js original, evaluados aislados. */
const original = ((): Original => {
  const source = readFileSync(new URL("../Estudio/autoscript.js", import.meta.url), "utf8");
  const context = vm.createContext({ window: { btoa } });
  vm.runInContext(
    `${source.slice(source.indexOf("var Base64 = {"))}; this.Base64 = Base64; this.Cipher = Cipher;`,
    context,
  );
  return context as unknown as Original;
})();

const bytes = new Uint8Array(256 * 1024).map((_, index) => (index * 31) % 256);
const binary = String.fromCharCode(...bytes.subarray(0, 64 * 1024));
const text = "Firma electrónica con Autofirma · ".repeat(4096);
const key = new TextEncoder().encode("12345678");

describe("DES heredado, 64 KiB", () => {
  test("reescritura (Uint8Array)", async ({ bench }) => {
    await bench("desEncrypt", () => {
      desEncrypt(key, bytes.subarray(0, 64 * 1024));
    }).run();
  });
  test("original (cadenas binarias)", async ({ bench }) => {
    await bench("Cipher.des", () => {
      original.Cipher.des("12345678", binary, 1, 0, null);
    }).run();
  });
});

describe("Base64 de 256 KiB de bytes", () => {
  test("reescritura", async ({ bench }) => {
    await bench("encodeBase64", () => {
      encodeBase64(bytes);
    }).run();
  });
  test("original", async ({ bench }) => {
    await bench("Base64.encodeArrayBuffer", () => {
      original.Base64.encodeArrayBuffer(bytes.buffer);
    }).run();
  });
});

describe("Base64 de texto UTF-8 (~140 KB)", () => {
  test("reescritura", async ({ bench }) => {
    await bench("textToBase64", () => {
      textToBase64(text);
    }).run();
  });
  test("original", async ({ bench }) => {
    await bench("Base64.encode", () => {
      original.Base64.encode(text);
    }).run();
  });
});
