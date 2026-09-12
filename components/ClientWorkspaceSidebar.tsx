"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function ClientWorkspaceSidebar({demo=false}:{demo?:boolean}){
  const pathname=usePathname();
  const [query,setQuery]=useState("");
  useEffect(()=>{const sync=()=>setQuery(window.location.search);sync();window.addEventListener("popstate",sync);return()=>window.removeEventListener("popstate",sync)},[]);
  const params=new URLSearchParams(query);
  const activePath=(path:string)=>pathname===path;
  const requestHref=demo?"/demo/client":"/client-dashboard";
  const naturalHref=demo?"/demo/client#natural-language":"/find-inspectors";
  const emailHref=demo?"/email-requirements?demo=1":"/email-requirements";
  const structuredHref=demo?"/demo/client#structured-selection":"/inspectors";
  const activeHref=demo?"/demo/client-history?view=active":"/client-dashboard?section=active";
  const historyHref=demo?"/demo/client-history":"/client-dashboard?section=history";
  const analyticsHref=demo?"/demo/client-analytics":"/client-dashboard?section=analytics";
  const billingHref=demo?"/demo/client-operations?tab=billing":"/client-dashboard?section=billing";
  const contractsHref=demo?"/demo/client-operations?tab=contracts":"/client-dashboard?section=contracts";
  const profileHref=demo?"/demo/client-operations?tab=profile":"/client-dashboard?section=profile";
  const requestActive=activePath("/demo/client")||(!demo&&activePath("/client-dashboard")&&!params.get("section"));
  const analyticsActive=activePath("/demo/client-analytics")||(!demo&&params.get("section")==="analytics");
  const view=params.get("view");
  const historyActive=(activePath("/demo/client-history")&&view!=="active")||(!demo&&params.get("section")==="history");
  const progressActive=(activePath("/demo/client-history")&&view==="active")||(!demo&&params.get("section")==="active");
  const tab=params.get("tab")||"billing";
  const billingActive=(activePath("/demo/client-operations")&&tab==="billing")||(!demo&&params.get("section")==="billing");
  const contractsActive=(activePath("/demo/client-operations")&&tab==="contracts")||(!demo&&params.get("section")==="contracts");
  const profileActive=(activePath("/demo/client-operations")&&tab==="profile")||(!demo&&params.get("section")==="profile");

  return <aside className="clientSide" aria-label="Client Workspace navigation">
    <div className="title"><span>Client Workspace</span><strong>InspectSource</strong></div>
    <Link aria-current={requestActive?"page":undefined} className={requestActive?"primary active":"primary"} href={requestHref}>Request Inspectors</Link>
    <nav className="subnav" aria-label="Request inspector methods"><Link href={naturalHref}>Natural language</Link><Link href={emailHref}>Email requirements</Link><Link href={structuredHref}>Structured selection</Link></nav>
    <Link aria-current={progressActive?"page":undefined} className={progressActive?"active":""} href={activeHref}>Inspections in Progress</Link><Link aria-current={historyActive?"page":undefined} className={historyActive?"active":""} href={historyHref}>Inspection History</Link><Link aria-current={analyticsActive?"page":undefined} className={analyticsActive?"active":""} href={analyticsHref}>Analytics</Link><Link aria-current={billingActive?"page":undefined} className={billingActive?"active":""} href={billingHref}>Billing & Payment</Link><Link aria-current={contractsActive?"page":undefined} className={contractsActive?"active":""} href={contractsHref}>Contracts</Link><Link aria-current={profileActive?"page":undefined} className={profileActive?"active":""} href={profileHref}>Profile</Link>
    <style jsx>{`.clientSide{position:sticky;top:18px;height:max-content;background:#0f172a;border-radius:16px;padding:16px;color:#fff;display:grid;gap:3px}.title{padding:8px 8px 16px;border-bottom:1px solid #334155;margin-bottom:10px}.title span{display:block;font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:#94a3b8}.title strong{font-size:1.15rem}.clientSide :global(a){color:#e2e8f0;text-decoration:none;padding:10px 9px;border-radius:8px;font-weight:800}.clientSide :global(a:hover){background:#1e293b;color:#fff}.clientSide :global(a.active){background:#fff;color:#0f172a}.clientSide :global(a.primary){text-align:center;background:transparent;color:#e2e8f0}.clientSide :global(a.primary.active){background:#fff;color:#0f172a}.subnav{display:grid;gap:2px;margin:0 0 10px 12px;padding-left:10px;border-left:1px solid #334155}.subnav :global(a){font-size:.84rem;font-weight:500;color:#cbd5e1;padding:7px 8px}@media(max-width:980px){.clientSide{position:static}}`}</style>
  </aside>
}
