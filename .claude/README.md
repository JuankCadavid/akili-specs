# `.claude/` is the canonical source for ALL install targets — not Claude-only config

If you landed here to contribute: **this directory is the methodology's single source of truth**, consumed by three tools, not one. The `bin/akili.js` installer maps it into each target's own config layout:

| Target | Installed to | From |
|---|---|---|
| Claude Code | `~/.claude/` | `commands/`, `skills/`, `templates/` |
| OpenCode | `~/.config/opencode/` | same sources, mapped to OpenCode's command/skill layout |
| Google Antigravity | `~/.gemini/` | same sources, commands wrapped as workflows/skills |

## Why it lives under `.claude/` and not `src/` or `methodology/`

This repository **dogfoods its own methodology**: Claude Code sessions working on this repo discover the `/akili-*` commands and the packaged skills directly from this directory — that only works at the literal path `.claude/`. Renaming it would leave the repo unable to run the very methodology it packages. The other two targets never see this path; they receive installed copies.

## What's inside

- `commands/` — the 11 `/akili-*` command prompts (installable; tool-agnostic wording)
- `skills/` — methodology and curated third-party skills (see `docs/skills/governance.md` for authorship/binding rules)
- `templates/` — the Leader / Implementer / Reviewer / Tester personas that `/akili-constitution` deploys into each project's `.agents/`

Only those three subdirectories are listed in `package.json` → `files` (npm additionally ships README files wherever they live, including this one — 1.7kB that also explains the layout to anyone inspecting the tarball).

Before editing anything here, read `CONTRIBUTING.md` — files in this directory are **instructions AI agents execute in other people's projects**, and PRs touching them get line-by-line security review.
