# `/akili-constitution`

Establish or strengthen the project-wide AKILI foundation and scaffold the multi-agent harness.

## Usage

```text
/akili-constitution
```

## Use When

- Starting a new repository.
- Existing project docs are missing, stale, or inconsistent.
- A major product pivot changed the project's baseline assumptions.
- Agents need stable `CLAUDE.md` and `AGENTS.md` guidance.
- The project does not yet have a `.agents/` directory powering `/akili-execute`.

## Behavior

The command classifies the repository into one of three modes and adjusts its behavior accordingly.

| Mode | Meaning | Constitution Behavior | `.agents/` Behavior |
|---|---|---|---|
| Brand-new (Seed Setup) | No code, no AKILI-SPECS docs | Draft baseline from user intent, chosen stack, assumptions, open questions | Copy default Leader / Implementer / Reviewer personas verbatim |
| Legacy (Discovery Setup) | Real code exists, no AKILI-SPECS baseline | Inspect repository reality (CodeGraph preferred) before drafting; synthesize from evidence | Copy defaults then customize with detected stack, design tokens, lint and test commands |
| Active AKILI-SPECS (Safe Update) | AKILI-SPECS baseline already present, custom `.agents/` may exist | Upgrade weak sections, fill missing files non-destructively | Never overwrite existing personas — only append minimal upgrade blocks |

For Legacy and Active-AKILI-SPECS modes, if `.codegraph/` exists CodeGraph is used for semantic exploration; if it is missing and the CLI is available, the agent asks before initializing it.

## Outputs

Creates or enhances:

