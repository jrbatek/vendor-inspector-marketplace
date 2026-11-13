import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const client = fs.readFileSync("app/demo/client/page.tsx", "utf8");
const boundary = fs.readFileSync("components/ClientAnalyticsEmbedBoundary.tsx", "utf8");

test("Client continuous Demo contains an isolated embedded Analytics error boundary", () => {
  assert.match(client, /import ClientAnalyticsEmbedBoundary from/);
  assert.match(client, /<ClientAnalyticsEmbedBoundary><ClientAnalyticsDemo\/><\/ClientAnalyticsEmbedBoundary>/);
  assert.ok(client.indexOf("<ClientInspectionsDemo/>") < client.indexOf("<ClientAnalyticsEmbedBoundary>"));
  assert.ok(client.indexOf("<ClientAnalyticsEmbedBoundary>") < client.indexOf("<ClientOperationsDemo/>"));
  assert.match(boundary, /static getDerivedStateFromError\(error: Error\)/);
  assert.match(boundary, /this\.setState\(\{ error: null \}\)/);
});

test("Embedded Analytics failure keeps fictional Client Workspace usable with no production login", () => {
  for (const phrase of [
    "Inspections in Progress", "Billing, Contracts and Profile",
    "Try analytics again", "Technical details for troubleshooting",
    'href="#inspections-in-progress"', 'href="/demo/client-analytics"',
  ]) assert.ok(boundary.includes(phrase), phrase);
  assert.match(boundary, /aria-labelledby="embedded-analytics-recovery-title"/);
  assert.match(boundary, /role="alert"/);
  assert.match(boundary, /\.slice\(0, 4000\)/);
  assert.match(boundary, /nothing is automatically submitted/);
  assert.doesNotMatch(boundary, /supabase|fetch\(|sendBeacon|\/client-dashboard|href="\/login"/);
});
