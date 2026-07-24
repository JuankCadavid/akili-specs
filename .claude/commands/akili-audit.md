---
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

**Model checkpoint:** This phase runs best on **T4 Context-Ingest** for the scan and **T3 Auditor** for judging drift — recommend the deeper tier's model since the judging is where quality is decided. If the project's `## Model Routing` registry (root `AGENTS.md`/`CLAUDE.md`) maps those tiers to a model different from the current session model, tell the user in one line — e.g. *"This phase is T4+T3 — the registry recommends `/model opus` (T3 judging; `sonnet` suffices for the scan); you are on haiku"* — and offer to switch (`/model …` in Claude Code, the model selector in OpenCode) at the first approval pause. Never block on this; continuing on the current model is always allowed.

First, read the constitutional documentation baseline in the repository:

1. `docs/prd.md`
2. `docs/ux-ui/design.md` (legacy fallback: `docs/system-design/design.md`)
3. `docs/trd/trd.md` (legacy fallback: `docs/detailed-design/detailed-design.md`)
4. Any active specs in `docs/specs/` that are not yet archived.

### Step 1: Scan Active Codebase

Perform codebase analysis (preferring CodeGraph if `.codegraph/` exists, or utilizing Grep, Glob, and file structures) to extract:

1. **API Surfaces & Services:** Active REST/GraphQL endpoints, controllers, and domain services.
2. **Database Schemas & Models:** Active database tables, ORM entities, and schema migrations.
3. **UI Components & Pages:** Actual directory structure of frontend views, components, and design tokens.
4. **Key Modules & Dependencies:** Registered packages, external integrations, and package manifest frameworks.

### Step 2: Compare Documentation vs. Codebase Reality

Audit for discrepancies, classifying findings under the following categories:

* **Stale Specification (Documentation > Codebase):** Features, API endpoints, views, or database fields documented in the specs/TRD but completely missing or commented out in the codebase.
* **Undocumented Feature (Codebase > Documentation):** Modules, API endpoints, major components, or integrations added to the codebase but completely missing from the PRD, UX/UI Design, or TRD.
* **Visual/Design Token Mismatch:** Colors, typography, spacing, or component structures used in the codebase that violate the styling tokens and design principles declared in `docs/ux-ui/design.md`.
* **Technical Constraints Violation:** Architectural layout in the codebase that conflicts with patterns (e.g. testing requirements, security rules, file structuring) documented in `docs/trd/trd.md`.
* **Agent Guide Drift:** Modules whose conventions clearly diverge from the root but lack a child `CLAUDE.md`/`AGENTS.md`, child guides missing from the parent's `## Module Guides` index, guide entries pointing at modules that no longer exist, or root-guide structure descriptions that no longer match the codebase.
* **Model Registry Drift:** The project's `## Model Routing` registry (root `AGENTS.md`/`CLAUDE.md`) names models the host tool no longer offers, uses dated model pins where a floating alias exists (violating the alias-first rule) without a recorded reason, is missing tiers or the author ≠ auditor note versus the packaged default in `docs/model-routing.md`, or the Step 8E agent wrappers (`.claude/agents/akili-*.md` / OpenCode agent config) declare models that contradict the registry. Report only — never edit the registry or wrappers during the audit.

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

## Recommended Next Steps
Specific actions to resolve the discrepancies (e.g., "Run `/akili-constitution` to enhance baseline", "Update `trd.md` with active REST APIs", or "Schedule a task to implement missing validation tests").
```

### Step 4: Report to User

Summarize the conformance score, key discrepancies found, and recommended remediation paths. Ask the user whether they would like to:
1. Fix documented specs (update baseline docs in place).
2. Schedule task specs to implement missing functionality in the code.
3. Keep the report for review.

---

## Authorship

AKILI-SPECS methodology by **Juan Carlos Cadavid** — [jcadavid.com](https://jcadavid.com). Licensed under the MIT License.
