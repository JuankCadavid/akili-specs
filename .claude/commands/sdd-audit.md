---
description: Run spec-to-code drift auditing to detect differences between active codebase reality and active system/detailed designs.
---

# Audit JCSPECS Specifications for Drift

Detect and report drift between the project's specifications (PRD, System Design, and Detailed Design) and the actual implementation in the codebase.

## Usage

```
/sdd-audit
```

## Behavior

### Step 0: Read Project Specifications

First, read the constitutional documentation baseline in the repository:

1. `docs/prd.md`
2. `docs/system-design/design.md`
3. `docs/detailed-design/detailed-design.md`
4. Any active specs in `docs/specs/` that are not yet archived.

### Step 1: Scan Active Codebase

Perform codebase analysis (preferring CodeGraph if `.codegraph/` exists, or utilizing Grep, Glob, and file structures) to extract:

1. **API Surfaces & Services:** Active REST/GraphQL endpoints, controllers, and domain services.
2. **Database Schemas & Models:** Active database tables, ORM entities, and schema migrations.
3. **UI Components & Pages:** Actual directory structure of frontend views, components, and design tokens.
4. **Key Modules & Dependencies:** Registered packages, external integrations, and package manifest frameworks.

### Step 2: Compare Documentation vs. Codebase Reality

Audit for discrepancies, classifying findings under the following categories:

* **Stale Specification (Documentation > Codebase):** Features, API endpoints, views, or database fields documented in the specs/detailed-design but completely missing or commented out in the codebase.
* **Undocumented Feature (Codebase > Documentation):** Modules, API endpoints, major components, or integrations added to the codebase but completely missing from the PRD, System Design, or Detailed Design.
* **Visual/Design Token Mismatch:** Colors, typography, spacing, or component structures used in the codebase that violate the styling tokens and design principles declared in `docs/system-design/design.md`.
* **Technical Constraints Violation:** Architectural layout in the codebase that conflicts with patterns (e.g. testing requirements, security rules, file structuring) documented in `docs/detailed-design/detailed-design.md`.

### Step 3: Write Drift Report

Create or update:

```text
docs/specs/drift-report.md
```

The Drift Report must follow this format:

```markdown
# JCSPECS Drift Audit Report

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
| System Design / Screen Inventory | [Details] | [Aligned / Drifted] | |
| Detailed Technical Design (APIs/DB) | [Details] | [Aligned / Drifted] | |

## Recommended Next Steps
Specific actions to resolve the discrepancies (e.g., "Run `/sdd-constitution` to enhance baseline", "Update `detailed-design.md` with active REST APIs", or "Schedule a task to implement missing validation tests").
```

### Step 4: Report to User

Summarize the conformance score, key discrepancies found, and recommended remediation paths. Ask the user whether they would like to:
1. Fix documented specs (update baseline docs in place).
2. Schedule task specs to implement missing functionality in the code.
3. Keep the report for review.
