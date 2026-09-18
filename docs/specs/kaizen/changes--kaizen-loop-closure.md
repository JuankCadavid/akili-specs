# Kaizen Entry — changes/kaizen-loop-closure

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/kaizen-loop-closure` |
| Date | 2026-09-18 |
| Branch | master (Branch Context: `default`, apply-capable — no `Integration Branch:` pin in this repo) |
| Archive Run | 1 |
| Approval Mode | pre-approved (user, 2026-09-17) — the Standardize menu auto-passed with option 1 (High lesson present) and is logged as `auto-approved (pre-approved mode)` |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 7 (6 designed + T7 from the T6 Pivot) | tasks.md |
| Reviewer FAIL rework attempts | 4 (T1 ×2, T3 ×1, T5 ×1) — 11 verdicts total | execution.md |
| HALTs / FATAL_FAILs | 0 / 0 | execution.md |
| Pivots | 1 (T6 → T7; FR-1/FR-2/FR-4 amended; DD-11) | execution.md — ## Pivot Record: T6 |
| Budget tripwires | 1 (T1, second FAIL; user chose to proceed) | execution.md — ## Budget tripwire: T1 |
| Leader pre-review catches | 3 (T1 step-2 wording; T2 five restatements; T2 fifth ADR clause flagged by the Implementer) — no Reviewer round consumed | execution.md — T1 attempt 2, T2 attempt 1 |
| PRODUCT_BUGs | n/a — no `test-report.md` (absence accepted; prose-only spec) | archive-summary.md §4 |
| Judgment-day severe findings | not run (user chose Continue); Step 2.3 reversion challenge: 6 breakages examined, 4 real, all closed pre-design | design.md §11 |
| Validation FAIL / WARN | n/a — no `validation-report.md` (absence accepted) | archive-summary.md §5 |
| Closure walkthrough | attempt 1: 8 PASS / 3 INCONCLUSIVE → Pivot; attempt 2: 11 PASS | t6-walkthrough.md |
| Provider / harness interrupts | 0 (STATUS-first, ≤600-word reports; no truncated verdicts) | execution.md |
| Drift attributable | no audit report exists under `docs/specs/audits/` | — |

## Lessons

- **KZ-changes--kaizen-loop-closure-1 — When a design adds a value to an enumerated type, walk every existing consumer step against it.** (Methodology, High)
  - Root cause: `design.md` §7 named the steps to *add* (3b, 4b, 5.0, the third Branch Context row) but never walked the *existing* Apply Mode steps (2 Group, 3b probe), the archive's per-item sub-clauses, or the constitution's detection sub-bullet against the new values (`upstream`, `integration`, the pin). Each surviving sentence was written for the old value set and was read literally against the new one — the KZ-004 fall-through class applied to a design instead of a scan. Cost: T1 FAILs 1 and 2 (step 2 grouping; step 3b probe), the T1 budget tripwire, three INCONCLUSIVE closure steps, one Pivot, one extra task.
  - Evidence: execution.md — T1 attempts 1–2 (Violated Rule: requirements.md FR-5), ## Budget tripwire: T1 ("Cause"), ## Pivot Record: T6; design.md DD-11; t6-walkthrough.md attempt 1 INCONCLUSIVE 1–3.
  - Related, not a recurrence: KZ-004 (scan-time sibling of the same fall-through class).
  - Standardization: → P1

- **KZ-changes--kaizen-loop-closure-2 — Before spawning the Reviewer on a rules-document edit, grep the file for the superseded phrasing and its paraphrases.** (Methodology, Medium)
  - Root cause: a rule changed in one section is restated in others of the same file (Activation Contract, Standardize menu line, Record item 4, template boilerplate; archive Step 3 item 4 heading and clause, 4.3 paragraph, 4.4 Record, Error Handling). Neither the task's greps nor the Implementer's section list see them; a Reviewer does, at a full round each. The Leader's pre-review grep caught them at zero rounds in T1 (attempt 2) and T2 (five sites) — the same class the T5 Reviewer then found across *files* (a falsified count, a surviving either/or), where a per-file grep cannot reach.
  - Evidence: execution.md — T1 attempt 2 ("Leader pre-review catch"), T2 attempt 1 ("Leader pre-review catches"), T5 attempt 1 Reviewer issues 1–2; Active Lesson KZ-changes--branch-safe-kaizen-2 (the specify-time Correction Closure sibling).
  - Standardization: → P2

## Noted, not a lesson

- **Positive practice (corpus lesson applied proactively):** every worker brief demanded `STATUS:` first and ≤600 words after the evidence corpus showed the harness truncating long Reviewer reports past the verdict line — zero truncated verdicts in 11. Below the lesson bar; worth keeping in `/akili-execute`'s brief guidance if it recurs elsewhere.
- **Docs gaps found by Reviewers, outside this spec's scope (follow-ups, `/akili-quick` candidates):** `docs/flow.md` artifact table has no row for `docs/specs/kaizen/upstream-<date>[-N].md`; `.claude/commands/akili-archive.md` Step 6 item 6 still says "on a spec branch" (reporting side); Apply Mode step 5 has no sentence creating a digest row for a `digest-update` whose ID predates the digest (bootstrap case — silence, not disagreement).
- **Fixture discipline:** the T3 Reviewer caught that the planned T6 fixture kept `Default Branch:` in its "no-pin" walk and so would never exercise the neither-pin population; the T6 fixture's `digest-update` item targeted an orphan ID and so did not exercise the FR-4 bootstrap scenario (walked on the text instead). A fixture must carry one row per population the requirement names. Sub-threshold; feeds recurrence.
- **Install lag:** the globally installed `~/.claude/` copies (commands, skills) predate this spec until reinstall/release — this archive ran on the repo's own text.
- `Kind: upstream` does not apply in this repository: it *is* the methodology, so Methodology lessons take local edits here (dogfooding precedent: every entry file in this folder).

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `.claude/commands/akili-specify.md` — Phase 2, Step 2.2 guidelines |
| Edit | New bullet after "keep design decisions practical…": **New enumerated values walk their consumers.** When the design adds a value to an existing enumerated type, the surface table lists every existing step that consumes that type and states what the new value does there (KZ-004 applied to a design). |
| Severity | High |
| Status | applied (2026-09-18) |

### P2

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `.claude/templates/leader.md` — Primary Instructions item 4 |
| Edit | New bullet: **Pre-review restatement sweep (rules documents):** grep the file for the superseded phrasing and its paraphrases before spawning the Reviewer; a surviving restatement is brief non-conformance returned to the Implementer, not a Reviewer finding. |
| Severity | Medium |
| Status | applied (2026-09-18) |

### P3

| Field | Value |
|---|---|
| Kind | factual-sweep |
| Target | `AGENTS.md` — Repository Purpose, `bin/akili.js` line |
| Edit | "into Claude, OpenCode, and Google Antigravity config directories" → "into Claude Code, OpenCode, Google Antigravity, and OpenAI Codex CLI config directories" (Codex target shipped in 2.24.0; the sentence had not followed). |
| Severity | Low |
| Status | applied (2026-09-18) |

### P4

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | `## Active Lessons` refresh |
| Edit | Normalized (10 unique rows); retired `KZ-003` and `KZ-006` (Applied 2026-08-13, longest institutionalized, no recurrence since — both remain live in `leader.md` and `/akili-specify` Step 3.2); added the two rows above. Cap holds at 10. |
| Severity | — |
| Status | applied (2026-09-18) |

No `guide-sync` item (no `## Constitution Impact` blocks — no module created or reshaped). No `trd-adr` item (no TRD in this repo).

## Apply pass (2026-09-18, default branch)

Standardize menu: option 1 (Apply all) — auto-approved (pre-approved mode), recommended because a High lesson exists. Re-verify (step 3b): P1 Target section present; P2 Target item present; P3 sentence present verbatim; all written. Backlog after this pass: 0 pending across `docs/specs/kaizen/`.
