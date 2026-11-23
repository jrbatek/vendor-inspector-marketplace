import { spawn } from "node:child_process";
import { chromium } from "playwright";

// Synthetic-only UI regression: never signs in or reads/writes production records.
const port = 3121;
const base = process.env.CLIENT_SOURCING_BASE_URL || "http://127.0.0.1:" + port;
const server = process.env.CLIENT_SOURCING_BASE_URL ? null : spawn(
  process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)],
  { env: { ...process.env, NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ci-placeholder.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "ci-placeholder-anon-key" },
    stdio: ["ignore", "pipe", "pipe"] }
);
let output = "", browser;
server?.stdout.on("data", data => output += String(data));
server?.stderr.on("data", data => output += String(data));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const contrast = (a, b) => {
  const channel = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const lum = rgb => rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  const l1 = lum(a.map(channel)), l2 = lum(b.map(channel));
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};
async function legible(button, label) {
  const colors = await button.evaluate(node => {
    const styles = getComputedStyle(node);
    const rgb = value => (value.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
    return { foreground: rgb(styles.color), background: rgb(styles.backgroundColor) };
  });
  assert(colors.foreground.length === 3 && colors.background.length === 3, label + " has unresolved colors");
  assert(contrast(colors.foreground, colors.background) >= 4.5, label + " has illegible button text");
}
async function ready() {
  for (let i = 0; i < 35; i++) {
    try { if ((await fetch(base + "/demo/client-agency-sourcing")).ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error("Client sourcing demo server not ready: " + output.slice(-1200));
}
try {
  await ready();
  browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const exceptions = [];
  page.on("pageerror", error => exceptions.push(error.stack || String(error)));
  await page.goto(base + "/demo/client-agency-sourcing", { waitUntil: "networkidle" });
  assert((await page.getByText(/Log in to view the client workspace/i).count()) === 0, "Demo leaked a live login shell");
  const group = page.getByRole("group", { name: "Source of Inspectors" });
  const agencies = group.getByRole("button", { name: "Contracted agencies only", exact: true });
  const independent = group.getByRole("button", { name: "Independent inspectors only", exact: true });
  const both = group.getByRole("button", { name: "Contracted agencies + independent inspectors", exact: true });
  const summary = page.locator(".sourceSummary");
  const count = async (source, rows) => {
    assert(await source.getAttribute("aria-pressed") === "true", "Selected source does not expose aria-pressed");
    assert((await group.locator('button[aria-pressed="true"]').count()) === 1, "Source selectors are not exclusive");
    assert((await page.locator(".results > article").count()) === rows, "Incorrect synthetic source count " + rows);
    assert((await summary.innerText()).includes(rows + " inspectors shown"), "Announced source count does not match results");
  };
  await count(both, 4);
  await legible(both, "selected Both");
  await legible(agencies, "unselected Agencies");
  await agencies.hover();
  await legible(agencies, "hover Agencies");
  await agencies.focus();
  const focusOutline = await agencies.evaluate(node => getComputedStyle(node).outlineWidth);
  assert(parseFloat(focusOutline) >= 2, "Keyboard focus indicator is invisible");
  await agencies.press("Enter");
  await count(agencies, 2);
  await legible(agencies, "selected Agencies");
  assert((await page.locator(".results").innerText()).includes("Maya Chen"), "Agency channel record missing");
  assert(!(await page.locator(".results").innerText()).includes("Jordan Silva"), "Independent record leaked into agency-only results");
  await page.locator(".channels button").first().click();
  assert((await page.locator(".selectionNotice").count()) === 1, "Agency channel selection lacks visible feedback");
  await independent.click();
  await count(independent, 2);
  assert((await page.locator(".selectionNotice").count()) === 0, "Agency selection leaked after source change");
  assert((await page.locator(".results").innerText()).includes("Jordan Silva"), "Independent record missing");
  assert(!(await page.locator(".results").innerText()).includes("Maya Chen"), "Agency-only record leaked into independent");
  await legible(independent, "selected Independent");
  await both.click();
  await count(both, 4);
  // P0-B: intermediate/tablet viewports exercise the 1180px wrap breakpoint,
  // where the Owner previously observed blank or clipped source controls.
  for (const width of [1024, 768]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [option, label] of [
      [agencies, "Contracted agencies only"],
      [independent, "Independent inspectors only"],
      [both, "Contracted agencies + independent inspectors"]
    ]) {
      const bounds = await option.boundingBox();
      assert(bounds && bounds.width >= 44 && bounds.height >= 44 &&
        bounds.x >= -1 && bounds.x + bounds.width <= width + 1,
        width + "px Source of Inspectors selector is clipped or too small: " + label);
      await legible(option, width + "px resting " + label);
      await option.hover();
      await legible(option, width + "px hovered " + label);
      // Transition to real keyboard input before testing :focus-visible;
      // programmatic focus directly after pointer hover is not a keyboard focus.
      await page.keyboard.press("Tab");
      await option.focus();
      assert(parseFloat(await option.evaluate(node => getComputedStyle(node).outlineWidth)) >= 2,
        width + "px Source of Inspectors focus indicator disappeared: " + label);
    }
    await agencies.click();
    await count(agencies, 2);
    await legible(agencies, width + "px selected Agencies");
    await both.click();
    await count(both, 4);
    await legible(both, width + "px selected Both");
    assert(exceptions.length === 0, width + "px sourcing browser exceptions: " + exceptions.join("\\n"));
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  // P0-B: inspect a separate narrow-screen demo session, including interactive
  // source toggles and channel selection rather than just the initial render.
  const narrow = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const narrowErrors = [];
  narrow.on("pageerror", error => narrowErrors.push(error.stack || String(error)));
  await narrow.goto(base + "/demo/client-agency-sourcing", { waitUntil: "networkidle" });
  const narrowGroup = narrow.getByRole("group", { name: "Source of Inspectors" });
  const narrowAgencies = narrowGroup.getByRole("button", { name: "Contracted agencies only", exact: true });
  const narrowIndependent = narrowGroup.getByRole("button", { name: "Independent inspectors only", exact: true });
  const narrowBoth = narrowGroup.getByRole("button", { name: "Contracted agencies + independent inspectors", exact: true });
  for (const option of [narrowAgencies, narrowIndependent, narrowBoth]) {
    const bounds = await option.boundingBox();
    assert(bounds && bounds.width >= 44 && bounds.height >= 44, "Mobile Source of Inspectors control must have a 44px tap target and remain visible");
    assert(bounds.x >= -1 && bounds.x + bounds.width <= 391, "Source selector overflows mobile viewport");
    await legible(option, "mobile source selector resting");
    await option.hover();
    await legible(option, "mobile source selector hovered");
    await option.focus();
    assert(parseFloat(await option.evaluate(node => getComputedStyle(node).outlineWidth)) >= 2,
      "Mobile Source of Inspectors control lost focus outline");
  }
  // Disabled state is a supported style even though the synthetic source chooser is normally enabled.
  await narrowAgencies.evaluate(node => node.setAttribute("disabled", ""));
  await legible(narrowAgencies, "mobile disabled agency source");
  assert(await narrowAgencies.isDisabled(), "Disabled source option did not expose native disabled semantics");
  await narrowAgencies.evaluate(node => node.removeAttribute("disabled"));
  await narrowAgencies.click();
  assert((await narrow.locator(".results > article").count()) === 2, "Mobile agency cohort incorrect");
  await legible(narrowAgencies, "mobile selected agency source");
  const agencyChannel = narrow.locator(".channels button").first();
  const channelBounds=await agencyChannel.boundingBox();
  assert(channelBounds && channelBounds.width >= 44 && channelBounds.height >= 44,
    "Mobile agency channel selection must provide a 44px tap target");
  await legible(agencyChannel, "mobile unselected agency channel");
  await agencyChannel.hover();
  await legible(agencyChannel, "mobile hovered agency channel");
  await agencyChannel.click();
  assert(await agencyChannel.getAttribute("aria-pressed") === "true", "Mobile agency channel selection not announced");
  await legible(agencyChannel, "mobile selected agency channel");
  // A selected agency channel must remain readable when temporarily disabled.
  // In the real UI this state can occur while a selection is being processed.
  await agencyChannel.evaluate(node => node.setAttribute("disabled", ""));
  assert(await agencyChannel.isDisabled(), "Selected agency channel lost native disabled semantics");
  await legible(agencyChannel, "mobile disabled selected agency channel");
  await agencyChannel.evaluate(node => node.removeAttribute("disabled"));
  assert((await narrow.locator(".selectionNotice").count()) === 1, "Mobile channel selection confirmation absent");
  await narrowIndependent.click();
  assert((await narrow.locator(".results > article").count()) === 2, "Mobile independent cohort incorrect");
  assert((await narrow.locator(".selectionNotice").count()) === 0, "Mobile agency channel selection leaked across sources");
  const independentChannel = narrow.locator(".independent button").first();
  const independentBounds=await independentChannel.boundingBox();
  assert(independentBounds && independentBounds.width >= 44 && independentBounds.height >= 44,
    "Mobile independent channel selection must provide a 44px tap target");
  await legible(independentChannel, "mobile unselected independent channel");
  await independentChannel.evaluate(node => node.setAttribute("disabled", ""));
  assert(await independentChannel.isDisabled(), "Unselected independent channel lost native disabled semantics");
  await legible(independentChannel, "mobile disabled unselected independent channel");
  await independentChannel.evaluate(node => node.removeAttribute("disabled"));
  await independentChannel.click();
  assert(await independentChannel.getAttribute("aria-pressed") === "true", "Mobile independent selection not announced");
  await legible(independentChannel, "mobile selected independent channel");
  await independentChannel.evaluate(node => node.setAttribute("disabled", ""));
  assert(await independentChannel.isDisabled(), "Selected independent channel lost native disabled semantics");
  await legible(independentChannel, "mobile disabled selected independent channel");
  await independentChannel.evaluate(node => node.removeAttribute("disabled"));
  await narrowBoth.click();
  assert((await narrow.locator(".results > article").count()) === 4, "Mobile reset did not restore all fictional inspectors");
  assert(await narrowBoth.getAttribute("aria-pressed") === "true", "Mobile both-sources selection state incorrect");
  assert(narrowErrors.length === 0, "Mobile Client sourcing browser exceptions: " + narrowErrors.join("\n"));
  // 320px screens are narrower than the standard mobile smoke viewport.
  // Source/channel controls must remain tappable and readable without horizontal clipping.
  await narrow.setViewportSize({ width: 320, height: 700 });
  for (const option of [narrowAgencies, narrowIndependent, narrowBoth]) {
    const bounds = await option.boundingBox();
    assert(bounds && bounds.width >= 44 && bounds.height >= 44 &&
      bounds.x >= -1 && bounds.x + bounds.width <= 321,
      "320px Source of Inspectors option clipped or too small");
    await legible(option, "320px unselected/selected source option");
    await option.hover();
    await legible(option, "320px hovered source option");
  }
  await narrowAgencies.click();
  assert((await narrow.locator(".results > article").count()) === 2,
    "320px agency source selection lost its synthetic cohort");
  const compactChannel = narrow.locator(".channels button").first();
  const compactBounds = await compactChannel.boundingBox();
  assert(compactBounds && compactBounds.width >= 44 && compactBounds.height >= 44 &&
    compactBounds.x >= -1 && compactBounds.x + compactBounds.width <= 321,
    "320px agency channel option clipped or too small");
  await compactChannel.click();
  await legible(compactChannel, "320px selected agency channel");
  await narrowIndependent.click();
  assert((await narrow.locator(".selectionNotice").count()) === 0 &&
    (await narrow.locator(".results > article").count()) === 2,
    "320px agency selection leaked into independent inspectors");
  await narrowBoth.click();
  assert((await narrow.locator(".results > article").count()) === 4 &&
    await narrowBoth.getAttribute("aria-pressed") === "true",
    "320px Both reset failed to restore four fictional inspectors");
  assert(narrowErrors.length === 0, "320px source control browser exceptions: " + narrowErrors.join("\\n"));
  await narrow.close();
  assert(exceptions.length === 0, "Client sourcing browser exceptions: " + exceptions.join("\n"));
  console.log("Client Sourcing Chromium OK: desktop source counts 4/2/2/4, mobile selector/channel selected, unselected, hover, disabled contrast, focus, isolation and anonymous routing.");
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser?.close();
  server?.kill("SIGTERM");
}
