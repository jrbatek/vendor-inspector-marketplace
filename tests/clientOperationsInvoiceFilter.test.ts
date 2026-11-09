import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const src=readFileSync("app/demo/client-operations/page.tsx","utf8");
const smoke=readFileSync("scripts/smoke-demo-control-visibility.mjs","utf8");

test("Client Demo invoice filter is local, accessible and keeps full portfolio totals separate",()=>{
 assert.match(src,/useState\("All"\)/);
 assert.match(src,/const visibleInvoices=useMemo/);
 assert.match(src,/invoice\.status===invoiceStatus/);
 assert.match(src,/htmlFor="invoice-status-filter"/);
 assert.match(src,/id="invoice-status-filter"/);
 assert.match(src,/Showing \{visibleInvoices\.length\} of \{invoices\.length\} synthetic invoices/);
 assert.match(src,/visibleInvoices\.map\(r=>/);
 assert.match(src,/setExpanded\(null\)/);
 assert.match(src,/\.invoiceFilters button:focus-visible/);
 assert.match(src,/\.invoiceFilters select:focus-visible/);
 assert.doesNotMatch(src,/fetch\(.*invoiceStatus/);
});

test("Client Operations browser smoke verifies invoice status filtering and reset at mobile and desktop sizes",()=>{
 assert.match(smoke,/invoiceFilter\.selectOption\("Paid"\)/);
 assert.match(smoke,/article\.invoice"\)\.count\(\) !== 2/);
 assert.match(smoke,/invoiceFilter\.selectOption\("Awaiting approval"\)/);
 assert.match(smoke,/article\.invoice"\)\.count\(\) !== 1/);
 assert.match(smoke,/Clear invoice filter/);
 assert.match(smoke,/article\.invoice"\)\.count\(\) !== 4/);
});
