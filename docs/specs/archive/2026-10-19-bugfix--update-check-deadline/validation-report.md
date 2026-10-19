# Validation Report — update check: overall deadline (`bugfix/update-check-deadline`)

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `bugfix/update-check-deadline` |
| Depth | **Lite** (Bug Mode) |
| Approval Mode | `pre-approved (user, 2026-10-19)` |
| Date | 2026-10-19 |
| Validated at | `3bd838a` (clean tree) |
| Auditor | Opus 5.5 session (registry T3 → `opus`, `docs/model-routing.md:125`); Implementer was `sonnet` → author ≠ auditor holds |
| Evidence reused | `test-report.md` (PASS) and `execution.md` T1 (Reviewer PASS, evidence re-run VERIFIED) — cross-checked, not re-derived |

## 2. Summary

**Verdict: PASS — archive-ready.** 0 FAIL · 2 WARN (both accepted or follow-up) · 1 INFO.

| Area | Result |
|---|---|
| Tasks | PASS (1/1 `[x]`, evidence complete) |
| Files | PASS (5/5 match design §4) |
| Build integrity | PASS |
| Requirements | PASS (FR-1..FR-4, NFR-1..NFR-3) — NFR-3 Windows/Linux cells WARN (P-10) |
| Design conformance | PASS (DD-1..DD-5, no undocumented drift) |
| Proposal alignment | PASS (scope, non-goals, success criteria) |

## 3. Task Completion

| Task | Status | Evidence | Result |
|---|---|---|---|
| T1 | `[x]` | `execution.md` T1: red quoted ×3 Node, green ×3, F1–F4 quoted, `gh` output quoted, Reviewer `STATUS: PASS`, re-run VERIFIED; written before the checkbox (commit `1fe33d7` carries both) | PASS |

## 4. File Existence

| Design §4 path | Change | At HEAD (`git diff --numstat 82091cf HEAD`) | Result |
|---|---|---|---|
| `bin/akili.js` | constant + `fetchLatestVersion` | +24/−11 | PASS |
| `test/update-check.test.js` | new, four cases | +125 | PASS |
| `test/fixtures/update-check/registry-redirect.js` | new preload | +12 | PASS |
| `CHANGELOG.md` | `### Fixed` replaces `### Notes` + bullet | +2/−2 | PASS |
| `.jules/sentinel.md` | new 2026-10-19 entry | +5 | PASS |

No other source file changed (spec folder aside).

## 5. Build Integrity

| Command | Result |
|---|---|
| `npm test` | 365/365 on Node 18.20.8, 22.12.0, 22.23.3 (`test-report.md` §5) |
| `npm run verify:cli` | exit 0 — `12 commands \| 27 skills \| 8 resources (akili-specs v2.34.0)` |
| `npm run pack:dry-run` | exit 0; 0 lines match `update-check\|registry-redirect\|test/` (execute re-run) |
| `git diff --check 82091cf HEAD` | clean |
| Lint / type-check | none defined in the repo (plain CommonJS, no `lint` script) — no gap introduced by this spec |

Installer behavior is unchanged, so the `install --dry-run` / `doctor` checks in `AGENTS.md` → *Verification* do not apply.

## 6. Requirement Coverage

| Req | Clause | Task | Code evidence | Test evidence | Result |
|---|---|---|---|---|---|
| FR-1 | settle "no version" by the deadline | T1 | deadline timer → `settle(null)` (`bin/akili.js` `fetchLatestVersion`) | drip case PASS ×3; red at baseline on `signal === null` | PASS |
| FR-1 | abort the request when the deadline fires | T1 | `req.destroy()` in the deadline handler | F3 → drip red at cap | PASS |
| FR-1 | `AND IT MUST` no cache · `BUT` not running 6000 ms after the request | T1 | `if (latest) writeUpdateCache` unchanged | `cached === null`; request-anchored cap | PASS |
| FR-1 | intent: interactive commands no longer hang | T1 | same fetch via `checkForUpdates` | TTY check: base SIGKILL at 10 s, HEAD exit 0 at 3019 ms (`test-report.md` §5) | PASS |
| FR-2 | 404 / 200 cut → exit 0, empty stderr, `is up to date.`, < 2500 ms | T1 | `res.on("error")` first; non-200 → `settle(null)` | both cut cases PASS ×3 | PASS |
| FR-2 | `AND IT MUST` no cache · `BUT` not waiting for the deadline | T1 | — | `< 2500`; F2 → 200-cut red at ~3004 ms | PASS |
| FR-3 | healthy → `Update available` + `999.0.0`, cache, < 2500 ms; no linger | T1 | `settle` clears the timer | control PASS; F1 → three cases red at ~3003 ms | PASS |
| FR-4 | CHANGELOG + sentinel content; `BUT` no unshown PR state, no hook timeout | T1 | `CHANGELOG.md:9–11`, `.jules/sentinel.md:38–42` | Reviewer quote-check + `gh` 17:20Z; re-read here | PASS (see WARN-1) |
| NFR-1 | no outside network | T1 | preload | `hits === 1` ×4; F4 → `0 !== 1` ×4; real cache mtime unchanged | PASS |
| NFR-2 | preload seam, no export, no test branch | T1 | `git diff 82091cf -- bin/akili.js \| grep -c module.exports` → 0 | — | PASS |
| NFR-3 | 3000 ms default · no dependency · all CI cells | T1 | `UPDATE_CHECK_DEADLINE_MS = 3000`; `dependencies` → `undefined` | macOS × 18/22 local | PASS · **WARN-2** (Windows/Linux cells) |

