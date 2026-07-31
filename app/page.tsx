import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <section className="hero homeHero">
        <p className="eyebrow">Vendor inspection marketplace</p>
        <h1>Describe the inspection. Find the right inspector.</h1>
        <p className="muted homeIntro">
          InspectSource turns a plain-English requirement into an explainable,
          fact-based shortlist of qualified vendor inspectors.
        </p>
        <div className="actions">
          <Link className="button" href="/find-inspectors">Find an Inspector</Link>
          <Link className="button secondary" href="/register">Create an Account</Link>
        </div>
      </section>

      <section className="homeGrid">
        <article className="panel">
          <p className="eyebrow">For clients</p>
          <h2>Search naturally</h2>
          <p className="muted">
            Describe location, certifications, scope, schedule, travel, and
            budget in normal language.
          </p>
          <Link href="/find-inspectors">Start a search →</Link>
        </article>

        <article className="panel">
          <p className="eyebrow">For inspectors</p>
          <h2>Build a detailed profile</h2>
          <p className="muted">
            Capture equipment, activities, NDT methods, certifications, codes,
            travel credentials, rates, and availability.
          </p>
          <Link href="/dashboard">Build your profile →</Link>
        </article>

        <article className="panel">
          <p className="eyebrow">For both sides</p>
          <h2>Track inquiries</h2>
          <p className="muted">
            Clients can request availability and inspectors can review and
            respond to incoming opportunities.
          </p>
          <Link href="/client-dashboard">Open dashboard →</Link>
        </article>
      </section>
    </>
  );
}
