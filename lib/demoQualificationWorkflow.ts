import { INSPECTOR_QUALIFICATION_CATALOG, type QualificationCategory } from "./inspector-qualification-catalog";

export const DEMO_DOCUMENT_AS_OF = "2026-11-05";
export const MAX_SAMPLE_FILE_BYTES = 5 * 1024 * 1024;
export type SampleFileMetadata = { name: string; type: string; size: number };
export type QualificationDraft = { qualificationId: string; issued: string; expires: string };
export type QualificationEvidence = QualificationDraft & { verified: boolean };
export type DemoRegion = "US Gulf Coast" | "UK North Sea";
export const DEMO_FOCUS_AREAS: QualificationCategory[] = ["Piping", "Pressure equipment", "Welding", "Coatings", "Offshore"];

export function validDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value))
    && new Date(value).toISOString().slice(0, 10) === value;
}

export function validateQualificationDraft(draft: QualificationDraft) {
  if (!INSPECTOR_QUALIFICATION_CATALOG.some(item => item.id === draft.qualificationId)) return "Choose a qualification from the catalogue.";
  if (!validDate(draft.issued) || !validDate(draft.expires)) return "Enter valid issue and expiry dates.";
  if (draft.issued > DEMO_DOCUMENT_AS_OF) return "The issue date cannot be after the demo snapshot date.";
  if (draft.expires <= draft.issued) return "Expiry must be after the issue date.";
  return "";
}

export function validateSampleFile(file: SampleFileMetadata, header: Uint8Array) {
  if (file.size <= 0) return "Choose a non-empty sample file.";
  if (file.size > MAX_SAMPLE_FILE_BYTES) return "The sample file must be 5 MB or smaller.";
  const extension = file.name.split(".").pop()?.toLowerCase();
  const ascii = (start: number, end: number) => String.fromCharCode(...Array.from(header.slice(start, end)));
  const pdf = extension === "pdf" && file.type === "application/pdf" && ascii(0, 5) === "%PDF-";
  const png = extension === "png" && file.type === "image/png" && [137, 80, 78, 71, 13, 10, 26, 10].every((byte, i) => header[i] === byte);
  const jpeg = ["jpg", "jpeg"].includes(extension || "") && file.type === "image/jpeg" && header[0] === 255 && header[1] === 216 && header[2] === 255;
  const webp = extension === "webp" && file.type === "image/webp" && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP";
  return pdf || png || jpeg || webp ? "" : "Choose a PDF, PNG, JPEG or WebP sample with matching file contents.";
}

export function expiryStatus(expires: string) {
  if (!validDate(expires)) return "Unknown expiry";
  const days = (Date.parse(expires) - Date.parse(DEMO_DOCUMENT_AS_OF)) / 86400000;
  return days < 0 ? "Expired" : days <= 90 ? "Expiring soon" : "Current";
}

// Fictional request mentions, not production demand or eligibility/earnings forecasts.
const DEMAND: Record<DemoRegion, Record<string, number>> = {
  "US Gulf Coast": { "api-510": 48, "api-570": 58, "api-653": 39, "aws-cwi": 46, "ampp-cip": 32, "api-936": 18, "api-686": 26, "cswip-31": 12, "bosieth": 16 },
  "UK North Sea": { "api-510": 30, "api-570": 28, "api-653": 16, "aws-cwi": 21, "ampp-cip": 33, "api-936": 11, "api-686": 24, "cswip-31": 55, "bosieth": 51 },
};

export function recommendDemoQualifications(region: DemoRegion, focus: QualificationCategory, evidence: QualificationEvidence[]) {
  const held = new Set(evidence.filter(item => item.verified && validDate(item.issued) && validDate(item.expires)
    && item.issued <= DEMO_DOCUMENT_AS_OF && item.expires >= DEMO_DOCUMENT_AS_OF).map(item => item.qualificationId));
  return INSPECTOR_QUALIFICATION_CATALOG.filter(item => !held.has(item.id) && (DEMAND[region][item.id] || 0) > 0)
    .map(item => ({ ...item, requestMentions: DEMAND[region][item.id], focusMatch: item.category === focus,
      score: DEMAND[region][item.id] + (item.category === focus ? 30 : 0) }))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).slice(0, 4);
}
