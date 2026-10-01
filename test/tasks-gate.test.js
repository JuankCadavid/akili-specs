"use strict";

// @akili-spec changes/cursor-install-target
//
// NFR-7: "Gate regression-safe. The gate script's Edit arm and Codex
// apply_patch branch produce identical exit codes on their fixtures after
// the Write-arm change, including an Edit with an empty new_string and a
// removal-only apply_patch (both exit 0); the new fixtures (Cursor Write
// with content; with new_content; with neither -- on a tasks.md path adding
// a [x] with no PASS) are run red before the edit (exit 0 -- the silent
// allow) and green after (exit 2)."
//
// Extraction contract: no packaged copy of the gate script exists under
// .claude/hooks/ (P-13) -- its only source is the Step 8F fenced block in
// .claude/commands/akili-constitution.md. These fixtures locate the line
// containing the sentence "Write the gate script", then the next line that
// is exactly "   ```bash" (three-space indent, so this can never match
// either of the two later JSON fences in the same file), and read through
// the next line that is exactly "   ```". The first extracted line must be
// "#!/bin/bash" and the last must be "exit 0" -- both asserted before any
// fixture runs, so a wrong-fence extraction fails loudly instead of
// silently testing the wrong text.
//
// AKILI_GATE_SCRIPT: set this env var to point every fixture at a
// throwaway copy of the script instead of the extraction result above.
// This exists only for a manual falsifier run against a scratch mutation
// of the script (proving the fixtures catch a mis-scoped deny) -- it is
// never set in CI, and no path reachable from it is the constitution file
// itself; this suite never edits that file.
//
// win32 guard: the gate script is bash, spawned directly (no shebang
// execution on win32) and matches tasks.md paths against a POSIX glob, so
// win32 cannot run these fixtures regardless of whether jq happens to be on
// PATH there (windows-latest ships jq). On win32 the suite registers exactly
// one test.skip naming that reason and registers none of F1-F10. On every
// other platform jq is probed; if it is absent the module fails loudly
// instead of skipping (jq is expected on the ubuntu/macos CI legs that
// exercise this file).

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const CONSTITUTION_FILE = path.join(__dirname, "..", ".claude", "commands", "akili-constitution.md");

const BASE_TASKS = "- [x] T1 first\n- [ ] T2 second\n";
const TASKS_WITH_SECOND_X = "- [x] T1 first\n- [x] T2 second\n";
const TASKS_NO_NEW_X = "- [x] T1 first\n- [ ] T2 second\n";
const EXECUTION_NO_PASS = "no evidence yet\n";
const EXECUTION_WITH_PASS = "Reviewer PASS recorded\n";

