# Requirements: akili-panel-model-skills — the session's model and a collapsed Skills list in the Akili pane

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-panel-model-skills` |
| Depth | **Standard, kept compact** (new behaviour in a shipped plugin; no install, data or auth change) |
| Type | Change |
| Deliverable | `software` |
| Approval Mode | `gated`. Every phase gate stops for JC |
| Status | **Approved** by JC (Juan Carlos Cadavid), 2026-11-10: «Continúa al diseño (design.md)» (option 1, Continue) |
| Date | 2026-11-10 |
| Proposal | `proposal.md`, approved by JC 2026-11-10: «adelante apruebo», Option A + A1, defaults Q1–Q4 (its *Decisions After Approval*) |
| Parent specs | `docs/specs/archive/2026-11-06-changes--akili-panel/` (`parent FR-n`), `docs/specs/archive/2026-11-09-changes--akili-panel-polish/` (`polish FR-n`) |
| Format source | `docs/specs/archive/2026-11-09-changes--akili-panel-polish/requirements.md`. There is no `docs/specs/general-setup/` in this repo |
| Baseline docs | None in this repo (`docs/prd.md`, `docs/ux-ui/design.md`, `docs/trd/trd.md` absent). Root `AGENTS.md` is the reference |
| Verified at | `8e8c5ba` |
| Host | Claude Code 2.1.322 (`claude --version`); plugin requires ≥ 2.1.318 (README) |
| Branch | `JuankCadavid/akili-panel-model-skills`. No push, PR, merge, tag or publish in this phase |

## 2. Executive Summary

The pane gains two things and loses nothing:

1. A **`model` row** that shows the main loop's model as `/model` shows it.
2. A **`Skills` row**, closed by default. A press opens three closed groups — `core`, `conditional`, `stack` — and a press on a group shows its skills. One group is open at a time. A press on a skill runs it as if typed.

Themes, tones, the transparent background, every existing row, the Next button, the narrow-pane ladder and the read-only, project-only disk reads stay as they ship in plugin `1.0.0`.

## 3. Glossary

| Term | Meaning |
|---|---|
| Catalog | The list of skills AKILI ships, each with its `metadata.binding` (`core`, `conditional`, `stack`), carried inside the plugin |
| Runnable | A command name present in `$.command.list()` at the last refresh |
| Listed skill | A catalog skill that is runnable (catalog ∩ runnable) |
| Group | The listed skills of one binding |
| Skills section | The `Skills` row plus, while open, its group rows and the open group's skill rows |
| Press path | What Next does today: one atomic `pending` guard, `$.command.run`, a toast on refusal (parent FR-7, `register.jsx` `press()`) |

## 4. System Context & Scope

| Today (plugin `1.0.0`) | Evidence |
|---|---|
| The footer is `ctx` and `session`; no row shows the model | `flow.mjs:609-626`, `governedRows` `flow.mjs:628-637` |
| The host returns the main loop's model as `/model` shows it, a full id | `types:2940-2943`; probe at 2.1.322: `PROBE model=claude-haiku-5-5` (scratchpad `debug1.log`) |
| Installed skills appear in `$.command.list()` with `source: "user"`; `/model` with `source: "builtin"` | Same probe: `picks=[["brainstorming","user",null],…,["tdd","user",null],["akili-propose","user",null],["model","builtin",null]]`, `sources={"user":102,"builtin":56,"plugin":36,"mcp":2}` |
| `$.command.run` cannot run headless (`claude -p`): "no session is bound in this process" | Same probe. Whether it runs a **skill** interactively is `UNVERIFIED — confirm at source before relying on it` (design Premise Ledger) |
| Whether `/model` raises `command.run` for a plugin observer | `UNVERIFIED — confirm at source before relying on it` |
| Next is the pane's only action | `register.jsx` `press()`, `draw()` |
| AKILI ships 32 skills (33 folders under `.claude/skills/` minus the `akili-panel` plugin entry) | `ls .claude/skills \| wc -l` → 33 at `af41538`; per-binding counts are pinned by the catalog test (FR-5), not restated here (KZ-002) |

**In scope:** pane rows and presses; the catalog; tests; plugin README, `docs/plugins/akili-panel.md`, `CHANGELOG.md`, `plugin.json` version.
**Out of scope:** `/akili-*` commands as a group (Q2), non-AKILI skills, skill arguments, search, setting the model, installer, other install targets, `.claude/commands/`, restyling existing rows.

## 5. Stakeholders / Personas

| Who | Needs |
|---|---|
| JC and AKILI users on Claude Code | See the model at a glance; reach AKILI's skills without typing their names; a pane that still looks the same |
| Maintainers | A catalog that cannot drift silently from `.claude/skills/` |

## 6. Functional Requirements

### FR-1: Model row

The pane SHALL show a `model` row in the footer block, after `session`, reading `model` in the label column and the value of `$.session.model()` as returned.

#### Scenario: Shown

- GIVEN the pane is open and the session runs `claude-opus-5-5`
- WHEN the pane draws
- THEN a row reads `model` then `claude-opus-5-5`
- BUT it must NOT rename, shorten to an alias or translate the id at full width
- AND IT MUST use the same label column width and the default text tone as `ctx` and `session`

#### Scenario: Model changes

- GIVEN the row shows model A
- WHEN the person switches to model B with `/model`
- THEN the row shows B no later than the end of the next main-loop turn or the next 30 s tick, whichever comes first
- AND IT MUST also re-read after `/clear` and resume

#### Scenario: Model unknown

- GIVEN `$.session.model()` rejects or returns an empty string
- THEN the row reads `model —`
- BUT it must NOT hide the rest of the pane or raise a toast

### FR-2: Skills row, closed by default

The pane SHALL show one `Skills (<n>) ▸` row, where `<n>` is the number of listed skills, closed at every session start and every pane open.

#### Scenario: Closed

- GIVEN the pane opens
- THEN it shows `Skills (<n>) ▸` and no group or skill rows
- BUT it must NOT list any skill until the person presses the row

#### Scenario: Open and close

- GIVEN the Skills row is closed
- WHEN the person presses it
- THEN it reads `Skills (<n>) ▾` and the group rows follow, each closed
- AND pressing it again closes the whole section, groups included

#### Scenario: Nothing listed

- GIVEN no catalog skill is runnable, or `$.command.list()` rejected
- THEN the Skills row is not drawn
- AND IT MUST NOT show an error line for it (the rest of the pane is unchanged)

### FR-3: Groups, one open at a time

The open Skills section SHALL show three group rows in the order `core`, `conditional`, `stack`, each `<binding> (<k>) ▸` or `▾`, indented under `Skills`. A group with no listed skill is not drawn.

#### Scenario: Open a group

- GIVEN the section is open and every group closed
- WHEN the person presses `core (<k>) ▸`
- THEN `core` reads `▾` and its listed skills follow it, one per row, in alphabetical order, indented one step deeper

#### Scenario: Open another group

- GIVEN `core` is open
- WHEN the person presses `stack (<k>) ▸`
- THEN `stack` opens and `core` closes
- BUT it must NOT ever show two groups open

#### Scenario: Close the open group

- GIVEN `core` is open
- WHEN the person presses `core (<k>) ▾`
- THEN no group is open

### FR-4: A press on a skill runs it

A press on a skill row SHALL run `/<skill>` with no arguments through the press path, as if the person typed it.

#### Scenario: Run

- GIVEN the `core` group shows `brainstorming`
- WHEN the person presses it
- THEN Claude Code runs `/brainstorming` exactly as if typed
- AND the Skills section stays as it was (open, same group)

#### Scenario: Double press

- GIVEN a run queued by the pane (Next or a skill) has not settled
- WHEN the person presses any skill row or Next
- THEN no second run is queued
- AND IT MUST show the pending run's row dimmed, as Next is today

#### Scenario: Refused

- GIVEN Claude Code refuses the run
- THEN a toast reads `Could not run /<skill>: <reason>` and the pane is otherwise unchanged

### FR-5: Which skills are listed

The listed skills SHALL be exactly the catalog skills whose name is in `$.command.list()` at the last refresh. The catalog SHALL match the skill folders under `.claude/skills/` (a folder with `SKILL.md`; plugin entries excluded) and each skill's `metadata.binding`.

#### Scenario: Catalog matches the package

- GIVEN a skill folder is added to, removed from or rebound in `.claude/skills/`
- WHEN `npm test` runs without a catalog update
- THEN a test fails naming the skill
- BUT it must NOT pass because both sides were derived from the same source in the test

#### Scenario: Not installed here

- GIVEN `kaizen` is in the catalog but not in `$.command.list()`
- THEN `kaizen` is not listed and the counts exclude it

#### Scenario: Read only

- GIVEN any refresh
- THEN the pane reads no file outside the project to build the list
- AND IT MUST start no process (parent FR-10)

### FR-6: Narrow panes

The new rows SHALL follow the polish FR-7 ladder and never exceed the pane's body width.

#### Scenario: Model id too long

- GIVEN the model row does not fit
- THEN the id is cut in the middle with `…`, after the label column has narrowed as the ladder already narrows it
- BUT it must NOT be dropped while at least 14 columns are available

#### Scenario: Skills rows too long

- GIVEN a skill or group row does not fit
- THEN its text is cut at the end with `…`, keeping the `▸`/`▾` mark where the row has one
- AND IT MUST NOT change the order or number of existing ladder steps for the pre-existing rows

### FR-7: Height

Closed, the pane's natural height SHALL grow by exactly two rows (`model`, `Skills`) plus one rule if the design adds one. Open, every listed skill of the open group SHALL be reachable by the person, whether by the pane growing or by scrolling within it.

#### Scenario: Tallest open state

- GIVEN the pane at its opening height and the largest group open
- THEN every skill row of that group can be reached and pressed
- BUT a size the person set stays theirs (polish FR-4)

### FR-8: Everything else unchanged

Every row, tone, mark, string, background, refresh trigger and the Next behaviour of plugin `1.0.0` SHALL stay as shipped.

#### Scenario: Same facts

- GIVEN the parent and polish fixture states
- WHEN the pane draws with the Skills row closed
- THEN every pre-existing row's text and tone is identical to `1.0.0`, and the only added rows are `model` and `Skills` (and a rule if the design adds one)
- BUT it must NOT change any `/akili-*` command's name, arguments or result

### FR-9: Docs and version

The plugin README, `docs/plugins/akili-panel.md` and `CHANGELOG.md` (Unreleased) SHALL describe the model row and the Skills section as shipped; `plugin.json` SHALL read `1.1.0`.

#### Scenario: No stale text

- GIVEN the docs after this change
- THEN the row table names `model` and `Skills`, and no sentence still says Next is the pane's only action or the footer is `ctx` and `session` only

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | Theme keys only; no new colour values; marks and text carry meaning without colour (polish NFR-1, NFR-2) |
| NFR-2 | The render hook reads atoms only; `$.command.list()` and `$.session.model()` are called from refresh, never while drawing (polish NFR-4) |
| NFR-3 | One extra host call each per refresh at most (`model`, `command.list`); refreshes stay coalesced (parent DD-5) |
| NFR-4 | Works on Claude Code 2.1.318 and later; a host without `$.session.model` or `$.command.list` degrades per FR-1 *Model unknown* and FR-2 *Nothing listed* |
| NFR-5 | Every hook still calls `next(e)` first and works on the clock (parent W-4); any new observer `.catch`es to `next(e)` |

## 8. Defect Classes and Gates

| Defect class | Gate |
|---|---|
| Wrong row text, order, counts, open/closed state, ladder width | `npm test` (`flow.mjs` pure row builders, fixture states) |
| Tree the host refuses; press wiring; one-group rule; double-press guard | `claude plugin test .claude/skills/akili-panel` on 2.1.318 and current |
| Catalog drift from `.claude/skills/` | `npm test` catalog test (falsified by removing one catalog entry) |
| Regressions in pre-existing rows | `npm test` and `claude plugin test` 1.0.0 cases kept green, with only the added rows changed |
| A skill press does not run the skill on a real host; `/model` not reflected; height/scroll unreachable rows | **No automated check** (`$.command.run` is unavailable headless). Substitute: live interactive check in the terminal (Orca `orca terminal read --screen`, no screenshots) plus JC's own check at the HITL pause |
| Visual fit with the current look (themes, light/dark) | **No automated check.** Substitute: JC's check at the HITL pause, as in polish |
| Package hygiene (catalog file shipped, tests) | `npm run pack:dry-run`, `npm run verify:cli` |

## 9. Requirement ID Index

| ID | Title |
|---|---|
| FR-1 | Model row |
| FR-2 | Skills row, closed by default |
| FR-3 | Groups, one open at a time |
| FR-4 | A press on a skill runs it |
| FR-5 | Which skills are listed |
| FR-6 | Narrow panes |
| FR-7 | Height |
| FR-8 | Everything else unchanged |
| FR-9 | Docs and version |
| NFR-1 … NFR-5 | §7 |
