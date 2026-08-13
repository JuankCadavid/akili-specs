---
name: akili-audit
description: Run spec-to-code drift auditing to detect differences between active codebase reality and the active UX/UI design and TRD.
license: MIT
metadata:
  author: Juan Carlos Cadavid (jcadavid.com)
---

# Audit AKILI Specifications for Drift

Detect and report drift between the project's specifications (PRD, UX/UI Design, and TRD) and the actual implementation in the codebase.

## Usage

```
/akili-audit
```

## Behavior

### Step 0: Read Project Specifications

**Model checkpoint:** This phase runs best on **T4 Context-Ingest** for the scan and **T3 Auditor** for judging drift — recommend the deeper tier's model since the judging is where quality is decided. If the project's `## Model Routing` registry (root `AGENTS.md`/`CLAUDE.md`) maps those tiers to a model different from the current session model, check the direction first — the registry is a floor, not a ceiling: if the session model is the stronger one (e.g. a newer generation than a stale entry), pass silently and flag the registry entry for update instead of recommending a downgrade. Only when the registry model is stronger for this tier, tell the user in one line — e.g. *"This phase is T4+T3 — the registry recommends `/model opus` (T3 judging; `sonnet` suffices for the scan); you are on haiku"* — and offer to switch (`/model …` in Claude Code, the model selector in OpenCode) at the first approval pause. Never block on this; continuing on the current model is always allowed.

First, read the constitutional documentation baseline in the repository:

1. `docs/prd.md`
2. `docs/ux-ui/design.md` (legacy fallback: `docs/system-design/design.md`)
3. `docs/trd/trd.md` (legacy fallback: `docs/detailed-design/detailed-design.md`)
4. Any active specs in `docs/specs/` that are not yet archived.

### Step 1: Scan Active Codebase

Perform codebase analysis (preferring CodeGraph if `.codegraph/` exists, or utilizing Grep, Glob, and file structures) to extract:

**CodeGraph check — offer it, do not just use it if present.** Drift auditing is the phase that benefits most from the graph: it asks *what exists in the code* across API surfaces, schemas, components and modules at once, which is exactly the question a graph answers cheaply and `grep` answers expensively and partially. So mirror `/akili-constitution`'s handling rather than silently falling back: if `.codegraph/` **does not** exist and the `codegraph` CLI is available, **ask the user whether to run `codegraph init -i` before scanning**. Never block the audit on it — a declined or unavailable graph proceeds on `Glob`/`Grep` as before. If the CLI is **not installed**, tell the user in one line how to fix that permanently — *"CodeGraph CLI not found — install with `npm install -g @colbymchenry/codegraph` (then `codegraph init -i`) for a higher-confidence audit; continuing on `Glob`/`Grep`"* — because an unavailable state nobody names is one the user can never remediate. And **absence changes the tool, never the scope**: every Step 2 drift category is still swept, at full depth, via `Glob`/`Grep` — a missing graph makes the scan more expensive, not smaller. Record which of the four states applied (used / offered and declined / unavailable / not applicable) in the report's **Code Graph Used** field, because a scan done without the graph has a different confidence profile and the conformance score should not be read as if it did not.

1. **API Surfaces & Services:** Active REST/GraphQL endpoints, controllers, and domain services.
2. **Database Schemas & Models:** Active database tables, ORM entities, and schema migrations.
3. **UI Components & Pages:** Actual directory structure of frontend views, components, and design tokens.
4. **Key Modules & Dependencies:** Registered packages, external integrations, and package manifest frameworks.

**Delegation Thresholds (scout scan):** Apply the *Delegation Thresholds* from `.agents/leader.md` to this scan — when a single extraction above requires reading **4+ full source files**, delegate it to a scout/Explore subagent per area (API, schema, UI, modules) and judge drift from their conclusions in Step 2. CodeGraph lookups do not count toward the threshold. This keeps the T3 drift-judging context clean of raw file dumps.

### Step 2: Compare Documentation vs. Codebase Reality

Audit for discrepancies, classifying findings under the following categories:

