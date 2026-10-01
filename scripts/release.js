#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");
const { parsePersona, renderSegments, sectionDigestEntry, entryBodyHash } = require("../bin/persona.js");

const ROOT = path.resolve(__dirname, "..");
const PACKAGE_PATH = path.join(ROOT, "package.json");
const CHANGELOG_PATH = path.join(ROOT, "CHANGELOG.md");
const RELEASES_DIR = path.join(ROOT, "releases");
const TEMPLATES_DIR = path.join(ROOT, ".claude", "templates");
const DIGESTS_PATH = path.join(TEMPLATES_DIR, "digests.json");
const ROLES = ["leader", "implementer", "reviewer", "tester"];

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

// Semver string compare ("2.9.0" < "2.10.0"), for picking the latest key out
// of digests.json's `releases` object (plain-object key order is not
// trustworthy for this).
function compareSemver(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
}

function readDigests() {
  if (!fs.existsSync(DIGESTS_PATH)) return { version: null, releases: {}, legacy: {} };
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(DIGESTS_PATH, "utf8"));
  } catch (e) {
    fail(`${DIGESTS_PATH} is not valid JSON: ${e.message}`);
  }
  return { version: parsed.version || null, releases: parsed.releases || {}, legacy: parsed.legacy || {} };
}

// DD-3: "asserts, before the bump, that every template section parses and
// that the previous release's table is intact." Runs against the CURRENT
// (pre-bump) templates and the CURRENT digests.json, before `pkg.version`
// is touched — a malformed template or a corrupted prior release entry
// fails the release outright rather than silently shipping a bad digest.
function assertPreBumpInvariants() {
  for (const role of ROLES) {
    const templatePath = path.join(TEMPLATES_DIR, `${role}.md`);
    if (!fs.existsSync(templatePath)) fail(`Template missing: ${templatePath}`);
    const parsed = parsePersona(fs.readFileSync(templatePath, "utf8"));
    if (parsed.unreadable) fail(`Template ${role}.md is unreadable: ${parsed.unreadableReason}`);
    if (parsed.unmarked) fail(`Template ${role}.md carries no section markers; the release step requires marked templates.`);
    if (!parsed.sections.length) fail(`Template ${role}.md parsed with zero sections.`);
  }

  const digests = readDigests();
  const releaseKeys = Object.keys(digests.releases);
  if (releaseKeys.length === 0) return digests; // first-ever dense entry: nothing prior to check

  const latest = releaseKeys.sort(compareSemver)[releaseKeys.length - 1];
  const entry = digests.releases[latest] || {};
  for (const role of ROLES) {
    const byId = entry[role] || {};
    for (const [id, hash] of Object.entries(byId)) {
      const ok = typeof hash === "string" ? hash.length > 0 : hash && typeof hash.body === "string";
      if (!ok) fail(`digests.json releases["${latest}"].${role}.${id} is corrupt — the previous release's table is not intact.`);
    }
  }
  return digests;
}

// DD-3's release step: appends this release's dense hash set under
// `releases[nextVersion]` (every section of every role, whether or not it
// changed — the "22 hashes" row), rewrites a template's `since=` only for a
// section whose hash changed against the PREVIOUS dense release entry (none
// existing yet means nothing to diff against, so nothing is rewritten — the
// templates already carry whatever `since=` T1-T4 set), and returns the
// list of files actually written so the `git add` hint names exactly that
// set (KZ-004: the write set and the hint set must be the same set).
function writeReleaseDigests(nextVersion, digestsBefore) {
  const releaseKeys = Object.keys(digestsBefore.releases);
  const previousVersion = releaseKeys.length ? releaseKeys.sort(compareSemver)[releaseKeys.length - 1] : null;
  const previousEntry = previousVersion ? digestsBefore.releases[previousVersion] : null;

  const newReleaseEntry = {};
  const writtenFiles = [];

  for (const role of ROLES) {
    const templatePath = path.join(TEMPLATES_DIR, `${role}.md`);
    const templateText = fs.readFileSync(templatePath, "utf8");
    const persona = parsePersona(templateText);

    const roleHashes = {};
    let templateChanged = false;
    const segments = persona.segments.slice();

    for (const sec of persona.sections) {
      // §5.3's object entry shape — same builder as seedLegacySections'
      // `legacy` entries (bin/persona.js's sectionDigestEntry), never a
      // second implementation of head/open for the two tables.
      const entry = sectionDigestEntry(sec.body);
      roleHashes[sec.id] = entry;

      const prevEntry = previousEntry && previousEntry[role] ? previousEntry[role][sec.id] : undefined;
      const prevHash = entryBodyHash(prevEntry);
      const prevHashChanged = previousEntry ? prevHash !== entry.body : false;
      const nextSinceTag = `v${nextVersion}`;
      if (prevHashChanged && sec.since !== nextSinceTag) {
        const idx = segments.findIndex((s) => s.kind === "owned" && s.id === sec.id);
        if (idx !== -1) {
          segments[idx] = { ...segments[idx], since: nextSinceTag };
          templateChanged = true;
        }
      }
    }

    newReleaseEntry[role] = roleHashes;

    if (templateChanged) {
      atomicWriteFileSync(templatePath, renderSegments(segments, persona.eol));
      writtenFiles.push(path.relative(ROOT, templatePath));
    }
  }

  const releases = { ...digestsBefore.releases, [nextVersion]: newReleaseEntry };
  const nextDigests = { version: nextVersion, releases, legacy: digestsBefore.legacy };
  atomicWriteFileSync(DIGESTS_PATH, JSON.stringify(nextDigests, null, 2) + "\n");
  writtenFiles.push(path.relative(ROOT, DIGESTS_PATH));

  return writtenFiles;
}

function main() {
  const bump = process.argv[2];
  if (!bump) fail("Usage: node scripts/release.js <patch|minor|major>");

  assertCleanGit();

  // DD-3: pre-bump assertions, against the CURRENT (not-yet-bumped) state.
  const digestsBefore = assertPreBumpInvariants();

  const pkg = JSON.parse(fs.readFileSync(PACKAGE_PATH, "utf8"));
  const nextVersion = bumpVersion(pkg.version, bump);
  const date = getIsoDate();
  const changelog = fs.readFileSync(CHANGELOG_PATH, "utf8");
  const unreleased = extractUnreleased(changelog);

  pkg.version = nextVersion;
  atomicWriteFileSync(PACKAGE_PATH, `${JSON.stringify(pkg, null, 2)}\n`);
  atomicWriteFileSync(CHANGELOG_PATH, updateChangelog(changelog, nextVersion, date, unreleased));
  writeReleaseNotes(nextVersion, date, unreleased);

  // DD-3: dense `releases[nextVersion]` entry + `since=` rewrite for any
  // section whose hash changed against the previous dense release.
  const digestWrittenFiles = writeReleaseDigests(nextVersion, digestsBefore);

  console.log(`Prepared v${nextVersion}.`);
  console.log("Next steps:");
  console.log("  npm run verify:cli");
  console.log("  npm run pack:dry-run");
  // KZ-004: the `git add` hint names exactly what this run wrote — the
  // three always-written files, plus whatever writeReleaseDigests reports
  // (digests.json always; a template only when its `since=` changed).
  const hintPaths = ["package.json", "CHANGELOG.md", `releases/v${nextVersion}.md`, ...digestWrittenFiles];
  console.log(`  git add ${hintPaths.join(" ")}`);
  console.log(`  git commit -m "chore(release): v${nextVersion}"`);
  console.log(`  git tag v${nextVersion}`);
  console.log("  npm publish --access public --registry=https://registry.npmjs.org/");
}

main();
