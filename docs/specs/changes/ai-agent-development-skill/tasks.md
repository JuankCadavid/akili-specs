# Tasks: `ai-agent-development` Stack Skill

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/ai-agent-development-skill` |
| Depth | Standard |
| Status | Draft — Phase 3 |
| Date | 2026-08-09 |
| Budget (from design §10) | 6 tasks · ~600–730 new lines + ~20 edited · 1 review round |

## 2. Task List

### T1 — Author `SKILL.md` (load-time layer)

| Field | Value |
|---|---|
| Status | [x] complete (PASS attempt 1 — see execution.md) |
| Size | M |
| Dependencies | none |
| Requirements | FR-1 (scenario + BUT + AND IT MUST), FR-4 (both scenarios; BUT no-vendor; AND IT MUST official-docs substitute), NFR-1 |
| Design | §3 load-time layer, §5 data model, §6 composition & deferral contract, DD-2/DD-3/DD-5 |
| Skills | `cognitive-doc-design` |

**Scope:** `.claude/skills/ai-agent-development/SKILL.md` — frontmatter per design §5, composition/precedence contract (S-2 wording), 3-question routing heuristic, 4-row deferral table (incl. `aws-serverless` row), maturity note + `> Unvalidated:` convention declaration, reference index with when-to-read rules.

**Verification:**
- `wc -l` ≤ 150 (NFR-1). *Disqualifier:* trimming content into the references to pass the count while breaking the load-time contract (deferral table or composition rule moved out) is a fail, not a pass.
- Frontmatter field-by-field diff against `docs/skills/governance.md` schema (original-authorship variant) at the HITL gate — including **absence** of `adapted-by`/`adapted-for`/`source` (FR-1 BUT) and quoted `version: "1.0"`.
- `grep -c` deferral table rows = 4; `grep '"1.0"'` hits frontmatter.
- *Presence-assertion limits:* greps prove structure exists, not that the routing heuristic routes correctly — that behavioral check is T6's dry-run plus the human gate.

**Done:** file exists, all greps pass, HITL schema diff clean.

### T2 — Author `references/framework-selection.md`

| Field | Value |
|---|---|
| Status | pending |
| Size | M |
| Dependencies | none (parallel-safe with T1, T3–T5) |
| Requirements | FR-2 (both scenarios; BUT no-operational-guidance; AND IT MUST dated), NFR-2 |
| Design | §4 row 2, §7 module table, DD-6 |
| Skills | `cognitive-doc-design` |

**Scope:** dated selection matrix — 5 primary rows (LangGraph, Deep Agents, LangChain, Bedrock AgentCore, Claude Agent SDK) + 2 recognition rows (CrewAI; AutoGen with Microsoft Agent Framework succession note), each with what-it-is / wins-when / loses-when; selection heuristics; `Last verified: 2026-08-09`; `## Sources` block.

**Verification:**
- `grep` for all 7 framework names, `Last verified:`, `## Sources`.
- Recognition rows contain no setup/API content — human check at gate (no grep can classify "operational").
- Every factual claim carries a source link (NFR-2) — human check against the pinned sources. *Disqualifier:* a claim whose pinned source does not actually state it is misinformation, not coverage; flag `> Unvalidated:` or remove.

**Done:** greps pass; gate review confirms recognition-level restraint and source grounding.

### T3 — Author `references/langgraph-patterns.md`

| Field | Value |
|---|---|
| Status | pending |
| Size | M |
| Dependencies | none (parallel-safe) |
| Requirements | FR-2 (LangGraph primary row decidable in depth), NFR-1, NFR-2 |
| Design | §4 row 3, §7 module table |
| Skills | `cognitive-doc-design` |

**Scope:** decision-level patterns: state design, nodes/edges vs prebuilt agents, durable execution, HITL interrupts, streaming, memory, subgraphs — each with when-warranted conditions; no API signatures or version-specific code; `## Sources` block.

**Verification:** `grep '## Sources'`; human check: zero code blocks with API calls (a conceptual diagram/table is fine); unvalidated patterns flagged. *Disqualifier:* content restating LangGraph docs verbatim is vendoring, not curation.

**Done:** file complete, gate review clean.

### T4 — Author `references/akili-spec-mapping.md`

| Field | Value |
|---|---|
| Status | [x] complete (PASS attempt 1 — see execution.md) |
| Size | M |
| Dependencies | none (parallel-safe) |
| Requirements | FR-3 (scenario + AND IT MUST no-pass eval gates), NFR-2 |
| Design | §4 row 4, §7 module table (complete FR-3 set), DD-4 reconciliation |
| Skills | `cognitive-doc-design`, `tdd` (eval-gate framing) |

