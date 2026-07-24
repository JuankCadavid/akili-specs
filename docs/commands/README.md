# Command Reference

AKILI commands are installed as slash-command prompts for Claude Code, OpenCode, and Google Antigravity (as workflows). The installable source files live in `.claude/commands/`.

## Command Map

| Command | Use When | Main Output |
|---|---|---|
| [`/akili-constitution`](akili-constitution.md) | Starting a repo or repairing weak project context | Project baseline docs, `CLAUDE.md`, `AGENTS.md`, general spec templates, and the `.agents/` multi-agent harness |
| [`/akili-propose <change-name-or-spec-path>`](akili-propose.md) | Aligning on intent before full specification | `proposal.md` under `docs/specs/<spec-path>/` |
| [`/akili-quick <change-name>`](akili-quick.md) | Making a genuinely trivial, low-risk change (copy edit, color/text tweak) fast | The edit + a one-line entry in `docs/specs/quick/quick-log.md` and a `[SPEC:quick/<name>]` commit |
| [`/akili-specify <spec-path>`](akili-specify.md) | Planning one bounded change before code | `requirements.md`, `design.md`, `tasks.md` |
| [`/akili-execute <spec-path>`](akili-execute.md) | Implementing approved tasks via the Leader → Implementer → Reviewer harness | Code/docs changes, updated `tasks.md`, `execution.md` with full PASS/FAIL audit trail |
| [`/akili-test <spec-path>`](akili-test.md) | Proving behavior with test evidence via the Leader → Tester(s) harness | `test-report.md` |
| [`/akili-validate <spec-path>`](akili-validate.md) | Auditing conformance before completion | `validation-report.md` |
| [`/akili-archive <spec-path>`](akili-archive.md) | Closing completed work after validation | Archived spec folder with `archive-summary.md` + Kaizen retrospective entry in `docs/specs/kaizen-log.md` |
| [`/akili-audit`](akili-audit.md) | Detecting drift between specs and codebase reality | `docs/specs/drift-report.md` with conformance score and discrepancy matrix |
| [`/akili-resume`](akili-resume.md) | Resuming work after a session break | Multi-spec dashboard with phase, progress, and next command recommendation |
| [`/akili-seo <site-domain>`](akili-seo.md) | Setting up GSC ownership and SEO audit evidence | `seo-setup-report.md`, `seo-audit-report.md` |

## Normal Sequence

```text
/akili-constitution
/akili-propose <change-name-or-spec-path>
/akili-specify <spec-path>
/akili-execute <spec-path>
/akili-test <spec-path>
/akili-validate <spec-path>
/akili-archive <spec-path>
```

You can skip `/akili-propose` for very small, obvious work. For a genuinely trivial, low-risk change (a button color, a title's text, a small paragraph) use `/akili-quick <change-name>`, which makes the edit in one step with minimal traceability and auto-escalates to `/akili-specify` (Lite) or `/akili-propose` if the change turns out to be bigger than trivial. You should not skip validation before archiving unless the user explicitly accepts the risk.

Run `/akili-audit` independently to detect drift between specs and codebase reality at any time.

## Source Files

| Command | Source |
|---|---|
| `/akili-constitution` | `.claude/commands/akili-constitution.md` |
| `/akili-propose` | `.claude/commands/akili-propose.md` |
| `/akili-quick` | `.claude/commands/akili-quick.md` |
| `/akili-specify` | `.claude/commands/akili-specify.md` |
| `/akili-execute` | `.claude/commands/akili-execute.md` |
| `/akili-test` | `.claude/commands/akili-test.md` |
| `/akili-validate` | `.claude/commands/akili-validate.md` |
| `/akili-archive` | `.claude/commands/akili-archive.md` |
| `/akili-audit` | `.claude/commands/akili-audit.md` |
| `/akili-resume` | `.claude/commands/akili-resume.md` |
| `/akili-seo` | `.claude/commands/akili-seo.md` |
