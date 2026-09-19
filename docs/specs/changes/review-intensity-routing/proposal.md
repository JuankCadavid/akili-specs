# Proposal: Review Intensity and Model Routing by Task Category

**Recommendation:** classify every task into one of four **complexity categories** with objective predicates, bind each category to a **review intensity** (`none` / `checklist` / `full` / `lenses`) and to a model pairing, and let a task close without a Reviewer **only** in the two lowest categories, under a new `REVIEW_SKIPPED` record that is never confused with `REVIEW_WAIVED`. The skip list is decided at `/akili-specify` and **approved by the user at the tasks gate**, not chosen by the Leader mid-run.

**The headline finding is a correction to the premise.** On the one run where this was measured end to end, skipping Reviewers would have saved almost nothing. The over-spend was on the Implementer side: six of the ten tasks ran their Implementer on `opus` where the registry's own default for that role is `sonnet`, and the two assembly-heavy tasks ran their main workers there too. The cost lever is right-sizing the Implementer and the review *depth*, not deleting the gate.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/review-intensity-routing` |
| Slug | `review-intensity-routing` — derived from the session's intent (no argument was passed to `/akili-propose`); the analysis text is proposal context, not a directory name |
| Type | **Change** |
| Approval Mode | `gated` (no up-front end-to-end mandate given) |
| Date | 2026-09-19 |
| Status | Draft — awaiting approval |
| Depends on | none open |
| Parallel-safe | **yes** with `changes/scoped-constitution-reads`, **on one condition**: that spec owns `.claude/templates/implementer.md` and `tester.md` (its Scope table, rows for both files) and states "No change to the Reviewer" and no change to the Leader's load order. This proposal owns `leader.md` and `reviewer.md` and **deliberately does not touch `implementer.md`** (§6). Both add a `CHANGELOG.md` `Unreleased` entry — merge serially |
| Evidence | `docs/specs/archive`-bound run of `changes/premise-ledger`, executed 2026-09-19: ten tasks, full per-task Reviewer records in its `execution.md`, budget actuals independently re-verified by that spec's Reviewer in `walkthrough.md` §6 |
| Series note | Not part of the 2026-09-17 tier 2–3 queue; this arose from the `premise-ledger` run itself |

## 2. Intent

Make **when to spawn a Reviewer** and **which model runs each role** a decision the methodology states by rule, rather than a reflex that spawns a full independent audit for a one-line pointer edit and an over-provisioned Implementer for a mechanical one.

## 3. Problem / Current Behavior

Every claim below carries a citation as run or the `UNVERIFIED — confirm at source before relying on it` marker, per `/akili-specify` Step 2.2's *Premise Ledger* block.

**The Reviewer is currently unconditional, and one sentence makes that explicit.** `.claude/templates/leader.md:82` reads: *"The Reviewer is not self-verification — never collapse it… That independence is the methodology's core correctness guarantee and is not an efficiency cost to optimize away."*

**No rule anywhere permits closing a task without a Reviewer verdict.** Negative-existence check, run at `01496af` from the repository root, alternate phrasings included:

```
/usr/bin/grep -rn -i "skip the reviewer\|without a reviewer\|no reviewer\|reviewer optional\|omit the reviewer" .claude/commands .claude/templates
```

One hit, and it is the opposite of a permission: `akili-execute.md:320`, the `REVIEW_WAIVED` record, which exists for when the gate was **owed and lost**.

**The closure rule is hard.** `akili-execute.md:330`: *"A task with neither a `PASS` nor a `REVIEW_WAIVED` record in `execution.md` is not closable."* Any skip therefore needs a third record type, or the task literally cannot close.

**Depth already scales; the decision to review at all does not.** `reviewer.md:43–45` bands review depth by diff size (`< 50 LOC` checklist, `50–200` full four-lens, `> 200` parallel lenses). Nothing bands the *existence* of the review.

**The registry already prescribes a cheap Implementer.** `docs/model-routing.md` model registry: T2 Coder → `sonnet`, T3 Auditor → `opus` *(must differ from T2)*. The `premise-ledger` run did not follow it. Counted at `01496af` over that spec's `execution.md`:

```
/usr/bin/grep -c '^| Implementer | `opus`' docs/specs/changes/premise-ledger/execution.md
6
```

Those six are T1, T2, T3, T4, T6 and T8. T5 and T9 ran `sonnet`. T7 and T10 record their workers under a different field name (`Delegation shape` and `Workers` respectively) and ran their gates runner, card scout and assembler on `opus` as well, which is why a task-level count and a field-level count differ — the field-level six is the figure this proposal uses.

### What the one measured run actually shows

Source: `docs/specs/changes/premise-ledger/execution.md` per-task records; totals re-verified by that spec's Reviewer in `walkthrough.md` §6.

| Measure | Value |
|---|---|
| Tasks | 10 |
| Review rounds | 15 |
| Rounds that returned FAIL | 4 |
| Tasks where a FAIL occurred | 3 (T7, T9, T10) |
| Rework attempts consumed | 4, against 2 budgeted |

