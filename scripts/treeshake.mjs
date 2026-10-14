// Mide el coste real en un bundle de distintas formas de importar el SDK (tree-shaking).
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";

// rolldown llega como dependencia de tsdown.
const fromTsdown = createRequire(createRequire(import.meta.url).resolve("tsdown"));
const { build } = await import(pathToFileURL(fromTsdown.resolve("rolldown")).href);

const scenarios = {
  "Solo codificacion Base64/UTF-8": `import { textToBase64 } from "autoscript-ts"; console.log(textToBase64("a"));`,
  "Cliente WebSocket explicito": `import { AutoFirmaClient, WebSocketTransport } from "autoscript-ts";
    console.log(new AutoFirmaClient({ transport: new WebSocketTransport() }));`,
  "Cliente automatico (3 canales)": `import { createAutoFirmaClient } from "autoscript-ts"; console.log(createAutoFirmaClient());`,
  "Cliente automatico + dialogos": `import { createAutoFirmaClient } from "autoscript-ts";
    import { SupportDialog } from "autoscript-ts/ui";
    console.log(createAutoFirmaClient({ dialogs: new SupportDialog() }));`,
  "Fachada AutoScript completa": `import { installAutoScript } from "autoscript-ts/compat"; installAutoScript();`,
};

// Dentro del proyecto para que "autoscript-ts" se resuelva por sus exports (dist/).
const directory = mkdtempSync(join(process.cwd(), ".treeshake-"));
const rows = [];
try {
  for (const [name, code] of Object.entries(scenarios)) {
    const input = join(directory, "entry.js");
    writeFileSync(input, code);
    const { output } = await build({
      input,
      cwd: process.cwd(),
      write: false,
      output: { format: "esm", minify: true },
      logLevel: "silent",
    });
    const bundle = output.map((chunk) => chunk.code ?? "").join("");
    rows.push({
      escenario: name,
      minificado: `${(bundle.length / 1024).toFixed(1)} KB`,
      gzip: `${(gzipSync(bundle).length / 1024).toFixed(1)} KB`,
    });
  }
} finally {
  rmSync(directory, { recursive: true, force: true });
}
console.table(rows);
