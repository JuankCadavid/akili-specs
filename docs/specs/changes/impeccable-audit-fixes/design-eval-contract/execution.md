# Execution: Close the design-evaluation gaps found in the 2.40.0 audit

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/impeccable-audit-fixes/design-eval-contract` |
| Started | 2026-10-31 |
| Approval Mode | `gated` in the spec; JC mandate for this run (2026-10-31): "en cada gate de AKILI sigue con la opción recomendada, solo commits locales; sin push, PR, merge, tags, publish ni releases. Techo ~900 LOC". Routine continue gates are taken with the recommended option and logged `auto-approved (JC mandate)`. HALT, Pivot, budget tripwire, `FATAL_FAIL`, `PRODUCT_BUG` and destructive actions still stop |
| Baseline | `3961990` (spec commit on top of `8268cb7`) |
| Leader | Claude Opus 5.5 (T1) |
| Workers | No Step 8E wrappers (`.claude/agents/` absent). Fallback sub-prompt workers read their persona from `.agents/`. Implementer: `sonnet` (T2). Reviewer: `opus` (a different model from the Implementer) |
| Personas | `.agents/` is gitignored and was absent from this worktree. Copied from `/Users/jcadavid/Development/sdd-jc-methodology/.agents`, then `akili doctor --agents --fix --allow-branch` ran on the local, ignored copy: leader `primary-instructions` and `test-harness`, reviewer `audit-checklist`, tester `prove-behavior` FIXED (backups under `.agents/.backup/`). Leader `delegation` CUSTOM-EDITED and implementer `shared-file-discipline` UNLOCATED left as the maintainer's call (same state as `changes/impeccable-hardening`) |
| Budget | 11 tasks · ~870 authored LOC (ceiling ~900) · ~18 review rounds (`tasks.md` Document Control) |
| Commit prefix | `[SPEC:changes/impeccable-audit-fixes/design-eval-contract]`, local only |

## Task Execution History

### T1: Bridge *Step 0*, *Engine consent* and *Launcher form*; create the test file

| Field | Value |
|---|---|
| Final status | **PASS** (attempt 2) |
| Date | 2026-10-31 |
| Attempts | 2 |
| Requirements covered | FR-1 (four bullets, scenario THEN/BUT/AND IT MUST, A1, A1-W); FR-2 (three bullets, "a `modified` copy still leads", scenario BUT/AND IT MUST); NFR-1, NFR-2, NFR-3 |
| Skills | `impeccable-bridge`, `tdd` (as listed) |
| Effort | attempt 1 `medium`-high; attempt 2 `high` (bump after FAIL) |

**First step (premises settled before editing):**

- **P-15 → verified.** Microsoft's `certutil` page (<https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/certutil>) documents `certutil [options] -hashfile InFile [HashAlgorithm]` and lists `SHA256` among the hash algorithms. The Windows example is kept and cites the URL.
- **P-20 → settled as a stated limit.** Upstream raw `docs/CLI-CONTRACT.md` (pbakaus/impeccable `main`), section `context.mjs -> impeccable context`: the engine may write `update-check.json`, `staleness-check.json` (env `IMPECCABLE_NO_STALENESS_CHECK`, not set by the bridge), `config.json` (via `impeccable telemetry off`), `hook-claims`, and a session index. The Exclusion paragraph says "The exclusion covers where the engine is found; it does not promise that no state files are written there", lists them, says `IMPECCABLE_NO_UPDATE_CHECK=1` switches off the update check only, and marks which files a detector run writes as `Unverified:`.

**Attempt 1**

- Files changed: `.claude/skills/impeccable-bridge/SKILL.md` (13+/4−, long prose lines), `test/design-eval-contract.test.js` (new, 142 lines, 14 tests).
- Implementer verification: the red first run before the edit failed 13 of 14. Four failed on the assertion itself and nine on `missing: **Verify.**`, `**Exclusion.**` or `set the pin to`, because the feature was absent; none failed on setup. The Guard passed by design. Green 14/14. 32 executed mutations were each red on their own assertion. The four task falsifiers: F1, the inline-prefix sentence deleted, went red on test 5. F2, `USERPROFILE`→`HOME`, went red on test 4. F3, "Never select another copy" deleted, went red on test 12. F4, Verify moved into *Engine state*, went red on tests 8–13. Tests 1–13 fail against the `HEAD` bridge. `npm test` 1247/1247. Vendored diff empty.
- Evidence re-run (Leader, inline): **VERIFIED**. 14/14; `npm test` `# tests 1247 / # pass 1247 / # fail 0`; `git diff --stat -- .claude/skills/impeccable/` empty; `git diff --check` clean.
- Reviewer (opus): **FAIL**. Verbatim issues:
  1. "In the bridge, the instruction to record `Copy`, `Home` and `Other copies`, and **Never select another copy**, sits inside the **Verify** paragraph. That paragraph opens with "Applies to a `vendored` copy". So when the selected copy is `user-installed` (no `UPSTREAM.md`), nothing tells the agent to record its absolute path, the resolved `HOME`/`USERPROFILE`, or the other copies. FR-2 makes only the hashing depend on `UPSTREAM.md`." Violated: FR-2 bullets 1 and 3 and the scenario's AND IT MUST. Spec tension: design §7.1 item 1 reads narrower than FR-2. Proposed amendment: scope "Applies to a `vendored` copy" to the hash rule only.
  2. "Item 4 asks for an `IMPECCABLE_HOME` outside `~/.impeccable` only "when none is set". Suppose an exclusion is active and the user's `IMPECCABLE_HOME` already points inside `~/.impeccable` … the download writes under the excluded tree." Violated: FR-1 bullet 3 ("require an `IMPECCABLE_HOME` outside it for location 4 **and the download**"). Proposed amendment to design §7.1 item 4: append ", or the one set lies under `~/.impeccable`".
