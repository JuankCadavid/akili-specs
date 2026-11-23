# Execution Log: Official NestJS skills, vendored verbatim; `nestjs-expert` retired

## Document Control

| Field | Value |
|---|---|
| Spec | `changes/nestjs-official-skills` |
| Approval Mode | `gated` (each task gate goes to JC) |
| Execution approved | 2026-11-23 by JC: "desde T1 … Commits locales, sin push ni PR. Tráeme cada gate." |
| Branch | `changes/nestjs-official-skills` (worktree), local commits only |
| Leader | Claude Code main session, `opus` (T1) |
| Implementer / Reviewer | `sonnet` (T2) / `opus` (T3). No Step 8E wrappers, so the fallback path is used: general-purpose subagents seeded with `.agents/implementer.md` and `.agents/reviewer.md` |
| Personas | `.agents/` copied from the main checkout (gitignored, absent in this worktree), then `node bin/akili.js doctor --agents --fix --allow-branch`: 3 outdated sections fixed (reviewer `audit-checklist`, tester `context-alignment` and `prove-behavior`), backups in `.agents/.backup/`. Result: "No persona drift blocking CI." |
| Budget (design §10.2) | 11 tasks · ~2,050 LOC by hand · 18 review rounds |

## Task Execution History

### T1 — Sync script with rollback

