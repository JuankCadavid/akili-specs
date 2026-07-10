---
description: Archive a completed spec task, sync agent guides and CodeGraph, and keep the TRD current.
---

# Archive SDD Spec

Archive a completed SDD spec path after implementation, testing, and validation are done.

Archiving preserves the full decision trail. It keeps active `docs/specs/` easier to scan while retaining proposal, requirements, design, tasks, execution notes, test evidence, and validation evidence for future review.

## Usage

```
/sdd-archive <spec-path>
```

**Examples:**

- `/sdd-archive changes/add-remember-me`
- `/sdd-archive bugfix/login-redirect`
- `/sdd-archive enhancements/renewals`

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

1. Confirm `docs/specs/$ARGUMENTS/` exists.
2. Read all available files in that folder, especially:
   - `proposal.md` if present
   - `requirements.md`
   - `design.md`
   - `tasks.md`
   - `execution.md` if present
   - `test-report.md` if present
   - `validation-report.md` if present
3. Read project-level context only if needed to interpret archive readiness:
   - `docs/prd.md`
   - `docs/ux-ui/design.md` (legacy fallback: `docs/system-design/design.md`)
   - `docs/trd/trd.md` (legacy fallback: `docs/detailed-design/detailed-design.md`)
   - `docs/specs/general-setup/`

### Step 1: Check Archive Readiness

Verify the spec is ready to archive:

- `requirements.md`, `design.md`, and `tasks.md` exist
- all required tasks are marked `[x]`, or incomplete tasks are explicitly accepted as follow-up work
- `test-report.md` exists, or the absence is explicitly accepted
- `validation-report.md` exists, or the absence is explicitly accepted
- no unresolved FAIL findings remain in `validation-report.md`
- WARN findings are either accepted or assigned to follow-up tasks
- implementation drift is reflected in the SDD docs or execution notes

If readiness is unclear, stop and ask the user whether to proceed, validate first, or keep the spec active.

### Step 2: Create Archive Summary

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
   - Follow the inheritance convention from `/sdd-constitution` Step 7 — if the project has no `## Module Guides` index yet, add it rather than inventing a parallel structure.
3. **CodeGraph Refresh Hook:** Check if `.codegraph/` exists in the repository root. If it does, recommend that the user or environment runs a fresh CodeGraph indexing/update (e.g. running `codegraph index` or equivalent) so the graph reflects the new or reshaped modules.

### Step 4: Move Folder

1. Ensure `docs/specs/archive/` exists.
2. Move `docs/specs/$ARGUMENTS/` to `docs/specs/archive/YYYY-MM-DD-$SAFE_NAME/`.
3. If the target archive folder already exists, do not overwrite it. Add a numeric suffix such as `-2` and report the final path.

### Step 5: Report To User

Present:

1. archived source path
2. final archive path
3. final validation status
4. unresolved follow-ups, if any
5. whether the active spec directory is now clean
6. constitution sync summary: guides created or updated, parent index entries touched, and whether a CodeGraph re-index is recommended

## Error Handling

- If the spec path does not exist, report the missing path and stop.
- If required docs are missing, ask whether to archive anyway or run the missing command first.
- If validation has unresolved FAIL findings, recommend fixing or explicitly accepting risk before archive.
- If moving the folder fails, leave the original folder in place and report the reason.
- Do not delete spec folders as part of archiving; only move them into `docs/specs/archive/`.
