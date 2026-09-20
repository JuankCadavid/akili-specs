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
