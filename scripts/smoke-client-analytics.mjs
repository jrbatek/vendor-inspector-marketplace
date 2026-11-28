import { spawn } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { chromium, firefox } from "playwright";

const port = 3102;
const base = process.env.ANALYTICS_BASE_URL || `http://127.0.0.1:${port}`;
const browserName = process.env.ANALYTICS_BROWSER || "chromium";
if (!["chromium", "firefox"].includes(browserName)) throw new Error(`Unsupported Analytics browser: ${browserName}`);
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
  const undersizedTargets = await page.locator(".clientAnalyticsPage .quickSources button, .clientAnalyticsPage .grid .barRow.clickable").evaluateAll(nodes =>
    nodes.filter(node => node.getBoundingClientRect().height < 44)
      .map(node => (node.textContent || "").trim().slice(0, 80)));
  if (undersizedTargets.length)
    throw new Error("Analytics Source Type/chart controls below 44px minimum: " + undersizedTargets.join(", "));
  if (await page.getByRole("heading", {name:"Analytics view could not load"}).count())
    throw new Error("Client Analytics recovery error after selecting " + label);
  if (await page.evaluate(() => Boolean(window.__analyticsRecoverySeen)))
    throw new Error("Transient Client Analytics recovery panel was observed after selecting " + label);
}
// Cover native analytics slicers and header/chip actions, not only segmented source buttons.
async function assertAccessibleControls(panel, context) {
  const undersized = await panel.locator(".filters select, .actions button, .activeFilterBar button").evaluateAll(nodes =>
    nodes.filter(node => node.getBoundingClientRect().height < 44)
      .map(node => (node.closest("label")?.textContent || node.textContent || "").trim().slice(0, 90)));
  if (undersized.length) throw new Error(context + " analytics slicer/action controls below 44px: " + undersized.join(", "));
}
const assert=(ok,message)=>{if(!ok)throw new Error(message)};
let browser, page, failed=false;
const errors=[];
try {
  if (!process.env.ANALYTICS_BASE_URL) await ready();
  browser = await (browserName === "firefox" ? firefox : chromium).launch({
    headless:process.env.ANALYTICS_HEADED !== "1",
    args:browserName === "chromium" ? ["--no-sandbox"] : [],
  });
  page = await browser.newPage({acceptDownloads:true});
  // Record even a short-lived recovery boundary, which final-state assertions miss.
  await page.addInitScript(() => {
    window.__analyticsRecoverySeen = false;
    document.addEventListener("DOMContentLoaded", () => {
      const record = () => {
        if (document.querySelector(".analyticsRecovery")) window.__analyticsRecoverySeen = true;
      };
      new MutationObserver(record).observe(document.documentElement, {subtree:true, childList:true});
      record();
    }, {once:true});
  });
  page.on("pageerror",e => errors.push(e.stack || String(e)));
  page.on("console",m => {if(m.type()==="error")console.log("Console:",m.text().slice(0,1000));});
  await page.goto(base+"/demo/client-analytics",{waitUntil:"domcontentloaded"});
  const source = page.getByRole("group",{name:"Quick source type filters"});
  await page.waitForSelector(".filters select");
  if (await page.locator(".filters select").count() !== 9)
    throw new Error("Expected nine native slicers (including Status) plus prominent Source Type button controls");
  if (await page.locator(".filters label").filter({hasText:"Source Type"}).count())
    throw new Error("Obsolete graphical-browser-crashing Source Type native selector remains");
  await assertCohort(page,"All",60);
  await assertAccessibleControls(page.locator(".clientAnalyticsPage"), "Standalone");
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
  const chips = page.getByRole("region", {name:"Active analytics filters"});
  assert(await chips.getByRole("button", {name:"Clear Source Type filter: Agency"}).count() === 1,
    "Active Agency source must expose a legible removable filter chip");
  await chips.getByRole("button", {name:"Clear Source Type filter: Agency"}).click();
  await assertCohort(page,"All",60);
  assert(await source.getByRole("button",{name:"All sources"}).evaluate(el=>document.activeElement===el), "Clearing Source Type must restore focus to the All sources control");
  // Each of the nine native filter chips must restore keyboard focus to the
  // corresponding persistent select, rather than losing focus to the body.
  const nativeLabels=["Status","Agency","Project","Project Type","Country","Commodity","Timing","Non-conformance","NCR Type"];
  for(const label of nativeLabels){
    const select=page.getByRole("combobox",{name:label,exact:true});
    await select.selectOption({index:1});
    const selected=await select.inputValue();
    const chip=chips.getByRole("button",{name:`Clear ${label} filter: ${selected}`,exact:true});
    await chip.focus();
    await chip.press("Enter");
    assert(await select.evaluate(el=>document.activeElement===el),`Clearing ${label} must restore focus to its select`);
    assert(await select.inputValue()==="All",`Clearing ${label} must reset its value`);
    await assertCohort(page,"All",60);
  }
  const retainedStatus=page.getByRole("combobox",{name:"Status",exact:true});
  await retainedStatus.selectOption("Completed");
  await source.getByRole("button",{name:"Agency",exact:true}).click();
  const agencyChip=chips.getByRole("button",{name:"Clear Source Type filter: Agency"});
  await agencyChip.focus();
  await agencyChip.press("Enter");
  assert(await retainedStatus.inputValue()==="Completed","Removing Source Type must preserve an unrelated Status selection");
  assert(await source.getByRole("button",{name:"All sources"}).evaluate(el=>document.activeElement===el),"Keyboard source chip removal must restore focus");
  await page.getByRole("button",{name:"Reset filters"}).click();
  await assertCohort(page,"All",60);
  // Independent filters must survive removing just the Source Type chip.
  await page.getByRole("group",{name:"Quick source type filters"}).getByRole("button",{name:"Agency"}).click();
  await assertCohort(page,"Agency",45);
  await page.getByRole("button",{name:"Reset filters"}).click();
  await assertCohort(page,"All",60);
  // A focused segment must work with ordinary keyboard activation.
  const independent=source.getByRole("button",{name:"Independent",exact:true});
  await independent.focus();
  await page.keyboard.press("Enter");
  await assertCohort(page,"Independent",15);
  // Repeated source transitions and fresh-document first clicks reproduce intermittent
  // failures that a single successful final state cannot detect.
  for (let attempt = 1; attempt <= 3; attempt++) {
    await page.reload({waitUntil:"domcontentloaded"});
    await assertCohort(page,"All",60);
    const transitions = [
      ["Independent",15], ["Agency",45], ["All",60],
      ["Independent",15], ["All",60], ["Agency",45], ["Independent",15],
    ];
    for (const [label,expected] of transitions) {
      await source.getByRole("button",{name:label==="All"?"All sources":label,exact:true}).click();
      await assertCohort(page,label,expected);
      // Catch a delayed React boundary between state transitions, not just the count.
      await page.waitForTimeout(120);
      if (await page.evaluate(() => Boolean(window.__analyticsRecoverySeen)))
        throw new Error("Transient analytics recovery after "+label+" on fresh reload "+attempt);
      if (errors.length) throw new Error("Browser exception after "+label+":\n"+errors.join("\n"));
    }
  }
  // Completed history belongs to the embedded Analytics experience, not a
  // separate Client History shell. Exercise the real filter and its visible rows.
  await page.getByRole("button",{name:"Reset filters"}).click();
  await assertCohort(page,"All",60);
  await page.getByRole("button",{name:"View completed history here"}).click();
  const statusFilter=page.getByRole("combobox",{name:"Status"});
  await page.waitForFunction(() => {
    const selected=Array.from(document.querySelectorAll(".filters select"))
      .find(el=>el.closest("label")?.textContent?.includes("Status"));
    const rows=Array.from(document.querySelectorAll(".records tbody tr"));
    return selected?.value==="Completed" && rows.length>0
      && rows.every(row=>row.querySelector("td:last-child")?.textContent?.trim()==="Completed")
      && document.querySelector(".activeFilterBar")?.textContent?.includes("Status: Completed");
  },null,{timeout:15000});
  if(await statusFilter.inputValue()!=="Completed")
    throw Error("Completed history shortcut did not select the Analytics Status slicer");
  if(!page.url().includes("/demo/client-analytics"))
    throw Error("Completed history shortcut left the Analytics demo");
  if(errors.length)throw new Error("Analytics browser error after completed history: "+errors.join("\n"));
  const downloadPromise=page.waitForEvent("download");
  await page.getByRole("button",{name:/Download data/}).click();
  const download=await downloadPromise;
  if(download.suggestedFilename()!=="inspectsource-client-demo-inspections.csv")
    throw new Error("Filtered Analytics CSV download unavailable");
  // Download success is not merely an event: verify the browser received the
  // actual filtered fictional dataset with no unrelated inspection statuses.
  const csvText=readFileSync(await download.path(),"utf8");
  const csvLines=csvText.split("\r\n");
  const visibleRecordCount=Number.parseInt(await page.locator(".records .recordHead span").innerText(),10);
  if (!csvLines[0]?.includes('"Source Type"') || !csvLines[0]?.includes('"Status"') ||
      !Number.isFinite(visibleRecordCount) || csvLines.length!==visibleRecordCount+1 ||
      csvLines.slice(1).some(line=>!line.includes(',"Completed",'))) {
    throw new Error("Filtered Analytics CSV rows do not match the Completed synthetic inspection selection");
  }
  if(errors.length)throw new Error("Analytics browser exceptions:\n"+errors.join("\n"));
  // Embedded continuous Client Workspace first-click regression: the original
  // graphical-browser crash was reported in the full Client Demo, not just the
  // standalone Analytics route. Keep the other seven inspection records mounted.
  await page.goto(base + "/demo/client", {waitUntil:"domcontentloaded"});
  const embeddedAnalytics = page.locator("#analytics .clientAnalyticsPage");
  const embeddedSources = embeddedAnalytics.getByRole("group", {name:"Quick source type filters"});
  await page.waitForFunction(() => {
    const panel = document.querySelector("#analytics .clientAnalyticsPage");
    const buttons = panel?.querySelectorAll(".quickSources button");
    return panel?.querySelectorAll(".filters select").length === 9 &&
      buttons?.length === 3 && [...buttons].every(button => !button.disabled);
  }, null, {timeout:15000});
  await assertAccessibleControls(embeddedAnalytics, "Embedded desktop");
  const embeddedInspections = page.locator("#inspections-in-progress .inspectionList .inspection");
  if (await embeddedInspections.count() !== 7)
    throw new Error("Embedded Client Demo must preserve seven synthetic Inspections in Progress");
  const clientSidebar = page.getByRole("complementary", {name:"Client Workspace navigation"});
  await clientSidebar.getByRole("link", {name:"Analytics",exact:true}).click();
  if (!page.url().endsWith("#analytics"))
    throw new Error("Client sidebar Analytics navigation did not stay in the synthetic demo");
  for (const [label,expected] of [["Independent",15],["Agency",45],["All",60],["Independent",15],["All",60]]) {
    await embeddedSources.getByRole("button", {name:label === "All" ? "All sources" : label, exact:true}).click();
    await page.waitForFunction(({label,expected}) => {
      const analytics = document.querySelector("#analytics .clientAnalyticsPage");
      return analytics?.querySelectorAll(".records tbody tr").length === Math.min(expected,30) &&
        analytics?.querySelector(".quickSources [role=status]")?.textContent?.includes(
          "Source: " + label + ". " + expected + " synthetic inspections"
        );
    }, {label,expected}, {timeout:15000});
    await page.waitForTimeout(150);
    if (await page.locator(".analyticsRecovery").count() ||
        await page.evaluate(() => Boolean(window.__analyticsRecoverySeen)))
      throw new Error("Embedded Client Analytics recovery appeared after " + label);
    if (errors.length) throw new Error("Embedded Client Analytics browser exception: " + errors.join("\n"));
  }
  await clientSidebar.getByRole("link", {name:"Inspections in Progress",exact:true}).click();
  if (!page.url().endsWith("#inspections-in-progress") || await embeddedInspections.count() !== 7)
    throw new Error("Client Analytics filters disrupted navigation or removed the seven fictional inspections");
  if (await page.getByText("Log in to view the client workspace").count())
    throw new Error("Embedded Client Demo navigated to a live login-required workspace");
  await page.evaluate(()=>{
    const profile=document.getElementById("profile");
    if(!profile)throw new Error("Canonical Client profile section missing");
    const top=profile.getBoundingClientRect().top+window.scrollY;
    window.scrollTo({top:top-Math.min(window.innerHeight*0.75,650),behavior:"instant"});
  });
  await page.waitForTimeout(250);
  const profileGeometry=await page.evaluate(()=>{
    const top=document.getElementById("profile")?.getBoundingClientRect().top;
    return {top,threshold:Math.min(240,Math.max(100,window.innerHeight*0.25)),
      atBottom:window.scrollY+window.innerHeight>=document.documentElement.scrollHeight-4,
      height:window.innerHeight};
  });
  if(profileGeometry.top>profileGeometry.threshold+15 &&
    profileGeometry.top<profileGeometry.height-20 && !profileGeometry.atBottom){
    if(await clientSidebar.getByRole("link",{name:"Profile",exact:true}).getAttribute("aria-current")==="location")
      throw new Error("Client sidebar prematurely highlighted Profile when only visible at viewport bottom");
  }
  // Regress bottom-of-document clamping: selecting Contracts must highlight
  // Contracts, not the Profile section merely peeking into the viewport.
  await clientSidebar.getByRole("link",{name:"Contracts",exact:true}).click();
  try {
    await page.waitForFunction(() => location.hash==="#contracts" &&
      document.querySelector('nav[aria-label="Client Workspace sections"] a[href="#contracts"]')?.getAttribute("aria-current")==="location",null,{timeout:8000});
  } catch(error){
    const state=await page.evaluate(()=>({
      href:location.href,hash:location.hash,scrollY,viewport:innerHeight,documentHeight:document.documentElement.scrollHeight,
      active:[...document.querySelectorAll('nav[aria-label="Client Workspace sections"] a[aria-current]')].map(a=>a.textContent),
      contractsTop:document.getElementById("contracts")?.getBoundingClientRect().top,
      profileTop:document.getElementById("profile")?.getBoundingClientRect().top,
      sidebarPresent:!!document.querySelector('nav[aria-label="Client Workspace sections"] a[href="#contracts"]'),
    }));
    throw new Error("Contracts navigation timeout: "+JSON.stringify(state)+"; "+String(error));
  }
  assert(await clientSidebar.getByRole("link",{name:"Profile",exact:true}).getAttribute("aria-current")!=="location",
    "Client Contracts bottom-of-page navigation incorrectly highlighted Profile");
  await clientSidebar.getByRole("link",{name:"Profile",exact:true}).click();
  await page.waitForFunction(() => location.hash==="#profile" &&
    document.querySelector('nav[aria-label="Client Workspace sections"] a[href="#profile"]')?.getAttribute("aria-current")==="location");
  // Real-mobile Client Workspace navigation must not occupy the whole screen.
  await page.setViewportSize({width:390,height:780});
  await assertAccessibleControls(embeddedAnalytics, "Embedded mobile");
  const smallMobileTargets = await embeddedAnalytics.locator(".quickSources button, .grid .barRow.clickable").evaluateAll(nodes =>
    nodes.filter(node => node.getBoundingClientRect().height < 44)
      .map(node => (node.textContent || "").trim().slice(0, 80)));
  assert(smallMobileTargets.length === 0,
    "Mobile embedded Analytics source/chart touch targets below 44px: " + smallMobileTargets.join(", "));
  const mobileNavToggle=clientSidebar.getByRole("button",{name:"Show sections"});
  assert(await mobileNavToggle.isVisible(),"Client mobile sidebar must offer a visible Show sections toggle");
  assert(await mobileNavToggle.getAttribute("aria-expanded")==="false",
    "Client mobile section links must be collapsed by default");
  assert(!(await clientSidebar.getByRole("link",{name:"Inspections in Progress",exact:true}).isVisible()),
    "Collapsed Client mobile sidebar must hide the section links");
  await mobileNavToggle.click();
  assert(await clientSidebar.getByRole("button",{name:"Hide sections"}).getAttribute("aria-expanded")==="true",
    "Client mobile disclosure did not expand or announce its open state");
  await clientSidebar.getByRole("link",{name:"Inspections in Progress",exact:true}).click();
  assert(page.url().endsWith("#inspections-in-progress"),
    "Client mobile sidebar navigated outside the synthetic inspections section");
  assert(await clientSidebar.getByRole("button",{name:"Show sections"}).getAttribute("aria-expanded")==="false",
    "Client mobile links must collapse after section navigation");
  assert(await embeddedInspections.count()===7,
    "Client mobile navigation must preserve seven fictional in-progress inspections");
  assert(!(await page.getByText("Log in to view the client workspace").count()),
    "Client mobile navigation displayed a live-workspace login shell");
  // Independent P0-B / #154 browser probe: a new mobile document's FIRST
  // source filter action must never throw, lose its selected state or show a
  // recovery boundary. Older runs only tested mobile after desktop transitions.
  const freshMobile = await browser.newPage({viewport:{width:390,height:780}});
  const mobileFirstErrors = [];
  freshMobile.on("pageerror",error=>mobileFirstErrors.push(error.stack||String(error)));
  // A first-click exception may recover before final DOM assertions. Preserve
  // evidence of even a momentarily mounted analytics error boundary.
  await freshMobile.addInitScript(() => {
    window.__analyticsRecoverySeen = false;
    document.addEventListener("DOMContentLoaded", () => {
      const record = () => {
        if (document.querySelector(".analyticsRecovery")) window.__analyticsRecoverySeen = true;
      };
      new MutationObserver(record).observe(document.documentElement, {subtree:true,childList:true});
      record();
    }, {once:true});
  });
  try {
    for (const width of [390,320]) {
      await freshMobile.setViewportSize({width,height:780});
      await freshMobile.goto(base+"/demo/client-analytics",{waitUntil:"domcontentloaded"});
      await freshMobile.waitForFunction(() =>
        document.querySelectorAll(".quickSources button").length===3 &&
        [...document.querySelectorAll(".quickSources button")].every(button=>!button.disabled),
        null,{timeout:15000});
      await assertCohort(freshMobile,"All",60);
      const mobileSource=freshMobile.getByRole("group",{name:"Quick source type filters"});
      await mobileSource.getByRole("button",{name:"Independent",exact:true}).click();
      await assertCohort(freshMobile,"Independent",15);
      await assertAccessibleControls(freshMobile.locator(".clientAnalyticsPage"),width+"px first-click");
      const clipped=await mobileSource.locator("button").evaluateAll(buttons=>buttons.filter(button=>{
        const rect=button.getBoundingClientRect();
        return rect.width<44||rect.height<44||rect.left<0||rect.right>innerWidth+1;
      }).map(button=>button.textContent?.trim()));
      assert(!clipped.length,width+"px Client Analytics Source Type controls clipped or undersized: "+clipped.join(", "));
      if(mobileFirstErrors.length)throw new Error(width+"px first-click browser error: "+mobileFirstErrors.join("\\n"));
      if(await freshMobile.locator(".analyticsRecovery").count() ||
         await freshMobile.evaluate(() => Boolean(window.__analyticsRecoverySeen)))
        throw new Error(width+"px Independent first-click mounted Analytics recovery panel");
      await mobileSource.getByRole("button",{name:"Agency",exact:true}).click();
      await assertCohort(freshMobile,"Agency",45);
      await mobileSource.getByRole("button",{name:"All sources",exact:true}).click();
      await assertCohort(freshMobile,"All",60);
      const mobileStatus=freshMobile.getByRole("combobox",{name:"Status",exact:true});
      await mobileStatus.selectOption("Completed");
      const mobileChip=freshMobile.getByRole("button",{name:"Clear Status filter: Completed"});
      await mobileChip.focus();
      await mobileChip.press("Enter");
      assert(await mobileStatus.evaluate(el=>document.activeElement===el),width+"px status chip must restore focus");
      await assertCohort(freshMobile,"All",60);
    }
  } finally {
    await freshMobile.close();
  }
  console.log("Embedded Client Analytics: first-click 15/45/60 source transitions, seven inspections and no recovery boundary passed.");
  console.log(`Client Analytics (${browserName}): fresh-document repeated 15/45/60 source transitions, transient error-boundary observation, pointer/keyboard/chart/reset and CSV passed.`);
}catch(e){
  failed=true;
  console.error(e instanceof Error ? e.stack : String(e));
  if(errors.length) console.error("Captured client-side exception stacks:",errors.join("\n"));
  if(page){
    try{
      mkdirSync("artifacts",{recursive:true});
      await page.screenshot({path:"artifacts/client-analytics-browser-failure.png",fullPage:true});
      console.error("Saved synthetic demo screenshot to artifacts/client-analytics-browser-failure.png");
    }catch(screenshotError){console.error("Unable to save failure screenshot:",String(screenshotError));}
  }
  console.error("Server tail:",serverOutput.slice(-3000));
}finally{
  if(browser)await browser.close();
  if(child){child.kill("SIGTERM");await new Promise(r=>setTimeout(r,200)); if(!child.killed)child.kill("SIGKILL");}
}
if(failed)process.exitCode=1;
