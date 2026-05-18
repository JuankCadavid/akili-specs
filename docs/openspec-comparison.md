# OpenSpec Comparison

OpenSpec is a broader spec-driven development framework with a mature npm CLI, docs site, workflow profiles, and support for many AI tools. JCSPECS is a smaller methodology package focused on Claude Code and OpenCode with packaged commands, skills, and repository-local documentation conventions.

This repository borrows useful documentation and workflow ideas from OpenSpec while keeping JCSPECS intentionally scoped to its own command set.

## What We Borrow From OpenSpec

| OpenSpec Pattern | JCSPECS Equivalent |
|---|---|
| README hero and quick docs index | JCSPECS README hero plus links to `docs/` |
| Artifact-guided workflow | Constitution, proposal, requirements, design, tasks, execution, test, validation, archive |
| Slash-command lifecycle | `/sdd-*` command set |
| CLI reference | `docs/cli.md` |
| Commands reference | `docs/commands/` |
| Workflows documentation | `docs/flow.md` |
| Lightweight comparison section | This document |

## Key Differences

| Area | OpenSpec | JCSPECS |
|---|---|---|
| Scope | General-purpose SDD framework across many tools | Methodology package for Claude Code and OpenCode |
| Initialization | CLI initializes OpenSpec workspace files | `/sdd-constitution` creates or strengthens project baseline docs |
| Baseline | Change/spec artifacts are central | Constitution is central before feature specs |
| Skills | Uses slash commands and agent instructions | Ships Claude/OpenCode skills alongside commands |
| Existing projects | Brownfield-friendly workflow | Explicit existing-project constitution mode with optional CodeGraph analysis |
| Validation | Workflow validation through commands | Dedicated `/sdd-test` and `/sdd-validate` reports before archive |
| SEO | Not a core workflow in OpenSpec | `/sdd-seo` handles Google Search Console setup and audits |
| Package target | `@fission-ai/openspec` | `sdd-jc-methodology` |

## Practical Takeaway

Use OpenSpec if you want a mature, general SDD framework that targets a wide range of tools and workflow profiles.

Use JCSPECS if you want this opinionated Claude/OpenCode workflow:

```text
constitution → proposal → spec → execute → test → validate → archive
```

Use the comparison as design guidance only. The JCSPECS command prompts in `.claude/commands/` are the implementation source of truth for this package.
