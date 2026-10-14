import { readFileSync } from "node:fs";
import { defineConfig, type UserConfig } from "tsdown";

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")) as {
  readonly version: string;
};

const define = { __AUTOSCRIPT_VERSION__: JSON.stringify(pkg.version) };

const banner = `/*!
 * AutoScript ${pkg.version} - Integracion web con Autofirma.
 * Reimplementacion TypeScript de autoscript.js (Cliente @firma, Gobierno de Espana).
 * Licencia: GPL-2.0-or-later OR EUPL-1.1.
 */`;

/** Distribucion clasica: sustituto directo de autoscript.js con los globals originales. */
function script(minify: boolean): UserConfig {
  return {
    entry: { [minify ? "autoscript.min" : "autoscript"]: "src/autoscript.ts" },
    format: "iife",
    platform: "browser",
    target: "es2022",
    outDir: "dist",
    clean: false,
    dts: false,
    minify,
    sourcemap: minify,
    define,
    banner,
    outputOptions: { entryFileNames: "[name].js" },
  };
}

const config: UserConfig[] = defineConfig([
  {
    // SDK modular: ESM tipado y tree-shakeable.
    entry: {
      index: "src/index.ts",
      ui: "src/ui/index.ts",
      compat: "src/compat/index.ts",
    },
    format: "esm",
    platform: "neutral",
    target: "es2022",
    outDir: "dist",
    clean: true,
    treeshake: true,
    hash: false,
    dts: true,
    define,
    // Tipos de los globals de la distribucion clasica.
    copy: [{ from: "types/autoscript.d.ts", to: "dist" }],
  },
  script(false),
  script(true),
]);

export default config;
