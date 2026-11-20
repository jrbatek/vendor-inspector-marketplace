import { rankInspectors, type SearchInspector } from "./clientSearch";
import { buildProjectBrief } from "./projectCoordinator";

export type DemoCandidate = {
  id: string;
  name: string;
  source: "Agency" | "Independent";
  title: string;
  location: string;
  yearsExperience: number;
  credentials: string[];
  dayRateUsd: number;
  availability: string;
  shifts: string;
  summary: string;
  workHistory: string[];
};

type DemoProfile = Omit<DemoCandidate, "availability" | "shifts"> & {
  city: string;
  availableFrom: string;
  availableThrough: string;
  maxShiftHours: number;
  specialties: string[];
};

// Anonymous fictional profiles for the Client Demo. Dates describe this sample roster.
const profiles: DemoProfile[] = [
  {
    id: "IS-1042",
    name: "Avery Calder",
    source: "Independent",
    title: "Refinery piping inspector",
    location: "Houston, Texas",
    city: "Houston",
    yearsExperience: 14,
    credentials: ["API 570", "AWS CWI", "TWIC"],
    dayRateUsd: 925,
    availableFrom: "2026-12-01",
    availableThrough: "2026-12-31",
    maxShiftHours: 12,
    specialties: ["piping", "welding", "refinery", "petrochemical", "turnaround"],
    summary: "Houston-based inspector with 14 years in refinery and petrochemical piping. Reviews inspection plans, witnesses repairs and verifies piping turnover records. Holds a current TWIC card.",
    workHistory: [
      "2025–2026 · Gulf Coast refinery turnaround · Inspected piping repairs and verified weld maps, material traceability and hydrotest packages.",
      "2022–2024 · Houston petrochemical complex · Documented corrosion monitoring locations and reviewed piping inspection reports with the owner.",
    ],
  },
  {
    id: "IS-1314",
    name: "Maya Ellison",
    source: "Agency",
    title: "Piping and pressure vessel inspector",
    location: "Houston, Texas",
    city: "Houston",
    yearsExperience: 9,
    credentials: ["API 570", "API 510", "TWIC"],
    dayRateUsd: 895,
    availableFrom: "2026-12-07",
    availableThrough: "2027-01-08",
    maxShiftHours: 12,
    specialties: ["piping", "pressure vessel", "refinery", "petrochemical", "turnaround"],
    summary: "Houston-based inspector with nine years of refinery and petrochemical turnaround work. Covers process piping and pressure vessels across the Gulf Coast and holds a current TWIC card.",
    workHistory: [
      "2024–2026 · Houston refinery · Inspected piping circuits during shutdowns and documented repair and pressure-test acceptance.",
      "2021–2023 · Gulf Coast petrochemical plant · Witnessed pressure vessel factory acceptance tests and verified the supplier’s final inspection dossier.",
    ],
  },
  {
    id: "IS-1187",
    name: "Nolan Pierce",
    source: "Agency",
    title: "Process piping inspector",
    location: "Beaumont, Texas",
    city: "Beaumont",
    yearsExperience: 11,
    credentials: ["API 570", "TWIC"],
    dayRateUsd: 875,
    availableFrom: "2027-01-04",
    availableThrough: "2027-01-29",
    maxShiftHours: 10,
    specialties: ["piping", "refinery", "petrochemical", "turnaround"],
    summary: "Beaumont-based inspector with 11 years of refinery piping inspection, including thickness surveys, repair documentation and turnaround closeout. Holds a current TWIC card.",
    workHistory: [
      "2024–2026 · Beaumont refinery · Reviewed piping repair packages and witnessed return-to-service pressure tests.",
      "2020–2023 · Southeast Texas process plant · Verified field thickness measurements and maintained corrosion monitoring records.",
    ],
  },
];

const searchableProfiles: SearchInspector[] = profiles.map(profile => {
  const references = (values: string[]) => values.map(name => ({ id: name, name }));
  return {
    inspector_id: profile.id,
    primary_discipline: profile.title,
    biography: profile.summary,
    base_city: profile.city, base_state: "Texas", base_country: "United States",
    years_experience: profile.yearsExperience, day_rate: profile.dayRateUsd, currency: "USD",
    availability_status: "Available", available_from: profile.availableFrom,
    domestic_travel: true, international_travel: false, remote_review_available: false, is_verified: null,
    certifications: references(profile.credentials.filter(value => value !== "TWIC")),
    travelCredentials: references(profile.credentials.filter(value => value === "TWIC")),
    activities: references(profile.specialties),
    equipment: [], ndtMethods: [], codes: [], industries: [], languages: [],
  };
});

const dateLabel = new Intl.DateTimeFormat("en-US", {
  month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
});
const areaNames = ["texas", "tx", "gulf coast", "us gulf coast", "usa", "united states"];
const technicalScopes = [
  { pattern: /\bpiping\b/i, specialty: "piping" },
  { pattern: /\bweld(?:s|er|ing)?\b/i, specialty: "welding" },
  { pattern: /\bpressure[ -]vessels?\b/i, specialty: "pressure vessel" },
  { pattern: /\brefiner(?:y|ies)\b/i, specialty: "refinery" },
  { pattern: /\bpetrochemical\b/i, specialty: "petrochemical" },
  { pattern: /\bturnarounds?\b/i, specialty: "turnaround" },
  { pattern: /\boffshore\b/i, specialty: "offshore" },
  { pattern: /\bcoatings?\b/i, specialty: "coatings" },
];

