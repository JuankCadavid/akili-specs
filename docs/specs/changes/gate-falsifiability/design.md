# Design: Gate Falsifiability

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/gate-falsifiability` |
| Depth | Standard |
| Status | Draft — Phase 2 |
| Date | 2026-09-18 |
| Source | `requirements.md` (Phase 1 approved 2026-09-18) |
| Reviewers | Step 2.3 reversion challenge **not triggered**: no design decision removes, disables, or inverts delivered behavior — every rule is appended, KZ-006's bullet keeps its wording and position (NFR-5). Recorded, not skipped by oversight |
| Consumer walk (KZ-changes--kaizen-loop-closure-1) | The four new task fields are a new enumerated set; §7 lists every existing consumer of a task's Verification and states what the fields do there — including two consumers this spec does not own (hand-offs, §10 DD-6) |

## 2. Executive Summary

Nothing structural changes. `/akili-specify` Step 3.2 gains one consolidated **Falsifiability** block that extends KZ-006 in five directions (expressible falsifier, assertion-level red, real-artifact lock, compile gate, Consumer Sweep) plus a rendered-measurement checklist for geometry gates; a task's Verification gains four named fields so the artifacts exist per task; the `tdd` skill names the two loop-level anti-patterns the corpus adds; the scaffolded `task.md` description names the same fields. Everything is stated by defect class with one corpus example per rule in a parenthetical, so the rules survive a stack change.

## 3. Architecture Overview

```
/akili-specify                                   consumers of a task's Verification
 ├─ Step 1.2 defect-class table  +2 rows          ┌──────────────────────────────────────┐
 ├─ Step 3.2 "each task includes" +4 fields ──────►│ tasks.md (per task):                 │
 ├─ Step 3.2 Falsifiability block (6 rules) ──────►│  Falsifier · Red run ·               │
 └─ Verification Checklist       +2 items         │  Disqualifier · Consumers            │
                                                  └───────┬──────────────┬───────────────┘
tdd skill  +2 anti-patterns, red-on-assertion ──► Implementer loop      │
/akili-constitution Step 7 item 3 ──► task.md template (scaffolded)     │
                                                                        ▼
                     hand-offs (files owned by changes/leader-brief-contract):
                     /akili-execute 2.2 brief copies the four fields · reviewer.md checks red run + mutation
