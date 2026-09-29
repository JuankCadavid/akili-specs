# Execution Log: Re-baseline AKILI for Claude Opus 5.5

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/opus-5-5-rebaseline` |
| Approval Mode | `gated` (from `proposal.md`) |
| Baseline commit | `31b6d31` |
| Leader | Claude Opus 5.5 (`opus` alias, T1). Model checkpoint: pass |
| Delegation | No Step 8E wrappers in this repo (`.claude/agents/` absent), so fallback sub-prompt spawns (`general-purpose`), each seeded to read its `.agents/` persona. Implementer model `sonnet`, Reviewer model `opus` (author ≠ auditor) |
| Parallelism | T1, T2, T3 launched concurrently (width 3: disjoint files, no build output or ports shared; reports capped by word count). T4 after all three |
| Budget (design §9) | 4 tasks · ~75 shipped lines · 6 review rounds |

## 2. Task Execution History

### T2: Workers name the premature stops — PASS (attempt 2)

| Field | Value |
|---|---|
| Final status | **PASS** |
| Date | 2026-09-29 |
| Attempts | 2 |
| Requirements covered | FR-4 (every bullet; both scenarios), NFR-3, NFR-4 |
| Skills | `cognitive-doc-design` (per the task; no deviation) |
| Effort | attempt 1 `medium`; attempt 2 `high` (bumped on rework) |
| Review rounds used | 2 |

**Attempt 1**
- Files changed: `.claude/templates/implementer.md` (+1), `.claude/templates/tester.md` (+1).
- Implementer verification: check 1 `grep -c "Don't stop short"` → 1/1/0/0 (implementer/tester/reviewer/leader); check 2 `grep -n FATAL_FAIL tester.md` → 0; check 3 lines `:24`/`:25` unchanged, pure insertion; check 4 stat lists only the two files. Falsifier executed: scratch copy of `tester.md` with "or `FATAL_FAIL`" appended → check 2 = 1 (red). Line 14 byte-identical in both files.
- Evidence re-run (Leader inline): **VERIFIED**, same outputs.
- Reviewer (`opus`): **FAIL**.
  1. *Discovered Issue:* the Tester's list of legitimate stops was exhaustive ("your own contract's outcomes **only**") and left out the normal terminal outcome, a complete suite reported as `STATUS: PASS`. The Glossary stop "the task being complete" was missing for the Tester. *Violated Rule:* `requirements.md` §3 Glossary *Legitimate stop* with FR-4 bullet 2; `design.md` DD-3. *Remediation:* add "the suite complete and reported as `PASS`" to the list and keep `FATAL_FAIL` absent.
  2. *Discovered Issue:* the Implementer bullet listed "a Pivot-Detection condition" as a legitimate stop. The unedited bullet directly below it says to still deliver the task as written and to leave the spec change to the Leader (Pivot Protocol), so the two bullets contradicted each other. *Violated Rule:* `requirements.md` NFR-4 (KZ-changes--leader-brief-contract-1). *Remediation:* keep naming Pivot-Detection, but as something the worker flags in its report while still delivering the task, not as a stop. Do not edit the neighbouring bullet.
- runtime events: none.

**Attempt 2** (the report was relayed verbatim, with Attempt History)
- Files changed: the same two bullets only.
- Implementer verification: checks 1–4 re-run with the same results. The falsifier was re-executed on a fresh scratch copy: 0 → 1 (red). The Implementer reported one self-caught slip: an intermediate edit had dropped "the task being genuinely complete", and it restored that clause before reporting.
- Evidence re-run (Leader inline): **VERIFIED**. Check 1 gives 1/1/0/0, check 2 gives 0, the stat shows +1 in each of the two files, and line 14 is identical.
- Reviewer (`opus`, same context, re-review): **PASS**. Both issues are closed. Pivot-Detection is now handled as its neighbour handles it (flag it, still deliver, the Leader stops the loop). The Reviewer judged this FR-4-conformant because the Glossary *legitimate stop* list is written from the Leader's side. The (a)–(d) walk holds, and there are no line-number pointers.
- ADVISORY: suppressed by the Reviewer (diff < 50 LOC, per the `reviewer.md` depth table).
- runtime events: none.

**Decisions made:** the Implementer and the Reviewer were each resumed by message for the rework instead of a fresh spawn, which kept the same persona context. The Glossary's Leader-side "Pivot-Detection condition" stop is rendered in the Implementer persona as flag-and-deliver, per the Reviewer's remediation.

**Issues encountered:** a neighbour contradiction (KZ-changes--leader-brief-contract-1 recurred at attempt 1) and an exhaustive list that dropped the happy path. Both were caught by the Reviewer walk, which the task's Disqualifier had already named as the only gate.

**Final verification:** checks 1–4 are green on the final tree, the falsifier red was observed, and line 14 is unchanged in both files.

### T3: The Leader's `Not Done` handling is split, ordered and bounded — PASS (attempt 1)

| Field | Value |
|---|---|
| Final status | **PASS** |
| Date | 2026-09-29 |
| Attempts | 1 |
| Requirements covered | FR-5 (the three rows; precedence for mixed content; the cap of 2; no attempt consumed; no budget round; recorded in `execution.md`; the `/goal` provision; all three scenarios) |
| Skills | `cognitive-doc-design` (per the task; no deviation) |
| Effort | `high` (the loop's completion gate; ambiguity is the main risk) |
| Review rounds used | 1 |

**Attempt 1**
- Files changed: `.claude/commands/akili-execute.md` (+9 −2): Step 2.3 item 0 (three rows, a precedence bullet, an accounting bullet; the first sentence and the `[x]`-blocking sentence kept) and Step 5's `<N>` formula (`+ 2 continuations per task`).
- Implementer verification: check 1 `grep -c continuation` → 4 (B5 = 0). Check 2 `grep -n "2 continuations"` → item 0 (`:225`) and the `<N>` formula (`:329`). Check 3: the Accounting rule and the `**Budget Tripwire:**` bullet are byte-identical to `31b6d31`. Check 4: the stat lists only `akili-execute.md`. Walk falsifier over four cases (mixed report; stopped short twice; gated; held-out inconclusive-only under `pre-approved` → "no owed item at all, whether assumptions-only or an inconclusive verification — never a continuation"). All four routed correctly, with the deciding sentence quoted in each.
- Evidence re-run (Leader inline): **VERIFIED**. The re-run gave the same counts. The Accounting and Budget Tripwire lines diffed against baseline with no output, and the stat shows +9 −2 in one file.
- Reviewer (`opus`): **PASS**. It walked every FR-5 term. The `gated` options are identical to the baseline ("re-spawn for the remainder, or mark `[~]` and escalate"). The Accounting rule, the runtime-event enumeration and the Budget Tripwire are unchanged and consistent. The *Execution Log Format* restatement stays true. There are no line-number pointers. The Reviewer judged "as today" / "unchanged —" to be existing house style and not a conformance issue.
- ADVISORY: suppressed (diff < 50 LOC).
- runtime events: none.

**Reviewer note (spec-level; recorded here, not a task):** when a `Not Done` field holds **no** owed item (assumptions-only or inconclusive verification), DD-4 and the shipped text route it to "never a continuation" and keep it from `[x]`, but they name no next action. Under `pre-approved` / `/goal`, such a task could sit with no continuation, no escalation and no `[x]` until the turn bound runs out. The diff implements DD-4 faithfully ("handled as today"). Blocking `[x]` on any non-empty field is pre-existing behavior at `31b6d31`. **Leader disposition:** not a T3 defect and not a new task (*Advisory Never Becomes A Task*). It is surfaced to the user at the continue gate so they can decide whether it earns a follow-up proposal or a Pivot.

**Decisions made:** none beyond the brief.

**Final verification:** checks 1–4 are green on the final tree, and the four-case walk is recorded.

### Budget Tripwire — 2026-09-29 (raised after T1's Implementer report, before T1 review)

| Measure | Budget (design §9) | Actual so far | Delta |
|---|---|---|---|
| Shipped lines | ~75 total (T1 ≈ 38, T2 ≈ 16, T3 ≈ 14, T4 ≈ 7) | T1 +70 −18, T2 +2 (two long bullets), T3 +9 −2 → **81 inserted** with T4 still to come | T1 is ~1.8× its estimate; the spec is already over its total |
| Review rounds | 6 | 3 used (T2 ×2, T3 ×1); T1 and T4 still owed | on track if no further rework |
| Tasks | 4 | 4 | — |

**Cause:** T1's scope carries seven edit sites plus a new subsection (DD-1's 7-point rewrite, DD-2's site table, DD-5). In a hard-wrapped (~100-column) doc, that content alone runs well past 38 lines. The T1 Implementer also reported two self-caught rewordings forced by check 1. T1's evidence re-run was **VERIFIED** (checks 1, 3–8 match; check 2 hits at 103, 104, 189, 273, 368, 414, classification pending review). T1 is **not** yet reviewed and stays `[ ]`.

**Status:** stopped for the user per *Budget Tripwire*; T1 review awaits the go-ahead.

**User decision (2026-09-29):** "continue". The overrun is accepted, and T1 review and T4 proceed on the current budget.

### T1: `docs/model-routing.md` speaks for Opus 5.5 — PASS (attempt 1)

| Field | Value |
|---|---|
| Final status | **PASS** |
| Date | 2026-09-29 |
| Attempts | 1 |
| Requirements covered | FR-1, FR-2, FR-3, FR-6, NFR-2, NFR-4, NFR-5 |
| Skills | `cognitive-doc-design` (per the task; no deviation) |
| Effort | `high` (rewrites load-bearing routing guidance) |
| Review rounds used | 1 |

**Attempt 1**
- Files changed: `docs/model-routing.md` (+70 −18). The seven sites changed as follows:
  - the worked example gains its Opus 5.5 clause;
  - the *Frontier escalation* trial is named as the measured-gain case;
  - the role table gets a pointer to the family notes, with its values untouched;
  - the re-baseline/reconciliation paragraph is rewritten, and the under-specified rule is re-anchored off the Opus 5 numbers;
  - *Tier ↔ effort* now reads "resolves to Opus 5.5";
  - *Opus specifics* is rewritten in DD-1's 7-point order, with the kept points (a) and (b);
  - a new *Time signals (harness capability, optional)* section sits before `## Review intensity`.
