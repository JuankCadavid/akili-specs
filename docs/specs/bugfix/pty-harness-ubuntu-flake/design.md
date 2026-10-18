# Design: pty harness — a red Ctrl-C case carries its own evidence

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `bugfix/pty-harness-ubuntu-flake` |
| Depth | **Lite** (Bug Mode) — re-checked at §11: 2 tasks, ~190 LOC, 3 review rounds; stays Lite |
| Type | Bug |
| Approval Mode | `gated` |
| Status | **Approved** — 2026-10-17 (user, Phase 2 gate: Continue; judgment-day not requested — no High-impact UNVERIFIED row) |
| Date | 2026-10-17 |
| Source | `requirements.md` (approved 2026-10-17, Phase 1 gate: Continue) |
| Format precedent | `docs/specs/archive/2026-10-16-changes--routing-keyboard-select/design.md` |
| Verified at | `cabd04d` — every `file:line` and every probe below was run on 2026-10-17 before it was written (KZ-changes--leader-brief-contract-2) |
| Skills | `tdd` (regression test first) · `systematic-debugging` (if the probe line misbehaves on a real pty) · `cognitive-doc-design` (this document and the `AGENTS.md` clause) |

## 2. Executive Summary

Four small moves, all in test and CI files: (1) every `RC`/tty assertion in `test/routing-pty.test.js` goes through one helper whose failure message carries the `expect` status, the markers and the transcript tail; (2) the four fixtures replace their `echo RC=$?` + `stty -a` exchanges with one `\n`-terminated probe line that prints the tty flags, the process groups and the saved `$?` under an echo-safe marker; (3) transcripts are copied to `AKILI_PTY_LOG_DIR` before the scratch root is removed, and the Linux CI job uploads them on failure; (4) a regression test runs the real suite with a fake `expect` on `PATH` and proves the message. CI gains two `workflow_dispatch` inputs to loop the suite and to inject the failure. `bin/` is untouched.

## 3. Architecture Overview

```
node --test
 ├─ test/routing-pty.test.js ──spawnSync("expect", …)──▶ pty-*.exp ──▶ /bin/sh ──▶ node bin/akili.js routing
 │     │  runExpect → run{status,signal,raw,log}
 │     │  assertCtrlCReturned (T6)            ← unchanged
 │     │  assertShellRc(t, run, n, why)       ← NEW: message = why · status/signal · markers · tail; + t.diagnostic
 │     │  assertTtySane(t, run)               ← NEW: <<TTY: …>> flags ⊇ {icrnl,icanon,isig,echo}, PG == FG
 │     └  withProject finally: copy *.log → $AKILI_PTY_LOG_DIR (if set) → rmSync   ← NEW
 └─ test/routing-pty-evidence.test.js (NEW, FR-4) ──spawnSync(node --test --test-reporter=tap test/routing-pty.test.js,
         PATH = <tmp>/bin:$PATH, AKILI_PTY_LOG_DIR=<tmp>/logs)──▶ <tmp>/bin/expect = fake-expect.sh (canned transcript, exit 2)
            → parses TAP, asserts the case-3 `not ok` block holds the sentinel, `status 2`, `<<TIMEOUT: unmatched wait>>`
            → asserts <tmp>/logs holds pty-ctrl-c.exp*.log

.github/workflows/ci.yml (Linux legs): versions step → [inject shim on dispatch] → Unit tests (env AKILI_PTY_LOG_DIR)
   → [pty loop on dispatch] → upload-artifact if: failure()
```

## 4. Extended Directory Structure

| Path | Change |
|---|---|
| `test/routing-pty.test.js` | modify — helpers `ttyProbe`, `rcFailure`, `assertShellRc`, `assertTtySane`; `withProject` copy; 10 call sites (`:153–154`, `:188–189`, `:201–202`, `:219–220`, `:236`, `:249`) |
| `test/fixtures/routing/pty-keyboard.exp`, `pty-empty-confirm.exp`, `pty-ctrl-c.exp`, `pty-fallback.exp` | modify — the tail exchanges (e.g. `pty-ctrl-c.exp:54–61`) become the probe line |
| `test/fixtures/routing/fake-expect.sh` | new — POSIX `sh`; writes the canned transcript to `$6`; `exit 2` |
| `test/routing-pty-evidence.test.js` | new — the FR-4 regression test (skips on `win32` with a printed reason) |
| `.github/workflows/ci.yml` | modify — `workflow_dispatch` inputs; versions step; env; inject step; loop step; artifact step |
| `AGENTS.md:13` | modify — one clause (NFR-4) |

