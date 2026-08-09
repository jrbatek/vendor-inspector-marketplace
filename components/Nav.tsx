import Link from "next/link";

const groups = [
  { label: "Projects", links: [
    ["Project Coordinator", "/project-coordinator"],
    ["Client Dashboard", "/client-dashboard"],
    ["Inspection Reports", "/inspection-reports"],
  ]},
  { label: "Intelligence", links: [
    ["Inspection Intelligence", "/inspection-intelligence"],
    ["Equipment Intelligence", "/equipment-intelligence"],
    ["Asset Intelligence", "/asset-intelligence"],
  ]},
  { label: "Inspectors", links: [
    ["Find Inspectors", "/find-inspectors"],
    ["Browse Qualifications", "/inspectors"],
    ["Inspector Requests", "/inspector-inquiries"],
  ]},
  { label: "InspectorHub", links: [
    ["My InspectorHub", "/inspectorhub"],
    ["My Profile", "/dashboard"],
    ["Schedule", "/inspectorhub/schedule"],
  ]},
];

export default function Nav() {
  return (
    <header className="nav groupedNav">
      <Link href="/" className="brand">InspectSource</Link>
      <nav className="primaryNav" aria-label="Main navigation">
        {groups.map(group => (
          <details className="navGroup" key={group.label}>
            <summary>{group.label}<span aria-hidden="true">▾</span></summary>
            <div className="navMenu">
              {group.links.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}
            </div>
          </details>
        ))}
        <Link className="topLink" href="/demo-showcase">Demo</Link>
      </nav>
      <nav className="accountNav" aria-label="Account navigation">
        <details className="navGroup accountGroup">
          <summary>Account<span aria-hidden="true">▾</span></summary>
          <div className="navMenu rightMenu">
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </div>
        </details>
      </nav>
      <style jsx>{`
        .groupedNav{display:flex;align-items:center;gap:28px;padding:14px 18px;position:relative;z-index:50}
        .primaryNav{display:flex;align-items:center;gap:8px;flex:1}
        .accountNav{display:flex;align-items:center}
        .navGroup{position:relative}
        .navGroup summary{list-style:none;cursor:pointer;padding:9px 11px;border-radius:8px;font-weight:700;white-space:nowrap;user-select:none}
        .navGroup summary::-webkit-details-marker{display:none}
        .navGroup summary span{font-size:.7rem;margin-left:6px;color:#64748b}
        .navGroup[open] summary,.navGroup summary:hover{background:#f1f5f9}
        .navMenu{position:absolute;top:calc(100% + 6px);left:0;min-width:225px;padding:7px;background:white;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 14px 35px rgba(15,23,42,.13);display:grid;gap:2px}
        .navMenu :global(a){padding:10px 11px;border-radius:8px;text-decoration:none;color:#0f172a;white-space:nowrap}
        .navMenu :global(a:hover){background:#f1f5f9}
        .rightMenu{left:auto;right:0;min-width:150px}
        .topLink{padding:9px 11px;border-radius:8px;font-weight:700;text-decoration:none;white-space:nowrap}
        .topLink:hover{background:#f1f5f9}
        @media(max-width:850px){
          .groupedNav{align-items:flex-start;gap:12px;flex-wrap:wrap}
          .primaryNav{order:3;width:100%;flex-basis:100%;overflow-x:auto;padding-bottom:4px}
          .accountNav{margin-left:auto}
          .navMenu{position:fixed;left:18px;right:18px;top:auto;min-width:0}
          .rightMenu{left:18px;right:18px}
        }
      `}</style>
    </header>
  );
}
