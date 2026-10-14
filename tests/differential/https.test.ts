import { describe, expect, test } from "vitest";
import { textToBase64 } from "../../src/encoding/utf8.js";
import {
  createPage,
  invoke,
  normalize,
  without,
  type Flavor,
  type NativeBehavior,
  type Outcome,
  type Page,
} from "../support/harness.js";

const CERT = "MIIC+certificado/A==";
const SIGNATURE = "MIIF+firma/B==";
const certUrl = CERT.replaceAll("+", "-").replaceAll("/", "_");
const signatureUrl = SIGNATURE.replaceAll("+", "-").replaceAll("/", "_");

interface Run {
  readonly page: Page;
  readonly outcome: Outcome;
}

async function both(
  native: NativeBehavior,
  scenario: (page: Page) => Promise<Outcome>,
): Promise<Record<Flavor, Run>> {
  const runs = {} as Record<Flavor, Run>;
  for (const flavor of ["original", "modern"] as const) {
    // Sin WebSocket, ambas implementaciones eligen el servicio HTTPS local.
    const page = createPage({ flavor, native, websocket: false });
    page.globals.SupportDialog.enableSupportDialog(false);
    page.globals.AutoScript.cargarAppAfirma();
    runs[flavor] = { page, outcome: await scenario(page) };
  }
  return runs;
}

/** Cuerpos enviados al servicio local, normalizados. */
function bodies(run: Run): string[] {
  return run.page.capture.http.map((exchange) =>
    exchange.body
      .replace(/idsession=[0-9a-zA-Z]{20}@EOF/, "idsession=ID@EOF")
      .replace(/^cmd=.*idsession/, "cmd=URL&idsession")
      .replace(/^fragment=@(\d+)@(\d+)@.*idsession/, "fragment=@$1@$2@URL&idsession"),
  );
}

function expectSameWire(runs: Record<Flavor, Run>): void {
  expect(runs.modern.page.capture.launches.map(normalize)).toEqual(
    runs.original.page.capture.launches.map(normalize),
  );
  expect(bodies(runs.modern)).toEqual(bodies(runs.original));
  expect(
    runs.modern.page.capture.socketMessages.map((url) => normalize(without(url, "appname"))),
  ).toEqual(runs.original.page.capture.socketMessages.map(normalize));
}

describe("HTTPS local: mismas peticiones y resultados que el original", () => {
  test("arranque afirma://service, eco y firma con respuesta por partes", async () => {
    const runs = await both({ results: [`${certUrl}|${signatureUrl}`] }, (page) =>
      invoke(page, (ok, ko) =>
        page.globals.AutoScript.sign("SGVsbG8+Pz8/", "SHA256", "CAdES", "mode=implicit", ok, ko),
      ),
    );
    expect(runs.modern.outcome.args.slice(0, 2)).toEqual(runs.original.outcome.args);
    expect(runs.modern.outcome.args).toEqual([SIGNATURE, CERT, null]);
    expect(runs.modern.page.capture.launches[0]).toMatch(/^afirma:\/\/service\?ports=/);
    expectSameWire(runs);
  });

  test("seleccion de certificado y guardado", async () => {
    const runs = await both({ results: [certUrl, "SAVE_OK"] }, async (page) => {
      const select = await invoke(page, (ok, ko) =>
        page.globals.AutoScript.selectCertificate("filters=nonexpired:", ok, ko),
      );
      const save = await invoke(page, (ok, ko) =>
        page.globals.AutoScript.saveDataToFile(
          "RGF0b3M=",
          "Guardar",
          "a.txt",
          "txt",
          "Texto",
          ok,
          ko,
        ),
      );
      return { ok: select.ok && save.ok, args: [select.args, save.args] };
    });
    expect(runs.modern.outcome).toEqual(runs.original.outcome);
    expectSameWire(runs);
  });

  test("peticiones de mas de 1 MiB se envian fragmentadas", async () => {
    const data = textToBase64("x".repeat(900_000));
    const runs = await both({ results: [`${certUrl}|${signatureUrl}`] }, (page) =>
      invoke(page, (ok, ko) => page.globals.AutoScript.sign(data, "SHA256", "CAdES", null, ok, ko)),
    );
    expect(runs.modern.outcome.args.slice(0, 2)).toEqual(runs.original.outcome.args);
    expect(bodies(runs.modern).filter((body) => body.startsWith("fragment="))).toHaveLength(2);
    expectSameWire(runs);
  });

  test("error nativo y cancelacion", async () => {
    const runs = await both(
      { results: ["err-21:=AS110003 - Error en la firma", "CANCEL"] },
      async (page) => {
        const first = await invoke(page, (ok, ko) =>
          page.globals.AutoScript.sign("QUJD", "SHA256", "CAdES", null, ok, ko),
        );
        const second = await invoke(page, (ok, ko) =>
          page.globals.AutoScript.sign("QUJD", "SHA256", "CAdES", null, ok, ko),
        );
        return { ok: false, args: [first.args, second.args] };
      },
    );
    expect(runs.modern.outcome).toEqual(runs.original.outcome);
  });
});
