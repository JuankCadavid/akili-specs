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

### T3 — Vendored-entry ownership for the six names

| Field | Value |
|---|---|
| Final status | **PASS** (attempt 2) |
| Date | 2026-11-23 |
| Attempts | 2 |
| Requirements covered | FR-3 bullets 1–2 and the *Developer already ran the upstream installer* scenario (THEN, AND, BUT) |
| Skills / effort | `tdd` (the task's list) · attempt 1 `medium`, attempt 2 `high` (effort bump after FAIL) |
| Approval | JC approved T3 2026-11-23 |

**Attempt 1**
- Files changed:
  - `bin/akili.js` (+12 −2): new `VENDORED_ENTRIES` set (`impeccable` + the six). The no-record policy checks `VENDORED_ENTRIES.has(name)`. `policy.detail` returns `(installed by npx @nestjs/skills)` when `.nestjs-skills` exists and otherwise keeps the `impeccable` version suffix. The doctor branch uses the set. `makeImpeccableForeignPolicy` was not renamed, and Grok Bot's ownership-record policy is untouched (P-3).
  - New `test/install-nestjs-foreign.test.js` (138 lines, 16 tests): three tests per no-record target (claude, opencode, antigravity with three roots, codex, cursor) plus one AKILI-copy test. Fixtures are built in temp dirs; no test reads `docs/specs/`.
- Implementer verification: targeted run (3 files) `# tests 44 # pass 44 # fail 0`; `npm test` `# tests 2150 # pass 2150 # fail 0`; `install --tool all --dry-run` exit 0; `git diff --check` clean.
- Deviation (Implementer): the doctor test adds a `SKILL.md` to its fixture, because `hasInstalledSkill` (`bin/akili.js:1834`) finds a skill only through `SKILL.md`. The install fixtures omit it, so their file set stays disjoint from upstream's (Disqualifier holds). The Reviewer judged this justified.
- Falsifier (executed by the Implementer and again by the Leader): the policy line was reverted to `if (name !== IMPECCABLE_ENTRY) return "owned";`. Result: 10 of 15 per-tool tests red (no-force and `--force` for all five tools; the doctor tests stay green). For example, `not ok 1 - … FR-3 (claude, no --force): a folder installed by npx @nestjs/skills is skipped whole and the other five are written` / `error: 'THEN stdout names it foreign with the marker note'`. The code was restored afterwards.
- **Factual correction to the T3 Falsifier field** (single answer, logged, no gate): the field predicts that a reverted policy makes `copyDirectoryContents` write `SKILL.md` and `references/` into the foreign folder. The Leader observed that this happens **only under `--force`**. There the folder ends with `.nestjs-skills`, `my-custom-rules.txt`, `LICENSE`, `NOTICE`, `SKILL.md`, `UPSTREAM.md` and `references`, which is a merge, and the vendored-tree snapshot and custom-file-absent assertions go red. Without `--force` the install prints `skip existing … (differs: LICENSE, NOTICE, SKILL.md, UPSTREAM.md, …)` and the folder stays byte-identical, so the red comes from the `skip foreign` stdout assertion. The Reviewer confirmed that the tests catch both paths. It also mutated the doctor line (5 doctor tests red) and the `.nestjs-skills` detail line (5 no-force tests red) on its own copy.
- Evidence re-run (Leader inline): **VERIFIED**. Targeted run 44/44 and the falsifier observed as above. The Leader noted that the comment block above `IMPECCABLE_ENTRY` was not updated, contrary to the Implementer's report.
- Reviewer (`opus`): **FAIL**, one issue: "The comment block above `IMPECCABLE_ENTRY` (`bin/akili.js:902-911`) still says the no-record policy 'judges one entry, `impeccable`, and passes every other name through as \"owned\"' … After this diff the policy judges every member of `VENDORED_ENTRIES` (seven names), so the comment is now false." It cited `design.md` §7.2 and the quote-check lesson.
- Attempt-1 ADVISORY: the doctor DD-8 comment still names only `impeccable/` (it sits in T3's scoped doctor branch and was fixed in attempt 2). The function name `makeImpeccableForeignPolicy` now covers seven names; §7.2 keeps it, so any rename belongs to a later spec.
- runtime events: none

**Attempt 2** (effort `high`; the Reviewer report was relayed verbatim, and the stale doctor comment in the scoped branch was included because this task's edit made it false)
- Files changed: `bin/akili.js` comments only.
  - The policy block (903–916) was rewritten: "It judges each name in VENDORED_ENTRIES (`impeccable` plus the six official NestJS skills) …", with a `@akili-spec changes/nestjs-official-skills T3 (DD-5)` tag.
  - The doctor DD-8 comment (~1981) was widened to "a vendored entry (`impeccable/` or a NestJS skill) without UPSTREAM.md".
  - A sweep found the call-site comment (1443), "judge only `impeccable`", and changed it to "judge only the vendored entries", with a T3 tag.
- Implementer verification: targeted 44/44; `npm test` 2150/2150; `git diff --check` clean.
- Evidence re-run (Leader inline): **VERIFIED**. Outside comments the diff is identical to attempt 1. `npm test` `# tests 2150 # pass 2150 # fail 0`; `git diff --check` clean; `install --tool all --dry-run` exit 0.
- Reviewer (`opus`, same reviewer resumed): **PASS**. "Issue 1 is closed, and attempt 2 changes comments only." The new comment text was checked against the code for membership, the `UPSTREAM.md` ownership rule, the takeover path and the doctor branch.
- ADVISORY (final verdict):
  - Readability `bin/akili.js:913-915`: without the marker, `policy.detail` reports the `version:` field from any vendored entry's `SKILL.md` frontmatter, not only the `impeccable` version.
  - Readability `bin/akili.js:1443`: the line tagged `changes/impeccable-hardening T2b` now carries wording T2b never wrote; the T3 tag line on 1444 supplies the traceability.
- runtime events: none

- Decisions made: the doctor DD-8 comment was fixed in attempt 2 as part of the scoped doctor branch, not as a new task.
- Issues encountered: the Implementer reported the comment as updated when it was not (the KZ-002 claim class). One review round was lost.
- spawns: Implementer `sonnet` 12 calls, 82,076 tokens, ended complete; Reviewer `opus` 13 calls, 86,826 tokens, ended fail; Implementer `sonnet` 7 calls, 67,784 tokens, ended complete; Reviewer `opus` (resumed) 1 call, 90,496 tokens, ended complete.
- Final verification: green.
- Running totals against the budget: tasks 3/11 · LOC ≈1,142 + 174 (T3: 164 insertions + 10 deletions) ≈ 1,316 / ~2,050 · review rounds 5/18 (T3 was budgeted 1). No tripwire. Remaining: ~734 LOC and 13 rounds for 8 tasks. The LOC overrun risk is still open.

### T4 — `doctor --agents` Skill Map scan

| Field | Value |
|---|---|
| Final status | **PASS** (attempt 1) |
| Date | 2026-11-23 |
| Attempts | 1 |
| Requirements covered | FR-5 bullets 1–4, *Project still maps NestJS to `nestjs-expert`* (THEN, AND, BUT), *Name in prose, not in the map* |
| Skills / effort | `tdd` (the task's list) · `medium` |
| Approval | JC approved T4 2026-11-23 |

**Attempt 1**
- Files changed:
  - New `bin/skill-map.js` (73 lines, pure, no I/O): exports `RETIRED_SKILLS` (one row, `{ name: "nestjs-expert", replacement: "nestjs-feature plus the official set (nestjs, nestjs-auth, nestjs-data, nestjs-production, nestjs-testing)" }`), `findSkillMapSection` and `scanSkillMap`. Returns `{ name, line, replacement }` in line order, 1-based, across CRLF and LF. T10 can require the same table.
  - `bin/akili.js` (+24): the require and `reportRetiredSkills(cwd)`, called after the *Tool root* lines and before the `.agents/` ABSENT return and the `--fix` guards (P-12). It reads `AGENTS.md` then `CLAUDE.md`, never assigns `process.exitCode`, never writes.
  - New `test/doctor-skill-map.test.js` (189 lines, 14 tests: 8 unit, 6 CLI). The current-personas project copies `.claude/templates/{leader,implementer,reviewer,tester}.md` into `.agents/` (exit 0). No test reads `docs/specs/`.
- Output: `RETIRED nestjs-expert (AGENTS.md:N) -> replace with nestjs-feature plus the official set (…)`; an unreadable file prints `warning could not read <file> for the Skill Map scan (<code>)`.
- Deviations (Implementer; the Reviewer judged each within §7.4):
  1. A `## Skill Map` heading opens a section only outside a code fence. §7.4 already treats fenced `## ` lines as non-headings for the section end; applying the rule to the opener avoids false hits from Markdown examples. Recorded, no pivot.
  2. The unreadable-file test is skipped on win32 and when running as root (permission bits not enforceable). That §7.4 row goes untested on Windows: a recorded gap.
- Red run: the unit test first failed with `Cannot find module '../bin/skill-map.js'` (greenfield, a missing-module red, not a behavioral one).
- Falsifier (executed, quoted):
  - Baseline: a copy of `bin/akili.js` at `7cbdb19`, temp project whose `AGENTS.md` Skill Map names `nestjs-expert` → `ABSENT …/.agents does not exist` and `RETIRED count: 0`.
  - Mutation A (`process.exitCode = 1` on a hit), by the Implementer and again by the Reviewer: `not ok 10 - CLI [current .agents/ (exit 0)] …` (`expected: 0 actual: 1`) and `not ok 14 - CLI: unreadable file …`. Test 9 (no `.agents/`) stays green, which is the Disqualifier the current-personas variant closes.
  - Mutation B (section-end check dropped): 6 red, including `not ok 12 - name only under '## History' prints nothing`.
  - Reviewer's own mutations: C (drop the leading-character check) → `not ok 6 - whole-token match …`; D (call after the ABSENT return) → `not ok 9`; E (call after the `--fix` guards) → only `not ok 9`.
  - All mutations reverted; the Reviewer confirmed with `shasum -c` OK.
- Evidence re-run (Leader inline): **VERIFIED**. `npm test` `# tests 2164 # pass 2164 # fail 0`; `node --test test/doctor-skill-map.test.js` 14/14; `git diff --check` clean; `install --tool all --dry-run` exit 0. In the repo root, `doctor --agents --allow-branch` prints no `RETIRED` line (the repo `AGENTS.md` has no `## Skill Map` heading).
- Reviewer (`opus`): **PASS**. Every FR-5 bullet, both scenarios, every §7.4 state row, DD-7, P-12 and NFR-5 are met.
- ADVISORY (record only):
  - A1: no test pins the "before the `--fix` guards" position. In a non-git temp directory the guards do not refuse, so mutation E is caught only by the no-`.agents/` ABSENT test. A refused `--fix` run (git repo on the default branch) would pin it.
  - A2: the replacement is checked loosely (`/nestjs-feature/` against the whole output, not the `RETIRED` line). No test asserts the official-set names, although `bin/skill-map.js:13` carries them.
  - A3: fence edge cases in `bin/skill-map.js:18,32-35`: an unclosed fence above the heading hides the Skill Map; ```` ``` ```` and `~~~` toggle each other; any indentation counts as a fence. Each fails quiet (false negative), never a write or an exit change.
- runtime events: none
- spawns: Implementer `sonnet` 13 calls, 88,462 tokens, ended complete; Reviewer `opus` 10 calls, 85,240 tokens, ended complete.
- Final verification: green.
- Running totals against the budget: tasks 4/11 · LOC ≈1,316 + 286 (T4: 24 + 73 + 189) ≈ 1,602 / ~2,050 · review rounds 6/18 (T4 was budgeted 1). No tripwire. Remaining: ~448 LOC and 12 rounds for 7 tasks. The LOC overrun risk has grown: T5 and T10 are the large ones.

### T5 — Backend routing: matrix, card, rules 5 and 9, `AGENTS.md` *Backend Skills*

| Field | Value |
|---|---|
| Final status | **PASS** (attempt 2) |
| Date | 2026-11-23 |
| Attempts | 2 |
| Requirements covered | FR-6 (all six bullets, *Existing Passport project* THEN and BUT), FR-7 (all bullets; presence proven, the scenario is an accepted risk), FR-8 bullet 3 (`AGENTS.md` *Backend Skills* only) |
| Skills / effort | `software-architect`, `cognitive-doc-design` (the task's list) · attempt 1 `medium`, attempt 2 `high` (effort bump after FAIL) |
| Approval | JC approved T5 2026-11-23 |

**Attempt 1**
- Files changed:
  - `.claude/skills/software-architect/references/backend-routing.md` (+8 −7): the Stack table NestJS row names the six with each idiom; the matrix `implement / NestJS` lead is `nestjs-feature` with the five support activities by name; module-design support reads "NestJS → `nestjs`"; rule 5 gains the package-preference clause; new rule 9 (link, MCP, paid rules, default telemetry with `--no-observe`); the `nestjs-expert` card becomes one family card (intro line updated); Attribution names Kamil Mysliwiec (MIT). No `nestjs-expert` mention remains in the file.
  - `AGENTS.md` (+6 −1): the `nestjs-expert` bullet under `## Backend Skills` becomes `nestjs-feature` plus five support bullets. No other section touched.
  - `test/backend-skill-routing.test.js` (+13 −3): `NINE` names `nestjs-feature`; new `NEST_SUPPORT` and `AGENTS_LISTED` constants; a lead-cell test for `implement / NestJS`.
  - `test/backend-skill-routing-coverage.test.js`: rules 1..9, the card name, and a new FR-6 FR-7 test (five support activities, *Must not decide*, rule 5 clause, rule 9, Attribution).
- Red run (executed): the lead-cell test against the unedited matrix → `not ok 3 - …implement / NestJS Lead cell is nestjs-feature…` with `actual '`nestjs-expert`'`, `expected '`nestjs-feature`'`.
- Mutation (executed): "and default telemetry" deleted from rule 9 → `not ok 4 … error: 'rule 9 title names default telemetry'`; reverted.
- Deviations (Implementer; the Reviewer accepted 1–3):
  1. Five separate support bullets in `AGENTS.md`, because the existing test reads the first backticked name per bullet. Within FR-8 bullet 3 and §9 ("the nine plus the five support members, as a named constant" = `AGENTS_LISTED`).
  2. No spec IDs in the matrix wording (existing no-spec-IDs test; grep for `FR-|NFR-|DD-|I-[0-9]|KZ-` returns nothing).
  3. A mutation revert accidentally opened an interactive `git checkout -p` with no input. The Reviewer confirmed nothing was lost: the live diff matched the supplied diff byte for byte.
  4. No test for the Passport-scenario route line ("no file carries a `Backend route:` line"). The Reviewer rejected this one (below).
- Evidence re-run (Leader inline): **VERIFIED**. `npm test` `# tests 2166 # pass 2166 # fail 0`; `git diff --check` clean.
- Reviewer (`opus`): **FAIL**, F-1: "the BUT half of the *Existing Passport project* scenario has no test". Its executed mutation (the `implement / NestJS` rule cell replaced with "Prefer `@nestjs/authentication` over Passport" and the rule 5 sentence "A stack skill never reopens them; a conflict is a spec gap for the Pivot Protocol." deleted) gave `# pass 33  # fail 0`. "No file carries a `Backend route:` line does not make this unprovable. The suite already proves scenario routes by resolving the matrix row." The test title already claimed "…, Passport route". Rule 9 facts were quote-checked against the vendored files (`nestjs-production/SKILL.md:37,41,76`, `nestjs/SKILL.md:33`) and found accurate; the disqualifier mutation (`nestjs-feature` moved to a support cell) gave 3 red.
- Attempt-1 ADVISORY A-1: a roundabout `"default telemetry".replace(…)` literal in the new rule-9 loop (the Implementer's own new code; fixed in attempt 2).
- runtime events: none

**Attempt 2** (effort `high`; the Reviewer report relayed verbatim; tests only)
- Files changed: `test/backend-skill-routing-coverage.test.js` only (final +26 −7). Three asserts in the FR-6 FR-7 test: `impl.rule` equals "No decision recorded in `design.md` is reopened"; `impl.support` includes "method skills as constraints already in `design.md`"; `rules()["5"]` includes the no-reopen sentence. The A-1 literal is now "telemetry dependency added by default".
- Mutation (executed by the Implementer, the Leader and the Reviewer): the Reviewer's Passport mutation → `not ok 4 - … FR-6 FR-7: … Passport route`, `# pass 32 # fail 1`. The Reviewer also deleted only the rule 5 sentence → `not ok 4`, so each half of the BUT is caught on its own. Restored each time (checksum OK).
- Evidence re-run (Leader inline): **VERIFIED**. Outside the test file the diff is identical to attempt 1. `npm test` `# tests 2166 # pass 2166 # fail 0`; `git diff --check` clean.
- Reviewer (`opus`, same reviewer resumed): **PASS**. "F-1 … is closed, and nothing else changed."
- ADVISORY (record only): A-2, the tracked `.claude/skills/nestjs-expert/` folder is still on disk; it belongs to T10.
- runtime events: none

- Decisions made: none beyond the accepted deviations.
- Issues encountered: the Implementer declared a Scope item ("Passport-scenario route line") unprovable instead of resolving the matrix row; one review round spent.
- spawns: Implementer `sonnet` 10 calls, 95,684 tokens, ended complete; Reviewer `opus` 14 calls, 93,382 tokens, ended fail; Implementer `sonnet` (resumed), 98,636 tokens, ended complete; Reviewer `opus` (resumed), 96,518 tokens, ended complete.
- Final verification: green.
- Running totals against the budget: tasks 5/11 · LOC ≈1,602 + 71 (T5: 53 insertions + 18 deletions) ≈ 1,673 / ~2,050 · review rounds 8/18 (T5 was budgeted 2). No tripwire. Remaining: ~377 LOC and 10 rounds for 6 tasks.

### T7 — Persona and agent guide: `leader.md`, `AGENTS.md` *Skill Usage*

| Field | Value |
|---|---|
| Final status | **PASS** (attempt 1) |
| Date | 2026-11-23 |
| Attempts | 1 |
| Requirements covered | FR-8 bullet 4 (amended: `leader.md` only), FR-8 bullet 3 (`AGENTS.md` *Skill Usage*) |
| Skills / effort | none (the task's list) · `medium` |
| Approval | JC approved T6–T11 as one continuous run on 2026-11-23 (stop only on a budget tripwire, a task failing after its attempts, or a decision for JC) |

**Attempt 1** (run in parallel with T6; file-disjoint, each Implementer ran only its targeted suites, the Leader ran `npm test` after both)
- Files changed: `.claude/templates/leader.md:25` (+1 −1), the example list now names `nestjs-feature`; `AGENTS.md:62` (+1 −1), the domain-skills example names `nestjs-feature`. `implementer.md` and `test/fixtures/personas` untouched (DD-12).
- Falsifier (executed by the Implementer and again by the Reviewer, on a backup): `implementer.md:27` edited the same way → `node --test test/agents-doctor.test.js test/agents-doctor-io.test.js test/persona-digests.test.js` gave `not ok 7 - verbatim-marked.md: every section is current, exit 0`, `not ok 31`, `not ok 33`, `not ok 35`, `# pass 65 # fail 4`. Restored; shasum equal; `git diff --stat .claude/templates/implementer.md test/fixtures/personas` empty.
- Evidence re-run (Leader inline): **VERIFIED**. The three persona suites `# pass 69 # fail 0`; `npm test` (with T6 in the tree) `# tests 2167 # pass 2167 # fail 0`; `git diff --check` clean.
- Reviewer (`opus`, one reviewer for T6 and T7 with separate verdicts): **PASS**. Digest check (P-11): a deployed copy of the edited template reads `CURRENT primary-instructions`; a copy of the HEAD template reads `OUTDATED primary-instructions (matched 2.42.0)`, which `--fix` upgrades. No test pins `leader.md` live; the new hash and `since=` marker are written by `scripts/release.js` at release.
- Reviewer note (record only): `doctor --agents --project <path>` reported this checkout's own `.agents/` rather than the target; run doctor from inside the project.
- runtime events: none
- spawns: Implementer `sonnet` 2 calls, 61,915 tokens, ended complete; Reviewer `opus` (shared with T6) 21 calls, 98,379 tokens, ended complete.
- Final verification: green.
- Running totals against the budget: tasks 6/11 · LOC ≈1,673 + 4 ≈ 1,677 / ~2,050 · review rounds 9/18 (the shared T6/T7 review is counted once per task: T7's 1 here, T6's on its entry). No tripwire.

### T6 — Command text: `/akili-constitution` and `/akili-specify`

| Field | Value |
|---|---|
| Final status | **PASS** (attempt 2) |
| Date | 2026-11-23 |
| Attempts | 2 |
| Requirements covered | FR-8 bullet 3 (commands; the no-map fallback list names `nestjs-feature`) |
| Skills / effort | `cognitive-doc-design` (the task's list) · attempt 1 `medium`, attempt 2 `high` (effort bump after FAIL) |
| Approval | JC approved T6–T11 as one continuous run on 2026-11-23 |

**Attempt 1** (in parallel with T7; file-disjoint)
- Files changed: `.claude/commands/akili-specify.md:254` (+1 −1) → `- \`nestjs-feature\``; `.claude/commands/akili-constitution.md` :255 (Step 5 candidates) → `nestjs-feature` and :728 (Step 8D pool) → the six (`nestjs-feature`, `nestjs`, `nestjs-auth`, `nestjs-data`, `nestjs-production`, `nestjs-testing`); `test/ai-agent-guardrails-evals.test.js`: anchor moved to `- \`nestjs-feature\`` plus a new test that finds the Step 2.1 list by its lead-in "otherwise pick from:" and asserts `nestjs-feature` present, `nestjs-expert` absent.
- Red run (executed): `fallback list must name nestjs-feature: - \`nestjs-expert\` | - \`golang-pro\` | …` with the anchor setup passing (Disqualifier: the red comes from the content assertion).
- Mutation (executed by the Implementer and the Reviewer): old line restored → `not ok 14 - NestJS official skills FR-8: specify Step 2.1 fallback list holds nestjs-feature and no nestjs-expert` and `not ok 15 - … does not name ai-agent-development` (`expected the fallback list in Step 2.1`), `# pass 46 # fail 2`. The Reviewer also added `nestjs-expert` beside `nestjs-feature` → `'fallback list must not name nestjs-expert …'`.
- Evidence re-run (Leader inline): **VERIFIED**. `npm test` (with T7 in the tree) `# tests 2167 # pass 2167 # fail 0`; `git diff --check` clean.
- Reviewer (`opus`, one reviewer for T6 and T7): **FAIL**, Issue 1: "`.claude/commands/akili-constitution.md:255` names only `nestjs-feature`, but FR-8 asks for the official set there." FR-8 bullet 3's one-entry exception covers a no-map fallback list (`/akili-specify` Step 2.1), not Step 5, whose lead-in says "the same set feeds the `## Skill Map` in Step 8D".
- runtime events: none

**Attempt 2** (effort `high`; the Reviewer report relayed verbatim)
- Files changed: `akili-constitution.md` Step 5 (:255–260) one bullet per skill, the six in the Step 8D order; new test "NestJS official skills FR-8: constitution Step 5 and Step 8D name the same six NestJS skills" (exact six in order at Step 5, exact six at the single pool line, no `nestjs-expert` in the file). No test parsed the Step 5 list before.
- Mutations (executed): Implementer dropped the `nestjs-data` bullet → `not ok 15 …` red; Reviewer swapped `nestjs-auth`/`nestjs-data` → `not ok 15 … Step 5 list must be the six, in order`, and added `nestjs-expert` to the pool → `not ok 15 … Step 8D pool must be the six, in order`. All restored (shasum OK).
- Evidence re-run (Leader inline): **VERIFIED**. `npm test` (with T8 in the tree) `# tests 2169 # pass 2169 # fail 0`; `git diff --check` clean.
- Reviewer (`opus`, resumed): **PASS**. "Issue 1 closed … nothing else changed."
- runtime events: none

- Issues encountered: the Implementer read Step 5 as a fallback list; one review round spent.
- spawns: Implementer `sonnet` 5 calls, 67,047 tokens, ended complete; Reviewer `opus` (shared with T7) 21 calls, 98,379 tokens, ended fail; Implementer `sonnet` (resumed) 4 calls, 71,410 tokens, ended complete; Reviewer `opus` (resumed, shared with T8) 7 calls, 120,313 tokens, ended complete.
- Final verification: green.
- Running totals against the budget: tasks 7/11 · LOC ≈1,677 + 37 (T6: 35 insertions + 4 deletions, ≈37) ≈ 1,714 / ~2,050 · review rounds 11/18 (T6 was budgeted 2, used 2). No tripwire.

### T8 — Governance and release checklist

| Field | Value |
|---|---|
| Final status | **PASS** (attempt 2) |
| Date | 2026-11-23 |
| Attempts | 2 |
| Requirements covered | FR-8 bullet 1, FR-4 bullet 4 (*Removal / Fusion Log* row), FR-2 bullet 6 (release-checklist step) |
| Skills / effort | `cognitive-doc-design` (the task's list) · attempt 1 `medium`, attempt 2 `high` (effort bump after FAIL) |
| Approval | JC approved T6–T11 as one continuous run on 2026-11-23 |

**Attempt 1** (in parallel with the T6 rework; file-disjoint)
- Files changed: `docs/skills/governance.md` — *Vendored* rule 4 names both sync scripts; "Current member" → "**Current members:**" with `impeccable` and the official set (Kamil Mysliwiec, MIT, `nestjs/agent-skills`, pinned at `@nestjs/skills` v0.1.1); a six-folder exception sentence for checklist item 4; the `stack` row names the six; a *Removal / Fusion Log* row dated 2026-11-23 (reason text written by the Implementer; the design gave only "a row dated at execute"; the Reviewer found it consistent with §9). `docs/release-checklist.md:22` — a NestJS pin step after the Impeccable one (`UPSTREAM.md`, upstream's latest tag, `npm view @nestjs/skills@<version> dist.shasum`, the "current" or sync record). `test/nestjs-vendor.test.js` — a new test scoped to the *Vendored* section (Disqualifier) plus both `UPSTREAM.md` pins in the checklist.
- **Factual correction (no gate, logged):** T8's Consumers field says "none beyond the new assertion". The governance edit turned `test/modern-web-guidance.test.js:444` red (it pinned `**Current member: \`impeccable\`**`). The Implementer updated that one assertion to `/\*\*Current members:\*\*[\s\S]*- \`impeccable\` \(/`; the `doesNotMatch` MWG exclusion is unchanged. The Reviewer confirmed the test still pins what it meant and goes red against HEAD's governance (`not ok 41`).
- Red run (executed): `"Vendored section does not say 'Current members'"`.
- Mutation (executed by the Implementer and the Reviewer): only the official-set bullet removed from *Vendored* (the Removal Log and `stack` row still name the set) → `not ok 9 … 'Vendored section does not list nestjs'`, `# pass 8 # fail 1`.
- Evidence re-run (Leader inline): **VERIFIED**. `npm test` `# tests 2169 # pass 2169 # fail 0`; `git diff --check` clean.
- Reviewer (`opus`): **FAIL**, Issue 1: "`docs/skills/governance.md:54` doesn't say why the six folders aren't fused." FR-8 bullet 1 asks to "record why a family of six sibling folders is accepted against checklist item 4 (fusing them would break the verbatim rule)"; the line said item 4 "is met by that split", which contradicts "exception". Facts in the *Current members* bullet checked against all six `UPSTREAM.md`/NOTICE/LICENSE (Tag `v0.1.1`, commit `68e1d54`): correct. The Removal Log row's "spec `changes/nestjs-official-skills` (FR-4)" follows the precedent row's form and cites a spec name, not a path: NFR-5 holds.
- Attempt-1 note (non-blocking): `release-checklist.md:22` called `UPSTREAM.md` "shared by the six official folders"; each folder has its own (DD-1). Fixed in attempt 2 because it is this task's own new line and factually wrong.
- runtime events: none

**Attempt 2** (effort `high`; the Reviewer report relayed verbatim)
- Files changed: `governance.md:54` → "The official NestJS set is six sibling folders from one upstream, accepted against acceptance checklist item 4 (*Size justified*), which prefers one skill with `references/`: fusing the six into one skill would change upstream bytes and break rule 1 (unmodified upstream build)."; `release-checklist.md:22` → "the pin shared by the six official folders, each with its own `UPSTREAM.md`"; one assertion that the *Vendored* section contains "break rule 1".
- Mutations (executed): Implementer "break rule X" → red; Reviewer "lose the provenance files" → `not ok 100 … 'Vendored section does not state why the six folders are not fused (break rule 1)'`. Restored (shasum OK).
- Evidence re-run (Leader inline): **VERIFIED**. `npm test` `# tests 2169 # pass 2169 # fail 0`; `git diff --check` clean.
- Reviewer (`opus`, resumed): **PASS**. "It closes issue 1, and nothing else changed since attempt 1."
- ADVISORY (record only): the new assertion keys on the literal "break rule 1"; a rewording would fail it even with the reason kept.
- runtime events: none

- spawns: Implementer `sonnet` 7 calls, 74,465 tokens, ended complete; Implementer (resumed, consumer fix) 2 calls, 75,877 tokens; Reviewer `opus` (resumed, shared with T6) 7 calls, 120,313 tokens, ended fail; Implementer (resumed) 1 call, 78,140 tokens, ended complete; Reviewer (resumed) 1 call, 122,870 tokens, ended complete.
- Final verification: green.
- Running totals against the budget: tasks 8/11 · LOC ≈1,714 + 34 (T8: 30 insertions + 4 deletions) ≈ 1,748 / ~2,050 · review rounds 13/18 (T8 was budgeted 2, used 2). No tripwire. Remaining: ~302 LOC and 5 rounds for T9, T10, T11.

### T9 — Docs prose: `flow.md`, command docs, `cli.md` output

| Field | Value |
|---|---|
| Final status | **PASS** (attempt 2) |
| Date | 2026-11-23 |
| Attempts | 2 |
| Requirements covered | FR-8 bullet 3 (`docs/commands/akili-constitution.md`, `docs/commands/akili-test.md`, `docs/flow.md`); design §6 (`docs/cli.md` output lines) |
| Skills / effort | `cognitive-doc-design` (the task's list) · attempt 1 `medium`, attempt 2 `high` (effort bump after FAIL) |
| Approval | JC approved T6–T11 as one continuous run on 2026-11-23 |

**Attempt 1** (started in parallel with the T8 re-review; file-disjoint)
- Files changed (+6 −4): `docs/commands/akili-constitution.md:123` (Step 5 / Skill Map list) → the six; `docs/flow.md:658` (illustrative `e.g. …` list) → "`nestjs-feature` (leads the `nestjs*` set)"; `docs/commands/akili-test.md:70` (Tester's skills) → `nestjs-testing`, because the routing matrix's tests support is `nestjs-testing`; `docs/cli.md` gains `deleted retired skill <dir> (replaced by <replacement>)`, `STALE`/`REMOVED <name> (retired, replaced by <replacement> …)`, `skip foreign <path> (installed by npx @nestjs/skills)` and a placeholder `RETIRED` line.
- Falsifier (executed): before, `grep -n nestjs-expert` on the three docs → 3 hits (`docs/flow.md:658`, `docs/commands/akili-constitution.md:123`, `docs/commands/akili-test.md:70`); after, 0 hits across the four docs.
- Deviation (accepted): `deleted retired skill` and `STALE/REMOVED (retired, …)` come from design §6, because the CLI prints only the legacy variants until T10. The Reviewer confirmed they match §6 character for character, so T10 can emit them as written.
- Evidence re-run (Leader inline): **VERIFIED**. `npm test` `# tests 2169 # pass 2169 # fail 0`; `git diff --check` clean; grep 0 hits.
- Reviewer (`opus`): **FAIL**, Issue 1: "the `RETIRED` example in `docs/cli.md:702` hardcodes the file name, so it is wrong for a `CLAUDE.md` hit" (`bin/akili.js:2475` prints `${file}`, either `AGENTS.md` or `CLAUDE.md`; the T9 Scope gives `(<file>:<line>)`). Per-site judgments against FR-8 all OK. The Reviewer's mutation (`nestjs-expert` restored in `akili-test.md`) left the docs suites green: these sites are unguarded until T10's surface test, as the T9 Falsifier says.
- Process note: the Implementer did not read `.agents/implementer.md` before attempt 1; it read it at the start of attempt 2.
- runtime events: none

**Attempt 2** (effort `high`; the Reviewer report relayed verbatim)
- Files changed: `docs/cli.md:702` → `RETIRED <retired-skill> (<file>:<line>) -> replace with <replacement>`; `docs/commands/akili-constitution.md:123` reordered to the command's order (Reviewer advisory 3, the task's own line).
- Evidence re-run (Leader inline): **VERIFIED**. The two diffs differ in these two lines only. `npm test` `# tests 2169 # pass 2169 # fail 0`; `git diff --check` clean.
- Reviewer (`opus`, resumed): **PASS**. "Issue 1 is closed."
- **Factual correction (no gate, logged; from Reviewer advisory 1):** T4 shipped the `RETIRED` line as `RETIRED <name> (<file>:<line>) -> replace with <replacement>`, while design §6 reads `— replaced by <replacement>`. T4's entry did not record it. The docs follow the shipped code. FR-5 asks only for file, line, name and replacement, all present.
- ADVISORY (record only): the existing `cli.md` sentence that the doctor does not compare "an `impeccable/` without `UPSTREAM.md`" leaves out the NestJS entries T3 gave the same rule. Outside T9's scope list; not widened.
- runtime events: none

- spawns: Implementer `sonnet` 6 calls, 68,345 tokens, ended complete; Reviewer `opus` (resumed, shared) 5 calls, 136,978 tokens, ended fail; Implementer (resumed) 2 calls, 70,899 tokens, ended complete; Reviewer (resumed) 1 call, 138,945 tokens, ended complete.
- Final verification: green.
- Running totals against the budget: tasks 9/11 · LOC ≈1,748 + 10 ≈ 1,758 / ~2,050 · review rounds 15/18 (T9 was budgeted 1, used 2). No tripwire. Remaining: ~292 LOC and 3 rounds for T10 (budget 2) and T11 (budget 1); the +2 margin is spent.

### T10 — Retire `nestjs-expert`: installer table, folder, every pinned registry, surface test

| Field | Value |
|---|---|
| Final status | **PASS** (attempt 2) |
| Date | 2026-11-23 |
| Attempts | 2 |
| Requirements covered | FR-4 bullets 1–3 and *Upgrade over an older install* (THEN, AND, BUT), FR-8 bullet 5 (`SKILL_CATALOG` −1), FR-8 *No live surface names the retired skill* (THEN, BUT), NFR-4, NFR-5 |
| Skills / effort | `tdd` (the task's list) · attempt 1 `high` (Size L, destructive installer path; one-line reason: started above the `medium` default because the path deletes user folders), attempt 2 `xhigh` (effort bump after FAIL) |
| Approval | JC approved T6–T11 as one continuous run on 2026-11-23 |

**Attempt 1**
- Files changed (hand-written ≈233 lines: +171 −62 across 17 files, whole-file deletions excluded):
  - `bin/akili.js` (+8 −20): `LEGACY_SKILLS` removed; both loops (install/update cleanup, doctor STALE) read `RETIRED_SKILLS` from `bin/skill-map.js` and print the replacement; both `!paths.sharedSkillsRoot` guards kept (P-2). Strings match design §6: `deleted retired skill <dir> (replaced by <replacement>)`, `STALE <name> (retired, replaced by <replacement> — run with --fix or akili update to remove)`, `REMOVED <name> (retired, replaced by <replacement>)`. The dry-run line is `would delete retired skill … (replaced by …)` (§6 is silent on it).
  - `bin/skill-map.js` (+4): the eight `gsap-*` rows, replacement `gsap-animation`.
  - Deleted `.claude/skills/nestjs-expert/` and `docs/skills/nestjs-expert.md`; their rows out of `docs/skills/README.md` and `docs/overview.md`. `SKILL_CATALOG` −1 (`.claude/skills/akili-panel/hooks/flow.mjs`); `panel.test.tsx` names `nestjs-feature`.
  - P-10 pins to 37: `test/install-cursor.test.js` (`SKILL_FILE_EXPECTED` 355 → 354, 369 → 368, 247 → 246, 38 → 37); `test/fixtures/doctor-codex-baseline.txt` (−1 line, `ok 60` → `ok 59`, DD-10); `test/akili-panel-flow.test.js` (stack 16 → 15, 38 → 37); `test/akili-panel-cli-coverage.test.js` (38 → 37, `:537` 39 → 38).
  - Count consumers P-10 did not list (factual correction, logged; the 38 → 37 change broke them): `test/install-akili-panel.test.js`, `test/akili-marketing-docs.test.js`, `test/diagram-design.test.js`, `docs/cli.md` ("38 packaged skills" → 37). `docs/skills/governance.md:79` example → `nestjs-feature` (a live docs mention outside the allowlist).
  - New `test/retired-skills.test.js` (71 lines, 17 tests): claude, opencode, antigravity → `doctor` STALE, `--fix` REMOVED, folder gone; `install` and `update` delete with the replacement; `gsap-core/` still names `gsap-animation`; codex, cursor, grokbot → a `nestjs-expert/` created in the shared root first is untouched and not reported (Disqualifier).
  - New `test/nestjs-retirement-surface.test.js` (50 lines, 2 tests): walks the repo including `test/` and `.claude/`, skips `docs/specs/` wholesale (never read, NFR-5), `.agents/`, `node_modules`, `.git`, `.codegraph`.
- Falsifier (executed, quoted):
  - Baseline at HEAD: `install --tool claude` + `doctor --tool claude` → `OK nestjs-expert`, no STALE.
  - Guard removed (Implementer and Reviewer) → `not ok 13 - codex: a nestjs-expert folder in the shared root is untouched and not reported` (+ cursor, grokbot), `# pass 12 # fail 3`.
  - `| nestjs-expert | x |` in `docs/overview.md` → surface test names `docs/overview.md:225`. The Reviewer's own: `.claude/commands/akili-execute.md:450` and `docs/overview.md:83` red. STALE text hard-coded to `gsap-animation` → `not ok 1/5/9 … doctor reports STALE…`.
- Allowlist deviations (Reviewer verdicts): `releases/` and `test/fixtures/personas/` justified (FR-8 WHEN excludes `releases/` and `test/fixtures/`; the fixtures copy the template); `doctor-skill-map`, `backend-skill-routing-coverage`, `ai-agent-guardrails-evals` justified as "a test asserting retirement"; `.agents/` skip fine (untracked).
- Evidence re-run (Leader inline): **VERIFIED**. `npm test` `# tests 2186 # pass 2186 # fail 0`; `npm run verify:cli` `14 commands | 37 skills | 1 plugin | 8 resources`; `git diff --check` clean. Fresh-`HOME` `install --tool all` + `doctor --tool all` (Implementer): no STALE or `nestjs-expert` line; `CLAUDE HEALTHY ok 60`, `OPENCODE ok 59`, `ANTIGRAVITY ok 59`, `CODEX ok 59`, `CURSOR ok 59`.
- Reviewer (`opus`): **FAIL**, Issue 1: "`test/nestjs-retirement-surface.test.js:21` allows the whole template file … I appended a second line … `# pass 2 / # fail 0`." Violates T10 Scope ("`implementer.md:27`"), DD-11, and the FR-8 BUT ("must NOT find `nestjs-expert` in … a template"). Advisory: whole-file allowance on `bin/skill-map.js`; stale "38" wording in `install-akili-panel.test.js`.
- runtime events: none

**Attempt 2** (effort `xhigh`; the Reviewer report relayed verbatim)
- Files changed: `test/nestjs-retirement-surface.test.js` (≈18 lines): `ALLOWED` is `[file, line pattern]`; `implementer.md` and `test/fixtures/personas/` only on `(e.g., \`shadcn-ui\`, \`nestjs-expert\`)`, `bin/skill-map.js` only on `name: "nestjs-expert"`, governance only on the Removal Log row; whole-file only for `CHANGELOG.md`, `releases/` and the five retirement tests. `test/install-akili-panel.test.js` stale 38s → 37 (word-level, lines already counted).
- Mutations (executed): second `nestjs-expert` line in `implementer.md` (Implementer, Leader, Reviewer) → `'.claude/templates/implementer.md:131'`, `# pass 1 # fail 1`; a mention in `bin/skill-map.js` logic → `'bin/skill-map.js:78'`; a mention in `test/fixtures/personas/crlf.md` (Reviewer) → `'test/fixtures/personas/crlf.md:131'`. All restored (shasum OK).
- Evidence re-run (Leader inline): **VERIFIED**. `npm test` `# tests 2186 # pass 2186 # fail 0`; `git diff --check` clean; final diff +175 −66.
- Reviewer (`opus`, resumed): **PASS**. "Issue 1 is closed." ADVISORY: none.
- runtime events: none

- Remaining `nestjs-expert` hits outside `docs/specs/` (all allowlisted): `CHANGELOG.md:928`, `releases/v2.8.0.md:14`, `bin/skill-map.js:11`, `.claude/templates/implementer.md:27`, the Removal Log row in `docs/skills/governance.md`, the persona fixtures' copied line, and the five retirement tests.
- spawns: Implementer `sonnet` 29 calls, 106,738 tokens, ended complete; Reviewer `opus` 15 calls, 105,787 tokens, ended fail; Implementer (resumed) 2 calls, 110,687 tokens, ended complete; Reviewer (resumed) 2 calls, 109,745 tokens, ended complete.
- Final verification: green.
- Running totals against the budget: tasks 10/11 · LOC ≈1,758 + 241 ≈ 1,999 / ~2,050 · review rounds 17/18 (T10 was budgeted 2, used 2). No tripwire. Remaining: ~51 LOC and 1 round for T11.
