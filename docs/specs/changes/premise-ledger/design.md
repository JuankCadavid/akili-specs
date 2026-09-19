# Design: Premise Ledger

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/premise-ledger` |
| Depth | Standard (re-checked against this design in §13 — holds) |
| Status | Approved — user chose **Continue** at the Step 2.5 gate, 2026-09-19; `judgment-day` offered and not selected |
| Date | 2026-09-19 |
| Source | `requirements.md` (FR-1..FR-11, NFR-1..8, approved 2026-09-19); `proposal.md` Option B |
| Reviewers | Step 2.3 reversion challenge run **inline** on the one DD that removes something shipped (DD-9, the `Impact & Scope` heading) — outcome in §12. `judgment-day` was offered at the Step 2.5 gate and not selected |
| Consumer walk (KZ-changes--kaizen-loop-closure-1) | Two new enumerated sets — premise classes and judge severities — and one new `design.md` section, each walked through every existing reader in §7.2 |
| Dogfooding | This design carries its own Premise Ledger (§11), written before the design decisions and verified at `571edaf`. It is the first instance of the format and the input for NFR-2's size measurement. **Field note:** five of the thirteen rows were first drafted from memory of earlier output and were wrong when run — a line number, three hit counts, and an edit location. Rule (e) caught them before approval; the corrected readings are what §11 shows |
| Format precedent | `docs/specs/archive/2026-09-19-changes--leader-brief-contract/design.md` |
| Delegation record | One background scout (corpus citation check and held-out cases). It went idle without its report reaching the Leader; one poke recovered it. No inline fallback was needed |

## 2. Executive Summary

One guideline block in `/akili-specify` Step 2.2 defines the Premise Ledger: row shape, seven classes, three triggers, five citation rules, the `UNVERIFIED` absent-value, and the hand-off to tasks. Everything else **cites that block by name**: a Hard Rule in `judgment-day`, a Blast Radius section in the Bug Diagnosis, one bullet each in Step 1.2 and the proposal structure, and one clause in the constitution's template description. Two stale step pointers are corrected on the way.

The change is prose in four packaged files, five mirror or root documents, and the changelog. No file is added to the package, so the installer and its file lists are untouched.

## 3. Architecture Overview

**One definition, six citing surfaces.**

| Role | Surface | What it holds |
|---|---|---|
| **Definition** | `/akili-specify` Step 2.2 — *Premise Ledger* block | Everything in §5.1–§5.5 |
| Work order | `/akili-specify` Step 2.1 | "Verify while the code is open"; scouts return citations as run |
| Presentation | `/akili-specify` Step 2.5 | Count line, open-row list, recommendation (§5.6) |
| Upstream | `/akili-specify` Step 1.2; `/akili-propose` Step 2 | Cite-or-mark inline, citing the block |
| Audit | `judgment-day` Hard Rules | Ledger-first rule and severities (§5.7) |
| Bug intake | `/akili-propose` Bug Track and Bug Diagnosis | Blast Radius section (§5.8), citing the block |
| Template | `/akili-constitution` Step 7 item 2 | Names the section, cites the block |

**Flow of one premise.** Stated in a proposal or requirements with a citation or the marker → becomes a ledger row at Phase 2 if it passes the dependence test → counted at Step 2.5 → re-run by judges if Review Design is chosen → handed to a task through `Consumers` or as that task's first settling step → a refuted premise enters the existing Pivot Protocol.

**What does not change.** The Phase 2 step numbering, the Step 2.5 menu, the `judgment-day` protocol, the four task Verification fields, and every file listed in NFR-1.

## 4. Extended Directory Structure

No new packaged file. Edited files only:

| Path | Kind |
|---|---|
| `.claude/commands/akili-specify.md` | command |
| `.claude/commands/akili-propose.md` | command |
| `.claude/commands/akili-constitution.md` | command |
| `.claude/skills/judgment-day/SKILL.md` | skill (metadata version 1.7 → 1.8) |
| `docs/commands/akili-specify.md`, `akili-propose.md`, `akili-constitution.md` | mirrors |
| `docs/skills/judgment-day.md` | mirror |
| `docs/flow.md` | root doc — one line (§11 P-7) |
| `CHANGELOG.md` | `Unreleased` |
| `docs/specs/changes/premise-ledger/walkthrough.md` | spec-local closing evidence (not packaged) |

## 5. Data Model — the contracts, defined once

### 5.1 Row shape (FR-1)

Seven columns, exactly as the requirements' FR-1 table: `#` · Claim · Class · Citation (as run) · Verified at · If false (with Impact) · Settled by. The section opens with two fixed lines above the table:

