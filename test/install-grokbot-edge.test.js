"use strict";

// @akili-spec changes/grokbot-target
//
// Edge-case integration tests for `--tool grokbot`, written by the /akili-test
// Tester to close the gaps the T1..T5 Reviewers left as advisories. The
// author's suite (test/install-grokbot.test.js) is cited, not repeated: this
// file covers only what it does not assert.
//
// Every test drives the real CLI as a subprocess. Every spawn pins HOME,
// USERPROFILE, CODEX_HOME, CURSOR_CONFIG_DIR, and AKILI_GROKBOT_TARGET to
// scratch paths; the one deliberate exception is the FR-2 *Default* dry run,
// which passes a blank AKILI_GROKBOT_TARGET because blank counts as unset.
// Expected paths come from path.resolve(), never a /home/box literal, because
// Windows adds a drive letter.
//
// Expected values are inlined from docs/specs/changes/grokbot-target/
// requirements.md §6 at commit 46dcdcb; nothing here reads the spec folder.

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
const RECORD_NAME = "grokbot-owned.json";

function stripAnsi(text) {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

function mkHome(t, prefix) {
  const home = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix)));
  t.after(() => fs.rmSync(home, { recursive: true, force: true }));
  return home;
}

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

function snapshotFiles(dir) {
  const out = {};
  for (const rel of listAllFiles(dir)) out[rel] = fs.readFileSync(path.join(dir, ...rel.split("/"))).toString("base64");
  return out;
}

function boxPaths(home) {
  const box = path.join(home, "box");
  return {
    workflows: path.join(box, "workflows"),
    resources: path.join(box, "akili"),
    record: path.join(box, "akili", RECORD_NAME),
  };
}

function grokbot(home, verb, extraArgs) {
  return runAkili([verb, "--tool", "grokbot", "--grokbot-target", boxPaths(home).workflows, ...(extraArgs || [])], {
    cwd: home,
    env: scratchEnv(home),
  });
}

function makeForeignFolder(dir) {
  fs.mkdirSync(path.join(dir, "sub"), { recursive: true });
  fs.writeFileSync(path.join(dir, "SKILL.md"), Buffer.from("---\nname: x\ndescription: not ours\n---\r\nbody\r\n"));
  fs.writeFileSync(path.join(dir, "blob.bin"), Buffer.from([0, 1, 2, 255]));
  fs.writeFileSync(path.join(dir, "sub", "deep.txt"), "deep\n");
}

// Symlinks need a privilege on Windows; a test that cannot make one skips with a reason.
function trySymlink(t, target, link) {
  try {
    fs.symlinkSync(target, link, "dir");
    return true;
  } catch (e) {
    t.skip(`cannot create a symlink here (${e.code}); the scenario needs one`);
    return false;
  }
}

const SKILL_NAMES = fs
  .readdirSync(SOURCE_SKILLS, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name);
const COMMAND_NAMES = fs
  .readdirSync(SOURCE_COMMANDS)
  .filter((f) => f.endsWith(".md"))
  .map((f) => f.replace(/\.md$/, ""));
const ALL_NAMES = [...SKILL_NAMES, ...COMMAND_NAMES].sort();

// --- Gap 1 -----------------------------------------------------------------

test("@akili-spec changes/grokbot-target FR-1 (all and both unchanged): --tool both --dry-run acts on exactly claude and opencode, never grokbot", (t) => {
  const home = mkHome(t, "akili-gbe-both-");
  const run = runAkili(["install", "--tool", "both", "--dry-run"], { cwd: home, env: scratchEnv(home) });
  assert.equal(run.status, 0, run.stderr);
  const headers = [...run.stdout.matchAll(/^([A-Z]+) target: /gm)].map((m) => m[1].toLowerCase());
  assert.deepEqual(headers, ["claude", "opencode"]);
  assert.doesNotMatch(run.stdout, /GROKBOT|grokbot|agent-data/i);
});

// --- Gap 8 -----------------------------------------------------------------

