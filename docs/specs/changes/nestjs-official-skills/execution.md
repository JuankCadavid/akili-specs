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
