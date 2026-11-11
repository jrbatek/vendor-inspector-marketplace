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
  "/demo/client-analytics", "/demo/client-history", "/demo/inspector",
  "/demo/inspector-documents", "/demo/inspector-work-history", "/demo/inspector-income",
  "/demo/agency", "/demo/agency-affiliations", "/demo/agency-commercials",
  "/demo/client-data", "/demo/client-operations", "/demo/inspector-selection-outcomes",
  "/demo/inspector-affiliations", "/demo/inspector-reports", "/demo/email-requirements"
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
        const bad = [];
        let checked = 0;
        for (const el of document.querySelectorAll("button, a[href], select, input:not([type=hidden]), [role=button]")) {
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
        await page.getByRole("button", { name: "Reset export filter" }).click();
        if (await records.count() !== 5) throw new Error("Client export reset must restore all five rows");
        if (errors.length) throw new Error("Client data filter caused browser exception: " + errors.join("\\n"));
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
        const sidebar = page.getByRole("complementary", { name: "Client Workspace navigation" });
        await sidebar.getByRole("link", { name: "Contracts", exact: true }).click();
        await page.getByRole("region", { name: "Contracts" }).waitFor();
        if (await sidebar.getByRole("link", { name: "Contracts", exact: true }).getAttribute("aria-current") !== "page")
          throw new Error("Contracts sidebar link did not become active");
        const contractTabs = page.getByRole("tablist", { name: "Contract relationship types" });
        await contractTabs.getByRole("tab", { name: "InspectSource" }).focus();
        await page.keyboard.press("End");
        if (await contractTabs.getByRole("tab", { name: "Others" }).getAttribute("aria-selected") !== "true")
          throw new Error("Contract tabs End did not activate Others");
        await page.keyboard.press("Home");
        if (await contractTabs.getByRole("tab", { name: "InspectSource" }).getAttribute("aria-selected") !== "true")
          throw new Error("Contract tabs Home did not restore InspectSource");
        await contractTabs.getByRole("tab", { name: "Individual Inspectors" }).click();
        const expired = page.locator(".contractWrap").first();
        if (!(await expired.innerText()).includes("Expired") || !(await expired.innerText()).includes("Sep 30, 2026"))
          throw new Error("Expired inspector contract fixture did not show its actual closeout status");
        const expiredColor = await expired.locator(".status").evaluate(el => ({
          background: getComputedStyle(el).backgroundColor, color: getComputedStyle(el).color
        }));
        if (expiredColor.background !== "rgb(255, 247, 237)" || expiredColor.color !== "rgb(154, 52, 18)")
          throw new Error("Expired inspector contract status is not visibly legible: " + JSON.stringify(expiredColor));
        await sidebar.getByRole("link", { name: "Billing & Payment" }).click();
        await page.getByRole("region", { name: "Billing & Payment" }).waitFor();
        await sidebar.getByRole("link", { name: "Profile", exact: true }).click();
        await page.getByRole("region", { name: "Client Profile" }).waitFor();
        if (await sidebar.getByRole("link", { name: "Profile", exact: true }).getAttribute("aria-current") !== "page")
          throw new Error("Client Profile sidebar link did not become active");
        await page.goBack();
        await page.getByRole("region", { name: "Billing & Payment" }).waitFor();
        if (await sidebar.getByRole("link", { name: "Billing & Payment" }).getAttribute("aria-current") !== "page")
          throw new Error("Browser back failed to restore Billing section and sidebar highlight");
        await page.goForward();
        await page.getByRole("region", { name: "Client Profile" }).waitFor();
        if (await page.getByRole("tablist", { name: "Client operations sections" }).count())
          throw new Error("Redundant in-content client section buttons remain");
        if (errors.length) throw new Error("Client operations keyboard interactions threw: " + errors.join("\\n"));
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
