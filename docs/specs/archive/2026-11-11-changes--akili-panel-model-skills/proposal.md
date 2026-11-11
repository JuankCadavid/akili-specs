# Proposal: akili-panel-model-skills — show the session's model and a collapsed Skills list in the Akili pane

**In one line:** add a `model` row to the pane's footer, and one `Skills ▸` row that opens, on a press, a short grouped list of the skills AKILI ships; pressing a skill runs it as if typed. Everything the pane shows and does today stays as it is.

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-panel-model-skills` |
| Slug | `akili-panel-model-skills` — derived from free-text argument; matches the branch name, so the pane itself picks this spec by branch |
| Type | Change |
| Deliverable | software |
| Approval Mode | `gated` (default). The brief says: *"Write the proposal and stop at the proposal gate. Do not implement yet."* |
| Status | **Approved** by JC (Juan Carlos Cadavid), 2026-11-10: «adelante apruebo», with the defaults for Q1–Q4 (see *Decisions After Approval*). Next phase: `/akili-specify` |
| Requirement source | JC's brief in this session, 2026-11-10: (1) *"Show the current session's model"*; (2) *"a collapsed, clickable 'Skills' entry that expands to list the skills AKILI ships and lets people invoke them from there"* — not all at once, because *"se vería feo"* |
| Visual source | None supplied. See *Visual Reference* |
| Source questions | **Asked at the gate (Q4) and answered by JC:** no Jira ticket, no Figma |
| Date | 2026-11-10 |
| Branch | `JuankCadavid/akili-panel-model-skills` at `af41538` (fresh from `origin/dev`, post-v2.43.0 sync). No push, merge or release in this phase |
| Parents | `docs/specs/archive/2026-11-06-changes--akili-panel/`, `docs/specs/archive/2026-11-09-changes--akili-panel-polish/` (both archived, shipped as plugin `1.0.0` in akili-specs `2.43.0`) |
| Depends on | none (parents merged) |
| Parallel-safe | No: edits `register.jsx`, `flow.mjs` and the pane tests |
| Release intent | Recorded only: plugin `1.1.0`, akili-specs minor (new user-facing behaviour). JC's call |

## Intent

The pane tells you where the spec stands and what to run next. JC wants two more things from it: which model this session is on, and a way to reach AKILI's skills without leaving the pane — without turning the pane into a long list.

## Problem / Current Behavior

`types:` means `types/claude-code.d.ts` of the bundled `plugin-authoring` skill, build **2.1.322** (`claude --version` → `2.1.322`). Code citations at `af41538`.

| # | Today | Evidence |
|---|---|---|
| P1 | The pane does not show the model anywhere. Its footer is `ctx` and `session` only | `flow.mjs:609-626` (`ctxRow`, `sessionRow`), `governedRows` `flow.mjs:628-637` |
| P2 | The host offers the model directly: `$.session.model()` "Returns the main loop's model, as `/model` shows it" | `types:2940-2943` |
| P3 | No plugin event fires on a model change. `session.measure` fires "after each main-thread turn"; `/model` is a slash command, so it should raise `command.run` with `command: 'model'` | `types:4686-4696`; the `command.run` claim for a **built-in** is `UNVERIFIED — confirm at source before relying on it` (probe P-A) |
| P4 | The pane's only action is Next, run through `$.command.run`, which runs a slash command "as if the person typed `/command args`" | `register.jsx` `press()`; `types:3266-3277` |
| P5 | `$.command.list()` returns "the slash commands the person can run now, built-in, plugin and MCP alike", each with `name`, `description`, `source` (`builtin` \| `plugin` \| `user` \| `mcp`) | `types:3257-3264`, `types:1776-1794`, `types:1935`. Whether installed **skills** appear in it, and with which `source`, is `UNVERIFIED — confirm at source before relying on it` (probe P-B) |
| P6 | AKILI ships 32 skills under `.claude/skills/` (33 folders minus the `akili-panel` plugin entry); each `SKILL.md` declares `metadata.binding`: 12 `core`, 9 `conditional`, 11 `stack` | `ls .claude/skills \| wc -l` → 33; `grep -n "binding:" .claude/skills/*/SKILL.md` counted at `af41538` (the tdd row is a prose mention of `conditional`, counted under it) — re-run at specify (KZ-002) |
| P7 | The pane opens at `rows: 16`, the full layout's height; a size the person sets stays theirs. 32 skill rows cannot show at once | `register.jsx:13`, `register.jsx:171`; polish FR-4 |
| P8 | The pane has no expand/collapse element; the host has none for panes either. A press that flips an `atom` redraws its readers, which is enough to build one | `reference.md` (atoms: "the write redraws the readers"); band `isCollapsed` (`types:11241-11245`) is band-only |

## Proposed Outcome

| # | Behaviour |
|---|---|
| O1 | A `model` row in the footer, beside `ctx` and `session`, showing `$.session.model()` as `/model` shows it. It updates after each turn, after `/model`, after `/clear` or resume, and on the 30 s tick |
| O2 | One row `Skills (32) ▸` (count = installed AKILI skills), collapsed by default and after every session start. Pressing it turns it to `Skills ▾` and shows the **three groups**, each itself collapsed: `core (12) ▸`, `conditional (9) ▸`, `stack (11) ▸` |
| O3 | Pressing a group opens it and closes any other open group (one group open at a time, so at most 12 skill rows show) |
| O4 | Each skill row is a button. Pressing it runs `/<skill>` with no arguments, through the same path, double-press guard and refusal toast as Next |
| O5 | Only skills that are both in AKILI's catalog **and** runnable in this session (present in `$.command.list()`) are listed; a missing one is left out, not shown broken |
| O6 | Everything else is unchanged: themes and tones, transparent background, header, constitution, cycle and phase rows, the Next chip, the narrow-pane ladder's existing steps, read-only disk reads, no process started |

## Scope

- `flow.mjs`: model row builder; Skills section builder (collapsed, groups, open group); catalog of AKILI skills with their binding; ladder steps for the new rows.
- `register.jsx`: read `$.session.model()` on refresh; observe `command.run` `model`; two new atoms (`skillsOpen`, `openGroup`); skill press through the existing press path; `$.command.list()` read once per refresh (cached).
- `types/index.d.ts`: the new atoms.
- Catalog source: generated from `.claude/skills/*/SKILL.md` (`name`, `metadata.binding`) into the plugin at release or by a test-guarded constant; a test fails when the catalog and the folder disagree.
- Tests: `test/akili-panel-*.test.js` and `.claude/skills/akili-panel/tests/panel.test.tsx`.
- Docs: plugin README, `docs/plugins/akili-panel.md`, `CHANGELOG.md` (Unreleased), `plugin.json` version.

## Non-Goals

- Listing AKILI **commands** (`/akili-*`) in the Skills section: Next already drives the flow. (Q2 if JC wants them.)
- Listing non-AKILI skills (the person's own, other plugins').
- Passing arguments to a skill from the pane, or a search box.
- Changing the model from the pane (it shows, never sets).
- Any change to install, `doctor`, marketplace, or other install targets; any `.claude/commands/` change.
- Restyling existing rows.

## Affected Users, Systems, And Specs

| Area | Impact |
|---|---|
| Claude Code users of `akili-panel` | Two new visible things; nothing removed |
| Other install targets | None (plugin is Claude Code only) |
| `akili install` / `update` | Copies the new plugin files as today; the catalog file, if generated, must be in the package |
| Parent specs | Extends FR-4 (layout height), FR-7 (ladder), FR-7/press guard of the parents; no parent requirement is reversed |

## Visual Reference

- Source: None (no Figma, no mockup).
- Location: —
- Notes: offered at the gate (Q4): a self-contained text sketch of the three states (collapsed, open, group open) under `docs/specs/changes/akili-panel-model-skills/mockup/`, or skip and let `/akili-specify` carry it in `design.md`. No screenshots will be taken.

Sketch of the intended rows (terminal, full width):

```text
ctx       ━━━━━━──────  48%  480k/1M
session   12k in / 3k out · $0.42
model     claude-opus-5-5
─────────────────────────────────────
Skills ▾
  core (12) ▾
    brainstorming
    caveman
    …
  conditional (9) ▸
  stack (11) ▸
