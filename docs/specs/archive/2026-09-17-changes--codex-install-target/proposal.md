# Proposal — OpenAI Codex CLI as a Fourth Install Target

**Recommendation:** add `codex` to the `akili` installer and to the methodology's per-host guidance, treating Codex the way Claude Code is treated today — enforced model routing per agent, harness-level guardrail hook — not the guidance-only way Antigravity was first shipped. Codex exposes every surface AKILI needs (Agent-Skills-standard `SKILL.md`, native `AGENTS.md`, TOML subagent roles with `model` + `model_reasoning_effort`, `hooks.json` with a blocking `PreToolUse`), and the installer already has the one mechanism Codex requires that Claude Code does not: installing commands as skills. One bounded spec, release classified **minor** (new install target).

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/codex-install-target` |
| Slug | `codex-install-target` — derived from the free-text argument ("Add OpenAI Codex CLI as a fourth AKILI-SPECS install target …"); the full text is proposal context, not a directory name |
| Type | Change |
| Approval Mode | gated |
| Status | Proposed |
| Date | 2026-09-16 |
| Author | /akili-propose (T1) |
| Depends on | none |
| Parallel-safe | yes |
| Release Classification | **minor** — new install target (`AGENTS.md` → Release Rules: "minor for new commands or install targets") |
| Scope Chunking | Considered and rejected: single developer on `master`, sequential work, both halves (installer + methodology) touch `CHANGELOG.md`/`README.md`, and the only conclusive validation — a live Codex session — needs both halves present. `tasks.md` sequences installer → methodology → live validation instead |

## Intent

Let a developer whose daily host is OpenAI Codex CLI install and run the complete AKILI-SPECS lifecycle — every `/akili-*` command, the packaged skills, the `.agents/` triad with per-role model binding, and the `[x]`-without-evidence guardrail — with the same `akili install` / `doctor` / `update` ergonomics the other three hosts have, and without the methodology losing any correctness guarantee it holds on Claude Code.

## Problem / Current Behavior

| # | Today | Consequence |
|---|---|---|
| 1 | `bin/akili.js` `TOOL_REGISTRY` knows `claude`, `opencode`, `antigravity`. `--tool codex` fails validation | A Codex user cannot install AKILI at all; hand-copying 11 commands + 24 skills into two different roots is the only path |
| 2 | Every host-specific paragraph (`/akili-execute` spawn mechanics, `/akili-constitution` Step 8E wrappers and Step 8F hook, `leader.md`, `docs/flow.md` per-host launch, `docs/model-routing.md` registry columns and CLI-invocation table) enumerates three hosts | An agent running AKILI inside Codex has no instruction for how to spawn the Implementer/Reviewer, which model column to read, or whether the guardrail is enforced or instructional |
| 3 | `akili notifications` and the Step 8F gate write only Claude Code's `settings.json` | Documented as "Claude Code only" — accurate, but Codex now has an equivalent hook surface, so the asymmetry is no longer forced |
| 4 | Codex's own extension surfaces moved recently: custom prompts (`~/.codex/prompts`, `/prompts:<name>`) are **deprecated in favor of skills**; skill roots moved from `~/.codex/skills` (still honored as legacy) to `~/.agents/skills` (user) and `.agents/skills` (repo) | A port designed against last year's docs would install into a deprecated surface. The design must target the current standard and tolerate the legacy root |

**Local evidence (2026-09-16):** this machine has `@openai/codex` **0.66.0** installed via npm, and its vendored binary is missing (`spawn …/vendor/aarch64-apple-darwin/codex/codex ENOENT`). `~/.codex/skills/` holds 3 legacy skills, `~/.agents/skills/` holds 55 skills written there by other tools that follow the Agent Skills standard, and `~/.codex/agents/`, `~/.codex/hooks.json`, `~/.codex/prompts/` do not exist. Live validation therefore requires reinstalling Codex to a current version first.

## Proposed Outcome

After this change, on a machine with a current Codex CLI:

1. `akili install --tool codex` (and `--tool all`, `akili init` option 5, auto-detection when `~/.codex/` exists) installs:
   - the 11 commands as skills at `~/.agents/skills/akili-<command>/SKILL.md` — invoked in Codex as `$akili-execute`, `$akili-specify`, … and also selectable implicitly from their `description`;
   - the 24 packaged skills at `~/.agents/skills/<skill>/SKILL.md`, byte-identical to the Claude Code copies (the frontmatter already satisfies the Agent Skills standard: `name` + `description`);
   - helper resources (`.agents/` persona templates, `.mcp.json.example`) at `~/.codex/akili/`.
   `--local` maps to `./.agents/skills` + `./.codex/akili`. `--codex-target <path>` overrides the `~/.codex` root; the skills root follows the standard unless `--codex-skills-target` is given (name to be settled in design).
2. `akili doctor --tool codex` reports every command (as `<skills>/akili-*/SKILL.md`), every skill, resources, and under *Environment* the `codex` binary with the same never-fails-the-check semantics as `playwright-cli` and CodeGraph today.
3. `/akili-constitution` Step 8E gains a **Codex** bullet: `.codex/agents/akili-{leader,implementer,reviewer,tester}.toml` with `name`, `description`, `developer_instructions` pointing at the `.agents/<role>.md` persona, `model` from a new Codex column in the Model Routing registry, and `model_reasoning_effort` from the Effort dial — the first host where the effort dimension binds natively per role. Author ≠ auditor becomes structural on Codex exactly as on Claude Code.
4. `/akili-constitution` Step 8F offers the same `[x]`-without-PASS-evidence gate for Codex: `.codex/hooks.json` `PreToolUse` entry calling the existing `akili-tasks-gate.sh`, returning `permissionDecision: deny`. Step 8F's title drops "Claude Code only"; the honesty note keeps OpenCode and Antigravity as instructional.
5. `docs/model-routing.md` gains a Codex column in the tier registry (filled from the live `codex` model roster at specify/execute time, families-not-slugs where the roster moves fast — the Antigravity precedent) and a `codex` row in the CLI-invocation table.
6. Per-host paragraphs in `/akili-execute` (spawn mechanics, model checkpoint switch instruction, Unattended Mode claim), `/akili-test`, `.claude/templates/leader.md`, `docs/flow.md` (per-host launch, `.agents/` resolution note) name Codex explicitly, including how the Leader asks Codex to spawn a named role (subagent orchestration is model-driven; no explicit spawn tool contract exists to cite).
7. Docs mirrors at parity: `docs/cli.md`, `docs/commands/akili-constitution.md`, `docs/commands/akili-execute.md`, `docs/commands/akili-test.md`, `docs/README.md`, `README.md` (badge, prerequisites table, install matrix, "canonical source for all four targets" note), `CHANGELOG.md` under Unreleased.

## Scope

- `bin/akili.js` — `TOOL_REGISTRY.codex`; generalize the per-tool layout so a target can (a) install commands **only** as skills (`commandsAsSkills: true`, replacing the `tool === "antigravity"` special case) and (b) declare roots that are not children of one `rootPath` (skills under `~/.agents`, resources under `~/.codex`); `--tool codex`, `--codex-target`, `ALL_TOOLS`, `detectInstalledTools` keyed on `~/.codex/` (never on `~/.agents/skills`, which other tools populate), `selectedTools`/`both` semantics unchanged, `init` wizard option, post-install hint ("restart Codex or open a new chat"), legacy cleanup of `~/.codex/skills/akili-*` if a previous manual install is found, `doctor` environment row for the `codex` binary, help text.
- `.claude/commands/akili-constitution.md` — Step 8E Codex bullet + TOML field table; Step 8F Codex variant (hooks.json merge rules mirror the settings.json ones: read first, abort on invalid JSON, never clobber foreign hooks); Step 9 summary lines; the `.agents/` layout note (personas at root, Antigravity under `.agents/agents/`, Codex skills under `.agents/skills/` — three tenants, no collision).
- `.claude/commands/akili-execute.md`, `.claude/commands/akili-test.md`, `.claude/templates/leader.md` — Codex spawn paragraph, model-switch wording (`/model` and `/reasoning` in Codex), Unattended Mode: no claim for Codex unless verified live.
- `docs/model-routing.md` — Codex column (T1–T6), `## How to apply per tool` Codex bullet, CLI-invocation row, enforced-routing table row (`.codex/agents/*.toml`).
- `docs/flow.md`, `docs/cli.md`, `docs/commands/*.md` mirrors, `docs/README.md`, `README.md`, `CHANGELOG.md`.
- `scripts/ci/…` / `.github/workflows/ci.yml` — `install --tool all` already runs on the matrix; it will now exercise the Codex layout too. A doctor run for `codex` on a runner without the binary must stay green (environment rows never fail the check).

