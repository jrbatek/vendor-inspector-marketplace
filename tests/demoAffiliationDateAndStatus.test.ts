import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const agency = readFileSync("app/demo/agency-affiliations/page.tsx", "utf8");
const inspector = readFileSync("app/demo/inspector-affiliations/page.tsx", "utf8");
const demoAsOf = Date.parse("2026-11-10T00:00:00Z");
const sixtyDaysLater = demoAsOf + 60 * 86400 * 1000;

test("Expiring affiliation sample dates really are future dates in the November 2026 demo", () => {
  for (const [label, source] of [["Agency", agency], ["Inspector", inspector]] as const) {
    const matches = Array.from(source.matchAll(/state:"Expiring",dates:"[^"]*[—–] ([A-Z][a-z]{2} \d{1,2}, \d{4})"/g));
    assert.ok(matches.length > 0, label + ": expected a fictional Expiring relationship");
    for (const match of matches) {
      const expiry = Date.parse(match[1] + " 00:00:00 GMT");
      assert.ok(Number.isFinite(expiry), label + ": invalid affiliation expiry date");
      assert.ok(expiry > demoAsOf && expiry <= sixtyDaysLater,
        label + ": Expiring status contradicts the November 10 reference snapshot: " + match[1]);
    }
  }
  assert.match(agency, /action:"Renewal due Dec 15"/);
  assert.match(inspector, /state:"Expired \/ Ended",dates:"Feb 1, 2022 – Dec 15, 2024"/);
});

test("agency and inspector demo affiliation lifecycle chips are readable and distinguish active from expired", () => {
  for (const [label, source, classname] of [
    ["Agency", agency, "pill"], ["Inspector", inspector, "state"]
  ] as const) {
    assert.ok(source.includes(`className="${classname}" data-state={a.state}`), label);
    for (const state of ["Expiring", "Expired / Ended", "Disputed"]) {
      assert.ok(source.includes(`.${classname}[data-state="${state}"]`),
        label + ": missing visible status style for " + state);
    }
    assert.match(source, /background:#ffedd5;color:#9a3412/);
    assert.match(source, /background:#e2e8f0;color:#334155/);
    assert.match(source, /background:#fee2e2;color:#991b1b/);
    assert.doesNotMatch(source, /createClient\(|supabaseBrowser|XMLHttpRequest/);
  }
});

test("Agency Affiliations no-login first render stays meaningful until the client has hydrated", () => {
  assert.match(agency, /useEffect\(\(\)=>setHydrated\(true\),\[\]\)/);
  assert.match(agency, /if\(!hydrated\) return <main/);
  assert.match(agency, /Loading fictional affiliation examples/);
  assert.match(agency, /No login is required/);
});
