"use strict";

// changes/routing-keyboard-select T3 — the pty gate (design §7.3, DD-6;
// requirements §8 rows that have "No unit gate exists — pty only").
// `akili routing` runs inside /bin/sh on a real pty driven by `expect`
// (test/fixtures/routing/pty-*.exp); `$?` and `stty -a` are read on that same
// pty after the CLI exits. Every keyboard case asserts a keyboard-only token
// (`❯`, `ESC[7A`, the guidance line); every fallback case asserts a comma-only
// token (`(comma-separated numbers)`) AND the absence of `❯`.
// Skips with a printed reason on win32 or when `expect` is not on PATH.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const AKILI_BIN = path.join(__dirname, "..", "bin", "akili.js");
const FIXTURES_DIR = path.join(__dirname, "fixtures", "routing");
const NO_RAWMODE = path.join(FIXTURES_DIR, "no-rawmode.js");

// The flags run whose `.agents/model-routing.json` the keyboard run must
// byte-equal (FR-1 "the resulting answers equal those of a comma-form run").
const KEYBOARD_EQUIVALENT_FLAGS = [
  "--hosts", "claude,cursor",
  "--models", "claude=opus,sonnet,haiku",
  "--models", "cursor=c-one@T1+T3,c-two@T2+T5,c-three@T3",
  "--cli", "claude=claude", "--cli", "cursor=agent",
  "--wrappers", "yes", "--yes",
];

function skipReason() {
  if (process.platform === "win32") return "win32: no pty";
  const r = spawnSync("which", ["expect"], { encoding: "utf8" });
  if (r.status !== 0) return "expect not on PATH";
  return null;
}
const SKIP = skipReason();

// Every CSI sequence (colors, cursor moves, clear-line, cursor show/hide).
function stripAnsi(text) {
  return text.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, "");
}

