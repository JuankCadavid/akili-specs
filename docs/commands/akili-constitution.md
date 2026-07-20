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
- `CLAUDE.md`
- `AGENTS.md`
- `.agents/leader.md`
- `.agents/implementer.md`
- `.agents/reviewer.md`
- `.agents/tester.md`

Projects created before the TRD naming may still have `docs/system-design/design.md` (UX/UI blueprint) and `docs/detailed-design/detailed-design.md` (technical blueprint). The constitution treats those as the existing UX/UI Design document and TRD, and in Active-AKILI-SPECS mode offers to migrate them to `docs/ux-ui/design.md` and `docs/trd/trd.md`.

The root guides also carry a `## Module Guides` index: modules whose conventions diverge from the root get a thin child `CLAUDE.md`/`AGENTS.md`, and every child guide must be referenced from that index. `/akili-execute` records new-module impact notes and `/akili-archive` syncs the guides and recommends a CodeGraph re-index.

## Multi-Agent Harness Scaffolding

`.agents/` is the source of truth for the multi-agent harness: the loop that `/akili-execute` runs (Leader → Implementer → Reviewer) and the Leader → Tester(s) harness that `/akili-test` runs. The constitution seeds it from the packaged defaults shipped by the installer:

- Claude Code: `~/.claude/akili/templates/{leader,implementer,reviewer,tester}.md`
- OpenCode: `~/.config/opencode/akili/templates/{leader,implementer,reviewer,tester}.md`
- Antigravity: `~/.gemini/config/akili/templates/{leader,implementer,reviewer,tester}.md`

If packaged templates are not available, the constitution drafts equivalent personas inline using the structure documented in `/akili-execute` (rework loop, PASS/FAIL output contract, AKILI commit standard, Pivot Protocol).

The `.agents/` directory is tool-agnostic: pure Markdown + YAML frontmatter, resolved relative to the active workspace, and used by Claude Code, OpenCode, and Google Antigravity (`invoke_subagent`).

## Model Routing Scaffolding

Step 8C adds or upgrades a `## Model Routing` section in the project's root `AGENTS.md` and `CLAUDE.md`: a capability-tier registry that maps each AKILI-SPECS phase to a model **per tool** (Claude Code and OpenCode), following the **alias-first rule** (floating aliases like `opus`/`sonnet`/`haiku` wherever they exist, so the registry survives model generations without edits). No `model:` frontmatter is added to commands and the installer is unchanged. The registry enforces **author ≠ auditor** (the Reviewer runs on a different model than the Implementer) and, in Active-AKILI-SPECS mode, is non-destructive: an existing customized registry is preserved, gaps are filled, and stale entries are flagged against the packaged default without touching user pins. See [Model Routing](../model-routing.md) for the tiers and the default registry.

## Model Binding Scaffolding (Tool-Native Agent Wrappers)

Step 8E (with the user's approval) binds the `.agents/` personas to the registry's models via **tool-native agent definitions**: `.claude/agents/akili-{leader,implementer,reviewer,tester}.md` in Claude Code (alias-based `model:` frontmatter) and the equivalent agent config in OpenCode (provider slugs). The wrappers are thin — they reference the `.agents/` persona instead of duplicating it — and make model routing **enforced** for the `/akili-execute` and `/akili-test` fan-out, including a structural author ≠ auditor guarantee (the Reviewer wrapper pins a different model than the Implementer wrapper). Antigravity has no per-agent model binding and stays guidance-only. In Active-AKILI-SPECS mode existing wrappers are never overwritten.

## Skill Map Scaffolding

Step 8D adds or upgrades a `## Skill Map` section in the project's root `AGENTS.md` and `CLAUDE.md`: a table of the **stack-bound skills** that apply to this project's detected or declared stack (see [Skill Governance](../skills/governance.md)). Stack skills are never hardcoded into command text — `/akili-specify` derives each task's required skills from this map, and the `/akili-execute` Leader passes them to the Implementer/Tester via dynamic skill loading. In Active-AKILI-SPECS mode an existing customized map is preserved.

Skills the constitution itself draws on:

- `brainstorming` (Step 0 — project mode and intent)
- `product-manager-toolkit` (Steps 2–3 — interview script and PRD)
- `cognitive-doc-design` (all baseline documents)
- `ui-ux-pro-max`, or `frontend-design` + `stitch-design` (Step 4 — UX/UI design)
- Stack skills matching the repo (Step 5 TRD and the Skill Map): `nestjs-expert`, `api-design-principles`, `error-handling-patterns`, `aws-serverless`, `shadcn-ui`, `tailwind-design-system`, `vercel-react-best-practices`, `angular-developer`

## Next Step

After approving the baseline and confirming `.agents/` is in place, start a change:

```text
/akili-propose <change-name-or-spec-path>
```

For a small, obvious change, you may start with:

```text
/akili-specify <spec-path>
```
