# Design: Review Intensity and Model Routing by Proven Verification

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/review-intensity-routing` |
| Depth | Standard (re-checked against this design in §13) |
| Status | Draft — awaiting the Step 2.5 gate |
| Date | 2026-09-19 |
| Source | `requirements.md` (FR-1..FR-11, NFR-1..8), `proposal.md` revision 2 |
| Consumer walk (KZ-changes--kaizen-loop-closure-1) | **This design's central risk.** `REVIEW_SKIPPED` adds a value to the **closure-state enumeration**, and `Review` adds a new enumerated field. Every existing consumer of both is walked in §7.2. The walk **found two surfaces the approved scope had missed**, and `requirements.md` §4 was amended at Phase 2 to add them |
| Reversion challenge (Step 2.3) | Run inline on **DD-8**, the one decision that removes shipped behavior — the absolute reading of `leader.md:82`. Outcome in §12 |
| Premise Ledger | §11. **Fourteen rows** — thirteen verified at `a909216`, one `UNVERIFIED` of **High** Impact (P-14, settled by the closure task). This is the first spec authored after `changes/premise-ledger` shipped, so the section is exercised rather than described |
| Format precedent | `docs/specs/archive/2026-09-19-changes--leader-brief-contract/design.md` |
| Delegation record | None. All exploration was targeted greps under the *Delegation Thresholds*' inline allowance; no scout was spawned |

## 2. Executive Summary

One decision block defines the **skip predicate**, its **overrides**, and the **evidence re-run** duty. It lives in `/akili-execute` Step 2.3, beside the Reviewer spawn it governs. Everything else cites it by name: `leader.md`'s amended collapse paragraph, `reviewer.md`'s depth bands, `/akili-specify`'s `Review` field, the constitution's template description, the routing registry's third dimension, `/akili-resume`'s reporting line, and the `kaizen` Measure table.

The closure rule moves from two accepted states to three. That single change is what makes the consumer walk in §7.2 the load-bearing part of this design rather than a formality.

## 3. Architecture Overview

**One definition, nine citing surfaces.**

| Role | Surface | What it holds |
|---|---|---|
| **Definition** | `/akili-execute` Step 2.3 — *Review intensity* block | The predicate, the overrides, the re-run duty (§5.1–§5.3) |
| Record | `/akili-execute` Execution Log Format | `REVIEW_SKIPPED` and the three closure states (§5.4) |
| Authority | `.claude/templates/leader.md` | The amended collapse paragraph (§5.7, DD-8) |
| Depth | `.claude/templates/reviewer.md` | Bands with bound effort (§5.5) |
| Plan | `/akili-specify` Step 3.2 + Verification Checklist | The `Review` field and gate visibility (§5.6) |
| Template | `/akili-constitution` Step 7 item 3 | Names the field, cites Step 3.2 |
| Routing | `docs/model-routing.md` | Review intensity as a third dimension; Verifier at T5 (§5.8) |
| Resume | `/akili-resume` | Reports a skip as a closed task, never as blocked |
| Retrospective | `kaizen` Measure table and clean-run predicate | Counts skips and escaped defects (§5.9) |

**Flow of one task.** Implementer reports → the Leader runs the **evidence re-run** (always) → evaluates the **predicate** against that report → spawns a Reviewer, or writes `REVIEW_SKIPPED` → closes the task under one of three accepted states.

**What does not change.** The 3-attempt ceiling, the Pivot Protocol, the budget tripwire, `REVIEW_WAIVED`'s meaning and flags, `author ≠ auditor` wherever a review runs, `/akili-test`, and every file in NFR-1.

## 4. Extended Directory Structure

No new packaged file. Edited files only:

| Path | Kind |
|---|---|
| `.claude/commands/akili-execute.md` | command — the definition, the record, the closure states, the `/goal` condition |
| `.claude/commands/akili-specify.md` | command — `Review` field, Verification Checklist |
| `.claude/commands/akili-constitution.md` | command — Step 7 item 3 description |
| `.claude/commands/akili-resume.md` | command — one reporting line |
| `.claude/templates/leader.md` | persona — the amended collapse paragraph, thresholds, recording |
| `.claude/templates/reviewer.md` | persona — depth bands with bound effort |
| `.claude/skills/kaizen/SKILL.md` | skill — Measure rows, clean-run predicate, report template |
| `docs/commands/*.md`, `docs/skills/kaizen.md` | mirrors |
| `CHANGELOG.md` | `Unreleased` |

## 5. Data Model — the contracts, defined once

### 5.1 The skip predicate (FR-1)

A four-condition conjunction, evaluated by the Leader **against the Implementer's report**, never against the plan: executed falsifier observed red · fully deterministic verification · `Consumers: none` · no override. Stated as a checklist the Leader walks aloud in `execution.md`, so the evaluation is auditable rather than asserted.

### 5.2 Overrides (FR-2)

Seven conditions (a)–(g), stated immediately beneath the predicate so no reader meets one without the other. Evaluated against **what the task does**, not how its verification reads. (g) is the Leader's own judgment, always available and never requiring justification — the asymmetry is deliberate: raising review is free, lowering it is not.

### 5.3 The evidence re-run (FR-3)

A duty, not a role. Two execution modes — Leader-inline, or a spawned Verifier when the command set crosses the inline threshold. Mechanical only. Result recorded per task as `VERIFIED` or `MISMATCH`; a mismatch is an implicit FAIL consuming an attempt. **Never conditional on anything.**

### 5.4 Records and closure states (FR-4)

`REVIEW_SKIPPED` carries predicate evidence, overrides-checked confirmation, the re-run result, and the Implementer's model. The closure rule accepts exactly three states: `PASS`, `REVIEW_WAIVED`, `REVIEW_SKIPPED`. The two records stay separately greppable and separately counted; the final-status vocabulary gains `SKIPPED` beside `PASS` / `WAIVED (flag)` / `HALT` / `pivot`.

### 5.5 Depth bands with bound effort (FR-6)

`reviewer.md`'s existing LOC bands gain a category column and an **effort ceiling** per band. A sub-50-LOC diff cannot draw above `medium` unless an override applies. Categories are depth guidance only and never decide existence (DD-2).

### 5.6 The `Review` field (FR-5)

Four values, one-line reason, absent-value `checklist`. `skip-eligible` is documented as a **claim to be proved**, and the Verification Checklist surfaces the skip list at the Step 3.3 gate so the user sees it before execution.

### 5.7 Leader authority (FR-8)

The amended paragraph keeps its prohibition on collapsing the gate **for efficiency** and adds the predicate-cleared skip as a distinct act. Both halves ship in the same paragraph so neither can be read alone (DD-8).

### 5.8 Routing (FR-7)

Review intensity becomes a **third dimension** beside tier and effort. Implementer defaults to T2 with escalations recorded; a conformance Reviewer keeps `≠ T2`; the Verifier maps to T5 because it exercises no judgment.

### 5.9 Retrospective surfaces (FR-9)

The `kaizen` Measure table gains a `REVIEW_SKIPPED` row and an **escaped-defect** row, and the clean-run predicate gains a clause so a run containing a skipped task with an escaped defect can never be classified clean.

## 6. API Design

Not applicable — no programmatic interface. The "API" is the block's name, used identically by every citing surface: **`/akili-execute` Step 2.3 — *Review intensity* block**.

## 7. Backend Module Design — Surface Table and Consumer Walk

### 7.1 Surface table

| # | File · section | Edit | FR |
|---|---|---|---|
| 1 | `akili-execute.md` · Step 2.3 | The *Review intensity* block: predicate, overrides, re-run duty | FR-1..FR-3 |
| 2 | `akili-execute.md` · Step 2.2 | One sentence: the brief tells the Implementer its verification may be the gate | FR-3 |
| 3 | `akili-execute.md` · Step 2.4 | Guardrail: the re-run is never waived; a `MISMATCH` consumes an attempt | FR-3 |
| 4 | `akili-execute.md` · Step 3 | Closure accepts three states | FR-4 |
| 5 | `akili-execute.md` · Step 5 | `/goal` condition accepts the third state; a skip is **not** a user stop | FR-4 |
| 6 | `akili-execute.md` · Execution Log Format | `REVIEW_SKIPPED` record; final-status vocabulary | FR-4 |
| 7 | `leader.md` · Delegation Ceiling | The amended collapse paragraph | FR-8 |
| 8 | `leader.md` · Delegation Discipline | Model/effort selection recorded like skill deviations | FR-7 |
| 9 | `reviewer.md` · depth table | Category column + effort ceilings | FR-6 |
| 10 | `akili-specify.md` · Step 3.2 | The `Review` field and its absent-value | FR-5 |
| 11 | `akili-specify.md` · Verification Checklist | The skip list is visible at the gate | FR-5 |
| 12 | `akili-constitution.md` · Step 7 item 3 | Template description names the field, cites Step 3.2 | FR-5 |
| 13 | `akili-resume.md` · closed-task reporting | A skip reported as closed, with its basis | FR-4 |
| 14 | `kaizen/SKILL.md` · Measure table + clean-run predicate + report template | Skip row, escaped-defect row, clean-run clause | FR-9 |
| 15 | `docs/model-routing.md` | Third dimension; Verifier at T5 | FR-7 |
| 16 | Mirrors: `docs/commands/akili-execute.md`, `akili-specify.md`, `akili-constitution.md`, `akili-resume.md`; `docs/skills/kaizen.md` | Own-register description | FR-11 |
| 17 | `CHANGELOG.md` · `Unreleased` | Entry + classification | FR-11 |

### 7.2 Consumer walk

**New value in the closure-state enumeration (`PASS` / `WAIVED` → + `SKIPPED`) — every existing consumer:**

| Consumer | How it reads the set today | With `SKIPPED` |
|---|---|---|
| `akili-execute.md:330` closure rule | "neither a `PASS` nor a `REVIEW_WAIVED` … is not closable" | **changes** — surface 4 |
| `akili-execute.md:228` Step 3 finalize | "Only after a Reviewer `PASS` — or … `REVIEW_WAIVED`" | **changes** — surface 4 |
| `akili-execute.md:283` `/goal` condition | "`[x]` with matching PASS or `REVIEW_WAIVED` evidence" | **changes** — surface 5 |
| `akili-execute.md:279` Approval Mode | a `REVIEW_WAIVED` decision is a **user stop** | **changes** — surface 5. A skip is **routine**, not a stop: the predicate is objective and the skip list was approved at the tasks gate (DD-6) |
| `akili-execute.md:69` Reviewer ladder rung 4 | waiver as the ladder's last rung | **holds** — a skip is not a ladder rung; the ladder is for runtime failure |
| `akili-execute.md:320,330` record + flags | defines `REVIEW_WAIVED` and its three flags | **changes** — surface 6, by addition; the waiver's flags are untouched |
| `akili-resume.md:48` | "A `## REVIEW_WAIVED` block is a closed task's last action … never as a *Blocked* item" | **changes** — surface 13 |
| `kaizen/SKILL.md:70` Measure row | counts tasks closed under `REVIEW_WAIVED` by flag | **changes** — surface 14 |
| `kaizen/SKILL.md:74` clean-run predicate | clean if "no `REVIEW_WAIVED` waiver flagged `inline` or `same-model`" | **changes** — surface 14. Without this, a skipped task with an escaped defect reads as **clean** and its retrospective is skipped |
| `kaizen/SKILL.md:159` report template | a `REVIEW_WAIVED` row | **changes** — surface 14 |
| `akili-archive.md:151` | "Extract the improvement signals listed in **the skill's** Measure table" | **holds** — cites the table rather than restating it |
| `akili-validate.md`, `akili-test.md`, `akili-quick.md` | read `execution.md`, but not the closure-state set | **holds** |

**New enumerated field `Review` (`skip-eligible` / `checklist` / `full` / `lenses`) — every reader:**

| Reader | Behavior |
|---|---|
| `/akili-specify` Step 3.2 | writes it — surface 10 |
| `/akili-specify` Verification Checklist + Step 3.3 gate | surfaces the skip list — surface 11 |
| `/akili-execute` Step 2.3 | reads it as a claim, then proves it — surface 1 |
| `/akili-constitution` Step 7 item 3 | describes it in the template — surface 12 |
| Tasks written before this change | no field → `checklist` → today's behavior (FR-10) |

## 8. Frontend / UX Component Architecture

Not applicable — no UI surface.

## 9. Shared Contracts

| Contract | Owner | Users |
|---|---|---|
| Skip predicate, overrides, re-run duty | `/akili-execute` Step 2.3 block | nine citing surfaces |
| Closure-state set | `/akili-execute` Execution Log Format | closure rule, `/goal`, resume, kaizen |
| `Falsifier` / `Consumers` / `Disqualifier` fields | `/akili-specify` Step 3.2 Falsifiability block — **read, never edited** (NFR-1) | the predicate's conditions 1–3 |
| `REVIEW_WAIVED` record and flags | `/akili-execute` — read, never edited | the distinctness rule |

## 10. Design Decisions

### DD-1 — The predicate is proof-based, not size-based
Size failed as a predictor in the one measured run: two one-line tasks, opposite outcomes. Rejected: a category ladder (proposal revision 1), which also paired a cheaper Implementer with a removed Reviewer, moving two variables toward less quality at once.

### DD-2 — Categories survive as depth guidance only
Keeping them lets the depth table stay legible without letting a category decide existence. Rejected: deleting categories entirely, which would leave depth unguided.

### DD-3 — The re-run is a duty with two modes, not a mandatory new agent
A mandatory Verifier spawn on every task would add cost to exactly the tasks this spec is trying to cheapen. The *Delegation Thresholds* already license inline verification.

### DD-4 — `MISMATCH` is an implicit FAIL, reusing the existing accounting
The methodology already treats an Implementer-reported verification failure as an implicit FAIL that consumes an attempt. Reusing that avoids a second accounting vocabulary.

### DD-5 — `REVIEW_SKIPPED` is a sibling record, not a flag on `REVIEW_WAIVED`
A flag would make the waiver's count meaningless, which is the one number that says how often the gate was lost. Rejected: `REVIEW_WAIVED (flag: skipped)`.

### DD-6 — A skip is routine; a waiver remains a user stop
The waiver stops for the user because the gate was **lost** unexpectedly. A skip is predicted at specify time, approved at the tasks gate, and proved by an objective predicate, so stopping again would gate the same decision twice. Under `pre-approved`, a skip auto-passes like any routine step.

### DD-7 — The predicate is evaluated against the report, never the plan
`skip-eligible` in `tasks.md` is a claim. Evaluating the plan instead of the report would let a spec author grant skips in advance, which is the failure mode the whole design is built to avoid.

### DD-8 — The collapse prohibition is amended in place, keeping both halves *(removes shipped behavior — challenged, §12)*
`leader.md:82` currently forbids collapsing the gate absolutely. The amendment keeps "never for efficiency" and adds the predicate-cleared skip as a **different act**. Rejected: deleting the paragraph, which would remove the one sentence that names the bias the Reviewer exists to catch.

### DD-9 — Scope grew at Phase 2 rather than being deferred
The consumer walk found `akili-resume` and the `kaizen` clean-run predicate. Deferring them would ship a state two commands cannot read — the exact fall-through class KZ-changes--kaizen-loop-closure-1 names.

### DD-10 — The trial's numbers are set at approval, not here
Extent and abort criterion are left to the user at the Step 2.5 gate. Writing them now would let the author of the change choose the bar it must clear.

## 11. Premise Ledger

`Premise Ledger: 13 verified · 1 UNVERIFIED (1 High, 0 Low)` — verified at `a909216`, all commands run from the repository root.
`Blast-radius triggers:` **consumer** fires (the closure-state set and the new `Review` field are read by other commands — P-2, P-3, P-4, P-5, P-6); **shared-state** fires (the closure-state condition is read by more than one command — same rows); **live-path** fires (the design names the Leader's runtime decision chain from report to spawn-or-skip — P-1).

| # | Claim | Class | Citation (as run) | Verified at | If false | Settled by |
|---|---|---|---|---|---|---|
| P-1 | The Reviewer spawn is unconditional and Step 2.3 is where it happens | `location` | `akili-execute.md:183` (`#### 2.3 — Spawn Reviewer`); `leader.md:82` for the prohibition | `a909216` | The definition block has no natural home — **High** | — |
| P-2 | Closure accepts exactly two states today | `consumer` | `akili-execute.md:330` — "neither a `PASS` nor a `REVIEW_WAIVED` … is not closable" | `a909216` | FR-4's third state is unnecessary — **High** | — |
| P-3 | The `/goal` condition names the same two states | `consumer` | `akili-execute.md:283` | `a909216` | Unattended runs stall on skipped tasks — Low | — |
| P-4 | `/akili-resume` interprets `REVIEW_WAIVED` blocks explicitly | `consumer` | `akili-resume.md:48` | `a909216` | Surface 13 is unnecessary — Low | — |
| P-5 | The `kaizen` clean-run predicate keys on waiver flags | `consumer` | `kaizen/SKILL.md:74` — clean if "no `REVIEW_WAIVED` waiver flagged `inline` or `same-model`" | `a909216` | A skipped task with an escaped defect reads as a clean run — **High** | — |
| P-6 | The `kaizen` Measure table and report template each carry a waiver row | `consumer` | `kaizen/SKILL.md:70` and `:159` | `a909216` | Surface 14 shrinks — Low | — |
| P-7 | `/akili-archive` cites the skill's Measure table rather than restating it | `existence` | `akili-archive.md:151` — "Extract the improvement signals listed in the skill's Measure table" | `a909216` | A sixteenth surface is needed — Low | — |
| P-8 | `reviewer.md` bands depth by LOC and binds no effort | `location` | `reviewer.md:43–45` | `a909216` | FR-6 has nothing to amend — Low | — |
| P-9 | The registry sets T2 `sonnet` and T3 `opus` *(≠ T2)* | `data-env` | `docs/model-routing.md` model registry table | `a909216` | FR-7's "default to T2" names the wrong tier — Low | — |
| P-10 | No existing rule permits closing without a Reviewer | `existence` | `/usr/bin/grep -rn -i "skip the reviewer\|without a reviewer\|no reviewer\|reviewer optional\|omit the reviewer" .claude/commands .claude/templates` → 1 hit, `akili-execute.md:320`, the waiver record | `a909216` | The change is partly redundant — **High** | — |
| P-11 | Falsifiers are executed on roughly half of tasks today | `data-env` | `/usr/bin/grep -c -i "falsifier.*execut\|execut.*falsifier" docs/specs/changes/premise-ledger/execution.md` → 6, in five of ten tasks | `a909216` | The predicate's incentive claim is overstated — Low | — |
| P-12 | `implementer.md` and `tester.md` belong to an adjacent open spec | `other` | `docs/specs/changes/scoped-constitution-reads/proposal.md` §5 Scope rows for both files | `a909216` | NFR-7's parallel-safety claim fails — Low | — |
| P-13 | Archived execution logs supply ~59 held-out task records for the closure gate | `existence` | Loop over `docs/specs/archive/*/execution.md` counting task records → ten specs, 6+1+6+5+6+7+2+9+7+10 | `a909216` | The closure gate has no held-out corpus and DD-13-style validation is impossible — **High** | — |
| P-14 | Every archived task whose Reviewer returned a FAIL would be forced to review by an override | `consumer` | `UNVERIFIED — confirm at source before relying on it` | — | NFR-6 is refuted and the predicate must change — **High** | Settled by the closure task, which applies the predicate to every archived FAIL task. Owner: the closure task |

## 12. Reversion Challenge (Step 2.3) — outcome

| DD | Removes | Question: what does removing it break? | Answer |
|---|---|---|---|
| DD-8 | The absolute reading of `leader.md:82` — "never collapse it" | Any reader relying on the gate being unconditional; any future agent tempted to skip for convenience | **One real hazard found and closed in the design.** The sentence does two jobs: it forbids collapsing for efficiency *and* it names the rationalization ("I already verified this, the Reviewer is redundant") that the Reviewer exists to catch. Deleting it would lose both. The amendment therefore keeps both halves in the same paragraph and adds the predicate-cleared skip as a third, distinct act — so a reader who reaches the permission has already read the prohibition and the named bias. Recorded as the reason the paragraph is amended in place rather than replaced |

No other DD removes delivered behavior; the rest add rules or widen an existing one.

## 13. Budget (Step 2.4 — tripwire for `/akili-execute`)

| Measure | Estimate |
|---|---|
| Tasks | **9** — definition block · execute closure + `/goal` + record · `leader.md` · `reviewer.md` · specify field + checklist · constitution + resume · kaizen · mirrors and changelog · closure gate |
| Shipped lines (added or changed, packaged files and mirrors) | **~120** |
| Review rounds | **10** — one per task plus two rework rounds |

Nine prose tasks across seven packaged files match **Standard**. Nothing pushes to Full: no data, API, auth, or installer surface, and the risk is handled by FR-9's trial rather than by rollout machinery. Nothing allows Lite: one definition with nine citing surfaces and a changed enumeration is exactly where restatement drift happens.
