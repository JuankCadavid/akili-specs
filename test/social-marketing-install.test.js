"use strict";

// @akili-spec changes/akili-marketing (Tester, integration suite)
//
// FR-1 *Attribution survives install*: `akili install --tool all` into an empty
// HOME, then every host skill root holds `social-marketing/` with SKILL.md,
// LICENSE and every reference file, byte-identical to the package source; and
// the `akili-marketing` command lands on every host that receives commands, in
// that host's form (a `.md` command / workflow, or `<name>/SKILL.md` on the
// command-as-skill hosts). No host transforms either payload today, so the
// invariant asserted is byte equality everywhere.
//
// Every spawn pins HOME, USERPROFILE, CODEX_HOME, CURSOR_CONFIG_DIR and
// AKILI_GROKBOT_TARGET to the scratch home (the test/install-grokbot.test.js
// pattern), so no run can write into the real home or /home/box. `--tool all`
// covers five hosts; Grok Bot is not in `all` (grokbot-target FR-1), so it gets
// its own `--tool grokbot` run below.
//
// Expected roots and file names are literals (copied from the installer's
// observed layout at eb35099) -- reading them from the tree under test would
// assert the tree against itself. A discovery cross-check then fails if the
// installer starts writing a skill or command root this list does not name.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const REPO_ROOT = path.join(__dirname, "..");
const AKILI_BIN = path.join(REPO_ROOT, "bin", "akili.js");
const SKILL_SRC = path.join(REPO_ROOT, ".claude", "skills", "social-marketing");
const COMMAND_SRC = path.join(REPO_ROOT, ".claude", "commands", "akili-marketing.md");

const EXPECTED_FILES = [
  "LICENSE",
  "SKILL.md",
  "references/brand-voice-template.md",
  "references/facebook.md",
  "references/hook-formulas.md",
  "references/humanizer.md",
  "references/instagram.md",
  "references/linkedin.md",
  "references/planning-and-calendar.md",
  "references/repurposing.md",
  "references/untrusted-content.md",
  "references/voice-rules.md",
];

// Skill roots `--tool all` writes under a default-layout HOME.
const SKILL_ROOTS = [
  ".agents/skills", // Codex + Cursor shared root
  ".claude/skills",
  ".config/opencode/skills",
  ".gemini/antigravity-cli/skills",
  ".gemini/config/skills",
  ".gemini/skills",
];

// Hosts that receive commands as `<name>.md` files.
const COMMAND_FILE_DIRS = [
  ".claude/commands",
  ".config/opencode/commands",
  ".gemini/antigravity-cli/global_workflows",
  ".gemini/antigravity-cli/workflows",
  ".gemini/antigravity/global_workflows",
];

// Hosts that receive commands as `<name>/SKILL.md` (command-as-skill).
const COMMAND_SKILL_ROOTS = [".agents/skills", ".gemini/antigravity-cli/skills", ".gemini/config/skills", ".gemini/skills"];

function mkHome(t, prefix) {
  const home = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix)));
  t.after(() => fs.rmSync(home, { recursive: true, force: true }));
  return home;
}

function scratchEnv(home) {
  return Object.assign({}, process.env, {
    HOME: home,
    USERPROFILE: home,
    CODEX_HOME: path.join(home, ".codex"),
    CURSOR_CONFIG_DIR: path.join(home, ".cursor"),
    AKILI_GROKBOT_TARGET: path.join(home, "grokbot-unused", "workflows"),
  });
}

function runAkili(args, home) {
  const r = spawnSync(process.execPath, [AKILI_BIN, ...args], { cwd: home, env: scratchEnv(home), encoding: "utf8" });
  return { status: r.status, stdout: r.stdout || "", stderr: r.stderr || "" };
}

function listTree(dir, prefix = "") {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (_) {
    return [];
  }
  const out = [];
  for (const e of entries) {
    const rel = prefix ? prefix + "/" + e.name : e.name;
    if (e.isDirectory()) out.push(...listTree(path.join(dir, e.name), rel));
    else out.push(rel);
  }
  return out.sort();
}

function walkDirs(dir, prefix = "") {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const rel = prefix ? prefix + "/" + e.name : e.name;
    out.push(rel, ...walkDirs(path.join(dir, e.name), rel));
  }
  return out;
}

