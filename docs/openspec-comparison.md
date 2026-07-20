# OpenSpec Comparison

OpenSpec is a broader spec-driven development framework with a mature npm CLI, docs site, workflow profiles, and support for many AI tools. AKILI is a smaller methodology package focused on Claude Code and OpenCode with packaged commands, skills, and repository-local documentation conventions.

This repository borrows useful documentation and workflow ideas from OpenSpec while keeping AKILI intentionally scoped to its own command set.

## What We Borrow From OpenSpec

| OpenSpec Pattern | AKILI Equivalent |
|---|---|
| README hero and quick docs index | AKILI README hero plus links to `docs/` |
| Artifact-guided workflow | Constitution, proposal, requirements, design, tasks, execution, test, validation, archive |
| Slash-command lifecycle | `/akili-*` command set |
| CLI reference | `docs/cli.md` |
| Commands reference | `docs/commands/` |
| Workflows documentation | `docs/flow.md` |
| Lightweight comparison section | This document |

## Key Differences

| Area | OpenSpec | AKILI |
|---|---|---|
| Scope | General-purpose SDD framework across many tools | Methodology package for Claude Code and OpenCode |
| Initialization | CLI initializes OpenSpec workspace files | `/akili-constitution` creates or strengthens project baseline docs |
| Baseline | Change/spec artifacts are central | Constitution is central before feature specs |
| Skills | Uses slash commands and agent instructions | Ships Claude/OpenCode skills alongside commands |
| Existing projects | Brownfield-friendly workflow | Explicit existing-project constitution mode with optional CodeGraph analysis |
| Validation | Workflow validation through commands | Dedicated `/akili-test` and `/akili-validate` reports before archive |
| SEO | Not a core workflow in OpenSpec | `/akili-seo` handles Google Search Console setup and audits |
| Continuous improvement | Not a core workflow in OpenSpec | The Kaizen Loop: `/akili-archive` runs a bounded retrospective and later commands read the accumulated `## Active Lessons` digest |
| Package target | `@fission-ai/openspec` | `akili-specs` |

## Practical Takeaway

Use OpenSpec if you want a mature, general SDD framework that targets a wide range of tools and workflow profiles.

Use AKILI if you want this opinionated Claude/OpenCode workflow:

```text
constitution → proposal → spec → execute → test → validate → archive
```

Use the comparison as design guidance only. The AKILI command prompts in `.claude/commands/` are the implementation source of truth for this package.
