# Framework Selection Matrix

Last verified: 2026-08-09

Decision content only — what each option **is**, when it **wins**, when it **loses**. No APIs, no setup, no code; those belong to the routes in the skill's deferral table. Bracketed numbers resolve in `## Sources`; every factual claim carries one. Re-check the date above before trusting a comparison — this ecosystem churns.

## At a glance

| Option | One-line identity |
|---|---|
| **LangGraph** | Low-level orchestration runtime; you author the graph [1] |
| **Deep Agents** | Opinionated harness for long-horizon work, on LangGraph [3] |
| **LangChain** | Standard tool-calling agent (`create_agent`), on LangGraph [2] |
| **Bedrock AgentCore** | Managed AWS platform for hosting/operating agents of any framework [4] |
| **Claude Agent SDK** | Claude Code's agent loop and tools as a Python/TypeScript library [5] |
| *CrewAI* (recognition) | Role-based Crews plus event-driven Flows [6] |
| *AutoGen* (recognition) | Superseded by the Microsoft Agent Framework [8][9] |

## Primary options

### LangGraph

- **What it is:** "a low-level orchestration framework and runtime for building, managing, and deploying long-running, stateful agents" [1]. You author nodes, edges, and state, mixing "deterministic, hand-coded steps with LLM-driven agentic steps in the same graph" [1]. It stands alone — "you don't need to use LangChain to use LangGraph" [1].
- **Wins when:** the run must survive failure and "resume from where it left off" [1]; a human must intervene mid-run by "inspecting and modifying agent state at any point" [1]; or control flow is genuinely branching or parallel rather than one tool loop.
- **Loses when:** a prebuilt tool-calling loop already fits the behavior. You would pay graph-authoring cost for control you never exercise — and LangChain's agents are "built on top of LangGraph", inheriting "durable execution, human-in-the-loop support, persistence" without the authoring [2].

### Deep Agents

- **What it is:** an agent harness — a tool-calling loop with planning and todo tracking, subagents that "break large problems into smaller, parallelizable units of work", a "configurable virtual filesystem", memory files, and "automatic compression of conversation history and large tool results" [3]. It is "a standalone library built on top of LangChain's core building blocks" that "uses the LangGraph runtime for durable execution, streaming, human-in-the-loop, and other features" [3].
- **Wins when:** the task is long-horizon and decomposable — research, multi-file codebase work — where the real problems are context growth, progress tracking, and delegation, all of which it ships built-in [3].
- **Loses when:** the workflow is short and well-defined (planning, filesystem, and subagent machinery you configure but never need), or when you need to shape the loop itself — that is the LangGraph layer underneath it [3].

### LangChain

- **What it is:** the agent framework layer — "**Agent = Model + Harness**", where `create_agent` is "a minimal, highly configurable harness" covering the prompt, the tools, and middleware, with integrations that "support OpenAI, Anthropic, Google, and more" [2].
- **Wins when:** you want a standard tool-calling agent with swappable models, adding "capabilities incrementally through middleware" [2], while still inheriting LangGraph's durability and HITL underneath [2].
- **Loses when:** the behavior needs explicit branching, parallelism, or custom control flow — drop to LangGraph [1] — or when the shape is long-horizon planning plus delegation, which Deep Agents already packages [3].

### Amazon Bedrock AgentCore

- **What it is:** "an agentic platform for building, deploying, and operating highly effective agents securely at scale using any framework and foundation model" [4], composed of modular services usable "together or independently": Runtime, Harness, Memory, Gateway, Identity, Code Interpreter, Browser, Observability, Evaluations, Policy, Registry, Payments, Optimization [4].
- **Mostly orthogonal to the framework choice.** Runtime "works with custom frameworks and any open-source framework, including CrewAI, LangGraph, LlamaIndex, Google ADK, OpenAI Agents SDK, and Strands Agents" [4]. Picking AgentCore does not pick your orchestration library. The exception is **Harness**, "a managed agent loop that lets you define and invoke AI agents with a single API call" that "handles orchestration, tool execution, memory management, and response generation" [4] — that one *is* an alternative to authoring a loop.
- **Wins when:** you are on AWS and want hosting with session isolation, built-in identity, and observability "without any infrastructure management" [4]; or you need existing APIs, Lambda functions, and services converted into MCP-compatible tools via Gateway [4].
- **Loses when:** you are not on AWS, or the agent must run in-process inside an existing application rather than in a managed runtime.
- **Boundaries:** the hosting comparison lives in `references/aws-deployment.md`; operating AgentCore is the `amazon-bedrock` skill's job (or AWS docs) per the deferral table.

### Claude Agent SDK

- **What it is:** "the same tools, agent loop, and context management that power Claude Code, programmable in Python and TypeScript" [5] — built-in file, command, and search tools, plus hooks, subagents, MCP, permissions, sessions, and automatic loading of `.claude/` skills, commands, and memory [5].
- **Wins when:** the work is computer-shaped — reading files, editing code, running commands — and belongs in your own process: it is "a library that runs the agent loop in your own process" [5]; and when the team's existing `.claude/` configuration should carry over unchanged [5].
- **Loses when:** you need a language beyond the two — "The SDK is available as a library for Python and TypeScript only", with running the CLI as a subprocess as the documented alternative [5]; you would rather not run sandbox and session infrastructure, which the docs route to Managed Agents, "a separate product from the Agent SDK" where "Anthropic runs the agent and the sandbox" [5]; or you intend to implement the tool loop yourself, which is the Client SDK's role [5].

