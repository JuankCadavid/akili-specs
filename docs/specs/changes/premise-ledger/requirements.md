# Requirements: Premise Ledger

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/premise-ledger` |
| Depth | **Standard** |
| Type | Change |
| Approval Mode | `gated` — inherited from `proposal.md` |
| Status | Approved — user chose **Continue** at the Step 1.3 gate, 2026-09-19 |
| Date | 2026-09-19 |
| Source | `proposal.md` (commit `571edaf`), Option B: a defined ledger section, ledger-first judging, a Bug Track blast-radius block. Proposed release classification: **minor** — a new required `design.md` section and a new Bug Diagnosis block are new methodology behavior; the user may override |
| Format precedent | `docs/specs/archive/2026-09-19-changes--leader-brief-contract/requirements.md` — this repo has no `docs/specs/general-setup/` (it packages the methodology rather than consuming it); `docs/prd.md`, `docs/ux-ui/design.md`, `docs/trd/trd.md` do not exist here either |
| Adjacent specs | `changes/scoped-constitution-reads` (proposal only) owns `implementer.md` / `tester.md` — disjoint files. Both add a `CHANGELOG.md` `Unreleased` entry: **merge serially** |
| Series | Third of five tier 2–3 specs; hands one input to `budget-and-concurrency` (premise rot at execute time, §4 non-goals) |
| Evidence corpus | `/Users/jcadavid/orca/workspaces/onecgiar_pr/qa-development-2026/docs/specs/kaizen/` (read-only). 110 entry files plus a `README.md`. Every entry a scenario cites was re-read at the source on 2026-09-19 (KZ-001), lesson line in parentheses: `kp-report-modal-auto-create` (L29), `evidence-storage-link-validation` (L25), `innovation-dev-p25-save-500` (L26), `realtime-section-completion` (L34, L38), `sidebar-toggle-consolidation` (L26–28), `my-work-board` (L34), `result-indicator-back-link` (L30–31), `bilateral-review-ux-polish` (L34), `clear-filters` (L33–34), `cognito-email-otp-login` (L29), `emerging-result-contributor-catalog` (L26–27). A scout re-read the proposal's 14 cited items (16 entry files) independently: 11 confirmed, 3 partial, 0 not found. **Partials, recorded so no scenario leans on them:** in `realtime-section-completion` the side-effect premise caused the first Pivot and one FAIL, while the second Pivot and the discarded work belong to a different lesson; in `result-indicator-back-link` the premise caused the Pivot, and the FAIL had another cause; the phrase "paid for themselves" is not in the two files the proposal attaches it to. `sidebar-toggle-consolidation` carries **two** defects — consumers inventoried from co-located unit tests only (L27) and a positive "no automated coverage" assertion (L28) — and is cited under FR-2 for the first. Seven held-out entries that neither the requirements nor any shipped file cites are reserved for the closing walkthrough and are named in `design.md` DD-13 and `tasks.md` |
| Pivot amendment (2026-09-19) | **FR-2 and FR-7 amended after T7's closure gate fired**, with the user's approval of Option B in `execution.md` → *Pivot Record: T7*. The gate's fresh literal reader could not reach the key premise in four cases: the judge rule's three actions do not cover a row that is uncited or cited to a secondary source (F1, F2), and the `shared-state` trigger did not fire on a template condition more than one block reads (F3). FR-7 gains a clause and two scenarios; FR-2's trigger row, its sibling bullet, and one scenario are widened. The fourth finding (F9, no deployed-revision comparison in the Blast Radius) is **not** amended here — it is an environment fact outside FR-9's code-premise framing and is recorded as an input to the series. Tasks T8–T10 carry the amendment; T1–T6 stay as shipped except where T8/T9 name them |
| Discovery beyond the proposal | **A second stale pointer.** `/akili-specify` Step 2.3 calls the judgment-day panel "the opt-in Step 2.4 pass"; the **Review Design** option lives in Step 2.5. Same class and same file as the proposal's `judgment-day` pointer — folded into FR-8 |

## 2. Executive Summary

A design makes claims about the system it builds on — where a behavior lives, which path the user travels, what already exists, who shares the state, who consumes the contract. Today those claims are prose, and nothing audits them: the Implementer's auditor reads the diff, not the assumption behind it. A false premise is therefore implemented correctly, PASSed, and found at HITL, in production, or never.

This spec makes each such claim a **row in a Premise Ledger** inside `design.md`: the claim, its class, a citation that can be re-run, the commit it was verified at, and what breaks if it is false. A claim without a citation is written `UNVERIFIED` and routed to the first check that can settle it. `judgment-day` attacks the ledger before anything else. The Bug Track gains a four-check **Blast Radius** block. Text only: no tool, no hook, no persona or `/akili-execute` change.

| Decision carried from the proposal | Pinned here |
|---|---|
| Q1 — where does the ledger live? | One ledger, in `design.md`. Upstream documents cite or mark inline (FR-6); they never hold a second ledger |
| Q2 — does Lite carry it? | Yes, same row shape, no minimum row count (FR-1) |
| Q3 — does a High-impact `UNVERIFIED` row block approval? | No. It recommends **Review Design**; the user decides (FR-5) |

## 3. Glossary

| Term | Meaning |
|---|---|
| **Premise** | A statement a design makes about the **existing** system — code, data, environment, contract, or standing rule — that the design takes as given rather than creates |
| **Premise Ledger** | The `design.md` section holding one row per premise the design depends on. Always written in full as "Premise Ledger" — `judgment-day` already uses "findings ledger" and "frozen ledger" for its own record, and the two are never abbreviated to "the ledger" in the same document |
| **Dependence test** | The rule that decides whether a claim earns a row: *if this claim were false, would a design decision, a task, or the scope change?* Yes → row. No → no row |
| **Citation as run** | Evidence a reader can reproduce from the repository root: a `file:line`, or a command with its pattern, its scope, and the hit or count it returned |
| **Primary source** | The code that writes or reads the thing, the definition of the contract, the route or dispatch table. A UI label, a comment, a component name, a document, another spec's summary, and a person's recollection are **secondary** |
| **`UNVERIFIED`** | The absent-value of the citation cell. Same marker the brief contract ships (`/akili-execute` Step 2.2 clause c): `UNVERIFIED — confirm at source before relying on it`. It is a visible state, never a blank and never an omitted row |
| **Settling check** | The first check able to confirm or refute an `UNVERIFIED` premise, named in the row together with its owner (a task ID, `judgment-day`, the HITL pause, or a named person for an environment the repo cannot reach) |
| **Impact** | `High` when a false premise overturns a design decision, discards a task, or makes the spec unnecessary. `Low` when a task adjusts and the approach stands |
| **Blast-radius row** | A row of class `shared-state`, `consumer`, or `live-path`. Required only when its trigger applies (FR-2) |
| **Negative-existence claim** | "No X exists" — no coverage, no consumer, no prior fix, no writer |
| **Parity claim** | "Same as the sibling" — same contract, same fields, same mechanism |
| **Blast Radius block** | The four recorded checks in the proposal's Bug Diagnosis: already fixed · live path · siblings · consumers (FR-9) |

## 4. System Context & Scope

**What exists today, and stays.** `/akili-specify` Phase 2 asks the design to "use current repo paths" and "extend existing architecture"; Step 2.3 challenges decisions that *revert* delivered behavior; Step 3.2 rule 5 (*Consumer Sweep*) greps test files per changed symbol at task level. `judgment-day` judges contrast figures across in-scope documents and warn that "documents agreeing with each other is not corroboration". `/akili-propose`'s Bug Track requires a confirmed root cause and an `Impact & Scope` note. None of these sends anyone to the source for what the design *assumes*. Checked at `571edaf`: `grep -rni premise .claude/commands .claude/skills/judgment-day .claude/templates` → 2 hits, both in `akili-constitution.md`, neither about designs.

**In scope:**

| Surface | Sections | Requirement |
|---|---|---|
| `.claude/commands/akili-specify.md` | Step 1.2 guidelines (cite or mark); Step 2.1 (verify while exploring); Step 2.2 *Minimum content* + one **Premise Ledger** guideline block; Step 2.3 (pointer sentence only); Step 2.5 (counts, recommendation); Verification Checklist | FR-1..FR-6, FR-8 |
| `.claude/skills/judgment-day/SKILL.md` | Hard Rules (one rule); AKILI-SPECS Integration table (pointer + target wording) | FR-7, FR-8 |
| `.claude/commands/akili-propose.md` | Bug Track bullets; Step 2 *Problem / Current Behavior*; Bug Diagnosis template; Review Checklist; Report To User | FR-6, FR-9 |
| `.claude/commands/akili-constitution.md` | Step 7 item 2 (`design.md` template description) | FR-10 |
| Mirrors and release notes | `docs/commands/akili-specify.md`, `akili-propose.md`, `akili-constitution.md`; `docs/skills/judgment-day.md`; `README.md` and `docs/flow.md` **only where a sentence turns false**; `CHANGELOG.md` `Unreleased` | FR-11 |

**Out of scope (non-goals, all standing from the proposal):**

- **No tool.** No script that re-runs citations, no hook, no installer or CI change.
- **No re-verification at execute time.** Premise rot between specify and execute is recorded as an input to `budget-and-concurrency`; the row's verified-at commit is what that spec will read.
- **Zero diff** in `/akili-execute`, `/akili-test`, the four personas, the `tdd` skill, and Step 3.2's **Falsifiability** block (NFR-1).
- **No second Consumer Sweep.** Step 3.2 rule 5 keeps the task-level sweep over test files. The Premise Ledger records design-time consumers and hands them to the same field (FR-4).
- **No migration.** Designs written before this change stay valid.
- **No change to the `judgment-day` protocol**: two blind read-only judges, two-judge confirmation, two fix rounds, `approved | escalated`.

**Grep hazard (binding on every verification below):** exclude `.claude/worktrees/`, `docs/specs/archive/`, and this spec's own folder, which quotes superseded phrases verbatim. Every grep runs from the repo root.

## 5. Stakeholders / Personas

| Stakeholder | Interest |
|---|---|
| Architect running `/akili-specify` | A fixed place and shape for what the design assumes; minutes of checking instead of a Pivot |
| Judges in `judgment-day` | A first target with reproducible citations, instead of reading for plausibility |
| User at the Step 2.5 pause | Sees how much of the design is verified and how much is assumed before approving |
| Bug reporter via `/akili-propose` | Learns the bug is already fixed, or the code is off the live path, before a spec exists |
| Tech Lead writing `tasks.md` | `Consumers` arrives pre-filled from the design; each `UNVERIFIED` premise has an owning task |
| Consuming projects | Pick the change up on the next install; old designs read as "no ledger recorded" |

## 6. Functional Requirements

### FR-1: `design.md` carries a Premise Ledger with a fixed row shape

`/akili-specify` Step 2.2 SHALL list the **Premise Ledger** in *Minimum content* and SHALL define it in one guideline block — the single definition every other surface cites by name (NFR-3).

| Column | Content | Absent-value |
|---|---|---|
| `#` | `P-n`, stable within the spec | — |
| Claim | One sentence about the existing system, stated so it can be false | — |
| Class | One value from FR-2's closed set | — |
| Citation (as run) | Per FR-3 | `UNVERIFIED — confirm at source before relying on it` |
| Verified at | Short commit SHA the citation was run against | `—` when `UNVERIFIED` |
| If false | The design decision, task, or scope item that changes, with Impact `High` or `Low` | — |
| Settled by | For `UNVERIFIED` rows: the settling check and its owner | `—` when verified |

