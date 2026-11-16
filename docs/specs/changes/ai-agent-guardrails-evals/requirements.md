# Requirements: Guardrails and Evals for AI Agents

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/ai-agent-guardrails-evals` |
| Depth | Standard |
| Type | Change |
| Deliverable | software — this spec ships methodology text (two skill references, three command edits); it produces no agent |
| AI Agent | no — this spec ships no runtime agent. The row is recorded on purpose: the selector this spec adds must read `no` here |
| Approval Mode | gated |
| Status | Approved by JC 2026-11-14 (Phases 1–3) — ready for `/akili-execute` |
| Date | 2026-11-14 |
| Proposal | `proposal.md` — approved by JC 2026-11-14 (`43c3c97`); decisions Q1 brief-only source · Q2 binding `stack` → `conditional` · Q3 selector recorded by `/akili-specify` only · Q4 inconclusive eval run → BLOCKED |
| Format source | No `docs/specs/general-setup/` in this repo — shape mirrors `archive/2026-10-18-changes--video-deliverable-track` |
| Branch | `feat/ai-agent-guardrails-evals` (from `dev` at `c2339a1`) |

## 2. Executive Summary

Teach AKILI to **build** and **gate** AI agents, not only to describe them. `ai-agent-development` gains two references:

- a **guardrails** build guide (four layers plus voice specifics);
- an **evals** guide (offline, online, regression, LLM-as-judge, voice metrics).

Both use one running example: **an AI agent that answers phone calls**.

`/akili-specify` records a new `AI Agent: yes | no` row. When it reads `yes`, three commands enforce:

- specify requires Guardrails and Evals sections and an eval-gate task;
- test runs the evals as their own suite;
- validate FAILs without an eval gate or on any guardrail violation, and reads an inconclusive run as BLOCKED.

Non-agent specs see no change.

## 3. Glossary

| Term | Meaning |
|---|---|
| AI agent (for this selector) | Software the spec delivers in which a model decides, at runtime, what to say to a person or which action or tool call to take. A fixed script, a rules engine, and AKILI's own command prompts are not one |
| `AI Agent` row | Document Control row `AI Agent: yes \| no` in `requirements.md`. An absent row means `no` |
| Guardrail | A control that prevents an agent from doing or saying something prohibited. In a spec it is a `BUT it must NOT` clause with its own negative case set |
| Guardrail layer | Where a control sits: **input** (before the model sees it), **output** (before the person hears or sees it), **tool permission** (what the agent may call or change), **human handoff** (when a person takes over) |
| Eval | A scored run of the agent over a case set against expected values from approved scenarios |
| Offline eval | An eval run before release over fixed case sets |
| Online eval | Measurement of the live agent in production, by sampling or monitoring. AKILI records the plan; it never runs it |
| Regression eval | Re-running the offline sets after any change to the prompt, model, tools, guardrails or knowledge, compared with the recorded baseline |
| LLM-as-judge | A model that scores free-generated output against a pinned rubric |
| Eval gate | The `tasks.md` task that carries case sets, a verification command, thresholds, and a no-pass clause (`akili-spec-mapping.md` §3) |
| No-pass clause | The conditions that make a green eval run **inconclusive** |
| Phone agent | The running example: an agent that answers inbound calls, identifies the caller, helps with a bounded task, and escalates to a human agent |

## 4. System Context & Scope

Today (each claim verified at `43c3c97`; the claims the design depends on become rows in `design.md` → Premise Ledger):

- `ai-agent-development` maps a guardrail to a `BUT it must NOT` clause with a zero-violation set, and an eval to a task with a threshold and a no-pass clause. It does not explain how to build guardrails or design evals (`.claude/skills/ai-agent-development/references/akili-spec-mapping.md:17-38`, `:56-76`).
- The skill has no voice or call-agent content (`grep -rni "voice\|call agent\|consent" .claude/skills/ai-agent-development/` → 0 hits).
- The skill is `binding: stack` (`.claude/skills/ai-agent-development/SKILL.md:8`). Command text names it only as one optional pick in `/akili-specify`'s stack list (`.claude/commands/akili-specify.md:252`).
- `/akili-test` names four software suite types plus the video render suite (`.claude/commands/akili-test.md:116`, `:211`). There is no eval suite.
- `/akili-validate` has no agent eval gate. Its only "eval" hits are Impeccable detector rows (`grep -n "eval\|guardrail" .claude/commands/akili-validate.md` → `:140`, `:142`).
- The same three commands already branch on a Document Control selector, `Deliverable: video` (`akili-specify.md:66`, `akili-test.md:116`, `akili-validate.md:69`).

**In scope:**

- the two new references and the router and mapping edits;
- the `AI Agent` row and its branches in specify, test and validate;
- the binding change and every restatement of it;
- docs, CHANGELOG, tests.

**Out of scope:**

- running online evals;
- shipping an eval runner;
- legal advice;
- vendor configuration (Bedrock Guardrails, telephony, SDKs);
- `/akili-propose` and `/akili-execute` edits (Q3). `/akili-constitution` changes only by the DD-9 ripple in FR-7;
- persona template edits;
- any new command or skill;
- push, PR, release, publish.

## 5. Stakeholders / Personas

| Persona | Interest |
|---|---|
| Team building a phone agent (or any agent) with AKILI | Concrete guidance to build layered guardrails and evals, and a gate that cannot pass a spec without them |
| End caller of such an agent | The agent verifies identity before disclosing anything, asks for recording consent, never makes prohibited claims, and reaches a human when it should |
| AKILI user building non-agent software | Zero change in flow or output |
| Maintainer (JC) | Governance stays coherent after the binding change; sources are pinned and dated so the guides can be revalidated |

## 6. Functional Requirements

### FR-1: Guardrails build guide

`ai-agent-development` SHALL ship `references/guardrails.md`. It explains how to build layered guardrails for an agent and traces each layer through the phone agent.

#### Scenario: Four layers, each traced to the spec

- GIVEN a team specifying the phone agent
- WHEN it reads `references/guardrails.md`
- THEN the guide covers four layers, in order: **input** (prompt injection, PII), **output** (prohibited claims), **tool permissions and least privilege**, **human handoff**
- AND for each layer it states what the layer blocks, where it sits relative to the model, and what it becomes in the spec (a `BUT it must NOT` clause, a `design.md` decision row, a negative eval case set)
- AND each layer carries a phone-agent example
- AND IT MUST state that no single layer is sufficient on its own, and that model instructions alone are not a guardrail

#### Scenario: Voice and call-agent specifics

- GIVEN the phone agent receives a call
- WHEN the guide's voice section is read
- THEN it covers **caller identity verification** before any account-specific disclosure or action
- AND **recording consent** before recording or transcribing the call
- AND **escalation to a human agent**: triggers, what context passes to the human, and the fallback when no human is available
- BUT it must NOT state a rule of law, name a statute, or say which jurisdiction requires what. Consent and verification requirements are recorded as a decision owned by counsel or compliance
- AND IT MUST mark every voice threshold and practice not validated in a real build with `> Unvalidated:`

#### Scenario: Sources and maturity

- GIVEN any external factual claim in `references/guardrails.md`
- WHEN a reader checks it
- THEN it resolves to a pinned official-docs link in the file's `## Sources` block, with a verified date
- AND the file carries a `Last verified:` date
- BUT it must NOT cite a vendor document as if its feature were required. Vendor controls appear as examples, and the guide stays vendor-neutral
- AND IT MUST route vendor configuration through the skill's *Runtime Deferral* table instead of explaining it

