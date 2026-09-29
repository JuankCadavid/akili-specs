# Requirements: Scope the Worker Personas' Constitution Read

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/scoped-constitution-reads` |
| Depth | **Standard**. Re-checked against the design at Step 2.4 |
| Type | Change |
| Approval Mode | `gated`, inherited from `proposal.md` |
| Status | **Approved** (user, 2026-09-29) — OQ-1, OQ-2, OQ-3 accepted as recommended. **Amended 2026-09-29 after judgment day** (*Fix only*, chosen by the user): see §10 |
| Date | 2026-09-29 |
| Source | `proposal.md` (approved by the user 2026-09-29, Option B) |
| Format precedent | `docs/specs/archive/2026-09-29-changes--opus-5-5-rebaseline/requirements.md`. This repo has no `docs/specs/general-setup/`, `docs/prd.md`, `docs/trd/` or `docs/ux-ui/` (`ls` → `No such file or directory`, run 2026-09-29 at `3b66e40`) |
| Adjacent specs | None active. `changes/opus-5-5-rebaseline` (archived 2026-09-29) last edited both personas; its *Don't stop short* bullets are untouched by this spec |

## 2. Executive Summary

The Implementer and Tester personas tell every worker to read four documents whole before its task. This spec changes that to: **root guides in full, reference documents only at the sections the Leader names**, with a stated action for every state the Leader's naming can be in.

**Proposal alignment:** aligned with the approved proposal (Option B), with three changes found during exploration. All three need the user's decision at this gate.

| # | Finding | Effect on the proposal |
|---|---|---|
| 1 | The Tester is briefed by `/akili-test`, not `/akili-execute`. The proposal's scope table lists only `/akili-execute` | **Scope grows by one surface**: `.claude/commands/akili-test.md` and its `docs/commands/` mirror (FR-5) |
| 2 | The Implementer brief already carries section pointers for `trd.md`, and already names `docs/ux-ui/design.md` by path only, with a clause that leans on the persona's full read | The brief change is an **amendment of two existing bullets**, not one new item (FR-4) |
| 3 | The proposal's "~29k → under ~12k" was re-measured on STAR at 112,149 bytes, with sections from 0.8k to 5.7k bytes | The expected result is stated as a **range, ~9k–13k tokens**, not a ceiling (FR-8) |

## 3. Glossary

| Term | Meaning here |
|---|---|
| **Root guides** | The project's root `CLAUDE.md` and `AGENTS.md`. The rules that always bind |
| **Reference documents** | `docs/trd/trd.md` and `docs/ux-ui/design.md`. Consulted for the part a task touches |
| **Worker** | An Implementer or a Tester subagent. Never the Leader or the Reviewer |
| **Brief** | What the Leader hands a worker: the Implementer brief of `/akili-execute` Step 2.2, or the Tester's context slice of `/akili-test` Phase 1 |
| **Reference-section entry** | The brief's statement, per reference document, of which sections the work touches |
| **Bounded lookup** | Finding the relevant part of a reference document without reading the document whole. The mechanism is settled in `design.md` |
| **Host / non-host worker** | A worker that can or cannot resolve project paths. Defined in `docs/model-routing.md` → *Cross-host dispatch*, and cited by `/akili-execute` Step 2.2 |
| **Legacy path** | The older location of a reference document that the commands' Step 0 already lists: `docs/detailed-design/detailed-design.md` for the TRD, `docs/system-design/design.md` for the UX/UI design |

## 4. System Context & Scope

**Current behavior (each claim cited as run at `3b66e40`, or marked):**

| Claim | Evidence |
|---|---|
| Both worker personas mandate an unconditional read of four documents | `.claude/templates/implementer.md:14` and `.claude/templates/tester.md:14`, same sentence: *"**FIRST** consult the project constitution (`CLAUDE.md`, `AGENTS.md`, `docs/trd/trd.md`, `docs/ux-ui/design.md`) in a consistent order before reading task-specific files."* |
| The Reviewer persona carries no such mandate | `grep -n -i "prompt caching\|consult the project constitution" .claude/templates/reviewer.md` → 0 hits |
| The Leader's own load is bounded, and is ordered by the command's Step 0 | `.claude/templates/leader.md:14` |
| The Implementer brief already points at `trd.md` sections | `.claude/commands/akili-execute.md:167`: *"**pointers** to the relevant sections of `requirements.md`, `design.md`, and `trd.md`"* |
| The Implementer brief names `docs/ux-ui/design.md` by path only and relies on the persona's read order | `.claude/commands/akili-execute.md:168`: *"paths only; the Implementer's persona already orders its caching-friendly read sequence"* |
| The Reviewer brief names sections of both reference documents | `.claude/commands/akili-execute.md:235` |
| The Tester's context slice names no TRD or UX/UI design section | `grep -n -i "trd\|ux-ui" .claude/commands/akili-test.md` → 6 hits: `:93`, `:94` (the Leader's own Step 0 read), `:108` (inside Phase 1 item 2, where "TRD" names the owner of the test-runner decision), `:173` (*UX Testing Guidance*), `:188`, `:189`. None gives the slice a section of either document; the pointer rule (`:61`, under *Token discipline*) names `requirements.md` only |
| `/akili-test` asks for visual consistency with the design document on any spec with meaningful UI behavior | `.claude/commands/akili-test.md` → *UX Testing Guidance*: *"visual consistency with `docs/ux-ui/design.md`"* |
| Two checks say `tester.md` must not carry the design-token path, and the packaged file carries it today | `.claude/commands/akili-audit.md:55`: *"a design-token path in `tester.md` (which explicitly does not audit tokens)"*; `.claude/commands/akili-constitution.md:1161`: *"`tester.md` must **not** carry the design-token path"*; `.claude/templates/tester.md:14` |
| The Tester persona disclaims design-token audit, and the scaffold gives it neither reference path | `.claude/templates/tester.md:5`; `.claude/commands/akili-constitution.md` → *Injection scope* table, rows *Design-token path* and *`trd.md` path*, `tester.md` column `—` |
| The Implementer persona separately obliges design-token compliance | `.claude/templates/implementer.md:28` |
| `/akili-constitution` Safe Update never overwrites an existing persona; it appends an upgrade block | `.claude/commands/akili-constitution.md:424` |
| STAR's four documents total 112,149 bytes | `wc -c CLAUDE.md AGENTS.md docs/trd/trd.md docs/ux-ui/design.md` in `alliance-research-indicators-main` at `f25270d4` → 15,855 + 15,855 + 42,831 + 37,608 |
| STAR's reference documents hold 27 `## ` sections, 822 to 5,740 bytes each | `awk` section-size pass over both documents, same commit |
| Cache reads outweigh cache writes by about 17× across one session, which is why upfront load is paid more than once | `UNVERIFIED — confirm at source before relying on it`. Proposal telemetry: 3.3M cache read against 194.6k cache write, for one whole session and not per worker; no command in this repository reproduces it |
| Sibling workers share no prompt cache for their document reads | `UNVERIFIED — confirm at source before relying on it`. Reasoned from prefix-keyed caching; not measured |

