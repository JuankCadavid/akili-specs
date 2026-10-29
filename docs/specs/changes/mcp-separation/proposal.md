# Proposal: Move the Methodology MCP Out of akili-specs

**Recommendation:** remove every MCP server, AWS and deploy file from this public repository before the next release, and keep them in a separate private repository for the hosted AKILI MCP service. akili-specs goes back to holding the methodology only.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/mcp-separation` |
| Type | **Change** (removal) |
| Approval Mode | `gated` |
| Depends on | none. Undoes the repository placement of `changes/methodology-mcp` (merged to `dev` in PR #92 and PR #93, never released) |
| Parallel-safe | yes with `changes/growth-angles` (already merged to `dev`); shares only the `[Unreleased]` CHANGELOG block |
| Date | 2026-10-28 |
| Status | **Approved direction** (maintainer, 2026-10-28 6:45 PM and 6:46 PM Bogota: split the MCP into its own private repository, and do it before publishing; 6:47 PM: move `bin/mcp-core.js` too unless that proves complex or risky) |

## 2. Intent

The methodology stays free and open source. The MCP may become a paid, authenticated service (tokens, subscriptions, a subscriber panel on akili.com.co), so its code, infrastructure and runbooks do not belong in the public package.

## 3. Current Behavior (at `f3f660d`, origin/dev)

| # | Claim | Evidence |
|---|---|---|
| 1 | The MCP code is on `dev` only; no release shipped it | `git ls-tree -r v2.37.2` has no `bin/mcp-*`, `infra/`, `docs/mcp.md` or `docs/infrastructure.md`; npm `latest` is 2.37.2 |
| 2 | Nothing outside the MCP files requires them | `bin/akili.js`, the installer, the packaged commands and skills, and `scripts/` other than `mcp-deploy-guard.js` never reference `mcp-core`, `mcp-lambda`, `infra/` or `docs/mcp.md` |
| 3 | The remaining references are docs and CI | `README.md` (one row), `docs/README.md` (two links), `docs/release-checklist.md` (one step), `AGENTS.md` (one line), `.github/workflows/ci.yml` (three syntax checks and the `infra` job), `CHANGELOG.md` `[Unreleased]` |

## 4. Decision on `bin/mcp-core.js`

Move it. Removing it is simple and safe: it was never published, no CLI command or install step uses it, and its only consumers (`bin/mcp-lambda.js` and four test files) move with it. Keeping it would leave a server in the public package that the hosted service no longer shares.

## 5. Scope

| Removed from akili-specs | Kept |
|---|---|
| `bin/mcp-core.js`, `bin/mcp-lambda.js`, `scripts/mcp-deploy-guard.js` | `.mcp.json.example` (the `gsc` server reference for `/akili-seo`, unrelated) |
| `infra/mcp-gateway/`, `.github/workflows/mcp-deploy.yml`, the `infra` CI job and the three MCP syntax checks | Every MCP mention in commands and skills about third-party MCP servers (Stitch, Figma, Jira, GSC, Analytics) |
| `docs/mcp.md`, `docs/infrastructure.md` | The archived specs that mention `methodology-mcp` (history) |
| `docs/specs/changes/methodology-mcp/` | |
| `test/mcp-*.test.js` (4 files), `test/fixtures/mcp/` | |

## 6. User Impact

- npm users: none. No published version contained these files.
- `dev` checkout users: `node bin/mcp-core.js` and `bin/mcp-lambda.js` are gone. The AKILI MCP will be offered as a hosted service on akili.com.co.
- The code remains in this repository's git history (PRs #92 and #93). The removal does not make it private retroactively.

## 7. Open Decisions (maintainer)

| # | Decision | Recommendation |
|---|---|---|
| D-1 | Release class of the next release with this removal | Minor (2.38.0): nothing released is removed, so no major is needed |
| D-2 | Order versus the growth release | Merge this change to `dev` first, then cut 2.38.0 with growth only, so the MCP never ships to npm |
