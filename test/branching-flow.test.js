// @akili-spec changes/branching-flow-dev-next
// Static textual locks on the workflow files (no YAML dependency).
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, ".github", "workflows", f), "utf8");

// Text between "  push:" and the next 2-space-indented key.
function pushBlock(text) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((l) => l === "  push:");
  assert.notEqual(start, -1, "no `  push:` under on:");
  const out = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (/^ {2}\S/.test(lines[i])) break;
    out.push(lines[i]);
  }
  return out.join("\n");
}

for (const f of ["ci.yml", "release-status.yml"]) {
  test(`${f}: push block names master and dev`, () => {
    const block = pushBlock(read(f));
    assert.match(block, /\bmaster\b/);
    assert.match(block, /\bdev\b/);
  });
}

test("ci.yml keeps triggers, inputs, job name and matrix", () => {
  const t = read("ci.yml");
  for (const s of [
    "pull_request:",
    "workflow_dispatch:",
    "pty_loops",
    "pty_inject_failure",
    "os: [ubuntu-latest, macos-latest, windows-latest]",
    "node: [18, 22]",
  ]) {
    assert.ok(t.includes(s), `missing ${s}`);
  }
  assert.ok(
    t.split(/\r?\n/).includes("    name: CLI on ${{ matrix.os }} / Node ${{ matrix.node }}"),
    "job name line changed"
  );
});

test("release-status.yml keeps pull_request and workflow_dispatch", () => {
  const t = read("release-status.yml");
  assert.ok(t.includes("pull_request:"));
  assert.ok(t.includes("workflow_dispatch:"));
});

test("ci.yml syntax step checks every script", () => {
  const t = read("ci.yml");
  for (const s of [
    "bin/akili.js",
    "scripts/parse_tests.js",
    "scripts/release.js",
    "scripts/release-status.js",
    "scripts/notify-slack.js",
    "scripts/release-next.js",
  ]) {
    assert.ok(t.includes(`node --check ${s}`), `missing node --check ${s}`);
  }
});

// --- AGENTS.md: pin and release rules (FR-7) ---
const agents = () => fs.readFileSync(path.join(root, "AGENTS.md"), "utf8");

function releaseRules(text) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((l) => l === "## Release Rules");
  assert.notEqual(start, -1, "no ## Release Rules section");
  const out = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (/^## /.test(lines[i])) break;
    out.push(lines[i]);
  }
  return out.join("\n");
}

test("AGENTS.md pins Integration Branch: dev on the line after Default Branch: master", () => {
  const lines = agents().split(/\r?\n/);
  const i = lines.indexOf("- Default Branch: master");
  assert.notEqual(i, -1, "no `- Default Branch: master` line");
  assert.equal(lines[i + 1], "- Integration Branch: dev");
});

for (const s of ["release:next", "--tag next", "sync/master-into-dev", "merge commit", "--dry-run"]) {
  test(`AGENTS.md Release Rules mention ${s}`, () => {
    assert.ok(releaseRules(agents()).includes(s), `Release Rules missing ${s}`);
  });
}
