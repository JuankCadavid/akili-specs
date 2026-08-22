# Proposal — Branch-Safe Kaizen & Shared-File Write Discipline

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/branch-safe-kaizen` |
| Slug | `branch-safe-kaizen` — derived from free-text argument ("Branch-safe Kaizen and shared-file write discipline: two-phase Kaizen, per-run audit reports, spec branches never edit shared files") |
| Type | Change |
| Approval Mode | gated |
| Status | Proposed |
| Date | 2026-08-21 |
| Author | /akili-propose (T1) |
| Depends on | none |
| Parallel-safe | yes |
| Release Classification | **patch** — user decision (2026-08-21): behavior refinement of existing commands, no new command or install target; overrides the default minor classification for methodology behavior changes |

## Intent

Make every methodology write that happens during a spec's lifecycle **conflict-free by construction** when multiple developers run specs on parallel branches, by enforcing one principle:

> **On a spec branch, only write files unique to that branch. Every edit to a shared file happens only on the default branch, serialized.**

## Problem / Current Behavior

Evidence: a real multi-developer project hit a merge where **11 of 12 conflicting files were methodology artifacts**, not product code — `.agents/*` personas, `AGENTS.md`, `CLAUDE.md`, `docs/model-routing.md`, `docs/infrastructure.md`, `docs/specs/drift-report.md`, `docs/specs/kaizen-log.md`.

Four mechanisms in the methodology write shared files from spec branches:

| # | Mechanism | Where | Why it conflicts |
|---|---|---|---|
| 1 | Kaizen **Record** prepends to `## Entries` and rewrites `## Active Lessons` in the single `docs/specs/kaizen-log.md` | `kaizen` skill phase 4; `/akili-archive` Step 4.4 | Two branches prepend at the same top-of-section lines and rewrite the same digest table |
| 2 | Kaizen **Standardize** applies 1–3-line edits to `.agents/*` personas, root/child `CLAUDE.md`/`AGENTS.md`, `docs/specs/general-setup/` templates, `docs/ux-ui/design.md` | `kaizen` skill phase 3; `/akili-archive` Step 4.3 | Two branches produce divergent versions of the same persona/guide; git resolves textually, not deliberately |
| 3 | Archive **guide sync + factual sweep + TRD/ADR sync** edits root guides and appends ADRs to `docs/trd/trd.md` | `/akili-archive` Step 3 (items 2–4) | Appends land at the same anchor; factual sweeps rewrite overlapping sentences |
| 4 | Audit writes its report to the **fixed path** `docs/specs/drift-report.md` | `/akili-audit` | Two branches auditing at different times fully overwrite each other |

Global sequential IDs (`KZ-###`, `ADR-MMM`) collide independently of text: two branches both allocate the next number.

## Proposed Outcome

**Two-phase Kaizen — record on branch, apply on main:**

1. **Record (branch, conflict-free):** the retrospective writes one new file per spec — `docs/specs/kaizen/<safe-spec-slug>.md` (updated post-judgment: no date prefix — the date lives inside the entry) — containing metrics, lessons, **and proposed standardizations with `Status: pending`** (exact target file + 1–3-line edit + severity). The filename derives from the spec slug, so parallel branches can never collide. Lesson IDs become `KZ-<safe-spec-slug>-<n>` (no global counter).
2. **Apply (main only, single writer):** standardizations are applied only when the working branch **is** the default branch — with the same HITL menu (Apply all / selected / Defer / adjust). After merge, `/akili-archive` (run on main) or `/akili-resume`'s dashboard detects entry files with pending standardizations and offers the apply step; applied entries flip to `Applied`, rejected ones to `Rejected` with a reason.
   - **Solo-dev fast path:** if the retrospective itself already runs on the default branch, phase 2 executes immediately after phase 1 — today's behavior, unchanged.

**Digest with a single writer:** `docs/specs/kaizen-log.md` is kept but reduced to the `## Active Lessons` digest only, refreshed **exclusively during the apply phase on main**. Consumers (`/akili-propose`, `/akili-specify`, `/akili-execute`, `/akili-resume`) keep reading the one cheap table exactly as today; `## Entries` freezes as historical and new entries live in `docs/specs/kaizen/`.

**Same rule for the other shared writers:**

- `/akili-archive`'s guide sync, factual sweep, and TRD/ADR sync run **only on the default branch**; on a spec branch they record their would-be edits as pending notes in the spec's kaizen entry file (ADR numbers are allocated at apply time, on main, killing the `ADR-MMM` race).
- `/akili-audit` writes per-run reports to `docs/specs/audits/drift-<date>.md` (readers take the most recent; legacy fallback to `docs/specs/drift-report.md`).
- `/akili-constitution` scaffolds `docs/specs/kaizen/` and `docs/specs/audits/`, states the shared-file write rule in the constitution summary, and the personas (`leader.md`, `implementer.md`) gain the 1-line rule that spec-branch work never edits shared guides/personas.
- A visible **conflict is upgraded to a decision**: when two pending entries target the same file with contradictory edits, the apply step surfaces both to the user instead of letting the last merger win silently.

## Scope

- `.claude/skills/kaizen/SKILL.md` — two-phase loop contract, per-spec entry file format, digest single-writer rule, branch detection, `KZ-<safe-spec-slug>-<n>` IDs, Apply Mode activation (added post-judgment as the standalone apply entry point).
- `.claude/commands/akili-archive.md` — Step 4 (Record/Standardize split by branch), Step 3 guide/TRD sync gated to default branch with pending-note fallback, pending-standardization detection when run on main.
- `.claude/commands/akili-audit.md` — per-run report path + reader fallback chain.
- `.claude/commands/akili-resume.md` — dashboard surfaces pending standardizations; scan-branch handling for the new folders (see KZ-004 note below).
- `.claude/commands/akili-constitution.md` — scaffolding + the write-discipline rule in constitution summary and persona guardrails (`.claude/templates/leader.md`, `implementer.md` if needed).
- Docs mirrors: `docs/commands/akili-archive.md`, `akili-audit.md`, `akili-resume.md`, `akili-constitution.md`, plus `docs/flow.md` (fleet preconditions) if it cites kaizen-log paths.
- `CHANGELOG.md` under Unreleased; release classified **patch** (user decision — see Document Control).
- Migration: existing `kaizen-log.md` `## Entries` freeze in place as history; `## Active Lessons` table format unchanged. Projects with the old layout keep working — commands read old paths as fallback.

**KZ-004 applies (Active Lesson, Medium):** `docs/specs/kaizen/` and `docs/specs/audits/` are new folder roles under `docs/specs/`. Every command that scans `docs/specs/` (`/akili-resume` dashboard, `/akili-archive` folder moves, `/akili-propose` related-spec read) must enumerate its terminal branches and state explicitly which branch these folders land in (excluded from spec-folder scans), not rely on a presence-grep.

## Non-Goals

- No change to what Kaizen measures or the ≤3-lessons / 1–3-line-edit bounds.
- No git hooks, CI enforcement, or installer (`bin/akili.js`) changes — discipline is expressed in command/skill text, as all AKILI guardrails are.
- No redesign of the `family.md` per-spec flip in `/akili-archive` Step 3 (already branch-scoped, conflict-free).
- No retroactive migration of existing kaizen-log entries into per-spec files.

## Affected Users, Systems, And Specs

- **Users:** multi-developer teams running parallel specs (primary); solo developers see no workflow change on main.
- **Systems:** the four commands + kaizen skill above; consumers of `## Active Lessons` are unaffected (same table, same path).
- **Specs:** none in flight in this repo; `changes/audit-phase-tier-drift` (archived) touched adjacent audit surfaces — its drift categories must keep resolving report paths after the per-run rename.

## Visual Reference

- Source: None
- Location: —
- Notes: methodology-text-only change; no UI surface.

## Requirement Delta Preview

### ADDED Requirements

- Per-spec kaizen entry files under `docs/specs/kaizen/` with pending/applied/rejected standardization states.
- Apply phase on main with pending detection in `/akili-archive` and `/akili-resume`, including contradictory-edit surfacing.
- Per-run audit reports under `docs/specs/audits/`.
- Shared-file write rule scaffolded by `/akili-constitution` into guides and personas.

### MODIFIED Requirements

- Kaizen Record no longer prepends entries to `kaizen-log.md`; the digest becomes main-only single-writer.
- Archive guide sync / factual sweep / TRD-ADR sync gated by branch, with pending-note fallback.
- Lesson and ADR ID allocation moves to apply time (slug-scoped IDs for lessons).

### REMOVED Requirements

- The fixed `docs/specs/drift-report.md` output path (kept only as read fallback).
- Global sequential `KZ-###` allocation for new lessons.

## Approach Options

| Option | Description | Trade-off |
|---|---|---|
| **A — Git-level only** | `.gitattributes` `merge=union` on the log + formatting conventions | Zero methodology change, but unsafe for personas/guides (no valid union semantics), doesn't fix ADR/KZ number races; band-aid |
| **B — Two-phase + main-only digest (recommended)** | Per-spec entry files on branch; standardizations, digest, guide/TRD edits applied only on main; solo fast path | Touches 4 commands + 1 skill; keeps consumer read cost identical; conflicts become impossible by construction, contradictions become visible decisions |
| **C — Fully derived digest** | No digest file at all; consumers scan `docs/specs/kaizen/*.md` frontmatter per session | Purest model, but raises every consumer's read cost and breaks the prompt-caching read order; larger blast radius for the same benefit |

## Recommended Approach

**Option B.** It is the smallest change that makes the conflict class structurally impossible (unique filenames per branch, single writer for every shared file) while keeping the consumer contract — one cheap `## Active Lessons` table at a stable path — byte-compatible. Option A stays available to affected teams as an interim bridge and is documented as such, not as the fix.

## Risks, Dependencies, And Open Questions

| Item | Kind | Handling |
|---|---|---|
| Pending standardizations pile up if nobody runs the apply step on main | Risk | `/akili-resume` dashboard surfaces the pending count every session; recommend applying when any High-severity lesson is pending |
| New folders misread as spec folders by scanning commands | Risk | KZ-004 discipline: enumerate scan branches in each command touched (see Scope) |
| Digest staleness on branches (a lesson recorded on a sibling branch isn't visible until applied on main) | Accepted | Same visibility a developer has of any unmerged sibling work; pending entries are still greppable |
| Branch detection wording must work in Claude Code and OpenCode | Open question | Express as "current branch = repository default branch" via `git`; resolve exact phrasing in design |
| Does `docs/flow.md` fleet section cite kaizen-log paths needing update? | Open question | Verify during specify |

## Success Criteria

1. Two specs archived on parallel branches merge with **zero conflicts** in methodology files (kaizen, personas, guides, TRD, audit reports).
2. A standardization proposed on a branch is applied on main through the HITL menu and its entry flips to `Applied`, with the digest updated in the same main-side commit.
3. Contradictory pending edits to the same target are presented as a decision, never auto-merged.
4. A solo developer on main experiences today's flow unchanged (record + apply in one pass).
5. Consumers still load Active Lessons from `docs/specs/kaizen-log.md` with no format change.

## Next Step

```text
/akili-specify changes/branch-safe-kaizen
```
