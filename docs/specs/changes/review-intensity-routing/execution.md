# Execution: Review Intensity and Model Routing by Proven Verification

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/review-intensity-routing` |
| Approval Mode | `gated` — inherited from `proposal.md`; the continue gate stops for the user after every task |
| Started | 2026-09-19 |
| Budget (design §13) | 9 tasks · ~120 shipped lines · 10 review rounds |
| Baseline commit | `0c08abb` — every baseline reading in `tasks.md` Document Control re-verified against it at run start, all matched |
| Harness | No Step 8E agent wrappers in this project (`.claude/agents/` is empty), so Implementer and Reviewer are spawned as persona-seeded subagents with an explicit model per spawn |
| Model routing | Implementer **T2 `sonnet`** (registry default, no escalation taken on any task so far) · Reviewer **T3 `opus`** · `author ≠ auditor` holds on every task below |
| Open question | FR-9 / DD-10 require the trial's **extent** and **abort criterion**, fixed by the user at approval and recorded verbatim. They are not recorded anywhere in this spec folder. T9 consumes them — raised to the user at the T1 continue gate |

## 2. Task Execution History

### T1 — `/akili-execute` Step 2.3: the *Review intensity* block

| Field | Value |
|---|---|
| Status | **PASS** |
| Date | 2026-09-19 |
| Implementer attempts | 2 |
| Review rounds | 2 (one `FAIL`, one `PASS`) |
| Shipped lines | 42 insertions / 6 deletions in one file (estimate was ~35) |
| Requirements covered | FR-1 (four conditions, the four bullets, all three scenarios), FR-2 (overrides a–g, both bullets, the *derived evidence* scenario), FR-3 (the duty, its five bullets, both scenarios), NFR-2, NFR-4, NFR-8 |

**Files changed:** `.claude/commands/akili-execute.md` — and only that file, confirmed by `git status --porcelain` at every checkpoint.

#### Attempt 1 — Reviewer `FAIL`

*Files changed:* `.claude/commands/akili-execute.md` (41 insertions / 5 deletions at the point of review).

*Implementer verification, as reported and as independently re-run by the Leader:*

| Check | Result |
|---|---|
| `grep -c "Review intensity"` | 6 (≥ 1 required) |
| predicate terms within the block (`executed`, `deterministic`, `Consumers`, `override`) | each ≥ 1 |
| `grep -c "VERIFIED"` / `grep -c "MISMATCH"` | 3 / 5 |
| `grep -c "REVIEW_WAIVED"` | **6** — exactly the pre-change baseline, proving the waiver's text was untouched |
| `grep -c "REVIEW_SKIPPED"` | 0 — no T2 vocabulary leaked in |
| `git diff --stat 0c08abb -- .claude/commands/akili-specify.md` | empty — the Falsifiability block is untouched (NFR-1) |

*Executed falsifier (required for this task, and executed rather than named):* on a scratch copy outside the working tree, override (c) was deleted and FR-2's *Derived evidence is never skippable* scenario re-read against the mutated text. Observed flip — shipped text: review required, (c) fires; mutated text: qualifies for skip. Scratch copy discarded.

*Evidence re-run (FR-3, Leader-inline):* **`VERIFIED`** — every value above re-executed by the Leader independently of the author; all matched the report.

*Reviewer verdict:* **`FAIL`**, one issue.

> 1. **Discovered Issue:** `akili-execute.md:121` — the Step 2 preamble, three lines above the pseudocode this task edited — still reads: *"The loop terminates on Reviewer `PASS`, on HALT after 3 failed attempts, or on a Pivot."* Under the new block a task may terminate the loop with **no Reviewer spawned at all**, so the sentence that introduces the reconciled pseudocode now asserts exactly the unconditionality the block removes. A literal reader who stops at the preamble concludes a Reviewer verdict is the only clean exit. This is the same class as the repo's standing lesson on surviving neighbouring sentences.
>     *   **Violated Rule:** `requirements.md` FR-1 — *"A task MAY close without a conformance Reviewer **only when all four conditions hold**"*; T1's own Pre-review sweep clause — *"the surviving spawn instructions must not contradict the new conditionality"*. `design.md` §3 *Flow of one task* routes the Leader to *"spawn a Reviewer, or [close without one]"*.
>     *   **Remediation Suggestion:** Amend line 121 to name both terminations without introducing T2's vocabulary, e.g. *"The loop terminates on a passing verdict — a Reviewer `PASS`, or a task that met **Review intensity** (Step 2.3) with no Reviewer owed — on HALT after 3 failed attempts, or on a Pivot."* One sentence, same step, no new file.

*Runtime events:* `idle-without-report ×2 → leader.md idle-without-report protocol, step 2 (poke)`. The Implementer twice ended its turn echoing an earlier report instead of delivering the contracted one. Tree checked first each time (a poke citing stale evidence invites a double-apply), then poked once; the second poke recovered the work. No attempt consumed — a runtime event never touches the ceiling.

#### Attempt 2 — Reviewer `PASS`

*Files changed:* `.claude/commands/akili-execute.md` — one sentence, line 121.

*Implementer verification, as reported and as independently re-run by the Leader:* `git status --porcelain` → one file · `git diff --stat` → 42 insertions / 6 deletions · `Review intensity` 7 (was 6; the new citation at line 121) · `VERIFIED` 3 · `MISMATCH` 5 · `REVIEW_WAIVED` **6** · `REVIEW_SKIPPED` **0**.

*Evidence re-run (FR-3, Leader-inline):* **`VERIFIED`** — all values matched.

*Reviewer verdict:* **`PASS`**.

> SUMMARY: The amended line 121 conforms — it cites *Review intensity* by name and location, restates no condition or override, introduces no T2 vocabulary, and matches the pseudocode's two passing routes. I also rule the *Wind Down* bullet a ceiling, not a contradiction: it closes.

The Reviewer recorded that it held no prior verdict on this task and therefore audited the **whole T1 surface fresh from source** — the Step 2.3 block, the Step 2.2 brief bullet, the Step 2.4 guardrail, verification 1–6, the disqualifiers and the pre-review sweep — rather than certifying attempt 1's work by inheritance. This PASS stands on that fresh audit. It confirmed the disqualifiers by reading, not counting: the report-not-plan rule is present and bold, the overrides sit immediately beneath the predicate under a heading saying so, and the re-run duty is unconditional (*"For **every** task, whether or not a conformance Reviewer runs"*).

*Runtime events:* none.

#### `ADVISORY` findings (attempt 1 — recorded, never acted on)

Per *Advisory Never Gates* and *Advisory Never Becomes A Task*, these are recorded here and die here. None was actioned; none may become a task in this spec.

| Lens | Finding |
|---|---|
| Reliability | The pseudocode's skip path assigns `verdict = PASS`, putting a never-owed gate and a Reviewer verdict into one variable. T2 owns `REVIEW_SKIPPED` and the three closure states, so its absence here is correct — but T2 will have to unwind this assignment, and until it lands a literal reader routes a never-reviewed task into a Step 3 that admits only a Reviewer `PASS`. A neutral label (`verdict = close`) would have avoided the debt |
| Readability | Both reconciled sites read *"Review intensity … met **and no override applies**"*. Condition 4 already is *"No override below applies"*, so the conjunct is redundant — harmless, but it is the one fragment of the predicate's content restated outside the block, and it will drift if condition 4 is reworded |
| Readability | The heading `#### 2.3 — Spawn Reviewer` now names an outcome conditional on the block it contains. Item 2 states the conditionality explicitly, so a reader who reads on is not misled; a reader scanning headings still sees an unconditional spawn |

Attempt 2's Reviewer independently reached the same tiering on the one advisory visible in the diff (the redundant conjunct): redundant, pointing at the same list, not a second definition.

#### Forward pointers — T2 must carry these in its brief

1. **`akili-execute.md:38`, in `## Output`** — reads *"a Reviewer PASS verdict before the task is marked complete"*, which contradicts the new conditionality. It is a **closure claim**, so T2 owns it (*"Step 3: closure accepts exactly three states"*), and it sits outside T1's sweep, which is scoped "around Step 2.3" — it is not a T1 defect. **The reason this pointer matters:** T2's own stated pre-review sweep grep, `"PASS or \|PASS nor \|not closable"`, does **not** match that line, so T2 will not find it by running its stated verification. The line number goes in T2's brief.
2. **The `verdict = PASS` assignment on the pseudocode's skip path** (advisory 1 above) — T2 unwinds it when the three closure states land.

#### Decisions made

| Decision | Reason |
|---|---|
| The pre-review sweep was read as covering the **Step 2 loop pseudocode**, not only the prose immediately around Step 2.3 | T1's sweep clause carries a file-wide grep (`grep -n -i "reviewer" .claude/commands/akili-execute.md`) and an unscoped purpose clause (*"the surviving spawn instructions must not contradict the new conditionality"*). The pseudocode is the command's most literal executable rendering; leaving it stale would have shipped the *rule a literal reader cannot execute* defect class `requirements.md` §8 names. Recorded as a Leader judgment call, not as new scope |
| Two brief-conformance corrections were issued **without consuming an attempt** | Neither was a Reviewer `FAIL` nor an Implementer-reported verification failure, which are the only two events the accounting rule lets consume an attempt. Both were surviving-neighbour reconciliations of the kind KZ-changes--kaizen-loop-closure-2 classes as brief non-conformance |
| The `feedback = Reviewer issues` line was treated as **in scope**, over the Implementer's objection that it was pre-existing | The line was total before this diff — every path into `else (FAIL):` came from a Reviewer verdict. The new `if MISMATCH: verdict = FAIL` branch is what made it unassignable on one route, so the incoherence was introduced by the edit rather than surviving it |
| The *Wind Down Before You Run Out* bullet (*"up to 3 attempts × (Implementer + Reviewer)"*) was **left unchanged** | Both the Implementer and the Reviewer independently ruled it a round-trip budget **ceiling**, not a termination-condition claim: a task closing on the intensity branch costs fewer round trips, which is inside the bound, and over-reserving context is the safe direction |
| Implementer ran on **T2 `sonnet`** for both attempts, with **no tier escalation** | The registry default, and FR-7's rule this spec is itself shipping. Effort was the dial instead: `high` on attempt 1, bumped to `xhigh` on attempt 2 per the rework loop |

#### Issues encountered

- **Leader error, recorded for the retrospective.** After the Implementer twice went idle without its contracted report, a fresh Implementer was spawned for the outstanding one-line fix — and the original worker delivered that same fix moments later, its message interleaving with the spawn. The second worker was stopped before it edited anything, and the tree was checked for a double-apply (`grep -n "feedback = "` → one assignment line; none found). The sequencing was the Leader's mistake, not the worker's: `leader.md`'s protocol says to check the tree *before* acting on an idle worker, and the tree check that would have caught the race was run after the spawn rather than before it.
- No environment pre-check was required: every verification on this task is a grep against a file in the repository, with no running stack.

#### Final verification result

