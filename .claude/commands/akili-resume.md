---
name: akili-resume
description: Resume work after a session break by scanning active specs and presenting a multi-spec dashboard briefing.
license: MIT
metadata:
  author: Juan Carlos Cadavid (jcadavid.com)
---

# Resume AKILI-SPECS Session

Recover context after a session break, accidental close, or when switching between projects. Scans all active specs under `docs/specs/` and presents a dashboard showing where each spec stands.

> **Recommended model tier:** T5 Fast-Cheap. This is a file-scanning and summarization job; a deep reasoning model is not required.

## Usage

```
/akili-resume
```

No arguments required. The command scans `docs/specs/` automatically.

## Behavior

### Step 0: Scan Active Specs

**Model checkpoint:** This phase runs best on **T5 Fast-Cheap** — file scanning and summarization; reasoning depth is not the bottleneck. If the project's `## Model Routing` registry (root `AGENTS.md`/`CLAUDE.md`) maps that tier to a model different from the current session model, check the direction first — the registry is a floor, not a ceiling: if the session model is the stronger one (e.g. a newer generation than a stale entry), pass silently and flag the registry entry for update instead of recommending a downgrade. Only when the registry model is stronger for this tier, tell the user in one line — e.g. *"Resume is T5 — the registry recommends `/model haiku`; you are on opus"* — and offer to switch (`/model …` in Claude Code, the model selector in OpenCode). Never block on this; continuing on the current model is always allowed (and switching is rarely worth it for a single scan).

1. **Read spec family manifests first.** `Glob` for every `family.md` under `docs/specs/` (excluding `archive/`) and read each one found — Document Control + ordered child table (schema defined once in `akili-constitution.md` Step 7 item 4; reference it here, don't restate it). For each manifest-listed child, verify its `Spec Path` folder actually exists; report any mismatch as drift on screen (KZ-002: aggregate claims are grep-falsified, not trusted) rather than reconciling or repairing the manifest or writing a drift report. Skip this item entirely when no `family.md` exists — zero added steps for flat-spec-only projects (NFR-1).
2. List all directories under `docs/specs/` (excluding `archive/`). A folder whose only spec file is `family.md` is the family container, not a spec — it renders as the spec-family heading in Step 2, never as its own spec entry and never as an `/akili-specify` target.
3. For each spec directory, read available files to determine current phase:
   - `proposal.md` exists → proposed
   - `requirements.md` exists → requirements defined
   - `design.md` exists → design defined
   - `tasks.md` exists → tasks defined
   - `execution.md` exists → in execution or completed
   - `test-report.md` exists → tested
   - `validation-report.md` exists → validated

### Step 1: Determine Phase & Progress

For each spec, determine:

- **Current Phase:** PROPOSE → SPECIFY → EXECUTE → TEST → VALIDATE → ARCHIVE
- **Progress:** Count `[x]` vs total tasks in `tasks.md`
- **Last Action:** Most recent entry in `execution.md` (if exists)
- **Blocked:** Any `[~]` tasks or unresolved FAIL findings

### Step 2: Present Dashboard

If **one spec** is active, go directly to the briefing:

```markdown
📋 Resuming: changes/add-remember-me

Phase: EXECUTION
Progress: ██████░░ 6/8 tasks done

Last Action:
  Task 6 PASS — Implementer completed cookie persistence

Blocked: none

Ready to continue? Next eligible task:
  [ ] Task 7: Add remember-me checkbox to login form
```

If **multiple specs** are active, present a dashboard:

```markdown
📋 AKILI Active Specs (3 open)

1. changes/add-remember-me    [EXECUTION]  ██████░░ 6/8 tasks done
   Last: Task 6 PASS — Implementer completed cookie persistence
   Blocked: none

2. admin/user-management      [SPECIFY]    ████░░░░ Design approved, tasks pending
   Last: HITL menu — user approved design, pending task breakdown
   Blocked: none

3. bugfix/login-redirect      [VALIDATE]   ████████ 4/4 tasks done
   Last: Validation report — 1 WARN (missing edge case test)
   Blocked: none

Which spec do you want to resume? (or "all" for full briefing)
```

If one or more `family.md` manifests were read in Step 0, group that spec family's children under a spec-family heading (manifest order, status, blocked-by) instead of listing them flatly; specs with no manifest render exactly as today. A spec family is **one** entry in the header count and in the top-level numbering — it is one decision for the user, not N; the manifest `#` values number its children as a nested list:

```markdown
📋 AKILI Active Specs (2 open)

1. Spec family: bilateral/ (3 children, manifest order 1→2→3)
   1. bilateral/child-a   done
   2. bilateral/child-b   [EXECUTION]  ██████░░ 6/8 tasks done   Blocked by: none
   3. bilateral/child-c   pending      Blocked by: child-b (not done)

2. admin/user-management      [SPECIFY]    ████░░░░ Design approved, tasks pending
   Blocked: none
```

If `docs/specs/kaizen-log.md` exists, append a Kaizen footer line to either format, reading ONLY the `## Active Lessons` table:

```markdown
Kaizen: 3 active lessons (latest: KZ-003 — empty-state tokens before list UI)
```

### Step 3: Provide Full Briefing (if requested)

If the user selects "all" or if there's only one spec, provide a detailed briefing for each:

1. **Spec Path & Phase**
2. **Requirements Summary:** Key requirements from `requirements.md`
3. **Design Decisions:** Major decisions from `design.md`
4. **Task Status:** Completed, in-progress, blocked, pending
5. **Execution Trail:** Last 3 entries from `execution.md`
6. **Test Evidence:** Summary from `test-report.md` (if exists)
7. **Validation Status:** PASS/WARN/FAIL from `validation-report.md` (if exists)
8. **Next Actions:** Recommended next step based on current phase

### Step 4: Recommend Next Command

Based on the current phase, recommend the next command:

- PROPOSE → `/akili-specify <spec-path>`
- SPECIFY → `/akili-execute <spec-path>`
- EXECUTE → `/akili-execute <spec-path>` (continue next task)
- TEST → `/akili-test <spec-path>`
- VALIDATE → `/akili-validate <spec-path>` or `/akili-archive <spec-path>`
- ARCHIVE → `/akili-archive <spec-path>`

If a spec family exists (a `family.md` manifest was read in Step 0), recommend the next non-`done` child with satisfied `Depends on`, **by manifest order** — never by folder-discovery order, and never an activity absent from the manifest. Map that child's own phase to the command list above.

## Output

No files are created or modified. The command outputs a screen summary only.

## When To Run

- After accidentally closing Claude Code, OpenCode, or Antigravity
- When switching between projects and need to remember where you left off
- At the start of a new session to get a quick status overview
- Before planning the next work session to see what's available

## Error Handling

- If `docs/specs/` does not exist, report that the project has no active specs and suggest running `/akili-constitution` or `/akili-propose`.
- If `docs/specs/` is empty (only `archive/` exists), report that all specs are archived and suggest running `/akili-propose` for new work.
- If a spec folder exists but has no readable files: when it is a child listed in a spec family manifest (`family.md`) with `Status: pending`, report it as "pending by family order" instead. An unlisted folder keeps the existing behavior: report it as an incomplete spec and suggest running `/akili-specify <spec-path>`.

---

## Authorship

AKILI-SPECS methodology by **Juan Carlos Cadavid** — [jcadavid.com](https://jcadavid.com). Licensed under the MIT License.
