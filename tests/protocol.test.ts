import { describe, expect, test } from "vitest";
import { Batch } from "../src/core/batch.js";
import { DEFAULT_SETTINGS } from "../src/core/client.js";
import { AutoFirmaError, parseNativeError } from "../src/core/errors.js";
import { textToBase64 } from "../src/encoding/utf8.js";
import type { OperationSettings, WireOperation } from "../src/protocol/operation.js";
import { isUrl, wireData } from "../src/protocol/operation.js";
import {
  addSignatoryCertificate,
  httpsUrl,
  intermediateOperationParams,
  intermediateParams,
  intermediateUrl,
  intermediateXml,
  launchUrl,
  serializeExtraParams,
  websocketUrl,
} from "../src/protocol/requests.js";
import {
  parseBatchResult,
  parseIntermediateFields,
  parseLocalResponse,
  SOCKET_CODES,
  WEBSOCKET_CODES,
} from "../src/protocol/responses.js";
import {
  newDesKey,
  newSessionId,
  normalizePortRange,
  randomPorts,
} from "../src/protocol/session.js";

const settings: OperationSettings = { ...DEFAULT_SETTINGS, resetSticky: false };
const sign: WireOperation = {
  kind: "sign",
  operation: "sign",
  data: "AB+/cd==",
  algorithm: "SHA256",
  format: "CAdES",
  extraParams: "mode=implicit",
};

describe("identificadores y puertos", () => {
  test("ids de sesion de 20 caracteres del alfabeto del protocolo", () => {
    const id = newSessionId(crypto);
    expect(id).toMatch(/^[0-9a-uw-zA-Z]{20}$/);
    expect(newDesKey(crypto)).toMatch(/^\d{8}$/);
  });

  test("normalizacion del rango de puertos como setPortRange", () => {
    expect(normalizePortRange(63117)).toEqual({ min: 63117, max: 63117 });
    expect(normalizePortRange(50000, 50010)).toEqual({ min: 50000, max: 50010 });
    expect(normalizePortRange(10, 99999)).toEqual({ min: 1024, max: 65535 });
    expect(normalizePortRange(60000, 59000)).toEqual({ min: 60000, max: 65535 });
    expect(normalizePortRange()).toEqual({ min: 1024, max: 65535 });
  });

  test("hasta tres puertos distintos dentro del rango", () => {
    expect(randomPorts(crypto, { min: 63117, max: 63117 })).toEqual([63117]);
    expect(new Set(randomPorts(crypto, { min: 50000, max: 50001 }))).toEqual(
      new Set([50000, 50001]),
    );
    const ports = randomPorts(crypto, null);
    expect(new Set(ports).size).toBe(3);
    for (const port of ports) expect(port).toBeGreaterThanOrEqual(49152);
  });
});