function withTempDir(prefix, fn) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  try {
    fn(tmpDir);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

function makeSpecDir(tmpDir, { tasksContent, executionContent }) {
  const specDir = path.join(tmpDir, "docs", "specs", "x");
  fs.mkdirSync(specDir, { recursive: true });
  const tasksPath = path.join(specDir, "tasks.md");
  const executionPath = path.join(specDir, "execution.md");
  fs.writeFileSync(tasksPath, tasksContent);
  fs.writeFileSync(executionPath, executionContent);
  return { specDir, tasksPath, executionPath };
}

// Reads the Step 8F fenced block verbatim from the constitution file. See
// the "Extraction contract" header comment above.
function extractGateScript() {
  const source = fs.readFileSync(CONSTITUTION_FILE, "utf8");
  const lines = source.split("\n");

  const anchorIndex = lines.findIndex((line) => line.includes("Write the gate script"));
  assert.notEqual(
    anchorIndex,
    -1,
    'extraction failed: no line containing "Write the gate script" was found in akili-constitution.md'
  );

  let fenceStart = -1;
  for (let i = anchorIndex; i < lines.length; i++) {
    if (lines[i] === "   ```bash") {
      fenceStart = i;
      break;
    }
  }
  assert.notEqual(
    fenceStart,
    -1,
    'extraction failed: no "   ```bash" fence found after the "Write the gate script" sentence'
  );

  let fenceEnd = -1;
  for (let i = fenceStart + 1; i < lines.length; i++) {
    if (lines[i] === "   ```") {
      fenceEnd = i;
      break;
    }
  }
  assert.notEqual(fenceEnd, -1, 'extraction failed: no closing "   ```" fence found for the gate script block');

  const indented = lines.slice(fenceStart + 1, fenceEnd);
  const stripped = indented.map((line) => (line.startsWith("   ") ? line.slice(3) : line));

  assert.equal(
    stripped[0],
    "#!/bin/bash",
    "extraction failed: first extracted line is not the shebang -- wrong fence was picked"
  );
  assert.equal(
    stripped[stripped.length - 1],
    "exit 0",
    "extraction failed: last extracted line is not the terminal exit 0 -- wrong fence was picked"
  );

  return stripped.join("\n") + "\n";
}

function runGate(gateScriptPath, payload, cwd) {
  const result = spawnSync(gateScriptPath, [], {
    cwd,
    input: JSON.stringify(payload),
    encoding: "utf8",
    timeout: 10000,
  });
  assert.equal(
    result.error,
    undefined,
    `gate script failed to spawn or timed out: ${result.error && result.error.message}`
  );
  return {
    exitCode: result.status,
    stderr: result.stderr || "",
    stdout: result.stdout || "",
  };
}

if (process.platform === "win32") {
  test(
    "tasks-gate fixtures (NFR-7)",
    {
      skip: "windows skip: these fixtures spawn a bash script and match POSIX-style tasks.md paths against a glob, neither of which win32 provides, regardless of whether jq is on PATH",
    },
    () => {}
  );
} else {
  const jqProbe = spawnSync("jq", ["--version"], { encoding: "utf8" });
  const jqMissing = Boolean(jqProbe.error) || jqProbe.status !== 0;

  if (jqMissing) {
    assert.fail(
      `jq is required to run test/tasks-gate.test.js (NFR-7 fixtures) but was not found on PATH on ${process.platform}. ` +
        "Install jq (the brief names /opt/homebrew/bin/jq on macOS) -- this platform is expected to have it, so the run fails loudly rather than skipping."
    );
  }

  let gateScriptPath;
  let cleanupScriptDir = null;
  if (process.env.AKILI_GATE_SCRIPT) {
    gateScriptPath = process.env.AKILI_GATE_SCRIPT;
    assert.equal(
      fs.existsSync(gateScriptPath),
      true,
      `AKILI_GATE_SCRIPT points at a file that does not exist: ${gateScriptPath}`
    );
  } else {
    const scriptText = extractGateScript();
    const scriptDir = fs.mkdtempSync(path.join(os.tmpdir(), "akili-gate-script-"));
    cleanupScriptDir = scriptDir;
    gateScriptPath = path.join(scriptDir, "akili-tasks-gate.sh");
    fs.writeFileSync(gateScriptPath, scriptText, { mode: 0o755 });
    fs.chmodSync(gateScriptPath, 0o755);
  }

  test.after(() => {
    if (cleanupScriptDir) {
      fs.rmSync(cleanupScriptDir, { recursive: true, force: true });
    }
  });

  // --- F1-F3: Cursor Write fixtures. T3 landed the Write-arm change, so
  // these now run as plain (non-todo) tests.

  test("F1 Cursor Write with content field: new [x] and no PASS -> exit 2", () => {
    withTempDir("akili-gate-f1-", (tmpDir) => {
      const { tasksPath } = makeSpecDir(tmpDir, { tasksContent: BASE_TASKS, executionContent: EXECUTION_NO_PASS });
      const payload = {
        tool_name: "Write",
        tool_input: { file_path: tasksPath, content: TASKS_WITH_SECOND_X },
      };
      const run = runGate(gateScriptPath, payload, tmpDir);
      assert.equal(run.exitCode, 2, `expected exit 2; stderr:\n${run.stderr}`);
    });
  });

  test("F2 Cursor Write with new_content field: new [x] and no PASS -> exit 2", () => {
    withTempDir("akili-gate-f2-", (tmpDir) => {
      const { tasksPath } = makeSpecDir(tmpDir, { tasksContent: BASE_TASKS, executionContent: EXECUTION_NO_PASS });
      const payload = {
        tool_name: "Write",
        tool_input: { file_path: tasksPath, new_content: TASKS_WITH_SECOND_X },
      };
      const run = runGate(gateScriptPath, payload, tmpDir);
      assert.equal(run.exitCode, 2, `expected exit 2; stderr:\n${run.stderr}`);
      // F2 must deny for the evidence-first reason (no PASS), never the
      // empty-content fail-closed reason -- content WAS present, just under
      // the new_content field name.
      assert.equal(
        run.stderr.includes("no readable new content"),
        false,
        `expected F2 to deny for missing PASS evidence, not the empty-content reason; stderr:\n${run.stderr}`
      );
    });
  });

  test("F3 Cursor Write with neither content nor new_content: empty new content -> exit 2", () => {
    withTempDir("akili-gate-f3-", (tmpDir) => {
      const { tasksPath } = makeSpecDir(tmpDir, { tasksContent: BASE_TASKS, executionContent: EXECUTION_NO_PASS });
      const payload = {
        tool_name: "Write",
        tool_input: { file_path: tasksPath },
      };
      const run = runGate(gateScriptPath, payload, tmpDir);
      assert.equal(run.exitCode, 2, `expected exit 2; stderr:\n${run.stderr}`);
    });
  });

  // --- F4-F10: existing-branch regression fixtures. Not todo -- these must
  // pass today and must keep passing after T3 (NFR-7, Empty-content
  // fail-closed scenario).

  test("F4 Claude Code Edit flips [ ] to [x], no PASS -> exit 2 (unchanged)", () => {
    withTempDir("akili-gate-f4-", (tmpDir) => {
      const { tasksPath } = makeSpecDir(tmpDir, { tasksContent: BASE_TASKS, executionContent: EXECUTION_NO_PASS });
      const payload = {
        tool_name: "Edit",
        tool_input: { file_path: tasksPath, old_string: "[ ]", new_string: "[x]" },
      };
      const run = runGate(gateScriptPath, payload, tmpDir);
      assert.equal(run.exitCode, 2, `expected exit 2; stderr:\n${run.stderr}`);
    });
  });

  test("F5 Claude Code Edit removes a line (empty new_string) -> exit 0 (unchanged)", () => {
    withTempDir("akili-gate-f5-", (tmpDir) => {
      const { tasksPath } = makeSpecDir(tmpDir, { tasksContent: BASE_TASKS, executionContent: EXECUTION_NO_PASS });
      const payload = {
        tool_name: "Edit",
        tool_input: { file_path: tasksPath, old_string: "- [ ] T2 second", new_string: "" },
      };
      const run = runGate(gateScriptPath, payload, tmpDir);
      assert.equal(run.exitCode, 0, `expected exit 0; stderr:\n${run.stderr}`);
    });
  });

  test("F6 Claude Code Write with content carrying no new [x] -> exit 0 (unchanged)", () => {
    withTempDir("akili-gate-f6-", (tmpDir) => {
      const { tasksPath } = makeSpecDir(tmpDir, { tasksContent: BASE_TASKS, executionContent: EXECUTION_NO_PASS });
      const payload = {
        tool_name: "Write",
        tool_input: { file_path: tasksPath, content: TASKS_NO_NEW_X },
      };
      const run = runGate(gateScriptPath, payload, tmpDir);
      assert.equal(run.exitCode, 0, `expected exit 0; stderr:\n${run.stderr}`);
    });
  });

  test("F7 Codex apply_patch, removal-only hunk (no + lines) -> exit 0 (unchanged)", () => {
    withTempDir("akili-gate-f7-", (tmpDir) => {
      const { tasksPath } = makeSpecDir(tmpDir, { tasksContent: BASE_TASKS, executionContent: EXECUTION_NO_PASS });
      const command = [
        "*** Begin Patch",
        `*** Update File: ${tasksPath}`,
        "@@",
        "-- [x] T1 first",
        "*** End Patch",
      ].join("\n");
      const payload = {
        tool_name: "apply_patch",
        tool_input: { command },
      };
      const run = runGate(gateScriptPath, payload, tmpDir);
      assert.equal(run.exitCode, 0, `expected exit 0; stderr:\n${run.stderr}`);
    });
  });

  test("F8 Codex apply_patch, hunk adds a [x] line -> exit 2 (unchanged)", () => {
    withTempDir("akili-gate-f8-", (tmpDir) => {
      const { tasksPath } = makeSpecDir(tmpDir, { tasksContent: BASE_TASKS, executionContent: EXECUTION_NO_PASS });
      const command = [
        "*** Begin Patch",
        `*** Update File: ${tasksPath}`,
        "@@",
        "-- [x] T1 first",
        "+- [x] T2",
        "*** End Patch",
      ].join("\n");
      const payload = {
        tool_name: "apply_patch",
        tool_input: { command },
      };
      const run = runGate(gateScriptPath, payload, tmpDir);
      assert.equal(run.exitCode, 2, `expected exit 2; stderr:\n${run.stderr}`);
    });
  });

  test("F9 F1 payload but execution.md already shows PASS -> exit 0", () => {
    withTempDir("akili-gate-f9-", (tmpDir) => {
      const { tasksPath } = makeSpecDir(tmpDir, { tasksContent: BASE_TASKS, executionContent: EXECUTION_WITH_PASS });
      const payload = {
        tool_name: "Write",
        tool_input: { file_path: tasksPath, content: TASKS_WITH_SECOND_X },
      };
      const run = runGate(gateScriptPath, payload, tmpDir);
      assert.equal(run.exitCode, 0, `expected exit 0; stderr:\n${run.stderr}`);
    });
  });

  test("F10 F3 payload but file_path is outside docs/specs -> exit 0", () => {
    withTempDir("akili-gate-f10-", (tmpDir) => {
      const readmePath = path.join(tmpDir, "README.md");
      fs.writeFileSync(readmePath, "irrelevant\n");
      const payload = {
        tool_name: "Write",
        tool_input: { file_path: readmePath },
      };
      const run = runGate(gateScriptPath, payload, tmpDir);
      assert.equal(run.exitCode, 0, `expected exit 0; stderr:\n${run.stderr}`);
    });
  });

  // --- F11-F13: a Cursor payload (top-level
  // cursor_version) gets '{"permission":"allow"}' on stdout on every allow
  // terminal; Claude Code/Codex payloads (no cursor_version) keep today's
  // empty stdout. Live finding 2026-10-01: a native .cursor/hooks.json entry
  // with failClosed: true reads empty stdout as a hook FAILURE and blocks
  // the allow, so the allow path must emit JSON when Cursor is the caller.

  test('F11 Cursor Write (cursor_version) with content carrying no new [x] -> exit 0, stdout {"permission":"allow"}', () => {
    withTempDir("akili-gate-f11-", (tmpDir) => {
      const { tasksPath } = makeSpecDir(tmpDir, { tasksContent: BASE_TASKS, executionContent: EXECUTION_NO_PASS });
      const payload = {
        tool_name: "Write",
        tool_input: { file_path: tasksPath, content: TASKS_NO_NEW_X },
        cursor_version: "2026.10.01-14929f9",
      };
      const run = runGate(gateScriptPath, payload, tmpDir);
      assert.equal(run.exitCode, 0, `expected exit 0; stderr:\n${run.stderr}`);
      assert.equal(
        run.stdout,
        '{"permission":"allow"}',
        `expected exact stdout '{"permission":"allow"}'; got: ${JSON.stringify(run.stdout)}`
      );
    });
  });

  test('F12 Cursor Write (cursor_version) with new [x] and PASS present -> exit 0, stdout {"permission":"allow"}', () => {
    withTempDir("akili-gate-f12-", (tmpDir) => {
      const { tasksPath } = makeSpecDir(tmpDir, { tasksContent: BASE_TASKS, executionContent: EXECUTION_WITH_PASS });
      const payload = {
        tool_name: "Write",
        tool_input: { file_path: tasksPath, content: TASKS_WITH_SECOND_X },
        cursor_version: "2026.10.01-14929f9",
      };
      const run = runGate(gateScriptPath, payload, tmpDir);
      assert.equal(run.exitCode, 0, `expected exit 0; stderr:\n${run.stderr}`);
      assert.equal(
        run.stdout,
        '{"permission":"allow"}',
        `expected exact stdout '{"permission":"allow"}'; got: ${JSON.stringify(run.stdout)}`
      );
    });
  });

  test("F13 Claude Code Write (no cursor_version) with content carrying no new [x] -> exit 0, stdout empty", () => {
    withTempDir("akili-gate-f13-", (tmpDir) => {
      const { tasksPath } = makeSpecDir(tmpDir, { tasksContent: BASE_TASKS, executionContent: EXECUTION_NO_PASS });
      const payload = {
        tool_name: "Write",
        tool_input: { file_path: tasksPath, content: TASKS_NO_NEW_X },
      };
      const run = runGate(gateScriptPath, payload, tmpDir);
      assert.equal(run.exitCode, 0, `expected exit 0; stderr:\n${run.stderr}`);
      assert.equal(run.stdout, "", `expected empty stdout (no cursor_version); got: ${JSON.stringify(run.stdout)}`);
    });
  });
}
