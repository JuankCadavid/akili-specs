---
description: Execute approved specs systematically following the AKILI-SPECS methodology with spec-to-code traceability.
license: MIT
metadata:
  author: Juan Carlos Cadavid (jcadavid.com)
---

# Execute AKILI-SPECS Tasks

Execute implementation tasks from an approved AKILI-SPECS spec path using the AKILI **Leader → Implementer → Reviewer** multi-agent triad. Read `tasks.md`, choose the next eligible task, delegate implementation, audit the diff, retry on failure (max 3 attempts), update task status, and record the full audit trail in `execution.md`.

Execution should be incremental. Do not turn one approved task into a broader refactor unless the spec explicitly requires it or the user approves the scope change.

## Usage

```
/akili-execute <spec-path>
```

**Examples:**

- `/akili-execute loan`
- `/akili-execute enhancements/renewals`

## Arguments

- `$ARGUMENTS` — Relative path under `docs/specs/` that already contains `requirements.md`, `design.md`, and `tasks.md`.

## Output

Each successful task execution should produce:

- focused code or documentation changes within task scope
- updated task status in `tasks.md`
- an appended audit entry in `execution.md` covering every Implementer attempt and every Reviewer verdict
- verification evidence from the command or check listed in the task
- a Reviewer PASS verdict before the task is marked complete

Use `[~]` for a started but incomplete or blocked task, `[x]` for a completed task, and `[ ]` for pending work.

---

## Multi-Agent Triad

In this command you act as the **Leader** (Orchestrator). You delegate concrete work to two subordinate agent roles defined in the project's `.agents/` directory:

- `.agents/leader.md` — orchestration rules and audit conventions (your own playbook).
- `.agents/implementer.md` — the persona used when delegating implementation.
- `.agents/reviewer.md` — the persona used when delegating spec-conformance audit.

If `.agents/` is missing, run `/akili-constitution` first to scaffold it. Do not invent personas inline — the constitution is the source of truth.

**Delegation mechanism by tool:**

- **Claude Code / OpenCode:** if the project has tool-native AKILI agent wrappers (scaffolded by `/akili-constitution` Step 8E — e.g. `.claude/agents/akili-implementer.md` / `akili-reviewer.md` with `model:` bindings from the `## Model Routing` registry), **spawn those named agents** so each role runs on its tier's model and author ≠ auditor is enforced by configuration. Otherwise, spawn a focused subagent (or sub-prompt context) seeded with the persona file plus the task/diff context.
- **Google Antigravity:** invoke `invoke_subagent` (or the equivalent workflow primitive) using prompts read from `.agents/` (no per-agent model binding — guidance-only routing).

The Leader does not write production code itself unless the rework loop is exhausted and the user has explicitly approved a fallback.

**Communication economy:** load the `caveman` skill and apply its Scope Contract to all transient output in this command — inter-agent messages (Leader ↔ Implementer/Reviewer briefs, reports, feedback relays) at `full`, user-visible progress lines at `lite`. It never applies to `execution.md` audit entries, PR descriptions, HITL summaries, Pivot blockers, or verbatim evidence (Reviewer FAIL reports pass unchanged — the Structured Feedback rule wins).

---

## Behavior

### Step 0: Load Context

**Model checkpoint:** As Leader you run best on **T1** — orchestration here is judgment, not dispatch: you decompose in flight, **select each Implementer's skills**, adjudicate Reviewer FAILs, and decide pivots. You write no code, but these calls gate the whole run (low volume, high leverage). The Implementer/Reviewer route through the Step 8E agent wrappers (their own tier models — Implementer T2, Reviewer T3) when present. If the project's `## Model Routing` registry (root `AGENTS.md`/`CLAUDE.md`) maps T1 to a model different from the current session model, tell the user in one line — e.g. *"The Leader loop is T1 — the registry recommends `/model opus`; you are on sonnet"* — and offer to switch (`/model …` in Claude Code, the model selector in OpenCode) at the first approval pause. Never block on this; continuing on the current model is always allowed.

**Token Optimization (Prompt Caching):** To maximize prompt caching, always read the constitutional baseline documents FIRST and in the exact same order across all sessions before reading task-specific files.

1. Read the project constitutional docs (IN THIS ORDER):
   - root `CLAUDE.md`
   - `AGENTS.md`
   - `docs/prd.md`
   - `docs/ux-ui/design.md` (legacy fallback: `docs/system-design/design.md`)
   - `docs/trd/trd.md` (legacy fallback: `docs/detailed-design/detailed-design.md`)
   - `docs/specs/general-setup/`
   - Package-level `CLAUDE.md` and `AGENTS.md` files if they exist
2. Read the AKILI-SPECS documents for the spec path:
   - `docs/specs/$ARGUMENTS/requirements.md`
   - `docs/specs/$ARGUMENTS/design.md`
   - `docs/specs/$ARGUMENTS/tasks.md`
3. Read `docs/specs/$ARGUMENTS/execution.md` if it exists.
   - Also read `docs/specs/kaizen-log.md` if it exists — ONLY the `## Active Lessons` table (skip `## Entries`).
