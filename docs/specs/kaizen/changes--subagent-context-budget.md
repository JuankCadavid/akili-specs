# Kaizen Entry — changes/subagent-context-budget

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/subagent-context-budget` |
| Date | 2026-09-30 |
| Branch | `master` |
| Branch Context | **`default`, apply-capable**. `AGENTS.md` pins `Default Branch: master`. No `Integration Branch:` pin exists |
| Archive Run | 1 |
| Approval Mode | pre-approved |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 5 | tasks.md |
| Implementer attempts | 13, plus 1 continuation (T1 ×2, T2 ×1, T3 ×5, T4 ×2, T5 ×3) | execution.md |
| Reviewer FAIL rework attempts | **9** (T1 ×1, T3 ×4, T4 ×1, T5 ×2) | execution.md |
| Evidence re-run MISMATCH | 0 | execution.md |
| HALTs / FATAL_FAILs | 1 HALT (T3, lifted by the user) / 0 | execution.md `## HALT: T3` |
| Pivots | 1 (T2, NFR-1 byte caps; raised by the user) | execution.md `## Pivot Record: T2` |
| PRODUCT_BUGs | n/a — no `/akili-test` run, no test gate | — |
| Judgment-day severe findings | 11 raised by both judges, 9 more confirmed at the source; 20 of 22 rows fixed, not re-judged | judgment.md |
| Validation FAIL / WARN | 0 / 6, all accepted | validation-report.md §11 |
| Tasks closed under `REVIEW_WAIVED` | 0 | execution.md |
| Tasks closed under `REVIEW_SKIPPED` | 0. No task was `skip-eligible`; all five `full` | tasks.md; execution.md |
| Escaped defects (§3) | 0 by the definition. Two Reviewer PASSes preceded a defect found by a later Reviewer on the same task (T3, the fall-through and the cap sentence) — within the task, not escaped | execution.md T3 |
| Falsifier execution rate | 5 of 5 tasks executed their falsifier and observed red; in 3 attempts the author omitted it and the Leader executed it inline (T3 a3 via continuation, T3 a5, T4 a2) | execution.md |
| Budget delta | review rounds **14 vs 10**; lines 148 insertions vs ~140; tasks 5 vs 5. The overrun was accepted by the user at T3's fifth attempt | design.md §9; execution.md §3 |
| Runtime events | 1 spawn failure before the P-13 experiment (tmux pane), recovered at rung 1 by re-spawn without a name | session |
| Drift attributable | — | `docs/specs/audits/` holds no report |

## Lessons