* **Stale Specification (Documentation > Codebase):** Features, API endpoints, views, or database fields documented in the specs/TRD but completely missing or commented out in the codebase.
* **Undocumented Feature (Codebase > Documentation):** Modules, API endpoints, major components, or integrations added to the codebase but completely missing from the PRD, UX/UI Design, or TRD.
* **Visual/Design Token Mismatch:** Colors, typography, spacing, or component structures used in the codebase that violate the styling tokens and design principles declared in `docs/ux-ui/design.md`.
* **Technical Constraints Violation:** Architectural layout in the codebase that conflicts with patterns (e.g. testing requirements, security rules, file structuring) documented in `docs/trd/trd.md`.
* **Agent Guide Drift:** Modules whose conventions clearly diverge from the root but lack a child `CLAUDE.md`/`AGENTS.md`, child guides missing from the parent's `## Module Guides` index, guide entries pointing at modules that no longer exist, or root-guide structure descriptions that no longer match the codebase.
* **Persona injection bleed:** scan-derived project context repeated across all four `.agents/*.md` personas instead of scoped to the role that consumes it (`/akili-constitution` Step 8B → *Injection scope*). Because Safe Update never overwrites an existing persona, a project scaffolded before that table was added keeps the bloat indefinitely — so this is report-only but worth raising: personas are re-read on **every** subagent spawn, and each extra copy is a place the test command, lint command, or token path can go stale silently. The two clearest tells: a design-token path in `tester.md` (which explicitly does not audit tokens), and directory boundaries **missing** from `leader.md` (which needs them to judge task independence). Remediation is a manual trim, never an overwrite.
* **Model Registry Drift:** The project's `## Model Routing` registry (root `AGENTS.md`/`CLAUDE.md`) names models the host tool no longer offers, uses dated model pins where a floating alias exists (violating the alias-first rule) without a recorded reason, is missing tiers or the author ≠ auditor note versus the packaged default in `docs/model-routing.md`, or the Step 8E agent wrappers (`.claude/agents/akili-*.md` / OpenCode agent config / `.agents/agents/akili-*/agent.md`) declare models that contradict the registry. Report only — never edit the registry or wrappers during the audit.
* **Antigravity wrapper gaps (silent — the harness degrades without erroring):** the project carries `.agents/*.md` personas but no `.agents/agents/` wrappers, so **Antigravity cannot see the personas at all** — it discovers agents one level deeper, and the run silently falls back to an unprimed generic agent. Also flag a wrapper missing **`subagent: true`** (it exists but the Leader can never reach it via `invoke_subagent`), a Reviewer or Implementer without `mainAgent: false` (they leak into the primary-agent picker as selectable main agents), and a Reviewer whose `tools` list grants write access — the one host where read-only can be *enforced* rather than merely instructed. Every failure in this group is quiet: nothing errors, the loop just stops being the loop.
* **Missing host column (high impact):** the registry carries fewer host columns than the packaged default — typically because it was scaffolded from a single tool and the others were dropped instead of placeholdered. **The registry belongs to the project, not to the session that wrote it**: a missing column leaves any future session in that host with nothing to read, and silently breaks its Step 8E wrappers and every command's model checkpoint. Flag the absent column and name the packaged defaults that would restore it; the fix is `<CONFIRM SLUG>` placeholders, never a deleted column.
* **Tier/model mismatch:** a model sits in a tier whose dominant demand it does not serve — a small-context model in **T4 Context-Ingest**, a non-vision model in **T6 Multimodal**, a slow deep-reasoner in the high-volume **T2** fan-out, or T2 and T3 resolving to the same model (breaking `author ≠ auditor`). Compare each entry against the tier definitions and the *Why these models* rationale in `docs/model-routing.md` rather than against the slugs alone: the registry can be perfectly well-formed and still route a phase to a model that cannot do the job. Adjacent tiers swapped with each other is the common shape.
* **Model Generation Drift:** Aliases absorb a new model generation silently, so the *registry* can be perfectly current while everything calibrated around it has gone stale. Flag, without editing: (a) a **frontier escalation pin** whose recorded reason predates the current `opus` generation — each generation narrows the gap the pin was bought to close, so it needs re-justification against the alias at `xhigh`/`max`; (b) an **`Updated:` stamp older than the current model generation**, meaning the effort defaults were never swept for it (`docs/model-routing.md` → *Effort dial* → re-baseline rule); and (c) `.agents/*.md` personas that have drifted structurally from their packaged sources — the templates under `akili/templates/` in the active tool's config root, probing both the home-directory root and its `--local` project-root variant (that same config root sitting under the project instead of the home directory) and stopping at the first hit, `--local` first since it is the one actually governing this project when both are present — resolved per `/akili-constitution` Step 8B — a section, step, or guardrail the packaged template carries and the deployed persona lacks; a template with no deployed persona at all, flagged as absent; a persona with no packaged template to compare against, left unscored rather than counted as drift; or, if the packaged template root cannot be resolved at all, the sub-check reported **unevaluated** with the reason rather than letting that failure collapse into the unscored branch. The **Delegation Ceiling** in `leader.md` and the both-directions **Scope Discipline** in `implementer.md` are the highest-signal worked examples of this shape, not the closed set the comparison is limited to — a guardrail the templates gain tomorrow is caught the same way, without ever being named here. Remediation stays a manual trim or merge, never an overwrite.
* **Phase→Tier Drift:** Compare every phase→tier assignment in the project's `## Model Routing` registry (root `AGENTS.md`/`CLAUDE.md`) against the packaged `docs/model-routing.md`'s canonical mapping and report every difference — the local registry, its mirror, and the Step 8E wrappers all agreeing with each other is not conformance; a project can be entirely self-consistent and still be running a phase on the wrong tier. A phase present in only one source — local with no packaged counterpart, or packaged with no local entry — counts as a difference in its own right: report it naming which side is missing, never silently absorbed into "no finding" and never guessing a tier value for the missing side. Resolve the packaged mapping by walking this order, stopping at the first hit and recording which source answered: (a) the packaged `docs/model-routing.md` — probe `./node_modules/akili-specs/docs/model-routing.md`, then each package manager's global root separately (`npm root -g` **and** `pnpm root -g`, since pnpm keeps its own global tree and probing only npm misses it); (b) if (a) finds nothing, the installed command files' own Model checkpoints, with search roots **derived from `bin/akili.js`'s `TOOL_REGISTRY`** rather than a hand-written list here — for every configured host, probe both its home-directory root and its `--local` project-root variant, stopping at the first hit, `--local` first since it is the one actually governing this project when both are present; (c) if neither resolves, report this category **unevaluated** with the reason, and name it that way in the Conformance Matrix rather than letting the absence read as a pass. Each finding states the phase, the local tier, the packaged tier, and the packaged rationale for that tier cited by file and line so it can be judged without opening another file, plus which resolution source answered and its confidence — a table hit from (a) outranks prose parsed from (b). Priority follows the packaged tier: a difference on a phase the packaged default marks **T1** or **T3** is High, since those phases gate downstream quality; every other difference is Medium. Report only: never edit the registry, the mirror, or a wrapper; never declare the project wrong, only the difference and its upstream reasoning, leaving the verdict to the maintainer; and never emit a "checked, all good" entry into Identified Discrepancies for a matching phase — a drift report lists drift, not confirmations. A project may accept a divergence deliberately by adding a blockquote to its registry carrying the fixed marker ``> **Accepted divergence:** `<phase>` runs on `<tier>` instead of packaged `<packaged-tier>` — <reason>. (accepted <YYYY-MM-DD>)`` — only a line matching that marker exactly counts as a record; a line that merely resembles it is ordinary prose, so a malformed record still surfaces as an unexplained divergence rather than silently acquitting one. Where a matching record exists, compare **both** of its stored values against current reality: its stated `<tier>` against the project's current local tier, and its stated `<packaged-tier>` against the packaged tier resolved above. Both still matching, the phase produces no finding; either has drifted, the record no longer matches what it was written against and the phase is re-reported like any unrecorded divergence. A record silences only the phase it names — every other diverging phase is still reported — and no divergence is ever treated as accepted merely because a previous audit reported it and said nothing more; the audit itself never writes, edits, or removes an acceptance line, only the maintainer does.

