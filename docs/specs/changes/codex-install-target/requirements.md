# Requirements: OpenAI Codex CLI as a Fourth Install Target

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/codex-install-target` |
| Depth | **Standard** — cross-cutting (installer + five command/persona surfaces + registry) but no data, auth, or API; the risky part is regression on three shipping targets, gated by CI |
| Type | Change |
| Approval Mode | `gated` (inherited from `proposal.md`) |
| Status | Draft — Phase 1, amended after Judgment Day round 1 (see `judgment.md`) |
| Date | 2026-09-16 |
| Source | `proposal.md` (approved 2026-09-16; Release Classification: **minor**) |
| Format precedent | `docs/specs/archive/2026-08-22-changes--branch-safe-kaizen/requirements.md` — this repo has no `docs/specs/general-setup/` (it packages the methodology rather than consuming it) |
| Deviation from proposal | The proposal listed "legacy cleanup of `~/.codex/skills/akili-*` if a previous manual install is found". Dropped: the installer never wrote there, so any such files are the user's own; deleting them violates the skip-by-default ethos. `doctor` may *mention* them, never remove them. Proposal R4 (Step 9 `AGENTS.md` byte-cap check for Codex projects) is **kept**, owned by FR-9's Step 9 line below (judgment W-14 found it unrecorded) |

## 2. Executive Summary

A developer whose host is OpenAI Codex CLI can run `akili install --tool codex` and get the full AKILI-SPECS lifecycle: the 11 commands installed as Codex skills (`$akili-execute`, …), the 24 packaged skills, and the helper resources, in the roots Codex's current docs define. `doctor`, `update`, `init`, and auto-detection treat Codex as a first-class target. The methodology's per-host guidance gains a Codex variant wherever it names hosts today, and on Codex the two guarantees that were Claude-Code-only become structural: **author ≠ auditor** via `.codex/agents/*.toml` model bindings, and the **`[x]`-without-evidence gate** via a `PreToolUse` hook. The installer's layout and source→file mapping for Claude Code, OpenCode, and Antigravity do not change; the only content that changes on those hosts is what this spec edits in the canonical command files, and it changes identically for every host (amended by Pivot Record T2 — the original "byte-for-byte" wording contradicted FR-5/FR-8, which edit the shipped command files).

## 3. Glossary

| Term | Meaning |
|---|---|
| **Codex** | OpenAI Codex CLI (`codex` binary; config home `$CODEX_HOME`, default `~/.codex`) |
| **Agent Skills root** | The directory Codex scans for skills: `~/.agents/skills` (user scope) and `<repo>/.agents/skills` (repo scope). Shared with any other tool that honors the Agent Skills standard. Legacy `~/.codex/skills` is still read by Codex but is not an install target of this spec |
| **Command-as-skill** | A command file `akili-<name>.md` installed as `<skills-root>/akili-<name>/SKILL.md`, unchanged in content; invoked `$akili-<name>` |
| **Resources root** | `~/.codex/akili` (global) or `./.codex/akili` (local): persona templates, helper scripts, `.mcp.json.example` |
| **Step 8E wrapper** | A tool-native agent definition binding one `.agents/<role>.md` persona to a model. On Codex: `.codex/agents/akili-<role>.toml` |
| **Step 8F gate** | The harness hook that blocks a `tasks.md` `[x]` write lacking PASS evidence in `execution.md`. On Codex: a `PreToolUse` entry in `.codex/hooks.json` |
| **Effort dial** | The Model Routing registry's second dimension (`low`…`max`). On Codex it binds natively per role as `model_reasoning_effort` |
| **Verification pin** | A `Last verified: <date>` + URL next to every Codex behavior claim in commands and docs |
| **Live validation** | Exercising the installed result inside a real Codex session on a current release, recording the version |

## 4. System Context & Scope

| Surface | Files |
|---|---|
| Installer | `bin/akili.js` — `defaultPaths`, `TOOL_REGISTRY`, `getArgs` (flags, validation, `--local` mapping), `selectedTools`/`ALL_TOOLS`/`toolFlagFor`, `isToolInstalled`, `getToolRegistryInfo`, `installTool` (commands-as-skills branch), `hasInstalledCommand`, `doctorTool`, `RECOMMENDED_ENV`, post-install hints, `runInteractiveInit`, help text |
| CI | `.github/workflows/ci.yml` already runs `install --tool all`, `doctor --tool all`, `--dry-run`, `--force` on the 3-OS × 2-Node matrix; those steps now cover Codex. A new step runs `scripts/ci/install-layout-regression.js` (the FR-4 baseline diff against the published v2.23.2 and the FR-1 detection fixture) |
| Constitution | `.claude/commands/akili-constitution.md` — **Step 8C** (host list, column rule, CLI-invocation rule: four hosts), Step 8E (Codex bullet + field table incl. the Reviewer's read-only sandbox), Step 8F (title, Codex variant, honesty note), Step 9 summary lines + checklist ("all three" → four; Reviewer state; `AGENTS.md` byte-cap line), `.agents/` tenant layout note |
| Execution guidance | `.claude/commands/akili-execute.md` (spawn mechanics, model checkpoint switch wording, Unattended Mode claim), `.claude/commands/akili-test.md` (Tester spawn **and its model checkpoint host enumeration**), `docs/flow.md` (per-host launch, `.agents/` resolution paragraph). `.claude/templates/leader.md` enumerates no hosts and gets **no edit** |
| Registry | `docs/model-routing.md` — tier table Codex column, *Enforced routing* row, *How to apply per tool* bullet, CLI-invocation row, *Cross-host dispatch* host list |
| Docs mirrors / root docs | `docs/cli.md`, `docs/commands/akili-constitution.md`, `docs/commands/akili-execute.md`, `docs/commands/akili-test.md`, `docs/commands/README.md`, `docs/README.md`, `README.md`, `.claude/README.md` (intro + install-target table), `CONTRIBUTING.md`, `AGENTS.md` (Model Routing rule names the wrapper hosts) |
| Release | `CHANGELOG.md` under Unreleased (minor) |
| Out of scope | Deprecated custom prompts; `akili notifications` for Codex; `$`-rewrite of command prose; Codex Cloud/IDE/SDK; skill-description trimming (measured, acted on separately if needed) |

## 5. Stakeholders / Personas

| Stakeholder | Interest |
|---|---|
| Codex-hosted developer | One install command; commands discoverable in `/skills`; the triad and the gate work as on Claude Code |
| Existing Claude Code / OpenCode / Antigravity users | Zero behavior change; `--tool all` and auto-detect grow by one target only when `~/.codex/` exists |
| The Leader agent running inside Codex | Unambiguous spawn, model-switch, and hook-enforcement instructions for its host |
| Methodology maintainer | One registry concept (per-type roots + `commandsAsSkills`) instead of a second host special case; claims pinned so churn is detectable |
| `/akili-audit` | A fourth registry column to compare against; no new audit category |

## 6. Functional Requirements

### FR-1: `codex` is a selectable install target

The installer SHALL accept `codex` wherever a tool name is accepted today: `--tool codex`, `--tool all` (which becomes the four-host switch), the `init` wizard, and `doctor`/`update`. `--tool both` SHALL keep meaning Claude Code + OpenCode (proposal Q1: keep as-is).

#### Scenario: Explicit install

- GIVEN a home directory with no AKILI files
- WHEN the user runs `akili install --tool codex`
- THEN the installer writes the layout in FR-2 and prints a `CODEX target:` block naming **both** the config home (`~/.codex`) and the skills root (`~/.agents/skills`), followed by the standard summary table
- AND the post-install hints tell the user to restart Codex or open a new chat, and to verify with `akili doctor --tool codex`
- BUT it must NOT write anything under `~/.claude`, `~/.config/opencode`, or `~/.gemini`
- AND IT MUST reject `--target` combined with `--tool all` exactly as today

#### Scenario: `all` and `both`

- GIVEN `--tool all`
- WHEN install/update/doctor run
- THEN Claude Code, OpenCode, Antigravity, **and Codex** are processed in that order
- AND `--tool both` still resolves to exactly `["claude", "opencode"]`
- AND IT MUST print `akili doctor --tool all` as the verify hint only when all four tools were installed, `--tool both` only for the Claude + OpenCode pair, and one `akili doctor --tool <t>` line per tool for any other combination

#### Scenario: Auto-detection

- GIVEN `~/.codex/akili/` exists and is non-empty, and no `--tool` was passed
- WHEN `akili update` runs
- THEN Codex is included in the auto-detected list and refreshed
- BUT it must NOT treat a populated `~/.agents/skills/` alone as evidence that Codex is installed (that root is shared with other tools); detection keys on the resources root and on `~/.agents/skills/akili-*/SKILL.md` command skills only
- AND IT MUST keep the first-run default (`claude`) when nothing is detected

#### Scenario: Interactive init

- GIVEN `akili init`
- WHEN the tool question is shown
- THEN it lists Codex as an option and the "All" option reads as all four
- AND choosing local for Codex maps to `./.agents/skills` + `./.codex/akili`

### FR-2: Codex layout — commands as skills, skills, resources; no commands directory

The installer SHALL write, for Codex: every command as `<skills-root>/akili-<name>/SKILL.md` (content byte-identical to `.claude/commands/akili-<name>.md`), every packaged skill as `<skills-root>/<skill>/SKILL.md` plus its `references/` tree, and resources under `<resources-root>/{templates,scripts,.mcp.json.example}`. Defaults: skills root `~/.agents/skills`, resources root `~/.codex/akili`; `--local` maps to `./.agents/skills` and `./.codex/akili`; `--codex-target <path>` overrides the config home (resources at `<path>/akili`); `--codex-skills-target <path>` overrides the skills root; `--target <path>` with `--tool codex` selects a **single-root layout** (`<path>/akili` + `<path>/skills`, a root Codex still reads) so a temp path fully sandboxes the install.

#### Scenario: Skip-by-default and force

- GIVEN a prior Codex install
- WHEN `akili install --tool codex` runs again without `--force`
- THEN every existing file is reported `skip existing` and none is rewritten
- AND with `--force` every file is overwritten through the atomic copy path (v2.23.2 semantics: temp file + rename)
- BUT it must NOT touch any non-AKILI skill already present in `~/.agents/skills` (a foreign skill named identically to a packaged one is skipped without `--force` and reported as such)

#### Scenario: Dry run

- GIVEN `--dry-run`
- WHEN install runs for Codex
- THEN the planned writes are listed with `would install` / `would create dir` and nothing is written
- AND IT MUST list the command skills under their `akili-<name>/SKILL.md` paths, not as `commands/*.md`

#### Scenario: Partial installs

- GIVEN `--commands-only`
- WHEN install runs for Codex
- THEN only the 11 command skills are written (no packaged skills, no resources)
- AND `--skills-only` writes only the 24 packaged skills
- BUT it must NOT write a `commands/` directory under either root in any mode

### FR-3: `doctor` covers Codex

`akili doctor --tool codex` SHALL check each command at `<skills-root>/akili-<name>/SKILL.md`, each skill at `<skills-root>/<skill>/SKILL.md`, each resource file, and `--fix` SHALL restore missing items through the same paths. The Environment section SHALL gain a `codex` row (binary probe `codex --version`) with the same never-fails semantics as `codegraph` and `playwright-cli`.

#### Scenario: Healthy install

- GIVEN a complete Codex install
- WHEN `doctor --tool codex` runs
- THEN all commands, skills, and resources report `OK` and the run exits 0
- AND the Environment row shows the Codex version when the binary works

#### Scenario: Binary absent or broken

- GIVEN no `codex` binary, or one that fails to spawn (the local 0.66.0 vendor-ENOENT case)
- WHEN `doctor --tool codex` runs
- THEN the Environment row reports it as not found with the install hint (`npm install -g @openai/codex`)
- BUT it must NOT flip the exit code or count toward `missing`

#### Scenario: Legacy manual copies

- GIVEN `~/.codex/skills/akili-execute/SKILL.md` exists from a manual copy and the standard root is complete
- WHEN doctor runs
- THEN the standard root is what is checked; the legacy copy is neither required nor deleted, and doctor prints one informational line naming it as present and unmanaged

### FR-4: Registry generalization with zero regression on the three shipping targets

`TOOL_REGISTRY` SHALL express each target as per-type roots plus a `commandsAsSkills` flag, and Antigravity SHALL be re-expressed through that flag rather than a `tool === "antigravity"` branch.

#### Scenario: Antigravity, OpenCode, Claude Code unchanged

- GIVEN the tree produced by the **published** `akili-specs@2.23.2` (`npx --yes akili-specs@2.23.2 install --tool <t> --target <tmp-a>`) for each of the three targets
- WHEN the working tree runs the same command into `<tmp-b>`
- THEN the sorted relative file lists of the two trees are identical for every target (layout identity — `scripts/ci/install-layout-regression.js`)
- AND every file whose SHA-256 differs between the two trees is byte-identical to its working-tree source under `.claude/` (a canonical-file edit made by this spec, reported `EXPECTED-DIFF <path>`), so the only content differences are the ones this spec made to shared files — never an installer mapping change
- AND IT MUST hold on Windows paths too (CI matrix)
- BUT the step must NOT fail the job when the npm registry is unreachable — it prints `SKIP` and exits 0, and the skip is visible in the log

### FR-5: Step 8E binds personas to models on Codex

`/akili-constitution` Step 8E SHALL gain a Codex bullet that, with user approval, writes `.codex/agents/akili-{leader,implementer,reviewer,tester}.toml`, each carrying `name`, `description`, `developer_instructions` that **reference** the `.agents/<role>.md` persona (never duplicate it), `model` from the registry's Codex column, and `model_reasoning_effort` from the Effort dial defaults (Leader/Reviewer higher, Implementer `medium`, Tester per its persona). The Reviewer's `model` MUST differ from the Implementer's, and the Reviewer wrapper MUST carry the host's write restriction (`sandbox_mode = "read-only"`) — the second axis of author ≠ auditor that Step 8E already requires on every host — with the Step 9 summary naming that state.

#### Scenario: Constitution on a Codex-hosted project

- GIVEN the user accepts Step 8E on Codex
- WHEN the wrappers are written
- THEN `/akili-execute` and `/akili-test` prefer them (the same "spawn those named agents" rule that exists for Claude Code/OpenCode), and the Step 9 summary names the four files and the two distinct models
- BUT it must NOT add `model:` to any command file or inject a model in the installer (AGENTS.md Model Routing rule)
- AND IT MUST document that Codex subagent orchestration is model-driven — the Leader *asks* for the named role; there is no explicit spawn tool contract to cite — with a verification pin

### FR-6: Step 8F gate is enforced on Codex

Step 8F SHALL offer the same `[x]`-without-PASS gate for Codex projects: a `PreToolUse` entry in the project's `.codex/hooks.json` invoking the existing `akili-tasks-gate.sh`, with the merge rules already stated for `settings.json` (read first, abort on invalid JSON, never clobber foreign hooks). The step title SHALL drop "Claude Code only"; the honesty note SHALL read: enforced on Claude Code and Codex, instructional on OpenCode and Antigravity.

#### Scenario: Gate fires in Codex

- GIVEN the hook is installed and `execution.md` lacks PASS evidence for a task
- WHEN the agent attempts to flip that task to `[x]`
- THEN the write is denied and the denial message names the evidence-first rule
- AND IT MUST be verified live once, with the Codex version and the raw hook payload recorded; the Codex tool names and payload field paths live in a declared host table the script reads, and a `tasks.md` write whose content the script cannot extract is denied (fail-closed), never passed through
- BUT the script must NOT fall through to exit 0 on a `docs/specs/*/tasks.md` path it cannot parse

#### Scenario: Corrupt hooks file

- GIVEN `.codex/hooks.json` exists but is not valid JSON
- WHEN Step 8F runs
- THEN it aborts without writing and tells the user which file to fix

### FR-7: Model Routing registry gains Codex

`docs/model-routing.md` SHALL add a Codex column to the tier table (T1–T6), a `.codex/agents/*.toml` row in *Enforced routing*, a Codex bullet in *How to apply per tool* (`/model` and `/reasoning`), and a `codex` row in the CLI-invocation table; and `/akili-constitution` Step 8C SHALL scaffold four host columns and a `codex` invocation row into each project's registry (today it states three). Column values SHALL be filled from the live `codex` roster at execution time, alias-first where Codex exposes aliases, families-not-slugs otherwise (Antigravity precedent), with a verification pin.

#### Scenario: Audit sees no drift

- GIVEN a project constitution scaffolded after this change
- WHEN `/akili-audit` runs Model Registry Drift
- THEN the project registry and the packaged default agree on the Codex column
- BUT the column must NOT contain a model name that was not confirmed against a live roster or an official page on the pinned date

### FR-8: Per-host guidance names Codex

`/akili-execute` (spawn mechanics, model checkpoint switch wording, Unattended Mode), `/akili-test` (Tester spawn and model checkpoint), and `docs/flow.md` (per-host launch; `.agents/` resolution paragraph) SHALL name Codex explicitly wherever they enumerate hosts today. `.claude/templates/leader.md` enumerates no hosts and is out of scope. The Codex switch wording (`/model`, `/reasoning`) is a behavior claim: pinned, and listed in FR-10's evidence.

#### Scenario: Leader inside Codex

- GIVEN a Leader running `/akili-execute` in Codex with Step 8E wrappers present
- WHEN it reaches the spawn step
- THEN the command text tells it to request the named `akili-implementer` / `akili-reviewer` roles and how the result returns
- AND the model checkpoint tells it the switch is `/model` (and `/reasoning` for effort) in Codex
- BUT Unattended Mode must NOT claim a Codex equivalent unless verified live — otherwise it states "no verified equivalent", the OpenCode wording

#### Scenario: `.agents/` three tenants

- GIVEN a repo with AKILI personas at `.agents/*.md`, Antigravity wrappers at `.agents/agents/`, and a local Codex install at `.agents/skills/`
- WHEN any host resolves its own tenant
- THEN none of the three collides, and `docs/flow.md` + Step 8E state the layout in one table

### FR-9: Documentation coherence and claim pinning

Every Codex behavior claim in commands and docs SHALL carry a verification pin. Mirrors (`docs/commands/*.md`, `docs/cli.md`), root docs (`README.md`, `docs/README.md`, `.claude/README.md`, `AGENTS.md`), and `CHANGELOG.md` SHALL reflect four targets wherever they say three.

#### Scenario: Aggregate claim falsification (KZ-002)

- GIVEN the statement "every command is installed as a Codex skill" in README/CHANGELOG
- WHEN the closure sweep runs
- THEN `doctor --tool codex` on a fresh install is the grep that would falsify it, and it reports 11/11
- AND IT MUST sweep the design's named pattern set (`three (install )?targets`, `three tools`, `three hosts`, `three-tool`, `[Aa]ll three`, `other two targets`, `Claude Code, OpenCode,? and (Google )?Antigravity`, `claude, opencode, antigravity`) across `*.md`, `bin/akili.js`, and `scripts/`, read the install-target tables by eye, and update or justify every hit
- AND Step 9 of the constitution gains a one-line `AGENTS.md` byte-size check for Codex projects that names the config key to raise (proposal R4)

### FR-10: Live validation is a closing gate

Before the spec is complete, the installed result SHALL be exercised in a real Codex session on a current release, and the evidence (Codex version; `/skills` listing shows `akili-*`; a command loads; a wrapper spawns the Reviewer on a different model than the Implementer and the Reviewer cannot write; `/model` and `/reasoning` behave as documented and the accepted effort enum; the raw `PreToolUse` payload and the gate denying a `[x]` write; the `.agents/` tenant claim; skill-menu truncation observed or not) SHALL be recorded in `execution.md`.

#### Scenario: Validation blocked

- GIVEN the local Codex cannot be updated (network, permissions)
- WHEN the validation task runs
- THEN the task is parked `[~]` with the blocker named, the affected claims keep an `Unverified:` marker, and the spec is not archived as complete

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | **Skip-by-default preserved.** No mode of the Codex target overwrites without `--force` (AGENTS.md Development Rules). Verification: FR-2 skip scenario on CI. |
| NFR-2 | **No fork of skill or command content.** Codex receives the same bytes as Claude Code; any tightening (e.g. descriptions) happens in the canonical files for all hosts. Verification: `diff` of installed Codex skill vs `.claude/skills` source is empty. |
| NFR-3 | **Host-neutral commands.** No `model:`, no Codex-only prose in command frontmatter; host differences live in named per-host paragraphs. Verification: `grep -n "^model:" .claude/commands/*.md` is empty. |
| NFR-4 | **CI matrix green** (ubuntu/macos/windows × Node 18/22) with Codex included in `--tool all`, doctor never failing on the absent binary. |
| NFR-5 | **Claims are dated.** Every Codex claim carries `Last verified` + URL; a claim that could not be exercised carries `Unverified:`. |
| NFR-6 | **Registry simpler after than before.** The Antigravity special case disappears; `TOOL_REGISTRY` entries are data, not branches. Verification: `grep -c 'tool === "antigravity"' bin/akili.js` decreases to 0 in the install path. |

## 8. Defect Classes → Gates

| Defect class this spec can produce | Gate that catches it | Falsifying input |
|---|---|---|
| Wrong Codex paths (skills or resources land where Codex does not look) | CI `install --tool all` + `doctor --tool all` on the matrix; live `/skills` shows `akili-*` | Install into a temp home and run doctor: a `MISSING` row. Live: `/skills` without `akili-*` |
| Regression on Claude Code / OpenCode / Antigravity trees | FR-4 layout diff against a v2.23.2 baseline tree per target, content diff tolerated only where side B equals its working-tree source | Any path-list diff, a content diff on a file whose working-tree source is unchanged, or a changed `--dry-run` path list |
| Windows path handling in the new per-type roots | CI windows-latest jobs | A `\`/`/` mismatch surfacing as `MISSING` on Windows only |
| Detection false positive from a shared `~/.agents/skills` | Unit-style check: populated `~/.agents/skills` with no `akili-*` and no `~/.codex/akili` ⇒ Codex not detected | Codex appearing in the auto-detected list in that fixture |
| Stale or wrong Codex claim (docs churn) | Verification pins + live validation (FR-10) | Fetching a pinned URL that no longer states the claim; a live step behaving differently |
| Prose executability (Leader/constitution text an agent cannot follow) | **No automated check.** Substitute: the FR-10 live walkthrough at the closing HITL pause | A walkthrough step the agent cannot perform from the text alone |
| Skill-menu truncation in Codex | **No offline check.** Substitute: live `/skills` inspection; recorded as observed/not | Fewer than 35 AKILI entries visible, or `akili-*` absent |
| Hook payload mismatch | Live gate trigger (FR-6) | The `[x]` write succeeding without PASS evidence |
| Aggregate doc claims false (KZ-002) | `doctor` 11/11 + the FR-9 sweep greps | A doc saying "three targets" surviving the sweep |

Accepted risk: the exact Codex version validated is a point-in-time fact; future Codex releases may move paths again. Mitigation is the pin, not a promise.

## 9. Requirement ID Index

| ID | Title | Owner surface |
|---|---|---|
| FR-1 | `codex` selectable target | `bin/akili.js` args/tools/init/help, `docs/cli.md` |
| FR-2 | Codex layout | `bin/akili.js` registry + install loop |
| FR-3 | Doctor covers Codex | `bin/akili.js` doctor + `RECOMMENDED_ENV` |
| FR-4 | Registry generalization, zero regression | `bin/akili.js` registry; CI |
| FR-5 | Step 8E Codex wrappers | `akili-constitution.md` + mirror |
| FR-6 | Step 8F gate on Codex | `akili-constitution.md` + mirror |
| FR-7 | Model Routing Codex column | `docs/model-routing.md`, `akili-constitution.md` Step 8C |
| FR-8 | Per-host guidance | `akili-execute.md`, `akili-test.md`, `docs/flow.md` + mirrors (`leader.md`: no edit) |
| FR-9 | Doc coherence + pins | README, docs/, AGENTS.md, CHANGELOG |
| FR-10 | Live validation gate | `execution.md` evidence |
| NFR-1..6 | Skip-by-default, no fork, host-neutral, CI, dated claims, simpler registry | cross-cutting |
