import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const sidebar = readFileSync("components/ClientWorkspaceSidebar.tsx", "utf8");
const browser = readFileSync("scripts/smoke-client-inspections.mjs", "utf8");

test("P0-B all nested Client Demo sidebar links remain visible at short desktop heights", () => {
  for (const marker of [
    ".clientSide{position:sticky;top:18px;height:max-content;max-height:calc(100vh - 36px);overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin",
    "@media(max-width:980px){.clientSide{position:static;max-height:none;overflow:visible}}",
    'href={profileHref}>Profile</Link>',
  ]) assert.ok(sidebar.includes(marker),"Sidebar must remain accessible: "+marker);
  for (const marker of [
    "width:1024,height:400",
    "sideGeometry.scrollHeight>sideGeometry.clientHeight",
    'getByRole("link",{name:"Profile",exact:true})',
    "profileLink.scrollIntoViewIfNeeded()",
    "linkGeometry.scrollTop>0",
    'mobileSidebar.position==="static"',
  ]) assert.ok(browser.includes(marker),"Chromium short viewport regression missing: "+marker);
});
