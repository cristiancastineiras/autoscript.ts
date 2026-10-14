import { readFileSync } from "node:fs";
import { defineConfig, type ViteUserConfig } from "vitest/config";

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")) as {
  readonly version: string;
};

const config: ViteUserConfig = defineConfig({
  define: { __AUTOSCRIPT_VERSION__: JSON.stringify(pkg.version) },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    pool: "threads",
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/**/index.ts", "src/autoscript.ts", "src/**/*.d.ts"],
      reporter: ["text", "html", "lcov"],
      thresholds: {
        statements: 90,
        branches: 85,
        functions: 90,
        lines: 90,
      },
    },
    benchmark: {
      include: ["bench/**/*.bench.ts"],
    },
  },
});

export default config;