**In scope:** `.claude/templates/implementer.md`, `.claude/templates/tester.md`, `.claude/commands/akili-execute.md` (Step 2.2 brief list), `.claude/commands/akili-test.md` (Phase 1 context slice), the `docs/commands/` mirrors of any edited sentence, `CHANGELOG.md`.

**Out of scope:** `reviewer.md`, `leader.md`, the Step 0 caching sentence of every command (it orders the main session's read, not a worker's), `/akili-constitution` (Safe Update and *Injection scope* included), model tiers and wrappers, `bin/akili.js`, CodeGraph guidance, and section-scoping of the root guides themselves.

**Observed and deliberately left alone:** STAR's `CLAUDE.md` and `AGENTS.md` are byte-identical (`cmp` → identical, `f25270d4`), so a worker reading both pays about 4k tokens twice. That is a project-layout matter, not a persona rule, and the proposal deferred root-guide scoping.

## 5. Stakeholders / Personas

| Persona | Stake |
|---|---|
| Project maintainer running `/akili-execute` or `/akili-test` | Pays the upfront load on every worker spawn and every turn after it |
| Implementer / Tester subagent | Receives the new read rule on every spawn |
| Leader | Owes one more explicit entry per brief |
| Maintainer of a project scaffolded before this change | Keeps the old rule in `.agents/` until they act |

## 6. Functional Requirements

### FR-1: Workers read the root guides in full

The Implementer and Tester personas SHALL instruct the worker to read the project's root guides in full before task-specific files. A root guide that does not exist in the project SHALL be skipped without error.

A **non-host** worker has no persona and cannot resolve paths, so this requirement does not reach it. FR-4 states what its brief carries instead.

#### Scenario: A worker starts a task

