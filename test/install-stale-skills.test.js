"use strict";
// @akili-spec changes/impeccable-audit-fixes/install-stale-skills
//
// T2 (FR-1 scenario 1, FR-2, FR-4): `install` classifies every skipped entry as
// identical or differs, splits the summary counts, words the next steps by
// class, and names the home a global install resolved from. Every test drives
// the real CLI as a subprocess with HOME and cwd pinned to a scratch directory.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const AKILI_BIN = path.join(__dirname, "..", "bin", "akili.js");

function stripAnsi(text) {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

function mkHome(t) {
  const home = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "akili-stale-")));
  t.after(() => fs.rmSync(home, { recursive: true, force: true }));
  return home;
}

function run(home, args) {
  const r = spawnSync(process.execPath, [AKILI_BIN, ...args], {
    cwd: home,
    encoding: "utf8",
    env: Object.assign({}, process.env, {
      HOME: home,
      USERPROFILE: home,
      CODEX_HOME: path.join(home, ".codex-env-unused"),
      CURSOR_CONFIG_DIR: path.join(home, ".cursor-env-unused"),
      AKILI_GROKBOT_TARGET: path.join(home, ".grokbot-env-unused", "workflows"),
    }),
  });
  return { status: r.status, out: stripAnsi((r.stdout || "") + (r.stderr || "")) };
}

function install(home, tool, extra) {
  return run(home, ["install", "--tool", tool, ...(extra || [])]);
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

function skipLines(out) {
  return out.split("\n").filter((l) => l.includes("skip existing"));
}

function summaryRow(out) {
  const row = out.split("\n").find((l) => /CLAUDE\s+installed/.test(l));
  assert.ok(row, `no CLAUDE summary row in:\n${out}`);
  return row;
}

function claudeLocal(t) {
  const home = mkHome(t);
  const first = install(home, "claude", ["--local"]);
  assert.equal(first.status, 0, first.out);
  return home;
}

test("second install of an unchanged tree: every skip is (identical), split counts, no replace hint, no writes", (t) => {
  const home = claudeLocal(t);
  const before = snapshot(home);
  const second = install(home, "claude", ["--local"]);
  assert.equal(second.status, 0, second.out);
  const lines = skipLines(second.out);
  assert.ok(lines.length > 10, `expected many skip lines:\n${second.out}`);
  for (const l of lines) assert.match(l, /\(identical\)$/, l);
  const n = lines.length;
  assert.match(summaryRow(second.out), new RegExp(`skipped ${n} \\(identical ${n}, differs 0\\)`));
  assert.match(second.out, /existing entries already match the package\./);
  assert.doesNotMatch(second.out, /differ from the package/);
  assert.deepEqual(snapshot(home), before, "a plain re-install must not write");
});

test("an edited skill is (differs: SKILL.md), counted, hinted with the replace commands, exit 0, file unchanged", (t) => {
  const home = claudeLocal(t);
  const file = path.join(home, ".claude", "skills", "impeccable-bridge", "SKILL.md");
  fs.appendFileSync(file, "\nlocal edit\n");
  const before = snapshot(home);
  const second = install(home, "claude", ["--local"]);
  assert.equal(second.status, 0, second.out);
  assert.match(second.out, /skip existing .*impeccable-bridge \(differs: SKILL\.md\)/);
  assert.match(summaryRow(second.out), /\(identical \d+, differs 1\)/);
  assert.match(second.out, /1 existing entry differs from the package \(stale or locally edited\)/);
  assert.match(second.out, /akili update/);
  assert.match(second.out, /akili install --force/);
  assert.match(second.out, /same --tool, --local and --target flags as this run/);
  assert.doesNotMatch(second.out, /already match the package/);
  assert.deepEqual(snapshot(home), before, "the edited file and tree must be untouched");
});

test("an extra file in an installed skill does not make it differ", (t) => {
  const home = claudeLocal(t);
  fs.writeFileSync(path.join(home, ".claude", "skills", "tdd", "notes.txt"), "mine\n");
  const second = install(home, "claude", ["--local"]);
  assert.match(second.out, /skip existing .*[\\/]tdd \(identical\)/);
  assert.doesNotMatch(second.out, /notes\.txt/);
});

test("--dry-run classifies and writes nothing", (t) => {
  const home = claudeLocal(t);
  fs.appendFileSync(path.join(home, ".claude", "skills", "impeccable-bridge", "SKILL.md"), "\nedit\n");
  const before = snapshot(home);
  const dry = install(home, "claude", ["--local", "--dry-run"]);
  assert.equal(dry.status, 0, dry.out);
  assert.match(dry.out, /impeccable-bridge \(differs: SKILL\.md\)/);
  assert.match(dry.out, /[\\/]tdd \(identical\)/);
  assert.match(summaryRow(dry.out), /differs 1\)/);
  assert.deepEqual(snapshot(home), before);
});

