# Judgment Day: changes/akili-panel-polish design

**Result:** one confirmed severe finding, J-1, plus W-2 … W-8 were fixed at JC's request. **`fixed, not re-judged`: J-1, W-2, W-3, W-4, W-5, W-6, W-7, W-8.** The fixes were not reviewed by any judge.

## Document Control

| Field | Value |
|---|---|
| Target | `requirements.md` + `design.md`, with `tasks.md` and `proposal.md` in scope for consistency, as frozen 2026-11-06 over `c14e344`. sha256: `design.md` `afa4d866…`, `requirements.md` `338cd126…`, `tasks.md` `719a28cf…`, `proposal.md` `dd74feea…`. Those hashes are the judged copy: the Fix only pass changed `design.md`, `requirements.md` and `tasks.md` after it. `probe/focus0.ansi` and `probe/clear.ansi`, cited below, are that round's captures; the kept re-runs are in `probe/captures/` |
| Mode | `judgment_day`, `/akili-specify` Step 2.5 **Review Design** |
| Who asked | JC at the design/tasks gate, 2026-11-06 10:01 AM America/Bogota: «Review Design: corre judgment-day sobre akili-panel-polish» |
| Judges | Two blind, read-only judges, run in parallel with the same prompt, scope and skill paths. Model **Sonnet**; the design author is Opus (author ≠ auditor) |
| Round | 1 of at most 2. Round 2 **not run**, by JC's choice |
| State | **Closed: `fixed, not re-judged`.** Fixed: J-1, W-2 … W-8. Not `JUDGMENT: APPROVED` |
| JC's answer | «Fix only: corrige J-1 y W-2…W-8 sin re-juzgar» — JC, 2026-11-06 10:17 AM America/Bogota |
| Not fixed | W-1 and I-1 … I-13 stay `info`: JC's answer does not name them. I-6 means §8's sentence "`blocked` can sit on any current phase" stands as written, though it is false. W-1 means §2's "settled for the terminal" stands too |

## Counts

| Judge | Severe | Warning | Suggestion |
|---|---|---|---|
| A | 1 | 11 (its header said 10; it sent 11 rows) | 4 |
| B | 1 | 12 | 2 |

| Merged | Count | IDs |
|---|---|---|
| Confirmed: both judges report the defect, at least one rates it severe | 1 | J-1 |
| Suspect: severe from one judge only | 1 | B-1, refuted by re-read |
| Judges disagree on a premise | 1 | P-2, settled by the same re-read |
| Info raised by both judges | 8 | W-1 … W-8 |
| Info raised by one judge | 13 | I-1 … I-13 |

## Confirmed severe

### J-1: narrow widths can cut the state words

| Field | Value |
|---|---|
| Reported by | A F1 (severe), B F10 (warning) |
| Where | `requirements.md` FR-7, NFR-2, FR-2; `design.md` §8 *Layout*, *Ladder*, *Fit* |
| Defect | FR-7 says marks, `(blocked)`, `<done>/6` and `<p>%` are the last to go, and its *Any width* scenario runs from 20 columns. The mark column is fixed at 17 and the ladder governs only the cycle and token rows, so flow rows are simply cut from the end |
| Evidence | Mark at column 17: `▶ (blocked)` needs 28 columns, `▶ (no task status)` 35, `▶ (10/13)` 26, and `100%` needs 21. At 20 columns a blocked row reads `▶ …`, which breaks NFR-2 and FR-2's *AND IT MUST read the same words* |
| Status | **Fixed, not re-judged** (see *Fixes applied*) |


## Suspect, settled

### B-1 and P-2: do colours survive when the pane has focus?

