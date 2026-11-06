# akili-panel

A Claude Code plugin that adds a side pane showing where the active AKILI-SPECS spec stands.

**Status: under construction.** This folder is the plugin scaffold. It loads, registers no hook and shows nothing yet.

- Requires Claude Code 2.1.318 or later.
- `akili install --tool claude` copies it into `~/.claude/skills/akili-panel/`; no other AKILI target receives it, because it is a Claude Code plugin and not a skill.
- A plugin under a project's `.claude/skills/` loads only once you trust that project.
- Use one delivery route per machine: either `akili install --tool claude` or a marketplace install, not both.

Authored by Juan Carlos Cadavid, MIT License.
