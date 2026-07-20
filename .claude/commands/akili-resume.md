---
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

1. List all directories under `docs/specs/` (excluding `archive/`).
2. For each spec directory, read available files to determine current phase:
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
- If a spec folder exists but has no readable files, report it as an incomplete spec and suggest running `/akili-specify <spec-path>`.

---

## Authorship

AKILI-SPECS methodology by **Juan Carlos Cadavid** — [jcadavid.com](https://jcadavid.com). Licensed under the MIT License.
