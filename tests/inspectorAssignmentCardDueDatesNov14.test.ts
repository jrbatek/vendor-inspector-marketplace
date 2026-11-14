import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { getInspectorDemoAssignmentDue } from "../components/InspectorDemoAssignment";

const page=readFileSync("app/demo/inspector/page.tsx","utf8");
const browser=readFileSync("scripts/smoke-inspector-demo.mjs","utf8");

test("all three fictional assignment summaries show their exact detail due date from one source",()=>{
  assert.equal(getInspectorDemoAssignmentDue("LNG Compressor Package"),"November 16, 2026 · 17:00 CST");
  assert.equal(getInspectorDemoAssignmentDue("Gulf Horizon Refinery Upgrade"),"November 6, 2026 · 12:00 CST");
  assert.equal(getInspectorDemoAssignmentDue("Orion Deepwater Platform"),"November 18, 2026 · 09:00 KST");
  assert.equal(getInspectorDemoAssignmentDue("No such assignment"),"Due date to be confirmed");
  assert.match(page,/getInspectorDemoAssignmentDue\(a\[0\]\)/);
  assert.match(page,/className="dueDate"/);
  assert.match(page,/\.cards article \.dueDate\{margin:0;color:#115e59;font-weight:800/);
});

test("hosted Chromium compares the visible list deadline with the opened assignment workspace",()=>{
  assert.ok(browser.includes("Active Assignment card due date differs from Open Assignment details"));
  assert.ok(browser.includes('assignmentCard.locator(".dueDate").innerText()'));
  assert.ok(browser.includes('assignment.getByRole("heading", { name: "Milestones" })'));
});
