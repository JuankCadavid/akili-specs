"use strict";

// bugfix/pty-harness-ubuntu-flake T1 — the FR-4 regression test (design §7.3,
// DD-3, DD-4). It runs the REAL test/routing-pty.test.js under `node --test`
// with a fake `expect` first on PATH (test/fixtures/routing/fake-expect.sh: a
// canned transcript with a unique sentinel, no RC=, exit 2), then asserts that
// the Ctrl-C case's own `not ok` block carries the evidence — the sentinel,
// `status 2`, `<<TIMEOUT: unmatched wait>>` — and that the transcript was kept
// in AKILI_PTY_LOG_DIR. A sentinel elsewhere in the TAP is not evidence: the
// comma-path cases print their whole input through `assert.match`.
// Skips with a printed reason on win32 (no `sh` shim, no pty).

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const REPO = path.join(__dirname, "..");
const SHIM = path.join(__dirname, "fixtures", "routing", "fake-expect.sh");
const CASE_LINE = /^not ok \d+ - pty FR-5: Ctrl-C at the host question/;
const BLOCK_END = /^(not )?ok \d|^# Subtest/;
const SENTINEL = "<<AKILI-EVIDENCE-SENTINEL 7f3a>>";

function skipReason() {
  if (process.platform === "win32") return "win32: no pty";
  return null;
}
const SKIP = skipReason();

// The case's TAP block: from its `not ok` line to the next test result or
// `# Subtest` line; null when the case did not fail.
function caseBlock(tap) {
  const lines = tap.split("\n");
  const start = lines.findIndex((l) => CASE_LINE.test(l));
  if (start === -1) return null;
  let end = lines.findIndex((l, i) => i > start && BLOCK_END.test(l));
  if (end === -1) end = lines.length;
  return lines.slice(start, end).join("\n");
}

test("pty FR-4: a red Ctrl-C case carries the transcript's evidence in its own TAP block, and the transcript is kept", (t) => {
  if (SKIP) return t.skip(SKIP);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "akili-pty-evidence-"));
  try {
    const bin = path.join(tmp, "bin");
    const logs = path.join(tmp, "logs");
    fs.mkdirSync(bin);
    fs.copyFileSync(SHIM, path.join(bin, "expect"));
    fs.chmodSync(path.join(bin, "expect"), 0o755);
    const env = Object.assign({}, process.env, {
      PATH: bin + path.delimiter + (process.env.PATH || ""),
      AKILI_PTY_LOG_DIR: logs,
    });
    // An inherited NODE_TEST_CONTEXT would make the child report to this
    // runner instead of printing TAP.
    delete env.NODE_TEST_CONTEXT;
    const r = spawnSync(process.execPath, ["--test", "--test-reporter=tap", "test/routing-pty.test.js"], {
      cwd: REPO,
      env,
      encoding: "utf8",
      timeout: 60000,
    });
    const tap = r.stdout || "";
    // A 60 s kill is a hang, not a red.
    assert.notEqual(r.status, null, `the child suite was killed (signal ${r.signal}) — a hang, not a red; stderr:\n${r.stderr}`);
    assert.notEqual(r.status, 0, `the child suite passed under the fake expect; TAP:\n${tap}`);
    const block = caseBlock(tap);
    assert.ok(block !== null, `no \`not ok … pty FR-5: Ctrl-C at the host question\` block in the TAP:\n${tap}`);
    assert.ok(block.includes(SENTINEL), `the Ctrl-C case's block holds no ${SENTINEL}:\n${block}`);
    // The sentinel is itself a `<<…>>` marker, so the `markers:` line (and the
    // one-line t.diagnostic copy) would carry it without any tail: only a
    // transcript tail line holds it alone on its line.
    assert.ok(block.split("\n").some((l) => l.trim() === SENTINEL), `the Ctrl-C case's block holds no transcript tail line ${SENTINEL}:\n${block}`);
    assert.ok(block.includes("status 2"), `the Ctrl-C case's block holds no \`status 2\`:\n${block}`);
    assert.ok(block.includes("<<TIMEOUT: unmatched wait>>"), `the Ctrl-C case's block holds no \`<<TIMEOUT: unmatched wait>>\`:\n${block}`);
    const kept = fs.existsSync(logs) ? fs.readdirSync(logs) : [];
    assert.ok(kept.some((n) => /pty-ctrl-c\.exp.*\.log$/.test(n)), `AKILI_PTY_LOG_DIR holds no pty-ctrl-c.exp transcript: [${kept.join(", ")}]`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
