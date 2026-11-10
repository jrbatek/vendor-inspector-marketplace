import { spawn } from "node:child_process";
import { chromium } from "playwright";

// Public synthetic Work History only; never logs in or writes to live records.
const port = 3124;
const base = process.env.INSPECTSOURCE_HISTORY_BASE_URL || "http://127.0.0.1:" + port;
const server = process.env.INSPECTSOURCE_HISTORY_BASE_URL ? null : spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], {
  env: { ...process.env,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ci-placeholder.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "ci-placeholder-anon-key" },
  stdio: ["ignore", "pipe", "pipe"]
});
let output = "";
server?.stdout.on("data", value => output += String(value));
server?.stderr.on("data", value => output += String(value));
const assert = (ok, message) => { if (!ok) throw Error(message); };
let browser;
async function ready() {
  for (let i = 0; i < 35; i++) {
    try { if ((await fetch(base + "/demo/inspector-work-history")).ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw Error("Work History server not ready: " + output.slice(-1000));
}
try {
  if (server) await ready();
  browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 850 } });
  const errors = [];
  page.on("pageerror", error => errors.push(error.stack || String(error)));
  const response = await page.goto(base + "/demo/inspector-work-history", { waitUntil: "domcontentloaded" });
  assert(response?.ok(), "Public Work History route must not require login");
  await page.getByRole("heading", { name: "Work History" }).waitFor();
  assert(!(await page.locator("body").innerText()).includes("Log in to view"), "Demo navigated to live workspace");
  const summary = page.getByRole("group", { name: "Filtered synthetic work history summary" });
  const counts = async () => (await summary.locator("strong").allTextContents()).map(value => Number(value.trim()));
  assert(JSON.stringify(await counts()) === JSON.stringify([10, 10, 6, 3]), "Unexpected unfiltered Work History counters");

  await page.getByRole("button", { name: "Open assignment" }).first().click();
  assert(await page.getByRole("heading", { name: "Completed assignment details" }).count() === 1, "Assignment detail must open");
  await page.getByRole("combobox", { name: "Client" }).selectOption("Bluewater LNG");
  assert(JSON.stringify(await counts()) === JSON.stringify([2, 2, 1, 1]), "Client filter must update every summary counter");
  assert(await page.getByRole("heading", { name: "Completed assignment details" }).count() === 0, "Changing filters must close stale assignment detail");
  await page.getByRole("button", { name: "Reports Submitted" }).click();
  assert(await page.getByRole("heading", { name: "Coastal Liquefaction Train 3" }).count() === 2, "Report cards must identify project, not only inspection type");
  const href = await page.getByRole("link", { name: "Open sample PDF" }).first().getAttribute("href");
  assert(Boolean(href), "Sample report PDF link missing");
  const pdf = await page.request.get(base + href);
  assert(pdf.ok() && (pdf.headers()["content-type"] || "").includes("application/pdf"), "Synthetic report PDF invalid");

  await page.getByRole("textbox", { name: "Completed from" }).fill("2026-12-01");
  await page.getByRole("textbox", { name: "Completed through" }).fill("2026-08-01");
  assert(JSON.stringify(await counts()) === JSON.stringify([0, 0, 0, 0]), "Invalid dates must show zero matching results without claiming unfiltered counts");
  await page.getByRole("alert").getByRole("button", { name: "Clear invalid date range" }).click();
  assert(JSON.stringify(await counts()) === JSON.stringify([2, 2, 1, 1]), "Clearing date range must preserve client filter");
  await page.getByRole("button", { name: "Reset filters" }).click();
  assert(JSON.stringify(await counts()) === JSON.stringify([10, 10, 6, 3]), "Reset must restore unfiltered counts");
  assert(errors.length === 0, "Work History browser exception: " + errors.join("\n"));
  console.log("Work History summary, project identity, filters, sample PDF and tab/reset smoke passed.");
} finally {
  await browser?.close();
  if (server) server.kill("SIGTERM");
}
