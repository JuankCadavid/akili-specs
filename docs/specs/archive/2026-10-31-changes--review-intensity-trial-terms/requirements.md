# Requirements: Make the Review-Intensity Trial Able to Reach a Verdict

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/review-intensity-trial-terms` |
| Depth | **Standard**. To be re-checked against the design at Step 2.4 |
| Type | Change |
| Approval Mode | `gated`, inherited from `proposal.md` |
| Status | **Draft** — awaiting the user at the Phase 1 gate |
| Date | 2026-09-29 |
| Source | `proposal.md` (approved by the user 2026-09-29, Option B, §11 numbers at their defaults) |
| Format precedent | `docs/specs/archive/2026-09-29-changes--scoped-constitution-reads/requirements.md`. This repo has no `docs/specs/general-setup/`, `docs/prd.md`, `docs/trd/` or `docs/ux-ui/` (`ls docs` run 2026-09-29 at `c94e6b6`) |
| Adjacent specs | None active. `changes/scoped-constitution-reads` was archived at `e56c631`, so the proposal's sequencing constraint on `akili-execute.md` is met |
| Citations | Run at `c94e6b6` unless a row says otherwise. `A/` stands for `docs/specs/archive/` |

## 2. Executive Summary

The conditional Reviewer shipped as a trial of three specs. **Those three specs have now closed with zero skips**, so the trial has reached its extent with nothing to judge. This spec replaces the trial's terms so it ends on evidence: it counts skipped tasks, it has a stop rule, it has one record of its state, and the rate it promised is collected. It also closes three gaps in what may skip.

**Proposal alignment:** aligned with the approved proposal (Option B). Exploration found four things the proposal did not have. Each needs the user's decision at this gate (§9).

| # | Finding | Effect on the proposal |
|---|---|---|
| 1 | The third trial spec has closed. `changes/scoped-constitution-reads` carried four tasks, all `full`, and no `REVIEW_SKIPPED` record | Proposal claim 11 is settled: **confirmed**. Under the shipped terms the trial is due for review now. Three specs are already counted toward the stop rule |
| 2 | `execution.md` has no mandated field for falsifier execution. The label "Executed falsifier" appears 1, 0 and 13 times in the three trial specs | The rate cannot be read from `execution.md` as the proposal assumed. **Scope grows by one item**: the task entry records it (FR-4) |
| 3 | `docs/` is packaged, except `docs/specs/` | The proposal's OQ-2 offered "a file under `docs/`" as the unpackaged choice. It is not unpackaged. The record's location is constrained (FR-3) |
| 4 | The sentence the proposal removes sits in the released `[2.27.0]` section of `CHANGELOG.md` | Removing it edits a released entry. The alternative is to annotate it (OQ-6) |

## 3. Glossary

| Term | Meaning here |
|---|---|
| **Trial** | The measured trial of the conditional Reviewer that FR-9 of `changes/review-intensity-routing` required |
| **Skip** | A task closed under a `## REVIEW_SKIPPED` record in `execution.md` |
| **Predicate** | The four conditions of the *Review intensity* block, `/akili-execute` Step 2.3 |
| **Claim** | A task's `Review` field reading `skip-eligible` |
| **Trial spec** | A spec whose `tasks.md` carries the `Review` field and that has been archived |
| **Extent** | The number of skips after which the trial is reviewed: **10** |
| **Stop rule** | The number of trial specs after which the trial expires if the extent is not reached: **6** |
| **Escaped defect** | As the `kaizen` Measure table defines it: a defect found after a task closed, in a task carrying a `REVIEW_SKIPPED` record |
| **Falsifier execution rate** | Tasks whose falsifier was executed and observed red, over tasks that declared a falsifier |
| **Canonical absent value** | For `Consumers`: `none`, or `none (no shared symbol changed)`, with nothing after it |
| **Qualifier** | Any text following the canonical absent value in a `Consumers` cell |
| **Measured / self-reported** | A trial spec archived in this repository / one whose numbers a maintainer brings from another project |

## 4. System Context & Scope

**Current behavior:**

