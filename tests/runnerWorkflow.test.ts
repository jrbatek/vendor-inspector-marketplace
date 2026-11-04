import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import net from "node:net";
import { spawnSync } from "node:child_process";

const workflow = fs.readFileSync(".github/workflows/inspectsource-development.yml", "utf8");
const preparation = workflow.split("      - name: Disable unused system D-Bus before Codex\n")[1]
  .split("\n      - uses:")[0].split("        run: |\n")[1]
  .split("\n").map(line => line.slice(10)).join("\n");

async function runPreparation(options: { runner?: string; state?: string; maskStatus?: string }) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "inspectsource-runner-"));
  const socketPath = path.join(directory, "system_bus_socket");
  const server = net.createServer();
  try {
    await new Promise<void>((resolve, reject) => { server.once("error", reject); server.listen(socketPath, resolve); });
    const writeExecutable = (name: string, body: string) => fs.writeFileSync(path.join(directory, name), `#!/bin/bash\n${body}\n`, { mode: 0o755 });
    writeExecutable("sudo", 'exec "$@"');
    writeExecutable("systemctl", 'echo "$*" >> "$CALL_LOG"\ncase "$1" in\n mask) exit "${MASK_STATUS:-0}" ;;\n show) echo "${UNIT_STATE:-inactive}" ;;\n *) exit 90 ;;\nesac');
    const result = spawnSync("bash", ["-c", preparation.replace(/\/run\/dbus\/system_bus_socket/g, socketPath)], {
      env: { ...process.env, PATH: `${directory}:${process.env.PATH}`, RUNNER_ENVIRONMENT: options.runner ?? "github-hosted",
        UNIT_STATE: options.state ?? "inactive", MASK_STATUS: options.maskStatus ?? "0", CALL_LOG: path.join(directory, "calls") },
      encoding: "utf8",
    });
    return { status: result.status, output: result.stdout + result.stderr, socketExists: fs.existsSync(socketPath),
      calls: fs.existsSync(path.join(directory, "calls")) ? fs.readFileSync(path.join(directory, "calls"), "utf8") : "" };
  } finally {
    await new Promise<void>(resolve => server.close(() => resolve()));
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

test("runner preparation stops and masks both units before removing the unused socket", async () => {
  const result = await runPreparation({});
  assert.equal(result.status, 0, result.output);
  assert.equal(result.socketExists, false);
  assert.match(result.calls, /^mask --runtime --now dbus.socket dbus.service\nshow dbus.socket .*\nshow dbus.service /);
});

test("runner preparation fails closed when D-Bus remains active", async () => {
  const result = await runPreparation({ state: "active" });
  assert.equal(result.status, 1);
  assert.match(result.output, /still active; refusing to start Codex/);
  assert.equal(result.socketExists, true);
});

test("runner preparation propagates a failed systemctl command without deleting the socket", async () => {
  const result = await runPreparation({ maskStatus: "42" });
  assert.equal(result.status, 42);
  assert.equal(result.socketExists, true);
});

test("runner preparation refuses self-hosted runners before touching services", async () => {
  const result = await runPreparation({ runner: "self-hosted" });
  assert.equal(result.status, 1);
  assert.equal(result.calls, "");
  assert.equal(result.socketExists, true);
});

test("workflow keeps recurrence disabled and Codex privilege restrictions enabled", () => {
  assert.doesNotMatch(workflow, /^  schedule:/m);
  assert.match(workflow, /safety-strategy: drop-sudo/);
  assert.match(workflow, /permission-profile: ':workspace'/);
  assert.ok(workflow.indexOf("Disable unused system D-Bus") < workflow.indexOf("uses: openai/codex-action@"));
});
