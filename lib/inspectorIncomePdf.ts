import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

/** Browser-only, non-authoritative income document for hard-coded fictional demo rows. */
export type SyntheticIncomeEntry = {
  id: string;
  year: number;
  client: string;
  project: string;
  type: "Contractor" | "Employee";
  gross: number;
  paid: string;
};

export function summarizeSyntheticIncome(rows: readonly SyntheticIncomeEntry[], year: number) {
  if (![2024, 2025, 2026].includes(year)) throw new Error("Unsupported demo year");
  const selected = rows.filter(row => row.year === year);
  return {
    selected,
    gross: selected.reduce((sum, row) => sum + row.gross, 0),
    contractor: selected.filter(row => row.type === "Contractor").reduce((sum, row) => sum + row.gross, 0),
    employee: selected.filter(row => row.type === "Employee").reduce((sum, row) => sum + row.gross, 0),
  };
}

const safeText = (value: string) =>
  value.normalize("NFKD").replace(/[^\x20-\x7E]/g, "?").slice(0, 92);

/** Generates a real sample PDF in the browser. No requests, file upload, banking or real tax data. */
export async function createSyntheticIncomeReportPdf(
  rows: readonly SyntheticIncomeEntry[],
  year: number,
  dataThrough: string,
): Promise<string> {
  const result = summarizeSyntheticIncome(rows, year);
  const pdf = await PDFDocument.create();
  pdf.setTitle("InspectSource - FICTIONAL income report " + year);
  pdf.setAuthor("InspectSource Synthetic Demo");
  pdf.setSubject("UNVERIFIED SAMPLE; " + year + "; " + result.selected.length + " fictional assignments");
  const page = pdf.addPage([612, 792]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(0.08, 0.18, 0.2);
  const teal = rgb(0.05, 0.46, 0.42);
  const draw = (value: string, y: number, size = 10, heavy = false) =>
    page.drawText(safeText(value), { x: 40, y, size, font: heavy ? bold : font, color: heavy ? teal : ink, maxWidth: 530 });
  draw("INSPECTSOURCE - FICTIONAL DEMO SAMPLE", 747, 18, true);
  draw("SAMPLE / NOT VERIFIED / NOT VALID FOR FINANCIAL USE", 713, 11, true);
  draw("Synthetic income report - " + year + (year === 2026 ? " year to date" : " completed demo year"), 681, 14, true);
  draw("Fixed fictional data snapshot through: " + dataThrough, 654);
  draw("Gross amounts only; no taxes, deductions or reimbursements calculated.", 632);
  draw("All companies, projects, assignments and payments are invented.", 611);
  draw("Fictional gross: USD " + result.gross.toLocaleString("en-US"), 579, 12, true);
  draw("Contractor: USD " + result.contractor.toLocaleString("en-US") +
    "   Employee: USD " + result.employee.toLocaleString("en-US"), 555);
  draw("Selected-year fictional assignments (" + result.selected.length + ")", 520, 12, true);
  let y = 494;
  for (const row of result.selected) {
    draw(row.id + " | " + row.client + " | " + row.project, y);
    draw(row.type + " | USD " + row.gross.toLocaleString("en-US") + " | fictional paid " + row.paid, y - 17);
    y -= 47;
  }
  draw("No independent verification, filing or real payment has occurred.", Math.max(y - 12, 90), 10, true);
  draw("NOT an IRS form, work verification, pay stub or credit document.", 52, 10, true);
  return pdf.saveAsBase64({ dataUri: true });
}
