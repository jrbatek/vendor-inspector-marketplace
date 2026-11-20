import { breakTextIntoLines, PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { DemoCandidate } from "./clientDemoCandidates";

export async function createDemoCandidatePdf(candidate: DemoCandidate): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Candidate ${candidate.id} CV | InspectSource demo`);
  pdf.setAuthor("InspectSource");
  pdf.setSubject("Fictional inspector profile");
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(0.07, 0.15, 0.25);
  const teal = rgb(0.01, 0.36, 0.39);
  const margin = 48;
  const newPage = () => pdf.addPage([612, 792]);
  let page = newPage();
  let y = 736;

  function write(value: string, size = 11, font = regular, color = ink) {
    const lines = breakTextIntoLines(value, [" "], 612 - 2 * margin, text => font.widthOfTextAtSize(text, size));
    for (const line of lines) {
      if (y < 68) {
        page = newPage();
        y = 736;
      }
      page.drawText(line.trimEnd(), { x: margin, y, font, size, color });
      y -= size + 5;
    }
  }

  function heading(title: string) {
    y -= 12;
    write(title, 13, bold, teal);
  }

  write("InspectSource  /  Candidate CV", 12, bold, teal);
  y -= 12;
  write(candidate.title, 23, bold);
  write(`${candidate.id}   |   ${candidate.location}   |   ${candidate.yearsExperience} years of experience`);

  heading("Professional summary");
  write(candidate.summary);
  heading("Credentials");
  write(candidate.credentials.join("  /  "));
  heading("Selected work history");
  for (const assignment of candidate.workHistory) {
    write(assignment);
    y -= 5;
  }
  heading("Availability and rates");
  write(candidate.availability);
  write(candidate.shifts);
  write(`Day rate: USD ${candidate.dayRateUsd.toLocaleString("en-US")} per day`);

  pdf.getPages().forEach((sheet, index) => {
    sheet.drawLine({ start: { x: margin, y: 53 }, end: { x: 612 - margin, y: 53 }, thickness: 0.7, color: teal });
    sheet.drawText(`InspectSource demo   |   Fictional candidate ${candidate.id}`, { x: margin, y: 35, font: regular, size: 9, color: teal });
    sheet.drawText(String(index + 1), { x: 555, y: 35, font: regular, size: 9, color: ink });
  });
  return pdf.save();
}
