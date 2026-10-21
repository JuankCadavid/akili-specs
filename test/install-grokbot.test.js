"use strict";

// @akili-spec changes/grokbot-target
//
// Installer tests for Grok Bot as a sixth install target (`--tool grokbot`),
// T1 scope: whitelist, path resolution (FR-2), first install (FR-3), shared
// directory hygiene, detection (FR-6), and the `--tool all` set staying five
// (FR-1, NFR-1). Every test drives the real CLI as a subprocess (the
// test/install-cursor.test.js pattern) -- bin/akili.js runs main() on load.
//
// Every spawn pins HOME, USERPROFILE, CODEX_HOME, CURSOR_CONFIG_DIR, and
// AKILI_GROKBOT_TARGET to scratch paths (NFR-3), so no run can read or write
// /home/box or the real home. The pin defaults to a scratch path; the single
// deliberate exception is the FR-2 *Default* test (a dry run), which passes a
// blank value because FR-2 says blank counts as unset.
//
// Expected paths are always computed with path.resolve(), never a literal
// /home/box/... string: on Windows the resolved default gains a drive letter.
//
// Coverage by requirement:
//   FR-1  whitelist + error text; `--tool all` acts on exactly five tools
//   FR-2  each precedence row of the root table, blank env, `~` expansion
//   FR-3  first install on a non-existent root: one folder per skill/command,
//         byte-identical files, nothing else in the workflows root, nothing
//         outside the two roots; foreign folders untouched, no legacy/STALE
//   FR-6  detection positive / negative / workflows-root-only

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const AKILI_BIN = path.join(__dirname, "..", "bin", "akili.js");
const REPO_ROOT = path.join(__dirname, "..");
const SOURCE_COMMANDS = path.join(REPO_ROOT, ".claude", "commands");
const SOURCE_SKILLS = path.join(REPO_ROOT, ".claude", "skills");

function stripAnsi(text) {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

function mkHome(t, prefix) {
  // realpath: the CLI's process.cwd() is the real path (macOS /var -> /private/var)
  const home = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix)));
  t.after(() => fs.rmSync(home, { recursive: true, force: true }));
  return home;
}

// Pins every env var that could steer a root. `grokbotEnv` defaults to a
// scratch path, so a spawn whose --grokbot-target regresses can never write
// under /home/box.
function scratchEnv(home, grokbotEnv) {
  return Object.assign({}, process.env, {
    HOME: home,
    USERPROFILE: home,
    CODEX_HOME: path.join(home, ".codex-env-unused"),
    CURSOR_CONFIG_DIR: path.join(home, ".cursor-env-unused"),
    AKILI_GROKBOT_TARGET: grokbotEnv === undefined ? path.join(home, ".grokbot-env-unused", "workflows") : grokbotEnv,
  });
}

function runAkili(args, opts) {
  const result = spawnSync(process.execPath, [AKILI_BIN, ...args], { encoding: "utf8", ...opts });
  return {
    status: result.status,
    stdout: stripAnsi(result.stdout || ""),
    stderr: stripAnsi(result.stderr || ""),
  };
}

// The grokbot header names both roots: "GROKBOT target: <resources> (skills → <workflows>)".
function grokbotRoots(output) {
  const m = /GROKBOT target: (.+?) \(skills → (.+?)\)\s*$/m.exec(output);
  assert.notEqual(m, null, `expected a GROKBOT target header in:\n${output}`);
  return { resources: m[1], workflows: m[2] };
}

function listAllFiles(dir) {
  const out = [];
  (function walk(d) {
    if (!fs.existsSync(d)) return;
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else out.push(path.relative(dir, full).split(path.sep).join("/"));
    }
  })(dir);
  return out.sort();
}

function dryRunRoots(home, extraArgs, env, cwd) {
  const run = runAkili(["install", "--tool", "grokbot", "--dry-run", ...extraArgs], {
    cwd: cwd || home,
    env: env || scratchEnv(home),
  });
  assert.equal(run.status, 0, `expected a clean dry-run; stdout:\n${run.stdout}\nstderr:\n${run.stderr}`);
  return grokbotRoots(run.stdout);
}

const SKILL_NAMES = fs
  .readdirSync(SOURCE_SKILLS, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name);
const COMMAND_NAMES = fs
  .readdirSync(SOURCE_COMMANDS)
  .filter((f) => f.endsWith(".md"))
  .map((f) => f.replace(/\.md$/, ""));

test("@akili-spec changes/grokbot-target FR-1 (Valid selection): --tool grokbot passes validation and the unknown-tool error lists grokbot", (t) => {
  const home = mkHome(t, "akili-grokbot-whitelist-");
  const bad = runAkili(["install", "--tool", "nope", "--dry-run"], { cwd: home, env: scratchEnv(home) });
  assert.equal(bad.status, 1);
  assert.match(
    bad.stderr,
    /--tool must be one of: claude, opencode, antigravity, codex, cursor, grokbot, both, all/,
    `expected the error text to list grokbot; stderr:\n${bad.stderr}`
  );

  const ok = runAkili(
    ["doctor", "--tool", "grokbot", "--grokbot-target", path.join(home, "workflows")],
    { cwd: home, env: scratchEnv(home) }
  );
  assert.doesNotMatch(ok.stderr, /--tool must be one of/, `grokbot must pass argument validation; stderr:\n${ok.stderr}`);
  assert.match(ok.stdout, /Checking GROKBOT:/);
});

