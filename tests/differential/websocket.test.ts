import { describe, expect, test } from "vitest";
import { base64ToText, textToBase64 } from "../../src/encoding/utf8.js";
import {
  createPage,
  FIREFOX_UA,
  invoke,
  normalize,
  params,
  without,
  type Flavor,
  type NativeBehavior,
  type Outcome,
  type Page,
} from "../support/harness.js";

const b64url = (text: string): string => textToBase64(text, { urlSafe: true });
const CERT = "MIIC+certificado/A==";
const SIGNATURE = "MIIF+firma/B==";
const certUrl = CERT.replaceAll("+", "-").replaceAll("/", "_");
const signatureUrl = SIGNATURE.replaceAll("+", "-").replaceAll("/", "_");

interface Run {
  readonly page: Page;
  readonly outcome: Outcome;
}

/** Ejecuta el mismo escenario con el script original y con la reescritura. */
async function both(
  native: NativeBehavior,
  scenario: (page: Page) => Promise<Outcome>,
  options: { readonly userAgent?: string; readonly setup?: (page: Page) => void } = {},
): Promise<Record<Flavor, Run>> {
  const runs = {} as Record<Flavor, Run>;
  for (const flavor of ["original", "modern"] as const) {
    const page = createPage({
      flavor,
      native,
      ...(options.userAgent ? { userAgent: options.userAgent } : {}),
    });
    page.globals.SupportDialog.enableSupportDialog(false);
    page.globals.AutoScript.cargarAppAfirma();
    options.setup?.(page);
    runs[flavor] = { page, outcome: await scenario(page) };
  }
  return runs;
}

/** Mensajes del socket normalizados; la reescritura siempre envia `appname` (correccion H11). */
function messages(run: Run): string[] {
  return run.page.capture.socketMessages.map((message) => normalize(without(message, "appname")));
}

function expectSameWire(runs: Record<Flavor, Run>): void {
  expect(runs.modern.page.capture.launches.map(normalize)).toEqual(
    runs.original.page.capture.launches.map(normalize),
  );
  expect(messages(runs.modern)).toEqual(messages(runs.original));
}

