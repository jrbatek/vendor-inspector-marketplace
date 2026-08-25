"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import { inspectorLabel, type MatchResult, type ReferenceItem, type SearchInspector } from "@/lib/clientSearch";
import { coordinateProject } from "@/lib/projectCoordinator";

type RefItem = { name?: string | null; code?: string | null; category?: string | null };
type InspectorOptionProfile = {
  inspector_id: string;
  primary_discipline?: string | null;
  availability_status?: string | null;
  available_from?: string | null;
};

const LOCAL_OPTIONS = [
  "Local Required",
  "Local Preferred",
  "Overnight stay acceptable",
  "Domestic flight acceptable",
  "International flight acceptable",
];

const CURRENCIES = ["USD","EUR","GBP","CAD","AUD","SGD","AED","QAR","SAR","NOK","BRL","INR","JPY","KRW","CNY","THB","MYR","IDR","MXN","CHF","ZAR"];

const DEMO = {
  inspectorsNeeded: "2",
  startDate: "2026-09-14",
  durationValue: "3",
  durationUnit: "weeks",
  location: "Houston, Texas",
  localPreference: "Local Preferred",
  discipline: "",
  certification: "API 570",
  minimumExperience: "5",
  industry: "Refinery / Petrochemical",
  travelCredential: "TWIC",
  equipment: "",
  activity: "",
  maxShiftHours: "12",
  maxRate: "",
  currency: "USD",
};

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

  const [inspectorsNeeded, setInspectorsNeeded] = useState("1");
  const [startDate, setStartDate] = useState("");
  const [scheduleMode, setScheduleMode] = useState<"duration" | "endDate">("duration");
  const [endDate, setEndDate] = useState("");
  const [durationValue, setDurationValue] = useState("1");
  const [durationUnit, setDurationUnit] = useState("days");
  const [location, setLocation] = useState("");
  const [localPreference, setLocalPreference] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [certification, setCertification] = useState("");
  const [minimumExperience, setMinimumExperience] = useState("");
  const [industry, setIndustry] = useState("");
  const [travelCredential, setTravelCredential] = useState("");
  const [equipment, setEquipment] = useState("");
  const [activity, setActivity] = useState("");
  const [maxShiftHours, setMaxShiftHours] = useState("");
  const [maxRate, setMaxRate] = useState("");
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    const isDemo = new URLSearchParams(window.location.search).get("demo") === "1";
    setDemoMode(isDemo);
    setCurrency(currencyForLocale(window.navigator.language));
    if (isDemo) applyDemoCriteria();
    void loadOptions();
  }, []);

  function applyDemoCriteria() {
    setInspectorsNeeded(DEMO.inspectorsNeeded);
    setStartDate(DEMO.startDate);
    setScheduleMode("duration");
    setDurationValue(DEMO.durationValue);
    setDurationUnit(DEMO.durationUnit);
    setEndDate("");
    setLocation(DEMO.location);
    setLocalPreference(DEMO.localPreference);
    setDiscipline(DEMO.discipline);
    setCertification(DEMO.certification);
    setMinimumExperience(DEMO.minimumExperience);
    setIndustry(DEMO.industry);
    setTravelCredential(DEMO.travelCredential);
    setEquipment(DEMO.equipment);
    setActivity(DEMO.activity);
    setMaxShiftHours(DEMO.maxShiftHours);
    setMaxRate(DEMO.maxRate);
    setCurrency(DEMO.currency);
  }

  async function loadOptions() {
    setLoadingOptions(true);
    const [profilesResult, certResult, industryResult, credentialResult, equipmentResult, activitiesResult, ndtResult] = await Promise.all([
      supabase.from("inspector_profiles").select("inspector_id,primary_discipline,availability_status,available_from"),
      supabase.from("inspector_certifications").select("certifications(name,code,category)"),
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

    const relationshipNames = (rows: any[] | null, key: string) =>
      (rows || []).flatMap((row) => {
        const item = row[key] as RefItem | RefItem[] | null;
        const list = Array.isArray(item) ? item : item ? [item] : [];
        return list.map((entry) => entry.name).filter(Boolean) as string[];
      });

    setProfiles((profilesResult.data || []) as InspectorOptionProfile[]);
    setCertifications(unique(relationshipNames(certResult.data, "certifications"), ["API 570"]));
    setIndustries(unique(relationshipNames(industryResult.data, "industries"), ["Refinery / Petrochemical"]));
    setCredentials(unique(relationshipNames(credentialResult.data, "travel_credentials"), ["TWIC"]));
    setEquipmentOptions(unique(relationshipNames(equipmentResult.data, "equipment_types")));
    setActivityOptions(unique([
      ...relationshipNames(activitiesResult.data, "inspection_activities"),
      ...relationshipNames(ndtResult.data, "ndt_methods"),
    ]));
    setLoadingOptions(false);
  }

  const disciplines = useMemo(() =>
    Array.from(new Set(profiles.map((p) => p.primary_discipline).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b)),
  [profiles]);

  const filteredCertifications = useMemo(() => {
    if (!discipline) return certifications;
    const selected = discipline.toLowerCase();
    const matching = certifications.filter((name) => certificationNameFits(name, selected));
    return matching.length > 0 ? matching : certifications;
  }, [certifications, discipline]);

  function buildStructuredRequest() {
    const quantity = Math.max(1, Number(inspectorsNeeded) || 1);
    const first: string[] = [`We need ${quantity} ${discipline ? `${discipline} ` : ""}inspector${quantity === 1 ? "" : "s"}`];
    if (location) first.push(`in ${location}`);
    if (startDate) first.push(`starting ${startDate}`);
    if (scheduleMode === "endDate" && endDate) first.push(`through ${endDate}`);
    if (scheduleMode === "duration" && durationValue) first.push(`for ${durationValue} ${durationUnit}`);

    const requirements: string[] = [];
    if (certification) requirements.push(`${certification} certification`);
    if (minimumExperience) requirements.push(`Minimum ${minimumExperience} years experience`);
    if (industry) requirements.push(`${industry} experience`);
    if (travelCredential) requirements.push(`${travelCredential} required`);
    if (equipment) requirements.push(`${equipment} equipment experience`);
    if (activity) requirements.push(`${activity} inspection/NDT experience`);
    if (maxShiftHours) requirements.push(`Shifts up to ${maxShiftHours} hours`);
    if (localPreference) requirements.push(localPreference);
    if (maxRate) requirements.push(`Maximum day rate ${currency} ${maxRate}`);
    requirements.push("Inspector must be available for the requested assignment dates");

    return `${first.join(" ")}. ${requirements.join(". ")}.`;
  }

  async function identifyInspectors() {
    const request = buildStructuredRequest();
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

    const inspectors: SearchInspector[] = (profilesQ.data || [])
      .filter((profile: any) => inspectorIsAvailable(profile, startDate))
      .map((profile: any) => ({
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
      <p className="muted heroCopy">Use the standard client selection fields below. InspectSource automatically excludes inspectors who are unavailable for the requested assignment.</p>
      {demoMode && <div className="demoBanner"><strong>Demo criteria pre-filled:</strong> These selections represent the same Houston refinery request shown in the natural-language and email examples.</div>}
    </section>

    <section className="panel filterPanel">
      <div className="filterHeader"><div><h2>Assignment requirements</h2><p className="muted">Enter only the requirements that matter. Optional fields can remain blank.</p></div></div>
      <div className="filterGrid">
        <label><span>Inspectors needed</span><input type="number" min="1" step="1" value={inspectorsNeeded} onChange={(e) => setInspectorsNeeded(e.target.value)} /></label>
        <label><span>Start date</span><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></label>

        <label className="wideField"><span>Assignment end</span><div className="inlineChoice">
          <select value={scheduleMode} onChange={(e) => setScheduleMode(e.target.value as "duration" | "endDate")}><option value="duration">Duration</option><option value="endDate">End date</option></select>
          {scheduleMode === "endDate" ?
            <input type="date" min={startDate || undefined} value={endDate} onChange={(e) => setEndDate(e.target.value)} /> :
            <><input className="smallNumber" type="number" min="1" step="1" value={durationValue} onChange={(e) => setDurationValue(e.target.value)} /><select value={durationUnit} onChange={(e) => setDurationUnit(e.target.value)}><option value="days">Day(s)</option><option value="weeks">Week(s)</option><option value="months">Month(s)</option></select></>}
        </div></label>

        <label className="wideField"><span>Location</span><input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, state/province, ZIP/postal code, country, or latitude/longitude" /></label>
        <SelectField label="Local / travel preference" value={localPreference} onChange={setLocalPreference} placeholder="No preference" options={LOCAL_OPTIONS} />
        <SelectField label="Primary discipline" value={discipline} onChange={(value) => { setDiscipline(value); setCertification(""); }} placeholder="Any discipline" options={disciplines} />

        <label><span>Certification</span><select value={certification} onChange={(e) => setCertification(e.target.value)}><option value="">Any certification</option>{filteredCertifications.map((option) => <option key={option} value={option}>{option}</option>)}</select>{discipline && <small>Certifications are narrowed to the selected discipline where possible.</small>}</label>
        <SelectField label="Minimum experience" value={minimumExperience} onChange={setMinimumExperience} placeholder="Any experience" options={["1","3","5","10","15","20"]} />
        <SelectField label="Industry experience" value={industry} onChange={setIndustry} placeholder="Any industry" options={industries} />
        <SelectField label="Travel credential" value={travelCredential} onChange={setTravelCredential} placeholder="Any credential" options={credentials} />
        <SelectField label="Equipment type" value={equipment} onChange={setEquipment} placeholder="Any equipment" options={equipmentOptions} />
        <SelectField label="Inspection activity / NDT" value={activity} onChange={setActivity} placeholder="Any activity or NDT" options={activityOptions} />

        <label><span>Maximum shift length</span><div className="withSuffix"><input type="number" min="1" max="24" step="1" value={maxShiftHours} onChange={(e) => setMaxShiftHours(e.target.value)} placeholder="e.g. 12" /><b>hours</b></div></label>
        <label className="wideField"><span>Maximum day rate</span><div className="rateField"><select value={currency} onChange={(e) => setCurrency(e.target.value)}>{CURRENCIES.map((item) => <option key={item} value={item}>{item}</option>)}</select><input type="number" min="0" step="25" value={maxRate} onChange={(e) => setMaxRate(e.target.value)} placeholder="No maximum" /></div><small>Currency defaults from your browser region and can be changed.</small></label>
      </div>

      {message && <p className="notice">{message}</p>}
      <div className="availabilityNote"><strong>Availability is automatic.</strong><span>Unavailable inspectors are removed before matching.</span></div>
      <div className="submitRow"><div><strong>Ready to match?</strong><span>Your structured selections will be evaluated here without switching search modes.</span></div><button type="button" className="identifyButton" onClick={() => void identifyInspectors()} disabled={loadingOptions || searching}>{searching ? "Identifying inspectors..." : "Identify inspectors"}</button></div>
    </section>

    {hasSearched && <section className="resultsSection">
      <div className="resultsHeader"><div><p className="sectionEyebrow">Structured-search results</p><h2>{results.length} inspectors recommended</h2></div></div>
      <div className="resultList">
        {results.map((inspector) => <article className="resultCard" key={inspector.inspector_id}>
          <div className="score">{inspector.score}%</div>
          <div className="resultBody">
            <div className="titleRow"><div><h3>{inspectorLabel(inspector)}</h3><p>{[inspector.base_city, inspector.base_state, inspector.base_country].filter(Boolean).join(", ") || "Location available through InspectSource"}</p></div><span className={inspector.is_verified ? "verified" : "prequalified"}>{inspector.is_verified ? "Verified by InspectSource" : "Pre-Qualified"}</span></div>
            <div className="facts">{inspector.years_experience !== null && <span>{inspector.years_experience}+ years</span>}<span>{inspector.availability_status || "Availability confirmed by matching"}</span><span>{formatRate(inspector.day_rate, inspector.currency)}</span></div>
            <div className="columns"><div><strong>Why this inspector matched</strong><ul>{(inspector.reasons.length ? inspector.reasons : ["Qualification profile available for review"]).slice(0,6).map((reason) => <li key={reason}>{reason}</li>)}</ul></div><div><strong>Items to confirm</strong><ul>{(inspector.questions.length ? inspector.questions : ["No major gaps identified from the stored profile"]).slice(0,5).map((question) => <li key={question}>{question}</li>)}</ul></div></div>
            <Link className="qualificationLink" href={`/inspectors/${inspector.inspector_id}`}>Review Qualifications</Link>
          </div>
        </article>)}
      </div>
    </section>}

    <style jsx>{`.structuredPage{max-width:1120px;margin:0 auto;padding:30px 18px 70px}.anonymousHero,.filterPanel,.resultCard{background:#fff;border:1px solid #e2e8f0;border-radius:18px}.anonymousHero{padding:34px}.sectionEyebrow{margin:0 0 6px;font-size:.76rem;font-weight:800;letter-spacing:.13em;text-transform:uppercase}.heroCopy{max-width:820px;line-height:1.65;color:#64748b}.demoBanner{margin-top:18px;padding:12px 14px;border:1px solid #f3c969;background:#fff9e8;border-radius:10px;color:#7a5410}.filterPanel{padding:26px;margin-top:18px}.filterHeader h2{margin:0 0 5px}.filterHeader p{margin:0;color:#64748b}.filterGrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-top:20px}.filterGrid label{display:flex;flex-direction:column;gap:7px}.filterGrid label>span{font-size:.82rem;font-weight:800}.filterGrid input,.filterGrid select{width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:10px;padding:11px 12px;background:white;font:inherit;min-height:44px}.filterGrid small{font-size:.72rem;color:#64748b}.wideField{grid-column:span 2}.inlineChoice,.rateField,.withSuffix{display:flex;gap:8px}.inlineChoice>*{flex:1}.smallNumber{max-width:90px}.rateField select{max-width:105px}.rateField input{flex:1}.withSuffix{align-items:center}.withSuffix input{flex:1}.withSuffix b{font-size:.82rem;color:#64748b}.availabilityNote{display:flex;gap:8px;flex-wrap:wrap;margin-top:20px;padding:12px 14px;border-radius:10px;background:#ecfdf5;color:#166534}.availabilityNote span{color:#475569}.submitRow{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-top:18px;padding-top:20px;border-top:1px solid #e2e8f0}.submitRow>div{display:flex;flex-direction:column;gap:3px}.submitRow span{color:#64748b;font-size:.9rem}.identifyButton{border:0;border-radius:10px;background:#0f172a;color:#fff;font-weight:800;padding:13px 22px;cursor:pointer}.identifyButton:disabled{opacity:.55}.notice{margin-top:18px;padding:12px 14px;border-radius:10px;background:#f1f5f9}.resultsSection{margin-top:28px}.resultsHeader h2{margin:0}.resultList{display:grid;gap:15px;margin-top:16px}.resultCard{display:grid;grid-template-columns:75px minmax(0,1fr);gap:18px;padding:22px}.score{display:grid;place-items:center;width:68px;height:68px;border:2px solid #111827;border-radius:50%;font-size:1.15rem;font-weight:900}.titleRow{display:flex;justify-content:space-between;gap:12px}.titleRow h3{margin:0}.titleRow p{margin:6px 0 0;color:#64748b}.verified,.prequalified{padding:6px 9px;border-radius:999px;font-size:.72rem;font-weight:800;white-space:nowrap}.verified{background:#dcfce7;color:#166534}.prequalified{background:#f1f5f9;color:#475569}.facts{display:flex;gap:8px;flex-wrap:wrap;margin-top:15px}.facts span{padding:7px 10px;border-radius:999px;background:#f1f5f9;font-size:.84rem}.columns{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin:17px 0}.columns ul{margin:8px 0 0;padding-left:20px}.qualificationLink{display:inline-flex;padding:10px 14px;border:1px solid #cbd5e1;border-radius:10px;color:#111827;text-decoration:none}@media(max-width:900px){.filterGrid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:720px){.filterGrid{grid-template-columns:1fr}.wideField{grid-column:auto}.submitRow,.titleRow{align-items:stretch;flex-direction:column}.resultCard{grid-template-columns:1fr}.columns{grid-template-columns:1fr}.inlineChoice,.rateField{flex-wrap:wrap}}</style>
  </main>;
}

function inspectorIsAvailable(profile: any, startDate: string) {
  const status = String(profile.availability_status || "").toLowerCase();
  if (status.includes("unavailable") || status.includes("not available") || status.includes("inactive")) return false;
  if (startDate && profile.available_from && String(profile.available_from).slice(0,10) > startDate) return false;
  return true;
}

function certificationNameFits(name: string, discipline: string) {
  const n = name.toLowerCase();
  if (discipline.includes("weld")) return /(cwi|cswip|weld|aws)/.test(n);
  if (discipline.includes("pressure") || discipline.includes("piping")) return /(api 510|api 570|api 653|pressure|piping|asme)/.test(n);
  if (discipline.includes("coating")) return /(nace|ampp|coating)/.test(n);
  if (discipline.includes("ndt")) return /(asnt|pcn|ndt|ultrasonic|radiograph|magnetic|penetrant)/.test(n);
  if (discipline.includes("tank")) return /(api 653|tank)/.test(n);
  if (discipline.includes("quality") || discipline.includes("audit")) return /(iso|auditor|quality)/.test(n);
  return false;
}

function currencyForLocale(locale: string) {
  const region = (locale.split("-")[1] || "US").toUpperCase();
  const map: Record<string,string> = { US:"USD", CA:"CAD", GB:"GBP", AU:"AUD", SG:"SGD", AE:"AED", QA:"QAR", SA:"SAR", NO:"NOK", BR:"BRL", IN:"INR", JP:"JPY", KR:"KRW", CN:"CNY", TH:"THB", MY:"MYR", ID:"IDR", MX:"MXN", CH:"CHF", ZA:"ZAR" };
  if (map[region]) return map[region];
  const euro = ["AT","BE","CY","DE","EE","ES","FI","FR","GR","HR","IE","IT","LT","LU","LV","MT","NL","PT","SI","SK"];
  return euro.includes(region) ? "EUR" : "USD";
}

function formatRate(value: number | null, currency: string | null) {
  if (value === null) return "Rate available upon request";
  try { return `${new Intl.NumberFormat("en-US", {style:"currency",currency:currency || "USD",maximumFractionDigits:0}).format(value)}/day`; }
  catch { return `${currency || "USD"} ${value}/day`; }
}