**Size did not predict value.** T5 and T9 were both single-line changes. T5's Reviewer found nothing; T9's caught a defect that would have shipped a rule whose own definition did not cover one branch of its trigger.

**What separated them was whether the task created an obligation or cited one.** T5 added a clause pointing at a block defined elsewhere. T9 changed the semantics of a closed enumeration that three other readers execute.

**Three of the four rework attempts were on derived evidence, not on shipped text** — the Leader's own assembled counts and claims in T7 and T10, the one artifact with no task spec to conform to.

**Confound, stated rather than hidden.** Seven of ten tasks passed clean on the first attempt while running `opus` Implementers at `high` effort against unusually complete task specs. This run cannot separate "the Reviewer was unnecessary" from "the Implementer was over-provisioned so the Reviewer found nothing." That is precisely why §13 proposes measurement before this becomes a default.

## 4. Proposed Outcome

- Every task carries a **category** with objective predicates a reader can apply without judgment about their own work.
- Category binds **review intensity** and a **model pairing**.
- `trivial` and `simple` may close with no Reviewer, recorded as `REVIEW_SKIPPED` with its category and the verification that stood in.
- `standard` and `complex` always get a Reviewer, on a model different from the Implementer's.
- A set of **overrides** no category can defeat forces a Reviewer regardless.
- The per-spec skip list is visible to the user **at the `tasks.md` approval gate**.

## 5. Scope

| Surface | Change |
|---|---|
| `/akili-specify` Step 3.2 | A `Review` field per task (`none` / `checklist` / `full` / `lenses`) with its category and a one-line reason; absent-value rule; Verification Checklist item so the skip list is visible at the gate |
| `/akili-execute` Step 2.3 | Becomes conditional on the task's `Review` field; the Leader may raise intensity freely, and may lower it only within the category rules |
| `/akili-execute` Step 2.4 + Execution Log Format | `REVIEW_SKIPPED` record; the "not closable" rule gains its third accepted state; the `/goal` unattended condition updated to accept it |
| `.claude/templates/leader.md` | The Delegation Ceiling's *never collapse it* paragraph amended, plus the category table and the overrides |
| `.claude/templates/reviewer.md` | Depth bands re-expressed against category rather than raw LOC, keeping LOC as a secondary input |
| `docs/model-routing.md` | **Review intensity** as a third dimension beside tier and effort; a category → role → model table |
| `/akili-constitution` Step 7 item 3 | The `task.md` template description names the `Review` field, citing Step 3.2 rather than redefining it |
| Mirrors + `CHANGELOG.md` | Four mirrors and the changelog entry |

## 6. Non-Goals

- **No change to `implementer.md` or `tester.md`** — owned by `changes/scoped-constitution-reads`. The "your verification is the gate, no Reviewer follows" instruction is carried by the Leader's brief, which keeps the two specs on disjoint files.
- **No change to the `author ≠ auditor` rule itself.** Where a Reviewer runs, it still runs on a different model.
- **No change to `REVIEW_WAIVED`.** A waiver stays what it is: a gate owed and lost.
- **No automatic category inference at execute time** in the recommended option; the category is authored at specify time and approved.
- **No change to the 3-attempt rework ceiling, the Pivot Protocol, or the budget tripwire.**

## 7. Affected Users, Systems, And Specs

| Affected | How |
|---|---|
| Every project running `/akili-execute` | Fewer Reviewer spawns on low-category tasks; cheaper Implementers by default |
| The user at the `tasks.md` gate | Gains a visible list of which tasks will not be independently reviewed, before execution starts |
| `changes/scoped-constitution-reads` | Adjacent, disjoint files, serial `CHANGELOG` merge |
| Consuming projects | Pick the change up on the next install; specs written before it read as "no `Review` field", defaulting to today's behavior |

## 8. Visual Reference

- Source: **None**
- Location: n/a
- Notes: methodology prose and routing tables only; no UI surface.

## 9. Requirement Delta Preview

### ADDED Requirements

- Four task categories with objective predicates and worked examples.
- A `Review` field on every task, with an absent-value that means today's behavior.
- A `REVIEW_SKIPPED` record with category, the verification that stood in, and who approved the skip list.
- Override conditions that force a Reviewer regardless of category.
- A category → model pairing in the routing registry.

### MODIFIED Requirements

- `reviewer.md`'s depth bands keyed to category first, diff size second.
- `/akili-execute` Step 2.3 becomes conditional.
- The task-closure rule accepts a third record.
- The `/goal` unattended-run condition accepts `REVIEW_SKIPPED`.

### REMOVED Requirements

- **The absolute reading of `leader.md:82`** — that the Implementer to Reviewer gate is *never* collapsed. This removes behavior the methodology currently ships, so `/akili-specify` Step 2.3's **reversion challenge** applies to it by name.

## 10. Approach Options

