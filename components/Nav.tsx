"use client";

import Link from "next/link";

const groups = [
  { label: "Clients", links: [
    ["Project Coordinator", "/project-coordinator"],
    ["Client Dashboard", "/client-dashboard"],
    ["Find Inspectors", "/find-inspectors"],
    ["Inspection Intelligence", "/inspection-intelligence"],
    ["Equipment Intelligence", "/equipment-intelligence"],
    ["Asset Intelligence", "/asset-intelligence"],
  ]},
  { label: "Inspectors", links: [
    ["InspectorHub", "/inspectorhub"],
    ["My Schedule", "/inspectorhub/schedule"],
    ["My Profile", "/dashboard"],
    ["Inspector Requests", "/inspector-inquiries"],
    ["Inspection Reports", "/inspection-reports"],
    ["Browse Qualifications", "/inspectors"],
  ]},
];

export default function Nav() {
  return <header className="nav groupedNav">
    <Link href="/" className="brand">InspectSource</Link>
    <nav className="primaryNav" aria-label="Main navigation">
      {groups.map(group => <details className="navGroup" key={group.label}><summary>{group.label}<span aria-hidden="true">▾</span></summary><div className="navMenu">{group.links.map(([label,href]) => <Link href={href} key={href}>{label}</Link>)}</div></details>)}
      <Link className="topLink clientDemoLink" href="/demo/client">Client Demo</Link>
      <Link className="topLink inspectorDemoLink" href="/demo/inspector">Inspector Demo</Link>
      <Link className="topLink" href="/what-we-do">What We Do</Link>
    </nav>
    <nav className="loginNav" aria-label="Login navigation">
      <Link className="clientLogin" href="/login?role=client">Client Login</Link>
      <Link className="inspectorLogin" href="/login?role=inspector">Inspector Login</Link>
    </nav>
    <style jsx>{`.groupedNav{display:flex;align-items:center;gap:28px;padding:14px 18px;position:relative;z-index:50}.primaryNav{display:flex;align-items:center;gap:8px;flex:1}.loginNav{display:flex;align-items:center;gap:8px;margin-left:auto}.navGroup{position:relative}.navGroup summary{list-style:none;cursor:pointer;padding:9px 11px;border-radius:8px;font-weight:700;white-space:nowrap;user-select:none}.navGroup summary::-webkit-details-marker{display:none}.navGroup summary span{font-size:.7rem;margin-left:6px;color:#64748b}.navGroup[open] summary,.navGroup summary:hover{background:#f1f5f9}.navMenu{position:absolute;top:calc(100% + 6px);left:0;min-width:245px;padding:7px;background:white;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 14px 35px rgba(15,23,42,.13);display:grid;gap:2px}.navMenu :global(a){padding:10px 11px;border-radius:8px;text-decoration:none;color:#0f172a;white-space:nowrap}.navMenu :global(a:hover){background:#f1f5f9}.topLink,.loginNav :global(a){padding:9px 11px;border-radius:8px;font-weight:700;text-decoration:none;white-space:nowrap}.topLink:hover,.loginNav :global(a:hover){background:#f1f5f9}.clientDemoLink{background:#eff6ff;color:#1d4ed8!important}.inspectorDemoLink{background:#ecfdf5;color:#047857!important}.clientLogin{border:1px solid #cbd5e1}.inspectorLogin{background:#0f172a;color:#fff!important}@media(max-width:1120px){.groupedNav{align-items:flex-start;gap:12px;flex-wrap:wrap}.primaryNav{order:3;width:100%;flex-basis:100%;overflow-x:auto;padding-bottom:4px}.loginNav{margin-left:auto}.navMenu{position:fixed;left:18px;right:18px;top:auto;min-width:0}}`}</style>
  </header>;
}
