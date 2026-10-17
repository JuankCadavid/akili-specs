# Requirements: pty harness — a red Ctrl-C case carries its own evidence

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `bugfix/pty-harness-ubuntu-flake` |
| Depth | **Lite** (Bug Mode) — test, fixture and CI files only; no product code |
| Type | Bug |
| Approval Mode | `gated` (inherited from `proposal.md`) |
| Status | **Approved** — 2026-10-17 (user, Phase 1 gate: Continue) |
| Date | 2026-10-17 |
| Source | `proposal.md` (approved 2026-10-17, approach A — evidence first). The flake's own root cause stays **open**; this spec fixes the confirmed defect: the harness destroys its evidence on exactly the path that fails |
| Format precedent | `docs/specs/archive/2026-10-16-changes--routing-keyboard-select/requirements.md` — this repo has no `docs/specs/general-setup/` |
| Verified at | `cabd04d` (every `file:line` below) |
| Deviations from proposal | One narrowing: the proposal's "tty probe before `RC=`" becomes **one probe line that also carries `RC`**, terminated with `\n` instead of `\r` (design DD-2) — it records the same fields and removes the one exchange whose failure mode hid everything |

## 2. Executive Summary

When a Ctrl-C pty case fails in CI, the failure message must say what the pty saw: the transcript tail, the `expect` exit, the tty flags and process groups after the shell prompt returned, and the markers the fixture wrote. Today it says `null !== 130` and nothing else, and the transcript is deleted before anyone can read it (`test/routing-pty.test.js:57`). The product's Ctrl-C contract (routing-keyboard-select FR-5) is unchanged; the suite's six cases keep their verdicts on a healthy pty.

## 3. Glossary

| Term | Meaning |
|---|---|
| Transcript | The `expect` session log written by `log_file` (`pty-*.exp:11`) to `<scratch>/<fixture>.log` — raw pty bytes plus the `<<…>>` markers |
| Marker | A `<<NAME …>>` line the fixture or the probe writes into the transcript: `<<BACK-IN n ms>>`, `<<NO-PROMPT-AFTER-CTRL-C>>`, `<<HUNG>>`, `<<TIMEOUT: …>>`, and the new `<<TTY: …>>` |
| Probe line | The single shell line sent after the prompt returns that prints the tty flags, process groups and `RC` (design §5) |
| Fake `expect` | A PATH shim that stands in for `expect`, writes a canned transcript and exits 2 — the regression fixture |

## 4. System Context & Scope

- `test/routing-pty.test.js` runs six cases; the three Ctrl-C cases assert `shellRc(log)` at `:188`, `:201`, `:219` **before** `assertFinished(run)` at `:190`, `:205`, `:223`; `assertFinished` (`:77–79`) is the only assertion whose message quotes the transcript, and `assertNotHung`/`assertCtrlCReturned` (`:88–106`) print a tail only on `<<HUNG>>`/`<<NO-PROMPT-AFTER-CTRL-C>>` — `grep -n "shellRc(log)\|assertFinished(run)\|logTail" test/routing-pty.test.js`, as run 2026-10-17.
- `withProject` deletes the scratch root — transcript included — in `finally` (`:49–59`, `fs.rmSync` at `:57`), on pass and on fail alike.
- `.github/workflows/ci.yml` has no artifact upload and no `workflow_dispatch` (`grep -n "upload-artifact\|workflow_dispatch" .github/workflows/ci.yml` → 0 hits; `release-notify.yml:9` and `release-status.yml:8` do have `workflow_dispatch`).
- The three Ctrl-C fixtures share the `ctrl_c_to_shell` proc and end with the same three exchanges: `echo RC=$?\r` → `RC=\d+`; `stty -a | … echo`; `exit\r` (`pty-ctrl-c.exp:54–61`, same shape in `pty-empty-confirm.exp`, `pty-fallback.exp`). All three reds observed so far died at the first of those exchanges (proposal §Bug Diagnosis).
- `test/` is not in the package (`package.json:16–24` `files` list names `bin`, `docs`, `.claude/*`, no `test`) — nothing here changes what `npm publish` ships.
- The Windows CI legs skip the suite with a printed reason (`:33–38` `skipReason`); the regression test must skip there too.
- Out of scope: any edit under `bin/`; the flake's fix; the wait budgets T6 set (25 s + 10 s, `spawnSync` 60 s).

