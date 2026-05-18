# CLI Reference

The `sdd-jc` CLI installs the JCSPECS command prompts, skills, and helper resources into Claude Code, OpenCode, or both.

## Install

Run directly from npm:

```bash
pnpm dlx sdd-jc-methodology install --tool claude
pnpm dlx sdd-jc-methodology install --tool opencode
pnpm dlx sdd-jc-methodology install --tool both
```

Claude is the default target:

```bash
pnpm dlx sdd-jc-methodology install
```

Use a persistent global install if preferred:

```bash
pnpm add -g sdd-jc-methodology
sdd-jc install --tool both
```

## Commands

| Command | Purpose |
|---|---|
| `sdd-jc install` | Install commands, skills, and helper resources |
| `sdd-jc update` | Reinstall packaged commands, skills, and helper resources |
| `sdd-jc list` | List packaged commands, skills, and helper resources |
| `sdd-jc doctor` | Check whether expected files are installed |
| `sdd-jc help` | Show help |

## Options

| Option | Applies To | Purpose |
|---|---|---|
| `--tool claude` | install, update, doctor | Target Claude Code config |
| `--tool opencode` | install, update, doctor | Target OpenCode config |
| `--tool both` | install, update, doctor | Target Claude and OpenCode |
| `--target <path>` | single-tool install/update/doctor | Override the selected tool target directory |
| `--claude-target <path>` | `--tool both` | Override Claude target directory |
| `--opencode-target <path>` | `--tool both` | Override OpenCode target directory |
| `--force` | install, update | Overwrite existing files |
| `--dry-run` | install, update | Show planned writes without writing files |
| `--commands-only` | install, update, doctor | Only install or check commands |
| `--skills-only` | install, update, doctor | Only install or check skills |

`--commands-only` and `--skills-only` are mutually exclusive.

## Install Targets

Default targets:

```text
Claude:   ~/.claude
OpenCode: ~/.config/opencode
```

Claude install layout:

```text
~/.claude/commands/
~/.claude/skills/
~/.claude/sdd-jc/scripts/
~/.claude/sdd-jc/.mcp.json.example
```

OpenCode install layout:

```text
~/.config/opencode/commands/
~/.config/opencode/skills/
~/.config/opencode/sdd-jc/scripts/
~/.config/opencode/sdd-jc/.mcp.json.example
```

Restart Claude Code or OpenCode after install/update so running sessions load new commands and skills.

## Safety Rules

- Existing files are skipped by default.
- Use `--force` to overwrite old installed files.
- Use `--dry-run` before changing custom targets.
- `update` is intentionally the same safe copy behavior as `install` unless `--force` is provided.

## Examples

Preview a both-tool install:

```bash
sdd-jc install --tool both --dry-run
```

Install Claude commands into a local project folder:

```bash
sdd-jc install --tool claude --target ./.claude
```

Install both tools into custom directories:

```bash
sdd-jc install --tool both --claude-target ./.claude --opencode-target ./.opencode
```

Update OpenCode skills only:

```bash
sdd-jc update --tool opencode --skills-only --force
```

Check both installs:

```bash
sdd-jc doctor --tool both
```

## Packaged Resources

The CLI installs helper resources under the target `sdd-jc/` directory:

| Resource | Purpose |
|---|---|
| `scripts/gsc_verify.py` | Google Site Verification helper used by `/sdd-seo` |
| `.mcp.json.example` | Example MCP config for the Google Search Console MCP server |

## Troubleshooting

If commands do not appear in your AI tool:

- Run `sdd-jc doctor --tool <claude|opencode|both>`.
- Restart Claude Code or OpenCode.
- Confirm the target directory is the one your tool reads.
- Re-run with `--force` if older files should be replaced.

If helper resources are missing:

- Run `sdd-jc doctor --tool <target>` without `--commands-only` or `--skills-only`.
- Re-run `sdd-jc install --tool <target> --force`.
