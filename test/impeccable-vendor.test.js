"use strict";

// @akili-spec changes/impeccable-hardening
//
// T2 -- vendor and install locks for the verbatim `impeccable` skill folder
// (FR-1, FR-2 "Local edit creeps in", FR-3, NFR-2, NFR-4, NFR-6, design 5.1,
// 5.2, 7.4). Everything is read from the shipped files, never from
// docs/specs/. Hashes are computed over RAW bytes: no CRLF -> LF
// normalization, because the .cmd launcher's CRLF is part of its upstream bytes.
//
// FR-3's foreign-entry behaviour is exercised on the grokbot target, the only
// target with an ownership record: a pre-seeded `impeccable/` that AKILI did
// not install is skipped and named in the output, never written into.

const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const REPO_ROOT = path.join(__dirname, "..");
const AKILI_BIN = path.join(REPO_ROOT, "bin", "akili.js");
const VENDOR = path.join(REPO_ROOT, ".claude", "skills", "impeccable");
const TOOLS = ["claude", "opencode", "antigravity", "codex", "cursor", "grokbot"];
const UPSTREAM_KEYS = ["name", "description", "version", "user-invocable", "argument-hint", "license"];

function sha256(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function stripAnsi(text) {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

// Every file under dir, as forward-slash paths relative to dir.
function walk(dir, base = dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, base));
    else out.push(path.relative(base, full).split(path.sep).join("/"));
  }
  return out.sort();
}

// `sha256  path` lines of the fenced checksum block in UPSTREAM.md.
function upstreamEntries() {
  const text = fs.readFileSync(path.join(VENDOR, "UPSTREAM.md"), "utf8");
  const m = /```text\r?\n([\s\S]*?)```/.exec(text);
  assert.notEqual(m, null, "UPSTREAM.md has no ```text checksum block");
  return m[1]
    .split(/\r?\n/)
    .filter((l) => l.trim() !== "")
    .map((l) => {
      const p = /^([0-9a-f]{64})  (.+)$/.exec(l);
      assert.notEqual(p, null, `malformed UPSTREAM.md checksum line: ${l}`);
      return { hash: p[1], file: p[2] };
    });
}

// Bytes of SKILL.md with the AKILI `metadata:` block removed: from the
// `metadata:` line up to (not including) the closing frontmatter fence.
function skillWithoutMetadata() {
  const text = fs.readFileSync(path.join(VENDOR, "SKILL.md"), "utf8");
  const lines = text.split("\n");
  const start = lines.findIndex((l) => l === "metadata:");
  assert.notEqual(start, -1, "SKILL.md frontmatter has no metadata: block");
  let end = -1;
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i] === "---") {
      end = i;
      break;
    }
  }
  assert.notEqual(end, -1, "SKILL.md has no closing frontmatter fence after metadata:");
  return Buffer.from(lines.slice(0, start).concat(lines.slice(end)).join("\n"), "utf8");
}

function frontmatter() {
  const text = fs.readFileSync(path.join(VENDOR, "SKILL.md"), "utf8");
  const m = /^---\n([\s\S]*?)\n---\n/.exec(text);
  assert.notEqual(m, null, "SKILL.md has no frontmatter");
  return m[1].split("\n");
}

// --- FR-1 / FR-2: checksums, file set ---------------------------------------

test("@akili-spec changes/impeccable-hardening FR-1 every UPSTREAM.md line matches its vendored file's raw bytes", () => {
  const entries = upstreamEntries();
  assert.ok(entries.length > 0, "UPSTREAM.md lists no files");
  for (const { hash, file } of entries) {
    const bytes =
      file === "SKILL.md" ? skillWithoutMetadata() : fs.readFileSync(path.join(VENDOR, file));
    assert.equal(sha256(bytes), hash, `hash mismatch for ${file}`);
  }
});

test("@akili-spec changes/impeccable-hardening FR-2 no file under the folder is unlisted (local edit creeps in)", () => {
  const listed = new Set(upstreamEntries().map((e) => e.file));
  const allowed = new Set(["UPSTREAM.md", "LICENSE", "NOTICE"]);
  const unlisted = walk(VENDOR).filter((f) => !listed.has(f) && !allowed.has(f));
  assert.deepEqual(unlisted, [], `files not in UPSTREAM.md: ${unlisted.join(", ")}`);
});

test("@akili-spec changes/impeccable-hardening FR-1 file count is the UPSTREAM.md line count plus 3", () => {
  assert.equal(walk(VENDOR).length, upstreamEntries().length + 3);
});

test("@akili-spec changes/impeccable-hardening FR-1 no scripts/bin/ directory is vendored", () => {
  assert.equal(fs.existsSync(path.join(VENDOR, "scripts", "bin")), false, "scripts/bin/ exists");
});

// --- NFR-2 / NFR-4: legal files ----------------------------------------------

