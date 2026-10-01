# Proposal — Cursor as a Fifth Install Target

**Recommendation:** add `cursor` to the `akili` installer and to the methodology's per-host guidance, treating Cursor the way Codex is treated today — commands installed as Agent Skills into the shared `~/.agents/skills` root, resources under `~/.cursor/akili`, enforced per-role model routing through `.cursor/agents/*.md` wrappers, and the `[x]`-without-evidence guardrail through `.cursor/hooks.json`. Cursor exposes every surface AKILI needs, and its layout is close enough to Codex's that the installer's `sharedSkillsRoot` registry shape is reused **without a structural change**: the fifth target is one registry entry, one flag pair, and prose. Cursor is also the first host that invokes a command skill with the familiar `/akili-<name>` form and binds the Reviewer's read-only restriction as a native frontmatter boolean. One bounded spec, release classified **minor** (new install target).

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/cursor-install-target` |
| Type | Change |
| Approval Mode | gated |
| Status | Proposed |
| Date | 2026-10-01 |
| Author | /akili-propose (T1, Fable 5.1) |
| Depends on | none — `changes/persona-upgrade` is archived and released (v2.30.0) |
| Parallel-safe | **no** — shares `bin/akili.js`, `/akili-constitution` Step 8, and `docs/model-routing.md` with the queued `changes/model-routing-configurator`; sequence them, never run both in flight. The deferred pin-parser bug (`readConstitutionPins`) also touches `bin/akili.js`; it lands after this spec as v2.31.1 or is folded in only by explicit approval |
| Release Classification | **minor** — new install target (`AGENTS.md` → Release Rules: "minor for new commands or install targets") |
| Scope Chunking | Considered and rejected for the same reasons as the Codex spec: single developer on `master`, installer + methodology halves both touch `CHANGELOG.md`/`README.md`, and the only conclusive validation — a live Cursor session — needs both halves. `tasks.md` sequences installer → methodology → live validation |
| Precedent | `docs/specs/archive/2026-09-17-changes--codex-install-target/` — reuse its design decisions (DD-1 data-driven registry, DD-11 shared-root cleanup ban, DD-9 description budget) rather than re-deriving them |

## Intent

Let a developer whose daily host is Cursor (IDE agent or the `agent` CLI) install and run the complete AKILI-SPECS lifecycle — every `/akili-*` command, the packaged skills, the `.agents/` personas with per-role model binding, and the `[x]`-without-PASS-evidence guardrail — with the same `akili install` / `doctor` / `update` ergonomics the other four hosts have, and without the methodology losing any correctness guarantee it holds on Claude Code or Codex.

## Problem / Current Behavior

| # | Today | Consequence |
|---|---|---|
| 1 | `bin/akili.js` `TOOL_REGISTRY` and `ALL_TOOLS` know `claude`, `opencode`, `antigravity`, `codex`; `--tool cursor` fails validation (`bin/akili.js:290-291`, `:379`, run `grep -n "ALL_TOOLS\|--tool must be" bin/akili.js`) | A Cursor user cannot install AKILI as a target at all |
| 2 | **Cursor already sees part of an AKILI install by accident.** Cursor loads skills from `~/.cursor/skills/`, `~/.agents/skills/` and, "for compatibility", from `~/.claude/skills/` and `~/.codex/skills/` (<https://cursor.com/docs/context/skills>, `Last verified: 2026-10-01`). So a Claude Code install exposes the 24 packaged skills to Cursor, and a Codex install exposes the 11 command skills **and** the 24 skills, invocable as `/akili-<name>` | Behavior is accidental, undocumented, and unverifiable: `akili doctor` cannot report it, `update` cannot refresh it for Cursor, Claude Code users get skills but no commands (`~/.claude/commands/*.md` is not a skill root), and a Claude Code **+** Codex user gets every skill twice from two roots with unverified precedence |
| 3 | Cursor has no separate command surface any more: "Both user-level and workspace-level commands are converted to skills with `disable-model-invocation: true`" via `/migrate-to-skills` (<https://cursor.com/docs/context/skills>, `Last verified: 2026-10-01`; local `~/.cursor/skills-cursor/migrate-to-skills` exists, `ls ~/.cursor/skills-cursor`) | The install must target skills, exactly the Codex/Antigravity `commandsAsSkills` path — not a `.cursor/commands/` directory (absent locally: `ls ~/.cursor/commands` → none) |
| 4 | Every host-specific paragraph enumerates four hosts: `/akili-constitution` (54 Codex mentions), `docs/cli.md` (36), `docs/model-routing.md` (25), `README.md` (18), `docs/commands/akili-constitution.md` (10), `docs/flow.md`, `/akili-execute`, `/akili-test`, `docs/README.md`, `.claude/README.md`, `AGENTS.md` ("canonical source for all four install targets") — counts from `grep -ci codex` per file, 2026-10-01 | An agent running AKILI inside Cursor has no instruction for how to spawn the Implementer/Reviewer, which model column to read, or whether the guardrail is enforced |
| 5 | The Step 8F gate script `akili-tasks-gate.sh` answers in Claude Code's (`hookSpecificOutput.permissionDecision`) and Codex's response shapes; Cursor's `preToolUse` expects `{"permission": "deny"}` or exit code 2 (<https://cursor.com/docs/agent/hooks>, `Last verified: 2026-10-01`) | Pointing Cursor at the existing script would run but not block — a silent non-guardrail, UNVERIFIED until exercised live |
| 6 | Step 8E wrappers exist for Claude Code (`.claude/agents/*.md`), Antigravity, Codex. Cursor also reads `.claude/agents/` as a subagent location (<https://cursor.com/docs/context/subagents>, `Last verified: 2026-10-01`), but those wrappers carry Claude Code aliases (`model: opus`) that are not Cursor model IDs | What Cursor does with an unknown `model:` value is UNVERIFIED — confirm at source before relying on it; the project needs Cursor-native wrappers with Cursor IDs |

**Local evidence (2026-10-01):** Cursor CLI `cursor-agent` **2026.09.26-dd393fe** is installed (`which cursor-agent; cursor-agent --version`), config home `~/.cursor/` holds `cli-config.json` (model `composer-2.5`, `aliases: []`), `skills/` (20 foreign skills from other tools), `skills-cursor/` (Cursor's 22 built-ins), an empty `agents/`, and a `hooks.json` whose `preToolUse` / `beforeSubmitPrompt` / `stop` entries belong to another tool (Orca) — so hook merging must never clobber, exactly the Claude Code `settings.json` rule. No `~/.cursor/commands/`, no `./.cursor/` in this repo.

## Proposed Outcome

After this change, on a machine with Cursor (IDE or CLI):

1. `akili install --tool cursor` (and `--tool all`, `akili init` option 6, auto-detection when `~/.cursor/akili/` holds resources or a command skill is present) installs:
   - the 11 commands as skills at `~/.agents/skills/akili-<command>/SKILL.md` — invoked in Cursor as `/akili-execute`, `/akili-specify`, … (same `/` form as Claude Code);
   - the 24 packaged skills at `~/.agents/skills/<skill>/SKILL.md`, byte-identical to the Claude Code copies;
   - helper resources (`.agents/` persona templates, `digests.json`, `.mcp.json.example`) at `~/.cursor/akili/`.
   `--local` maps to `./.agents/skills` + `./.cursor/akili` (Cursor discovers project skills at `.agents/skills/`). `--cursor-target <path>` overrides the config home (default `$CURSOR_CONFIG_DIR` if set, else `~/.cursor` — the `CODEX_HOME` precedent, `Last verified: 2026-10-01` <https://cursor.com/docs/cli/reference/configuration>); `--cursor-skills-target` overrides the skills root (name to settle in design, see Q1).
   **A Codex + Cursor machine installs the skills once:** both targets share `~/.agents/skills`, so `--tool all` writes them under Codex and reports them *skipped* under Cursor — no duplicate skill names reach Cursor's picker.
2. `akili doctor --tool cursor` reports every command (as `<skills>/akili-*/SKILL.md`), every skill, resources, and under *Environment* the `agent` binary (Cursor CLI) with the same never-fails-the-check semantics as `codex` today.
3. `/akili-constitution` Step 8E gains a **Cursor** bullet: `.cursor/agents/akili-{leader,implementer,reviewer,tester}.md` — Markdown + YAML frontmatter (`name`, `description`, `model`, `readonly`), the persona body pointing at `.agents/<role>.md`. `model` takes a concrete Cursor ID with an optional effort parameter (`claude-opus-5[effort=high]` form), so Cursor becomes the second host (after Codex) that binds the Effort dial natively per role; the Reviewer wrapper sets `readonly: true` — the first host with a one-field read-only restriction. Author ≠ auditor becomes structural on Cursor, and because Cursor's roster spans vendors, the Reviewer can differ from the Implementer **by vendor** inside one host.
4. `/akili-constitution` Step 8F offers the same tasks gate for Cursor: `.cursor/hooks.json` (`version: 1`) `preToolUse` entry with a `matcher` on write tools calling the gate script, which gains a Cursor response branch (`{"permission": "deny", "agent_message": …}`). Step 8F's honesty note becomes: **enforced** on Claude Code, Codex, and Cursor; **instructional** on OpenCode and Antigravity.
5. `docs/model-routing.md` gains a Cursor column in the tier registry (families-not-slugs where the roster moves fast — the Antigravity/Codex precedent — confirmed from the user's `/model` roster at specify time), a `cursor` row in the CLI-invocation table (`agent`, `/model`), and an *Enforced routing* row (`.cursor/agents/*.md`).
6. Per-host paragraphs in `/akili-execute` (spawn mechanics: the Leader launches the named `/akili-implementer` subagent via Cursor's Task tool; nested-spawn limit — "a subagent launched by another subagent can't launch further ones" — recorded so a spawned Leader still reaches its workers at depth 2), `/akili-test`, `.claude/templates/leader.md`, `docs/flow.md` name Cursor explicitly.
7. Docs mirrors at parity: `docs/cli.md`, `docs/commands/akili-constitution.md`, `docs/commands/akili-execute.md`, `docs/commands/akili-test.md`, `docs/README.md`, `README.md` (badge, prerequisites, install matrix, "all four" → "all five"), `AGENTS.md`/`.claude/README.md` canonical-source note, `CHANGELOG.md` under Unreleased.

## Scope

- `bin/akili.js` — `defaultPaths.cursor` (`CURSOR_CONFIG_DIR` → `~/.cursor`), `TOOL_REGISTRY.cursor` reusing the Codex shape (`commands: []`, `skills: [skillsRoot]`, `resources: <home>/akili`, `commandsAsSkills`, `sharedSkillsRoot`), `TOOL_ROOT_ARGS.cursor`, `--tool cursor`, `--cursor-target`, `--cursor-skills-target`, `ALL_TOOLS`, `--tool all` = five, `init` wizard option, `--local` mapping, post-install hint ("restart Cursor or open a new chat"), `doctor` environment row for the `agent` binary, help text. Enumerate the terminal branches the new target lands in (`isToolInstalled` shared-root branch, `toolFlagFor`, `cleanupLegacyFiles` shared-root ban, `toolTargetLabel`) — KZ-004.
- `.claude/hooks/akili-tasks-gate.sh` (packaged copy and Step 8F inline text) — Cursor host branch: payload read from `tool_input.file_path` + `new_string`/`content`, response `{"permission":"deny"}`; fail-closed on an unrecognized shape, as the Codex branch does.
- `.claude/commands/akili-constitution.md` — Step 8C (fifth host column, `agent` invocation line), Step 8E Cursor bullet + frontmatter table, Step 8F Cursor variant (merge rules mirror `settings.json`: read first, abort on invalid JSON, never clobber foreign hooks — the local Orca entries are the live example), Step 9 summary lines, Verification Checklist items, the `.agents/` tenant table (unchanged: Cursor adds no `.agents/` tenant — its wrappers live under `.cursor/`).
- `.claude/commands/akili-execute.md`, `.claude/commands/akili-test.md`, `.claude/templates/leader.md` — Cursor spawn paragraph, model-switch wording (`/model` in Cursor), Unattended Mode: no claim for Cursor unless verified live.
- `docs/model-routing.md` — Cursor column (T1–T6), *How to apply per tool* bullet, CLI-invocation row, enforced-routing row, effort-dial mapping (`[effort=…]` parameter).
- `docs/flow.md`, `docs/cli.md`, `docs/commands/*.md` mirrors, `docs/README.md`, `README.md`, `AGENTS.md`, `.claude/README.md`, `CHANGELOG.md`.
- `scripts/ci/install-layout-regression.js` tool list and `.github/workflows/ci.yml` (`--tool all` already runs; it will exercise the Cursor layout; a `doctor` run without the `agent` binary must stay green).
- `test/` — a registry/detection test for the shared-root pair (Codex + Cursor into one skills root: second install skips, both doctors green, detection keyed on each tool's own resources).

## Non-Goals

- Installing into `~/.cursor/skills/` by default (Cursor-owned root that syncs to Cloud Agents). The shared standard root avoids duplicate skills on Codex + Cursor machines; the Cursor-owned root stays reachable via `--cursor-skills-target ~/.cursor/skills` and is documented, not defaulted (see Option B).
- `.cursor/rules/*.mdc`. AKILI is `AGENTS.md`-canonical and Cursor reads root and nested `AGENTS.md` natively (<https://cursor.com/docs/context/rules>, `Last verified: 2026-10-01`); no rule file is needed.
- `akili notifications` for Cursor (a `sessionStart` hook in `~/.cursor/hooks.json`). Same shape as Claude Code's; deferred to keep the spec bounded, as it was for Codex.
- Cursor Cloud Agents, Bugbot, Background Agents, the Cursor SDK, and Cursor-specific "Custom Modes".
- Deleting or warning about the accidental `~/.claude/skills` → Cursor exposure (#2). It is Cursor's documented compatibility behavior; the spec documents it in `docs/cli.md` and leaves it.
- Any change to what is installed for Claude Code, OpenCode, Antigravity, or Codex. Codex's layout is reused, not modified.

## Affected Users, Systems, And Specs

| Who / What | Effect |
|---|---|
| Developers whose host is Cursor | New: full AKILI lifecycle available, `/akili-*` invocation |
| Codex users | None functionally; they already have the Cursor skill set on disk. `--tool all` now also writes `~/.cursor/akili` |
| Claude Code users who also open Cursor | Skills were already visible; after `--tool cursor` the commands are too, and doctor can report it |
| `bin/akili.js` | One registry entry in the Codex shape; no refactor of the install loop |
| `/akili-constitution`, `/akili-execute`, `/akili-test`, `leader.md` | Per-host guidance grows a fifth host |
| `docs/model-routing.md` | Fifth registry column; `/akili-audit` Model Registry Drift compares against it |
| `.claude/hooks/akili-tasks-gate.sh` | Third response shape; existing Claude Code and Codex branches untouched (regression: the test fixtures for both must still pass) |
| Queued `changes/model-routing-configurator` | Must start after this spec archives — it will read the five-column registry |
| Deferred pin-parser bug | Unaffected unless bundled; sequence after |
| Release | `minor` bump; `npm test`, `npm run verify:cli`, `install --tool all --dry-run`, matrix CI |

## Visual Reference

- Source: None
- Location: n/a
- Notes: installer + methodology prose change; no UI surface.

## Requirement Delta Preview

### ADDED Requirements

- `akili install|update|doctor --tool cursor`, `--cursor-target`, `--cursor-skills-target`; `--tool all` includes Cursor; `akili init` offers Cursor; auto-detection recognizes an existing Cursor install by its AKILI-owned resources or command skills, never by the shared skills root.
- Commands install as Cursor skills (`akili-<command>/SKILL.md`) under the Agent-Skills-standard root; packaged skills alongside; resources under `<cursor-home>/akili`.
- Step 8E Cursor wrappers (`.cursor/agents/*.md`) binding model, effort parameter, and the Reviewer's `readonly: true`.
- Step 8F Cursor variant of the tasks gate via `.cursor/hooks.json`; gate script Cursor response branch.
- Cursor column, invocation row, and enforced-routing row in the Model Routing registry; Cursor paragraphs in execute/test/leader/flow.

### MODIFIED Requirements

- Step 8F honesty note: enforced on Claude Code, Codex, **and Cursor**; instructional on OpenCode and Antigravity.
- README/docs/AGENTS claims "four install targets" → five (sweep keyed on the obligation, not on the word "four" — KZ-changes--kaizen-loop-closure-2).
- `--tool all` set grows from four to five; `toolFlagFor`'s "all" test already derives from `ALL_TOOLS.length`.

### REMOVED Requirements

- None.

## Approach Options

| Option | Description | Trade-offs |
|---|---|---|
| **A. Shared standard root (recommended)** | Commands + skills into `~/.agents/skills` (the same root Codex uses), resources into `~/.cursor/akili`, wrappers and hooks under `.cursor/` | Reuses the Codex registry shape verbatim; one copy of every skill on a Codex + Cursor machine; `--local` lands on `.agents/skills`, which Cursor discovers per project. Skills do not sync to Cursor Cloud Agents (only `~/.cursor/skills/` does) |
| B. Cursor-owned root | Everything under `~/.cursor/` (`skills/`, `akili/`) — single root like Claude Code | Simplest detection and Cloud Agent sync, but a Codex + Cursor machine gets every AKILI skill from two roots with unverified precedence, and `--local` would need `./.cursor/skills` while personas sit in `./.agents/` — two project tenants instead of one |
| C. Document-only | No installer target; tell Cursor users to run `--tool codex` because Cursor reads the same root | Zero installer work, but `doctor`/`update` can never speak about Cursor, resources never reach `~/.cursor`, the `codex` binary is nagged on machines without Codex, and Step 8E/8F still need Cursor-specific files — the methodology half is the larger half anyway |

## Recommended Approach

**Option A.** It is the smallest path that lands on Cursor's standard surface and it adds no new installer concept — `sharedSkillsRoot` and `commandsAsSkills` already exist for Codex, so the fifth target is data, not a branch. The one genuinely new mechanism is the gate script's third response shape, which is a few lines with its own fixture. The methodology half mirrors Step 8E/8F for Codex with Cursor's Markdown-frontmatter and `hooks.json` shapes substituted; where Cursor is genuinely different (`/` invocation of a *skill*, `readonly: true`, `[effort=…]` model parameters, the nested-subagent depth limit, cross-vendor author ≠ auditor) the prose says so instead of pretending parity.

## Risks, Dependencies, And Open Questions

| # | Risk / Question | Mitigation |
|---|---|---|
| R1 | **Docs churn.** Cursor's commands page already redirects to skills; paths and frontmatter moved within the year. Pin the current page and date (KZ-001 class) | Every Cursor claim in the spec carries `Last verified: <date>` + URL; live validation in a real Cursor session (IDE **and** `agent` CLI) is a closing gate; `UNVERIFIED` where a claim could not be exercised |
| R2 | **Root precedence across skill roots.** Cursor loads up to six user/project roots; which copy wins when `~/.claude/skills/x` and `~/.agents/skills/x` both exist is undocumented | Measure in the live session with the picker; the default (Option A) never *creates* a duplicate — Codex and Cursor write the same files. Document the Claude Code + Cursor overlap in `docs/cli.md` |
| R3 | **Hook payload for writes.** `tool_input.file_path` + `new_string`/`content` is documented for Write/Edit; Shell-based writes go through `beforeShellExecution`, not `preToolUse` | Gate the write tools via `matcher`; validate live that a `[x]` write without PASS evidence is denied; fail-closed on unknown shapes as the Codex branch does |
| R4 | **`model:` values in `.claude/agents/` wrappers.** Cursor reads that directory too; a Claude Code wrapper with `model: opus` may error, fall back to `inherit`, or be ignored — UNVERIFIED | Observe live; if the alias breaks the subagent, Step 8E records that a project targeting both hosts keeps `.claude/agents/` and `.cursor/agents/` with distinct names or accepts `inherit` on one side. Name collision between the two project directories (`akili-reviewer` in both) is also UNVERIFIED — settle in design |
| R5 | **Skill-menu budget** (DD-9 from the Codex spec): Cursor shows every skill in the `/` picker; this machine already has 20 + 22 foreign/built-in skills | Measure in the live session; act only on observed truncation, and only in the canonical skill files (never a Cursor fork) |
| R6 | **`disable-model-invocation`.** Cursor's own migration marks former commands explicit-only; AKILI command skills today carry no such field and Cursor may auto-invoke `/akili-execute` from a description match | Design decides whether the generated command `SKILL.md` carries `disable-model-invocation: true`. It is written once into the shared root, so confirm Codex ignores the unknown field (Agent Skills standard tolerates extra frontmatter — UNVERIFIED for codex-cli) |
| R7 | **Model column content.** Cursor's roster is multi-vendor and plan-gated; no floating aliases besides `auto` (`cli-config.json` shows `aliases: []`) | Families-not-slugs in the packaged registry (Antigravity/Codex precedent); exact IDs confirmed from the user's `/model` roster at specify time; `<CONFIRM SLUG>` where unknown |
| R8 | **Shared `~/.agents/skills` root** holds 55+ foreign skills locally; skip-by-default protects same-name foreign files; `cleanupLegacyFiles` must stay banned on the shared root (DD-11) | Reuse DD-11 verbatim; regression test asserts no cleanup runs for `cursor` |
| Q1 | Flag naming: `--cursor-skills-target` (mirror of `--codex-skills-target`) or one shared `--agents-skills-target` that both targets honor? | Recommend the mirror (`--cursor-skills-target`) for symmetry and zero change to Codex flags; confirm at approval |
| Q2 | Should `--tool both` stay Claude + OpenCode? | Keep as-is (same answer as the Codex spec); `all` is the five-host switch |
| Q3 | Does the Cursor **CLI** (`agent`) read `.cursor/agents/` and `hooks.json` the same way the IDE does? The configuration page is silent; hooks docs list "CLI" as a host | Validate both in the live session; record per-host results separately |

Active Lessons applied: **KZ-002** (before claiming "every host paragraph names Cursor", run the `grep -ci codex` vs `grep -ci cursor` per-file comparison — the footprint table above is the baseline); **KZ-changes--kaizen-loop-closure-2** (sweep "four targets"/"all four" restatements keyed on the obligation — `AGENTS.md`, `README.md:61`, `.claude/README.md`); **KZ-004** (name the terminal branch each new-target role lands in: shared-root detection, `toolFlagFor`, cleanup ban, label).

## Success Criteria

- `akili install --tool cursor` on a clean home writes 11 command skills + 24 skills to the skills root and resources to `<cursor-home>/akili`; a second run skips everything; `--force` overwrites; `--dry-run` writes nothing. `--tool all` on a clean home writes the shared skills once (Codex) and reports them skipped (Cursor). Verified on the CI matrix (Linux/macOS/Windows, Node 18/22) and by `scripts/ci/install-layout-regression.js`.
- `akili doctor --tool cursor` reports all green after install and lists the `agent` binary under Environment without failing when absent; `doctor --tool codex` output is unchanged (regression).
- `install --tool codex` output is byte-identical before and after (no structural registry change).
- In a live Cursor session (IDE and `agent` CLI, versions recorded): `/akili-propose` and `/akili-execute` appear in the `/` picker and load; a Step 8E wrapper spawns the Reviewer on a model different from the Implementer with `readonly: true` honored; the Step 8F hook denies a `[x]` write lacking PASS evidence and allows one with it; the existing Claude Code and Codex gate fixtures still pass.
- Every Cursor claim in commands/docs carries a URL and a verification date; `/akili-audit` reports no Model Registry Drift against the new column.
- `CHANGELOG.md` Unreleased carries the minor entry; docs mirrors at parity (`docs/commands/*`, `docs/cli.md`, `README.md`, `AGENTS.md`).

## Next Step

```text
/akili-specify changes/cursor-install-target
```
