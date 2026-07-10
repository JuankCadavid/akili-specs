# `/sdd-constitution`

Establish or strengthen the project-wide JCSPECS foundation and scaffold the multi-agent harness.

## Usage

```text
/sdd-constitution
```

## Use When

- Starting a new repository.
- Existing project docs are missing, stale, or inconsistent.
- A major product pivot changed the project's baseline assumptions.
- Agents need stable `CLAUDE.md` and `AGENTS.md` guidance.
- The project does not yet have a `.agents/` directory powering `/sdd-execute`.

## Behavior

The command classifies the repository into one of three modes and adjusts its behavior accordingly.

| Mode | Meaning | Constitution Behavior | `.agents/` Behavior |
|---|---|---|---|
| Brand-new (Seed Setup) | No code, no SDD docs | Draft baseline from user intent, chosen stack, assumptions, open questions | Copy default Leader / Implementer / Reviewer personas verbatim |
| Legacy (Discovery Setup) | Real code exists, no SDD baseline | Inspect repository reality (CodeGraph preferred) before drafting; synthesize from evidence | Copy defaults then customize with detected stack, design tokens, lint and test commands |
| Active SDD (Safe Update) | SDD baseline already present, custom `.agents/` may exist | Upgrade weak sections, fill missing files non-destructively | Never overwrite existing personas — only append minimal upgrade blocks |

For Legacy and Active-SDD modes, if `.codegraph/` exists CodeGraph is used for semantic exploration; if it is missing and the CLI is available, the agent asks before initializing it.

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

Projects created before the TRD naming may still have `docs/system-design/design.md` (UX/UI blueprint) and `docs/detailed-design/detailed-design.md` (technical blueprint). The constitution treats those as the existing UX/UI Design document and TRD, and in Active-SDD mode offers to migrate them to `docs/ux-ui/design.md` and `docs/trd/trd.md`.

The root guides also carry a `## Module Guides` index: modules whose conventions diverge from the root get a thin child `CLAUDE.md`/`AGENTS.md`, and every child guide must be referenced from that index. `/sdd-execute` records new-module impact notes and `/sdd-archive` syncs the guides and recommends a CodeGraph re-index.

## Multi-Agent Harness Scaffolding

`.agents/` is the source of truth for the multi-agent loop that `/sdd-execute` runs (Leader → Implementer → Reviewer). The constitution seeds it from the packaged defaults shipped by the installer:

- Claude Code: `~/.claude/sdd-jc/templates/{leader,implementer,reviewer}.md`
- OpenCode: `~/.config/opencode/sdd-jc/templates/{leader,implementer,reviewer}.md`
- Antigravity: `~/.gemini/config/sdd-jc/templates/{leader,implementer,reviewer}.md`

If packaged templates are not available, the constitution drafts equivalent personas inline using the structure documented in `/sdd-execute` (rework loop, PASS/FAIL output contract, JCSPECS commit standard, Pivot Protocol).

The `.agents/` directory is tool-agnostic: pure Markdown + YAML frontmatter, resolved relative to the active workspace, and used by Claude Code, OpenCode, and Google Antigravity (`invoke_subagent`).

## Model Routing Scaffolding

Step 7C adds or upgrades a `## Model Routing` section in the project's root `AGENTS.md` and `CLAUDE.md`: a capability-tier registry that maps each SDD phase to a model **per tool** (Claude Code and OpenCode). It is guidance only — no `model:` frontmatter is added and the installer is unchanged. The registry enforces **author ≠ auditor** (the Reviewer runs on a different model than the Implementer) and, in Active-SDD mode, is non-destructive: an existing customized registry is preserved and only gaps are filled. See [Model Routing](../model-routing.md) for the tiers and the default registry.

- `product-manager-toolkit`
- `ui-ux-pro-max`
- `frontend-design`
- `stitch-design`
- `nestjs-expert`
- `api-design-principles`
- `error-handling-patterns`
- `aws-serverless`
- `shadcn-ui`
- `tailwind-design-system`
- `vercel-react-best-practices`

## Next Step

After approving the baseline and confirming `.agents/` is in place, start a change:

```text
/sdd-propose <change-name-or-spec-path>
```

For a small, obvious change, you may start with:

```text
/sdd-specify <spec-path>
```