describe("peticiones", () => {
  test("datos: URL-safe sin saltos de linea; las URL se respetan", () => {
    expect(wireData("AB+/\r\ncd==")).toBe("AB-_cd==");
    expect(wireData("https://sede.gob.es/doc.pdf")).toBe("https://sede.gob.es/doc.pdf");
    expect(wireData("")).toBeNull();
    expect(isUrl("http://a")).toBe(true);
    expect(isUrl("aHR0cDo=")).toBe(false);
  });

  test("extraParams como objeto se serializan como Properties de Java", () => {
    expect(
      serializeExtraParams({
        mode: "implicit",
        signaturePages: 1,
        headless: true,
        omitted: null,
        path: "C:\\firmas\nnueva",
      }),
    ).toBe("mode=implicit\nsignaturePages=1\nheadless=true\npath=C:\\\\firmas\\nnueva");
    expect(serializeExtraParams("a=b")).toBe("a=b");
    expect(serializeExtraParams(undefined)).toBeNull();
  });

  test("URL WebSocket: valores Base64 sin codificar y version minima primero", () => {
    const url = websocketUrl(
      sign,
      { ...settings, keyStore: "WINDOWS", minimumClientVersion: "1.8", appName: "Mi sede & co" },
      "S".repeat(20),
      "sede.gob.es",
    );
    expect(url).toBe(
      `afirma://sign?mcv=1.8&op=sign&idsession=${"S".repeat(20)}&algorithm=SHA256&format=CAdES&properties=${textToBase64("mode=implicit", { urlSafe: true })}&ksb64=V0lORE9XUw==&sticky=false&appname=Mi%20sede%20%26%20co&dat=AB-_cd==`,
    );
  });

  test("URL WebSocket: datos por URL se codifican", () => {
    const url = websocketUrl(
      { ...sign, data: "https://sede.gob.es/a b.pdf" },
      settings,
      "S".repeat(20),
      null,
    );
    expect(url).toContain("dat=https%3A%2F%2Fsede.gob.es%2Fa%20b.pdf");
    expect(url).not.toContain("appname");
  });

  test("URL HTTPS: todos los valores codificados y almacen en claro", () => {
    const url = httpsUrl(
      sign,
      { ...settings, keyStore: "PKCS12", serviceTimeout: 0 },
      "sede.gob.es",
    );
    expect(url).toBe(
      `afirma://sign?op=sign&keystore=PKCS12&ksb64=UEtDUzEy&algorithm=SHA256&format=CAdES&properties=${encodeURIComponent(textToBase64("mode=implicit"))}&dat=AB-_cd%3D%3D&sticky=false&appname=sede.gob.es&servicetimeout=0`,
    );
  });

  test("URL de arranque de los canales locales", () => {
    expect(launchUrl("websocket", [1, 2], "ID", true)).toBe(
      "afirma://websocket?ports=1,2&v=4&jvc=4&idsession=ID",
    );
    expect(launchUrl("service", [3], "ID", false)).toBe(
      "afirma://service?ports=3&v=4&jvc=4&idsession=ID&dlgload=false",
    );
  });

  test("servidor intermedio: parametros comunes, Intent de Android y dlgload (H12)", () => {
    const params = intermediateParams(
      sign,
      intermediateOperationParams(sign, settings, { mobile: true, certificate: null }),
      {
        id: "I".repeat(20),
        appName: "sede.gob.es",
        desKey: "12345678",
        cipher: null,
        storage: "https://sede.gob.es/st",
        progressDialog: false,
        mobile: true,
      },
    );
    const url = intermediateUrl("sign", params, { minimumClientVersion: null }, true);
    expect(url.startsWith("intent://sign?jvc=4&format=CAdES&algorithm=SHA256")).toBe(true);
    expect(url).toContain("&dlgload=false");
    expect(url).not.toContain("&aw=");
    expect(url.endsWith("#Intent;scheme=afirma;package=es.gob.afirma;end")).toBe(true);
  });

  test("certificado fijado: en movil se envia sticky; en escritorio, un filtro", () => {
    const sticky = { ...settings, stickySignatory: true, resetSticky: true };
    expect(
      intermediateOperationParams(sign, sticky, { mobile: true, certificate: "C" }).map(
        (p) => p.key,
      ),
    ).toContain("resetsticky");
    expect(
      addSignatoryCertificate(
        "CERT",
        "filters=x\nfilter=y\nfilters.1=z\nheadless=false\nmode=implicit",
      ),
    ).toBe("mode=implicit\nfilters=encodedcert:CERT\nheadless=true");
  });

  test("XML del servidor intermedio escapado (H06)", () => {
    expect(
      intermediateXml("sign", [
        { key: "stservlet", value: 'https://a.es/?x=1&y="2"<' },
        { key: "omit", value: null },
      ]),
    ).toBe('<sign><e k="stservlet" v="https://a.es/?x=1&amp;y=&quot;2&quot;&lt;"/></sign>');
  });
});

