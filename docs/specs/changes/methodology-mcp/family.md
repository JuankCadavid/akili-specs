# Spec Family: Methodology MCP Server

## Document Control

| Field | Value |
|---|---|
| Parent Spec Path | `changes/methodology-mcp` |
| Decision record | `docs/specs/changes/methodology-mcp/proposal.md` (approved 2026-10-27) |
| Date Created | 2026-10-27 |
| Last Updated | 2026-10-27 |
| Spec-Family Status | `open` |

## Children

| # | Spec Path | Depends on | Parallel-safe | Status |
|---|---|---|---|---|
| 1 | `changes/methodology-mcp/local-stdio` | none | no | active |
| 2 | `changes/methodology-mcp/gateway-lambda` | `changes/methodology-mcp/local-stdio` | no | pending |

Row 2 stays `pending`, and its folder is not created, until a concrete cloud-agent consumer exists (parent proposal OQ-6).

## Closed-Set Rule

This table is the exhaustive child set of the spec family. No AKILI command creates a child spec folder without a prior row here. Adding a row is a manifest edit that needs HITL approval, made *before* the child's folder is created. One example is the Runtime escalation path in parent proposal §11.3.
