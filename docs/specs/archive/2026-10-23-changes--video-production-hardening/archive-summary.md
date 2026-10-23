# Archive Summary — Video Production Hardening

**Outcome: archived on a reduced scope.** T1–T14 delivered and validated (PASS with WARN, 0 FAIL); T15–T21 deferred by the owner to a future spec. No release may ship this scope until a CHANGELOG entry exists and the Tester-model docs contradiction (W-2) is closed or noted in it.

## 1. Document Control

| Field | Value |
|---|---|
| Spec | Video Production Hardening |
| Type / Deliverable | Change / software |
| Depth | Standard |
| Approval Mode | pre-approved (Juan Carlos Cadavid, 2026-10-23) |
| Branch | `JuankCadavid/video-hardening` (spec branch; apply-capable branch is `dev`) |
| Commits | b7bdb3b → this archive commit, local only (not pushed) |

## 2. Original Spec Path

`docs/specs/changes/video-production-hardening/`

## 3. Archive Date

2026-10-23

## 4. Final Status

| Item | State |
|---|---|
| Tasks | 14 of 21 `[x]`; T15–T21 `[ ] Deferred` (owner scope cut, `execution.md` → *Scope cut*) |
| Tests | `npm test` 724/724 (655 at 34afbff) |
| Validation | PASS with WARN — 0 FAIL, 0 BLOCKED, W-1–W-8 |
| Budget (design §12) | 14/21 tasks · 21/~38 review rounds · no tripwire crossed |

## 5. Requirements Delivered

| Requirement | State |
|---|---|
| FR-1–FR-10, FR-12–FR-17 | delivered and pinned (FR-6 skill side delivered but unpinned — W-4) |
| FR-11 *Runtime spawn*; *Rule text* in `/akili-test`, `leader.md`, `tester.md` | delivered |
| FR-11 *Wrapper derivation*, *No distinct model on a host*; *Rule text* elsewhere | deferred (T15–T19) |
| FR-18 `akili --version` | deferred (T20) |
| FR-19 | issue cites delivered; CHANGELOG, docs mirrors, closing sweep deferred (T18, T21) |
| NFR-1–NFR-6 | met on the delivered scope (NFR-3, NFR-5 by review) |

## 6. Files Changed Summary

Delivered diff (`git diff b7bdb3b HEAD -- . ':!docs/specs'`): 13 files, +723 −84.

| Area | Files | Tasks |
|---|---|---|
| Video skill | `.claude/skills/video-production/SKILL.md`, `references/render-evidence.md`, `references/acceptance-criteria.md` (3 files, 17,306 bytes ≤ 20,000) | T1–T4 |
| Commands | `.claude/commands/akili-{propose,specify,execute,test,validate}.md` | T6–T10 |
| Personas | `.claude/templates/leader.md`, `tester.md` | T11, T12 |
| Skill | `.claude/skills/judgment-day/SKILL.md` | T13 |
| Tests | `test/video-production.test.js` (16 → 33 tests), new `test/command-contracts.test.js` (52 tests) | T5, T14 |

T15's unreviewed work (`bin/routing.js`, `test/routing.test.js`) is parked on local branch `deferred/T15-tester-derivation` (ada841b), not in this diff.

## 7. Test Evidence Summary

| Evidence | Result |
|---|---|
| `npm test` | 724 pass, 0 fail |
| `npm run verify:cli` · `npm run pack:dry-run` · `git diff --check b7bdb3b` | clean |
| Mutation walks | T5: 91/91 red; T14: 117/117 red; independent Reviewer and Validator spot mutations on top |
| Tester | one suite, `haiku` (distinct from Implementers `sonnet`/`opus`), PASS |

## 8. Validation Summary

Validator `fable` (T3, distinct from every author). 20 requirements PASS, 5 WARN (FR-6, FR-11, FR-13, FR-18, FR-19), 0 FAIL. Spec-document corrections W-6 (FR-13 wording), W-7 (P-15 / T14 lines vs occurrences) and the W-4 coverage cells (`tasks.md`, `test-report.md`) were applied before this archive.

## 9. Accepted Warnings Or Follow-Ups

| ID | Follow-up | Gate |
|---|---|---|
| W-1, W-2, W-5, W-8 | Follow-up spec for T15–T21: routing Tester derivation (start from `deferred/T15-tester-derivation`, re-reviewed from scratch), Tester-model restatements in constitution/docs, `tester.md:7` fence/deployability, docs mirrors | before the next `Deliverable: video` run or release |
| W-3 | `CHANGELOG.md` `Unreleased` entry for T1–T14, stating that `/akili-test` governs while docs lag and that deployed `tester.md` needs a manual re-copy | **release gate** |
| W-4 | Three FR-6 skill-side assertions in `test/video-production.test.js` (~15 LOC) | follow-up spec or `/akili-quick` |
| Ops | Owner's `run.sh` treats a session-limit stop as a passed phase (Claude exits 0) | owner runner; kaizen upstream item |

## 10. Historical Notes

- **Ceiling rung, first live use.** T5 and T14 each failed twice at `sonnet`; attempt 2 already ran at `xhigh` (T2 ceiling), so the rung this spec ships (T8) fired: attempt 3 ran the Implementer on `opus` `xhigh` and the Reviewer on `fable`. Both passed on attempt 3.
- **Execute-time design correction:** §6 / §7.1 Cursor rows claimed an unobserved Tester line; corrected to the observed `unsatisfiable` path (during T15).
- **Scope cut** mid-run by the owner (verbatim in `execution.md`); T15's in-flight Reviewer was stopped and its work parked.
- Two specify-time falsifier predictions did not hold when executed (T6, T13); the T15 falsifier also missed its predicted red on the OpenCode user roster.

## 11. Diagrams

The design carries one inline Mermaid flowchart (§3); no `diagrams/` folder and no baseline diagram slot made stale.
