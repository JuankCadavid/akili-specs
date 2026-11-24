"use strict";

// @akili-spec changes/nestjs-official-skills T4
//
// FR-5: `doctor --agents` reports a retired skill name found in the
// `## Skill Map` section of AGENTS.md / CLAUDE.md. Pure scan (unit) plus the
// real CLI as a subprocess with HOME and cwd pinned to a scratch directory.

const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const AKILI_BIN = path.join(__dirname, "..", "bin", "akili.js");
const TEMPLATES = path.join(__dirname, "..", ".claude", "templates");
const PERSONAS = ["leader.md", "implementer.md", "reviewer.md", "tester.md"];
const { scanSkillMap, findSkillMapSection, RETIRED_SKILLS } = require("../bin/skill-map.js");

const names = (text) => scanSkillMap(text).map((h) => [h.name, h.line]);

// ---- unit: section bounds -------------------------------------------------

test("section opens at exact '## Skill Map' and ends at the next '## ' or '# '", () => {
  const text = ["# Title", "nestjs-expert", "## Skill Map", "| nestjs-expert |", "## History", "nestjs-expert"].join("\n");
  assert.deepEqual(names(text), [["nestjs-expert", 4]]);
  const h1 = ["## Skill Map", "a", "# Next", "nestjs-expert"].join("\n");
  assert.deepEqual(names(h1), []);
});

test("'### Skill Map' and '## Skill Map (draft)' do not open a section", () => {
  assert.deepEqual(names("### Skill Map\nnestjs-expert\n"), []);
  assert.deepEqual(names("## Skill Map (draft)\nnestjs-expert\n"), []);
});

test("a fenced '## ' line does not end the section; fenced lines are still scanned", () => {
  const text = ["## Skill Map", "```", "## not a heading", "nestjs-expert", "```", "x nestjs-expert"].join("\n");
  assert.deepEqual(names(text), [["nestjs-expert", 4], ["nestjs-expert", 6]]);
});

test("section runs to end of file; absent heading gives no hits", () => {
  assert.deepEqual(names("## Skill Map\n\n| a | nestjs-expert |"), [["nestjs-expert", 3]]);
  assert.deepEqual(names("@AGENTS.md\n"), []);
  assert.equal(findSkillMapSection("nothing here"), null);
});

test("only the first '## Skill Map' heading is scanned", () => {
  const text = ["## Skill Map", "ok", "## Other", "## Skill Map", "nestjs-expert"].join("\n");
  assert.deepEqual(names(text), []);
});

// ---- unit: token boundaries ----------------------------------------------

test("whole-token match: suffix/prefix word chars reject; backtick and pipe accept", () => {
  const body = (s) => "## Skill Map\n" + s;
  assert.deepEqual(names(body("nestjs-expert-v2")), []);
  assert.deepEqual(names(body("my_nestjs-expert")), []);
  assert.deepEqual(names(body("xnestjs-expert")), []);
  assert.deepEqual(names(body("`nestjs-expert`")), [["nestjs-expert", 2]]);
  assert.deepEqual(names(body("|nestjs-expert|")), [["nestjs-expert", 2]]);
  assert.deepEqual(names(body("nestjs-expert")), [["nestjs-expert", 2]]);
});

test("line numbers are 1-based and identical under CRLF and LF", () => {
  const lf = "a\nb\n## Skill Map\r\n| nestjs-expert |\n".replace(/\r/g, "");
  const crlf = lf.replace(/\n/g, "\r\n");
  assert.deepEqual(names(lf), [["nestjs-expert", 4]]);
  assert.deepEqual(names(crlf), [["nestjs-expert", 4]]);
  assert.deepEqual(names("## Skill Map  \r\nnestjs-expert\r\n"), [["nestjs-expert", 2]]);
});

test("hit carries the replacement, which names nestjs-feature", () => {
  const [hit] = scanSkillMap("## Skill Map\nnestjs-expert");
  assert.equal(hit.name, "nestjs-expert");
  assert.match(hit.replacement, /nestjs-feature/);
  assert.ok(RETIRED_SKILLS.some((r) => r.name === "nestjs-expert"));
});

// ---- CLI -------------------------------------------------------------------

function stripAnsi(t) {
  // eslint-disable-next-line no-control-regex
  return t.replace(/\x1b\[[0-9;]*m/g, "");
}

function mkProject(t, { personas }) {
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "akili-skillmap-")));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  if (personas) {
    fs.mkdirSync(path.join(dir, ".agents"));
    for (const f of PERSONAS) fs.copyFileSync(path.join(TEMPLATES, f), path.join(dir, ".agents", f));
  }
  return dir;
}

