# Proposal — pty harness: Ubuntu-only CI red leaves no evidence

## Document Control

| Field | Value |
|---|---|
| Spec Path | `bugfix/pty-harness-ubuntu-flake` |
| Slug | `pty-harness-ubuntu-flake` — derived from free-text argument (Bug report pasted into `/akili-propose`) |
| Type | **Bug** |
| Approval Mode | gated |
| Date | 2026-10-17 |
| Author | AKILI session (proposer) |
| Status | Draft — awaiting approval |
| Related | `docs/specs/archive/2026-10-16-changes--routing-keyboard-select/` (T3 pty suite, T6 diagnostics); CI runs 38987507717, 38991178162 (attempts 1–3) |
| Depends on | none |
| Parallel-safe | yes (test/CI files only; no shared module with any active spec) |

## Intent

Make the next Ubuntu-only pty failure **carry its own evidence** (the `expect` transcript, the shell's exit, the tty state), so the underlying flake can be root-caused from CI instead of guessed — and stop a red check from costing a release three CI attempts.

## Problem / Current Behavior

- `test/routing-pty.test.js` fails only on GitHub `ubuntu-latest` runners: 3 red Ubuntu job executions out of 12 since T6 landed (run 38987507717 Node 18 → case 3 `pty-ctrl-c.exp`; run 38991178162 attempt 1 Node 22 → case 4 `pty-fallback.exp dumb`; attempt 2 Node 22 → case 2 `pty-empty-confirm.exp`; attempt 3 green) — `gh run view <id> --log-failed`, as run 2026-10-17.
- Every red has the same shape: `<<BACK-IN n ms>>` is logged with n ≤ 10 (the shell prompt returned right after Ctrl-C), then the fixture's `send "echo RC=\$?\r"` / `expect -re {RC=\d+}` never matches, `expect` hits its global 20 s timeout (`set timeout 20`, `pty-*.exp:5`), and the test fails on `assert.equal(shellRc(log), 130)` with `null !== 130` and `duration_ms ≈ 20300` — attempt-2 job log 117423310663 lines 910–936, as read 2026-10-17.
- **The transcript is lost on exactly this path.** The three Ctrl-C cases assert `shellRc(log)` at `test/routing-pty.test.js:188`, `:201`, `:219` **before** `assertFinished(run)` at `:190`, `:205`, `:223` — and only `assertFinished` (`:77`) and the T6 helpers `assertNotHung`/`assertCtrlCReturned` (`:88–106`) print the transcript tail, the latter two only on `<<HUNG>>` / `<<NO-PROMPT-AFTER-CTRL-C>>`. `withProject` removes the scratch root, transcript included, in its `finally` (`:57`). Nothing in `.github/workflows/ci.yml` uploads artifacts (grep `upload-artifact` → 0 hits). So the red check says `null !== 130` and nothing else.
- The failure does **not** reproduce anywhere I can observe it: macOS `/bin/sh` (bash 3.2) — the suite is green on every local run; macOS `/bin/dash` driving the same fixture — 8/8 green on Node 22.23.3; a Linux `node:22` Docker container (Debian, `/bin/sh` → dash, Node 22.23.3) — 6/6 per fixture for the three failing fixtures, and the full `npm test` ×4 at `--cpus=2` with the pty suite green each time (session scratch loops `scratchpad/dash/loop.sh`, `scratchpad/dash/linux-loop.sh`, as run 2026-10-17).
- The archived tally in `docs/specs/archive/2026-10-16-changes--routing-keyboard-select/execution.md` ("10 executions, 2 pre-T6 flakes, 0 since diagnostics live") is now stale: 3 reds since. It is history and stays as written; this proposal is the live record.
- Node version on the `ubuntu-latest / Node 22` runner: `UNVERIFIED — confirm at source before relying on it` (setup-node `22` resolves to the latest 22.x; the job log read here did not print it).

## Proposed Outcome

1. A red pty case in CI prints, in the test failure message itself: the transcript tail (last 30 lines, ANSI-stripped), the `expect` exit status/signal, and whichever markers the fixture wrote (`<<TIMEOUT: …>>`, `<<STTY: …>>`, `<<BACK-IN …>>`).
2. The raw `.exp` transcripts of a failed run survive as a CI artifact (`pty-transcripts-<os>-<node>`), uploaded only on failure.
3. The fixture records, right after the prompt returns, the shell's view of the pty (`stty -a` sanitized to the few flags that matter: `icrnl`, `icanon`, `isig`, `echo`) and the foreground process group, **before** asking for `RC=` — so a raw-mode or job-control cause is visible in the transcript even when `echo RC=$?` never answers.
4. A regression test proves (1): a synthetic run with no `RC=` line fails with a message that contains the tail and the status — red at baseline, green after.

The flake itself stays **open** (see Bug Diagnosis); its fix is a follow-up proposal fed by the evidence this one captures.

## Scope

| In | Out |
|---|---|
| `test/routing-pty.test.js`: one `assertShellRc(t, run, expected, why)` helper replacing the three bare `shellRc` asserts (`:188`, `:201`, `:219`), message = why + status + tail; a pure `rcFailureMessage(run)` the regression test can exercise without a pty | Any change to `bin/akili.js` or `bin/routing.js` — the product is not implicated (`test/` is not shipped; macOS and Windows legs green; package already published as 2.32.1) |
| `withProject`: keep the scratch root when `AKILI_PTY_KEEP=1` (or copy failed transcripts to `process.env.AKILI_PTY_LOG_DIR`), so CI can collect them | Removing the Ubuntu leg, retrying the test, or widening the 20 s wait to mask the symptom |
| `test/fixtures/routing/pty-*.exp` (the four): after `ctrl_c_to_shell`, `send "stty -a\r"` + pgrp probe logged as `<<TTY: …>>` before the `RC=` exchange; keep the existing `<<STTY: (-?echo)>>` contract that `sttyEcho` reads | Rewriting the fixtures' flow or the T6 two-stage Ctrl-C wait |
| `.github/workflows/ci.yml`: `actions/upload-artifact@v4` step, `if: failure() && runner.os == 'Linux'`, path = the transcript dir; optional `workflow_dispatch` input `pty_loops` that runs the pty suite N times on Ubuntu for data gathering | A new workflow file; changes to the Release Status workflow |
| `AGENTS.md:13` clause: one sentence naming the artifact (factual sweep at archive) | Any docs/cli.md change (user-facing behavior unchanged) |

## Non-Goals

- Fixing the flake. Its root cause is not confirmed (below); a fix built on a guess is the top source of non-fixes.
- Changing the product's Ctrl-C handling (FR-5 of routing-keyboard-select, Pivot B) — it is verified on Node 18/22.12/22.23 and the pty cases pass on every reproduction attempt.
- Making the suite quieter (skip on Linux, `retry`): that hides the signal the archive accepted as WARN V-2 on the promise that it would be instrumented.

## Affected Users, Systems, And Specs

- Maintainers reading a red CI check on `master` (today: no evidence; three reruns to go green on the v2.32.1 release commit).
- `.github/workflows/ci.yml` (Unit tests step), `test/routing-pty.test.js`, `test/fixtures/routing/pty-*.exp`, `AGENTS.md:13`.
- Archived spec `changes/routing-keyboard-select` (V-2 accepted WARN; T6 diagnostics) — superseded in part by this bug's evidence capture; not reopened.

## Visual Reference

- Source: None
- Location: n/a
- Notes: test harness and CI change; no UI surface.

## Bug Diagnosis

### Observed Symptom

- A CI job `CLI on ubuntu-latest / Node 18|22` goes red on one of the three Ctrl-C pty cases (which one varies), with `null !== 130` and nothing else; macOS and Windows legs are green; a rerun may or may not go green (release commit `b78e10a`: red, red, green).

### Reproduction Steps

- Deterministic reproduction: **none found.** Executed attempts, all green: local macOS (`npm test`, many runs across the spec); `/bin/dash` on macOS driving `pty-fallback.exp dumb` ×8 under Node 22.23.3; Docker `node:22` (Linux 6.x kernel, Debian dash, Node 22.23.3): `pty-fallback.exp dumb` ×6, `pty-ctrl-c.exp` ×6, `pty-empty-confirm.exp` ×6, and `npm test` ×4 at `--cpus=2`.
- Observed only on GitHub-hosted `ubuntu-latest` (image `ubuntu-24.04`, job logs 117423310663 and 117261721475 line 17): 3 reds / 12 Ubuntu job executions since T6 (runs 38987129273 ×3 attempts = 6 green; 38987507717 = 1 red + 1 green; 38991178162 = 2 red + 2 green across attempts 1–3, Node 18 green each time).
- Re-run to gather data (after this spec ships): `gh workflow run ci.yml -f pty_loops=20` and read the uploaded `pty-transcripts-*` artifact.

### Root Cause (confirmed) — of the evidence loss

- **Confirmed:** the assertion order at `test/routing-pty.test.js:188/:201/:219` fails on `shellRc` before `assertFinished` (`:190/:205/:223`), and `shellRc`'s message carries no transcript; `withProject` (`:49–59`) deletes the transcript in `finally` (`:57`); `ci.yml` has no artifact step. Walked at HEAD `b78e10a` on 2026-10-17; the attempt-2 failure block (job 117423310663 lines 910–936) shows exactly that message and nothing more.

### Root Cause — of the flake itself: **not confirmed**

- What the markers prove: the shell prompt came back within 10 ms of Ctrl-C on every red (`<<BACK-IN 9|10|9 ms>>`), so Node exited; the next exchange (`echo RC=$?` → `RC=\d+`) produced no match for 20 s; the fixture then exited 2 (`<<TIMEOUT: unmatched wait>>` via `expect_after`, inferred from `duration_ms ≈ 20300`; the transcript was not available to quote).
- Hypotheses still open, each one ruled neither in nor out: (H1) the pty is left without `icrnl`/`icanon` when dash prompts (dash does no line editing, so a `\r` with `icrnl` off never ends the line; bash on macOS would mask it) — contradicted by the Docker dash runs being green, but not excluded on the runner; (H2) dash job-control ordering (`tcsetpgrp` after the child's death) leaving the shell stopped on `SIGTTIN` when `expect` types immediately after the prompt; (H3) a runner-specific `expect`/kernel difference (ubuntu-24.04 `expect` version `UNVERIFIED`). Outcome 3 of this proposal records exactly the fields that separate H1 from H2 (`stty -a` flags and foreground pgrp after the prompt).

### Blast Radius

| Check | Recorded as | Result |
|---|---|---|
| **Already fixed?** | `git log --all --oneline -- test/routing-pty.test.js test/fixtures/routing/ .github/workflows/ci.yml` on 2026-10-17: newest hit `8e246b5` (T6 diagnostics, 2026-10-17); no later commit on any local or remote branch touches these files; no ticket ID exists | **No** — nothing fixes or instruments this path beyond T6 |
| **Live path?** | `node --test` → `test/routing-pty.test.js` case → `runExpect` (`:62–73`, `spawnSync expect`, transcript at `<root>/<fixture>.log`) → `assertCtrlCReturned` (`:99–106`, prints `<<BACK-IN>>` only) → `assert.equal(shellRc(log), 130)` (`:188/:201/:219`) → throws → `withProject` `finally` `fs.rmSync(root)` (`:57`) | **On the path** — the red block in job 117423310663 is this exact message; the code to patch is the one the reproduction reaches |
| **Siblings on the same state** | `shellRc` sites: `:153` (expects 0, happy path), `:188`, `:201`, `:219`; `sttyEcho` sites: `:154`, `:189`, `:202`, `:220`, `:236`, `:249` — all read the same transcript and all would fail blind the same way; the four fixtures share `log_file -a -noappend` (`pty-*.exp:11`) and the three Ctrl-C ones share the `ctrl_c_to_shell` proc | Feeds scope: one helper for all `shellRc`/`sttyEcho` asserts; fixture change in the shared proc's callers |
| **Downstream consumers** | `.github/workflows/ci.yml` "Unit tests (node:test)" step (only consumer of the suite in CI); `AGENTS.md:13` (names the suite and the `expect` dependency); `docs/specs/archive/2026-10-16-changes--routing-keyboard-select/execution.md` tally (history, not updated); no package consumer (`npm pack` excludes `test/`) | Feeds scope: CI artifact step + one AGENTS.md sentence; archive untouched |

- Data integrity / security: none — test and CI configuration only; artifacts contain scratch-project transcripts with no secrets (the scratch `HOME` is empty).

### Fix Strategy

- Route: **`/akili-specify bugfix/pty-harness-ubuntu-flake` (Lite) in Bug Mode** — logic in a shared assertion helper and a fixture probe, so not `/akili-quick`.
- Regression test (mandatory): a unit test over `rcFailureMessage({ status: 2, signal: null, log: "<transcript without RC=>" })` asserting the message contains the last transcript lines and `status 2` — red at `b78e10a` (no such helper; today's message is `null !== 130`), green after.
- Executed-not-predicted falsifiers (KZ-changes--leader-brief-contract-2): the Implementer runs the pty suite once with a deliberately broken fixture (`send "echo RC=\$?\r"` → `send "echo XX=\$?\r"`) and quotes the new failure message; and runs `gh workflow run` with `pty_loops` once to prove the artifact uploads on failure (or documents that the loop stayed green and the `if: failure()` path was exercised by the broken-fixture run on a branch).

## Approach Options

| Option | What | Trade-off |
|---|---|---|
| **A — Evidence first (recommended)** | Helper + fixture tty probe + CI artifact + `pty_loops` dispatch; flake fix deferred to a follow-up bug | Smallest safe change; the next red is actionable; does not promise a fix it cannot prove |
| B — Guess-fix H1 now | Add `stty sane` after `ctrl_c_to_shell` (or before `echo RC=`) in the fixtures | Would hide H1 if true and H2 if false; proves nothing; the archive's WARN V-2 was accepted on the promise of instrumentation, not masking |
| C — Drop the Ubuntu pty leg | `if: runner.os == 'macOS'` for the suite | Removes the only Linux evidence for FR-4/FR-5; the user's real target (Ubuntu dev boxes) loses its gate |

## Recommended Approach

**A.** Three small edits on the failure path the reproduction actually travels, one regression test, one CI step, and a dispatch input that turns the runner into a data source. Node and the product stay untouched.

## Risks, Dependencies, And Open Questions

- Risk: the probe after the prompt (`stty -a`, pgrp) is itself an input exchange — if the shell is stopped (H2) it will also time out; mitigated by sending it *before* `RC=` and keeping the `RC=` wait, so the transcript shows which exchange died first.
- Risk: `upload-artifact` adds a dependency to CI; pinned to `@v4`, Linux-only, failure-only.
- Open: the exact Node 22.x and `expect` versions on `ubuntu-24.04` (two `UNVERIFIED` markers above) — the Implementer prints both in the CI step so the next red records them.
- Open: whether `pty_loops` should also run the Docker-equivalent locally (`scripts/ci/pty-loop.sh`) — deferred unless the Leader finds it free.
- Depends on: none. Parallel-safe with `changes/review-intensity-trial-terms`.

## Success Criteria

- The next Ubuntu red on a pty case shows, in the Actions log, the transcript tail, `expect` status, `<<TTY: …>>` flags/pgrp and `<<BACK-IN>>`, and an artifact `pty-transcripts-ubuntu-latest-<node>` is attached to the run.
- `npm test` stays 258 → 259 passing (one regression test added), green on macOS/Windows as before.
- `AGENTS.md:13` names the artifact in one sentence; no product file changes (`git diff --stat b78e10a..HEAD -- bin/` empty).

## Next Step

```text
/akili-specify bugfix/pty-harness-ubuntu-flake
```

(Bug Mode, Lite depth — regression test required.)
