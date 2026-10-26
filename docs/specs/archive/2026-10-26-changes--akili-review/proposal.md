# Proposal: `/akili-review` — spec-aware pull-request review, local and CI

> **Answer first.** Add `/akili-review` as a seventh anytime command, plus a new `core` skill, `pr-review`, that holds the method. It reviews a diff (a PR, a range or the current branch) for spec conformance, correctness, tests, maintainability and a light security pass. It runs locally or non-interactively in GitHub Actions. It is advisory by default and never edits, commits, approves or blocks unless `--fail-on` is set. Spec traceability is what sets it apart from generic review tools. Release: minor, **2.37.0**.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-review` |
| Proposal Path | `docs/specs/changes/akili-review/proposal.md` |
| Type | Change |
| Deliverable | software |
| Approval Mode | `gated` (default). The brief says: "stop at the proposal gate for approval". |
| Status | **Approved** 2026-10-25 (Q1–Q6 defaults accepted; no new persona: the Reviewer runs parallel lenses). §7's install line was corrected during specify (see the note in §7) |
| Date | 2026-10-25 |
| Author | Agent (`/akili-propose`), for Juan Carlos Cadavid |
| Requirement source | Brief, plus `/Users/jcadavid/akili-review-analysis.md` (pre-proposal analysis, 2026-10-25, read at `dev` @ `2358c1f`, v2.36.1). No Jira ticket was named. |
| Visual source | None: this is a CLI and Markdown change with no UI. |
| Depends on | none |
| Parallel-safe | yes. It touches no module that another active spec changes. `changes/review-intensity-trial-terms` edits Reviewer-intensity rules in `/akili-execute`, which is a different surface. |
| Release target | minor 2.37.0 (new command, per the semver rule: minor for new commands). |
| Branch at proposal time | `JuankCadavid/akili-review` @ `708020e` (same SHA as `origin/dev`). |
| Settled decisions (owner) | D1 CI runtime: `anthropics/claude-code-action` primary, `openai/codex-action` variant. D2 CI posts one updatable summary comment plus at most 10 inline comments (critical and warning only). D3 advisory by default; `--fail-on critical` can be turned on after a pilot. D4 build our own `pr-review` skill, adapt Apache-2.0/MIT sources with attribution only, never vendor Anthropic's proprietary `code-review` plugin; `docs/specs/reviews/` history is opt-in and off by default. |
| Constraints (owner) | Docs in English. No push, PR, merge, tag or publish. |

## 2. Intent

The bottleneck on multi-engineer AKILI projects is now **human review of large PRs**. AKILI already reviews each task inside `/akili-execute` (the Reviewer persona), but nothing reviews the PR a human opens against `dev`. The intent is one command that does that review, ties each change to the spec that approved it, and runs the same way on a laptop and in CI.

## 3. Problem / Current Behavior

| Today | Evidence |
|---|---|
| Six anytime commands exist, and none of them reviews a PR | `docs/flow.md:21` lists `/akili-resume`, `/akili-audit`, `/akili-quick`, `/akili-seo`, `/akili-security`, `/akili-marketing` |
| `/akili-security` audits the whole repository. Its plan gate always stops and it has no pre-approved mode, so it cannot run unattended in CI | `.claude/commands/akili-security.md:25` ("no Approval Mode and no pre-approved mode: the plan gate (Step 1) stops on every run"), `:46` ("Step 1: Plan Gate (always stops)") |
| The Reviewer persona already holds a per-task audit checklist and the 4R lenses, but only `/akili-execute` uses it, on a task diff | `.claude/templates/reviewer.md` (119 lines) |
| No installed command or skill checks a PR against `docs/specs/<path>/requirements.md`, `design.md` or `tasks.md`, or against `[SPEC:…]` commit prefixes | `ls .claude/commands .claude/skills` at `708020e`: 13 commands, 28 skills, none review-related |
| Generic market tools (CodeRabbit, Copilot, Bugbot, Greptile, PR-Agent) find bugs, but none knows about AKILI specs | Analysis §4 (external; UNVERIFIED — confirm at source before relying on it) |

## 4. Proposed Outcome

- A developer runs `/akili-review` (current branch against the integration branch), `/akili-review <pr>` or `/akili-review <base>..<head>`, and gets a `REVIEW.md` with the verdict first, a spec-coverage table, and findings ranked by severity.
- In CI, a workflow copied from a shipped template runs `/akili-review <pr> --ci` on every PR push. It posts or updates **one summary comment** and **at most 10 inline comments** (critical and warning only, confidence ≥ 80). The check never fails unless `--fail-on` is set.
- Each finding carries severity, confidence, lens, file and line range, quoted evidence and why. A Node validator checks it against a JSON schema before anything is posted.
- A diff that touches security-sensitive paths gets a recommendation to run `/akili-security <paths>`. The review itself never runs a full security audit.

## 5. Scope

| # | In scope |
|---|---|
| S1 | `.claude/commands/akili-review.md`: an anytime command with the house shape (frontmatter, Usage, Step 0 model checkpoint, Steps, Error Handling, Verification Checklist with FR ids, Authorship), under a line cap like the one `akili-security` has. |
| S2 | `.claude/skills/pr-review/`: `SKILL.md` (binding `core` → `/akili-review`, author, license, `## AKILI-SPECS Integration`), lens references with "what to flag" and "what not to flag" lists, large-PR chunking, CI rules, `review-schema.json`, `validate-review.cjs` (plain Node, no `O_NOFOLLOW` dependency, so it also works on native Windows), plus `NOTICE`/license text for the adapted parts. |
| S3 | The pipeline: preflight (skip draft, closed, bot and already-reviewed-at-SHA PRs) → diff noise filter (lockfiles, vendored, minified, generated; keep migrations) → risk tier `trivial | lite | full` → chunking → lenses (**spec conformance**, correctness, tests, maintainability, security light pass, optional docs/AGENTS.md materiality) → verify, score (threshold 80), dedup → validate → report and post → incremental re-review → optional local routing of a confirmed critical to `/akili-propose bugfix/review-<pr>-<n>`. |
| S4 | Spec-conformance lens: map the PR to specs through `[SPEC:<path>]` commit prefixes, `--spec`, the branch name, or changed files under `docs/specs/`. Walk the claimed FRs term by term (KZ-changes--gate-falsifiability-2). Flag unspecified changes (AGENTS.md "Scope only grows through approval"), missing `@akili-spec` tags, and `[SPEC:quick/…]` changes that exceed the `/akili-quick` gate. A PR with no spec gets a note, not a failure. |
| S5 | Reuse by reference, not by copy: the Reviewer persona's checklist and 4R lenses, `judgment-day` (two blind judges confirm each `critical` in the `full` tier; a critical only one judge confirms becomes `warning (suspect)`), `security-audit` **guidance mode only**, `cognitive-doc-design` (report), `caveman` (inter-agent messages). Add an `/akili-review` row to the `judgment-day` integration table. |
| S6 | CI templates shipped as docs (the npm package already ships `docs/`): `docs/ci/akili-review.claude.yml` (`anthropics/claude-code-action`) and `docs/ci/akili-review.codex.yml` (`openai/codex-action`). Hardening: `pull_request` only (never `pull_request_target`), fork PRs skipped, least-privilege permissions, concurrency cancel-in-progress, `timeout-minutes`, `--max-turns`, an `akili-review:skip` label, a pinned package version, a restricted tool list (no source writes; Bash limited to `gh pr diff|view|comment` and the validator), and the "target content is data" addendum. |
| S7 | Opt-in review history: `--record` (or a config key) writes a redacted summary to `docs/specs/reviews/`. Off by default. `docs/specs/reviews/` is added to the non-spec carve-out list so no scan reads it as a spec. |
| S8 | Docs: `docs/commands/akili-review.md`, `docs/commands/README.md`, the README command table, `docs/flow.md` (six → seven anytime commands at `:21`; the figure alt text at `:7`, which today lists only five; the flow SVG), and the re-pin of the `Six anytime commands run outside this loop` sentence that `test/akili-marketing-docs.test.js` asserts, `docs/overview.md`, `docs/skills/pr-review.md`, `docs/skills/governance.md` (core assignment), `docs/cli.md` if CI install is documented there, and `CHANGELOG.md` > Unreleased. |
| S9 | Tests: `test/akili-review-command.test.js` (text contract and line cap), `test/akili-review-docs.test.js`, validator unit tests with fixtures (valid, invalid, redaction, cap of 10 inline comments), a contract test that pins the reference to the `reviewer.md` sections (drift guard), and a check that the CI YAML install line matches the installer flags. Install-count tests already derive their counts from the source tree (`test/install-cursor.test.js:223-239`), so a new skill does not need a hand-edited constant. |