test("@akili-spec changes/grokbot-target FR-1 (all and both unchanged): --tool all acts on exactly the five desktop tools and keeps its verify hint", (t) => {
  const home = mkHome(t, "akili-grokbot-all-");
  // A real (non-dry) run below: pin grokbot to a scratch path so a regression
  // that pulled it into `all` could never write under /home/box.
  const env = scratchEnv(home, path.join(home, "gb-unused", "workflows"));
  const dry = runAkili(["install", "--tool", "all", "--dry-run"], { cwd: home, env });
  assert.equal(dry.status, 0, dry.stderr);
  const headers = [...dry.stdout.matchAll(/^([A-Z]+) target: /gm)].map((m) => m[1].toLowerCase());
  assert.deepEqual(headers, ["claude", "opencode", "antigravity", "codex", "cursor"]);
  assert.doesNotMatch(dry.stdout, /GROKBOT/);

  // The verify hint is only printed by a real run; point every target at scratch.
  const shared = path.join(home, "shared-skills");
  const real = runAkili(
    [
      "install", "--tool", "all",
      "--claude-target", path.join(home, "c"),
      "--opencode-target", path.join(home, "o"),
      "--antigravity-target", path.join(home, "a"),
      "--codex-target", path.join(home, "x"),
      "--codex-skills-target", shared,
      "--cursor-target", path.join(home, "u"),
      "--cursor-skills-target", shared,
    ],
    { cwd: home, env }
  );
  assert.equal(real.status, 0, real.stderr);
  assert.match(real.stdout, /akili doctor --tool all\b/);
  assert.doesNotMatch(real.stdout, /GROKBOT/);
});

test("@akili-spec changes/grokbot-target FR-2 (Default): blank env resolves /home/box/agent-data/{workflows,akili}", (t) => {
  const home = mkHome(t, "akili-grokbot-default-");
  // The single deliberate exception to the scratch pin: a blank value counts as
  // unset (FR-2), which is the only way to reach the real default. Dry run only.
  const roots = dryRunRoots(home, [], scratchEnv(home, "   "));
  assert.equal(roots.workflows, path.resolve("/home/box/agent-data/workflows"));
  assert.equal(roots.resources, path.resolve("/home/box/agent-data/akili"));
});

test("@akili-spec changes/grokbot-target FR-2 (Override on the box): --grokbot-target relocates both roots", (t) => {
  const home = mkHome(t, "akili-grokbot-override-");
  const roots = dryRunRoots(home, ["--grokbot-target", path.join(home, "srv", "grok", "workflows")]);
  assert.equal(roots.workflows, path.join(home, "srv", "grok", "workflows"));
  assert.equal(roots.resources, path.join(home, "srv", "grok", "akili"));
});

test("@akili-spec changes/grokbot-target FR-2 (Env var): AKILI_GROKBOT_TARGET sets the workflows root, resources are its sibling akili; ~ expands", (t) => {
  const home = mkHome(t, "akili-grokbot-env-");
  const e = path.join(home, "e");
  const roots = dryRunRoots(home, [], scratchEnv(home, path.join(e, "workflows")));
  assert.equal(roots.workflows, path.join(e, "workflows"));
  assert.equal(roots.resources, path.join(e, "akili"));

  const tilde = dryRunRoots(home, [], scratchEnv(home, "~/gw/workflows"));
  assert.equal(tilde.workflows, path.join(home, "gw", "workflows"));
  assert.equal(tilde.resources, path.join(home, "gw", "akili"));
});

test("@akili-spec changes/grokbot-target FR-2 (--local): ./.grokbot/{workflows,akili}, env var ignored", (t) => {
  const home = mkHome(t, "akili-grokbot-local-");
  const roots = dryRunRoots(home, ["--local"], scratchEnv(home, path.join(home, "envroot", "workflows")));
  assert.equal(roots.workflows, path.join(home, ".grokbot", "workflows"));
  assert.equal(roots.resources, path.join(home, ".grokbot", "akili"));
});

test("@akili-spec changes/grokbot-target FR-2 (precedence): --grokbot-target beats --local and env; --target beats both", (t) => {
  const home = mkHome(t, "akili-grokbot-prec-");
  const env = scratchEnv(home, path.join(home, "envroot", "workflows"));
  const flag = dryRunRoots(home, ["--local", "--grokbot-target", path.join(home, "flagroot", "workflows")], env);
  assert.equal(flag.workflows, path.join(home, "flagroot", "workflows"));
  assert.equal(flag.resources, path.join(home, "flagroot", "akili"));

  const p = path.join(home, "sandbox");
  const target = dryRunRoots(home, ["--target", p, "--grokbot-target", path.join(home, "flagroot", "workflows")], env);
  assert.equal(target.workflows, path.join(p, "workflows"));
  assert.equal(target.resources, path.join(p, "akili"));
});

