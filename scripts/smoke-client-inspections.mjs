import { spawn } from "node:child_process";
import { chromium } from "playwright";

const port=3103, base=process.env.CLIENT_DEMO_BASE_URL || "http://127.0.0.1:"+port;
const child=process.env.CLIENT_DEMO_BASE_URL ? null : spawn(process.execPath,["node_modules/next/dist/bin/next","start","-p",String(port)],{
 env:{...process.env,NEXT_PUBLIC_SUPABASE_URL:process.env.NEXT_PUBLIC_SUPABASE_URL||"https://ci-placeholder.supabase.co",NEXT_PUBLIC_SUPABASE_ANON_KEY:process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||"ci-placeholder-anon-key"},stdio:["ignore","pipe","pipe"]
});
let serverOutput="",browser;const errors=[],inspectionHistoryTrace=[];
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
 let page=await browser.newPage();
 page.on("pageerror",e=>errors.push(e.stack||String(e)));
 await page.goto(base+"/demo/client",{waitUntil:"domcontentloaded"});
  // All seven cards show distinct clearly fictional client organizations, not numbered
  // placeholders. Reviewers can distinguish the client before opening details.
  const clientCompanies=page.locator("#inspections-in-progress article.inspection .clientName");
  await clientCompanies.first().waitFor();
  const clientLabels=await clientCompanies.allTextContents();
  assert(clientLabels.length===7 && new Set(clientLabels).size===7 &&
    clientLabels.every(label=>label.trim().startsWith("Client · Fictional · ")),
    "Client Demo inspection cards must display seven distinct, clearly fictional client company names");
  // Verify rendered Client content never reveals Inspector-only private appointment titles.
  const clientVisibleText=await page.locator("body").innerText();
  for(const privateTitle of ["Doctor Appointment","Our Anniversary"]){
    assert(!clientVisibleText.includes(privateTitle),
      "Inspector-private calendar title leaked into Client Demo: "+privateTitle);
  }
  assert(!clientVisibleText.includes("Log in to view the client workspace"),
    "Public Client Demo rendered an authenticated workspace login shell");

 // Owner Nov 11: three independent Request Inspectors methods must be full-width,
 // vertically stacked in the specified order on desktop and narrow mobile screens.
 const requestCards=page.locator(".requestOptions > article");
 assert(await requestCards.count()===3,"Client Request Inspectors must expose three distinct methods");
 const headings=await requestCards.locator(":scope > h2").allTextContents();
 assert(headings.join("|")==="Natural Language – AI|Email Requirements|Structured Selection",
  "Client request method order or labels regressed: "+headings.join("|"));
 for(const width of [1366,390]){
  await page.setViewportSize({width,height:900});
  const boxes=await requestCards.evaluateAll(nodes=>nodes.map(node=>{const {x,y,width}=node.getBoundingClientRect();return {x,y,width}}));
  assert(boxes.every((box,i)=>i===0 || (box.y>boxes[i-1].y+20 && Math.abs(box.x-boxes[0].x)<3)),
   "Client methods no longer stacked vertically at "+width+"px: "+JSON.stringify(boxes));
  if(width===1366)assert(boxes.every(box=>box.width>600),
   "Client request methods must be full available content width on desktop: "+JSON.stringify(boxes));
 }
 await page.setViewportSize({width:1366,height:900});
 // Natural-language intake remains functional inside the same public Client Demo.
 const natural=page.locator("#natural-language");
 const request=natural.getByRole("textbox",{name:"Inspection requirement"});
 assert(await request.getAttribute("aria-describedby") === "demo-request-limit",
   "Client scope textarea refers to a nonexistent upload status when no upload is pending");
 const originalText=await request.inputValue();
 const previewButton=natural.getByRole("button",{name:"Preview request (demo)"});
 const shortlist=natural.locator("#demo-shortlist");
 const candidates=shortlist.locator("article");
 const previewStatus=natural.locator(".naturalPreview");
 assert(await page.locator("#demo-shortlist").count()===0,"Candidate results appeared before a request preview");
 await previewButton.click();
 const resultsHeading=shortlist.getByRole("heading",{name:"Candidate CVs"});
 await resultsHeading.waitFor({state:"visible"});
 await page.waitForFunction(()=>{
   const heading=document.querySelector("#demo-shortlist h2, #demo-shortlist h3");
   if(!heading)return false;
   const box=heading.getBoundingClientRect();
   return box.top>=0 && box.bottom<=window.innerHeight;
 });
 const localPreview=await previewStatus.innerText();
 assert(/demo|fictional|synthetic/i.test(await shortlist.innerText()),"Natural-language results must identify demo candidates");
 const candidateCount=await candidates.count();
 assert(candidateCount>=2,"The Houston request did not return two candidate CVs");
 const candidateIds=new Set();
 const assignmentsSeen=new Set();
 for(const candidate of await candidates.all()){
   const summary=await candidate.innerText();
   const candidateName=await candidate.locator("h4").innerText();
   assert(["Avery Calder","Maya Ellison"].includes(candidateName),"Client CV preview did not show a fictional inspector name");
   assert(summary.includes("Fictional inspector"),"Client candidate card lost its explicit synthetic labeling");
   const candidateId=summary.match(/\bIS-\d+\b/)?.[0];
   assert(candidateId&&!candidateIds.has(candidateId),"Candidate cards must show distinct inspector IDs");
   candidateIds.add(candidateId);
   assert(/API\s*570/i.test(summary)&&/availab/i.test(summary)&&/(?:\$|USD\s*)\s*\d/.test(summary),
     "Candidate "+candidateId+" must show its qualification, availability and rate before opening a CV");
   const cv=candidate.locator("details");
   const toggle=cv.locator("summary").filter({hasText:/View CV/i});
   await toggle.click();
   assert(await cv.evaluate(details=>details.open),"View CV did not expand the profile for "+candidateId);
   const resume=await cv.innerText();
   assert(/Relevant experience/i.test(resume)&&/Assignment history/i.test(resume),
     "Expanded CV is missing relevant experience or assignment history for "+candidateId);
   const assignments=await cv.locator("li:visible").allTextContents();
   assert(assignments.length>0 && assignments.every(entry=>entry.trim().length>20) &&
     assignments.some(entry=>!assignmentsSeen.has(entry)),
     "Expanded CV must show substantive assignment history specific to "+candidateId);
   assignments.forEach(entry=>assignmentsSeen.add(entry));
   if(candidateIds.size===1){
     const [download]=await Promise.all([
       page.waitForEvent("download"),
       cv.getByText("Download CV (PDF)",{exact:true}).click()
     ]);
     const filename=download.suggestedFilename();
     assert(filename.includes(candidateId)&&filename.endsWith(".pdf"),"Downloaded CV filename must identify its candidate");
      assert(filename.includes(candidateName.replace(/[^a-zA-Z0-9]+/g,"-")),"Downloaded CV filename must include the fictional inspector name");
     const chunks=[];
     for await(const chunk of await download.createReadStream())chunks.push(chunk);
     const pdf=Buffer.concat(chunks);
     assert(pdf.subarray(0,5).toString()==="%PDF-"&&pdf.includes(Buffer.from("%%EOF")),
       "Downloaded candidate CV is not a complete PDF");
     const downloadNotice=candidate.getByRole("status").filter({hasText:"Fictional CV PDF prepared."});
     await downloadNotice.waitFor({state:"visible"});
     assert((await downloadNotice.innerText()).includes("Check your browser downloads"),
       "Successful demo CV PDF preparation did not announce its result");
     const noticeColor=await downloadNotice.evaluate(node=>getComputedStyle(node).color);
     assert(noticeColor==="rgb(17, 94, 89)",
       "Fictional CV PDF success feedback is no longer legible: "+noticeColor);
   }
   await toggle.click();
   assert(!await cv.evaluate(details=>details.open),"The CV for "+candidateId+" did not collapse");
 }
 assert(page.url().includes("/demo/client"),"Natural-language preview navigated away from the public Client Demo");
 // A rejected upload must not erase a valid, already-reviewed synthetic preview.
 await natural.locator('input[type="file"]').setInputFiles({
   name:"invalid-scope.pdf",mimeType:"application/pdf",buffer:Buffer.from("%PDF-fictional")
 });
 assert(await request.getAttribute("aria-describedby") === "demo-request-limit demo-upload-status",
   "Client scope textarea must describe the visible upload rejection message");
 assert((await natural.locator("#demo-upload-status").innerText()).includes("accepts TXT"),
   "Unsupported scope upload did not provide actionable validation feedback");
 assert(await request.inputValue()===originalText,
   "Unsupported scope upload replaced a drafted requirement");
 assert((await natural.locator(".naturalPreview").innerText())===localPreview,
   "Unsupported scope upload erased a valid previously generated preview");
 assert(await candidates.count()===candidateCount,"Unsupported scope upload erased the candidate CVs");
 await natural.locator('input[type="file"]').setInputFiles({
   name:"large-scope.txt",mimeType:"text/plain",buffer:Buffer.alloc(256*1024+1,66)
 });
 assert((await natural.locator("#demo-upload-status").innerText()).includes("over the 256 KB"),
   "Oversize scope upload did not report its size limit");
 assert((await natural.locator(".naturalPreview").innerText())===localPreview,
   "Oversize scope upload erased a valid previously generated preview");
 assert(await candidates.count()===candidateCount,"Oversize scope upload erased the candidate CVs");
 // Missing dates must not be presented as verified availability.
 await request.fill("We need an API 570 piping inspector in Houston for a December turnaround.");
 await shortlist.waitFor({state:"detached"});
 await previewButton.click();
 assert((await previewStatus.innerText()).includes("specific inspection start date") && await shortlist.count()===0,
   "Undated Client request must ask for an explicit inspection start rather than presenting available CVs");
 // An impossible explicit completion date must be explained, not rolled to another month.
 await request.fill("We need an API 570 piping inspector in Houston starting December 7, 2026 through November 31, 2026.");
 await previewButton.click();
 assert((await previewStatus.innerText()).includes("real calendar end date") && await shortlist.count()===0,
   "Impossible client completion date must be rejected before presenting fictional availability");
 await request.fill("We need an API 570 piping inspector in Houston starting December 7, 2026 through December 1, 2026.");
 await previewButton.click();
 assert((await previewStatus.innerText()).includes("end date on or after the requested start date") && await shortlist.count()===0,
   "A real but reversed completion date must produce actionable guidance, not fictional availability");
 // A yearless completion after New Year uses 2027 and must not reject a
 // genuinely available fictional inspector as a reversed 2026 date.
 await request.fill("We need an API 570 piping inspector in Houston starting December 29, 2026 through January 5.");
 await previewButton.click();
 await shortlist.waitFor({state:"visible"});
 assert(await candidates.count()===1 && (await candidates.first().innerText()).includes("Maya Ellison"),
   "Cross-year fictional availability should retain the agency inspector through January 5, 2027");
 // Keep the unsupported-certification regression separately dated so it checks
 // the actual credential gate, not the missing-date gate.
 await request.fill("We need an API 653 tank inspector in Houston starting December 7, 2026 for a three-week turnaround.");
 await previewButton.click();
 await shortlist.waitFor({state:"visible"});
 assert(await candidates.count()===0 && /\b(?:no|0)\b/i.test(await previewStatus.innerText()),
   "An unsupported certification must return an explicit empty result without stale candidate CVs");
 await request.fill("");
 await shortlist.waitFor({state:"detached"});
 await previewButton.click();
 assert((await previewStatus.innerText()).includes("at least 20 characters")&&await shortlist.count()===0,
   "An empty request must explain the minimum scope length without showing candidate CVs");
 await request.fill("short");
 assert(await natural.locator(".naturalPreview").count()===0,"Preview status stayed stale after editing the scope");
 await natural.getByRole("button",{name:"Preview request (demo)"}).click();
 assert((await natural.locator(".naturalPreview").innerText()).includes("at least 20 characters"),
   "Natural-language intake failed to validate a nearly empty request");
 await natural.locator('input[type="file"]').setInputFiles({
   name:"fictional-oversize.txt",mimeType:"text/plain",buffer:Buffer.alloc(256*1024+1,65)
 });
 assert((await natural.locator("#demo-upload-status").innerText()).includes("over the 256 KB"),
   "Natural-language upload failed to reject oversized demo file before reading it");
 assert(await request.inputValue()==="short","Oversize scope upload replaced the user's existing draft");
 // Re-selecting a corrected file with the same name must work; empty files
 // must not erase a drafted inspection request.
 const scopeInput=natural.locator('input[type="file"]');
 await scopeInput.setInputFiles({name:"scope-demo.txt",mimeType:"text/plain",buffer:Buffer.from("   ")});
 await page.waitForFunction(()=>document.querySelector("#demo-upload-status")?.textContent?.includes("scope file is empty"));
 assert(await request.inputValue()==="short","Empty uploaded file erased the existing inspection scope");
 assert(await scopeInput.inputValue()==="","Scope file input must reset to allow selecting an updated file with the same name");
 await request.fill(originalText);
 await previewButton.click();
 await candidates.first().waitFor({state:"visible"});
 const corrected="Synthetic scope: API 510 vessel inspection, Houston FAT, supplier dossier verification.";
 await scopeInput.setInputFiles({name:"scope-demo.txt",mimeType:"text/plain",buffer:Buffer.from(corrected)});
 await page.waitForFunction(text=>document.querySelector("#natural-language textarea")?.value===text,corrected);
 assert(await request.inputValue()===corrected,"Corrected same-name scope file was not loaded");
 assert(await natural.locator(".naturalPreview").count()===0,"Successful scope replacement left a stale preview visible");
 assert(await shortlist.count()===0,"Successful scope replacement left obsolete candidate CVs visible");
 assert((await natural.locator("#demo-upload-status").innerText()).includes("Loaded scope-demo.txt"),
   "Successful scope upload should announce its filename before any edits");
 await request.fill(originalText);
 await natural.locator("#demo-upload-status").waitFor({state:"detached",timeout:8000});
 assert(await natural.locator("#demo-upload-status").count()===0,
   "Manually edited Client scope retained a stale Loaded filename status");
 assert(await request.getAttribute("aria-describedby") === "demo-request-limit",
   "Client scope textarea kept a stale aria-describedby reference after editing");
 // Browser-local File.text() can resolve out of order; only the newest request may win.
 await page.evaluate(()=>{
   const nativeText=File.prototype.text;
   window.__resolveSlowClientScope=null;
   File.prototype.text=function(){
     if(this.name==="delayed-scope.txt")return new Promise(resolve=>{window.__resolveSlowClientScope=resolve;});
     return nativeText.call(this);
   };
 });
 const delayedScope={name:"delayed-scope.txt",mimeType:"text/plain",buffer:Buffer.from("old delayed scope")};
 await scopeInput.setInputFiles(delayedScope);
 await page.waitForFunction(()=>typeof window.__resolveSlowClientScope==="function");
 const latestText="Newest fictional scope: API 570 inspection in Houston with staged FAT witness plan.";
 await scopeInput.setInputFiles({name:"fresh-scope.txt",mimeType:"text/plain",buffer:Buffer.from(latestText)});
 await page.waitForFunction(text=>document.querySelector("#natural-language textarea")?.value===text,latestText);
 await page.evaluate(()=>window.__resolveSlowClientScope("Old fictional delayed requirements that must not replace the latest scope."));
 await page.waitForTimeout(120);
 assert(await request.inputValue()===latestText,"Delayed Client scope upload replaced a newer selected scope");
 await page.evaluate(()=>{window.__resolveSlowClientScope=null;});
 await scopeInput.setInputFiles(delayedScope);
 await page.waitForFunction(()=>typeof window.__resolveSlowClientScope==="function");
 const manuallyEdited="Manually edited fictional inspection scope while file is loading.";
 await request.fill(manuallyEdited);
 await page.evaluate(()=>window.__resolveSlowClientScope("Old fictional delayed scope that must not overwrite text edits."));
 await page.waitForTimeout(120);
 assert(await request.inputValue()===manuallyEdited,"Delayed Client scope upload overwrote manually edited requirements");
 await request.fill(originalText);
 // The embedded email and structured controls must actually work in Chromium.
 const emailCard=page.locator("#email-requirements");
 // Next.js hydration and clipboard promises are asynchronous: await client
 // initialization and observable status instead of racing React's state flush.
 await page.waitForLoadState("networkidle");
 await emailCard.getByRole("button",{name:"Copy Sample Request"}).click();
 await page.waitForFunction(
   () => /Sample request copied|Clipboard unavailable/.test(
     document.querySelector("#email-requirements [role=status]")?.textContent||""),
   null,{timeout:8000}
 );
 assert(/Sample request copied|Clipboard unavailable/.test(await emailCard.getByRole("status").innerText()),
   "On-page Email Requirements copy action did not return accessible feedback");
 const structured=page.locator("#structured-selection");
 // P0-B: inline intake controls must have readable normal, hovered, focused
 // and disabled styles, including on mobile where theme defaults may differ.
 for (const [field,label] of [
   [natural.getByRole("textbox",{name:"Inspection requirement"}),"Natural Language scope"],
   [structured.getByLabel("Geography"),"Structured geography"],
   [structured.getByLabel("Inspection start"),"Structured date"]
 ]) {
   const colors=await field.evaluate(node=>({
     foreground:getComputedStyle(node).color,background:getComputedStyle(node).backgroundColor
   }));
   assert(colors.foreground==="rgb(15, 23, 42)"&&colors.background==="rgb(255, 255, 255)",
     label+" must have explicit dark text on white background");
   await field.hover();
   assert(await field.evaluate(node=>getComputedStyle(node).borderTopColor)==="rgb(15, 118, 110)",
     label+" hover border must remain visible");
   await field.focus();
   assert(parseFloat(await field.evaluate(node=>getComputedStyle(node).outlineWidth))>=3,
     label+" focus outline must remain visible");
   await field.evaluate(node=>node.setAttribute("disabled",""));
   const disabled=await field.evaluate(node=>({
     foreground:getComputedStyle(node).color,background:getComputedStyle(node).backgroundColor,
     opacity:getComputedStyle(node).opacity
   }));
   assert(disabled.foreground==="rgb(51, 65, 85)"&&disabled.background==="rgb(241, 245, 249)"&&Number(disabled.opacity)===1,
     label+" disabled state cannot become invisible");
   await field.evaluate(node=>node.removeAttribute("disabled"));
 }

 await structured.getByLabel("Geography").selectOption("Europe");
 await structured.getByLabel("Required certification").selectOption("AWS CWI");
 await structured.getByLabel("Minimum experience (years)").fill("7");
 await structured.getByRole("button",{name:"Preview selected criteria"}).click();
 const criteriaStatus=await structured.getByRole("status").innerText();
 assert(criteriaStatus.includes("Europe")&&criteriaStatus.includes("AWS CWI")&&criteriaStatus.includes("7+ years")&&
   criteriaStatus.includes("no production matching, commercial offer or production request was created"),
   "Structured Selection failed to preview changed fictional criteria safely");
 // A previous summary is no longer current once the user changes any input.
 await structured.getByLabel("Geography").selectOption("Middle East");
 assert(await structured.getByRole("status").count()===0,
   "Structured preview remained visible after changing geography");
 await structured.getByRole("button",{name:"Preview selected criteria"}).click();
 assert((await structured.getByRole("status").innerText()).includes("Middle East"),
   "Structured preview did not reflect updated geography");
 await structured.getByLabel("Required certification").selectOption("API 510");
 assert(await structured.getByRole("status").count()===0,
   "Structured preview remained visible after changing qualification");
 await structured.getByRole("button",{name:"Preview selected criteria"}).click();
 assert((await structured.getByRole("status").innerText()).includes("API 510"),
   "Structured preview did not reflect updated certification");
 await structured.getByRole("button",{name:"Reset criteria"}).click();
 assert(await structured.getByLabel("Geography").inputValue()==="Gulf Coast" &&
   await structured.getByLabel("Required certification").inputValue()==="API 570" &&
   await structured.getByLabel("Inspection start").inputValue()==="2026-12-07" &&
   await structured.getByLabel("Minimum experience (years)").inputValue()==="5" &&
   await structured.getByLabel("Inspector source").inputValue()==="Both",
   "Reset criteria must restore all five fictional Structured Selection defaults");
 assert(await structured.getByRole("status").count()===0,
   "Reset criteria must clear outdated synthetic previews");
 await structured.getByRole("button",{name:"Preview selected criteria"}).click();
 assert((await structured.getByRole("status").innerText()).includes("Gulf Coast · API 570 · 2026-12-07 · 5+ years · Both"),
   "Preview after Reset criteria must reflect defaults rather than stale selections");
 // Structured Selection now uses the same fictional CV renderer without sharing
 // result IDs or making a production search. Filters must change its candidates.
 const structuredCv=structured.locator("#structured-candidate-results");
 const structuredHeading=structuredCv.getByRole("heading",{name:"Candidate CVs"});
 const resultDescription=async()=>structuredHeading.evaluate(el=>{
   const id=el.getAttribute("aria-describedby");
   return id?document.getElementById(id)?.textContent?.trim():null;
 });
 assert((await resultDescription())?.includes("2 available demo candidates"),
   "Structured CV heading must expose the actual fictional result count to assistive technology");
 assert(await structuredCv.locator("article").count()===2,
   "Structured defaults must preview two local fictional candidate CVs");
 assert(await structuredCv.getByText("IS-1042").count()===1 &&
        await structuredCv.getByText("IS-1314").count()===1,
   "Structured defaults did not return the matching Houston fictional inspectors");
 assert(await page.locator("#structured-candidate-results-title").count()===1 &&
        await page.locator("#demo-shortlist #structured-candidate-results-title").count()===0 &&
        await page.locator("#candidate-cvs-title").count()<=1,
   "Structured CVs must have an independent, unique heading ID even if Natural results were cleared");
 await structured.getByLabel("Inspector source").selectOption("Agency");
 assert(await structuredCv.count()===0,
   "Structured candidate CVs remained visible after changing the source");
 await structured.getByRole("button",{name:"Preview selected criteria"}).click();
 assert(await structuredCv.locator("article").count()===1 &&
        await structuredCv.getByText("IS-1314").count()===1,
   "Agency-only synthetic sourcing must return only the fictional Agency candidate");
 await structured.getByLabel("Inspector source").selectOption("Independent");
 await structured.getByRole("button",{name:"Preview selected criteria"}).click();
 assert(await structuredCv.locator("article").count()===1 &&
        await structuredCv.getByText("IS-1042").count()===1,
   "Independent-only synthetic sourcing must return only the fictional independent candidate");
 await structured.getByLabel("Geography").selectOption("Europe");
 await structured.getByRole("button",{name:"Preview selected criteria"}).click();
 assert(await structuredCv.locator("article").count()===0 &&
        (await structuredCv.innerText()).includes("No available candidates"),
   "A Texas-only demo roster must not fabricate Europe inspector CV matches");
 await structured.getByRole("button",{name:"Reset criteria"}).click();
 assert((await page.getByText(/Log in to view the client workspace/i).count())===0,
   "New inline request mechanism unexpectedly routed to authenticated workspace");
 // Nov 11 owner: the Client Workspace is one continuous public page, not a
 // row of cards linking to separate Client, Analytics and commercial shells.
 const clientNav=page.getByRole("navigation",{name:"Client Workspace sections"});
 const clientSide=page.locator(".clientContinuousSide");
 const clientIds=["request-inspectors","natural-language","email-requirements",
   "structured-selection","inspections-in-progress","analytics","billing-payment","contracts","profile"];
 for(const id of clientIds){
   assert(await page.locator("#"+id).count()===1,"Client continuous section missing or duplicated: "+id);
   assert(await clientNav.locator('a[href="#'+id+'"]').count()===1,"Client sidebar anchor missing: "+id);
 }
 let sideBox=await clientSide.boundingBox(), contentBox=await page.locator("#request-inspectors").boundingBox();
 assert(sideBox&&contentBox&&sideBox.width>=220&&sideBox.width<=290&&sideBox.x+sideBox.width<contentBox.x,
   "Client sidebar is not a fixed-width LEFT rail alongside right-hand content on desktop");
 assert(await clientSide.evaluate(el=>getComputedStyle(el).position)==="sticky","Client desktop sidebar is no longer sticky");
 assert(await page.locator("#inspections-in-progress article.inspection").count()===7,
   "Continuous Client page must preserve seven fictional inspections without login");
 assert(await page.getByText(/Log in to view the client workspace/i).count()===0,
   "Continuous public Client page leaked an authenticated workspace placeholder");
 await clientNav.locator('a[href="#inspections-in-progress"]').click();
 await page.waitForFunction(()=>location.hash==="#inspections-in-progress" &&
   document.querySelector('a[href="#inspections-in-progress"]')?.getAttribute("aria-current")==="location");
 await clientNav.locator('a[href="#contracts"]').click();
 await page.waitForFunction(()=>location.hash==="#contracts" &&
   document.querySelector('a[href="#contracts"]')?.getAttribute("aria-current")==="location");
 assert(await page.getByRole("region",{name:"Contracts"}).count()===1,
   "Full synthetic Contracts must be embedded in Client Workspace");
 await clientNav.locator('a[href="#profile"]').click();
 await page.waitForFunction(()=>location.hash==="#profile" &&
   document.querySelector('a[href="#profile"]')?.getAttribute("aria-current")==="location");
 assert(await page.getByRole("region",{name:"Client Profile"}).count()===1,
   "Full Client Profile must be embedded under persistent sidebar");
 await page.goBack({waitUntil:"domcontentloaded"});
 await page.waitForFunction(()=>location.hash==="#contracts" &&
   document.querySelector('a[href="#contracts"]')?.getAttribute("aria-current")==="location");
 await page.setViewportSize({width:390,height:844});
 sideBox=await clientSide.boundingBox();contentBox=await page.locator("#request-inspectors").boundingBox();
 assert(sideBox&&contentBox&&sideBox.y+sideBox.height<contentBox.y+8,
   "Client mobile sidebar should stack ABOVE continuous content rather than overlap it");
 assert(sideBox.x>=-1&&sideBox.x+sideBox.width<=391,"Client mobile sidebar overflows screen");
 await page.setViewportSize({width:1366,height:900});
 // Standalone URLs remain supported for old shared links, but are no longer the
 // primary Client sidebar navigation architecture.
 await page.goto(base+"/demo/client-inspections",{waitUntil:"domcontentloaded"});
  const inspectionVisibleText=await page.locator("body").innerText();
  for(const privateTitle of ["Doctor Appointment","Our Anniversary"]){
    assert(!inspectionVisibleText.includes(privateTitle),
      "Inspector-private calendar title leaked into Client Inspections: "+privateTitle);
  }
  assert(!inspectionVisibleText.includes("Log in to view the client workspace"),
    "Standalone Client Inspections rendered a live login shell");

 await page.locator("article.inspection").first().waitFor();
 assert(await page.locator("article.inspection").count()===7,"Expected seven synthetic active inspections");
 assert((await page.locator(".resultCount").innerText()).includes("7 of 7"),"Initial count is incorrect");
 const milestoneSummary=await page.locator("article.inspection .milestoneSummary").allTextContents();
 assert(milestoneSummary.length===7,"Every fictional inspection must show milestone progress");
 assert(milestoneSummary.some(text=>text.includes("0 of 3"))&&milestoneSummary.some(text=>text.includes("1 of 3"))&&milestoneSummary.some(text=>text.includes("2 of 3")),"Progress must reflect kickoff, active work and release preparation");
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
 // Faceted counts must update alongside project filters instead of staying at global totals.
 const facetProject=page.getByLabel("Project",{exact:true});
 await facetProject.selectOption({label:"North Sea Wind Array"});
 assert(await page.getByRole("group",{name:"Outstanding-action urgency"}).getByRole("button",{name:"Due or overdue (0)"}).count()===1,
   "Due badge did not follow the selected project");
 assert(await page.getByRole("group",{name:"Non-conformance focus"}).getByRole("button",{name:"With open NCR (0)"}).count()===1,
   "NCR badge did not follow the selected project");
 await facetProject.selectOption({label:"Pacific Hydrogen Hub"});
 assert(await page.getByRole("group",{name:"Outstanding-action urgency"}).getByRole("button",{name:"Due or overdue (1)"}).count()===1,
   "Due badge missed the filtered Pacific Hydrogen action");
 assert(await page.getByRole("group",{name:"Non-conformance focus"}).getByRole("button",{name:"With open NCR (1)"}).count()===1,
   "NCR badge missed the filtered Pacific Hydrogen finding");
 await page.getByRole("button",{name:"Reset filters"}).click();
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
 await dueFocus.getByRole("button",{name:"Due or overdue (1)"}).click();
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
   assert(await open.getAttribute("aria-expanded")==="false" && await open.getAttribute("aria-controls")===null,
     "Collapsed inspection must not point aria-controls at an unmounted details region");
   await open.click();
   const details=card.locator(".details");
   await details.waitFor();
   assert(await card.getByRole("button",{name:/Close Inspection/}).getAttribute("aria-controls")===await details.getAttribute("id"),
     "Expanded inspection must expose its currently mounted details via aria-controls");
   for(const heading of ["Client, project and site","Milestones","Reports · SAMPLE ONLY","NCRs","Outstanding actions"]){
     assert(await details.getByRole("heading",{name:heading}).count()===1,"Missing detail heading: "+heading+" in inspection "+i);
   }
   const ncrToggle=details.getByRole("button",{name:"Open corrective-action details"});
   if(await ncrToggle.count()){
     assert(await ncrToggle.getAttribute("aria-expanded")==="false" && await ncrToggle.getAttribute("aria-controls")===null,
       "Collapsed NCR must not reference an unmounted corrective-action region");
     await ncrToggle.click();
     const caseDetails=details.getByRole("region",{name:/Corrective-action details for SAMPLE-NCR-001/});
     assert(await caseDetails.count()===1,"Opening NCR should expose fictional corrective-action workspace");
     assert(await details.getByRole("button",{name:"Hide corrective-action details"}).getAttribute("aria-controls")===await caseDetails.getAttribute("id"),
       "Open NCR must identify its mounted corrective-action details");
     for(const evidence of ["Major","Vendor quality manager","material traceability matrix","mill certificates","Verification / next decision"]){
       assert((await caseDetails.innerText()).includes(evidence),"Missing sample NCR case evidence: "+evidence);
     }
     await details.getByRole("button",{name:"Hide corrective-action details"}).click();
     assert(await caseDetails.count()===0 && await details.getByRole("button",{name:"Open corrective-action details"}).getAttribute("aria-controls")===null,
       "Closed NCR must remove the stale aria-controls reference");
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
   assert(await card.getByRole("button",{name:/Open Inspection/}).getAttribute("aria-controls")===null,
     "Collapsed inspection left a dangling aria-controls target");
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
 // Filter chips remove exactly one criterion and preserve unrelated synthetic filters.
 assert(await page.locator(".filterChips").count()===0,"No active filters should mean no chips");
 await status.selectOption({index:1});
 await project.selectOption({index:1});
 await search.fill("sample");
 assert(await page.locator(".filterChips button").count()===3,"Expected three active criteria chips");
 const chipContainerStyles=await page.locator(".filterChips").evaluate(element=>{const s=getComputedStyle(element);return {display:s.display,background:s.backgroundColor,border:s.borderTopColor,wrap:s.flexWrap}});
 assert(chipContainerStyles.display==="flex" && chipContainerStyles.wrap==="wrap" && chipContainerStyles.background==="rgb(239, 246, 255)" && chipContainerStyles.border==="rgb(191, 219, 254)",
   "P0-B active Client Demo filter chips must render with their intended visible container styles: "+JSON.stringify(chipContainerStyles));
 await page.getByRole("button",{name:/Remove Stage: .* filter/}).click();
 assert(await status.inputValue()==="","Removing stage chip should clear only stage");
 assert(await project.inputValue()!==""&&await search.inputValue()==="sample","Removing stage chip cleared another filter");
 await page.getByRole("button",{name:/Remove Project: .* filter/}).click();
 assert(await project.inputValue()==="","Project chip did not clear project");
 assert(await search.inputValue()==="sample"&&await page.locator(".filterChips button").count()===1,"Search chip should remain");
 await page.getByRole("button",{name:"Remove Search: sample filter"}).click();
 assert(await search.inputValue()===""&&await page.locator("article.inspection").count()===7,"Removing last chip must restore all seven fictional inspections");
 assert(await page.locator(".filterChips").count()===0,"Filter chip bar should disappear when cleared");

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
 assert(await page.getByRole("heading",{name:"Correct the scheduled date range"}).count()===1,"Invalid dates should explain the actual validation error");
 assert(await page.getByRole("heading",{name:"No inspections match these filters"}).count()===0,"Invalid dates must not be confused with a legitimate empty selection");
 await project.selectOption({index:1});
 const dateWarning=page.getByRole("alert",{name:"Invalid scheduled date range"});
 assert(await dateWarning.getByRole("button",{name:"Clear dates in warning"}).count()===1,"Invalid dates need directly accessible clear control");
 const warningStyle=await dateWarning.evaluate(element=>{const s=getComputedStyle(element);return {background:s.backgroundColor,border:s.borderTopColor,text:s.color}});
 assert(warningStyle.background==="rgb(254, 242, 242)" && warningStyle.border==="rgb(185, 28, 28)" && warningStyle.text==="rgb(127, 29, 29)", "Invalid-date alert must be visibly legible: "+JSON.stringify(warningStyle));
 await dateWarning.getByRole("button",{name:"Clear dates in warning"}).click();
 assert(await page.getByLabel("Scheduled from").inputValue()===""&&await page.getByLabel("Scheduled through").inputValue()==="", "Warning action must clear only dates");
 assert(await project.inputValue()!==""&&await page.locator("article.inspection").count()===1, "Warning recovery must preserve project selection");
 await page.getByLabel("Scheduled from").fill("2026-11-10");
 await page.getByLabel("Scheduled through").fill("2026-11-01");
 await page.getByRole("button",{name:"Clear invalid date range"}).click();
 assert(await page.getByLabel("Scheduled from").inputValue()===""&&await page.getByLabel("Scheduled through").inputValue()==="","Invalid-date correction failed to clear both dates");
 assert(await project.inputValue()!==""&&await page.locator("article.inspection").count()===1,"Clearing dates must preserve unrelated project filtering");
 await page.getByRole("button",{name:"Reset filters"}).click();
 assert(await page.locator("article.inspection").count()===7,"Second reset did not restore all inspections");

 // Owner Nov 10: Browser regression for Client Demo fixed-width sidebar, mobile stacking,
 // commercial section navigation and browser history, without accessing authenticated data.
 async function verifyClientSidebarLayout(label, desktop) {
  const m=await page.evaluate(()=>{
   const side=document.querySelector("aside.clientSide"), content=side?.nextElementSibling;
   if(!side||!content)return null;
   const s=side.getBoundingClientRect(), c=content.getBoundingClientRect();
   return {sideRight:s.right,sideBottom:s.bottom,contentLeft:c.left,contentTop:c.top,
    width:s.width,background:getComputedStyle(side).backgroundColor};
  });
  assert(m!==null,label+": Client Workspace sidebar/content missing");
  assert(m.background==="rgb(16, 43, 80)",label+": dark-blue sidebar lost: "+JSON.stringify(m));
  if(desktop){
   assert(m.width>=230&&m.width<=270,label+": sidebar must remain fixed around 250px: "+JSON.stringify(m));
   assert(m.contentLeft>=m.sideRight+8,label+": content should be to RIGHT of sidebar: "+JSON.stringify(m));
  }else{
   assert(m.contentTop>=m.sideBottom-5,label+": mobile sidebar must STACK ABOVE content: "+JSON.stringify(m));
  }
 }
 await page.setViewportSize({width:1366,height:900});
 await verifyClientSidebarLayout("Inspections desktop",true);
 assert(await page.locator("aside.clientSide").getByRole("link",{name:"Inspections in Progress"}).getAttribute("aria-current")==="page",
  "Inspections sidebar active highlight missing");
 await page.setViewportSize({width:760,height:900});
 await verifyClientSidebarLayout("Inspections mobile",false);
 await page.setViewportSize({width:1366,height:900});
 // Secondary Client Demo sidebar entry returns to the single continuous
 // Client Workspace while preserving fixed-width dark-blue desktop layout.
 await page.locator("aside.clientSide").getByRole("link",{name:"Billing & Payment"}).click();
 await page.waitForFunction(()=>location.pathname==="/demo/client"&&location.hash==="#billing-payment");
 const continuousSidebar=page.locator("aside.clientContinuousSide");
 await continuousSidebar.waitFor();
 await page.getByRole("region",{name:"Billing & Payment"}).waitFor();
 const dimensions=await page.evaluate(()=>{
   const side=document.querySelector("aside.clientContinuousSide");
   const content=document.querySelector("#request-inspectors");
   const a=side?.getBoundingClientRect(),b=content?.getBoundingClientRect();
   return a&&b?{width:a.width,right:a.right,left:b.left,position:getComputedStyle(side).position}:null;
 });
 assert(dimensions&&dimensions.width>=220&&dimensions.width<=290&&dimensions.right<dimensions.left&&dimensions.position==="sticky",
  "Continuous Client sidebar must be fixed-width, sticky and left of content: "+JSON.stringify(dimensions));
 assert(await page.locator("article.inspection").count()===7,
  "Routing to Billing discarded seven synthetic inspections");
 const continuousNav=page.getByRole("navigation",{name:"Client Workspace sections"});
 await page.waitForFunction(()=>document.querySelector('nav[aria-label="Client Workspace sections"] a[aria-current="location"]')?.textContent?.trim()==="Billing & Payment");
 // The canonical nine-link Client scrollspy must keep deep-linked Profile in view
 // on a short 1024x400 desktop, not only the nested Client Demo sidebar.
 await page.setViewportSize({width:1024,height:400});
 await page.goto(base+"/demo/client#profile",{waitUntil:"domcontentloaded"});
 await page.waitForFunction(()=>document.querySelector('nav[aria-label="Client Workspace sections"] a[aria-current="location"]')?.textContent?.trim()==="Profile");
 await page.waitForFunction(()=>{
   const aside=document.querySelector("aside.clientContinuousSide");
   const link=aside?.querySelector('a[aria-current="location"]');
   if(!aside||!link)return false;
   const a=aside.getBoundingClientRect(),b=link.getBoundingClientRect();
   return aside.scrollHeight>aside.clientHeight&&aside.scrollTop>0&&
     b.top>=a.top-1&&b.bottom<=a.bottom+1;
 },null,{timeout:15000});
 const shortClientSide=await continuousSidebar.evaluate(el=>({
   position:getComputedStyle(el).position,overflow:getComputedStyle(el).overflowY,
   height:el.getBoundingClientRect().height,scrollTop:el.scrollTop
 }));
 assert(shortClientSide.position==="sticky"&&shortClientSide.overflow==="auto"&&shortClientSide.height<=365,
   "Short Client Workspace sidebar cannot reveal highlighted Profile: "+JSON.stringify(shortClientSide));
 assert(await page.locator("article.inspection").count()===7,
   "Deep-linked Client Profile lost seven synthetic inspections");
 await page.goto(base+"/demo/client#billing-payment",{waitUntil:"domcontentloaded"});
 await page.waitForFunction(()=>document.querySelector('nav[aria-label="Client Workspace sections"] a[aria-current="location"]')?.textContent?.trim()==="Billing & Payment");
 await page.setViewportSize({width:1366,height:900});
 await continuousNav.getByRole("link",{name:"Contracts",exact:true}).click();
 await page.waitForFunction(()=>location.hash==="#contracts");
 await page.getByRole("region",{name:"Contracts"}).waitFor();
 await page.waitForFunction(()=>document.querySelector('nav[aria-label="Client Workspace sections"] a[aria-current="location"]')?.textContent?.trim()==="Contracts");
 assert(await page.getByRole("tab",{name:"Agencies"}).count()===1,
  "Contract relationship-type filters must remain in embedded Contracts");
 await continuousNav.getByRole("link",{name:"Profile",exact:true}).click();
 await page.waitForFunction(()=>location.hash==="#profile");
 await page.getByRole("region",{name:"Client Profile"}).waitFor();
 await page.waitForFunction(()=>document.querySelector('nav[aria-label="Client Workspace sections"] a[aria-current="location"]')?.textContent?.trim()==="Profile");
 await page.goBack();
 await page.waitForFunction(()=>location.hash==="#contracts");
 await page.waitForFunction(()=>document.querySelector('nav[aria-label="Client Workspace sections"] a[aria-current="location"]')?.textContent?.trim()==="Contracts");
 await page.goForward();
 await page.waitForFunction(()=>location.hash==="#profile");
 await page.goto(base+"/demo/client-operations?tab=contracts",{waitUntil:"domcontentloaded"});
 await page.getByRole("region",{name:"Contracts"}).waitFor();
 await verifyClientSidebarLayout("Direct-linked Contracts desktop",true);
 // Short landscape desktop: secondary Client Demo routes need scrollable,
 // keyboard-reachable dark-blue sidebar links without clipping.
 await page.setViewportSize({width:1024,height:400});
 const nestedSide=page.locator("aside.clientSide");
 const sideGeometry=await nestedSide.evaluate(node=>{
   const box=node.getBoundingClientRect();
   const style=getComputedStyle(node);
   return {top:box.top,bottom:box.bottom,height:box.height,
     scrollHeight:node.scrollHeight,clientHeight:node.clientHeight,overflow:style.overflowY};
 });
 assert(sideGeometry.height<=365 && sideGeometry.scrollHeight>sideGeometry.clientHeight &&
   sideGeometry.overflow==="auto",
   "Short desktop Client Demo sidebar clipped its last links: "+JSON.stringify(sideGeometry));
 const profileLink=nestedSide.getByRole("link",{name:"Profile",exact:true});
 await profileLink.scrollIntoViewIfNeeded();
 const linkGeometry=await profileLink.evaluate(node=>{
   const parent=node.closest("aside");
   const box=node.getBoundingClientRect(),outer=parent.getBoundingClientRect();
   return {top:box.top,bottom:box.bottom,sideTop:outer.top,sideBottom:outer.bottom,scrollTop:parent.scrollTop};
 });
 assert(linkGeometry.top>=linkGeometry.sideTop-1 &&
   linkGeometry.bottom<=linkGeometry.sideBottom+1 && linkGeometry.scrollTop>0,
   "Client Demo Profile sidebar link cannot be reached in short desktop: "+JSON.stringify(linkGeometry));
 await page.setViewportSize({width:760,height:900});
 const mobileSidebar=await nestedSide.evaluate(node=>{
   const css=getComputedStyle(node);
   return {position:css.position,overflow:css.overflowY,maxHeight:css.maxHeight};
 });
 assert(mobileSidebar.position==="static" && mobileSidebar.overflow==="visible" &&
   mobileSidebar.maxHeight==="none",
   "Mobile Client Demo sidebar remains artificially scroll-clipped: "+JSON.stringify(mobileSidebar));
 await page.setViewportSize({width:1366,height:900});

 await page.setViewportSize({width:760,height:900});
 await verifyClientSidebarLayout("Commercial mobile",false);
 await page.setViewportSize({width:1366,height:900});
 assert(await page.getByText(/Log in to view the client workspace/i).count()===0,
  "Client commercial demo must never require live-workspace login");
 await page.locator("aside.clientSide").getByRole("link",{name:"Inspections in Progress"}).click();
 await page.waitForFunction(()=>location.pathname==="/demo/client"&&location.hash==="#inspections-in-progress");
 assert(await page.locator("article.inspection").count()===7,
  "Commercial sidebar must return seven synthetic inspections");
 await page.getByRole("navigation",{name:"Client Workspace sections"}).getByRole("link",{name:"Analytics",exact:true}).click();
 await page.waitForFunction(()=>location.hash==="#analytics");
 await page.getByRole("region",{name:"Analytics",exact:true}).waitFor();
 assert(await page.getByText(/Log in to view the client workspace/i).count()===0,
  "Cross-demo Analytics link led to authenticated shell");
 // Owner Nov 10 P0-A: audit the common two-column shell across all other synthetic
 // Client Workspace pages, not just Inspections and commercial tabs.
 const otherClientDemoRoutes=[
  ["/demo/client","Request Inspectors"],
  ["/demo/client-analytics","Analytics"],
  ["/demo/client-agency-sourcing","Source of Inspectors"],
  ["/demo/client-data","Data & Integrations"]
 ];
 for (const [path,label] of otherClientDemoRoutes) {
  await page.setViewportSize({width:1366,height:900});
  await page.goto(base+path,{waitUntil:"domcontentloaded"});
  if(path==="/demo/client"){
   // Canonical Client now has a sticky, hash-linked rail on the full embedded page.
   const continuous=page.locator("aside.clientContinuousSide");
   await continuous.waitFor();
   const side=await continuous.boundingBox(),body=await page.locator("#request-inspectors").boundingBox();
   assert(side&&body&&side.width>=220&&side.width<=290&&side.x+side.width<body.x,
    "Canonical Client continuous sidebar is not fixed-width at left");
   assert(await continuous.evaluate(el=>getComputedStyle(el).position)==="sticky",
    "Canonical Client sidebar should be sticky on desktop");
   assert(await continuous.locator('a[href="#inspections-in-progress"]').count()===1,
    "Canonical Client sidebar lost its in-page seven-inspection anchor");
   await page.setViewportSize({width:760,height:900});
   const ms=await continuous.boundingBox(),mb=await page.locator("#request-inspectors").boundingBox();
   assert(ms&&mb&&ms.y+ms.height<=mb.y+8,
    "Canonical Client mobile sidebar did not stack above content");
  }else{
   await page.locator("aside.clientSide").waitFor();
   await verifyClientSidebarLayout(label+" desktop",true);
   await page.setViewportSize({width:760,height:900});
   await verifyClientSidebarLayout(label+" mobile",false);
   assert(await page.locator('aside.clientSide a[href^="/client-dashboard"]').count()===0,
    label+": Client Demo sidebar must never navigate to live client dashboard");
  }
  assert(await page.getByText(/Log in to view the client workspace/i).count()===0,
   label+": synthetic Client Demo must not render authenticated workspace prompt");
 }
 // Finish the multi-page audit at the owner's seven-record priority demo entry.
 await page.setViewportSize({width:1366,height:900});
 await page.goto(base+"/demo/client-inspections",{waitUntil:"domcontentloaded"});
 await page.locator("article.inspection").first().waitFor();
 assert(await page.locator("article.inspection").count()===7,
  "Multi-page sidebar audit lost the seven no-login in-progress demo inspections");
 await verifyClientSidebarLayout("Client Inspections after route audit",true);
  // Reproduce the exact intermittent initial-hydration same-document navigation
  // with fresh anonymous pages. A single successful first-click is insufficient.
  for (let attempt=1;attempt<=3;attempt++) {
    const probe=await browser.newPage();
    try {
      await probe.goto(base+"/demo/client-inspections",{waitUntil:"domcontentloaded"});
      await probe.locator("article.inspection").first().waitFor();
      await probe.goto(base+"/demo/client-inspections#inspection-DEMO-ACT-4",{waitUntil:"domcontentloaded"});
      try {
        await probe.getByRole("region",{name:"Inspection details DEMO-ACT-4"}).waitFor({timeout:12000});
      } catch (error) {
        const diagnostic = await probe.evaluate(() => ({
          url:location.href,
          readyState:document.readyState,
          historyState:history.state,
          reactRoot:!!document.querySelector("next-route-announcer"),
          inspections:document.querySelectorAll("article.inspection").length,
          expanded:[...document.querySelectorAll('button[aria-controls^="details-DEMO-ACT-"][aria-expanded="true"]')].map(el=>el.getAttribute("aria-controls")),
          detail4:!!document.getElementById("details-DEMO-ACT-4"),
          pageText:document.body.innerText.slice(-500),
        })).catch(e=>({diagnosticError:String(e)}));
        throw new Error("Rapid no-login inspection deep-link failure, attempt "+attempt+": "+JSON.stringify(diagnostic),{cause:error});
      }
      assert(await probe.locator("article.inspection").count()===7,
        "Rapid deep-link hydration probe lost the seven synthetic inspections, attempt "+attempt);
      assert(await probe.getByText(/Log in to view the client workspace/i).count()===0,
        "Rapid deep-link hydration probe entered the live workspace, attempt "+attempt);
    } finally {
      await probe.close();
    }
  }
  // Protect the continuous Client Workspace against the same early hydration URL reset.
  for(let attempt=1;attempt<=2;attempt++){
    const embeddedProbe=await browser.newPage();
    try{
      await embeddedProbe.goto(base+"/demo/client",{waitUntil:"domcontentloaded"});
      await embeddedProbe.locator("#inspections-in-progress article.inspection").first().waitFor();
      await embeddedProbe.goto(base+"/demo/client#inspection-DEMO-ACT-4",{waitUntil:"domcontentloaded"});
      await embeddedProbe.getByRole("region",{name:"Inspection details DEMO-ACT-4"}).waitFor({timeout:12000});
      assert(await embeddedProbe.locator("#inspections-in-progress article.inspection").count()===7,
        "Continuous Client Workspace deep link lost seven fictional inspections, attempt "+attempt);
      assert(await embeddedProbe.getByText(/Log in to view the client workspace/i).count()===0,
        "Continuous Client Workspace deep link entered a live authentication shell, attempt "+attempt);
    } finally {await embeddedProbe.close();}
  }
  // Isolate history navigation from the preceding cross-demo route audit. Those
  // routes deliberately leave many entries and can hide a real detail-state defect.
  await page.close();
  page=await browser.newPage();
  page.on("pageerror",e=>errors.push(e.stack||String(e)));
  await page.goto(base+"/demo/client-inspections",{waitUntil:"domcontentloaded"});
  await page.locator("article.inspection").first().waitFor();
  const checkpoint=async label=>{
    const state=await page.evaluate(()=>({
      url:location.pathname+location.search+location.hash,
      length:history.length,
      storedStage:history.state?.__inspectSourceClientInspectionList?.filters?.stage,
      currentStage:document.querySelector('select[aria-label="Status / stage"]')?.value,
      expanded:[...document.querySelectorAll('button[aria-controls^="details-DEMO-ACT-"][aria-expanded="true"]')].map(x=>x.getAttribute("aria-controls"))
    }));
    inspectionHistoryTrace.push({label,...state});
  };
  await checkpoint("clean list");
  // Public inspection-detail deep links must survive refresh and browser history.
  await page.goto(base+"/demo/client-inspections#inspection-DEMO-ACT-4",{waitUntil:"domcontentloaded"});
  // Capture the browser's real URL and list state before asserting hydration.
  // This diagnostic makes an intermittent direct-hash failure actionable.
  await checkpoint("navigated to deep link #4");
  const sharedDetails=page.getByRole("region",{name:"Inspection details DEMO-ACT-4"});
  await sharedDetails.waitFor({timeout:12000});
  // P0-B: functional Open Inspection, action-register, CSV and PDF links must
  // remain directly tappable rather than small text-only hotspots.
  const inspectionLinkTargets = await page.locator(".actionRegister a, .resultActions a.exportCsv, .details .reportLink")
    .evaluateAll(nodes => nodes.map(node => ({
      label: (node.textContent || "").trim().slice(0, 80),
      height: node.getBoundingClientRect().height
    })));
  assert(inspectionLinkTargets.length >= 4 &&
    inspectionLinkTargets.every(item => item.height >= 44),
    "Client inspection action/report links below 44px: " + JSON.stringify(inspectionLinkTargets));
  await checkpoint("deep link #4");
  assert((await sharedDetails.innerText()).includes("Atlantic LNG Terminal"),
    "Direct inspection deep link opened the wrong synthetic inspection");
  assert(await page.locator("article.inspection").count()===7,
    "Deep-linking a single inspection discarded other fictional records");
  await page.goBack();
  await sharedDetails.waitFor({state:"detached",timeout:12000});
  await checkpoint("back to list");
  assert(await page.locator("article.inspection").count()===7,
    "Browser Back from inspection detail lost synthetic list");
  await page.goForward();
  await sharedDetails.waitFor({state:"visible",timeout:12000});
  await checkpoint("forward to #4");
  const actionLink=page.locator(".actionRegister tbody tr").filter({hasText:"DEMO-ACT-5"}).getByRole("link",{name:"Open inspection"});
  await actionLink.click();
  assert(page.url().endsWith("#inspection-DEMO-ACT-5"),
    "Outstanding action link did not establish shareable inspection URL");
  await page.getByRole("region",{name:"Inspection details DEMO-ACT-5"}).waitFor();
  assert(await page.getByText(/Log in to view the client workspace/i).count()===0,
    "Deep-linked synthetic inspection unexpectedly requires authentication");

 // Filtering a previously shared detail should not leave a stale deep-link.
 await page.getByRole("combobox",{name:"Status / stage"}).selectOption("Kickoff");
  // The selected stage must be saved before effects, not eventually after a polling wait.
  assert(await page.evaluate(()=>history.state?.__inspectSourceClientInspectionList?.filters?.stage)==="Kickoff",
   "Changing Client inspection stage did not synchronously capture the next history state");
 await checkpoint("filtered list");
 assert(new URL(page.url()).hash==="",
  "Filtering an open inspection left a stale inspection detail URL");
 assert(await page.locator("article.inspection").count()===1,
  "Filtering the demo inspection list did not reduce to the selected stage");
 const filteredKpis=await page.locator(".stats .stat strong").allTextContents();
 assert(filteredKpis.length===4 && filteredKpis[0].trim()==="1" && filteredKpis[1].trim()==="1",
   "Client inspection summary did not follow the one-row Kickoff filter");
 await page.goBack();
 await page.getByRole("region",{name:"Inspection details DEMO-ACT-4"}).waitFor({timeout:12000});
 await checkpoint("back restores #4");
 assert(await page.locator("article.inspection").count()===7,
  "Browser Back to deep-linked inspection did not reset restrictive filters");
 assert((await page.locator(".stats .stat strong").first().innerText()).trim()==="7",
   "Browser Back restored inspection detail but left stale filtered summary counts");
 await page.goForward();
 await page.getByRole("region",{name:"Inspection details DEMO-ACT-4"}).waitFor({state:"detached",timeout:12000});
 await page.waitForFunction(()=>document.querySelector('select[aria-label="Status / stage"]')?.value==="Kickoff");
 await checkpoint("forward restores filtered list");
 assert(await page.locator("article.inspection").count()===1,
  "Browser Forward lost the filtered-list selection");
 assert((await page.locator(".stats .stat strong").first().innerText()).trim()==="1",
   "Browser Forward restored filter but left an inconsistent inspection summary");
 assert(new URL(page.url()).hash==="",
  "Browser Forward did not restore filtered-list navigation");
 // P0 regression #321: exercise repeated browser Back/Forward cycles from a
 // filtered synthetic list to the earlier inspection-detail history entry.
 // The trace captures URL, history length, saved stage and expanded controls
 // so a sporadic hydration/state race has actionable evidence.
 for (let cycle=1;cycle<=3;cycle++) {
   await page.goBack();
   await page.getByRole("region",{name:"Inspection details DEMO-ACT-4"}).waitFor({timeout:12000});
   await checkpoint("repeated Back restores #4, cycle "+cycle);
   assert((await page.locator("article.inspection").count())===7 &&
     (await page.getByRole("combobox",{name:"Status / stage"}).inputValue())==="",
     "Repeated Back did not restore unfiltered seven-inspection detail view, cycle "+cycle);
   await page.goForward();
   await page.getByRole("region",{name:"Inspection details DEMO-ACT-4"}).waitFor({state:"detached",timeout:12000});
   await page.waitForFunction(() => location.hash==="" &&
     document.querySelector('select[aria-label="Status / stage"]')?.value==="Kickoff" &&
     document.querySelectorAll("article.inspection").length===1);
   await checkpoint("repeated Forward restores Kickoff list, cycle "+cycle);
   assert((await page.getByText(/Log in to view the client workspace/i).count())===0,
     "Repeated synthetic inspection history returned to a live login shell, cycle "+cycle);
 }


 // A full refresh must restore a fictional filtered list before persisting history.
 await page.reload({waitUntil:"domcontentloaded"});
 await page.waitForFunction(() =>
   document.querySelector('select[aria-label="Status / stage"]')?.value==="Kickoff" &&
   document.querySelectorAll("article.inspection").length===1,
   null,{timeout:15000});
 assert(await page.evaluate(()=>history.state?.__inspectSourceClientInspectionList?.filters?.stage)==="Kickoff",
   "Refreshing a filtered Client inspection list overwrote its saved browser history snapshot");
 assert(!await page.getByText("Log in to view the client workspace").count(),
   "Refreshing a filtered Client Demo list opened a live login-required shell");
 // Closing an inspection adds a new no-hash history entry; that entry must
 // capture the current filtered state synchronously, not rely on a filter effect
 // that may not run when no filter value actually changed.
 const filteredCard=page.locator("article.inspection").first();
 const filteredId=(await filteredCard.locator("small").first().innerText()).match(/DEMO-ACT-[1-7]/)?.[0];
 assert(filteredId,"Expected a fictional Kickoff inspection for close-history regression");
 await filteredCard.getByRole("button",{name:/Open Inspection/}).click();
 await page.waitForFunction(id=>location.hash==="#inspection-"+id,filteredId);
 await page.getByRole("region",{name:"Inspection details "+filteredId}).waitFor();
 await filteredCard.getByRole("button",{name:/Close Inspection/}).click();
 await page.waitForFunction(()=>location.hash==="");
 assert(await page.evaluate(()=>history.state?.__inspectSourceClientInspectionList?.filters?.stage)==="Kickoff",
  "Closing a filtered inspection failed to persist the list state in its new history entry");
 await page.goBack();
 await page.getByRole("region",{name:"Inspection details "+filteredId}).waitFor();
 await page.goForward();
 await page.getByRole("region",{name:"Inspection details "+filteredId}).waitFor({state:"detached"});
 assert(await page.getByRole("combobox",{name:"Status / stage"}).inputValue()==="Kickoff",
  "Forward after closing an inspection did not restore its filtered list");
 assert(await page.locator("article.inspection").count()===1,
  "Forward after closing an inspection lost the one-row synthetic list");
 // P0: auxiliary synthetic Client pages must return to the single continuous
 // workspace, not strands of standalone dashboards or an authenticated shell.
 for(const [label,anchor] of [["Email requirements","email-requirements"],
   ["Inspections in Progress","inspections-in-progress"],
   ["Billing & Payment","billing-payment"],
   ["Contracts","contracts"],["Profile","profile"]]){
   await page.goto(base+"/demo/client-agency-sourcing",{waitUntil:"domcontentloaded"});
   const legacySidebar=page.getByRole("complementary",{name:"Client Workspace navigation"});
   await legacySidebar.getByRole("link",{name:label,exact:true}).click();
   await page.waitForFunction(anchor=>location.pathname==="/demo/client"&&location.hash==="#"+anchor,anchor,{timeout:20000});
   await page.locator("#"+anchor).waitFor({state:"visible",timeout:15000});
   assert(await page.locator("article.inspection").count()===7,
    "Legacy sidebar navigation discarded the seven synthetic inspection records: "+anchor);
   assert(await page.getByText(/Log in to view the client workspace/i).count()===0,
    "Legacy sidebar returned to authenticated empty Client Workspace shell: "+anchor);
 }

 // Continuous Client sections are navigational anchors, not a fresh workspace.
 // Preserve synthetic inspection list state when jumping to Analytics and
 // returning through Back/Forward or refreshing a bookmarked section.
 await page.goto(base+"/demo/client",{waitUntil:"domcontentloaded"});
 await page.locator("#inspections-in-progress article.inspection").first().waitFor();
 await page.getByRole("combobox",{name:"Status / stage"}).selectOption("Kickoff");
 await page.waitForFunction(() => history.state?.__inspectSourceClientInspectionList?.filters?.stage==="Kickoff");
 const clientSectionNav=page.getByRole("complementary",{name:"Client Workspace navigation"});
 await clientSectionNav.getByRole("link",{name:"Analytics",exact:true}).click();
 await page.waitForFunction(() => location.hash==="#analytics");
 assert(await page.evaluate(() => history.state?.__inspectSourceClientInspectionList?.filters?.stage)==="Kickoff",
   "Client sidebar navigation discarded the synthetic inspection filter snapshot");
 await page.reload({waitUntil:"domcontentloaded"});
 await page.waitForFunction(() => document.querySelector('select[aria-label="Status / stage"]')?.value==="Kickoff");
 assert(await page.locator("#inspections-in-progress article.inspection").count()===1,
   "Reloading the Client Analytics anchor lost the filtered synthetic inspection list");
 await page.getByRole("complementary",{name:"Client Workspace navigation"}).getByRole("link",{name:"Inspections in Progress",exact:true}).click();
 await page.waitForFunction(() => location.hash==="#inspections-in-progress");
 assert(await page.evaluate(() => history.state?.__inspectSourceClientInspectionList?.filters?.stage)==="Kickoff",
   "Returning to in-progress inspections lost the list snapshot");
 await page.goBack();
 await page.waitForFunction(() => location.hash==="#analytics");
 assert(await page.getByRole("combobox",{name:"Status / stage"}).inputValue()==="Kickoff",
   "Client sidebar browser Back lost the synthetic list filter");
 await page.goForward();
 await page.waitForFunction(() => location.hash==="#inspections-in-progress");
 assert(await page.locator("#inspections-in-progress article.inspection").count()===1,
   "Client sidebar browser Forward lost the filtered inspection list");
 // Outdated public history bookmarks must join the one-page fictional demo,
 // not revive the retired standalone Inspection History workspace.
 for (const [legacy,anchor] of [
   ["/demo/client-history","analytics"],
   ["/demo/client-history?view=completed","analytics"],
   ["/demo/client-history?view=active","inspections-in-progress"]
 ]) {
   await page.goto(base+legacy,{waitUntil:"domcontentloaded"});
   await page.waitForURL(url=>url.pathname==="/demo/client"&&url.hash==="#"+anchor,{timeout:20000});
   await page.locator("#"+anchor).waitFor({state:"visible",timeout:15000});
   assert(await page.locator("#inspections-in-progress article.inspection").count()===7,
     "Legacy Client History redirect lost fictional inspections: "+legacy);
   assert((await page.getByText(/Log in to view the client workspace/i).count())===0,
     "Legacy Client History redirected to an authenticated shell: "+legacy);
 }
 // P0-A #321: a legacy or partially written history entry must never keep a
 // stale filtered list or produce the authenticated empty Client Workspace.
 // Exercise actual browser Back/Forward in a fresh independent Chromium page,
 // not merely a simulated popstate or a source-level contract assertion.
 const legacySnapshotPage=await browser.newPage();
 try {
   await legacySnapshotPage.goto(base+"/demo/client-inspections",{waitUntil:"domcontentloaded"});
   await legacySnapshotPage.locator("article.inspection").first().waitFor();
   // Wait for React to mount its history sync before the first filter click;
   // otherwise a browser may interact with SSR controls before hydration.
   await legacySnapshotPage.waitForFunction(() =>
     Boolean(history.state?.__inspectSourceClientInspectionList?.filters) &&
     document.querySelectorAll("article.inspection").length===7,
     null,{timeout:15000});
   assert(await legacySnapshotPage.locator("article.inspection").count()===7,
     "Malformed-history browser probe did not start with seven fictional inspections");
   await legacySnapshotPage.getByRole("combobox",{name:"Status / stage"}).selectOption("Kickoff");
   await legacySnapshotPage.waitForFunction(()=>document.querySelectorAll("article.inspection").length===1 &&
     history.state?.__inspectSourceClientInspectionList?.filters?.stage==="Kickoff");
   await legacySnapshotPage.evaluate(()=>{
     const before=history.state && typeof history.state==="object" ? history.state : {};
     history.replaceState({...before,__inspectSourceClientInspectionList:{filters:{stage:"UNKNOWN LIVE STAGE"},sort:"production"}},"",location.pathname);
     history.pushState({...before,__inspectSourceClientInspectionList:{filters:{stage:"Kickoff"},sort:"due"}},"","#history-snapshot-probe");
   });
   await legacySnapshotPage.goBack();
   await legacySnapshotPage.waitForFunction(() =>
     location.hash==="" &&
     document.querySelector('select[aria-label="Status / stage"]')?.value==="" &&
     document.querySelectorAll("article.inspection").length===7,
     null,{timeout:15000});
   assert(!await legacySnapshotPage.getByText(/Log in to view the client workspace/i).count(),
     "Malformed Client inspection browser history unexpectedly required live authentication");
   await legacySnapshotPage.goForward();
   await legacySnapshotPage.waitForFunction(() =>
     location.hash==="#history-snapshot-probe" &&
     document.querySelector('select[aria-label="Status / stage"]')?.value==="Kickoff" &&
     document.querySelectorAll("article.inspection").length===1,
     null,{timeout:15000});
   assert(!await legacySnapshotPage.getByText(/Log in to view the client workspace/i).count(),
     "Restored fictional Kickoff history route landed in a live workspace");
 } finally {
   await legacySnapshotPage.close();
 }
 await page.goto(base+"/client-dashboard",{waitUntil:"domcontentloaded"});
 await page.waitForURL(url=>url.pathname==="/login",{timeout:20000});
 assert((await page.getByText(/Log in to view the client workspace/i).count())===0,"Unauthenticated live route exposed dead client shell");
 assert(errors.length===0,"Browser page errors: "+errors.join("\n"));
 console.log("Client Demo browser OK: seven inspections, due/overdue action focus, details, PDF, filters, cross-demo navigation and live Login redirect.");
}catch(e){failed=true;console.error(e instanceof Error?e.stack:String(e));console.error("Inspection history trace:",JSON.stringify(inspectionHistoryTrace,null,2));console.error("Local server tail:",serverOutput.slice(-1800))}
finally{if(browser)await browser.close();if(child){child.kill("SIGTERM");await new Promise(r=>setTimeout(r,250));if(!child.killed)child.kill("SIGKILL")}}
if(failed)process.exitCode=1;
