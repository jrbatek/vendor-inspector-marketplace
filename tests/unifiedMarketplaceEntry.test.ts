import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const nav = readFileSync("components/Nav.tsx", "utf8");
const home = readFileSync("app/page.tsx", "utf8");

describe("unified marketplace entry", () => {
  it("uses one global login rather than role-specific auth entry points", () => {
    expect(nav).toContain('href="/login"');
    expect(nav).not.toContain("/login?role=client");
    expect(nav).not.toContain("/login?role=agency");
    expect(nav).not.toContain("/login?role=inspector");
    expect(nav).toContain("Logged in as");
    expect(nav).toContain("Live data");
    expect(nav).toContain("Demo view");
  });

  it("presents clients, agencies and inspectors as equal homepage audiences", () => {
    expect(home).toContain('label:"For Clients"');
    expect(home).toContain('label:"For Agencies"');
    expect(home).toContain('label:"For Inspectors"');
    expect(home).toContain('grid-template-columns:repeat(3');
    expect(home).toContain("One InspectSource sign-in.");
    expect(home).toContain("/demo/client");
    expect(home).toContain("/demo/agency");
    expect(home).toContain("/demo/inspector");
  });

  it("does not move role authorization into homepage or navigation UX", () => {
    expect(home).not.toMatch(/supabase|auth\.signIn|role_id|user_roles/);
    expect(nav).not.toMatch(/role_id|user_roles|setRole|assignRole/);
  });
});