// A scratch git project + a scratch HOME; both removed afterwards.
function withProject(fn) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "akili-routing-pty-"));
  const home = path.join(root, "home");
  const project = path.join(root, "project");
  fs.mkdirSync(home);
  fs.mkdirSync(project);
  spawnSync("git", ["init", "-q"], { cwd: project });
  try {
    return fn({ root, home, project });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

// -> { status, raw, log }: raw = the pty transcript, log = ANSI-stripped, CR-free.
function runExpect(ctx, fixture, extra = []) {
  const logFile = path.join(ctx.root, `${fixture}.log`);
  const r = spawnSync("expect", [path.join(FIXTURES_DIR, fixture), process.execPath, AKILI_BIN, ctx.project, ctx.home, logFile, ...extra], {
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf8",
    timeout: 60000,
  });
  const raw = fs.existsSync(logFile) ? fs.readFileSync(logFile, "utf8") : "";
  const log = stripAnsi(raw).replace(/\r/g, "");
  return { raw, log, fixture: extra.length ? `${fixture} ${extra[0]}` : fixture, status: r.status, signal: r.signal, stderr: r.stderr || "" };
}

// Asserted last in every test, so a behavioral assertion (the rendered text)
// fails first and an `expect` wait timeout (exit 2, `<<TIMEOUT: …>>` in the
// transcript) only surfaces when every rendered-text assertion held.
function assertFinished(run) {
  assert.equal(run.status, 0, `expect ${run.fixture} exited ${run.status} (signal ${run.signal}); stderr:\n${run.stderr}\ntranscript tail:\n${run.log.slice(-1500)}`);
}

function logTail(run, n = 30) {
  return run.log.split("\n").slice(-n).join("\n");
}

// T6 (V-2): a fixture that never got the shell back (`<<HUNG>>`, exit 99) or
// a spawnSync kill (status null) fails here with the transcript's last 30
// lines, before any assertion that would only report a missing `RC=`.
function assertNotHung(t, run) {
  if (run.log.includes("<<HUNG>>") || run.status === null) {
    const tail = logTail(run);
    t.diagnostic(`${run.fixture} hung (status ${run.status}, signal ${run.signal}); last 30 log lines:\n${tail}`);
    assert.fail(`${run.fixture}: the process did not return to the shell (status ${run.status}, signal ${run.signal}); last 30 log lines:\n${tail}`);
  }
}

// T6 (V-2): every Ctrl-C case reports how long the shell prompt took to come
// back, and a first Ctrl-C that did not return within 25 s is a FAIL even when
// the fixture's second Ctrl-C recovered it — the marker only makes it legible.
function assertCtrlCReturned(t, run) {
  const back = run.log.match(/<<BACK-IN (\d+) ms>>/);
  t.diagnostic(`${run.fixture}: ${back ? `<<BACK-IN ${back[1]} ms>>` : "no <<BACK-IN>> line"}`);
  if (run.log.includes("<<NO-PROMPT-AFTER-CTRL-C>>")) {
    const tail = logTail(run);
    t.diagnostic(`${run.fixture}: <<NO-PROMPT-AFTER-CTRL-C>>; last 30 log lines:\n${tail}`);
    assert.fail(`${run.fixture}: no shell prompt within 25 s of Ctrl-C (<<NO-PROMPT-AFTER-CTRL-C>>); last 30 log lines:\n${tail}`);
  }
  assertNotHung(t, run);
}

function shellRc(log) {
  const m = log.match(/^RC=(\d+)$/m);
  return m ? Number(m[1]) : null;
}

function sttyEcho(log) {
  const m = log.match(/<<STTY: (-?echo)>>/);
  return m ? m[1] : null;
}

// Entries in the project, `.git` excluded.
function entries(dir) {
  return fs.readdirSync(dir).filter((n) => n !== ".git").sort();
}

function assertComma(log) {
  assert.match(log, /Which hosts do you use\? \(comma-separated numbers\)/);
  assert.match(log, /\n> /);
  assert.ok(!log.includes("❯"), "the keyboard cursor `❯` must not render on the comma path");
  assert.ok(!log.includes("↑/↓ move · space toggles"), "the keyboard hint line must not render on the comma path");
}

test("pty FR-1 / FR-5: keyboard happy path — hosts 1+5 by keys, in-place redraw, typed question echoes, answers byte-equal the flags run", (t) => {
  if (SKIP) return t.skip(SKIP);
  withProject((kb) => {
    const run = runExpect(kb, "pty-keyboard.exp");
    assertNotHung(t, run);
    const { raw, log } = run;
    // The host block: from its title to Claude Code's model question.
    const hostAt = log.indexOf("Which hosts do you use?");
    const rosterAt = log.indexOf("Claude Code — which models do you have?");
    const hostBlock = log.slice(hostAt, rosterAt === -1 ? undefined : rosterAt);
    assert.ok(hostBlock.includes("❯ [x] 5) Cursor"), "the host list must show `❯ [x] 5) Cursor` after space, ↓×4, space");
    assert.ok(hostBlock.includes("  [x] 1) Claude Code"));
    // 5 options + title + hint = 7 lines rewritten in place on every key —
    // counted inside the host block of the RAW transcript only.
    const hostRaw = raw.slice(raw.indexOf("Which hosts do you use?"), raw.indexOf("Claude Code — which models do you have?"));
    assert.ok(hostRaw.includes("\x1b[7A"), "the host block must redraw in place via ESC[7A");
    assert.ok(hostAt !== -1 && rosterAt > hostAt, "the wizard must reach Claude Code's model question");
    assert.ok(!hostBlock.includes("> "), "no `> ` typed-input line on the keyboard path");
    assert.ok(!log.includes("nothing selected"));
    // FR-5 *Questions alternate*: the typed CLI answer after two selects echoes once.
    assert.match(log, /Claude Code — CLI invocation \[claude\][^\n]*\n> +\[claude\] +claude\n/);
    assert.equal(shellRc(log), 0);
    assert.equal(sttyEcho(log), "echo");
    const kbJson = fs.readFileSync(path.join(kb.project, ".agents", "model-routing.json"), "utf8");
    withProject((fl) => {
      const r = spawnSync(process.execPath, [AKILI_BIN, "routing", "--project", fl.project, ...KEYBOARD_EQUIVALENT_FLAGS], {
        env: Object.assign({}, process.env, { HOME: fl.home, USERPROFILE: fl.home }),
        input: "",
        encoding: "utf8",
        timeout: 10000,
      });
      assert.equal(r.status, 0, r.stderr);
      const flJson = fs.readFileSync(path.join(fl.project, ".agents", "model-routing.json"), "utf8");
      // P-6: `updatedAt` is a UTC date — both runs land on the same day unless
      // they straddle UTC midnight (then only the stripped form is comparable).
      const sameDay = JSON.parse(kbJson).updatedAt === JSON.parse(flJson).updatedAt;
      if (sameDay) assert.equal(kbJson, flJson);
      else {
        t.diagnostic("updatedAt differs (UTC-midnight boundary): compared with updatedAt stripped — byte-equality inconclusive");
        const strip = (s) => s.replace(/"updatedAt": "[^"]*"/, '"updatedAt": ""');
        assert.equal(strip(kbJson), strip(flJson));
      }
    });
    assertFinished(run);
  });
});

test("pty FR-2: empty confirm shows the guidance line and keeps the question open", (t) => {
  if (SKIP) return t.skip(SKIP);
  withProject((ctx) => {
    const run = runExpect(ctx, "pty-empty-confirm.exp");
    assertCtrlCReturned(t, run);
    const { log } = run;
    assert.ok(log.includes("mark at least one option — space toggles, Enter confirms"));
    assert.ok(log.includes("Claude Code — which models do you have?"), "space + Enter after the guidance must proceed");
    assert.ok(!log.includes("nothing selected"));
    assert.equal(shellRc(log), 130, "Ctrl-C at the roster question (keyboard path) exits 130");
    assert.equal(sttyEcho(log), "echo");
    assertFinished(run);
  });
});

test("pty FR-5: Ctrl-C at the host question exits 130, writes nothing, restores echo, prints no stack trace", (t) => {
  if (SKIP) return t.skip(SKIP);
  withProject((ctx) => {
    const run = runExpect(ctx, "pty-ctrl-c.exp");
    assertCtrlCReturned(t, run);
    const { log } = run;
    assert.ok(log.includes("❯ [ ] 1) Claude Code"), "the keyboard list must have rendered before Ctrl-C");
    assert.equal(shellRc(log), 130);
    assert.equal(sttyEcho(log), "echo");
    assert.deepEqual(entries(ctx.project), []);
    assert.doesNotMatch(log, /^\s+at /m);
    assertFinished(run);
  });
});

test("pty FR-4 / FR-5: TERM=dumb renders the comma form; `1,5` is accepted; Ctrl-C on the comma path exits 130 too", (t) => {
  if (SKIP) return t.skip(SKIP);
  withProject((ctx) => {
    const run = runExpect(ctx, "pty-fallback.exp", ["dumb"]);
    assertCtrlCReturned(t, run);
    const { log } = run;
    assertComma(log);
    assert.match(log, /Claude Code — which models do you have\? \(comma-separated numbers\)/, "`1,5` must be accepted");
    // Pivot B: a typed question's Ctrl-C ends like the keyboard path's on every
    // Node (Node >= 22.23 rejects readline's pending question with AbortError).
    assert.equal(shellRc(log), 130, "Ctrl-C at the roster question (comma path) exits 130");
    assert.equal(sttyEcho(log), "echo");
    assert.deepEqual(entries(ctx.project), []);
    assert.doesNotMatch(log, /^\s+at /m);
    assertFinished(run);
  });
});

test("pty FR-4: stdin TTY without setRawMode renders the comma form", (t) => {
  if (SKIP) return t.skip(SKIP);
  withProject((ctx) => {
    const run = runExpect(ctx, "pty-fallback.exp", ["norawmode", NO_RAWMODE]);
    assertCtrlCReturned(t, run);
    const { log } = run;
    assertComma(log);
    // No raw mode -> the pty stays cooked and Ctrl-C is a SIGINT (RC=130), as
    // at dbdccea; only echo is read.
    assert.equal(sttyEcho(log), "echo");
    assertFinished(run);
  });
});

test("pty FR-4: output stream not a TTY (`| cat`) renders the comma form", (t) => {
  if (SKIP) return t.skip(SKIP);
  withProject((ctx) => {
    const run = runExpect(ctx, "pty-fallback.exp", ["piped"]);
    assertCtrlCReturned(t, run);
    const { log } = run;
    assertComma(log);
    // `$?` is cat's status here (SIGINT reaches the whole pipeline), so only echo is read.
    assert.equal(sttyEcho(log), "echo");
    assertFinished(run);
  });
});
