"use strict";

// bugfix/init-ctrlc-abort T1 — the regression gate for `akili init` Ctrl-C
// (requirements FR-1, FR-2, NFR-1..3; design DD-3, DD-4). `akili init` runs
// inside /bin/sh on a real pty driven by `expect`
// (test/fixtures/init/pty-init.exp); `$?` is read on that same pty after the
// CLI exits. The scratch HOME is seeded with a fresh update cache and every
// node process loads test/fixtures/init/no-network.js, so no case goes online.
// Skips with a printed reason on win32 or when `expect` is not on PATH.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const AKILI_BIN = path.join(__dirname, "..", "bin", "akili.js");
const FIXTURE = path.join(__dirname, "fixtures", "init", "pty-init.exp");
const VERSION = require("../package.json").version;
const UPDATE_CACHE = ".akili-specs-update.json";
const INSTALL_TARGETS = [".claude", ".config", ".gemini", ".codex", ".cursor", ".agents"];

// The wizard's option lines, verbatim from runInteractiveInit (FR-2).
const TOOL_OPTIONS = [
  "  1) Claude Code",
  "  2) OpenCode",
  "  3) Google Antigravity",
  "  4) OpenAI Codex",
  "  5) Cursor",
  "  6) Both (Claude Code + OpenCode)",
  "  7) All five",
];
const SCOPE_OPTIONS = [
  "  1) Globally (available in all your projects)",
  "  2) Locally (only for this project workspace)",
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

// A scratch HOME (seeded with a fresh update cache, DD-4) + an empty cwd;
// both removed afterwards.
function withScratch(fn) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "akili-init-pty-"));
  const home = path.join(root, "home");
  const cwd = path.join(root, "cwd");
  fs.mkdirSync(home);
  fs.mkdirSync(cwd);
  const seedPath = path.join(home, UPDATE_CACHE);
  fs.writeFileSync(seedPath, JSON.stringify({ checkedAt: Date.now(), latest: VERSION }));
  const seed = fs.readFileSync(seedPath);
  try {
    return fn({ root, home, cwd, seedPath, seed, netLog: path.join(root, "net.log") });
  } finally {
    // NFR-2: keep every transcript of the run when AKILI_PTY_LOG_DIR is set,
    // before the scratch root goes.
    const keep = process.env.AKILI_PTY_LOG_DIR;
    if (keep) {
      fs.mkdirSync(keep, { recursive: true });
      for (const f of fs.readdirSync(root)) {
        if (f.endsWith(".log")) fs.copyFileSync(path.join(root, f), path.join(keep, `${path.basename(root)}-${f}`));
      }
    }
    fs.rmSync(root, { recursive: true, force: true });
  }
}

// -> { status, signal, raw, log }: raw = the pty transcript, log = ANSI-stripped, CR-free.
function runExpect(ctx, mode) {
  const logFile = path.join(ctx.root, `pty-init-${mode}.log`);
  const r = spawnSync("expect", [FIXTURE, process.execPath, AKILI_BIN, ctx.home, ctx.cwd, logFile, mode], {
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf8",
    timeout: 60000,
  });
  const raw = fs.existsSync(logFile) ? fs.readFileSync(logFile, "utf8") : "";
  const log = stripAnsi(raw).replace(/\r/g, "");
  return { mode, raw, log, status: r.status, signal: r.signal, stderr: r.stderr || "" };
}

function logTail(run, n = 30) {
  return run.log.split("\n").slice(-n).join("\n");
}

function markers(run) {
  return run.log.match(/<<[^\n]*?>>/g) || [];
}

function shellRc(log) {
  const m = log.match(/^RC=(\d+)$/m);
  return m ? Number(m[1]) : null;
}

