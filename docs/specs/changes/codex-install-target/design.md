# Design: OpenAI Codex CLI as a Fourth Install Target

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/codex-install-target` |
| Depth | Standard |
| Type | Change |
| Approval Mode | `gated` |
| Status | Draft — Phase 2, post-judgment round 1 (Fix only; see `judgment.md`) |
| Date | 2026-09-16 |
| Source | `requirements.md` (FR-1..FR-10, NFR-1..6) |
| Architecture significance | Not significant: no new module, data flow, or topology. `software-architect` not loaded; decisions recorded as DDs below |
| Format precedent | `docs/specs/archive/2026-08-22-changes--branch-safe-kaizen/design.md` |

## 2. Executive Summary

Two halves, one principle each. **Installer:** `TOOL_REGISTRY` stops being "paths under one root" and becomes "per-type roots + capability flags" (`commandsAsSkills`, `sharedSkillsRoot`); Codex is then a data entry, and Antigravity's special-case branch is deleted because the same flag expresses it (FR-4, NFR-6). **Methodology:** every place that enumerates hosts gains a Codex line that mirrors the Claude Code line's *shape* — wrapper file, hook file, switch command — with Codex's own field names substituted and a verification pin attached (FR-5..FR-9). Where Codex is genuinely different (model-driven subagent spawning, `$` invocation, native `model_reasoning_effort`), the prose says so instead of claiming parity. Live validation closes the spec (FR-10).

## 3. Architecture Overview

```
akili install --tool codex
   │
   ├─ getArgs        codexTarget (~/.codex | ./.codex | --codex-target | --target)
   │                 codexSkillsTarget (~/.agents/skills | ./.agents/skills | --codex-skills-target)
   │
   ├─ getToolRegistryInfo("codex")
   │     roots = { root: codexTarget, skillsRoot: codexSkillsTarget }
   │     paths = TOOL_REGISTRY.codex(roots)
   │             { commands: [],                       ← never a commands/ dir (FR-2)
   │               skills: [skillsRoot],
   │               resources: root/akili,
   │               legacyResources: null,
   │               commandsAsSkills: true,             ← 11 × akili-<cmd>/SKILL.md
   │               sharedSkillsRoot: true }            ← detection ignores the raw skills dir (FR-1)
   │
   ├─ cleanupLegacyFiles   SKIPPED for skills when sharedSkillsRoot (CS-2) — never rm in a shared root
   ├─ installTool    commands dirs (none) → command skills (flag) → skills → resources
   ├─ doctorTool     hasInstalledCommand already checks <skills>/<cmd>/SKILL.md;
   │                 --fix restores through the flag, never through paths.commands[0] (CS-1);
   │                 STALE scan of LEGACY_SKILLS skipped when sharedSkillsRoot (CS-2)
   └─ hints          "Restart Codex or open a new chat" (like OpenCode)
```

The copy primitives (atomic copy, skip-by-default, dry-run, `--force`) are reused as-is from v2.23.2. Two pre-existing code paths **are** touched because they assume an AKILI-owned root or a non-empty `commands` list: the doctor `--fix` restore and the legacy-skill cleanup/STALE scan (see §7 rows 7a, 7b and DD-11).

## 4. Extended Directory Structure

Global (`akili install --tool codex`):

```
~/.agents/skills/                       ← Agent Skills root, shared with other tools
  akili-archive/SKILL.md … akili-validate/SKILL.md   (11 command skills)
  tdd/SKILL.md, kaizen/SKILL.md, …                   (24 packaged skills, with references/)
~/.codex/akili/                         ← resources root
  templates/{leader,implementer,reviewer,tester}.md
  scripts/…
  .mcp.json.example
