/** Browser-local, aggregate-only preview for the Agency Demo. No identity data is returned. */
export type AgencyRosterCsvPreview = {
  totalRows: number;
  validRows: number;
  reviewRows: number;
  duplicateIds: number;
};

function csvRows(text: string): string[][] {
  if (!text.trim()) throw new Error("The CSV file is empty.");
  if (text.length > 512_000) throw new Error("This demo previews CSV files up to 500 KB.");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const addRow = () => {
    row.push(field.trim());
    if (row.some(value => value.length > 0)) rows.push(row);
    row = [];
    field = "";
  };
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { field += '"'; i++; }
      else if (quoted) quoted = false;
      else if (!field.trim()) quoted = true;
      else throw new Error("Invalid CSV quoting. Export a standard UTF-8 CSV file.");
    } else if (!quoted && char === ",") {
      row.push(field.trim());
      field = "";
    } else if (!quoted && (char === "\n" || char === "\r")) {
      addRow();
      if (char === "\r" && text[i + 1] === "\n") i++;
    } else {
      field += char;
    }
  }
  if (quoted) throw new Error("The CSV has an unfinished quoted field.");
  if (row.length || field) addRow();
  if (rows.length > 2001) throw new Error("This demo previews at most 2,000 roster rows.");
  return rows;
}

export function previewAgencyRosterCsv(text: string): AgencyRosterCsvPreview {
  const [rawHeader, ...rows] = csvRows(text);
  if (!rawHeader) throw new Error("The CSV must include a header row.");
  const headers = rawHeader.map(value => value.replace(/^\uFEFF/, "").trim().toLowerCase());
  const required = ["inspector id", "name", "relationship", "country", "affiliation status"];
  const positions = required.map(value => headers.indexOf(value));
  if (positions.some(index => index < 0)) {
    throw new Error("Expected headers: Inspector ID, Name, Relationship, Country, Affiliation Status.");
  }
  if (!rows.length) throw new Error("The roster has no resource rows.");
  let validRows = 0;
  let duplicateIds = 0;
  const usedIds = new Set<string>();
  for (const row of rows) {
    const id = row[positions[0]]?.trim().toLowerCase() ?? "";
    const complete = positions.every(index => (row[index] ?? "").trim().length > 0);
    if (id && usedIds.has(id)) duplicateIds++;
    if (complete && !usedIds.has(id)) validRows++;
    if (id) usedIds.add(id);
  }
  return {totalRows: rows.length, validRows, reviewRows: rows.length - validRows, duplicateIds};
}
