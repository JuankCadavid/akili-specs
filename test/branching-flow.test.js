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

test("AGENTS.md Kaizen Loop bullet lands Apply Mode edits via kaizen/apply-* and a PR into dev", () => {
  const bullet = agents()
    .split(/\r?\n/)
    .find((l) => l.startsWith("- **Kaizen Loop"));
  assert.ok(bullet, "no Kaizen Loop bullet");
  assert.ok(bullet.includes("kaizen/apply-"), "Kaizen Loop bullet missing kaizen/apply-");
  assert.ok(bullet.includes("PR into `dev`"), "Kaizen Loop bullet missing PR into `dev`");
});

// --- FR-7 docs contract: CONTRIBUTING, release checklist, README release section, CHANGELOG ---
// Expected tokens are literals copied from changes/branching-flow-dev-next requirements.md FR-7 (no runtime spec read).
const doc = (f) => fs.readFileSync(path.join(root, f), "utf8");

// Text from the heading line equal to `start` up to the next heading matching `stop` (exclusive).
function section(text, start, stop) {
  const lines = text.split(/\r?\n/);
  const i = lines.findIndex((l) => l === start);
  assert.notEqual(i, -1, `no ${start} heading`);
  const out = [];
  for (let j = i + 1; j < lines.length; j++) {
    if (stop.test(lines[j])) break;
    out.push(lines[j]);
  }
  return out.join("\n");
}

const flowDocs = {
  "CONTRIBUTING.md": () => doc("CONTRIBUTING.md"),
  "docs/release-checklist.md": () => doc("docs/release-checklist.md"),
  "README.md (Releasing Package Updates)": () =>
    section(doc("README.md"), "### Releasing Package Updates", /^#{2,3} /),
};

for (const [name, get] of Object.entries(flowDocs)) {
  for (const s of [
    "`dev`",
    "`feat/<name>` / `fix/<name>`",
    "release:next",
    "release/v",
    "`dev` → `master`",
    "merge commit",
    "sync/master-into-dev",
  ]) {
    test(`${name} names ${s}`, () => {
      assert.ok(get().includes(s), `${name} missing ${s}`);
    });
  }
}

test("docs/release-checklist.md verifies dist-tags before gh release create", () => {
  const t = doc("docs/release-checklist.md");
  const v = t.indexOf("npm view akili-specs dist-tags");
  const g = t.indexOf("gh release create");
  assert.notEqual(v, -1);
  assert.notEqual(g, -1);
  assert.ok(v < g, "dist-tags check must precede gh release create");
  const line = t.split(/\r?\n/).find((l) => l.includes("gh release create"));
  assert.ok(
    line.indexOf("npm view akili-specs dist-tags") !== -1 &&
      line.indexOf("npm view akili-specs dist-tags") < line.indexOf("gh release create"),
    "the gh release create line must name the dist-tags check first"
  );
});

test("docs/release-checklist.md: git tag and npm publish only after the dev -> master merge anchor", () => {
  const t = doc("docs/release-checklist.md");
  const anchor = t.indexOf("Only after the `dev` → `master` merge");
  assert.notEqual(anchor, -1, "missing the Only after the `dev` → `master` merge anchor");
  for (const cmd of ["git tag v", "npm publish"]) {
    const first = t.indexOf(cmd);
    assert.notEqual(first, -1, `no ${cmd}`);
    assert.ok(first > anchor, `${cmd} appears before the merge anchor`);
  }
});

// BUT clause: the pre-change README shape (3d8c123) committed the release then tagged it in one block.
function hasDirectReleaseSequence(text) {
  const blocks = text.split("```");
  return blocks.some((b, i) => {
    if (i % 2 === 0) return false;
    const lines = b.split(/\r?\n/);
    const c = lines.findIndex((l) => l.includes('git commit -m "chore(release)'));
    return c !== -1 && lines.slice(c + 1).some((l) => l.startsWith("git tag v"));
  });
}

test("the direct commit-then-tag release block detector fires on the pre-change README shape", () => {
  const old = [
    "```bash",
    "npm run release:status",
    'git commit -m "chore(release): vX.Y.Z"',
    "git tag vX.Y.Z",
    "npm publish --access public",
    "```",
  ].join("\n");
  assert.ok(hasDirectReleaseSequence(old));
});

for (const [name, get] of Object.entries({
  "AGENTS.md": () => doc("AGENTS.md"),
  ...flowDocs,
})) {
  test(`${name} has no direct chore(release) commit followed by git tag block`, () => {
    assert.ok(!hasDirectReleaseSequence(get()), `${name} still instructs a direct release commit + tag`);
  });
}

test("release-checklist guard sentence matches the six release-next guards", () => {
  const src = fs.readFileSync(path.join(root, "scripts", "release-next.js"), "utf8");
  const names = [...src.matchAll(/guard\("([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(names, ["Branch", "Clean", "In sync", "Stable source", "Source published", "Base ahead"]);
  const sentence = section(doc("docs/release-checklist.md"), "## Prerelease (`next`)", /^## /)
    .split(/\r?\n/)
    .find((l) => l.startsWith("The guards check"));
  assert.ok(sentence, "no `The guards check` sentence");
  for (const s of [
    "the branch",
    "a clean tree",
    "sync with `origin/dev`",
    "a stable source version",
    "source version is published",
    "bumped base version is ahead of every published stable version",
  ]) {
    assert.ok(sentence.includes(s), `guard sentence missing: ${s}`);
  }
  assert.ok(!sentence.includes("dev is ahead of the base"), "attempt-1 defect: dev is ahead of the base");
});

test("CHANGELOG [Unreleased] names release:next, Integration Branch: dev and kaizen/apply-", () => {
  const u = section(doc("CHANGELOG.md"), "## [Unreleased]", /^## /);
  for (const s of ["release:next", "Integration Branch: dev", "kaizen/apply-"]) {
    assert.ok(u.includes(s), `[Unreleased] missing ${s}`);
  }
});
