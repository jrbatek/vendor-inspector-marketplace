import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const homepage = fs.readFileSync("app/page.tsx","utf8");

test("homepage retains required audience order Clients then Inspectors then Agencies",()=>{
  const clients=homepage.indexOf("For Clients");
  const inspectors=homepage.indexOf("For Inspectors");
  const agencies=homepage.indexOf("For Agencies");
  assert.ok(clients>=0 && clients<inspectors && inspectors<agencies);
});

test("public Explore links open no-login synthetic demo experiences",()=>{
  assert.match(homepage,/href="\/demo\/client">Explore Client Workspace Demo/);
  assert.match(homepage,/href="\/demo\/inspector">Explore InspectorHub Demo/);
  assert.match(homepage,/href="\/demo\/agency">Explore Agency Workspace/);
  assert.match(homepage,/href="\/demo\/client">Open Client Demo/);
  assert.match(homepage,/href="\/demo\/inspector">Open Inspector Demo/);
  assert.match(homepage,/href="\/demo\/agency">Open Agency Demo/);
  assert.doesNotMatch(homepage,/href="\/client-dashboard"/);
  assert.doesNotMatch(homepage,/href="\/inspectorhub"/);
  assert.match(homepage,/Demo experiences use synthetic records/);
});

test("explicit production actions remain separate from demo exploration",()=>{
  assert.match(homepage,/href="\/find-inspectors">Find Inspectors/);
  assert.match(homepage,/href="\/register">Join as an Inspector/);
});
