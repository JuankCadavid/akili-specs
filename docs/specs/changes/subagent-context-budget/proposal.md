# Proposal: Bound What an Implementer Spawn Costs

**Recommendation:** bound the Implementer's run, not its model. Measured on two projects, the Implementer holds 92% of worker cache-read, and 14% of its spawns hold 53% of that. The cost is turns multiplied by a context that keeps growing. Give the worker a bounded self-correction loop with a checkpoint-and-respawn exit, rules for what command output and file reads may enter its context, and a record of each spawn's cost so the effect can be measured.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/subagent-context-budget` |
| Slug | `subagent-context-budget` — derived from the free-text argument ("subagent token consumption: Implementer and Reviewer spawns in /akili-execute cost turns × growing context …"); the full text is proposal context, not a directory name |
| Type | **Change** |
| Approval Mode | `pre-approved (user, 2026-09-29)`. First recorded as `gated`; the user gave the mandate at the design gate: apply the judgment-day fixes without re-judging, then specify and execute to the end |
| Depends on | none. Follows `changes/scoped-constitution-reads` (archived 2026-09-29, `Unreleased`) |
| Parallel-safe | **no** with `changes/review-intensity-trial-terms` — both edit `.claude/commands/akili-execute.md` Step 2.2–2.3 and the *Execution Log Format* |
| Date | 2026-09-29 |
| Status | **Approved** (user, 2026-09-29, Option C) — §11 numbers and targets accepted at their proposed defaults; OQ-4: the Tester gets output discipline and bounded reads only; OQ-5: this spec runs before `changes/review-intensity-trial-terms` |
| Requirement source | The user's queued topic of 2026-08-12 and the measurement of 2026-09-29. No Jira ticket |

## 2. Intent

Make the cost of one worker spawn bounded and visible, so a task that goes badly costs a respawn and not a 900k-token context.

## 3. Problem / Current Behavior

**Measurement.** Every figure below comes from `measure/baseline.txt` in this folder, produced by the three scripts beside it, run 2026-09-29 at `c94e6b6`. The source is the local session logs of two downstream projects (STAR and the reporting tool), August to September 2026: 297 Implementer spawns and 284 Reviewer spawns. The logs are on the maintainer's machine, so the scripts reproduce there and nowhere else.

| # | Claim | Evidence |
|---|---|---|
| 1 | The Implementer is where the cost is: 3,793M cache-read tokens against 329M for the Reviewer | `dist.py akili-implementer` and `dist.py akili-reviewer`, line *total cache_read* |
| 2 | An Implementer spawn runs a median of 49 turns; p75 is 74, p90 is 113, and the longest ran 969 | `dist.py akili-implementer`, line *turns* |
| 3 | The cost sits in the tail. Spawns over 100 turns are 14% of spawns and hold 53% of cache-read. Spawns over 60 turns are 35% and hold 77% | Same output, lines *spawns over …* |
| 4 | Context grows far past its start. Median first-turn context is 46k to 56k tokens by project and role group; median peak is 188k to 207k (corrected 2026-09-29 after judgment day, L-10); the highest peak is 930k. Spawns that peak over 200k are 46% of spawns and hold 84% of cache-read | `usage.py` for both projects, columns *first ctx med*, *peak med*, *peak max*; `dist.py`, line *spawns peaking over 200k* |
| 5 | Tool results add about 42k tokens per Implementer spawn: Bash 52%, Read 45% | `growth.py akili-implementer`, tool table. Tokens are estimated at 4 characters each |
| 6 | 294 Implementer reads returned more than 20,000 characters each | Same table, column *>20k*, row *Read* |
| 7 | Spec documents are read whole despite the pointer brief: `tasks.md` in 34 of 49 reads, `requirements.md` in 28 of 64, `design.md` in 37 of 106 | `dist.py akili-implementer`, line *spec-doc Reads (whole/total)* |
| 8 | A worker runs its test command a median of 4 times per spawn; p90 is 14 and the most is 138 | Same output, line *test-runner invocations* |
| 9 | The Reviewer is cheap per spawn (median 12 turns) and its context is 79% file reads. It also reads spec documents whole: `requirements.md` in 81 of 210 reads | `dist.py akili-reviewer`; `growth.py akili-reviewer` |
| 10 | Model routing is already correct in STAR: leader on `haiku`, implementer and tester on `sonnet`, reviewer on `opus` | `alliance-research-indicators-main/.claude/agents/akili-*.md`, `model:` key, read 2026-09-29 on branch `star-monorepo` |

**What the shipped text says today** (cited at `c94e6b6`):

| # | Claim | Evidence |
|---|---|---|
| 11 | The Implementer's self-correction loop has no bound: it must "fix your code and re-run the verification until it passes", and may report `FATAL_FAIL` only after "multiple inner-loop attempts" | `.claude/templates/implementer.md`, item 4, *Self-Correction Inner Loop* |
| 12 | The Implementer's only exits are a complete report, a truthful partial with a named blocker, and `FATAL_FAIL`. No exit exists for "the work is sound and my context is spent" | Same file, item 2 *Scope Discipline* and item 4 |
| 13 | The persona tells the worker not to stop because "the turn ran long" | Same file, item 2, *Don't stop short* |
| 14 | No rule in the personas or in `/akili-execute` says how much command output may enter a worker's context | `grep -n -i "turn bound\|truncat\|output discipline" .claude/commands/akili-execute.md .claude/templates/*.md` → 3 hits, none about a worker's command output: `akili-execute.md` Step 5 (the turn bound of the main session's loop), `reviewer.md` (a CSS truncation example), `leader.md` (the Leader truncating the reports it reads) |
| 15 | The rule on full-file reads covers exploration only, and only in projects with CodeGraph | `.claude/templates/implementer.md`, item 1, *CodeGraph first* |
| 16 | The brief copies the task from `tasks.md` and points at sections of `requirements.md` and `design.md`. Nothing tells the worker not to open `tasks.md` | `.claude/commands/akili-execute.md`, Step 2.2 brief list |
| 17 | The task entry in `execution.md` records attempts and verdicts, and nothing about a spawn's turns or context | Same file, *Execution Log Format*, "Each task entry must record" |
| 18 | The Budget Tripwire counts tasks, lines and review rounds. It does not see a single spawn that runs long | Same file, Step 2.4, *Budget Tripwire* |
| 19 | The Leader has a context checkpoint between tasks. The workers have none | Same file, Step 5, *Context checkpoint* |
| 20 | A host can cap a worker's turns from the agent wrapper | `UNVERIFIED — confirm at source before relying on it`. No packaged file names such a key (`grep -rn -i "maxTurns\|max_turns" .claude docs/model-routing.md docs/commands` → 0 hits). Settled at `/akili-specify` design |
| 21 | A worker can observe its own turn count or context size | `UNVERIFIED — confirm at source before relying on it`. If false, the trigger must be something the worker can count: verification cycles, files read. Settled at `/akili-specify` design |
| 22 | `changes/scoped-constitution-reads` lowers first-turn context by about 15k to 19k tokens on STAR | Its `requirements.md` NFR-4. Against claim 4, that is the smaller share: the start is 46k to 56k and the median peak 188k to 207k |

**Why the tail costs so much.** Each turn re-reads the whole context. A worker at 200k tokens pays 200k per turn, and a worker that started fresh would pay about 50k to 60k. Claim 11 lets a worker stay in that state as long as its verification keeps failing.

**Limits of this evidence.** The logs predate `changes/scoped-constitution-reads` and part of the pointer-brief rules. The Tester has 2 spawns in the sample, which supports no conclusion. The 4-characters-per-token estimate undercounts code.

## 4. Proposed Outcome

| Outcome | What changes for the reader |
|---|---|
| A long run ends in a checkpoint | The Implementer has a fourth exit: it reports what is done, what remains and what it learned, and the Leader respawns a fresh worker with that report |
| The self-correction loop has a bound | A stated number of verification cycles without progress ends the loop |
| Command output is bounded | Test, build and diff output enters the context as a summary and the failing part, never whole |
| File reads are bounded | Spec documents are read at the pointed sections. A large file is read at the range the work needs |
| A spawn's cost is on record | Each task entry states the spawn's size, so the next measurement needs no log mining |

## 5. Scope

| Surface | Change |
|---|---|
| `.claude/templates/implementer.md` | The loop bound, the checkpoint exit and its report shape, output discipline, bounded reads. *Don't stop short* amended so a checkpoint is a legitimate stop |
| `.claude/templates/reviewer.md` | Bounded reads of spec documents and large files |
| `.claude/templates/tester.md` | Output discipline and bounded reads only (OQ-4) |
| `.claude/commands/akili-execute.md` | Step 2.2: the brief states the budget and tells the worker `tasks.md` is already in the brief. Step 2.3: what the Leader does with a checkpoint report, and how it is accounted. *Execution Log Format*: the per-spawn record |
| `.claude/templates/leader.md` | Only where a sentence about worker reports turns false |
| `docs/commands/` mirrors, `docs/model-routing.md` where a sentence turns false | Summary-level mirror |
| `CHANGELOG.md` | `Unreleased` entry, with the migration note for deployed personas |
| `measure/` in this spec folder | The scripts and the baseline. Not packaged |

## 6. Non-Goals

- **No change to model tiers, wrappers or the registry.** Claim 10 shows they are correct.
- **No change to task sizing at `/akili-specify`.** Smaller tasks would help, and they belong to the queued `changes/budget-and-concurrency`.
- **No change to the rework ceiling, the Reviewer's verdicts or the evidence re-run.**
- **No change to the Leader's own context.** The main session is a separate cost with a separate cause.
- **No telemetry, no hook and no installer change.** The per-spawn record is prose the Leader writes.
- **No edit to a deployed persona in any project.** `/akili-constitution` Safe Update never overwrites one; the migration is a note.
- **No new command.**

## 7. Affected Users, Systems, And Specs

| Affected | How |
|---|---|
| Every project running `/akili-execute` | A long Implementer run ends in a checkpoint and a respawn |
| Projects scaffolded before this change | Keep the old persona in `.agents/` until the maintainer acts |
| `changes/review-intensity-trial-terms` | Shares `akili-execute.md` Step 2.3 and the task entry list. Run the two in sequence |
| `changes/budget-and-concurrency` (queued) | Owns task sizing and review rounds per task. This spec leaves both alone |
| `changes/scoped-constitution-reads` (archived) | Untouched. Its read rule for reference documents stays; this spec adds rules for spec documents and source files |

## 8. Visual Reference

- Source: **None**
- Location: n/a
- Notes: methodology prose; no UI surface.

## 9. Requirement Delta Preview

### ADDED

- A checkpoint exit for the Implementer, with a fixed report shape.
- A bound on the self-correction loop.
- A Leader rule for a checkpoint report: respawn with the report, and count it as neither a rework attempt nor a FAIL.
- A cap on checkpoints per task, after which the task is escalated.
- Output discipline for test, build and diff commands.
- Bounded reads for spec documents and large files, for Implementer, Reviewer and Tester.
- A per-spawn cost record in the task entry.

### MODIFIED

- *Self-Correction Inner Loop*: "re-run until it passes" → re-run within the bound, then checkpoint or `FATAL_FAIL`.
- *Don't stop short*: stopping because the run is long stays forbidden, except through the checkpoint exit at its trigger.

### REMOVED

- None.

## 10. Approach Options

| | Option | Trade-off |
|---|---|---|
| **A** | **Wait and re-measure after `scoped-constitution-reads` is released** | No work. It addresses the start of the context, which claim 22 shows is the smaller share. The tail stays |
| **B** | **Guidance only: output discipline and bounded reads in the personas** | Two or three files, low risk. It slows the growth of context and leaves the unbounded loop in place, so the 14% of spawns that hold 53% of the cost keep running |
| **C** | **B, plus the loop bound, the checkpoint-and-respawn exit and the per-spawn record** ✅ | Touches the Implementer's exit contract and Step 2.3. It is the only option that acts on the tail. A respawn pays the starting context again, so the trigger must sit where that is cheaper than continuing |
| **D** | **A hard cap enforced by the host** | Strongest bound. It depends on claim 20, works on one host at most, and cuts the worker off mid-edit with no report |

## 11. Recommended Approach

**Option C**, as a single Standard spec. B alone leaves the largest cost untouched, and D alone loses the worker's state. If claim 20 holds, a host cap is added in design as a backstop behind the checkpoint, never in place of it.

**Why a respawn is cheaper.** A worker at 200k tokens pays about 200k per turn. A fresh worker pays about 55k, plus what it must re-read. If the re-read costs 20k, the respawn pays for itself within a few turns. The checkpoint report exists to keep that re-read small.

**Numbers the user sets at approval.** They are fixed here so they cannot be tuned after the next measurement.

| Term | Proposed default | Basis |
|---|---|---|
| Loop bound | **3** consecutive verification cycles with the same failure → checkpoint or `FATAL_FAIL` | Median is 4 test runs per spawn, p90 is 14 |
| Checkpoint trigger | The loop bound, or the worker's own count reaching **60** tool calls, whichever comes first | Spawns over 60 turns are 35% of spawns and hold 77% of the cost |
| Checkpoints per task | **2**, then the task is escalated to the user as `[~]` | Same shape as the existing limit of 2 continuations |
| Command output | At most **100** lines into context per command; the full output goes to a file the worker can search | Bash is 52% of tool results |
| Large file | Over **400** lines, read by range | 294 reads over 20,000 characters |

**Success targets**, measured by re-running `measure/` on the next 30 Implementer spawns after adoption:

| Measure | Baseline | Target |
|---|---|---|
| Spawns over 100 turns | 14% | under 3% |
| Median peak context | 188k to 207k by group | under 120k |
| Whole reads of `tasks.md`, `requirements.md`, `design.md` | 45% (99 of 219) | under 10% |

## 12. Risks, Dependencies, And Open Questions

| Risk | Mitigation |
|---|---|
| **A checkpoint loses what the worker knew**, and the respawn repeats the dead end | The report shape carries what was tried and why it failed, as the existing *Attempt History* does for rework |
| **Workers checkpoint too early** to escape hard work | The trigger is a count, never a feeling. A checkpoint before the trigger is a premature stop under *Don't stop short* |
| **The worker cannot count** (claim 21) | The loop bound counts verification cycles, which the worker runs itself. Design settles whether the tool-call count is usable |
| **Truncated output hides the failing line** | The rule keeps the failing part and sends the rest to a file. A summary with no failure text is not allowed |
| **Bounded reads make a worker miss context** and Reviewer FAILs rise | Recorded as a measure for the next two Kaizen retrospectives. The pointer-brief rule already requires verbatim reads of the pointed sections |
| **KZ-changes--leader-brief-contract-1**: a rule inserted beside *Don't stop short* and *Self-Correction Inner Loop* is contradicted by the surviving sentence | Both paragraphs are rewritten whole and read whole before review |
| **KZ-changes--premise-ledger-1**: the Leader's rule is keyed to the worker's report status | Specify lists every status a report can carry, the new one included, and gives each an action |
| **KZ-changes--scoped-constitution-reads-2**: a spec that edits text other agents execute needs two review rounds per task | Budgeted that way at Step 2.4 |
| **Persona growth costs tokens on every spawn** | A byte cap per persona, as `scoped-constitution-reads` NFR-1 set |
| The evidence comes from two projects on one machine | Stated in §3. The targets are re-measured the same way, so the comparison holds |

**Open questions**

| # | Question | Where it is settled |
|---|---|---|
| OQ-1 | The numbers in §11 | The user, at this approval |
| OQ-2 | Whether a host can cap turns (claim 20), and whether to use it as a backstop | `/akili-specify` design |
| OQ-3 | What the worker can count (claim 21) | `/akili-specify` design |
| OQ-4 | Whether the Tester gets the checkpoint exit too. The sample has 2 Tester spawns | The user, at this approval. Recommended: **no**; output discipline and bounded reads only |
| OQ-5 | Whether this spec runs before or after `changes/review-intensity-trial-terms`, which is paused at its Phase 1 gate | The user, at this approval. Recommended: **this one first** |
| OQ-6 | Whether a Claude Code worker receives the root guides from the host and then reads them again. `CLAUDE.md` was read 58 times by Implementers | `/akili-specify` design. If true, it is a follow-up and not part of this spec |

## 13. Success Criteria

1. An Implementer whose verification fails three times the same way ends its run with a checkpoint or a `FATAL_FAIL`, walked as a literal agent would against the shipped text.
2. Every status an Implementer report can carry has a stated Leader action, and a checkpoint consumes no rework attempt.
3. A third checkpoint on one task escalates to the user.
4. A worker following the shipped text cannot put a whole test log or a whole `tasks.md` into its context, shown on a held-out case.
5. Each task entry written after this change states the spawn's size.
6. The three targets in §11 are measured on the next 30 Implementer spawns and reported, met or not.

## 14. Next Step

```text
/akili-specify changes/subagent-context-budget
```
