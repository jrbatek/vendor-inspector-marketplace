import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {AGENCY_DEMO_CONTRACTS,createAgencyDemoContractPdf} from "../lib/agencyDemoContracts";
const agency=readFileSync("app/demo/agency/page.tsx","utf8");
const panel=readFileSync("components/AgencyContractsPanel.tsx","utf8");
test("three individual named fictional agreements have stable IDs, scope and complete terms",()=>{
 assert.equal(AGENCY_DEMO_CONTRACTS.length,3);
 assert.equal(new Set(AGENCY_DEMO_CONTRACTS.map(c=>c.id)).size,3);
 for(const c of AGENCY_DEMO_CONTRACTS){
  assert.match(c.id,/^SYN-MSA-2026-00[1-3]$/);
  assert.ok(c.effective<c.expiry);
  for(const field of ["client","agreement","status","scope","geography","dayRate","paymentTerms","expenses","overtime"])assert.ok(c[field as keyof typeof c]);
 }
});
test("one-page Agency contracts are expandable, downloadable, clearly synthetic",()=>{
 assert.match(agency,/id="contracts-commercials" className="card"><AgencyContractsPanel\/>/);
 assert.match(panel,/aria-expanded=\{opened===contract\.id\}/);
 assert.match(panel,/Download fictional PDF/);
 assert.match(panel,/createAgencyDemoContractPdf\(contract\)/);
 assert.match(panel,/SYNTHETIC SAMPLE ONLY/);
 assert.doesNotMatch(panel,/supabase|fetch\(|localStorage|OAuth|bankAccount/);
});
test("browser-generated sample PDFs contain explicit fictional metadata without real data",async()=>{
 const url=await createAgencyDemoContractPdf(AGENCY_DEMO_CONTRACTS[0]);
 assert.ok(url.startsWith("data:application/pdf;base64,"));
 const {PDFDocument}=await import("pdf-lib");
 const pdf=await PDFDocument.load(Buffer.from(url.split(",")[1],"base64"));
 assert.equal(pdf.getPageCount(),1);
 assert.match(pdf.getTitle()||"",/SYNTHETIC SAMPLE/);
 assert.match(pdf.getSubject()||"",/FICTIONAL \/ NOT SIGNED/);
});
