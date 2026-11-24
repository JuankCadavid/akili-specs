"use strict";

// @akili-spec changes/nestjs-official-skills (akili-test suite A)
//
// Independent integration proof for FR-3 / FR-4 / FR-5 clauses the author
// tests (install-nestjs-foreign, retired-skills, doctor-skill-map) leave open:
// Grok Bot delivery, a foreign folder without the `.nestjs-skills` marker,
// doctor counting the six, the gsap-* REMOVED/deleted messages, and the
// Skill Map scan surviving `--fix` (persona rewrite and refused guard).
// Every test drives the real CLI as a subprocess with HOME and cwd pinned to a
// scratch directory. Expected strings are literals copied from
// requirements.md §6 / design.md §6 at spec commit 6f44ff3; nothing under
// docs/specs/ is read at runtime.

const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const AKILI_BIN = path.join(__dirname, "..", "bin", "akili.js");
const SOURCE_SKILLS = path.join(__dirname, "..", ".claude", "skills");
const TEMPLATES = path.join(__dirname, "..", ".claude", "templates");
const PERSONAS = ["leader.md", "implementer.md", "reviewer.md", "tester.md"];
const SIX = ["nestjs", "nestjs-auth", "nestjs-data", "nestjs-feature", "nestjs-production", "nestjs-testing"];

function stripAnsi(text) {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

function mkHome(t, prefix = "akili-suiteA-") {
  const home = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix)));
  t.after(() => fs.rmSync(home, { recursive: true, force: true }));
  return home;
}

function run(home, args) {
  const r = spawnSync(process.execPath, [AKILI_BIN, ...args], {
    cwd: home,
    encoding: "utf8",
    env: Object.assign({}, process.env, { HOME: home, USERPROFILE: home }),
  });
  return { status: r.status, out: stripAnsi((r.stdout || "") + (r.stderr || "")) };
}

function snapshot(dir) {
  const out = {};
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full);
      else out[path.relative(dir, full).split(path.sep).join("/")] = fs.readFileSync(full).toString("hex");
    }
  })(dir);
  return out;
}

const sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");

// "  CLAUDE       INCOMPLETE  ok 59 | missing 1 | fixed 0"
function summaryCounts(out, label) {
  const m = new RegExp(`^\\s*${label}\\s+\\S+\\s+ok (\\d+) \\| missing (\\d+) \\| fixed (\\d+)`, "m").exec(out);
  assert.ok(m, `no ${label} summary row in:\n${out}`);
  return { ok: Number(m[1]), missing: Number(m[2]), fixed: Number(m[3]) };
}

// ---- FR-3: delivery to Grok Bot -------------------------------------------

test("@akili-spec changes/nestjs-official-skills FR-3 (grokbot): install delivers the six folders byte-equal to the vendored trees and doctor reports each OK", (t) => {
  const home = mkHome(t);
  const workflows = path.join(home, ".grokbot", "workflows");

  const install = run(home, ["install", "--tool", "grokbot", "--local"]);
  assert.equal(install.status, 0, install.out);
  for (const name of SIX) {
    const dir = path.join(workflows, name);
    assert.ok(fs.existsSync(path.join(dir, "SKILL.md")), `THEN ${name} is delivered under the Grok Bot workflows root`);
    assert.deepEqual(snapshot(dir), snapshot(path.join(SOURCE_SKILLS, name)), `AND ${name} equals the vendored tree (UPSTREAM.md, LICENSE, references)`);
  }

  const doctor = run(home, ["doctor", "--tool", "grokbot", "--local"]);
  assert.equal(doctor.status, 0, doctor.out);
  for (const name of SIX) assert.match(doctor.out, new RegExp(`^\\s*OK ${name}$`, "m"), `AND doctor counts ${name}`);
});

// ---- FR-3: foreign folder without the .nestjs-skills marker ---------------