### FR-2: Evals guide

`ai-agent-development` SHALL ship `references/evals.md`. It explains how to design and run evals across an agent's lifecycle and traces each kind through the phone agent.

#### Scenario: Lifecycle coverage

- GIVEN a team specifying the phone agent
- WHEN it reads `references/evals.md`
- THEN the guide covers:
  - **offline evals** before release;
  - **online evals** in production (sampling, metrics, alert threshold, owner);
  - **regression on every change** to prompt, model, tools, guardrails or knowledge, compared with a recorded baseline;
  - **LLM-as-judge with rubrics**.
- AND it covers **voice metrics**: latency (with the measured interval defined, for example end of caller speech to first agent audio, as percentiles), escalation rate, and task completion
- AND each kind carries a phone-agent example

#### Scenario: Expected values come from approved scenarios

- GIVEN a case set for any eval
- WHEN its expected values are produced
- THEN they derive from the approved `requirements.md` scenarios
- BUT it must NOT label a case set by running the agent and accepting what it produced
- AND IT MUST give guardrails their own negative case sets, with a tolerated violation count of zero

#### Scenario: Judge integrity

- GIVEN an eval scored by an LLM judge
- WHEN the guide describes it
- THEN the rubric and the judge model are pinned as artifacts
- AND the judge is calibrated against human-labeled cases before its scores gate anything
- AND IT MUST list a changed judge, rubric or prompt without re-scoring the baseline as a no-pass condition

#### Scenario: Sources and maturity

- GIVEN any external factual claim in `references/evals.md`
- WHEN a reader checks it
- THEN it resolves to a pinned official-docs link with a verified date, and the file carries a `Last verified:` date
- AND IT MUST mark illustrative thresholds, set sizes and voice targets with `> Unvalidated:`

### FR-3: Skill router and mapping

`ai-agent-development/SKILL.md` and `references/akili-spec-mapping.md` SHALL route to the new guides.

#### Scenario: Router rows

