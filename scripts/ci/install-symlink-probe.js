// CI probe: proves the installer's symlink-defense semantics on every
// platform/Node in the matrix, instead of assuming them from docs.
//
// Asserts two invariants:
//   1. DEFENSE: removeTargetSymlinks + cpSync(force) never writes through a
//      nested destination symlink — the sensitive target stays intact and the
//      destination becomes a regular file. (Mirror of bin/akili.js
//      removeTargetSymlinks — keep in sync.)
//   2. RECORD: raw cpSync(force) behavior WITHOUT the defense is logged per
//      platform/Node. Measured on Node 20.11/22.12 (macOS): cpSync replaces
//      the destination symlink and does not write through it. If a platform
//      in the matrix ever behaves differently, this log is the evidence.
//
// Windows runners may forbid symlink creation without elevation — the probe
// skips gracefully (exit 0) when symlinkSync throws EPERM.

const fs = require("fs");
const path = require("path");
const os = require("os");

function removeTargetSymlinks(sourcePath, targetPath) {
  let sourceStat = null;
  let targetStat = null;
  try { sourceStat = fs.lstatSync(sourcePath); } catch (e) { return; }
  try { targetStat = fs.lstatSync(targetPath); } catch (e) { return; }
  if (targetStat.isSymbolicLink()) {
    fs.rmSync(targetPath, { force: true });
  } else if (sourceStat.isDirectory() && targetStat.isDirectory()) {
    for (const entry of fs.readdirSync(sourcePath, { withFileTypes: true })) {
      removeTargetSymlinks(path.join(sourcePath, entry.name), path.join(targetPath, entry.name));
    }
  }
}

function layout(base) {
  const src = path.join(base, "src");
  const dst = path.join(base, "dst");
  const sensitive = path.join(base, "sensitive.txt");
  fs.mkdirSync(path.join(src, "sub"), { recursive: true });
  fs.writeFileSync(path.join(src, "sub", "inner.md"), "PACKAGED CONTENT");
  fs.mkdirSync(path.join(dst, "sub"), { recursive: true });
  fs.writeFileSync(sensitive, "SENSITIVE ORIGINAL");
  fs.symlinkSync(sensitive, path.join(dst, "sub", "inner.md"));
  return { src, dst, sensitive };
}

const base = fs.mkdtempSync(path.join(os.tmpdir(), "akili-symlink-probe-"));
try {
  try {
    fs.symlinkSync(path.join(base, "x"), path.join(base, "y"));
    fs.rmSync(path.join(base, "y"));
  } catch (e) {
    if (e.code === "EPERM") {
      console.log(`SKIP: symlink creation not permitted on this runner (${process.platform} ${process.version})`);
      process.exit(0);
    }
    throw e;
  }

  // 2. RECORD raw cpSync behavior (informational, never fails the job)
  {
    const { src, dst, sensitive } = layout(path.join(base, "raw"));
    fs.cpSync(src, dst, { recursive: true, force: true, errorOnExist: false });
    const intact = fs.readFileSync(sensitive, "utf8") === "SENSITIVE ORIGINAL";
    const destIsLink = fs.lstatSync(path.join(dst, "sub", "inner.md")).isSymbolicLink();
    console.log(`RECORD raw cpSync on ${process.platform} ${process.version}: sensitive intact=${intact}, dest still symlink=${destIsLink}`);
  }

  // 1. ASSERT defense semantics
  {
    const { src, dst, sensitive } = layout(path.join(base, "defended"));
    removeTargetSymlinks(src, dst);
    fs.cpSync(src, dst, { recursive: true, force: true, errorOnExist: false });
    const sensitiveAfter = fs.readFileSync(sensitive, "utf8");
    const destStat = fs.lstatSync(path.join(dst, "sub", "inner.md"));
    const destContent = fs.readFileSync(path.join(dst, "sub", "inner.md"), "utf8");
    if (sensitiveAfter !== "SENSITIVE ORIGINAL" || destStat.isSymbolicLink() || destContent !== "PACKAGED CONTENT") {
      console.error(`FAIL: defense broken on ${process.platform} ${process.version} — sensitive="${sensitiveAfter}", destIsLink=${destStat.isSymbolicLink()}`);
      process.exit(1);
    }
    console.log(`OK defense: nested destination symlink removed before copy on ${process.platform} ${process.version}`);
  }
} finally {
  fs.rmSync(base, { recursive: true, force: true });
}
