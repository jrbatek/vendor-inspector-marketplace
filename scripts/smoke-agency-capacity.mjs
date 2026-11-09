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
 const select=page.getByRole("combobox",{name:"Capacity region"});
 const cards=page.locator("#availability-capacity [data-capacity-region]");
 const status=page.locator("#availability-capacity [role=status]");
 if(await cards.count()!==4)throw Error("Expected four fictional region cards");
 if(!(await status.innerText()).includes("39 available / 95 resources"))throw Error("Incorrect overall capacity");
 for(const [region,available,capacity] of [["Gulf Coast",14,32],["Middle East",11,27],["Europe",8,21],["West Africa",6,15]]){
   await select.selectOption({label:region});
   if(await cards.count()!==1)throw Error(region+" filter did not isolate one card");
   if(!(await cards.first().innerText()).includes(available+" available / "+capacity))throw Error(region+" data mismatch");
   if(!(await status.innerText()).includes("Showing 1 of 4"))throw Error(region+" status mismatch");
 }
 // Export follows the selected fictional region, without hitting any live API.
 await select.selectOption({label:"Europe"});
 const downloadEvent=page.waitForEvent("download");
 await page.getByRole("link",{name:"Download 1 synthetic capacity regions as CSV"}).click();
 const download=await downloadEvent;
 if(download.suggestedFilename()!=="inspectsource-synthetic-agency-capacity.csv")throw Error("Capacity download filename wrong");
 const {readFile}=await import("node:fs/promises");
 const csv=await readFile(await download.path(),"utf8");
 if(!csv.startsWith("\uFEFF")||!csv.includes('"Europe","8","8","3","2","21"')||csv.includes('"Gulf Coast"')||!csv.includes("SYNTHETIC - NOT VERIFIED"))
   throw Error("Filtered capacity CSV is not synthetic, properly scoped, or export-safe");
 await page.getByRole("button",{name:"Reset capacity"}).click();
 if(await cards.count()!==4)throw Error("Reset did not restore all capacity regions");
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
 await page.getByRole("button",{name:"Reset NCR filter"}).click();
 if(await reportRows.count()!==3)throw Error("Agency NCR reset did not restore three sample reports");
 if(errors.length)throw Error("Agency capacity/NCR browser errors: "+errors.join("\n"));
 console.log("Agency capacity real-browser regional filter, totals, reset and anonymous demo PASS");
}catch(e){console.error(e);process.exitCode=1}
finally{await browser?.close();if(child){child.kill("SIGTERM");setTimeout(()=>child.kill("SIGKILL"),2000).unref()}}
