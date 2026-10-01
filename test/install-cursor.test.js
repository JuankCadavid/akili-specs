"use strict";

// @akili-spec changes/cursor-install-target
//
// Installer tests for Cursor as a fifth install target. Every test below
// drives the real CLI as a subprocess (the test/agents-doctor-io.test.js
// pattern) -- bin/akili.js runs main() on load, so its install/doctor paths
// cannot be exercised by requiring the module directly.
//
// Every spawn pins HOME, USERPROFILE, CODEX_HOME, and CURSOR_CONFIG_DIR to a
// fresh fs.mkdtempSync scratch home (see scratchEnv below) -- never the real
// user's environment, even when a test's own --*-target flags override what
// those env vars would otherwise resolve to.
//
// Coverage by requirement:
//   FR-1 "Auto-detection" scenario, symmetric (test: four-state detection --
//        detect() asserts doctor's own exit status, never reads a crash as
//        "nothing detected"; S1 also asserts the first-run default (claude)
//        is checked and no auto-detected banner prints)
//   FR-2 "Codex and Cursor share one skills root" (tests: shared-root pair,
//        codex-alone vs cursor-alone byte identity, --force end state; the
//        shared-root pair test also asserts no second skills copy lands
//        under the Cursor config home)
//   FR-2 "Skip-by-default and foreign skills" (test: skip/foreign)
//   FR-2 "Dry run and partial installs" (test: dry-run/partials)
//   FR-3 "Healthy install" / "Binary absent" / "Codex doctor unchanged"
//        (tests: doctor healthy, doctor binary-absent, doctor appliesTo
//        filter, doctor codex-baseline byte equality)
//   FR-4 "Shipping targets unchanged" shared-root + detection fixture
//        (same tests as FR-2's shared-root pair and FR-1's four-state
//        detection -- this file is the design's row-10 "T2" test); clause
//        (c) "each tool's resources root exists and the other's does not"
//        gets its own sequential codex-then-cursor test
//   NFR-1 skip-by-default preserved (skip/foreign test)
//   NFR-2 no fork of skill or command content (test: byte identity)
//   NFR-6 no registry refactor / codex doctor unchanged (test: doctor
//        codex-baseline byte equality against test/fixtures/
//        doctor-codex-baseline.txt, compared through normalizeDoctorOutput()
//        so the fixture holds across OS path separators, CRLF checkouts, and
//        version bumps)
//
// Deviation note (routine judgment call -- FR-1 four-state detection test):
// the FR-1 Auto-detection scenario names `akili update` as its example
// command. `akili update` does NOT honor --dry-run before its package-
// manager update step (confirmed live during implementation: with a global
// akili-specs install present, `update --dry-run` ran a REAL
// `npm install -g akili-specs@latest`), and it short-circuits before ever
// reaching resolveTools()/the auto-detected banner whenever the install type
// resolves to "npx" -- the case in any scratch sandbox with no akili-specs
// installed anywhere. So it can never safely or deterministically exercise
// detection in an automated test. `doctor` (no --tool) calls the identical
// resolveTools()/isToolInstalled() path and prints the identical
// "Auto-detected installed target(s):" banner with zero side effects --
// the same substitution scripts/ci/install-layout-regression.js's own
// detection fixture already makes. Used here instead.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { sha256 } = require("../scripts/ci/install-layout-regression.js");

const AKILI_BIN = path.join(__dirname, "..", "bin", "akili.js");
const REPO_ROOT = path.join(__dirname, "..");
const SOURCE_COMMANDS = path.join(REPO_ROOT, ".claude", "commands");
const SOURCE_SKILLS = path.join(REPO_ROOT, ".claude", "skills");
const FIXTURES_DIR = path.join(__dirname, "fixtures");

function stripAnsi(text) {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

// The path/line-ending/version half of the normalizer -- applied to BOTH
// sides of the NFR-6 comparison, never only to the live run: a fixture
// checked out with CRLF (a Windows clone without a line-ending override) or
// read before this spec's Cursor edits existed must normalize the exact same
// way the freshly captured output does, or the two sides silently stop being
// comparable on exactly the platforms NFR-4 requires to stay green.
function normalizePathsLineEndingsAndVersion(text) {
  return text
    .replace(/\\/g, "/")
    .replace(/\r\n/g, "\n")
    .replace(/v\d+\.\d+\.\d+/g, "v<VERSION>");
}

// Normalizes an ANSI-stripped `doctor` run so it can be compared, byte for
// byte, against a baseline captured on a different OS and a different
// package version: <HOME> substitution (caller-supplied, since the scratch
// home differs per run), then the shared paths/line-endings/version pass
// above. Applied identically whether generating the committed fixture or
// reading back a live run at compare time (NFR-6, FR-4); the committed
// fixture text itself is normalized through normalizePathsLineEndingsAndVersion
// alone (no <HOME> substitution needed -- it already reads "<HOME>") right
// before the comparison, so neither side of the assertion is a normalizer
// applied to only one side.
function normalizeDoctorOutput(output, home) {
  return normalizePathsLineEndingsAndVersion(output.split(home).join("<HOME>"));
}

// Registers removal of the scratch home on the owning test's `t` context
// (node:test), so every mkdtempSync home created by this file is cleaned up
// regardless of pass/fail -- pattern: test/agents-doctor-io.test.js:50.
function mkHome(t, prefix) {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  t.after(() => fs.rmSync(home, { recursive: true, force: true }));
  return home;
}

// Every spawn pins all four env vars, per the Leader's brief -- even when a
// test's explicit --*-target flags override what CODEX_HOME/CURSOR_CONFIG_DIR
// would otherwise resolve to, so the real environment can never leak in.
function scratchEnv(home, extra) {
  return Object.assign(
    {},
    process.env,
    {
      HOME: home,
      USERPROFILE: home,
      CODEX_HOME: path.join(home, ".codex-env-unused"),
      CURSOR_CONFIG_DIR: path.join(home, ".cursor-env-unused"),
    },
    extra || {}
  );
}

function runAkili(args, opts) {
  const result = spawnSync(process.execPath, [AKILI_BIN, ...args], {
    encoding: "utf8",
    ...opts,
  });
  return {
    status: result.status,
    stdout: stripAnsi(result.stdout || ""),
    stderr: stripAnsi(result.stderr || ""),
  };
}

function countFiles(dir) {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) count += countFiles(full);
    else if (entry.isFile()) count += 1;
  }
  return count;
}

