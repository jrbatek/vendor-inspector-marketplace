"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import { inspectorLabel, type MatchResult, type ReferenceItem, type SearchInspector } from "@/lib/clientSearch";
import { coordinateProject } from "@/lib/projectCoordinator";

type RefItem = { name?: string | null; code?: string | null };
type InspectorOptionProfile = {
  inspector_id: string;
  primary_discipline?: string | null;
  base_city?: string | null;
  base_state?: string | null;
  availability_status?: string | null;
};

const DEMO = {
  inspectorsNeeded: "2",
  startDate: "2026-09-14",
  duration: "3 weeks",
  location: "Houston area",
  localPreference: "Local preferred",
  discipline: "",
  certification: "API 570",
  minimumExperience: "5",
  industry: "Refinery / Petrochemical",
  travelCredential: "TWIC",
  equipment: "",
  activity: "",
  availability: "",
  shiftLength: "10-12 hours",
  travel: "",
  maxRate: "",
};

const DEMO_REQUEST = `We need two API 570 inspectors for a refinery turnaround in Houston starting September 14 for approximately three weeks.

Requirements:
API 570 certification
Minimum 5 years refinery/petrochemical experience
Current TWIC card
Available for 10-12 hour shifts
Local Houston inspectors preferred

Please send qualified CVs/resumes, availability, and rates.`;

