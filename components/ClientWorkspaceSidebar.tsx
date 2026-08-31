"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ClientWorkspaceSidebar(){
  const pathname=usePathname();
  const active=(href:string)=>pathname===href;
  return <aside className="clientSide">
    <div className="title"><span>Client Workspace</span><strong>InspectSource</strong></div>
    <Link className="primary" href="/client-dashboard">Request Inspectors</Link>
    <div className="subnav">
      <Link className={active("/find-inspectors")?"active":""} href="/find-inspectors">Natural language</Link>
      <a href="mailto:inspectsource2026@gmail.com">Email requirements</a>
      <Link className={active("/inspectors")?"active":""} href="/inspectors">Structured selection</Link>
    </div>
    <Link href="/client-dashboard?section=active">Inspections in Progress</Link>
    <Link href="/client-dashboard?section=history">Inspection History</Link>
    <Link href="/client-dashboard?section=analytics">Analytics</Link>
    <Link href="/client-dashboard?section=billing">Billing & Payment</Link>
    <Link href="/client-dashboard?section=contracts">Contracts</Link>
    <Link href="/client-dashboard?section=profile">Profile</Link>
    <style jsx>{`.clientSide{position:sticky;top:18px;height:max-content;background:#0f172a;border-radius:16px;padding:16px;color:#fff;display:grid;gap:3px}.title{padding:8px 8px 16px;border-bottom:1px solid #334155;margin-bottom:10px}.title span{display:block;font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:#94a3b8}.title strong{font-size:1.15rem}.clientSide :global(a){color:#e2e8f0;text-decoration:none;padding:10px 9px;border-radius:8px;font-weight:800}.clientSide :global(a:hover),.clientSide :global(a.active){background:#1e293b;color:#fff}.clientSide :global(a.primary){background:#fff;color:#0f172a;text-align:center}.subnav{display:grid;gap:2px;margin:0 0 10px 12px;padding-left:10px;border-left:1px solid #334155}.subnav :global(a){font-size:.84rem;font-weight:500;color:#cbd5e1;padding:7px 8px}@media(max-width:980px){.clientSide{position:static}}`}</style>
  </aside>
}
