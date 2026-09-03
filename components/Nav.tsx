"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const groups = [
  { label: "Clients", links: [
    ["Client Login", "/login?role=client"],
    ["Project Coordinator", "/project-coordinator"],
    ["Client Dashboard", "/client-dashboard"],
    ["Find Inspectors", "/find-inspectors"],
    ["Inspection Intelligence", "/inspection-intelligence"],
    ["Equipment Intelligence", "/equipment-intelligence"],
    ["Asset Intelligence", "/asset-intelligence"],
  ]},
  { label: "Inspectors", links: [
    ["Inspector Login", "/login?role=inspector"],
    ["InspectorHub", "/inspectorhub"],
    ["My Schedule", "/inspectorhub/schedule"],
    ["My Profile", "/dashboard"],
    ["Inspector Requests", "/inspector-inquiries"],
    ["Inspection Reports", "/inspection-reports"],
    ["Browse Qualifications", "/inspectors"],
  ]},
];

export default function Nav() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) setOpenMenu(null);
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenMenu(null);
    }
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return <header className="nav groupedNav" ref={navRef}>
    <Link href="/" className="brand" onClick={() => setOpenMenu(null)}>InspectSource</Link>
    <nav className="primaryNav" aria-label="Main navigation">
      {groups.map(group => <div className="navGroup" key={group.label}>
        <button
          type="button"
          className={openMenu === group.label ? "groupButton open" : "groupButton"}
          aria-expanded={openMenu === group.label}
          onClick={() => setOpenMenu(current => current === group.label ? null : group.label)}
        >
          {group.label}<span aria-hidden="true">▾</span>
        </button>
        {openMenu === group.label && <div className="navMenu">
          {group.links.map(([label, href], index) => <Link className={index === 0 ? "loginLink" : ""} href={href} key={href} onClick={() => setOpenMenu(null)}>{label}</Link>)}
        </div>}
      </div>)}
      <Link className="topLink" href="/demo-showcase" onClick={() => setOpenMenu(null)}>Demo</Link>
      <Link className="topLink" href="/what-we-do" onClick={() => setOpenMenu(null)}>What We Do</Link>
    </nav>
    <style jsx>{`.groupedNav{display:flex;align-items:center;gap:28px;padding:14px 18px;position:relative;z-index:50}.primaryNav{display:flex;align-items:center;gap:8px;flex:1}.navGroup{position:relative}.groupButton{border:0;background:transparent;cursor:pointer;padding:9px 11px;border-radius:8px;font:inherit;font-weight:700;white-space:nowrap;color:#0f172a}.groupButton span{font-size:.7rem;margin-left:6px;color:#64748b}.groupButton.open,.groupButton:hover{background:#eff6ff;color:#1d4ed8}.navMenu{position:absolute;top:calc(100% + 6px);left:0;min-width:245px;padding:7px;background:white;border:1px solid #dbeafe;border-radius:12px;box-shadow:0 14px 35px rgba(15,23,42,.13);display:grid;gap:2px;z-index:100}.navMenu :global(a){padding:10px 11px;border-radius:8px;text-decoration:none;color:#0f172a;white-space:nowrap}.navMenu :global(a:hover){background:#eff6ff;color:#1d4ed8}.navMenu :global(a.loginLink){font-weight:800;color:#1d4ed8;border-bottom:1px solid #e2e8f0;border-radius:8px 8px 4px 4px;margin-bottom:4px}.topLink{padding:9px 11px;border-radius:8px;font-weight:700;text-decoration:none;white-space:nowrap}.topLink:hover{background:#eff6ff;color:#1d4ed8}@media(max-width:980px){.groupedNav{align-items:flex-start;gap:12px;flex-wrap:wrap}.primaryNav{width:100%;flex-basis:100%;overflow-x:auto;padding-bottom:4px}.navMenu{position:fixed;left:18px;right:18px;top:auto;min-width:0}}`}</style>
  </header>;
}
