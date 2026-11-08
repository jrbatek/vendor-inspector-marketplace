import { spawn } from "node:child_process";
import { chromium } from "playwright";

const port=3102, base=process.env.ANALYTICS_BASE_URL || `http://127.0.0.1:${port}`;
const child=process.env.ANALYTICS_BASE_URL ? null : spawn(process.execPath,["node_modules/next/dist/bin/next","start","-p",String(port)],{
  env:{...process.env,NEXT_PUBLIC_SUPABASE_URL:process.env.NEXT_PUBLIC_SUPABASE_URL||"https://ci-placeholder.supabase.co",NEXT_PUBLIC_SUPABASE_ANON_KEY:process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||"ci-placeholder-anon-key"},
  stdio:["ignore","pipe","pipe"]
});
let serverOutput="",browser;const exceptions=[];
child?.stdout.on("data",x=>{serverOutput+=x.toString()});
child?.stderr.on("data",x=>{serverOutput+=x.toString()});
async function ready(){
  for(let i=0;i<35;i++){
    try{if((await fetch(base+"/demo/client-analytics")).ok)return}catch{}
    await new Promise(r=>setTimeout(r,1000));
  }
  throw new Error("Next production server not ready: "+serverOutput.slice(-3000));
}
async function verify(page,label,count){
  const selector=page.locator(".filters select").first();
  if(!(await page.locator(".filters label").first().innerText()).includes("Source Type"))throw new Error("First analytics selector must be Source Type");
  await selector.selectOption({label});
  await page.waitForFunction(expected=>document.querySelectorAll(".records tbody tr").length===expected,count,{timeout:10000});
  await page.waitForTimeout(1800); // catch post-render React errors rather than racing the next selection
  const state=await selector.inputValue();
  if(state!==label)throw new Error(`Source Type selector expected ${label}, received ${state}`);
  if((await page.locator(".records tbody tr").count())!==count)throw new Error(`Expected ${count} ${label} records`);
  if(await page.getByText(/Application error: a client-side exception/i).count())throw new Error("Next.js client exception visible on "+label);
  if(exceptions.length)throw new Error("Browser exceptions on "+label+":\n"+exceptions.join("\n"));
  console.log("Analytics browser OK:",label,count);
}
// Unlike selectOption(), these paths exercise ordinary keyboard/pointer native-select events.
async function verifyNativeSourceFilter(page, interaction) {
  await page.getByRole("button", { name: "Reset filters" }).click();
  const selector = page.locator(".filters select").first();
  await page.waitForFunction(() => document.querySelector(".filters select")?.value === "All");
  if (interaction === "pointer") await selector.click();
  else await selector.focus();
  await page.keyboard.press("End"); // All, Agency, Independent => final option
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.querySelector(".filters select")?.value === "Independent");
  await page.waitForFunction(() => document.querySelectorAll(".records tbody tr").length === 15);
  await page.waitForTimeout(1500);
  if (!(await page.locator(".resultsSummary").innerText()).includes("15 of 15")) {
    throw new Error("Native " + interaction + " selection lost the full Independent count");
  }
  if (await page.getByText(/Application error: a client-side exception/i).count()) {
    throw new Error("Next.js client error after native " + interaction + " select");
  }
  if (exceptions.length) throw new Error("Browser exception after native " + interaction + ":\n" + exceptions.join("\n"));
  console.log("Analytics native " + interaction + " select passed: Independent 15");
}
let failed=false;
try{
 if(!process.env.ANALYTICS_BASE_URL)await ready();
 browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const page=await browser.newPage();
 page.on("pageerror",e=>exceptions.push(e.stack||String(e)));
 page.on("console",m=>{if(m.type()==="error")console.log("Browser console error:",m.text().slice(0,1500))});
 await page.goto(base+"/demo/client-analytics",{waitUntil:"networkidle"});
 await page.waitForSelector(".filters select");
 await page.waitForTimeout(750); // allow client hydration before synthetic controls are changed
 if((await page.locator(".records tbody tr").count())!==30)throw new Error("Expected initial 30-row preview");
 await verify(page,"Independent",15);
 await verify(page,"Agency",30); // first 30 of 45 are rendered
 await verifyNativeSourceFilter(page,"keyboard");
 await verifyNativeSourceFilter(page,"pointer");
 await page.getByRole("button",{name:"Reset filters"}).click();
 const chart=page.locator(".grid .panel").first();
 const independent=chart.getByRole("button",{name:/Independent/});
 await independent.click();
 await page.waitForFunction(()=>document.querySelectorAll(".records tbody tr").length===15);
 if((await page.locator(".filters select").first().inputValue())!=="Independent")throw new Error("Chart click did not update Source Type selector");
 if((await independent.getAttribute("aria-pressed"))!=="true")throw new Error("Selected Independent bar lacks pressed state");
 await independent.click(); // toggle the currently selected source back to All
 await page.waitForFunction(()=>document.querySelector(".filters select")?.value==="All");
 await page.waitForFunction(()=>document.querySelectorAll(".records tbody tr").length===30);
 const agencyBar=chart.getByRole("button",{name:/Agency/});
 await agencyBar.click();
 await page.waitForFunction(()=>document.querySelector(".filters select")?.value==="Agency");
 if(!((await page.locator(".resultsSummary").innerText()).includes("of 45")))throw new Error("Agency source chart filtering lost its 45-record total");
 await agencyBar.click();
 await page.waitForFunction(()=>document.querySelector(".filters select")?.value==="All");
 await page.waitForTimeout(1200);
 if(exceptions.length)throw new Error("Chart filter browser exceptions: "+exceptions.join("\n"));
 console.log("Client Analytics source chart selection and deselection passed.");
 await page.waitForFunction(()=>document.querySelectorAll(".records tbody tr").length===30);
 if(await page.getByText(/Application error: a client-side exception/i).count())throw new Error("Client error on reset");
 if(exceptions.length)throw new Error(exceptions.join("\n"));
 // Deliberately do not wait for hydration: the disabled SSR controls must become
 // enabled only after React attaches its handlers, then produce the right cohort.
 const early=await browser.newPage();
 early.on("pageerror",e=>exceptions.push("Early interaction: "+(e.stack||String(e))));
 await early.goto(base+"/demo/client-analytics",{waitUntil:"domcontentloaded"});
 await early.locator(".filters select").first().selectOption({label:"Independent"});
 await early.waitForFunction(()=>document.querySelectorAll(".records tbody tr").length===15);
 if((await early.locator(".resultsSummary").innerText()).includes("60 filtered"))throw new Error("Hydration lost the early independent filter");
 if(exceptions.length)throw new Error("Hydration interaction error: "+exceptions.join("\\n"));
 await early.close();
 console.log("Client Analytics early-hydration selection passed.");
 console.log("Client Analytics source-type interaction smoke passed.");
}catch(error){failed=true;console.error(error instanceof Error?error.stack:String(error));console.error("Next server tail:",serverOutput.slice(-3000))}
finally{if(browser)await browser.close();if(child){child.kill("SIGTERM");await new Promise(r=>setTimeout(r,200));if(!child.killed)child.kill("SIGKILL")}}
if(failed)process.exitCode=1;