- **Dependence test.** A claim earns a row only when its falsity would change a design decision, a task, or the scope. Trivia earns none.
- **Stated-empty.** A design that names no existing code, data, contract, or rule SHALL write `Premise Ledger: none — <reason>` in one line. An absent section is never a valid empty state (KZ-004).
- **Every depth.** Lite, Standard, and Full carry the same row shape with no minimum row count. In Bug Mode the proposal's Blast Radius results (FR-9) become rows, cited with the commit they were verified at.

#### Scenario: Design names a sibling as the target (`changes--kp-report-modal-auto-create.md`)

- GIVEN a design that says the change lands in a named form "with matching fields"
- WHEN the architect applies the dependence test
- THEN the claim "the URL the user opens mounts this component" gets a row of class `location`, cited to the route definition at `file:line`
- AND IT MUST be written before any design decision that builds on it
- BUT it must NOT be satisfied by the component's name or a field-list resemblance

#### Scenario: Prose-only design

- GIVEN a design whose whole scope is new prose in a new file, touching no existing code, data, or contract
- WHEN Step 2.2 is followed literally
- THEN the section reads `Premise Ledger: none — <reason>` and carries zero rows
- BUT it must NOT omit the section

#### Scenario: Trivia

- GIVEN a true statement about the repository whose falsity would change no decision, task, or scope item
- WHEN the dependence test runs
- THEN no row is written