## 5. Stakeholders / Personas

| Who | Needs |
|---|---|
| Maintainer reading a red `master` check | Enough in the Actions log to tell a raw-mode leak from a stopped shell from a swallowed Ctrl-C, without a rerun |
| `/akili-execute` Implementer/Reviewer of the follow-up fix | A transcript artifact per red, and a dispatchable loop to gather more |

## 6. Functional Requirements

### FR-1: A red Ctrl-C case prints its evidence

The pty suite SHALL fail a Ctrl-C case whose transcript has no `RC=` line with a message that contains, in this order: the case's own reason, the `expect` exit status and signal, every marker the transcript holds, and the transcript's last 30 lines (ANSI-stripped, CR-free).

#### Scenario: `RC=` missing, prompt returned (the observed CI shape)

- GIVEN a transcript that contains `<<BACK-IN 9 ms>>` and `<<TIMEOUT: unmatched wait>>` and no `RC=` line, and `expect` exited 2
- WHEN the case asserts the shell's exit code
- THEN the assertion fails with a message containing `status 2`, `<<BACK-IN 9 ms>>`, `<<TIMEOUT: unmatched wait>>` and the transcript tail
- AND the same tail is emitted through `t.diagnostic` so it reaches the TAP stream even when the reporter truncates the error
- BUT it must NOT change the verdict of a transcript that has `RC=130` (the healthy run stays green with no new output beyond the existing `<<BACK-IN>>` diagnostic)
- AND IT MUST apply to every `shellRc` and tty-flag assertion in the file — the one at `:153` (expects 0) included — not only to the three Ctrl-C cases

### FR-2: The transcript survives a failed run

The suite SHALL copy every transcript of a run into the directory named by `AKILI_PTY_LOG_DIR` when that variable is set, before the scratch root is removed; and the Linux CI job SHALL attach that directory as a run artifact when the job fails.

#### Scenario: CI red on Ubuntu

- GIVEN the Unit tests step runs with `AKILI_PTY_LOG_DIR` set to a runner-temp path
- WHEN any step of the job fails
- THEN an artifact named `pty-transcripts-<os>-node<version>` holding the `.log` files is attached to the run
- BUT it must NOT upload on a green job, and must NOT run on Windows (no transcripts exist there)
- AND IT MUST leave local runs unchanged when the variable is unset (no copy, scratch removed as today)

### FR-3: The tty state after the prompt returns is recorded before `RC`

All four fixtures SHALL replace their `echo RC=$?` and `stty -a` exchanges with one probe line, terminated with `\n`, that prints the pty's `icrnl`, `icanon`, `isig`, `echo` flags, the shell's process group, the terminal's foreground process group, and the saved `$?` — and SHALL log them as a `<<TTY: …>>` marker followed by the existing `RC=<n>` line.

#### Scenario: healthy pty

- GIVEN Ctrl-C returned the shell prompt
- WHEN the probe line is sent
- THEN the transcript gains `<<TTY: icrnl icanon isig echo PG=<n> FG=<n>>>` and `RC=130` (or `RC=0` for the happy path)
- AND the marker text the shell prints is not a substring of the typed line, so the echo of the probe can never satisfy the wait (dash echoes typed input; design DD-2)
- AND the test asserts all four flags are positive and `PG` equals `FG`
- BUT it must NOT clobber `$?` — the probe captures it into a shell variable before running `stty`/`ps`
- AND IT MUST keep the `<<BACK-IN n ms>>` measurement unchanged (the probe is sent after the prompt wait, not inside it)

#### Scenario: raw-mode leak (hypothesis H1 of the proposal)

- GIVEN a pty where `icrnl` is off when the prompt returns
- WHEN the probe line is sent
- THEN because it ends with `\n` the shell still executes it, and the test fails on the flag assertion with `<<TTY: -icrnl …>>` in the message — evidence, not a 20 s timeout

### FR-4: Regression test — the evidence path is proven against the real suite