| Field | Value |
|---|---|
| Reported by | B F1 (severe): `focus0.ansi:6` shows `current ▶` with no `94`. A read P-2 as confirmed |
| Settled by | The architect, with one re-read: a stateful walk of the SGR codes in `probe/focus0.ansi` and `probe/clear.ansi` |
| Result | **Refuted.** `capture-pane -e` emits only changes. A focused pane's `│` divider is already `94`, so the next cell inherits it. The walk gives `current ▶` fg `94` bold and `[ Next: primary ]` fg `94` bold in both captures; `blocked ▶` fg `93` and the chip `30` on `104` also match |
| Action | None. P-2 stands. JC may overrule |

## Info raised by both judges

Under the skill these stay `info` unless JC asks. JC asked for W-2 … W-8.

| ID | Judges | Finding |
|---|---|---|
| W-1 | A F2, B F2 | Every probe ran docked. Transparency, colours and `rows` were never seen inline, which is where DD-P12 and FR-4's *Inline pane* apply. §2's "settled for the terminal" overstates it |
| W-2 | A F11, B F4 | P-1, P-2, P-6 and P-10 cite a scratch mod that lives outside the repo, so they do not meet citation rule (a). P-1's "capture lines 16 and 19" are lines 17 and 20, 1-indexed |
| W-3 | A F10, B F3 | P-10's on-focus string is in no kept capture: it was read live and not saved |
| W-4 | A F4, B F7 | FR-5 *Fresh session* says `session 0 in / 0 out`, but the layout pads the value to column 17, so a test written from either contradicts the other |
| W-5 | A F6, B F9 | The cycle bar has no stated tone for `no-task-status`, and T2 has no falsifier for it |
| W-6 | A F7, B F13 | No rule for `bodyColumns` missing or not positive, or for widths below 17. `fitLine` guards this today, and T3 narrows the existing 1 to 120 sweep to 20 to 120 |
| W-7 | A F12, B F12 | No task scope owns the function that assembles the rows (block order, empty text, errors), though T2's red run names it and the coverage table gives FR-4 order to T3. T3's `Consumers` also omits `panel.test.tsx:68,94,104` |
| W-8 | A S2, B F14 | `tasks.md` says the PR "passes ~400 LOC" against a budget of ~620 |

## Info raised by one judge

| ID | Judge | Finding |
|---|---|---|
| I-1 | A F3 | P-8 says "No branch point", but a `ui.open` hook may drop `backgroundColor` (`types:7842`). The gray would return under coloured text, and FR-1's fallback covers only surfaces that ignore the request |
| I-2 | A F5 | "The tail is kept" cannot hold: ` · archived (12 more active)` is 28 characters |
| I-3 | A F8 | Ladder step 3 removes `session` even when the figures alone cause the overflow, so `session` is lost at 33 to 43 columns though it fits. The order comes from the proposal |
| I-4 | A F9 | T3's "plant `'red'`" falsifier needs a colour-name denylist, which cannot be complete. An allow-list of theme keys would make it real |
| I-5 | A F10 | The probe's press handler was `() => {}`, so "the press resolves" does not show `press()` ran. P-6 and P-9 lean on it |
| I-6 | B F5 | Depended-on premises with no row: `e.surface` on `ui.render` (no hook uses it today), and the chip on 2.1.318 (only transparency was probed there). Also §8's "`blocked` can sit on any current phase" is false: the architect checked, and it needs `tasks.md` and open tasks, so it sits on specify or execute only (`flow.mjs:371-383`) |
| I-7 | B F6 | "Column 17" has no stated origin. Offsets 16, 17 and 18 could each be read that way |
| I-8 | B F8 | The pending look does not say `inverseText` is dropped. If kept, the letters are black on a dark pane |
| I-9 | B F11 | `rows: 16` omits up to 3 error rows, so Next can scroll, while FR-4's scenario promises no scrolling |
| I-10 | B F14 | Small slips: the proposal's R8 cites D-6 for the painted look, which `requirements.md` calls D-5; the proposal implies a rule above Next that FR-4 does not have; sketch frame 5 shortens a path that would fit |
| I-11 | B F15 | Judge could not re-run the baselines. "All four surfaces" is new work in T3: `SURFACES` holds two today (`panel.test.tsx:11`) |
| I-12 | A S1 | On ANSI themes `inactive` and `subtle` are the same `SGR 37`, and `suggestion` has five uses against "one accent kept rare" |
| I-13 | A S3, S4 | Test line numbers in `Consumers` will go stale (KZ-005); the test LOC is not derived from the clause count; FR-4's *a size the person set stays theirs* has no step in T5 |

