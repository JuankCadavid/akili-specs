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
