# Contributing to AKILI-SPECS

Thank you for your interest in improving AKILI-SPECS. This project packages a spec-driven methodology (commands, skills, templates, and an installer) that people install into their AI coding tools — so contributions are reviewed with extra care: a change here runs inside other people's development environments.

## Ground Rules

- **All changes go through a pull request.** `master` and `dev` are protected: PR-only, the six `CLI on <os> / Node <18|22>` checks green and the branch up to date, enforced for admins too. Branch from `dev` and open your PR into `dev` (from a fork, or from a branch for collaborators).
- **One focused change per PR.** Small, reviewable PRs are merged faster than large mixed ones.
- **Every user-facing change updates `CHANGELOG.md`** under the `## [Unreleased]` section. This includes methodology changes (commands, skills, templates), installer behavior, and documentation that users rely on.
- **Releases are maintainer-only.** Do not bump `version` in `package.json` or add release sections to the changelog — the maintainer runs the release process (`npm run release:*`) after merging.

## Why Everything Lives Under `.claude/`

Despite the name, `.claude/` is **not Claude-only configuration** — it is the canonical source for all six install targets (Claude Code, OpenCode, Google Antigravity, OpenAI Codex CLI, Cursor, and Grok Bot). The installer (`bin/akili.js`) maps its `commands/`, `skills/`, and `templates/` into each tool's own config layout. It must live at that literal path because this repository dogfoods its own methodology: Claude Code sessions working on this repo load the `/akili-*` commands and skills directly from it. So when your change should reach OpenCode, Antigravity, Codex, Cursor, or Grok Bot users, you still edit `.claude/` — there is no per-tool copy to keep in sync. See `.claude/README.md` for the full mapping.

## Repository Structure

> **Note for contributors:** `.claude/` is the canonical source for **all six install targets** (Claude Code, OpenCode, Antigravity, Codex, Cursor, Grok Bot) — not Claude-only config. The installer maps it into each tool's layout; it lives at that path because this repo dogfoods its own methodology in Claude Code sessions. See `.claude/README.md`.

- `.claude/commands/` — custom AKILI-SPECS command prompts
- `.claude/skills/` — required and preferred skills used by the methodology
- `.claude/templates/` — default Leader, Implementer, Reviewer, and Tester personas used by the multi-agent harness (deployed into project `.agents/`)
- `docs/` — human-facing documentation for the flow, CLI, commands, skills, and release process
- `scripts/` — helper scripts referenced by commands (e.g. `gsc_verify.py`)
- `.mcp.json.example` — reference MCP server configuration (e.g. `gsc`)
- `dotfiles/` — environment snapshots for Neovim and tmux (see [dotfiles/README.md](dotfiles/README.md))

This repository stores the current methodology baseline so it can be reused or versioned independently.

## What Contributions Look Like

| Area | Examples | Notes |
|---|---|---|
| Commands (`.claude/commands/`) | Clarify steps, fix flow gaps, improve error handling | These are prompts executed by AI agents — see the security section below |
| Own skills (`.claude/skills/kaizen/`, …) | Improve methodology skills authored by this project | Keep the `license` / `metadata.author` frontmatter intact |
| Third-party skills (`.claude/skills/*`) | Version bumps synced from upstream | Do **not** change their original `license` or `metadata.author`; substantive changes belong upstream |
| Installer (`bin/akili.js`) | Bug fixes, new install targets | Must preserve skip-by-default behavior unless the user passes `--force` |
| Docs (`docs/`, `README.md`) | Corrections, guides, examples | Keep docs in sync with the commands they describe |

## Security Rules for Methodology Content

The files under `.claude/` are **instructions that AI agents execute** in users' projects. A malicious or careless edit can direct an agent to leak data or damage a codebase. Because of that:

- Never add instructions that read, transmit, or log environment variables, credentials, tokens, or files outside the user's project scope.
- Never add instructions that fetch and execute remote content, or that weaken a command's confirmation/HITL (human-in-the-loop) steps.
- Never add hidden or obfuscated instructions (HTML comments, encoded text, zero-width characters) to any prompt file.
- PRs touching `.claude/` receive a line-by-line review under this lens before merge. Unexplained instruction changes are rejected.

Also, never include real secrets anywhere in the repository — no npm tokens, API keys, `.npmrc`, `.env`, or MCP server credentials (use `.mcp.json.example` patterns instead).

## Development Workflow

1. Fork and clone the repository, then create a `feat/<name>` or `fix/<name>` branch from `dev`.
2. Make your edits and verify them:

   ```bash
   npm run verify:cli      # installer smoke test
   npm run pack:dry-run    # confirm the npm package contents are sane
   node bin/akili.js doctor --tool claude   # if you changed installable files
   ```

3. Update `CHANGELOG.md` under `## [Unreleased]`.
4. Open a PR into `dev` describing **what** changed and **why**. For command/skill changes, explain the methodology reasoning, not just the edit.

## Branches and Releases

Changes flow `feat/<name>` / `fix/<name>` → `dev` → `master`. Nothing is committed or pushed to `dev` or `master` directly.

| Step | What happens |
|---|---|
| Work | Branch from `dev`, open a PR into `dev` |
| Preview | A maintainer can publish `X.Y.Z-next.N` from `dev` with `npm run release:next` |
| Stable prep | `release/vX.Y.Z` from `dev` runs `npm run release:*`; its release commit lands via PR into `dev`, then a PR `dev` → `master` merges with a merge commit |
| Stable ship | On an up-to-date `master`: tag and push the tag, `npm publish`, verify `npm view akili-specs dist-tags`, then the GitHub Release |
| Resync | `sync/master-into-dev` merges `origin/master` into `dev` through a PR, with a merge commit |

Use semantic versioning:

| Bump | Use For | Example |
|---|---|---|
| Patch | Documentation fixes, small command clarifications, installer fixes | `0.2.0` to `0.2.1` |
| Minor | New commands, new install targets, meaningful workflow additions | `0.2.0` to `0.3.0` |
| Major | Breaking command behavior or package install changes | `0.2.0` to `1.0.0` |

Commit repository changes separately from release version changes.

Try the prerelease channel with `npm i akili-specs@next`. To leave it, run `npm i akili-specs@latest` (or `akili update`, which installs `@latest`); the update banner compares against `latest` only.

Maintainers: see [docs/release-checklist.md](docs/release-checklist.md).

## Authorship and Licensing

- The AKILI-SPECS methodology is authored by **Juan Carlos Cadavid** — [jcadavid.com](https://jcadavid.com) and released under the [MIT License](LICENSE). By contributing, you agree your contribution is licensed under the same terms.
- Keep the `## Authorship` footers and frontmatter `license` / `metadata.author` fields intact in commands and templates.
- Bundled third-party skills keep their original authors and licenses — do not re-attribute them.

## Questions

Open a GitHub issue for bugs and feature discussions. For security vulnerabilities, **do not open a public issue** — follow [SECURITY.md](SECURITY.md).