function listRelativeFiles(dir) {
  const out = [];
  function walk(d) {
    if (!fs.existsSync(d)) return;
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) out.push(path.relative(dir, full).split(path.sep).join("/"));
    }
  }
  walk(dir);
  return out.sort((a, b) => a.localeCompare(b));
}

function findTmpFiles(dir) {
  const out = [];
  function walk(d) {
    if (!fs.existsSync(d)) return;
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith(".tmp")) out.push(full);
    }
  }
  walk(dir);
  return out;
}

// Slice a stripped-ANSI `install` output into per-tool blocks keyed by
// lowercase tool name, from a header line "\nCODEX target: " / "\nCURSOR
// target: " etc, up to the next header or stopMarker.
function toolBlocks(output, stopMarker) {
  const headerRe = /\n([A-Z]+) target: /g;
  const matches = [];
  let m;
  while ((m = headerRe.exec(output))) {
    matches.push({ tool: m[1].toLowerCase(), index: m.index });
  }
  const stopIdx = stopMarker ? output.indexOf(stopMarker) : -1;
  const end = stopIdx === -1 ? output.length : stopIdx;
  const blocks = {};
  matches.forEach((mt, i) => {
    const next = i + 1 < matches.length ? matches[i + 1].index : end;
    blocks[mt.tool] = output.slice(mt.index, next);
  });
  return blocks;
}

function summaryRow(output, tool) {
  const re = new RegExp(`${tool.toUpperCase()}\\s+installed (\\d+) \\| overwritten (\\d+) \\| skipped (\\d+)`);
  const m = re.exec(output);
  assert.notEqual(m, null, `expected an Install/Doctor Summary row for ${tool} in:\n${output}`);
  return { installed: Number(m[1]), overwritten: Number(m[2]), skipped: Number(m[3]) };
}

