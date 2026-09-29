# Validation Report — Scope the Worker Personas' Constitution Read

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/scoped-constitution-reads` |
| Date | 2026-09-29 |
| Tree validated | `6dacabb` on `master` |
| Baseline | `3b66e40` |
| Depth | Standard |
| Auditor | One independent audit agent on `opus`, fresh context, read-only. The implementation was authored on `sonnet` |
| Report written by | The session Leader, from the audit's findings. Each FAIL and each figure mismatch was re-checked at its source before it was recorded |
| Inputs | `proposal.md`, `requirements.md`, `design.md`, `tasks.md`, `execution.md`, `closure.md`, `test-report.md`, and the five shipped files |

## 2. Summary

**Verdict: not archive-ready. One defect remains, and it is small.**

The Implementer persona's S3 row does not tell the worker to report that the brief named no section. FR-3 requires it twice: in the state table, and in a scenario's `AND IT MUST` clause. The fix is one table cell.

| Result | Count | What |
|---|---|---|
| PASS | 85 | Clauses of FR-1 to FR-8, NFR-1 to NFR-4, `design.md` §7 and DD-1 to DD-10 |
| WARN | 10 | Six in shipped text, three in spec documents, one explained design drift |
| FAIL | 2 | One root cause (F-1, F-2) |
| BLOCKED | 0 | — |
| Figure and evidence mismatches | 8 | Three corrected in this run; five open |

| Phase | Result |
|---|---|
| Task completion | PASS |
| File existence | PASS |
| Build integrity | PASS |
| Requirement coverage | **FAIL** (F-1, F-2) |
| Quality audit | WARN |
| Design conformance | WARN |
| Test evidence | WARN |

**Why the defect survived three Reviewers and a literal walk.** The design's DD-3 table shortened the requirement's cell to "note it". Each Reviewer compared the shipped cell with DD-3, found them equal, and passed it. Two of them recorded the gap as an advisory. The walk in `closure.md` then recorded the outcome the requirement expects, not the one the text gives.

## 3. Task Completion

| Task | Status | Closing record | Attempts | Evidence in `execution.md` | Result |
|---|---|---|---|---|---|
| T1 | `[x]` | Reviewer PASS, attempt 3 | 3 | Every attempt, both FAIL reports verbatim, re-run VERIFIED on each | PASS |
| T2 | `[x]` | Reviewer PASS, attempt 2 | 2 | Same | PASS |
| T3 | `[x]` | Reviewer PASS, attempt 2 | 2 | Same | PASS |
| T4 | `[x]` | Reviewer PASS, attempt 3 | 3 | Same, plus one evidence MISMATCH on attempt 2 | PASS |

No task was skipped or waived. No HALT and no Pivot. The review-round budget was extended twice by the user, from 6 to 8 and then to 9, and both extensions are recorded.

## 4. File Existence

| File (`design.md` §2) | Expected | Found | Result |
|---|---|---|---|
| `.claude/templates/implementer.md` | Modified | Modified, +15 −4 | PASS |
| `.claude/templates/tester.md` | Modified | Modified, +13 −2 | PASS |
| `.claude/commands/akili-execute.md` | Modified | Modified, +3 −3 | PASS |
| `.claude/commands/akili-test.md` | Modified | Modified, +2 −1 | PASS |
| `CHANGELOG.md` | Modified | Modified, +2 −2 | PASS |
| Any other path outside `docs/specs/` | None | None | PASS |

`reviewer.md` and `leader.md` match their baseline hashes (FR-7). No hunk in `bin/`, `scripts/`, `package.json`, `akili-constitution.md`, `akili-audit.md` or `docs/commands/`.

## 5. Build Integrity

This repository has no compiler, type-checker or linter. Its build checks are the installer's commands and the CI scripts.

| Command | Result |
|---|---|
| `npm run verify:cli` | exit 0 |
| `npm run pack:dry-run` | exit 0 |
| `node bin/akili.js install --tool all --dry-run` | exit 0 |
| `node scripts/ci/install-symlink-probe.js` | exit 0 |
| `node scripts/ci/install-layout-regression.js` | exit 0. Layout identical, with the expected source differences |
| `git diff --check 3b66e40 HEAD` | exit 0 |

**Not run:** the CI step `install --tool all --force`. It writes to the user's real configuration directories. `test-report.md` covers the same ground with an install into scratch directories.

**Environment boot:** not applicable. No `docs/infrastructure.md` exists, and the spec needs no running stack.

## 6. Requirement Coverage

### 6.1 FAIL

| ID | Clause | Shipped text | File | Class |
|---|---|---|---|---|
| F-1 | FR-3, state table, S3, Implementer: "do a bounded lookup for the sections the task's scope touches, and **report that the brief named none**" | "Resolve the path (default, then legacy). Section lookup for what the task touches; note it" | `.claude/templates/implementer.md`, S3 row | Design defect, carried into the implementation |
| F-2 | FR-3, scenario *A silent brief and a UI task (S3)*: "AND IT MUST state in its report that the brief named no section" | The same row. The note is defined as "records what was read". No shipped sentence requires it to say the brief was silent | Same | Implementation, and evidence |

`grep -c "named none\|named no section" .claude/templates/implementer.md` reads 0.

### 6.2 WARN

| ID | Clause | Finding | File | Class |
|---|---|---|---|---|
| W-1 | FR-3, S2 → S6: "AND IT MUST report the mismatch" | Carried only by implication, in "in a brief/work mismatch alike" | `implementer.md` | Implementation |
| W-2 | FR-3, the note: "not a reason to write the field the Leader reads as 'task not complete'" | The Tester's text says "never a reason to change the report shapes below". It does not rule out `FAIL` or `TEST_GAP` | `tester.md` | Implementation |
| W-3 | FR-3, S5, Tester | Rule (1) names the default and legacy paths, and the persona names neither | `tester.md` | Spec. Accepted at judgment day (J-2) |
| W-4 | FR-2: "SHALL NOT contain two sentences…" | The untouched item 4 sentence "read past the section you came for" sits in the same persona as "never the whole document" | `implementer.md` | Implementation, low |
| W-5 | FR-4: "the Leader SHALL record it" | Shipped as a description: "is one thing this field holds" | `akili-execute.md` | Implementation |
| W-6 | `design.md` §7, *Path*: "The Leader resolves it, legacy paths included" | Present in `akili-test.md`, absent from `akili-execute.md` | `akili-execute.md` | Implementation |
| W-7 | `design.md` §7, *Section name* | No command carries it, and no task owned it | Both commands | Spec and task gap |
| W-8 | `design.md` §7, *Extent of a section* | No persona defines it. The lookup reads "only the one", singular | Both personas | Spec and task gap |
| W-9 | NFR-4: "about 9k–13k" | Its own inputs give 8,338 to 13,668 | `requirements.md` | Spec document |
| W-10 | DD-3, rule 2: "S1–S4 by what the entry says" | Shipped as "act on whichever row above the entry actually matches". Explained in `execution.md`. Same meaning; "above the entry" can be misread | Both personas | Design drift, explained |

### 6.3 PASS, by requirement

| Requirement | Clauses checked | Result |
|---|---|---|
| FR-1 | Full read of root guides; missing guide skipped; the `BUT` clause | PASS |
| FR-2 | Named sections, verbatim; *Aesthetics* obligation kept | PASS, with W-4 |
| FR-3 | Six rows per persona; S5 path resolution; no-match; Tester names no path; five scenarios | **FAIL** on S3 (F-1, F-2); WARN W-1, W-2, W-3 |
| FR-4 | Entry per document; omitted invalid; non-host bullets; the note recorded | PASS, with W-5, W-6 |
| FR-5 | Entry; omitted invalid; UI suite rule; both scenarios; the note recorded | PASS |
| FR-6 | No caching rationale; Step 0 sentence kept | PASS |
| FR-7 | `reviewer.md` and `leader.md` unchanged | PASS |
| FR-8 | All three bullets; the scenario's two clauses; mirrors | PASS |
| NFR-1 | +1,826 of 2,000 bytes; +1,416 of 1,500 | PASS |
| NFR-2, NFR-3 | No host tool name; no line-number pointer | PASS |
| NFR-4 | Expected load | WARN W-9 |

**Task coverage.** Every scenario and clause in `tasks.md` §3 has a named owner. Every Scope bullet of T1 to T4 has shipped evidence, except the content F-1 names.

## 7. Linting & Code Quality

No linter applies to prose. `git diff --check` is clean.

**4R lens findings (advisory; none drives the verdict):**

| Lens | Finding | Source |
|---|---|---|
| Readability | "whichever row above the entry" can be read as the row positioned above | T1 attempt 1; still true |
| Readability | The Tester's note sentence omits "not an assumption" | T1 attempt 1; still true |
| Readability | The CHANGELOG's path parenthetical sits under "Both personas", and the Tester names no path | T4 attempt 1; still true |
| Readability | "a slot each report already has" covers a record, not a report | T4 attempt 1; still true |
| Readability | "only at the sections the brief names" reads as absolute, ahead of a table that allows lookups | T4 attempt 3; still true |
| Readability | The Implementer's item 1 is one dense paragraph | New |
| Risk | `design.md` and `docs/ux-ui/design.md` now sit in adjacent bullets of Step 2.2 | New |
| Risk | A Tester in a UI suite that gets an omitted entry from an older command copy reads nothing | New |
| Resilience | This repository's deployed `.agents/` personas still carry the old sentence | Recorded in `execution.md` |

The advisory "S3 'note it' does not require stating the brief's silence" (T1 attempts 2 and 3) is no longer advisory. It is F-1.

## 8. Design Conformance

| Check | Result |
|---|---|
| Shipped text against DD-1 to DD-10 | PASS, with W-10 |
| Non-changes of DD-10 | PASS. All left alone |
| Proposal scope and non-goals | PASS |
| Success Criteria 1 and 2 | Met |
| Success Criterion 3 | Met, carrying F-1: the fallback is stated, and one of its actions is incomplete |
| Success Criterion 4 | Not met as literally worded. Low severity: the requirements gate replaced "under ~12k" with a range |
| Success Criterion 5 | Not evaluable in this spec |

**Cross-document figure check:**

| Figure | Where | True value | Result |
|---|---|---|---|
| Five packaged files | `design.md` | 5 | Match |
| Persona sizes and growth | `tasks.md`, `execution.md`, `test-report.md` | 8,805 → 10,631; 7,451 → 8,867 | Match |
| 112,149 bytes; 27 sections; 822 to 5,740 bytes | `requirements.md` §4 | Re-measured by the auditor on STAR at `f25270d4` | Match |
| Review rounds 9 = 3 + 2 + 2 + 2 | `execution.md` | 9 | Match |
| 217 assertions; 26 files; 271 installed | `test-report.md` | Reconstructed by the auditor | Match |
| "36 insertions" | `execution.md` §3 | 35 | **Corrected in this run** |
| "Six Reviewer FAILs" | `execution.md`, two sites | 5, plus one MISMATCH | **Corrected in this run** |
| "Four were content in a sentence or row" | `execution.md` §3 | 3 | **Corrected in this run** |
| Range top, 13,668 tokens | `CHANGELOG.md`, `closure.md` | The arithmetic is right. It assumes four sections of 5,740 bytes, and STAR has one. The four largest real sections give about 12,820 | Open: overstated by about 850 |
| "about 700 under the low end" | `closure.md` §8 | 662 | Open, minor |
| The quoted text for "S5 then S6" | `closure.md` §3 | The quote is `design.md` DD-3 text, not shipped text | Open: evidence mismatch |
| The `akili-test` quote | `closure.md` §4 | It is the attempt 1 wording, without the path clause | Open: stale |
| H2 outcome: "notes the brief named none" | `closure.md` §3 | The shipped text does not say it (F-2) | Open |

## 9. Test Evidence Summary

Reused from `test-report.md`; not re-derived.

| Item | Value |
|---|---|
| Overall status | PASS, with two accepted gaps |
| Suites | 1, integration, run inline |
| Assertions | 217 passed; 178 of them red on the pre-spec package |
| `PRODUCT_BUG`, `FAIL`, flaky | None |
| Accepted gaps | G-1 worker and Leader behavior; G-2 the token saving. Both accepted in `requirements.md` §8 |

**Limit of this evidence, as it bears on F-1.** Every assertion is a presence check. The suite asserts that row `S3` exists; it cannot see what the row says. The F-1 gap is invisible to it. The report is not stale, and it is uncommitted.

## 10. Agent Guide / Constitution Impact

`execution.md` holds no `## Constitution Impact` block. No module was created or reshaped, and no guide index needs an update.

