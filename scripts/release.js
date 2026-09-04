#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const PACKAGE_PATH = path.join(ROOT, "package.json");
const CHANGELOG_PATH = path.join(ROOT, "CHANGELOG.md");
const RELEASES_DIR = path.join(ROOT, "releases");

// Write via a wx temp file + renameSync so a symlink at the destination is
// replaced, never followed, and an interrupted release cannot leave
// package.json or CHANGELOG.md half-written. Mirrors bin/akili.js.
function atomicWriteFileSync(targetPath, data) {
  const tmpPath = targetPath + "." + crypto.randomBytes(6).toString("hex") + ".tmp";
  try {
    fs.writeFileSync(tmpPath, data, { flag: "wx" });
    fs.renameSync(tmpPath, targetPath);
  } finally {
    try { fs.rmSync(tmpPath, { force: true }); } catch (e) {}
  }
}

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function run(command, args) {
  return execFileSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function assertCleanGit() {
  const status = run("git", ["status", "--short"]);
  if (status) {
    fail("Working tree must be clean before preparing a release. Commit or stash changes first.");
  }
}

function bumpVersion(version, bump) {
  const parts = version.split(".").map((part) => Number(part));
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    fail(`Unsupported semver version: ${version}`);
  }

  if (bump === "patch") parts[2] += 1;
  else if (bump === "minor") {
    parts[1] += 1;
    parts[2] = 0;
  } else if (bump === "major") {
    parts[0] += 1;
    parts[1] = 0;
    parts[2] = 0;
  } else {
    fail("Release bump must be patch, minor, or major.");
  }

  return parts.join(".");
}

function getIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function extractUnreleased(changelog) {
  const match = changelog.match(/## \[Unreleased\]\n([\s\S]*?)(?=\n## \[\d+\.\d+\.\d+\])/);
  if (!match) fail("CHANGELOG.md must contain an [Unreleased] section before a dated release section.");

  const content = match[1].trim();
  if (!content || content.includes("No unreleased changes yet.")) {
    fail("CHANGELOG.md [Unreleased] must contain release notes before preparing a release.");
  }

  return { fullMatch: match[0], content };
}

function updateChangelog(changelog, version, date, unreleased) {
  const replacement = `## [Unreleased]\n\n### Notes\n\n- No unreleased changes yet.\n\n## [${version}] - ${date}\n\n${unreleased.content}`;
  return changelog.replace(unreleased.fullMatch, replacement);
}

function writeReleaseNotes(version, date, unreleased) {
  fs.mkdirSync(RELEASES_DIR, { recursive: true });
  const releasePath = path.join(RELEASES_DIR, `v${version}.md`);
  if (fs.existsSync(releasePath)) fail(`${releasePath} already exists.`);

  const body = `# v${version} - AKILI-SPECS methodology update\n\nRelease date: ${date}\n\n${unreleased.content}\n\n## Verification\n\nBefore publishing, run:\n\n\`\`\`bash\nnpm run verify:cli\nnpm run pack:dry-run\n\`\`\`\n\n## Publish\n\n\`\`\`bash\nnpm publish --access public --registry=https://registry.npmjs.org/\n\`\`\`\n`;
  atomicWriteFileSync(releasePath, body);
}

function main() {
  const bump = process.argv[2];
  if (!bump) fail("Usage: node scripts/release.js <patch|minor|major>");

  assertCleanGit();

  const pkg = JSON.parse(fs.readFileSync(PACKAGE_PATH, "utf8"));
  const nextVersion = bumpVersion(pkg.version, bump);
  const date = getIsoDate();
  const changelog = fs.readFileSync(CHANGELOG_PATH, "utf8");
  const unreleased = extractUnreleased(changelog);

  pkg.version = nextVersion;
  atomicWriteFileSync(PACKAGE_PATH, `${JSON.stringify(pkg, null, 2)}\n`);
  atomicWriteFileSync(CHANGELOG_PATH, updateChangelog(changelog, nextVersion, date, unreleased));
  writeReleaseNotes(nextVersion, date, unreleased);

  console.log(`Prepared v${nextVersion}.`);
  console.log("Next steps:");
  console.log("  npm run verify:cli");
  console.log("  npm run pack:dry-run");
  console.log(`  git add package.json CHANGELOG.md releases/v${nextVersion}.md`);
  console.log(`  git commit -m "chore(release): v${nextVersion}"`);
  console.log(`  git tag v${nextVersion}`);
  console.log("  npm publish --access public --registry=https://registry.npmjs.org/");
}

main();
