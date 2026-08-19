"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";

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

export default function InspectorsPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [demoMode, setDemoMode] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [message, setMessage] = useState("");

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
    setMessage("");

    const [profilesResult, certResult, industryResult, credentialResult, equipmentResult, activitiesResult, ndtResult] = await Promise.all([
      supabase.from("inspector_profiles").select("inspector_id,primary_discipline,base_city,base_state,availability_status"),
      supabase.from("inspector_certifications").select("certifications(name,code)"),
      supabase.from("inspector_industries").select("industries(name,code)"),
      supabase.from("inspector_travel_credentials").select("travel_credentials(name,code)"),
      supabase.from("inspector_equipment").select("equipment_types(name,code)"),
      supabase.from("inspector_activities").select("inspection_activities(name,code)"),
      supabase.from("inspector_ndt_methods").select("ndt_methods(name,code)"),
    ]);

    const firstError = [profilesResult, certResult, industryResult, credentialResult, equipmentResult, activitiesResult, ndtResult].find((result) => result.error)?.error;
    if (firstError) {
      setMessage(firstError.message);
      setLoadingOptions(false);
      return;
    }

    const unique = (values: Array<string | null | undefined>, seeded: string[] = []) =>
      Array.from(new Set([...seeded, ...values.filter(Boolean) as string[]])).sort((a, b) => a.localeCompare(b));

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
    setActivityOptions(unique([
      ...relationshipValues(activitiesResult.data, "inspection_activities"),
      ...relationshipValues(ndtResult.data, "ndt_methods"),
    ]));
    setLoadingOptions(false);
  }

  const uniqueProfileValues = (values: Array<string | null | undefined>, seeded: string[] = []) =>
    Array.from(new Set([...seeded, ...values.filter(Boolean) as string[]])).sort((a, b) => a.localeCompare(b));

  const locations = useMemo(
    () => uniqueProfileValues(profiles.map((p) => [p.base_city, p.base_state].filter(Boolean).join(", ")), ["Houston area"]),
    [profiles],
  );
  const disciplines = useMemo(() => uniqueProfileValues(profiles.map((p) => p.primary_discipline)), [profiles]);
  const availabilityOptions = useMemo(() => uniqueProfileValues(profiles.map((p) => p.availability_status)), [profiles]);

  const hasCriteria = [
    inspectorsNeeded, startDate, duration, location, localPreference, discipline,
    certification, minimumExperience, industry, travelCredential, equipment,
    activity, availability, shiftLength, travel, maxRate,
  ].some((value) => value.trim() !== "");

  function clearFilters() {
    setInspectorsNeeded(""); setStartDate(""); setDuration(""); setLocation("");
    setLocalPreference(""); setDiscipline(""); setCertification(""); setMinimumExperience("");
    setIndustry(""); setTravelCredential(""); setEquipment(""); setActivity("");
    setAvailability(""); setShiftLength(""); setTravel(""); setMaxRate("");
  }

  function buildStructuredRequest() {
    const sentences: string[] = [];
    const quantity = inspectorsNeeded || "an";
    const role = discipline ? `${discipline} inspector${quantity === "1" ? "" : "s"}` : `inspector${quantity === "1" ? "" : "s"}`;
    sentences.push(`We need ${quantity} ${role}.`);

    if (location) sentences.push(`Location: ${location}.`);
    if (localPreference) sentences.push(`Location preference: ${localPreference}.`);
    if (startDate) sentences.push(`Start date: ${startDate}.`);
    if (duration) sentences.push(`Expected duration: ${duration}.`);
    if (certification) sentences.push(`Required certification: ${certification}.`);
    if (minimumExperience) sentences.push(`Minimum experience: ${minimumExperience} years.`);
    if (industry) sentences.push(`Industry experience: ${industry}.`);
    if (travelCredential) sentences.push(`Required travel/site credential: ${travelCredential}.`);
    if (equipment) sentences.push(`Equipment experience: ${equipment}.`);
    if (activity) sentences.push(`Inspection activity or NDT: ${activity}.`);
    if (availability) sentences.push(`Availability requirement: ${availability}.`);
    if (shiftLength) sentences.push(`Shift length: ${shiftLength}.`);
    if (travel) sentences.push(`Travel capability: ${travel}.`);
    if (maxRate) sentences.push(`Maximum day rate: $${maxRate} per day.`);

    return sentences.join(" ");
  }

  function identifyInspectors() {
    if (!hasCriteria) {
      setMessage("Select at least one assignment requirement before identifying inspectors.");
      return;
    }
    const request = buildStructuredRequest();
    window.location.href = `/find-inspectors?request=${encodeURIComponent(request)}`;
  }

  const SelectField = ({ label, value, onChange, options, placeholder }: { label: string; value: string; onChange: (value: string) => void; options: string[]; placeholder: string }) => (
    <label>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{placeholder}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );

  return (
    <>
      <section className="hero anonymousHero">
        <p className="sectionEyebrow">Select via an interface</p>
        <h1>Build your inspector criteria</h1>
        <p className="muted heroCopy">
          Use the standard client selection fields below. When you submit the requirements,
          InspectSource uses the same matching engine as natural-language and email requests.
        </p>
        {demoMode && (
          <div className="demoBanner">
            <strong>Demo criteria pre-filled:</strong> These selections represent the same Houston refinery request shown in the natural-language and email examples.
          </div>
        )}
      </section>

      <section className="panel filterPanel">
        <div className="filterHeader">
          <div>
            <h2>Assignment requirements</h2>
            <p className="muted">Select only the requirements that matter. Optional fields can remain blank.</p>
          </div>
          {hasCriteria && <button type="button" className="clearButton" onClick={clearFilters}>Clear all</button>}
        </div>

        <div className="filterGrid">
          <SelectField label="Inspectors needed" value={inspectorsNeeded} onChange={setInspectorsNeeded} placeholder="Select quantity" options={["1", "2", "3", "4", "5+"]} />
          <label><span>Start date</span><input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
          <SelectField label="Expected duration" value={duration} onChange={setDuration} placeholder="Select duration" options={["1 day", "2-5 days", "1 week", "2 weeks", "3 weeks", "1 month", "2-3 months", "3+ months"]} />
          <SelectField label="Location" value={location} onChange={setLocation} placeholder="Any location" options={locations} />
          <SelectField label="Local preference" value={localPreference} onChange={setLocalPreference} placeholder="No preference" options={["Local required", "Local preferred", "Travel acceptable"]} />
          <SelectField label="Primary discipline" value={discipline} onChange={setDiscipline} placeholder="Any discipline" options={disciplines} />
          <SelectField label="Certification" value={certification} onChange={setCertification} placeholder="Any certification" options={certifications} />
          <SelectField label="Minimum experience" value={minimumExperience} onChange={setMinimumExperience} placeholder="Any experience" options={["1", "3", "5", "10", "15", "20"]} />
          <SelectField label="Industry experience" value={industry} onChange={setIndustry} placeholder="Any industry" options={industries} />
          <SelectField label="Travel credential" value={travelCredential} onChange={setTravelCredential} placeholder="Any credential" options={credentials} />
          <SelectField label="Equipment type" value={equipment} onChange={setEquipment} placeholder="Any equipment" options={equipmentOptions} />
          <SelectField label="Inspection activity / NDT" value={activity} onChange={setActivity} placeholder="Any activity or NDT" options={activityOptions} />
          <SelectField label="Availability" value={availability} onChange={setAvailability} placeholder="Any availability" options={availabilityOptions} />
          <SelectField label="Shift length" value={shiftLength} onChange={setShiftLength} placeholder="Any shift" options={["8 hours", "10 hours", "10-12 hours", "12 hours"]} />
          <SelectField label="Travel capability" value={travel} onChange={setTravel} placeholder="Any travel capability" options={["domestic", "international", "remote"]} />
          <SelectField label="Maximum day rate" value={maxRate} onChange={setMaxRate} placeholder="No maximum" options={["500", "750", "1000", "1250", "1500", "2000"]} />
        </div>

        {message && <p className="notice">{message}</p>}

        <div className="submitRow">
          <div>
            <strong>Ready to match?</strong>
            <span>The selections above will be evaluated by the InspectSource matching engine.</span>
          </div>
          <button type="button" className="identifyButton" onClick={identifyInspectors} disabled={loadingOptions}>
            {loadingOptions ? "Loading criteria..." : "Identify inspectors"}
          </button>
        </div>
      </section>

      <style jsx>{`
        .anonymousHero{padding:34px}.sectionEyebrow{margin:0 0 6px;font-size:.76rem;font-weight:800;letter-spacing:.13em;text-transform:uppercase}.heroCopy{max-width:820px;margin-bottom:0;font-size:1.03rem;line-height:1.65}.demoBanner{margin-top:18px;padding:12px 14px;border:1px solid #f3c969;background:#fff9e8;border-radius:10px;color:#7a5410}.filterPanel{padding:26px}.filterHeader{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:20px}.filterHeader h2{margin:0 0 5px}.filterHeader p{margin:0}.filterGrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.filterGrid label{display:flex;flex-direction:column;gap:7px}.filterGrid label>span{font-size:.82rem;font-weight:800}.filterGrid input,.filterGrid select{width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:10px;padding:11px 12px;background:white;font:inherit;min-height:44px}.clearButton{border:1px solid #cbd5e1;background:white;border-radius:9px;padding:9px 13px;font-weight:700;cursor:pointer}.submitRow{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-top:24px;padding-top:20px;border-top:1px solid #e2e8f0}.submitRow>div{display:flex;flex-direction:column;gap:3px}.submitRow span{color:#64748b;font-size:.9rem}.identifyButton{border:0;border-radius:10px;background:#0f172a;color:white;font-weight:800;padding:13px 22px;cursor:pointer;white-space:nowrap}.identifyButton:hover{background:#1e293b}.identifyButton:disabled{opacity:.55;cursor:not-allowed}.notice{margin-top:18px;padding:12px 14px;border-radius:10px;background:#fff7ed;border:1px solid #fdba74;color:#9a3412}@media(max-width:1050px){.filterGrid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:680px){.filterGrid{grid-template-columns:1fr}.filterHeader,.submitRow{flex-direction:column;align-items:stretch}.identifyButton{width:100%}}
      `}</style>
    </>
  );
}
