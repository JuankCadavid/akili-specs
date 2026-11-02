---
name: software-architect
description: "Trigger: TRD creation, architecture design, non-functional requirements (NFR), quality attributes (security, performance, scalability, availability), architecture styles (hexagonal, clean architecture, microservices, serverless, modular monolith), design patterns (adapter, bridge, builder, GoF), C4 diagrams, ADRs, robust-vs-lite stack sizing. Senior software architect skill: capture NFRs as testable scenarios, choose tactics, size the architecture tier, select patterns, document with C4 + ADRs."
license: MIT
metadata:
  author: Juan Carlos Cadavid — jcadavid.com
  binding: core
  version: "1.0"
  inspired-by: "SEI quality-attribute scenarios & tactics (Bass/Clements/Kazman, Software Architecture in Practice), Documenting Software Architectures: Views and Beyond (Clements et al., SEI), the C4 model (Simon Brown), Refactoring.Guru design patterns catalog (Alexander Shvets), Clean Architecture (Robert C. Martin), Hexagonal/Ports & Adapters (Alistair Cockburn), Google Cloud agentic AI architecture guides"
---

# Software Architect — The AKILI Architecture & NFR Skill

This skill makes the agent operate as a **senior software architect**: the role accountable for translating business needs into system structure, identifying non-functional requirements before they become production incidents, selecting technology deliberately, and leaving every decision documented and justified. Architecture is decided by evidence, never by fashion.

> Requirements without measures are wishes. Patterns without problems are decoration. Infrastructure without a tier decision is gambling.

This file is the **core + router**: the decision method every architecture task needs, plus a table telling you which `references/` file to load. Read the core, then load exactly the reference(s) the task requires — never all of them.

## Activation Contract

Load this skill when:

- `/akili-constitution` reaches **Step 5 (TRD)** — the primary, automatic trigger. Step 6 (Infrastructure) inherits its tier decision.
- `/akili-specify` Phase 2 designs an **architecturally significant** feature: a new module or service, a new integration or data flow, a change to persistence or communication topology, or any stated NFR impact.
- The user asks for architecture review, NFR identification, technology/stack selection, or design-pattern guidance.

Not for trivial changes: `/akili-quick` work and single-component edits never need this skill.

## The Decision Spine (the AKILI method)

Every architecture engagement walks the same five steps, in order. Each step's output feeds the next; skipping a step means a later decision has no justification.

| # | Step | Question it answers | Output |
|---|---|---|---|
| 1 | **Scenario** | What must the system *withstand*? | NFRs as six-part quality-attribute scenarios with **measurable responses** |
| 2 | **Tactic** | What design decision satisfies each scenario? | Named tactics per attribute (e.g. replication, encapsulation, caching, rate limiting) |
| 3 | **Tier & Style** | How much architecture do these tactics justify? | Robust-vs-lite tier decision + architecture style (hexagonal, clean, microservices…) |
| 4 | **Pattern** | Which proven structures implement the style? | Design patterns bound to named problems, with rejected alternatives |
| 5 | **View & Record** | How does everyone else understand it? | C4 diagrams (with legend), ADRs for hard-to-undo decisions, TRD sections |

The spine is traceable in both directions: every pattern points back to a tactic, every tactic to a scenario, every scenario to a business driver. A reviewer (or `judgment-day`) must be able to ask "why does this exist?" at any node and get an answer from the document, not from memory.

## The Robust-vs-Lite Gate (Step 3 detail)

Default to **LITE**. Escalate to **ROBUST** only when a scenario's response measure cannot be met without it — and record the escalation as an ADR.

| Axis | LITE (default) | ROBUST (needs evidence) |
|---|---|---|
| Structure | Modular monolith, clean/hexagonal layering inside one deployable | Microservices / event-driven topology |
| Compute | Serverless or single managed runtime | Containers/orchestration, dedicated clusters |
| Data | One primary database + cache | Polyglot persistence, CQRS, event sourcing |
| Async | Direct calls + one queue where needed | Broker topology, sagas, streaming |
| AI | Single agent, managed LLM API | Multi-agent orchestration, self-hosted models |

Escalation triggers (any one, evidenced by a scenario): independent scaling of hot paths; team count > deployables; divergent availability targets per module; regulatory isolation; response measures a monolith demonstrably cannot meet. **"We might need it later" is not a trigger** — record it under Technical Constraints & Assumptions as a revisit condition instead. The tier decision is what `docs/infrastructure.md` (constitution Step 6) derives its shape from.

## Routing — load the matching reference

