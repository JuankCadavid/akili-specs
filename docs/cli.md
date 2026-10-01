# CLI Reference

The `akili` CLI installs the AKILI command prompts, skills, and helper resources into Claude Code, OpenCode, Google Antigravity, OpenAI Codex CLI, or multiple tools.

## Install

### Interactive Mode (Recommended)

Run the `init` command to launch an interactive wizard. It will guide you through selecting the target tools and choosing between global or local installation:

```bash
npx akili-specs init
# or, if installed globally
akili init
```

The tool prompt lists `1) Claude Code`, `2) OpenCode`, `3) Google Antigravity`, `4) OpenAI Codex CLI`,
`5) Both (Claude Code + OpenCode)`, and `6) All four`. Choosing local for Codex maps to
`./.agents/skills` (commands and skills) plus `./.codex/akili` (resources).

### Manual Installation

Run directly from npm:

```bash
npx akili-specs install --tool claude
npx akili-specs install --tool opencode
npx akili-specs install --tool antigravity
npx akili-specs install --tool codex
npx akili-specs install --tool both
npx akili-specs install --tool all
```

When `--tool` is omitted, `install`, `update`, and `doctor` **auto-detect already-installed
targets** on disk (`~/.claude`, `~/.config/opencode`, `~/.gemini`, and — for Codex — a non-empty
`akili` resources directory under `$CODEX_HOME` (default `~/.codex`) or an `akili-<cmd>/SKILL.md` command skill under
`~/.agents/skills`) and act on all of them — so a bare `akili update` refreshes every installed
tool, not just Claude. A populated `~/.agents/skills` alone is **not** evidence of a Codex install:
that root is shared with other tools honoring the Agent Skills standard, so detection keys on the
resources root or on an AKILI command skill, never on the raw skills directory. A first-time run
with nothing installed defaults to Claude. An explicit `--tool <name>` always wins:

```bash
npx akili-specs install
```

Use a persistent global install if preferred:

```bash
npm install -g akili-specs
akili install --tool all
```

pnpm works everywhere npm does: `pnpm dlx akili-specs …` for one-off runs, `pnpm add -g akili-specs` for a global install (after a one-time `pnpm setup`).

To install directly into the local project workspace instead of globally, use the `--local` flag:

```bash
akili install --tool both --local
```

## Commands

| Command | Purpose |
|---|---|
| `akili init` | Interactive setup wizard for installation |
| `akili install` | Install commands, skills, and helper resources |
| `akili update` | Update the package to the latest version (via the package manager that owns the install — npm or pnpm), reinstall files, and print a changelog summary of what changed |
| `akili list` | List packaged commands, skills, and helper resources |
| `akili doctor` | Check whether expected files are installed |
| `akili check-update` | Print one line if a newer version is published to npm; silent + exit 0 when current with `--quiet` (built for session hooks). Registry checks are cached for 24h in `~/.akili-specs-update.json` |
| `akili notifications enable\|disable\|status` | **Opt-in** update announcements where users actually work: `enable` registers a `SessionStart` hook (`akili check-update --quiet`) in Claude Code's `~/.claude/settings.json` (respects `--claude-target`), so new versions are surfaced at session start. `disable` removes exactly that hook and leaves every other setting untouched; `status` reports the hook state and the last registry check. If `settings.json` is not valid JSON the command aborts without writing. Claude Code only for now |
| `akili help` | Show help |

Every command closes with a clear end-of-run summary:

- **`install`** — an **Install Summary** with per-tool `installed | overwritten | skipped` counts (plus legacy cleanup), target paths, totals for multi-tool installs, a dry-run banner when `--dry-run` is used, and contextual next steps (`--force` hint, OpenCode restart, `akili doctor` verification). Legacy cleanup removes artifacts from older versions on every run: `sdd-*` command files, the `sdd-jc` resources directory, and skill directories that were removed from the package (e.g. the 8 `gsap-*` skills replaced by `gsap-animation`); `akili doctor` reports still-present legacy skills as `STALE` and `--fix` deletes them.
- **`doctor`** — a **Doctor Summary** with a per-tool `HEALTHY | REPAIRED | INCOMPLETE` status, `ok | missing | fixed` counts, and repair suggestions (`--fix` or `akili update`).
- **`update`** — an **Update Summary** with the version change (`before → after`), install type, and the verification command, after the changelog of what changed.
- **`list`** — a totals line: commands, skills, resources, and the package version.

