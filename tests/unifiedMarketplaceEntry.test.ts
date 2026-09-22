import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const nav = readFileSync("components/Nav.tsx", "utf8");
const home = readFileSync("app/page.tsx", "utf8");

test("unified marketplace entry uses one global login rather than role-specific auth entry points", () => {
  assert.ok(nav.includes('href="/login"'));
  assert.ok(!nav.includes("/login?role=client"));
  assert.ok(!nav.includes("/login?role=agency"));
  assert.ok(!nav.includes("/login?role=inspector"));
  assert.ok(nav.includes("Logged in as"));
  assert.ok(nav.includes("Live data"));
  assert.ok(nav.includes("Demo view"));
});

test("unified marketplace entry presents clients, agencies and inspectors as equal homepage audiences", () => {
  assert.ok(home.includes('label:"For Clients"'));
  assert.ok(home.includes('label:"For Agencies"'));
  assert.ok(home.includes('label:"For Inspectors"'));
  assert.ok(home.includes('grid-template-columns:repeat(3'));
  assert.ok(home.includes("One InspectSource sign-in."));
  assert.ok(home.includes("/demo/client"));
  assert.ok(home.includes("/demo/agency"));
  assert.ok(home.includes("/demo/inspector"));
});

test("unified marketplace entry does not move role authorization into homepage or navigation UX", () => {
  assert.ok(!/supabase|auth\.signIn|role_id|user_roles/.test(home));
  assert.ok(!/role_id|user_roles|setRole|assignRole/.test(nav));
});