test("@akili-spec changes/grokbot-target FR-2 (explicit resources): --grokbot-resources-target wins whatever the workflows root", (t) => {
  const home = mkHome(t, "akili-grokbot-res-");
  const roots = dryRunRoots(home, [
    "--grokbot-target", path.join(home, "w"),
    "--grokbot-resources-target", path.join(home, "elsewhere", "res"),
  ]);
  assert.equal(roots.workflows, path.join(home, "w"));
  assert.equal(roots.resources, path.join(home, "elsewhere", "res"));
});

test("@akili-spec changes/grokbot-target FR-3 (First install on an empty box): one folder per skill and command, byte-identical, nothing outside the two roots", (t) => {
  const home = mkHome(t, "akili-grokbot-first-");
  const box = path.join(home, "box");
  const workflows = path.join(box, "workflows");
  const resources = path.join(box, "akili");
  assert.equal(fs.existsSync(workflows), false, "precondition: the workflows root does not exist");

  const run = runAkili(["install", "--tool", "grokbot", "--grokbot-target", workflows], {
    cwd: home,
    env: scratchEnv(home),
  });
  assert.equal(run.status, 0, `stdout:\n${run.stdout}\nstderr:\n${run.stderr}`);

  // Nothing but skill and command folders directly inside the workflows root.
  const top = fs.readdirSync(workflows, { withFileTypes: true });
  assert.ok(top.every((e) => e.isDirectory()), "expected only folders directly inside the workflows root");
  assert.deepEqual(
    top.map((e) => e.name).sort(),
    [...SKILL_NAMES, ...COMMAND_NAMES].sort(),
    "expected exactly one folder per packaged skill and per command"
  );

  // Byte identity: Buffer comparison, no string transform, no line-ending normalization.
  for (const skill of SKILL_NAMES) {
    const srcDir = path.join(SOURCE_SKILLS, skill);
    for (const rel of listAllFiles(srcDir)) {
      const installed = fs.readFileSync(path.join(workflows, skill, ...rel.split("/")));
      assert.ok(installed.equals(fs.readFileSync(path.join(srcDir, ...rel.split("/")))), `${skill}/${rel} differs from source`);
    }
  }
  for (const cmd of COMMAND_NAMES) {
    const installed = fs.readFileSync(path.join(workflows, cmd, "SKILL.md"));
    assert.ok(installed.equals(fs.readFileSync(path.join(SOURCE_COMMANDS, `${cmd}.md`))), `${cmd}/SKILL.md differs from source`);
  }

  // Resources land in the resources root.
  const resFiles = listAllFiles(resources);
  for (const expected of ["templates/digests.json", "templates/leader.md", "scripts/parse_tests.js", ".mcp.json.example"]) {
    assert.ok(resFiles.includes(expected), `expected ${expected} under the resources root; got ${resFiles.join(", ")}`);
  }

  // Nothing written outside the two roots: list the whole scratch tree.
  const outside = listAllFiles(home).filter(
    (f) => !f.startsWith("box/workflows/") && !f.startsWith("box/akili/")
  );
  assert.deepEqual(outside, [], `files written outside the two roots: ${outside.join(", ")}`);
});

test("@akili-spec changes/grokbot-target FR-3 (Shared directory hygiene): an unrelated folder is left byte-identical and no legacy cleanup or STALE scan runs", (t) => {
  const home = mkHome(t, "akili-grokbot-hygiene-");
  const workflows = path.join(home, "box", "workflows");
  const foreign = path.join(workflows, "someone-elses-skill");
  fs.mkdirSync(foreign, { recursive: true });
  const body = Buffer.from("---\nname: someone-elses-skill\ndescription: not ours\n---\r\nbody\r\n");
  fs.writeFileSync(path.join(foreign, "SKILL.md"), body);
  fs.writeFileSync(path.join(foreign, "extra.bin"), Buffer.from([0, 1, 2, 255]));

  const run = runAkili(["install", "--tool", "grokbot", "--grokbot-target", workflows], {
    cwd: home,
    env: scratchEnv(home),
  });
  assert.equal(run.status, 0, `stdout:\n${run.stdout}\nstderr:\n${run.stderr}`);
  assert.ok(fs.readFileSync(path.join(foreign, "SKILL.md")).equals(body));
  assert.ok(fs.readFileSync(path.join(foreign, "extra.bin")).equals(Buffer.from([0, 1, 2, 255])));
  assert.doesNotMatch(run.stdout, /STALE|legacy|removed old|cleaned/i, `no legacy cleanup or STALE output expected; stdout:\n${run.stdout}`);

  const doctor = runAkili(["doctor", "--tool", "grokbot", "--grokbot-target", workflows], {
    cwd: home,
    env: scratchEnv(home),
  });
  assert.doesNotMatch(doctor.stdout, /STALE/, `no STALE scan expected; stdout:\n${doctor.stdout}`);
  assert.ok(fs.readFileSync(path.join(foreign, "SKILL.md")).equals(body));
});