### Step 3: Write Drift Report

Create or update (writing per `cognitive-doc-design`: lead with the verdict, tables over prose):

```text
docs/specs/drift-report.md
```

The Drift Report must follow this format:

```markdown
# AKILI Drift Audit Report

- **Date of Audit:** YYYY-MM-DD
- **Code Graph Used:** Yes/No
- **Overall Conformance Score:** X% (An evaluation of how closely the docs match the code)

## Executive Summary
A brief overview of the codebase alignment state and major areas of specification drift.

## Identified Discrepancies

### 🔴 High Priority (Breaking/Critical)
- **[Discrepancy Name]:** Description of what is documented vs. what is coded.
  - **Affected Spec File:** [link text](file:///absolute/path/to/spec)
  - **Affected Code File:** [link text](file:///absolute/path/to/code)
  - **Remediation:** Action needed (either update code or update docs).

### 🟡 Medium Priority (Inconsistencies/Gaps)
- ...

### 🟢 Low Priority (Style/Cleanups)
- ...

## Conformance Matrix

| Spec Section | Code Reality Status | Alignment Status | Notes |
| :--- | :--- | :--- | :--- |
| Product Requirements (PRD) | [Details] | [Aligned / Drifted] | |
| UX/UI Design / Screen Inventory | [Details] | [Aligned / Drifted] | |
| TRD (APIs/DB) | [Details] | [Aligned / Drifted] | |
| Agent Guides (root + `## Module Guides` index) | [Details] | [Aligned / Drifted] | |
| Model Routing (registry + Step 8E wrappers) | [Details] | [Aligned / Drifted] | |
| Methodology Conformance (Phase→Tier Drift + `:59(c)` persona structural check) | [Details] | [Aligned / Drifted / Unevaluated] | |