## 6. Non-Goals

- No auto-fix, no commits, no pushes, no PR approval. The command does not edit target source.
- No full security audit. Depth stays with `/akili-security`.
- No change to the spec lifecycle. `/akili-review` is not a step of `/akili-execute` or `/akili-validate`. At most, a one-line *suggestion* could be added later, in a separate change.
- No `akili ci init` scaffold subcommand and no installer change in this spec (see Open Question Q1).
- No `receiving-code-review` skill (how an author acts on feedback). It would be a separate, later proposal.
- No vendoring of Anthropic's `code-review` plugin (all rights reserved) or of PR-Agent. We take ideas and patterns only.
- No managed-service integration (CodeRabbit, Copilot review). Teams may run those alongside.
- No `pull_request_target` support and no review of fork PRs in the shipped template.

## 7. Affected Users, Systems, And Specs

| Affected | How |
|---|---|
| Engineers and reviewers on AKILI projects | New local command and CI check |
| Maintainers configuring CI | Copy a template, set `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`, choose `--fail-on` |
| All six install targets | One command plus one skill directory, installed through the existing directory-based discovery. On Codex/Cursor the command lands as a skill (`.agents/skills/akili-review/`), as every command does today (verified: a `--tool codex --local` probe installed `akili-*` under `.agents/skills/`) |
| `bin/akili.js` | No change expected (see the verification below) |
| `.claude/templates/reviewer.md` | Referenced, not edited. A drift-guard test pins the referenced sections |
| `.claude/skills/judgment-day/SKILL.md` | One added integration row |
| Related specs | Archived `2026-10-18-changes--akili-security`, `2026-10-19-changes--akili-security-followup` (the pattern for the command shape, data addendum, validator and routing); `2026-10-24-changes--akili-marketing` (the pattern for an anytime command and its docs tests) |

