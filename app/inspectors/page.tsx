"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import type { InspectorProfile } from "@/lib/types";
import InspectorCard, { type DirectoryInspector, type QualificationItem } from "@/components/InspectorCard";

type FilterInspector = DirectoryInspector & {
  equipment: QualificationItem[];
  activities: QualificationItem[];
};

const HOUSTON_AREA = ["houston","baytown","tomball","spring","cypress","pasadena","deer park","la porte","katy","sugar land","pearland"];

export default function InspectorsPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [inspectors, setInspectors] = useState<FilterInspector[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [demoMode, setDemoMode] = useState(false);

  const [location, setLocation] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [certification, setCertification] = useState("");
  const [equipment, setEquipment] = useState("");
  const [activity, setActivity] = useState("");
  const [industry, setIndustry] = useState("");
  const [travelCredential, setTravelCredential] = useState("");
  const [minimumExperience, setMinimumExperience] = useState("");
  const [availability, setAvailability] = useState("");
  const [travel, setTravel] = useState("");
  const [maxRate, setMaxRate] = useState("");
  const [inspectorsNeeded, setInspectorsNeeded] = useState("");
  const [startDate, setStartDate] = useState("");
  const [duration, setDuration] = useState("");
  const [shiftLength, setShiftLength] = useState("");
  const [localPreference, setLocalPreference] = useState("");

  useEffect(() => {
    const isDemo = new URLSearchParams(window.location.search).get("demo") === "1";
    setDemoMode(isDemo);
    if (isDemo) applyDemoCriteria();
    void loadInspectors();
    const intervalId = window.setInterval(() => void loadInspectors(), 15000);
    return () => window.clearInterval(intervalId);
  }, []);

  function applyDemoCriteria() {
    setLocation("Houston area");
    setCertification("API 570");
    setIndustry("Refinery / Petrochemical");
    setTravelCredential("TWIC");
    setMinimumExperience("5");
    setInspectorsNeeded("2");
    setStartDate("2026-09-14");
    setDuration("3 weeks");
    setShiftLength("10-12 hours");
    setLocalPreference("Local preferred");
  }

  async function loadInspectors() {
    setLoading(true);
    setMessage("");
    const [profilesResult, certificationsResult, ndtResult, industriesResult, travelResult, equipmentResult, activitiesResult] = await Promise.all([
      supabase.from("inspector_profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("inspector_certifications").select("profile_id, certifications(id,name,code,category)"),
      supabase.from("inspector_ndt_methods").select("profile_id, level, ndt_methods(id,name,code,category)"),
      supabase.from("inspector_industries").select("profile_id, industries(id,name,code,category)"),
      supabase.from("inspector_travel_credentials").select("profile_id, travel_credentials(id,name,code,category)"),
      supabase.from("inspector_equipment").select("profile_id, equipment_types(id,name,code,category)"),
      supabase.from("inspector_activities").select("profile_id, inspection_activities(id,name,code,category)"),
    ]);

    const firstError = [profilesResult, certificationsResult, ndtResult, industriesResult, travelResult, equipmentResult, activitiesResult].find((result) => result.error)?.error;
    if (firstError) {
      setMessage(firstError.message);
      setInspectors([]);
      setLoading(false);
      return;
    }

    const groupRelated = (rows: any[] | null, relationshipName: string): Record<string, QualificationItem[]> => {
      const grouped: Record<string, QualificationItem[]> = {};
      for (const row of rows || []) {
        const related = row[relationshipName];
        if (!related || !row.profile_id) continue;
        if (!grouped[row.profile_id]) grouped[row.profile_id] = [];
        grouped[row.profile_id].push({ ...related, level: row.level || null });
      }
      return grouped;
    };

    const certs = groupRelated(certificationsResult.data, "certifications");
    const ndt = groupRelated(ndtResult.data, "ndt_methods");
    const industries = groupRelated(industriesResult.data, "industries");
    const credentials = groupRelated(travelResult.data, "travel_credentials");
    const equipmentMap = groupRelated(equipmentResult.data, "equipment_types");
    const activities = groupRelated(activitiesResult.data, "inspection_activities");

    const directoryInspectors: FilterInspector[] = ((profilesResult.data || []) as InspectorProfile[]).map((profile) => ({
      profile,
      certifications: certs[profile.inspector_id] || [],
      ndtMethods: ndt[profile.inspector_id] || [],
      industries: industries[profile.inspector_id] || [],
      travelCredentials: credentials[profile.inspector_id] || [],
      equipment: equipmentMap[profile.inspector_id] || [],
      activities: activities[profile.inspector_id] || [],
    }));

    setInspectors(directoryInspectors);
    setLoading(false);
  }

  const unique = (values: Array<string | null | undefined>, seeded: string[] = []) => Array.from(new Set([...seeded, ...values.filter(Boolean) as string[]])).sort((a,b)=>a.localeCompare(b));
  const locations = useMemo(() => unique(inspectors.map((i) => [i.profile.base_city, i.profile.base_state].filter(Boolean).join(", ")), ["Houston area"]), [inspectors]);
  const disciplines = useMemo(() => unique(inspectors.map((i) => i.profile.primary_discipline)), [inspectors]);
  const certifications = useMemo(() => unique(inspectors.flatMap((i) => i.certifications.flatMap((x) => [x.code, x.name])), ["API 570"]), [inspectors]);
  const equipmentOptions = useMemo(() => unique(inspectors.flatMap((i) => i.equipment.map((x) => x.name))), [inspectors]);
  const activityOptions = useMemo(() => unique(inspectors.flatMap((i) => [...i.activities.map((x) => x.name), ...i.ndtMethods.flatMap((x) => [x.code, x.name])])), [inspectors]);
  const industryOptions = useMemo(() => unique(inspectors.flatMap((i) => i.industries.map((x) => x.name)), ["Refinery / Petrochemical"]), [inspectors]);
  const credentialOptions = useMemo(() => unique(inspectors.flatMap((i) => i.travelCredentials.flatMap((x) => [x.code, x.name])), ["TWIC"]), [inspectors]);
  const availabilityOptions = useMemo(() => unique(inspectors.map((i) => i.profile.availability_status)), [inspectors]);

  const hasCriteria = [location,discipline,certification,equipment,activity,industry,travelCredential,minimumExperience,availability,travel,maxRate].some((value) => value.trim() !== "");

  const filtered = useMemo(() => {
    const normalize = (value: unknown) => String(value || "").trim().toLowerCase();
    const includesItem = (items: QualificationItem[], value: string) => !value || items.some((item) => [item.name,item.code,item.category,item.level].filter(Boolean).join(" ").toLowerCase().includes(value));
    const certText = normalize(certification);
    const industryText = normalize(industry);
    const credentialText = normalize(travelCredential);
    const maxRateNumber = Number(maxRate);
    const minExp = Number(minimumExperience);

    return inspectors.filter((inspector) => {
      const p = inspector.profile;
      const city = normalize(p.base_city);
      const state = normalize(p.base_state);
      const locationMatch = !location || (location === "Houston area" ? state.includes("tx") && HOUSTON_AREA.some((name) => city.includes(name)) : normalize([p.base_city,p.base_state].filter(Boolean).join(", ")) === normalize(location));
      const disciplineMatch = !discipline || normalize(p.primary_discipline) === normalize(discipline);
      const certificationMatch = includesItem(inspector.certifications, certText);
      const equipmentMatch = includesItem(inspector.equipment, normalize(equipment));
      const activityMatch = !activity || includesItem(inspector.activities, normalize(activity)) || includesItem(inspector.ndtMethods, normalize(activity));
      const industryMatch = !industryText || (industry === "Refinery / Petrochemical" ? inspector.industries.some((x) => /refiner|petrochem/i.test(`${x.name} ${x.code || ""}`)) : includesItem(inspector.industries, industryText));
      const credentialMatch = includesItem(inspector.travelCredentials, credentialText);
      const experienceMatch = !minimumExperience || Number(p.years_experience || 0) >= minExp;
      const availabilityMatch = !availability || normalize(p.availability_status) === normalize(availability);
      const travelMatch = !travel || (travel === "domestic" && Boolean(p.domestic_travel)) || (travel === "international" && Boolean(p.international_travel)) || (travel === "remote" && Boolean(p.remote_review_available));
      const rateMatch = !maxRate || !Number.isFinite(maxRateNumber) || maxRateNumber <= 0 || (p.day_rate != null && Number(p.day_rate) <= maxRateNumber);
      return locationMatch && disciplineMatch && certificationMatch && equipmentMatch && activityMatch && industryMatch && credentialMatch && experienceMatch && availabilityMatch && travelMatch && rateMatch;
    });
  }, [inspectors,location,discipline,certification,equipment,activity,industry,travelCredential,minimumExperience,availability,travel,maxRate]);

  function clearFilters() {
    setLocation(""); setDiscipline(""); setCertification(""); setEquipment(""); setActivity(""); setIndustry(""); setTravelCredential(""); setMinimumExperience(""); setAvailability(""); setTravel(""); setMaxRate(""); setInspectorsNeeded(""); setStartDate(""); setDuration(""); setShiftLength(""); setLocalPreference("");
  }

  const SelectField = ({label,value,onChange,options,placeholder}:{label:string;value:string;onChange:(v:string)=>void;options:string[];placeholder:string}) => (
    <label><span>{label}</span><select value={value} onChange={(e)=>onChange(e.target.value)}><option value="">{placeholder}</option>{options.map((option)=><option key={option} value={option}>{option}</option>)}</select></label>
  );

  return <>
    <section className="hero anonymousHero">
      <p className="sectionEyebrow">Select via an interface</p>
      <h1>Build your inspector criteria</h1>
      <p className="muted heroCopy">Use the standard client selection fields below. InspectSource narrows the anonymous marketplace as requirements are selected.</p>
      {demoMode && <div className="demoBanner"><strong>Demo criteria pre-filled:</strong> These selections represent the same Houston refinery request shown in the natural-language and email examples.</div>}
    </section>

    <section className="panel filterPanel">
      <div className="filterHeader"><div><h2>Assignment requirements</h2><p className="muted">Select only the requirements that matter. Optional fields can remain blank.</p></div>{hasCriteria && <button type="button" className="clearButton" onClick={clearFilters}>Clear all</button>}</div>

      <div className="filterGrid">
        <SelectField label="Inspectors needed" value={inspectorsNeeded} onChange={setInspectorsNeeded} placeholder="Select quantity" options={["1","2","3","4","5+"]} />
        <label><span>Start date</span><input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} /></label>
        <SelectField label="Expected duration" value={duration} onChange={setDuration} placeholder="Select duration" options={["1 day","2-5 days","1 week","2 weeks","3 weeks","1 month","2-3 months","3+ months"]} />
        <SelectField label="Location" value={location} onChange={setLocation} placeholder="Any location" options={locations} />
        <SelectField label="Local preference" value={localPreference} onChange={setLocalPreference} placeholder="No preference" options={["Local required","Local preferred","Travel acceptable"]} />
        <SelectField label="Primary discipline" value={discipline} onChange={setDiscipline} placeholder="Any discipline" options={disciplines} />
        <SelectField label="Certification" value={certification} onChange={setCertification} placeholder="Any certification" options={certifications} />
        <SelectField label="Minimum experience" value={minimumExperience} onChange={setMinimumExperience} placeholder="Any experience" options={["1","3","5","10","15","20"]} />
        <SelectField label="Industry experience" value={industry} onChange={setIndustry} placeholder="Any industry" options={industryOptions} />
        <SelectField label="Travel credential" value={travelCredential} onChange={setTravelCredential} placeholder="Any credential" options={credentialOptions} />
        <SelectField label="Equipment type" value={equipment} onChange={setEquipment} placeholder="Any equipment" options={equipmentOptions} />
        <SelectField label="Inspection activity / NDT" value={activity} onChange={setActivity} placeholder="Any activity or NDT" options={activityOptions} />
        <SelectField label="Availability" value={availability} onChange={setAvailability} placeholder="Any availability" options={availabilityOptions} />
        <SelectField label="Shift length" value={shiftLength} onChange={setShiftLength} placeholder="Any shift" options={["8 hours","10 hours","10-12 hours","12 hours"]} />
        <SelectField label="Travel capability" value={travel} onChange={setTravel} placeholder="Any travel capability" options={["domestic","international","remote"]} />
        <SelectField label="Maximum day rate" value={maxRate} onChange={setMaxRate} placeholder="No maximum" options={["500","750","1000","1250","1500","2000"]} />
      </div>

      {message && <p className="notice">{message}</p>}
      <div className="criteriaFooter"><span>Results update automatically as inspector criteria change.</span><strong>{hasCriteria && !loading ? `${filtered.length} matching inspector${filtered.length===1?"":"s"}` : ""}</strong></div>
    </section>

    <div style={{height:18}} />
    {!hasCriteria ? <section className="panel startPrompt"><h2>Select assignment requirements above</h2><p className="muted">Matching inspector profiles will appear here.</p></section> : <>
      <section className="resultsIntro"><div><p className="sectionEyebrow">Filtered marketplace</p><h2>{loading?"Finding qualified inspectors...":`${filtered.length} inspector${filtered.length===1?"":"s"} match your criteria`}</h2></div><span>Personal contact details remain protected.</span></section>
      <section className="grid anonymousGrid">{filtered.map((inspector)=><InspectorCard key={inspector.profile.inspector_id} inspector={inspector} />)}</section>
      {!loading && filtered.length===0 && <section className="panel emptyResults"><h2>No inspectors match every selected criterion</h2><p className="muted">Broaden one requirement to expand the candidate pool.</p><button type="button" className="clearButton" onClick={clearFilters}>Clear all criteria</button></section>}
    </>}

    <style jsx>{`
      .anonymousHero{padding:34px}.sectionEyebrow{margin:0 0 6px;font-size:.76rem;font-weight:800;letter-spacing:.13em;text-transform:uppercase}.heroCopy{max-width:820px;margin-bottom:0;font-size:1.03rem;line-height:1.65}.demoBanner{margin-top:18px;padding:12px 14px;border:1px solid #f3c969;background:#fff9e8;border-radius:10px;color:#7a5410}.filterPanel{padding:26px}.filterHeader{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:20px}.filterHeader h2{margin:0 0 5px}.filterHeader p{margin:0}.filterGrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.filterGrid label{display:flex;flex-direction:column;gap:7px}.filterGrid label>span{font-size:.82rem;font-weight:800}.filterGrid input,.filterGrid select{width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:10px;padding:11px 12px;background:white;font:inherit;min-height:44px}.filterGrid input:focus,.filterGrid select:focus{outline:2px solid #94a3b8;outline-offset:1px}.criteriaFooter{display:flex;justify-content:space-between;gap:16px;margin-top:20px;padding-top:16px;border-top:1px solid #e2e8f0;color:#64748b;font-size:.9rem}.criteriaFooter strong{color:#0f172a}.clearButton{border:1px solid #cbd5e1;background:white;border-radius:9px;padding:9px 13px;font-weight:700;cursor:pointer}.startPrompt{text-align:center;padding:46px 24px}.resultsIntro{display:flex;justify-content:space-between;gap:16px;align-items:end;margin:4px 0 16px}.resultsIntro h2{margin:0}.resultsIntro span{color:#64748b;font-size:.9rem}.anonymousGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;align-items:stretch}.emptyResults{margin-top:16px;text-align:center;padding:34px}@media(max-width:1100px){.filterGrid{grid-template-columns:repeat(3,minmax(0,1fr))}.anonymousGrid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:760px){.filterGrid{grid-template-columns:1fr 1fr}.anonymousGrid{grid-template-columns:1fr}.resultsIntro,.criteriaFooter{align-items:flex-start;flex-direction:column}}@media(max-width:520px){.filterGrid{grid-template-columns:1fr}}
    `}</style>
  </>;
}
