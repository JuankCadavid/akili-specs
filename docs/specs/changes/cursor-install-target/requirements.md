# Requirements: Cursor as a Fifth Install Target

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/cursor-install-target` |
| Depth | **Standard** — cross-cutting (installer + constitution Steps 8C/8E/8F + registry + per-host prose across ~14 files) but no data, auth, or API; the installer half is data-only (no registry refactor), the risky half is the gate script's third host branch and the prose |
| Type | Change |
| Approval Mode | `gated` (inherited from `proposal.md`) |
| Status | Draft — Phase 1, **amended after Judgment Day round 1** (Fix only; FR-1, FR-4, FR-5, FR-6, FR-8, FR-9, FR-10, NFR-7, §4, §8 — see `judgment.md`) |
| Date | 2026-10-01 |
| Source | `proposal.md` (approved 2026-10-01 by running `/akili-specify`; Release Classification: **minor**) |
| Format precedent | `docs/specs/archive/2026-09-17-changes--codex-install-target/requirements.md` — this repo has no `docs/specs/general-setup/` (it packages the methodology rather than consuming it) |
| Deviations from proposal | (1) The proposal named a "packaged copy" of `akili-tasks-gate.sh` under `.claude/hooks/`; **no such file exists** (`ls .claude/hooks` → no entry, 2026-10-01). The script's only source is the Step 8F inline block in `.claude/commands/akili-constitution.md`; FR-6 edits that block and its `docs/commands/` mirror. (2) The proposal's Step 8F Cursor variant was "a `.cursor/hooks.json` `preToolUse` entry". Cursor **imports** a project's `.claude/settings.json` hooks by default (`PreToolUse`→`preToolUse`, `Edit`→`Write`, exit code 2 honored — <https://cursor.com/docs/reference/third-party-hooks>, `Last verified: 2026-10-01`), so the default Cursor path is the **existing** Claude Code entry plus a Cursor host row in the script; a native `.cursor/hooks.json` entry is the fallback, not the default (FR-6). (3) The `doctor` Environment row probes `cursor-agent` (the unambiguous binary name; `agent` is its documented alias) — see FR-3 |

## 2. Executive Summary

A developer whose host is Cursor (IDE agent or the `agent` CLI) can run `akili install --tool cursor` and get the full AKILI-SPECS lifecycle: the 11 commands installed as Cursor skills (invoked `/akili-execute`, …), the 24 packaged skills, and the helper resources, in the roots Cursor's current docs define. `doctor`, `update`, `init`, and auto-detection treat Cursor as a first-class target. The installer adds **one data entry in the Codex shape** — no registry refactor. The methodology's per-host guidance gains a Cursor variant wherever it names hosts today, and on Cursor both structural guarantees hold: **author ≠ auditor** via `.cursor/agents/*.md` model bindings with a native `readonly: true` on the Reviewer, and the **`[x]`-without-evidence gate** via Cursor's import of the project's Claude Code hook, made safe by a Cursor host row in the gate script. What is installed for Claude Code, OpenCode, Antigravity, and Codex does not change; the only content that changes on those hosts is what this spec edits in the canonical command files, identically for every host.

## 3. Glossary

| Term | Meaning |
|---|---|
| **Cursor** | The Cursor IDE agent and the Cursor CLI (`agent` binary, installed alongside `cursor-agent`; config home `$CURSOR_CONFIG_DIR`, default `~/.cursor`) |
| **Agent Skills root** | `~/.agents/skills` (user) and `<repo>/.agents/skills` (project) — the standard root Cursor and Codex both scan. Cursor additionally reads `~/.cursor/skills`, `.cursor/skills`, and — "for compatibility" — `~/.claude/skills`, `.claude/skills`, `~/.codex/skills`, `.codex/skills` |
| **Command-as-skill** | A command file `akili-<name>.md` installed as `<skills-root>/akili-<name>/SKILL.md`, unchanged in content; invoked `/akili-<name>` in Cursor (its frontmatter already carries `name` + `description`, which Cursor requires) |
| **Resources root** | `<cursor-home>/akili` (global) or `./.cursor/akili` (local): persona templates, `digests.json`, helper scripts, `.mcp.json.example` |
| **Step 8E wrapper** | A tool-native agent definition binding one `.agents/<role>.md` persona to a model. On Cursor: `.cursor/agents/akili-<role>.md` (Markdown + YAML frontmatter) |
| **Step 8F gate** | The harness hook that blocks a `tasks.md` `[x]` write lacking PASS evidence in `execution.md`. On Cursor: the project's `.claude/settings.json` `PreToolUse` entry, imported by Cursor, or a native `.cursor/hooks.json` `preToolUse` entry |
| **Third-party import** | Cursor's default-on setting (*Include Third-Party Plugins, Skills, and Other Configs*) under which `.claude/settings.json`, `.claude/agents/`, and `.claude/skills/` are read by Cursor |
| **Effort parameter** | Cursor's bracket syntax on a model ID — `claude-opus-5[effort=high]` — the Effort dial's native binding on this host |
| **Verification pin** | A `Last verified: <date>` + URL next to every Cursor behavior claim in commands and docs |
| **Live validation** | Exercising the installed result inside a real Cursor session (IDE **and** CLI), recording both versions |

## 4. System Context & Scope

| Surface | Files |
|---|---|
| Installer | `bin/akili.js` — `defaultPaths` (`:113-128`), `TOOL_REGISTRY` (`:136-172`; Codex entry `:164-171` carries `commands: []`, `commandsAsSkills`, `sharedSkillsRoot`), `getArgs` flags + validation (`:251-291`), `--local` bases (`:300-303`), `TOOL_ROOT_ARGS` (`:567-572`; dispatch `:575`), `ALL_TOOLS`/`isToolInstalled`/`toolFlagFor` (`:379-452`; shared-root detection branch `:392-405`), `cleanupLegacyFiles` shared-root ban (`:613`), `installTool` commands-as-skills branch (`:670`), `doctorTool` (`:1061`, `:1102`, Codex legacy line `:1131`), `RECOMMENDED_ENV` (`:1190-1218`; `appliesTo` filter `:1225`), post-install hints (`:971-976`), `runInteractiveInit` (`:1905-1968`; options `:1928-1930`), help (`:190-220`). All line numbers at `7cd681a` |
| CI | `.github/workflows/ci.yml` runs `install --tool all --dry-run`, `--force`, `doctor --tool all` (`:44-53`); those steps now cover Cursor. `scripts/ci/install-layout-regression.js` diffs `SHIPPING_TARGETS = ["claude", "opencode", "antigravity"]` (`:80`) against the published v2.23.2 and runs the Codex detection fixture (`:522-552`); it gains a Cursor fixture (FR-4) |
| Tests | `test/` (`node:test`, drives the CLI as a subprocess with `HOME` redirected — `test/agents-doctor-io.test.js:30-40`); a new test file covers the shared-root pair (FR-2, FR-4) |
| Constitution | `.claude/commands/akili-constitution.md` — **Step 7 template-source list (`:411-416`: one line per host, no Cursor line)**, Step 8C (`:464-590`: host list "all four" at `:523-524`, column rule, CLI-invocation rule), Step 8E (`:636-846`: per-host bullets; `.agents/` tenant table `:811-818`), Step 8F (`:847-1113`: inline gate script `:869-978` — `Edit` arm `:929-932`, `Write` arm `:933-935`, count comparison `:967`; host-data table `:1005-1008`; denial mechanism `:1020-1027`; `settings.json` merge `:1029-1049`; Codex `hooks.json` merge `:1051-1074`; honesty note `:1099-1106`), Step 9 summary lines (`:1128-1131`), Verification Checklist (`:1158-1160`) |
| Execution guidance | `.claude/commands/akili-execute.md` (spawn mechanics `:59-60`, model checkpoint `:88`, Unattended Mode `:366`), `.claude/commands/akili-test.md` (`:56`, `:85`), `docs/flow.md` (`:254`, `:350-358`, `:391`). `.claude/templates/leader.md` enumerates no hosts (`grep -ci codex` → 0) and gets **no edit** |
| Registry | `docs/model-routing.md` — tier table (`:118-125`, five columns today: Claude Code · OpenCode · Antigravity · Codex · Fallback), *Enforced routing* table (`:488-493`), Codex effort paragraph (`:524-549`), CLI-invocation and *How to apply per tool* sections |
| Docs mirrors / root docs | `docs/cli.md` (36 Codex sites), `docs/commands/akili-constitution.md`, `docs/commands/akili-execute.md`, `docs/commands/akili-test.md`, `docs/commands/README.md:3`, `docs/README.md:3,10,43`, `README.md` (badges `:33-34`, intro `:14,40`, canonical note `:61`, prerequisites `:135`, target table `:164-171`, doctor examples `:220-235`, restart line `:242`, invocation note `:246`), `.claude/README.md:3-10`, `AGENTS.md:3,7,11,37`, `CONTRIBUTING.md` (1 hit) |
| Release | `CHANGELOG.md` under Unreleased (minor) |
| Current behavior (cited) | Cursor loads skills from `~/.agents/skills`, `~/.cursor/skills`, and the compatibility roots `~/.claude/skills`, `~/.codex/skills` (<https://cursor.com/docs/context/skills>, `Last verified: 2026-10-01`) — so a Claude Code install already exposes the 24 skills to Cursor, and a Codex install exposes commands + skills. Cursor loads subagents from `.cursor/agents/`, `.claude/agents/`, `.codex/agents/` and their `~/` equivalents (<https://cursor.com/docs/context/subagents>, same date). Cursor imports Claude Code hooks from `.claude/settings.local.json` → `.claude/settings.json` → `~/.claude/settings.json`, mapping `PreToolUse`→`preToolUse` and `Edit`→`Write`, honoring `hookSpecificOutput.permissionDecision: "deny"` and exit code 2 (<https://cursor.com/docs/reference/third-party-hooks>, same date). What `tool_input` fields a `preToolUse` `Write` carries — imported or native — is `UNVERIFIED — confirm at source before relying on it`: the third-party page is silent, and the raw hooks page (<https://cursor.com/docs/agent/hooks>, `curl` 2026-10-01) documents **no** Write payload at all (`new_content`: 0 occurrences; the only `file_path` samples are `afterFileEdit`, `beforeReadFile`, `beforeTabFileRead`) |
| Out of scope | `~/.cursor/skills` as the default root; `.cursor/rules/*.mdc`; `akili notifications` for Cursor; Cloud Agents/Bugbot/SDK/Custom Modes; the accidental `~/.claude/skills` exposure (documented, not altered); any change to the other four targets' layouts |

## 5. Stakeholders / Personas

| Stakeholder | Interest |
|---|---|
| Cursor-hosted developer | One install command; commands in the `/` picker; the triad and the gate work as on Claude Code |
| Codex users | Nothing changes; the shared skills root is written once. `--tool all` additionally writes `~/.cursor/akili` |
| Claude Code users who also open Cursor | Their project's `.claude/agents/` wrappers and `settings.json` hook are already read by Cursor; this spec tells them what that means and closes the gate's silent-allow hole |
| Existing OpenCode / Antigravity users | Zero behavior change |
| The Leader agent running inside Cursor | Unambiguous spawn, model-switch, depth-limit, and hook-enforcement instructions for its host |
| Methodology maintainer | A fifth target with no new installer concept; claims pinned so churn is detectable |
| `/akili-audit` | A fifth registry column to compare against; no new audit category |

## 6. Functional Requirements

### FR-1: `cursor` is a selectable install target

The installer SHALL accept `cursor` wherever a tool name is accepted today: `--tool cursor`, `--tool all` (which becomes the five-host switch), the `init` wizard, and `doctor`/`update`. `--tool both` SHALL keep meaning Claude Code + OpenCode (proposal Q2).

#### Scenario: Explicit install

- GIVEN a home directory with no AKILI files
- WHEN the user runs `akili install --tool cursor`
- THEN the installer writes the layout in FR-2 and prints a `CURSOR target:` block naming **both** the config home and the skills root (the Codex header form, `toolTargetLabel`), followed by the standard summary table
- AND the post-install hints tell the user to restart Cursor or open a new chat, and to verify with `akili doctor --tool cursor`
- BUT it must NOT write anything under `~/.claude`, `~/.config/opencode`, `~/.gemini`, or `~/.codex`
- AND IT MUST reject `--target` combined with `--tool all` exactly as today

#### Scenario: `all` and `both`

- GIVEN `--tool all`
- WHEN install/update/doctor run
- THEN Claude Code, OpenCode, Antigravity, Codex, **and Cursor** are processed in that order
- AND `--tool both` still resolves to exactly `["claude", "opencode"]`
- AND IT MUST print `akili doctor --tool all` as the verify hint only when all five tools were processed, `--tool both` only for the Claude + OpenCode pair, and one `akili doctor --tool <t>` line per tool for any other combination (e.g. an auto-detected `{codex, cursor}` pair prints two lines)

#### Scenario: Auto-detection

- GIVEN `<cursor-home>/akili/` exists and is non-empty, and no `--tool` was passed
- WHEN `akili update` runs
- THEN Cursor is included in the auto-detected list and refreshed
- BUT it must NOT treat a populated `~/.agents/skills/` alone as evidence that Cursor is installed, and it must NOT treat an `akili-*/SKILL.md` command skill in the shared root as evidence of **Cursor** when `<cursor-home>/akili` is absent — Cursor detects by its resources root only
- AND IT MUST be symmetric: on a Cursor-only machine (Cursor resources present, no `<codex-home>/akili`), the same command skills must NOT make `akili update` detect **Codex** — the shared-root branch (`bin/akili.js:392-405`) today keys Codex on resources **or** command skills, so the command-skill probe counts for Codex only while no sibling tenant on the same skills root has a populated resources dir (design DD-2); a Codex `--skills-only`/`--commands-only` install beside Cursor resources is therefore not auto-detected (documented; `--tool codex` still works)
- AND IT MUST keep the first-run default (`claude`) when nothing is detected

#### Scenario: Interactive init

- GIVEN `akili init`
- WHEN the tool question is shown
- THEN it lists Cursor as option 5, Both as 6, and "All five" as 7 — inputs `5` and `6` change meaning (today `5` = Both, `6` = All four, `bin/akili.js:1929-1930`), which `CHANGELOG.md` and `docs/cli.md:18` record
- AND choosing local for Cursor maps to `./.agents/skills` + `./.cursor/akili`

### FR-2: Cursor layout — commands as skills, skills, resources; shared root with Codex

The installer SHALL write, for Cursor: every command as `<skills-root>/akili-<name>/SKILL.md` (content byte-identical to `.claude/commands/akili-<name>.md`), every packaged skill as `<skills-root>/<skill>/SKILL.md` plus its `references/` tree, and resources under `<resources-root>/{templates,scripts,.mcp.json.example}` exactly as for Codex. Defaults: skills root `~/.agents/skills`, resources root `<cursor-home>/akili` where `<cursor-home>` is `$CURSOR_CONFIG_DIR` when set and non-blank, else `~/.cursor`; `--local` maps to `./.agents/skills` and `./.cursor/akili`; `--cursor-target <path>` overrides the config home (resources at `<path>/akili`); `--cursor-skills-target <path>` overrides the skills root; `--target <path>` with `--tool cursor` selects the single-root layout (`<path>/akili` + `<path>/skills`) exactly as `--tool codex` does.

#### Scenario: Codex and Cursor share one skills root

- GIVEN a clean home and `--tool all`
- WHEN install runs
- THEN the Codex block installs the 35 skill directories into `~/.agents/skills` and the Cursor block reports every one of them `skip existing`, writing only `~/.cursor/akili`
- AND with `--force` both blocks overwrite, the end state is byte-identical to a single-target install, and no `*.tmp` leftovers remain
- BUT it must NOT write a second copy of any skill under `~/.cursor/skills` or anywhere else by default
- AND IT MUST produce, for `--tool cursor` alone on a clean home, a `~/.agents/skills` tree byte-identical to the one `--tool codex` alone produces (same source, same mapping — the FR-4 Cursor fixture)

#### Scenario: Skip-by-default and foreign skills

- GIVEN a prior Cursor install, and a foreign skill `~/.agents/skills/tdd/SKILL.md` planted before the run
- WHEN `akili install --tool cursor` runs again without `--force`
- THEN every existing file is reported `skip existing` and none is rewritten, the foreign `tdd` included
- BUT it must NOT delete any directory in the shared root (`cleanupLegacyFiles` never runs against a `sharedSkillsRoot` — `bin/akili.js:613`, DD-11 of the Codex spec)

#### Scenario: Dry run and partial installs

- GIVEN `--dry-run`
- WHEN install runs for Cursor
- THEN the planned writes are listed and nothing is written, with command skills listed under `akili-<name>/SKILL.md`
- AND `--commands-only` writes exactly the 11 command skills; `--skills-only` exactly the 24 packaged skills
- BUT it must NOT write a `commands/` directory under either root in any mode

### FR-3: `doctor` covers Cursor

`akili doctor --tool cursor` SHALL check each command at `<skills-root>/akili-<name>/SKILL.md`, each skill, each resource file, and `--fix` SHALL restore missing items through the same paths. The Environment section SHALL gain a `cursor-agent` row (binary probe `cursor-agent --version`, `appliesTo: ["cursor"]`) with the same never-fails semantics as the `codex` row; its `withoutIt` text names `agent` as the documented alias and the install command (`curl https://cursor.com/install -fsS | bash`, <https://cursor.com/docs/cli/overview>, `Last verified: 2026-10-01`).