## 5. Data Model

### 5.1 Probe line (one shell line, `\n`-terminated — DD-2)

Typed text (conceptually): save `$?` into a variable first; then print `T""TY=` + the four flags as `stty -a` reports them (each as `name` or `-name`, order as printed) + ` PG=` + the shell's pgid + ` FG=` + the tty's foreground pgid (`ps -o tpgid= -p $$`); then print `RC=` + the saved value. The output line starts with `TTY=`; the typed line never contains that substring, so the echo of the command cannot satisfy the wait (P-7).

### 5.2 `<<TTY: …>>` marker

`<<TTY: <flags…> PG=<n> FG=<n>>>` — written by the fixture with `send_log` from the matched output line. Parsed by `ttyProbe(log)` → `{ flags: Set<string>, pg, fg }`. Flag order is **not** asserted: macOS prints `icanon isig echo icrnl`, Linux `icrnl isig icanon echo` (P-8). The `<<STTY: (-?echo)>>` marker and `sttyEcho()` are retired (P-6).

### 5.3 Failure message (`rcFailure(run, expected, why)`)

Lines, in order: `why`; `expect <fixture> exited with status <status> (signal <signal>)`; `markers: <every <<…>> line, joined by " · ">` (or `none`); `last 30 transcript lines:` + `logTail(run)`. The same string goes to `t.diagnostic` before the `assert.fail` (DD-1).

### 5.4 Canned transcript (`fake-expect.sh`)

Lines: a `Which hosts do you use?` title; `❯ [ ] 1) Claude Code`; `Enter confirms`; `<<BACK-IN 5 ms>>`; `<<AKILI-EVIDENCE-SENTINEL 7f3a>>`; `<<TIMEOUT: unmatched wait>>`. No `RC=`, no `TTY=`. Exit 2. The shim ignores its arguments except `$6` (the log path).

### 5.5 CI inputs

| Input | Type | Default | Effect (Linux legs only) |
|---|---|---|---|
| `pty_loops` | number | `1` | after Unit tests, run `node --test test/routing-pty.test.js` `pty_loops − 1` more times with transcripts kept |
| `pty_inject_failure` | boolean | `false` | before Unit tests, install `fake-expect.sh` as `$RUNNER_TEMP/fake-bin/expect` and prepend it to `PATH` |

## 6. API Design

None — no public surface. Env contract: `AKILI_PTY_LOG_DIR=<dir>` (optional; test-only).

## 7. Backend Module Design

### 7.1 `test/routing-pty.test.js`

- `ttyProbe(log)`; `rcFailure(run, expected, why)`; `assertShellRc(t, run, expected, why)` — `shellRc(log) === expected` or `t.diagnostic(msg)` + `assert.fail(msg)`; `assertTtySane(t, run)` — probe present, `flags ⊇ {icrnl, icanon, isig, echo}`, `pg === fg`, same message shape on failure.
- `withProject(fn)`: in `finally`, when `process.env.AKILI_PTY_LOG_DIR` is set, create it and copy every `*.log` under `root` as `<basename(root)>-<file>`; then `rmSync` as today. Unset → byte-identical behaviour (FR-2 `AND IT MUST`).
- Call sites: `assert.equal(shellRc(log), n[, why])` → `assertShellRc(t, run, n, why)`; `assert.equal(sttyEcho(log), "echo")` → `assertTtySane(t, run)`. Order inside each case unchanged (behavioral assertions first, `assertFinished` last).

### 7.2 Fixtures

Replace, in each of the four: `send "echo RC=\$?\r"` · `expect -re {RC=\d+}` · the `stty -a | tr …` send · `expect -re {\r\n(-?echo)\r\n}` · `send_log "<<STTY: …>>"` with: the probe `send` (§5.1, `\n`), `expect -re {TTY=([^\r\n]*)\r?\n}` → `send_log "\n<<TTY: $expect_out(1,string)>>\n"`, `expect -re {RC=\d+}`, `send "exit\n"`. `ctrl_c_to_shell` and every wait before it stay as T6 left them.

