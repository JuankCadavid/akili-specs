# Tasks: mcp-separation

| Field | Value |
|---|---|
| Spec Path | `changes/mcp-separation` |
| Branch | `JuankCadavid/mcp-separation` (from `origin/dev` at `f3f660d`) |

## T1: Remove the MCP files [x]

Remove the files in proposal §5. Verify: `rg` for `mcp-core|mcp-lambda|mcp-deploy|mcp-gateway|docs/mcp.md` outside `docs/specs/archive/` and `releases/` finds only the `CHANGELOG.md` `### Removed` entry.

## T2: Fix the references [x]

`README.md` row points at akili.com.co (net 0 lines); `docs/README.md` drops two links; `docs/release-checklist.md` drops the `MCP Deploy` step; `AGENTS.md` states the repository has no cloud infrastructure; `.github/workflows/ci.yml` drops the three syntax checks and the `infra` job; `CHANGELOG.md` `[Unreleased]` drops the MCP entries and adds `### Removed`.

## T3: Verify [x]

`npm test` (1195 tests, all passing), `npm run verify:cli`, `npm pack --dry-run` (no MCP or infra file in the tarball).
