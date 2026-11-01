# Requirements: Design Skill Routing — Impeccable builds, and every design skill has a stated job

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/design-skill-routing` |
| Depth | **Standard**. Methodology text across one skill reference, five commands, three adapted skills, docs and contract tests. No installer or `bin/` code change |
| Type | Change |
| Deliverable | `software` |
| Approval Mode | `pre-approved (JC, 2026-11-01 10:04 UTC-5, via Grok Bot)` — routine gates only; HALT, Pivot, budget tripwire, `FATAL_FAIL`, escalation, HITL items, scope growth and requirement amendments stop. Wording quoted in `proposal.md` → *Approval Mode change*. Was `gated` until then |
| Status | Phase 1 **approved — JC, 2026-11-01 10:04 UTC-5, via Grok Bot ("Requisitos: continuar")**. Revision 2 (same date) applies the judgment-day corrections JC ordered ("Corrige J-1 a J-5 y las advertencias sin volver a juzgar"), listed in §8a |
| Date | 2026-11-01 |
| Proposal | `proposal.md`, approved by JC 2026-11-01 09:41 UTC-5 (chat with Methodology), decisions D1–D5 |
| Format source | `docs/specs/archive/2026-10-31-changes--impeccable-hardening/requirements.md`. There is no `docs/specs/general-setup/` (`ls docs/specs/general-setup` → `No such file or directory`, 2026-11-01) |
| Verified at | `883dfa9` (proposal commit rebased on `origin/dev` `6063d8c`) |
| Release | **Minor** (recorded only). No push, PR, tag, release or publish in this cycle |

## 2. Executive Summary

Impeccable already leads design **direction** and **evaluation** in AKILI. At **build** time it only hands the Implementer its craft floor — a quality floor, not a method. And nothing routes a design activity to a skill by the **project's environment**.

This spec adds one **Design Routing Matrix** (activity × environment → lead, support, must-not-decide), held once in `impeccable-bridge`, and wires it so that:

- every UI task names the Impeccable playbook it builds with, then runs the craft floor and a `polish` pass;
- motion, mockups and stack skills (Tailwind, shadcn) each have one stated owner;
- every project gets a resolved `### Design routing` block, and this repository's `AGENTS.md` gets a `## Design Skills` section.

## 3. Glossary