| Field | Value |
|---|---|
| Final status | **PASS** |
| Date | 2026-11-23 |
| Attempts | 1 |
| Requirements covered | FR-2 bullets 1–4, FR-2 *Dirty upstream checkout* scenario, NFR-2 |
| Skills / effort | `tdd` (the task's list, unchanged) · effort `high` (new transactional file logic). Not the `medium` default; reason: rollback correctness |

**Attempt 1**
- Files changed: `scripts/sync-nestjs-skills.js` (new, 371 lines), `test/sync-nestjs-skills.test.js` (new, 298 lines), `.gitignore` (+3: `.nestjs-sync/`).
- Implementer verification: `node --test test/sync-nestjs-skills.test.js` → `# tests 15 # pass 15 # fail 0`; `npm test` → `# tests 2126 # pass 2126 # fail 0`; `npm run pack:dry-run | grep -c sync-nestjs-skills` → `0`; `git diff --check` clean.
- Red run: greenfield. 14 of 15 tests failed in setup because the module was missing; the Implementer did not count these as behavioural reds. The two falsifiers are the behavioural reds:
  - Falsifier 1 (delete `aside/<name>` right after each folder's move-in at step 6(b)) → `not ok 1 - rollback: a rename failure on the 4th folder leaves all six at the old pin` / `operator: 'match'` (assertion on `rolled back: removed 3 new folder(s), restored 6 old folder(s)`). Reverted; `cmp` against the saved copy matched.
  - Falsifier 2 (step 4 reads with `fs.readFileSync` from the working tree) → `not ok 14 - bytes come from git objects: autocrlf=true with CRLF in the working tree still hashes the LF blob` (`Buffer(25)` with `13, 13` against `Buffer(23)`). Reverted.
- Test seams: `NESTJS_SYNC_ROOT` redirects the AKILI repo root; `NESTJS_SYNC_FAIL_RENAME_AT=<n>` fails the n-th rename of step 6(b) only.
- Evidence re-run (Leader inline, non-author): **VERIFIED**. The same four commands gave the same outputs (15/15, 2126/2126, `0`, clean).
- Reviewer (`opus`, lens checklist): **PASS**. "T1 meets FR-2 bullets 1–4, the *Dirty upstream checkout* scenario, NFR-2, design §5, §7.1 steps 1–7, DD-3, DD-4, P-6 and P-14." The Reviewer walked all 8 refusals, the success, rollback, first-run, autocrlf, step 5 and step 7 items, and confirmed that the Disqualifier holds because the failure lands in step 6(b) after 3 folders have moved in.
- runtime events: none

**Not Done / Assumptions** (Implementer, verbatim; assumptions only, no owed item and no blocker, so no continuation):
- The dirty check uses the design's pathspec, `git status --porcelain --ignored -- skills LICENSE`. An uncommitted change elsewhere in upstream is not refused.
- The script refuses a copyright-less upstream `LICENSE`, a symlink or submodule entry, and an upstream file named `LICENSE`, `NOTICE` or `UPSTREAM.md` inside a skill folder.
- If the rollback itself fails partway, `.nestjs-sync/aside/` is kept for manual recovery. Otherwise `.nestjs-sync/` is removed on rollback too.
- The UPSTREAM.md rows are `Source`, `Path`, `Commit`, `Tag` (`v<version>`), `npm version`, `npm shasum`, `Vendored` and `Synced by`.
- The real upstream clone was not used, so the 16-file count (P-4) is not exercised here.

**ADVISORY** (Reviewer 4R lenses; recorded only, not new work):
- Risk: the `Tag` row and the `NOTICE` tag are always `v<package.json version>`, never checked against git. On the FR-2 deviation path (a moved, untagged commit), the recorded tag would not point at the commit.
- Reliability: `fs.mkdirSync(ASIDE)` and `fs.mkdirSync(SKILLS)` in `swap()` run before the `try`. A failure there leaves staging behind, and the next run is refused as a leftover. The state is safe but needs manual cleanup.
- Readability: a first run prints `new folder (N files)` without listing the files or any Observe lines, so the first pin's Observe text gets no early review cue.
- Reliability (tests): the success test does not assert `adapted-by`, or the order of the five metadata keys.

- Decisions made: none beyond the test seams above (test-only, `[advisory-grade]` in the brief).
- Issues encountered: none.
- spawns: Implementer `sonnet` 15 calls, 106,789 tokens, ended complete; Reviewer `opus` 6 calls, 106,439 tokens, ended complete.
- Final verification: green (see the re-run above).
- Running totals against the budget: tasks 1/11 · LOC ≈672/~2,050 (T1 alone is above design §10.2's 280-line sync estimate; the tests account for most of it) · review rounds 1/18. No tripwire.

### T2 — Add the six folders and every registry that pins the folder set

| Field | Value |
|---|---|
| Final status | **PASS** (attempt 2) |
| Date | 2026-11-23 |
| Attempts | 2 |
| Requirements covered | FR-1 (all bullets, *Verbatim check*), FR-2 bullet 5, FR-2 *Local edit creeps in*, FR-3 bullet 3, FR-8 bullets 2 and 5 (+6), NFR-1, NFR-3, NFR-4 |
| Skills / effort | `cognitive-doc-design` (the task's list) · attempt 1 `high` (largest diff, licensing evidence), attempt 2 `xhigh` (effort bump after FAIL) |
| Approval | JC approved T2 2026-11-23, including re-cloning or fetching `nestjs/agent-skills` |

**P-13 outcome (first step): upstream has not moved.** In the clone (`HEAD` `7f05f49`), `git fetch --tags` returned nothing new. The tags are `v0.1.0` and `v0.1.1`, and `v0.1.1` = `68e1d54a7c241ffd2bc37ea60df6f176fb66d3d4` is the latest. `git diff --stat v0.1.1 HEAD -- skills` is empty; the only difference between `v0.1.1` and `HEAD` is a one-line `package.json` change. `npm view @nestjs/skills@0.1.1 dist.shasum` → `8c70e8b504866f6f7530b515da2c9cad6615f744`, matching P-14. No deviation. The script ran after `git checkout v0.1.1` with `--commit v0.1.1 --npm-shasum 8c70e8b5…f744` and printed `Pin: 68e1d54… (v0.1.1); upstream files 0 -> 16`.

**Attempt 1**
- Files changed:
  - `.claude/skills/nestjs{,-feature,-auth,-data,-testing,-production}/`: 34 files, script-generated (16 upstream + 18 provenance), 2,362 lines not counted as hand-written LOC.
  - New `test/nestjs-vendor.test.js` (8 tests) and six new `docs/skills/nestjs*.md` pages.
  - `.gitattributes` (+6 `-text`), `docs/skills/README.md` (+6 rows), `docs/overview.md` (+6 rows), `.claude/skills/akili-panel/hooks/flow.mjs` (`SKILL_CATALOG` +6, `stack`).
  - Count pins: `test/install-cursor.test.js`, `test/install-akili-panel.test.js`, `test/akili-panel-cli-coverage.test.js`, `test/akili-panel-flow.test.js`, `test/diagram-design.test.js`, `test/akili-marketing-docs.test.js`, `docs/cli.md`, `test/fixtures/doctor-codex-baseline.txt`.
- Counts, each from a command run on the tree (NFR-4):
  - `find .claude/skills -type f -not -path '*/akili-panel/*' | wc -l` → 355 (321 + 34).
  - Packaged skills 32 → 38 in `install-akili-panel`, `cli-coverage`, `diagram-design`, `akili-marketing-docs` and `docs/cli.md:327,339,360,377`.
  - `cli-coverage:537` 33 → 39.
  - Fixture `ok 54` → `ok 60`, with 6 `OK` lines added.
  - Panel `Skills (32)` → 38, `Skills (31)` → 37, `stack (10)` → 16; the `SKILL_NAMES.stack` literal is updated.
- Implementer verification: `node --test test/nestjs-vendor.test.js` → 8 pass; `npm test` → `# tests 2134 # pass 2134 # fail 0`; `git diff --check` clean; no `.nestjs-sync/` leftover.
- Falsifiers (each run, observed red, reverted):
  1. One byte appended to `nestjs-data/references/data.md` → `not ok 1 - … FR-1 every UPSTREAM.md line matches its file's raw bytes, per folder` / `hash mismatch for nestjs-data/references/data.md`.
  2. The `nestjs-auth` `-text` line dropped → `not ok 8 - … NFR-3 .gitattributes declares the six trees -text` / `.gitattributes has no '-text' line for nestjs-auth`.
  3. `nestjs-auth` removed from `SKILL_CATALOG` → `not ok 1 - FR-5 every skill folder is in the catalog with the same binding (a miss names the skill)` / `skills missing from SKILL_CATALOG: nestjs-auth`. The Reviewer confirmed the assertion sits at `akili-panel-catalog.test.js:55`.
- Evidence re-run (Leader inline): **VERIFIED**. Vendor 8/8, `npm test` 2134/2134, 355 files, `git diff --check` clean.
- Reviewer (`opus`): **FAIL**. Vendoring, the Disqualifier and every count passed: all 10 reference files and each `LICENSE` are `cmp`-identical to `v0.1.1`; each `SKILL.md` differs only by the `metadata` block. Two issues:
  1. `docs/skills/nestjs.md` said "It leads `implement` for project setup and layout questions only." This violates `design.md` §9 *Matrix* (lead `nestjs-feature`; `nestjs` supports project start, layout and docs) and FR-6.
  2. `docs/skills/nestjs-feature.md` said "Leads `implement` on NestJS endpoint work; the project Skill Map's no-map fallback names it." This violates §9 (the lead covers every `implement / NestJS` task) and FR-8 bullet 3 (the no-map fallback is `/akili-specify` Step 2.1's list).
- Attempt-1 ADVISORY: stale comments at `install-cursor.test.js:357,404`; the `nestjs-feature` Observe note omitted `references/structure.md:56`; the P-13 record was missing from `execution.md` (recorded above); `skillWithoutMetadata` splits on `\n` only, which the NFR-3 `-text` test guards.
- Not Done / Assumptions (Implementer, verbatim):
  - "`panel.test.tsx` (lines 1058 and 1140) is unchanged. It names `nestjs-expert`, which stays in this task. It is vitest-based and I did not run it."
  - "I also updated stale comments in `install-cursor.test.js` (`14 + 318 = 332` → `14 + 355 = 369`, and 32 → 38 skill directories)."
  - "The `docs/skills/governance.md` page and the command docs are out of T2's scope and untouched."
  - Leader note: `panel.test.tsx` is outside `npm test` and CI, and its `LISTED` fixture is an explicit array, so the +6 catalog entries cannot change it. T10 owns its `nestjs-expert` lines (design §8).
- runtime events: none

**Attempt 2** (effort `xhigh`; the Reviewer report was relayed verbatim, the two comment and Observe advisories were tagged `[advisory-grade]`, and a phrase-family sweep over lead/support/fallback/Skill Map claims was mandated)
- Files changed:
  - `docs/skills/nestjs.md` → "Supports `implement` on NestJS for project start, layout and docs, and `module-design` for layout. It is the entry point that points to its five siblings; it leads nothing."
  - `docs/skills/nestjs-feature.md` → "Leads `implement` on NestJS; the other five support by activity. `/akili-specify` Step 2.1's no-map fallback names it." The Observe note now also names `references/structure.md:56`.
  - `docs/skills/nestjs-testing.md`: the sweep removed an unsupported "and `/akili-test`".
  - `test/install-cursor.test.js`: comments only, `:357` → 369/355 and `:404` → 38.
- Implementer verification: 4 named suites → 39 pass; `npm test` → 2134 pass, 0 fail; `git diff --check` clean.
- Evidence re-run (Leader inline): **VERIFIED**. `npm test` 2134/2134, `git diff --check` clean, 6 rows in each of `docs/skills/README.md` and `docs/overview.md`.
- Reviewer (`opus`): **PASS**. "Both issues from attempt 1 are fixed, and I found nothing new that fails the task." Every lead, support and Observe claim on the six pages was quote-checked against §9 and the vendored files.
- ADVISORY (final verdict):
  - Readability: two sentences on `nestjs-feature.md:22` ("Leads `implement`", "the no-map fallback names it") describe the end state and become true only after T5 and T6. The T6 review or T11 should confirm both still hold.
  - Readability: the `nestjs-production` Observe note does not name the upstream MCP-server step (`SKILL.md:41`) or the paid production rules (`SKILL.md:76`). Its closing user-approval line covers both.
- runtime events: none

- Decisions made: none beyond the brief (rows' Used-by cell = "Skill Map" only, per KZ-002).
- Issues encountered: attempt 1 wrote routing claims from its own reading instead of design §9. One review round lost (the KZ-002 class).
- spawns: Implementer `sonnet` 26 calls, 128,346 tokens, ended partial (assumptions only); Reviewer `opus` 19 calls, 126,687 tokens, ended fail; Implementer `sonnet` 8 calls, 72,877 tokens, ended complete; Reviewer `opus` 7 calls, 85,883 tokens, ended complete.
- Final verification: green.
- Running totals against the budget: tasks 2/11 · LOC ≈672 + 470 (T2 hand-written, 429 insertions + 41 deletions) ≈ 1,142 / ~2,050 · review rounds 3/18 (T2 was budgeted 2). No tripwire. LOC is at 56% after 2 of 11 tasks, so the overrun risk is noted here.
