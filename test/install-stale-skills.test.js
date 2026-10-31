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
