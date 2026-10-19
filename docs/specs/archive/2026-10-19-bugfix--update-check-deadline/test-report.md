# Test Report: update check — an overall deadline, so a slow registry cannot hang the CLI

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `bugfix/update-check-deadline` |
| Depth | **Lite** (Bug Mode) |
| Approval Mode | `pre-approved (user, 2026-10-19)` |
| Date | 2026-10-19 |
| Tested at | `1fe33d7` (T1 commit) |
| Leader | Opus 5.5 (session); registry T1 → `opus` — match |
| Harness | **Inline** (Deployment Rule: Lite, one suite). No Tester spawned. `.agents/tester.md` present (`prove-behavior` fixed to current by `doctor --agents --fix`, see `execution.md` §1) |

## 2. Summary

**Overall: PASS.** All four FR/NFR groups have passing evidence. 0 product bugs, 0 flakes.

| Item | Result |
|---|---|
| Suites | 1 integration suite (child-process CLI against a local server) + 1 inline TTY integration check |
| Author's TDD tests (cited, not rewritten) | `test/update-check.test.js` — 4 cases, red→green recorded in `execution.md` T1 |
| Full suite | `npm test` **365/365** on Node 18.20.8, 22.12.0 (Implementer + Leader re-run), 22.23.3 |
| Added by this phase | TTY check of the original symptom (interactive `akili list`), base vs HEAD — session scratchpad `tty-drip.js`, not committed (see §9) |
| Skills | `systematic-debugging` not needed (no failure); no deviation |

## 3. Backend Unit Tests

n/a — `fetchLatestVersion` is module-private and the approved seam is black-box (NFR-2: no export).

## 4. Frontend Unit Tests

n/a — no UI.

## 5. Integration Tests

| Command | Node | Result |
|---|---|---|
| `node --test --test-reporter=tap test/update-check.test.js` | 18.20.8 · 22.12.0 · 22.23.3 | `# tests 4 # pass 4 # fail 0` each (Leader re-run at execute) |
| `npm test` | 18.20.8 | `# tests 365 # pass 365 # fail 0 # cancelled 0 # skipped 0` |
| `npm test` | 22.12.0 | 365/365 (Implementer; Leader re-run identical) |
| `npm test` | 22.23.3 | `# tests 365 # pass 365 # fail 0 # cancelled 0 # skipped 0` |
| TTY check: `script -q /dev/null node --require registry-redirect.js bin/akili.js list`, temp `HOME`, local server dripping 1 byte/s, 10 s cap | 18.20.8 · 22.23.3 | **base `82091cf`:** `exit code=null signal=SIGKILL; 9947 ms after request; command output printed=false` (18.20.8; 9948 ms on 22.23.3). **HEAD:** `exit code=0 signal=null; 3019 ms after request; command output printed=true` (both versions) |

The TTY check is what the user hits: `checkForUpdates` runs only when `process.stdout.isTTY` (`bin/akili.js:1941` at HEAD), which the committed test's piped `check-update` child never opens. Before the fix the interactive command printed nothing and never returned. After it, the command runs 3 s after the request.

## 6. E2E Tests

n/a — the TTY check in §5 is the end-to-end user path. No browser or service stack.

## 7. Coverage & Traceability

| Requirement | Scenario / clause | Test Type | Test File or Command | Result | Gap or Notes |
|---|---|---|---|---|---|
| FR-1 | Slow drip → exit 0 in [2500, 5000) ms after the request | integration | `update-check.test.js` "slow drip settles before the deadline" | PASS ×3 Node | red at baseline on the `signal === null` assertion (`execution.md` T1) |
| FR-1 | `AND IT MUST` write no cache | integration | same case, `cached === null` | PASS | — |
| FR-1 | `BUT` not running 6000 ms after the request | integration | same case, request-anchored `SIGKILL` cap | PASS | F3 (no `req.destroy`) turns it red |
| FR-1 | statement: abort the request on the deadline | integration | F3 falsifier | red under mutation | — |
| FR-1 | interactive path (`checkForUpdates`) | integration (TTY) | §5 TTY check | PASS (base hangs, HEAD 3019 ms) | not committed (§9) |
| FR-2 | 404 cut → exit 0, empty stderr, `is up to date.`, < 2500 ms | integration | "404 cut mid-body settles without a crash" | PASS ×3 | guard only — green at baseline by design (DD-4) |
| FR-2 | 200 cut → same | integration | "200 cut mid-body settles without a crash" | PASS ×3 | F2 (no `res` handler) turns it red at ~3004 ms |
| FR-2 | `AND IT MUST` no cache · `BUT` not waiting for the deadline | integration | both cut cases (`cached === null`, `< 2500`) | PASS | handler *ordering* unfalsifiable (accepted gap) |
| FR-3 | Healthy → `Update available` with `999.0.0`, < 2500 ms, cache written | integration | "healthy registry is unchanged and exits promptly" | PASS ×3 | `999.0.0` reaches stdout only via the `Update available` branch (Reviewer) |
| FR-3 | statement: no linger until the deadline | integration | cut + control `< 2500` bounds | PASS | F1 (no `clearTimeout`) turns all three red at ~3003 ms |
| FR-4 | CHANGELOG + sentinel content, quote-checked; `BUT` no unshown PR state, no hook timeout | manual | Reviewer quote-check against code + live `gh` (17:20Z) | PASS | one advisory typo (§8) |
| NFR-1 | No outside network call | integration | `hits === 1` in every case + control; F4 → all four `0 !== 1`; real cache mtime unchanged | PASS | — |
| NFR-2 | Preload seam, no export | inspection | `git diff 82091cf -- bin/akili.js` adds no `module.exports` and no test branch | PASS | — |
| NFR-3 | 3000 ms, no dependency, all CI cells | inspection + run | `UPDATE_CHECK_DEADLINE_MS = 3000`; `dependencies` → `undefined`; macOS × 18/22 local | PASS (macOS) | Windows/Linux cells: P-10, first CI run after push |

## 8. Remediation

No failures. Advisory carried from the T1 review (not a test failure): `.jules/sentinel.md` 2026-10-19 *Learning* reads "the check settles the check with no version" (doubled phrase) — `/akili-quick` follow-up candidate.

## 9. Accepted Gaps

| Gap | Why | Owner |
|---|---|---|
| `res.on("error")` *ordering* (DD-2) | Non-reproducible on all three Node versions; only "handler exists" is falsifiable (F2) | accepted at specify |
| Windows / Linux CI cells (P-10) | No Windows host here; CI runs `npm test` on `[ubuntu, macos, windows] × [18, 22]` | the user — first CI run after push |
| TTY check not committed | A committed version would need the `expect`/pty harness the repo already treats as flaky on Ubuntu (`bugfix/pty-harness-ubuntu-flake`); adding a test file is outside the approved T1 scope. The shared fetch is covered by the committed suite | recorded; candidate for a follow-up |
