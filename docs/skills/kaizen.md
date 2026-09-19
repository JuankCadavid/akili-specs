# `kaizen`

**Author:** Juan Carlos Cadavid — [jcadavid.com](https://jcadavid.com)

## Purpose

Turns the Japanese Kaizen philosophy of continuous improvement into an executable, bounded loop: **Measure → Learn → Standardize → Record**. Every archived spec leaves the project — and the methodology itself — slightly better than it found them. Inspired by the Kaizen Institute glossary (kaizen.com), Robert Maurer's small-steps method, and INTI's *Emprendiendo Kaizen* (2019).

The loop runs in **two phases with two different homes**, so parallel branches never fight over the same file:

| Phase | Runs where | Writes |
|---|---|---|
| **Retrospective** (Measure → Learn → Standardize → Record) | any branch | the spec's own entry file under `docs/specs/kaizen/` |
| **Apply** (the pending backlog) | the apply-capable branch (the pinned integration branch when the `Integration Branch:` pin exists, otherwise the default branch — never both) | HITL-approved shared files, the digest, and status flips in the entry files |

## Use When

- `/akili-archive` reaches its **Kaizen Retrospective** step (the primary, automatic trigger).
- The user explicitly requests a kaizen retrospective or continuous-improvement pass over a spec or project.
- **Apply Mode** — the user asks to apply pending kaizen standardizations ("kaizen apply", "aplicar estandarizaciones kaizen"), or `/akili-archive` finishes a retrospective with the apply-capable branch checked out and offers the pending backlog. Apply Mode is standalone: no spec argument, no active archive, so it stays reachable long after the specs that produced the backlog were archived. Invoked anywhere else it declines in one line, naming the apply-capable branch. It is an activation of this skill, not a separate command.

## Core Rules

- **Measure** hunts MUDA (waste) in the spec's own evidence: Reviewer rework attempts, pivots, PRODUCT_BUGs, severe judgment-day findings, validation WARN/FAIL, quick escalations, drift (the most recent report under `docs/specs/audits/`, legacy `docs/specs/drift-report.md` as fallback), and tasks closed under `REVIEW_WAIVED` (by flag).
- **Learn** distills 0–3 lessons; each names a root cause (5W1H) and cites evidence (Gemba: real facts, never speculation). Generic lessons are banned; prefer zero over filler. Recurrence is checked against the digest *and* every entry file, and a repeated root cause becomes a `digest-update` pending item rather than a duplicate lesson. Lessons target the **Product**, the **Methodology** (recorded as a `Kind: upstream` pending item, on any branch), or both.
- **Standardize** proposes one minimal edit (1–3 lines) per lesson to the most durable home, then gates on **Branch Context**, which has three rows: on a spec branch, or on the default branch while an `Integration Branch:` pin exists, every proposal is recorded as a pending item and still presented for review — the gate moves the write, not the review — while no shared file is touched; on the **apply-capable branch** the approval menu fires and approved edits are applied in the same pass (solo fast path).
- **Record** writes one entry file per spec at `docs/specs/kaizen/<safe-spec-slug>.md` (exact-name re-run check, updated in place), carrying metrics, lessons, sub-threshold `## Noted, not a lesson` signals, and the `## Pending Items` queue.
- **Apply Mode** works the whole backlog in entry-filename lexical order: it merges `digest-update` items on the same lesson ID, dedupes byte-identical edits, and quotes differing edits to the same target side by side for the user to choose — never applying both and never auto-picking a winner. Before writing an approved item it runs a bounded **re-verify** probe (Target still exists, the one named fact still holds); a refuted item closes as `superseded (reason)` instead of being written. Approved `upstream` items are collected whole into one **upstream report** (`docs/specs/kaizen/upstream-<date>.md`) and flip to `upstreamed`.
- **The digest has one writer:** Apply Mode, on the apply-capable branch — exactly one branch per project at any time, never both the default and the pinned integration branch. `## Active Lessons` keeps its path, columns, and 10-row cap (normalized/deduped first); the legacy `## Entries` section is frozen history, never rewritten, renumbered, or deleted.
- **Branch Context** resolves the default branch from the `Default Branch:` pin in the constitution summary first, then `origin/HEAD`, then a unique `main`/`master`; `git config init.defaultBranch` is never consulted. The optional `Integration Branch:` pin, resolved only from that literal line (no git fallback), makes its branch the sole apply-capable one and holds the default branch to the same non-writing rule as a spec branch. Unresolved counts as a spec branch — deferring is always safe, applying is not.
- The retrospective **never blocks the archive** — missing inputs or a declined menu produce a metrics-only or clean-run **entry file**, never a fallback write to the digest.

## Best Paired Commands

- `/akili-archive` — runs the retrospective automatically as its Kaizen Retrospective step, and offers Apply Mode over the whole backlog when it runs on the apply-capable branch.
- `/akili-propose`, `/akili-specify`, `/akili-execute` — read the `## Active Lessons` digest so past mistakes shape new work.
- `/akili-resume` — shows the active-lesson count and the pending-backlog count (`pending`/`deferred` only, with its highest severity) in the dashboard, and names the Apply Mode invocation that clears it, by the apply-capable branch's pinned name.

## Source

- `../../.claude/skills/kaizen/SKILL.md`
