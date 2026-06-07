import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import type { InspectorProfile } from "@/lib/types";
import { money } from "@/lib/helpers";

export default async function InspectorProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase
    .from("inspector_profiles")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!data) notFound();

  const p = data as InspectorProfile;

  const travel =
    p.travel_distance && p.distance_unit
      ? `${p.travel_distance} ${p.distance_unit}`
      : "Not listed";

  const travelRate =
    p.distance_unit === "miles"
      ? p.mileage_rate
        ? `$${p.mileage_rate}/mile`
        : "Not listed"
      : p.kilometer_rate
        ? `$${p.kilometer_rate}/km`
        : "Not listed";

  return (
    <section className="panel">
      <div className="profileHeader">
        <div>
          <h1>{p.name || "Unnamed Inspector"}</h1>
          <p className="headline">{p.headline || "Vendor inspector"}</p>
          <p className="muted">
            {p.base_city || "City not listed"}
            {p.base_state ? `, ${p.base_state}` : ""} · {p.base_country || "Country not listed"}
          </p>
        </div>
        <span className={p.available ? "badge good" : "badge muted"}>
          {p.available ? "Available" : "Unavailable"}
        </span>
      </div>

      {p.company && <p><b>Company:</b> {p.company}</p>}
      {p.primary_discipline && <p><b>Primary discipline:</b> {p.primary_discipline}</p>}
      {p.years_experience !== null && p.years_experience !== undefined && (
        <p><b>Years experience:</b> {p.years_experience}</p>
      )}

      <p><b>Driving distance:</b> {travel}</p>
      <p><b>Travel rate:</b> {travelRate}</p>
      <p><b>Willing to travel:</b> {p.willing_to_travel ? "Yes" : "No"}</p>
      <p><b>Remote review available:</b> {p.remote_review_available ? "Yes" : "No"}</p>

      <p><b>Hourly:</b> {money(p.hourly_rate)} &nbsp; <b>Day:</b> {money(p.day_rate)}</p>

      <h3>Certifications</h3>
      <div className="chips">{p.certifications?.map((x) => <span key={x}>{x}</span>)}</div>

      <h3>Methods</h3>
      <div className="chips">{p.methods?.map((x) => <span key={x}>{x}</span>)}</div>

      <h3>Industries</h3>
      <div className="chips">{p.industries?.map((x) => <span key={x}>{x}</span>)}</div>

      <h3>Bio</h3>
      <p>{p.bio || "No bio entered yet."}</p>

      <h3>Contact</h3>
      <p>
        {p.email && <>Email: <a href={`mailto:${p.email}`}>{p.email}</a><br /></>}
        {p.phone && <>Phone: <a href={`tel:${p.phone}`}>{p.phone}</a></>}
      </p>

      <Link href="/inspectors" className="button secondary">Back to directory</Link>
    </section>
  );
}