#### Scenario: Healthy install

- GIVEN a complete Cursor install
- WHEN `doctor --tool cursor` runs
- THEN all commands, skills, and resources report `OK` and the run exits 0
- AND the Environment row shows the CLI version when the binary works (local: `2026.09.26-dd393fe`)

#### Scenario: Binary absent

- GIVEN no `cursor-agent` binary (CI runners)
- WHEN `doctor --tool cursor` runs
- THEN the Environment row reports it as not found with the install hint
- BUT it must NOT flip the exit code or count toward `missing`
- AND IT MUST not print the row at all for `--tool claude` (the `appliesTo` filter, `bin/akili.js:1225`)
- AND the row's text names `agent` as the documented alias and both install commands (macOS/Linux `curl`, Windows `irm 'https://cursor.com/install?win32=true' | iex`)

#### Scenario: Codex doctor unchanged

- GIVEN a Codex-only install
- WHEN `doctor --tool codex` runs
- THEN its output is unchanged by this spec (the Codex legacy-copies line at `:1131` stays `tool === "codex"`-guarded; Cursor has no legacy root of its own)

### FR-4: Zero regression on the four shipping targets, no registry refactor

`TOOL_REGISTRY.cursor` SHALL be a data entry in the exact shape of `TOOL_REGISTRY.codex`; no existing registry entry, root-args entry, or install/doctor branch SHALL change for the other four targets.

