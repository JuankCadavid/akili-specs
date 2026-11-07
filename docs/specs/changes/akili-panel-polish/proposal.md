# Proposal: akili-panel-polish — make the Akili pane easier to read and nicer to look at

**In one line:** give the pane a real background first, then add colour by state, two small bars, dividers and a filled Next button. It changes only how the pane looks, using Claude Code's theme colours so light and dark both work.

The background comes first because of one finding: **colour on today's gray would make the pane worse** (P1, P2). Fixing the background is what lets the rest work.

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-panel-polish` |
| Slug | `akili-panel-polish` — derived from free-text argument |
| Type | Change |
| Deliverable | software |
| Approval Mode | `gated` (default). The brief gives no pre-approval: *"Never answer a methodology gate on JC's behalf."* |
| Status | **Approved** by JC (Juan Carlos Cadavid), 2026-11-06 9:25 AM America/Bogota: «Apruebo la propuesta akili-panel-polish, opción A con B de respaldo, y acepto los defaults de Q1, Q2 y Q3. No hay Jira ni Figma.» Decisions recorded in *Decisions After Approval* below. Next phase: `/akili-specify` |
| Parent location | Archived 2026-11-06 at `b7d1738`: `changes/akili-panel` now lives at `docs/specs/archive/2026-11-06-changes--akili-panel/`. The name below is the one in force at approval |
| Route | `/akili-propose` follow-up, not a Pivot of `changes/akili-panel`. Reasons: *Approach Options → Why a follow-up* |
| Requirement source | JC (Juan Carlos Cadavid), 2026-11-06 morning America/Bogota: «se puede hacer algo para que se vea mas bonita ? ver imagen». Direction list from the owner brief, `.run/akili-propose-polish/PROMPT.md`, which says to refine it and not treat it as locked |
| Visual source | JC's screenshot of the current pane, `.run/akili-propose-polish/jc-panel-screenshot.png`. It shows today's look, not a target |
| Source questions | **Asked at the gate and answered by JC:** no Jira ticket, no Figma file |
| Date | 2026-11-06 |
| Branch | `JuankCadavid/akili-panel` (worktree) at `c14e344`. No new branch yet |
| Depends on | `changes/akili-panel`: its code is on this branch only, 11 commits ahead of `origin/dev` (`7a697ba`) |
| Parallel-safe | **No.** It edits the same `register.jsx`, `flow.mjs` and tests |
| Release intent | Recorded only, see Q3. No push, PR, merge, tag or publish in this phase |
| D-A, D-B | Open decisions of `changes/akili-panel`. **Untouched here**; this proposal neither answers nor depends on them |

## Intent

JC finished the live check and the pane works, but it looks flat. This change makes state readable at a glance: what is done, what is current, what is blocked, how far the cycle has come, how full the context is, and what to press next.

## Problem / Current Behavior

`types:` below means `types/claude-code.d.ts` of the bundled `plugin-authoring` skill, build 2.1.319. Code citations are at `c14e344`.

| # | Today | Evidence |
|---|---|---|
| P1 | The pane sits on a mid-gray, and even its white text reaches only **3.46:1** contrast, below the 4.5:1 that WCAG AA asks for body text. | Measured: `magick … -format %c histogram:info:-` on JC's screenshot gives background `#7F8499`, text peak `#F5F7FA`. T9's own capture has the same `#7F8499` (`T9-right.png`) |
| P2 | Colour alone cannot fix this: on that gray, the theme's colours fall to **1.2–2.3:1**. | Claude Code 2.1.319 `dark` theme values read from the binary, ratios computed: `claude` 1.18, `inactive` 1.30, `error` 1.35, `success` 1.51, `suggestion` 1.97, `warning` 2.27. Frame 2 of the sketch shows it |
| P3 | The plugin asks for no background, so the gray is the host's own look. | `.claude/skills/akili-panel/hooks/register.jsx:152` `$.ui.open({ id: PANE, title: 'Akili' })`; `types:7841`: "Left out, the surface's own look stands" |
| P4 | Why the gray is this light is not established. JC's theme is `dark-ansi`, and the same `#7F8499` also paints the message bar at the top of the screenshot, so it may be that theme's `ansi:blackBright` through Orca's palette. | Theme: `.claude.json` `theme = dark-ansi`. The cause: UNVERIFIED — confirm at source before relying on it |
| P5 | Every row has about the same weight. Only the current phase is bold, and the token line is dim. | `register.jsx:221-227` |
| P6 | Next does not stand out. The terminal draws a primary button as `[ label ]` in the accent colour, and here that accent is almost the same as the text. | `types:1152`; measured peak `#EEF8F8` for Next against `#F5F7FA` for text |
| P7 | The marks do not share a column: the Constitution mark comes after 17 characters, the phase marks after 13. | `flow.mjs:507-510` and `:514-521`; visible in the screenshot |
| P8 | The cycle has no progress figure, and context fill is text only. | `flow.mjs:514` `formatPhaseLines`, `:536` `formatTokens` |
| P9 | This is not a defect in the shipped spec. Steps 3, 4 and 5 of T9 passed, narrow pane and Next click included. | `docs/specs/archive/2026-11-06-changes--akili-panel/execution.md` → *T9 live run notes*; JC: «1. Funciona», «2. click -funciona» |