| Item | State |
|---|---|
| Root `AGENTS.md` | Still accurate. Its persona description does not restate the read rule |
| Deployed `.agents/implementer.md`, `.agents/tester.md` in this repository | Stale against the templates. Ignored by git, outside the spec. Pending for `/akili-archive` or a manual edit |
| CodeGraph | Re-index pending at archive; five files changed |

## 11. Remediation

| # | Item | Severity | Action | Owner |
|---|---|---|---|---|
| R-1 | F-1, F-2 | **Blocks archive** | Change the Implementer's S3 cell so the note states that the brief named none. About 25 bytes, against a 174-byte margin | Implementer → Reviewer, as a reopened T1 |
| R-2 | `closure.md`: H2 outcome, the "S5 then S6" quote, the §4 quote, "700" | Evidence | Re-walk H2 against the corrected text; replace the two quotes with shipped text; correct the figure | With R-1 |
| R-3 | W-1, W-2, W-5, W-6 | Minor | One clause each. Optional; can ride with R-1 if the user reopens the spec for them | User decides |
| R-4 | W-9; the range top in `CHANGELOG.md` | Minor | Correct NFR-4 to its computed range. State the range top from real section sizes, or label it as an upper bound | User decides |
| R-5 | W-7, W-8 | Spec gap | No task owned these rows of §7. Record for the Kaizen retrospective, or a follow-up proposal | Archive |
| R-6 | W-3, W-4, W-10 | Accepted | None | — |
| R-7 | Success Criterion 4 | Record | Annotate `proposal.md` §13 at archive with the superseding range | Archive |

**Spec drift recommendation.** F-1 is a design-document defect first: DD-3's S3 cell dropped a clause that FR-3 holds. Correct the implementation to match the **requirement**, and correct DD-3's cell with it, under correction closure.

**Scope note.** R-1 reopens approved work for a defect against an approved requirement. It adds no scope. R-3, R-4 and R-5 are different: they are choices about how far to go, and none is made here.

## 12. Archive Readiness Recommendation

**Not ready.** One FAIL is unresolved.

| Criterion | State |
|---|---|
| All required tasks `[x]` | Yes |
| No FAIL unresolved | **No**: F-1, F-2 |
| WARN findings accepted or followed up | Pending the user's decision on R-3, R-4, R-5 |
| Tests cover key requirements | Delivery, yes. Behavior, no: accepted gaps G-1 and G-2 |
| Drift reflected in the spec documents | W-10 is explained. F-1's design defect is not yet corrected |
| User has reviewed this summary | Pending |

After R-1 and R-2 land and pass review, the spec is archive-ready with accepted WARNs:

```text
/akili-archive changes/scoped-constitution-reads
```
