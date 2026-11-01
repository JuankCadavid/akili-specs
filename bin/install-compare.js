"use strict";
// @akili-spec changes/impeccable-audit-fixes/install-stale-skills
// Pure byte-exact comparison of an installed entry against its package source.
// No line-ending normalization, mode not compared, extra target files never
// visited. A target-side error is `differs`; a source-side error throws.

const fs = require("fs");
const path = require("path");

const MAX_NAMES = 5;

// True when `target` is a regular file (not a symlink) with the same bytes.
function sameFile(sourceFile, targetFile) {
  const expected = fs.readFileSync(sourceFile); // source error propagates
  try {
    if (!fs.lstatSync(targetFile).isFile()) return false;
    return expected.equals(fs.readFileSync(targetFile));
  } catch {
    return false;
  }
}

function walkSource(sourceDir, targetDir, rel, out) {
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    const relPath = rel ? `${rel}/${entry.name}` : entry.name;
    const src = path.join(sourceDir, entry.name);
    const dst = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      walkSource(src, dst, relPath, out);
    } else if (entry.isFile()) {
      if (!sameFile(src, dst)) out.push(relPath);
    }
    // source symlinks and other kinds are skipped
  }
}

function compareEntry(sourcePath, targetPath) {
  const base = path.basename(targetPath);
  const sourceStat = fs.statSync(sourcePath); // source error propagates
  let targetStat;
  try {
    targetStat = fs.lstatSync(targetPath);
  } catch {
    return { state: "differs", differing: [base] };
  }

  if (sourceStat.isDirectory()) {
    if (!targetStat.isDirectory()) return { state: "differs", differing: [base] };
    const differing = [];
    walkSource(sourcePath, targetPath, "", differing);
    differing.sort();
    return { state: differing.length ? "differs" : "identical", differing };
  }

  return sameFile(sourcePath, targetPath)
    ? { state: "identical", differing: [] }
    : { state: "differs", differing: [base] };
}

function formatDiffers(names) {
  const shown = names.slice(0, MAX_NAMES).join(", ");
  const extra = names.length - MAX_NAMES;
  return extra > 0 ? `${shown}, +${extra} more` : shown;
}

module.exports = { compareEntry, formatDiffers };
