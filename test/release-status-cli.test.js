// @akili-spec changes/branching-flow-dev-next
// CLI integration for scripts/release-status.js main(): real child process,
// real git (temp repo + bare origin), fake npm/gh shims. Proves that only
// stable versions reach the four-artifact check (FR-6). Pure-function unit
// coverage: test/release-status.test.js.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { makeProject, skipReason } = require("./release-cli-harness");

const SKIP = skipReason();
if (SKIP) console.log(`release-status-cli: skipped (${SKIP})`);
const opts = SKIP ? { skip: SKIP } : {};

const NPM_ENV = {
  FAKE_NPM_VERSIONS: JSON.stringify(["2.34.1", "2.35.0-next.1"]),
  FAKE_NPM_DISTTAGS: JSON.stringify({ latest: "2.34.1", next: "2.35.0-next.1" }),
  FAKE_GH_OK: "v2.34.1",
};

function releasedProject(t, o) {
  const p = makeProject({ scripts: ["release-status.js"], ...o });
  t.after(() => p.cleanup());
  fs.writeFileSync(path.join(p.work, "CHANGELOG.md"), "# Changelog\n\n## [2.34.1] - 2026-10-01\n- x\n");
  fs.mkdirSync(path.join(p.work, "releases"));
  fs.writeFileSync(path.join(p.work, "releases", "v2.34.1.md"), "notes\n");
  p.git("tag", "v2.34.1");
  p.git("push", "-q", "origin", "v2.34.1");
  return p;
}

test("FR-6 a published next version is listed, needs no artifacts, and is never asked of gh", opts, (t) => {
  const p = releasedProject(t);
  const r = p.run("release-status.js", [], NPM_ENV);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /npm next: 2\.35\.0-next\.1/);
  assert.match(r.stdout, /npm prereleases: 2\.35\.0-next\.1/);
  assert.match(r.stdout, /No published release drift detected/);
  const asked = p.ghLog().map((a) => a[2]);
  assert.ok(asked.includes("v2.34.1"), "stable was checked via gh");
  assert.ok(!asked.some((tag) => tag.includes("next")), `gh was asked about a prerelease: ${asked}`);
});

test("FR-6 stable drift still reported: remote tag removed -> exit 1 'missing remote tag'", opts, (t) => {
  const p = releasedProject(t);
  p.git("push", "-q", "origin", ":refs/tags/v2.34.1");
  const r = p.run("release-status.js", [], NPM_ENV);
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stdout, /2\.34\.1: missing remote tag/);
  assert.doesNotMatch(r.stdout, /2\.35\.0-next\.1: missing/);
});

test("FR-6 stable drift still reported: missing release notes and GitHub Release", opts, (t) => {
  const p = releasedProject(t);
  fs.rmSync(path.join(p.work, "releases", "v2.34.1.md"));
  const r = p.run("release-status.js", [], { ...NPM_ENV, FAKE_GH_OK: "" });
  assert.equal(r.status, 1);
  assert.match(r.stdout, /2\.34\.1: missing release notes/);
  assert.match(r.stdout, /2\.34\.1: missing GitHub Release/);
});

test("FR-6 a prerelease left in package.json is drift naming `git checkout -- package.json`", opts, (t) => {
  const p = releasedProject(t, { pkgVersion: "2.35.0-next.1" });
  // package.json committed as a prerelease; re-tag nothing else. Only the prerelease line should fail.
  const r = p.run("release-status.js", [], { ...NPM_ENV, FAKE_NPM_VERSIONS: JSON.stringify(["2.34.1"]), FAKE_NPM_DISTTAGS: JSON.stringify({ latest: "2.34.1" }) });
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stdout, /package\.json version 2\.35\.0-next\.1 is a prerelease; restore it with `git checkout -- package\.json`/);
  assert.doesNotMatch(r.stdout, /2\.34\.1: missing/, "stable artifacts are fine, so the prerelease is the only drift");
});

test("FR-6 a prerelease in package.json that IS published on npm demands no artifacts, only the leftover drift line", opts, (t) => {
  const p = releasedProject(t, { pkgVersion: "2.35.0-next.1" });
  const r = p.run("release-status.js", [], NPM_ENV);
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stdout, /package\.json version 2\.35\.0-next\.1 is a prerelease; restore it with `git checkout -- package\.json`/);
  assert.doesNotMatch(r.stdout, /2\.35\.0-next\.1: missing/);
});