export default function InspectorsPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [demoMode, setDemoMode] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");
  const [results, setResults] = useState<MatchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [profiles, setProfiles] = useState<InspectorOptionProfile[]>([]);
  const [certifications, setCertifications] = useState<string[]>(["API 570"]);
  const [industries, setIndustries] = useState<string[]>(["Refinery / Petrochemical"]);
  const [credentials, setCredentials] = useState<string[]>(["TWIC"]);
  const [equipmentOptions, setEquipmentOptions] = useState<string[]>([]);
  const [activityOptions, setActivityOptions] = useState<string[]>([]);

  const [inspectorsNeeded, setInspectorsNeeded] = useState("");
  const [startDate, setStartDate] = useState("");
  const [duration, setDuration] = useState("");
  const [location, setLocation] = useState("");
  const [localPreference, setLocalPreference] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [certification, setCertification] = useState("");
  const [minimumExperience, setMinimumExperience] = useState("");
  const [industry, setIndustry] = useState("");
  const [travelCredential, setTravelCredential] = useState("");
  const [equipment, setEquipment] = useState("");
  const [activity, setActivity] = useState("");
  const [availability, setAvailability] = useState("");
  const [shiftLength, setShiftLength] = useState("");
  const [travel, setTravel] = useState("");
  const [maxRate, setMaxRate] = useState("");

  useEffect(() => {
    const isDemo = new URLSearchParams(window.location.search).get("demo") === "1";
    setDemoMode(isDemo);
    if (isDemo) applyDemoCriteria();
    void loadOptions();
  }, []);

  function applyDemoCriteria() {
    setInspectorsNeeded(DEMO.inspectorsNeeded);
    setStartDate(DEMO.startDate);
    setDuration(DEMO.duration);
    setLocation(DEMO.location);
    setLocalPreference(DEMO.localPreference);
    setDiscipline(DEMO.discipline);
    setCertification(DEMO.certification);
    setMinimumExperience(DEMO.minimumExperience);
    setIndustry(DEMO.industry);
    setTravelCredential(DEMO.travelCredential);
    setEquipment(DEMO.equipment);
    setActivity(DEMO.activity);
    setAvailability(DEMO.availability);
    setShiftLength(DEMO.shiftLength);
    setTravel(DEMO.travel);
    setMaxRate(DEMO.maxRate);
  }

  async function loadOptions() {
    setLoadingOptions(true);
    const [profilesResult, certResult, industryResult, credentialResult, equipmentResult, activitiesResult, ndtResult] = await Promise.all([
      supabase.from("inspector_profiles").select("inspector_id,primary_discipline,base_city,base_state,availability_status"),
      supabase.from("inspector_certifications").select("certifications(name,code)"),
      supabase.from("inspector_industries").select("industries(name,code)"),
      supabase.from("inspector_travel_credentials").select("travel_credentials(name,code)"),
      supabase.from("inspector_equipment").select("equipment_types(name,code)"),
      supabase.from("inspector_activities").select("inspection_activities(name,code)"),
      supabase.from("inspector_ndt_methods").select("ndt_methods(name,code)"),
    ]);
    const firstError = [profilesResult, certResult, industryResult, credentialResult, equipmentResult, activitiesResult, ndtResult].find((r) => r.error)?.error;
    if (firstError) setMessage(firstError.message);

    const unique = (values: Array<string | null | undefined>, seeded: string[] = []) =>
      Array.from(new Set([...seeded, ...(values.filter(Boolean) as string[])])).sort((a, b) => a.localeCompare(b));
    const relationshipValues = (rows: any[] | null, key: string) =>
      (rows || []).flatMap((row) => {
        const item = row[key] as RefItem | RefItem[] | null;
        const list = Array.isArray(item) ? item : item ? [item] : [];
        return list.flatMap((entry) => [entry.code, entry.name]).filter(Boolean) as string[];
      });

    setProfiles((profilesResult.data || []) as InspectorOptionProfile[]);
    setCertifications(unique(relationshipValues(certResult.data, "certifications"), ["API 570"]));
    setIndustries(unique(relationshipValues(industryResult.data, "industries"), ["Refinery / Petrochemical"]));
    setCredentials(unique(relationshipValues(credentialResult.data, "travel_credentials"), ["TWIC"]));
    setEquipmentOptions(unique(relationshipValues(equipmentResult.data, "equipment_types")));
    setActivityOptions(unique([...relationshipValues(activitiesResult.data, "inspection_activities"), ...relationshipValues(ndtResult.data, "ndt_methods")]));
    setLoadingOptions(false);
  }

  const uniqueProfileValues = (values: Array<string | null | undefined>, seeded: string[] = []) =>
    Array.from(new Set([...seeded, ...(values.filter(Boolean) as string[])])).sort((a, b) => a.localeCompare(b));
  const locations = useMemo(() => uniqueProfileValues(profiles.map((p) => [p.base_city, p.base_state].filter(Boolean).join(", ")), ["Houston area"]), [profiles]);
  const disciplines = useMemo(() => uniqueProfileValues(profiles.map((p) => p.primary_discipline)), [profiles]);
  const availabilityOptions = useMemo(() => uniqueProfileValues(profiles.map((p) => p.availability_status)), [profiles]);

  function buildStructuredRequest() {
    if (demoMode) return DEMO_REQUEST;

    const first: string[] = [];
    first.push(`We need ${inspectorsNeeded || "an"} ${discipline ? `${discipline} ` : ""}inspector${inspectorsNeeded === "1" ? "" : "s"}`);
    if (location) first.push(`in ${location.replace(/ area$/i, "")}`);
    if (startDate) first.push(`starting ${startDate}`);
    if (duration) first.push(`for ${duration}`);

    const requirements: string[] = [];
    if (certification) requirements.push(`${certification} certification`);
    if (minimumExperience) requirements.push(`Minimum ${minimumExperience} years experience`);
    if (industry) requirements.push(`${industry} experience`);
    if (travelCredential) requirements.push(`${travelCredential} required`);
    if (equipment) requirements.push(`${equipment} equipment experience`);
    if (activity) requirements.push(`${activity} inspection/NDT experience`);
    if (availability) requirements.push(`Availability: ${availability}`);
    if (shiftLength) requirements.push(`${shiftLength} shifts`);
    if (localPreference) requirements.push(`${localPreference}`);
    if (travel) requirements.push(`${travel} travel capability`);
    if (maxRate) requirements.push(`Budget is $${maxRate} per day`);

    return `${first.join(" ")}. ${requirements.join(". ")}.`;
  }

  async function identifyInspectors() {
    const request = buildStructuredRequest();
    if (!request.trim()) {
      setMessage("Select at least one assignment requirement before identifying inspectors.");
      return;
    }

    setSearching(true);
    setMessage("");
    setHasSearched(false);

    const queries = await Promise.all([
      supabase.from("inspector_profiles").select("inspector_id,primary_discipline,biography,base_city,base_state,base_country,years_experience,day_rate,currency,availability_status,available_from,domestic_travel,international_travel,remote_review_available,is_verified"),
      supabase.from("inspector_equipment").select("profile_id,equipment_types(id,name,code,category)"),
      supabase.from("inspector_activities").select("profile_id,inspection_activities(id,name,code,category)"),
      supabase.from("inspector_ndt_methods").select("profile_id,ndt_methods(id,name,code,category)"),
      supabase.from("inspector_certifications").select("profile_id,certifications(id,name,code,category)"),
      supabase.from("inspector_codes_standards").select("profile_id,codes_standards(id,name,code,category)"),
      supabase.from("inspector_industries").select("profile_id,industries(id,name,code,category)"),
      supabase.from("inspector_languages").select("profile_id,languages(id,name,code,region)"),
      supabase.from("inspector_travel_credentials").select("profile_id,travel_credentials(id,name,code,category)"),
    ]);

    const error = queries.find((q) => q.error)?.error;
    if (error) {
      setMessage(error.message);
      setSearching(false);
      return;
    }

    const [profilesQ, equipmentQ, activitiesQ, ndtQ, certificationsQ, codesQ, industriesQ, languagesQ, travelQ] = queries;
    const group = (rows: any[] | null, relationship: string): Record<string, ReferenceItem[]> => {
      const grouped: Record<string, ReferenceItem[]> = {};
      for (const row of rows || []) {
        const related = row[relationship];
        if (!related || !row.profile_id) continue;
        if (!grouped[row.profile_id]) grouped[row.profile_id] = [];
        grouped[row.profile_id].push(related);
      }
      return grouped;
    };

    const equipmentByProfile = group(equipmentQ.data, "equipment_types");
    const activitiesByProfile = group(activitiesQ.data, "inspection_activities");
    const ndtByProfile = group(ndtQ.data, "ndt_methods");
    const certificationsByProfile = group(certificationsQ.data, "certifications");
    const codesByProfile = group(codesQ.data, "codes_standards");
    const industriesByProfile = group(industriesQ.data, "industries");
    const languagesByProfile = group(languagesQ.data, "languages");
    const travelByProfile = group(travelQ.data, "travel_credentials");

    const inspectors: SearchInspector[] = (profilesQ.data || []).map((profile: any) => ({
      ...profile,
      equipment: equipmentByProfile[profile.inspector_id] || [],
      activities: activitiesByProfile[profile.inspector_id] || [],
      ndtMethods: ndtByProfile[profile.inspector_id] || [],
      certifications: certificationsByProfile[profile.inspector_id] || [],
      codes: codesByProfile[profile.inspector_id] || [],
      industries: industriesByProfile[profile.inspector_id] || [],
      languages: languagesByProfile[profile.inspector_id] || [],
      travelCredentials: travelByProfile[profile.inspector_id] || [],
    }));

    const recommendation = coordinateProject(request, inspectors);
    setResults(recommendation.shortlist);
    setHasSearched(true);
    setSearching(false);
  }

  const SelectField = ({ label, value, onChange, options, placeholder }: { label: string; value: string; onChange: (value: string) => void; options: string[]; placeholder: string }) => (
    <label><span>{label}</span><select value={value} onChange={(e) => onChange(e.target.value)}><option value="">{placeholder}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
  );

  return <main className="structuredPage">
    <section className="hero anonymousHero">
      <p className="sectionEyebrow">Select via an interface</p>
      <h1>Build your inspector criteria</h1>
      <p className="muted heroCopy">Use the standard client selection fields below, then identify inspectors directly from this structured-search experience.</p>
      {demoMode && <div className="demoBanner"><strong>Demo criteria pre-filled:</strong> These selections represent the same Houston refinery request shown in the natural-language and email examples.</div>}
    </section>

    <section className="panel filterPanel">
      <div className="filterHeader"><div><h2>Assignment requirements</h2><p className="muted">Select only the requirements that matter. Optional fields can remain blank.</p></div></div>
      <div className="filterGrid">
        <SelectField label="Inspectors needed" value={inspectorsNeeded} onChange={setInspectorsNeeded} placeholder="Select quantity" options={["1","2","3","4","5+"]} />
        <label><span>Start date</span><input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} /></label>
        <SelectField label="Expected duration" value={duration} onChange={setDuration} placeholder="Select duration" options={["1 day","2-5 days","1 week","2 weeks","3 weeks","1 month","2-3 months","3+ months"]} />
        <SelectField label="Location" value={location} onChange={setLocation} placeholder="Any location" options={locations} />
        <SelectField label="Local preference" value={localPreference} onChange={setLocalPreference} placeholder="No preference" options={["Local required","Local preferred","Travel acceptable"]} />
        <SelectField label="Primary discipline" value={discipline} onChange={setDiscipline} placeholder="Any discipline" options={disciplines} />
        <SelectField label="Certification" value={certification} onChange={setCertification} placeholder="Any certification" options={certifications} />
        <SelectField label="Minimum experience" value={minimumExperience} onChange={setMinimumExperience} placeholder="Any experience" options={["1","3","5","10","15","20"]} />
        <SelectField label="Industry experience" value={industry} onChange={setIndustry} placeholder="Any industry" options={industries} />
        <SelectField label="Travel credential" value={travelCredential} onChange={setTravelCredential} placeholder="Any credential" options={credentials} />
        <SelectField label="Equipment type" value={equipment} onChange={setEquipment} placeholder="Any equipment" options={equipmentOptions} />
        <SelectField label="Inspection activity / NDT" value={activity} onChange={setActivity} placeholder="Any activity or NDT" options={activityOptions} />
        <SelectField label="Availability" value={availability} onChange={setAvailability} placeholder="Any availability" options={availabilityOptions} />
        <SelectField label="Shift length" value={shiftLength} onChange={setShiftLength} placeholder="Any shift" options={["8 hours","10 hours","10-12 hours","12 hours"]} />
        <SelectField label="Travel capability" value={travel} onChange={setTravel} placeholder="Any travel capability" options={["domestic","international","remote"]} />
        <SelectField label="Maximum day rate" value={maxRate} onChange={setMaxRate} placeholder="No maximum" options={["500","750","1000","1250","1500","2000"]} />
      </div>
      {message && <p className="notice">{message}</p>}
      <div className="submitRow"><div><strong>Ready to match?</strong><span>Your structured selections will be evaluated here without switching search modes.</span></div><button type="button" className="identifyButton" onClick={()=>void identifyInspectors()} disabled={loadingOptions || searching}>{searching ? "Identifying inspectors..." : "Identify inspectors"}</button></div>
    </section>

    {hasSearched && <section className="resultsSection">
      <div className="resultsHeader"><div><p className="sectionEyebrow">Structured-search results</p><h2>{results.length} inspectors recommended</h2></div></div>
      <div className="resultList">
        {results.map((inspector) => <article className="resultCard" key={inspector.inspector_id}>
          <div className="score">{inspector.score}%</div>
          <div className="resultBody">
            <div className="titleRow"><div><h3>{inspectorLabel(inspector)}</h3><p>{[inspector.base_city, inspector.base_state, inspector.base_country].filter(Boolean).join(", ") || "Location available through InspectSource"}</p></div><span className={inspector.is_verified ? "verified" : "prequalified"}>{inspector.is_verified ? "Verified by InspectSource" : "Pre-Qualified"}</span></div>
            <div className="facts">{inspector.years_experience !== null && <span>{inspector.years_experience}+ years</span>}<span>{inspector.availability_status || "Confirm availability"}</span><span>{formatRate(inspector.day_rate, inspector.currency)}</span></div>
            <div className="columns"><div><strong>Why this inspector matched</strong><ul>{(inspector.reasons.length ? inspector.reasons : ["Qualification profile available for review"]).slice(0,6).map((reason)=><li key={reason}>{reason}</li>)}</ul></div><div><strong>Items to confirm</strong><ul>{(inspector.questions.length ? inspector.questions : ["No major gaps identified from the stored profile"]).slice(0,5).map((question)=><li key={question}>{question}</li>)}</ul></div></div>
            <Link className="qualificationLink" href={`/inspectors/${inspector.inspector_id}`}>Review Qualifications</Link>
          </div>
        </article>)}
      </div>
    </section>}

    <style jsx>{`.structuredPage{max-width:1120px;margin:0 auto;padding:30px 18px 70px}.anonymousHero,.filterPanel,.resultCard{background:#fff;border:1px solid #e2e8f0;border-radius:18px}.anonymousHero{padding:34px}.sectionEyebrow{margin:0 0 6px;font-size:.76rem;font-weight:800;letter-spacing:.13em;text-transform:uppercase}.heroCopy{max-width:820px;line-height:1.65}.demoBanner{margin-top:18px;padding:12px 14px;border:1px solid #f3c969;background:#fff9e8;border-radius:10px;color:#7a5410}.filterPanel{padding:26px;margin-top:18px}.filterHeader h2{margin:0 0 5px}.filterHeader p{margin:0}.filterGrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-top:20px}.filterGrid label{display:flex;flex-direction:column;gap:7px}.filterGrid label>span{font-size:.82rem;font-weight:800}.filterGrid input,.filterGrid select{width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:10px;padding:11px 12px;background:white;font:inherit;min-height:44px}.submitRow{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-top:24px;padding-top:20px;border-top:1px solid #e2e8f0}.submitRow>div{display:flex;flex-direction:column;gap:3px}.submitRow span{color:#64748b;font-size:.9rem}.identifyButton{border:0;border-radius:10px;background:#0f172a;color:#fff;font-weight:800;padding:13px 22px;cursor:pointer}.identifyButton:disabled{opacity:.55}.notice{margin-top:18px;padding:12px 14px;border-radius:10px;background:#f1f5f9}.resultsSection{margin-top:28px}.resultsHeader h2{margin:0}.resultList{display:grid;gap:15px;margin-top:16px}.resultCard{display:grid;grid-template-columns:75px minmax(0,1fr);gap:18px;padding:22px}.score{display:grid;place-items:center;width:68px;height:68px;border:2px solid #111827;border-radius:50%;font-size:1.15rem;font-weight:900}.titleRow{display:flex;justify-content:space-between;gap:12px}.titleRow h3{margin:0}.titleRow p{margin:6px 0 0;color:#64748b}.verified,.prequalified{padding:6px 9px;border-radius:999px;font-size:.72rem;font-weight:800;white-space:nowrap}.verified{background:#dcfce7;color:#166534}.prequalified{background:#f1f5f9;color:#475569}.facts{display:flex;gap:8px;flex-wrap:wrap;margin-top:15px}.facts span{padding:7px 10px;border-radius:999px;background:#f1f5f9;font-size:.84rem}.columns{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin:17px 0}.columns ul{margin:8px 0 0;padding-left:20px}.qualificationLink{display:inline-flex;padding:10px 14px;border:1px solid #cbd5e1;border-radius:10px;color:#111827;text-decoration:none}@media(max-width:900px){.filterGrid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:720px){.filterGrid{grid-template-columns:1fr}.submitRow,.titleRow{align-items:stretch;flex-direction:column}.resultCard{grid-template-columns:1fr}.columns{grid-template-columns:1fr}}`}</style>
  </main>;
}

function formatRate(value: number | null, currency: string | null) {
  if (value === null) return "Rate available upon request";
  try { return `${new Intl.NumberFormat("en-US", {style:"currency",currency:currency || "USD",maximumFractionDigits:0}).format(value)}/day`; }
  catch { return `${currency || "USD"} ${value}/day`; }
}