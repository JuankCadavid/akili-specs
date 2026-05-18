# Command Reference

JCSPECS commands are installed as slash-command prompts for Claude Code and OpenCode. The installable source files live in `.claude/commands/`.

## Command Map

| Command | Use When | Main Output |
|---|---|---|
| [`/sdd-constitution`](sdd-constitution.md) | Starting a repo or repairing weak project context | Project baseline docs, `CLAUDE.md`, `AGENTS.md`, general spec templates |
| [`/sdd-propose <change-name-or-spec-path>`](sdd-propose.md) | Aligning on intent before full specification | `proposal.md` under `docs/specs/<spec-path>/` |
| [`/sdd-specify <spec-path>`](sdd-specify.md) | Planning one bounded change before code | `requirements.md`, `design.md`, `tasks.md` |
| [`/sdd-execute <spec-path>`](sdd-execute.md) | Implementing approved tasks | Code/docs changes, updated `tasks.md`, `execution.md` |
| [`/sdd-test <spec-path>`](sdd-test.md) | Proving behavior with test evidence | `test-report.md` |
| [`/sdd-validate <spec-path>`](sdd-validate.md) | Auditing conformance before completion | `validation-report.md` |
| [`/sdd-archive <spec-path>`](sdd-archive.md) | Closing completed work after validation | Archived spec folder with `archive-summary.md` |
| [`/sdd-seo <site-domain>`](sdd-seo.md) | Setting up GSC ownership and SEO audit evidence | `seo-setup-report.md`, `seo-audit-report.md` |

## Normal Sequence

```text
/sdd-constitution
/sdd-propose <change-name-or-spec-path>
/sdd-specify <spec-path>
/sdd-execute <spec-path>
/sdd-test <spec-path>
/sdd-validate <spec-path>
/sdd-archive <spec-path>
```

You can skip `/sdd-propose` for very small, obvious work. You should not skip validation before archiving unless the user explicitly accepts the risk.

## Source Files

| Command | Source |
|---|---|
| `/sdd-constitution` | `.claude/commands/sdd-constitution.md` |
| `/sdd-propose` | `.claude/commands/sdd-propose.md` |
| `/sdd-specify` | `.claude/commands/sdd-specify.md` |
| `/sdd-execute` | `.claude/commands/sdd-execute.md` |
| `/sdd-test` | `.claude/commands/sdd-test.md` |
| `/sdd-validate` | `.claude/commands/sdd-validate.md` |
| `/sdd-archive` | `.claude/commands/sdd-archive.md` |
| `/sdd-seo` | `.claude/commands/sdd-seo.md` |
