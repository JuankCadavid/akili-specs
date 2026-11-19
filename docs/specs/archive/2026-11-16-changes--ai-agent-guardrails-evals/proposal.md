# Proposal: Guardrails and Evals for AI Agents

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/ai-agent-guardrails-evals` |
| Type | Change |
| Deliverable | software (methodology text: skill references + command prompts) |
| Approval Mode | gated |
| Requirement Source | JC's brief in this session (pasted). JC confirmed 2026-11-14: brief only, no Jira, no Figma |
| Visual Source | None — no UI surface (Markdown skill references and command prompts) |
| Branch | `feat/ai-agent-guardrails-evals`, cut from `dev` at `c2339a1` in this worktree (one AKILI session per checkout) |
| Status | Approved by JC, 2026-11-14 |
| Date | 2026-11-14 |
| Depends on | none |
| Parallel-safe | yes. It touches `ai-agent-development` and three commands. `/akili-specify`, `/akili-test` and `/akili-validate` are shared files, so rebase if another open spec edits them |

## Intent

An AKILI spec for an AI agent can already write a guardrail as a `BUT it must NOT` clause and an eval as a gated task. Nothing helps the team **build** those guardrails or **design** the evals. Nothing **forces** an agent spec to carry them either. This change adds both guides to `ai-agent-development` and makes `/akili-specify`, `/akili-test` and `/akili-validate` enforce them whenever a spec is for an AI agent.

Running example throughout: **an AI agent that answers phone calls** (a voice call agent).

## Problem / Current Behavior

| # | Today | Evidence |
|---|---|---|
| P1 | The skill explains how to **write** guardrails and evals in a spec, but not how to **build** layered guardrails (input, output, tool permissions, human handoff) | `references/akili-spec-mapping.md` §1 and §3 cover clause shape and the eval task shape only (`.claude/skills/ai-agent-development/references/akili-spec-mapping.md:17-38`, `:56-76`) |
| P2 | Nothing covers eval design across the lifecycle: offline before release, online in production, regression on every change, judge rubrics. Nothing covers voice metrics | Same file. Offline vs online appears only as borrowed vocabulary in `## Sources` (`akili-spec-mapping.md:146`) |
| P3 | Nothing is specific to voice or call agents: caller identity verification, recording consent, escalation to a human agent | `grep -rni "voice\|call agent\|consent" .claude/skills/ai-agent-development/` → 0 hits (run 2026-11-14) |
| P4 | No command requires guardrails or evals for an agent spec. The skill is `binding: stack`, so command text names it only as an optional pick in `/akili-specify`'s stack list | `.claude/skills/ai-agent-development/SKILL.md:8`, `.claude/commands/akili-specify.md:252` |
| P5 | `/akili-test` plans four software suite types, with no eval suite | `.claude/commands/akili-test.md:211` |
| P6 | `/akili-validate` has no gate that fails an agent spec with no eval gate or with a guardrail violation | `grep -n "eval\|guardrail" .claude/commands/akili-validate.md` → only Impeccable detector rows (`:140`, `:142`), run 2026-11-14 |

## Proposed Outcome

1. **Guardrails build guide.** A new reference, `references/guardrails.md`. It covers layered guardrails (input, output, tool permissions and least privilege, human handoff) and a voice section (caller verification, recording consent, escalation). Each layer is traced through the phone agent.
2. **Evals guide.** A new reference, `references/evals.md`. It covers offline evals, online evals, regression on every change, LLM-as-judge with pinned rubrics, and voice metrics (latency, escalation rate, task completion). Expected values come from approved scenarios.
3. **Enforcement behind a selector.** When `requirements.md` Document Control records `AI Agent: yes`:
   - `/akili-specify` must produce a guardrails section and an evals section.
   - `/akili-test` must run the evals as their own suite.
   - `/akili-validate` must FAIL when there is no eval gate, and on any guardrail violation.

## Scope

| In | Detail |
|---|---|
| `references/guardrails.md` (new) | Layers: input (prompt injection, PII), output (prohibited claims), tool permissions and least privilege, human handoff. Voice: caller identity verification, recording consent, escalation to a human. Each layer ends in the spec clause it becomes |
| `references/evals.md` (new) | Offline, online, regression, LLM-as-judge with rubrics, voice metrics. Expected values from approved scenarios. Guardrail case sets with zero tolerance |
| `ai-agent-development/SKILL.md` | Two new rows in *References — load per task*. Binding change (`stack` → `conditional`, decision Q2). `version` bump |
| `references/akili-spec-mapping.md` | Point to the two new references instead of restating them. The triage example stays |
| `/akili-specify` | Detect an agent spec, record `AI Agent: yes`, load the skill, and require a **Guardrails** section and an **Evals** section in `requirements.md`, plus an eval-gate task in `tasks.md` |
| `/akili-test` | When `AI Agent: yes`, plan an **agent eval suite** (offline + regression sets, guardrail set) beside the software suites, and report it in its own section |
| `/akili-validate` | When `AI Agent: yes`: no eval gate → **FAIL**; any guardrail violation → **FAIL**; a no-pass clause triggered → not PASS |
| Docs | `docs/skills/ai-agent-development.md`, `docs/skills/README.md` row, the docs pages for the three commands, `CHANGELOG.md` → Unreleased |
| Binding ripple (decision Q2) | Panel `SKILL_CATALOG` (`flow.mjs:634`), `test/akili-panel-flow.test.js:1436`, the `backend-routing.md` row label (`:70`), and the README binding column |
| Tests | Text-contract tests for the selector wording in the three commands, and the reference files' presence and sources. A test that pins the `> Unvalidated:` markers |

