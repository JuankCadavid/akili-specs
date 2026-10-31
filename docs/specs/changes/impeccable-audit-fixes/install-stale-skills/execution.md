# Execution: install-stale-skills

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/impeccable-audit-fixes/install-stale-skills` |
| Approval Mode | `pre-approved`: JC's instruction of 2026-10-31 14:23 (UTC-5), transmitted by the driver. Routine gates take the recommended option and are logged `auto-approved (pre-approved mode)`. The run stops on HALT, Pivot, budget tripwire, FATAL_FAIL, escalation, HITL, scope increase or requirement amendment |
| Start | 2026-10-31, base `1a593d4` |
| Personas | `.agents/` (no drift). No Step 8E wrappers, so workers run as fallback sub-prompts |
| Models | Leader opus; Implementer sonnet; Reviewer opus |
| Budget (design §12) | 4 tasks · ~650 LOC · ~7 review rounds. The tripwire stops the run at any overrun (JC: stop and ask) |

## Task Execution History

### T1 — `bin/install-compare.js` (FR-1)

- **Status:** PASS, 2026-10-31, 1 attempt
- **Files changed:** `bin/install-compare.js` (new, 67 lines); `test/install-compare.test.js` (new, 164 lines, 14 tests)
- **Red run:** a stub exporting both functions → 14/14 fail on assertions (e.g. `not ok 1 - file identical … state: 'stub' / 'identical'`)
- **Falsifiers (executed, restored):** (1) walk target-only files → `not ok 9 … differing: [ 'notes.txt' ]`; (2) CRLF normalized → `not ok 5 … actual: 'identical'`; (3) `stat` for `lstat` → `not ok 4`, `not ok 11`
- **Verification (Implementer):** 14/14; `npm test` 1359/1359
- **Evidence re-run (Leader, inline):** `node --test test/install-compare.test.js` → 14/14; `npm test` → `# tests 1359 # pass 1359 # fail 0`. **VERIFIED**
- **Reviewer (opus):** PASS. FR-1 walked term by term; edge cases probed in scratch (a file where a subdir belongs → `differs [sub/y.md]`; empty source → `identical`; absent target → `differs`); module is pure
- **ADVISORY (recorded, not acted on):** (Rel) a symlinked nested target subdirectory with equal bytes reads `identical`. `lstat` checks only the last component; `copyTreeSync` replaces such a link on `--force`. Accepted gap: FR-1 and §7.1 name only the entry's own target. (R) the CRLF test asserts `.state` only. (Rel) no test pins "mode not compared"
- **Implementer assumptions (carried):** an absent target reads `differs` (defensive, unreachable); source errors throw; code-unit sort
- **Requirements covered:** FR-1 (pure), NFR-3, NFR-5
- **spawns:** Implementer (sonnet) 8 calls, 80069 tokens, ended complete; Reviewer (opus): not reported at write time, ended complete (PASS)
- **Running totals:** tasks 1/4 · LOC 231 / ~650 · review rounds 1 / ~7
- **Gate:** `auto-approved (pre-approved mode)`

### T2 — Install classification, split counts, next steps, `Home:` (FR-2, FR-4)

- **Status:** PASS, 2026-10-31, 1 attempt
- **Files changed:** `bin/akili.js` (+46 −12: `require('./install-compare.js')`, `skipClassSuffix`, the three skip sites, counts threaded through `add()` / the direct skip / `runInstall`, `summaryCounts`, next-steps lines, `isUnderHome` + `Home:`); `test/install-stale-skills.test.js` (new, 184 lines, 9 tests)
- **Red run:** baseline `grep -c '(identical)' bin/akili.js` → 0. 8/9 tests red on assertions (e.g. test 1 `actual: '  skip existing …/.claude/commands/akili-archive.md'` without the suffix; test 8 `expected: true / actual: ~`). Test 5 (`--force` guard) is green by design
- **Falsifiers (executed, restored):** (1) suffix dropped in `copyDirectoryContents` → tests 1 and 2 red; (2) differs counted into identical → test 2 `actual: '… skipped 53 (identical 53, differs 0)'`, test 4 and test 8 red; (3) `Home:` unconditional → test 9 red
- **Verification (Implementer):** 9/9; consumer suites (install-cursor, impeccable-foreign, grokbot, grokbot-edge, social-marketing-install) 67/67; `npm test` 1368/1368; `install --tool all --dry-run` (scratch HOME) exit 0; `git diff --check` clean
- **Evidence re-run (Leader, inline):** `npm test` → `# tests 1368 # pass 1368 # fail 0`. **VERIFIED**
- **Reviewer (opus):** PASS. FR-2 and FR-4 walked term by term; it ran the CLI by hand (edited `tdd` → `skipped 53 (identical 52, differs 1)`; Grok Bot box path → no `Home:`); `isUnderHome` checked for prefix and win32 cases
- **ADVISORY (recorded, not acted on):** (Risk) a global `akili update` now prints `Home:` in its Install Summary, while design §7.2 said update output was unchanged. Resolved as an execute-time design edit (below); FR-4 already covers every install summary. (R) "1 existing entry differs … replace them" should read "it" for one entry. (Rel) `isUnderHome` rejects a `..cache`-style subdir (harmless). (Cov) no test pins the all-roots-outside-home negative; verified manually by the Reviewer
- **Decisions made:** execute-time spec edit: `design.md` §7.2, the `update` sentence, reworded to state that update's Install Summary gains the `Home:` line under FR-4. The approved requirement's meaning is unchanged. Carried as a named conformance check into the T3 Reviewer brief
- **Requirements covered:** FR-1 S1 (end to end), FR-2, FR-4 (summary), NFR-1, NFR-2 (claude, codex, grokbot)
- **spawns:** Implementer (sonnet) 23 calls, 108851 tokens, ended complete; Reviewer (opus): not reported at write time, ended complete (PASS)
- **Running totals:** tasks 2/4 · LOC 231 + 242 = 473 / ~650 · review rounds 2 / ~7
- **Gate:** `auto-approved (pre-approved mode)`
