"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ClientWorkspaceSidebar({demo=false}:{demo?:boolean}){
  const pathname=usePathname();
  const activePath=(path:string)=>pathname===path;
  const requestHref=demo?"/demo-showcase":"/client-dashboard";
  const naturalHref=demo?"/find-inspectors?demo=1":"/find-inspectors";
  const emailHref=demo?"/email-requirements?demo=1":"/email-requirements";
  const structuredHref=demo?"/inspectors?demo=1":"/inspectors";
  const activeHref=demo?"/demo/client-history?view=active":"/client-dashboard?section=active";
  const historyHref=demo?"/demo/client-history":"/client-dashboard?section=history";
  const analyticsHref=demo?"/demo/client-analytics":"/client-dashboard?section=analytics";
  const billingHref=demo?"/demo/client-operations?tab=billing":"/client-dashboard?section=billing";
  const contractsHref=demo?"/demo/client-operations?tab=contracts":"/client-dashboard?section=contracts";
  const profileHref=demo?"/demo/client-operations?tab=profile":"/client-dashboard?section=profile";
  const requestActive=activePath("/demo-showcase")||activePath("/find-inspectors")||activePath("/email-requirements")||activePath("/inspectors")||(!demo&&activePath("/client-dashboard"));
  const analyticsActive=activePath("/demo/client-analytics");
  const historyActive=activePath("/demo/client-history");
  const operationsActive=activePath("/demo/client-operations");

  return <aside className="clientSide">
    <div className="title"><span>Client Workspace</span><strong>InspectSource</strong></div>
    <Link className={requestActive?"primary active":"primary"} href={requestHref}>Request Inspectors</Link>
    <div className="subnav">
      <Link className={activePath("/find-inspectors")?"active":""} href={naturalHref}>Natural language</Link>
      <Link className={activePath("/email-requirements")?"active":""} href={emailHref}>Email requirements</Link>
      <Link className={activePath("/inspectors")?"active":""} href={structuredHref}>Structured selection</Link>
    </div>
    <Link className={historyActive?"active":""} href={activeHref}>Inspections in Progress</Link>
    <Link className={historyActive?"active":""} href={historyHref}>Inspection History</Link>
    <Link className={analyticsActive?"active":""} href={analyticsHref}>Analytics</Link>
    <Link className={operationsActive?"active":""} href={billingHref}>Billing & Payment</Link>
    <Link className={operationsActive?"active":""} href={contractsHref}>Contracts</Link>
    <Link className={operationsActive?"active":""} href={profileHref}>Profile</Link>
    <style jsx>{`.clientSide{position:sticky;top:18px;height:max-content;background:#0f172a;border-radius:16px;padding:16px;color:#fff;display:grid;gap:3px}.title{padding:8px 8px 16px;border-bottom:1px solid #334155;margin-bottom:10px}.title span{display:block;font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:#94a3b8}.title strong{font-size:1.15rem}.clientSide :global(a){color:#e2e8f0;text-decoration:none;padding:10px 9px;border-radius:8px;font-weight:800}.clientSide :global(a:hover){background:#1e293b;color:#fff}.clientSide :global(a.active){background:#fff;color:#0f172a}.clientSide :global(a.primary){text-align:center;background:transparent;color:#e2e8f0}.clientSide :global(a.primary.active){background:#fff;color:#0f172a}.subnav{display:grid;gap:2px;margin:0 0 10px 12px;padding-left:10px;border-left:1px solid #334155}.subnav :global(a){font-size:.84rem;font-weight:500;color:#cbd5e1;padding:7px 8px}.subnav :global(a.active){background:#1e293b;color:#fff}@media(max-width:980px){.clientSide{position:static}}`}</style>
  </aside>
}