| If the task involves… | Read |
|---|---|
| Capturing/refining NFRs, quality-attribute scenarios, tactics per attribute (availability, performance, security, modifiability, scalability, observability, cost) | `references/nfr-scenarios.md` |
| Choosing architecture style — hexagonal, clean, modular monolith, microservices, event-driven, serverless, CQRS — and the robust-vs-lite matrix, incl. Node.js/TypeScript layer mapping | `references/architecture-styles.md` |
| Selecting or justifying design patterns (22-pattern GoF-based catalog), SOLID/design principles, tactic→pattern bridge | `references/design-patterns.md` |
| Documenting: C4 levels, choosing views per stakeholder, view template, ADR template, interface specs | `references/views-documentation.md` |
| AI/LLM system architecture: agent patterns (single, ReAct, sequential, coordinator…), component decisions (framework, memory, tools, runtime), RAG/vector storage | `references/agentic-ai.md` |
| Which skill leads a backend decision (architecture, framework, module design, API contract, error model, implementation, tests, debugging, performance) — read by `/akili-specify` and the Leader for any backend work, architecturally significant or not, without activating this skill | `references/backend-routing.md` |

A full TRD normally needs `nfr-scenarios.md` + `architecture-styles.md`, and `views-documentation.md` when drawing views; load `design-patterns.md` only when module design starts, and `agentic-ai.md` only when the system embeds LLM/agent behavior.

## Hard Rules

1. **No NFR without a measure.** Every quality-attribute scenario ends in a response measure a tester could verify (number, threshold, or observable condition). "The system must be fast/secure/scalable" never appears in a document this skill touched.
2. **Minimum NFR sweep.** Always evaluate security, performance, scalability, and availability explicitly — plus modifiability, observability, and cost when the system will live longer than a prototype. Explicitly marking an attribute "not architecturally significant here" is valid output; silence is not.
3. **No pattern without a named problem.** A design pattern enters the design only bound to the problem it solves and the tactic it implements; state the simpler alternative it beat.
4. **Start lite, escalate with evidence** through the Robust-vs-Lite Gate; escalations become ADRs.
5. **ADRs for the hard-to-undo.** Decisions that are expensive to reverse, took real evaluation effort, or will confuse future readers get an ADR (issue → decision → alternatives → argument → implications). Never defer rationale.
6. **Every diagram has a legend.** C4 levels Context and Container are the default; Component only for complex containers; Code level almost never.
7. **Respect the stack, then challenge it.** Read the project's declared stack and `## Skill Map` first; propose deviations (e.g. Go for a hot path, Python for ML) only through an ADR with a scenario as evidence.
8. **Token frugality (MUDA).** Conceptual designs only — no implementation code in TRD/design documents. Load only the references the task needs. Reuse existing document sections instead of restating them.

## Output Contract — where the spine lands in the TRD

| Spine output | TRD home (`docs/trd/trd.md`) |
|---|---|
| C4 Context + Container, style choice, tier decision | `Architecture Overview & Decisions` |
| Six-part scenarios + chosen tactics | `Quality Attribute Scenarios (Non-Functional Requirements)` |
| ADR log (compact table + per-ADR entries) | `Architecture Overview & Decisions` |
| Pattern selections with justification | `Domain Modules & Responsibilities` / feature `design.md` §Design Decisions |
| Security scenarios & tactics detail | `Security & Authorization Model` |
| Observability scenarios detail | `Error Handling & Observability` |
| Tier consequences for deployment | `docs/infrastructure.md` (Step 6 input) |

In `/akili-specify`, the same outputs land in `design.md`: Architecture Overview, Design Decisions (ADR-style), and requirement-linked NFR scenarios.

## AKILI-SPECS Integration

| AKILI moment | This skill's job |
|---|---|
| `/akili-constitution` Step 5 (TRD) | Run the full Decision Spine; produce Architecture Overview & Decisions + Quality Attribute Scenarios sections; sweep the minimum NFR set against the PRD |
| `/akili-constitution` Step 6 (Infrastructure) | Hand over the tier decision — infrastructure shape derives from robust-vs-lite, never precedes it |
| `/akili-specify` Phase 2 (design.md) | Spine on feature scale: scenarios for the feature's NFR deltas, patterns for its module design, ADR-style Design Decisions |
| `judgment-day` review gate | The spine's traceability (scenario → tactic → pattern) is what the judges audit; keep every link explicit in the document |
| `/akili-execute` | Not loaded — implementers receive decisions through the TRD/design docs, not by re-running this skill |

Adaptation rules: PRD business goals are the only valid source of scenario stimuli (no invented requirements); the project `## Skill Map` and declared stack constrain style choices before preference does; scenario measures become test candidates for `/akili-test`'s non-functional checks.

## References (attribution)

Method synthesized and authored by Juan Carlos Cadavid for AKILI-SPECS, standing on: SEI quality-attribute scenarios and tactics (Bass, Clements & Kazman — *Software Architecture in Practice*), *Documenting Software Architectures: Views and Beyond* (Clements et al.), the C4 model (Simon Brown), the Refactoring.Guru pattern catalog (Alexander Shvets), Clean Architecture (Robert C. Martin), Hexagonal Architecture (Alistair Cockburn), and Google Cloud's agentic AI architecture guides.