- GIVEN `SKILL.md` → *References — load per task*
- WHEN a task involves building guardrails or designing evals
- THEN one row routes to `references/guardrails.md` and one to `references/evals.md`
- AND the frontmatter declares `binding: conditional` and a bumped `version`

#### Scenario: No restatement

- GIVEN `references/akili-spec-mapping.md`
- WHEN it mentions building guardrails or eval lifecycle
- THEN it points to the new references
- BUT it must NOT restate their content. The triage worked example stays as it is

### FR-4: `/akili-specify` detects, records and enforces

`/akili-specify` SHALL decide whether the spec is for an AI agent, record it, and refuse to hand off an agent spec without guardrails and evals.

#### Scenario: Detected and recorded

- GIVEN a spec whose deliverable includes software in which a model decides at runtime what to say or which action to take
- WHEN `/akili-specify` writes `requirements.md`
- THEN Document Control records `AI Agent: yes`, and `no` otherwise
- AND when the proposal leaves it unclear, specify asks one question and does not guess
- AND IT MUST read an absent row as `no` everywhere

#### Scenario: Agent spec must carry guardrails and evals

- GIVEN `AI Agent: yes`
- WHEN specify writes the three documents
- THEN it loads `ai-agent-development` (`guardrails.md`, `evals.md`, `akili-spec-mapping.md`)
- AND `requirements.md` carries a **Guardrails** section: each guardrail is a `BUT it must NOT` clause with its own negative case set and zero tolerance, with every layer the agent has covered or marked `n/a — <reason>`
- AND `requirements.md` carries an **Evals** section: offline case sets, thresholds, the regression trigger, and a rubric for any free-generated output
- AND `design.md` carries an **online monitoring plan** (metrics, sampling, alert threshold, owner) and the eval seam
- AND `tasks.md` carries an **eval-gate task** with case sets, a verification command, thresholds, and a no-pass clause
- AND every task of the spec lists `ai-agent-development` in its skills
- BUT it must NOT pass a phase gate for an agent spec while that phase's items are missing: Phase 1 the `AI Agent` row and the Guardrails and Evals sections; Phase 2 the eval seam and the online monitoring plan in `design.md`; Phase 3 the eval-gate task and `ai-agent-development` on every task (per-phase gating, corrected at validation W-1, approved by JC 2026-11-16)

#### Scenario: Non-agent spec unchanged

- GIVEN `AI Agent: no` or an absent row
- WHEN specify runs
- THEN none of the agent steps run, and the output matches today's apart from the recorded row

### FR-5: `/akili-test` runs the evals

`/akili-test` SHALL plan and run an agent eval suite for an agent spec.

#### Scenario: Eval suite planned and run

- GIVEN `requirements.md` records `AI Agent: yes`
- WHEN the Leader plans suites
- THEN it plans an **agent eval suite** that runs the eval-gate task's verification command(s) over the offline, regression and guardrail sets
- AND the report gains an **Agent Evals** section. It records, per set: cases in the set, cases scored, the metric against its threshold, guardrail violations, and the no-pass status (`clear` or the triggered condition)
- BUT it must NOT treat exit code 0 as passing. The gate is the thresholds and the zero-violation count
- AND it must NOT let a Tester change expected values, thresholds or the rubric to make a set pass. A mismatch is a `FAIL` or a `PRODUCT_BUG`
- AND IT MUST record online evals as out of this command's reach, never as run

#### Scenario: No runner

- GIVEN an agent spec whose eval-gate task names no runnable command, or whose runner is absent
- WHEN suites are planned
- THEN that is the existing *No test infrastructure* STOP: the user is told, and no substitute eval is improvised

#### Scenario: Non-agent spec unchanged

- GIVEN `AI Agent: no` or an absent row
- WHEN `/akili-test` runs
- THEN no eval suite is planned and the report has no Agent Evals section

### FR-6: `/akili-validate` enforces the eval gate

`/akili-validate` SHALL, for an agent spec, refuse PASS without an eval gate whose recorded results clear it.

#### Scenario: Verdict ladder

- GIVEN `requirements.md` records `AI Agent: yes`
- WHEN validate audits the spec
- THEN it applies, in order:

  | Condition | Verdict |
  |---|---|
  | No eval-gate task in `tasks.md`, or no Agent Evals results in `test-report.md` | **FAIL** |
  | Any guardrail violation recorded | **FAIL** |
  | Any threshold missed | **FAIL** |
  | No online monitoring plan in `design.md` | **FAIL** |
  | A no-pass condition triggered | **BLOCKED** |
  | None of the above | the eval gate passes |

- AND the report records the eval gate's verdict and the row that decided it
- BUT it must NOT report the spec PASS while the eval gate is FAIL or BLOCKED
- AND IT MUST report a guardrail violation as FAIL whatever the aggregate scores are

#### Scenario: Non-agent spec unchanged