- runtime events: none.

**Attempt 2** (rework by message to the same Implementer; Attempt History and verbatim FAIL report carried)

- Files changed: the same two files. `SKILL.md` stays at 13+/4−. The test file has 154 lines and 16 tests: test 10 pins "For any selected copy", and test 11 pins the inside-home clause.
- Implementer verification: green 16/16. The new mutations are each red: test 10 on "For a vendored copy, record" and on "Hashing applies"; test 11 on the deleted inside-home clause and on the reverted "if none is given". Falsifiers 1–4 re-run and red. Tests 1–15 fail at baseline. `npm test` 1249/1249. Vendored diff empty. Sweep: "Applies to a `vendored`" has 0 hits; "when none is set" has one hit, the updated sentence.
- Evidence re-run (Leader, inline): **VERIFIED**. 16/16; `npm test` `# tests 1249 / # pass 1249 / # fail 0`; vendored diff empty; `git diff --check` clean.
- Reviewer (opus): **PASS**. "Both FAIL issues from the first review are closed, and the restructure dropped nothing. I re-walked FR-1 and FR-2 (every bullet and every scenario clause) and all six §7.1 rows, including the 2026-10-31 amendments to rows 1 and 4." Reviewer re-run 49/49 (`design-eval-contract`, `impeccable-bridge`, `impeccable-vendor`).
- runtime events: none.

**Decisions made**

- Execute-time spec edit, `design.md` §7.1 row 1 (2026-10-31): the hash rule is vendored-only, and `Copy`, `Home` and `Other copies` are recorded for any selected copy. Reason: to match FR-2 bullets 1 and 3. This is a spec tension resolved at the gate with the Reviewer's one-line amendment, auto-approved under JC's mandate (recommended option). The approved requirement's meaning is unchanged.
- Execute-time spec edit, `design.md` §7.1 row 4 (2026-10-31): "when none is set, or the one set lies under `~/.impeccable`". Reason: to match FR-1 bullet 3. Same basis.
- Rework attempt 2 was sent by message to the surviving Implementer context, not to a fresh spawn: the full FAIL report went verbatim, with the Attempt History.

**Not Done / Assumptions (Implementer, verbatim, judged as assumptions, no owed item, no blocker):**

- "**`IMPECCABLE_BIN` header field.** I wrote the `Record IMPECCABLE_BIN: <pinned path>` and `Download home override` fields only in item 4, as design §7.1 says. A run that finds an engine at probe time and never downloads has no record instruction for `IMPECCABLE_BIN:` in item 3. That is a possible gap against the §5.1 values `<pinned path> | not set`. I did not widen item 3."
- "**No fall-through for a missing sha256 tool.** The P-15 "If false" cell mentions `unavailable (no sha256 tool)`. §7.1 item 1 does not specify one and I added none."
- "In *Launcher form*, "with both variables set in its environment" became "with `IMPECCABLE_BIN` and both variables set in its environment"."
- Extra clauses, judged consistent with DD-1 and DD-3 by the Reviewer: Verify "the table keeps `vendored (<version>)`"; item 4 "with or without an exclusion"; *Launcher form* "never rely on an earlier `export` alone".

**ADVISORY (final Reviewer verdict; recorded, not tasks):**

- READABILITY: item 4 "when none is set, or the one set lies under `~/.impeccable`" would read more cleanly without the comma.
- RELIABILITY: nothing records `IMPECCABLE_BIN: <path>` when a probe finds an engine (item 3). This is a forward pointer for T5 (§5.1 template values), `[advisory-grade]`: the template must not imply `not set` for a probe-pinned engine.
- READABILITY: *Launcher form* "`IMPECCABLE_BIN` and both variables" could name all three variables.

- Phrase-family sweep: `pinned from Step 0|export IMPECCABLE_BIN|HOME|Destination` over `.claude docs README.md` (minus `docs/specs/` and the vendored folder). All hits were read. Bridge hits are this task's edits; the others are unrelated (`HOME` in the security, review and CI docs and the Codex/Cursor homes; `Destination` in an Angular reference). Follow-up hits: `docs/skills/impeccable-bridge.md:24` (T10) and `CHANGELOG.md` (T11). Neither is stale.
- spawns: Implementer (sonnet) 31 calls, 147398 tokens, ended complete; Implementer resume (sonnet) 6 calls, 158506 tokens cumulative, ended complete; Reviewer (opus) 8 calls, 92821 tokens, ended fail; Reviewer resume (opus): not reported by host, ended complete (PASS).
- Final verification: `npm test` `# tests 1249 / # pass 1249 / # fail 0`.
- Running totals vs budget: tasks 1/11; authored LOC ≈ 171 (bridge 13+/4− long lines, tests 154) against T1's ~155 and a spec ceiling of ~900; review rounds 2/~18. Within budget.
- Continue gate: auto-approved (JC mandate).

### T2: Bridge *Detector gate*: viewports, first-visit procedure, CTA, outcomes, banner

