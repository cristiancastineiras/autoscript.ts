import { describe, expect, it } from "vitest";
import {
  base64ToText,
  decodeBase64,
  decodeUtf8,
  encodeBase64,
  encodeUtf8,
  textToBase64,
} from "../src/encoding/index.js";

describe("encoding", () => {
  it.each(["", "ASCII", "\u00e1\u00f1", "\u{1f600}", "a\r\nb", "\ufefftext", "\0"])(
    "preserves %j",
    (text) => {
      expect(base64ToText(textToBase64(text))).toBe(text);
    },
  );
  it("corrects the legacy astral and URL-safe regressions", () => {
    expect(textToBase64("\u{1f600}")).toBe("8J+YgA==");
    expect(textToBase64("a\r\nb")).toBe("YQ0KYg==");
    expect(encodeBase64(new Uint8Array(6).fill(255), { urlSafe: true })).toBe("________");
    expect(encodeBase64(new Uint8Array([251, 239, 190]), { urlSafe: true })).toBe("----");
  });
  it.each([0, 1, 2, 3, 256, 100_003])("round-trips %i bytes", (length) => {
    const bytes = Uint8Array.from({ length }, (_, index) => index % 256);
    for (const urlSafe of [true, false])
      for (const padding of [true, false]) {
        const decoded = decodeBase64(encodeBase64(bytes, { urlSafe, padding }), { urlSafe });
        expect(decoded.length).toBe(bytes.length);
        expect(decoded.every((byte, index) => byte === bytes[index])).toBe(true);
      }
  });
  it.each(["A", "Zg=", "Zg===", "Zh==", "Zm9=", "=Zg", "Z g==", "_w==", "Zg==\n"])(
    "rejects %j",
    (value) => {
      expect(() => decodeBase64(value)).toThrow(TypeError);
    },
  );
  it("enforces alphabets, surrogate validity and strict UTF-8", () => {
    expect(() => decodeBase64("/w==", { urlSafe: true })).toThrow(TypeError);
    for (const value of ["\ud800", "\udc00", "\ud800a"])
      expect(() => encodeUtf8(value)).toThrow(TypeError);
    for (const value of [[255], [0xc0, 0xaf], [0xe2, 0x82]])
      expect(() => decodeUtf8(new Uint8Array(value))).toThrow(TypeError);
  });
});
