"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase";
import { inspectorLabel, type MatchResult, type ReferenceItem, type SearchInspector } from "@/lib/clientSearch";
import { coordinateProject, type ProjectBrief } from "@/lib/projectCoordinator";

const EXAMPLE =
  "I need an API 570 inspector near Houston for a refinery turnaround starting September 14 for three weeks. TWIC required. Budget is $950 per day.";

export default function FindInspectorsPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [text, setText] = useState(EXAMPLE);
  const [parsed, setParsed] = useState<ProjectBrief | null>(null);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  async function loadTextFile(file?: File) {
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!["txt", "md", "csv", "json"].includes(extension || "")) {
      setMessage("Paste PDF or Word scope text into the request box. TXT, MD, CSV, and JSON files load directly.");
      return;
    }

    setText((await file.text()).slice(0, 20000));
    setMessage(`Loaded ${file.name}. Review the text and search.`);
  }

  async function search() {
    if (!text.trim()) {
      setMessage("Describe the inspection assignment first.");
      return;
    }

    setSearching(true);
    setMessage("");
    setSelected({});

    const queries = await Promise.all([
      supabase.from("inspector_profiles").select(
        "inspector_id,primary_discipline,biography,base_city,base_state,base_country,years_experience,day_rate,currency,availability_status,available_from,domestic_travel,international_travel,remote_review_available,is_verified"
      ),
      supabase.from("inspector_equipment").select("profile_id,equipment_types(id,name,code,category)"),
      supabase.from("inspector_activities").select("profile_id,inspection_activities(id,name,code,category)"),
      supabase.from("inspector_ndt_methods").select("profile_id,ndt_methods(id,name,code,category)"),
      supabase.from("inspector_certifications").select("profile_id,certifications(id,name,code,category)"),
      supabase.from("inspector_codes_standards").select("profile_id,codes_standards(id,name,code,category)"),
      supabase.from("inspector_industries").select("profile_id,industries(id,name,code,category)"),
      supabase.from("inspector_languages").select("profile_id,languages(id,name,code,region)"),
      supabase.from("inspector_travel_credentials").select("profile_id,travel_credentials(id,name,code,category)"),
    ]);

    const error = queries.find((query) => query.error)?.error;
    if (error) {
      setMessage(error.message);
      setSearching(false);
      return;
    }

    const [profiles, equipment, activities, ndt, certifications, codes, industries, languages, travel] = queries;

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

    const equipmentByProfile = group(equipment.data, "equipment_types");
    const activitiesByProfile = group(activities.data, "inspection_activities");
    const ndtByProfile = group(ndt.data, "ndt_methods");
    const certificationsByProfile = group(certifications.data, "certifications");
    const codesByProfile = group(codes.data, "codes_standards");
    const industriesByProfile = group(industries.data, "industries");
    const languagesByProfile = group(languages.data, "languages");
    const travelByProfile = group(travel.data, "travel_credentials");

    const inspectors: SearchInspector[] = (profiles.data || []).map((profile: any) => ({
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

    const recommendation = coordinateProject(text, inspectors);
    setParsed(recommendation.brief);
    setResults(recommendation.shortlist);
    setSearching(false);

    const { data: auth } = await supabase.auth.getUser();
    await supabase.from("client_search_requests").insert({
      client_id: auth.user?.id || null,
      request_text: text,
      parsed_request: recommendation.brief,
      result_count: recommendation.shortlist.length,
      status: "draft",
    });
  }

  async function createRequest() {
    const selectedInspectors = results.filter((result) => selected[result.inspector_id]);

    if (!selectedInspectors.length) {
      setMessage("Select at least one inspector before sending the request.");
      return;
    }

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setMessage("Log in or register as a client before sending availability requests.");
      return;
    }

    const requestId = crypto.randomUUID();
    const requestInsert = await supabase.from("client_requests").insert({
      id: requestId,
      client_id: auth.user.id,
      request_text: text,
      parsed_request: parsed,
      status: "submitted",
    });

    if (requestInsert.error) {
      setMessage(requestInsert.error.message);
      return;
    }

    const inquiryRows = selectedInspectors.map((inspector) => ({
      client_id: auth.user!.id,
      inspector_id: inspector.inspector_id,
      client_request_id: requestId,
      request_text: text,
      match_score: inspector.score,
      status: "new",
    }));

    const inquiryInsert = await supabase.from("client_inquiries").insert(inquiryRows);
    if (inquiryInsert.error) {
      setMessage(inquiryInsert.error.message);
      return;
    }

    setMessage(`Request sent to ${selectedInspectors.length} inspector${selectedInspectors.length === 1 ? "" : "s"}.`);
  }

  return (
    <main className="clientPage">
      <section className="intakeCard">
        <p className="eyebrow">InspectSource Client Assistant</p>
        <h1>Tell us what inspection support you need</h1>
        <p className="intro">
          Describe the assignment naturally. InspectSource converts it into structured requirements,
          verifies profile facts, and ranks anonymous inspectors by fit.
        </p>

        <textarea
          rows={8}
          value={text}
          onChange={(event) => setText(event.target.value)}
          aria-label="Inspection assignment"
        />

        <div className="actions">
          <label className="fileButton">
            Add scope text file
            <input
              type="file"
              accept=".txt,.md,.csv,.json,.pdf,.doc,.docx"
              onChange={(event) => void loadTextFile(event.target.files?.[0])}
            />
          </label>

          <button type="button" onClick={() => void search()} disabled={searching}>
            {searching ? "Analyzing requirement..." : "Find Qualified Inspectors"}
          </button>
        </div>

        {message && <p className="notice">{message}</p>}
      </section>

      {parsed && (
        <section className="understoodCard">
          <div>
            <p className="eyebrow">Requirement summary</p>
            <h2>InspectSource understood</h2>
          </div>

          <div className="tags">
            {parsed.location && <span>Location: {parsed.location}</span>}
            {parsed.startDate && <span>Start: {parsed.startDate}</span>}
            {parsed.durationDays && <span>Duration: {parsed.durationDays} days</span>}
            {parsed.maximumDayRate && <span>Budget: up to ${parsed.maximumDayRate}/day</span>}
            {parsed.minimumYearsExperience && <span>{parsed.minimumYearsExperience}+ years</span>}
            {parsed.internationalTravelRequired && <span>International/offshore travel</span>}
            {parsed.remoteAllowed && <span>Remote review allowed</span>}
            {parsed.requiredTerms.slice(0, 12).map((term) => <span key={term}>{term}</span>)}
          </div>
        </section>
      )}

      {parsed && (
        <section className="resultsSection">
          <div className="resultsHeader">
            <div>
              <p className="eyebrow">Anonymous ranked candidates</p>
              <h2>{results.length} inspectors recommended</h2>
            </div>

            <button type="button" onClick={() => void createRequest()}>
              Send Availability Request
            </button>
          </div>

          <div className="resultList">
            {results.map((inspector) => (
              <article className="resultCard" key={inspector.inspector_id}>
                <label className="selectBox">
                  <input
                    type="checkbox"
                    checked={Boolean(selected[inspector.inspector_id])}
                    onChange={(event) => setSelected((current) => ({ ...current, [inspector.inspector_id]: event.target.checked }))}
                  />
                  Select
                </label>

                <div className="score">{inspector.score}%</div>
                <div className="resultBody">
                  <div className="titleRow">
                    <div>
                      <h3>{inspectorLabel(inspector)}</h3>
                      <p>{[inspector.base_city, inspector.base_state, inspector.base_country].filter(Boolean).join(", ") || "Location available through InspectSource"}</p>
                    </div>
                    <span className={inspector.is_verified ? "verified" : "prequalified"}>{inspector.is_verified ? "Verified by InspectSource" : "Pre-Qualified"}</span>
                  </div>

                  <div className="facts">
                    {inspector.years_experience !== null && <span>{inspector.years_experience}+ years</span>}
                    <span>{inspector.availability_status || "Confirm availability"}</span>
                    <span>{formatRate(inspector.day_rate, inspector.currency)}</span>
                  </div>

                  <div className="columns">
                    <div><strong>Why this inspector matched</strong><ul>{(inspector.reasons.length ? inspector.reasons : ["Qualification profile available for review"]).slice(0, 6).map((reason) => <li key={reason}>{reason}</li>)}</ul></div>
                    <div><strong>Items to confirm</strong><ul>{(inspector.questions.length ? inspector.questions : ["No major gaps identified from the stored profile"]).slice(0, 5).map((question) => <li key={question}>{question}</li>)}</ul></div>
                  </div>

                  <Link className="qualificationLink" href={`/inspectors/${inspector.inspector_id}`}>Review Qualifications</Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <style jsx>{`
        .clientPage{max-width:1120px;margin:0 auto;padding:30px 18px 70px}.intakeCard,.understoodCard,.resultCard{border:1px solid #e5e7eb;border-radius:18px;background:#fff}.intakeCard{padding:30px;box-shadow:0 12px 34px rgba(17,24,39,.06)}.eyebrow{margin:0 0 6px;font-size:.76rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.intakeCard h1{margin:0;font-size:2rem}.intro{max-width:780px;color:#64748b;line-height:1.65}.intakeCard textarea{width:100%;box-sizing:border-box;margin-top:14px;padding:16px;border:1px solid #cbd5e1;border-radius:12px;font:inherit;resize:vertical}.actions,.resultsHeader{display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin-top:15px}.fileButton,.qualificationLink{display:inline-flex;align-items:center;justify-content:center;padding:10px 14px;border:1px solid #cbd5e1;border-radius:10px;color:#111827;text-decoration:none;cursor:pointer}.fileButton input{display:none}.notice{padding:12px 14px;border-radius:10px;background:#f1f5f9}.understoodCard{margin-top:18px;padding:22px}.understoodCard h2,.resultsHeader h2{margin:0}.tags,.facts{display:flex;gap:8px;flex-wrap:wrap;margin-top:15px}.tags span,.facts span{padding:7px 10px;border-radius:999px;background:#f1f5f9;font-size:.84rem}.resultsSection{margin-top:28px}.resultList{display:grid;gap:15px;margin-top:16px}.resultCard{position:relative;display:grid;grid-template-columns:75px minmax(0,1fr);gap:18px;padding:22px}.selectBox{position:absolute;right:18px;bottom:18px;font-size:.84rem}.score{display:grid;place-items:center;width:68px;height:68px;border:2px solid #111827;border-radius:50%;font-size:1.15rem;font-weight:900}.titleRow{display:flex;justify-content:space-between;gap:12px;padding-right:100px}.titleRow h3{margin:0;font-size:1.18rem}.titleRow p{margin:6px 0 0;color:#64748b}.verified,.prequalified{padding:6px 9px;border-radius:999px;font-size:.72rem;font-weight:800;white-space:nowrap}.verified{background:#dcfce7;color:#166534}.prequalified{background:#f1f5f9;color:#475569}.columns{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin:17px 0}.columns ul{margin:8px 0 0;padding-left:20px}.columns li{margin-bottom:5px}.qualificationLink{width:max-content}@media(max-width:760px){.resultCard{grid-template-columns:1fr}.titleRow{flex-direction:column;padding-right:0}.columns{grid-template-columns:1fr}.selectBox{position:static;width:max-content}}
      `}</style>
    </main>
  );
}

function formatRate(value: number | null, currency: string | null) {
  if (value === null) return "Rate available upon request";
  try {
    return `${new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD", maximumFractionDigits: 0 }).format(value)}/day`;
  } catch {
    return `${currency || "USD"} ${value}/day`;
  }
}