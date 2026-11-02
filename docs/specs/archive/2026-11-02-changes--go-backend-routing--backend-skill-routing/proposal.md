# Proposal — Backend & Architecture Skill Routing

> **Answer first.** Yes, backend needs routing, but less of it than design. Stack skills are not the problem: the Skill Map already picks them by stack. The problem is that **stack skills claim decisions that method skills own**: `nestjs-expert` claims "architecture decisions, testing strategies… debugging", `golang-pro` starts with "Analyze architecture" and "designs… microservices", and `error-handling-patterns` carries its own Go section. When two of them load for the same task, nothing says which one decides. Recommended: one **Backend Routing Matrix** with the **same schema as `changes/design-skill-routing`** (activity × context → lead / support / must-not-decide, expertise cards citing each skill's own text, one lead/support rule). It is held once in `software-architect/references/backend-routing.md`; commands and the Leader point at it. Rule: **the method skill decides what and why; the stack skill decides how in this language.** Minor release, ~250 LOC of prose + ~250 LOC of contract tests.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/go-backend-routing/backend-skill-routing` |
| Parent Spec | `changes/go-backend-routing` |
| Slug | `backend-skill-routing` — derived from the free-text argument |
| Type | Change |
| Deliverable | software (methodology text + contract tests) |
| Approval Mode | gated (pre-approval in JC's 2026-11-01 9:56 mandate covers `golang-skill` only; this child waits for `changes/design-skill-routing` in `dev`) |
| Approval | **Approved by JC, 2026-11-01 9:56 UTC-5 — Option B**; release **minor** |
| Requirement source | JC brief, 2026-11-01 (pasted into the session). No Jira |
| Visual source | None — no UI surface. Confirmed by JC 2026-11-01 9:56: source is his message, no Jira/Figma |
| Depends on | `changes/go-backend-routing/golang-skill` (the matrix names `golang-pro`) · `changes/design-skill-routing` merged into `dev` (same command steps; schema to mirror) |
| Parallel-safe | no |
| Coherence constraint | Never edit `changes/design-skill-routing`'s files: `impeccable-bridge/**`, its `design-routing.md`, the `## Design Skills` section of repo `AGENTS.md`, the `### Design routing` block of Step 8D |
| Author | Claude (Opus 5.5) for JC, 2026-11-01 |

## 2. Intent

When a backend task loads more than one skill, every decision in it has one owner. Architecture, API contract, error model, test method and debugging method are decided by the method skill; the stack skill supplies the idiom. The rule has the same shape as the design rule, so an agent learns one pattern, not two.

## 3. Problem / Current Behavior

| # | Overlap | Citation |
|---|---|---|
| O1 | **Architecture.** `software-architect` owns style, NFRs, patterns and ADRs (loaded at constitution Step 5 and at specify for architecturally significant work). `nestjs-expert` claims "architecture decisions"; `golang-pro`'s workflow step 1 is "Analyze architecture" and its description says it "designs and builds microservices" | `.claude/commands/akili-constitution.md:249`; `.claude/commands/akili-specify.md:228`; `.claude/skills/nestjs-expert/SKILL.md:3`; upstream `golang-pro/SKILL.md` *Core Workflow* 1 + `description` (read 2026-11-01) |
| O2 | **Testing.** `tdd` (conditional, Leader-assigned) owns the red → green loop with expected values from `requirements.md`. `nestjs-expert` claims "testing strategies"; `golang-pro` mandates table-driven tests, `-race`, fuzzing, "80%+ coverage" | `.claude/templates/leader.md:25`; `.claude/skills/tdd/SKILL.md:48`; `nestjs-expert/SKILL.md:3,59`; upstream `golang-pro/SKILL.md` *Core Workflow* 6 |
| O3 | **Debugging.** `systematic-debugging` is `core` for bug flows. `nestjs-expert` claims "debugging complex dependency injection problems" with its own root-cause lists | `.claude/commands/akili-propose.md:111`; `nestjs-expert/SKILL.md:3,54` |
| O4 | **Error model.** `error-handling-patterns` is cross-language and carries a Go section; `golang-pro` mandates `%w` wrapping and "no panic for normal error handling"; `aws-serverless` ships its own handler error shape | `.claude/skills/error-handling-patterns/SKILL.md:61,340`; upstream `golang-pro/SKILL.md` *MUST DO*; `.claude/skills/aws-serverless/SKILL.md:20,59` |
| O5 | **API contract.** `api-design-principles` (REST/GraphQL) vs `golang-pro` (gRPC/REST microservices) vs `nestjs-expert` (controllers, guards) | `.claude/skills/api-design-principles/SKILL.md:84,259`; upstream `golang-pro` `description` |
| O6 | **Architecture-style gap for Go.** `software-architect`'s styles reference maps layers for "Node.js/TypeScript" only | `.claude/skills/software-architect/SKILL.md:63` |
| O7 | **No owner rule anywhere.** The Leader may "augment, narrow, or override" skills per task, with swap examples for UI, animation, video and `tdd`, but no rule for two backend skills claiming the same decision | `.claude/templates/leader.md:25` |
| O8 | Stack skills reach agents only through the Skill Map and per-task lists; commands must not load-direct them | `docs/skills/governance.md` → *Rules of thumb*, 3rd bullet |

Not observed: a measured mis-routing in an archived spec. The overlap is argued from the skills' own text (confidence 70 % in the family RICE).

## 4. Proposed Outcome

- One **Backend Routing Matrix**, held once, answering *for this activity, in this context, who leads, who supports, and who must not decide*.
- An **expertise card** per backend skill: *expert at · supports · must not decide · evidence (its own file:line)*.
- One **lead/support rule**, worded in parallel with the design rule: *the method skill decides what and why; the stack skill decides how in this language or framework.*
- `/akili-specify` task lists name the lead skill per backend task; the Leader resolves collisions from the matrix and logs any deviation, as today.
- Projects get a `### Backend routing` block under `## Skill Map` (Step 8D), listing only the rows whose stack the project has.

## 5. Scope

| In | Detail |
|---|---|
| Matrix | New `.claude/skills/software-architect/references/backend-routing.md`: activities × contexts table, expertise cards, the lead/support rule. `software-architect/SKILL.md` *Routing* table gains one row pointing at it |
| Activities | architecture & NFRs · module design · API contract · error model · implement · test-first · test suite · bug diagnosis · performance |
| Contexts | architecturally significant or not (the specify Step 2.1 test) · Change or Bug · stack (Go · NestJS · AWS serverless · AI agent · other) |
| Specify | Step 2.1: one pointer sentence next to the stack-skill list; Step 3 task-skill rule names the lead skill for backend tasks |
| Leader persona | One pointer in item 3 (*Delegation Discipline*): backend collisions resolve from the matrix (persona section → `digests.json` at release) |
| Constitution Step 8D | Scaffold `### Backend routing` from the detected stack, sibling of `### Design routing` |
| Repo `AGENTS.md` | A `## Backend Skills` section: the rule in a few lines and the pointer, mirroring `## Design Skills` |
| Docs | `docs/skills/software-architect.md`, `docs/skills/governance.md` (a sentence on routing matrices), `docs/flow.md` where it lists backend skills, `CHANGELOG.md` |
| Tests | Contract tests: matrix rows exist in one file only; every packaged backend skill (`software-architect`, `api-design-principles`, `error-handling-patterns`, `tdd`, `systematic-debugging`, `nestjs-expert`, `golang-pro`, `aws-serverless`, `ai-agent-development`) has a card; each card cites a line that exists; no command load-directs a stack skill (governance rule); `AGENTS.md` section names the same skill set |

## 6. Non-Goals

- No edit to `changes/design-skill-routing`'s files (Document Control).
- No shared "all skills" routing file merging design and backend. Possible follow-up once both matrices exist and their schema is proven identical.
- No body edits to third-party skills to delete their overlapping claims; the matrix overrides them at routing time.
- No new skill, no removal, no binding change.
- No Go layer mapping inside `architecture-styles.md` (O6). Recorded as a follow-up; the matrix routes Go layering to `golang-pro`'s `project-structure.md`.
- Frontend stack skills (`angular-developer`, `shadcn-ui`, …) belong to the design matrix; `angular-developer` appears here only for full-stack Angular SSR work, if specify finds the case.

## 7. Affected Users, Systems, And Specs

| Affected | How |
|---|---|
| Teams on backend projects | Tasks name one lead per decision; fewer contradictory instructions to the Implementer |
| `.claude/skills/software-architect/` | New reference + one routing row |
| `.claude/commands/akili-specify.md`, `akili-constitution.md` | Pointers in Step 2.1/3 and Step 8D |
| `.claude/templates/leader.md` | One pointer in item 3 |
| Repo `AGENTS.md`, `docs/` | Section + rows |
| `changes/design-skill-routing` | Schema source; untouched |

## 8. Visual Reference

- Source: None
- Location: —
- Notes: methodology text; no UI surface.

## 9. Requirement Delta Preview

### ADDED

- Backend Routing Matrix (activities × contexts → lead / support / must-not-decide) in `software-architect/references/backend-routing.md`.
- Expertise cards for the nine backend skills, each citing its own text.
- Lead/support rule: method skill decides what and why, stack skill decides how. First rows as a preview, to be settled at specify:

| Activity | Lead | Support | Must not decide |
|---|---|---|---|
| Architecture style, NFRs, ADRs | `software-architect` | stack skill (feasibility, idiom) | stack skill picks the style |
| API contract | `api-design-principles` | stack skill (transport: gRPC, controllers) | stack skill picks resource model or versioning |
| Error model | `error-handling-patterns` (taxonomy, propagation, degradation) | stack skill (Go `%w`, Nest filters, Lambda shape) | each owns only its half |
| Test-first loop (Leader assigned `tdd`) | `tdd` (loop, seams, values from `requirements.md`) | stack skill (table-driven, Jest idiom, `-race`) | stack skill sets coverage targets that override the spec |
| Bug diagnosis | `systematic-debugging` | stack skill (pprof, race detector, DI graph) | stack skill proposes a fix before root cause |
| Implement | stack skill | method skills as constraints already in `design.md` | — |

- `### Backend routing` block in the project Skill Map (Step 8D).
- Repo `AGENTS.md` `## Backend Skills` section.

### MODIFIED

- Specify Step 2.1/Step 3 task-skill rule; Leader item 3 gains a pointer.

### REMOVED

- None.

## 10. Approach Options

| | A — Rule only | **B — Matrix + cards, same schema as design** (recommended) | C — Edit the third-party skills |
|---|---|---|---|
| What | Add the lead/support sentence to repo `AGENTS.md` and `leader.md` | A + the matrix and cards held once, pointed at from specify, Leader and Step 8D | Remove overlapping claims from `nestjs-expert`, `golang-pro`, `error-handling-patterns` |
| Resolves O1–O5 | in principle; no per-activity owner | yes, per activity, tested | yes, but drifts from upstream on every refresh |
| Reaches installed projects | only through the persona | yes (packaged reference + Step 8D) | yes |
| Coherent with `design-skill-routing` | partly | yes, same schema | no |
| Size | ~30 LOC | ~250 prose + ~250 tests | ~150, plus a re-edit per upstream sync |

## 11. Recommended Approach

**Option B.** A alone states a rule without telling the Implementer which skill owns which decision. C rewrites third-party text and breaks attribution hygiene. B reuses a schema JC already chose for design (option B there too), so the two matrices read the same. It sits in `software-architect` because that skill already owns the architecture decisions the matrix routes, is AKILI-authored (no upstream to drift from), and already loads at constitution Step 5 and specify Step 2.1.

## 12. Risks, Dependencies, And Open Questions

| # | Item | Handling |
|---|---|---|
| R1 | `changes/design-skill-routing` (and PR #111 before it) not merged | Do not start `/akili-specify` until it merges; rebase on `dev`; copy its final schema, not its proposal draft |
| R2 | Matrix restated in commands (drift) | KZ-changes--kaizen-loop-closure-2: phrase-family grep before each Reviewer spawn; test that rows live in one file |
| R3 | Cards cite the skills' own lines; upstream refresh moves them | Cards cite headings, not line numbers, where the file is third-party (KZ-005) |
| R4 | Aggregate claims ("every backend skill has a card") | KZ-002: run the falsifying grep before writing it |
| R5 | Implementer token cost | Leader loads the matrix; Implementer receives only the task's lead + support names |
| R6 | Test budget | KZ-bugfix--init-ctrlc-abort-2: one assertion per THEN clause; ~250 LOC |
| Q1 | Is the overlap costly enough to act on now, without a measured mis-routing? | Proposed: yes, because adding `golang-pro` adds a third skill claiming architecture and testing. JC decides |
| Q2 | Should `ai-agent-development` (decision layer for agents) route here or stay standalone? | Proposed: one card here; it leads agent framework choice, `software-architect` leads overall style |
| Q3 | Merge with the design matrix later into one routing index? | Proposed: separate follow-up, after both ship |

## 13. Success Criteria

- A backend task in a generated `tasks.md` names one lead skill per decision it involves.
- With `golang-pro` and `tdd` both assigned, the Implementer's `execution.md` shows the expected values taken from `requirements.md` (tdd lead) and the table-driven idiom from `golang-pro` (support).
- `grep` finds the matrix rows in exactly one file; specify, Leader and Step 8D point to it.
- No file owned by `changes/design-skill-routing` appears in this spec's diff.
- `npm test`, `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` green.

## 14. Next Step

After child 1 is archived and `changes/design-skill-routing` merges into `dev`:

```text
/akili-specify changes/go-backend-routing/backend-skill-routing
```

Standard depth; `judgment-day` on the matrix design.
