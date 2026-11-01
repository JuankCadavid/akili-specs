# Archive Summary — mcp-separation

**Outcome:** delivered and released in **2.38.0**. The methodology MCP server, its AWS infrastructure, deploy workflow, docs and tests left this public repository before any release shipped them. This spec ran as a **proposal + tasks** removal: it never had `requirements.md`, `design.md`, `execution.md`, `test-report.md` or `validation-report.md`, and this archive does not create them after the fact.

## 1. Document Control

| Field | Value |
|---|---|
| Original Spec Path | `changes/mcp-separation` |
| Archive Date | 2026-10-31 |
| Final Status | **Done, abbreviated record** (proposal + tasks only; see §6) |
| Implementation | `d20a261` (2026-10-28), contained in tag `v2.38.0` (`git tag --contains d20a261` → `v2.38.0`) |
| Archived on | `JuankCadavid/impeccable-audit-fixes` (a spec branch; the apply-capable branch is `dev`). Local commit only |
| Archive mandate | JC's instruction of 2026-10-31 14:23 (UTC-5), repeated in the 16:51 decision: archive it and decide how to do so honestly. The method below is the Leader's choice, not a JC approval of its contents |

## 2. Requirements Delivered

There is no `requirements.md`. The proposal's §5 scope table is the contract, and every row holds today:

| Proposal claim | Check run at archive (2026-10-31) | Result |
|---|---|---|
| MCP code removed (`bin/mcp-core.js`, `bin/mcp-lambda.js`, `scripts/mcp-deploy-guard.js`, `infra/mcp-gateway/`) | `ls bin` → `akili.js install-compare.js persona.js routing.js`; `ls infra` → `No such file or directory` | Holds |
| No reference left outside history | `git grep -nE 'mcp-core\|mcp-lambda\|mcp-deploy\|mcp-gateway\|docs/mcp\.md'` excluding `docs/specs/archive`, `releases` and this folder → only `CHANGELOG.md:83-84`, the 2.38.0 `Removed` entry | Holds (T1's own verify criterion) |
| Kept: `.mcp.json.example`, third-party MCP mentions | Not removed by `d20a261` | Holds |
| D-1 release class minor, D-2 order (removal before the growth release) | Shipped in 2.38.0; no npm version ever contained the files (proposal §3 claim 1) | Holds |

## 3. Files Changed Summary

From `d20a261` and `tasks.md` T1–T2: the files in proposal §5 removed; `README.md`, `docs/README.md`, `docs/release-checklist.md`, `AGENTS.md`, `.github/workflows/ci.yml` and `CHANGELOG.md` references fixed.

## 4. Test Evidence Summary

No `test-report.md`. The only test evidence is T3's own record: `npm test` 1195 passing, `npm run verify:cli`, `npm pack --dry-run` with no MCP or infra file, all at `d20a261`. A removal adds no behavior to test; the current suite (1381 passing on this branch) runs without any of the removed files.

## 5. Validation Summary

No `validation-report.md`. The §2 table above is a re-check of the proposal's claims run at archive time, not a `/akili-validate` run. It found no drift.

## 6. Accepted Gaps

| Gap | Why it is accepted |
|---|---|
| No `requirements.md` / `design.md` | The change was a removal, approved as a direction by the maintainer on 2026-10-28 (proposal Document Control) and run straight from proposal to tasks |
| No `execution.md` | The single commit `d20a261` and its `[SPEC:changes/mcp-separation]` prefix are the trail; no Implementer/Reviewer record exists, and none is reconstructed here |
| No `test-report.md` / `validation-report.md` | See §4 and §5. Writing them now would describe runs that never happened |

## 7. Historical Notes

- The removed code stays in git history (PRs #92 and #93), as proposal §6 says. The removal did not make it private retroactively.
- `docs/specs/changes/methodology-mcp/` was deleted by `d20a261` as part of the scope, so it has no archive folder.

## 8. Diagrams

None: no `diagrams/` folder and no diagram slot.
