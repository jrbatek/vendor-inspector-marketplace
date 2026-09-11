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