function run(dir, args) {
  const r = spawnSync(process.execPath, [AKILI_BIN, "doctor", "--agents", ...args], {
    cwd: dir,
    encoding: "utf8",
    env: Object.assign({}, process.env, { HOME: dir, USERPROFILE: dir }),
  });
  return { status: r.status, out: stripAnsi((r.stdout || "") + (r.stderr || "")) };
}

const sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
const retired = (out) => out.split("\n").filter((l) => /RETIRED/.test(l));

function skillMapDoc(extraBefore = 0) {
  const lines = ["# Project", ...Array(extraBefore).fill("filler"), "## Skill Map", "| Stack | Skill |", "| NestJS | `nestjs-expert` |", "## History", "nestjs-expert was used"];
  return lines.join("\n") + "\n";
}

for (const withPersonas of [false, true]) {
  const label = withPersonas ? "current .agents/ (exit 0)" : "no .agents/ (exit 1, ABSENT)";

  test(`CLI [${label}]: row on line N prints RETIRED with nestjs-feature; exit equals run without the row`, (t) => {
    const dir = mkProject(t, { personas: withPersonas });
    fs.writeFileSync(path.join(dir, "AGENTS.md"), "# P\n## Skill Map\n| x | y |\n");
    const without = run(dir, []);
    assert.equal(without.status, withPersonas ? 0 : 1);
    assert.equal(retired(without.out).length, 0);

    fs.writeFileSync(path.join(dir, "AGENTS.md"), skillMapDoc(3));
    const row = 3 + 4; // heading at 5, header 6, row 7
    const withRow = run(dir, []);
    assert.equal(withRow.status, without.status);
    const lines = retired(withRow.out);
    assert.equal(lines.length, 1);
    assert.match(lines[0], new RegExp(`RETIRED nestjs-expert \\(AGENTS\\.md:${row}\\)`));
    assert.match(withRow.out, /nestjs-feature/);
  });
}

test("CLI: --fix leaves AGENTS.md byte-identical (sha256)", (t) => {
  const dir = mkProject(t, { personas: true });
  const f = path.join(dir, "AGENTS.md");
  fs.writeFileSync(f, skillMapDoc(0));
  const before = sha(f);
  const r = run(dir, ["--fix", "--allow-branch"]);
  assert.match(r.out, /RETIRED nestjs-expert \(AGENTS\.md:4\)/);
  assert.equal(sha(f), before);
});

test("CLI: name only under '## History' prints nothing", (t) => {
  const dir = mkProject(t, { personas: true });
  fs.writeFileSync(path.join(dir, "AGENTS.md"), "## Skill Map\n| a | b |\n## History\nnestjs-expert\n");
  const r = run(dir, []);
  assert.equal(retired(r.out).length, 0);
  assert.equal(r.status, 0);
});

test("CLI: CLAUDE.md = @AGENTS.md adds no extra line; same row in both files gives one line per file", (t) => {
  const dir = mkProject(t, { personas: true });
  fs.writeFileSync(path.join(dir, "AGENTS.md"), skillMapDoc(0));
  fs.writeFileSync(path.join(dir, "CLAUDE.md"), "@AGENTS.md\n");
  assert.equal(retired(run(dir, []).out).length, 1);
  fs.writeFileSync(path.join(dir, "CLAUDE.md"), skillMapDoc(0));
  const lines = retired(run(dir, []).out);
  assert.equal(lines.length, 2);
  assert.match(lines[0], /AGENTS\.md:4/);
  assert.match(lines[1], /CLAUDE\.md:4/);
});

test("CLI: unreadable file prints one warning, scan continues, exit unchanged", (t) => {
  if (process.platform === "win32" || (process.getuid && process.getuid() === 0)) {
    t.skip("permission bits not enforceable here");
    return;
  }
  const dir = mkProject(t, { personas: true });
  const a = path.join(dir, "AGENTS.md");
  fs.writeFileSync(a, skillMapDoc(0));
  fs.writeFileSync(path.join(dir, "CLAUDE.md"), skillMapDoc(0));
  fs.chmodSync(a, 0o000);
  t.after(() => {
    try {
      fs.chmodSync(a, 0o644);
    } catch {
      /* dir already removed */
    }
  });
  const r = run(dir, []);
  const warns = r.out.split("\n").filter((l) => /warning/i.test(l));
  assert.equal(warns.length, 1);
  assert.match(warns[0], /AGENTS\.md/);
  assert.equal(r.status, 0);
  assert.match(r.out, /RETIRED nestjs-expert \(CLAUDE\.md:4\)/);
});