- Implementer verification:
  - check 1, the start-high obligation grep: 0 (B1 = 2);
  - check 2: six `Opus 5` hits (103, 104, 189, 273, 368, 414), all classed as history;
  - check 3: `Opus 5\.5` = 5;
  - check 4: `AKILI-measured` = 1;
  - check 5: `prompting-claude-opus-5-5` = 2;
  - check 6: time signal/elapsed = 7;
  - check 7: role-table rows byte-identical;
  - check 8: `elapsed` in templates/commands = 0.
- Falsifier executed, both reds observed. Re-inserting "start high and iterate down" moved check 1 from 0 to 1. Changing the T2 table value produced a hunk.
- The Implementer self-caught and reworded two drafts that tripped check 1: a "starts higher" sentence, and a verbatim "start high" quote in *Opus specifics*.
- The consumers were read and no edit is owed.
- Evidence re-run (Leader inline): **VERIFIED**. The re-run gave the same counts. The role-table rows (T1/T2/T3/T5) diffed against baseline with no output, and the stat shows +70 −18 in one file.
- Reviewer (`opus`): **PASS**.
  - It walked every FR term.
  - It read the reconciliation paragraph whole. Nothing says the vendor starts above AKILI's T2 `medium`, and the T1/T3 `high` defaults are stated to await the sweep.
  - It judged `:189` ("does not share") a still-true fact, not a current-generation claim.
  - Paraphrase probes found no surviving "start high" obligation.