| # | Claim | Evidence |
|---|---|---|
| 1 | The trial's extent is three complete specs, and one escaped defect against a skipped task reverts the change | `A/2026-09-29-changes--review-intensity-routing/requirements.md`, FR-9 terms table |
| 2 | Three specs carrying the `Review` field have closed: 10 tasks, 0 skips | `grep -c '\| Review \|' <tasks.md>` and `grep -c '^## REVIEW_SKIPPED' <execution.md>` on `A/2026-09-20-changes--agents-md-canonical` → 2 / 0; `A/2026-09-29-changes--opus-5-5-rebaseline` → 4 / 0; `A/2026-09-29-changes--scoped-constitution-reads` → 4 / 0 |
| 3 | The skip is evaluated against the report and never against the `Review` field, so a task planned `checklist` or `full` may skip | `.claude/commands/akili-execute.md`, *Review intensity*, opening sentence |
| 4 | The field's presence already gates the block without being used as its value | Same block, *Applicability* bullet |
| 5 | Condition 3 reads "The task's `Consumers` field reads `none`" and names no other value | Same block, condition 3 |
| 6 | The documented absent value for `Consumers` is `none (no shared symbol changed)` | `.claude/commands/akili-constitution.md`, Step 7 item 3 |
| 7 | In archived specs the canonical value is often followed by a qualifier, and a negative is sometimes written in other words | `grep -h '\| Consumers \|' docs/specs/archive/*/tasks.md \| sort \| uniq -c` → 7 rows with the bare value, 9 rows with the value plus a qualifier, 3 rows opening "No test file pins…" |
| 8 | The task entry of `execution.md` mandates ten items. None names the falsifier | `.claude/commands/akili-execute.md`, *Execution Log Format*, "Each task entry must record" |
| 9 | Only the `REVIEW_SKIPPED` record mandates the executed falsifier, so a task that gets a Reviewer has no mandated place for it | Same section, `REVIEW_SKIPPED` table, row *predicate evidence* |
| 10 | The `kaizen` Measure table has a skipped-task row and an escaped-defect row, and no rate row | `.claude/skills/kaizen/SKILL.md`, *Measure* table |
| 11 | The one Kaizen entry that mentions the rate reports it as not collected | `docs/specs/kaizen/changes--review-intensity-routing.md:28` |
| 12 | `/akili-specify` mentions `skip-eligible` at three sites. None compares it with another field | `grep -n "skip-eligible" .claude/commands/akili-specify.md` → the field definition, the Step 3.3 list, one checklist item |
| 13 | The npm package ships `docs/` and excludes `docs/specs/` | `package.json` `files`: `"docs"`, `"!docs/specs"` |
| 14 | The three-spec sentence sits in a released section | `CHANGELOG.md:40`, under `## [2.27.0] - 2026-09-20` |
| 15 | No packaged surface names the trial apart from that line | `grep -n -i "trial" docs/model-routing.md docs/skills/kaizen.md README.md AGENTS.md` → 2 hits, both about the frontier-escalation trial |
| 16 | Deterministic code tasks in downstream projects will clear the predicate where this repository's tasks cannot | `UNVERIFIED — confirm at source before relying on it`. Measured yield so far is 0 of 12 held-out records. No downstream spec has been written with the `Review` field that this repository can read |

**In scope:** `.claude/commands/akili-execute.md` (the *Review intensity* block and the task entry list), `.claude/commands/akili-specify.md` (Step 3.2), `.claude/skills/kaizen/SKILL.md` (Measure table and report template), `.claude/commands/akili-archive.md` (Step 4.1 signal list), the `docs/commands/` and `docs/skills/` mirrors of any edited sentence, `docs/model-routing.md` where a sentence turns false, `CHANGELOG.md`, and the trial record.

**Out of scope:** the meaning of conditions 1, 2 and 4; the seven overrides; the evidence re-run; the abort criterion; the personas under `.claude/templates/`; `bin/`, `scripts/`, `package.json`; any new command; telemetry from other projects; the archived spec's own files.

## 5. Stakeholders / Personas

| Persona | Stake |
|---|---|
| The maintainer (user) | Decides the trial's verdict, and needs the numbers in one place to do it |
| Leader running `/akili-execute` | Applies a narrower skip rule and records one more item per task |
| Spec author at `/akili-specify` | Gets a contradictory claim rejected before the approval gate |
| Maintainer of a downstream project | Sees fewer skips after upgrading. May bring numbers to the trial |

## 6. Functional Requirements

### FR-1: The trial's extent is counted in skips

The trial SHALL run until one of three endings is reached. The numbers are fixed at the proposal's approval and SHALL NOT be changed after the first skip is counted.

| Ending | Trigger | Verdict recorded |
|---|---|---|
| Extent reached | The **10th** skip is counted with no escaped defect against any skip | `confirmed` |
| Abort | **One** escaped defect against a skipped task | `aborted` |
| Expiry | The **6th** trial spec closes with fewer than 10 skips counted | `expired` |

- A trial spec SHALL count whether it was measured or self-reported.
- The three specs closed before this change SHALL count toward the stop rule (§4 claim 2).
- The abort trigger SHALL take precedence over the other two when more than one fires on the same spec.
- A verdict SHALL NOT edit any packaged file. `aborted` and `expired` each route to `/akili-propose`; on `expired` the user chooses between a revert and one extension.

