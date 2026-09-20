# Design: `AGENTS.md` as the Single Canonical Agent Guide

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/agents-md-canonical` |
| Depth | **Lite** (re-checked against this design in §6) |
| Status | Draft — awaiting the Step 2.5 gate |
| Date | 2026-09-20 |
| Source | `requirements.md` (FR-1..FR-4, NFR-1..4) |
| Premise Ledger | §7 — **8 verified · 0 UNVERIFIED** |
| Reversion challenge (Step 2.3) | **Run** — DD-1 removes delivered behavior (the mandated mirror). Outcome in §5 |
| Delegation record | None. Targeted greps and one documentation fetch, all inline under the *Delegation Thresholds* allowance |

## 2. Executive Summary

Four edits in one command, plus one file in this repo. The mirror is not deleted — it is **inverted**: `AGENTS.md` becomes the body, `CLAUDE.md` becomes a one-line import when it is needed at all.

## 3. Architecture Overview

| Role | Surface | What it holds |
|---|---|---|
| **Canonical guide** | project root `AGENTS.md` | `## Model Routing`, `## Skill Map`, all project policy |
| Compatibility shim | project root `CLAUDE.md`, optional | `@AGENTS.md` on line 1, Claude-specific content below |
| Mandate | `/akili-constitution` Steps 7, 8C, 8D + Verification Checklist | Which files exist and what goes in them |

**What does not change:** `bin/akili.js`, every other command and template, all `docs/` mirrors, and `.claude/` as the packaged source layout — a separate concept from a project's agent guide.

## 4. Surface Table

| # | File · site | Edit | FR |
|---|---|---|---|
| 1 | `akili-constitution.md:41` | *"Ensure root `CLAUDE.md` exists or is enhanced"* → `AGENTS.md`, with `CLAUDE.md` named as the optional import | FR-1 |
| 2 | `akili-constitution.md:455` (Step 8C) | `## Model Routing` into `AGENTS.md` only | FR-1 |
| 3 | `akili-constitution.md:579` (Step 8D) | `## Skill Map` into `AGENTS.md` only | FR-1 |
| 4 | `akili-constitution.md:1146` (Checklist) | Invert *"both files, not one"* → present in `AGENTS.md`, **not duplicated** into a `CLAUDE.md` body | FR-1 |
| 5 | `akili-constitution.md` — new short block near Step 7 | The import rule, the symlink prohibition, the v2.1.277 floor and the unavailability cases | FR-2 |
| 6 | this repo's root `CLAUDE.md` | Becomes `@AGENTS.md` + Claude-specific remainder | FR-3 |

## 5. Design Decisions

### DD-1 — Invert the mirror rather than delete it *(removes delivered behavior — challenged, below)*
The mandate exists because two hosts read two filenames. One file now serves both, **conditional on the other being absent**. Rejected: deleting `CLAUDE.md` outright, which breaks pre-v2.1.277, Bedrock and `disableAllHooks` sessions with no fallback.

**Reversion challenge — "what does removing the mirror break?"** One real hazard found and closed in the design. The mirror is what keeps a project readable on a host that cannot load `AGENTS.md`, and those hosts are enumerated and non-hypothetical (A-5). Deleting it would move those users from *"two files, one stale"* to *"no guide at all"* — strictly worse. **The import (DD-2) is what makes the removal safe**, which is why FR-2 is a requirement rather than a suggestion, and why the version floor is stated in the command instead of assumed.

### DD-2 — The shim is an `@AGENTS.md` import, never prose
Forced by P-2: with both files present Claude Code reads `CLAUDE.md` **only**. A prose pointer therefore replaces the guide with a sentence about the guide. The import is expanded, so the content actually loads. Rejected: a prose pointer (silently destructive); a symlink (P-4 — Edit/Write refuse to write through it, and Windows checks it out as text).

### DD-3 — Migration is additive and reversible
`/akili-constitution` in Active mode offers consolidation; it never deletes. A project that declines keeps exactly what it has. This is what lets NFR-2 hold without a migration script.

