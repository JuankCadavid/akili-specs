# Design: Bound What an Implementer Spawn Costs

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/subagent-context-budget` |
| Depth | **Standard**, confirmed at Step 2.4 (§9) |
| Type | Change |
| Approval Mode | `pre-approved (user, 2026-09-29)` |
| Status | **Approved** — at the Step 2.5 gate the user chose *Review Design*, then, with the judges running, gave the mandate: apply the fixes, do not re-judge, continue. Corrected 2026-09-29 (§13). The corrections were not re-judged |
| Review | `judgment.md`: two blind judges on `opus`. 22 ledger rows, 20 fixed, 2 recorded. Closes `ESCALATED` |
| Date | 2026-09-29 |
| Source | `requirements.md` (approved 2026-09-29; amended the same day, its §10) |
| Format precedent | `docs/specs/archive/2026-09-29-changes--scoped-constitution-reads/design.md` |
| Skills | `cognitive-doc-design`. `software-architect` not loaded: no module, integration, data flow or NFR tier changes |
| Delegation | Three background agents, each announced: two counting experiments on `sonnet` (P-12), one reversion challenger on `opus` (DD-1) |

## 2. Executive Summary

The change is prose in nine packaged files: three personas, `leader.md`, `/akili-execute`, two mirrors, `README.md` and `CHANGELOG.md`. It adds one report status, one Leader action, two bounds, two load rules and two record lines. No code changes.

| Piece | Home | Who reads it |
|---|---|---|
| Loop bound, call bound, checkpoint report | `.claude/templates/implementer.md`, item 4 | The Implementer |
| *Don't stop short*, amended | Same file, item 2 | The Implementer |
| Output discipline | `implementer.md` and `tester.md`, one block each | Each worker |
| Bounded reads | `implementer.md`, `tester.md`, `reviewer.md`, one block each | Each worker |
| Checkpoint handling, cap, accounting | `/akili-execute` Step 2.3, one new paragraph | The Leader |
| Spawn budget in the brief | `/akili-execute` Step 2.2, one bullet | The Leader |
| Record lines | `/akili-execute` *Execution Log Format* | The Leader |

**Two requirements were amended while this design was written** (requirements §10, A9 and A10). Both follow from one fact: a worker reads its own persona and no other file's rules.

| Requirement | As approved | As amended | Why |
|---|---|---|---|
| FR-4, first bullet | The brief states the loop bound and the call bound | For a **host** worker the brief names the budget by reference to the persona. For a **non-host** worker the brief copies the two numbers and the checkpoint fields | The numbers then have one home. The Leader's brief is output, the most expensive tokens in the loop, and the pointer brief already works this way |
| NFR-2 | Each rule lives in one place | Each rule has **one home per reader**: a persona carries the rules its worker executes; commands and mirrors cite them by name | Three personas need the read rule and two need the output rule. A persona cannot cite another persona |

## 3. Architecture Overview

```text
Leader ── brief (budget by reference, task copied) ──▶ Implementer
                                                         │ works; counts verification cycles and tool calls
                                                         ├─ complete ─────────────▶ report → evidence re-run → Step 2.3 (unchanged)
                                                         ├─ blocker / owed items ─▶ Step 2.3 item 0 (unchanged)
                                                         ├─ hopelessly stuck ─────▶ STATUS: FATAL_FAIL (unchanged)
                                                         └─ bound reached ────────▶ STATUS: CHECKPOINT
Leader ◀── checkpoint report ───────────────────────────┘
  │ checkpoints on this task < 2 → fresh Implementer: original brief + report verbatim + "changes are in the tree"
  │ third checkpoint             → HALT (cause: checkpoint cap), [~], question to the user
  └ records: checkpoints line, spawn lines
