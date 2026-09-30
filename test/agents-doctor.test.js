"use strict";

// FR-3 / FR-9: parser, section states, and the report's exit-code rule.
// Pure-function tests only (design §7: bin/persona.js has no I/O). Until T5
// lands digests.json, each test supplies its own fixture digest table.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const { parsePersona, normalizeBody, hashBody, sectionStates, resultExitCode } = require("../bin/persona.js");

const FIXTURES_DIR = path.join(__dirname, "fixtures", "personas");
const TEMPLATE_PATH = path.join(__dirname, "..", ".claude", "templates", "implementer.md");

function loadFixture(name) {
  return fs.readFileSync(path.join(FIXTURES_DIR, name), "utf8");
}

const templateText = fs.readFileSync(TEMPLATE_PATH, "utf8");
const template = parsePersona(templateText);

// Wraps sectionStates so a stubbed throw is caught here and turned into a
// value whose fields fail the real assertions below (rather than aborting the
// test before it reaches them) — see the falsifier/red-run note in the task
// report for why this indirection exists.
function computeStates(personaText, digests) {
  try {
    const persona = personaText === null ? null : parsePersona(personaText);
    return sectionStates(persona, template, digests || {});
  } catch (err) {
    return { status: "error", error: err.message, sections: [] };
  }
}

function stateOf(result, id) {
  const row = (result.sections || []).find((s) => s.id === id);
  return row ? row.state : undefined;
}

test("normalizeBody strips CRLF, trailing whitespace, and collapses trailing blank lines", () => {
  const a = normalizeBody("line one  \r\nline two\r\n\r\n\r\n");
  assert.equal(a, "line one\nline two\n");
});

test("hashBody is stable across CRLF/LF and trailing-whitespace differences", () => {
  const lf = hashBody("a\nb\n");
  const crlf = hashBody("a\r\nb\r\n");
  const trailingSpace = hashBody("a \nb\n");
  assert.equal(lf, crlf);
  assert.equal(lf, trailingSpace);
});

test("parsePersona detects the majority line ending", () => {
  assert.equal(parsePersona(loadFixture("verbatim-marked.md")).eol, "\n");
  assert.equal(parsePersona(loadFixture("crlf.md")).eol, "\r\n");
});

test("verbatim-marked.md: every section is current, exit 0", () => {
  const result = computeStates(loadFixture("verbatim-marked.md"));
  assert.equal(result.status, "ok");
  for (const id of ["context-alignment", "scope-discipline", "craft", "verification", "reporting", "shared-file-discipline"]) {
    assert.equal(stateOf(result, id), "current", `expected ${id} current`);
  }
  assert.equal(resultExitCode(result), 0);
});

test("crlf.md: a CRLF persona is still current (normalization strips \\r), exit 0", () => {
  const personaText = loadFixture("crlf.md");
  assert.equal(parsePersona(personaText).eol, "\r\n");
  const result = computeStates(personaText, {});
  assert.equal(stateOf(result, "verification"), "current");
  assert.equal(resultExitCode(result), 0);
});

test("custom-edited.md: an edited section is custom-edited when no digest matches (FR-3), exit 0", () => {
  const result = computeStates(loadFixture("custom-edited.md"), {});
  assert.equal(stateOf(result, "verification"), "custom-edited");
  assert.equal(stateOf(result, "craft"), "current");
  assert.equal(resultExitCode(result), 0);
});

test("custom-edited.md: the same edited body is outdated when a digest table names its release", () => {
  const personaText = loadFixture("custom-edited.md");
  // Parsed only to build the fixture's own digest table (the release's hash);
  // the assertion below still runs through computeStates like every other
  // sectionStates-backed test, so a thrown error surfaces as an assertion
  // failure, not an uncaught exception (Reviewer attempt-1 issue 2a).
  const editedBody = parsePersona(personaText).sections.find((s) => s.id === "verification").body;
  const digests = { releases: { "v2.29.0": { verification: hashBody(editedBody) } } };
  const result = computeStates(personaText, digests);
  assert.equal(stateOf(result, "verification"), "outdated");
  const row = (result.sections || []).find((s) => s.id === "verification");
  assert.equal(row && row.matched, "v2.29.0");
  assert.equal(resultExitCode(result), 1);
});

test("missing-section.md: an unfenced-away section is missing, exit 1", () => {
  const result = computeStates(loadFixture("missing-section.md"));
  assert.equal(stateOf(result, "craft"), "missing");
  assert.equal(stateOf(result, "verification"), "current");
  assert.equal(resultExitCode(result), 1);
});

test("unlocated.md: the same absence is unlocated (not missing) when the migration record lists it, exit 0", () => {
  const result = computeStates(loadFixture("unlocated.md"));
  assert.equal(stateOf(result, "craft"), "unlocated");
  assert.equal(resultExitCode(result), 0);
});

test("extra-section.md: a marker id the template no longer has is extra, exit 0", () => {
  const result = computeStates(loadFixture("extra-section.md"));
  assert.equal(stateOf(result, "legacy-note"), "extra");
  assert.equal(resultExitCode(result), 0);
});