for (const [tool, rel] of [["claude", ".claude/skills"], ["codex", ".agents/skills"]]) {
  test(`@akili-spec changes/nestjs-official-skills FR-3 (${tool}, no marker): a folder without UPSTREAM.md or .nestjs-skills is skipped whole and reported foreign without the npx note`, (t) => {
    const home = mkHome(t);
    const dir = path.join(home, ...rel.split("/"), "nestjs-data");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "SKILL.md"), "---\nname: nestjs-data\n---\nhand-written\n");
    const before = snapshot(dir);

    const r = run(home, ["install", "--tool", tool, "--local"]);

    assert.equal(r.status, 0, r.out);
    const lines = r.out.split("\n").filter((l) => /skip foreign/.test(l) && /nestjs-data/.test(l));
    assert.equal(lines.length, 1, `THEN one skip foreign line names it:\n${r.out}`);
    assert.doesNotMatch(lines[0], /installed by npx @nestjs\/skills/, "BUT the marker note is printed only when the marker is present");
    assert.deepEqual(snapshot(dir), before, "AND the folder is byte-identical (no merge)");
    for (const name of SIX.filter((n) => n !== "nestjs-data")) {
      assert.ok(fs.existsSync(path.join(path.dirname(dir), name, "UPSTREAM.md")), `AND ${name} is written`);
    }
  });
}

// ---- FR-3: doctor counts the six -------------------------------------------

test("@akili-spec changes/nestjs-official-skills FR-3 (doctor): the six count like any packaged skill: MISSING when absent, FIXED and restored by --fix", (t) => {
  const home = mkHome(t);
  const root = path.join(home, ".claude", "skills");
  assert.equal(run(home, ["install", "--tool", "claude", "--local"]).status, 0);
  const full = run(home, ["doctor", "--tool", "claude", "--local"]);
  assert.equal(full.status, 0, full.out);
  const base = summaryCounts(full.out, "CLAUDE");
  assert.equal(base.missing, 0);

  for (const name of SIX) fs.rmSync(path.join(root, name), { recursive: true, force: true });
  const broken = run(home, ["doctor", "--tool", "claude", "--local"]);
  for (const name of SIX) assert.match(broken.out, new RegExp(`^\\s*MISSING ${name}$`, "m"), `THEN ${name} is reported MISSING`);
  assert.deepEqual(summaryCounts(broken.out, "CLAUDE"), { ok: base.ok - 6, missing: 6, fixed: 0 }, "AND the summary counts exactly the six");
  assert.notEqual(broken.status, 0, "AND a missing official skill fails doctor like any other");

  const fixed = run(home, ["doctor", "--tool", "claude", "--local", "--fix"]);
  for (const name of SIX) {
    assert.match(fixed.out, new RegExp(`^\\s*FIXED ${name}$`, "m"));
    assert.deepEqual(snapshot(path.join(root, name)), snapshot(path.join(SOURCE_SKILLS, name)), `AND --fix restores ${name} whole`);
  }
});

// ---- FR-4: gsap-* messages keep naming gsap-animation ---------------------

test("@akili-spec changes/nestjs-official-skills FR-4 (gsap): REMOVED and the install deletion line still name gsap-animation", (t) => {
  const home = mkHome(t);
  const root = path.join(home, ".claude", "skills");
  run(home, ["install", "--tool", "claude", "--local"]);
  const leftover = (name) => {
    fs.mkdirSync(path.join(root, name), { recursive: true });
    fs.writeFileSync(path.join(root, name, "SKILL.md"), "---\nname: old\n---\n");
  };

  leftover("gsap-react");
  const fix = run(home, ["doctor", "--tool", "claude", "--local", "--fix"]);
  assert.match(fix.out, /REMOVED gsap-react \(retired, replaced by gsap-animation\)/);
  assert.doesNotMatch(fix.out, /gsap-react[^\n]*nestjs/, "BUT never the NestJS replacement");
  assert.equal(fs.existsSync(path.join(root, "gsap-react")), false);

  leftover("gsap-timeline");
  const inst = run(home, ["install", "--tool", "claude", "--local"]);
  assert.match(inst.out, /deleted retired skill .*gsap-timeline \(replaced by gsap-animation\)/);
  assert.equal(fs.existsSync(path.join(root, "gsap-timeline")), false);
});

// ---- FR-5: Skill Map scan survives --fix ----------------------------------

function mkProject(t) {
  const dir = mkHome(t, "akili-suiteA-proj-");
  fs.mkdirSync(path.join(dir, ".agents"));
  for (const f of PERSONAS) fs.copyFileSync(path.join(TEMPLATES, f), path.join(dir, ".agents", f));
  return dir;
}

