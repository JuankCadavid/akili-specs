// @akili-spec changes/branching-flow-dev-next
// Publishes an ephemeral prerelease (X.Y.Z-next.N) under the `next` dist-tag
// from an up-to-date `dev` checkout. The version is written to package.json
// only for the duration of the publish and restored byte-for-byte afterwards;
// nothing is committed, tagged, or pushed, and `latest` is never touched.
//
// Usage: npm run release:next -- <patch|minor|major> [--dry-run] [--otp=<code>]

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const REGISTRY = "https://registry.npmjs.org/";
const PACKAGE_NAME = "akili-specs";
const BUMPS = ["patch", "minor", "major"];
const SIGNALS = ["SIGINT", "SIGTERM", "SIGHUP"];
const USAGE = "Usage: npm run release:next -- <patch|minor|major> [--dry-run] [--otp=<6-8 digits>]";
const STABLE = /^\d+\.\d+\.\d+$/;
const PUBLISH_BASE = ["publish", "--tag", "next", "--access", "public", `--registry=${REGISTRY}`];

// Mirrors scripts/release.js: a temp file is renamed over the target, so an
// interrupted write never leaves package.json half-written.
function atomicWriteFileSync(targetPath, data) {
  const tmpPath = targetPath + "." + crypto.randomBytes(6).toString("hex") + ".tmp";
  try {
    fs.writeFileSync(tmpPath, data, { flag: "wx" });
    fs.renameSync(tmpPath, targetPath);
  } finally {
    try { fs.rmSync(tmpPath, { force: true }); } catch (e) {}
  }
}

// Same rule as bin/akili.js execCliSync: no shell anywhere except npm on
// Windows, where it is a .cmd shim that needs shell: true (git is git.exe).
// Safe only because every argument is a literal or the digit-validated --otp (DD-13).
function defaultExec(cmd, args, opts = {}) {
  const win = process.platform === "win32" && cmd === "npm";
  const { inherit, ...rest } = opts;
  return execFileSync(win ? cmd + ".cmd" : cmd, args, {
    ...rest,
    encoding: "utf8",
    stdio: inherit ? "inherit" : ["ignore", "pipe", "pipe"],
    shell: win,
  });
}

function parseArgs(argv) {
  let bump = null;
  let dryRun = false;
  let otp = null;
  for (const arg of argv) {
    if (arg === "--dry-run") {
      dryRun = true;
    } else if (arg.startsWith("--otp=")) {
      const code = arg.slice("--otp=".length);
      if (!/^\d{6,8}$/.test(code)) return { error: `--otp must be 6 to 8 digits.\n${USAGE}` };
      otp = code;
    } else if (arg.startsWith("-")) {
      return { error: `Unknown flag: ${arg}\n${USAGE}` };
    } else if (bump === null && BUMPS.includes(arg)) {
      bump = arg;
    } else {
      return { error: `Unexpected argument: ${arg}\n${USAGE}` };
    }
  }
  if (bump === null) return { error: `Missing bump argument.\n${USAGE}` };
  return { bump, dryRun, otp };
}

function isStable(version) {
  return typeof version === "string" && STABLE.test(version);
}

function compareStable(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
}

