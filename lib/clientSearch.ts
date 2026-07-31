export type ParsedRequest = {
  rawText: string;
  location: string | null;
  maximumDayRate: number | null;
  minimumYearsExperience: number | null;
  durationDays: number | null;
  availabilityRequired: boolean;
  internationalTravelRequired: boolean;
  terms: string[];
};

export type RefItem = {
  id: string;
  name: string;
  code?: string | null;
  category?: string | null;
};

export type SearchInspector = {
  inspector_id: string;
  full_name: string | null;
  headline: string | null;
  biography: string | null;
  base_city: string | null;
  base_state: string | null;
  base_country: string | null;
  years_experience: number | null;
  day_rate: number | null;
  currency: string | null;
  availability_status: string | null;
  international_travel: boolean | null;
  is_verified: boolean | null;
  equipment: RefItem[];
  activities: RefItem[];
  ndtMethods: RefItem[];
  certifications: RefItem[];
  codes: RefItem[];
  industries: RefItem[];
  travelCredentials: RefItem[];
};

export type MatchResult = SearchInspector & {
  score: number;
  reasons: string[];
  gaps: string[];
};

export function parseRequest(text: string): ParsedRequest {
  const clean = text.trim();
  const lower = clean.toLowerCase();

  const rate = lower.match(/\$?\s*([\d,]+)\s*(?:\/|per\s*)day\b/);
  const years = lower.match(/(?:at least|minimum|min\.?)\s*(\d+)\s*years?/);
  const duration = lower.match(/(\d+)\s*(day|days|week|weeks|month|months)\b/);
  const location = clean.match(
    /\b(?:in|near|around)\s+([A-Z][A-Za-z .'-]+(?:,\s*[A-Z]{2})?)(?=\s+(?:for|starting|with|who|and|must|budget)|[,.]|$)/
  );

  let durationDays: number | null = null;
  if (duration) {
    const amount = Number(duration[1]);
    durationDays = duration[2].startsWith("week")
      ? amount * 7
      : duration[2].startsWith("month")
        ? amount * 30
        : amount;
  }

  const stopWords = new Set([
    "need","looking","inspector","inspection","someone","must","with","for",
    "the","and","who","that","have","has","near","around","starting",
    "beginning","approximately","about","budget","available","from","days",
    "weeks","months","day","week","month","rate"
  ]);

  const terms = Array.from(
    new Set(
      lower
        .replace(/[^a-z0-9+./ -]/g, " ")
        .split(/\s+/)
        .filter((term) =>
          term.length >= 2 &&
          !stopWords.has(term) &&
          !/^\d+$/.test(term)
        )
    )
  );

  return {
    rawText: clean,
    location: location?.[1]?.trim() || null,
    maximumDayRate: rate ? Number(rate[1].replace(/,/g, "")) : null,
    minimumYearsExperience: years ? Number(years[1]) : null,
    durationDays,
    availabilityRequired: /\bavailable\b|\bstarting\b|\bbeginning\b|\bimmediately\b/.test(lower),
    internationalTravelRequired: /\boffshore\b|\binternational\b|\boverseas\b|\bpassport\b/.test(lower),
    terms,
  };
}

function searchableText(i: SearchInspector) {
  return [
    i.full_name, i.headline, i.biography, i.base_city, i.base_state, i.base_country,
    ...i.equipment.flatMap(x => [x.name, x.code, x.category]),
    ...i.activities.flatMap(x => [x.name, x.code, x.category]),
    ...i.ndtMethods.flatMap(x => [x.name, x.code, x.category]),
    ...i.certifications.flatMap(x => [x.name, x.code, x.category]),
    ...i.codes.flatMap(x => [x.name, x.code, x.category]),
    ...i.industries.flatMap(x => [x.name, x.code, x.category]),
    ...i.travelCredentials.flatMap(x => [x.name, x.code, x.category]),
  ].filter(Boolean).join(" ").toLowerCase();
}

export function rankInspectors(
  request: ParsedRequest,
  inspectors: SearchInspector[],
): MatchResult[] {
  return inspectors.map((i) => {
    let score = 0;
    let possible = 0;
    const reasons: string[] = [];
    const gaps: string[] = [];
    const text = searchableText(i);

    if (request.terms.length) {
      possible += 50;
      const matched = request.terms.filter(t => text.includes(t));
      score += 50 * (matched.length / request.terms.length);
      if (matched.length) reasons.push(`Matches: ${matched.slice(0, 6).join(", ")}`);
      const missing = request.terms.filter(t => !text.includes(t));
      if (missing.length) gaps.push(`Not shown: ${missing.slice(0, 5).join(", ")}`);
    }

    if (request.location) {
      possible += 15;
      const location = [i.base_city, i.base_state, i.base_country]
        .filter(Boolean).join(" ").toLowerCase();
      if (
        location.includes(request.location.toLowerCase()) ||
        request.location.toLowerCase().includes(location)
      ) {
        score += 15;
        reasons.push(`Based in ${[i.base_city, i.base_state].filter(Boolean).join(", ")}`);
      } else {
        gaps.push(`Base location: ${location || "not listed"}`);
      }
    }

    if (request.maximumDayRate !== null) {
      possible += 10;
      if (i.day_rate !== null && i.day_rate <= request.maximumDayRate) {
        score += 10;
        reasons.push("Day rate fits budget");
      } else if (i.day_rate === null) {
        score += 4;
        gaps.push("Day rate not listed");
      } else {
        gaps.push("Day rate exceeds budget");
      }
    }

    if (request.minimumYearsExperience !== null) {
      possible += 10;
      if ((i.years_experience || 0) >= request.minimumYearsExperience) {
        score += 10;
        reasons.push(`${i.years_experience}+ years experience`);
      } else {
        gaps.push("Below requested experience");
      }
    }

    if (request.availabilityRequired) {
      possible += 10;
      if (
        i.availability_status === "Available Immediately" ||
        i.availability_status === "Available in 2 Weeks"
      ) {
        score += 10;
        reasons.push(i.availability_status);
      } else {
        gaps.push(i.availability_status || "Availability not listed");
      }
    }

    possible += 5;
    if (i.is_verified) {
      score += 5;
      reasons.push("Verified profile");
    }

    if (request.internationalTravelRequired && !i.international_travel) {
      gaps.push("International travel not confirmed");
    }

    return {
      ...i,
      score: possible ? Math.round((score / possible) * 100) : 0,
      reasons,
      gaps,
    };
  }).sort((a, b) => b.score - a.score);
}
