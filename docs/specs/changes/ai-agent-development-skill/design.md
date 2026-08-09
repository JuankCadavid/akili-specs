# Design: `ai-agent-development` Stack Skill

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/ai-agent-development-skill` |
| Depth | Standard |
| Status | Draft — Phase 2, revised after Judgment Day round 1 (fix-only, per user; see `judgment.md`) |
| Date | 2026-08-09 |
| Requirements | `requirements.md` FR-1…FR-6, NFR-1…NFR-2 |
| Fixes applied | CS-1, CS-2, CW-1…CW-6, S-1, S-2, S-3, JA-10…13, JB-11, JB-13, JB-14 |

## 2. Executive Summary

One skill directory with a thin `SKILL.md` (composition contract + deferral table + routing heuristic + reference index) and four `references/` files loaded per task. The selection matrix lives in a reference (full, dated, source-pinned); `SKILL.md` carries only a three-question routing heuristic. Wiring touches **three insertion points across two command files**, and **six documentation surfaces** (including the `docs/commands/akili-constitution.md` mirror discovered by judgment round 1, which supersedes the proposal §5 scope table). No code, no scripts, no new command.

## 3. Architecture Overview

The skill follows the packaged-skill content architecture of `gsap-animation` (one skill + `references/`, progressive disclosure):

- **Load-time layer (`SKILL.md`)** — what every load pays for: trigger scope and composition contract, a 3-question routing heuristic (Where does it run? · How much orchestration control? · What must survive restarts/HITL?), the runtime deferral table (FR-4), a maturity note (DD-5), and an index of references with when-to-read rules. The deferral table sits at load time because it must be visible even when no reference is opened — it is the boundary contract, not framework content (DD-3).
- **Task-time layer (`references/`)** — read only when the task matches: full selection matrix, LangGraph patterns, AKILI spec mapping, AWS hosting decision.
- **Wiring layer** — **three insertion points in two command files**: `/akili-constitution` Step 5 bootstrap list, `/akili-constitution` Step 8D Skill Map builder pool, `/akili-specify` Step 2.1 no-map fallback list — exercising governance carve-outs (1) and (2); carve-out (3) is not used.

## 4. Extended Directory Structure

| Path | Content | Approx size |
|---|---|---|
| `.claude/skills/ai-agent-development/SKILL.md` | Frontmatter, triggers/composition, routing heuristic, deferral table, maturity note, reference index | ≤150 lines (NFR-1 — deliberately stricter than the gsap precedent, which runs 183) |
| `references/framework-selection.md` | Full matrix (5 primary + CrewAI/AutoGen recognition rows), selection heuristics, `Last verified:` stamp, `## Sources` block | ~120 lines |
| `references/langgraph-patterns.md` | Decision-level LangGraph patterns: state design, nodes/edges vs prebuilt agents, durable execution, HITL interrupts, streaming, memory, subgraphs; `## Sources` block | ~180 lines |
| `references/akili-spec-mapping.md` | Behaviors/evals → `requirements.md` scenarios; graph/state/tools/**memory/HITL points** → `design.md`; eval tasks **with verification commands** + no-pass clauses → `tasks.md`; `## Sources` block | ~150 lines |
| `references/aws-deployment.md` | The agent-hosting **decision comparison only** (AgentCore Harness vs Lambda vs ECS trade-offs for agent workloads); implementation defers per §6; `## Sources` block | ~90 lines |
| `docs/skills/ai-agent-development.md` | Skill page: purpose, binding, references index, attribution — an index, not a duplicate | ~40 lines (precedent: 21–41) |

## 5. Data Model

The only "schema" is the frontmatter (original-authorship variant, FR-1):

| Field | Value |
|---|---|
| `name` | `ai-agent-development` |
| `description` | `Trigger:` keywords (agent development, agent architecture, LangGraph, LangChain, Deep Agents, Bedrock AgentCore, Claude Agent SDK, multi-agent, agent evals, framework selection) **+ what it does** (decision layer for building AI agents: framework selection, agent architecture, AKILI spec mapping; defers runtime detail) — governance format `"<trigger keywords + what it does>"` |
| `license` | MIT |
| `metadata.author` | Juan Carlos Cadavid — jcadavid.com |
| `metadata.inspired-by` | LangChain/LangGraph docs; AWS Bedrock AgentCore docs; Anthropic Agent SDK docs |
| `metadata.binding` | `stack` |
| `metadata.version` | `"1.0"` (quoted string, per schema `<preserved or 1.0>` — CS-1). Maturity is expressed in the body, not the version field |

**Negative constraint (FR-1 BUT):** the frontmatter must NOT carry `adapted-by`, `adapted-for`, or `source` — those denote adapted third-party skills. Authoring risk is real: most sibling skills carry them, so copy-paste from a sibling is the likely path; the schema diff at the HITL gate checks absence explicitly.

## 6. Composition & Deferral Contract

The skill's public contract has two parts:

- **Composition (not exclusion):** `ai-agent-development` owns framework **selection and architecture**; it composes with — never displaces — the skills owning operation. When a task matches both this skill and `claude-api`/`amazon-bedrock` (their triggers legitimately overlap on agent-shaped tasks), the precedence rule is: **decision questions load this skill first; operation questions load the runtime skill first; both may be loaded in one task.** No "must NOT fire" claim — matcher behavior cannot be contractually forbidden, only composed with (S-2).
- **Deferral table (FR-4):** availability is per-developer for **every** row, never assumed:

| Question | Route |
|---|---|
| Bedrock / AgentCore operation, Harness, guardrails config | `amazon-bedrock` *(when present; official AWS docs otherwise)* |
| Anthropic SDK, tool use, MCP | `claude-api` *(when present; official Anthropic docs otherwise)* |
| Lambda / ECS / API Gateway implementation of a chosen hosting | `aws-serverless` (packaged stack skill) — S-1: `aws-deployment.md` owns only the *choice between* hostings, never their implementation |
| Framework API signatures, version-specific detail | Pinned official docs (see each reference's `## Sources`) |

## 7. Content Module Design

| Module | Owns | Explicitly does NOT own |
|---|---|---|
| `SKILL.md` routing heuristic | The 3 questions that shortlist a framework before opening the matrix | Full trade-off rationale (matrix's job) |
| `framework-selection.md` | Dated matrix; win/lose conditions per row; recognition rows for CrewAI (role-based crews; wins on rapid role-play prototypes, loses on low-level control/durability) and AutoGen (row records succession by the Microsoft Agent Framework) | Operational guidance for recognition rows (FR-2 BUT) |
| `langgraph-patterns.md` | Architecture-level patterns and when each is warranted | API signatures, version-specific code |
| `akili-spec-mapping.md` | The methodology bridge (FR-3, complete): behavior contracts as scenarios; guardrails as `BUT` clauses; **graph/state/tools/memory/HITL points as `design.md` decisions**; evals as `tasks.md` tasks **with concrete verification commands** and no-pass clauses for nondeterministic output | Generic eval theory beyond what a specifier needs |
| `aws-deployment.md` | Hosting decision comparison (AgentCore Harness vs Lambda vs ECS) for agent workloads — the maintainer's differentiator | Bedrock runtime operation (→ `amazon-bedrock`); Lambda/ECS implementation (→ `aws-serverless`) |

**NFR-2 ownership (CW-4):** every `references/` file ends with a `## Sources` block of pinned official-docs links, and every factual framework claim in any file cites one. This is the design element that carries the substituted gate for the dominant defect class (technical misinformation); the HITL reviewer checks claims against the pinned sources.

**Unvalidated-claim marker (DD-5 mechanism, JB-13):** content not yet validated in a real build is prefixed inline with `> Unvalidated:` — a greppable convention (`grep -rn "> Unvalidated:"`), so the maturity boundary is auditable, not vibes.

## 8. Shared Contracts / Package Extensions

Wiring (three insertion points, two files):

- `/akili-constitution`: Step 5 bootstrap list **and** Step 8D Skill Map candidate pool.
- `/akili-specify`: Step 2.1 no-map fallback list.

Documentation surfaces (**six** — CW-1 reconciled; the mirror was discovered by judgment round 1 and supersedes the proposal §5 scope table):

| # | Surface | Change |
|---|---|---|
| 1 | `docs/skills/ai-agent-development.md` | New skill page |
| 2 | `docs/skills/README.md` | One truthful row with the table's real columns: Skill / **Binding** / Origin / Use For / Wired In |
| 3 | `docs/skills/governance.md` | Current-assignment `stack` row |
| 4 | `docs/commands/akili-constitution.md` | **Mirror** (CS-2): the closed stack-skill enumeration at its "Stack skills matching the repo" line gains the new skill |
| 5 | `README.md` | Skill list entry |
| 6 | `CHANGELOG.md` | Unreleased entry, release classified **minor** (new skill = new capability — CW-6) |

## 9. Design Decisions

| ID | Decision | Alternatives rejected | Rationale |
|---|---|---|---|
| DD-1 | One skill + 4 references (progressive disclosure) | Sibling skill family; single monolithic SKILL.md | Governance size rule; gsap-fusion precedent (8 siblings → 1 skill + references) |
| DD-2 | Matrix in a reference; `SKILL.md` carries only the 3-question routing heuristic + deferral table | Matrix in SKILL.md | NFR-1: the matrix is consulted at selection time, not on every load; the heuristic (~10 lines) covers the common case |
| DD-3 | The proposal's `runtimes.md` is rescoped/renamed to `aws-deployment.md`; the deferral table is promoted into `SKILL.md` (file count unchanged: 4 references before and after — S-3) | Keeping deferral content inside a `references/runtimes.md` per the proposal's file set | The deferral table is the skill's boundary contract and must be visible even when no reference is opened (a structural argument, not a usage claim — JA-12); the freed reference slot goes to the differentiated AWS content. Recorded as implementation discovery vs proposal |
| DD-4 | No `## AKILI-SPECS Integration` section in the skill body | Adding one | Governance: `stack` skills get none (MUDA). Reconciliation (JB-11): FR-3's methodology content is not an integration section — it is the skill's *subject matter*, and it lives at task-time in `references/akili-spec-mapping.md`, so no load pays for it; NFR-1 is preserved |
| DD-5 | `version: "1.0"` per schema; maturity expressed in the body — a one-line maturity note in `SKILL.md` plus the greppable `> Unvalidated:` inline marker | `version: 0.1` (violates the governance schema — CS-1); shipping unmarked guesses; omitting unvalidated content | An acknowledged maturity boundary is honest and auditable; the version field is not the place to express it |
| DD-6 | Matrix carries a `Last verified: <date>` stamp **and** a `## Sources` block; every reference carries `## Sources` (NFR-2 owner) | Undated / unpinned | FR-2 AND-IT-MUST + NFR-2; ecosystem churn makes undated, unpinned comparisons unverifiable |

**Step 2.3 reversion challenge:** not triggered — every DD adds; none removes, disables, or inverts delivered behavior.

## 10. Budget (Step 2.4)

| Metric | Estimate |
|---|---|
| Expected tasks | 6 |
| Expected LOC (markdown) | ~600–730 lines of new content (ceiling from §4 sizes: 150+120+180+150+90+40) + ~20 lines across the 8 edited files (2 command files, 6 doc surfaces — CW-3 reconciled) |
| Expected review rounds | 1 |

Depth re-check: estimates fit **Standard** (multi-file, multi-surface consistency, no code risk). No depth change.