test("--force prints no class suffix and no hint, and replaces the edit", (t) => {
  const home = claudeLocal(t);
  const file = path.join(home, ".claude", "skills", "impeccable-bridge", "SKILL.md");
  fs.appendFileSync(file, "\nLOCALMARK\n");
  const forced = install(home, "claude", ["--local", "--force"]);
  assert.equal(forced.status, 0, forced.out);
  assert.doesNotMatch(forced.out, /\(identical|\(differs/);
  assert.doesNotMatch(forced.out, /differ from the package|already match the package/);
  assert.doesNotMatch(fs.readFileSync(file, "utf8"), /LOCALMARK/);
});

test("Codex --local: an edited command-as-skill SKILL.md is (differs: SKILL.md)", (t) => {
  const home = mkHome(t);
  assert.equal(install(home, "codex", ["--local"]).status, 0);
  const file = path.join(home, ".agents", "skills", "akili-quick", "SKILL.md");
  assert.ok(fs.existsSync(file), "codex command-as-skill missing");
  fs.appendFileSync(file, "\nedit\n");
  const second = install(home, "codex", ["--local"]);
  assert.equal(second.status, 0, second.out);
  assert.match(second.out, /skip existing .*akili-quick[\\/]SKILL\.md \(differs: SKILL\.md\)/);
});

test("Grok Bot: an owned entry replaced by a file is (differs: SKILL.md)", (t) => {
  const home = mkHome(t);
  const wf = path.join(home, "wf");
  const args = ["--grokbot-target", wf];
  assert.equal(install(home, "grokbot", args).status, 0);
  const entry = path.join(wf, "akili-quick");
  fs.rmSync(entry, { recursive: true, force: true });
  fs.writeFileSync(entry, "plain\n");
  const second = install(home, "grokbot", args);
  assert.equal(second.status, 0, second.out);
  assert.match(second.out, /skip existing .*akili-quick \(differs: SKILL\.md\)/);
  assert.equal(fs.readFileSync(entry, "utf8"), "plain\n", "plain install must leave the file");
});

test("identical + differs = skipped on the summary row", (t) => {
  const home = claudeLocal(t);
  fs.appendFileSync(path.join(home, ".claude", "skills", "impeccable-bridge", "SKILL.md"), "\nedit\n");
  fs.appendFileSync(path.join(home, ".claude", "skills", "tdd", "SKILL.md"), "\nedit\n");
  const second = install(home, "claude", ["--local"]);
  const m = /skipped (\d+) \(identical (\d+), differs (\d+)\)/.exec(summaryRow(second.out));
  assert.ok(m, second.out);
  assert.equal(Number(m[2]) + Number(m[3]), Number(m[1]));
  assert.equal(Number(m[3]), 2);
});

test("Home: is printed for a global run under HOME and absent with --local", (t) => {
  const home = mkHome(t);
  const global = install(home, "claude", []);
  assert.equal(global.status, 0, global.out);
  assert.match(global.out, new RegExp(`^ {2}Home: ${home.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "m"));
  const home2 = mkHome(t);
  const local = install(home2, "claude", ["--local"]);
  assert.doesNotMatch(local.out, /Home:/);
});

// ---------------------------------------------------------------------------
// T3 (FR-3): doctor reports DIFFERS as a warning. Exit code and status are the
// same as for a run without it; --fix never overwrites a DIFFERS entry.
// ---------------------------------------------------------------------------

function doctor(home, tool, extra) {
  return run(home, ["doctor", "--tool", tool, ...(extra || [])]);
}

function doctorRow(out, tool) {
  const row = out.split("\n").find((l) => l.startsWith(`  ${tool.toUpperCase()} `));
  assert.ok(row, `no ${tool} doctor row in:\n${out}`);
  return row;
}

test("doctor: an edited skill is DIFFERS, row shows differs 1, hint, exit 0, HEALTHY, no all-clear", (t) => {
  const home = claudeLocal(t);
  fs.appendFileSync(path.join(home, ".claude", "skills", "impeccable-bridge", "SKILL.md"), "\nlocal edit\n");
  const before = snapshot(path.join(home, ".claude"));
  const d = doctor(home, "claude", ["--local"]);
  assert.equal(d.status, 0, d.out);
  assert.match(d.out, /^ {2}DIFFERS impeccable-bridge \(SKILL\.md\)$/m);
  assert.match(doctorRow(d.out, "claude"), /^ {2}CLAUDE\s+HEALTHY\s+ok \d+ \| missing 0 \| fixed 0 \| differs 1$/);
  assert.match(
    d.out,
    /- 1 entry differs from the package: run akili update to replace it \(local edits are overwritten; use the same --tool, --local and --target flags as this run\)\./
  );
  assert.match(d.out, /No missing files\. 1 entry differs from the package \(see above\)\./);
  assert.doesNotMatch(d.out, /All checks passed/);
  assert.deepEqual(snapshot(path.join(home, ".claude")), before, "doctor without --fix must not write");
});

test("doctor: a clean install has no differs column and keeps the all-clear", (t) => {
  const home = claudeLocal(t);
  const d = doctor(home, "claude", ["--local"]);
  assert.equal(d.status, 0, d.out);
  assert.doesNotMatch(d.out, /differs|DIFFERS/);
  assert.match(d.out, /All checks passed\. Your installation is complete and healthy\./);
});

test("doctor --fix leaves a DIFFERS file byte-unchanged, exit 0, no repaired line when nothing was missing", (t) => {
  const home = claudeLocal(t);
  const file = path.join(home, ".claude", "skills", "impeccable-bridge", "SKILL.md");
  fs.appendFileSync(file, "\nLOCALMARK\n");
  const before = snapshot(path.join(home, ".claude"));
  const d = doctor(home, "claude", ["--local", "--fix"]);
  assert.equal(d.status, 0, d.out);
  assert.match(d.out, /DIFFERS impeccable-bridge/);
  assert.doesNotMatch(d.out, /All issues repaired/);
  assert.deepEqual(snapshot(path.join(home, ".claude")), before, "--fix must not overwrite a DIFFERS entry");
});

test("doctor --fix that repaired something prints the repaired line, then the differing count", (t) => {
  const home = claudeLocal(t);
  fs.appendFileSync(path.join(home, ".claude", "skills", "impeccable-bridge", "SKILL.md"), "\nLOCALMARK\n");
  fs.rmSync(path.join(home, ".claude", "skills", "tdd"), { recursive: true, force: true });
  const d = doctor(home, "claude", ["--local", "--fix"]);
  assert.equal(d.status, 0, d.out);
  assert.match(d.out, /All issues repaired: 1 file\(s\) restored\.\n1 entry differs from the package \(see above\)\./);
  assert.match(fs.readFileSync(path.join(home, ".claude", "skills", "impeccable-bridge", "SKILL.md"), "utf8"), /LOCALMARK/);
  assert.ok(fs.existsSync(path.join(home, ".claude", "skills", "tdd", "SKILL.md")));
});

test("doctor Antigravity --local: an edit only in the second skills dir is DIFFERS", (t) => {
  const home = mkHome(t);
  assert.equal(install(home, "antigravity", ["--local"]).status, 0);
  const second = path.join(home, ".gemini", "skills", "impeccable-bridge", "SKILL.md");
  assert.ok(fs.existsSync(second), "second skills dir copy missing");
  fs.appendFileSync(second, "\nedit\n");
  const d = doctor(home, "antigravity", ["--local"]);
  assert.equal(d.status, 0, d.out);
  assert.match(d.out, /DIFFERS impeccable-bridge \(2:SKILL\.md\)/);
  assert.match(doctorRow(d.out, "antigravity"), /differs 1$/);
});

test("doctor: a foreign impeccable/ (no UPSTREAM.md) is not compared", (t) => {
  const home = claudeLocal(t);
  const dir = path.join(home, ".claude", "skills", "impeccable");
  fs.rmSync(path.join(dir, "UPSTREAM.md"), { force: true });
  fs.appendFileSync(path.join(dir, "SKILL.md"), "\nmy own impeccable\n");
  const d = doctor(home, "claude", ["--local"]);
  assert.equal(d.status, 0, d.out);
  assert.match(d.out, /^ {2}OK impeccable \(not AKILI's copy; not compared\)$/m);
  assert.doesNotMatch(d.out, /DIFFERS/);
  assert.doesNotMatch(doctorRow(d.out, "claude"), /differs/);
});

test("doctor Grok Bot: an edited owned entry is DIFFERS (exit 0); a foreign one is still FOREIGN (exit 1)", (t) => {
  const home = mkHome(t);
  const wf = path.join(home, "wf");
  const res = path.join(home, "res");
  const args = ["--grokbot-target", wf, "--grokbot-resources-target", res];
  const first = install(home, "grokbot", args);
  assert.equal(first.status, 0, first.out);
  fs.appendFileSync(path.join(wf, "akili-quick", "SKILL.md"), "\nedit\n");
  fs.appendFileSync(path.join(wf, "tdd", "SKILL.md"), "\nedit\n");
  const d = doctor(home, "grokbot", args);
  assert.equal(d.status, 0, d.out);
  assert.match(d.out, /^ {2}DIFFERS akili-quick\.md \(SKILL\.md\)$/m);
  assert.match(d.out, /^ {2}DIFFERS tdd \(SKILL\.md\)$/m);
  assert.match(doctorRow(d.out, "grokbot"), /foreign 0 \| differs 2$/);
  // A same-name entry nobody recorded stays FOREIGN, exit 1.
  const home2 = mkHome(t);
  const wf2 = path.join(home2, "wf");
  fs.mkdirSync(path.join(wf2, "tdd"), { recursive: true });
  fs.writeFileSync(path.join(wf2, "tdd", "SKILL.md"), "someone else's\n");
  const args2 = ["--grokbot-target", wf2, "--grokbot-resources-target", path.join(home2, "res")];
  const f = doctor(home2, "grokbot", args2);
  assert.equal(f.status, 1, f.out);
  assert.match(f.out, /FOREIGN tdd/);
  assert.doesNotMatch(f.out, /DIFFERS tdd/);
});

test("doctor: an edited resource is DIFFERS", (t) => {
  const home = claudeLocal(t);
  const file = path.join(home, ".claude", "akili", "templates", "leader.md");
  assert.ok(fs.existsSync(file), "resource missing");
  fs.appendFileSync(file, "\nedit\n");
  const d = doctor(home, "claude", ["--local"]);
  assert.equal(d.status, 0, d.out);
  assert.match(d.out, /^ {2}DIFFERS .*templates[\\/]leader\.md \(leader\.md\)$/m);
  assert.match(doctorRow(d.out, "claude"), /differs 1$/);
});

test("doctor: one missing and one differing entry exit 1 and report both, hint once", (t) => {
  const home = claudeLocal(t);
  fs.appendFileSync(path.join(home, ".claude", "skills", "impeccable-bridge", "SKILL.md"), "\nedit\n");
  fs.rmSync(path.join(home, ".claude", "skills", "tdd"), { recursive: true, force: true });
  const d = doctor(home, "claude", ["--local"]);
  assert.equal(d.status, 1, d.out);
  assert.match(d.out, /MISSING tdd/);
  assert.match(d.out, /DIFFERS impeccable-bridge/);
  assert.match(doctorRow(d.out, "claude"), /INCOMPLETE.*differs 1$/);
  assert.equal((d.out.match(/differs from the package: run akili update/g) || []).length, 1, d.out);
  assert.doesNotMatch(d.out, /All checks passed|No missing files/);
});

// T4 (FR-5): the shipped docs say what the code does.
const ROOT4 = path.join(__dirname, "..");
const text4 = (...p) => fs.readFileSync(path.join(ROOT4, ...p), "utf8");
const line4 = (s, needle) => s.split("\n").find((l) => l.includes(needle)) || "";

test("docs/cli.md names the skip classes, DIFFERS, the exit rule and --local per worktree", () => {
  const c = text4("docs", "cli.md");
  for (const s of ["(identical)", "(differs", "DIFFERS", "`DIFFERS` never makes doctor fail", "per git worktree"]) {
    assert.ok(c.includes(s), `docs/cli.md lacks ${s}`);
  }
});

test("docs/cli.md ownership row and accepted limit report DIFFERS, not OK", () => {
  const c = text4("docs", "cli.md");
  assert.match(line4(c, "| Owned, present |"), /DIFFERS/);
  assert.doesNotMatch(c, /already has its `SKILL\.md` reads OK/);
  assert.match(line4(c, "already has its `SKILL.md`"), /reads `DIFFERS`/);
});

test("CHANGELOG Unreleased has the install/doctor entry and the reworded sentence", () => {
  const c = text4("CHANGELOG.md");
  const u = c.slice(c.indexOf("## [Unreleased]"), c.indexOf("\n## [", c.indexOf("## [Unreleased]") + 5));
  assert.ok(u.includes("`install` classifies every skipped entry"), "new entry missing");
  assert.ok(u.includes("The installer item from the same audit is handled by the install and doctor entry below."));
  assert.ok(!u.includes("not yet shipped"));
});

test("no shipped file keeps the old 'were preserved' line", () => {
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(d, e.name);
    return e.isDirectory() ? (p.includes(path.join("docs", "specs")) ? [] : walk(p)) : [p];
  });
  const files = [...walk(path.join(ROOT4, "docs")), ...walk(path.join(ROOT4, "bin")), ...walk(path.join(ROOT4, ".claude")), path.join(ROOT4, "README.md")];
  const hits = files.filter((f) => /\.(md|js|json)$/.test(f) && fs.readFileSync(f, "utf8").includes("were preserved"));
  assert.deepEqual(hits, []);
});