#### Scenario: The trial expires with no skip

- GIVEN five trial specs counted and zero skips
- WHEN a sixth trial spec is archived with no `REVIEW_SKIPPED` record
- THEN the trial record states the verdict `expired` and the date
- AND the user is asked to choose between a revert and one extension
- BUT it must NOT be recorded as `confirmed`

#### Scenario: An escaped defect arrives with the tenth skip

- GIVEN nine skips counted
- WHEN a trial spec is archived with one further skip and one escaped defect against a skipped task
- THEN the verdict is `aborted`
- BUT it must NOT be recorded as `confirmed` on the grounds that the extent was reached

### FR-2: Only a claimed task may skip

A task SHALL be eligible to close under `REVIEW_SKIPPED` only when its `Review` field reads `skip-eligible` **and** the predicate holds with no override.

- The claim SHALL act as a gate on eligibility, in the way the *Applicability* bullet already gates on the field's presence.
- The predicate SHALL still be evaluated against the Implementer's report, never against the plan.
- A task whose `Review` field reads `checklist`, `full` or `lenses`, or is absent, SHALL receive a conformance Reviewer whatever its report shows.
- That case is not a mismatch and SHALL NOT be reported as one at the continue gate. The existing "claim not earned" report is unchanged.

#### Scenario: A `checklist` task whose report clears every condition

- GIVEN a task whose `Review` field reads `checklist`
- AND a report in which conditions 1 to 3 hold and no override applies
- WHEN the Leader reaches Step 2.3
- THEN a conformance Reviewer is spawned
- BUT it must NOT close under `REVIEW_SKIPPED`
- AND IT MUST NOT be reported as a plan-and-report mismatch

#### Scenario: A claimed task that earns its claim

- GIVEN a task whose `Review` field reads `skip-eligible`
- AND a report in which all four conditions hold
- WHEN the Leader reaches Step 2.3
- THEN the task closes under `REVIEW_SKIPPED`, as today

### FR-3: The trial has one record

One file SHALL hold the trial's state. It SHALL contain:

| Part | Content |
|---|---|
| Terms | Extent, stop rule, abort criterion, the date they were approved, and a reference to the FR-9 terms they supersede |
| Counted specs | One row per trial spec: spec path, archive date, source (`measured` or `self-reported`), tasks, tasks claimed `skip-eligible`, skips, escaped defects, falsifier execution rate |
| Totals | Trial specs counted against the stop rule; skips counted against the extent. Measured and self-reported totals shown separately and then summed |
| Verdict | `open`, `confirmed`, `aborted` or `expired`, with the date and the spec that triggered it |

- The record SHALL be seeded with the three specs already closed.
- The record SHALL NOT be part of the npm package.
- The record SHALL NOT be read as a spec by any command's spec scan.
- The record SHALL be updated only on the apply-capable branch, as any shared file is.
- The obligation to update it SHALL be delivered by a surface that is read when a spec is archived **in this repository** and that is not packaged. No packaged command SHALL name the record.
- A self-reported row SHALL name who brought it and the date.

#### Scenario: A reader asks where the trial stands

- GIVEN the record after four trial specs
- WHEN a reader opens it
- THEN they find the terms, four rows, both totals and the verdict `open` without opening any other file

#### Scenario: A downstream number is brought in

- GIVEN a maintainer reports a downstream spec with three skips
- WHEN the row is added
- THEN its source reads `self-reported`
- BUT its skips must NOT be added into the measured total

### FR-4: The falsifier execution rate is collected

- Each task entry in `execution.md` SHALL record, for the closing attempt, whether the task's falsifier was executed and what the gate read. One of three values: executed and red, executed and not red, not executed.
- The `kaizen` Measure table SHALL gain one row for the rate, sourced from those entries, and the report template SHALL gain the matching row.
- The rate SHALL be reported as a numerator and a denominator, never as a percentage alone.
- **Denominator:** tasks whose `Falsifier` field is not `n/a`. **Numerator:** those of them whose closing attempt records executed and red. The count of `n/a` tasks SHALL be reported beside the rate.
- A task whose entry does not record the item SHALL count as not executed. It SHALL NOT be inferred from other text in the entry.
- The "before" rate SHALL be stated as **not available**. It SHALL NOT be reconstructed from the 12 held-out records (KZ-changes--leader-brief-contract-2).
- `/akili-archive` Step 4.1 SHALL name the new signal.
- The clean-run predicate SHALL be unchanged: a rate below 1 does not by itself make a run unclean.