All six task checks green, re-run independently by the Leader after each attempt (`VERIFIED` both times). Falsifier executed and its red observed. Disqualifiers read rather than counted, by both the Implementer and the Reviewer. Reviewer `PASS` on attempt 2 from a fresh full audit.

---

### T2 — `/akili-execute`: closure states, the `REVIEW_SKIPPED` record, `/goal`

| Field | Value |
|---|---|
| Status | **PASS** |
| Date | 2026-09-19 |
| Implementer attempts | 2 |
| Review rounds | 2 (one `FAIL`, one `PASS`) — running total for the spec: 4 of the 10 budgeted |
| Shipped lines | 22 insertions / 8 deletions in one file (estimate was ~22) |
| Requirements covered | FR-4 (four record fields, three closure states, separate countability, `/goal`), FR-10 (all three bullets), NFR-3, NFR-5 |
| Forward pointers received from T1 | both closed — see below |

**Files changed:** `.claude/commands/akili-execute.md`, and only that file.

#### Attempt 1 — Reviewer `FAIL`

*Files changed:* `.claude/commands/akili-execute.md` (21 insertions / 8 deletions at the point of review).

*What landed:* the `## REVIEW_SKIPPED: <Task ID>` record with its four fields as a **sibling** beside `REVIEW_WAIVED` (DD-5, never a flag on it); the distinctness sentence; the three-state closure rule; `SKIPPED` in the final-status vocabulary; the `/goal` condition widened to the third state; the Approval Mode paragraph carrying both DD-6 (a skip auto-passes as routine) and DD-12 (a mismatch is reported even under `pre-approved`). **Both T1 forward pointers closed:** the `## Output` bullet at line 38 now names three closing records, and the pseudocode's skip path writes `verdict = SKIPPED` rather than conflating a never-owed gate with a Reviewer `PASS`.