- GIVEN a worker spawned in a project with both root guides
- WHEN it follows its persona's context rule
- THEN it reads both root guides whole
- BUT it must NOT be told to read `docs/trd/trd.md` or `docs/ux-ui/design.md` whole as part of that same rule

### FR-2: Workers read reference documents at the sections the brief names

The personas SHALL instruct the worker to read each reference document **only at the sections its brief names**, verbatim at the source.

The Implementer's existing design-token obligation (*Aesthetics & Coding Best Practices*) SHALL remain an obligation. The persona SHALL NOT contain two sentences that a literal reader could take as one demanding a full read and one forbidding it.

#### Scenario: The brief names two TRD sections

- GIVEN an Implementer whose brief names two sections of `docs/trd/trd.md` and states `none` for `docs/ux-ui/design.md`
- WHEN it loads context
- THEN it reads those two sections at the source
- AND IT MUST read them as written, not from a paraphrase in the brief
- BUT it must NOT read the rest of `docs/trd/trd.md` to "be safe"

### FR-3: Every state of the reference-section entry has an action

For each reference document, the brief's reference-section entry is in exactly one of the states below. The personas SHALL give the worker an action for each one. No state may be left to inference.

| # | State of the entry, per document | Implementer | Tester |
|---|---|---|---|
| S1 | Names one or more sections | Read those sections | Read those sections |
| S2 | States `none` explicitly | Read nothing from that document, subject to S6 | Same |
| S3 | **Silent** — the brief says nothing about that document | Treat as not settled: do a bounded lookup for the sections the task's scope touches, and report that the brief named none | Read nothing from that document, subject to S6 |
| S4 | Names a section that cannot be read as named: the heading does not exist, or it matches more than one section | Heading absent: do a bounded lookup for the intended section and report the stale name. More than one match: read each match and report the ambiguity | Same as the Implementer |
| S5 | The document does not exist in the project | Skip it and report nothing | Same as the Implementer |
| S6 | Any state but S5, and the work turns out to touch that document's domain (e.g. a backend-shaped brief, and the task edits UI) | Do a bounded lookup before writing the affected code, and report it | Do a bounded lookup only when a scenario in the slice cites that document |

**When a document "does not exist" (S5).** A document exists when it is found at the path the entry gives, at its default path, or at its legacy path. S5 holds only when all of these fail. A worker with no entry to give it a path (S3, S6) SHALL try the default path and then the legacy path before it concludes the document is absent.

**The Tester persona names no reference path.** Two existing checks forbid the design-token path in `tester.md`. The Tester's paths come from its slice or from the scenario that cites the document, so its rule does not need one.

**A lookup that finds no matching section** ends there. The worker reads nothing further from that document and reports that nothing matched. It is not an assumption and not missing work.

The S3 difference between the two workers is deliberate: the Tester persona disclaims design-token and architecture audit, so silence is its normal case, while silence to an Implementer is where off-token UI comes from.

Every "report" above SHALL land in the worker's existing report: an existing field for the Implementer, and the report body ahead of the status block for the Tester, whose `PASS` shape has no free-text field. This spec adds no report field. *(Amended at design 2026-09-29, DD-4; the meaning is unchanged.)*

The persona SHALL state that such a note is a record of what was read. It is not a gap, and it is not a reason to write the field the Leader reads as "task not complete".

#### Scenario: A silent brief and a UI task (S3)

- GIVEN an Implementer whose brief says nothing about `docs/ux-ui/design.md`
- AND a task that changes a visible component
- WHEN it loads context
- THEN it finds the design-token section by bounded lookup and reads it
- AND IT MUST state in its report that the brief named no section
- BUT it must NOT ship styling without having read the project's tokens

#### Scenario: `none` stated, then the task touches UI anyway (S2 → S6)

- GIVEN an Implementer whose brief states `none` for `docs/ux-ui/design.md`
- WHEN it discovers mid-task that its edit changes rendered output
- THEN it reads the relevant design section before writing that code
- AND IT MUST report the mismatch between the brief and the work
- BUT it must NOT treat the brief's `none` as permission to improvise tokens

#### Scenario: A stale section name (S4)

- GIVEN a brief naming a section heading that the document no longer contains
- WHEN the worker looks for it
- THEN it locates the intended content by bounded lookup and reports the stale name
- BUT it must NOT fall back to reading the whole document

#### Scenario: A project with no reference documents (S5)

- GIVEN a project that has no `docs/trd/` and no `docs/ux-ui/` (this repository is one)
- WHEN a worker loads context
- THEN it proceeds without error
- BUT it must NOT report the absence as a blocker

