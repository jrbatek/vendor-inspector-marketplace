import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("Client Demo expansion controls point only to mounted synthetic detail regions", () => {
 const view=readFileSync("app/demo/client-inspections/page.tsx","utf8");
 const smoke=readFileSync("scripts/smoke-client-inspections.mjs","utf8");
 assert.ok(view.includes('aria-controls={open ? `details-${row.id}` : undefined}'));
 assert.ok(view.includes('aria-controls={expandedNcr === ncr.id ? `ncr-detail-${ncr.id}` : undefined}'));
 assert.ok(smoke.includes("Collapsed inspection must not point aria-controls"));
 assert.ok(smoke.includes("Open NCR must identify its mounted corrective-action details"));
 assert.ok(smoke.includes("Closed NCR must remove the stale aria-controls reference"));
});
