import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const page=readFileSync("app/demo/client/page.tsx","utf8");
test("both public Client preview actions wait for client hydration and retain legible disabled styling",()=>{
 assert.match(page,/useState\(false\)/);
 assert.match(page,/useEffect\(\(\)=>setHydrated\(true\),\[\]\)/);
 assert.match(page,/onClick=\{previewNaturalRequest\} disabled=\{!hydrated\}/);
 assert.match(page,/type="submit" className="primaryButton actionable" disabled=\{!hydrated\}/);
 assert.match(page,/\.actionable:disabled\{[^}]*color:#334155[^}]*opacity:1/);
});