#### Scenario: A Tester with a silent slice (S3, Tester)

- GIVEN a Tester whose slice names scenarios and says nothing about either reference document
- WHEN it loads context
- THEN it reads the root guides and its slice, and no reference document
- BUT it must NOT skip a reference section that a scenario in its slice cites (S6)

### FR-4: The Implementer brief settles the entry for both reference documents

`/akili-execute` Step 2.2 SHALL require the Implementer brief to carry, **for each of `docs/trd/trd.md` and `docs/ux-ui/design.md`**, either the sections the task touches (path + section name) or the word `none`. An omitted entry is not a valid empty state.

The brief list SHALL NOT state or imply that the persona orders a full read of the constitution.

For a **non-host** worker the existing standing exception holds, and the brief is self-contained:

- the named sections are copied into the brief, together with the root-guide rules that bind the task;
- the entry is settled by the Leader to named sections or `none`, since no persona gives that worker an action for any other state;
- the brief tells the worker to stop and report when the work turns out to touch a reference document the brief gave it nothing from.

**The note is carried.** When a worker's report holds a lookup note, the Leader SHALL record it in the task's `execution.md` entry, in a field that entry already has.

#### Scenario: A backend task in a project with both documents

- GIVEN a Leader composing the brief for a task that changes an API handler
- WHEN it writes the reference-section entries
- THEN the brief names the TRD sections the task touches
- AND IT MUST state `none` for `docs/ux-ui/design.md` in words
- BUT it must NOT leave the UX/UI entry out

### FR-5: The Tester's context slice settles the entry the same way

`/akili-test` Phase 1 SHALL require each suite's context slice to carry the same per-document entry as FR-4: named sections, or `none`. An omitted entry is not a valid empty state.

A suite that covers **meaningful UI/UX behavior** SHALL have the design sections named. `none` is not a valid entry for that suite, since `/akili-test` → *UX Testing Guidance* has it check visual consistency with the design document.

When a Tester's report holds a lookup note, the Leader SHALL record it in the test report, in a section that report already has.

#### Scenario: A UI suite whose scenarios cite no design section

- GIVEN a Leader assembling the slice for a frontend suite on a spec with meaningful UI behavior
- AND no scenario in the slice cites the design document
- WHEN it writes the slice
- THEN the slice names the design sections the suite checks visual consistency against
- BUT it must NOT write `none` for the design document

#### Scenario: An E2E suite that asserts visual behavior

- GIVEN a Leader assembling the slice for an E2E suite whose scenarios cite design tokens
- WHEN it writes the slice
- THEN the slice names the design sections those scenarios cite
- BUT it must NOT hand the Tester the document path alone

### FR-6: The cross-worker caching rationale is removed

Neither worker persona SHALL claim that reading the constitution in a consistent order maximizes prompt caching. The personas MAY keep a fixed read order; they SHALL NOT justify it by caching across workers.

#### Scenario: A later author reads the rule

- GIVEN the packaged `implementer.md` and `tester.md`
- WHEN an author greps them for `caching`
- THEN no hit gives caching as a reason to read a document whole
- BUT it must NOT remove the Step 0 caching sentence from any command, which is out of scope

### FR-7: The Reviewer and the Leader are unchanged

`reviewer.md` and `leader.md` SHALL be byte-identical before and after this spec.

### FR-8: The change is documented with a migration note and an honest number

`CHANGELOG.md` → `Unreleased` SHALL carry an entry that:

- states the new read rule and names both commands whose briefs changed;
- tells a maintainer of an already-scaffolded project what to do, naming the sentence to replace in `.agents/implementer.md` and `.agents/tester.md`, and stating that `/akili-constitution` Safe Update does not replace it for them;
- states the expected reduction as a **range**, labeled as measured on one project's document sizes and not on token telemetry.

Every `docs/commands/` page that restates an edited sentence SHALL be updated to match.

#### Scenario: A maintainer of an older project reads the release notes

- GIVEN a project whose `.agents/` was scaffolded before this change
- WHEN its maintainer reads the entry
- THEN they can find the exact sentence to replace
- AND IT MUST say that nothing updates it automatically
- BUT it must NOT promise a token saving as a fixed figure

## 7. Non-Functional Requirements