## Recognition rows

Enough to place the option and decide for or against it. Deliberately no setup or API content — if the answer is "use it", the official docs take over from here.

### CrewAI

- **What it is:** a framework for "orchestrating autonomous AI agents" (its own framing), pairing **Crews** — "teams of autonomous agents that collaborate to solve specific tasks" — with **Flows**, "structured, event-driven workflows that manage state and control execution" [6].
- **Wins when:** the problem decomposes naturally into role-holding collaborators and you want that shape out of the box rather than assembled; the docs' own guidance is to use both, Flows for structure and Crews for the collaborative sub-problems [6].
- **Loses when:** you need graph-level control over every transition, or the surrounding stack already standardizes elsewhere. Do **not** reject it on a "no durability" assumption: Flows persist state across restarts on a default SQLite backend and support resuming or forking from a snapshot [7]. On AWS it is a listed AgentCore Runtime framework [4].

### AutoGen — superseded

- **What it is:** Microsoft's multi-agent orchestration framework, now **succeeded by the Microsoft Agent Framework**, "the direct successor, created by the same teams", which combines "AutoGen's simple abstractions for single- and multi-agent patterns with Semantic Kernel's enterprise-grade features" and is "the next generation of both Semantic Kernel and AutoGen" [8]. AutoGen's maintainers state it "will still be maintained — it has a stable API and will continue to receive critical bug fixes and security patches — but we will not be adding significant new features to it" [9].
- **Wins when:** effectively only where AutoGen is already in production and migration is not yet scheduled — a stable API with security patches is a valid reason to defer, not to adopt [9].
- **Loses when:** anything greenfield. Start on the Microsoft Agent Framework (.NET, Python, and Go [8]); a migration guide from AutoGen is published alongside it [8].

## Selection heuristics

Apply in order — the first rule that decides, decides.

1. **Hosting constraint first.** Managed AWS runtime, your own process, or inside an existing app. It eliminates more options than any capability question, and AgentCore answers it without answering the framework question [4].
2. **AgentCore is a layer, not a row.** Ask "which framework" and "where does it run" separately, unless Harness's managed loop [4] removes the first question entirely.
3. **Buy the loop before authoring the graph.** `create_agent` [2] or Harness [4] first; move to LangGraph only when branching, parallelism, or custom control flow is a stated requirement [1].
4. **Long-horizon shifts the answer.** Once a run spans many steps and outgrows its context, the deciding features are planning, subagents, and compaction — Deep Agents' built-ins [3] — not raw graph control.
5. **Durability and HITL are framework-forcing.** Resuming after failure and mid-run human edits are LangGraph's stated capabilities [1] and are inherited by anything built on it [2][3].
6. **A recognition row is a placement, not a recommendation.** Use it to answer "should we adopt this", then hand off to that project's own docs.

### Worked example

*"Durable multi-step agent with human-in-the-loop, on AWS."*

| Step | Reading | Outcome |
|---|---|---|
| 1 — hosting | "on AWS", managed | AgentCore Runtime, which does not constrain the framework [4] |
| 2 — is the loop bought? | "multi-step" with named approval points, not open-ended | Harness's single-call loop [4] gives up the branching control the checkpoints imply — keep the framework question open |
| 3 — control and durability | "durable" and "human-in-the-loop" are both stated requirements | LangGraph: resuming from where it left off, plus inspecting and modifying state mid-run [1] |

**Result:** LangGraph authored by you, deployed on AgentCore Runtime — two answers to two questions, per heuristic 2. If the approval points turn out to be a single confirm-before-write, revisit heuristic 3: `create_agent` inherits the same durability and HITL [2] for less authoring.

## Sources

1. LangGraph overview — https://docs.langchain.com/oss/python/langgraph/overview
2. LangChain overview (`create_agent`, middleware, built on LangGraph) — https://docs.langchain.com/oss/python/langchain/overview
3. Deep Agents overview — https://docs.langchain.com/oss/python/deepagents/overview
4. What is Amazon Bedrock AgentCore (core services table) — https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html
5. Claude Agent SDK overview — https://code.claude.com/docs/en/agent-sdk/overview
6. CrewAI introduction (Crews and Flows) — https://docs.crewai.com/en/introduction
7. CrewAI Flows (state management, persistence, resume and fork) — https://docs.crewai.com/en/concepts/flows
8. Microsoft Agent Framework overview (successor to AutoGen and Semantic Kernel) — https://learn.microsoft.com/en-us/agent-framework/overview/agent-framework-overview
9. AutoGen Update, microsoft/autogen discussion #7066 (maintenance posture) — https://github.com/microsoft/autogen/discussions/7066
