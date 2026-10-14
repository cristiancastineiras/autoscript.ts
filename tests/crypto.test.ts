import { describe, expect, it } from "vitest";
import { createLegacyDesCipher } from "../src/compat/des.js";
import { createWireCipher } from "../src/transports/wire-crypto.js";
import { base64ToText, decodeBase64, encodeBase64, encodeUtf8 } from "../src/encoding/index.js";

describe("wire cryptography", () => {
  it("matches a known DES-ECB vector and preserves zero padding", () => {
    const cipher = createLegacyDesCipher("12345678");
    expect(cipher.encrypt(encodeUtf8("abcdefgh"))).toBe("0.lNRDa8O1tpM=");
    expect(cipher.encrypt(new Uint8Array())).toBe("0.");
    expect(() => cipher.decrypt(cipher.encrypt(new Uint8Array([1])), true)).toThrow();
    for (let length = 1; length < 17; length += 1) {
      const bytes = new Uint8Array(length).fill(33);
      expect(cipher.decrypt(cipher.encrypt(bytes), false)).toEqual(bytes);
    }
    const nativePayload = new Uint8Array(10).fill(0);
    nativePayload.set([65, 66]);
    expect(cipher.decrypt(cipher.encrypt(nativePayload), true)).toEqual(new Uint8Array([65, 66]));
    for (const value of ["x.payload", "0.AA==", "7."])
      expect(() => cipher.decrypt(value, true)).toThrow();
    cipher.dispose();
    expect(() => cipher.encrypt(new Uint8Array([1]))).toThrow();
    expect(() => createLegacyDesCipher("bad")).toThrow();
    expect(createLegacyDesCipher().key).toMatch(/^\d{8}$/);
  });
  it("round-trips AES and refuses implicit DES downgrade", async () => {
    const cipher = await createWireCipher();
    const descriptor = JSON.parse(
      base64ToText(cipher.parameters.find(([name]) => name === "cipher")![1]),
    );
    expect(descriptor.algo).toBe("AES");
    expect(decodeBase64(descriptor.key)).toHaveLength(32);
    const encrypted = await cipher.encrypt(encodeUtf8("test"), true);
    expect(await cipher.decryptFields([encrypted])).toEqual({
      fields: [encodeBase64(encodeUtf8("test"))],
      advanced: true,
    });
    await expect(cipher.encrypt(new Uint8Array(), false)).rejects.toMatchObject({
      kind: "unsupported",
    });
    await expect(cipher.decryptFields(["0.AAAAAA=="])).rejects.toMatchObject({
      kind: "unsupported",
    });
    await expect(cipher.decryptFields(["AA=="])).rejects.toThrow();
    cipher.dispose();
    await expect(createWireCipher(undefined, true)).rejects.toMatchObject({ kind: "unsupported" });
  });
  it("supports explicitly selected DES and the native last-block envelope", async () => {
    const cipher = await createWireCipher(() => createLegacyDesCipher("12345678"), true);
    const payload = new Uint8Array(9);
    payload[0] = 65;
    const encrypted = await cipher.encrypt(payload, false);
    expect(await cipher.decryptFields([encrypted])).toEqual({ fields: ["QQ=="], advanced: false });
    await expect(cipher.decryptFields(["AA=="])).rejects.toThrow();
    cipher.dispose();
  });
});
