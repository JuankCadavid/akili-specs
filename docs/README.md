# AKILI Documentation

AKILI is the documented form of the AKILI-SPECS methodology: a constitution-first, self-improving spec-driven workflow for Claude Code, OpenCode, Google Antigravity, OpenAI Codex CLI, Cursor, and Grok Bot.

Use this documentation when you want the human-facing reference. The installable source prompts and skills remain under `.claude/commands/` and `.claude/skills/`.

## Start Here

- [Overview](overview.md) - the full capability map: commands, skills by purpose, mechanisms, install targets, optional tools, glossary
- [Flow](flow.md) - end-to-end methodology lifecycle from constitution to archive
- [Model Routing](model-routing.md) - capability-tier model selection per AKILI-SPECS phase for Claude Code, OpenCode, Antigravity, Codex, and Cursor
- [CLI](cli.md) - `akili` terminal reference for install, update, list, and doctor
- [Commands](commands/README.md) - slash command reference
- [Skills](skills/README.md) - packaged skill inventory and usage guidance
- [OpenSpec comparison](openspec-comparison.md) - what AKILI borrows from OpenSpec and where it differs
- [Skill governance](skills/governance.md) - acceptance checklist for packaged skills
- [Release checklist](release-checklist.md) - controlled npm release process
- [Slack notifications](slack-notifications.md) - webhook setup, rotation, and troubleshooting for release announcements
- [MCP](mcp.md) - use AKILI from an MCP client with nothing installed (not live yet)
- [Infrastructure](infrastructure.md) - AWS account rules, MCP server resources, and the kill switch, reset and rollback runbooks

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

Every `/akili-archive` closes with the **Kaizen Loop** — a bounded retrospective (Measure → Learn → Standardize → Record, via the packaged `kaizen` skill) that writes one entry file per spec under `docs/specs/kaizen/`. Its pending standardizations are applied later on the apply-capable branch (the pinned integration branch when one exists, otherwise the default branch — never both) through the skill's Apply Mode, which refreshes the `## Active Lessons` digest so the next spec starts smarter. See [flow.md](flow.md#8-the-kaizen-loop).

Anytime commands run outside the spec loop:

| Command | Use it to | Reference |
|---|---|---|
| `/akili-resume` | See a dashboard of all active specs when you start a session | [akili-resume](commands/akili-resume.md) |
| `/akili-audit` | Detect drift between specs and codebase reality | [akili-audit](commands/akili-audit.md) |
| `/akili-seo <site-domain>` | Set up Google Search Console and run SEO audit reports | [akili-seo](commands/akili-seo.md) |
| `/akili-quick <change-name>` | Make a trivial, low-risk change with minimal traceability; it auto-escalates when the change is not trivial | [akili-quick](commands/akili-quick.md) |
| `/akili-security` | Run a gated repository security audit; confirmed findings go to the Bug Track via `/akili-propose`. Not supported on native Windows | [akili-security](commands/akili-security.md) |
| `/akili-marketing <mode>` | Draft LinkedIn, Instagram and Facebook posts as Markdown under `docs/marketing/`; it never publishes | [akili-marketing](commands/akili-marketing.md) |
| `/akili-review [<pr>]` | Review a pull request, commit range or staged changes against its specs; it reviews only and never edits, approves or blocks; [CI templates](ci/README.md) | [akili-review](commands/akili-review.md) |

Video deliverables: see [video-production](skills/video-production.md) and [flow.md](flow.md#10-video-deliverables).

Diagrams: see [diagram-design](skills/diagram-design.md) and [flow.md](flow.md#11-diagram-slots).

## Documentation Map

| Topic | File | Use When |
|---|---|---|
| Overview | [overview.md](overview.md) | You want the full capability map: every command, skill, mechanism, install target and glossary term |
| Flow | [flow.md](flow.md) | You need the lifecycle, artifacts, review gates, and project modes |
| Model Routing | [model-routing.md](model-routing.md) | You need to choose which model runs each AKILI-SPECS phase across Claude Code, OpenCode, Antigravity, Codex, and Cursor |
| CLI | [cli.md](cli.md) | You need install/update/list/doctor options or install paths |
| Commands | [commands/README.md](commands/README.md) | You need command purpose, inputs, outputs, and sequencing |
| Skills | [skills/README.md](skills/README.md) | You need to know which packaged skill supports which work |
| OpenSpec comparison | [openspec-comparison.md](openspec-comparison.md) | You want to understand the relationship to OpenSpec patterns |
| Skill governance | [skills/governance.md](skills/governance.md) | You are adding or re-binding a packaged skill |

## Source Of Truth

- Command implementation prompts: `.claude/commands/*.md`
- Skill implementation prompts: `.claude/skills/*/SKILL.md`
- Multi-agent harness templates: `.claude/templates/{leader,implementer,reviewer,tester}.md` (deployed into each project's `.agents/` by `/akili-constitution`)
- CLI implementation: `bin/akili.js`
- Release automation: `scripts/release.js` and `scripts/release-status.js`
