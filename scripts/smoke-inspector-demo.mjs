import { spawn } from "node:child_process";
import { chromium } from "playwright";

// Browser-level demo-only regression; no credentials, production writes or external OAuth.
const port = 3104;
const base = process.env.INSPECTOR_DEMO_BASE_URL || "http://127.0.0.1:" + port;
const server = process.env.INSPECTOR_DEMO_BASE_URL ? null : spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], {
  env: { ...process.env, NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ci-placeholder.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "ci-placeholder-anon-key" },
  stdio: ["ignore", "pipe", "pipe"]
});
let output = "", browser, failed = false;
server?.stdout.on("data", x => output += String(x));
server?.stderr.on("data", x => output += String(x));
const assert = (ok, message) => { if (!ok) throw new Error(message); };
async function ready() {
  for (let i = 0; i < 35; i++) {
    try { if ((await fetch(base + "/demo/inspector")).ok) return; } catch {}
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error("Inspector Demo server not ready: " + output.slice(-1000));
}
try {
  if (server) await ready();
  browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const errors = [];
  page.on("pageerror", e => errors.push(e.stack || String(e)));
  await page.goto(base + "/demo/inspector", { waitUntil: "domcontentloaded" });
  const navigation = page.getByRole("navigation", { name: "Inspector Workspace navigation" });
  const names = await navigation.getByRole("button").allTextContents();
  assert(names.join("|") === ["Profile Home","Opportunities","Active Assignments","Availability & Calendar","Selection Insights & Feedback","Qualifications & Documents","Work History","Income & Tax Center"].join("|"), "InspectorHub navigation order or consolidated Work History incorrect: " + names);
  assert(await page.getByText("Inspector Demo · Synthetic data").count() === 1, "Synthetic demo guard banner missing");
  await navigation.getByRole("button", { name: "Opportunities" }).click();
  await page.getByRole("button", { name: "Preview Opportunity" }).first().click();
  const dialog = page.getByRole("dialog", { name: "Opportunity preview" });
  assert(await dialog.count() === 1, "Opportunity preview did not open");
  await dialog.getByRole("button", { name: "Decline" }).click();
  assert(await page.getByRole("status").filter({ hasText: "Opportunity declined" }).count() === 1, "Declined feedback missing in Opportunities");
  await navigation.getByRole("button", { name: "Availability & Calendar" }).click();
  assert(await page.getByText("Opportunity declined").count() === 0, "Opportunity feedback leaked across InspectorHub sections");
  const cal = page.getByRole("region", { name: "Inspector availability calendar" });
  assert(await cal.count() === 1, "Calendar missing");
  const tabs = cal.getByRole("group", { name: "Calendar view" });
  assert(await tabs.getByRole("button", { name: "Month" }).getAttribute("aria-pressed") === "true", "Month not the default calendar view");
  assert(await cal.getByText(/Our Anniversary · All day/).count() >= 1, "Private synthetic anniversary missing");
  assert(await cal.getByText(/Doctor Appointment · 10:00/).count() >= 1, "Private synthetic doctor appointment missing");
  await tabs.getByRole("button", { name: "Week" }).click();
  assert(await tabs.getByRole("button", { name: "Week" }).getAttribute("aria-pressed") === "true", "Week view cannot be selected");
  await tabs.getByRole("button", { name: "List" }).click();
  assert(await tabs.getByRole("button", { name: "List" }).getAttribute("aria-pressed") === "true", "List view cannot be selected");
  assert(await cal.getByText("Inspector only · client view: Busy").count() >= 2, "List view lacks privacy label for external events");
  await tabs.getByRole("button", { name: "Month" }).click();
  await cal.getByRole("button", { name: "Open assignment" }).first().click();
  assert(await page.getByRole("heading", { name: /LNG Compressor Package|Gulf Horizon Refinery Upgrade|Orion Deepwater Platform/ }).count() > 0, "Calendar inspection did not open a populated assignment");
  assert(await page.getByText(/Opportunity declined/).count() === 0, "Stale opportunity alert appeared on assignment");
  await navigation.getByRole("button", { name: "Availability & Calendar" }).click();
  const calendar = page.getByRole("region", { name: "Inspector availability calendar" });
  await calendar.getByLabel("Start date").fill("2026-11-18");
  await calendar.getByLabel("End date").fill("2026-11-18");
  await calendar.getByRole("button", { name: "Block dates / Update availability" }).click();
  assert(await calendar.getByText(/overlaps a linked personal Busy event/).count() === 1, "Private calendar conflict not protected");
  await calendar.getByLabel("Start date").fill("2026-11-29");
  await calendar.getByLabel("End date").fill("2026-11-29");
  await calendar.getByRole("button", { name: "Block dates / Update availability" }).click();
  assert(await calendar.getByText("1 dates updated in this synthetic session only.").count() === 1, "Non-conflicting synthetic date update failed");
  await calendar.getByRole("button", { name: "Connect Outlook Calendar" }).click();
  assert(await calendar.getByText(/demo|simulat/i).count() > 0, "Calendar connection is not clearly labeled simulated");
  await navigation.getByRole("button", { name: "Work History" }).click();
  assert(await page.getByRole("link", { name: /Open Work History/ }).count() === 1, "Consolidated Work History link unavailable");
  // Work History keyword search is a shared filter for completed assignments and reports.
  await page.getByRole("link", { name: /Open Work History/ }).first().click();
  await page.waitForURL("**/demo/inspector-work-history");
  const historySearch=page.getByRole("searchbox",{name:"Search work history"});
  assert(await historySearch.count()===1,"Work History search control missing");
  await historySearch.fill("Seabrook");
  assert((await page.locator(".resultCount").innerText()).includes("1 of 10"),"Vendor keyword search should find one completed assignment");
  await page.getByRole("group",{name:"Work History views"}).getByRole("button",{name:"Reports Submitted"}).click();
  assert((await page.locator(".resultCount").innerText()).includes("1 of 10"),"Report view must retain keyword filter");
  await historySearch.fill("ir-260914");
  assert((await page.locator(".resultCount").innerText()).includes("1 of 10"),"Case-insensitive report ID keyword should find one submitted report");
  await page.getByRole("button",{name:"Reset filters"}).click();
  assert(await historySearch.inputValue()==="","Reset must clear Work History keyword");
  assert((await page.locator(".resultCount").innerText()).includes("10 of 10"),"Reset must restore all fictional reports");

  assert(errors.length === 0, "Inspector Demo browser exceptions: " + errors.join("\n"));
  console.log("Inspector Demo Chromium OK: sidebar, opportunity alert isolation, Month/Week/List, private events, assignment, date conflicts and demo-only connectors.");
} catch (e) {
  failed = true; console.error(e instanceof Error ? e.stack : String(e)); console.error("Server log tail:", output.slice(-1600));
} finally {
  if (browser) await browser.close();
  if (server) { server.kill("SIGTERM"); await new Promise(r => setTimeout(r, 250)); if (!server.killed) server.kill("SIGKILL"); }
}
if (failed) process.exitCode = 1;