#### Scenario: A spec with one `n/a` falsifier and one unrecorded entry

- GIVEN a spec of five tasks, one with `Falsifier` `n/a`
- AND three entries recording executed and red, and one entry silent on the falsifier
- WHEN the retrospective runs
- THEN the rate reads 3 of 4, with 1 task `n/a`
- BUT the silent entry must NOT be counted as executed

### FR-5: A contradictory claim is caught at `/akili-specify`

`/akili-specify` Step 3.2 SHALL check every task that claims `skip-eligible` before the Step 3.3 list is presented.

| The task claims `skip-eligible` and… | Result |
|---|---|
| its `Disqualifier` names a read or a judgment | The claim is contradictory |
| its `Consumers` is not the canonical absent value | The claim is contradictory |
| its `Falsifier` is `n/a` | The claim is contradictory |

- A contradictory claim SHALL be resolved before the gate: the `Review` value is lowered to a reviewing value, or the contradicting field is corrected if it was wrong.
- A task with an unresolved contradiction SHALL NOT appear in the Step 3.3 skip list.
- The check SHALL read the fields as written. It SHALL NOT decide whether the task is simple.

#### Scenario: `skip-eligible` beside a `Disqualifier` that names a read

- GIVEN a task whose `Review` reads `skip-eligible`
- AND whose `Disqualifier` reads "Read the block whole: if …"
- WHEN Step 3.2 completes
- THEN the contradiction is reported and resolved
- BUT the task must NOT reach the Step 3.3 list as `skip-eligible`

### FR-6: Condition 3 has an action for every `Consumers` value

| State | The `Consumers` cell holds | Condition 3 |
|---|---|---|
| C1 | The canonical absent value and nothing else | Met |
| C2 | The canonical absent value followed by a qualifier | Not met |
| C3 | One or more named consumers | Not met |
| C4 | A negative stated in other words, such as "No test file pins…" | Not met |
| C5 | Nothing: a blank cell | Not met, and the blank is reported at the continue gate as a defect of the task |
| C6 | No `Consumers` field at all, in a `tasks.md` that carries the `Review` field | Not met |
| Fall-through | Anything else | Not met |

- "Not met" SHALL mean a conformance Reviewer runs. It is never an error and never blocks the task.
- The Leader SHALL NOT read a qualifier and decide it is harmless. A qualifier states that a reader exists or was considered, and weighing that is the judgment a Reviewer is for.

#### Scenario: `none` with a qualifier

- GIVEN a claimed task whose `Consumers` reads `none (no shared symbol changed) — the mirror is T8's`
- WHEN the Leader evaluates condition 3
- THEN condition 3 is not met and a Reviewer is spawned
- BUT the Leader must NOT treat the cell as `none` because it begins with `none`

#### Scenario: A blank cell

- GIVEN a claimed task whose `Consumers` cell is empty
- WHEN the Leader evaluates condition 3
- THEN a Reviewer is spawned
- AND the blank cell is reported at the continue gate

### FR-7: Older specs behave as today

- A `tasks.md` with no `Review` field SHALL execute exactly as today.
- An `execution.md` whose entries predate FR-4's item SHALL read as "not recorded". No command SHALL fail on it.
- No file under `A/2026-09-29-changes--review-intensity-routing/` SHALL be edited. Its FR-9 terms are superseded by reference from the trial record.

### FR-8: The change is documented

- `CHANGELOG.md` `Unreleased` SHALL carry the entry, state the new terms, state that the skip narrows, and state the proposed release classification.
- The v2.27.0 three-spec sentence SHALL be handled as the user decides at OQ-6.
- The `docs/commands/` and `docs/skills/` mirrors SHALL describe the change at summary level and contradict no command sentence.
- `docs/model-routing.md`, `docs/flow.md` and `README.md` SHALL change only where a sentence turns false, and the falsifying grep SHALL be run before "no change" is written (KZ-002).

#### Scenario: A downstream maintainer reads the release notes

- GIVEN a project on v2.27.0 that planned a `checklist` task expecting it might skip
- WHEN its maintainer reads the entry
- THEN they learn that only a task claiming `skip-eligible` may skip

## 7. Non-Functional Requirements

