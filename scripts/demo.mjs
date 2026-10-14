// Servidor de las paginas de prueba. Uso: `pnpm demo` (HOST=0.0.0.0 para acceder por IP).
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { networkInterfaces } from "node:os";
import { extname, resolve, sep } from "node:path";
import { buildSite } from "./site.mjs";

const root = resolve(buildSite());
const host = process.env.HOST ?? "127.0.0.1";
const types = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".map", "application/json; charset=utf-8"],
]);

const server = createServer(async (request, response) => {
  try {
    const { pathname } = new URL(request.url ?? "/", "http://localhost");
    const path = resolve(
      root,
      `.${decodeURIComponent(pathname === "/" ? "/index.html" : pathname)}`,
    );
    if (!path.startsWith(root + sep) || !(await stat(path)).isFile()) throw new Error("404");
    response.writeHead(200, {
      "Content-Type": types.get(extname(path)) ?? "application/octet-stream",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    response.end(await readFile(path));
  } catch {
    response.writeHead(404).end("No encontrado");
  }
});

server.listen(Number(process.env.PORT ?? 4173), host, () => {
  const { port } = server.address();
  const hosts =
    host === "0.0.0.0"
      ? Object.values(networkInterfaces())
          .flat()
          .filter((address) => address?.family === "IPv4" && !address.internal)
          .map((address) => address.address)
      : [host];
  for (const name of hosts) console.log(`Demos de AutoScript: http://${name}:${port}/`);
  if (host !== "0.0.0.0")
    console.log(
      "Autofirma rechaza localhost/127.0.0.1: use HOST=0.0.0.0 y acceda por la IP del equipo.",
    );
});
