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

---

### Mode note (2026-10-01, after wave 1)

User at the T7 gate: *"continue with all tasks"*. From this point routine continue gates are logged `auto-approved (user mandate 2026-10-01: "continue with all tasks")`; HALT, Pivot, budget tripwire, `FATAL_FAIL`, `REVIEW_WAIVED`, and the Implementer rung-5 ask still stop for the user. The T7 header-comment advisory (stale pre-amendment NFR-7 quote) was not explicitly approved for T3 — it stays recorded only.

### Wave 2 — T4 ∥ T5 (started 2026-10-01)

**Leader decisions (pre-spawn):** T4 effort `high` (registry cells are read by every project's Step 8C and by `/akili-audit`); T5 effort `medium` (bounded sibling paragraphs beside existing Codex ones). Skills `cognitive-doc-design`, `caveman` for both — per task list. Review intensity: override (a) — both edit obligations other readers execute → Reviewer owed. Pre-review restatement sweep owed on both (rules documents).

---

### T4 — Model Routing registry: Cursor column, enforced-routing row, effort mapping, invocation row, pins (in progress)

**Attempt 1** (2026-10-01) — Implementer `sonnet`, effort `high`; runtime events: none; spawn: 40 calls, 120,557 tokens, ended complete. Files changed: `docs/model-routing.md` (+55 / −10). Implementer verification: `grep -c Cursor` → 13 (sites listed); 3 pins; tier table NF=9 on all 8 lines; four-host greps → 0 (the one site at the file's end now names Cursor); `^model:` → none; `git diff --check` clean; every Cursor cell `<CONFIRM SLUG>`. **Evidence re-run (Leader-inline, non-author): VERIFIED** — identical counts; paraphrase sweep (`four`, `both hosts`, `the other two`, `three hosts`, `only host`) → 0; bare-slug check in Cursor cells → none. `Not Done / Assumptions`: self-check only (no owed item, no blocker).

**Reviewer verdict (attempt 1):** `opus`, 8 calls, 78,323 tokens — **FAIL**, verbatim:

> SUMMARY: Standard mode, all four lenses. Most of the task conforms. Tier-table cells are only inserted (I compared each −/+ row; no existing cell changed). The §5.5 effort table is byte-identical apart from a dropped "(FR-5 effort scenario)" parenthetical, which is harmless. The `readonly` quote is verbatim from P-8, and the `UNVERIFIED — confirm at source before relying on it` marker is byte-exact (1 hit). Column values are families from the pinned models page and meet FR-7's BUT clause. The enforced-routing row, the *Why these models* paragraph and the four-host → five-host line all conform. Two FR-7/NFR-5 items fail: the *How to apply* bullet and the invocation row.
>
> ISSUES:
> 1. **Discovered Issue:** The *How to apply* Cursor bullet says "switch with `/model` in the IDE, or the equivalent picker in the `agent` CLI". That hedges the CLI half instead of naming `/model` there, and the bullet has no pin. The Codex bullet just above it has one.
>    * **Violated Rule:** requirements.md FR-7 says "a Cursor bullet in *How to apply per tool* (`/model` in both IDE and CLI)". NFR-5 says "Every Cursor claim carries `Last verified` + URL; a claim that could not be exercised carries the `UNVERIFIED — confirm at source before relying on it` marker."
>    * **Remediation Suggestion:** If `/model` was confirmed for both the IDE and the `agent` CLI, say so and add `(**Last verified: 2026-10-01**, <cursor CLI docs URL>)`. If the CLI half was not confirmed, keep `/model` for the CLI and attach the byte-exact UNVERIFIED marker. Do not replace it with "equivalent picker".
> 2. **Discovered Issue:** The CLI-invocation row ("`agent` (installed alongside `cursor-agent` …) — commands are skills invoked `/akili-<name>`") states unpinned Cursor claims. Its source exists: P-11 cites <https://cursor.com/docs/cli/overview> and local `which`/`--version` checks.
>    * **Violated Rule:** NFR-5 (above). DD-9 says "Every Cursor claim carries `Last verified: 2026-10-01` + URL."
>    * **Remediation Suggestion:** Add `(**Last verified: 2026-10-01**, <https://cursor.com/docs/cli/overview>)` to the row, or in one line right under the table. If the `/akili-<name>` skill invocation was not exercised, give it the UNVERIFIED marker.
>
> LEADER QUESTION (spec IDs in packaged prose): **ruled ADVISORY, not FAIL.** The rules cited are about commands; `docs/model-routing.md` is a packaged reference doc, and `akili-constitution.md:1162` says it is "deliberately not copied into the project". The reader loses no information. Precedent: `:220` "DD-2: Pro ≠ Flash" (existing). ADVISORY: reword `design §5.5` (:347), "DD-8's proposed pairing" (:276), "FR-8 assumes" (:587) to self-contained phrasing; drop the duplicated "confirm at source before relying on it" tail at :589-591 (marker stays byte-exact); consider also citing <https://cursor.com/docs/models> on the effort pin.

**Leader source check for attempt 2:** `/model` in the Cursor **CLI** is documented ("Models are set via the `/model` slash command during CLI sessions" — <https://cursor.com/docs/cli/reference/configuration>, fetched 2026-10-01, P-10's page). `/model` in the **IDE** has no fetched source (the IDE exposes a model picker; whether it accepts `/model` is unconfirmed) → the IDE half carries the `UNVERIFIED` marker; FR-7's "(`/model` in both IDE and CLI)" is thereby met as source-or-UNVERIFIED, not by assertion. Attempt 1 consumed. Effort bumped `high → xhigh`.

---

### T5 — Per-host guidance: `/akili-execute`, `/akili-test`, `docs/flow.md` (in progress)

**Attempt 1** (2026-10-01) — Implementer `sonnet`, effort `medium`; runtime events: none; spawn: 40 calls, 132,534 tokens, ended complete. Files changed: `.claude/commands/akili-execute.md` (+5/−1), `.claude/commands/akili-test.md` (+3/−1), `docs/flow.md` (+8/−4). Implementer verification: `grep -n -i cursor` → execute :61/:89/:369, test :57/:86, flow :254/:350/:358/:391; 2 pins per file; `^model:` → none; `leader.md` → 0 codex; four-host sweep → only three non-host "all four" hits remain (correctly kept); judgment call: a second four-host enumeration inside `flow.md:350` fixed under the sweep. **Evidence re-run (Leader-inline): VERIFIED** — identical hits; paraphrase sweep clean; `git diff --check` clean.

**Reviewer verdict (attempt 1):** `opus` — **FAIL**, verbatim:

> SUMMARY: T5 meets FR-8 point by point … I checked the vendor quotes against the live pages today, not just the design rows … all verbatim. Two issues block the gate.
>
> ISSUES:
> 1. **Discovered Issue:** `akili-execute.md:369` says "FR-10's live validation records what they are observed to do". This packaged command runs inside every installing project. In that context "FR-10" points to nothing, or worse, to the host project's own FR-10. During `/akili-execute` the Leader is reading that project's `requirements.md`, so a real FR-10 is right there to pick up by mistake. None of the other new sentences cite FR-/DD-/§/P- identifiers.
>    * **Violated Rule:** `AGENTS.md` Development Rules: "Keep command prompts readable and tool-agnostic where possible" and "Do not add project-specific assumptions to reusable commands."
>    * **Remediation Suggestion:** Drop the identifier. For example: "…the way Claude Code's `/goal` does, and this guidance makes no looping claim until a live Cursor session shows one. Run Cursor sessions attended." If a pointer is wanted, name the source in words ("the Cursor install-target spec's live validation"), never an FR number.
> 2. **Discovered Issue:** The model checkpoint in both `akili-execute.md:89` and `akili-test.md:86` reads "`/model` in Cursor, IDE and the `agent` CLI", pinned to <https://cursor.com/docs/cli/reference/configuration>. Today I fetched that page and it documents the command for the CLI only: "You can select a model for the CLI using the /model slash command." It says nothing about the IDE. … So the IDE half is a dated claim whose cited source does not support it, and it carries no UNVERIFIED marker. FR-8 asks only for "`/model` in Cursor"; the "IDE and" part goes beyond both the requirement and the source.
>    * **Violated Rule:** `requirements.md` NFR-5 … Also `design.md` DD-9.
>    * **Remediation Suggestion:** In both files, either scope the claim to what the source says ("`/model` in the Cursor `agent` CLI, <url>, `Last verified: 2026-10-01`") and attach `UNVERIFIED — confirm at source before relying on it` to the IDE half, or cite an IDE source that documents it. … Flag to the Leader that FR-7 asserts "`/model` in both IDE and CLI" for `docs/model-routing.md`, so T6 (the mirrors) should not copy the unsupported IDE half.
>
> ADVISORY: READABILITY — `docs/flow.md:254` "…are observed, not cited, as a condition-evaluated loop" can be read as the looping claim FR-8's BUT forbids; reword. RELIABILITY — the built-ins observation has a date but no Cursor version; the Codex precedent records one.

**Leader accountability:** Issue 2 originates in the Leader's brief, which stated "Model switch: `/model` in the Cursor IDE and the `agent` CLI (<config URL>)" as a sourced fact — a brief-contract (c) violation (source-or-`UNVERIFIED`): the page covers the CLI only. The same unverified "both IDE and CLI" wording sits in FR-7 (a specify-time present-tense reading never run — KZ-changes--leader-brief-contract-2 class; recorded as a kaizen signal together with the T7 F1 finding). The T4 Reviewer independently found the identical defect in `docs/model-routing.md`. Cost: one review round on T5 and one on T4.

**Execute-time spec edit (Leader, 2026-10-01):** FR-7 "(`/model` in both IDE and CLI)" → "(`/model` in the `agent` CLI, pinned; the IDE half source-or-`UNVERIFIED`)" — the requirement's obligation (tell the user how to switch on Cursor) is unchanged; the wording stops asserting an unsourced fact. Carried into T4 attempt 2 (already briefed with the settled facts), T5 attempt 2, and T6's Reviewer brief as a named check. Attempt 1 consumed. Effort bumped `medium → high`.

**T4 — Attempt 2** (2026-10-01) — Implementer `sonnet`, effort `xhigh`; runtime events: none; spawn: 29 calls, 96,670 tokens, ended complete. Delta: *How to apply* bullet (:784-791) — CLI `/model` pinned, IDE half with the byte-exact `UNVERIFIED` marker; CLI-invocation row (:632) — three pins; effort pin cites both pages; advisories applied (`DD-8`/`§5.5`/`FR-8` rewordings; duplicated marker tail dropped). **Evidence re-run (Leader-inline): VERIFIED** — 5 pins, 2 markers, 0 spec IDs (pre-existing `:220 DD-2` untouched), NF=9 ×8, `git diff --check` clean.

**Reviewer verdict (attempt 2):** `opus`, 6 calls, 68,958 tokens — **PASS** with two advisories: RELIABILITY — the quoted CLI sentence is "not verbatim with what the fetched page says"; READABILITY — "Use either" ambiguity.

**Leader adjudication → FAIL (override g):** raw-page check (`curl -sL https://cursor.com/docs/cli/reference/configuration`, 2026-10-01): the page's sentence is **"You can select a model for the CLI using the /model slash command."**; the string "Models are set via" does **not** occur. The quotation in :784-785 is therefore false — it was supplied by the Leader's attempt-2 brief as a "settled fact" taken from a summarizing fetch (brief-contract (c) violation by the Leader; same failure class as the proposal's `new_content`). A false quote inside a pins section is an NFR-5 conformance defect, not a readability advisory; the PASS is set aside and the task goes to attempt 3 with the verbatim sentence. Second review round on T4 consumed; attempt 2 consumed; effort stays `xhigh`. **Kaizen signal (third occurrence this spec):** summarizer-derived "quotes" entered a brief/spec as verbatim — the Leader now verifies every quoted vendor sentence against raw HTML before it enters a brief.

**T5 — Attempt 2** (2026-10-01) — Implementer `sonnet`, effort `high`; runtime events: none; spawn: 20 calls, 104,223 tokens, ended complete. Delta: `:369` identifier dropped ("the Cursor install-target spec's live validation records what the built-ins are observed to do"); `:89`/`:86` checkpoint split — CLI `/model` pinned to the configuration page, "the IDE's model picker (`UNVERIFIED — confirm at source before relying on it`)"; advisories applied: `flow.md:254` reworded ("observed to exist … no cited source documents one looping on a condition"), Cursor version `cursor-agent 2026.09.26-dd393fe` added at `:369` and `flow.md:254`. **Evidence re-run (Leader-inline): VERIFIED** — hits unchanged (3/2/4), 0 spec IDs in Cursor sentences, markers on the IDE clause in both files, version stamps present, `^model:` none, `git diff --check` clean. Leader raw-HTML quote check (2026-10-01): every cursor.com sentence quoted in these three files — "Agent sends multiple Task tool calls…", the depth-limit sentence, "For compatibility, Cursor also loads skills…", "Skills can also be manually invoked by typing `/`…" — occurs verbatim on its page.

**Reviewer verdict (attempt 2):** `opus`, 5 calls, 68,807 tokens — **PASS**: "Both prior FAIL issues are closed the way the remediation asked, and no region accepted in attempt 1 regressed." ADVISORY (recorded): the parenthetical pointer at `:369` adds nothing an installing project can act on — optional removal.

| Field | Value |
|---|---|
| Status | **PASS** (attempt 2) |
| Attempts | 2 (attempt 1 FAIL — bare `FR-10` in a packaged command; unsourced `/model`-in-IDE claim from the Leader's brief) |
| Review rounds consumed | 2 |
| Review intensity | Override (a) rules documents; attempt 2 also (e) |
| Requirements covered | FR-8 (both scenarios, all clauses incl. the Unattended `BUT` and the tenant-cell `AND`), NFR-3, NFR-5 |
| Files changed | `.claude/commands/akili-execute.md`, `.claude/commands/akili-test.md`, `docs/flow.md` |
| Decisions | Effort `medium` → `high` on retry. Leader-caused issue 2 recorded above; FR-7 amended accordingly. Mirrors (`docs/commands/akili-execute.md`, `akili-test.md`) are T6's |
| Final verification | greps as above; `git diff --check` clean |

**T4 — Attempt 3** (2026-10-01) — Implementer `sonnet`, effort `xhigh`; runtime events: none (one Leader mid-turn correction message, delivered after the first report and acted on in a resumed turn); spawn: 30 calls, 86,470 tokens, ended complete. Delta: `:784` verbatim CLI sentence "You can select a model for the CLI using the /model slash command." (pin kept); `:787` "Use the CLI `/model` or the IDE picker…"; `:270-273` false `"Requires approval"`/"hidden by default" claim replaced by "Which models a given account can pick is not stated on the models page, so the project confirms its own slugs on its live `/model` picker…"; `:137` "multi-vendor and plan-gated" → "multi-vendor". The worker correctly left `:170`/`:253` ("plan-gated" — Codex claims on the Codex pin) untouched and reported the grep discrepancy instead of forcing it to zero. **Evidence re-run (Leader-inline): VERIFIED** — verbatim sentence 1 hit; "Models are set via" 0; "Requires approval|hidden by default" 0; pins 5; markers 2; NF=9 ×8; `git diff --check` clean. Raw-HTML quote check of every page-attributed quotation in the file (2026-10-01): all present verbatim.

**Reviewer verdict (attempt 3):** `opus` — **PASS**: "Both false quotations are gone … attempt 3 added no unsourced claim and broke nothing that attempts 1 and 2 had accepted. … No unverified page quotation remains."

| Field | Value |
|---|---|
| Status | **PASS** (attempt 3) |
| Attempts | 3 (1 FAIL — unpinned bullet/row; 2 PASS set aside by Leader override (g) — false quotations from the Leader's brief; 3 PASS) |
| Review rounds consumed | 3 |
| Review intensity | Override (a); attempts 2–3 also (e) |
| Requirements covered | FR-7 (registry half, as amended), NFR-5 |
| Files changed | `docs/model-routing.md` (+58 / −10) |
| Decisions | Effort `high` → `xhigh`. Two Leader-caused defects (summarizer-derived quotations stated as settled facts) cost rounds 2 and 3; the Leader now raw-verifies every quoted vendor sentence before it enters a brief (kaizen signal, third occurrence this spec). DD-8 amended (per-account availability `UNVERIFIED`). Step 8C half → T3; mirrors/`docs/README.md` → T6 |
| ADVISORY (recorded) | Attempt 1: spec-ID wording (applied); duplicated marker tail (applied); models-page pin on effort (applied). Attempt 2: quote not verbatim (escalated to FAIL by the Leader); "Use either" (applied). Attempt 3: two long lines (cosmetic) |
| Final verification | greps as above; `git diff --check` clean |

---

### Wave 3 — T3 (started 2026-10-01, while T2's Reviewer runs)

**Leader decisions (pre-spawn):** T3 effort `high` (rules document; the gate script edit is correctness-critical and T7's fixtures are the red/green gate); skills `cognitive-doc-design`, `systematic-debugging`, `caveman` per task list. T3 also removes the `todo` flags from `test/tasks-gate.test.js` F1–F3 (T7's forward pointer). The T7 header-comment advisory (stale pre-amendment NFR-7 quote) is NOT in T3's brief — not approved. Review intensity: override (a) → Reviewer owed; the Leader runs the restatement sweep before spawning it. All vendor sentences T3 may quote were raw-HTML verified by the Leader on 2026-10-01 (listed in the brief).

---

### T2 — Installer tests and CI fixtures (in progress)

**Attempt 1** (2026-10-01) — Implementer `sonnet`, effort `high`; runtime events: none; spawn: 65 calls (host count; over the persona's 60-call self-count bound — the task completed verified, the call-bound row applies), 294,516 tokens, ended complete. Files: `test/install-cursor.test.js` (new, 751 lines, 11 tests), `test/fixtures/doctor-codex-baseline.txt` (new, from a detached `7cd681a` worktree, removed afterwards), `scripts/ci/install-layout-regression.js` (+72/−24: four-state fixture, `CURSOR_CONFIG_DIR` pinned, `SHIPPING_TARGETS` unchanged). Implementer verification: 11/11; `npm test` 90/87/0/3; regression script `LAYOUT-IDENTICAL` ×3 + `FIXTURE OK` four states; falsifiers (a) guard removed → `S3: expected codex NOT detected … expected: false / actual: true`, (b) flag removed → `S2: expected cursor NOT detected … expected: false / actual: true`, both restored. **Evidence re-run (Leader-inline): VERIFIED** — 11/11; `npm test` 90/87/0/3; regression script (background, full run) `LAYOUT-IDENTICAL claude (16 expected source diffs)`, `… opencode (16)`, `… antigravity (62)`, `FIXTURE OK: four-state detection holds …`, exit 0; `node --check` ×2; `git diff --check`; worktree list clean.

**Discoveries (Implementer, accepted as execute-time spec edits):** (1) `akili update --dry-run` does **not** honor `--dry-run` before its package-manager step — it ran a real `npm install -g akili-specs@latest` on this machine and short-circuits before detection under `npx` → pre-existing CLI defect, **out of scope**, recorded here as a candidate follow-up (never minted into a task); the fixture drives `doctor` (same `resolveTools()` path). (2) The installer's summary counts operations (35 + 8 = 43), not files (210) → FR-2/FR-4 and `tasks.md` T2 counter wording amended (KZ-002 class: a spec aggregate never run at specify time).

**Reviewer verdict (attempt 1):** `opus`, 9 calls, 102,248 tokens — **FAIL**, verbatim:

> SUMMARY: T2 is close to done. Scope is clean … All 22 spawns pin HOME, USERPROFILE, CODEX_HOME and CURSOR_CONFIG_DIR. The four detection states create their files before each assertion. … Three things block it: the Codex-baseline test will go red on Windows and after the next version bump, one FR-4 clause has no test, and one FR-1 clause has no test while S1's "none detected" result can pass on a run that did nothing.
>
> ISSUES:
> 1. **Discovered Issue:** The NFR-6 baseline comparison is not stable across platforms or versions. (a) The fixture uses POSIX separators (`<HOME>/.codex/akili/scripts/…`, `Checking CODEX: <HOME>/.codex (skills → <HOME>/.agents/skills)`); the CLI builds these with `path.join` (`toolTargetLabel`, `bin/akili.js:649-650`), so windows-latest prints backslashes and fails. (b) No `.gitattributes`, so a CRLF checkout breaks byte equality. (c) The fixture commits `Doctor Summary — akili-specs v2.30.0` (`bin/akili.js:1768`); the next version bump turns `npm test` red with no behavior change.
>    * **Violated Rule:** FR-4 "AND IT MUST hold on Windows paths (CI matrix)"; NFR-4.
>    * **Remediation Suggestion:** Normalize both sides the same way: `\` → `/` after the `<HOME>` substitution, `\r\n` → `\n`, and `v\d+\.\d+\.\d+` on the Doctor Summary line → `v<VERSION>`. Regenerate the fixture through the same normalizer from the 7cd681a worktree. Do not hand-edit it. Optionally add `test/fixtures/*.txt text eol=lf`.
> 2. **Discovered Issue:** FR-4 clause (c) has no assertion: "each tool's resources root exists and the other's does not".
>    * **Violated Rule:** FR-4 … clause (c).
>    * **Remediation Suggestion:** Install codex, then cursor, into separate config homes sharing one `--*-skills-target`; assert the second run reports 0 installed / 35 skipped under the shared root; assert each `akili/` root exists only for the tool installed there.
> 3. **Discovered Issue:** In the four-state test, `detect()` never checks the exit status, so a crashed `doctor` returns `[]` and S1 passes vacuously. The FR-1 clause "keep the first-run default (`claude`) when nothing is detected" is not asserted anywhere.
>    * **Violated Rule:** FR-1 Auto-detection scenario, last `AND IT MUST`.
>    * **Remediation Suggestion:** Assert `status === 0` inside `detect()`. In S1, also assert no banner was printed and the output contains `Checking CLAUDE:`.
>
> ADVISORY: Reliability — ~14 `mkdtempSync` homes never removed (add `t.after(() => fs.rmSync(...))`). Resilience — the binary-absent test sets `PATH` to `dirname(process.execPath)`; if `cursor-agent` sits beside node the test reds for the wrong reason; prefer the empty-PATH approach. Readability — the FR-2 "no second copy" `BUT` is covered only indirectly; add `!exists(cursor-home/skills)`.

Attempt 1 consumed. Effort bumped `high → xhigh`. **Attempt 2 is held until T3's Implementer lands** — T2's tests copy and byte-compare `.claude/commands/*`, which T3 is editing (shared input; `leader.md` → *Disjoint source files are necessary but not sufficient*).

---

### T3 — Constitution: Step 7 list, 8C, 8E, 8F, 9 (in progress)

**Attempt 1** (2026-10-01) — Implementer `sonnet`, effort `high`; runtime events: none; spawn: 101 calls (host count — well past the persona's 60-call self-count bound; task completed verified, so the call-bound row applies, but the overrun is recorded as a kaizen signal: the deployed persona carries the bound and the worker still ran 101 calls), 223,857 tokens, ended complete. Files: `.claude/commands/akili-constitution.md` (+~180/−~17 across eleven sites), `test/tasks-gate.test.js` (`todo` removed from F1–F3; two comments reworded; re-indent). Implementer verification: red before (F2/F3 `expected 2, actual 0`) → `node --test test/tasks-gate.test.js` 10/10/0/0 after; `npm test` 90/90/0/0; falsifiers via `AKILI_GATE_SCRIPT` — deny after `esac` → F5/F7 `not ok`; `new_content` candidate removed → F2 fails on its stderr assertion; script hunk confined to the `Write)` arm; pins 10; markers 5; 0 spec IDs in added lines; restatement sweep with dispositions. **Evidence re-run (Leader-inline): VERIFIED** — identical test counts; the only script hunk is `-935 +1012,5` inside `Write)`, 0 `-` lines in the Edit arm; fence 945–1059 intact; pins 10, markers 5, spec IDs 0; remaining "all four" hits are persona counts; `git diff --check` clean.

**Reviewer verdict (attempt 1):** `opus` — **FAIL**, verbatim:

> SUMMARY: … Most of the task is correct. Step 7, the Step 8E Cursor bullet (FR-5 checked term by term), the tenant cell (FR-8), the Step 8F sub-step 4 merge clauses (FR-6(b)), the host-data row and the denial note all conform. Every vendor quotation matches the raw-verified set. The `Write`-arm change is the only edit inside the script … I counted the `exit 2` lines in the script and there are now 8, matching the prose. `test/tasks-gate.test.js` passes: the only changes are the three removed `todo` options, the re-indent, and rewording of two comments that described the old todo state. The header, fixtures, assertions and extraction are untouched.
>
> ISSUES:
> 1. **Discovered Issue:** The honesty note (:1236-1238) says a "crash, timeout, or missing `bash`/`jq`" fails open on the imported entry, "which is exactly why the native fallback entry sets `failClosed: true`". That is false for a missing `jq`. Without `jq`, `fp` comes back empty and the path filter `*) exit 0` (:1003) allows the write silently with exit 0. No hook failure happens, so `failClosed` catches nothing.
>    * **Violated Rule:** design.md §5.4 (failClosed covers "a crash, timeout, or exit 127") and FR-6(c).
>    * **Remediation Suggestion:** Drop `/jq` from the parenthetical, or state that a missing `jq` reaches the path filter's `exit 0` and is not covered by `failClosed`. Do not change the script.
> 2. **Discovered Issue:** The checklist item at :1299 contradicts itself ("at most one hook entry" … "that plus a native entry" … "never both").
>    * **Violated Rule:** FR-6(b).
>    * **Remediation Suggestion:** Reword to "at most one entry *active* on Cursor".
> 3. **Discovered Issue:** Step 8C item 4 (:495) still prescribes registry columns `Tier | Claude Code | OpenCode | Fallback`. Its being stale before this task does not exempt it: it is the exact sentence that defines the columns Step 8C scaffolds.
>    * **Violated Rule:** FR-7: "`/akili-constitution` Step 8C SHALL scaffold five host columns".
>    * **Remediation Suggestion:** List all five hosts plus Fallback, in the order of the docs/model-routing.md:118 header.
> 4. **Discovered Issue:** Several new Step 8C Cursor claims carry no pin: `agent` is the CLI; the installer writes a `cursor-agent` symlink; the roster is multi-vendor with no floating alias besides `auto`; models are confirmed on the `/model` picker with no CLI/IDE qualifier.
>    * **Violated Rule:** NFR-5; FR-7 (as amended).
>    * **Remediation Suggestion:** Pin <https://cursor.com/docs/models> for multi-vendor and `auto`; pin <https://cursor.com/docs/cli/reference/configuration> for `/model` and say "in the `agent` CLI", mark the IDE half `UNVERIFIED`; mark the `cursor-agent` symlink as observed locally / `UNVERIFIED` elsewhere.
> 5. **Discovered Issue:** At :756-758 "All five hosts restrict the Reviewer … than on the other two" — the count was bumped and the surviving "the other two" was not.
>    * **Violated Rule:** T3 Scope restatement sweep.
>    * **Remediation Suggestion:** Write "the other hosts", or name them.
>
> ADVISORY: READABILITY — the Step 8E example shows `[effort=high]` without `<CONFIRM>`; READABILITY — the Cursor bullet sits between the Codex bullet and the tenant table (moving it after the Codex tenant block would fix the structure); RISK — the precedence quote adds backticks (formatting only); RELIABILITY — the new `Write` deny also blocks a Claude Code `Write` that empties a tasks.md (fail-closed direction; note for T8).

Attempt 1 consumed (review round 11 of 16). Effort bumped `high → xhigh`. **Attempt 2 held until T2 attempt 2 lands** (T2's tests byte-compare `.claude/commands/*`). Budget watch: rounds remaining 5; minimum needed T3-2 + T2-2 + T6 + T8 = 4.

**T2 — Attempt 2** (2026-10-01) — Implementer `sonnet`, effort `xhigh`; runtime events: none; spawn: 84 calls (host count; over the 60-call self-count bound — kaizen signal repeated), 206,896 tokens, ended complete. Delta: both-sides normalizer (`\`→`/`, CRLF→LF, `v\d+\.\d+\.\d+`→`v<VERSION>`, `<HOME>` substitution) applied at compare time to the live output and the fixture read from disk; fixture regenerated from a detached `7cd681a` worktree (removed afterwards); new FR-4 (c) test (codex alone → `<cursor-home>/akili` absent; cursor alone onto the shared root → 0 installed / 35 skipped, both `akili/` roots exist); direct `!exists(cursor-home/skills)` for the FR-2 `BUT`; S1 gated by a real `--tool claude` pre-install + `status === 0` + no banner + `Checking CLAUDE:` (judgment call, root cause verified: `doctor` exits 1 in S2–S4 because codex/cursor are marker-only installs — `bin/akili.js:1764-1784` `missingTotal > 0` → `exitCode = 1`); advisories applied (`t.after` cleanup; empty-PATH for the binary-absent test). **Evidence re-run (Leader-inline): VERIFIED** — 12/12; `npm test` 91/91/0/0; fixture `v<VERSION>` ×1, 0 backslashes, 0 machine-specific strings; `node --check` ×2; `git diff --check`; no leftover worktree.

**Reviewer verdict (attempt 2):** `opus` — **PASS**: "All three attempt-1 FAIL issues are closed, and nothing regressed … I simulated a Windows run … The two sides compared equal. … No state assertion can pass on a crashed CLI." ADVISORY (recorded): header comment says `detect()` asserts exit status (now S1 does); `module.exports` at the file's bottom runs the tests when required — move the normalizers to a helper if regeneration is needed again; S2–S4 could also assert `status ∈ {0,1}` (belt-and-braces).

| Field | Value |
|---|---|
| Status | **PASS** (attempt 2) |
| Attempts | 2 (attempt 1 FAIL — baseline fixture not platform/version-stable; FR-4 (c) untested; `detect()` exit status / claude fallback untested) |
| Review rounds consumed | 2 |
| Review intensity | Override (c); attempt 2 also (e) |
| Requirements covered | FR-1 Auto-detection (all clauses incl. symmetric + first-run default), FR-2 (all three scenarios), FR-3 (all three scenarios), FR-4 (every clause, as amended), NFR-1, NFR-2, NFR-4 (local legs; CI matrix on push), NFR-6 |
| Files changed | `test/install-cursor.test.js` (new, 937 lines, 12 tests), `test/fixtures/doctor-codex-baseline.txt` (new, normalized), `scripts/ci/install-layout-regression.js` (+72/−24) |
| Decisions | Effort `high` → `xhigh`. Execute-time spec edits: FR-2/FR-4 counter wording (operations vs files); fixture driver `doctor` instead of `update --dry-run`. **Out-of-scope defect recorded, not actioned:** `akili update --dry-run` runs the real package-manager step before honoring `--dry-run` (observed: a real `npm install -g akili-specs@latest` on this machine) — candidate for a separate `/akili-propose` (Bug) |
| Final verification | `node --test test/install-cursor.test.js` 12/12; `npm test` 91/91/0/0; regression script `LAYOUT-IDENTICAL` ×3 + `FIXTURE OK` (attempt-1 Leader run; script unchanged in attempt 2) |

**T3 — Attempt 2** (2026-10-01) — Implementer `sonnet`, effort `xhigh`; runtime events: none; spawn: 39 calls, 130,780 tokens, ended complete. Delta: honesty note (`:1243-1252`) now states the missing-`jq` silent allow truthfully; checklist bullet (`:1311`) "at most one entry **active** on Cursor"; Step 8C column list (`:495`) → `Tier | Claude Code | OpenCode | Antigravity | Codex | Cursor | Fallback`; Step 8C Cursor claims pinned (`:518-533`: models page quote for multi-vendor; configuration page for `/model` in the `agent` CLI; IDE `/model` marked; `:545-559`: `agent` pinned to the CLI overview; `cursor-agent` symlink "observed locally, `UNVERIFIED` on other installs"); `:768` "the other hosts"; example `[effort=high] <CONFIRM>` (`:846`). **Evidence re-run (Leader-inline): VERIFIED** — column list 1; "the other two" 0; pins 13; markers 7; spec IDs 0; script hunk unchanged; gate tests 10/10; `git diff --check` clean.

**Reviewer verdict (attempt 2):** `opus` — **PASS**: "All five attempt-1 issues are fixed. Every new pin sits on the claim it covers, and every quotation matches one of the raw-verified sentences. Nothing regressed … I traced [the missing-`jq` path] in the script myself … the note is correct." ADVISORY (recorded): `:530` "exposes no floating alias besides `auto` (sourced on the same page)" over-reads the page — it documents Auto, not the absence of other aliases (only the local `aliases: []` supports that half); `:1247` "a non-2 exit code" read literally includes 0 — "any other hook failure" would match the vendor wording. Both are candidates for T6's sweep judgment only if its obligation-keyed pass reaches them; otherwise recorded.

| Field | Value |
|---|---|
| Status | **PASS** (attempt 2) |
| Attempts | 2 (attempt 1 FAIL — five prose issues) |
| Review rounds consumed | 2 (total 13 of 16) |
| Review intensity | Override (a); attempt 2 also (e) |
| Requirements covered | FR-5 (both scenarios, all clauses), FR-6 (a)(b)(c) + scenarios (offline halves; live halves → T8), FR-7 (Step 8C half), FR-8 (tenant cell `:818`→`:886`), FR-9 (Step 7 list), NFR-5, NFR-7 (green half: F1–F3 now plain passing tests) |
| Files changed | `.claude/commands/akili-constitution.md` (+~190/−~17), `test/tasks-gate.test.js` (`todo` removed, comments reworded, re-indent) |
| Decisions | Effort `high` → `xhigh`. Implementer judgment: "gains a third tenant on this host" → "on Codex" (clarity after insertion). The T7 header-quote advisory stayed untouched (not approved). The Step 8E Cursor bullet sits before the Codex tenant table (Reviewer advisory: structural relocation not approved — recorded) |
| Forward pointers | → T6: mirror `docs/commands/akili-constitution.md` to the eleven sites; `docs/cli.md:18` numbering; the two advisories above if the sweep reaches them. → T8: observe the fail-closed `Write` deny on a legitimate empty Write (known false-deny direction) |
| Final verification | `node --test test/tasks-gate.test.js` 10/10/0/0; `npm test` 91/91/0/0 (T2 landed) |

---

### Wave 4 — T6 (started 2026-10-01)

**Leader decisions (pre-spawn):** effort `high` (summary surfaces inherit the artifacts' evidence bar — KZ-002, five recurrences); skills `cognitive-doc-design`, `caveman` per task list. Mirrors under `docs/commands/` are summaries, not copies — Cursor is added wherever a mirror covers a changed step, in the mirror's register. Forward pointers carried: `docs/cli.md:18` init numbering; T1 advisory (stale `bin/akili.js` comments "four-tool" / "Codex is the exception") — in the sweep's obligation-keyed scope; T3 Reviewer advisories (`:530` alias over-read, `:1247` "non-2 exit code") only if the sweep's obligation pass reaches them. CHANGELOG must not state any outcome T8 has not produced ("pending live validation" on Cursor). Review intensity: override (c) derived evidence (sweep, CHANGELOG) → Reviewer owed. Budget: 13 rounds used; T6 + T8 = 15 minimum.

---

### T6 — Mirrors, root docs, CHANGELOG, closure sweep (in progress)

**Attempt 1** (2026-10-01) — Implementer `sonnet`, effort `high`; runtime events: none; spawn: 119 calls (host count — far past the 60-call self-count bound; task completed verified; kaizen signal — the fourth worker this spec to overrun the bound), 248,254 tokens, ended complete. Files: 12 docs/root files + 2 comment-only hunks in `bin/akili.js` (+143/−65). Implementer verification: sweep BEFORE 44 → AFTER 29 lines, each dispositioned; obligation-keyed pass; `npm test` 91/91; `node --check`; `git diff --check`; NFR-3 grep empty; pins ≥1 in `docs/cli.md`/`README.md`; doctor 11/11 + 24/24 on a scratch Cursor install; a CHANGELOG clause → `file:line` table. **Evidence re-run (Leader-inline): VERIFIED** — sweep 29 lines / 14 files with the same keeps; `npm test` 91/91/0/0; `node --check` OK; `git diff --check` clean; `^model:` 0; doctor → 11 `akili-*` OK rows, `CURSOR HEALTHY ok 43 | missing 0`; `.claude/README.md:15` reads "The other four targets".

**Reviewer verdict (attempt 1):** `opus` — **FAIL**, verbatim:

> SUMMARY: The diff stays in scope. … NFR-6 holds … The FR-9 sweep reproduces, and every listed keep is sound. Most CHANGELOG clauses check out at HEAD … But KZ-002 quote-checks fail in three places, a docs sentence misstates DD-2, and two four-host lists survive.
>
> ISSUES:
> 1. The `docs/cli.md` auto-detect paragraph (diff `+312-321`) misstates DD-2: it says detection for "Codex and Cursor" keys on resources "or an `akili-<cmd>/SKILL.md` command skill" … Read that way, a Codex skills-only machine would detect Cursor. Shipped `bin/akili.js:458` (`if (paths.detectByResourcesOnly) return false;`) means Cursor detects by its resources root only. The new "Shared and compatibility skill roots" section also does not name the DD-2 rule. — Violated: FR-1 Auto-detection; design §7 row 20; T6 Scope. — Remediation: split the rule (Cursor: own resources root only; Codex: resources root, or a command skill only while no sibling tenant's resources root is populated); say it in the new section or link to it.
> 2. CHANGELOG: "Both commands gain a Cursor spawn-mechanics bullet (… the depth-2 subagent limit)" — `akili-test.md:57` has no depth limit; only `akili-execute.md:61` does. — Violated: KZ-002 quote-check. — Remediation: attribute the depth limit to `/akili-execute` only.
> 3. CHANGELOG: "release classified minor: new install target and new command capability" — no new command ships. — Violated: KZ-002; AGENTS.md Release Rules. — Remediation: "minor: new install target".
> 4. Two `README.md` host lists still name four hosts (`:472` `akili doctor --tool <claude|opencode|antigravity|codex|both|all>`; `:873` "runs under Claude Code, OpenCode, Google Antigravity (…), and Codex (…)"). — Violated: FR-9 ("keyed on the obligation"). — Remediation: add `cursor` at `:472`; add Cursor at `:873` in the mirror's register.
> 5. Unpinned Cursor claims in the mirror: `docs/commands/akili-constitution.md` 8F "On Cursor" paragraph (import on by default; the gate reads `.tool_input.file_path`) and the 8C sentence (`agent` / `/akili-<name>`; no floating alias besides `auto`). — Violated: FR-9 (pins); NFR-5. — Remediation: carry the canonical pins (third-party-hooks, cli/overview, context/skills, models).
>
> ADVISORY: `bin/akili.js:426-431` header comment still says "either one" detects by resources or a command skill (wrong for Cursor); `:141-145` "{ root, skillsRoot } for Codex". `docs/cli.md:19` "in this release" will go stale — name the version. CHANGELOG "neither field" → "no readable content" (an empty `content` is denied too). CHANGELOG Notes claim FR-4 holds on NFR-6 evidence only — name the DD-2 sibling suppression. "this changelog now say five wherever they said four" overclaims (older entries frozen); bullets much longer than the `## [2.30.0]` entry's. README target-table cell "(IDE agent or `agent` CLI)" unpinned.

Attempt 1 consumed (round 14 of 16). Effort bumped `high → xhigh`. **Budget watch:** T6 attempt 2 (round 15) + T8 (round 16) land exactly on the budget; any further FAIL exceeds it → stop and escalate.

**T6 — Attempt 2** (2026-10-01) — Implementer `sonnet`, effort `xhigh`; runtime events: none; spawn: 69 calls (host count; over the 60-call bound again), 158,107 tokens, ended complete. Delta: `docs/cli.md` split DD-2 rule at `:45-47` and `:205-207`, `:19` names v2.31.0; CHANGELOG — "minor: new install target", depth limit attributed to `/akili-execute` alone, "no readable new content" clause, Notes separate NFR-6 from the by-design DD-2 change (four-state fixture as evidence), "and this changelog" dropped; `README.md:472`/`:873` name Cursor, target-table cell drops the unpinned "`agent` CLI"; mirror pins carried (third-party-hooks, hooks page, cli/overview, context/skills, models — `auto` wording matches canonical `:523`); `bin/akili.js` comments `:142-146`, `:426-431` corrected (comment-only). **Evidence re-run (Leader-inline): VERIFIED** — FR-9 sweep 29 lines with the same keeps; obligation pass 0; Unreleased "new command capability" 0; `README.md:472`/`:873` five hosts; mirror pins 6; `npm test` 91/91/0/0; `node --check`; `git diff --check` clean; `^model:` 0.

**Reviewer verdict (attempt 2):** `opus` — **PASS**: "All five attempt-1 FAIL issues are fixed, and each one checks out against the shipped source. … The text at `:40-50` and `:205-207` now matches `bin/akili.js:441-470` exactly." CHANGELOG clauses each matched to a `file:line`. ADVISORY (recorded): mirror 8C sentence is a long run-on and its `/model`-in-CLI claim lacks the pin the canonical carries; "design DD-2" / spec IDs in `docs/cli.md` and CHANGELOG Notes are allowed by the T4 precedent but unresolvable without the spec; `docs/cli.md:19` "from v2.31.0" is a projected version — confirm at release.

| Field | Value |
|---|---|
| Status | **PASS** (attempt 2) |
| Attempts | 2 (attempt 1 FAIL — DD-2 misstated in `docs/cli.md`, two CHANGELOG quote-check failures, two surviving README four-host lists, unpinned mirror claims) |
| Review rounds consumed | 2 (total **15 of 16**) |
| Review intensity | Override (c); attempt 2 also (e) |
| Requirements covered | FR-9 (statement + KZ-002 scenario, all clauses), FR-1 init-numbering note (CHANGELOG + `docs/cli.md`), FR-3 row text in docs, NFR-2, NFR-3, NFR-5 |
| Files changed | `docs/commands/akili-constitution.md`, `docs/commands/akili-execute.md`, `docs/commands/akili-test.md`, `docs/commands/README.md`, `docs/cli.md`, `README.md`, `docs/README.md`, `.claude/README.md`, `AGENTS.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, `bin/akili.js` (comments only) |
| Decisions | Effort `high` → `xhigh`. Advisories carried from T1 (stale `bin/akili.js` comments) applied inside FR-9's obligation scope. T3's two advisories (`:530` alias over-read, `:1247` "non-2 exit code") were not reached by the sweep — remain recorded only |
| Forward pointers | → T8: nothing. → release: `docs/cli.md:19` assumes `release:minor` → v2.31.0 |
| Final verification | sweep 29/14 with dispositions; `npm test` 91/91/0/0; doctor on a scratch Cursor install 11 commands / 24 skills OK |
