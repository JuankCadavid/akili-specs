# Archive Summary — update check: overall deadline (`bugfix/update-check-deadline`)

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `bugfix/update-check-deadline` |
| Type / Depth | Bug · Lite (Bug Mode) · Deliverable: software |
| Approval Mode | `pre-approved (user, 2026-10-19)` — local commits only; no push, merge, tag, release or `npm publish` |
| Branch | `JuankCadavid/update-check-deadline` (worktree `update-check-deadline`) — **spec branch** (`Default Branch: master`, no integration pin) |
| Archived at | the archive commit that follows `31fff9e` |

## 2. Original Spec Path

`docs/specs/bugfix/update-check-deadline/`

## 3. Archive Date

2026-10-19

## 4. Final Status

**DONE — validation PASS**, archive-ready. 1/1 task `[x]`: Reviewer `PASS` on attempt 1, evidence re-run `VERIFIED`. 0 FAIL. The 2 WARNs are routed (§9).

## 5. Requirements Delivered

| ID | Delivered |
|---|---|
| FR-1 | Update check settles "no version" within a 3000 ms overall deadline that destroys the request (the slow-drip hang is gone) |
| FR-2 | 404 / 200 cut mid-body still settle at once, exit 0, no crash |
| FR-3 | Healthy check unchanged; a settled check no longer holds the process (timer cleared on every exit) |
| FR-4 | `CHANGELOG.md` `[Unreleased]` → `### Fixed` entry; `.jules/sentinel.md` 2026-10-19 entry (fourth batch #43–#55, mechanism non-reproducible, real defect, dated PR-state observation) |
| NFR-1..3 | Offline tests (hit counter + control) · `--require` preload seam, no export · 3000 ms default, no dependency |

## 6. Files Changed Summary

From `execution.md` T1, commit `1fe33d7`:

| File | Change |
|---|---|
| `bin/akili.js` | +24/−11: `UPDATE_CHECK_DEADLINE_MS = 3000`; `settle()` clears the deadline; deadline timer → `req.destroy()` + `settle(null)`; `res.on("error")` first; every `resolve` → `settle` |
| `test/update-check.test.js` | new, 125 lines, 4 cases |
| `test/fixtures/update-check/registry-redirect.js` | new, 12 lines, `--require` preload |
| `CHANGELOG.md` | +2/−2 |
| `.jules/sentinel.md` | +5 |

Total: 181 LOC changed, against ~150 estimated and the ~200 tripwire.

## 7. Test Evidence Summary

- **Red:** the drip case failed before the fix on Node 18.20.8, 22.12.0 and 22.23.3, on the `signal === null` assertion: still pending at 6004–6007 ms after the request.
- **Green:** 4/4 on all three versions, with a spread of ≤ 15 ms.
- **Falsifiers F1–F4:** each one red.
- **`npm test`:** 365/365 on all three versions.
- **TTY end-to-end check of the original symptom:** with interactive `akili list`, the base tree was killed at the 10 s cap; HEAD exited 0 at 3019 ms. Source: `test-report.md`.

## 8. Validation Summary

`validation-report.md`: **PASS**, 0 FAIL · 2 WARN · 1 INFO. Every requirement and every `BUT` / `AND IT MUST` clause is covered. Design DD-1..DD-5 were delivered with no undocumented drift. The proposal's non-goals all held.

## 9. Accepted Warnings Or Follow-Ups

| Item | Owner / route |
|---|---|
| WARN-1: `.jules/sentinel.md:40` doubled phrase "the check settles the check" | `/akili-quick` (copy-only) |
| WARN-2 / P-10: Windows and Linux CI cells unverified | the user — first CI run after push |
| TTY check not committed (it needs the pty harness; outside T1 scope) | follow-up candidate |
| Patch release (`npm run release:patch`) — not executed in this spec, by mandate | the user |
| CodeGraph re-index (`bin/akili.js` changed) | the user / environment |
| Kaizen pending items (`docs/specs/kaizen/bugfix--update-check-deadline.md`) | apply phase on `master` |

## 10. Historical Notes

- **Already fixed?** No branch or PR added a deadline. Sentinel PRs #43–#55 only moved `res.on("error")`, which on its own is non-reproducible.
- **Judgment-day:** two blind Sonnet judges confirmed one severe finding. The requirements said "#52/#55 still open", but all thirteen PRs had been closed unmerged at 16:24–16:25Z, after the proposal was written. It was fixed in round 1, and the scoped re-judgment came back `RESOLVED` from both judges, so the verdict was APPROVED. The judges also prompted the request-anchored kill cap, so that a cold start on Windows cannot fake a red.
- The test's timing bounds run from the server's first request, which keeps Node startup out of every bound.
- `.agents/` was copied from the main checkout, as the gitignored-worktree precedent does. `doctor --agents --fix --allow-branch` updated two outdated sections in that local copy only.
- Runtime events: none.

## 11. Diagrams

n/a: no `diagrams/` folder, and the design had no architecturally significant slot.
