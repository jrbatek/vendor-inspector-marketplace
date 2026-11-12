import {spawn} from "node:child_process";
import {chromium} from "playwright";
const port=3124;
const base=process.env.AGENCY_BASE_URL||"http://127.0.0.1:"+port;
const server=process.env.AGENCY_BASE_URL?null:spawn(process.execPath,["node_modules/next/dist/bin/next","start","-p",String(port)],{
  env:{...process.env,NEXT_PUBLIC_SUPABASE_URL:process.env.NEXT_PUBLIC_SUPABASE_URL||"https://ci-placeholder.supabase.co",NEXT_PUBLIC_SUPABASE_ANON_KEY:process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||"ci-placeholder-anon-key"},
  stdio:["ignore","pipe","pipe"]
});
let output="",browser;
server?.stdout.on("data",x=>output+=String(x));server?.stderr.on("data",x=>output+=String(x));
async function ready(){for(let i=0;i<40;i++){try{if((await fetch(base+"/demo/agency-resources")).ok)return}catch{}await new Promise(r=>setTimeout(r,1000))}throw Error("Agency resource demo unavailable: "+output.slice(-2000))}
try{
  await ready();browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  const errors=[];page.on("pageerror",e=>errors.push(e.stack||String(e)));
  await page.goto(base+"/demo/agency-resources",{waitUntil:"networkidle"});
  if(!await page.getByRole("heading",{name:"Search all 2,823 resources"}).isVisible())throw Error("2,823 resource total absent");
  if(!await page.getByRole("status").getByText(/of 2,823 matching synthetic resources/).isVisible())throw Error("All-resources count incorrect");
  await page.getByRole("searchbox",{name:"Search all fictional agency resources"}).fill("IS-20418");
  if(!await page.getByRole("heading",{name:"Maya Chen"}).isVisible())throw Error("Featured inspector ID search failed");
  if(await page.getByRole("heading",{name:"Omar Haddad"}).count())throw Error("Search did not filter out unrelated resource");
  await page.getByRole("button",{name:"View fictional resource"}).click();
  if(!await page.getByRole("region",{name:"Fictional resource preview"}).isVisible())throw Error("Sample resource detail did not open");
  await page.getByRole("button",{name:"Reset filters"}).click();
  await page.getByRole("button",{name:"Next page"}).click();
  if(!await page.getByText("Page 2 of 113").first().isVisible())throw Error("Pagination failed");
  await page.setViewportSize({width:390,height:844});
  await page.getByRole("combobox",{name:"Region"}).selectOption("Middle East");
  if(!await page.getByRole("status").getByText(/matching synthetic resources/).isVisible())throw Error("Mobile region filter broken");
  if(errors.length)throw Error("Agency resource browser errors: "+errors.join("\n"));
  console.log("Agency 2,823 synthetic resource browser PASS: search, detail, pagination, region, mobile");
}catch(e){console.error(e);process.exitCode=1}finally{await browser?.close();if(server){server.kill("SIGTERM");setTimeout(()=>server.kill("SIGKILL"),2000).unref()}}
