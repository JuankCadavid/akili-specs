# Validation Report — akili-panel-polish

**Verdict: PASS with 5 WARN, 0 FAIL. Archive-ready once JC accepts the WARNs (or has the doc corrections applied).** Every requirement scenario and clause is owned by a task and evidenced. Every build check is green at HEAD, including on Claude Code 2.1.318 and Node 18. No code defect was found. The WARNs are evidence and document-accuracy items: T5's per-step checks, the design gate (which cannot reach PASS on a terminal pane), and three spec-document figure or wording errors with exact corrections in §11.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-panel-polish` |
| Auditor | T3 Auditor, model `claude opus` (`claude-opus-5-5`), independent of the Sonnet Implementers, Opus Reviewers and Opus Tester |
| Date | 2026-11-09 |
| HEAD | `4cc3db3` (`4cc3db3fceb1787f0339585d6fee2f6a27bce858`), branch `JuankCadavid/akili-panel` (worktree) |
| Diff scope | `b7d1738..HEAD` (parent archive → HEAD), 46 files, +3563 / −190 |
| Baseline docs | `docs/prd.md`, `docs/ux-ui/design.md`, `docs/trd/trd.md`, `docs/specs/general-setup/`: **all absent**. Root `AGENTS.md` is the reference, as `requirements.md` §1 records |
| Read | `CLAUDE.md`, `AGENTS.md`, `.agents/reviewer.md`; `proposal.md`, `requirements.md`, `design.md`, `tasks.md`, `execution.md`, `test-report.md`, `judgment.md`; parent archive where cited; `hooks/flow.mjs`, `hooks/register.jsx`, `tests/panel.test.tsx`, plugin `README.md`, `docs/plugins/akili-panel.md`, `CHANGELOG.md` Unreleased, `test/akili-panel-*.test.js` |
| Code lookup | Changed files read from the working tree. Untouched code (`derivePhases`, `parseHead`, `branchLabel`) read at HEAD directly; the changed files make the graph stale |
| Writes | This file only. No commit, push, stash or other edit |

## 2. Summary

| Result | Count | Where |
|---|---|---|
| PASS | 72 | 4 tasks, 2 file checks, 8 build checks, 43 coverage rows (38 FR scenario/clause rows + 5 NFRs), 12 design decisions, premise ledger, budget, proposal alignment |
| WARN | 5 | W-1 T5 per-step checks; W-2 design gate; W-3 `test-report.md` figures and NFR-5 evidence; W-4 `design.md` §12 round breakdown; W-5 `design.md` §8 two false statements |
| FAIL | 0 | — |
| BLOCKED | 0 | — |
| ADVISORY (4R, not counted) | 12 | §7: 6 still open, 6 closed since recorded |

## 3. Task Completion

| Task | Status | Evidence in `execution.md` | Result |
|---|---|---|---|
| T1 Paint check (HITL) | `[x]` | JC, 2026-11-06 7:39 PM America/Bogota: «1: se lee bien en ambos temas, sigue con T2» (`execution.md:23`), quoted identically in `design.md` P-3, P-4. Falsifier tab `/probe-gray` beside `/probe-clear` (`:33`). No screenshot: JC forbade desktop capture (`:42`, `:55`) | PASS |
| T2 Row builders | `[x]`, attempt 3 | Red before code (80 tests, `F.paneRows is not a function`), falsifier table (`:84-98`, `:167-176`), Reviewer PASS quoted (`:178`), evidence re-run VERIFIED | PASS |
| T3 Draw the rows | `[x]`, attempt 3 | Red before change (`:199`), falsifier tables (`:201-209`, `:257-268`), Reviewer PASS quoted (`:270`), kit on 2.1.318 by the Reviewer (`:196`) | PASS |
| T4 Docs | `[x]`, attempt 2 | Grep red then clean (`:293`, `:330`), Reviewer PASS round 8 of 8 (`:332`) | PASS |
| T5 Live check (HITL) | `[x]` | JC, 2026-11-09 10:10 AM America/Bogota: «T5: se ve bien en ambos temas, cierra T5 con mis palabras. FR-5: A, acepta el $ cuando Claude Code ya lo reporta. Sin screencapture.» (`:367`). Verbatim-shaped, dated, timed. Widths 45 and 98 columns, `dark-ansi` and `light` (`:360-361`) | **WARN (W-1)**: per-step scope items not done, see §11 |

The two Done-criteria quotes exist and are verbatim-shaped. The test phase's manual checks also close on JC's quoted words: «si esta funcionan do bien», 2026-11-09 11:34 AM (`test-report.md:3`, full answer at `:109`).

## 4. File Existence

