import { describe, expect, it } from "vitest";
import { defineClientConfig, defineConfig } from "../src/core/config.js";
import { Batch } from "../src/core/batch.js";
import { checkNativeError, normalizeError } from "../src/core/errors.js";
import { base64ToText, textToBase64 } from "../src/encoding/index.js";
import {
  buildOperationUrl,
  buildXml,
  operationParameters,
  serializeProperties,
} from "../src/protocol/request.js";
import { parseResponse } from "../src/protocol/response.js";
import type { OperationContext, OperationRequest } from "../src/core/types.js";

const request: OperationRequest = {
  operation: "sign",
  data: "//8=",
  algorithm: "SHA256withRSA",
  format: "CAdES",
  properties: "a=b",
};
const context: OperationContext = {
  config: defineClientConfig({ appName: "Mi app & %", serviceTimeoutMs: 500, keyStore: "PKCS12" }),
  resetSticky: true,
  signal: new AbortController().signal,
};

describe("pure protocol", () => {
  it("preserves config example and validates real config", () => {
    expect(defineConfig()).toEqual({ timeoutMs: 30_000 });
    expect(Object.isFrozen(defineClientConfig())).toBe(true);
    for (const options of [{ timeoutMs: 0 }, { maxResponseLength: NaN }, { serviceTimeoutMs: -1 }])
      expect(() => defineClientConfig(options)).toThrow(RangeError);
    expect(() => defineConfig({ timeoutMs: -1 })).toThrow(RangeError);
    expect(() => defineClientConfig({ sticky: null as unknown as boolean })).toThrow(TypeError);
  });
  it.each(["websocket", "https", "intermediate"] as const)(
    "serializes the %s dialect",
    (dialect) => {
      const parameters = operationParameters(request, context, dialect);
      expect(parameters).toContainEqual(["appname", "Mi app & %"]);
      expect(parameters).toContainEqual(["servicetimeout", "500"]);
      expect(parameters).toContainEqual(["dat", "__8="]);
      const url = buildOperationUrl(request.operation, parameters, "1.9", dialect);
      expect(url).toContain("mcv=1.9");
      expect(url).toContain("appname=Mi%20app%20%26%20%25");
      expect(url).toContain("sticky=false");
    },
  );
  it("does not mangle document references", () => {
    expect(
      operationParameters({ ...request, data: "https://host/a+b" }, context, "websocket"),
    ).toContainEqual(["dat", "https://host/a+b"]);
  });
  it("escapes XML attributes and rejects invalid roots and controls", () => {
    expect(buildXml("sign", [["a", '"&<\n\r\t>']])).toBe(
      '<sign><e k="a" v="&quot;&amp;&lt;&#10;&#13;&#9;&gt;"/></sign>',
    );
    expect(() => buildXml("sign/", [])).toThrow();
    expect(() => buildXml("sign", [["a", "\0"]])).toThrow();
    expect(() => buildOperationUrl("bad-op", [])).toThrow();
    expect(serializeProperties({ "a=b": "x\ny" })).toBe("a\\=b=x\\ny");
    expect(serializeProperties("a=b")).toBe("a=b");
  });
  it("uses independent indexed batch snapshots", () => {
    const document = { id: "one", datareference: "ref" };
    const batch = new Batch("SHA256withRSA", "CAdES").add(document);
    document.datareference = "changed";
    expect(batch.snapshot().singlesigns[0]?.datareference).toBe("ref");
    expect(() => batch.add(document)).toThrow();
    expect(JSON.parse(base64ToText(batch.encode(true)))).toMatchObject({ stoponerror: true });
    const parameters = new Batch("a", "b", "sign", "x=y").add({
      id: "a",
      datareference: "ref",
      extraparams: "z=w",
    });
    expect(JSON.parse(base64ToText(parameters.encode(false)))).toMatchObject({
      extraparams: textToBase64("x=y"),
      singlesigns: [{ extraparams: textToBase64("z=w") }],
    });
    expect(() => new Batch("a", "b").snapshot()).toThrow();
    expect(() => new Batch("", "b")).toThrow();
    expect(() => batch.add({ id: "", datareference: "ref" })).toThrow();
  });
  it("parses signatures without interpreting binary signatures as UTF-8", () => {
    expect(() => parseResponse(request, "", 100)).toThrow();
    expect(parseResponse(request, "YQ==|__8=|eyJhIjoxfQ==", 100)).toEqual({
      certificate: "YQ==",
      signature: "//8=",
      extraInfo: '{"a":1}',
    });
    expect(parseResponse(request, "__8=", 100)).toMatchObject({
      signature: "//8=",
      certificate: null,
    });
    expect(parseResponse(request, textToBase64("__8="), 100, true)).toMatchObject({
      signature: "//8=",
    });
    expect(() => parseResponse(request, "YQ==||", 100)).toThrow();
    expect(() => parseResponse(request, "YQ==", 1)).toThrow();
  });
  it("parses files, saved data, certificates and batch results", () => {
    expect(parseResponse({ operation: "load" }, "a.pdf:__8=", 100)).toEqual({
      files: [{ name: "a.pdf", data: "//8=" }],
    });
    expect(parseResponse({ operation: "selectcert" }, "YQ==", 100)).toEqual({
      certificate: "YQ==",
    });
    expect(parseResponse({ operation: "save", data: "YQ==" }, "SAVE_OK", 100)).toEqual({
      saved: true,
    });
    expect(() => parseResponse({ operation: "save", data: "" }, "bad", 100)).toThrow();
    expect(() => parseResponse({ operation: "load" }, "bad", 100)).toThrow();
    expect(() => parseResponse({ operation: "load" }, "a:YQ==|b:YQ==", 100)).toThrow();
    const batch: OperationRequest = { operation: "batch", data: "YQ==", json: true, local: true };
    expect(parseResponse(batch, `${textToBase64('{"signs":[] }')}|YQ==`, 100)).toEqual({
      result: { signs: [] },
      certificate: "YQ==",
    });
    expect(parseResponse(batch, "opaque", 100)).toEqual({ result: "opaque", certificate: null });
  });
  it("normalizes terminal native errors without stale codes", () => {
    for (const value of [
      "CANCEL",
      "NULL",
      "MEMORY_ERROR",
      "SAF_1",
      "err-11:= AS500001 - cancel",
      "err-01:= failed",
    ])
      expect(() => checkNativeError(value)).toThrow();
    expect(normalizeError(new Error("failed")).message).toBe("failed");
    const error = normalizeError("failed");
    expect(normalizeError(error)).toBe(error);
  });
  it("covers every operation dialect with defaults and explicit options", () => {
    const operations: OperationRequest[] = [
      { ...request, data: null, properties: "" },
      { operation: "cosign", data: "", algorithm: "a", format: "b" },
      {
        operation: "countersign",
        data: "YQ==",
        algorithm: "a",
        format: "b",
        properties: { a: true },
      },
      { ...request, operation: "signandsave", filename: "out", signOperation: "cosign" },
      { operation: "selectcert" },
      { operation: "batch", data: "YQ==", json: true, local: true },
      {
        operation: "batch",
        data: "YQ==",
        json: false,
        preSignerUrl: "https://pre",
        postSignerUrl: "https://post",
        properties: "",
      },
      { operation: "load" },
      {
        operation: "load",
        title: "a",
        extensions: "pdf",
        description: "b",
        filePath: "c",
        multiple: true,
      },
      {
        operation: "save",
        data: "YQ==",
        title: "a",
        filename: "b",
        extensions: "pdf",
        description: "c",
      },
    ];
    for (const config of [defineClientConfig(), context.config])
      for (const dialect of ["websocket", "https", "intermediate"] as const)
        for (const operation of operations) {
          expect(
            buildOperationUrl(
              operation.operation,
              operationParameters(operation, { ...context, config }, dialect),
              config.minimumVersion,
              dialect,
            ),
          ).toMatch(/^afirma:\/\//);
        }
    expect(() =>
      operationParameters({ ...request, algorithm: "" }, context, "websocket"),
    ).toThrow();
    expect(() =>
      operationParameters({ operation: "batch", data: "YQ==", json: true }, context, "https"),
    ).toThrow();
    expect(() =>
      operationParameters({ ...request, data: "https://user:pass@host" }, context, "https"),
    ).toThrow();
    expect(() =>
      operationParameters({ ...request, data: 3 as unknown as string }, context, "https"),
    ).toThrow();
    expect(() => buildXml("sign", [["a", "\ud800"]])).toThrow();
    expect(() => buildXml("sign", [["a", "\uffff"]])).toThrow();
  });
});