## Recommended Next Steps
Specific actions to resolve the discrepancies (e.g., "Run `/akili-constitution` to enhance baseline", "Update `trd.md` with active REST APIs", or "Schedule a task to implement missing validation tests").
```

### Step 4: Report to User

Summarize the conformance score, key discrepancies found, and recommended remediation paths. Ask the user whether they would like to:
1. Fix documented specs (update baseline docs in place).
2. Schedule task specs to implement missing functionality in the code.
3. Keep the report for review.

---

## Verification Checklist

Before presenting the summary, confirm each of these. Report any that fail rather than closing the command silently.

- [ ] `docs/specs/drift-report.md` exists, is non-empty, and carries a conformance score plus the date of audit.
- [ ] **The `Code Graph Used` field states which of the four states applied** — used, offered and declined, unavailable, or not applicable. A scan run without the graph is legitimate; a scan that never says so lets its conformance score be read with a confidence it did not earn.
- [ ] Every discrepancy names both its **spec file** and its **code file**, with a remediation direction (change the code, or change the doc).
- [ ] All drift categories in Step 2 were actually swept — including the ones with no findings, which are reported as clean rather than omitted. **A category silently skipped and a category with nothing to report look identical in the output**, which is what makes the omission free. For Phase→Tier Drift and the `:59(c)` persona check, that clean signal is the Conformance Matrix's **Methodology Conformance** row — a matching phase is never an entry in Identified Discrepancies, which stays silent on a match per that category's own "no checked, all good" rule.
- [ ] The Conformance Matrix covers every row, including **Agent Guides**, **Model Routing**, and **Methodology Conformance**.
- [ ] **Nothing was edited.** This command is report-only: no registry, no Step 8E wrapper, no persona, no baseline doc, no code. Remediation is the user's call in Step 4 and belongs to a later command.

---

## Authorship

AKILI-SPECS methodology by **Juan Carlos Cadavid** — [jcadavid.com](https://jcadavid.com). Licensed under the MIT License.
