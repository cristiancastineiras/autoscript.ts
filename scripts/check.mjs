// Ejecuta todas las comprobaciones de calidad en orden. Uso: `pnpm check`.
import { spawnSync } from "node:child_process";
import { extname } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const packageManager = process.env.npm_execpath;
if (!packageManager) {
  console.error("Ejecute este comando con `pnpm check`.");
  process.exit(1);
}

const root = fileURLToPath(new URL("../", import.meta.url));
const isNodeCli = [".js", ".cjs", ".mjs"].includes(extname(packageManager).toLowerCase());
const executable = isNodeCli ? process.execPath : packageManager;
const prefix = isNodeCli ? [packageManager] : [];
const checks = [
  "format:check",
  "lint",
  "typecheck",
  "test:coverage",
  "build",
  "test:package",
  "check:package",
  "check:types",
  "size",
];

for (const check of checks) {
  console.log(`\n> ${check}`);
  const result = spawnSync(executable, [...prefix, "run", check], {
    cwd: root,
    stdio: "inherit",
    shell: false,
  });
  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}
