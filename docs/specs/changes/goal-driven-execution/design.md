# Design: Goal-Driven Unattended Execution

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/goal-driven-execution` |
| Depth | Lite |
| Status | Draft — Phase 2 |
| Date | 2026-08-12 |
| Requirements | FR-1…FR-3, NFR-1…NFR-2 |

## 2. Executive Summary

Four surfaces, one bounded edit: an **Unattended Mode** block in the execute command (inside the pre-approved context), a per-host launch extension to the fleet preconditions in `docs/flow.md`, one capability line in the execute mirror, one CHANGELOG entry. All content is guidance prose; the canonical `/goal` condition is written once, verbatim-copyable, and referenced from the fleet section rather than duplicated.

## 3. Surface Design

| # | Surface | Insertion point | Content |
|---|---|---|---|
| 1 | `.claude/commands/akili-execute.md` | Immediately after the Step 5 **Approval Mode** paragraph (~line 253) | `**Unattended Mode (Claude Code + pre-approved only):**` block: when the user mandates an unattended run, recommend launching with `/goal`; canonical condition template (block-quoted, copyable); turn bound aligned to the 3-attempt ceiling; requirements sentence (trusted workspace, dead under `disableAllHooks`, never a prerequisite); pinned doc link |
| 2 | `docs/flow.md` | Extends fleet precondition 2 (`pre-approved`, ~line 252) | Per-host launch: Claude Code → `claude -p "/goal <condition>"` pointing at surface 1's template; Antigravity → goal + exception contract in the dispatch brief, completion user-verified via artifacts (pinned link); OpenCode → no claim |
| 3 | `docs/commands/akili-execute.md` | End of the command overview | One sentence: pre-approved runs on Claude Code can be driven to completion with `/goal` (see command text for the template) |
| 4 | `CHANGELOG.md` | `## [Unreleased]` → `### Added` | Entry describing the capability; release classified **minor** |

## 4. Canonical Condition Template (the one design artifact)

Written once at surface 1, exactly this shape (placeholders resolved per spec):

> Every task in `docs/specs/<spec-path>/tasks.md` is `[x]` with matching PASS evidence in `execution.md`, OR `execution.md` contains a `## HALT:`/`## Pivot Record:`/budget-tripwire block, OR a question is pending for the user. Stop after `<N>` turns.

`<N>` guidance: tasks remaining × up to 6 triad round-trips + margin — the bound exists so the goal loop and the 3-attempt ceiling never fight; the ceiling HALTs first, the HALT satisfies the disjunction, the goal loop ends.

## 5. Design Decisions

| ID | Decision | Rejected | Rationale |
|---|---|---|---|
| DD-1 | Guidance lives inside the Step 5 pre-approved paragraph's context, not Step 0 or Loop Guardrails | Step 0 (mode not yet active there); a new top-level section (oversized for ~15 lines) | FR-1 BUT: confinement to pre-approved context becomes structural — the grep gate checks placement, not just wording |
| DD-2 | Template written once (surface 1), referenced from `flow.md` | Duplicating it in both | Two copies of one contract drift; the fleet section already cross-references the execute command |
| DD-3 | Mirror gets one capability sentence, not a mode section | Documenting modes in the mirror | The mirror (94 lines) documents no approval modes today; introducing that taxonomy is new scope beyond this spec |
| DD-4 | Host-conditional phrasing follows the existing `/model` precedent ("in Claude Code, …") | A new per-host guidance convention | The command text already does host-conditional phrasing; reuse the pattern |

Step 2.3 reversion challenge: **not triggered** — nothing delivered is removed, disabled, or inverted.

## 6. Budget (Step 2.4)

| Metric | Estimate |
|---|---|
| Expected tasks | 1 |
| Expected LOC | ~35–40 added lines across 4 files |
| Expected review rounds | 1 |

Depth re-check: matches **Lite** (single task, guidance-only, no code risk). No change.