- GIVEN `AI Agent: no` or an absent row
- WHEN validate runs
- THEN no eval gate is applied and the report has no eval-gate entry

### FR-7: Governance stays coherent

The binding change from `stack` to `conditional` SHALL be reflected everywhere the binding is stated.

#### Scenario: Restatements agree

- GIVEN the binding is `conditional`
- WHEN the repository is swept for the skill's binding, by name and by phrase family
- THEN every restatement reads `conditional`: `SKILL.md`, the panel `SKILL_CATALOG`, the panel test's binding list, `backend-routing.md`, `AGENTS.md` *Backend Skills*, `docs/skills/governance.md` → *Current assignment*, `docs/overview.md`, `docs/skills/README.md` and `docs/skills/ai-agent-development.md`
- AND `/akili-constitution` Step 5 loads the skill through a conditional line (when the product includes an AI agent), and the skill leaves the Step 8D Skill Map candidates, specify's Step 2.1 no-map list and `docs/commands/akili-constitution.md`'s stack list (design DD-9, approved by JC 2026-11-14)
- AND `docs/skills/ai-agent-development.md` → *Best Paired Commands* names the selector-gated steps in specify, test and validate
- BUT it must NOT leave a sentence saying the skill reaches agents only through the Skill Map

### FR-8: Docs, CHANGELOG, tests

#### Scenario: Surfaces updated

- GIVEN the change ships
- WHEN a user reads the docs
- THEN `docs/commands/` pages for specify, test and validate describe the `AI Agent` branch
- AND `CHANGELOG.md` → `Unreleased` has an entry whose every clause matches the shipped text at HEAD
- AND text-contract tests pin the selector wording in the three commands, the two references' presence, their `## Sources` blocks, and their `> Unvalidated:` markers
- BUT it must NOT add a shipped test that reads `docs/specs/changes/ai-agent-guardrails-evals/` (KZ-changes--archify-diagrams-1)

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | **Non-agent path untouched:** every added sentence in specify, test and validate is conditional on `AI Agent: yes`. The one carve-out is specify's detection text, which must read every spec and only records the row |
| NFR-2 | **Pinned sources:** every external claim in the two new references resolves to a fetched official-docs link with a verified date. A standards body (for example OWASP) is labeled as a standard, not as vendor documentation |
| NFR-3 | **Maturity marker:** unvalidated guidance carries the literal `> Unvalidated:` marker, findable with `grep -rn "> Unvalidated:" .claude/skills/ai-agent-development/` |
| NFR-4 | **Size:** each new reference stays within a cap fixed and measured at the design gate (Step 2.4). Existing references are 65–163 lines |
| NFR-5 | **Vendor-neutral, host-agnostic:** no guide step requires one vendor, model or host. Text works for all six install targets |
| NFR-6 | **Verification:** `npm test`, `npm run verify:cli`, `npm run pack:dry-run` and `git diff --check` pass |

## 8. Defect Classes and Gates

| Defect class this spec can produce | Gate |
|---|---|
| Dropped obligation: an FR clause never ships (KZ-changes--gate-falsifiability-2) | Reviewer term-by-term walk of each FR clause against the diff |
| `stack` restatement survives the binding change (KZ-changes--kaizen-loop-closure-2) | Phrase-family grep over the whole repository before review (FR-7), plus the panel catalog test |
| Non-agent path altered (NFR-1) | Diff review: every added command line sits under an `AI Agent: yes` condition. Text-contract tests pin the condition wording |
| Invented, stale or unpinned source claim | Each `## Sources` link fetched at execute, with the date recorded. Reviewer spot-checks claims against the fetched page |
| Guide drifts into legal advice (FR-1) | Grep the voice section for statute and jurisdiction patterns, plus Reviewer read. **No automated check is complete**: accepted residual risk, mitigated by the counsel-owned decision framing |
| Overstated CHANGELOG or docs claim (KZ-002) | Quote-check each clause at HEAD before review |
| Shipped test depends on the active spec path | Grep of `test/` for the spec path |
| Prompt behavior (detection, enforcement) wrong in practice | **No automated check.** Substitute: a walkthrough of the three command edits against held-out cases (an agent spec, a non-agent LLM-free spec, an ambiguous spec, an agent spec missing an eval gate) |
| Package or install counts change unexpectedly | `npm test` (install fixtures), `npm run pack:dry-run` |

## 9. Requirement ID Index

| ID | Title |
|---|---|
| FR-1 | Guardrails build guide |
| FR-2 | Evals guide |
| FR-3 | Skill router and mapping |
| FR-4 | `/akili-specify` detects, records and enforces |
| FR-5 | `/akili-test` runs the evals |
| FR-6 | `/akili-validate` enforces the eval gate |
| FR-7 | Governance stays coherent |
| FR-8 | Docs, CHANGELOG, tests |
| NFR-1…6 | §7 |
