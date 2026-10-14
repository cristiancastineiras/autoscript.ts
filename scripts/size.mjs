// Tamano de las distribuciones frente al autoscript.js original.
import { readFileSync } from "node:fs";
import { brotliCompressSync, gzipSync } from "node:zlib";

const files = [
  ["Original 1.10.1", "Estudio/autoscript.js"],
  ["autoscript.js", "dist/autoscript.js"],
  ["autoscript.min.js", "dist/autoscript.min.js"],
];
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
const rows = files.map(([name, path]) => {
  const data = readFileSync(new URL(`../${path}`, import.meta.url));
  return {
    archivo: name,
    bruto: kb(data.length),
    gzip: kb(gzipSync(data, { level: 9 }).length),
    brotli: kb(brotliCompressSync(data).length),
  };
});
console.table(rows);