test("@akili-spec changes/grokbot-target FR-6 (Detection): populated resources root is detected; none, or a workflows root alone, is not", (t) => {
  const home = mkHome(t, "akili-grokbot-detect-");
  const e = path.join(home, "e");
  const env = scratchEnv(home, path.join(e, "workflows"));
  const detect = () => {
    const r = runAkili(["doctor"], { cwd: home, env });
    const m = /Auto-detected installed target\(s\):\s*(.+)/.exec(r.stdout);
    return m ? m[1].split(",").map((s) => s.trim()) : [];
  };

  // Negative: nothing on disk.
  assert.equal(detect().includes("grokbot"), false, "nothing installed: grokbot must not be detected");

  // Workflows root with folders but no resources root: still not an install.
  fs.mkdirSync(path.join(e, "workflows", "foreign-skill"), { recursive: true });
  fs.writeFileSync(path.join(e, "workflows", "foreign-skill", "SKILL.md"), "# foreign\n");
  assert.equal(detect().includes("grokbot"), false, "a workflows root alone must not count as an install");

  // Positive: a populated resources root.
  fs.mkdirSync(path.join(e, "akili"), { recursive: true });
  fs.writeFileSync(path.join(e, "akili", "marker.txt"), "x\n");
  assert.equal(detect().includes("grokbot"), true, "a populated resources root must be detected");
});

// ---------------------------------------------------------------------------
// T2: ownership record and install policy (FR-3 record clause, FR-4, NFR-4)
// ---------------------------------------------------------------------------
// @akili-spec changes/grokbot-target
//
// Gap, stated rather than papered over: `update` cannot be spawned safely here
// (it runs `npm install -g akili-specs@latest` first), so the update column of
// the FR-4 table is exercised only through `install`. The one line that tells
// the two apart (`forceExplicit` = `--force` on `install` only) is covered by
// no CLI test.

const RECORD_NAME = "grokbot-owned.json";
const ALL_NAMES = [...SKILL_NAMES, ...COMMAND_NAMES];

function sortedNames(names) {
  return [...new Set(names)].sort();
}

function boxPaths(home) {
  const box = path.join(home, "box");
  return {
    workflows: path.join(box, "workflows"),
    resources: path.join(box, "akili"),
    record: path.join(box, "akili", RECORD_NAME),
  };
}

function installGrokbot(home, extraArgs) {
  const p = boxPaths(home);
  return runAkili(["install", "--tool", "grokbot", "--grokbot-target", p.workflows, ...(extraArgs || [])], {
    cwd: home,
    env: scratchEnv(home),
  });
}

function readRecord(home) {
  return JSON.parse(fs.readFileSync(boxPaths(home).record, "utf8"));
}

// Every file under dir with its bytes, so a comparison covers the whole fixture
// and not just SKILL.md.
function snapshotFiles(dir) {
  const out = {};
  for (const rel of listAllFiles(dir)) out[rel] = fs.readFileSync(path.join(dir, ...rel.split("/"))).toString("base64");
  return out;
}

// A foreign skill folder: CRLF SKILL.md, a binary file, and a nested file.
function makeForeignFolder(dir) {
  fs.mkdirSync(path.join(dir, "sub"), { recursive: true });
  fs.writeFileSync(path.join(dir, "SKILL.md"), Buffer.from("---\nname: x\ndescription: not ours\n---\r\nbody\r\n"));
  fs.writeFileSync(path.join(dir, "notes.md"), "foreign notes\n");
  fs.writeFileSync(path.join(dir, "blob.bin"), Buffer.from([0, 1, 2, 255]));
  fs.writeFileSync(path.join(dir, "sub", "deep.txt"), "deep\n");
}

function skipUnlessPermissionsEnforced(t) {
  if (process.platform === "win32") {
    t.skip("POSIX permission bits are not enforced on Windows");
    return true;
  }
  if (typeof process.getuid === "function" && process.getuid() === 0) {
    t.skip("running as root: chmod does not stop root, so a pass here would prove nothing");
    return true;
  }
  return false;
}

test("@akili-spec changes/grokbot-target FR-3 (First install, record clause): the record lists every skill and command name", (t) => {
  const home = mkHome(t, "akili-grokbot-rec-first-");
  const p = boxPaths(home);
  const run = installGrokbot(home);
  assert.equal(run.status, 0, `stdout:\n${run.stdout}\nstderr:\n${run.stderr}`);
  assert.ok(fs.existsSync(p.record), `expected the ownership record at ${p.record}`);
  assert.deepEqual(readRecord(home), { version: 1, folders: sortedNames(ALL_NAMES) });
  assert.deepEqual(
    listAllFiles(p.resources).filter((f) => f.endsWith(".tmp")),
    [],
    "no temp file may be left behind by the atomic record write"
  );
});

