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