| # | Option | Trade-off |
|---|---|---|
| **A** | **Runtime-only.** The Leader classifies each task as it executes and skips where the rules allow. | Cheapest to build, no spec-format change. **Weakest governance:** the agent that benefits from skipping decides to skip, with nothing visible to the user beforehand. Category inflation downward is unchecked |
| **B** | **Specify-time field, user-approved, Leader may only raise.** *(recommended)* | The skip list is authored with full design context, is visible at the `tasks.md` gate, and the Leader can add review but not remove it beyond what was approved. Costs one new task field and a checklist item |
| **C** | **Fully derived, no new field.** Compute the category mechanically from the existing `Size`, `Consumers`, `Falsifier`, `Red run` and `Disqualifier` fields at execute time. | No format change and no human gate. The derivation is brittle where those fields are thin, and it makes a safety-relevant decision invisible until it has already been taken |

### On running Sonnet for both roles on basic tasks

Explicitly considered and **not recommended**. A same-model Reviewer pays the full price of a review while the methodology already grades its independence as lost — `akili-execute.md:330` defines exactly that state as the `same-model` waiver flag. For those tasks the cheaper and more honest configuration is **no Reviewer**, with the Leader re-running the task's deterministic verification inline, which the *Delegation Thresholds* already permit as inline work. The Sonnet-on-both-sides saving is achieved better by Option B's `none` category than by a degraded audit.

## 11. Recommended Approach

**Option B.** The categories and their predicates:

| Category | Objective predicates (all must hold) | Review | Implementer | Reviewer |
|---|---|---|---|---|
| **trivial** | Cites or renames an obligation defined elsewhere; creates none · `Consumers: none` · verification fully deterministic · `Disqualifier` names no read | `none` | T5 Fast-Cheap or T2 | — |
| **simple** | Authors local text or code · no shared contract, no closed enumeration · verification fully deterministic | `none` by default | T2 | — |
| **standard** | Authors a rule or behavior against a complete task spec · verification includes a read | `checklist` | T2 | T3, different model |
| **complex** | Defines or edits an obligation others execute · **or** touches a closed enumeration or shared contract · **or** produces derived evidence a later gate consumes · **or** ships a security / data-loss surface | `full` or `lenses` | T2 or T1 | T3, different model, effort `high`+ |

**Overrides that force a Reviewer regardless of category:** any rework attempt after a FAIL; `Consumers` is not `none`; the output is derived evidence feeding a gate; the task reverts delivered behavior; the Leader's own judgment, which may always raise but never lower.

Against the measured run, this classifies T5 as `trivial`, T1–T4, T6 and T8 as `standard`, and T7, T9 and T10 as `complex` — **saving one review round in fifteen**. That is the honest projected saving on this dataset, and it is deliberately small: the categories are drawn where the evidence supports them, not where the savings would be largest.

## 12. Risks, Dependencies, And Open Questions

| Risk | Mitigation |
|---|---|
| **This is a safety-reducing change.** Agents under cost pressure will reach for the lowest category | Predicates are objective and checkable; the skip list is user-approved at the gate; overrides cannot be defeated; every skip is recorded and countable |
| **External validity.** The evidence is one spec of prose tasks in the methodology's own repo | §13 makes the first N specs a measured trial rather than a default; code-heavy specs may show a different Reviewer yield |
| **The confound.** Cheap Implementer plus mandatory Reviewer may beat expensive Implementer plus skippable Reviewer, and this run cannot separate them | The trial records Implementer model per task alongside escaped defects, so the next retrospective can separate them |
| **Record blurring.** If `REVIEW_SKIPPED` and `REVIEW_WAIVED` merge in practice, the honest-metric property of the waiver dies | They are defined by different causes and carry different fields; `/akili-audit` and the kaizen Measure step count them separately |
| Parallel-safety with `scoped-constitution-reads` | Disjoint files by construction (§6); serial `CHANGELOG` merge |

**Open questions for the user:**

1. Should `simple` default to `none` (recommended) or to `checklist`, with `none` requiring an explicit reason?
2. Should the Leader be allowed to lower intensity at all mid-run when a task turns out smaller than specified, or only ever raise it?
3. Trial length before this becomes the default: the next two specs, or a fixed number of tasks?

## 13. Success Criteria

1. A reader applying the predicates to the ten tasks of the `premise-ledger` run, without seeing this proposal's own classification, reproduces it for at least nine.
2. Every skipped task in the trial carries a `REVIEW_SKIPPED` record naming its category and the verification that stood in.
3. The trial reports **escaped defects**: any defect found at `/akili-test`, `/akili-validate`, a later task, or HITL, in a task that skipped review. A non-zero count is a finding, not a failure, and feeds the next revision.
4. Implementer model distribution moves toward the registry default, measured as the share of Implementer spawns on T2 versus T1.
5. No task closes with neither a `PASS`, a `REVIEW_WAIVED`, nor a `REVIEW_SKIPPED`.
6. `leader.md`'s amended paragraph still forbids collapsing the gate for efficiency in `standard` and `complex`, verifiable by reading it against the original.

## 14. Next Step

```text
/akili-specify changes/review-intensity-routing
```

Standard depth. The spec should carry its own Premise Ledger, and it is a natural dogfooding case: its own `tasks.md` will contain tasks in all four categories, so the classification gets exercised by the change that defines it.

---

## Authorship

AKILI-SPECS methodology by **Juan Carlos Cadavid** — [jcadavid.com](https://jcadavid.com). Licensed under the MIT License.
