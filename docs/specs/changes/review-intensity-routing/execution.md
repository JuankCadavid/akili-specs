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
