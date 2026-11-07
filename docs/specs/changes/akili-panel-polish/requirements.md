# Requirements: akili-panel-polish — make the Akili pane easier to read and nicer to look at

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-panel-polish` |
| Depth | **Standard, kept compact.** The proposal expected Lite; the design resolves to 5 tasks, which is past Lite's one task (`design.md` §12) |
| Type | Change |
| Deliverable | `software` |
| Approval Mode | `gated`. Every phase gate stops for JC. Not pre-approved |
| Status | **Requirements approved by JC (Juan Carlos Cadavid), 2026-11-06:** «Continue: apruebo requirements, design y tasks de akili-panel-polish». The time was not relayed. Approval Mode stays `gated`. Approved after «Fix only: corrige J-1 y W-2…W-8 sin re-juzgar» (2026-11-06 10:17 AM America/Bogota). `judgment.md` closes `fixed, not re-judged`; W-1 and I-1 … I-13 stay `info` |
| Date | 2026-11-06 |
| Proposal | `proposal.md`, approved by JC 2026-11-06 9:25 AM America/Bogota: Option A with Option B as the fallback, defaults of Q1, Q2 and Q3 accepted (its *Decisions After Approval*) |
| Parent spec | `docs/specs/archive/2026-11-06-changes--akili-panel/` (`changes/akili-panel` until it was archived at `b7d1738`). This spec changes its look only. Parent IDs below read `parent FR-n` |
| Format source | `docs/specs/archive/2026-11-06-changes--akili-panel/requirements.md`. There is no `docs/specs/general-setup/` in this repo |
| Baseline docs | None in this repo (`docs/prd.md`, `docs/ux-ui/design.md`, `docs/trd/trd.md` are absent). Root `AGENTS.md` is the reference |
| Verified at | `c14e344` |
| Branch | `JuankCadavid/akili-panel` (worktree). No push, PR, merge, tag or publish in this phase |
| Execution rule | **Met.** `/akili-execute` waited until the parent had closed T9 and passed test, validate and archive (decision D2). Parent archived at `b7d1738`; start authorized by JC, 2026-11-06 7:30 PM America/Bogota: «adelante» |
| Release | With v1; `plugin.json` stays `1.0.0` (decision D4). Recorded only |

## 2. Executive Summary

The Akili pane works, but it looks flat and its gray background is hard to read. This spec gives the pane the terminal's own background, then adds colour by state, a cycle bar, a context bar, dividers and a filled Next button.

What the pane knows and does stays the same. Colours come from the person's Claude Code theme, so light and dark both work, and every state stays readable as text.

## 3. Glossary

| Term | Meaning |
|---|---|
| Theme key | A colour name from Claude Code's theme, such as `success`. It follows the person's theme |
| Raw colour | A hex value or colour name. It does not follow the theme, and this spec forbids it |
| Tone | The theme key and weight a state is drawn with |
| Cycle | The six phases: propose, specify, execute, test, validate, archive |
| Row | One line of the pane, never wider than the pane's body |
| `bodyColumns` | The width in cells Claude Code gives the pane's body |
| Chip | The filled Next button on the terminal |

## 4. System Context & Scope

Today (all at `c14e344`):

| Today | Evidence |
|---|---|
| The pane opens with no background request | `.claude/skills/akili-panel/hooks/register.jsx:152` |
| Under `dark-ansi` the host paints the body in ANSI bright black, which is the gray in JC's screenshot | `probe/captures/gray.ansi`, Claude Code 2.1.319: the pane body carries `SGR 100` (`design.md` P-1) |
| No colour is set anywhere in the pane | `grep -c 'color=' register.jsx` → `0` |
| Row formats are pinned by tests | `test/akili-panel-flow.test.js:472`, `:678-705` |

**In scope:** the pane's look: `register.jsx`, the formatters in `flow.mjs`, their tests, and the two docs that describe the rows.

**Out of scope:**

- Phase rules, spec choice, refresh, observers, the Next press, `/akili-panel`, installer, `list`, `doctor`, governance, marketplace.
- New marks, raw colours, `$.theme.set`, motion, Spanish strings.
- D-A, D-B, T9 and the closing phases of the parent.

## 5. Stakeholders / Personas

| Who | Needs |
|---|---|
| A person working a spec in Claude Code | To see at a glance what is done, what is current, what is blocked, and what to press |
| A person on a narrow pane | The same facts, with no wrapped rows |
| A person who cannot tell colours apart | The same facts from text alone |
| JC | The final say on the look, on his own terminal |

## 6. Functional Requirements

### FR-1: Pane background

The pane SHALL ask Claude Code for a transparent body, so that the terminal's own background shows through.

#### Scenario: Open

- GIVEN a surface that honours the request
- WHEN the person runs `/akili-panel`
- THEN the pane's body shows no background of its own
- AND the reply and the placement behaviour are the same as today

#### Scenario: A surface keeps its own look

- GIVEN a surface that ignores the request
- WHEN the pane opens
- THEN the pane still opens and draws every row
- BUT no error, toast or reply text mentions the background

### FR-2: Colour by state

Each state SHALL have one tone:

| State | Mark | Mark tone | Label tone |
|---|---|---|---|
| Done | `✓` | `success` | `inactive` |
| Current | `▶` | `suggestion`, bold | `suggestion`, bold |
| Current and blocked | `▶ (blocked)` | `warning`, bold | `warning`, bold |
| Current, no task status | `▶ (no task status)` | `warning`, bold | `warning`, bold |
| Not reached | `○` | `inactive` | `inactive` |
| Constitution, all present | `✓` | `success` | `inactive` |
| Constitution, some present | `▶ (k/13)` | `suggestion`, not bold | `inactive` |
| Constitution, none present | `○` | `inactive` | `inactive` |

#### Scenario: A spec in execute

- GIVEN a spec with propose and specify done and execute current
- WHEN the pane draws
- THEN each phase row carries the tone of its state
- BUT the marks are still `✓`, `▶` and `○`, with no fourth glyph (parent D5)

#### Scenario: Blocked

- GIVEN a spec with a blocked task
- WHEN the pane draws
- THEN the current row reads `▶ (blocked)` in the `warning` tone
- AND IT MUST read the same words with colour removed, at the widths FR-7 guarantees

### FR-3: Cycle progress

When a spec is shown, the pane SHALL draw a `02 Cycle` row: a bar, then `<done>/6`. Each phase owns an equal share of the bar. A done phase uses `success`. The current phase uses its mark's tone: `suggestion`, or `warning` when blocked or with no task status. A phase not reached uses the empty glyph.

#### Scenario: Mid-cycle

- GIVEN propose and specify done and execute current
- THEN the row ends `2/6`
- AND the shares read done, done, current, then three empty

#### Scenario: Blocked

- GIVEN the current phase is blocked
- THEN its share of the bar uses the `warning` tone

#### Scenario: No task status

- GIVEN execute is current with the `(no task status)` note
- THEN its share of the bar uses the `warning` tone

#### Scenario: Archived

- GIVEN an archived spec
- THEN the row ends `6/6` and every share is done

#### Scenario: No spec to show

- GIVEN `No docs/specs/ folder yet.` or `No active spec.`
- THEN the pane draws no cycle row
- AND the empty text stays as parent FR-16 states it

### FR-4: Hierarchy

The pane SHALL draw, in this order: a two-row header, a rule, the constitution and cycle block, a rule, the token block, and Next. Error rows sit at the end of the flow block, before the second rule.

| Row | Content |
|---|---|
| Header row 1 | `Akili` in bold, two spaces, the spec path |
| Header row 2 | The branch label in `inactive`, then ` · archived` when archived, then ` (n more active)` when other specs are active |
| Rule | `─` repeated to the row width, in `subtle` |
| Flow | All marks and both bars start in one column, the **mark column**: 17 characters come before it, or 13 from FR-7 step 6 |

- This replaces the one-row header of parent §8 and FR-16. The rule for shortening a long path with `…` stays.
- The `02` label moves from the `propose` row to the `Cycle` row.

#### Scenario: Inline pane

- GIVEN a pane seated inline above the prompt, with room for the full layout
- WHEN it opens
- THEN it asks for the rows the full layout needs, so Next is visible with no scrolling
- BUT a size the person set stays theirs

#### Scenario: Header before the first refresh

- GIVEN no refreshed view yet
- THEN the pane draws `Akili` and the token block
- BUT it draws no rule above an empty flow block

#### Scenario: No repository

- GIVEN a project with no git
- THEN header row 2 reads `(no git)`
- AND a detached HEAD reads `detached @<sha>` with no `⎇` (parent FR-11)

### FR-5: Token block

This replaces parent FR-12's single line. The pane SHALL draw two rows, each a label padded to the mark column, then its value:

| Row | Content | When missing |
|---|---|---|
| `ctx` | A bar, `<p>%`, then `<used>/<window>` | `—` with no bar |
| `session` | `<in> in / <out> out`, then ` · $<usd>` | `0 in / 0 out`; the `$` part is left out |

- Sources, sums and number shortening stay as parent FR-12 states them. The `Tokens:` prefix is removed.
- The bar fill and the tone both use `<p>` rounded to a whole number, so the figure and the colour never disagree.

| `<p>` | Fill tone |
|---|---|
| Below 80 | `suggestion` |
| 80 to 94 | `warning` |
| 95 and above | `error` |

Fill is `<p>` as a share of the bar, rounded. Any `<p>` above 0 fills at least one cell, and `<p>` of 100 or more fills the whole bar.

#### Scenario: Thresholds

- GIVEN `<p>` of 79, 80, 94 and 95 in turn
- THEN the tones are `suggestion`, `warning`, `warning` and `error`
- AND a raw fill of 79.6 reads `80%` in `warning`

#### Scenario: High context fill

- GIVEN `<p>` of 96
- THEN the bar uses the `error` tone
- BUT no toast, status line, sound or block follows (the parent's non-goal stands)

#### Scenario: Fresh session

- GIVEN no response yet
- THEN the `ctx` row's value is `—`, with no bar
- AND the `session` row's value is `0 in / 0 out`

### FR-6: Next button

The button SHALL read `Next: /<command> <args>` as parent FR-7 states, and SHALL stand out from the rows above it.

| Surface | Look |
|---|---|
| Terminal | A chip: `suggestion` fill, `inverseText` letters, bold, one space inside each end |
| Any other surface | The surface's own primary button |

#### Scenario: Press

- GIVEN the chip on the terminal
- WHEN the person presses it
- THEN the same command runs, once, as with the button it replaces
- AND a second press before the run starts adds nothing (parent FR-7)

#### Scenario: Run in progress

- GIVEN a press is pending
- THEN the label shows dim with no fill
- BUT the words do not change

#### Scenario: No next step

- GIVEN parent FR-7 gives no next command
- THEN no button is drawn

### FR-7: Narrow panes

No row SHALL be wider than `bodyColumns`, and no row wraps. When a pane cannot hold every part, parts leave in this order, stopping at the first step at which the constitution, cycle, flow and token rows all fit. If no step fits, the last step applies:

| Step | Leaves |
|---|---|
| 1 | Nothing |
| 2 | ` · $<usd>` |
| 3 | The `session` row |
| 4 | `<used>/<window>` |
| 5 | Both bars halve |
| 6 | The mark column moves from 17 to 13; the constitution label becomes `01 Constit…` |
| 7 | Both bars leave; `<done>/6` and `<p>%` stay |

A row still too wide after the last step is cut at its end with `…`. These stay whole down to the width shown:

| Width | Reads whole |
|---|---|
| 31 columns | `▶ (no task status)` |
| 24 columns | `▶ (blocked)`, `▶ (k/13)`, `<done>/6`, `<p>%` |
| 17 columns | `<done>/6`, `<p>%` |
| 14 columns | Every mark |

A long spec path or branch is shortened in the middle, as today.

#### Scenario: Under 60 columns

- GIVEN a pane of 30 columns and a blocked spec
- THEN every row fits
- AND `▶ (blocked)`, `2/6` and `<p>%` are all readable

#### Scenario: At 24 columns

- GIVEN a pane of 24 columns, a blocked spec and `<p>` of 100
- THEN the marks sit at column 13 and the bars have 6 cells
- AND `▶ (blocked)`, `2/6` and `100%` are whole

#### Scenario: Below 24 columns

- GIVEN a pane of 20 columns and a blocked spec
- THEN the blocked row is cut at its end with `…`
- BUT its mark, `2/6` and `<p>%` are whole

#### Scenario: Any width

- GIVEN any width from 1 to 120 and any state in FR-2
- THEN no row is wider than the width
- AND IT MUST hold for the longest spec path, branch and `(n more active)` tail in the fixtures

#### Scenario: No width given

- GIVEN `bodyColumns` missing or not positive
- THEN the ladder stays at step 1 and no row is cut
- AND a rule is 40 characters long

### FR-8: Read failures and empty text

`Could not read <path>: <reason>` rows SHALL use the `error` tone, with the wording and the limit of three from parent FR-16. Empty-state text stays dim, with its wording unchanged.

#### Scenario: A read fails

- GIVEN a file that cannot be read
- THEN its row uses the `error` tone
- AND the rest of the pane still draws

### FR-9: Behaviour stays the same

The pane's facts and actions SHALL NOT change.

#### Scenario: Same facts

- GIVEN any fixture spec tree
- THEN the phase marks, the spec shown, the branch and the next command equal today's
- BUT no new command, hook event, atom, file read or process appears
- AND `.claude/commands/` stays byte-identical

### FR-10: Docs match the pane

The plugin `README.md` and `docs/plugins/akili-panel.md` SHALL describe the new rows, and `CHANGELOG.md` → `Unreleased` SHALL describe the plugin as it ships.

#### Scenario: No stale format

- GIVEN the finished docs
- WHEN a reader looks for how the pane reads
- THEN no shipped doc quotes the `Tokens:` line, the one-row header or a `[ Next … ]` button

## 7. Non-Functional Requirements

| ID | Requirement | Measure |
|---|---|---|
| NFR-1 | The plugin names only theme keys and `transparent` | No hex and no colour name in `hooks/` |
| NFR-2 | Colour never carries meaning alone | With colour removed, the text of every row still states the state, `<done>/6` and `<p>%`, down to the widths FR-7 guarantees |
| NFR-3 | Light and dark both work | Human check on a dark and a light theme (T5) |
| NFR-4 | Drawing stays cheap | `ui.render` still reads atoms only, with no disk and no process (parent NFR-1) |
| NFR-5 | The minimum stays Claude Code 2.1.318 | Every prop used exists in the 2.1.318 types, and the transparent pane probe passed there |

## 8. Defect Classes and Gates

| # | Defect class this spec can produce | Gate that catches it |
|---|---|---|
| D-1 | Wrong tone, count, fill or threshold | `node --test` over the pure row builders |
| D-2 | A row wider than the pane, or parts leaving in the wrong order | `node --test`, swept over widths 1 to 120 and every state |
| D-3 | A raw colour slips in | Static contract test over `hooks/` |
| D-4 | Claude Code refuses the tree or a prop | `claude plugin validate`, and `claude plugin test` mounting on all four surfaces (local only: CI has no `claude`) |
| D-5 | **The painted look:** colours too close, weak contrast, wrong glyph width, an ugly pane | **No automated check can see it.** Substitute: JC's eyes at T1 and T5, on his own terminal and one light theme, at two widths |
| D-6 | Behaviour regressions: Next, observers, refresh | The existing `test/akili-panel-flow.test.js`, `test/akili-panel-contract.test.js` and `panel.test.tsx`, plus T5's press check |
| D-7 | Docs state an old format or a wrong claim | A sweep keyed on the claim, plus a quote check at HEAD (KZ-changes--kaizen-loop-closure-2, KZ-002) |

**Accepted risk:** the look on terminals other than JC's is not checked. Theme keys keep it reasonable there, and the marks keep it correct.

## 9. Requirement ID Index

| ID | Name | Source |
|---|---|---|
| FR-1 | Pane background | Proposal, Option A |
| FR-2 | Colour by state | Proposal; parent D5 kept |
| FR-3 | Cycle progress | Proposal |
| FR-4 | Hierarchy | Proposal; changes parent §8, FR-16 |
| FR-5 | Token block | Proposal, decision D3; replaces parent FR-12 |
| FR-6 | Next button | Proposal; parent FR-7 kept |
| FR-7 | Narrow panes | Proposal; extends parent FR-12, FR-16 |
| FR-8 | Read failures and empty text | Proposal; parent FR-16 kept |
| FR-9 | Behaviour stays the same | Proposal non-goals |
| FR-10 | Docs match the pane | Proposal scope |