## Non-Goals

- **Running online evals.** AKILI never touches production. The spec records an online monitoring plan, and `/akili-validate` checks that the plan exists, not its results.
- **Legal advice.** Recording consent and identity rules vary by jurisdiction. The guide names the decision and who owns it (counsel), never a rule of law.
- **Vendor operation.** Bedrock Guardrails configuration, telephony and contact-center setup, and SDK calls stay with `amazon-bedrock`, `claude-api` and official docs, per the skill's *Runtime Deferral*.
- **An eval runner.** AKILI ships no runner. The guide names the runner's contract (sets, thresholds, report, no-pass clause), as `akili-spec-mapping.md` §3 already does.
- **A new command or a new skill.** This extends `ai-agent-development` only.
- **Changing `Deliverable`.** An agent is software, so `AI Agent` is a separate row and never a `Deliverable` value.

## Affected Users, Systems, And Specs

| Affected | How |
|---|---|
| Teams building agents with AKILI | Get build guidance, and agent specs now get a hard eval gate |
| `.claude/skills/ai-agent-development/` | 2 new references, router and mapping edits |
| `.claude/commands/akili-specify.md`, `akili-test.md`, `akili-validate.md` | Selector-gated steps |
| `.claude/skills/akili-panel/hooks/flow.mjs`, tests, `docs/skills/*` | Binding ripple and docs |
| Specs | Builds on archived `changes/ai-agent-development-skill`, which created the skill |

## Visual Reference

- Source: None
- Location: n/a
- Notes: methodology text only, with no UI surface. Mockup Fallback does not apply.

## Requirement Delta Preview

### ADDED Requirements

- `ai-agent-development` ships `references/guardrails.md`, with four layers and a voice section, worked through the phone-call agent.
- `ai-agent-development` ships `references/evals.md`, covering offline, online, regression, LLM-as-judge, and voice metrics, worked through the same agent.
- Every external claim in both references is pinned to an official-docs link with a verified date. Guidance not validated in a real build carries `> Unvalidated:`.
- A spec whose `requirements.md` records `AI Agent: yes` must contain a Guardrails section, an Evals section and an eval-gate task. `/akili-specify` will not hand off without them.
- `/akili-test` runs an agent eval suite for such a spec and reports thresholds, guardrail violations and no-pass status.
- `/akili-validate` FAILs such a spec when it has no eval gate or any guardrail violation.

### MODIFIED Requirements

- `ai-agent-development` binding moves from `stack` to `conditional`, because commands now load it behind a selector (decision Q2).
- `akili-spec-mapping.md` points to the new guides instead of restating them.
- `/akili-test`'s "four software suite types" sentence names the eval suite as a separate suite, like the video render suite.

### REMOVED Requirements

- None.

## Approach Options

| Option | What | Pros | Cons |
|---|---|---|---|
| **A. Selector row + conditional load** *(recommended)* | `/akili-specify` records `AI Agent: yes \| no` in Document Control (an absent row means `no`). The three commands load `ai-agent-development` and enforce only behind it. Same pattern as `Deliverable: video` → `video-production` | Proven pattern in the same three commands (`akili-specify.md:66`, `akili-test.md:116`, `akili-validate.md:69`). Explicit and auditable. Non-agent specs are untouched | Binding change ripples into the panel catalog, tests and docs |
| B. Inference only | Each command decides "is this an agent?" from the spec's content | No new row | Non-deterministic. Two commands can disagree, and a gate that may not fire is no gate |
| C. Guides only, no enforcement | Ship parts 1–2 and leave part 3 as advice in the skill | Smallest change | Drops part 3 of the brief, and P4–P6 stay open |

## Recommended Approach

**Option A.** It is the smallest safe path that delivers all three parts. It reuses a selector pattern the same three commands already run for video, so the enforcement is explicit, deterministic, and invisible to non-agent specs.

