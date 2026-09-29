# Requirements: Re-baseline AKILI for Claude Opus 5.5

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/opus-5-5-rebaseline` |
| Depth | **Standard** (proposal hint). Re-checked against the design at Step 2.4 |
| Type | Change |
| Approval Mode | `gated`, inherited from `proposal.md` |
| Status | **Approved** (user, 2026-09-29) |
| Date | 2026-09-29 |
| Source | `proposal.md` (approved 2026-09-29, Option A) and the vendor page [Prompting Claude Opus 5.5](https://platform.claude.com/docs/es/build-with-claude/prompt-engineering/prompting-claude-opus-5-5), fetched 2026-09-29 |
| Format precedent | `docs/specs/archive/2026-09-20-changes--agents-md-canonical/requirements.md`. This repo has **no** `docs/specs/general-setup/` (`ls` → `No such file or directory`, run 2026-09-29 at `31b6d31`), and no `docs/prd.md`, `docs/ux-ui/design.md` or `docs/trd/trd.md` |
| Adjacent specs | `changes/scoped-constitution-reads` (proposal only) also names `implementer.md`/`tester.md`. See NFR-3 |

## 2. Executive Summary

The `opus` alias, and with it every default AKILI Leader, Reviewer and specify session, now resolves to Opus 5.5. AKILI's Opus guidance was written for the previous generation and now points the wrong way: it says to **start high and iterate down**, while the vendor says Opus 5.5 starts at `medium` and that `medium` already matches Opus 5 at `high`.

The same vendor page describes a failure AKILI's workers are exposed to: on long unattended work, the model ends a turn with a progress report instead of the next action. AKILI already recovers *after* a worker stops short (the idle-without-report protocol, and `Not Done` handling). This spec adds the *prevention* half and bounds the recovery half.

**Proposal alignment:** aligned with the approved proposal, with one narrowing found during exploration. The Leader-side continuation already exists in `/akili-execute` Step 2.3 item 0 (*"treat it as scope still owed — re-spawn for the remainder, or mark `[~]` and escalate"*, `.claude/commands/akili-execute.md:223`). FR-5 therefore **bounds and splits** an existing rule; it does not add a new loop state. That resolves proposal OQ3.

## 3. Glossary

| Term | Meaning here |
|---|---|
| **Premature stop** | A worker ends its turn while owed work remains and nothing blocks it. The four shapes the vendor names: (1) a summary that announces the next step and has no tool call; (2) an offer to continue "unless you prefer otherwise"; (3) a list of decisions none of which blocks the rest; (4) stopping because the turn was long or a milestone landed |
| **Legitimate stop** | A stop the Leader *does* want: nothing can move without the user or Leader; a blocker that is deliberately protected; a destructive or irreversible action awaiting confirmation; a Pivot-Detection condition; the task being complete |
| **Continuation** | The Leader's re-spawn of a worker for the items in its `Not Done / Assumptions` field |
| **Vendor-measured** | A figure or starting point published by the model vendor, not reproduced on an AKILI spec |
| **Time signal** | A line such as `elapsed 340s / 1200s` that the **harness** appends to each message returned to the model |

## 4. System Context & Scope

**Current behavior (each claim cited as run at `31b6d31`, or marked):**

| Claim | Evidence |
|---|---|
| The Opus guidance says to start high | `docs/model-routing.md:401`: *"On Opus the nuance inverts: start high and iterate **down**"* |
| The vendor starting points cited as current are Opus 5's | `docs/model-routing.md:363`: *"for Claude Opus 5, the published starting points are **`xhigh` for coding and agentic work, `high` elsewhere**"* |
| The doc asserts that the alias resolves to Opus 5 | `docs/model-routing.md:392`: *"(the current `opus` alias resolves to Opus 5)"* |
| The role-default table is cross-host and is mirrored once | `docs/model-routing.md:352–356`; mirror at `.claude/commands/akili-constitution.md:554` |
| Workers are told not to *narrow* scope or claim false completion, but the premature-stop shapes are not named | `.claude/templates/implementer.md:22–24` (*"Don't narrow either"*, *"Report completion only when it is actually complete"*); `grep -niE "announc|unless you|milestone|offer to" .claude/templates/implementer.md .claude/templates/tester.md` → 0 hits |
| The Leader already treats `Not Done` as owed scope, with no bound and no blocker split | `.claude/commands/akili-execute.md:223` |
| No time signal exists in the harness surfaces | `grep -rniE "elapsed|time budget" .claude docs/model-routing.md` → **2** hits (run 2026-09-29), both in `.claude/skills/software-architect/references/nfr-scenarios.md` (`:23`, `:73`) as NFR measurement examples, not agent time signals. Zero in commands, templates or `model-routing.md` |
| No `docs/commands/` mirror restates item 0 | `grep -n "Not Done\|re-spawn for the remainder" docs/commands/akili-execute.md` → 0 hits |

**In scope:** `docs/model-routing.md`, `.claude/templates/implementer.md`, `.claude/templates/tester.md`, `.claude/commands/akili-execute.md` (Step 2.3 item 0 and the Step 5 `/goal` `<N>` formula), `CHANGELOG.md`, and any `docs/commands/` mirror that restates an edited sentence (settled at design).

**Out of scope:** the cross-host role-default values, `reviewer.md`, `leader.md`'s attended behavior, `bin/akili.js`, the Codex/Antigravity/OpenCode columns, the Fable pin, and all sibling-chunk-2 surfaces (`/akili-propose`, `/akili-specify`, `frontend-design`).

## 5. Stakeholders / Personas

| Persona | Stake |
|---|---|
| Project maintainer running `/akili-execute` on the `opus` alias | Pays for over-effort today; gets fewer stalled unattended runs |
| Implementer / Tester subagent | Receives the anti-stop rule on every spawn |
| Leader under `pre-approved` | Gets a bounded continuation rule |
| AKILI maintainer (dogfooding) | Keeps `model-routing.md` truthful per generation (`AGENTS.md` → Model Routing: *"each release refreshes the default registry"*) |

## 6. Functional Requirements

### FR-1: Opus effort guidance matches Opus 5.5

`docs/model-routing.md` → *Opus specifics* SHALL state, for the current `opus` generation:

- the starting effort is `medium`;
- `xhigh` and `max` are reserved for work where a quality gain has been **measured**;
- to get less thinking, **lower effort first**, before adding prompt instructions;
- effort level names do not map to the same amount of thinking across generations, so a level carried over from a previous generation is not a calibration;
- `max_tokens` headroom (thinking counts against it).

Each vendor figure SHALL carry the source URL and the fetch date. The section SHALL carry an **AKILI-measured status line** that reads `none yet` until a sweep on a real AKILI spec is recorded.

#### Scenario: A Leader sets a worker's effort on the `opus` alias

- GIVEN a Leader reading the *Effort dial* on a project whose `opus` alias is Opus 5.5
- WHEN it looks for Opus-specific guidance
- THEN it finds `medium` as the starting point and a measured-gain condition for `xhigh`/`max`
- AND IT MUST see that the starting point is vendor-measured and not yet AKILI-measured
- BUT it must NOT find any sentence telling it to start high and iterate down

### FR-2: No sentence presents Opus 5 as the current generation

`docs/model-routing.md` SHALL NOT assert that the current `opus` alias resolves to Opus 5, and SHALL NOT present Opus 5's published starting points as current vendor guidance. Historical statements about Opus 5 that remain true (for example, that its release required zero registry edits) MAY stay, and SHALL read as history.

#### Scenario: A reader checks which generation the doc describes

- GIVEN the packaged `docs/model-routing.md`
- WHEN a reader greps it for `Opus 5` followed by anything other than `.`
- THEN every hit reads as past tense or as an explicit previous-generation reference
- AND IT MUST name Opus 5.5 wherever the current generation is meant
- BUT it must NOT delete the Opus 5 worked example, which is still true evidence for the alias-first rule

### FR-3: The cross-host role-default table keeps its values

The *Default effort by role* table (`docs/model-routing.md:352–356`) and its mirror (`akili-constitution.md:554`) SHALL keep their current values. The table SHALL gain a pointer to the family-specific notes (*Opus specifics*, *Sonnet specifics*) as the place where a family deviates.

#### Scenario: A Sonnet or Codex project reads the role table

- GIVEN a project whose T2/T3 run on Sonnet or a Codex model
- WHEN it reads the role-default table after this change
- THEN it sees the same values as before
- BUT it must NOT receive an Opus-derived `medium` default for T1/T3

### FR-4: Unattended worker personas name the premature stops

`.claude/templates/implementer.md` and `.claude/templates/tester.md` SHALL carry a rule that:

- names the four premature-stop shapes (Glossary);
- names the legitimate stops (Glossary), including the existing truthful partial with a named blocker (`implementer.md:24`) and, for the Tester, only outcomes its own contract defines (`PRODUCT_BUG`, a `FAIL` with `AUTOMATION_DEFERRED`, inner-loop exhaustion);
- tells the worker to put status notes in the same message as its next action and to keep going on whatever does not depend on the answer;
- states that it never overrides confirmation for risky or destructive actions.

`reviewer.md` SHALL NOT receive the rule (proposal OQ4).

#### Scenario: An Implementer finishes a milestone mid-task

- GIVEN an Implementer that has completed two of three scoped edits and nothing blocks the third
- WHEN it is tempted to end its turn with a progress summary announcing the third edit
- THEN the persona text names that shape as one to avoid
- AND IT MUST still allow a report ending in a truthful partial when the third edit **is** blocked, with the blocker named
- BUT it must NOT tell the worker to proceed past a destructive-action confirmation

#### Scenario: A Tester hits a product defect

- GIVEN a Tester whose suite exposes a genuine product defect
- WHEN it reports
- THEN reporting `PRODUCT_BUG` is a legitimate stop under the rule
- BUT it must NOT be read as a premature stop that requires continuing

### FR-5: The Leader's `Not Done` continuation is split by blocker and bounded

`/akili-execute` Step 2.3 item 0 SHALL distinguish:

| `Not Done` content | Leader action |
|---|---|
| Names a blocker | `[~]` and escalate, as today |
| Names no blocker, under `pre-approved` | Continue: re-spawn naming the owed items, at most **2** continuations per task, then `[~]` and escalate |
| Names no blocker, under `gated` | Unchanged from today |

A continuation SHALL NOT consume a rework attempt, SHALL NOT count as a Reviewer round for the Budget Tripwire, and SHALL be recorded in the task's `execution.md` entry. The Unattended Mode `/goal` turn bound (`akili-execute.md:322`) SHALL provision for up to 2 continuations per task.

Owed work is distinct from **assumptions-only** or **inconclusive-verification** content in the same field (`implementer.md:33,44`). A field with no owed item SHALL never trigger a continuation. When the field mixes both, precedence applies: any named blocker → `[~]`; otherwise any unblocked owed item → continuation-eligible, and the continuation names only the owed items.

#### Scenario: A report mixes an owed item with an assumption

- GIVEN a `pre-approved` run where `Not Done / Assumptions` lists one unblocked owed edit and one judgment call
- WHEN the Leader applies item 0
- THEN it continues the worker, naming only the owed edit
- AND IT MUST carry the judgment call into `execution.md` verbatim
- BUT it must NOT re-send the judgment call as work

#### Scenario: An unattended worker stops short twice

- GIVEN a `pre-approved` run where an Implementer reports `Not Done` with owed items and no blocker
- WHEN the Leader has already continued it twice for the same task
- THEN the third such report marks the task `[~]` and escalates
- AND IT MUST record each continuation in `execution.md`
- BUT it must NOT decrement the 3-attempt rework counter for any continuation

#### Scenario: A gated run is unchanged

- GIVEN a `gated` run
- WHEN an Implementer reports `Not Done` with no blocker
- THEN the Leader's options are exactly those of `akili-execute.md:223` before this change

### FR-6: Time signals are documented as a harness capability

`docs/model-routing.md` SHALL describe time-budget signals as an optional capability for harnesses that can append an `elapsed / budget` line to every message returned to the model. It SHALL state that:

- the line is harness-injected and a prompt cannot produce it;
- it SHALL NOT be used on the Reviewer, because under time pressure the model may search and verify less;
- the budget is advisory, so a hard stop needs the harness's own timeout.

No persona or command SHALL be changed to emit or consume time signals.

#### Scenario: A maintainer looks for a way to make parallel Testers finish sooner

- GIVEN a maintainer with a custom harness
- WHEN they read the time-signal note
- THEN they learn the line format, the advisory nature and the Reviewer exclusion
- BUT the packaged personas must NOT reference time signals

### FR-7: Release notes

`CHANGELOG.md` → `Unreleased` SHALL describe the change in user terms.

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | **Bounded surfaces.** Zero diff outside the In-scope list in §4. `bin/akili.js`, `scripts/`, `package.json`, `reviewer.md`, `leader.md` and the role-default values are frozen |
| NFR-2 | **Provenance.** Every vendor figure carries the source URL and `2026-09-29`. No figure is presented as AKILI-measured |
| NFR-3 | **Adjacent spec.** Edits to `implementer.md`/`tester.md` are additions inside existing sections, so `changes/scoped-constitution-reads` (which targets their read-order sentence) can land before or after without a textual conflict. Settled at design against that proposal's named sites |
| NFR-4 | **No contradiction with neighbours** (KZ-changes--leader-brief-contract-1). Every paragraph that receives an insertion is read whole, and the Reviewer walks it with its neighbours |
| NFR-5 | **Restatement sweep keyed on obligation** (KZ-changes--kaizen-loop-closure-2, KZ-changes--agents-md-canonical-1). Sweeps target the obligation ("start high", "resolves to Opus 5", "re-spawn for the remainder"), not only the literal strings |

## 8. Defect Classes → Gates

| Defect class this spec can produce | Gate | Falsifying input |
|---|---|---|
| The stale "start high" obligation survives in a paraphrase | `grep -rniE 'start(s)? high|iterate \**down|sweep down' .claude docs/model-routing.md docs/commands README.md` → 0 | Any hit outside history-labelled text |
| A sentence still presents Opus 5 as current | `grep -nE 'Opus 5([^.0-9]\|$)' docs/model-routing.md`, with each hit read and classed as history | A present-tense hit |
| The role-default values changed | `git diff` on `model-routing.md:352–356` and `akili-constitution.md:554` shows no value change | A changed cell |
| The anti-stop rule contradicts the truthful-partial rule or the Tester outcomes | **No automated check.** Substitute: a Reviewer term-by-term walk of the inserted paragraph together with `implementer.md:24` and the tester output contract | — |
| The rule leaks into the Reviewer or the attended Leader | `grep -c` of the rule's anchor phrase in `reviewer.md` and `leader.md` → 0 | 1 or more |
| The continuation bound is ambiguous about attempts or budget rounds | A read of the amended item 0 against the Accounting rule (`akili-execute.md` *Runtime-failure fallback*) and the Budget Tripwire | A sentence readable two ways |
| Whether the rule actually reduces premature stops | **Unmeasurable in this repo.** An accepted risk: the rule is justified by vendor guidance. The 6 idle-without-report logs are a different class (proposal Evidence row) | — |
| Package breakage | `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` | Any failure |

## 9. Requirement ID Index

| ID | Name | Gate |
|---|---|---|
| FR-1 | Opus guidance matches 5.5 | Obligation grep + read |
| FR-2 | No current-Opus-5 claims | `Opus 5` grep, each hit classed |
| FR-3 | Role table values kept | `git diff` on two sites |
| FR-4 | Worker anti-stop rule | Anchor grep + Reviewer walk |
| FR-5 | Bounded, split continuation | Read against the Accounting rule |
| FR-6 | Time-signal note | Read + anchor grep absent from personas |
| FR-7 | CHANGELOG | Read |
| NFR-1..5 | Bounded, provenance, adjacency, neighbours, sweep | `git diff --stat` + the greps above |
