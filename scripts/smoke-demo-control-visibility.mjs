import { spawn } from "node:child_process";
import { chromium } from "playwright";

// Public demo controls only. No credentials, production writes, or private workspace routes.
const port = 3105;
const base = process.env.DEMO_CONTROLS_BASE_URL || "http://127.0.0.1:" + port;
const server = process.env.DEMO_CONTROLS_BASE_URL ? null : spawn(process.execPath, [
  "node_modules/next/dist/bin/next", "start", "-p", String(port)
], { env: {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ci-placeholder.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "ci-placeholder-anon-key"
}, stdio: ["ignore", "pipe", "pipe"] });
let log = "", browser, failed = false;
server?.stdout.on("data", x => log += String(x));
server?.stderr.on("data", x => log += String(x));
const routes = [
  "/", "/demo/client", "/demo/client-agency-sourcing", "/demo/client-inspections",
  "/demo/client-analytics", "/demo/inspector",
  "/demo/inspector-documents", "/demo/inspector-work-history", "/demo/inspector-income",
  "/demo/agency", "/demo/agency-opportunities", "/demo/agency-resources", "/demo/agency-affiliations", "/demo/agency-commercials",
  "/demo/client-data", "/demo/client-operations", "/demo/inspector-selection-outcomes",
  "/demo/inspector-affiliations", "/demo/inspector-reports", "/demo/email-requirements",
  "/email-requirements?demo=1", "/email-requirements"
];
async function ready() {
  for (let n = 0; n < 40; n++) {
    try { if ((await fetch(base + "/demo/client")).ok) return; } catch {}
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error("Demo control smoke server not ready: " + log.slice(-1500));
}
try {
  if (server) await ready();
  browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on("pageerror", e => errors.push(e.stack || String(e)));
    for (const route of routes) {
      await page.goto(base + route, { waitUntil: "domcontentloaded" });
      if (route === "/demo/agency-affiliations") {
        await page.getByRole("group", { name: "Affiliation status filters" }).waitFor({ state: "visible", timeout: 15000 });
      }
      await page.waitForTimeout(160);
      if (page.url().includes("/login")) throw new Error(route + " redirected demo reviewer to Login");
      // P0-A: public demo content must not send reviewers into authenticated
      // workspaces. Global site-header Login links are intentional; inspect
      // only actionable links and forms within the demo main element.
      if (route.startsWith("/demo/")) {
        const liveExits = await page.evaluate(() => {
          const protectedDemoRoutes = ["/login", "/register", "/client-dashboard",
            "/client-workspace", "/inspector-dashboard", "/inspectorhub",
            "/agency-dashboard", "/agency-workspace"];
          return [...document.querySelectorAll("main a[href], main form[action]")].flatMap(element => {
            const raw = element.getAttribute(element.tagName === "FORM" ? "action" : "href");
            if (!raw) return [];
            let url;
            try { url = new URL(raw, location.href); } catch { return []; }
            if (url.origin !== location.origin ||
                !protectedDemoRoutes.some(path => url.pathname === path || url.pathname.startsWith(path + "/")))
              return [];
            return [{ label: (element.textContent || element.getAttribute("aria-label") || "").trim().slice(0, 70), path: url.pathname }];
          });
        });
        if (liveExits.length) throw new Error(route + " contains demo-to-live workspace exits: " + JSON.stringify(liveExits));
        if (await page.getByText(/Log in to view the client workspace|Log in to view the inspector workspace/i).count())
          throw new Error(route + " rendered an authenticated workspace placeholder instead of synthetic demo content");
      }
      // P0-A: real rendered *global* menu routes must remain inside synthetic
      // workspaces for each audience when entered from a public demo. The
      // persistent site-header Login control is intentionally outside these menus.
      if (["/demo/client", "/demo/inspector", "/demo/agency"].includes(route)) {
        const primaryNav = page.locator('header nav[aria-label="Main navigation"]');
        for (const audience of ["Clients", "Inspectors", "Agencies"]) {
          await primaryNav.getByRole("button", { name: new RegExp("^" + audience) }).click();
          const menu = page.locator("#nav-" + audience.toLowerCase() + "-menu");
          await menu.waitFor({ state: "visible", timeout: 5000 });
          const destinations = await menu.locator("a[href]").evaluateAll(nodes =>
            nodes.map(node => ({ label: (node.textContent || "").trim(), path: new URL(node.href).pathname })));
          if (destinations.length < 2 || destinations.some(item => !item.path.startsWith("/demo/"))) {
            throw new Error(width + "px " + route + " " + audience +
              " menu escaped the synthetic experience: " + JSON.stringify(destinations));
          }
          await page.keyboard.press("Escape");
          await menu.waitFor({ state: "hidden", timeout: 5000 });
        }
      }
      const result = await page.evaluate(() => {
        const rgb = s => {
          const m = s.match(/[\d.]+/g);
          return m && m.length >= 3 ? [+m[0], +m[1], +m[2], m.length > 3 ? +m[3] : 1] : null;
        };
        const luminance = c => c.slice(0, 3).map(v => {
          const n = v / 255;
          return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
        }).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
        const background = el => {
          for (let node = el; node; node = node.parentElement) {
            const color = rgb(getComputedStyle(node).backgroundColor);
            if (color && color[3] >= 0.95) return color;
          }
          return [255, 255, 255, 1];
        };
        // Native details/summary toggles are interactive controls too: audit visible
        // disclosure labels alongside buttons/links so collapsed reports and
        // diagnostics cannot silently become white-on-white or unnamed.
        const bad = [];
        let checked = 0;
        for (const el of document.querySelectorAll("button, a[href], select, textarea, input:not([type=hidden]), summary, [role=button]")) {
          const s = getComputedStyle(el), rect = el.getBoundingClientRect();
          if (rect.width < 5 || rect.height < 5 || s.display === "none" || s.visibility === "hidden") continue;
          const name = (el.getAttribute("aria-label") || el.getAttribute("title") ||
            [...(el.labels || [])].map(l => l.textContent).join(" ") || el.textContent ||
            el.querySelector("img")?.alt || "").trim();
          const fg = rgb(s.color);
          if (!fg) continue;
          const bg = background(el);
          const contrast = (Math.max(luminance(fg), luminance(bg)) + 0.05) /
            (Math.min(luminance(fg), luminance(bg)) + 0.05);
          const disabled = el.matches(":disabled, [aria-disabled=true]");
          checked++;
          if (!name || Number(s.opacity) < 0.25 || contrast < (disabled ? 2 : 3)) {
            bad.push({ element: el.tagName, name: name.slice(0, 45), contrast: +contrast.toFixed(2), disabled });
          }
        }
        return { checked, bad };
      });
      if (errors.length || result.bad.length) {
        throw new Error(width + "px " + route + " browser/legibility regressions: " +
          JSON.stringify({ errors: errors.slice(0, 2), controls: result.bad.slice(0, 10) }));
      }
      if (result.checked < 3) throw new Error(width + "px " + route + " returned an empty/unauthenticated shell");
      if (route === "/") {
        // Public homepage audience actions need touch-size parity with the demo
        // workspaces, including small plain-text and nested synthetic demo links.
        const smallLinks = await page.locator("main .audienceCard a[href]").evaluateAll(links =>
          links.flatMap(link => {
            const rect = link.getBoundingClientRect();
            return rect.width >= 44 && rect.height >= 44 ? [] : [{
              text: (link.textContent || "").trim(), width: Math.round(rect.width),
              height: Math.round(rect.height)
            }];
          }));
        if (smallLinks.length) throw new Error(width + "px homepage audience link touch targets: " + JSON.stringify(smallLinks));
      }
      if (route === "/demo/inspector-affiliations") {
        // Pending claim actions must target an explicitly selected fictional agency.
        // No action is allowed to imply that an unselected or live claim was modified.
        await page.getByRole("button", { name: "Pending / Disputed" }).click();
        const confirm = page.getByRole("button", { name: "Confirm selected claim" });
        if (await confirm.isEnabled()) throw new Error("Unselected affiliation claim action must be disabled");
        await page.getByRole("button", { name: "Select this claim" }).first().click();
        if (!(await confirm.isEnabled())) throw new Error("Selected fictional claim action stayed disabled");
        await confirm.click();
        await page.getByRole("status").getByText(/Confirmation previewed for Atlas Technical Inspection/).waitFor();
        await page.getByRole("button", { name: "Historical", exact: true }).click();
        if (await page.getByText(/Confirmation previewed for Atlas Technical Inspection/).count())
          throw new Error("Pending affiliation action banner leaked into history");
        await page.getByRole("button", { name: "Pending / Disputed" }).click();
        if (await confirm.isEnabled()) throw new Error("Changing tabs failed to clear selected claim");
        // Restore the default current-relationship view for the existing lifecycle and status-chip browser audits below.
        await page.getByRole("button", { name: "Current / Verified" }).click();
      }

      if (route === "/demo/client-analytics") {
        // P0-B: exercise selected, unselected, hover, keyboard-focus and disabled
        // source controls in real desktop/mobile Chromium, not just static colors.
        // This also protects the Independent-source route implicated in issue #154.
        const quick = page.getByRole("group", { name: "Quick source type filters" });
        const all = quick.getByRole("button", { name: "All sources", exact: true });
        const agency = quick.getByRole("button", { name: "Agency", exact: true });
        const independent = quick.getByRole("button", { name: "Independent", exact: true });
        await page.waitForFunction(() => {
          const buttons = document.querySelectorAll(".quickSources button");
          return buttons.length === 3 && [...buttons].every(button => !button.disabled);
        }, null, { timeout: 15000 });
        const appearance = async control => control.evaluate(node => {
          const style = getComputedStyle(node);
          const rgb = color => (color.match(/[\d.]+/g) || []).slice(0,3).map(Number);
          const luminance = color => rgb(color).map(value => {
            const x = value / 255;
            return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
          }).reduce((sum, value, index) => sum + value * [0.2126,0.7152,0.0722][index], 0);
          const foreground = luminance(style.color);
          const background = luminance(style.backgroundColor);
          return { color: style.color, background: style.backgroundColor,
            opacity: Number(style.opacity), outline: parseFloat(style.outlineWidth),
            contrast: (Math.max(foreground, background) + 0.05) /
              (Math.min(foreground, background) + 0.05) };
        });
        const check = (style, label, background, foreground) => {
          if (style.background !== background || style.color !== foreground ||
              style.contrast < 4.5 || style.opacity !== 1)
            throw new Error(width + "px Analytics " + label +
              " unreadable: " + JSON.stringify(style));
        };
        if (await all.getAttribute("aria-pressed") !== "true")
          throw new Error("Analytics All sources must start selected");
        check(await appearance(all), "selected All", "rgb(15, 118, 110)", "rgb(255, 255, 255)");
        check(await appearance(agency), "unselected Agency", "rgb(255, 255, 255)", "rgb(17, 94, 89)");
        await independent.hover();
        check(await appearance(independent), "hovered Independent", "rgb(204, 251, 241)", "rgb(17, 94, 89)");
        await independent.click();
        await page.waitForFunction(() => document.querySelector(".quickSources button[aria-pressed=true]")?.textContent?.trim() === "Independent");
        check(await appearance(independent), "selected Independent", "rgb(15, 118, 110)", "rgb(255, 255, 255)");
        // A real keyboard event before focusing ensures :focus-visible is evaluated
        // under keyboard modality (rather than programmatic pointer focus).
        await page.keyboard.press("Tab");
        await agency.focus();
        const focused = await appearance(agency);
        if (focused.outline < 2 || focused.contrast < 4.5)
          throw new Error(width + "px Analytics keyboard-focus unreadable: " + JSON.stringify(focused));
        await page.keyboard.press("Enter");
        await page.waitForFunction(() => document.querySelector(".quickSources button[aria-pressed=true]")?.textContent?.trim() === "Agency");
        check(await appearance(agency), "keyboard-selected Agency", "rgb(15, 118, 110)", "rgb(255, 255, 255)");
        await agency.evaluate(node => { node.disabled = true; });
        const disabled = await appearance(agency);
        if (disabled.background !== "rgb(248, 250, 252)" ||
            disabled.color !== "rgb(51, 65, 85)" ||
            disabled.contrast < 4.5 || disabled.opacity !== 1)
          throw new Error(width + "px Analytics disabled source control unreadable: " + JSON.stringify(disabled));
        await agency.evaluate(node => { node.disabled = false; });
        await all.click();
        if (await all.getAttribute("aria-pressed") !== "true" || errors.length)
          throw new Error("Analytics source state controls failed to restore All or raised an exception");
      }
      if (route === "/demo/client") {
        // Owner-reported Preview request regression: verify both independent
        // client intake flows render fictional candidate CV cards, not a blank
        // preview, in a real desktop/mobile browser. No live matching is called.
        const natural = page.locator("#natural-language");
        const naturalCards = natural.locator("article.candidate");
        if (await naturalCards.count()) throw new Error("Natural-language demo candidates appeared before Preview request");
        await natural.getByRole("button", { name: "Preview request (demo)" }).click();
        await naturalCards.first().waitFor({ state: "visible", timeout: 15000 });
        const names = await naturalCards.locator("h4").allTextContents();
        if (names.join("|") !== "Avery Calder|Maya Ellison")
          throw new Error("Natural-language Preview request did not show two fictional candidate CVs: " + names.join(", "));
        const first = naturalCards.first();
        await first.locator("summary").click();
        if (!(await first.locator("details").evaluate(node => node.open)) ||
            !(await first.locator(".cv").innerText()).includes("Assignment history"))
          throw new Error("View CV did not expand fictional candidate work history");
        if (width === 1440) {
          const download = page.waitForEvent("download", { timeout: 20000 });
          await first.getByRole("button", { name: "Download CV (PDF)" }).click();
          const file = await download;
          if (file.suggestedFilename() !== "InspectSource-Avery-Calder-IS-1042-demo-CV.pdf")
            throw new Error("Preview CV download filename did not identify the fictional candidate");
          const { readFile } = await import("node:fs/promises");
          const bytes = await readFile(await file.path());
          if (bytes.subarray(0, 5).toString("ascii") !== "%PDF-")
            throw new Error("Preview CV download did not contain PDF bytes");
        }
        const structured = page.locator("#structured-selection");
        const structuredCards = structured.locator("article.candidate");
        if (await structuredCards.count()) throw new Error("Structured candidates appeared before preview");
        await structured.getByRole("button", { name: "Preview selected criteria" }).click();
        await structuredCards.first().waitFor({ state: "visible", timeout: 15000 });
        const structuredNames = await structuredCards.locator("h4").allTextContents();
        if (structuredNames.join("|") !== "Avery Calder|Maya Ellison")
          throw new Error("Structured Preview request did not show the expected fictional candidate CVs: " + structuredNames.join(", "));
        if (await page.getByText(/Log in to view the client workspace/i).count())
          throw new Error("Client preview entered a live login-required workspace");
        if (errors.length) throw new Error("Client candidate preview browser exception: " + errors.join("\\n"));
      }
      if (route === "/demo/client") {
        // P0-B: measure the real Client intake controls across all interaction states.
        const scope = page.getByRole("textbox", { name: "Inspection requirement" });
        const qualification = page.getByLabel("Required certification");
        const appearance = async control => control.evaluate(node => {
          const s = getComputedStyle(node);
          return { color: s.color, background: s.backgroundColor, border: s.borderTopColor,
            outlineWidth: s.outlineWidth, opacity: s.opacity };
        });
        for (const [control, label] of [[scope, "Natural Language textarea"], [qualification, "Structured qualification selector"]]) {
          await control.hover();
          let style = await appearance(control);
          if (style.background !== "rgb(255, 255, 255)" || style.color !== "rgb(15, 23, 42)" ||
              style.border !== "rgb(15, 118, 110)")
            throw new Error(width + "px Client " + label + " hover is illegible: " + JSON.stringify(style));
          await control.focus();
          style = await appearance(control);
          if (Number.parseFloat(style.outlineWidth) < 2 || style.color !== "rgb(15, 23, 42)")
            throw new Error(width + "px Client " + label + " keyboard focus is illegible: " + JSON.stringify(style));
          await control.evaluate(node => { node.disabled = true; });
          style = await appearance(control);
          if (style.background !== "rgb(241, 245, 249)" || style.color !== "rgb(51, 65, 85)" ||
              style.border !== "rgb(148, 163, 184)" || Number(style.opacity) !== 1)
            throw new Error(width + "px Client " + label + " disabled is illegible: " + JSON.stringify(style));
          await control.evaluate(node => { node.disabled = false; });
        }
      }
      if (route === "/demo/agency-affiliations") {
        await page.getByRole("group", { name: "Affiliation status filters" })
          .getByRole("button", { name: "Expiring", exact: true }).click();
        const rows = page.locator(".table tbody tr");
        if (await rows.count() !== 1 || !(await rows.first().innerText()).includes("Dec 15, 2026"))
          throw new Error("Agency affiliation Expiring filter shows stale or incorrect demo agreement dates");
        const chip = rows.first().locator('[data-state="Expiring"]');
        const colors = await chip.evaluate(el => ({
          background: getComputedStyle(el).backgroundColor,
          color: getComputedStyle(el).color
        }));
        if (colors.background !== "rgb(255, 237, 213)" || colors.color !== "rgb(154, 52, 18)")
          throw new Error("Agency Expiring affiliation chip has illegible colors: " + JSON.stringify(colors));
        await page.getByRole("group", { name: "Affiliation status filters" })
          .getByRole("button", { name: "Ended", exact: true }).click();
        if (await rows.count() !== 1 || !(await rows.first().innerText()).includes("Elena Rossi"))
          throw new Error("Agency ended affiliation filter lost synthetic history");
      }
      if (route === "/demo/inspector-affiliations") {
        const rows = page.locator(".cards article");
        const meridian = rows.filter({ hasText: "Meridian Quality Services" });
        if (await meridian.count() !== 1 || !(await meridian.innerText()).includes("Nov 30, 2026"))
          throw new Error("Inspector Expiring affiliation has an already-expired agreement date");
        const colors = await meridian.locator('[data-state="Expiring"]').evaluate(el => ({
          background: getComputedStyle(el).backgroundColor,
          color: getComputedStyle(el).color
        }));
        if (colors.background !== "rgb(255, 237, 213)" || colors.color !== "rgb(154, 52, 18)")
          throw new Error("Inspector Expiring affiliation chip has illegible colors: " + JSON.stringify(colors));
        await page.getByRole("button", { name: "Historical" }).click();
        const history = page.locator(".cards article");
        if (await history.count() !== 1 || !(await history.first().innerText()).includes("Summit Vendor Assurance"))
          throw new Error("Inspector Historical tab lost ended affiliation example");
        if (await history.locator('[data-state="Expired / Ended"]').count() !== 1)
          throw new Error("Inspector Historical status chip did not preserve expired lifecycle state");
      }
      if (route === "/demo/client-data") {
        // P0-B: every interactive data/export control remains usable and legible on
        // both desktop and narrow mobile, including the copy-endpoint action.
        const controls = await page.locator(".exportActions button, .integrationGrid button, .exportFilterTools select, .exportFilterTools button")
          .evaluateAll(nodes => nodes.map(node => ({name: (node.textContent || node.getAttribute("aria-label") || "").trim().slice(0, 45),
            height: node.getBoundingClientRect().height})));
        if (controls.length < 5 || controls.some(item => item.height < 43.5))
          throw new Error("Client Data & Integrations demo control below 44px: " + JSON.stringify(controls));
        const exportStatus = page.getByRole("combobox", { name: "Export status" });
        const records = page.locator(".dataPanel tbody tr");
        if (await records.count() !== 5) throw new Error("Client data preview must start with five synthetic inspections");
        await exportStatus.selectOption("Completed");
        if (await records.count() !== 1 || !(await records.first().innerText()).includes("IS-10428"))
          throw new Error("Client data export status did not isolate the completed synthetic inspection");
        const downloadEvent = page.waitForEvent("download");
        await page.getByRole("button", { name: "Download synthetic JSON" }).click();
        const sample = await downloadEvent;
        if (sample.suggestedFilename() !== "inspectsource-client-demo-data.json")
          throw new Error("Filtered client data JSON download filename incorrect");
        const { readFile } = await import("node:fs/promises");
        const body = JSON.parse(await readFile(await sample.path(), "utf8"));
        if (body.count !== 1 || body.inspections?.[0]?.inspection !== "IS-10428" || body.liveIntegration !== false)
          throw new Error("Filtered client data JSON exported wrong cohort or lost demo isolation");
        const csvEvent = page.waitForEvent("download", { timeout: 15000 });
        await page.getByRole("button", { name: "Download synthetic client data (.CSV)" }).click();
        const csvFile = await csvEvent;
        const csvLines = (await readFile(await csvFile.path(), "utf8")).split(/\r?\n/);
        if (csvFile.suggestedFilename() !== "inspectsource-client-demo-data.csv" ||
            csvLines.length !== 2 || !csvLines[1].startsWith('"IS-10428",') ||
            !csvLines[1].includes('"Completed"'))
          throw new Error("Filtered client CSV did not contain the single selected fictional record");
        const reset = page.getByRole("button", { name: "Reset export filter" });
        await reset.focus();
        await reset.press("Enter");
        if (!await exportStatus.evaluate(el => document.activeElement === el) || !await reset.isDisabled())
          throw new Error("Client export reset must restore keyboard focus before disabling");
        if (await records.count() !== 5) throw new Error("Client export reset must restore all five rows");
        if (errors.length) throw new Error("Client data filter caused browser exception: " + errors.join("\\n"));
      }
      if (route === "/demo/inspector") {
        // P0-B: real computed InspectorHub sidebar links must remain readable
        // text on green, not black/navy rounded button pills.
        const nav = page.getByRole("navigation", { name: "Inspector Workspace navigation" });
        const buttons = nav.getByRole("button");
        if (await buttons.count() !== 8)
          throw new Error("InspectorHub must retain eight accessible sidebar text links");
        const appearance = async button => button.evaluate(element => {
          const style = getComputedStyle(element);
          const rgb = color => (color.match(/\d+(?:\.\d+)?/g) || []).slice(0,3).map(Number);
          const luminance = color => rgb(color).map(value => {
            const x = value / 255;
            return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
          }).reduce((sum, value, index) => sum + value * [0.2126,0.7152,0.0722][index], 0);
          const sidebar = element.closest("aside.side");
          const background = sidebar ? getComputedStyle(sidebar).backgroundColor : "rgb(255, 255, 255)";
          const textLuminance = luminance(style.color);
          const backgroundLuminance = luminance(background);
          const contrast = (Math.max(textLuminance, backgroundLuminance) + 0.05) /
            (Math.min(textLuminance, backgroundLuminance) + 0.05);
          return { background: style.backgroundColor, radius: style.borderTopLeftRadius,
            color: style.color, shadow: style.boxShadow, contrast };
        });
        const assertTextLink = (style, context) => {
          if (!["rgba(0, 0, 0, 0)", "transparent"].includes(style.background) ||
              style.radius !== "0px" || style.shadow !== "none" ||
              !["rgb(236, 253, 245)", "rgb(153, 246, 228)", "rgb(255, 255, 255)"].includes(style.color) ||
              !Number.isFinite(style.contrast) || style.contrast < 4.5)
            throw new Error(context + " resurrected an unreadable InspectorHub button pill: " + JSON.stringify(style));
        };
        for (const item of await buttons.all())
          assertTextLink(await appearance(item), "Default InspectorHub sidebar link");
        const workLink = nav.getByRole("button", { name: "Work History" });
        await workLink.click();
        await page.waitForFunction(() => {
          const nav = document.querySelector('nav[aria-label="Inspector Workspace navigation"]');
          return Array.from(nav?.querySelectorAll("button") || []).some(button =>
            button.textContent?.trim() === "Work History" && button.getAttribute("aria-current") === "page");
        }, null, { timeout: 5000 }).catch(() => { throw new Error("InspectorHub active sidebar highlight is missing after scroll settles"); });
        assertTextLink(await appearance(workLink), "Active InspectorHub sidebar link");
        await workLink.hover();
        assertTextLink(await appearance(workLink), "Hovered InspectorHub sidebar link");
        const incomeLink = nav.getByRole("button", { name: "Income & Tax Center" });
        await incomeLink.focus();
        assertTextLink(await appearance(incomeLink), "Focused InspectorHub sidebar link");
        if (await page.getByRole("heading", { name: "Work History" }).count() !== 1)
          throw new Error("InspectorHub sidebar click failed to show embedded Work History");
      }
      if (route === "/demo/inspector") {
        const assignments = page.locator("#assignments");
        const trigger = assignments.getByRole("button", {name:"Open assignment",exact:true}).first();
        await trigger.focus();
        await trigger.press("Enter");
        const details = assignments.getByRole("region",{name:"Open assignment details"});
        const title = details.getByRole("heading",{name:"LNG Compressor Package",exact:true});
        await title.waitFor({state:"visible"});
        if (!(await title.evaluate(el=>document.activeElement===el)))
          throw new Error(width+"px Assignment opening lost keyboard focus instead of moving it to the detail heading");
        const close = details.getByRole("button",{name:"Back to active assignments"});
        await close.focus();
        await close.press("Enter");
        await trigger.waitFor({state:"visible"});
        if (!(await trigger.evaluate(el=>document.activeElement===el)))
          throw new Error(width+"px Assignment closing failed to restore focus to the originating assignment card");
      }
      if (route === "/demo/inspector") {
        // P0-B: the Month date selectors must stay readable in all real
        // interactive states, including synthetic disabled/loading presentation.
        // Week and List share the explicit disabled-state CSS contract.
        const monthGrid = page.locator(".calendarShell .month");
        await monthGrid.waitFor({state:"visible",timeout:15000});
        // P0-B: navigation, date fields and Block Dates actions are touch-accessible.
        const calendarControlSizes = await page.locator(".calendarShell .viewTabs button, .calendarShell .monthControls button, .calendarShell .monthJump input, .calendarShell .availabilityActions button, .calendarShell .availabilityActions input, .calendarShell .availabilityActions select").evaluateAll(nodes => ({
          count: nodes.length,
          undersized: nodes.filter(node => node.getBoundingClientRect().height < 44)
            .map(node => ((node.textContent || node.getAttribute("aria-label") || node.getAttribute("type") || node.tagName).trim()).slice(0,70))
        }));
        if(calendarControlSizes.count < 12 || calendarControlSizes.undersized.length)
          throw new Error(width+"px Inspector Calendar navigation/date/block controls smaller than 44px: "+JSON.stringify(calendarControlSizes));
        const unselectedDate = monthGrid.locator('[data-calendar-date="2026-11-01"]');
        const selectedDate = monthGrid.locator('[data-calendar-date="2026-11-22"]');
        const styleOf = async control => control.evaluate(element => {
          const s = getComputedStyle(element);
          return {color:s.color,background:s.backgroundColor,border:s.borderTopColor,
            opacity:Number(s.opacity),outline:Number.parseFloat(s.outlineWidth)};
        });
        if (await unselectedDate.getAttribute("aria-pressed") !== "false" ||
            await selectedDate.getAttribute("aria-pressed") !== "true")
          throw new Error(width+"px Calendar dates lost initial unselected/selected state");
        const plain = await styleOf(unselectedDate), selected = await styleOf(selectedDate);
        if(plain.background!=="rgb(255, 255, 255)" || plain.color!=="rgb(17, 94, 89)" ||
           selected.background!=="rgb(15, 118, 110)" || selected.color!=="rgb(255, 255, 255)")
          throw new Error(width+"px Calendar selected/unselected date unreadable: "+JSON.stringify({plain,selected}));
        await unselectedDate.hover();
        const hovered=await styleOf(unselectedDate);
        if(hovered.background!=="rgb(204, 251, 241)" || hovered.color!=="rgb(17, 94, 89)")
          throw new Error(width+"px Calendar hovered date unreadable: "+JSON.stringify(hovered));
        await page.keyboard.press("Tab");
        await unselectedDate.focus();
        const focused=await styleOf(unselectedDate);
        if(focused.outline<2)throw new Error(width+"px Calendar keyboard date has no visible focus outline");
        await unselectedDate.evaluate(element => {element.disabled=true;});
        const disabled=await styleOf(unselectedDate);
        if(disabled.background!=="rgb(241, 245, 249)" || disabled.color!=="rgb(51, 65, 85)" ||
           disabled.border!=="rgb(148, 163, 184)" || disabled.opacity!==1)
          throw new Error(width+"px Calendar disabled date unreadable: "+JSON.stringify(disabled));
        await unselectedDate.evaluate(element => {element.disabled=false;});
      }
      if (route === "/demo/client-operations") {
        const invoiceFilter = page.getByLabel("Invoice status");
        await invoiceFilter.selectOption("Paid");
        if (await page.locator("article.invoice").count() !== 2)
          throw new Error("Paid invoice filter must show two synthetic records");
        await invoiceFilter.selectOption("Awaiting approval");
        if (await page.locator("article.invoice").count() !== 1)
          throw new Error("Awaiting approval filter must show one synthetic invoice");
        await page.getByRole("button", { name: "Clear invoice filter" }).click();
        if (await page.locator("article.invoice").count() !== 4)
          throw new Error("Clearing invoice filter must restore all four synthetic invoices");
        // The legacy standalone Client operations page still works as a direct link,
        // but its sidebar returns the reviewer to embedded sections on the single-page hub.
        const legacySidebar = page.getByRole("complementary", { name: "Client Workspace navigation" });
        await legacySidebar.getByRole("link", { name: "Contracts", exact: true }).click();
        await page.waitForFunction(() => location.pathname === "/demo/client" && location.hash === "#contracts", null, {timeout:20000});
        await page.getByRole("region", { name: "Contracts" }).waitFor();
        const continuousNav = page.getByRole("navigation", { name: "Client Workspace sections" });
        await page.waitForFunction(() => document.querySelector('nav[aria-label="Client Workspace sections"] a[aria-current="location"]')?.textContent?.trim() === "Contracts");
        const contractTabs = page.getByRole("tablist", { name: "Contract relationship types" });
        await contractTabs.getByRole("tab", { name: "InspectSource" }).focus();
        await page.keyboard.press("End");
        if (await contractTabs.getByRole("tab", { name: "Others" }).getAttribute("aria-selected") !== "true")
          throw new Error("Embedded Contracts tabs End did not activate Others");
        await page.keyboard.press("Home");
        if (await contractTabs.getByRole("tab", { name: "InspectSource" }).getAttribute("aria-selected") !== "true")
          throw new Error("Embedded Contracts tabs Home did not restore InspectSource");
        await contractTabs.getByRole("tab", { name: "Individual Inspectors" }).click();
        const expired = page.locator(".contractWrap").first();
        if (!(await expired.innerText()).includes("Expired") || !(await expired.innerText()).includes("Sep 30, 2026"))
          throw new Error("Expired inspector contract fixture lost its closeout status");
        const expiredColor = await expired.locator(".status").evaluate(el => ({
          background: getComputedStyle(el).backgroundColor, color: getComputedStyle(el).color
        }));
        if (expiredColor.background !== "rgb(255, 247, 237)" || expiredColor.color !== "rgb(154, 52, 18)")
          throw new Error("Expired inspector contract status is not visibly legible: " + JSON.stringify(expiredColor));
        // Mobile Client Workspace sections deliberately start collapsed and close
        // again after each navigation. Expand explicitly before both clicks.
        const openContinuousSections = async () => {
          if (width > 600) return;
          const toggle = page.getByRole("button", { name: "Show sections" });
          await toggle.click();
          if (await page.getByRole("button", { name: "Hide sections" }).getAttribute("aria-expanded") !== "true")
            throw new Error("Mobile Client Workspace sections failed to expand");
        };
        await openContinuousSections();
        await continuousNav.getByRole("link", { name: "Billing & Payment" }).click();
        await page.getByRole("region", { name: "Billing & Payment" }).waitFor();
        await openContinuousSections();
        await continuousNav.getByRole("link", { name: "Profile", exact: true }).click();
        await page.getByRole("region", { name: "Client Profile" }).waitFor();
        await page.waitForFunction(() => document.querySelector('nav[aria-label="Client Workspace sections"] a[aria-current="location"]')?.textContent?.trim() === "Profile");
        await page.goBack();
        await page.getByRole("region", { name: "Billing & Payment" }).waitFor();
        await page.waitForFunction(() => document.querySelector('nav[aria-label="Client Workspace sections"] a[aria-current="location"]')?.textContent?.trim() === "Billing & Payment");
        await page.goForward();
        await page.getByRole("region", { name: "Client Profile" }).waitFor();
        if (await page.getByRole("tablist", { name: "Client operations sections" }).count())
          throw new Error("Redundant in-content client section buttons remain");
        if (errors.length) throw new Error("Client operations keyboard interactions threw: " + errors.join("\\n"));
      }
      // P0-B: Client and Agency sticky nav must retain readable text through
      // inactive, hovered, keyboard-focused and active visual states on desktop/mobile.
      if (route === "/demo/client" || route === "/demo/agency") {
        const navSelector = route === "/demo/client"
          ? ".clientContinuousSide nav a" : "aside.side nav a";
        const links = page.locator(navSelector);
        // Mobile Client navigation is intentionally collapsed. Open its accessible
        // disclosure before auditing default, hover, focus and active link contrast.
        if (route === "/demo/client" && width <= 600) {
          const toggle = page.getByRole("button", { name: "Show sections" });
          if (!(await toggle.isVisible()) || await toggle.getAttribute("aria-expanded") !== "false")
            throw new Error("Client mobile sidebar toggle must start visibly collapsed");
          await toggle.click();
          if (await page.getByRole("button", { name: "Hide sections" }).getAttribute("aria-expanded") !== "true")
            throw new Error("Client mobile sidebar did not expand for legibility audit");
        }
        if (await links.count() < 3)
          throw new Error(route + " lost its accessible continuous-scroll sidebar links");
        const readContrast = async (link) => link.evaluate(el => {
          const rgb = value => {
            const found = value.match(/rgba?\(([^)]+)\)/);
            if (!found) return null;
            const numbers = found[1].split(/[\s,]+/).map(Number);
            return [...numbers.slice(0, 3), numbers.length > 3 ? numbers[3] : 1];
          };
          const lum = values => values.slice(0, 3).map(value => {
            const n = value / 255;
            return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
          }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
          const fg = rgb(getComputedStyle(el).color);
          let bg = [255, 255, 255, 1];
          for (let node = el; node; node = node.parentElement) {
            const candidate = rgb(getComputedStyle(node).backgroundColor);
            if (candidate && candidate[3] >= 0.95) { bg = candidate; break; }
          }
          return { name: el.textContent?.trim(), contrast: fg
            ? (Math.max(lum(fg), lum(bg)) + 0.05) / (Math.min(lum(fg), lum(bg)) + 0.05) : 0 };
        });
        const check = async (link, state) => {
          const appearance = await readContrast(link);
          if (!appearance.name || appearance.contrast < 4.5)
            throw new Error(route + " " + state + " sidebar text is not legible: " + JSON.stringify(appearance));
        };
        const inactive = links.nth(1);
        await check(inactive, "default");
        await inactive.hover();
        await check(inactive, "hover");
        await inactive.focus();
        await check(inactive, "focus");
        const active = page.locator(navSelector + "[aria-current]");
        if (await active.count() !== 1)
          throw new Error(route + " sidebar scrollspy must highlight exactly one section");
        await check(active, "selected");
        if (route === "/demo/client" && width <= 600) {
          await page.getByRole("button", { name: "Hide sections" }).click();
          if (await links.first().isVisible())
            throw new Error("Client mobile navigation remained visible after collapse");
        }
      }
      // Every nested Client, Inspector, and Agency demo route inherits a single
      // floating Back to top control. Check real mobile/desktop interaction.
      if (route.startsWith("/demo/") || route === "/email-requirements?demo=1") {
        // Short report/detail pages must behave correctly once content grows.
        await page.evaluate(() => {
          const spacer = document.createElement("div");
          spacer.id = "demo-back-to-top-test-spacer";
          spacer.setAttribute("aria-hidden", "true");
          spacer.style.height = "1200px";
          document.body.appendChild(spacer);
          window.scrollTo({ top: 0, behavior: "instant" });
        });
        await page.waitForFunction(() => window.scrollY < 8);
        const back = page.getByRole("button", { name: "Back to top" });
        // React commits the state after a scroll animation frame, not synchronously.
        await back.waitFor({ state: "hidden", timeout: 4000 });
        await page.evaluate(() => window.scrollTo({ top: 360, behavior: "instant" }));
        await page.waitForFunction(() => window.scrollY >= 350);
        await page.waitForTimeout(90);
        await back.waitFor({ state: "hidden", timeout: 4000 }).catch(() => {
          throw new Error(route + " Demo Back to top appeared before threshold");
        });
        await page.evaluate(() => window.scrollTo({ top: 850, behavior: "instant" }));
        await back.waitFor({ state: "visible", timeout: 7000 })
          .catch(() => { throw new Error(route + " Demo Back to top missing after scroll"); });
        const geometry = await back.boundingBox();
        if (!geometry || geometry.width < 120 || geometry.height < 44 ||
            geometry.x + geometry.width > width || geometry.y + geometry.height > 900 ||
            geometry.y < (width < 600 ? 70 : 0)) {
          throw new Error(width + "px " + route + " Demo Back to top is clipped or obscures mobile header");
        }
        // Tab is needed to establish true keyboard modality for :focus-visible.
        // It can move focus to an earlier control and scroll a long dashboard up,
        // temporarily hiding this threshold-driven button. Restore our explicit
        // >=500px setup before focusing the floating control.
        await page.keyboard.press("Tab");
        await page.evaluate(() => window.scrollTo({ top: 850, behavior: "instant" }));
        await back.waitFor({ state: "visible", timeout: 5000 });
        await back.focus();
        const focusWidth = await back.evaluate(node => parseFloat(getComputedStyle(node).outlineWidth));
        if (focusWidth < 2) throw new Error(route + " Demo Back to top lacks keyboard focus");
        if (width === 390) await page.emulateMedia({ reducedMotion: "reduce" });
        await page.keyboard.press("Enter");
        await page.waitForFunction(() => window.scrollY < 8, null, { timeout: 8000 })
          .catch(async () => {
            const diagnostic = await page.evaluate(() => ({
              y: window.scrollY, docTop: document.documentElement.scrollTop,
              height: document.documentElement.scrollHeight, innerHeight: window.innerHeight,
              active: document.activeElement?.getAttribute("aria-label") || document.activeElement?.tagName,
              backButton: !!document.querySelector('button[aria-label="Back to top"]'),
              url: location.href,
            }));
            throw new Error(route + " Demo Back to top failed keyboard activation: " + JSON.stringify(diagnostic));
          });
        await back.waitFor({ state: "hidden", timeout: 5000 });
        // A reviewer who resumes scrolling during the smooth return must not
        // be forcibly sent back to the top when its old settle timer fires.
        if (route === "/demo/client" && width === 1440) {
          await page.evaluate(() => {
            const button = document.querySelector('button[aria-label="Back to top"]');
            if (!button) throw new Error("Shared demo back-to-top control missing");
            window.scrollTo({ top: 850, behavior: "instant" });
            button.click();
            window.dispatchEvent(new Event("wheel"));
            window.scrollTo({ top: 750, behavior: "instant" });
          });
          await page.waitForTimeout(1100);
          const retainedPosition = await page.evaluate(() => window.scrollY);
          if (retainedPosition < 500) throw new Error(
            "Interrupted Demo Back to top unexpectedly snapped back to page start: " + retainedPosition);
          // Keyboard navigation and browser history must also interrupt a
          // pending smooth return, otherwise its 900ms callback erases the new
          // scroll position after following another demo section.
          for (const kind of ["keyboard", "hashchange", "popstate"]) {
            await page.evaluate(kind => {
              const button = document.querySelector('button[aria-label="Back to top"]');
              if (!button) throw new Error("Shared demo Back to top control missing");
              window.scrollTo({ top: 850, behavior: "instant" });
              button.click();
              if (kind === "keyboard") {
                window.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
              } else {
                window.dispatchEvent(new Event(kind));
              }
              window.scrollTo({ top: 750, behavior: "instant" });
            }, kind);
            await page.waitForTimeout(1100);
            const retained = await page.evaluate(() => window.scrollY);
            if (retained < 500) throw new Error(
              "Demo Back to top " + kind + " navigation unexpectedly snapped back to page start: " + retained);
          }
          await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
          await back.waitFor({ state: "hidden", timeout: 5000 });
        }
        if (width === 390) await page.emulateMedia({ reducedMotion: "no-preference" });
        await page.evaluate(() => document.getElementById("demo-back-to-top-test-spacer")?.remove());
      }
      if (route === "/email-requirements") {
        await page.evaluate(() => {
          const spacer=document.createElement("div"); spacer.style.height="1200px"; document.body.appendChild(spacer);
          window.scrollTo({top:800,behavior:"instant"});
        });
        await page.waitForTimeout(120);
        if (await page.getByRole("button", { name: "Back to top" }).count())
          throw new Error("Live email requirements route must not mount Demo Back to top");
      }
      console.log("Demo control visibility OK:", width + "px", route, result.checked);
    }
    await page.close();
  }
} catch (e) {
  failed = true;
  console.error(e instanceof Error ? e.stack : String(e), log.slice(-1500));
} finally {
  if (browser) await browser.close();
  if (server) { server.kill("SIGTERM"); await new Promise(r => setTimeout(r, 200)); if (!server.killed) server.kill("SIGKILL"); }
}
if (failed) process.exitCode = 1;