*Implementer verification, as reported and as independently re-run by the Leader:* `REVIEW_SKIPPED` 8 (≥ 4 required) · `REVIEW_WAIVED` 9 (≥ 6 required; baseline 6, so the waiver's text was not reduced) · the closure sentence names all three states on one line · `git diff -U0 c87187f | grep "^-"` inspected line by line, **no removed line is a row of the `REVIEW_WAIVED` field table** (the five rows confirmed byte-identical to baseline) · `grep -n "pre-approved"` returns both required hits.

*Evidence re-run (FR-3, Leader-inline):* **`VERIFIED`** — all values re-executed independently of the author; all matched.

*`Not Done / Assumptions` returned by the Implementer — carried verbatim, as the rule requires:*

> FR-10 ("a spec with no `Review` field behaves exactly as today") required no new text — the Step 2.3 predicate (T1's) evaluates the Implementer's report directly and never reads the `Review` field to decide the predicate's four conditions, so absence of the field doesn't change closure-state behavior in this file; the field's own absent-value default is `/akili-specify`'s (T5's) concern. Confirmed by inspection, no code path in this file branches on the field's presence.

The Leader did not adjudicate this claim alone. It was put to the Reviewer as a **named first-class check**, with the three outcomes left open — guarantee delivered, guarantee missing, or the approved requirements genuinely under-specify the link (a spec gap for the Pivot Protocol).

*Reviewer verdict:* **`FAIL`**, one issue — and the `Not Done` argument refuted by counterexample.

> 1. **Ruling on the named check — the `Not Done` does not resolve; FR-10 bullet 1 is undelivered.** No sentence in this file or in T1's shipped text delivers *"a `tasks.md` without a `Review` field SHALL execute exactly as today: a Reviewer for every task."* The Implementer's premise is correct and is exactly what breaks the guarantee: because nothing branches on the field's presence, a task from a pre-field spec is evaluated by the predicate on equal terms and **can clear it**. This is not hypothetical — an archived `tasks.md` in this repo carries **0** `Review` fields and **9** tasks whose `Consumers` reads `none`, with executed falsifiers recorded in its `execution.md`. Under the shipped four conditions such a task closes `REVIEW_SKIPPED` with no Reviewer. That is the case FR-10 forbids.
>    - FR-5's absent-value rule cannot cover it, and not only because it lives in a later task's file: `checklist` is defined in `requirements.md` §3 as a **depth band** — "how deep a review goes **when one runs**" — and FR-6 states *"Categories SHALL be depth guidance only; they SHALL NOT decide whether a review happens — FR-1 does."* A depth default cannot deliver an existence guarantee.
>    - **Violated Rule:** `requirements.md` FR-10 bullet 1 and NFR-5; `tasks.md` T2 scope bullet 4; `design.md` §7.2 `Review`-field reader table, row *"Tasks written before this change | no field → `checklist` → today's behavior (FR-10)"*.
>    - **Remediation Suggestion:** add one applicability sentence in `.claude/commands/akili-execute.md` — in the Step 2.3 **Review intensity** block (preferred; that is where the predicate's scope is set) or beside the closure rule. Word it as an **applicability rule**, not a fifth predicate condition: T1's shipped *"never against the task's `Review` field or the plan"* governs **how** the predicate is evaluated for tasks in scope, and must stay intact. Corpus applications under DD-11/NFR-6 are analytic and unaffected.
>
> **Not a spec gap.** The obligation is stated (FR-10 bullet 1), its intent is restated in FR-5's *"no spec written before this change loses its review"*, and it is satisfiable here by quoting it — no rule needs inventing. The FR-1/FR-10 tension is real but resolvable by the applicability framing above; escalation under the Pivot Protocol is not warranted.

The Reviewer also recorded seven "what passed" findings checked at the source, including that design §7.2's rung-4 row genuinely still *holds* (a skip is not a runtime-failure ladder rung), and that the `/goal` condition was narrowed to a **named third state** rather than widened to "any closed task" — the disqualifier's stated failure mode.

*`ADVISORY`:* none — correctly suppressed under the Reviewer persona's `< 50 LOC` band rule, which directs reporting only gate-blocking findings on a small diff.

*Runtime events:* the verdict was truncated in delivery twice; the Leader requested the remainder verbatim each time and the Reviewer supplied it. No re-audit, no attempt consumed.

#### Attempt 2 — Reviewer `PASS`

*Files changed:* one added bullet at line 201, in the Step 2.3 *Review intensity* block, immediately under the predicate table:

> - **Applicability.** This section governs only a task whose `tasks.md` carries a `Review` field; a `tasks.md` with no `Review` field predates this change and is out of scope for it entirely — every one of its tasks gets a conformance Reviewer, exactly as today, regardless of what the conditions above would find. That is a gate on the field's presence, not a use of its value — the introductory sentence's **never against the task's `Review` field or the plan** still governs how the predicate is evaluated once a task is in scope.

*Evidence re-run (FR-3, Leader-inline):* **`VERIFIED`** — `REVIEW_SKIPPED` 8 · `REVIEW_WAIVED` 9 · one file · 22 insertions / 8 deletions, of which this attempt contributed exactly one line.

*Reviewer verdict:* **`PASS`**, with the attempt-1 question explicitly settled rather than deferred.

> SUMMARY: The Applicability bullet at line 201 delivers FR-10 bullet 1 for the exact counterexample that failed attempt 1, reads as a scoping rule rather than a fifth condition, and does not conflict with line 192 under a literal reading. FR-10 bullets 2 and 3 confirmed at the source. **The attempt-1 `Not Done` question is settled, not deferred:** scope bullet 4 did owe text, that text now ships, and no scope remains outstanding on T2.

Its four rulings, in brief: **(1)** the counterexample document now reaches a Reviewer, because `regardless of what the conditions above would find` means the predicate is never reached at all; **(2)** it is applicability, not a fifth condition — the structural test being that every predicate condition is evaluated against the Implementer's *report* while this one is evaluated against the *`tasks.md`*: different object, different moment; **(3)** no contradiction with T1's line 192, which is grammatically bound to the four conditions it introduces — and the presence gate is **monotone in the safe direction**, able only to force a review and never to grant one, so it cannot produce DD-7's failure mode; **(4)** FR-10 bullets 2 and 3 confirmed at the source rather than assumed.

The Reviewer also noted a boundary the spec does not legislate and which is therefore not a finding: a `tasks.md` where only *some* tasks carry the field falls outside both FR-10 bullet 1 and FR-5 (which mandates the field on every task).

*Runtime events:* none beyond the delivery truncation noted above.

#### Decisions made

| Decision | Reason |
|---|---|
| The attempt-1 `Not Done` claim was **routed to the Reviewer as a named check** rather than adjudicated by the Leader | The claim was "no scope is owed here", which is a conformance question about whether a requirement ships. Adjudicating it inline would have been the Leader ruling on work it supervised, and the three outcomes — delivered, missing, or a genuine spec gap — were left open in the brief so the auditor could reach any of them |
| A **spec gap / Pivot was explicitly considered and rejected**, on the Reviewer's ruling | The FR-1 / FR-10 tension is real: FR-1's predicate reads the report and not the field, while FR-10 bullet 1 guarantees a Reviewer for every task of a pre-field spec. The Reviewer ruled the obligation stated and satisfiable by quoting it, with no rule needing invention. The loop therefore continued rather than stopping for the user |
| **Leader error — a mis-specified verification check.** The brief added a check requiring `grep -c "leader-brief-contract\|gate-falsifiability"` to be **0** file-wide; it returns **1** | The hit is line 177, `(hand-off from \`changes/gate-falsifiability\`)`, verified **byte-identical at the pre-spec baseline `c87187f`** and sitting inside a parenthetical — NFR-4's own carve-out. The check was a Leader-added item carrying a threshold pre-existing text cannot meet, and it was **not tagged `[advisory-grade]`** as the brief contract's clause (d) requires. The Implementer flagged it rather than silently editing out-of-scope text or silently passing, which is the correct behavior on both counts. No scope owed; the error is the Leader's and is recorded here rather than charged to the task |
| Implementer stayed on **T2 `sonnet`**, no tier escalation, for both attempts | Registry default and FR-7's own rule. Effort was the dial: `high` on attempt 1, `xhigh` on attempt 2 |

#### Forward pointer — T9 must carry this

**T9's closure gate (d) — *"Held-out discipline: neither held-out spec is named in any shipped file"* — will read red on `.claude/commands/akili-execute.md:177`**, which names `changes/gate-falsifiability` in a parenthetical. That line predates this spec (byte-identical at `c87187f`) and no task in this spec introduced or touched it. T9 must decide, with the user, between scoping gate (d) to text **this spec shipped**, removing the parenthetical as a separate authorized change, or recording the hit as a known pre-existing exception. It must not be silently passed over, and it must not be "fixed" by widening a task's scope.

#### Issues encountered

- The Reviewer's verdict exceeded the delivery limit on both rounds and arrived truncated. Recovered each time by requesting the remainder verbatim, with no re-audit. Worth noting for the retrospective: the `~600 word` report ceiling in the command exists precisely to prevent this, and a verdict carrying a first-class named ruling plus a seven-bullet "what passed" list does not fit inside it.

#### Final verification result

All five task checks green, re-run independently by the Leader after each attempt (`VERIFIED` both times). Falsifier readings confirmed against the pre-spec baseline `c87187f`. Disqualifier read rather than counted: `REVIEW_SKIPPED` ships as a sibling record with its own heading and field table, never a flag on the waiver (DD-5); the `/goal` condition names a third state rather than accepting "any closed task". Reviewer `PASS` on attempt 2, with the attempt-1 `Not Done` settled on the record.

#### Addendum to T2's forward pointer — the held-out question, largely settled

Recorded after the T2 `PASS`, on the Reviewer's ruling plus the Leader's own re-verification of both quoted texts. **This narrows the pointer above rather than cancelling it.**

The Reviewer ran three checks and reported: the eleven-corpus-name grep over `.claude/commands/akili-execute.md` returns **one** hit, line 177; that line is byte-identical at `c87187f`; and `git diff | grep -E "^[-+].*(gate-falsifiability|leader-brief-contract|premise-ledger)"` returns **0** — this spec's diff neither adds nor removes any line naming a corpus spec. Its ruling: naming a spec as a **field-contract dependency** is not a held-out violation, because the discipline reserves those specs' *task records* as evidence, and `requirements.md` §1 independently lists `changes/gate-falsifiability` under *Depends on*.

**The Leader re-read both governing sentences rather than accepting the characterisation, and found the two approved documents do not say the same thing:**

| Document | Held-out wording, as quoted |
|---|---|
| `requirements.md` §1 | *"the shipped text may cite `premise-ledger` tasks only; every other spec's **tasks** are reserved for the closure walkthrough and must never be named in shipped text"* |
| `tasks.md` §2 | *"**No shipped file may name either spec** or any of its tasks."* |

`tasks.md` is **stricter than the requirement it implements**: it extends the prohibition from task records to the spec names themselves. Under `requirements.md`'s wording line 177 is clean; under `tasks.md`'s wording it reads as a hit. That discrepancy — not line 177 — is the real finding.

This is **not a Pivot**: nothing in the approved spec is wrong or unviable, and no requirement's meaning changes. It is a tasks-document overreach, and the authority order resolves it — `requirements.md` governs, `tasks.md` implements. **T9 carries this**: when it runs gate (d), it applies the requirement's wording, records that `tasks.md` §2 states a stricter rule than FR-level text supports, and notes that the single hit predates the spec. No task in this spec may edit line 177 on the strength of the stricter phrasing.

---

### T4 — `reviewer.md`: depth bands with effort ceilings

| Field | Value |
|---|---|
| Status | **PASS** |
| Date | 2026-09-19 |
| Implementer attempts | 1 |
| Review rounds | 1 (`PASS` first time) — running total for the spec: 5 of the 10 budgeted |
| Shipped lines | 6 insertions / 5 deletions (estimate was ~6) |
| Requirements covered | FR-6 (category column, effort ceiling per band, categories as depth guidance only, the sub-50-LOC `medium` rule) |
| Concurrency | Ran in a wave of two beside T5, on a disjoint file. Prose only — no shared build output, ports, or dependency tree |

**Files changed:** `.claude/templates/reviewer.md`, and only that file.

#### Attempt 1 — Reviewer `PASS`

*What landed:* the depth-mode table gained a `Category` column and an `Effort ceiling` column, with the three existing LOC bands and their `Mode` text left byte-identical — extended, not replaced. A new bullet beneath states the category column is depth guidance only, never decides whether a review happens, and routes that decision to `/akili-execute` Step 2.3 — *Review intensity*, carrying FR-6's override escape in behavioural form.

*Implementer verification, as reported and as independently re-run by the Leader:* `effort ceiling` 1 · `< 50 LOC` 1 · `50–200 LOC` 1 · `> 200 LOC` 1 · `never decide` 1 · `deterministic` **0** (NFR-2 — the predicate is not restated here) · held-out names **0** (DD-11) · `git diff --numstat 665cd8a -- .claude/templates/reviewer.md` → `6 5`, depth section only.

*Falsifier — executed against the pre-spec baseline `c87187f`, not merely quoted:* `effort ceiling` **0** and the three bands **1 / 1 / 1**, matching the task's predicted readings. So check 1 genuinely fails on the old text, and check 2 would catch a band replaced rather than extended.

*Evidence re-run (FR-3, Leader-inline):* **`VERIFIED`** — all values re-executed independently of the author; all matched.

*`Not Done / Assumptions` returned by the Implementer — carried verbatim:*

> One judgment call, named rather than omitted — FR-6's category table is keyed by task category (trivial/simple/standard/complex) while reviewer.md's existing table is keyed by diff LOC size; the two axes aren't declared 1:1 in the spec text I read. I mapped `< 50 LOC → trivial · simple` (ceiling `medium`, matching FR-6's hard rule verbatim), `50–200 LOC → standard` (ceiling `high`), `> 200 LOC → complex` (ceiling `high or above`) — the most natural alignment given each band's existing Mode description (checklist / full-sweep / parallel-lenses) already mirrors FR-6's Depth column for those same categories. No other gaps.

**The Leader found and named a consequence the Implementer had not:** collapsing `trivial` and `simple` into one band means FR-6's **`trivial → low`** ceiling appears nowhere in the shipped table (`grep -n "low\`"` → no ceiling hit). That is the dropped-obligation shape KZ-changes--gate-falsifiability-2 names, so it was put to the Reviewer as a **named first-class check** with three outcomes left open — conformant, dropped obligation, or the two axes genuinely unmappable as approved (a spec gap for the Pivot Protocol).

*Reviewer verdict:* **`PASS`** — the collapse is conformant, and the `Not Done` is settled rather than deferred.

> SUMMARY: The `trivial → low` collapse is **conformant, not a dropped obligation, and not a spec gap.** The shipped table implements the structure `design.md` §5.5 and T4 mandate, and the ceiling value FR-6's own binding bullet dictates.

Its three grounds, in the order it gave them:

1. **The target artifact is keyed by LOC band by mandate, not by the Implementer's choice.** `design.md` §5.5 reads *"`reviewer.md`'s existing **LOC bands** gain a category column and an **effort ceiling per band**"*, §7.1 row 9 repeats it, and T4's own verification check 2 **requires the three LOC bands to survive** (`1 / 1 / 1`). Under that mandated shape `trivial` and `simple` necessarily share the `< 50 LOC` row and can carry only one ceiling.
2. **FR-6's second bullet is the correspondence the Implementer thought was missing, and it fixes the value.** *"A diff under the existing `< 50 LOC` band SHALL NOT draw an effort above `medium` unless an FR-2 override applies."* FR-6 binds that rule to the **LOC axis separately from** the category table, precisely because the axes are independent — a trivial task need not be sub-50-LOC. `medium` is the verbatim value FR-6 binds to that band, and the only one that also satisfies `simple → medium` in the same row.
3. **FR-6's own scenario ratifies `medium` on the most trivial possible diff.** *"THEN the brief sets `checklist` depth at `low` **or `medium`** effort · BUT NOT … `high` effort."* A one-line diff is the canonical trivial case and the acceptance criterion admits `medium`. **The column is a ceiling: `medium` still permits `low`**, and forbids exactly what the `BUT NOT` clause forbids. Nothing FR-6 can falsify is lost.

*Disqualifier, read rather than counted:* no category is given power to decide whether a review runs. The new bullet asserts the negative explicitly and routes the decision to its named owner. DD-2 holds.

*Surviving neighbours (KZ-changes--leader-brief-contract-1), checked line by line:* the *"excellent eight-hundred-line review of a twenty-eight-line diff"* warning and *"Thoroughness is not a constant to maximize; it is a budget to spend where the risk is"* now read as the **rationale for** the ceiling column rather than against it. The Reviewer also checked the persona's line 7 — *"default effort `high` — do not skim"* — and ruled it a **default** cleanly subordinated by a band **ceiling** the new bullet makes overridable, noting that its own spawn (effort `high` on an 11-line diff under override (a)) is that reading in action.

*`ADVISORY`:* suppressed per the `< 50 LOC` band rule; no lens finding rose to a spec violation.

*Runtime events:* none.

#### Decisions made

| Decision | Reason |
|---|---|
| The `trivial → low` consequence was **named by the Leader and routed to the Reviewer**, not raised with the Implementer or resolved inline | The Implementer named the axis-mapping judgment but not its sharpest consequence. Whether a requirement's content ships is a conformance question for the auditor; resolving it inline would have been the Leader ruling on work it supervised |
| A **spec gap / Pivot was explicitly offered and declined** on the Reviewer's ruling | The brief left "the two axes are genuinely unmappable as approved" open as an outcome. The Reviewer found the correspondence stated in FR-6's second bullet and design §5.5, so no rule needed inventing and the loop continued |
| Implementer ran at **T2 `sonnet`, effort `medium`** — a step below the `high` used on T1/T2 | Size S, a single table edit against a complete requirement. The effort dial is meant to track task difficulty rather than default upward; this is the spec's own FR-6 discipline applied to its own execution |

#### Final verification result

All four task checks green, re-run independently by the Leader (`VERIFIED`). Falsifier executed against `c87187f` with the predicted baseline readings observed. Disqualifier read rather than counted. Reviewer `PASS` on the first attempt, with the `Not Done` question settled on the record.

---

### T5 — `/akili-specify`: the `Review` field and the Verification Checklist

| Field | Value |
|---|---|
| Status | **PASS** |
| Date | 2026-09-19 |
| Implementer attempts | 2 |
| Review rounds | 2 (one `FAIL`, one `PASS`) — running total for the spec: 7 of the 10 budgeted |
| Shipped lines | 3 insertions (estimate was ~10) |
| Requirements covered | FR-5 **as amended during execution** (four values, one-line reason, `skip-eligible` as a claim, absent-value, the skip list visible at the Step 3.3 gate via **both** sites), FR-10 |
| Scope | **Extended during execution from two bullets to three, with the user's explicit approval** — see *Decisions made* |
| Concurrency | Attempt 1 ran in a wave of two beside T4; attempt 2 beside T3. Disjoint files, prose only |

**Files changed:** `.claude/commands/akili-specify.md`, and only that file. The spec documents were amended separately by the Leader.

#### Attempt 1 — Reviewer `FAIL`

*What landed:* the `Review` field entry in the Step 3.2 task-field list and one Verification Checklist item. Two insertions.

*Implementer verification, as reported and as independently re-run by the Leader:* `skip-eligible` 2 · `Review intensity` 1 · `deterministic` **0** (NFR-2) · the four values on one line · pre-review sweep `grep -n "verification fields"` returning two hits, both still reading "verification fields" / "four verification fields" — **`Review` was not folded into that four-item set**, which was this task's main trap.

*Falsifiability-block identity (NFR-1) — the Leader verified this independently rather than accepting the report*, extracting the block **by content rather than by fixed line numbers** (the Implementer's edits shift line numbers, which a fixed-range check would silently mis-compare): 8 lines at `c87187f` and 8 in the working tree, **byte-identical**. The Leader also confirmed the check is **not inert** by mutating one character on a scratch copy and observing the diff turn red; the Implementer independently demonstrated the same red.

*Evidence re-run (FR-3, Leader-inline):* **`VERIFIED`**.

*Reviewer verdict:* **`FAIL`**, two issues.

> 1. **Discovered Issue:** The absent-value clause — *"A task with no `Review` field is treated as `checklist` — today's behavior, unchanged"* — states a **per-task** rule and attaches an **existence** guarantee to a **depth** default. `requirements.md` §3 defines a depth band as *"How deep a review goes when one runs"*, and FR-6 states *"Categories SHALL be depth guidance only; they SHALL NOT decide whether a review happens — FR-1 does."* Under the T1 block, the predicate is evaluated *"against the Implementer's actual report — never against the task's `Review` field or the plan"*. So inside a `tasks.md` that carries the field, a fieldless task defaulting to `checklist` is still subject to the predicate and can be skipped. "Today's behavior, unchanged" — today every task gets a Reviewer — is therefore false at task granularity. FR-5's own wording is safe only because it is scoped to whole specs: *"no spec written before this change loses its review"*; the implementer dropped that scoping clause and kept the behavioral claim. **This is the same depth-vs-existence conflation that already produced one FAIL on this spec.**
>     *   **Violated Rule:** `requirements.md` FR-6 bullet 1 and §3 *Depth band*; FR-10 bullet 1; FR-5 absent-value bullet read whole.
>     *   **Remediation Suggestion:** Split the two claims and match T1's granularity. Do not let `checklist` imply a review is guaranteed.
>
> 2. **Discovered Issue:** The new Verification Checklist item is the only mechanism delivering the skip list, but the checklist runs **after** the gate it names: Step 3.3 option 1 reads *"Continue (Proceed to the final Verification Checklist)"*, and the checklist opens *"After all three documents are approved, verify:"*. Step 3.3's *"Present a clear summary … including:"* list was not amended, so nothing makes Step 3.3 name the `skip-eligible` tasks. A post-gate checklist item can only detect afterwards that the user was not shown the list — it cannot satisfy FR-5's scenario clauses `THEN both tasks are named with their reasons`, `AND the user can reject the classification at that gate`, `BUT it must NOT be presented only inside the document`. **The presence of the item is not proof of the effect.**
>     *   **Violated Rule:** `requirements.md` FR-5, scenario *The user sees the skip list before execution*, all three clauses; `design.md` §5.6.
>     *   **Remediation Suggestion:** Keep the checklist item, and add the skip list to Step 3.3's presentation bullets — the same mechanism this file already uses at Step 2.5 for the Premise Ledger (*"a row that stays inside the document is a row the user cannot correct"*). **Step 3.3 is outside T5's two stated scope bullets, so the Leader should confirm the scope extension rather than the Implementer widening it unilaterally.**

*Runtime events:* none.

#### The execute-time spec amendment (between attempts)

The Leader verified Issue 2's ordering claim at the source before acting: `akili-specify.md` Step 3.3's Continue option (line 437) reads *"Proceed to the final Verification Checklist"*, and the checklist opens at line 457 with *"After all three documents are approved, verify:"*. **The checklist provably runs after the gate it was supposed to guard**, so the mechanism named by FR-5 and design §5.6 could not deliver the scenario those same documents require.

This was **put to the user as a scope decision**, with three options: correct the mechanism, run a formal Pivot, or ship only Issue 1 and record FR-5's scenario as undelivered. **The user chose to correct the mechanism.** The Leader then amended, with the two-direction *Correction Closure* sweep run before and after:

| Document | Amendment |
|---|---|
| `requirements.md` FR-5 | the bullet now requires **two sites, both required** — Step 3.3's presentation list **and** a matching checklist item — with the reason recorded inline and dated |
| `requirements.md` §4 scope table, §9 index | now name the Step 3.3 presentation list |
| `design.md` §5.6, §3, §4, §7.1 row 11, §7.2 | the same correction at all five citing sites |
| `tasks.md` T5 | scope gains the Step 3.3 bullet; verification check 1 raised from ≥ 2 to ≥ 3 |

The **backward sweep** (references *to* FR-5 and §5.6) and the **forward sweep** (the superseded "the checklist surfaces the skip list" framing) were both run; the forward sweep after amending returns no surviving instance of the superseded framing. `proposal.md` was deliberately left unamended — it records what was proposed at the time, and rewriting an approved proposal after the fact would falsify the history the spec folder exists to preserve.

#### Attempt 2 — Reviewer `PASS`

*What landed:* three passages — the field entry rewritten to separate the depth default from the existence guarantee; a **new Step 3.3 presentation bullet**; and the checklist item's tense shifted to past so it confirms delivery rather than substituting for it.

*Implementer verification, as reported and as independently re-run by the Leader:* `skip-eligible` **3** · `Review intensity` 1 · `deterministic` **0** · `git diff --stat` → 3 insertions, one file · Falsifiability block **byte-identical**, verified by the Leader by content extraction, with the Implementer's executed scratch-copy mutation observed red.

*Ordering proof, re-run by the Leader:* `#### Step 3.3` at 428 · the new bullet at **434** · `Then explicitly ask the user how to proceed` at **436**. The bullet sits inside the presentation list, above the gate question — it executes before the user is asked.

*Evidence re-run (FR-3, Leader-inline):* **`VERIFIED`**.

*Reviewer verdict:* **`PASS`** — both issues closed, and the amendment ruled an edit-carry rather than a Pivot.

> **Ruling on the amendment — edit-carry, not a Pivot.** The obligation is unchanged. … the same sentence, with the binding to a single delivery site lifted and replaced by two named sites. What changed is which surface carries it; what is owed to the user is identical. The scenario — the only statement of the required user-observable outcome — is **byte-for-byte unchanged**, including all three clauses. §5.6 and §7.1 row 11 track the same correction and cite the same reason. … Nothing in the amendment relaxes, narrows, or adds an obligation, so the loop does not need to stop.

On Issue 2 it walked each scenario clause to its delivering text, and credited a clause the brief had not asked for: *"State plainly when no task is `skip-eligible`"* **closes the silent-omission reading**, where an empty list and an omitted list would otherwise look identical to the user.

*`ADVISORY`:* none.

*Runtime events:* none.

#### Decisions made

| Decision | Reason |
|---|---|
| **Scope extended from two bullets to three — escalated to the user, not decided by the Leader** | `AGENTS.md`'s *Scope only grows through approval* binds the Leader exactly as it binds an Implementer. The Reviewer explicitly routed the question rather than letting the Implementer widen unilaterally, which was correct; the Leader verified the factual claim at the source, then put the decision to the user with three options and a recommendation |
| **Treated as an edit-carry, not a Pivot** — confirmed by the Reviewer, not assumed by the Leader | The boundary is whether an approved requirement's **meaning** changes. FR-5's obligation and its scenario are unchanged; only the named delivery mechanism was corrected, because the original mechanism provably could not execute before the gate it named. The Reviewer was asked to overturn this reading if it disagreed, and independently confirmed it |
| The Falsifiability-block identity check was re-run by the Leader **by content extraction rather than the task's fixed `sed` range** | The task's stated check uses a `sed` range, but this task's own edits shift line numbers — a fixed range would compare misaligned text and could pass while the block had changed, or fail while it had not. Extracting by content is the same check made robust, not a different check |
| `proposal.md` left unamended during the correction sweep | It records what was proposed at the time. Amending it after approval would rewrite history rather than correct a forward-looking document |
| Implementer stayed on **T2 `sonnet`** for both attempts; effort `high` → `xhigh` | Registry default, no tier escalation. The effort dial carried the retry |

#### Final verification result

All six checks green on attempt 2, re-run independently by the Leader (`VERIFIED` both attempts). NFR-1's Falsifiability-block identity verified by content extraction and demonstrated non-inert by mutation, twice independently. Ordering proof re-run by the Leader. Disqualifier read rather than counted: `skip-eligible` is phrased as a claim, never a decision (DD-7 holds), and the Step 3.3 bullet names the tasks with their reasons rather than merely mentioning review intensities. Reviewer `PASS` on attempt 2.

---

### T3 — `leader.md`: the amended collapse paragraph, thresholds, model and effort recording

| Field | Value |
|---|---|
| Status | **PASS** — parked at the tripwire, released by the user, reworked and closed |
| Date | 2026-09-19 |
| Implementer attempts | 2 of 3 |
| Review rounds | 2 (one `FAIL`, one `PASS`) — running total for the spec: **10 of the 10 budgeted** |
| Working tree | attempt 1's edit was **left in place** through the pause — this was never a HALT, so the Step 4 rollback did not apply and nothing was restored. Attempt 2 built on it |

**Why parked:** the spec crossed its `design.md` §13 budget tripwire on review rounds while this task was in its loop. The tripwire requires stopping and escalating to the user rather than continuing on the assumption that finishing is what was wanted. The rework is one line and the Reviewer has already supplied the wording, so this is cheap to resume — it is held for the user's ruling, not because it is hard.

#### Attempt 1 — Reviewer `FAIL`

*What landed:* the *Reviewer is not self-verification* paragraph amended in place, and one new bullet in *Delegation Discipline*. 2 insertions, 1 deletion.

*Implementer verification, as reported and as independently re-run by the Leader:* `never collapse it` **1** · `I already verified this` **1** · `Review intensity` **1** · `deterministic` **0** (NFR-2) · held-out names **0** (DD-11) · `git diff --stat` → 2 insertions, 1 deletion.

*Check 4, run by the Leader:* `git diff -U0 c87187f -- .claude/templates/leader.md | grep "^-"` returns exactly **one** removed line — the original paragraph being amended in place. **No `-` line touches a *Delegation Thresholds* table row.**

*Falsifier — executed against the pre-spec baseline `c87187f` by both the Implementer and the Leader:* `never collapse it` **1**, `I already verified this` **1**, `Review intensity` **0** — matching the task's predicted readings, so checks 1–2 would detect a deletion and check 3 genuinely fails on the old text.

*Evidence re-run (FR-3, Leader-inline):* **`VERIFIED`**.

*Reviewer verdict:* **`FAIL`**, one issue. **The paragraph — the hard part, and the only part that removes shipped behavior — passed in full.** The failure is in the smaller second bullet.

> 1. **Discovered Issue:** `.claude/templates/leader.md:25` — "or to a higher effort than the task's default". No `Effort` field exists on a task: `grep -n "Effort" .claude/commands/akili-specify.md` returns **zero** hits, so Step 3.2 defines no per-task effort default. The only default in the methodology is the *next bullet's* (`leader.md:26`) "Default `medium` for a T2 Implementer, then flex by the task's difficulty: `low`… `xhigh`… `max`". Under that neighbour the effort the Leader assigns *is* the task's effort, so nothing can exceed "the task's default" and the clause can never fire; under the other reading (`medium`) the term is simply undefined. Either way a normative recording obligation ("is recorded in `execution.md`") has a trigger that cannot be evaluated. This is the surviving-neighbour class KZ-changes--leader-brief-contract-1 names — the contradicting neighbour is one line below and every grep is green. It also diverges from the task's own Scope, which binds recording to a **single** trigger ("records its Implementer model and effort choice with a one-line reason **when it escalates above T2**"), not to two independent ones.
>     *   **Violated Rule:** `tasks.md` §T3 Scope bullet 2; `requirements.md` FR-7 bullet 1 ("any escalation above it SHALL be recorded"); `design.md` §7.1 row 8.
>     *   **Remediation Suggestion:** Bind the clause to the one trigger the spec states, e.g. "Any escalation above it — a heavier tier — is recorded in `execution.md` with a one-line reason naming the tier **and the effort** chosen, in the same shape…". If the effort trigger is kept deliberately, name the referent explicitly (`above the `medium` default in the bullet below`) so it is evaluable.

**The Leader verified the finding's factual core independently before accepting it:** `grep -c -i "effort" .claude/commands/akili-specify.md` → **0**, and the contradicting bullet is one line below the clause. Confirmed.

*The Reviewer's rulings on the four questions that passed:*

1. **Order holds.** The prohibition runs unbroken to *"Spawn it."*, every baseline word survives byte-identical and in position, the lead-in is additive, and **the paragraph ends on prohibition again** (*"You may never lower it below what that block requires, whatever the time or context pressure"*) — so the permission is bracketed by prohibition on both sides. No retroactive reframing.
2. **Both halves still do their original jobs, not vestigial.** *"never collapse it"* remains the topic sentence governing the paragraph; *"I already verified this"* is still followed by *"Spawn it."* and is then **re-armed** by the new text (*"it is not the rationalization above wearing a new name"*), which strengthens rather than dilutes it.
3. **Genuinely a third act, not an exception.** Both grounds stated and distinct — not efficiency (*"earned its closure by proving itself, not by your say-so"*), and not the rationalization renamed (*"never the Leader's own judgment… the block's own conditions do, evaluated against the report, not the plan"*). Matches DD-8 and §12.
4. **FR-8 — three of three bullets ship**, and the scenario's `BUT NOT` is unambiguous: the permission is conditioned on the block's conditions *and* no override, so a predicate-failing task falls under the surviving prohibition.

*Pre-review sweep — confirmed by the Reviewer:* the amendment does not contradict *"Never delegate your own verification"* (own-reasoning re-check versus whether an audit of someone else's diff is owed), and the *Delegation Thresholds* row *"Review of a diff / PR → Fresh-context Reviewer"* survives intact — it governs **how** a review is delegated, not **whether** one is owed, and remains true wherever a review runs.

*`ADVISORY`:* none — deliberately suppressed under the `< 50 LOC` band rule, not lost. Two items the Reviewer would otherwise have logged were folded into the verdict body as **rulings** rather than findings: the loose antecedent of *"these two"* (ruled not a violation) and the *Delegation Thresholds* row 5 reading (ruled intact).

*Runtime events:* the verdict was truncated in delivery; the remainder was requested and supplied verbatim, with no re-audit.

#### Decisions made

| Decision | Reason |
|---|---|
| **Attempt 2 was not dispatched** | The budget tripwire fired while this task was mid-loop. The rule is to stop and escalate with the delta and the cause, not to continue on the assumption that finishing is what was wanted |
| The task is marked **`[~]`, and attempt 1's edit is left in the working tree** | This is a pause for a user decision, not a HALT after three failures. Step 4's rollback is scoped to a HALT; reverting good work — the amended paragraph passed in full — would destroy the expensive part of this task to save nothing |
| The Reviewer's factual claim was **re-verified by the Leader** before being accepted into the record | A FAIL that rests on a negative-existence claim ("no such field exists") is exactly the kind that is cheap to check and costly to take on trust |

#### Outstanding on resume

One line: bind the recording clause to the single trigger the spec states (escalation above T2), naming the effort chosen rather than treating effort as a second independent trigger. The Reviewer's suggested wording is in Issue 1 above. Attempts remaining: 2 of 3.

#### Attempt 2 — Reviewer `PASS` (dispatched after the user released the run)

*What landed:* one bullet rewritten. The invented second trigger is removed and effort moves **inside** the record rather than acting as its own firing condition:

> **The Implementer defaults to the registry's T2.** Any escalation above it — to a heavier tier — is recorded in `execution.md` with a one-line reason naming the model and the effort chosen, in the same shape skill deviations are recorded in the bullet above.

*Implementer verification, as reported and as independently re-run by the Leader:* `never collapse it` **1** · `I already verified this` **1** · `Review intensity` **1** · `deterministic` **0** · **`task's default` 0** — the unevaluable term is gone · `git diff --stat` → 2 insertions, 1 deletion · the only removed line is still the collapse paragraph amended in place, no *Delegation Thresholds* row touched.

*Evidence re-run (FR-3, Leader-inline):* **`VERIFIED`**. The Reviewer additionally re-ran every check itself rather than accepting either report.

*Reviewer verdict:* **`PASS`**.

> SUMMARY: Attempt 2 fixes Issue 1 exactly and touches nothing else. The recording obligation now fires on an event a literal reader can check, sits coherently beside line 26, and carries FR-7 bullet 1 in full without under-delivering.

Its three rulings:

1. **The trigger is evaluable.** *"Any escalation above it — to a heavier tier —"* names one concrete, observable event, with its referent external to this file (`docs/model-routing.md` defines the tiers by role) and the appositive pinning the direction so *"above"* cannot be misread as a higher numeral. Unlike attempt 1, the test is a fact known at spawn time rather than a comparison against a quantity the adjacent bullet is simultaneously setting.
2. **It now interlocks with line 26 rather than merely coexisting** — and this is where attempt 2 is genuinely better, not just inert-free. Line 26 keeps full latitude over effort (*"orthogonal to the tier"*); line 25 makes no claim about *when* effort must be justified, only that the chosen effort is named inside the record once a tier escalation has fired it. The Reviewer found the interlock the Leader had not: line 26's closing rule — *"Don't `max` a cheaper tier — if a task wants `max`, escalate the tier instead"* — **prescribes exactly the escalation line 25 requires to be recorded**, so a `max`-worthy task produces a tier bump *and* its record, with the motivating effort named in the same line.
3. **Nothing was lost narrowing to one trigger.** FR-7 bullet 1's three parts all ship: the T2 default is stated; *"any escalation above it"* is carried (T2 **is** a tier, and line 26 declares effort *"orthogonal to the tier"*, so effort was never inside FR-7's *"above it"* to begin with); and *"in the same way skill deviations are recorded today"* is carried both by reference and by mechanism. The effort naming is the task Scope's own addition, sitting where Scope puts it — in the record, behind the single trigger.

*`ADVISORY`:* none — suppressed under the `< 50 LOC` band.

*Runtime events:* none.

#### Final verification result

All six checks green on attempt 2 — the task's five plus the check the FAIL itself added (`task's default` → 0) — re-run independently by both the Leader and the Reviewer. Baseline falsifier readings executed against `c87187f` on both attempts. Disqualifier read rather than counted: the prohibition still precedes the permission, both surviving halves remain at exactly 1, and the amended paragraph was confirmed byte-unchanged from the attempt that passed it.

---

### T7 — `/akili-resume` and `kaizen`: downstream consumers of the closure state

| Field | Value |
|---|---|
| Status | **PASS** — parked before review at the tripwire, released by the user, audited and closed |
| Date | 2026-09-19 |
| Implementer attempts | 1 (complete, not yet audited) |
| Review rounds | 1 (`PASS` first time, dispatched after the user released the run) — running total for the spec: 9 |
| Shipped lines | 6 insertions / 1 deletion across two files (estimate was ~12) |
| Working tree | both edits **left in place, uncommitted** |

**Why parked:** the tripwire had already fired when this Implementer reported. Dispatching its Reviewer would spend round 9 of a 10-round budget on a decision the user has not yet made. The work is finished and independently re-verified; only the audit is held.

#### Attempt 1 — Implementer complete, Reviewer not dispatched

*What landed:* `/akili-resume` gains a `REVIEW_SKIPPED` closed-task reporting bullet mirroring the `REVIEW_WAIVED` exemplar. `kaizen/SKILL.md` gains a `REVIEW_SKIPPED` Measure row, an escaped-defect Measure row, the clean-run predicate clause, and the matching report-template rows.

*Implementer verification, as reported and as independently re-run by the Leader:* `REVIEW_SKIPPED` in `akili-resume.md` **1** · in `kaizen/SKILL.md` **4** · `escaped defect` **3** · `REVIEW_WAIVED` **3** (unchanged — the waiver rows were added beside, never replaced) · `git diff --stat` → 6 insertions, 1 deletion across exactly the two files in scope.

*Evidence re-run (FR-3, Leader-inline):* **`VERIFIED`** — every value matched.

*Falsifier — executed as a two-direction case walk, which is what this task's check 4 actually demands.* The Implementer took a concrete scenario — task T-5 closes under `REVIEW_SKIPPED`, a defect traced to it later surfaces at `/akili-validate`, every other signal clean — and ran it through both texts:

| Predicate | Classification |
|---|---|
| **Pre-edit** (keyed only to rework, pivots, product bugs, severe findings, waiver flags) | **CLEAN** — the predicate never mentions skips or escaped defects, so every listed condition holds. Phases 2–3 skipped; the retrospective that should have caught this never runs |
| **Amended** | **NOT CLEAN** — the added clause fails for T-5. Learn and Standardize proceed, and the escaped defect is measured |

The two answers differ, which is what makes this an executed falsifier rather than a quoted one. The Implementer also confirmed the conjunction is scoped correctly: a `REVIEW_SKIPPED` task with **no** escaped defect against it still reads clean, and it added an explicit sentence saying so — skipping alone is routine and must not by itself break the clean read.

*`Not Done / Assumptions` returned — carried verbatim:*

> One judgment call: FR-4's bullet says `/akili-resume` reports the skip "with its predicate basis." The `REVIEW_SKIPPED` record has four fields — I read "predicate basis" as the first field's short form for a one-line dashboard entry (matching the `REVIEW_WAIVED` exemplar's compactness, which shows only the `flag`, not all five of its fields), not as a demand to print all four fields inline.

**Leader ruling: reasonable, and consistent with the exemplar the task named.** `/akili-resume` produces a dashboard briefing, not an audit dump, and the waiver bullet it mirrors prints one field. Left as written; the Reviewer may still overturn it when the audit runs.

#### ⚠️ Finding that falsifies a verified premise — a sixteenth surface is needed

The brief asked the Implementer to **confirm rather than assume** design §7.2's claim that `/akili-archive` *holds*. It did not hold. The Leader re-read the line independently and confirms the finding.

`design.md` §7.2 states: *"`akili-archive.md:151` | 'Extract the improvement signals listed in **the skill's** Measure table' | **holds** — it cites the table rather than restating it."* Premise Ledger **P-7** records the same claim as `existence`-class and **verified at `a909216`**, quoting that same opening clause.

The actual line, read whole:

> Extract the improvement signals listed in the skill's Measure table from the spec's own evidence: Reviewer FAIL rework attempts, HALTs and FATAL_FAILs, `## Pivot Record` blocks, PRODUCT_BUG findings, severe judgment-day findings, validation FAIL/WARN counts, `/akili-quick` escalations, **tasks closed under `REVIEW_WAIVED` (by flag)**, and drift attributable to this spec.

It cites the table **and then enumerates it**. The premise was verified by reading the first clause and stopping before the colon — precisely the failure mode this repo's standing lesson **KZ-001** names: *"when pinning a source, read it past the section you came for — the costliest review FAIL class is a claim contradicted elsewhere in its own pinned source."*

**Consequence, which P-7 itself already wrote:** *"If false → A sixteenth surface is needed — Low."* That line now enumerates `REVIEW_WAIVED` while omitting the `REVIEW_SKIPPED` and escaped-defect rows this task just added, so `/akili-archive` will extract a stale signal set.

**Not fixed, and deliberately so.** `/akili-archive.md` is in no task's scope in this spec — it is not in `requirements.md` §4, not in design §4 or §7.1, and not in any task. Fixing it here would be scope the user never approved, and the *Advisory Never Becomes A Task* rule forbids minting work from a finding inside a running spec. **This goes to the user as a spec gap**, together with the tripwire decision. It is small — one line, adding two signal names — but it is new scope and P-7 must be corrected from `verified` to `refuted`.

#### Decisions made

| Decision | Reason |
|---|---|
| **The Reviewer was not dispatched** | The tripwire had already fired. Auditing would spend a budgeted round against a decision the user has not made |
| The `/akili-archive` gap is **reported, not fixed** | Out of every approved scope surface. The route from finding to new work runs through the user, not through a Leader widening a task |
| The Implementer's *"predicate basis"* reading was **accepted by the Leader**, subject to the pending audit | It matches the `REVIEW_WAIVED` exemplar the task named, and `/akili-resume` is a dashboard rather than an audit surface |
| **Leader error — a second mis-specified brief check.** The brief asserted `grep -c "deterministic"` should be **0** in both files; it is **1** in `kaizen/SKILL.md` | The hit is pre-existing, unrelated text (*"one deterministic order"*, about lexical filename ordering in Apply Mode), and the baseline at `c87187f` is **1** as well — confirmed by the Leader. This is the same error class as the mis-specified held-out check in T2: a Leader-added check asserting an absolute value that pre-existing text already violates, and again untagged as advisory-grade. The Implementer flagged it rather than silently passing or editing out-of-scope text, which is correct on both counts |

#### Outstanding on resume

The Reviewer audit, unstarted. Attempts remaining: 3 of 3 — none consumed.

#### Review — dispatched after the user released the run

The user was presented with the tripwire delta and chose to continue and accept the overrun. The Reviewer was dispatched then, not before.

*Reviewer verdict:* **`PASS`**, first time, no issues.

> SUMMARY: Both edits satisfy FR-4's `/akili-resume` bullet and FR-9's three obligations, and the amended clean-run predicate survives the disqualifier: no run containing an escaped defect reads clean. Waiver rows and the surviving "a clean spec teaches nothing new" sentence are intact; nothing merges the two records.

**On the hardest question — an escaped defect in a task that *was* fully reviewed.** The brief asked whether keying the clause to *"any task carrying a `REVIEW_SKIPPED` record"* leaves a hole. The Reviewer ruled the narrow keying **correct**, on three grounds:

1. `requirements.md` §3 defines *escaped defect* as occurring *"in a task that skipped its conformance review"* — under that definition the term **cannot denote** a defect in a reviewed task, so naming the record loses nothing.
2. FR-9's own sentence is scoped the same way — *"a skipped task with an escaped defect."*
3. **There is no resulting hole in the predicate.** A later-found defect in a reviewed task still fails an existing conjunct: at `/akili-test` it is a `PRODUCT_BUG`, at `/akili-validate` a validation FAIL/WARN — both already Measure rows and both already in the conjunction.

Widening the clause would have been an unrequested redefinition of a §3 glossary term. The Reviewer also ruled that *"carrying a `REVIEW_SKIPPED` record"* does not silently annex `REVIEW_WAIVED` tasks — correct, since §3 distinguishes *never owed* from *owed and lost*, and the waiver keeps its own conjunct keyed to `inline`/`same-model`.

**On the escaped-defect Measure row (§3, term for term):** all five finding locations reproduced in §3's order with the skipped-task qualifier kept, and the Source column mapping 1:1 onto them. Nothing dropped, nothing added; the `(§3)` label points back at the definition rather than forking it.

**On NFR-3:** nothing sums skips and waivers — two adjacent but separate Measure rows, separately greppable labels, separate template rows, two separate conjuncts in the predicate. No metric is phrased as "tasks without a Reviewer `PASS`", the anti-pattern FR-4's scenario forbids.

**On FR-4's `/akili-resume` bullet — the Implementer's judgment call is upheld**, and on better grounds than the Leader's provisional acceptance. The deciding text is FR-4's own qualifier: report the skip *"with its predicate basis, **exactly as it reports a waiver**"*. The waiver line prints one element of a five-field record, so *exactly as* **mandates** the compact parallel form rather than merely permitting it. The Reviewer added a distinction the Leader had not drawn: *"predicate basis" is not "the record's four fields" — the fields are what FR-4's table says the record contains; the basis is what made the gate not owed.* The shipped exemplar carries exactly that. It also confirmed line 49 is the file's **only** closure-state enumeration, so no second site omits the new state.

*`ADVISORY`:* none — suppressed under the `< 50 LOC` band.

*Runtime events:* none. This verdict arrived complete — the first on this spec not to be truncated.

#### Final verification result

All five task checks green, re-run independently by the Leader (`VERIFIED`). The clean-run falsifier executed as a two-direction case walk with the classification flipping CLEAN → NOT CLEAN. Disqualifier read rather than counted. Reviewer `PASS` on the first attempt, with the Implementer's one judgment call upheld on the requirement's own text. **The `/akili-archive` premise refutation recorded above remains open and belongs to the user, not to this task.**

---

### T6 — `/akili-constitution` Step 7 item 3: the template description names the `Review` field

| Field | Value |
|---|---|
| Status | **PASS** |
| Date | 2026-09-19 |
| Implementer attempts | 1 |
| Review rounds | 1 (`PASS` first time) — running total for the spec: 11 |
| Shipped lines | 1 line replaced (`numstat` exactly `1  1`; estimate was ~1) |
| Requirements covered | FR-5 (constitution half), NFR-2 |
| `Review` field as planned | **`skip-eligible`** — the one task in this spec carrying that claim |
| **Predicate outcome** | **NOT EARNED — a conformance Reviewer was owed and ran.** See the walk below |

**Files changed:** `.claude/commands/akili-constitution.md`, line 309 only.

#### The predicate walk — this spec's own rule, applied to its own task

This is the task the spec designated as its live test of FR-1. The Leader walked the four conditions against the **Implementer's actual report**, never against the plan (DD-7).

| # | Condition | Verdict |
|---|---|---|
| 1 | `Falsifier` executed against post-change code, gate observed **red**, command and red output recorded | ✅ **PASS** — baseline at `c87187f` read `Review` **0** in the item-3 line and `skip-eligible` **0** file-wide, both observed red; the `numstat` mutation on a scratch copy moved the reading from `1  1` to **`2  2`** |
| 2 | Verification fully deterministic; **the task's `Disqualifier` names no read or judgment** | ❌ **FAIL** |
| 3 | `Consumers` reads `none` | ✅ **PASS** — *"none (no shared symbol changed)"* |
| 4 | No override applies | moot — condition 2 already failed |

**Condition 2 fails on the task's own `Disqualifier`**, quoted verbatim from `tasks.md`:

> A clause that says "a review field" without naming `/akili-specify` Step 3.2 cites nothing — check 1 catches the name but **read it** to confirm the citation. If the clause restates the four values' meaning rather than naming them, NFR-2 is violated

It names a read. FR-1 condition 2 excludes exactly that.

**Outcome: the `skip-eligible` claim was not earned, and a conformance Reviewer was spawned** — which is FR-1's third scenario (*Plan says skip, report does not earn it*) executing as written: *"THEN the Leader spawns a conformance Reviewer and records that the predicted skip was not earned … BUT it must NOT be recorded as a `REVIEW_SKIPPED`."* No `REVIEW_SKIPPED` record was written for T6. **Per DD-12 the mismatch is reported at the continue gate**, and it was.

**This is not an Implementer failure.** The Implementer executed the falsifier properly and recorded its red — condition 1, the expensive condition, passed. The claim failed on a property of the *task text*, fixed at specify time.

**Note on how this run treated the rule.** The Leader did **not** use the shipped predicate to skip a review in the run that writes it: the command executing is the one loaded at session start, and the block's own consumers (the mirrors) were unwritten. The predicate was walked and **recorded** rather than acted on. In the event it independently demanded the review the Leader was going to run anyway, so the two never conflicted — but the order of reasoning matters for the audit trail, and the walk stands as evidence for T9 rather than as a decision.

#### Attempt 1 — Reviewer `PASS`

*What landed:* one line. The item-3 description gains a clause naming the `Review` field with its four values and citing `/akili-specify` Step 3.2 for its absent-value rule, in the same shape the sentence already uses for the four Verification fields.

*Implementer verification, as reported and as independently re-run by the Leader:* `Review` in line 309 **1** · `skip-eligible` file-wide **1** (the clause is the only mention) · `git diff --numstat c87187f` exactly **`1  1`** · `deterministic` **0** · one file modified.

*Evidence re-run (FR-3, Leader-inline):* **`VERIFIED`**.

*Reviewer verdict:* **`PASS`**, first time, no issues.

> SUMMARY: The shipped clause on line 309 names the `Review` field, cites `/akili-specify` Step 3.2 — where the field is in fact defined … enumerates the four values without restating their meaning, and defers the absent-value rule rather than duplicating it, so NFR-2 holds.

The Reviewer re-ran the gate itself and added a precision the brief had not asked for: the citation names **Step 3.2 plainly rather than its *Falsifiability* block**, which is correct, since `Review` sits in the field list and not in that block.

*`ADVISORY`:* suppressed per the `< 50 LOC` band.

*Runtime events:* none.

#### Observation from the review — recorded here and going no further

The Leader asked the Reviewer whether a `Disqualifier` demanding a read makes `skip-eligible` unreachable **by construction**. It **corrected the framing**:

> the two are **not** mutually exclusive by construction … a task can legitimately carry a purely mechanical `Disqualifier` ("the grep count is not 1") alongside `skip-eligible`; the predicate then clears. What is true is narrower … `/akili-specify` Step 3.2 defines `skip-eligible` as a claim proved at execute time but imposes **no authoring constraint tying the classification to the `Disqualifier` it is written next to**. T6's contradiction … was fully determinable at specify time from two adjacent fields in the same task table, and nothing looked. The execute-time refusal is the system working, but it is working late: the cost is a spawned review that the spec author could have avoided by writing `checklist`.

Its suggested remedy — a one-line authoring check in Step 3.2, *"a task may be classified `skip-eligible` only if its `Disqualifier` names no read or judgment (FR-1 condition 2)"*, citing FR-1 rather than restating it.

**The Reviewer called this "a candidate task for this spec". It is declined as such, and the reason is a rule, not a preference.** *Advisory Never Becomes A Task*: a finding surfaced during a run may not mint a task inside that run, and no existing task may be widened to absorb it. It carries no requirement, no design decision and no budget line, and it arrives with less vetting than the approved work. The route from here runs **out** of this spec — recorded, carried to the closure gate and the retrospective, and the user decides whether it earns a proposal. **T8 will not absorb it.**

#### Decisions made

| Decision | Reason |
|---|---|
| The predicate was **walked and recorded, not acted on** | The rule is not in force for the run that writes it; the executing command is the one loaded at session start and the block's consumers were still unwritten. Acting on a rule mid-construction is the shortcut this spec exists to prevent |
| **No `REVIEW_SKIPPED` record written for T6** | The claim was not earned. FR-1's third scenario is explicit: *"BUT it must NOT be recorded as a `REVIEW_SKIPPED`"* |
| The mismatch was **reported at the continue gate** | DD-12 — the mismatch rate is what FR-9's trial argues from, so it surfaces regardless of approval mode |
| The Reviewer's Step 3.2 suggestion is **recorded, not implemented** | *Advisory Never Becomes A Task*. It goes to the user as a candidate proposal, outside this spec |
| Implementer ran at **T2 `sonnet`, effort `low`** — the cheapest spawn of the run | One mechanical line against a complete spec. No tier escalation, so nothing to record under the rule T3 just shipped |

#### Final verification result

All four checks green, re-run independently by the Leader (`VERIFIED`). Falsifier executed with red observed on both paths — the baseline readings and the `numstat` mutation. Disqualifier read rather than counted, by the Implementer and again by the Reviewer. Reviewer `PASS` on the first attempt. **The predicate's verdict for this task was `review required`, and it is recorded as evidence for T9's inert and refutation tests: the predicate declined to qualify a task its own author had predicted would qualify.**

---

### T8 — Mirrors, `docs/model-routing.md`, CHANGELOG, and the `/akili-archive` signal list

| Field | Value |
|---|---|
| Status | **PASS** |
| Date | 2026-09-19 |
| Implementer attempts | 1 |
| Review rounds | 1 (`PASS` first time) — running total for the spec: 12 |
| Shipped lines | 56 insertions / 20 deletions across 10 files (estimate was ~30, before the scope grew) |
| Requirements covered | FR-11 (all three bullets), FR-7 (registry half), FR-9 (the `/akili-archive` signal list — surface 15b), NFR-2, NFR-3, NFR-5 |
| Scope | **Five bullets, not four** — the fifth was added during execution with the user's approval after T7 refuted P-7 |

**Files changed:** `docs/model-routing.md`; the five mirrors; `.claude/commands/akili-archive.md`; `CHANGELOG.md`; and `README.md` + `docs/flow.md` under FR-11's conditional clause.

#### Attempt 1 — Reviewer `PASS`

*Implementer verification, as reported and as independently re-run by the Leader:* `review intensity` in `docs/model-routing.md` **5** · `REVIEW_SKIPPED` per mirror **6 / 1 / 1 / 1 / 1** · `No unreleased changes yet` **0** and the spec named once in `CHANGELOG.md` · `akili-archive.md` `REVIEW_SKIPPED` **1**, `escaped defect` **1** · `deterministic` **0** in all five mirrors (NFR-2).

*Constraint checks run by the Leader:* NFR-1's frozen paths **untouched**; the only `.claude/commands/` file modified is `akili-archive.md`, which the amended scope allows.

*Falsifier — baselines executed at `c87187f`, not quoted:* all five mirrors **0**, `model-routing` **0**, archive **0 / 0**, the CHANGELOG's stale note present. Each check genuinely fails on the pre-spec text.

*Evidence re-run (FR-3, Leader-inline):* **`VERIFIED`**.

*KZ-002 compliance on the README/flow bullet:* the falsifying grep was run **before** any edit and returned 56 hits across the two files. The Implementer read every hit in context, ruled the large majority false positives (`preview`, `reviewable`, human-review references) or role-description prose unaffected by per-task conditionality, and edited only the passages a hit showed to be false — two loop blocks and a lifecycle checklist line. "No change" is recorded **with its evidence**, which is what KZ-002 demands.

*Reviewer verdict:* **`PASS`**, no issues.

> SUMMARY: T8's five mirrors, `docs/model-routing.md`, the CHANGELOG entry, the two README/flow loop blocks and `akili-archive.md:151` all describe what actually shipped. The parity read was performed on each mirror against its source command; no surface anywhere in the five still asserts, in its own words, that a Reviewer audits every task.

**The parity read — the task's real gate — recorded per mirror**, each read beside its source and each citing source line numbers:

| Mirror | Finding |
|---|---|
| `docs/commands/akili-execute.md` | matches src:192/203 (claim-not-instruction), src:198 (applicability), src:126–136 (loop order: diff → re-run → `MISMATCH`=FAIL → conditional Reviewer), src:265 (three closing records), src:369–378 (the record and its never-merged sibling clause), src:253 (never-waived re-run). Remaining Reviewer mentions are harness-naming or role description, **not frequency claims** |
| `docs/commands/akili-specify.md` | matches src:392, src:434 (the Step 3.3 named skip list), src:480 (checklist item), and the file-level FR-10 rule |
| `docs/commands/akili-constitution.md` | matches src:309. Its *"Reviewer runs on a different model"* lines are a **model constraint, not a frequency claim** — correctly left alone |
| `docs/commands/akili-resume.md` | matches src:48–49 including both example strings, and adds the NFR-3 separation clause |
| `docs/skills/kaizen.md` | matches SKILL.md rows 71–72 and the clean-run predicate at src:76, conditioning on *an escaped defect against a skipped task* rather than on skip count |

**On the one widening — ruled correct parity work, not scope creep.** The Implementer extended `docs/commands/akili-execute.md`'s Constitution Impact bullet beyond the four flagged sites, from *"On PASS"* to *"On a task's close — PASS, REVIEW_SKIPPED, or REVIEW_WAIVED"*. The Reviewer's reasoning: source Step 3 holds the Constitution Impact Check and is entered *"only after one of the three closing records"*, so the mirror's *"On PASS"* **became false when T3 landed**, and leaving it would violate FR-11's *"contradict no command sentence"*. Settled on the record.

**On the registry (FR-7), walked bullet by bullet:** review intensity present as a named third dimension; the T2-default bullet with recorded escalations, whose pointer into `leader.md` → *Delegation Discipline* the Reviewer **followed and verified**; the Reviewer row retains *"MUST resolve to a different model than the Implementer"* and gains the conditional note; a new bullet forecloses the cheap same-model substitute (*"decides whether, never which model audits"*); the Verifier row maps the re-run to **T5**, the registry's cheapest tier. NFR-2 honored — the section explicitly refuses to restate the predicate.

**On the CHANGELOG, held to KZ-002's bar** (*summary surfaces inherit the artifacts' evidence bar*): every claim spot-checked true against the committed sources — the four conditions verbatim against src:194–199, the seven overrides, the report-not-plan rule, the re-run's mechanical nature and non-waivability, the third closure state, the `Review` field's values and its Step 3.3 / checklist surfacing, the T2/T5 routing, FR-10. **The trial terms it states match FR-9's user-fixed table exactly** — 3 complete specs, one escaped defect reverts. Classification **minor** justified on the stated no-migration, no-rename grounds.

#### `ADVISORY` findings — recorded, and going no further

Per *Advisory Never Gates* and *Advisory Never Becomes A Task*.

| Lens | Finding |
|---|---|
| Readability | `docs/flow.md:337` (*"Hard PASS/FAIL gate … requirements conformance … enforced before `[x]`"*) is **weakened rather than falsified** by a skip: enforcement moves to the executed falsifier plus the non-author re-run. Leaving it is defensible under FR-11's *only where false* |
| Risk | The CHANGELOG entry restates the four conditions and the override count. Released entries are frozen by convention, so a later predicate edit leaves a stale restatement behind. **This is the one place the predicate now exists twice** — accepted, because citing by name would make a release note useless |
| Readability | `docs/commands/akili-execute.md`'s Constitution Impact sentence still omits the source's third trigger, *"changed a module's public surface"*. **Pre-existing**, not introduced here |

**The Leader offered to carry the first item to the user as a candidate proposal outside this spec. The Reviewer declined, and was right to:**

> **no, `docs/flow.md:337` does not need acting on** … The sentence is not false — under an earned skip, requirements conformance is still enforced before `[x]`, by the executed falsifier and the never-waived non-author re-run rather than by a Reviewer read. FR-11 says change README and flow *only* where a sentence turns false, so **editing it would itself be the violation**. I raised it only because it now reads as unconditional-Reviewer shorthand to someone who does not yet know Step 2.3; that is a wording preference, not a defect. Record it and let it sit.

#### Decisions made

| Decision | Reason |
|---|---|
| The Reviewer brief **told it not to re-run the greps** and to spend its budget on the parity read | The task's own disqualifier says checks 1–4 see literal strings only and the parity read is the gate. The Leader had already run and confirmed every count; repeating them would have spent an auditor on work already done, at the cost of the judgment only it can supply |
| **Leader error — a third mis-specified brief check.** The brief's DD-11 check flagged 5 held-out-spec hits in `CHANGELOG.md` | Baseline at `c87187f` is also **5**, and `git diff \| grep "^+"` adds **0** — they are released-history entries predating this spec. The Implementer's DD-11 claim was accurate. **This is the third Leader-added check in this run to assert an absolute value that pre-existing text already violates** (after the held-out grep in T2 and the `deterministic` grep in T7), and all three were untagged as advisory-grade against the brief contract's clause (d). That is a pattern, not three slips, and it belongs in the retrospective |
| Implementer ran at **T2 `sonnet`, effort `high`** | Ten files and a read-based gate. No tier escalation, so nothing to record under the rule T3 shipped |

#### Final verification result

All six checks green, re-run independently by the Leader (`VERIFIED`), plus the NFR-1 and command-scope constraint checks. Baselines executed at `c87187f`. KZ-002's falsifying grep run before the README/flow edits, with "no change" recorded against its output rather than asserted. **The parity read is recorded per mirror with source line citations — a PASS without it would not have been a PASS.**

---

### T9 — Closure gate

| Field | Value |
|---|---|
| Status | **PASS** |
| Date | 2026-09-19 |
| Implementer attempts | 1 |
| Review rounds | 1 (`PASS` first time) — **final total for the spec: 13** |
| Shipped lines | **0 shipped** · 163 spec-local (`closure.md`) |
| Requirements covered | NFR-1..NFR-6, NFR-8; FR-9 (trial terms recorded); `requirements.md` §8 |

**Files changed:** `docs/specs/changes/review-intensity-routing/closure.md` — created. **No packaged file edited**, as the task requires.

#### Attempt 1 — Reviewer `PASS`

*Gates (a)–(g): all pass.* The Leader independently re-ran **(a)** — frozen paths empty — and **(g)**: `npm run verify:cli` exit 0, `npm run pack:dry-run` exit 0, `git diff --check` exit 0, run with the tree quiet and no worker active. The Reviewer re-confirmed (b) and (c).

*Gate (d) carries a documented discrepancy rather than a clean pass.* Two hits exist in shipped files — `akili-specify.md:309` (a kaizen lesson id) and `akili-execute.md:177` (a dependency hand-off) — both **byte-identical at `c87187f`** and neither naming a task record. Under `requirements.md`'s governing wording (*task records* reserved) this is a **PASS**; under `tasks.md`'s stricter wording (*no shipped file may name either spec*) it would **FAIL**. The discrepancy is stated in `closure.md` rather than resolved silently — the same finding this spec's T2 entry already recorded.

*Evidence re-run (FR-3, Leader-inline):* **`VERIFIED`** — the held-out count, gates (a) and (g) all re-executed independently and matched.

#### The results that matter

| Test | Result |
|---|---|
| **Held-out record count** | **12, not 14** — established by counting, not inherited |
| **Predicate walk** | **0 of 12 qualify.** Condition 2 is the dominant disqualifier, failing on all 12; condition 3 fails independently on 5; overrides (a)/(b)/(c) fire on 8+ |
| **Inert test (NFR-6)** | **PASS** — 0/12, not 12/12. The predicate is not a rule nothing can fail |
| **Refutation test (NFR-6)** | **PASS** — no held-out task whose Reviewer returned a real FAIL qualifies. The sharpest case is `leader-brief-contract` T6, the one corpus task whose review caught a real Pivot-triggering defect: the predicate excludes it on **two independent grounds** |
| **Mutation falsifier** | **Executed — and produced NO FLIP** |

**P-15 is refuted, exactly as P-7 was.** DD-11 and P-15 assert 14 held-out records. The Implementer counted `### T` headers instead of inheriting the figure: `gate-falsifiability` 6/6, but `leader-brief-contract` has **6 in `tasks.md` and 8 in `execution.md`** — the two extras being `T2 (re-opened)` and `T6 — attempt 2`, **Pivot-driven re-executions rather than independent task records**. Since FR-1 reads fields that live in `tasks.md`, the usable base is **12**. The Leader verified this independently. **Two of this spec's fifteen premises were refuted by executing it**, both by reading a source past the point the original verification stopped.

#### Q1 — the mutation falsifier produced no flip. Ruled: the *falsifier* is mis-specified, not the walk.

T9's own `Falsifier` cell asserts that a walk whose decisions do not move under the mutation *"was reading the tasks, not the text."* The Implementer executed the mutation properly, observed no flip, and **reported it as a finding rather than manufacturing the expected result**.

The Reviewer ruled the Implementer right and the task text wrong:

> `tasks.md` T9's Falsifier assumes override (c) is the marginal disqualifier for report-producing records. It is not: condition 2 and override (c) both target the same structural property — a walkthrough is neither a pass/fail command nor consumer-free — so deleting (c) cannot move a record that already fails condition 2. On this corpus no record has (c) as its sole ground, so the mutation is **structurally incapable** of isolating it. That is a defect in the falsifier's design, not evidence the walk read task metadata.

It then established the walk's standing **on independent grounds rather than on the Implementer's say-so**, spot-checking two records itself against the shipped predicate and quoting their archived `Disqualifier` text verbatim.

**And it named the residual, unprompted — this is the honest part and it is recorded as the reason the walk clears:**

> Residual, and it is real: text-sensitivity was never *positively* demonstrated. A mutation that deletes **condition 2** would have flipped records and shown the walk moves with the text. Nobody ran it. My two-record spot-check substitutes for it; **record that as the reason the walk clears, not the executed mutation.**

#### Q2 — zero yield across thirteen tasks. Ruled (a) + (b), explicitly not (c).

The predicate qualified **nothing**: 0 of 12 held-out records, plus this spec's own T6, the single task it classified `skip-eligible`, which did not earn the claim.

NFR-6 passes on its literal terms — not inert, not refuted. But NFR-6 tests only those two directions, and the Leader put the third to the Reviewer explicitly: a predicate that qualifies nothing delivers no speed, and speed is the change's entire justification.

> Zero-of-thirteen is the expected outcome of a deliberately strict predicate against an unrepresentative corpus: **both held-out specs are methodology-prose specs whose `Disqualifier`s necessarily instruct a reader to read, so condition 2 fails by construction.** A code spec with a unit-test `Disqualifier` behaves differently. That is a corpus limit, not a predicate defect.
>
> Not (c). **Widening any condition now would fit the rule to the data it was meant to be tested against** — T9's own `Disqualifier` forbids exactly that, and a revision is a user decision under the Pivot Protocol.

**On prominence, it found the one thing `closure.md` does not say:**

> `closure.md` states 0/12 in its verdict paragraph, its summary table, §3, §4 and §8. A reader cannot miss the number. **What it never states is the *consequence*** — that the skip component may deliver zero speed, leaving Implementer right-sizing and effort banding as the change's entire benefit, which `proposal.md` already measures at one round in fifteen. §8 frames the result as predicate robustness; **the user approving a three-spec trial needs it framed as yield.**

#### `ADVISORY` findings — recorded, and going no further

| Lens | Finding |
|---|---|
| Risk | The zero-yield **consequence** should reach the user framed in the change's own terms, not only as a count. *"This is the honest-terms finding, not a rule violation; I am not gating on it."* |
| Readability | **Condition 3 applied inconsistently** in the walk: `none (no shared symbol changed)` treated as passing on 10 records while `gate-falsifiability` T4's *"none beyond the mirrors themselves"* is flagged ambiguous. Both are qualified `none`s. Verdict-neutral, since condition 2 fails universally — but it is **a live instance of §8's *rule a literal reader cannot execute* row** |
| Readability | §7 states the line delta as "+16 / +40"; total churn is 176 against a ~120 budget for *"added or changed"* lines, which a reader could miss |

**None was actioned.** The RISK item asks for the framing to be **carried to the user at the continue gate**, which is a Leader duty and not an edit — `closure.md` was not amended, because acting on an advisory inside the spec that produced it is what *Advisory Never Becomes A Task* forbids. The second item is a genuine methodology observation and travels to the retrospective as such.

#### Decisions made

| Decision | Reason |
|---|---|
| Implementer stayed on **T2 `sonnet` at `xhigh`**, with no tier escalation | The work is careful reading and tabulation over 12 records rather than novel reasoning, and keeping the Implementer at T2 left `opus` free for the audit — which is where the judgment was actually needed, and where it paid for itself twice |
| The Reviewer was asked to **rule on Q1 and Q2 rather than confirm them**, with all outcomes left open including "the walk must be redone" and "the predicate needs revision" | A closure gate that only ever confirms is the inert gate its own spec warns about |
| `closure.md` **not amended** for the RISK advisory | Advisories are recorded and die there. The framing is carried to the user by the Leader at the continue gate instead |

#### Final verification result

Gates (a)–(g) pass, with (d)'s discrepancy stated rather than resolved silently; (a) and (g) re-run independently by the Leader with the tree quiet. The held-out base is **12**, established by counting and verified twice. **Inert test passes; refutation test passes.** The mutation falsifier was executed and its null result reported honestly; the walk's standing rests on the Reviewer's independent two-record spot-check, which is recorded as such. Trial terms byte-identical to FR-9. Budget actuals reported with their cause.

---

## 3. Summary — all tasks complete

| Measure | Budgeted (`design.md` §13) | Actual | Delta |
|---|---|---|---|
| Tasks | 9 | **9** | — |
| Shipped lines | ~120 | **136 insertions / 40 deletions across 17 packaged files** | over, ~13% on insertions |
| Review rounds | 10 | **13** | **+3** |
| Implementer attempts | — | 12 across 9 tasks |
| Tasks needing rework | — | **3** (T1, T2, T5), plus T3 | |

**Final status: 9 of 9 `[x]`.** Every task closed on a Reviewer `PASS` from an independent context on a different model — `author ≠ auditor` held on all nine, Implementer at T2 `sonnet` throughout with **no tier escalation on any task**, Reviewer at T3 `opus`. **No `REVIEW_WAIVED` and no `REVIEW_SKIPPED` record was written**: the gate was never lost, and never earned away.

**Why the overrun.** Five Reviewer FAILs, and four shared one shape: a rule inserted beside a surviving neighbour that contradicts it, or an obligation whose named mechanism cannot deliver it. **Three of those were defects in the approved documents, not in the implementation** — FR-10 undelivered by any shipped sentence; FR-5 naming a Verification Checklist that provably runs *after* the gate it was meant to guard; and two Premise Ledger entries (P-7, P-15) verified by reading a source only as far as the clause that agreed with them. The budget assumed two rework rounds for a prose spec with one definition and eight citing surfaces; it needed three, because the spec itself carried defects that only surface when someone executes it literally.

**Two scope additions**, both escalated and both user-approved: the Step 3.3 presentation site (T5) and surface 15b, `/akili-archive`'s signal list (T8). Neither was absorbed by widening a task.

**The dogfooding result, stated plainly.** This spec designed exactly one `skip-eligible` task to test its own rule. **The predicate refused it**, on the task's own `Disqualifier`. Across the 12 held-out records and this spec's T6, the predicate has qualified **zero of thirteen tasks examined**. It is not inert and it is not refuted — but on this evidence the skip component's measured yield is zero, and the change's benefit rests on Implementer right-sizing and effort banding. The three-spec trial the user fixed, with one escaped defect as the abort criterion, is what will settle whether that holds outside a corpus of methodology-prose specs.

**Leader errors recorded, as a pattern rather than three slips.** Three Leader-added brief checks asserted absolute thresholds that pre-existing text already violated (the held-out grep in T2, the `deterministic` grep in T7, the DD-11 CHANGELOG grep in T8), and none was tagged `[advisory-grade]` as the brief contract's clause (d) requires. In all three cases the Implementer flagged the conflict rather than silently editing out-of-scope text or silently passing — the correct behavior, and the reason none of them cost a rework attempt.

**Open items carried out of this spec** — none may be absorbed by a task here:

1. **P-15 correction, 14 → 12**, in `design.md` DD-11 and §11, matching P-7's already-recorded refutation.
2. **The `requirements.md` / `tasks.md` discrepancy** on held-out naming: `tasks.md` §2 states a stricter rule than the FR-level text supports.
3. **A `/akili-specify` Step 3.2 authoring check** — a task may be classified `skip-eligible` only if its `Disqualifier` names no read or judgment. T6's contradiction was determinable at specify time from two adjacent fields, and nothing looked. Raised by T6's Reviewer, declined as a task here under *Advisory Never Becomes A Task*.
4. **T9's `Falsifier` is mis-specified** — deleting override (c) cannot isolate it on a corpus where condition 2 fails first. A condition-2 mutation would demonstrate text-sensitivity positively.
5. **Condition 3's treatment of qualified `none` values** (`"none beyond the mirrors themselves"`) is a live instance of §8's *rule a literal reader cannot execute*.