test("@akili-spec changes/grokbot-target FR-1: help lists grokbot in --tool, --grokbot-target and --grokbot-resources-target", (t) => {
  const home = mkHome(t, "akili-gbe-help-");
  const run = runAkili(["help"], { cwd: home, env: scratchEnv(home) });
  assert.equal(run.status, 0, run.stderr);
  const toolLine = run.stdout.split("\n").find((l) => /^\s*--tool <name>/.test(l));
  assert.ok(toolLine, `no --tool line in help:\n${run.stdout}`);
  assert.match(toolLine, /\bgrokbot\b/);
  assert.match(run.stdout, /^\s*--grokbot-target\s+\S/m);
  assert.match(run.stdout, /^\s*--grokbot-resources-target\s+\S/m);
});

// --- Gap 2 -----------------------------------------------------------------

test("@akili-spec changes/grokbot-target FR-2 (Default): every planned write of a blank-env dry run lands under the two default roots", (t) => {
  const home = mkHome(t, "akili-gbe-default-");
  // Blank pin: dry run only, so nothing can reach /home/box.
  const run = runAkili(["install", "--tool", "grokbot", "--dry-run"], { cwd: home, env: scratchEnv(home, "   ") });
  assert.equal(run.status, 0, run.stderr);
  const workflows = path.resolve("/home/box/agent-data/workflows");
  const resources = path.resolve("/home/box/agent-data/akili");
  const planned = [...run.stdout.matchAll(/^\s*would (?:install|overwrite|replace foreign) (.+?)\s*$/gm)].map((m) => m[1]);
  assert.ok(planned.length > 0, `no planned writes in:\n${run.stdout}`);
  const under = (root, p) => p.startsWith(root + path.sep);
  const stray = planned.filter((p) => !under(workflows, p) && !under(resources, p));
  assert.deepEqual(stray, [], "planned writes outside the two default roots");

  const wfEntries = planned.filter((p) => under(workflows, p)).map((p) => path.relative(workflows, p).split(path.sep)[0]);
  assert.deepEqual([...new Set(wfEntries)].sort(), ALL_NAMES, "every skill and command is planned under the default workflows root");
  const resFiles = planned.filter((p) => under(resources, p)).map((p) => path.relative(resources, p).split(path.sep).join("/"));
  for (const f of ["templates/digests.json", "templates/leader.md", ".mcp.json.example"]) {
    assert.ok(resFiles.includes(f), `${f} not planned under the default resources root`);
  }
});

// --- Gap 3 -----------------------------------------------------------------

function checkedTools(stdout) {
  return [...stdout.matchAll(/^Checking ([A-Z]+): /gm)].map((m) => m[1].toLowerCase());
}

test("@akili-spec changes/grokbot-target FR-6 (Not detected elsewhere): with nothing installed, doctor falls back to claude alone", (t) => {
  const home = mkHome(t, "akili-gbe-nodetect-");
  const run = runAkili(["doctor"], { cwd: home, env: scratchEnv(home) });
  assert.doesNotMatch(run.stdout, /Auto-detected installed target/, "nothing installed: no auto-detected banner");
  assert.deepEqual(checkedTools(run.stdout), ["claude"], "the default-claude fallback must be the only tool checked");
});

test("@akili-spec changes/grokbot-target FR-6 (Not detected elsewhere): a Mac with Claude Code and OpenCode lists exactly those two; a workflows root alone changes nothing", (t) => {
  const home = mkHome(t, "akili-gbe-mac-");
  const e = path.join(home, "e");
  const env = scratchEnv(home, path.join(e, "workflows"));
  const inst = runAkili(["install", "--tool", "both"], { cwd: home, env });
  assert.equal(inst.status, 0, inst.stderr);

  const before = runAkili(["doctor"], { cwd: home, env });
  assert.match(before.stdout, /Auto-detected installed target\(s\): claude, opencode\s*$/m);
  assert.deepEqual(checkedTools(before.stdout), ["claude", "opencode"]);

  // A workflows root holding AKILI-named folders, no resources root.
  for (const n of ["tdd", COMMAND_NAMES[0]]) {
    fs.mkdirSync(path.join(e, "workflows", n), { recursive: true });
    fs.writeFileSync(path.join(e, "workflows", n, "SKILL.md"), "# x\n");
  }
  const after = runAkili(["doctor"], { cwd: home, env });
  assert.equal(after.stdout, before.stdout, "the output for the other tools must be unchanged");
  assert.equal(after.status, before.status);
});