## Proposed Outcome

Sketch: `mockup/pane-polish.png`. Today, then the proposal in dark, light and narrow.

```text
Akili  changes/demo-spec
⎇ feat/demo-spec
──────────────────────────────────────────
01 Constitution  ○
02 Cycle         ━━━━━━──────  2/6
   propose       ✓
   specify       ✓
   execute       ▶
   test          ○
   validate      ○
   archive       ○
──────────────────────────────────────────
ctx              ━───────────  11%  106k/1.0M
session          368k in / 2.4k out

 Next: /akili-execute changes/demo-spec
```

| Brief item | What changes | Theme key |
|---|---|---|
| Background (the prerequisite) | `$.ui.open` asks for `backgroundColor: 'transparent'`, so the pane shows the terminal's own background | — |
| Colour per state | Done `✓`, current `▶` and its bold label, pending `○` and its label, blocked `▶ (blocked)` and its label | `success`, `suggestion`, `inactive`, `warning` |
| Cycle progress | New row `02 Cycle`: a bar coloured by phase state, then `<done>/6` | as above |
| Hierarchy | Title and spec on one row, branch dim under them, thin rules between header, flow, tokens and Next | `subtle` for rules |
| Token mini-bar | `ctx` row with a bar, percent and figures; `session` row under it | `suggestion`, `subtle` |
| Next button | Filled chip on the terminal; the host's native primary button elsewhere | `suggestion` behind `inverseText` |
| Read failures | `Could not read …` lines use the error colour instead of dim | `error` |

**Colour never carries meaning alone.** The marks, `(blocked)`, `2/6` and `11%` all stay as text. A person who cannot tell the colours apart loses nothing, and any theme that remaps the keys is followed automatically.

**Narrow panes.** Parts leave in a fixed order: `$`, then `session`, then the `106k/1.0M` figures, then the bars halve to 6 cells. Marks and percent stay. Exact widths are set at `/akili-specify`.

## Scope

| In scope | Detail |
|---|---|
| Render | `.claude/skills/akili-panel/hooks/register.jsx`: `ui.render`, and the one `$.ui.open` argument |
| Pure formatters | `hooks/flow.mjs`: row builders that return coloured parts, a state-to-theme-key table kept as data (DD-15), bars, and a fit rule so no row passes `bodyColumns` |
| Tests | `test/akili-panel-flow.test.js` (pinned strings such as `:382`, `:429`, `:472`, `:678-705`), `test/akili-panel-contract.test.js`, `.claude/skills/akili-panel/tests/panel.test.tsx` |
| Docs | Plugin `README.md` row table, `docs/plugins/akili-panel.md:33,38`, `CHANGELOG.md` → `Unreleased` |
| Live check | A human pass, because no automated check can see the painted pane (`requirements.md` D-6) |

