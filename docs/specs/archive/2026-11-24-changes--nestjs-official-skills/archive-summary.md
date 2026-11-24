# Archive Summary — Vendor the official NestJS skills and retire `nestjs-expert`

**Outcome: delivered.** AKILI now ships the six official NestJS skills, unmodified and hash-locked at upstream `v0.1.1`, and `nestjs-expert` is retired. Execute, test and validate all passed, and nothing is pushed yet.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/nestjs-official-skills` |
| Archive Date | 2026-11-24 |
| Branch | `changes/nestjs-official-skills` (worktree `nestjs-official-skills`), commits local only |
| Final Status | **Done.** 11/11 tasks; test PASS 2210/2210; validation PASS with 3 WARN |
| Release | **Minor** (Q3, NFR-8), conditional on the `RETIRED` warning and the migration note, both shipped. Release is JC's call |

## 2. Original Spec Path

`docs/specs/changes/nestjs-official-skills/`

## 3. Archive Date

2026-11-24

## 4. Final Status

| Phase | Result | Evidence |
|---|---|---|
| Execute | 11/11 PASS. 7 tasks took a second attempt; 18 of 18 review rounds and about 2,011 of ~2,050 LOC used | `execution.md` |
| Test | PASS, 2210/2210, 24 new tests from 2 parallel Testers, no `PRODUCT_BUG` | `test-report.md` |
| Validate | PASS with 3 WARN; design §5/§6 strings corrected to the shipped wording | `validation-report.md` |

## 5. Requirements Delivered

| Req | Delivered |
|---|---|
| FR-1 | Six folders vendored verbatim, each with `LICENSE`, `NOTICE` and `UPSTREAM.md`; only the `metadata` frontmatter block is added |
| FR-2 | `scripts/sync-nestjs-skills.js` (maintainer-only, with rollback); a release-checklist pin step |
| FR-3 | Delivered to every target; a folder without `UPSTREAM.md` is foreign and skipped whole, and `--force` takes it over |
| FR-4 | `nestjs-expert` removed; `RETIRED_SKILLS` drives cleanup on `install`, `update` and `doctor --fix`; shared roots are never scanned |
| FR-5 | `doctor --agents` prints `RETIRED` for a Skill Map row naming a retired skill; it never writes the file and never changes the exit status |
| FR-6, FR-7 | The routing matrix names the official set and `nestjs-feature` leads `implement`; rule 5 adds the package-preference clause and rule 9 covers outward actions |
| FR-8 | Governance, commands, docs, the panel catalog and `AGENTS.md` name the set; a line-level surface test guards the retired name |
| FR-9 | `CHANGELOG.md` `[Unreleased]` carries the migration note |

## 6. Files Changed Summary

89 files changed, +6351 −693 against base `aac1295`. Most of the added lines are the vendored bytes (34 files, ~135 KB).

| Area | Files |
|---|---|
| Vendored skills | `.claude/skills/{nestjs, nestjs-feature, nestjs-auth, nestjs-data, nestjs-testing, nestjs-production}/` (NEW); `.claude/skills/nestjs-expert/` (REMOVED) |
| Code | `bin/skill-map.js` (NEW), `bin/akili.js`, `scripts/sync-nestjs-skills.js` (NEW), `.claude/skills/akili-panel/hooks/flow.mjs` |
| Rules text | `backend-routing.md`, `/akili-constitution`, `/akili-specify`, `.claude/templates/leader.md`, `AGENTS.md` |
| Docs | six `docs/skills/nestjs*.md` pages (NEW); `docs/skills/nestjs-expert.md` (REMOVED); `governance.md`, `README.md`, `overview.md`, `flow.md`, `cli.md`, command docs, `release-checklist.md`, `CHANGELOG.md` |
| Tests | 8 new files; 9 edited, plus the doctor baseline fixture |
| Repo config | `.gitattributes` (`-text` ×6), `.gitignore` (`.nestjs-sync/`) |

## 7. Test Evidence Summary

`npm test` passes 2210/2210. Two Testers on `opus` (the Implementer was `sonnet`) added 24 tests, each falsified by a mutation, and found no product bug. They closed real gaps:
- Grok Bot delivery.
- A foreign folder without the marker.
- `doctor` counting the six.
- `RETIRED` printed before the `--fix` guards.
- Exit-status equality.
- The CHANGELOG migration facts.
- The six docs pages and their rows.

## 8. Validation Summary

PASS with 3 WARN, no FAIL:
1. Two design strings differed from the shipped code. They were corrected in `design.md` with a dated note.
2. `AGENTS.md` does not mention `bin/skill-map.js`. This is recorded as a pending `guide-sync` item.
3. Accepted test gaps: FR-7 runtime behaviour and the Windows CI legs.

## 9. Accepted Warnings Or Follow-Ups

| Item | Route |
|---|---|
| `AGENTS.md` → *Repository Purpose* gains `bin/skill-map.js` | Kaizen pending `guide-sync` item, applied on `dev` |
| Windows legs for the vendor test (NFR-3) | CI on the PR into `dev` |
| Advisories A-1 to A-7 (`validation-report.md` §7) | Recorded only |
| CodeGraph re-index | Recommended after the merge |
| Push, PR into `dev`, minor release | JC |

## 10. Historical Notes

- Judgment Day C-1 amended FR-8 on 2026-11-22: `implementer.md` keeps its example list because live persona fixtures pin it (DD-12).
- Factual corrections logged without a gate:
  - The Grok Bot hand-delete path: the spec had `~/.agents/skills`; the real path is the workflows root.
  - Count consumers that P-10 missed.
  - The `modern-web-guidance` test that pins governance prose.
  - The T4 `RETIRED` wording, which was carried into `design.md` only at validate.
- No pivots, HALTs or `FATAL_FAIL`s.

## 11. Diagrams

The spec has no `diagrams/` folder and no baseline diagram slot. Nothing to link and no stale slot.
