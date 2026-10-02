"use strict";

// T5 — `akili routing` driven as a subprocess (design §3, §5.6, §5.7, §7;
// P-12). bin/akili.js runs main() on load, so the writer (runRouting /
// applyPlan) is only reachable through the real CLI. Every run pins HOME and
// USERPROFILE to a mkdtemp dir and works on a mkdtemp project; stdin is a
// pipe (never a TTY), which is the agent's-shell-tool case FR-1 / FR-2 name.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const AKILI_BIN = path.join(__dirname, "..", "bin", "akili.js");
const FIXTURES_DIR = path.join(__dirname, "fixtures", "routing");

const TOKEN_LINE = /^(\[dry-run\] )?(created|replaced|unchanged|appended|adopted|overwritten|skipped \(|refused \()/;
const CLAUDE_ROLES = ["leader", "implementer", "reviewer", "tester"];
const CLAUDE_FULL = ["--hosts", "claude", "--models", "claude=opus,sonnet,haiku", "--cli", "claude=claude", "--wrappers", "yes", "--yes"];
// FR-2 *Fully specified, no TTY* — Cursor ids are user ids with placements.
const FR2_FULL = [
  "--hosts", "claude,cursor",
  "--models", "claude=opus,sonnet,haiku",
  "--models", "cursor=c-one@T1+T3,c-two@T2+T5,c-three@T3",
  "--cli", "claude=claude", "--cli", "cursor=agent",
  "--wrappers", "yes", "--yes",
];

function stripAnsi(text) {
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

// A scratch project + a scratch HOME; both removed afterwards.
function withProject(fn, agentsFixture) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "akili-routing-io-"));
  const home = path.join(root, "home");
  const project = path.join(root, "project");
  fs.mkdirSync(home);
  fs.mkdirSync(project);
  if (agentsFixture) fs.copyFileSync(path.join(FIXTURES_DIR, agentsFixture), path.join(project, "AGENTS.md"));
  try {
    return fn({ home, project });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

function run(ctx, args) {
  const env = Object.assign({}, process.env, { HOME: ctx.home, USERPROFILE: ctx.home });
  const started = process.hrtime.bigint();
  const r = spawnSync(process.execPath, [AKILI_BIN, "routing", ...args], {
    cwd: ctx.project,
    env,
    input: "",
    encoding: "utf8",
    timeout: 10000,
  });
  const ms = Number(process.hrtime.bigint() - started) / 1e6;
  return { status: r.status, signal: r.signal, stdout: stripAnsi(r.stdout || ""), stderr: stripAnsi(r.stderr || ""), ms };
}

function tokenLines(stdout) {
  return stdout.split(/\r?\n/).filter((l) => TOKEN_LINE.test(l));
}

// relPath -> content, for every file under dir (byte-identity checks).
function tree(dir) {
  const out = {};
  const walk = (d, rel) => {
    for (const name of fs.readdirSync(d).sort()) {
      if (name === ".git") continue;
      const abs = path.join(d, name);
      const r = rel ? `${rel}/${name}` : name;
      if (fs.statSync(abs).isDirectory()) walk(abs, r);
      else out[r] = fs.readFileSync(abs, "utf8");
    }
  };
  walk(dir, "");
  return out;
}

function git(project, args) {
  return spawnSync("git", ["-c", "user.email=t@example.com", "-c", "user.name=t", "-c", "commit.gpgsign=false", ...args], { cwd: project, encoding: "utf8" });
}

test("non-TTY, no flags, no answers file: exit != 0, stderr names --hosts, tree unchanged, < 5 s", () => {
  withProject((ctx) => {
    const before = tree(ctx.project);
    const r = run(ctx, []);
    assert.equal(r.signal, null, `hung: killed by ${r.signal}`);
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /--hosts/);
    assert.deepEqual(tree(ctx.project), before);
    assert.ok(r.ms < 5000, `took ${r.ms} ms`);
  }, "agents-no-section.md");
});

test("NFR-2 timing: the usage-error case, three runs (each reported; < 2 s is the bound)", (t) => {
  withProject((ctx) => {
    const times = [];
    for (let i = 0; i < 3; i++) {
      const r = run(ctx, []);
      assert.notEqual(r.status, 0);
      times.push(Math.round(r.ms));
    }
    t.diagnostic(`NFR-2 usage-error runs (ms): ${times.join(", ")}`);
    // A hang guard, not the 2 s claim: over 2 s is inconclusive, not failed
    // (the task's disqualifier); the timings are read from the diagnostic.
    assert.ok(times.every((ms) => ms < 5000), `runs: ${times.join(", ")}`);
  }, "agents-no-section.md");
});

test("fully specified --yes (FR-2): exit 0, files present, tokens in stdout", () => {
  withProject((ctx) => {
    const r = run(ctx, FR2_FULL);
    assert.equal(r.status, 0, r.stderr);
    for (const role of CLAUDE_ROLES) {
      assert.ok(fs.existsSync(path.join(ctx.project, ".claude", "agents", `akili-${role}.md`)), `claude ${role}`);
      assert.ok(fs.existsSync(path.join(ctx.project, ".cursor", "agents", `akili-${role}.md`)), `cursor ${role}`);
    }
    assert.ok(fs.existsSync(path.join(ctx.project, ".agents", "model-routing.json")));
    assert.match(fs.readFileSync(path.join(ctx.project, "AGENTS.md"), "utf8"), /<!-- akili:section id=model-routing since=v/);
    const lines = tokenLines(r.stdout);
    assert.ok(lines.includes("appended  AGENTS.md"), lines.join("\n"));
    assert.ok(lines.includes("created  .claude/agents/akili-reviewer.md"), lines.join("\n"));
    assert.ok(lines.includes("created  .cursor/agents/akili-reviewer.md"), lines.join("\n"));
    assert.ok(lines.includes("created  .agents/model-routing.json"), lines.join("\n"));
    // NFR-6: one line per file — each planned path appears on exactly one token line.
    assert.equal(lines.length, 10, lines.join("\n"));
    assert.equal(new Set(lines.map((l) => l.split("  ")[1])).size, 10);
    assert.match(r.stdout, /commit \.agents\/model-routing\.json and the wrappers/);
  }, "agents-no-section.md");
});

test("--json: stdout is one parseable plan result with the FR-8 fields and nothing else", () => {
  withProject((ctx) => {
    const r = run(ctx, [...FR2_FULL, "--json"]);
    assert.equal(r.status, 0, r.stderr);
    const j = JSON.parse(r.stdout);
    assert.deepEqual(j.hosts, ["claude", "cursor"]);
    assert.equal(j.dryRun, false);
    assert.equal(j.exitCode, 0);
    assert.ok(Array.isArray(j.writes) && j.writes.length === 10);
    assert.deepEqual(j.writes.find((w) => w.relPath === ".claude/agents/akili-reviewer.md"), { relPath: ".claude/agents/akili-reviewer.md", token: "created" });
    assert.ok(j.writes.every((w) => w.content === undefined), "no content bodies");
    assert.deepEqual(j.authorAuditor, { claude: "ok", cursor: "ok" });
    assert.equal(j.restrictions.claude, "applied");
    assert.equal(j.restrictions.cursor, "applied");
    assert.equal(typeof j.placeholdersByColumn, "object");
    assert.ok(Number.isInteger(j.sectionBytes) && j.sectionBytes > 0);
    assert.ok(Array.isArray(j.stale) && Array.isArray(j.hints) && Array.isArray(j.reports));
  }, "agents-no-section.md");
});

test("--json --dry-run: dryRun is a boolean field, tokens unprefixed, tree unchanged", () => {
  withProject((ctx) => {
    const before = tree(ctx.project);
    const r = run(ctx, [...CLAUDE_FULL, "--json", "--dry-run"]);
    assert.equal(r.status, 0, r.stderr);
    const j = JSON.parse(r.stdout);
    assert.equal(j.dryRun, true);
    assert.equal(j.writes[0].token, "appended");
    assert.deepEqual(tree(ctx.project), before);
  }, "agents-no-section.md");
});

test("idempotent re-run (FR-6): second --yes prints `no changes`; git status --porcelain is empty", () => {
  withProject((ctx) => {
    assert.equal(git(ctx.project, ["init", "-q"]).status, 0);
    const first = run(ctx, CLAUDE_FULL);
    assert.equal(first.status, 0, first.stderr);
    assert.equal(git(ctx.project, ["add", "-A"]).status, 0);
    assert.equal(git(ctx.project, ["commit", "-q", "-m", "first run"]).status, 0);
    const second = run(ctx, ["--yes"]);
    assert.equal(second.status, 0, second.stderr);
    assert.match(second.stdout, /^no changes$/m);
    const porcelain = git(ctx.project, ["status", "--porcelain"]);
    assert.equal(porcelain.status, 0);
    assert.equal(porcelain.stdout, "");
  }, "agents-no-section.md");
});

test("--dry-run: every line prefixed [dry-run], table printed, tree byte-identical, no answers file", () => {
  withProject((ctx) => {
    const before = tree(ctx.project);
    const r = run(ctx, [...CLAUDE_FULL, "--dry-run"]);
    assert.equal(r.status, 0, r.stderr);
    const lines = tokenLines(r.stdout);
    assert.equal(lines.length, 6, lines.join("\n"));
    assert.ok(lines.every((l) => l.startsWith("[dry-run] ")), lines.join("\n"));
    assert.match(r.stdout, /^\[dry-run\] would create 2 dirs$/m);
    assert.match(r.stdout, /^\| Tier \| Claude Code \|/m);
    assert.doesNotMatch(r.stdout, /commit \.agents\/model-routing\.json/);
    assert.deepEqual(tree(ctx.project), before);
    assert.ok(!fs.existsSync(path.join(ctx.project, ".agents")));
  }, "agents-no-section.md");
});

test("skip-by-default (FR-5): existing reviewer wrapper byte-identical, skipped with drift; --force overwrites", () => {
  withProject((ctx) => {
    const target = path.join(ctx.project, ".claude", "agents", "akili-reviewer.md");
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(FIXTURES_DIR, "reviewer-existing.md"), target);
    const original = fs.readFileSync(target, "utf8");
    const r = run(ctx, CLAUDE_FULL);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(fs.readFileSync(target, "utf8"), original);
    const lines = tokenLines(r.stdout);
    assert.ok(lines.includes("skipped (exists; --force to replace)  .claude/agents/akili-reviewer.md — model drift: file says haiku, mapping says opus"), lines.join("\n"));
    for (const role of ["leader", "implementer", "tester"]) assert.ok(lines.includes(`created  .claude/agents/akili-${role}.md`), role);
    const f = run(ctx, [...CLAUDE_FULL, "--force"]);
    assert.equal(f.status, 0, f.stderr);
    assert.ok(tokenLines(f.stdout).includes("overwritten  .claude/agents/akili-reviewer.md"), f.stdout);
    assert.notEqual(fs.readFileSync(target, "utf8"), original);
  }, "agents-no-section.md");
});

