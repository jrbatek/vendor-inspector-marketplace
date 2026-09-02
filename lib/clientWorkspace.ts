export const CLIENT_WORKSPACE_SECTIONS = [
  "request",
  "active",
  "history",
  "analytics",
  "billing",
  "contracts",
  "profile",
] as const;

export type ClientWorkspaceSection = (typeof CLIENT_WORKSPACE_SECTIONS)[number];

export function parseClientWorkspaceSection(value: string | null | undefined): ClientWorkspaceSection {
  return CLIENT_WORKSPACE_SECTIONS.includes(value as ClientWorkspaceSection)
    ? (value as ClientWorkspaceSection)
    : "request";
}

export function clientWorkspaceHref(section: ClientWorkspaceSection): string {
  return section === "request" ? "/client-dashboard" : `/client-dashboard?section=${section}`;
}