## Options

| Option | Applies To | Purpose |
|---|---|---|
| *(no `--tool`)* | install, update, doctor | **Auto-detect installed targets** and act on all of them; default to Claude when none found |
| `--tool claude` | install, update, doctor | Target Claude Code config |
| `--tool opencode` | install, update, doctor | Target OpenCode config |
| `--tool antigravity` | install, update, doctor | Target Google Antigravity config |
| `--tool codex` | install, update, doctor | Target OpenAI Codex CLI config |
| `--tool both` | install, update, doctor | Target Claude and OpenCode |
| `--tool all` | install, update, doctor | Target Claude, OpenCode, Antigravity, and Codex |
| `--target <path>` | single-tool install/update/doctor | Override the selected tool target directory. For `--tool codex` this selects a **single-root sandbox layout** — resources at `<path>/akili` and skills at `<path>/skills`, both under the one path — instead of the split default (`~/.codex/akili` + `~/.agents/skills`). **Unverified:** whether Codex still reads `~/.codex/skills` as a legacy root (so `--target ~/.codex` would also produce a working legacy-style install) — the pinned skills page (`Last verified: 2026-09-16`, <https://learn.chatgpt.com/docs/build-skills>) documents only the `~/.agents/skills` Agent Skills root and does not state a legacy `~/.codex/skills` location; confirmed or retracted by the Codex install spec's live-validation task |
| `--claude-target <path>` | multiple tools | Override Claude target directory |
| `--opencode-target <path>` | multiple tools | Override OpenCode target directory |
| `--antigravity-target <path>` | multiple tools | Override Antigravity target directory |
| `--codex-target <path>` | multiple tools | Override the Codex config home (resources land at `<path>/akili`); does not move the skills root |
| `--codex-skills-target <path>` | multiple tools | Override the Codex skills root independently of `--codex-target` |
| `--local`, `-l` | install, update, doctor | Target the current project directory (e.g., `./.claude`, or `./.agents/skills` + `./.codex/akili` for Codex) instead of the global home directory |
| `--force` | install, update | Overwrite existing files |
| `--dry-run` | install, update | Show planned writes without writing files |
| `--commands-only` | install, update, doctor | Only install or check commands (on Codex, the 11 command skills — no `commands/` directory is ever written for Codex, in any mode) |
| `--skills-only` | install, update, doctor | Only install or check skills |
| `--fix` | doctor | Automatically repair and copy missing files |

`--commands-only` and `--skills-only` are mutually exclusive.

## Install Targets

Default targets:

```text
Claude:      ~/.claude
OpenCode:    ~/.config/opencode
Antigravity: ~/.gemini
Codex:       $CODEX_HOME if set, else ~/.codex (resources) + ~/.agents/skills (commands and skills)
```

Claude install layout:

```text
~/.claude/commands/
~/.claude/skills/
~/.claude/akili/scripts/
~/.claude/akili/templates/      (leader.md, implementer.md, reviewer.md, tester.md — used by /akili-constitution to scaffold project .agents/)
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
~/.gemini/config/akili/templates/       (multi-agent harness templates: leader, implementer, reviewer, tester)
~/.gemini/config/akili/.mcp.json.example
```

Codex install layout (global; `--local` maps both roots under `./`):

```text
~/.agents/skills/                 (Agent Skills root, shared with other tools honoring the standard)
  akili-archive/SKILL.md … akili-validate/SKILL.md   (the 11 commands, installed as skills — never a commands/ dir)
  tdd/SKILL.md, kaizen/SKILL.md, …                    (the 24 packaged skills, with their references/ trees)
~/.codex/akili/                   (resources root)
  scripts/
  templates/                      (leader, implementer, reviewer, tester personas)
  .mcp.json.example
```

Codex is the only target whose skills live outside its own config home: the skills root
(`~/.agents/skills`, or `./.agents/skills` under `--local`) and the resources root
(`~/.codex/akili`, or `./.codex/akili` under `--local`) move independently via
`--codex-skills-target` and `--codex-target`. Project-level artifacts written later by
`/akili-constitution` (`.codex/agents/akili-*.toml`, `.codex/hooks.json`) are not part of the CLI
install and are documented in the [Command Reference](commands/akili-constitution.md).

Restart Claude Code, OpenCode, Google Antigravity, or Codex (or open a new chat) after
install/update so running sessions load new commands and skills.

## Safety Rules

- Existing files are skipped by default.
- Use `--force` to overwrite old installed files.
- Use `--dry-run` before changing custom targets.
- `update` is intentionally the same safe copy behavior as `install` unless `--force` is provided.

## Examples

Preview a four-tool install:

```bash
akili install --tool all --dry-run
```

Install Codex into custom roots:

```bash
akili install --tool codex --codex-target ~/.codex --codex-skills-target ~/.agents/skills
```

Sandbox a Codex install fully under one path (single-root layout, `--target` with `--tool codex`):

```bash
akili install --tool codex --target /tmp/codex-sandbox
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
| `templates/tester.md` | Default Tester persona for the `/akili-test` Leader → Tester(s) harness — copied into project `.agents/` by `/akili-constitution` |
| `.mcp.json.example` | Example MCP config for the Google Search Console MCP server |

## Doctor: Environment Row and Legacy Copies (Codex)

`akili doctor` prints an *Environment (recommended, not required)* section — CodeGraph, GitHub CLI,
`playwright-cli`, and so on — that never fails the health check. When Codex is a resolved tool, this
section gains a `codex` row (`codex --version`) with the same never-fails semantics: a missing or
broken binary (including the known vendor `ENOENT` on some 0.66.0 installs) reports NOT FOUND with
the install hint (`npm install -g @openai/codex`) and does not flip the exit code or count toward
`missing`. Separately, if `<codex config home>/skills/akili-*` (`$CODEX_HOME`, default `~/.codex`) exists from an old manual copy while the standard
root (`~/.agents/skills`) is complete, `doctor --tool codex` prints one informational line naming the
legacy copy as present and unmanaged — it is never required and never deleted, because the installer
never wrote there.

## Persona Drift (`doctor --agents`)

`akili doctor --agents` is a project-scoped mode of `doctor`. It runs against `./.agents/` in the
current working directory — not an install target — and compares each persona file
(`leader.md`, `implementer.md`, `reviewer.md`, `tester.md`) against the CLI's own packaged
templates, section by section. `--fix` turns the report into an upgrade: it never appends an
"upgrade block," and it never changes a byte of project space.

### Marker grammar

The packaged templates fence their AKILI-owned text with HTML comment markers, invisible once the
file is rendered as Markdown:

| Element | Form | Rule |
|---|---|---|
| Section open | `<!-- akili:section id=<id> since=<vX.Y.Z> -->` | Own line |
| Section close | `<!-- /akili:section -->` | Own line |
| Project block | `<!-- akili:project -->` … `<!-- /akili:project -->` | Exactly one per persona |
| Migration record | `<!-- akili:migrated <release> not-located=<id,id\|none> -->` | At most one, immediately before the project block |

Everything inside the project block, plus any text outside an owned section (front matter, the
title, blank lines, unfenced prose), is **project space**: `--fix` never touches it.

### Flags

| Flag | Effect |
|---|---|
| `--agents` | Switches `doctor` into this mode. The meanings below apply only under `--agents` — `--fix`, `--force`, `--dry-run` and `--tool` are pre-existing `doctor` flags that keep their other meanings elsewhere (plain `doctor --fix` runs `doctor`'s own repair path, not this one) |
| `--fix` | Replaces every `outdated` section, inserts every `missing` section, migrates every `unmarked` persona, and installs the packaged template for an `absent` persona file |
| `--section <id>` | Repeatable. Lets `--fix` replace a `custom-edited` section, or insert an `unlocated` one, by id |
| `--allow-branch` | With `--fix`: overrides the branch guard |
| `--force` | With `--fix`: overrides the dirty-tree guard |
| `--dry-run` | With `--fix`: runs both guards, prints the full plan, and exits with the code the plan would produce; writes nothing (no backup). Without `--fix`, the guards never run, so there is nothing to simulate — it is plain report mode |
| `--tool <t>` | Prints that tool's root for information only — it does not change any state reported |

### Section states

One state per owned section per persona, each deciding the exit code:

| State | Meaning | Exit code |
|---|---|---|
| `current` | Equals the packaged template | 0 |
| `outdated` | Equals an earlier release's text, not the current one | 1 |
| `custom-edited` | Matches no known release's text | 0 |
| `missing` | The template has the section; the persona has no marker for it | 1 |
| `unlocated` | Missing, and the persona's migration record already lists it as not found | 0 |
| `extra` | The persona has a marker id the template no longer defines | 0 |
| `unreadable` | The marker grammar is malformed — unclosed, nested, a duplicate id, or the wrong project-block count | 1 |
| `unmarked` | The persona has no marker of any kind | 1 |
| `absent` | The persona file does not exist | 1 |

A persona with no marker at all is always `unmarked`, never `unreadable`. `custom-edited`,
`extra`, and `unlocated` stay the maintainer's own call and never fail CI; every other state does.
The report names the `akili-specs` release its packaged templates came from and, for information
only, the active tool's root.

### `--fix` rows

One row per change, shaped `LABEL  <id> (detail)` — the id and the parenthesized detail are each
printed only when the code has one to print:

- `INSTALLED` — an `absent` persona file installed from the packaged template (no id, no detail)
- `FIXED  <id> (matched <release>)` — an `outdated` section replaced with the current template text
- `FIXED  <id> (--section override)` — a `custom-edited` section replaced because `--section <id>` forced it
- `INSERTED  <id>` — a `missing` section inserted at its template position (no detail)
- `INSERTED  <id> (--section (removed from migration record))` — an `unlocated` section inserted because `--section <id>` forced it; its id is dropped from the migration record
- `SKIPPED  <id> (custom-edited; use --section)` — a `custom-edited` section left as is; pass `--section <id>` to force it
- `SKIPPED  <id> (unlocated; use --section)` — an `unlocated` section left as is; prints again on every later `--fix` until `--section <id>` forces it
- `SKIPPED (unreadable: <reason>)` — the whole persona file skipped because its marker grammar is malformed (one row per file, no id)
- `FENCED  <id> (exact)` — migration located a section by an exact text match
- `FENCED  <id> (heading)` — migration located a section by heading + opening sentence
- `NOT LOCATED  <id>` — migration could not find a section; nothing is touched (no detail)
- `BACKUP <path>` — printed just before a persona file is overwritten
- `REFUSED (branch: …)` / `REFUSED (dirty tree: …)` — a guard refused the run
- `(dry-run — no file written)` — appended under `--dry-run` wherever a real run would have written

Advisory: if `templates/digests.json` is missing or unreadable, every section is scored against an
empty digest table, so a section whose text differs from the current template always reads
`custom-edited` (exit 0), never `outdated`. Advisory: when `.agents/` itself does not exist, the
run prints `ABSENT <path> does not exist` and exits 1 before any per-persona row runs.

A run that wrote at least one persona closes with:

```text
commit `.agents/` before the next `--fix`, or pass `--force`
```

### Guards

`--fix` refuses to write unless both guards pass; `--dry-run` runs both and reports what they
would do, writing nothing either way.

- **Branch.** Resolved the way the `kaizen` skill resolves it: the root guide's
  `Integration Branch:` pin, else its `Default Branch:` pin, else the remote's `origin/HEAD`, else
  the unique `main`/`master` among local and `origin/` branches. Unresolved refuses. `--allow-branch`
  overrides it. A checkout that is not a git repository has no branch guard and proceeds, saying so.
- **Dirty tree.** `.agents/` must carry no uncommitted changes beyond the fix's own `.backup/`
  folder and the `.gitignore` line it writes. `--force` overrides it.

### Backup

Before a persona file is overwritten, `--fix` copies it to
`.agents/.backup/<role>.md.<YYYYMMDD-HHMMSS>` (local time) and adds `.backup/` to
`.agents/.gitignore` (created when missing). Restoring that backup reverses the write.

### Migration

A persona with no marker of any kind is migrated once, the first time `--fix` runs against it.
Each template section is located in the persona's text — first by an exact match against that
section's text at some release (current or past), then by a paired heading-plus-opening-sentence
match (a heading match alone never fences a section). A located section is cut from its own start
to the next section start at the same level or higher — a `###` heading never ends a section.
Anything not located is reported `not located` and left exactly as it is; nothing is deleted,
moved, or reordered. Migration always leaves the persona with exactly one empty project block and
a migration record naming every id it could not find, so a later run reports those as `unlocated`
rather than `missing`.

## CI & Verification

`scripts/ci/install-layout-regression.js` runs on every CI matrix leg (ubuntu/macos/windows × Node 18/22) after the symlink-defense probe. It installs the **published** `akili-specs@2.23.2` into an isolated sandbox with `npm install --prefix <tmp>` and invokes that sandbox's own extracted `bin/akili.js` directly (not `npx` — on a cold runner `npx akili-specs@<version>` resolves by *bin name*, and the package's bin is named `akili`, not `akili-specs`, which fails outright with `sh: akili: not found`; the isolated prefix also can never silently resolve to a pre-existing global install the way `npx` can), alongside the working tree's `bin/akili.js`, into separate temp targets for each of `claude`, `opencode`, and `antigravity`, then compares the sorted relative file list and per-file SHA-256 of the two trees — the regression gate for the Codex registry generalization (`TOOL_REGISTRY` per-type roots + `commandsAsSkills`/`sharedSkillsRoot` flags). Any path present on only one side fails the job. A path present on both sides with a differing hash is tolerated **only** when the working tree's copy is byte-identical to its own current `.claude`/repo source file (a canonical-file edit this or another spec made, e.g. adding Codex paragraphs to a command) — printed as `EXPECTED-DIFF <tool> <path>` — and the tool then reports `LAYOUT-IDENTICAL <tool> (<n> expected source diffs)`; a byte-for-byte match with zero diffs reports `IDENTICAL <tool>`. Any other content difference (the install doesn't even match its own source) is an installer bug, not a canonical edit, and fails the job naming the path. To guard against a false pass (both sides silently resolving to the same local install), it also reads the resolved version from the sandbox's own installed `package.json` and fails loudly if it is not exactly `2.23.2`. It then runs the Codex auto-detection fixture in-process: a scratch home with a foreign-only `~/.agents/skills` must not auto-detect Codex, and adding one `akili-<cmd>/SKILL.md` must, printing `FIXTURE OK` or a named false-positive/false-negative failure. The step **skips** (prints `SKIP: registry unreachable (<reason>)` and exits 0) only when the npm registry is unreachable — a real install failure (bad arguments, a broken package) still fails the job.

## Troubleshooting

If commands do not appear in your AI tool:

- Run `akili doctor --tool <claude|opencode|antigravity|codex|both|all>`.
- Restart Claude Code, OpenCode, Google Antigravity, or Codex (or open a new chat).
- Confirm the target directory is the one your tool reads.
- Re-run with `--force` if older files should be replaced.

If helper resources are missing:

- Run `akili doctor --tool <target>` without `--commands-only` or `--skills-only`.
- Re-run `akili install --tool <target> --force`.
