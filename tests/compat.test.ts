import { describe, expect, test } from "vitest";
import {
  createAutoScript,
  createLegacyBase64,
  installAutoScript,
} from "../src/compat/autoscript.js";
import { fakeEnvironment } from "./support/fake-env.js";
import { createPage, invoke } from "./support/harness.js";

describe("fachada AutoScript", () => {
  test("constantes, aliases y metodos obsoletos", () => {
    const { AutoScript, MiniApplet } = createAutoScript({
      environment: fakeEnvironment(),
      window: {},
    });
    expect(MiniApplet).toBe(AutoScript);
    expect(AutoScript.VERSION).toBe("1.10.1");
    expect(AutoScript.KEYSTORE_DNIE).toBe("DNIEJAVA");
    expect(AutoScript.CHECKTIME_OBLIGATORY).toBe("CT_OBLIGATORY");
    expect([AutoScript.JAVA_ARGUMENTS, AutoScript.SYSTEM_PROPERTIES]).toEqual([null, null]);
    expect(AutoScript.echo()).toBe("Cliente JavaScript");
    expect(AutoScript.isJNLP()).toBe(false);
    expect(AutoScript.needNativeAppInstalled()).toBe(true);
    expect(() => {
      AutoScript.setForceAFirma();
      AutoScript.setJnlpService();
    }).not.toThrow();
    expect([
      AutoScript.getErrorType(),
      AutoScript.getErrorMessage(),
      AutoScript.getErrorCode(),
    ]).toEqual(["", "", ""]);
    expect(AutoScript.getErrorCodeNumber()).toBeNull();
  });

  test("operar sin cargar Autofirma lanza un error claro", () => {
    const { AutoScript } = createAutoScript({ environment: fakeEnvironment(), window: {} });
    expect(() => AutoScript.sign("QQ==", "SHA256", "CAdES", null)).toThrow(/cargarAppAfirma/);
  });

  test("errores sincronos de los lotes, como el original", () => {
    const { AutoScript } = createAutoScript({ environment: fakeEnvironment(), window: {} });
    expect(() => AutoScript.signBatchProcess(false, null, null, null)).toThrow(
      /No hay ningun lote/,
    );
    expect(() => AutoScript.addDocumentToBatch("1", "QQ==")).toThrow(/No hay ningun lote/);
    AutoScript.createBatch("SHA256", "CAdES", "sign", null);
    expect(() => AutoScript.addDocumentToBatch("", "QQ==")).toThrow(/id o datareference/);
    AutoScript.addDocumentToBatch("1", "QQ==");
    expect(() => AutoScript.addDocumentToBatch("1", "Qg==")).toThrow(/ya existe en el lote/);
  });

  test("getCurrentLog devuelve el error AS500010", () => {
    const { AutoScript } = createAutoScript({ environment: fakeEnvironment(), window: {} });
    const calls: unknown[][] = [];
    AutoScript.getCurrentLog(null, (...args) => calls.push(args));
    expect(calls).toEqual([
      [
        "java.lang.UnsupportedOperationException",
        "El metodo JavaScript no se encuentra operativo",
        "AS500010",
      ],
    ]);
  });

  test("texto y Base64", () => {
    const { AutoScript } = createAutoScript({ environment: fakeEnvironment(), window: {} });
    expect(AutoScript.getBase64FromText("Año")).toBe("QcOxbw==");
    expect(AutoScript.getTextFromBase64("QcOxbw==")).toBe("Año");
    expect(AutoScript.getBase64FromText(null)).toBeNull();
    expect(AutoScript.getTextFromBase64(null)).toBeNull();
  });

  test("objeto Base64 global", () => {
    const Base64 = createLegacyBase64();
    expect(Base64.encode("a+?", true)).toBe("YSs_");
    expect(Base64.decode("YSs_", true)).toBe("a+?");
    expect(Base64.encodeArrayBuffer(new Uint8Array([0xfb, 0xff]).buffer, true)).toBe("-_8=");
    expect(Base64.encodeArrayBuffer(new DataView(new Uint8Array([1, 2, 3, 4]).buffer, 1, 2))).toBe(
      "AgM=",
    );
    expect(Base64.encodeByteArray([0xfb, 0xff])).toBe("+/8=");
  });

  test("descarga remota con callbacks independientes", async () => {
    const env = fakeEnvironment({
      fetch: (url) => new Response("datos", { status: url.endsWith("mal") ? 500 : 200 }),
    });
    const { AutoScript } = createAutoScript({ environment: env, window: {} });
    const results = await Promise.all(
      ["https://a.es/bien", "https://a.es/mal"].map(
        (url) =>
          new Promise((resolve) =>
            AutoScript.downloadRemoteData(
              url,
              (data) => resolve(data),
              (error) => resolve(error.message),
            ),
          ),
      ),
    );
    expect(results).toEqual(["ZGF0b3M=", "No se pudieron descargar los datos (HTTP 500)"]);
  });

  test("installAutoScript registra los globals", () => {
    const target: Record<string, unknown> = {};
    const globals = installAutoScript({ environment: fakeEnvironment(), window: target as never });
    expect(new Set(Object.keys(target))).toEqual(
      new Set(["AutoScript", "Base64", "MiniApplet", "SupportDialog"]),
    );
    expect(target["AutoScript"]).toBe(globals.AutoScript);
  });
});

describe("comprobacion horaria de la fachada", () => {
  test("CT_OBLIGATORY con desfase avisa y bloquea las operaciones", async () => {
    const page = createPage({ flavor: "modern", native: { results: ["Q0VS"] } });
    const window = page.window as unknown as { fetch: typeof fetch };
    window.fetch = async () =>
      new Response(null, { headers: { Date: new Date(Date.now() - 3_600_000).toUTCString() } });
    const { AutoScript } = page.globals;
    AutoScript.checkTime(AutoScript.CHECKTIME_OBLIGATORY, 60_000);
    AutoScript.cargarAppAfirma();
    const outcome = await invoke(page, (ok, ko) => AutoScript.selectCertificate(null, ok, ko));
    expect(outcome.ok).toBe(false);
    expect(page.capture.alerts[0]).toContain(
      "Debe corregir la hora de su sistema y recargar esta página",
    );
    expect(page.capture.alerts[0]).toContain("Hora del servidor");
    expect(page.capture.launches).toHaveLength(0);
    // Tras un desfase grave no se vuelve a cargar el cliente.
    AutoScript.cargarAppAfirma();
    expect(AutoScript.getErrorType()).toBe("java.lang.IllegalStateException");
  });

  test("CT_RECOMMENDED solo avisa; CT_NO no comprueba", async () => {
    const page = createPage({ flavor: "modern", native: { results: ["Q0VS"] } });
    const window = page.window as unknown as { fetch: typeof fetch };
    let requests = 0;
    window.fetch = async () => {
      requests += 1;
      return new Response(null, {
        headers: { Date: new Date(Date.now() - 3_600_000).toUTCString() },
      });
    };
    const { AutoScript } = page.globals;
    AutoScript.checkTime(AutoScript.CHECKTIME_NO);
    AutoScript.checkTime(AutoScript.CHECKTIME_RECOMMENDED, -1);
    expect(requests).toBe(0);
    AutoScript.checkTime(AutoScript.CHECKTIME_RECOMMENDED);
    AutoScript.cargarAppAfirma();
    await page.settle();
    expect(page.capture.alerts[0]).toContain("Se recomienda que se corrija");
  });
});
