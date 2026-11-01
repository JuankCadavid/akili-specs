# Archive Summary — impeccable-hardening

**Outcome:** delivered and released as **2.40.0** (tag `v2.40.0`, PRs #105–#108 merged). Impeccable 4.8.0 is vendored into all six install targets and the AKILI design gates around it are hardened. All 11 tasks closed with Reviewer PASS. There is no `test-report.md` or `validation-report.md`: by JC's decision (2026-10-30 12:23 UTC-5) the last verification was the real post-release audit of akili.com.co, and that audit ran.

## 1. Document Control

| Field | Value |
|---|---|
| Original Spec Path | `changes/impeccable-hardening` |
| Archive Date | 2026-10-31 |
| Final Status | **Done** (tasks 11/11; test and validation reports absent, see §6) |
| Archived on | `JuankCadavid/impeccable-audit-fixes` (a spec branch; the apply-capable branch is `dev`). Local commit only |
| Archive mandate | JC's instruction of 2026-10-31 14:23 (UTC-5), repeated in the 16:51 decision. The handling of the absent reports below is the Leader's record, not a new JC approval |

## 2. Requirements Delivered

| ID | What ships |
|---|---|
| FR-1, FR-2 | Impeccable 4.8.0 vendored verbatim (`df3a4ab`, engine 0.1.18) with `UPSTREAM.md` pins; `scripts/sync-impeccable.js` (not shipped) |
| FR-3 | Delivery to every target; an `impeccable/` without `UPSTREAM.md` is foreign on targets without an ownership record (T2b, Pivot P-7 option A) |
| FR-4 – FR-9 | Skill source and engine states, consent gate, launcher invocation with `IMPECCABLE_NO_UPDATE_CHECK=1` (T3b), exit codes, desktop/mobile passes, first-visit pass |
| FR-10 – FR-13 | Performance step (design mode), E1 baseline checks, Design Waivers, report template fields |
| FR-14 | Bridge re-scope, governance (31 packaged skills) and attribution |
| NFR-4 | Package growth +2,275,385 B unpacked, within +2.5 MB (T9) |

## 3. Files Changed Summary

From `execution.md`: `.claude/skills/impeccable/` (61 files, new), `.claude/skills/impeccable-bridge/` (rewrite + `references/design-evaluation.md`), the `/akili-validate`, `/akili-test`, `/akili-audit`, `/akili-constitution`, `/akili-specify`, `/akili-propose` commands, `bin/akili.js` (foreign rule), `scripts/sync-impeccable.js`, docs, README, governance, CHANGELOG, and the test amendments of T8. Authored LOC ~1,448 against ~1,650 (ceiling raised by JC 12:20).

## 4. Test Evidence Summary

No `test-report.md`. Recorded evidence in `execution.md`: `npm test` 1233/1233 at T8 and T9; `verify:cli` 31 skills; `pack:dry-run` 407 files; `install --tool all --dry-run` and `doctor --tool all` checked; every task's falsifiers executed. No `/akili-test` Tester run happened.

## 5. Validation Summary

No `validation-report.md`. The two items JC deferred to the post-release audit have this evidence:

| Item | Evidence | Result |
|---|---|---|
| P-15 (Claude Code lists and loads `impeccable` from a real install) | `~/akili-audits/2026-10-30-akili-web-design-2.40.0.md` line 5: Impeccable `vendored (4.8.0)` resolved from the installed skills directory with `UPSTREAM.md`, commit `df3a4ab`, engine `installed (consented)` with a matching sha256 | Observed in the audit. JC's own sign-off on P-15 is not recorded in this spec |
| T9 re-walk | The same audit ran `/akili-audit design` on 2.40.0 and found 14 methodology gaps | The gaps became the `changes/impeccable-audit-fixes` family (design-eval-contract, design-eval-followup, install-stale-skills) |

## 6. Accepted Gaps

| Gap | Handling |
|---|---|
| No `test-report.md` | Accepted under the archive mandate; §4 records what did run. Not reconstructed |
| No `validation-report.md` | Accepted under the archive mandate; JC's 12:23 decision made the post-release audit the final check (§5) |
| ADVISORY T8: NFR-5 not locked by a test; loose pointer regex; no block-list of a stale `30 packaged` | Recorded, not acted on |

## 7. Historical Notes

- Pivot P-7 (T2): the design premise that every target goes through the owned/foreign policy held for Grok Bot only. Option A (new task T2b) was approved by JC 11:56.
- Budget raised twice by JC (to ~1,365, then ~1,650 at 12:20); actual ~1,448.
- The two-PR split was not cut (commits interleaved); one PR carried the spec.

## 8. Diagrams

None: no `diagrams/` folder and no diagram slot.
