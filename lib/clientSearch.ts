export type ParsedRequest = {
  rawText: string;
  location: string | null;
  startDate: string | null;
  durationDays: number | null;
  maximumDayRate: number | null;
  minimumYearsExperience: number | null;
  availabilityRequired: boolean;
  internationalTravelRequired: boolean;
  remoteAllowed: boolean;
  requiredTerms: string[];
};

export type ReferenceItem = {
  id: string;
  name: string;
  code?: string | null;
  category?: string | null;
};

export type SearchInspector = {
  inspector_id: string;
  primary_discipline: string | null;
  biography: string | null;
  base_city: string | null;
  base_state: string | null;
  base_country: string | null;
  years_experience: number | null;
  day_rate: number | null;
  currency: string | null;
  availability_status: string | null;
  available_from: string | null;
  domestic_travel: boolean | null;
  international_travel: boolean | null;
  remote_review_available: boolean | null;
  is_verified: boolean | null;
  equipment: ReferenceItem[];
  activities: ReferenceItem[];
  ndtMethods: ReferenceItem[];
  certifications: ReferenceItem[];
  codes: ReferenceItem[];
  industries: ReferenceItem[];
  languages: ReferenceItem[];
  travelCredentials: ReferenceItem[];
};

export type MatchResult = SearchInspector & {
  score: number;
  reasons: string[];
  questions: string[];
  matchedTerms: string[];
};

const STOP_WORDS = new Set([
  "a","an","and","are","around","at","available","be","beginning","budget",
  "by","can","day","days","for","from","have","in","inspector","inspection",
  "is","looking","maximum","must","near","need","of","on","or","per","please",
  "required","someone","starting","that","the","to","up","we","week","weeks",
  "who","with",
]);

const MONTHS: Record<string, number> = {
  jan:1,january:1,feb:2,february:2,mar:3,march:3,apr:4,april:4,may:5,
  jun:6,june:6,jul:7,july:7,aug:8,august:8,sep:9,sept:9,september:9,
  oct:10,october:10,nov:11,november:11,dec:12,december:12,
};

function parseDate(text: string): string | null {
  const iso = text.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const named = text.toLowerCase().match(
    /\b(?:starting|beginning|from|on)\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:,\s*(20\d{2}))?/
  );

  if (!named) return null;
  const month = MONTHS[named[1]];
  const year = named[3] ? Number(named[3]) : new Date().getFullYear();
  return `${year}-${String(month).padStart(2, "0")}-${String(Number(named[2])).padStart(2, "0")}`;
}