- the **count line** — verified, `UNVERIFIED`, and the `UNVERIFIED` split by Impact;
- the **trigger line** — which blast-radius triggers fired, or `Blast-radius triggers: none apply — <reason>`.

The stated-empty form replaces the table with `Premise Ledger: none — <reason>`. The block states the **dependence test** as the admission rule and states that the ledger is **written first** — before the design decisions that build on it. That is an order of work, not a position in the document (DD-2).

### 5.2 Classes (FR-2)

`location` · `existence` · `data-env` · `other` admit by dependence test. `live-path` · `shared-state` · `consumer` are required when their trigger fires. `other` is the stated fall-through and explicitly covers a standing project rule the design relies on or must obey. "Secondary source" is **not** a class; it is what citation rule (d) forbids (DD-3).

### 5.3 Triggers (FR-2)

| Trigger fires when the design… | Required row | Row must contain |
|---|---|---|
| names a user action or a branch point | `live-path` | the dispatch chain, entry point to changed code, each branch point and the branch taken |
| changes state, a service, a base class, or a lifecycle hook that more than one component uses, or a condition or signal more than one block or component reads | `shared-state` | every sibling, each with its mechanism at `file:line` — a sibling is any reader of that state, condition, or signal, a conditional block in the same template included (DD-15) |
| changes an exported symbol, a selector or DOM hook, an emitted event, a response shape, or a stored field | `consumer` | every reader found by a whole-repository search, command as run |

### 5.4 Citation rules (FR-3)

Five rules, lettered as in the requirements: (a) as run · (b) negative existence quotes pattern and scope, alternate names included · (c) parity names the mechanism · (d) primary source; a person's statement is `UNVERIFIED` with `user-stated` · (e) run before written. Each ships with a one-line falsifier, the shape `/akili-execute` Step 2.2's brief contract already uses.

### 5.5 `UNVERIFIED` and the hand-off (FR-4)

- Marker text is byte-identical to the brief contract's (§11 P-5).
- *Settled by* names the check and one owner: a task ID, `judgment-day`, the HITL pause, or a named person.
- Hand-off, stated in the block: `consumer` rows are copied into the owning task's `Consumers` field; an `UNVERIFIED` row's owning task settles it as its first step and records the outcome in its Done criteria; a refuted premise follows the Pivot Protocol. **All other classes have no hand-off** — they act through their *If false* cell. That sentence is written so no class falls through (§7.2).
- **Bug Mode source of rows.** The proposal's Blast Radius results become rows. When the proposal has no Blast Radius section — an older proposal, or a bug specified without a proposal — the architect runs the four checks during Step 2.1. This branch is stated, not implied (KZ-004).

### 5.6 Step 2.5 presentation (FR-5)

The summary repeats the count line, lists every `UNVERIFIED` row in full, and adds one sentence when any open row is `High`: it recommends the **Review Design** option. The five-option menu is unchanged. Counts are by status and Impact, never by class. Under `pre-approved` nothing is added: the Approval Mode section already says judgment-day always runs.

### 5.7 Judge rule (FR-7)

One new Hard Rule, placed directly after the existing count-contrast rule because it is that rule's counterpart: the first sends judges across documents, this one sends them to the source. It carries, in order: the three actions (re-run every citation, try to refute every `UNVERIFIED` row, look for depended-on premises with no row); **the reach clause** (DD-14) — a row citing neither a citation as run nor the marker, and a row citing a secondary source, are attacked as `UNVERIFIED` under action 2, because re-reading a document settles the document and not the system; the severity table from FR-7; the read-only clarification; the `not re-run` report value; and the sentence that the two-judge protocol is unchanged. It names the *Premise Ledger* block for row shape and triggers and restates neither.