### 7.3 `test/routing-pty-evidence.test.js`

Skip on `win32` (same reason text pattern as `skipReason`, P-10). Build `<tmp>/bin/expect` from `fake-expect.sh` (`chmod 0o755`), run the suite once as a child with `PATH` prefixed and `AKILI_PTY_LOG_DIR=<tmp>/logs`, then: child exit ≠ 0; TAP contains a `not ok … pty FR-5: Ctrl-C at the host question` block (name quoted from `:194`) whose text up to the next `# Subtest`/`not ok`/`ok` contains the sentinel, `status 2`, `<<TIMEOUT: unmatched wait>>`; `<tmp>/logs` contains a file matching `/pty-ctrl-c\.exp.*\.log$/`. One child spawn serves both assertions (NFR-3).

### 7.4 `.github/workflows/ci.yml`

`on.workflow_dispatch.inputs` (§5.5); step *Toolchain versions (Linux)* — `node -v && expect -v`; step *Inject pty failure (dispatch)* — `if: runner.os == 'Linux' && inputs.pty_inject_failure == true`; Unit tests step gains `env: AKILI_PTY_LOG_DIR: ${{ runner.temp }}/pty-transcripts`; step *pty loop (dispatch)* — `if: runner.os == 'Linux' && inputs.pty_loops > 1`; step *Upload pty transcripts* — `actions/upload-artifact@v4`, `if: failure() && runner.os == 'Linux'`, `name: pty-transcripts-${{ matrix.os }}-node${{ matrix.node }}`, `path: ${{ runner.temp }}/pty-transcripts`, `if-no-files-found: ignore`.

## 8. Frontend / UX Component Architecture

None (terminal test harness).

## 9. Shared Contracts or Package Extensions

