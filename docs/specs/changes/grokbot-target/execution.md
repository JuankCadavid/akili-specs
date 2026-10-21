# Execution Log: Grok Bot install target (`--tool grokbot`)

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/grokbot-target` |
| Branch | `feat/grokbot-target` (worktree; commits local only, never pushed) |
| Approval Mode | `gated`. The user asked up front to continue into execute; task gates are still presented |
| Leader | Claude Code session, `opus` (T1) |
| Workers | No Step 8E wrappers in this repo (`.claude/agents/` absent). Fallback sub-prompt workers read their persona from `.agents/`. Implementer: `sonnet` (T2). Reviewer: `opus` (a different model from the Implementer) |
| Personas | `.agents/` is gitignored and was absent from this worktree. It was copied from the main checkout, then `akili doctor --agents --fix --allow-branch` was run on that local, ignored copy: leader `primary-instructions`, reviewer `audit-checklist` and tester `prove-behavior` were fixed (backups under `.agents/.backup/`); custom-edited/unlocated sections were left as the maintainer's call. `--allow-branch` was needed because the branch guard refuses on `feat/*`; the files are untracked, so nothing lands in a commit |
| Budget (design §12) | 5 tasks · ~790 LOC · 8 review rounds |

## 2. Task Execution History

### T1 — Target, flags, roots, registry, detection, help

#### Attempt 1 — FAIL
- **Files changed:** `bin/akili.js`, `test/install-grokbot.test.js` (new), `test/install-cursor.test.js`, `test/agents-doctor-io.test.js`, `test/agents-doctor.test.js`, `scripts/ci/install-layout-regression.js`
- **Implementer verification:**
  - 4 suites: 86/86 pass.
  - Regression script: exit 0.
  - `install --tool all --dry-run`: byte-identical to the baseline.
  - `git diff --check`: clean.
  - `npm test`: 517/517.
  - Red run at baseline: whitelist assertion "expected the error text to list grokbot".
  - Falsifiers 1–3 all went red and were reverted: `--local` path, `detect()` true→false, and the verify-hint regex.
- **Implementer Not Done / Assumptions (verbatim summary):** `diagram-design`/`video-production` tests not pinned (they always pass an explicit `--tool`); init has no grokbot roots (P-3); the "Default" test uses `AKILI_GROKBOT_TARGET="   "`; DD-2 explicit-equals-default quirk. These are assumptions, not owed items, so no continuation.
- **Evidence re-run (Leader inline):** VERIFIED.
  - 86/86 on the 4 suites.
  - Regression: exit 0.
  - `install --tool all --dry-run` is byte-identical between HEAD's `bin/akili.js` and the changed one (scratch HOME, 494 lines).
  - `git diff --check`: clean.
  - `/home/box` absent before and after.
- **Reviewer (opus):** FAIL. Issue 1: `scratchEnv(home)` defaults `AKILI_GROKBOT_TARGET` to `"   "`, which reads as unset, so the spawns in the new suite that write (FR-3 first-install, hygiene install) are unpinned. That violates NFR-3 and the task Disqualifier. Remediation: default the pin to a scratch path, and keep the blank value only in the FR-2 *Default* dry-run test, with a comment.
- **ADVISORY:**
  - The Default test asserts the header, not "would write" lines.
  - The FR-6 negatives pass vacuously if the banner wording changes.
  - The FR-1 "`both` unchanged" behavior has no new test.
  - DD-2 quirk: one line for `docs/cli.md` (T5).
  - The byte-identity loop does not catch extra installed files.
- **spawns:** Implementer — not reported by host; Reviewer — not reported by host.

#### Attempt 2 — PASS
- **Files changed:** `test/install-grokbot.test.js`. `scratchEnv` now defaults the pin to `<home>/.grokbot-env-unused/workflows`; the blank value remains only in the FR-2 *Default* dry-run test, with a comment.
- **Implementer verification:**
  - 4 suites: 86/86.
  - Regression: exit 0.
  - `git diff --check`: clean.
  - `npm test`: 517/517.
  - Pin proof: with `--grokbot-target` removed, the install landed under the scratch env path and `/home/box` stayed absent. Reverted; 11/11.
- **Evidence re-run (Leader inline):** VERIFIED. 86/86, `diff --check` clean, and the only blank pin is at `test/install-grokbot.test.js:165`.
- **Reviewer (opus):** PASS. Issue 1 resolved; nothing regressed (11/11 on the Reviewer's own re-run).
- **ADVISORY (still open, recorded only):**
  - The Default test asserts header roots, not "would write" lines.
  - The FR-6 negatives can pass vacuously.
  - Byte-identity walks source files only.
- **spawns:** Implementer (resumed by message) — not reported by host; Reviewer (resumed) — not reported by host.

**T1 final: PASS** (2 attempts) · 2026-10-21
- **Requirements covered:**
  - FR-1 (both scenarios)
  - FR-2 (all scenarios)
  - FR-3 *First install* (except the record) and *Shared directory hygiene* (T1 part)
  - FR-6
  - NFR-1, NFR-2, NFR-3
- **Decisions:**
  - Skill: `tdd`, as listed.
  - Effort: high → xhigh on rework.
  - The pin was not added to `diagram-design`/`video-production` tests: they always pass an explicit `--tool`, so detection is never reached.
- **Issues:** none open.
- **Running totals vs budget:**
  - Tasks: 1/5.
  - LOC: ~395/~790 (`bin/akili.js` +70/−10 against ~90 budgeted; new test file 315 lines against ~150 budgeted for T1; pins 10).
  - Review rounds: 2/8.
  - The test LOC is running ahead of the T1 estimate. The total stays within budget, and I'm watching it at each gate.

> **Gate decision (2026-10-21, user):** "Continúa con T2 y las siguientes tareas sin pausar entre tareas salvo que haya una decisión de producto/riesgo." From here on, continue/pause gates after a PASS are auto-approved (logged per task). A HALT, Pivot, budget tripwire, `FATAL_FAIL`, or a product/risk decision still stops for the user.

### T2 — Ownership record and install/update policy

#### Attempt 1 — PASS
- **Files changed:** `bin/akili.js` (+230/−16), `test/install-grokbot.test.js` (+337; 10 tests, 22 total).
- **Implementer verification:**
  - 4 suites: 97/97.
  - Regression: exit 0.
  - `install --tool all --dry-run`: byte-identical to HEAD.
  - `git diff --check`: clean.
  - `npm test`: 528/528.
- **Red run at HEAD 2d10e29:**
  - Record-exists test: red on "expected the ownership record at …/box/akili/grokbot-owned.json".
  - Foreign-`tdd` test: red on the label assertion "run 1: expected tdd to be reported as skipped foreign". **Deviation from the brief:** it was not red on byte identity, because HEAD's plain install already skipped existing entries.
- **Falsifiers (executed, reverted):**
  1. `existsSync` classifier: red on `/skip foreign .*tdd/` and on the not-recorded assertion. **Deviation:** the symlink is not overwritten, because a plain install skips existing entries.
  2. Merge on takeover: red on "files of the foreign tdd survived the takeover".
  3. Record before removal: red on "a foreign entry that still exists must never be recorded as owned".
  4. Write while invalid: red on "unparsable : the invalid record was rewritten".
  5. **GAP:** `force` treated as `forceExplicit` cannot be seen by a CLI test, because `update` cannot be spawned. The Reviewer verified it by static trace: `getArgs:433` `forceExplicit = force && command==="install"`; `runUpdate:1259` sets only `force`; the policy at `:753` and `:760` reads only `forceExplicit`.
- **Implementer assumptions (verbatim summary):**
  - The recovery text carries no root flags (T4).
  - With an invalid record, an existing entry prints `skip foreign` under a plain install and `blocked` under `--force`; absent entries are always `blocked`.
  - Exit 1 is set through `process.exitCode`, so `update` finishes its output first, and `--dry-run` with an invalid record also exits 1.
- **Evidence re-run (Leader inline):** VERIFIED. 97/97 with 0 skipped, regression exit 0, `diff --check` clean, dry-run byte-identical to HEAD, `/home/box` absent.
- **Reviewer (opus, xhigh, full 4R):** PASS. Every clause of FR-3 (record and partial installs), FR-4 (table, footnote, four scenarios), NFR-4, design §5/§6/§7, DD-5/6/7/10/11 and P-5/6/8/12/13 conforms. The invalid-record output line was judged conforming. The Reviewer's own run: `npm test` 528/528.
- **ADVISORY (recorded only):**
  - RISK: a takeover whose `rmSync` fails partway may already have deleted some foreign files. Nothing is recorded, as specified, but the foreign data is partly lost. Suggestion: rename to a sibling temp name first, then remove.
  - RELIABILITY: an interrupted install ends with an uncaught stack trace; a one-line error would read better.
  - READABILITY: a command-skill takeover prints both `replace foreign` and `would overwrite` under `--dry-run`.
  - READABILITY: an invalid record with every entry present prints only `skip foreign` lines; the docs should mention this.
  - RISK: the update column is verified by static trace only, and the EACCES/EISDIR unreadable-record states are untested.
- **spawns:** Implementer — not reported by host; Reviewer — not reported by host.

**T2 final: PASS** (1 attempt) · 2026-10-21
- **Requirements covered:** FR-3 (record, dry run, partial installs); FR-4 install, install `--force` and update columns, invalid-record footnote, and the four scenarios (install/update side); NFR-4.
- **Decisions:** skill `tdd` (as listed); effort xhigh.
- **Running totals vs budget — BUDGET TRIPWIRE:**
  - Tasks: 2/5.
  - LOC: ~965 against ~790 for the whole spec (`bin/akili.js` ≈ +300 against 240 budgeted for all tasks; tests ≈ +652 against ~460; pins 10).
  - Review rounds: 3/8.
  - **Cause:** test LOC runs about 2× the estimate (fixtures with full-tree snapshots, permission-test guards and skips), and the policy/ownership code is about 2.5× T2's line.
  - Remaining T3–T5 estimate: ~60 bin + ~130 tests + ~90 docs. Projected final ≈ 1,250 LOC (~1.6× budget).
  - Per Step 2.4: stop and escalate to the user.

## Scope change: safe takeover (T2b) and budget — approved by the user 2026-10-21

- **Trigger:**
  - The T2 budget tripwire fired: ~960 LOC against ~790.
  - The T2 Reviewer's RISK advisory: a takeover whose `rmSync` fails partway may partly delete foreign data.
- **User decision (verbatim):** "Aprobado ampliar presupuesto a ~1,300 LOC; agrega primero el safe-takeover (rename a temporal y luego borrar) y sigue con T3–T5."
- **Amendments:** two-direction sweep run.
  - **design:**
    - §5 *Takeover*: move aside into `<resources root>/.takeover/`, then record, copy, and delete.
    - DD-11, DD-10, §3 and §7 `installTool` changed to match.
    - §12 budget is now ~1,300, with 6 tasks.
  - **requirements:**
    - FR-4 *Explicit takeover* gains the move-aside AND IT MUST.
    - *Interrupted install*: a failed move-aside MUST NOT be recorded or partly deleted.
    - The Status row records the change.
  - **tasks:**
    - New T2b.
    - The graph and the Document Control budget are updated.
    - T2's scope line is marked superseded for step 1.
    - The coverage row is added.
- **Placement decision (Leader):** the moved-aside copy goes into AKILI's resources root, never into the bot-visible workflows root. A hidden folder there that still holds a `SKILL.md` could be loaded by a bot.

### T2b — Safe takeover: move aside, then delete

#### Attempt 1 — FAIL
- **Files changed:** `bin/akili.js`, `test/install-grokbot.test.js` (+115/−21).
- **Implementer verification:**
  - 4 suites: 98/98.
  - `npm test`: 529/529.
  - `git diff --check`: clean.
  - Dry run: byte-identical.
- **Red run at HEAD:**
  - The delete-after-move test went red on the exit assertion.
  - The move-aside-failure test PASSED at HEAD on macOS, because `rmSync` inside a read-only parent deletes nothing. It discriminates only via falsifier 2.
- **Falsifiers:** 1, 2 and 3 all went red, quoted in the report.
- **Evidence re-run (Leader inline):** VERIFIED (98/98, dry-run byte-identical, `/home/box` absent).
- **Reviewer (opus):** FAIL.
  - Issue 1: a takeover that fails at step (2), the record write after the move-aside, does not restore the foreign entry to its place. That violates FR-4 *Explicit takeover*: "a takeover that fails before the copy leaves the foreign entry whole in place".
  - Remediation: wrap `recordOwned`, rename back on throw, and name `asidePath` if the restore also fails.
- **Spec tension (Reviewer, Pivot evidence), settled as a one-line amendment.** Recursive delete is not atomic. So "a failure to delete the moved-aside copy leaves it intact" cannot hold for every case.
  - **Amended:** requirements FR-4 now reads "leaves whatever remains of it outside the workflows root, with a warning naming its path". Design §5 is amended the same way, plus the step-(2) restore.
  - **Leader judgment:** the data in question is what the user's explicit `--force` already consented to delete. The protected property — nothing partial is left where bots read — still holds. Under the user's "stop only for product/risk decisions" instruction, this is applied and reported, not paused on. Recorded here for the user's review.
- **ADVISORY:**
  - A copy failure after the record leaves the entry in `.takeover/` with no message.
  - A crash between rename and record leaves an orphan in `.takeover/`, which a future doctor line could list.
  - A resources root on another filesystem means every takeover fails (EXDEV). The Reviewer's report was cut off in this item.

#### Attempt 2 — PASS
- **Files changed:** `bin/akili.js` and `test/install-grokbot.test.js`.
  - `recordOwned` is wrapped. When it throws, the entry is renamed back to its original path and the error is rethrown.
  - `pendingAside` is set only after the record write succeeds.
  - If the restore also fails, the error names the moved-aside path.
  - New test: a pre-created writable `.takeover/` plus a 0555 resources root makes the record write fail at step (2).
- **Implementer verification:**
  - Red on the attempt-1 code: "the foreign entry must be back in place, whole and byte-identical" (actual `{}`).
  - Falsifier (restore replaced by a throw): red on the same assertion.
  - 4 suites: 99/99.
  - `npm test`: 530/530.
  - `git diff --check`: clean.
  - Dry-run output: byte-identical.
- **Gap:** no test covers the branch where the restore itself fails. It has no product seam, and the Reviewer checked it by reading the code.
- **Evidence re-run (Leader inline):** VERIFIED. 99/99 with 0 skipped, `diff --check` clean, `/home/box` absent.
- **Reviewer (opus):** PASS. Issue 1 is resolved, the code conforms to the amended FR-4 and design §5 (9820b41), the new test reaches step (2), and its red is behavioral.
- **ADVISORY (recorded only):**
  - RESILIENCE: the move-aside uses `rename`, so the resources root must share a filesystem with the workflows root. On another filesystem every takeover fails with EXDEV, safely. Two cheap in-scope options: a docs line, and naming EXDEV's cause in the error.
  - RELIABILITY: the restore-failed error should be its own warning line.
  - RELIABILITY (carried): a copy failure after the record write, or a crash between rename and record, leaves a silent `.takeover/` orphan.
- **Forward pointer → T5 (docs):** state that `--force` takeover needs the resources root on the same filesystem as the workflows root (documenting existing behavior; `[advisory-grade]`).
- **spawns:** Implementer (resumed) — not reported by host; Reviewer — not reported by host.

**T2b final: PASS** (2 attempts) · 2026-10-21 · auto-continued per the user's instruction
- **Requirements covered:** FR-4 *Explicit takeover* (move-aside AND IT MUST, as amended) and *Interrupted install* (failed move-aside MUST NOT).
- **Decisions:** effort xhigh, bumped to max on rework. The spec edit is logged under Attempt 1.
- **Running totals vs the user-raised budget:** tasks 3/6; LOC ≈ 962 + 136 ≈ 1,100 of ~1,300; review rounds 5/8 (2 T1 + 1 T2 + 2 T2b). T3 (~120), T4 (~70) and T5 (~90) project to about 1,380, roughly 6% over. Watching at T3's gate.

### T3 — Doctor: FOREIGN, BLOCKED, summary and exit

#### Attempt 1 — PASS
- **Files changed:** `bin/akili.js` and `test/install-grokbot.test.js` (+232/−6, 6 new tests).
- **Implementer verification:**
  - 4 suites: 105/105.
  - `npm test`: 536/536.
  - `git diff --check`: clean.
  - `doctor --tool all` (scratch HOME): byte-identical to HEAD.
  - Red run at HEAD: the foreign test failed with "doctor : expected FOREIGN", because doctor printed OK.
- **Falsifiers:** 1 through 4 all went red as specified. Mutation 3 failed both Codex baseline tests.
- **Implementer addition:** a `recordState` result field. The tasks did not list it; it is internal and used to build hints. The Reviewer accepted it.
- **Evidence re-run (Leader inline):** VERIFIED.
  - 105/105 with 0 skipped; `diff --check` clean.
  - `doctor --tool all` byte-identical to HEAD (306 lines).
  - Extra probe: after a scratch grokbot install, a bare `doctor` auto-detected `GROKBOT HEALTHY ok 47 | missing 0 | fixed 0 | foreign 0` and exited 0.
- **Reviewer (opus):** PASS. Every clause of FR-4 (doctor columns, footnote, recovery text), FR-5, NFR-1, design §5/§6/§7, DD-7/9 and P-6/7 conforms. The Reviewer's own run: 30/30 on the grokbot suite.
- **ADVISORY (recorded only):**
  - The takeover hint prints once under Next steps, not beside the FOREIGN line.
  - `recordState` needs a comment.
  - `quote()` doubles Windows backslashes inside JSON-quoted paths.
  - Doctor hints always print both root flags, while FR-7's install hints print them only for a non-default root. T4 should align these.
  - An owned entry that is a file or a dangling symlink is restored through copy, and no test covers that case.
- **Forward pointer → T4:** make the doctor and install hints use the same rule (root flags only when non-default) and plain `"${p}"` quoting (`[advisory-grade]`; it is FR-7's own rule).
- **spawns:** Implementer — not reported by host; Reviewer — not reported by host.

**T3 final: PASS** (1 attempt) · 2026-10-21
- **Requirements covered:** FR-4 (doctor and doctor `--fix` columns, invalid-record footnote, recovery-text scenario), FR-5, NFR-1.
- **Running totals vs budget — BUDGET TRIPWIRE (second):**
  - Tasks: 4/6.
  - LOC: ≈ 1,381 against the user-raised ~1,300. Breakdown: T1 395, T2 567, T2b 181, T3 238.
  - Review rounds: 6/8.
  - Projection: T4 (~70) and T5 (~90) bring the total to about 1,540 (~18% over 1,300).
  - **Cause:** the test suites again run about 2× their estimates. Each doctor state needs its own install fixture plus stderr and crash guards.
  - Stopped per Step 2.4.

> **Budget decision (2026-10-21, user):** "Aprobado subir a ~1,600 LOC y 2 rondas de review extra si hacen falta; termina T4 y T5." New tripwire: ~1,600 LOC, 10 review rounds.