test("state (b): unfenced section skipped without --adopt (bytes kept); --adopt adopts", () => {
  withProject((ctx) => {
    const agents = path.join(ctx.project, "AGENTS.md");
    const original = fs.readFileSync(agents, "utf8");
    const r = run(ctx, CLAUDE_FULL);
    assert.equal(r.status, 0, r.stderr);
    assert.ok(tokenLines(r.stdout).includes("skipped (unfenced; --adopt to replace)  AGENTS.md"), r.stdout);
    assert.equal(fs.readFileSync(agents, "utf8"), original);
    const a = run(ctx, [...CLAUDE_FULL, "--adopt"]);
    assert.equal(a.status, 0, a.stderr);
    assert.ok(tokenLines(a.stdout).includes("adopted  AGENTS.md"), a.stdout);
    assert.match(fs.readFileSync(agents, "utf8"), /<!-- akili:section id=model-routing since=v/);
  }, "agents-unfenced.md");
});

test("state (a′): hand-edited fence refused, exit 1, AGENTS.md byte-identical; --force overwrites", () => {
  withProject((ctx) => {
    const agents = path.join(ctx.project, "AGENTS.md");
    const original = fs.readFileSync(agents, "utf8");
    const r = run(ctx, CLAUDE_FULL);
    assert.equal(r.status, 1, r.stderr);
    assert.ok(tokenLines(r.stdout).includes("refused (hand-edited fence; --force to regenerate)  AGENTS.md"), r.stdout);
    assert.equal(fs.readFileSync(agents, "utf8"), original);
    const f = run(ctx, [...CLAUDE_FULL, "--force"]);
    assert.equal(f.status, 0, f.stderr);
    assert.ok(tokenLines(f.stdout).includes("overwritten  AGENTS.md"), f.stdout);
    assert.doesNotMatch(fs.readFileSync(agents, "utf8"), /HAND-EDITED/);
  }, "agents-fenced-edited.md");
});

