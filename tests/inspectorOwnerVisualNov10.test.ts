import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const inspector=readFileSync("app/demo/inspector/page.tsx","utf8");
const calendar=readFileSync("components/InspectorAvailabilityCalendar.tsx","utf8");
test("InspectorHub text-only green nav wins global dark button styles and retains keyboard focus",()=>{
 assert.match(inspector,/className=\{section===s\?"sidebarTextLink active":"sidebarTextLink"\}/);
 assert.match(inspector,/\.side nav button\.sidebarTextLink:not\(:disabled\)\{[^}]*background:transparent!important;[^}]*border-radius:0!important;/);
 assert.match(inspector,/\.side nav button\.sidebarTextLink\.active:not\(:disabled\)/);
 assert.match(inspector,/\.side nav button\.sidebarTextLink:focus-visible:not\(:disabled\)/);
});
test("removed visible region selector and complete profile strength card",()=>{
 assert.doesNotMatch(inspector,/>Demo region<|<label>Demo region|Profile strength|92% · Ready for client review/);
 assert.match(inspector,/className="profileSection"/);
 assert.match(inspector,/const region:Region="USA"/);
});
test("all preview opportunity rates are single fictional offers from the shared listing source",()=>{
 for(const rate of ['$950/day','$1,050/day','£725/day'])assert.ok(inspector.includes('rate:"'+rate+'"'),rate);
 assert.doesNotMatch(inspector,/rate:"[^"]*(?:\$\d[\d,]*-\$|£\d+-£)/);
 assert.match(inspector,/Offered rate: \{o.rate\}/);
 assert.match(inspector,/Offered day rate: \{opp.rate\}/);
 assert.match(inspector,/Expenses and overtime are excluded unless separately agreed/);
});
test("calendar connections are compact responsive and simulated only",()=>{
 assert.match(calendar,/className="calendarConnections" aria-label="Calendar connections"/);
 assert.match(calendar,/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
 assert.match(calendar,/@media\(max-width:760px\)\{\.connectors\{grid-template-columns:1fr\}/);
 for(const label of ["Google Calendar · Connected (demo)","Connect Outlook Calendar","Link Other Calendar"])assert.ok(calendar.includes(label));
 assert.match(calendar,/OAuth\/sync is not enabled/);
});
