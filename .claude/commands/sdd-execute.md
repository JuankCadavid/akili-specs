# Execute SDD Tasks

Execute the implementation tasks from a previously generated SDD module. Reads `tasks.md`, picks the next unfinished task respecting dependencies, implements it, updates the task status, and logs progress to `execution.md`.

## Usage

```
/sdd-execute <module-name>
```

**Example:** `/sdd-execute dashboard` reads from `docs/specs/dashboard/tasks.md` and creates/appends to `docs/specs/dashboard/execution.md`.

## Arguments

- `$ARGUMENTS` — The module name matching a directory under `docs/specs/` that already contains `requirements.md`, `design.md`, and `tasks.md`.

---

## Behavior

### Step 0: Load Context

1. Read the SDD documents for the module:
   - `docs/specs/$ARGUMENTS/requirements.md` — functional requirements
   - `docs/specs/$ARGUMENTS/design.md` — architecture and data model
   - `docs/specs/$ARGUMENTS/tasks.md` — task list with statuses and dependencies
2. Read the execution log if it exists:
   - `docs/specs/$ARGUMENTS/execution.md` — prior execution history
3. Read the project's CLAUDE.md files for conventions:
   - Root `CLAUDE.md`
   - `apps/backend/CLAUDE.md`
   - `apps/frontend/CLAUDE.md`
   - `apps/shared/CLAUDE.md` (if exists)
4. Identify the current state: which tasks are `[x]` (complete), `[~]` (in progress), `[ ]` (not started)

### Step 1: Select Next Task

1. Find the next executable task — the first task (by document order) where:
   - Status is `[ ]` (not started) or `[~]` (in progress)
   - All dependency tasks are `[x]` (complete)
2. If a task is `[~]` (in progress), resume it — read execution.md for context on what was already done
3. If no tasks are eligible (all done or blocked), report completion status and stop
4. Display to the user: **"Executing TASK-{ID}: {title}"** with a brief summary of scope

### Step 2: Execute Task

For each task, follow this sequence:

#### 2.1 — Read Scope & Design
- Re-read the specific design sections referenced in the task's **Design Ref**
- Read any existing files that will be modified (listed in the task scope)
- Understand the full context before writing any code

#### 2.2 — Invoke Relevant Skills
- Load the skills listed in the task's **Skills** field
- Use `nestjs-expert` for NestJS module/service/controller patterns
- Use `shadcn-ui` + `tailwind-design-system` + `frontend-design` for UI components
- Use `vercel-react-best-practices` for React hooks and state management
- Use `api-design-principles` for endpoint design and DTOs
- Use `error-handling-patterns` for exception handling
- Use `systematic-debugging` for test failures or unexpected behavior

#### 2.3 — Implement
- Write the code following the design specification exactly
- Follow existing codebase patterns and conventions (from CLAUDE.md files)
- Create new files or modify existing files as specified in the task scope
- Keep changes minimal and focused on the task scope — do not add features beyond what the task requires

#### 2.4 — Verify
- Run the verification command specified in the task's **Tests** field
- Common verifications:
  - `turbo build` — type checking across all packages
  - `turbo lint` — linting
  - Unit tests if specified
  - Manual endpoint testing via curl if API task
- If verification fails, debug and fix before marking complete

### Step 3: Update Status

1. **Update `tasks.md`**: Change the task's status from `[ ]` to `[x]`
2. **Append to `execution.md`**: Log the execution details (see format below)

### Step 4: Continue or Pause

After completing a task, ask the user:

**"TASK-{ID} complete. Next up: TASK-{NEXT_ID}: {title}. Continue?"**

Options:
- **Continue** — proceed to the next task
- **Pause** — stop execution, user will resume later with `/sdd-execute {module}`
- **Skip next** — skip the next task and pick the one after it

If the user says "Continue", go back to Step 1 and execute the next task.

---

## Execution Log Format (`execution.md`)

The execution log is created on first run and appended to on subsequent runs.

```markdown
# Execution Log — {Module Name}

## Document Control

| Field | Value |
|-------|-------|
| Module | {Module Name} |
| SDD Reference | docs/specs/{module}/tasks.md |
| Started | {date of first execution} |
| Last Updated | {date of last execution} |

---

## Task Execution History

### TASK-{ID}: {Title}
- **Status:** Completed
- **Date:** {ISO date}
- **Duration:** {approximate}
- **Files Changed:**
  - `path/to/file.ts` — {brief description of change}
  - `path/to/new-file.ts` — Created: {brief description}
- **Decisions Made:**
  - {Any implementation decisions that deviated from or clarified the design}
- **Issues Encountered:**
  - {Any problems hit and how they were resolved}
- **Verification:** {Result of running tests/build}

---

### TASK-{NEXT_ID}: {Title}
...
```

---

## Error Handling

- **Build failure after task:** Debug using `systematic-debugging` skill. Fix the issue, re-verify, then mark complete.
- **Migration failure:** Do NOT mark task as complete. Log the error in execution.md, report to user, and pause.
- **Blocked task:** If a task's dependencies aren't met, skip it and find the next eligible task. Report the blocked task to the user.
- **Ambiguous design:** If the design.md doesn't specify enough detail for implementation, ask the user for clarification using `AskUserQuestion` before proceeding.

---

## Resumption

When `/sdd-execute {module}` is run and `execution.md` already exists:

1. Read execution.md to understand what's been done
2. Read tasks.md to find current statuses
3. Pick up from the next incomplete task
4. Do NOT re-execute completed tasks

---

## Completion

When all tasks are `[x]`:

1. Add a **Summary** section to execution.md:
   ```markdown
   ## Summary

   | Metric | Value |
   |--------|-------|
   | Total Tasks | {N} |
   | Completed | {N} |
   | Skipped | {N} |
   | Started | {date} |
   | Completed | {date} |
   | Files Created | {count} |
   | Files Modified | {count} |
   ```

2. Report to the user: **"All {N} tasks complete for {module}. Execution log saved to docs/specs/{module}/execution.md."**
