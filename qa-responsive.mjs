import { mkdirSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";

const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const port = 9600 + Math.floor(Math.random() * 300);
const outDir = "/tmp/erocket-responsive-qa";
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

mkdirSync(outDir, { recursive: true });

const pages = [
  "index.html",
  "tidslinje.html",
  "modell.html",
  "artiklar.html",
  "bevisdatabas.html",
  "skada.html",
  "juridik.html",
  "ansvariga.html",
  "stamningsansokan.html"
];

const viewports = [
  { width: 360, height: 780, label: "360" },
  { width: 390, height: 844, label: "390" },
  { width: 430, height: 932, label: "430" },
  { width: 768, height: 1024, label: "768" }
];

const chromeProcess = spawn(chrome, [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  "--no-default-browser-check",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=/tmp/erocket-chrome-cdp-${port}`,
  "about:blank"
], { stdio: "ignore" });

async function getTarget() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then((response) => response.json());
      const page = targets.find((target) => target.type === "page");
      if (page) return page;
    } catch {
      // Chrome is still starting.
    }
    await delay(125);
  }
  throw new Error("Chrome debugging target was not available.");
}

try {
  const target = await getTarget();
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  const pending = new Map();
  let id = 0;

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  });

  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  const send = (method, params = {}) => new Promise((resolve, reject) => {
    id += 1;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });

  await send("Page.enable");

  const results = [];

  for (const viewport of viewports) {
    await send("Emulation.setDeviceMetricsOverride", {
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 1,
      mobile: viewport.width < 700
    });

    for (const page of pages) {
      await send("Page.navigate", { url: `http://127.0.0.1:4173/${page}?qa=${Date.now()}` });
      await delay(1100);

      await send("Runtime.evaluate", {
        expression: `document.querySelectorAll(".reveal").forEach((element) => element.classList.add("visible"))`
      });

      const metrics = await send("Runtime.evaluate", {
        returnByValue: true,
        expression: `JSON.stringify((() => {
          const ignored = (element) =>
            element.closest(".ambient-layer") ||
            element.closest(".reading-progress") ||
            element.closest(".mobile-journey-nav") ||
            element.closest(".timeline-compass");
          const overflow = [...document.querySelectorAll("body *")]
            .filter((element) => !ignored(element))
            .map((element) => {
              const rect = element.getBoundingClientRect();
              return {
                tag: element.tagName,
                className: String(element.className || ""),
                id: element.id || "",
                left: Math.round(rect.left),
                right: Math.round(rect.right),
                width: Math.round(rect.width)
              };
            })
            .filter((item) => item.right > window.innerWidth + 1 || item.left < -1)
            .slice(0, 12);
          const textBlocks = [...document.querySelectorAll("p, li, dd")]
            .map((element) => Number.parseFloat(getComputedStyle(element).fontSize))
            .filter(Boolean);
          const buttons = [...document.querySelectorAll("a, button, input, select")]
            .map((element) => Math.round(element.getBoundingClientRect().height))
            .filter(Boolean);
          return {
            page: location.pathname.split("/").pop() || "index.html",
            viewport: window.innerWidth,
            scrollWidth: document.documentElement.scrollWidth,
            overflow,
            h1: document.querySelector("h1")?.innerText || "",
            h1Box: document.querySelector("h1") ? {
              right: Math.round(document.querySelector("h1").getBoundingClientRect().right),
              height: Math.round(document.querySelector("h1").getBoundingClientRect().height)
            } : null,
            minTextSize: textBlocks.length ? Math.min(...textBlocks) : null,
            minControlHeight: buttons.length ? Math.min(...buttons) : null,
            menuVisible: getComputedStyle(document.querySelector("#menuButton")).display !== "none"
          };
        })())`
      });

      const parsed = JSON.parse(metrics.result.value);
      results.push({ width: viewport.label, ...parsed });

      if (["index.html", "tidslinje.html", "artiklar.html", "bevisdatabas.html"].includes(page) && ["360", "390"].includes(viewport.label)) {
        const screenshot = await send("Page.captureScreenshot", { format: "png", fromSurface: true });
        writeFileSync(`${outDir}/${page.replace(".html", "")}-${viewport.label}-top.png`, Buffer.from(screenshot.data, "base64"));
      }
    }
  }

  writeFileSync(`${outDir}/metrics.json`, JSON.stringify(results, null, 2));
  socket.close();
  console.log(`${outDir}/metrics.json`);
} finally {
  chromeProcess.kill("SIGTERM");
}
