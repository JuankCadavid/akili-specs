# Proposal: Review Intensity and Model Routing by Proven Verification

**Recommendation:** split one conflated decision into **two orthogonal ones**, and add a duty that is never skipped.

1. **Does a conformance Reviewer run?** Decided by an objective predicate: the task's `Falsifier` was **executed and observed red**, its verification is fully deterministic, and no override applies. Not by size, not by a category, not by the Leader's impression that a task looks easy.
2. **How deep does it go, and on which models?** Decided by task category and diff size — this is where most of the speed actually comes from.
3. **Always, regardless of either:** the task's evidence is **re-run by someone other than its author**, mechanically, with no judgment. Cheap, fast, and never waived.

**The skip is earned, not granted.** A task qualifies to close without a Reviewer only by having *proved its own gate can fail*. That is more verification work than today's default, not less, and it is the reason this proposal argues quality goes up rather than down.

**Speed comes first from right-sizing, not from skipping.** On the one run measured end to end, the category-based skip this proposal originally recommended would have saved **one review round in fifteen**, while six of ten tasks ran an Implementer two tiers above the registry default and a one-line diff drew a `high`-effort review.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/review-intensity-routing` |
| Slug | `review-intensity-routing` — derived from the session's intent (no argument was passed to `/akili-propose`); the analysis text is proposal context, not a directory name |
| Type | **Change** |
| Approval Mode | `gated` (no up-front end-to-end mandate given) |
| Date | 2026-09-19 |
| Status | Draft — **revision 2**, awaiting approval |
| Revision note | Revision 1 gated the skip on a four-category ladder. Rejected during review with the user: it moved two variables toward less quality at once (cheaper Implementer **and** no Reviewer) on a class of tasks defined by size rather than by evidence. Revision 2 gates the skip on proven verification instead, and adds the always-on evidence re-run |
| Depends on | `changes/gate-falsifiability` (**shipped**, v2.25.0) — this proposal leans directly on its Falsifiability block, which is what makes "executed falsifier" a thing a task can be required to have |
| Parallel-safe | **yes** with `changes/scoped-constitution-reads`: that spec owns `.claude/templates/implementer.md` and `tester.md` and states "No change to the Reviewer" and no change to the Leader's load order. This proposal owns `leader.md` and `reviewer.md` and **deliberately does not touch `implementer.md`** (§6). Both add a `CHANGELOG.md` `Unreleased` entry — merge serially |
| Evidence | The `changes/premise-ledger` run, executed 2026-09-19: ten tasks with full per-task Reviewer records in its `execution.md`; budget actuals independently re-verified by that spec's Reviewer in `walkthrough.md` §6 |

## 2. Intent

Gain real speed on easy tasks **without** weakening the correctness guarantee, by making the Reviewer conditional on evidence that the task's own gate works, rather than on how small the task looks.

## 3. Problem / Current Behavior

Every claim carries a citation as run or the `UNVERIFIED — confirm at source before relying on it` marker, per `/akili-specify` Step 2.2's *Premise Ledger* block.

**The Reviewer is unconditional, and one sentence makes that explicit.** `.claude/templates/leader.md:82`: *"The Reviewer is not self-verification — never collapse it… That independence is the methodology's core correctness guarantee and is not an efficiency cost to optimize away."*

**No rule permits closing a task without a Reviewer verdict.** Negative-existence check, run at `01496af` from the repository root, alternate phrasings included:

```
/usr/bin/grep -rn -i "skip the reviewer\|without a reviewer\|no reviewer\|reviewer optional\|omit the reviewer" .claude/commands .claude/templates
```

One hit, and it is the opposite of a permission: `akili-execute.md:320`, the `REVIEW_WAIVED` record, for when the gate was **owed and lost**.

**The closure rule is hard.** `akili-execute.md:330`: *"A task with neither a `PASS` nor a `REVIEW_WAIVED` record in `execution.md` is not closable."* Any skip needs a third record, or the task cannot close.

**Depth already scales; existence does not.** `reviewer.md:43–45` bands depth by diff size (`< 50 LOC` checklist, `50–200` full four-lens, `> 200` parallel lenses). Nothing bands whether the review happens.

**The registry already prescribes a cheap Implementer, and the run ignored it.** Registry: T2 Coder → `sonnet`, T3 Auditor → `opus` *(must differ from T2)*. Counted at `01496af`:

```
/usr/bin/grep -c '^| Implementer | `opus`' docs/specs/changes/premise-ledger/execution.md
6
```

Those six are T1, T2, T3, T4, T6 and T8; T5 and T9 ran `sonnet`; T7 and T10 record workers under other field names and also ran `opus` on their assembly workers.

**The falsifier is required but not universally executed.** `/akili-specify` Step 3.2 Falsifiability rule 1 already requires it: *"The Done criteria require the falsifier **executed against the post-change code**: revert the change or apply the named mutation and observe the gate go red — a gate that stays green under its own falsifier asserts nothing."* In practice, executed falsifiers are recorded on roughly half the run:

```
/usr/bin/grep -c -i "falsifier.*execut\|execut.*falsifier" docs/specs/changes/premise-ledger/execution.md
6
```

Six mentions, concentrated in T1, T2, T4, T7 and T10. **This is the lever.** Making an executed falsifier the price of skipping review raises the floor on verification while lowering audit cost.

### What the one measured run shows

| Measure | Value |
|---|---|
| Tasks | 10 |
| Review rounds | 15 |
| Rounds returning FAIL | 4 |
| Tasks where a FAIL occurred | 3 (T7, T9, T10) |
| Rework attempts consumed | 4, against 2 budgeted |

**Size did not predict value.** T5 and T9 were both one-line changes. T5's review found nothing; T9's caught a defect that would have shipped a rule whose own definition failed to cover one branch of its trigger.

**Three of the four rework attempts were on derived evidence** — the Leader's assembled counts and claims in T7 and T10, the artifact with no task spec to conform to.

**Confound, stated rather than hidden.** Seven of ten tasks passed clean while running `opus` Implementers at `high` effort. This run cannot separate "the Reviewer was unnecessary" from "the Implementer was over-provisioned." §13 measures this rather than assuming it.

## 4. Proposed Outcome

- A task closes without a conformance Reviewer **only** when it has proved its own gate can fail, and no override applies.
- A task's evidence is **always** re-run by a non-author, mechanically, recorded per task.
- Implementer model, Reviewer model and review depth are chosen by rule and the deviation recorded, instead of defaulting upward.
- `REVIEW_SKIPPED` records a gate that was **never owed**, and stays permanently distinguishable from `REVIEW_WAIVED`, a gate **owed and lost**.
- The list of tasks that plan to skip is visible to the user **at the `tasks.md` approval gate**.

## 5. Scope

| Surface | Change |
|---|---|
| `/akili-specify` Step 3.2 | A `Review` field per task (`skip-eligible` / `checklist` / `full` / `lenses`) with a one-line reason; `skip-eligible` is a *claim to be proved at execute time*, never a guarantee; Verification Checklist item so the skip list is visible at the gate |
| `/akili-execute` Step 2.3 | Reviewer spawn becomes conditional on the **skip predicate**, evaluated against the Implementer's actual report, not against the plan |
| `/akili-execute` Step 2.2 / new step | The **evidence re-run** duty: Leader-inline by default, a T5 Verifier spawn when the command set is large; its result recorded per task |
| `/akili-execute` Step 2.4 + Execution Log Format | `REVIEW_SKIPPED` record with its predicate evidence; the "not closable" rule gains its third accepted state; the `/goal` condition updated |
| `.claude/templates/leader.md` | The *never collapse it* paragraph amended to the predicate; model/effort selection recorded like skill deviations already are |
| `.claude/templates/reviewer.md` | Depth bands keyed to category first, diff size second; effort bound to band so a one-line diff cannot draw a `high`-effort sweep |
| `docs/model-routing.md` | **Review intensity** as a third dimension beside tier and effort; the always-on Verifier duty mapped to T5 |
| `/akili-constitution` Step 7 item 3 | The `task.md` template description names the `Review` field, citing Step 3.2 rather than redefining it |
| Mirrors + `CHANGELOG.md` | Four mirrors and the changelog entry |

## 6. Non-Goals

- **No change to `implementer.md` or `tester.md`** — owned by `changes/scoped-constitution-reads`. The "no Reviewer follows; your verification is the gate" instruction rides in the Leader's brief, keeping the specs on disjoint files.
- **No weakening of `author ≠ auditor`.** Where a Reviewer runs, it runs on a different model.
- **No change to `REVIEW_WAIVED`.**
- **No skip for a task that did not execute its falsifier**, however small it looks.
- **No change** to the 3-attempt ceiling, the Pivot Protocol, or the budget tripwire.

## 7. Affected Users, Systems, And Specs

| Affected | How |
|---|---|
| Projects running `/akili-execute` | Cheaper Implementers by default, depth-bound review effort, fewer Reviewer spawns on tasks that proved their gate |
| The user at the `tasks.md` gate | Sees which tasks intend to skip review, before execution |
| `changes/scoped-constitution-reads` | Adjacent, disjoint files, serial `CHANGELOG` merge |
| Consuming projects | Specs written before this read as "no `Review` field" and default to today's behavior |

## 8. Visual Reference

- Source: **None**
- Location: n/a
- Notes: methodology prose and routing tables only; no UI surface.

## 9. Requirement Delta Preview

### ADDED Requirements

- The **skip predicate**: executed falsifier observed red, fully deterministic verification, no override.
- The **evidence re-run** duty, performed by a non-author and recorded.
- `REVIEW_SKIPPED`, distinct from `REVIEW_WAIVED`.
- Recorded model and effort selection per task, with deviations justified.

### MODIFIED Requirements

- `/akili-execute` Step 2.3 becomes conditional.
- `reviewer.md` depth bands bind effort, not only lens count.
- The closure rule accepts a third record; the `/goal` condition follows.

### REMOVED Requirements

- **The absolute reading of `leader.md:82`.** This removes shipped behavior, so `/akili-specify` Step 2.3's **reversion challenge** applies to it by name.

## 10. Approach Options

| # | Option | Trade-off |
|---|---|---|
| **A** | **Category-gated skip** (revision 1). Four categories; the two lowest skip review. | Rejected with the user. Predicts from size, which the evidence shows does not predict defect risk, and pairs the skip with a cheaper Implementer so two variables move toward less quality at once |
| **B** | **Proof-gated skip plus always-on evidence re-run.** *(recommended)* | The skip is earned by executing the falsifier, so verification rises where audit falls. Categories survive as depth guidance. Costs one task field, one new record, and a small always-on duty |
| **C** | **No skip at all; right-sizing only.** Keep every Reviewer, fix models and depth. | Safest, and captures most of the speed, since the measured skip saving was 1 round in 15. Leaves genuinely mechanical tasks paying for a full audit, and does not raise falsifier execution |

**On running Sonnet for both roles on basic tasks:** considered and not recommended in any option. A same-model Reviewer pays full price for an audit the methodology itself grades as independence lost (`akili-execute.md:330`, the `same-model` waiver flag). Where a review is warranted, keep the models different; where it is not, skip it honestly and keep the cheap re-run.

## 11. Recommended Approach

**Option B.**

**The skip predicate.** All must hold, evaluated against what the Implementer actually reported:

1. The task's `Falsifier` was **executed against the post-change code and observed red**, per Step 3.2 Falsifiability rule 1.
2. Verification is **fully deterministic** — every check a command with a pass/fail result; the `Disqualifier` names no read.
3. `Consumers: none`.
4. No override applies.

**Overrides, none of which any category or predicate defeats:** the task defines or edits an obligation other readers execute; it touches a closed enumeration or shared contract; it produces derived evidence a later gate consumes; it reverts delivered behavior; it is a rework attempt after a FAIL; it touches a security or data-loss surface; or the Leader judges review warranted, which it may always do.

**The always-on duty.** Whatever the predicate says, the evidence is re-run by a context other than the author, comparing outputs against the Implementer's report. Leader-inline when it is a handful of commands, which the *Delegation Thresholds* already class as inline work; a T5 Verifier spawn when the set is large. Output is `VERIFIED` or `MISMATCH`, and a mismatch is an implicit FAIL that consumes an attempt exactly as a failed verification does today.

**Categories, demoted to depth guidance:**

| Category | Typical marker | Depth if reviewed | Implementer | Reviewer |
|---|---|---|---|---|
| trivial | cites an obligation defined elsewhere | `checklist`, low effort | T5 or T2 | T3, different model |
| simple | local authored text, no shared contract | `checklist` | T2 | T3, different model |
| standard | authors a rule against a complete spec | `checklist` or `full` | T2 | T3, different model |
| complex | defines an obligation, edits an enumeration, or assembles derived evidence | `full` or `lenses`, effort `high`+ | T2 or T1 | T3, effort `high`+ |

Against the measured run: T5 is the one task that would plausibly clear the predicate, so the direct saving stays **one round in fifteen**, honestly stated. The larger savings are the six Implementer spawns moved to T2 and the effort-bound depth on small diffs.

## 12. Risks, Dependencies, And Open Questions

| Risk | Mitigation |
|---|---|
| **Falsifier quality becomes load-bearing.** A weak or inert falsifier would let the predicate pass work that was never really gated | The dependency is explicit: `changes/gate-falsifiability` already ships the *inert fixture* anti-pattern and the executed-red requirement. The trial counts escaped defects specifically in skipped tasks |
| **Predicate gaming.** A task could be written with a trivially deterministic verification to qualify | The skip list is visible at the `tasks.md` gate before execution, and the overrides are evaluated against what the task *does*, not how its verification is phrased |
| **This still reduces coverage** relative to today | The always-on re-run preserves the "a non-author confirmed the evidence" property at near-zero cost; only the judgment audit is conditional |
| **External validity.** One prose spec in the methodology's own repo | §13 runs a measured trial before default adoption |
| **The confound** between cheaper Implementer and skipped Reviewer | The trial records Implementer model per task beside escaped defects so the next retrospective can separate them |
| **Record blurring** between `SKIPPED` and `WAIVED` | Different causes, different fields, counted separately by `/akili-audit` and the kaizen Measure step |

**Open questions for the user:**

1. Should the Leader be allowed to lower review intensity mid-run when a task proves simpler than specified, or only ever raise it? My inclination is raise-only.
2. Trial length before default adoption: the next two specs, or a fixed task count?
3. Should `skip-eligible` tasks that **fail** their predicate at execute time simply get a normal review, silently, or should the mismatch between plan and outcome be reported at the continue gate? My inclination is report it, since it is a signal the spec author misjudged the task.

## 13. Success Criteria

1. Two readers applying the predicate independently to the ten tasks of the `premise-ledger` run reach the same skip set.
2. Falsifier execution rate rises above its current baseline of roughly half the tasks.
3. Every skipped task carries a `REVIEW_SKIPPED` record naming the predicate evidence and the re-run result.
4. Every task, skipped or not, carries an evidence re-run result by a non-author.
5. **Escaped defects are reported**: any defect found at `/akili-test`, `/akili-validate`, a later task, or HITL in a task that skipped review. Non-zero is a finding that feeds the next revision, not a failure.
6. Implementer spawns on T2 rise as a share of the total.
7. No task closes with neither a `PASS`, a `REVIEW_WAIVED`, nor a `REVIEW_SKIPPED`.
8. `leader.md`'s amended paragraph still forbids collapsing the gate for efficiency wherever the predicate does not hold.

## 14. Next Step

```text
/akili-specify changes/review-intensity-routing
```

Standard depth. The spec carries its own Premise Ledger and is a natural dogfooding case: its own tasks will span the depth categories, and at least one should be written to clear the skip predicate so the mechanism is exercised by the change that defines it.

---

## Authorship

AKILI-SPECS methodology by **Juan Carlos Cadavid** — [jcadavid.com](https://jcadavid.com). Licensed under the MIT License.
