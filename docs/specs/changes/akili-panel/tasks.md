# Tasks: akili-panel — a Claude Code side pane for the AKILI flow

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-panel` |
| Status | **Design / tasks approved by JC (Juan Carlos Cadavid), 2026-11-05 ~20:27 America/Bogota:** «Apruebo diseño y tasks, sigue con /akili-execute changes/akili-panel». Approval Mode stays `gated`. **Amended after the T1 Pivot** (A1, B1, C1, D1) on JC's decision, 2026-11-05 ~20:50 America/Bogota: «Apruebo A1, B1, C1 y D1, incluida la prueba en ~/.claude/skills/akili-probe/» (`execution.md` → *Pivot Record: T1*). Previously: draft for JC's design / tasks gate. Updated 2026-11-05 for JC's «Fix only»: A-1, A-2 and W-1 … W-14 folded in (`judgment.md`) |
| Requirements / Design | `requirements.md`, `design.md` (judgment-day outcome in `judgment.md`) |
| Baseline | `7a697ba`. `npm test` → **1450 pass, 0 fail** (run 2026-11-05, 46 s) |
| Observed reds | Run 2026-11-05 at `7a697ba` on today's code with a temporary `.claude/skills/zz-red-probe/` holding only `.claude-plugin/plugin.json` (removed after; `git status --short` showed only `.run/` and this spec folder). **R1** `node --test test/docs-overview.test.js` → `not ok 3 - (a) … lists every skill once …` with `missing row for skill zz-red-probe (.claude/skills/zz-red-probe/SKILL.md)`; `not ok 5 - (c) … Skill Inventory has one row per skill`; `not ok 6 - (d) every '<N> commands\|skills' claim equals the derived total`. **R2** `node --test test/install-cursor.test.js` → `not ok 14 - … Codex installs fresh, Cursor skips every shared-root file while its own resources install`. **R3** `HOME=<tmp> node bin/akili.js install --tool cursor` → `<tmp>/.agents/skills/zz-red-probe` exists; `doctor --tool cursor` → `MISSING zz-red-probe`. **R4** after `install --tool claude`, `doctor --tool claude` → `MISSING zz-red-probe`; `node bin/akili.js list` → `zz-red-probe` under `Skills:` and `Summary: 14 commands \| 33 skills \| 8 resources (akili-specs v2.42.0)` |
| Commit prefix | `[SPEC:changes/akili-panel]`. Local commits only: no push, PR, merge, tag or publish |
| Budget (design §12) | 9 tasks · **~4,000 LOC · 18 review rounds** (raised on JC's decision, 2026-11-06 ~03:44 America/Bogota: «Apruebo opción 1: subir presupuesto a ~4,000 LOC y 18 rounds y continuar» (`execution.md` → *Budget Tripwire: T4*)). Was ~2,100 LOC · 15 rounds; the tripwire fired at T4. `/akili-execute` stops and escalates when actuals pass it |
| PR strategy | Two PRs into `dev`: **PR 1** installer + plugin scaffold (T2, T3; ~760 LOC); **PR 2** the plugin and its docs (T4–T8; ~1,340 LOC), stacked on PR 1. T1 and T9 produce evidence only. Not opened in this cycle |
| `skip-eligible` tasks | **None.** Every task has consumers, a human check, or edits rules text |
| Backend route | No task is a backend task (`backend-routing.md:87`: no server-side code, API contract or error model); no `Backend route:` line |

## Dependency graph

```text
T1 ──► T2 ──► T3 ──► T7 ──► T8 ──► T9
        └───► T4 ──► T5 ──► T6 ──► T8
