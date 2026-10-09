import fs from "node:fs";
import path from "node:path";

describe("Inspector qualification document center", () => {
  const source = fs.readFileSync(path.join(process.cwd(), "app/demo/inspector-documents/page.tsx"), "utf8");

  it("uses only explicit synthetic qualification evidence", () => {
    expect(source).toContain("INSPECTSOURCE SYNTHETIC DEMO");
    expect(source).toContain("not a real credential");
    expect(source).toContain("no production certificates or personal data are used");
    expect(source).not.toMatch(/supabaseBrowser|\.from\(|storage\.from|fetch\(/);
  });

  it("provides working certificate preview controls", () => {
    expect(source).toContain("View certificate");
    expect(source).toContain('role=\"dialog\"');
    expect(source).toContain('aria-modal=\"true\"');
    expect(source).toContain("Close certificate preview");
    expect(source).toContain('{selected.format} preview');
    expect(source).toContain('format: \"PDF\"');
    expect(source).toContain('format: \"Image\"');
  });

  it("keeps document sharing permission-gated and non-production", () => {
    expect(source).toContain("Share securely");
    expect(source).toContain("authorized client");
    expect(source).toContain("authorized agency");
    expect(source).toContain("verify inspector ownership, recipient authorization");
    expect(source).toContain("No public link is created");
    expect(source).toContain("does not perform a production share");
  });

  it("protects visible interactive states", () => {
    expect(source).toMatch(/button:hover\{background:/);
    expect(source).toMatch(/button:focus-visible\{outline:/);
    expect(source).toMatch(/\.secondary,.close\{background:#fff;color:/);
    expect(source).toMatch(/\.secondary:hover,.close:hover\{background:/);
  });
});
