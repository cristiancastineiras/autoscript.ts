import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import { join } from "node:path";
import { buildSite } from "../../scripts/site.mjs";

const require = createRequire(import.meta.url);
const { JSDOM, VirtualConsole } = require("jsdom");
const { version } = JSON.parse(
  readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
);
const site = buildSite();
const pages = readdirSync(site).filter((file) => file.endsWith(".html") && file !== "sdk.html");

for (const page of pages) {
  test(`la pagina de prueba ${page} carga con dist/autoscript.js sin errores`, async () => {
    const errors = [];
    const virtualConsole = new VirtualConsole();
    virtualConsole.on("jsdomError", (error) => errors.push(error.message));
    const dom = await JSDOM.fromFile(join(site, page), {
      runScripts: "dangerously",
      resources: "usable",
      virtualConsole,
    });
    await new Promise((resolve) => dom.window.addEventListener("load", resolve));
    assert.deepEqual(errors, []);
    assert.equal(typeof dom.window.AutoScript.sign, "function");
    assert.equal(dom.window.AutoScript.VERSION, version);
    dom.window.close();
  });
}
