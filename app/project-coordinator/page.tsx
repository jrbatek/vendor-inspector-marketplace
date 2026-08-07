"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase";
import { inspectorLabel, type ReferenceItem, type SearchInspector } from "@/lib/clientSearch";
import { coordinateProject, type CoordinatorRecommendation } from "@/lib/projectCoordinator";

const EXAMPLE = "Need two API 570 inspectors in Houston for a refinery turnaround starting September 14 for three weeks. TWIC required. Budget is $950 per day. Please send CVs and confirm availability.";

export default function ProjectCoordinatorPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [requestText, setRequestText] = useState(EXAMPLE);
  const [plan, setPlan] = useState<CoordinatorRecommendation | null>(null);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  async function loadInspectors(): Promise<SearchInspector[]> {
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

    const error = queries.find((query) => query.error)?.error;
    if (error) throw error;

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

    return (profiles.data || []).map((profile: any) => ({
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
  }

  async function analyze() {
    if (!requestText.trim()) return;
    setWorking(true);
    setMessage("");
    setSelected({});

    try {
      const inspectors = await loadInspectors();
      const recommendation = coordinateProject(requestText, inspectors);
      setPlan(recommendation);

      const initiallySelected: Record<string, boolean> = {};
      recommendation.shortlist.slice(0, recommendation.brief.numberOfInspectors * 2).forEach((candidate) => {
        initiallySelected[candidate.inspector_id] = true;
      });
      setSelected(initiallySelected);

      const { data: auth } = await supabase.auth.getUser();
      await supabase.from("client_search_requests").insert({
        client_id: auth.user?.id || null,
        request_text: requestText,
        parsed_request: recommendation.brief,
        result_count: recommendation.ranked.length,
        status: "draft",
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to analyze the project request.");
    } finally {
      setWorking(false);
    }
  }

  async function createProjectAndRequestAvailability() {
    if (!plan) return;
    const chosen = plan.shortlist.filter((candidate) => selected[candidate.inspector_id]);
    if (!chosen.length) {
      setMessage("Select at least one candidate first.");
      return;
    }

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setMessage("Log in as a client before creating a project and contacting inspectors.");
      return;
    }

    const requestId = crypto.randomUUID();
    const requestInsert = await supabase.from("client_requests").insert({
      id: requestId,
      client_id: auth.user.id,
      request_text: requestText,
      parsed_request: plan.brief,
      status: "submitted",
    });

    if (requestInsert.error) {
      setMessage(requestInsert.error.message);
      return;
    }

    const inquiryInsert = await supabase.from("client_inquiries").insert(
      chosen.map((candidate) => ({
        client_id: auth.user!.id,
        inspector_id: candidate.inspector_id,
        client_request_id: requestId,
        request_text: requestText,
        match_score: candidate.score,
        status: "new",
      })),
    );

    if (inquiryInsert.error) {
      setMessage(inquiryInsert.error.message);
      return;
    }

    setMessage(`Project created. Availability requests sent to ${chosen.length} candidate${chosen.length === 1 ? "" : "s"}.`);
  }

  return (
    <main className="page">
      <section className="hero panel">
        <p className="eyebrow">AI Project Coordinator v1</p>
        <h1>Describe the inspection project. InspectSource coordinates the shortlist.</h1>
        <p className="muted">The coordinator interprets the request, identifies missing information, evaluates every stored inspector profile, recommends a shortlist, prepares anonymous CV links, and can launch availability requests.</p>
        <textarea rows={8} value={requestText} onChange={(event) => setRequestText(event.target.value)} />
        <div className="actionRow">
          <button onClick={() => void analyze()} disabled={working}>{working ? "Coordinating..." : "Coordinate Project"}</button>
          <Link href="/client-dashboard">Open Client Dashboard</Link>
        </div>
        {message && <p className="notice">{message}</p>}
      </section>

      {plan && (
        <>
          <section className="panel">
            <p className="eyebrow">Project brief</p>
            <h2>Coordinator interpretation</h2>
            <div className="briefGrid">
              <Brief label="Inspectors" value={String(plan.brief.numberOfInspectors)} />
              <Brief label="Urgency" value={plan.brief.urgency} />
              <Brief label="Location" value={plan.brief.location || "Needs confirmation"} />
              <Brief label="Start" value={plan.brief.startDate || "Needs confirmation"} />
              <Brief label="Duration" value={plan.brief.durationDays ? `${plan.brief.durationDays} days` : "Needs confirmation"} />
              <Brief label="Budget" value={plan.brief.maximumDayRate ? `$${plan.brief.maximumDayRate}/day` : "Not stated"} />
            </div>

            <h3>Coordinator assessment</h3>
            <p>{plan.summary}</p>

            {plan.brief.coordinatorQuestions.length > 0 && (
              <div className="questionBox">
                <strong>Questions the coordinator would ask before final award</strong>
                <ul>{plan.brief.coordinatorQuestions.map((question) => <li key={question}>{question}</li>)}</ul>
              </div>
            )}

            <div className="tagRow">
              {plan.brief.requiredTerms.slice(0, 16).map((term) => <span key={term}>{term}</span>)}
            </div>
          </section>

          <section className="panel">
            <div className="sectionHeader">
              <div>
                <p className="eyebrow">Recommended shortlist</p>
                <h2>{plan.shortlist.length} candidates recommended</h2>
              </div>
              <button onClick={() => void createProjectAndRequestAvailability()}>Create Project & Request Availability</button>
            </div>

            <div className="candidateList">
              {plan.shortlist.map((candidate, index) => (
                <article className="candidate" key={candidate.inspector_id}>
                  <div className="rank">#{index + 1}</div>
                  <div className="candidateBody">
                    <div className="candidateHeader">
                      <div>
                        <h3>{inspectorLabel(candidate)}</h3>
                        <p>{[candidate.base_city, candidate.base_state, candidate.base_country].filter(Boolean).join(", ")}</p>
                      </div>
                      <div className="score">{candidate.score}% match</div>
                    </div>
                    <div className="facts">
                      <span>{candidate.years_experience ?? "—"} years</span>
                      <span>{candidate.availability_status || "Availability to confirm"}</span>
                      <span>{formatRate(candidate.day_rate, candidate.currency)}</span>
                      <span>{candidate.is_verified ? "Verified" : "Pre-qualified"}</span>
                    </div>
                    <div className="twoCol">
                      <div><strong>Why recommended</strong><ul>{candidate.reasons.slice(0, 5).map((reason) => <li key={reason}>{reason}</li>)}</ul></div>
                      <div><strong>Coordinator follow-up</strong><ul>{(candidate.questions.length ? candidate.questions : ["No major qualification gaps identified"]).slice(0, 4).map((question) => <li key={question}>{question}</li>)}</ul></div>
                    </div>
                    <div className="candidateActions">
                      <label><input type="checkbox" checked={Boolean(selected[candidate.inspector_id])} onChange={(event) => setSelected((current) => ({ ...current, [candidate.inspector_id]: event.target.checked }))} /> Include in outreach</label>
                      <Link href={`/inspectors/${candidate.inspector_id}`}>Review Qualifications</Link>
                      <Link href={`/inspectors/${candidate.inspector_id}/cv`}>Open Anonymous CV</Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <p className="eyebrow">Coordinator next actions</p>
            <h2>What happens next</h2>
            <ol>{plan.nextActions.map((action) => <li key={action}>{action}</li>)}</ol>
          </section>
        </>
      )}

      <style jsx>{`
        .page{max-width:1120px;margin:0 auto;padding:32px 18px 80px}.panel{background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:26px;margin-bottom:18px}.hero{box-shadow:0 12px 34px rgba(15,23,42,.06)}.eyebrow{margin:0 0 7px;font-size:.75rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.hero h1{max-width:900px;margin:0;font-size:2rem}.muted{color:#64748b;line-height:1.65}.hero textarea{width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:12px;padding:15px;font:inherit;resize:vertical}.actionRow,.sectionHeader,.candidateActions{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-top:14px}.actionRow a,.candidateActions a{color:#111827}.notice{background:#f1f5f9;padding:12px 14px;border-radius:10px}.briefGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:16px 0}.brief{border:1px solid #e5e7eb;border-radius:12px;padding:14px}.brief span{display:block;color:#64748b;font-size:.76rem;text-transform:uppercase}.brief strong{text-transform:capitalize}.questionBox{background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:15px}.tagRow,.facts{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.tagRow span,.facts span{background:#f1f5f9;border-radius:999px;padding:7px 10px;font-size:.82rem}.candidateList{display:grid;gap:14px;margin-top:16px}.candidate{display:grid;grid-template-columns:58px 1fr;gap:16px;border:1px solid #e5e7eb;border-radius:15px;padding:18px}.rank{display:grid;place-items:center;width:52px;height:52px;border-radius:50%;background:#111827;color:white;font-weight:900}.candidateHeader{display:flex;justify-content:space-between;gap:14px}.candidateHeader h3{margin:0}.candidateHeader p{margin:5px 0;color:#64748b}.score{font-weight:900;white-space:nowrap}.twoCol{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:15px}.twoCol ul{padding-left:19px}.twoCol li{margin:4px 0}.candidateActions{justify-content:flex-start}.candidateActions label{margin-right:auto}.panel ol{padding-left:22px}.panel ol li{margin:8px 0}@media(max-width:760px){.briefGrid{grid-template-columns:1fr 1fr}.candidate{grid-template-columns:1fr}.candidateHeader,.twoCol{grid-template-columns:1fr;display:grid}.candidateActions label{width:100%}}@media(max-width:500px){.briefGrid{grid-template-columns:1fr}}
      `}</style>
    </main>
  );
}

function Brief({ label, value }: { label: string; value: string }) {
  return <div className="brief"><span>{label}</span><strong>{value}</strong></div>;
}

function formatRate(value: number | null, currency: string | null) {
  if (value === null) return "Rate to confirm";
  try {
    return `${new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD", maximumFractionDigits: 0 }).format(value)}/day`;
  } catch {
    return `${currency || "USD"} ${value}/day`;
  }
}
