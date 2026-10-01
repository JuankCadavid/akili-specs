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