```

No cycles. T1 is a gate: a refuted P-24 stops the run (Pivot) before any build. T3 and T4 touch disjoint files and may run in either order after T2; this run executes them one at a time (one session per checkout).

## Common verification (every task)

`npm test` green · `git diff --check` clean · `git diff --stat` touches only the task's Scope files · `git diff --stat 7a697ba -- .claude/commands` empty (Non-Goals; Success Criterion 6) · package-affecting tasks (T2, T3, T7, T8) also run `npm run verify:cli` and `npm run pack:dry-run`. No test reads `docs/specs/changes/akili-panel/` (KZ-changes--archify-diagrams-1): fixtures only.

---

### T1: Settle the open premises with a live probe

| Field | Value |
|---|---|
| Status | `[x]` — PASS attempt 3 (Pivot decided by JC 2026-11-05 ~20:50; `execution.md` → T1 closeout) |
| Size | S (no repo code; one `execution.md` entry) |
| Depends on | — |
| Requirements | FR-1 (delivery path behind "Claude install"), FR-7 (the dispatch behind "Press"), FR-12 (subagent turns, D-9), FR-15 (generated types) |
| Design | §11 P-24, P-25, P-26, P-34; DD-1, DD-8, DD-9, DD-16; §13 first risk |
| Scope | Throwaway probe plugin **outside the repo** (same shape as the specify probe: `plugin.json`, `hooks/hooks.json`, a module logging `session.start`, `command.run`, `tool.call` on `Skill`, `turn.complete` with `agentId` and `usage` to a log file under `/tmp`). Run it in **interactive** Claude Code ≥ 2.1.318 sessions: (a) placed at `<trusted temp project>/.claude/skills/akili-probe/`; (b) placed at `~/.claude/skills/akili-probe/` — **ask JC first**: it writes into the user's own Claude config, and it is removed afterwards. In each session type `/akili-probe x` (a project command), ask the model to run it via the Skill tool, and ask for one subagent (Task/Agent tool) turn. For P-34 the probe also calls `$.command.run({ command: 'akili-probe', args: 'from-plugin' })` from a `$.clock.after` timer set at `session.start`, and logs the call time, the `command.run` line it raises, and when and how the promise settles (resolved value or rejection), relative to the turn's start and `turn.complete` (A-2). Record: adoption yes/no per placement (log lines + `claude --debug` adoption line), whether `.claude-plugin/types/` appeared, and the main-loop vs subagent `usage` against `$.session.usage().cost` |
| Tests | Manual probe; evidence quoted in `execution.md` |
| Falsifier | Remove the probe's `.claude-plugin/plugin.json` and start a session: no log line may appear. If one still appears, the log is not evidence of adoption |
| Red run | Observed at specify (2026-11-05, Claude Code 2.1.318, `-p`): in an untrusted temp project, `.claude/skills/probe-panel` was **not** adopted — no `events.log` was written and the debug log showed the skills scan with no adoption line. Interactive behaviour is unobserved |
| Disqualifier | A run under `-p`, under `--plugin-dir`, or with `CLAUDE_CODE_PLUGIN_DIRS` set proves nothing about skills-folder adoption; a log written by a plugin that was loaded another way is not evidence |
| Consumers | none |
| Review | `checklist` — evidence is a human-run session, judged by reading the quoted logs |
| Done criteria | `execution.md` records, each with its log excerpt: P-24 verdict for (a) and (b); P-25 verdict (double count yes/no); P-26 verdict; P-34 verdict with its timing. **P-24 refuted for (b) → mark T2–T9 `[~]` and open the Pivot Protocol** (DD-1 falls; options: marketplace-only delivery, or `CLAUDE_CODE_PLUGIN_DIRS`). P-25 "double count" → DD-9 amended at the next gate (sum main-loop turns only) before T5. P-34 refuted (no run, or no settling) → DD-8 amended at the next gate to the `$.prompt.fill` fallback, and the `pending` bound reset to the observed timing, before T5. Probe files deleted from `~/.claude/skills/` and `/tmp` |
| Skills | `systematic-debugging` |

### T2: Installer recognizes plugin entries and installs them for Claude only

| Field | Value |
|---|---|
| Status | `[x]` — PASS attempt 1 (`execution.md` → T2) |
| Size | L (~150 LOC code, ~410 LOC tests, ~40 LOC scaffold) |
| Depends on | T1 (P-24 confirmed) |
| Requirements | FR-1 (all four scenarios: Claude install incl. byte-identical, AND `--local`/`--skills-only`; every other target incl. BUT nothing else changes; `--tool all`; existing files skip / `--force`), FR-2 (update scenario; upgrade from an old installer incl. REMOVED line, ownership record, BUT foreign folder kept), FR-13 (skill count stays 32 — the test half), FR-15 (scenario on a temporary package copy: pack and install exclude `types/`; `.gitignore` half) |
| Design | §6.3 install/update rows; §7.1, §7.2, §7.3, §7.4; DD-1, DD-10, DD-16, DD-18; P-1, P-2, P-5, P-6, P-8, P-9, P-35, P-36, P-39 |
| Scope | (a) `bin/akili.js`: `isPluginEntry`; `listSkills` excludes plugin entries; `listPlugins`; the plugin policy composed in front of `skillsPolicy` at the copy (`:1254-1261`): silent skip for plugin entries, every other name forwarded with the inner policy's `.detail`, `.finish`, `.restore`; for `claude`, a dedicated plugin copy with skill-like skip-existing / `--force` output that skips `.claude-plugin/types` (W-2); for every other tool, leaked-copy removal (§7.4: strict identification, `REMOVED` line, Grok Bot record drop). (b) Plugin scaffold: `.claude/skills/akili-panel/.claude-plugin/plugin.json` (DD-14 fields), `hooks/hooks.json` (`modules: ["./register.jsx"]`), `hooks/register.jsx` exporting a `register` that adds no hook, `README.md` (≥ 40 words: what, Claude Code ≥ 2.1.318, status "under construction"). (c) `.gitignore` and `package.json` `files`: exclude `.claude/skills/*/.claude-plugin/types`. (d) New `test/install-akili-panel.test.js`: one test per target (`claude`, `claude --local`, `claude --skills-only`, `opencode`, `antigravity`, `codex`, `cursor`, `grokbot`, `all`), skip-existing / `--force`, `update`'s reinstall path (`install --force` plus a static check that `runUpdate` sets `force` then calls `runInstall`), seeded leaked copies per non-Claude target and in Grok Bot's record, a seeded foreign `akili-panel` (no `plugin.json`, and one with `SKILL.md`) left untouched; the FR-15 case on a **temporary copy** of the package (`bin/`, `.claude/`, `package.json`) with a fake `types/` folder: not copied, not in `npm pack --dry-run` (W-3). (e) Existing tests derive skill sets through the same two file checks (never by calling `bin/akili.js`): `install-cursor.test.js` (`SKILL_FILE_COUNT` literal `:250` and the derived counts), `install-grokbot.test.js` `SKILL_NAMES`, `install-grokbot-edge.test.js` `SKILL_NAMES`, `docs-overview.test.js` `inventory()` |
| Tests | `node --test test/install-akili-panel.test.js test/install-cursor.test.js test/install-grokbot.test.js test/install-grokbot-edge.test.js test/docs-overview.test.js test/install-stale-skills.test.js`; then `npm test` |
| Falsifier | (1) Make the plugin policy return pass-through for every tool → the `cursor`, `codex`, `opencode`, `antigravity` and `grokbot` tests in `install-akili-panel.test.js` go red (folder found). (2) Make `isPluginEntry` always false → `doctor --tool cursor` shows `MISSING` and the install / doctor suites go red (*corrected at execute, T2: `docs-overview` re-implements the predicate per design §9, so it cannot go red under this mutation; its red is baseline R1*). (3) Disable leaked-copy removal → every seeded-leak test goes red. (4) Identify by folder name only → the foreign-folder test goes red. (5) Drop the `files` negation → the temp-copy pack case goes red (observed with the specify probe, P-36). Each runs in the enumeration-wide form: the mutation is checked against **every** target test, not one |
| Red run | Observed at baseline: R1, R2, R3 (Document Control) — today's code, which treats a plugin entry as a skill, is what both falsifiers restore. The per-target reds for `opencode`, `antigravity`, `codex` and `grokbot` and the new test file's own reds: `predicted — greenfield artifact (observed in T2)`, quoted in `execution.md` |
| Disqualifier | A target test that passes because the tool's skills dir was never created (assert the dir exists and holds the 32 skills before asserting `akili-panel` is absent); a count test that passes because both sides were recomputed from the same changed source (the expected 32 is a literal) |
| Consumers | `test/install-cursor.test.js` `:224-256`, `:307-311`, `:322-326`, `:352-356`, `:409-413`, `:639-644`, `:768-781`, `:917-935`; `test/install-grokbot.test.js` `:105-108`, `:236-240`, `:244`, `:331`, `:422`, `:764-771`; `test/install-grokbot-edge.test.js` `:117-125`, `:167`, `:215`, `:359`; `test/docs-overview.test.js` `:30-34`, `:213-250`, `:270-280`, `:284-303`; `test/install-stale-skills.test.js:218-223`; `test/fixtures/doctor-codex-baseline.txt` (read at `install-cursor.test.js:883`, `install-grokbot.test.js:885`); `test/backend-skill-routing-coverage.test.js:270`; `scripts/ci/install-layout-regression.js:190-194`, `:290` (CI `ci.yml:113`; must stay green, no edit expected) (P-9, W-6) |
| Review | `full` — touches the install path of all six targets |
| Done criteria | Every target test green; both falsifiers observed red and quoted in `execution.md`; `npm test` count = baseline + new tests, 0 fail; `npm run pack:dry-run` lists the four scaffold files and no `types/`; `claude plugin validate .claude/skills/akili-panel` passes (warnings allowed: icon); `git diff --stat 7a697ba -- .claude/commands` empty |
| Skills | `tdd` |

### T3: `list` and `doctor` show the plugin

| Field | Value |
|---|---|
| Status | `[x]` — PASS attempt 2 (`execution.md` → T3) |
| Size | M (~40 LOC code, ~120 LOC tests) |
| Depends on | T2 |
| Requirements | FR-3 (list scenario: under `Plugins:`, not under `Skills:`, summary `32 skills \| 1 plugin`), FR-4 (healthy after install incl. no `MISSING akili-panel`; missing plugin + `--fix` restores; differing plugin reported `DIFFERS` incl. BUT MUST NOT overwrite; other tools incl. BUT not counted as missing; leaked copy reported `LEAKED` + `--fix` removes), FR-15 (doctor compare ignores `types/`) |
| Design | §6.3 list/doctor rows; §7.2 compare option; §7.3 doctor rows; §7.4 doctor rows; DD-10, DD-11, DD-18; P-3, P-29, P-31, P-40 |
| Scope | `bin/akili.js` `runList` (`Plugins:` heading after `Skills:`, summary field) and `doctorTool` (Claude-only plugin check: present by `plugin.json`, DIFFERS by a compare that ignores `.claude-plugin/types/`, `--fix` restores a missing plugin into the Claude skills dir and never writes a differing one; every other tool reports a leaked copy `LEAKED akili-panel`, removed by `--fix`). `bin/install-compare.js`: an optional ignore list for `compareEntry`, applied in `walkSource`, with a case in `test/install-compare.test.js` (W-2). `list` summary wording `1 plugin` / `<n> plugins` (W-9). Tests appended to `test/install-akili-panel.test.js` |
| Tests | `node --test test/install-akili-panel.test.js test/diagram-design.test.js test/install-stale-skills.test.js`; `npm run verify:cli`; `npm test` |
| Falsifier | (1) Print plugin entries under `Skills:` → the list test goes red. (2) Run the plugin check for every tool → the `doctor --tool cursor` / `--tool codex` tests go red (`akili-panel` named). (3) Drop the `types/` ignore → the "installed copy with a fake `types/` reads present, not DIFFERS" test goes red. (4) Let `--fix` overwrite a differing plugin → the "differing plugin is not overwritten" test goes red. (5) Skip the leak check in non-Claude doctor → the seeded `LEAKED` test goes red. (6) Ignore nothing in `compareEntry` → the `install-compare` ignore case goes red |
| Red run | Falsifier (1) and the missing plugin check: observed at baseline, R4. Falsifiers (2)–(6): `predicted — greenfield artifact (observed in T3)` (the plugin check does not exist yet), quoted in `execution.md` |
| Disqualifier | A doctor test that passes on an install where the Claude skills dir is absent; a list test that matches `akili-panel` anywhere in stdout instead of inside the `Plugins:` block |
| Consumers | `test/install-compare.test.js` and every `compareEntry` caller (`bin/akili.js:975`, `:1043`, `:1781`, `:1799`): the ignore option is optional, default unchanged; `test/diagram-design.test.js:494-498` (asserts `list` names `diagram-design`); `test/install-stale-skills.test.js:218-223`; `test/install-cursor.test.js:768-781`; `test/install-grokbot.test.js:764-771`; `test/fixtures/doctor-codex-baseline.txt`; `package.json` `verify:cli` (P-29) |
| Review | `full` |
| Done criteria | Tests green; three falsifiers observed red and quoted; `node bin/akili.js list` output quoted in `execution.md` showing the `Plugins:` block and `32 skills \| 1 plugin` |
| Skills | `tdd` |

### T4: Pure rules module (`flow.mjs`)

| Field | Value |
|---|---|
| Status | `[x]` — PASS attempt 3 (`execution.md` → T4) |
| Size | L (~260 LOC code, ~380 LOC tests and fixtures) |
| Depends on | T2 (the plugin folder exists and is excluded from skill counts) |
| Requirements | FR-5 (all six scenarios incl. AND IT MUST safe-path rule; propose arguments incl. BUT sentence / one-word slug keep nothing), FR-6 (constitution 13-file table incl. legacy; phase table; current/before/after; blocked; archived; `(no task status)`; scenarios: specify in progress, prose is not a status incl. MUST NOT, blocked, out-of-order incl. BUT, real status formats incl. AND CRLF, no status at all incl. BUT, legacy baseline), FR-7 (the whole state → button table, incl. the `propose` row only for a kept spec folder with no spec file, W-1), FR-11 (the `.git` walk and `HEAD` parse: branch, detached, `(no git)`, worktree `gitdir:` absolute and relative, subfolder root), FR-12 (number shortening; missing parts; `ctx —`), FR-16 (strings table; middle truncation), NFR-2 (each numeric ceiling, 0 processes) |
| Design | §5.1 safe-path + store value + propose forms; §5.3; §6.2 (absolute paths, DD-17 branch); §8 layout rules that are pure (truncation, part dropping); DD-2, DD-6, DD-15, DD-17; P-12–P-17, P-30, P-32, P-33 |
| Scope | `.claude/skills/akili-panel/hooks/flow.mjs`: pure ES module, no `$`, no Node import; exports the scan over an injected io, the rules, the formatters and the strings table. `test/akili-panel-flow.test.js` (CommonJS, `await import(pathToFileURL(…).href)` of `flow.mjs` so Windows drive-letter paths load (W-14), a `node:fs` io over fixtures, paths joined with `path.join`). `test/fixtures/akili-panel/<scenario>/` trees: one per FR-5/FR-6 scenario, plus nested taxonomy, family container, every carve-out, archive match, legacy baseline, empty project; `tasks.md` excerpts in each of the four token places copied from real archived specs (P-17), a CRLF copy, a no-token file, a `## Document Control` `Status` cell; `.git` folder, worktree `.git` file (absolute and relative `gitdir:`), detached `HEAD`, a root two levels below `.git`. The io wrapper asserts every path it receives is absolute |
| Tests | `node --test test/akili-panel-flow.test.js` on Node 18 and 22 (CI matrix) |
| Falsifier | Each scenario test names its mutation: count `[~]` anywhere in `tasks.md` → "prose is not a status" red; mark later phases by file presence instead of order → "out-of-order" red; drop the legacy alternates → "legacy baseline" red; accept `..` segments → "unsafe argument" red; record `changes/<token>` for a one-word `/akili-propose` → "propose arguments" red; require the token to be the whole cell → "real status formats" red (trailing-text and backtick rows); split lines on `\n` only and match `$` → the CRLF case red; pass a relative path to io → the absolute-path assertion red; list `archive/` children on every refresh → NFR-2 count test red |
| Red run | `predicted — greenfield artifact (observed in T4)`: at specify `ls .claude/skills/akili-panel/hooks/flow.mjs` → `No such file or directory`. T4 records each test's red against a stub module that exports the functions returning nothing, quoted verbatim in `execution.md` |
| Disqualifier | A fixture on which the named mutation does not change the reading (the scenario then proves nothing: e.g. a "prose" fixture with no `[~]` in prose); a test that imports the live `docs/specs/` tree; a pass on Node 22 only |
| Consumers | none outside the task (new module, new test); `register.jsx` consumes it in T5 |
| Review | `full` |
| Done criteria | Every FR-5/FR-6/FR-7 scenario and clause in the Requirements cell has one named test; all reds observed and quoted; green on local Node 22 and on Node 18 (`npx -y node@18 --test …` or the CI run) |
| Skills | `tdd` |

### T5: Hooks module: pane, `/akili-panel`, observers, Next

| Field | Value |
|---|---|
| Status | `[x]` — PASS attempt 2 (`execution.md` → T5; one spec tension for JC) |
| Size | L (~250 LOC code, ~80 LOC contract test, ~20 LOC types) |
| Depends on | T4; T1's P-25 verdict applied to DD-9 |
| Requirements | FR-7 (press scenario incl. AND nothing added; a press records the kept spec (B1); run refused incl. BUT pane kept; double press incl. AND no fixed bound (A1)), FR-8 (open; `Akili pane not shown: <reason>` when not placed; one command only incl. AND IT MUST NOT register others; never unasked), FR-9 (typed, Skill-tool, plugin failure incl. BUT not blocked/delayed/changed), FR-10 (no writes), FR-11 (io over `$.fs` with absolute paths; no process), FR-12 (sources: `turn.complete` incl. subagents, `session.measure`, reset on `/clear` and resume), FR-16 (render of every state), NFR-1, NFR-3, NFR-4, NFR-5, NFR-8 |
| Design | §3; §5.1, §5.2; §6.1 (incl. *Every hook passes the event on first*), §6.2; §8; DD-3, DD-4, DD-5, DD-7, DD-8, DD-9, DD-17; P-18–P-20, P-23, P-32, P-34, P-37, P-38 |
| Scope | `.claude/skills/akili-panel/hooks/register.jsx` (replaces T2's empty `register`; includes the pass-through `turn.start` hook that clears `pending` (A1) and the press handler's own kept-spec record (B1), design §5.2 / §6.1 as amended after T1), `types/index.d.ts` (PluginState for the five atoms), plugin `README.md` (full: install line, `/akili-panel`, what each row means, version pin). `test/akili-panel-contract.test.js` (CI, static read of the plugin files): the only `$.command.register` name is `akili-panel`; no `$.fs.write`, `$.fs.remove`/rename, `$.prompt.`, `$.session.append`, and no `$.process` at all (DD-17); every hook other than the `/akili-panel` one calls `next(e)` with the unchanged event and returns its result, no `next({` appears anywhere, and every `command.run`/`tool.call` hook has a `.catch` (W-4); `pending` is written only through `update` (W-5); disk reads happen only in the refresh, which checks `$.ui.panes()` (W-10); `ui.render` body has no `$.fs`, `$.process` or `$.state.set`; `$.command.run` appears only in the press handler. **Design route:** `load impeccable-bridge → design-routing.md; playbook layout, clarify; ENV-2; mode Operate; polish light; motion none` |
| Tests | `node --test test/akili-panel-contract.test.js`; `claude plugin validate .claude/skills/akili-panel` (local, `claude` on PATH) |
| Falsifier | Add a second `$.command.register({ name: 'akili-execute' … })` → contract test red; add a `$.fs.write` call → red; add a `$.process.run` call → red; make `turn.complete` return its own object instead of `next`'s result → red; write `pending` with `$.state.set` → red; remove the `.catch` from the `tool.call` hook → red, and `claude plugin validate` lists it as `gating hook without .catch` (observed at specify with the probe: `./register.js gating hook without .catch: tool.call{tool=Skill}`) |
| Red run | `predicted — greenfield artifact (observed in T5)`: the contract test runs red against T2's empty module for the "registers `akili-panel`" assertion; quoted verbatim in `execution.md`. The `validate` red for a missing `.catch` was observed at specify (above) |
| Disqualifier | The contract test is a presence check: it cannot prove the observer is fail-open at run time or that the pane draws. Those are T6 (engine kit) and T9 (live). A green contract test is never reported as behaviour |
| Consumers | none outside the plugin; `docs/plugins/akili-panel.md` (T8) describes its strings |
| Review | `full` |
| Done criteria | Contract test green with each falsifier observed red; `claude plugin validate` → `✔ Validation passed` with no `gating hook without .catch` line and no error (icon warning allowed); completion report names the playbook(s) run, `polish light` and its result, and `finish review: not run (AKILI execute)`; the Leader logs it in `execution.md` and names that entry in the Reviewer brief |
| Skills | `impeccable-bridge`, `cognitive-doc-design` (README) |

### T6: Engine-kit tests (`claude plugin test`)

| Field | Value |
|---|---|
| Status | `[x]` — PASS attempt 2 (`execution.md` → T6) |
| Size | M (~200 LOC) |
| Depends on | T5 |
| Requirements | FR-7 (press runs `/akili-…` with the shown args; double press queues one; `pending` clears when the run settles, stays set across a long turn (mocked clock advanced past 60 s, a second press queues nothing), and clears on a main-loop `turn.start` naming the command when the promise never settles (A1); a press records the kept spec (B1)), FR-8 (`/akili-panel` opens pane `akili` titled `Akili`; the not-placed reply), NFR-8 (no `fs.*` call while `$.ui.panes()` lists no `akili`), FR-9 (the observer returns the result it got from `next` unchanged; a throwing observer still lets the command through), FR-16 (empty states drawn), NFR-5 (terminal and desktop) |
| Design | §6.1 rows; DD-4, DD-8; `reference.md:81` (the kit) |
| Scope | `.claude/skills/akili-panel/tests/panel.test.tsx`: engine stand-ins for `command.register`, `ui.open`, `fs.*`, `process.run`, `command.run`; mounts the pane with `$.ui.mount` on `['terminal', 'desktop']`; presses Next; raises `command.run` for `akili-execute` and checks the result object identity and `args`; raises `tool.call` for `Skill` |
| Tests | `claude plugin test .claude/skills/akili-panel` (local only; CI has no `claude`, requirements D-4) |
| Falsifier | Make the observer return `{ text: 'x' }` instead of `next`'s result → the pass-through test goes red; make it rewrite `args` → red; drop the `pending` guard → the double-press test goes red; refresh without checking `$.ui.panes()` → the NFR-8 test sees an `fs.list` call and goes red; put back a 60 s timeout on `pending` → the long-turn double-press test goes red; record the kept spec only in the observer → the press-records-kept-spec test goes red |
| Red run | `predicted — greenfield artifact (observed in T6)`; each falsifier's red quoted verbatim in `execution.md` |
| Disqualifier | A test whose engine stand-in for `command.run` answers before the plugin's hook runs (then nothing of the plugin is exercised); a mount on one surface only; a pass reported from a machine without `claude` (that is a skip, and is reported as one) |
| Consumers | none |
| Review | `checklist` — a reviewer re-runs `claude plugin test` and reads the falsifier reds |
| Done criteria | `claude plugin test` exits 0; every falsifier observed red and quoted; the run's Claude Code version quoted |
| Skills | `tdd` |

### T7: Governance carve-out

| Field | Value |
|---|---|
| Status | `[x]` — PASS attempt 2 (`execution.md` → T7) |
| Size | S (~25 LOC prose) |
| Depends on | T3 |
| Requirements | FR-13 (carve-out statement: no `SKILL.md`, no `metadata.binding`, author and license in `plugin.json`, documented outside the skill inventory; skill counts exclude plugins; scenario: count stays 32) |
| Design | DD-12; P-10, P-11 |
| Scope | `docs/skills/governance.md`: one short section *Plugin entries are not skills*, placed after the rule at `:9`, naming the predicate in words (manifest present, `SKILL.md` absent), what a plugin declares instead, where it is documented (`docs/plugins/`), and that it is installed for Claude Code only. No other file |
| Tests | `node --test test/docs-overview.test.js test/docs-overview-contract.test.js`; `npm test` |
| Falsifier | Write "every folder under `.claude/skills/` is a skill" into the new section → the reviewer's walk against FR-13 fails; add an `akili-panel` row to `docs/skills/README.md` → `docs-overview` (c) still passes, so this falsifier is **read, not run**: the Reviewer checks the inventory files are untouched (`git diff --stat -- docs/skills/README.md docs/overview.md` empty) |
| Red run | n/a — prose task; its automated gate is the docs-overview suite, whose red for an un-excluded plugin is T2's |
| Disqualifier | The section restates the acceptance checklist instead of pointing to it; a second copy of the predicate wording elsewhere in the file |
| Consumers | `test/docs-overview-contract.test.js:369` (reads governance checklist item 5); `docs/skills/README.md`, `docs/overview.md` (must stay untouched) |
| Review | `full` — rules text other agents apply |
| Done criteria | Section present; `git diff --stat` shows `docs/skills/governance.md` only; the Reviewer walks FR-13 term by term |
| Skills | `cognitive-doc-design` |

### T8: Marketplace file and user docs

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M (~180 LOC) |
| Depends on | T5, T7 |
| Requirements | FR-14 (marketplace file; source `./.claude/skills/akili-panel`; not packed; scenario: `claude plugin validate .`), FR-2 (CHANGELOG upgrade note), FR-1 (README trust note for a project-folder plugin), FR-16 / D7 (docs in English), FR-13 (docs place the plugin outside the skill inventory) |
| Design | §4 docs rows; DD-12, DD-13, DD-14 (version step), DD-18 (upgrade note), DD-19 (one route); P-8, P-10, P-27 |
| Scope | Root `.claude-plugin/marketplace.json`; `docs/plugins/akili-panel.md` (what it shows, each mark, the Next table, install via `akili install --tool claude` and via `/plugin install akili-panel --marketplace JuankCadavid/akili-specs`, Claude Code ≥ 2.1.318, Claude only); `README.md` (one short Claude Code paragraph linking the page); `docs/cli.md` (`list` `Plugins:` block, doctor plugin row, Install Targets: Claude only; the four "32 packaged skills" lines stay); `AGENTS.md` *Repository Purpose* bullet on `.claude/skills/` names the plugin entry; `CHANGELOG.md` `[Unreleased]` → `### Added`, plus the upgrade note "run `akili install --tool all` (and `--tool grokbot` where used) once after updating" (DD-18); `docs/release-checklist.md`: one step to bump the plugin's `version` when its files changed (W-7); README and the plugin page: one delivery route (DD-19) and the trust note (W-13) |
| Tests | `claude plugin validate .` at the repo root (local); `npm run pack:dry-run \| grep -c "\.claude-plugin/marketplace.json"` → 0; `node --test test/docs-overview.test.js test/docs-overview-contract.test.js`; `npm test` |
| Falsifier | Set the marketplace `source` to `./akili-panel` → `claude plugin validate .` reports the plugin source not found (prediction; observed in T8); add `.claude-plugin` to `package.json` `files` → the pack grep returns 1 |
| Red run | `predicted — greenfield artifact (observed in T8)`: at specify `ls .claude-plugin` → `No such file or directory` |
| Disqualifier | A docs sentence describing behaviour T5 did not ship (KZ-002): every claim in `docs/plugins/akili-panel.md` is checked against `flow.mjs`'s strings table and the T6 tests, not written from this design |
| Consumers | `test/docs-overview.test.js` (d) "N packaged skills" sweep over docs; `test/docs-overview-contract.test.js` |
| Review | `full` — `AGENTS.md` is a rules document |
| Done criteria | Validate passes at the root; pack grep 0; docs-overview green; each docs claim traced to a shipped string or test in the completion report |
| Skills | `cognitive-doc-design` |

### T9: Live check in a real Claude Code session (HITL)

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S (no code) |
| Depends on | T3, T6, T8 |
| Requirements | FR-1 (real install), FR-4 (real doctor), FR-7 (press runs the command), FR-8, FR-9 (a hand-typed `/akili-*` runs unchanged), FR-11 (worktree branch), FR-12 (figures move after a turn), FR-16 (narrow pane), NFR-5 (one more surface when available), D-6 (layout: human check), P-27 (Cursor and a `--local` Claude install) |
| Design | §8; §13; requirements §8 D-4, D-6 |
| Scope | Temp `HOME`-free check on the real machine, with JC: `node bin/akili.js install --tool claude --local` in a scratch project with a small `docs/specs/` tree; open interactive Claude Code; `/akili-panel`; check spec, marks, branch, token line; widen and narrow the terminal (≥ 2 widths, one under 60 columns); press Next; type `/akili-resume` by hand and compare its output with a run without the plugin (`claude --plugin-dir` absent / folder moved away); open the scratch project in Cursor if installed and note whether `akili-panel` shows anywhere, for the `--local` copy and the global `~/.claude/skills` copy (P-27, W-13); confirm a hand-typed `/akili-*` raises the observer interactively (P-18, W-11) and that Next runs and clears its dimmed state (P-34) |
| Tests | Manual, at a HITL pause; screenshots or copied pane text in `execution.md` |
| Falsifier | Delete `tasks.md` from the scratch spec → the pane must move the current phase back to specify on the next refresh (≤ 30 s); if it does not, refresh is not wired |
| Red run | n/a — manual acceptance |
| Disqualifier | A check run in this repo's own working tree (its live specs are not a controlled fixture); a check run with `--plugin-dir` (that is not the install path) |
| Consumers | none |
| Review | `checklist` — JC is the gate |
| Done criteria | JC confirms at the pause; `execution.md` holds the observations, including the P-27 note; `.claude/commands/` byte-identical (`git diff --stat 7a697ba -- .claude/commands` empty) |
| Skills | — |

## Coverage (scenario and clause level)

| Requirement clause | Owner |
|---|---|
| FR-1 Claude install: plugin.json present; byte-identical; AND IT MUST `--local`, `--skills-only`; AND README trust note | T2 (tests), T8 (note), T9 (live) |
| FR-1 Every other target: absent in every skills dir; BUT nothing else changes | T2 |
| FR-1 `--tool all`: only under Claude | T2 |
| FR-1 Existing files: skip; `--force` overwrites | T2 |
| FR-2 Update: installed for Claude; no other target gains it | T2 |
| FR-2 Upgrade from an old installer: removed with `REMOVED` line; record cleaned; BUT foreign folder kept | T2 |
| FR-2 CHANGELOG upgrade note | T8 |
| FR-3 List: under `Plugins:`; not under `Skills:`; summary `32 skills \| 1 plugin` | T3 |
| FR-4 Healthy: no `MISSING akili-panel`; Claude shows present | T3, T9 |
| FR-4 Missing: reported; `--fix` restores | T3 |
| FR-4 Differing: `DIFFERS`; BUT never overwritten | T3 |
| FR-4 Leaked copy: `LEAKED`; `--fix` removes | T3 |
| FR-4 Other tools: no `akili-panel`; BUT not counted missing | T3 |
| FR-5 Last observed wins; `(1 more active)` | T4 (rule), T5 (recording from `command.run` / `tool.call`), T6 (observer records `args`) |
| FR-5 Branch match; most recent | T4 |
| FR-5 Unsafe argument: not kept; AND IT MUST safe segments only | T4 |
| FR-5 Propose arguments: `/`-path and hyphenated slug kept; BUT sentence and one-word slug keep nothing | T4 (rule), T6 (observer) |
| FR-5 Not a spec-taking command: kept spec unchanged | T4 (rule), T6 |
| FR-6 Constitution 13 files, legacy alternates, `✓`/`○`/`▶ (k/13)` | T4 |
| FR-6 Phase table, current/before/after, blocked, archived | T4 |
| FR-6 Scenarios: specify in progress; prose (MUST NOT blocked); blocked; out-of-order (BUT); real status formats (AND CRLF); no status at all (BUT not `✓`); legacy baseline | T4 |
| FR-7 State → button table (11 rows) | T4 |
| FR-7 Press: runs as typed; AND nothing added | T6, T9 |
| FR-7 Run refused: message with reason; BUT pane kept | T5 (wiring), T6 |
| FR-7 Press records the kept spec (B1) | T5 (wiring), T6 |
| FR-7 Double press: one run; no fixed bound (A1) | T5 (`turn.start` hook), T6 |
| FR-8 Open; not-placed reply; one command only; AND IT MUST NOT register others; never unasked | T5 (contract), T6, T9 |
| FR-9 Typed: same name/args/result; refresh after | T6, T9 |
| FR-9 Skill-tool: unchanged; kept spec updated | T6 |
| FR-9 Plugin failure: still runs; BUT not blocked/delayed/changed | T5 (`.catch` contract), T6 |
| FR-10 No writes; `git status` clean | T5 (contract), T9 |
| FR-11 Worktree branch; no git; subfolder and detached; no process | T4 (walk and parse), T5 (io, no `$.process`), T9 (worktree) |
| FR-12 Line format; parts; shortening; fresh session; after `/clear` or resume, AND `$` stays Claude Code's | T4 (format), T5 (sources, reset), T9 |
| FR-13 Carve-out text | T7 |
| FR-13 Count stays 32; no inventory row | T2 (tests), T7 |
| FR-14 Marketplace file; not packed; validate | T8 |
| FR-15 Not committed (`.gitignore`), not packed, not copied | T2 (gitignore, pack, install), T3 (doctor compare) |
| FR-16 Strings table; empty states; read error line; middle truncation, no wrap | T4 (strings, truncation), T5 (render), T6 (empty states), T9 (narrow pane) |
| NFR-1 Render reads only | T5 (contract) |
| NFR-2 Bounded refresh: each ceiling, 0 processes | T4 (counts), T5 (no `$.process`) |
| NFR-3 30 s timer while the pane is up | T5, T9 (falsifier) |
| NFR-8 No disk reads while the pane is not up | T5 (contract), T6 |
| NFR-4 Fail open | T5, T6 |
| NFR-5 Every surface | T6 (terminal, desktop), T9 |
| NFR-6 Version pin in README | T5, T8 |
| NFR-7 CI matrix | T2, T3, T4 (node tests run in CI) |
