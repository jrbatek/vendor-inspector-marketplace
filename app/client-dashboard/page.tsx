"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase";

type Inquiry = {
  id: string;
  inspector_id: string;
  request_text: string;
  status: string;
  created_at: string;
  inspector_profiles:
    | {
        full_name: string | null;
        headline: string | null;
        base_city: string | null;
        base_state: string | null;
        availability_status: string | null;
      }
    | {
        full_name: string | null;
        headline: string | null;
        base_city: string | null;
        base_state: string | null;
        availability_status: string | null;
      }[]
    | null;
};

type SearchRequest = {
  id: string;
  request_text: string;
  result_count: number;
  created_at: string;
};

export default function ClientDashboardPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [searches, setSearches] = useState<SearchRequest[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setMessage("");

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      setLoggedIn(false);
      setLoading(false);
      return;
    }

    setLoggedIn(true);

    const [inquiryResult, searchResult] = await Promise.all([
      supabase
        .from("client_inquiries")
        .select(
          "id,inspector_id,request_text,status,created_at,inspector_profiles(full_name,headline,base_city,base_state,availability_status)",
        )
        .eq("client_id", authData.user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("client_search_requests")
        .select("id,request_text,result_count,created_at")
        .eq("client_id", authData.user.id)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    const error = inquiryResult.error || searchResult.error;
    if (error) setMessage(error.message);

    setInquiries((inquiryResult.data || []) as Inquiry[]);
    setSearches((searchResult.data || []) as SearchRequest[]);
    setLoading(false);
  }

  if (loading) return <section className="panel">Loading client dashboard...</section>;

  if (!loggedIn) {
    return (
      <section className="panel authPanel">
        <p className="eyebrow">Client Dashboard</p>
        <h1>Login required</h1>
        <p className="muted">Log in to track searches and inspector availability requests.</p>
        <div className="actions">
          <Link className="button" href="/login">Log in</Link>
          <Link className="button secondary" href="/register">Create account</Link>
        </div>
      </section>
    );
  }

  const openCount = inquiries.filter((item) => !["declined", "closed"].includes(item.status)).length;

  return (
    <>
      <section className="hero dashboardHero">
        <div>
          <p className="eyebrow">Client Dashboard</p>
          <h1>Inspection staffing activity</h1>
          <p className="muted">Review searches, inspector requests, and current inquiry status.</p>
        </div>
        <Link className="button" href="/find-inspectors">New Inspector Search</Link>
      </section>

      <section className="metricGrid">
        <Metric label="Availability Requests" value={String(inquiries.length)} />
        <Metric label="Open Requests" value={String(openCount)} />
        <Metric label="Saved Searches" value={String(searches.length)} />
      </section>

      {message && <p className="notice">{message}</p>}

      <section className="panel dashboardSection">
        <div className="sectionHeader">
          <h2>Availability Requests</h2>
          <span className="muted">Newest first</span>
        </div>

        {inquiries.length === 0 ? (
          <div className="emptyState">
            <p>No requests yet.</p>
            <Link href="/find-inspectors">Find inspectors →</Link>
          </div>
        ) : (
          <div className="tableList">
            {inquiries.map((item) => {
              const inspector = Array.isArray(item.inspector_profiles)
                ? item.inspector_profiles[0] ?? null
                : item.inspector_profiles;

              return (
                <article className="dashboardRow" key={item.id}>
                  <div>
                    <h3>{inspector?.full_name || "Inspector"}</h3>
                    <p className="muted">{inspector?.headline || "Vendor Inspection Professional"}</p>
                    <p className="requestPreview">{item.request_text}</p>
                  </div>
                  <div className="rowMeta">
                    <StatusBadge status={item.status} />
                    <span>{formatDate(item.created_at)}</span>
                    <Link href={`/inspectors/${item.inspector_id}`}>View profile</Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="panel dashboardSection">
        <div className="sectionHeader">
          <h2>Recent Searches</h2>
          <Link href="/find-inspectors">Run another search</Link>
        </div>

        {searches.length === 0 ? (
          <p className="muted">No searches have been saved yet.</p>
        ) : (
          <div className="searchHistory">
            {searches.map((item) => (
              <article key={item.id}>
                <p>{item.request_text}</p>
                <div className="muted">{item.result_count} results · {formatDate(item.created_at)}</div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <article className="metricCard"><span>{label}</span><strong>{value}</strong></article>;
}

function StatusBadge({ status }: { status: string }) {
  return <span className={`status status-${status}`}>{status.replaceAll("_", " ")}</span>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}
