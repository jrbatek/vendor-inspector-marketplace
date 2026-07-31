"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase";
import {
  parseRequest,
  rankInspectors,
  type MatchResult,
  type SearchInspector,
} from "@/lib/clientSearch";

const EXAMPLE =
  "I need an API 510 inspector near Houston for a refinery turnaround for two weeks. TWIC required. Budget is $900 per day.";

export default function FindInspectorsPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [text, setText] = useState(EXAMPLE);
  const [parsed, setParsed] = useState<ReturnType<typeof parseRequest> | null>(null);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");

  async function loadTextFile(file?: File) {
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["txt", "md", "csv", "json"].includes(ext || "")) {
      setMessage("For this free first version, paste PDF/Word text into the box. TXT, MD, CSV, and JSON uploads work directly.");
      return;
    }
    setText((await file.text()).slice(0, 20000));
    setMessage(`Loaded ${file.name}.`);
  }

  async function search() {
    if (!text.trim()) return setMessage("Describe the inspection requirement first.");
    setSearching(true);
    setMessage("");

    const interpreted = parseRequest(text);
    setParsed(interpreted);

    const queries = await Promise.all([
      supabase.from("inspector_profiles").select(
        "inspector_id,full_name,headline,biography,base_city,base_state,base_country,years_experience,day_rate,currency,availability_status,international_travel,is_verified"
      ),
      supabase.from("inspector_equipment").select("profile_id,equipment_types(id,name,code,category)"),
      supabase.from("inspector_activities").select("profile_id,inspection_activities(id,name,code,category)"),
      supabase.from("inspector_ndt_methods").select("profile_id,ndt_methods(id,name,code,category)"),
      supabase.from("inspector_certifications").select("profile_id,certifications(id,name,code,category)"),
      supabase.from("inspector_codes_standards").select("profile_id,codes_standards(id,name,code,category)"),
      supabase.from("inspector_industries").select("profile_id,industries(id,name,code,category)"),
      supabase.from("inspector_travel_credentials").select("profile_id,travel_credentials(id,name,code,category)"),
    ]);

    const firstError = queries.find(q => q.error)?.error;
    if (firstError) {
      setMessage(firstError.message);
      setSearching(false);
      return;
    }

    const [
      profiles, equipment, activities, ndt, certifications,
      codes, industries, travel
    ] = queries;

    const group = (rows: any[] | null, key: string) => {
      const output: Record<string, any[]> = {};
      for (const row of rows || []) {
        if (!row[key]) continue;
        if (!output[row.profile_id]) output[row.profile_id] = [];
        output[row.profile_id].push(row[key]);
      }
      return output;
    };

    const byEquipment = group(equipment.data, "equipment_types");
    const byActivities = group(activities.data, "inspection_activities");
    const byNdt = group(ndt.data, "ndt_methods");
    const byCert = group(certifications.data, "certifications");
    const byCodes = group(codes.data, "codes_standards");
    const byIndustries = group(industries.data, "industries");
    const byTravel = group(travel.data, "travel_credentials");

    const inspectors: SearchInspector[] = (profiles.data || []).map((p: any) => ({
      ...p,
      equipment: byEquipment[p.inspector_id] || [],
      activities: byActivities[p.inspector_id] || [],
      ndtMethods: byNdt[p.inspector_id] || [],
      certifications: byCert[p.inspector_id] || [],
      codes: byCodes[p.inspector_id] || [],
      industries: byIndustries[p.inspector_id] || [],
      travelCredentials: byTravel[p.inspector_id] || [],
    }));

    const ranked = rankInspectors(interpreted, inspectors);
    setResults(ranked);
    setSearching(false);

    const { data: authData } = await supabase.auth.getUser();

    await supabase.from("client_search_requests").insert({
      client_id: authData.user?.id || null,
      request_text: text,
      parsed_request: interpreted,
      result_count: ranked.length,
    });
  }

  async function requestAvailability(inspector: MatchResult) {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setMessage("Log in or register before requesting availability.");
      return;
    }

    const { error } = await supabase.from("client_inquiries").insert({
      client_id: data.user.id,
      inspector_id: inspector.inspector_id,
      request_text: text,
      status: "new",
    });

    setMessage(error ? error.message : `Availability request sent for ${inspector.full_name || "this inspector"}.`);
  }

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">InspectSource Client Portal</p>
        <h1>Describe the inspector you need</h1>
        <p>Use plain English. InspectSource interprets the request and ranks profiles using stored facts.</p>

        <textarea rows={8} value={text} onChange={e => setText(e.target.value)} />

        <div className="actions">
          <label className="upload">
            Add scope file
            <input type="file" onChange={e => void loadTextFile(e.target.files?.[0])} />
          </label>
          <button onClick={() => void search()} disabled={searching}>
            {searching ? "Searching..." : "Find Inspectors"}
          </button>
        </div>

        {message && <p className="notice">{message}</p>}
      </section>

      {parsed && (
        <section className="understood">
          <h2>InspectSource understood</h2>
          <div className="tags">
            {parsed.location && <span>Location: {parsed.location}</span>}
            {parsed.durationDays && <span>{parsed.durationDays} days</span>}
            {parsed.maximumDayRate && <span>Max ${parsed.maximumDayRate}/day</span>}
            {parsed.minimumYearsExperience && <span>{parsed.minimumYearsExperience}+ years</span>}
            {parsed.availabilityRequired && <span>Availability required</span>}
            {parsed.terms.slice(0, 12).map(term => <span key={term}>{term}</span>)}
          </div>
        </section>
      )}

      {parsed && (
        <section className="results">
          <h2>{results.length} inspectors found</h2>

          {results.map(inspector => (
            <article className="card" key={inspector.inspector_id}>
              <div className="score">{inspector.score}%</div>
              <div>
                <h3>{inspector.full_name || "Inspector"}</h3>
                <p>{inspector.headline || "Vendor Inspection Professional"}</p>

                <div className="meta">
                  <span>{[inspector.base_city, inspector.base_state].filter(Boolean).join(", ") || "Location not listed"}</span>
                  {inspector.years_experience !== null && <span>{inspector.years_experience}+ years</span>}
                  <span>{inspector.availability_status || "Availability not listed"}</span>
                  <span>{rate(inspector.day_rate, inspector.currency)}</span>
                </div>

                <div className="columns">
                  <div>
                    <strong>Why it matched</strong>
                    <ul>{(inspector.reasons.length ? inspector.reasons : ["Profile available"]).slice(0, 5).map(x => <li key={x}>{x}</li>)}</ul>
                  </div>
                  {inspector.gaps.length > 0 && (
                    <div>
                      <strong>Confirm before hiring</strong>
                      <ul>{inspector.gaps.slice(0, 4).map(x => <li key={x}>{x}</li>)}</ul>
                    </div>
                  )}
                </div>

                <div className="actions">
                  <Link href={`/inspectors/${inspector.inspector_id}`} className="secondary">View Profile</Link>
                  <button onClick={() => void requestAvailability(inspector)}>Request Availability</button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      <style jsx>{`
        .page{max-width:1080px;margin:0 auto;padding:28px 18px 70px}.hero,.understood,.card{border:1px solid rgba(127,127,127,.28);border-radius:18px;background:rgba(127,127,127,.04)}.hero{padding:28px}.eyebrow{font-size:.78rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.hero h1{font-size:2rem;margin:0}.hero textarea{width:100%;box-sizing:border-box;margin-top:14px;padding:15px;border:1px solid rgba(127,127,127,.4);border-radius:12px;background:transparent;color:inherit;font:inherit}.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}.upload,.secondary{display:inline-flex;align-items:center;justify-content:center;padding:10px 14px;border:1px solid rgba(127,127,127,.4);border-radius:10px;text-decoration:none;color:inherit;cursor:pointer}.upload input{display:none}.notice{padding:12px;border-radius:10px;background:rgba(127,127,127,.1)}.understood{padding:20px;margin-top:16px}.tags,.meta{display:flex;gap:8px;flex-wrap:wrap}.tags span,.meta span{padding:7px 10px;border-radius:999px;background:rgba(127,127,127,.1);font-size:.86rem}.results{margin-top:26px}.card{display:grid;grid-template-columns:84px 1fr;gap:18px;padding:20px;margin-bottom:14px}.score{display:grid;place-items:center;width:70px;height:70px;border:2px solid currentColor;border-radius:50%;font-size:1.15rem;font-weight:900}.card h3{margin:0}.columns{display:grid;grid-template-columns:1fr 1fr;gap:18px}.columns ul{padding-left:20px}@media(max-width:700px){.card{grid-template-columns:1fr}.columns{grid-template-columns:1fr}}
      `}</style>
    </main>
  );
}

function rate(value: number | null, currency: string | null) {
  if (value === null) return "Rate not listed";
  return `${currency || "USD"} ${value}/day`;
}