test("unclosed-marker.md: a dropped close marker is unreadable, exit 1", () => {
  const result = computeStates(loadFixture("unclosed-marker.md"));
  assert.equal(result.status, "unreadable");
  assert.ok(result.reason, "expected a reason string");
  assert.equal(resultExitCode(result), 1);
});

test("two-project-blocks.md (held-out): a second project block is unreadable, exit 1", () => {
  const result = computeStates(loadFixture("two-project-blocks.md"));
  assert.equal(result.status, "unreadable");
  assert.equal(resultExitCode(result), 1);
});

test("pre-marker-old-scaffold.md: no markers at all is unmarked, never custom-edited, exit 1 (FR-3 scenario)", () => {
  const result = computeStates(loadFixture("pre-marker-old-scaffold.md"));
  assert.equal(result.status, "unmarked");
  for (const row of result.sections) {
    assert.equal(row.state, "unmarked");
    assert.notEqual(row.state, "custom-edited");
  }
  assert.equal(resultExitCode(result), 1);
});

test("rewritten-star-style.md: a rewritten pre-marker persona is also unmarked, never custom-edited, exit 1", () => {
  const result = computeStates(loadFixture("rewritten-star-style.md"));
  assert.equal(result.status, "unmarked");
  assert.ok(result.sections.every((row) => row.state === "unmarked"));
  assert.equal(resultExitCode(result), 1);
});

test("a persona with no marker of any kind is unmarked, never unreadable (§5.1 exception)", () => {
  const noMarkerAtAll = "# Title\n\nplain text only, no comments of any kind\n";
  const persona = parsePersona(noMarkerAtAll);
  assert.equal(persona.unmarked, true);
  assert.equal(persona.unreadable, false);
  assert.equal(persona.projectBlockCount, 0);
});

test("a single stray project-open marker with no section marker is marked (not unmarked) and unreadable (unbalanced project block)", () => {
  const strayProjectOpen = "# Title\n\nplain text\n\n<!-- akili:project -->\nno matching close, no section marker anywhere\n";
  const persona = parsePersona(strayProjectOpen);
  assert.equal(persona.unmarked, false);
  assert.equal(persona.unreadable, true);
});

test("absent persona file: computeStates(null, ...) reports absent, exit 1", () => {
  const result = computeStates(null, {});
  assert.equal(result.status, "absent");
  assert.equal(resultExitCode(result), 1);
});