test("@akili-spec changes/grokbot-target FR-3 (Dry run): nothing is written, the record included, and a dry-run takeover removes nothing", (t) => {
  const home = mkHome(t, "akili-grokbot-rec-dry-");
  const p = boxPaths(home);
  const fresh = installGrokbot(home, ["--dry-run"]);
  assert.equal(fresh.status, 0, fresh.stderr);
  assert.equal(fs.existsSync(path.join(home, "box")), false, "a dry run must create neither root nor the record");

  const foreignTdd = path.join(p.workflows, "tdd");
  makeForeignFolder(foreignTdd);
  const before = snapshotFiles(home);
  const forced = installGrokbot(home, ["--dry-run", "--force"]);
  assert.equal(forced.status, 0, forced.stderr);
  assert.deepEqual(snapshotFiles(home), before, "--dry-run --force changed the tree");
  assert.equal(fs.existsSync(p.record), false);
});

test("@akili-spec changes/grokbot-target FR-3 (Partial installs): --skills-only and --commands-only record only their own set, created even though resources are skipped", (t) => {
  const home = mkHome(t, "akili-grokbot-rec-partial-");
  const p = boxPaths(home);
  const skills = installGrokbot(home, ["--skills-only"]);
  assert.equal(skills.status, 0, skills.stderr);
  assert.deepEqual(readRecord(home), { version: 1, folders: sortedNames(SKILL_NAMES) });
  assert.deepEqual(listAllFiles(p.resources), [RECORD_NAME], "resources are skipped, the record is not");

  const cmds = installGrokbot(home, ["--commands-only"]);
  assert.equal(cmds.status, 0, cmds.stderr);
  assert.deepEqual(readRecord(home), { version: 1, folders: sortedNames(ALL_NAMES) }, "the record keeps what it listed and adds the new set");

  const other = mkHome(t, "akili-grokbot-rec-partial2-");
  const only = installGrokbot(other, ["--commands-only"]);
  assert.equal(only.status, 0, only.stderr);
  assert.deepEqual(readRecord(other), { version: 1, folders: sortedNames(COMMAND_NAMES) });
  assert.deepEqual(
    fs.readdirSync(boxPaths(other).workflows).sort(),
    sortedNames(COMMAND_NAMES),
    "--commands-only wrote a skill folder"
  );
});

test("@akili-spec changes/grokbot-target FR-4 (Foreign tdd survives update): a foreign skill folder stays byte-identical across repeated installs and is not recorded", (t) => {
  const home = mkHome(t, "akili-grokbot-foreign-dir-");
  const p = boxPaths(home);
  assert.ok(SKILL_NAMES.includes("tdd"), "precondition: tdd is a packaged skill");
  const foreignTdd = path.join(p.workflows, "tdd");
  makeForeignFolder(foreignTdd);
  const before = snapshotFiles(foreignTdd);

  for (const attempt of [1, 2]) {
    const run = installGrokbot(home);
    assert.equal(run.status, 0, `run ${attempt}: ${run.stdout}\n${run.stderr}`);
    assert.deepEqual(snapshotFiles(foreignTdd), before, `run ${attempt}: the foreign tdd folder changed`);
    assert.match(run.stdout, /skip foreign .*tdd/, `run ${attempt}: expected tdd to be reported as skipped foreign`);
    assert.equal(readRecord(home).folders.includes("tdd"), false, `run ${attempt}: tdd must not be recorded`);
  }
  assert.ok(
    readRecord(home).folders.includes(SKILL_NAMES.find((n) => n !== "tdd")),
    "the other skills are still installed and recorded"
  );
});

test("@akili-spec changes/grokbot-target FR-4 (Foreign plain file named like a command): left untouched, reported foreign, not recorded", (t) => {
  const home = mkHome(t, "akili-grokbot-foreign-file-");
  const p = boxPaths(home);
  const cmd = COMMAND_NAMES[0];
  fs.mkdirSync(p.workflows, { recursive: true });
  const file = path.join(p.workflows, cmd);
  fs.writeFileSync(file, Buffer.from("not a folder\r\n"));

  const run = installGrokbot(home);
  assert.equal(run.status, 0, `${run.stdout}\n${run.stderr}`);
  assert.ok(fs.lstatSync(file).isFile());
  assert.ok(fs.readFileSync(file).equals(Buffer.from("not a folder\r\n")));
  assert.match(run.stdout, new RegExp(`skip foreign .*${cmd}`));
  assert.equal(readRecord(home).folders.includes(cmd), false);
});

