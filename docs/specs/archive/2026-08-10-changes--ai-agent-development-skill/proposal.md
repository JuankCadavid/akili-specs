# Proposal: `ai-agent-development` Stack Skill

## 1. Document Control

| Field | Value |
|---|---|
| Type | Change |
| Spec Path | `changes/ai-agent-development-skill` |
| Slug | `ai-agent-development-skill` — derived from free-text argument ("add a new original-authorship stack skill for AI agent development") |
| Approval Mode | gated |
| Status | Draft — awaiting approval |
| Date | 2026-08-09 |
| Author | Juan Carlos Cadavid (intent) / agent (draft) |

## 2. Intent

Add one original-authorship **`stack`** skill, `ai-agent-development`, to the AKILI-SPECS package: the **architecture and decision layer** for building AI agents. It teaches *which* agent framework/runtime fits a given problem (LangGraph vs Deep Agents vs LangChain vs Bedrock AgentCore vs Claude Agent SDK) and *how to specify agents in AKILI terms* — agent behaviors and evals as `requirements.md` scenarios, graph/state/tools as `design.md` architecture — while **deferring runtime detail to environment-provided skills** (`amazon-bedrock` from the AWS agent-toolkit, `claude-api`).

## 3. Problem / Current Behavior

- AKILI has stack skills for conventional domains (Angular, NestJS, AWS serverless) but **nothing for agent development**, a domain the maintainer is actively entering.
- The AWS agent-toolkit already installs deep runtime skills (`amazon-bedrock` covers Bedrock AgentCore end to end), and `claude-api` covers the Anthropic SDK — but **no skill owns the decision layer**: framework selection, agent architecture (state, tools, human-in-the-loop, durability), and the mapping from agent behavior to AKILI spec documents.
- Without it, agent-related specs would improvise this reasoning per session, and there is a standing temptation to vendor Bedrock/LangGraph content that the environment already provides (a direct violation of the governance rule "environment-provided skills are referenced, never vendored").

## 4. Proposed Outcome

