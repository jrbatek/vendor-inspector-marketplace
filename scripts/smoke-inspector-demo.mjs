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

  await navigation.getByRole("button", { name: "Active Assignments" }).click();
  assert(await page.getByRole("button", { name: "Open assignment" }).count() === 3, "Three synthetic active assignments expected");
  for (const name of ["LNG Compressor Package", "Gulf Horizon Refinery Upgrade", "Orion Deepwater Platform"]) {
    await page.locator("article").filter({ hasText: name }).getByRole("button", { name: "Open assignment" }).click();
    const assignment = page.getByRole("region", { name: "Open assignment details" });
    assert(await assignment.count() === 1, "Assignment workspace missing for " + name);
    assert(await assignment.getByRole("heading", { name: "Milestones" }).count() === 1, "Milestones section missing for " + name);
    assert(await assignment.locator(".milestones li").count() === 4, "Expected four meaningful scenario milestones for " + name);
    assert(await assignment.locator(".documents li").count() === 3, "Expected three document statuses for " + name);
    assert((await assignment.innerText()).includes("example.invalid"), "Site contact must be clearly fictional for " + name);
    assert((await assignment.innerText()).includes("Outstanding items / next action"), "Outstanding action missing for " + name);
    const pdfLink=assignment.getByRole("link", { name: "Open synthetic report PDF" });
    const pdf=await page.request.get(base+(await pdfLink.getAttribute("href")));
    assert(pdf.ok() && (pdf.headers()["content-type"]||"").includes("application/pdf"),"Synthetic assignment PDF not working for "+name);
    await assignment.getByRole("button", { name: /Back to active assignments/ }).click();
  }
  // Sidebar navigation always returns to the list, not a previously opened detail.
  await page.locator("article").filter({ hasText: "LNG Compressor Package" })
    .getByRole("button", { name: "Open assignment" }).click();
  assert(await page.getByRole("region", { name: "Open assignment details" }).count() === 1,
    "Assignment must open before testing sidebar reset");
  await navigation.getByRole("button", { name: "Active Assignments" }).click();
  assert(await page.getByRole("region", { name: "Open assignment details" }).count() === 0 &&
    await page.getByRole("button", { name: "Open assignment" }).count() === 3,
    "Active Assignments sidebar should return to three-record list from detail");
  await page.locator("article").filter({ hasText: "Orion Deepwater Platform" })
    .getByRole("button", { name: "Open assignment" }).click();
  await navigation.getByRole("button", { name: "Profile Home" }).click();
  await navigation.getByRole("button", { name: "Active Assignments" }).click();
  assert(await page.getByRole("region", { name: "Open assignment details" }).count() === 0 &&
    await page.getByRole("button", { name: "Open assignment" }).count() === 3,
    "Leaving an assignment for another section must clear stale detail when returning");
  await navigation.getByRole("button", { name: "Opportunities" }).click();
  await page.getByRole("button", { name: "Preview Opportunity" }).first().click();
  const dialog = page.getByRole("dialog", { name: "Opportunity preview" });
  assert(await dialog.count() === 1, "Opportunity preview did not open");
  await dialog.getByRole("button", { name: "Decline" }).click();
  assert(await page.getByRole("status").filter({ hasText: "Opportunity declined" }).count() === 1, "Declined feedback missing in Opportunities");
  await navigation.getByRole("button", { name: "Availability & Calendar" }).click();
  assert(await page.getByText("Opportunity declined").count() === 0, "Opportunity feedback leaked across InspectorHub sections");
  const cal = page.getByRole("region", { name: "Inspector availability calendar" });
  assert(await cal.count() === 1, "Calendar missing");
  const tabs = cal.getByRole("group", { name: "Calendar view" });
  assert(await tabs.getByRole("button", { name: "Month" }).getAttribute("aria-pressed") === "true", "Month not the default calendar view");
  assert(await cal.getByText(/Our Anniversary · All day/).count() >= 1, "Private synthetic anniversary missing");
  assert(await cal.getByText(/Doctor Appointment · 10:00/).count() >= 1, "Private synthetic doctor appointment missing");
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
  // Arbitrary month jumps synchronize Month, Week and availability inputs without writing events.
  await cal.getByLabel("Jump to month").fill("2027-02");
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
  await tabs.getByRole("button",{name:"Month"}).click();
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
  assert(await page.getByText(/Opportunity declined/).count() === 0, "Stale opportunity alert appeared on assignment");
  await navigation.getByRole("button", { name: "Availability & Calendar" }).click();
  const calendar = page.getByRole("region", { name: "Inspector availability calendar" });
  // Selecting a date should prefill the Block Dates form without actually changing
  // the private inspector's synthetic availability until explicitly submitted.
  const datePicker = calendar.getByRole("button", { name: "Choose 2026-11-19 for availability" });
  await datePicker.click();
  assert(await datePicker.getAttribute("aria-pressed") === "true", "Selected calendar date is not visibly marked");
  // A date range must visibly select every day, without making unmarked days Available.
  await calendar.getByLabel("Start date").fill("2026-11-28");
  await calendar.getByLabel("End date").fill("2026-11-30");
  for (const date of ["2026-11-28", "2026-11-29", "2026-11-30"]) {
    assert(await calendar.getByRole("button", { name: `Choose ${date} for availability` }).getAttribute("aria-pressed") === "true",
      "Date in selected range must be visibly pressed: " + date);
  }
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
  await calendar.getByRole("button", { name: "Block dates / Update availability" }).click();
  const conflictAlert=calendar.getByRole("alert").filter({hasText:"overlaps a linked personal Busy event"});
  assert(await conflictAlert.count()===1,"Private event conflict should be announced as a warning");
  const conflictColors=await conflictAlert.evaluate(el=>({color:getComputedStyle(el).color,background:getComputedStyle(el).backgroundColor}));
  assert(conflictColors.color==="rgb(127, 29, 29)"&&conflictColors.background==="rgb(255, 247, 247)",
    "Calendar private-event conflict must be visibly distinct from green success: "+JSON.stringify(conflictColors));
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
  assert(await calendar.getByText(/overlaps a linked personal Busy event/).count() === 1, "Private calendar conflict not protected");
  // A warning only applies to the original date range; navigating to a new month
  // or week must not leave the inspector thinking the new range is invalid.
  await calendar.getByRole("button", { name: "Next month" }).click();
  assert(await calendar.getByText(/overlaps a linked personal Busy event/).count() === 0,
    "Stale calendar conflict warning persisted after month navigation");
  await calendar.getByRole("button", { name: "Return to demo today, November 9 2026" }).click();
  await calendar.getByLabel("Start date").fill("2026-11-29");
  await calendar.getByLabel("End date").fill("2026-11-29");
  await calendar.getByRole("button", { name: "Block dates / Update availability" }).click();
  assert(await calendar.getByText("1 dates updated in this synthetic session only.").count() === 1, "Non-conflicting synthetic date update failed");
  const manuallyBlocked = calendar.getByRole("button", { name: "Choose 2026-11-29 for availability" }).locator("xpath=..");
  assert((await manuallyBlocked.innerText()).includes("Unavailable"),"Demo block did not display an Unavailable calendar event");
  await calendar.getByRole("button", { name: "Clear inspector-added demo dates" }).click();
  assert(await calendar.getByText(/1 inspector-added demo date cleared/).count() === 1,"Manual clearing did not confirm one removed synthetic date");
  assert((await manuallyBlocked.innerText()).includes("Not set"),"Cleared inspector-added date did not return to Not set");
  assert(await calendar.getByText(/Our Anniversary · All day/).count() > 0,"Clearing removed a private calendar fixture");
  await calendar.getByLabel("Start date").fill("2026-11-18");
  await calendar.getByLabel("End date").fill("2026-11-18");
  await calendar.getByRole("button", { name: "Clear inspector-added demo dates" }).click();
  assert(await calendar.getByText(/Private events cannot be cleared/).count() === 1,"Clearing must not override imported personal Busy events");
  await calendar.getByRole("button", { name: "Connect Outlook Calendar" }).click();
  assert(await calendar.getByText(/demo|simulat/i).count() > 0, "Calendar connection is not clearly labeled simulated");
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
  await workFilters.getByLabel("Completed from").fill("2026-10-20");
  await workFilters.getByLabel("Completed through").fill("2026-08-01");
  assert(await page.getByRole("heading", { name: "Invalid completion date range" }).count() === 1,
    "Contradictory Work History dates must have an explicit recovery heading");
  for (const label of ["Completed from", "Completed through"]) {
    const control = workFilters.getByLabel(label);
    assert(await control.getAttribute("aria-invalid") === "true", "Reversed Work History dates must be marked invalid");
    const appearance = await control.evaluate(element => { const s = getComputedStyle(element); return {color:s.color,background:s.backgroundColor,border:s.borderTopColor}; });
    assert(appearance.color === "rgb(127, 29, 29)" && appearance.background === "rgb(255, 247, 247)" && appearance.border === "rgb(185, 28, 28)",
      "Invalid Work History date input must have visible high-contrast error styling: " + JSON.stringify({label,appearance}));
  }
  assert(!(await page.locator(".resultCount").innerText()).includes("Showing 0 of 10"),
    "Invalid range should not be presented as a genuine no-match result");
  await workFilters.getByRole("button", { name: "Clear invalid date range" }).click();
  assert(await workFilters.getByLabel("Completed from").inputValue() === "" &&
    await workFilters.getByLabel("Completed through").inputValue() === "",
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
