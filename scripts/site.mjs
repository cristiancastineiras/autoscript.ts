// Monta el sitio de demos (paginas de prueba + dist/ en js/) para servirlo o publicarlo en Pages.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = `${root}dist/`;
export const siteDir = `${root}site/`;

export function buildSite() {
  if (!existsSync(`${dist}autoscript.js`)) throw new Error("Ejecute antes `pnpm build`.");
  rmSync(siteDir, { recursive: true, force: true });
  mkdirSync(`${siteDir}js`, { recursive: true });
  cpSync(`${root}demo`, siteDir, { recursive: true });
  for (const file of readdirSync(dist))
    if (file.endsWith(".js") || file.endsWith(".js.map"))
      cpSync(`${dist}${file}`, `${siteDir}js/${file}`);
  return siteDir;
}

if (process.argv[1] === fileURLToPath(import.meta.url))
  console.log(`Sitio generado en ${buildSite()}`);
