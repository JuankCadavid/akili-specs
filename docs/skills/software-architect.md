# `software-architect`

**Author:** Juan Carlos Cadavid — [jcadavid.com](https://jcadavid.com)

## Purpose

Makes the agent operate as a **senior software architect** during TRD and design work. Its differentiator is the **Decision Spine** — Scenario → Tactic → Tier & Style → Pattern → View & Record: non-functional requirements are captured as six-part, measurable quality-attribute scenarios (SEI format); tactics answer each scenario; a **robust-vs-lite gate** sizes the architecture (and therefore the infrastructure) with evidence; design patterns enter only bound to named problems; everything lands as C4 views and compact ADRs. Inspired by SEI's *Software Architecture in Practice* and *Documenting Software Architectures*, the C4 model (Simon Brown), the Refactoring.Guru pattern catalog, Clean/Hexagonal architecture, and Google Cloud's agentic AI guides.

## Use When

- `/akili-constitution` reaches **Step 5 (TRD)** — automatic, required; Step 6 (Infrastructure) derives its shape from the tier decision.
- `/akili-specify` Phase 2 designs an architecturally significant feature (new module/service, integration, data-flow, or NFR impact).
- The user asks for architecture review, NFR identification, stack sizing, or design-pattern guidance.

## Core Rules

- **No NFR without a measure** — every scenario ends in a testable response measure; "fast/secure/scalable" without numbers is banned output.
- **Minimum NFR sweep** — security, performance, scalability, availability always evaluated explicitly; "not architecturally significant" is valid, silence is not.
- **Start lite, escalate with evidence** — robust choices (microservices, polyglot data, multi-agent AI) require a scenario whose measure the lite option cannot meet, recorded as an ADR.
- **No pattern without a named problem** — each pattern cites the tactic it implements and the simpler alternative it beat.
- **Every diagram has a legend**; C4 Context + Container are the default view set.
- **Token frugality** — progressive disclosure via `references/` (NFR scenarios & tactics, architecture styles, design patterns, views & ADRs, agentic AI); conceptual designs only, no implementation code in documents.

## Backend Routing Matrix

It owns the backend routing matrix, `references/backend-routing.md`, which decides which skill leads each backend decision (its *Decision rule*, *Stack table*, *Matrix*, *Expertise cards* and *Backend route line* sections). Three named sources may lead when no skill is loaded for a decision: *existing design*, *the spec's scenarios* and *project conventions*. The matrix is read by path for any backend design, architecturally significant or not.

## Best Paired Commands

- `/akili-constitution` — runs the full spine in Step 5; hands the tier decision to Step 6.
- `/akili-specify` — feature-scale spine in Phase 2 `design.md`; its scenario→tactic→pattern traceability is what `judgment-day` audits.
- `/akili-test` — scenario response measures become non-functional test candidates.

## Source

- `../../.claude/skills/software-architect/SKILL.md`
