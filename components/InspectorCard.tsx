import Link from "next/link";
import type { InspectorProfile } from "@/lib/types";
import { money } from "@/lib/helpers";

export default function InspectorCard({ inspector }: { inspector: InspectorProfile }) {
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
      <p className="muted">{inspector.base_city || "City not listed"}{inspector.base_state ? `, ${inspector.base_state}` : ""} · {inspector.base_country || "Country not listed"}</p>
      {inspector.company && <p><b>Company:</b> {inspector.company}</p>}
      <div className="chips">
        {inspector.certifications?.slice(0, 4).map((x) => <span key={x}>{x}</span>)}
        {inspector.methods?.slice(0, 4).map((x) => <span key={x}>{x}</span>)}
      </div>
      <p className="rates">Hourly: {money(inspector.hourly_rate)} / Day: {money(inspector.day_rate)}</p>
      <Link className="button secondary" href={`/inspectors/${inspector.id}`}>View profile</Link>
    </article>
  );
}