The capability wording is "read and search the repository; read its history where the host allows". The packaged read-only tool set has search but no shell (§11 P-9), so a history query is the realistic `not re-run` case.

### 5.8 Blast Radius section (FR-9)

The Bug Diagnosis template's `### Impact & Scope` becomes `### Blast Radius`. It holds the four checks as a short table — check, citation as run or marker, result — and keeps the existing data-integrity and security line beneath it. The Bug Track bullets state the **run order**: *Already fixed?* first, before root-cause work; *Live path?* as part of confirming the root cause; the two enumerations after. Two stop outcomes are stated: a fix already exists → report and stop, no spec; the code is off the live path → the root cause is not confirmed and the diagnosis reopens. `n/a` carries its reason; *Already fixed?* is never `n/a`.

## 6. API Design

Not applicable — no programmatic interface. The "API" of this change is the block's name. Every citing surface uses the same phrase: **`/akili-specify` Step 2.2 — *Premise Ledger* block**.

## 7. Backend Module Design — Surface Table and Consumer Walk

### 7.1 Surface table

| # | File · section (by name) | Edit | FR |
|---|---|---|---|
| 1 | `akili-specify.md` · Step 2.2 *Minimum content* | Append item 11, "Premise Ledger" | FR-1 |
| 2 | `akili-specify.md` · Step 2.2 *Guidelines* | Add the *Premise Ledger* block (§5.1–§5.5) after the *New enumerated values walk their consumers* bullet | FR-1..4 |
| 3 | `akili-specify.md` · Step 1.2 guidelines | One bullet after *numbers from images are not sources*: context claims cite or mark, citing the block | FR-6 |
| 4 | `akili-specify.md` · Step 2.1 | One paragraph: verify while exploring; scouts return citations as run | FR-5 |
| 5 | `akili-specify.md` · Step 2.3 | The phrase "the opt-in Step 2.4 pass" → the **Review Design** option of Step 2.5 — *Present & Approve*. No other word of the paragraph changes | FR-8 |
| 6 | `akili-specify.md` · Step 2.5 | Summary sentence gains the count line, the open rows, and the recommendation (§5.6) | FR-5 |
| 7 | `akili-specify.md` · Verification Checklist | Four items (FR-5), one of which names the `Consumers` hand-off so the Phase 3 author meets it (DD-6) | FR-4, FR-5 |
| 8 | `judgment-day/SKILL.md` · Hard Rules | The rule in §5.7 | FR-7 |
| 9 | `judgment-day/SKILL.md` · AKILI-SPECS Integration | Row 1: "Step 2.3" → Step 2.5 — *Present & Approve*, **Review Design** option; target wording gains "the Premise Ledger first" | FR-7, FR-8 |
| 10 | `judgment-day/SKILL.md` · frontmatter | `version` 1.7 → 1.8 | — |
| 11 | `akili-propose.md` · Bug Track bullets | The *impact/scope* bullet becomes the Blast Radius bullet with run order and stop outcomes (§5.8). The paragraph is read whole after the edit (KZ-changes--leader-brief-contract-1) | FR-9 |
| 12 | `akili-propose.md` · Step 2, after the structure list | One sentence: *Problem / Current Behavior* claims cite or mark, citing the block | FR-6 |
| 13 | `akili-propose.md` · Bug Diagnosis template | `### Impact & Scope` → `### Blast Radius` (§5.8) | FR-9 |
| 14 | `akili-propose.md` · Review Checklist; Report To User | One checklist item; the bug clause of the report names the Blast Radius result | FR-9 |
| 15 | `akili-constitution.md` · Step 7 item 2 | Clause naming the Premise Ledger and citing the block, in the shape item 3 uses | FR-10 |
| 16 | Mirrors: `docs/commands/akili-specify.md`, `akili-propose.md`, `akili-constitution.md`, `docs/skills/judgment-day.md` | Own-register description; `akili-propose.md` mirror's "impact/scope" replaced | FR-11 |
| 17 | `docs/flow.md` · Bug walkthrough "captures" line | "impact/scope" → "blast radius" | FR-11 |
| 18 | `README.md` | Read for a falsified sentence; expected none — confirmed by grep at execute, not assumed here (KZ-002) | FR-11 |
| 19 | `CHANGELOG.md` · `Unreleased` | Replace the "No unreleased changes yet." note with the entry and the classification | FR-11 |
| 20 | `judgment-day/SKILL.md` · Hard Rules *(pivot amendment)* | The reach clause of §5.7, between the three actions and the severity table; `version` 1.8 → 1.9 | FR-7 |
| 21 | `akili-specify.md` · Step 2.2 block, trigger table *(pivot amendment)* | The `shared-state` row of §5.3 as amended; one line replaced | FR-2 |
| 22 | `CHANGELOG.md` · `Unreleased` *(pivot amendment)* | The two bullets describing the judge rule and the triggers are brought to the amended text | FR-11 |

