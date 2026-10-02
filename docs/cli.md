# CLI Reference

The `akili` CLI installs the AKILI command prompts, skills, and helper resources into Claude Code, OpenCode, Google Antigravity, OpenAI Codex CLI, Cursor, or multiple tools.

## Install

### Interactive Mode (Recommended)

Run the `init` command to launch an interactive wizard. It will guide you through selecting the target tools and choosing between global or local installation:

```bash
npx akili-specs init
# or, if installed globally
akili init
```

The tool prompt lists `1) Claude Code`, `2) OpenCode`, `3) Google Antigravity`, `4) OpenAI Codex CLI`,
`5) Cursor`, `6) Both (Claude Code + OpenCode)`, and `7) All five`. Inputs `5` and `6` changed
meaning from v2.31.0 — `5` used to mean Both and `6` used to mean All four; Both is now `6` and
All (now five hosts) is `7`. Choosing local for Codex maps to `./.agents/skills` (commands and
skills) plus `./.codex/akili` (resources); choosing local for Cursor maps to `./.agents/skills`
(commands and skills) plus `./.cursor/akili` (resources).

### Manual Installation

Run directly from npm:

```bash
npx akili-specs install --tool claude
npx akili-specs install --tool opencode
npx akili-specs install --tool antigravity
npx akili-specs install --tool codex
npx akili-specs install --tool cursor
npx akili-specs install --tool both
npx akili-specs install --tool all
```

