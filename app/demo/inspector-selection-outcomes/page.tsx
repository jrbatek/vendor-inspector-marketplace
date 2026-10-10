"use client";

const outcomes = [
  { period: "Last 90 days", presented: 18, shortlisted: 11, selected: 6 },
  { period: "Prior 90 days", presented: 15, shortlisted: 8, selected: 4 },
];

const differentiators = [
  { label: "Required qualifications documented", detail: "Your recorded qualifications matched required credentials more often on selected opportunities.", evidence: "5 of 6 selected opportunities" },
  { label: "Local or low-travel availability", detail: "Your recorded availability and location reduced travel needs on several selections.", evidence: "4 of 6 selected opportunities" },
  { label: "Recent relevant work evidence", detail: "Recent work-history records aligned with the requested equipment or inspection activity.", evidence: "4 of 6 selected opportunities" },
];

export default function InspectorSelectionOutcomesDemo() {
  const current = outcomes[0];
  const shortlistRate = Math.round((current.shortlisted / current.presented) * 100);
  const selectionRate = Math.round((current.selected / current.presented) * 100);
  const shortlistedConversion = Math.round((current.selected / current.shortlisted) * 100);

  return <main className="page">
    <header className="hero">
      <p className="eyebrow">InspectorHub · Synthetic demo</p>
      <h1>Selection Outcomes</h1>
      <p>Understand how often your profile progresses and which evidence-supported factors are associated with selections.</p>
      <div className="boundary" role="note"><strong>Demo Mode · Synthetic data</strong><span>These counts and observations are deterministic examples. Live outcomes must be calculated only from the authenticated inspector&apos;s own selection history.</span></div>
    </header>

    <section className="metrics" aria-label="Selection outcome metrics">
      <article><span>Presented</span><strong>{current.presented}</strong><small>{current.period}</small></article>
      <article><span>Shortlisted</span><strong>{current.shortlisted}</strong><small>{shortlistRate}% of presentations</small></article>
      <article><span>Selected</span><strong>{current.selected}</strong><small>{selectionRate}% of presentations</small></article>
      <article><span>Shortlist → selection</span><strong>{shortlistedConversion}%</strong><small>{current.selected} of {current.shortlisted} shortlists</small></article>
    </section>

    <section className="card">
      <div className="sectionHead"><div><p className="eyebrow">Trend</p><h2>Recent conversion</h2></div><span className="badge">Aggregate outcomes only</span></div>
      <div className="trend" role="table" aria-label="Selection outcome trend">
        <div className="trendHead" role="row"><span>Period</span><span>Presented</span><span>Shortlisted</span><span>Selected</span></div>
        {outcomes.map(row => <div className="trendRow" role="row" key={row.period}><strong>{row.period}</strong><span>{row.presented}</span><span>{row.shortlisted}</span><span>{row.selected}</span></div>)}
      </div>
    </section>

    <section className="card">
      <p className="eyebrow">Evidence-supported differentiators</p>
      <h2>What is associated with stronger outcomes</h2>
      <p className="intro">These observations summarize your own profile and outcome history. They are not guarantees, eligibility claims, or rankings against named inspectors.</p>
      <div className="signals">{differentiators.map(item => <article key={item.label}><div><strong>{item.label}</strong><p>{item.detail}</p></div><span>{item.evidence}</span></article>)}</div>
      <div className="privacy" role="note"><strong>Privacy boundary</strong><p>Competing inspector identities, profiles, rates, rankings, and individual outcomes are never exposed. Comparisons are aggregate and evidence-supported only.</p></div>
    </section>

    <style jsx>{`
      .page{max-width:1100px;margin:auto;padding:32px 18px 72px;background:#f8fafc;min-height:100vh;color:#16302d}.hero,.card,.metrics article{background:#fff;border:1px solid #dbe5e4;border-radius:18px}.hero,.card{padding:26px}.hero h1{margin:4px 0 8px;font-size:38px}.eyebrow{margin:0;color:#0f766e;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.boundary,.privacy{margin-top:18px;padding:14px 16px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:12px}.boundary span{display:block;margin-top:4px;color:#47615e}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:18px 0}.metrics article{padding:18px}.metrics span,.metrics small{display:block;color:#64748b}.metrics strong{display:block;font-size:30px;margin:5px 0;color:#0f766e}.card{margin-top:18px}.sectionHead{display:flex;justify-content:space-between;gap:16px;align-items:start}.badge{background:#f0fdfa;color:#115e59;border-radius:999px;padding:7px 10px;font-weight:700;font-size:12px}.trend{margin-top:16px;border:1px solid #dbe5e4;border-radius:12px;overflow:hidden}.trendHead,.trendRow{display:grid;grid-template-columns:2fr repeat(3,1fr);gap:10px;padding:12px 14px}.trendHead{background:#f1f5f9;font-weight:700}.trendRow+ .trendRow{border-top:1px solid #e2e8f0}.signals{display:grid;gap:10px;margin-top:16px}.signals article{display:flex;justify-content:space-between;gap:24px;padding:15px;border:1px solid #dbe5e4;border-radius:12px}.signals p,.privacy p,.intro{color:#526a67}.signals p,.privacy p{margin:5px 0 0}.signals span{min-width:180px;text-align:right;font-weight:800;color:#0f766e}.privacy strong{color:#065f46}@media(max-width:760px){.metrics{grid-template-columns:1fr 1fr}.signals article{display:block}.signals span{display:block;text-align:left;margin-top:8px}.trendHead,.trendRow{grid-template-columns:1.5fr repeat(3,1fr);font-size:13px}}@media(max-width:480px){.metrics{grid-template-columns:1fr}.hero h1{font-size:32px}}
    `}</style>
  </main>;
}