test("@akili-spec changes/grokbot-target FR-4 (Foreign dangling symlink): classified by lstat as foreign, left untouched, not recorded", (t) => {
  const home = mkHome(t, "akili-grokbot-foreign-dangling-");
  const p = boxPaths(home);
  fs.mkdirSync(p.workflows, { recursive: true });
  const link = path.join(p.workflows, "tdd");
  const missingTarget = path.join(home, "does-not-exist");
  try {
    fs.symlinkSync(missingTarget, link);
  } catch (e) {
    t.skip(`cannot create symlinks here (${e.code})`);
    return;
  }
  const run = installGrokbot(home);
  assert.equal(run.status, 0, `${run.stdout}\n${run.stderr}`);
  assert.ok(fs.lstatSync(link).isSymbolicLink(), "the dangling symlink was replaced");
  assert.equal(fs.readlinkSync(link), missingTarget);
  assert.equal(fs.existsSync(missingTarget), false, "nothing may be written through the link");
  assert.match(run.stdout, /skip foreign .*tdd/);
  assert.equal(readRecord(home).folders.includes("tdd"), false);
});

test("@akili-spec changes/grokbot-target FR-4 (Explicit takeover): install --force replaces a foreign entry whole, never follows a symlink, and records the names", (t) => {
  const home = mkHome(t, "akili-grokbot-takeover-");
  const p = boxPaths(home);
  const cmd = COMMAND_NAMES[0];
  const linkSkill = SKILL_NAMES.find((n) => n !== "tdd");
  const foreignTdd = path.join(p.workflows, "tdd");
  const foreignCmd = path.join(p.workflows, cmd);
  makeForeignFolder(foreignTdd);
  makeForeignFolder(foreignCmd);

  const outside = path.join(home, "outside");
  fs.mkdirSync(outside, { recursive: true });
  fs.writeFileSync(path.join(outside, "keep.txt"), "keep\n");
  const link = path.join(p.workflows, linkSkill);
  let linked = true;
  try {
    fs.symlinkSync(outside, link, "dir");
  } catch (e) {
    linked = false;
  }

  const run = installGrokbot(home, ["--force"]);
  assert.equal(run.status, 0, `${run.stdout}\n${run.stderr}`);
  assert.match(run.stdout, /replace foreign .*tdd/);

  // Whole replacement: the installed file list equals the source file list, so
  // notes.md, blob.bin and sub/ are gone, and every byte matches the source.
  const srcTdd = path.join(SOURCE_SKILLS, "tdd");
  assert.deepEqual(listAllFiles(foreignTdd), listAllFiles(srcTdd), "files of the foreign tdd survived the takeover");
  for (const rel of listAllFiles(srcTdd)) {
    assert.ok(
      fs.readFileSync(path.join(foreignTdd, ...rel.split("/"))).equals(fs.readFileSync(path.join(srcTdd, ...rel.split("/")))),
      `tdd/${rel} differs from source`
    );
  }
  assert.deepEqual(listAllFiles(foreignCmd), ["SKILL.md"], "files of the foreign command folder survived");
  assert.ok(
    fs.readFileSync(path.join(foreignCmd, "SKILL.md")).equals(fs.readFileSync(path.join(SOURCE_COMMANDS, `${cmd}.md`)))
  );

  if (linked) {
    assert.ok(!fs.lstatSync(link).isSymbolicLink(), "the symlink must be replaced by a real folder");
    assert.deepEqual(listAllFiles(outside), ["keep.txt"], "the symlink target was written through or removed");
    assert.equal(fs.readFileSync(path.join(outside, "keep.txt"), "utf8"), "keep\n");
    assert.deepEqual(listAllFiles(link), listAllFiles(path.join(SOURCE_SKILLS, linkSkill)));
  }
  const names = readRecord(home).folders;
  for (const n of ["tdd", cmd, ...(linked ? [linkSkill] : [])]) assert.ok(names.includes(n), `${n} must be recorded after the takeover`);

  // Safe takeover (T2b): nothing is left behind, in the workflows root or in
  // the resources root, once the moved-aside entries are deleted.
  assert.deepEqual(fs.readdirSync(p.workflows).sort(), sortedNames(ALL_NAMES), "something bot-visible was left in the workflows root");
  const aside = path.join(p.resources, ".takeover");
  assert.deepEqual(fs.existsSync(aside) ? fs.readdirSync(aside) : [], [], "moved-aside entries must be deleted on success");
});

test("@akili-spec changes/grokbot-target FR-4 (Owned entries): a second install skips them and leaves the record alone; --force overwrites", (t) => {
  const home = mkHome(t, "akili-grokbot-owned-");
  const p = boxPaths(home);
  assert.equal(installGrokbot(home).status, 0);
  const recordBefore = fs.readFileSync(p.record);

  const skillMd = path.join(p.workflows, "tdd", "SKILL.md");
  fs.writeFileSync(skillMd, "locally edited\n");
  const again = installGrokbot(home);
  assert.equal(again.status, 0, again.stderr);
  assert.doesNotMatch(again.stdout, /foreign/, "owned entries are not foreign");
  assert.equal(fs.readFileSync(skillMd, "utf8"), "locally edited\n", "install without --force must not overwrite an owned entry");
  assert.ok(fs.readFileSync(p.record).equals(recordBefore));

  const forced = installGrokbot(home, ["--force"]);
  assert.equal(forced.status, 0, forced.stderr);
  assert.ok(fs.readFileSync(skillMd).equals(fs.readFileSync(path.join(SOURCE_SKILLS, "tdd", "SKILL.md"))));
  assert.ok(fs.readFileSync(p.record).equals(recordBefore));
});