**Scope:** the methodology bridge — behaviors/evals → `requirements.md` GIVEN/WHEN/THEN scenarios with guardrails as `BUT` clauses; graph/state/tools/**memory/HITL points** → `design.md` decisions; evals → `tasks.md` tasks **with concrete verification commands** and explicit no-pass clauses for nondeterministic output; worked mini-example (one agent behavior traced through all three documents); `## Sources` block.

**Verification:** grep for `memory`, `HITL`, `no-pass`, `## Sources`; human check that the worked example's eval task genuinely states a disqualifier. *Disqualifier:* an example eval gate that passes on exit-0 alone contradicts the file's own teaching — fail.

**Done:** FR-3's full artifact set present; gate review clean.

### T5 — Author `references/aws-deployment.md`

| Field | Value |
|---|---|
| Status | pending |
| Size | S |
| Dependencies | none (parallel-safe) |
| Requirements | FR-4 (BUT no-vendor honored in content), NFR-2 |
| Design | §4 row 5, §6 deferral rows (S-1 boundary), §7 module table |
| Skills | `cognitive-doc-design`, `aws-serverless` (boundary awareness only) |

**Scope:** hosting **decision comparison only** — AgentCore Harness vs Lambda vs ECS for agent workloads (state persistence, execution duration, cold start, cost shape, HITL wait patterns); explicit hand-off lines to `amazon-bedrock` (operation) and `aws-serverless` (implementation); `## Sources` block.

**Verification:** grep for both hand-off skill names and `## Sources`; human check: no runtime configuration/operation content. *Disqualifier:* any Bedrock API/config walkthrough is vendoring the environment skill's territory — remove, don't trim.

**Done:** comparison table complete, boundaries explicit, gate review clean.

### T6 — Wiring, documentation surfaces, changelog

| Field | Value |
|---|---|
| Status | pending |
| Size | M |
| Dependencies | T1–T5 (docs describe final content) |
| Requirements | FR-5 (scenario + BUT), FR-6 (scenario + AND IT MUST) |
| Design | §3 wiring layer, §8 (three insertion points; six-surface table) |
| Skills | `cognitive-doc-design` |

**Scope:** 3 insertion points (`akili-constitution` Step 5 bootstrap + Step 8D pool; `akili-specify` Step 2.1 fallback) and the 6 surfaces from design §8, including the `docs/commands/akili-constitution.md` mirror and the CHANGELOG entry classified **minor**.

**Verification:**
- `grep -rn "ai-agent-development" .claude/commands/` — every hit inside carve-outs (1)/(2); zero unconditional "load" directives (FR-5 BUT).
- `grep -l "ai-agent-development" docs/skills/ai-agent-development.md docs/skills/README.md docs/skills/governance.md docs/commands/akili-constitution.md README.md CHANGELOG.md` → 6/6 hits; `binding`/`stack` consistent in all (FR-6 AND IT MUST).
- `test -f` sweep over every path referenced by the new files (broken-link defect class).
- Dry-run behavioral check: read `akili-constitution` Step 5/8D and `akili-specify` Step 2.1 as an agent would — the skill appears as a *candidate*, not a directive.
- *Disqualifier:* a surface hit whose text contradicts another surface (e.g. different binding) is drift, not coverage.

**Done:** all greps 6/6 and carve-out-clean; CHANGELOG entry present with **minor** stated.

## 3. Coverage Map (scenario/clause level — KZ-001 rule)

| Requirement scenario / clause | Owning task |
|---|---|
| FR-1 scenario + BUT (no adapted fields) + AND IT MUST (trigger keywords) | T1 |
| FR-2 "Primary options decidable" + AND IT MUST (dated) | T2 (LangGraph depth: T3) |
| FR-2 "Common alternatives recognizable" + BUT (no operational guidance) | T2 |
| FR-3 scenario + AND IT MUST (no-pass eval gates) | T4 |
| FR-4 "Environment skill present" | T1 (deferral table) |
| FR-4 "Environment skill absent" + BUT (no vendor) + AND IT MUST (docs substitute) | T1 (table) · T5 (content honors boundary) |
| FR-5 scenario + BUT (no unconditional load) | T6 |
| FR-6 scenario + AND IT MUST (consistent binding) | T6 |
| NFR-1 (≤150 SKILL.md; references sized per §4) | T1 (cap) · T2–T5 (sizes) |
| NFR-2 (pinned sources) | T2, T3, T4, T5 (`## Sources` each) |

No orphan scenarios or clauses; no gap discharged by citing a different requirement.

## 4. Estimate & Delivery Strategy

- **Estimated LOC:** ~600–730 new markdown lines + ~20 edited (within design budget).
- **Delivery:** this repo releases direct-to-master (no PR flow): one commit series — content tasks T1–T5, then T6, then the release commit via `npm run release:minor`. Although the line count exceeds the ~400-LOC PR guidance, splitting is wrong here: FR-6 requires all inventory surfaces in the **same change**, and a half-shipped skill (content without wiring) is dead weight per governance acceptance box 2.
- **Parallelization:** T1–T5 are mutually independent (5-way parallel-safe); T6 is the serial tail.

## 5. Recommended First Task

T1 (`SKILL.md`) — it fixes the skill's contracts (composition, deferral, maturity convention) that T2–T5 must stay consistent with.
