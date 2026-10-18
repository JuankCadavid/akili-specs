# Design: `akili init` — Ctrl-C exits 130, cleanly, on every Node

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `bugfix/init-ctrlc-abort` |
| Depth | **Lite** (Bug Mode) |
| Status | **Approved** — 2026-10-18 (Juan Carlos, Phase 2 gate: Continue) |
| Date | 2026-10-18 |
| Requirements | `requirements.md` (approved 2026-10-18, `0d404a9`) |
| Verified at | `0d404a9` (code identical to `2e6de45`; every `file:line` below) |

## 2. Executive Summary

`makeRoutingIo.ask` already has the close-race + AbortError mapping. Move it into one helper, `questionOrAbort`. Both wizard questions in `runInteractiveInit` then go through that helper, and the tagged abort becomes `process.exitCode = 130`, the same way `runRouting` does it. A new pty test drives `init` through `expect`. Its scratch `HOME` holds a fresh update cache, and a preload records any `https.get`, so the test can prove it stayed offline.

## 3. Architecture Overview

| Unit | Today | After |
|---|---|---|
| `questionOrAbort(rl, prompt, out)` (new, `bin/akili.js`, just above `makeRoutingIo`) | — | Races `rl.question(prompt)` against the interface's `close`. If the interface closes before an answer, or the question rejects with `ABORT_ERR`/`AbortError`, it writes one `\n` to `out` and rejects with the tagged `AKILI_SELECT_ABORT` error. It always removes its own `close` listener and never closes `rl` (the caller owns the interface's lifetime) |
| `makeRoutingIo.ask` (`:2319–2344`) | Inline race + mapping, closes its per-question `rl` in `finally` | Creates its `rl`, calls `questionOrAbort` with today's prompt string (`q [def] ` / `q `), and still closes `rl` in `finally`. Output and errors stay byte-identical |
| `runInteractiveInit` (`:2039`) | Bare `rl.question` at `:2048`, `:2069` | Both questions go through `questionOrAbort(rl, <same prompt>, process.stdout)`. A tagged abort is caught: `rl.close()`, `process.exitCode = 130`, return before any install argument is built |
| `runRouting` catch (`:2384`) | Maps `AKILI_SELECT_ABORT` → 130 | Unchanged |

## 4. Extended Directory Structure

| Path | Change |
|---|---|
| `bin/akili.js` | helper + two call sites (DD-1, DD-2) |
| `test/init-pty.test.js` | **new**: three pty cases (DD-3) |
| `test/fixtures/init/pty-init.exp` | **new**: `expect` driver; mode `q1` \| `q2` \| `answer` |
| `test/fixtures/init/no-network.js` | **new**: `--require` preload that appends a line to a marker file whenever `https.get`/`https.request` is called (DD-4) |
| `docs/cli.md`, `CHANGELOG.md` | one line each (DD-5) |

## 5. Data Model

n/a. Nothing is persisted. The update-cache seed is test fixture data (DD-4).

## 6. API Design

CLI contract change, `akili init` only: Ctrl-C at a question exits **130** (was 1 on Node ≥ 22.23, 0 on ≤ 22.12). End-of-input before an answer also exits **130** (was 0): DD-1's close-race fires on any `close` before an answer, and EOF closes the interface (DD-6, FR-4). Prompts, answers and the exit codes of every other path are unchanged. *Amended 2026-10-18 (Pivot V-1): the sentence claimed every non-Ctrl-C path unchanged, which EOF falsified.*

## 7. Backend Module Design

See §3. The helper is not exported (`bin/akili.js` has no `module.exports`: `grep -n "module.exports" bin/akili.js` → 0 hits).

## 8. Frontend / UX Component Architecture

n/a. Terminal only: the visible change is one newline and the shell prompt, where a trace used to be.

## 9. Shared Contracts or Package Extensions

`AKILI_SELECT_ABORT` stays the single abort tag. It is now produced by three sites (`keySelect` `:2287`, `questionOrAbort` reached via routing, `questionOrAbort` reached via init) and consumed by two (`runRouting` `:2384`, `runInteractiveInit`).

## 10. Design Decisions

