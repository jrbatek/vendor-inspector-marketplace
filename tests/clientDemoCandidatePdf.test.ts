import assert from "node:assert/strict";
import test from "node:test";
import { decodePDFRawStream, PDFArray, PDFDocument, PDFName, PDFRawStream } from "pdf-lib";
import { createDemoCandidatePdf } from "../lib/clientDemoCandidatePdf";
import { getDemoCandidates } from "../lib/clientDemoCandidates";

test("each Houston candidate downloads a readable CV containing their own experience, availability and rate", async () => {
  const candidates = getDemoCandidates("API 570 inspectors in Houston starting December 7 for three weeks");
  assert.ok(candidates.length >= 2);
  for (const candidate of candidates) {
    const pdf = await PDFDocument.load(await createDemoCandidatePdf(candidate));
    assert.equal(pdf.getPageCount(), 1);
    assert.ok(pdf.getTitle()?.includes(candidate.id));
    // Text drawn using StandardFonts is stored as Windows-1252 hex strings in the page stream.
    const contents = pdf.getPage(0).node.lookup(PDFName.of("Contents"), PDFArray);
    const stream = contents.lookup(0, PDFRawStream);
    const operators = Buffer.from(decodePDFRawStream(stream).decode()).toString("ascii");
    const decoder = new TextDecoder("windows-1252");
    const words = Array.from(operators.matchAll(/<([\da-f]+)> Tj/gi), match => decoder.decode(Buffer.from(match[1], "hex")));
    const pageText = words.join(" ").replace(/\s+/g, " ");
    for (const detail of [
      candidate.id, candidate.title, candidate.location, candidate.yearsExperience + " years of experience",
      candidate.summary, ...candidate.credentials, ...candidate.workHistory, candidate.availability,
      candidate.shifts, "USD " + candidate.dayRateUsd.toLocaleString("en-US") + " per day", "Fictional candidate",
    ]) {
      assert.ok(pageText.includes(detail), `Missing ${detail} in the CV for ${candidate.id}`);
    }
  }
});
