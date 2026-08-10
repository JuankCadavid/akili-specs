# LangGraph Patterns — When Each Is Warranted

Last verified: 2026-08-10

Read this **after** LangGraph is the chosen runtime — `references/framework-selection.md` owns the choice, this file owns what you do with it. Every section answers three questions: what the pattern buys, when it earns its cost, and when it is overkill. No API signatures or version-specific code; those route to the pinned docs per the skill's deferral table. Bracketed numbers resolve in `## Sources`.

The through-line: **these features are priced, not free.** Each costs authoring effort, latency, or an operational surface — a database, a stream consumer, a waiting human. Adopt one because a stated requirement forces it, not because the framework offers it.

## Decision index

| Pattern | Adopt when | Skip when |
|---|---|---|
| Reducers on state keys | Two writers can touch one key in a step | One writer per key, sequential graph |
| Separate input/output schema | The caller's contract is narrower than the working state | Internal state *is* the contract |
| Authored graph over prebuilt loop | Branching, parallelism, or steps that must not be a model decision | One tool-calling loop already fits |
| Durable checkpointing | A run must survive process death, or a human pauses it | Sub-second request/response, retry is cheaper |
| Interrupts | Action is irreversible or externally visible | The action is cheap to undo |
| Streaming | A user waits on the run | Batch, or the consumer is another program |
| Long-term memory (store) | Facts must outlive the thread | A tool call to the system of record is authoritative |
| Subgraphs | Separate ownership, separate context, or reuse | Encapsulation for tidiness alone |

## 1. State: design it before the graph

State is "the shared memory accessible to all nodes in your agent" [2], and its schema "will be the input schema to all `Nodes` and `Edges` in the graph" [1]. Getting it wrong is the expensive mistake here, because every node signature and every eval assertion is downstream of it.

Four decisions, in order:

| Decision | Rule | Failure it prevents |
|---|---|---|
| Field ownership | Name the single writer of each key | Two nodes silently overwriting each other |
| Reducer per key | Default behavior replaces the value; a reducer merges instead [1] | Parallel branches or fan-out losing all but one write |
| Raw vs formatted | Store raw data, not formatted text, so each node formats for its own use [2] | Presentation choices frozen into shared state |
| Schema surface | Constrain input/output schemas as subsets of a richer internal state [1]; keep node-to-node data on private channels [1] | A public contract that leaks working scratch space |

**Reducers earn their cost the moment concurrency is possible** — parallel branches, or map-reduce fan-out where "a first node may generate a list of objects, and you may want to apply some other node to all those objects" [1]. On a linear graph with one writer per key they are ceremony.

Two caveats worth designing around: private channels "are not redacted when streaming" in full-state mode [1], so privacy of internal keys is a streaming decision, not a schema one; and the state shape you publish becomes the eval seam — `references/akili-spec-mapping.md` owns why evals must assert on that seam rather than on nodes.

## 2. Prebuilt agent loop vs nodes and edges you author

Start from the prebuilt agent — a "minimal, highly configurable harness" [12] — and drop to an authored graph only when one of these is a stated requirement:

- Control flow genuinely branches or runs in parallel, rather than looping over tool calls.
- A step must be deterministic, not a model decision (validation against a closed list, a mandatory post-processing pass).
- You need named boundaries for checkpointing, approval, or observability at a granularity the loop does not expose.

When you do author it, the division of labor is that "nodes do the work, edges tell what to do next" [1]: static edges for fixed sequence, conditional edges whose routing function picks the next node from state [1]. A node can also return a combined state-update-plus-route, but the docs warn: "Do not mix normal edges and dynamic routing from the same node, because both paths can execute and make graph behavior harder to reason about" [1]. Pick one routing mechanism per node and hold to it.

Budget the loop explicitly. Execution is capped at a recursion limit — 1000 steps by default — beyond which the run raises a recursion error [1]. That ceiling is a crash, not a policy; if the behavior can legitimately iterate, set a lower limit and decide what the graph does when it hits it.

> Unvalidated: the mixed shape — a prebuilt agent as one node inside an authored graph — is the natural reading of both APIs and is how most "mostly a loop, but with two deterministic steps" designs should land. It has not been validated in a build here; confirm the state-schema translation at the node boundary before committing a design to it.

## 3. Durable execution

Durability is the reason most teams choose LangGraph at all, and it is one decision plus one dial.

**The decision:** a checkpointer, which "saves a snapshot of graph state at each super-step, organized into threads" [4]; checkpoints land at node boundaries [2]. Threads plus checkpoints are what enable conversation continuity, human-in-the-loop workflows, time travel, and fault tolerance [3].

**The dial:** how often that snapshot is actually written [4].

| Mode | Behavior | Buy it when |
|---|---|---|
| `sync` | Persists synchronously before the next step starts | Losing a step is worse than the write latency — money moves, tickets are filed |
| `async` | Persists asynchronously while the next step runs | Default posture: good durability, small crash-loss window |
| `exit` | Persists only when execution exits | Long runs where intermediate recovery is not needed — you accept no mid-run recovery |

