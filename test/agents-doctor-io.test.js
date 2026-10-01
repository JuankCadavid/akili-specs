"use strict";

// FR-9 / DD-9: "one I/O test in a temp dir asserts the backup exists and the
// persona is byte-identical after a forced write failure (a read-only
// target), and that the write lands when allowed." Plus the CRLF
// requirement's CLI half (the pure-function round trip already lives in
// agents-doctor.test.js's applyFix CRLF test).
//
// bin/akili.js runs main() on load (design §7), so its write path cannot be
// required directly — this drives the real CLI as a subprocess, the same
// way agents-doctor.test.js's runFix/stripAnsi helpers do (that file exports
// nothing, so the pattern is copied here rather than imported).

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const FIXTURES_DIR = path.join(__dirname, "fixtures", "personas");
const TEMPLATES_DIR = path.join(__dirname, "..", ".claude", "templates");
const AKILI_BIN = path.join(__dirname, "..", "bin", "akili.js");

function stripAnsi(text) {
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

function runFix(tmpDir, extraArgs) {
  const env = Object.assign({}, process.env, { HOME: tmpDir, USERPROFILE: tmpDir });
  const result = spawnSync(
    process.execPath,
    [AKILI_BIN, "doctor", "--agents", "--fix"].concat(extraArgs || []),
    { cwd: tmpDir, env: env, encoding: "utf8" }
  );
  return {
    exitCode: result.status,
    stdout: stripAnsi(result.stdout || ""),
    stderr: result.stderr || "",
  };
}

function withTempDir(prefix, fn) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  try {
    fn(tmpDir);
  } finally {
    // Each test restores any permission changes itself (in its own finally)
    // before this runs, or rmSync would refuse to remove a read-only tree.
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

function backupFilesFor(agentsDir, role) {
  const backupDir = path.join(agentsDir, ".backup");
  if (!fs.existsSync(backupDir)) return [];
  return fs.readdirSync(backupDir).filter((f) => f.startsWith(`${role}.md.`));
}

test(
  "CLI --fix, read-only .agents/: implementer.md's backup exists, its bytes are unchanged, and the run reports failure with a non-zero exit (FR-4 scenario + Task Disqualifier)",
  () => {
    withTempDir("akili-io-readonly-", (tmpDir) => {
      const agentsDir = path.join(tmpDir, ".agents");
      const backupDir = path.join(agentsDir, ".backup");
      fs.mkdirSync(backupDir, { recursive: true });

      // leader/reviewer/tester start fully current so the per-role loop
      // reaches implementer (the role under test) instead of crashing
      // earlier on an absent persona's direct install, which never calls
      // backupPersona at all and would never exercise this scenario.
      for (const role of ["leader", "reviewer", "tester"]) {
        fs.copyFileSync(path.join(TEMPLATES_DIR, `${role}.md`), path.join(agentsDir, `${role}.md`));
      }
      const implementerPath = path.join(agentsDir, "implementer.md");
      fs.copyFileSync(path.join(FIXTURES_DIR, "missing-section.md"), implementerPath);
      const originalText = fs.readFileSync(implementerPath, "utf8");

      // Pre-seed .gitignore with .backup/ already present so
      // ensureBackupGitignore's own write (also a direct create in
      // agentsDir) is a no-op, and the forced failure lands specifically on
      // implementer.md's write, after its backup already exists.
      fs.writeFileSync(path.join(agentsDir, ".gitignore"), ".backup/\n");

      // POSIX: removing write permission on .agents/ blocks creating new
      // entries directly inside it (the write path's temp-file-then-rename),
      // while .backup/ — a separate, already-created, still-writable
      // directory — stays open for the backup write that happens first.
      // UNVERIFIED on Windows: directory permission bits there do not block
      // file creation the same way, so the persona file itself is also made
      // read-only below — a rename over a read-only file is refused on
      // Windows even when the directory bit is not. CI's windows-latest leg
      // is this test's proof for that path; it cannot be run here.
      fs.chmodSync(agentsDir, 0o555);
      fs.chmodSync(implementerPath, 0o444);
      try {
        const run = runFix(tmpDir, []);

        // Task Disqualifier: a temp filesystem that ignores read-only bits
        // (e.g. running as root) makes this test inert unless it asserts the
        // write was actually refused, not just that nothing wrote.
        assert.notEqual(run.exitCode, 0, `expected a non-zero exit from the forced write failure; stdout:\n${run.stdout}`);
        assert.match(
          run.stderr,
          /EACCES|EPERM/,
          `expected the run to report the refused write (would be absent if the write silently succeeded); stderr:\n${run.stderr}`
        );

        const backups = backupFilesFor(agentsDir, "implementer");
        assert.equal(backups.length, 1, "expected exactly one backup for implementer.md");
        assert.equal(
          fs.readFileSync(path.join(backupDir, backups[0]), "utf8"),
          originalText,
          "expected the backup to hold the pre-fix bytes"
        );
        assert.equal(
          fs.readFileSync(implementerPath, "utf8"),
          originalText,
          "expected implementer.md to be byte-identical to its pre-fix content (the write must not land)"
        );
      } finally {
        fs.chmodSync(implementerPath, 0o644);
        fs.chmodSync(agentsDir, 0o755);
      }
    });
  }
);

test("CLI --fix, writable .agents/: implementer.md is upgraded and its backup is present", () => {
  withTempDir("akili-io-writable-", (tmpDir) => {
    const agentsDir = path.join(tmpDir, ".agents");
    fs.mkdirSync(agentsDir);
    const implementerPath = path.join(agentsDir, "implementer.md");
    fs.copyFileSync(path.join(FIXTURES_DIR, "missing-section.md"), implementerPath);
    const originalText = fs.readFileSync(implementerPath, "utf8");

    const run = runFix(tmpDir, []);
    assert.equal(run.exitCode, 0, `expected a clean exit; stdout:\n${run.stdout}\nstderr:\n${run.stderr}`);

    const upgradedText = fs.readFileSync(implementerPath, "utf8");
    assert.notEqual(upgradedText, originalText, "expected implementer.md to be rewritten");
    assert.match(upgradedText, /<!-- akili:section id=craft/, "expected the missing craft section to be inserted");

    const backups = backupFilesFor(agentsDir, "implementer");
    assert.equal(backups.length, 1, "expected exactly one backup");
    assert.equal(
      fs.readFileSync(path.join(agentsDir, ".backup", backups[0]), "utf8"),
      originalText,
      "expected the backup to hold the pre-fix bytes"
    );
  });
});

test("CLI --fix, CRLF persona: the fixed file stays CRLF end to end through the real CLI (FR-9 fixture requirement)", () => {
  withTempDir("akili-io-crlf-", (tmpDir) => {
    const agentsDir = path.join(tmpDir, ".agents");
    fs.mkdirSync(agentsDir);
    const implementerPath = path.join(agentsDir, "implementer.md");
    fs.copyFileSync(path.join(FIXTURES_DIR, "crlf-missing.md"), implementerPath);
    const originalText = fs.readFileSync(implementerPath, "utf8");
    assert.equal(originalText.includes("\r\n"), true, "precondition: the fixture is CRLF");

    const run = runFix(tmpDir, []);
    assert.equal(run.exitCode, 0, `expected a clean exit; stdout:\n${run.stdout}\nstderr:\n${run.stderr}`);

    const upgradedText = fs.readFileSync(implementerPath, "utf8");
    assert.notEqual(upgradedText, originalText, "expected implementer.md to be rewritten (craft section inserted)");
    assert.equal(
      upgradedText.replace(/\r\n/g, "").includes("\n"),
      false,
      "expected every line ending to be CRLF, none bare LF"
    );
  });
});