- `<<STTY: …>>` retired → `<<TTY: …>>` (consumer: this test file only, P-6).
- `AGENTS.md:13`: append *"a failed run's transcripts are kept under `AKILI_PTY_LOG_DIR` and uploaded by the Linux CI legs as `pty-transcripts-*`"*.
- No package or CHANGELOG change: `test/` is not shipped (P-3). A CHANGELOG *Unreleased* line is **not** added — the release rule covers package-affecting changes only. **Amended at execute time (2026-10-18, user's order at the T1 gate):** a CHANGELOG *Unreleased* entry and a v2.32.2 patch release were added at the user's request — the spec itself owes neither, and nothing in it enters the package tarball (`package.json` `files` excludes `docs/specs` via `!docs/specs`; `test/`, `.github/` and `AGENTS.md` are outside `files` — checked with `npm pack --dry-run` on 2026-10-18: 0 `docs/specs/` entries). Recorded in `execution.md` → T2, *decisions made*.

## 10. Design Decisions

### DD-1 — Evidence goes into the assertion message **and** `t.diagnostic`
The TAP `error: |-` block renders multi-line messages on Node 18.20.8 and 22.23.3 (probe: a thrown `line1\nline2 SENTINEL` shows `SENTINEL` inside the block on both) — but a reporter may truncate or re-flow it, and `t.diagnostic` lines are what T6 already relies on. Both cost nothing; the regression test asserts the block. KZ-002: no "the reporter prints everything" claim is made — the test checks it.

### DD-2 — One `\n`-terminated probe line replaces three `\r` exchanges; echo-safe marker; `$?` saved first
Every observed red died at the first `\r` exchange. A line ending in `\n` is complete in cooked mode and, with `icanon` off, is still split by the shell itself — so if the pty is left without `icrnl` (H1) the probe *runs* and reports `-icrnl` instead of timing out (FR-3 scenario 2). Dash echoes typed input, so the wait pattern must not occur in the typed text: `T""TY=` typed, `TTY=` printed (P-7: the first probe matched its own echo on dash, macOS and Linux). `$?` is captured into a variable before `stty`/`ps` run (FR-3 `BUT`). Rejected: keeping the `\r` exchange "to preserve the symptom" — the symptom is useless without the flags, and H1 now surfaces as a strict flag assertion.

### DD-3 — The regression test drives the real suite through a `PATH` shim
A unit test of `rcFailure` would be green the moment the helper exists and would say nothing about call-site order, `t.diagnostic`, or what the reporter prints. Spawning the real file under the fake `expect` makes the baseline fail **on the behavioral assertion** (the block reads `null !== 130`, no sentinel — quoted in `tasks.md` T1 *Red run*) and the fixed code pass; `which expect` and `spawnSync("expect")` are reached through `PATH` exactly as in CI (P-4). Cost: one extra child run of the suite (~1 s with the shim — no pty is opened).

### DD-4 — The shim is a plain fixture file installed at runtime, never a committed executable
`test/fixtures/**` is `-text` in `.gitattributes` (P-11) but file modes are a separate checkout concern; installing the shim with `chmod 0o755` from the test (and from the CI inject step) removes that premise. The same file serves FR-4 and FR-5.

### DD-5 — Transcripts persist by env var, upload only on failure, no retry and no skip
Rejected: `retry` on the pty cases (hides the rate the archive accepted as WARN V-2 on the promise of instrumentation); dropping the Ubuntu leg (removes the only Linux gate for FR-4/FR-5 of the predecessor); uploading on every run (noise, storage). `if-no-files-found: ignore` keeps a non-pty failure from failing twice.

### Reversion challenge (Step 2.3)
Trigger check: DD-2 **removes** the `<<STTY: (-?echo)>>` marker and `sttyEcho()`. Lite depth and no visible surface, so the challenge may be skipped; run anyway in one question — *what does removing it break?* — answer: nothing outside `test/routing-pty.test.js` (P-6: 6 call sites, all replaced by `assertTtySane`, which asserts a **superset** — `echo` plus three more flags plus `PG == FG`). No breakage; recorded.

## 11. Budget (Step 2.4 — tripwire for `/akili-execute`)

| Measure | Expected | Basis |
|---|---|---|
| Tasks | **2** | T1 harness (test helpers · four fixtures · shim · regression test) · T2 CI + `AGENTS.md` clause |
| LOC | **~190** | test helpers + call sites ~55 · fixtures 4 × ~8 = ~32 · `fake-expect.sh` ~15 · regression test ~55 · `ci.yml` ~30 · `AGENTS.md` 1 |
| Review rounds | **3** | T1 × 2 (timing-sensitive harness, ten call sites) · T2 × 1 |

Depth check: two tasks under 200 LOC with no product surface — Lite holds. `/akili-execute` stops and escalates past 2 tasks, ~230 LOC (+20 %), or 3 rounds.

## 12. Premise Ledger

**Count:** 12 rows — 11 verified, 1 `UNVERIFIED` (P-12, Low Impact).
**Blast-radius triggers:** `live-path` fires (the reproduction is a CI job reaching the `shellRc` assertion); `shared-state` fires (the four fixtures share the transcript contract and three share `ctrl_c_to_shell`); `consumer` fires (the `<<STTY:>>` marker is removed, `sttyEcho` is removed).

| # | Claim | Class | Citation (as run) | Verified at | If false | Settled by |
|---|---|---|---|---|---|---|
| P-1 | Exactly ten assertion sites read `RC`/tty from the transcript: `shellRc` at `:153`, `:188`, `:201`, `:219`; `sttyEcho` at `:154`, `:189`, `:202`, `:220`, `:236`, `:249`; `assertFinished` last in every case (`:175`, `:190`, `:205`, `:223`, `:237`, `:250`) | `location` | `grep -n "shellRc(log)\|sttyEcho(log)\|assertFinished(run)" test/routing-pty.test.js` → the 16 lines listed | `cabd04d` | more sites need the helper — Low | — |
| P-2 | `ci.yml` has no artifact upload and no `workflow_dispatch`; the two release workflows do have `workflow_dispatch` | `existence` | `grep -rn "workflow_dispatch\|upload-artifact" .github/workflows/` → `release-notify.yml:9`, `release-status.yml:8` only | `cabd04d` | FR-5 would collide with an existing trigger — Low | — |
| P-3 | `test/` is not in the published package | `data-env` | `package.json:16–24` `files` = `.claude/commands`, `.claude/skills`, `.claude/templates`, `.mcp.json.example`, `assets`, `bin`, `CHANGELOG.md`, `docs` … (no `test`) | `cabd04d` | a CHANGELOG entry and a release would be owed — Low | — |
| P-4 | Live path: `npm test` → `node --test` → `test/routing-pty.test.js` case → `skipReason` `which expect` (`:33–38`) → `runExpect` `spawnSync("expect", [fixture, …, logFile, …])` (`:62–73`) → `assertCtrlCReturned` (`:99–106`) → `assert.equal(shellRc(log), 130)` (`:201`) → throw → `withProject` `finally` `fs.rmSync(root)` (`:57`); a `PATH` shim named `expect` is reached by both `which` and `spawnSync` | `live-path` | lines as cited; CI job 117423310663 lines 910–936 show this exact failure block | `cabd04d` | DD-3's shim would not be reached — High — but verified | — |
| P-5 | The three Ctrl-C fixtures share `ctrl_c_to_shell` (2 hits each: proc + call) and all four share `log_file` and the `<<STTY:>>` exchange | `shared-state` | `grep -c "ctrl_c_to_shell" test/fixtures/routing/pty-*.exp` → fallback 2 · empty-confirm 2 · ctrl-c 2 · keyboard 0; `grep -c "log_file\|<<STTY" …` → 2 in each of the four | `cabd04d` | a fixture would miss the probe — Low | — |
| P-6 | `<<STTY:` has one producer family (the four fixtures) and one consumer, `sttyEcho` (`:115–118`), with six call sites | `consumer` | `grep -rn "<<STTY\|sttyEcho" --include="*.js" --include="*.exp" --include="*.yml" --include="*.md" . \| grep -v node_modules \| grep -v docs/specs/archive` → the test file (`:115`, `:116`, six call sites) and the four fixtures | `cabd04d` | another reader of the marker breaks — Low | — |
| P-7 | A `\n`-terminated line is executed by `/bin/sh` (bash 3.2, macOS), `/bin/dash` (macOS) and `/bin/sh` → dash (Debian, Linux) on an `expect` pty; dash **echoes the typed line**, so a wait pattern present in the typed text matches the echo first; `T""TY=` typed / `TTY=` printed avoids it; `$?` survives into a variable | `data-env` | `scratchpad/lf.exp`: first version matched its own echo on dash (macOS and Linux: `<<TTY: $(stty -a …>>`); echo-safe version → `<<TTY: icanon isig echo icrnl PG=38800 FG=38800>>` `<<RC=7>>` (sh), same on dash, `<<TTY: icrnl isig icanon echo PG=175 FG=175>>` `<<RC=7>>` (Linux `node:22`, expect 5.45.4-2+b1, procps 4.0.2-3) | `cabd04d` | DD-2 falls back to `\r` plus a separate probe — High — but verified | — |
| P-8 | `stty -a` prints the four flags in different orders on macOS and Linux; `ps -o pgid= -p $$` and `ps -o tpgid= -p $$` work on both | `data-env` | same probe outputs as P-7 | `cabd04d` | flag assertion must not depend on order (it does not) — Low | — |
| P-9 | `node --test --test-reporter=tap` exists on Node 18.20.8 and 22.23.3 and renders a multi-line error message inside the `error: \|-` block | `data-env` | `scratchpad/rep.test.js` → `not ok 1 - x` … `error: \|-` … `line2 SENTINEL` on both | `cabd04d` | FR-4 would parse the spec reporter instead — Low | — |
| P-10 | The suite skips on `win32` before any `expect` lookup, printing the reason; CI Windows legs log `# skipped 7` today | `data-env` | `test/routing-pty.test.js:33–38`; predecessor P-10 (CI run 38983739454) | `cabd04d` | the regression test would need its own guard — it has one anyway — Low | — |
| P-11 | `test/fixtures/**` is byte-exact (`-text`) on every checkout; file **mode** is not covered by that attribute | `data-env` | `.gitattributes` → `test/fixtures/** -text` | `cabd04d` | DD-4 could commit an executable instead — Low | — |
| P-12 | `actions/upload-artifact@v4` with `if: failure()` uploads only when a prior step failed; `inputs.*` is empty on `push`/`pull_request` so `inputs.pty_loops > 1` and `inputs.pty_inject_failure == true` are false there | `data-env` | `UNVERIFIED — confirm at source before relying on it` (GitHub docs are a secondary source) | — | the artifact step misfires on green or the inject step runs on push — Low (one CI run shows it) | T2: one green push run (no artifact) + one `pty_inject_failure=true` dispatch (artifact present) |
