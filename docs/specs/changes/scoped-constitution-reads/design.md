# Design: Scope the Worker Personas' Constitution Read

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/scoped-constitution-reads` |
| Depth | **Standard**, confirmed at Step 2.4 (§9) |
| Type | Change |
| Approval Mode | `gated` |
| Status | **Approved** — user chose **Continue** at the Step 2.5 gate, 2026-09-29, after judgment day round 1 was corrected (*Fix only*). The corrections were not re-judged |
| Date | 2026-09-29 |
| Source | `requirements.md` (approved 2026-09-29, amended the same day: its §10) |
| Review | `judgment.md`: two blind judges on `opus`; 1 severe confirmed by both, 2 raised by both with split severity, 6 shared warnings. All nine corrected here (§11) |
| Format precedent | `docs/specs/archive/2026-09-29-changes--opus-5-5-rebaseline/design.md` |
| Skills | `cognitive-doc-design`. `software-architect` not loaded: no module, integration, data flow or NFR tier changes |

## 2. Executive Summary

Five packaged files change, all prose. One sentence in each worker persona is replaced by a short read rule with a state table. Each command that briefs a worker gains the entry that rule reads, and one clause that records the worker's note. Nothing is added to the installer, the wrappers, or any report contract.

| File | Where | Change | Requirement |
|---|---|---|---|
| `.claude/templates/implementer.md` | Item 1 | First bullet replaced; heading renamed | FR-1, 2, 3, 6 |
| | *Aesthetics* bullet | Gains a clause pointing at item 1 | FR-2 |
| | *Reporting Completion*, field 1 | Its description admits a lookup note | FR-3 |
| `.claude/templates/tester.md` | Item 1 | First bullet replaced; heading renamed; names no reference path | FR-1, 2, 3, 6 |
| `.claude/commands/akili-execute.md` | Step 2.2 brief list | Two bullets amended | FR-4 |
| | Step 3 entry field list | *issues encountered* admits a lookup note | FR-4 |
| `.claude/commands/akili-test.md` | Phase 1 item 2 | Context-slice item amended | FR-5 |
| | Phase 4, Summary sentence | Admits a lookup note | FR-5 |
| `CHANGELOG.md` | `Unreleased` | Entry with migration note | FR-8 |

## 3. Architecture Overview

The entry travels from the Leader to the worker, and the note travels back:

| Step | Who | What happens |
|---|---|---|
| 1 | Leader, Step 0 of the command | Reads the constitution, reference documents included. Unchanged |
| 2 | Leader, composing the brief or slice | Writes one entry per reference document: section names with the path, or `none` |
| 3 | Worker, persona item 1 | Reads the root guides whole, then acts on each entry by its state |
| 4 | Worker, report | Writes a lookup note, when it did a lookup, in its existing report |
| 5 | Leader, recording | Copies the note into `execution.md` → *issues encountered*, or the test report → *Summary* (DD-4) |

The Leader can name sections because it has already read both documents in step 1 (P-9). A task's *design references* field does **not** help here: it names sections of the spec's own design (P-10).

## 4. Extended Directory Structure

No file is added, moved or removed. Edited files are the five in §2.

## 5. Data Model

None.

## 6. API Design / Backend / Frontend

None. No UI surface.

## 7. Shared Contracts

**The reference-section entry.** One contract, written by two commands and read by two personas.

| Property | Value |
|---|---|
| Granularity | One entry per reference document |
| Valid values | One or more section names, each with the document's path; or the word `none` |
| Invalid | An omitted entry, in a brief and in a slice alike. The command rule forbids it; the persona still has an action for it (S3), since a brief composed by an older command copy will omit it |
| Section name | The heading text as it appears in the document, never a line number (KZ-005). When that text is not unique in the document, the entry adds the parent heading |
| Extent of a section | The heading's own text and every subsection under it, up to the next heading of the same or a higher level |
| Path | The path the project actually uses. The Leader resolves it, legacy paths included |
| UI suite (`/akili-test`) | `none` is not valid for the design document |
| Non-host worker | Sections are copied. The Leader settles the entry to S1 or S2 (DD-5) |

**Path resolution, for a worker with no entry to give it a path.** Default path first, then the legacy path. Only when both fail is the document absent.

| Document | Default path | Legacy path |
|---|---|---|
| TRD | `docs/trd/trd.md` | `docs/detailed-design/detailed-design.md` |
| UX/UI design | `docs/ux-ui/design.md` | `docs/system-design/design.md` |

## 8. Design Decisions

### DD-1: Replace the sentence in place, inside item 1 *(removes delivered behavior — challenged below)*

The first bullet of item 1 in each persona is replaced where it stands. The rule is not added as a sibling beside the old sentence, because the old sentence is the thing being removed, and a surviving copy is the defect class KZ-changes--kaizen-loop-closure-2 names.

The replacement has three parts, in this order:

1. Read the root guides whole, skipping one that does not exist.
2. Read each reference document only at the sections the brief names, verbatim at the source.
3. The state table of DD-3.

**Rejected:** moving the rule to a new numbered item. Item 1 is where the other context rules live. In `implementer.md` the *Pointer briefs* bullet, five lines below, already speaks the same language; `tester.md` has no such bullet.

**Reversion challenge (Step 2.3), run 2026-09-29.** One reviewer on `opus`, one question: *what does removing the unconditional full read break?* Three breakages named, four areas cleared. Each breakage was re-read at the source before it was accepted.

| # | Breakage named | Confirmed at source | Disposition |
|---|---|---|---|
| C-1 | A lookup note in `Not Done / Assumptions` trips item 0, whose lead sentence is keyed on the field's **presence**: *"If present, the task is not complete regardless of what else the report says"*. The closure rule applies the same to a skip and a waiver | Yes. `akili-execute.md:223` and `:387` | **Design changed.** DD-4 does not use that field. The first draft of P-5 had read item 0 only as far as the clause that agreed (KZ-001) |
| C-2 | `akili-execute.md:168` leans on the persona's read sequence, and `:167` offers `trd.md` sections with no `none` | Yes | Covered: DD-5 amends both bullets |
| C-3 | Safe Update appends and cannot remove the old sentence from a deployed persona | Yes. `akili-constitution.md:424` | Covered by the migration note (DD-9). Residual risk accepted under OQ-3 |

Cleared by the challenge: no text greps for or quotes the sentence or heading; module guides reach the worker through the brief's convention-file lookup and the root guides; the Reviewer reads both documents itself. The challenge also cleared the Tester's UX guidance as "covered by S6". Judgment day showed that to be only partly true, and DD-6 now covers it.

### DD-2: The lookup is by headings, and it is called a *section lookup*

`requirements.md` uses "bounded lookup" as a placeholder. The shipped text calls it a **section lookup** and defines it in one sentence: list the document's headings, then read only the section whose heading matches what the task touches.

| Choice | Reason |
|---|---|
| A new name | "Lookup" already names the convention-file walk in the brief contract's clause (b) (P-6). Two different procedures under one word is a restatement hazard |
| Headings, not search terms | A heading list is small and fixed in cost. A keyword search returns fragments without their section, and invites reading around each hit until the document has been read whole |
| No tool named | NFR-2. "List the headings" is executable on every host |
| No match found | The worker reads nothing further from that document and says so in its note. It does not widen to a full read, and it does not write `Not Done / Assumptions` for it (DD-4) |

### DD-3: Each persona carries its own six-row table

A table is used because the rule is keyed to a field's states, and a table makes a missing state visible (KZ-changes--premise-ledger-1). Each persona carries **its own actions only**, written out in full. No cell reads "same".

| # | State | Implementer | Tester |
|---|---|---|---|
| S1 | Sections named | Read them | Read them |
| S2 | `none` | Read nothing, unless S6 | Read nothing, unless S6 |
| S3 | Entry absent | Resolve the path (§7). Section lookup for what the task touches; note it | Read nothing, unless S6 |
| S4 | Named section cannot be read as named | Heading absent: section lookup for the intended one; note the stale name. More than one match: read each; note it | Heading absent: section lookup for the intended one; note the stale name. More than one match: read each; note it |
| S5 | Document not in the project | Skip; no note | Skip; no note |
| S6 | The work touches the document's domain anyway | Resolve the path (§7). Section lookup before writing that code; note it | Section lookup only when a scenario in the slice cites the document; note it |

**Order of evaluation**, stated in the persona so two states cannot both claim a case:

1. **S5 first, after path resolution.** A document is absent only when the entry's path, the default path and the legacy path all fail. This is the correction of J-1: a worker no longer concludes "absent" from the default path alone.
2. **S1–S4** by what the entry says.
3. **S6** at any later point in the task, and **never in S5**. With no document there is nothing to look up, so S5's "no note" stands and the two rules cannot both fire.

S6 is not a state of the entry. It is an event during the work, and it is listed in the same table so no reader meets the entry states without it.

**The Tester's rule names no reference path.** Its paths come from the slice (S1, S4) or from the scenario that cites the document (S6). That removes the design-token path the packaged `tester.md` carries today, which two existing checks forbid (P-16). The Implementer's rule names both paths and their legacy paths, since its S3 and S6 need them and the *Injection scope* table allows that persona the token path.

**The Tester's surviving neighbour.** `tester.md`'s second bullet lets a Tester read beyond its slice *"unless strictly required to write a valid test"*. That sentence is about the spec set and source files. The new bullet says that reference documents follow the state table alone, so a literal Tester has one condition, not two.

**Rejected:** sharing one two-column table across both personas. Each persona is re-read on every spawn (NFR-1), and the *Injection scope* rule already says a persona gets only what its role consumes (P-8).

### DD-4: The note has a place in the report and a place in the record

**In the worker's report:**

| Worker | Where the note lands | Why |
|---|---|---|
| Implementer | The **Task Completed** field, as a trailing clause | `Not Done / Assumptions` is ruled out: item 0 treats that field's presence as "not complete" (P-5, challenge C-1) |
| Tester | One line in the report body, ahead of the status block | The contract requires the report to *conclude* with the status block (P-7). Its `FINDINGS` types are a closed set of three, and a lookup note is none of them |

**What the persona says about the note, so its neighbours do not contradict it (P-18):**

- A lookup note records what was read. It is not a gap, not an assumption, and not missing work. This holds for the no-match case and for a mismatch between the brief and the work.
- It is never a reason to write `Not Done / Assumptions`. This closes the route into item 0's gap that the first draft opened.
- The description of the **Task Completed** field is amended to admit it, so *"Brief 1-sentence summary"* and *"never bury a gap in the summary above"* no longer read against it.

**In the record.** The note is copied by the Leader into a slot that already exists:

| Command | Slot | Edit |
|---|---|---|
| `/akili-execute` | The task entry's *issues encountered* field (P-17) | The field list names the lookup note as one thing the field holds |
| `/akili-test` | The test report's *Summary* (P-17) | The sentence that lists what the Summary records gains the lookup note |

**Named mechanism against its moment (KZ-changes--review-intensity-routing-1).** The record is written when the Leader composes the task entry or the test report, which is after the worker's report arrives. The clause sits in the text the Leader reads at that moment.

**Left alone, on purpose.** Item 0 does not say when a task whose field holds assumptions only may reach `[x]`. That gap predates this spec. After this correction the design adds no route into it.

**Rejected:** a new `FINDINGS` type for the Tester. That adds a value to a closed enumeration with consumers in `/akili-test` and the test report, for a note that is informational.

### DD-5: The Implementer brief amends two bullets; it gains no clause

| Bullet today | After |
|---|---|
| *pointers* to `requirements.md`, `design.md`, and `trd.md` | *pointers* to `requirements.md` and `design.md`. The spec's own documents stay together |
| *the constitution by reference* — three paths, "paths only; the Implementer's persona already orders its caching-friendly read sequence" | Two parts. **Root guides** by path. **Reference documents**: for each of the TRD and the UX/UI design, the path and the sections this task touches, or `none`. An omitted entry is not a valid empty state |

**Non-host worker**, stated in the same bullet. It has no persona and resolves no path (P-19), so:

| What a host worker gets from its persona | What the non-host brief carries instead |
|---|---|
| A full read of the root guides | The root-guide rules that bind this task, copied |
| Sections read at the source | The named sections, copied |
| Actions for S3, S4 and S6 | None needed for S3 and S4: the Leader settles the entry to S1 or S2 before it writes the brief. For S6, one instruction: stop and report when the work touches a reference document the brief gave nothing from |

The S6 instruction is a stop, not a fallback. It adds no option the task lacks, so the brief contract's narrow-never-widen clause holds.

The brief contract keeps its five clauses. The stated-empty rule lives in the bullet that owns the entry, so the `docs/commands/` mirror that says "five clauses" stays true (P-11).

**Named mechanism against its moment.** The entry must exist before the worker's first read. Step 2.2 composes the brief before the spawn.

### DD-6: The Tester slice gains the same entry; a UI suite names design sections

Phase 1 item 2 of `/akili-test` lists what a context slice holds. It gains the entry, with three rules:

| Rule | Reason |
|---|---|
| An omitted entry is not a valid empty state | FR-5; same as the brief |
| `none` is the expected value for a suite with no UI behavior and no scenario that cites a reference document | The Tester disclaims token and architecture audit (P-8) |
| A suite that covers meaningful UI/UX behavior names the design sections it checks against. `none` is not valid there | *UX Testing Guidance* asks for visual consistency with the design document on every such spec (P-20). Without this rule that guidance could not be followed by a Tester holding a `none` slice |

The pointer rule under *Token discipline* is untouched. It already says to prefer pointers and to copy for a non-host worker.

### DD-7: The heading drops "Prompt Caching"; the read order stays

Item 1's heading becomes *Strict Context Alignment (Context & Skills)* in both personas. The order — root guides, then reference sections, then task files — is kept as an order. No sentence gives caching as its reason.

Nothing outside the two templates cites the heading (P-3).

### DD-8: The *Aesthetics* bullet points back at item 1

`implementer.md`'s design-token bullet gains a short clause: the tokens are read at the sections item 1 sends the worker to. The obligation to comply is unchanged. This is the neighbour the inserted rule could contradict (KZ-changes--leader-brief-contract-1), so the paragraph is read whole after the edit.

### DD-9: The CHANGELOG entry — full content

The entry carries every clause of FR-8. Nothing else specifies it.

| # | Content | FR-8 clause |
|---|---|---|
| 1 | The new read rule, in one sentence | "states the new read rule" |
| 2 | **Both** commands by name: `/akili-execute` (Implementer brief) and `/akili-test` (context slice) | "names both commands whose briefs changed" |
| 3 | The sentence to replace, quoted, in `.agents/implementer.md` and `.agents/tester.md` | "naming the sentence to replace" |
| 4 | Safe Update does not replace it: it appends (P-12) | "stating that `/akili-constitution` Safe Update does not replace it" |
| 5 | What `/akili-audit` reports, per persona (table below) | "AND IT MUST say that nothing updates it automatically" |
| 6 | The expected reduction as a **range**, labeled: computed from one project's document sizes, not from token telemetry | "states the expected reduction as a range, labeled" |
| 7 | No fixed figure, and no statement about cache behavior across workers (P-14) | "BUT it must NOT promise a token saving as a fixed figure" |

| Deployed persona | What `/akili-audit` reports | Source |
|---|---|---|
| `tester.md` with the old sentence | **Reported**, as persona injection bleed: the sentence carries the design-token path | P-16 |
| `implementer.md` with the old sentence | The new rule is reported as lacking. The old sentence is **not** reported as stale | P-15 |
| Either, after an appended upgrade block | Carries both rules until the old sentence is removed by hand | P-12 |

### DD-10: Non-changes

| Surface | Why it stays |
|---|---|
| `reviewer.md`, `leader.md` | FR-7 |
| `/akili-execute` Step 2.3 item 0 | DD-4 avoids the field it reads |
| The Reviewer brief in Step 2.3 | It already names sections of both reference documents (P-4) |
| Step 0 caching sentence, all commands | It orders the main session's read. Out of scope |
| `/akili-constitution` and `/akili-audit` | OQ-3. Their checks are read, not edited (P-12, P-15, P-16) |
| `/akili-test` → *UX Testing Guidance* | DD-6 makes it followable; its text is unchanged |
| `docs/commands/akili-execute.md`, `docs/commands/akili-test.md` | Neither restates an edited sentence (P-11). The closure task re-runs the sweep over all edits, the two record clauses included, and records the result |
| `.claude/worktrees/authorship/` | A separate checkout holding its own copies (P-3). Not this tree's product |

## 9. Budget (Step 2.4, tripwire for `/akili-execute`)

| Measure | Estimate |
|---|---|
| Tasks | **4**: T1 personas (FR-1, 2, 3, 6; NFR-1, 2, 3) · T2 `/akili-execute` brief and record clause (FR-4) · T3 `/akili-test` slice and record clause (FR-5) · T4 CHANGELOG, literal walk, sweeps (FR-7, FR-8, NFR-4) |
| Shipped lines | **~55** (T1 ≈ 32, T2 ≈ 8, T3 ≈ 6, T4 ≈ 9) |
| Persona growth | Implementer about **+1.7k** bytes against a 2,000 cap; Tester about **+1.1k** against 1,500. Estimated from the content listed in DD-1, DD-3, DD-4, DD-7 and DD-8, less about 210 bytes removed. The two judges' estimates for the Implementer before correction were 1.2k and 1.4k–1.7k |
| Review rounds | **6**: one per task, plus two rework rounds. Restatement drift cost a round in four of the last five specs |

Four tasks at about 55 lines matches **Standard**. It is not Lite: the state table is a rule that every downstream worker executes, with a live neighbour in each file. It is not Full: no data, API, auth or migration.

**Tripwire note.** Persona growth is the measure most likely to trip. If T1 cannot fit the Implementer's rule in 2,000 bytes, that is a budget stop for the user, not a reason to drop a state.

## 10. Premise Ledger

`Premise Ledger: 18 verified · 2 UNVERIFIED (0 High, 2 Low)`. Verified 2026-09-29 at `3b66e40`, commands run from the repository root.

`Blast-radius triggers:` **consumer** fires — the design changes a sentence and a heading other text may cite, changes what a persona carries, and adds content to a report field and two record slots. Walked in P-2, P-3, P-5, P-15, P-16, P-17, P-18. **shared-state** fires — the entry is a signal more than one reader acts on. Walked in P-4, P-19, P-20. **live-path** fires — the design names a branch point, packaged template versus deployed copy. Walked in P-1.

| # | Claim | Class | Citation (as run) | Verified at | If false | Settled by |
|---|---|---|---|---|---|---|
| P-1 | A worker reads the **deployed** persona at `.agents/<role>.md`. It is copied from the packaged template, or drafted inline when the templates are unavailable | `live-path` | Implementer: `/akili-execute` spawn → Step 8E wrapper body *"Read `.agents/implementer.md` in the project root and adopt it fully"* (`akili-constitution.md:659`) → or the no-wrapper branch, `akili-execute.md:165`, from `.agents/` (`:49`). Tester: `/akili-test` spawn → `akili-tester` wrapper, or the sub-prompt seeded with `tester.md` (`akili-test.md:54`), persona at `.agents/tester.md` (`:48`, `:100`). Copy step: `akili-constitution.md:422`. Inline draft: `akili-constitution.md:418`. Installer ships the templates: `bin/akili.js:74` | `3b66e40` | DD-9's migration note aims at the wrong file: Low | — |
| P-2 | The persona sentence is relied on by exactly one other packaged sentence | `consumer` | `grep -rn -i "caching-friendly\|read sequence\|persona already orders\|paths only" .claude/commands .claude/templates .claude/skills docs/commands docs/flow.md docs/model-routing.md docs/cli.md README.md` → 1 relevant hit, `akili-execute.md:168`; 1 unrelated (`gsap-animation/references/plugins.md:247`). Alternate names, `grep -rn -i "consult the project constitution\|maximize prompt caching"` over the same scope → the two personas and the Step 0 sentence of six commands, which orders the main session's read | `3b66e40` | DD-5 misses a dependent sentence: **High** | — |
| P-3 | The item-1 heading is cited nowhere outside the two templates, in this tree | `consumer` | `grep -rn "Strict Context Alignment\|Prompt Caching & Skills" .claude docs README.md bin scripts` minus `docs/specs/` → 4 hits: the two templates, and the same two files under `.claude/worktrees/authorship/` | `3b66e40` | DD-7's rename breaks a reference: Low | — |
| P-4 | Among persona-backed roles, the entry's readers are the two worker personas only | `shared-state` | Siblings, each with its mechanism: `implementer.md:14` (full read, replaced) · `tester.md:14` (full read, replaced) · Reviewer brief `akili-execute.md:235` (its own section pointers) · `reviewer.md:21–22` (audits against both documents, no read mandate) · `leader.md:14` (bounded, ordered by Step 0). The non-host reader is P-19 | `3b66e40` | A third reader needs a column in DD-3: **High** | — |
| P-5 | Item 0 reads `Not Done / Assumptions` by **presence** first, then by content; an assumptions-only field starts no continuation, and nothing states when such a task may close | `consumer` | Readers of the field, by `grep -n "Not Done" .claude/commands/akili-execute.md`: `:223` (*"If present, the task is not complete regardless of what else the report says"*), item 0's *Precedence* bullet (*"no owed item at all, whether assumptions-only or an inconclusive verification — never a continuation"*), `:387` (*"a `Not Done / Assumptions` gap blocks `[x]` even on PASS"*) | `3b66e40` | DD-4 could use the field after all: Low | — |
| P-6 | "Lookup" already names the convention-file walk | `existence` | `akili-execute.md:185`, clause (b): *"Convention files, by lookup."*; mirror `docs/commands/akili-execute.md:87` | `3b66e40` | DD-2's rename is unnecessary: Low | — |
| P-7 | The Tester's report must end with the status block; its `FINDINGS` types are a closed set of three | `other` | `tester.md:41`: *"Your report back to the Leader **must** conclude with exactly one status"*; `tester.md:61`: *"**Type:** TEST_GAP \| FLAKY \| AUTOMATION_DEFERRED"* | `3b66e40` | DD-4's Tester placement has no home: Low | — |
| P-8 | The scaffold gives the Tester neither reference path, and the Tester disclaims design-token audit | `other` | `akili-constitution.md:430–431`, *Injection scope* rows *Design-token path* and *`trd.md` path*, `tester.md` column `—`; `tester.md:5` | `3b66e40` | The Tester's S3 action must become a lookup: **High** | — |
| P-9 | The Leader reads both reference documents, with their legacy paths, in Step 0 of both commands | `location` | `akili-execute.md:94–95` and `akili-test.md:93–94`, each naming the default path and *"(legacy fallback: …)"* | `3b66e40` | The Leader cannot name sections or resolve a legacy path without an extra read: **High** | — |
| P-10 | A task's *design references* field names sections of the **spec's** design, not of the TRD or the UX/UI design | `data-env` | `grep -h -i "design ref" docs/specs/archive/2026-09-2*/tasks.md` → 8 rows read, each holding `DD-n`, `§n` or `P-n` of its own spec, e.g. *"\| Design refs \| §2, §9, DD-6 \|"* | `3b66e40` | Section naming would have a second source besides P-9: Low | — |
| P-11 | No `docs/commands/` page restates either amended brief bullet or the slice item | `existence` | `grep -n -i "paths only\|by reference\|ux-ui" docs/commands/akili-execute.md docs/commands/akili-test.md` → 1 hit, `akili-execute.md:27`, the Leader's input list | `3b66e40` | T4 gains a mirror edit: Low | — |
| P-12 | Safe Update appends an upgrade block and never overwrites an existing persona | `other` | `akili-constitution.md:424` | `3b66e40` | The migration note can point at `/akili-constitution`: Low | — |
| P-13 | Across one session, cache reads outweighed cache writes by about 17×. The figure is per session, not per worker | `data-env` | `UNVERIFIED — confirm at source before relying on it` | — | NFR-4's saving is smaller per turn than the proposal implies. The rule still removes a contradiction: Low | `user-stated` (proposal telemetry, 3.3M read against 194.6k written). Owner: the user, at the HITL pause |
| P-14 | Sibling workers share no prompt cache for their document reads | `data-env` | `UNVERIFIED — confirm at source before relying on it` | — | FR-6 removes a rationale that was partly true. The scoped read stands on FR-2: Low | The vendor's prompt-caching documentation, read by T4 before it words the entry. DD-9 row 7 keeps the entry silent on it either way |
| P-15 | `/akili-audit`'s structural-drift check reports what a deployed persona **lacks** | `consumer` | `akili-audit.md:60`, clause (c): *"a section, step, or guardrail the packaged template carries and the deployed persona lacks"* | `3b66e40` | DD-9's audit table is wrong for `implementer.md`: Low | — |
| P-16 | Two checks forbid the design-token path in `tester.md`, and the packaged file carries it today | `consumer` | `akili-audit.md:55`: *"a design-token path in `tester.md` (which explicitly does not audit tokens)"*; `akili-constitution.md:1161`: *"`tester.md` must **not** carry the design-token path"*; `grep -n "ux-ui" .claude/templates/tester.md` → `:14` only | `3b66e40` | The Tester's rule may name the path: Low | — |
| P-17 | Both records have an existing slot a note can go in, and neither names the note today | `consumer` | `akili-execute.md:359`: *"- issues encountered"*, in the task entry field list; `akili-test.md:148` (*"2. Summary"*) and `:157` (*"record in the Summary how many suites ran"*); `grep -rn "Task Completed" .claude/commands` → 0 hits | `3b66e40` | DD-4 needs a new slot, which FR-3 forbids: **High** | — |
| P-18 | Two surviving sentences in `implementer.md` sit against a note in the summary field | `consumer` | `implementer.md:42`: *"(Brief 1-sentence summary of what you implemented)"*; `:45`: *"never bury a gap in the summary above"* | `3b66e40` | DD-4 needs no edit to the field description: Low | — |
| P-19 | A non-host worker has no persona and resolves no project path | `shared-state` | `leader.md:122–123`: *"they have no `.agents/` personas and no commands"*; `docs/model-routing.md:610`: *"A path reference resolves to nothing; the worker never sees it and cannot say so"*; `akili-execute.md:163`: *"it keeps the self-contained brief"* | `3b66e40` | DD-5's non-host table is unnecessary: Low | — |
| P-20 | `/akili-test` asks for visual consistency with the design document on any spec with meaningful UI behavior | `shared-state` | `akili-test.md:165–173`, *UX Testing Guidance*: *"When a spec includes meaningful UI/UX behavior, verify more than raw functionality"* … *"visual consistency with `docs/ux-ui/design.md`"* | `3b66e40` | DD-6's UI-suite rule is unnecessary: Low | — |

## 11. Corrections After Judgment Day (2026-09-29)

*Fix only*, chosen by the user. Not re-judged. IDs are those of `judgment.md`.

| Finding | Class | Corrected in |
|---|---|---|
| J-1 Legacy path skipped silently | Severe, both judges | §7 path resolution; DD-3 order of evaluation; FR-3 |
| J-2 Tester persona's two readers; audit misstated | Raised by both | DD-3 (no path in the Tester's rule); DD-9 audit table; P-16 |
| J-3 FR-8 clauses with no decision | Raised by both | DD-9, seven rows mapped to FR-8 |
| J-4 Note has no carrier | Shared warning | DD-4 record table; §3 step 5; P-17; FR-4, FR-5 |
| J-5 Item 0 gap widened | Shared warning | DD-2 no-match row; DD-4 |
| J-6 Tester `none` against UX guidance | Shared warning | DD-6; P-20; FR-5 |
| J-7 Non-host incomplete | Shared warning | DD-5 non-host table; P-19; FR-1, FR-4 |
| J-8 Heading appears twice | Shared warning | §7; S4 |
| J-9 Note placement against its neighbours | Shared warning | DD-4; P-18; §2 |
| J-10 P-10 wrong as used | One judge; settled by re-run | P-10 rewritten; §3 |
| J-11 S5 then S6 | One judge; falls out of J-1 | DD-3 order, rule 3 |
| J-12 `tester.md` competing condition | One judge | DD-3, *surviving neighbour* |
| J-13 Omitted slice entry | One judge | DD-6; §7 |
| J-14 Two wrong references | One judge; settled by re-run | DD-6; `requirements.md` §3 |
| J-15 "Same" with no referent | One judge | DD-3 table written out |
| J-16 Inline-drafted persona | One judge | P-1 |
| Counts | Both judges | "Five packaged files"; "five lines below"; the 17× wording; the `/akili-test` hit list in `requirements.md` §4 |
