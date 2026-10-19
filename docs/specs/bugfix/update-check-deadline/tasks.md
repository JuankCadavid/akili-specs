# Tasks: update check — an overall deadline, so a slow registry cannot hang the CLI

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `bugfix/update-check-deadline` |
| Depth | **Lite** (Bug Mode) |
| Status | **Approved** — Phase 3 gate: `auto-approved (pre-approved mode)`, 2026-10-19 |
| Date | 2026-10-19 |
| Budget (design §12) | **1 task · ~150 LOC · 2 review rounds**. `/akili-execute` stops and escalates past 1 task, ~200 LOC, or 2 rounds |
| Commit prefix | `[SPEC:bugfix/update-check-deadline]`. Local commits only: no push, merge, tag, release or `npm publish` |
| Format precedent | `docs/specs/archive/2026-10-18-bugfix--init-ctrlc-abort/tasks.md` |
| Verified at | `3672bc5`. Every baseline reading below was **executed** on 2026-10-19 with the session prototype (design §1) and is quoted, not predicted (KZ-changes--leader-brief-contract-2) |

## 2. Task Graph

```
T1 (regression test first → red · deadline + settle + res error first → green · CHANGELOG + sentinel)
```

One task, no dependencies. **`skip-eligible` tasks: none.** T1 changes shipped networking code and adds the harness its own verdict rests on.

**Skills:** `tdd` (test first, red quoted below) · `systematic-debugging` if a run disagrees with a baseline reading · `error-handling-patterns` (settle-once / timeout shape) · `cognitive-doc-design` (CHANGELOG, sentinel entry).

---

### T1 — Regression test, overall deadline in `fetchLatestVersion`, records

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S–M (~150 LOC: `bin/akili.js` +23/−11 · `test/update-check.test.js` ~95 · `test/fixtures/update-check/registry-redirect.js` ~10 · `CHANGELOG.md` ~4 · `.jules/sentinel.md` ~5) |
| Depends on | none |
| Requirements | FR-1 (statement: settle "no version" by the deadline **and** abort the request; scenario; `AND IT MUST` no cache; `BUT` not running at 6000 ms) · FR-2 (both scenarios; exit 0, empty stderr, `is up to date.`, < 2500 ms; `AND IT MUST` no cache; `BUT` not waiting for the deadline) · FR-3 (scenario: `Update available` + `999.0.0`, < 2500 ms; `AND IT MUST` cache `"latest":"999.0.0"`; statement: no linger until the deadline) · FR-4 (CHANGELOG + sentinel content; scenario quote-check; `BUT` no PR state `gh` does not show, no hook timeout value) · NFR-1 · NFR-2 · NFR-3 (3000 ms default, no dependency, no skip on any CI cell) |
| Design refs | §3, §4, DD-1–DD-5, P-2–P-10. **P-10 `UNVERIFIED`** (Windows): see *Done* |
| Consumers | `getLatestVersion` `bin/akili.js:1910` → `checkForUpdates` `:1926`, `runCheckUpdate` `:1952` (SessionStart hook `:1976`). Test files pinning the update check: none (`grep -rn "fetchLatestVersion\|getLatestVersion\|check-update" test/` → 0 hits, P-7). Existing preload precedent `test/fixtures/init/no-network.js` — untouched |
| Review | `full`: shipped networking code plus the harness the regression verdict rests on |

**Scope (in this order; `tdd`).**

1. **Test first.**
   - `test/fixtures/update-check/registry-redirect.js`: `"use strict"` preload with a header comment in the style of `test/fixtures/init/no-network.js`. Replaces `https.get` with `(_url, options, callback) => http.get(process.env.AKILI_TEST_REGISTRY, options, callback)`.
   - `test/update-check.test.js` (`node:test`, `node:assert/strict`):
     - `serve(handler)` starts one `http` server on `127.0.0.1:0` per case, counts requests, and records the time of the first one.
     - `runCheckUpdate(server)` makes a fresh `fs.mkdtempSync` home. It **asynchronously** spawns `process.execPath --require <preload> bin/akili.js check-update` with `HOME`/`USERPROFILE` = that home, `AKILI_TEST_REGISTRY` = the server URL, and stdio piped. It `SIGKILL`s the child 6000 ms after the server's first request (20000 ms after spawn if no request ever arrives) and resolves `{ code, signal, ms, stdout, stderr, cached }`. `ms` runs from the first request to child `close`. `cached` is the content of `<home>/.akili-specs-update.json` or `null`. The home is removed afterwards.
     - Servers are closed in `finally` (the drip server also drops its connections, with `closeAllConnections` where available; Node 18.20 has it).
     - Case **drip** (FR-1): 200 then `" "` every 1000 ms, interval cleared on `close`. Asserts `hits === 1`; `signal === null` with the message `killed at the 6000 ms cap: still pending (<ms> ms)` (`ms` from the first request); `code === 0`; `2500 <= ms < 5000`; `cached === null`.
     - Cases **404 cut** / **200 cut** (FR-2): `content-length: 1000`, write `{"latest":"9.` (13 bytes), destroy the socket after 100 ms. Assert `hits === 1`, `code === 0`, `stderr === ""`, `ms < 2500`, stdout matches `/is up to date\./`, `cached === null`.
     - Case **healthy control** (FR-3): 200 `{"latest":"999.0.0"}`. Asserts `hits === 1`, `code === 0`, `ms < 2500`, stdout matches `/999\.0\.0/`, `cached` matches `/"latest":"999\.0\.0"/`.
     - Every time assertion message states the measured ms.