// Fails with the reason(s), the `expect` exit status/signal, the `<<…>>`
// markers and the last 30 stripped lines — through t.diagnostic first, then
// the assertion message.
function failWith(t, run, reasons) {
  const tail = logTail(run);
  const head = `pty-init.exp ${run.mode}: ${reasons.join("; ")}\nexpect pty-init.exp ${run.mode} exited with status ${run.status} (signal ${run.signal})\nmarkers: ${markers(run).join(" ") || "(none)"}`;
  t.diagnostic(`${head}\nlast 30 log lines:\n${tail}`);
  assert.fail(`${head}\nstderr:\n${run.stderr}\nlast 30 log lines:\n${tail}`);
}

// A harness fault (an `expect` wait that timed out, an early EOF, a hung
// shell, no `RC=` line) is never the regression red: it fails here, before
// any behavioral check, under its own reason.
function assertHarness(t, run) {
  const back = run.log.match(/<<BACK-IN (\d+) ms>>/);
  if (back) t.diagnostic(`pty-init.exp ${run.mode}: <<BACK-IN ${back[1]} ms>>`);
  const reasons = [];
  if (run.status !== 0) reasons.push(`harness: expect did not finish cleanly`);
  for (const m of ["<<TIMEOUT", "<<EOF>>", "<<HUNG>>", "<<NO-PROMPT-AFTER-CTRL-C>>"]) {
    if (run.log.includes(m)) reasons.push(`harness: transcript holds ${m}`);
  }
  if (shellRc(run.log) === null) reasons.push("harness: no RC= line in the transcript");
  if (reasons.length) failWith(t, run, reasons);
}

// Runs every check and fails once, listing each failed check in order, so a
// red names all of them (the RC check comes first).
function assertChecks(t, run, checks) {
  const failed = checks.filter(([, ok]) => !ok).map(([name]) => name);
  if (failed.length) failWith(t, run, failed);
}

// FR-1 "after writing one newline": after the last question's text, the
// shell prompt starts a line of its own — never on the question's `> ` line.
function shellPromptOnOwnLine(log, question) {
  const after = log.slice(log.lastIndexOf(question));
  const at = after.indexOf("SH> ");
  if (at < 0) return false;
  return at === 0 || after[at - 1] === "\n";
}

// FR-1 "one newline" (strict, /akili-test): the line right before the shell
// prompt is the question's bare `> ` — no blank line from a doubled newline,
// no text written after the prompt.
function exactlyOneNewline(log, question) {
  const lines = log.slice(log.lastIndexOf(question)).split("\n");
  const at = lines.findIndex((l) => l.startsWith("SH> "));
  return at > 0 && lines[at - 1] === "> ";
}

// FR-2 BUT (/akili-test): each answered question's prompt line reads exactly
// `> <answer>` — no default marker or trailing text after the prompt.
function promptLinesExact(log, answers) {
  const prompts = log.split("\n").filter((l) => l.startsWith(">"));
  return prompts.length === answers.length && prompts.every((l, i) => l === `> ${answers[i]}`);
}

function noInstallTarget(ctx) {
  return INSTALL_TARGETS.every((d) => !fs.existsSync(path.join(ctx.home, d)) && !fs.existsSync(path.join(ctx.cwd, d)));
}

// NFR-1: no https call was made, and the seeded cache is byte-identical.
function offlineChecks(ctx) {
  const net = fs.existsSync(ctx.netLog) ? fs.readFileSync(ctx.netLog, "utf8").trim().split("\n").join(",") : null;
  return [
    [`NFR-1: net.log absent (no https.get/request; net.log holds ${net === null ? "nothing" : net})`, net === null],
    ["NFR-1: update-cache seed byte-identical", fs.existsSync(ctx.seedPath) && fs.readFileSync(ctx.seedPath).equals(ctx.seed)],
  ];
}

