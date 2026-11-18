import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("components/InspectorDemoAssignment.tsx", "utf8");
test("fictional action urgency derives from immutable snapshot dates, not manual contradictory badges", () => {
  assert.match(source, /ACTION_SNAPSHOT_DATE = "2026-11-17"/);
  assert.match(source, /const late = item\.dueIso < ACTION_SNAPSHOT_DATE/);
  assert.match(source, /Overdue · awaiting evidence/);
  assert.match(source, /actionStatus \$\{urgency\}/);
  assert.equal((source.match(/dueIso: "2026-/g)||[]).length, 6);
  const actions = [...source.matchAll(/id: "([^"]+)"[^\n]*dueIso: "(2026-[\d-]+)"[^\n]*status: "([^"]+)"/g)];
  assert.equal(actions.length, 6);
  for (const [, id, due, status] of actions) {
    if (due < "2026-11-17") assert.notEqual(status,"Upcoming",id+" is overdue at the snapshot");
    if (due > "2026-11-17") assert.notEqual(status,"Overdue",id+" is still upcoming at the snapshot");
  }
  for(const text of [
    'date: "November 16", status: "Overdue"',
    'date: "November 11", status: "Overdue"',
  ]) assert.ok(source.includes(text), "Stale upcoming milestone: " + text);
});
