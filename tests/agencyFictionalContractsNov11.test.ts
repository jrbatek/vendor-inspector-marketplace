import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {AGENCY_DEMO_CONTRACTS,createAgencySyntheticContractPdf} from "../lib/agencyDemoContracts";

test("fictional Agency client agreements have unique IDs, named synthetic clients and dated terms",()=>{
  assert.ok(AGENCY_DEMO_CONTRACTS.length>=3);
  assert.equal(new Set(AGENCY_DEMO_CONTRACTS.map(c=>c.id)).size,AGENCY_DEMO_CONTRACTS.length);
  for(const record of AGENCY_DEMO_CONTRACTS){
    assert.match(record.id,/^SYN-MSA-\d{4}$/);
    assert.ok(record.client&&record.agency&&record.agreement&&record.scope);
    assert.match(record.effective,/^\d{4}-\d{2}-\d{2}$/);
    assert.match(record.expires,/^\d{4}-\d{2}-\d{2}$/);
    assert.ok(record.expires>=record.effective);
    assert.ok(record.dayRate&&record.paymentTerms&&record.travel&&record.overtime);
    assert.match(record.approval,/Fictional/);
  }
});

test("contract PDF generation is a real, clearly labeled, browser-only sample",async()=>{
  const sample=await createAgencySyntheticContractPdf(AGENCY_DEMO_CONTRACTS[0]);
  assert.match(sample,/^data:application\/pdf;base64,/);
  const pdfBytes=Buffer.from(sample.split(",")[1],"base64");
  assert.equal(pdfBytes.subarray(0,5).toString("ascii"),"%PDF-");
  assert.ok(pdfBytes.length>1000);
  await assert.rejects(()=>createAgencySyntheticContractPdf({...AGENCY_DEMO_CONTRACTS[0],id:"UNKNOWN"}),/Unknown fictional contract/);
});

test("portfolio renders a browsable synthetic contract list with fictional PDF downloads, no real acceptance",()=>{
  const source=readFileSync("components/AgencyDemoContractPortfolio.tsx","utf8");
  assert.match(source,/Synthetic named client-agency contracts/);
  assert.match(source,/aria-expanded=\{selected===contract.id\}/);
  assert.match(source,/View contract/);
  assert.match(source,/Download fictional contract PDF/);
  assert.match(source,/No signature, authorization, legal or commercial commitment/);
  assert.doesNotMatch(source,/fetch\(|supabase|createClient|signDocument|stripe|\.insert\(/i);
});
