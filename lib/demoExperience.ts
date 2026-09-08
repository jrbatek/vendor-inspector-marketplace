const DEMO_EXACT_PATHS = new Set([
  "/demo-showcase",
  "/inspectorhub",
]);

export function isDemoExperiencePath(pathname: string) {
  return pathname === "/demo" || pathname.startsWith("/demo/") || DEMO_EXACT_PATHS.has(pathname);
}
