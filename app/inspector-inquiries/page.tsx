"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";

type InquiryRow = {
  id: string;
  request_text: string;
  match_score: number | null;
  status: string;
  created_at: string;
};

export default function InspectorInquiriesPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [items, setItems] = useState<InquiryRow[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    const { data: auth } = await supabase.auth.getUser();

    if (!auth.user) {
      setMessage("Log in as an inspector to view requests.");
      return;
    }

    const { data, error } = await supabase
      .from("client_inquiries")
      .select("id,request_text,match_score,status,created_at")
      .eq("inspector_id", auth.user.id)
      .order("created_at", { ascending: false });

    if (error) setMessage(error.message);
    setItems((data || []) as InquiryRow[]);
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

    setItems((current) =>
      current.map((item) => item.id === id ? { ...item, status } : item)
    );
  }

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Inspector workspace</p>
        <h1>Client availability requests</h1>
        <p>Review anonymous assignment details and indicate whether you are interested.</p>
      </section>

      {message && <p className="notice">{message}</p>}

      <section className="list">
        {items.map((item) => (
          <article key={item.id}>
            <div>
              <div className="top">
                <strong>{item.match_score !== null ? `${item.match_score}% match` : "Client request"}</strong>
                <span>{item.status}</span>
              </div>
              <p>{item.request_text}</p>
              <small>{new Date(item.created_at).toLocaleString()}</small>
            </div>

            <div className="actions">
              <button onClick={() => void updateStatus(item.id, "accepted")}>Interested</button>
              <button className="secondary" onClick={() => void updateStatus(item.id, "declined")}>Decline</button>
            </div>
          </article>
        ))}

        {!message && items.length === 0 && <p>No requests yet.</p>}
      </section>

      <style jsx>{`
        .page{max-width:980px;margin:0 auto;padding:30px 18px 70px}.hero,.list article{border:1px solid #e5e7eb;border-radius:18px;background:#fff}.hero{padding:28px}.eyebrow{font-size:.76rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.hero h1{margin:0}.hero p,.list p,small{color:#64748b}.notice{padding:14px;background:#f1f5f9;border-radius:10px}.list{display:grid;gap:14px;margin-top:18px}.list article{display:flex;justify-content:space-between;gap:20px;padding:20px}.top{display:flex;gap:10px;align-items:center}.top span{padding:5px 8px;border-radius:999px;background:#f1f5f9;text-transform:capitalize}.actions{display:flex;align-items:center;gap:8px}.secondary{background:#fff;color:#111827;border:1px solid #cbd5e1}@media(max-width:700px){.list article{flex-direction:column}.actions{align-items:flex-start}}
      `}</style>
    </main>
  );
}
