import { describe, expect, test } from "vitest";
import { base64ToText, encodeUtf8, textToBase64 } from "../../src/encoding/utf8.js";
import {
  createPage,
  invoke,
  normalize,
  params,
  type Flavor,
  type NativeBehavior,
  type Outcome,
  type Page,
} from "../support/harness.js";

const CERT = encodeUtf8("certificado-de-prueba");
const SIGNATURE = encodeUtf8("firma-de-prueba-con-mas-de-ocho-bytes");
const certB64 = textToBase64("certificado-de-prueba");
const signatureB64 = textToBase64("firma-de-prueba-con-mas-de-ocho-bytes");

interface Run {
  readonly page: Page;
  readonly outcome: Outcome;
}

async function both(
  native: NativeBehavior,
  scenario: (page: Page) => Promise<Outcome>,
  options: { readonly secure?: boolean; readonly setup?: (page: Page) => void } = {},
): Promise<Record<Flavor, Run>> {
  const runs = {} as Record<Flavor, Run>;
  for (const flavor of ["original", "modern"] as const) {
    const page = createPage({ flavor, native, secure: options.secure ?? true });
    page.globals.SupportDialog.enableSupportDialog(false);
    page.globals.AutoScript.setForceWSMode(true);
    page.globals.AutoScript.cargarAppAfirma();
    options.setup?.(page);
    runs[flavor] = { page, outcome: await scenario(page) };
  }
  return runs;
}

/** Peticiones HTTP a los servicios, normalizadas. */
function requests(run: Run): string[] {
  return run.page.capture.http.map(
    ({ method, url, body }) =>
      `${method} ${url} ${body.replace(/id=[0-9a-zA-Z]{20}/, "id=ID").replace(/&dat=.*/, "&dat=DATOS")}`,
  );
}

function expectSameWire(runs: Record<Flavor, Run>): void {
  expect(runs.modern.page.capture.launches.map(normalize)).toEqual(
    runs.original.page.capture.launches.map(normalize),
  );
  expect(requests(runs.modern)).toEqual(requests(runs.original));
  expect(runs.modern.page.capture.uploads.map(normalize)).toEqual(
    runs.original.page.capture.uploads.map(normalize),
  );
}

describe("Servidor intermedio: mismas peticiones y resultados que el original", () => {
  test("firma con cifrado AES, err-06 mientras no hay resultado y #wait", async () => {
    const runs = await both(
      { intermediate: { fields: [CERT, SIGNATURE], pending: 2, wait: 1 } },
      (page) =>
        invoke(page, (ok, ko) =>
          page.globals.AutoScript.sign("SGVsbG8+Pz8/", "SHA256", "CAdES", "mode=implicit", ok, ko),
        ),
    );
    expect(runs.modern.outcome).toEqual(runs.original.outcome);
    expect(runs.modern.outcome.args).toEqual([signatureB64, certB64, null]);
    expectSameWire(runs);
    const launch = params(runs.modern.page.capture.launches[0]!);
    expect(JSON.parse(base64ToText(launch.get("cipher")!))).toMatchObject({ algo: "AES" });
    expect(launch.get("appname")).toBe("sede.example.gob.es");
    expect(launch.get("aw")).toBe("true");
  });

  test("contexto sin WebCrypto: solo DES heredado", async () => {
    const runs = await both(
      { intermediate: { fields: [CERT, SIGNATURE, encodeUtf8('{"a":1}')] } },
      (page) =>
        invoke(page, (ok, ko) =>
          page.globals.AutoScript.counterSign("U0lH", "SHA256", "XAdES", null, ok, ko),
        ),
      { secure: false },
    );
    expect(runs.modern.outcome).toEqual(runs.original.outcome);
    expect(runs.modern.outcome.args).toEqual([signatureB64, certB64, '{"a":1}']);
    expect(params(runs.modern.page.capture.launches[0]!).has("cipher")).toBe(false);
    expectSameWire(runs);
  });

  test("datos grandes: subida cifrada DES y, tras negociar, AES", async () => {
    const data = textToBase64("documento ".repeat(400));
    const runs = await both(
      { intermediate: { fields: [CERT, SIGNATURE] } },
      async (page) => {
        const first = await invoke(page, (ok, ko) =>
          page.globals.AutoScript.sign(data, "SHA512", "PAdES", "signaturePages=1", ok, ko),
        );
        const second = await invoke(page, (ok, ko) =>
          page.globals.AutoScript.sign(data, "SHA512", "PAdES", "signaturePages=1", ok, ko),
        );
        return { ok: first.ok && second.ok, args: [first.args, second.args] };
      },
      { setup: (page) => page.globals.AutoScript.setMinimumClientVersion("1.8.2") },
    );
    expect(runs.modern.outcome).toEqual(runs.original.outcome);
    expectSameWire(runs);
    const uploads = runs.modern.page.capture.http.filter((exchange) =>
      exchange.body.startsWith("op=put"),
    );
    expect(uploads).toHaveLength(2);
    // Primera subida en DES (`relleno.datos`); la segunda en AES una vez negociado.
    expect(new URLSearchParams(uploads[0]!.body).get("dat")).toMatch(/^\d\./);
    expect(new URLSearchParams(uploads[1]!.body).get("dat")).not.toMatch(/^\d\./);
    expect(runs.modern.page.capture.uploads[0]).toContain('<e k="mcv" v="1.8.2"/>');
  });

  test("seleccion de certificado y certificado fijado en escritorio", async () => {
    const runs = await both(
      { intermediate: { fields: [CERT] } },
      async (page) => {
        const select = await invoke(page, (ok, ko) =>
          page.globals.AutoScript.selectCertificate(null, ok, ko),
        );
        const sign = await invoke(page, (ok, ko) =>
          page.globals.AutoScript.sign(
            "QUJD",
            "SHA256",
            "CAdES",
            "filters=old\nmode=implicit",
            ok,
            ko,
          ),
        );
        return { ok: select.ok, args: [select.args, sign.ok] };
      },
      { setup: (page) => page.globals.AutoScript.setStickySignatory(true) },
    );
    expect(runs.modern.outcome).toEqual(runs.original.outcome);
    expectSameWire(runs);
    const properties = base64ToText(
      params(runs.modern.page.capture.launches[1]!).get("properties")!,
    );
    expect(properties).toBe(`mode=implicit\nfilters=encodedcert:${certB64}\nheadless=true`);
  });

  test("guardado y carga de ficheros no disponible", async () => {
    const runs = await both({ intermediate: { raw: "OK" } }, async (page) => {
      const AutoScript = page.globals.AutoScript;
      const save = await invoke(page, (ok, ko) =>
        AutoScript.saveDataToFile("RGF0b3M=", "Guardar", "a.txt", "txt", "Texto", ok, ko),
      );
      const load = await invoke(page, (ok, ko) =>
        AutoScript.getFileNameContentBase64("Abrir", null, null, null, ok, ko),
      );
      return { ok: save.ok && !load.ok, args: [load.args] };
    });
    expect(runs.modern.outcome).toEqual(runs.original.outcome);
    expectSameWire(runs);
  });

  test("errores devueltos por el servicio", async () => {
    const runs = await both(
      { intermediate: { raw: "err-11:=AS500001 - Operacion cancelada por el usuario" } },
      (page) =>
        invoke(page, (ok, ko) =>
          page.globals.AutoScript.sign("QUJD", "SHA256", "CAdES", null, ok, ko),
        ),
    );
    expect(runs.modern.outcome).toEqual(runs.original.outcome);
  });
});