Two design consequences follow, and both are easy to miss:

- **The node boundary is your recovery granularity.** A node performing three side effects is atomic to the checkpointer but not to the world; on replay all three happen again. Split nodes at the side effects you cannot afford to repeat.
- **Storage is a real operational surface.** In-memory checkpointers lose everything on restart and are for experimentation; Postgres-backed checkpointing is the production recommendation [4], and long threads accumulate checkpoints, so retention is a decision you make now or inherit later [3]. On a managed agent server the platform handles this for you [4].

**Time travel** is the durability layer's debugging affordance: replay a past execution, or fork from a prior checkpoint with modified state to explore an alternative path [11]. Note that a state update "does **not** roll back a thread. It creates a new checkpoint that branches from the specified point. The original execution history remains intact" [11] — so it is an investigation and what-if tool, not an undo button for production state.

## 4. Human-in-the-loop interrupts

An interrupt pauses the graph, saves state through the persistence layer, and "waits indefinitely until you resume execution" [5]. It requires a checkpointer — a durable one in production — and a thread ID so the runtime knows which state to resume [5]. Interrupts are therefore not an alternative to §3; they are a feature of it.

Four shapes, each warranted by a different risk [5]:

| Shape | Warranted when |
|---|---|
| Approval before a critical action | The action is irreversible or externally visible (payments, writes to a system of record) |
| Review and edit model output or a tool call | The output is high-stakes but a human edit is cheaper than a rejection loop |
| Review inside the tool itself | Only *some* calls of a tool are risky, so the gate belongs at the call, not the node |
| Input validation loop | A required value must be well-formed before the run can continue |

**The caveat that shapes the design:** on resume, "the node restarts from the beginning of the node where the interrupt was called ... so any code before the interrupt runs again" [5]. Anything before the interrupt must be idempotent [5]. In practice that means putting the pause in a small node that does nothing but ask, with the side effect on the far side of it. Two further rules from the docs: do not wrap the interrupt in a try/except block, and where a node raises several interrupts, their order matters because resume values are matched by index [5].

Interrupts are overkill when the guarded action is cheap to undo — the pause costs a human round-trip on every run, and the spec side of that trade (what the human sees; what happens on approve, reject, edit, and timeout) is `references/akili-spec-mapping.md`'s `design.md` row.

> Unvalidated: an approval gate on a high-volume, low-variance action tends to degrade into a rubber stamp, which is worse than no gate because it manufactures an audit trail nobody read. Treat this as a design caution to test against your own volume, not a measured finding.

## 5. Failure routing — pick the handler by who can fix it

Retry-everything is the default that quietly burns budget and hides real defects. The useful discrimination is *who is capable of fixing this failure*, and the docs' own framing splits four ways [2]: transient infrastructure errors take an automatic retry; errors the model can recover from loop back with the error as context; problems only a person can resolve pause via an interrupt; and unexpected errors propagate so they are visible in debugging rather than absorbed.

| Failure | Handler | Why not the neighbouring choice |
|---|---|---|
| Network blip, rate limit | Bounded retry at the node | A model retry wastes tokens re-reasoning about an infrastructure fact |
| Malformed tool arguments, schema violation | Loop back with the error in state | A blind retry repeats the same wrong call; a human gate is too slow for a self-correctable error |
| Missing permission, ambiguous instruction, bad data | Interrupt (§4) | Neither retries nor the model can supply what only a person knows |
| Unhandled exception | Propagate | Absorbing it produces a run that looks successful and is not |

Two design notes carry across all four. Retries interact with §3: a retried node replays whatever it already did, so a retry policy on a node with side effects is only safe if those effects are idempotent. And the self-correction loop needs a stop condition of its own — the recursion ceiling [1] is a crash, not a budget, so cap the correction attempts in state and decide explicitly what the graph does when the cap is reached.

## 6. Streaming

Streaming is a UX decision with an architectural tail: pick the projection that matches what the consumer must render, not the one with the most data [6].

| Mode | Emits | Reach for it when |
|---|---|---|
| `values` | Full state after each step | The consumer re-renders from whole state — but note private keys are not redacted here [1] |
| `updates` | State updates after each step, streamed separately | Progress UI that appends; the safer default for user-facing output |
| `messages` | LLM tokens with metadata | Token-by-token typing effect in a chat surface |
| `custom` | Arbitrary data emitted from inside nodes or tools | A long tool needs to report progress the state does not model |
| `checkpoints` / `tasks` / `debug` | Checkpoint events, task start/finish with results and errors, or both plus metadata | Operator and debugging views; `checkpoints` and `tasks` require a checkpointer |

Nested graphs are opt-in: subgraph output is included only when you ask for it, and nested events carry a namespace identifying their source path [6]. If a user reports "the agent went quiet," a subgraph running without that flag is the first thing to check.

