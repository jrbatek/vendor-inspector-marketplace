/** Synthetic aggregates only. Live cohort filtering must be enforced by an authorized backend. */
export const MIN_PEER_COHORT = 10;
export const GEOGRAPHIES = ["US Gulf Coast", "UK North Sea"] as const;
export const EXPERTISES = ["Pressure equipment", "Welding"] as const;
export const INSPECTION_TYPES = ["Vendor surveillance", "NDT review"] as const;
export type PeerFilters = { geography: string; expertise: string; inspectionType: string };
export type PositionMetric = { label: string; own: string; comparison: string; guidance: string };
export type PeerCohort = PeerFilters & { size: number; ratePercentile: number; metrics: PositionMetric[] };

export const DEMO_PEER_COHORTS: PeerCohort[] = GEOGRAPHIES.flatMap((geography, region) => EXPERTISES.flatMap((expertise, discipline) => INSPECTION_TYPES.map((inspectionType, activity) => ({
  geography, expertise, inspectionType,
  size: region === 1 && discipline === 1 && activity === 1 ? 7 : 24 + region * 4 + discipline * 6 + activity * 2,
  ratePercentile: 58 + region * 5 + discipline * 3 + activity,
  metrics: [
    { label: "Availability", own: "75%", comparison: "Peer median 70%", guidance: "Keep availability current for the dates and working patterns you can accept." },
    { label: "Qualifications", own: discipline === 0 ? "80% coverage" : "70% coverage", comparison: "Peer median 85% coverage", guidance: "Review requested credentials and add current supporting evidence for qualifications you hold." },
    { label: "Relevant experience", own: "12 years", comparison: "Peer median 10 years", guidance: "Document relevant equipment, inspection activities and recent project experience." },
    { label: "Travel flexibility", own: region === 0 ? "3 regions" : "2 regions", comparison: "Peer median 2 regions", guidance: "Declare only regions you can serve and keep travel restrictions accurate." },
    { label: "Valid response behavior", own: "92% on time", comparison: "Peer median 88% on time", guidance: "Respond to applicable requests by their stated deadline; an accurate decline is a valid response." },
    { label: "Profile completeness / verification", own: "92% complete", comparison: "Peer median 87% complete", guidance: "Fill evidence gaps and review verification status. Uploading a file does not itself verify a claim." },
  ],
}))));

export function summarizePeerCohort(cohort: PeerCohort | undefined) {
  if (!cohort || !Number.isSafeInteger(cohort.size) || cohort.size < MIN_PEER_COHORT
    || !Number.isFinite(cohort.ratePercentile) || cohort.ratePercentile < 0 || cohort.ratePercentile > 100) {
    return { available: false as const };
  }
  return { available: true as const, size: cohort.size, ratePercentile: cohort.ratePercentile, metrics: cohort.metrics };
}

export function peerPositioning(filters: PeerFilters) {
  return summarizePeerCohort(DEMO_PEER_COHORTS.find(cohort => cohort.geography === filters.geography
    && cohort.expertise === filters.expertise && cohort.inspectionType === filters.inspectionType));
}
