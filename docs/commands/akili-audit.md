# `/akili-audit`

Detect and report drift between the project's specifications (PRD, UX/UI Design, TRD) and the actual implementation in the codebase.

## Usage

```text
/akili-audit
```

## Behavior

The command performs a four-step audit:

1. **Read Project Specifications** — reads `docs/prd.md`, `docs/ux-ui/design.md`, `docs/trd/trd.md`, and any active specs in `docs/specs/`. Non-spec directories are carved out and never read as a spec: `archive/`, `general-setup/`, `quick/`, `kaizen/`, `audits/`, plus any family container. `audits/` matters most here — it holds this command's own prior reports, which are audit output and never audit input.
2. **Scan Active Codebase** — extracts API surfaces, database schemas, UI components, modules, and dependencies using CodeGraph (if available) or standard file search.
3. **Compare Documentation vs. Codebase Reality** — identifies discrepancies across six categories:
   - Stale Specification (documented but missing in code)
   - Undocumented Feature (in code but missing from docs)
   - Visual/Design Token Mismatch
   - Technical Constraints Violation
   - Agent Guide Drift
   - Phase→Tier Drift (project's phase→tier mapping vs. the packaged default, with a divergence-acceptance record so deliberate choices don't re-report)
4. **Write Drift Report** — writes one report file per audit run under `docs/specs/audits/`, creating the directory if needed.

## Output

```text
docs/specs/audits/drift-<YYYY-MM-DD>[-<safe-branch>][-N].md
```

Separators are single hyphens. `<YYYY-MM-DD>` is the same date written into the report's `Date of Audit` header. The branch slug is the current branch through the `$SAFE_NAME` rule (`/` → `--`), added when the current branch is **not** the default branch and also when the default branch cannot be resolved — an extra suffix never collides, a missing one can; the default branch is the `Default Branch:` line pinned in the constitution summary of the root `AGENTS.md`/`CLAUDE.md`, and no pin means unresolved. `[-N]` (`-2`, `-3`, …) is added only when the filename already exists, so a same-day re-run never overwrites an earlier report.

**Reading reports back.** The most recent report is the one with the highest `Date of Audit` header *inside* the report files, ties broken by the newest filename in lexical order — never filesystem mtime, which a checkout destroys. Legacy `docs/specs/drift-report.md` is a permanent read fallback, used only when `docs/specs/audits/` holds no report file at all (a scaffolded `README.md` or `.gitkeep` is not a report). The command never modifies, overwrites, or deletes that legacy file.

The report includes:

- **Overall Conformance Score** (percentage)
- **Executive Summary**
- **Identified Discrepancies** categorized by priority (High / Medium / Low)
- **Conformance Matrix** mapping spec sections to code reality
- **Recommended Next Steps**

The command's own verification checklist confirms **this run's** report file under `docs/specs/audits/` exists, is non-empty, and carries a conformance score plus the date of audit. A legacy `docs/specs/drift-report.md` left in place by an older run never satisfies that item.

## When To Run

- After major implementation milestones
- Before `/akili-archive` to verify spec alignment
- When onboarding to an existing project to assess documentation health
- Periodically to prevent specification rot

## Skills

`systematic-debugging` applies when discrepancies suggest implementation bugs rather than documentation gaps.

## Source

- `.claude/commands/akili-audit.md`