### FR-2: Premise classes are a closed set; blast-radius rows are required only when triggered

| Class | The claim says | Row required when |
|---|---|---|
| `location` | Where a behavior lives, or who owns it | Dependence test |
| `existence` | Something exists, does not exist, or is already fixed | Dependence test |
| `data-env` | A fact about data, vocabulary, configuration, or an environment | Dependence test |
| `other` | Any other premise, including a standing project rule the design relies on or must obey | Dependence test |
| `live-path` | The code the design changes is what the named user action actually reaches | **Trigger:** the design names a user action, or a branch point (a portfolio, an API version, a flag) |
| `shared-state` | Which siblings share the state or lifecycle the design changes, and what each does with it | **Trigger:** the design changes state, a service, a base class, or a lifecycle hook more than one component uses, **or a condition or signal more than one block or component reads** |
| `consumer` | Who reads the contract the design changes | **Trigger:** the design changes an exported symbol, a selector or DOM hook, an emitted event, a response shape, or a stored field |

- When no trigger applies, the ledger SHALL say so in one line: `Blast-radius triggers: none apply — <reason>`. A triggered class with no row is a defect; an untriggered class with no row is correct.
- A `shared-state` row SHALL enumerate every sibling, each with its mechanism at `file:line`. A count without the list is not a row. A **sibling** is any reader of the same state, condition, or signal — including another conditional block in the same template — not only a component that owns it.
- A `live-path` row SHALL give the dispatch chain from the entry point to the code changed, naming each branch point and the branch taken.
- Every class value SHALL be walked against its three readers — Step 2.5 counts, the judge rule, the task hand-off — so none falls through (KZ-changes--kaizen-loop-closure-1).

