# Requirements: Backend Skill Routing — one owner per backend decision

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/go-backend-routing/backend-skill-routing` |
| Parent Spec | `changes/go-backend-routing` (`family.md`, child 2; child 1 `golang-skill` done) |
| Depth | **Standard**. Methodology text across one new skill reference, two commands, one persona, repo `AGENTS.md`, docs and contract tests. No installer or `bin/` code change |
| Type | Change |
| Deliverable | `software` |
| Approval Mode | `gated` — every gate (phase approvals, judgment-day, tripwires, HITL) stops for JC. JC 2026-11-01 3:55 PM Bogotá: "ok" to start; "Detente en cada gate … no hagas push ni merge" |
| Status | **Revision 2**, Phase 1 **approved by JC 2026-11-02** ("Sí, aprueba requirements.md, haz commit y sigue a la fase 2"). Revision 1 was drafted 2026-11-01 by a session that died before the gate; revision 2 (2026-11-02, resumed session, Opus 5.5) re-verified its claims at `d8a9744` and closed five gaps: R-1 an open-ended lead exception (FR-1) replaced by a closed activity, **framework-selection**; R-2 no rule for tasks written before this change (FR-5); R-3 FR-6's "exactly" scoped to backend skills; R-4 a backend stack with no packaged skill (FR-7); R-5 FR-8 docs named, FR-9 given a scenario |
| Date | 2026-11-01 (rev. 1) · 2026-11-02 (rev. 2) |
| Proposal | `proposal.md`, **approved by JC 2026-11-01 9:56 UTC-5 — Option B**, release minor |
| Format source | `docs/specs/archive/2026-11-01-changes--design-skill-routing/requirements.md` (the schema this spec mirrors). There is no `docs/specs/general-setup/` (`ls docs/specs/general-setup` → `No such file or directory`, 2026-11-01) |
| Verified at | `d8a9744` (`origin/dev`, after #112, #113 and sync #116; 2.41.0 published) |
| Branch | `JuankCadavid/backend-skill-routing` (from `origin/dev`) |
| Release | **Minor** (recorded only). No push, PR, merge, tag or publish in this cycle |

## 2. Executive Summary

Backend stack skills claim decisions that AKILI's method skills own. `nestjs-expert` claims architecture, testing strategy and debugging; `golang-pro` starts its workflow with "Analyze architecture"; `error-handling-patterns` carries its own Go section. When two of them load for one task, nothing says which one decides.

This spec adds one **Backend Routing Matrix**, held once in `software-architect/references/backend-routing.md`, with the **same schema as the Design Routing Matrix** (activity × context → lead, support, must-not-decide; expertise cards citing each skill's own headings). One rule, worded in parallel with the design rule:

> **The method skill decides what and why; the stack skill decides how in this language or framework.**

It is wired so that:

- `/akili-specify` names one lead per backend decision in each backend task (`Backend route:` line);
- the Leader resolves a collision between two assigned skills from the matrix, and logs any deviation as today;
- every project with a backend stack gets a resolved `### Backend routing` block under its `## Skill Map`, and this repository's `AGENTS.md` gets a `## Backend Skills` section.

## 3. Glossary

