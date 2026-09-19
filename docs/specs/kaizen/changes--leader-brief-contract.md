# Kaizen Entry — changes/leader-brief-contract

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/leader-brief-contract` |
| Date | 2026-09-19 |
| Branch | master (Branch Context: `default`, apply-capable — no `Integration Branch:` pin in this repo) |
| Archive Run | 1 |
| Approval Mode | gated — the Standardize menu is presented to the user at this archive; statuses below are stamped after the answer |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 6 (no task added; T2 re-opened once for an owed clause) | tasks.md |
| Reviewer FAIL rework attempts | 2 (T1 ×1, T6 ×1) — 10 verdicts total | execution.md — T1 attempt 1, T6 attempt 1 |
| HALTs / FATAL_FAILs / tripwires | 0 / 0 / 0 | execution.md §3 |
| Pivots | 1 (T6 → FR-4 mid-climb rule, DD-12, T2 owed clause) | execution.md — ## Pivot Record: T6 (2026-09-19) |
| Tasks closed under `REVIEW_WAIVED` (by flag) | 0 | execution.md |
| Leader pre-review returns | 4 (7 items) — no Reviewer round consumed | execution.md — T2, T3, T2 (re-opened) |
| Execute-time spec edits | 3 (T2 v5, T3 v1 baselines; FR-4 clarification) | execution.md — T2, T3, T2 (re-opened) Decisions |
| PRODUCT_BUGs | n/a — no `test-report.md` (absence accepted; prose-only spec) | archive-summary.md §4 |
| Judgment-day severe findings | not run (draft mode) | design.md Document Control |
| Validation FAIL / WARN | n/a — no `validation-report.md` (absence accepted) | archive-summary.md §5 |
| Closure walkthrough | attempt 1: worker 7/7 PASS, Reviewer 6 CONFIRMED + 1 INCONCLUSIVE → Pivot; attempt 2: 0 INCONCLUSIVE over seven cases | t6-walkthrough.md |
| Runtime events | 1 provider-limit death → resume-by-message; 1 report truncation → tail by message; no attempt consumed | execution.md — T2, T5 |
| Drift attributable | no audit report exists under `docs/specs/audits/` | — |

## Lessons

- **KZ-changes--leader-brief-contract-1 — A rule inserted into an existing paragraph was contradicted by the sentence it sat next to; a prose warning did not prevent the repeat, and no sweep looked for it.** (Methodology, Medium)
  - Root cause: the Implementer adds the new sentence and verifies *its* words landed; the paragraph's surviving verb or subject was written for the old rule and is never re-read ("the first line is `STATUS:`" beside "It must conclude with either:"). The pre-review restatement sweep (KZ-changes--kaizen-loop-closure-2) greps for the superseded rule **restated elsewhere**; this is the inverse — a neighbour inside the same paragraph that was never a restatement, so neither the task's sweep pattern nor the greps target it. It cost T1's only FAIL; the T3 brief then warned about it by name and the T3 Implementer shipped the identical defect in `reviewer.md` ("Conclude with one of three statuses:"), caught only because the Leader read the diff. Same family, same run: T2 shipped the task's instruction verb as rule text ("decisions made — gains…") and T3 broke a comma list with an em-dash insertion.
  - Evidence: execution.md — T1 attempt 1 (Reviewer FAIL issue 1; Issues row "an in-file coherence defect no task grep targets"), T3 Leader pre-review return item 1 and Issues row, T2 Leader pre-review return item 3, T3 item 3.
  - Related, not a recurrence: KZ-changes--kaizen-loop-closure-2 (the restatement-elsewhere sibling).
  - Standardization: → P1

- **KZ-changes--leader-brief-contract-2 — A task's `Falsifier` and verification counts asserted pre-change readings nobody had run, and an expected-outcome column was written before the rule that would produce it.** (Methodology, Medium)
  - Root cause: at `/akili-specify` the task author wrote "the pre-change file: grep 5 hits 'matching PASS evidence' alone" (the file held two hits), "`grep -n "narrow"` — 1 hit" (the file already held two), and a Case 2 outcome `→ retry-after-N` that no literal walk reaches (rung 2's one retry is spent when the third event arrives). A `Falsifier` that names a present-tense reading is a factual claim about the tree, and it was composed from intent rather than executed. Cost: two execute-time amendments to `tasks.md`, each needing Leader adjudication and a named Reviewer check for two tasks; and the unexecuted expected outcome pulled the T6 worker to a PASS the text did not support — the immediate trigger of the closure FAIL.
  - Evidence: execution.md — T2 Decisions (verification 5 amendment; Implementer's note that "the task's own Falsifier note… is itself imprecise against the actual pre-change file"), T3 Decisions (verification 1 amendment, HEAD count = 2), T6 attempt 1 Reviewer FAIL ("decided by the task's Expected column, not by shipped text… internally strained"), Pivot Record "Consequence the user should see".
  - Related: `changes--gate-falsifiability` Noted "Verification wording" (`grep -c` counted lines) — first sighting there; this is the recurrence that raises it to a lesson. KZ-001 (a quotation is a claim of byte identity) is the quotation-side sibling.
  - Standardization: → P2

- **Recurrence — KZ-changes--gate-falsifiability-2 (requirement content dropped in shipping and passed by a full Reviewer sweep).** Not duplicated as a lesson: recorded as a `digest-update` pending item. This spec's instance: FR-4's terminal-branches paragraph and design §5.4's "Enters ladder at" column never reached the command; T2's Reviewer, briefed to walk each FR statement term by term, PASSed it "term for term" — the walk covered the statement and the ladder table and stopped before the paragraph *after* the table. Found only at the closure gate, where it cost the Pivot. Severity raised Medium → **High** (caused a Pivot).
  - Evidence: execution.md — T6 attempt 1 Reviewer FAIL ("Neither shipped: fixed-string search… returns zero hits… task defect"), Leader adjudication ("the same defect class the `gate-falsifiability` retrospective recorded… recurring one spec later").
  - Standardization: → P3

## Noted, not a lesson

- **Spec gap found at the closure gate:** FR-4 specified a ladder per role and an entry rung per event kind but never walked a *sequence* of two different events through it. Sibling of KZ-changes--kaizen-loop-closure-1 (new enumerated values walk their consumers): a new state machine should be walked with at least one multi-event sequence at design time. First sighting in this form.
- **"Derive first, compare last"** in the attempt-2 brief fixed the expected-column pull: the worker derived each outcome from quoted shipped sentences before opening the column. Positive practice; becomes a brief rule if lesson 2's standardization does not cover it.
- **A Pivot's Correction Closure swept the spec folder, not `CHANGELOG.md`** — the T5 entry went stale by omission when the Pivot added user-facing behavior; caught by the T6 attempt-2 Reviewer's advisory. First sighting; one clause in the Pivot Protocol's step 3 if it recurs.
- **The Leader continued past `gated` gates on an unattended chained run** (after PASS only; stopped at the first exception; every gate logged). It worked, and it is a mode the methodology does not define — the honest options today are `pre-approved` or presence. Not distilled: the user chose the launch shape; worth a decision, not a rule inferred from one run.
- **Diff delivery deviation:** the Leader delivered 127- and 88-line diffs by scratchpad path while the shipped rule says ≤ 300 lines inline — output-token economy with a fallback-path Reviewer holding `Read`. The 300-line threshold may be high for the inline side when the Leader pays for it as output; one data point.
- **Reviewer-row scoping of the death branch** and the three T2 READABILITY advisories — follow-ups listed in archive-summary.md §7.
- **Positive:** requiring each `-`/`+` pair to be shown (not just a grep result) caught a deleted NFR-8 invariant sentence the Implementer had judged in scope (T2 pre-review item 1).
- `Kind: upstream` does not apply in this repository: it *is* the methodology, so Methodology lessons take local edits here (precedent: every entry file in this folder).

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `.claude/templates/leader.md` — item 4, the *Pre-review restatement sweep (rules documents)* bullet (append) |
| Edit | Append: The sweep also reads **every paragraph that received an insertion, whole**: a surviving verb, subject or list structure written for the old rule that now contradicts the inserted one ("the first line is X" beside "must conclude with…"), or the task's instruction verb shipped as rule text ("gains", "+1 clause"), is the same non-conformance — a warning in the brief does not prevent it; the read does. |
| Severity | Medium |
| Status | pending |

### P2

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `.claude/commands/akili-specify.md` — Step 3.2, Falsifiability block, rule 1 (append one sentence) |
| Edit | Append to rule 1: A `Falsifier`, a verification count, or an expected outcome that states a **present-tense reading** ("the pre-change file: grep = 1", "1 hit", "→ rung 2") is **run or walked before it is written** — the count names its baseline (pre-existing hits enumerated), and an expected outcome is derived from the text the task will ship, never from the intent behind it. |
| Severity | Medium |
| Status | pending |

### P3

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-changes--gate-falsifiability-2 |
| Edit | Add source spec `changes/leader-brief-contract`; raise severity Medium → **High** (recurrence caused a Pivot); recurrence note: "FR-4's terminal-branches paragraph never shipped and a term-by-term Reviewer PASSed it — the walk stopped at the table; walk every paragraph of the FR, including the ones after its table". When `changes--gate-falsifiability` P2 is applied, its `reviewer.md` text should read "each cited FR **statement, table and every paragraph under it**". |
| Severity | High |
| Status | pending |

No `guide-sync` item (no `## Constitution Impact` blocks — no module created or reshaped). No `factual-sweep` item (root `CLAUDE.md` / `AGENTS.md` swept: `AGENTS.md`'s Multi-Agent Harness line states only the 3-attempt ceiling, still true; no statement about diff delivery, rollback, or runtime fallback exists to falsify). No `trd-adr` item (no TRD in this repo; Pivot ADR impact: none).