## Premise Ledger results

| Row | Judge A | Judge B | Outcome |
|---|---|---|---|
| P-1 | Confirmed, docked only | Confirmed, docked only | Holds for docked panes (W-1) |
| P-2 | Confirmed | Partly refuted | **Holds**, settled above |
| P-3 | Not re-run | Not re-run | Still `UNVERIFIED`, High. Owner T1 |
| P-4 | Not re-run | Not re-run | Still `UNVERIFIED`, Low. Owner T1. A notes `light-ansi` maps `warning` to `ansi:yellow` |
| P-5 | Confirmed | Confirmed | Holds |
| P-6 | Partly confirmed | Key lines confirmed | Key lines hold; the press proof is weak (I-5) |
| P-7 | Confirmed | Confirmed | Holds |
| P-8 | Confirmed; "no branch point" contested | Confirmed | Holds, with I-1 |
| P-9 | Confirmed; press evidence weak | Confirmed | Holds, with I-5 |
| P-10 | Not re-run | Not re-run | Capture not on disk (W-3) |
| P-11 | Confirmed as contract | Confirmed as contract | Not exercised live |

## Fixes applied

Applied by the architect, inline, to the spec documents only.

| ID | Fix | Where |
|---|---|---|
| J-1 | New ladder step 6 moves the mark column from 17 to 13 and shortens the constitution label to `01 Constit…`; bars now leave at step 7. The ladder also governs the constitution and flow rows, and the last step applies when none fits. FR-7 states what stays whole at 31, 24, 17 and 14 columns, with scenarios at 24 and at 20 | `requirements.md` FR-2, FR-4, FR-7, NFR-2; `design.md` §8, DD-P10; `tasks.md` T2, coverage |
| W-2 | The probe moved to `probe/` with `run.sh` and a README, and was re-run; citations now point at saved captures with 1-indexed lines | `probe/`; `design.md` §1, §2, §4, P-1, P-2, P-6, P-7, P-9, P-10; `requirements.md` §4; `tasks.md` T1 |
| W-3 | The on-focus state is saved: `probe/captures/focus-on-chip.ansi:10` | `design.md` P-10 |
| W-4 | FR-5 now says each row is a label padded to the mark column, then a value, and the *Fresh session* scenario reads the same way | `requirements.md` FR-5; `design.md` §8 |
| W-5 | The current phase's bar share takes its mark's tone, so `no-task-status` is `warning`; new scenario and falsifier | `requirements.md` FR-3; `design.md` §8; `tasks.md` T2, coverage |
| W-6 | With `bodyColumns` missing or not positive: step 1, no cut, a rule of 40. The width sweep runs 1 to 120 and T3 may not narrow it | `requirements.md` FR-7, D-2; `design.md` §8; `tasks.md` T2, T3, coverage |
| W-7 | T2 owns `paneRows`, block order included; T3's `Consumers` adds `tests/panel.test.tsx:68,94,104` | `design.md` §8; `tasks.md` T2, T3, coverage |
| W-8 | The PR line and the budget agree: ~650 LOC, ~420 of it tests. The budget rose from ~620 for the added clauses | `tasks.md`; `design.md` §12 |

T1 now loads `probe/mod` rather than writing a throwaway mod (W-2). The approved `proposal.md` was not edited, so its narrow-pane summary and its "20 to 120" criterion describe the earlier plan; `requirements.md` is the current statement.

**Annotation:** `fixed, not re-judged`: J-1, W-2, W-3, W-4, W-5, W-6, W-7, W-8.
