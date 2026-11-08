import { spawn } from "node:child_process";
import { chromium } from "playwright";

const port = 3102;
const base = process.env.ANALYTICS_BASE_URL || `http://127.0.0.1:${port}`;
const child = process.env.ANALYTICS_BASE_URL ? null : spawn(process.execPath, [
  "node_modules/next/dist/bin/next", "start", "-p", String(port),
], {
  env: {
    ...process.env,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ci-placeholder.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "ci-placeholder",
  },
  stdio: ["ignore", "pipe", "pipe"],
});
let serverOutput = "";
child?.stdout.on("data", data => { serverOutput += data.toString(); });
child?.stderr.on("data", data => { serverOutput += data.toString(); });

async function ready() {
  for (let i = 0; i < 35; i++) {
    try { if ((await fetch(base + "/demo/client-analytics")).ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error("Analytics production server failed: " + serverOutput.slice(-3000));
}
async function assertCohort(page, label, expected) {
  const rendered = Math.min(expected, 30);
  await page.waitForFunction(({expected,rendered,label}) =>
    document.querySelectorAll(".records tbody tr").length === rendered &&
    document.querySelector(".quickSources [role=status]")?.textContent?.includes(
      "Source: " + label + ". " + expected + " synthetic inspections"
    ), {expected, rendered, label}, {timeout: 15000});
  const chosen = page.getByRole("group", {name:"Quick source type filters"})
    .getByRole("button", {name:label === "All" ? "All sources" : label, exact:true});
  if (await chosen.getAttribute("aria-pressed") !== "true")
    throw new Error(label + " filter did not expose pressed state");
  if (await page.getByRole("heading", {name:"Analytics view could not load"}).count())
    throw new Error("Client Analytics recovery error after selecting " + label);
}
let browser, failed=false;
const errors=[];
try {
  if (!process.env.ANALYTICS_BASE_URL) await ready();
  browser = await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page = await browser.newPage({acceptDownloads:true});
  page.on("pageerror",e => errors.push(e.stack || String(e)));
  page.on("console",m => {if(m.type()==="error")console.log("Console:",m.text().slice(0,1000));});
  await page.goto(base+"/demo/client-analytics",{waitUntil:"domcontentloaded"});
  const source = page.getByRole("group",{name:"Quick source type filters"});
  await page.waitForSelector(".filters select");
  if (await page.locator(".filters select").count() !== 8)
    throw new Error("Expected eight stable native slicers plus prominent Source Type button controls");
  if (await page.locator(".filters label").filter({hasText:"Source Type"}).count())
    throw new Error("Obsolete graphical-browser-crashing Source Type native selector remains");
  await assertCohort(page,"All",60);
  // Reproduce first interaction in the graphical browser: direct pointer action on Independent.
  await source.getByRole("button",{name:"Independent",exact:true}).click();
  await assertCohort(page,"Independent",15);
  await page.waitForTimeout(1300);
  await source.getByRole("button",{name:"Agency",exact:true}).click();
  await assertCohort(page,"Agency",45);
  await source.getByRole("button",{name:"All sources"}).click();
  await assertCohort(page,"All",60);
  // Chart and Source Type buttons must share a single sourceType state.
  const chart=page.locator(".grid .panel").first();
  await chart.getByRole("button",{name:/Independent/}).click();
  await assertCohort(page,"Independent",15);
  await chart.getByRole("button",{name:/Independent/}).click();
  await assertCohort(page,"All",60);
  await chart.getByRole("button",{name:/Agency/}).click();
  await assertCohort(page,"Agency",45);
  await page.getByRole("button",{name:"Reset filters"}).click();
  await assertCohort(page,"All",60);
  // A focused segment must work with ordinary keyboard activation.
  const independent=source.getByRole("button",{name:"Independent",exact:true});
  await independent.focus();
  await page.keyboard.press("Enter");
  await assertCohort(page,"Independent",15);
  const downloadPromise=page.waitForEvent("download");
  await page.getByRole("button",{name:/Download data/}).click();
  const download=await downloadPromise;
  if(download.suggestedFilename()!=="inspectsource-client-demo-inspections.csv")
    throw new Error("Filtered Analytics CSV download unavailable");
  if(errors.length)throw new Error("Analytics browser exceptions:\n"+errors.join("\n"));
  console.log("Client Analytics segmented Source Type pointer, keyboard, chart, reset, 15/45/60 counts, and CSV download passed.");
}catch(e){
  failed=true;
  console.error(e instanceof Error ? e.stack : String(e));
  console.error("Server tail:",serverOutput.slice(-3000));
}finally{
  if(browser)await browser.close();
  if(child){child.kill("SIGTERM");await new Promise(r=>setTimeout(r,200)); if(!child.killed)child.kill("SIGKILL");}
}
if(failed)process.exitCode=1;
