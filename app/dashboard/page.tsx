"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase";
import type { InspectorProfile } from "@/lib/types";
import { joinCsv, splitCsv } from "@/lib/helpers";

type FormState = {
  name:string; headline:string; company:string; email:string; phone:string;
  base_city:string; base_state:string; base_country:string; travel_radius:string;
  certifications:string; methods:string; industries:string;
  hourly_rate:string; day_rate:string; bio:string; available:boolean;
};

const blank: FormState = {
  name:"", headline:"", company:"", email:"", phone:"",
  base_city:"", base_state:"", base_country:"USA", travel_radius:"",
  certifications:"API 510, API 570, CWI", methods:"VT, MT, PT, UT",
  industries:"Oil & Gas, Power, Chemicals", hourly_rate:"", day_rate:"",
  bio:"", available:true
};

export default function DashboardPage() {
  const supabase = supabaseBrowser();
  const [userId,setUserId]=useState<string|null>(null);
  const [profileId,setProfileId]=useState<string|null>(null);
  const [form,setForm]=useState<FormState>(blank);
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState("");

  async function load() {
    setLoading(true); setMessage("");
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;
    if (!user) { setUserId(null); setLoading(false); return; }
    setUserId(user.id);

    const { data } = await supabase.from("inspector_profiles").select("*").eq("user_id", user.id).maybeSingle();
    if (data) {
      const p = data as InspectorProfile;
      setProfileId(p.id);
      setForm({
        name:p.name || user.user_metadata?.name || "", headline:p.headline || "",
        company:p.company || "", email:p.email || user.email || "", phone:p.phone || "",
        base_city:p.base_city || "", base_state:p.base_state || "", base_country:p.base_country || "USA",
        travel_radius:p.travel_radius || "", certifications:joinCsv(p.certifications),
        methods:joinCsv(p.methods), industries:joinCsv(p.industries),
        hourly_rate:p.hourly_rate ? String(p.hourly_rate) : "",
        day_rate:p.day_rate ? String(p.day_rate) : "", bio:p.bio || "", available:p.available
      });
    } else {
      setProfileId(null);
      setForm({...blank, name:user.user_metadata?.name || "", email:user.email || ""});
    }
    setLoading(false);
  }

  useEffect(()=>{ load(); }, []);

  function setField<K extends keyof FormState>(key:K,value:FormState[K]) {
    setForm((prev)=>({...prev,[key]:value}));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setMessage("");

    const payload = {
      user_id:userId, name:form.name, headline:form.headline, company:form.company,
      email:form.email, phone:form.phone, base_city:form.base_city, base_state:form.base_state,
      base_country:form.base_country, travel_radius:form.travel_radius,
      certifications:splitCsv(form.certifications), methods:splitCsv(form.methods),
      industries:splitCsv(form.industries),
      hourly_rate:form.hourly_rate ? Number(form.hourly_rate) : null,
      day_rate:form.day_rate ? Number(form.day_rate) : null,
      bio:form.bio, available:form.available
    };

    const { data, error } = await supabase.from("inspector_profiles").upsert(payload,{onConflict:"user_id"}).select("*").single();
    if (error) { setMessage(error.message); return; }
    setProfileId((data as InspectorProfile).id);
    setMessage("Profile saved.");
  }

  if (loading) return <p>Loading dashboard...</p>;

  if (!userId) return (
    <section className="panel">
      <h1>Dashboard</h1>
      <p>You need to log in before creating an inspector profile.</p>
      <Link className="button" href="/login">Log in</Link>
    </section>
  );

  return (
    <section className="panel">
      <div className="actions" style={{justifyContent:"space-between"}}>
        <div><h1>Inspector Dashboard</h1><p className="muted">Create or update your public inspector profile.</p></div>
        <Link href="/logout" className="button secondary">Log out</Link>
      </div>
      {message && <p className={message==="Profile saved." ? "success" : "notice"}>{message}</p>}
      <form onSubmit={save}>
        <div className="formGrid">
          <label>Name<input value={form.name} onChange={(e)=>setField("name",e.target.value)} required /></label>
          <label>Headline<input value={form.headline} onChange={(e)=>setField("headline",e.target.value)} placeholder="API 510 / CWI Inspector" required /></label>
          <label>Company<input value={form.company} onChange={(e)=>setField("company",e.target.value)} /></label>
          <label>Email<input type="email" value={form.email} onChange={(e)=>setField("email",e.target.value)} /></label>
          <label>Phone<input value={form.phone} onChange={(e)=>setField("phone",e.target.value)} /></label>
          <label>Base City<input value={form.base_city} onChange={(e)=>setField("base_city",e.target.value)} /></label>
          <label>Base State / Province<input value={form.base_state} onChange={(e)=>setField("base_state",e.target.value)} /></label>
          <label>Base Country<input value={form.base_country} onChange={(e)=>setField("base_country",e.target.value)} /></label>
          <label>Travel Radius<input value={form.travel_radius} onChange={(e)=>setField("travel_radius",e.target.value)} placeholder="250 miles, USA, Worldwide" /></label>
          <label>Hourly Rate<input type="number" value={form.hourly_rate} onChange={(e)=>setField("hourly_rate",e.target.value)} placeholder="125" /></label>
          <label>Day Rate<input type="number" value={form.day_rate} onChange={(e)=>setField("day_rate",e.target.value)} placeholder="900" /></label>
          <label className="full">Certifications, comma separated<input value={form.certifications} onChange={(e)=>setField("certifications",e.target.value)} /></label>
          <label className="full">Methods, comma separated<input value={form.methods} onChange={(e)=>setField("methods",e.target.value)} /></label>
          <label className="full">Industries, comma separated<input value={form.industries} onChange={(e)=>setField("industries",e.target.value)} /></label>
          <label className="full">Bio<textarea value={form.bio} onChange={(e)=>setField("bio",e.target.value)} /></label>
          <label className="full"><span><input type="checkbox" checked={form.available} onChange={(e)=>setField("available",e.target.checked)} style={{width:"auto",marginRight:8}} />Available for work</span></label>
        </div>
        <div className="actions">
          <button type="submit">Save Profile</button>
          {profileId && <Link className="button secondary" href={`/inspectors/${profileId}`}>View Public Profile</Link>}
        </div>
      </form>
    </section>
  );
}
