# Execution: design-eval-followup

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/impeccable-audit-fixes/design-eval-followup` |
| Approval Mode | `pre-approved (JC, 2026-10-31)`: routine gates log `auto-approved (pre-approved mode)`; HALT, Pivot, budget tripwire, `FATAL_FAIL` and destructive actions stop |
| Start | 2026-10-31, base `7e204b1` |
| Personas | `.agents/` (`akili doctor --agents`: no drift blocking). No Step 8E wrappers: the fallback sub-prompt reads the persona file |
| Models | Leader opus; Implementer sonnet (T2); Reviewer opus (author ≠ auditor) |
| Budget (design §12) | 4 tasks · ~210 LOC · ~7 review rounds |

## Task Execution History

### T1 — FR-1, banner precedence in *First-visit pass* item 4; test file created

- **Status:** PASS, 2026-10-31, 1 attempt
- **Files changed:** `.claude/skills/impeccable-bridge/SKILL.md` (item 4, one line: +1 −1); `test/design-eval-followup.test.js` (new, 71 lines, 9 tests)
- **Red run:** baseline greps `only a would-be`, `whatever the CTA outcome`, `keeps its own reason` → 0. First run `# tests 9 # pass 3 # fail 6`, each failure an `AssertionError` on its FR-1 message (`banner state`, `precedence`, `outcome stands`, `rationale`, `own reason`, `remedy scope`). Assertions c (preservation pin) and h (P-16 guard) pass at baseline by design, as tasks.md states
- **Falsifiers (executed, restored):** (1) delete "A `below fold` or `covered` outcome stands" → `not ok 4 … error: 'outcome stands'`; (2) old sentence restored → `# fail 6` incl. `not ok 2 … error: 'precedence'`; (3) "matching the text 'Agenda'" in item 3 → `not ok 8 … error: 'item 3 identification names no text match'`
- **Verification (Implementer):** 9/9; consumer suites 115/115; `npm test` 1324/1324; vendored diff empty
- **Evidence re-run (Leader, inline):** `node --test test/design-eval-followup.test.js` → 9/9; `npm test` → `# tests 1324 # pass 1324 # fail 0`. **VERIFIED**
- **Reviewer (opus):** PASS. Every FR-1 bullet and scenario clause walked term by term; the pins at `:234` and `:248` survive; the priority bullet and item 3 are byte-identical
- **ADVISORY (recorded, not acted on):** (R) "with its P1 or FAIL" relies on the priority bullet to say which command reports which; (Risk) the P-16 guard proves absence of "text", not identification. The fixture stays a `/akili-validate` walkthrough; (Rel) `\btext\b` would trip on a future "alt text" → narrow the regex, do not drop the guard
- **Walkthrough (Implementer, checked by the Reviewer):** scenario 1 → `below fold (y=650)` P1/FAIL + banner `not rendered` + remedy; scenario 2 → `Unevaluated (consent banner not rendered: …)`; P-16 → banner `visible`, each viewport its own item 3 outcome; held-out `covered` + no banner → `covered` stands, P1/FAIL
- **Not Done / Assumptions (verbatim gist):** the T4 restatement hits (`docs/skills/impeccable-bridge.md:37`, the `CHANGELOG.md` first-visit bullet) were left for T4; "beside" was written as "recorded beside the CTA outcome" per design §7.1 / J-A10. No owed item and no blocker → no continuation
- **Requirements covered:** FR-1 (all), NFR-1, NFR-3, NFR-5
- **spawns:** Implementer (sonnet) 19 calls, 99244 tokens, ended complete; Reviewer (opus): not reported by host at write time, ended complete (PASS)
- **Running totals:** tasks 1/4 · LOC ~72 / ~210 · review rounds 1 / ~7. Under budget
- **Gate:** `auto-approved (pre-approved mode)`

### T2 — FR-3, the download call's environment under an exclusion