```

The attempt counter, the Reviewer, the evidence re-run and the rework ceiling are outside this flow. A checkpoint happens inside one attempt.

## 4. Extended Directory Structure

No new packaged file. `docs/specs/changes/subagent-context-budget/measure/` holds three scripts and `baseline.txt`; it is excluded from the package by the `!docs/specs` rule.

## 5. Data Model

Two record lines in a task entry, both prose:

| Line | Written | Content |
|---|---|---|
| `checkpoints:` | Only when one fires | Count, and for each the bound reached |
| `spawns:` | Always, one item per spawn | Role, tool calls, tokens, how the spawn ended |

## 6. API Design / Backend / Frontend

Not applicable.

## 7. Shared Contracts

### 7.1 Surface table

| # | File | Place | Change | FR |
|---|---|---|---|---|
| 1 | `.claude/templates/implementer.md` | Item 4, *Self-Correction Inner Loop* and the sentence after it | Rewritten whole (DD-1, DD-2, DD-3) | FR-1, FR-2 |
| 2 | Same | Item 2, *Don't stop short* | One clause added (DD-4) | FR-2 |
| 3 | Same | Item 1, after *CodeGraph first* | *Bounded reads* block (DD-8) | FR-6 |
| 4 | Same | Item 4, after the loop | *Output discipline* block (DD-7) | FR-5 |
| 5 | Same | *Reporting Completion* | One sentence naming the checkpoint report as the other report shape | FR-2 |
| 6 | `.claude/templates/tester.md` | Item 1, the slice bullet | *Bounded reads* rows that apply to a Tester | FR-6 |
| 7 | Same | Item 4 | *Output discipline* block | FR-5 |
| 8 | `.claude/templates/reviewer.md` | Item 1, after the pointed-sections bullet | *Bounded reads* rows that apply to a Reviewer | FR-6 |
| 9 | `.claude/commands/akili-execute.md` | Step 2 loop sketch | One branch for a checkpoint report | FR-3 |
| 10 | Same | Step 2.2 brief list | *Spawn budget* bullet (DD-6) | FR-4 |
| 11 | Same | Step 2.3, before "When the Implementer reports completion" | *Checkpoint report* paragraph (DD-5) | FR-3 |
| 12 | Same | Step 5, the turn-bound sentence | Adds 2 respawns per task | FR-3 |
| 13 | Same | *Execution Log Format* | Two record lines (DD-9) | FR-3, FR-7 |
| 14 | Same | Step 2.4, *Wind Down Before You Run Out* | The loop's size adds up to 2 respawns per task | FR-3 |
| 15 | Same | Step 4, opening sentence | Names the checkpoint cap as a third way in | FR-3 |
| 16 | Same | *Error Handling*, the sentence on a verification that fails inside the Implementer | Bounded by the loop; names the checkpoint beside the implicit FAIL | FR-1, FR-3 |
| 17 | `.claude/templates/leader.md` | Five places: the loop summary (HALT "after 3"), the sentence sizing one loop at 6 round trips and two at 12, the *Winding down* sentence sizing a loop at six, the outcome line, the reviewer-summary line ("if halted, the outstanding `FAIL` issues") | Each adds the respawns, or the checkpoint-cap HALT | FR-3 |
| 18 | `docs/commands/akili-execute.md`, `docs/flow.md`, `README.md` | The loop summaries, each ending "if 3 consecutive FAILs → HALT" | One line for the checkpoint and its cap | FR-10 |
| 20 | `.claude/commands/akili-execute.md` | Step 2 preamble, *Accounting rule* | One clause: a checkpoint is not a reported verification failure | FR-3 |
| 21 | Same | Step 2 opening sentence, Step 2.4 *Escalation on HALT*, Step 4 item 3 | Each names the checkpoint cap; item 3 lists what a checkpoint-cap HALT record holds | FR-3 |
| 22 | Same | Step 2.2, the CodeGraph bullet: "full files are for what it is about to edit" | Brought in line with the large-file rule | FR-6 |
| 23 | `.claude/templates/implementer.md` | Item 1, *CodeGraph first*: "Open a full file when you are about to edit it" | Same | FR-6 |
| 24 | `.claude/templates/reviewer.md` | Item 1 | Its own one-sentence definition of a section lookup | FR-6 |
| 19 | `CHANGELOG.md` | `Unreleased` | Entry and migration note (DD-11) | FR-10 |

### 7.2 The new report status walks its consumers

`CHECKPOINT` is a new value of the Implementer's report status. Every existing step that reads that report is listed with what the new value does there.

| Consumer | What it does with a checkpoint |
|---|---|
| Step 2 loop sketch, "receive Implementer report" | New branch: respawn, attempt unchanged (surface 9) |
| Step 2 preamble, runtime-event enumeration | **Holds.** The list is closed and a checkpoint is in neither half. The checkpoint paragraph says it is not a runtime event |
| Step 2 preamble, *Accounting rule*: an attempt is consumed "by nothing else" | Surface 20. Read literally, a checkpoint with a failing tree is a reported verification failure; one clause says it is not. The restatements at Step 2.3 and Step 2.4 cite the rule and need no edit |
| Step 0, the wrapper rule: the Leader works against "the report shapes and `STATUS:` lines this command already defines" | The command names the new status line and the three fields the Leader reads, *Tree state*, *Remaining* and *Notes* (DD-5) |
| *Error Handling*: a verification the Implementer cannot fix is reported and treated as an implicit FAIL | Surface 16. A completion-time failure report stays an implicit FAIL; a checkpoint is told apart by its status line |
| Step 2.3 item 0, `Not Done / Assumptions` | A checkpoint report carries no such field. A report that names a blocker is R2 whatever its status line says (DD-5) |
| Step 2.3, evidence re-run and Reviewer | Neither runs on a checkpoint. They run on the completion report of the last spawn, over the whole diff of the attempt |
| Step 2.4, *Maximum Retries* | **Holds** |
| Step 2.4, *Pivot Detection* | A checkpoint whose *Notes* carries a Pivot-Detection flag goes here before any respawn (DD-5) |
| Step 2.4, *Fail-Fast*, and the report contract that defines `FATAL_FAIL` for the Reviewer | The checkpoint paragraph states the Implementer's `FATAL_FAIL` and sends it to Step 4 (DD-5) |
| Step 2.4, *Wind Down*, and `leader.md`'s two loop-size sentences | Surfaces 14 and 17 |
| Step 4, HALT | A third checkpoint enters here with its cause named (surface 15). The pathspec is built from the entries' *files changed* lines, which the Leader fills from the working tree at each checkpoint (DD-9) |
| *Execution Log Format*, final status | **Holds.** A third checkpoint is a `HALT` |
| Step 5, the stop list under `pre-approved` | **Holds.** It already lists HALT |
| `leader.md`, the outcome line "PASS on attempt N, or HALTED after 3 attempts" | Surface 17 |
| Step 5, continue gate | Reports every checkpoint of the task |
| Step 5, `/goal` condition | **Holds.** A third checkpoint asks the user a question, which the condition's third branch already covers |
| Step 1, parallel Implementers | A respawned worker reads the files its checkpoint lists and no other uncommitted change (DD-5) |
| `leader.md`, idle-without-report | **Holds.** A checkpoint is a delivered report |
| `reviewer.md` | Never receives a checkpoint |
| `/akili-resume`, `[~]` reported as blocked | **Holds** for the third-checkpoint case |
| `kaizen` Measure table and clean-run test | No row is added. A checkpoint-cap HALT is counted as a HALT. A task that closes after one or two checkpoints reads as clean: **accepted**, requirements §10 |
| `tdd` skill, red before green; *Review intensity* condition 1, the executed falsifier | **Holds**, given DD-3: neither run is a failed cycle. Their evidence travels in the checkpoint's *Done* field (DD-2) |

## 8. Design Decisions

### DD-1: The unbounded loop is replaced in place *(removes delivered behavior — challenged below)*

The two sentences of item 4 that say "re-run the verification until it passes" and "multiple inner-loop attempts" are rewritten as one rule: fix and re-run within the loop bound; at the bound, a checkpoint or a `FATAL_FAIL`. The prohibition on reporting completion with a failing verification stays, in the same paragraph.

- **Why in place.** A bound added as a new bullet beside the old sentence leaves "until it passes" standing (KZ-changes--leader-brief-contract-1).
- **Rejected:** a bound on total verification runs. The baseline's median is 4 runs and a run that fails differently each time is progress. Counting the same failure is what separates a stuck worker from a working one.

**Reversion challenge:** run. It named 13 points, 9 of which changed this design. See §12.

### DD-2: The checkpoint is a report status with seven fixed fields

The report opens with `STATUS: CHECKPOINT`, then the seven fields of FR-2 in its order: *Bound reached*, *Done*, *Remaining*, *Tree state*, *Tried and failed*, *Next step*, *Notes*. The fields are defined in `implementer.md`. The command names the status line and the three fields the Leader reads, *Tree state*, *Remaining* and *Notes*, and defines none of them again.

- *Tree state* lists every file changed. The Leader checks it against the working tree.
- *Done* carries any red run or falsifier evidence already produced, verbatim. The last worker's completion report must include it.
- *Notes* carries a Pivot-Detection flag or a lookup note, the two things the persona already requires in a report.
- *Tried and failed* does for a respawn what *Attempt History* does for a rework attempt.
- **Rejected:** reusing `Not Done / Assumptions`. That field belongs to a worker that finished its turn believing the task done or blocked, and item 0 reads it by presence. A checkpoint is neither, and one field carrying two meanings is how a status loses its action.

### DD-3: What counts as a cycle, and as the same failure

| Term | Definition |
|---|---|
| Verification cycle | A fix attempt followed by one run of the task's verification command |
| Same failure | The same check fails with the same assertion or the same error |
| Not a cycle | The first run before any fix; the expected red of a test written before its code; the task's falsifier run; a run the worker makes to read a baseline |
| Reset | Any cycle that fails differently, or passes the check that was failing. A respawned worker starts at zero |
| When a bound is checked | Between edits. The edit in hand is finished first |
| Call bound, task complete, not verified | One verification run, then completion, or a checkpoint if it fails |
| Call bound, task complete and verified | Completion, never a checkpoint |

### DD-4: *Don't stop short* gains one clause

The sentence keeps its list of premature stops, "the turn ran long" included. Its list of legitimate stops gains the two exits at a bound: a checkpoint, and `FATAL_FAIL` on its existing terms, which the list never held. A checkpoint before a bound is named there as a premature stop. The Tester's copy of the sentence is not edited, since the Tester has no checkpoint.

### DD-5: One paragraph in Step 2.3 holds the Leader's whole action

A paragraph titled *Checkpoint report* is placed before "When the Implementer reports completion". It carries, in this order:

| Element | Content |
|---|---|
| Recognition | The report's first line is `STATUS: CHECKPOINT`. The status line decides the counter: a report with owed items and no status line is a continuation |
| Precedence | A report that names a blocker is handled as a blocker, whatever its status line. A checkpoint whose tree fails its verification is a checkpoint, never an implicit FAIL |
| Action | A fresh Implementer. The original brief, the checkpoint report copied verbatim, the instruction to read the files the report lists and no other uncommitted change, and which checkpoint this is |
| Files | Recorded as *Tree state* lists them, each confirmed as a change in the working tree |
| Pivot flag | A checkpoint whose *Notes* carries one goes to Pivot Detection before any respawn |
| Implementer `FATAL_FAIL` | Stated here: it ends the task by Step 4, as the persona has always reported it |
| Failing verification, no blocker, no status line | An implicit FAIL, never a continuation |
| What does not run | No evidence re-run and no Reviewer on the checkpoint |
| Effort | Unchanged. The effort bump belongs to a FAIL |
| Accounting | No rework attempt, not a runtime event, no round on the Budget Tripwire |
| Cap | 2 per task across all attempts, separate from the continuation cap. A third is a HALT by Step 4, cause `checkpoint cap`. Its record holds every checkpoint report and whatever FAIL reports exist |
| Mode | No pause in either approval mode. Reported at the continue gate |
| Fall-through | A report that fits no status in the list is handled as idle-without-report |

The eight statuses of FR-3 are not restated as a table in the command. Five have their action in the text today. The paragraph adds R7, states R6 for the Implementer, settles R5 against R3, and adds the fall-through. R4 under `pre-approved` keeps the gap it has today; it is a follow-up.

### DD-6: The brief gains one bullet

*Spawn budget*, in the Step 2.2 list:

| Worker | The bullet says |
|---|---|
| Host | The budget is the one the persona states. The task text is already in this brief, so `tasks.md` is not opened. On a respawn, which checkpoint this is |
| Non-host | The same, with the two numbers and the six checkpoint fields copied, as the non-host exception already does for other persona content |

### DD-7: Output discipline is one block, carried by two personas

| Rule | Content |
|---|---|
| Limit | 100 lines of one command's output |
| Over the limit | Full output to a file; the result summary and the failing part into context |
| The failing part | Test name, assertion or error, location. Kept whole up to the limit, with the count of failures not shown |
| Where the file goes | The system's temporary directory, or a directory the project's version control ignores. Never a tracked path |
| Reading a file | Never through a shell command that prints it whole |
| Diffs | Summary of changed files first, then by file |
| Evidence | A quotation in the report stays verbatim |

### DD-8: Bounded reads is one block, with the rows each role needs

| Row | Implementer | Reviewer | Tester |
|---|---|---|---|
| `requirements.md`, `design.md` at pointed sections; section lookup for anything else | ✓ | ✓ | ✓ |
| `tasks.md` | Not opened when the brief carries the task | Only at a block the brief points at | Only at a block the slice points at |
| `execution.md` only at the entries the brief or slice names | ✓ | ✓ | ✓ |
| Large file, not edited: by range or through CodeGraph | ✓ | ✓, when its diff-first rule already allows a file read | ✓ |
| Large file, edited: the ranges that cover the edit and what it depends on | ✓ | — | ✓ |
| 400 lines or fewer: may be read whole | ✓ | ✓, under the same condition | ✓ |
| No second read of an unchanged file, except to quote or pin a source | ✓ | ✓ | ✓ |
| Its own definition of a section lookup | Has one | Gains one (surface 24) | Has one |

The block sits beside the reference-document table of `changes/scoped-constitution-reads` and does not touch it. A cell marked "—" is a row that persona does not carry: only the Reviewer's, which edits nothing. The two surviving sentences that send a worker to the full file it will edit are brought in line (surfaces 22 and 23).

### DD-9: Two record lines

| Line | Shape | Source |
|---|---|---|
| `checkpoints: <n> (<bound>, …)` | Written only when one fires, beside `continuations:` | The checkpoint reports |
| `spawns: <role> <calls> calls, <tokens> tokens, ended <complete \| checkpoint \| partial \| fail \| fatal \| died>; …` | One item per spawn | What the host reports when the worker finishes; otherwise `not reported by host`, with the worker's own counts where its report gives them |

The per-attempt *files changed* line includes a checkpointed spawn's files.

| Rule | Content |
|---|---|
| No estimate | The Leader writes a reported number or `not reported by host`, never a figure of its own |
| Information only | The line gates nothing, fails nothing and adds nothing to the Budget Tripwire |
| Older entries | An entry with no `spawns:` line reads as "not recorded" |
| *ended* | `partial` is a report with `Not Done / Assumptions`; `died` is a runtime event |

### DD-10: The call bound is carried by the worker's own count

The worker counts the tool calls it makes and checks the count against 60. The bound is stated as a number, and the text says the count is the worker's own.

- **Evidence.** Two workers on `sonnet`, given a budget of 20 calls and 30 calls of work, each stopped after exactly 20 (P-12). One kept a written tally and one did not.
- **Limit of that evidence.** Twenty uniform calls are not sixty mixed ones. P-13 stays open and T1 settles it first.
- **If P-13 is refuted.** The call bound is replaced by a count the worker demonstrably keeps, through the Pivot Protocol. The loop bound is unaffected.
- **Rejected:** a cap set by the host in the agent wrapper. Wrappers are written by `/akili-constitution`, which is out of scope, and a host cap ends the worker with no report.

### DD-11: The CHANGELOG entry — content

| Element | Content |
|---|---|
| Headline | Implementer runs are bounded: a checkpoint-and-respawn exit, output discipline, bounded reads |
| Numbers | 3 cycles, 60 calls, 2 checkpoints per task, 100 lines, 400 lines |
| Basis | The baseline figures, named as measured on two projects, not as a general claim |
| Migration | Safe Update appends an upgrade block to a deployed persona and leaves its old sentences standing, so the unbounded loop would survive beside the bound. The note names the sentences to replace by hand in `.agents/implementer.md`, and the blocks to add to `tester.md` and `reviewer.md`. Commands are updated first |
| Follow-up | FR-8's measurement, owed to the user after the first 30 spawns |
| Classification | Proposed **minor** |
| Not claimed | Any measured saving. FR-8's measurement has not run |

### DD-12: Non-changes

| Surface | Why it stays |
|---|---|
| The Tester's inner loop | Already bounded at 3 (P-4) |
| The *Accounting rule* sentence | Still true |
| The continuation rule | A different event with its own cap |
| `/akili-test` | The Tester's rules live in its persona |
| `/akili-constitution`, wrappers, registry | Out of scope |
| `kaizen` | No Measure row |

## 9. Budget (Step 2.4, tripwire for `/akili-execute`)

| Number | Value | Basis |
|---|---|---|
| Expected tasks | **5** | Implementer loop and checkpoint · load rules in three personas · `/akili-execute` and `leader.md` · mirrors · CHANGELOG and closure walks |
| Expected lines | **~140** | Personas ~55 (capped by NFR-1 at 5,900 bytes in total, as raised at the T2 Pivot), command ~40, `leader.md` ~8, mirrors and `README.md` ~20, CHANGELOG ~15. Raised from ~105 after judgment day added surfaces 20 to 24 |
| Expected review rounds | **10** | Two per task, since every task edits text other agents execute (KZ-changes--scoped-constitution-reads-2) |

**Depth check:** Standard holds. Five tasks and about 140 lines sit inside it.

## 10. Premise Ledger

`Premise Ledger: 19 verified · 2 UNVERIFIED (1 High, 1 Low)`. Rows P-1, P-5, P-9, P-17 and P-18 were corrected after judgment day, and P-19 to P-21 added. Verified 2026-09-29 at `c94e6b6`, commands run from the repository root unless the row names another source.

`Blast-radius triggers:` **consumer** fires — the design adds a value to the Implementer's report status and two lines to the task entry. Walked in §7.2, P-5, P-6, P-7, P-8, P-16, P-17, P-18. **shared-state** fires — *Don't stop short* and the read rules are carried by more than one persona, and a task can be re-spawned in more than one way. Walked in P-3, P-9, P-19. **live-path** fires — the design names a branch point, packaged template against deployed persona. Walked in P-1.

| # | Claim | Class | Citation (as run) | Verified at | If false | Settled by |
|---|---|---|---|---|---|---|
| P-1 | A worker reads the deployed persona at `.agents/<role>.md`, copied from the packaged template; Safe Update never overwrites it | `live-path` | `/akili-execute` spawn → wrapper body → `.agents/implementer.md` (`akili-constitution.md:659`); Safe Update: `akili-constitution.md:424`, *"**do not overwrite** existing `.agents/*.md` files"*, and in the same bullet *"append a minimal upgrade block that preserves all existing custom instructions"* | `c94e6b6` | DD-11's migration note changes: Low | — |
| P-2 | The Implementer's loop has no bound | `existence` | `implementer.md:43`, *"You must fix your code and re-run the verification until it passes."*; `:44`, *"multiple inner-loop attempts"* | `c94e6b6` | DD-1 has nothing to replace: High | — |
| P-3 | *Don't stop short* is carried by two personas and cited nowhere else | `shared-state` | `grep -rn -i "stop short\|premature stop" .claude/commands .claude/templates .claude/skills docs/commands docs/flow.md docs/model-routing.md README.md` → 2 hits: `implementer.md:36`, `tester.md:46` | `c94e6b6` | DD-4 owes an edit elsewhere: Low | — |
| P-4 | The Tester's loop is bounded at 3 | `existence` | `tester.md:42`, *"Bounded to **3 inner attempts**"*; `akili-test.md:121` | `c94e6b6` | The Tester needs FR-1 too: High | — |
| P-5 | The unbounded loop is stated in the persona only; no command or mirror restates it | `consumer` | `grep -rn -i "until it passes\|until .* pass\|re-run the verification\|inner.loop\|self-correction" .claude/commands .claude/templates docs/commands docs/flow.md docs/model-routing.md README.md docs/cli.md` → 18 hits. `implementer.md:41,43,44` are the only statements of the Implementer's loop. About the Tester: `akili-constitution.md:406,452`, `akili-test.md:66,121`, `tester.md:39,66`, `docs/flow.md:370`, `README.md:842,864`. Matching the pattern on other text: `akili-test.md:108`, `tester.md:38,46`, `leader.md:329` ("after self-correction"), `docs/commands/akili-execute.md:88`, `docs/commands/akili-constitution.md:100` | `c94e6b6` | A surviving restatement contradicts DD-1: Low | — |
| P-6 | No command reads the `continuations:` or `runtime events:` lines of a task entry | `consumer` | `grep -rn -i "continuations\|runtime events" .claude/commands/akili-resume.md .claude/commands/akili-archive.md .claude/commands/akili-validate.md .claude/commands/akili-audit.md .claude/skills/kaizen/SKILL.md` → 0 hits | `c94e6b6` | A reader of the entry needs a rule for the two new lines: Low | — |
| P-7 | HALT rollback builds its pathspec from the entries' *files changed* lines | `consumer` | `akili-execute.md:305`, *"the explicit file paths from its attempt entries' *files changed* lines"* | `c94e6b6` | DD-9's last sentence is unnecessary: Low | — |
| P-8 | The `/goal` condition ends the loop on a pending question | `consumer` | `akili-execute.md:327`, *"OR a question is pending for the user"* | `c94e6b6` | A third checkpoint would not stop an unattended run; surface 12 grows: Low | — |
| P-9 | A continuation exists, capped at 2 under `pre-approved` and uncapped under `gated` (`:226`), consuming no attempt | `shared-state` | Siblings that re-spawn an Implementer inside a task, each with its mechanism: rework attempt (`akili-execute.md`, Step 2 loop, on FAIL) · continuation (`:225`, `:228`) · runtime ladder rungs 1 to 4 (`:68`). The checkpoint is the fourth | `c94e6b6` | DD-5's cap is not separate from an existing one: Low | — |
| P-10 | The brief copies the task from `tasks.md` | `other` | `akili-execute.md:166` | `c94e6b6` | The "do not open `tasks.md`" row starves the worker: High | — |
| P-11 | The host reports a finished worker's size in one spawn mode and not in another | `data-env` | Background agent mode: the completion notice of each of this session's three agents carried a usage block with token, tool-use and duration totals. Teammate mode: `cat <STAR session logs> \| grep -c "<usage>total_tokens"` → 0 in three projects holding 55, 446 and 183 teammate messages | session logs, 2026-09-29 | FR-7's second branch is unnecessary: Low | — |
| P-12 | A worker on `sonnet` stops at a stated budget of 20 tool calls | `data-env` | Two agents, 30 calls of work, budget 20. Transcript count of tool-use blocks: 20 shell calls plus the report call, in both. One kept a written tally, one did not | this session, 2026-09-29 | DD-10 has no basis: High | — |
| P-13 | A worker keeps an accurate count to 60 across mixed work: reads, edits, test runs | `data-env` | `UNVERIFIED — confirm at source before relying on it` | — | The call bound needs another carrier; DD-10 changes: **High** | T1, first step: one run of about 80 mixed calls with a budget of 60, counted from the transcript |
| P-14 | The pathspec and record rules leave a checkpointed spawn's files accounted for when its report lists them | `other` | `akili-execute.md:308`, *Residual*: a file changed and not reported is outside the pathspec, "the same hole the log format already has" | `c94e6b6` | A checkpoint widens that hole: Low | — |
| P-16 | With wrappers present the Leader does not read the persona, and works against the statuses the command defines | `consumer` | `akili-execute.md:107`, *"you orchestrate against the roles' **contracts** — the report shapes and `STATUS:` lines this command already defines — not against their persona text"* | `c94e6b6` | The command need not name the status: Low | — |
| P-17 | A verification failure the Implementer reports is an implicit FAIL. The rule's homes are two, and four more lines cite it | `consumer` | Homes: `akili-execute.md:64`, *Accounting rule*; `:396`, *"it reports back the failure and the Leader treats that as an implicit FAIL"*. Citing lines: `:62`, `:219`, `:259`, `:260` | `c94e6b6` | Surface 16 is unnecessary: Low | — |
| P-18 | Shipped sentences size a rework loop in round trips or list a task's outcomes: the grep returns 5 lines, which hold the figures 6 and 12 in one sentence, 6 twice more, and one outcome line | `consumer` | `grep -n -i "six delegated\|HALTED after\|round trips" .claude/templates/leader.md .claude/commands/akili-execute.md` → `akili-execute.md:263`; `leader.md:75`, `:76`, `:205`, `:332` | `c94e6b6` | Surfaces 14 and 17 shrink: Low | — |
| P-19 | The read rules a worker already carries, each with its mechanism | `shared-state` | `implementer.md:14` (reference documents, by section) · `:30` (pointed scenarios, verbatim) · `:31` (CodeGraph first; *"Open a full file when you are about to edit it"*) · `:46` (re-open a source before quoting) · `reviewer.md:16` (*"Do not request or read full source files unless absolutely necessary"*) · `tester.md:26` (*"Do **not** pull the full spec set"*) · `akili-execute.md:169` (*"full files are for what it is about to edit"*) · `akili-test.md:60` (the slice) | `c94e6b6` | DD-8 contradicts a sentence that survives: High | — |
| P-20 | The command defines `FATAL_FAIL` for the Reviewer only | `existence` | `akili-execute.md:255`, *"Used ONLY if the Reviewer detects"*; `:265`, *"If the Reviewer issues"*. The Implementer's is named in `implementer.md:44` and reaches the command only through Step 4's *"(or a FATAL_FAIL occurs)"*, `:298` | `c94e6b6` | DD-5 need not state it: Low | — |
| P-21 | HALT is described as the end of three attempts in eight shipped sentences | `consumer` | `akili-execute.md:121`, `:267`, `:311`; `leader.md:33`, `:335`; `README.md:854`; `docs/commands/akili-execute.md:57`; `docs/flow.md:330` | `c94e6b6` | Surfaces 17, 18 and 21 shrink: Low | — |
| P-15 | Bounded reads do not raise Reviewer FAILs | `data-env` | `UNVERIFIED — confirm at source before relying on it`. No run under the new personas exists | — | FR-6 is loosened in a follow-up: **Low** | The Kaizen retrospectives of the next two specs run under the new personas; owner: the user |

## 11. Risks

| Risk | Handling |
|---|---|
| The persona caps of NFR-1 are tight for three blocks in `implementer.md` | **Realized.** The caps could not hold the blocks; the user raised them at the T2 Pivot (`execution.md`). An overrun is still reported, never trimmed by dropping a row |
| A respawn repeats the dead end | *Tried and failed* is copied verbatim |
| Two parallel Implementers share the tree, and contention errors repeat the same way until the cap is spent | The respawn reads only its own listed files. The contention itself is `leader.md`'s concurrency rule, unchanged. A cap spent this way ends in a HALT the user sees |
| A worker checkpoints to avoid a FAIL | A checkpoint is allowed at a bound only, and the cap of 2 limits the gain to two extra spawns before a HALT |
| Mixed versions: a new command with an old persona | The worker never returns a checkpoint, and nothing waits for one (FR-9) |
| Mixed versions: a new persona with an old command | The Leader receives a status it has no action for. The old text's idle-without-report protocol would poke the worker. The migration note says to update the commands first |

## 12. Reversion Challenge (Step 2.3)

One challenger on `opus`, one question: what does removing the unbounded loop, and legitimizing a stop at a bound, break? It named 13 points. Each citation was opened at the source before it was accepted.

| # | Point | Outcome |
|---|---|---|
| 1 | A reported verification failure is an implicit FAIL, so a checkpoint after three failures would cost an attempt | **Fixed.** The status line tells them apart; surface 16; requirements A4 |
| 2 | The closed runtime-event enumeration lists the checkpoint in neither half | **Held.** The checkpoint paragraph says it is not a runtime event (DD-5) |
| 3 | The loop sketch sends every report to the evidence re-run | **Already in the design**, surface 9. The re-run runs on the completion report |
| 4 | A Leader with wrappers works from the statuses the command defines | **Fixed.** The command names the status line and the fields the Leader reads; P-16; requirements A8 |
| 5 | A checkpoint at the call bound looks like a continuation | **Fixed.** The status line decides the counter; requirements A4 |
| 6 | "Approach unviable" is a stop the persona forbids the Implementer | **Fixed.** `FATAL_FAIL` keeps its existing terms; requirements A1 |
| 7 | Planned reds would trip the bound, and their evidence is lost on a respawn | **Fixed.** DD-3 and DD-2; requirements A2, A3 |
| 8 | The report has no files-changed field, so rollback misses the first worker's edits | **Fixed.** The Leader records files from the tree; requirements A5 |
| 9 | A respawn reading the tree sees a sibling's edits | **Fixed** for the read; the contention is an existing rule (§11) |
| 10 | The turn bound omits respawns | **Already in the design**, surface 12 |
| 11 | Two other sentences size a loop at six round trips | **Fixed.** Surfaces 14 and 17; P-18; requirements A7 |
| 12 | A third checkpoint has no rollback, no final status, no outcome line and no place in the stop list | **Fixed.** It is a HALT with a named cause; requirements A6 |
| 13 | A task with two checkpoints reads as a clean run in `kaizen` | **Accepted, not fixed.** `kaizen` is outside this spec's diff (NFR-5). Follow-up |

## 13. Corrections After Judgment Day (2026-09-29)

Two blind judges on `opus`; ledger in `judgment.md`. The user chose to apply the fixes and not re-judge. Each row names where the correction landed in this document.

| Ledger | Correction | Landed in |
|---|---|---|
| L-1, L-5 | Rows P-5, P-17 and P-18 restated from the grep as run | §10 |
| L-2 | Owners for the unowned clauses | DD-3 (edits, call bound), DD-9 (FR-7, FR-9), DD-11 (FR-8), surface 18 (FR-10) |
| L-3, L-15 | The two "full file" sentences become surfaces; the quoting exception | Surfaces 22, 23; DD-8; P-19 |
| L-4 | Every HALT sentence is a surface | Surfaces 17, 18, 21; P-21 |
| L-6 | NFR-2's measure | Requirements NFR-2 |
| L-7 | R5 over R3; R4 recorded | DD-5 |
| L-8, L-9 | Tester and Reviewer columns; the Reviewer's own section lookup | DD-8; surface 24 |
| L-12 | What Safe Update does | DD-11; P-1 |
| L-13 | The Implementer's `FATAL_FAIL` is stated in the command | DD-5; §7.2; P-20 |
| L-16 | A seventh field | DD-2; DD-5; §7.2 |
| L-17 | Both exits in the legitimate-stops list | DD-4 |
| L-18 | Six *ended* values | DD-9 |
| L-19 | Files come from the report | DD-5; DD-9 |
| L-20 | The *Accounting rule* is a surface | Surface 20; §7.2 |
| L-22 | Bounds checked between edits; respawn count at zero; evidence carried | DD-2; DD-3 |

**Surface numbering.** Surfaces 20 to 24 were added after 19 had been assigned, so the table's order is 1 to 18, 20 to 24, 19.