describe("respuestas", () => {
  test("errores nativos", () => {
    expect(parseNativeError("CANCEL", WEBSOCKET_CODES)).toMatchObject({ code: "AS500001" });
    expect(parseNativeError("err-11:=AS500001 - Cancelado", WEBSOCKET_CODES)).toMatchObject({
      type: "es.gob.afirma.core.AOCancelledOperationException",
      code: "AS500001",
      message: "Cancelado",
    });
    expect(parseNativeError("err-20:= AS110001 - Con espacio", WEBSOCKET_CODES)).toMatchObject({
      code: "AS110001",
    });
    expect(parseNativeError("MEMORY_ERROR", SOCKET_CODES)).toMatchObject({ code: "AS620021" });
    expect(parseNativeError("NULL", SOCKET_CODES)).toMatchObject({ code: "AS620022" });
    expect(parseNativeError("SAF_03: fallo", WEBSOCKET_CODES)).toMatchObject({
      message: "SAF_03: fallo",
    });
    expect(parseNativeError("QUJD", WEBSOCKET_CODES)).toBeNull();
  });

  test("firma con y sin certificado", () => {
    expect(
      parseLocalResponse(sign, textToBase64("AB-_", { urlSafe: true }), WEBSOCKET_CODES),
    ).toEqual({
      type: "signature",
      signature: "AB+/",
      certificate: null,
      extraData: null,
    });
    expect(parseLocalResponse(sign, "C-_|S-_", WEBSOCKET_CODES)).toMatchObject({
      certificate: "C+/",
      signature: "S+/",
    });
  });

  test("ficheros, guardado y respuestas no validas", () => {
    const load: WireOperation = {
      kind: "load",
      multiple: false,
      title: null,
      extensions: null,
      description: null,
      filePath: null,
    };
    expect(parseLocalResponse(load, "a.txt:QU-_|b:Qg", WEBSOCKET_CODES)).toEqual({
      type: "files",
      files: [{ name: "a.txt", data: "QU+/" }],
    });
    expect(() => parseLocalResponse(load, "sin-separador", WEBSOCKET_CODES)).toThrow(
      AutoFirmaError,
    );
    const save: WireOperation = {
      kind: "save",
      data: "QQ==",
      title: null,
      fileName: null,
      extension: null,
      description: null,
    };
    expect(parseLocalResponse(save, "OK", WEBSOCKET_CODES)).toEqual({
      type: "saved",
      status: "OK",
    });
    expect(() => parseLocalResponse(save, "?", WEBSOCKET_CODES)).toThrow(/desconocido/);
  });

  test("lotes: JSON tolerante a ambos alfabetos o texto en lotes XML", () => {
    const json = textToBase64('{"signs":[{"id":"1","result":"SKIPPED"}]}', { urlSafe: true });
    expect(parseBatchResult(json)).toEqual({ signs: [{ id: "1", result: "SKIPPED" }] });
    expect(parseBatchResult("PHNpZ25zLz4=")).toBe("PHNpZ25zLz4=");
    const batch: WireOperation = {
      kind: "batch",
      json: true,
      data: "",
      preSignerUrl: null,
      postSignerUrl: null,
      extraParams: null,
      local: true,
    };
    expect(parseLocalResponse(batch, json, WEBSOCKET_CODES)).toMatchObject({ certificate: null });
    expect(parseIntermediateFields(batch, [textToBase64("{}"), "Q0VS"])).toEqual({
      type: "batch",
      result: {},
      certificate: "Q0VS",
    });
  });
});

describe("Batch", () => {
  test("valida ids y serializa como el original", () => {
    const batch = new Batch({ algorithm: "SHA256", format: "PAdES" });
    batch
      .add({ id: "1", reference: "" })
      .add({ id: "2", reference: "UkVG", extraParams: { a: 1 } });
    expect(batch.size).toBe(2);
    expect(() => batch.add({ id: "1", reference: "x" })).toThrow(/ya existe/);
    expect(() => batch.add({ id: "", reference: "x" })).toThrow(/id o datareference/);
    expect(batch.toJSON(true)).toEqual({
      algorithm: "SHA256",
      format: "PAdES",
      suboperation: "sign",
      singlesigns: [
        { id: "1", datareference: "" },
        { id: "2", datareference: "UkVG", extraparams: textToBase64("a=1") },
      ],
      stoponerror: true,
    });
    expect(() => new Batch({ algorithm: "", format: "CAdES" })).toThrow(TypeError);
  });
});
