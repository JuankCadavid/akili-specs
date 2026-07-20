# Contributing to AKILI-SPECS

Thank you for your interest in improving AKILI-SPECS. This project packages a spec-driven methodology (commands, skills, templates, and an installer) that people install into their AI coding tools — so contributions are reviewed with extra care: a change here runs inside other people's development environments.

## Ground Rules

- **All changes go through a pull request.** Direct pushes to `master` are not accepted. Open a PR from a fork (or a branch, for collaborators) and wait for maintainer review.
- **One focused change per PR.** Small, reviewable PRs are merged faster than large mixed ones.
- **Every user-facing change updates `CHANGELOG.md`** under the `## [Unreleased]` section. This includes methodology changes (commands, skills, templates), installer behavior, and documentation that users rely on.
- **Releases are maintainer-only.** Do not bump `version` in `package.json` or add release sections to the changelog — the maintainer runs the release process (`npm run release:*`) after merging.

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

1. Fork and clone the repository, then create a branch for your change.
2. Make your edits and verify them:

   ```bash
   npm run verify:cli      # installer smoke test
   npm run pack:dry-run    # confirm the npm package contents are sane
   node bin/akili.js doctor --tool claude   # if you changed installable files
   ```

3. Update `CHANGELOG.md` under `## [Unreleased]`.
4. Open a PR describing **what** changed and **why**. For command/skill changes, explain the methodology reasoning, not just the edit.

## Authorship and Licensing

- The AKILI-SPECS methodology is authored by **Juan Carlos Cadavid** — [jcadavid.com](https://jcadavid.com) and released under the [MIT License](LICENSE). By contributing, you agree your contribution is licensed under the same terms.
- Keep the `## Authorship` footers and frontmatter `license` / `metadata.author` fields intact in commands and templates.
- Bundled third-party skills keep their original authors and licenses — do not re-attribute them.

## Questions

Open a GitHub issue for bugs and feature discussions. For security vulnerabilities, **do not open a public issue** — follow [SECURITY.md](SECURITY.md).
