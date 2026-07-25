"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase";
import type { EquipmentReference, InspectorProfile } from "@/lib/types";

type Step = 1 | 2 | 3;
type FormState = {
  full_name: string;
  headline: string;
  company: string;
  inspector_type: "Independent" | "Agency" | "Company Employee";
  phone: string;
  office_home_address: string;
  base_city: string;
  base_state: string;
  base_country: string;
  latitude: string;
  longitude: string;
  years_experience: string;
  primary_discipline: string;
  biography: string;
  linkedin_url: string;
  website_url: string;
};

const blank: FormState = {
  full_name: "", headline: "", company: "", inspector_type: "Independent",
  phone: "", office_home_address: "", base_city: "", base_state: "",
  base_country: "United States", latitude: "", longitude: "",
  years_experience: "", primary_discipline: "", biography: "",
  linkedin_url: "", website_url: "",
};

const disciplines = [
  "Vendor Inspection", "Welding Inspection", "Pressure Equipment",
  "Piping Inspection", "Storage Tank Inspection", "Rotating Equipment",
  "Electrical Inspection", "Instrumentation Inspection", "NDT",
  "Coating Inspection", "Civil / Structural Inspection", "Quality Auditing",
  "Expediting",
];

export default function DashboardPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [profileExists, setProfileExists] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(blank);
  const [equipment, setEquipment] = useState<EquipmentReference[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true);
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;
    if (!user) { setLoading(false); return; }
    setUserId(user.id);

    const [profileResult, equipmentResult, selectedResult] = await Promise.all([
      supabase.from("inspector_profiles").select("*").eq("inspector_id", user.id).maybeSingle(),
      supabase.from("equipment_types").select("id,category,name,code,notes,active").eq("active", true).order("category").order("name"),
      supabase.from("inspector_equipment").select("equipment_id").eq("profile_id", user.id),
    ]);

    const error = profileResult.error || equipmentResult.error || selectedResult.error;
    if (error) { setMessage(error.message); setLoading(false); return; }

    setEquipment((equipmentResult.data || []) as EquipmentReference[]);
    setSelected((selectedResult.data || []).map((row) => row.equipment_id));

    if (profileResult.data) {
      const p = profileResult.data as InspectorProfile;
      setProfileExists(true);
      setForm({
        full_name: p.full_name || user.user_metadata?.name || "",
        headline: p.headline || "", company: p.company || "",
        inspector_type: p.inspector_type || "Independent", phone: p.phone || "",
        office_home_address: p.office_home_address || "",
        base_city: p.base_city || p.base_location || "", base_state: p.base_state || "",
        base_country: p.base_country || "United States",
        latitude: p.latitude == null ? "" : String(p.latitude),
        longitude: p.longitude == null ? "" : String(p.longitude),
        years_experience: p.years_experience == null ? "" : String(p.years_experience),
        primary_discipline: p.primary_discipline || "", biography: p.biography || "",
        linkedin_url: p.linkedin_url || "", website_url: p.website_url || "",
      });
    } else {
      setForm({ ...blank, full_name: user.user_metadata?.name || "" });
    }
    setLoading(false);
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setMessage("");
  }

  function validate(current: Step) {
    if (current === 1) {
      if (!form.full_name.trim()) return "Enter your full name.";
      if (!form.headline.trim()) return "Enter a professional headline.";
      if (!form.base_city.trim()) return "Enter your base city.";
      if (!form.base_country.trim()) return "Enter your base country.";
    }
    if (current === 2) {
      const years = Number(form.years_experience);
      if (!form.years_experience.trim() || !Number.isFinite(years) || years < 0 || years > 80) return "Enter years of experience between 0 and 80.";
      if (!form.primary_discipline) return "Select a primary discipline.";
      if (form.biography.trim().length < 50) return "Your biography should be at least 50 characters.";
    }
    if (current === 3 && selected.length === 0) return "Select at least one equipment type.";
    return null;
  }

  async function validateAddress() {
    if (!form.office_home_address.trim()) { setMessage("Enter an office or home address first."); return; }
    setMessage("Checking address...");
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&q=${encodeURIComponent(form.office_home_address)}`;
      const response = await fetch(url, { headers: { Accept: "application/json" } });
      const results = await response.json();
      if (!Array.isArray(results) || !results[0]) { setMessage("Address not found. Enter city, state and country manually."); return; }
      const r = results[0], a = r.address || {};
      setForm((current) => ({ ...current,
        office_home_address: r.display_name || current.office_home_address,
        base_city: a.city || a.town || a.village || a.municipality || current.base_city,
        base_state: a.state || a.region || current.base_state,
        base_country: a.country || current.base_country,
        latitude: r.lat || "", longitude: r.lon || "",
      }));
      setSuccess(true); setMessage("Address validated.");
    } catch { setMessage("Address lookup failed. Enter city, state and country manually."); }
  }

  async function saveCore() {
    if (!userId) return false;
    const payload = {
      inspector_id: userId, full_name: form.full_name.trim(), headline: form.headline.trim(),
      company: form.company.trim() || null, inspector_type: form.inspector_type,
      phone: form.phone.trim() || null, office_home_address: form.office_home_address.trim() || null,
      base_location: form.base_city.trim(), base_city: form.base_city.trim(),
      base_state: form.base_state.trim() || null, base_country: form.base_country.trim(),
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
      years_experience: form.years_experience ? Number(form.years_experience) : null,
      primary_discipline: form.primary_discipline || null,
      biography: form.biography.trim() || null,
      linkedin_url: form.linkedin_url.trim() || null,
      website_url: form.website_url.trim() || null,
    };
    const { error } = await supabase.from("inspector_profiles").upsert(payload, { onConflict: "inspector_id" });
    if (error) { setMessage(error.message); return false; }
    setProfileExists(true); return true;
  }

  async function saveEquipment() {
    if (!userId) return false;
    const { error: deleteError } = await supabase.from("inspector_equipment").delete().eq("profile_id", userId);
    if (deleteError) { setMessage(deleteError.message); return false; }
    const { error: insertError } = await supabase.from("inspector_equipment").insert(selected.map((equipment_id) => ({ profile_id: userId, equipment_id })));
    if (insertError) { setMessage(insertError.message); return false; }
    return true;
  }

  async function saveCurrent(target?: Step) {
    const validationError = validate(step);
    if (validationError) { setSuccess(false); setMessage(validationError); return; }
    setSaving(true); setMessage("");
    const ok = step === 3 ? await saveEquipment() : await saveCore();
    setSaving(false);
    if (!ok) return;
    setSuccess(true); setMessage("Progress saved.");
    if (target) { setStep(target); window.scrollTo({ top: 0, behavior: "smooth" }); }
  }

  async function goTo(target: Step) {
    if (target < step) { setStep(target); setMessage(""); return; }
    await saveCurrent(target);
  }

  function toggle(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
    setMessage("");
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? equipment.filter((item) => [item.name, item.category, item.code, item.notes || ""].join(" ").toLowerCase().includes(q)) : equipment;
  }, [equipment, search]);

  const grouped = useMemo(() => filtered.reduce<Record<string, EquipmentReference[]>>((acc, item) => {
    (acc[item.category] ||= []).push(item); return acc;
  }, {}), [filtered]);

  function toggleCategory(category: string) {
    const ids = (grouped[category] || []).map((item) => item.id);
    const all = ids.every((id) => selected.includes(id));
    setSelected((current) => all ? current.filter((id) => !ids.includes(id)) : Array.from(new Set([...current, ...ids])));
  }

  if (loading) return <section className="panel"><p>Loading dashboard...</p></section>;
  if (!userId) return <section className="panel"><h1>Inspector Dashboard</h1><p>You need to log in before creating an inspector profile.</p><Link className="button" href="/login">Log in</Link></section>;

  const title = step === 1 ? "Personal Information" : step === 2 ? "Professional Experience" : "Equipment Experience";

  return <section className="panel wizardShell">
    <div className="wizardHeader"><div><p className="eyebrow">Inspector Profile</p><h1>Build Your Professional Profile</h1><p className="muted">Complete each section to make your profile searchable by clients.</p></div><div className="headerActions">{profileExists && <Link href={`/inspectors/${userId}`} className="button secondary">View Public Profile</Link>}<Link href="/logout" className="button secondary">Log out</Link></div></div>
    <div className="progressWrap"><div className="progressTop"><strong>Step {step} of 3</strong><span>{title}</span></div><div className="progressTrack"><div className="progressBar" style={{ width: `${(step / 3) * 100}%` }} /></div></div>
    <div className="stepTabs">{([1,2,3] as Step[]).map((n) => <button key={n} type="button" className={step === n ? "stepTab active" : step > n ? "stepTab complete" : "stepTab"} onClick={() => void goTo(n)}><span>{n}</span>{n === 1 ? "Personal Information" : n === 2 ? "Professional Experience" : "Equipment"}</button>)}</div>
    {message && <p className={success ? "success" : "notice"}>{message}</p>}

    {step === 1 && <div className="wizardCard"><h2>Personal Information</h2><p className="muted">This information identifies you and helps clients understand where you are based.</p><div className="formGrid">
      <label>Full Name<input value={form.full_name} onChange={(e) => setField("full_name", e.target.value)} required /></label>
      <label>Inspector Type<select value={form.inspector_type} onChange={(e) => setField("inspector_type", e.target.value as FormState["inspector_type"])}><option>Independent</option><option>Agency</option><option>Company Employee</option></select></label>
      <label className="full">Professional Headline<input value={form.headline} onChange={(e) => setField("headline", e.target.value)} placeholder="Example: API 510 / 570 Inspector and AWS CWI" required /></label>
      <label>Company<input value={form.company} onChange={(e) => setField("company", e.target.value)} /></label>
      <label>Phone<input value={form.phone} onChange={(e) => setField("phone", e.target.value)} /></label>
      <label className="full">Office / Home Address<input value={form.office_home_address} onChange={(e) => setField("office_home_address", e.target.value)} /></label>
      <div className="full"><button type="button" className="button secondary" onClick={validateAddress}>Validate Address</button></div>
      <label>Base City<input value={form.base_city} onChange={(e) => setField("base_city", e.target.value)} required /></label>
      <label>State / Province<input value={form.base_state} onChange={(e) => setField("base_state", e.target.value)} /></label>
      <label>Country<input value={form.base_country} onChange={(e) => setField("base_country", e.target.value)} required /></label>
      <label>LinkedIn URL<input type="url" value={form.linkedin_url} onChange={(e) => setField("linkedin_url", e.target.value)} /></label>
      <label className="full">Website URL<input type="url" value={form.website_url} onChange={(e) => setField("website_url", e.target.value)} /></label>
    </div></div>}

    {step === 2 && <div className="wizardCard"><h2>Professional Experience</h2><p className="muted">Summarize your core discipline and relevant experience.</p><div className="formGrid">
      <label>Years of Experience<input type="number" min="0" max="80" value={form.years_experience} onChange={(e) => setField("years_experience", e.target.value)} /></label>
      <label>Primary Discipline<select value={form.primary_discipline} onChange={(e) => setField("primary_discipline", e.target.value)}><option value="">Select...</option>{disciplines.map((d) => <option key={d}>{d}</option>)}</select></label>
      <label className="full">Professional Biography<textarea rows={8} value={form.biography} onChange={(e) => setField("biography", e.target.value)} placeholder="Describe your inspection background, industries, project types and geographic experience." /></label>
    </div></div>}

    {step === 3 && <div className="wizardCard"><div className="sectionHeading"><div><h2>Equipment Experience</h2><p className="muted">Select equipment you are qualified and experienced to inspect.</p></div><strong>{selected.length} selected</strong></div>
      <label className="equipmentSearch">Search Equipment<input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search pumps, vessels, switchgear, modules..." /></label>
      <div className="equipmentGroups">{Object.entries(grouped).map(([category, items]) => { const ids = items.map((i) => i.id); const all = ids.every((id) => selected.includes(id)); return <section className="equipmentGroup" key={category}><div className="equipmentGroupHeader"><h3>{category}</h3><button type="button" className="textButton" onClick={() => toggleCategory(category)}>{all ? "Clear category" : "Select category"}</button></div><div className="equipmentGrid">{items.map((item) => { const checked = selected.includes(item.id); return <label className={checked ? "equipmentOption selected" : "equipmentOption"} key={item.id}><input type="checkbox" checked={checked} onChange={() => toggle(item.id)} /><span><strong>{item.name}</strong>{item.notes && <small>{item.notes}</small>}</span></label>; })}</div></section>; })}</div>
    </div>}

    <div className="wizardFooter"><div>{step > 1 && <button type="button" className="button secondary" onClick={() => void goTo((step - 1) as Step)} disabled={saving}>Back</button>}</div><div className="footerRight"><button type="button" className="button secondary" onClick={() => void saveCurrent()} disabled={saving}>{saving ? "Saving..." : "Save"}</button>{step < 3 ? <button type="button" onClick={() => void goTo((step + 1) as Step)} disabled={saving}>{saving ? "Saving..." : "Save & Continue"}</button> : <button type="button" onClick={() => void saveCurrent()} disabled={saving}>{saving ? "Saving..." : "Save Equipment"}</button>}</div></div>

    <style jsx>{`
      .wizardShell{max-width:1040px;margin:0 auto}.wizardHeader,.progressTop,.wizardFooter,.headerActions,.footerRight,.sectionHeading,.equipmentGroupHeader{display:flex;align-items:center;gap:12px}.wizardHeader,.progressTop,.wizardFooter,.sectionHeading,.equipmentGroupHeader{justify-content:space-between}.wizardHeader{align-items:flex-start;margin-bottom:24px}.headerActions,.footerRight{flex-wrap:wrap;justify-content:flex-end}.eyebrow{margin:0 0 4px;font-size:.78rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.progressWrap{margin:18px 0 20px}.progressTop{margin-bottom:8px}.progressTrack{height:10px;overflow:hidden;border-radius:999px;background:rgba(127,127,127,.2)}.progressBar{height:100%;border-radius:inherit;background:currentColor}.stepTabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:20px}.stepTab{display:flex;align-items:center;gap:10px;padding:14px 16px;border:1px solid rgba(127,127,127,.35);border-radius:12px;background:transparent;color:inherit;text-align:left}.stepTab span{display:grid;width:30px;height:30px;place-items:center;border:1px solid currentColor;border-radius:50%;font-weight:800}.stepTab.active{border-width:2px;font-weight:800}.wizardCard{padding:24px;border:1px solid rgba(127,127,127,.28);border-radius:16px;background:rgba(127,127,127,.04)}.formGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}label{display:flex;flex-direction:column;gap:7px;font-weight:700}.full{grid-column:1/-1}input,select,textarea{width:100%;box-sizing:border-box;padding:11px 12px;border:1px solid rgba(127,127,127,.42);border-radius:9px;background:transparent;color:inherit;font:inherit}small{display:block;margin-top:3px;font-weight:400;opacity:.72}.equipmentSearch{margin-bottom:22px}.equipmentGroups{display:grid;gap:20px}.equipmentGroup{padding:18px;border:1px solid rgba(127,127,127,.28);border-radius:14px}.equipmentGroupHeader{margin-bottom:14px}.equipmentGroupHeader h3{margin:0}.textButton{padding:0;border:0;background:transparent;color:inherit;text-decoration:underline;cursor:pointer}.equipmentGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.equipmentOption{display:grid;grid-template-columns:auto 1fr;align-items:start;gap:10px;padding:13px;border:1px solid rgba(127,127,127,.32);border-radius:10px;cursor:pointer}.equipmentOption.selected{border-width:2px;background:rgba(127,127,127,.08)}.equipmentOption input{width:auto;margin-top:3px}.wizardFooter{margin-top:20px}@media(max-width:760px){.wizardHeader,.wizardFooter{align-items:stretch;flex-direction:column}.headerActions,.footerRight{justify-content:flex-start}.stepTabs,.formGrid,.equipmentGrid{grid-template-columns:1fr}.full{grid-column:auto}.wizardCard{padding:18px}}
    `}</style>
  </section>;
}
