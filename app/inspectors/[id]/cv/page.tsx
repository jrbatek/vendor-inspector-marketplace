"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase";

 type Item = { name: string; code?: string | null; category?: string | null; proficiency?: string | null; level?: string | null; years_experience?: number | null };
 type CvData = {
  inspector_id: string;
  primary_discipline: string | null;
  biography: string | null;
  base_city: string | null;
  base_state: string | null;
  base_country: string | null;
  years_experience: number | null;
  availability_status: string | null;
  is_verified: boolean | null;
  equipment: Item[];
  activities: Item[];
  ndt: Item[];
  certifications: Item[];
  codes: Item[];
  industries: Item[];
  languages: Item[];
 };

export default function AnonymousCvPage() {
  const params = useParams<{ id: string }>();
  const inspectorId = params?.id;
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [data, setData] = useState<CvData | null>(null);
  const [message, setMessage] = useState("Loading anonymous CV...");

  useEffect(() => { if (inspectorId) void load(inspectorId); }, [inspectorId]);

  async function load(id: string) {
    const [profile, equipment, activities, ndt, certs, codes, industries, languages] = await Promise.all([
      supabase.from("inspector_profiles").select("inspector_id,primary_discipline,biography,base_city,base_state,base_country,years_experience,availability_status,is_verified").eq("inspector_id", id).maybeSingle(),
      supabase.from("inspector_equipment").select("equipment_types(name,code,category)").eq("profile_id", id),
      supabase.from("inspector_activities").select("inspection_activities(name,code,category)").eq("profile_id", id),
      supabase.from("inspector_ndt_methods").select("level,ndt_methods(name,code,category)").eq("profile_id", id),
      supabase.from("inspector_certifications").select("certifications(name,code,category)").eq("profile_id", id),
      supabase.from("inspector_codes_standards").select("proficiency,years_experience,codes_standards(name,code,category)").eq("profile_id", id),
      supabase.from("inspector_industries").select("industries(name,code,category)").eq("profile_id", id),
      supabase.from("inspector_languages").select("proficiency,languages(name,code,region)").eq("profile_id", id),
    ]);

    if (profile.error || !profile.data) {
      setMessage("Anonymous CV not found.");
      return;
    }

    const unwrap = (rows: any[] | null, key: string): Item[] => (rows || []).map((row) => ({ ...(row[key] || {}), ...Object.fromEntries(Object.entries(row).filter(([name]) => name !== key)) })).filter((item) => item.name);

    setData({
      ...(profile.data as Omit<CvData, "equipment"|"activities"|"ndt"|"certifications"|"codes"|"industries"|"languages">),
      equipment: unwrap(equipment.data, "equipment_types"),
      activities: unwrap(activities.data, "inspection_activities"),
      ndt: unwrap(ndt.data, "ndt_methods"),
      certifications: unwrap(certs.data, "certifications"),
      codes: unwrap(codes.data, "codes_standards"),
      industries: unwrap(industries.data, "industries"),
      languages: unwrap(languages.data, "languages"),
    });
    setMessage("");
  }

  if (!data) return <main className="cvPage"><p>{message}</p></main>;

  const anonymousId = data.inspector_id.replace(/-/g, "").slice(-6).toUpperCase();
  const location = [data.base_city, data.base_state, data.base_country].filter(Boolean).join(", ");

  return (
    <main className="cvPage">
      <div className="toolbar noPrint"><Link href={`/inspectors/${data.inspector_id}`}>Back to qualifications</Link><button onClick={() => window.print()}>Print / Save as PDF</button></div>
      <article className="sheet">
        <header>
          <div><p className="brand">InspectSource</p><h1>Anonymous Inspector CV</h1><p>Inspector #{anonymousId}</p></div>
          <div className="status"><strong>{data.is_verified ? "Verified by InspectSource" : "Pre-Qualified"}</strong><span>{data.availability_status || "Availability to confirm"}</span></div>
        </header>
        <section className="summary">
          <h2>{data.primary_discipline || "Vendor Inspection"} Professional</h2>
          <p>{location || "Location available through InspectSource"}{data.years_experience ? ` · ${data.years_experience}+ years experience` : ""}</p>
          <p>{data.biography || "Professional summary available through InspectSource."}</p>
        </section>
        <CvSection title="Certifications" items={data.certifications} />
        <CvSection title="Codes & Standards" items={data.codes} />
        <CvSection title="Equipment Experience" items={data.equipment} />
        <CvSection title="Inspection Activities" items={data.activities} />
        <CvSection title="NDT Methods" items={data.ndt} />
        <CvSection title="Industry Experience" items={data.industries} />
        <CvSection title="Languages" items={data.languages} />
        <footer>This CV intentionally excludes the inspector's name, direct email, phone number, employer, and exact address. Engagements and identity release are coordinated through InspectSource.</footer>
      </article>
      <style jsx>{`
        .cvPage{max-width:900px;margin:0 auto;padding:24px}.toolbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}.sheet{background:white;border:1px solid #d1d5db;border-radius:12px;padding:34px;box-shadow:0 8px 30px rgba(15,23,42,.08)}header{display:flex;justify-content:space-between;gap:20px;border-bottom:3px solid #111827;padding-bottom:18px}.brand{font-weight:900;letter-spacing:.12em;text-transform:uppercase;margin:0}h1{margin:4px 0}.status{display:flex;flex-direction:column;text-align:right;gap:5px}.status span,.summary p,footer{color:#64748b}.summary{padding:18px 0}.summary h2{margin-bottom:6px}.section{border-top:1px solid #e5e7eb;padding:16px 0}.section h3{margin:0 0 10px}.items{display:flex;gap:7px;flex-wrap:wrap}.items span{border:1px solid #cbd5e1;border-radius:999px;padding:6px 9px;font-size:.84rem}footer{border-top:1px solid #e5e7eb;margin-top:8px;padding-top:14px;font-size:.76rem;line-height:1.5}@media print{.noPrint{display:none}.cvPage{padding:0}.sheet{border:0;box-shadow:none;padding:0}}@media(max-width:600px){header{flex-direction:column}.status{text-align:left}}
      `}</style>
    </main>
  );
}

function CvSection({ title, items }: { title: string; items: Item[] }) {
  if (!items.length) return null;
  return <section className="section"><h3>{title}</h3><div className="items">{items.map((item, index) => <span key={`${item.name}-${index}`}>{item.name}{item.level ? ` · ${item.level}` : ""}{item.proficiency ? ` · ${item.proficiency}` : ""}{item.years_experience ? ` · ${item.years_experience} yrs` : ""}</span>)}</div></section>;
}
