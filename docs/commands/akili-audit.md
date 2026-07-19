# `/akili-audit`

Detect and report drift between the project's specifications (PRD, UX/UI Design, TRD) and the actual implementation in the codebase.

## Usage

```text
/akili-audit
```

## Behavior

The command performs a four-step audit:

1. **Read Project Specifications** — reads `docs/prd.md`, `docs/ux-ui/design.md`, `docs/trd/trd.md`, and any active specs in `docs/specs/`.
2. **Scan Active Codebase** — extracts API surfaces, database schemas, UI components, modules, and dependencies using CodeGraph (if available) or standard file search.
3. **Compare Documentation vs. Codebase Reality** — identifies discrepancies across five categories:
   - Stale Specification (documented but missing in code)
   - Undocumented Feature (in code but missing from docs)
   - Visual/Design Token Mismatch
   - Technical Constraints Violation
   - Agent Guide Drift
4. **Write Drift Report** — creates or updates `docs/specs/drift-report.md`.

## Output

```text
docs/specs/drift-report.md
```

The report includes:

- **Overall Conformance Score** (percentage)
- **Executive Summary**
- **Identified Discrepancies** categorized by priority (High / Medium / Low)
- **Conformance Matrix** mapping spec sections to code reality
- **Recommended Next Steps**

## When To Run

- After major implementation milestones
- Before `/akili-archive` to verify spec alignment
- When onboarding to an existing project to assess documentation health
- Periodically to prevent specification rot

## Skills

`systematic-debugging` applies when discrepancies suggest implementation bugs rather than documentation gaps.

## Source

- `.claude/commands/akili-audit.md`
