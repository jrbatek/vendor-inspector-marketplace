import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const registerSource = fs.readFileSync(path.join(process.cwd(), "app/register/page.tsx"), "utf8");
const loginSource = fs.readFileSync(path.join(process.cwd(), "app/login/page.tsx"), "utf8");
const navSource = fs.readFileSync(path.join(process.cwd(), "components/Nav.tsx"), "utf8");

test("registration password guidance matches the enforced client-side minimum", () => {
  assert.match(registerSource, /const MIN_PASSWORD_LENGTH = 6/);
  assert.match(registerSource, /minLength=\{MIN_PASSWORD_LENGTH\}/);
  assert.match(registerSource, /Use at least \{MIN_PASSWORD_LENGTH\} characters/);
  assert.match(registerSource, /aria-describedby="password-policy"/);
});

test("client and inspector navigation use distinct login entry points without changing role enforcement", () => {
  assert.match(navSource, /\["Client Login", "\/login\?role=client"\]/);
  assert.match(navSource, /\["Inspector Login", "\/login\?role=inspector"\]/);
  assert.match(loginSource, /searchParams\?\.role === "client"/);
  assert.match(loginSource, /searchParams\?\.role === "inspector"/);
  assert.match(loginSource, /\? "Client"/);
  assert.match(loginSource, /\? "Inspector"/);
  assert.match(loginSource, /`\$\{audienceLabel\} Login`/);
  assert.match(loginSource, /routes you according to the role on your account/);
  assert.match(loginSource, /profile\?\.role === "inspector" \? "\/dashboard" : "\/client-dashboard"/);
});

test("authenticated navigation identifies live sessions without labeling synthetic demo pages as live data", () => {
  assert.match(navSource, /supabase\.auth\.getUser\(\)/);
  assert.match(navSource, /supabase\.auth\.onAuthStateChange/);
  assert.match(navSource, /const pathname = usePathname\(\)/);
  assert.match(navSource, /const isDemoView = isDemoExperiencePath\(pathname\)/);
  assert.match(navSource, /Logged in as/);
  assert.match(navSource, /isDemoView \? "Demo view" : "Live data"/);
  assert.match(navSource, /isDemoView \? "Authenticated session viewing synthetic demo data" : "Authenticated live-data session"/);
  assert.match(navSource, /supabase\.auth\.signOut\(\)/);
  assert.match(navSource, /disabled=\{loggingOut\}/);
  assert.match(navSource, /loggingOut \? "Logging out…" : "Log out"/);
  assert.match(navSource, /router\.push\("\/"\)/);
  assert.match(navSource, /router\.refresh\(\)/);
});
