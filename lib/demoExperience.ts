const DEMO_EXACT_PATHS = new Set([
  "/demo-showcase",
  "/inspectorhub",
]);

export function isDemoExperiencePath(pathname: string, demoParam?: string | null) {
  return pathname === "/demo" || pathname.startsWith("/demo/") || DEMO_EXACT_PATHS.has(pathname) || (pathname === "/email-requirements" && demoParam === "1");
}