| Term | Meaning |
|---|---|
| Backend Routing Matrix | The single table mapping (activity, context) to one lead skill, supporting skills and what each must not decide |
| Backend activity | One of: **architecture** (style, NFRs, ADRs, choice of stack), **framework-selection** (the framework, library family or runtime inside a stack already chosen), **module-design**, **api-contract**, **error-model**, **implement**, **test-first**, **test-suite**, **bug-diagnosis**, **performance** |
| Context | What selects a row's variant: **architecturally significant** or not (the `/akili-specify` Step 2.1 test), **Change** or **Bug** track, and the **stack** (Go · NestJS · AWS serverless · AI agent · other) from the project `## Skill Map` |
| Method skill | A skill that owns a decision independent of language: `software-architect` (`core`), `systematic-debugging` (`core`), `tdd` (`conditional`), `api-design-principles` (`stack`), `error-handling-patterns` (`stack`). The role is set by this matrix, not by the binding |
| Stack skill | In this spec, a skill that supplies language, framework or platform idiom: `golang-pro`, `nestjs-expert`, `aws-serverless`, `ai-agent-development` (all `binding: stack`). Not the same as `binding: stack`: two method skills above carry that binding too, which changes nothing in how they reach agents (Skill Map and task lists only) |
| Lead | The one skill whose rule wins for that decision |
| Support | A skill that supplies inputs or idiom under the lead's decision, never a competing rule |
| Expertise card | Per skill: expert at · supports · must not decide · evidence (a file and an exact heading of that skill's own text) |
| `Backend route:` line | One line in a backend task's Scope naming the lead per activity the task touches and the support skills |

## 4. System Context & Scope

Today, at `d8a9744`:

| Fact | Evidence (as run) |
|---|---|
| Stack skills claim method decisions | Proposal §3 rows O1–O5, re-cited in `design.md` Premise Ledger at `d8a9744` |
| `software-architect` maps layers for Node.js/TypeScript only | Proposal §3 O6; re-cited in the Premise Ledger |
| The Leader may augment, narrow or override task skills, with swap examples for UI, animation, video and `tdd`, and no rule for two backend skills claiming one decision | `.claude/templates/leader.md` → *Delegation Discipline* item 3; re-cited in the Premise Ledger |
| Stack skills reach agents only through the Skill Map and task lists; command text never load-directs them | `docs/skills/governance.md` → *Rules of thumb* |
| The Design Routing Matrix and its wiring are merged in `dev` and are the schema source | `.claude/skills/impeccable-bridge/references/design-routing.md` (119 lines, `wc -l` at `d8a9744`) |

**In scope:** proposal §5 as approved (Option B).
**Out of scope:** proposal §6 — no edit to `changes/design-skill-routing`'s files (`impeccable-bridge/**`, `design-routing.md`, repo `AGENTS.md` `## Design Skills`, Step 8D `### Design routing`); no merged "all skills" routing file; no body edit to third-party skills; no skill added, removed or re-bound; no Go layer mapping inside `architecture-styles.md` (follow-up); frontend stack skills stay in the design matrix.

## 5. Stakeholders / Personas

| Persona | Need |
|---|---|
| Developer using AKILI on a backend project (JC) | One clear instruction per decision; no contradictory skill rules reaching the Implementer |
| Leader / Implementer agents | One answer to "which skill decides this, here" without reading every backend skill |
| Reviewer agent | A task line and an `execution.md` entry it can audit against |
| AKILI maintainer | Routing held once, a test that fails when it drifts or is restated, coherence with the design matrix |
| Upstream authors of the third-party backend skills (named in each skill's frontmatter) | Their skills described by their own text, not over-claimed, never edited |

## 6. Functional Requirements

### FR-1: One Backend Routing Matrix

`software-architect` SHALL ship one Backend Routing Matrix covering every backend activity in the Glossary, naming **one lead per row and context**; supporting skills SHALL be named in the row's support cell, and what each skill must not decide SHALL be on its expertise card.

#### Scenario: Every packaged backend skill is placed

- GIVEN the packaged backend skills `software-architect`, `api-design-principles`, `error-handling-patterns`, `tdd`, `systematic-debugging`, `nestjs-expert`, `golang-pro`, `aws-serverless`, `ai-agent-development`
- WHEN the matrix is read
- THEN each skill appears in at least one row and has exactly one expertise card
- BUT it must NOT name two leads for one row and context, nor leave a row without a lead
- AND IT MUST name a stack skill (Glossary sense) as lead only for **implement** and **framework-selection**; every other activity has a method lead

#### Scenario: Held once

- GIVEN any command, persona, doc or the repo guide that refers to backend routing
- WHEN it needs a routing answer
- THEN it points at the matrix by file and section name
- BUT it must NOT restate a matrix row, nor point at it by line number (KZ-005)

### FR-2: Decision rule

The matrix SHALL open with the decision rule: the method skill decides what and why; the stack skill decides how in this language or framework; one lead per activity; supporting skills give inputs, not rules.

#### Scenario: Go service with tdd assigned

- GIVEN a Go backend task whose skills are `tdd` and `golang-pro`
- WHEN the Implementer writes tests first
- THEN expected values and seams come from `requirements.md` and `design.md` (`tdd` leads), and the test idiom (table-driven, `-race`) comes from `golang-pro` (support)
- BUT `golang-pro`'s coverage target must NOT override the spec's tests or its Done criteria

#### Scenario: NestJS bug

- GIVEN a Bug track task in a NestJS project
- WHEN the root cause is diagnosed
- THEN `systematic-debugging` leads the diagnosis and `nestjs-expert` supports with its DI and module knowledge
- BUT no fix is proposed before the root cause is confirmed

### FR-3: Context selects the variant

The matrix SHALL state how context selects a row's lead and support: the architecturally significant test decides whether `software-architect` leads **architecture** and **module-design**; the Bug track routes diagnosis to `systematic-debugging`; the stack from the project `## Skill Map` picks the support skill.

#### Scenario: Not architecturally significant

- GIVEN a change that adds a field to an existing endpoint, with no new module, data flow, topology or NFR impact
- WHEN its design is routed
- THEN `software-architect` is not loaded for it, and **module-design** follows the existing design
- BUT the stack skill must NOT introduce a new architecture style for it

#### Scenario: Stack absent from the Skill Map

- GIVEN a project whose stack has no packaged stack skill (context *other*)
- WHEN a backend row is read
- THEN the method lead stands and the support cell reads *none — project conventions*
- AND IT MUST NOT recommend installing a skill from command text

### FR-4: Expertise cards

The matrix SHALL carry one expertise card per backend skill in FR-1: expert at, supports, must not decide, and evidence naming a file and an exact heading of that skill's own text.

#### Scenario: Card evidence resolves

- GIVEN an expertise card
- WHEN its evidence is followed
- THEN the named file exists and contains the named heading
- BUT the card must NOT cite a line number (KZ-005), nor claim a capability its cited text does not state

### FR-5: Leader resolves collisions from the matrix

When two skills assigned to a task claim the same decision, the Leader SHALL take the lead named by the matrix and record any deviation from it with the existing skill-deviation record.

#### Scenario: Collision

- GIVEN a task whose list carries `nestjs-expert` and `software-architect`, and an architecturally significant design decision
- WHEN the Leader briefs the Implementer
- THEN the brief names `software-architect` as the lead for the architecture decision and `nestjs-expert` as support
- BUT the Leader must NOT pass the matrix itself to the Implementer; the brief carries only the lead and support names

#### Scenario: Task written before this change

- GIVEN a backend task with no `Backend route:` line (a `tasks.md` older than this change)
- WHEN the Leader selects its skills
- THEN the Leader consults the matrix only if two assigned skills claim one decision, and otherwise runs the task as today
- BUT the missing line must NOT fail, block or re-open the task

### FR-6: Specify wiring

`/akili-specify` SHALL point at the matrix in Step 2.1 next to the stack-skill list, and in Step 3.2 SHALL write into every backend task a `Backend route:` line naming the lead per activity the task touches and its support skills.

#### Scenario: Backend task entry

- GIVEN a spec for a Go service that adds an endpoint
- WHEN tasks are written
- THEN the endpoint task's Scope carries `Backend route:` naming `api-design-principles` as lead for the contract, `golang-pro` as support, and the implement lead
- AND every FR-1 backend skill in the task's skills list is named on the line, and every skill the line names is in the list (other skills, e.g. `cognitive-doc-design`, are unaffected)
- BUT the step must NOT load-direct a stack skill outside the Skill Map deferral

### FR-7: Per-project Backend routing block

For a project with a backend stack, `/akili-constitution` Step 8D SHALL scaffold, under the project's `## Skill Map`, a `### Backend routing` block resolved for that project: the stack(s) with evidence, the stack support skill per stack, and a pointer at the matrix.

#### Scenario: Backend stack with no packaged skill

- GIVEN a project with server-side code in a stack AKILI ships no skill for (e.g. Django)
- WHEN Step 8D runs
- THEN the block is scaffolded with that stack, its evidence, and support *none — project conventions*
- AND IT MUST NOT name an uninstalled skill as support

#### Scenario: Project with no backend

- GIVEN a project with no server-side code (a static site or a front-end-only app)
- WHEN Step 8D runs
- THEN no `### Backend routing` block is scaffolded

#### Scenario: Safe Update

- GIVEN a project whose guide already holds a customized `### Backend routing` block
- WHEN `/akili-constitution` runs in Safe Update mode
- THEN the block is preserved and only newly detected evidence is proposed
- BUT it must NOT restate matrix rows

#### Scenario: Coexists with Design routing

- GIVEN a full-stack project
- WHEN Step 8D runs
- THEN `### Design routing` and `### Backend routing` are siblings under `## Skill Map`
- BUT the `### Design routing` text must NOT change

### FR-8: Repository guide and docs

This repository's `AGENTS.md` SHALL carry a `## Backend Skills` section stating the decision rule and pointing at the matrix. `docs/skills/software-architect.md` and `docs/skills/governance.md` SHALL name the matrix; every other doc page that states a backend skill's role (the FR-1 skills' pages under `docs/skills/`, `docs/flow.md`, `docs/overview.md`, `docs/commands/`) SHALL not contradict it.

#### Scenario: AGENTS.md matches the matrix

- GIVEN the `## Backend Skills` section
- WHEN its skill list is compared with the matrix's expertise cards
- THEN the two name the same set of skills
- BUT the section must NOT restate matrix rows

### FR-9: software-architect points at the matrix

`software-architect/SKILL.md`'s routing table SHALL gain one row sending backend skill routing to `references/backend-routing.md`, and the matrix SHALL route Go layering to `golang-pro`'s `project-structure.md` reference (proposal O6).

#### Scenario: Go layering

- GIVEN an architecturally significant Go design
- WHEN `software-architect`'s *Routing* table is read for skill routing and Go layering
- THEN it names `references/backend-routing.md`, and that file sends Go package layering to `golang-pro` → `references/project-structure.md`
- BUT `architecture-styles.md` must NOT change (Go layer mapping is a follow-up)

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | **Held once.** Matrix rows and expertise cards exist in exactly one file; every other surface names the matrix and its section, never a line number (KZ-005) |
| NFR-2 | **Routed skills untouched.** No byte of the nine FR-1 skills changes except `software-architect/SKILL.md` (FR-9 row) and the new `software-architect/references/backend-routing.md`; seven are third-party (`api-design-principles`, `error-handling-patterns`, `tdd`, `systematic-debugging`, `nestjs-expert`, `golang-pro`, `aws-serverless`); the `golang-pro` hash lock stays green |
| NFR-3 | **Governance.** No command text load-directs a stack skill outside the documented carve-outs (`docs/skills/governance.md` → *Rules of thumb*) |
| NFR-4 | **Design spec untouched.** No byte of `impeccable-bridge/**`, the repo `AGENTS.md` `## Design Skills` section or the Step 8D `### Design routing` text changes |
| NFR-5 | **Token economy.** The Implementer receives lead and support names, not the matrix; the Leader reads the matrix only for a collision |
| NFR-6 | **Tool-agnostic.** The matrix ships to all six install targets through the existing skill-folder copy |
| NFR-7 | **Same schema as design.** Section names and card columns match the Design Routing Matrix where the concept is shared (*Decision rule*, *Matrix*, *Expertise cards*, route line, *Attribution*) |

## 8. Defect Classes and Gates

| Defect class | Gate |
|---|---|
| Matrix restated in a command, persona, doc or guide (drift) | Contract test: matrix row signatures appear in exactly one file |
| A backend skill missing from the matrix, its cards or `## Backend Skills` | Contract test comparing the FR-1 skill set, the cards and the section |
| Card cites a missing file or heading | Contract test resolving each card's evidence |
| Stack skill load-directed in command text | Existing governance test plus an assertion on the new Step 8D and Step 3.2 text |
| Design spec files changed | Contract test or `git diff --stat origin/dev` check on the NFR-4 paths |
| Third-party bytes changed | Existing `test/golang-skill.test.js` hash lock; `git diff --stat` on the NFR-2 folders |
| Persona section changed without digest awareness | Existing persona/digest tests |
| **Agents do not follow the routing in practice** (stack skill overrides the lead) | **No automated check.** Substitute: a held-out walkthrough — three backend task profiles not cited in the matrix text, routed by a fresh agent from the shipped text alone, compared with the expected leads, presented at the HITL pause. Residual risk accepted until a real backend spec runs through `/akili-execute` |
| A routing cell is wrong judgment | No automated check. Substitute: judgment-day on the design; JC at the Phase 2 gate |

## 9. Requirement ID Index

| ID | Title | Proposal source |
|---|---|---|
| FR-1 | One Backend Routing Matrix | §4, §9 ADDED |
| FR-2 | Decision rule | §4, §9 ADDED |
| FR-3 | Context selects the variant | §5 Contexts |
| FR-4 | Expertise cards | §4, R3 |
| FR-5 | Leader resolves collisions | §5 Leader, O7, R5 |
| FR-6 | Specify wiring | §5 Specify, §9 MODIFIED |
| FR-7 | Per-project Backend routing block | §5 Step 8D |
| FR-8 | Repository guide and docs | §5 AGENTS.md, Docs |
| FR-9 | software-architect pointer and Go layering route | §5 Matrix, O6, §6 |
| NFR-1 – NFR-7 | See §7 | §6, R2, R5 |
