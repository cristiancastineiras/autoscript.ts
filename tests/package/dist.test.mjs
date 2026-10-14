import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import { gzipSync } from "node:zlib";

const require = createRequire(import.meta.url);
const { JSDOM } = require("jsdom");
const pkg = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"));
const dist = (file) => new URL(`../../dist/${file}`, import.meta.url);

test("los subpaths publicos se resuelven y no registran globals", async () => {
  const root = await import("autoscript-ts");
  const ui = await import("autoscript-ts/ui");
  const compat = await import("autoscript-ts/compat");
  assert.equal(root.VERSION, pkg.version);
  assert.equal(typeof root.createAutoFirmaClient, "function");
  assert.equal(typeof ui.SupportDialog, "function");
  assert.equal(typeof compat.installAutoScript, "function");
  assert.equal("AutoScript" in globalThis, false);
  assert.equal(root.textToBase64("\u{1F600}"), "8J+YgA==");
});

test("los modulos internos no son publicos", async () => {
  await assert.rejects(import("autoscript-ts/src/core/client.js"), {
    code: "ERR_PACKAGE_PATH_NOT_EXPORTED",
  });
});

test("cada entrada publica tiene sus tipos", () => {
  const files = readdirSync(new URL("../../dist/", import.meta.url));
  for (const entry of ["index", "ui", "compat"]) assert.ok(files.includes(`${entry}.d.ts`), entry);
});

test("autoscript.js mantiene el tamano bajo control", () => {
  const minified = readFileSync(dist("autoscript.min.js"));
  const gzip = gzipSync(minified, { level: 9 }).length;
  // El original ocupa 255 KB (56 KB con gzip).
  assert.ok(gzip < 30_000, `autoscript.min.js ocupa ${gzip} bytes con gzip`);
  assert.match(minified.toString("utf8", 0, 200), new RegExp(`AutoScript ${pkg.version}`));
});

for (const file of ["autoscript.js", "autoscript.min.js"]) {
  test(`${file} sustituye al original: globals y una firma por WebSocket`, async () => {
    const dom = new JSDOM("<!doctype html><body></body>", {
      url: "https://sede.example.gob.es/",
      runScripts: "outside-only",
    });
    const { window } = dom;
    const launches = [];
    const sent = [];
    class FakeWebSocket extends window.EventTarget {
      readyState = 0;
      constructor(url) {
        super();
        this.url = url;
        setTimeout(() => {
          this.readyState = 1;
          this.dispatchEvent(new window.Event("open"));
        }, 0);
      }
      send(message) {
        sent.push(message);
        const data = message.startsWith("echo=") ? "OK" : "Q0VSVA|RklSTUE";
        setTimeout(() => this.dispatchEvent(new window.MessageEvent("message", { data })), 0);
      }
      close() {
        this.readyState = 3;
      }
    }
    window.WebSocket = FakeWebSocket;
    window.setTimeout = (callback, _ms, ...args) => setTimeout(callback, 0, ...args);
    window.eval(readFileSync(dist(file), "utf8"));
    new window.MutationObserver((records) => {
      for (const record of records)
        for (const node of record.addedNodes)
          if (node.id === "iframeAfirma") launches.push(node.src);
    }).observe(window.document.body, { childList: true });

    assert.equal(window.MiniApplet, window.AutoScript);
    assert.equal(Object.keys(window.AutoScript).length, 60);
    assert.equal(Object.keys(window.SupportDialog).length, 20);
    assert.equal(window.Base64.encode("ñ"), "w7E=");

    window.SupportDialog.enableSupportDialog(false);
    window.AutoScript.cargarAppAfirma();
    const result = await new Promise((resolve, reject) =>
      window.AutoScript.sign(
        "QUJD",
        "SHA256",
        "CAdES",
        null,
        (...args) => resolve(args),
        (...args) => reject(new Error(args.join(" "))),
      ),
    );
    assert.deepEqual(result, ["RklSTUE", "Q0VSVA", null]);
    assert.match(launches[0], /^afirma:\/\/websocket\?ports=/);
    assert.match(sent[1], /^afirma:\/\/sign\?op=sign&idsession=/);
  });
}
