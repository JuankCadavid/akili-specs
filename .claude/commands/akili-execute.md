---
name: akili-execute
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
- **Codex:** if the project has `.codex/agents/akili-implementer.toml` / `akili-reviewer.toml` (scaffolded by `/akili-constitution` Step 8E), request the named `akili-implementer` / `akili-reviewer` role by name with the brief — Codex spawns it, routes the work, and waits; consume the consolidated result it returns. Otherwise, fall back to a sub-prompt seeded with the persona file, as today. **Observed live 2026-09-17 (codex-cli 0.154.0):** the Leader calls a `spawn_agent` tool with the wrapper's name as `agent_type`; the subagent's final report returns to the Leader, and the thread is inspectable with `/subagents` — undocumented API, not a cited contract. Codex's default `workspace-write` sandbox protects `.git/`, so the Step 3 commit needs an approval (`--approve-for-me` or interactive) rather than running under the bare sandbox.

The Leader does not write production code itself unless the rework loop is exhausted and the user has explicitly approved a fallback.

**Runtime-failure fallback (per role):** a **runtime event** is neither a work FAIL nor a spec problem — **spawn failure** (the harness could not start the worker), **provider-limit death** (the worker was killed mid-task by a quota, rate, or session limit), **pane / terminal timeout** (a transient host failure), or **idle-without-report** (the worker's turn ended without its contracted report — handled entirely by `leader.md`'s idle-without-report protocol, cited by name, nothing restated here). Closing the enumeration, these are **not** runtime events and consume an attempt or stop the loop by the existing rules: an Implementer-reported verification failure (implicit FAIL), a Reviewer `FAIL`, a `FATAL_FAIL`, a Pivot-Detection stop, and a project-stack outage (Step 2.1's environment pre-check and `leader.md` → *Deferring a check*).

**Accounting rule:** an attempt is consumed by a Reviewer `FAIL` or an Implementer-reported verification failure, and by nothing else. No runtime event touches the attempt counter. Each role climbs its own fixed ladder, rung by rung, never improvising:

| Role | Ladder (climbed in order; each rung recorded per attempt) |
|---|---|
| Implementer | **1** retry once immediately (spawn failure, pane timeout) — for a provider-limit death, first **probe the tree** for partial edits and record them · **2** retry-after-N (N = 3 minutes, one retry, background wait, announced — the background-wait rule in `leader.md` → *Winding down*) · **3** resume-by-message when the worker's context survives (message the worker; the contracted report is the terminating act; verify delivery per `leader.md`) · **4** a fresh worker audits the partial diff and continues (the brief carries the partial diff as the starting state) · **5** the existing Leader-inline ask — a user stop; the no-code rule stands |
| Reviewer | **Never inline** — the Leader reviewing work it supervised breaks `author ≠ auditor`, and a runtime failure does not suspend a correctness constraint. **1** retry once · **2** retry-after-N (same terms) · **3** a different model (`/model`) or the registry's cross-host dispatch · **4** waiver — **is** a `REVIEW_WAIVED` record (Execution Log Format, below) — a user stop; **never inline without the record** |
| Tester | The `/akili-test` Deployment Rule already defines the inline path — use it and record it |

**Entry rungs:** each event kind starts the climb at a fixed rung, and from there the ladder is climbed in order as the table above states — a spawn failure leaves no partial work and starts at rung 1; a pane / terminal timeout starts at rung 1 and is usually cleared by rung 2; a provider-limit death starts at rung 1's tree probe, then continues to rung 3 when the worker's context survives the death, or to rung 4 when it does not; idle-without-report never starts here — it enters this ladder only at `leader.md`'s replace step, as a fresh spawn. A later event in the same attempt, of any kind, **continues the climb** from whichever is higher — the rung already reached, or the new event's own entry rung: the climb never moves backwards, so a provider-limit death whose worker context survives still goes to rung 3 even when the attempt is only at rung 1 or 2, never detouring through a lower rung's fresh spawn. A spent rung is never re-run, and a rung whose condition does not hold (rung 3, when no worker context exists to message) is skipped. This keeps the ladder bounded per attempt — a flapping host cannot loop rungs 1–2 forever — and the attempt's `runtime events:` line names every event that occurred and the single rung that recovered the attempt.

**Delegation Thresholds:** the Leader's inline-vs-delegate boundary is quantified in `.agents/leader.md` → *Delegation Thresholds* (inline only for 1-file checks and puntual verifications; 4+ full-file reads → scout subagent; 2+ non-trivial file writes → Implementer; CodeGraph lookups don't count toward the read threshold). Apply it to your own research inside this command — e.g. investigating a Reviewer FAIL across many files is scout work, not Leader-inline work.

**Delegation Ceiling:** that table is the floor; `.agents/leader.md` → *Delegation Ceiling* is the cap, and on current-generation models it is the one that binds. One subagent beats several for a single task, parallelism is bounded by the count of genuinely independent tasks in `tasks.md`, you commit to a delegation rather than re-deriving its result, and you never spawn a subagent to verify your own work. **The Implementer → Reviewer gate is exempt** — it is `author ≠ auditor` independence, not self-verification, and is never collapsed for efficiency.

