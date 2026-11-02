# Backend Routing Matrix

Used by every AKILI step that needs to know **which skill leads which backend decision**: `/akili-specify` (design and the task `Backend route:` line), the `/akili-execute` Leader (when two skills collide on a task) and the project `### Backend routing` block. This file is the one place where the matrix rows and the expertise cards live; every other surface names this file and a section of it, never a line number and never a copied row. It is read by path, without activating `software-architect`, for any backend design, significant or not. It decides routing only: it teaches no architecture, API, error or test method, and it recommends no skill for install.

## Decision rule

1. **The method skill decides what and why; the stack skill decides how in this language or framework.**
2. **One lead per activity and context.** Supporting skills give inputs, not rules.
3. **Context picks the row; the stack picks the support.** The architecturally significant test is `/akili-specify` Step 2.1's; Bug track sends diagnosis to `bug-diagnosis`; the stack comes from the project `## Skill Map`.
4. **Two named sources may lead** when no skill is loaded for the decision: *existing design* (the TRD and the nearest existing module) and *the spec's scenarios* (`requirements.md`, run through the `/akili-test` Tester contract) (DD-4).
5. **Decisions already in `design.md` bind the implement step.** A stack skill never reopens them; a conflict is a spec gap for the Pivot Protocol.
6. **Where two stack skills apply** (NestJS on AWS Lambda), the framework skill supports code inside the application and the platform skill supports the handler, event source and infrastructure; for `implement` the line names the one matching the code the task touches.
7. **A support idiom a stack lacks is skipped**, never substituted (a race detector outside Go).
8. **`tdd` is the Leader's to assign.** `test-first` applies only when the task's skills list `tdd`; otherwise `test-suite` applies.

## Stack table

The stack comes from the project `## Skill Map`.

| Stack (Skill Map) | Stack skill | Idiom it supplies |
|---|---|---|
| Go | `golang-pro` | goroutines and channels, interfaces, generics, `%w` wrapping, table-driven tests with `-race`, pprof, module layout (`references/project-structure.md`); no framework-choice text |
| NestJS | `nestjs-expert` | modules and DI, controllers, guards, interceptors, pipes, exception filters, Jest/Supertest, TypeORM/Mongoose, Passport |
| AWS serverless | `aws-serverless` | Lambda handler shape, API Gateway and SQS integration, SAM templates, cold-start anti-patterns |
| AI agent | `ai-agent-development` (decisions) + the runtime skill the Skill Map lists for the agent's runtime (implementation) | framework and runtime selection, hosting choice, agent state, tools, memory and HITL inputs; it does not own SDK usage or deployment (its *Scope & Composition*) |
| other | none — project conventions | — (falls through, below) |

Stack value `other` falls through explicitly: its `implement` row leads with *existing design* and `framework-selection` uses the non-agent rows (KZ-004). A support idiom a stack does not have (a race detector outside Go, cold starts outside Lambda) is skipped, never substituted (B-J-6).

## Matrix

The activity and the context pick the row; the stack picks the support. Each Lead cell names exactly one lead.

