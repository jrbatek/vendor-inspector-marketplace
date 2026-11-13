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
const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const ids=["overview","resource-pool","mass-resource-connect","opportunities","active-inspections","reports-ncrs","contracts-commercials"];
async function active(page,id){
  try {
    await page.waitForFunction(expected=>document.querySelector('aside[aria-label="Agency Workspace navigation"] a[aria-current="page"]')?.getAttribute("href")==="#"+expected,id,{timeout:10000});
  } catch (error) {
    const detail=await page.evaluate(expected=>({
      expected,
      active:document.querySelector('aside[aria-label="Agency Workspace navigation"] a[aria-current="page"]')?.getAttribute("href"),
      scrollY:window.scrollY,viewport:window.innerHeight,documentHeight:document.documentElement.scrollHeight,
      targetTop:document.getElementById(expected)?.getBoundingClientRect().top,
      targetBottom:document.getElementById(expected)?.getBoundingClientRect().bottom
    }),id);
    throw new Error("Agency scrollspy section did not activate: "+JSON.stringify(detail),{cause:error});
  }
  const selected=await page.locator('aside[aria-label="Agency Workspace navigation"] a[aria-current="page"]').count();
  if(selected!==1)throw Error("Exactly one Agency sidebar item must be active; got "+selected);
}
try{
 await ready();browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 const errors=[];page.on("pageerror",e=>errors.push(e.stack||String(e)));
 // Homepage Agency CTA needs a valid target after the recruiting section was removed.
 await page.goto(base+"/",{waitUntil:"networkidle"});
 // Global Agency navigation must not advertise retired recruiting sections.
 const agencyToggle=page.getByRole("button",{name:/Agencies/});
 await agencyToggle.click();
 const agencyMenu=page.locator("#nav-agencies-menu");
 if(await agencyMenu.getByRole("link",{name:"Find Inspectors / Recruiting"}).count())
   throw Error("Global Agency dropdown still advertises deleted recruiting section");
 if(await agencyMenu.getByRole("link",{name:"Resource Pool"}).getAttribute("href")!=="/demo/agency#resource-pool")
   throw Error("Global Agency dropdown lost Resource Pool deep link");
 await agencyToggle.click();

 const resourceCta=page.getByRole("link",{name:/Explore Agency Resource Pool/});
 if(await resourceCta.getAttribute("href")!=="/demo/agency#resource-pool")
   throw Error("Homepage still points to removed Agency recruiting section");
 await resourceCta.click();
 await active(page,"resource-pool");
 if(!page.url().endsWith("/demo/agency#resource-pool"))
   throw Error("Homepage Resource Pool deep link did not stay inside Agency Demo");
 await page.goto(base+"/demo/agency",{waitUntil:"networkidle"});
 const nav=page.locator('aside[aria-label="Agency Workspace navigation"] nav');
 await nav.waitFor({state:"visible",timeout:15000});
 const hrefs=await nav.locator("a").evaluateAll(els=>els.map(a=>a.getAttribute("href")));
 if(hrefs.join(",")!==ids.map(x=>"#"+x).join(","))throw Error("Agency scrollspy navigation must have exactly seven ordered operational sections: "+hrefs);
 for(const id of ids)if(await page.locator("#"+id).count()!==1)throw Error("Missing or duplicate operational section "+id);
 for(const id of ["analytics","find-inspectors-recruiting","integrations","availability-capacity"])
   if(await page.locator("#"+id).count()!==0)throw Error("Obsolete Agency section still rendered: "+id);
 const searchAll=page.getByRole("link",{name:"Search all 2,823 resources"});
 if(await searchAll.getAttribute("href")!=="/demo/agency-resources")throw Error("Agency 2,823 pool entry is missing or broken");
 await active(page,"overview");
 await nav.getByRole("link",{name:"Mass Resource Connect"}).click();
 await active(page,"mass-resource-connect");
 await page.locator("#agency-roster-upload").setInputFiles({
   name:"fictional-roster.csv",mimeType:"text/csv",
   buffer:Buffer.from("Inspector ID,Name,Relationship,Country,Affiliation Status\nSYN-1001,Sample Inspector A,Employee,USA,Pending\nSYN-1002,Sample Inspector B,Subcontractor,Mexico,Pending\n")
 });
 const uploadSummary=await page.locator("#agency-roster-preview").innerText();
 if(!uploadSummary.includes("2 complete unique records")||!uploadSummary.includes("No records submitted"))
   throw Error("Mass Resource Connect did not preview fictional CSV rows without submitting them");
 const apiGuide=page.locator("#agency-api-connection-guide");
 if(await apiGuide.isVisible())throw Error("API setup guide should start collapsed");
 await page.getByRole("button",{name:"Connect API"}).click();
 if(!await apiGuide.isVisible())throw Error("Connect API did not open synthetic walkthrough");
 await apiGuide.getByRole("combobox",{name:"Example source"}).selectOption("Agency HRIS");
 await apiGuide.getByRole("button",{name:"Preview synthetic mapping"}).click();
 if(!await apiGuide.getByRole("status").getByText(/Dry run complete \(Agency HRIS\)/).isVisible())throw Error("Synthetic API preview not functional");
 await page.getByRole("button",{name:"Close API walkthrough"}).click();
 if(await apiGuide.isVisible())throw Error("API walkthrough failed to close");
 await nav.getByRole("link",{name:"Reports & NCRs"}).click();
 await active(page,"reports-ncrs");
 await page.waitForTimeout(600);
 await nav.getByRole("link",{name:"Contracts & Commercials"}).click();
 await page.waitForTimeout(1000);
 await active(page,"contracts-commercials");
 // Owner: every named fictional contract must open in-place and download a
 // readable, explicitly nonbinding PDF. Test real Chromium, not just unit bytes.
 const contracts=page.locator("#contracts-commercials .agreementCard");
 if(await contracts.count()!==3)throw Error("Agency needs three named synthetic contracts");
 const sample=contracts.first();
 await sample.getByRole("button",{name:"Open contract details"}).click();
 const detail=sample.getByRole("region",{name:"Synthetic agreement SYN-MSA-2026-001"});
 if(!await detail.isVisible() || !(await detail.innerText()).includes("Net 45"))
   throw Error("Agency fictional contract details did not open or lost commercial terms");
 const pdfEvent=page.waitForEvent("download",{timeout:15000});
 await sample.getByRole("button",{name:"Download fictional PDF SYN-MSA-2026-001"}).click();
 const downloaded=await pdfEvent;
 if(downloaded.suggestedFilename()!=="inspectsource-fictional-SYN-MSA-2026-001.pdf")
   throw Error("Agency fictional PDF download name is incorrect");
 const {readFile}=await import("node:fs/promises");
 const {PDFDocument}=await import("pdf-lib");
 const pdf=await PDFDocument.load(await readFile(await downloaded.path()));
 if(pdf.getPageCount()!==1 || !pdf.getTitle()?.includes("SYNTHETIC SAMPLE") ||
    !pdf.getSubject()?.includes("FICTIONAL"))
   throw Error("Downloaded Agency contract PDF lacks explicit nonbinding synthetic content");
 await page.evaluate(()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"}));
 await active(page,"contracts-commercials");
 await page.evaluate(()=>document.querySelector("#resource-pool")?.scrollIntoView({behavior:"instant",block:"start"}));
 await active(page,"resource-pool");
 await page.evaluate(()=>window.scrollTo({top:0,behavior:"instant"}));
 await active(page,"overview");
 await page.goto(base+"/demo/agency#opportunities",{waitUntil:"networkidle"});
 await active(page,"opportunities");
 if(await page.locator("#opportunities").count()!==1)throw Error("Deep-link did not preserve Opportunities content");
 // All fictional Agency Opportunity highlights remain on the long page and open.
 await nav.getByRole("link",{name:"Opportunities"}).click();
 await active(page,"opportunities");
 const featured=page.locator("#opportunities .featuredGrid article");
 if(await featured.count()!==4)throw Error("Expected four fictional Agency opportunity previews");
 await featured.first().getByRole("button",{name:"Preview Opportunity"}).click();
 if(!await featured.first().getByRole("region",{name:/Featured sample/}).isVisible())
   throw Error("Featured Agency opportunity preview not functional");
 const allOpportunities=page.getByRole("link",{name:/View\/Search all opportunities/});
 if(await allOpportunities.getAttribute("href")!=="/demo/agency-opportunities")
   throw Error("Agency opportunity search link is broken");
 
 // Same-document history must return to the correct operational section
 // without reloading the synthetic Agency one-page workspace.
 await nav.getByRole("link",{name:"Resource Pool"}).click();
 await active(page,"resource-pool");
 await nav.getByRole("link",{name:"Opportunities"}).click();
 await active(page,"opportunities");
 await page.goBack({waitUntil:"domcontentloaded"});
 await active(page,"resource-pool");
 assert((await page.evaluate(()=>location.hash))==="#resource-pool",
   "Agency browser Back lost the prior same-page sidebar anchor");
 await page.goForward({waitUntil:"domcontentloaded"});
 await active(page,"opportunities");
 assert((await page.evaluate(()=>location.hash))==="#opportunities",
   "Agency browser Forward lost the next same-page sidebar anchor");
 await nav.getByRole("link",{name:"Overview"}).focus();
 await page.keyboard.press("Enter");
 await active(page,"overview");
 if((await page.evaluate(()=>location.hash))!=="#overview")throw Error("Keyboard click did not set shareable anchor");
 await page.setViewportSize({width:390,height:844});
 await nav.getByRole("link",{name:"Resource Pool"}).click();
 await active(page,"resource-pool");
 if(errors.length)throw Error("Agency scrollspy browser exceptions: "+errors.join("\n"));
 console.log("Agency scrollspy PASS: 7 sections, one active link, smooth click/keyboard/hash/Back/Forward/manual up/down, mobile, removed obsolete sections");
}catch(e){console.error(e);process.exitCode=1}
finally{await browser?.close();if(server){server.kill("SIGTERM");setTimeout(()=>server.kill("SIGKILL"),2000).unref()}}