#### Scenario: Shared lifecycle hook (`changes--realtime-section-completion.md`)

- GIVEN a design that changes when sections save, asserting that no section has a save side effect
- WHEN the `shared-state` trigger fires
- THEN the row lists every section with what its save path does, at `file:line`
- AND IT MUST enumerate all of them, not a sample
- BUT it must NOT stand as "no section has a save side effect" with no enumeration

#### Scenario: Sibling block on the same condition

- GIVEN a design that changes a condition gating one block of a template, where another block in the same template is gated on the same underlying state
- WHEN the triggers are evaluated
- THEN the `shared-state` trigger fires on the condition, and the row enumerates every block reading it, each at `file:line`
- AND IT MUST include blocks whose own gate is written differently but resolves to the same state
- BUT it must NOT be read as untriggered because no service, base class, or lifecycle hook changed (`bugfix--evidence-storage-link-validation.md`, KZ-EVL-1)

- GIVEN a fix scoped to one function and a reproduction that starts from a user action
- WHEN the `live-path` trigger fires
- THEN the row traces entry point → version branch → handler, and shows whether the function is on it
- BUT it must NOT cite only the function's own `file:line` — that proves the function exists, not that the user reaches it

#### Scenario: Changed DOM hook, consumers inventoried from co-located unit tests only (`changes--sidebar-toggle-consolidation.md`, KZ-STC-1)

- GIVEN a design that changes a selector other code can pin
- WHEN the `consumer` trigger fires
- THEN the row lists every reader found by a search over the whole repository, with the command, pattern, and scope as run — end-to-end suites and suites CI skips included
- BUT it must NOT derive the consumer list from the files that sit beside the changed component

#### Scenario: Backend-only change with no shared contract

- GIVEN a design that changes the body of one private function with one caller
- WHEN the triggers are evaluated
- THEN no blast-radius row is required and the one-line "none apply" statement is written

### FR-3: A citation is reproducible and points at the primary source

- **(a) As run.** A citation SHALL be a `file:line`, or a command with its pattern, its scope, and the hit or count returned. It SHALL reproduce from the repository root at the row's verified-at commit.
- **(b) Negative existence.** A "no X exists" claim SHALL quote the command, pattern, and scope verbatim as run, and SHALL include the concept's known alternate names. A "verified absent" claim is only as true as its search pattern.
- **(c) Parity.** A "same as the sibling" claim SHALL name the sibling's mechanism at `file:line`. A comment, a component name, or a label is not evidence.
- **(d) Primary source.** A citation SHALL point at the primary source (§3). A fact stated by a person, including the user, SHALL be recorded `UNVERIFIED` with `user-stated` in *Settled by* until a primary source confirms it.
- **(e) Run before written.** A citation that states a present-tense reading SHALL be executed before it is written (KZ-changes--leader-brief-contract-2).