test("@akili-spec changes/impeccable-hardening NFR-2 LICENSE is Apache License, Version 2.0", () => {
  const license = fs.readFileSync(path.join(VENDOR, "LICENSE"), "utf8");
  // the canonical Apache text centres its title, so leading whitespace is part of upstream's bytes
  assert.ok(license.trimStart().startsWith("Apache License"), "LICENSE does not start with 'Apache License'");
  assert.ok(license.includes("Version 2.0"), "LICENSE does not contain 'Version 2.0'");
});

test("@akili-spec changes/impeccable-hardening NFR-2 NOTICE names ehmo", () => {
  assert.ok(fs.readFileSync(path.join(VENDOR, "NOTICE"), "utf8").includes("ehmo"));
});

test("@akili-spec changes/impeccable-hardening NFR-2 NOTICE names the pinned commit", () => {
  const upstream = fs.readFileSync(path.join(VENDOR, "UPSTREAM.md"), "utf8");
  const commit = /\| Commit \| ([0-9a-f]{40}) \|/.exec(upstream);
  assert.notEqual(commit, null, "UPSTREAM.md has no 40-hex Commit row");
  assert.ok(fs.readFileSync(path.join(VENDOR, "NOTICE"), "utf8").includes(commit[1]));
});

test("@akili-spec changes/impeccable-hardening NFR-2 NOTICE states AKILI-SPECS is not affiliated", () => {
  assert.ok(fs.readFileSync(path.join(VENDOR, "NOTICE"), "utf8").includes("not affiliated"));
});

// --- FR-1: frontmatter --------------------------------------------------------

test("@akili-spec changes/impeccable-hardening FR-1 frontmatter keeps exactly the 6 upstream keys plus metadata", () => {
  const keys = frontmatter()
    .filter((l) => /^[A-Za-z][\w-]*:/.test(l))
    .map((l) => l.split(":")[0]);
  assert.deepEqual(keys, [...UPSTREAM_KEYS, "metadata"]);
});

test("@akili-spec changes/impeccable-hardening FR-1 metadata block carries binding: conditional", () => {
  assert.ok(frontmatter().includes("  binding: conditional"), "no '  binding: conditional' under metadata:");
});

// --- NFR-6: launchers ---------------------------------------------------------

test("@akili-spec changes/impeccable-hardening FR-3 launcher scripts/impeccable has mode 0755", (t) => {
  if (process.platform === "win32") {
    t.skip("win32 has no POSIX exec bit");
    return;
  }
  const mode = fs.statSync(path.join(VENDOR, "scripts", "impeccable")).mode & 0o777;
  assert.equal(mode.toString(8), "755");
});

test("@akili-spec changes/impeccable-hardening FR-1 scripts/impeccable.cmd keeps its CRLF line endings", () => {
  const cmd = fs.readFileSync(path.join(VENDOR, "scripts", "impeccable.cmd"));
  assert.ok(cmd.includes(Buffer.from("\r\n")), "impeccable.cmd has no CRLF");
});

// --- package surface ----------------------------------------------------------

test("@akili-spec changes/impeccable-hardening design 7.4 package.json files does not ship scripts/sync-impeccable.js", () => {
  const files = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "package.json"), "utf8")).files;
  const shipsIt = files.some((f) => {
    const p = f.replace(/\/+$/, "");
    return p === "scripts" || p === "scripts/sync-impeccable.js" || p === "scripts/*" || p === "scripts/**";
  });
  assert.equal(shipsIt, false, `files[] would ship scripts/sync-impeccable.js: ${files.join(", ")}`);
});

// --- FR-3: install into all six targets --------------------------------------

function mkHome(t, prefix) {
  const home = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix)));
  t.after(() => fs.rmSync(home, { recursive: true, force: true }));
  return home;
}

function installLocal(tool, cwd, home, extra = []) {
  const env = Object.assign({}, process.env, {
    HOME: home,
    USERPROFILE: home,
    CODEX_HOME: path.join(home, ".codex-env-unused"),
    CURSOR_CONFIG_DIR: path.join(home, ".cursor-env-unused"),
    AKILI_GROKBOT_TARGET: path.join(home, ".grokbot-env-unused", "workflows"),
  });
  const r = spawnSync(process.execPath, [AKILI_BIN, "install", "--tool", tool, "--local", ...extra], {
    cwd,
    env,
    encoding: "utf8",
  });
  return { status: r.status, out: stripAnsi((r.stdout || "") + (r.stderr || "")) };
}

// Every installed `impeccable` skill folder under root.
function installedFolders(root) {
  const found = [];
  (function recurse(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const full = path.join(dir, entry.name);
      if (entry.name === "impeccable") found.push(full);
      else recurse(full);
    }
  })(root);
  return found;
}