**Communication economy:** load the `caveman` skill and apply its Scope Contract to all transient output in this command — inter-agent messages (Leader ↔ Implementer/Reviewer briefs, reports, feedback relays) at `full`, user-visible progress lines at `lite`. It never applies to `execution.md` audit entries, PR descriptions, HITL summaries, Pivot blockers, or verbatim evidence (Reviewer FAIL reports pass unchanged — the Structured Feedback rule wins).

---

## Behavior

### Step 0: Load Context

**Model checkpoint:** As Leader you run best on **T1** — orchestration here is judgment, not dispatch: you decompose in flight, **select each Implementer's skills**, adjudicate Reviewer FAILs, and decide pivots. You write no code, but these calls gate the whole run (low volume, high leverage). The Implementer/Reviewer route through the Step 8E agent wrappers (their own tier models — Implementer T2, Reviewer T3) when present. If the project's `## Model Routing` registry (root `AGENTS.md`/`CLAUDE.md`) maps T1 to a model different from the current session model, check the direction first — the registry is a floor, not a ceiling: if the session model is the stronger one (e.g. a newer generation than a stale entry), pass silently and flag the registry entry for update instead of recommending a downgrade. Only when the registry model is stronger for this tier, tell the user in one line — e.g. *"The Leader loop is T1 — the registry recommends `/model opus`; you are on sonnet"* — and offer to switch (`/model …` in Claude Code, the model selector in OpenCode, `/model` in Codex — which also sets reasoning effort when available, `Last verified: 2026-09-17` — https://learn.chatgpt.com/docs/cli/slash-commands) at the first approval pause. Never block on this; continuing on the current model is always allowed.

**Token Optimization (Prompt Caching):** To maximize prompt caching, always read the constitutional baseline documents FIRST and in the exact same order across all sessions before reading task-specific files.

1. Read the project constitutional docs (IN THIS ORDER):
   - root `CLAUDE.md`
   - `AGENTS.md`
   - `docs/prd.md`
   - `docs/ux-ui/design.md` (legacy fallback: `docs/system-design/design.md`)
   - `docs/trd/trd.md` (legacy fallback: `docs/detailed-design/detailed-design.md`)
   - Package-level `CLAUDE.md` and `AGENTS.md` files if they exist

   (`docs/specs/general-setup/` is deliberately **not** in this list: those are the *format templates* `/akili-specify` writes specs from. By the time execute runs, the spec documents are already written and this command's own log format is defined below — the executor consumes specs, it never authors them.)
2. Read the AKILI-SPECS documents for the spec path:
   - `docs/specs/$ARGUMENTS/requirements.md`
   - `docs/specs/$ARGUMENTS/design.md`
   - `docs/specs/$ARGUMENTS/tasks.md`
3. Read `docs/specs/$ARGUMENTS/execution.md` if it exists — **bounded, never cover to cover**: the Document Control block, the entry for any `[~]` task you may resume, and the most recent task entry. The log is append-only history that grows with every task; routine task selection does not need it, and reading it whole makes every run of a spec cost more than the one before. The full read belongs to `/akili-resume`, a HALT investigation, or a Pivot — the moments that are *about* the history.
   - Also read `docs/specs/kaizen-log.md` if it exists — ONLY the `## Active Lessons` table (skip `## Entries`).
4. Read the agent personas — **which ones depends on how you will spawn**:
   - `.agents/leader.md` — always: it is your own playbook.
   - `.agents/implementer.md` and `.agents/reviewer.md` — **only when the project has no Step 8E wrapper for that role.** A wrapper's entire body is the instruction to load its own persona, so a wrapper spawn reads it in the worker's context; the Leader reading it too pays the same tokens twice, and re-sending it in the brief pays them a third time as output. With wrappers present you orchestrate against the roles' **contracts** — the report shapes and `STATUS:` lines this command already defines — not against their persona text.
5. Identify current task state: `[x]`, `[~]`, `[ ]`.

### Step 1: Select Next Task(s)

1. Find the next executable task by document order where:
   - status is `[ ]` or `[~]`
   - all dependencies are `[x]`
2. If a task is `[~]`, resume it using `execution.md` context.
3. If no tasks are eligible, report completion or blocking state and stop.
4. **Parallel Execution:** If multiple tasks are eligible AND they are completely independent (e.g., they touch completely different domains or files), you MAY spawn multiple Implementers in parallel to execute them concurrently. Otherwise, prefer executing the first task by document order to avoid merge conflicts. **Width cap:** default 2 concurrent, at most 3–4 — ten independent tasks means waves of 2–4 landed between waves, never ten workers; the binding constraint is your own landing budget, per `.agents/leader.md` → *The landing is the bottleneck*.

### Step 2: Execute Task via Rework Loop

The Leader executes each task through a bounded loop. The loop terminates on a passing verdict — a Reviewer `PASS`, or a task that meets **Review intensity** (Step 2.3) with no Reviewer owed — on HALT after 3 failed attempts, or on a Pivot.

```text
attempt = 1
feedback = none
loop:
  spawn Implementer with task scope + design context + feedback (if any)
  receive Implementer report (changes + verification evidence)
  extract git diff
  evidence re-run (non-author) -> VERIFIED | MISMATCH   # Review intensity, Step 2.3 — always, never waived
  if MISMATCH:
    verdict = FAIL
  elif Review intensity met (Step 2.3) and no override applies:
    verdict = PASS
  else:
    spawn Reviewer with diff + spec context
    verdict = Reviewer verdict (PASS | FAIL)
  on runtime event: recover per the runtime table; attempt unchanged
  if verdict == PASS:
    finalize task (Step 3)
    exit loop
  else (FAIL):
    append FAIL findings to execution.md
    if attempt >= 3:
      HALT, mark task [~], present audit trail (Step 4)
      exit loop
    feedback = Reviewer issues, or the re-run's MISMATCH evidence if no Reviewer ran
    effort = bump one level (medium → high → xhigh)   # a failed fix is usually under-thinking
    attempt += 1
    continue loop
```

#### 2.1 — Read Scope & Design (Leader)

- Re-read the specific design sections referenced by the task.
- Re-read the requirements and scenarios covered by the task.
- Identify the smallest safe change that satisfies the task.
- Identify the verification command listed in the task.
- **Environment-dependent verification:** if the verification needs a running stack (integration behavior, manual smoke, anything hitting the database or a live server), consult the `## Local Environment` contract in `docs/infrastructure.md` and run its **pre-check** now — before spawning the Implementer. If the primary route is unavailable (e.g. the Docker daemon is off), ask the user whether to start it or proceed via the contract's fallback route; pass the resolved start/health-check commands in the Implementer's brief. If no contract exists, note the gap and recommend `/akili-constitution` (Step 6B) after the run.

#### 2.2 — Spawn Implementer

Delegate to the Implementer with a **pointer brief, not an anthology**. A host worker (see *Cross-host dispatch*) can read any project file itself, and what it reads lands in its context as cacheable input — while content you inline lands as your **output**, the most expensive tokens in the loop. Name paths and sections; copy only what the list below says to copy. A **non-host** worker is the standing exception: it cannot resolve project paths, so it keeps the self-contained brief.

- the persona: **nothing** when spawning the Step 8E wrapper — its body already loads `.agents/implementer.md`. Only the fallback sub-prompt path (no wrapper) seeds the persona content
- the active task ID, title, and scope from `tasks.md` (copied — it is the work order)
- **pointers** to the relevant sections of `requirements.md`, `design.md`, and `trd.md` — path + section anchor, with the instruction to read the named scenarios **verbatim at the source**. The verbatim rule protects against paraphrase drift, and a pointer satisfies it exactly as a quote does: the worker still reads the untouched text, it just reads it as input instead of receiving it as your output
- the constitution by reference (`CLAUDE.md`, `AGENTS.md`, `docs/ux-ui/design.md` — paths only; the Implementer's persona already orders its caching-friendly read sequence)
- **CodeGraph, when `.codegraph/` exists:** instruct the Implementer to resolve unfamiliar code through graph lookups — `codegraph_context` for the task area, `codegraph_impact` before touching a shared symbol — instead of exploratory full-file reads. A lookup answers "what is this / who uses it" for a fraction of the tokens of the file that contains it; full files are for what it is about to edit. **Staleness rule — include it in the brief:** the graph reflects the last index, not this run's changes, and it cannot flag its own staleness. For files this spec has already touched (earlier task entries, the current diff), **the working tree wins** — read the file, don't trust the graph. Graph answers are reliable for the code this spec has not modified, which is exactly the exploration the lookups are for. If `.codegraph/` is absent, say nothing — the worker explores by file as before, and the graph's absence is already controlled where it belongs (`/akili-constitution` offers init; `/akili-audit` records the state; `/akili-archive` recommends the re-index)
- **an exemplar file, when one exists** — the path of the existing file most similar to what this task produces, as a pattern anchor: *"mimic `src/modules/orders/orders.service.ts` — structure, naming, error handling, test layout"*. You choose it as Leader (CodeGraph or the module tree makes this a cheap lookup). A worked example steers a model more reliably than any list of conventions, and the pointer costs one line while replacing paragraphs of style prose; on conflict, the constitution and design spec still win over the exemplar. Skip it when nothing comparable exists — a forced, dissimilar exemplar teaches the wrong pattern
- the skill set **you select for this task as Leader** — the selection judgment (task list and `## Skill Map` as overridable defaults, deviations recorded in `execution.md`) is canonical in `.agents/leader.md` → *Delegation Discipline*, which is already in your context. In the brief, instruct explicitly: *"You MUST use the `skill` tool to load these skills: [names] BEFORE you begin writing code"*
- the **effort you select for this task** — the dial and its defaults are canonical in `.agents/leader.md` → *Delegation Discipline* and the registry's *Effort dial*. Where the tool exposes a per-spawn effort knob, set it; otherwise steer depth in the brief
- any prior Reviewer feedback when this is a rework attempt — **copied verbatim, never a pointer** (the Structured Feedback rule wins over brief economy), plus a one-line **Attempt History** so the retry does not repeat the dead end: *"attempt 1 tried X and failed with Y — do not repeat X"*
- any Active Lessons from `docs/specs/kaizen-log.md` relevant to the task's domain — **copied rows, never a pointer**: a pointer would make the worker read the full log, which costs more than the rows. Pointer-vs-copy is decided by economy, not dogma — point at what the worker would read anyway, copy what spares it a bigger read
- **any forward pointers recorded in `execution.md` against this task — copied, and re-read at the moment you compose this brief.** Earlier tasks' Reviewers routinely defer a branch to a later task, and the Leader records it; the record creates the appearance of ownership without the mechanism of transfer. A pointer filed three tasks ago is not carried by having been filed — the brief carries it or nobody does
- the verification command to run before reporting completion (copied)
- the task's `Falsifier`, `Red run`, and `Consumers` fields, copied beside the verification command (hand-off from `changes/gate-falsifiability`): instruct the Implementer to run every suite `Consumers` names and to report the assertion the red failed on. When the task carries none of these fields, the brief says so instead of copying nothing silently: `no Falsifier / Red run / Consumers fields in this task`
- **when its own verification may be the gate:** the brief tells the Implementer that, absent an override, its executed falsifier and fully deterministic verification may be the only check this task gets before it closes — see *Review intensity* at Step 2.3.

The Implementer must keep changes minimal and within task scope, follow the design spec exactly unless the spec is clearly incomplete or contradictory, and run the verification before reporting completion.

**Brief contract.** The brief is law to the worker: whatever it adds or drops is executed faithfully, so what goes into it is bound by five clauses.

- **(a) Narrow-never-widen.** The brief may restrict a task — fewer files, a tighter scope, an explicit order — but must add no fallback, option, "honest alternative", or deliverable the task text lacks; if the task cannot be done as written, that is a spec gap for the Pivot Protocol, never a workaround in the brief. `AGENTS.md`'s *Scope only grows through approval* binds the brief exactly as it binds advisories, and a tag of `[advisory-grade]` does not lift this clause — narrow-never-widen still governs. **Falsifier:** a brief line offering to record an unmeasurable value "as not measurable" for a task that requires the measurement.
- **(b) Convention files, by lookup.** Name every convention file governing the target using this two-step lookup and nothing wider: walk the target's folder up to the repository root, listing every agent guide (`CLAUDE.md` / `AGENTS.md`) and every cap or contract file such a guide names, one listing per level; then add the constitution's `## Module Guides` entries whose path prefixes the target, plus any file the task or design already cites. A chain deeper than the *Delegation Thresholds*' read budget goes to a scout, never an open-ended search. When the lookup finds nothing, say so: `convention files: none found by lookup`. **Falsifier:** zero convention files named for a target whose folder holds a `CLAUDE.md`.
- **(c) Source-or-`UNVERIFIED`.** Every infrastructure or third-party fact the brief states — an environment-variable meaning, a message envelope, a response key, a route — cites a source the worker can read (file + section, or a command output) or carries the marker `UNVERIFIED — confirm at source before relying on it`. **Falsifier:** a bare "the env var means X" with no source and no marker.
- **(d) Advisory-grade tagging.** Any item the Leader adds beyond the task text is tagged `[advisory-grade]`; the Reviewer audits an advisory-grade item as `ADVISORY` only and can never FAIL the task on it. The tag lowers the item's tier — it does not license the addition, and narrow-never-widen (a) still forbids new scope; a Leader who needs the scope raises it to the user. **Falsifier:** a brief whose Leader-added test item is untagged and reads as though it were already part of the task.
- **(e) Copied verification fields.** Alongside the verification command, the brief carries the task's `Falsifier`, `Red run`, and `Consumers` fields — see the bullet above. **Falsifier:** a brief that copies the command alone for a task whose fields are present.

#### 2.3 — Spawn Reviewer

**Review intensity.** A task MAY close without a conformance Reviewer only when all four conditions hold, evaluated by the Leader against the **Implementer's actual report — never against the task's `Review` field or the plan**:

| # | Condition |
|---|---|
| 1 | The task's `Falsifier` was **executed against the post-change code and the gate observed red**, and the report records the command and its red output |
| 2 | Every check in the task's Verification is **fully deterministic** — a command with a pass/fail result; the task's `Disqualifier` names no read or judgment |
| 3 | The task's `Consumers` field reads `none` |
| 4 | No override below applies |

- The predicate is defined **here, and only here** — every other surface cites it by name.
- A task whose `Review` field says `skip-eligible` but whose report fails any condition receives a normal conformance review; the field is a **claim to be proved**, never a guarantee.
- The Leader does not substitute its own judgment that a task "looks simple" for any condition — a diff's size decides nothing here.
- When a `skip-eligible` claim is **not earned**, the mismatch between plan and report is reported at the task's continue gate (Step 5) **even under `pre-approved` mode**.

**Overrides — stated immediately beneath the predicate, so no reader meets one without the other.** A conformance Reviewer is spawned, whatever the predicate says, when **any** of these holds, evaluated against **what the task does**, never against how its verification is phrased:

| # | Override |
|---|---|
| a | The task defines or edits an obligation other readers execute |
| b | The task touches a closed enumeration, a shared contract, an exported symbol, a selector or DOM hook, an emitted event, a response shape, or a stored field |
| c | The task produces **derived evidence** a later gate consumes — counts, aggregated claims, a walkthrough, a report |
| d | The task reverts behavior already delivered |
| e | The task is a **rework attempt** following any FAIL |
| f | The task touches a security, authentication, or data-loss surface |
| g | The Leader judges a review warranted — always permitted, and never requiring justification |

**The evidence re-run — always, by a non-author.** For **every** task, whether or not a conformance Reviewer runs, the task's verification is re-executed by a context other than the one that authored the change, and the outputs compared against what the author reported. The re-run is **mechanical**: re-execute the commands and compare — it is not an audit of the diff against the spec, and it carries no authority to judge conformance. Two execution modes, both acceptable: **Leader-inline** (already classed as inline work under *Delegation Thresholds*), or a spawned **Verifier** when the command set crosses the inline threshold. The result is recorded per task as `VERIFIED` or `MISMATCH`, naming the command and both outputs on a mismatch. A `MISMATCH` is an **implicit FAIL**, consuming a rework attempt exactly as an Implementer-reported verification failure does today. **The re-run is never waived — by any category, predicate, mode, or approval setting.**

When the Implementer reports completion, the Leader:

0. **Checks the report for a `Not Done / Assumptions` field first.** If present, the task is not complete regardless of what else the report says: carry that text into `execution.md` verbatim and treat it as scope still owed — re-spawn for the remainder, or mark `[~]` and escalate. A task with an outstanding gap never reaches `[x]`, **even on a Reviewer `PASS`** — the Reviewer audits what was written, not what was omitted.
1. Extracts the **git diff** of changes since the start of the attempt. To save tokens, the Reviewer MUST ONLY be given the diff, not the entire source files, unless absolutely necessary for context.
2. Spawns a conformance Reviewer with the following — unless **Review intensity** (above) is met and no override applies, in which case this step is skipped and the task proceeds directly to Step 3:
   - the persona: **nothing** when spawning the Step 8E wrapper (its body loads `.agents/reviewer.md`); persona content only in the fallback sub-prompt path
   - the **git diff, delivered by size**: a diff of ≤ 300 lines stays inline — it is ephemeral working state, not a project file. Above 300 lines, the Leader writes the diff it extracted to a file in the session scratchpad, outside the working tree, and the brief names the path with the instruction to `Read` it; the wrapper-restricted Reviewer keeps `Read` (only `Bash` is withheld), so the file resolves. A **non-host** Reviewer keeps the inline diff at any size — the same standing exception Step 2.2 already names for non-host workers
   - **pointers** to the relevant sections of `requirements.md`, `design.md`, `trd.md`, and `docs/ux-ui/design.md` — the Reviewer keeps `Read`/`Grep`/`Glob` precisely so it can follow them
   - the Implementer's verification evidence (copied — transient worker output, it lives in no file)
   - **execute-time spec edits since the previous PASS**: each `requirements.md` / `design.md` section the Leader edited during execution — without changing an approved requirement's meaning — is listed as a named conformance check (e.g. "conformance to `design.md#<section>` as amended <date>"); the same sections are carried once more in the next task's Reviewer brief, then drop. Record the edit in the current entry's *decisions made* at the moment you make it. **Boundary:** an edit that changes what an approved requirement means is a Pivot (*Error Handling & Pivot Protocol*, cited by name) — never an edit-carry

**Review lens modes (4R):** the Reviewer audits spec conformance (the gate) plus four advisory lenses — **readability, reliability, resilience, risk** — per `.agents/reviewer.md`. The mode is selected by the task's effort dial; there is no separate configuration:

| Mode | When | Mechanics |
|------|------|-----------|
| **Lens checklist** (default) | Effort `low` / `medium` / `high` | The single Reviewer sweeps all four lenses; non-spec-violation findings return in an `ADVISORY` block. **Spec conformance remains the only PASS/FAIL gate** |
| **Parallel lens reviewers** | Effort `xhigh` / `max`, or the task touches security, migrations, or data-loss surfaces | Spawn 2–4 lens-scoped Reviewers in parallel (each gets the same diff + one named lens + baseline spec conformance). Any lens may FAIL; the Leader adjudicates whether a lens FAIL is in-scope for the task **before** consuming a rework attempt |

`ADVISORY` findings are recorded in `execution.md` with the task's entry and never trigger rework — the 3-attempt ceiling binds to spec conformance only.

The Reviewer is read-only. Its returned message is a **report contract**: the first line is `STATUS:` — nothing before it — followed by the summary, then the issues list, then `ADVISORY`; the whole message stays under **~600 words**. Issues beyond the ceiling go to a file in the session scratchpad that the Leader reads by path, with the count stated on the summary line (e.g. `ISSUES: 5 — 3 inline, 2 in <path>`); the *Structured Feedback* rule (2.4, below) then relays the report **and** the overflow file verbatim to the next Implementer. The `STATUS:` line reads one of:

- **`STATUS: PASS`** + a 1–2 sentence summary (+ optional `ADVISORY` block with 4R lens findings)
- **`STATUS: FAIL`** + a structured list of issues, each containing:
  1. **Discovered Issue** — what is incorrect or missing
  2. **Violated Rule** — the specific spec document and section violated
  3. **Remediation Suggestion** — what the Implementer must change
- **`STATUS: FATAL_FAIL`** — Used ONLY if the Reviewer detects a critical architectural violation, a broken fundamental design token, or a completely unviable approach that cannot be fixed by simple iteration. This triggers an immediate abort of the rework loop (Fail-Fast) to save tokens.

#### 2.4 — Loop Guardrails

- **Maximum Retries:** A hard ceiling of **3 rework attempts** per task. This prevents infinite loops and token waste. **Accounting rule** (Step 2 preamble, *Runtime-failure fallback*): an attempt is consumed by a Reviewer `FAIL` or an Implementer-reported verification failure, and by nothing else — a runtime event recovered per that table's ladder never touches this ceiling.
- **Evidence Re-Run Never Waived:** the non-author re-run defined in *Review intensity* (Step 2.3) runs on every task, whatever the mode, category, or approval setting — a `MISMATCH` is an **implicit FAIL**, consuming a rework attempt exactly as an Implementer-reported verification failure does.
- **Advisory Never Gates:** `ADVISORY` (4R lens) findings are recorded in `execution.md` but never count as FAIL issues, never trigger rework, and never consume attempts. If an advisory finding is serious enough to block, the Reviewer must restate it as a spec-violation FAIL issue (or the Leader escalates it to the user as a potential spec gap via the Pivot Protocol).
- **Advisory Never Becomes A Task:** an advisory is **recorded and dies there**. You may not mint a new task in this spec from one, and you may not widen an existing task to absorb it. The rule above stops advisories from *gating*; this one stops them from *growing the spec* — the other direction, and the one that does the real damage. **A task not in the approved `tasks.md` is scope the user never approved**, and it arrives with none of the review the approved tasks got: no requirement backing it, no design decision, no budget line. Advisories are also the *least*-vetted findings in the run, so this path grows scope fastest from the weakest evidence. The only route from advisory to new work is out of this spec: record it, finish what was approved, and let the user decide whether it earns a proposal. When an advisory genuinely cannot wait, that is a **spec gap** — escalate via the Pivot Protocol and let the user reopen the spec, which re-runs the budget and the approval gate rather than bypassing both.
- **Wind Down Before You Run Out:** a rework loop is up to 3 attempts × (Implementer + Reviewer) — six delegated round trips plus adjudication. **Do not open one you cannot see through.** When context runs low, follow *Winding down* in `.agents/leader.md` (already in your context — that section is canonical): finish or park the task in flight (`[~]` + full attempt history, never silently), spend what remains on `execution.md`, and transfer ownership rather than leaving a supervised delegation outstanding — with the user's explicit ask able to lift that default.
- **Budget Tripwire:** `design.md` carries a budget from `/akili-specify` Step 2.4 (expected tasks, LOC, review rounds). When actual execution exceeds it, **stop and escalate to the user** with the delta and the cause — do not continue on the assumption that finishing is what was wanted. Exceeding a budget is information, not failure; the cost of a mis-sized spec is only recoverable while it is still running. A spec with no recorded budget (written before this existed, or `Lite` depth) simply skips this check. Review rounds count Reviewer verdicts only — a runtime event and the rung that recovered it never add a round.
- **Fail-Fast (FATAL_FAIL):** If the Reviewer issues a `STATUS: FATAL_FAIL`, immediately HALT the loop, mark the task `[~]`, and trigger the Pivot Protocol. Do not consume remaining rework attempts.
- **Structured Feedback:** On `FAIL`, pass the full Reviewer report unchanged to the next Implementer spawn. Do not paraphrase.
- **Escalation on HALT:** After 3 failed attempts (or a FATAL_FAIL), mark the task `[~]`, log the full loop history in `execution.md`, and present the audit trail to the user for guidance.
- **Pivot Detection:** If either the Implementer or the Reviewer surfaces evidence that the spec itself is wrong or unviable (not merely the implementation), stop looping immediately and trigger the Pivot Protocol below — do not consume rework attempts on a broken spec.

### Step 3: Finalize on PASS

Only after a Reviewer `PASS` — or, when the Reviewer ladder was exhausted, after the `REVIEW_WAIVED` record is written —:

1. Append a structured entry to `execution.md` (see log format below) covering every attempt in this task's loop.
2. Update `tasks.md` from `[ ]` (or `[~]`) to `[x]`.

**Write the evidence before the checkbox — this order is load-bearing.** The two writes are not atomic, and a run can end between them: context exhaustion, an interrupt, a crash. Each order therefore has a failure state, and they are not equally bad.

| Order | If the run dies between the writes | Recoverable? |
|---|---|---|
| `execution.md` → `tasks.md` | Evidence recorded, task still `[ ]`/`[~]` | ✅ `/akili-resume` re-runs a task that was actually done — wasteful, but the audit trail shows the PASS and the Leader can reconcile |
| `tasks.md` → `execution.md` | Task reads `[x]`, **no record of why** | ❌ Indistinguishable from an unverified completion. The Reviewer PASS is gone and cannot be reconstructed |

The second state is the one AKILI cannot tolerate: a `[x]` with no attempt history is a **traceability hole that looks like a finished task**. `/akili-resume` reads `execution.md` to rebuild state and would skip it with nothing to flag. Redundant work is cheap; an unfalsifiable completion is not.

This also makes the ordering machine-checkable — a gate on `tasks.md` writes can require the matching PASS to already be in `execution.md`, which is impossible under the reverse order because the evidence does not exist yet at the moment of the write. **Projects that accepted `/akili-constitution` Step 8F have exactly that gate installed** (`.claude/hooks/akili-tasks-gate.sh`, Claude Code only): a `[x]` write without PASS evidence is blocked by the harness, and the block message names this rule. If you hit it, the fix is never to work around the hook — it is to write the evidence first, which is what this step already orders.
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

1. **Rollback, by tree state.** Determine the state of the working tree before restoring anything:

   | Tree state | Action | `## HALT` records |
   |---|---|---|
   | **Clean** — only the halted task's changes are uncommitted | Run `git restore .` and `git clean -fd` to revert the working tree to a clean state. Do not leave broken code for the user to clean up | "clean tree — blanket restore" |
   | **Holds other PASSed work** — uncommitted changes attributable to earlier PASSed task entries | Restore scoped to the halted task's pathspec: the explicit file paths from its attempt entries' *files changed* lines — `git restore -- <paths>` for tracked files, `git clean -f -- <paths>` for the listed untracked files, **never a directory glob** | the pathspec used |
   | **Holds unattributed changes** — paths no task entry accounts for (another session, the user) | Run the pathspec restore above; the unattributed paths are **never restored** — escalate to the user | the unattributed paths, listed as "unattributed — not restored" |

   After any restore, run `git status --porcelain` and report what remains. **Residual:** a file the Implementer changed and did not report is outside the pathspec — the same hole the log format already has, now visible in the post-restore status.
2. Mark the task `[~]` in `tasks.md`.
3. Append a final `## HALT: <Task ID>` block to `execution.md` containing:
   - all three Reviewer `FAIL` reports
   - all three Implementer summaries
   - the verification output of the final attempt
   - the Leader's hypothesis on the root cause (spec ambiguity, missing context, environmental issue, etc.)
   - the tree-state branch taken, the pathspec used (if any), and any paths listed "unattributed — not restored"
3. Present the blocker to the user with a clear question — for example: *"The Reviewer rejected three attempts on the same `design token compliance` finding. The spec at `design.md#tokens` does not list a token for this surface. How would you like to proceed?"*
4. Do **not** advance to the next task automatically after a HALT.

### Step 5: Continue or Pause

After a task PASSes or HALTs, generate a short, easy-to-understand summary (summary facil de entender de lo que se hizo) of the task result, verification outcome, the Reviewer summary, and the next eligible task. Ask whether to continue, pause, or skip the next task.

**Approval Mode (inherited from the proposal's Document Control):** under `pre-approved`, this continue/pause gate auto-passes after a **PASS** — log `auto-approved (pre-approved mode)` with the task's `execution.md` entry and proceed to the next eligible task. The mode never carries past an exception: a **HALT**, a Pivot, a budget tripwire, or a `FATAL_FAIL` always stops for the user — pre-approval covers routine progress, not the cases whose content nobody could know in advance. A `REVIEW_WAIVED` decision and the Leader-inline ask (Implementer ladder rung 5) are stops for the user too, never auto-passed — both remove or replace the correctness gate, the same class of exception the list above already covers.

**Unattended Mode (Claude Code + `pre-approved` only):** when the user asks for a run that finishes without them watching, recommend launching it with `/goal` in Claude Code — after each turn a small fast model checks the condition and starts another turn until it holds ([docs](https://code.claude.com/docs/en/goal.md)). Use this canonical condition, with `<spec-path>` and `<N>` resolved:

> Every task in `docs/specs/<spec-path>/tasks.md` is `[x]` with matching PASS or `REVIEW_WAIVED` evidence in `execution.md`, OR `execution.md` contains a `## HALT:`/`## Pivot Record:`/budget-tripwire block, OR a question is pending for the user. Stop after `<N>` turns.

The three-way disjunction is part of the condition, never an add-on: it is what stops the loop from pushing past a human gate. Set `<N>` to tasks remaining × up to 6 triad round-trips + margin, so the turn bound and the 3-attempt rework ceiling never fight — the ceiling HALTs first, the HALT satisfies the disjunction, the loop ends. The evaluator judges only what the session has surfaced in the conversation; it runs no commands and reads no files, so the task state this step already reports at each gate is what it reads.

Optional by construction: `/goal` requires a workspace you have trusted and is unavailable under `disableAllHooks`, and it does not change tool permissions (pair it with auto mode so each turn runs without per-tool prompts). Never make a run depend on it — every spec stays completable without it. Do not use it under `gated` mode: there the interactive gates are the point.

**Codex:** confirmed live 2026-09-17 (codex-cli 0.154.0; `codex features list` shows `goals` stable true). Codex's `/goal` lets you set or view a task goal, giving Codex a persistent target to track while a larger task runs; Codex "keeps the goal attached to the active chat while work continues" (<https://learn.chatgpt.com/docs/cli/slash-commands>, `Last verified: 2026-09-17`) — a persistent-target note, not a condition evaluated after each turn that starts another turn the way Claude Code's `/goal` does. There is no verified equivalent to Claude Code's unattended looping for Codex; run Codex sessions attended.

**Context checkpoint (this gate is the safe boundary inside a spec):** a task just closed and its full state is in `execution.md` + `tasks.md` — between tasks is the one moment mid-spec where the conversation holds nothing irreplaceable. If your context is getting heavy, say so in one line with the honest options: **`/compact` now** (keeps the session, trims history — safe here, destructive mid-loop), or **park and reset** (`/clear`, then `/akili-resume` rebuilds from the audit trail). You cannot run either — recommend at this gate rather than letting the wind-down protocol fire mid-loop later, which is the expensive version of the same decision. This checkpoint fires even under `pre-approved` mode: it costs one line, not a pause.

---

## Execution Log Format (`execution.md`)

The execution log is created on first run and appended to on subsequent runs. It is the canonical audit trail of the multi-agent loop.

Minimum sections:

1. Document Control
2. Task Execution History
3. Summary when all tasks are complete

Each task entry must record:

- final status (`PASS` / `WAIVED (flag)` / `HALT` / `pivot`)
- date
- task ID and title
- number of Implementer attempts run
- for each attempt: files changed, Implementer verification command + result, Reviewer verdict + summary or full FAIL findings, and a `runtime events: <kind> ×n → <rung>` line naming any runtime events recovered on that attempt and the rung that recovered them
- any `ADVISORY` (4R lens) findings from the final Reviewer verdict, labeled as advisory
- requirements covered
- decisions made — including any execute-time spec edits (file + section + reason), recorded at the moment each edit is made
- issues encountered
- final verification result

A minimal PASS-on-first-attempt entry can be compact; a HALT or rework entry must include the full attempt-by-attempt history.

**`## REVIEW_WAIVED: <Task ID>`** — written by the Leader, before `[x]`, whenever a task closes without a Reviewer `PASS` from an independent context on a different model at the registry's tier:

| Field | Content |
|---|---|
| `flag` | `inline` · `same-model` · `degraded-pair` |
| cause | the events and rungs exhausted, in order |
| approved by | the user — never the Leader alone (message / time) |
| verification that stood in | command, exit status, who ran it |
| models | Implementer / auditor (if any) |

The flags name which property of the gate was lost: **`inline`** — no independent context (the Leader audited work it supervised); **`same-model`** — an independent context, but on the Implementer's model; **`degraded-pair`** — an independent context on a different model, below the registry's tier or outside it (a `PASS` was issued and stands — the record accompanies it so the metric stays honest). The task entry's Reviewer field reads `WAIVED (inline)` or `WAIVED (same-model)` for the first two, and `PASS (degraded-pair: <impl>/<rev>)` for the third. **A task with neither a `PASS` nor a `REVIEW_WAIVED` record in `execution.md` is not closable.** Step 2.3 item 0 (a `Not Done / Assumptions` gap blocks `[x]` even on PASS) applies to a waiver identically. An `execution.md` written before this record existed carries no `## REVIEW_WAIVED` blocks — its absence reads as "no waiver recorded", never as an inferred PASS.

---

## Error Handling & Pivot Protocol

- If required AKILI-SPECS files are missing, stop and report what is missing.
- If `.agents/` is missing, stop and direct the user to run `/akili-constitution`.
- If the design is ambiguous, the Leader asks the user before spawning the Implementer — do not pass an ambiguous task into the loop.
- If verification fails inside the Implementer, the Implementer must fix it before reporting completion; if it cannot, it reports back the failure and the Leader treats that as an implicit FAIL.
- If a task is blocked, report the blocker and move to the next eligible task only if appropriate.
- **Pivot Protocol:** If Implementer or Reviewer discoveries reveal that the approved requirements or design are wrong or technically unviable:
  1. Stop the rework loop. Mark the current task as `[~]` (blocked) — even if rework attempts remain.
  2. Document the blocker, alternatives, and revised technical direction in `execution.md` inside a new `## Pivot Record: <Task ID>` section. If the pivot overturns an architecture decision recorded in the TRD, name the affected `ADR-NNN` in the Pivot Record — decisions are never edited in place; `/akili-archive`'s constitution sync writes the superseding ADR.
  3. Modify the spec's `requirements.md`, `design.md`, and/or `tasks.md` to map out the updated plan — then **close the correction with a two-direction sweep** (see `/akili-specify` → *Correction Closure*): grep the superseded value across the whole spec folder (forward — the old value survives at sites the pivot analysis did not cite), and grep references *to* the corrected sections (backward — a document that cited the old text may now assert a falsehood). A pivot amended by its cited-site list alone has failed both ways in the field and cost an extra review round.
  4. Stop, explain the situation to the user, and obtain explicit review/approval on the pivot before resuming execution. Before resuming, **re-issue every Implementer brief already dispatched for the affected task** with the amended text — a brief composed before the pivot carries the superseded value, and the Implementer will honor it faithfully into a FAIL.

---

## Authorship

AKILI-SPECS methodology by **Juan Carlos Cadavid** — [jcadavid.com](https://jcadavid.com). Licensed under the MIT License.
