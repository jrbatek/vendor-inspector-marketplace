import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const client=fs.readFileSync("app/demo/client/page.tsx","utf8");
test("Client single-page Email Requirements includes actionable on-page guidance",()=>{
 assert.match(client,/id="email-requirements"/);
 assert.match(client,/inspectsource2026@gmail\.com/);
 assert.match(client,/Copy Sample Request/);
 assert.match(client,/navigator\.clipboard\.writeText\(message\)/);
 assert.match(client,/Opening the email app does not send anything automatically/);
 assert.match(client,/PDF, DOCX, XLSX, CSV, TXT, JPG, PNG/);
});
test("Client single-page Structured Selection has keyboard-usable browser-local filters",()=>{
 assert.match(client,/id="structured-selection"/);
 for(const label of ["Geography","Required certification","Inspection start","Minimum experience","Inspector source"])assert.ok(client.includes(label),label);
 assert.match(client,/aria-label="Structured inspector criteria \(demo\)"/);
 assert.match(client,/onSubmit=\{e=>\{e.preventDefault\(\);setCriteriaPreview/);
 assert.match(client,/No matching, commercial offer or production request was created/);
 assert.match(client,/\.intakeFields select:focus-visible,\.intakeFields input:focus-visible/);
 assert.doesNotMatch(client,/FormData|fetch\(|\.insert\(|supabaseBrowser/i);
});
