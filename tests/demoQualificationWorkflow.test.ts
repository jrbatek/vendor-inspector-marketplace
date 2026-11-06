import assert from "node:assert/strict";
import test from "node:test";
import { validateQualificationDraft, validateSampleFile, MAX_SAMPLE_FILE_BYTES, expiryStatus, recommendDemoQualifications } from "../lib/demoQualificationWorkflow";

const draft = { qualificationId: "api-510", issued: "2025-01-01", expires: "2028-01-01" };
const ascii = (text: string) => new TextEncoder().encode(text);

test("qualification date validation rejects impossible, future and reversed dates", () => {
  assert.equal(validateQualificationDraft(draft), "");
  for (const changed of [ { issued: "2025-02-30" }, { issued: "2026-11-06" }, { expires: "2024-12-31" }, { expires: draft.issued }, { expires: "" }, { qualificationId: "invented" } ]) {
    assert.ok(validateQualificationDraft({ ...draft, ...changed }));
  }
  assert.equal(validateQualificationDraft({ ...draft, issued: "2024-02-29" }), "");
});

test("sample file checks require bounded size and matching extension MIME and signature", () => {
  const pdf = { name: "sample.pdf", type: "application/pdf", size: 100 };
  assert.equal(validateSampleFile(pdf, ascii("%PDF-1.7")), "");
  assert.equal(validateSampleFile({ ...pdf, size: MAX_SAMPLE_FILE_BYTES }, ascii("%PDF-1.7")), "");
  for (const metadata of [ { ...pdf, size: 0 }, { ...pdf, size: MAX_SAMPLE_FILE_BYTES + 1 }, { ...pdf, name: "sample.exe" }, { ...pdf, type: "text/html" } ]) {
    assert.ok(validateSampleFile(metadata, ascii("%PDF-1.7")));
  }
  assert.ok(validateSampleFile(pdf, ascii("<html>")));
  assert.equal(validateSampleFile({ name: "sample.png", type: "image/png", size: 100 }, new Uint8Array([137,80,78,71,13,10,26,10])), "");
  assert.equal(validateSampleFile({ name: "sample.jpeg", type: "image/jpeg", size: 100 }, new Uint8Array([255,216,255])), "");
  assert.equal(validateSampleFile({ name: "sample.webp", type: "image/webp", size: 100 }, ascii("RIFF0000WEBP")), "");
  assert.ok(validateSampleFile({ name: "sample.svg", type: "image/svg+xml", size: 100 }, ascii("<svg>")));
});

test("expiry badges use a deterministic snapshot and include the expiry day", () => {
  assert.equal(expiryStatus("2026-11-04"), "Expired");
  assert.equal(expiryStatus("2026-11-05"), "Expiring soon");
  assert.equal(expiryStatus("2027-02-03"), "Expiring soon");
  assert.equal(expiryStatus("2027-02-04"), "Current");
  assert.equal(expiryStatus("not-a-date"), "Unknown expiry");
});

test("recommendations rank regional demand and chosen focus without inventing eligibility", () => {
  const gulf = recommendDemoQualifications("US Gulf Coast", "Pressure equipment", []);
  const uk = recommendDemoQualifications("UK North Sea", "Offshore", []);
  assert.equal(gulf[0].id, "api-510");
  assert.equal(uk[0].id, "bosieth");
  assert.equal(new Set(gulf.map(item => item.id)).size, gulf.length);
  for (const row of gulf) { assert.ok(row.requestMentions > 0); assert.match(row.requirementsUrl, /^https:\/\//); assert.ok(row.evidenceHints.length); }
});

test("pending or expired evidence cannot count as a verified held qualification", () => {
  const current = { ...draft, verified: true };
  assert.ok(!recommendDemoQualifications("US Gulf Coast", "Pressure equipment", [current]).some(item => item.id === "api-510"));
  for (const record of [{ ...current, verified: false }, { ...current, expires: "2025-12-31" }, { ...current, issued: "2027-01-01" }]) {
    assert.ok(recommendDemoQualifications("US Gulf Coast", "Pressure equipment", [record]).some(item => item.id === "api-510"));
  }
});
