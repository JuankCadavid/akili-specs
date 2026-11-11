# akili-panel: the Claude Code side pane

`akili-panel` is a Claude Code plugin that keeps a side pane beside the chat. It shows where the active AKILI-SPECS spec stands and gives you a button for the next step, the session's model and a list of the skills AKILI ships. It only reads: it writes, moves or deletes no project file, and it starts no process. It is a plugin, not a skill, so it is outside the [skill inventory](../skills/README.md) (see [governance](../skills/governance.md#plugin-entries-are-not-skills)).

**Claude Code only**, version 2.1.318 or later. 2.1.318 is the plugin API it was built against; its tests ran on 2.1.319. No other AKILI target receives it.

## Quick path

1. Install it by one route (below), then restart Claude Code.
2. Type `/akili-panel`. The pane opens, or comes back if it is already open. It never opens unasked.
3. Work as usual. The pane refreshes after each `/akili-*` command (typed or run by the model), after each `/model`, after each finished turn, after `/clear`, and every 30 seconds while it is up.
4. Press the `Next:` button to run the next command as if you had typed it.
5. Press `Skills` to open the list, press a group, then press a skill to run it by name.

If Claude Code cannot place the pane, `/akili-panel` answers `Akili pane not shown: <reason>`.

## Install

Use **one** route per machine, not both. A duplicate load is not detected.

| Route | Command |
|---|---|
| With AKILI-SPECS | `akili install --tool claude`. It copies the plugin to `~/.claude/skills/akili-panel/` (`./.claude/skills/akili-panel/` with `--local`). |
| Marketplace | `/plugin install akili-panel --marketplace JuankCadavid/akili-specs`. It reads the marketplace file `.claude-plugin/marketplace.json` from that repository, so it works only once that file is pushed there. |

**Trust.** A plugin under a project's `.claude/skills/` loads only after you trust that project. The `~/.claude/skills` copy was observed loading in an already-trusted workspace; its behaviour in an untrusted one is unobserved. In the AKILI-SPECS repository itself the dogfood copy loads too, so do not add a second route there.

**Other tools.** `akili install --tool <opencode|antigravity|codex|cursor|grokbot>` does not copy it. If an older installer left a copy in one of their skills folders, `akili doctor` reports `LEAKED akili-panel`, and `akili install` or `akili doctor --fix` removes it. An invalid Grok Bot ownership record blocks that removal.

## What the pane shows

| Row | Reads as |
|---|---|
| Title | `AKILI` in the theme's `planMode` colour above the header, in three sizes. Two rows of half-block letters (`▄▀█ █▄▀ █ █   █` over `█▀█ █ █ █ █▄▄ █`) when the pane is at least 15 columns wide and has room for them above `Next`; one bold `AKILI` row from 5 to 14 columns, or when only one row is spare; none under 5 columns or when `Next` would leave the visible rows. Opening the Skills section never changes the size. |
| Header | The spec alone while a title shows (`Akili  <spec>` when none does), then the branch (`⎇ <branch>`), ` · archived` when the shown spec is archived and `(n more active)` when other specs are open. A detached HEAD reads `detached @<sha>`, no repository reads `(no git)`. A long spec path is cut in the middle with `…`. A `─` rule follows. |
| `01 Constitution` | `✓` all 13 baseline documents present, `▶ (k/13)` some, `○` none. |
| `02 Cycle` | A bar of six segments, one per phase, and `<done>/6`. |
| `propose` to `archive` | The six phases under the cycle row, marks in one column. The current one is highlighted. `(blocked)` follows `▶` when a task is blocked, and `(no task status)` when `tasks.md` has no status. |
| `Could not read <path>: <reason>` | A file could not be read, shown in the error colour. The rest still draws; at most three such lines show. |
| `No docs/specs/ folder yet.` or `No active spec.` | Replaces the cycle and phase rows when there is nothing to show. |
| `ctx` | A bar, `<p>%` and `<used>/<window>`, under a second `─` rule. The bar turns to the warning colour from 80% and the error colour from 95%. `—` before the first response. |
| `session` | Tokens summed from finished turns, `<in> in / <out> out`, then ` · $<cost>`, Claude Code's session cost. |
| `model` | The session's model id, or `model —` when Claude Code gives none. Cut in the middle with `…` when long. |
| `Next: /<command> <spec>` | The next step. On the terminal it is a filled chip; on other surfaces it is the surface's primary button. |
| `Skills (<n>) ▸` | Below `Next`, behind its own rule. Closed each time the pane opens, showing a count. Press it to open `▾` the groups `core`, `conditional` and `stack`, each with its count; press a group to open its skill names (one group open at a time); press a skill name to run it. Nothing is drawn when no skill is listed. |

A narrow pane drops parts in a fixed order: `$`, the `session` row, `<used>/<window>`, half of the bar, then `01 Constitution` is cut to `01 Constit…` and the label column narrows, then the bars go. Colours are the Claude Code theme's, and the pane asks for a transparent background; a surface may keep its own.

### The marks

| Mark | Meaning |
|---|---|
| `✓` | Done |
| `▶` | Current: the first phase not done |
| `○` | Not reached |

Which spec is shown: the one named by the last `/akili-*` command or Skill-tool run in this project (kept across sessions), else the spec matching the branch name, else the most recently edited.

## The Next button

| State | Button runs |
|---|---|
| Current phase is propose | `/akili-propose <spec>` |
| Current phase is specify | `/akili-specify <spec>` |
| Current phase is execute | `/akili-execute <spec>` |
| Current phase is test | `/akili-test <spec>` |
| Current phase is validate | `/akili-validate <spec>` |
| Current phase is archive | `/akili-archive <spec>` |
| No specs folder, or no active spec, Constitution not all present | `/akili-constitution` |
| No specs folder, or no active spec, Constitution all present | `/akili-propose` |
| Shown spec archived, others still active | `/akili-resume` |
| Shown spec archived, none other active | `/akili-propose` |

## The Skills section

| Part | Behaviour |
|---|---|
| List | The skills AKILI ships that this session can run: the plugin's catalog intersected with the commands the session lists. A skill the session cannot run is not shown. |
| Run | A press runs the skill by name with no arguments, through the same guard as `Next`. |
| Guard | Only one run is pending at a time: a press of `Next` or of a skill while one is pending does nothing. A refused run shows `Could not run /<command>: <reason>`. |
| Refresh | The model and the list are read again on each refresh (after `/model`, a finished turn, `/clear`, an `/akili-*` command, and every 30 seconds). |

When you add, remove or rebind a skill, update the catalog; see the [governance checklist](../skills/governance.md#acceptance-checklist-for-new-skills).

## Limits

- Pressing `Next` twice queues one run, and a skill press shares that guard. If Claude Code refuses a run, a message reads `Could not run /<command>: <reason>` and the pane is unchanged.
- Session token figures restart after `/clear` or a resume. The `$` figure is Claude Code's own: it restarts after `/clear` and, after a resume, counts from the first launch.
- It changes no command: an `/akili-*` command runs the same with or without the plugin.
