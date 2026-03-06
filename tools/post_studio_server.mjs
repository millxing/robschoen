import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { generateSite, loadSiteContent, saveSiteContent } from "./post_generator.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const host = "127.0.0.1";
const port = Number.parseInt(process.env.PORT || "4173", 10);

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".pdf", "application/pdf"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
]);

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

function sendText(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(body);
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : null;
}

function resolveStaticPath(urlPath) {
  const relative = decodeURIComponent(urlPath === "/" ? "/post-studio.html" : urlPath).replace(/^\/+/, "");
  const absolute = path.resolve(rootDir, relative);
  if (!absolute.startsWith(rootDir)) {
    return null;
  }
  return absolute;
}

async function serveStaticFile(urlPath, response) {
  const filePath = resolveStaticPath(urlPath);
  if (!filePath) {
    sendText(response, 403, "Forbidden");
    return;
  }

  try {
    const data = await fs.readFile(filePath);
    const contentType = contentTypes.get(path.extname(filePath).toLowerCase()) || "application/octet-stream";
    response.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": path.extname(filePath) === ".html" ? "no-store" : "public, max-age=60",
    });
    response.end(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      sendText(response, 404, "Not found");
      return;
    }

    console.error(error);
    sendText(response, 500, "Internal server error");
  }
}

const server = http.createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url || "/", `http://${host}:${port}`);

    if (request.method === "GET" && requestUrl.pathname === "/api/site-content") {
      sendJson(response, 200, await loadSiteContent());
      return;
    }

    if ((request.method === "POST" || request.method === "PUT") && requestUrl.pathname === "/api/site-content") {
      const payload = await readJson(request);
      await saveSiteContent(payload);
      await generateSite(payload);
      sendJson(response, 200, { ok: true });
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/rebuild") {
      await generateSite();
      sendJson(response, 200, { ok: true });
      return;
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      sendJson(response, 405, { error: "Method not allowed." });
      return;
    }

    await serveStaticFile(requestUrl.pathname, response);
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { error: error.message || "Internal server error." });
  }
});

server.listen(port, host, () => {
  console.log(`Site Editor running at http://${host}:${port}/post-studio.html`);
});