- runtime events: none.

**ADVISORY (recorded, not tasks):**
1. *Risk / possible spec gap.* *Opus specifics* now says to reserve `xhigh`/`max` for measured gains. The same *Effort dial* still prescribes unmeasured `xhigh` in four places:
   - the effort-policy table (Complex → `xhigh`, Correctness-critical → `max`);
   - the role table ("`xhigh` if architecturally significant");
   - the under-specified rule (`high`/`xhigh`);
   - rework attempt 3 at `xhigh`.

   DD-1's reversion challenge reconciled only the frontier-escalation and under-specified sites. The Reviewer recommends kaizen, not rework.
2. *Readability.* DD-2 calls `:188–189` "past tense", but the line reads present tense ("does not share"). It is accurate as written.
3. *Provenance.* The Opus 5.5 `medium` figure in the reconciliation paragraph points to *Opus specifics* for its URL rather than carrying the URL itself. The historical Opus 5 `xhigh`/`high` pairing carries no source.
4. *Scope beyond DD-1/DD-2/DD-5, all small:*
   - "a second confirmation of the rule";
   - "the premise that used to motivate sweeping T1/T3 upward no longer holds". The Reviewer notes this slightly misdescribes the old text, which argued *against* pushing the defaults up;
   - a reverse cross-reference from *Opus specifics* to *Frontier escalation*;
   - meta-commentary that the kept points "carry over unchanged";
   - the "No AKILI persona or command emits or consumes this line" paragraph;
   - "never asked of the model to compute or restate".

