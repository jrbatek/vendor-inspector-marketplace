import { redirect } from "next/navigation";

// Preserve previously published links without maintaining a second reports workspace.
export default function InspectorReportsLegacyRoute() {
  redirect("/demo/inspector-work-history");
}
