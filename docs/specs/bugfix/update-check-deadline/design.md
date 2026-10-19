# Design: update check — an overall deadline, so a slow registry cannot hang the CLI

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `bugfix/update-check-deadline` |
| Depth | **Lite** (Bug Mode) |
| Status | **Approved** — Phase 2 gate: `auto-approved (pre-approved mode)`, 2026-10-19, recorded after `judgment-day` closed (§13, `judgment.md`) |
| Date | 2026-10-19 |
| Requirements | `requirements.md` (`58675ea`) |
| Verified at | `58675ea` (code identical to `1e2b44c`; every `file:line` below). Amended at `31a4e04` by judgment-day round 1 (§13) |
| Prototype | session scratchpad `proto/` — `fixtures/registry-redirect.js`, `update-check.test.js`, `fix.py`. Run at baseline and with the fix applied on Node 18.20.8 / 22.12.0 / 22.23.3, falsifiers F1/F2 executed, then the tree was reverted (`git checkout bin/akili.js`, `git status` clean). **Not durable in the repo** (judgment J3/F3): the runs are quoted in `tasks.md` T1, and they become re-runnable from the repo once T1 commits the test |

## 2. Executive Summary

Inside `fetchLatestVersion`: arm a 3000 ms deadline as soon as the request is created. When it fires it destroys the request and settles `null`. Every exit path goes through one `settle` helper that clears the timer, so a fast check never holds the process for 3 s. `res.on("error")` moves to the first line of the response callback. A new `node:test` file spawns `akili check-update` against a local HTTP server; a `--require` preload sends `https.get` there instead.

## 3. Architecture Overview

| Unit | Today | After |
|---|---|---|
| `UPDATE_CHECK_DEADLINE_MS` (new constant beside `UPDATE_CACHE_TTL_MS`, `bin/akili.js:1850`) | — | `3000` |
| `fetchLatestVersion` (`:1872–1906`) | idle `timeout: 1500`, 50,000-byte cap, `res.on("error")` after the non-200 return | Same, plus: `settle(value)` = clear deadline + `resolve`; deadline timer → `req.destroy()` + `settle(null)`; `res.on("error")` first; every `resolve(...)` becomes `settle(...)` |
| `getLatestVersion`, `checkForUpdates`, `runCheckUpdate` | — | unchanged (return contract `string \| null` unchanged) |

## 4. Extended Directory Structure

| Path | Change |
|---|---|
| `bin/akili.js` | constant + `fetchLatestVersion` (DD-1, DD-2) |
| `test/update-check.test.js` | **new** — four cases (DD-4) |
| `test/fixtures/update-check/registry-redirect.js` | **new** — `--require` preload (DD-4) |
| `CHANGELOG.md`, `.jules/sentinel.md` | notes (DD-5) |

## 5–9. Data Model · API · Backend · Frontend · Shared Contracts

- Data: n/a. The update cache format is unchanged; a failed check still writes nothing.
- API / CLI contract: no flag, output or exit-code change. The only observable change is that a stuck check ends after ~3 s.
- Frontend: n/a (terminal only).
- Shared contracts: n/a. `fetchLatestVersion` is module-private (`bin/akili.js` has no `module.exports`).

## 10. Design Decisions

