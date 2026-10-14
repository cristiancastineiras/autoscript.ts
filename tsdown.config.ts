import { defineConfig, type UserConfig } from "tsdown";

const config: UserConfig = defineConfig({
  entry: {
    index: "src/index.ts",
    core: "src/core/index.ts",
    encoding: "src/encoding/index.ts",
    browser: "src/browser/index.ts",
    websocket: "src/transports/websocket-index.ts",
    https: "src/transports/https-index.ts",
    intermediate: "src/transports/intermediate-index.ts",
    compat: "src/compat/index.ts",
    "compat-des": "src/compat/des.ts",
    ui: "src/ui/index.ts",
  },
  format: ["esm", "cjs"],
  platform: "neutral",
  target: "es2022",
  outDir: "dist",
  clean: true,
  treeshake: true,
  sourcemap: true,
  dts: {
    sourcemap: true,
  },
  outExtensions({ format }) {
    return {
      js: format === "cjs" ? ".cjs" : ".js",
      dts: format === "cjs" ? ".d.cts" : ".d.ts",
    };
  },
});

export default config;
