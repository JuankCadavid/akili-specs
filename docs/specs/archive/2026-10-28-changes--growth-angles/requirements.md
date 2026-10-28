# Requirements: Growth angles for `/akili-marketing`, the growth track, and the flow figure

> **Answer first.** `/akili-marketing` learns the foundations → angles → approaches → hooks method. `brand-voice.md` gains four foundation sections. A seventh mode, `angles`, writes `docs/marketing/angles.md`: per pillar, up to 9 problems, desires, objections and beliefs, each with its source and approved per pillar through the existing gate. `campaign` and `post` then *select* one approved angle, one of five approaches and one of three hooks. Customer facts are asked once: marketing reads the PRD, and `/akili-constitution` reads a filled brand voice as cited defaults. The docs name SEO and Marketing as the **growth track**, and the flow figure draws that group and its link to `/akili-constitution`. No new command, no change to the four marketing invariants. Release class: **minor** (2.38.0, recorded only).

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/growth-angles` |
| Depth | **Standard** — prompt, skill-reference and docs changes plus a figure regeneration; no code path in `bin/` changes |
| Type | Change |
| Deliverable | `software` |
| Approval Mode | `gated` (proposal). **This specify run:** at the maintainer's instruction ("Answer process gates yourself with the recommended option … Stop and report when tasks.md is committed", Juan Carlos Cadavid, 2026-10-28) each gate takes its recommended option and is logged `auto-approved (user mandate, 2026-10-28)`. Escalations (severe judgment-day findings, budget misfit, proposal invalidation) still stop |
| Status | Phase 1 gate: `auto-approved (user mandate, 2026-10-28)` — recommended option **Continue** |
| Date | 2026-10-28 |
| Proposal | `proposal.md` — **Approved** 2026-10-28 06:42: option B, D-1…D-9 as recommended except **D-5 overridden** (figure redrawn here); story-bank open question accepted |
| Format source | `docs/specs/archive/2026-10-24-changes--akili-marketing/` — this repo has no `docs/specs/general-setup/` (`ls docs/specs/general-setup` → `No such file or directory`, as run 2026-10-28) |
| Verified at | `3ef3412` |
| Baseline tests | `npm test` → `# tests 1153`, `# pass 1153`, `# fail 0` (as run 2026-10-28 at `3ef3412`) |
| Reference input | A private, unapproved angle map supplied by the maintainer outside the repo. Read for structure only; **no content from it may enter the repo** (NFR-2) |

## 2. Executive Summary

