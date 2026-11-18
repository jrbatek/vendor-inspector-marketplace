// Only synthetic-only routes belong here. /inspectorhub is an authenticated
// live workspace for signed-in inspectors, even though its anonymous preview
// uses non-persistent sample activities. Never badge live account data as demo.
const DEMO_EXACT_PATHS = new Set([
  "/demo-showcase",
]);

export function isDemoExperiencePath(pathname: string, demoParam?: string | null) {
  return pathname === "/demo" || pathname.startsWith("/demo/") || DEMO_EXACT_PATHS.has(pathname) || (pathname === "/email-requirements" && demoParam === "1");
}

const CONTINUOUS_DEMO_SECTIONS: Record<string, string> = {
  "/demo/client-inspections": "/demo/client#inspections-in-progress",
  "/demo/client-analytics": "/demo/client#analytics",
  "/demo/client-operations": "/demo/client#billing-payment",
  "/demo/inspector-work-history": "/demo/inspector#work",
  "/demo/inspector-income": "/demo/inspector#income",
  "/demo/inspector-documents": "/demo/inspector#qualifications",
  "/demo/inspector-reports": "/demo/inspector#work",
};

/** Preserve direct legacy-page bookmarks; global menus point into the continuous demo. */
/** Keep audience navigation inside the synthetic experience when already in demo mode. */
export function demoNavigationHref(href: string): string {
  if (CONTINUOUS_DEMO_SECTIONS[href]) return CONTINUOUS_DEMO_SECTIONS[href];
  if (href.startsWith("/demo/")) return href;
  const routes: Record<string, string> = {
    "/client-dashboard": "/demo/client", "/project-coordinator": "/demo/client", "/find-inspectors": "/demo/client",
    "/inspection-intelligence": "/demo/client#analytics", "/equipment-intelligence": "/demo/client#analytics",
    "/asset-intelligence": "/demo/client#analytics", "/inspectorhub": "/demo/inspector",
    "/inspectorhub/schedule": "/demo/inspector#calendar", "/dashboard": "/demo/inspector#home",
    "/inspector-inquiries": "/demo/inspector#opportunities", "/inspection-reports": "/demo/inspector#work",
    "/inspectors": "/demo/inspector", "/email-requirements?demo=1": "/demo/client#email-requirements",
  };
  return routes[href] || "/demo/client";
}
