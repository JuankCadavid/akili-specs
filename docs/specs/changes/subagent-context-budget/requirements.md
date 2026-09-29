# Requirements: Bound What an Implementer Spawn Costs

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/subagent-context-budget` |
| Depth | **Standard**. To be re-checked against the design at Step 2.4 |
| Type | Change |
| Approval Mode | `pre-approved (user, 2026-09-29)`, inherited from `proposal.md` |
| Status | **Approved** (user, 2026-09-29), **amended the same day after the reversion challenge and after judgment day**: see §10. As first approved — OQ-1 to OQ-5 accepted as recommended: separate caps, no pause on a respawn, the call bound's carrier decided at the design gate, growth caps accepted, release class minor |
| Date | 2026-09-29 |
| Source | `proposal.md` (approved by the user 2026-09-29, Option C, §11 numbers and targets at their defaults) |
| Format precedent | `docs/specs/archive/2026-09-29-changes--scoped-constitution-reads/requirements.md`. This repo has no `docs/specs/general-setup/`, `docs/prd.md`, `docs/trd/` or `docs/ux-ui/` (`ls docs` run 2026-09-29 at `c94e6b6`) |
| Adjacent specs | `changes/review-intensity-trial-terms`, paused at its Phase 1 gate. It shares `akili-execute.md` Step 2.3 and the task entry list, and runs after this spec (proposal OQ-5) |
| Citations | Run at `c94e6b6` unless a row says otherwise |

## 2. Executive Summary

An Implementer spawn today can run without limit: its persona tells it to re-run a failing verification until it passes and forbids stopping because the run is long. This spec gives the run a bound and an exit. A worker that reaches the bound writes a **checkpoint**, and the Leader starts a fresh worker from it. The spec also limits what command output and file content may enter any worker's context, and puts each spawn's size on record.

**Proposal alignment:** aligned with the approved proposal (Option C). Exploration found three things the proposal did not have. Each needs the user's decision at this gate (§9).

| # | Finding | Effect on the proposal |
|---|---|---|
| 1 | A re-spawn path already exists. A report whose `Not Done / Assumptions` names owed work and no blocker gets a **continuation**, capped at 2 per task under `pre-approved` and uncapped under `gated` | The checkpoint must be told apart from a continuation, and both caps must be stated together (FR-3, OQ-1) |
| 2 | The Tester's self-correction loop is already bounded at 3 inner attempts. The Implementer's is the only unbounded one | Confirms the proposal's OQ-4 decision: the Tester needs no loop change |
| 3 | Full command output has to go somewhere. A file written inside the working tree would show up in the task's diff | The output file's location is constrained (FR-5) |

## 3. Glossary

| Term | Meaning here |
|---|---|
| **Worker** | An Implementer, Reviewer or Tester subagent. Never the Leader |
| **Spawn** | One run of one worker, from its brief to its final report |
| **Verification cycle** | One execution of the task's verification command by the Implementer, together with the fix attempt that preceded it |
| **Same failure** | Two verification cycles fail the same way when the same check fails on the same assertion or error. A different check, or a different error on the same check, is progress |
| **Loop bound** | **3** consecutive verification cycles with the same failure |
| **Call bound** | **60** tool calls made by the worker in one spawn |
| **Checkpoint** | The Implementer's report when it reaches a bound with the work unfinished and no blocker. It carries the status `CHECKPOINT` |
| **Continuation** | The existing re-spawn for owed items, defined in `/akili-execute` Step 2.3 item 0. Unchanged by this spec |
| **Respawn** | A fresh Implementer started by the Leader from a checkpoint report |
| **Spec documents** | `requirements.md`, `design.md`, `tasks.md` and `execution.md` of the spec being executed |
| **Large file** | A file of more than **400** lines |
| **Output limit** | **100** lines of one command's output entering the worker's context |

## 4. System Context & Scope

**Current behavior.** Rows 1 to 8 cite `measure/baseline.txt` in this folder, produced by the scripts beside it from local session logs of two downstream projects (297 Implementer spawns, 284 Reviewer spawns, August to September 2026).

| # | Claim | Evidence |
|---|---|---|
| 1 | Implementers hold 3,793M cache-read tokens and Reviewers 329M | `dist.py`, line *total cache_read*, both roles |
| 2 | Implementer turns per spawn: p50 49, p75 74, p90 113, max 969 | `dist.py akili-implementer`, line *turns* |
| 3 | Spawns over 100 turns are 14% of spawns and hold 53% of cache-read; over 60 turns, 35% and 77% | Same output, lines *spawns over …* |
| 4 | Median peak context is 188k to 207k tokens by project and role group, against a median first turn of 46k to 56k | `usage.py`, both projects |
| 5 | Tool results per Implementer spawn: Bash 52%, Read 45% | `growth.py akili-implementer`, tool table |
| 6 | Implementers read spec documents whole in 99 of 219 reads of `tasks.md`, `requirements.md` and `design.md` | `dist.py akili-implementer`, line *spec-doc Reads*: 34/49, 28/64, 37/106 |
| 7 | Reviewers read them whole in 204 of 665 reads | `dist.py akili-reviewer`, same line: 65/176, 81/210, 58/279 |
| 8 | Test-runner invocations per Implementer spawn: p50 4, p90 14, max 138 | `dist.py akili-implementer`, line *test-runner invocations* |
| 9 | The Implementer's loop is unbounded | `.claude/templates/implementer.md`, item 4: *"You must fix your code and re-run the verification until it passes."* |
| 10 | The Implementer may not stop because a run is long | Same file, item 2, *Don't stop short*: *"or stopping because the turn ran long or a milestone landed"* |
| 11 | The Tester's loop is bounded | `.claude/templates/tester.md`, item 4: *"Bounded to **3 inner attempts**"* |
| 12 | The Tester carries the same *Don't stop short* sentence | Same file, item 4 |
| 13 | A continuation exists, is capped at 2 per task under `pre-approved` and uncapped under `gated`, and consumes no rework attempt | `.claude/commands/akili-execute.md`, Step 2.3 item 0, bullets *Names no blocker* and *Accounting* |
| 14 | An attempt is consumed by a Reviewer `FAIL` or an Implementer-reported verification failure, "and by nothing else" | Same file, Step 2 preamble, *Accounting rule* |
| 15 | The Reviewer is told to rely on the diff and to read pointed sections at the source. Nothing limits how much of a spec document it opens | `.claude/templates/reviewer.md`, item 1 |
| 16 | The Implementer brief copies the task from `tasks.md` | `.claude/commands/akili-execute.md`, Step 2.2 brief list: *"the active task ID, title, and scope from `tasks.md` (copied — it is the work order)"* |
| 17 | The task entry records ten items. None is the size of a spawn | Same file, *Execution Log Format* |
| 18 | The main session's turn bound is computed from triad round-trips and continuations | Same file, Step 5: *"tasks remaining × up to 6 triad round-trips + 2 continuations per task + margin"* |
| 19 | Persona sizes today: `implementer.md` 10,654 bytes, `reviewer.md` 10,852, `tester.md` 8,867 | `wc -c .claude/templates/*.md` |
| 20 | The host reports a finished worker's token and tool-call totals to the Leader | `UNVERIFIED — confirm at source before relying on it`. Settled at design; FR-7 has an action for both answers |
| 21 | A worker can keep a count of its own tool calls across a run | `UNVERIFIED — confirm at source before relying on it`. Settled at design. If false, the call bound needs another carrier and the user is asked (OQ-3) |
| 22 | A host can cap a worker's turns from its wrapper | `UNVERIFIED — confirm at source before relying on it`. No packaged file names such a key (`grep -rn -i "maxTurns\|max_turns" .claude docs/model-routing.md docs/commands` → 0). Settled at design |

**In scope:** `.claude/templates/implementer.md`, `reviewer.md`, `tester.md`; `.claude/commands/akili-execute.md` (Step 2 loop, Step 2.2 brief, Step 2.3 report handling, Step 2.4 *Wind Down*, Step 4 opening, Step 5 turn bound, *Execution Log Format*, the *Error Handling* sentence on a failing verification); `.claude/commands/akili-test.md` only where a sentence about the Tester's output turns false; `.claude/templates/leader.md` at the sentences that size a rework loop, describe a HALT, or list a task's outcomes; `README.md` at its loop summary; the `docs/commands/` mirrors; `docs/model-routing.md` and `docs/flow.md` where a sentence turns false; `CHANGELOG.md`; `measure/` in this folder.

**Out of scope:** model tiers, wrappers and the registry; task sizing at `/akili-specify`; the rework ceiling; Reviewer verdicts; the evidence re-run; the continuation rule; the Leader's own context; `/akili-constitution` (Safe Update included); `bin/`, `scripts/`, `package.json`; any hook or telemetry.

## 5. Stakeholders / Personas

| Persona | Stake |
|---|---|
| Project maintainer running `/akili-execute` | Pays for every turn of every worker |
| Implementer | Gets a bound, an exit and rules on what it may load |
| Reviewer, Tester | Get rules on what they may load |
| Leader | Handles one more report status and records one more item per spawn |
| Maintainer of a project scaffolded before this change | Keeps the old personas in `.agents/` until they act |

## 6. Functional Requirements

### FR-1: The Implementer's self-correction loop is bounded

- The Implementer SHALL stop its self-correction loop when **3** consecutive verification cycles end in the same failure.
- A cycle that fails differently SHALL reset the count.
- At the bound the Implementer SHALL choose by content: a **checkpoint** when a fresh worker could continue from its report, `FATAL_FAIL` on that status's existing terms. The terms of `FATAL_FAIL` are unchanged, and so is the rule that a wrong spec is the Leader's call.
- The task's falsifier run, the expected red of a test written before its code, and a baseline reading SHALL NOT count as failed cycles.
- The Implementer SHALL NOT report completion with a failing verification. That prohibition stands.

#### Scenario: The same assertion fails three times

- GIVEN an Implementer whose verification has failed twice on the same assertion
- WHEN the third cycle fails on that assertion
- THEN the Implementer ends its run with a checkpoint or a `FATAL_FAIL`
- BUT it must NOT run a fourth cycle

#### Scenario: A different failure is progress

- GIVEN two cycles that failed on assertion A
- WHEN the third cycle passes A and fails on assertion B
- THEN the count restarts at one
- AND the Implementer continues

### FR-2: The Implementer has a checkpoint exit

- The Implementer SHALL write a checkpoint when it reaches the loop bound (FR-1) or the call bound of **60** tool calls, whichever comes first, with the task unfinished and no blocker.
- A checkpoint SHALL be reached at a bound and nowhere else. A checkpoint written before a bound is a premature stop.
- Before it reports, the Implementer SHALL leave no edit half-written. The bounds are checked between edits, and the edit in hand is finished first.
- A worker at the call bound with the task complete and not yet verified SHALL run the verification once, then report completion, or a checkpoint if it fails.
- A respawned worker's count of same failures SHALL start at zero.
- The report's first line SHALL be `STATUS: CHECKPOINT`, followed by these seven fields and no others:

| Field | Content |
|---|---|
| Bound reached | `loop` or `calls`, with the count |
| Done | What is implemented, by file. Any red run or falsifier evidence already produced, quoted verbatim, so the final report can carry it |
| Remaining | What the task still needs, in order |
| Tree state | Every file changed, and whether the verification currently passes, fails, or was not run |
| Tried and failed | Each approach that did not work and the failure it produced. `none` when nothing failed |
| Next step | The first action the next worker should take |
| Notes | A Pivot-Detection flag, a lookup note. `none` when there is neither |

- *Don't stop short* SHALL keep forbidding a stop because a run is long, and SHALL name the checkpoint at a bound as a legitimate stop.
- A worker that reaches the call bound with the task complete and verified SHALL report completion, never a checkpoint.
- The completion report of the last worker SHALL carry the red run and falsifier evidence that earlier checkpoints recorded in *Done*.
- The list of legitimate stops SHALL name both exits at a bound: the checkpoint, and `FATAL_FAIL` on its existing terms.

#### Scenario: Sixty tool calls, work unfinished

- GIVEN an Implementer that has made 60 tool calls with two of five files done and no failing verification
- WHEN it reaches the bound
- THEN it reports `STATUS: CHECKPOINT` with all seven fields
- BUT it must NOT report completion
- AND IT MUST NOT leave an edit half-written

#### Scenario: A worker tired of a hard task

- GIVEN an Implementer at 20 tool calls with no failed verification cycle
- WHEN it finds the task harder than expected
- THEN it continues
- BUT it must NOT write a checkpoint

### FR-3: Every report an Implementer can return has one Leader action

| # | The report… | Leader action | Status |
|---|---|---|---|
| R1 | is complete, with no `Not Done / Assumptions` | Evidence re-run, then Step 2.3 | Unchanged |
| R2 | names a blocker | `[~]` and escalate | Unchanged |
| R3 | names owed items and no blocker | Continuation rule | Unchanged |
| R4 | holds assumptions only, or an inconclusive verification | As Step 2.3 item 0 says today. Under `pre-approved` that text names no action; the gap predates this spec and is a follow-up | Unchanged |
| R5 | is a completion-time report of a verification the worker could not fix, with no `STATUS: CHECKPOINT` line | Implicit FAIL; consumes an attempt | Unchanged |
| R6 | is `STATUS: FATAL_FAIL` from the Implementer | HALT by the existing HALT step | **Stated**: the command defines this status for the Reviewer only |
| R7 | is `STATUS: CHECKPOINT` | **Respawn** (below) | **New** |
| R8 | never arrives | Runtime event, by the existing ladder | Unchanged |
| Fall-through | fits none of the above | Treated as R8's *idle-without-report* | Stated here |

For R7 the Leader SHALL:

- start a fresh Implementer, never resume the old one;
- give it the original brief, and the checkpoint report **copied verbatim**, never as a pointer and never paraphrased;
- tell it that the working tree already holds the listed changes and that it reads them from the tree;
- run no evidence re-run and no Reviewer on the checkpoint, since the work is unfinished.

**Precedence.** A report that carries `STATUS: CHECKPOINT` and also names a blocker is R2. A checkpoint whose *Tree state* says the verification fails is still R7, never R5. A report that names a failing verification and no blocker is R5, never R3: a failing verification is not an owed item. A checkpoint whose *Notes* carries a Pivot-Detection flag goes to Pivot Detection before any respawn. The status line decides which counter a report belongs to: a checkpoint counts against the checkpoint cap, and a report with owed items and no status line against the continuation cap.

**Files.** On a checkpoint the Leader SHALL record the files changed as the report's *Tree state* lists them, and confirm each exists as a change in the working tree. With parallel Implementers the tree alone cannot say whose a change is. The respawned worker SHALL be told to read the listed files and no other uncommitted change.

**Accounting.** A checkpoint SHALL consume no rework attempt, SHALL NOT be a runtime event, and SHALL add no round to the Budget Tripwire. It SHALL be recorded on its own line in the task entry, written only when one fires.

**Cap.** At most **2** checkpoints per task, counted across all attempts. A third checkpoint report SHALL end the task as a **HALT**, by the existing HALT step, with the cause recorded as the checkpoint cap: the task is marked `[~]`, the tree state is handled as that step says, and the user is asked. The HALT record holds every checkpoint report and whatever FAIL reports exist. Every sentence that describes a HALT as the end of three attempts SHALL name the checkpoint cap as well. The cap is separate from the continuation cap.

**Approval mode.** A respawn SHALL happen without a pause in both `gated` and `pre-approved` modes. Every checkpoint SHALL be reported at the task's continue gate.

**Turn bound.** The main session's turn-bound formula (§4 claim 18) and every sentence that sizes a rework loop in round trips SHALL account for up to 2 respawns per task.

**The command carries the contract.** `/akili-execute` SHALL name the status line and the report fields the Leader reads, since a Leader working with wrappers does not read the persona.

#### Scenario: A checkpoint is respawned

- GIVEN a first checkpoint on a task's attempt 1
- WHEN the Leader receives it
- THEN a fresh Implementer is started with the brief and the report verbatim
- AND the attempt counter still reads 1
- BUT the Leader must NOT spawn a Reviewer on the unfinished work

#### Scenario: A third checkpoint

- GIVEN a task with two checkpoints recorded
- WHEN a third checkpoint report arrives
- THEN the task is HALTed with the cause `checkpoint cap`, marked `[~]`, and the user is asked
- BUT it must NOT be respawned

#### Scenario: A checkpoint with a failing tree

- GIVEN a checkpoint report at the loop bound whose *Tree state* says the verification fails
- WHEN the Leader reads it
- THEN a fresh Implementer is started
- BUT the attempt counter must NOT advance

#### Scenario: A checkpoint with a blocker inside

- GIVEN a report headed `STATUS: CHECKPOINT` whose *Remaining* field says a credential is missing
- WHEN the Leader reads it
- THEN the task is marked `[~]` and escalated as a blocker
- BUT it must NOT be respawned

### FR-4: The brief states the budget

- The Implementer brief SHALL give the worker its budget: for a **host** worker by naming the budget its persona states, for a **non-host** worker by copying the two numbers and the checkpoint fields.
- The brief SHALL tell the worker that the task text is already in the brief.
- On a respawn the brief SHALL say which checkpoint this is, first or second.

### FR-5: Command output entering a worker's context is bounded

Applies to the Implementer and the Tester, for test, build, lint, diff and any command that prints a file.

- At most **100** lines of one command's output SHALL enter the worker's context.
- When a command would print more, the worker SHALL send the full output to a file and bring into context the result summary and the failing part.
- The failing part SHALL be kept whole up to the limit: the failing test's name, the assertion or error, and the location. A summary that says only "failed" is not allowed.
- The output file SHALL sit outside the project's working tree, or in a location the project's version control ignores. It SHALL NOT appear in the task's diff or commit.
- A worker SHALL NOT print a whole file through a shell command as a way to read it.
- A diff SHALL be read as a summary of changed files first, then by file.
- When the worker's report quotes verification evidence, the quotation SHALL still be verbatim. This rule limits what is loaded, never what is reported as evidence.

#### Scenario: A test run prints 2,000 lines

- GIVEN a verification command whose output is 2,000 lines with one failing test
- WHEN the Implementer runs it
- THEN the full output goes to a file outside the diff
- AND the context receives the pass and fail counts and the failing test's name, assertion and location
- BUT it must NOT receive the 2,000 lines

#### Scenario: The failure is longer than the limit

- GIVEN 12 failing tests whose messages total 300 lines
- WHEN the worker summarizes
- THEN the first 100 lines of failures enter the context, with the count of failures not shown
- AND the worker searches the file for the rest as it needs them

### FR-6: File reads are bounded for every worker

Applies to the Implementer, the Reviewer and the Tester.

| What is read | Rule |
|---|---|
| `requirements.md`, `design.md` | Only the sections the brief points at. A section the work turns out to need is found by a section lookup, as the personas define it |
| `tasks.md` | The Implementer SHALL NOT open it when the brief carries the task. The Reviewer and the Tester open it only at a block their brief or slice points at |
| `execution.md` | Only the entries the brief names |
| A large file the worker will not edit | Read by range, or resolved through CodeGraph where the project has it. For the Reviewer this applies when its diff-first rule already allows a file read |
| A large file the worker will edit | Read at the ranges that cover the regions it edits and what those regions depend on |
| A file of 400 lines or fewer | May be read whole |
| A file already read in this spawn and not changed since | SHALL NOT be read again, except to quote or pin a source, which the byte-identity rule requires |

- The rule for the reference documents (the TRD and the UX/UI design) is unchanged. It stays where `changes/scoped-constitution-reads` put it.
- The Reviewer's diff-first rule is unchanged.
- Each persona SHALL define the section lookup it uses.
- The existing sentences that tell a worker to open a full file it is about to edit SHALL be brought in line with the large-file rule.
- The verbatim-at-the-source rule is unchanged: a pointed section is read in full.

#### Scenario: A brief that points at two scenarios

- GIVEN a brief naming two scenarios of `requirements.md` and one section of `design.md`
- WHEN the Implementer starts
- THEN it reads those three places
- BUT it must NOT read either document whole
- AND IT MUST NOT open `tasks.md`

#### Scenario: A 2,000-line component to edit

- GIVEN a task that changes one method of a 2,000-line file
- WHEN the Implementer prepares the edit
- THEN it reads the method and the declarations the method uses
- BUT it must NOT read the file whole

### FR-7: Each spawn's size is on record

- Each task entry in `execution.md` SHALL record, per spawn: the role, the tool-call count, the token total, and how the spawn ended: complete, checkpoint, partial, fail, fatal, or died.
- The values SHALL come from what the host reports to the Leader when the worker finishes.
- When the host reports none, the entry SHALL say `not reported by host` and carry the worker's own counts where its report gives them. The Leader SHALL NOT estimate.
- The record is information. It SHALL NOT gate a task, fail a task or trip the Budget Tripwire.

#### Scenario: A host that reports nothing

- GIVEN a host that returns only the worker's text
- WHEN the Leader writes the task entry
- THEN the spawn line reads `not reported by host`
- BUT it must NOT hold an estimated number

### FR-8: The effect is measured

- The scripts in `measure/` and `baseline.txt` SHALL stay in the spec folder and move with it to the archive.
- The three targets fixed at the proposal's approval SHALL be measured on the first 30 Implementer spawns that run under the new personas, with the same scripts.

| Measure | Baseline | Target |
|---|---|---|
| Spawns over 100 turns | 14% | under 3% |
| Median peak context | 188k to 207k by group | under 120k |
| Whole reads of `tasks.md`, `requirements.md`, `design.md` | 45% (99 of 219) | under 10% |

- The result SHALL be reported to the user whether the targets are met or not.
- The measurement is a follow-up after adoption. It SHALL NOT be a validation gate for this spec.

### FR-9: Older projects and older logs behave as today

- A project whose `.agents/` personas predate this change SHALL run as today. No command SHALL fail on it.
- When a worker running an older persona never returns a checkpoint, nothing in `/akili-execute` SHALL depend on one arriving.
- An `execution.md` whose entries predate FR-7 SHALL read as "not recorded".

### FR-10: The change is documented

- `CHANGELOG.md` `Unreleased` SHALL carry the entry, the numbers, and the proposed release classification.
- The entry SHALL carry a migration note: `/akili-constitution` Safe Update appends an upgrade block to a deployed persona and leaves its old sentences in place. The note names the sentences to replace by hand.
- The mirrors SHALL describe the change at summary level and contradict no command sentence.
- `docs/model-routing.md`, `docs/flow.md` and `README.md` SHALL change only where a sentence turns false, and the falsifying grep SHALL be run before "no change" is written (KZ-002).

## 7. Non-Functional Requirements

| ID | Requirement | Measure |
|---|---|---|
| NFR-1 | **Persona growth is bounded.** A persona is re-read on every spawn | Against `c94e6b6`: `implementer.md` grows by no more than **3,400** bytes, `reviewer.md` by no more than **900**, `tester.md` by no more than **1,600**. Raised by the user on 2026-09-29 from 2,500 and 1,200, through the Pivot recorded in `execution.md`: a plain draft of the FR-5 and FR-6 blocks measured 1,491 bytes against 884 remaining |
| NFR-2 | **One home per reader.** A persona carries the rules its worker executes. The Leader's action and the checkpoint cap live in `/akili-execute` Step 2.3. Commands and mirrors cite a worker's rule by name and restate none of its four numbers, except the non-host brief. The cap is restated only by the sentences that size a loop | `grep -rn -i "60 tool calls\|100 lines\|400 lines\|consecutive verification" .claude/commands docs/commands docs/flow.md docs/model-routing.md README.md` → the non-host clause only (0 hits at `c94e6b6`). `CHANGELOG.md` is exempt |
| NFR-3 | **Tool-agnostic wording.** No added sentence names a host-specific tool or flag | No host tool name in the added text |
| NFR-4 | **No rule is pointed at by line number** in shipped prose (KZ-005) | `grep` for `:<digits>` references in the added text → 0 |
| NFR-5 | **Bounded diff.** Zero diff in `bin/`, `scripts/`, `package.json`, `.claude/skills/`, and `/akili-constitution` | `git diff --stat` against the starting commit |

## 8. Defect Classes and Gates

| Defect class this spec can produce | Gate that catches it |
|---|---|
| A report status has no Leader action, or two (KZ-004, KZ-changes--premise-ledger-1) | A literal walk of R1–R8 against the shipped Step 2.3, plus one **held-out** report the text does not cite |
| The new bound is contradicted by a surviving sentence: "until it passes", "the turn ran long", "and by nothing else" (KZ-changes--leader-brief-contract-1) | Each paragraph that received an insertion is read whole. Obligation-keyed grep for the unbounded loop and its paraphrases, every hit read |
| The persona and the command disagree on a number or on what a checkpoint is | Cross-read of `implementer.md` against Step 2.2 and Step 2.3, one term at a time |
| A requirement paragraph is dropped in shipping (KZ-changes--gate-falsifiability-2) | Each FR is walked term by term against the shipped text, tables and bullets included |
| A design table drops a cell's obligation (KZ-changes--scoped-constitution-reads-1) | The design's tables are compared cell by cell with FR-2, FR-3 and FR-6 before tasks are written |
| The output rule lets a worker lose the failing line | A walk of FR-5's two scenarios, and one held-out output shape |
| A persona grows past its cap | `wc -c` against the starting commit |
| A summary surface claims something that did not ship (KZ-002) | The CHANGELOG entry is checked clause by clause against the shipped text |
| The packaged files no longer install | `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` |

**No automated check exists for two classes. Both are accepted risks:**

| Class | Why no gate | Substitute |
|---|---|---|
| A real worker, given the new text, still loops, or still reads a document whole | This repository has no harness that runs a worker against a persona | The literal walks above, then FR-8's measurement on real spawns |
| Bounded reads make workers miss context, and Reviewer FAILs rise | Observable only over later specs | Recorded for the Kaizen retrospectives of the next two specs run under the new personas |

## 9. Open Questions for This Gate

| # | Question | Recommendation |
|---|---|---|
| OQ-1 | Is the checkpoint cap separate from the continuation cap? Under `pre-approved`, separate caps allow up to 4 extra spawns on one task | **Separate.** They answer different events: a continuation follows a worker that believed it was done; a checkpoint follows one that knew it was not |
| OQ-2 | Does a respawn pause for the user under `gated`? | **No.** It is reported at the task's continue gate. A pause on every checkpoint would make the bound cost more attention than it saves |
| OQ-3 | If design finds a worker cannot count its tool calls (§4 claim 21), what carries the call bound? | **Ask at the design gate.** The loop bound stands either way, since the worker runs those cycles itself |
| OQ-4 | Accept the persona growth caps of NFR-1? (Superseded 2026-09-29 by the T2 Pivot: the caps were raised) | **Yes.** They are about a quarter of the Implementer's current size, and the rule they buy bounds the whole run |
| OQ-5 | Release classification | **Minor.** A new report status and a new Leader action are behavior. No migration is forced |

## 10. Amendments After the Reversion Challenge (2026-09-29)

One challenger on `opus` was asked what removing the unbounded loop breaks. It named 13 points; each citation was checked at the source. Full record: `design.md` §12.

| # | Amendment | Where |
|---|---|---|
| A1 | `FATAL_FAIL` keeps its existing terms. The first draft's "approach unviable" gave the Implementer a stop its persona forbids | FR-1 |
| A2 | Planned reds and the falsifier run are not failed cycles | FR-1 |
| A3 | Evidence already produced travels in the checkpoint's *Done* field | FR-2 |
| A4 | R5 and R7 are told apart by the status line; so are the two caps | FR-3 |
| A5 | The Leader records a checkpointed spawn's files from the working tree | FR-3 |
| A6 | A third checkpoint is a HALT with a named cause, so rollback, the final status, the stop list and the unattended condition all apply | FR-3 |
| A7 | Every sentence that sizes a loop in round trips is updated; `leader.md` enters scope at the sentences design surface 17 lists | FR-3, §4 |
| A8 | The command names the status line and the fields the Leader reads | FR-3 |
| A9 | The brief gives a host worker its budget by reference, and copies it for a non-host worker. Found while writing the design, not by the challenger | FR-4 |
| A10 | "Defined once" becomes one home per reader, since a persona cannot cite another persona. Same origin | NFR-2 |

### After judgment day

Two blind judges on `opus`. Ledger and receipt: `judgment.md`. The user chose to apply the fixes without re-judging.

| # | Amendment | Ledger | Where |
|---|---|---|---|
| B1 | Bounds are checked between edits; one verification run is allowed at the call bound; a respawn's failure count starts at zero | L-2, L-22 | FR-2 |
| B2 | A seventh field, *Notes*, carries a Pivot-Detection flag or a lookup note | L-16 | FR-2, FR-3 |
| B3 | The last worker's completion report carries earlier evidence | L-22 | FR-2 |
| B4 | The legitimate-stops list names both exits at a bound | L-17 | FR-2 |
| B5 | R6 is stated for the Implementer; R5 wins over R3; R4's gap is recorded | L-7, L-13 | FR-3 |
| B6 | Files are recorded from the report and confirmed in the tree | L-19 | FR-3 |
| B7 | Every sentence that describes a HALT names the checkpoint cap; the HALT record's content is stated | L-4 | FR-3 |
| B8 | Read rules: the quoting exception, the Reviewer and Tester rows, the section lookup per persona, the two "full file" sentences | L-3, L-8, L-9, L-15 | FR-6 |
| B9 | The *ended* values are six | L-18 | FR-7 |
| B10 | The migration note says what Safe Update does | L-12 | FR-10 |
| B11 | NFR-2's measure is a grep that can be run | L-6 | NFR-2 |
| B12 | The baseline medians are stated as ranges | L-10 | §4, FR-8 |
| B13 | The continuation cap is stated with its mode | L-14 | §2, §4, §9 |

### After the T2 Pivot (2026-09-29)

| # | Amendment | Where |
|---|---|---|
| C1 | NFR-1's caps for `implementer.md` and `tester.md` are raised to 3,400 and 1,600 bytes. The user chose this at the Pivot; compressing to the old caps had already cost T1 a review round | NFR-1 |

**Accepted and not fixed:** a task that closes after one or two checkpoints still reads as a clean run in the Kaizen retrospective, because `kaizen` gains no Measure row in this spec (NFR-5). It is a follow-up.

## 11. Requirement ID Index

| ID | Title | Proposal delta |
|---|---|---|
| FR-1 | Self-correction loop bounded | MODIFIED |
| FR-2 | Checkpoint exit and its report | ADDED; *Don't stop short* MODIFIED |
| FR-3 | One Leader action per report, respawn, cap, accounting | ADDED |
| FR-4 | The brief states the budget | ADDED |
| FR-5 | Command output bounded | ADDED |
| FR-6 | File reads bounded | ADDED |
| FR-7 | Per-spawn record | ADDED |
| FR-8 | Effect measured | Success criterion 6, made a requirement |
| FR-9 | Older projects behave as today | Non-goal, made testable |
| FR-10 | CHANGELOG, migration note, mirrors | Scope |
| NFR-1…5 | Growth caps, one home per reader, tool-agnostic, no line pointers, bounded diff | — |