When `--tool` is omitted, `install`, `update`, and `doctor` **auto-detect already-installed
targets** on disk (`~/.claude`, `~/.config/opencode`, `~/.gemini`, and — for Codex and Cursor — a
non-empty `akili` resources directory under `$CODEX_HOME` (default `~/.codex`) / `$CURSOR_CONFIG_DIR`
(default `~/.cursor`), or, for Codex only, an `akili-<cmd>/SKILL.md` command skill under
`~/.agents/skills`) and act on all of them — so a bare `akili update` refreshes every installed
tool, not just Claude. A populated `~/.agents/skills` alone is **not** evidence of either a Codex or
a Cursor install: that root is shared with other tools honoring the Agent Skills standard, so the
two tenants are evidenced by two different signals that together keep detection symmetric overall
— neither tool misreads the other's install (design DD-2). **Cursor detects by its own resources root
only** — a command skill in the shared root never counts for Cursor. **Codex** detects by its own
resources root, **or** by a command skill in the shared root, but only while no sibling tenant
resolving to the same shared root already has a populated resources directory — so a Cursor-only
machine is never misread as a Codex install, though a Codex `--skills-only` install sitting beside
populated Cursor resources is not auto-detected this way (`--tool codex` still works explicitly). A
first-time run with nothing installed defaults to Claude. An explicit `--tool <name>` always wins:

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
| `akili routing` | Configure a project's model routing: writes the fenced `## Model Routing` section of `AGENTS.md`, the Step 8E agent wrappers, and `.agents/model-routing.json` from one set of answers (interactive wizard, or flags for a non-interactive run). See [Routing](#routing-akili-routing) |
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
| `--tool cursor` | install, update, doctor | Target Cursor config |
| `--tool both` | install, update, doctor | Target Claude and OpenCode |
| `--tool all` | install, update, doctor | Target Claude, OpenCode, Antigravity, Codex, and Cursor |
| `--target <path>` | single-tool install/update/doctor | Override the selected tool target directory. For `--tool codex` or `--tool cursor` this selects a **single-root sandbox layout** — resources at `<path>/akili` and skills at `<path>/skills`, both under the one path — instead of the split default (`~/.codex/akili` + `~/.agents/skills`, or `~/.cursor/akili` + `~/.agents/skills`). **Unverified:** whether Codex still reads `~/.codex/skills` as a legacy root (so `--target ~/.codex` would also produce a working legacy-style install) — the pinned skills page (`Last verified: 2026-09-16`, <https://learn.chatgpt.com/docs/build-skills>) documents only the `~/.agents/skills` Agent Skills root and does not state a legacy `~/.codex/skills` location; confirmed or retracted by the Codex install spec's live-validation task |
| `--claude-target <path>` | multiple tools | Override Claude target directory |
| `--opencode-target <path>` | multiple tools | Override OpenCode target directory |
| `--antigravity-target <path>` | multiple tools | Override Antigravity target directory |
| `--codex-target <path>` | multiple tools | Override the Codex config home (resources land at `<path>/akili`); does not move the skills root |
| `--codex-skills-target <path>` | multiple tools | Override the Codex skills root independently of `--codex-target` |
| `--cursor-target <path>` | multiple tools | Override the Cursor config home (resources land at `<path>/akili`); does not move the skills root |
| `--cursor-skills-target <path>` | multiple tools | Override the Cursor skills root independently of `--cursor-target` |
| `--local`, `-l` | install, update, doctor | Target the current project directory (e.g., `./.claude`, or `./.agents/skills` + `./.codex/akili` for Codex, or `./.agents/skills` + `./.cursor/akili` for Cursor) instead of the global home directory |
| `--force` | install, update | Overwrite existing files |
| `--dry-run` | install, update | Show planned writes without writing files |
| `--commands-only` | install, update, doctor | Only install or check commands (on Codex and Cursor, the 11 command skills — no `commands/` directory is ever written for either, in any mode) |
| `--skills-only` | install, update, doctor | Only install or check skills |
| `--fix` | doctor | Automatically repair and copy missing files |
| `--hosts <a,b>` | routing | Hosts to configure: `claude`, `opencode`, `antigravity`, `codex`, `cursor` |
| `--models <host>=<id>[@T<n>[+T<m>]],...` | routing | Models for one host (repeatable; last per host wins) |
| `--cli <host>=<binary>` | routing | Confirmed CLI invocation for a host (repeatable) |
| `--wrappers yes\|no` | routing | Write native agent wrappers (Step 8E); `--yes` without it means `yes` |
| `--t3-cross-host <host>=<other>` | routing | Dispatch a host's Reviewer (T3) to another host (repeatable) |
| `--antigravity-tools <a,b>` | routing | Confirmed Antigravity tool names for the Reviewer restriction |
| `--opencode-agent-dir <path>` | routing | OpenCode wrapper directory. Default: `.opencode/agent` |
| `--pin-reason <host>=<id>=<text>` | routing | Recorded reason for a dated model id (repeatable) |
| `--yes` | routing | Accept the derived mapping without the confirm prompt |
| `--adopt` | routing | Adopt an unfenced `## Model Routing` section without asking |
| `--json` | routing | Print the plan result as JSON on stdout (nothing else) |
| `--project <path>` | routing | Project directory. Default: current directory |
| `--force` / `--dry-run` | routing | Overwrite wrappers and a hand-edited fence / print the plan only |

`--commands-only` and `--skills-only` are mutually exclusive.

## Install Targets

Default targets:

```text
Claude:      ~/.claude
OpenCode:    ~/.config/opencode
Antigravity: ~/.gemini
Codex:       $CODEX_HOME if set, else ~/.codex (resources) + ~/.agents/skills (commands and skills)
Cursor:      $CURSOR_CONFIG_DIR if set, else ~/.cursor (resources) + ~/.agents/skills (commands and skills)
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

Cursor install layout (global; `--local` maps both roots under `./`):

```text
~/.agents/skills/                 (Agent Skills root, shared with Codex and other tools honoring the standard)
  akili-archive/SKILL.md … akili-validate/SKILL.md   (the 11 commands, installed as skills — never a commands/ dir)
  tdd/SKILL.md, kaizen/SKILL.md, …                    (the 24 packaged skills, with their references/ trees)
$CURSOR_CONFIG_DIR/akili/ (or ~/.cursor/akili/)  (resources root)
  scripts/
  templates/                      (leader, implementer, reviewer, tester personas)
  .mcp.json.example
```

Codex and Cursor are the only targets whose skills live outside their own config home: each
tool's skills root (`~/.agents/skills`, or `./.agents/skills` under `--local` — shared between
them) and its own resources root (`~/.codex/akili` or `~/.cursor/akili`, or the `--local`
equivalents) move independently via `--codex-skills-target`/`--codex-target` and
`--cursor-skills-target`/`--cursor-target`. Project-level artifacts written later by
`/akili-constitution` (`.codex/agents/akili-*.toml`, `.codex/hooks.json`, `.cursor/agents/akili-*.md`,
`.cursor/hooks.json`) are not part of the CLI install and are documented in the
[Command Reference](commands/akili-constitution.md).

Restart Claude Code, OpenCode, Google Antigravity, Codex, or Cursor (or open a new chat) after
install/update so running sessions load new commands and skills.

## Shared and compatibility skill roots (Codex, Cursor, Claude Code)

Codex and Cursor write their 11 command skills and 24 packaged skills into one shared root,
`~/.agents/skills` (or `./.agents/skills` under `--local`) — `--tool all` writes it once; a second
install from either tool sees it already populated and skips. Because both tenants write into the
same root, detecting *which* of them is installed cannot key on that root alone — see design DD-2
(summarized above, under *Manual Installation*): Cursor is evidenced only by its own resources
root; Codex is evidenced by its own resources root, or by the shared root's command skills when no
sibling tenant's resources root is populated. Separately from that shared root,
Cursor also reads `~/.claude/skills` and `~/.codex/skills` for compatibility ("For compatibility,
Cursor also loads skills from Claude and Codex directories", <https://cursor.com/docs/context/skills>,
`Last verified: 2026-10-01`), so a Claude Code user who also uses Cursor may see an AKILI skill
installed to both `~/.claude/skills` and `~/.agents/skills` show up twice in Cursor's `/` picker;
observed live 2026-10-01 (Cursor CLI, cursor-agent 2026.09.28–2026.10.01): a skill present in both roots is
listed **once**, from `~/.claude/skills` (one observation, this host — read as: the compatibility
root wins); the IDE picker was not observed.

## Safety Rules

- Existing files are skipped by default.
- Use `--force` to overwrite old installed files.
- Use `--dry-run` before changing custom targets.
- `update` is intentionally the same safe copy behavior as `install` unless `--force` is provided.

## Examples

Preview a five-tool install:

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

## Doctor: Environment Row and Legacy Copies (Codex, Cursor)

`akili doctor` prints an *Environment (recommended, not required)* section — CodeGraph, GitHub CLI,
`playwright-cli`, and so on — that never fails the health check. When Codex is a resolved tool, this
section gains a `codex` row (`codex --version`) with the same never-fails semantics: a missing or
broken binary (including the known vendor `ENOENT` on some 0.66.0 installs) reports NOT FOUND with
the install hint (`npm install -g @openai/codex`) and does not flip the exit code or count toward
`missing`. Separately, if `<codex config home>/skills/akili-*` (`$CODEX_HOME`, default `~/.codex`) exists from an old manual copy while the standard
root (`~/.agents/skills`) is complete, `doctor --tool codex` prints one informational line naming the
legacy copy as present and unmanaged — it is never required and never deleted, because the installer
never wrote there.

When Cursor is a resolved tool, the Environment section gains a `cursor-agent` row with the same
never-fails semantics: it probes the `cursor-agent` binary — the unambiguous name, since `agent` is
too generic to probe reliably — and the row's install hint names both the macOS/Linux/WSL and
Windows install commands. Cursor's CLI is also invoked as `agent`, a documented alias of
`cursor-agent` (`Last verified: 2026-10-01` — <https://cursor.com/docs/cli/overview>). A missing or
broken binary reports NOT FOUND and does not flip the exit code or count toward `missing`.

## Routing (`akili routing`)

`akili routing` configures one project's model routing. From a single set of answers it writes three
things: the fenced `## Model Routing` section of the project's root `AGENTS.md`, the Step 8E agent
wrappers for the hosts you select (when you opt in), and `.agents/model-routing.json` — the answers
file a later run re-reads. It runs against the current directory (`--project <path>` to point
elsewhere), never against an install target. Every answer is validated and the whole plan is built
before the first write; a validation error exits 1 with no file touched.

`/akili-constitution` [Step 8C](commands/akili-constitution.md) runs it for you: it asks
the same questions in chat and runs one non-interactive `akili routing … --yes --json`, so you never
need the wizard inside an agent session. Run it yourself to re-route a project after your plan or
roster changes.

```bash
akili routing            # interactive wizard
akili routing --dry-run  # print the plan and the registry table; write nothing
akili routing --hosts claude --models claude=opus,sonnet,haiku --cli claude=claude --wrappers yes --yes --json
```

### Question order

Each question is answered by its flag when given, else by the previous answers file, else asked.
Previous answers are final under `--yes` or without a TTY; otherwise they pre-fill the prompt
(Enter keeps them).

| # | Question | Flag |
|---|---|---|
| 1 | Which hosts you use | `--hosts` |
| 2 | Per host, the models it offers; a model outside the packaged roster also takes its tiers (1–6), a dated id its reason | `--models`, `--pin-reason` |
| 3 | Per host, the CLI invocation (`-` leaves `<CONFIRM>`) | `--cli` |
| 4 | Antigravity Reviewer tool names (only when Antigravity is selected) | `--antigravity-tools` |
| 5 | OpenCode agent directory (only when OpenCode is selected) | `--opencode-agent-dir` |
| 6 | Bind the personas with native wrappers (Step 8E)? | `--wrappers` |
| 7 | The derived tier table: accept, adjust a tier, or quit | `--yes` skips 7 and 8 |
| 8 | Per host whose Reviewer cannot differ from its Implementer: add a model, dispatch T3 to another host, or leave it | `--t3-cross-host` |

**Without a TTY nothing is asked.** The run needs `--yes`, plus hosts and each host's models from
`--hosts` / `--models` or from the previous answers file; anything still missing exits non-zero with
the non-interactive form. A dated id needs its `--pin-reason`. The other answers default: no `--cli`
leaves `<CONFIRM>` in the CLI-invocation row, no `--wrappers` under `--yes` means `yes`, and no
`--antigravity-tools` omits the restriction and reports it.

### Flags

The routing options are listed under [Options](#options) (Applies To `routing`). Grammar the table
cannot hold:

- **`--models`** takes one host per flag; the last flag for a host wins. An id outside the packaged
  roster needs its tiers (`@T1+T3`); `@` is reserved inside ids; the same id on T2 and T3 is an error,
  because the Reviewer could never differ from the Implementer.
- **`--pin-reason`** is required for a packaged id marked dated, or a user id carrying a date stamp
  (`YYYYMMDD` or `YYYY-MM-DD`); it becomes a footnote under the registry table.
- **`--force`** overwrites existing wrappers **and** regenerates a hand-edited fence. **`--dry-run`**
  prefixes every file line (and the `would create N dirs` line) with `[dry-run]`, prints the registry
  table, and writes nothing; report lines such as `no changes`, the diff, and the table print
  unprefixed.
- **`--json`** prints the plan result (files and tokens, placeholders per column, `authorAuditor`,
  Reviewer restrictions, the section's byte length) and nothing else on stdout — what Step 8C reads.

### `AGENTS.md` states

The section lives inside an AKILI-owned fence, `<!-- akili:section id=model-routing since=… -->` …
`<!-- /akili:section -->`, the same marker grammar the personas use. One state per run:

| State | Detected when | Token |
|---|---|---|
| Fenced, clean | The fenced body is what the previous answers render | `replaced`, or `unchanged` when the new body is byte-equal |
| Fenced, hand-edited | The fenced body differs from that render (or no answers file exists) **and** from this run's render | `refused (hand-edited fence; --force to regenerate)` (diff printed); `overwritten` with `--force` |
| Unfenced | A `## Model Routing` heading outside any fence | TTY: diff, then adopt or skip. No TTY: `adopted` with `--adopt`, else `skipped (unfenced; --adopt to replace)` |
| Absent | No such section | `appended` |
| No `AGENTS.md` | The file is missing | `created`, with the hint `run /akili-constitution to complete AGENTS.md` |
| Malformed | An open marker without a close, a close without an open, or two `model-routing` blocks | `refused (malformed fence)`; `AGENTS.md` is not written |

A fenced section with a stray `## Model Routing` heading outside the fence is handled as fenced and
reported (`+ stray "## Model Routing" heading at line N — remove it`). `CLAUDE.md` is read, never
written: if it carries the section, the run prints
`CLAUDE.md carries a Model Routing section — move it to AGENTS.md`.

Every planned file prints one line, `<token>  <path>`. Wrapper tokens: `created`, `unchanged`,
`overwritten`, `skipped (exists; --force to replace)` (with `— model drift: file says X, mapping says
Y` when the existing wrapper names another model), `skipped (wrappers=no)`, and
`skipped (author ≠ auditor unsatisfiable)`. The answers file is `created`, `unchanged`, or
`replaced`. A run in which every file is `unchanged` or `skipped`
prints `no changes`.

**Exit code.** Any `refused (…)` line exits 1; every other outcome exits 0. A refusal on `AGENTS.md`
does **not** roll back the other writes: the wrappers and `.agents/model-routing.json` are still
written. Resolve the fence (`--force`, or fix the malformed markers) and re-run.

### Provenance, `--force`, and `--adopt`

A fenced body that is not what your previous answers render is treated as a hand edit and refused,
so a customized registry is never silently overwritten. Two cases reach that refusal without anyone
editing by hand:

- **After an `akili-specs` upgrade** that changes the packaged template or roster, the next run
  renders the old answers differently, so the fence reads as hand-edited. Read the printed diff, then
  re-run with `--force`.
- **After the Step 8C inline fallback**, which writes the fence but no answers file, the first
  `akili routing` run reads the fence as unknown provenance and needs `--force` — unless the
  hand-written body already equals the new render, which is `unchanged`.

To own the table yourself instead, remove the fence markers: the section then reads as unfenced, and
the run skips it unless you adopt it.

### Wrappers per host

Written only with `--wrappers yes`, and only for a host whose Reviewer differs from its Implementer.
Roles map to tiers as Leader T1, Implementer T2, Reviewer T3, Tester T2. A host whose Reviewer is
dispatched cross-host (`--t3-cross-host`) gets three wrappers and no Reviewer.

| Host | Files | Reviewer restriction | Effort | Shape pin |
|---|---|---|---|---|
| Claude Code | `.claude/agents/akili-<role>.md` | `tools: Read, Grep, Glob` | none | Step 8E, Claude Code bullet (no vendor URL) |
| OpenCode | `.opencode/agent/akili-<role>.md` (`--opencode-agent-dir` overrides) | none — reported `read-only by instruction` on every run that writes it | none | Step 8E, OpenCode bullet (no vendor URL) |
| Antigravity | `.agents/agents/akili-<role>/agent.md` | `tools:` only from confirmed names (`--antigravity-tools`); else omitted and reported | none in the wrapper (`model: flash` or `pro`); the effort lives in the registry id | Step 8E, Antigravity bullet (no vendor URL) |
| Codex | `.codex/agents/akili-<role>.toml` | `sandbox_mode = "read-only"` | `model_reasoning_effort` | <https://learn.chatgpt.com/docs/agent-configuration/subagents>, `Last verified: 2026-09-16` |
| Cursor | `.cursor/agents/akili-<role>.md` | `readonly: true` | `[effort=<rung>]` bracket, only for a confirmed rung | <https://cursor.com/docs/context/subagents>, `Last verified: 2026-10-01` |

- **OpenCode, v1 limit:** only the agent-directory form is written. The `opencode.json` `agent`
  block stays manual (the Step 8E fallback), and no Reviewer restriction is written — its shape is
  unconfirmed.
- **Cursor effort bracket:** written only when the roster entry's confirmed effort rungs contain the
  role's rung (Leader and Reviewer `high`, the others `medium`); otherwise the bracket is omitted and
  the summary says `effort bracket omitted — rung unconfirmed`.

### After a run

- **Commit the answers file and the wrappers.** A writing run prints the hint
  `commit .agents/model-routing.json and the wrappers — akili doctor --agents --fix refuses a dirty
  .agents/`: the answers file lives under `.agents/`, and `doctor --agents --fix` refuses an
  uncommitted `.agents/` (see [Guards](#guards)).
- **A cross-host Reviewer sticks.** A recorded dispatch (`authorAuditor` `cross-host: <other>` in
  `.agents/model-routing.json`) is carried into every later run. To change it, pass a different
  `--t3-cross-host`; to drop it, delete that host's `authorAuditor` entry from the answers file.
- **Packaged data, not installed resources.** The roster (`.claude/templates/model-registry.json`)
  and the section template (`.claude/templates/model-routing.section.md`) ship in the package and are
  read from the package directory at run time. `install`, `update`, `list`, and `doctor` neither
  install nor list them.

## Persona Drift (`doctor --agents`)

`akili doctor --agents` is a project-scoped mode of `doctor`. It runs against `./.agents/` in the
current working directory — not an install target — and compares each persona file
(`leader.md`, `implementer.md`, `reviewer.md`, `tester.md`) against the CLI's own packaged
templates, section by section. `--fix` turns the report into an upgrade: it never appends an
"upgrade block," and it never changes a byte of project space — the one exception is line endings,
which are written as the file's majority line ending, so a mixed-EOL persona comes out uniform.

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
rather than `missing`. A migration fences text, it does not upgrade it: a section fenced by exact
match to an *older* release is reported `outdated` right after the migration, so a migrated
persona needs one more `--fix` to be brought current — the first run migrates, the second replaces,
the third has nothing to do.

## CI & Verification

`scripts/ci/install-layout-regression.js` runs on every CI matrix leg (ubuntu/macos/windows × Node 18/22) after the symlink-defense probe. It installs the **published** `akili-specs@2.23.2` into an isolated sandbox with `npm install --prefix <tmp>` and invokes that sandbox's own extracted `bin/akili.js` directly (not `npx` — on a cold runner `npx akili-specs@<version>` resolves by *bin name*, and the package's bin is named `akili`, not `akili-specs`, which fails outright with `sh: akili: not found`; the isolated prefix also can never silently resolve to a pre-existing global install the way `npx` can), alongside the working tree's `bin/akili.js`, into separate temp targets for each of `claude`, `opencode`, and `antigravity`, then compares the sorted relative file list and per-file SHA-256 of the two trees — the regression gate for the Codex registry generalization (`TOOL_REGISTRY` per-type roots + `commandsAsSkills`/`sharedSkillsRoot` flags). Any path present on only one side fails the job. A path present on both sides with a differing hash is tolerated **only** when the working tree's copy is byte-identical to its own current `.claude`/repo source file (a canonical-file edit this or another spec made, e.g. adding Codex paragraphs to a command) — printed as `EXPECTED-DIFF <tool> <path>` — and the tool then reports `LAYOUT-IDENTICAL <tool> (<n> expected source diffs)`; a byte-for-byte match with zero diffs reports `IDENTICAL <tool>`. Any other content difference (the install doesn't even match its own source) is an installer bug, not a canonical edit, and fails the job naming the path. To guard against a false pass (both sides silently resolving to the same local install), it also reads the resolved version from the sandbox's own installed `package.json` and fails loudly if it is not exactly `2.23.2`. It then runs the shared-root detection fixture in-process, extended from two states to **four** by the Cursor install target (symmetric per design DD-2): a scratch home with a foreign-only `~/.agents/skills` must not auto-detect Codex **or** Cursor (S1); adding one `akili-<cmd>/SKILL.md` must detect Codex only (S2); adding Cursor's own resources root instead must detect Cursor only, with Codex suppressed (S3); having both present must detect both (S4) — printing `FIXTURE OK: four-state detection holds` or a named false-positive/false-negative failure per state. The step **skips** (prints `SKIP: registry unreachable (<reason>)` and exits 0) only when the npm registry is unreachable — a real install failure (bad arguments, a broken package) still fails the job.

## Troubleshooting

If commands do not appear in your AI tool:

- Run `akili doctor --tool <claude|opencode|antigravity|codex|cursor|both|all>`.
- Restart Claude Code, OpenCode, Google Antigravity, Codex, or Cursor (or open a new chat).
- Confirm the target directory is the one your tool reads.
- Re-run with `--force` if older files should be replaced.

If helper resources are missing:

- Run `akili doctor --tool <target>` without `--commands-only` or `--skills-only`.
- Re-run `akili install --tool <target> --force`.
