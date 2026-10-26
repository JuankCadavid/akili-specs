# AKILI review in CI

Run `/akili-review` on every pull request and get one summary plus at most 10 inline comments. The review is advisory by default and never approves or requests changes.

| Runtime | Template | Secret |
|---|---|---|
| Claude (`anthropics/claude-code-action`) | [`akili-review.claude.yml`](akili-review.claude.yml) | `ANTHROPIC_API_KEY` |
| Codex (`openai/codex-action`) | [`akili-review.codex.yml`](akili-review.codex.yml) | `OPENAI_API_KEY` |

## Setup

1. Copy one template to `.github/workflows/akili-review.yml` in the target repository. Use one runtime per repository, so the summary stays single.
2. Add the secret from the table under Settings > Secrets and variables > Actions. The templates never use any other secret; the `post` job uses the workflow's own `GITHUB_TOKEN`.
3. Check the `akili-specs@` version in both install lines. It is pinned to an exact release that contains `/akili-review`; raise it deliberately.
4. Optional: add `.akili/review.yml` on the base branch (flat keys, documented in the skill's `large-prs.md`). Only the base copy is read, so a PR cannot change its own review settings.
5. Open a pull request. Labels: `akili-review:skip` skips the run; `akili-review:advisory` forces `--fail-on none` for that run.

Draft and fork pull requests are skipped. For fork PRs the platform withholds secrets anyway.

## What runs

| Job | Token | Does |
|---|---|---|
| `review` | `contents: read`, `pull-requests: read`, no `id-token` | Checks out the PR **base**, installs AKILI into the runner's HOME, writes the diff, metadata and head tree to a directory outside the workspace, runs the agent with read-only tools, uploads `findings.json` and `manifest.json` |
| `post` | `pull-requests: write`, `contents: read` | Checks out nothing, installs the same pinned package, takes repo, PR and SHAs from the event (never the artifact), validates, and posts |

In the Claude template the agent has no Bash, write, network or posting tool. In the Codex template the agent runs in a read-only, no-network sandbox that can still run read-only shell commands (see *Trust boundary and residual risk*). Neither agent has a posting tool. The templates pass the workflow token to the Claude action explicitly; without it the action would exchange OIDC for a write-capable App token.

## Pilot, then enforce

1. Keep `--fail-on none` for a few weeks of real pull requests. Read the summaries; count the findings your maintainers act on.
2. When criticals are reliable, edit the `post` step: replace `--fail-on none` with `--fail-on critical` (`warning` also fails on warnings). Make the `post` job a required check only after that.
3. Break glass: the label `akili-review:advisory` forces `none` for one run. Without independent sub-agents (some Codex runs), criticals become suspect warnings and `critical` cannot fire.

## Trust boundary and residual risk

- **Residual risk.** A pull request is untrusted text. A prompt injection cannot post, fetch or run anything, but it can still skew what the agent reports (a missed or a false finding). Review the summary as advice.
- **Require approval for all external contributors.** If the repository takes outside PRs, enable it under Settings > Actions > General. The templates already skip fork PRs; the setting protects any other workflow you add.
- **Base checkout.** The agent's working directory is the PR base, so `CLAUDE.md`, `AGENTS.md`, `.agents/` and `.claude/` are the trusted base copies. The command and skill come from the pinned package in HOME. Edits to those files in the PR are reviewed as diff content under `head/`.
- **Same author for every Actions comment.** Every workflow posts as `github-actions[bot]`, so another workflow that echoes PR text into a comment could forge the review marker. Keep such workflows out of the repository, or review them.
- **The artifact gates `post`.** A downloaded `skipped.json` or a manifest with `files: []` makes `post` exit 0 and post nothing. That is the same trust class as an agent that returns zero findings; the artifact can suppress a review but cannot write to the PR.
- **Codex.** The read-only sandbox can still run read-only shell commands over the files it can read; there is no network and no write. Keep `safety-strategy: drop-sudo` (or `unprivileged-user`) so `OPENAI_API_KEY` stays out of the sandbox.
- **Who can trigger it.** Both actions refuse an actor without write access to the repository, so a PR from a contributor without write access fails the job rather than running the agent.

## Cost controls

`review` has `timeout-minutes: 20`, `concurrency` with `cancel-in-progress`, and (Claude) `--max-turns 40`. `post` has its own group that never cancels, so a post is not interrupted between its review call and its summary update. For docs-only changes, uncomment `paths-ignore`.

## Known limits

- `gh pr diff` can refuse a very large diff; the job then fails instead of reviewing.
- The `review` job downloads the PR head tarball with the job's read-only token. Whether that works on private repositories is unverified until the pilot; if it fails, the job fails closed. The fallback is to materialize the head through a credentialed `actions/checkout` to a path that is then moved outside the workspace.
- Action pins are commit SHAs with the tag in a comment; update them on purpose and re-read the action's changelog.