function demoScope(text: string) {
  // Resolve yearless named starts against the demo calendar even after the sample year.
  return text.replace(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})\b(?:,?\s+(20\d{2})\b)?/gi,
    (_, month: string, day: string, year?: string) => `${month} ${day}, ${year ?? "2026"}`)
    .replace(/\bAPI[- ]?(\d{3,4})\b/gi, "API $1");
}

function servesLocation(profile: DemoProfile, location: string | null) {
  if (!location) return true;
  const area = location.toLowerCase().trim();
  return areaNames.includes(area) || [profile.city, profile.location, `${profile.city}, TX`]
    .some(value => value.toLowerCase() === area);
}

function withinWindow(profile: DemoProfile, start: string | null, days: number | null, end: number | null) {
  if (!start) return true;
  const startTime = Date.parse(start);
  const lastDay = Math.max(startTime + ((days ?? 1) - 1) * 86400000, end ?? startTime);
  if (end !== null && end < startTime) return false;
  return start >= profile.availableFrom && Number.isFinite(lastDay)
    && lastDay <= Date.parse(profile.availableThrough);
}

export function getDemoCandidates(requestText: string): DemoCandidate[] {
  const scope = demoScope(requestText.trim());
  const brief = buildProjectBrief(scope);
  const endText = scope.match(/\b(?:to|through|until|ending)\s+(20\d{2}-\d{2}-\d{2}|[a-z]{3,9} \d{1,2}, 20\d{2})\b/i)?.[1];
  const end = endText ? Date.parse(endText.includes(",") ? endText + " UTC" : endText) : null;
  // In "for $900/day" the shared parser can capture FOR as a currency.
  const currency = ["FOR", "MAX", "PAY", "CAP", "AND", "PER"].includes(brief.maximumDayRateCurrency ?? "")
    ? "USD" : brief.maximumDayRateCurrency;
  const certifications = Array.from(new Set([
    ...brief.requiredCertifications,
    ...Array.from(scope.matchAll(/\bAPI \d{3,4}\b/gi), match => match[0].toUpperCase()),
  ]));
  const specialties = technicalScopes.filter(item => item.pattern.test(scope));
  if (!certifications.length && !specialties.length) return [];

  // The shared parser recognizes capitalized place names. Also accept a lowercase
  // location in the same common phrasing (for example, "in houston for three weeks").
  const location = brief.location ?? scope.match(/\b(?:in|near|around)\s+([a-z][a-z .'-]*?)(?=\s+(?:for|starting|beginning|with|who|and|must|on)\b|[,.]|$)/i)?.[1]?.trim() ?? null;
  const shiftHours = scope.match(/\b(\d{1,2})\s*[-–]?\s*hours?\s+shifts?\b/i);
  const maximumShift = shiftHours ? Number(shiftHours[1]) : 0;

  // Share the normal credential, rate, experience and availability gates. Only the
  // sample roster supplies full date windows, shift limits and strictly local coverage.
  const ranked = rankInspectors({
    ...brief, requiredCertifications: certifications, maximumDayRateCurrency: currency,
  }, searchableProfiles);
  const qualifyingIds = new Set(ranked.map(inspector => inspector.inspector_id));
  return profiles.filter(profile =>
    qualifyingIds.has(profile.id)
    && specialties.every(item => profile.specialties.includes(item.specialty))
    && servesLocation(profile, location)
    && withinWindow(profile, brief.startDate, brief.durationDays, end)
    && profile.maxShiftHours >= maximumShift,
  ).map(profile => ({
    ...profile,
    availability: `${dateLabel.format(Date.parse(profile.availableFrom))} – ${dateLabel.format(Date.parse(profile.availableThrough))}`,
    shifts: `Day or night shifts up to ${profile.maxShiftHours} hours`,
  }));
}


// Structured Selection uses the same browser-local fictional roster and eligibility
// checks as Natural Language. Only the chosen start day can be checked because the
// structured prototype has no assignment-duration field. Never claim live coverage.
export type StructuredDemoCriteria = {
  region: string; qualification: string; start: string; experience: string; source: string;
};

// Date.parse normalizes impossible days (for example February 30 -> March 2).
// Validate the exact UTC calendar day before describing anyone as available.
export function isValidStructuredDemoStartDate(value: string): boolean {
  if (!/^20\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value)) return false;
  const date = new Date(value + "T00:00:00Z");
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function getStructuredDemoCandidates(criteria: StructuredDemoCriteria): DemoCandidate[] {
  const minYears = Number(criteria.experience);
  if (!isValidStructuredDemoStartDate(criteria.start) ||
      !Number.isInteger(minYears) || minYears < 0 || minYears > 40 ||
      !["Gulf Coast", "Middle East", "Europe", "All regions"].includes(criteria.region) ||
      !["API 570", "API 510", "AWS CWI", "Any qualification"].includes(criteria.qualification) ||
      !["Both", "Agency", "Independent"].includes(criteria.source)) return [];

  // The sample roster is Texas-only. Do not invent inspectors in other regions.
  if (criteria.region === "Middle East" || criteria.region === "Europe") return [];
  const qualification = criteria.qualification === "Any qualification" ? "" : criteria.qualification;
  const geography = criteria.region === "Gulf Coast" ? " in Gulf Coast" : "";
  const scope = `${qualification} piping inspector${geography} starting ${criteria.start} for 1 day`;
  return getDemoCandidates(scope).filter(candidate =>
    candidate.yearsExperience >= minYears &&
    (!qualification || candidate.credentials.includes(qualification)) &&
    (criteria.source === "Both" || candidate.source === criteria.source));
}
