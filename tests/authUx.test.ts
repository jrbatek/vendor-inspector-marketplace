import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const registerSource = fs.readFileSync(path.join(process.cwd(), "app/register/page.tsx"), "utf8");
const navSource = fs.readFileSync(path.join(process.cwd(), "components/Nav.tsx"), "utf8");

test("registration password guidance matches the enforced client-side minimum", () => {
  assert.match(registerSource, /const MIN_PASSWORD_LENGTH = 6/);
  assert.match(registerSource, /minLength=\{MIN_PASSWORD_LENGTH\}/);
  assert.match(registerSource, /Use at least \{MIN_PASSWORD_LENGTH\} characters/);
  assert.match(registerSource, /aria-describedby="password-policy"/);
});

test("authenticated navigation identifies the live-data session without changing auth policy", () => {
  assert.match(navSource, /supabase\.auth\.getUser\(\)/);
  assert.match(navSource, /supabase\.auth\.onAuthStateChange/);
  assert.match(navSource, /Logged in as/);
  assert.match(navSource, /Live data/);
  assert.match(navSource, /Authenticated live-data session/);
  assert.doesNotMatch(navSource, /signOut\(/);
});
