import { parseRequest, rankInspectors, type MatchResult, type ParsedRequest, type SearchInspector } from "@/lib/clientSearch";

export type ProjectBrief = ParsedRequest & {
  numberOfInspectors: number;
  urgency: "standard" | "urgent" | "immediate";
  deliverables: string[];
  coordinatorQuestions: string[];
};

export type CoordinatorRecommendation = {
  brief: ProjectBrief;
  ranked: MatchResult[];
  shortlist: MatchResult[];
  summary: string;
  nextActions: string[];
};

const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
  nine: 9, ten: 10, eleven: 11, twelve: 12,
};

function numberFromToken(value: string): number | null {
  if (/^\d+$/.test(value)) return Number(value);
  return NUMBER_WORDS[value.toLowerCase()] ?? null;
}

function inferInspectorCount(text: string) {
  const lower = text.toLowerCase();
  const match = lower.match(/\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\b(?=.{0,45}\binspectors?\b)/);
  const count = match ? numberFromToken(match[1]) : null;
  return count ? Math.max(1, Math.min(50, count)) : 1;
}

function inferDurationDays(text: string): number | null {
  const lower = text.toLowerCase();
  const match = lower.match(/\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s+(day|days|week|weeks|month|months)\b/);
  if (!match) return null;
  const amount = numberFromToken(match[1]);
  if (!amount) return null;
  if (match[2].startsWith("week")) return amount * 7;
  if (match[2].startsWith("month")) return amount * 30;
  return amount;
}

function inferLocation(text: string): string | null {
  const match = text.match(/\b(?:in|near|around)\s+([A-Z][A-Za-z .'-]+?)(?=\s+(?:for|starting|beginning|with|who|and|must|requiring|on)\b|[,.]|$)/);
  return match?.[1]?.trim() || null;
}

function enrichRequiredTerms(text: string, terms: string[]): string[] {
  const lower = text.toLowerCase();
  const enriched = [...terms];
  const api = lower.match(/\bapi\s*-?\s*(\d{3})\b/);
  if (api) enriched.push(`api ${api[1]}`);
  if (/\btwic\b/.test(lower)) enriched.push("twic");
  return Array.from(new Set(enriched));
}

function inferUrgency(text: string): ProjectBrief["urgency"] {
  const lower = text.toLowerCase();
  if (/\basap\b|\bimmediately\b|\btoday\b|\bemergency\b/.test(lower)) return "immediate";
  if (/\burgent\b|\btomorrow\b|\bthis week\b/.test(lower)) return "urgent";
  return "standard";
}

function inferDeliverables(text: string) {
  const lower = text.toLowerCase();
  const items: string[] = [];
  if (/\breport\b|\breporting\b/.test(lower)) items.push("Inspection report");
  if (/\bphotos?\b|\bphotographs?\b/.test(lower)) items.push("Photographic record");
  if (/\brelease note\b|\binspection release\b/.test(lower)) items.push("Release note");
  if (/\bexpedit/.test(lower)) items.push("Expediting update");
  if (/\bfinal dossier\b|\bdata book\b|\bmanufacturing record/.test(lower)) items.push("Final dossier review");
  if (/\bcvs?\b|\bresumes?\b/.test(lower)) items.push("Anonymous inspector CVs");
  return items;
}

export function buildProjectBrief(text: string): ProjectBrief {
  const base = parseRequest(text);
  const parsed: ParsedRequest = {
    ...base,
    location: inferLocation(text) || base.location,
    durationDays: inferDurationDays(text) || base.durationDays,
    requiredTerms: enrichRequiredTerms(text, base.requiredTerms),
  };

  const coordinatorQuestions: string[] = [];
  if (!parsed.location) coordinatorQuestions.push("What is the inspection location or supplier location?");
  if (!parsed.startDate) coordinatorQuestions.push("What date should the inspector start?");
  if (!parsed.durationDays) coordinatorQuestions.push("How long is the assignment expected to last?");
  if (!parsed.requiredTerms.length) coordinatorQuestions.push("What equipment, standards, certifications, or inspection methods are required?");

  return {
    ...parsed,
    numberOfInspectors: inferInspectorCount(text),
    urgency: inferUrgency(text),
    deliverables: inferDeliverables(text),
    coordinatorQuestions,
  };
}

export function coordinateProject(text: string, inspectors: SearchInspector[]): CoordinatorRecommendation {
  const brief = buildProjectBrief(text);
  const ranked = rankInspectors(brief, inspectors);
  const shortlistSize = Math.min(Math.max(brief.numberOfInspectors * 3, 3), 8);
  const shortlist = ranked.filter((candidate) => candidate.score >= 35).slice(0, shortlistSize);

  const highConfidence = shortlist.filter((candidate) => candidate.score >= 75).length;
  const summary = shortlist.length
    ? `InspectSource evaluated ${ranked.length} inspector profiles and recommends ${shortlist.length} candidates for further availability confirmation. ${highConfidence} candidate${highConfidence === 1 ? " is" : "s are"} currently rated 75% match or higher.`
    : `InspectSource evaluated ${ranked.length} inspector profiles but did not find a strong enough match. The coordinator should clarify the requirements or expand the search radius.`;

  const nextActions: string[] = [];
  if (brief.coordinatorQuestions.length) nextActions.push("Resolve missing project requirements with the client");
  if (shortlist.length) nextActions.push(`Confirm availability with the top ${Math.min(shortlist.length, brief.numberOfInspectors * 2)} candidates`);
  if (shortlist.length) nextActions.push("Send anonymous qualification summaries/CVs to the client");
  if (brief.maximumDayRate !== null) nextActions.push("Confirm commercial rate and travel assumptions before award");

  return { brief, ranked, shortlist, summary, nextActions };
}
