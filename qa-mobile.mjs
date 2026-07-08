import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";

const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const port = 9300 + Math.floor(Math.random() * 500);
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const process = spawn(chrome, [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  "--no-default-browser-check",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=/tmp/erocket-chrome-cdp-${port}`,
  "about:blank"
], { stdio: "ignore" });

async function getTarget() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
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

  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true
  });
  await send("Page.enable");
  await send("Page.navigate", { url: "http://127.0.0.1:4173" });
  await delay(2500);

  const metrics = await send("Runtime.evaluate", {
    returnByValue: true,
    expression: `JSON.stringify({
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      h1Right: Math.round(document.querySelector("h1").getBoundingClientRect().right),
      menuVisible: getComputedStyle(document.querySelector("#menuButton")).display !== "none",
      evidenceColumns: document.querySelector(".evidence-grid")
        ? getComputedStyle(document.querySelector(".evidence-grid")).gridTemplateColumns
        : null,
      overflow: [...document.querySelectorAll("body *")]
        .filter((element) => element.getBoundingClientRect().right > window.innerWidth + 1 || element.getBoundingClientRect().left < -1)
        .slice(0, 20)
        .map((element) => ({
          tag: element.tagName,
          className: String(element.className),
          left: Math.round(element.getBoundingClientRect().left),
          right: Math.round(element.getBoundingClientRect().right)
        }))
    })`
  });
  writeFileSync("/tmp/erocket-mobile-metrics.json", metrics.result.value);

  const screenshot = await send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true
  });
  writeFileSync("/tmp/erocket-mobile-real.png", Buffer.from(screenshot.data, "base64"));

  await send("Runtime.evaluate", {
    expression: `(() => {
      const section = document.querySelector("#bevisbilder") || document.querySelector("#resan");
      section.querySelectorAll(".reveal").forEach((element) => element.classList.add("visible"));
      window.scrollTo(0, section.getBoundingClientRect().top + window.scrollY);
    })()`
  });
  await delay(800);
  const whyScreenshot = await send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true
  });
  writeFileSync("/tmp/erocket-mobile-why.png", Buffer.from(whyScreenshot.data, "base64"));

  socket.close();
  console.log("Riktig mobil-QA klar: /tmp/erocket-mobile-real.png och /tmp/erocket-mobile-why.png");
} finally {
  process.kill("SIGTERM");
}
