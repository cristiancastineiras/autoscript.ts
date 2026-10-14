import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { parseAst } from "rolldown/parseAst";

const require = createRequire(import.meta.url);

test("legacy export names match the primary reference AST", async () => {
  const text = readFileSync(new URL("../Estudio/autoscript.js", import.meta.url), "utf8");
  const source = parseAst(text, { sourceType: "script" });
  const inventories = [];
  function visit(node) {
    if (!node || typeof node !== "object") return;
    if (node.type === "ObjectExpression") {
      const names = node.properties
        .map((property) => property.key?.name ?? property.key?.value)
        .filter(Boolean);
      if (names.includes("coSign") && names.includes("VERSION")) inventories.push(new Set(names));
      if (names.includes("enableSupportDialog") && !names.includes("showLoadingDialog"))
        inventories.push(new Set(names));
    }
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === "object") visit(value);
    }
  }
  visit(source);
  const { createLegacyAutoScript } = await import("autoscript-ts/compat");
  const { createSupportDialog } = await import("autoscript-ts/ui");
  assert.deepEqual(
    Object.keys(createLegacyAutoScript()).toSorted(),
    [...inventories.find((inventory) => inventory.has("coSign"))].toSorted(),
  );
  assert.deepEqual(
    Object.keys(createSupportDialog().api).toSorted(),
    [...inventories.find((inventory) => inventory.has("enableSupportDialog"))].toSorted(),
  );
});

for (const entry of ["autoscript-ts", "autoscript-ts/core"]) {
  test(`ESM: ${entry}`, async () => {
    const { defineConfig } = await import(entry);

    assert.deepEqual(defineConfig(), { timeoutMs: 30_000 });
    assert.deepEqual(defineConfig({ timeoutMs: 5_000 }), { timeoutMs: 5_000 });
    assert.equal(Object.isFrozen(defineConfig()), true);
    assert.throws(() => defineConfig({ timeoutMs: -1 }), RangeError);
  });

  test(`CommonJS: ${entry}`, () => {
    const { defineConfig } = require(entry);

    assert.deepEqual(defineConfig(), { timeoutMs: 30_000 });
    assert.deepEqual(defineConfig({ timeoutMs: 5_000 }), { timeoutMs: 5_000 });
    assert.equal(Object.isFrozen(defineConfig()), true);
    assert.throws(() => defineConfig({ timeoutMs: -1 }), RangeError);
  });
}

test("internal implementation is not a public export", async () => {
  await assert.rejects(import("autoscript-ts/core/config"), {
    code: "ERR_PACKAGE_PATH_NOT_EXPORTED",
  });
});

for (const entry of [
  "encoding",
  "browser",
  "websocket",
  "https",
  "intermediate",
  "compat",
  "compat/des",
  "ui",
]) {
  test(`SSR-safe ESM/CommonJS: autoscript-ts/${entry}`, async () => {
    const esm = await import(`autoscript-ts/${entry}`);
    const cjs = require(`autoscript-ts/${entry}`);
    assert.deepEqual(Object.keys(esm).toSorted(), Object.keys(cjs).toSorted());
    assert.ok(Object.keys(esm).length > 0);
  });
}

test("modern root performs no global registration and supports binary codecs", async () => {
  const root = await import("autoscript-ts");
  assert.equal("AutoScript" in globalThis, false);
  assert.equal("SupportDialog" in globalThis, false);
  assert.equal(root.textToBase64("\u{1f600}"), "8J+YgA==");
  assert.deepEqual(root.decodeBase64("__8=", { urlSafe: true }), new Uint8Array([255, 255]));
  const compat = await import("autoscript-ts/compat");
  assert.equal(Object.keys(compat.createLegacyAutoScript()).length, 60);
});
