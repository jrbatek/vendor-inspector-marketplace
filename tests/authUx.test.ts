import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const registerSource = fs.readFileSync(path.join(process.cwd(), "app/register/page.tsx"), "utf8");

test("registration password guidance matches the enforced client-side minimum", () => {
  assert.match(registerSource, /const MIN_PASSWORD_LENGTH = 6/);
  assert.match(registerSource, /minLength=\{MIN_PASSWORD_LENGTH\}/);
  assert.match(registerSource, /Use at least \{MIN_PASSWORD_LENGTH\} characters/);
  assert.match(registerSource, /aria-describedby="password-policy"/);
});
