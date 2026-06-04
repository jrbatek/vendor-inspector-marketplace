import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import type { InspectorProfile } from "@/lib/types";
import { money } from "@/lib/helpers";

export default async function InspectorProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data } = await supabase.from("inspector_profiles").select("*").eq("id", params.id).single();
  if (!data) notFound();
  const p = data as InspectorProfile;

  return (
    <section className="panel">
      <div className="profileHeader">
        <div>
          <h1>{p.name || "Unnamed Inspector"}</h1>
          <p className="headline">{p.headline || "Vendor inspector"}</p>
          <p className="muted">{p.base_city || "City not listed"}{p.base_state ? `, ${p.base_state}` : ""} · {p.base_country || "Country not listed"}</p>
        </div>
        <span className={p.available ? "badge good" : "badge muted"}>{p.available ? "Available" : "Unavailable"}</span>
      </div>
      {p.company && <p><b>Company:</b> {p.company}</p>}
      {p.travel_radius && <p><b>Travel radius:</b> {p.travel_radius}</p>}
      <p><b>Hourly:</b> {money(p.hourly_rate)} &nbsp; <b>Day:</b> {money(p.day_rate)}</p>
      <h3>Certifications</h3><div className="chips">{p.certifications?.map((x)=><span key={x}>{x}</span>)}</div>
      <h3>Methods</h3><div className="chips">{p.methods?.map((x)=><span key={x}>{x}</span>)}</div>
      <h3>Industries</h3><div className="chips">{p.industries?.map((x)=><span key={x}>{x}</span>)}</div>
      <h3>Bio</h3><p>{p.bio || "No bio entered yet."}</p>
      <h3>Contact</h3>
      <p>{p.email && <>Email: <a href={`mailto:${p.email}`}>{p.email}</a><br /></>}{p.phone && <>Phone: <a href={`tel:${p.phone}`}>{p.phone}</a></>}</p>
      <Link href="/inspectors" className="button secondary">Back to directory</Link>
    </section>
  );
}
