"use strict";
// @akili-spec changes/impeccable-audit-fixes/install-stale-skills
//
// Tester gap suite: clauses the author tests in install-compare.test.js and
// install-stale-skills.test.js do not prove — NFR-1/NFR-2 across every desktop
// target in one global run, CRLF end to end, foreign lines keeping their own
// count (FR-2), the `+N more` cap through the CLI (FR-1), and FR-4's negative
// for roots outside the home directory. Expected values are inlined from
// requirements.md §6–§7 (spec commit 09bcdc2); no spec file is read at runtime.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const AKILI_BIN = path.join(__dirname, "..", "bin", "akili.js");
const stripAnsi = (s) => s.replace(/\x1b\[[0-9;]*m/g, ""); // eslint-disable-line no-control-regex

function mkDir(t, prefix) {
  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix || "akili-gaps-")));
  t.after(() => fs.rmSync(d, { recursive: true, force: true }));
  return d;
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

const row = (out, label) => out.split("\n").find((l) => l.startsWith(`  ${label} `)) || "";
const edit = (...p) => fs.appendFileSync(path.join(...p), "\nlocal edit\n");

test("NFR-1/NFR-2: a global --tool all re-install classifies every desktop target, writes nothing, exit 0; CRLF reads differs", (t) => {
  const home = mkDir(t);
  assert.equal(run(home, ["install", "--tool", "all"]).status, 0);
  edit(home, ".claude", "skills", "impeccable-bridge", "SKILL.md");
  edit(home, ".config", "opencode", "commands", "akili-quick.md");
  edit(home, ".gemini", "skills", "tdd", "SKILL.md");
  // Shared Agent Skills root (Codex + Cursor): LF -> CRLF only, same text.
  const shared = path.join(home, ".agents", "skills", "akili-quick", "SKILL.md");
  const lf = fs.readFileSync(shared, "utf8");
  assert.ok(!lf.includes("\r\n") && lf.includes("\n"), "fixture must start LF");
  fs.writeFileSync(shared, lf.replace(/\n/g, "\r\n"));
  const before = snapshot(home);
  const r = run(home, ["install", "--tool", "all"]);
  assert.equal(r.status, 0, r.out);
  assert.deepEqual(snapshot(home), before, "NFR-1: no write without --force on any target");
  assert.match(r.out, /skip existing .*impeccable-bridge \(differs: SKILL\.md\)/);
  assert.match(r.out, /skip existing .*opencode[\\/]commands[\\/]akili-quick\.md \(differs: akili-quick\.md\)/);
  assert.match(r.out, /skip existing .*\.gemini[\\/]skills[\\/]tdd \(differs: SKILL\.md\)/);
  assert.match(r.out, /skip existing .*\.agents[\\/]skills[\\/]akili-quick[\\/]SKILL\.md \(differs: SKILL\.md\)/);
  for (const label of ["CLAUDE", "OPENCODE", "ANTIGRAVITY", "CODEX", "CURSOR"]) {
    const m = /skipped (\d+) \(identical (\d+), differs (\d+)\)/.exec(row(r.out, label));
    assert.ok(m, `${label} row lacks the split:\n${r.out}`);
    assert.equal(Number(m[2]) + Number(m[3]), Number(m[1]), `${label}: I + D = N`);
    assert.ok(Number(m[3]) >= 1, `${label}: the edit must count as differs`);
  }
  const d = run(home, ["doctor", "--tool", "all"]);
  assert.equal(d.status, 0, `FR-3: DIFFERS never fails doctor:\n${d.out}`);
  assert.match(d.out, /DIFFERS akili-quick/);
  assert.doesNotMatch(d.out, /All checks passed/);
  // doctor --tool all probes host CLIs (cursor, playwright) that drop their own
  // caches under HOME; assert only that no installed file changed.
  const after = snapshot(home);
  const changed = Object.keys(before).filter((k) => after[k] !== before[k]);
  assert.deepEqual(changed, [], "doctor without --fix rewrites no installed file");
});

test("FR-2: a foreign impeccable/ keeps its own skip line with no class and is not counted as skipped", (t) => {
  const home = mkDir(t);
  assert.equal(run(home, ["install", "--tool", "claude", "--local"]).status, 0);
  fs.rmSync(path.join(home, ".claude", "skills", "impeccable", "UPSTREAM.md"));
  const r = run(home, ["install", "--tool", "claude", "--local"]);
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /^ {2}skip foreign .*[\\/]impeccable \S+$/m);
  assert.doesNotMatch(r.out, /skip existing .*[\\/]impeccable \(/, "foreign must not be classified");
  const m = /skipped (\d+) \(identical (\d+), differs 0\)/.exec(row(r.out, "CLAUDE"));
  assert.ok(m, r.out);
  const skipLines = r.out.split("\n").filter((l) => l.includes("skip existing")).length;
  assert.equal(Number(m[1]), skipLines, "skipped counts skip-existing lines only, not the foreign one");
});

test("FR-1: more than 5 differing files print 5 names then +N more, through the CLI", (t) => {
  const home = mkDir(t);
  assert.equal(run(home, ["install", "--tool", "claude", "--local"]).status, 0);
  const ref = path.join(home, ".claude", "skills", "impeccable", "reference");
  const names = fs.readdirSync(ref).filter((n) => n.endsWith(".md")).sort().slice(0, 7);
  assert.equal(names.length, 7);
  for (const n of names) edit(ref, n);
  const r = run(home, ["install", "--tool", "claude", "--local"]);
  const line = r.out.split("\n").find((l) => /skip existing .*[\\/]impeccable \(/.test(l)) || "";
  const shown = names.slice(0, 5).map((n) => `reference/${n}`).join(", ");
  assert.ok(line.endsWith(`(differs: ${shown}, +2 more)`), line || r.out);
});

test("FR-4: a global run whose roots all lie outside home prints no Home: (Claude --target, Grok Bot box)", (t) => {
  const home = mkDir(t);
  const outside = mkDir(t, "akili-gaps-outside-");
  const c = run(home, ["install", "--tool", "claude", "--target", path.join(outside, "claude")]);
  assert.equal(c.status, 0, c.out);
  assert.match(c.out, /CLAUDE\s+installed [1-9]/, c.out);
  assert.doesNotMatch(c.out, /Home:/);
  const g = run(home, ["install", "--tool", "grokbot", "--grokbot-target", path.join(outside, "wf"),
    "--grokbot-resources-target", path.join(outside, "res")]);
  assert.equal(g.status, 0, g.out);
  assert.doesNotMatch(g.out, /Home:/);
  // Positive control: the same run with a root under home does print it.
  const h = run(home, ["install", "--tool", "claude", "--target", path.join(home, "inside")]);
  assert.match(h.out, /^ {2}Home: /m);
});
