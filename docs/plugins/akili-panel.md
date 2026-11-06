# akili-panel: the Claude Code side pane

`akili-panel` is a Claude Code plugin that keeps a side pane beside the chat. It shows where the active AKILI-SPECS spec stands and gives you one button for the next step. It only reads: it writes, moves or deletes no project file, and it starts no process. It is a plugin, not a skill, so it is outside the [skill inventory](../skills/README.md) (see [governance](../skills/governance.md#plugin-entries-are-not-skills)).

**Claude Code only**, version 2.1.318 or later. 2.1.318 is the plugin API it was built against; its tests ran on 2.1.319. No other AKILI target receives it.

## Quick path

1. Install it by one route (below), then restart Claude Code.
2. Type `/akili-panel`. The pane opens, or comes back if it is already open. It never opens unasked.
3. Work as usual. The pane refreshes after each `/akili-*` command (typed or run by the model), after each finished turn, and every 30 seconds while it is up.
4. Press the `Next:` button to run the next command as if you had typed it.

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
| Header | `Akili · <spec> · ⎇ <branch>`, plus `(n more active)` when other specs are open and `archived` when the shown spec is archived. A detached HEAD reads `detached @<sha>`, no repository reads `(no git)`. A long spec path is cut in the middle with `…`. |
| `01 Constitution` | `✓` all 13 baseline documents present, `▶ (k/13)` some, `○` none. |
| `02 propose` to `archive` | The six phases. The current one is bold. `(blocked)` follows `▶` when a task is blocked, and `(no task status)` when `tasks.md` has no status. |
| `Could not read <path>: <reason>` | A file could not be read. The rest still draws; at most three such lines show. |
| `No docs/specs/ folder yet.` or `No active spec.` | Replaces the phase rows when there is nothing to show. |
| `Tokens: ctx 12% (120k/1.0M) · session 3.4k in / 410 out · $0.52` | Context fill, tokens summed from finished turns, and Claude Code's session cost. `ctx —` before the first response. A narrow pane drops `$`, then `session`. |
| `Next: /<command> <spec>` | The button. |

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

## Limits

- Pressing the button twice queues one run. If Claude Code refuses it, a message reads `Could not run /<command>: <reason>` and the pane is unchanged.
- Session token figures restart after `/clear` or a resume. The `$` figure is Claude Code's own: it restarts after `/clear` and, after a resume, counts from the first launch.
- It changes no command: an `/akili-*` command runs the same with or without the plugin.
