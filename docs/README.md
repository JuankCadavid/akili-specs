# JCSPECS Documentation

JCSPECS is the documented form of the SDD JC methodology: a constitution-first, spec-driven workflow for Claude Code and OpenCode.

Use this documentation when you want the human-facing reference. The installable source prompts and skills remain under `.claude/commands/` and `.claude/skills/`.

## Start Here

- [Flow](flow.md) - end-to-end methodology lifecycle from constitution to archive
- [CLI](cli.md) - `sdd-jc` terminal reference for install, update, list, and doctor
- [Commands](commands/README.md) - slash command reference
- [Skills](skills/README.md) - packaged skill inventory and usage guidance
- [OpenSpec comparison](openspec-comparison.md) - what JCSPECS borrows from OpenSpec and where it differs
- [Release checklist](release-checklist.md) - controlled npm release process

## Quick Flow

```text
/sdd-constitution
/sdd-propose <change-name-or-spec-path>
/sdd-specify <spec-path>
/sdd-execute <spec-path>
/sdd-test <spec-path>
/sdd-validate <spec-path>
/sdd-archive <spec-path>
```

Use `/sdd-seo <site-domain>` independently when you need Google Search Console setup and SEO audit reports.

## Documentation Map

| Topic | File | Use When |
|---|---|---|
| Flow | [flow.md](flow.md) | You need the lifecycle, artifacts, review gates, and project modes |
| CLI | [cli.md](cli.md) | You need install/update/list/doctor options or install paths |
| Commands | [commands/README.md](commands/README.md) | You need command purpose, inputs, outputs, and sequencing |
| Skills | [skills/README.md](skills/README.md) | You need to know which packaged skill supports which work |
| OpenSpec comparison | [openspec-comparison.md](openspec-comparison.md) | You want to understand the relationship to OpenSpec patterns |

## Source Of Truth

- Command implementation prompts: `.claude/commands/*.md`
- Skill implementation prompts: `.claude/skills/*/SKILL.md`
- CLI implementation: `bin/sdd-jc.js`
- Release automation: `scripts/release.js` and `scripts/release-status.js`