// --- Gap 4 -----------------------------------------------------------------

test("@akili-spec changes/grokbot-target FR-3 (First install on an empty box): each installed folder's file list equals its source, no extra files", (t) => {
  const home = mkHome(t, "akili-gbe-filelist-");
  const p = boxPaths(home);
  const run = grokbot(home, "install");
  assert.equal(run.status, 0, `${run.stdout}\n${run.stderr}`);
  for (const skill of SKILL_NAMES) {
    assert.deepEqual(listAllFiles(path.join(p.workflows, skill)), listAllFiles(path.join(SOURCE_SKILLS, skill)), `skill ${skill}`);
  }
  for (const cmd of COMMAND_NAMES) {
    assert.deepEqual(listAllFiles(path.join(p.workflows, cmd)), ["SKILL.md"], `command ${cmd}`);
  }
});

// --- Gap 5 -----------------------------------------------------------------

function assertInvalidRecordRun(home, extra, label, recordCheck) {
  const p = boxPaths(home);
  makeForeignFolder(path.join(p.workflows, "tdd"));
  const before = snapshotFiles(p.workflows);
  const run = grokbot(home, "install", extra);
  const where = `${label} ${extra.join(" ")}`;
  assert.equal(run.status, 1, `${where}: expected exit 1\n${run.stdout}\n${run.stderr}`);
  assert.doesNotMatch(run.stderr, /^\s+at /m, `${where}: crashed with a stack trace`);
  assert.match(run.stdout, new RegExp(`ownership record .*${RECORD_NAME} is unreadable \\(${label}\\)`), where);
  assert.match(run.stdout, /blocked \(invalid ownership record\)/, where);
  assert.deepEqual(snapshotFiles(p.workflows), before, `${where}: something was written into the workflows root`);
  assert.deepEqual(fs.readdirSync(p.workflows), ["tdd"], `${where}: an entry was created in the workflows root`);
  assert.equal(fs.existsSync(path.join(p.resources, ".takeover")), false, `${where}: a takeover started`);
  recordCheck(where);
}

test("@akili-spec changes/grokbot-target FR-4 (Ownership record missing or unreadable): a record that is a directory (EISDIR) is invalid; install and install --force write nothing and exit 1", (t) => {
  for (const extra of [[], ["--force"]]) {
    const home = mkHome(t, "akili-gbe-eisdir-");
    const p = boxPaths(home);
    fs.mkdirSync(path.join(p.record, "inner"), { recursive: true });
    fs.writeFileSync(path.join(p.record, "inner", "x.txt"), "x\n");
    assertInvalidRecordRun(home, extra, "EISDIR", (where) => {
      assert.ok(fs.lstatSync(p.record).isDirectory(), `${where}: the record directory was replaced`);
      assert.deepEqual(listAllFiles(p.record), ["inner/x.txt"], `${where}: the record directory changed`);
    });
  }
});

test("@akili-spec changes/grokbot-target FR-4 (Ownership record missing or unreadable): a chmod 000 record (EACCES) is invalid; install and install --force write nothing and exit 1", (t) => {
  if (process.platform === "win32") return t.skip("POSIX permission bits are not enforced on Windows");
  if (typeof process.getuid === "function" && process.getuid() === 0) {
    return t.skip("running as root: chmod 000 does not stop root, so a pass would prove nothing");
  }
  const body = '{"version":1,"folders":[]}\n';
  for (const extra of [[], ["--force"]]) {
    const home = mkHome(t, "akili-gbe-eacces-");
    const p = boxPaths(home);
    fs.mkdirSync(p.resources, { recursive: true });
    fs.writeFileSync(p.record, body);
    fs.chmodSync(p.record, 0o000);
    try {
      assertInvalidRecordRun(home, extra, "EACCES", (where) => {
        assert.equal(fs.statSync(p.record).mode & 0o777, 0, `${where}: the record's mode was changed`);
      });
    } finally {
      fs.chmodSync(p.record, 0o644);
    }
    assert.equal(fs.readFileSync(p.record, "utf8"), body, "the unreadable record was rewritten");
  }
});

