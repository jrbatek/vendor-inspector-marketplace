"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase";

type SearchRow = {
  id: string;
  request_text: string;
  result_count: number;
  status: string;
  created_at: string;
};

type InquiryRow = {
  id: string;
  inspector_id: string;
  request_text: string;
  match_score: number | null;
  status: string;
  created_at: string;
};

export default function ClientDashboardPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [searches, setSearches] = useState<SearchRow[]>([]);
  const [inquiries, setInquiries] = useState<InquiryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    const { data: auth } = await supabase.auth.getUser();

    if (!auth.user) {
      setMessage("Log in to view the client dashboard.");
      setLoading(false);
      return;
    }

    const [searchResult, inquiryResult] = await Promise.all([
      supabase
        .from("client_search_requests")
        .select("id,request_text,result_count,status,created_at")
        .eq("client_id", auth.user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("client_inquiries")
        .select("id,inspector_id,request_text,match_score,status,created_at")
        .eq("client_id", auth.user.id)
        .order("created_at", { ascending: false }),
    ]);

    if (searchResult.error || inquiryResult.error) {
      setMessage(searchResult.error?.message || inquiryResult.error?.message || "Unable to load dashboard.");
    }

    setSearches((searchResult.data || []) as SearchRow[]);
    setInquiries((inquiryResult.data || []) as InquiryRow[]);
    setLoading(false);
  }

  return (
    <main className="dashboardPage">
      <section className="hero">
        <p className="eyebrow">Client workspace</p>
        <h1>Inspection staffing requests</h1>
        <p>Track searches, availability requests, and anonymous candidate responses.</p>
        <Link className="primaryButton" href="/find-inspectors">Start New Request</Link>
      </section>

      {message && <p className="notice">{message}</p>}

      {!loading && !message && (
        <>
          <section className="stats">
            <Stat label="Saved Searches" value={searches.length} />
            <Stat label="Availability Requests" value={inquiries.length} />
            <Stat label="Open Requests" value={inquiries.filter((item) => !["declined","closed"].includes(item.status)).length} />
          </section>

          <section className="panel">
            <h2>Availability requests</h2>
            {inquiries.length === 0 ? (
              <p>No availability requests yet.</p>
            ) : (
              <div className="list">
                {inquiries.map((item) => (
                  <article key={item.id}>
                    <div>
                      <strong>Inspector #{item.inspector_id.replace(/-/g, "").slice(-6).toUpperCase()}</strong>
                      <p>{item.request_text}</p>
                    </div>
                    <div className="right">
                      {item.match_score !== null && <span>{item.match_score}% match</span>}
                      <span className="status">{item.status}</span>
                      <Link href={`/inspectors/${item.inspector_id}`}>Review qualifications</Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="panel">
            <h2>Recent searches</h2>
            {searches.length === 0 ? (
              <p>No searches saved yet.</p>
            ) : (
              <div className="list">
                {searches.map((item) => (
                  <article key={item.id}>
                    <div>
                      <strong>{item.result_count} inspectors evaluated</strong>
                      <p>{item.request_text}</p>
                    </div>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <style jsx>{`
        .dashboardPage{max-width:1080px;margin:0 auto;padding:30px 18px 70px}.hero,.panel,.stat{border:1px solid #e5e7eb;border-radius:18px;background:#fff}.hero{padding:30px}.eyebrow{font-size:.76rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.hero h1{margin:0}.hero p{color:#64748b}.primaryButton{display:inline-flex;margin-top:10px;padding:11px 15px;border-radius:10px;background:#111827;color:#fff;text-decoration:none;font-weight:800}.notice{padding:14px;border-radius:10px;background:#f1f5f9}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:18px 0}.stat{padding:18px}.stat span{display:block;color:#64748b;font-size:.78rem;text-transform:uppercase}.stat strong{font-size:1.6rem}.panel{padding:22px;margin-top:16px}.panel h2{margin-top:0}.list{display:grid;gap:10px}.list article{display:flex;justify-content:space-between;gap:18px;padding:15px;border:1px solid #e5e7eb;border-radius:12px}.list p{margin:6px 0 0;color:#64748b}.right{display:flex;align-items:flex-end;gap:7px;flex-direction:column}.status{padding:5px 8px;border-radius:999px;background:#f1f5f9;text-transform:capitalize}@media(max-width:700px){.stats{grid-template-columns:1fr}.list article{flex-direction:column}.right{align-items:flex-start}}
      `}</style>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="stat"><span>{label}</span><strong>{value}</strong></div>;
}