**Leader disposition:** under *Advisory Never Becomes A Task*, none of these is reopened in this spec. Advisory 1 is a candidate for the kaizen retrospective at archive. Advisory 4's misdescription is surfaced to the user at the gate as a candidate for a quick follow-up.

**Final verification:** checks 1–8 are green on the final tree.

### T4: CHANGELOG and closure sweep — in progress (attempt 2 awaiting review)

**Attempt 1** (effort `low`)
- Files changed: `CHANGELOG.md` (the `Unreleased` placeholder was replaced with a `### Changed` entry).
- Implementer verification:
  - check 1: placeholder count is 0;
  - check 2: T1 obligation grep gives 0, T2 anchor gives 1/1/0/0, T3 `continuation` gives 4;
  - check 3: `git diff --stat 31b6d31` lists exactly the five in-scope files plus the spec folder;
  - check 4: `npm run verify:cli`, `npm run pack:dry-run` and `git diff --check` all exit 0;
  - KZ-002 grep: only the negated "not a result AKILI has measured".
- Evidence re-run (Leader inline): **VERIFIED**, with one misreported count. The Implementer gave T1 check 2 as 5 `Opus 5` hits; the tree has **6** (103, 104, 189, 273, 368, 414), all classed as history at T1 review. The gate result is unchanged because the check requires every hit to read as history, not a particular count. The Reviewer judged it a transcription slip.
- Reviewer (`opus`): **FAIL**.
  1. *Discovered Issue:* the entry said the "start high and iterate down" advice "is retired to a clearly labeled historical note". No such note shipped: the sentence was deleted outright. The only history marker covers Opus 5's published starting points. *Violated Rule:* FR-7. *Remediation:* "…is removed; the previous generation's higher starting points survive only as a labeled historical reference, not as current practice."
  2. *Discovered Issue:* "an unattended worker" adds a qualifier neither persona bullet has. The legitimate-stop list was wrong for the Tester (a destructive confirmation is a never-override guard there, not a stop). It dropped two Implementer stops, and it called new lists "unchanged". *Violated Rule:* FR-7; proposal Success Criterion 3. *Remediation:* restate the rule unconditionally and give each persona's stops as shipped.
  - ADVISORY: the time-signal wording "appended to a worker's turn" / "never sent to the Reviewer" should read as a harness-maintainer rule.
