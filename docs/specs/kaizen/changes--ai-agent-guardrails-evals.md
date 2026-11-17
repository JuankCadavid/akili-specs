# Kaizen Entry — changes/ai-agent-guardrails-evals

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/ai-agent-guardrails-evals` |
| Date | 2026-11-16 |
| Branch | feat/ai-agent-guardrails-evals |
| Branch Context | spec (pins: `Default Branch: master`, `Integration Branch: dev`) — items await Apply Mode on `dev` |
| Archive Run | 1 |
| Approval Mode | gated |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 13 | tasks.md |
| Reviewer FAIL rework attempts | 3 (T4 ×2 — Reviewer FAIL, then evidence MISMATCH; T8 ×1) | execution.md — T4, T8 |
| HALTs / FATAL_FAILs | 0 | execution.md |
| Pivots | 0 | execution.md |
| PRODUCT_BUGs | 0 | test-report.md |
| Judgment-day severe findings | none recorded | design.md |
| Validation FAIL / WARN | 0 / 1 (W-1, fixed in `dbd8e20`, re-validated PASS) | validation-report.md §7, §11 |
| Tasks closed under `REVIEW_WAIVED` (by flag) | 0 | execution.md §3 |
| Tasks closed under `REVIEW_SKIPPED` (by task) | 0 | execution.md §3 |
| Escaped defects (§3) | 0 (W-1 was a spec-level ambiguity copied verbatim, not a defect escaping a skipped review) | validation-report.md §7 |
| Budget | ≈ 827 / ≈ 900 LOC · 15 / ≈ 22 review rounds | execution.md §3 |
| Advisories | 11 (A-1…A-11) | validation-report.md §7 |

## Lessons

- **KZ-changes--ai-agent-guardrails-evals-1 — A gate clause that applies at several phase gates named artifacts that only a later phase produces.** (Methodology, Medium)
  - Root cause: FR-4 S2's `BUT` read "the Phase 1, 2 and 3 gates do not pass … while any item above is missing", but items 4–5 (the `design.md` monitoring plan, the eval-gate task) are created in Phases 2 and 3. Read literally, no agent spec clears Phase 1. The command text copied the clause word for word, so every Reviewer and the T13 walkthrough checked conformance to an unsatisfiable rule and passed it; nothing at specify time asked *which phase produces each item a gate checks*.
  - Evidence: validation-report.md §7 W-1 ("Read literally, an agent spec can never clear Phase 1 … The T13 walkthrough did not exercise per-phase gating"); §11 *W-1 fix record* (four sites edited, red before the fix).
  - Standardization: → P1

## Noted, not a lesson

- **KZ-changes--kaizen-loop-closure-2 recurred (T8).** The binding sweep keyed on the word `stack`; the docs bullet "`/akili-constitution` — Step 5 TRD and the Step 8D Skill Map" restated the same obligation (Skill Map membership) without that word and cost a review round. → P2 (`digest-update`).
- **Scripted replace hit the first occurrence (T4 attempt 2).** A replace of `n/a - <reason>` changed Video Mode `:70`, outside the task's scope; the Leader's evidence re-run caught it (MISMATCH), costing an attempt. The execution log already notes "future briefs should require line-anchored edits". First sighting; feeds recurrence.
- **Mode intro over-scoped its condition (T4 attempt 1).** "Nothing below applies unless `AI Agent: yes`" also covered item 1, which must run on every spec. Same family as the *Video Mode* precedent: a mode's detection step is unconditional. First sighting.
- **Docs-page ripple left open at execute.** T10 removed the skill from `docs/commands/akili-constitution.md`'s stack list and no task added the Step 5 conditional mention; it closed later as `quick/constitution-docs-agent-line`. Below the bar (no rework).
- **A-7 (detection breadth)** is a product question for a later proposal, not a lesson.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `.claude/commands/akili-specify.md` — Step 3.2 *Write* (append 1 line) |
| Edit | **Phase-scoped gates:** when a requirement makes more than one phase gate refuse on missing items, name for each gate only the items that phase produces (Phase 1: requirements content; Phase 2: `design.md`; Phase 3: `tasks.md`) — a gate that checks a later phase's artifact can never pass. |
| Severity | Medium |
| Status | applied (2026-11-17) |

### P2

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-changes--kaizen-loop-closure-2 |
| Edit | Add source `changes/ai-agent-guardrails-evals` and the recurrence note: T8's binding sweep keyed on the label `stack` and missed the docs bullet "`/akili-constitution` — Step 5 TRD and the Step 8D Skill Map", which restated the same obligation (Skill Map membership) without the label; the Reviewer FAILed it, costing one round. Severity stays **High**. |
| Severity | High |
| Status | applied (2026-11-17) |
