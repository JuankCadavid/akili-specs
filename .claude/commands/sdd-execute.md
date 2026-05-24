---
description: Execute approved specs systematically following the SDD methodology with spec-to-code traceability.
---

# Execute SDD Tasks

Execute implementation tasks from an approved SDD spec path. Read `tasks.md`, choose the next eligible task, implement only that task's scope, verify it, update task status, and record progress in `execution.md`.

Execution should be incremental. Do not turn one approved task into a broader refactor unless the spec explicitly requires it or the user approves the scope change.

## Usage

```
/sdd-execute <spec-path>
```

**Examples:**

- `/sdd-execute loan`
- `/sdd-execute enhancements/renewals`

## Arguments

- `$ARGUMENTS` — Relative path under `docs/specs/` that already contains `requirements.md`, `design.md`, and `tasks.md`.

## Output

Each successful task execution should produce:

- focused code or documentation changes within task scope
- updated task status in `tasks.md`
- an appended entry in `execution.md`
- verification evidence from the command or check listed in the task

Use `[~]` for a started but incomplete task, `[x]` for a completed task, and `[ ]` for pending work.

---

## Behavior

### Step 0: Load Context

1. Read the SDD documents for the spec path:
   - `docs/specs/$ARGUMENTS/requirements.md`
   - `docs/specs/$ARGUMENTS/design.md`
   - `docs/specs/$ARGUMENTS/tasks.md`
2. Read `docs/specs/$ARGUMENTS/execution.md` if it exists.
3. Read the project constitutional docs:
   - `docs/prd.md`
   - `docs/system-design/design.md`
   - `docs/detailed-design/detailed-design.md`
   - `docs/specs/general-setup/`
4. Read root and package-level `CLAUDE.md` files if they exist.
5. Identify current task state: `[x]`, `[~]`, `[ ]`.

### Step 1: Select Next Task

1. Find the next executable task by document order where:
   - status is `[ ]` or `[~]`
   - all dependencies are `[x]`
2. If a task is `[~]`, resume it using `execution.md` context.
3. If no tasks are eligible, report completion or blocking state and stop.
4. If multiple tasks are eligible, prefer the first task by document order unless there is a clear dependency or risk reason to choose another.

### Step 2: Execute Task

#### 2.1 — Read Scope & Design

- Re-read the specific design sections referenced by the task.
- Re-read the requirements and scenarios covered by the task.
- Read the existing files that will be touched.
- Confirm the implementation still matches the constitutional docs and module spec.
- Identify the smallest safe change that satisfies the task.

#### 2.2 — Invoke Relevant Skills

- Load only the skills listed in the task.
- If the task is UI-heavy, prefer `ui-ux-pro-max` when available.
- Otherwise use the documented fallback skills from the task or design.

#### 2.3 — Implement

- Keep changes minimal and within task scope.
- Follow the design specification exactly unless the spec is clearly incomplete or contradictory.
- If the design is ambiguous, ask the user for clarification before making up a direction.
- If implementation discovery invalidates the spec, stop and propose the smallest required spec update before continuing.
- Do not mark unrelated cleanup or opportunistic refactors as part of the task unless they are necessary for correctness.

#### 2.4 — Verify

- Run the verification command listed in the task.
- Fix failures before marking the task complete.
- If the listed command is unavailable, identify the closest repository-specific build, lint, test, or manual check and record the substitution in `execution.md`.

### Step 3: Update Status & Commit

1. Update `tasks.md` from `[ ]` to `[x]` when complete.
2. Use `[~]` when the task is partially complete or blocked.
3. Append implementation notes to `execution.md`.
4. **Git Commit Staging:** When staging and committing changes made for the task, always follow the **JCSPECS Spec Reference** commit standard. Prefix the commit message with `[SPEC:<spec-path>]` (e.g. `git commit -m "[SPEC:changes/add-remember-me] implement secure cookie storage"`).
5. **Code Traceability:** Add file-level or block-level comment spec references (`// @sdd-spec <spec-path>`) in critical or complex codebase additions to assist future audits.

### Step 4: Continue or Pause

After completing a task, summarize the task result, verification outcome, and next eligible task. Ask whether to continue, pause, or skip the next task.

---

## Execution Log Format (`execution.md`)

The execution log is created on first run and appended to on subsequent runs.

Minimum sections:

1. Document Control
2. Task Execution History
3. Summary when all tasks are complete

Each task entry should record:

- status
- date
- task ID and title
- files changed
- requirements covered
- decisions made
- issues encountered
- verification result

---

## Error Handling & Pivot Protocol

- If required SDD files are missing, stop and report what is missing.
- If the design is ambiguous, ask the user before proceeding.
- If verification fails, debug and fix before marking complete.
- If a task is blocked, report the blocker and move to the next eligible task if appropriate.
- **Pivot Protocol:** If implementation discoveries reveal that the approved requirements or design are wrong or technically unviable:
  1. Pause execution and mark the current task as `[~]` (blocked).
  2. Document the blocker, alternatives, and revised technical direction under `execution.md` inside a new `## Pivot Record: <Task ID>` section.
  3. Modify the spec's `requirements.md`, `design.md`, and/or `tasks.md` to map out the updated plan.
  4. Stop, explain the situation to the user, and obtain explicit review/approval on the pivot before resuming execution.
