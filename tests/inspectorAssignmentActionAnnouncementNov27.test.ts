import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const component = readFileSync("components/InspectorDemoAssignment.tsx", "utf8");
test("assignment filter results have one persistent atomic status for both empty and populated results", () => {
  assert.equal((component.match(/role="status"/g) ?? []).length, 1);
  assert.ok(component.includes('<p className={filteredActions.length === 0 ? "actionEmpty" : "demoAsOf"} role="status" aria-atomic="true">'));
  assert.ok(component.includes('Showing {filteredActions.length} of {workflow.nextActions.length} fictional outstanding actions'));
  assert.ok(component.includes('actionFilter === "all" ? "All actions" : actionFilter === "overdue" ? "Overdue" : "Upcoming"'));
  assert.ok(component.includes('No {actionFilter === "overdue" ? "overdue" : "upcoming"} actions'));
  assert.ok(component.indexOf('role="status"') < component.indexOf('aria-label="Synthetic assignment outstanding action register"'));
});