Every scenario and every `BUT` / `AND IT MUST` clause is owned by T1 and carries test or inspection evidence. The 404-cut case is a guard by design (DD-4), and handler *ordering* is an accepted gap (DD-2). Neither is a coverage hole.

## 7. Linting & Code Quality

No lint tooling (see §5). 4R sweep — **advisory**, carried forward from the T1 review plus this pass:

| Lens | Finding |
|---|---|
| Readability | **WARN-1** — `.jules/sentinel.md:40` reads "the check settles the check with no version" (doubled phrase). Cosmetic, copy-only → `/akili-quick` follow-up |
| Readability | `/Update available:.*999\.0\.0/` would state FR-3's intent more directly than `/999\.0\.0/` (advisory) |
| Reliability | Only the drip case calls `closeAllConnections`; a future keep-alive regression in another case would hold `server.close()` until the cap (advisory) |
| Resilience | Under host load the Reviewer saw the 404 cut at 939 ms (vs ~110 ms), still far under 2500 ms; watch the bounds on Windows runners (ties to WARN-2) |
| Risk | Low. The preload replaces `https.get` globally but is test-only and not packed. The one behavior change is a 3 s ceiling, which widens nothing |

## 8. Design Conformance

| Decision | Shipped | Result |
|---|---|---|
| DD-1 deadline armed after `https.get`, not `unref`'d, cleared by `settle` on every exit; handler destroys first | yes; every former `resolve` is `settle` | PASS |
| DD-2 `res.on("error")` first, body and 🛡️ comment kept | yes | PASS |
| DD-3 fixed 3000 ms, no knob | yes; no env read added | PASS |
| DD-4 preload seam, async spawn, temp `HOME`/`USERPROFILE`, timing from first request, request-anchored cap | yes | PASS |
| DD-5 records; `### Notes` heading removed; dated PR observation; no hook timeout | yes | PASS |

**Proposal alignment.** Option A was delivered as recommended. Every non-goal held: no release, no push or PR action, no cache-policy change, no hook `timeout` field, no TTY-gate change. All five success criteria are met.

**Cross-document figure check.** Agreed across all documents: the bounds (2500 / 5000 / 6000 / 20000 ms), the 13 bytes, "four cases" plus 5 TAP entries, the Node versions, and the 1 task / 2-round budget. **INFO-1:** the `tasks.md` T1 *Size* cell gives `bin/akili.js +23/−11` (the prototype's figure, as `design.md` §12 qualifies it), while `execution.md` records the shipped `+24/−11`. The test came in at 125 lines against ~95 planned. These are plan estimates; actuals are recorded in `execution.md`, and the total of 181 LOC stayed under the ~200 tripwire. No correction needed.

## 9. Test Evidence Summary

`test-report.md` is **PASS** at `1fe33d7`, which matches the code at HEAD: `3bd838a` changed only the spec folder. The report records 0 product bugs and 0 flakes. Red→green was proven on three Node versions, with four falsifiers and a TTY end-to-end check against the base tree.

## 10. Agent Guide / Constitution Impact

`execution.md` has no `## Constitution Impact` block. Correct: no module was created or reshaped, and `fetchLatestVersion` is module-private. No guide is affected. CodeGraph re-index: `bin/akili.js` changed → routine re-index at archive.

## 11. Remediation

| ID | Level | Item | Route |
|---|---|---|---|
| WARN-1 | WARN (advisory) | Doubled phrase in `.jules/sentinel.md:40` | `/akili-quick` (copy-only) — not in this spec's approved scope |
| WARN-2 | WARN (accepted gap) | Windows/Linux CI cells unverified (design P-10) | the user — first CI run after push |
| INFO-1 | INFO | `tasks.md` Size estimate vs shipped LOC | none |

## 12. Archive Readiness Recommendation

**Ready to archive.** Every task is `[x]` and no FAIL remains. Both WARNs have a named route. Tests cover every requirement and clause. No drift is undocumented.

```text
/akili-archive bugfix/update-check-deadline
```