- **KZ-changes--subagent-context-budget-1 — A rules-document task with many edit sites in more than one file cannot be reviewed in one pass; each review reads a different sentence.** (Methodology, **Medium**)
  - **Root cause.** T3 carried 17 sites across `akili-execute.md` and `leader.md`. Five Reviewers each found one real, one-sentence defect, and three of those existed since attempt 1 — a fresh Reviewer reads the whole loop and stops at the first contradiction it meets, so the sites it never reached stay unread. The task's size, not the Implementer's quality, set the round count: attempts 4 and 5 each changed under ten words.
  - **Evidence.** `execution.md` T3 (attempts 1–5, `## HALT: T3`, the Leader's hypothesis); `design.md` §7.1 rows 9–17, 20–22 (the site list).
  - **Why it is not a duplicate.** KZ-changes--scoped-constitution-reads-2 budgets two rounds per task for rules documents; it sizes the budget, not the task. This lesson bounds the task so the budget can hold.
  - **Standardization:** → P1.

- **KZ-changes--subagent-context-budget-2 — A numeric cap written at the requirements gate, before the content it bounds exists, is not re-measured against the drafted design.** (Methodology, Low)
  - **Root cause.** NFR-1's byte caps (2,500 / 900 / 1,200) were set from the persona sizes before DD-7 and DD-8 were written. Judgment day added rows to both blocks. `design.md` §11 named the risk ("the caps are tight") and Step 2.4 re-sized the budget but not the cap. T1's attempt 1 then met its share by compressing away four obligations (a review round), and T2 was infeasible at 884 bytes against a 1,491-byte draft (a Pivot).
  - **Evidence.** `execution.md` T1 attempt 1 and `## Pivot Record: T2`; `requirements.md` §10 C1; `design.md` §11.
  - **Standardization:** → P2.

- **KZ-002 recurred** — seven of T5's eight FAIL findings were CHANGELOG clauses that overstated or misquoted the shipped text; each was caught by quote-checking the clause at HEAD. → P3 (digest-update).

## Noted, not a lesson

- **Implementers omitted the executed falsifier in three attempts** (T3 attempt 3, T3 attempt 5, T4 attempt 2) while the edit itself was correct. One continuation and two Leader-inline runs recovered it. A report-shape omission, not a defect class; watch for recurrence.
- **A falsifier stayed green because the rule had two homes** (T3 attempt 2: the paragraph and the loop sketch). The Reviewer judged the redundancy acceptable under NFR-2; the attempt 3 walks deleted the rule in every home and flipped. Candidate rule if it recurs: a falsifier deletes the rule everywhere the design says it lives.
- **The Leader's brief quoted a baseline for the wrong grep pattern** (T4: B15's `checkpoint\|respawn` cited as `checkpoint`). The author re-ran the baseline before editing, per KZ-002, and flagged it.
- **A design count went stale through a correction** (DD-6 "six fields" after L-16 added a seventh). Found by the T3 Implementer, fixed at execute time. Single occurrence of the Correction Closure sweep missing a count.
- **The reversion challenge (one reviewer, one question) earned its cost**: 13 points, 9 design changes, before judgment day's two judges found 22 more. Both stages found defects the other did not.
- **This spec is a fourth trial spec for the conditional Reviewer with zero skips**; every task tripped override (a). Recorded for `changes/review-intensity-trial-terms`, paused at its Phase 1 gate.
- **The run itself measured what the spec bounds**: Implementer spawns used 12–59 tool calls and 84k–199k tokens each on prose edits; under the shipped rules, the 59-call spawn would have checkpointed.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | `standardization` |
| Target | `.claude/commands/akili-specify.md` — Step 3.2, *Task quality rules*, after "one task should be small enough to complete and verify in one focused session" |
| Edit | **A task that edits rules text is bounded by what one review can read.** When a task's scope lists more than about eight edit sites, or sites in more than one rules document (a command, a persona, a template), split it per file: each Reviewer reads the changed text whole and stops at the first contradiction, so sites past that point are unread, and a five-round task costs more than two three-round tasks (`changes/subagent-context-budget`, T3: 17 sites, two files, five rounds, three defects present from attempt 1). |
| Severity | Medium |
| Status | `pending` |

### P2

| Field | Value |
|---|---|
| Kind | `standardization` |
| Target | `.claude/commands/akili-specify.md` — Step 2.4, after the review-rounds sentence for rules documents |
| Edit | **A cap set before its content is re-measured here.** When a requirement fixes a numeric cap on an artifact the design has now drafted (bytes of a persona, lines of a file, count of rows), draft the content plainly and measure it before the design gate; a cap that does not hold is raised or the content is cut here, never met later by compressing obligations away (`changes/subagent-context-budget`: one review round and one Pivot). |
| Severity | Low |
| Status | `pending` |

### P3

| Field | Value |
|---|---|
| Kind | `digest-update` |
| Target | `KZ-002` |
| Edit | Add `changes/subagent-context-budget` as a source spec and append: seven of eight FAIL findings on the CHANGELOG task were clauses that overstated or misquoted the shipped text (an exit condition, a file location, "kept whole", a rounded percentage, "per attempt" for a per-spawn line); each was caught by quote-checking the clause at HEAD, and none by a grep. Severity stays Medium; recurrence count 4. |
| Severity | Medium |
| Status | `pending` |

## Constitution Sync (Step 3 of `/akili-archive`)

| Item | Result |
|---|---|
| Agent guide sync | Nothing owed. `execution.md` holds no `## Constitution Impact` block |
| Factual-claims sweep | Run over root `CLAUDE.md` and `AGENTS.md` at `31fac9e`. The *Multi-Agent Harness* bullet ("a hard 3-attempt rework ceiling") stays true: a checkpoint consumes no attempt. No claim falsified; no item recorded |
| TRD and ADR sync | Not applicable. No TRD exists |
| Spec family | Not a manifest-listed child |
| CodeGraph | `.codegraph/` exists; a re-index is recommended after the archive move |