```

Local (`--local`): `./.agents/skills/…` and `./.codex/akili/…`. Project-level artifacts written later by `/akili-constitution`: `./.codex/agents/akili-*.toml` (8E), `./.codex/hooks.json` + `./.codex/hooks/akili-tasks-gate.sh` (8F).

`.agents/` tenants in one repo (FR-8 second scenario):

| Path | Tenant | Written by |
|---|---|---|
| `.agents/<role>.md` | AKILI personas (all hosts) | `/akili-constitution` Step 7 |
| `.agents/agents/akili-<role>/agent.md` | Antigravity wrappers | Step 8E (Antigravity) |
| `.agents/skills/<name>/SKILL.md` | Codex repo-scope skills | `akili install --tool codex --local` |

No file name is shared across tenants. Claim to pin (W-8): Codex discovers only `<root>/.agents/skills/*/SKILL.md` (it does not read `*.md` at `.agents/` root) and Antigravity discovers only `.agents/agents/`. `Last verified: <fill at execution>` — https://learn.chatgpt.com/docs/build-skills (Codex scan table) and https://antigravity.google/docs (agents discovery). Until the live check, `--local` for Codex carries `Unverified:` on this claim.

## 5. Data Model

### 5.1 Registry entry (conceptual schema, `bin/akili.js`)

| Field | Type | Meaning | claude | opencode | antigravity | codex |
|---|---|---|---|---|---|---|
| `commands` | dir[] | Raw command `.md` copies | `root/commands` | `root/commands` | 3 workflow dirs (unchanged) | **none** |
| `skills` | dir[] | Skill directories | `root/skills` | `root/skills` | 3 dirs (unchanged) | `skillsRoot` |
| `resources` | dir | Templates, scripts, MCP example | `root/akili` | `root/akili` | `root/config/akili` | `root/akili` |
| `legacyResources` | dir? | `sdd-jc` cleanup | yes | yes | yes | none |
| `commandsAsSkills` | bool | Also write `<skills>/<cmd>/SKILL.md` | no | no | **yes** (was the `tool === "antigravity"` branch) | yes |
| `sharedSkillsRoot` | bool | Skills dir is shared with foreign tools ⇒ detection must not count it | no | no | no | yes |

The registry function receives a `roots` object (`{ root }` for the three existing tools, `{ root, skillsRoot }` for Codex) so no entry has to know how flags map to paths.

### 5.2 CLI surface additions

| Flag / value | Default | Semantics |
|---|---|---|
| `--tool codex` | — | Single target |
| `--tool all` | — | `claude, opencode, antigravity, codex` in that order; `both` unchanged |
| `--codex-target <path>` | `~/.codex` (`./.codex` under `--local`) | Config home; resources land at `<path>/akili`. Skills root unaffected |
| `--codex-skills-target <path>` | `~/.agents/skills` (`./.agents/skills` under `--local`) | Skills root override |
| `--target <path>` with `--tool codex` | — | **Single-root sandbox layout** (W-2): resources at `<path>/akili` **and** skills at `<path>/skills`. Codex still reads `~/.codex/skills` as a legacy root, so `--target ~/.codex` yields a working legacy-style install; and a temp path fully sandboxes CI/regression runs, which the split default cannot. Documented in `docs/cli.md` next to the flag |
| Install/doctor header | — | For Codex the `CODEX target:` line prints **both** roots: config home and `skills → <skills root>` (W-1); the summary table keeps one row per tool |
| Verify hint (`toolFlagFor`) | — | Returns `all` only when the resolved set equals `ALL_TOOLS`; for any other multi-tool set it emits one `akili doctor --tool <t>` line per tool (W-13: an auto-detected `{claude, antigravity}` pair must not be told to check Codex) |
| `init` option | — | `4) OpenAI Codex`, `5) Both (Claude Code + OpenCode)`, `6) All four` |

### 5.3 Step 8E wrapper — `.codex/agents/akili-<role>.toml` (fields, no content here)

| Field | Value rule |
|---|---|
| `name` | `akili-<role>` |
| `description` | One line: when the Leader should request this role |
| `developer_instructions` | Points at `.agents/<role>.md` ("read and follow it verbatim before acting"); never inlines the persona (personas stay the single source of truth, as on the other hosts) |
| `model` | Registry Codex column for the role's tier; Reviewer ≠ Implementer |
| `model_reasoning_effort` | Effort dial default per role: Leader `high`, Reviewer `high`, Implementer `medium`, Tester `medium` — overridable per task by the brief, as today |
| `sandbox_mode` | **Reviewer only:** `read-only` — the second axis of author ≠ auditor ("all three hosts restrict the Reviewer"; CS-3). Codex has no per-agent tool allowlist in the documented TOML fields, so the sandbox is the restriction surface; Leader/Implementer/Tester omit the key and inherit. Step 9 names the Reviewer's state ("read-only by sandbox") exactly as it names `tools` on Claude Code |
| `mcp_servers` | Omitted (inherit) |
| Verification pin | URL + date next to the field table in the constitution text: https://learn.chatgpt.com/docs/agent-configuration/subagents — `Last verified: <fill at execution>`; `sandbox_mode = "read-only"` on a subagent carries `Unverified:` until FR-10 shows the Reviewer cannot write |

Effort mapping (W-11) — AKILI dial → `model_reasoning_effort`: `low`→`low`, `medium`→`medium`, `high`→`high`, `xhigh`→`xhigh`, `max`→`xhigh`. The accepted enum is confirmed in the validation session (`/reasoning` lists it); a value Codex rejects collapses to the next lower accepted one, and the constitution text records the confirmed enum with its pin.

### 5.4 Step 8F hook — `.codex/hooks.json` (shape, no content here)

Top-level `hooks` → `PreToolUse` → one entry with a matcher naming Codex's file-write tools and one command hook invoking the gate script. Merge rules identical to the `settings.json` variant: read first; abort on invalid JSON; append, never replace foreign entries; idempotent on re-run (detect the akili command string). Pin: https://learn.chatgpt.com/docs/hooks — `Last verified: <fill at execution>` (W-8).

**What the existing script depends on** (S-3; from the Step 8F scaffold): stdin JSON with `.tool_name`, `.tool_input.file_path`, `.tool_input.old_string` / `.new_string` (edit) or `.tool_input.content` (write); matcher `Edit|Write`; denial = message on **stderr** + exit 2 (W-10). Any of the four may differ on Codex. The design therefore fixes two things now and defers one:

1. **Matcher and field names are host data, not script constants.** The constitution's Codex variant declares the Codex tool names and payload paths in one place (a small table next to the hooks.json shape) and the script reads them by host. Until FR-10 confirms them they are marked `Unverified:`; the validation task's evidence must include the raw payload Codex delivered.
2. **Fail-closed on an unrecognized write to `tasks.md`.** If the payload names a `docs/specs/*/tasks.md` path but the script cannot extract the new content, it denies with a message naming the gap, instead of falling through to `exit 0` (the "check no input can fail" shape S-3 flagged). Non-`tasks.md` paths still exit 0.
3. **Denial mechanism** (exit 2 + stderr vs `permissionDecision: deny` on stdout) is decided live: the script emits both once the live check shows which one Codex honors.

Gate script location: `.codex/hooks/akili-tasks-gate.sh`, **unless** `.claude/hooks/akili-tasks-gate.sh` already exists in the project, in which case the Codex entry points at that one (one script, two host entries).

## 6. Reversion Challenge (Step 2.3) — outcomes

| DD | Reverted/removed behavior | "What does removing this break?" | Outcome |
|---|---|---|---|
| DD-1 | The `tool === "antigravity"` branch in `installTool` | If the Antigravity entry forgets `commandsAsSkills: true`, its 11 command skills silently stop installing; doctor would still pass on the workflow copies (`hasInstalledCommand` returns true on the first hit) | Addressed: FR-4 `diff -r` against a v2.23.2 baseline is the gate, and T1's verification greps the flag on the Antigravity entry explicitly |
| DD-5 | `init` wizard numbering (`4=both, 5=all` → `5=both, 6=all`) | Muscle memory for interactive users; no scripts can depend on it (readline prompt, not a flag) | Accepted; the prompt text is the contract, not the number |
| DD-6 | Reusing the Claude Code gate script on Codex instead of writing a Codex-native one | If Codex's payload or tool names differ, the script's `case` falls through to `exit 0` and the gate passes silently — the guard is *effectively* removed on the new host | Addressed: §5.4 items 1–2 (host data table + fail-closed on unrecognized `tasks.md` writes); FR-6 live check is the proof |
| DD-11 | Legacy-skill cleanup and STALE scan skipped on shared roots | Nothing on the three existing targets changes (their roots are AKILI-owned); on Codex, `gsap-*` leftovers from a hypothetical old AKILI install would no longer be removed — but AKILI never wrote there, so there are none to remove | Accepted |
| — (FR-6, no DD) | Step 8F title "Claude Code only" | Nothing removed functionally; the OpenCode/Antigravity honesty note stays | No breakage |

No DD disables a guard, cache, retry, or fallback on an existing host.

## 7. Surface Table

| # | File | Edit |
|---|---|---|
| 1 | `bin/akili.js` `defaultPaths` | add `codex: ~/.codex`, `codexSkills: ~/.agents/skills` |
| 2 | `bin/akili.js` `TOOL_REGISTRY` | entries take `roots`; add `commandsAsSkills` to antigravity; add `codex` entry (§5.1) |
| 3 | `bin/akili.js` `getArgs` | options `codex-target`, `codex-skills-target`; validation list gains `codex`; `--local` bases; `codexTarget`/`codexSkillsTarget` resolution incl. `--target` |
| 4 | `bin/akili.js` `selectedTools`, `ALL_TOOLS`, `toolFlagFor` | `all` = four in registry order; `both` untouched; `toolFlagFor` returns `all` only for the full set, else per-tool doctor hints (W-13) |
| 5 | `bin/akili.js` `isToolInstalled` | when `sharedSkillsRoot`: installed ⇔ resources dir non-empty **or** `existsSync(<skills>/akili-<cmd>/SKILL.md)` for any `cmd` in `listCommands()` — file presence, not directory presence (W-3) |
| 6 | `bin/akili.js` `getToolRegistryInfo` | build `roots` per tool; header line for Codex prints config home **and** skills root (W-1); `--target` ⇒ single-root layout (§5.2) |
| 7 | `bin/akili.js` `installTool` | replace `if (tool === "antigravity")` with `if (paths.commandsAsSkills)` |
| 7a | `bin/akili.js` `doctorTool` `--fix` (second `tool === "antigravity"` branch) | restore raw copies only when `paths.commands` is non-empty; restore command skills when `commandsAsSkills`; no `paths.commands[0]` access on an empty list (CS-1) |
| 7b | `bin/akili.js` `cleanupLegacyFiles`, `doctorTool` STALE scan | skip the `LEGACY_SKILLS` loop for any tool with `sharedSkillsRoot` (CS-2, DD-11); `legacyResources: null` already skips the `sdd-jc` branch |
| 8 | `bin/akili.js` `RECOMMENDED_ENV` / `runDoctor` | `codex` row with an `appliesTo: ["codex"]` predicate field; `checkEnvironment(tools)` filters on it (Sg-1); Windows probe uses `codex.cmd` like the other rows — a standalone `codex.exe` reports NOT FOUND, stated in the `withoutIt` text (W-15). Doctor for Codex also prints one informational line when `~/.codex/skills/akili-*` exists ("legacy copies present, not managed"; W-9) |
| 9 | `bin/akili.js` `runInstall` hints | Codex restart hint; verify hint via `toolFlagFor` |
| 10 | `bin/akili.js` `runInteractiveInit` | option 4 Codex; renumber; local/global target assignment for the two Codex roots |
| 11 | `bin/akili.js` `printHelp` | `--tool` list, `--codex-target`, `--codex-skills-target`, examples |
| 11a | `.claude/commands/akili-constitution.md` Step 8C | host list and column rule become four hosts ("all four are CLI install targets"); CLI-invocation rule gains `codex` (S-1) |
| 12 | `.claude/commands/akili-constitution.md` Step 8E | Codex bullet + §5.3 field table (incl. Reviewer `sandbox_mode = "read-only"`, effort mapping) + spawn-is-model-driven note + pin |
| 13 | `.claude/commands/akili-constitution.md` Step 8F | title; Codex variant (§5.4: hooks.json shape, host-data table for tool names/payload paths, fail-closed rule, script location); honesty note rewrite; corrupt-JSON abort |
| 14 | `.claude/commands/akili-constitution.md` Step 9 + Verification Checklist | name Codex wrappers/hook and the Reviewer's read-only state; checklist line 880's "all three" → four; tenant table (§4); one-line `AGENTS.md` byte-cap check for Codex projects naming the config key to raise (proposal R4, W-14) |
| 15 | `.claude/commands/akili-execute.md` | spawn mechanics bullet for Codex; model checkpoint switch wording (`/model`, `/reasoning`); Unattended Mode: "no verified equivalent" for Codex |
| 16 | `.claude/commands/akili-test.md` | Tester spawn wording names Codex wrappers; its model checkpoint host enumeration gains Codex (W-12) |
| 17 | `.claude/templates/leader.md` | **No edit** (S-2): the file enumerates no hosts; its spawn pointer defers to `/akili-execute` Steps 2.2–2.3, which row 15 updates. Recorded so the FR-8 sweep does not look for an edit here |
| 18 | `docs/flow.md` | per-host launch paragraph (Codex: no claim); `.agents/` resolution paragraph gains the Codex tenant |
| 19 | `docs/model-routing.md` | Codex column T1–T6 (DD-3), enforced-routing row, how-to-apply bullet, CLI row `codex`, cross-host host list |
| 20 | `docs/cli.md` | targets, flags, layouts, detection paragraph, init wizard |
| 21 | `docs/commands/akili-constitution.md`, `akili-execute.md`, `akili-test.md` | mirrors at parity with 12–16 |
| 22 | `README.md`, `docs/README.md`, `.claude/README.md` (intro + install-target table), `AGENTS.md`, `CONTRIBUTING.md`, `docs/commands/README.md` | badge, prerequisites row, install matrix, "all four targets" wording, Model Routing rule host list (W-5) |
| 23 | `CHANGELOG.md` | Unreleased → Added (minor) |
| 24 | `scripts/ci/install-layout-regression.js` (new) + `.github/workflows/ci.yml` step | FR-4 gate (W-4): installs the **published** `akili-specs@2.23.2` (`npx --yes`) and the working tree, each with `--tool <t> --target <tmp>` for the three shipping targets, then compares sorted relative file lists (any path difference fails) + SHA-256 per file, where a content difference is tolerated only when side B's file is byte-identical to its working-tree source under `.claude/` (reported `EXPECTED-DIFF`; a canonical-file edit this spec made, never an installer mapping change) — any other difference fails (Pivot Record T2). Also runs the W-3 detection fixture (populated `~/.agents/skills`, no `akili-*`, no `~/.codex/akili` ⇒ Codex not detected). Skips with exit 0 when the registry is unreachable, printing `SKIP` |

`execution.md` (FR-10 evidence block with the Codex version) is an execute-time output, not a surface (Sg-3).

## 8. Design Decisions

### DD-1 — Capability flags on registry entries, not tool-name branches
`commandsAsSkills` and `sharedSkillsRoot` are data on the entry; the install loop and detection read the flags. Antigravity is re-expressed through `commandsAsSkills`, deleting **both** of its branches — the install loop and the doctor `--fix` restore (CS-1; NFR-6). Rejected: a second `tool === "codex"` branch (two special cases and a third on the next host); a subclass/strategy object per tool (over-engineering for a 1,400-line script). Regression gate: FR-4 tree diff.

### DD-2 — Two roots for Codex, two flags; `--target` selects a single-root sandbox layout
Codex is the first host whose skills live outside its config home. The registry function takes a `roots` object so entries stay declarative. `--target` (single-tool override) has always meant "put everything for this tool under this path"; for Codex that is honored literally — resources at `<path>/akili`, skills at `<path>/skills` — which sandboxes CI and regression runs completely and, because Codex still reads `~/.codex/skills` as a legacy root, also produces a working legacy-style install when pointed at `~/.codex` (W-2). The split default is redirected piecewise by `--codex-target` and `--codex-skills-target`. Rejected: installing into both roots (double writes into the user's shared skills dir); deriving `skillsRoot` from `codexTarget` (would put skills under `~/.codex/skills`, the legacy location).

### DD-3 — Codex registry column is filled from the live roster, alias-first, families otherwise
Same rule as the Antigravity column ("families, not slugs, deliberately"). The executor of the model-routing task consults the official Codex models page (URL pinned with date) and the `/model` roster in the validation session; if Codex exposes stable aliases they are used, else family names. No slug ships that was not seen on the pinned date (FR-7 `BUT`). Rejected: copying the user's `config.toml` value (`gpt-5.1-codex`, a year-old pin).

### DD-4 — The `codex` environment row prints only when Codex is a resolved tool
`RECOMMENDED_ENV` rows print once per doctor run for every user. A host binary is not a recommendation for Claude-only users; nagging them about a missing `codex` would be noise. The row is conditional on `codex ∈ resolvedTools`, keeps never-fails semantics, and its `withoutIt` names the broken-vendor symptom seen locally (`spawn … ENOENT` → reinstall). Rejected: unconditional row.

### DD-5 — `init` wizard: append Codex as option 4, renumber the combos
Order follows the registry order; the combos stay last. Reversion challenge outcome in §6.

### DD-6 — Step 8F on Codex reuses the same gate script; host detection is added only if live validation demands it
Two scripts drift; one script whose host-specific values (tool names, payload paths) live in a declared table is the shape that keeps the rule in one place. (Previous text cited KZ-005 for this; KZ-005 is about line-number pointers and does not support it — W-6 corrected.) The Codex `hooks.json` entry points at `.codex/hooks/akili-tasks-gate.sh`, or at the existing `.claude/hooks/` copy when the project already has it. Whether Codex honors exit-code denial or requires the `permissionDecision` JSON is unknown offline → FR-6 live check decides, and the constitution text records the answer with its pin.

### DD-7 — Codex subagent spawning is documented as model-driven, with the request phrasing, not a tool contract
The docs describe orchestration handled by Codex itself (spawn, route, wait, close) with no explicit tool names. Claiming a `spawn_agent` contract would be a KZ-001-class error (authority cited for a fact it does not contain). The execute/leader text therefore says: *request the named role (`akili-reviewer`) with the brief; Codex spawns it; wait for the consolidated result*, pinned, and marks it `Unverified:` until FR-10 exercises it.

### DD-8 — Pins are part of the artifact, not a review note
Every Codex claim carries `Last verified: YYYY-MM-DD` + URL inline (NFR-5). The docs moved twice in a year and four official pages returned 404 today; a dated pin turns future drift into a visible staleness instead of a silent falsehood. Applies KZ-001 (read the pinned source past the section you came for) at authoring time.

### DD-9 — Skill-description budget is measured, not pre-emptively trimmed
Measured as `len(name) + len(description)` from the YAML frontmatter of the 11 command files and 24 `SKILL.md` files, quotes stripped: **9,493 chars** (commands 1,310, skills 8,183; the judges' re-measurement supersedes the earlier 9,471 — Sg-4) versus an 8,000-char fallback cap. Trimming now would edit up to 35 canonical files (all 35 entries are skills on Codex — Sg-6) on a guess; the live `/skills` check (FR-10) is the falsifying input. If truncation is observed, it becomes its own patch spec applied to canonical files for all hosts (NFR-2).

### DD-10 — Closure sweep is grep-driven (KZ-002)
The doc coherence task runs a **named pattern set**, not two greps (CS-4): `three (install )?targets`, `three tools`, `three hosts`, `three-tool`, `[Aa]ll three`, `other two targets`, `Claude Code, OpenCode,? and (Google )?Antigravity`, `claude, opencode, antigravity` (help text and validation lists) — across `*.md`, `bin/akili.js`, and `scripts/`; resolves or justifies every hit; and additionally reads the install-target **tables** (`README.md`, `docs/cli.md`, `.claude/README.md`) by eye, since a table row is not a phrase. Known hits the old two greps missed: `.claude/README.md:3,13`, `docs/cli.md:147`, `README.md:169`, the wizard's "All three". `doctor --tool codex` 11/11 is the falsifier for "every command installs as a skill".

### DD-11 — Legacy cleanup never runs in a shared root
`cleanupLegacyFiles` and the doctor STALE scan were written for AKILI-owned skill roots; on Codex the root is shared, and the `gsap-*` names in `LEGACY_SKILLS` are plausible names for foreign skills. Both loops skip any tool flagged `sharedSkillsRoot` (CS-2). Rejected: name-matching plus a content check (fragile) and moving Codex to a private root (contradicts the Agent Skills standard the spec targets).

### DD-12 — Live validation may reopen the constitution task; budgeted, not surprising
Three values are decided live (hook tool names/payload paths, denial mechanism, effort enum). The task graph records the constitution task as **re-openable by the validation task** with a bounded delta (the host-data table and the confirmed enum), and the budget below reserves one extra review round for it (W-16).

## 9. Budget (Step 2.4 — tripwire for `/akili-execute`)

| Metric | Expected |
|---|---|
| Tasks | **7** (installer · regression script + CI step · constitution 8C/8E/8F/9 · execute/test/flow · model-routing · docs/mirrors/root docs/CHANGELOG · live validation) |
| Changed/added lines | **~560** — installer ~150 (code, incl. doctor `--fix` and legacy-skip), regression script + `ci.yml` step ~95 (code), constitution ~110, execution guidance ~35, registry ~30, docs/mirrors/root docs/CONTRIBUTING/CHANGELOG ~140 across 11 files (Sg-5; re-summed at Phase 3 from the task table — the earlier ~470 omitted the CI step and two doc surfaces) |
| Review rounds | **1 per task**, plus one reserved: the installer task may take 2 (Windows path edge) and the constitution task may reopen once after live validation (DD-12) |

Depth check: Standard matches (7 tasks, one code surface with CI gates, the rest prose). Not Lite (cross-cutting, regression risk on three shipping targets); not Full (no data/auth/API/migration).
