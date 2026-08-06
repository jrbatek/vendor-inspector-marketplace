import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <p style={{fontWeight:800,letterSpacing:".12em",textTransform:"uppercase",fontSize:".78rem"}}>
          Anonymous vendor-inspection marketplace
        </p>
        <h1>Describe the assignment. InspectSource finds the best qualified inspectors.</h1>
        <p className="muted">
          Clients search in plain English. InspectSource ranks anonymous professionals using
          verified qualifications, experience, location, availability, travel, and rate data.
        </p>
        <div className="actions">
          <Link className="button" href="/find-inspectors">Find Inspectors</Link>
          <Link className="button secondary" href="/register">Join as an Inspector</Link>
        </div>
      </section>

      <section className="grid">
        <article className="panel">
          <h2>Natural-language intake</h2>
          <p>Describe certifications, equipment, dates, location, travel, and budget in one request.</p>
        </article>
        <article className="panel">
          <h2>Explainable matching</h2>
          <p>Every score includes reasons for the match and items that still need confirmation.</p>
        </article>
        <article className="panel">
          <h2>Identity protection</h2>
          <p>Clients evaluate qualifications without receiving names or direct contact information.</p>
        </article>
      </section>
    </>
  );
}