const RETIRED = "nestjs-" + "expert"; // built, so the retirement surface scan finds no literal
const SKILL_MAP = `# Project\n## Skill Map\n| Stack | Skill |\n| NestJS | \`${RETIRED}\` |\n## History\n${RETIRED}\n`;
const retiredLines = (out) => out.split("\n").filter((l) => /RETIRED/.test(l));

function mkOutdatedProject(t) {
  const dir = mkProject(t);
  const tester = path.join(dir, ".agents", "tester.md");
  const stripped = fs.readFileSync(tester, "utf8").replace(/<!-- akili:section id=test-report[\s\S]*?<!-- \/akili:section -->\n/, "");
  assert.ok(!/id=test-report/.test(stripped), "precondition: a section was removed");
  fs.writeFileSync(tester, stripped);
  return { dir, tester };
}

test("@akili-spec changes/nestjs-official-skills FR-5 (CLAUDE.md only, --fix rewrites a persona): RETIRED printed, CLAUDE.md byte-identical, persona fixed, exit equals the persona-only run", (t) => {
  const FIX = ["doctor", "--agents", "--fix", "--allow-branch", "--force"];
  const twin = mkOutdatedProject(t);
  const personaOnly = run(twin.dir, FIX);
  assert.equal(retiredLines(personaOnly.out).length, 0);

  const { dir, tester } = mkOutdatedProject(t);
  const claude = path.join(dir, "CLAUDE.md");
  fs.writeFileSync(claude, SKILL_MAP);
  const before = sha(claude);

  const r = run(dir, FIX);
  assert.equal(r.status, personaOnly.status, "AND the warning alone does not change the exit status");

  const lines = retiredLines(r.out);
  assert.equal(lines.length, 1, r.out);
  assert.match(lines[0], new RegExp(`RETIRED ${RETIRED} \\(CLAUDE\\.md:4\\)`));
  assert.match(lines[0], /nestjs-feature/);
  assert.match(r.out, /INSERTED\s+test-report/, "AND --fix really wrote a persona in the same run");
  assert.match(fs.readFileSync(tester, "utf8"), /id=test-report/);
  assert.equal(sha(claude), before, "BUT CLAUDE.md is not changed by a byte");
  assert.equal(fs.existsSync(path.join(dir, "AGENTS.md")), false, "AND no AGENTS.md is created");
});

function git(dir, args) {
  return spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@example.invalid", "-c", "commit.gpgsign=false", ...args], { cwd: dir, encoding: "utf8" });
}

test("@akili-spec changes/nestjs-official-skills FR-5 (--fix refused by the branch guard): RETIRED still printed, AGENTS.md byte-identical, exit equals the run without the row", (t) => {
  if (spawnSync("git", ["--version"]).status !== 0) {
    t.skip("git not available");
    return;
  }
  const dir = mkProject(t);
  const agents = path.join(dir, "AGENTS.md");
  fs.writeFileSync(agents, "# Project\n## Skill Map\n| Stack | Skill |\n");
  assert.equal(git(dir, ["init", "-q", "-b", "feat/x"]).status, 0);
  assert.equal(git(dir, ["add", "-A"]).status, 0);
  assert.equal(git(dir, ["commit", "-q", "-m", "init"]).status, 0);

  const without = run(dir, ["doctor", "--agents", "--fix"]);
  assert.match(without.out, /REFUSED \(branch:/, `precondition: the guard refuses:\n${without.out}`);
  assert.equal(retiredLines(without.out).length, 0);

  fs.writeFileSync(agents, SKILL_MAP);
  const before = sha(agents);
  const withRow = run(dir, ["doctor", "--agents", "--fix"]);

  assert.match(withRow.out, /REFUSED \(branch:/);
  const lines = retiredLines(withRow.out);
  assert.equal(lines.length, 1, withRow.out);
  assert.match(lines[0], new RegExp(`RETIRED ${RETIRED} \\(AGENTS\\.md:4\\)`));
  assert.ok(withRow.out.indexOf("RETIRED") < withRow.out.indexOf("REFUSED"), "AND the scan runs before the guard stops the run");
  assert.equal(withRow.status, without.status, "AND the warning does not change the exit status");
  assert.equal(sha(agents), before, "BUT AGENTS.md is not changed by a byte");
});
