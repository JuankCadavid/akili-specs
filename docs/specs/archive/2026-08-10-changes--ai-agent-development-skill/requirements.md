# Requirements: `ai-agent-development` Stack Skill

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/ai-agent-development-skill` |
| Depth | Standard |
| Type | Change |
| Approval Mode | gated |
| Status | Draft — Phase 1 |
| Date | 2026-08-09 |
| Proposal | `proposal.md` (approved 2026-08-09; open question resolved: CrewAI/AutoGen **included** at recognition level — FR-2) |

## 2. Executive Summary

Ship one original-authorship `stack` skill, `ai-agent-development`, that gives AKILI agents the **decision layer** for AI-agent development: framework/runtime selection, agent architecture reasoning, and the mapping from agent behavior to AKILI spec documents — while deferring all runtime detail to environment-provided skills (`amazon-bedrock`, `claude-api`). The skill must pass all five boxes of the governance acceptance checklist and reach projects only through the `## Skill Map`.

## 3. Glossary

| Term | Meaning |
|---|---|
| Decision layer | Guidance for *choosing* frameworks/architectures, as opposed to *operating* them (runtime layer) |
| Environment-provided skill | A skill installed by an external tool (e.g. `amazon-bedrock` from the AWS agent-toolkit), referenced but never vendored (governance rule) |
| Recognition level | Enough content to identify an option and decide when it wins/loses — no operational guidance |
| Deferral table | The section routing runtime questions to their owning skill or official docs |
| Eval | An executable check of agent behavior quality (task success, tool-call correctness, groundedness) |

## 4. System Context & Scope

**In scope:** the skill directory (`.claude/skills/ai-agent-development/`), its wiring into the two stack candidate pools, its documentation pages, and the CHANGELOG entry.
**Out of scope:** any new command; changes to `/akili-execute`/`/akili-validate`; the installer (copies `skills/` wholesale); content owned by `amazon-bedrock`, `claude-api`, or official framework docs.

## 5. Stakeholders / Personas

| Persona | Interest |
|---|---|
| AKILI developer building agents | Correct framework choice and spec-ready decomposition before writing agent code |
| Maintainer (learning the domain) | The skill as codified, kaizen-grown learning; AWS strength leveraged |
| Downstream teammate without AWS toolkit | Skill must stand alone when environment skills are absent |

## 6. Functional Requirements

### FR-1: Packaged skill with compliant frontmatter

The package SHALL ship `.claude/skills/ai-agent-development/SKILL.md` whose frontmatter declares `binding: stack`, original authorship (`author: Juan Carlos Cadavid — jcadavid.com`), and an `inspired-by:` list crediting at minimum the LangChain/LangGraph docs, AWS Bedrock AgentCore docs, and Anthropic Agent SDK docs.

#### Scenario: Frontmatter validates against governance schema

- GIVEN the governance frontmatter schema (original-authorship variant)
- WHEN `SKILL.md` frontmatter is compared against it
- THEN `name`, `description`, `license`, `metadata.author`, `metadata.binding: stack`, `metadata.version` are present
- AND `inspired-by:` lists the credited sources
- BUT it must NOT carry `adapted-by`/`adapted-for`/`source` (those denote adapted third-party skills)
- AND IT MUST include trigger keywords in `description` (agent development, LangGraph, agent architecture, Bedrock AgentCore, agent evals) so skill matching fires

### FR-2: Framework/runtime selection matrix

`SKILL.md` (or `references/framework-selection.md`) SHALL provide a selection matrix covering **LangGraph, Deep Agents, LangChain, Amazon Bedrock AgentCore, and the Claude Agent SDK** as primary options, plus **CrewAI** and **AutoGen** at recognition level, each row stating what it is, when it wins, and when it loses.

#### Scenario: Primary options are decidable

- GIVEN a task that names a target (e.g. "durable multi-step agent with human-in-the-loop on AWS")
- WHEN an agent consults the matrix
- THEN it can select a framework and justify it from the row's win/lose conditions
- AND IT MUST be date-stamped (the ecosystem churns; an undated matrix is unverifiable)

#### Scenario: Common alternatives are recognizable, not taught

- GIVEN a user proposing CrewAI or AutoGen
- WHEN the agent consults the matrix
- THEN it finds a recognition-level row (identity, win/lose conditions)
- AND the AutoGen row records its succession by the Microsoft Agent Framework
- BUT it must NOT include operational guidance for recognition-level rows (no APIs, no setup) — that would grow the skill past its size justification

### FR-3: AKILI spec mapping for agents

The skill SHALL map agent-development artifacts to AKILI documents: agent behaviors and **evals as `requirements.md` scenarios** (GIVEN/WHEN/THEN over agent conduct, including negative `BUT` clauses for guardrails), **graph/state/tools/memory/HITL points as `design.md`** architecture, and **eval implementation as `tasks.md`** tasks with verification commands.