| Check | Expected | Found at HEAD | Result |
|---|---|---|---|
| File plan (`design.md` §4, tasks' Scope) | `flow.mjs`, `register.jsx`, `tests/panel.test.tsx`, plugin `README.md`, `test/akili-panel-flow.test.js`, `test/akili-panel-contract.test.js`, `docs/plugins/akili-panel.md`, `CHANGELOG.md`, `probe/` | All modified or added. Also touched, inside T2/T3 scope: `test/akili-panel-flow-coverage.test.js` (T3 consumer, logged `execution.md:281`), `test/akili-panel-cli-coverage.test.js` (Tester, FR-10), fixtures `test/fixtures/akili-panel/blocked-specify/`, `long-names/` (T2). `types/index.d.ts` unchanged, as §4 says | PASS |
| Removed formatters | `formatHeader`, `formatConstitution`, `formatPhaseLines`, `formatTokens` gone, no caller left | `git grep -n -E 'formatHeader\|formatConstitution\|formatPhaseLines\|formatTokens' -- . ':!docs/specs'` → exit 1, no hit. A worktree-wide `grep -r` (untracked `.run/` included) hits only spec documents. DD-P4's kept helpers (`fitLine`, `shortenMiddle`, `shortenCount`, `formatNext`, `errorLines`, `emptyStateText`) all still exist | PASS |
| Out of scope untouched | `.claude/commands/`, `bin/`, `scripts/`, `.claude/templates/`, `package.json`, `.claude-plugin/` | `git diff --stat b7d1738..HEAD -- <those>` empty; `git diff --stat c14e344..HEAD -- .claude/commands` empty | PASS (counted under FR-9) |

## 5. Build Integrity

All run at `4cc3db3`, Node v22.23.4, Claude Code 2.1.319, unless stated.

| Command | Exact result | Expected (`test-report.md`) | Result |
|---|---|---|---|
| `npm test` | `# tests 1830` `# pass 1830` `# fail 0` `# cancelled 0` `# skipped 0`, exit 0 | 1830 / 0 | PASS |
| `npm run verify:cli` | exit 0; `Summary: 14 commands \| 32 skills \| 1 plugin \| 8 resources (akili-specs v2.42.0)` | 0 | PASS |
| `npm run pack:dry-run` | exit 0; `total files: 427`. Plugin ships: `.claude-plugin/plugin.json`, `hooks/flow.mjs` (27.4 kB), `hooks/hooks.json`, `hooks/register.jsx` (9.7 kB), `README.md`, `tests/panel.test.tsx`, `types/index.d.ts`, plus `docs/plugins/akili-panel.md`. No `test/`, no `test/fixtures/`, no `.run/`, no `docs/specs/` (so no `probe/`) | Plugin files ship, nothing leaks | PASS (see A-10 on `tests/panel.test.tsx`) |
| `claude plugin validate .claude/skills/akili-panel` | `✔ Validation passed`, exit 0 | passed | PASS |
| `claude plugin test .claude/skills/akili-panel` | `81 pass` `0 fail` `Ran 81 tests across 1 file`, exit 0 | 81 / 0 | PASS |
| `git diff --check b7d1738..HEAD` | no output, exit 0 (working tree also clean) | clean | PASS |
| `git diff --stat b7d1738..HEAD -- .claude/commands` | empty | empty | PASS |
| **Extra, NFR-5:** `~/.local/share/claude/versions/2.1.318/…` `plugin validate` and `plugin test` | `2.1.318 (Claude Code)`; `✔ Validation passed`; `81 pass` `0 fail` | test-report said no 2.1.318 binary | PASS. Contradicts `test-report.md:96,116` (W-3) |
| **Extra, Node 18:** `node --test` on the five akili-panel files with v18.20.8 | `# tests 379` `# pass 379` `# fail 0` | 379 (suite A) | PASS |

## 6. Requirement Coverage

Owner = `tasks.md` Coverage table. Evidence = a test I opened and read (✔ = opened; the assertion matches the clause), or a quoted manual check. No gap is cleared by citing a different requirement.

| # | Requirement — scenario / clause | Owner | Evidence | Result |
|---|---|---|---|---|
| 1 | FR-1 Open: no background of its own; AND reply and placement unchanged | T3, T1, T5 | ✔ contract `FR-1: the one $.ui.open asks for backgroundColor transparent…`; ✔ kit `FR-1: the one open asks for a transparent body…` (`opens[0].backgroundColor === 'transparent'`); kit `FR-8 /akili-panel asked again…` reply; paint: T1, T5 quotes | PASS |
| 2 | FR-1 Surface keeps its look: still opens; BUT no error, toast or reply mentions the background | T3 | ✔ kit `FR-1 A surface keeps its own look…` (14 rows on all 4 surfaces, `toasts` empty, no `background\|transparent` in rows or reply) | PASS |
| 3 | FR-2 Tone table, all eight rows | T2 | ✔ flow `FR-2 a spec in execute…` ×3, `FR-2 blocked…`, `FR-2 no task status…`, `FR-2 constitution all/some/none…` (`deepEqual` on tone and bold). `TONES` in `flow.mjs:507-516` matches the table cell for cell | PASS |
| 4 | FR-2 Spec in execute: tones; BUT no fourth glyph | T2, T5 | ✔ `FR-2 BUT the marks are still ✓, ▶ and ○…` (glyphs `['✓','✓','▶','○','○','○']`); T5 quote | PASS |
| 5 | FR-2 Blocked: `warning`; AND IT MUST read the same with colour removed | T2, T5 | ✔ `FR-2 blocked AND IT MUST…` (text ends `▶ (blocked)` at 28 cols); ✔ coverage `NFR-2 / FR-7 guarantee table, swept…` | PASS (live blocked tone: see W-1) |
| 6 | FR-3 Mid-cycle `2/6`; AND shares done, done, current, three empty | T2, T5 | ✔ `FR-3 mid-cycle: the row ends 2/6`; ✔ `FR-3 mid-cycle AND the shares…` (full `deepEqual`, current share bold) | PASS |
| 7 | FR-3 Blocked share `warning` | T2 | ✔ `FR-3 blocked: the current share uses the warning tone (on execute and on specify)` | PASS |
| 8 | FR-3 No task status share `warning` | T2 | `FR-3 no task status: the current share…` (`deepEqual` `{ '━━', warning, bold }`) | PASS |
| 9 | FR-3 Archived `6/6`, every share done | T2 | `FR-3 archived…` | PASS |
| 10 | FR-3 No spec: no cycle row; AND empty text stays | T2 | ✔ `FR-3 no spec to show…` (both empty texts verbatim) | PASS |
| 11 | FR-4 Block order; errors before the second rule | T2, T3 | `FR-4 block order…`, `FR-4 the second rule sits after the error rows…`; ✔ kit `FR-2/FR-4 drawn as built…` (whole chain, error before second rule) | PASS |
| 12 | FR-4 Header rows, rule, one mark column, `02` moves, `…` rule stays | T2 | `FR-4 header row 1/2…`, `FR-4 rule…`, `FR-4 flow: every mark and both bars start in one column, 17…`, `FR-4 the 02 label…`, `FR-7 any width: the longest spec path and branch are shortened in the middle` | PASS |
| 13 | FR-4 Inline pane: asks for the rows; Next visible with no scrolling | T3, T5 | ✔ contract `FR-4 Inline pane…` (`rows.length === PANE_ROWS`, last row `next`); ✔ kit `FR-4 Inline pane…` ×4 surfaces; T5: «all 16 rows drawn, Next visible» (`execution.md:360`) | PASS |
| 14 | FR-4 Inline pane BUT a size the person set stays theirs | T3 (request), T5 (live) | ✔ kit `FR-4 Inline pane BUT a size…` (`opens.length === 1` after press, commands, turns, clear, 65 s); host half JC: «si esta funcionan do bien» (`test-report.md:106`). Was gap I-13 at specify; closed at test | PASS |
| 15 | FR-4 First refresh: `Akili` and token block; BUT no rule above an empty flow block | T2 | `FR-4 header before the first refresh…` ×2 | PASS |
| 16 | FR-4 No repository `(no git)`; AND detached `detached @<sha>` with no `⎇` | T2 | ✔ `FR-4 no repository…`; ✔ `FR-4 a detached HEAD…` (exact `'detached @0123456'`). Code: `⎇` only for `kind === 'branch'` (`flow.mjs:656`; v1 drew `⎇ detached @…`) | PASS |
| 17 | FR-5 Rows, missing values, `Tokens:` prefix gone; sources, sums and shortening kept | T2 | `FR-5 the ctx row…`, `FR-5 the session row…`, `FR-5 sums and shortening stay…`, `FR-5 the Tokens: prefix is removed` | PASS |
| 18 | FR-5 Fill rounded; ≥1 cell above 0; full at 100+ | T2 | `FR-5 fill: …` ×3, ✔ `FR-5 fill and minimum use <p> rounded: 20.6 fills 3 cells, 0.3 reads 0% with none` | PASS |
| 19 | FR-5 Thresholds 79/80/94/95; AND `79.6` reads `80%` in `warning` | T2 | ✔ `FR-5 thresholds: <p> of …` (79, 80, 94, 95, 96); ✔ `FR-5 thresholds: a raw fill of 79.6…` | PASS |
| 20 | FR-5 High fill `error`; BUT no toast, status line, sound or block | T2, T3 | `FR-5 high context fill…`; ✔ contract `FR-5: no new call: no $.ui.status, no $.audio, one $.ui.toast(` inside `press` | PASS |
| 21 | FR-5 Fresh session (amended 2026-11-09): `—` no bar; `0 in / 0 out`, plus ` · $<usd>` when the host reports a cost | T2, T5 | ✔ coverage `FR-5 Fresh session (amended 2026-11-09)…` (`$0.00`, `$1234.50`); ✔ flow `FR-5 fresh session…` ×2 (no cost → no `$`). Amendment is in `requirements.md:218` with JC's quote; code `sessionRow` (`flow.mjs:620-626`) needed no change | PASS |
| 22 | FR-6 Surface table: chip on terminal (`suggestion` fill, `inverseText`, bold, one space each end); primary elsewhere | T3 | ✔ kit `FR-6 the Next button…` ×4 surfaces (`' Next: … '`, `plain`, fill props; `variant: primary` elsewhere; Next is the root's last child) | PASS |
| 23 | FR-6 Label text kept, cut to fit | T2 | `FR-6 the Next row carries…`, `FR-6 the label is cut to the width less 2…` | PASS |
| 24 | FR-6 Press: same command once; AND a second press adds nothing | T3, T5 | ✔ kit `FR-6 the Next button…` (`runs` equals one run); kit `FR-7: a double press queues one run…`, `FR-7 double press…` | PASS (live click: see W-1) |
| 25 | FR-6 Run in progress: dim, no fill; BUT same words | T3, T5 | ✔ kit `FR-6 the Next button…` (`dimColor === true`, words equal, no `suggestion` in children); `FR-6 run in progress…` (node) | PASS (painted pending look: see W-1) |
| 26 | FR-6 No next step: no button | T3 | `FR-6 no next step: no button row and no blank row` | PASS |
| 27 | FR-6 / T5 scope: keyboard focus on Next visible | T5 | Probe P-10 (`focus-on-chip.ansi:10` holds `\x1b[1;7m\x1b[30m\x1b[104m Next: chip `, re-checked); JC «si esta funcionan do bien» (`test-report.md:107`) | PASS (manual) |
| 28 | FR-7 Ladder order; last step when none fits; `…` after it; guarantee table (31/24/17/14); 14-column rule; middle shortening kept | T2 | `FR-7 step 1…7` tests, ✔ `the guarantee at 24 columns…`, ✔ `…at 14 columns…`, ✔ `at exactly 14 columns a noted row keeps its mark and omits the …; at 15 it reads ▶…`, ✔ `step 3 takes the session row…`. 14-column rule in code: `fitParts` `protect` (`flow.mjs:538-560`) | PASS |
| 29 | FR-7 Under 60 columns; AND facts readable | T2, T5 | ✔ `FR-7 under 60 columns: at 30…`; T5 at 45 columns, «no row wrapped» | PASS |
| 30 | FR-7 At 24 columns: marks at 13, bars 6; AND words whole | T2 | ✔ `FR-7 at 24 columns: the marks sit at column 13…`; ✔ guarantee at 24 | PASS |
| 31 | FR-7 Below 24: blocked row cut with `…`; BUT mark, `2/6`, `<p>%` whole | T2 | ✔ `FR-7 below 24 columns: at 20…` | PASS |
| 32 | FR-7 Any width 1–120; AND IT MUST hold for the longest fixtures | T2 | ✔ `FR-7 any width…` (1–120, `long-names` fixture); ✔ coverage `FR-7 Any width AND IT MUST…` (every state × token state × pending) | PASS |
| 33 | FR-7 No width given: step 1, no cut; AND rule of 40 | T2 | ✔ `FR-7 no width given (undefined/0/-3/NaN)…` (`'─'.repeat(40)`) | PASS |
| 34 | FR-8 Error tone; wording and limit of 3 kept; empty text stays dim | T2, T3 | `FR-8 a read fails…`, `FR-8 … at most three error rows`, `FR-8 empty-state text stays dim…`; ✔ kit `FR-8: a read failure is a row in the error tone`; ✔ kit `FR-4 drawn as built: the empty-state text is dim` | PASS |
| 35 | FR-8 A read fails: AND the rest still draws | T3 | ✔ kit `FR-16 a read fails: one Could not read line, the rest of the pane still drawn` | PASS |
| 36 | FR-9 Same facts; BUT no new command, hook event, atom, file read or process | T3 | Parent refresh/phase/Next tests unchanged and green; ✔ contract `FR-9: no new atom…`, `registers akili-panel, and only…`; `register.jsx` diff adds no `on(` and no `$.fs` call | PASS |
| 37 | FR-9 AND `.claude/commands/` byte-identical | T3 | `git diff --stat c14e344..HEAD -- .claude/commands` empty (§5) | PASS (evidence) |
| 38 | FR-10 No stale format | T4 | ✔ cli-coverage `FR-10 No stale format…`; my sweep of `README.md`, `docs/plugins/`, `CHANGELOG.md`, root `README.md` for `Tokens:`, `Akili · `, `[ Next`, `bold`, `dimColor`, `gray`: no hit about the pane | PASS |
| 39 | NFR-1 Theme keys and `transparent` only | T3 | ✔ contract `NFR-1: every tone, color and backgroundColor literal…` (allowlist + hex + `rgb()` + 21-name list) | PASS |
| 40 | NFR-2 Colour never alone | T2 | ✔ coverage `NFR-2 / FR-7 guarantee table, swept…` (6 states × 6 fills × 14–120) | PASS |
| 41 | NFR-3 Light and dark | T1, T5 | JC's T1 and T5 quotes, `dark-ansi` and `light` | PASS (manual) |
| 42 | NFR-4 Drawing stays cheap | T3 | ✔ contract `NFR-4: ui.render reaches the host only through $.ui.resolve and read(…)`; kit `NFR-1: drawing reads neither the disk nor the store` | PASS |
| 43 | NFR-5 Minimum 2.1.318 | T3 | Validate + kit 81/0 on the 2.1.318 binary at HEAD (§5); probe `clear-2.1.318.ansi` holds `\x1b[100m` once (re-counted) | PASS. `test-report.md` says PARTIAL (W-3) |

**Test-report rows mapped:** NFR-5 `PARTIAL` → **PASS** (the binary exists; run above). D-5 / NFR-3 `PASS (manual)` → **PASS**, because the spec names JC's eyes as D-5's only gate and both quotes exist. FR-6 focus `PASS (manual)` → **PASS**. FR-4 host-side size `PASS` → **PASS**.

## 7. Linting & Code Quality

No linter is configured for the plugin. `git diff --check` is clean. No hex value or colour name appears in `hooks/`, and no `$.theme` or `$.config` call either (`grep` exit 1).

### 4R advisory sweep (ADVISORY: none of these drives the verdict)

| ID | Lens | Finding | Where | State |
|---|---|---|---|---|
| A-1 | Reliability | ADVISORY: `sessionRow` prints `$NaN` for a non-finite cost: `typeof u.usd === 'number'` admits `NaN`, and so does `usageFrom` | `flow.mjs:624`, `register.jsx:102` | **Open**, from T2 |
| A-2 | Readability | ADVISORY: pane labels `01 Constitution`, `01 Constit…`, `02 Cycle`, `ctx`, `session` and `—` are hard-coded beside `STRINGS`. `STRINGS.ctxMissing` (`'ctx —'`) is now unused by the code, and a test keeps it alive (`test/akili-panel-flow.test.js:673`). Not a parent D7/DD-15 breach: the strings are English and in `flow.mjs`, as v1's were | `flow.mjs:54`, `:563-572`, `:596`, `:611-612` | **Open**, from T2 |
| A-3 | Readability | ADVISORY: the mockup draws `ctx`, `session`, `<used>/<window>` and `2/6` in `inactive` and `02 Cycle` bold; the code leaves them default. JC accepted the look at T5 | `flow.mjs:590-626` | **Open**, from T2; accepted by T5 |
| A-4 | Reliability | ADVISORY: the ladder ignores the empty-text row. The code's reading beats a literal reading of §8 | `flow.mjs:629-639` | **Open**, by design |
| A-5 | Risk | ADVISORY: `.run/` is untracked and not ignored (`git status`: `?? .run/`). It does not ship (`package.json` `files`) | repo root | **Open**, from T2 |
| A-6 | Reliability | ADVISORY: at 1–2 columns the Next button disappears on non-terminal surfaces too, where v1 drew `…`. A dock is at least 24 wide | `register.jsx:241` | **Open**, from T3 |
| A-7 | Risk | ADVISORY: the colour-name check is a 21-name denylist, and the allowlist covers literals in `tone`/`*Color` positions only. A presence check, as T3's Disqualifier states | `test/akili-panel-contract.test.js:121-127` | **Open**, from T3 |
| A-8 | Readability | ADVISORY (new): `rows.map(draw)` and `row.parts.map(part)` give their children no `key`. v1 did the same and the kit draws correctly, but a reconciling host could re-mount rows on refresh | `register.jsx:238-248` | **New** |
| A-9 | Risk | ADVISORY (new): `design.md` §8 and DD-P12 tie `PANE_ROWS = 16` to the full layout, and up to 3 error rows can still push Next below the asked-for height (judgment I-9, DD-P12 accepts it) | `register.jsx:13` | **Open**, accepted |
| A-10 | Risk | ADVISORY (new, inherited): the npm package ships the plugin's `tests/panel.test.tsx` (48.9 kB). The parent design lists it in the plugin layout, so this is not the polish's regression | pack output | **Open**, parent decision |
| — | Risk | `PANE_ROWS` not tied to `paneRows`' length (T3) | — | **Closed**: contract and kit `FR-4 Inline pane…` assert equality |
| — | Reliability / Risk | Blank row's drawn position unpinned; pending dim pinned as a prop only (T3); W-14 comment misplaced (T3); CHANGELOG carries half the transparency sentence (T4) | — | **Closed** or accurate: kit pins one blank `Text` and Next as the root's last child, T5 read the blank row live; the W-14 comment is gone; the CHANGELOG sentence is accurate |

### `judgment.md` info rows (W-1, I-1 … I-13)

| ID | State at HEAD | Basis |
|---|---|---|
| W-1 | **Closed** | T5 drew the real pane inline in Orca, in both themes (`execution.md:360`) |
| I-1 | Open (info) | A `ui.open` hook that drops `backgroundColor` is still unhandled; FR-1's fallback still covers only a surface that ignores the request |
| I-2 | **Open: doc false** | `design.md:115` "the tail is kept": `headerRows` gives the branch `max(1, cols − tail)` and `fitParts` then cuts the tail. Correction C-2 (W-5) |
| I-3 | Open (info) | Step 3 removes `session` before `<used>/<window>` by design (proposal order) |
| I-4 | **Closed** | T3 added the theme-key allowlist |
| I-5 | **Closed** | The kit presses the real `press` and asserts `runs` |
| I-6 | Partly closed | `e.surface` is exercised on four surfaces; the chip runs on 2.1.318 (§5). **Still false:** `design.md:108` "`blocked` can sit on any current phase". `derivePhases` sets `blocked` only when `tasks.md` has a blocked token, which keeps execute from being done, so it sits on specify or execute only (`flow.mjs:363-389`). The test title already says so. Correction C-1 (W-5) |
| I-7 | **Closed** | `design.md` §8 *Mark column* states the origin of 17 and 13 |
| I-8 | **Closed** | Pending drops the whole fill (`register.jsx:245`) |
| I-9 | Open, accepted | DD-P12: "Read-failure rows may still scroll" (A-9) |
| I-10 | Open (info) | `proposal.md` was not edited after approval; `requirements.md` is the current statement |
| I-11 | **Closed** | `ALL_SURFACES` used in kit tests |
| I-12 | Open (info) | `inactive` and `subtle` share SGR 37 on ANSI themes. JC accepted the look at T1 and T5 |
| I-13 | Mostly closed | FR-4 size clause closed at test (row 14). The line numbers in the Consumers fields have gone stale (KZ-005), as predicted |

## 8. Design Conformance

| Decision | Code at HEAD | Result |
|---|---|---|
| DD-P1 transparent on the one `$.ui.open` | `register.jsx:171` | PASS |
| DD-P2 theme keys only | `TONES`, `BAR`, contract NFR-1 | PASS |
| DD-P3 rows of parts in `flow.mjs`, tone table as data; `register.jsx` maps only | `flow.mjs:507-690`; `register.jsx:237-248` | PASS |
| DD-P4 old formatters replaced; six helpers kept | §4 | PASS |
| DD-P5 two-row header | `headerRows`, `flow.mjs:650-664` | PASS |
| DD-P6 marks after labels, one column shared with the bars | `pad(label, s.col)` in every governed row | PASS |
| DD-P7 `━` / `─` | `BAR` | PASS |
| DD-P8 thresholds on the rounded percent | `ctxRow` rounds before `ctxTone` and the fill | PASS |
| DD-P9 chip by `e.surface`, native primary elsewhere | `register.jsx:242-246` | PASS |
| DD-P10 one ladder; column moves to 13 at step 6, bars leave at 7 | `stepShape`, `ladderStep`, `LADDER_LAST = 7` | PASS |
| DD-P11 rules `subtle`, no `dimColor` | `rule()` parts `{ tone: 'subtle' }` | PASS |
| DD-P12 `rows` = 16 | `PANE_ROWS = 16`; contract and kit tie it to the drawn count | PASS |
| §8 Next: label cut to `cols − 2` | All surfaces (T3 Implementer note 1; Reviewer: §8 has no surface qualifier) | PASS |
| §11 Premise ledger, 11 rows | Re-checked P-1 (`\x1b[100m` counts 73 / 2 / 1), P-10 capture string, P-5 consumers (no old-formatter reader remains) | PASS |
| §12 Budget | Tasks 5/5. LOC: per-task sum 845 + 216 + 21 = **1,082** of ~1,100 (net `b7d1738..fbcc995` is 1,072 added, because T3 rewrote T2 lines). Code added 197 of ~260. Rounds 8 of 8. The test phase then added 202 lines, which no execute tripwire covers | PASS (figure W-4) |

### Design Review

| Field | Value |
|---|---|
| Skill source | `vendored (4.8.0, verified)`. Copy: `<repo>/.claude/skills/impeccable` (location 1, next to the bridge). Home: `/Users/jcadavid`. Other copies: `~/.claude/skills/impeccable` 4.8.0. 57 listed files match `UPSTREAM.md` sha256; `SKILL.md` stripped hash `a2ba4387…6e4e` matches; no unlisted file beyond `LICENSE`, `NOTICE`, `UPSTREAM.md` |
| Engine | `ready (location 4, engine 0.1.18)`: `~/.impeccable/bin/0.1.18/impeccable engine-probe` → `impeccable-engine 0.1.18`, exit 0. `IMPECCABLE_BIN` unset beforehand. Nothing downloaded |
| Page mode / environment | Operate; ENV-2 (`design.md` §8) |
| Scan matrix | **Unevaluated (no web surface).** The pane is drawn by Claude Code's plugin API inside a terminal. There is no dev server, URL or HTML/CSS for a URL scan, and no DOM source for the source scan's pattern rules. The launcher was not called |
| First-visit pass | **Unevaluated (no web surface, no browser automation applies).** Manual substitute for the fold check: T5 read the inline pane as text, «all 16 rows drawn, Next visible» (`execution.md:360`) |
| Waivers | None. There is no `docs/ux-ui/design.md` to hold a waiver row |
| Critique / audit substitute | JC's own checks on his terminal: T1 «1: se lee bien en ambos temas, sigue con T2»; T5 «T5: se ve bien en ambos temas, cierra T5 con mis palabras»; test «si esta funcionan do bien» (focus visible, size kept). Contrast and glyph weight were judged by his eyes, as D-5 requires |
| Visual Reference | `mockup/pane-polish.png` is a sketch, "not a locked direction" (`proposal.md`). Delivered rows match its structure. Spacing before `2/6` and `11%` and the label tones differ (A-3); JC accepted the live look |
| **Design gate** | **WARN (W-2).** With the engine `ready`, the bridge's gate is active, and its rule is that `Unevaluated` rows never count as a pass. On this surface they cannot be evaluated at all. The spec's own D-5 gate (JC's eyes) passed |

### Cross-document figure check

| Figure | Asserted in | Reality / other document | Result |
|---|---|---|---|
| LOC 1,082 of ~1,100 | `execution.md:341,384` | Per-commit sum 1,082 ✔; net diff 1,072 (method differs, not wrong) | PASS |
| Review rounds 8 | `design.md:225`, `tasks.md:14`, `execution.md:341` | Actual T2 3 + T3 3 + T4 2 = 8 ✔. But `design.md:225`'s "Planned: T2 2, T3 2, T4 2, T5 1" sums to 7 and gives T5 a round, while the same cell says T5 is JC's check; `execution.md:315` says T5 takes no Reviewer verdict | **WARN (W-4)** |
| Task sizes T2 L (~195 / ~625), T3 M (~65 / ~175), T4 S (~30) | `tasks.md` | T2 192 code + 653 tests and fixtures; T3 ~15 code + ~201 tests; T4 21 | PASS (estimates) |
| Full layout 16 rows; v1 12 | `design.md` DD-P12 | `paneRows` → 16 (contract); v1 = 1 + 1 + 6 + 2 + 2 = 12 ✔ | PASS |
| Ladder 7 steps | `requirements.md` FR-7, `design.md` §8 | `LADDER_LAST = 7`, `stepShape` matches each step ✔ | PASS |
| Mark column 17 / 13 | FR-4, §8 | `stepShape` `col: step >= 6 ? 13 : 17` ✔ | PASS |
| `npm test` 1824 → 1830; kit 75 → 81 | `test-report.md:27`, `execution.md:385` | 1830 and 81 re-run ✔ (+6 runs each) | PASS |
| "8 tests" added | `test-report.md:26` (and commit `3a36514` subject) | The report's own §4 lists 6 node tests and §5 lists 3 kit tests: 9 tests, 12 runs | **WARN (W-3)** |
| `FR-3 …` "(6 tests)" | `test-report.md:72` | 7 `FR-3` tests in `test/akili-panel-flow.test.js:908-951` | **WARN (W-3)** |
| NFR-5 "No 2.1.318 binary here" | `test-report.md:96,116` | Binary present; validate passed and kit 81/0 on it | **WARN (W-3)** |
| `\x1b[100m` counts 73 / 2 / 1 | `design.md` P-1, `tasks.md` T1 | Re-counted 73 / 2 / 1 ✔ | PASS |
| Premise ledger "11 rows · 11 verified" | `design.md:195` | 11 rows ✔ | PASS |
| `FR-2 …` "(11 tests)", `FR-5 …` "(14 tests)" | `test-report.md:69,78` | 11 ✔; 14 test definitions ✔ | PASS |

### Proposal alignment

| Item | Result |
|---|---|
| Intent (state readable at a glance) | Met: tones, cycle bar, ctx bar, rules, chip |
| Scope | Met. Extra test files are inside the proposal's "Tests" scope |
| Non-goals | Met: no phase-rule, spec-choice, refresh, observer or press change (`flow.mjs` diff starts at line 488, past `derivePhases`); no installer change; no new mark; no raw colour; no `$.theme.set`; no motion; English only |
| Success criteria 1–6, 8 | Met (§5, §6) |
| Success criterion 7 (JC: both themes, <60 and wide, nothing wraps, one click runs once) | Met, except "one click runs once" was not reported live item by item; the kit covers it (W-1) |

## 9. Test Evidence Summary

| Suite | Command | Result at HEAD |
|---|---|---|
| Whole repo | `npm test` (Node 22.23.4) | 1830 pass, 0 fail |
| akili-panel node suites | `node --test` five files, Node 18.20.8 | 379 pass, 0 fail |
| Plugin kit | `claude plugin test` on 2.1.319 and on 2.1.318 | 81 pass, 0 fail on each |
| Manifest | `claude plugin validate` on 2.1.319 and on 2.1.318 | passed on each |
| Spot-checked tests | 30+ opened, among them flow FR-2 ×5, FR-3 ×3, FR-4 detached, FR-5 fresh ×2 and 79.6, FR-7 24 / 14 / 14-noted / below-24 / no-width; coverage NFR-2 sweep, FR-5 amended; contract NFR-1, FR-5 no-new-call, FR-1, FR-9, NFR-4, FR-4 inline; cli FR-10; kit FR-1 ×2, FR-6 chip, FR-8 tone, FR-2/FR-4 chain, FR-4 dim, FR-4 inline, FR-4 size | Each exists and asserts its clause |
| Manual | T1, T5, test-phase checks | JC's quotes, §3 |
| `PRODUCT_BUG`, `FAIL`, flaky, `AUTOMATION_DEFERRED` | `test-report.md` | None |
| Freshness | `git diff --stat fbcc995..HEAD -- .claude/skills/akili-panel/hooks` empty | The report covers the code at HEAD |

## 10. Agent Guide / Constitution Impact

| Check | Result |
|---|---|
| `## Constitution Impact` in `execution.md` | None recorded. None needed: no module was created or reshaped, no boundary moved, and the public surface (`/akili-panel`, the plugin layout) is unchanged |
| Root `AGENTS.md` / `CLAUDE.md` | `AGENTS.md:9` describes `akili-panel` as a plugin entry; still true. No `## Module Guides` index exists or is required |
| Pending for `/akili-archive` | CodeGraph re-index, because `flow.mjs` and `register.jsx` changed |

## 11. Remediation

Nothing here is applied. Every correction lists its correction-closure sweep.

| # | Severity | Finding | Proposed fix |
|---|---|---|---|
| R-1 (W-1) | Low | T5's Scope steps were partly not done (`tasks.md:116,118`; `execution.md:376`): no `[~]` added to see the blocked tone on the real plugin, no item-by-item report of one click runs once or of the pending look, the 30 s falsifier (delete `tasks.md`) not run, and no screenshot per theme (JC forbade them). Substitutes exist: kit press-once and pending-prop tests, kit NFR-3 30 s refresh, and the T1 probe that painted the blocked tone | Either JC accepts these as covered by the substitutes (one line in `execution.md` T5 closeout), or a 2-minute live check: add `[~]` in the scratch spec, press Next once, then delete `tasks.md` and wait 30 s |
| R-2 (W-2) | Low, structural | The design gate cannot reach PASS on a terminal pane: the detector and first-visit rows are `Unevaluated` by construction | Accept for this spec. At `/akili-archive`, record a `Kind: upstream` kaizen item: `impeccable-bridge` has no row for non-web surfaces (terminal panes, CLI output) where the human check is the only gate |
| R-3 (W-3) | Low | `test-report.md` figures and NFR-5 evidence are wrong | **C-4** `test-report.md:26`: replace "8 tests, +202 LOC" with "9 tests (6 node, 3 kit; 12 test runs, as the kit's *FR-4 Inline pane* runs on four surfaces), +202 LOC". **C-5** `test-report.md:72`: replace "`FR-3 …` (6 tests)" with "`FR-3 …` (7 tests)". **C-6** `test-report.md:96`: replace the row with "\| NFR-5 \| Minimum 2.1.318 \| validate + kit \| `claude plugin validate` and `claude plugin test` with the 2.1.318 binary at `4cc3db3` (`validation-report.md` §5) \| PASS \| Validation passed; 81 pass, 0 fail \|". **C-7** `test-report.md:116`: delete the "NFR-5 on 2.1.318" row of §9. *Closure:* forward grep `8 tests\|No 2\.1\.318\|Only 2\.1\.319\|PARTIAL` across the spec folder hits only `test-report.md:26,96,116` (the commit subject `3a36514` also says "8 tests" and is immutable). Backward: `execution.md:196,270` (T3 Reviewer's 2.1.318 run) agree with the correction; nothing cites the "8 tests" figure |
| R-4 (W-4) | Low | `design.md:225` breakdown sums to 7 and assigns T5 a round | **C-3** `design.md:225`: replace "Planned: T2 2, T3 2, T4 2, T5 1; T1 and T5 are JC's checks" with "Planned at 7: T2 2, T3 2, T4 2, T5 1. Used: T2 3, T3 3, T4 2; T1 and T5 are JC's checks and took no Reviewer round (`execution.md` *Budget tripwire: T4*)". *Closure:* forward grep `T2 2, T3 2\|T5 1` hits `design.md:225` and `execution.md:315`. The latter is the budget column at the time and stays. Backward: `tasks.md:14` and `execution.md:135,311,326` cite §12 for the tripwire and the total 8, both still true |
| R-5 (W-5) | Low | `design.md` §8 keeps two statements judged false at specify and never corrected (I-6, I-2) | **C-1** `design.md:108`: replace "`blocked` can sit on any current phase, not only execute." with "`blocked` sits on specify or execute only: it needs a `tasks.md` with a blocked task, which keeps execute from being done (`flow.mjs:363-389`)." **C-2** `design.md:115`, Rules cell of *Header 2*: replace "Branch shortened in the middle; the tail is kept" with "Branch shortened in the middle to leave room for the tail; a pane narrower than the tail cuts the row at its end with `…` (FR-7)". *Closure:* forward grep `any current phase\|not only execute\|tail is kept` hits only `design.md:108,115` and `judgment.md:16,77,81`. `judgment.md` records round 1 and stays as written. Backward: `tasks.md:132` and `test-report.md:69` cite the tone table, not this sentence; the plugin `README.md` and the docs page claim nothing about the tail; the flow test title *FR-2 a blocked note on specify…* already states the corrected rule |
| R-6 | Advisory | A-1 `$NaN`, A-2 dead `STRINGS.ctxMissing`, A-5 `.run/` not ignored, A-8 unkeyed children | Follow-up `/akili-quick` or kaizen items only. Per *Scope only grows through approval*, not tasks in this spec |

## 12. Archive Readiness Recommendation

**Archive-ready: yes, conditionally.** All five tasks are `[x]`. There is no FAIL. Every scenario and clause has an owner and evidence. The build is green on 2.1.318 and 2.1.319, and on Node 18 and 22. The code matches the design.

Before `/akili-archive`, JC decides:

1. Accept W-1 as covered by its substitutes, or run the 2-minute live check (R-1).
2. Accept W-2 as structural and send it upstream at the Kaizen step (R-2).
3. Have the doc corrections C-1 … C-7 applied (R-3, R-4, R-5), or accept them as recorded here. They change no code and no test.

Then:

```text
/akili-archive changes/akili-panel-polish
```

## JC's decision, 2026-11-09 12:02 PM America/Bogota

«1: A, aplica las correcciones C-1 a C-7 tal cual en design.md y test-report.md. 2: Sí, acepto W-1 y W-2 como huecos. Sin screencapture.»

| Item | Result |
|---|---|
| W-1 T5 per-step checks | **Accepted as a gap** by JC; covered by the kit tests listed in §6 |
| W-2 design gate on a terminal pane | **Accepted as a gap** by JC; the look's gate stays JC's live checks at T1, T5 and test |
| C-1 … C-7 | **Applied verbatim** by the Leader: C-1, C-2, C-3 in `design.md`; C-4 … C-7 in `test-report.md`. Closure sweep as in §11: no other live sentence in the spec folder carried the superseded values; `judgment.md`, `execution.md` and commit `3a36514` stay as historical records |
| W-3, W-4, W-5 | Closed by C-1 … C-7 |

**Archive-ready: yes.**

```text
/akili-archive changes/akili-panel-polish
```
