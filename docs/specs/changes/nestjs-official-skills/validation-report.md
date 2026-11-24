# Validation Report — Vendor the official NestJS skills and retire `nestjs-expert`

**Verdict: PASS with 3 WARN. Archive-ready.** All 11 tasks are complete and every FR and NFR has evidence. No FAIL remains. The three WARNs are accepted gaps or `/akili-archive` work, and none blocks the archive.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/nestjs-official-skills` |
| Date | 2026-11-24 |
| Code validated | `9593f0c` (T1–T11 at `6f44ff3`, plus the `/akili-test` suites) |
| Validator | Claude Code main session, `opus`. The Implementer was `sonnet` and `execution.md` records no escalation, so author ≠ auditor holds |
| Baseline docs | `docs/prd.md`, `docs/ux-ui/design.md`, `docs/trd/trd.md` and `docs/specs/general-setup/` are all absent from this repository. The constitution is `CLAUDE.md` → `AGENTS.md` |
| Deliverable / AI Agent | `software` / `no`, so there is no video gate and no eval gate |

## 2. Summary

| Area | Result | Note |
|---|---|---|
| Task completion | PASS | 11/11 `[x]`, each with an `execution.md` entry and a Reviewer PASS |
| File existence | PASS | Every NEW and REMOVED path in design §4 matches the tree |
| Build integrity | PASS | `npm test` 2210/2210; `verify:cli` 37 skills; pack, install and doctor clean |
| Requirement coverage | PASS | FR-1 to FR-9, every scenario and every `BUT`/`AND IT MUST` clause has a test or command evidence |
| Design conformance | WARN | Two output strings in design §5 and §6 differed from the shipped code. Both corrected here (§8) |
| Agent guide sync | WARN | The `AGENTS.md` *Repository Purpose* does not mention `bin/skill-map.js`; for `/akili-archive` |
| Test evidence | WARN | Accepted gaps only: FR-7 runtime behaviour and the Windows CI legs |

## 3. Task Completion

| Task | Status | Attempts | Commit | Result |
|---|---|---|---|---|
| T1 Sync script with rollback | `[x]` | 1 | in `12da974..6f44ff3` | PASS |
| T2 Six folders and registries | `[x]` | 2 | ″ | PASS |
| T3 Vendored-entry ownership | `[x]` | 2 | ″ | PASS |
| T4 `doctor --agents` Skill Map scan | `[x]` | 1 | `6dae9e2` | PASS |
| T5 Backend routing | `[x]` | 2 | `482da3d` | PASS |
| T6 Command text | `[x]` | 2 | `12cd81b` | PASS |
| T7 Persona and agent guide | `[x]` | 1 | `6b0f487` | PASS |
| T8 Governance and release checklist | `[x]` | 2 | `2d987b2` | PASS |
| T9 Docs prose | `[x]` | 2 | `fbb2213` | PASS |
| T10 Retire `nestjs-expert` | `[x]` | 2 | `6765402` | PASS |
| T11 CHANGELOG and full verification | `[x]` | 1 | `6f44ff3` | PASS |

The budget closed at about 2,011 of ~2,050 LOC and 18 of 18 review rounds. No tripwire fired.

## 4. File Existence

| Design §4 path | Expected | Found |
|---|---|---|
| `.claude/skills/{nestjs, nestjs-feature, nestjs-auth, nestjs-data, nestjs-testing, nestjs-production}/` | NEW, `SKILL.md` + `references/` + `LICENSE` + `NOTICE` + `UPSTREAM.md` | all six have exactly that shape; 34 files in total (16 upstream + 18 provenance) |
| `.claude/skills/nestjs-expert/`, `docs/skills/nestjs-expert.md` | REMOVED | absent |
| `.nestjs-sync/` | gitignored, never packed | `.gitignore:15`; 0 hits in `pack:dry-run` |
| `bin/skill-map.js` | NEW | present |
| `scripts/sync-nestjs-skills.js` | NEW, not in `files` | present; 0 hits in `pack:dry-run` |
| `docs/skills/nestjs*.md` | 6 NEW pages | 6 present and packed |
| 6 test files named in §4 | NEW | all present, plus 2 suites from `/akili-test` |
| `.gitattributes` | `-text` for the six | lines 43–48 |
| `SKILL_FILE_EXPECTED` | 354 (P-10: 321 − 1 + 34) | `find .claude/skills -type f -not -path '*/akili-panel/*' \| wc -l` → 354; the test's sum is 354 |

## 5. Build Integrity

| Command | Result |
|---|---|
| `npm test` | `# tests 2210  # pass 2210  # fail 0  # skipped 0` |
| `npm run verify:cli` | `14 commands \| 37 skills \| 1 plugin \| 8 resources (akili-specs v2.45.0)` |
| `npm run pack:dry-run` | 469 files, 3.7 MB; the six folders and six pages are packed; `nestjs-expert`, `.nestjs-sync` and `sync-nestjs` have 0 hits |
| `git diff --check` | clean |
| `node bin/akili.js install --tool all --dry-run` | exit 0 |
| Fresh HOME: `install --tool all`, then `doctor --tool all` | both exit 0; `OK` for each of the six on Claude, OpenCode, Antigravity, Codex and Cursor. Grok Bot is outside `--tool all` and is covered by the `/akili-test` suite A test |

