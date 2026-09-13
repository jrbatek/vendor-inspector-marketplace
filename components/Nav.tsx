"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { isDemoExperiencePath } from "@/lib/demoExperience";
import { supabaseBrowser } from "@/lib/supabase";

const groups = [
  { label: "Clients", links: [
    ["Client Login", "/login?role=client"],
    ["Client Demo", "/demo/client"],
    ["Project Coordinator", "/project-coordinator"],
    ["Client Dashboard", "/client-dashboard"],
    ["Find Inspectors", "/demo/client"],
    ["Client Inspection History Demo", "/demo/client-history"],
    ["Client Analytics Demo", "/demo/client-analytics"],
    ["Client Operations Demo", "/demo/client-operations"],
    ["Data & Integrations Demo", "/demo/client-data"],
    ["Inspection Intelligence", "/inspection-intelligence"],
    ["Equipment Intelligence", "/equipment-intelligence"],
    ["Asset Intelligence", "/asset-intelligence"],
  ]},
  { label: "Inspectors", links: [
    ["Inspector Login", "/login?role=inspector"],
    ["Inspector Demo", "/demo/inspector"],
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
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const supabase = useMemo(() => supabaseBrowser(), []);
  const router = useRouter();
  const pathname = usePathname();
  const isDemoView = isDemoExperiencePath(pathname);

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

  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (active) setUserEmail(data.user?.email ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUserEmail(session?.user.email ?? null);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      setUserEmail(null);
      setOpenMenu(null);
      router.push("/");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return <header className="nav groupedNav" ref={navRef}>
    <Link href="/" className="brand" onClick={() => setOpenMenu(null)}>InspectSource</Link>
    <nav className="primaryNav" aria-label="Main navigation">
      {groups.map(group => {
        const menuId = `nav-${group.label.toLowerCase()}-menu`;
        return <div className="navGroup" key={group.label}>
          <button
            type="button"
            className={openMenu === group.label ? "groupButton open" : "groupButton"}
            aria-expanded={openMenu === group.label}
            aria-controls={menuId}
            aria-haspopup="true"
            onClick={() => setOpenMenu(current => current === group.label ? null : group.label)}
          >
            {group.label}<span aria-hidden="true">▾</span>
          </button>
          {openMenu === group.label && <div className="navMenu" id={menuId}>
            {group.links.map(([label, href], index) => <Link className={index === 0 ? "loginLink" : ""} href={href} key={`${label}-${href}`} onClick={() => setOpenMenu(null)}>{label}</Link>)}
          </div>}
        </div>;
      })}
      <Link className="topLink demoLink" href="/demo/client" onClick={() => setOpenMenu(null)}>Client Demo</Link>
      <Link className="topLink demoLink" href="/demo/inspector" onClick={() => setOpenMenu(null)}>Inspector Demo</Link>
    </nav>
    {userEmail && <div className={isDemoView ? "liveSession demoSession" : "liveSession"} aria-live="polite" aria-label={isDemoView ? "Authenticated session viewing synthetic demo data" : "Authenticated live-data session"}>
      <span>Logged in as <strong>{userEmail}</strong></span>
      <b>{isDemoView ? "Demo view" : "Live data"}</b>
      <button type="button" className="logoutButton" onClick={handleLogout} disabled={loggingOut}>{loggingOut ? "Logging out…" : "Log out"}</button>
    </div>}
    <style jsx>{`.groupedNav{display:flex;align-items:center;gap:28px;padding:14px 18px;position:relative;z-index:50}.primaryNav{display:flex;align-items:center;gap:8px;flex:1}.navGroup{position:relative}.groupButton{border:0;background:transparent;cursor:pointer;padding:9px 11px;border-radius:8px;font:inherit;font-weight:700;white-space:nowrap;color:#0f172a}.groupButton span{font-size:.7rem;margin-left:6px;color:#64748b}.groupButton.open,.groupButton:hover,.groupButton:focus-visible{background:#eff6ff;color:#1d4ed8}.navMenu{position:absolute;top:calc(100% + 6px);left:0;min-width:265px;padding:7px;background:white;border:1px solid #dbeafe;border-radius:12px;box-shadow:0 14px 35px rgba(15,23,42,.13);display:grid;gap:2px;z-index:100}.navMenu :global(a){padding:10px 11px;border-radius:8px;text-decoration:none;color:#0f172a;white-space:nowrap}.navMenu :global(a:hover),.navMenu :global(a:focus-visible){background:#eff6ff;color:#1d4ed8}.navMenu :global(a.loginLink){font-weight:800;color:#1d4ed8;border-bottom:1px solid #e2e8f0;border-radius:8px 8px 4px 4px;margin-bottom:4px}.topLink{padding:9px 11px;border-radius:8px;font-weight:700;text-decoration:none;white-space:nowrap}.demoLink{background:#f8fafc;border:1px solid #dbeafe}.topLink:hover,.topLink:focus-visible{background:#eff6ff;color:#1d4ed8}.liveSession{display:flex;align-items:center;gap:8px;min-width:0;padding:7px 9px;border:1px solid #bbf7d0;border-radius:10px;background:#f0fdf4;color:#334155;font-size:.72rem;white-space:nowrap}.liveSession.demoSession{border-color:#bfdbfe;background:#eff6ff}.liveSession span{overflow:hidden;text-overflow:ellipsis}.liveSession strong{color:#0f172a}.liveSession b{padding:3px 6px;border-radius:999px;background:#dcfce7;color:#166534;font-size:.65rem;text-transform:uppercase;letter-spacing:.06em}.liveSession.demoSession b{background:#dbeafe;color:#1d4ed8}.logoutButton{border:1px solid #86efac;background:#fff;color:#166534;border-radius:8px;padding:5px 8px;font:inherit;font-weight:800;cursor:pointer;white-space:nowrap}.liveSession.demoSession .logoutButton{border-color:#93c5fd;color:#1d4ed8}.logoutButton:hover,.logoutButton:focus-visible{background:#dcfce7}.liveSession.demoSession .logoutButton:hover,.liveSession.demoSession .logoutButton:focus-visible{background:#dbeafe}.logoutButton:disabled{opacity:.6;cursor:wait}@media(max-width:1180px){.liveSession{order:3;width:100%;justify-content:space-between}.liveSession span{white-space:normal}}@media(max-width:980px){.groupedNav{align-items:flex-start;gap:12px;flex-wrap:wrap}.primaryNav{width:100%;flex-basis:100%;overflow-x:auto;padding-bottom:4px;scrollbar-width:thin}.navMenu{position:fixed;left:18px;right:18px;top:auto;min-width:0}}`}</style>
  </header>;
}