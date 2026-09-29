# Kaizen Entry — changes/scoped-constitution-reads

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/scoped-constitution-reads` |
| Date | 2026-09-29 |
| Branch | `master` |
| Branch Context | **`default`, apply-capable**. `AGENTS.md` pins `Default Branch: master`. No `Integration Branch:` pin exists |
| Archive Run | 1 |
| Approval Mode | gated |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 4, plus T1 reopened after validation | tasks.md; execution.md §5 |
| Implementer attempts | 12 (T1 ×3, T2 ×2, T3 ×2, T4 ×3, T1 reopened ×2) | execution.md |
| Reviewer FAIL rework attempts | **6** (T1 ×2, T2 ×1, T3 ×1, T4 ×1, T1 reopened ×1) | execution.md |
| Evidence re-run MISMATCH | 1 (T4 attempt 2) | execution.md, T4 attempt 2 |
| HALTs / FATAL_FAILs | 0 | execution.md |
| Pivots | 0 | execution.md |
| PRODUCT_BUGs | 0 | test-report.md |
| Judgment-day severe findings | 1 confirmed by both judges (J-1); 2 more raised by both with split severity. All corrected before approval, not re-judged | judgment.md; design.md §11 |
| Validation FAIL / WARN | 2 / 10. The two FAILs share one root cause and were resolved; the WARNs were accepted | validation-report.md §2, §13 |
| Tasks closed under `REVIEW_WAIVED` | 0 | execution.md |
| Tasks closed under `REVIEW_SKIPPED` | 0. No task was `skip-eligible` | tasks.md §3; execution.md |
| Escaped defects (§3) | 0 by the definition, since no task was skipped. One defect did escape a Reviewer PASS and was found at validation (L1) | validation-report.md §6.1 |
| Budget delta | review rounds **11 vs 6**; shipped lines **35 insertions vs about 55**; tasks **4 vs 4**. The tripwire fired four times and the user extended the budget each time | design.md §9; execution.md |
| Runtime events | 1 spawn failure, recovered at rung 1 | execution.md, T1 attempt 1 |
| Drift attributable | — | `docs/specs/audits/` holds no report |

## Lessons

- **KZ-changes--scoped-constitution-reads-1 — A design table that restates a requirement's table can drop a clause, and every later check inherits the loss.** (Methodology, **Medium**)
  - **Root cause.** `requirements.md` FR-3 holds the state table. Its S3 Implementer cell reads "do a bounded lookup … and report that the brief named none". `design.md` DD-3 re-drew the same table and shortened that cell to "note it". From then on the design was the text everyone compared against. The Implementer shipped the design's cell. Three Reviewers found the shipped cell equal to the design's and passed it. The literal walk in `closure.md` recorded the outcome the requirement expects, which the text did not give. Two Reviewers saw the gap and recorded it as an ADVISORY, on the ground that it matched DD-3.
  - **Evidence.** `validation-report.md` §6.1 (F-1, F-2) and §2, *Why the defect survived*; `execution.md` T1 attempt 2 and attempt 3, ADVISORY blocks; `design.md` §12.
  - **Why it is not a duplicate.** KZ-changes--gate-falsifiability-2 tells the Reviewer to walk each FR statement and table term by term, and it was in every brief. It acts at review. This defect entered at specify time, in a document the review then trusted. The recurrence is recorded separately (P3).
  - **Standardization:** → P1.

- **KZ-changes--scoped-constitution-reads-2 — The review-round budget for a rules-document spec was set at one round per task plus a shared margin, and that under-runs.** (Methodology, Low)
  - **Root cause.** `design.md` §9 budgeted 6 rounds for 4 tasks: "one per task, plus two rework rounds". The same section noted that "restatement drift cost a round in four of the last five specs", and the number was not raised to match. Every task needed at least one rework round. The tripwire stopped the run four times for a decision whose answer was the same each time.
  - **Evidence.** `design.md` §9; `execution.md`, the three *Budget Tripwire* blocks and §5. Earlier overruns on the same kind of spec: `changes--opus-5-5-rebaseline.md` (7 vs 6), `changes--premise-ledger.md` and `changes--review-intensity-routing.md` (*Noted*).
  - **Standardization:** → P2.

## Noted, not a lesson

- **A Reviewer recorded a missing obligation as an ADVISORY, twice** (T1 attempts 2 and 3, the S3 note). The digest rule says a missing obligation is never an ADVISORY. Both Reviewers gave conformance to the design as the reason. Folded into L1 and P3.
- **A worker's report stated numbers the commands do not print** (T4 attempt 2: "3" for a check that reads 0). The tree and the evidence file were correct. The non-author re-run caught it, so the gate worked. Single occurrence. It cost one Implementer attempt and no review round.
- **The design's wording for a rule defeated the task's own falsifier.** DD-3's rule 2, "S1–S4 by what the entry says", names S4 outside its row, so deleting the S4 row leaves the check green. The Implementer reworded it. This is close to KZ-changes--leader-brief-contract-2 (a falsifier is run before it is written). Here the falsifier was sound and the design text was not walked against it. Single occurrence.
- **A proposal's success criterion outlived the requirement that replaced it.** Criterion 4 kept "under ~12k" after `requirements.md` restated the result as a range. The task's Done clause then asked for the criterion to be ticked. Candidate for a rule at the requirements gate if it recurs.
- **Two rows of a shared-contract table had no owning task** (`design.md` §7, *Section name* and *Extent of a section*). The coverage table in `tasks.md` is keyed on requirements and scenarios, so a design-only obligation has no row there. Found at validation (W-7, W-8). Single occurrence.
- **The delivery suite asserts that a row is present, not what it says.** It could not see the S3 defect. This is the limit the Reviewer persona already names for presence assertions.
- **An Implementer added a reason the spec does not give, and the reason was false** (T2 attempt 1). Near KZ-001. Caught by the Reviewer.
- **A walk falsifier was inspected and not re-run** in the last attempt of the reopened T1. The worker said so, and the text it depends on had not changed.
- **A shell command passed the installer's options as one argument** during `/akili-test`, and a file-name match skipped `SKILL.md` copies. Both were the Leader's and were fixed before any result was recorded.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | `standardization` |
| Target | `.claude/commands/akili-specify.md` — Step 2.2 *Guidelines*, after *A named mechanism is checked against the moment it must act* |
| Edit | **A design table that restates a requirement's table keeps every cell's obligations.** When the design re-draws a table the requirement holds (states and actions, fields, outcomes), compare each cell with the requirement's cell before approval; a shortened cell still names every obligation of the cell it shortens. Reviewers audit shipped text against the design, so a clause dropped here ships and passes. |
| Severity | Medium |
| Status | `applied (2026-09-29)` |

### P2

| Field | Value |
|---|---|
| Kind | `standardization` |
| Target | `.claude/commands/akili-specify.md` — Step 2.4, after the three-numbers sentence |
| Edit | **Review rounds for rules documents.** When the tasks edit text that other agents execute (personas, commands, templates), estimate two review rounds per task. One round per task plus a shared margin has under-run on such specs, and each overrun stops the run for the user. |
| Severity | Low |
| Status | `applied (2026-09-29)` |

### P3

| Field | Value |
|---|---|
| Kind | `digest-update` |
| Target | `KZ-changes--gate-falsifiability-2` |
| Edit | Add `changes/scoped-constitution-reads` as a source spec and append the recurrence note: three Reviewer FAILs on content held in a sentence or a table row; a fourth case passed three Reviewers and a walk because the design's own cell had dropped the clause, was recorded twice as an ADVISORY, and was found at validation. Points to KZ-changes--scoped-constitution-reads-1 for the specify-time root cause. Severity stays **High** |
| Severity | High |
| Status | `applied (2026-09-29)` |

### P4

| Field | Value |
|---|---|
| Kind | `digest-update` |
| Target | `KZ-changes--kaizen-loop-closure-2` |
| Edit | Add `changes/scoped-constitution-reads` as a source spec and append: the Leader's own correction-closure sweep searched the exact cell wording and missed two abridged, lower-case sites in `closure.md`, costing a review round. Severity stays **High** |
| Severity | High |
| Status | `applied (2026-09-29)` |

### P5

| Field | Value |
|---|---|
| Kind | `digest-update` |
| Target | `KZ-002` |
| Edit | Add `changes/scoped-constitution-reads` as a source spec and append: a CHANGELOG sentence claimed silence on a topic while stating it; `closure.md` recorded an outcome the shipped text did not give and quoted design text as shipped; the Leader's execution summary stated three wrong totals. Severity stays **Medium**. The row's `Deferred` target is unchanged |
| Severity | Medium |
| Status | `applied (2026-09-29)` |

## Constitution Sync (Step 3 of `/akili-archive`)

| Item | Result |
|---|---|
| Agent guide sync | Nothing owed. `execution.md` holds no `## Constitution Impact` block |
| Factual-claims sweep | Run over root `CLAUDE.md` and `AGENTS.md`. No claim was falsified by this spec. No item recorded |
| TRD and ADR sync | Not applicable. No TRD exists |