test("@akili-spec changes/grokbot-target FR-4 (Ownership record missing or unreadable): an invalid record stays byte-identical, nothing is written into the workflows root, exit 1, resources still install", (t) => {
  const variants = {
    unparsable: "{ not json",
    "wrong shape": '{"version":1,"folders":"tdd"}',
    "wrong version": '{"version":2,"folders":[]}',
  };
  for (const [label, content] of Object.entries(variants)) {
    for (const extra of [[], ["--force"]]) {
      const home = mkHome(t, "akili-grokbot-invalid-");
      const p = boxPaths(home);
      makeForeignFolder(path.join(p.workflows, "tdd"));
      fs.mkdirSync(p.resources, { recursive: true });
      fs.writeFileSync(p.record, content);
      const workflowsBefore = snapshotFiles(p.workflows);

      const run = installGrokbot(home, extra);
      const where = `${label} ${extra.join(" ")}`;
      assert.equal(run.status, 1, `${where}: expected exit 1; stdout:\n${run.stdout}\nstderr:\n${run.stderr}`);
      assert.equal(fs.readFileSync(p.record, "utf8"), content, `${where}: the invalid record was rewritten`);
      assert.deepEqual(snapshotFiles(p.workflows), workflowsBefore, `${where}: something was written into the workflows root`);
      assert.match(run.stdout, /blocked \(invalid ownership record\)/, where);
      assert.match(run.stdout, /delete the record/, `${where}: recovery text missing`);
      assert.ok(fs.existsSync(path.join(p.resources, "templates", "digests.json")), `${where}: resources must still install`);
    }
  }

  // A workflows root that does not exist yet is not created either.
  const home = mkHome(t, "akili-grokbot-invalid-noroot-");
  const p = boxPaths(home);
  fs.mkdirSync(p.resources, { recursive: true });
  fs.writeFileSync(p.record, "garbage");
  const run = installGrokbot(home);
  assert.equal(run.status, 1);
  assert.equal(fs.existsSync(p.workflows), false, "an invalid record must not even create the workflows root");
  assert.equal(fs.readFileSync(p.record, "utf8"), "garbage");
});

test("@akili-spec changes/grokbot-target FR-4 (Interrupted install): a write that dies part-way leaves the name begun in the record, and a re-run treats it as owned", (t) => {
  if (skipUnlessPermissionsEnforced(t)) return;
  const home = mkHome(t, "akili-grokbot-interrupted-");
  const p = boxPaths(home);
  fs.mkdirSync(p.workflows, { recursive: true });
  fs.chmodSync(p.workflows, 0o555);
  let first;
  try {
    first = installGrokbot(home);
  } finally {
    fs.chmodSync(p.workflows, 0o755);
  }
  assert.notEqual(first.status, 0, `expected the read-only workflows root to fail the install:\n${first.stdout}`);
  assert.match(first.stderr, /EACCES/);
  const begun = readRecord(home).folders;
  assert.deepEqual(begun, [COMMAND_NAMES[0]], "the record lists exactly the name begun");
  assert.deepEqual(fs.readdirSync(p.workflows), [], "nothing was written into the read-only root");

  const second = installGrokbot(home);
  assert.equal(second.status, 0, `${second.stdout}\n${second.stderr}`);
  assert.doesNotMatch(second.stdout, /foreign/, "a name the record lists must never read as foreign");
  assert.ok(fs.existsSync(path.join(p.workflows, COMMAND_NAMES[0], "SKILL.md")));
  assert.deepEqual(readRecord(home).folders, sortedNames(ALL_NAMES));
});

// Installs everything, then turns `tdd` into a foreign entry: unrecorded, with
// the given fixture built at its path. Returns the foreign folder.
function installThenMakeTddForeign(home, buildForeign) {
  const p = boxPaths(home);
  assert.equal(installGrokbot(home).status, 0);
  const rec = readRecord(home);
  fs.writeFileSync(p.record, JSON.stringify({ version: 1, folders: rec.folders.filter((n) => n !== "tdd") }, null, 2) + "\n");
  const dir = path.join(p.workflows, "tdd");
  fs.rmSync(dir, { recursive: true });
  buildForeign(dir);
  return dir;
}

