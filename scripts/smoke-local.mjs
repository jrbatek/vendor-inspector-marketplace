import { spawn } from "node:child_process";

const port = 3100;
const base = `http://127.0.0.1:${port}`;
const routes = ["/", "/project-coordinator", "/inspectors", "/client-dashboard"];

const child = spawn("npm", ["run", "start", "--", "-p", String(port)], {
  env: {
    ...process.env,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ci-placeholder.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "ci-placeholder-anon-key",
  },
  stdio: ["ignore", "pipe", "pipe"],
});

let output = "";
child.stdout.on("data", (chunk) => { output += chunk.toString(); });
child.stderr.on("data", (chunk) => { output += chunk.toString(); });

async function waitForServer() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(base);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`Local server did not become ready.\n${output}`);
}

try {
  await waitForServer();
  for (const route of routes) {
    const response = await fetch(base + route, { redirect: "manual" });
    if (response.status >= 400) {
      throw new Error(`${route} returned HTTP ${response.status}`);
    }
    const body = await response.text();
    if (!body || !body.toLowerCase().includes("inspectsource")) {
      throw new Error(`${route} did not render expected InspectSource content`);
    }
    console.log(`Smoke OK: ${route} (${response.status})`);
  }
  console.log("Local route smoke tests passed.");
} finally {
  child.kill("SIGTERM");
}