## Apply Pass (2026-09-29)

The user chose **Apply all** on `master`. The recommendation was Apply all because two of the recurrences sit on High rows.

| Step | Result |
|---|---|
| Collect | 5 items, all from this entry. The other ten entry files hold no pending or deferred item |
| Re-verify | All probes held. P1 and P2: both anchor sentences exist once in `akili-specify.md`, and neither new rule was already there. P3 to P5: each digest row exists once |
| Written | P1 and P2 to `.claude/commands/akili-specify.md`, with two lines under `CHANGELOG.md` → `Unreleased`, since the file ships in the package |
| Digest | P3, P4 and P5 merged into their rows. Rows added for L1 and L2 |
| Upstream | No `upstream` item, so no upstream report. This repository is the methodology, so Methodology lessons are standardized here directly, as in earlier entries |

**Retirement, and a deviation from the rule.** The digest stood at 10 rows and gained 2. Two `Applied` rows were retired: `KZ-changes--premise-ledger-1` and `KZ-changes--review-intensity-routing-1`. Both are dated 2026-09-29, so they are **not** the rows institutionalized longest, which is what the skill's rule asks for. The older `Applied` rows are `KZ-001`, `KZ-changes--leader-brief-contract-1` and `KZ-changes--leader-brief-contract-2`. Each of those has recurred, and the first two were copied into this spec's briefs. The two retired rows are single-occurrence rules whose text already lives in `/akili-specify` Step 2.2. The tie-break was recurrence, the same one the previous apply pass used and recorded. The user approved "Apply all"; the choice of which rows to retire was the Leader's and is open to reversal.