## Non-Goals

- Any change to what the pane knows or does: phase rules, spec choice, refresh, observers, the Next press, `/akili-panel`.
- Installer, `list`, `doctor`, governance or marketplace changes.
- New marks. D5 stands: blocked is `▶ (blocked)`, not a fourth glyph, so FR-6 keeps its three marks.
- Raw colours (hex or colour names). A raw colour cannot follow the person's theme.
- `$.theme.set`. It sets a backdrop for the whole session, which is not this plugin's to change.
- Motion, or Spanish strings (D7 stands).
- Answering D-A or D-B, or closing T9, `/akili-test`, `/akili-validate` or `/akili-archive` of `changes/akili-panel`.

## Affected Users, Systems, And Specs

| Affected | How |
|---|---|
| Claude Code users of AKILI | New look. Other targets never receive the plugin |
| `changes/akili-panel` | Stays the record of v1. This spec supersedes parts of it (see the delta preview) without editing it |
| Claude Code version | Stays at 2.1.318 or later: `backgroundColor`, `plain`, `ThemeKey` and `Text` inside a `Button` are all in the 2.1.318 types as well as 2.1.319 |
| Repo sessions | The pane loads from this repo's own `.claude/skills`, so the dogfood copy changes too |

## Visual Reference

- Source: Self-contained HTML mockup (a sketch for this gate, not a locked direction)
- Location: `docs/specs/changes/akili-panel-polish/mockup/pane-polish.html`, rendered to `mockup/pane-polish.png`
- Notes: five frames: today, the rejected colour-on-gray, proposed dark, proposed light, and proposed narrow and blocked. Colours are the `dark` and `light` theme values. **JC's `dark-ansi` will differ**, because its colours come from the terminal palette. The sketch was rendered in Chrome, not in a terminal, so glyph weight is approximate.

### Impeccable notes

