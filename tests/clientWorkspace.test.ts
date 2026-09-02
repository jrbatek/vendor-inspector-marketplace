import test from "node:test";
import assert from "node:assert/strict";
import { clientWorkspaceHref, parseClientWorkspaceSection } from "../lib/clientWorkspace";

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
