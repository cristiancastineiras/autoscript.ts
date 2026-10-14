// Cada prueba reproduce un error del autoscript.js original y comprueba que la reescritura lo corrige.
import { describe, expect, test } from "vitest";
import { base64ToText, encodeUtf8, textToBase64 } from "../../src/encoding/utf8.js";
import {
  createPage,
  invoke,
  params,
  type Flavor,
  type Page,
  type PageOptions,
} from "../support/harness.js";

function page(flavor: Flavor, options: Omit<PageOptions, "flavor"> = {}): Page {
  const created = createPage({ flavor, ...options });
  created.globals.SupportDialog.enableSupportDialog(false);
  return created;
}

describe("errores del original corregidos", () => {
  test("getErrorType/getErrorCode con WebSocket (export duplicado)", async () => {
    const results: Record<Flavor, unknown[]> = { original: [], modern: [] };
    for (const flavor of ["original", "modern"] as const) {
      const current = page(flavor, { native: { results: ["err-11:=AS500001 - Cancelada"] } });
      const { AutoScript } = current.globals;
      AutoScript.cargarAppAfirma();
      await invoke(current, (ok, ko) => AutoScript.sign("QQ==", "SHA256", "CAdES", null, ok, ko));
      let code: unknown;
      try {
        code = AutoScript.getErrorCode();
      } catch (error) {
        code = (error as Error).name;
      }
      results[flavor] = [AutoScript.getErrorType(), code];
    }
    expect(results.original).toEqual(["AS500001", "TypeError"]);
    expect(results.modern).toEqual([
      "es.gob.afirma.core.AOCancelledOperationException",
      "AS500001",
    ]);
  });

  test("setServiceTimeout con el canal HTTPS (ReferenceError)", async () => {
    const outcomes: Record<Flavor, string> = { original: "", modern: "" };
    for (const flavor of ["original", "modern"] as const) {
      const current = page(flavor, { websocket: false, native: { results: ["Q0VS|RklS"] } });
      const { AutoScript } = current.globals;
      AutoScript.cargarAppAfirma();
      AutoScript.setServiceTimeout(30_000);
      try {
        const result = await invoke(current, (ok, ko) =>
          AutoScript.sign("QQ==", "SHA256", "CAdES", null, ok, ko),
        );
        outcomes[flavor] = String(result.args[0]);
      } catch (error) {
        outcomes[flavor] = (error as Error).name;
      }
    }
    expect(outcomes).toEqual({ original: "ReferenceError", modern: "RklS" });
  });

  test("lote XML por servidor intermedio (dataB64 no declarada)", async () => {
    const outcomes: Record<Flavor, unknown> = { original: null, modern: null };
    for (const flavor of ["original", "modern"] as const) {
      // Sin WebCrypto el original falla de forma sincrona y el error se puede capturar.
      const current = page(flavor, {
        secure: false,
        native: { intermediate: { fields: [encodeUtf8("<signs/>"), encodeUtf8("CERT")] } },
      });
      const { AutoScript } = current.globals;
      AutoScript.setForceWSMode(true);
      AutoScript.cargarAppAfirma();
      try {
        const result = await invoke(current, (ok, ko) =>
          AutoScript.signBatch(
            textToBase64("<signbatch/>"),
            "https://a/pre",
            "https://a/post",
            null,
            ok,
            ko,
          ),
        );
        outcomes[flavor] = result.ok ? result.args[1] : result.args[0];
      } catch (error) {
        outcomes[flavor] = (error as Error).name;
      }
    }
    expect(outcomes).toEqual({ original: "ReferenceError", modern: textToBase64("CERT") });
  });

  test("setAppName: condicion invertida y doble codificacion", async () => {
    const appnames: Record<Flavor, (string | undefined)[]> = { original: [], modern: [] };
    for (const flavor of ["original", "modern"] as const) {
      const current = page(flavor, { native: { results: ["Q0VS|RklS"], intermediate: {} } });
      const { AutoScript } = current.globals;
      AutoScript.setAppName("Sede & Registro");
      AutoScript.cargarAppAfirma();
      await invoke(current, (ok, ko) => AutoScript.sign("QQ==", "SHA256", "CAdES", null, ok, ko));
      appnames[flavor].push(params(current.capture.socketMessages[1]!).get("appname"));
      AutoScript.setForceWSMode(true);
      AutoScript.cargarAppAfirma();
      await invoke(current, (ok, ko) => AutoScript.sign("QQ==", "SHA256", "CAdES", null, ok, ko));
      appnames[flavor].push(params(current.capture.launches.at(-1)!).get("appname"));
    }
    expect(appnames.original).toEqual(["sede.example.gob.es", "Sede%20%26%20Registro"]);
    expect(appnames.modern).toEqual(["Sede & Registro", "Sede & Registro"]);
  });

  test("enableProgressDialog(false) en servidor intermedio", async () => {
    const dlgload: Record<Flavor, string | undefined> = { original: undefined, modern: undefined };
    for (const flavor of ["original", "modern"] as const) {
      const current = page(flavor, { native: { intermediate: {} } });
      const { AutoScript } = current.globals;
      AutoScript.enableProgressDialog(false);
      AutoScript.setForceWSMode(true);
      AutoScript.cargarAppAfirma();
      await invoke(current, (ok, ko) => AutoScript.selectCertificate(null, ok, ko));
      dlgload[flavor] = params(current.capture.launches[0]!).get("dlgload");
    }
    expect(dlgload).toEqual({ original: undefined, modern: "false" });
  });

  test("UTF-8 fuera del plano basico y saltos de linea CRLF", () => {
    const text = "Firma \u{1F58B}\r\nfin";
    const original = page("original").globals.AutoScript;
    const modern = page("modern").globals.AutoScript;
    expect(original.getTextFromBase64(original.getBase64FromText(text))).not.toBe(text);
    expect(modern.getTextFromBase64(modern.getBase64FromText(text))).toBe(text);
    expect(base64ToText(modern.getBase64FromText(text)!)).toBe(text);
  });

  test("XML de subida con valores que contienen &", async () => {
    const current = page("modern", { native: { intermediate: {} } });
    const { AutoScript } = current.globals;
    AutoScript.setForceWSMode(true);
    AutoScript.setServlets(
      "https://sede.example.gob.es/afirma-signature-storage/StorageService?a=1&b=2",
      "https://sede.example.gob.es/afirma-signature-retriever/RetrieveService",
    );
    AutoScript.cargarAppAfirma();
    await invoke(current, (ok, ko) =>
      AutoScript.sign(textToBase64("x".repeat(3000)), "SHA256", "CAdES", null, ok, ko),
    );
    expect(current.capture.uploads[0]).toContain("StorageService?a=1&amp;b=2");
    expect(() =>
      new current.window.DOMParser().parseFromString(current.capture.uploads[0]!, "text/xml"),
    ).not.toThrow();
  });
});