## Non-Goals

- Installing the deprecated custom-prompt surface (`~/.codex/prompts/*.md`, `/prompts:akili-*`). Skills are the supported path; a `/`-style alias is not worth shipping into a deprecated mechanism. Revisit only if users report `$`-invocation friction.
- `akili notifications` for Codex (a `SessionStart` hook in `~/.codex/hooks.json`). Same shape as the Claude Code one; deferred to keep this spec bounded. Recorded as a follow-up.
- Rewriting command prose to say `$akili-*` instead of `/akili-*`. Commands stay host-neutral; the invocation difference is documented once (README + `docs/cli.md`), the Antigravity-workflows precedent.
- Codex Cloud, the Codex IDE extension, the Codex SDK / App Server, and `spawn_agents_on_csv`-style batch orchestration.
- Trimming skill `description` strings for Codex's menu budget (see Risks). Measured first; acted on only if the live session shows truncation.
- Any change to what is installed for Claude Code, OpenCode, or Antigravity.

## Affected Users, Systems, And Specs

| Who / What | Effect |
|---|---|
| Developers whose host is Codex CLI | New: full AKILI lifecycle available |
| Existing users of the other three hosts | None functionally; `--tool all` and auto-detect now include Codex when `~/.codex/` exists |
| `bin/akili.js` | Registry generalization touches the install loop, doctor, init, detection; the atomic-copy paths from v2.23.2 are reused unchanged |
| `/akili-constitution`, `/akili-execute`, `/akili-test`, `leader.md` | Per-host guidance grows a fourth host |
| `docs/model-routing.md` | Fourth registry column; `/akili-audit` Model Registry Drift will compare against it |
| Active spec `changes/scoped-constitution-reads` | Disjoint files (implementer/tester persona read scope); no interaction |
| Release | `minor` bump; `npm run verify:cli`, `install --tool all --dry-run`, matrix CI |

