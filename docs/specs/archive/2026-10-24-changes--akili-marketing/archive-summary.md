# Archive Summary — `changes/akili-marketing`

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-marketing` |
| Archived To | `docs/specs/archive/2026-10-24-changes--akili-marketing/` |
| Branch | `JuankCadavid/akili-marketing`. This is a spec branch: the pins are `Default Branch: master` and `Integration Branch: dev`. |
| Release | New command → **minor**. This cycle only records the release class; there is no release in it. |

## 2. Original Spec Path

`docs/specs/changes/akili-marketing/`

## 3. Archive Date

2026-10-24

## 4. Final Status

**DONE — PASS.** All 12 tasks are `[x]`. `npm test` passes 750/750. Validation found 0 FAIL and 2 accepted WARN. The T10 dogfood matched expectations on all 12 steps.

## 5. Requirements Delivered

| ID | Delivered |
|---|---|
| FR-1 | `social-marketing` core skill. It is adapted from Sergey Bulaev's MIT IG, LI and FB packs with pinned commits, a byte-identical LICENSE, an `Adapted from` line on every reference, and no vendor paths. |
| FR-2…FR-11 | `/akili-marketing` with six modes (`brand`, `campaign`, `calendar`, `post`, `review`, `repurpose`) plus `--revise` and `--published`. Four rules are defined once in `## Invariants`: it never publishes; approval counts only in the user's own words; it writes only under `docs/marketing/`; untrusted text is treated as data. |
| FR-12 | Docs pages, governance and README rows, counts updated to 13 commands and 28 skills, the Codex doctor fixture, the `diagram-design` pin, and a CHANGELOG *Unreleased* entry. |
| NFR-1…6 | No change to `bin/`, dependencies or routing. Size stays within target: command 182 lines, SKILL 73, references 777. Every platform limit is dated and labelled. |

## 6. Files Changed Summary

| Area | Files |
|---|---|
| Command | `.claude/commands/akili-marketing.md` |
| Skill | `.claude/skills/social-marketing/` — `SKILL.md`, `LICENSE`, 10 references (7 shared, IG, LI, FB) |
| Docs | `docs/commands/akili-marketing.md`, `docs/skills/social-marketing.md`, `docs/skills/{governance,README}.md`, `README.md`, `docs/README.md`, `docs/commands/README.md`, `docs/flow.md`, `docs/cli.md`, `AGENTS.md`, `CHANGELOG.md` |
| Tests | `test/social-marketing-skill.test.js` (9), `test/akili-marketing-command.test.js` (71), `test/social-marketing-install.test.js` (3), `test/akili-marketing-docs.test.js` (12); count updates in `test/install-cursor.test.js`, `test/fixtures/doctor-codex-baseline.txt`, `test/diagram-design.test.js` |

Shipped LOC are about 2,017 against a budget of about 2,600, with 21 review rounds. The 20-round cap was reached; the user authorized round 21 for the T10 observation only.

## 7. Test Evidence Summary

The automated suite passes 750/750, of which this spec added 95. Seven mutation checks were run on the docs suite.

T10 dogfood (verbatim record in `t10-dogfood.md`):
- All 12 steps passed.
- No commit was made in the scratch project.
- The fake token was written nowhere.
- All 7 files written are under `docs/marketing/`.

## 8. Validation Summary

**PASS, archive-ready**: 0 FAIL, 2 WARN.

- A stale stub figure in `requirements.md` §4 was corrected during validation (224 → 228 is the stub count; the shipped skill gives 224 → 236).

## 9. Accepted Warnings Or Follow-Ups

| Item | Route |
|---|---|
| NFR-3: the Windows CI legs have not run | PR CI must show all six checks green before merge |
| T10 ran once, on Claude Code only, and FR-8 was never exercised with a tool that can post | Recorded in requirements §8. Optionally repeat the dogfood before a release. |
| 15 stray install paths in the user's real HOME, left by a `/akili-test` exploratory run | The user decides whether to delete them (`test-report.md` §2) |
| No model-routing row (proposal D8) | Wait for the routing template-evolution bug fix |
| `assets/akili-flow.png` not regenerated | Out of scope, as the proposal states |

## 10. Historical Notes

- **Budget tripwire.** The 20-round tripwire stopped execution at T10. The user authorized round 21 for observation only.
- **T10 deferral reversed.** T10 was first deferred under the Pivot Protocol (`6c8c8a3`). The user withdrew that before closing, and the dogfood ran in a fresh session (`08da1b6`).
- **Limits decision.** T4 and T5 settled how the Limits check treats heuristic caps: a draft over a heuristic cap is shortened or reported, never passed silently, and a heuristic never blocks the user's explicit choice.
- **Count amendment.** The T8b count was amended from ≥ 7 to ≥ 6 after an unexecuted prediction led to a padding paragraph.

## 11. Diagrams

The spec has no `diagrams/` folder or diagram slot, and no baseline diagram went stale.