describe("WebSocket: mismas peticiones y resultados que el original", () => {
  test("firma con datos, parametros y respuesta cert|firma|extra", async () => {
    const result = `${certUrl}|${signatureUrl}|${b64url('{"filename":"doc.pdf"}')}`;
    const runs = await both({ results: [result] }, (page) =>
      invoke(page, (ok, ko) =>
        page.globals.AutoScript.sign(
          "SGVsbG8+Pz8/",
          "SHA512withRSA",
          "CAdES",
          "mode=implicit\nserverUrl=https://sede.example.gob.es/afirma",
          ok,
          ko,
        ),
      ),
    );
    expect(runs.modern.outcome).toEqual(runs.original.outcome);
    expect(runs.modern.outcome.args).toEqual([SIGNATURE, CERT, '{"filename":"doc.pdf"}']);
    expectSameWire(runs);
    const sent = params(runs.modern.page.capture.socketMessages[1]!);
    expect(sent.get("appname")).toBe("sede.example.gob.es");
    expect(params(runs.original.page.capture.socketMessages[1]!).has("appname")).toBe(false);
  });

  test("respuesta #wait seguida de una firma sin certificado", async () => {
    const runs = await both({ results: ["#wait", b64url(signatureUrl)] }, (page) =>
      invoke(page, (ok, ko) => page.globals.AutoScript.sign(null, "SHA256", "PAdES", null, ok, ko)),
    );
    expect(runs.modern.outcome).toEqual(runs.original.outcome);
    expect(runs.modern.outcome.args[0]).toBe(SIGNATURE);
    expectSameWire(runs);
    expect(runs.modern.page.capture.socketMessages.at(-1)).toMatch(/^getresult\?idsession=/);
  });

  test("cofirma (coSign con 7 argumentos y cosign con 6) y contrafirma", async () => {
    for (const call of [
      (page: Page, ok: () => void, ko: () => void) =>
        page.globals.AutoScript.coSign("U0lH", "REFUT1M=", "SHA256", "AUTO", "a=1", ok, ko),
      (page: Page, ok: () => void, ko: () => void) =>
        page.globals.AutoScript.cosign("U0lH", "SHA256", "AUTO", "a=1", ok, ko),
      (page: Page, ok: () => void, ko: () => void) =>
        page.globals.AutoScript.counterSign("U0lH", "SHA256", "XAdES", "target=leafs", ok, ko),
    ]) {
      const runs = await both({ results: [`${certUrl}|${signatureUrl}`] }, (page) =>
        invoke(page, (ok, ko) => call(page, ok, ko)),
      );
      expect(runs.modern.outcome).toEqual(runs.original.outcome);
      expectSameWire(runs);
    }
  });

  test("seleccion de certificado con almacen y certificado fijado", async () => {
    const runs = await both(
      { results: [certUrl, `${certUrl}|${signatureUrl}`] },
      async (page) => {
        const first = await invoke(page, (ok, ko) =>
          page.globals.AutoScript.selectCertificate("filters=nonexpired:", ok, ko),
        );
        const second = await invoke(page, (ok, ko) =>
          page.globals.AutoScript.sign("QUJD", "SHA256", "CAdES", null, ok, ko),
        );
        return { ok: first.ok && second.ok, args: [...first.args, ...second.args] };
      },
      {
        setup: (page) => {
          page.globals.AutoScript.setKeyStore(page.globals.AutoScript.KEYSTORE_WINDOWS);
          page.globals.AutoScript.setStickySignatory(true);
        },
      },
    );
    expect(runs.modern.outcome).toEqual(runs.original.outcome);
    expectSameWire(runs);
    // El socket se reutiliza: una sola invocacion de la aplicacion para dos operaciones.
    expect(runs.modern.page.capture.launches).toHaveLength(1);
    const [, select, , sign] = runs.modern.page.capture.socketMessages;
    expect(params(select!).get("resetsticky")).toBe("true");
    expect(params(sign!).has("resetsticky")).toBe(false);
  });

  test("Firefox usa el almacen de Mozilla por defecto", async () => {
    const runs = await both(
      { results: [certUrl] },
      (page) => invoke(page, (ok, ko) => page.globals.AutoScript.selectCertificate(null, ok, ko)),
      { userAgent: FIREFOX_UA },
    );
    expectSameWire(runs);
    expect(base64ToText(params(runs.modern.page.capture.socketMessages[1]!).get("ksb64")!)).toBe(
      "MOZ_UNI",
    );
  });

  test("firma y guardado, guardado de datos y carga de ficheros", async () => {
    const runs = await both(
      {
        results: [
          `${certUrl}|${signatureUrl}`,
          "SAVE_OK",
          `contrato.pdf:${signatureUrl}`,
          `a.xml:${certUrl}|b.xml:${signatureUrl}`,
        ],
      },
      async (page) => {
        const AutoScript = page.globals.AutoScript;
        const results = [
          await invoke(page, (ok, ko) =>
            AutoScript.signAndSaveToFile(
              "cosign",
              "U0lH",
              "SHA256",
              "CAdES",
              "",
              "firma.csig",
              ok,
              ko,
            ),
          ),
          await invoke(page, (ok, ko) =>
            AutoScript.saveDataToFile("RGF0b3M=", "Guardar", "datos.txt", "txt", "Texto", ok, ko),
          ),
          await invoke(page, (ok, ko) =>
            AutoScript.getFileNameContentBase64("Abrir", "pdf", "PDF", null, ok, ko),
          ),
          await invoke(page, (ok, ko) =>
            AutoScript.getMultiFileNameContentBase64("Abrir", "xml", "XML", "C:\\", ok, ko),
          ),
        ];
        return {
          ok: results.every((result) => result.ok),
          args: results.map((result) => result.args),
        };
      },
    );
    expect(runs.modern.outcome).toEqual(runs.original.outcome);
    expect(runs.modern.outcome.args).toEqual([
      [SIGNATURE, CERT, null],
      ["SAVE_OK"],
      ["contrato.pdf", SIGNATURE],
      [
        ["a.xml", "b.xml"],
        [CERT, SIGNATURE],
      ],
    ]);
    expectSameWire(runs);
  });

  test("lote JSON trifasico y local", async () => {
    const batchResult = b64url('{"signs":[{"id":"1","result":"DONE_AND_SAVED"}]}');
    const runs = await both(
      { results: [`${batchResult}|${certUrl}`, `${batchResult}|${certUrl}`] },
      async (page) => {
        const AutoScript = page.globals.AutoScript;
        AutoScript.createBatch("SHA512", "CAdES", "sign", "mode=implicit");
        AutoScript.addDocumentToBatch("1", "RW50cmFkYS50eHQ=");
        AutoScript.addDocumentToBatch("2", "RmlybWE=", "XAdES", "cosign", "format=XAdES Detached");
        const remote = await invoke(page, (ok, ko) =>
          AutoScript.signBatchProcess(
            true,
            "https://sede.example.gob.es/afirma-server-triphase-signer/presign",
            "https://sede.example.gob.es/afirma-server-triphase-signer/postsign",
            "filters=nonexpired:",
            ok,
            ko,
          ),
        );
        AutoScript.createBatch("SHA256", "PAdES", "sign", null);
        AutoScript.addDocumentToBatch("a", "UERG");
        AutoScript.setLocalBatchProcess(true);
        const local = await invoke(page, (ok, ko) =>
          AutoScript.signBatchProcess(false, null, null, null, ok, ko),
        );
        return { ok: remote.ok && local.ok, args: [remote.args, local.args] };
      },
    );
    expect(runs.modern.outcome).toEqual(runs.original.outcome);
    expect(runs.modern.outcome.args[0]).toEqual([
      { signs: [{ id: "1", result: "DONE_AND_SAVED" }] },
      CERT,
    ]);
    expectSameWire(runs);
    const json = JSON.parse(
      base64ToText(params(runs.modern.page.capture.socketMessages[1]!).get("dat")!),
    );
    expect(json).toEqual({
      algorithm: "SHA512",
      format: "CAdES",
      suboperation: "sign",
      extraparams: textToBase64("mode=implicit"),
      singlesigns: [
        { id: "1", datareference: "RW50cmFkYS50eHQ=" },
        {
          id: "2",
          datareference: "RmlybWE=",
          format: "XAdES",
          suboperation: "cosign",
          extraparams: textToBase64("format=XAdES Detached"),
        },
      ],
      stoponerror: true,
    });
  });

  test("lote XML heredado", async () => {
    const runs = await both({ results: [`${b64url("<signs/>")}|${certUrl}`] }, (page) =>
      invoke(page, (ok, ko) =>
        page.globals.AutoScript.signBatch(
          textToBase64("<signbatch/>"),
          "https://sede.example.gob.es/batchpresigner",
          "https://sede.example.gob.es/batchpostsigner",
          null,
          ok,
          ko,
        ),
      ),
    );
    expect(runs.modern.outcome).toEqual(runs.original.outcome);
    expectSameWire(runs);
  });

  test.each([
    ["err-11:=AS500001 - Operacion cancelada por el usuario"],
    ["err-12:=Fallo sin codigo"],
    ["CANCEL"],
    ["MEMORY_ERROR"],
    ["NULL"],
  ])("errores nativos: %s", async (response) => {
    const runs = await both({ results: [response] }, (page) =>
      invoke(page, (ok, ko) =>
        page.globals.AutoScript.sign("QUJD", "SHA256", "CAdES", null, ok, ko),
      ),
    );
    expect(runs.modern.outcome.ok).toBe(false);
    expect(runs.modern.outcome).toEqual(runs.original.outcome);
    const { AutoScript } = runs.modern.page.globals;
    expect(AutoScript.getErrorType()).toBe(runs.modern.outcome.args[0]);
    expect(AutoScript.getErrorMessage()).toBe(runs.modern.outcome.args[1]);
  });

  test("Autofirma no instalado: mismo error tras los reintentos", async () => {
    const runs = await both({ installed: false }, (page) =>
      invoke(page, (ok, ko) =>
        page.globals.AutoScript.sign("QUJD", "SHA256", "CAdES", null, ok, ko),
      ),
    );
    expect(runs.modern.outcome).toEqual({
      ok: false,
      args: [
        "es.gob.afirma.standalone.ApplicationNotFoundException",
        "Ha ocurrido un error al intentar invocar a la aplicacion nativa mediante websocket",
        "AS620017",
      ],
    });
    expect(runs.modern.outcome).toEqual(runs.original.outcome);
    expect(runs.modern.page.globals.AutoScript.getErrorCodeNumber()).toBe("620017");
  });
});
