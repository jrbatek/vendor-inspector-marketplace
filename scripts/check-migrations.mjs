import fs from "node:fs";
import path from "node:path";

const roots = ["supabase/migrations", "supabase"];
const dangerous = [
  /\bdrop\s+database\b/i,
  /\bdrop\s+schema\b/i,
  /\btruncate\s+table\b/i,
  /\bdelete\s+from\s+auth\.users\b/i,
  /\bdrop\s+table\b(?![^;]*\bif\s+exists\b)/i,
];

function sqlFiles(root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) return sqlFiles(full);
    return entry.isFile() && entry.name.endsWith(".sql") ? [full] : [];
  });
}

const files = [...new Set(roots.flatMap(sqlFiles))];
const violations = [];

for (const file of files) {
  const sql = fs.readFileSync(file, "utf8");
  for (const rule of dangerous) {
    if (rule.test(sql)) violations.push(`${file}: matched blocked migration pattern ${rule}`);
  }
}

if (violations.length) {
  console.error("Unsafe migration patterns detected:\n" + violations.join("\n"));
  console.error("If a destructive migration is genuinely required, handle it as an explicitly reviewed exceptional change rather than bypassing this guard.");
  process.exit(1);
}

console.log(`Migration safety check passed (${files.length} SQL file${files.length === 1 ? "" : "s"} scanned).`);