#### Scenario: Shipping targets unchanged

- GIVEN the published `akili-specs@2.23.2` baseline trees for `claude`, `opencode`, `antigravity` (`scripts/ci/install-layout-regression.js`, unchanged `SHIPPING_TARGETS`)
- WHEN the working tree runs the same installs
- THEN layout identity holds and every content diff is an `EXPECTED-DIFF` to a canonical-file edit this spec made
- AND a new in-process fixture installs `--tool codex` and `--tool cursor` into two scratch homes sharing one `--*-skills-target` and asserts (a) the second install reports 0 installed and every skill file skipped under the shared root (35 directories — 11 command skills + 24 skills — which is 210 files in the summary table's per-file count), (b) the sorted relative file lists of the two skills trees are identical, (c) each tool's resources root exists and the other's does not
- AND the detection fixture asserts **four states**: foreign-only shared root → neither Codex nor Cursor detected; + `akili-execute/SKILL.md` → Codex detected, Cursor **not** (the existing assertion at `install-layout-regression.js:543-545`, unchanged); + `<cursor-home>/akili/templates/leader.md` → Cursor detected, Codex **not**; + `<codex-home>/akili/templates/leader.md` → both detected
- AND every new fixture and test pins **both** `CODEX_HOME` and `CURSOR_CONFIG_DIR` to the scratch home (the existing fixture pins only `CODEX_HOME`, `:524`), so a developer's or runner's environment never leaks into detection
- AND `doctor --tool codex` output on a Codex-only fixture is captured before and after the change and compared (NFR-6)
- BUT the step must NOT fail the job when the npm registry is unreachable (existing `SKIP` behavior)
- AND IT MUST hold on Windows paths (CI matrix)

### FR-5: Step 8E binds personas to models on Cursor

`/akili-constitution` Step 8E SHALL gain a Cursor bullet that, with user approval, writes `.cursor/agents/akili-{leader,implementer,reviewer,tester}.md`, each with YAML frontmatter `name`, `description`, `model` from the registry's Cursor column (concrete ID, optionally with an `[effort=<rung>]` parameter mapped from the Effort dial), and a body that **references** `.agents/<role>.md` (never duplicates it). The Reviewer wrapper MUST carry `readonly: true` and MUST bind a model different from the Implementer's; no other wrapper carries `readonly`. The bullet SHALL state the nested-spawn limit ("the main agent and its direct subagents can launch subagents, but a subagent launched by another subagent can't launch further ones" — <https://cursor.com/docs/context/subagents>, `Last verified: 2026-10-01`) and its consequence: a Leader that is itself a spawned subagent still reaches Implementer/Reviewer/Tester (depth 2); those workers cannot spawn (depth 3), which the personas never require.

#### Scenario: Constitution on a Cursor-hosted project

- GIVEN the user accepts Step 8E on Cursor
- WHEN the wrappers are written
- THEN `/akili-execute` and `/akili-test` prefer them, and the Step 9 summary names the four files, the two distinct models, and that the Reviewer is read-only by `readonly: true`
- BUT it must NOT add `model:` to any command file or inject a model in the installer
- AND IT MUST name the overlap with `.claude/agents/`: Cursor reads that directory too, and on a same-name clash "`.cursor/` takes precedence over `.claude/` or `.codex/`" (<https://cursor.com/docs/context/subagents>, `Last verified: 2026-10-01`) — so the Cursor wrappers win without renaming; what Cursor does with the Claude Code alias `model: opus` in a project that has **only** `.claude/agents/` wrappers stays `UNVERIFIED` (the bullet carries the marker; FR-10 observes it; design DD-4 records the one-line fallback)
- AND the bullet MUST state that `readonly: true` restricts "file edits" and "state-changing shell commands", and that the Reviewer needs neither — the Leader passes the diff and the evidence (`/akili-execute` Step 2.3); whether read-only verification commands are allowed is observed at FR-10, never assumed

#### Scenario: Effort mapping

- GIVEN the Effort dial default for a role
- WHEN the wrapper's `model` is written
- THEN the dial maps onto the bracket parameter (`low`→`[effort=low]`, `medium`→`[effort=medium]`, `high`/`xhigh`/`max`→ the highest rung the model exposes), with `<CONFIRM>` where the model's accepted rungs are unknown
- BUT the mapping must NOT claim rungs not confirmed on the live `/model` picker at FR-10

### FR-6: Step 8F gate is enforced on Cursor

Step 8F SHALL make the `[x]`-without-PASS gate hold on Cursor by two obligations, and SHALL claim it only after FR-10 confirms it.

**(a) The gate script's `Write` arm gains a Cursor host row.** Tool `Write` (Cursor maps `Edit`→`Write` on import; native edits also arrive as `Write`), target path `.tool_input.file_path`, old content = the current file on disk, new content = **an unverified field**: Cursor documents no `preToolUse` Write payload (raw <https://cursor.com/docs/agent/hooks>, 2026-10-01 — `new_content`: 0 occurrences), so the arm tries the candidate names `content` then `new_content`, and the FR-10 raw capture records which one, if either, arrives. The `Write` arm (`akili-constitution.md:933-935`) SHALL deny fail-closed (exit 2, host-neutral reason on stderr) when the target is a `docs/specs/*/tasks.md` path and the extracted new content is empty — today that case falls through to `exit 0` at the count comparison (`:967`), a silent allow. The `Edit` arm (`:929-932`) and the Codex `apply_patch` branch are NOT changed: an `Edit` with an empty `new_string` and a removal-only `apply_patch` keep today's exit codes.

**(b) Step 8F's hook-entry instruction for Cursor.** Cursor imports the project's `.claude/settings.json` `PreToolUse` entry by default (third-party import on), which Step 8F already writes when accepted (`:1029-1049`). On a Cursor-hosted project the step SHALL write that entry first, then **ask the user one question** — whether Cursor's *Include Third-Party Plugins, Skills, and Other Configs* setting is on (its default) — because that toggle is a Cursor UI setting no repository file reveals. *On* → no native entry. *Off* or *unknown* → write a native `.cursor/hooks.json` entry (`version: 1`; `hooks.preToolUse[]` with `matcher: "Write"`, `failClosed: true`, and a command pointing at the **resolved** script: an existing `.claude/hooks/akili-tasks-gate.sh`, else an existing `.codex/hooks/` copy, else a new `.cursor/hooks/akili-tasks-gate.sh` — never a path that does not exist). Never both entries, so the script never runs twice per write. Merge rules restate every `settings.json` clause: read first; abort on invalid JSON naming the file; append without clobbering foreign entries (the local `~/.cursor/hooks.json` holds another tool's `preToolUse` entries); idempotent on re-run. The Step 9 summary SHALL record the answer and which entry exists.

**(c) Honesty note.** Until FR-10 records a denial and an allow observed live on Cursor, the note SHALL read: **enforced** on Claude Code and Codex; **pending live validation** on Cursor (three unverified contracts — payload field, full-file content, allow-path output — design P-6/P-16/P-17); **instructional** on OpenCode and Antigravity. FR-10 flips "pending" to "enforced" or records what was observed instead.

#### Scenario: Gate fires in Cursor via the imported hook

- GIVEN a project with the Claude Code Step 8F scaffold, third-party import on, a `tasks.md` that already holds `[x]` entries, and `execution.md` lacking PASS evidence
- WHEN the Cursor agent writes `tasks.md` flipping one more task to `[x]`
- THEN the write is denied and the denial names the evidence-first rule
- AND WHEN PASS evidence is present and the same write is made, THEN the write is **allowed** — the allow path's empty-stdout `exit 0` must be observed as an allow, not as "invalid response, blocked"
- AND IT MUST be verified live once, with the Cursor version, the raw `preToolUse` payload (every top-level field, `tool_input` field names, and `cwd`), and both outcomes recorded
- BUT the script must NOT fall through to exit 0 on a `docs/specs/*/tasks.md` `Write` whose content it could not extract
- AND IF the allow path is blocked (empty stdout read as invalid), the design's two candidate mechanisms (payload-marker-gated `{"permission":"allow"}` output; `failClosed: true` native entry) are tried in order and the one Cursor honors is recorded (design DD-7)

#### Scenario: Empty-content fail-closed (`Write` only)

- GIVEN a `Write` payload for `docs/specs/x/tasks.md` whose `tool_input` carries neither `content` nor `new_content`
- WHEN the script runs
- THEN it exits 2 with a host-neutral reason ("write payload carried no readable new content")
- AND the existing Claude Code `Edit` (with `new_string`; and with an **empty** `new_string`), Claude Code `Write` (with `content`), and Codex `apply_patch` (incl. a **removal-only** patch) fixtures produce the same exit codes as before
- BUT the deny must NOT be placed after the `case` statement where it would also catch the `Edit` and `apply_patch` arms

#### Scenario: Corrupt or foreign hooks file

- GIVEN `.cursor/hooks.json` exists and is invalid JSON
- WHEN Step 8F's native fallback runs
- THEN it aborts without writing and names the file
- AND GIVEN it is valid and holds foreign `preToolUse` entries, THEN the AKILI entry is appended with `failClosed: true` and every foreign entry survives byte-for-byte

### FR-7: Model Routing registry gains Cursor

`docs/model-routing.md` SHALL add a Cursor column to the tier table (T1–T6), a `.cursor/agents/*.md` row in *Enforced routing* (model value: concrete ID + optional `[effort=…]`; Reviewer `readonly: true`), a Cursor bullet in *How to apply per tool* (`/model` in the `agent` CLI — pinned to <https://cursor.com/docs/cli/reference/configuration>; the IDE half carries the `UNVERIFIED — confirm at source before relying on it` marker until a source or FR-10 confirms it — *amended at execute time 2026-10-01, see `execution.md` T5*), a `cursor` row in the CLI-invocation table (`agent` / `cursor-agent`; commands invoked `/akili-<name>`), and a Cursor paragraph in *Why these models* noting that the roster is multi-vendor, so author ≠ auditor can be satisfied across vendors inside one host. `/akili-constitution` Step 8C SHALL scaffold five host columns and a `cursor` invocation row (today it states four, `:523-524`). Column values SHALL name families, not slugs (the Antigravity/Codex precedent — Cursor exposes no floating alias besides `auto`; `~/.cursor/cli-config.json` shows `aliases: []` for the selected model), confirmed against the user's `/model` roster at execution, `<CONFIRM SLUG>` otherwise, with a verification pin.

#### Scenario: Audit sees no drift

- GIVEN a project constitution scaffolded after this change
- WHEN `/akili-audit` runs Model Registry Drift
- THEN the project registry and the packaged default agree on the Cursor column
- BUT the column must NOT contain a model name that was not confirmed against the live picker or the pricing page on the pinned date

### FR-8: Per-host guidance names Cursor

`/akili-execute` (spawn mechanics, model checkpoint switch wording, Unattended Mode), `/akili-test` (Tester spawn and model checkpoint), and `docs/flow.md` (per-host launch; `.agents/` resolution paragraph and tenant table) SHALL name Cursor explicitly wherever they enumerate hosts today. The spawn paragraph SHALL say: with `.cursor/agents/` wrappers present, the Leader invokes the named subagent (explicitly, `/akili-implementer`-style mention, or by describing the role — Cursor's Task tool launches it; several Task calls in one message run in parallel), consumes the returned report, and respects the depth limit from FR-5. `.claude/templates/leader.md` enumerates no hosts and is out of scope.

#### Scenario: Leader inside Cursor

- GIVEN a Leader running `/akili-execute` in Cursor with Step 8E wrappers present
- WHEN it reaches the spawn step
- THEN the command text tells it to invoke the named `akili-implementer` / `akili-reviewer` subagents and how the result returns
- AND the model checkpoint tells it the switch is `/model` in Cursor
- BUT Unattended Mode must NOT claim a Cursor equivalent unless verified live — otherwise it states "no verified equivalent", the OpenCode wording

#### Scenario: `.agents/` tenants unchanged

- GIVEN the tenant table (`akili-constitution.md:811-818`, `docs/flow.md:356-358`)
- WHEN Cursor is added
- THEN the table gains no row — Cursor's wrappers live under `.cursor/agents/` and its project skills under the existing `.agents/skills/` tenant — and the prose states that Cursor reads that tenant plus `.claude/skills`, `.claude/agents`, `.codex/agents` through its compatibility roots
- AND the `.agents/skills/` row's cell text (`akili-constitution.md:818`, `docs/flow.md:358` — today "Codex repo-scope skills / `akili install --tool codex --local`") names both tenants and both `--local` commands, so the table does not go stale while its row count stays the same

### FR-9: Documentation coherence and claim pinning

Every Cursor behavior claim in commands and docs SHALL carry a verification pin. Mirrors (`docs/commands/*.md`, `docs/cli.md`), root docs (`README.md`, `docs/README.md`, `.claude/README.md`, `AGENTS.md`, `CONTRIBUTING.md`), and `CHANGELOG.md` SHALL reflect five targets wherever they say four. `docs/cli.md` SHALL document the Claude Code + Cursor skill overlap (compatibility roots) and the Codex + Cursor shared root in one short section.

#### Scenario: Aggregate claim falsification (KZ-002, KZ-changes--kaizen-loop-closure-2)

- GIVEN the statement "every command is installed as a Cursor skill" in README/CHANGELOG
- WHEN the closure sweep runs
- THEN `doctor --tool cursor` on a fresh install is the grep that would falsify it, and it reports 11/11
- AND IT MUST sweep the pattern set `four (install )?targets|four tools|four hosts|[Aa]ll four|four-host|other three|Claude Code, OpenCode, (Google )?Antigravity,? (and|or) (OpenAI )?Codex( CLI)?|claude, opencode, antigravity, codex|Claude Code and Codex|Claude Code \+ OpenCode \+ Antigravity \+ Codex` with exactly `git grep -nE "<pattern>" -- '*.md' '*.js' '*.yml' ':!docs/specs' ':!releases'` — **baseline 2026-10-01 at `7cd681a`: 53 matching lines in 18 files (61 occurrences with `-o`)**; `releases/*.md` is excluded by the command and holds 6 further lines (9 occurrences) of frozen release notes, kept — of which `.claude/skills/**` (3 lines, unrelated prose) and `test/agents-doctor.test.js:569` ("All four personas" — a persona count, not a host count) are expected keeps; update or record a justification for every other line, keyed on the obligation (a sentence that obliges "all install targets" without naming a number is a hit too; the Step 7 template-source list `akili-constitution.md:411-416` is one such site the pattern does not match)
- AND the other commands' model-checkpoint lines ("`/model …` in Claude Code, the model selector in OpenCode") are deliberate keeps, as they were for Codex

### FR-10: Live validation is a closing gate

Before the spec is complete, the installed result SHALL be exercised in a real Cursor session on a current release — **IDE and CLI separately** — and the evidence SHALL be recorded in `execution.md`: both versions and `which agent cursor-agent` on each host; `/akili-propose` and `/akili-execute` visible in the `/` picker and loading; whether a `/akili-*` skill is ever auto-invoked from a description match (R6); whether a skill present in both `~/.claude/skills` and `~/.agents/skills` shows once or twice; a `.cursor/agents/` wrapper spawning the Reviewer on a model different from the Implementer, `readonly: true` observed denying a write, and whether a read-only verification command still runs; the `.claude/agents/` alias outcome (what `model: opus` does when only Claude wrappers exist); the raw `preToolUse` payload delivered to the imported `.claude/settings.json` hook — every top-level field, the `tool_input` field names, whether the new content is the whole file, and `cwd` — the gate **denying** a `[x]` write without PASS and **allowing** one with PASS; whether the CLI (`agent`) honors `.cursor/agents/` and hooks the same way; Cursor's `goal` / `loop` / `autopilot` built-ins recorded as observed (no Unattended Mode claim unless one is shown to loop a condition); skill-picker truncation observed or not with 40+ foreign skills present.

#### Scenario: Validation blocked

- GIVEN Cursor cannot be exercised (licensing, network)
- WHEN the validation task runs
- THEN the task is parked `[~]` with the blocker named, the affected claims keep their `UNVERIFIED` marker, and the spec is not archived as complete

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | **Skip-by-default preserved.** No mode of the Cursor target overwrites without `--force`. Verification: FR-2 skip scenario in the new test. |
| NFR-2 | **No fork of skill or command content.** Cursor receives the same bytes as Claude Code and Codex; no `disable-model-invocation` or Cursor-only key is added to any canonical file unless FR-10 observes auto-invocation **and** the user approves a follow-up (never inside this spec). Verification: `diff -r` of the installed `~/.agents/skills` tree vs `--tool codex` output is empty. |
| NFR-3 | **Host-neutral commands.** No `model:`, no Cursor-only prose in command frontmatter. Verification: `grep -n "^model:" .claude/commands/*.md` is empty. |
| NFR-4 | **CI matrix green** (ubuntu/macos/windows × Node 18/22) with Cursor in `--tool all`, doctor never failing on the absent binary, `npm test` green. |
| NFR-5 | **Claims are dated.** Every Cursor claim carries `Last verified` + URL; a claim that could not be exercised carries the `UNVERIFIED — confirm at source before relying on it` marker. |
| NFR-6 | **No registry refactor.** `git diff 7cd681a -- bin/akili.js` touches no line inside the `claude`, `opencode`, `antigravity`, or `codex` entries of `TOOL_REGISTRY`/`TOOL_ROOT_ARGS`, and `doctor --tool codex` output on a fixture is unchanged. |
| NFR-7 | **Gate regression-safe.** The gate script's `Edit` arm and Codex `apply_patch` branch produce identical exit codes on their fixtures after the `Write`-arm change, including an `Edit` with an empty `new_string` and a removal-only `apply_patch` (both `exit 0`); the new fixtures (Cursor `Write` with `content`; with `new_content`; with neither — on a tasks.md path adding a `[x]` with no PASS) all exit 2 after the edit; **the red set is `new_content` and neither-field** (exit 0 before the edit — the silent allow), while the `content` fixture already exits 2 at `7cd681a` because the `Write` arm reads that field today — it is a baseline, not a red (*amended at execute time, T7, 2026-10-01: the original "all three red" clause was an unexecuted present-tense reading — KZ-changes--leader-brief-contract-2*). The fixtures extract the script from the constitution's fenced block (`:870-977`), and the test fails loudly — never skips silently — on a CI leg expected to have `jq` (ubuntu, macos); on windows it skips with a named reason. |

## 8. Defect Classes → Gates

| Defect class this spec can produce | Gate that catches it | Falsifying input |
|---|---|---|
| Wrong Cursor paths (resources or skills land where Cursor does not look) | CI `install --tool all` + `doctor --tool all`; live `/` picker shows `akili-*` | A `MISSING` row on a temp home; live picker without `akili-*` |
| Duplicate skills on a Codex + Cursor machine | FR-4 shared-root fixture (second install: 0 installed, 35 skipped) | Any `install` line under the shared root in the second block |
| Detection cross-talk (Cursor detected on a Codex-only machine or vice-versa) | FR-4 detection fixture, three states | Cursor listed after only `akili-execute/SKILL.md` is present |
| Regression on the four shipping targets | Layout-regression script (three published baselines) + `doctor --tool codex` fixture + NFR-6 diff check | Any path-list diff; any changed line inside another target's registry entry |
| Gate silent allow on Cursor payloads (field name) | NFR-7 fixtures: `Write`+`content` / `+new_content` with a new `[x]` and no PASS → exit 2; empty content → exit 2 | Exit 0 on any of the three (the pre-change reading) |
| Gate silent allow on Cursor payloads (fragment content) | **No offline check** — depends on P-16. Substitute: FR-10 flips a `[x]` on a `tasks.md` that already holds `[x]` entries, with and without PASS | The no-PASS write succeeding |
| Gate allow path blocked on Cursor (empty stdout read as invalid) | **No offline check** — depends on P-17. Substitute: FR-10 observes the with-PASS write being allowed | The with-PASS write being blocked |
| Gate fails open on the imported path (wrong `cwd`, missing `bash`/`jq` → exit 127 or `tool=""`) | FR-10 records `cwd` from the payload; the native entry carries `failClosed: true`; honesty note names the imported path's fail-open default | A no-PASS write succeeding with a hook error in Cursor's log |
| Gate regression on Claude Code / Codex payloads | NFR-7 existing-branch fixtures incl. empty `new_string` and removal-only `apply_patch` | A changed exit code on any existing fixture |
| Double-firing (imported + native entry) | Step 8F's one-question rule forbids both; FR-10 observes one denial line per write | Two denial lines for one write |
| Stale or wrong Cursor claim (docs churn) | Verification pins + FR-10 | A pinned URL no longer stating the claim; a live step behaving differently |
| Prose executability (Leader/constitution text an agent cannot follow) | **No automated check.** Substitute: the FR-10 live walkthrough at the closing HITL pause | A walkthrough step the agent cannot perform from the text alone |
| Skill-picker truncation / unwanted auto-invocation | **No offline check.** Substitute: FR-10 observation, recorded as observed/not | `akili-*` absent from the picker; a `/akili-*` skill firing unasked |
| Aggregate doc claims false (KZ-002) | `doctor` 11/11 + the FR-9 sweep (baseline 53 lines / 18 files, exact command in FR-9) | A "four targets" sentence surviving outside the recorded keeps |

Accepted risk: the exact Cursor versions validated are point-in-time facts; Cursor's compatibility roots and import setting are user-toggleable (*Third-Party Imports*), so a user who disables the import loses the hook until the native entry is scaffolded — Step 8F names the setting so the summary can report which state applies.

## 9. Requirement ID Index

| ID | Title | Owner surface |
|---|---|---|
| FR-1 | `cursor` selectable target | `bin/akili.js` args/tools/init/help, `docs/cli.md` |
| FR-2 | Cursor layout, shared root | `bin/akili.js` registry + `defaultPaths` |
| FR-3 | Doctor covers Cursor | `bin/akili.js` doctor + `RECOMMENDED_ENV` |
| FR-4 | Zero regression, fixtures | `scripts/ci/install-layout-regression.js`, `test/` |
| FR-5 | Step 8E Cursor wrappers | `akili-constitution.md` + mirror |
| FR-6 | Step 8F gate on Cursor | `akili-constitution.md` (script + entry text) + mirror |
| FR-7 | Model Routing Cursor column | `docs/model-routing.md`, `akili-constitution.md` Step 8C |
| FR-8 | Per-host guidance | `akili-execute.md`, `akili-test.md`, `docs/flow.md` + mirrors (`leader.md`: no edit) |
| FR-9 | Doc coherence + pins + sweep | README, docs/, AGENTS.md, CONTRIBUTING.md, CHANGELOG |
| FR-10 | Live validation gate (IDE + CLI) | `execution.md` evidence |
| NFR-1..7 | Skip-by-default, no fork, host-neutral, CI, dated claims, no refactor, gate regression-safe | cross-cutting |
