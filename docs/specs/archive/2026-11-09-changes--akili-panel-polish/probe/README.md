# Pane probe

Evidence for `design.md` P-1, P-2, P-6, P-7, P-9 and P-10, and the tool T1 uses. It is not part of the plugin and is not shipped.

| Path | What it is |
|---|---|
| `mod/` | A small Claude Code plugin that draws the theme keys, both bar glyphs and the chip. `/probe-gray` opens it with the host's background, `/probe-clear` with a transparent one, `/probe-focus` transparent and focused |
| `run.sh` | Drives a real session in `tmux` and saves what it paints |
| `captures/` | The saved output of the last run, on Claude Code 2.1.319 and 2.1.318, with `theme = dark-ansi` |

Re-run from the repository root; `tmux` is required:

```text
docs/specs/changes/akili-panel-polish/probe/run.sh <claude binary> <trusted folder> <out dir>
docs/specs/changes/akili-panel-polish/probe/run.sh <claude binary> <trusted folder> <out dir> clear-2.1.318
claude plugin test docs/specs/changes/akili-panel-polish/probe/mod
```

Reading a capture: `tmux capture-pane -e` writes only colour changes, so a cell can inherit the colour of the cell before it. Walk the codes in order rather than reading one cell alone. Every run here is a docked pane.
