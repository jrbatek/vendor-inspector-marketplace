import { spawn } from "node:child_process";
import { chromium } from "playwright";

// Browser-level demo-only regression; no credentials, production writes or external OAuth.
const port = 3104;
const base = process.env.INSPECTOR_DEMO_BASE_URL || "http://127.0.0.1:" + port;
const server = process.env.INSPECTOR_DEMO_BASE_URL ? null : spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], {
  env: { ...process.env, NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ci-placeholder.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "ci-placeholder-anon-key" },
  stdio: ["ignore", "pipe", "pipe"]
});
let output = "", browser, failed = false;
server?.stdout.on("data", x => output += String(x));
server?.stderr.on("data", x => output += String(x));
const assert = (ok, message) => { if (!ok) throw new Error(message); };
async function ready() {
  for (let i = 0; i < 35; i++) {
    try { if ((await fetch(base + "/demo/inspector")).ok) return; } catch {}
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error("Inspector Demo server not ready: " + output.slice(-1000));
}
try {
  if (server) await ready();
  browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const errors = [];
  page.on("pageerror", e => errors.push(e.stack || String(e)));
  await page.goto(base + "/demo/inspector", { waitUntil: "domcontentloaded" });
  const navigation = page.getByRole("navigation", { name: "Inspector Workspace navigation" });
  const names = await navigation.getByRole("button").allTextContents();
  assert(names.join("|") === ["Profile Home","Opportunities","Active Assignments","Availability & Calendar","Selection Insights & Feedback","Qualifications & Documents","Work History","Income & Tax Center"].join("|"), "InspectorHub navigation order or consolidated Work History incorrect: " + names);
  assert(await page.getByText("Inspector Demo · Synthetic data").count() === 1, "Synthetic demo guard banner missing");
  // Single-page InspectorHub: every dashboard is present, with viewport-driven active
  // sidebar state, sticky desktop navigation, deep links and keyboard controls.
  const sectionIds=["home","opportunities","assignments","calendar","insights","qualifications","work","income"];
  for(const id of sectionIds){
    assert(await page.locator("#"+id).count()===1,"InspectorHub missing continuous section "+id);
  }
  const sidePos=await navigation.boundingBox();
  const contentPos=await page.locator("#opportunities").boundingBox();
  assert(sidePos&&contentPos&&sidePos.x+sidePos.width<=contentPos.x,
    "InspectorHub desktop sidebar must be to the left of the content");
  await navigation.getByRole("button",{name:"Work History"}).click();
  await page.waitForFunction(()=>document.querySelector('nav[aria-label="Inspector Workspace navigation"] [aria-current="page"]')?.textContent==="Work History");
  assert(page.url().endsWith("#work"),"InspectorHub click must preserve deep-link hash");
  await page.evaluate(()=>window.scrollTo({top:0,behavior:"instant"}));
  await page.waitForFunction(()=>document.querySelector('nav[aria-label="Inspector Workspace navigation"] [aria-current="page"]')?.textContent==="Profile Home");
  await navigation.getByRole("button",{name:"Profile Home"}).focus();
  await page.keyboard.press("Enter");
  assert(page.url().endsWith("#home"),"InspectorHub keyboard navigation must update hash");
  await page.evaluate(()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"}));
  await page.waitForFunction(()=>document.querySelector('nav[aria-label="Inspector Workspace navigation"] [aria-current="page"]')?.textContent==="Income & Tax Center");
  await page.evaluate(()=>window.scrollTo({top:0,behavior:"instant"}));
  await page.waitForFunction(()=>document.querySelector('nav[aria-label="Inspector Workspace navigation"] [aria-current="page"]')?.textContent==="Profile Home");


  // A section merely entering the viewport bottom must not steal the active nav
  // from Work History while the inspector is still reading it.
  await page.evaluate(()=>{
    const income=document.getElementById("income");
    if(!income)throw new Error("Inline Income & Tax Center section missing");
    const top=income.getBoundingClientRect().top+window.scrollY;
    window.scrollTo({top:top-Math.min(window.innerHeight*0.75,650),behavior:"instant"});
  });
  await page.waitForTimeout(250);
  const incomeGeometry=await page.evaluate(()=>{
    const top=document.getElementById("income")?.getBoundingClientRect().top;
    return {top,threshold:Math.min(220,Math.max(100,window.innerHeight*0.25)),
      atBottom:window.scrollY+window.innerHeight>=document.documentElement.scrollHeight-4,
      height:window.innerHeight};
  });
  assert(incomeGeometry.top>incomeGeometry.threshold+15 &&
    incomeGeometry.top<incomeGeometry.height-20 && !incomeGeometry.atBottom,
    "Income scrollspy regression did not reach the section-peeking geometry: "+JSON.stringify(incomeGeometry));
  assert(await navigation.getByRole("button",{name:"Income & Tax Center"}).getAttribute("aria-current")!=="page",
    "Inspector scrollspy prematurely highlighted Income while only peeking at viewport bottom");
  await page.evaluate(()=>window.scrollTo({top:0,behavior:"instant"}));
  await page.waitForFunction(()=>document.querySelector('nav[aria-label="Inspector Workspace navigation"] [aria-current="page"]')?.textContent==="Profile Home");
  // Home cards must register hash/history, not only change local section state.
  await page.getByRole("button", { name: "Review opportunities" }).click();
  assert(page.url().endsWith("#opportunities"), "Home opportunities CTA did not update deep-link URL");
  assert(await page.getByRole("heading", { name: "Matched inspection work" }).count() === 1, "Opportunities CTA did not open its content");
  await page.evaluate(() => window.history.back());
  await page.getByRole("heading", { name: "Inspection background" }).waitFor();
  assert(await navigation.getByRole("button", { name: "Profile Home" }).getAttribute("aria-current") === "page", "Back navigation did not restore InspectorHub Home");
  await page.getByRole("button", { name: "Open Selection Insights" }).click();
  assert(page.url().endsWith("#insights"), "Home insights CTA did not update deep-link URL");
  assert(await page.getByRole("heading", { name: "Ratings & feedback" }).count() === 1, "Insights CTA did not open full inline feedback dashboard");
  const inlineInsights=page.locator(".insightsPage.embedded");
  assert(await inlineInsights.count()===1,"InspectorHub Insights must render in persistent green sidebar workspace");
  assert(await inlineInsights.getByRole("heading",{name:"Compare relevant peer groups"}).count()===1,"Inline peer filters/comparisons missing");
  assert(await inlineInsights.getByLabel("Geography").count()===1,"Inline peer geography filter missing");
  assert(await inlineInsights.getByRole("link",{name:"Back to Inspector Demo"}).count()===0,"Embedded Insights must not add a redundant back link");
  const ratingsBox=await inlineInsights.getByRole("heading",{name:"Ratings & feedback"}).boundingBox();
  const compareBox=await inlineInsights.getByRole("heading",{name:"Compare relevant peer groups"}).boundingBox();
  assert(ratingsBox&&compareBox&&ratingsBox.y<compareBox.y,"Client ratings must appear above peer comparisons");
  await page.evaluate(() => window.history.back());
  await page.getByRole("heading", { name: "Inspection background" }).waitFor();
  await navigation.getByRole("button", { name: "Active Assignments" }).click();
  assert(await page.locator("#assignments").getByRole("button", { name: "Open assignment" }).count() === 3, "Three synthetic active assignments expected");
  for (const name of ["LNG Compressor Package", "Gulf Horizon Refinery Upgrade", "Orion Deepwater Platform"]) {
    const assignmentCard=page.locator("#assignments article").filter({ hasText: name });
    const dueSummary=await assignmentCard.locator(".dueDate").innerText();
    assert(dueSummary.startsWith("Due: ") && dueSummary.includes("2026"), "Active Assignment card missing readable exact due date for " + name);
    await assignmentCard.getByRole("button", { name: "Open assignment" }).click();
    const assignment = page.getByRole("region", { name: "Open assignment details" });
    assert(await assignment.count() === 1, "Assignment workspace missing for " + name);
    assert(await assignment.getByRole("heading", { name: "Milestones" }).count() === 1, "Milestones section missing for " + name);
    assert(await assignment.locator(".milestones li").count() === 4, "Expected four meaningful scenario milestones for " + name);
    assert(await assignment.locator(".documents li").count() === 3, "Expected three document statuses for " + name);
    assert((await assignment.innerText()).includes("example.invalid"), "Site contact must be clearly fictional for " + name);
    assert((await assignment.innerText()).includes("Outstanding items / next action"), "Outstanding action missing for " + name);
    assert((await assignment.innerText()).includes(dueSummary.slice("Due: ".length)),
      "Active Assignment card due date differs from Open Assignment details for " + name);
    const pdfLink=assignment.getByRole("link", { name: "Open synthetic report PDF" });
    const pdf=await page.request.get(base+(await pdfLink.getAttribute("href")));
    assert(pdf.ok() && (pdf.headers()["content-type"]||"").includes("application/pdf"),"Synthetic assignment PDF not working for "+name);
    await assignment.getByRole("button", { name: /Back to active assignments/ }).click();
  }
  // Sidebar navigation always returns to the list, not a previously opened detail.
  await page.locator("#assignments article").filter({ hasText: "LNG Compressor Package" })
    .getByRole("button", { name: "Open assignment" }).click();
  assert(await page.getByRole("region", { name: "Open assignment details" }).count() === 1,
    "Assignment must open before testing sidebar reset");
  await navigation.getByRole("button", { name: "Active Assignments" }).click();
  assert(await page.getByRole("region", { name: "Open assignment details" }).count() === 0 &&
    await page.locator("#assignments").getByRole("button", { name: "Open assignment" }).count() === 3,
    "Active Assignments sidebar should return to three-record list from detail");
  await page.locator("#assignments article").filter({ hasText: "Orion Deepwater Platform" })
    .getByRole("button", { name: "Open assignment" }).click();
  await navigation.getByRole("button", { name: "Profile Home" }).click();
  await navigation.getByRole("button", { name: "Active Assignments" }).click();
  assert(await page.getByRole("region", { name: "Open assignment details" }).count() === 0 &&
    await page.locator("#assignments").getByRole("button", { name: "Open assignment" }).count() === 3,
    "Leaving an assignment for another section must clear stale detail when returning");
  await navigation.getByRole("button", { name: "Opportunities" }).click();
  // A fictional offer has one shared day rate in listing, preview and acceptance notice.
  const firstOpportunity=page.locator("article.row").filter({hasText:"Gulf Horizon Refinery Upgrade"});
  assert((await firstOpportunity.innerText()).includes("Offered rate: $950/day"),"Opportunity card rate must be a single $950/day");
  await firstOpportunity.getByRole("button", { name: "Preview Opportunity" }).click();
  const dialog = page.getByRole("dialog", { name: "Opportunity preview" });
  assert(await dialog.count() === 1, "Opportunity preview did not open");
  assert((await dialog.innerText()).includes("Offered day rate: $950/day"),"Opportunity preview day rate differs from list");
  assert(!(await dialog.innerText()).includes("$850–$1,050"),"Rate range unexpectedly reintroduced");
  await dialog.getByRole("button", { name: "Accept" }).click();
  assert(await page.locator("#opportunities").getByRole("status").filter({hasText:"Opportunity accepted at $950/day for Gulf Horizon Refinery Upgrade"}).count() === 1,
    "Acceptance confirmation does not preserve exact fictional offered day rate and project");
  await firstOpportunity.getByRole("button", { name: "Preview Opportunity" }).click();
  assert(await dialog.count() === 1, "Opportunity preview did not reopen after acceptance");
  // The modal can stay open when viewport scrollspy changes sections (e.g. programmatic scroll).
  // The action outcome must belong to Opportunities, not to whichever section is visible.
  await page.evaluate(()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"}));
  await page.waitForFunction(()=>document.querySelector('nav[aria-label="Inspector Workspace navigation"] [aria-current="page"]')?.textContent==="Income & Tax Center");
  await dialog.getByRole("button", { name: "Decline" }).click();
  assert(await page.locator("#opportunities").getByRole("status").filter({ hasText: "Opportunity declined" }).count() === 1, "Declined feedback missing in Opportunities");
  await navigation.getByRole("button", { name: "Availability & Calendar" }).click();
  assert(await page.getByText("Opportunity declined").count() === 0, "Opportunity feedback leaked across InspectorHub sections");
  const cal = page.getByRole("region", { name: "Inspector availability calendar" });
  assert(await cal.count() === 1, "Calendar missing");
  assert(await cal.locator(".legend .busy").innerText() === "Personal Busy", "Calendar legend must clearly name Personal Busy");
  const busyOption = cal.locator(".availabilityActions select option[value=\"Busy\"]");
  assert(await busyOption.innerText() === "Personal Busy", "Block Dates should label Personal Busy without altering its underlying status");
  const tabs = cal.getByRole("group", { name: "Calendar view" });
  assert(await tabs.getByRole("button", { name: "Month" }).getAttribute("aria-pressed") === "true", "Month not the default calendar view");
  assert(await cal.getByText(/Our Anniversary · All day/).count() >= 1, "Private synthetic anniversary missing");
  assert(await cal.getByText(/Doctor Appointment · 10:00/).count() >= 1, "Private synthetic doctor appointment missing");
   // All provider links must toggle only synthetic state, preserve private events and remain legible.
   const connections = cal.locator(".calendarConnections");
   const googleConnected = connections.getByRole("button", { name: "Google Calendar · Connected (demo)" });
   assert(await googleConnected.getAttribute("aria-pressed") === "true", "Google demo connection should start linked");
   const outlookLink = connections.getByRole("button", { name: "Connect Outlook Calendar" });
   assert(await outlookLink.getAttribute("aria-pressed") === "false", "Outlook should start unlinked");
   await outlookLink.click();
   assert(await connections.getByRole("button", { name: "Outlook Calendar · Connected (demo)" }).getAttribute("aria-pressed") === "true",
     "Outlook demo connection did not show the linked state");
   await connections.getByRole("button", { name: "Link Other Calendar" }).click();
   assert(await connections.getByRole("button", { name: "Other Calendar · Connected (demo)" }).getAttribute("aria-pressed") === "true",
     "Other Calendar demo connection did not show the linked state");
   await googleConnected.click();
   const googleUnlinked = connections.getByRole("button", { name: "Link Google Calendar" });
   assert(await googleUnlinked.getAttribute("aria-pressed") === "false", "Google demo connection cannot be unlinked");
   // The preceding click leaves the pointer hovering on the button. Measure resting and hover states independently.
   await page.mouse.move(0, 0);
   const unlinkedColors = await googleUnlinked.evaluate(node => ({ foreground: getComputedStyle(node).color, background: getComputedStyle(node).backgroundColor }));
   await googleUnlinked.hover();
   const hoveredColors = await googleUnlinked.evaluate(node => ({ foreground: getComputedStyle(node).color, background: getComputedStyle(node).backgroundColor }));
   assert(hoveredColors.foreground === "rgb(6, 78, 59)" && hoveredColors.background === "rgb(204, 251, 241)",
     "Unlinked calendar hover must remain readable on pale mint: " + JSON.stringify(hoveredColors));
   assert(unlinkedColors.foreground === "rgb(17, 94, 89)" && unlinkedColors.background === "rgb(255, 255, 255)",
     "Unlinked calendar controls must remain visible on white: " + JSON.stringify(unlinkedColors));
   await googleUnlinked.click();
   assert(await connections.getByRole("button", { name: "Google Calendar · Connected (demo)" }).getAttribute("aria-pressed") === "true",
     "Google demo connection did not relink");
   assert((await connections.locator(".connectionStatus").innerText()).includes("Google Calendar, Outlook Calendar, Other Calendar"),
     "Linked calendar providers are not summarized in one compact section");
   assert(await cal.getByText(/Our Anniversary · All day/).count() >= 1 && await cal.getByText(/Doctor Appointment · 10:00/).count() >= 1,
     "Simulated connection toggles altered private inspector sample events");
  // Calendar jump returns to the fixed demo reference date in any view, without modifying events.
  await cal.getByRole("button", { name: "Next month" }).click();
  assert(await cal.getByRole("heading", { name: "December 2026" }).count()===1,"Month navigation failed before demo-today jump");
  assert(await cal.getByLabel("Start date").inputValue()==="2026-12-01" && await cal.getByLabel("End date").inputValue()==="2026-12-01",
    "Month navigation must prefill one day, not silently select a two-day block");
  assert(await cal.getByRole("button",{name:"Choose 2026-12-01 for availability"}).getAttribute("aria-pressed")==="true",
    "New month first day must visibly reflect the selected single date");
  assert(await cal.getByRole("button",{name:"Choose 2026-12-02 for availability"}).getAttribute("aria-pressed")==="false",
    "Second date must not appear preselected without explicit user selection");
  assert((await cal.getByRole("button",{name:"Choose 2026-12-02 for availability"}).locator("xpath=..").innerText()).includes("Not set"),
    "Browsing a month must not silently declare availability");
  await cal.getByRole("button", { name: "Return to demo today, November 9 2026" }).click();
  assert(await cal.getByRole("heading", { name: "November 2026" }).count()===1,"Demo today did not restore November month");
  assert(await cal.getByRole("button", { name: "Choose 2026-11-09 for availability" }).getAttribute("aria-current")==="date","Demo today date must be visibly indicated");
  assert(await cal.getByLabel("Start date").inputValue()==="2026-11-09","Demo today did not select the correct date");
  assert(await cal.getByText(/Our Anniversary · All day/).count()>=1,"Today jump changed private synthetic event data");
  // Direct date navigation is read-only and keeps Month, Week and the range in sync.
  await cal.getByLabel("Jump to date").fill("2027-01-20");
  assert(await cal.getByRole("heading", { name: "January 2027" }).count()===1,
    "Jump to date must show the selected calendar month");
  assert(await cal.getByLabel("Start date").inputValue()==="2027-01-20" &&
    await cal.getByLabel("End date").inputValue()==="2027-01-20",
    "Jump to date must select one date, never an implicit multi-day block");
  assert(await cal.getByRole("button",{name:"Choose 2027-01-20 for availability"}).getAttribute("aria-pressed")==="true",
    "Jump to date must visibly select the target day");
  assert((await cal.getByRole("button",{name:"Choose 2027-01-20 for availability"}).locator("xpath=..").innerText()).includes("Not set"),
    "Jump to date must not silently mark unknown availability as confirmed");
  await tabs.getByRole("button",{name:"Week"}).click();
  assert(await cal.getByLabel("Week containing").inputValue()==="2027-01-20",
    "Jump to date must synchronize Week without writing availability");
  await tabs.getByRole("button",{name:"Month"}).click();
  await cal.getByRole("button",{name:"Return to demo today, November 9 2026"}).click();
  // Editing Start date through the date-range form must reveal its month/selected
  // day, synchronize Week navigation and never write an availability event.
  await cal.getByRole("button",{name:"Return to demo today, November 9 2026"}).click();
  await cal.getByLabel("End date").fill("2027-03-05");
  await cal.getByLabel("Start date").fill("2027-03-05");
  // React updates a controlled date input asynchronously after Playwright's
  // fill event. Wait for the actual visible month rather than sampling before
  // that state commit; still fail if the month never changes.
  try {
    await cal.getByRole("heading",{name:"March 2027"}).waitFor({state:"visible",timeout:10000});
  } catch {
    const actualHeading=await cal.locator(".calendarHeader h2").first().innerText();
    const actualStart=await cal.getByLabel("Start date").inputValue();
    const actualEnd=await cal.getByLabel("End date").inputValue();
    throw new Error("Editing Start date left the visible calendar on a stale month: "+JSON.stringify({actualHeading,actualStart,actualEnd}));
  }
  assert(await cal.getByRole("button",{name:"Choose 2027-03-05 for availability"}).getAttribute("aria-pressed")==="true",
    "Start date form change did not visibly select the edited date");
  assert((await cal.getByRole("button",{name:"Choose 2027-03-05 for availability"}).locator("xpath=..").innerText()).includes("Not set"),
    "Editing Start date must never write an availability event");
  await tabs.getByRole("button",{name:"Week"}).click();
  assert(await cal.getByLabel("Week containing").inputValue()==="2027-03-05",
    "Editing Start date failed to synchronize the Week anchor");
  await tabs.getByRole("button",{name:"Month"}).click();
  await cal.getByRole("button",{name:"Return to demo today, November 9 2026"}).click();
  // Arbitrary month jumps must open the full Month grid even from List.
  await tabs.getByRole("button",{name:"List"}).click();
  await cal.getByLabel("Jump to month").fill("2027-02");
  assert(await tabs.getByRole("button",{name:"Month"}).getAttribute("aria-pressed")==="true",
    "Jump to month from List did not open the full Month calendar");
  assert(await cal.getByRole("heading",{name:"February 2027"}).count()===1,"Month jump did not show February 2027");
  assert(await cal.getByLabel("Start date").inputValue()==="2027-02-01","Month jump did not set first day");
  assert(await cal.getByLabel("End date").inputValue()==="2027-02-01","Month jump did not set end day");
  assert((await cal.getByRole("button",{name:"Choose 2027-02-01 for availability"}).locator("xpath=..").innerText()).includes("Not set"),"Month selection must not change availability");
  await tabs.getByRole("button",{name:"List"}).click();
  assert(await cal.getByText("No scheduled demo events in February 2027").count()===1,
    "A month without synthetic events must display a meaningful List empty state");
  assert((await cal.getByRole("status").filter({hasText:"No scheduled demo events"}).innerText()).includes("Not set, not confirmed available"),
    "Empty List must not imply unmarked dates are available");
  await cal.getByRole("button",{name:"Open Month calendar"}).click();
  assert(await tabs.getByRole("button",{name:"Month"}).getAttribute("aria-pressed")==="true",
    "Empty List recovery must return to Month view");
  await tabs.getByRole("button",{name:"Week"}).click();
  assert(await cal.getByLabel("Week containing").inputValue()==="2027-02-01","Month jump did not synchronize Week anchor");
  // The Month arrows are month-level navigation even when Week is open.
  await cal.getByRole("button",{name:"Next month"}).click();
  assert(await tabs.getByRole("button",{name:"Month"}).getAttribute("aria-pressed")==="true" &&
    await cal.getByRole("heading",{name:"March 2027"}).count()===1,
    "Next month from Week left the inspector on a one-week view");
  assert(await cal.getByLabel("Start date").inputValue()==="2027-03-01" &&
    await cal.getByLabel("End date").inputValue()==="2027-03-01",
    "Next month from Week must prefill one March day, not mutate availability");
  await cal.getByLabel("Jump to month").fill("2026-11");
  assert(await cal.getByRole("heading",{name:"November 2026"}).count()===1,"Returning from month jump failed");
  assert(await cal.getByText(/Doctor Appointment · 10:00/).count()>=1,"Month jump lost private appointment data");
  await tabs.getByRole("button", { name: "Week" }).click();
  // Earlier arbitrary month navigation selects Nov 1, not the fixed demo-today anchor.
  // Establish Nov 9 explicitly so the following next-week assertion checks Nov 16.
  await cal.getByRole("button", { name: "Return to demo today, November 9 2026" }).click();
  assert(await cal.getByLabel("Week containing").inputValue()==="2026-11-09",
    "Week navigation smoke did not establish demo today before stepping a week");
  await cal.getByRole("button", { name: "Next week" }).click();
  assert(await cal.getByLabel("Week containing").inputValue()==="2026-11-16", "Week navigation did not move to next week");
  assert(await cal.getByLabel("Start date").inputValue()==="2026-11-16" && await cal.getByLabel("End date").inputValue()==="2026-11-16",
    "Week navigation must select one new anchor date without changing availability");
  assert(await cal.getByRole("button", { name: "Choose 2026-11-16 for availability" }).getAttribute("aria-pressed")==="true",
    "Visible Week anchor date must be selected");
  assert((await cal.getByRole("button", { name: "Choose 2026-11-17 for availability" }).locator("xpath=..").innerText()).includes("Not set"),
    "Browsing to a week must not silently declare availability");
  await cal.getByRole("button", { name: "Return to demo today, November 9 2026" }).click();
  assert(await cal.getByLabel("Week containing").inputValue()==="2026-11-09","Today jump did not synchronize Week anchor");

  assert(await tabs.getByRole("button", { name: "Week" }).getAttribute("aria-pressed") === "true", "Week view cannot be selected");
  const weekDatePicker = cal.getByRole("button", { name: "Choose 2026-11-11 for availability" });
  await weekDatePicker.click();
  assert(await weekDatePicker.getAttribute("aria-pressed") === "true", "Selected Week day has no visible state");
  assert(await cal.getByLabel("Start date").inputValue() === "2026-11-11", "Week date must prefill start");
  assert(await cal.getByLabel("End date").inputValue() === "2026-11-11", "Week date must prefill end");
  assert((await weekDatePicker.locator("xpath=..").innerText()).includes("Not set"), "Week date selection must not auto-mark availability");
  // Month → Week must show the newly chosen day, not an older week anchor.
  await tabs.getByRole("button", { name: "Month" }).click();
  await cal.getByRole("button", { name: "Choose 2026-11-25 for availability" }).click();
  await tabs.getByRole("button", { name: "Week" }).click();
  assert(await cal.getByLabel("Week containing").inputValue() === "2026-11-25",
    "Month to Week switched to stale anchor instead of selected day");
  assert(await cal.getByRole("button", { name: "Choose 2026-11-25 for availability" }).getAttribute("aria-pressed") === "true",
    "Switching Month to Week lost the selected day");
  await tabs.getByRole("button", { name: "List" }).click();
  assert(await tabs.getByRole("button", { name: "List" }).getAttribute("aria-pressed") === "true", "List view cannot be selected");
  assert(await cal.getByText("Inspector only · client view: Busy").count() >= 2, "List view lacks privacy label for external events");
  const listDatePicker = cal.getByRole("button", { name: "Choose 2026-11-18 from list for availability" });
  await listDatePicker.click();
  assert(await listDatePicker.getAttribute("aria-pressed") === "true", "Selected List event date has no visible state");
  assert(await cal.getByLabel("Start date").inputValue() === "2026-11-18", "List selection must prefill start date");
  assert(await cal.getByLabel("End date").inputValue() === "2026-11-18", "List selection must prefill end date");
  assert(await cal.getByText("Inspector only · client view: Busy").count() >= 2, "Selecting a private List event must not expose or overwrite it");
  await tabs.getByRole("button", { name: "Month" }).click();
  await cal.getByRole("button", { name: "Open assignment" }).first().click();
  assert(await page.getByRole("heading", { name: /LNG Compressor Package|Gulf Horizon Refinery Upgrade|Orion Deepwater Platform/ }).count() > 0, "Calendar inspection did not open a populated assignment");
  assert(page.url().endsWith("#assignments"), "Calendar Open assignment must deep-link the assignments content");
  assert(await page.getByText(/Opportunity declined/).count() === 0, "Stale opportunity alert appeared on assignment");
  await navigation.getByRole("button", { name: "Availability & Calendar" }).click();
  const calendar = page.getByRole("region", { name: "Inspector availability calendar" });
  // Selecting a date should prefill the Block Dates form without actually changing
  // the private inspector's synthetic availability until explicitly submitted.
  await calendar.getByRole("button",{name:"Next assigned inspection"}).click();
  assert(await calendar.getByLabel("Start date").inputValue()==="2026-11-26",
    "Next assigned inspection did not jump to the next real synthetic assignment date");
  assert(await calendar.getByLabel("End date").inputValue()==="2026-11-26",
    "Next assignment jump must select only one date, not block availability");
  assert(await calendar.getByRole("button",{name:"Choose 2026-11-26 for availability"}).getAttribute("aria-pressed")==="true",
    "Next assignment jump did not visibly select the scheduled date");
  // Inspectors can browse backwards through real synthetic assignments, then
  // return forward without changing the assigned blocks or linked personal Busy events.
  await calendar.getByRole("button",{name:"Previous assigned inspection"}).click();
  assert(await calendar.getByLabel("Start date").inputValue()==="2026-11-12" &&
    await calendar.getByLabel("End date").inputValue()==="2026-11-12",
    "Previous assignment must land on the earlier distinct project, not its final inspection day");
  assert(await calendar.getByRole("button",{name:"Choose 2026-11-12 for availability"}).getAttribute("aria-pressed")==="true",
    "Previous assignment must visibly select the earlier assigned day");
  await calendar.getByRole("button",{name:"Next assigned inspection"}).click();
  assert(await calendar.getByLabel("Start date").inputValue()==="2026-11-26",
    "Moving forward again must return to the next assigned inspection, not an arbitrary date");
  await calendar.getByRole("button",{name:"Return to demo today, November 9 2026"}).click();
  await calendar.getByRole("button",{name:"Previous assigned inspection"}).click();
  assert((await calendar.getByRole("status").allInnerTexts()).some(text=>text.includes("No earlier assigned demo inspections")),
    "Previous assignment must explain when there is no earlier synthetic assignment");
  assert(await calendar.getByLabel("Start date").inputValue()==="2026-11-09",
    "No-previous-assignment response must preserve the current selection");
  await calendar.getByRole("button",{name:"Next assigned inspection"}).click();
  assert(await calendar.getByLabel("Start date").inputValue()==="2026-11-12",
    "Next assignment after demo today must skip the second day of Gulf Horizon and open the next distinct project");
  await calendar.getByRole("button",{name:"Next assigned inspection"}).click();
  assert(await calendar.getByLabel("Start date").inputValue()==="2026-11-26",
    "Next distinct assignment from LNG must start Orion, not advance to another LNG day");
  await calendar.getByRole("button",{name:"Previous assigned inspection"}).click();
  assert(await calendar.getByLabel("Start date").inputValue()==="2026-11-12",
    "Previous distinct assignment from Orion must return to the first LNG assignment date");
  const datePicker = calendar.getByRole("button", { name: "Choose 2026-11-19 for availability" });
  await datePicker.click();
  assert(await datePicker.getAttribute("aria-pressed") === "true", "Selected calendar date is not visibly marked");
  // Shift-click extends the selected range without writing calendar events.
  const shiftEnd = calendar.getByRole("button", { name: "Choose 2026-11-22 for availability" });
  await shiftEnd.click({ modifiers: ["Shift"] });
  assert(await calendar.getByLabel("Start date").inputValue() === "2026-11-19" &&
    await calendar.getByLabel("End date").inputValue() === "2026-11-22",
    "Shift-click did not select an inclusive forward range from the first chosen date");
  assert(await calendar.getByRole("button", { name: "Choose 2026-11-20 for availability" }).getAttribute("aria-pressed") === "true",
    "Shift-click must visibly include intermediate days without changing their Busy state");
  assert((await shiftEnd.locator("xpath=..").innerText()).includes("Not set"),
    "Shift-click selection must not create an availability record");
  const shiftEarlier = calendar.getByRole("button", { name: "Choose 2026-11-17 for availability" });
  await shiftEarlier.focus();
  await page.keyboard.press("Shift+Enter");
  assert(await calendar.getByLabel("Start date").inputValue() === "2026-11-17" &&
    await calendar.getByLabel("End date").inputValue() === "2026-11-19",
    "Shift+Enter did not normalize the reverse date range around the original anchor");
  await datePicker.click();
  assert(await calendar.getByLabel("Start date").inputValue() === "2026-11-19" &&
    await calendar.getByLabel("End date").inputValue() === "2026-11-19",
    "Unmodified click must still reset selection to a single day");
  // A date range must visibly select every day, without making unmarked days Available.
  await calendar.getByLabel("Start date").fill("2026-11-28");
  await calendar.getByLabel("End date").fill("2026-11-30");
  for (const date of ["2026-11-28", "2026-11-29", "2026-11-30"]) {
    assert(await calendar.getByRole("button", { name: `Choose ${date} for availability` }).getAttribute("aria-pressed") === "true",
      "Date in selected range must be visibly pressed: " + date);
  }
  const impact = calendar.locator(".rangePreview");
  assert((await impact.innerText()).includes("3 selected dates") && (await impact.innerText()).includes("0 assigned inspection days"),
    "Calendar range impact must summarize three non-conflicting dates before update");
  assert(await impact.getAttribute("role") === "status", "Range impact must be announced accessibly");
  assert(await calendar.getByRole("button", { name: "Choose 2026-11-27 for availability" }).getAttribute("aria-pressed") === "false",
    "Outside date must not appear selected");
  assert((await calendar.getByRole("button", { name: "Choose 2026-11-29 for availability" }).locator("xpath=..").innerText()).includes("Not set"),
    "Highlighting a range must not silently declare dates Available");
  await calendar.getByLabel("Start date").fill("2026-11-30");
  await calendar.getByLabel("End date").fill("2026-11-28");
  assert(await calendar.getByRole("button", { name: "Choose 2026-11-29 for availability" }).getAttribute("aria-pressed") === "false",
    "Reversed range must never indicate selected dates");
  const keyboardDate = calendar.getByRole("button", { name: "Choose 2026-11-21 for availability" });
  await keyboardDate.focus();
  await page.keyboard.press("Enter");
  assert(await keyboardDate.getAttribute("aria-pressed") === "true", "Keyboard calendar date selection is not marked");
  assert(await calendar.getByLabel("Start date").inputValue() === "2026-11-21", "Enter key did not prefill the selected start");
  await datePicker.click();
  assert(await calendar.getByLabel("Start date").inputValue() === "2026-11-19", "Month date pick did not prefill start");
  assert(await calendar.getByLabel("End date").inputValue() === "2026-11-19", "Month date pick did not prefill end");
  assert((await datePicker.locator("xpath=..").innerText()).includes("Not set"),
    "Selecting a month day must not implicitly mark availability or write any event");
  for (const name of ["Start date", "End date", "Availability"]) {
    const control = name === "Availability" ? calendar.locator(".availabilityActions select") : calendar.getByLabel(name, { exact: true });
    const colors = await control.evaluate(element => {
      const style = getComputedStyle(element);
      return { text: style.color, background: style.backgroundColor, border: style.borderColor };
    });
    assert(colors.text === "rgb(15, 23, 42)" && colors.background === "rgb(255, 255, 255)" &&
      colors.border === "rgb(100, 116, 139)", name + " availability input must be visibly legible: " + JSON.stringify(colors));
  }
  await calendar.getByLabel("Start date").fill("2026-11-18");
  await calendar.getByLabel("End date").fill("2026-11-18");
  assert((await impact.innerText()).includes("1 linked private Busy day") &&
    (await impact.innerText()).includes("Protected dates cannot be overwritten or cleared"),
    "Protected personal appointment must be counted before updating without leaking its title into the summary");
  assert((await impact.innerText()).includes("1 protected day"),"A single private Busy date must count as one non-editable date");
  await calendar.getByLabel("Start date").fill("2026-11-09");
  await calendar.getByLabel("End date").fill("2026-11-20");
  assert((await impact.innerText()).includes("6 protected days"),
    "Calendar range must count unique protected dates across assigned work and private Busy appointments");
  await calendar.getByLabel("Start date").fill("2026-11-18");
  await calendar.getByLabel("End date").fill("2026-11-18");
  const impactColors=await impact.evaluate(el=>({color:getComputedStyle(el).color,background:getComputedStyle(el).backgroundColor}));
  assert(impactColors.color==="rgb(127, 29, 29)"&&impactColors.background==="rgb(255, 247, 247)",
    "Selected protected-date warning must remain legible: "+JSON.stringify(impactColors));
  await calendar.getByRole("button", { name: "Block dates / Update availability" }).click();
  const conflictAlert=calendar.getByRole("alert").filter({hasText:"overlaps a linked personal Busy event"});
  assert(await conflictAlert.count()===1,"Private event conflict should be announced as a warning");
  const conflictColors=await conflictAlert.evaluate(el=>({color:getComputedStyle(el).color,background:getComputedStyle(el).backgroundColor}));
  assert(conflictColors.color==="rgb(127, 29, 29)"&&conflictColors.background==="rgb(255, 247, 247)",
    "Calendar private-event conflict must be visibly distinct from green success: "+JSON.stringify(conflictColors));
  // Correcting the date range dismisses warnings for the previous selection immediately.
  await calendar.getByLabel("End date").fill("2026-11-19");
  assert(await conflictAlert.count()===0,
    "Changing selected dates retained a stale personal-event conflict warning");
  await calendar.getByLabel("Start date").fill("2026-11-19");
  assert((await impact.innerText()).includes("0 protected days"),
    "Editing away from a protected appointment did not refresh range impact");
  // Reversed dates are visibly invalid before clicking, not silently the same as a normal range.
  await calendar.getByLabel("Start date").fill("2026-11-30");
  await calendar.getByLabel("End date").fill("2026-11-28");
  for(const label of ["Start date","End date"]){
    const date=calendar.getByLabel(label,{exact:true});
    assert(await date.getAttribute("aria-invalid")==="true","Reversed calendar "+label+" must be marked invalid");
    const contrast=await date.evaluate(el=>({color:getComputedStyle(el).color,background:getComputedStyle(el).backgroundColor,border:getComputedStyle(el).borderTopColor}));
    assert(contrast.color==="rgb(127, 29, 29)"&&contrast.background==="rgb(255, 247, 247)"&&contrast.border==="rgb(185, 28, 28)",
      "Reversed calendar date field must be visibly invalid: "+JSON.stringify(contrast));
  }
  assert(await calendar.getByRole("alert").filter({hasText:"no more than 62 days"}).count()===1,"Date-range recovery guidance missing");
  await calendar.getByLabel("Start date").fill("2026-11-18");
  await calendar.getByLabel("End date").fill("2026-11-18");
  assert(await calendar.getByRole("alert").filter({hasText:"no more than 62 days"}).count()===0,"Valid date recovery must clear invalid guidance");
  assert(await calendar.getByText(/overlaps a linked personal Busy event/).count() === 0,
    "Previously dismissed private-calendar warning reappeared after valid date correction");
  // A warning only applies to the original date range; navigating to a new month
  // or week must not leave the inspector thinking the new range is invalid.
  await calendar.getByRole("button", { name: "Next month" }).click();
  assert(await calendar.getByText(/overlaps a linked personal Busy event/).count() === 0,
    "Stale calendar conflict warning persisted after month navigation");
  await calendar.getByRole("button", { name: "Return to demo today, November 9 2026" }).click();
  await calendar.getByLabel("Start date").fill("2026-11-09");
  await calendar.getByLabel("End date").fill("2026-11-09");
  assert((await impact.innerText()).includes("1 assigned inspection day"), "Assigned inspection conflict must be shown before update");
  await calendar.getByLabel("Start date").fill("2026-11-29");
  await calendar.getByLabel("End date").fill("2026-11-29");
  await calendar.getByRole("button", { name: "Block dates / Update availability" }).click();
  assert((await impact.innerText()).includes("1 inspector-added day"), "Range impact must refresh after inspector-added date is blocked");
  assert(await calendar.getByText("1 dates updated in this synthetic session only.").count() === 1, "Non-conflicting synthetic date update failed");
  const manuallyBlocked = calendar.getByRole("button", { name: "Choose 2026-11-29 for availability" }).locator("xpath=..");
  assert((await manuallyBlocked.innerText()).includes("Unavailable"),"Demo block did not display an Unavailable calendar event");
  // Browser-local Calendar edits must survive trips to other InspectorHub sections,
  // without leaking the inactive calendar into keyboard or screen-reader navigation.
  await navigation.getByRole("button", { name: "Active Assignments" }).click();
  assert(await page.getByRole("region", { name: "Inspector availability calendar" }).count() === 1,
    "Calendar must remain in the continuous page when scrolling to other sections");
  await navigation.getByRole("button", { name: "Availability & Calendar" }).click();
  assert((await calendar.getByRole("button", { name: "Choose 2026-11-29 for availability" })
    .locator("xpath=..").innerText()).includes("Unavailable"),
    "Inspector-added demo Block Dates disappeared after sidebar navigation");
  assert(await calendar.getByLabel("Start date").inputValue() === "2026-11-29",
    "Returning to Calendar lost the inspector-selected date");
  assert(await calendar.getByRole("group", { name: "Calendar view" })
    .getByRole("button", { name: "Month" }).getAttribute("aria-pressed") === "true",
    "Returning to Calendar changed the selected calendar view");

  await calendar.getByRole("button", { name: "Clear inspector-added demo dates" }).click();
  assert(await calendar.getByText(/1 inspector-added demo date cleared/).count() === 1,"Manual clearing did not confirm one removed synthetic date");
  assert((await manuallyBlocked.innerText()).includes("Not set"),"Cleared inspector-added date did not return to Not set");
  assert(await calendar.getByText(/Our Anniversary · All day/).count() > 0,"Clearing removed a private calendar fixture");
  await calendar.getByLabel("Start date").fill("2026-11-18");
  await calendar.getByLabel("End date").fill("2026-11-18");
  await calendar.getByRole("button", { name: "Clear inspector-added demo dates" }).click();
  assert(await calendar.getByText(/Private events cannot be cleared/).count() === 1,"Clearing must not override imported personal Busy events");
  // The continuous InspectorHub page preserves earlier Outlook link state.
  await calendar.getByRole("button", { name: "Outlook Calendar · Connected (demo)" }).click();
  assert(await calendar.getByRole("button", { name: "Connect Outlook Calendar" }).getAttribute("aria-pressed") === "false",
    "Returning to Calendar must preserve and allow unlinking prior demo connections");
  assert(await calendar.getByText(/demo|simulat/i).count() > 0, "Calendar connection is not clearly labeled simulated");
  // Qualifications follow the same persistent InspectorHub sidebar pattern as Work History and Income.
  await navigation.getByRole("button", { name: "Qualifications & Documents" }).click();
  assert(page.url().endsWith("#qualifications"), "Qualifications sidebar must retain correct deep-link");
  const inlineDocuments=page.locator(".page.embedded");
  assert(await inlineDocuments.getByRole("heading", { name: "Qualification Documents" }).count()===1,
    "Full Qualifications workflow must render inside InspectorHub right pane");
  assert(await inlineDocuments.getByRole("heading", { name: "Add Qualification & Upload Documentation" }).count()===1,
    "Inline qualification evidence form is missing");
  assert(await inlineDocuments.getByRole("heading", { name: "Recommended Additional Qualifications" }).count()===1,
    "Inline demand-ranked qualification recommendations missing");
  assert(await inlineDocuments.locator("article.document").count()===3,"Three baseline fictional certificate documents expected");
  assert(await inlineDocuments.getByRole("link",{name:"Back to Inspector Demo"}).count()===0,
    "Embedded qualifications must omit the redundant standalone back link");
  await inlineDocuments.getByRole("button",{name:"View certificate"}).first().click();
  assert(await page.getByRole("dialog").count()===1,"Inline synthetic certificate preview must open");
  await page.getByRole("button",{name:"Close certificate preview"}).click();
  assert(await page.getByRole("dialog").count()===0,"Inline synthetic certificate preview must close");
  await navigation.getByRole("button", { name: "Work History" }).click();
  assert(await page.getByRole("heading", { name: "Work History" }).count() === 1, "Full Work History must render directly beside green sidebar");
  assert(new URL(page.url()).pathname === "/demo/inspector", "Work History must not redirect to standalone route");
  assert(await page.getByRole("link", { name: /Open Work History/ }).count() === 0, "Redundant Work History teaser should be removed");
  // Work History keyword search is a shared filter for completed assignments and reports.
  const historySearch=page.getByRole("searchbox",{name:"Search work history"});
  assert(await historySearch.count()===1,"Work History search control missing");
  await historySearch.fill("Seabrook");
  assert((await page.locator(".resultCount").innerText()).includes("1 of 10"),"Vendor keyword search should find one completed assignment");
  await page.getByRole("group",{name:"Work History views"}).getByRole("button",{name:"Reports Submitted"}).click();
  assert((await page.locator(".resultCount").innerText()).includes("1 of 10"),"Report view must retain keyword filter");
  await historySearch.fill("ir-260914");
  assert((await page.locator(".resultCount").innerText()).includes("1 of 10"),"Case-insensitive report ID keyword should find one submitted report");
  await page.getByRole("button",{name:"Reset filters"}).click();
  assert(await historySearch.inputValue()==="","Reset must clear Work History keyword");
  assert((await page.locator(".resultCount").innerText()).includes("10 of 10"),"Reset must restore all fictional reports");
  // Invalid Work History dates must not masquerade as a genuine empty result.
  const workFilters = page.getByRole("region", { name: "Work History filters" });
  await workFilters.locator(".filters select").first().selectOption("Bluewater LNG");
  await workFilters.getByLabel("Completed from",{exact:true}).fill("2026-10-20");
  await workFilters.getByLabel("Completed through",{exact:true}).fill("2026-08-01");
  assert(await page.getByRole("heading", { name: "Invalid completion date range" }).count() === 1,
    "Contradictory Work History dates must have an explicit recovery heading");
  for (const label of ["Completed from", "Completed through"]) {
    const control = workFilters.getByLabel(label,{exact:true});
    assert(await control.getAttribute("aria-invalid") === "true", "Reversed Work History dates must be marked invalid");
    const appearance = await control.evaluate(element => { const s = getComputedStyle(element); return {color:s.color,background:s.backgroundColor,border:s.borderTopColor}; });
    assert(appearance.color === "rgb(127, 29, 29)" && appearance.background === "rgb(255, 247, 247)" && appearance.border === "rgb(185, 28, 28)",
      "Invalid Work History date input must have visible high-contrast error styling: " + JSON.stringify({label,appearance}));
  }
  assert(!(await page.locator(".resultCount").innerText()).includes("Showing 0 of 10"),
    "Invalid range should not be presented as a genuine no-match result");
  await workFilters.getByRole("button", { name: "Clear invalid date range" }).click();
  assert(await workFilters.getByLabel("Completed from",{exact:true}).inputValue() === "" &&
    await workFilters.getByLabel("Completed through",{exact:true}).inputValue() === "",
    "Recovery must clear only the two invalid dates");
  assert(await workFilters.locator(".filters select").first().inputValue() === "Bluewater LNG",
    "Recovery must preserve independently selected client");
  assert((await page.locator(".resultCount").innerText()).includes("2 of 10"),
    "Recovery should restore two fictional Bluewater LNG records");
  await page.getByRole("group", { name: "Work History views" })
    .getByRole("button", { name: "Assignments Performed" }).click();
  assert((await page.locator(".resultCount").innerText()).includes("2 of 10"),
    "Recovery must remain correct after switching consolidated Work History views");

  await navigation.getByRole("button", { name: "Income & Tax Center" }).click();
  assert(await page.getByRole("heading", { name: "Income & Tax Center" }).count() === 1, "Income dashboard must be embedded");
  assert(new URL(page.url()).pathname === "/demo/inspector", "Income must stay in persistent InspectorHub shell");
  assert(await page.getByLabel("Tax and earnings year").inputValue() === "2026", "Embedded Income default must be 2026 YTD");
  assert(await page.getByText(/2026-11-01T23:59:59-06:00/).count() > 0, "Income data-through timestamp missing");
  assert(await page.getByRole("button", { name: "Download synthetic income report PDF" }).count() === 1, "Income PDF action missing");
  assert(await page.getByRole("link", { name: /Open Income & Tax Center demo/ }).count() === 0, "Income teaser still rendered");
  await page.goBack();
  assert(await page.getByRole("heading", { name: "Work History" }).count() === 1, "Browser back must restore Work History");
  await page.goForward();
  assert(await page.getByRole("heading", { name: "Income & Tax Center" }).count() === 1, "Browser forward must restore Income");
  assert(await navigation.getByRole("button", { name: "Income & Tax Center" }).getAttribute("aria-current") === "page", "Sidebar highlight not restored");
  assert(errors.length === 0, "Inspector Demo browser exceptions: " + errors.join("\n"));
  console.log("Inspector Demo Chromium OK: sidebar, opportunity alert isolation, Month/Week/List, private events, assignment, date conflicts and demo-only connectors.");
} catch (e) {
  failed = true; console.error(e instanceof Error ? e.stack : String(e)); console.error("Server log tail:", output.slice(-1600));
} finally {
  if (browser) await browser.close();
  if (server) { server.kill("SIGTERM"); await new Promise(r => setTimeout(r, 250)); if (!server.killed) server.kill("SIGKILL"); }
}
if (failed) process.exitCode = 1;