There is no type-check or lint command; the repository is plain Node.js with `node:test`.

## 6. Requirement Coverage

The primary evidence is `test-report.md` (PASS, no `PRODUCT_BUG`). Its matrix was cross-checked against `requirements.md` at scenario and clause level.

| Req | Scenario / clauses | Owner task | Evidence | Result |
|---|---|---|---|---|
| FR-1 | *Verbatim check*: THEN hashes · BUT no unlisted file · AND 16 files + MIT `LICENSE` | T2 | `nestjs-vendor` | PASS |
| FR-2 | *Local edit creeps in*; *Dirty upstream checkout* THEN + BUT no partial folder; refusals; no download; diff summary; release-checklist step | T1, T2, T8 | `sync-nestjs-skills`, `nestjs-vendor`, contracts | PASS |
| FR-3 | *Developer already ran the upstream installer*: THEN untouched + named foreign · AND five written · BUT no merge; marker; `--force`; doctor counts; all six targets | T2, T3 | `install-nestjs-foreign`, installer suite (Grok Bot, no-marker, doctor count) | PASS |
| FR-4 | *Upgrade over an older install*: THEN STALE · AND `--fix` REMOVED · BUT not under a shared root; `update`; gsap wording; Removal Log | T8, T10 | `retired-skills`, installer suite (gsap), contracts | PASS |
| FR-5 | *Project still maps…*: THEN RETIRED with `nestjs-feature` · AND exit unchanged · BUT no byte changed even with `--fix`; *Name in prose* | T4 | `doctor-skill-map`, installer suite (scan before the guards, twin-project exit) | PASS |
| FR-6 | Six bullets; *Existing Passport project* THEN + BUT not reopened | T5 | `backend-skill-routing*` | PASS |
| FR-7 | Rule 9 text and its location | T5 | `backend-skill-routing-coverage`, contracts | PASS (runtime behaviour is the accepted risk in requirements §8) |
| FR-8 | Five bullets; *No live surface* THEN allowlist · BUT not in a command, template, matrix, skill or docs page | T2, T5–T10 | contracts, `ai-agent-guardrails-evals`, `nestjs-retirement-surface` (line-level), `akili-panel-flow` | PASS |
| FR-9 | Four bullets; *Release reader* | T11 | contracts FR-9 ×4 | PASS |
| NFR-1 to NFR-8 | Section 7 | T1, T2, T10, T11 | `test-report.md` §7; NFR-6 by `git diff` (empty for archive, kaizen and releases; CHANGELOG hunks only inside `[Unreleased]`) | PASS (NFR-3's Windows legs wait for CI) |

Every clause has a named owner task in `tasks.md` → *Coverage*. No gap is closed by citing a different requirement.

## 7. Linting & Code Quality

There is no lint command. The 4R sweep and the open `execution.md` advisories follow; all are **advisory** and none violates the spec.

| # | Lens | Finding | Source |
|---|---|---|---|
| A-1 | Risk | The sync script writes the `Tag` row as `v<package.json version>` and never checks it against git. On the FR-2 deviation path (an untagged commit) the tag would be wrong | T1 |
| A-2 | Reliability | `swap()` creates `ASIDE` and `SKILLS` before its `try`. A failure there leaves staging behind, and the next run refuses it as a leftover; the state is safe but needs manual cleanup | T1 |
| A-3 | Readability | The no-marker `policy.detail` reports the `version:` of any vendored `SKILL.md`; `makeImpeccableForeignPolicy` now covers seven names | T3 |
| A-4 | Reliability | Skill Map fence edge cases (an unclosed fence above the heading, mixed fence markers) fail quiet as false negatives, never as a write | T4 A3; `test-report.md` §9 |
| A-5 | Readability | The `docs/cli.md` doctor sentence names only `impeccable/` as "not compared"; the six follow the same rule | T9 |
| A-6 | Readability | The CHANGELOG says `update` removes the old folder; `install` does too. The Codex/Cursor path lacks the word "default" | T11 |
| A-7 | Readability | One governance assertion keys on the literal "break rule 1" | T8 |

The T4 advisories A1 (the scan's position before the `--fix` guards is unpinned) and A2 (the replacement is checked loosely) were closed by the `/akili-test` suite A tests.

## 8. Design Conformance

| Check | Result | Detail |
|---|---|---|
| DD-1 to DD-12 against the code | PASS | Ownership in `VENDORED_ENTRIES`; `RETIRED_SKILLS` in the pure `bin/skill-map.js`; both cleanup loops keep the `!paths.sharedSkillsRoot` guards; the scan runs before the `--fix` guards; `implementer.md` is unchanged (DD-12) |
| Design §6 install and doctor strings | PASS | `deleted retired skill <dir> (replaced by <replacement>)`, `STALE …`, `REMOVED …` and `skip foreign …` match `bin/akili.js:1316,2050,2053` character for character |
| Design §6 `RETIRED` line | **WARN, corrected** | Design read `— replaced by <replacement>`; T4 ships `-> replace with <replacement>`, and `docs/cli.md:702` follows the code. `execution.md` T9 logged it, but `design.md` was never updated. Corrected in `design.md` §6 with a dated note |
| Design §5 `RETIRED_SKILLS` replacement label | **WARN, corrected** | Design read `the official NestJS skills (nestjs-feature leads implement)`; the code reads `nestjs-feature plus the official set (nestjs, nestjs-auth, nestjs-data, nestjs-production, nestjs-testing)`, which meets FR-4/FR-5 ("naming `nestjs-feature` and the official set"). Corrected in `design.md` §5 |
| Correction closure | done | Forward sweep of the spec folder for both old strings: the only other hit, `tasks.md:182`, quotes `RETIRED <name> (<file>:<line>)` without the tail, so it stays true. Backward: `docs/cli.md:702` and the CHANGELOG already match the code |
| Cross-document figures | PASS | 16 upstream files (requirements FR-1, design §4, P-4); 34 vendored files (design §10.2, on disk); 354 skill files (P-10, on disk, test); 37 skills (CHANGELOG, `verify:cli`). requirements §4 says 20 files / 34 lines and P-9 says 22 files; P-9 explains the two grep scopes, and both reproduce |
| Proposal alignment (Q1–Q4) | PASS | Retired outright; all 6 vendored; minor, with the `RETIRED` warning and the migration note in the CHANGELOG; no soak |
| UI / design review | n/a | The spec has no UI |

## 9. Test Evidence Summary

`test-report.md`: PASS, 2 parallel Testers on `opus`, 24 new tests each falsified by mutation, no `PRODUCT_BUG`. Its accepted gaps:
- FR-7 runtime behaviour and the upstream recipes: risks accepted in requirements §8.
- The first-pin check: an execution-time fact, recorded in T2.
- The Skill Map heading inside a code fence: unspecified in the design.
- Grok Bot foreign folders: these belong to the grokbot-target spec.
- The Windows CI legs.

**WARN:** these gaps are accepted, not closed.

## 10. Agent Guide / Constitution Impact

`execution.md` records no `## Constitution Impact` notes. One guide drift is pending for `/akili-archive` (Constitution & Graph Sync):

| Guide | Drift | Result |
|---|---|---|
| `AGENTS.md` → *Repository Purpose* | It lists the pure `bin/` modules (`routing.js`, `persona.js`, `install-compare.js`) but not the new `bin/skill-map.js` (the retired-skill table and the Skill Map scan) | WARN, archive work |
| `AGENTS.md` → *Backend Skills*, *Skill Usage* | Already name the official set (T5, T7) | PASS |
| CodeGraph | The index predates the change | archive re-index |

## 11. Remediation

| # | Item | Severity | Route |
|---|---|---|---|
| R-1 | Add `bin/skill-map.js` to the `AGENTS.md` *Repository Purpose* list | WARN | `/akili-archive` guide sync |
| R-2 | Re-index CodeGraph | — | `/akili-archive` |
| R-3 | Watch the `windows-latest` legs for the vendor test (NFR-3) | WARN | after push, on the PR into `dev` |
| R-4 | Kaizen candidates: the wrong Grok Bot path in the spec text; P-10 missing consumers; design strings not updated when T4's wording changed | — | `/akili-archive` Kaizen |
| — | Advisories A-1 to A-7 | advisory | recorded only; a later spec may pick them up through the approval path |

## 12. Archive Readiness Recommendation

**Ready.** Every task is `[x]`, no FAIL is open, and each WARN is either accepted or routed to `/akili-archive`. The tests cover every requirement and scenario, and the only design drift found is now corrected in `design.md`.

```text
/akili-archive changes/nestjs-official-skills
```
