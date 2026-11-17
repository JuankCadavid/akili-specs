# `/akili-audit`

Detect and report drift between the project's specifications (PRD, UX/UI Design, TRD) and the actual implementation in the codebase.

## Usage

```text
/akili-audit
/akili-audit design [<url|path>]
/akili-audit modern-web [<path>]
```

`design` mode evaluates the design of an existing product instead of auditing drift: it loads `impeccable-bridge`, runs Impeccable `critique`/`audit` and the detector through the bridge's detector gate, and writes `docs/specs/audits/design-<YYYY-MM-DD>[-<safe-branch>][-N].md`, or the user-directed path, with P1/P2/P3 findings, each routed to `/akili-quick` or `/akili-propose`. When no Impeccable skill is found it falls back to `ui-ux-pro-max` + `frontend-design`; when the engine is not ready the detector rows read `Unevaluated`.

`modern-web` mode is opt-in (it runs only when you type it) and report-only: it inventories web UI source that modern platform guidance could replace, through Modern Web Guidance's `legacy-scan`, behind the bridge's gate (Node 22 or newer, your consent, an exact pinned version, telemetry and file logging off). It writes `docs/specs/audits/modern-web-<YYYY-MM-DD>[-<safe-branch>][-N].md` with the pin, the path scanned, the gate state, the kept and dropped counts, the coverage caveat and each kept finding routed to `/akili-quick` or `/akili-propose`; a gate state other than `ready` is recorded as `not run: <state>` and never fails, stops or blocks the audit. Findings never become tasks of a running spec. See [`impeccable-bridge`](../skills/impeccable-bridge.md#modern-web-guidance-environment-provided).

## Behavior

The command performs a four-step audit:

1. **Read Project Specifications** — reads `docs/prd.md`, `docs/ux-ui/design.md`, `docs/trd/trd.md`, and any active specs in `docs/specs/`. Non-spec directories are carved out and never read as a spec: `archive/`, `general-setup/`, `quick/`, `kaizen/`, `audits/`, `reviews/`, plus any family container. `audits/` matters most here — it holds this command's own prior reports, which are audit output and never audit input.
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

**Reading reports back.** The most recent report is the one with the highest `Date of Audit` header *inside* the `drift-*.md` files (a `security-*.md` index from `/akili-security` and a `modern-web-*.md` report are not drift reports), ties broken by the newest filename in lexical order — never filesystem mtime, which a checkout destroys. Legacy `docs/specs/drift-report.md` is a permanent read fallback, used only when `docs/specs/audits/` holds no `drift-*.md` file (a scaffolded `README.md` or `.gitkeep` is not a report). Only `drift-*` names are candidates, so a report renamed by hand to another name stops being read. The command never modifies, overwrites, or deletes that legacy file.

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
- `design` mode: before redesigning an existing product, or to review an inherited UI
- `modern-web` mode: to find web UI code that a modern browser platform feature could replace

## Skills

`systematic-debugging` applies when discrepancies suggest implementation bugs rather than documentation gaps. `impeccable-bridge` (with `ui-ux-pro-max` and `frontend-design` as fallback) applies in `design` mode, and `modern-web` mode reaches Modern Web Guidance through it.

## Source

- `.claude/commands/akili-audit.md`
