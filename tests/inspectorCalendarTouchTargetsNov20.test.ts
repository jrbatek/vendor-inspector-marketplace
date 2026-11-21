import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const cal=readFileSync("components/InspectorAvailabilityCalendar.tsx","utf8");
const browser=readFileSync("scripts/smoke-demo-control-visibility.mjs","utf8");

test("Calendar Month/Week/List navigation and availability forms have 44px controls",()=>{
 assert.match(cal,/\.calendarShell button\{min-height:44px;border:1px solid #0f766e/);
 assert.match(cal,/\.monthJump input\{[^}]*min-height:44px\}/);
 assert.match(cal,/\.weekControls input,\.availabilityActions input,\.availabilityActions select\{min-height:44px/);
 assert.match(cal,/\.dayPicker\{width:44px;min-height:44px/);
 assert.match(cal,/\.calendarShell button:focus-visible\{outline:3px solid #115e59/);
 assert.match(cal,/\.calendarShell button:hover\{background:#115e59;color:#fff/);
 assert.match(browser,/Inspector Calendar navigation\/date\/block controls smaller than 44px/);
 assert.match(browser,/for \(const width of \[1440, 390\]\)/);
});
