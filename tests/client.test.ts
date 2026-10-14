import { describe, expect, it, vi } from "vitest";
import { AutoFirmaClient } from "../src/core/client.js";
import { deadline, delay } from "../src/core/lifecycle.js";
import { Batch } from "../src/core/batch.js";
import type { OperationContext, Transport } from "../src/core/types.js";

const sign = { data: "YQ==", algorithm: "SHA256withRSA", format: "CAdES" };
function transport(execute: Transport["execute"] = async () => "YQ==|Yg=="): Transport {
  return { kind: "websocket", execute, dispose: vi.fn() };
}

describe("client lifecycle", () => {
  it("rejects inconsistent results supplied by a client override", async () => {
    const client = new AutoFirmaClient(transport());
    const execute = vi.spyOn(client, "execute").mockResolvedValue({ saved: true });
    await expect(client.sign(sign)).rejects.toMatchObject({ kind: "protocol" });
    await expect(client.selectCertificate()).rejects.toMatchObject({ kind: "protocol" });
    await expect(client.signBatch({ data: "YQ==", json: true })).rejects.toMatchObject({
      kind: "protocol",
    });
    await expect(client.loadFiles()).rejects.toMatchObject({ kind: "protocol" });
    execute.mockResolvedValue({ signature: "YQ==", certificate: null, extraInfo: null });
    await expect(client.selectCertificate()).rejects.toMatchObject({ kind: "protocol" });
    client.dispose();
    const controller = new AbortController();
    const scope = deadline(100, controller.signal);
    controller.abort(null);
    expect(scope.signal.reason).toMatchObject({ kind: "cancelled" });
    scope.dispose();
  });
  it("executes sequential signatures, selection, batches and files", async () => {
    const adapter = transport(async (request) =>
      request.operation === "selectcert"
        ? "YQ=="
        : request.operation === "load"
          ? "a:YQ=="
          : request.operation === "save"
            ? "OK"
            : request.operation === "batch"
              ? "opaque"
              : "YQ==|Yg==",
    );
    const client = new AutoFirmaClient(adapter);
    for (const operation of [
      client.sign.bind(client),
      client.cosign.bind(client),
      client.counterSign.bind(client),
    ])
      expect(await operation(sign)).toMatchObject({ signature: "Yg==" });
    expect(
      await client.signAndSave({ ...sign, signOperation: "sign", filename: "a" }),
    ).toMatchObject({ signature: "Yg==" });
    expect(await client.selectCertificate()).toBe("YQ==");
    expect(await client.loadFiles()).toMatchObject({ files: [{ name: "a" }] });
    await client.saveDataToFile({ data: "YQ==" });
    expect(await client.signBatch({ data: "YQ==", json: false, local: true })).toMatchObject({
      result: "opaque",
    });
    expect(
      await client.signBatchProcess(
        new Batch("a", "b").add({ id: "a", datareference: "ref" }),
        true,
        { local: true },
      ),
    ).toMatchObject({ result: "opaque" });
    expect(client.config.timeoutMs).toBe(120_000);
    client.dispose();
    client.dispose();
    expect(adapter.dispose).toHaveBeenCalledTimes(1);
    await expect(client.sign(sign)).rejects.toMatchObject({ kind: "disposed" });
    expect(() => client.configure({ sticky: true })).toThrow();
  });
  it("rejects busy and configuration changes, snapshots inputs and resets sticky once", async () => {
    let captured: OperationContext | undefined;
    const adapter = transport(async (request, context) => {
      captured = context;
      await delay(20, context.signal);
      expect("properties" in request && request.properties).toEqual({ a: "b" });
      return "YQ==|Yg==";
    });
    const client = new AutoFirmaClient(adapter);
    client.configure({ sticky: true });
    const properties = { a: "b" };
    const active = client.sign({ ...sign, properties });
    properties.a = "changed";
    expect(client.busy).toBe(true);
    expect(() => client.configure({ sticky: false })).toThrow();
    await expect(client.sign(sign)).rejects.toMatchObject({ kind: "busy" });
    await active;
    expect(captured?.resetSticky).toBe(true);
    await client.sign({ ...sign, properties: { a: "b" } });
    expect(captured?.resetSticky).toBe(false);
  });
  it("finishes on timeout, abort or dispose and does not replay", async () => {
    const execute = vi.fn(async (_request, context: OperationContext) => {
      await delay(1000, context.signal);
      return "";
    });
    const client = new AutoFirmaClient(transport(execute), { timeoutMs: 5 });
    await expect(client.sign(sign)).rejects.toMatchObject({ kind: "timeout" });
    expect(client.busy).toBe(false);
    expect(client.lastError?.kind).toBe("timeout");
    client.configure({ timeoutMs: 1000 });
    const controller = new AbortController();
    const operation = client.sign(sign, { signal: controller.signal });
    controller.abort();
    await expect(operation).rejects.toMatchObject({ kind: "cancelled" });
    const active = client.sign(sign);
    client.dispose();
    await expect(active).rejects.toMatchObject({ kind: "cancelled" });
    expect(execute).toHaveBeenCalledTimes(3);
  });
  it("never sends an already aborted request", async () => {
    const execute = vi.fn();
    const controller = new AbortController();
    controller.abort();
    await expect(
      new AutoFirmaClient(transport(execute)).sign(sign, { signal: controller.signal }),
    ).rejects.toMatchObject({ kind: "cancelled" });
    expect(execute).not.toHaveBeenCalled();
    const scope = deadline(100, controller.signal);
    expect(scope.signal.aborted).toBe(true);
    scope.dispose();
  });
});