| Activity | Context | Lead | Support | Row rule |
|---|---|---|---|---|
| **architecture** | significant | `software-architect` | stack skill (feasibility, idiom); AI agent: `ai-agent-development` (state, tools, memory, HITL inputs) | The stack skill picks no style, NFR target or ADR |
| **architecture** | not significant | existing design | stack skill (idiom) | No new style is introduced |
| **framework-selection** | AI agent | `ai-agent-development` | `software-architect` (`agentic-ai.md` *Component Decision Axes*, NFR fit) | Includes the agent's hosting choice; the system's compute tier is `architecture` |
| **framework-selection** | other stacks, significant | `software-architect` | stack skill (idiom fit) | No packaged Go, NestJS or AWS skill states framework-choice criteria (B-J-5); changing the stack itself is `architecture` |
| **framework-selection** | other stacks, not significant | existing design | stack skill (idiom fit) | Keep the framework already in use |
| **module-design** | significant | `software-architect` | stack skill (layout: Go → `golang-pro` `references/project-structure.md`; NestJS modules) | The stack skill adds no pattern the design does not name |
| **module-design** | not significant | existing design | stack skill (idiom) | Follow the nearest existing module |
| **api-contract** | any | `api-design-principles` | stack skill (transport: Go handlers, Nest controllers, API Gateway) | The stack skill picks no resource model, versioning, status-code or error-body policy; for gRPC, `api-design-principles` leads versioning and compatibility only and proto idiom follows project conventions (P-15) |
| **error-model** | any | `error-handling-patterns` | stack skill (Go `%w` and no panic, Nest exception filters, Lambda error handling) | `error-handling-patterns` owns the handling philosophy, the error categories and recovery (circuit breaker, aggregation, graceful degradation); status codes and error body belong to `api-contract`; its language sections yield to the stack skill's MUST rules |
| **implement** | Go | `golang-pro` | method skills as constraints already in `design.md` | No decision recorded in `design.md` is reopened |
| **implement** | NestJS | `nestjs-expert` | method skills as constraints already in `design.md` | No decision recorded in `design.md` is reopened |
| **implement** | AWS serverless | `aws-serverless` | method skills as constraints already in `design.md` | No decision recorded in `design.md` is reopened |
| **implement** | AI agent | the agent's runtime skill (from the Skill Map; none → project conventions) | `ai-agent-development` (agent behavior constraints) | `ai-agent-development` writes no SDK or deployment code (B-J-6) |
| **implement** | other | existing design | none — project conventions | No skill is recommended for install |
| **test-first** | task lists `tdd`, Leader keeps it | `tdd` | stack skill (table-driven, `-race`, Jest/Supertest) | Expected values and seams come from `requirements.md` and `design.md`; a stack coverage target never overrides them or the Done criteria |
| **test-suite** | `tdd` not listed, or dropped by the Leader | the spec's scenarios | stack skill (runner idiom, race detector, fuzzing) | A coverage target never replaces scenario coverage |
| **bug-diagnosis** | Bug track or any failure | `systematic-debugging` | stack skill (pprof, race detector, Nest DI graph, Lambda logs) | No fix before root cause; a stack skill's root-cause list is a hypothesis, not a diagnosis |
| **performance** | significant | `software-architect` | stack skill (profiling, benchmarks, allocation, cold start) | The stack skill sets no target; optimization starts from a measured baseline |
| **performance** | not significant | existing design | stack skill (profiling, benchmarks) | Targets come from the TRD; none is invented |

## Expertise cards

One card per backend skill. Evidence names a file and an exact heading of that skill's own text.

