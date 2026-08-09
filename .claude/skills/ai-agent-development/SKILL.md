---
name: ai-agent-development
description: "Trigger: agent development, agent architecture, LangGraph, LangChain, Deep Agents, Bedrock AgentCore, Claude Agent SDK, multi-agent, agent evals, framework selection. Decision layer for building AI agents: framework and runtime selection, agent architecture, and the mapping from agent behavior to AKILI spec documents; defers runtime detail to the skills and docs that own it."
license: MIT
metadata:
  author: Juan Carlos Cadavid — jcadavid.com
  inspired-by: "LangChain / LangGraph documentation; AWS Bedrock AgentCore documentation; Anthropic Claude Agent SDK documentation"
  binding: stack
  version: "1.0"
---

# AI Agent Development — Decision Layer

This skill decides **what to build an agent with and how to shape it**. It operates nothing: framework APIs, SDK calls, and deployment mechanics belong to the skills and docs named in the deferral table below.

This file is the **router**. Read it, answer the three routing questions, then load only the `references/` file(s) the task actually needs.

## Scope & Composition

**Owns:** framework and runtime selection; agent architecture (state, tools, memory, human-in-the-loop points, multi-agent topology); the hosting *choice* for agent workloads; and the bridge from agent behavior to `requirements.md`, `design.md`, and `tasks.md`.

**Does not own:** API signatures, SDK usage, service configuration, deployment implementation.

**Composition, not exclusion.** This skill composes with the skills that own operation — it never displaces them. Their triggers legitimately overlap on agent-shaped tasks, so precedence goes by question type:

- **Decision question** — "which framework", "how should this agent be structured", "where should it run" → load **this skill first**.
- **Operation question** — "how do I call this API", "how do I configure this service" → load the **runtime skill first**.
- **Both may be loaded in one task.** A task that chooses *and* builds needs both, in that order.

## Routing Heuristic — three questions

Answer these before opening the matrix; they shortlist the option in most cases.

1. **Where does it run?** Your own process or container, a managed agent runtime, or inside an existing application. This is usually the hardest constraint, so it eliminates options first.
2. **How much orchestration control do you need?** A prebuilt agent loop (tool-calling until done) versus an explicit graph you author (branching, parallelism, custom control flow). Control costs authoring effort — buy the loop when the behavior fits it.
3. **What must survive restarts, and where do humans intervene?** Durable state across process death, resumable runs, and approval checkpoints are the requirements that most often force a framework instead of a plain SDK loop.

If the three answers do not converge on one option — or the task names a framework that must be justified against alternatives — open `references/framework-selection.md`.

## Runtime Deferral

Runtime detail is out of scope by design. Availability is **per-developer, not per-project**: never assume a skill is installed, so every row names its substitute route.

| Question | Route |
|---|---|
| Bedrock / AgentCore operation, Harness, guardrails config | `amazon-bedrock` *(when present; official AWS Bedrock docs otherwise)* |
| Anthropic SDK, tool use, MCP | `claude-api` *(when present; official Anthropic docs otherwise)* |
| Lambda / ECS / API Gateway implementation of a chosen hosting | `aws-serverless` — packaged stack skill *(when present; official AWS docs otherwise)* |
| Framework API signatures, version-specific detail | Pinned official docs — see the `## Sources` block of each reference |

`references/aws-deployment.md` owns only the **choice between** hostings. Implementing the chosen one is the third row's job.

## References — load per task

| Read | When the task involves |
|---|---|
| `references/framework-selection.md` | Choosing or justifying a framework or runtime; the three routing questions did not converge; a user proposes an option you must place (including CrewAI or AutoGen) |
| `references/langgraph-patterns.md` | LangGraph already chosen or in use — state design, nodes and edges versus prebuilt agents, durable execution, HITL interrupts, streaming, memory, subgraphs |
| `references/akili-spec-mapping.md` | Writing spec documents for an agent feature — behaviors and evals as scenarios, architecture as design decisions, eval work as tasks with verification commands |
| `references/aws-deployment.md` | Deciding where an agent workload runs on AWS — AgentCore Harness versus Lambda versus ECS trade-offs for agent workloads |

More than one can apply: choosing a framework and then specifying the feature is `framework-selection.md` + `akili-spec-mapping.md`.

## Maturity

The agent ecosystem churns faster than this skill is revalidated. Every factual claim here and in the references is pinned to an official-docs link, and the matrix carries a `Last verified:` date — check it before relying on a comparison.

Guidance not yet validated in a real build is marked inline with `> Unvalidated:` rather than omitted. The marker is greppable (`grep -rn "> Unvalidated:" .claude/skills/ai-agent-development/`), so the maturity boundary is auditable instead of implied. Treat marked content as a starting hypothesis to verify against the pinned source, not as settled practice.