| Field | Value |
|---|---|
| Final status | **PASS** (attempt 1) |
| Date | 2026-10-31 |
| Attempts | 1 |
| Requirements covered | FR-3 (`WxH`/`incomplete`, two passes, the short-height pair with override and source, the scenario's BUT); FR-4 (CTA order, measurement, the five A2 outcomes, P1/FAIL unless a `first-visit` waiver, THEN/BUT, method recorded); FR-5 (three bullets, THEN/BUT/AND IT MUST) |
| Skills | `impeccable-bridge`, `tdd` (as listed) |
| Effort | `high` (verdict rules) |

**Attempt 1**

- Files changed: `.claude/skills/impeccable-bridge/SKILL.md` (12+/7−, *Detector gate* only), `test/design-eval-contract.test.js` (+101, 15 assertions, tests 16–30).
- Implementer verification:
  - Red before the edit: `# tests 31 / # pass 16 / # fail 15`. The 15 failures are tests 16–30, on their text or on new markers that were absent (for example `missing: 4. When the product has a consent banner`).
  - Green: 31/31.
  - 17 executed mutations, each red only on its own assertion. The four task falsifiers:
    - Swapping (c) and (d): red on 22.
    - Deleting "or one of its descendants": red on 22.
    - Removing "only when `docs/ux-ui/design.md` defines a Primary CTA style": red on 20.
    - "`pass`" for a missing banner: red on 30.
  - The J-1 mutation, "box centre" changed to "box top": red on 22.
  - Against the `HEAD` bridge, exactly tests 16–30 fail.
  - `npm test` 1264/1264. `impeccable-bridge`/`impeccable-vendor` 33/33. Vendored diff empty.
- **FR-4 scenario walkthrough** (Implementer, against the shipped sentence):
  - Case: `/es/` at 375x667, CTA top 650, height ≥ 34.
  - Neither (a) nor (b) applies. The centre is ≥ 667, so "(c) the box centre is at or below the viewport's bottom edge (a box top at or below that edge included): `below fold (y=<top>)`" fires, giving `below fold (y=650)`.
  - (d) and (e) are not reached.
  - The priority bullet says "`covered` or `below fold` at any first-visit viewport is a **P1** in `/akili-audit design` and a **FAIL** in `/akili-validate`", so the finding is P1.
  - The Reviewer re-walked it with the same result.
- Evidence re-run (Leader, inline): **VERIFIED**. 31/31; `npm test` `# tests 1264 / # pass 1264 / # fail 0`; vendored diff empty; `git diff --check` clean; `grep -c "at **both** viewports"` in the bridge → 0.
- Leader-executed mutations for the two folded AND-clause lines (from the Reviewer's advisory):
  - Deleting "The report records each first-visit viewport with its source." gives `not ok 18 - FR-3: the first-visit pass adds the short-height pair 1366x768 and 375x667, overridable, each viewport recorded with its source; no automation reads Unevaluated`.
  - Deleting "Record the method (…)" gives `not ok 20 - FR-4: the CTA is identified in order (declared, defined style only, first main action), the method is recorded and a non-declared CTA is an assumption`.
  - Restored afterwards; 0 fail.
- Reviewer (opus, resumed context): **PASS**. "T2 matches FR-3, FR-4 and FR-5 and all seven §7.2 rows. I walked every bullet and scenario clause term by term and found no dropped obligation." The Reviewer re-ran 64/64. The disqualifiers all hold.
- runtime events: none.

**Decisions made**

- The Reviewer raised a "spec tension" on test counts: `tasks.md` T2 has 15 (FR-3 ×4, FR-4 ×6), while design §7.6 has FR-3 ×6 and FR-4 ×7. **Leader adjudication: not a tension, no amendment.** §7.6 counts per requirement across the spec; `tasks.md` splits them by task:
  - FR-3's other two assertions belong to T5 (`Viewports` line with source) and T8 (validate "every first-visit viewport").
  - FR-4's seventh belongs to T5 (`CTA (method)` in the template).
  - The design total of 68 stands. T2's in-bridge AND lines are pinned inside tests 18 and 20, with their reds quoted above.

**Not Done / Assumptions (Implementer, verbatim, judged as assumptions, no owed item):**

- "Test count per requirement follows tasks.md: FR-3 ×4, FR-4 ×6, FR-5 ×5. The FR-4 AND clause (record the method) and the no-automation FR-3 clause sit inside assertion 20 and assertion 18. Design §7.6 lists 7 for FR-4 and 6 for FR-3, but the brief fixed the total at 15."
- "*Responsive Behavior* as the heading `desktop` is read from comes verbatim from design §7.2. I did not check that the constitution template names that heading, because that is a T6 concern." The Reviewer confirmed it exists as item 9 of the *Required structure* in `akili-constitution.md`.
- "I added a few words beyond the minimum, all drawn from the design and requirements text. The capture-conditions bullet now lists per-capture fields: CTA method and banner state `visible` / `not rendered: <reason>` / `none in product` (design §5.2). The no-automation bullet now says "(the short-height captures included)". The priority bullet carries the BUT sentence about `1280x800`."

**ADVISORY (recorded, not tasks):**

- RELIABILITY: confirm the folded AND-clause reds. Done by the Leader above.
- READABILITY: `akili-validate.md` still says "manual fold check at both viewports". This is T8's scope.
- RESILIENCE: outcome (c) tests only the bottom edge. A centre beyond the right or top edge falls through to (d)/(e). This is outside the A2 text, so it is a candidate for a future spec, not this one.

- Phrase-family sweep: `both viewports|topmost element|hit-test|\bfold\b|fold check|first-visit|first visit` over `.claude docs README.md` (minus `docs/specs/` and the vendored folder). Every hit was read:
  - Bridge hits are T2 text or still true.
  - `akili-validate.md:144` belongs to T8.
  - The "scan matrix at both viewports" lines (`akili-audit.md:147`, `akili-validate.md:140`, `akili-test.md:193`) are still true.
  - Reference `:3, :147, :152` belong to T4/T5. `docs/skills/impeccable-bridge.md:37` belongs to T10.
  - The rest are unrelated (`above fold` in marketing and ui-ux-pro-max, "fold unrelated cleanup").
- spawns: Implementer (sonnet) 18 calls, 125139 tokens, ended complete; Reviewer (opus, resumed) 4 calls, 120733 tokens cumulative, ended complete (PASS).
- Final verification: `npm test` `# tests 1264 / # pass 1264 / # fail 0`.
- Running totals vs budget: tasks 2/11; authored LOC ≈ 291 (T1 ≈ 171, T2 ≈ 120: bridge 12+/7−, tests 101) against the ~900 ceiling; review rounds 3/~18. Within budget.
- Continue gate: auto-approved (JC mandate).

### T3: Bridge *Design Waivers* and new *Suppressed in `/akili-audit design`*

| Field | Value |
|---|---|
| Final status | **PASS** (attempt 1, plus one post-PASS amendment continuation, re-reviewed PASS) |
| Date | 2026-10-31 |
| Attempts | 1 (no FAIL) |
| Requirements covered | FR-7 (list, Assessment A isolation, THEN/BUT/AND IT MUST); FR-14 bridge half (value, closed list, never P1–P3, audit only, BUT `low-contrast`, AND evidence, exit `2` reading per amended §7.3); FR-11 (Reason cites the clause, `§<section> l.<line>` fallback); FR-4 (`first-visit` waiver row) |
| Skills | `impeccable-bridge`, `tdd` (as listed) |
| Effort | `high` |

**Attempt 1**

- Files changed: `.claude/skills/impeccable-bridge/SKILL.md` (25+/2−: row-shape cell, new **False positive** row and closed-list table, example `8-06` with the `§<section> l.<line>` fallback, new `## Suppressed in /akili-audit design` between *Phase map* and *Detector gate*), `test/design-eval-contract.test.js` (+71, 9 tests).
- Implementer verification:
  - Red before the edit: 9 fail. FR-7 ×4 and FR-14 ×4 failed on missing section or row markers; FR-11 failed on its assertion.
  - Green: 40/40.
  - 30 clause-level mutations, each red. The task falsifiers:
    - A `low-contrast` row added: "FR-14 (BUT)" red (`closed list rule ids`).
    - "Inline is allowed only when no sub-agent tool exists: " changed to "Inline is allowed: ": the FR-7 isolation test red (`'inline condition'`).
    - The `Questions skipped:` line replaced: its test red (`'Questions skipped line'`).
  - Exactly the 9 new tests fail against `HEAD`.
  - `npm test` 1273/1273. Vendored diff empty.
  - `## Design Waivers` is unchanged. `Proposed waivers do **not** count toward P1` and `` `Proposed waivers: N` `` survive.
- Evidence re-run (Leader, inline): **VERIFIED**. 40/40; `npm test` `# tests 1273 / # pass 1273 / # fail 0`; vendored diff empty; `git diff --check` clean.
- Reviewer (opus, fresh spawn): **PASS**. "T3 changes all four §7.3 sites. Each obligation in FR-7, FR-14 (bridge half), FR-11 (waiver citation and `§<section> l.<line>`) and the FR-4 `first-visit` waiver row appears in the bridge text, and a section-scoped assertion pins each one."
  - The Reviewer raised a **spec tension**: design §7.5 lists "the exit-code row `2`" as a consumer of `false positive` ("counts as waived only in the audit's reading of the scan matrix"), but no §7 row implemented it.
  - Proposed one-line amendment to the §7.3 *False positive* row: "For exit `2`, the audit's reading of the scan matrix counts it as waived; validate's reading is unchanged".
- runtime events: none.

**Amendment continuation** (by message to the same Implementer, one owed item)

- Files changed: the same row in `SKILL.md` gained the amended sentence verbatim (cumulative 25+/2−). The test file gained test 37, scoped to the row (cumulative +78, 10 tests).
- Implementer verification:
  - Red before the edit: `error: 'exit 2 reading'`.
  - Deleting either clause: `not ok 37 - FR-14: for exit 2 the audit's reading …` red. Restored.
  - Fails against `HEAD`. 41/41. `npm test` 1274/1274. Vendored diff empty.
- Evidence re-run (Leader, inline): **VERIFIED**. 41/41; `npm test` `# tests 1274 / # fail 0`; vendored diff empty; `git diff --check` clean.
- Reviewer (opus, resumed): **PASS**. "The only change from the first diff is that sentence, added byte-for-byte at the end of the bridge's *False positive* row, plus one new row-scoped test."
  - Leaving the *Exit codes* table untouched is conformant. The exit-`2` cell already points at *Design Waivers*, which now holds the exception, and editing that cell would widen T3 and touch a cell `impeccable-bridge.test.js` pins.
- continuations: 1 (the exit-`2` sentence from the approved §7.3 amendment).

**Decisions made**

- Execute-time spec edit, `design.md` §7.3 *False positive* row (2026-10-31). Added "For exit `2`, the audit's reading of the scan matrix counts it as waived; validate's reading is unchanged". Reason: to implement design §7.5's exit-code row, a spec tension resolved with the Reviewer's recommended amendment (auto-approved under JC's mandate). FR-14's meaning is unchanged.
- Count alignment (2026-10-31), from the Reviewer's TRACEABILITY advisory:
  - `design.md` §7.6 is now FR-1 8, FR-2 7 and FR-14 6, total **71**. It was 68 at approval; the change carries +2 from T1's amendments and +1 from T3's.
  - `tasks.md` T1 Tests is now (16) and T3 Tests (10).
- The Implementer folded the FR-4 `first-visit` row shape into the FR-11 test. The Reviewer accepted it: T3 lists FR-4 among its requirements.

**Not Done / Assumptions (Implementer, verbatim):**

- "Reviewer attention (not widened): the bridge exit-`2` row still reads "fixed or waived". Design §7.5 says `false positive` counts as waived in the audit's scan-matrix reading, but §7.3 lists no change to that row, so I left it alone." Resolved by the §7.3 amendment above.
- "The FR-11 test also pins the `first-visit` waiver row shape (FR-4 waiver exception). The task's 9-test list has no separate test for it, so I added it there to keep the count at 9."
- "The `false positive` row reaches `low-contrast` through the clause "(`low-contrast` is never on it)", and the test pins both that text and the closed-list rule-id array."
- Structural: the closed-list table sits between the waivers table and the Example, because a table cannot live inside a cell.

**ADVISORY (recorded, not tasks):**

- READABILITY: the bridge frontmatter `description` does not name the report-only suppression.
- RISK: the False positive row is one cell of about 90 words. Split it if a second closed-list rule lands.
- READABILITY: the exit `2` cell could name the `false positive` reading. This needs a spec change; the *Design Waivers* pointer already reaches the exception.

- Phrase-family sweep: the keys `A-06|clause|waived|snapshot|false positive|Questions skipped|live-server|Proposed waiver|Design Waivers|.impeccable/critique|Persist the Snapshot` over `.claude docs README.md` (minus `docs/specs/` and the vendored folder). Every hit was read:
  - `A-06` is gone (FR-16 pattern 3 is clean).
  - Reference `:15, :85, :135, :146, :153` belong to T4/T5.
  - `akili-constitution.md:212` belongs to T6.
  - `docs/skills/impeccable-bridge.md:37` and the CHANGELOG belong to T10/T11.
  - The rest are unrelated.
  - The continuation's sweep for `` exit `2` `` and `fixed or waived` returned three bridge hits, all consistent.
- spawns: Implementer (sonnet) 23 calls, 126169 tokens, ended complete; Implementer continuation (sonnet) 6 calls, 133713 tokens cumulative, ended complete; Reviewer (opus) 9 calls, 87394 tokens, ended complete (PASS + tension); Reviewer resume (opus) 2 calls, 90712 tokens cumulative, ended complete (PASS).
- Final verification: `npm test` `# tests 1274 / # pass 1274 / # fail 0`.
- Running totals vs budget: tasks 3/11; authored LOC ≈ 396 (T1 ≈ 171, T2 ≈ 120, T3 ≈ 105: bridge 25+/2−, tests 78) against the ~900 ceiling; review rounds 5/~18. Within budget. LOC is running above the per-task estimates for tests (T1–T3 estimated ~245 tests, actual ~333) and below them for prose. Watching against the ceiling.
- Continue gate: auto-approved (JC mandate).

### T4: Reference steps: E1, E2, E2b, E3b, E4, *Priorities*

| Field | Value |
|---|---|
| Final status | **PASS** (attempt 1) |
| Date | 2026-10-31 |
| Attempts | 1 |
| Requirements covered | FR-6 (mapping table); FR-7 (E2b and E4 point at the bridge section); FR-8 (brief items, parent count check, BUT); FR-9 (`npm ci` conditions, *Run validity*, BUT, AND IT MUST, failure state); FR-10 (load, sources, dev-server filter, BUT `none`); FR-11 (E1 *Baseline shape* routing, BUT nothing written, `§<section> l.<line>`); FR-12 (E2 template coverage) |
| Skills | `impeccable-bridge`, `tdd` (as listed) |
| Effort | `high` |

**Attempt 1**

- Files changed: `.claude/skills/impeccable-bridge/references/design-evaluation.md` (25+/5−, five scoped sites), `test/design-eval-contract.test.js` (+69, 13 tests).
- Implementer verification:
  - Red: `# pass 41 / # fail 13`, all on missing reference text (six on missing row or section markers such as `missing: | Run validity |`).
  - Green: 54/54.
  - 40 clause-level mutations, each red on exactly one test. The four task falsifiers:
    - "`node_modules` is **absent**" removed: FR-9 preconditions red.
    - "has no `runtimeError`" changed to "exits 0": FR-9 run-validity red.
    - Dev-server filter removed: FR-10 sources red.
    - Count-first clause removed: the FR-7/FR-8 brief test red.
  - One weak pin ("clause IDs", satisfied elsewhere in the row) was tightened and re-run red.
  - All 13 fail against the `HEAD` reference.
  - `npm test` 1287/1287. Vendored diff empty. `impeccable-bridge`/`impeccable-vendor` 33/33.
- Evidence re-run (Leader, inline): **VERIFIED**. 54/54; `npm test` `# tests 1287 / # fail 0`; vendored diff empty; `git diff --check` clean.
- Reviewer (opus, fresh spawn): **PASS**. "All five scoped sites in `.claude/skills/impeccable-bridge/references/design-evaluation.md` match design §7.4 nearly word for word … I checked FR-6, FR-7 (pointer part), FR-8, FR-9, FR-10, FR-11 (E1 part) and FR-12 (E2 part) clause by clause, including each BUT and AND IT MUST, and found nothing dropped."
  - The disqualifiers are clear: NFR-3 holds, NFR-2 holds (E4 says only "reproduce that list"), and the *Concurrency* row is unchanged.
- runtime events: none.

**Decisions made**

- The Reviewer ruled that the template's `Page modes: … drift (<what>; inferred modes under Assumptions)` value belongs to T5 (the T5 Scope names the template's `Page modes` values). T4 does not widen.

**Not Done / Assumptions (Implementer, verbatim):**

- "The report template still reads `drift (<what>; inferred modes under Assumptions)` and has no `Coverage` or `Machine load` field. That is T5, as scoped."
- "FR-7's pointer part has no test of its own, because the spec's count of 13 has no FR-7 line. Assertion 2 covers the E2b and E4 pointers together with the FR-8 brief items, and I named it 'FR-7/FR-8'."

**Forward pointer to T5 (from the Reviewer's advisory; T5's own scope):** update the template's `Page modes` drift value to the E1 form (`routed to /akili-constitution`), and add the `Install` and `Machine load` sub-lines, so the template matches the E1 and E3b rules.

**ADVISORY (recorded, not tasks):**

- READABILITY: the E3b row label *Resolve, never install* now sits over a rule that allows a consented `npm ci`. Design §7.4 keeps the name, so this could be a later quick rename.
- READABILITY: the `§<section> l.<line>` fallback is in both E1 and the bridge's *Design Waivers*. Both copies are spec-mandated and must stay in sync.
- RISK: the dev-server filter (ports 3000–9999) will also list unrelated local services. The field is informational and changes no gate.

- Phrase-family sweep: the keys `8 key screens|up to \*\*8|never install|failed run|P0|Too few runs|offsetParent` over `.claude docs README.md` (minus `docs/specs/` and the vendored folder). Every hit was read:
  - The reference hits are T4 text or still true.
  - Bridge `offsetParent` is T2's.
  - `product-manager-toolkit` P0 is unrelated.
  - `docs/skills/impeccable-bridge.md:29` still agrees with the consented `npm ci` (Reviewer).
- spawns: Implementer (sonnet) 20 calls, 124230 tokens, ended complete; Reviewer (opus): not reported by host, ended complete (PASS).
- Final verification: `npm test` `# tests 1287 / # pass 1287 / # fail 0`.
- Running totals vs budget: tasks 4/11; authored LOC ≈ 490 (T1 ≈ 171, T2 ≈ 120, T3 ≈ 105, T4 ≈ 94) against the ~900 ceiling; review rounds 6/~18. Within budget.
- Continue gate: auto-approved (JC mandate).

### T5: Reference report template and checklist

| Field | Value |
|---|---|
| Final status | **PASS** (attempt 1) |
| Date | 2026-10-31 |
| Attempts | 1 |
| Requirements covered | FR-3 (AND: each viewport with its source); FR-4 (AND: `CTA (method)`); FR-6 (priority note; BUT no P0 section); FR-9 (`Install`, checklist exception); FR-10 (`Machine load` header line); FR-12 (BUT: `Coverage` names every uncovered template); FR-13 (the checklist accepts the E6 user-directed path); FR-14 (`False positives: N`, `Waived?` value) |
| Skills | `impeccable-bridge`, `cognitive-doc-design`, `tdd` (as listed) |
| Effort | `high` |

**Attempt 1**

- First step (consumer grep): `grep -rn "Screens Evaluated\|Capture conditions\|Report location" test/*.js` found one hit, `test/design-eval-contract.test.js` (the T4 `e3b` slice end marker `## E6 - Report location`, whose heading is unchanged). No other test pins the template.
- Files changed: `.claude/skills/impeccable-bridge/references/design-evaluation.md` (31+/15−, seven scoped sites) and `test/design-eval-contract.test.js` (+37, 6 tests).
- Forward pointers applied:
  - From T4: `Page modes` reads the E1 drift form, and `Install` and `Machine load` are added under `Performance`.
  - From T1 `[advisory-grade]`: `IMPECCABLE_BIN: <pinned path (from the probe or the download)> | not set (no engine pinned)`.
- Implementer verification:
  - Red: 5 of 6 failed on text. The FR-6 BUT "no P0 section" test is a negative assertion, so it is green at baseline and red only under mutation.
  - Green: 60/60.
  - Mutations (each red, then restored):

    | Mutation | Red on test |
    |---|---|
    | `### P0` added | 57 |
    | `False positives:` deleted | 59 |
    | `Viewports` changed to `Mobile viewport` | 54 |
    | `\| CTA (method) \|` removed | 55 |
    | Priority note edited | 56 |
    | Checklist `Coverage` item removed | 58 |
    | `` `run` \| `` re-added | 54 |
    | `**Coverage:**` renamed | 58 |
    | `\| Exit codes \|` removed | 58 |
    | `npm ci` exception removed | 59 |
    | `Machine load` line removed | 58 |

  - Retired-`run` greps: `grep -cF '(\`run\`, \`not required (Read)\`'` gives 0, and `grep -cF '\`run\` | \`not required (Read)\`'` gives 0.
  - All 5 positive tests fail against the `HEAD` reference.
  - `npm test` 1293/1293. Vendored diff empty. Bridge and vendor tests 33/33.
- Evidence re-run (Leader, inline): **VERIFIED**. 60/60; `npm test` `# tests 1293 / # fail 0`; vendored diff empty; `git diff --check` clean.
- Reviewer (opus, fresh spawn): **PASS**. "I checked every row of design §5.1 and §5.2, the §7.4 Template row and both Checklist rows, the §7.5 rows 2, 3 and 9, and the FR clauses named in the brief, term by term against the diff. No field or value is missing."
  - FR-13: the last item reads "except a recorded user-directed report location and a recorded consented `npm ci`", word for word with §7.4.
  - The disqualifiers are clear.
- runtime events: none (the Implementer's stray `cat > /tmp/x` stdin hang was stopped by the worker, changed nothing, and was cleaned up).

**Decisions made (accepted deviations, recorded per the Reviewer's advisories):**

- `Machine load` is folded into the existing no-measurement-while-delegated-agent checklist item instead of its own item, so the checklist has two new items, not three. The obligation is fully present.
- *Capture conditions* drops its old `Pass` column. The table now holds only first-visit captures, so the column was redundant. §5.2 says only "Adds".
- The `IMPECCABLE_BIN` value carries parentheticals beyond §5.1's bare `<pinned path> | not set`. Accepted: they name both pin sources, which closes T1's forward pointer.

**Not Done / Assumptions (Implementer, verbatim):** "The `IMPECCABLE_BIN` wording as above. The `Waived?` footnote now also says `false positive` rows are counted in `False positives`. The header checklist item also names `Viewports`, `Coverage` and `False positives`."

**ADVISORY (recorded, not tasks):**

- RELIABILITY: the `Machine load` timing ("once per E3b run, immediately before its first Lighthouse run") lives in the E3b row (T4). The template line does not point to it.

- Phrase-family sweep: the keys `first-visit entry|one row per first-visit pass|Mobile viewport|inferred modes|\brun\b \||Proposed waivers|Report location` over `.claude docs README.md` (minus `docs/specs/` and the vendored folder). 25 hits, all read.
  - No stale hits remain for `first-visit entry`, `one row per first-visit pass` or `Mobile viewport`.
  - The rest are T5's own text, still true, or "run" in other senses.
- spawns: Implementer (sonnet) 22 calls, 127651 tokens, ended complete; Reviewer (opus): not reported by host, ended complete (PASS).
- Final verification: `npm test` `# tests 1293 / # pass 1293 / # fail 0`.
- Running totals vs budget: tasks 5/11; authored LOC ≈ 558 (T1 ≈ 171, T2 ≈ 120, T3 ≈ 105, T4 ≈ 94, T5 ≈ 68) against the ~900 ceiling; review rounds 7/~18. Within budget. The remaining estimate is T6–T11 ≈ 355 LOC, which projects to about 913 against a ceiling of about 900: at the edge. The tripwire is checked at each finalize.
- Continue gate: auto-approved (JC mandate).

### T6–T9: Command pointers (one Implementer spawn and one Reviewer spawn, with a verdict per task)

**Delegation note:** these are four `checklist` tasks, each touching one command file and adding one assertion to the shared test file. One Implementer did them strictly in order (red, edit, green, falsifier and `HEAD` check per task) and reported each separately. One Reviewer gave a verdict per task. They share one commit because the test file is shared; each task's evidence is recorded below.

#### T6: `/akili-constitution` Step 4: clause IDs, `Primary CTA` column, scan viewports

| Field | Value |
|---|---|
| Final status | **PASS** (attempt 2) |
| Date | 2026-10-31 |
| Requirements covered | FR-11 bullet 1 (clause IDs `<n>-<nn>`, cited in a waiver's Reason); FR-4 (the `Primary CTA` column as a selector or attribute or `—`, and the optional Primary CTA style); FR-3 (scan viewports `WxH` under *Responsive Behavior*, optional) |
| Skills / Effort | `impeccable-bridge`, `tdd`; attempt 1 `medium`, attempt 2 `high` |

- Attempt 1:
  - Files: `.claude/commands/akili-constitution.md` (1/1; the paragraph is a single line) and a test (+6).
  - Red: `error: 'Step 4 names <n>-<nn>'`. Falsifier (the `<n>-<nn>` sentence deleted) went red. Fails against `HEAD`. Consumers (`impeccable-bridge`, `diagram-design`, `growth-track`, `tasks-gate`) 108/108; `diagram-design` is still on exactly 3 lines.
  - Evidence re-run (Leader): **VERIFIED** (64/64; 1297/1297).
  - Reviewer (opus): **FAIL**, verbatim: "The Step 4 paragraph adds the `Primary CTA` column but never says what goes in a cell. It only says "the main action of each Persuade and Operate screen". It is missing the value shape (a selector or attribute) and the `—` for screens that have none. … The optional Primary CTA style is also missing its shape (the class, token or attribute that marks it). Smaller gap: *Responsive Behavior* says "the scan viewports as `WxH` pairs". It does not name `desktop`, `mobile` and the `short-height` pair, or say the entry is optional with defaults when absent." Violated: FR-4 *CTA identification*; design §5.3 rows *Screen Inventory*, *Primary CTA style*, *Scan viewports*.
- Attempt 2 (by message, with the verbatim FAIL and the Attempt History):
  - The paragraph now states "a selector or attribute naming the main action of each Persuade and Operate screen, or `—` for a screen with none (never prose such as "Sign-up button")", "the class, token or attribute that marks it", and "`desktop`, `mobile` and the short-height pair, each `WxH` (optional; defaults apply when absent)".
  - The assertion pins five more phrases. Red before the edit: `error: 'Step 4 states a selector or attribute naming the main action'`. Mutation (the `—` clause deleted): `error: 'Step 4 states or `—`'`.
  - Consumers green; `diagram-design` is still on 3 lines.
  - Evidence re-run (Leader): **VERIFIED** (64/64; 1297/1297; vendored diff empty; `git diff --check` clean).
  - Reviewer (opus, resumed): **PASS**. "Step 4 now meets every §5.3 row and the FR-4 CTA identification wording."
- runtime events: none.

#### T7: `/akili-audit` design step 5 and Verification Checklist

| Field | Value |
|---|---|
| Final status | **PASS** (attempt 2) |
| Date | 2026-10-31 |
| Requirements covered | FR-13 (step 5 and the checklist accept the E6 user-directed path; "nothing outside `docs/specs/audits/`" carries the exception; the scenario's BUT) |
| Skills / Effort | `impeccable-bridge`, `tdd` (the Leader added `impeccable-bridge` to the listed `tdd` so the worker could read the E6 section name); attempt 1 `medium`, attempt 2 `high` |

- Attempt 1:
  - Files: `.claude/commands/akili-audit.md` (2/2) and a test (+8). Step 5 names "the reference's E6 location (the default `docs/specs/audits/design-<YYYY-MM-DD>[-<safe-branch>][-N].md`, or the user-directed path)". The checklist "nothing outside" item gained the exception.
  - Red: `error: 'step 5 names the user-directed location'`. Falsifier went red (`'checklist names the user-directed location'`).
  - Consumers (`impeccable-bridge`, `akili-security-command`, `akili-review-contract-coverage`) 181/181.
  - The test pins `design-<YYYY-MM-DD>[-<safe-branch>][-N].md` without its `docs/specs/audits/` prefix, because the Guard forbids that literal in the test source.
  - Evidence re-run: **VERIFIED**.
  - Reviewer: **FAIL**, verbatim: "In the design-mode *Verification Checklist*, the existence item still reads "the `design-*.md` report exists and is non-empty". Only the "nothing outside `docs/specs/audits/`" item gained the exception. A user-directed report such as `/tmp/report.md` is not a `design-*.md` file, so the checklist's first condition still rejects the FR-13 scenario." Violated: FR-13 and its scenario; T7 Scope; design §7.4 Checklist row.
- Attempt 2:
  - The existence item now reads "the report exists at its E6 location (the default `design-*.md` path or the recorded user-directed path) and is non-empty", with one more pin.
  - Red: `error: 'existence item accepts the E6 location'`. Reverting the wording went red again.
  - The drift-mode item and the "A `design-*.md` file is never a drift report" line are unchanged. Consumers 220/220 (with T6's).
  - Evidence re-run: **VERIFIED**.
  - Reviewer (resumed): **PASS**. "The design-mode existence item reads "the report exists at its E6 location … and is non-empty", so the `/tmp/report.md` scenario passes."
- runtime events: none.

#### T8: `/akili-validate` first-visit fold-check sentence

| Field | Value |
|---|---|
| Final status | **PASS** (attempt 1) |
| Date | 2026-10-31 |
| Requirements covered | FR-3 bullet 4 (the manual fold check covers every first-visit viewport) |
| Skills / Effort | `impeccable-bridge`, `tdd` (the Leader added `impeccable-bridge` to the listed `tdd` so the worker could read the *First-visit pass* section name); `medium` |

- Files: `.claude/commands/akili-validate.md` (1/1: "a manual fold check at every first-visit viewport (the bridge's *First-visit pass*)") and a test (+6).
- Red: `error: 'every first-visit viewport'`. The falsifier (restoring "at both viewports") went red with the same error. Fails against `HEAD`.
- Consumers (`impeccable-bridge`, `video-production`) 106/106.
- Evidence re-run: **VERIFIED**.
- Reviewer: **PASS**. "T8 and T9 match their design rows word for word."
- runtime events: none.
- Note: the sentence names *First-visit pass* twice, as the brief worded it.

#### T9: `/akili-propose` design-evaluation source sentence

| Field | Value |
|---|---|
| Final status | **PASS** (attempt 1) |
| Date | 2026-10-31 |
| Requirements covered | FR-13 (one report-location rule everywhere) |
| Skills / Effort | `impeccable-bridge`, `tdd` (the Leader added `impeccable-bridge` to the listed `tdd` so the worker could read the reference's E6 `Report location` field name); `medium` |

- Files: `.claude/commands/akili-propose.md` (1/1: "(`docs/specs/audits/design-*.md`, or the path recorded in its `Report location` field)") and a test (+7).
- Red: `error: 'Report location clause'`. The falsifier (the clause deleted) went red. Fails against `HEAD`.
- Consumers (`akili-review-contract-coverage`, `impeccable-bridge`) 94/94; the carve-out line is untouched.
- Evidence re-run: **VERIFIED**.
- Reviewer: **PASS**.
- runtime events: none.

#### Shared record for T6–T9

- End-of-run checks: `npm test` `# tests 1297 / # pass 1297 / # fail 0`; vendored diff empty; `git diff --check` clean; no bridge command string in any command (grep returns 0 new hits).
- Phrase-family sweep: the keys `both viewports|fold check|outside \`docs/specs/audits/\`|audits/design|user-directed|clause|Primary CTA` over `.claude/commands docs README.md`. Every hit was read:
  - The edited sites are done.
  - The "scan matrix at both viewports" lines (`akili-audit.md:147`, `akili-validate.md:140`, `akili-test.md:193`) are still true.
  - The methodology's own uses of "clause" are unrelated.
  - `docs/commands/akili-audit.md:12` and `docs/skills/impeccable-bridge.md:41` belong to T10.
- ADVISORY: suppressed by the Reviewer persona's checklist mode (diff under 50 LOC).
- spawns: Implementer (sonnet) 17 calls, 100402 tokens, ended complete; Implementer rework (sonnet) 4 calls, 107474 tokens cumulative, ended complete; Reviewer (opus) 7 calls, 82427 tokens, ended fail (T6, T7) / pass (T8, T9); Reviewer resume (opus): not reported by host, ended complete (PASS).
- Running totals vs budget: tasks 9/11. Authored LOC ≈ 603 against the ~900 ceiling: T1–T5 ≈ 558, plus T6–T9 ≈ 45 (commands ≈ 14 changed prose lines, measured as word-level edits on single-line paragraphs; tests +31). Review rounds 13/~18 (T6 2, T7 2, T8 1, T9 1). Within budget.
- Continue gate: auto-approved (JC mandate).