─────────────────────────────────────
 Next: /akili-specify changes/…
```

## Requirement Delta Preview

### ADDED Requirements

- The pane shows the main loop's model in a `model` row and keeps it current (O1).
- The pane shows a collapsed `Skills` row that opens to grouped, collapsed skill lists; one group open at a time (O2, O3).
- Pressing a skill runs it as typed, guarded and reported like Next (O4).
- Listed skills = AKILI catalog ∩ runnable now (O5).

### MODIFIED Requirements

- Layout height (polish FR-4): the pane's natural height grows only while Skills is open; collapsed, the pane gains 2 rows (`model`, `Skills ▸`).
- Narrow-pane ladder (polish FR-7): new steps for the `model` row and the Skills section; the existing steps keep their order.

### REMOVED Requirements

- None.

## Approach Options

| Option | How | For | Against |
|---|---|---|---|
| **A. Grouped two-level disclosure (recommended)** | `Skills ▸` → three binding groups → one group's skills | Never more than ~16 extra rows; groups are AKILI's own taxonomy (`docs/skills/governance.md`); fits the 16-row pane with one group open | Two presses to reach a skill |
| B. One-level list with paging | `Skills ▸` → 8 skills per page, `‹ ›` buttons | One press to start | Paging in a terminal pane is clumsy; order is arbitrary; 4 pages |
| C. Separate "Skills" pane | `/akili-panel` opens a second pane on press | Main pane untouched in height | Two panes to manage; seating rules (110/144 cols) make the second one unreliable; more host surface |

**Catalog source, within A:**

| Sub-option | For | Against |
|---|---|---|
| A1. Constant in `flow.mjs`, guarded by a test against `.claude/skills/*/SKILL.md` (recommended) | No disk read at runtime; pane stays reading the project only | Must be updated when a skill is added — the test forces it |
| A2. Read installed `~/.claude/skills/*/SKILL.md` at runtime | Always current | Reads outside the project (parents' FR-10 reads the project only); cannot tell AKILI's skills from the person's own |

**Model freshness:** refresh on `turn.complete`, `session.end` (`clear`/`resume`), the 30 s tick, and a `command.run` observer on `model` — the existing pattern (DD-4). If probe P-A shows `/model` raises no `command.run`, the next turn or tick catches it (≤ 30 s stale).

## Recommended Approach

**A with A1.** It is the smallest change that satisfies "collapsed, press to see, use from there" without a second pane or new disk reads, keeps every current row and behaviour, and reuses the Next press path (guard, toast, queued run) for skill runs.

## Risks, Dependencies, And Open Questions

| # | Item | Handling |
|---|---|---|
| R1 | `$.command.run` may refuse a **skill** name, or skills may not be in `$.command.list()` (P-B) | Probe first thing at `/akili-specify` (Premise Ledger, executed not predicted — KZ-changes--leader-brief-contract-2). If refused: Pivot to running via `$.session.send`-style prompt or drop O4; JC decides |
| R2 | `/model` may not raise `command.run` (P-A) | Fallback already in the approach (turn / tick) |
| R3 | Pane height: an open group adds up to 16 rows; a person-set size may hide them | Design picks: scroll inside the pane vs. `rows` re-request on open; probe in specify |
| R4 | Catalog drift when a skill is added/removed | Test guard (A1); also guards counts quoted in docs (KZ-002: re-run counts before writing them) |
| R5 | Tests must not read `docs/specs/changes/...` | KZ-changes--archify-diagrams-1 |
| R6 | Keyboard reach of the new buttons and their order with Next | Covered in design; Next keeps first `hotkey`/focus priority |
| Q1 | Group by binding (`core`/`conditional`/`stack`) as recommended, or by purpose (method / design / backend / domain)? | Default: binding |
| Q2 | Include the 14 `/akili-*` commands as a fourth group? | Default: no (Non-Goal) |
| Q3 | Model row text: full id (`claude-opus-5-5`) as `/model` shows it, or short alias (`opus 5.5`)? | Default: as `/model` shows it (P2) |
| Q4 | Jira ticket or Figma? And do you want a text mockup of the three states before specify? | Default: none; mockup in `design.md` |

## Decisions After Approval

JC, 2026-11-10: «adelante apruebo» — proposal approved with every default.

| # | Decision |
|---|---|
| Q1 | Group skills by binding: `core` / `conditional` / `stack` |
| Q2 | No `/akili-*` commands group (stays a Non-Goal) |
| Q3 | Full model id, as `/model` shows it |
| Q4 | No Jira, no Figma; the text mockup of the three states (collapsed, open, group open) goes in `design.md` |

## Success Criteria

- The `model` row matches what `/model` shows, within one turn or 30 s after a change.
- Collapsed, the pane adds exactly two rows; every pre-existing row, tone, and the Next chip render identically (snapshot tests of 1.0.0 states stay green with only the added rows).
- `Skills` opens and closes on press; at most one group open; each listed skill runs on press like a typed `/<skill>`, double press runs once, refusal shows a toast.
- Catalog test fails when `.claude/skills/` and the catalog disagree.
- `npm test`, `npm run verify:cli`, `npm run pack:dry-run`, `claude plugin test` green; JC's live check on the terminal (no screenshots).

## Next Step

```text
/akili-specify changes/akili-panel-model-skills
```
