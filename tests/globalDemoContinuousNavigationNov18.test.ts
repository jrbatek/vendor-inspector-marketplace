import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { demoNavigationHref } from "../lib/demoExperience";

const nav=fs.readFileSync("components/Nav.tsx","utf8");
const client=fs.readFileSync("app/demo/client/page.tsx","utf8");
const inspector=fs.readFileSync("app/demo/inspector/page.tsx","utf8");
const clientSidebar=fs.readFileSync("components/ClientContinuousSidebar.tsx","utf8");

test("global demo links honor the single-page Client and Inspector architectures",()=>{
 for(const [label,href] of [
  ["Inspections in Progress Demo","/demo/client#inspections-in-progress"],
  ["Client Analytics Demo","/demo/client#analytics"],
  ["Client Operations Demo","/demo/client#billing-payment"],
  ["Work History Demo","/demo/inspector#work"],
 ]) {
   assert.ok(nav.includes(JSON.stringify([label,href]).replace(", ",", ")),label+" missing continuous demo anchor");
 }
 for(const id of ["inspections-in-progress","analytics"])assert.ok(client.includes('id="'+id+'"'),id+" missing Client section");
 assert.ok(clientSidebar.includes('"billing-payment"'),"Billing anchor not present in Client sidebar");
 for(const id of ["work","calendar","opportunities","qualifications","income"]) {
   assert.ok(inspector.includes('id="'+id+'"'),id+" missing Inspector section");
 }
});

test("legacy demo links from global menus resolve into canonical mounted sections",()=>{
 const links:Record<string,string>={
  "/demo/client-inspections":"/demo/client#inspections-in-progress",
  "/demo/client-analytics":"/demo/client#analytics",
  "/demo/client-operations":"/demo/client#billing-payment",
  "/demo/inspector-work-history":"/demo/inspector#work",
  "/demo/inspector-income":"/demo/inspector#income",
  "/demo/inspector-documents":"/demo/inspector#qualifications",
  "/demo/inspector-reports":"/demo/inspector#work",
  "/inspectorhub/schedule":"/demo/inspector#calendar",
  "/inspector-inquiries":"/demo/inspector#opportunities",
  "/inspection-reports":"/demo/inspector#work",
  "/inspection-intelligence":"/demo/client#analytics",
  "/equipment-intelligence":"/demo/client#analytics",
  "/asset-intelligence":"/demo/client#analytics",
  "/email-requirements?demo=1":"/demo/client#email-requirements",
 };
 for(const [from,to] of Object.entries(links)){
  assert.equal(demoNavigationHref(from),to,from);
  assert.ok(to.startsWith("/demo/"),from+" escaped to live account");
 }
 // Dedicated detailed demo URLs are still shareable outside the global menu.
 assert.equal(demoNavigationHref("/demo/client-data"),"/demo/client-data");
 assert.equal(demoNavigationHref("/demo/agency-resources"),"/demo/agency-resources");
 assert.equal(demoNavigationHref("/demo/agency#resource-pool"),"/demo/agency#resource-pool");
 assert.equal(demoNavigationHref("/find-inspectors"),"/demo/client");
});