**Validate verdict ladder** (the BLOCKED row is decision Q4; the wording is settled at `/akili-specify`):

| Condition (when `AI Agent: yes`) | Verdict |
|---|---|
| No eval-gate task, or no eval report from `/akili-test` | **FAIL** |
| Any guardrail violation in the report | **FAIL** (zero tolerance) |
| A threshold missed | **FAIL** |
| A no-pass clause triggered (too few cases scored, judge or rubric changed, pass only on a re-run) | **BLOCKED**, never PASS |
| Online monitoring plan missing from `design.md` | **FAIL** |

**Estimated size:** about 2 × 180–250 lines of reference text, about 40–60 lines across the three commands, and docs plus CHANGELOG. Per `KZ-bugfix--init-ctrlc-abort-2`, budget test lines per `THEN`/`BUT`/`AND IT MUST` clause (roughly 3× the command edits), not per task. **Release class: minor.** This is new command behavior, per semver discipline. It is a recommendation only, and releasing stays JC's call.

## Risks, Dependencies, And Open Questions

### Risks

| Risk | Mitigation |
|---|---|
| Voice and consent guidance reads as legal advice | State it as a decision with an owner (counsel or compliance). Never name a statute. Mark it `> Unvalidated:` |
| Source drift: guardrail and eval docs churn fast | Pin each claim with a verified date. Candidate sources are listed below, all `UNVERIFIED — confirm at source before relying on it` until `/akili-execute` fetches them |
| The `stack` restatement survives somewhere after the binding change | Sweep by phrase family before review (`KZ-changes--kaizen-loop-closure-2`). Known sites: `SKILL.md:8`, `flow.mjs:634`, `test/akili-panel-flow.test.js:1436`, `backend-routing.md:70`, `docs/skills/README.md:21`, `docs/skills/ai-agent-development.md`, `AGENTS.md:95` (*Backend Skills*) |
| A requirement clause is dropped in shipping (for example a validate ladder row) | Walk each FR term by term in review (`KZ-changes--gate-falsifiability-2`) |
| A CHANGELOG or docs claim overstates what shipped | Quote-check each clause at HEAD (`KZ-002`) |
| Tests depend on the active spec path | Never reference `docs/specs/changes/ai-agent-guardrails-evals` from shipped tests (`KZ-changes--archify-diagrams-1`) |
| A fixture breaks on the binding change | `test/fixtures/doctor-codex-baseline.txt:27` lists the skill by name only (`OK ai-agent-development`), with no binding, so the binding change alone does not touch it. New reference files may change install counts, so re-run the fixtures at execute |

### Candidate sources (to pin at execute)

All are `UNVERIFIED — confirm at source before relying on it`:

- Anthropic: mitigating jailbreaks and prompt injection; *Define success criteria and build evaluations* (already pinned, verified 2026-08-09).
- Amazon Bedrock Guardrails: content filters, denied topics, sensitive-information (PII) filters, contextual grounding.
- OWASP Top 10 for LLM Applications: prompt injection, sensitive information disclosure, excessive agency. This is a standards body, not a vendor, and the pin will say so.
- LangSmith *Evaluation concepts*: offline vs online evaluation, LLM-as-judge (already pinned).
- A contact-center or voice platform's official docs for escalation and transfer and for call-recording controls. Which platform to pin is a specify decision.

### Decisions (answered by JC, 2026-11-14)

| # | Question | Decision |
|---|---|---|
| Q1 | Requirement and visual source: is there a Jira ticket or a Figma file, or is this brief the whole source? | **Brief only** (no Jira, no Figma) |
| Q2 | Change the binding from `stack` to `conditional`? | **Yes, `conditional`.** Governance defines `conditional` as "a conditional line in the command". Keeping `stack` while commands load the skill would contradict `docs/skills/governance.md` |
| Q3 | Where is `AI Agent: yes` first recorded: `/akili-specify` only, or also `/akili-propose` beside `Deliverable`? | **`/akili-specify` only.** `/akili-propose` can add it later |
| Q4 | A no-pass clause triggered at validate: BLOCKED, or FAIL? | **BLOCKED.** An inconclusive run is not evidence of failure, but it is never PASS |

## Success Criteria

- Both new references exist, use the phone-call agent throughout, pin every external claim with a verified date, and mark unvalidated guidance with `> Unvalidated:`.
- An agent spec cannot leave `/akili-specify` without Guardrails and Evals sections and an eval-gate task.
- `/akili-test` reports an agent eval suite for an agent spec.
- `/akili-validate` returns FAIL for an agent spec with no eval gate or with one guardrail violation. A non-agent spec's validation is unchanged.
- `npm test`, `npm run verify:cli`, `npm run pack:dry-run` and `git diff --check` pass.

## Next Step

```text
/akili-specify changes/ai-agent-guardrails-evals
```
