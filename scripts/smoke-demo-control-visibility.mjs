import { spawn } from "node:child_process";
import { chromium } from "playwright";

// Public demo controls only. No credentials, production writes, or private workspace routes.
const port = 3105;
const base = process.env.DEMO_CONTROLS_BASE_URL || "http://127.0.0.1:" + port;
const server = process.env.DEMO_CONTROLS_BASE_URL ? null : spawn(process.execPath, [
  "node_modules/next/dist/bin/next", "start", "-p", String(port)
], { env: {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ci-placeholder.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "ci-placeholder-anon-key"
}, stdio: ["ignore", "pipe", "pipe"] });
let log = "", browser, failed = false;
server?.stdout.on("data", x => log += String(x));
server?.stderr.on("data", x => log += String(x));
const routes = [
  "/", "/demo/client", "/demo/client-agency-sourcing", "/demo/client-inspections",
  "/demo/client-analytics", "/demo/client-history", "/demo/inspector",
  "/demo/inspector-documents", "/demo/inspector-work-history", "/demo/inspector-income",
  "/demo/agency", "/demo/agency-affiliations"
];
async function ready() {
  for (let n = 0; n < 40; n++) {
    try { if ((await fetch(base + "/demo/client")).ok) return; } catch {}
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error("Demo control smoke server not ready: " + log.slice(-1500));
}
try {
  if (server) await ready();
  browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on("pageerror", e => errors.push(e.stack || String(e)));
    for (const route of routes) {
      await page.goto(base + route, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(160);
      if (page.url().includes("/login")) throw new Error(route + " redirected demo reviewer to Login");
      const result = await page.evaluate(() => {
        const rgb = s => {
          const m = s.match(/[\d.]+/g);
          return m && m.length >= 3 ? [+m[0], +m[1], +m[2], m.length > 3 ? +m[3] : 1] : null;
        };
        const luminance = c => c.slice(0, 3).map(v => {
          const n = v / 255;
          return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
        }).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
        const background = el => {
          for (let node = el; node; node = node.parentElement) {
            const color = rgb(getComputedStyle(node).backgroundColor);
            if (color && color[3] >= 0.95) return color;
          }
          return [255, 255, 255, 1];
        };
        const bad = [];
        let checked = 0;
        for (const el of document.querySelectorAll("button, a[href], select, input:not([type=hidden]), [role=button]")) {
          const s = getComputedStyle(el), rect = el.getBoundingClientRect();
          if (rect.width < 5 || rect.height < 5 || s.display === "none" || s.visibility === "hidden") continue;
          const name = (el.getAttribute("aria-label") || el.getAttribute("title") ||
            [...(el.labels || [])].map(l => l.textContent).join(" ") || el.textContent ||
            el.querySelector("img")?.alt || "").trim();
          const fg = rgb(s.color);
          if (!fg) continue;
          const bg = background(el);
          const contrast = (Math.max(luminance(fg), luminance(bg)) + 0.05) /
            (Math.min(luminance(fg), luminance(bg)) + 0.05);
          const disabled = el.matches(":disabled, [aria-disabled=true]");
          checked++;
          if (!name || Number(s.opacity) < 0.25 || contrast < (disabled ? 2 : 3)) {
            bad.push({ element: el.tagName, name: name.slice(0, 45), contrast: +contrast.toFixed(2), disabled });
          }
        }
        return { checked, bad };
      });
      if (errors.length || result.bad.length) {
        throw new Error(width + "px " + route + " browser/legibility regressions: " +
          JSON.stringify({ errors: errors.slice(0, 2), controls: result.bad.slice(0, 10) }));
      }
      if (result.checked < 3) throw new Error(width + "px " + route + " returned an empty/unauthenticated shell");
      console.log("Demo control visibility OK:", width + "px", route, result.checked);
    }
    await page.close();
  }
} catch (e) {
  failed = true;
  console.error(e instanceof Error ? e.stack : String(e), log.slice(-1500));
} finally {
  if (browser) await browser.close();
  if (server) { server.kill("SIGTERM"); await new Promise(r => setTimeout(r, 200)); if (!server.killed) server.kill("SIGKILL"); }
}
if (failed) process.exitCode = 1;
