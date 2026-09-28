import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { exec } from "node:child_process";
import { lintContent } from "./index.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Performs safe auto-fixes on text (em dashes, double hyphens, redundant header starts).
 * @param {string} content
 * @returns {{cleanContent: string, fixedCount: number}}
 */
export function autoFixContent(content) {
  let fixedCount = 0;
  let lines = content.split(/\r?\n/);

  const cleanLines = lines.map(line => {
    let clean = line;

    // Fix 1: Em dash -> comma or period
    if (/[—–]/.test(clean)) {
      clean = clean.replace(/\s*[—–]\s*/g, ", ");
      fixedCount++;
    }

    // Fix 2: Spaced double hyphen -> comma
    if (/\s--\s/.test(clean)) {
      clean = clean.replace(/\s--\s/g, ", ");
      fixedCount++;
    }

    // Fix 3: Redundant header list item: - **Header:** Header is... -> - **Header:** Is...
    const redundantMatch = clean.match(/^(\s*[-*+]\s+\*\*[A-Za-z0-9\s]+?:?\*\*:?\s+)([A-Za-z0-9\s]+?)\b(.*)$/i);
    if (redundantMatch) {
      const headerPart = redundantMatch[1];
      const repeatWord = redundantMatch[2];
      const rest = redundantMatch[3];
      if (headerPart.toLowerCase().includes(repeatWord.toLowerCase())) {
        clean = `${headerPart}${rest.trimStart()}`;
        fixedCount++;
      }
    }

    return clean;
  });

  return { cleanContent: cleanLines.join("\n"), fixedCount };
}

/**
 * Creates and starts the slopcheck web server.
 * @param {object} options
 * @param {number} [options.port=3456]
 * @param {boolean} [options.openBrowser=false]
 * @returns {Promise<http.Server>}
 */
export function startServer({ port = 3456, openBrowser = false } = {}) {
  return new Promise((resolve, reject) => {
    const htmlPath = path.join(__dirname, "ui", "index.html");
    const htmlContent = fs.readFileSync(htmlPath, "utf8");

    const server = http.createServer(async (req, res) => {
      // CORS headers for local tools
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");

      if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
      }

      if (req.method === "GET" && req.url === "/") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(htmlContent);
        return;
      }

      if (req.method === "POST" && req.url === "/api/lint") {
        let body = "";
        req.on("data", chunk => body += chunk);
        req.on("end", () => {
          try {
            const data = JSON.parse(body || "{}");
            const issues = lintContent(data.content || "", data.filename || "editor.md");
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ issues, count: issues.length }));
          } catch (err) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Invalid JSON request" }));
          }
        });
        return;
      }

      if (req.method === "POST" && req.url === "/api/fix") {
        let body = "";
        req.on("data", chunk => body += chunk);
        req.on("end", () => {
          try {
            const data = JSON.parse(body || "{}");
            const { cleanContent, fixedCount } = autoFixContent(data.content || "");
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ cleanContent, fixedCount }));
          } catch (err) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Invalid JSON request" }));
          }
        });
        return;
      }

      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.log(`Port ${port} is in use, trying ${port + 1}...`);
        startServer({ port: port + 1, openBrowser }).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });

    server.listen(port, () => {
      const url = `http://localhost:${port}`;
      console.log(`\n🛡️  slopcheck UI running at: ${url}\n`);

      if (openBrowser) {
        const startCmd = process.platform === "win32" ? `start ${url}` : process.platform === "darwin" ? `open ${url}` : `xdg-open ${url}`;
        exec(startCmd);
      }
      resolve(server);
    });
  });
}
