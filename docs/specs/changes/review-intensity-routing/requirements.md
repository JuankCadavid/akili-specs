# Requirements: Review Intensity and Model Routing by Proven Verification

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/review-intensity-routing` |
| Depth | **Standard** |
| Type | Change |
| Approval Mode | `gated` — inherited from `proposal.md` |
| Status | Draft — awaiting the Step 1.3 gate |
| Date | 2026-09-19 |
| Source | `proposal.md` revision 2 (commit `a909216`), Option B: skip gated on proven verification, plus an always-on evidence re-run |
| Why not Full depth | The depth table routes "risky" work to Full. The risk here is real but **concentrated in one decision** — the skip predicate — rather than spread across data, API, auth, or migration surfaces. Full's three distinguishing contents are pulled into Standard instead of adding document weight: rollout as FR-9's trial, observability as FR-9's escaped-defect metric, rollback as FR-9's abort criterion. Re-checked at Step 2.4 |
| Format precedent | `docs/specs/archive/2026-09-19-changes--leader-brief-contract/requirements.md`. This repo has **no** `docs/specs/general-setup/` (`ls docs/specs/general-setup/` → `No such file or directory`, run at `a909216`); `docs/prd.md`, `docs/ux-ui/design.md` and `docs/trd/trd.md` do not exist here either |
| Adjacent specs | `changes/scoped-constitution-reads` (proposal only) owns `.claude/templates/implementer.md` and `tester.md` — disjoint from this spec's files (NFR-7). Both add a `CHANGELOG.md` `Unreleased` entry: **merge serially** |
| Depends on | `changes/gate-falsifiability` (shipped, v2.25.0) — FR-1's predicate leans on its Falsifiability block |
| Validation corpus | Ten archived specs under `docs/specs/archive/` carry an `execution.md` with per-task records — **54** task records across `ai-agent-development-skill` (6), `goal-driven-execution` (1), `spec-family-ordering` (6), `audit-phase-tier-drift` (5), `branch-safe-kaizen` (6), `codex-install-target` (7), `model-routing-cost-rebaseline` (2), `gate-falsifiability` (6), `kaizen-loop-closure` (7), `leader-brief-contract` (8), plus `changes/premise-ledger` (10, unarchived). Re-counted at judgment round 1, finding S-2: the earlier figure said ~59 and overcounted the two newest specs. **Usable corpus is much smaller (finding S-4):** FR-1 reads the `Falsifier` / `Consumers` / `Disqualifier` fields, which `changes/gate-falsifiability` introduced on 2026-09-18, so eight of the ten archived specs carry **zero** `Consumers` fields. Only `gate-falsifiability` (6) and `leader-brief-contract` (8) can be run through the predicate as written — **14 held-out records**, plus `premise-ledger`'s 10, which are cited and therefore not held out. **Held-out discipline:** the shipped text may cite `premise-ledger` tasks only; every other spec's tasks are reserved for the closure walkthrough and must never be named in shipped text |

## 2. Executive Summary

Today a Reviewer runs after every Implementer, unconditionally, and the methodology says so in a sentence that forbids collapsing the gate. That is correct for work whose verification cannot prove itself, and pure cost for work whose verification can.

This spec makes the Reviewer conditional on **proof rather than on size**: a task may close without one only when it executed its own `Falsifier` and watched the gate go red, its verification is fully deterministic, it changes nothing others consume, and no override applies. Because the skip must be *earned* by running a falsification that **six of ten tasks skip today** (four of ten execute it), the change raises the verification floor while lowering audit cost.

One duty is added and never waived: the task's evidence is re-run by a context other than its author. That preserves the property that actually catches the dangerous failure — an author reporting green on something red — at near-zero cost, and leaves only the judgment audit conditional.

| Decision carried from the proposal | Pinned here |
|---|---|
| What gates the skip? | An **executed falsifier**, not a size or a category (FR-1) |
| What is never skipped? | The **evidence re-run** by a non-author (FR-3) |
| Same model on both sides for cheap tasks? | **No.** Either a different model reviews, or nobody does (FR-7) |
| Where does the speed come from? | Implementer right-sizing and effort banding (FR-6, FR-7), not mainly from skipping |

## 3. Glossary

| Term | Meaning |
|---|---|
| **Conformance Reviewer** | The independent audit of a diff against the spec — the role `/akili-execute` Step 2.3 spawns today. What this spec makes conditional |
| **Evidence re-run** | Mechanical re-execution of a task's verification commands by a context other than the author, comparing outputs to what the author reported. No judgment, no diff-versus-spec reading. Never conditional |
| **Verifier** | The agent that performs an evidence re-run when the Leader does not do it inline. A role, not a reviewer: it has no authority to judge conformance |
| **Executed falsifier** | The task's named `Falsifier` actually run against the post-change code, with the gate observed **red** — the requirement `/akili-specify` Step 3.2 Falsifiability rule 1 already states |
| **Fully deterministic verification** | Every check in the task's Verification is a command with a pass/fail result that a cold runner reproduces. A check requiring a human or model to *read* and judge is not deterministic |
| **Skip predicate** | The conjunction in FR-1 that decides whether a conformance Reviewer is owed |
| **Override** | A condition in FR-2 that forces a Reviewer no matter what the predicate says |
| **`REVIEW_SKIPPED`** | The record for a gate that was **never owed** because the predicate held |
| **`REVIEW_WAIVED`** | The existing record for a gate that was **owed and lost** (`/akili-execute` Execution Log Format). The two are never merged |
| **Escaped defect** | A defect found after a task closed — at `/akili-test`, `/akili-validate`, a later task, the closure gate, or HITL — in a task that skipped its conformance review |
| **Depth band** | How deep a review goes when one runs: `checklist`, `full`, or `lenses` |

## 4. System Context & Scope

**What exists today.** Each claim carries a citation as run or the `UNVERIFIED — confirm at source before relying on it` marker, per `/akili-specify` Step 2.2's *Premise Ledger* block. All readings taken at `a909216` from the repository root.

- The Reviewer is unconditional: `.claude/templates/leader.md:82` — *"The Reviewer is not self-verification — never collapse it… That independence is the methodology's core correctness guarantee and is not an efficiency cost to optimize away."*
- No rule permits closing without a Reviewer verdict: `/usr/bin/grep -rn -i "skip the reviewer\|without a reviewer\|no reviewer\|reviewer optional\|omit the reviewer" .claude/commands .claude/templates` → **1 hit**, `akili-execute.md:320`, which is the `REVIEW_WAIVED` record, the opposite of a permission.
- Closure is hard-gated: `akili-execute.md:330` — *"A task with neither a `PASS` nor a `REVIEW_WAIVED` record in `execution.md` is not closable."*
- Depth already bands, existence does not: `reviewer.md:43–45` (`< 50 LOC` checklist · `50–200` full four-lens · `> 200` parallel lenses).
- The unattended-run condition names only two accepted states: `akili-execute.md:283` — *"`[x]` with matching PASS or `REVIEW_WAIVED` evidence"*.
- The registry already prescribes a cheap Implementer: `docs/model-routing.md` model registry — T2 Coder → `sonnet`, T3 Auditor → `opus` *(must differ from T2)*.
- Falsifiers are required but under-executed: `/usr/bin/grep -c -i "falsifier.*execut\|execut.*falsifier" docs/specs/changes/premise-ledger/execution.md` → **6** hits, which map to **four of ten tasks** (T1 ×2, T2, T4, T7 ×2) when each hit is traced to its enclosing task header. Corrected at judgment round 1, finding S-1: the earlier reading said five.

**In scope:**

| Surface | Sections | Requirement |
|---|---|---|
| `.claude/commands/akili-execute.md` | Step 2.2 (evidence re-run), Step 2.3 (conditional spawn), Step 2.4 (guardrails), Step 3 (closure), Step 5 (`/goal` condition), Execution Log Format | FR-1..FR-4, FR-8 |
| `.claude/templates/leader.md` | The *never collapse it* paragraph; Delegation Thresholds; model/effort recording | FR-1, FR-6..FR-8 |
| `.claude/templates/reviewer.md` | Depth bands and their effort binding | FR-6 |
| `.claude/commands/akili-specify.md` | Step 3.2 task fields; Step 3.3 presentation list; Verification Checklist | FR-5 |
| `.claude/commands/akili-constitution.md` | Step 7 item 3 template description | FR-5 |
| `docs/model-routing.md` | Review intensity as a third dimension; the Verifier at T5 | FR-7 |
| `.claude/commands/akili-resume.md` | The closed-task reporting line that names `REVIEW_WAIVED` blocks | FR-4 |
| `.claude/skills/kaizen/SKILL.md` | Measure table (a skipped-task row and an escaped-defect row) and the **clean-run predicate** | FR-9 |
| Mirrors and release notes | `docs/commands/akili-execute.md`, `akili-specify.md`, `akili-constitution.md`, `akili-resume.md`; `docs/skills/kaizen.md`; other `docs/skills/*` only where a sentence turns false; `CHANGELOG.md` `Unreleased` | FR-11 |

**Added at Phase 2 by the mandated consumer walk (KZ-changes--kaizen-loop-closure-1).** The two rows above were **not** in the scope approved at the Step 1.3 gate. Adding `REVIEW_SKIPPED` adds a value to the closure-state enumeration, and the walk found two existing consumers that read that set: `akili-resume.md:48` interprets `REVIEW_WAIVED` blocks as a closed task's last action, and `kaizen/SKILL.md:74`'s clean-run predicate decides whether a retrospective runs at all. `akili-archive.md:151` **holds** — it cites the skill's Measure table rather than restating it.

**Out of scope (non-goals):**

- **No edit to `implementer.md` or `tester.md`** — owned by `changes/scoped-constitution-reads` (NFR-7).
- **No weakening of `author ≠ auditor`.** Where a review runs, the models differ.
- **No change to `REVIEW_WAIVED`'s meaning, flags, or fields.**
- **No change** to the 3-attempt ceiling, the Pivot Protocol, the budget tripwire, or `/akili-test`.
- **No automatic skipping without a record.**
- **No tooling** — no script, hook, or CI check computes the predicate.

**Grep hazard (binding on every verification):** exclude `.claude/worktrees/`, `docs/specs/archive/`, and this spec's own folder, which quotes superseded phrasing verbatim. Every recursive grep carries `--exclude-dir=worktrees`.

## 5. Stakeholders / Personas

| Stakeholder | Interest |
|---|---|
| Leader in `/akili-execute` | A rule that says when a Reviewer is owed, instead of a reflex and a guilty conscience |
| Implementer | Unchanged obligations; its verification now decides whether an audit follows, which raises the value of running the falsifier |
| Reviewer | Fewer, better-targeted spawns; depth and effort bound to the diff instead of always `high` |
| User at the `tasks.md` gate | Sees which tasks intend to skip review **before** execution starts |
| Kaizen retrospective | Countable `REVIEW_SKIPPED` records and escaped defects, so the next revision argues from data |
| Consuming projects | Specs written before this change behave exactly as today |

## 6. Functional Requirements

### FR-1: The skip predicate

A task MAY close without a conformance Reviewer **only when all four conditions hold**, evaluated by the Leader against the Implementer's actual report, never against the plan:

| # | Condition |
|---|---|
| 1 | The task's `Falsifier` was **executed against the post-change code and the gate observed red**, and the report records the command and its red output |
| 2 | Every check in the task's Verification is **fully deterministic** — a command with a pass/fail result; the task's `Disqualifier` names no read or judgment |
| 3 | The task's `Consumers` field reads `none` |
| 4 | No override in FR-2 applies |

- The predicate SHALL be defined in **one place** and cited by name everywhere else (NFR-2).
- A task whose `Review` field says `skip-eligible` but whose report fails any condition SHALL receive a normal conformance review; the field is a **claim to be proved**, never a guarantee.
- The Leader SHALL NOT substitute its own judgment that a task "looks simple" for any condition.
- When a task's `skip-eligible` claim is **not earned**, the mismatch between plan and report SHALL be reported at the task's continue gate **even under `pre-approved` mode**, because FR-9's trial depends on the mismatch rate (DD-12).

#### Scenario: A one-line pointer edit that proved its gate

- GIVEN a task that adds a clause citing a rule defined elsewhere, whose verification is three greps, whose `Consumers` reads `none`
- AND the Implementer ran the named falsifier and recorded the gate going red
- WHEN the Leader evaluates the predicate
- THEN no conformance Reviewer is spawned and a `REVIEW_SKIPPED` record is written
- AND IT MUST still record the evidence re-run required by FR-3
- BUT it must NOT skip when the falsifier was merely *named* in the task and never executed

#### Scenario: A one-line edit to a rule others execute

- GIVEN a task that changes one line defining when a rule fires, which other steps consume
- WHEN the predicate is evaluated
- THEN condition 4 fails through FR-2's obligation override and a Reviewer is spawned
- AND IT MUST be spawned even when the task's verification is fully deterministic and its falsifier was executed
- BUT it must NOT be exempted because the diff is one line

#### Scenario: Plan says skip, report does not earn it

- GIVEN a task whose `Review` field reads `skip-eligible`
- WHEN the Implementer reports without an executed falsifier
- THEN the Leader spawns a conformance Reviewer and records that the predicted skip was not earned
- AND the mismatch is surfaced at the task's continue gate
- BUT it must NOT be recorded as a `REVIEW_SKIPPED`

### FR-2: Overrides that force a conformance Reviewer

A Reviewer SHALL be spawned, whatever the predicate says, when **any** of these holds:

| # | Override |
|---|---|
| a | The task defines or edits an obligation other readers execute |
| b | The task touches a closed enumeration, a shared contract, an exported symbol, a selector or DOM hook, an emitted event, a response shape, or a stored field |
| c | The task produces **derived evidence** a later gate consumes — counts, aggregated claims, a walkthrough, a report |
| d | The task reverts behavior already delivered |
| e | The task is a **rework attempt** following any FAIL |
| f | The task touches a security, authentication, or data-loss surface |
| g | The Leader judges a review warranted — always permitted, and never requiring justification |

- Overrides SHALL be evaluated against **what the task does**, not against how its verification is phrased.
- The override list SHALL be stated where the predicate is stated, so no reader meets one without the other.

#### Scenario: Derived evidence is never skippable

- GIVEN a task whose deliverable is a table of counts assembled from other workers' reports
- WHEN its verification is fully deterministic and its falsifier was executed
- THEN override (c) fires and a Reviewer is spawned
- BUT it must NOT be skipped on the strength of the deterministic verification

### FR-3: The evidence re-run — always, by a non-author

For **every** task, whether or not a conformance Reviewer runs, the task's verification SHALL be re-executed by a context other than the one that authored the change, and the outputs compared against what the author reported.

- The re-run SHALL be **mechanical**: re-execute the commands and compare. It is not an audit of the diff against the spec, and it carries no authority to judge conformance.
- Two execution modes, both acceptable: **Leader-inline**, which the *Delegation Thresholds* already class as inline work, or a spawned **Verifier** when the command set is large enough to cross the inline threshold.
- The result SHALL be recorded per task as `VERIFIED` or `MISMATCH`, naming the command and both outputs on a mismatch.
- A `MISMATCH` SHALL be treated as an **implicit FAIL**, consuming a rework attempt exactly as an Implementer-reported verification failure does today.
- The re-run SHALL NOT be waived by any category, predicate, mode, or approval setting.

#### Scenario: Author reports green on a red check

- GIVEN an Implementer that reports a passing verification
- WHEN the non-author re-run produces a different result for one command
- THEN the task does not close, the mismatch is recorded with both outputs, and a rework attempt is consumed
- AND IT MUST record the mismatch even when the conformance Reviewer was skipped
- BUT it must NOT be resolved by re-running until the author's result reappears

#### Scenario: Skipped review still re-runs evidence

- GIVEN a task that cleared the skip predicate
- WHEN it closes
- THEN its `REVIEW_SKIPPED` record carries the evidence re-run result
- BUT it must NOT close with the re-run absent or unrecorded

### FR-4: `REVIEW_SKIPPED`, distinct from `REVIEW_WAIVED`

A task closing without a conformance Reviewer SHALL carry a `REVIEW_SKIPPED` record written **before** the task is marked `[x]`, containing:

| Field | Content |
|---|---|
| predicate evidence | the executed falsifier's command and red output; the deterministic-verification basis; the `Consumers` value |
| overrides checked | that each FR-2 override was evaluated and none applied |
| evidence re-run | mode (inline or Verifier), result, and who performed it |
| models | the Implementer's model |

- The closure rule SHALL accept exactly three states: a Reviewer `PASS`, a `REVIEW_WAIVED` record, or a `REVIEW_SKIPPED` record. A task with none SHALL remain not closable.
- `REVIEW_SKIPPED` and `REVIEW_WAIVED` SHALL remain **separately countable**: a skip is a gate never owed, a waiver is a gate owed and lost. No document, report, or metric SHALL present them as one state.
- The `/goal` unattended-run condition SHALL accept the third state.
- `/akili-resume` SHALL report a `REVIEW_SKIPPED` block as a **closed** task's last action with its predicate basis, exactly as it reports a waiver, and never as a *Blocked* item.

#### Scenario: A reader distinguishes the two records

- GIVEN an `execution.md` containing both a `REVIEW_SKIPPED` and a `REVIEW_WAIVED` record
- WHEN a reader asks how many gates were lost
- THEN only the waiver counts
- BUT it must NOT be possible to answer by counting "tasks without a Reviewer PASS"

### FR-5: The `Review` field in `tasks.md`

`/akili-specify` Step 3.2 SHALL give every task a `Review` field with one of `skip-eligible`, `checklist`, `full`, `lenses`, plus a one-line reason.

- `skip-eligible` SHALL be documented as a **claim the task must prove at execute time** through FR-1, never as an instruction to skip.
- The absent-value rule: a task without the field SHALL be treated as `checklist`, which is today's behavior — no spec written before this change loses its review.
- The set of `skip-eligible` tasks SHALL be made **visible at the Step 3.3 approval gate**, so the user sees the intended skip list before execution starts. Two sites carry this, and both are required: **Step 3.3's presentation list SHALL name each `skip-eligible` task with its reason**, and the Verification Checklist SHALL gain a matching item. *(Amended during execution, 2026-09-19: the checklist alone cannot deliver the scenario below, because the Verification Checklist runs **after** the Step 3.3 gate — `akili-specify.md` Step 3.3 option 1 reads "Proceed to the final Verification Checklist". A post-gate item can only detect afterwards that the user was never shown the list. The obligation is unchanged; only the mechanism is corrected, following the precedent Step 2.5 already sets for the Premise Ledger.)*

#### Scenario: The user sees the skip list before execution

- GIVEN a `tasks.md` in which two of nine tasks are `skip-eligible`
- WHEN Step 3.3 presents the plan
- THEN both tasks are named with their reasons
- AND the user can reject the classification at that gate
- BUT it must NOT be presented only inside the document

### FR-6: Depth and effort are bound to the work

When a conformance Reviewer runs, its depth SHALL be chosen by the task's category and diff size, and its **effort SHALL be bound to that band**.

| Category | Typical marker | Depth | Effort ceiling |
|---|---|---|---|
| trivial | cites an obligation defined elsewhere | `checklist` | `low` |
| simple | local authored text, no shared contract | `checklist` | `medium` |
| standard | authors a rule against a complete spec | `checklist` or `full` | `high` |
| complex | defines an obligation, edits an enumeration, or assembles derived evidence | `full` or `lenses` | `high` or above |

- Categories SHALL be **depth guidance only**; they SHALL NOT decide whether a review happens — FR-1 does.
- A diff under the existing `< 50 LOC` band SHALL NOT draw an effort above `medium` unless an FR-2 override applies.

#### Scenario: A one-line diff does not draw a maximal sweep

- GIVEN a reviewed task whose diff is one line and which trips no override
- WHEN the Leader spawns the Reviewer
- THEN the brief sets `checklist` depth at `low` or `medium` effort
- BUT it must NOT request a full four-lens sweep at `high` effort

### FR-7: Model routing

- The Implementer SHALL default to the registry's **T2**; any escalation above it SHALL be recorded with a one-line reason, in the same way skill deviations are recorded today.
- Where a conformance Reviewer runs, it SHALL run on a **different model** than the Implementer. Where no different model is available, the existing `REVIEW_WAIVED` flags apply unchanged.
- A **same-model** conformance Reviewer SHALL NOT be introduced as a cheap substitute for a skipped one.
- The evidence re-run (FR-3) MAY run on the cheapest tier, **T5**, because it exercises no judgment.

#### Scenario: Cheap tasks do not get a same-model reviewer

- GIVEN a task the Leader considers cheap
- WHEN it does not clear the skip predicate
- THEN a Reviewer runs on a model different from the Implementer's
- BUT it must NOT run on the Implementer's own model as a compromise

### FR-8: Leader authority — raise freely, never lower below the predicate

- The Leader MAY raise review intensity at any time, without justification.
- The Leader MAY NOT lower intensity below what FR-1 and FR-2 require, and MAY NOT skip a review the predicate does not clear.
- `leader.md`'s *never collapse it* paragraph SHALL be amended so it continues to forbid collapsing the gate **for efficiency**, while permitting the predicate-cleared skip — the two are different acts and the amended text SHALL say so.

#### Scenario: Efficiency is still not a reason

- GIVEN a task that fails the predicate and trips no override
- WHEN the Leader is short of context or time
- THEN the Reviewer is spawned
- BUT it must NOT be skipped on the grounds that the Leader already verified the work

### FR-9: Trial, measurement, and abort criterion

Before this behavior becomes the default, it SHALL run as a **measured trial**, and the spec SHALL state:

- the trial's extent — a number of specs or tasks, fixed at approval;
- that every trial spec reports its **escaped defects** (§3) alongside its `REVIEW_SKIPPED` count;
- that the trial reports the **falsifier execution rate** before and after;
- an **abort criterion**: what escaped-defect result reverts the change, decided at approval rather than after the data arrives;
- that the closure gate evaluates the predicate against the **14 held-out task records** that carry the fields FR-1 reads, and states that limit rather than implying the full corpus (DD-11).

The `kaizen` Measure table SHALL gain a row for tasks closed under `REVIEW_SKIPPED` and a row for escaped defects, and its **clean-run predicate SHALL NOT classify a run as clean** when it contains a skipped task with an escaped defect — such a run is precisely the one whose retrospective must not be skipped.

#### Scenario: The trial produces a reportable negative

- GIVEN a trial spec in which a skipped task's defect is found later at `/akili-validate`
- WHEN the retrospective runs
- THEN the escaped defect is reported with the task's predicate evidence
- AND IT MUST be counted against the abort criterion
- BUT it must NOT be reclassified as an unrelated finding

### FR-10: Backward compatibility

- A `tasks.md` without a `Review` field SHALL execute exactly as today: a Reviewer for every task.
- An `execution.md` written before this change SHALL read as "no skip recorded", never as an inferred skip.
- No command SHALL fail on a spec that predates the field.

### FR-11: Documentation coherence sweep

- The mirrors SHALL describe the new behavior in their own register and contradict no command sentence.
- `README.md` and `docs/flow.md` SHALL change only where a sentence turns false, and the falsifying grep SHALL be run before "no change" is written (KZ-002).
- `CHANGELOG.md` `Unreleased` SHALL carry the entry and state the release classification.

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | **Bounded.** Zero diff in `.claude/templates/implementer.md`, `tester.md`, `.claude/skills/tdd/`, `bin/`, `scripts/`, `package.json`, and `/akili-specify`'s Falsifiability block |
| NFR-2 | **Defined once.** The predicate, the overrides, and the re-run duty live in one place; every other surface cites them by name |
| NFR-3 | **Records distinct.** `REVIEW_SKIPPED` and `REVIEW_WAIVED` are separately greppable and separately counted |
| NFR-4 | **Rules by mechanism.** Every rule is phrased by what the task does; corpus and product names appear only inside parentheticals |
| NFR-5 | **Backward compatible.** Specs and logs predating the change behave as today |
| NFR-6 | **The predicate is itself falsifiable.** Applied to the validation corpus, it must **not** qualify everything: for every historical task whose Reviewer returned a real FAIL, the predicate must say *review required*. A predicate that would have skipped such a task is refuted |
| NFR-7 | **Parallel safety.** No edit to `implementer.md` or `tester.md`; `CHANGELOG.md` merged serially with `changes/scoped-constitution-reads` |
| NFR-8 | **Host-neutral.** The evidence re-run is expressed as a duty with two modes, executable without any named tool or host feature |

## 8. Defect Classes → Gates

| Defect class this spec can produce | Gate that catches it | Falsifying input |
|---|---|---|
| The predicate reads as a permission — an agent skips without evaluating it | Literal-reader walkthrough over held-out corpus tasks | A reader that answers "skip" for a task with no executed falsifier |
| **A predicate nothing can fail** (the inert-gate class, applied to this spec's own rule) | Apply the predicate to the validation corpus; count qualifying tasks | Every corpus task qualifies |
| **A predicate that would have skipped a task whose review caught a defect** | Apply the predicate to the archived tasks with recorded Reviewer FAILs | Any such task qualifies |
| The always-on re-run quietly becomes optional | `grep` for the duty plus a literal read of every step that closes a task | A closure path that reaches `[x]` with no re-run field |
| `SKIPPED` and `WAIVED` blur in practice | `grep` both records; read the counting surfaces | A report that sums "tasks without a Reviewer PASS" |
| A stale cross-reference survives (closure rule, `/goal` condition, depth bands) | Targeted greps per site | The `/goal` condition still naming only two states |
| Mirror contradiction | Per-surface parity read, command beside mirror | A mirror describing the Reviewer as unconditional |
| Packaging regression | `npm run verify:cli && npm run pack:dry-run && git diff --check` | A renamed packaged file |
| **A rule a literal reader cannot execute** | **No automated check.** Substitute: the closure walkthrough over **held-out** corpus tasks, each judged against the general sentence with its parenthetical stripped | A held-out task for which no shipped sentence decides whether a Reviewer is owed |
| Over-application under cost pressure | **No automated check.** Substitute: FR-9's trial with escaped-defect measurement and a pre-committed abort criterion. Residual accepted risk | — |

## 9. Requirement ID Index

| ID | Name | Gate |
|---|---|---|
| FR-1 | Skip predicate | read of the block + corpus application + walkthrough |
| FR-2 | Overrides | read + corpus application (the FAIL-task test) |
| FR-3 | Evidence re-run, always | grep + literal read of every closure path |
| FR-4 | `REVIEW_SKIPPED` record and the three closure states | grep + read of the closure rule and `/goal` condition |
| FR-5 | `Review` field and gate visibility | read of Step 3.2, the Step 3.3 presentation list, and the Verification Checklist |
| FR-6 | Depth and effort banding | read of `reviewer.md` bands |
| FR-7 | Model routing | read of the registry + restatement grep |
| FR-8 | Leader authority | read of the amended `leader.md` paragraph |
| FR-9 | Trial, measurement, abort criterion | read; exercised by the trial itself |
| FR-10 | Backward compatibility | read: no command fails on a spec without the field |
| FR-11 | Coherence sweep | parity read + packaging commands |
| NFR-1..8 | Bounded / once / distinct / by-class / compat / falsifiable / parallel / neutral | diff-stat + greps above |