2. **Red.** Run `~/.nvm/versions/node/v<v>/bin/node --test --test-reporter=tap test/update-check.test.js` on 18.20.8, 22.12.0 and 22.23.3 **before touching `bin/`**. Quote each `not ok` block in `execution.md`. Expected, as executed with the prototype (request-anchored cap) at `3672bc5`: `not ok 1 - slow drip settles before the deadline … 'killed at the 6000 ms cap: still pending (6005 ms)'` (18.20.8; 6004 on 22.12.0 and 22.23.3), cases 2–4 `ok`.
3. **Fix (DD-1, DD-2, DD-3).**
   - `const UPDATE_CHECK_DEADLINE_MS = 3000;` directly below `UPDATE_CACHE_TTL_MS` (`:1850`).
   - In `fetchLatestVersion`:
     - Add a `settle(value)` that clears the deadline timer and resolves. Every `resolve(...)` in the function becomes `settle(...)`.
     - Move `res.on("error", …)`, with its 🛡️ comment, to the first statement of the response callback, above the status check.
     - Right after `https.get(...)` returns, arm `setTimeout(() => { req.destroy(); settle(null); }, UPDATE_CHECK_DEADLINE_MS)`. Do not `unref` it.
     - Add one short comment on why both timers exist: the idle timer is re-armed by every byte.
     - Keep the 1500 ms idle `timeout` and the 50,000-byte cap unchanged.
4. **Green.** Rerun step 2 on all three versions → 4/4 `ok` each. Then `npm test` (full suite; TAP shows the preload as an extra passing entry, design DD-4). Then run the falsifiers below and restore.
5. **Records (DD-5).**
   - Re-run `gh pr view <n> --json state,closedAt,mergedAt` for 43..55 and `gh pr list --state open` **immediately before** writing the entry, and quote the output in `execution.md` (P-9).
   - `.jules/sentinel.md`: append `## 2026-10-19 - No Overall Deadline in the Update Check (fourth Sentinel batch, #43–#55)`, in the file's `**Vulnerability:** / **Learning:** / **Prevention:**` shape, plus a `**Process:**` paragraph like the 2026-09-20 entry's. Content:
     - *Vulnerability:* the batch's reported mechanism, "unhandled `res` error before the listener on non-200".
     - *Learning:* the mechanism measured non-reproducible (404 and 200 cut mid-body settle with exit 0 and empty stderr on 18.20.8, 22.12.0, 22.23.3). The real defect sits next to it: `{ timeout: 1500 }` is an idle timer, so a 1 byte/s drip never settles, and `check-update` (the SessionStart hook command) reaches it with no TTY gate.
     - *Prevention:* an overall deadline that destroys the request, one settle path that clears it, the handler first, verified by falsifiers. Name `test/update-check.test.js`.
     - *Process:* the observation from step 5's first bullet, stated exactly as `gh` shows it. No host hook timeout value.
   - `CHANGELOG.md` `## [Unreleased]`: replace `### Notes` and `- No unreleased changes yet.` with `### Fixed` and one entry. Before: an interactive command or `akili check-update` could hang on a registry response that trickles bytes. After: the check gives up after 3 s. Unchanged: the result, the cache, the output. Name the new test.
   - Quote-check every clause of both notes against HEAD and the `gh` output before the Reviewer (KZ-002).

**Verification.**

| Check | Command | Pass |
|---|---|---|
| Regression red → green | step 2 / step 4 commands, three Node versions | red quoted (drip only), then 4/4 `ok` |
| Full suite | `npm test` | 0 fail |
| Package | `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` | exit 0; the new test and preload are **not** in the tarball list (`test/` is not shipped) |
| No dependency | `node -e "console.log(require('./package.json').dependencies)"` | `undefined` |

**Falsifiers (executed against the post-change code, then restored with `git checkout -p` or by reapplying; each quoted in `execution.md`).** All baseline readings below were observed with the prototype on 18.20.8 / 22.12.0 / 22.23.3:

| # | Mutation | Expected red (as executed) |
|---|---|---|
| F1 | delete `clearTimeout(deadline)` from `settle` | cases 404 cut, 200 cut, control fail: `exited 3002 / 3001 / 3004 ms …` (18.20.8; 3001–3004 on the others); drip stays green |
| F2 | delete the `res.on("error", …)` block | 200 cut fails: `exited 3003 ms …` (3003–3004 across versions); others green |
| F3 | delete `req.destroy()` from the deadline handler | drip fails: `killed at the 6000 ms cap: still pending (5948 ms)` (5947–5959, executed with the spawn-anchored cap; ≈ 6004 expected with the request-anchored one — re-quote at execute); others green |
| F4 | drop `--require <preload>` from the spawn args (the child then makes its ordinary read-only call to the real registry) | **executed** on 22.23.3: all four cases fail `hits` with `expected: 1  actual: 0`, and the real `~/.akili-specs-update.json` is unchanged (temp `HOME`). The control is the guard that the test is not silently talking to the real registry |

**Disqualifier.**
- A red from anything other than the drip case's `signal === null` assertion is not the regression red. Examples: a spawn error, a port error, `hits === 0`, a syntax error.
- If any case's `ms` varies by more than 1000 ms across three reruns on one version, the timing bounds are not evidence. Report the spread instead of passing.
- A green obtained with a warm `~/.akili-specs-update.json` is not evidence either. The test must never read the real home (P-6), so if a run creates or changes `~/.akili-specs-update.json`, stop.

**Gaps (recorded, not covered).**
- Handler *ordering* (DD-2): no run can make it fail on any of the three versions.
- Windows CI cells (P-10): unverified until the user pushes.

**Done.**
- Red quoted (three versions) → fix → green (three versions); `npm test` green; F1–F4 red and restored; the verification table passes.
- The two notes are quote-checked, with the `gh` output quoted.
- One commit with the prefix, plus an `execution.md` entry.
- P-10 is carried to `archive-summary.md` as an open check owned by the user (first CI run after push).