export function parseRequest(text: string): ParsedRequest {
  const clean = text.trim();
  const lower = clean.toLowerCase();

  const location = clean.match(
    /\b(?:in|near|around|within\s+\d+\s+(?:miles|kilometers|km)\s+of)\s+([A-Z][A-Za-z .'-]+(?:,\s*[A-Z]{2})?)(?=\s+(?:for|starting|beginning|with|who|and|must|budget|available|requiring)|[,.]|$)/
  );

  const rate = lower.match(/\$?\s*([\d,]+(?:\.\d+)?)\s*(?:\/|per\s*)day\b/);
  const years = lower.match(/(?:at least|minimum|min\.?)\s*(\d{1,2})\s*\+?\s*years?/);
  const duration = lower.match(/(\d+)\s*(day|days|week|weeks|month|months)\b/);

  let durationDays: number | null = null;
  if (duration) {
    const amount = Number(duration[1]);
    durationDays = duration[2].startsWith("week")
      ? amount * 7
      : duration[2].startsWith("month")
        ? amount * 30
        : amount;
  }

  const requiredTerms = Array.from(new Set(
    lower
      .replace(/[^a-z0-9+./ -]/g, " ")
      .split(/\s+/)
      .map((term) => term.trim())
      .filter((term) =>
        term.length >= 2 &&
        !STOP_WORDS.has(term) &&
        !/^\d+$/.test(term)
      )
  ));

  return {
    rawText: clean,
    location: location?.[1]?.trim() || null,
    startDate: parseDate(clean),
    durationDays,
    maximumDayRate: rate ? Number(rate[1].replace(/,/g, "")) : null,
    minimumYearsExperience: years ? Number(years[1]) : null,
    availabilityRequired: /\bavailable\b|\bstarting\b|\bbeginning\b|\bimmediately\b/.test(lower),
    internationalTravelRequired: /\boffshore\b|\binternational\b|\boverseas\b|\bpassport\b/.test(lower),
    remoteAllowed: /\bremote\b|\bdesk review\b|\bdesktop review\b/.test(lower),
    requiredTerms,
  };
}

function normalizedText(inspector: SearchInspector): string {
  return [
    inspector.primary_discipline,
    inspector.biography,
    inspector.base_city,
    inspector.base_state,
    inspector.base_country,
    ...inspector.equipment.flatMap((item) => [item.name, item.code, item.category]),
    ...inspector.activities.flatMap((item) => [item.name, item.code, item.category]),
    ...inspector.ndtMethods.flatMap((item) => [item.name, item.code, item.category]),
    ...inspector.certifications.flatMap((item) => [item.name, item.code, item.category]),
    ...inspector.codes.flatMap((item) => [item.name, item.code, item.category]),
    ...inspector.industries.flatMap((item) => [item.name, item.code, item.category]),
    ...inspector.languages.flatMap((item) => [item.name, item.code, item.category]),
    ...inspector.travelCredentials.flatMap((item) => [item.name, item.code, item.category]),
  ].filter(Boolean).join(" ").toLowerCase();
}

function publicInspectorNumber(id: string): string {
  return id.replace(/-/g, "").slice(-6).toUpperCase();
}

export function inspectorLabel(inspector: SearchInspector): string {
  const discipline = inspector.primary_discipline || "Vendor Inspection";
  return `${discipline} Professional · Inspector #${publicInspectorNumber(inspector.inspector_id)}`;
}

export function rankInspectors(
  request: ParsedRequest,
  inspectors: SearchInspector[],
): MatchResult[] {
  return inspectors.map((inspector) => {
    let earned = 0;
    let possible = 0;
    const reasons: string[] = [];
    const questions: string[] = [];
    const searchText = normalizedText(inspector);

    possible += 50;
    const matchedTerms = request.requiredTerms.filter((term) => searchText.includes(term));
    const termScore = request.requiredTerms.length
      ? matchedTerms.length / request.requiredTerms.length
      : 0.5;
    earned += termScore * 50;
    if (matchedTerms.length) reasons.push(`Qualification matches: ${matchedTerms.slice(0, 7).join(", ")}`);

    if (request.location) {
      possible += 15;
      const inspectorLocation = [
        inspector.base_city,
        inspector.base_state,
        inspector.base_country,
      ].filter(Boolean).join(" ").toLowerCase();

      const wanted = request.location.toLowerCase();
      if (inspectorLocation.includes(wanted) || wanted.includes(inspectorLocation)) {
        earned += 15;
        reasons.push(`Based in ${[inspector.base_city, inspector.base_state].filter(Boolean).join(", ")}`);
      } else if (inspector.domestic_travel || inspector.international_travel) {
        earned += 7;
        reasons.push("Travel capability may support the assignment location");
      } else {
        questions.push("Confirm travel feasibility");
      }
    }

    if (request.maximumDayRate !== null) {
      possible += 10;
      if (inspector.day_rate !== null && inspector.day_rate <= request.maximumDayRate) {
        earned += 10;
        reasons.push("Day rate is within the stated budget");
      } else if (inspector.day_rate === null) {
        earned += 4;
        questions.push("Confirm day rate");
      } else {
        questions.push("Rate exceeds stated budget");
      }
    }

    if (request.minimumYearsExperience !== null) {
      possible += 10;
      if ((inspector.years_experience || 0) >= request.minimumYearsExperience) {
        earned += 10;
        reasons.push(`${inspector.years_experience}+ years of experience`);
      } else {
        questions.push("Experience is below the requested minimum");
      }
    }

    if (request.availabilityRequired || request.startDate) {
      possible += 10;
      const available = inspector.availability_status || "";
      if (available === "Available Immediately") {
        earned += 10;
        reasons.push("Available immediately");
      } else if (available === "Available in 2 Weeks") {
        earned += 7;
        reasons.push("Available in two weeks");
      } else {
        questions.push("Confirm availability for the requested dates");
      }
    }

    if (request.internationalTravelRequired) {
      possible += 5;
      if (inspector.international_travel) {
        earned += 5;
        reasons.push("International travel is available");
      } else {
        questions.push("International travel is not confirmed");
      }
    }

    if (request.remoteAllowed && inspector.remote_review_available) {
      possible += 5;
      earned += 5;
      reasons.push("Remote review is available");
    }

    possible += 5;
    if (inspector.is_verified) {
      earned += 5;
      reasons.push("Verified by InspectSource");
    } else {
      questions.push("Credential verification is pending");
    }

    return {
      ...inspector,
      score: Math.max(0, Math.min(100, Math.round((earned / possible) * 100))),
      reasons,
      questions,
      matchedTerms,
    };
  }).sort((a, b) => b.score - a.score);
}
