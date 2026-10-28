# Proposal: Local stdio MCP Server in the npm Package

**Recommendation:** add `akili mcp`, a zero-dependency MCP server over stdio, to the `akili-specs` package. It serves the 14 commands as prompts and the skills/templates/helpers as read-only resources, and offers three read-only project tools. It is built on a transport-free core that chunk 2 reuses. The hosting decision and option comparison are in the parent proposal and are not restated here.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/methodology-mcp/local-stdio` |
| Parent Spec | `changes/methodology-mcp` (manifest: `docs/specs/changes/methodology-mcp/family.md`, row 2 since 2026-10-27; **held**, depends on `gateway-lambda`) |
| Type | **Change** |
| Deliverable | `software` |
| Approval Mode | `gated` for the final spec approval. Owner mandate, 2026-10-27: *"Answer process gates with the recommended option; stop only for product, cost or risk decisions, HALT, or the final spec approval."* Routine process gates are logged as `auto-approved (owner mandate)` |
| Requirement source | Approved parent proposal, `../proposal.md` §5 *Chunk 1*, §9, §13. No Jira, no Figma |
| Open-question decisions | Parent OQ-1..OQ-4 accepted at their defaults (owner, 2026-10-27): hand-rolled JSON-RPC, one string argument per prompt, command text unchanged, no config writing by `akili install` |
| Depends on | none |
| Parallel-safe | no (edits `bin/akili.js` dispatch) |
| Release | minor (new command), through the normal `release:minor` flow, after merge into `dev` |
| Date | 2026-10-27 |
| Status | **Approved** with the parent; **held** 2026-10-27 (owner: remote first). The spec approval waits, and an Adjust round is owed on resume: T1 reuses `gateway-lambda`'s content core |

## 2. Intent

See parent §2. This chunk delivers the local channel: any MCP client on a machine with Node ≥18 gets the methodology with one server entry and no `akili install`.

## 3. Problem / Current Behavior

See parent §3 (claims #1–#8, cited at `45f2500`). The claims this chunk depends on are #2 (no MCP entry point), #4 (zero dependencies), #5 (frontmatter `name`/`description`), #6 (content sizes), and #7 (install-layout paths).

## 4. Proposed Outcome

Parent §4, column *After chunk 1 (A)*.

## 5. Scope (slice boundary)

**This chunk delivers:**

- `akili mcp` subcommand on stdio: newline-delimited JSON-RPC 2.0; `initialize`, `ping`, `prompts/list|get`, `resources/list|read`, `tools/list|call`; the server advertises `prompts`, `resources`, `tools` capabilities.
- **Prompts:** one per installable command, name and description from frontmatter, body as the user message, one optional string argument substituted for `$ARGUMENTS`.
- **Resources:** every shipped skill file, persona template, `digests.json`, `model-registry.json`, and helper script, as read-only text under a versioned URI scheme fixed in design.
- **Tools (read-only):** `doctor_agents`, `resolve_spec_path`, `list_active_specs`.
- A transport-free core module, plus a thin stdio transport.
- Docs: `README.md`, `docs/cli.md` (client setup snippets), `CHANGELOG.md` `Unreleased`.
- Tests in the existing `node:test` suite, run by the six CI legs.

**Left to chunk 2 (`gateway-lambda`, family row 2):** any remote transport, Lambda, Gateway, auth, IaC, release deploy step.

**Explicitly out of this chunk:**

- Rewriting command text (parent OQ-3).
- Writing MCP entries into tool configs (parent OQ-4).
- Write tools of any kind (parent §6).
- Streamable HTTP.
- MCP sampling, elicitation, subscriptions, `listChanged` notifications.

## 6. Non-Goals

Parent §6 applies unchanged.

## 7. Affected Users, Systems, And Specs

Parent §7, rows marked chunk 1.

## 8. Visual Reference

- Source: None
- Location: n/a
- Notes: CLI/protocol only; no UI surface.

## 9. Requirement Delta Preview

Parent §9, items marked (1), plus the `akili help` / README modification.

## 10. Approach Options

Settled in the parent (§10, §11). Within this chunk, the open implementation choices are design-level: URI scheme, module split, and how `doctor_agents` reuses `runAgentsDoctor` without its console output. `/akili-specify` decides them.

## 11. Recommended Approach

Parent §11.1, chunk 1.

## 12. Risks, Dependencies, And Open Questions

Parent risks R-1..R-6, R-12, R-13 apply to this chunk. That list includes the two Active Lessons, **KZ-bugfix--init-ctrlc-abort-2** (test budget per clause) and **KZ-changes--archify-diagrams-1** (no test reads an active spec path). No open questions remain at this level; design-level questions go to `/akili-specify`.

## 13. Success Criteria

Parent §13, items 1–5.

## 14. Next Step

```text
/akili-specify changes/methodology-mcp/local-stdio
```
