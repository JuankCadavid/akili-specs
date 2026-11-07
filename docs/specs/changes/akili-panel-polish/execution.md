# Execution Log: changes/akili-panel-polish

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-panel-polish` |
| Approval | Requirements, design and tasks approved by JC, 2026-11-06: «Continue: apruebo requirements, design y tasks de akili-panel-polish» |
| Start | JC, 2026-11-06 7:30 PM America/Bogota: «adelante», to the question «El siguiente paso es ejecutar akili-panel-polish, empezando por T1 con tus ojos. Antes de arrancar hay que actualizar sus referencias a la spec de la v1, que ahora está archivada. ¿Le digo a Claude que arranque?» |
| Approval Mode | `gated` |
| Owner mandate | Update the references to the archived parent, then start T1 and stop when JC must look. Do not mark T1 passed. Local commits only: no push, merge, tag, release, publish or PR. Stop on any uncovered gate. No W/I advisory fixed beyond the reference update |
| Branch / worktree | `JuankCadavid/akili-panel` at `/Users/jcadavid/orca/workspaces/sdd-jc-methodology/akili-panel` |
| Baseline | `b7d1738` plus the approved spec at `d28c31d`: `npm test` 1740 pass, 0 fail; `claude plugin test .claude/skills/akili-panel` 64 pass, 0 fail. `tasks.md`'s `c14e344` figures predate the parent's last commits |
| Session | Leader on `claude-opus-5-5`. Session `7f15c449-dc64-490b-aee4-512bb50fa437` |
| Workers | None yet. No Step 8E wrappers in this repo. `akili doctor --agents`: no drift blocking |

## Task Execution History

### T1: Paint check on JC's terminal (HITL) — IN PROGRESS, waiting for JC

| Field | Value |
|---|---|
| Status | `[~]`. Prepared, not judged. Only JC's words close it |
| Date | 2026-11-06 |
| Attempts | 0 Implementer: T1 has no repo change |
| spawns | none |
| Requirements | FR-1, NFR-3, D-5 (P-3, P-4) |

**Prepared in Orca**, workspace `JuankCadavid/akili-panel` of `sdd-jc-methodology`, Claude Code 2.1.319, docked pane, `cols=59`, `surface=terminal`:

| Tab | Handle | Theme | State |
|---|---|---|---|
| `T1 paint: dark-ansi` | `term_ed6b0b19-e8f1-4266-9edb-1e42481e9d50` | `dark-ansi` (JC's own) | `/probe-gray`, then `/probe-clear`. Reply: `clear placed=true`. The pane shows `Gray` and `Clear` tabs: the T1 falsifier and the check side by side |
| `T1 paint: light` | `term_ae5844f5-7849-4b7d-b3ff-9abcfe70aa67` | `light`, this session only (`--settings`); `settings.json` still reads `dark-ansi` | `/probe-clear`. Reply: `clear placed=true`. OSC 10 and 11 ask that one tab for a white background and dark text, because the terminal, not the pane, gives the background. Whether Orca honoured them is not confirmed |

Both tabs were read as text only (`orca terminal read --screen`). That shows the rows drew, not how they look, and is no evidence for T1 (Disqualifier).

**Decisions made**

- Execute-time spec edits, meaning unchanged, reference update only: `requirements.md` Document Control and §4 out-of-scope line; `design.md` Document Control and §13; `tasks.md` Document Control, graph and T1 `Depends on`; `proposal.md` new *Parent location* row and the *T9 live run notes* path. The rest of the proposal keeps the name in force at approval.
- T1's scope says "a light theme". The Leader picked `light`, which uses fixed colours. `light-ansi` would use Orca's palette; JC may ask for it.

**Issues encountered**

- The Leader ran `screencapture -x` three times to confirm the tabs. T1 did not ask for this. It captured JC's whole desktop, not Orca, and macOS raised a dialog: "Orca" is requesting to bypass the system private window picker and directly access your screen and audio. The dialog was left unanswered. Both saved images were deleted unused. Not repeated.
- The running sessions regenerate `probe/mod/tsconfig.json`. It is not committed; remove it when T1 ends.

**Forward pointers (not fixed here: T2 and T3 carry them)**

The parent changed after this spec was verified at `c14e344`. `flow.mjs` and `test/akili-panel-flow.test.js` did not change. These did:

| For | Finding at `b7d1738` |
|---|---|
| T3 `Consumers` | `tests/panel.test.tsx` grew by 681 lines. It now pins the old token line: `:336` and `:703` to `:847` compare `Tokens: ctx …` text. `key: 'next'` also sits at `:329,349,358,369,370,380,384,396,400,405,569`. None of this is in T3's `Consumers` |
| T3 budget | Those tests move to the new rows inside T3, so T3's ~120 test LOC, and the ~650 LOC tripwire, may be short. Check it at T3's finalize |
| T3 design refs | `register.jsx` shifted: `press` `:151`, `openPane` `:169`, `$.ui.open` `:171`, the command `:190`, `onPress` `:251`. P-8 and P-9 still hold in substance; their lines are as of `c14e344` |
| T2, T3 | New v1 behaviour to keep: `resetSums` and `afterClear` after `/clear`. FR-5's "sources, sums … stay as parent FR-12" now means the archived FR-12, clarified for `$` |
