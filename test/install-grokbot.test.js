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
