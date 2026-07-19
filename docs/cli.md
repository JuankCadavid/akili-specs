# CLI Reference

The `akili` CLI installs the AKILI command prompts, skills, and helper resources into Claude Code, OpenCode, Google Antigravity, or multiple tools.

## Install

### Interactive Mode (Recommended)

Run the CLI without arguments or use the `init` command to launch an interactive wizard. It will guide you through selecting the target tools and choosing between global or local installation:

```bash
npx akili-specs
# or
akili init
```

### Manual Installation

Run directly from npm:

```bash
npx akili-specs install --tool claude
npx akili-specs install --tool opencode
npx akili-specs install --tool antigravity
npx akili-specs install --tool both
npx akili-specs install --tool all
```

Claude is the default target:

```bash
npx akili-specs install
```

Use a persistent global install if preferred:

```bash
pnpm add -g akili-specs
akili install --tool all
```

To install directly into the local project workspace instead of globally, use the `--local` flag:

```bash
akili install --tool both --local
```

## Commands

| Command | Purpose |
|---|---|
| `akili init` | Interactive setup wizard for installation |
| `akili install` | Install commands, skills, and helper resources |
| `akili update` | Reinstall packaged commands, skills, and helper resources |
| `akili list` | List packaged commands, skills, and helper resources |
| `akili doctor` | Check whether expected files are installed |
| `akili help` | Show help |

## Options

| Option | Applies To | Purpose |
|---|---|---|
| `--tool claude` | install, update, doctor | Target Claude Code config |
| `--tool opencode` | install, update, doctor | Target OpenCode config |
| `--tool antigravity` | install, update, doctor | Target Google Antigravity config |
| `--tool both` | install, update, doctor | Target Claude and OpenCode |
| `--tool all` | install, update, doctor | Target Claude, OpenCode, and Antigravity |
| `--target <path>` | single-tool install/update/doctor | Override the selected tool target directory |
| `--claude-target <path>` | multiple tools | Override Claude target directory |
| `--opencode-target <path>` | multiple tools | Override OpenCode target directory |
| `--antigravity-target <path>` | multiple tools | Override Antigravity target directory |
| `--local`, `-l` | install, update, doctor | Target the current project directory (e.g., `./.claude`) instead of the global home directory |
| `--force` | install, update | Overwrite existing files |
| `--dry-run` | install, update | Show planned writes without writing files |
| `--commands-only` | install, update, doctor | Only install or check commands |
| `--skills-only` | install, update, doctor | Only install or check skills |
| `--fix` | doctor | Automatically repair and copy missing files |

`--commands-only` and `--skills-only` are mutually exclusive.

## Install Targets

Default targets:

```text
Claude:      ~/.claude
OpenCode:    ~/.config/opencode
Antigravity: ~/.gemini
```

Claude install layout:

```text
~/.claude/commands/
~/.claude/skills/
~/.claude/akili/scripts/
~/.claude/akili/templates/      (leader.md, implementer.md, reviewer.md — used by /akili-constitution to scaffold project .agents/)
~/.claude/akili/.mcp.json.example
```

OpenCode install layout:

```text
~/.config/opencode/commands/
~/.config/opencode/skills/
~/.config/opencode/akili/scripts/
~/.config/opencode/akili/templates/
~/.config/opencode/akili/.mcp.json.example
```

Antigravity install layout:

```text
~/.gemini/antigravity/global_workflows/  (custom commands mapped as global workflows)
~/.gemini/config/skills/                 (skills mapped as global skills)
~/.gemini/config/akili/scripts/         (scripts mapped as config resources)
~/.gemini/config/akili/templates/       (multi-agent harness templates: leader, implementer, reviewer)
~/.gemini/config/akili/.mcp.json.example
```

Restart Claude Code, OpenCode, or Google Antigravity after install/update so running sessions load new commands and skills.

## Safety Rules

- Existing files are skipped by default.
- Use `--force` to overwrite old installed files.
- Use `--dry-run` before changing custom targets.
- `update` is intentionally the same safe copy behavior as `install` unless `--force` is provided.

## Examples

Preview a three-tool install:

```bash
akili install --tool all --dry-run
```

Install Claude commands into a local project folder:

```bash
akili install --tool claude --target ./.claude
```

Install both tools into custom directories:

```bash
akili install --tool both --claude-target ./.claude --opencode-target ./.opencode
```

Update Antigravity skills only:

```bash
akili update --tool antigravity --skills-only --force
```

Check all installs:

```bash
akili doctor --tool all
```

## Packaged Resources

The CLI installs helper resources under the target `akili/` directory:

| Resource | Purpose |
|---|---|
| `scripts/gsc_verify.py` | Google Site Verification helper used by `/akili-seo` |
| `scripts/parse_tests.js` | Jest/Vitest JSON test-output parser used by `/akili-test` to generate the requirement-to-test matrix |
| `templates/leader.md` | Default Leader (Orchestrator) persona for the multi-agent harness — copied into project `.agents/` by `/akili-constitution` |
| `templates/implementer.md` | Default Implementer persona for the multi-agent harness |
| `templates/reviewer.md` | Default Reviewer persona for the multi-agent harness |
| `.mcp.json.example` | Example MCP config for the Google Search Console MCP server |

## Troubleshooting

If commands do not appear in your AI tool:

- Run `akili doctor --tool <claude|opencode|antigravity|both|all>`.
- Restart Claude Code, OpenCode, or Google Antigravity.
- Confirm the target directory is the one your tool reads.
- Re-run with `--force` if older files should be replaced.

If helper resources are missing:

- Run `akili doctor --tool <target>` without `--commands-only` or `--skills-only`.
- Re-run `akili install --tool <target> --force`.