| Field | Value |
|---|---|
| Skill source | `vendored (4.8.0)`. Copy: this profile's `home/skills/impeccable`. Home: `/Users/jcadavid`. Other copies: repo `.claude/skills/impeccable` and `~/.claude/skills/impeccable`, both 4.8.0 |
| Engine | `ready (location 4, engine 0.1.18)`, `IMPECCABLE_BIN=~/.impeccable/bin/0.1.18/impeccable`. No download |
| Context | No `PRODUCT.md` or `DESIGN.md`. This is a scoped refinement, so it proceeds on the existing code; `/impeccable init` stays an optional suggestion |
| Environment / mode | **ENV-2** (the host's element table and theme keys, as design §8 found). Page mode **Operate**. Polish `light` |
| Direction | *Extend an existing surface*: a refinement that keeps the content, the order and the Claude Code feel. Colour encodes state and action only, and one accent is kept rare so Next keeps its force |
| Playbooks for `/akili-execute` | `colorize`, `layout`, `adapt`, then `polish`. `craft-floor` is read before the UI edit |
| Detector | Not run: nothing changed, and the pane is not a web page. Expect `Unevaluated` at validate; the human check is the real gate |

## Requirement Delta Preview

These are deltas against `changes/akili-panel`.

### ADDED Requirements

- The pane opens with a transparent background where the surface allows it.
- Each state has a colour from the theme, and the plugin names no raw colour.
- A `02 Cycle` row shows a bar and `<done>/6`.
- A context bar shows the fill. With no figure yet it draws `ctx —` and no bar.
- Rules separate the header, flow, tokens and Next.

### MODIFIED Requirements

- **Design §8 direction:** "no custom colours" becomes "theme keys only, no raw colours".
- **FR-12:** "one line" becomes a `ctx` row and a `session` row. The drop order gains the figures and the bar width.
- **§8 Header and FR-16:** one row becomes two, so spec and branch stop competing for width. The rule for shortening with `…` stays.
- **§8 Flow:** the `02` label moves to the `Cycle` row, and all marks share one column.
- **§8 Next:** a filled chip on the terminal. The text `Next: /<command> <args>` and the press behaviour (FR-7) do not change.
- **§8 Errors:** `error` colour instead of dim. The wording (FR-16) does not change.

### REMOVED Requirements

- The `Tokens:` prefix (FR-12). The `ctx` and `session` labels replace it.

## Approach Options

### Why a follow-up and not a Pivot

| Question | Answer |
|---|---|
| Is the Pivot Protocol's trigger met? | **No.** It fires when discoveries "reveal that the approved requirements or design are wrong or technically unviable" (`.claude/commands/akili-execute.md:439`). Nothing is wrong or unviable: T9 passed, and this is a new wish from the owner |
| What do the repo rules say? | `/akili-propose` is "the single entry point" for change work, and *Scope only grows through approval* (`AGENTS.md`). New scope needs its own approved intent |
| What would a Pivot cost? | It would mark a finished task `[~]` and reopen an approved design with 17 of 18 review rounds spent (`execution.md:833-841`). It would also hold the v1 close behind a look change |
| Why not `/akili-quick`? | It fails the gate: two modules plus tests, past ~20 LOC, with a pinned token-line format changing |
| Why not the Bug Track? | No requirement fails, and no symptom is wrong behaviour (P9). Low contrast is treated as part of this change |

### Visual options

| | A. Background + theme keys | B. Keep the gray, monochrome | C. Own painted palette |
|---|---|---|---|
| What it is | Transparent pane, then colour, bars, rules, chip | Bold, dim, rules and bars only, in white on gray | Raw hex background and colours |
| Colour per state | Yes | **No** | Yes |
| Contrast | At least 6.8:1 for the text keys on JC's measured `#0A0C11`, using `dark` values (`inactive` is lowest, at 6.87:1) | Stays 3.46:1 | Under our control |
| Light and dark | Automatic | Host's own | **Fails**: raw colours do not follow the theme |
| Main risk | The surface may ignore the request (R1) | Does not answer the ask | A fixed look in every theme |
| Size | Medium | Small | Medium, plus a theme to maintain |

## Recommended Approach

**Option A, with Option B as the named fallback.** It is the smallest path that delivers everything JC asked for, and it does so with host colours only, so nothing needs maintaining per theme.

- All decisions stay in `flow.mjs` as pure data and functions (DD-2, DD-15), so CI can test them. `register.jsx` only draws them.
- The first task is a **live probe** on a real terminal: does `transparent` take effect, in `dark-ansi` and in a light theme? If it does not, stop and bring JC the choice of Option B, not a guess.
- Expected depth: `/akili-specify` Lite. No installer, data, API or auth work.
- Rough size, as an estimate only: about 150 LOC of code and 300 of tests. Tests are budgeted per clause (KZ-bugfix--init-ctrlc-abort-2).

## Risks, Dependencies, And Open Questions

### Risks

| # | Risk | Mitigation |
|---|---|---|
| R1 | `backgroundColor` is "a request, not a grant" (`types:7844`), so a surface may keep its gray. Then colour would be unreadable | Probe first; fall back to Option B with JC's OK. Executed, not predicted (KZ-changes--leader-brief-contract-2) |
| R2 | Every contrast figure here uses `dark` and `light` values. JC's `dark-ansi` takes its colours from Orca's palette | The live check runs on JC's own theme, plus one light theme |
| R3 | If this code lands before `changes/akili-panel` is validated, that spec's FR-12 and §8 would no longer match the code | Q1: execute only after the parent is closed |
| R4 | A filled chip uses `plain` plus `Text backgroundColor` inside `Button`. How other surfaces draw that is UNVERIFIED — confirm at source before relying on it | Chip on the terminal only, native primary elsewhere; the engine-kit tests mount both |
| R5 | The chip could disturb focus or press behaviour | Repeat T9 step 5 on the new button: one click, one run, and the disabled look while running |
| R6 | `━` and `─` may draw at a different width or weight in some fonts, and `fitLine` counts characters (`flow.mjs:479`) | Same class as the `✓ ▶ ○ ⎇` already in use; checked by eye at two widths |
| R7 | `suggestion` on white is 4.40:1, just under 4.5:1 | It is bold where used as text. Revisit at specify |
| R8 | No test can see the painted pane, so a green suite proves little about the look (D-6) | The human check stays the gate. Automated tests pin keys, widths and no raw colours |
| R9 | Summary surfaces go stale: the README rows and docs page quote the old `Tokens:` line (KZ-changes--kaizen-loop-closure-2, KZ-002) | Sweep by claim, not by identifier, and quote-check at HEAD |
| R10 | A shipped test or doc must not point at this spec's active path (KZ-changes--archify-diagrams-1) | Tests read plugin files and fixtures only |

### Open questions for JC

| # | Question | Proposed default |
|---|---|---|
| Q1 | When may this run against `changes/akili-panel`? | `/akili-specify` may start now, as it is docs only. `/akili-execute` waits until that spec has closed T9 and passed test, validate and archive |
| Q2 | Should the context bar change colour as it fills? The original non-goal was "Budget enforcement or alerts on token use" | Yes, display only: `warning` from 80%, `error` from 95%. No toast, no blocking. Say no to keep it one colour |
| Q3 | Release together with v1, or after it? | Together: v1 is unreleased, so users meet the good-looking pane first, and `plugin.json` stays `1.0.0` |

## Success Criteria

| # | Criterion | Checked by |
|---|---|---|
| 1 | The plugin source names only theme keys and `transparent`: no hex, no colour names | Contract test, with a planted `#ff0000` going red |
| 2 | No row is wider than `bodyColumns` at any width from 20 to 120 | `node --test` over the pure formatters |
| 3 | Each state maps to its key, and marks, `2/6` and `11%` stay as text | `node --test` |
| 4 | With no spec, the pane draws no cycle row and no bar; the empty and error texts are unchanged | `node --test`, `claude plugin test` |
| 5 | `claude plugin validate` and `claude plugin test` pass on `terminal` and `desktop` | Local run |
| 6 | `npm test`, `npm run verify:cli`, `npm run pack:dry-run` and `git diff --check` pass | Local run |
| 7 | JC, on a real terminal, in `dark-ansi` and a light theme, at one width under 60 columns and one wide: states are easy to tell apart, nothing wraps, one click on Next runs once | Human check, JC is the gate |
| 8 | Phase rules, the Next command and `.claude/commands/` are unchanged | Existing tests stay green apart from the pinned format strings; `git diff --stat` on `.claude/commands` is empty |

## Decisions After Approval

| ID | Question | Decision | Provenance |
|---|---|---|---|
| D1 | Proposal gate | **Approved:** Option A, with Option B as the fallback | JC, quote in Document Control |
| D2 | Q1 | Default accepted: `/akili-specify` may start now; `/akili-execute` waits until `changes/akili-panel` has closed T9 and passed test, validate and archive | JC, same quote |
| D3 | Q2 | Default accepted: the context bar changes colour, display only: `warning` from 80%, `error` from 95%. No toast, no blocking | JC, same quote |
| D4 | Q3 | Default accepted: release together with v1; `plugin.json` stays `1.0.0` | JC, same quote |
| D5 | Sources | No Jira, no Figma | JC, same quote |

## Next Step

Approved:

```text
/akili-specify changes/akili-panel-polish
```
