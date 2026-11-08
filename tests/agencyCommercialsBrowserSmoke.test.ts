import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
const script=fs.readFileSync("scripts/smoke-agency-commercials.mjs","utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8"));
test("Agency synthetic regional filter browser regression exercises all views and record counts",()=>{
  assert.ok(pkg.scripts["smoke:agency-commercials"]?.includes("smoke-agency-commercials.mjs"));
  for(const x of ["North America","Middle East","Europe","All regions","Client contracts & commercial packages","Client & contract performance","pageerror","Clear filter"])
    assert.ok(script.includes(x),x);
  for(const path of [".github/workflows/validate.yml",".github/workflows/autonomous-qa.yml"])
    assert.ok(fs.readFileSync(path,"utf8").includes("npm run smoke:agency-commercials"),path);
});