function autoDetectedList(output) {
  const m = /Auto-detected installed target\(s\):\s*(.+)/.exec(output);
  if (!m) return [];
  return m[1]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// Real packaged content counts (brief: "confirm 199 by counting files under
// .claude/skills -- report the real number and assert it"). A fixed resource
// list (RESOURCE_SCRIPTS + AGENT_TEMPLATES + digests.json + .mcp.json.example,
// bin/akili.js installTool's resources loop) is NOT directory-derived, so it
// stays a literal count rather than a readdir of scripts/templates (which
// hold more files than the installer actually copies).
const COMMAND_COUNT = fs.readdirSync(SOURCE_COMMANDS).filter((f) => f.endsWith(".md")).length;
const SKILL_FILE_COUNT = countFiles(SOURCE_SKILLS);
const SKILL_DIR_COUNT = fs
  .readdirSync(SOURCE_SKILLS, { withFileTypes: true })
  .filter((e) => e.isDirectory()).length;
const SHARED_ROOT_FILE_COUNT = COMMAND_COUNT + SKILL_FILE_COUNT; // real files on disk: 11 + 199 = 210
const RESOURCE_FILE_COUNT = 8; // gsc_verify.py, parse_tests.js, leader/implementer/reviewer/tester.md, digests.json, .mcp.json.example
// The installer's OWN install/skip/overwrite counters (and the printed
// "install "/"skip existing " lines) are per top-level operation, not per
// recursive file: copyDirectoryContents(SOURCE_SKILLS, targetSkills, args)
// loops SOURCE_SKILLS's 24 top-level skill directories and logs/counts once
// per directory (copyTreeSync then copies each directory's files silently,
// recursively, with no further per-file logging) -- pre-existing behavior,
// identical for Claude Code/OpenCode today, not something this spec changed.
// Commands-as-skills and resources ARE logged per actual file (one
// copySingleFile call each), so those two counts stay file-accurate.
const SHARED_ROOT_OPERATION_COUNT = COMMAND_COUNT + SKILL_DIR_COUNT; // 11 + 24 = 35

test(
  "@akili-spec changes/cursor-install-target FR-2/FR-4 (Codex and Cursor share one skills root): Codex installs fresh, Cursor skips every shared-root file while its own resources install",
  (t) => {
    assert.equal(
      SKILL_FILE_COUNT,
      199,
      `expected 199 packaged skill files under .claude/skills; counted ${SKILL_FILE_COUNT} instead -- ` +
        "if the packaged skill set changed, this count (and the shared-root fixtures below) must be updated"
    );
    assert.equal(COMMAND_COUNT, 11, `expected 11 packaged commands under .claude/commands; counted ${COMMAND_COUNT}`);

    const home = mkHome(t, "akili-cursor-shared-");
    const skillsShared = path.join(home, "shared-skills");
    const args = [
      "install",
      "--tool",
      "all",
      "--claude-target",
      path.join(home, "claude-home"),
      "--opencode-target",
      path.join(home, "opencode-home"),
      "--antigravity-target",
      path.join(home, "antigravity-home"),
      "--codex-target",
      path.join(home, "codex-home"),
      "--codex-skills-target",
      skillsShared,
      "--cursor-target",
      path.join(home, "cursor-home"),
      "--cursor-skills-target",
      skillsShared,
    ];

    const run1 = runAkili(args, { cwd: home, env: scratchEnv(home) });
    assert.equal(run1.status, 0, `expected a clean exit; stdout:\n${run1.stdout}\nstderr:\n${run1.stderr}`);

    const blocks = toolBlocks(run1.stdout, "\nInstall Summary");
    assert.ok(blocks.codex, "expected a CODEX target block in the install output");
    assert.ok(blocks.cursor, "expected a CURSOR target block in the install output");

    // The Cursor header names both the config home and the shared skills
    // root (the Codex header form, toolTargetLabel).
    assert.match(
      blocks.cursor,
      /CURSOR target: .*\(skills → .*\)/,
      `expected the Cursor header to read "CURSOR target: <path> (skills → <path>)"; block:\n${blocks.cursor}`
    );

    const codexLines = blocks.codex
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const codexSkip = codexLines.filter((l) => l.startsWith("skip existing "));
    const codexInstall = codexLines.filter((l) => l.startsWith("install "));
    assert.equal(
      codexSkip.length,
      0,
      `expected the Codex block (first writer onto a clean shared root) to skip nothing; block:\n${blocks.codex}`
    );
    assert.equal(
      codexInstall.length,
      SHARED_ROOT_OPERATION_COUNT + RESOURCE_FILE_COUNT,
      `expected Codex to install all ${SHARED_ROOT_OPERATION_COUNT} shared-root operations (${COMMAND_COUNT} command-as-skill files + ${SKILL_DIR_COUNT} skill directories) plus its own ${RESOURCE_FILE_COUNT} resource files`
    );

    const cursorLines = blocks.cursor
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const cursorSkip = cursorLines.filter((l) => l.startsWith("skip existing "));
    const cursorInstall = cursorLines.filter((l) => l.startsWith("install "));
    const cursorOverwrite = cursorLines.filter((l) => l.startsWith("overwrite "));

    assert.equal(cursorOverwrite.length, 0, `expected 0 overwritten in the Cursor block; block:\n${blocks.cursor}`);
    assert.equal(
      cursorSkip.length,
      SHARED_ROOT_OPERATION_COUNT,
      `expected ${SHARED_ROOT_OPERATION_COUNT} skip-existing lines (${COMMAND_COUNT} command SKILL.md files + ${SKILL_DIR_COUNT} skill directories) under the shared root; block:\n${blocks.cursor}`
    );
    assert.ok(
      cursorSkip.every((l) => l.includes(skillsShared)),
      "expected every Cursor skip-existing line to reference the shared skills root"
    );
    assert.equal(
      cursorInstall.length,
      RESOURCE_FILE_COUNT,
      `expected exactly ${RESOURCE_FILE_COUNT} installed lines in the Cursor block (its own, non-shared resources); block:\n${blocks.cursor}`
    );
    assert.ok(
      cursorInstall.every((l) => !l.includes(skillsShared)),
      "expected 0 installed lines under the shared root in the Cursor block -- resources install, the shared root does not"
    );
    assert.equal(
      fs.existsSync(path.join(home, "cursor-home", "skills")),
      false,
      "expected no second copy of any skill under the Cursor config home (e.g. <cursor-home>/skills) -- skills live only in the shared root by default"
    );

    // File-level proof (the "every skill FILE skipped" half of the scenario,
    // not just every top-level directory operation): the shared root holds
    // exactly the real 210 files (11 command SKILL.md + 199 packaged skill
    // files), and the Cursor block rewrote none of them -- content is
    // byte-identical to what the Codex block alone wrote.
    const sharedFileList = listRelativeFiles(skillsShared);
    assert.equal(
      sharedFileList.length,
      SHARED_ROOT_FILE_COUNT,
      `expected exactly ${SHARED_ROOT_FILE_COUNT} real files under the shared root after both blocks ran`
    );
    for (const file of fs.readdirSync(SOURCE_COMMANDS).filter((f) => f.endsWith(".md"))) {
      const cmdName = file.replace(/\.md$/, "");
      assert.equal(
        sha256(path.join(skillsShared, cmdName, "SKILL.md")),
        sha256(path.join(SOURCE_COMMANDS, file)),
        `expected ${cmdName}/SKILL.md under the shared root to be byte-identical to its source after the Cursor block's skip-existing pass`
      );
    }
  }
);

test(
  "@akili-spec changes/cursor-install-target FR-4 (Shipping targets unchanged) clause (c): sequential codex-then-cursor installs sharing one skills root -- each tool's resources root exists only once that tool has installed, the other's stays absent until its own step",
  (t) => {
    const home = mkHome(t, "akili-cursor-exclusivity-");
    const skillsShared = path.join(home, "shared-skills");
    const codexHome = path.join(home, "codex-home");
    const cursorHome = path.join(home, "cursor-home");

    // Step 1: codex alone. Its own resources root exists; Cursor's does not
    // -- Cursor's config home directory has not been touched at all yet.
    const runCodex = runAkili(
      ["install", "--tool", "codex", "--codex-target", codexHome, "--codex-skills-target", skillsShared],
      { cwd: home, env: scratchEnv(home) }
    );
    assert.equal(runCodex.status, 0, `codex-only install failed; stdout:\n${runCodex.stdout}`);
    assert.equal(
      fs.existsSync(path.join(codexHome, "akili")),
      true,
      "expected the Codex resources root to exist after the codex-only step"
    );
    assert.equal(
      fs.existsSync(path.join(cursorHome, "akili")),
      false,
      "expected the Cursor resources root to be absent after the codex-only step (FR-4 clause (c))"
    );

    // Step 2: cursor alone, onto the SAME shared skills root. The shared-root
    // operations (11 command skills + 24 skill directories) are all
    // skip-existing; only Cursor's own 8 resource files install. Codex's
    // resources root is untouched by this step and stays present.
    const runCursor = runAkili(
      ["install", "--tool", "cursor", "--cursor-target", cursorHome, "--cursor-skills-target", skillsShared],
      { cwd: home, env: scratchEnv(home) }
    );
    assert.equal(runCursor.status, 0, `cursor-only install failed; stdout:\n${runCursor.stdout}`);

    const cursorLines = runCursor.stdout
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const cursorSkip = cursorLines.filter((l) => l.startsWith("skip existing ") && l.includes(skillsShared));
    const cursorInstall = cursorLines.filter((l) => l.startsWith("install ") && !l.includes(skillsShared));
    assert.equal(
      cursorSkip.length,
      SHARED_ROOT_OPERATION_COUNT,
      `expected the second install (cursor, onto codex's already-populated shared root) to report ${SHARED_ROOT_OPERATION_COUNT} skip-existing lines under the shared root; stdout:\n${runCursor.stdout}`
    );
    assert.equal(
      cursorInstall.length,
      RESOURCE_FILE_COUNT,
      `expected 0 installed lines under the shared root and exactly ${RESOURCE_FILE_COUNT} installed lines for Cursor's own resources; stdout:\n${runCursor.stdout}`
    );

    assert.equal(
      fs.existsSync(path.join(cursorHome, "akili")),
      true,
      "expected the Cursor resources root to exist after the cursor step"
    );
    assert.equal(
      fs.existsSync(path.join(codexHome, "akili")),
      true,
      "expected the Codex resources root to still exist, untouched by the cursor-only step"
    );
  }
);

test(
  "@akili-spec changes/cursor-install-target FR-2/FR-4 (shared-root fixture): --tool codex alone and --tool cursor alone produce byte-identical skills trees",
  (t) => {
    const codexHome = mkHome(t, "akili-cursor-codexalone-");
    const cursorHome = mkHome(t, "akili-cursor-cursoralone-");
    const codexSkills = path.join(codexHome, "skills");
    const cursorSkills = path.join(cursorHome, "skills");

    const runCodex = runAkili(
      ["install", "--tool", "codex", "--codex-target", path.join(codexHome, "codex-home"), "--codex-skills-target", codexSkills],
      { cwd: codexHome, env: scratchEnv(codexHome) }
    );
    assert.equal(runCodex.status, 0, `codex-alone install failed; stdout:\n${runCodex.stdout}`);

    const runCursor = runAkili(
      ["install", "--tool", "cursor", "--cursor-target", path.join(cursorHome, "cursor-home"), "--cursor-skills-target", cursorSkills],
      { cwd: cursorHome, env: scratchEnv(cursorHome) }
    );
    assert.equal(runCursor.status, 0, `cursor-alone install failed; stdout:\n${runCursor.stdout}`);

    const codexFiles = listRelativeFiles(codexSkills);
    const cursorFiles = listRelativeFiles(cursorSkills);
    assert.deepEqual(
      cursorFiles,
      codexFiles,
      "expected the sorted relative file lists of the two skills trees to be identical"
    );

    for (const rel of codexFiles) {
      assert.equal(
        sha256(path.join(cursorSkills, rel)),
        sha256(path.join(codexSkills, rel)),
        `expected byte-identical content at ${rel} between the codex-alone and cursor-alone skills trees`
      );
    }
  }
);

test(
  "@akili-spec changes/cursor-install-target FR-2 (shared root, --force): a shared Codex+Cursor home converges to a single-target end state with zero *.tmp leftovers",
  (t) => {
    const home = mkHome(t, "akili-cursor-force-");
    const skillsShared = path.join(home, "shared-skills");
    const args = [
      "install",
      "--tool",
      "all",
      "--claude-target",
      path.join(home, "claude-home"),
      "--opencode-target",
      path.join(home, "opencode-home"),
      "--antigravity-target",
      path.join(home, "antigravity-home"),
      "--codex-target",
      path.join(home, "codex-home"),
      "--codex-skills-target",
      skillsShared,
      "--cursor-target",
      path.join(home, "cursor-home"),
      "--cursor-skills-target",
      skillsShared,
    ];

    let run = runAkili(args, { cwd: home, env: scratchEnv(home) });
    assert.equal(run.status, 0, `first install failed; stdout:\n${run.stdout}`);

    run = runAkili([...args, "--force"], { cwd: home, env: scratchEnv(home) });
    assert.equal(run.status, 0, `--force re-run failed; stdout:\n${run.stdout}`);

    assert.deepEqual(
      findTmpFiles(home),
      [],
      "expected zero *.tmp files anywhere in the shared home after --force"
    );

    const refHome = mkHome(t, "akili-cursor-force-ref-");
    const refSkills = path.join(refHome, "skills");
    const refRun = runAkili(
      ["install", "--tool", "cursor", "--cursor-target", path.join(refHome, "cursor-home"), "--cursor-skills-target", refSkills],
      { cwd: refHome, env: scratchEnv(refHome) }
    );
    assert.equal(refRun.status, 0, `reference single-target install failed; stdout:\n${refRun.stdout}`);

    const sharedFiles = listRelativeFiles(skillsShared);
    const refFiles = listRelativeFiles(refSkills);
    assert.deepEqual(
      sharedFiles,
      refFiles,
      "expected the shared root's post---force end state to match a single-target install's file list"
    );
    for (const rel of refFiles) {
      assert.equal(
        sha256(path.join(skillsShared, rel)),
        sha256(path.join(refSkills, rel)),
        `expected byte-identical content at ${rel} between the post---force shared root and a single-target install`
      );
    }
  }
);

test(
  "@akili-spec changes/cursor-install-target FR-2 (Skip-by-default and foreign skills), NFR-1: second install without --force skips every existing file, foreign content stays byte-unchanged, doctor still exits 0",
  (t) => {
    const home = mkHome(t, "akili-cursor-foreign-");
    const cursorHome = path.join(home, "cursor-home");
    const cursorSkills = path.join(home, "skills");
    const baseArgs = ["--tool", "cursor", "--cursor-target", cursorHome, "--cursor-skills-target", cursorSkills];

    const run1 = runAkili(["install", ...baseArgs], { cwd: home, env: scratchEnv(home) });
    assert.equal(run1.status, 0, `first install failed; stdout:\n${run1.stdout}`);

    const tddSkill = path.join(cursorSkills, "tdd", "SKILL.md");
    const gsapSkill = path.join(cursorSkills, "gsap-animation", "SKILL.md");
    assert.equal(fs.existsSync(tddSkill), true, "precondition: tdd/SKILL.md must exist after the first install");
    assert.equal(
      fs.existsSync(gsapSkill),
      true,
      "precondition: gsap-animation/SKILL.md must exist after the first install"
    );

    const foreignTdd = "FOREIGN: not the packaged tdd skill\n";
    const foreignGsap = "FOREIGN: not the packaged gsap-animation skill\n";
    fs.writeFileSync(tddSkill, foreignTdd);
    fs.writeFileSync(gsapSkill, foreignGsap);

    const run2 = runAkili(["install", ...baseArgs], { cwd: home, env: scratchEnv(home) });
    assert.equal(run2.status, 0, `second install failed; stdout:\n${run2.stdout}`);

    const row = summaryRow(run2.stdout, "cursor");
    assert.equal(row.installed, 0, "expected 0 installed on the second run (every file already exists)");
    assert.equal(row.overwritten, 0, "expected 0 overwritten without --force");
    assert.equal(
      row.skipped,
      SHARED_ROOT_OPERATION_COUNT + RESOURCE_FILE_COUNT,
      "expected every operation (command-as-skill files + skill directories + resource files) to be reported skipped"
    );

    assert.equal(fs.readFileSync(tddSkill, "utf8"), foreignTdd, "expected tdd/SKILL.md to stay byte-unchanged");
    assert.equal(
      fs.readFileSync(gsapSkill, "utf8"),
      foreignGsap,
      "expected gsap-animation/SKILL.md to stay byte-unchanged"
    );
    assert.equal(fs.existsSync(tddSkill), true, "expected tdd/SKILL.md to not be deleted");
    assert.equal(fs.existsSync(gsapSkill), true, "expected gsap-animation/SKILL.md to not be deleted");

    const doctorRun = runAkili(["doctor", ...baseArgs], { cwd: home, env: scratchEnv(home) });
    assert.equal(doctorRun.status, 0, `expected doctor --tool cursor to exit 0; stdout:\n${doctorRun.stdout}`);
  }
);

test(
  "@akili-spec changes/cursor-install-target FR-2 (Dry run and partial installs): --dry-run writes zero files, --commands-only / --skills-only each install exactly their own set, no commands/ dir anywhere",
  (t) => {
    const dryHome = mkHome(t, "akili-cursor-dryrun-");
    const dryCursorHome = path.join(dryHome, "cursor-home");
    const dryCursorSkills = path.join(dryHome, "skills");
    const dryRun = runAkili(
      ["install", "--tool", "cursor", "--dry-run", "--cursor-target", dryCursorHome, "--cursor-skills-target", dryCursorSkills],
      { cwd: dryHome, env: scratchEnv(dryHome) }
    );
    assert.equal(dryRun.status, 0, `dry-run failed; stdout:\n${dryRun.stdout}`);
    assert.equal(countFiles(dryHome), 0, "expected --dry-run to write zero files");
    assert.ok(
      dryRun.stdout.includes(path.join("akili-execute", "SKILL.md")),
      `expected the dry-run listing to name a command-as-skill path (akili-execute${path.sep}SKILL.md); stdout:\n${dryRun.stdout}`
    );
    assert.equal(
      fs.existsSync(path.join(dryCursorSkills, "commands")),
      false,
      'expected no literal "commands" directory under the skills root in dry-run mode'
    );

    const cmdHome = mkHome(t, "akili-cursor-cmdonly-");
    const cmdCursorHome = path.join(cmdHome, "cursor-home");
    const cmdCursorSkills = path.join(cmdHome, "skills");
    const cmdRun = runAkili(
      ["install", "--tool", "cursor", "--commands-only", "--cursor-target", cmdCursorHome, "--cursor-skills-target", cmdCursorSkills],
      { cwd: cmdHome, env: scratchEnv(cmdHome) }
    );
    assert.equal(cmdRun.status, 0, `--commands-only install failed; stdout:\n${cmdRun.stdout}`);
    assert.equal(
      countFiles(cmdCursorSkills),
      COMMAND_COUNT,
      `expected exactly ${COMMAND_COUNT} SKILL.md files (commands-as-skills) under --commands-only`
    );
    assert.equal(
      fs.existsSync(path.join(cmdCursorHome, "akili")),
      false,
      "expected --commands-only to write no resources"
    );
    assert.equal(
      fs.existsSync(path.join(cmdCursorSkills, "commands")),
      false,
      'expected no literal "commands" directory under the skills root in --commands-only mode'
    );

    const skillsHome = mkHome(t, "akili-cursor-skillsonly-");
    const skillsCursorHome = path.join(skillsHome, "cursor-home");
    const skillsCursorSkills = path.join(skillsHome, "skills");
    const skillsRun = runAkili(
      ["install", "--tool", "cursor", "--skills-only", "--cursor-target", skillsCursorHome, "--cursor-skills-target", skillsCursorSkills],
      { cwd: skillsHome, env: scratchEnv(skillsHome) }
    );
    assert.equal(skillsRun.status, 0, `--skills-only install failed; stdout:\n${skillsRun.stdout}`);
    const skillDirEntries = fs.readdirSync(skillsCursorSkills, { withFileTypes: true }).filter((e) => e.isDirectory());
    assert.equal(
      skillDirEntries.length,
      SKILL_DIR_COUNT,
      `expected exactly ${SKILL_DIR_COUNT} skill dirs under --skills-only`
    );
    assert.equal(
      skillDirEntries.some((e) => e.name.startsWith("akili-")),
      false,
      "expected no akili-* command-as-skill dir under --skills-only"
    );
    assert.equal(
      fs.existsSync(path.join(skillsCursorHome, "akili")),
      false,
      "expected --skills-only to write no resources"
    );
    assert.equal(
      fs.existsSync(path.join(skillsCursorSkills, "commands")),
      false,
      'expected no literal "commands" directory under the skills root in --skills-only mode'
    );
  }
);

test(
  "@akili-spec changes/cursor-install-target FR-1 (Auto-detection scenario, symmetric DD-2): four-state detection holds from defaults, no flags",
  (t) => {
    const home = mkHome(t, "akili-cursor-detect-");
    const codexHome = path.join(home, ".codex");
    const cursorHome = path.join(home, ".cursor");
    const skillsRoot = path.join(home, ".agents", "skills");
    fs.mkdirSync(skillsRoot, { recursive: true });

    const env = scratchEnv(home, { CODEX_HOME: codexHome, CURSOR_CONFIG_DIR: cursorHome });

    // Pre-install a REAL, complete `claude` target (the default target, no
    // --claude-target flag -- it resolves against HOME exactly as a bare
    // `akili doctor` would) so S1's fallback-to-claude check below runs
    // against a genuinely healthy install. Without this, `doctor`'s
    // claude block would report its full 43-file set MISSING (nothing was
    // ever installed there) and legitimately exit 1 -- NOT a crash, just an
    // accurate report -- which would make a blanket "exit 0" assertion
    // false on a correct, un-broken CLI. Installing claude first makes
    // "exit 0" the true, meaningful signal the falsifier below expects:
    // S2/S3/S4 deliberately leave codex/cursor only marker-installed (that
    // is what they test), so `doctor`'s overall exit code legitimately stays
    // 1 there regardless of detection correctness -- the status assertion
    // is scoped to S1 only, below, where the clean premise holds.
    const claudeInstall = runAkili(["install", "--tool", "claude"], { cwd: home, env });
    assert.equal(
      claudeInstall.status,
      0,
      `precondition: expected the claude pre-install to succeed; stdout:\n${claudeInstall.stdout}`
    );

    function detect() {
      const result = runAkili(["doctor"], { cwd: home, env });
      return { list: autoDetectedList(result.stdout), stdout: result.stdout, status: result.status };
    }

    // S1 -- foreign-only shared root: neither codex nor cursor.
    fs.mkdirSync(path.join(skillsRoot, "tdd"), { recursive: true });
    fs.writeFileSync(path.join(skillsRoot, "tdd", "SKILL.md"), "# tdd\nForeign/unrelated content for this fixture.\n");
    const s1 = detect();
    assert.equal(s1.list.includes("codex"), false, `S1: expected codex NOT detected; got [${s1.list.join(", ")}]`);
    assert.equal(s1.list.includes("cursor"), false, `S1: expected cursor NOT detected; got [${s1.list.join(", ")}]`);
    // FR-1 Auto-detection: "AND IT MUST keep the first-run default (claude)
    // when nothing is detected". resolveTools() only sets args.autoDetected
    // (and prints the banner) when detectInstalledTools() finds something
    // OTHER than exactly the single default target; with codex/cursor
    // undetected and claude pre-installed (the precondition above), it is
    // the isJustDefault collapse -- not an empty detection -- that suppresses
    // the banner, exactly mirroring a brand-new machine with nothing
    // installed at all. The exit-status assertion is the falsifiable half:
    // a `doctor` that crashed (e.g. a broken AKILI_BIN path, MODULE_NOT_FOUND)
    // would read here as [] "nothing detected" same as a clean run, and this
    // is the only one of the four calls where the true-positive exit code is
    // known to be exactly 0 (claude healthy; codex/cursor correctly absent).
    assert.equal(
      s1.status,
      0,
      `S1: expected doctor to exit 0 (claude pre-installed and healthy, codex/cursor correctly undetected); a non-zero exit here must not be read as "nothing detected". stdout:\n${s1.stdout}`
    );
    assert.doesNotMatch(
      s1.stdout,
      /Auto-detected installed target\(s\)/,
      `S1: expected no auto-detected banner when nothing but the pre-installed default (claude) matches; stdout:\n${s1.stdout}`
    );
    assert.match(
      s1.stdout,
      /Checking CLAUDE:/,
      `S1: expected the first-run default (claude) to be checked when nothing else is detected; stdout:\n${s1.stdout}`
    );

    // S2 -- + akili-execute/SKILL.md: Codex detected, Cursor not (existing
    // assertion, unchanged). `doctor`'s overall exit code goes to 1 here
    // (codex is deliberately marker-only, not fully installed) -- expected,
    // not asserted; only detection membership is checked.
    fs.mkdirSync(path.join(skillsRoot, "akili-execute"), { recursive: true });
    fs.writeFileSync(path.join(skillsRoot, "akili-execute", "SKILL.md"), "# akili-execute\n");
    const s2 = detect();
    assert.equal(s2.list.includes("codex"), true, `S2: expected codex detected; got [${s2.list.join(", ")}]`);
    assert.equal(s2.list.includes("cursor"), false, `S2: expected cursor NOT detected; got [${s2.list.join(", ")}]`);

    // S3 -- + <cursor-home>/akili/templates/leader.md: Cursor detected,
    // Codex NOT (DD-2's symmetric guard: Codex's shared command-skill probe
    // stops counting once a sibling tenant's resources root is populated).
    const cursorResources = path.join(cursorHome, "akili", "templates");
    fs.mkdirSync(cursorResources, { recursive: true });
    fs.writeFileSync(path.join(cursorResources, "leader.md"), "# leader\n");
    const s3 = detect();
    assert.equal(s3.list.includes("cursor"), true, `S3: expected cursor detected; got [${s3.list.join(", ")}]`);
    assert.equal(
      s3.list.includes("codex"),
      false,
      `S3: expected codex NOT detected (DD-2 guard); got [${s3.list.join(", ")}]`
    );

    // S4 -- + <codex-home>/akili/templates/leader.md: both detected.
    const codexResources = path.join(codexHome, "akili", "templates");
    fs.mkdirSync(codexResources, { recursive: true });
    fs.writeFileSync(path.join(codexResources, "leader.md"), "# leader\n");
    const s4 = detect();
    assert.equal(s4.list.includes("codex"), true, `S4: expected codex detected; got [${s4.list.join(", ")}]`);
    assert.equal(s4.list.includes("cursor"), true, `S4: expected cursor detected; got [${s4.list.join(", ")}]`);
  }
);

test(
  "@akili-spec changes/cursor-install-target FR-3 (Healthy install scenario): doctor --tool cursor reports all OK/HEALTHY and exits 0",
  (t) => {
    const home = mkHome(t, "akili-cursor-doctor-healthy-");
    const cursorHome = path.join(home, "cursor-home");
    const cursorSkills = path.join(home, "skills");
    const baseArgs = ["--tool", "cursor", "--cursor-target", cursorHome, "--cursor-skills-target", cursorSkills];

    const install = runAkili(["install", ...baseArgs], { cwd: home, env: scratchEnv(home) });
    assert.equal(install.status, 0, `install failed; stdout:\n${install.stdout}`);

    const doc = runAkili(["doctor", ...baseArgs], { cwd: home, env: scratchEnv(home) });
    assert.equal(doc.status, 0, `expected a clean exit; stdout:\n${doc.stdout}`);
    assert.doesNotMatch(doc.stdout, /MISSING/, `expected no MISSING rows; stdout:\n${doc.stdout}`);
    assert.match(doc.stdout, /CURSOR\s+HEALTHY/, `expected the Doctor Summary row to read HEALTHY; stdout:\n${doc.stdout}`);
  }
);

test(
  "@akili-spec changes/cursor-install-target FR-3 (Binary absent scenario): doctor --tool cursor reports NOT FOUND cursor-agent, names the agent alias and both install commands, never fails the run",
  (t) => {
    const home = mkHome(t, "akili-cursor-doctor-nobinary-");
    const cursorHome = path.join(home, "cursor-home");
    const cursorSkills = path.join(home, "skills");
    const baseArgs = ["--tool", "cursor", "--cursor-target", cursorHome, "--cursor-skills-target", cursorSkills];

    const install = runAkili(["install", ...baseArgs], { cwd: home, env: scratchEnv(home) });
    assert.equal(install.status, 0, `install failed; stdout:\n${install.stdout}`);

    // Empty PATH (the same approach the NFR-6 baseline test uses, not the
    // node-binary-directory approach): a `cursor-agent` shim installed
    // beside node (e.g. an nvm/volta shim directory) would make
    // path.dirname(process.execPath) resolve it anyway and red this test for
    // the wrong reason. spawnSync already launches node by its absolute
    // process.execPath, so an empty/bogus PATH cannot break the spawn itself
    // -- only the child CLI's own `cursor-agent --version` lookup.
    const doc = runAkili(["doctor", ...baseArgs], {
      cwd: home,
      env: scratchEnv(home, { PATH: "/akili-empty-path-xyz", Path: "/akili-empty-path-xyz" }),
    });
    assert.equal(doc.status, 0, `expected the missing recommended binary to never fail the run; stdout:\n${doc.stdout}`);
    assert.match(doc.stdout, /NOT FOUND cursor-agent/, `expected a NOT FOUND cursor-agent row; stdout:\n${doc.stdout}`);
    assert.match(doc.stdout, /\bagent\b/, "expected the row's text to name the agent alias");
    const installMentions = (doc.stdout.match(/cursor\.com\/install/g) || []).length;
    assert.equal(
      installMentions,
      2,
      `expected both cursor.com/install commands (macOS/Linux curl and Windows irm) to be named; stdout:\n${doc.stdout}`
    );
    assert.match(doc.stdout, /missing 0/, "expected missing 0 for cursor (env rows never count toward missing)");
  }
);

test(
  "@akili-spec changes/cursor-install-target FR-3 (appliesTo filter): doctor --tool claude never prints a cursor-agent row",
  (t) => {
    const home = mkHome(t, "akili-cursor-doctor-claude-");
    const claudeHome = path.join(home, "claude-home");
    const install = runAkili(["install", "--tool", "claude", "--claude-target", claudeHome], {
      cwd: home,
      env: scratchEnv(home),
    });
    assert.equal(install.status, 0, `install failed; stdout:\n${install.stdout}`);

    const doc = runAkili(["doctor", "--tool", "claude", "--claude-target", claudeHome], {
      cwd: home,
      env: scratchEnv(home),
    });
    assert.equal(doc.status, 0, `expected a clean exit; stdout:\n${doc.stdout}`);
    assert.doesNotMatch(doc.stdout, /cursor-agent/, `expected no cursor-agent row for --tool claude; stdout:\n${doc.stdout}`);
  }
);

// NFR-6 Codex regression. The committed fixture (test/fixtures/
// doctor-codex-baseline.txt) was generated once, during implementation, from
// the PRE-CHANGE CLI at commit 7cd681a: `git worktree add --detach <tmp-wt>
// 7cd681a` (confirmed `git -C <tmp-wt> rev-parse --short HEAD` -> 7cd681a),
// then `<tmp-wt>/bin/akili.js install --tool codex` followed by `doctor
// --tool codex` into a scratch home with PATH="/akili-empty-path-xyz" (so the
// Environment section's codegraph/playwright-cli/codex rows read a
// deterministic NOT FOUND regardless of what happens to be globally
// installed on whichever machine runs this test), ANSI-stripped, then run
// through this file's own normalizeDoctorOutput() -- <HOME> substitution,
// backslash-to-forward-slash, CRLF-to-LF, and the "Doctor Summary" version
// string masked to "v<VERSION>" -- so the committed fixture compares equal
// regardless of the CI runner's OS, line-ending checkout, or the package
// version at compare time. The worktree was then removed (`git worktree
// remove --force <tmp-wt>`). This test reproduces the exact same procedure
// against the CURRENT CLI and asserts byte equality through the same
// normalizer.
test(
  "@akili-spec changes/cursor-install-target FR-3 (Codex doctor unchanged), NFR-6: doctor --tool codex output matches the pre-change (7cd681a) baseline byte-for-byte",
  (t) => {
    // No --codex-target/--codex-skills-target flags here: the committed
    // fixture was generated from the CODEX_HOME env var + the default skills
    // root (<HOME>/.codex and <HOME>/.agents/skills), exactly as a bare
    // `akili install --tool codex` resolves them -- not from arbitrarily
    // named --target flags, which would normalize to a different path shape.
    const home = mkHome(t, "akili-cursor-doctor-codexbaseline-");
    const baseArgs = ["--tool", "codex"];
    const baselineEnv = scratchEnv(home, { CODEX_HOME: path.join(home, ".codex") });

    const install = runAkili(["install", ...baseArgs], { cwd: home, env: baselineEnv });
    assert.equal(install.status, 0, `install failed; stdout:\n${install.stdout}`);

    const doc = runAkili(["doctor", ...baseArgs], {
      cwd: home,
      env: Object.assign({}, baselineEnv, { PATH: "/akili-empty-path-xyz", Path: "/akili-empty-path-xyz" }),
    });
    assert.equal(doc.status, 0, `expected a clean exit; stdout:\n${doc.stdout}`);

    const normalized = normalizeDoctorOutput(doc.stdout, home);
    // The fixture file itself passes through the SAME paths/line-endings/
    // version normalizer before comparing -- never compared raw -- so a
    // CRLF checkout of the fixture (no override in place) cannot red this
    // test on Windows for a reason unrelated to the behavior under test.
    const fixtureRaw = fs.readFileSync(path.join(FIXTURES_DIR, "doctor-codex-baseline.txt"), "utf8");
    const fixture = normalizePathsLineEndingsAndVersion(fixtureRaw);
    assert.equal(
      normalized,
      fixture,
      "expected doctor --tool codex output (ANSI-stripped, <HOME>-substituted, backslash/CRLF/version-normalized) to be byte-identical to the 7cd681a baseline fixture (test/fixtures/doctor-codex-baseline.txt)"
    );
  }
);

test(
  "@akili-spec changes/cursor-install-target NFR-2 (no fork of skill or command content): installed Cursor command-as-skill and packaged-skill files are byte-identical to their .claude sources",
  (t) => {
    const home = mkHome(t, "akili-cursor-byteid-");
    const cursorHome = path.join(home, "cursor-home");
    const cursorSkills = path.join(home, "skills");
    const install = runAkili(
      ["install", "--tool", "cursor", "--cursor-target", cursorHome, "--cursor-skills-target", cursorSkills],
      { cwd: home, env: scratchEnv(home) }
    );
    assert.equal(install.status, 0, `install failed; stdout:\n${install.stdout}`);

    for (const file of fs.readdirSync(SOURCE_COMMANDS)) {
      if (!file.endsWith(".md")) continue;
      const cmdName = file.replace(/\.md$/, "");
      const installedPath = path.join(cursorSkills, cmdName, "SKILL.md");
      assert.equal(fs.existsSync(installedPath), true, `expected ${installedPath} to exist`);
      assert.equal(
        sha256(installedPath),
        sha256(path.join(SOURCE_COMMANDS, file)),
        `expected ${installedPath} to be byte-identical to .claude/commands/${file}`
      );
    }

    const skillNames = fs
      .readdirSync(SOURCE_SKILLS, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
    for (const skill of skillNames) {
      const sourceDir = path.join(SOURCE_SKILLS, skill);
      const installedDir = path.join(cursorSkills, skill);
      const sourceFiles = listRelativeFiles(sourceDir);
      const installedFiles = listRelativeFiles(installedDir);
      assert.deepEqual(
        installedFiles,
        sourceFiles,
        `expected ${installedDir} to carry the same file list as ${sourceDir}`
      );
      for (const rel of sourceFiles) {
        assert.equal(
          sha256(path.join(installedDir, rel)),
          sha256(path.join(sourceDir, rel)),
          `expected byte-identical content at ${skill}/${rel}`
        );
      }
    }
  }
);

// Exported so the one-off baseline-regeneration step (run from a detached
// worktree at a pinned commit, never from this working tree) applies the
// exact same normalizer this file compares against -- never a hand-edit.
module.exports = { normalizeDoctorOutput, normalizePathsLineEndingsAndVersion };
