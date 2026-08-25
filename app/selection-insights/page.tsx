"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase";

type Inquiry = {
  id: string;
  request_text: string;
  match_score: number | null;
  status: string;
  created_at: string;
};

function insightFor(item: Inquiry) {
  const score = item.match_score ?? 0;
  const lower = item.request_text.toLowerCase();
  const strengths: string[] = [];
  const improve: string[] = [];
  if (score >= 85) strengths.push("Strong overall qualification fit");
  else if (score >= 70) strengths.push("Competitive overall fit");
  if (/api 570|api570/.test(lower)) strengths.push("API 570 requirement identified in the assignment");
  if (/twic/.test(lower)) improve.push("Confirm TWIC is current and verified in your profile");
  if (/international|singapore|rotterdam|qatar|doha/.test(lower)) improve.push("Keep international travel availability and credentials current");
  if (/local|near |houston|baytown/.test(lower)) improve.push("Location and travel radius can materially affect ranking");
  if (/budget|day|rate|\$/.test(lower)) improve.push("Keep your standard day rate current so clients can compare accurately");
  if (score < 85) improve.push("Add recent, assignment-specific experience and equipment history to strengthen matching");
  if (!strengths.length) strengths.push("Your profile was eligible to be considered for this assignment");
  return { strengths, improve };
}

export default function SelectionInsightsPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [items, setItems] = useState<Inquiry[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => { void load(); }, []);

  async function load() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { setMessage("Log in as an inspector to view selection insights."); return; }
    const { data, error } = await supabase
      .from("client_inquiries")
      .select("id,request_text,match_score,status,created_at")
      .eq("inspector_id", auth.user.id)
      .order("created_at", { ascending: false });
    if (error) setMessage(error.message);
    setItems((data || []) as Inquiry[]);
  }

  const considered = items.length;
  const positive = items.filter(i => ["accepted","selected","awarded","completed"].includes(i.status.toLowerCase())).length;
  const avg = considered ? Math.round(items.reduce((s,i)=>s+(i.match_score||0),0)/considered) : 0;

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Inspector workspace</p>
        <h1>Selection Insights</h1>
        <p>Understand how your qualifications line up with assignments and what you can improve for future opportunities.</p>
      </section>

      {message && <p className="notice">{message}</p>}

      <section className="stats">
        <Stat label="Opportunities considered" value={String(considered)} />
        <Stat label="Positive outcomes" value={String(positive)} />
        <Stat label="Average match" value={`${avg}%`} />
        <Stat label="Insight source" value="Matching data" />
      </section>

      <section className="principle">
        <strong>How this works</strong>
        <p>Insights shown today are based on your own profile and InspectSource matching data. When a client provides an explicit selection reason, it will be labeled <b>Client-provided feedback</b>. We never reveal another inspector’s identity or confidential profile data.</p>
      </section>

      <section className="list">
        {items.map(item => {
          const insight = insightFor(item);
          return <article key={item.id}>
            <div className="top">
              <div><span className="source">Based on matching data</span><h2>{item.match_score ?? "—"}% match</h2></div>
              <span className="status">{item.status}</span>
            </div>
            <p className="request">{item.request_text}</p>
            <div className="columns">
              <div><h3>Where you were strong</h3><ul>{insight.strengths.map(x => <li key={x}>{x}</li>)}</ul></div>
              <div><h3>How to improve your chances</h3><ul>{insight.improve.map(x => <li key={x}>{x}</li>)}</ul></div>
            </div>
            <small>{new Date(item.created_at).toLocaleDateString()}</small>
          </article>;
        })}
        {!message && !items.length && <div className="empty"><h2>No selection insights yet</h2><p>Once you are considered for client assignments, your matching feedback will appear here.</p><Link href="/dashboard">Complete your inspector profile</Link></div>}
      </section>

      <style jsx>{`
        .page{max-width:1050px;margin:0 auto;padding:30px 18px 70px}.hero,.list article,.principle,.empty{background:#fff;border:1px solid #dbe3ee;border-radius:18px}.hero{padding:28px}.eyebrow{margin:0 0 6px;font-size:.74rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#475569}.hero h1{margin:0}.hero p,.request,small,.principle p,.empty p{color:#64748b}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:18px 0}.stats :global(.stat){padding:16px;background:#fff;border:1px solid #dbe3ee;border-radius:14px}.stats :global(.stat span){display:block;color:#64748b;font-size:.75rem}.stats :global(.stat strong){font-size:1.35rem}.principle{padding:18px;background:#eff6ff}.principle p{margin-bottom:0}.notice{padding:14px;border-radius:10px;background:#f1f5f9}.list{display:grid;gap:14px;margin-top:18px}.list article{padding:20px}.top{display:flex;justify-content:space-between;gap:16px}.top h2{margin:5px 0 0}.source{font-size:.72rem;font-weight:900;text-transform:uppercase;letter-spacing:.08em;color:#1d4ed8}.status{height:max-content;padding:6px 9px;border-radius:999px;background:#f1f5f9;text-transform:capitalize;font-weight:800;font-size:.75rem}.columns{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0}.columns>div{padding:14px;border-radius:12px;background:#f8fafc}.columns h3{margin-top:0;font-size:.9rem}.columns ul{margin-bottom:0;padding-left:20px}.columns li{margin:6px 0}.empty{padding:25px;text-align:center}.empty :global(a){font-weight:900;color:#1d4ed8}@media(max-width:760px){.stats,.columns{grid-template-columns:1fr 1fr}}@media(max-width:520px){.stats,.columns{grid-template-columns:1fr}}
      `}</style>
    </main>
  );
}

function Stat({label,value}:{label:string;value:string}){return <div className="stat"><span>{label}</span><strong>{value}</strong></div>}
