# Execution Log: Cursor as a Fifth Install Target

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/cursor-install-target` |
| Depth | Standard |
| Approval Mode | `gated` |
| Started | 2026-10-01 |
| Leader | Fable 5.1 (T1), same session as `/akili-specify` (user chose not to `/clear`) |
| Workers | Implementer `sonnet` (T2) · Reviewer `opus` (T3) — fallback sub-prompt spawns seeded with `.agents/*.md` (no Step 8E wrappers in this repo); author ≠ auditor by model |
| Persona drift | `akili doctor --agents` 2026-10-01: no drift blocking (1 custom-edited `delegation`, 2 unlocated `shared-file-discipline` — maintainer's call, pre-existing) |
| Budget (design §9) | 8 tasks · ~700 lines · 16 review rounds — tripwire |
| Base commit | `7cd681a` |
| Model Routing registry | none in this repo's root guides (it packages the methodology); tiers taken from `docs/model-routing.md` defaults |
| Env masking | every CLI run by a worker or the Leader pins `HOME`, `USERPROFILE`, `CODEX_HOME`, `CURSOR_CONFIG_DIR` to a scratch dir |

## 2. Task Execution History

### Wave 1 — T1 ∥ T7 (started 2026-10-01)

**Leader decisions (pre-spawn):**
- T1: effort `high` (shared-root detection guard is correctness-critical for Codex users too); skills `systematic-debugging`, `caveman` — per task list.
- T7: effort `high`; skills `tdd`, `systematic-debugging`, `caveman` — per task list. **Ordering decision:** the three Cursor fixtures (F1–F3) are written as `node:test` `todo` cases carrying the reason "red until T3 lands the Write-arm change" — the red is still executed and quoted in the report, but `npm test` on master stays green between T7 and T3. T3 removes the `todo` flag. This narrows mechanics, adds no scope.
- Review intensity: overrides (b) closed enumeration (T1) and (c) derived evidence / test gate (T7) apply — Reviewer spawned for both.

---

### T1 — Installer: `cursor` registry entry, symmetric shared-root detection, flags, env row, init, help

| Field | Value |
|---|---|
| Status | **PASS** (attempt 1) |
| Date | 2026-10-01 |
| Attempts | 1 |
| Runtime events | `spawn failure ×1 → rung 1 (retry once)` — harness tmux-pane error on first launch; retry succeeded; attempt counter untouched |
| Spawns | Implementer `sonnet` 62 calls (host count), 187,407 tokens, ended complete · Reviewer `opus` 9 calls, 87,368 tokens, ended complete |
| Files changed | `bin/akili.js` (+103 / −12; 253-line diff) |
| Implementer verification | 8 scripted checks in a masked scratch home (`HOME`/`USERPROFILE`/`CODEX_HOME`/`CURSOR_CONFIG_DIR` pinned) + four-state detection probe + `node --check` + `npm run verify:cli` + `git diff --check` + `npm test` (76 pass / 0 fail / 3 todo) — all green. Enumeration walk: 11 `"codex"` hits, every one but the doctor legacy line (`tool === "codex"`) has a `"cursor"` sibling. Consumer grep (`scripts/ci`, `ci.yml`, `test/`): 8 hits, all in the regression script. Real-home leak probe: none |
| Evidence re-run (Leader-inline, non-author) | **VERIFIED** — fresh scratch home: install → `CURSOR target: <home> (skills → <root>)`, 43 installed, 35 `SKILL.md`, 0 `commands/` dirs, resources `scripts/ templates/`; `--tool all --dry-run` → five blocks in registry order, cursor last; doctor with stripped `PATH` → `NOT FOUND cursor-agent …` (alias + both install commands), `missing 0`, exit 0; `doctor --tool claude` → 0 `cursor-agent` rows; four-state `update --dry-run`: S1 none · S2 `codex` · S3 `cursor` · S4 `codex, cursor`; hunks at `defaultPaths`/`TOOL_REGISTRY`/`TOOL_ROOT_ARGS` are pure insertions (`-127,0 +128,12`, `-171,0 +184,12`, `-571,0 +639`); 12 deleted lines are the expected help/validation/`all`/init rewrites; `node --check` OK; real home (`/Users/jcadavid/.agents/skills`, `~/.cursor/akili`, `~/.codex/akili`) — 0 files newer than the run |
| Reviewer verdict | **PASS** — "The T1 diff covers every obligation in FR-1, FR-2, FR-3 and NFR-6 that falls to T1, and DD-2 detection is correct in every case I traced. I found no lines changed inside the existing registry entries." Traced S1–S4, Codex `--skills-only` beside Cursor resources (not detected — design §6 accepted trade-off), Codex single-root `--target` (roots differ → guard does not fire), `getToolRegistryInfo` safe for all five tools |
| Review intensity | Override (b) — closed enumeration `ALL_TOOLS` gains a value → Reviewer owed and spawned |
| Requirements covered | FR-1 (code half of all four scenarios), FR-2 (statement/flags/defaults/`--local`/single-root), FR-3 (env row, `appliesTo`, row text), NFR-1, NFR-3, NFR-6 — scenario proofs by test are T2's |
| Decisions | Effort `high` (shared detection logic). Skills per task list. `Not Done / Assumptions` carried verbatim: *"Verification 6's literal command (`printf '5\n2\n' \| node bin/akili.js init`) is a pre-existing Node `readline/promises` quirk, not introduced by this diff: when stdin is a fully-buffered pipe, the second `rl.question()` never resolves and the process exits silently (confirmed identical on baseline `7cd681a` via `git stash`). Worked around with `( printf '5\n'; sleep 0.3; printf '2\n' ) \| ...`"* — no owed item, no blocker → no continuation. *"`RECOMMENDED_ENV.cursor-agent.withoutIt` names `agent` as the alias and both install commands are in `installHint`/the doctor row text per DD-5/FR-3"* — the install commands live in `installHint`, which the renderer prints as part of the row; FR-3's scenario asks that "the row's text" name them — satisfied (Reviewer ADVISORY 1 notes the FR-3 *statement*'s `withoutIt` wording; align at validation, no code change) |
| ADVISORY (recorded, never gates) | (1) READABILITY — FR-3 statement says `withoutIt`, diff uses `installHint`; rendered row satisfies the scenario. (2) READABILITY — two pre-existing comments now stale: `toolFlagFor` header "full four-tool 'all' set" and `isToolInstalled` header calling Codex "the exception"; **in scope of T6's FR-9 obligation-keyed sweep** (comment sites that oblige the four-target set), not a new task. (3) RISK — the doctor renderer appends "." after `installHint`, so the Windows command prints `… \| iex.`; the codex row behaves identically today; low risk. (4) RELIABILITY — the sibling guard calls `getToolRegistryInfo` for all tools on a Codex miss; keep registry functions pure |
| Issues encountered | Implementer hit the pre-existing readline pipe quirk (above). T1's `npm test` ran while T7's file was mid-write (the "3 todo" are T7's F1–F3) — harmless here (read-only on T7's file), noted as a near-miss of the concurrency rule; later tasks measure after the wave lands |
| Final verification | `npm test` on the quiet tree after both wave-1 workers reported: 79 tests / 76 pass / 0 fail / 3 todo |

---

### T7 — Gate-script fixtures: red on the pre-change script (in progress)

**Attempt 1** (2026-10-01) — Implementer `sonnet`, effort `high`; runtime events: `spawn failure ×1 → rung 1 (retry once)`; spawn: 46 calls, 153,765 tokens, ended complete. Files changed: `test/tasks-gate.test.js` (new, 338 lines). Implementer verification: `node --test test/tasks-gate.test.js` → F1 `ok # TODO` (already exit 2 today), F2 `not ok # TODO` `expected exit 2; 0 !== 2`, F3 same, F4–F10 ok; `tests 10 / pass 7 / fail 0 / todo 3`; `npm test` 79/76/0/3; `node --check` OK; `git diff --check` 0. Disqualifier: `bash -x` traces show F5 reached the Edit arm and F7 the apply_patch header parser. Falsifier via `AKILI_GATE_SCRIPT` scratch copy: (a) deny inside the Write arm → F3 ok; (b) deny after `esac` → F5/F7 `not ok` (`2 !== 0`). **Discovery (Implementer):** F1 (`content`) is not red — the Write arm reads `.tool_input.content` today, so F1 exits 2 at `7cd681a`; only F2/F3 are red. Leader-inline evidence re-run on the quiet tree: **VERIFIED** (identical counts and quoted pairs).

**Execute-time spec edit (Leader, 2026-10-01):** NFR-7 red clause and `tasks.md` T7 (fixture intro, Verification, Red run, Done) and T3 (Red run, Disqualifier) amended: the red set is F2–F3; F1 is a baseline. The gate behavior required is unchanged — a corrected expected value, not a Pivot. Root cause: the original clause was a present-tense reading never run before it was written (KZ-changes--leader-brief-contract-2 recurrence; kaizen signal). Carried into both wave-1 Reviewer briefs as a named conformance check.

**Reviewer verdict (attempt 1):** `opus`, 7 calls, 75,930 tokens — **FAIL**, verbatim:

> SUMMARY: The fixture shapes are sound. Every fixture reaches the arm it claims, the extraction is correct, temp dirs are cleaned up, and named checks (1)–(6) all hold. But the win32 guard only skips when `jq` is missing, and NFR-7 plus design §7 row 10a require Windows to skip unconditionally. `windows-latest` is a CI leg and it runs `npm test`, so the suite would run there and F4–F10 would go red.
>
> ISSUES:
> 1. **Discovered Issue:** On win32 the suite skips only when `jq` is missing (`if (jqMissing && process.platform === "win32")`, :139). GitHub's `windows-latest` image ships `jq`, and `.github/workflows/ci.yml` runs `npm test` on `windows-latest` with Node 18 and 22. On that leg `jqMissing` is false, so the fixtures run. `spawnSync` on the `.sh` file fails there (no shebang execution, `status` is `null`), and backslash `C:\…` paths would not match the gate's `*/docs/specs/*/tasks.md` glob anyway. F4–F10 would fail with `null !== 0/2` and the Windows CI legs go red.
>    * **Violated Rule:** `requirements.md` NFR-7: "the test fails loudly — never skips silently — on a CI leg expected to have `jq` (ubuntu, macos); **on windows it skips with a named reason**." `design.md` §7 row 10a: "…skips with a named reason on windows".
>    * **Remediation Suggestion:** Gate on `process.platform === "win32"` alone, before the `jq` probe. Register the single `test(..., { skip: "<reason naming the bash/POSIX-path dependency and jq>" })` there. Keep the loud `assert.fail` for a missing `jq` on non-win32. Update the header comment (:31-35) to match. No fixture changes needed.
>
> ADVISORY: Reliability — `runGate` has no `timeout` on `spawnSync`; suggest `timeout: 10000` and asserting `result.error` is undefined. Readability — F5 guards deny *placement*, not counting; a comment would help. Risk — the module-level `assert.fail` for missing `jq` appears as a file-level failure, not a named test (loud enough for NFR-7).

Attempt 1 consumed. Effort bumped `high → xhigh` for attempt 2.

**Attempt 2** (2026-10-01) — Implementer `sonnet`, effort `xhigh`; runtime events: none; spawn: 20 calls, 92,551 tokens, ended complete. Files changed: `test/tasks-gate.test.js` (now 353 lines; delta: platform guard at :145 precedes the jq probe and registers one `test.skip` naming bash + POSIX paths + jq; non-win32 jq loud-fail unchanged; header :31-38 rewritten; advisory applied — `spawnSync` `timeout: 10000` + `assert.equal(result.error, undefined, …)`). Implementer verification: normal run `tests 10 / pass 7 / fail 0 / skipped 0 / todo 3` (F1 `ok # TODO`, F2/F3 `not ok # TODO` `0 !== 2`, F4–F10 ok); win32 simulation → `ok 1 - tasks-gate fixtures (NFR-7) # SKIP windows skip: …regardless of whether jq is on PATH` / `tests 1 / skipped 1`; falsifier: with `jq-1.7.1` present the OLD condition evaluates false (fixtures would have run on win32) — the NEW guard is what skips; `npm test` 79/76/0/3; `node --check` OK; `git diff --check` clean. **Evidence re-run (Leader-inline, non-author): VERIFIED** — identical normal-run lines, win32 harness in the scratchpad → `# SKIP … skipped 1`, `npm test` 79/76/0/3, guard region quoted (`:145 if (process.platform === "win32")`, `:155 jqMissing`, `:158 assert.fail`, `:131 timeout: 10000`).

**Reviewer verdict (attempt 2):** `opus` — **PASS**: "The attempt-1 FAIL is closed the way its remediation asked. At :145 the guard checks `process.platform === "win32"` and nothing else, and it runs before any `jq` probe. … The ten fixture bodies match the T7 table, so NFR-7 as amended and design §7 row 10a are met." The Reviewer re-ran the normal run, the win32 simulation (tests 1 / skipped 1), and a no-`jq` PATH run (loud `AssertionError: jq is required … on darwin`). Finding worth keeping: macOS ships `/usr/bin/jq`, so a `PATH=/usr/bin:/bin` does not remove `jq` — a missing-jq falsifier needs an empty PATH directory.

| Field | Value |
|---|---|
| Status | **PASS** (attempt 2) |
| Attempts | 2 (attempt 1 FAIL — win32 skip conditional on jq absence) |
| Review rounds consumed | 2 |
| Review intensity | Override (c) derived evidence / test gate; attempt 2 also override (e) rework |
| Requirements covered | NFR-7 (as amended: red set F2–F3, F1 baseline), FR-6(a) empty-content scenario incl. its placement `BUT` (offline half — the deny itself ships in T3) |
| ADVISORY (recorded, never gates) | Attempt 1: `runGate` timeout (applied in attempt 2); F5 guards placement not counting (comment suggestion); module-level `assert.fail` appears as a file-level failure. Attempt 2: the header comment :5-11 quotes the **pre-amendment** NFR-7 wording ("all three Cursor fixtures run red") — stale quote inside a shipped file (KZ-002 class); recorded, not minted into a task; the user decides at the gate whether T3 (which edits this file to remove the `todo` flags) may correct the quote |
| Forward pointers | → T3: remove the `todo` option from F1–F3 after the Write-arm edit; F1–F3 then expected `ok` (not todo). → T8: nothing |
| Final verification | `npm test` 79 / 76 pass / 0 fail / 3 todo on the quiet tree |