#### Scenario: "Verified absent" with a stronger pattern than the one run (`changes--clear-filters.md`, KZ-changes--clear-filters-1)

- GIVEN an architect who searched with one pattern and wrote the claim "no such control exists" beside a different, narrower one
- WHEN (b) and (e) are applied
- THEN the row quotes the pattern and scope exactly as run, alternate names included, so a reader can re-run it
- BUT it must NOT record a pattern other than the one executed

#### Scenario: Field inferred from a label (`changes--result-indicator-back-link.md`)

- GIVEN a design that assumes a response carries a field because the UI paints a matching label
- WHEN (d) is applied
- THEN the citation is the response definition or the code that builds it; failing that, the row is `UNVERIFIED`
- BUT it must NOT cite the label

#### Scenario: "User-confirmed, no grep needed" (`bugfix--emerging-result-contributor-catalog.md`)

- GIVEN a reachability fact the user stated and the documents recorded as confirmed
- WHEN (d) is applied
- THEN the row is `UNVERIFIED` with `user-stated` in *Settled by*, and names the search that settles it
- BUT it must NOT be written as verified on the strength of the statement

#### Scenario: Data facts (`changes--my-work-board.md`)

- GIVEN a design that depends on a table being populated, a vocabulary having N values, and a filter running server-side
- WHEN each enters the ledger
- THEN each cites a writer or reader in code, or the definition of the vocabulary
- BUT it must NOT cite a schema or a document as proof that data is written

### FR-4: `UNVERIFIED` is visible, routed, and handed to tasks through existing fields

- An `UNVERIFIED` row SHALL name its settling check and its owner. "To be confirmed" with no owner is not a row.
- In `tasks.md` the owning task SHALL settle the premise **as its first step**, before building on it, and its Done criteria SHALL record the outcome. A refuted premise follows the existing Pivot Protocol. No new task field is added.
- Rows of class `consumer` SHALL be copied into the owning task's existing `Consumers` field. Step 3.2 rule 5 remains the owner of the test-file sweep; the ledger is the owner of design-time consumers (other apps, reports, siblings). One owner per sweep; the field holds the union.
- The hand-off sentence SHALL live in the Step 2.2 block. The Falsifiability block receives no edit (NFR-1).

#### Scenario: Environment the repo cannot reach (`changes--cognito-email-otp-login.md`)

- GIVEN a premise about a production account setting that no command in the repo can show
- WHEN the ledger is written
- THEN the row is `UNVERIFIED`, names the check, and names the person who can run it
- AND the row is still visible at Step 2.5 and in the owning task
- BUT it must NOT be dropped from the ledger because it cannot be verified today

#### Scenario: Consumer row reaches the task

- GIVEN a `consumer` row listing a report and a sibling app that read a changed response field
- WHEN Phase 3 writes the task that changes the field
- THEN both appear in that task's `Consumers` field beside the test files rule 5's grep finds

### FR-5: Phase 2 verifies while exploring, shows the counts, and recommends review — never blocks

- **Step 2.1.** Premises SHALL be verified during exploration, while the code is already open. A delegated scout SHALL return its findings as citations as run.
- **Step 2.5.** The summary SHALL show the ledger's counts — verified and `UNVERIFIED`, with `UNVERIFIED` split by Impact — and SHALL list every `UNVERIFIED` row.
- **Recommendation.** One or more `UNVERIFIED` rows of `High` Impact SHALL make the summary recommend **Review Design**. It SHALL NOT block **Continue**: the user may hold knowledge the repository does not.
- **`pre-approved` mode.** No new stop is added. Judgment-day already always runs in that mode, so the ledger is attacked regardless.
- **Verification Checklist.** New items: the ledger exists or is stated-empty; every row has a citation or `UNVERIFIED` with an owner; every triggered class has a row or the "none apply" line; every `UNVERIFIED` row is owned by a named task or check.

#### Scenario: Approval with an open High-impact premise

- GIVEN a ledger with six verified rows and one `UNVERIFIED` row of `High` Impact
- WHEN Step 2.5 presents the design
- THEN the summary shows the counts, prints the open row, and recommends **Review Design**
- AND the user can still choose **Continue**
- BUT it must NOT hide the row inside the document only

