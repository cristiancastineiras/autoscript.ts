import { readFileSync } from "node:fs";
import vm from "node:vm";
import { describe, expect, test } from "vitest";
import {
  base64ToText,
  decodeBase64,
  decodeUtf8,
  encodeBase64,
  encodeUtf8,
  fromBase64UrlSafe,
  textToBase64,
  toBase64UrlSafe,
} from "../src/encoding/index.js";

/** Objeto Base64 del script original, evaluado aislado. */
const original = (() => {
  const source = readFileSync(new URL("../Estudio/autoscript.js", import.meta.url), "utf8");
  const start = source.indexOf("var Base64 = {");
  const end = source.indexOf("/** Paul Tero");
  const context = vm.createContext({ window: { btoa } });
  vm.runInContext(`${source.slice(start, end)}; this.Base64 = Base64;`, context);
  return (
    context as {
      Base64: {
        encode(text: string, urlSafe?: boolean): string;
        decode(text: string, urlSafe?: boolean): string;
      };
    }
  ).Base64;
})();

describe("Base64", () => {
  test("codifica bytes con relleno en ambos alfabetos", () => {
    expect(encodeBase64(new Uint8Array([]))).toBe("");
    expect(encodeBase64(new Uint8Array([0xfb]))).toBe("+w==");
    expect(encodeBase64(new Uint8Array([0xfb, 0xff]), { urlSafe: true })).toBe("-_8=");
    expect(encodeBase64(new Uint8Array(6).fill(0xff), { urlSafe: true })).toBe("________");
  });

  test("todos los valores de byte hacen ida y vuelta", () => {
    const bytes = Uint8Array.from({ length: 256 }, (_, index) => index);
    for (const urlSafe of [false, true])
      expect(decodeBase64(encodeBase64(bytes, { urlSafe }))).toEqual(bytes);
  });

  test("datos grandes se codifican por bloques", () => {
    const bytes = new Uint8Array(200_000).map((_, index) => index % 251);
    expect(decodeBase64(encodeBase64(bytes))).toEqual(bytes);
  });

  test("decodifica de forma tolerante como el original", () => {
    expect(decodeUtf8(decodeBase64("SG9s\r\nYQ"))).toBe("Hola");
    expect(decodeUtf8(decodeBase64("SG9sYQ=="))).toBe("Hola");
    expect(decodeBase64("-_8")).toEqual(new Uint8Array([0xfb, 0xff]));
    expect(() => decodeBase64("A")).toThrow(TypeError);
  });

  test("conversion entre alfabetos", () => {
    expect(toBase64UrlSafe("a+b/c=")).toBe("a-b_c=");
    expect(fromBase64UrlSafe("a-b_c=")).toBe("a+b/c=");
  });
});

describe("UTF-8", () => {
  test("coincide con el original en el plano basico", () => {
    for (const text of [
      "",
      "Hola",
      "ñandú",
      "Generalitat Valenciana · Català",
      "€ 漢字",
      "a=b\nc=d",
    ]) {
      expect(textToBase64(text)).toBe(original.encode(text));
      expect(textToBase64(text, { urlSafe: true })).toBe(original.encode(text, true));
      expect(base64ToText(original.encode(text))).toBe(text);
    }
  });

  test("corrige los caracteres fuera del plano basico (H08)", () => {
    expect(textToBase64("\u{1F600}")).toBe("8J+YgA==");
    expect(original.encode("\u{1F600}")).toBe("7aC97biA");
    expect(base64ToText("8J+YgA==")).toBe("\u{1F600}");
  });

  test("no altera los saltos de linea CRLF (H09)", () => {
    expect(base64ToText(textToBase64("a\r\nb"))).toBe("a\r\nb");
    expect(original.decode(original.encode("a\r\nb"))).toBe("a\nb");
  });

  test("encodeUtf8 y decodeUtf8 son simetricos", () => {
    expect(decodeUtf8(encodeUtf8("¿Qué tal?"))).toBe("¿Qué tal?");
  });
});
