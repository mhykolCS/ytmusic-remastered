import http from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, extname, sep } from "node:path";
const root = fileURLToPath(new URL("../", import.meta.url));
const allowed = ["tests/fixtures/", "music/src/app/Ambient/"];
const mime = { ".html": "text/html", ".mjs": "text/javascript", ".js": "text/javascript", ".svg": "image/svg+xml", ".css": "text/css" };
http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    const relative = pathname === "/" ? "tests/fixtures/preview.html" : pathname.slice(1);
    const path = resolve(root, relative);
    if (!allowed.some(prefix => path.startsWith(resolve(root, prefix) + sep))) {
      res.writeHead(403); res.end("Forbidden"); return;
    }
    const body = await readFile(path);
    res.writeHead(200, { "Content-Type": mime[extname(path)] || "text/plain", "Cache-Control": "no-store" });
    res.end(body);
  } catch { res.writeHead(404); res.end("Not found"); }
}).listen(47839, "127.0.0.1", () => console.log("Renderer test preview: http://127.0.0.1:47839"));