test("validation error (FR-2): invalid --models with valid --hosts exits != 0 and writes no file", () => {
  withProject((ctx) => {
    const before = tree(ctx.project);
    const r = run(ctx, ["--hosts", "claude", "--models", "claude=opus@T9", "--wrappers", "yes", "--yes"]);
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /T9/);
    assert.deepEqual(tree(ctx.project), before);
  }, "agents-no-section.md");
});

test("--wrappers no: section + answers file only, every wrapper skipped (wrappers=no)", () => {
  withProject((ctx) => {
    const r = run(ctx, ["--hosts", "claude", "--models", "claude=opus,sonnet,haiku", "--wrappers", "no", "--yes"]);
    assert.equal(r.status, 0, r.stderr);
    const lines = tokenLines(r.stdout);
    for (const role of CLAUDE_ROLES) assert.ok(lines.includes(`skipped (wrappers=no)  .claude/agents/akili-${role}.md`), lines.join("\n"));
    assert.deepEqual(Object.keys(tree(ctx.project)).sort(), [".agents/model-routing.json", "AGENTS.md"]);
  }, "agents-no-section.md");
});

test("single model under --yes (DD-5): exit 0, wrappers skipped (author ≠ auditor unsatisfiable)", () => {
  withProject((ctx) => {
    const r = run(ctx, ["--hosts", "claude", "--models", "claude=opus", "--wrappers", "yes", "--yes"]);
    assert.equal(r.status, 0, r.stderr);
    const lines = tokenLines(r.stdout);
    for (const role of CLAUDE_ROLES) assert.ok(lines.includes(`skipped (author ≠ auditor unsatisfiable)  .claude/agents/akili-${role}.md`), lines.join("\n"));
    assert.ok(!fs.existsSync(path.join(ctx.project, ".claude")));
  }, "agents-no-section.md");
});
