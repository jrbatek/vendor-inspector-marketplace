import { spawn } from "node:child_process";
import { chromium } from "playwright";

const port=3103, base=process.env.CLIENT_DEMO_BASE_URL || "http://127.0.0.1:"+port;
const child=process.env.CLIENT_DEMO_BASE_URL ? null : spawn(process.execPath,["node_modules/next/dist/bin/next","start","-p",String(port)],{
 env:{...process.env,NEXT_PUBLIC_SUPABASE_URL:process.env.NEXT_PUBLIC_SUPABASE_URL||"https://ci-placeholder.supabase.co",NEXT_PUBLIC_SUPABASE_ANON_KEY:process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||"ci-placeholder-anon-key"},stdio:["ignore","pipe","pipe"]
});
let serverOutput="",browser;const errors=[];
child?.stdout.on("data",x=>serverOutput+=x.toString());
child?.stderr.on("data",x=>serverOutput+=x.toString());
const assert=(value,message)=>{if(!value)throw new Error(message)};
async function ready(){
 for(let i=0;i<35;i++){try{if((await fetch(base+"/demo/client-inspections")).ok)return}catch{}await new Promise(r=>setTimeout(r,1000))}
 throw new Error("Demo server not ready: "+serverOutput.slice(-2000));
}
let failed=false;
try{
 if(child)await ready();
 browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const page=await browser.newPage();
 page.on("pageerror",e=>errors.push(e.stack||String(e)));
 await page.goto(base+"/demo/client",{waitUntil:"domcontentloaded"});
 const entry=page.locator('a[href="/demo/client-inspections"]').first();
 assert(await entry.count()===1,"Client Demo entry link to synthetic inspections missing");
 await entry.click();
 await page.waitForURL("**/demo/client-inspections");
 await page.locator("article.inspection").first().waitFor();
 assert(await page.locator("article.inspection").count()===7,"Expected seven synthetic active inspections");
 assert((await page.locator(".resultCount").innerText()).includes("7 of 7"),"Initial count is incorrect");
 assert(await page.getByText("Demo mode · No login required").count()===1,"Missing unauthenticated demo context");

 // Cross-filtered synthetic action register provides direct entry into open inspection detail.
 const actionRegister=page.getByRole("region",{name:"Outstanding action register"});
 assert(await actionRegister.locator("tbody tr").count()===7,"Action register must show all seven fictional outstanding actions");
 assert((await actionRegister.locator("tbody tr").first().innerText()).includes("Overdue"),"Oldest action should be flagged overdue");
 assert((await actionRegister.locator("tbody tr").nth(1).innerText()).includes("Due today"),"Second action should be flagged due today");
 await actionRegister.getByRole("link",{name:"Open inspection"}).first().click();
 assert(await page.locator("article.inspection .details").count()===1,"Action register drilldown must open exactly one inspection");
 assert((await page.locator("article.inspection .details").first().innerText()).includes("Pacific Hydrogen Hub"),"Action register must open the matching fictional inspection");
 await page.getByRole("button",{name:/Close Inspection/}).first().click();
 assert(await page.locator("article.inspection .details").count()===0,"Action register drilldown must close normally");
 const actionCsv=actionRegister.locator('a[download="inspectsource-synthetic-action-register.csv"]');
 assert(await actionCsv.count()===1,"Synthetic action CSV export link missing");
 const actionCsvData=decodeURIComponent((await actionCsv.getAttribute("href")).split(",").slice(1).join(","));
 assert(actionCsvData.includes("SYNTHETIC - NOT VERIFIED") && actionCsvData.includes("Pacific Hydrogen Hub") &&
   actionCsvData.includes("Vendor quality manager"),"Action CSV missing fictitious record or owner data");
 assert(actionCsvData.trim().split("\r\n").length===8,"Action CSV expected a header and seven rows");
 // Action triage is synthetic-only; order changes without losing any records.
 const actionGroup=page.getByRole("group",{name:"Sort synthetic inspections"});
 const dueButton=actionGroup.getByRole("button",{name:"Next action due"});
 const startButton=actionGroup.getByRole("button",{name:"Scheduled start"});
 const stageButton=actionGroup.getByRole("button",{name:"Delivery stage"});
 assert(await dueButton.getAttribute("aria-pressed")==="true","Action due sort must be selected by default");
 assert((await page.locator("article.inspection").first().innerText()).includes("Pacific Hydrogen Hub"),"Earliest next action must appear first");
 await startButton.click();
 assert(await startButton.getAttribute("aria-pressed")==="true","Scheduled start sort not selected");
 assert((await page.locator("article.inspection").first().innerText()).includes("Coral Offshore Development"),"Earliest scheduled start must appear first");
 await stageButton.click();
 assert(await stageButton.getAttribute("aria-pressed")==="true","Delivery stage sort not selected");
 assert((await page.locator("article.inspection").first().innerText()).includes("Gulf Horizon Refinery Upgrade"),"Delivery stage order did not restore the workflow");
 await dueButton.click();
 assert(await page.locator("article.inspection .nextAction").count()===7,"Next-action text and due dates must be visible on every card");
 assert(await page.locator("article.inspection").count()===7,"Sorting must not change results count");
 // Fixed fictional demo reference date: 1 overdue (Nov 7) and 1 due today (Nov 8).
 const dueFocus=page.getByRole("group",{name:"Outstanding-action urgency"});
 await dueFocus.getByRole("button",{name:"Due or overdue (2)"}).click();
 assert(await page.locator("article.inspection").count()===2,"Due-action focus must show exactly two synthetic inspections");
 assert(await dueFocus.getByRole("button",{name:"Due or overdue (2)"}).getAttribute("aria-pressed")==="true","Due-action filter selected state missing");
 assert((await page.locator("article.inspection").allInnerTexts()).every(text=>text.includes("Atlantic LNG Terminal")||text.includes("Pacific Hydrogen Hub")),"Incorrect due-action cohort");
 await dueFocus.getByRole("button",{name:"All active"}).click();
 assert(await page.locator("article.inspection").count()===7,"Due-action clear did not restore seven inspections");

 // NCR follow-up triage composes with the other filters and remains demo-local.
 const ncrFocus=page.getByRole("group",{name:"Non-conformance focus"});
 const ncrOnlyButton=ncrFocus.getByRole("button",{name:"With open NCR (1)"});
 await ncrOnlyButton.click();
 assert(await ncrOnlyButton.getAttribute("aria-pressed")==="true","Selected NCR-only focus is not visible");
 assert(await page.locator("article.inspection").count()===1,"Open-NCR focus must show the single fictional case");
 assert((await page.locator("article.inspection").first().innerText()).includes("Pacific Hydrogen Hub"),"Open-NCR focus selected the wrong inspection");
 await dueFocus.getByRole("button",{name:"Due or overdue (2)"}).click();
 assert(await page.locator("article.inspection").count()===1,"NCR and overdue focus must compose");
 await page.getByRole("searchbox",{name:"Search inspections"}).fill("Bayou");
 assert(await page.locator("article.inspection").count()===0,"NCR focus and keyword must compose to empty state");
 await page.getByRole("button",{name:"Reset filters"}).click();
 assert(await page.locator("article.inspection").count()===7,"Reset must clear NCR, urgency and search filters");
 assert(await ncrFocus.getByRole("button",{name:"All NCR statuses"}).getAttribute("aria-pressed")==="true","Reset did not restore all NCR statuses");
 assert((await page.getByText(/Log in to view the client workspace/i).count())===0,"Authenticated workspace leaked into Client Demo");
 const stages=await page.locator("article.inspection .stage").allTextContents();
 assert(new Set(stages.map(s=>s.trim())).size===7,"Expected seven distinct inspection stages");
 for(let i=0;i<7;i++){
   const card=page.locator("article.inspection").nth(i);
   const open=card.getByRole("button",{name:/Open Inspection/});
   await open.click();
   const details=card.locator(".details");
   await details.waitFor();
   for(const heading of ["Client, project and site","Milestones","Reports · SAMPLE ONLY","NCRs","Outstanding actions"]){
     assert(await details.getByRole("heading",{name:heading}).count()===1,"Missing detail heading: "+heading+" in inspection "+i);
   }
   const ncrToggle=details.getByRole("button",{name:"Open corrective-action details"});
   if(await ncrToggle.count()){
     assert(await ncrToggle.getAttribute("aria-expanded")==="false","Synthetic NCR case should start collapsed");
     await ncrToggle.click();
     const caseDetails=details.getByRole("region",{name:/Corrective-action details for SAMPLE-NCR-001/});
     assert(await caseDetails.count()===1,"Opening NCR should expose fictional corrective-action workspace");
     for(const evidence of ["Major","Vendor quality manager","material traceability matrix","mill certificates","Verification / next decision"]){
       assert((await caseDetails.innerText()).includes(evidence),"Missing sample NCR case evidence: "+evidence);
     }
     await details.getByRole("button",{name:"Hide corrective-action details"}).click();
     assert(await caseDetails.count()===0,"NCR case should collapse without changing inspection");
   }
   const href=await details.locator('a[href^="/api/demo/report"]').first().getAttribute("href");
   assert(href?.includes("download=1"),"Missing synthetic report download for inspection "+i);
   if(i===0 || i===6){
     const pdf=await page.request.get(base+href);
     assert(pdf.ok(),"Synthetic inspection report failed: "+pdf.status());
     assert((pdf.headers()["content-type"]||"").includes("application/pdf"),"Report is not a PDF");
     assert((await pdf.body()).subarray(0,5).toString()==="%PDF-","Report lacks valid PDF header");
   }
   await card.getByRole("button",{name:/Close Inspection/}).click();
   assert(await card.locator(".details").count()===0,"Inspection details did not close");
 }
 const search=page.getByRole("searchbox",{name:"Search inspections"});
 await search.fill("BAYOU vessel");
 assert(await page.locator("article.inspection").count()===1,"Vendor keyword search should find one fictional inspection");
 assert((await page.locator("article.inspection").first().innerText()).includes("Gulf Horizon Refinery"),"Wrong vendor keyword search result");
 await search.fill("SAMPLE-NCR-001");
 assert(await page.locator("article.inspection").count()===1,"NCR keyword search must find one fictional inspection");
 assert((await page.locator("article.inspection").first().innerText()).includes("Pacific Hydrogen Hub"),"Wrong NCR keyword search result");
 await search.fill("not a real project");
 assert(await page.locator("article.inspection").count()===0,"Unknown keyword search must yield zero results");
 await page.getByRole("button",{name:"Reset filters"}).click();
 assert(await search.inputValue()==="","Reset filters must clear inspection keyword search");
 assert(await page.locator("article.inspection").count()===7,"Reset after keyword search must restore seven inspections");
 const status=page.getByLabel("Status / stage"),project=page.getByLabel("Project",{exact:true}),inspector=page.getByLabel("Inspector",{exact:true});
 const actionOwner=page.getByLabel("Action owner",{exact:true});
 assert(await actionOwner.locator("option").count()===8,"Expected seven fictional action owners and an All reset choice");
 await actionOwner.selectOption({label:"Vendor quality manager"});
 assert(await page.locator("article.inspection").count()===1,"Action owner must isolate the fictional NCR follow-up inspection");
 assert((await page.locator("article.inspection").first().innerText()).includes("Pacific Hydrogen Hub"),"Action-owner search selected wrong inspection");
 await page.getByRole("group",{name:"Non-conformance focus"}).getByRole("button",{name:"With open NCR (1)"}).click();
 assert(await page.locator("article.inspection").count()===1,"Action owner must compose with NCR status");
 await actionOwner.selectOption({label:"Client quality lead"});
 assert(await page.locator("article.inspection").count()===0,"Non-matching owner and NCR filters must show no results");
 await page.getByRole("button",{name:"Reset filters"}).click();
 assert(await actionOwner.inputValue()==="","Reset must restore all action owners");
 assert(await page.locator("article.inspection").count()===7,"Action owner reset must restore all seven records");

 // P0-B: visually inspect real browser computed colors for all five inspection filters.
 for (const label of ["Status / stage","Project","Inspector","Action owner","Scheduled from","Scheduled through"]) {
   const control=page.getByLabel(label,{exact:true});
   const colors=await control.evaluate(element=>{const style=getComputedStyle(element);return {text:style.color,background:style.backgroundColor,border:style.borderTopColor}});
   assert(colors.text==="rgb(15, 23, 42)" && colors.background==="rgb(255, 255, 255)" && colors.border==="rgb(100, 116, 139)",
     "Client Inspection "+label+" filter is visually illegible: "+JSON.stringify(colors));
 }
 await status.selectOption({index:1});
 assert(await page.locator("article.inspection").count()===1,"Status filter should show one inspection");
 await page.getByRole("button",{name:"Reset filters"}).click();
 await project.selectOption({index:1});
 assert(await page.locator("article.inspection").count()===1,"Project filter should show one inspection");
 await page.getByRole("button",{name:"Reset filters"}).click();
 await inspector.selectOption({index:1});
 assert(await page.locator("article.inspection").count()===1,"Inspector filter should show one inspection");
 await page.getByRole("button",{name:"Reset filters"}).click();
 await page.getByLabel("Scheduled from").fill("2026-11-20");
 await page.getByLabel("Scheduled through").fill("2026-11-20");
 assert(await page.locator("article.inspection").count()===1,"Inclusive date-overlap filter should show one inspection");
 await page.getByRole("button",{name:"Reset filters"}).click();
 await page.getByLabel("Scheduled from").fill("2027-01-01");
 assert(await page.locator("article.inspection").count()===0,"Empty future date should yield zero inspections");
 assert(await page.getByText("No inspections match these filters").count()===1,"No-results explanation missing");
 await page.getByRole("button",{name:"Show all inspections"}).click();
 assert(await page.locator("article.inspection").count()===7,"Reset should restore all seven inspections");
 await page.getByLabel("Scheduled from").fill("2026-11-10");
 await page.getByLabel("Scheduled through").fill("2026-11-01");
 assert(await page.getByRole("alert").count()>=1,"Reversed date range needs accessible warning");
 const invalidDateBorder=await page.getByLabel("Scheduled from").evaluate(element=>getComputedStyle(element).borderTopColor);
 assert(invalidDateBorder==="rgb(185, 28, 28)","Invalid date-range filter must have a visible red border, got "+invalidDateBorder);
 await page.getByRole("button",{name:"Reset filters"}).click();
 assert(await page.locator("article.inspection").count()===7,"Second reset did not restore all inspections");
 const analytics=page.locator('a[href="/demo/client-analytics"]').first();
 assert(await analytics.count()===1,"Cross-demo Analytics navigation missing");
 await analytics.click();
 await page.waitForURL("**/demo/client-analytics");
 assert((await page.getByText(/Log in to view the client workspace/i).count())===0,"Cross-demo link led to authenticated shell");
 await page.goto(base+"/client-dashboard",{waitUntil:"domcontentloaded"});
 await page.waitForURL(url=>url.pathname==="/login",{timeout:20000});
 assert((await page.getByText(/Log in to view the client workspace/i).count())===0,"Unauthenticated live route exposed dead client shell");
 assert(errors.length===0,"Browser page errors: "+errors.join("\n"));
 console.log("Client Demo browser OK: seven inspections, due/overdue action focus, details, PDF, filters, cross-demo navigation and live Login redirect.");
}catch(e){failed=true;console.error(e instanceof Error?e.stack:String(e));console.error("Local server tail:",serverOutput.slice(-1800))}
finally{if(browser)await browser.close();if(child){child.kill("SIGTERM");await new Promise(r=>setTimeout(r,250));if(!child.killed)child.kill("SIGKILL")}}
if(failed)process.exitCode=1;