- **Status:** PASS, 2026-10-31, 1 attempt
- **Files changed:** `.claude/skills/impeccable-bridge/SKILL.md` (Step 0 item 4: new unset/`PATH` sentence after the kept `:79` sentence, no-other-call sentence replaced, record field widened; *Engine consent* row *Home override*); `test/design-eval-contract.test.js` (pins `:60`, `:97`, `:106` updated); `test/design-eval-followup.test.js` (+41 lines, 7 tests). Diff 47+ / 6−
- **Red run:** baseline `IMPECCABLE_BIN\` unset` → 0, `real home` → 0. First run `# pass 10 # fail 6`, each failure on its FR-3 message (`bin unset`, `path filter`, `reason`, `no other call`, `record shape`, the row regex); assertion 7 (*Launcher form* has no `env -u`/`PATH=`) is a negative guard, green by design
- **Falsifiers (executed, restored):** (1) drop "unsets `IMPECCABLE_BIN`" → `not ok 84 … 'no other call'` + `:97` pin red; (2) delete "before the home override" → `not ok 82 … 'resolution order'`; (3) revert the record field → `not ok 85 … 'record shape'` + `:106` pin red
- **Verification (Implementer):** consumer suites 131/131; `npm test` 1331/1331; vendored diff empty; `git diff --check` clean
- **Evidence re-run (Leader, inline):** `npm test` → `# tests 1331 # pass 1331 # fail 0`. **VERIFIED**
- **Reviewer (opus):** PASS. FR-3 walked term by term; `:79` byte-identical; no contradiction with Step 0 item 3 or *Launcher form*; both launchers' order re-read (`impeccable:90-91`, `:147-148`, `:151`; `.cmd:29-32`, `:95-100`); updated pins keep their intent and fail on the baseline
- **ADVISORY (recorded, not acted on):** (R) *Launcher form* "Every call carries the Step 0 pin inline" reads loosely against the pre-pin download call; item 4 settles it; (Rel) "resolved path" does not say whether symlinks are followed (consistent with the existing Exclusion paragraph)
- **Walkthrough (Implementer):** the FR-3 scenario → neither excluded binary runs; download into `/tmp/x/bin/<VERSION>/`; record `HOME=<dir>; IMPECCABLE_BIN unset; PATH entries removed: ~/.impeccable/bin (one call)`. Held-out `/usr/local/bin` kept → `curl`/`shasum` reachable (DD-5)
- **Sweep:** `No other call changes it` → only a negation guard in the new test. `Download home override` → reference `:99` and `CHANGELOG.md:12` left for T4
- **Requirements covered:** FR-3 (all), NFR-2, NFR-3
- **spawns:** Implementer (sonnet) 12 calls, 96791 tokens, ended complete; Reviewer (opus): not reported by host at write time, ended complete (PASS)
- **Running totals:** tasks 2/4 · LOC ~125 / ~210 · review rounds 2 / ~7. Under budget
- **Gate:** `auto-approved (pre-approved mode)`

### T3 — FR-2, byte-exact strip and the reference command in *Verify*

- **Status:** PASS, 2026-10-31, 1 attempt
- **Files changed:** `.claude/skills/impeccable-bridge/SKILL.md` (Step 0 *Verify*: byte-exact clause, non-conformance clause, `node -e` reference command, after the kept range sentence); `test/design-eval-followup.test.js` (5 tests)
- **First step (executed before the edit, from `.claude/skills/impeccable`):** `SKILL.md` → `a2ba4387401c11dc28fd58d4962df1a8dd39d5c3b1fdca45549171c6c26d6e4e`; copy with `\n` appended → `6fccc12fd4b318c61b0c4d44c5ca24d979d373fcc68f09138917480f74dc6244`
- **Red run:** `# pass 16 # fail 5`: `not ok 17 … 'byte-exact'`, `not ok 18 … 'non-conformance'`, `not ok 19 … 'known case'`, `not ok 20`/`21 … 'a backticked node -e reference command ships in Verify'`
- **Falsifiers (executed, restored):** (1) `join('\n')+'\n'` in the shipped command → `not ok 21 … expected: 'a2ba4387…', actual: '6fccc12f…'`; (2) delete "or removes" → `not ok 18 … 'non-conformance'`
- **Verification (Implementer):** consumers 136/136; `npm test` 1336/1336; vendored diff empty; `git diff --check` clean; no temp files left
- **Evidence re-run (Leader, inline):** `npm test` → `# tests 1336 # pass 1336 # fail 0`. **VERIFIED**
- **Reviewer (opus):** PASS. FR-2 walked term by term. The Reviewer extracted the shipped command and ran it under `sh`, `zsh` and `bash` with `set -H`: all three print `a2ba4387…`; the newline copy prints `6fccc12f…`. Quoting rule checked programmatically. The behavioral test runs the extracted string (not a plumbing test); whole-line matching holds (lines 8 and 14)
- **ADVISORY (recorded, not acted on):** (Rel) no `metadata:` line → a wrong hash rather than an error; harmless, it reads `modified`; (Rel) a CRLF checkout reads `modified` (out of scope); (R) the long *Verify* paragraph could put the command on its own line
- **Not Done / Assumptions:** P-8, `cmd.exe`/PowerShell quoting unverified (accepted risk); Node 18 settled by the CI legs after a push. No owed item → no continuation
- **Requirements covered:** FR-2 (all), NFR-3
- **spawns:** Implementer (sonnet) 12 calls, 92388 tokens, ended complete; Reviewer (opus): not reported by host at write time, ended complete (PASS)
- **Running totals:** tasks 3/4 · LOC ~175 / ~210 · review rounds 3 / ~7. Under budget
- **Gate:** `auto-approved (pre-approved mode)`
