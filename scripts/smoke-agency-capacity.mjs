import {spawn} from "node:child_process";
import {chromium} from "playwright";
const port=3117;
const base=process.env.AGENCY_BASE_URL||"http://127.0.0.1:"+port;
const child=process.env.AGENCY_BASE_URL?null:spawn(process.execPath,["node_modules/next/dist/bin/next","start","-p",String(port)],{
 env:{...process.env,NEXT_PUBLIC_SUPABASE_URL:process.env.NEXT_PUBLIC_SUPABASE_URL||"https://ci-placeholder.supabase.co",NEXT_PUBLIC_SUPABASE_ANON_KEY:process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||"ci-placeholder-anon-key"},stdio:["ignore","pipe","pipe"]
});
let output="",browser;
child?.stdout.on("data",x=>output+=x.toString());child?.stderr.on("data",x=>output+=x.toString());
async function ready(){for(let i=0;i<35;i++){try{if((await fetch(base+"/demo/agency")).ok)return}catch{}await new Promise(r=>setTimeout(r,1000))}throw Error("Agency server not ready: "+output.slice(-1200))}
try{
 await ready();browser=await chromium.launch({headless:true});
 const page=await browser.newPage();const errors=[];page.on("pageerror",e=>errors.push(e.stack||String(e)));
 await page.goto(base+"/demo/agency",{waitUntil:"networkidle"});
 await page.locator('aside[aria-label="Agency Workspace navigation"] nav').waitFor({state:"visible",timeout:15000});
 const resourceRows=page.locator("#resource-pool tbody tr");
 const resourceStatus=page.getByRole("combobox",{name:"Affiliation status"});
 const resourceSearch=page.getByRole("searchbox",{name:"Search fictional resources"});
 const resourceCount=page.locator("#resource-pool .rosterTools [role=status]");
 if(await resourceRows.count()!==5)throw Error("Expected five synthetic agency resources");
 await resourceStatus.selectOption({label:"Verified"});
 if(await resourceRows.count()!==2)throw Error("Two verified agency resources expected");
 await resourceSearch.fill("Maya Houston");
 if(await resourceRows.count()!==1||!(await resourceRows.first().innerText()).includes("Maya Chen"))throw Error("Combined affiliation/keyword search wrong");
 await resourceSearch.fill("Omar");
 if(await resourceRows.count()!==1||!(await resourceRows.first().innerText()).includes("Omar Haddad"))throw Error("Second verified synthetic inspector missing");
 await resourceStatus.selectOption({label:"Disputed"});
 if(await resourceRows.count()!==0)throw Error("Combined nonmatching filters should show empty state");
 if(await page.getByText("No fictional resources match these filters.").count()!==1)throw Error("No-results explanation missing");
 await page.getByRole("button",{name:"Reset resource filters"}).click();
 if(await resourceRows.count()!==5||await resourceSearch.inputValue()!==""||!(await resourceCount.innerText()).includes("5 of 2,823"))throw Error("Resource filters did not restore all fictional rows");
 // The owner-retired Availability & Capacity UI must remain absent, while the shared
 // 2,823 fictional resource directory is reachable from the five-row preview.
 if(await page.locator("#availability-capacity").count())throw Error("Retired Agency Capacity section reappeared");
 if(await page.locator('aside[aria-label="Agency Workspace navigation"] a[href="#availability-capacity"]').count())
   throw Error("Retired Capacity sidebar target reappeared");
 const fullPoolLink=page.getByRole("link",{name:"Search all 2,823 resources"});
 if(await fullPoolLink.getAttribute("href")!=="/demo/agency-resources")
   throw Error("Agency roster not linked to complete synthetic resource directory");
 await fullPoolLink.click();
 if(!page.url().includes("/demo/agency-resources"))
   throw Error("Synthetic resource directory is unreachable");
 await page.goBack({waitUntil:"networkidle"});
 await page.locator('#reports-ncrs').waitFor({state:"visible"});
 const {readFile}=await import("node:fs/promises");
 const ncrFilter=page.getByRole("combobox",{name:"Sample NCR status"});
 const reportRows=page.locator('#reports-ncrs tr[data-sample-ncr]');
 const ncrCount=page.locator('#reports-ncrs [role=status]');
 if(await reportRows.count()!==3)throw Error("Agency NCR demo needs three fictional records");
 for(const [focus,text] of [["Open","NCR-204"],["Follow-up","NCR-198"],["No NCR","Gulf Coast LNG"]]){
   await ncrFilter.selectOption(focus);
   if(await reportRows.count()!==1||!(await reportRows.first().innerText()).includes(text))
     throw Error("Agency NCR focus "+focus+" selected wrong row");
   if(!(await ncrCount.innerText()).includes("Showing 1 of 3"))throw Error("NCR filtered status not announced");
 }
 // Export only the currently selected fictional finding; never export unfiltered or live agency data.
 await ncrFilter.selectOption("Open");
 const ncrDownloadWait=page.waitForEvent("download");
 await page.getByRole("link",{name:"Download 1 filtered synthetic agency report and NCR examples as CSV"}).click();
 const ncrDownload=await ncrDownloadWait;
 if(ncrDownload.suggestedFilename()!=="inspectsource-synthetic-agency-reports-ncrs.csv")throw Error("Agency report CSV filename wrong");
 const reportCsv=await readFile(await ncrDownload.path(),"utf8");
 if(!reportCsv.startsWith("\uFEFF")||!reportCsv.includes("SYNTHETIC - NOT VERIFIED")||!reportCsv.includes("NCR-204")||reportCsv.includes("NCR-198")||reportCsv.includes("Gulf Coast LNG"))
   throw Error("Agency report CSV did not preserve selected fictional finding only");
 await page.getByRole("button",{name:"Reset NCR filter"}).click();
 if(await reportRows.count()!==3)throw Error("Agency NCR reset did not restore three sample reports");
 const agencyExamples=page.locator("#active-inspections article.agencyInspection");
 await agencyExamples.first().waitFor({state:"visible",timeout:15000});
 const agencyStage=page.getByRole("combobox",{name:"Agency inspection stage"});
 if(await agencyExamples.count()!==3)throw Error("Agency Demo should show exactly three clearly fictional inspection examples");
 const agencyExampleNames=["Gulf Coast LNG","Qatar compression package","Italian valve package"];
 for(const [i,project] of agencyExampleNames.entries()){
   const item=agencyExamples.nth(i);
   if(!(await item.innerText()).includes(project))throw Error("Agency example mismatch: "+project);
   await item.getByRole("button",{name:"Open Inspection"}).click();
   const detail=item.getByRole("region",{name:/Agency synthetic inspection details/});
   if(await detail.count()!==1)throw Error("Open Inspection detail missing for "+project);
   const detailText=await detail.innerText();
   for(const required of ["Vendor","Site","Contact","PO reference","Scope","Equipment","Milestone","Completed action","Report","NCR","Outstanding next action","example.invalid"]){
      if(!detailText.includes(required))throw Error("Agency detail missing "+required+" for "+project);
   }
   await item.getByRole("button",{name:"Close Inspection"}).click();
 }
 await agencyStage.selectOption("NCR follow-up");
 if(await agencyExamples.count()!==1||!(await agencyExamples.first().innerText()).includes("Italian valve package"))throw Error("Agency stage filter did not isolate fictional NCR example");
 await page.getByRole("button",{name:"Reset inspection stage"}).click();
 if(await agencyExamples.count()!==3)throw Error("Agency stage reset failed to restore three synthetic inspections");
 if(errors.length)throw Error("Agency capacity/NCR browser errors: "+errors.join("\n"));
 console.log("Agency five-of-2823 resource directory, retired capacity, reports/NCR and inspection detail Chromium PASS");
}catch(e){console.error(e);process.exitCode=1}
finally{await browser?.close();if(child){child.kill("SIGTERM");setTimeout(()=>child.kill("SIGKILL"),2000).unref()}}