// --- Gap 6 -----------------------------------------------------------------
// FR-4 table, row "Owned entry present": doctor reads MISSING when SKILL.md
// is gone; doctor --fix restores it. design.md DD-7: never follow a link.

function installThenReshape(t, prefix, name, reshape) {
  const home = mkHome(t, prefix);
  const p = boxPaths(home);
  const inst = grokbot(home, "install");
  assert.equal(inst.status, 0, inst.stderr);
  const entry = path.join(p.workflows, name);
  fs.rmSync(entry, { recursive: true });
  if (reshape(entry, home) === false) return null;
  assert.ok(JSON.parse(fs.readFileSync(p.record, "utf8")).folders.includes(name), "precondition: the entry is owned");
  return { home, p, entry };
}

function assertMissingThenRestored(fx, name, label, sourceFiles) {
  const doc = grokbot(fx.home, "doctor");
  assert.equal(doc.status, 1, doc.stderr);
  assert.match(doc.stdout, new RegExp(`MISSING ${label}\\s*$`, "m"), `doctor must read ${label} as MISSING`);
  assert.doesNotMatch(doc.stdout, new RegExp(`FOREIGN ${label}\\s*$`, "m"));

  const fix = grokbot(fx.home, "doctor", ["--fix"]);
  assert.doesNotMatch(fix.stderr, /^\s+at /m, `doctor --fix crashed:\n${fix.stderr}`);
  assert.match(fix.stdout, new RegExp(`FIXED ${label}\\s*$`, "m"), `doctor --fix must restore ${label}`);
  assert.ok(fs.lstatSync(fx.entry).isDirectory(), `${name} must be a real folder after --fix`);
  assert.deepEqual(listAllFiles(fx.entry), sourceFiles, `${name} file list after --fix`);
}

test("@akili-spec changes/grokbot-target FR-4/FR-5 (Owned entry, odd shape): an owned command entry that is a plain file reads MISSING and --fix restores it", (t) => {
  const name = COMMAND_NAMES.find((n) => n === "akili-quick") || COMMAND_NAMES[0];
  const fx = installThenReshape(t, "akili-gbe-ownfile-", name, (entry) => fs.writeFileSync(entry, "plain\n"));
  assertMissingThenRestored(fx, name, `${name}.md`, ["SKILL.md"]);
});

test("@akili-spec changes/grokbot-target FR-4/FR-5 (Owned entry, odd shape): an owned skill entry that is a dangling symlink reads MISSING; --fix restores it without creating the link target", (t) => {
  let gone;
  const fx = installThenReshape(t, "akili-gbe-owndangle-", "caveman", (entry, home) => {
    fs.mkdirSync(path.join(home, "np"));
    gone = path.join(home, "np", "gone");
    return trySymlink(t, gone, entry);
  });
  if (!fx) return;
  try {
    assertMissingThenRestored(fx, "caveman", "caveman", listAllFiles(path.join(SOURCE_SKILLS, "caveman")));
  } finally {
    assert.equal(fs.existsSync(gone), false, "--fix followed the dangling link and created its target");
  }
});

test("@akili-spec changes/grokbot-target FR-4/FR-5 (Owned entry, odd shape): --fix never writes through an owned symlink to a folder outside the workflows root", (t) => {
  let outside;
  const fx = installThenReshape(t, "akili-gbe-ownlink-", "kaizen", (entry, home) => {
    outside = path.join(home, "outside");
    fs.mkdirSync(outside);
    fs.writeFileSync(path.join(outside, "keep.txt"), "keep\n");
    return trySymlink(t, outside, entry);
  });
  if (!fx) return;
  grokbot(fx.home, "doctor", ["--fix"]);
  assert.deepEqual(listAllFiles(outside), ["keep.txt"], "doctor --fix wrote through the symlink outside the workflows root");
});