| ID | Requirement | Measure |
|---|---|---|
| NFR-1 | **Defined once.** The predicate, condition 3's states and the claim gate live in the *Review intensity* block. Every other surface cites the block by name | `grep` for a restated condition outside the block → 0 |
| NFR-2 | **Bounded.** Zero diff in `.claude/templates/`, `bin/`, `scripts/`, `package.json`, and the archived spec | `git diff --stat` against the starting commit |
| NFR-3 | **No rule is pointed at by line number** in shipped prose (KZ-005) | `grep` for `:<digits>` references in the added text → 0 |
| NFR-4 | **No project-specific assumption in a packaged command.** No packaged file names the trial record or its numbers | `grep` for the record's filename under `.claude/` and `docs/` outside `docs/specs/` → 0 |
| NFR-5 | **Tool-agnostic wording** in every added sentence | No host tool name in the added text |

## 8. Defect Classes and Gates

| Defect class this spec can produce | Gate that catches it |
|---|---|
| A `Consumers` state has no action, or lands in the wrong branch (KZ-004, KZ-changes--premise-ledger-1) | A literal walk of C1–C6 against the shipped block, plus one **held-out** cell the text does not cite |
| The claim gate contradicts the block's opening sentence, which survives beside it (KZ-changes--leader-brief-contract-1) | The *Review intensity* block is read whole after the edit |
| The specify-time check runs after the gate it guards (KZ-changes--review-intensity-routing-1) | The command text is read in order: the check precedes the Step 3.3 presentation |
| A predicate restatement elsewhere still says any clearing task may skip | Obligation-keyed grep over `.claude/` and `docs/` for the skip rule and its paraphrases, every hit read (KZ-changes--kaizen-loop-closure-2) |
| The record's seed numbers are wrong | Each seeded row is re-derived by the commands of §4 claim 2, run before the row is written |
| A requirement paragraph is dropped in shipping (KZ-changes--gate-falsifiability-2) | Each FR is walked term by term against the shipped text, tables and bullets included |
| A summary surface claims something that did not ship (KZ-002) | The CHANGELOG entry is checked clause by clause against the shipped text |
| The packaged files no longer install | `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` |

**No automated check exists for two classes. Both are accepted risks:**

| Class | Why no gate | Substitute |
|---|---|---|
| A real Leader, given the new text, still skips an unclaimed task | This repository has no harness that runs a Leader against a command | The literal walk, plus the next spec run in a project where a task can clear the predicate |
| The trial expires with no skip because no downstream number is ever brought | It depends on work outside this repository | The stop rule turns it into a dated decision. It is the expected outcome if §4 claim 16 is false |

## 9. Open Questions for This Gate

| # | Question | Recommendation |
|---|---|---|
| OQ-1 | **Stop rule arithmetic.** Three specs are already counted. Is the stop rule 6 in total, leaving 3, or 6 further from now? | **6 in total.** It is what was approved: "the two closed specs count toward the stop rule" |
| OQ-2 | Does this spec count as a trial spec when it is archived? | **Yes.** Its `tasks.md` will carry the `Review` field, and the approved default is "any spec with the field". That leaves 2 |
| OQ-3 | Accept the task entry item as added scope (FR-4, finding 2)? | **Yes.** Without it the Measure row has no source |
| OQ-4 | Accept "not met" for a qualified `none` (FR-6, C2)? | **Yes.** The alternative is a Leader judging the qualifier, which is the judgment the predicate forbids |
| OQ-5 | Accept the two extra rows in FR-5's table, `Consumers` and `Falsifier`? The proposal named only the `Disqualifier` | **Yes.** They are the same check on adjacent fields and cost one sentence |
| OQ-6 | The v2.27.0 sentence: remove it, or keep it and annotate it as superseded? | **Annotate.** A released entry is a record of what shipped. This changes proposal success criterion 6 to "no shipped sentence states the three-spec terms as current" |
| OQ-7 | Release classification | **Minor.** The skip narrows and a record item is added, both behavior. No migration is needed |

Settled from the proposal: its OQ-3 (denominator) and OQ-4 ("before" rate) are answered in FR-4. Its OQ-2 (record location) goes to `design.md`, constrained by FR-3 and finding 3.

## 10. Requirement ID Index

| ID | Title | Proposal delta |
|---|---|---|
| FR-1 | Extent counted in skips, with a stop rule | MODIFIED |
| FR-2 | Only a claimed task may skip | MODIFIED |
| FR-3 | One trial record | ADDED |
| FR-4 | Falsifier execution rate collected | ADDED, with the task entry item beyond the proposal |
| FR-5 | Contradictory claim caught at specify | ADDED, two rows beyond the proposal |
| FR-6 | Every `Consumers` value has an action | ADDED |
| FR-7 | Older specs behave as today | Non-goal, made testable |
| FR-8 | CHANGELOG and mirrors | Scope; REMOVED becomes annotate if OQ-6 is accepted |
| NFR-1…5 | Defined once, bounded, no line pointers, no project assumption, tool-agnostic | — |
