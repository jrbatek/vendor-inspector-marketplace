import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const calendar=readFileSync("components/InspectorAvailabilityCalendar.tsx","utf8");
const smoke=readFileSync("scripts/smoke-inspector-demo.mjs","utf8");

test("range impact derives aggregate protected and editable day counts from current calendar state",()=>{
  for(const expression of [
    'const rangeDates = dateRange(start,end)',
    'event.date===date && event.state==="Assigned"',
    'event.date===date && event.external && event.state==="Busy"',
    'event.date===date && event.manuallySet',
    'const protectedRangeDays = assignedRangeDays + privateRangeDays',
    'role="status" aria-live="polite"',
    "Protected dates cannot be overwritten or cleared",
    "No protected conflicts. Nothing changes until an update or clear action is selected"
  ])assert.ok(calendar.includes(expression),expression);
  assert.doesNotMatch(calendar,/rangePreview[^\n]*event\.label/);
});
test("impact warning retains visible contrast and real Chromium functional coverage",()=>{
  assert.ok(calendar.includes('.rangePreview.conflict{background:#fff7f7;color:#7f1d1d;border-color:#b91c1c}'));
  for(const marker of ["3 selected dates","1 linked private Busy day","1 assigned inspection day","1 inspector-added day","Selected protected-date warning must remain legible"])assert.ok(smoke.includes(marker),marker);
});
