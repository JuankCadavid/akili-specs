# akili-panel

A Claude Code side pane that shows where the active AKILI-SPECS spec stands, with one button for the next step. It only reads: it never writes, moves or deletes a project file, and it starts no process.

Version `1.0.0`. Requires Claude Code 2.1.318 or later.

## Install

Pick one route per machine, not both.

| Route | Command |
|---|---|
| With AKILI-SPECS | `akili install --tool claude` (copies it to `~/.claude/skills/akili-panel/`; no other AKILI target receives it, because it is a Claude Code plugin, not a skill) |
| Marketplace | `/plugin install akili-panel --marketplace JuankCadavid/akili-specs` |

A plugin under a project's `.claude/skills/` loads only once you trust that project. In the AKILI-SPECS repository itself the dogfood copy loads too. A duplicate load is not detected.

## Use

1. Type `/akili-panel`. The pane opens, or comes back if it is already open. It never opens unasked.
2. Work as usual. The pane refreshes after each `/akili-*` command (typed or run by the model), after each finished turn, and every 30 seconds while the pane is up.
3. Press the button to run the next command as if you had typed it.

If Claude Code cannot place the pane, `/akili-panel` answers `Akili pane not shown: <reason>`; the reason says why, for example that no surface that shows panes is attached.

## What each row means

| Row | Reads as |
|---|---|
| Header | `Akili · <spec> · ⎇ <branch>`, plus `(n more active)` when other specs are open and `archived` when the shown spec is archived. A detached HEAD reads `detached @<sha>`, and no repository reads `(no git)`. A long spec path is cut in the middle with `…` |
| `01 Constitution` | `✓` all 13 baseline documents present, `▶ (k/13)` some, `○` none |
| `02 propose` … `archive` | The six phases, each `✓` done, `▶` current (bold) or `○` not reached. `(blocked)` follows `▶` when a task is blocked; `(no task status)` when `tasks.md` carries no status |
| `Could not read <path>: <reason>` | A file could not be read. The rest of the pane still draws; at most three such lines show |
| `No docs/specs/ folder yet.` / `No active spec.` | Replaces the phase rows when there is nothing to show |
| `Tokens: ctx 12% (120k/1.0M) · session 3.4k in / 410 out · $0.52` | Context fill, tokens summed from every finished turn (subagents included), and the session cost. `ctx —` before the first response. A narrow pane drops `$`, then `session` |
| `Next: /<command> <spec>` | The button. It reads the same next step as `/akili-resume`, keyed on the first phase not done |

Which spec is shown: the one named by the last `/akili-*` command or Skill-tool run in this project (kept across sessions), else the spec matching the branch name, else the most recently edited.

## Limits

- Pressing the button twice queues one run. If Claude Code refuses the run, a message reads `Could not run /<command>: <reason>` and the pane is unchanged.
- Session token figures restart after `/clear` or a resume. The `$` figure stays Claude Code's own total.
- It changes no command: an `/akili-*` command runs with the same name, arguments and result with or without the plugin.

Authored by Juan Carlos Cadavid, MIT License.
