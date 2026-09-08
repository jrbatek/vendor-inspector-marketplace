"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="homeShell">
      <section className="brandBanner" aria-labelledby="home-brand-line">
        <p>InspectSource</p>
        <h1 id="home-brand-line">Eyes, Ears, and Expertise, Everywhere.</h1>
        <span>One inspection platform for the people who need inspections and the professionals who perform them.</span>
      </section>

      <section className="audienceGrid" aria-label="InspectSource experiences">
        <article className="audienceCard clientCard">
          <div className="cardLabel">For Clients</div>
          <h2>Find, coordinate, and manage qualified inspectors.</h2>
          <p>Describe what you need, compare anonymous qualified professionals, manage active inspections, and keep project history and intelligence in one place.</p>
          <div className="featureList">
            <span>Natural language, email, or structured requests</span>
            <span>Explainable inspector matching</span>
            <span>Inspection workflow, history, and analytics</span>
            <span>Manage contracts, approvals and payments</span>
          </div>
          <div className="actions">
            <Link className="button clientButton" href="/find-inspectors">Find Inspectors</Link>
            <Link className="textLink" href="/client-dashboard">Explore Client Workspace →</Link>
          </div>
          <div className="demoEntry clientDemo">
            <div>
              <strong>Client Demo</strong>
              <span>Explore the complete client workflow using synthetic inspection data.</span>
            </div>
            <Link href="/demo/client">Open Client Demo →</Link>
          </div>
        </article>

        <article className="audienceCard inspectorCard">
          <div className="cardLabel">For Inspectors</div>
          <h2>Build your profile and run your inspection work.</h2>
          <p>Show verified qualifications, manage availability and opportunities, complete reports, and keep your professional inspection activity organized.</p>
          <div className="featureList">
            <span>Qualifications and professional profile</span>
            <span>Opportunities, schedule, and assignments</span>
            <span>Reports, history, and selection insights</span>
            <span>Manage billing, documentation, and tax reporting</span>
          </div>
          <div className="actions">
            <Link className="button inspectorButton" href="/inspectorhub">Explore InspectorHub</Link>
            <Link className="textLink" href="/register">Join as an Inspector →</Link>
          </div>
          <div className="demoEntry inspectorDemo">
            <div>
              <strong>Inspector Demo</strong>
              <span>See InspectorHub populated with synthetic work history and activity.</span>
            </div>
            <Link href="/demo/inspector">Open Inspector Demo →</Link>
          </div>
        </article>
      </section>

      <section className="trustStrip">
        <strong>InspectSource protects qualification integrity.</strong>
        <span>Demo experiences use synthetic records; authenticated workspaces use live account data.</span>
      </section>

      <style jsx>{`.homeShell{display:grid;gap:16px;padding:6px 0 36px}.brandBanner{position:relative;overflow:hidden;padding:30px 36px;border-radius:20px;background:linear-gradient(120deg,#0f172a 0%,#12375a 58%,#0f766e 120%);color:#fff;box-shadow:0 14px 34px rgba(15,23,42,.14)}.brandBanner:after{content:"";position:absolute;width:260px;height:260px;border-radius:50%;right:-80px;top:-150px;background:rgba(255,255,255,.08)}.brandBanner p{margin:0 0 6px;font-size:.76rem;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:#a7f3d0}.brandBanner h1{max-width:900px;margin:0;font-size:clamp(2rem,4.5vw,3.65rem);line-height:1.02;letter-spacing:-.04em}.brandBanner span{display:block;max-width:760px;margin-top:12px;color:#dbeafe;font-size:1rem;line-height:1.55}.audienceGrid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.audienceCard{display:flex;flex-direction:column;min-height:440px;padding:26px;border:1px solid #dbe3ec;border-radius:20px;background:#fff;box-shadow:0 10px 28px rgba(15,23,42,.055)}.clientCard{border-top:5px solid #2563eb;background:linear-gradient(180deg,#eff6ff 0,#fff 34%)}.inspectorCard{border-top:5px solid #0f766e;background:linear-gradient(180deg,#ecfdf5 0,#fff 34%)}.cardLabel{width:max-content;padding:5px 8px;border-radius:999px;background:rgba(255,255,255,.8);font-size:.7rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#475569}.audienceCard h2{margin:14px 0 9px;font-size:clamp(1.5rem,2.7vw,2.15rem);line-height:1.1;letter-spacing:-.025em;color:#0f172a}.audienceCard p{margin:0;color:#526074;line-height:1.58}.featureList{display:grid;gap:8px;margin:18px 0}.featureList span{position:relative;padding-left:22px;color:#334155;font-weight:650}.featureList span:before{content:"✓";position:absolute;left:0;font-weight:900;color:#0f766e}.actions{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:auto;padding-top:12px}.button{display:inline-flex;align-items:center;justify-content:center;padding:11px 15px;border-radius:10px;text-decoration:none;font-weight:850;color:#fff}.clientButton{background:#1d4ed8}.inspectorButton{background:#0f766e}.textLink{font-weight:750;text-decoration:none;color:#334155}.demoEntry{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:16px;padding:13px 15px;border-radius:13px}.clientDemo{background:#eff6ff;border:1px solid #bfdbfe}.inspectorDemo{background:#ecfdf5;border:1px solid #a7f3d0}.demoEntry div{display:grid;gap:3px}.demoEntry strong{color:#0f172a}.demoEntry span{font-size:.82rem;line-height:1.35;color:#64748b}.demoEntry :global(a){white-space:nowrap;text-decoration:none;font-size:.84rem;font-weight:850;color:#0f172a}.trustStrip{display:flex;align-items:center;justify-content:center;gap:9px;flex-wrap:wrap;padding:12px 16px;border:1px solid #e2e8f0;border-radius:13px;background:#f8fafc;color:#475569;font-size:.88rem}.trustStrip strong{color:#0f172a}@media(max-width:820px){.homeShell{padding-top:0}.brandBanner{padding:26px 22px}.audienceGrid{grid-template-columns:1fr}.audienceCard{min-height:0;padding:24px 20px}.demoEntry{align-items:flex-start;flex-direction:column}}`}</style>
    </div>
  );
}
