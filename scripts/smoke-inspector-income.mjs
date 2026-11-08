import { spawn } from "node:child_process";
import fs from "node:fs";
import { chromium } from "playwright";
import { PDFDocument } from "pdf-lib";

// Only public fictional demo content is inspected; never submit credentials or live data.
const port=3106;
const base=process.env.INSPECTOR_INCOME_BASE_URL||"http://127.0.0.1:"+port;
const server=process.env.INSPECTOR_INCOME_BASE_URL?null:spawn(process.execPath,[
  "node_modules/next/dist/bin/next","start","-p",String(port)
],{env:{...process.env,
    NEXT_PUBLIC_SUPABASE_URL:process.env.NEXT_PUBLIC_SUPABASE_URL||"https://ci-placeholder.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||"ci-placeholder-anon-key"
  },stdio:["ignore","pipe","pipe"]});
let output="",browser,failed=false;
server?.stdout.on("data",v=>output+=String(v));
server?.stderr.on("data",v=>output+=String(v));
const assert=(value,message)=>{if(!value)throw new Error(message);};
async function ready(){
 for(let i=0;i<35;i++){try{if((await fetch(base+"/demo/inspector-income")).ok)return;}catch{}
 await new Promise(resolve=>setTimeout(resolve,1000));}
 throw new Error("Income demo server unavailable: "+output.slice(-1500));
}
try{
 if(server)await ready();
 browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const page=await browser.newPage({acceptDownloads:true});
 const exceptions=[];page.on("pageerror",error=>exceptions.push(error.stack||String(error)));
 const response=await page.goto(base+"/demo/inspector-income",{waitUntil:"networkidle"});
 assert(response?.ok(),"Income Demo is not available");
 assert(await page.getByRole("heading",{name:"Income & Tax Center"}).count()===1,"Missing income hub");
 assert(await page.getByText(/Log in to view the client workspace/i).count()===0,"Unauthenticated demo opened live workspace");
 const yearSelector=page.getByRole("combobox",{name:"Tax and earnings year"});
 for(const [year,count] of [["2026",4],["2025",3],["2024",2]]){
   await yearSelector.selectOption(year);
   const pending=page.waitForEvent("download",{timeout:20000});
   await page.getByRole("button",{name:"Download synthetic income report PDF"}).click();
   const download=await pending;
   const fileName=download.suggestedFilename();
   assert(fileName==="inspectsource-synthetic-income-report-"+year+".pdf","Wrong downloaded filename: "+fileName);
   const bytes=fs.readFileSync(await download.path());
   assert(bytes.subarray(0,5).toString("ascii")==="%PDF-","Downloaded income file is not a PDF");
   const pdf=await PDFDocument.load(bytes);
   assert(pdf.getPageCount()===1,"PDF layout missing");
   assert((pdf.getTitle()||"").includes("FICTIONAL income report "+year),"Missing fictional title");
   assert((pdf.getSubject()||"").includes("UNVERIFIED SAMPLE; "+year+"; "+count+" fictional assignments"),"Wrong year's PDF assignment count");
   assert(exceptions.length===0,"Income Demo pageerror: "+exceptions.join("\n"));
   console.log("Income PDF browser download OK:",year,fileName,bytes.length);
 }
 assert((await page.locator('input[name="account"],input[name="routing"],input[name="iban"]').count())===0,"Demo must not collect bank account data");
 await page.close();
}catch(error){failed=true;console.error(error instanceof Error?error.stack:String(error),output.slice(-1500));}
finally{if(browser)await browser.close();if(server){server.kill("SIGTERM");await new Promise(resolve=>setTimeout(resolve,200));if(!server.killed)server.kill("SIGKILL");}}
if(failed)process.exitCode=1;