### DD-4 — Scope stays out of `implementer.md` / `tester.md`
Those two files are the collision surface with `changes/scoped-constitution-reads`, and they reference the guides in a read-order sentence that keeps working either way. **Touching nothing there is the serialization** — no ordering dependency is created in either direction, and `/akili-constitution` is never left half-migrated. This is what the user's instruction *"serializa sin romper constitution"* resolves to in practice.

## 6. Budget (Step 2.4 — tripwire for `/akili-execute`)

| Measure | Estimate |
|---|---|
| Tasks | **2** — the command's four sites plus the new block; this repo's `CLAUDE.md` |
| Shipped lines | **~25** (≈ 18 in the command, ≈ 7 net in `CLAUDE.md`) |
| Review rounds | **3** — one per task plus one rework |

Two tasks at ~25 lines matches **Lite**. Nothing pushes higher: no data, API, auth or installer surface, and the risky half (the import rule) is prose in one command.

## 7. Premise Ledger

`Premise Ledger: 8 verified · 0 UNVERIFIED (0 High, 0 Low)` — verified 2026-09-20 at `d640b3c`, commands run from the repository root, documentation quoted from `https://code.claude.com/docs/en/memory.md`.

`Blast-radius triggers:` **consumer** fires — the change alters what `/akili-constitution` writes, and other commands read those guides. Walked in P-7.

| # | Claim | Class | Citation (as run) | Verified at | If false | Settled by |
|---|---|---|---|---|---|---|
| P-1 | Claude Code reads `AGENTS.md` with no import and no setting | `data-env` | Docs: *"Claude Code can read `AGENTS.md` as your project instructions, so a repository already set up for other coding agents works without adding a `CLAUDE.md`, an import, or a setting."* | `d640b3c` | The spec is unnecessary — **High** | — |
| P-2 | **With both files present, Claude reads `CLAUDE.md` only** | `data-env` | Docs table: *"An `AGENTS.md` and a `CLAUDE.md` … → Your `CLAUDE.md` files only"* | `d640b3c` | DD-2 is unnecessary and a prose stub would be safe — **High** | — |
| P-3 | The supported shim is an `@AGENTS.md` import | `data-env` | Docs: *"putting an `@AGENTS.md` import in a `CLAUDE.md` next to it"* | `d640b3c` | FR-2 names the wrong mechanism — **High** | — |
| P-4 | Symlinks are unsuitable here | `data-env` | Docs: *"the Edit and Write tools refuse to write through a symlink"*; *"Windows: … use the `@AGENTS.md` import instead"* | `d640b3c` | A symlink would be cheaper — Low | — |
| P-5 | Support needs v2.1.277+, and is absent on Bedrock / telemetry-disabled / `disableAllHooks` | `data-env` | Docs note + *"When `AGENTS.md` support is unavailable"* | `d640b3c` | The version floor in surface 5 is noise — **High** | — |
| P-6 | **Only `/akili-constitution` mandates both files** | `existence` | `grep -rn "both files\|\`AGENTS\.md\` \*\*and\*\* \`CLAUDE\.md\`" .claude/commands .claude/templates .claude/skills docs/*.md README.md` → 3 hits, all `akili-constitution.md` (455, 579, 1146) | `d640b3c` | The Lite scope is too narrow — **High** | — |
| P-7 | Other commands reference the guides **disjunctively** and keep working when `CLAUDE.md` is absent | `consumer` | `grep -n "CLAUDE\.md" .claude/commands/akili-audit.md .claude/commands/akili-archive.md` → the form is *"root `AGENTS.md`/`CLAUDE.md`"*, never "both" | `d640b3c` | Audit/archive would report false drift and Lite would have to widen — **High** | — |
| P-8 | `bin/akili.js` never reads or writes either guide | `existence` | `grep -c "CLAUDE\.md\|AGENTS\.md" bin/akili.js` → **0** | `d640b3c` | FR-4 is wrong and installer work is in scope — Low | — |

Supporting readings, admitted as context rather than rows because no decision turns on them: this repo's `AGENTS.md` is 14,934 B and `CLAUDE.md` 4,812 B; `comm -12` over the two sorted files returns **27** identical lines; `claude --version` → `2.1.278`.
