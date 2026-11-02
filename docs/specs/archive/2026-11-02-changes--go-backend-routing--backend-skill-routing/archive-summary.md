# Archive Summary — Backend Skill Routing

**Outcome: delivered and validated.** One Backend Routing Matrix (`software-architect/references/backend-routing.md`) now names one lead per backend decision, and specify, constitution Step 8D, the Leader persona, `AGENTS.md` and ten docs point at it. 9/9 tasks, `npm test` 1450/0, validation PASS (1 WARN, fixed). Local only — no push, PR, merge or release in this cycle.

## 1. Document Control

| Field | Value |
|---|---|
| Spec | `changes/go-backend-routing/backend-skill-routing` (family `changes/go-backend-routing`, child 2 of 2) |
| Archived | 2026-11-02 |
| Branch | `JuankCadavid/backend-skill-routing` (local; commits `9cecfd6` … `662e98d`) |
| Approval Mode | `gated`; JC widened routine task gates after T1 ("Sigue con T2 a T9 sin pausar entre tareas; para solo en enmiendas, fallos o al final") |
| Release | Minor (recorded only) |

## 2. Original Spec Path

`docs/specs/changes/go-backend-routing/backend-skill-routing/`

## 3. Archive Date

2026-11-02

## 4. Final Status

| Gate | Result |
|---|---|
| Tasks | 9/9 `[x]`, each closed by a Reviewer PASS (opus Reviewer, sonnet Implementers) |
| Tests | PASS — 1450 / 0 fail / 0 skipped; 31 spec tests (14 author + 17 Tester) |
| Validation | PASS — 7 PASS, 1 WARN (stale `execution.md` Summary; fixed by an addendum), 0 FAIL |

## 5. Requirements Delivered

| ID | Delivered by |
|---|---|
| FR-1 matrix, one lead, held once | T1 (`backend-routing.md`: 8 rules, 19 rows, 9 cards), T8 |
| FR-2 decision rule | T1 *Decision rule* |
| FR-3 context selects variant | T1 rows by significance / stack; `other` → `none — project conventions` |
| FR-4 expertise cards | T1 (headings quoted), A-2, A-6 |
| FR-5 Leader collisions | T5 (`.claude/templates/leader.md` item 3) |
| FR-6 specify wiring | T3 (Step 2.1 pointer, Step 3.2 *Preferred backend skill rule*) |
| FR-7 Step 8D block | T4 (item 5 + mode-policy bullet) |
| FR-8 guide and docs | T6 (`AGENTS.md` `## Backend Skills`, CHANGELOG), T7 (10 docs) |
| FR-9 Routing row, Go layering | T2, T1 *Go layering* |
| NFR-1..NFR-7 | T1–T8; test-report §7 |

Amendments approved by JC: A-1 (named-source leads, at design), A-2 (GraphQL evidence), A-3 (*project conventions* as third named source), A-4 (spec IDs stripped from the shipped file), A-5 (the row decides between named sources), A-6 (retry named in the error-model row and card).

## 6. Files Changed Summary

`git diff --shortstat 94215ce..HEAD -- . ':!docs/specs'` → 20 files, 689 insertions, 17 deletions.

| Area | Files |
|---|---|
| New | `.claude/skills/software-architect/references/backend-routing.md`, `test/backend-skill-routing.test.js`, `test/backend-skill-routing-coverage.test.js` |
| Rules text | `.claude/skills/software-architect/SKILL.md` (+1 row), `.claude/commands/akili-specify.md`, `.claude/commands/akili-constitution.md`, `.claude/templates/leader.md` (`primary-instructions` body) |
| Guide / release notes | `AGENTS.md`, `CHANGELOG.md` |
| Docs | `docs/skills/{software-architect,governance,nestjs-expert,aws-serverless,ai-agent-development,README}.md`, `docs/flow.md`, `docs/overview.md`, `docs/commands/{akili-specify,akili-constitution}.md` |
| Test count | `test/install-cursor.test.js` (317 → 318 packaged skill files) |

## 7. Test Evidence Summary

`test-report.md`: 1450/0/0; every spec test shown red under an executed falsifier. Scope invariants (routed skills, `impeccable-bridge`, `architecture-styles.md`, `## Design Skills` byte-unchanged) recorded as one-time evidence against `94215ce`, not as permanent tests.

## 8. Validation Summary

`validation-report.md`: independent opus auditor; PASS with W-1 (stale figures in `execution.md` → *Summary*), fixed by the addendum in commit `662e98d`. Cross-document figures (19 rows, 9 cards, 10 activities, ten docs, nine skills, three named sources, 318/332) all match HEAD.

## 9. Accepted Warnings Or Follow-Ups

| Item | Owner / route |
|---|---|
| Follow-up proposal candidates B (implement support cell vs line form), D (stack across rule 6), E (idempotency, SQS redrive / visibility timeout) | separate `/akili-propose` (JC: "B, D y E a propuesta aparte") — `execution.md` → *Follow-up proposal candidates* |
| Validation ADVISORY Q-1..Q-7 (test nits, `## Backend Skills` omissions, `docs/skills/golang-pro.md` "Guides … microservices" unqualified, FR-1 "file and section" wording, persona drift) | recorded; candidates for the follow-up proposal |
| Persona drift: deployed `.agents/leader.md` `primary-instructions`, `.agents/tester.md` `context-alignment` OUTDATED (untracked copies) | `akili doctor --agents --fix` (JC) |
| Go layer mapping inside `architecture-styles.md` | follow-up recorded since the proposal (FR-9) |
| Push, PR into `dev`, release minor | JC |
| CodeGraph re-index | recommended (`.codegraph/` exists) |

## 10. Historical Notes

- judgment-day round 1 on design rev. 1 → JC "Fix only" (rev. 2 fixed, not re-judged).
- Rework rounds: T1, T5, T6, T7, T9 evidence, A-6 — each one round; no HALT, pivot or `FATAL_FAIL`.
- T9 held-out walkthrough matched every expected lead; its ambiguity C was caused by A-3 and closed by A-5.
- `/akili-test` Leader rework removed commit-pinned byte checks from the shipped suite (they would turn red on legitimate edits and skip under CI's depth-1 checkout).

## 11. Diagrams

`design.md` §3 holds the one Mermaid slot (backend routing delivery path). No `diagrams/` folder; no baseline diagram slot made stale (the repo has no `docs/trd/trd.md`).
