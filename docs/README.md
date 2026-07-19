# AKILI Documentation

AKILI is the documented form of the AKILI-SPECS methodology: a constitution-first, spec-driven workflow for Claude Code and OpenCode.

Use this documentation when you want the human-facing reference. The installable source prompts and skills remain under `.claude/commands/` and `.claude/skills/`.

## Start Here

- [Flow](flow.md) - end-to-end methodology lifecycle from constitution to archive
- [Model Routing](model-routing.md) - capability-tier model selection per AKILI-SPECS phase for Claude Code and OpenCode
- [CLI](cli.md) - `akili` terminal reference for install, update, list, and doctor
- [Commands](commands/README.md) - slash command reference
- [Skills](skills/README.md) - packaged skill inventory and usage guidance
- [OpenSpec comparison](openspec-comparison.md) - what AKILI borrows from OpenSpec and where it differs
- [Release checklist](release-checklist.md) - controlled npm release process

## Quick Flow

```text
/akili-constitution
/akili-propose <change-name-or-spec-path>
/akili-specify <spec-path>
/akili-execute <spec-path>
/akili-test <spec-path>
/akili-validate <spec-path>
/akili-archive <spec-path>
```

Use `/akili-resume` at the start of any session to see a dashboard of all active specs and where each one stands.

Use `/akili-audit` independently to detect drift between specs and codebase reality at any time.

Use `/akili-seo <site-domain>` independently when you need Google Search Console setup and SEO audit reports.

## Documentation Map

| Topic | File | Use When |
|---|---|---|
| Flow | [flow.md](flow.md) | You need the lifecycle, artifacts, review gates, and project modes |
| Model Routing | [model-routing.md](model-routing.md) | You need to choose which model runs each AKILI-SPECS phase across Claude Code and OpenCode |
| CLI | [cli.md](cli.md) | You need install/update/list/doctor options or install paths |
| Commands | [commands/README.md](commands/README.md) | You need command purpose, inputs, outputs, and sequencing |
| Skills | [skills/README.md](skills/README.md) | You need to know which packaged skill supports which work |
| OpenSpec comparison | [openspec-comparison.md](openspec-comparison.md) | You want to understand the relationship to OpenSpec patterns |

## Source Of Truth

- Command implementation prompts: `.claude/commands/*.md`
- Skill implementation prompts: `.claude/skills/*/SKILL.md`
- Multi-agent harness templates: `.claude/templates/{leader,implementer,reviewer}.md` (deployed into each project's `.agents/` by `/akili-constitution`)
- CLI implementation: `bin/akili.js`
- Release automation: `scripts/release.js` and `scripts/release-status.js`