| Term | Meaning |
|---|---|
| Design Routing Matrix | The single table mapping (activity, environment class) to a lead skill, supporting skills and what each must not decide |
| Activity | One of: **foundation**, **direction**, **mockup**, **build-new**, **build-within-system**, **refine**, **motion**, **evaluate** |
| Environment class | **ENV-0** Impeccable skill source `missing` · **ENV-1** no established visual world · **ENV-2** established visual world (design system, component library or coherent identity in code) · **ENV-3** native mobile surface. Named `ENV-*` so they never read as the `design-evaluation.md` steps `E0`–`E7` |
| Established visual world | Impeccable's term: a coherent identity already in code, with or without a `DESIGN.md` (`impeccable/reference/new-work.md` → *Decide what is already true*) |
| Playbook | The Impeccable command reference a task builds with (`new-work`, `layout`, `typeset`, `colorize`, `bolder`, `quieter`, `animate`, `harden`, `onboard`, `adapt`, `clarify`, `distill`, `extract`, `optimize`) |
| Polish depth | **full** (Persuade, Experience screens) or **light** (Operate, Read screens) — decision D2 |
| Expertise card | Per skill: expert at · supports · must not decide · evidence (a file and section of that skill's own text) |
| Implementation layer | A stack skill that implements an approved decision in a framework (e.g. Tailwind tokens, shadcn primitives) and never chooses the aesthetic |

## 4. System Context & Scope

Today, at `883dfa9`:

| Fact | Evidence (as run) |
|---|---|
| At build time the Implementer gets only Impeccable's craft floor | `.claude/skills/impeccable-bridge/SKILL.md:146` (Phase map row *Craft floor before UI edits*) and `:120`; `.claude/commands/akili-specify.md:462` |
| Specify loads `gsap-animation` for any animation | `.claude/commands/akili-specify.md:235` |
| Impeccable implements motion with the Web Animations API or the project's existing motion library | `.claude/skills/impeccable/reference/animate.md:66` |
| Impeccable inherits an established world rather than replacing it | `.claude/skills/impeccable/reference/new-work.md:12` |
| Propose recommends Stitch first and offers Impeccable's picker as an alternative | `.claude/commands/akili-propose.md:132`, `:136` |
| Repo `AGENTS.md` names the pre-Impeccable chain for UI work | `AGENTS.md:51` |
| `/akili-seo` picks `ui-ux-pro-max`, else `frontend-design`, bypassing the bridge | `.claude/commands/akili-seo.md:157-159` |
| `docs/commands/akili-constitution.md` still lists the Step 4 skills as `ui-ux-pro-max`, or `frontend-design` + `stitch-design` | `docs/commands/akili-constitution.md:121` |
| `new-work` spawns an `impeccable-finish-reviewer` agent AKILI does not ship; a degraded inline version exists | `grep -rl impeccable-finish-reviewer .claude bin docs scripts` (excluding `docs/specs`) → only `.claude/skills/impeccable/reference/new-work.md`; `ls .claude/agents` → no such directory; `.claude/skills/impeccable/reference/degraded/finish-reviewer.md` exists |
| Constitution Step 8D scaffolds a `## Skill Map` of stack skills only | `.claude/commands/akili-constitution.md` → *Step 8D: Scaffold the Skill Map* |

**In scope:** proposal §5 as approved (D1–D5).
**Out of scope:** proposal §6 — no new command, no edit to the vendored `impeccable/` folder, no skill added or removed, no change to the engine/detector/waiver/consent rules, `shadcn-ui` authorship (D4, separate spec).

## 5. Stakeholders / Personas

| Persona | Need |
|---|---|
| Developer using AKILI on a UI project (JC) | Distinctive, professional, non-generic UI built — not only reviewed — with Impeccable |
| Leader / Implementer agents | One answer to "which skill, for this activity, in this project" without reading every design skill |
| Reviewer agent | Evidence in `execution.md` that the named playbook, the craft floor and `polish` ran |
| AKILI maintainer | Routing held once; a test that fails when it drifts or is restated |
| Upstream authors (Paul Bakaus, Anthropic, Google, GSAP, others) | Their skills described by their own text, not over-claimed |

## 6. Functional Requirements

### FR-1: One Design Routing Matrix

The bridge SHALL ship one Design Routing Matrix covering every activity in the Glossary × every environment class ENV-0 – ENV-3, naming **one lead per cell**; the supporting skills SHALL be named once on the matrix's supporting line, and what each skill must not decide SHALL be on its expertise card.

#### Scenario: Every packaged design skill is placed

- GIVEN the packaged design skills `impeccable`, `impeccable-bridge`, `ui-ux-pro-max`, `frontend-design`, `stitch-design`, `gsap-animation`, `tailwind-design-system`, `shadcn-ui`
- WHEN the matrix is read
- THEN each skill appears in at least one cell or expertise card with a stated role
- BUT it must NOT name two lead skills for the same cell, nor leave a cell without a lead (a cell that does not apply names the activity to use instead)
- AND IT MUST name the ENV-0 lead as the existing fallback (`frontend-design` for direction and craft), unchanged, with `ui-ux-pro-max` as support

#### Scenario: Held once

- GIVEN any command, persona, adapted skill or doc that refers to design routing
- WHEN it needs a routing answer
- THEN it points at the matrix by name
- BUT it must NOT restate matrix rows (a restated row is the drift this spec removes)

### FR-2: Environment classification

Before design work on a spec, the design phase SHALL record the environment class of each screen in scope with its evidence, and the class SHALL select the matrix column.

#### Scenario: Established design system

- GIVEN a project whose code has a component library or tokens that form a coherent identity, with or without `DESIGN.md`
- WHEN `/akili-specify` classifies the screens
- THEN they are ENV-2 and the build activity is **build-within-system**
- AND IT MUST cite the evidence (a token file, a component directory, or `docs/ux-ui/design.md` sections)
- BUT it must NOT classify ENV-1 on the sole ground that `DESIGN.md` is missing

#### Scenario: Precedence

- GIVEN the Impeccable skill source is `missing`
- WHEN any screen is classified
- THEN it is ENV-0, whatever its other evidence
- AND a native iOS/Android/adaptive screen with the skill present is ENV-3; a project with web and native screens is classified per screen

### FR-3: Expertise cards

The matrix SHALL carry one expertise card per design skill: expert at, supports, must not decide, and evidence naming a file and section heading of that skill's own text.

#### Scenario: Card evidence resolves

- GIVEN an expertise card
- WHEN its evidence is followed
- THEN the named file exists and contains the named heading
- BUT the card must NOT cite a line number (KZ-005) or claim a capability its cited text does not state

### FR-4: Build with Impeccable

A UI task in `/akili-execute` SHALL be built with the Impeccable playbook(s) its `tasks.md` entry names, under the direction recorded in the spec's `design.md`.

#### Scenario: Named playbook

- GIVEN a UI task whose entry names the playbook `layout` and environment ENV-2
- WHEN the Implementer runs it with skill source `vendored`
- THEN it runs Impeccable's Setup, follows the `layout` reference, reads the craft floor immediately before UI edits, then runs `polish` at the task's depth
- AND IT MUST report the playbook(s), the polish depth and the polish result in its completion report, which the Leader logs in `execution.md` and names in the Reviewer brief
- BUT it must NOT load Impeccable references the task does not name, beyond Setup, the craft floor and `polish`

#### Scenario: Direction is settled before execute

- GIVEN `design.md` records the approved direction
- WHEN a playbook would open a new direction round (a decision page, a dealt structure, a comp round, a replacement `DESIGN.md`)
- THEN the Implementer does not open it and builds **code-led** against the recorded direction, with no mockup or image generation
- AND the questions a playbook asks before building are answered from the spec's `design.md`; a question `design.md` does not answer is a spec gap handled by the Pivot Protocol, never decided by the Implementer

#### Scenario: Skill source missing

- GIVEN skill source `missing` (ENV-0)
- WHEN the UI task runs
- THEN the Implementer follows `frontend-design`, as today, and its completion report records the gap (skill source `missing`)
- BUT it must NOT fail or stop the task for the missing skill

### FR-5: Polish on every UI task (D2)

Every UI task SHALL end with an Impeccable `polish` pass before the Reviewer is spawned — **full** on Persuade and Experience screens, **light** on Operate and Read screens. Full and light are an **AKILI scope limit** on `polish`, not an upstream mode; upstream's own rules apply inside the limit.

#### Scenario: Light pass

- GIVEN an Operate screen (an admin table)
- WHEN `polish` runs light
- THEN it covers only the task's changed surface, fixes local defects and one-off implementations, and reports missing tokens and conceptual mismatches without fixing them
- BUT it must NOT replace the incumbent visual world (polish is "refinement, never concealed redesign" — `impeccable/reference/polish.md`)

#### Scenario: Full pass

- GIVEN a Persuade screen (a pricing page)
- WHEN `polish` runs full
- THEN it covers the whole screen in task scope, including missing tokens the task may add to the design authority under its approved design

### FR-6: Impeccable's finish review does not run inside AKILI execute

*(Revision 2 — judgment J-1/S-1: upstream forbids the finish review inside the build thread and allows an in-thread substitute only on a harness with no subagent capability; its input packet also needs a roll and screenshots that execute does not produce.)*

When a playbook calls for Impeccable's finish reviewer during `/akili-execute`, the Implementer SHALL NOT run it and SHALL report `finish review: not run (AKILI execute)`; the build's quality evidence SHALL be the `polish` pass, the AKILI Reviewer and the `/akili-validate` design gate (critique and audit).

#### Scenario: new-work task

- GIVEN a task whose playbook is `new-work`
- WHEN the Implementer reaches the finish-review step
- THEN it skips it and reports `finish review: not run (AKILI execute)`
- AND the AKILI Reviewer is spawned per `/akili-execute` Step 2.3 as for any task
- BUT it must NOT run the degraded inline pass inside its own build thread, and must NOT present the skip as a review

### FR-7: Motion has one owner per concern

Impeccable's `animate` SHALL own motion purpose, choreography and reduced-motion behavior; implementation SHALL use the project's existing motion library, with `gsap-animation` loaded only when GSAP is that library or the approved design chooses GSAP.

#### Scenario: Project without GSAP

- GIVEN a project with no motion library and a design asking for a state-change transition
- WHEN the motion task is specified
- THEN the task names the `animate` playbook and CSS / Web Animations API as the implementation
- BUT it must NOT add GSAP to the project unless `design.md` records that decision

#### Scenario: Native screen

- GIVEN an ENV-3 screen
- THEN motion follows the platform guidance Impeccable names, and `gsap-animation` is not loaded

### FR-8: Mockup route (D3)

When the Impeccable skill source is `vendored` or `user-installed`, `/akili-propose`'s Mockup Fallback SHALL offer Impeccable's direction picker first; Stitch SHALL be used when the user asks for it.

#### Scenario: Default offer

- GIVEN a UI change with no visual input and skill source `vendored`
- WHEN the Mockup Fallback runs
- THEN the first offer is the Impeccable direction picker (comp-led or code-led), with the existing image-credit question for comp-led
- AND Stitch is named as available on request
- BUT it must NOT generate a Stitch mockup unless the user asked for Stitch

#### Scenario: Skill source missing

- GIVEN skill source `missing`
- THEN the existing order applies: `stitch-design`, then Claude Design, then a self-contained HTML sketch

### FR-9: Stack skills are implementation layers

`tailwind-design-system`, `shadcn-ui` and other stack skills SHALL implement approved design decisions and SHALL NOT choose the aesthetic; they SHALL reach agents only through the project `## Skill Map` and task skill lists (`docs/skills/governance.md` stack rule).

#### Scenario: shadcn project

- GIVEN a React project whose Skill Map lists `shadcn-ui` and `tailwind-design-system`
- WHEN a UI task is specified
- THEN its skills list `impeccable-bridge` plus those stack skills, the playbook decides layout and visual treatment, and the stack skills compose primitives and tokens
- BUT no command text may load-direct a stack skill without a Skill Map deferral

### FR-10: Per-project Design routing block

`/akili-constitution` Step 8D SHALL scaffold, under the project's `## Skill Map`, a `### Design routing` block resolved for that project: environment class(es) with evidence, design lead (Impeccable or the ENV-0 fallback), implementation layers from the Skill Map, motion library, and mockup route.

#### Scenario: Safe Update

- GIVEN a project whose `AGENTS.md` already holds a customized `### Design routing` block
- WHEN `/akili-constitution` runs in Safe Update mode
- THEN the block is preserved and only newly detected evidence is proposed for addition
- BUT it must NOT restate matrix rows; the block points at the matrix by name

### FR-11: Specify wiring

`/akili-specify` SHALL record the environment class in Step 2.1, replace its animation rule with the motion split (FR-7), and in Step 3.2 write for every UI task the playbook(s), the environment class and the polish depth into the task, with Done criteria requiring the FR-4 evidence.

#### Scenario: UI task entry

- GIVEN a spec with a Persuade landing page on an ENV-1 project
- WHEN tasks are written
- THEN the landing task names `new-work` (or the narrower playbook the design settles), environment ENV-1, polish depth full, and the skills `impeccable-bridge` plus any Skill Map stack skills
- AND IT MUST NOT name `ui-ux-pro-max` unless the task needs catalog options

### FR-12: Other command entry points

`/akili-seo`'s UX/UI recommendation rule SHALL go through `impeccable-bridge` (Impeccable leads; `ui-ux-pro-max` catalog; fallback on `missing`).

### FR-13: Repository guide and docs

This repository's `AGENTS.md` SHALL replace its UI-work bullet with a `## Design Skills` section stating the decision rule and pointing at the matrix; the docs that describe design-skill roles SHALL match the matrix.

#### Scenario: AGENTS.md matches the matrix

- GIVEN the `## Design Skills` section
- WHEN its skill list is compared with the matrix's expertise cards
- THEN the two name the same set of skills
- BUT the section must NOT restate matrix rows

#### Scenario: No surviving old routing phrasing

- GIVEN the shipped tree (`.claude/`, `docs/` outside `docs/specs/`, `README.md`, `AGENTS.md`)
- WHEN it is searched for the superseded phrasings (the craft floor as the whole build rule; `frontend-design` as a general UI option; Stitch as the first mockup recommendation; `ui-ux-pro-max` leading UI recommendations; `gsap-animation` for any animation)
- THEN none survives outside the ENV-0 fallback statements

### FR-14: Adapted skills point at the matrix

The AKILI integration sections of `ui-ux-pro-max`, `gsap-animation` and `frontend-design` SHALL state their role by pointing at the matrix, and SHALL NOT contradict it.

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | **Held once.** Matrix rows and expertise cards exist in exactly one file; every other surface names the matrix and its section, never a line number (KZ-005) |
| NFR-2 | **Vendored skill untouched.** No byte under `.claude/skills/impeccable/` changes; the existing vendor hash test stays green |
| NFR-3 | **Governance.** No command text load-directs a stack skill outside the three documented carve-outs (`docs/skills/governance.md` → *Rules of thumb*) |
| NFR-4 | **Token economy.** A UI task loads Impeccable's Setup, the named playbook reference(s), the craft floor and `polish` — never the whole reference folder |
| NFR-5 | **Tool-agnostic.** Invocation forms stay host-neutral (`/impeccable`, `$impeccable` in Codex); the matrix ships to all six install targets through the existing skill-folder copy |
| NFR-6 | **Minimal persona change.** *(Revision 2 — judgment J-3.)* Personas are not restructured. Only the skill **example** lines that contradict the matrix change: the Leader's swap examples and the Tester's skill-loading example. The build route reaches the Implementer through the task (its `Design route:` line and skill list) and the bridge it loads |
| NFR-7 | **Consent unchanged.** Image generation (comp-led) and engine download keep their existing consent rules in every approval mode |

## 8. Defect Classes and Gates

| Defect class | Gate |
|---|---|
| Matrix restated in a command, doc or skill (drift) | Contract test: matrix row signatures appear in exactly one file |
| Superseded phrasing survives (FR-13 sweep), persona examples included | Contract test over the shipped tree, keyed on the obligation phrasings and their paraphrases (KZ-changes--kaizen-loop-closure-2) |
| A design skill missing from the matrix or from `AGENTS.md` | Contract test comparing the packaged design-skill set, the expertise cards and the `## Design Skills` list |
| Expertise card cites a missing file or heading | Contract test resolving each card's evidence |
| Stack skill load-directed in command text | Contract test over `.claude/commands/` for the stack-skill names without a Skill Map deferral |
| Vendored Impeccable bytes changed | Existing `test/impeccable-vendor.test.js` |
| **Agents do not follow the routing in practice** (wrong lead, playbook skipped, polish skipped) | **No automated check.** Substitute: a held-out walkthrough task — three project profiles not cited in the matrix text, routed by a fresh agent from the shipped text alone and compared with the expected cells — presented at the HITL pause. Residual risk accepted until a real UI spec runs through `/akili-execute` |
| A routing cell is wrong design judgment (e.g. light polish too weak) | No automated check. Substitute: judgment-day on this design; JC's review at the Phase 2 gate. Accepted risk otherwise |

## 8a. Revision 2 amendments (judgment-day, ordered by JC 2026-11-01 10:04 UTC-5)

| Item | Change | Finding |
|---|---|---|
| Glossary and throughout | `E0`–`E3` → `ENV-0`–`ENV-3` | B-8 |
| FR-1 | One lead per cell; supporting line; no empty cell | W-1 |
| FR-4 | Evidence via completion report → Leader logs; code-led only; questions answered from `design.md`, else Pivot; ENV-0 gap reported | W-5, J-5, B-18 |
| FR-5 | Full/light labelled an AKILI scope limit | B-12 |
| FR-6 | Finish review not run in execute | J-1, S-1 |
| NFR-6 | Persona example lines may change | J-3 |
| §8 | Sweep covers persona examples | J-3 |

## 9. Requirement ID Index

| ID | Title | Proposal source |
|---|---|---|
| FR-1 | One Design Routing Matrix | §4, §9 ADDED |
| FR-2 | Environment classification | §9 ADDED |
| FR-3 | Expertise cards | §9 ADDED, G6 |
| FR-4 | Build with Impeccable | §9 MODIFIED, G1 |
| FR-5 | Polish on every UI task | D2 |
| FR-6 | Finish review not run in execute | discovered at specify; revised by J-1 |
| FR-7 | Motion owner per concern | §9 ADDED, G3 |
| FR-8 | Mockup route | D3, G4 |
| FR-9 | Stack skills as implementation layers | §9 ADDED, G2 |
| FR-10 | Per-project Design routing block | §5, G7 |
| FR-11 | Specify wiring | §5 |
| FR-12 | Other command entry points | G5 |
| FR-13 | Repository guide and docs | §5, G5 |
| FR-14 | Adapted skills point at the matrix | G5, G6 |
| NFR-1 – NFR-7 | See §7 | §6, R2, R6 |