### 7.2 Consumer walk

**New `design.md` section — every existing reader of `design.md`:**

| Reader | Reads `design.md` how | With the new section |
|---|---|---|
| `/akili-execute` Step 2.2–2.3 | Pointer briefs: path plus section anchor | holds — a task that settles a premise points at its row |
| `/akili-execute` Budget Tripwire | The budget only | holds |
| `/akili-validate`, `/akili-test`, `/akili-audit`, `/akili-quick` | Whole file or not at all; no enumeration of design sections | holds |
| `/akili-resume` briefing | "Major decisions" from the design | holds — open premises are not a resume item in this spec; recorded as a possible follow-up, not added (scope) |
| `/akili-archive` TRD sync | Design Decisions | holds |
| `judgment-day` | Whole document | **changes** — surface rows 8–9 |
| `/akili-constitution` Step 7 | Describes the template | **changes** — surface row 15 |

**Premise classes × their three readers (FR-2, last clause):**

| Class | Step 2.5 counts | Judge rule | Task hand-off |
|---|---|---|---|
| `location`, `existence`, `data-env`, `other` | counted by status and Impact | citation re-run; missing depended-on premise is a finding | none — acts through *If false* |
| `live-path`, `shared-state` | same | same, **plus** severe when triggered and absent | none — acts through *If false* |
| `consumer` | same | same, **plus** severe when triggered and absent | copied into `Consumers` |
| any class, `UNVERIFIED` | counted as open, split by Impact | judge tries to refute it | owning task settles it first |

**New judge severities — every reader of judgment findings:**

| Reader | With the new severe classes |
|---|---|
| `/akili-specify` Step 2.5 findings menu | holds — the menu acts on "issues that need correction", whatever their kind |
| `judgment-day` Decision Gates | holds — severity and two-judge agreement drive the gates, not the finding's topic |
| `kaizen` Measure row *Severe judgment-day findings* | holds — counted like any severe finding |

**Renamed template heading — every reader of `Impact & Scope`:** §11 P-6 lists all four sites; all are in the surface table. `/akili-specify` Bug Mode reads the diagnosis for "confirmed root cause + reproduction" and never names the heading — holds.

## 8. Frontend / UX Component Architecture

Not applicable — no UI surface.

## 9. Shared Contracts

| Contract | Owner | Users |
|---|---|---|
| The block's name (§6) | `/akili-specify` Step 2.2 | six citing surfaces and four mirrors |
| Marker `UNVERIFIED — confirm at source before relying on it` | `/akili-execute` Step 2.2 clause (c) — read, never edited | the block, the Blast Radius section, both upstream bullets |
| Task field `Consumers` and its absent-value | `/akili-specify` Step 3.2 rule 5 and `/akili-constitution` Step 7 item 3 — read, never edited | the block's hand-off sentence |

## 10. Design Decisions

### DD-1 — Defined once in Step 2.2; every other surface cites the block by name (NFR-3, KZ-005)
Rejected: a shared reference file under `.claude/skills/`. It would be a new packaged file with no binding level, and commands would have to load it.

### DD-2 — The ledger is appended as *Minimum content* item 11; "written first" is a work-order rule
Inserting it as item 3 would renumber seven items that existing designs and project templates cite by number. Appending breaks nothing. The cost — the reader meets the ledger late in the list — is paid back by Step 2.5, which shows the counts up front.

