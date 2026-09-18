# Requirements: Leader Brief Contract

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/leader-brief-contract` |
| Depth | **Standard** |
| Type | Change |
| Approval Mode | `gated` — inherited from `proposal.md` |
| Status | Approved — batch approval by the user, 2026-09-18 (drafted by a worktree agent on the Leader's behalf) |
| Date | 2026-09-18 |
| Source | `proposal.md` (approved intent 2026-09-18; Release Classification: **patch** proposed, user may override). Option B (command owns the operational text; personas restate the principle; one new record type; runtime table extended in place) |
| Format precedent | `docs/specs/archive/2026-09-18-changes--kaizen-loop-closure/requirements.md` — this repo has no `docs/specs/general-setup/` (it packages the methodology rather than consuming it) |
| Cross-spec hand-off (in) | Two lines delivered **here** on behalf of `changes/gate-falsifiability` (design §7 consumer walk, DD-6), which owns `/akili-specify` + `tdd` and must not touch this spec's files: **(1)** `reviewer.md` audit checklist — verify the recorded red run failed on the behavioral assertion and trace the named mutation through the fixture; a test *named* after a mutation is not evidence it exercises it (FR-7). **(2)** `/akili-execute` Step 2.2 brief — alongside "the verification command to run before reporting completion (copied)", the brief also copies the task's `Falsifier`, `Red run`, and `Consumers` fields so the Implementer runs the consumer suites and reports the assertion-level red (FR-1, clause e) |
| Cross-spec hand-off (out) | None. `changes/gate-falsifiability` cites this spec for both lines instead of editing `reviewer.md` or `/akili-execute` |
| Adjacent specs | `changes/scoped-constitution-reads` (proposal only) plans an edit to `/akili-execute` Step 0 **and** one added item in the Step 2.2/2.3 brief lists ("the TRD/design sections this task touches") — same lists this spec rewrites. Parallel-safe for work; **merge serially** and re-run this spec's FR-9 greps after the merge |
| Worktree note | Drafted in a worktree that predates commit `02ed0e9` (`changes/kaizen-loop-closure` archive). Every surface row is stated by section name (KZ-005) and was checked against main: `leader.md` item 4 on main already carries the *pre-review restatement sweep* paragraph and the Shared-File Write Discipline reads "apply-capable branch"; the kaizen skill's *Measure* table, `/akili-archive` Step 4.1, and `/akili-resume` Step 1 keep the names cited in FR-8 |
| Evidence corpus | `/Users/jcadavid/orca/workspaces/onecgiar_pr/qa-development-2026/docs/specs/kaizen/` (104 entries, read-only). Entries cited per finding in §4 and per scenario below |

## 2. Executive Summary

The `/akili-execute` triad runs on four texts — the Implementer brief, the Reviewer brief, the Reviewer report, and the `execution.md` record — and none of them has a stated shape or limit. Measured on one consuming project, the largest single class of Reviewer rework traces to **brief content** (a fallback the task lacked, a convention file the brief never named, a fact the Leader asserted without a source), six of eleven verdicts in one run were lost to a harness result cap because `STATUS:` came last, 21 entries record a worker killed by a provider limit with no rule for whether that costs an attempt, ten tasks closed with no independent Reviewer and reported "0 FAILs", and the HALT rollback would once have destroyed nine PASSed, uncommitted tasks. This spec gives each text a contract, makes runtime and quota events a first-class loop event with a fixed recovery ladder, adds one record type (`REVIEW_WAIVED`) so "0 FAILs" is never read as an exercised gate, and branches the HALT rollback on the state of the tree. The 3-attempt ceiling, `FATAL_FAIL`, the Pivot Protocol, the Delegation Ceiling, and the idle-without-report protocol are untouched.

## 3. Glossary

| Term | Meaning |
|---|---|
| **Brief** | The text the Leader hands a worker at spawn (Step 2.2 Implementer brief, Step 2.3 Reviewer brief). *The brief is law to the worker*: whatever it adds or drops is executed faithfully |
| **Narrow-never-widen** | A brief may restrict a task (fewer files, tighter scope, an explicit order) but may not add a fallback, option, alternative, or deliverable the task text lacks |
| **Convention file** | A file that governs the target's shape without being the spec: a folder-level agent guide (`CLAUDE.md` / `AGENTS.md` chain), a guide-named cap or contract file (e.g. a component-docs cap, a payload contract), a style rule file the constitution's `## Module Guides` index names |
| **Convention-file lookup** | The bounded two-step procedure that produces the convention-file list for a target (FR-1 clause b) — a lookup, never a search |
| **`UNVERIFIED`** | The marker a brief carries on any infrastructure or third-party fact the Leader states without a source the worker can read |
| **Advisory-grade item** | A brief item the Leader added beyond the task text, tagged so the Reviewer audits it in the `ADVISORY` tier and can never FAIL on it. The tag lowers the item; it does not license it — narrow-never-widen still forbids new scope |
| **Execute-time spec edit** | A Leader edit to `requirements.md` or `design.md` during execution that clarifies without changing an approved requirement's meaning. An edit that changes meaning is a **Pivot** and follows the existing Pivot Protocol |
| **Report contract** | The Reviewer's returned message: `STATUS:` line first, then summary, issues, `ADVISORY`; at most ~600 words; overflow issues by file |
| **Diff-delivery threshold** | The size above which the Reviewer receives the diff as a file path to `Read` instead of inline — **300 lines** (pinned here; open question 3 in §4) |
| **Runtime event** | A harness- or provider-side failure that is neither a work FAIL nor a spec problem: **spawn failure** (worker never started), **provider-limit death** (worker killed mid-task by a quota, rate, or session limit), **pane / terminal timeout** (transient host failure), **idle-without-report** (worker's turn ended without its contracted report — defined and handled in `leader.md`, cited by name, never restated) |
| **Attempt** | One Implementer → Reviewer round. **Consumed only by a Reviewer `FAIL` or an Implementer-reported verification failure** — by nothing else |
| **Recovery ladder** | The fixed per-role order of recoveries for a runtime event (FR-4). The Leader climbs it rung by rung; it never improvises |
| **Retry-after-N** | The ladder rung that waits N minutes once, in the background, then retries — **N = 3 minutes, one retry** (pinned here; open question 2) |
| **Resume-by-message** | The rung that messages a killed worker whose context survives, asking for the contracted report as its terminating act (the harness's message primitive — `SendMessage` in Claude Code) |
| **`REVIEW_WAIVED`** | The `execution.md` record written by the Leader, before `[x]`, whenever a task closes without a Reviewer PASS from an independent context on a different model at the registry's tier. Flags: `inline` · `same-model` · `degraded-pair` (FR-5) |
| **Tree state** | At HALT, one of three: **clean** (only the halted task's changes are uncommitted), **holds other PASSed work** (uncommitted changes attributable to earlier PASSed task entries), **holds unattributed changes** (changes no task entry accounts for) |
| **Pathspec** | The explicit list of file paths — never directory globs — derived from the halted task's attempt entries' *files changed* lines |

## 4. System Context & Scope

**What exists today, and stays.** `/akili-execute` Step 2 defines the loop (3 attempts, `author ≠ auditor`, evidence before checkbox), Step 2.2–2.3 list brief *contents*, the Step 2 preamble carries a per-role *Runtime-failure fallback* table (retry once, then degrade by role; Reviewer never inline), Step 4 runs a blanket rollback, and the Execution Log Format lists what a task entry records. `leader.md` owns the idle-without-report protocol (KZ-003), the Delegation Thresholds and Ceiling, *Winding down*, and the background-wait rule ("never block your turn on a wait you can background"). This spec extends those — every new rule sits beside an existing one and cites it by name (KZ-005).

**In scope:**

| Surface | Sections | Requirement |
|---|---|---|
| `.claude/commands/akili-execute.md` | Step 2 preamble *Runtime-failure fallback* table; Step 2 loop pseudocode; Step 2.2 (brief contract block + copied fields); Step 2.3 (Reviewer brief: execute-time edits, diff delivery; report contract); Step 2.4 (attempt accounting clause; review-round accounting); Step 3 opening line; Step 4 (rollback by tree state); Step 5 (waiver stop under `pre-approved`; `/goal` canonical condition); Execution Log Format (`REVIEW_WAIVED` record, per-attempt runtime events, execute-time edits, final-status vocabulary) | FR-1..FR-6 |
| `.claude/templates/leader.md` | Delegation Discipline (one persona paragraph: narrow-never-widen, convention files, source-or-`UNVERIFIED`, advisory-grade, carry execute-time edits); item 4 *Rework Loop* (attempt-accounting clause; HALT rollback "by tree state") | FR-1, FR-4, FR-6 |
| `.claude/templates/reviewer.md` | Structured Review Output (report contract stated where the three options are defined); the diff-size mode table (diff-delivery note); 4R section (advisory-grade items audited as `ADVISORY`); Audit Checklist (hand-off item: red run + mutation trace) | FR-3, FR-1, FR-7 |
| Consumers of `REVIEW_WAIVED` (proposal §7, success criterion 4) | `/akili-resume` Step 1 (*Last Action* / *Blocked*); `.claude/skills/kaizen/SKILL.md` Measure table + clean-run predicate + Metrics example; `/akili-archive` Step 4.1 signal list — **one clause each**, nothing else in those files | FR-8 |
| Mirrors and root docs | `docs/commands/akili-execute.md` (per-task loop, Reviewer output contract, Outputs, Guardrails); `docs/flow.md` and `README.md` loop diagrams / guardrail bullets **only where a sentence turns false** (grep at FR-9 — KZ-002); `docs/skills/kaizen.md` only if it enumerates Measure signals | FR-9 |
| Release | `CHANGELOG.md` `Unreleased` | FR-9 |

**Out of scope (non-goals, from the proposal, all standing):**

- No gate or test-falsifiability rules beyond the two hand-off lines — `changes/gate-falsifiability` owns `/akili-specify` Step 3.2, `tdd`, and the task template. **This spec edits none of `/akili-specify`, `tdd`, `/akili-constitution`, `implementer.md`, `/akili-test`** (NFR-7).
- No HITL row schema, capability probe, or first-UI-task look (`changes/hitl-row-schema`).
- No budget, LOC, review-round, or worktree-concurrency rules (`changes/budget-and-concurrency`); the pathspec rollback is a HALT rule, not a commit-discipline rule.
- No installer, hook, or CI change. `REVIEW_WAIVED` is a text record; the Step 8F tasks-gate hook is not extended. **Known interaction, recorded not fixed:** that hook is a file-level `grep -q "PASS"` on `execution.md`; a waived *first* task in a fresh `execution.md` is blocked from `[x]` by the hook and stays `[~]` with the waiver recorded — the rule "never work around the hook" binds, and the user either obtains a real review or extends the hook outside this spec (design DD-7).
- No model-budget or quota-forecasting rule; event handling is reactive by design.
- No change to the 3-attempt ceiling, `FATAL_FAIL`, the Pivot Protocol, the Delegation Ceiling, or the idle-without-report protocol (KZ-003) — the runtime-event class sits **beside** the idle protocol and points at it by name.
- No `/akili-test` change (Tester row of the runtime table keeps its pointer to the Deployment Rule; a `TEST_WAIVED` twin is a later decision).

**Open questions carried from the proposal (pinned defaults below; the user confirms or overrules at approval):**

| # | Question | Pinned default in this spec |
|---|---|---|
| 1 | Can a `REVIEW_WAIVED` auto-pass under `pre-approved`? | **No.** The waiver removes the correctness gate; it is an exception on the list `AGENTS.md` already says pre-approval never covers. The Reviewer row's "offer the user" is a stop (FR-5) |
| 2 | Retry-after-N: what N, and foreground or background? | **N = 3 minutes, one retry, backgrounded** per `leader.md` *never block your turn on a wait you can background*, announced in one line; a second failure climbs to the next rung (FR-4) |
| 3 | Diff-delivery threshold: lines or bytes? | **300 lines** (the Reviewer's mode table is already in LOC; the field cut was observed at ~4 KB of *report*, and diffs switched to file at > 300 lines — `bilateral--center-overview-tab.md`) (FR-3) |
| 4 | Is `same-model` a waiver at all? | **Yes, as a flag.** It records the case where a different model and cross-host dispatch were tried and the only remaining model equalled the Implementer's (`changes--cognito-email-otp-login.md`). The flag exists so the metric says *how* independence was lost, not to make it acceptable (FR-5) |

**Grep hazard (binding on every verification below):** exclude `.claude/worktrees/`, `docs/specs/archive/`, and this spec's own folder (`docs/specs/changes/leader-brief-contract/`), which quotes the superseded phrases verbatim. Every grep runs from the repo root.

## 5. Stakeholders / Personas

| Stakeholder | Interest |
|---|---|
| Leader (every host) | One written rule for what a brief may contain, what a report looks like, what a dead worker costs, and what to restore at HALT — no deviation under pressure |
| Implementer | A brief that names every governing file and marks what is fact, what is unverified, and what is advisory — so a rework round is spent on code, never on the brief |
| Reviewer | A report shape whose verdict survives the harness cap; a diff it can `Read` when large; a checklist item that catches the inert-fixture class |
| `/akili-resume`, kaizen Measure, `/akili-archive` | A record type that lets "0 FAILs" be read correctly — each names the branch that reads it |
| Consuming projects | Personas picked up on the next `--force` install or by hand; old `execution.md` files read as "no waiver recorded", which is the honest state |
| `changes/gate-falsifiability` | Its two lines land without it touching this spec's files |

## 6. Functional Requirements

### FR-1: The Implementer brief is a contract — narrow, sourced, complete, tagged

`/akili-execute` Step 2.2 SHALL carry a **Brief contract** block, and `leader.md` Delegation Discipline SHALL restate its principle in one paragraph without re-deriving the mechanics (the file's existing division). The contract:

- **(a) Narrow-never-widen.** The brief SHALL add no fallback, option, "honest alternative", or deliverable the task text lacks. Restricting is allowed; adding is not. `AGENTS.md`'s *Scope only grows through approval* binds the brief exactly as it binds advisories.
- **(b) Convention-file enumeration, by lookup.** The brief SHALL name every convention file governing the target, produced by this two-step lookup and nothing wider: **(1)** from the target file's folder walk up to the repository root and list every agent guide (`CLAUDE.md` / `AGENTS.md`) and every cap or contract file such a guide names; **(2)** add the constitution's `## Module Guides` entries whose path prefixes the target, plus any file the task or design already cites. One directory listing per level; a chain that exceeds the Delegation Thresholds' read budget goes to a scout, never into an open-ended search (NFR-6). When the lookup finds nothing, the brief SHALL say so (`convention files: none found by lookup`) — an absent list is a stated result, never a silent omission (KZ-004).
- **(c) Source-or-`UNVERIFIED`.** Every infrastructure or third-party fact the brief states (an environment-variable meaning, a message envelope, a response key, a route) SHALL cite a source the worker can read (file + section, or a command output) or carry `UNVERIFIED — confirm at source before relying on it`.
- **(d) Advisory-grade tagging.** Any item the Leader adds beyond the task text SHALL be tagged `[advisory-grade]`; the Reviewer audits it as `ADVISORY` only. **Both halves stated together:** the tag lowers the item's tier; it does not license the addition — (a) still forbids new scope.
- **(e) Copied verification fields (hand-off from `changes/gate-falsifiability`).** Alongside the verification command, the brief SHALL copy the task's `Falsifier`, `Red run`, and `Consumers` fields so the Implementer runs the consumer suites and reports the assertion-level red. When the task carries no such fields (a spec written before that change), the brief SHALL state `no Falsifier / Red run / Consumers fields in this task` — the absence is visible, never inferred (KZ-004).

#### Scenario: Brief offers a fallback the task lacks (`changes--aow-identity-column-starvation.md`, KZ-AIS-1)

- GIVEN a task whose text requires measuring a value, and a Leader inclined to write "record it as not measurable, honestly" into the brief
- WHEN the Leader composes the Step 2.2 brief under the contract
- THEN the fallback is not written; if the Leader believes the measurement is impossible, that is a spec gap raised via the Pivot Protocol or a `[advisory-grade]` note — never an executable alternative
- BUT it must NOT appear as an instruction the Implementer can take and the Reviewer then FAILs

#### Scenario: Target folder holds a guide-named cap (`bugfix--reporting-table-actions-clipped.md`, 4th recurrence)

- GIVEN a target component whose folder chain contains a `CLAUDE.md` naming a component-docs file with a line cap and a freshness stamp
- WHEN the lookup in (b) runs
- THEN the brief names the guide and the cap file by path, with the cap stated
- AND IT MUST produce the list with one directory listing per level, not a repository search
- BUT it must NOT name zero convention files for a target whose folder holds a `CLAUDE.md` — that is the contract's reference falsifier (KZ-006)

#### Scenario: Leader asserts an infrastructure fact (`changes--cognito-email-otp-login.md`, KZ-OTP-3)

- GIVEN a brief that states what an environment variable means and which key a third-party response carries
- WHEN the brief is composed
- THEN each fact cites `file + section` (or the command that showed it) or carries `UNVERIFIED — confirm at source before relying on it`
- BUT it must NOT state either as bare fact

#### Scenario: Leader adds a test item the task does not list (`bilateral--center-overview-tab.md`, KZ-COV-2)

- GIVEN a Leader who wants an extra test written for a case the task text does not name
- WHEN the item enters the brief
- THEN it is tagged `[advisory-grade]`, the Reviewer reports on it only in `ADVISORY`, and a round-2 FAIL on it cannot occur
- AND IT MUST still respect (a): an advisory-grade item is a note, not new scope; a Leader who needs the scope raises it to the user

#### Scenario: Task carries the four verification fields

- GIVEN a `tasks.md` written under `changes/gate-falsifiability` with `Falsifier`, `Red run`, `Disqualifier`, `Consumers` per task
- WHEN the Step 2.2 brief is composed
- THEN the verification command, `Falsifier`, `Red run`, and `Consumers` are copied next to each other, with the instruction to run every suite `Consumers` names and to report the assertion the red failed on
- BUT for a task without those fields the brief says so in one line and copies the command alone

### FR-2: Execute-time spec edits reach the Reviewer as checks

When the Leader edits `requirements.md` or `design.md` during execution **without changing an approved requirement's meaning** (a clarification; anything more is a Pivot under the existing protocol), the Leader SHALL record the edit (file, section, one-line reason) in the current task's `execution.md` entry at the moment of the edit, and the Step 2.3 Reviewer brief SHALL list each edited section since the previous PASS as an explicit conformance check. The **next task's** Reviewer brief SHALL carry the same sections once more; after that they drop. Pivot Protocol step 4 (re-issue dispatched briefs after a Pivot — KZ-changes--model-routing-cost-rebaseline-2) is unchanged and cited; this requirement covers the smaller edit that protocol does not.

#### Scenario: Design clarification written at spawn time (`bilateral--center-overview-tab.md`, KZ-COV-2)

- GIVEN the Leader clarifies a `design.md` section while composing T-5's brief
- WHEN T-5's Reviewer is spawned
- THEN its brief lists that section as a named check ("conformance to `design.md#<section>` as amended 2026-09-18"), and T-6's Reviewer brief lists it once more
- AND IT MUST record the edit in T-5's `execution.md` entry under decisions made, so `/akili-resume` and the archive can see the spec moved during execution
- BUT the edit must NOT change what an approved requirement means — that is a Pivot, and the loop stops

### FR-3: The Reviewer report has a fixed order and a ceiling; the diff is delivered by size

The Reviewer's returned message SHALL begin with the `STATUS:` line — nothing before it — followed by the summary, the issues list, then `ADVISORY`; the whole message SHALL stay under ~600 words. Issues beyond the ceiling SHALL go to a file the Leader reads by path, with the count on the summary line (`ISSUES: 5 — 3 inline, 2 in <path>`); the Structured Feedback rule then relays report **and** file verbatim. Step 2.3 SHALL state this contract and `reviewer.md` SHALL restate it where its three output options are defined. Diff delivery: a diff of **≤ 300 lines** stays inline; above that the Leader writes the diff it extracted to a file **outside the working tree** (the session scratchpad) and the brief carries the path with the instruction to `Read` it. The wrapper-restricted Reviewer keeps `Read` (only `Bash` is withheld), so the file is readable. **A non-host Reviewer** (cross-host dispatch) keeps the inline diff at any size — the same standing exception Step 2.2 already names for non-host workers.

#### Scenario: Long FAIL report under the harness cap (`bugfix--kpi-count-reconciliation.md`, KZ-KCR-1)

- GIVEN a FAIL with three issues whose verbatim Violated Rules run past 600 words
- WHEN the Reviewer returns
- THEN the first line is `STATUS: FAIL`, the summary names the count and the overflow path, the first issues are inline, and the rest are in the file
- AND IT MUST reach the Leader with the verdict intact even if the harness truncates the tail
- BUT the Leader must NOT paraphrase the file into the next Implementer brief — it relays it verbatim with the report

#### Scenario: 400-line diff (`bilateral--center-overview-tab.md`, "every round > 300 lines")

- GIVEN a diff of 400 lines for a host Reviewer with `Read`
- WHEN the Step 2.3 brief is composed
- THEN the Leader writes the extracted diff to a scratchpad file and the brief names the path
- AND IT MUST write the file from the same `git diff` it extracted — the Reviewer has no `Bash` and never regenerates it
- BUT the file must NOT live inside the working tree, where it would appear in `git status`, in a later diff, or in a HALT pathspec

#### Scenario: Non-host Reviewer

- GIVEN a Reviewer dispatched to another host that cannot resolve project paths
- WHEN the diff exceeds 300 lines
- THEN the diff stays inline regardless of size, and the brief says why in one line

### FR-4: Runtime events are first-class; none consumes an attempt; each role has a fixed recovery ladder

The Step 2 preamble table SHALL name the event vocabulary — **spawn failure**, **provider-limit death**, **pane / terminal timeout**, **idle-without-report** (pointer to `leader.md`, never restated) — and SHALL state the accounting rule once: *an attempt is consumed by a Reviewer `FAIL` or an Implementer-reported verification failure, and by nothing else.* Runtime death, pane timeout, idle-without-report, a Pivot-Detection stop, and a project-stack outage (handled by Step 2.1's environment pre-check and `leader.md` *Deferring a check*) consume none. Step 2.4 *Maximum Retries* SHALL carry the same rule in one clause; the Budget Tripwire's *review rounds* count Reviewer verdicts only. The per-role ladders:

| Role | Ladder (climbed in order; each rung recorded per attempt) |
|---|---|
| Implementer | **1** retry once immediately (spawn failure, pane timeout) — for a provider-limit death, first **probe the tree** for partial edits and record them · **2** retry-after-N (N = 3 min, one retry, background wait, announced) · **3** resume-by-message when the worker's context survives (message the worker; the contracted report is the terminating act; verify delivery per `leader.md`) · **4** fresh worker audits the partial diff and continues (brief carries the partial diff as the starting state) · **5** the existing Leader-inline ask — a user stop; the no-code rule stands |
| Reviewer | **1** retry once · **2** retry-after-N · **3** a different model (`/model` or the registry's cross-host dispatch) · **4** waiver — **is** a `REVIEW_WAIVED` record (FR-5), a user stop. **Never inline without the record** |
| Tester | Unchanged: the `/akili-test` Deployment Rule already defines the inline path — use it and record it |

Terminal branches of each event (KZ-004): a spawn failure has no partial work and starts at rung 1; a provider-limit death may or may not leave context (rung 3 if it does, rung 4 if it does not); a pane timeout usually clears within minutes (rungs 1–2); idle-without-report is handled entirely by `leader.md`'s poke-once / replace-on-second-idle protocol (KZ-003) and enters this ladder only at "replace", as a fresh spawn.

#### Scenario: Implementer killed by a rate limit mid-task, context intact (`changes--reporting-favorite-indicators.md`)

- GIVEN an Implementer killed by an HTTP 429 mid-T-2, with files already edited and its context still addressable
- WHEN the Leader handles the event
- THEN it probes the tree and records the partial edits, messages the worker asking for the contracted report as its terminating act, and the worker finishes with no work redone
- AND IT MUST record `runtime event: provider-limit death → resume-by-message` on that attempt, with the attempt counter unchanged
- BUT it must NOT count the death as a FAIL, spawn a fresh worker while the old one can answer, or ask for Leader-inline before rungs 1–4

#### Scenario: Seven pane timeouts in one run (`changes--indicator-reported-results.md`)

- GIVEN a Reviewer spawn failing on a pane timeout
- WHEN the Leader climbs the ladder
- THEN it retries once, then waits N = 3 minutes in the background (announced), then retries once more — the runtime recovered on its own in the field
- BUT it must NOT put the Leader-inline or waiver ask to the user before the ladder's earlier rungs are exhausted and recorded

#### Scenario: Spawn dies before its first tool call (`bugfix--kpi-count-reconciliation.md`)

- GIVEN an Implementer spawn that produced nothing
- WHEN the Leader retries on a different model and it completes
- THEN the attempt counter reads 1, and the attempt entry records `runtime event: spawn failure → retry (model swapped)`

#### Scenario: Idle-without-report

- GIVEN a worker whose turn ended without its report
- WHEN the Leader reads the runtime table
- THEN the row sends it to `leader.md`'s idle protocol by name (artifact check → poke once → replace on second idle) and says nothing more
- BUT the table must NOT restate the poke mechanics (KZ-005, KZ-001 — `leader.md` already defines them)

### FR-5: `REVIEW_WAIVED` is a mandatory record; a task is closable only with a PASS or a waiver

The Execution Log Format SHALL define `## REVIEW_WAIVED: <Task ID>` with: `flag` ∈ {`inline`, `same-model`, `degraded-pair`}; cause (the events and rungs exhausted); who approved (the user — never the Leader alone); the verification that stood in (command, exit status, who ran it); the models involved. The flags name **which property of the gate was lost**: `inline` — no independent context (the Leader audited work it supervised); `same-model` — an independent context on the Implementer's model; `degraded-pair` — an independent context on a different model **below the registry's tier or outside it** (a PASS was issued and stands; the record accompanies it so the metric is honest). The task entry's Reviewer field SHALL read `WAIVED (<flag>)` for `inline` / `same-model` and `PASS (degraded-pair: <models>)` for the third. The record is written **by the Leader, at close time, before `[x]`** — the same evidence-before-checkbox order Step 3 enforces for PASS. **A task with neither a PASS nor a `REVIEW_WAIVED` in `execution.md` is not closable.** Under `pre-approved`, the waiver decision is a stop, never auto-passed (open question 1). Step 5's `/goal` canonical condition SHALL read "matching PASS **or `REVIEW_WAIVED`** evidence". Step 2.3 item 0 (a `Not Done / Assumptions` gap blocks `[x]` even on PASS) applies to a waiver identically.

#### Scenario: Three tasks close after a quota block with no Reviewer (`changes--emerging-result-cta-placement.md`)

- GIVEN T-3..T-5 ran with no Reviewer after the Reviewer ladder was exhausted, and the user approved closing them
- WHEN each closes
- THEN `execution.md` holds `## REVIEW_WAIVED: T-3` (…T-4, T-5) with `flag: inline`, the cause, the user's approval, and the verification that stood in; the entries' Reviewer fields read `WAIVED (inline)`
- AND IT MUST be written before each `[x]`
- BUT the metrics row must NOT be able to read "Reviewer FAIL rework attempts: 0" as an exercised gate — FR-8 makes the readers count the waivers

#### Scenario: Same-model waiver (`changes--cognito-email-otp-login.md`)

- GIVEN a different model and cross-host dispatch were tried and the only model left equals the Implementer's
- WHEN the user approves the waiver
- THEN the record carries `flag: same-model` and the models by name

#### Scenario: Degraded pair (`changes--mass-reporting-flow.md`)

- GIVEN the Reviewer ran on a different model than the Implementer but below the registry's T3 tier
- WHEN the task closes on its PASS
- THEN the entry reads `PASS (degraded-pair: <impl>/<rev>)` and a `## REVIEW_WAIVED` block with `flag: degraded-pair` accompanies it
- AND IT MUST keep the PASS as the closing evidence — `author ≠ auditor` held

#### Scenario: Waiver asked under `pre-approved`

- GIVEN `Approval Mode: pre-approved` and the Reviewer ladder exhausted
- WHEN the Leader reaches rung 4
- THEN it stops for the user; the `/goal` condition's "a question is pending for the user" clause holds the loop
- BUT it must NOT log `auto-approved (pre-approved mode)` on a waiver

#### Scenario: Old `execution.md` without the record

- GIVEN a spec executed before this change
- WHEN any reader scans it
- THEN the absence of `## REVIEW_WAIVED` blocks reads as "no waiver recorded" — no migration, no inference (NFR-3)

### FR-6: HALT rollback branches on tree state and scopes to the halted task's pathspec

Step 4 item 1 SHALL branch on the working tree at HALT (KZ-004 — three named branches, none a fall-through): **clean** (only the halted task's changes are uncommitted) → today's `git restore .` + `git clean -fd`; **holds other PASSed, uncommitted work** → restore scoped to the halted task's pathspec (explicit file paths from its attempt entries' *files changed* lines; tracked files via `git restore -- <paths>`, listed untracked files via `git clean -f -- <paths>`; never a directory glob) and the `## HALT` block names the pathspec used; **holds unattributed changes** (paths no task entry accounts for — another session, the user) → those paths are never restored; the HALT block lists them and the Leader escalates. After any restore the Leader runs `git status --porcelain` and reports what remains. **Residual, stated in the command:** a file the Implementer changed and did not report is outside the pathspec — the same hole the log format already has, now visible in the post-restore status.

#### Scenario: HALT with nine PASSed tasks uncommitted (`changes--unsaved-changes-alert.md`, KZ-UCA-2)

- GIVEN a no-auto-commit run where nine tasks PASSed uncommitted and T-9 HALTs at three attempts
- WHEN Step 4 runs
- THEN only T-9's files (from its three attempt entries) are restored; the nine tasks' files are untouched; the HALT block names the pathspec and the post-restore `git status`
- AND IT MUST derive the pathspec from the attempt entries, not from `git status` (which cannot tell T-9's files from T-1's)
- BUT it must NOT run `git restore .` or `git clean -fd` on that tree

#### Scenario: Clean tree

- GIVEN per-task commits and a tree holding only the halted task's changes
- WHEN Step 4 runs
- THEN the blanket restore runs exactly as today

#### Scenario: Unattributed changes present

- GIVEN a tree with the halted task's files, other PASSed work, and two files no entry names
- WHEN Step 4 runs
- THEN the pathspec restore runs, the two files are listed under "unattributed — not restored", and the user is asked
- BUT it must NOT delete or restore the two files

### FR-7: Reviewer audit checklist — red run and mutation trace (hand-off)

`reviewer.md`'s Audit Checklist SHALL gain one item: *verify the recorded red run failed on the behavioral assertion (not on setup, an intercept, a timeout, or a mock that never reaches the timing under test), and trace the named mutation through the fixture — a test named after a mutation is not evidence it exercises it.* When the task carries no `Red run` field or it reads `n/a (no test gate)`, the item is skipped and the report says so (KZ-004).

#### Scenario: Fixture where pre- and post-sets coincide (`changes--reporting-favorite-indicators.md`, KZ-3)

- GIVEN a test named after a pipeline-order mutation whose fixture pins every row, so both orders yield identical output
- WHEN the Reviewer applies the item
- THEN it traces the mutation, finds the assertion inert, and FAILs with the remediation "add one row the mutation treats differently"
- BUT it must NOT accept the test's name as evidence

#### Scenario: Correct and naive formulas numerically identical (`changes--toc-center-guard.md`, KZ-2)

- GIVEN a counting test whose single-item fixture makes the correct formula and the naive one agree
- WHEN the Reviewer applies the item
- THEN it FAILs with the remediation to use values on which the two diverge

### FR-8: Every reader of `execution.md` names its `REVIEW_WAIVED` branch

Each existing consumer of `execution.md` verdicts SHALL state, in one clause, where a `## REVIEW_WAIVED` block lands (KZ-004; KZ-changes--kaizen-loop-closure-1): `/akili-resume` Step 1 — a `REVIEW_WAIVED` block is a completed task's closing record, reported in *Last Action* with its flag, never a *Blocked* item; the kaizen skill's Measure table — a new signal row *Tasks closed under `REVIEW_WAIVED` (by flag)* from `execution.md` `## REVIEW_WAIVED` blocks, with `inline` and `same-model` read as "no exercised gate" and `degraded-pair` as an exercised gate with a note; the clean-run predicate — a run with any `inline` / `same-model` waiver is **not** clean; the Metrics example gains the row; `/akili-archive` Step 4.1 — the signal list gains the same phrase. Nothing else in those files changes (NFR-1).

#### Scenario: Kaizen Measure on a waived run

- GIVEN `execution.md` with 0 Reviewer FAILs and three `## REVIEW_WAIVED` blocks (`inline`)
- WHEN the retrospective measures
- THEN the Metrics table reads `Reviewer FAIL rework attempts: 0` **and** `Tasks closed under REVIEW_WAIVED: 3 (inline ×3)`, and the run is not a clean run
- BUT it must NOT write a one-line clean-run entry

#### Scenario: `/akili-resume` after a waived close

- GIVEN the most recent `execution.md` entry is `## REVIEW_WAIVED: T-4`
- WHEN the dashboard renders
- THEN *Last Action* reads "T-4 closed — REVIEW_WAIVED (inline)" and *Blocked* is unaffected
- BUT `/akili-resume` must NOT write any file — its read-only contract is untouched

### FR-9: Documentation coherence sweep

`docs/commands/akili-execute.md` SHALL mirror the four Step changes and the log format at summary level (per-task loop, Reviewer output contract, Outputs' final-status vocabulary, Guardrails). `docs/flow.md` and `README.md` SHALL change **only where a sentence turns false** — the FR-9 grep in §8 decides; today's candidates are the loop diagrams' "if PASS → …" lines (hold: a waiver is not PASS and the diagram shows the happy path) and `README.md`'s Git dependency cell naming "HALT rollback" (holds — the rollback still exists). `CHANGELOG.md` `Unreleased` SHALL carry the entry with the classification the user decides. The "every mirror updated" claim is proven by grep, never asserted (KZ-002). Before the Reviewer is spawned on any rules-document task, the Implementer's file is grepped for the superseded phrasing and its paraphrases (KZ-changes--kaizen-loop-closure-2 — `leader.md` item 4's pre-review restatement sweep).

#### Scenario: Post-sweep grep

- GIVEN the sweep is complete
- WHEN the §8 phrase greps run
- THEN no hit still reads "always inline, the one payload that can never become a pointer", "Run `git restore .` and `git clean -fd`" as an unconditional instruction, or "matching PASS evidence" without the waiver alternative in the `/goal` condition; every sanctioned hit is enumerated in the task's done criteria
- BUT no in-file restatement of a superseded rule survives in `akili-execute.md`, `leader.md`, or `reviewer.md`

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | **Additive and bounded outside the owned files.** `/akili-resume`, the kaizen skill, and `/akili-archive` change by one clause each (FR-8); their diffs show no other hunk. `/akili-specify`, `tdd`, `/akili-constitution`, `implementer.md`, `/akili-test` have **zero** diff (NFR-7). |
| NFR-2 | **Host-neutral.** Every recipe names the mechanism by class (the harness's message primitive, a background wait, a file the worker can read) and the host primitive only in a parenthetical (`SendMessage`, `/model`). Where a host has no message primitive, resume-by-message degrades to the fresh-worker rung with no other change. |
| NFR-3 | **Backward compatible, no migration.** Old `execution.md` files read as "no waiver recorded"; a `tasks.md` without the four verification fields yields a brief that says so; a clean tree at HALT rolls back exactly as today. |
| NFR-4 | **Rules by class.** Every rule is phrased by defect class or mechanism; product, framework, and file names from the corpus appear only inside parentheticals. |
| NFR-5 | **No installer, hook, or CI change.** `REVIEW_WAIVED` is text; the Step 8F hook is neither extended nor circumvented (the known first-task interaction is recorded in §4). |
| NFR-6 | **The brief step stays bounded.** The convention-file lookup is one directory listing per level plus one index read; the Delegation Thresholds route anything deeper to a scout; the Step 2.2 block adds no research obligation beyond it. |
| NFR-7 | **Parallel safety.** No edit to any file `changes/gate-falsifiability` owns; the two hand-off lines are recorded in Document Control; `changes/scoped-constitution-reads` is merged serially with an FR-9 re-grep. |
| NFR-8 | **The invariants this spec cites stay verbatim.** The 3-attempt ceiling, `FATAL_FAIL`, Pivot Protocol steps 1–4, Delegation Ceiling, `leader.md` idle-without-report protocol, and `author ≠ auditor` sentences show no diff. |

## 8. Defect Classes → Gates

| Defect class this spec can produce | Gate that catches it | Falsifying input |
|---|---|---|
| A surviving unconditional rollback or inline-diff sentence | `grep -rnE "always inline, the one payload|Run \`git restore \.\` and \`git clean -fd\`|git restore \. and git clean" .claude/commands .claude/templates docs/commands docs/flow.md README.md --exclude-dir=worktrees` — zero hits outside sanctioned history | The pre-change Step 2.3 bullet and Step 4 item 1 — both hit today |
| `/goal` condition unreachable for a waived task | `grep -n "matching PASS" .claude/commands/akili-execute.md docs/flow.md` — every hit reads "PASS or \`REVIEW_WAIVED\`" | The pre-change Step 5 condition |
| A consumer that falls through on `## REVIEW_WAIVED` (KZ-004) | Manual enumeration: read `/akili-resume` Step 1, kaizen Measure table + clean-run sentence, `/akili-archive` 4.1 — each names the branch | The current kaizen clean-run sentence ("zero rework, no pivots…") — reads a waived run as clean today |
| Attempt accounting stated as an example, not a rule | `grep -n "consumed by a Reviewer" .claude/commands/akili-execute.md .claude/templates/leader.md` — ≥ 1 hit in the runtime table and one in 2.4 / item 4, same sentence | A table that lists events but never says what an attempt is |
| Ladder rung missing or reordered per role | Parity read of the runtime table against FR-4's table — five Implementer rungs, four Reviewer rungs, in order | A Reviewer row whose last rung is "inline" |
| Idle-without-report restated instead of cited (KZ-005, KZ-001) | `grep -nc "poke" .claude/commands/akili-execute.md` — 0 outside a pointer phrase; the mechanics live in `leader.md` only | A table row that says "poke once, then replace" |
| A hand-off line drifting from `changes/gate-falsifiability`'s wording | Byte comparison of the two lines against that spec's design §7 consumer-walk rows (read at execute) | A checklist item that says "check the test exists" |
| Advisory-grade laundering — tag stated without the narrow-never-widen half beside it | Read Step 2.2 (d): both halves in the same paragraph | A (d) that only says "tag Leader additions advisory-grade" |
| Framework or product name outside a parenthetical (NFR-4) | `grep -nE "Angular|Jest|Cypress|Orca|tmux|onecgiar|PRMS" .claude/commands/akili-execute.md .claude/templates/leader.md .claude/templates/reviewer.md` — every hit inside `(...)` | A rule sentence naming a product |
| Edit to a file another spec owns (NFR-7) | `git diff --stat -- .claude/commands/akili-specify.md .claude/skills/tdd .claude/commands/akili-constitution.md .claude/templates/implementer.md .claude/commands/akili-test.md` — empty | Any hunk |
| Invariant sentence rewritten (NFR-8) | `git diff -U0` of the named sections shows no `-` line containing "3 rework attempts", "FATAL_FAIL", "Poke once, then replace", "author ≠ auditor" | A reflowed ceiling sentence |
| Mirror contradiction | Per-surface parity read: command vs `docs/commands/akili-execute.md` for the four Steps and the log format | A mirror still describing the blanket rollback |
| Packaging regression | `npm run verify:cli && npm run pack:dry-run && git diff --check` | A renamed packaged file |
| Prose a literal agent cannot execute (ambiguity between two shipped sentences) | **No automated check** — substituted by the closing fixture walkthrough (three cases: HALT on a dirty tree, spawn failure mid-task, Reviewer waiver) read as a literal agent, `INCONCLUSIVE` reportable and a FAIL for the closing task; recorded as the accepted residual risk beyond that | — (accepted risk) |

## 9. Requirement ID Index

| ID | Name | Gate |
|---|---|---|
| FR-1 | Brief contract (a–e) | read of Step 2.2 block + laundering check + walkthrough (widened-brief case) |
| FR-2 | Execute-time edit carry | read of Step 2.3 + log format decisions field |
| FR-3 | Report contract + diff delivery | inline-diff grep + parity read of `reviewer.md` options |
| FR-4 | Runtime events, attempt rule, ladders | accounting grep + ladder parity read + poke grep + walkthrough (spawn-failure case) |
| FR-5 | `REVIEW_WAIVED` record and closability | `/goal` grep + log-format read + walkthrough (waiver case) |
| FR-6 | Rollback by tree state | rollback grep + three-branch read + walkthrough (dirty-tree case) |
| FR-7 | Audit checklist hand-off | byte comparison with the source spec's line |
| FR-8 | Consumers name their branch | enumeration check (KZ-004) + diff-stat bound |
| FR-9 | Coherence sweep | phrase greps (KZ-002) + parity read |
| NFR-1..8 | Bounded / neutral / compat / by-class / no-hook / bounded brief / parallel-safe / invariants | diff-stat + greps above |