test("@akili-spec changes/grokbot-target FR-4 (Interrupted takeover, move-aside fails): the foreign entry stays whole in place and the name is not recorded", (t) => {
  if (skipUnlessPermissionsEnforced(t)) return;
  const home = mkHome(t, "akili-grokbot-takeover-move-fail-");
  const p = boxPaths(home);
  const foreignTdd = installThenMakeTddForeign(home, makeForeignFolder);
  const before = snapshotFiles(foreignTdd);
  const recordBefore = fs.readFileSync(p.record);

  // A read-only workflows root: owned entries still overwrite in place, but
  // renaming the foreign entry out of the root is refused.
  fs.chmodSync(p.workflows, 0o555);
  let run;
  try {
    run = installGrokbot(home, ["--force"]);
  } finally {
    fs.chmodSync(p.workflows, 0o755);
  }
  assert.notEqual(run.status, 0, `expected the refused move-aside to stop the run:\n${run.stdout}`);
  assert.match(run.stderr, /EACCES|EPERM/);
  assert.deepEqual(snapshotFiles(foreignTdd), before, "the foreign entry must be whole and byte-identical in place");
  assert.equal(readRecord(home).folders.includes("tdd"), false, "a foreign entry that was not replaced must never be recorded as owned");
  assert.ok(fs.readFileSync(p.record).equals(recordBefore), "the record must not change");
});

test("@akili-spec changes/grokbot-target FR-4 (Interrupted takeover, record write fails after the move): the entry is put back whole, the name is not recorded", (t) => {
  if (skipUnlessPermissionsEnforced(t)) return;
  const home = mkHome(t, "akili-grokbot-takeover-record-fail-");
  const p = boxPaths(home);
  const foreignTdd = installThenMakeTddForeign(home, makeForeignFolder);
  const before = snapshotFiles(foreignTdd);
  const recordBefore = fs.readFileSync(p.record);

  // .takeover/ exists and stays writable, so the move-aside succeeds; the
  // resources root itself is read-only, so the record's temp file cannot be
  // created and step (2) fails.
  const takeoverRoot = path.join(p.resources, ".takeover");
  fs.mkdirSync(takeoverRoot);
  fs.chmodSync(p.resources, 0o555);
  let run;
  try {
    run = installGrokbot(home, ["--force"]);
  } finally {
    fs.chmodSync(p.resources, 0o755);
  }
  assert.notEqual(run.status, 0, `expected the failed record write to stop the run:\n${run.stdout}`);
  assert.match(run.stderr, /EACCES|EPERM/);
  assert.deepEqual(snapshotFiles(foreignTdd), before, "the foreign entry must be back in place, whole and byte-identical");
  assert.deepEqual(fs.readdirSync(takeoverRoot), [], "the restored entry must not also remain under .takeover/");
  assert.ok(fs.readFileSync(p.record).equals(recordBefore), "the record must not change");
  assert.equal(readRecord(home).folders.includes("tdd"), false);
});

test("@akili-spec changes/grokbot-target FR-4 (Interrupted takeover, delete-after-move fails): the takeover stands, a warning names the leftover, and the foreign files stay intact outside the workflows root", (t) => {
  if (skipUnlessPermissionsEnforced(t)) return;
  const home = mkHome(t, "akili-grokbot-takeover-delete-fail-");
  const p = boxPaths(home);
  const takeoverRoot = path.join(p.resources, ".takeover");
  // Flat files inside one read-only folder: deleting any of them is refused, so
  // the moved-aside copy cannot be partly deleted either.
  const fixture = {
    "locked/SKILL.md": Buffer.from("---\nname: x\n---\r\nforeign\r\n"),
    "locked/blob.bin": Buffer.from([0, 1, 2, 255]),
  };
  const lockedDirs = () =>
    fs.existsSync(takeoverRoot) ? fs.readdirSync(takeoverRoot).map((e) => path.join(takeoverRoot, e, "locked")) : [];
  const foreignTdd = path.join(p.workflows, "tdd");
  fs.mkdirSync(path.join(foreignTdd, "locked"), { recursive: true });
  for (const [rel, bytes] of Object.entries(fixture)) fs.writeFileSync(path.join(foreignTdd, ...rel.split("/")), bytes);
  fs.chmodSync(path.join(foreignTdd, "locked"), 0o555);

  let run;
  try {
    run = installGrokbot(home, ["--force"]);
    assert.equal(run.status, 0, `a failed delete-after-move is a warning, not an error:\n${run.stdout}\n${run.stderr}`);

    // AKILI's tdd is installed whole and recorded.
    const srcTdd = path.join(SOURCE_SKILLS, "tdd");
    assert.deepEqual(listAllFiles(foreignTdd), listAllFiles(srcTdd));
    assert.ok(readRecord(home).folders.includes("tdd"));

    // The warning names a path under <resources root>/.takeover/, and every
    // foreign file is byte-identical there.
    const m = /warning.*kept at (.+)$/m.exec(run.stdout);
    assert.notEqual(m, null, `expected a warning naming the leftover path:\n${run.stdout}`);
    const leftover = m[1].trim();
    assert.ok(leftover.startsWith(takeoverRoot + path.sep), `${leftover} is not under ${takeoverRoot}`);
    assert.deepEqual(snapshotFiles(leftover), Object.fromEntries(Object.entries(fixture).map(([k, v]) => [k, v.toString("base64")])));
  } finally {
    for (const d of lockedDirs()) fs.chmodSync(d, 0o755);
    if (fs.existsSync(path.join(foreignTdd, "locked"))) fs.chmodSync(path.join(foreignTdd, "locked"), 0o755);
  }
});
