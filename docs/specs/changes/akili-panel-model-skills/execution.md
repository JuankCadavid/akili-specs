# Execution Log: changes/akili-panel-model-skills

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-panel-model-skills` |
| Approval | Spec approved by JC (Juan Carlos Cadavid), 2026-11-10 11:10 AM America/Bogota: «Apruebo, haz commit y lanza /akili-execute en una sesión limpia». Documents committed locally as `a90ed92` |
| Approval Mode | `gated` |
| Owner mandate | No push, merge or release. T1 is a live probe in an interactive Orca terminal, read as text only with `orca terminal read --screen`: no screenshots, no `screencapture`. A separate Claude Code terminal may be opened in this same workspace through the Orca CLI. Every pane-button press must really happen. If a press needs JC, or any methodology gate appears (Pivot Protocol included), stop and wait. The Leader does not answer a gate itself |
| Branch / worktree | `JuankCadavid/akili-panel-model-skills` at `/Users/jcadavid/orca/workspaces/sdd-jc-methodology/panel-modelo-skills` |
| Baseline | `8e8c5ba` (tasks.md Document Control). Spec commit `a90ed92` |
| Session | Leader on `claude-opus-5-5` (T1 tier). Started 2026-11-10 America/Bogota. Claude Code 2.1.322 |
| Workers | No Step 8E wrappers in this repo (`.claude/agents/` absent), so workers run as fallback sub-prompts: Implementer `sonnet` (T2), Reviewer `opus` (author ≠ auditor). Each reads its `.agents/` persona first |
| Personas | `.agents/` was absent in this worktree (gitignored, per machine). Scaffolded 2026-11-10 by copying `.claude/templates/{leader,implementer,reviewer,tester}.md`. `node bin/akili.js doctor --agents`: every section `CURRENT`, "No persona drift blocking CI" |
| Budget (design §12) | 5 tasks · ~750 LOC · 8 review rounds. **Raised 2026-11-10 by JC at the T3 gate to ~850 LOC** («Sí, acepta el exceso, sube el presupuesto a ~850 y sigue con T4»): overrun ≈784 vs ~750 accepted, cause tests ~3× code |

## Task Execution History

### T1: Live probe of the host (settles P-3, P-4, P-5) — `PASS`

| Field | Value |
|---|---|
| Final status | `PASS` (Reviewer `opus`, Review `checklist`) |
| Date | 2026-11-10 America/Bogota |
| Attempts | 1 |
| Requirements covered (premises) | FR-4 *Run* (P-3), FR-1 *Model changes* (P-4), FR-7 *Tallest open state* (P-5) |
| Skills | `systematic-debugging`, `orca-cli` (Leader added `orca-cli` to drive the terminal: a tool skill, it adds no scope). Effort `high` |
| Models | Implementer `sonnet`, Reviewer `opus` |
| spawns | Implementer 44 calls, 154,045 tokens, ended complete; Reviewer 7 calls, 96,393 tokens, ended complete |
| Running totals | 1 of 5 tasks; 0 LOC of repo code (budget ~750); 1 of 8 review rounds |

#### Attempt 1

- **Files changed (repo):** none. Probe plugin at `<S>/probe-panel` (`plugin.json`, `hooks/hooks.json`, `hooks/register.jsx`, `types/index.d.ts`, README), where `<S>` = `/private/tmp/claude-501/-Users-jcadavid-orca-workspaces-sdd-jc-methodology-panel-modelo-skills/081d0838-20a5-4dd0-92ab-e4b4dd23db26/scratchpad`. Evidence files in `<S>`: `t1-debug.run1.log`, `t1-debug-run2.log`, `t1-debug-run3-inline.log`, `t1-events.run2-dock.log`, `t1-events.run3-inline.log`.
- **Setup.**
  - Orca terminal `term_a1e68c92-b20d-4edb-851f-19bfa6581e33` ("T1 probe", 157×59). It is still open at a shell prompt; Claude was closed with `/exit`.
  - Command: `claude --model sonnet --plugin-dir <S>/probe-panel --debug-file <S>/t1-debug*.log`, interactive, Claude Code 2.1.322. Run 3 (inline) added `CLAUDE_CODE_NO_FLICKER=0`.
  - Driven by `orca terminal send`, read only with `orca terminal read --screen`; no screenshots.
  - The probe pane opens via `/probe-open` with `focus`, `closeOnEscape` and `rows: 4`. Hotkey Buttons: `a` runs `caveman`, `x` runs `no-such-skill-xyz`, `g` grows the tree to 12 rows, `b` grows it to 80, `s` resets it.
  - Typed in the session: only `/probe-open`, `/model haiku`, `/exit` and hotkeys. `/caveman` was never typed.
- **(a) P-3, press runs a skill: verified.**
  - Falsifier: `t1-debug.run1.log:662` `probe: PRESS run command="no-such-skill-xyz"`, then `:663` `probe: RUN REJECTED command=no-such-skill-xyz message=probe-panel: $.command.run: no command named /no-such-skill-xyz in this session`.
  - Press: `:672` `probe: PRESS run command="caveman"`, then `:673` `$.command.run (probe-panel): 8 chars queued`, then `:675` `hooks module probe-panel@inline command.run skipped: re-entry (the plugin's own code raised it; origin probe-panel)`, then `:677` `hooks module akili-panel@skills-dir: command.run nested in probe-panel`, then `:725` `probe: RUN RESOLVED command=caveman result={}`.
  - Screen read after the press, nothing typed in between (Implementer's read): `❯ /caveman`, then `⏺ probe-panel: probe: RUN RESOLVED command=caveman result={}`, then `⏺ Caveman style on. Probe pane open. …`.
- **(b) P-4, `/model` observer: verified (fires on entry).**
  - Typed `/model haiku`: `t1-debug.run1.log:803` `probe: OBS-ANY command.run command="model" args="haiku" origin={"kind":"composer"}`, then `:804` `probe: OBS-MODEL command.run model args="haiku" origin={"kind":"composer"}`.
  - Falsifier: no `OBS-MODEL` line before `:804`. The only other `OBS-ANY` line is `:610` (`probe-open`). The caveman run raised none for the calling plugin (re-entry skip, `:675`).
  - The hook runs when the command is entered, before the host's "Switch model?" dialog. Reviewer: `:815` `command.run settled in 11508.8ms`, so `next()` waits for the dialog.
  - The Implementer answered `2. No, go back` in its own probe session, and got `⎿ Kept model as Sonnet 5.5`.
- **(c) P-5, height: verified as worded below.**
  - Dock, at rest: `t1-debug.run1.log:620` `RENDER treeRows=4 {"n":4,"placement":"dock","focused":true,"off":0,"body":52,…}`. The dock body is 52 rows from the first render, so the dock does not honour `rows`.
  - Dock, after `g`: `:649` `PRESS grow`, then `:653` `RENDER treeRows=12 … "dock" … "body":52`. The screen showed `L02 n=12` … `L12`.
  - Inline, at rest: `t1-events.run3-inline.log:5-6` `RENDER treeRows=4 {"n":4,"placement":"inline",…"body":17,…}`. The screen showed a bordered frame with `L02 base` … `L04 base`.
  - Inline, after `g`: `:7-8` `PRESS grow`, then `RENDER treeRows=12 … "inline" … "body":17`. The screen showed `│ L12 n=12`, then `╰───`, so the frame grew to 12 rows, whole. This screen read was not saved to a file; it is the Implementer's quote.
  - Scroll with the 80-row tree and Down ×5:
    - dock: `t1-events.run2-dock.log:8-12` `"off":1` … `"off":5`; `t1-debug-run2.log:583-600` `ui.scroll Pane probe (person) by 1 … moved`.
    - inline: `t1-events.run3-inline.log:11-15` `"off":1` … `"off":5`, `"body":17`.
  - Falsifier: the screen read before `g` showed only `L02 base` … `L04 base`.
- **Evidence re-run (non-author, Leader-inline): `VERIFIED`.** Grepped `t1-debug.run1.log` at 610, 620, 649, 653, 662, 663, 672, 725, 803, 804, and `t1-events.run2-dock.log` / `t1-events.run3-inline.log` lines 1-15. Each line matched the report. Also found `:673` `8 chars queued` (the host queued the run) and the re-entry and nested lines. `git status --porcelain` showed only `execution.md`. The terminal shows a shell prompt after `/exit`.
- **Reviewer verdict: `PASS`.** All three quotes are at the cited lines and every falsifier was run. The sessions were interactive (`cc_entrypoint=cli`, `repl_main_thread`, `ui.press … in Pane from terminal`). No `command.run` with origin composer fell between `:672` and `:725`, so the run came from the press. No resize appears in any debug log.
- **ADVISORY (Reviewer, recorded only):**
  1. RISK, setup deviation. The task asks for "a scratch project". All three sessions ran with the repo worktree as cwd, which the owner mandate allows («you may open one in this same workspace»). `akili-panel@skills-dir` loaded alongside and saw the nested run (`:677`). It changed no probe result, and nothing was written under the repo.
  2. RELIABILITY, P-5 inline. `body:17` is the space the layout allows, not the frame height. Only the unsaved screen read shows the frame grew past `rows: 4`. Wording: inline grows with the tree up to that allowance, then scrolls by keys.
  3. READABILITY, P-5 dock. The dock ignores `rows` (52 body rows from the first render). A 12-row tree never needed scrolling there; dock key-scroll is shown only at 80 rows.
  4. RELIABILITY, falsifier (c). `treeRows` changes only on a press, so that log check proves nothing on its own. The real check is the screen read before the press (quoted above).
  5. RELIABILITY, P-4. The switch was cancelled. Not yet observed: whether a refresh run after `next(e)` sees a confirmed switch. Also, `args` is the typed alias. The turn and the 30 s tick still cover FR-1's bound. T3 and T5 carry this.
  6. RELIABILITY, evidence lineage. `register.jsx` was edited mid-run (hot reload, `run1:839-856`), which overwrote `t1-events.run1.log`. The P-3 and P-4 presses ran an earlier revision, and their only record is the debug log.
  7. COVERAGE. The real pane asks for `rows: 19`; the probe asked for `rows: 4`. T5 confirms the real value.

#### Decisions made

- The probe ran in this worktree, not a scratch project. JC's mandate allows a terminal in this same workspace, and that avoided a trust prompt that only JC can answer. Recorded as Reviewer advisory 1.
- Execute-time spec edit, meaning unchanged: `design.md` §11 rows P-3, P-4 and P-5, plus the count line, now read verified with these citations. P-5's text keeps its claim and gains the dock note (advisories 2 and 3).

#### Issues encountered

- In its own probe session, the Implementer answered a host confirmation ("Switch model?", choosing `2. No, go back`). That is a probe-UI choice that kept the model unchanged, not a methodology gate or a permission prompt.

#### Forward pointers (to T3 and T5, copy them into their briefs)

- **T3:**
  - `$.command.run` resolves `{}`, so a skill press has no output to read. The calling plugin's own `command.run` observers do not fire for its own run (re-entry skip). `press()` already calls `later(afterRun)` itself, so nothing depends on that.
  - The `/model` observer fires before the switch is confirmed (P-4). DD-6's `next(e)`-first order matters, because `next` returns after the dialog. Whether a refresh after `next` sees the new model is unobserved; the turn and tick cover it.
- **T5:**
  - Confirm with a confirmed `/model` switch.
  - Confirm the inline pane at `rows: 19`.
  - Confirm the dock keeps `rows` irrelevant (scroll window).

### T2: Rows and catalog in `flow.mjs` — Reviewer `PASS`; `[~]` awaiting JC on a spec tension

| Field | Value |
|---|---|
| Final status | Reviewer `PASS` on attempt 1. **Not closed**: the tension below needs JC's ruling before `[x]` |
| Date | 2026-11-10 America/Bogota |
| Attempts | 1 |
| Requirements covered | FR-1 … FR-8 and NFR-1, at the row level (list in tasks.md T2) |
| Skills | `tdd`, `impeccable-bridge` (as listed). Effort `medium` |
| Models | Implementer `sonnet`, Reviewer `opus` |
| spawns | Implementer 30 calls, 167,351 tokens, ended partial (assumptions only, no owed item); Reviewer 9 calls, 104,362 tokens, ended complete |
| Running totals | 2 of 5 tasks; 425 added / 5 deleted in tracked files + 98 new = ~523 LOC (budget ~750); 2 of 8 review rounds |

#### Attempt 1

- **Files changed:**
  - `.claude/skills/akili-panel/hooks/flow.mjs` (+93/−1);
  - `test/akili-panel-flow.test.js` (+336; the only edits to old tests add `'model'` to the id lists at `:969`, `:1016`, `:1128`, `:1414`);
  - `test/akili-panel-catalog.test.js` (new, 98 lines).
- **Implementer verification:**
  - T2's three files: `# tests 287 / # pass 287 / # fail 0`.
  - `npm test`: `# tests 1871 / # pass 1870 / # fail 1`. The failure is `not ok 268 - FR-4 Inline pane: the rows asked for equal the rows the full layout draws, so Next is the last asked-for row`, the contract pin at `:164-176`.
  - `claude plugin test`: `74 pass / 7 fail`, all P-8 pins in `tests/panel.test.tsx`, e.g. `Expected: 14 Received: 15`.
  - `claude plugin validate`: `✔ Validation passed`.
  - `git diff --check`: clean. `git diff --stat 8e8c5ba -- .claude/commands`: empty.
- **Greenfield reds (flow.mjs at HEAD):**
  - the four id-list tests: `- 'model'`;
  - FR-3 groups: `+ [] - ['brainstorming','caveman',...]`;
  - FR-7 closed layout: `- 'model'`, `- 'rule-skills'`, `- 'skills'`;
  - FR-8 omitted inputs: `+ [] - ['model']`;
  - the other new tests and all 6 catalog tests failed with `Cannot read properties of undefined`. That is not an assertion red; the falsifiers below give one.
- **Falsifiers (each run, then reverted):**
  1. Remove `tdd` → `skills missing from SKILL_CATALOG: tdd`.
  2. Rebind `tdd` to `core` → `+ ['tdd: catalog core, SKILL.md conditional']`.
  3. Two groups open → `core closed while conditional is open`. The builder was mutated to also open `core`, because the `skillsUi` shape holds one `group`; the Reviewer accepts the substitution.
  4. Swap `brainstorming`/`caveman` → the alphabetical tests go red.
  5. `protect` back on the marked rows → the 14-column mark test goes red on `  conditional…`.
  6. `modelRow` governed at its natural width → `step at 24`.
- **Not Done / Assumptions (verbatim from the Implementer, no owed item):**
  - "`listedSkills(names)` returns `{ core, conditional, stack }` of `{ name, binding }` entries. T3 can flatten them into `host.skills` names."
  - "The catalog is stored sorted by name, and `listedSkills` keeps that order rather than re-sorting, so the swap falsifier can go red. A flow test asserts the catalog is sorted."
  - "A `model` row is always drawn, even before the first refresh. Without a model it reads `model —`, which is why four of the old id lists changed."
  - "I did not use the Impeccable launcher or engine. This is a terminal text pane, so there was no detector run."
- **Design route:** playbook `layout`, adapt; ENV-2; mode Operate; motion none. `polish light`: the 80-column render was read against §8.2 state 3 and matched; no tokens were added. `finish review: not run (AKILI execute)`.
- **Evidence re-run (non-author, Leader-inline): `VERIFIED`.** The same commands gave the same results: 287/287, 1870/1871 with `not ok 268` the same test, kit `74 pass / 7 fail` with the same 7 names, validate passed, `--check` clean, commands diff empty.
- **Reviewer verdict: `PASS`.**
  - The rows match §8.1–§8.5, §5 and §9: order, ids, model fit rule, fitted marks, tones and press fields.
  - The catalog test's expected side comes from disk.
  - Old tests only gain ids. `:1009` is a list of rows measured at column 17, not a pane-id list, so leaving it unchanged is correct.
  - Sort-by-stored-order is conformant: two tests pin it.
  - The 8 red pins belong to T3 by the spec: T3's Scope and Consumers, and P-8.
- **ADVISORY (Reviewer, recorded only):**
  1. Spec tension, see below.
  2. Falsifier 3 should read "mutate the builder to open a second group".
  3. Readability: re-sorting inside `listedSkills` would make alphabetical order true by construction.
  4. Reliability: the parser matches `metadata:` exactly, so it fails loudly on variants. That is acceptable.
  5. Risk: low. Pure row builders, no host call, no file read.

#### Spec tension (lightest Pivot evidence; at JC's gate as a one-line amendment)

- tasks.md *Common verification (every code task)* asks for `npm test` and `claude plugin test` to be green.
- T2 draws `model —` when no host is given (design §9). That breaks the `PANE_ROWS`/rows pins (contract `:164-176`; kit `:870`, `:888`, `:1003-1004`, `:1033`), and the spec assigns those pins to T3 (T3 Scope, Consumers, P-8).
- So T2 cannot satisfy the common verification on its own.
- **Proposed amendment (A):** "Common verification: `npm test` and `claude plugin test` are green once the last task touching a P-8 pin (T3) closes. T2 may leave red only the P-8 pins T3 owns." **Alternative (B):** widen T2 to update those pins now, which moves T3 scope into T2.
- Awaits JC.

#### T2 closeout — `PASS`, 2026-11-10

- **JC's ruling:** «Opción A: cierra T2 con commit y que T3 deje todo en verde» («Option A: close T2 with a commit and have T3 leave everything green»).
- **Spec edit:** tasks.md *Common verification* gains the amendment. `npm test` and `claude plugin test` are green once T3 closes, and T2 may leave red only the P-8 pins T3 owns. JC's words are quoted in tasks.md.
- **Forward pointer to T3 (copy into its brief):** T3's Done criteria now also carry the full `npm test` and `claude plugin test` going green. At T2's close they stood at 1870/1871 and 74/7, red only on the P-8 pins.
- **Other forward pointers to T3 (copy into its brief):**
  - `listedSkills` returns `{ core, conditional, stack }` of `{ name, binding }`. `host.skills` holds the flattened names.
  - From T1: `$.command.run` resolves `{}`, and a plugin's own `command.run` hooks skip its own run. The `/model` observer fires before the switch dialog, and `next()` settles after it.
- Status `[x]`.

### T3: Wiring in `register.jsx` and the state contract — `PASS`

| Field | Value |
|---|---|
| Final status | `PASS` (Reviewer `opus`, Review `full`, lens checklist with the risk lens required) |
| Date | 2026-11-10 America/Bogota |
| Attempts | 1 |
| Requirements covered | FR-1 (*Model changes*, *Model unknown*), FR-2, FR-3 (presses), FR-4 (*Run*, *Double press*, *Refused*), FR-5 *Read only*, FR-7 (`PANE_ROWS` 19), FR-8, NFR-2 … NFR-5 |
| Skills | `impeccable-bridge` (as listed). Effort `medium` |
| Models | Implementer `sonnet`, Reviewer `opus` |
| spawns | Implementer 27 calls, 147,714 tokens, ended partial (assumptions only, no owed item); Reviewer 12 calls, 107,393 tokens, ended complete |
| Running totals | 3 of 5 tasks; T2 ~523 + T3 261 added / 22 deleted ≈ 784 LOC against a ~750 budget (+4.5%: **budget tripwire, escalated to JC at the T3 gate**; cause: tests ~3× code, as KZ-bugfix--init-ctrlc-abort-2 predicts — T2 tests 434 vs code 93, T3 tests ~241 vs code 42; T4 docs ~60 LOC still to come); 3 of 8 review rounds |

#### Attempt 1

- **Files changed:**

  | File | Change |
  |---|---|
  | `.claude/skills/akili-panel/hooks/register.jsx` | +38 |
  | `.claude/skills/akili-panel/tests/panel.test.tsx` | +218: rig mocks, pins, 11 new cases |
  | `.claude/skills/akili-panel/types/index.d.ts` | +4 |
  | `test/akili-panel-contract.test.js` | 23 lines touched |

  `flow.mjs` is unchanged.
- **Implementer verification:**

  | Check | Result |
  |---|---|
  | contract | `# pass 16 / # fail 0` |
  | `npm test` | `# tests 1871 / # pass 1871 / # fail 0` |
  | `claude plugin test .claude/skills/akili-panel` (2.1.322) | `92 pass / 0 fail` |
  | `~/.local/share/claude/versions/2.1.318 plugin test .claude/skills/akili-panel` | `92 pass / 0 fail` |
  | `claude plugin validate` | `✔ Validation passed` |
  | `git diff --check` | clean |
  | `.claude/commands` diff | empty |

  Both suites are green, which meets JC's amendment of 2026-11-10 (option A).
- **P-11:** 2.1.318 runs the kit with `session.model` and `command.list` mocked: 92/92. The binary's strings contain both op names. That proves existence only; the live answer is checked at T5. Ledger row updated.
- **Falsifiers (each run, then reverted):**
  1. No `skillsUi` reset in `openPane` → `(fail) FR-2 Closed at every pane open: an open section is closed again by a reopen and by a new session`.
  2. The skill Button gets its own `$.command.run` → `(fail) FR-4 Double press across Next and a skill queues one run; AND the skill row is dim while it runs` (2 runs; expected `[{ command: "kaizen", args: "" }]`). `FR-4 Refused` was red too.
  3. `$.command.list()` in `ui.render` → the contract fails with `a host call besides $.ui.resolve`.
  4. No `.catch(passOn)` on the `/model` observer → `not ok 4 - every command.run and tool.call hook has a .catch that answers next(e) (W-4)`, `command.run: no .catch`.
  5. `session.model` rejects with the fallback removed → "Model unknown" goes red (`Expected: containing "skills"`, received `["next"]`). With the fallback in place it shows `model —`, logs once, and the pane draws.
- **Greenfield reds:** the baseline greps (`session.model`, `command.list`, `key: 'host'`, `key: 'skillsUi'`, `command: 'model'`) were all `0`. The first kit run failed 15/92: the old layout pins plus the new cases.
- **Not Done / Assumptions (Implementer, verbatim gist, no owed item):**
  - Two extra existing assertions changed. The chain test "FR-2/FR-4 drawn as built" gained `/^model\s/`. The title "…Next the last of them" became "…Next inside them".
  - Kit nodes have no `.key`, so Next is matched by its "Next: " text.
  - The default rig lists no commands. The 19-row test lists `kaizen` and `tdd`.
  - The FR-5 kit test asserts no skill folder or `.claude` read and no write. A literal "no path outside the project" fails on the existing `exists /.git` ancestor probe.
  - `refreshHost` runs after the `view` write.
- **Design route:** playbook `layout`, adapt; ENV-2; mode Operate; motion none. `polish light`: reuses `part()` and the existing tones; no new visual vocabulary. `finish review: not run (AKILI execute)`.
- **Evidence re-run (non-author, Leader-inline): `VERIFIED`.** Identical numbers on both hosts. `claude --version` was still `2.1.322` before and after: the global install is untouched.
  - Global copies exist at `~/.claude/skills/akili-panel` and the Orca profile's `skills/akili-panel`. Both are the released v1.0.0, with no model or Skills rows.
  - The 11 new kit cases passing shows the kit loaded the repo path, which meets the Disqualifier. The Reviewer confirmed it from the printed case names.
- **Reviewer verdict: `PASS`.**
  - §8.4 handlers, `refreshHost`, the `skillsUi` reset sites, the `/model` observer order, atoms-only render, and `PANE_ROWS` 19 all match.
  - The two extra assertion edits are acceptable: P-8's consumer list missed the chain test, and the title sits on a listed pin.
  - FR-5 is covered, not weakened: FR-5 says "to build the list", `refreshHost` has no `$.fs` call, and the contract still bans `$.process`.
  - FR-1 re-read after `/clear` is covered by a kit case (`session.end` `reason: 'clear'`).
  - The Reviewer's own mutation, removing the `/model` observer, turns "FR-1 Model changes … after /model, with no turn in between" red (91/1).
- **ADVISORY (Reviewer, recorded only; none becomes a task):**
  1. RISK: contract `:159` lets `update` take `$` anywhere in render. Pinning to the two `return () => update($, skillsUi, …)` forms would be stricter.
  2. RISK: P-11 is existence plus a mocked kit, not live. The ledger wording now says so.
  3. RELIABILITY: on a host where `$.session.model` or `$.command.list` is not a function, the synchronous throw skips the `.catch`. `Promise.all` throws, `runRefresh` logs `refresh failed`, and both fields stay `null`. That is looser than NFR-4's per-field degrade. Suggested fix: `Promise.resolve().then(() => …)`. P-11 shows both exist on 2.1.317+, so it is not reachable on the floor host.
  4. RELIABILITY: `$.ui.log` inside the two `.catch` handlers is not awaited or guarded.
  5. READABILITY: the FR-5 kit title says "starts no process", but that guarantee is the static contract test's.
  6. RESILIENCE: FR-1 "and resume" has no kit case; it is covered by the timer after `startSession`. Forward to T5.

#### Decisions made

- Execute-time spec edit, meaning unchanged: `design.md` §11 P-11 row and the count line. P-11 is recorded as existence-checked (binary strings plus mocked kit), live at T5, per Reviewer advisory 2.

#### Forward pointers to T5 (copy into its brief)

- Live answer of `$.session.model` / `$.command.list` (P-11).
- FR-1 "and resume" re-read.
- A confirmed `/model` switch reaching the row.
- Inline at `rows: 19`.

### T4: Docs, version, governance, CHANGELOG — `PASS`

| Field | Value |
|---|---|
| Final status | `PASS` (Reviewer `opus`, Review `full`, KZ-002 overstatement lens required) |
| Date | 2026-11-10 America/Bogota |
| Go | JC at the T3 gate: «Sí, acepta el exceso, sube el presupuesto a ~850 y sigue con T4» (option A; budget raised to ~850 LOC, see Document Control) |
| Attempts | 2 (attempt 1 Reviewer `FAIL`, attempt 2 Reviewer `PASS`) |
| Requirements covered | FR-9 (incl. *No stale text*), FR-5 (DD-8 governance line), FR-8 (no command change) |
| Skills | `cognitive-doc-design`. Effort `medium` → `high` on attempt 2 |
| Models | Implementer `sonnet`, Reviewer `opus` |
| spawns | Implementer 1: 8 calls, 83,632 tokens, complete. Reviewer 1: 7 calls, 100,248 tokens, complete. Implementer 2: 2 calls, 63,470 tokens, complete. Reviewer 2: 5 calls, 75,406 tokens, complete |
| Running totals | 4 of 5 tasks; ≈784 + T4 36 added / 11 deleted ≈ 831 LOC against the ~850 budget JC raised at the T3 gate; 5 of 8 review rounds |

#### Attempt 1 — Reviewer `FAIL`

- **Files changed:**

  | File | Change |
  |---|---|
  | `.claude/skills/akili-panel/README.md` | intro, *Use* step 2 refresh list + step 4 Skills, rows table `model` + `Skills (<n>) ▸`, *Limits* guard + list lines; version `1.1.0` |
  | `docs/plugins/akili-panel.md` | same rows/Use/Limits changes; new short *The Skills section* table (List, Run, Guard, Refresh) with a link to the governance checklist |
  | `.claude/skills/akili-panel/.claude-plugin/plugin.json` | `"version": "1.1.0"` |
  | `docs/skills/governance.md` | checklist item 6 *Panel catalog*: adding, removing or rebinding a skill updates `SKILL_CATALOG`; `test/akili-panel-catalog.test.js` fails until it matches |
  | `CHANGELOG.md` | `Unreleased` placeholder replaced by `### Added` / `### Changed` |

- **Red run (baselines before editing):** `grep -n "one button"` → 2 hits (`README.md:3`, `docs/plugins/akili-panel.md:3`); `grep -c '"version": "1.1.0"' plugin.json` → `0`; `grep -c SKILL_CATALOG docs/skills/governance.md` → `0`. Matches the reading recorded at specify.
- **Implementer verification:** `npm test` `# tests 1871 / # pass 1871 / # fail 0`; `verify:cli` `Summary: 14 commands | 32 skills | 1 plugin | 8 resources (akili-specs v2.43.0)`; `pack:dry-run` `total files: 427`; `git diff --check` clean. Falsifiers 0 / 1 / 1.
- **Implementer quote-check (abridged; each re-verified by the Reviewer):** `model —` fallback `flow.mjs:701`; middle cut `flow.mjs:703`; Skills below Next behind `rule-skills` `flow.mjs:725,780`; nothing drawn at 0 `flow.mjs:723`; groups `flow.mjs:633,727-730`; closed at pane open `register.jsx:190` (and session start `:160`); one group open `register.jsx:267`; press runs by name `register.jsx:268`; shared guard `register.jsx:168-172`; refusal toast `register.jsx:179` + `flow.mjs:60`; catalog ∩ `command.list` `register.jsx:56-60` + `flow.mjs:672`; `/model` refresh `register.jsx:215-218`; `PANE_ROWS` 19 `register.jsx:13`.
- **Evidence re-run (non-author, Leader-inline): `VERIFIED`** — same numbers; `claude plugin validate` `✔ Validation passed`; `.claude/commands` diff vs `8e8c5ba` empty.
- **Reviewer verdict: `FAIL`.** Blocking: `CHANGELOG.md` `### Changed` said "The pane refreshes after `/model` and `/clear`" as a 1.1.0 change. The `/clear` refresh already shipped in 1.0.0: at `a90ed92` `register.jsx:226` `if (e.reason === 'clear') later($, () => afterClear($))`. Violates FR-9 (CHANGELOG describes as shipped), FR-8, KZ-002. README and docs listing `/clear` in the refresh list is fine (those lists were incomplete).
- **Reviewer advisories:** (a) the skill-press guard is new behaviour, belongs under `### Added`; "opens at 19 rows" more exact as "asks for 19 rows when it opens"; (b) `plugin.json:4` description still reads "…and offers a Next button." (true, incomplete); (c) "with no spec argument" → "with no arguments" (`register.jsx:268` `args: ''`); (d) "the pane is unchanged" after a refusal: `press()` still schedules a refresh, FR-4 says "otherwise unchanged" — recorded only.

#### Attempt 2 — Reviewer `PASS`

- **Feedback:** the FAIL verbatim, plus advisories (a) and (c), which correct the accuracy of T4's own in-scope text (KZ-002) and widen nothing. Advisory (b) was left out: `plugin.json`'s description is outside T4's scope (version only).
- **Changes:** `CHANGELOG.md` — guard sentence moved into the `### Added` Skills bullet; `### Changed` now reads "The pane asks for 19 rows when it opens, up from 16. A size the user set stays theirs. The pane also refreshes after `/model`." and "README and `docs/plugins/akili-panel.md` no longer describe `Next` as the only action. They now list the existing refresh after `/clear`, and the plugin version is `1.1.0`." "with no spec argument" → "with no arguments" at `README.md:23`, `docs/plugins/akili-panel.md:78`, `CHANGELOG.md:11`.
- **Implementer verification:** `npm test` 1871/1871, `# fail 0`; `verify:cli` green; `git diff --check` clean; falsifiers 0 / 1 / 1.
- **Evidence re-run (non-author, Leader-inline): `VERIFIED`** — `npm test` `# tests 1871 / # pass 1871 / # fail 0`; `verify:cli` green; `pack:dry-run` `total files: 427`; `claude plugin validate` passed; `git diff --check` clean; `.claude/commands` diff empty; `git show a90ed92:…/register.jsx` → `:13 const PANE_ROWS = 16`, `:226 if (e.reason === 'clear') later($, () => afterClear($))`.
- **Quote-check log (KZ-002, Reviewer round 2, at HEAD):** "asks for 19 rows when it opens, up from 16" — `register.jsx:13` `PANE_ROWS = 19`, used only at `:187` `$.ui.open({… rows: PANE_ROWS })`, 16 at `a90ed92`. "A size the user set stays theirs" — `rows` sent once at open; host contract quoted in `design.md:175` ("the person's own size wins"), polish `requirements.md:168`, this spec FR-7. "also refreshes after `/model`" — `register.jsx:215-219` `on('command.run', { command: 'model' }, …)` → `runRefresh` → `$.session.model()` / `$.command.list()` (`:56-62`). Refresh row triggers: finished turn `:239`, `/clear` `:249` + `:152-155`, `/akili-*` `afterRun` `:103-106`, 30 s `startTimer`. "with no arguments" — `register.jsx:268`. Governance anchor `#acceptance-checklist-for-new-skills` resolves to `governance.md:128`. Catalog test fails on missing, rebound and stale entries. No skill counts in docs (`<n>` placeholders only).
- **Reviewer verdict: `PASS`.** FAIL fixed; no regression; FR-9 *No stale text* holds ("one button"/"only action" appear only in CHANGELOG:17's past-tense note); FR-8/DD-8: no diff under `.claude/commands` or `bin`.
- **ADVISORY (recorded only; none becomes a task):** `plugin.json:4` description "…and offers a Next button." is true but incomplete for 1.1.0 — a follow-up outside this spec's approved scope.

#### Forward pointers to T5

- Unchanged from T3's list: live P-11, FR-1 "and resume" re-read, a confirmed `/model` switch, inline at `rows: 19`, the dock ignores `rows`.
