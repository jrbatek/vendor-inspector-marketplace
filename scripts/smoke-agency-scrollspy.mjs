import {spawn} from "node:child_process";
import {chromium} from "playwright";

const port=3119;
const base=process.env.AGENCY_BASE_URL||"http://127.0.0.1:"+port;
const server=process.env.AGENCY_BASE_URL?null:spawn(process.execPath,["node_modules/next/dist/bin/next","start","-p",String(port)],{
  env:{...process.env,NEXT_PUBLIC_SUPABASE_URL:process.env.NEXT_PUBLIC_SUPABASE_URL||"https://ci-placeholder.supabase.co",NEXT_PUBLIC_SUPABASE_ANON_KEY:process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||"ci-placeholder-anon-key"},
  stdio:["ignore","pipe","pipe"]
});
let output="",browser;
server?.stdout.on("data",x=>output+=String(x));
server?.stderr.on("data",x=>output+=String(x));
async function ready(){for(let i=0;i<40;i++){try{if((await fetch(base+"/demo/agency")).ok)return}catch{}await new Promise(r=>setTimeout(r,1000))}throw Error("Agency demo server unavailable: "+output.slice(-2000))}
const ids=["overview","resource-pool","bulk-upload","availability-capacity","opportunities","active-inspections","reports-ncrs","contracts-commercials"];
async function active(page,id){
  await page.waitForFunction(expected=>document.querySelector('aside[aria-label="Agency Workspace navigation"] a[aria-current="page"]')?.getAttribute("href")==="#"+expected,id,{timeout:10000});
  const selected=await page.locator('aside[aria-label="Agency Workspace navigation"] a[aria-current="page"]').count();
  if(selected!==1)throw Error("Exactly one Agency sidebar item must be active; got "+selected);
}
try{
 await ready();browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 const errors=[];page.on("pageerror",e=>errors.push(e.stack||String(e)));
 await page.goto(base+"/demo/agency",{waitUntil:"networkidle"});
 const nav=page.locator('aside[aria-label="Agency Workspace navigation"] nav');
 await nav.waitFor({state:"visible",timeout:15000});
 const hrefs=await nav.locator("a").evaluateAll(els=>els.map(a=>a.getAttribute("href")));
 if(hrefs.join(",")!==ids.map(x=>"#"+x).join(","))throw Error("Agency scrollspy navigation must have exactly eight ordered operational sections: "+hrefs);
 for(const id of ids)if(await page.locator("#"+id).count()!==1)throw Error("Missing or duplicate operational section "+id);
 for(const id of ["analytics","find-inspectors-recruiting","integrations"])
   if(await page.locator("#"+id).count()!==0)throw Error("Obsolete Agency section still rendered: "+id);
 await active(page,"overview");
 await nav.getByRole("link",{name:"Reports & NCRs"}).click();
 await active(page,"reports-ncrs");
 await page.waitForTimeout(600);
 await nav.getByRole("link",{name:"Contracts & Commercials"}).click();
 await page.waitForTimeout(1000);
 await active(page,"contracts-commercials");
 await page.evaluate(()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"}));
 await active(page,"contracts-commercials");
 await page.evaluate(()=>document.querySelector("#resource-pool")?.scrollIntoView({behavior:"instant",block:"start"}));
 await active(page,"resource-pool");
 await page.evaluate(()=>window.scrollTo({top:0,behavior:"instant"}));
 await active(page,"overview");
 await page.goto(base+"/demo/agency#opportunities",{waitUntil:"networkidle"});
 await active(page,"opportunities");
 if(await page.locator("#opportunities").count()!==1)throw Error("Deep-link did not preserve Opportunities content");
 await nav.getByRole("link",{name:"Overview"}).focus();
 await page.keyboard.press("Enter");
 await active(page,"overview");
 if((await page.evaluate(()=>location.hash))!=="#overview")throw Error("Keyboard click did not set shareable anchor");
 await page.setViewportSize({width:390,height:844});
 await nav.getByRole("link",{name:"Resource Pool"}).click();
 await active(page,"resource-pool");
 if(errors.length)throw Error("Agency scrollspy browser exceptions: "+errors.join("\n"));
 console.log("Agency scrollspy PASS: 8 sections, one active link, click/keyboard/hash/manual up/down, mobile, removed obsolete sections");
}catch(e){console.error(e);process.exitCode=1}
finally{await browser?.close();if(server){server.kill("SIGTERM");setTimeout(()=>server.kill("SIGKILL"),2000).unref()}}
