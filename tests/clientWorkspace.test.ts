import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { clientWorkspaceHref, parseClientWorkspaceSection } from "../lib/clientWorkspace";

const sidebarSource = fs.readFileSync(path.join(process.cwd(), "components/ClientWorkspaceSidebar.tsx"), "utf8");

test("client workspace accepts every supported section", () => {
  for (const section of ["request", "active", "history", "analytics", "billing", "contracts", "profile"] as const) {
    assert.equal(parseClientWorkspaceSection(section), section);
  }
});

test("client workspace falls back safely for missing or invalid sections", () => {
  assert.equal(parseClientWorkspaceSection(null), "request");
  assert.equal(parseClientWorkspaceSection(undefined), "request");
  assert.equal(parseClientWorkspaceSection("unknown"), "request");
});

test("client workspace produces bookmarkable section URLs", () => {
  assert.equal(clientWorkspaceHref("request"), "/client-dashboard");
  assert.equal(clientWorkspaceHref("active"), "/client-dashboard?section=active");
  assert.equal(clientWorkspaceHref("analytics"), "/client-dashboard?section=analytics");
});

test("demo workspace navigation returns to the canonical Client Demo", () => {
  assert.match(sidebarSource, /const requestHref=demo\?"\/demo\/client":"\/client-dashboard"/);
  assert.match(sidebarSource, /const requestActive=activePath\("\/demo\/client"\)/);
  assert.doesNotMatch(sidebarSource, /demo-showcase/);
});

test("client sidebar uses Analytics as the historical intelligence destination", () => {
  assert.doesNotMatch(sidebarSource, />Inspection History<\/Link>/);
  assert.match(sidebarSource, />Inspections in Progress<\/Link>/);
  assert.match(sidebarSource, />Analytics<\/Link>/);
  assert.match(sidebarSource, /activePath\("\/demo\/client-history"\).*params\.get\("view"\)!=="active"/);
});

test("client workspace navigation exposes landmarks and current-page state to assistive technology", () => {
  assert.match(sidebarSource, /aria-label="Client Workspace navigation"/);
  assert.match(sidebarSource, /<nav className="subnav" aria-label="Request inspector methods">/);
  assert.match(sidebarSource, /aria-current=\{requestActive\?"page":undefined\}/);
  assert.match(sidebarSource, /aria-current=\{progressActive\?"page":undefined\}/);
  assert.match(sidebarSource, /aria-current=\{analyticsActive\?"page":undefined\}/);
  assert.match(sidebarSource, /aria-current=\{billingActive\?"page":undefined\}/);
  assert.match(sidebarSource, /aria-current=\{contractsActive\?"page":undefined\}/);
  assert.match(sidebarSource, /aria-current=\{profileActive\?"page":undefined\}/);
});

test("client navigation uses the Client blue identity with visible interaction states", () => {
  assert.match(sidebarSource, /background:#eff6ff/);
  assert.match(sidebarSource, /background:#2563eb;color:#fff/);
  assert.match(sidebarSource, /:focus-visible/);
});

// Keep this low-risk contract on the stacked branch so retargeting onto the unified-entry PR receives fresh CI validation.