Today `/akili-marketing` starts a post from a request and a pillar. The adopted method (structure credited to Nico Azero's content method; video not fetched) starts from written business foundations, derives a bounded map of angles per pillar, and lets the human choose angle, approach and hook at every stage. This spec adds that method to the existing command and skill without a new command and without touching the never-publish, approval, write-boundary or untrusted-content rules. It also removes the double interview between `/akili-constitution` and `/akili-marketing`, names SEO + Marketing as a growth track in the docs, and redraws the lifecycle figure to show it.

## 3. Glossary

| Term | Meaning |
|---|---|
| Foundations | The five inputs written before any angle: ideal customer (pains, desires, context), ideal follower, offer (result, what makes it unique), pillars (2–4), message (positioning, narrative; tone = the existing voice fingerprint) |
| Angle | One line, phrased the way the customer would say or feel it, of one **angle type**: problem (P), desire (D), objection (O) or belief (B) |
| Angle ID | `<pillar code>-<type letter><n>`, e.g. `ED-P3`. Pillar code: 1–3 uppercase letters, unique per map; `n` 1–9 |
| Angles map | `docs/marketing/angles.md` |
| Pillar section | One `##` section of the angles map holding one pillar's four lists, its `Status` and its Approval record |
| Approach | One of five ways to treat an angle: **expert**, **bridge**, **differentiator**, **social proof**, **connection** |
| Source | Where an angle came from: a foundation field, a PRD section, a story-bank part, or a user message of this conversation |
| Growth track | The documentation grouping of `/akili-seo` and `/akili-marketing`; not a command |
| Growth link | The figure edge between `/akili-constitution` and the growth group |

## 4. System Context & Scope

Today (at `3ef3412`):

- `brand-voice.md` has *Audience* (two lines: who the account is, who reads it) and *Content pillars*; no customer pains/desires/context, no ideal follower, no offer, no positioning or narrative — `.claude/skills/social-marketing/references/brand-voice-template.md:43-48`.
- `/akili-marketing` has six modes — `.claude/commands/akili-marketing.md:19-26`; Step 0.1 "list the six modes" — `:81`; pinned by `test/akili-marketing-command.test.js:94-95`, `:135-138`.
- A plan slot's angle is a free one-line text, sourced from user, brief or story bank, else `needs input` — `.claude/skills/social-marketing/references/planning-and-calendar.md:39-40`.
- `post` drafts one hook per platform; no candidate step — `.claude/commands/akili-marketing.md:106-128`.
- The command reads no PRD — `grep -n -i prd .claude/commands/akili-marketing.md` → no hit (as run).
- The PRD required structure has nine sections and no objections/beliefs section — `.claude/commands/akili-constitution.md:183-193`; no test pins that list (`grep -rn "Target Personas\|Required PRD" test/` → no hit, as run).
- `/akili-constitution` Step 2 reads no `docs/marketing/` file — `.claude/commands/akili-constitution.md:129-146`.
- The skill ships 12 files, pinned by `test/social-marketing-skill.test.js:29-42,113` and `test/social-marketing-install.test.js:35-48`; every reference must open with `Adapted from` or `AKILI-authored` — `test/social-marketing-skill.test.js:167-170`.
- The figure (`assets/akili-flow.svg`, 144,816 B; `assets/akili-flow-animated.svg`, 134,935 B; `assets/akili-flow.png`, 300,763 B, 1800 px) is an Archify `workflow` export with lanes `01 / Once per project`, `02 / Per-spec loop`, `03 / Anytime`, no group and no growth link — `test/flow-figure-contract.test.js:35-37`; sizes `ls -la assets` (as run). The animated file is generated from the static one by `scripts/animate-flow.js` and pinned by `test/flow-figure-animated*.test.js`.

**In scope:** FR-1…FR-9. **Out of scope:** a new command; SEO behavior; publishing; new platforms; fetching any URL; mass generation; forced migration of existing `brand-voice.md` files.

## 5. Stakeholders / Personas

| Persona | Need |
|---|---|
| Business owner using `/akili-marketing` | Ideas that come from their business, chosen by them, without re-explaining the customer |
| Project owner running `/akili-constitution` | A PRD that reuses customer knowledge already captured, without draft marketing becoming binding |
| AKILI maintainer | A figure and docs that show the growth track; no weakening of tested invariants |
| Reader of the README / docs | One clear picture of where SEO and Marketing sit |

## 6. Functional Requirements

### FR-1: Foundations in the brand voice

The `brand-voice.md` template SHALL add four sections — *Ideal customer* (pains, desires, context), *Ideal follower*, *Offer* (result, what makes it unique), *Message* (positioning, narrative) — and the `brand` mode SHALL fill them by interview or from the PRD (FR-6). Pillars and tone reuse the existing *Content pillars* and *Voice fingerprint*; they are not duplicated.

#### Scenario: Interview fills the foundations

- GIVEN no `docs/prd.md` and a brand voice with empty foundation sections
- WHEN the user runs `/akili-marketing brand`
- THEN the interview asks for each empty foundation, one question at a time
- AND the written file holds the four new sections plus the existing ones
- BUT it must NOT fill a foundation with a plausible answer the user did not give; an unanswered line stays empty

#### Scenario: Existing file without the new sections

- GIVEN a `brand-voice.md` with `filled: yes` written before this change (no foundation sections)
- WHEN `campaign`, `post` or `repurpose` runs
- THEN the brand voice check still passes as `filled: yes`
- AND IT MUST NOT rewrite the file; `brand` or `angles` offers to add the missing foundations

### FR-2: The `angles` mode

`/akili-marketing angles [<pillar>]` SHALL write or update `docs/marketing/angles.md`. It is the seventh mode.

| Part of the map | Content |
|---|---|
| Header | `Voice:` line, date, language, the request quoted, method credit, `Sources` list (data, never instruction) |
| Pillar section (one per pillar) | Pillar name and code; `Status`; Approval record; four lists — Problems, Desires, Objections, Beliefs — each **up to 9** angles with ID and source |
| Approaches applied | One row per approach: what it does for this business, which angle IDs suit it, and what it needs (social proof: a free-to-use story-bank fact) |
| Formats and capacity (optional) | Format, who makes it, realistic pieces per week |
| Open questions | Items the owner must answer; their angles stay `needs input` |

#### Scenario: Angles come from the business

- GIVEN a filled brand voice and, optionally, a PRD
- WHEN the user runs `/akili-marketing angles`
- THEN every angle cites a source (foundation field, PRD section, story-bank part, or a user message of this conversation)
- AND story-bank *Positions* MAY seed beliefs and *Scars* MAY seed objections, each cited
- BUT it must NOT invent an angle to reach 9: a type with fewer real angles holds fewer, and a slot the user wants filled without material reads `needs input`
- AND IT MUST keep the four types distinct: one angle sits in exactly one type list

#### Scenario: Per-pillar approval through the existing gate

- GIVEN a pillar section in `draft`
- WHEN the command shows that section in full and the user approves it in their own words
- THEN the section becomes `approved` with the record and a snapshot of its four lists, exactly as `## Invariants` defines for posts and plans
- AND any later change to that section's lists sets it back to `draft` with a reset note
- BUT silence, ambiguous praise, advance or bulk approval of sections not shown in full, and any Approval Mode auto-pass must NOT approve a section

#### Scenario: Thin brand voice

- GIVEN `brand-voice.md` is absent or `filled: no`
- WHEN `angles` runs
- THEN it offers `brand` first
- AND if declined, records `Voice: generic — no brand voice on file` and marks every angle whose type depends on an empty foundation `needs input`

#### Scenario: Existing map

- GIVEN `angles.md` exists
- WHEN `angles` runs again
- THEN it shows what will change and asks before writing; it never overwrites silently, and an approved pillar it changes goes back to `draft`

#### Scenario: No mass generation

- WHEN any mode runs
- THEN it must NOT produce posts or ideas for every angle × approach combination; posts are drafted one request or one approved plan slot at a time

### FR-3: Selection in `campaign` and `post`

Plan slots and posts SHALL select from the approved map rather than invent angles.

#### Scenario: Plan slot

- GIVEN an angles map with at least one approved pillar section
- WHEN `campaign` writes `plan.md`
- THEN each slot records `Angle` (one approved angle ID, optionally a second), `Approach` (one of the five) and three hook candidates
- AND a slot without an approved angle reads `Angle: needs input`
- BUT it must NOT cite an angle ID from a pillar section that is not validly `approved`

#### Scenario: Post picks angle, approach and hook

- GIVEN a `post` request naming or implying an angle
- WHEN the post is drafted
- THEN the header records `Angle:` and `Approach:`
- AND the command shows three hook candidates and drafts with the one the user picks; only the chosen hook reaches the card
- AND IT MUST NOT change the card fields, the approval card or the transition rules

#### Scenario: Refusal on an unapproved angle

- GIVEN a request citing an angle ID whose pillar section is not validly `approved`
- WHEN `post` or `campaign` runs
- THEN it refuses and names the missing pillar approval

#### Scenario: Social proof needs real proof

- GIVEN the approach `social proof`
- WHEN no story-bank fact marked free to use, brief fact or user-supplied fact supports it
- THEN the command asks for one or proposes another approach; it must NOT invent a testimonial, client name or figure

#### Scenario: No map yet

- GIVEN no `angles.md`
- WHEN `post` runs
- THEN it drafts as today and records `Angle: none — no angles map`; it offers `angles` once

### FR-4: The `angles-framework.md` reference

The skill SHALL ship `references/angles-framework.md`, AKILI-authored, defining the four angle types, the five approaches (each with what it does and *do not use when*), the sourcing rule, the ID scheme and the map shape, with one short generic English worked example (one pillar, an invented neutral business). Its first lines credit the structure to Nico Azero's content method, by name and video title, in AKILI's own words. `SKILL.md`'s integration table SHALL gain an `angles` row, and `campaign`/`post` rows SHALL load the new reference.

- BUT the example must NOT be derived from the maintainer's private reference map (NFR-2)
- AND IT MUST open with an `AKILI-authored` line (existing test rule)

### FR-5: PRD section and constitution reading the brand voice

`/akili-constitution` SHALL list an optional PRD section **Customer Objections & Beliefs**, filled only from material the user supplies (interviews, sales notes, a filled brand voice, an approved angles map), and SHALL, in Step 2, offer the foundations of a `filled: yes` `brand-voice.md` and the objections/beliefs of approved pillar sections as **proposed defaults** recorded as cited Assumptions.

#### Scenario: Constitution reuses the brand voice

- GIVEN `docs/marketing/brand-voice.md` with `filled: yes`
- WHEN `/akili-constitution` runs Step 2
- THEN it proposes the customer, offer and positioning as defaults, citing the file
- AND what the user does not confirm lands as an Assumption with that citation
- BUT a `filled: no` brand voice, a `draft` pillar section or any unapproved post must NOT be read as a source

#### Scenario: Optional section stays optional

- GIVEN no objections or beliefs material
- WHEN the PRD is written
- THEN the section is omitted or reads `none supplied`; it must NOT be fabricated (thin-seed rule)

### FR-6: Ask once — marketing reads the PRD

When `docs/prd.md` exists, `brand` and `angles` SHALL pre-fill customer, offer, objections and beliefs from *Target Personas*, *Problem Statement* and *Customer Objections & Beliefs*, citing the section, and ask only for what the PRD does not answer.

#### Scenario: PRD answers the customer

- GIVEN a PRD whose *Target Personas* states the customer's pains
- WHEN `brand` runs
- THEN it shows the pre-filled foundation with its citation and asks the user to confirm or edit
- AND it does not ask that question again
- BUT it must NOT write to `docs/prd.md` (write boundary unchanged)

#### Scenario: PRD and brand voice disagree

- GIVEN the PRD and `brand-voice.md` state different customers
- WHEN `brand` or `angles` runs
- THEN it shows both, cited, and the user decides; it never silently picks one

### FR-7: Growth track in the docs

README, `docs/overview.md`, `docs/flow.md`, `docs/README.md`, `docs/commands/akili-marketing.md` and `docs/skills/social-marketing.md` SHALL name `/akili-seo` and `/akili-marketing` as the growth track, document the `angles` mode and `angles.md`, and hold one table of what flows between the growth track and the baseline (PRD → brand voice/angles; brand voice/angles → constitution defaults; SEO report → none in this spec).

- BUT the README must NOT grow by more than 2 lines net
- AND IT MUST keep the "seven anytime commands" statements true (no command is added)

### FR-8: The flow figure shows the growth group and its link

`assets/akili-flow.svg`, `assets/akili-flow-animated.svg` and `assets/akili-flow.png` SHALL be regenerated together so the Anytime lane holds a group labelled **Growth track** containing `/akili-seo` and `/akili-marketing`, and a dashed edge connects `/akili-constitution` with that group, labelled with what flows.

#### Scenario: Static and raster figure

- WHEN the figure is regenerated
- THEN the three lanes, the eight loop nodes, edges `e1`–`e8`, the two Bug Track edges and every existing node label stay
- AND the SVG `<desc>` equals the `docs/flow.md` figure alt text, which names the growth group and its link
- AND IT MUST meet the existing caps: SVG ≤ 153,600 B each, PNG 1800 px wide and ≤ 409,600 B, font floor at 900 px

#### Scenario: Animated figure

- WHEN `scripts/animate-flow.js` regenerates the animated SVG from the new static one
- THEN the loop traces, node glows, Bug Track pulses, the 9 s cycle, three iterations then rest, and the reduced-motion rule are unchanged
- AND the staleness test passes against the committed file
- BUT the growth link must NOT add motion

#### Scenario: Tests updated deliberately

- WHEN figure tests change
- THEN each changed assertion is named in `tasks.md` with its old and new expectation, and new assertions pin the group label, its two members and the growth link
- BUT no assertion may be deleted or weakened without a replacement that is at least as strict

### FR-9: CHANGELOG

`CHANGELOG.md` `[Unreleased]` SHALL describe the change (seventh mode, foundations, selection, ask-once, PRD section, growth track, figure), credit Nico Azero's method by name, and state `Release class: minor`.

- AND IT MUST quote only what shipped (KZ-002)

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | The four `## Invariants` of `/akili-marketing` keep every existing sentence; the only permitted edit is an additive sentence extending the plan-approval sentence to pillar sections. Every existing invariant test passes unchanged |
| NFR-2 | **No content from the maintainer's private reference map enters the repo** — no business name, person, client, figure, angle text or Spanish phrase. Checked by a term grep run from outside the repo (the term list is never committed, because a committed list would itself leak the content) |
| NFR-3 | Docs in English; examples generic |
| NFR-4 | No new command, skill or install target; the skill file set grows from 12 to 13 and installers ship it unchanged in mechanism |
| NFR-5 | `npm test`, `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` pass |
| NFR-6 | No shipped file or test references `docs/specs/changes/growth-angles` (KZ-changes--archify-diagrams-1) |
| NFR-7 | The figure's Archify source used for regeneration is kept in the spec folder as `figure-source.json` so a later redraw does not depend on a temporary directory |

## 8. Defect Classes and Their Gates

| Defect class | Gate | Automated? |
|---|---|---|
| Mode, file or reference missing from command, skill or table | `test/akili-marketing-command.test.js`, `test/social-marketing-skill.test.js`, `test/social-marketing-install.test.js` (seven modes, 13 files, `angles` row) | Yes |
| Invariant sentence dropped or weakened (KZ-changes--gate-falsifiability-2) | Existing invariant tests unchanged + new literal per FR-2/FR-3 clause with a mutation check | Yes |
| Rule restated inconsistently across command, skill, docs (KZ-changes--kaizen-loop-closure-2) | Phrase-family sweep before review + restatement test for the pillar-approval sentence | Grep + test |
| Agent invents angles or approves itself at runtime | **Agent behaviour; not automatable.** Substitute: a dogfood walk of `brand` → `angles` → `post` in a scratch project at the HITL pause (pad request, ambiguous approval, unapproved-angle request) | Human |
| Private reference content leaks (NFR-2) | Term grep from the scratchpad over the diff, before every commit of the affected tasks; maintainer read at validation | Script outside repo + human |
| Figure: wrong structure, label, size, font floor | `test/flow-figure*.test.js` (updated) | Yes |
| Figure: overlaps, crossings, unreadable routing | Archify `validate --quality showcase` (0 errors, 0 warnings) + a rendered look at the PNG and the SVG as `<img>` (T6-capable read) | Tool + human/T6 |
| Animated figure: motion broken or not resting | Staleness and overlay tests + one rendered frame after 30 s compared with the static render | Yes + render |
| Overstated summary claim (KZ-002) | Quote-check every CHANGELOG/docs clause at HEAD; re-run counts after each phase | Review |

## 9. Requirement ID Index

Clause-level ownership: `tasks.md` §3.

| ID | Title |
|---|---|
| FR-1 | Foundations in the brand voice |
| FR-2 | `angles` mode |
| FR-3 | Selection in `campaign` and `post` |
| FR-4 | `angles-framework.md` reference |
| FR-5 | PRD section and constitution reads the brand voice |
| FR-6 | Marketing reads the PRD |
| FR-7 | Growth track in the docs |
| FR-8 | Flow figure |
| FR-9 | CHANGELOG |
| NFR-1…7 | See §7 |
