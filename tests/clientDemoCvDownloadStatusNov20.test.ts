import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const card = readFileSync("components/ClientDemoCandidateResults.tsx", "utf8");
const browser = readFileSync("scripts/smoke-client-inspections.mjs", "utf8");

test("fictional Client CV download has truthful, legible and accessible result feedback", () => {
  assert.match(card, /useState<"idle" \| "loading" \| "success" \| "error">\("idle"\)/);
  assert.match(card, /setDownloadState\("loading"\)/);
  assert.match(card, /setDownloadState\("success"\)/);
  assert.match(card, /downloadState === "success" && <p className="downloadStatus" role="status">Fictional CV PDF prepared/);
  assert.match(card, /downloadState === "error" && <p className="downloadStatus error" role="alert">The PDF could not be prepared/);
  assert.match(card, /\.cv \.downloadStatus \{margin:10px 0;color:#115e59;font-weight:700\}/);
  assert.match(card, /\.cv \.downloadStatus\.error \{color:#991b1b\}/);
  assert.match(card, /disabled=\{downloadState === "loading"\}/);
  assert.match(card, /Download CV \(PDF\)/);
  assert.match(browser, /waitForEvent\("download"\)/);
  assert.match(browser, /Downloaded candidate CV is not a complete PDF/);
});