for (const tool of TOOLS) {
  test(`@akili-spec changes/impeccable-hardening FR-3 install --tool ${tool} --local delivers impeccable/{SKILL.md,LICENSE,UPSTREAM.md} and an executable launcher`, (t) => {
    const home = mkHome(t, "akili-imp-home-");
    const cwd = mkHome(t, "akili-imp-cwd-");
    const r = installLocal(tool, cwd, home);
    assert.equal(r.status, 0, r.out);
    const folders = installedFolders(cwd);
    assert.ok(folders.length > 0, `no impeccable/ folder installed for ${tool}:\n${r.out}`);
    for (const dir of folders) {
      for (const f of ["SKILL.md", "LICENSE", "UPSTREAM.md"]) {
        assert.ok(fs.existsSync(path.join(dir, f)), `${dir} is missing ${f}`);
      }
      const launcher = path.join(dir, "scripts", "impeccable");
      assert.ok(fs.existsSync(launcher), `${dir} is missing scripts/impeccable`);
      if (process.platform !== "win32") {
        assert.equal(fs.statSync(launcher).mode & 0o111, 0o111, `${launcher} is not executable`);
      }
    }
  });
}

test("@akili-spec changes/impeccable-hardening FR-3 a foreign impeccable/ is left byte-identical and named as foreign", (t) => {
  const home = mkHome(t, "akili-imp-home-");
  const cwd = mkHome(t, "akili-imp-cwd-");
  const foreign = path.join(cwd, ".grokbot", "workflows", "impeccable");
  fs.mkdirSync(foreign, { recursive: true });
  const seeded = "---\nname: impeccable\nversion: 4.9.0\n---\nforeign\n";
  fs.writeFileSync(path.join(foreign, "SKILL.md"), seeded);

  const r = installLocal("grokbot", cwd, home);
  assert.equal(r.status, 0, r.out);
  assert.equal(fs.readFileSync(path.join(foreign, "SKILL.md"), "utf8"), seeded, "foreign SKILL.md changed");
  assert.deepEqual(fs.readdirSync(foreign), ["SKILL.md"], "files were written into the foreign folder");
  assert.ok(
    r.out.split("\n").some((l) => l.includes("skip foreign") && l.trim().endsWith(foreign)),
    `output does not name ${foreign} as a skipped foreign entry:\n${r.out}`
  );
});

// --- FR-3 (amended, Pivot P-7 Option A): foreign impeccable/ on Claude Code and Grok Bot ---

function seedForeign(dir) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "SKILL.md"), "---\nname: impeccable\nversion: 4.9.0\n---\nmine\n");
  fs.writeFileSync(path.join(dir, "my-notes.txt"), "developer-only\n");
}

// Relative path -> hex bytes for every file under dir.
function snapshot(dir) {
  const out = {};
  for (const rel of walk(dir)) out[rel] = fs.readFileSync(path.join(dir, ...rel.split("/"))).toString("hex");
  return out;
}

test("@akili-spec changes/impeccable-hardening FR-3 claude --local: a foreign impeccable/ is untouched and reported as foreign with its version", (t) => {
  const home = mkHome(t, "akili-imp-home-");
  const cwd = mkHome(t, "akili-imp-cwd-");
  const foreign = path.join(cwd, ".claude", "skills", "impeccable");
  seedForeign(foreign);
  const before = snapshot(foreign);

  const r = installLocal("claude", cwd, home);

  assert.equal(r.status, 0, r.out);
  assert.deepEqual(snapshot(foreign), before, "foreign folder bytes or file set changed");
  assert.ok(
    r.out.split("\n").some((l) => l.includes("skip foreign") && l.includes("4.9.0") && l.includes("impeccable")),
    `output does not name the foreign impeccable/ with 4.9.0:\n${r.out}`
  );
});

test("@akili-spec changes/impeccable-hardening FR-3 claude --local --force: the foreign folder is replaced whole and no takeover leftover remains", (t) => {
  const home = mkHome(t, "akili-imp-home-");
  const cwd = mkHome(t, "akili-imp-cwd-");
  const foreign = path.join(cwd, ".claude", "skills", "impeccable");
  seedForeign(foreign);

  const r = installLocal("claude", cwd, home, ["--force"]);

  assert.equal(r.status, 0, r.out);
  assert.deepEqual(snapshot(foreign), snapshot(VENDOR), "folder does not equal the vendored tree");
  assert.equal(fs.existsSync(path.join(foreign, "my-notes.txt")), false, "developer-only file survived");
  assert.equal(fs.existsSync(path.join(cwd, ".claude", ".akili-takeover")), false, ".akili-takeover remains");
});

test("@akili-spec changes/impeccable-hardening FR-3 grokbot --local --force: the foreign folder is replaced whole with nothing bot-visible left behind", (t) => {
  const home = mkHome(t, "akili-imp-home-");
  const cwd = mkHome(t, "akili-imp-cwd-");
  const workflows = path.join(cwd, ".grokbot", "workflows");
  const foreign = path.join(workflows, "impeccable");
  seedForeign(foreign);

  const r = installLocal("grokbot", cwd, home, ["--force"]);

  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /replace foreign .*impeccable/, "output does not report the takeover");
  assert.deepEqual(snapshot(foreign), snapshot(VENDOR), "folder does not equal the vendored tree");
  assert.deepEqual(
    fs.readdirSync(workflows).filter((n) => n.startsWith(".")),
    [],
    "a hidden takeover leftover sits in the workflows root"
  );
});