- runtime events: none.

**Attempt 2** (effort `medium`; the report was relayed verbatim, with Attempt History)
- Files changed: `CHANGELOG.md` only.
- Implementer changes:
  - both issues fixed, with the stop lists copied from the shipped bullets, including the Implementer's "deliberately protected blocker", which the Reviewer's suggested wording had omitted;
  - the time-signal ADVISORY wording adopted;
  - the `Opus 5` count corrected to 6.
- Evidence re-run (Leader inline): **VERIFIED**.
  - Check 1 gives 0.
  - The T1 obligation grep gives 0.
  - `Opus 5` hits give 6.
  - Only `CHANGELOG.md` is modified, and `git diff --check` passes.
  - `grep -c "historical note" CHANGELOG.md` gives 0.
- Reviewer: **pending**. A re-review is owed (override e, rework). It would be review round **7** against a budget of 6. Per *Budget Tripwire*, stopped for the user before spending it.
- **User decision (2026-09-29):** "continue". Review round 7 approved for the T4 re-review.
- Reviewer (`opus`, re-review, round 7): **PASS**. Both issues are closed. The Implementer and Tester stop lists match the shipped bullets item for item. The time-signal wording matches the *Time signals* section. The `Not Done` description matches item 0. The Disqualifier and NFR-2 hold. ADVISORY: suppressed (diff < 50 LOC).
- runtime events: none.

**T4 final status: PASS (attempt 2).** Date 2026-09-29. Requirements covered: FR-7, NFR-1, NFR-5; proposal Success Criteria 1–5 ticked by the Implementer with evidence (the obligation grep and `Opus 5` hits all history; restated surfaces agree; the personas carry the rule with `:24`/`:25` unchanged; `gated` row unchanged; the package commands pass). Skills: `cognitive-doc-design`. Decisions made: none beyond the brief. Final verification: checks 1–4 are green on the final tree.

## 3. Summary

| Task | Result | Attempts | Review rounds |
|---|---|---|---|
| T1 `model-routing.md` for Opus 5.5 | PASS | 1 | 1 |
| T2 "Don't stop short" personas | PASS | 2 | 2 |
| T3 `Not Done` split and bound | PASS | 1 | 1 |
| T4 CHANGELOG + closure sweep | PASS | 2 | 2 |

**Budget vs actual:**
- Tasks: 4 of 4.
- Shipped lines: about 75 budgeted, about 90 actual (model-routing +70 −18, akili-execute +9 −2, personas +2, CHANGELOG +2 −2). The tripwire fired and the user said continue.
- Review rounds: 6 budgeted, 7 actual. The tripwire fired and the user approved round 7.

No HALT, no Pivot, no `REVIEW_WAIVED` / `REVIEW_SKIPPED`. Every task closed on a Reviewer `PASS`, with the Implementer on `sonnet` and the Reviewer on `opus`.

**For archive (kaizen inputs, not tasks):**
- KZ-changes--leader-brief-contract-1 recurred at T2 attempt 1 (a neighbour contradiction with the Pivot bullet).
- A new pattern appeared at T2 and T4: an exhaustive list that drops the happy path (Tester `PASS`), and a summary surface that paraphrases a list from memory (T4 CHANGELOG). This matches KZ-002.
- T1 ADVISORY 1: unmeasured `xhigh` prescriptions remain in the *Effort dial* beside the new measured-gain rule.
- T3 Reviewer note: a `Not Done` field with no owed item names no next action under `pre-approved`.
- T1 ADVISORY 4: one added sentence misdescribes the old reconciliation text.
- The T1 estimate did not account for a hard-wrapped doc (about 1.8× over).