```

**Rule shape (every rule in the block):** one sentence naming the defect class → one sentence naming what the task must state → one parenthetical corpus example with its falsifier. Three lines maximum. The block is led by the existing KZ-006 bullet, verbatim, followed by "This rule is necessary and not sufficient — the field shows five ways a named falsifier still certifies a defect:" and the five sub-bullets; the rendered-measurement checklist is a sixth sub-bullet gated on "when a gate asserts geometry".

## 4. Extended Directory Structure

No new files. Changed files only:

```
.claude/commands/akili-specify.md        Step 1.2 table · Step 3.2 list + block · Verification Checklist
.claude/skills/tdd/SKILL.md              Anti-patterns · Rules of the loop · AKILI Integration row
.claude/commands/akili-constitution.md   Step 7 item 3 (task.md description)
docs/commands/akili-specify.md · docs/skills/tdd.md · docs/commands/akili-constitution.md   mirrors
CHANGELOG.md                             Unreleased
```

## 5. Data Model — the task's Verification fields

| Field | Filled when | Value shape | Absent-value rule (KZ-004) |
|---|---|---|---|
| `Falsifier` | always | the mutation/input that yields FAIL **and** the fixture row(s) on which the reading diverges | never blank |
| `Red run` | the gate is a test | what the red failed on (assertion named); cited by the Implementer as evidence | `n/a (no test gate)` |
| `Disqualifier` | always | the condition under which a produced reading is worthless (existing rule, now a field) | never blank |
| `Consumers` | the task changes a shared exported symbol, DOM hook/selector, or event | the grep result: every test file that pins it, incl. CI-excluded/token-gated suites | `none (no shared symbol changed)` |

**Rendered-measurement checklist** (applies only when a gate asserts size, overflow, visibility, position, or containment): baseline · fonts · geometry-not-classes · ≥2 viewports incl. the squeeze band · effective CSS px with host zoom named · clip containment.

**`tdd` anti-pattern additions:**

| Anti-pattern | The tell |
|---|---|
| Inert fixture | mutate the logic and the test stays green — correct and plausible-wrong read the same |
| Plumbing test | delete the feature from the real file and the test stays green — the fragment under test was authored in the test |

## 6. API Design

Not applicable. The contract is the four field names and the six rule names; both are consumed by string in `tasks.md` and cited by name (KZ-005).

## 7. Backend Module Design — Surface Table and Consumer Walk

Sites by section, never by line (KZ-005).

| # | File | Section | Change |
|---|---|---|---|
| 1 | `.claude/commands/akili-specify.md` | Step 1.2, defect-class table | +2 rows: *compiler-only defect* (gate: the project's build/type-check command; no substitute needed); *layout/geometry defect* (gate: a rendered measurement per the Step 3.2 checklist; substitute: HITL look / T6 review — existing row wording) |
| 2 | 〃 | Step 3.2, "Each task should include" list | after `tests`: `verification fields — Falsifier, Red run, Disqualifier, Consumers (see the Falsifiability block)` |
| 3 | 〃 | Step 3.2, task quality rules — the KZ-006 bullet | becomes the **Falsifiability** block lead: KZ-006 text unchanged, then the five sub-rules (FR-1 expressible falsifier; FR-2 assertion-level red; FR-3 real-artifact lock; FR-4 compile gate; FR-5 Consumer Sweep) and the FR-6 checklist sub-bullet; each with one corpus example |
| 4 | 〃 | Step 3.2, the presence-assertion bullet | unchanged text; gains one trailing clause pointing at the block's real-artifact-lock rule by name (no duplication of the rule) |
| 5 | 〃 | Verification Checklist | +2 items: every task carries the four fields with the absent-value rule; every geometry gate satisfies the checklist |
| 6 | `.claude/skills/tdd/SKILL.md` | Anti-patterns | +2 bullets (inert fixture; plumbing test) with their tells |
| 7 | 〃 | Rules of the loop | "Red before green" gains: the red fails on the behavioral assertion — a red on setup, an intercept, a timeout, or a mock that never reaches the timing under test is not a red |
| 8 | 〃 | AKILI Integration, "Verification evidence" row | the cited red names what it failed on; a red that failed in setup is reported as not-a-red |
| 9 | `.claude/commands/akili-constitution.md` | Step 7 item 3 | `task.md` description names the four Verification fields and the absent-value rule |
| 10 | `docs/commands/akili-specify.md`, `docs/skills/tdd.md`, `docs/commands/akili-constitution.md` | the mirrored sections | parity |
| 11 | `CHANGELOG.md` | Unreleased | Added: Falsifiability block, four fields, `tdd` anti-patterns; classification per user decision |

**Consumer walk — every existing consumer of a task's Verification, and what the new fields do there:**

| Consumer | Owned by | What changes |
|---|---|---|
| `/akili-specify` Step 3.2 author | this spec | writes the fields (rows 2–3) |
| `/akili-specify` Verification Checklist | this spec | checks the fields exist (row 5) |
| `task.md` template (scaffolded) | this spec | carries the fields (row 9) |
| `tdd` skill (Implementer loop) | this spec | produces the assertion-level red the `Red run` field cites (rows 7–8) |
| `/akili-execute` Step 2.2 brief — "the verification command to run before reporting completion (copied)" | `changes/leader-brief-contract` | **hand-off:** the brief copies `Falsifier`, `Red run`, `Consumers` with the command, so the Implementer runs the consumer suites and reports the red (DD-6) |
| `reviewer.md` audit checklist | `changes/leader-brief-contract` | **hand-off (already in that proposal):** verify the recorded red run failed on the assertion; trace the mutation through the fixture |
| `/akili-test` Tester briefs — "the specific requirements + scenarios that suite must prove, and the project's test command" | neither spec | **no change required:** Testers prove scenarios, not tasks; they read `tasks.md` only for the test command. Recorded as checked, holds |
| `/akili-validate` | neither spec | reads requirements and evidence, not task fields — holds |

## 8. Frontend / UX Component Architecture

Not applicable.

## 9. Shared Contracts

| Contract | Before | After |
|---|---|---|
| Task Verification | a command + disqualifier + falsifying input (prose) | four named fields with an absent-value rule |
| KZ-006 bullet | standalone rule | lead of the Falsifiability block, wording unchanged |
| `tdd` anti-patterns | 3 | 5 |
| Step 1.2 defect-class table | n rows | n + 2 |

## 10. Design Decisions

### DD-1 — Extend KZ-006 in place; never restate it (NFR-5, KZ-005)
The corpus's failures are second-order: a falsifier was named and still did not bite. The fix belongs *under* the rule that names the falsifier, as sub-rules, so a reader who finds KZ-006 finds its limits in the same place. Rejected: a separate "test gates" section (a second home for the same idea is a drift site — KZ-changes--kaizen-loop-closure-2).

### DD-2 — Fields, not only prose
Three of the six classes passed with KZ-006 in force. A rule that is only prose is satisfied by omission; a named field with an absent-value rule (`n/a`, `none`) is an artifact a Reviewer can check for absence (KZ-004). The four names are chosen to be greppable and to survive translation into a scaffolded template.

### DD-3 — Rules by defect class, framework in the parenthetical (NFR-2)
The evidence project is Angular + Jest + Cypress + Tailwind. Every rule is phrased as the mechanism (a compiler stricter than its runner; a clipping ancestor; a swipe container's baseline; a suite CI skips) and the corpus example carries the framework name inside `(...)`. The framework grep in requirements §8 is the gate. Rejected: framework-specific gotchas in the methodology — they belong in the consuming project's guides, where the corpus already put them.

### DD-4 — The rendered-measurement checklist is conditional
It applies only to gates that assert geometry. Applying it to every task is the cost the proposal's risk table warns about; applying it to none is the corpus's ≥10 misses. The trigger is the assertion's subject, stated in the rule.

### DD-5 — `tdd` gets the loop-level half; Step 3.2 gets the authoring half
Inert fixtures and plumbing tests are discovered *while writing the test* (mutate → still green; delete from the real file → still green). Those tells belong in the Implementer's loop reference. The authoring-time obligations (name the diverging rows, name the real-artifact lock) belong where tasks are written. Same defect, two moments, two homes — cross-cited by name.

### DD-6 — Two consumers are handed off, not edited
The `/akili-execute` brief must copy the new fields to the Implementer, and `reviewer.md` must check the red run and trace the mutation. Both files belong to `changes/leader-brief-contract` (parallel, approved). This spec records the two lines it needs in that spec's proposal (the Reviewer line is already there; the brief-copy line is added by the Leader of that spec at its specify), and its own closure walkthrough checks only what this spec ships. If that spec does not ship, both lines become a follow-up here. Rejected: editing the files anyway — that breaks the parallel-safety both proposals declared.

### DD-7 — Retro-fit walkthrough as the behavioral gate (NFR-6, KZ-006)
Prose rules have no automated check. The substitute is a literal reader applying the shipped rules to five corpus gates that passed the old rules; the flagging sentence is quoted per case. A case no sentence flags is INCONCLUSIVE, which is a FAIL for the closing task — the same discipline `changes/kaizen-loop-closure` T6 used, which found three real gaps.

### DD-8 — No `/akili-test` change (consumer walk outcome)
Testers prove scenarios independently; the fields are task-side artifacts. Walked and recorded as holds, so a later reader does not assume it was overlooked.

## 11. Budget (Step 2.4 — tripwire for `/akili-execute`)

| Metric | Expected |
|---|---|
| Tasks | **5** |
| Changed/added lines | **~120** across 11 surface rows (prose) — specify ~45, tdd ~15, constitution ~4, mirrors ~40, CHANGELOG ~8 |
| Review rounds | **1 per task** — trip on the second FAIL of any one task |

Depth re-check: **Standard holds.** Eleven surface rows across three commands/skills and three mirrors is more than Lite; no cross-cutting contract or data risk pushes it to Full.
