// Crea la release de GitHub de la version de package.json si aun no existe. La ejecuta CI tras
// `pnpm build`, con GH_TOKEN en el entorno.
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const tag = `v${pkg.version}`;

if (spawnSync("gh", ["release", "view", tag], { stdio: "ignore" }).status === 0) {
  console.log(`La release ${tag} ya existe.`);
  process.exit(0);
}

const tarball = execFileSync("npm", ["pack", "--ignore-scripts", "--silent"], { encoding: "utf8" })
  .trim()
  .split("\n")
  .at(-1);
const assets = [
  "dist/autoscript.js",
  "dist/autoscript.min.js",
  "dist/autoscript.min.js.map",
  tarball,
];
const directory = mkdtempSync(join(tmpdir(), "release-"));
const checksums = join(directory, "SHA256SUMS");
writeFileSync(
  checksums,
  assets
    .map(
      (file) =>
        `${createHash("sha256").update(readFileSync(file)).digest("hex")}  ${basename(file)}`,
    )
    .join("\n") + "\n",
);

// Notas: la seccion de esta version en CHANGELOG.md.
const changelog = readFileSync("CHANGELOG.md", "utf8");
const start = changelog.indexOf(`## ${pkg.version}`);
const end = changelog.indexOf("\n## ", start + 1);
const section = start === -1 ? "" : changelog.slice(start, end === -1 ? undefined : end);
const notes = join(directory, "NOTES.md");
writeFileSync(
  notes,
  `${section.replace(/^## .*\n/, "").trim()}\n\n` +
    "### Descargas\n\n" +
    "- `autoscript.js`: sustituto directo del autoscript.js original.\n" +
    "- `autoscript.min.js` (+ `.map`): version minificada.\n" +
    `- \`${tarball}\`: paquete npm con el SDK (\`npm install <url del fichero>\`).\n` +
    "- `SHA256SUMS`: sumas de comprobacion.\n",
);

execFileSync(
  "gh",
  [
    "release",
    "create",
    tag,
    "--title",
    `AutoScript ${pkg.version}`,
    "--notes-file",
    notes,
    "--target",
    process.env.GITHUB_SHA ?? "main",
    ...assets,
    checksums,
  ],
  { stdio: "inherit" },
);
console.log(`Release ${tag} publicada.`);