## Visual Reference

- Source: None
- Location: n/a
- Notes: installer + methodology prose change; no UI surface.

## Requirement Delta Preview

### ADDED Requirements

- `akili install|update|doctor --tool codex`, `--codex-target`, `--tool all` includes Codex, `akili init` offers Codex, auto-detection recognizes `~/.codex/`.
- Commands install as Codex skills (`akili-<command>/SKILL.md`) under the Agent-Skills-standard root; packaged skills install alongside; resources under `~/.codex/akili`.
- Step 8E Codex wrappers (`.codex/agents/*.toml`) binding model **and** reasoning effort per role.
- Step 8F Codex variant of the tasks gate via `.codex/hooks.json`.
- Codex column and invocation row in the Model Routing registry; Codex paragraphs in execute/test/leader/flow.

### MODIFIED Requirements

- `TOOL_REGISTRY` layout contract: from "paths under one root" to "per-type roots + `commandsAsSkills` flag"; Antigravity is re-expressed through the flag with identical on-disk results (regression-checked by the existing CI install steps).
- Step 8F title and honesty note: enforced on Claude Code **and Codex**; instructional on OpenCode and Antigravity.
- README/docs claims "three install targets" → four.

### REMOVED Requirements

- None.

## Approach Options

| Option | Description | Trade-offs |
|---|---|---|
| **A. Skills-first, legacy-tolerant (recommended)** | Commands and skills into `~/.agents/skills`; resources into `~/.codex/akili`; wrappers and hooks under `.codex/`; `~/.codex/skills` recognized only for cleanup/doctor of stale manual installs | Targets the supported surface; reuses the existing commands-as-skills path; one new registry concept (per-type roots). Users invoke `$akili-*`, not `/akili-*` |
| B. Prompts + skills | Additionally write `~/.codex/prompts/akili-*.md` so `/prompts:akili-execute` works | Familiar `/` invocation, but ships into a surface OpenAI has already deprecated; two copies of every command to keep in sync; prompts are top-level only and not shareable per repo |
| C. Legacy root (`~/.codex/skills`) | Install everything under `~/.codex/`, single root like the other hosts | Smallest installer change, but targets the legacy location; per-repo `--local` would not match Codex's `.agents/skills` discovery; likely to break on a future Codex release |

## Recommended Approach

**Option A.** It is the smallest path that lands on the supported surface, and its one structural change to the installer (per-type roots + `commandsAsSkills`) also removes the `tool === "antigravity"` special case, so the registry ends simpler than it started. The methodology half mirrors, step for step, what Step 8E/8F already say for Claude Code, with Codex's TOML/JSON shapes substituted; where Codex is genuinely different (model-driven subagent spawning, `$` invocation, `/reasoning` as a first-class effort switch) the prose says so instead of pretending parity.

