import { redirect } from "next/navigation";

// Legacy public demo bookmarks stay in the single continuous fictional
// Client Workspace. Historical/completed intelligence lives in Analytics;
// old active-view bookmarks land on Inspections in Progress.
export default function LegacyClientHistoryDemo({ searchParams }: {
  searchParams?: { view?: string };
}) {
  redirect(searchParams?.view === "active"
    ? "/demo/client#inspections-in-progress"
    : "/demo/client#analytics");
}