A test SHALL run the real `test/routing-pty.test.js` under `node --test` with a fake `expect` on `PATH` that writes a canned transcript (list rendered, `<<BACK-IN 5 ms>>`, `<<TIMEOUT: unmatched wait>>`, a unique sentinel line, no `RC=`) and exits 2, and SHALL assert that the Ctrl-C case's `not ok` block contains the sentinel, `status 2` and `<<TIMEOUT: unmatched wait>>`.

#### Scenario: red before, green after (Bug Mode)

- GIVEN the baseline at `cabd04d`
- WHEN the regression test runs
- THEN it fails on its own assertion — the block reads `null !== 130` and holds no sentinel (red observed and quoted in `tasks.md`, not predicted)
- AND after FR-1 it passes
- BUT it must NOT need a real pty: it runs on every Linux/macOS leg, and skips with a printed reason on `win32` exactly like the suite it drives
- AND IT MUST use the shim only through `PATH` for the child process — `which expect` and `spawnSync("expect")` in the suite are untouched

### FR-5: CI can loop the suite on demand and inject a failure

`ci.yml` SHALL accept `workflow_dispatch` inputs `pty_loops` (integer, default `1`) and `pty_inject_failure` (boolean, default `false`): the Linux job runs the pty suite `pty_loops` times with transcripts kept, and with `pty_inject_failure` it prepends the fake-`expect` shim to `PATH` so the suite goes red and the artifact path is exercised. The Unit tests step SHALL print `node -v` and `expect -v` on Linux first.

#### Scenario: artifact path proven

- GIVEN a dispatch with `pty_inject_failure=true`
- WHEN the job runs
- THEN the Unit tests step is red, the artifact is attached, and its transcripts contain the sentinel
- BUT it must NOT alter `push`/`pull_request` runs (inputs absent → one run, no shim)

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | No product file changes: `git diff --stat cabd04d..HEAD -- bin/ .claude/` is empty at closure |
| NFR-2 | The six pty cases keep their verdicts on macOS and in the Linux Docker loop (6/6 both), and the Windows legs still print the skip reason |
| NFR-3 | `npm test` adds exactly one test file and stays under 2 min locally; the fake `expect` adds no dependency (a POSIX `sh` script under `test/fixtures/routing/`) |
| NFR-4 | `AGENTS.md:13` gains one clause naming `AKILI_PTY_LOG_DIR` and the artifact — quote-checked at HEAD (KZ-002) |

## 8. Defect Classes and Their Gates

| Defect class this spec can produce | Gate |
|---|---|
| Evidence helper prints nothing / prints the wrong run's tail | FR-4 regression test (real suite + fake `expect`); falsifier: remove the tail from the message → sentinel assertion red |
| Probe line breaks a healthy session (quoting, `$?` clobbered, `\n` not accepted) | The six real pty cases on macOS **and** in the Linux `node:22` Docker loop (sh = dash); falsifier: swap `__rc=$?` to after `stty` → `RC=0` where 130 expected |
| Transcript copy misses files or runs when unset | Unit assertion on `withProject` with and without `AKILI_PTY_LOG_DIR` (FR-2 `AND IT MUST`) |
| Artifact step never fires / fires on green | FR-5 dispatch with `pty_inject_failure=true` (executed once, run id recorded) and one green push run (no artifact) |
| Windows leg breaks (no `sh` shim, no pty) | Windows CI jobs: the regression test's skip line printed |
| Docs claim drift (`AGENTS.md` clause) | Reviewer quote-check at HEAD |
| The flake itself | **Accepted gap** — not fixed here; the next red carries the fields that separate H1/H2/H3 |

## 9. Requirement ID Index

| ID | Name | Owner task |
|---|---|---|
| FR-1 | Red Ctrl-C case prints its evidence | T1 |
| FR-2 | Transcript survives a failed run | T1 (copy) · T2 (artifact) |
| FR-3 | tty state recorded before `RC` | T1 |
| FR-4 | Regression test against the real suite | T1 |
| FR-5 | Dispatch loop + failure injection | T2 |
| NFR-1…4 | No product change · verdicts kept · one test file, no dependency · `AGENTS.md` clause | T1 · T2 |
