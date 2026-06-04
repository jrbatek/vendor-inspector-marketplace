"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import type { InspectorProfile } from "@/lib/types";
import InspectorCard from "@/components/InspectorCard";

export default function InspectorsPage() {
  const supabase = supabaseBrowser();
  const [inspectors, setInspectors] = useState<InspectorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [cert, setCert] = useState("");
  const [method, setMethod] = useState("");

  async function loadInspectors() {
    setLoading(true);
    const { data, error } = await supabase.from("inspector_profiles").select("*").order("created_at", { ascending: false });
    if (!error) setInspectors((data || []) as InspectorProfile[]);
    setLoading(false);
  }

  useEffect(() => {
    loadInspectors();
    const id = setInterval(loadInspectors, 15000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    const loc = location.trim().toLowerCase();
    const c = cert.trim().toLowerCase();
    const m = method.trim().toLowerCase();

    return inspectors.filter((p) => {
      const haystack = [p.name,p.headline,p.company,p.bio,p.email,p.phone,p.base_city,p.base_state,p.base_country,...(p.certifications||[]),...(p.methods||[]),...(p.industries||[])].join(" ").toLowerCase();
      const locationText = [p.base_city,p.base_state,p.base_country].join(" ").toLowerCase();
      const certText = (p.certifications || []).join(" ").toLowerCase();
      const methodText = (p.methods || []).join(" ").toLowerCase();
      return (!text || haystack.includes(text)) && (!loc || locationText.includes(loc)) && (!c || certText.includes(c)) && (!m || methodText.includes(m));
    });
  }, [inspectors, q, location, cert, method]);

  return (
    <>
      <section className="hero">
        <h1>Find vendor inspectors</h1>
        <p className="muted">Search inspectors by location, certification, inspection method, industry, and availability.</p>
      </section>
      <section className="panel">
        <div className="searchBar">
          <input placeholder="Search anything" value={q} onChange={(e)=>setQ(e.target.value)} />
          <input placeholder="Location" value={location} onChange={(e)=>setLocation(e.target.value)} />
          <input placeholder="Certification, e.g. API 510" value={cert} onChange={(e)=>setCert(e.target.value)} />
          <input placeholder="Method, e.g. UT" value={method} onChange={(e)=>setMethod(e.target.value)} />
        </div>
        <p className="muted">{loading ? "Loading inspectors..." : `${filtered.length} inspector${filtered.length === 1 ? "" : "s"} found`}</p>
      </section>
      <div style={{ height: 16 }} />
      <section className="grid">{filtered.map((i)=><InspectorCard key={i.id} inspector={i} />)}</section>
      {!loading && filtered.length === 0 && <p className="muted">No inspectors found yet. Register and create the first profile.</p>}
    </>
  );
}
