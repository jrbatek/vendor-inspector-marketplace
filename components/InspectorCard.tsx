import Link from "next/link";
import type { InspectorProfile } from "@/lib/types";
import { money } from "@/lib/helpers";

export default function InspectorCard({ inspector }: { inspector: InspectorProfile }) {
  const travel =
    inspector.travel_distance && inspector.distance_unit
      ? `${inspector.travel_distance} ${inspector.distance_unit}`
      : "Travel distance not listed";

  const travelRate =
    inspector.distance_unit === "miles"
      ? inspector.mileage_rate
        ? `$${inspector.mileage_rate}/mile`
        : ""
      : inspector.kilometer_rate
        ? `$${inspector.kilometer_rate}/km`
        : "";

  return (
    <article className="card">
      <div className="cardTop">
        <div>
          <h3>{inspector.name || "Unnamed Inspector"}</h3>
          <p className="headline">{inspector.headline || "Vendor inspector"}</p>
        </div>
        <span className={inspector.available ? "badge good" : "badge muted"}>
          {inspector.available ? "Available" : "Unavailable"}
        </span>
      </div>

      <p className="muted">
        {inspector.base_city || "City not listed"}
        {inspector.base_state ? `, ${inspector.base_state}` : ""} · {inspector.base_country || "Country not listed"}
      </p>

      {inspector.primary_discipline && <p><b>Discipline:</b> {inspector.primary_discipline}</p>}
      {inspector.years_experience !== null && inspector.years_experience !== undefined && (
        <p><b>Experience:</b> {inspector.years_experience} years</p>
      )}

      {inspector.company && <p><b>Company:</b> {inspector.company}</p>}

      <p><b>Driving distance:</b> {travel}</p>
      {travelRate && <p><b>Travel rate:</b> {travelRate}</p>}

      <p>
        {inspector.willing_to_travel ? "Willing to travel" : "Local only"}
        {inspector.remote_review_available ? " · Remote review available" : ""}
      </p>

      <div className="chips">
        {inspector.certifications?.slice(0, 4).map((x) => <span key={x}>{x}</span>)}
        {inspector.methods?.slice(0, 4).map((x) => <span key={x}>{x}</span>)}
      </div>

      <p className="rates">
        Hourly: {money(inspector.hourly_rate)} / Day: {money(inspector.day_rate)}
      </p>

      <Link className="button secondary" href={`/inspectors/${inspector.id}`}>
        View profile
      </Link>
    </article>
  );
}
