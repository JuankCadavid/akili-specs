# `ai-agent-development`

**Author:** Juan Carlos Cadavid — [jcadavid.com](https://jcadavid.com) · **License:** MIT · **Binding:** `stack`

## Purpose

The decision layer for building AI agents: which framework and runtime to use, how to shape the agent (state, tools, memory, human-in-the-loop points, multi-agent topology), where an agent workload runs on AWS, and how agent behavior becomes AKILI spec documents. It operates nothing — API signatures, SDK usage, service configuration, and deployment mechanics stay with the skills and docs that own them. Inspired by the LangChain/LangGraph documentation, the AWS Bedrock AgentCore documentation, and the Anthropic Claude Agent SDK documentation.

## Use When

- Choosing or justifying an agent framework or runtime — LangGraph, Deep Agents, LangChain, Bedrock AgentCore, and the Claude Agent SDK as primary options; CrewAI and AutoGen at recognition level.
- Designing agent architecture: state ownership, tools, memory lifetime, HITL pause points, subgraph and multi-agent boundaries.
- Deciding where an agent workload runs on AWS.
- Turning an agent feature into `requirements.md`, `design.md`, and `tasks.md`.

## Core Rules

- **Composition, not exclusion.** Decision questions ("which framework", "how should this be structured") load this skill first; operation questions ("how do I call this API") load the runtime skill first. Both may be loaded in one task.
- **Route before reading.** Three questions — where it runs, how much orchestration control it needs, what must survive restarts and where humans intervene — shortlist the option before the full matrix is opened.
- **Runtime detail defers outward:** `amazon-bedrock` for Bedrock/AgentCore operation, `claude-api` for the Anthropic SDK and MCP, `aws-serverless` for Lambda/ECS/API Gateway implementation, pinned official docs for framework APIs. Availability is per-developer, so every route names its docs substitute.
- **Nondeterministic output needs an eval threshold with a stated no-pass clause**, never a bare exit-0 test; guardrails get their own case set with a tolerated count of zero.
- **Claims are pinned and dated.** Every factual claim cites an official-docs link, every reference carries a `## Sources` block of pinned links, the framework-selection, LangGraph-patterns, and AWS-hosting references additionally carry a `Last verified:` date, and guidance not yet validated in a real build is marked inline with a greppable `> Unvalidated:`.

## References — load per task

| Read | When the task involves |
|---|---|
| `references/framework-selection.md` | Choosing or justifying a framework or runtime; placing an option someone proposes |
| `references/langgraph-patterns.md` | LangGraph already chosen — state design, authored graph vs prebuilt loop, durable execution, interrupts, failure routing, streaming, memory, subgraphs |
| `references/akili-spec-mapping.md` | Writing spec documents for an agent feature — behaviors and guardrails as scenarios, architecture as design decisions, evals as tasks with verification commands |
| `references/aws-deployment.md` | Deciding where an agent workload runs — AgentCore Runtime vs Lambda vs ECS trade-offs |

## Best Paired Commands

- `/akili-constitution` — Step 5 TRD and the Step 8D Skill Map, when the project builds agents.
- `/akili-specify` — framework selection and the agent feature's spec documents.
- `/akili-execute` — assigned per task by the Leader from the project `## Skill Map`.

## Source

- `../../.claude/skills/ai-agent-development/SKILL.md`