| ID | Decision | Why / rejected alternatives | Req |
|---|---|---|---|
| DD-1 | Deadline timer armed right after `https.get` returns, **not** `unref`'d, cleared by `settle` on every exit (end, non-200, data cap, `res` error, `req` error, idle timeout, deadline). The deadline handler destroys the request before settling | One timer covers every slow shape. Clearing it, rather than `unref`, keeps the falsifier visible: a missed clear shows as a ~3 s exit (F1). Without `req.destroy()` the open socket keeps the process alive past the cap (F3). Both executed, see `tasks.md`. Rejected: `AbortSignal.timeout` (abort surfaces as an `error` that must be re-mapped, a different idiom from the rest of the function), and `Promise.race` in `getLatestVersion` (leaves the socket open, so the process cannot exit) — proposal Options B/C | FR-1, FR-3 |
| DD-2 | `res.on("error", …)` becomes the first statement of the response callback; its body is unchanged (`req.destroy()`, settle `null`) | Closes the Sentinel #43–#55 shape at the source, although no run can make the *ordering* fail (requirements → accepted gap). The 200-cut bound guards that the handler **exists** (F2), not that it is first. Keeps the existing comment line | FR-2 |
| DD-3 | **No adjustable deadline.** The constant is fixed at 3000 ms | The user allowed a test knob, but it is not needed: the drip case costs ~3 s of suite time, and a knob means an env-reading branch in shipped code (NFR-2). The [2500, 5000) bound on the drip case rejects a deadline outside 2.5–5 s (judgment J4: it does not pin exactly 3000); a knob set by the test could not do even that | FR-1, NFR-2, NFR-3 |
| DD-4 | Test seam. `registry-redirect.js` replaces `https.get` with a function that calls `http.get($AKILI_TEST_REGISTRY, options, callback)`. Options and callback pass through, so `timeout: 1500` still applies. The test starts one local server per case (with a hit counter) and **asynchronously** spawns `process.execPath --require <preload> bin/akili.js check-update`. `spawnSync` would block the parent's event loop, and the server lives there. `HOME` and `USERPROFILE` point to a fresh temp dir (no cache), and the child is `SIGKILL`ed at a 6000 ms cap measured from spawn. **Elapsed time is measured from the server's first request to the child's exit**, so Node cold start (slow on Windows runners) is outside every bound (judgment F5; the deadline starts within the same tick as the request). Cases: drip (FR-1), 404 cut, 200 cut (FR-2), healthy control (FR-3). The 404 case is a guard only: its path returns before any handler matters (judgment F10). `node --test` also loads the preload as a test file and reports it as a passing entry, so the TAP shows **5** entries for this feature, as `test/fixtures/init/no-network.js` already does (judgment J7/F6) | `check-update` has no TTY gate and no banner (P-2), so a pipe-spawned child reaches the fetch. The control proves the preload is live (NFR-1). Rejected: exporting `fetchLatestVersion` (the user chose no export) and extracting the source text (fragile) | FR-1–3, NFR-1, NFR-2 |
| DD-5 | `CHANGELOG.md` `[Unreleased]` → a `### Fixed` entry that replaces the `### Notes` heading **and** its `- No unreleased changes yet.` bullet (judgment J10/F8) `.jules/sentinel.md` → a new `## 2026-10-19` entry: fourth batch #43–#55, mechanism measured non-reproducible on Node 18.20.8 / 22.12.0 / 22.23.3, real defect (idle timer ≠ deadline, `check-update` reaches it without a TTY), fix and test named. The observation: #52 and #55 were open when the proposal was written; all thirteen were then closed unmerged on 2026-10-19 at 16:24–16:25Z (P-9; re-run `gh pr view` right before writing). No hook-timeout value is stated | FR-4; claims only what the runs here measured (KZ-002) | FR-4 |

**Reversion challenge (Step 2.3):** n/a. No DD removes, disables or inverts delivered behavior. DD-2 moves a handler without changing its body. The 1500 ms idle timeout and the 50,000-byte cap stay.

## 11. Premise Ledger