// FR-3: "AND IT MUST give the same states whichever --tool is passed". This
// is a CLI-level assertion by construction: `--tool` only ever feeds the
// printed tool-root line in `runAgentsDoctor` (design §6), so a test that
// stays inside the pure functions (as attempt 1's did, calling computeStates
// twice with identical inputs and no --tool involved anywhere) can never
// exercise the axis it claims to prove — the two runs never differ, whatever
// the implementation (Reviewer attempt-1 issue 3). This spawns the real CLI
// twice, once per --tool value, against the same `.agents/` fixture, and
// compares the section-state rows and exit codes.
// Row lines are printed as `    ${ansiColor}${STATE}${ansiReset}  id` (bin/akili.js
// always emits ANSI color codes, no TTY/NO_COLOR check) — strip the escape
// sequences before matching, or the filter never matches any row (Reviewer
// attempt-2 issue 1).
function stripAnsi(text) {
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

function runDoctorAgents(tmpDir, extraArgs) {
  const akiliBin = path.join(__dirname, "..", "bin", "akili.js");
  const env = Object.assign({}, process.env, { HOME: tmpDir, USERPROFILE: tmpDir });
  const result = spawnSync(
    process.execPath,
    [akiliBin, "doctor", "--agents"].concat(extraArgs || []),
    { cwd: tmpDir, env: env, encoding: "utf8" }
  );
  const stateLines = result.stdout
    .split("\n")
    .map((line) => stripAnsi(line))
    .filter((line) => /^\s+(CURRENT|OUTDATED|CUSTOM-EDITED|MISSING|UNLOCATED|EXTRA|UNMARKED)\b/.test(line));
  return { exitCode: result.status, stateLines: stateLines, stdout: result.stdout };
}

test("CLI: doctor --agents gives the same section states and exit code whichever --tool is passed (FR-3)", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "akili-doctor-tool-"));
  try {
    const agentsDir = path.join(tmpDir, ".agents");
    fs.mkdirSync(agentsDir);
    for (const name of ["leader.md", "implementer.md", "reviewer.md", "tester.md"]) {
      fs.copyFileSync(
        path.join(__dirname, "..", ".claude", "templates", name),
        path.join(agentsDir, name)
      );
    }
    const claudeRun = runDoctorAgents(tmpDir, ["--tool", "claude"]);
    const opencodeRun = runDoctorAgents(tmpDir, ["--tool", "opencode"]);
    // Non-vacuity: 22 rows = one per section across leader (5) + implementer (6)
    // + reviewer (6) + tester (5). Without this, an always-empty stateLines
    // array would pass deepEqual([], []) without ever comparing a real row.
    assert.equal(claudeRun.stateLines.length, 22, "expected 22 section-state rows (one per section across the four templates)");
    assert.equal(opencodeRun.stateLines.length, 22, "expected 22 section-state rows (one per section across the four templates)");
    assert.deepEqual(claudeRun.stateLines, opencodeRun.stateLines);
    assert.equal(claudeRun.exitCode, opencodeRun.exitCode);
    assert.equal(claudeRun.exitCode, 0);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test("CLI: doctor --agents with .agents/ absent prints one ABSENT line and exits 1", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "akili-doctor-absent-"));
  try {
    const run = runDoctorAgents(tmpDir, []);
    const absentLines = run.stdout.split("\n").filter((line) => line.includes("ABSENT"));
    assert.equal(absentLines.length, 1);
    assert.equal(run.exitCode, 1);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test("project-close-before-open.md: a project close appearing before its open is unreadable even though counts are 1/1 (§5.1)", () => {
  const persona = parsePersona(loadFixture("project-close-before-open.md"));
  assert.equal(persona.unreadable, true, "expected unreadable: a close with no open is a §5.1 violation regardless of the final open/close tally");
  assert.ok(persona.unreadableReason, "expected a reason string");
});

test("project-nested-in-section.md: a project block opening inside an owned section is unreadable even though counts are 1/1 (§5.1)", () => {
  const persona = parsePersona(loadFixture("project-nested-in-section.md"));
  assert.equal(persona.unreadable, true, "expected unreadable: nesting is not allowed, including a project block inside a section");
  assert.ok(persona.unreadableReason, "expected a reason string");
});

test("front matter is preserved as a text segment and never scanned for markers", () => {
  const persona = parsePersona(loadFixture("rewritten-star-style.md"));
  assert.ok(persona.frontMatter);
  assert.equal(persona.frontMatter.startLine, 0);
});

// ---------------------------------------------------------------------------
// FR-4 / FR-5 (--section only) / FR-10 (T3): applyFix. Pure-function tests
// first (byte identity, insertion position, idempotence, the state->action
// matrix), then the CLI's guards/backup/dry-run against real temp git repos
// — bin/akili.js runs main() on load (design §7), so its guards cannot be
// required directly; this drives the real CLI the way the --tool test above
// already does.
// ---------------------------------------------------------------------------

const { applyFix } = require("../bin/persona.js");

// Project space (Glossary: "the project block, front matter, and any
// unfenced text") is exactly the concatenation of every 'text' + 'project'
// segment. Asserting on this concatenation, not on line counts, is the
// FR-9/disqualifier requirement — and it is what the falsifier (task report)
// breaks by dropping 'text' segments from the render.
function projectSpaceOf(persona) {
  return persona.segments
    .filter((seg) => seg.kind === "text" || seg.kind === "project")
    .map((seg) => (seg.kind === "text" ? seg.lines : seg.bodyLines).join("\n"))
    .join("\u0000");
}

const FIX_FIXTURES = [
  "verbatim-marked.md",
  "custom-edited.md",
  "extra-section.md",
  "missing-section.md",
  "missing-section-first.md",
  "all-missing.md",
  "unlocated.md",
  "crlf-missing.md",
];

test("applyFix: project space is byte-identical across every fixture, changed or not (FR-4, NFR-4)", () => {
  for (const name of FIX_FIXTURES) {
    const before = parsePersona(loadFixture(name));
    const beforeSpace = projectSpaceOf(before);
    const fix = applyFix(before, template, {}, {});
    if (!fix.changed) {
      assert.equal(fix.text, null, `${name}: an unchanged fix must not produce replacement text`);
      continue;
    }
    const after = parsePersona(fix.text);
    assert.equal(projectSpaceOf(after), beforeSpace, `${name}: project space must be byte-identical across --fix`);
  }
});

test("applyFix: insertion — preceding section present (missing-section.md: craft lands after scope-discipline, before verification)", () => {
  const fix = applyFix(parsePersona(loadFixture("missing-section.md")), template, {}, {});
  const after = parsePersona(fix.text);
  assert.deepEqual(after.sections.map((s) => s.id), [
    "context-alignment", "scope-discipline", "craft", "verification", "reporting", "shared-file-discipline",
  ]);
});

test("applyFix: insertion — preceding absent, next present (missing-section-first.md: context-alignment lands before scope-discipline)", () => {
  const fix = applyFix(parsePersona(loadFixture("missing-section-first.md")), template, {}, {});
  const after = parsePersona(fix.text);
  assert.deepEqual(after.sections.map((s) => s.id), [
    "context-alignment", "scope-discipline", "craft", "verification", "reporting", "shared-file-discipline",
  ]);
});

test("applyFix: insertion — neither present, insert before the project block, in template order (all-missing.md)", () => {
  const before = parsePersona(loadFixture("all-missing.md"));
  assert.equal(before.sections.length, 0, "fixture precondition: no owned sections at all");
  const fix = applyFix(before, template, {}, {});
  const after = parsePersona(fix.text);
  assert.deepEqual(after.sections.map((s) => s.id), [
    "context-alignment", "scope-discipline", "craft", "verification", "reporting", "shared-file-discipline",
  ]);
  assert.equal(after.projectBlockCount, 1);
});

test("applyFix: idempotence — a second pass over the fixed text has nothing left to do (FR-4 scenario)", () => {
  const fixed = applyFix(parsePersona(loadFixture("missing-section.md")), template, {}, {}).text;
  const second = applyFix(parsePersona(fixed), template, {}, {});
  assert.equal(second.changed, false);
  const finalStates = sectionStates(parsePersona(fixed), template, {});
  assert.equal(resultExitCode(finalStates), 0);
  for (const row of finalStates.sections) {
    assert.notEqual(row.state, "outdated");
    assert.notEqual(row.state, "missing");
  }
});

test("applyFix: custom-edited is left alone without --section (FR-4 scenario)", () => {
  const fix = applyFix(parsePersona(loadFixture("custom-edited.md")), template, {}, {});
  assert.equal(fix.changed, false);
  assert.deepEqual(fix.rows, [{ id: "verification", action: "skipped", detail: "custom-edited; use --section" }]);
});

test("applyFix: --section forces a custom-edited replace", () => {
  const fix = applyFix(parsePersona(loadFixture("custom-edited.md")), template, {}, { sections: ["verification"] });
  assert.equal(fix.changed, true);
  const after = parsePersona(fix.text);
  const fixedHash = hashBody(after.sections.find((s) => s.id === "verification").body);
  const templateHash = hashBody(template.sections.find((s) => s.id === "verification").body);
  assert.equal(fixedHash, templateHash);
});

test("applyFix: unlocated is left alone without --section", () => {
  const fix = applyFix(parsePersona(loadFixture("unlocated.md")), template, {}, {});
  assert.equal(fix.changed, false);
  assert.deepEqual(fix.rows, [{ id: "craft", action: "skipped", detail: "unlocated; use --section" }]);
});

test("applyFix: --section on an unlocated id inserts it and removes it from the migration record (DD-13)", () => {
  const before = parsePersona(loadFixture("unlocated.md"));
  assert.deepEqual(before.migrationRecord.notLocated, ["craft"]);
  const fix = applyFix(before, template, {}, { sections: ["craft"] });
  const after = parsePersona(fix.text);
  assert.ok(after.sections.some((s) => s.id === "craft"));
  assert.deepEqual(after.migrationRecord.notLocated, []);
});

test("applyFix: extra is never changed (FR-4)", () => {
  const fix = applyFix(parsePersona(loadFixture("extra-section.md")), template, {}, {});
  assert.equal(fix.changed, false);
  assert.deepEqual(fix.rows, []);
});

test("applyFix: unreadable and unmarked personas are skipped, never written (T3 never invents the migration)", () => {
  for (const name of ["unclosed-marker.md", "two-project-blocks.md"]) {
    const fix = applyFix(parsePersona(loadFixture(name)), template, {}, {});
    assert.equal(fix.changed, false);
    assert.equal(fix.text, null);
    assert.equal(fix.rows[0].action, "skipped");
  }
  for (const name of ["pre-marker-old-scaffold.md", "rewritten-star-style.md"]) {
    const fix = applyFix(parsePersona(loadFixture(name)), template, {}, {});
    assert.equal(fix.changed, false);
    assert.match(fix.rows[0].detail, /unmarked/);
  }
});

test("applyFix: an absent persona installs the packaged template verbatim (FR-4)", () => {
  const fix = applyFix(null, template, {}, {});
  assert.equal(fix.changed, true);
  assert.equal(fix.text, template.text);
  assert.deepEqual(fix.rows, [{ id: null, action: "installed", detail: null }]);
});

test("applyFix: a CRLF persona stays CRLF end to end (FR-9 fixture requirement)", () => {
  const before = parsePersona(loadFixture("crlf-missing.md"));
  assert.equal(before.eol, "\r\n");
  const fix = applyFix(before, template, {}, {});
  assert.equal(fix.changed, true);
  assert.equal(fix.text.replace(/\r\n/g, "").includes("\n"), false, "expected every line ending to be CRLF");
  const after = parsePersona(fix.text);
  assert.equal(after.eol, "\r\n");
  assert.equal(resultExitCode(sectionStates(after, template, {})), 0);
});

// ---------------------------------------------------------------------------
// CLI guard matrix (FR-4, DD-12) and backup/dry-run/idempotence, end to end.
// ---------------------------------------------------------------------------

function initGitRepo(tmpDir, opts) {
  const options = opts || {};
  const run = (gitArgs) => spawnSync("git", gitArgs, { cwd: tmpDir, encoding: "utf8" });
  run(["init", "-q"]);
  run(["config", "user.email", "t@t.com"]);
  run(["config", "user.name", "t"]);
  if (options.pin) {
    fs.writeFileSync(path.join(tmpDir, "AGENTS.md"), `- Default Branch: ${options.pin}\n`);
  }
  run(["checkout", "-q", "-b", options.initialBranch || "main"]);
  fs.mkdirSync(path.join(tmpDir, ".agents"));
  fs.copyFileSync(path.join(FIXTURES_DIR, options.fixture || "missing-section.md"), path.join(tmpDir, ".agents", "implementer.md"));
  run(["add", "-A"]);
  run(["commit", "-q", "-m", "init"]);
}

function runFix(tmpDir, extraArgs) {
  const akiliBin = path.join(__dirname, "..", "bin", "akili.js");
  const env = Object.assign({}, process.env, { HOME: tmpDir, USERPROFILE: tmpDir });
  const result = spawnSync(process.execPath, [akiliBin, "doctor", "--agents", "--fix"].concat(extraArgs || []), {
    cwd: tmpDir,
    env: env,
    encoding: "utf8",
  });
  return { exitCode: result.status, stdout: stripAnsi(result.stdout || "") };
}

function withTempDir(prefix, fn) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  try {
    fn(tmpDir);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

test("guard matrix: pinned apply-capable branch, clean tree -> --fix proceeds", () => {
  withTempDir("akili-guard-ok-", (tmpDir) => {
    initGitRepo(tmpDir, { pin: "main", initialBranch: "main" });
    const run = runFix(tmpDir, []);
    assert.doesNotMatch(run.stdout, /REFUSED/);
    assert.equal(run.exitCode, 0);
  });
});

test("guard matrix: pinned branch, checked out elsewhere, clean tree -> REFUSED (branch); no file changed; --allow-branch proceeds", () => {
  withTempDir("akili-guard-branch-", (tmpDir) => {
    initGitRepo(tmpDir, { pin: "main", initialBranch: "main" });
    spawnSync("git", ["checkout", "-q", "-b", "feature"], { cwd: tmpDir });
    const before = fs.readFileSync(path.join(tmpDir, ".agents", "implementer.md"), "utf8");
    const refused = runFix(tmpDir, []);
    assert.match(refused.stdout, /REFUSED \(branch/);
    assert.equal(refused.exitCode, 1);
    assert.equal(fs.readFileSync(path.join(tmpDir, ".agents", "implementer.md"), "utf8"), before);
    const status = spawnSync("git", ["status", "--porcelain"], { cwd: tmpDir, encoding: "utf8" });
    assert.equal(status.stdout.trim(), "");
    const allowed = runFix(tmpDir, ["--allow-branch"]);
    assert.doesNotMatch(allowed.stdout, /REFUSED/);
    assert.equal(allowed.exitCode, 0);
  });
});

test("guard matrix: unresolved branch (both main and master exist, no pin) -> REFUSED; --allow-branch proceeds", () => {
  withTempDir("akili-guard-unresolved-", (tmpDir) => {
    initGitRepo(tmpDir, { initialBranch: "main" });
    spawnSync("git", ["branch", "master"], { cwd: tmpDir });
    const refused = runFix(tmpDir, []);
    assert.match(refused.stdout, /REFUSED \(branch/);
    assert.equal(refused.exitCode, 1);
    const allowed = runFix(tmpDir, ["--allow-branch"]);
    assert.equal(allowed.exitCode, 0);
  });
});

test("guard matrix: no pin, resolvable origin/HEAD -> the branch it names proceeds; another branch is REFUSED (branch); --allow-branch proceeds", () => {
  withTempDir("akili-guard-originhead-", (tmpDir) => {
    const run = (gitArgs) => spawnSync("git", gitArgs, { cwd: tmpDir, encoding: "utf8" });
    const bareDir = path.join(tmpDir, "origin.git");
    spawnSync("git", ["init", "-q", "--bare", bareDir]);
    run(["init", "-q"]);
    run(["config", "user.email", "t@t.com"]);
    run(["config", "user.name", "t"]);
    run(["checkout", "-q", "-b", "trunk"]);
    fs.mkdirSync(path.join(tmpDir, ".agents"));
    fs.copyFileSync(path.join(FIXTURES_DIR, "missing-section.md"), path.join(tmpDir, ".agents", "implementer.md"));
    run(["add", "-A"]);
    run(["commit", "-q", "-m", "init"]);
    run(["remote", "add", "origin", bareDir]);
    run(["push", "-q", "origin", "trunk"]);
    run(["remote", "set-head", "origin", "trunk"]);

    // Preconditions: no Default/Integration pin, and origin/HEAD resolves to
    // "trunk" — the exact case DD-12/step 3 of the kaizen Branch Context
    // covers and the existing suite never exercised.
    assert.equal(fs.existsSync(path.join(tmpDir, "AGENTS.md")), false);
    assert.equal(fs.existsSync(path.join(tmpDir, "CLAUDE.md")), false);
    const symbolic = run(["symbolic-ref", "refs/remotes/origin/HEAD"]);
    assert.equal(symbolic.stdout.trim(), "refs/remotes/origin/trunk", "precondition: origin/HEAD resolves to trunk");

    // Direction 1: on the branch origin/HEAD names, --fix proceeds. Uses
    // --dry-run so this direction's check never dirties the tree for
    // direction 2 below (both directions share one repo/commit).
    const onHead = runFix(tmpDir, ["--dry-run"]);
    assert.doesNotMatch(onHead.stdout, /REFUSED/);
    assert.equal(onHead.exitCode, 0);

    // Direction 2: on another branch, --fix refuses (branch), and
    // --allow-branch overrides — from the same clean commit, so only the
    // branch guard is in play.
    run(["checkout", "-q", "-b", "feature"]);
    const refused = runFix(tmpDir, []);
    assert.match(refused.stdout, /REFUSED \(branch/);
    assert.equal(refused.exitCode, 1);
    const allowed = runFix(tmpDir, ["--allow-branch"]);
    assert.doesNotMatch(allowed.stdout, /REFUSED/);
    assert.equal(allowed.exitCode, 0);
  });
});

test("guard matrix: not a git repo -> branch guard skipped, --fix proceeds", () => {
  withTempDir("akili-guard-nogit-", (tmpDir) => {
    fs.mkdirSync(path.join(tmpDir, ".agents"));
    fs.copyFileSync(path.join(FIXTURES_DIR, "missing-section.md"), path.join(tmpDir, ".agents", "implementer.md"));
    const run = runFix(tmpDir, []);
    assert.match(run.stdout, /Not a git checkout/);
    assert.equal(run.exitCode, 0);
  });
});

test("guard matrix: dirty tree outside the fix's own artifacts -> REFUSED; --force proceeds", () => {
  withTempDir("akili-guard-dirty-", (tmpDir) => {
    initGitRepo(tmpDir, { pin: "main", initialBranch: "main" });
    fs.appendFileSync(path.join(tmpDir, ".agents", "implementer.md"), "\nhand edit\n");
    const refused = runFix(tmpDir, []);
    assert.match(refused.stdout, /REFUSED \(dirty tree/);
    assert.equal(refused.exitCode, 1);
    const forced = runFix(tmpDir, ["--force"]);
    assert.doesNotMatch(forced.stdout, /REFUSED/);
    assert.equal(forced.exitCode, 0);
  });
});

test("guard matrix: dirty only by the fix's own backup/.gitignore is never blocking (DD-12)", () => {
  withTempDir("akili-guard-selfdirty-", (tmpDir) => {
    const run = (gitArgs) => spawnSync("git", gitArgs, { cwd: tmpDir, encoding: "utf8" });
    run(["init", "-q"]);
    run(["config", "user.email", "t@t.com"]);
    run(["config", "user.name", "t"]);
    fs.writeFileSync(path.join(tmpDir, "AGENTS.md"), "- Default Branch: main\n");
    run(["checkout", "-q", "-b", "main"]);
    fs.mkdirSync(path.join(tmpDir, ".agents"));
    // All four personas start fully current — the only drift is
    // implementer.md's one missing section — so the first --fix's only
    // *content* change is that one file; committing it isolates the rest
    // of the story to the fix's own backup/.gitignore artifacts.
    for (const role of ["leader", "reviewer", "tester"]) {
      fs.copyFileSync(path.join(__dirname, "..", ".claude", "templates", `${role}.md`), path.join(tmpDir, ".agents", `${role}.md`));
    }
    fs.copyFileSync(path.join(FIXTURES_DIR, "missing-section.md"), path.join(tmpDir, ".agents", "implementer.md"));
    run(["add", "-A"]);
    run(["commit", "-q", "-m", "init"]);

    const first = runFix(tmpDir, []);
    assert.equal(first.exitCode, 0);
    assert.match(first.stdout, /BACKUP/);

    // Commit only the persona content change; leave the backup dir and the
    // new .gitignore uncommitted.
    run(["add", ".agents/implementer.md"]);
    run(["commit", "-q", "-m", "fix"]);
    const status = spawnSync("git", ["status", "--porcelain", "--", ".agents"], { cwd: tmpDir, encoding: "utf8" });
    assert.match(status.stdout, /\.gitignore/, "precondition: only the fix's own .gitignore (and an ignored .backup/) remain dirty");
    assert.doesNotMatch(status.stdout, /implementer\.md\n|implementer\.md$/, "precondition: no persona content is left dirty");

    const second = runFix(tmpDir, []); // no --force
    assert.doesNotMatch(second.stdout, /REFUSED/);
    assert.equal(second.exitCode, 0);
  });
});

test("CLI --fix: the backup is written before the persona file, and holds the pre-fix content (FR-4 scenario)", () => {
  withTempDir("akili-backup-", (tmpDir) => {
    initGitRepo(tmpDir, { pin: "main", initialBranch: "main" });
    const originalText = fs.readFileSync(path.join(tmpDir, ".agents", "implementer.md"), "utf8");
    const run = runFix(tmpDir, []);
    assert.equal(run.exitCode, 0);
    assert.match(run.stdout, /BACKUP/);
    const backupDir = path.join(tmpDir, ".agents", ".backup");
    const backups = fs.readdirSync(backupDir).filter((f) => f.startsWith("implementer.md."));
    assert.equal(backups.length, 1, "expected exactly one backup for the one rewritten persona");
    assert.equal(fs.readFileSync(path.join(backupDir, backups[0]), "utf8"), originalText);
    assert.notEqual(fs.readFileSync(path.join(tmpDir, ".agents", "implementer.md"), "utf8"), originalText);
  });
});

test("CLI --fix: the backup file name matches design DD-5's <role>.md.<YYYYMMDD-HHMMSS> format", () => {
  withTempDir("akili-backup-name-", (tmpDir) => {
    initGitRepo(tmpDir, { pin: "main", initialBranch: "main" });
    const run = runFix(tmpDir, []);
    assert.equal(run.exitCode, 0);
    const backupDir = path.join(tmpDir, ".agents", ".backup");
    const backups = fs.readdirSync(backupDir).filter((f) => f.startsWith("implementer.md."));
    assert.equal(backups.length, 1);
    assert.match(backups[0], /^implementer\.md\.\d{8}-\d{6}$/);
  });
});

test("CLI --fix --dry-run: prints the plan and writes nothing (FR-4)", () => {
  withTempDir("akili-dryrun-", (tmpDir) => {
    initGitRepo(tmpDir, { pin: "main", initialBranch: "main" });
    const before = fs.readFileSync(path.join(tmpDir, ".agents", "implementer.md"), "utf8");
    const run = runFix(tmpDir, ["--dry-run"]);
    assert.equal(run.exitCode, 0);
    assert.match(run.stdout, /INSERTED/);
    assert.match(run.stdout, /dry-run/);
    assert.equal(fs.readFileSync(path.join(tmpDir, ".agents", "implementer.md"), "utf8"), before);
    assert.equal(fs.existsSync(path.join(tmpDir, ".agents", ".backup")), false);
  });
});

test("CLI --fix then doctor --agents again: exit 0, no section outdated or missing (FR-4 idempotence, end to end)", () => {
  withTempDir("akili-idem-", (tmpDir) => {
    initGitRepo(tmpDir, { pin: "main", initialBranch: "main" });
    const first = runFix(tmpDir, []);
    assert.equal(first.exitCode, 0);
    const akiliBin = path.join(__dirname, "..", "bin", "akili.js");
    const env = Object.assign({}, process.env, { HOME: tmpDir, USERPROFILE: tmpDir });
    const second = spawnSync(process.execPath, [akiliBin, "doctor", "--agents"], { cwd: tmpDir, env, encoding: "utf8" });
    assert.equal(second.status, 0);
    const failingLines = stripAnsi(second.stdout).split("\n").filter((l) => /OUTDATED|MISSING|UNMARKED|UNREADABLE|ABSENT/.test(l));
    assert.equal(failingLines.length, 0, `expected no failing rows, got: ${failingLines.join(" | ")}`);
  });
});

// ---------------------------------------------------------------------------
// T3 rework, attempt 2 — Leader-adjudicated items A-D.
// ---------------------------------------------------------------------------

// A (RISK issue 1): --dry-run must run every guard, print the full plan
// (writing nothing, as it already did), AND print one REFUSED (<guard>) row
// per refusing guard, exit 1. A real (non-dry) run keeps short-circuiting.
test("CLI --fix --dry-run on a refused branch: prints the full plan AND the REFUSED row, exit 1, nothing written (RISK issue 1)", () => {
  withTempDir("akili-dryrun-refused-", (tmpDir) => {
    initGitRepo(tmpDir, { pin: "main", initialBranch: "main" });
    spawnSync("git", ["checkout", "-q", "-b", "feature"], { cwd: tmpDir });
    const before = fs.readFileSync(path.join(tmpDir, ".agents", "implementer.md"), "utf8");
    const run = runFix(tmpDir, ["--dry-run"]);
    assert.match(run.stdout, /INSERTED/, "expected the dry-run plan (e.g. an INSERTED row) to still print even though a guard refuses");
    assert.match(run.stdout, /REFUSED \(branch/, "expected a REFUSED (branch...) row to also be printed");
    assert.equal(run.exitCode, 1, "a guard refusal must still exit 1 under --dry-run");
    assert.equal(
      fs.readFileSync(path.join(tmpDir, ".agents", "implementer.md"), "utf8"),
      before,
      "dry-run must write nothing even when it also prints the plan"
    );
    assert.equal(fs.existsSync(path.join(tmpDir, ".agents", ".backup")), false);
  });
});

test("CLI --fix --dry-run with both guards refusing: one REFUSED row per guard, not just the first (RISK issue 1)", () => {
  withTempDir("akili-dryrun-both-refused-", (tmpDir) => {
    initGitRepo(tmpDir, { pin: "main", initialBranch: "main" });
    spawnSync("git", ["checkout", "-q", "-b", "feature"], { cwd: tmpDir });
    fs.appendFileSync(path.join(tmpDir, ".agents", "implementer.md"), "\nhand edit\n");
    const run = runFix(tmpDir, ["--dry-run"]);
    assert.match(run.stdout, /REFUSED \(branch/, "expected the branch refusal to be named");
    assert.match(run.stdout, /REFUSED \(dirty tree/, "expected the dirty-tree refusal to also be named, not swallowed by the branch one");
    assert.equal(run.exitCode, 1);
  });
});

// B (RISK issue 2 / RELIABILITY issue 2, DD-13): the neighbourless insertion
// fallback must not land a new section between the migration record and the
// project block.
test("applyFix: the insertion fallback keeps the migration record immediately before the project block (RISK issue 2 / RELIABILITY issue 2, DD-13)", () => {
  const before = parsePersona(loadFixture("all-unlocated.md"));
  assert.equal(before.sections.length, 0, "fixture precondition: no owned sections located at all");
  const migBefore = before.segments.findIndex((s) => s.kind === "migration");
  const projBefore = before.segments.findIndex((s) => s.kind === "project");
  assert.equal(migBefore, projBefore - 1, "fixture precondition: the migration record starts immediately before the project block");

  const fix = applyFix(before, template, {}, { sections: ["craft"] });
  assert.equal(fix.changed, true);
  const after = parsePersona(fix.text);
  assert.ok(after.sections.some((s) => s.id === "craft"), "expected craft to be inserted");

  const migAfter = after.segments.findIndex((s) => s.kind === "migration");
  const projAfter = after.segments.findIndex((s) => s.kind === "project");
  assert.equal(
    migAfter,
    projAfter - 1,
    "expected the migration record to still sit immediately before the project block after the neighbourless insertion"
  );
});

// C (RELIABILITY issue 1, DD-5): the report ends with the commit-or-force
// line exactly when at least one persona was actually written.
test("CLI --fix: the report ends with the DD-5 commit-or-force line after a real write (RELIABILITY issue 1)", () => {
  withTempDir("akili-dd5-", (tmpDir) => {
    initGitRepo(tmpDir, { pin: "main", initialBranch: "main" });
    const run = runFix(tmpDir, []);
    assert.equal(run.exitCode, 0);
    assert.match(run.stdout, /BACKUP/, "precondition: at least one persona was actually rewritten");
    const lines = run.stdout.trim().split("\n");
    assert.equal(
      lines[lines.length - 1],
      "commit `.agents/` before the next `--fix`, or pass `--force`",
      "expected the DD-5 closing line to be the last line of the report"
    );
  });
});

test("CLI --fix --dry-run: nothing was written, so the report does NOT end with the DD-5 line (RELIABILITY issue 1, negative case)", () => {
  withTempDir("akili-dd5-dryrun-", (tmpDir) => {
    initGitRepo(tmpDir, { pin: "main", initialBranch: "main" });
    const run = runFix(tmpDir, ["--dry-run"]);
    assert.doesNotMatch(run.stdout, /commit `\.agents\/` before the next `--fix`/);
  });
});

// D (RELIABILITY issue 3): outdated replacement was never exercised (every
// prior applyFix call passed digests = {}), and the FR-4 hand-edited scenario
// ("the other outdated sections are replaced" in the SAME run as a
// custom-edited skip) had no test either.
test("applyFix: an outdated section is replaced and a custom-edited sibling is left alone, in the same run (FR-4 hand-edited scenario, RELIABILITY issue 3)", () => {
  const before = parsePersona(loadFixture("outdated-and-custom-edited.md"));
  const craftBody = before.sections.find((s) => s.id === "craft").body;
  const verificationBodyBefore = before.sections.find((s) => s.id === "verification").body;
  const digests = { releases: { "v2.29.0": { craft: hashBody(craftBody) } } };

  const fix = applyFix(before, template, digests, {});
  assert.equal(fix.changed, true);
  assert.deepEqual(
    fix.rows.find((r) => r.id === "craft"),
    { id: "craft", action: "fixed", detail: "matched v2.29.0" },
    "expected a FIXED row for the outdated section"
  );
  assert.deepEqual(
    fix.rows.find((r) => r.id === "verification"),
    { id: "verification", action: "skipped", detail: "custom-edited; use --section" },
    "expected the custom-edited section to be reported skipped, not touched"
  );

  const after = parsePersona(fix.text);
  const craftAfter = after.sections.find((s) => s.id === "craft");
  const templateCraft = template.sections.find((s) => s.id === "craft");
  assert.equal(hashBody(craftAfter.body), hashBody(templateCraft.body), "expected the replaced body's hash to equal the template's");
  assert.equal(craftAfter.since, templateCraft.since, "expected since= to be rewritten to the template's release");

  const verificationAfter = after.sections.find((s) => s.id === "verification");
  assert.equal(verificationAfter.body, verificationBodyBefore, "expected the custom-edited section's body to stay untouched");

  assert.equal(
    projectSpaceOf(after),
    projectSpaceOf(before),
    "expected project space to stay byte-identical across the mixed outdated+custom-edited run"
  );
});

test("applyFix: project space stays byte-identical on the --section replace and --section insert paths too (FR-9/disqualifier, RELIABILITY issue 3)", () => {
  const replaceBefore = parsePersona(loadFixture("custom-edited.md"));
  const replaceSpaceBefore = projectSpaceOf(replaceBefore);
  const replaceFix = applyFix(replaceBefore, template, {}, { sections: ["verification"] });
  assert.equal(replaceFix.changed, true);
  const replaceAfter = parsePersona(replaceFix.text);
  assert.equal(
    projectSpaceOf(replaceAfter),
    replaceSpaceBefore,
    "custom-edited.md --section verification (replace path): project space must stay byte-identical"
  );

  const insertBefore = parsePersona(loadFixture("unlocated.md"));
  const insertSpaceBefore = projectSpaceOf(insertBefore);
  const insertFix = applyFix(insertBefore, template, {}, { sections: ["craft"] });
  assert.equal(insertFix.changed, true);
  const insertAfter = parsePersona(insertFix.text);
  assert.equal(
    projectSpaceOf(insertAfter),
    insertSpaceBefore,
    "unlocated.md --section craft (--section insert path): project space must stay byte-identical"
  );
});
