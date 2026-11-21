import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("app/demo/agency/page.tsx", "utf8");
const smoke = readFileSync("scripts/smoke-agency-scrollspy.mjs", "utf8");

test("P0-B Agency sticky sidebar scrolls internally on short desktops and keeps its scrollspy link visible", () => {
  for (const code of [
    "const agencySidebarRef = useRef<HTMLElement | null>(null)",
    'ref={agencySidebarRef} className="side"',
    "height:calc(100vh - 24px);overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin",
    'querySelector<HTMLAnchorElement>(\'a[aria-current="page"]\')',
    "sidebar.scrollTop += selected.bottom - box.bottom + inset",
    "sidebar.scrollTop -= box.top + inset - selected.top",
    "[activeSection, agencyPageReady]",
    "requestedSection.current=id",
    "requestedSection.current=hash",
    "setActiveSection(requested)",
  ]) assert.ok(page.includes(code), "Agency short-screen guard missing: " + code);
  for (const check of [
    "width:1024,height:400",
    "sideMetrics.scrollHeight>sideMetrics.clientHeight",
    'await active(page,"contracts-commercials")',
    'activeSideLink.label==="Contracts & Commercials"',
    'await page.goto(base+"/demo/agency",{waitUntil:"networkidle"})',
  ]) assert.ok(smoke.includes(check), "Real Chromium Agency sidebar smoke missing: " + check);
});