## Risks, Dependencies, And Open Questions

| # | Risk / Question | Mitigation |
|---|---|---|
| R1 | **Docs churn.** Several official Codex pages returned 404 today and paths moved within the year. A claim pinned to a page that later moves is the KZ-001 failure class (read the pinned source fully; here, pin the *current* one and record the verification date) | Every host claim in the spec carries `Last verified: <date>` + URL; live validation in a real Codex session is a closing gate, not optional. `Unverified:` marker where a claim could not be exercised |
| R2 | **Skill-menu budget.** Codex injects only `name` + `description` per skill, capped near 2% of context (8,000 chars when unknown). Measured today: commands 1,310 chars, skills 8,161 chars, **total 9,471** — over the fallback cap once the user's other 55 skills are counted. Top offenders: `seo-audit` 821, `ui-ux-pro-max` 807 | Measure in the live session (`/skills`). If truncated, the fix is per-skill description tightening applied to the canonical files (benefits every host) — a separate patch, never a Codex-only fork of the skill files |
| R3 | **Hook payload shape.** `akili-tasks-gate.sh` parses Claude Code's `PreToolUse` stdin JSON (`tool_name`, `tool_input.file_path`, content). Codex's hook payload is documented as compatible in shape, but field names for file writes are unverified | Validate live; if fields differ, the gate script grows a small host-detection branch rather than a second script |
| R4 | **`AGENTS.md` byte cap.** Codex truncates project docs at a configurable byte limit (32 KiB default, to confirm). This repo's `AGENTS.md` is 14.5 KB; a project with Skill Map + Model Routing + constitution summary could approach the cap | Constitution Step 9 gains a one-line size check for Codex projects and names the config key to raise |
| R5 | **Shared `~/.agents/skills` root.** Other tools honoring the Agent Skills standard also write there (55 skills present locally). AKILI's skills become visible to those tools too | Acceptable and arguably desirable; skip-by-default protects foreign files with the same names; documented in `docs/cli.md` |
| R6 | **Codex binary broken locally** (0.66.0, vendor ENOENT) and a year behind the documented features | Reinstall `@openai/codex@latest` before the validation task; record the exact version validated against in `execution.md` |
| R7 | **Model column content.** Registry needs real Codex model identifiers; today's config shows `gpt-5.1-codex`, docs reference newer families | Fill from the live `/model` roster during specify; alias-first where Codex exposes aliases, families-not-slugs otherwise (Antigravity precedent) |
| Q1 | Should `--tool both` stay Claude + OpenCode, or become a deprecated alias now that there are four hosts? | Keep as-is (documented pair); `all` is the four-host switch. Confirm at approval |
| Q2 | `--local` for Codex: `./.agents/skills` follows Codex's repo discovery, but AKILI personas also live in `./.agents/`. Confirm the three-tenant layout is acceptable | Design records the layout table; no file collides |
| Q3 | Lessons KZ-002 applies: before claiming "every command is installed as a Codex skill", run the grep/doctor that would falsify it | `doctor --tool codex` is that check; CI runs it on the matrix |

## Success Criteria

- `akili install --tool codex` on a clean home writes 11 command skills, 24 skills, and resources to the documented roots; a second run skips everything; `--force` overwrites; `--dry-run` writes nothing. Verified on the CI matrix (Linux/macOS/Windows, Node 18/22).
- `akili doctor --tool codex` reports all green after install and lists the `codex` binary under Environment without failing when absent.
- `install --tool antigravity` output is byte-identical before and after the registry refactor (regression).
- In a live Codex session (current release): `$akili-propose` and `$akili-execute` appear in `/skills` and load; the `.agents/` triad is reachable; a Step 8E wrapper spawns the Reviewer on a model different from the Implementer; the Step 8F hook blocks a `[x]` write lacking PASS evidence. Each result recorded with the Codex version.
- Every Codex claim in commands/docs carries a URL and a verification date; `/akili-audit` reports no Model Registry Drift against the new column.
- `CHANGELOG.md` Unreleased carries the minor entry; docs mirrors at parity (`docs/commands/*`, `docs/cli.md`, `README.md`).

## Next Step

```text
/akili-specify changes/codex-install-target
```
