# akili-panel

A Claude Code side pane that shows where the active AKILI-SPECS spec stands, with a button for the next step, the session's model and the skills AKILI ships. It only reads: it never writes, moves or deletes a project file, and it starts no process.

Version `1.1.0`. Requires Claude Code 2.1.318 or later.

## Install

Pick one route per machine, not both.

| Route | Command |
|---|---|
| With AKILI-SPECS | `akili install --tool claude` (copies it to `~/.claude/skills/akili-panel/`; no other AKILI target receives it, because it is a Claude Code plugin, not a skill) |
| Marketplace | `/plugin install akili-panel --marketplace JuankCadavid/akili-specs` |

A plugin under a project's `.claude/skills/` loads only once you trust that project. In the AKILI-SPECS repository itself the dogfood copy loads too. A duplicate load is not detected.

## Use

1. Type `/akili-panel`. The pane opens, or comes back if it is already open. It never opens unasked.
2. Work as usual. The pane refreshes after each `/akili-*` command (typed or run by the model), after each `/model`, after each finished turn, after `/clear`, and every 30 seconds while the pane is up.
3. Press the `Next` button to run the next command as if you had typed it.
4. Press `Skills` to list the skills AKILI ships that this session can run, open a group, then press a skill to run it by name, with no arguments. The section is closed each time the pane opens.

If Claude Code cannot place the pane, `/akili-panel` answers `Akili pane not shown: <reason>`; the reason says why, for example that no surface that shows panes is attached.

## What each row means

| Row | Reads as |
|---|---|
| Title | `AKILI` in the theme's `planMode` colour above the header, in three sizes. Two rows of half-block letters (`▄▀█ █▄▀ █ █   █` over `█▀█ █ █ █ █▄▄ █`) when the pane is at least 15 columns wide and has room for them above `Next`; one bold `AKILI` row from 5 to 14 columns, or when only one row is spare; none under 5 columns or when `Next` would leave the visible rows. Opening the Skills section never changes the size |
| Header | The spec alone while a title shows (`Akili  <spec>` when none does), then the branch (`⎇ <branch>`), ` · archived` when the shown spec is archived and `(n more active)` when other specs are open. A detached HEAD reads `detached @<sha>`, and no repository reads `(no git)`. A long spec path is cut in the middle with `…`. A `─` rule follows |
| `01 Constitution` | `✓` all 13 baseline documents present, `▶ (k/13)` some, `○` none |
| `02 Cycle` | A bar of six segments, one per phase, and `<done>/6` |
| `propose` … `archive` | The six phases under the cycle row, marks in one column: `✓` done, `▶` current (highlighted) or `○` not reached. `(blocked)` follows `▶` when a task is blocked; `(no task status)` when `tasks.md` carries no status |
| `Could not read <path>: <reason>` | A file could not be read, shown in the error colour. The rest of the pane still draws; at most three such lines show |
| `No docs/specs/ folder yet.` / `No active spec.` | Replaces the cycle and phase rows when there is nothing to show |
| `ctx` | A bar, `<p>%` and `<used>/<window>`, under a second `─` rule. The bar turns to the warning colour from 80% and the error colour from 95%. `—` before the first response |
| `session` | Tokens summed from every finished turn (subagents included), `<in> in / <out> out`, then ` · $<cost>`, the session cost |
| `model` | The session's model id, or `model —` when Claude Code gives none. Cut in the middle with `…` when long |
| `Next: /<command> <spec>` | The next step, the same one `/akili-resume` reads, keyed on the first phase not done. On the terminal it is a filled chip; on other surfaces it is the surface's primary button |
| `Skills (<n>) ▸` | Below the `Next` button, behind its own rule. Closed at open: the row shows the count of the skills AKILI ships that this session can run. Press it to open `▾` the groups `core`, `conditional` and `stack`, each with its own count. Press a group to open its skill names; one group is open at a time. Press a skill name to run that skill. Nothing is drawn when none is listed |

A narrow pane drops parts in a fixed order: `$`, the `session` row, `<used>/<window>`, half of the bar, then `01 Constitution` is cut to `01 Constit…` and the label column narrows, then the bars go. Colours are the Claude Code theme's, and the pane asks for a transparent background; a surface may keep its own.

Which spec is shown: the one named by the last `/akili-*` command or Skill-tool run in this project (kept across sessions), else the spec matching the branch name, else the most recently edited.

## Limits

- Pressing `Next` twice queues one run. A skill press shares that single-run guard: while one run is pending, another press of `Next` or of a skill does nothing. If Claude Code refuses the run, a message reads `Could not run /<command>: <reason>` and the pane is unchanged.
- The skill list is the catalog of skills AKILI ships, kept in the plugin, intersected with the commands this session can run. A skill the session cannot run is not listed.
- Session token figures restart after `/clear` or a resume. The `$` figure is Claude Code's own: it restarts after `/clear` and, after a resume, counts from the first launch.
- It changes no command: an `/akili-*` command runs with the same name, arguments and result with or without the plugin.

Authored by Juan Carlos Cadavid, MIT License.