### FR-6: Upstream documents cite or mark; they never hold a second ledger

- `/akili-propose` Step 2 *Problem / Current Behavior* and `/akili-specify` Step 1.2 *System Context* SHALL state each claim about current behavior with a citation as run or the `UNVERIFIED` marker, inline.
- At Phase 2, every such claim that passes the dependence test SHALL become a ledger row. The upstream text is not rewritten into a table.
- Both surfaces SHALL cite the Step 2.2 block by name for the citation rules. Neither restates them (NFR-3).

#### Scenario: Proposal states current behavior

- GIVEN a proposal that says "the list filters server-side"
- WHEN Step 2 is followed
- THEN the sentence carries a `file:line` or `UNVERIFIED — confirm at source before relying on it`
- BUT it must NOT appear as a bare fact

### FR-7: `judgment-day` attacks the Premise Ledger first, at the source

One Hard Rule SHALL be added. Judges SHALL, before any other reading:

1. Re-run or re-read every citation at the source.
2. Try to refute every `UNVERIFIED` row with their own search.
3. Look for premises the design depends on that have **no row**.

| Judge finds | Severity |
|---|---|
| The source contradicts a premise | **severe** |
| A citation does not reproduce at its verified-at commit | **severe** |
| The design names existing code and has no Premise Ledger, or a false stated-empty line | **severe** |
| A triggered class with no row | **severe** |
| A depended-on premise with no row | finding, severity by Impact |
| A premise confirmed | not a finding |

- **A row the citations cannot settle is attacked, not merely scored.** Action 1 needs a citation and action 2 is written for the marker, so two row states fall between them: a citation cell holding **neither** a citation as run nor the marker, and a citation pointing at a **secondary source** (§3) rather than the primary one. Both SHALL be treated as `UNVERIFIED` for action 2 — the judge attempts the refutation at the primary source, and reports the row `not re-run` where its host cannot reach that source. Re-reading a document settles the document, never the system it describes. Recording the severity without attempting the refutation does not discharge this rule.
- **Read-only is not no-`grep`.** A read-only judge writes nothing; reading files, searching, and reading history are within the contract. A judge whose host cannot run a command SHALL re-derive from the cited files and SHALL report command rows it could not re-run as `not re-run` — never as confirmed.
- **Protocol unchanged.** Two-judge confirmation still gates auto-fix. A premise contradiction reported by one judge is recorded as suspect **with the command as run**, so the architect settles it with one re-run.
- The rule SHALL always say "Premise Ledger" in full (§3, NFR-6).

#### Scenario: Plausible premises (`changes--bilateral-review-ux-polish.md`)

- GIVEN a design whose three Leader-written premises read as plausible
- WHEN two judges follow the shipped rule literally
- THEN each judge re-runs each citation before reading the design decisions, and the contradicted ones surface as severe
- BUT it must NOT accept a premise because the requirements and the design agree on it

#### Scenario: Premise with no citation at all (`changes--bilateral-review-ux-polish.md`)

- GIVEN a ledger row whose citation cell holds neither a citation as run nor the `UNVERIFIED` marker
- WHEN a judge follows the rule literally, before reading the design decisions
- THEN the judge attacks the row as though it were marked `UNVERIFIED`, searching for the primary source itself
- AND IT MUST report what that search returns, including `not re-run` when the source is out of reach
- BUT it must NOT be discharged by recording the severity alone

#### Scenario: Premise cited to a document

- GIVEN a row whose citation names a design document, a research note, a guide, or another spec
- WHEN the judge re-reads what the citation names
- THEN the re-read settles the document only, and the judge goes on to the primary source the document describes
- BUT it must NOT count the document's agreement with the design as confirmation

#### Scenario: Judge without a shell

- GIVEN a judge host that can read files but not run commands
- WHEN a row cites a grep
- THEN the judge reads the cited scope where feasible and reports the row `not re-run`
- BUT it must NOT count the row as confirmed

### FR-8: Two stale pointers are corrected, by name

- The `judgment-day` AKILI-SPECS Integration row SHALL name the **Review Design** option of `/akili-specify` Step 2.5 — *Present & Approve* (today: "Step 2.3").
- `/akili-specify` Step 2.3's sentence SHALL point at the same option (today: "the opt-in Step 2.4 pass").
- Both SHALL identify the target by option and step name, so the next renumbering cannot strand them (KZ-005).

