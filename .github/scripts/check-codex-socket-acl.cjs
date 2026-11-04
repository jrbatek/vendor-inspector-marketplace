// Probe only a temporary socket. Never modify sockets belonging to runner services.
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const net = require("node:net");
const { spawnSync } = require("node:child_process");

function expectResult(result, expected, label) {
  if (result.error || result.signal || result.status !== expected || result.stderr?.trim()) {
    throw new Error(`${label}: expected exit ${expected}, got ${result.status}; ${result.error?.message || result.signal || result.stderr || ""}`);
  }
}

async function verifySocketAcl(uid, gid) {
  if (process.getuid?.() !== 0) throw new Error("Run this preflight through sudo.");
  if (![uid, gid].every(value => Number.isSafeInteger(value) && value > 0 && value < 4294967295)) {
    throw new Error("Expected non-root runner UID and GID.");
  }
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "codex-socket-acl-"));
  const socketPath = path.join(directory, "probe.sock");
  const server = net.createServer();
  let descriptor;
  try {
    fs.chmodSync(directory, 0o755);
    await new Promise((resolve, reject) => { server.once("error", reject); server.listen(socketPath, resolve); });
    fs.chmodSync(socketPath, 0o777);
    descriptor = fs.openSync(socketPath, 0o10000000 | fs.constants.O_NOFOLLOW); // Linux O_PATH, as used by codex-action
    const run = (command, args) => spawnSync(command, args, {
      stdio: ["ignore", "pipe", "pipe", descriptor], encoding: "utf8", timeout: 10000,
    });
    const asRunner = ["--reuid=" + uid, "--regid=" + gid, "--clear-groups", "--"];
    const writable = () => run("/usr/bin/setpriv", [...asRunner, "/usr/bin/test", "-w", "/proc/self/fd/3"]);
    expectResult(writable(), 0, "Initial world-writable socket check");
    expectResult(run("/usr/bin/setfacl", ["-n", "-m", `u:${uid}:---`, "--", "/proc/self/fd/3"]), 0, "Apply temporary socket ACL");
    // Confirm denial at the kernel connection layer too, independently of test(1).
    const connectProbe = 'const net=require("node:net");const s=net.connect(process.argv[1]);s.on("connect",()=>{s.destroy();process.exit(2)});s.on("error",e=>process.exit(e.code==="EACCES"?0:3));';
    expectResult(run("/usr/bin/setpriv", [...asRunner, process.execPath, "-e", connectProbe, socketPath]), 0, "Kernel socket access denial");
    expectResult(writable(), 1, "ACL-denied socket permission check");
    console.log("Socket ACL preflight passed: test(1) and the kernel both deny access after the ACL restriction.");
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
    if (server.listening) await new Promise(resolve => server.close(resolve));
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

module.exports = { expectResult, verifySocketAcl };
if (require.main === module) {
  verifySocketAcl(Number(process.argv[2]), Number(process.argv[3])).catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
