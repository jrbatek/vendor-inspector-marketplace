const DEMO_EXACT_PATHS = new Set([
  "/demo-showcase",
  "/inspectorhub",
]);

export function isDemoExperiencePath(pathname: string, demoParam?: string | null) {
  return pathname === "/demo" || pathname.startsWith("/demo/") || DEMO_EXACT_PATHS.has(pathname) || (pathname === "/email-requirements" && demoParam === "1");
}

/** Keep audience navigation inside the synthetic experience when already in demo mode. */
export function demoNavigationHref(href: string): string {
  if (href.startsWith("/demo/")) return href;
  const routes: Record<string, string> = {
    "/client-dashboard": "/demo/client", "/project-coordinator": "/demo/client",
    "/inspection-intelligence": "/demo/client-analytics", "/equipment-intelligence": "/demo/client-analytics",
    "/asset-intelligence": "/demo/client-analytics", "/inspectorhub": "/demo/inspector",
    "/inspectorhub/schedule": "/demo/inspector", "/dashboard": "/demo/inspector",
    "/inspector-inquiries": "/demo/inspector", "/inspection-reports": "/demo/inspector-work-history",
    "/inspectors": "/demo/inspector", "/email-requirements?demo=1": "/demo/email-requirements",
  };
  return routes[href] || "/demo/client";
}