- A new skill `.claude/skills/ai-agent-development/` (binding `stack`, original authorship with `inspired-by:` credits) whose `SKILL.md` carries the **decision spine** and AKILI spec mapping, with `references/` files for progressive disclosure.
- Agent-development projects get the skill through the **`## Skill Map`** exactly like `nestjs-expert` or `aws-serverless` — no command ever load-directs it.
- The skill explicitly **routes runtime detail outward**: Bedrock/AgentCore questions → `amazon-bedrock` (when the developer's environment provides it), Anthropic SDK/tool-use/MCP → `claude-api`, LangGraph API detail → official docs pinned in references.

## 5. Scope

| Deliverable | Location |
|---|---|
| Skill: decision spine + AKILI spec mapping | `.claude/skills/ai-agent-development/SKILL.md` |
| Reference: framework/runtime selection matrix (LangGraph, Deep Agents, LangChain, Bedrock AgentCore, Claude Agent SDK) | `references/framework-selection.md` |
| Reference: LangGraph patterns (state, nodes/edges, durable execution, HITL, streaming, memory) | `references/langgraph-patterns.md` |
| Reference: spec mapping — behaviors/evals → `requirements.md` scenarios; graph/state/tools/guardrails → `design.md`; eval tasks in `tasks.md` | `references/akili-spec-mapping.md` |
| Reference: runtime deferral table + AWS deployment notes (what `amazon-bedrock`/`claude-api` own; what this skill owns) | `references/runtimes.md` |
| Wiring: stack candidate pools (constitution Step 8D pool, specify no-map fallback list) | `.claude/commands/akili-constitution.md`, `.claude/commands/akili-specify.md` |
| Docs: skill page + catalog row + governance Current-assignment row | `docs/skills/ai-agent-development.md`, `docs/skills/README.md`, `docs/skills/governance.md` |
| README skill list entry + `CHANGELOG.md` (Unreleased) | `README.md`, `CHANGELOG.md` |

## 6. Non-Goals

- **No new command.** `akili-agent-core` was considered and rejected: commands are workflow stages and must stay framework-agnostic; agent development is a domain, reached via the Skill Map (governance binding taxonomy).
- **No re-teaching of Bedrock/AgentCore, the Anthropic SDK, or MCP internals** — those are owned by environment-provided skills and are referenced, never vendored.
- **No vendoring of LangChain/LangGraph documentation** — references carry curated patterns and pinned links, not copied docs.
- No changes to `/akili-execute`, `/akili-validate`, or the installer (it copies the whole `skills/` tree already).

## 7. Affected Users, Systems, And Specs

- **Users:** developers running AKILI on agent-development projects; the maintainer's own learning path (the skill doubles as codified learning, grown kaizen-style).
- **Systems:** skill package (`.claude/skills/`), two command candidate-pool lists, docs catalog, README, CHANGELOG.
- **Specs:** none existing; this is the first agent-domain spec in the repo.

## 8. Visual Reference

- Source: None
- Location: —
- Notes: documentation/skill-only change; no UI surface.

## 9. Requirement Delta Preview

### ADDED Requirements

- The package ships a `stack` skill `ai-agent-development` passing all five governance acceptance boxes (need, binding, attribution, size, docs+CHANGELOG).
- The skill's frontmatter declares original authorship (`author: Juan Carlos Cadavid — jcadavid.com`) with `inspired-by:` crediting LangChain/LangGraph docs, AWS Bedrock AgentCore docs, and the Anthropic Agent SDK docs.
- `/akili-constitution` (Skill Map builder pool) and `/akili-specify` (no-map fallback list) include `ai-agent-development` among stack candidates.
- The skill contains an explicit **deferral table**: which questions route to `amazon-bedrock`, `claude-api`, or official framework docs — and works when those environment skills are absent (Skill Map rule 2: availability is per-developer, never assumed).

### MODIFIED Requirements

- Stack-skill candidate pools grow by one entry (constitution Step 8D + bootstrap list, specify fallback list, governance Current-assignment table, docs catalog, README list).

### REMOVED Requirements

- None.

## 10. Approach Options

| Option | Shape | Trade-off |
|---|---|---|
| **A (recommended)** | One skill, decision spine in `SKILL.md`, 4 `references/` files (progressive disclosure) | Matches governance size rule ("one skill with references/ over sibling families"); references load only when the task needs them; room to grow kaizen-style |
| B | Minimal `SKILL.md` only, no references | Smallest, but forces LangGraph patterns and the spec mapping into one file that every load pays for — the exact anti-pattern the gsap fusion fixed in reverse |
| C | Skill + new `akili-agent-core` command | Violates governance: stack skills never get command wiring; commands stay framework-agnostic. Rejected. |

## 11. Recommended Approach

**Option A.** It is the smallest path that satisfies all five acceptance boxes, keeps per-load token cost low, and leaves the growth path open (new references as the maintainer's agent experience accumulates — LangGraph deployment on AWS is a natural next reference).

## 12. Risks, Dependencies, And Open Questions

| Item | Kind | Mitigation |
|---|---|---|
| Maintainer is early in the agent-development learning curve; decision content could encode misconceptions | Risk | Ground every claim in the pinned official docs (LangChain build-overview, AgentCore docs, Agent SDK docs); mark the skill `version: 0.x` maturity note; grow via kaizen after real agent builds |
| LangChain/LangGraph APIs churn quickly | Risk | References carry decision-level patterns + pinned doc links, not API signatures; date-stamp the selection matrix |
| `amazon-bedrock`/`claude-api` availability varies per developer | Dependency | Deferral table states "when present"; the skill's own guidance stands alone without them |
| Should the selection matrix include CrewAI/AutoGen-class frameworks or stay on the five named? | Open question | Start with the five (LangGraph, Deep Agents, LangChain, AgentCore, Agent SDK); add rows only on real project demand |

## 13. Success Criteria

- Governance acceptance checklist passes 5/5, including a truthful `docs/skills/README.md` row with Binding column.
- `grep` shows no command text load-directing `ai-agent-development` (Skill Map / fallback-list carve-outs only).
- A developer on an agent project running `/akili-constitution` sees `ai-agent-development` in the Skill Map candidate pool; `/akili-specify` can assign it per task.
- CHANGELOG Unreleased entry present; release classified **minor** (new skill = new capability).

## 14. Next Step

```text
/akili-specify changes/ai-agent-development-skill
```