// --- Gap 7 -----------------------------------------------------------------

test("@akili-spec changes/grokbot-target FR-4 (Explicit takeover): install --force replaces a foreign plain FILE named like a command with AKILI's folder, records it, leaves no leftover", (t) => {
  const home = mkHome(t, "akili-gbe-takefile-");
  const p = boxPaths(home);
  const cmd = COMMAND_NAMES.find((n) => n === "akili-propose") || COMMAND_NAMES[0];
  fs.mkdirSync(p.workflows, { recursive: true });
  fs.writeFileSync(path.join(p.workflows, cmd), "someone else's file\n");

  const run = grokbot(home, "install", ["--force"]);
  assert.equal(run.status, 0, `${run.stdout}\n${run.stderr}`);
  assert.match(run.stdout, new RegExp(`replace foreign .*${cmd}\\s*$`, "m"));
  const entry = path.join(p.workflows, cmd);
  assert.ok(fs.lstatSync(entry).isDirectory(), "the foreign file must be replaced by a folder");
  assert.deepEqual(listAllFiles(entry), ["SKILL.md"]);
  assert.ok(fs.readFileSync(path.join(entry, "SKILL.md")).equals(fs.readFileSync(path.join(SOURCE_COMMANDS, `${cmd}.md`))));
  assert.ok(JSON.parse(fs.readFileSync(p.record, "utf8")).folders.includes(cmd), `${cmd} must be recorded`);
  const aside = path.join(p.resources, ".takeover");
  assert.deepEqual(fs.existsSync(aside) ? fs.readdirSync(aside) : [], [], "a .takeover leftover remains");
  assert.deepEqual(fs.readdirSync(p.workflows).sort(), ALL_NAMES, "something extra was left in the workflows root");
});

// --- BUG-1 (install side) ---------------------------------------------------

test("@akili-spec changes/grokbot-target FR-4 (Owned entry, odd shape): install --force never writes through an owned command symlink to a folder outside the workflows root", (t) => {
  const name = COMMAND_NAMES.find((n) => n === "akili-quick") || COMMAND_NAMES[0];
  let outside;
  const fx = installThenReshape(t, "akili-gbe-ownlinkinst-", name, (entry, home) => {
    outside = path.join(home, "outside");
    fs.mkdirSync(outside);
    fs.writeFileSync(path.join(outside, "keep.txt"), "keep\n");
    return trySymlink(t, outside, entry);
  });
  if (!fx) return;
  const run = grokbot(fx.home, "install", ["--force"]);
  assert.doesNotMatch(run.stderr, /^\s+at /m, `install --force crashed:\n${run.stderr}`);
  assert.deepEqual(listAllFiles(outside), ["keep.txt"], "install --force wrote through the symlink outside the workflows root");
  assert.ok(fs.lstatSync(fx.entry).isDirectory(), `${name} must be a real folder after install --force`);
  assert.deepEqual(listAllFiles(fx.entry), ["SKILL.md"]);
});

test("@akili-spec changes/grokbot-target FR-4 (Owned entry present, install = skip): plain install leaves an owned command symlink and its outside folder untouched", (t) => {
  const name = COMMAND_NAMES.find((n) => n === "akili-quick") || COMMAND_NAMES[0];
  let outside;
  const fx = installThenReshape(t, "akili-gbe-ownlinkplain-", name, (entry, home) => {
    outside = path.join(home, "outside");
    fs.mkdirSync(outside);
    fs.writeFileSync(path.join(outside, "SKILL.md"), "healthy\n");
    return trySymlink(t, outside, entry);
  });
  if (!fx) return;
  const run = grokbot(fx.home, "install");
  assert.doesNotMatch(run.stderr, /^\s+at /m, `plain install crashed:\n${run.stderr}`);
  assert.ok(fs.lstatSync(fx.entry).isSymbolicLink(), "plain install replaced the owned symlink");
  assert.deepEqual(listAllFiles(outside), ["SKILL.md"]);
  assert.equal(fs.readFileSync(path.join(outside, "SKILL.md"), "utf8"), "healthy\n", "plain install wrote through the symlink");
});