function assertSkillPayload(root, label) {
  const installed = path.join(root, "social-marketing");
  assert.deepEqual(listTree(installed), EXPECTED_FILES, `${label}: social-marketing/ file set`);
  for (const f of EXPECTED_FILES) {
    const a = fs.readFileSync(path.join(SKILL_SRC, f));
    const b = fs.readFileSync(path.join(installed, f));
    assert.ok(a.equals(b), `${label}: ${f} is byte-identical to the package source`);
  }
}

function assertCommandFile(file, label) {
  assert.ok(fs.existsSync(file), `${label}: expected ${file}`);
  assert.ok(fs.readFileSync(COMMAND_SRC).equals(fs.readFileSync(file)), `${label}: command is byte-identical`);
}

test("@akili-spec changes/akili-marketing FR-1 (Attribution survives install): --tool all lands social-marketing byte-identical in every host skill root", (t) => {
  // Guard against a source-side regression masking an install-side one.
  assert.deepEqual(listTree(SKILL_SRC), EXPECTED_FILES, "package source file set");

  const home = mkHome(t, "akili-sm-all-");
  const run = runAkili(["install", "--tool", "all"], home);
  assert.equal(run.status, 0, `install --tool all failed:\n${run.stdout}\n${run.stderr}`);

  for (const rel of SKILL_ROOTS) assertSkillPayload(path.join(home, rel), rel);

  // Discovery cross-check: every directory the installer filled with packaged
  // skills (marked by `kaizen/SKILL.md`) is in SKILL_ROOTS, and vice versa.
  const discovered = walkDirs(home)
    .filter((d) => fs.existsSync(path.join(home, d, "kaizen", "SKILL.md")))
    .sort();
  assert.deepEqual(discovered, [...SKILL_ROOTS].sort(), "every host skill root the installer wrote is checked");

  // BUT it must NOT write Grok Bot: it is not part of `all`.
  assert.equal(fs.existsSync(path.join(home, "grokbot-unused")), false, "--tool all must not write the Grok Bot root");
});

test("@akili-spec changes/akili-marketing FR-1/FR-12 (command lands on every host): --tool all installs akili-marketing byte-identical in each host's command form", (t) => {
  const home = mkHome(t, "akili-am-all-");
  const run = runAkili(["install", "--tool", "all"], home);
  assert.equal(run.status, 0, `install --tool all failed:\n${run.stdout}\n${run.stderr}`);

  for (const rel of COMMAND_FILE_DIRS) assertCommandFile(path.join(home, rel, "akili-marketing.md"), rel);
  for (const rel of COMMAND_SKILL_ROOTS) {
    const dir = path.join(home, rel, "akili-marketing");
    assert.deepEqual(listTree(dir), ["SKILL.md"], `${rel}: akili-marketing/ holds only SKILL.md`);
    assertCommandFile(path.join(dir, "SKILL.md"), rel);
  }

  // Discovery cross-check: wherever a sibling command landed (marked by
  // akili-archive), akili-marketing landed too, and nowhere else is unlisted.
  const fileHosts = walkDirs(home).filter((d) => fs.existsSync(path.join(home, d, "akili-archive.md"))).sort();
  assert.deepEqual(fileHosts, [...COMMAND_FILE_DIRS].sort(), "every command-file host is checked");
  const skillHosts = walkDirs(home)
    .filter((d) => fs.existsSync(path.join(home, d, "akili-archive", "SKILL.md")))
    .sort();
  assert.deepEqual(skillHosts, [...COMMAND_SKILL_ROOTS].sort(), "every command-as-skill host is checked");
});

test("@akili-spec changes/akili-marketing FR-1 (Attribution survives install, Grok Bot): --tool grokbot lands social-marketing and the command skill byte-identical", (t) => {
  const home = mkHome(t, "akili-sm-gb-");
  const workflows = path.join(home, "gb", "workflows");
  const run = runAkili(["install", "--tool", "grokbot", "--grokbot-target", workflows], home);
  assert.equal(run.status, 0, `install --tool grokbot failed:\n${run.stdout}\n${run.stderr}`);

  assertSkillPayload(workflows, "grokbot");
  assert.deepEqual(listTree(path.join(workflows, "akili-marketing")), ["SKILL.md"]);
  assertCommandFile(path.join(workflows, "akili-marketing", "SKILL.md"), "grokbot");
  // Grok Bot is box-only: no commands/ directory is written.
  assert.equal(fs.existsSync(path.join(workflows, "commands")), false);
});
