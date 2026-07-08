import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "0.0.0.0";
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

const server = createServer((request, response) => {
  const requestPath = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const relativePath = normalize(requestPath).replace(/^(\.\.(\/|\\|$))+/, "");
  let filePath = join(root, relativePath === "/" ? "index.html" : relativePath);

  if (!filePath.startsWith(root)) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, "index.html");
  }

  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
    return;
  }

  response.writeHead(200, {
    "Content-Type": contentTypes[extname(filePath).toLowerCase()] || "application/octet-stream",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  createReadStream(filePath).pipe(response);
});

server.listen(port, host, () => {
  console.log(`eRocket evidenssajt: http://localhost:${port}`);

  if (existsSync(chrome)) {
    const captures = [{ name: "desktop", size: "1440,1000" }];

    for (const capture of captures) {
      const screenshot = spawn(chrome, [
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--no-first-run",
        "--no-default-browser-check",
        `--user-data-dir=/tmp/erocket-chrome-${capture.name}`,
        `--window-size=${capture.size}`,
        `--screenshot=/tmp/erocket-${capture.name}.png`,
        "--virtual-time-budget=2500",
        `http://127.0.0.1:${port}`
      ], { stdio: ["ignore", "ignore", "pipe"] });

      capture.stderr = "";
      screenshot.stderr.on("data", (data) => {
        capture.stderr += data.toString();
      });
      screenshot.on("exit", (code) => {
        console.log(`QA-skärmbild ${capture.name}: ${code === 0 ? "klar" : `misslyckades (${code})`}`);
        if (code !== 0 && capture.stderr) console.error(capture.stderr);
      });
    }

    const mobileQa = spawn(process.execPath, [join(root, "qa-mobile.mjs")], {
      stdio: ["ignore", "pipe", "pipe"]
    });
    mobileQa.stdout.on("data", (data) => process.stdout.write(data));
    mobileQa.stderr.on("data", (data) => process.stderr.write(data));
  }

  const cloudflared = "/tmp/cloudflared-bin/cloudflared";
  if (process.env.PUBLIC_TUNNEL !== "0" && existsSync(cloudflared)) {
    const tunnel = spawn(cloudflared, [
      "tunnel",
      "--url",
      `http://127.0.0.1:${port}`,
      "--no-autoupdate"
    ], { stdio: ["ignore", "pipe", "pipe"] });

    tunnel.stdout.on("data", (data) => process.stdout.write(data));
    tunnel.stderr.on("data", (data) => process.stderr.write(data));
    tunnel.on("exit", (code) => console.log(`Cloudflare-tunneln avslutades med kod ${code}`));

    const close = () => {
      tunnel.kill("SIGTERM");
      server.close(() => process.exit(0));
    };
    process.once("SIGINT", close);
    process.once("SIGTERM", close);
  }
});
