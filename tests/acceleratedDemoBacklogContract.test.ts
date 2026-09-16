import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");
const home = read("app/page.tsx");
const nav = read("components/Nav.tsx");
const client = read("app/demo/client/page.tsx");
const history = read("app/demo/client-history/page.tsx");
const analytics = read("app/demo/client-analytics/page.tsx");
const data = read("app/demo/client-data/page.tsx");
const operations = read("app/demo/client-operations/page.tsx");
const inspector = read("app/demo/inspector/page.tsx");
const register = read("app/register/page.tsx");
const email = read("app/email-requirements/page.tsx");

test("accelerated client and inspector demo backlog remains represented", () => {
  assert.match(home, /Eyes, Ears, and Expertise, Everywhere/);
  assert.doesNotMatch(home, /What We Do/);
  assert.match(nav, /Client Login/);
  assert.match(nav, /Inspector Login/);
  assert.match(client, /10,000|10000/);
  assert.match(client, /Select your inspection criteria/);
  assert.match(history, /Active Inspections/);
  assert.match(history, /Pending Requests/);
  assert.match(history, /Submitted Reports/);
  assert.match(history, /Inspection History API/);
  assert.match(analytics, /NCR/);
  assert.match(analytics, /Commodity/);
  assert.match(analytics, /Project Type/);
  assert.match(data, /Power BI/);
  assert.match(data, /Excel/);
  assert.match(operations, /Billing & Payment/);
  assert.match(operations, /Individual Inspectors/);
  assert.match(operations, /Approval authority/);
  assert.match(inspector, /Inspector Workspace/);
});

test("demo surfaces retain explicit synthetic-data boundaries", () => {
  for (const source of [client, history, analytics, data, operations, inspector]) {
    assert.match(source, /Synthetic|synthetic/);
  }
  assert.doesNotMatch(operations, /supabaseBrowser|createClient|process\.env/);
  assert.doesNotMatch(analytics, /supabaseBrowser|createClient|process\.env/);
});

test("auth and email guidance preserve the requested safe UX contract", () => {
  assert.match(register, /MIN_PASSWORD_LENGTH/);
  assert.match(register, /minimum currently enforced by InspectSource registration/);
  assert.match(email, /InspectSource/);
  assert.match(email, /attachment|Attachment/);
  assert.match(email, /Copy Sample Request/);
});
