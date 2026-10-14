import { describe, expect, test, vi } from "vitest";
import { createAutoFirmaClient, selectTransport } from "../src/browser/factory.js";
import { Batch } from "../src/core/batch.js";
import { AutoFirmaClient } from "../src/core/client.js";
import { AutoFirmaError } from "../src/core/errors.js";
import type { OperationDialogs } from "../src/core/types.js";
import { textToBase64 } from "../src/encoding/utf8.js";
import { WebSocketTransport } from "../src/transports/websocket.js";
import { b64url, fakeEnvironment, text } from "./support/fake-env.js";

const params = (url: string): URLSearchParams =>
  new URLSearchParams(url.slice(url.indexOf("?") + 1));

function dialogs(choices: boolean[] = []): OperationDialogs & { readonly calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    showLoading: () => calls.push("loading"),
    close: () => calls.push("close"),
    showError: (kind) => {
      calls.push(`error:${kind}`);
      return Promise.resolve(choices.shift() ?? false);
    },
    showInsecureContextWarning: () => {
      calls.push("insecure");
      return Promise.resolve();
    },
    isOpen: () => false,
  };
}

describe("AutoFirmaClient (API de promesas)", () => {
  test("firma, reutiliza el socket y devuelve resultados tipados", async () => {
    const env = fakeEnvironment({ socketResults: ["Q0VSVA|RklSTUE", "Q0VSVA"] });
    const client = createAutoFirmaClient({ environment: env, appName: "Sede" });
    expect(client.transport).toBe("websocket");
    await expect(
      client.sign({
        data: "QUJD",
        algorithm: "SHA256",
        format: "CAdES",
        extraParams: { mode: "implicit" },
      }),
    ).resolves.toEqual({ signature: "RklSTUE", certificate: "Q0VSVA", extraData: null });
    await expect(client.selectCertificate()).resolves.toBe("Q0VSVA");
    expect(env.launches).toHaveLength(1);
    const socket = env.sockets.find((candidate) => candidate.readyState === 1)!;
    expect(params(socket.sent[1]!).get("appname")).toBe("Sede");
    expect(client.busy).toBe(false);
  });

  test("una sola operacion activa", async () => {
    const env = fakeEnvironment({ socketResults: [] });
    const client = createAutoFirmaClient({ environment: env });
    const first = client.sign({ algorithm: "SHA256", format: "CAdES" });
    await expect(client.sign({ algorithm: "SHA256", format: "CAdES" })).rejects.toMatchObject({
      type: "java.lang.IllegalStateException",
    });
    client.abort();
    await expect(first).rejects.toMatchObject({ type: "java.lang.InterruptedException" });
  });

  test("AbortSignal aborta la espera y descarta el socket", async () => {
    const env = fakeEnvironment({ socketResults: [] });
    const client = createAutoFirmaClient({ environment: env });
    const controller = new AbortController();
    const pending = client.sign({
      algorithm: "SHA256",
      format: "CAdES",
      signal: controller.signal,
    });
    await vi.waitFor(() => expect(env.sockets.some((socket) => socket.sent.length > 1)).toBe(true));
    controller.abort("usuario");
    await expect(pending).rejects.toBeInstanceOf(AutoFirmaError);
    expect(client.lastError?.type).toBe("java.lang.InterruptedException");
    expect(env.sockets.every((socket) => socket.readyState === 3)).toBe(true);
  });

  test("Autofirma no instalado: el dialogo permite reintentar", async () => {
    const env = fakeEnvironment({ installed: false });
    const ui = dialogs([true, false]);
    const client = createAutoFirmaClient({ environment: env, dialogs: ui, connectionRetries: 2 });
    await expect(client.sign({ algorithm: "SHA256", format: "CAdES" })).rejects.toMatchObject({
      code: "AS620017",
      type: "es.gob.afirma.standalone.ApplicationNotFoundException",
    });
    expect(env.launches).toHaveLength(2);
    expect(ui.calls.filter((call) => call === "error:connecting-afirma")).toHaveLength(2);
  });

  test("Autofirma cierra el socket durante la operacion", async () => {
    const env = fakeEnvironment({ socketResults: [] });
    const client = createAutoFirmaClient({ environment: env });
    const pending = client.sign({ algorithm: "SHA256", format: "CAdES" });
    await vi.waitFor(() => expect(env.sockets.some((socket) => socket.sent.length > 1)).toBe(true));
    env.sockets.find((socket) => socket.readyState === 1)!.close();
    await expect(pending).rejects.toMatchObject({ code: "AS420002" });
  });

  test("cambiar de almacen o desactivar sticky envia resetsticky una vez", async () => {
    const env = fakeEnvironment({ socketResults: ["Q0VS", "Q0VS", "Q0VS"] });
    const client = createAutoFirmaClient({ environment: env, stickySignatory: true });
    client.configure({ keyStore: "PKCS12" });
    await client.selectCertificate();
    await client.selectCertificate();
    client.configure({ stickySignatory: false });
    await client.selectCertificate();
    const sent = env.sockets
      .find((socket) => socket.readyState === 1)!
      .sent.filter((m) => m.startsWith("afirma://"));
    expect(sent.map((message) => params(message).get("resetsticky"))).toEqual([
      "true",
      null,
      "true",
    ]);
  });

  test("operaciones de ficheros y lotes", async () => {
    const batchResult = b64url(
      '{"signs":[{"id":"1","result":"DONE_AND_SAVED","signature":"Rg=="}]}',
    );
    const env = fakeEnvironment({
      socketResults: [
        "f.txt:QQ",
        "a:QQ|b:Qg",
        "OK",
        `${batchResult}|Q0VS`,
        `${batchResult}|Q0VS`,
        "Q0VS|RklS",
      ],
    });
    const client = createAutoFirmaClient({ environment: env });
    await expect(client.loadFile()).resolves.toEqual({ name: "f.txt", data: "QQ" });
    await expect(client.loadFiles({ extensions: "pdf" })).resolves.toHaveLength(2);
    await expect(client.saveDataToFile({ data: "QQ==", fileName: "a.txt" })).resolves.toBe("OK");
    const batch = new Batch({ algorithm: "SHA256", format: "CAdES" }).add({
      id: "1",
      reference: "QQ==",
    });
    await expect(client.signBatch({ batch, local: true })).resolves.toMatchObject({
      result: { signs: [{ id: "1", signature: "Rg==" }] },
      certificate: "Q0VS",
    });
    await expect(
      client.signBatchXml({
        batch: textToBase64("<lote/>"),
        preSignerUrl: "https://a",
        postSignerUrl: "https://b",
      }),
    ).resolves.toMatchObject({ certificate: "Q0VS" });
    await expect(
      client.signAndSave({
        operation: "cosign",
        data: "U0lH",
        algorithm: "SHA256",
        format: "AUTO",
      }),
    ).resolves.toMatchObject({ signature: "RklS" });
  });

  test("las operaciones esperan a la comprobacion horaria", async () => {
    const env = fakeEnvironment({ socketResults: ["Q0VS"] });
    const client = createAutoFirmaClient({ environment: env });
    client.waitFor(
      Promise.reject(new AutoFirmaError("java.lang.IllegalStateException", "desfase")),
    );
    await expect(client.selectCertificate()).rejects.toMatchObject({ message: "desfase" });
    client.waitFor(null);
    await expect(client.selectCertificate()).resolves.toBe("Q0VS");
  });

  test("dispose libera el canal", async () => {
    const client = createAutoFirmaClient({ environment: fakeEnvironment() });
    client.dispose();
    client.dispose();
    await expect(client.selectCertificate()).rejects.toMatchObject({
      type: "java.lang.IllegalStateException",
    });
  });

  test("un resultado de otro tipo se rechaza", async () => {
    const env = fakeEnvironment({ socketResults: ["OK"] });
    const client = new AutoFirmaClient({ transport: new WebSocketTransport(), environment: env });
    await expect(client.loadFile()).rejects.toMatchObject({ code: "AS220006" });
  });

  test("comprobacion de servicios del servidor intermedio", async () => {
    const env = fakeEnvironment({
      fetch: (url) => text("OK", url.includes("Storage") ? 200 : 500),
    });
    const client = createAutoFirmaClient({ environment: env, transport: "intermediate" });
    await expect(client.checkServices(true)).resolves.toBe(false);
    expect(client.services).toEqual({ checked: true, failing: true, compatible: false });
    expect(env.requests.map((request) => request.url)).toEqual([
      "https://sede.gob.es/afirma-signature-storage/StorageService?op=check",
      "https://sede.gob.es/afirma-signature-retriever/RetrieveService?op=check",
    ]);
  });
});

describe("seleccion del canal", () => {
  test.each([
    [{}, false, "websocket"],
    [{ android: true }, false, "intermediate"],
    [{ ios: true }, false, "intermediate"],
    [{}, true, "intermediate"],
  ] as const)("plataforma %o, forzado %s: %s", (platform, force, expected) => {
    expect(selectTransport(fakeEnvironment({ platform }), force)).toBe(expected);
  });

  test("sin WebSocket se usa el servicio HTTPS local", () => {
    expect(
      createAutoFirmaClient({ environment: fakeEnvironment({ webSocket: false }) }).transport,
    ).toBe("https");
  });
});
