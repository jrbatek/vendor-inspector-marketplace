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
  const analyticsHref=demo?"/demo/client-analytics":"/client-dashboard?section=analytics";
  const billingHref=demo?"/demo/client-operations?tab=billing":"/client-dashboard?section=billing";
  const contractsHref=demo?"/demo/client-operations?tab=contracts":"/client-dashboard?section=contracts";
  const profileHref=demo?"/demo/client-operations?tab=profile":"/client-dashboard?section=profile";
  const requestActive=activePath("/demo/client")||(!demo&&activePath("/client-dashboard")&&!params.get("section"));
  const analyticsActive=activePath("/demo/client-analytics")||(activePath("/demo/client-history")&&params.get("view")!=="active")||(!demo&&["analytics","history"].includes(params.get("section")||""));
  const progressActive=(activePath("/demo/client-history")&&params.get("view")==="active")||(!demo&&params.get("section")==="active");
  const tab=params.get("tab")||"billing";
  const billingActive=(activePath("/demo/client-operations")&&tab==="billing")||(!demo&&params.get("section")==="billing");
  const contractsActive=(activePath("/demo/client-operations")&&tab==="contracts")||(!demo&&params.get("section")==="contracts");
  const profileActive=(activePath("/demo/client-operations")&&tab==="profile")||(!demo&&params.get("section")==="profile");

  return <aside className="clientSide" aria-label="Client Workspace navigation">
    <div className="title"><span>Client Workspace</span><strong>InspectSource</strong></div>
    <Link aria-current={requestActive?"page":undefined} className={requestActive?"primary active":"primary"} href={requestHref}>Request Inspectors</Link>
    <nav className="subnav" aria-label="Request inspector methods"><Link href={naturalHref}>Natural language</Link><Link href={emailHref}>Email requirements</Link><Link href={structuredHref}>Structured selection</Link></nav>
    <Link aria-current={progressActive?"page":undefined} className={progressActive?"active":""} href={activeHref}>Inspections in Progress</Link><Link aria-current={analyticsActive?"page":undefined} className={analyticsActive?"active":""} href={analyticsHref}>Analytics</Link><Link aria-current={billingActive?"page":undefined} className={billingActive?"active":""} href={billingHref}>Billing & Payment</Link><Link aria-current={contractsActive?"page":undefined} className={contractsActive?"active":""} href={contractsHref}>Contracts</Link><Link aria-current={profileActive?"page":undefined} className={profileActive?"active":""} href={profileHref}>Profile</Link>
    <style jsx>{`.clientSide{position:sticky;top:18px;height:max-content;background:#eff6ff;border:1px solid #bfdbfe;border-radius:16px;padding:16px;color:#172554;display:grid;gap:3px}.title{padding:8px 8px 16px;border-bottom:1px solid #bfdbfe;margin-bottom:10px}.title span{display:block;font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:#1d4ed8}.title strong{font-size:1.15rem}.clientSide :global(a){color:#1e3a8a;text-decoration:none;padding:10px 9px;border-radius:8px;font-weight:800;outline-offset:2px}.clientSide :global(a:hover),.clientSide :global(a:focus-visible){background:#dbeafe;color:#1e40af}.clientSide :global(a.active){background:#2563eb;color:#fff}.clientSide :global(a.primary){text-align:center;background:transparent;color:#1d4ed8}.clientSide :global(a.primary.active){background:#2563eb;color:#fff}.subnav{display:grid;gap:2px;margin:0 0 10px 12px;padding-left:10px;border-left:1px solid #93c5fd}.subnav :global(a){font-size:.84rem;font-weight:600;color:#1e40af;padding:7px 8px}@media(max-width:980px){.clientSide{position:static}}`}</style>
  </aside>
}
