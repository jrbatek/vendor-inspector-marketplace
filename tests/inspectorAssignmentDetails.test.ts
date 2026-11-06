import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const detail = fs.readFileSync("components/InspectorDemoAssignment.tsx", "utf8");
const demo = fs.readFileSync("app/demo/inspector/page.tsx", "utf8");
test("all three active demo assignments open details instead of a notice", () => {
  for (const project of ["LNG Compressor Package", "Gulf Horizon Refinery Upgrade", "Orion Deepwater Platform"]) assert.ok(detail.includes(`"${project}":`));
  assert.match(demo, /onClick=\{\(\)=>setAssignment\(a\[0\]\)\}/);
  assert.match(demo, /<InspectorDemoAssignment project=\{assignment\}/);
  assert.match(demo, /setAssignment\(project\);setSection\("assignments"\)/);
});
test("synthetic assignment workspace includes evidence and next actions", () => {
  for (const label of ["Site contact", "Scope / purchase order", "Documents", "Completed actions", "Outstanding items / next action", "Due:", "Owner:", "Findings & NCRs", "example.invalid"]) assert.ok(detail.includes(label), label);
  assert.match(detail, /\/api\/demo\/report\?/);
  assert.match(detail, /new URLSearchParams\(\{ project, supplier: detail.vendor/);
});
test("section navigation clears opportunity outcome banners", () => {
  assert.match(demo, /onClick=\{\(\)=>\{setNotice\(""\);setNoticeSection\(null\);setOpp\(null\);setSection\(s\)\}\}/);
  assert.match(demo, /notice && noticeSection === section/);
});