| ID | Decision | Why / rejected alternatives | Req |
|---|---|---|---|
| DD-1 | Extract `questionOrAbort` from `makeRoutingIo.ask`, moving the existing logic verbatim (newline included). Interface creation and closing stay with the caller | Fixes both Node branches with code the routing pty suite already proves (P-3). Prevents a second copy drifting. Rejected: `rl.on("SIGINT")` (proposal Option B, a second mechanism whose 22.23 interaction is unverified) and a global `main().catch` (Option C, misses the ≤ 22.12 silent 0; approved as a follow-up) | FR-1, FR-3 |
| DD-2 | `runInteractiveInit` keeps one interface for both questions, catches the tag, closes `rl`, sets `process.exitCode = 130` and returns. No `process.exit()` | Mirrors `runRouting` (`:2384`), lets stdout flush, and keeps the install code unreachable on abort (FR-1 *no install target*). Prompt strings are passed unchanged (FR-2) | FR-1, FR-2 |
| DD-3 | New `test/init-pty.test.js` with its own small `withScratch`/`runExpect` helpers. It copies the harness shape of `test/routing-pty.test.js:46–75` (scratch root, `AKILI_PTY_LOG_DIR` copy before removal, transcript tail in failure messages), the Windows/`expect`-missing skip with a printed reason, and the one-line `RC=` probe sent with `\n` (pty-harness DD-2). Cases: **(a)** `q1`: Ctrl-C at the tool question. **(b)** `q2`: answer `1`, then Ctrl-C at the scope question. **(c)** `answer`: answers `1`/`1`. (a) and (b) assert `RC=130`, zero `^\s+at ` lines, no `AbortError`, and no install target in the scratch `HOME` or cwd. (c) asserts `RC=0`, the seven tool options and two scope options verbatim, and `HOME/.claude/commands` present | Own file per NFR-2 (`routing-pty.test.js` belongs to the open flake spec and has no exports). Rejected: a shared harness module, which would edit the flake spec's file mid-flight. About 30 LOC of duplication is accepted | FR-1, FR-2, NFR-2 |
| DD-4 | **Update cache (decided here, as delegated):** before each case, write `{"checkedAt": <now>, "latest": "<package.json version>"}` to the scratch `HOME/.akili-specs-update.json`. A fresh cache means `getLatestVersion` never fetches (P-6), and `latest == current` means no banner. Every case also runs node with `NODE_OPTIONS=--require <no-network.js>` and `AKILI_NET_MARKER=<scratch>/net.log`. The test asserts the marker file is absent and the cache file is byte-identical after the run | The seed removes the call. The preload *proves* it is gone: the byte check alone cannot see a failed fetch, because a fetch that fails leaves the cache unrewritten, so an offline CI runner would pass the byte check whether or not a fetch happened. Falsifier **executed 2026-10-18** (Node 22.23.3, `expect` + scratch preload): no seed → marker holds `get`; with seed → marker absent and cache `cmp`-identical | NFR-1 |
| DD-5 | `docs/cli.md` *Init*: "Ctrl-C at either question exits with code 130; nothing is installed." `CHANGELOG.md` `Unreleased`: a patch entry naming both old behaviors (Node ≥ 22.23 trace + 1, ≤ 22.12 silent 0) | Downstream consumers (P-5) | FR-1 |
| DD-6 | *(Pivot V-1, 2026-10-18)* Accept end-of-input → exit 130 as a consequence of DD-1. No code change. A non-pty test pins it (status `130`, no trace, nothing installed), and CHANGELOG + `docs/cli.md` state it | Validation probe: `HOME=<scratch> node bin/akili.js init </dev/null` → `rc=0` at `ad7022a`, `rc=130` at `22dc7ed`, on 22.23.3 and 22.12.0; piped `1\n1\n` the same (installed nothing at baseline either). Rejected: a TTY guard to keep EOF at 0, which would leave a misleading success code and add a branch. The usage-error question (exit 2) stays proposal Follow-up 1 | FR-4 |

**Reversion challenge (Step 2.3):** n/a. No DD removes, disables or inverts delivered behavior. DD-1 moves routing's mapping without changing it (FR-3 guards that). The only exit-code change replaces the defect: init's silent 0 on ≤ 22.12 (proposal → Root Cause) was never a specified contract (`docs/cli.md:9–14`, `:77` say nothing about Ctrl-C).

## 11. Premise Ledger

