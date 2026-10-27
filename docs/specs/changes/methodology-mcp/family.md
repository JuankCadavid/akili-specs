# Spec Family: Methodology MCP Server

## Document Control

| Field | Value |
|---|---|
| Parent Spec Path | `changes/methodology-mcp` |
| Decision record | `docs/specs/changes/methodology-mcp/proposal.md` (approved 2026-10-27; amended the same day: remote first) |
| Date Created | 2026-10-27 |
| Last Updated | 2026-10-27, manifest edit requested by the owner: `gateway-lambda` becomes Must and goes first; `local-stdio` is held |
| Spec-Family Status | `open` |

## Children

| # | Spec Path | Depends on | Parallel-safe | Status |
|---|---|---|---|---|
| 1 | `changes/methodology-mcp/gateway-lambda` | none | no | active |
| 2 | `changes/methodology-mcp/local-stdio` | `changes/methodology-mcp/gateway-lambda` | no | pending |

**Priority (MoSCoW):**

| Row | Priority | Note |
|---|---|---|
| 1 `gateway-lambda` | **Must** | The owner's goal: remote use from Claude Code, with content updated on every npm release |
| 2 `local-stdio` | **Could** | Held. Its spec (`requirements.md`, `design.md`, `tasks.md`) is drafted and its approval waits. It is not executed |

**Why row 1 stands alone (the owner asked for this to be stated if true): it can, and it should.**

- The only thing the two chunks share is the **content core**: the catalog of shipped files, the frontmatter parser, `$ARGUMENTS` rendering, and the URI/path guard. That is `local-stdio`'s T1 and nothing more. Its handler, its transport and its project tools are stdio-only.
- Making the Must chunk wait on a chunk whose spec is unapproved would block the owner's goal on a decision about a different channel. So `gateway-lambda` builds the content core as its own first task, and `local-stdio` reuses it.
- `local-stdio`'s spec therefore needs an **Adjust round** when it resumes. Its T1 then shrinks to reuse the core, and its design P-7/DD-9 citations are re-run at the new baseline.
- The alternative the owner named, keeping `local-stdio` as the core and making row 1 depend on it, is recorded as option D-0(b) in `gateway-lambda/proposal.md` §12 for the owner's confirmation.

## Closed-Set Rule

This table is the exhaustive child set of the spec family. No AKILI command creates a child spec folder without a prior row here. Adding a row, or changing a row's order or `Depends on`, is a manifest edit that needs HITL approval, made *before* the child's folder is created. The 2026-10-27 edit above was requested by the owner. One example of a future row is the Runtime escalation path in the parent proposal §11.3.