| ID | Requirement | Measure |
|---|---|---|
| NFR-1 | **Persona growth is bounded.** A persona is re-read on every spawn, so the rule that saves tokens must not cost them back | `implementer.md` grows by no more than **2,000** bytes and `tester.md` by no more than **1,500** bytes, against `3b66e40` |
| NFR-2 | **Tool-agnostic wording.** The rule names no host-specific tool | No host tool name appears in the added text |
| NFR-3 | **No rule is pointed at by line number** in any shipped prose (KZ-005) | `grep` for `:<digits>` references in the added text → 0 |
| NFR-4 | **Expected load on STAR's documents** falls from about 28k tokens to about 9k–13k for a brief naming two to four sections | Computed from byte sizes at 4 bytes per token: root guides 31,710 bytes, plus the named sections |

## 8. Defect Classes and Gates

| Defect class this spec can produce | Gate that catches it |
|---|---|
| The old mandate, or a paraphrase of it, survives somewhere | Obligation-keyed grep over `.claude/` and `docs/` for the full-read obligation and its paraphrases, every hit read |
| A state of the entry has no action (KZ-004, KZ-changes--premise-ledger-1) | A literal walk of S1–S6 against the shipped persona text, per worker, plus one **held-out** case the text does not cite |
| An inserted rule is contradicted by a surviving neighbour (KZ-changes--leader-brief-contract-1) | Each paragraph that received an insertion is read whole, `implementer.md` *Aesthetics* bullet included |
| The brief rule and the persona rule disagree on what `none` or silence means | Cross-read of the two command texts against both personas, one state at a time |
| The packaged files no longer install | `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` |
| A summary surface claims something that did not ship (KZ-002) | The CHANGELOG entry is checked clause by clause against the shipped text |

**No automated check exists for two classes. Both are accepted risks, stated here:**

| Class | Why no gate | Substitute |
|---|---|---|
| A real worker, given the new text, still reads the documents whole, or skips the tokens | This repository has no harness that runs a worker against a persona | The literal walk above, plus observation on the next spec run in a project that has both documents |
| Reviewer FAILs for token or convention violations rise after the change (proposal success criterion 5) | It is only observable over later specs | Recorded for the Kaizen retrospective of the next two specs. It is not a validation gate for this one |

## 9. Open Questions for This Gate

| # | Question | Recommendation |
|---|---|---|
| OQ-1 | Accept `/akili-test` as an added surface (FR-5)? | **Yes.** Without it the Tester's rule depends on an entry no command produces |
| OQ-2 | Accept the Tester's S3 action as "read nothing"? | **Yes.** It matches what `tester.md` and the *Injection scope* table already say about the Tester |
| OQ-3 | Keep `/akili-constitution` Safe Update out of scope, with a manual migration note only? | **Yes** for this spec. Teaching Safe Update to replace a sentence is a behavior change to a third command and deserves its own proposal |

## 10. Amendments After Judgment Day (2026-09-29)

The user chose *Fix only*. Each row changes what an approved requirement says. `judgment.md` holds the findings.

| Requirement | Amendment | Finding |
|---|---|---|
| FR-3, S5 | A document is absent only when the entry's path, the default path and the legacy path all fail | J-1 |
| FR-3, S4 | A heading that matches more than one section is covered | J-8 |
| FR-3, S6 | Does not apply in S5 | J-11 |
| FR-3 | The Tester persona names no reference path | J-2 |
| FR-3 | A lookup with no match ends there; a note is not a gap | J-5, J-9 |
| FR-1, FR-4 | The non-host worker is stated | J-7 |
| FR-4, FR-5 | The Leader records the lookup note | J-4 |
| FR-5 | An omitted slice entry is invalid; a UI suite names design sections | J-13, J-6 |
| NFR-1 | Implementer cap raised from 1,500 to 2,000 bytes. The legacy paths and the note rule are the added content | Both judges' byte estimates |
| §3, §4 | Two wrong references and one hit list corrected; the 17× figure is stated as per session | J-14, counts |

## 11. Requirement ID Index

| ID | Title | Proposal delta |
|---|---|---|
| FR-1 | Workers read the root guides in full | MODIFIED |
| FR-2 | Reference documents at named sections | MODIFIED |
| FR-3 | Every state of the entry has an action | ADDED (fallback) |
| FR-4 | Implementer brief settles the entry | ADDED |
| FR-5 | Tester slice settles the entry | ADDED — beyond the proposal |
| FR-6 | Caching rationale removed | REMOVED |
| FR-7 | Reviewer and Leader unchanged | Non-goal, made testable |
| FR-8 | CHANGELOG, migration note, docs mirrors | Scope |
| NFR-1…4 | Growth bound, wording, no line pointers, expected load | — |
