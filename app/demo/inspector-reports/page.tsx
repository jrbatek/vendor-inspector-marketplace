import { redirect } from "next/navigation";

// Old Inspector Demo Reports URLs should join the full Work History section
// under the persistent green InspectorHub sidebar, not open a second page.
export default function InspectorReportsLegacyRoute() {
  redirect("/demo/inspector#work");
}