| Skill | Expert at | Supports | Must not decide | Evidence |
|---|---|---|---|---|
| `software-architect` | Style, NFR scenarios, tactics, patterns, ADRs, robust-vs-lite sizing; agent patterns through its `agentic-ai.md` reference | framework-selection (AI agent) | Language or framework idiom | `software-architect/SKILL.md` → *The Decision Spine (the AKILI method)*; → *Routing — load the matching reference* |
| `api-design-principles` | REST and GraphQL resource model, versioning, pagination, error responses | error-model (wire format) | Transport implementation; framework | `api-design-principles/SKILL.md` → *3. API Versioning Strategies*; → *REST API Design Patterns*; → *GraphQL Design Patterns* |
| `error-handling-patterns` | Error-handling philosophies, error categories, circuit breaker, error aggregation, graceful degradation | none (lead) | Language idiom where a stack skill is assigned; status codes and error body | `error-handling-patterns/SKILL.md` → *Core Concepts*; → *Universal Patterns* |
| `tdd` | Red → green loop, seams, test anti-patterns | none (lead) | Whether it is assigned (the Leader's call); expected values (`requirements.md`) | `tdd/SKILL.md` → *Rules of the loop*; → *Seams — where tests go*; → *Anti-patterns* |
| `systematic-debugging` | Root cause before fix, four phases | none (lead) | The fix's design beyond the root cause | `systematic-debugging/SKILL.md` → *The Iron Law*; → *The Four Phases* |
| `nestjs-expert` (stack) | Nest modules, DI, controllers, guards, testing with Jest/Supertest, TypeORM/Mongoose, Passport | every other row on NestJS (leads `implement`) | Architecture decisions, testing strategy, debugging method (its description claims them) | `nestjs-expert/SKILL.md` → *Domain Coverage* |
| `golang-pro` (stack) | Concurrency, interfaces, generics, error wrapping, profiling with pprof, table-driven tests with `-race`, module layout | every other row on Go (leads `implement`) | Architecture (its *Core Workflow* step 1), framework choice, coverage targets, error categories | `golang-pro/SKILL.md` → *Core Workflow*; → *MUST DO*; → *Reference Guide* |
| `aws-serverless` (stack) | Lambda handler, API Gateway, SQS patterns, serverless anti-patterns and sharp edges | every other row on AWS serverless (leads `implement`) | Whether the system is serverless (`architecture`); framework choice | `aws-serverless/SKILL.md` → *Patterns*; → *Anti-Patterns*; → *⚠️ Sharp Edges* |
| `ai-agent-development` (stack) | Agent framework and runtime selection, hosting choice, agent state, tools, memory, HITL | architecture (agent inputs), implement (agent behavior constraints); leads `framework-selection` for agents | Overall system style and NFRs (`software-architect`); SDK usage and deployment code | `ai-agent-development/SKILL.md` → *Scope & Composition* |

Stack skills reach agents only through the project `## Skill Map` and per-task skill lists; no command text load-directs one.

## Backend route line

Every backend task carries one line in its Scope:

`Backend route: stack <stack>; <activity> lead <lead> support <support>[; <activity> lead <lead> support <support>]`

| Field | Values | Source |
|---|---|---|
| Stack | `Go` · `NestJS` · `AWS serverless` · `AI agent` · `other` (a project may hold several; the line names the stack of the code the task touches) | project `## Skill Map` / `### Backend routing` |
| Activity | The activities of the *Matrix* section, only those the task touches. Tests: `test-first` only when the task's skills list `tdd`, else `test-suite` | the spec's own `design.md` |
| Lead | A skill name, or one of the two named sources (*existing design*, *the spec's scenarios*) | matrix row for (activity, context) |
| Support | Skill name(s) or `none — project conventions` | matrix row + *Stack table* |

A backend task is one whose scope touches server-side code, an API contract, an error model or backend tests. Its skill list names exactly the backend skills the line names; other skills are unaffected.

**`tdd` ownership.** Specify only *recommends* `tdd` by listing it; the Leader decides (`leader.md` item 3). When the Leader adds `tdd`, the brief reads the line's `test-suite` entry as `test-first lead tdd`; when it drops `tdd`, `test-first` reads as `test-suite lead the spec's scenarios`. Either switch is the existing one-line deviation record in `execution.md`, so the line and the list never disagree silently.

## Go layering

Go package layering routes to `golang-pro` → `references/project-structure.md`. `architecture-styles.md` maps Node.js/TypeScript only; a Go mapping there is a recorded follow-up.

## Absent file

When `backend-routing.md` is absent (an install older than this change, kept by the skip policy), the specify and Leader pointers proceed as today and say so once.

## Attribution

Original AKILI-SPECS reference by Juan Carlos Cadavid — jcadavid.com (MIT). It routes to skills authored elsewhere (`api-design-principles`, `error-handling-patterns`, `tdd`, `systematic-debugging`, `nestjs-expert`, `golang-pro`, `aws-serverless`), each under its own license. This file contains no text from them; it names their headings only.
