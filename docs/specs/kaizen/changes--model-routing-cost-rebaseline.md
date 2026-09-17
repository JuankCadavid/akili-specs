# Kaizen Entry — changes/model-routing-cost-rebaseline

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/model-routing-cost-rebaseline` |
| Date | 2026-09-17 |
| Branch | master (default branch — resolved by the unique `main`/`master` rule; no `Default Branch:` pin in the root guides) |
| Archive Run | 1 |
| Approval Mode | gated |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 2 | tasks.md |
| Reviewer FAIL rework attempts | 2 (T1 ×1, T2 ×1) | execution.md — T1 attempt 1 ("$60 limit" framing), T2 attempt 1 (inverted "above/below" pointers) |
| HALTs / FATAL_FAILs | 0 | execution.md |
| Pivots | 1 (T1 — plan-page figures were the per-5-hour column, not monthly) | execution.md — ## Pivot Record: T1 |
| PRODUCT_BUGs | — (no test-report.md; documentation-only spec) | — |
| Judgment-day severe findings | not run; Step 2.3 reversion challenge found 2 real contradictions (R3 "Exp" vs research-preview rule; R4 Gemini Pro vision sentences) fixed before tasks | design.md §6.1 |
| Validation FAIL / WARN | — (no validation-report.md; absence accepted) | — |
| Budget | 2 tasks / ~160 lines / 3 rounds → 2 / ~190 / 4 | execution.md §3 |
| Drift attributable | none (no audit report under `docs/specs/audits/`) | — |

## Lessons

- **KZ-changes--model-routing-cost-rebaseline-1 — A figure read off a screenshot is proposal context, not a source; open the page before it becomes a requirement or design cell.** (Methodology, High)
  - Root cause (5W1H): the maintainer's screenshots of the OpenCode Go plan page carried the "requests per 5 hour" column; `/akili-propose` transcribed them as quotas, `/akili-specify` copied them into FR-1 and design §5.1, and the proposal's Judgment-style checks (a reversion challenge on the design) could not see a unit error because no step required the page itself to be opened. The first command that opened the page was `/akili-execute` (T1's Source-of-truth rule), which produced Pivot Record T1 — picks unchanged, every figure ~5× off. Neither propose nor specify has a rule that numeric evidence pasted from images must be re-read at its source before it enters a requirement.
  - Evidence: execution.md — ## Pivot Record: T1; proposal.md — Problem table (figures labelled as screenshot evidence); tasks.md T1 — Source-of-truth rule (the gate that caught it).
  - Standardization: → P1

- **KZ-changes--model-routing-cost-rebaseline-2 — A Leader brief dispatched before a Pivot must be re-issued with the amended text before the task resumes.** (Methodology, Medium)
  - Root cause: the T1 Implementer brief was composed before Pivot Record T1 and carried the "$60 per-model limit" framing; the pivot amended requirements/design/tasks but `/akili-execute`'s Pivot Protocol step 4 resumes execution without requiring in-flight briefs to be re-issued. The Implementer honored its brief, the Reviewer FAILed the framing against the amended spec, and one review round was spent re-stating what the pivot had already decided.
  - Evidence: execution.md — T1 attempt 1 Reviewer FAIL ("the '$60' residue came from my pre-pivot brief — brief error, not Implementer drift"); ## Pivot Record: T1.
  - Standardization: → P2

## Noted, not a lesson

- T2 attempt 1: two directional cross-references in the CHANGELOG ("above"/"below") pointed the wrong way; first occurrence in this project, Low friction — recurrence feed only.
- The Step 2.3 reversion challenge (one `sonnet` reviewer, one question) paid for itself twice on a 160-line documentation spec: a positive signal for keeping it on in Lite depth when the reverted behavior has a visible surface.
- Adjacent existing lessons checked for recurrence: KZ-001 (read the pinned source past the section) and KZ-007 (forward pointers carried by the brief) share a neighborhood with lessons 1 and 2 but name different root causes (source never opened; brief predating a pivot) — recorded as new, not as `digest-update`.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `.claude/commands/akili-specify.md` — Step 1.2 guidelines (after "use measurable, testable language"); mirror `docs/commands/akili-specify.md` at content parity |
| Edit | Add one bullet: "**numbers from images are not sources** — a figure transcribed from a screenshot or a pasted table is proposal context; before it enters a requirement, scenario, or design cell, open the page (or run the command) it came from, confirm the column and unit, and pin it — the unit error the screenshot hides is the one no downstream grep can see". |
| Severity | High |
| Status | applied (2026-09-17) |

### P2

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `.claude/commands/akili-execute.md` — Error Handling & Pivot Protocol, step 4; mirror `docs/commands/akili-execute.md` at content parity |
| Edit | Append to step 4: "Before resuming, **re-issue every Implementer brief already dispatched for the affected task** with the amended text — a brief composed before the pivot carries the superseded value, and the Implementer will honor it faithfully into a FAIL." |
| Severity | Medium |
| Status | applied (2026-09-17) |

## Apply pass (2026-09-17, default branch)

Backlog processed in entry-filename lexical order: `changes--branch-safe-kaizen.md` (P1, P2) then this file (P1, P2). All four approved ("Apply all") and applied; digest refreshed (4 rows added, `KZ-007` retired as the longest-institutionalized Applied row to keep ≤ 10). Notes: branch-safe P2's mirror clause not placed — `docs/commands/akili-specify.md` does not describe Correction Closure; `.agents/leader.md` (gitignored deployed copy) received the same edit as the template, and two pre-existing template-vs-deployed divergences were observed and left untouched (extra measured-failure caveat + "Poke once, then replace on the second idle" rule; the "Shared-File Write Discipline" section) — a `/akili-constitution` re-run refreshes `.agents/` from the templates.
