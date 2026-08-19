"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import type { InspectorProfile } from "@/lib/types";
import InspectorCard, {
  type DirectoryInspector,
  type QualificationItem,
} from "@/components/InspectorCard";

type FilterInspector = DirectoryInspector & {
  equipment: QualificationItem[];
  activities: QualificationItem[];
};

export default function InspectorsPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [inspectors, setInspectors] = useState<FilterInspector[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [location, setLocation] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [certification, setCertification] = useState("");
  const [equipment, setEquipment] = useState("");
  const [activity, setActivity] = useState("");
  const [industry, setIndustry] = useState("");
  const [availability, setAvailability] = useState("");
  const [travel, setTravel] = useState("");
  const [maxRate, setMaxRate] = useState("");

  useEffect(() => {
    void loadInspectors();

    const intervalId = window.setInterval(() => {
      void loadInspectors();
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, []);

  async function loadInspectors() {
    setLoading(true);
    setMessage("");

    const [
      profilesResult,
      certificationsResult,
      ndtResult,
      industriesResult,
      travelResult,
      equipmentResult,
      activitiesResult,
    ] = await Promise.all([
      supabase
        .from("inspector_profiles")
        .select("*")
        .order("created_at", { ascending: false }),

      supabase
        .from("inspector_certifications")
        .select("profile_id, certifications(id,name,code,category)"),

      supabase
        .from("inspector_ndt_methods")
        .select("profile_id, level, ndt_methods(id,name,code,category)"),

      supabase
        .from("inspector_industries")
        .select("profile_id, industries(id,name,code,category)"),

      supabase
        .from("inspector_travel_credentials")
        .select("profile_id, travel_credentials(id,name,code,category)"),

      supabase
        .from("inspector_equipment")
        .select("profile_id, equipment_types(id,name,code,category)"),

      supabase
        .from("inspector_activities")
        .select("profile_id, inspection_activities(id,name,code,category)"),
    ]);

    const firstError = [
      profilesResult,
      certificationsResult,
      ndtResult,
      industriesResult,
      travelResult,
      equipmentResult,
      activitiesResult,
    ].find((result) => result.error)?.error;

    if (firstError) {
      setMessage(firstError.message);
      setInspectors([]);
      setLoading(false);
      return;
    }

    const groupRelated = (
      rows: any[] | null,
      relationshipName: string,
    ): Record<string, QualificationItem[]> => {
      const grouped: Record<string, QualificationItem[]> = {};

      for (const row of rows || []) {
        const related = row[relationshipName];
        if (!related || !row.profile_id) continue;
        if (!grouped[row.profile_id]) grouped[row.profile_id] = [];

        grouped[row.profile_id].push({
          ...related,
          level: row.level || null,
        });
      }

      return grouped;
    };

    const certificationsByInspector = groupRelated(certificationsResult.data, "certifications");
    const ndtByInspector = groupRelated(ndtResult.data, "ndt_methods");
    const industriesByInspector = groupRelated(industriesResult.data, "industries");
    const travelByInspector = groupRelated(travelResult.data, "travel_credentials");
    const equipmentByInspector = groupRelated(equipmentResult.data, "equipment_types");
    const activitiesByInspector = groupRelated(activitiesResult.data, "inspection_activities");

    const directoryInspectors: FilterInspector[] = (
      (profilesResult.data || []) as InspectorProfile[]
    ).map((profile) => ({
      profile,
      certifications: certificationsByInspector[profile.inspector_id] || [],
      ndtMethods: ndtByInspector[profile.inspector_id] || [],
      industries: industriesByInspector[profile.inspector_id] || [],
      travelCredentials: travelByInspector[profile.inspector_id] || [],
      equipment: equipmentByInspector[profile.inspector_id] || [],
      activities: activitiesByInspector[profile.inspector_id] || [],
    }));

    setInspectors(directoryInspectors);
    setLoading(false);
  }

  const hasCriteria = [
    location,
    discipline,
    certification,
    equipment,
    activity,
    industry,
    availability,
    travel,
    maxRate,
  ].some((value) => value.trim() !== "");

  const filtered = useMemo(() => {
    const normalize = (value: unknown) => String(value || "").trim().toLowerCase();
    const includesItem = (items: QualificationItem[], value: string) => {
      if (!value) return true;
      return items.some((item) =>
        [item.name, item.code, item.category, item.level]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(value),
      );
    };

    const locationText = normalize(location);
    const disciplineText = normalize(discipline);
    const certificationText = normalize(certification);
    const equipmentText = normalize(equipment);
    const activityText = normalize(activity);
    const industryText = normalize(industry);
    const availabilityText = normalize(availability);
    const travelText = normalize(travel);
    const maxRateNumber = Number(maxRate);

    return inspectors.filter((inspector) => {
      const profile = inspector.profile;
      const inspectorLocation = normalize(
        [profile.base_city, profile.base_state, profile.base_country]
          .filter(Boolean)
          .join(" "),
      );

      const disciplineMatch = !disciplineText || normalize(profile.primary_discipline).includes(disciplineText);
      const locationMatch = !locationText || inspectorLocation.includes(locationText);
      const certificationMatch = includesItem(inspector.certifications, certificationText);
      const equipmentMatch = includesItem(inspector.equipment, equipmentText);
      const activityMatch =
        includesItem(inspector.activities, activityText) ||
        includesItem(inspector.ndtMethods, activityText);
      const industryMatch = includesItem(inspector.industries, industryText);
      const availabilityMatch = !availabilityText || normalize(profile.availability_status).includes(availabilityText);

      const travelMatch =
        !travelText ||
        (travelText === "domestic" && Boolean(profile.domestic_travel)) ||
        (travelText === "international" && Boolean(profile.international_travel)) ||
        (travelText === "remote" && Boolean(profile.remote_review_available));

      const rateMatch =
        !maxRate.trim() ||
        !Number.isFinite(maxRateNumber) ||
        maxRateNumber <= 0 ||
        (profile.day_rate !== null &&
          profile.day_rate !== undefined &&
          Number(profile.day_rate) <= maxRateNumber);

      return (
        disciplineMatch &&
        locationMatch &&
        certificationMatch &&
        equipmentMatch &&
        activityMatch &&
        industryMatch &&
        availabilityMatch &&
        travelMatch &&
        rateMatch
      );
    });
  }, [
    inspectors,
    location,
    discipline,
    certification,
    equipment,
    activity,
    industry,
    availability,
    travel,
    maxRate,
  ]);

  function clearFilters() {
    setLocation("");
    setDiscipline("");
    setCertification("");
    setEquipment("");
    setActivity("");
    setIndustry("");
    setAvailability("");
    setTravel("");
    setMaxRate("");
  }

  return (
    <>
      <section className="hero anonymousHero">
        <p className="sectionEyebrow">Select via an interface</p>
        <h1>Build your inspector criteria</h1>
        <p className="muted heroCopy">
          Define the assignment requirements below. InspectSource will narrow the marketplace to inspectors who fit the selected criteria while keeping their identities protected.
        </p>
      </section>

      <section className="panel filterPanel">
        <div className="filterHeader">
          <div>
            <h2>Inspector requirements</h2>
            <p className="muted">Enter only the criteria that matter for this assignment. Leave anything optional blank.</p>
          </div>
          {hasCriteria && (
            <button type="button" className="clearButton" onClick={clearFilters}>Clear all</button>
          )}
        </div>

        <div className="filterGrid">
          <label>
            <span>Location</span>
            <input placeholder="e.g. Houston, Texas" value={location} onChange={(e) => setLocation(e.target.value)} />
          </label>

          <label>
            <span>Primary discipline</span>
            <input placeholder="e.g. Mechanical, Welding, NDT" value={discipline} onChange={(e) => setDiscipline(e.target.value)} />
          </label>

          <label>
            <span>Certification</span>
            <input placeholder="e.g. API 510, API 570" value={certification} onChange={(e) => setCertification(e.target.value)} />
          </label>

          <label>
            <span>Equipment type</span>
            <input placeholder="e.g. Pressure Vessel, Heat Exchanger" value={equipment} onChange={(e) => setEquipment(e.target.value)} />
          </label>

          <label>
            <span>Inspection activity / NDT</span>
            <input placeholder="e.g. Vendor surveillance, UT, PT" value={activity} onChange={(e) => setActivity(e.target.value)} />
          </label>

          <label>
            <span>Industry experience</span>
            <input placeholder="e.g. Refinery, LNG, Power" value={industry} onChange={(e) => setIndustry(e.target.value)} />
          </label>

          <label>
            <span>Availability</span>
            <select value={availability} onChange={(e) => setAvailability(e.target.value)}>
              <option value="">Any availability</option>
              <option value="available immediately">Available immediately</option>
              <option value="available in 1 week">Available in 1 week</option>
              <option value="available in 2 weeks">Available in 2 weeks</option>
            </select>
          </label>

          <label>
            <span>Travel capability</span>
            <select value={travel} onChange={(e) => setTravel(e.target.value)}>
              <option value="">Any travel capability</option>
              <option value="domestic">Domestic travel</option>
              <option value="international">International travel</option>
              <option value="remote">Remote review</option>
            </select>
          </label>

          <label>
            <span>Maximum day rate</span>
            <div className="rateField"><span>$</span><input inputMode="numeric" placeholder="e.g. 1000" value={maxRate} onChange={(e) => setMaxRate(e.target.value.replace(/[^0-9.]/g, ""))} /></div>
          </label>
        </div>

        {message && <p className="notice">{message}</p>}

        <div className="criteriaFooter">
          <span>Results update automatically as criteria are entered.</span>
          <strong>{hasCriteria && !loading ? `${filtered.length} matching inspector${filtered.length === 1 ? "" : "s"}` : ""}</strong>
        </div>
      </section>

      <div style={{ height: 18 }} />

      {!hasCriteria ? (
        <section className="panel startPrompt">
          <div className="promptIcon">⌕</div>
          <h2>Start with the assignment requirements</h2>
          <p className="muted">The inspector list will appear after you enter at least one criterion above.</p>
        </section>
      ) : (
        <>
          <section className="resultsIntro">
            <div>
              <p className="sectionEyebrow">Filtered marketplace</p>
              <h2>{loading ? "Finding qualified inspectors..." : `${filtered.length} inspector${filtered.length === 1 ? "" : "s"} match your criteria`}</h2>
            </div>
            <span>Personal contact details remain protected.</span>
          </section>

          <section className="grid anonymousGrid">
            {filtered.map((inspector) => (
              <InspectorCard key={inspector.profile.inspector_id} inspector={inspector} />
            ))}
          </section>

          {!loading && filtered.length === 0 && (
            <section className="panel emptyResults">
              <h2>No inspectors match every selected criterion</h2>
              <p className="muted">Remove or broaden one requirement to expand the candidate pool.</p>
              <button type="button" className="clearButton" onClick={clearFilters}>Clear all criteria</button>
            </section>
          )}
        </>
      )}

      <style jsx>{`
        .anonymousHero{padding:34px}.sectionEyebrow{margin:0 0 6px;font-size:.76rem;font-weight:800;letter-spacing:.13em;text-transform:uppercase}.heroCopy{max-width:820px;margin-bottom:0;font-size:1.03rem;line-height:1.65}.filterPanel{padding:26px}.filterHeader{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:20px}.filterHeader h2{margin:0 0 5px}.filterHeader p{margin:0}.filterGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.filterGrid label{display:flex;flex-direction:column;gap:7px}.filterGrid label>span{font-size:.82rem;font-weight:800}.filterGrid input,.filterGrid select{width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:10px;padding:11px 12px;background:white;font:inherit;min-height:44px}.filterGrid input:focus,.filterGrid select:focus{outline:2px solid #94a3b8;outline-offset:1px}.rateField{display:flex;align-items:center;border:1px solid #cbd5e1;border-radius:10px;background:white;overflow:hidden}.rateField>span{padding-left:12px;color:#64748b;font-weight:700}.rateField input{border:0;border-radius:0}.rateField input:focus{outline:0}.criteriaFooter{display:flex;justify-content:space-between;gap:16px;margin-top:20px;padding-top:16px;border-top:1px solid #e2e8f0;color:#64748b;font-size:.9rem}.criteriaFooter strong{color:#0f172a}.clearButton{border:1px solid #cbd5e1;background:white;border-radius:9px;padding:9px 13px;font-weight:700;cursor:pointer}.clearButton:hover{background:#f8fafc}.startPrompt{text-align:center;padding:46px 24px}.startPrompt h2{margin:10px 0 6px}.promptIcon{margin:auto;width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:#0f172a;color:white;font-size:1.5rem}.resultsIntro{display:flex;justify-content:space-between;gap:16px;align-items:end;margin:4px 0 16px}.resultsIntro h2{margin:0}.resultsIntro span{color:#64748b;font-size:.9rem}.anonymousGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;align-items:stretch}.emptyResults{margin-top:16px;text-align:center;padding:34px}.emptyResults h2{margin-top:0}@media(max-width:1050px){.filterGrid,.anonymousGrid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:720px){.filterGrid,.anonymousGrid{grid-template-columns:1fr}.filterHeader,.criteriaFooter,.resultsIntro{flex-direction:column;align-items:flex-start}}
      `}</style>
    </>
  );
}
