"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase";

type ClientProfileSummary = {
  full_name: string | null;
  email: string | null;
};

type Inquiry = {
  id: string;
  client_id: string;
  request_text: string;
  status: string;
  created_at: string;
  profiles: ClientProfileSummary | null;
};

type InquiryQueryRow = Omit<Inquiry, "profiles"> & {
  profiles:
    | ClientProfileSummary
    | ClientProfileSummary[]
    | null;
};

const STATUSES = ["new", "viewed", "contacted", "accepted", "declined", "closed"];

export default function InspectorInquiriesPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void loadInquiries();
  }, []);

  async function loadInquiries() {
    setLoading(true);
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      setLoggedIn(false);
      setLoading(false);
      return;
    }

    setLoggedIn(true);

    const { data, error } = await supabase
      .from("client_inquiries")
      .select("id,client_id,request_text,status,created_at,profiles(full_name,email)")
      .eq("inspector_id", authData.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      setInquiries([]);
      setLoading(false);
      return;
    }

    const normalizedInquiries: Inquiry[] = (
      (data || []) as InquiryQueryRow[]
    ).map((item) => ({
      ...item,
      profiles: Array.isArray(item.profiles)
        ? item.profiles[0] ?? null
        : item.profiles,
    }));

    setInquiries(normalizedInquiries);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from("client_inquiries")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setInquiries((items) => items.map((item) => item.id === id ? { ...item, status } : item));
    setMessage("Inquiry status updated.");
  }

  if (loading) return <section className="panel">Loading inquiries...</section>;

  if (!loggedIn) {
    return (
      <section className="panel authPanel">
        <p className="eyebrow">Inspector Inquiries</p>
        <h1>Login required</h1>
        <p className="muted">Log in to review client availability requests.</p>
        <Link className="button" href="/login">Log in</Link>
      </section>
    );
  }

  return (
    <>
      <section className="hero dashboardHero">
        <div>
          <p className="eyebrow">Inspector Inquiries</p>
          <h1>Incoming opportunities</h1>
          <p className="muted">Review client requests and update each opportunity as it progresses.</p>
        </div>
        <Link className="button secondary" href="/dashboard">Edit Profile</Link>
      </section>

      {message && <p className={message.includes("updated") ? "success" : "notice"}>{message}</p>}

      <section className="panel dashboardSection">
        {inquiries.length === 0 ? (
          <div className="emptyState">
            <p>No client inquiries yet.</p>
            <p className="muted">Complete your profile and keep availability current to improve matching.</p>
          </div>
        ) : (
          <div className="inquiryGrid">
            {inquiries.map((item) => (
              <article className="inquiryCard" key={item.id}>
                <div className="sectionHeader">
                  <div>
                    <h2>{item.profiles?.full_name || "Client"}</h2>
                    <p className="muted">Received {formatDate(item.created_at)}</p>
                  </div>
                  <span className={`status status-${item.status}`}>{item.status}</span>
                </div>

                <p className="inquiryText">{item.request_text}</p>

                <label>
                  Status
                  <select value={item.status} onChange={(event) => void updateStatus(item.id, event.target.value)}>
                    {STATUSES.map((status) => <option value={status} key={status}>{status}</option>)}
                  </select>
                </label>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}
