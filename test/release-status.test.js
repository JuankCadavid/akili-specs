"use strict";

// release-status.js: prerelease partition (FR-6). Requires only release-status.js
// (guarded main). release.js is NEVER required: it runs main() on load and
// writes package.json/CHANGELOG, so its hint block is checked by a static read.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const { isPrerelease, partitionVersions, releaseFailures } = require("../scripts/release-status.js");

test("partitionVersions splits stable from prerelease versions", () => {
  const { stable, prerelease } = partitionVersions(["2.34.1", "2.35.0-next.1", "2.35.0-rc.1"]);
  assert.deepEqual(stable, ["2.34.1"]);
  assert.deepEqual(prerelease, ["2.35.0-next.1", "2.35.0-rc.1"]);
  assert.equal(isPrerelease("2.35.0-next.1"), true);
  assert.equal(isPrerelease("2.34.1"), false);
});

test("releaseFailures keeps stable failures and never checks prereleases", () => {
  const checked = [];
  const check = (version) => {
    checked.push(version);
    return [`${version}: missing remote tag`];
  };
  const { stable, prerelease } = partitionVersions(["2.34.1", "2.35.0-next.1"]);
  assert.deepEqual(prerelease, ["2.35.0-next.1"]);
  const failures = releaseFailures({ pkgVersion: "2.34.1", stablePublished: stable, check });
  assert.deepEqual(failures, ["2.34.1: missing remote tag"]);
  assert.deepEqual(checked, ["2.34.1"]);
});

test("releaseFailures flags a prerelease left in package.json", () => {
  const failures = releaseFailures({ pkgVersion: "2.35.0-next.1", stablePublished: [], check: () => [] });
  assert.equal(failures.length, 1);
  assert.match(failures[0], /2\.35\.0-next\.1/);
  assert.match(failures[0], /git checkout -- package\.json/);
});

test("releaseFailures reports no drift for a clean stable state", () => {
  assert.deepEqual(releaseFailures({ pkgVersion: "2.34.1", stablePublished: ["2.34.1"], check: () => [] }), []);
});

// --- release.js next-step hints (static read; FR-9) ---
const releaseSrc = fs.readFileSync(path.join(__dirname, "..", "scripts", "release.js"), "utf8");
const hintBlock = releaseSrc.slice(releaseSrc.indexOf("Next steps:")).replace(/\\`/g, "`"); // unescape template-literal backticks

test("release.js hints follow the PR flow", () => {
  assert.ok(hintBlock.length > 0 && releaseSrc.includes("Next steps:"));
  assert.ok(hintBlock.includes("release/v"), "names the release/vX.Y.Z branch");
  assert.ok(hintBlock.includes("PR into `dev`"), "PR into dev");
  assert.match(hintBlock, /`dev` (→|->) `master`/);
  assert.ok(hintBlock.includes("docs/release-checklist.md"));
  assert.ok(hintBlock.includes("npm run verify:cli"));
  assert.ok(hintBlock.includes("npm run pack:dry-run"));
});

test("release.js hints do not print tag/publish as standalone steps", () => {
  const lines = hintBlock.split("\n").map((l) => l.trim());
  const standalone = lines.filter((l) => /^console\.log\(["`]\s+(git tag|npm publish)/.test(l));
  assert.deepEqual(standalone, []);
});

test("release.js git add hint expression is unchanged (KZ-004)", () => {
  assert.ok(
    releaseSrc.includes(
      'const hintPaths = ["package.json", "CHANGELOG.md", `releases/v${nextVersion}.md`, ...digestWrittenFiles];'
    )
  );
  assert.ok(releaseSrc.includes("console.log(`  git add ${hintPaths.join(\" \")}`);"));
});