4. Read the agent personas:
   - `.agents/leader.md`
   - `.agents/implementer.md`
   - `.agents/reviewer.md`
5. Identify current task state: `[x]`, `[~]`, `[ ]`.

### Step 1: Select Next Task(s)

1. Find the next executable task by document order where:
   - status is `[ ]` or `[~]`
   - all dependencies are `[x]`
2. If a task is `[~]`, resume it using `execution.md` context.
3. If no tasks are eligible, report completion or blocking state and stop.
4. **Parallel Execution:** If multiple tasks are eligible AND they are completely independent (e.g., they touch completely different domains or files), you MAY spawn multiple Implementers in parallel to execute them concurrently. Otherwise, prefer executing the first task by document order to avoid merge conflicts.

### Step 2: Execute Task via Rework Loop

The Leader executes each task through a bounded loop. The loop terminates on Reviewer `PASS`, on HALT after 3 failed attempts, or on a Pivot.

```text
attempt = 1
feedback = none
loop:
  spawn Implementer with task scope + design context + feedback (if any)
  receive Implementer report (changes + verification evidence)
  extract git diff
  spawn Reviewer with diff + spec context
  receive Reviewer verdict (PASS | FAIL)
  if PASS:
    finalize task (Step 3)
    exit loop
  else (FAIL):
    append FAIL findings to execution.md
    if attempt >= 3:
      HALT, mark task [~], present audit trail (Step 4)
      exit loop
    feedback = Reviewer issues
    effort = bump one level (medium → high → xhigh)   # a failed fix is usually under-thinking
    attempt += 1
    continue loop
```

#### 2.1 — Read Scope & Design (Leader)

- Re-read the specific design sections referenced by the task.
- Re-read the requirements and scenarios covered by the task.
- Identify the smallest safe change that satisfies the task.
- Identify the verification command listed in the task.

#### 2.2 — Spawn Implementer

Delegate to the Implementer with:

- the persona content from `.agents/implementer.md`
- the active task ID, title, and scope from `tasks.md`
- the relevant slices of `requirements.md`, `design.md`, and `trd.md`
- the project constitution references (`CLAUDE.md`, `AGENTS.md`, `docs/ux-ui/design.md`)
- the skill set **you select for this task as Leader**. The task's recommended list (e.g. `ui-ux-pro-max`, `react-doctor`, `nestjs-expert`) and the project's `## Skill Map` (root `AGENTS.md`/`CLAUDE.md`) are your **defaults, not a fixed pass-through**: judge the task's actual nature and augment, narrow, or override them — add a skill the task missed, drop one that does not fit, swap in the better match (e.g. include `gsap-animation` and its matching reference file when the work touches animation even if unlisted). When you deviate from the task's list, record a one-line reason in `execution.md`. Fall back to the Skill Map only when the task lists none and you see no better fit
- the **effort you select for this task** (the *Effort dial* in `## Model Routing`, orthogonal to the tier): default `medium`, flexed to `low` for trivial/mechanical work, `xhigh` for complex (algorithm, concurrency, security, ambiguity), `max` for correctness-critical. Where the tool exposes a per-spawn effort knob, set it; otherwise steer depth in the brief. Never `max` a cheaper tier — if a task wants `max`, escalate the tier instead
- any prior Reviewer feedback when this is a rework attempt
- any Active Lessons from `docs/specs/kaizen-log.md` relevant to the task's domain (pass only the matching rows, never the full log)
- the verification command to run before reporting completion

The Implementer must keep changes minimal and within task scope, follow the design spec exactly unless the spec is clearly incomplete or contradictory, and run the verification before reporting completion.

#### 2.3 — Spawn Reviewer

When the Implementer reports completion, the Leader:

1. Extracts the **git diff** of changes since the start of the attempt. To save tokens, the Reviewer MUST ONLY be given the diff, not the entire source files, unless absolutely necessary for context.
2. Spawns the Reviewer with:
   - the persona content from `.agents/reviewer.md`
   - the **git diff**
   - the relevant slices of `requirements.md`, `design.md`, `trd.md`, and `docs/ux-ui/design.md`
   - the Implementer's verification evidence

The Reviewer is read-only. It must conclude with either:

- **`STATUS: PASS`** + a 1–2 sentence summary
- **`STATUS: FAIL`** + a structured list of issues, each containing:
  1. **Discovered Issue** — what is incorrect or missing
  2. **Violated Rule** — the specific spec document and section violated
  3. **Remediation Suggestion** — what the Implementer must change
- **`STATUS: FATAL_FAIL`** — Used ONLY if the Reviewer detects a critical architectural violation, a broken fundamental design token, or a completely unviable approach that cannot be fixed by simple iteration. This triggers an immediate abort of the rework loop (Fail-Fast) to save tokens.

#### 2.4 — Loop Guardrails