function bumpStable(version, bump) {
  if (!isStable(version) || !BUMPS.includes(bump)) return null;
  const [major, minor, patch] = version.split(".").map(Number);
  if (bump === "major") return `${major + 1}.0.0`;
  if (bump === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

function maxStable(versions) {
  let max = null;
  for (const v of versions) {
    if (isStable(v) && (max === null || compareStable(v, max) > 0)) max = v;
  }
  return max;
}

function nextPrereleaseVersion(base, versions) {
  const prefix = `${base}-next.`;
  let max = 0;
  for (const v of versions) {
    if (typeof v !== "string" || !v.startsWith(prefix)) continue;
    const rest = v.slice(prefix.length);
    if (/^\d+$/.test(rest) && Number(rest) > max) max = Number(rest);
  }
  return `${prefix}${max + 1}`;
}

function evaluateGuards(facts) {
  const unreadable = (what) => `unreadable: ${what}`;
  const guard = (name, readable, ok, okReason, failReason) => {
    if (readable !== true) return { name, ok: false, reason: readable };
    return ok ? { name, ok: true, reason: okReason } : { name, ok: false, reason: failReason };
  };
  const { branch, porcelain, fetchError, head, originDev, pkgVersion, versions, base } = facts;
  const guards = [];

  guards.push(guard("Branch", branch === null ? unreadable("current branch") : true,
    branch === "dev", "on dev", `on "${branch}", not dev`));

  guards.push(guard("Clean", porcelain === null ? unreadable("git status") : true,
    porcelain === "", "working tree clean", "working tree has changes"));

  let syncReadable = true;
  if (fetchError) syncReadable = unreadable(`git fetch origin dev failed (${fetchError})`);
  else if (head === null || originDev === null) syncReadable = unreadable("HEAD or origin/dev");
  guards.push(guard("In sync", syncReadable,
    head === originDev, "HEAD equals origin/dev", "HEAD differs from origin/dev"));

  guards.push(guard("Stable source", pkgVersion === null ? unreadable("package.json version") : true,
    isStable(pkgVersion), `package.json is ${pkgVersion}`, `package.json version ${pkgVersion} is not a stable X.Y.Z`));

  guards.push(guard("Source published",
    versions === null ? unreadable("npm versions") : pkgVersion === null ? unreadable("package.json version") : true,
    versions !== null && versions.includes(pkgVersion),
    `${pkgVersion} is published`,
    `${pkgVersion} is not published on npm (finish the stable release first)`));

  let baseReadable = true;
  if (base === null) baseReadable = "n/a — no stable source";
  else if (versions === null) baseReadable = unreadable("npm versions");
  const maxPublished = versions === null ? null : maxStable(versions);
  guards.push(guard("Base ahead", baseReadable,
    maxPublished === null || (base !== null && compareStable(base, maxPublished) > 0),
    `${base} is ahead of ${maxPublished || "nothing published"}`,
    `${base} is not ahead of published ${maxPublished}`));

  return guards;
}

function firstLine(e) {
  const text = (e && (e.stderr || e.message)) || String(e);
  const line = String(text).split(/\r?\n/).find((l) => l.trim() !== "");
  return line ? line.trim() : "unknown error";
}

function attempt(fn) {
  try { return fn(); } catch (e) { return null; }
}

function runReleaseNext({ argv, root, exec, log, error, signals = process, writeFile = atomicWriteFileSync }) {
  const parsed = parseArgs(argv);
  if (parsed.error) {
    error(parsed.error);
    return 1;
  }
  const { bump, dryRun, otp } = parsed;
  const pkgPath = path.join(root, "package.json");
  const run = (cmd, args) => exec(cmd, args, { cwd: root, encoding: "utf8" });

  let originalBytes;
  let pkg;
  try {
    originalBytes = fs.readFileSync(pkgPath);
    pkg = JSON.parse(originalBytes.toString("utf8"));
  } catch (e) {
    error(`ERROR: cannot read package.json: ${firstLine(e)}`);
    return 1;
  }

  const facts = {
    branch: attempt(() => String(run("git", ["rev-parse", "--abbrev-ref", "HEAD"])).trim()),
    porcelain: attempt(() => String(run("git", ["status", "--porcelain"])).trim()),
    fetchError: null,
    head: null,
    originDev: null,
    pkgVersion: typeof pkg.version === "string" ? pkg.version : null,
    versions: null,
    base: null,
  };
  try { run("git", ["fetch", "origin", "dev"]); } catch (e) { facts.fetchError = firstLine(e); }
  facts.head = attempt(() => String(run("git", ["rev-parse", "HEAD"])).trim());
  facts.originDev = attempt(() => String(run("git", ["rev-parse", "origin/dev"])).trim());
  facts.versions = attempt(() => {
    const parsedVersions = JSON.parse(run("npm", ["view", PACKAGE_NAME, "versions", "--json", `--registry=${REGISTRY}`]));
    return Array.isArray(parsedVersions) ? parsedVersions : typeof parsedVersions === "string" ? [parsedVersions] : null;
  });
  facts.base = bumpStable(facts.pkgVersion, bump);

  const version = facts.base && facts.versions ? nextPrereleaseVersion(facts.base, facts.versions) : null;
  const guards = evaluateGuards(facts);
  const failed = guards.filter((g) => !g.ok);

  log(`Version: ${version || "n/a"}`);
  log("Dist-tag: next");
  log(`Publish: npm ${PUBLISH_BASE.join(" ")}`);
  for (const g of guards) log(`GUARD ${g.name}: ${g.ok ? "OK" : "FAIL"} — ${g.reason}`);
  log("If interrupted: git checkout -- package.json");

  if (failed.length > 0) {
    error(`ERROR: refusing to publish; failed guards: ${failed.map((g) => g.name).join(", ")}`);
    return 1;
  }
  if (dryRun) {
    log("Dry run: nothing written, nothing published.");
    return 0;
  }

  const publishArgs = otp ? [...PUBLISH_BASE, `--otp=${otp}`] : PUBLISH_BASE;
  const noop = () => {};
  for (const sig of SIGNALS) signals.on(sig, noop);

  let code = 0;
  try {
    try {
      writeFile(pkgPath, JSON.stringify({ ...pkg, version }, null, 2) + "\n");
      exec("npm", publishArgs, { cwd: root, inherit: true });
      log(`Published ${PACKAGE_NAME}@${version} under the next dist-tag.`);
      log("Verify: npx akili-specs@next list");
      log("Verify: npm view akili-specs dist-tags");
    } catch (e) {
      error(`ERROR: publish failed: ${firstLine(e)}`);
      code = 1;
    } finally {
      try {
        writeFile(pkgPath, originalBytes);
      } catch (e) {
        error(`ERROR: could not restore package.json (${firstLine(e)}). Run: git checkout -- package.json`);
        code = 1;
      }
    }
  } finally {
    for (const sig of SIGNALS) signals.removeListener(sig, noop);
  }
  return code;
}

module.exports = {
  parseArgs,
  bumpStable,
  nextPrereleaseVersion,
  maxStable,
  evaluateGuards,
  runReleaseNext,
  atomicWriteFileSync,
};

if (require.main === module) {
  process.exitCode = runReleaseNext({
    argv: process.argv.slice(2),
    root: path.resolve(__dirname, ".."),
    exec: defaultExec,
    log: console.log,
    error: console.error,
    signals: process,
  });
}