#### Scenario: An agent feature becomes a spec

- GIVEN a request to build an agent (e.g. "support-ticket triage agent")
- WHEN a specifier loads the skill during `/akili-specify`
- THEN it can express the agent's intended behaviors as testable scenarios and its architecture as design decisions
- AND IT MUST state that eval gates follow the defect-class rule: nondeterministic agent output needs eval thresholds with a stated no-pass clause, not a bare exit-0 test

### FR-4: Runtime deferral

The skill SHALL contain a deferral table routing runtime detail outward: Bedrock/AgentCore operation → `amazon-bedrock` (when the environment provides it), Anthropic SDK/tool use/MCP → `claude-api`, framework API detail → pinned official docs.

#### Scenario: Environment skill present

- GIVEN a task touching Bedrock AgentCore deployment
- WHEN the deferral table is consulted
- THEN the agent is directed to load `amazon-bedrock` for runtime specifics

#### Scenario: Environment skill absent

- GIVEN a developer whose environment lacks the AWS agent-toolkit
- WHEN the skill is loaded
- THEN its decision guidance remains fully usable
- BUT it must NOT vendor or restate the absent skill's content as a fallback
- AND IT MUST link the official docs as the substitute route

### FR-5: Governance-compliant wiring

`ai-agent-development` SHALL appear in the stack candidate pools — `/akili-constitution` (Step 8D Skill Map builder pool and its Step 5 bootstrap list) and `/akili-specify` (no-map fallback list) — and nowhere else in command text.

#### Scenario: No load-directed stack skill

- GIVEN all files under `.claude/commands/`
- WHEN grepped for `ai-agent-development`
- THEN every hit falls inside the three governance carve-outs (Skill Map builder pool, no-map fallback list, illustrative example deferring to the Skill Map)
- BUT no command step may say "load `ai-agent-development`" unconditionally

### FR-6: Documentation and changelog closure

The change SHALL update every inventory surface in the same change: `docs/skills/ai-agent-development.md` (skill page), `docs/skills/README.md` (row with Binding column), `docs/skills/governance.md` (Current-assignment `stack` row), `docs/commands/akili-constitution.md` (the mirror's closed stack-skill enumeration — judgment CS-2), `README.md` (skill list), and `CHANGELOG.md` (Unreleased, classified **minor**).

#### Scenario: Inventory does not drift

- GIVEN the six inventory surfaces above
- WHEN each is grepped for `ai-agent-development`
- THEN every surface has exactly one truthful entry
- AND IT MUST record binding `stack` consistently across all of them

## 7. Non-Functional Requirements

### NFR-1: Token economy (progressive disclosure)

`SKILL.md` body SHOULD stay under ~150 lines; deep content lives in `references/` files loaded per task. Rationale: `stack` skills are loaded per task by Implementers — every line is paid on every load.

### NFR-2: Verifiability of claims

Every factual claim about a framework MUST be grounded in a pinned official-docs link. Content the maintainer has not yet validated in a real build MAY be marked with a maturity note rather than omitted.

## 8. Defect Classes → Gates

| Defect class | Gate | Coverage |
|---|---|---|
| Governance violation (load-directed stack skill) | `grep -rn "ai-agent-development" .claude/commands/` — every hit inside a carve-out | Automated |
| Frontmatter schema mismatch | Field-by-field diff against governance schema | Manual check at HITL (no schema validator exists) |
| Inventory drift (missing docs row / changelog) | grep each of the six surfaces (FR-6 scenario) | Automated |
| Broken internal paths/links | Existence check of every referenced repo path | Automated (`test -f` sweep) |
| **Technical misinformation in decision content** | **No automated check exists** — substituted by: (a) every claim pinned to official docs (NFR-2), (b) human review at each phase gate, (c) optional `judgment-day` on the design | Substituted — residual risk accepted and recorded |

The dominant defect class for a documentation artifact is the last row; its gate is human, not automated. An exit-0 command cannot certify prose truthfulness — this is stated here so no green gate is mistaken for that proof.

## 9. Requirement ID Index

| ID | Name | Priority |
|---|---|---|
| FR-1 | Packaged skill with compliant frontmatter | MUST |
| FR-2 | Framework/runtime selection matrix (+CrewAI/AutoGen recognition) | MUST |
| FR-3 | AKILI spec mapping for agents | MUST |
| FR-4 | Runtime deferral | MUST |
| FR-5 | Governance-compliant wiring | MUST |
| FR-6 | Documentation and changelog closure | MUST |
| NFR-1 | Token economy | SHOULD |
| NFR-2 | Verifiability of claims | MUST |