- **Maximum Retries:** A hard ceiling of **3 rework attempts** per task. This prevents infinite loops and token waste.
- **Fail-Fast (FATAL_FAIL):** If the Reviewer issues a `STATUS: FATAL_FAIL`, immediately HALT the loop, mark the task `[~]`, and trigger the Pivot Protocol. Do not consume remaining rework attempts.
- **Structured Feedback:** On `FAIL`, pass the full Reviewer report unchanged to the next Implementer spawn. Do not paraphrase.
- **Escalation on HALT:** After 3 failed attempts (or a FATAL_FAIL), mark the task `[~]`, log the full loop history in `execution.md`, and present the audit trail to the user for guidance.
- **Pivot Detection:** If either the Implementer or the Reviewer surfaces evidence that the spec itself is wrong or unviable (not merely the implementation), stop looping immediately and trigger the Pivot Protocol below — do not consume rework attempts on a broken spec.

### Step 3: Finalize on PASS

Only after a Reviewer `PASS`:

1. Update `tasks.md` from `[ ]` (or `[~]`) to `[x]`.
2. Append a structured entry to `execution.md` (see log format below) covering every attempt in this task's loop.
3. **Git Commit Staging:** Always follow the **AKILI Spec Reference** commit standard. Prefix the commit message with `[SPEC:<spec-path>]` (e.g. `git commit -m "[SPEC:changes/add-remember-me] implement secure cookie storage"`). When writing a PR description for the spec's work, load `cognitive-doc-design` and follow its PR and Review Docs rules: state what to review first, what is intentionally out of scope, and link chained PRs.
4. **Code Traceability:** Add file-level or block-level comment spec references (`// @akili-spec <spec-path>`) in critical or complex codebase additions to assist future audits.
5. **Constitution Impact Check:** If the task created a new module/package, moved a module boundary, or changed a module's public surface, append a `## Constitution Impact: <Task ID>` block to `execution.md` recording:
   - which module was created or reshaped
   - whether a child `CLAUDE.md`/`AGENTS.md` is needed for it (or an existing child guide became stale)
   - which parent guide's `## Module Guides` index needs a new or updated reference
   - that a CodeGraph re-index is pending
   These notes are consumed by `/akili-archive` (Constitution & Graph Sync). If skipping the sync until archive would leave the root guides actively misleading (e.g. a new top-level package agents keep guessing about), update the affected guides immediately in the same task commit instead of deferring.

### Step 4: HALT on Rework Limit

If 3 attempts fail in a row (or a FATAL_FAIL occurs):

1. **Automatic Rollback:** Run `git restore .` and `git clean -fd` to revert the working tree to a clean state. Do not leave broken code for the user to clean up.
2. Mark the task `[~]` in `tasks.md`.
3. Append a final `## HALT: <Task ID>` block to `execution.md` containing:
   - all three Reviewer `FAIL` reports
   - all three Implementer summaries
   - the verification output of the final attempt
   - the Leader's hypothesis on the root cause (spec ambiguity, missing context, environmental issue, etc.)
3. Present the blocker to the user with a clear question — for example: *"The Reviewer rejected three attempts on the same `design token compliance` finding. The spec at `design.md#tokens` does not list a token for this surface. How would you like to proceed?"*
4. Do **not** advance to the next task automatically after a HALT.

### Step 5: Continue or Pause

After a task PASSes or HALTs, generate a short, easy-to-understand summary (summary facil de entender de lo que se hizo) of the task result, verification outcome, the Reviewer summary, and the next eligible task. Ask whether to continue, pause, or skip the next task.

---

## Execution Log Format (`execution.md`)

The execution log is created on first run and appended to on subsequent runs. It is the canonical audit trail of the multi-agent loop.

Minimum sections:

1. Document Control
2. Task Execution History
3. Summary when all tasks are complete

Each task entry must record:

- final status (PASS / HALT / pivot)
- date
- task ID and title
- number of Implementer attempts run
- for each attempt: files changed, Implementer verification command + result, Reviewer verdict + summary or full FAIL findings
- requirements covered
- decisions made
- issues encountered
- final verification result

A minimal PASS-on-first-attempt entry can be compact; a HALT or rework entry must include the full attempt-by-attempt history.

---

## Error Handling & Pivot Protocol

- If required AKILI-SPECS files are missing, stop and report what is missing.
- If `.agents/` is missing, stop and direct the user to run `/akili-constitution`.
- If the design is ambiguous, the Leader asks the user before spawning the Implementer — do not pass an ambiguous task into the loop.
- If verification fails inside the Implementer, the Implementer must fix it before reporting completion; if it cannot, it reports back the failure and the Leader treats that as an implicit FAIL.
- If a task is blocked, report the blocker and move to the next eligible task only if appropriate.
- **Pivot Protocol:** If Implementer or Reviewer discoveries reveal that the approved requirements or design are wrong or technically unviable:
  1. Stop the rework loop. Mark the current task as `[~]` (blocked) — even if rework attempts remain.
  2. Document the blocker, alternatives, and revised technical direction in `execution.md` inside a new `## Pivot Record: <Task ID>` section.
  3. Modify the spec's `requirements.md`, `design.md`, and/or `tasks.md` to map out the updated plan.
  4. Stop, explain the situation to the user, and obtain explicit review/approval on the pivot before resuming execution.

---

## Authorship

AKILI-SPECS methodology by **Juan Carlos Cadavid** — [jcadavid.com](https://jcadavid.com). Licensed under the MIT License.