- `docs/prd.md`
- `docs/ux-ui/design.md`
- `docs/trd/trd.md`
- `docs/specs/general-setup/requirements.md`
- `docs/specs/general-setup/design.md`
- `docs/specs/general-setup/task.md`
- `docs/specs/general-setup/family.md` (a fourth template, Step 7: the manifest schema — Document Control plus an ordered child table — that `/akili-propose` and `/akili-specify` write only when a proposal is actually split into a spec family; its absence means the spec is flat, with no added obligations)
- `docs/specs/kaizen/` (scaffolded with a one-line `README.md`: one kaizen entry file per spec, written by the `kaizen` skill's Record phase)
- `docs/specs/audits/` (scaffolded with a one-line `README.md`: one drift report per `/akili-audit` run)
- `CLAUDE.md`
- `AGENTS.md`
- `.agents/leader.md`
- `.agents/implementer.md`
- `.agents/reviewer.md`
- `.agents/tester.md`

Projects created before the TRD naming may still have `docs/system-design/design.md` (UX/UI blueprint) and `docs/detailed-design/detailed-design.md` (technical blueprint). The constitution treats those as the existing UX/UI Design document and TRD, and in Active-AKILI-SPECS mode offers to migrate them to `docs/ux-ui/design.md` and `docs/trd/trd.md`.

Both scaffold READMEs are scaffolding, never content: a README never counts as a kaizen entry file or as an audit report for any reader, so a "most recent report" read that finds only the README concludes the directory holds none, and a pending-item count over `docs/specs/kaizen/` skips it.

The root guides also carry a `## Module Guides` index: modules whose conventions diverge from the root get a thin child `CLAUDE.md`/`AGENTS.md`, and every child guide must be referenced from that index. `/akili-execute` records new-module impact notes and `/akili-archive` syncs the guides and recommends a CodeGraph re-index.

## Branch Pin & Shared-File Write Discipline

The constitution summary written into the root `CLAUDE.md`/`AGENTS.md` carries two rules that bind every command:

- **`Default Branch: <name>`** — detected once at constitution time (`git symbolic-ref refs/remotes/origin/HEAD --short` with its `origin/` prefix stripped, or the user's answer when that ref is unset) and confirmed with the user before it is written. This pin is the primary source every AKILI command's branch test compares the checked-out branch against: commands read it from the root guides they already load, so no command duplicates a resolution procedure. When the pin is absent (legacy projects), the `kaizen` skill's **Branch Context** rule owns the fallback resolution and its safe default.
- **The shared-file write discipline** — on a spec branch, lifecycle side-effect writes (kaizen standardizations, `/akili-archive` guide and TRD syncs, `/akili-audit` outputs) never edit shared guides, `.agents/` personas, packaged templates, or the TRD. Each would-be edit is recorded as a pending item and applied on the default branch. The packaged `leader.md` and `implementer.md` personas carry the same guardrail, with its exemption for files an approved `tasks.md` names as the spec's own deliverable — those are the spec's product, protected by the normal review flow, not a side effect. An inline-drafted persona must carry the guardrail *and* the exemption; dropping the exemption is not a shorter rule but a wrong one.

## Multi-Agent Harness Scaffolding

`.agents/` is the source of truth for the multi-agent harness: the loop that `/akili-execute` runs (Leader → Implementer → Reviewer) and the Leader → Tester(s) harness that `/akili-test` runs. The constitution seeds it from the packaged defaults shipped by the installer:

- Claude Code: `~/.claude/akili/templates/{leader,implementer,reviewer,tester}.md`
- OpenCode: `~/.config/opencode/akili/templates/{leader,implementer,reviewer,tester}.md`
- Antigravity: `~/.gemini/config/akili/templates/{leader,implementer,reviewer,tester}.md`
- Codex: `./.codex/akili/templates/{leader,implementer,reviewer,tester}.md` (local) / `~/.codex/akili/templates/{leader,implementer,reviewer,tester}.md` (global)

If packaged templates are not available, the constitution drafts equivalent personas inline using the structure documented in `/akili-execute` (rework loop, PASS/FAIL output contract, AKILI commit standard, Pivot Protocol).

The `.agents/` directory is tool-agnostic: pure Markdown + YAML frontmatter, resolved relative to the active workspace, and used by Claude Code, OpenCode, Google Antigravity (`invoke_subagent`), and Codex (which requests the named role by name — see *Model Binding Scaffolding* below).

`.agents/` carries three non-colliding tenants in a Codex-capable repo:

| Path | Tenant | Written by |
|---|---|---|
| `.agents/<role>.md` | AKILI personas (all hosts) | `/akili-constitution` Step 7 |
| `.agents/agents/akili-<role>/agent.md` | Antigravity wrappers | Step 8E |
| `.agents/skills/<name>/SKILL.md` | Codex repo-scope skills | `akili install --tool codex --local` |

Codex scans `.agents/skills` in every directory from the working directory up to the repository root, plus the user-scope `$HOME/.agents/skills` (`Last verified: 2026-09-16` — <https://learn.chatgpt.com/docs/build-skills>). **Confirmed live 2026-09-17 (codex-cli 0.154.0):** asked to enumerate every non-`akili-` skill it can see, Codex did not surface `.agents/<role>.md` (or an `akili-<role>` name) as a skill — the tenant is collision-free.

## Model Routing Scaffolding

Step 8C adds or upgrades a `## Model Routing` section in the project's root `AGENTS.md` and `CLAUDE.md`: a capability-tier registry that maps each AKILI-SPECS phase to a model **per tool** (Claude Code, OpenCode, Antigravity, and Codex — all four are CLI install targets, so all four always get a column, `<CONFIRM SLUG>` placeholders and all), following the **alias-first rule** (floating aliases like `opus`/`sonnet`/`haiku` wherever they exist, so the registry survives model generations without edits). The section also records each host's CLI invocation, since the product name is not reliably the binary — Antigravity's is `agy`, and Codex's is `codex` (commands are invoked as skills, `$akili-<name>`, not a slash command). No `model:` frontmatter is added to commands and the installer is unchanged. The registry enforces **author ≠ auditor** (the Reviewer runs on a different model than the Implementer) and, in Active-AKILI-SPECS mode, is non-destructive: an existing customized registry is preserved, gaps are filled, and stale entries are flagged against the packaged default without touching user pins. The Codex column names families (Astra, Sol, Terra, Luna), and the exact dated slug is confirmed against the user's own `/model` roster **and account plan** — confirmed live 2026-09-17 (codex-cli 0.154.0): on a ChatGPT-account login only `gpt-5.6-terra` and `gpt-5.6-luna` were accepted, so T1/T3 (Astra) and T2 (Sol) are plan-gated on such accounts; keep author ≠ auditor there with the fallback pairing Reviewer `gpt-5.6-terra` ≠ Implementer `gpt-5.6-luna`. The Antigravity column names the family and effort ID rather than an alias — **Gemini 3.8 Flash** (effort in the ID: `-high`/`-medium`/`-low`) for the volume tiers, **Gemini 3.1 Pro** as the T3 auditor — confirmed against the user's own roster with `agy models`. See [Model Routing](../model-routing.md) for the tiers and the default registry.

## Model Binding Scaffolding (Tool-Native Agent Wrappers)

Step 8E (with the user's approval) binds the `.agents/` personas to the registry's models via **tool-native agent definitions**: `.claude/agents/akili-{leader,implementer,reviewer,tester}.md` in Claude Code (alias-based `model:` frontmatter), the equivalent agent config in OpenCode (provider slugs — default leader/reviewer `opencode-go/deepseek-v4-pro`, implementer `opencode-go/deepseek-v4.1-flash`, tester `opencode-go/deepseek-v4-flash`; Leader and Reviewer sharing the T1/T3 slug does not break author ≠ auditor, which is enforced between Implementer and Reviewer), `.agents/agents/akili-<role>/agent.md` in Antigravity (`model: inherit|flash|pro`, plus `subagent: true` and `tools` — Antigravity does bind a model per agent, unlike this document's earlier wording), and `.codex/agents/akili-{leader,implementer,reviewer,tester}.toml` in Codex. Every wrapper is thin — it references the `.agents/<role>.md` persona instead of duplicating it — and makes model routing **enforced** for the `/akili-execute` and `/akili-test` fan-out, including a structural author ≠ auditor guarantee (the Reviewer wrapper pins a different model than the Implementer wrapper). In Active-AKILI-SPECS mode existing wrappers are never overwritten.

**Codex specifics:** the TOML wrapper carries `name`, `description`, a `developer_instructions` string that *references* `.agents/<role>.md` (never inlines it), `model` from the registry's Codex column, and `model_reasoning_effort` (Leader/Reviewer `high`, Implementer/Tester `medium`; the AKILI dial maps `max`→`max`, with `ultra` above it unmapped — confirmed live 2026-09-17, codex-cli 0.154.0: `-c model_reasoning_effort=<v>` accepted all six rungs on `gpt-5.6-luna`). The Reviewer wrapper alone also sets `sandbox_mode = "read-only"` — Codex has no documented per-agent tool allowlist, so the sandbox is the write-axis half of author ≠ auditor, the same role Antigravity's `tools` list and Claude Code's `tools` field play on their hosts; **confirmed live 2026-09-17:** a read-only session asked to create a file was denied (`patch rejected: writing is blocked by read-only sandbox`). Codex subagent spawning is model-driven, not a cited tool contract: the Leader requests the named role (e.g. "request `akili-reviewer` with this diff") and Codex itself spawns, routes, and returns the consolidated result. **Observed live 2026-09-17 (codex-cli 0.154.0), undocumented API:** the Leader's rollout shows it calling a `spawn_agent` tool (`agent_type` = the wrapper's `name`); the subagent's report returns to the Leader, inspectable with `/subagents`. Pin: <https://learn.chatgpt.com/docs/agent-configuration/subagents>, `Last verified: 2026-09-16`. A scaffolded `.codex/hooks.json` entry needs the user to trust it via `/hooks` (or `--dangerously-bypass-hook-trust` for `codex exec`) before it is active, and commits under Codex's default sandbox (`.git/` is protected) need an approval.

## Guardrail Hook Scaffolding (Step 8F, opt-in)

Step 8F offers a `PreToolUse` hook that blocks flipping a `docs/specs/*/tasks.md` task to `[x]` unless the same spec's `execution.md` already carries PASS evidence. It is **enforced** on Claude Code (`.claude/settings.json` + `.claude/hooks/akili-tasks-gate.sh`) and on Codex (`.codex/hooks.json` + `.codex/hooks/akili-tasks-gate.sh`, or the existing Claude Code copy if the project already has one — one script, two host entries); it remains **instructional only** (prose, not enforcement) on OpenCode and Antigravity. On Codex, the gate parses the `apply_patch` payload's `*** Update/Add/Delete File:` headers rather than a `file_path` field, and denies **fail-closed** — a `tasks.md` write it cannot parse is blocked, never passed through with a silent `exit 0`. **Confirmed live 2026-09-17 (codex-cli 0.154.0):** `apply_patch` carries no `file_path` field; the header carries an **absolute** path; the raw payload's top-level fields are `session_id, turn_id, transcript_path, cwd, hook_event_name, model, permission_mode, tool_name, tool_input, tool_use_id`; and denial is honored via stderr + exit 2 (the `permissionDecision` JSON form was not needed). Settings/hooks files are read first; the step aborts without writing on invalid JSON, and never overwrites an existing entry. In Active-AKILI-SPECS mode an existing script or hooks entry is never overwritten. **Hook trust:** a scaffolded `.codex/hooks.json` entry is inert until the user trusts it via `/hooks` (or passes `--dangerously-bypass-hook-trust` to `codex exec`).

**For Codex projects only:** Step 9 also checks that the combined `AGENTS.md` (constitution summary + `## Model Routing` + `## Skill Map`) stays under Codex's project-doc read limit, naming `project_doc_max_bytes` in `config.toml` as the key to raise if it doesn't.

## Skill Map Scaffolding

Step 8D adds or upgrades a `## Skill Map` section in the project's root `AGENTS.md` and `CLAUDE.md`: a table of the **stack-bound skills** that apply to this project's detected or declared stack (see [Skill Governance](../skills/governance.md)). Stack skills are never hardcoded into command text — `/akili-specify` derives each task's required skills from this map, and the `/akili-execute` Leader passes them to the Implementer/Tester via dynamic skill loading. In Active-AKILI-SPECS mode an existing customized map is preserved.

Skills the constitution itself draws on:

- `brainstorming` (Step 0 — project mode and intent)
- `product-manager-toolkit` (Steps 2–3 — interview script and PRD)
- `cognitive-doc-design` (all baseline documents)
- `ui-ux-pro-max`, or `frontend-design` + `stitch-design` (Step 4 — UX/UI design)
- Stack skills matching the repo (Step 5 TRD and the Skill Map): `nestjs-expert`, `api-design-principles`, `error-handling-patterns`, `aws-serverless`, `shadcn-ui`, `tailwind-design-system`, `vercel-react-best-practices`, `angular-developer`, `ai-agent-development`

## Next Step

After approving the baseline and confirming `.agents/` is in place, start a change:

```text
/akili-propose <change-name-or-spec-path>
```

For a small, obvious change, you may start with:

```text
/akili-specify <spec-path>
```
