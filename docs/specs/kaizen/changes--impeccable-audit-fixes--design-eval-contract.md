# Kaizen Entry — changes/impeccable-audit-fixes/design-eval-contract

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/impeccable-audit-fixes/design-eval-contract` |
| Date | 2026-10-31 |
| Branch | `JuankCadavid/impeccable-audit-fixes` (Branch Context: **spec**; apply-capable branch is `dev`) |
| Archive Run | 1 |
| Approval Mode | `gated`, run under JC's mandate (take the recommended option at each gate; local commits only) |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 11 | tasks.md |
| Reviewer FAIL rework attempts | 4 (T1 ×1, T6 ×1, T7 ×1, T11 ×1) | execution.md — T1, T6–T9, T11 |
| HALTs / FATAL_FAILs | 0 | execution.md |
| Pivots | 0. There were 3 execute-time spec amendments, each a resolved spec tension: design §7.1 rows 1 and 4, and §7.3 | execution.md — T1 and T3 *Decisions made* |
| PRODUCT_BUGs | 0 | test-report.md |
| Judgment-day severe findings | 5 (J-1 to J-5), fixed at specify, not re-judged | judgment.md |
| Validation FAIL / WARN | 0 / 7 | validation-report.md |
| Tasks closed under `REVIEW_WAIVED` (by flag) | 0 | execution.md |
| Tasks closed under `REVIEW_SKIPPED` (by task) | 0 | execution.md |
| Escaped defects (§3) | 0 against skipped tasks (none were skipped). Validation found 3 rule defects that every task's Reviewer passed: W-1, W-2 and W-4 | validation-report.md |
| Budget | 814 LOC against a ~900 ceiling; 16 rounds against ~18; 11 tasks against 11 | execution.md *Summary*; validation-report W-6 |

## Lessons

- **KZ-changes--impeccable-audit-fixes--design-eval-contract-1 — The design's module rows narrowed or skipped FR obligations, and no specify-time walk caught it.** (Methodology, Medium)
  - Root cause: design §7.1 row 1 put FR-2's unconditional record bullets under "Applies to a `vendored` copy". Row 4 asked for an outside `IMPECCABLE_HOME` only "when none is set", against FR-1 bullet 3. §7.5 listed "the exit-code row `2`" as a consumer of `false positive`, but no §7 row implemented it.
  - Why it got through: judgment-day and the tasks gate walked requirements → tasks, never FR bullet → §7 module row, or §7.5 consumer → §7 row. Each gap surfaced as a spec tension at a task's Reviewer and cost one amendment, plus one rework round in T1.
  - Evidence: execution.md — T1 attempt 1 (Reviewer FAIL issues 1–2, with the spec-tension amendments); T3 Reviewer PASS with tension (exit-`2` row); design.md §7.1 rows 1 and 4 and §7.3, amended 2026-10-31.
  - Standardization: → P1
- **KZ-changes--impeccable-audit-fixes--design-eval-contract-2 — Two rules that write the same output field had no stated precedence, and only a cross-FR walkthrough found it.** (Methodology, Medium)
  - Root cause: FR-4 (`below fold` is P1/FAIL) and FR-5 (a missing banner reads `Unevaluated`) both set the first-visit outcome, and neither says which wins. Every scenario, test and Reviewer pass checked one FR at a time. The 2.40.0 `/es/` run is the combined case, and on it a literal agent loses the P1.
  - Evidence: validation-report.md — W-1 (walkthrough, combined FR-4 + FR-5 case); test-report.md §7 (FR-4 and FR-5 each PASS in isolation).
  - Standardization: → P2

## Noted, not a lesson

- **The procedure was never run on real data.** W-2: the shipped hash rule gives `verified` with `sed` and `modified` with `awk`, because the vendored `SKILL.md` has no trailing newline. The validator found it by running the rule once on the real copy. No task ran the procedure, only text assertions on its wording. A recurrence would make this a lesson: "a procedural rule (hash, strip, parse) is executed once on the real artifact at execute".
- **Held-out cases found two gaps.** W-3 (off-edge CTA) and W-4 (exported `IMPECCABLE_BIN` under an exclusion) are rule gaps outside the approved scenarios. This is expected yield from the held-out case, not a process failure.
- **Leader process slips; neither reached a shipped file.** The BSD `sed '0,/re/'` checkbox flip silently did nothing in T1, and the commit had to be amended. A `&& git commit` chain did not include the `npm test` exit status, so the validate commit landed with 1 red test; it was amended within the same step.
- **Checklist-mode reviews still caught dropped content.** T6 (value shapes) and T7 (existence item) were caught by checklist-mode Reviewers. Each failed once on content the design table carried but the brief's one-line Scope abbreviated. → P4

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | upstream |
| Target | methodology |
| Edit | `/akili-specify` Phase 2 (design review / judgment-day brief): add a reverse walk. Every FR SHALL bullet maps to the §7 module row that implements it, with any scope qualifier in that row quoted. Every consumer named in the enumerated-value walk (KZ-004) cites the §7 row that implements its behaviour; a consumer with no implementing row is a design gap fixed before the tasks gate. |
| Severity | Medium |
| Status | pending |

### P2

| Field | Value |
|---|---|
| Kind | upstream |
| Target | methodology |
| Edit | `/akili-specify` requirements authoring: when two or more requirements write the same output field or verdict, `requirements.md` states their precedence in one line. The specify walkthrough includes one combined scenario in which both apply. |
| Severity | Medium |
| Status | pending |

### P3

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-002 |
| Edit | Add source `changes/impeccable-audit-fixes/design-eval-contract` with this recurrence note: "**recurred (changes/impeccable-audit-fixes/design-eval-contract: T11 attempt 1 — two CHANGELOG clauses overstated the shipped text: the detector first-visit item was said to run at the short-height pair, and the E4 brief was said to "state" the count; validation W-6 found assertion counts and LOC disagreeing across tasks.md, design.md and execution.md)**". Severity stays High. |
| Severity | High |
| Status | pending |

### P4

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-changes--gate-falsifiability-2 |
| Edit | Add source `changes/impeccable-audit-fixes/design-eval-contract` with this recurrence note: "**recurred (changes/impeccable-audit-fixes/design-eval-contract T6/T7: a one-paragraph `checklist` task dropped design §5.3's value shapes — selector-or-attribute, `—`, the style shape, the viewport names — and FR-13's existence item. Both were caught by the checklist Reviewer, one round each. The dropped content sat in a design table the task's Scope cell abbreviated)**". Severity stays High. |
| Severity | High |
| Status | pending |