Verified 9 · `UNVERIFIED` 1 (High 0, Low 1). *Amended by judgment-day round 1: P-9, P-10 added; P-3 annotated.*
Blast-radius triggers: `live-path` (the design names a user action: running a command / the SessionStart hook), `consumer` (`fetchLatestVersion`'s settle timing reaches two callers). `shared-state`: not triggered — the change adds a timer local to one call and touches no state another component reads.

| # | Claim | Class | Citation (as run) | Verified at | If false | Settled by |
|---|---|---|---|---|---|---|
| P-1 | No branch or PR already adds an overall deadline | `existence` | proposal Blast Radius: `git log --all --oneline -S"setTimeout" -- bin/akili.js` → 0; per-ref awk of `fetchLatestVersion` + grep `setTimeout\|deadline` over `refs/heads refs/remotes` → 0; `gh pr diff 48/52/55` → handler move only | `1e2b44c` | Spec unnecessary (High) | — |
| P-2 | `check-update` reaches `fetchLatestVersion` with stdout piped (no TTY gate, no banner) | `live-path` | `main()` `:2426` `args.command === "check-update"` → `runCheckUpdate()` `:1952` → `getLatestVersion()` `:1953` → `readUpdateCache` (empty `HOME`) → `fetchLatestVersion()` `:1913`. Executed: prototype control, piped spawn, local server `hits === 1` and stdout names `999.0.0` (Node 18.20.8 / 22.12.0 / 22.23.3) | `58675ea` | DD-4's seam never reaches the code (High) | — |
| P-3 | `timeout: 1500` is an idle timer re-armed by each byte; a 1000 ms drip never settles | `data-env` | proposal repro (22.12.0 only, not re-run here: 1000 ms drip pending at 8 s, 2000 ms drip `null` at 1504 ms); prototype drip case red at the 6000 ms cap on **18.20.8, 22.12.0, 22.23.3** (newest local 22.x; CI `[18, 22]`) | `58675ea` | Root cause wrong (High) | — |
| P-4 | 404 and 200 cut mid-body settle exit 0, empty stderr, < 2500 ms, at baseline | `data-env` | prototype cases 2–3 `ok` on 18.20.8, 22.12.0, 22.23.3 | `58675ea` | FR-2 is a red, not a guard; scope changes (Low) | — |
| P-5 | The preload's `https.get` replacement is the one `bin/akili.js` calls | `other` | `const https = require("https")` `:1842`; call is a property lookup at call time, `https.get(...)` `:1874`; P-2's control proves it | `58675ea` | Seam inert (High, caught by the control) | — |
| P-6 | The cache path follows the child's `HOME` | `data-env` | `UPDATE_CACHE_PATH = path.join(os.homedir(), …)` `:1849`; prototype control found `"latest":"999.0.0"` in the temp `HOME` | `58675ea` | Tests read/write the real `~/.akili-specs-update.json` (High) | — |
| P-7 | Readers of `fetchLatestVersion`'s result: `getLatestVersion` `:1913`, then `checkForUpdates` `:1929` and `runCheckUpdate` `:1953` (SessionStart hook `NOTIFY_HOOK_COMMAND` `:1976`). No test pins it | `consumer` | `grep -n "fetchLatestVersion\|getLatestVersion" bin/*.js` → `:1872`, `:1910`, `:1913`, `:1929`, `:1953`; `grep -rn "fetchLatestVersion\|getLatestVersion\|check-update" test/` → 0 hits | `58675ea` | A caller relies on the old timing (Low) | — |
| P-8 | `npm test` (`node --test`, `package.json:38`) runs a new `test/*.test.js` with no config | `other` | `package.json:38`; existing `test/*.test.js` run with no list | `58675ea` | The regression never runs in CI (High; T1 Done requires it in the TAP) | — |
| P-9 | PRs #43–#55 are all closed, unmerged; #52 and #55 were open when the proposal was written | `existence` | `gh pr view <n> --json state,closedAt,mergedAt` for 43..55 → all `CLOSED`, `closedAt` 2026-10-19T16:24:41Z…16:25:36Z, `mergedAt` null; `gh pr list --state open` → 0 (as run 17:04Z). Earlier `gh pr list --state all` (proposal, same day) showed #52/#55 `OPEN` | `31a4e04` | The sentinel observation states a false PR state (Low; re-run before writing, FR-4) | — |
| P-10 | The test runs unchanged on the Windows CI cells: `os.homedir()` follows `USERPROFILE`, `child.kill("SIGKILL")` terminates the child, the absolute `--require` path loads, and temp-dir removal after exit succeeds | `other` | `UNVERIFIED — confirm at source before relying on it` (CI runs `npm test` on `windows-latest` × `[18, 22]`, `ci.yml:30–31`, `:72`; no Windows host here) | — | Windows cells red or flaky; a follow-up adds a guarded skip or a fix (Low) | First CI run after the user pushes (owner: the user; no push in this worktree). Recorded in `archive-summary.md` as an open check |

## 12. Budget (Step 2.4)

| Expected | Value |
|---|---|
| Tasks | **1** (test first → red → fix → green → records) |
| LOC | ~**150** (`bin/akili.js` +23/−11 in the prototype · test ~95 · preload ~10 · CHANGELOG ~4 · sentinel ~5) |
| Review rounds | **2** |

Matches Lite.

## 13. Design Review (judgment-day)

Two blind judges (Sonnet, author ≠ auditor) at `31a4e04`; full ledger in `judgment.md`. Both re-ran P-1–P-8 (confirmed) and executed the falsifiers on 18.20.8 / 22.12.0 / 22.23.3.

| Round | Confirmed severe | Suspect | Info | Result |
|---|---|---|---|---|
| 1 | 1 — J1/F1: "#52/#55 still open" false at HEAD | 0 | 9 warnings/suggestions, applied as architect amendments | fixed: FR-4, §4, DD-5, P-9 |
| Re-judge | see `judgment.md` | | | |