Verified 8 · `UNVERIFIED` 1 (High 0, Low 1).
Blast-radius triggers: `live-path` (the design names a user action: Ctrl-C in `init`), `shared-state` (`makeRoutingIo.ask` logic becomes a shared helper), `consumer` (`init`'s exit code is a CLI contract).

| # | Claim | Class | Citation (as run) | Verified at | If false | Settled by |
|---|---|---|---|---|---|---|
| P-1 | No branch already fixes init's Ctrl-C | `existence` | `git log --all --oneline -G"AbortError\|ABORT_ERR" -- bin/akili.js` → `ae07590` only (routing T5). Per-branch `git show <b>:bin/akili.js` + awk over `runInteractiveInit`, grep `AbortError\|ABORT_ERR\|on("close"\|once("close"` → 0 hits (proposal Blast Radius, 2026-10-18) | `2e6de45` | Spec unnecessary (High) | — |
| P-2 | Ctrl-C in `init` reaches `rl.question` at `:2048`/`:2069` | `live-path` | `main()` `:2392` → `args.command === "init"` `:2412` → `printBanner()` → `runInteractiveInit()` `:2414` → `rl.question` `:2048` (Q1) / `:2069` (Q2). The `expect` repro shows both prompt texts and then the readline-reject trace (proposal Reproduction, 2026-10-18) | `2e6de45` | DD-2 patches the wrong site (High) | — |
| P-3 | Node 22.23.3: Ctrl-C rejects the pending question with `ABORT_ERR` (unhandled → exit 1). Node 22.12.0: the interface closes and the question never settles (exit 0) | `data-env` | `expect` repro on `nvm which 22.23.3` (trace top frame `node:internal/readline/interface:1148`, `code: 'ABORT_ERR'`, `RC=1`) and on `nvm which 22.12.0` (`RC=0`, no output), both questions, 2026-10-18. 22.23.3 is the newest local 22.x (`nvm ls`) | `2e6de45` | DD-1's two-branch mapping is mis-sized (High) | — |
| P-4 | Node 18 behaves like 22.12 (closes without settling) | `data-env` | `UNVERIFIED — confirm at source before relying on it` (only `bin/akili.js:2323–2324`, a comment, says so; secondary) | — | Case (a)/(b) red on the CI Node 18 leg, so DD-1 needs a third branch (Low: the close-race already covers any close-first runtime) | CI `node: [18, 22]` leg (`ci.yml:31`) on the first push after T1. Owner: Juan Carlos (push is his; no push in this worktree) |
| P-5 | Readers of init's exit code / Ctrl-C contract: `docs/cli.md:9–14`, `:77`; `README.md:181`; `bin/akili.js:253` (help text). No test runs `init` | `consumer` | `git grep -n -E "akili(-specs)? init\b\|runInteractiveInit\|\"init\"" -- ':!docs/specs/archive' ':!CHANGELOG.md'` → those hits plus `bin/akili.js:2039`, `:2408`, `:2412`, `:2414`, `bin/routing.js:1002` (comment) and this spec's own files; `codegraph init`/`git init` excluded by pattern. Test-side `grep -n "init" test/*.js` → only `git init` and `initGitRepo` | `0d404a9` | DD-5 misses a doc (Low) | — |
| P-6 | A fresh `$HOME/.akili-specs-update.json` stops the network fetch, and `latest == currentVersion` prints no banner | `data-env` | `readUpdateCache` `:1852–1862` (fresh if `Date.now() - checkedAt < 24h`), `getLatestVersion` `:1910–1915` (returns the cache before `fetchLatestVersion`), `checkForUpdates` `:1926–1929` (`isNewerVersion` false → return). `UPDATE_CACHE_PATH` follows `HOME`: the repro's scratch `HOME` gained `.akili-specs-update.json` (`ls -A`, 2026-10-18). Executed: Ctrl-C at Q1 with a seeded scratch `HOME` + `https` preload → marker absent; without seed → marker `get` (2026-10-18, Node 22.23.3) | `0d404a9` | DD-4's seed is inert; the test goes online (High for NFR-1, caught by the preload marker) | — |
| P-7 | Sharers of the abort mechanism: `makeRoutingIo.ask` (`:2319`, reached from `bin/routing.js:902` `askLine` and `bin/akili.js:2373`), `keySelect` (`:2287`, own raw-mode reject, untouched), `runRouting` catch (`:2384`) | `shared-state` | `grep -n "AKILI_SELECT_ABORT" bin/akili.js bin/routing.js` → `:2287`, `:2328`, `:2384`. `grep -n "makeRoutingIo\|io.ask\|\.ask(" bin/*.js test/*.js` → `:2317`, `:2359`, `:2373`, `routing.js:896/902/1228/1262`, plus `test/routing.test.js:1170/1301` (scripted `io`, never the real `ask`) | `0d404a9` | DD-1 extraction breaks a sharer (High; FR-3 gate) | — |
| P-8 | The real `makeRoutingIo.ask` runs in tests only through the CLI: `test/routing-pty.test.js` cases at `:241`, `:256`, `:271`, `:289`, `:303`, and `test/routing-io.test.js:53` (`spawnSync` without a TTY → `ask` is never called, per `routing.js:1262`) | `consumer` | `grep -n "runExpect(ctx" test/routing-pty.test.js`, `grep -n "spawn" test/routing-io.test.js` | `0d404a9` | FR-3 gate under-covers (Low) | — |
| P-9 | `npm test` (`node --test`, `package.json:38`) picks up a new `test/*.test.js` without config | `other` | `package.json:38`; the existing nine `test/*.test.js` run with no list (`ls test`) | `0d404a9` | The regression test silently never runs (High; T1's Done criteria require seeing it in the TAP output) | — |

## 12. Budget (Step 2.4)

| Expected | Value |
|---|---|
| Tasks | **1** (Bug Mode: test first, red, then fix, green) |
| LOC | ~**180** (`bin/akili.js` ±25; `init-pty.test.js` ~90; `pty-init.exp` ~45; `no-network.js` ~10; docs/changelog ~5) |
| Review rounds | **2** |

This matches Lite. Most of the LOC is the test harness the requirements ask for; the product change is about 25 lines.
