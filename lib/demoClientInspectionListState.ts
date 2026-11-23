import {
  ACTIVE_DEMO_INSPECTIONS,
  EMPTY_INSPECTION_FILTERS,
  type ActiveInspectionSort,
  type InspectionFilters,
} from "./clientActiveInspections";

/** Only fictional UI state is stored in browser history; never load live records. */
export type DemoInspectionListState = {
  filters: InspectionFilters;
  sort: ActiveInspectionSort;
  dueOnly: boolean;
  ncrOnly: boolean;
  actionOwner: string;
  keyword: string;
};

const sortValues: readonly ActiveInspectionSort[] = ["due", "start", "stage"];
const stages = new Set(ACTIVE_DEMO_INSPECTIONS.map(row => row.stage));
const projects = new Set(ACTIVE_DEMO_INSPECTIONS.map(row => row.project));
const inspectors = new Set(ACTIVE_DEMO_INSPECTIONS.map(row => row.inspector));
const owners = new Set(ACTIVE_DEMO_INSPECTIONS.flatMap(row => row.actions.map(action => action.owner)));

const asObject = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : {};
const allowed = (value: unknown, options: Set<string>): string =>
  typeof value === "string" && options.has(value) ? value : "";
const isoDate = (value: unknown): string => {
  if (typeof value !== "string" || !/^\\d{4}-\\d{2}-\\d{2}$/.test(value)) return "";
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() + 1 === month &&
    date.getUTCDate() === day ? value : "";
};

/** Normalize stale, missing or malformed entries before Back/Forward restoration.
 * Absent entries reset to the seven-inspection list rather than inheriting stale filters.
 * No storage/network calls; all allowed options come from public synthetic fixtures.
 */
export function parseDemoInspectionListState(raw: unknown): DemoInspectionListState {
  const source = asObject(raw);
  const filters = asObject(source.filters);
  return {
    filters: {
      ...EMPTY_INSPECTION_FILTERS,
      stage: allowed(filters.stage, stages),
      project: allowed(filters.project, projects),
      inspector: allowed(filters.inspector, inspectors),
      from: isoDate(filters.from),
      to: isoDate(filters.to),
    },
    sort: sortValues.includes(source.sort as ActiveInspectionSort)
      ? source.sort as ActiveInspectionSort : "due",
    dueOnly: source.dueOnly === true,
    ncrOnly: source.ncrOnly === true,
    actionOwner: allowed(source.actionOwner, owners),
    keyword: typeof source.keyword === "string" ? source.keyword.slice(0, 512) : "",
  };
}
