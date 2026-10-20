// @akili-spec changes/branching-flow-dev-next
// Shared harness for the CLI integration tests of release-next.js and
// release-status.js. Everything happens inside os.tmpdir() with fake `npm`/`gh`
// shims first on PATH; nothing here can reach the real registry, GitHub, or the
// repository's own package.json/git state. (Not a test file: no tests inside.)

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn, spawnSync } = require("child_process");

const REPO = path.resolve(__dirname, "..");
const PKG_URL = "git+https://github.com/JuankCadavid/akili-specs.git";

const FAKE_NPM = `#!${process.execPath}
const fs = require("fs");
const args = process.argv.slice(2);
const log = process.env.FAKE_LOG_DIR + "/npm.log";
const rec = (o) => fs.appendFileSync(log, JSON.stringify(o) + "\\n");
const cmd = args[0];
if (cmd === "view") {
  if (process.env.FAKE_NPM_VIEW_FAIL) { console.error("npm ERR! view failed"); process.exit(1); }
  const versions = JSON.parse(process.env.FAKE_NPM_VERSIONS || "[]");
  if (args.includes("version")) {
    process.stdout.write(JSON.stringify({ versions, version: versions.filter((v) => !v.includes("-")).pop(), "dist-tags": JSON.parse(process.env.FAKE_NPM_DISTTAGS || "{}") }));
  } else {
    process.stdout.write(JSON.stringify(versions));
  }
} else if (cmd === "whoami") {
  console.log("fake-maintainer");
} else if (cmd === "publish") {
  let version = null;
  try { version = JSON.parse(fs.readFileSync("package.json", "utf8")).version; } catch (e) {}
  rec({ event: "started", argv: args, version, cwd: process.cwd() });
  const finish = () => { rec({ event: "finished" }); process.exit(Number(process.env.FAKE_NPM_PUBLISH_EXIT || 0)); };
  const ms = Number(process.env.FAKE_NPM_SLEEP_MS || 0);
  if (ms > 0) setTimeout(finish, ms); else finish();
} else {
  rec({ event: "unexpected", argv: args });
  process.exit(2);
}
`;

const FAKE_GH = `#!${process.execPath}
const fs = require("fs");
const args = process.argv.slice(2);
fs.appendFileSync(process.env.FAKE_LOG_DIR + "/gh.log", JSON.stringify(args) + "\\n");
const tag = args[2];
if (args[0] === "release" && args[1] === "view" && (process.env.FAKE_GH_OK || "").split(",").includes(tag)) {
  process.stdout.write(JSON.stringify({ tagName: tag, url: "https://example/" + tag }));
} else {
  console.error("release not found");
  process.exit(1);
}
`;

const gitEnv = {
  GIT_CONFIG_GLOBAL: "/dev/null",
  GIT_CONFIG_SYSTEM: "/dev/null",
  GIT_CONFIG_NOSYSTEM: "1",
  GIT_AUTHOR_NAME: "Tester",
  GIT_AUTHOR_EMAIL: "t@example.invalid",
  GIT_COMMITTER_NAME: "Tester",
  GIT_COMMITTER_EMAIL: "t@example.invalid",
  GIT_TERMINAL_PROMPT: "0",
};

function git(cwd, ...args) {
  const r = spawnSync("git", ["-c", "commit.gpgsign=false", "-c", "tag.gpgsign=false", ...args], {
    cwd, encoding: "utf8", env: { ...process.env, ...gitEnv },
  });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")} failed: ${r.stderr}`);
  return r.stdout.trim();
}

// Deliberately distinctive bytes (key order, 4-space nested indent, CRLF-free,
// trailing spaces in a string) so a JSON.stringify round-trip would NOT be identical.
function packageJsonBytes(version) {
  return (
    '{\n  "version": "' + version + '",\n  "name": "akili-specs",\n' +
    '  "description": "x  y   z",\n' +
    '  "repository": {\n      "type": "git",\n      "url": "' + PKG_URL + '"\n  },\n' +
    '  "files": ["a", "b"],\n  "z": 1\n}\n'
  );
}

// opts: scripts: ["release-next.js", ...] to copy (default both); pkgVersion; mutate(scriptName, src) => src
function makeProject(opts = {}) {
  const tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "akili-relcli-")));
  const work = path.join(tmp, "work");
  const origin = path.join(tmp, "origin.git");
  const bin = path.join(tmp, "bin");
  const logs = path.join(tmp, "logs");
  for (const d of [work, bin, logs, path.join(work, "scripts")]) fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(path.join(bin, "npm"), FAKE_NPM, { mode: 0o755 });
  fs.writeFileSync(path.join(bin, "gh"), FAKE_GH, { mode: 0o755 });
  for (const name of opts.scripts || ["release-next.js", "release-status.js"]) {
    let src = fs.readFileSync(path.join(REPO, "scripts", name), "utf8");
    if (opts.mutate) src = opts.mutate(name, src);
    fs.writeFileSync(path.join(work, "scripts", name), src);
  }
  const pkgBytes = packageJsonBytes(opts.pkgVersion || "2.34.1");
  fs.writeFileSync(path.join(work, "package.json"), pkgBytes);
  git(tmp, "init", "-q", "--bare", "-b", "master", origin);
  git(work, "init", "-q", "-b", "master");
  git(work, "remote", "add", "origin", origin);
  git(work, "add", "-A");
  git(work, "commit", "-q", "-m", "init");
  git(work, "switch", "-q", "-c", "dev");
  git(work, "push", "-q", "origin", "dev");
  git(work, "fetch", "-q", "origin");
  const p = {
    tmp, work, origin, bin, logs, pkgBytes,
    pkgPath: path.join(work, "package.json"),
    git: (...a) => git(work, ...a),
    originRefs: () => git(origin, "for-each-ref"),
    pkgNow: () => fs.readFileSync(path.join(work, "package.json")),
    npmLog: () => readLog(path.join(logs, "npm.log")),
    ghLog: () => readLog(path.join(logs, "gh.log")),
    env: (extra = {}) => ({
      ...process.env, ...gitEnv,
      PATH: bin + path.delimiter + process.env.PATH,
      FAKE_LOG_DIR: logs,
      FAKE_NPM_VERSIONS: JSON.stringify(["2.34.0", "2.34.1"]),
      ...extra,
    }),
    run(script, args = [], extra = {}) {
      return spawnSync(process.execPath, [path.join(work, "scripts", script), ...args], {
        cwd: work, encoding: "utf8", env: p.env(extra), timeout: 60000,
      });
    },
    // Detached child = its own process group, so signals go to the group (npm shim included).
    spawnDetached(script, args = [], extra = {}) {
      const child = spawn(process.execPath, [path.join(work, "scripts", script), ...args], {
        cwd: work, env: p.env(extra), detached: true, stdio: ["ignore", "pipe", "pipe"],
      });
      let out = "";
      child.stdout.on("data", (d) => (out += d));
      child.stderr.on("data", (d) => (out += d));
      const exit = new Promise((resolve) => child.on("close", (code, signal) => resolve({ code, signal, out })));
      return { child, exit };
    },
    cleanup() {
      try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
    },
  };
  return p;
}

function readLog(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
}

async function waitFor(fn, ms = 20000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (fn()) return true;
    await new Promise((r) => setTimeout(r, 25));
  }
  return false;
}

function skipReason() {
  return process.platform === "win32" ? "win32: POSIX signals/process groups and sh-free shims are not exercised on Windows" : null;
}

module.exports = { makeProject, waitFor, skipReason, REPO };