Skip streaming entirely for batch runs and program-to-program calls. It adds a consumer contract you then have to keep stable across graph edits.

## 7. Memory

Memory splits cleanly by lifetime, and the split is also a data-retention decision.

| Layer | Scope | Warranted when | Cost |
|---|---|---|---|
| Short-term (checkpointer) | One thread [3][8] | Any multi-turn interaction | Context growth; checkpoint accumulation |
| Long-term (store) | Across threads and sessions, as namespaced JSON documents [9] | A fact must be recalled in a *later* session | A retention surface, and staleness |

Short-term memory's real problem is not storage but context: a full history "may not fit inside an LLM's context window," and even when it fits, models "get 'distracted' by stale or off-topic content, all while suffering from slower response times and higher costs" [8]. Three managed remedies, in increasing cost: trim messages to the recent window, delete messages permanently while keeping the sequence valid, or summarize earlier history and replace it with the summary [8]. Choose by what the later turns actually need — trimming is free and lossy, summarizing costs a model call and preserves the thread of the conversation.

Long-term memory is where teams over-build. Before adding a store, ask whether a tool call to the system of record would be more authoritative than a remembered copy; if it would, the store is a staleness generator. Memory categories (semantic, episodic, procedural) are useful for naming what you are keeping [9], not a mandate to implement all three. "No long-term memory" is a legitimate design decision — `references/akili-spec-mapping.md` requires it to be recorded as one rather than left implicit.

## 8. Subgraphs and multi-agent boundaries

A subgraph is "a graph that is used as a node in another graph" [7] — encapsulation, with two communication modes to choose between [7]:

- **Shared state keys:** add the compiled subgraph directly as a node; it reads and writes the parent's channels. Lower ceremony, tighter coupling.
- **Different schemas:** invoke the subgraph inside a node function that translates state in both directions. More code, and the right shape when the subgraph needs its own message history — the common multi-agent case [7].

Subgraphs are warranted for genuinely independent ownership (teams can work against the interface without knowing the internals), for context isolation, and for reuse of a node set across graphs [7]. They are not warranted as decoration: a subgraph adds a state-translation boundary and a debugging hop.

On persistence, the parent's checkpointer is inherited, which is what makes interrupts and state inspection work inside a subgraph [7] — a subgraph is not a way to escape the durability decisions of §3.

**Before splitting into multiple agents, note the docs' own caution:** "not every complex task requires this approach — a single agent with the right (sometimes dynamic) tools and prompt can often achieve similar results" [10]. The cases that do justify it are a single agent with too many tools to choose well among, work needing specialized knowledge with long domain-specific prompts, and enforced sequential constraints [10]. The architectures on offer — subagents invoked as tools, handoffs, on-demand skills, a routing step, or a custom workflow — trade against each other on model calls, accumulated context, and latency [10]. Multi-agent is a context-management tactic first; treat any org-chart metaphor as a coincidence, not a reason.

## Sources

Verified live 2026-08-10. Note: `docs.langchain.com/oss/python/langgraph/durable-execution` currently serves the Persistence page, so durability-mode claims are pinned to Checkpointers below, which states them.

1. LangGraph Graph API overview (state schemas, reducers, private channels, nodes/edges, conditional routing, fan-out, routing warning, recursion limit) — https://docs.langchain.com/oss/python/langgraph/graph-api
2. Thinking in LangGraph (nodes as discrete steps, state as shared memory, checkpoints at node boundaries) — https://docs.langchain.com/oss/python/langgraph/thinking-in-langgraph
3. Persistence (checkpointer vs store, what persistence enables, checkpoint accumulation) — https://docs.langchain.com/oss/python/langgraph/persistence
4. Checkpointers (super-step snapshots and threads, implementations, durability modes, managed server) — https://docs.langchain.com/oss/python/langgraph/checkpointers
5. Interrupts (pause/resume, requirements, HITL patterns, node re-execution and idempotency caveats) — https://docs.langchain.com/oss/python/langgraph/interrupts
6. Streaming (stream modes and what each emits, subgraph streaming, custom emissions) — https://docs.langchain.com/oss/python/langgraph/streaming
7. Subgraphs (definition, use cases, communication modes, checkpointer inheritance, state inspection) — https://docs.langchain.com/oss/python/langgraph/use-subgraphs
8. Short-term memory (thread scope, context-window problem, trim/delete/summarize) — https://docs.langchain.com/oss/python/langchain/short-term-memory
9. Long-term memory (cross-thread persistence, namespaced JSON store, memory types) — https://docs.langchain.com/oss/python/langchain/long-term-memory
10. Multi-agent (when a single agent suffices, when multi-agent is warranted, architectures and their trade-offs) — https://docs.langchain.com/oss/python/langchain/multi-agent
11. Time travel (replay and fork, branch-not-rollback semantics) — https://docs.langchain.com/oss/python/langgraph/use-time-travel
12. LangChain overview (`create_agent` as a minimal configurable harness) — https://docs.langchain.com/oss/python/langchain/overview