function abortCase(mode, question) {
  return (t) => {
    if (SKIP) return t.skip(SKIP);
    t.diagnostic(`process.version ${process.version} (${process.execPath})`);
    withScratch((ctx) => {
      const run = runExpect(ctx, mode);
      assertHarness(t, run);
      const rc = shellRc(run.log);
      assertChecks(t, run, [
        [`FR-1: RC=130 (read RC=${rc})`, rc === 130],
        ["FR-1: newline before the shell prompt (SH> starts its own line)", shellPromptOnOwnLine(run.log, question)],
        ["FR-1: exactly one newline (the line before SH> is the bare `> `)", exactlyOneNewline(run.log, question)],
        ["FR-1: zero trace lines (^\\s+at )", !/^\s+at /m.test(run.log)],
        ["FR-1: no AbortError", !run.log.includes("AbortError")],
        ["FR-1: no install target in HOME or cwd", noInstallTarget(ctx)],
        ...offlineChecks(ctx),
      ]);
    });
  };
}

test("pty init FR-1 (a): Ctrl-C at the tool question exits 130, nothing installed", abortCase("q1", "Which tool"));

test("pty init FR-1 (b): Ctrl-C at the scope question exits 130, nothing installed", abortCase("q2", "globally or locally"));

test("pty init FR-2 (c): answered 1/1 installs Claude Code globally and exits 0", (t) => {
  if (SKIP) return t.skip(SKIP);
  t.diagnostic(`process.version ${process.version} (${process.execPath})`);
  withScratch((ctx) => {
    const run = runExpect(ctx, "answer");
    assertHarness(t, run);
    const rc = shellRc(run.log);
    const lines = new Set(run.log.split("\n"));
    assertChecks(t, run, [
      [`FR-2: RC=0 (read RC=${rc})`, rc === 0],
      ...[...TOOL_OPTIONS, ...SCOPE_OPTIONS].map((o) => [`FR-2: option line verbatim: ${JSON.stringify(o)}`, lines.has(o)]),
      ["FR-2: prompt lines read exactly `> 1` (no default marker or trailing text)", promptLinesExact(run.log, ["1", "1"])],
      ["FR-2: HOME/.claude/commands present", fs.existsSync(path.join(ctx.home, ".claude", "commands"))],
      ["FR-2: nothing created in cwd", fs.readdirSync(ctx.cwd).length === 0],
      ...offlineChecks(ctx),
    ]);
  });
});

// FR-4 (Pivot V-1): stdin at end-of-input before an answer exits 130. No pty
// is involved — stdin is the null device — so this case never uses SKIP.
function failEof(t, r, reasons) {
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const tail = stripAnsi(out).replace(/\r/g, "").split("\n").slice(-30).join("\n");
  const head = `init eof: ${reasons.join("; ")}\nakili init exited with status ${r.status} (signal ${r.signal})`;
  t.diagnostic(`${head}\nlast 30 output lines:\n${tail}`);
  assert.fail(`${head}\nlast 30 output lines:\n${tail}`);
}

test("init FR-4 (d): init with stdin at EOF exits 130, nothing installed", (t) => {
  t.diagnostic(`process.version ${process.version} (${process.execPath})`);
  withScratch((ctx) => {
    const preload = path.join(__dirname, "fixtures", "init", "no-network.js");
    const r = spawnSync(process.execPath, [AKILI_BIN, "init"], {
      cwd: ctx.cwd,
      stdio: ["ignore", "pipe", "pipe"],
      encoding: "utf8",
      timeout: 60000,
      env: {
        ...process.env,
        HOME: ctx.home,
        USERPROFILE: ctx.home,
        NODE_OPTIONS: `--require "${preload}"`,
        AKILI_NET_MARKER: ctx.netLog,
      },
    });
    const out = `${r.stdout || ""}${r.stderr || ""}`;
    const checks = [
      [`FR-4: status 130 (read ${r.status})`, r.status === 130],
      ["FR-4: zero trace lines (^\\s+at )", !/^\s+at /m.test(out)],
      ["FR-4: no AbortError", !out.includes("AbortError")],
      ["FR-4: no install target in HOME or cwd", noInstallTarget(ctx)],
      ...offlineChecks(ctx),
    ];
    const failed = checks.filter(([, ok]) => !ok).map(([name]) => name);
    if (failed.length) failEof(t, r, failed);
  });
});
