import { spawn } from "node:child_process";
import { chromium } from "playwright";

const port = 3108;
const base = process.env.AGENCY_BASE_URL || "http://127.0.0.1:" + port;
const child = process.env.AGENCY_BASE_URL ? null : spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], {
  env: { ...process.env, NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ci-placeholder.supabase.co", NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "ci-placeholder-anon-key" },
  stdio: ["ignore", "pipe", "pipe"]
});
let serverOutput = "", browser;
const exceptions = [];
child?.stdout.on("data", data => { serverOutput += data.toString(); });
child?.stderr.on("data", data => { serverOutput += data.toString(); });
async function ready() {
  for (let i=0;i<35;i++) {
    try { if ((await fetch(base + "/demo/agency-commercials")).ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error("Agency demo server not ready: " + serverOutput.slice(-3000));
}
async function verify(page, region, client, size) {
  await page.getByRole("combobox", {name:"Sample contract region"}).selectOption({label:region});
  const contracts = page.locator("section.card").filter({has:page.getByRole("heading", {name:"Client contracts & commercial packages"})});
  const performance = page.locator("section.card").filter({has:page.getByRole("heading", {name:"Client & contract performance"})});
  await page.waitForFunction(expected => document.querySelector(".contractFilters [role=status]")?.textContent?.includes("Showing " + expected + " of 3"), size);
  if ((await contracts.locator("tbody tr").count()) !== size) throw new Error("Wrong contract count for " + region);
  if ((await performance.locator("tbody tr").count()) !== size) throw new Error("Wrong performance count for " + region);
  if (size === 1) {
    if (!(await contracts.locator("tbody").innerText()).includes(client)) throw new Error("Wrong contract selection for " + region);
    if (!(await performance.locator("tbody").innerText()).includes(client)) throw new Error("Wrong performance selection for " + region);
  }
  if (exceptions.length) throw new Error("Agency browser exception: " + exceptions.join("\n"));
}
try {
  await ready();
  browser = await chromium.launch({headless:true});
  const page = await browser.newPage({viewport:{width:1280,height:900}});
  page.on("pageerror", error => exceptions.push(String(error.stack || error)));
  page.on("console", message => { if (message.type() === "error") exceptions.push("console: "+message.text()); });
  await page.goto(base+"/demo/agency-commercials",{waitUntil:"networkidle"});
  if (!(await page.getByText(/fictional contracts, rates, budgets and performance only/i).count())) throw new Error("Missing synthetic demo boundary");
  await verify(page,"All regions","",3);
  for (const [region,client] of [["North America","Atlas LNG Development"],["Middle East","Orion Energy Projects"],["Europe","Meridian Process Systems"]]) await verify(page,region,client,1);
  await page.getByRole("button",{name:"Clear filter"}).click();
  await page.waitForFunction(()=>document.querySelector(".contractFilters select")?.value==="All regions");
  await verify(page,"All regions","",3);
  if (await page.getByRole("button",{name:"Clear filter"}).count()) throw new Error("Clear filter remained after reset");
  await page.getByRole("combobox",{name:"Sample contract region"}).focus();
  if ((await page.evaluate(()=>document.activeElement?.getAttribute("aria-label")))!=="Sample contract region") throw new Error("Region selector inaccessible by keyboard");
  if (exceptions.length) throw new Error("Console/page errors: "+exceptions.join("\n"));
  console.log("Agency Commercials synthetic regional filters passed: 3 → 1 for each region → 3, matching contract and performance tables.");
} finally {
  await browser?.close();
  if (child) { child.kill("SIGTERM"); await new Promise(resolve=>setTimeout(resolve,150)); if (!child.killed) child.kill("SIGKILL"); }
}
