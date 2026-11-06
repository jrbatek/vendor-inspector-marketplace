import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
const page=fs.readFileSync("app/demo/inspector/page.tsx","utf8");

test("Opportunity Declined success/error notices stay in their originating InspectorHub section",()=>{
 assert.match(page,/const \[noticeSection,setNoticeSection\]=useState<Section\|null>\(null\)/);
 assert.match(page,/setNoticeSection\(section\)/);
 assert.match(page,/notice && noticeSection === section/);
 assert.match(page,/setNoticeSection\(null\);setOpp\(null\);setSection\(s\)/);
 assert.match(page,/setNotice\(""\)/);
});
test("each preview and region change resets stale opportunity notice, with no live writes",()=>{
 assert.match(page,/setNotice\(""\);setNoticeSection\(null\);setOpp\(o\)/);
 assert.match(page,/setRegion\(e\.target\.value as Region\);setNotice\(""\);setNoticeSection\(null\)/);
 assert.match(page,/Opportunity declined/);
 assert.doesNotMatch(page,/supabaseBrowser|\.insert\(|\.update\(|fetch\(/);
});
