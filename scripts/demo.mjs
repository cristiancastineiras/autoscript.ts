import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../", import.meta.url)));
const demoRoot = resolve(root, "tests", "manual");
const distRoot = resolve(root, "dist");
const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".map", "application/json; charset=utf-8"],
]);

const server = createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }
  try {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    if (url.pathname === "/favicon.ico") {
      response.writeHead(204).end();
      return;
    }
    if (url.pathname === "/") {
      response.writeHead(302, { Location: "/tests/manual/index.html" }).end();
      return;
    }
    const path = decodeURIComponent(url.pathname);
    const routed = path;
    const absolutePath = resolve(root, `.${routed}`);
    const isDemoFile = absolutePath.startsWith(`${demoRoot}${sep}`);
    const isBuildFile = absolutePath.startsWith(`${distRoot}${sep}`);
    if (!isDemoFile && !isBuildFile) {
      response.writeHead(403).end("Forbidden");
      return;
    }
    const info = await stat(absolutePath);
    if (!info.isFile()) {
      response.writeHead(404).end("Not found");
      return;
    }
    const content = await readFile(absolutePath);
    response.writeHead(200, {
      "Content-Type": mimeTypes.get(extname(absolutePath)) ?? "application/octet-stream",
      "Content-Length": content.byteLength,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https: wss://127.0.0.1:*; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
    });
    if (request.method === "HEAD") response.end();
    else response.end(content);
  } catch {
    response.writeHead(404).end("Not found");
  }
});

function listen(port) {
  return new Promise((resolvePromise, rejectPromise) => {
    const retry = () => {
      server.removeAllListeners("error");
      listen(port + 1).then(resolvePromise, rejectPromise);
    };
    server.once("error", (error) => {
      if (error.code === "EADDRINUSE") retry();
      else rejectPromise(error);
    });
    server.listen(port, "127.0.0.1", () => resolvePromise(server.address().port));
  });
}

const port = await listen(4173);
console.log(`Demos AutoScript TS: http://127.0.0.1:${port}/`);
console.log(`Operaciones: http://127.0.0.1:${port}/tests/manual/index.html`);
console.log(`Lote JSON: http://127.0.0.1:${port}/tests/manual/batch.html`);