#### Scenario: Reader follows the Integration row

- GIVEN a reader of the `judgment-day` Integration table
- WHEN they open the step it names
- THEN they land on the menu that offers **Review Design**

### FR-9: The Bug Diagnosis records a four-check Blast Radius

| Check | Recorded as | Outcome that stops the proposal |
|---|---|---|
| **Already fixed?** | History query over the target files and the ticket ID, across all branches, as run | A fix exists → no spec; report it and stop |
| **Live path?** | Dispatch chain the reproduction actually travels, entry → code to patch, branch points named | Code is off the path → root cause is not confirmed; diagnosis reopens |
| **Siblings on the same state** | Enumeration with mechanism at `file:line` | — (feeds scope) |
| **Downstream consumers** | Enumeration, including tests and other apps | — (feeds scope) |

- **Already fixed?** SHALL run **first**, before root-cause investigation — it is the cheapest check and the only one that can make the whole spec unnecessary.
- Each check SHALL record its citation as run, or `UNVERIFIED` with an owner. "n/a" SHALL carry its reason.
- **One owner.** The template's existing `Impact & Scope` section already names "blast radius". After this change exactly one section owns it; the Bug Track bullet, the Review Checklist, and *Report To User* name the same section (KZ-changes--leader-brief-contract-1).
- The block SHALL cite the Step 2.2 block for citation rules, not restate them.

#### Scenario: Ticket closed by a teammate (`bugfix--innovation-dev-p25-save-500.md`, KZ-IDEV-1)

- GIVEN a bug report with a ticket ID and target files
- WHEN the Bug Track starts
- THEN the history query runs before any root-cause work and its command and result are recorded
- AND a hit that fixes the symptom ends the proposal with a report
- BUT it must NOT search only the current branch

#### Scenario: Cosmetic bug routed to `/akili-quick`

- GIVEN a purely cosmetic bug with no logic
- WHEN the four checks are recorded
- THEN *Already fixed?* still runs; the other three may read `n/a — <reason>`

### FR-10: The constitution's `design.md` template description names the Premise Ledger

`/akili-constitution` Step 7 item 2 SHALL name the Premise Ledger as a section of the `design.md` template and SHALL cite `/akili-specify` Step 2.2's block for its definition — the shape item 3 already uses for the four Verification fields.

#### Scenario: New project constitution

- GIVEN a project running `/akili-constitution` after this change
- WHEN Step 7 writes `general-setup/design.md`
- THEN the template includes a Premise Ledger section with the row shape and absent-values
- BUT it must NOT redefine classes or triggers locally

### FR-11: Documentation coherence sweep

- The four mirrors SHALL describe the new behavior in their own register and SHALL contradict no command sentence.
- `README.md` and `docs/flow.md` SHALL change only where a sentence turns false. The falsifying grep runs before the claim "no change needed" is written (KZ-002).
- `CHANGELOG.md` `Unreleased` SHALL replace "No unreleased changes yet." with the entry and state the release classification.

#### Scenario: Post-sweep read

- GIVEN all edits are made
- WHEN each mirror is read beside its command
- THEN no mirror sentence describes the Bug Diagnosis, the design contents, or the Review Design step differently from the command

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | **Bounded.** Zero diff in `/akili-execute`, `/akili-test`, `.claude/templates/*`, `.claude/skills/tdd/`, and the Step 3.2 **Falsifiability** block. `bin/`, `scripts/`, and `package.json` files list unchanged |
| NFR-2 | **Cost bound.** A design with no trigger writes zero blast-radius rows and one "none apply" line. Ledger size on the retro-fitted corpus designs is measured and reported in the closing walkthrough |
| NFR-3 | **Defined once.** Row shape, classes, triggers, and citation rules live in the Step 2.2 block only. `judgment-day`, `/akili-propose`, `/akili-constitution`, Step 1.2, and the mirrors cite it by name (KZ-005) |
| NFR-4 | **Rules by class.** Every rule is phrased by mechanism. Product, framework, and corpus file names appear only inside parentheticals |
| NFR-5 | **Host-neutral.** The judge rule names the capability (read, search, read history), and any host primitive only in a parenthetical |
| NFR-6 | **No vocabulary collision.** "Premise Ledger" is never shortened where `judgment-day`'s findings ledger is in scope. The marker text is byte-identical to `/akili-execute` Step 2.2 clause (c) |
| NFR-7 | **Backward compatible.** A design without the section reads as "no ledger recorded". No command fails on it; a judge reports it per FR-7 |
| NFR-8 | **Parallel safety.** No edit to `implementer.md` or `tester.md`; `CHANGELOG.md` merged serially with `changes/scoped-constitution-reads` |