### DD-3 — Seven classes; "secondary source" is a citation rule, not a class
The proposal's cost table used eight groupings, which were buckets for counting lessons. A label-inferred field is a `data-env` claim with a bad citation; rule (d) is what catches it. `other` is the explicit fall-through, so the set is closed without being brittle (KZ-004).

### DD-4 — Triggers are phrased by what the design changes, and a quiet ledger says so
The "none apply" line makes an untriggered design distinguishable from a forgotten check. It is the same stated-result shape the brief contract uses for "convention files: none found by lookup".

### DD-5 — The marker is reused byte for byte; a person's statement goes in *Settled by*
One marker across brief, proposal, requirements, and ledger means one grep finds every open fact in a spec folder.

### DD-6 — The hand-off sentence lives in the Step 2.2 block; Step 3.2 is not touched
Risk: the Phase 3 author never rereads Phase 2 text. Mitigation: a Verification Checklist item names the hand-off, and the checklist sits outside the frozen Falsifiability block.

### DD-7 — The judge rule sits beside the count-contrast rule; read-only is defined in the same bullet
A separate "tool contract" section would invite drift between two statements of one rule (KZ-changes--leader-brief-contract-1).

### DD-8 — Severities live in the judge rule, not in the block
Severity is the auditor's vocabulary. The block defines what a row is; the rule defines what a bad row costs. Neither restates the other.

### DD-9 — `Impact & Scope` is renamed `Blast Radius`, keeping its content *(removes a shipped heading — challenged, §12)*
Rejected: a new section beside the old one — two owners of "blast radius", the defect FR-9 forbids. Rejected: keeping the old heading with the checks inside — the heading would not say what the section now demands.

### DD-10 — Upstream surfaces get one sentence each
A second ledger in the proposal or the requirements would be a second thing to keep true. The inline marker costs a clause per claim.

### DD-11 — Step 2.5 adds a line and a sentence, never a menu option
"Review Design" already exists. A sixth option would be a new enumerated value with its own consumers.

### DD-12 — Rules by class; corpus and product names only in parentheticals (NFR-4)
The shipped text may cite the entries the requirements' scenarios cite. It **must not** cite any held-out entry (DD-13), or the closing gate becomes an inert fixture.

### DD-13 — The closing gate is a literal-reader walkthrough with held-out cases (KZ-changes--gate-falsifiability-1)

| Set | Cases |
|---|---|
| Cited (success criterion 1) | `changes--kp-report-modal-auto-create` · `bugfix--evidence-storage-link-validation` · `changes--realtime-section-completion` · `changes--sidebar-toggle-consolidation` · `changes--my-work-board` |
| Cited, other surfaces | `changes--bilateral-review-ux-polish` (judge rule) · `bugfix--innovation-dev-p25-save-500` (Bug Track) |
| **Held out — never named in shipped text** | Block: `results--intermediate-outcome-aow-visibility--target-tooltip` · `bugfix--toc-unmapped-orange-notes` · `changes--emerging-creation-hide-indicator-ui` · `changes--result-sidebar-collapse-mobile` · `changes--kp-project-match`. Judge rule: `changes--kp-cgspace-browse`. Bug Track: `bugfix--global-search-prod-deploy` |
| Rejected as held-out | `result-framework-reporting--programme-results-created-by-filter` — already named in shipped text (`akili-specify.md:353`, Consumer Sweep rule), so a reader could find it by its citation. Baseline grep of all held-out slugs over `.claude`, `docs/commands`, `docs/skills`, `docs/flow.md`, `README.md`, `CHANGELOG.md` at `571edaf`: that one hit only |
| Negative controls (NFR-2) | a prose-only design; a one-caller private-function change |

Each case is judged against the general sentence with its parenthetical stripped. Expected outcomes are **not** written in this design: they are derived from the shipped text when the walkthrough task runs (KZ-changes--leader-brief-contract-2). One held-out case is known to be hard — in `result-sidebar-collapse-mobile` the false premise lived in a task's selector, not in the design — so "the shipped text does not demand this row" is a legitimate, reportable result there.