### Verified: install flags for the CI YAML

The analysis sketch used `install --tool claude --local --skills-only`, with the note "plus the command; flags to be confirmed". Checked against `bin/akili.js` at `708020e`:

| Flag | Source | Result |
|---|---|---|
| `--tool claude\|codex` | `bin/akili.js:240`, validated at `:386` | Valid |
| `--local` / `-l` | `bin/akili.js:262`; local bases at `:395-401` (`./.claude`, `./.codex` plus `./.agents/skills`) | Valid. Writes into the checkout, where `claude-code-action` and Codex discover skills |
| `--skills-only` | `bin/akili.js:260` ("Install or check only skills") | **Wrong for CI.** It leaves out `commands/`, so `/akili-review` would be missing on Claude Code. Drop it |
| `--force` | `bin/akili.js:257` | **Needed in CI.** Without it, install skips existing files, so a PR that edits `.claude/commands/akili-review.md` or `.claude/skills/pr-review/` in the target repo would run its **own** copy of the review prompt (a prompt-injection path). With `--force`, the pinned package version wins |
| Non-interactive run | Probe: `CI=true node bin/akili.js install --tool claude --local </dev/null` in an empty scratch dir | Exit 0, 49 files installed (13 commands, 28 skills, resources), no prompt |

> **Correction (2026-10-25, during `/akili-specify`).** The `--local` rows above hold for the installer itself, but not for CI. On PR events, `anthropics/claude-code-action` (@ `925afb5`, `src/github/operations/restore-config.ts`) **deletes `.claude/`, `CLAUDE.md`, `.mcp.json` and five other paths from the checkout and restores them from the base ref** before the CLI starts. A `--local` install would therefore be wiped. The superseding install line is global (into the runner's HOME): `npx -y akili-specs@<pin> install --tool claude|codex --force`. See `requirements.md` FR-12 and `design.md` P-3. The lines below are kept as written and are superseded.

Resulting template lines (the exact pin is set at release time):

```yaml
- run: npx -y akili-specs@2.37.0 install --tool claude --local --force
# Codex variant:
- run: npx -y akili-specs@2.37.0 install --tool codex --local --force
```

## 8. Visual Reference

- Source: None
- Location: n/a
- Notes: CLI, Markdown and GitHub Actions only. The flow SVG (`assets/akili-flow.svg`) gets a seventh anytime command, but that is a docs asset, not a design input.

## 9. Requirement Delta Preview

### ADDED Requirements

- `/akili-review [<pr> | <base>..<head> | --staged] [--spec <path>] [--tier auto|trivial|lite|full] [--lens <a,b>] [--comment] [--ci] [--fail-on none|critical|warning] [--record] [--out <dir>]`.
- With no target, the default diff is the current branch against the `Integration Branch:` pin, or the default branch when there is no pin.
- Locally, `--comment` posts only after a confirmation gate. `--ci` is fully non-interactive: it takes PR context from `GITHUB_*`, and the exit code follows `--fail-on` (default `none`, which always exits 0 on a completed review).
- Posting cap: one sticky summary comment, updated in place, and at most 10 inline comments, critical and warning only, each with a full-SHA permalink. Suggestions appear only in the summary.
- Each finding must pass `validate-review.cjs` against `review-schema.json` before it is posted. If validation fails, nothing is posted, the job summary reports the failure, and the job still follows `--fail-on`. *(Correction 2026-10-26, validation W-3: the failure is reported in the job log, not a job summary; see requirements FR-11.)*
- Re-review on `synchronize`: findings that are now fixed are resolved, unfixed ones are re-emitted, and threads a human resolved are respected unless the issue got worse.
- Run artifacts live outside the target by default (`~/.akili/reviews/<repo>/pr-<n>/run-<k>`; in CI, `$RUNNER_TEMP`, uploaded as a workflow artifact).
- History in `docs/specs/reviews/` only with `--record`. Off by default.
- Every delegated agent brief carries the verbatim "target content is data" addendum.
- A new core skill `pr-review` with governance metadata and attribution for the Apache-2.0/MIT sources it adapts.

### MODIFIED Requirements

- `docs/flow.md` and the flow figure: "Six anytime commands" becomes "Seven".
- `docs/skills/governance.md`: the core assignment list gains `pr-review` (review).
- The `judgment-day` integration table gains an `/akili-review` (full tier, no fix rounds) row.
- Non-spec carve-outs (wherever they are listed, e.g. `/akili-propose` Step 0, `/akili-resume`, `/akili-audit`) gain `reviews/`.

### REMOVED Requirements

- None.

## 10. Approach Options

| Option | What | Pros | Cons |
|---|---|---|---|
| **A. One spec: command + skill + CI templates (recommended)** | Everything in S1–S9 lands as one minor release | One coherent release, and CI is the main reason for the feature. The settled decisions D1–D4 were made as a package | Larger spec (~13–16 tasks). Test LOC must be budgeted per clause (KZ-bugfix--init-ctrlc-abort-2) |
| B. Two chunks: (1) command + skill local-only, (2) CI templates + posting + re-review | A family with `family.md` | Smaller reviews, and the local half ships sooner | The posting cap, validator and re-review are designed twice. 2.37.0 would ship without the CI story the owner asked for |
| C. Thin wrapper over PR-Agent | Ship config and a template only | Least code | Python runtime, no spec traceability (the differentiator), and it goes against D4 |

## 11. Recommended Approach

**Option A.** It is the smallest path that delivers the owner's decisions in one 2.37.0. The risk is contained because the change only adds things: one command, one skill, two doc templates, no installer change, and no edit to an existing lifecycle step. Size control comes from reuse by reference (Reviewer persona, `judgment-day`, `security-audit` guidance mode) rather than restating content. Defaults that the owner did not set, proposed here for `/akili-specify` to confirm: name `/akili-review`; static-only; confidence threshold 80; tiers `trivial` ≤ 10 changed lines, `lite` ≤ 100 lines and ≤ 20 files, `full` above that or on any security-sensitive path; optional `.akili/review.yml` for include/exclude and thresholds.

`/akili-specify` should run at **standard** depth with a `judgment-day` design review. The CI trust boundary and the posting contract are the areas where a confident mistake costs the most.

## 12. Risks, Dependencies, And Open Questions

### Risks

| Risk | Mitigation |
|---|---|
| Prompt injection through PR content (title, body, code, comments) | Verbatim data addendum; restricted tool list; `--force` install so the PR cannot replace the review prompt; no secrets on fork PRs; validator before posting; documented residual risk and a recommendation to require approval for external contributors. Residual: medium |
| Noise (false positives) erodes trust | Threshold 80, verification, a two-judge rule for criticals, what-not-to-flag lists, the 10-comment cap, advisory default. Measure in Kaizen: comments resolved vs dismissed |
| Drift between `reviewer.md` and `pr-review` | Reference persona sections by name (KZ-005: never by line number), and a contract test that pins them |
| Aggregate claims in CHANGELOG and docs overstate what shipped (KZ-002, High, 13 recurrences) | The docs task quote-checks each summary clause at HEAD and re-runs counts after `/akili-test` |
| A restated rule (data addendum, posting cap) diverges across the command, skill, docs and template (KZ-changes--kaizen-loop-closure-2) | Make the restatement check an executable contract test with a mutation check, as `akili-security-followup` did |
| External action inputs change (`claude-code-action@v1` `claude_args`/`prompt`; `codex-action` inputs; inline-comment MCP tool name) | Re-verify against the actions' current docs at specify time and record it in the Premise Ledger. The template pins major versions |
| Cost per review in CI | Tiers, `--max-turns`, timeout, concurrency cancel, skip-at-same-SHA, skip label. Analysis estimate $0.20–$1.70 per review (external; UNVERIFIED) |
| An existing test pins the old anytime-count sentence (`test/akili-marketing-docs.test.js`, per archived `changes/docs-overview` requirements:55) | The docs task updates the sentence and that test's pin in the same commit; `npm test` is in its Falsifier |
| Command text size | A line cap enforced by a test, like `akili-security`. The method lives in the skill and its references |

### Dependencies

- `gh` CLI for PR numbers and posting. A local branch or range review does not need it.
- GitHub Actions secrets `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` (user-owned).
- No other spec.

### Open Questions (for `/akili-specify`, each with a recommended default)

| # | Question | Recommended default |
|---|---|---|
| Q1 | CI template delivery: doc files only, or an `akili ci init review` scaffold? | Docs only (`docs/ci/*.yml`). A scaffold changes the installer and can come in a later minor |
| Q2 | How does `codex-action` invoke an installed skill, and does it have an inline-comment tool? | UNVERIFIED — confirm at source before relying on it. If it has no inline tool, the Codex variant posts the summary comment only and says so |
| Q3 | Re-review state source: the previous sticky comment (hidden JSON marker) or a workflow artifact? | Hidden marker in the sticky comment. Artifacts expire and fork-safe reads are simpler |
| Q4 | Break-glass: a label or a maintainer comment? | The label `akili-review:advisory` forces advisory and is logged in the summary |
| Q5 | Should `/akili-validate` suggest `/akili-review` before archive? | Not in this spec (it would touch the flow) |
| Q6 | `--record` redaction rules for `docs/specs/reviews/` | Reuse the `/akili-security` redaction stance: no secrets, no quoted credentials, findings by file:line only |

## 13. Success Criteria

- `node bin/akili.js install --tool all --dry-run` lists `akili-review` and `pr-review` for every target; `doctor --tool all` is clean; `npm test`, `verify:cli`, `pack:dry-run` and `git diff --check` pass.
- On this repo, `/akili-review` against a branch with `[SPEC:…]` commits produces a `REVIEW.md` whose spec-coverage table maps each claimed FR. A seeded out-of-scope change is flagged.
- The validator rejects a malformed findings file and an 11th inline comment, and accepts the valid fixtures.
- The CI template, copied into a scratch repo, installs non-interactively with the verified flags and posts one summary plus capped inline comments on a test PR. This is a manual pilot, recorded at `/akili-validate`.
- A completed review with criticals under the default `--fail-on none` exits 0. With `--fail-on critical`, it exits non-zero.
- The docs say "seven anytime commands" everywhere the count appears, the figure included.
  - **Amended 2026-10-25 (owner, at the specify design gate):** the figure (`assets/akili-flow.svg` and its alt text) stays as known debt (design DD-12); every other place the count appears says "seven".

## 14. Next Step

After approval:

```text
/akili-specify changes/akili-review
```

Standard depth, with a `judgment-day` design review.
