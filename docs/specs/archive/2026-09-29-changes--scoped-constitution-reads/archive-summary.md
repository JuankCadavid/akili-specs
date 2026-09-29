# Archive Summary — Scope the Worker Personas' Constitution Read

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/scoped-constitution-reads` |
| Archive Path | `docs/specs/archive/2026-09-29-changes--scoped-constitution-reads/` |
| Archive Date | 2026-09-29 |
| Branch | `master`. Branch Context is `default` and apply-capable: `AGENTS.md` pins `Default Branch: master`, and no `Integration Branch:` pin exists |
| Approval Mode | `gated` |
| Final Status | **Complete: 4/4 tasks PASS · validation 0 FAIL open · 10 WARN, accepted** |

## 2. Outcome

Implementer and Tester workers no longer read four documents whole before a task.

- They read the root guides (`CLAUDE.md`, `AGENTS.md`) whole.
- They read the TRD and the UX/UI design only at the sections the Leader's brief names.
- A six-row state table gives the worker one action for every state that naming can be in.
- `/akili-execute` and `/akili-test` now require the Leader to write that entry: named sections with the path, or the word `none`.

Expected load on one measured project falls from about 28,037 tokens to a computed range of 8,338 to 13,668. The range is computed from document sizes. It was not measured on token telemetry.

## 3. Requirements Delivered

| Req | Delivered by | Status |
|---|---|---|
| FR-1 Root guides read in full | T1 | ✅ |
| FR-2 Reference documents at named sections | T1 | ✅ |
| FR-3 Every state of the entry has an action | T1, and T1 reopened after validation | ✅ |
| FR-4 Implementer brief settles the entry | T2 | ✅ |
| FR-5 Tester slice settles the entry | T3 | ✅ |
| FR-6 Caching rationale removed | T1 | ✅ |
| FR-7 Reviewer and Leader unchanged | T1, T4 | ✅ |
| FR-8 CHANGELOG, migration note, mirrors | T4 | ✅ |
| NFR-1 to NFR-3 | T1 to T3 | ✅ |
| NFR-4 Expected load | T4 | ⚠️ The requirement's "about 9k–13k" differs from its own inputs (W-9) |

## 4. Files Changed

Shipped: 5 files, 35 insertions and 12 deletions against `3b66e40`.

| File | Change | Commit |
|---|---|---|
| `.claude/templates/implementer.md` | Item 1 first bullet replaced by the read rule and state table; heading renamed; *Aesthetics* bullet and report field 1 amended. S3 cell corrected after validation | `917880c`, `457599c` |
| `.claude/templates/tester.md` | Item 1 first bullet replaced; heading renamed; names no reference path | `917880c` |
| `.claude/commands/akili-execute.md` | Step 2.2: two brief bullets amended. Task entry field list: *issues encountered* names the lookup note | `70d5330` |
| `.claude/commands/akili-test.md` | Phase 1 item 2: the entry and its three rules. Phase 4: the Summary records the lookup note | `29d1171` |
| `CHANGELOG.md` | `Unreleased` → `### Changed` entry | `6dacabb` |

Spec documents added during the run: `execution.md`, `closure.md`, `test-report.md`, `validation-report.md` (`6dacabb`, `994794d`, `457599c`).

## 5. Test Evidence

| Item | Value |
|---|---|
| Status | PASS, with two accepted gaps |
| Suite | One integration suite, package delivery, run inline |
| Assertions | 217 passed on four install targets. 178 of them fail on the pre-spec package |
| Re-run after the S3 correction | 217 passed |
| Product bugs | 0 |

**What it proves:** the package delivers the new text to every target. **What it does not prove:** that a worker reads by section. No harness in this repository runs an agent against a persona.

## 6. Validation

| Item | Value |
|---|---|
| First verdict | Not archive-ready: 85 PASS, 10 WARN, 2 FAIL with one root cause |
| The FAIL | The Implementer's S3 row said "note it". FR-3 requires the report to state that the brief named no section |
| Remediation | T1 reopened; Reviewer PASS on its second attempt |
| Final verdict | Archive-ready, with accepted WARNs |
| Build | `verify:cli`, `pack:dry-run`, `install --dry-run`, both CI probe scripts and `git diff --check` at exit 0 |

## 7. Accepted Warnings And Follow-Ups

The user chose to fix only what blocked archive. These stay open.

| # | Item | Suggested route |
|---|---|---|
| 1 | W-1, W-2, W-5, W-6: four obligations carried by implication or by description in shipped text | `/akili-propose`, one small spec |
| 2 | W-7, W-8: two rows of the entry contract (`design.md` §7, *Section name* and *Extent of a section*) had no owning task and shipped nowhere | The same proposal |
| 3 | The range top in `CHANGELOG.md` assumes four sections of the largest size; real sections give about 12,820 tokens | `/akili-quick`, before the next release |
| 4 | W-9: NFR-4's "about 9k–13k" against a computed 8,338 to 13,668 | None. Recorded here; the spec is closed |
| 5 | Proposal Success Criterion 4 reads "under ~12k". The requirements gate replaced it with a range, and the proposal was not amended | None. Recorded here. See the Kaizen entry |
| 6 | Proposal Success Criterion 5 (Reviewer FAILs for token or convention violations do not rise) | Observe over the next two specs |
| 7 | This repository's deployed `.agents/implementer.md` and `.agents/tester.md` still carry the old sentence. `.agents/` is ignored by git | Manual edit, per the CHANGELOG's migration note |
| 8 | `closure.md`, the sentence after the §3a table, credits the Leader for the persona correction. The reopened T1's Implementer made it | None. Recorded here |

## 8. Constitution And Graph Sync

| Item | Result |
|---|---|
| `## Constitution Impact` notes in `execution.md` | None. No module was created or reshaped |
| Agent guide sync | Nothing owed |
| Factual-claims sweep of root `CLAUDE.md` and `AGENTS.md` | Run. No claim was falsified by this spec |
| TRD and ADR sync | Not applicable. This repository has no TRD |
| Spec family manifest | Not applicable. The spec is not a family member |
| CodeGraph | `.codegraph/` exists. A re-index is recommended: five files changed |

## 9. Historical Notes

| Note | Detail |
|---|---|
| Review rounds | 11, against a first budget of 6. The user extended the budget four times |
| Reviewer FAIL verdicts | 6: T1 two, T2 one, T3 one, T4 one, T1 reopened one |
| Evidence MISMATCH | 1: T4 attempt 2 reported two numbers the commands do not print |
| Defect found after a Reviewer PASS | 1: the S3 cell, found at validation |
| Judgment day | Round 1 corrected by the user's choice of *Fix only*; the corrections were not re-judged |
| Runtime events | One spawn failure on the first Implementer, recovered by an immediate retry |
| Kaizen entry | `docs/specs/kaizen/changes--scoped-constitution-reads.md` |