## 8. Defect Classes → Gates

| Defect class this spec can produce | Gate that catches it | Falsifying input |
|---|---|---|
| A rule restated outside the Step 2.2 block (NFR-3) | Grep for the class names and the row-shape column names in `judgment-day`, `/akili-propose`, `/akili-constitution`, and the mirrors — hits only inside a citing sentence | A Bug Track block that re-lists the citation rules |
| A class with no stated behavior at one of its three readers | Manual enumeration: seven classes × (Step 2.5 counts, judge table, task hand-off) | A `data-env` row the judge table never mentions |
| Stale step pointer surviving | `grep -rnE "Step 2\.3 — \*\*Review Design|opt-in Step 2\.4 pass" .claude docs README.md` → 0 | Both phrases hit today |
| Marker drift | Byte comparison of every `UNVERIFIED —` string against `/akili-execute` Step 2.2 clause (c) | "UNVERIFIED – confirm…" with a different dash |
| Two sections owning blast radius in the Bug Diagnosis | `grep -n -i "blast radius" .claude/commands/akili-propose.md` — every hit names the same section | The untouched `Impact & Scope` line beside a new block |
| Edit inside the Falsifiability block or a frozen file (NFR-1) | `git diff --stat` on the frozen paths → empty; block extracted from base and head → identical | Any hunk |
| Vocabulary collision (NFR-6) | `grep -n -i "ledger" .claude/skills/judgment-day/SKILL.md` — the six hits that exist at `571edaf` (findings-ledger vocabulary, including one bare "ledger" in the References list) are unchanged; every **added** hit reads "Premise Ledger" | A bare "the ledger" in the new rule |
| Corpus or product name outside a parenthetical (NFR-4) | Grep for corpus slugs and product names in the four edited files — every hit inside `(...)` | A rule sentence naming a product |
| Mirror contradiction | Per-surface parity read, command beside mirror | A mirror still listing "impact/scope" as the Bug Diagnosis content |
| Packaging regression | `npm run verify:cli && npm run pack:dry-run && git diff --check` | A renamed packaged file |
| **A rule a literal reader cannot execute, or that fails to demand the row that would have exposed a known false premise** | **No automated check.** Substitute: the closing retro-fit walkthrough over the five named corpus designs **plus held-out entries the shipped text does not cite**, each judged against the general sentence with its parenthetical stripped (KZ-changes--gate-falsifiability-1). `INCONCLUSIVE` is reportable and fails the closing task | A held-out case for which no shipped sentence demands a row |
| Ceremony — rows that pass no dependence test | **No automated check.** Substitute: the same walkthrough reports row counts per retro-fitted design; the user reads them at the HITL pause. Residual accepted risk | — |

## 9. Requirement ID Index

| ID | Name | Gate |
|---|---|---|
| FR-1 | Ledger section, row shape, dependence test, stated-empty | read of Step 2.2 block + walkthrough (location case, prose-only case) |
| FR-2 | Closed classes and triggers | class × reader enumeration + walkthrough (shared-state, live-path, consumer, backend-only, sibling-block-on-the-same-condition) |
| FR-3 | Citation rules (a–e) | read of block + walkthrough (negative-existence, secondary-source, user-stated, data cases) |
| FR-4 | `UNVERIFIED` routing and task hand-off | read of block + Falsifiability-block identity check |
| FR-5 | Step 2.1, Step 2.5, checklist | read of the three sites |
| FR-6 | Upstream cite-or-mark | restatement grep + read of both sites |
| FR-7 | Ledger-first Hard Rule | vocabulary grep + walkthrough (plausible-premises case, uncited row, document-cited row) |
| FR-8 | Stale pointers | pointer grep |
| FR-9 | Bug Track Blast Radius | single-owner grep + walkthrough (already-fixed case) |
| FR-10 | Constitution template description | restatement grep + read |
| FR-11 | Coherence sweep | parity read + packaging commands |
| NFR-1..8 | Bounded / cost / once / by-class / neutral / vocabulary / compat / parallel | diff-stat + greps above |
