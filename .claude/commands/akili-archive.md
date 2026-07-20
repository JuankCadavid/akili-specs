---
description: Archive a completed spec task, run the Kaizen retrospective, sync agent guides and CodeGraph, and keep the TRD current.
license: MIT
metadata:
  author: Juan Carlos Cadavid (jcadavid.com)
---

# Archive AKILI-SPECS Spec

Archive a completed AKILI-SPECS spec path after implementation, testing, and validation are done.

Archiving preserves the full decision trail. It keeps active `docs/specs/` easier to scan while retaining proposal, requirements, design, tasks, execution notes, test evidence, and validation evidence for future review.

> **Recommended model tier:** T5 Fast-Cheap. This is a format-following and file-moving job; a deep reasoning model is not required. The Kaizen Learn sub-step (Step 4.2) is a judgment task — if convenient, run it on a T3 Auditor model; otherwise keep the whole command on T5 and keep lessons few.

## Usage

```
/akili-archive <spec-path>
```

**Examples:**

- `/akili-archive changes/add-remember-me`
- `/akili-archive bugfix/login-redirect`
- `/akili-archive enhancements/renewals`

## Arguments

- `$ARGUMENTS` - Relative path under `docs/specs/` that should be archived.

## Output

Move the completed spec folder from:

```text
docs/specs/$ARGUMENTS/
```

to:

```text
docs/specs/archive/YYYY-MM-DD-$SAFE_NAME/
```

Where `$SAFE_NAME` is `$ARGUMENTS` converted to a filesystem-safe flat name by replacing `/` with `--`.

Example:

```text
docs/specs/bugfix/login-redirect/
docs/specs/archive/2026-05-16-bugfix--login-redirect/
```

## Behavior

### Step 0: Load Context

**Token Optimization (Prompt Caching):** To maximize prompt caching, always read the constitutional baseline documents FIRST and in the exact same order across all sessions before reading task-specific files.

1. Confirm `docs/specs/$ARGUMENTS/` exists.
2. Read project-level context ONLY if needed to interpret archive readiness (IN THIS ORDER):
   - root `CLAUDE.md`
   - `AGENTS.md`
   - `docs/prd.md`
   - `docs/ux-ui/design.md` (legacy fallback: `docs/system-design/design.md`)
   - `docs/trd/trd.md` (legacy fallback: `docs/detailed-design/detailed-design.md`)
   - `docs/specs/general-setup/`
3. Read all available files in the spec folder, especially:
   - `proposal.md` if present
   - `requirements.md`
   - `design.md`
   - `tasks.md`
   - `execution.md` if present
   - `test-report.md` if present
   - `validation-report.md` if present
4. Read Kaizen inputs (each only if it exists):
   - `docs/specs/kaizen-log.md`
   - `docs/specs/drift-report.md`
   - `docs/specs/quick/quick-log.md` (only if this spec escalated from `/akili-quick`)

### Step 1: Check Archive Readiness

Verify the spec is ready to archive:

- `requirements.md`, `design.md`, and `tasks.md` exist
- all required tasks are marked `[x]`, or incomplete tasks are explicitly accepted as follow-up work
- `test-report.md` exists, or the absence is explicitly accepted
- `validation-report.md` exists, or the absence is explicitly accepted
- no unresolved FAIL findings remain in `validation-report.md`
- WARN findings are either accepted or assigned to follow-up tasks
- implementation drift is reflected in the AKILI-SPECS docs or execution notes

If readiness is unclear, stop and ask the user whether to proceed, validate first, or keep the spec active.

### Step 2: Create Archive Summary

Write the summary (and later the Kaizen log entry) following `cognitive-doc-design`: lead with the outcome, keep sections small, and prefer tables and checklists over prose.

Before moving the folder, create or update:

```text
docs/specs/$ARGUMENTS/archive-summary.md
```

The summary must include:

1. Document Control
2. Original Spec Path
3. Archive Date
4. Final Status
5. Requirements Delivered
6. Files Changed Summary, based on `execution.md` when available
7. Test Evidence Summary
8. Validation Summary
9. Accepted Warnings Or Follow-Ups
10. Historical Notes

### Step 3: Constitution & Graph Sync

Before moving the folder, sync the project constitution with what the spec actually changed:

1. **Read impact notes:** Collect every `## Constitution Impact` block from `execution.md` and the files-changed summary. If none exist but the diff clearly introduced a new module/package, treat that as an implicit impact note.
2. **Agent guide sync:** For each impacted module:
   - Create or update the child `CLAUDE.md`/`AGENTS.md` when the module's conventions diverge from the root (thin, module-specific, never duplicating root rules).
   - Add or refresh the child's entry in the parent guides' `## Module Guides` index.
   - Update any root-guide statements the change made stale (structure descriptions, module lists, key commands).
   - Follow the inheritance convention from `/akili-constitution` Step 7 — if the project has no `## Module Guides` index yet, add it rather than inventing a parallel structure.
3. **CodeGraph Refresh Hook:** Check if `.codegraph/` exists in the repository root. If it does, recommend that the user or environment runs a fresh CodeGraph indexing/update (e.g. running `codegraph index` or equivalent) so the graph reflects the new or reshaped modules.

### Step 4: Kaizen Retrospective

Before moving the folder, **load the `kaizen` skill and follow its loop contract**: one bounded continuous-improvement pass over the completed spec — **Measure → Learn → Standardize → Record**. The pass reads only files already loaded in Step 0, produces at most 3 lessons and one log entry, and must never block the archive.

#### 4.1 — Measure

Extract the improvement signals listed in the skill's Measure table from the spec's own evidence: Reviewer FAIL rework attempts, HALTs and FATAL_FAILs, `## Pivot Record` blocks, PRODUCT_BUG findings, severe judgment-day findings, validation FAIL/WARN counts, `/akili-quick` escalations, and drift attributable to this spec.

If every signal is clean, record a one-line **clean run** entry in Step 4.4 and skip 4.2–4.3.

#### 4.2 — Learn

Distill **0 to 3** lessons following the skill's hard rules: every lesson names a root cause and cites its evidence (file + section); generic lessons are banned; prefer zero lessons over filler; a repeated root cause increments recurrence and raises severity instead of duplicating. Classify each lesson's target as **Product** (this project) or **Methodology** (the root cause is AKILI itself).

#### 4.3 — Standardize (HITL)

For each lesson, propose exactly one minimal edit (1–3 lines) to the most durable home (constitution guides, `docs/specs/general-setup/` templates, `docs/ux-ui/design.md`, or `.agents/` personas — append-only). Methodology lessons get no local edit; record them for upstreaming to the AKILI methodology repository. Present the skill's approval menu (Apply all / Apply selected / Defer all / Type something); recommend "Apply all" when any High-severity lesson exists, otherwise "Defer all". **Every edit outside the kaizen log requires this approval.**

#### 4.4 — Record

Create or update `docs/specs/kaizen-log.md` using the skill's Kaizen Log Format: prepend the new entry under `## Entries`, refresh `## Active Lessons` (10 rows max, retire institutionalized lessons).

### Step 5: Move Folder

1. Ensure `docs/specs/archive/` exists.
2. Move `docs/specs/$ARGUMENTS/` to `docs/specs/archive/YYYY-MM-DD-$SAFE_NAME/`.
3. If the target archive folder already exists, do not overwrite it. Add a numeric suffix such as `-2` and report the final path.

### Step 6: Report To User

Present:

1. archived source path
2. final archive path
3. final validation status
4. unresolved follow-ups, if any
5. whether the active spec directory is now clean
6. constitution sync summary: guides created or updated, parent index entries touched, and whether a CodeGraph re-index is recommended
7. Kaizen summary: metrics captured, lessons recorded (IDs), standardization actions applied or deferred, and any Methodology lessons suggested for upstreaming to the AKILI repo

## Error Handling

- If the spec path does not exist, report the missing path and stop.
- If required docs are missing, ask whether to archive anyway or run the missing command first.
- If validation has unresolved FAIL findings, recommend fixing or explicitly accepting risk before archive.
- If moving the folder fails, leave the original folder in place and report the reason.
- Do not delete spec folders as part of archiving; only move them into `docs/specs/archive/`.
- The Kaizen retrospective must never block the archive. If retrospective inputs are missing or the user declines, append a metrics-only (or clean-run) entry to `docs/specs/kaizen-log.md` and continue to Step 5.
- Never edit files outside `docs/specs/kaizen-log.md` without explicit user approval in Step 4.3.

---

## Authorship

AKILI-SPECS methodology by **Juan Carlos Cadavid** — [jcadavid.com](https://jcadavid.com). Licensed under the MIT License.