### DD-14 — The judge rule reaches a row its citations cannot settle *(pivot amendment, 2026-09-19)*
The three actions are keyed to a citation, to the marker, and to a missing row. A row with an empty evidence cell, and a row cited to a document, sit between them: the literal reader scored both severe without being sent anywhere. The rule now routes both into action 2 rather than adding a fourth action, because the work is the same work — attempt the refutation at the primary source, report `not re-run` when the host cannot reach it. Rejected: raising the severity of an uncited row, which changes what a bad row costs without changing what the judge does.

### DD-15 — The `shared-state` trigger is worded by what is read, not by what holds it *(pivot amendment, 2026-09-19)*
"State, a service, a base class, or a lifecycle hook" names the containers a value lives in, so a template condition more than one block reads fell outside the trigger while being exactly the sibling relationship the class exists for. The trigger gains "a condition or signal more than one block or component reads", and *sibling* is defined by reading rather than by ownership, over all three read-targets the FR-2 bullet names — state, condition, signal — so no branch of the trigger reaches a row whose definition does not. Rejected: a new class, which would break the closed set of seven and every enumeration built on it (§7.2).

## 11. Premise Ledger

`Premise Ledger: 12 verified · 1 UNVERIFIED (0 High, 1 Low)` — verified at `571edaf`, all commands run from the repository root.
`Blast-radius triggers:` **consumer** fires (a template heading, the `design.md` section set, and judge severities change — P-6, P-10, P-11); **live-path** fires (the design names the user's Review Design choice — P-3); **shared-state** does not apply — the change is prose and holds no runtime state.

| # | Claim | Class | Citation (as run) | Verified at | If false | Settled by |
|---|---|---|---|---|---|---|
| P-1 | The `judgment-day` Integration table points at "Step 2.3" for Review Design | `location` | `.claude/skills/judgment-day/SKILL.md:64` | `571edaf` | FR-8 first bullet has nothing to fix — Low | — |
| P-2 | `/akili-specify` Step 2.3 calls the panel "the opt-in Step 2.4 pass" | `location` | `.claude/commands/akili-specify.md:267` | `571edaf` | FR-8 second bullet has nothing to fix — Low | — |
| P-3 | The Review Design option is reached from Step 2.5: heading → menu item → findings menu | `live-path` | `akili-specify.md:287` (Step 2.5 heading) → `:293` (option 1) → `:299` (findings menu); skill entry at `SKILL.md:13` (Activation Contract) | `571edaf` | Both pointer fixes name the wrong step — **High** | — |
| P-4 | The methodology text has no premise concept today | `existence` | `grep -rni premise .claude/commands .claude/skills/judgment-day .claude/templates` → 2 hits, both `akili-constitution.md` (persona description; "verify the premise (interpreter, tool, credential)"); alternate names tried in the same scope: `grep -rniE "assumption ledger|verified at|as run"` → 1 hit, `leader.md:181` ("send verified at the target" — message delivery, unrelated) | `571edaf` | The block duplicates an existing rule; DD-1 changes — **High** | — |
| P-5 | The marker text is `UNVERIFIED — confirm at source before relying on it` | `data-env` | `.claude/commands/akili-execute.md:179` | `571edaf` | NFR-6 byte comparison targets the wrong string — Low | — |
| P-6 | `Impact & Scope` / "impact/scope" is read at exactly four live sites | `consumer` | `grep -rn -i 'impact & scope\|impact/scope\|impact and scope' .claude docs README.md AGENTS.md CLAUDE.md --exclude-dir=worktrees --exclude-dir=archive --exclude-dir=premise-ledger` → `akili-propose.md:102`, `:202`, `docs/commands/akili-propose.md:77`, `docs/flow.md:111` | `571edaf` | A fifth site keeps the old name; surface table gains a row — Low | — |
| P-7 | `docs/flow.md` needs exactly one line changed | `consumer` | Same grep as P-6 → `docs/flow.md:111`; `grep -n -i 'review design\|judgment' docs/flow.md` → `:252`, `:420`, `:455`, `:456`, each read: none names a Phase 2 step number or the Bug Diagnosis contents | `571edaf` | Task for mirrors grows — Low | — |
| P-8 | The Falsifiability block is one contiguous range that no planned edit enters | `location` | `akili-specify.md:347` (block opens) – `:354` (rule 6); next bullet at `:355`. Planned edits sit at Step 1.2 (`:141`, after the *numbers from images* bullet), Steps 2.1–2.5 (`:206–:299`), and the Verification Checklist (`:395` onward) — all outside `:347–:354` | `571edaf` | NFR-1 is violated by surface row 7 — **High** | — |
| P-9 | A read-only agent as packaged can search and read but has no shell | `data-env` | `.claude/commands/akili-constitution.md:664` — Reviewer wrapper `tools: Read, Grep, Glob`. No judge wrapper exists: `grep -n -i judge .claude/commands/akili-constitution.md` → 3 hits (`:425`, `:434`, `:1145`), none a wrapper | `571edaf` | The rule's capability wording is wrong; §5.7 changes — Low | — |
| P-10 | No existing command enumerates `design.md` sections in a way a new section falls through | `consumer` | `grep -n 'design\.md' .claude/commands/akili-{execute,validate,archive,audit,resume,test,quick}.md` → 38 mentions, every line read; section-level reads only at `akili-execute.md:161`, `:192`, `:194`, `:220` (pointers, edits, budget), `akili-archive.md:141` and `akili-resume.md:123` (design decisions) | `571edaf` | §7.2 gains a **changes** row and a surface — **High** | — |
| P-11 | The kaizen Measure row counts severe judgment findings without reading their topic | `consumer` | `.claude/skills/kaizen/SKILL.md:66` | `571edaf` | FR-7 needs a kaizen clause; NFR-1 scope grows — Low | — |
| P-12 | No packaged file is added, so installer file lists need no change | `existence` | §4 lists edits only; `ls .claude/skills/judgment-day` → `SKILL.md` alone; `.claude/skills/_shared` → does not exist | `571edaf` | `verify:cli` fails at the closing task — Low | — |
| P-13 | Judges on the three non-Claude hosts can search the repository when told to be read-only | `data-env` | `UNVERIFIED — confirm at source before relying on it` | — | Judges there report rows `not re-run`; the rule still holds through its degrade branch — Low | Not settled in this spec. Owner: the user, at the first non-Claude `judgment-day` run; the `not re-run` value makes the outcome visible |

## 12. Reversion Challenge (Step 2.3) — outcome

| DD | Removes | Question: what does removing it break? | Answer |
|---|---|---|---|
| DD-9 | The `### Impact & Scope` heading in the Bug Diagnosis template | Anything that reads the heading by name; any proposal already written with it | Nothing reads it by name (P-6: four prose sites, all in the surface table). Existing proposals stay valid (NFR-7). **One real gap found and closed in §5.5:** an older proposal has no Blast Radius results for Bug Mode to turn into rows, so the design states that the architect runs the four checks in Step 2.1 in that case |

The two pointer fixes (FR-8) correct a reference and remove no behavior. No other DD takes anything away.

## 13. Budget (Step 2.4 — tripwire for `/akili-execute`)

| Measure | Estimate |
|---|---|
| Tasks | **10** — block · remaining `/akili-specify` sites · `judgment-day` · `/akili-propose` · constitution clause · mirrors and changelog · closing walkthrough · **judge-rule reach amendment · trigger amendment and its mirrors · closure re-gate** |
| Shipped lines (added or changed, packaged files and mirrors) | **~160** — 126 shipped through T6, plus ~10 for the two amendments and their mirrors; the spec-local walkthrough document is outside this count |
| Review rounds | **12** — one per task, two rework rounds, and the closure re-gate's own round |

**Re-sized at the pivot (2026-09-19).** The original budget read 7 tasks · ~150 lines · 9 rounds; T7's closure gate fired and the user approved Option B, which reopens two rules at their source and re-walks three cases. The overrun is two tasks' worth of rework and three review rounds, spent on the finding the closure gate exists to produce. Ten small prose tasks across four packaged files still match **Standard**. Nothing pushes to Full: no data, API, auth, or installer surface. Nothing allows Lite: one definition with six citing surfaces is where restatement drift happens.
