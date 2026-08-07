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

function inferInspectorCount(text: string) {
  const lower = text.toLowerCase();
  const explicit = lower.match(/(?:need|require|looking for)\s+(\d+)\s+(?:qualified\s+)?inspectors?/);
  if (explicit) return Math.max(1, Math.min(50, Number(explicit[1])));
  if (/\btwo inspectors?\b/.test(lower)) return 2;
  if (/\bthree inspectors?\b/.test(lower)) return 3;
  return 1;
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
  return items;
}

export function buildProjectBrief(text: string): ProjectBrief {
  const parsed = parseRequest(text);
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
