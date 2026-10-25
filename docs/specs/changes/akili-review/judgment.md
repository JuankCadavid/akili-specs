# Judgment Day: `changes/akili-review` design

| Field | Value |
|---|---|
| Target | `design.md` + `requirements.md` + `proposal.md` at `1b7ae87` (immutable) |
| Mode | `/akili-specify` Step 2.5 **Review Design**, chosen by user mandate 2026-10-25 |
| Judges | A and B, blind, read-only, in parallel, on Sonnet. The design was authored on Opus (author ≠ auditor) |
| Round | 1: judged → corrected (`3d4ed05`) → scoped re-judgment → round-2 correction (`<this commit>`) → final scoped re-judgment |
| Status | Round-1 correction approved by the user (**Fix and Re-judge**, 2026-10-25); figure kept as known debt (owner) |

## Premise Ledger attack: results

| Row | Judge A | Judge B | Merged |
|---|---|---|---|
| P-4 | pin refuted | pin refuted | **Confirmed defect.** `c05cfd74` is codex-action `main` HEAD. Tag `v1.13` → tag object `83eeca4` → commit `bdf19a4` (`gh api repos/openai/codex-action/git/ref/tags/v1.13`, then `git/tags/83eeca4…`, as run by the parent). The inputs and outputs claims stand |
| P-5 | refuted | refuted | **Confirmed defect.** Anthropic's structured-outputs docs reject `minimum`/`maximum`/`minLength`/`maxLength` (both judges). §5.2 uses them |
| P-6 | count partly wrong | refuted | **Confirmed defect.** Two more pins go red at the docs edit: `test/akili-marketing-docs.test.js:114-115` (`(the 13 commands, installed as skills`, `(the 28 packaged skills`) and `test/diagram-design.test.js:417` (`/28 packaged skills/`), verified by the parent with `sed -n`. "9 files" vs the §4 tree's 8 |
| P-7 | confirmed | refuted (`docs/cli.md:247` missed; `test/` not searched) | **Confirmed** by the parent: `sed -n 247p docs/cli.md` → "the 13 c…" |
| P-9 | refuted (6 sites) | refuted (6 sites) | **Confirmed defect.** `docs/commands/akili-audit.md:15` carries the list in different words |
| P-12 | partly settled: no HOME/`CLAUDE_CONFIG_DIR` override at `925afb5` | same; `settingSources` defaults to all | Stays `UNVERIFIED`, with its scope narrowed; owner T12 |
| P-13, P-14, P-15 | still unverified | still unverified | Unchanged |
| P-16 | not re-run | confirmed; §5.4 mis-cites P-16 for thread resolution (should be P-14) | Cite fix |
| others | confirmed / not re-run | confirmed | Stand |

## Findings ledger (frozen)

| ID | Judges | Severity | Defect | Merged status |
|---|---|---|---|---|
| C-1 | A1, B1 | severe | Carve-out sites are 6, not 5 (`docs/commands/akili-audit.md:15`); stated in P-9, §2, DD-10, FR-8, FR-14 | **confirmed** |
| C-2 | A3, B4, B8 | severe | The `post` job, which holds the write token, has no stated source for the scripts (a PR-head checkout would run PR code with write access), and it trusts the artifact's `target.repo/pr/head_sha` | **confirmed** |
| C-3 | A5, B6 | severe | Reconcile (FR-10) is not implementable: the marker holds only fingerprints, with no severity, no thread mapping and no way to tell a bot-resolved thread from a human-resolved one | **confirmed** |
| C-4 | A·P-5, B·P-5 | severe | The schema uses keywords that structured output rejects | **confirmed** |
| C-5 | A·P-4, B·P-4 | severe | The codex-action pin does not reproduce | **confirmed** |
| C-6 | A9 (severe), B12 (warning) | severe/warning | FR-12 items 1, 5, 6, 7, 8 (gating, tool allowlist, cost controls, `--fail-on` line, security header) have no design home; Codex `sandbox` defaults to `workspace-write`; action pin policy | **confirmed, severity contested** |
| C-7 | A6, B6 | warning/severe | One inline comment outside the diff hunks fails the whole review POST with 422; no hunk pre-check, no fallback; no summary size cap (65,536) | **confirmed, severity contested** |
| C-8 | A11, B7 | warning/severe | The local `gh` user and the CI bot are different identities, so a second summary can appear; the same-head skip check runs in the agent with no author check, so a forged marker could suppress a review | **confirmed, severity contested** |
| C-9 | A10, B11 | warning | Validator exits 1 unconditionally, which contradicts FR-11 under `--fail-on none`; the skipped-run artifact path is undefined | confirmed (info) |
| C-10 | A4, B13 | warning | "Four new test files" vs three listed; "9 files" vs 8 | confirmed (info) |
| C-11 | A7, B15 | warning/suggestion | The confidence threshold override lives in the agent-controlled document | confirmed (info) |
| C-12 | A8, B13 | warning | Checkout ref and base fetch are unspecified (`git show origin/<base>` needs a fetch; head vs merge-commit lines) | confirmed (info) |
| S-1 | A2 | severe | With no `github_token` input, `claude-code-action` exchanges OIDC for an App token with `contents: write`, `pull_requests: write` (`src/github/token.ts:69-71` `DEFAULT_PERMISSIONS` at `925afb5`) and needs `id-token: write`. DD-4's "the job token cannot write" is false by default | suspect → **settled true** by the parent's re-run (`token.ts:69-71`, `OVERRIDE_GITHUB_TOKEN` at `:160`) |
| S-2 | B2 | severe | Hidden count consumers (see P-6, P-7) | suspect → **settled true** (parent `sed -n`) |
| S-3 | B3 | severe | The host still auto-loads PR-controlled instructions: Codex reads the checkout's `AGENTS.md`; a base `CLAUDE.md` may `@AGENTS.md`-import the head copy (this repo's own `CLAUDE.md` does) | suspect → **settled true** by reading: `CLAUDE.md` = `@AGENTS.md` here; `AGENTS.md` is absent from `SENSITIVE_PATHS` (P-3) |
| S-4 | B5 | severe | The agent cannot compute a sha256 fingerprint without a shell; `why` prose is unstable; an agent-chosen fingerprint could collide with a human-resolved one and suppress it | suspect, design reasoning, accepted by the architect |
| S-5 | A12 | warning | A fake `gh` on `PATH` needs a Windows shim, or an injectable `GH_BIN` | suspect (info) |
| S-6 | B9 | warning | The allowlist lacks `Task`/`Skill`/a scoped `Write`/`--add-dir`; without `Task`, every critical is downgraded in CI | suspect (info) |
| S-7 | B10 | warning | Render order vs FR-8's; link/image/raw-HTML neutralization; global size caps; `file` charset | suspect (info) |
| S-8 | B14 | warning | The proposal's §13 promises "the figure included"; DD-12 leaves the figure as debt | suspect: owner decision needed |
| S-9 | A13 | suggestion | Command budget equals the cap | info |

**Counts:** 5 confirmed severe (C-1 to C-5); 3 confirmed with contested severity (C-6 to C-8); 4 confirmed info (C-9 to C-12); 4 single-judge severe (S-1 to S-4), which the parent settled true at source or accepted; 5 single-judge info (S-5 to S-9). No contradictions between the judges.

## Proposed round-1 correction (not applied: awaiting the user)

| Work unit | Fixes | Change |
|---|---|---|
| W-1 Trust boundary | C-2, C-6, C-8, S-1, S-3, S-6, C-12 | The `review` job passes `github_token: ${{ secrets.GITHUB_TOKEN }}` (read-only there) and declares no `id-token`. The agent runs from a **base-ref checkout** (`ref: base.sha`), with the PR head fetched into a separate directory read only through `gh pr diff` / a diff file, so no PR-controlled `AGENTS.md`/`CLAUDE.md`/`.agents` is ever auto-loaded. The `post` job does no checkout, installs the pinned package and runs the scripts from HOME, and takes `repo`/`pr`/`head_sha` from `github.event`, rejecting a mismatching artifact. The skip check and identity rule move into a script subcommand (`post-review.cjs check-skip`), with the marker trusted from an allowlisted identity set (the CI bot plus a configured local login). A new §7.6 holds a per-runtime template table: gating, exact `allowedTools` incl. `Task`/`Skill`, `--add-dir`, Codex `sandbox: read-only` + `safety-strategy: drop-sudo`, action pins by commit SHA, timeout, turns, concurrency, header |
| W-2 Deterministic identity and reconcile | C-3, S-4, C-7, C-11 | `post-review.cjs` computes fingerprints (the agent schema drops the field). Each inline body carries a hidden per-comment tag `<!-- akili-review:fp=<fp> sev=<s> -->`. Threads are matched through GraphQL `reviewThreads`, and their resolver is checked (bot-resolved ≠ human). The marker stores `{fp, sev}` entries. Lines are pre-checked against `gh api pulls/{n}/files` patches; non-mappable findings go to the summary; on 422, retry with no inline comments. The review is posted before the summary update. The threshold comes from the trusted config/CLI, not the document. Summary size cap |
| W-3 Schema | C-4 | Drop the unsupported keywords from the structured-output schema. Ranges and lengths are enforced by `validate-review.cjs` (semantic checks), and the schema stays in the strict subset. Settle P-5 for OpenAI in T1 |
| W-4 Counts and citations | C-1, C-5, S-2, C-9, C-10, P-16 cite | 6 carve-out sites (FR-8, FR-14, P-9, §2, DD-10); P-4 pin `bdf19a4` (`v1.13`) and HEAD `c05cfd7` named separately; the P-6/P-7 consumer list widened by count across `test/` and docs (`akili-marketing-docs:114-115`, `diagram-design:417`, `cli.md:247`); "three new test files" and "8 skill files" corrected; validator and poster made `--fail-on`-aware, plus a `skipped.json` artifact path |
| W-5 Rendering | S-7, S-5 | Render order aligned with FR-8; neutralize links, images and raw HTML (link allowlist: the repo's own blob URLs); global caps; `file` charset; `GH_BIN` injection for tests |
| (owner) | S-8 | Figure: keep as known debt (DD-12, amends proposal §13), **or** add a task to regenerate `assets/akili-flow.svg` |

## Round 1 scoped re-judgment (fix delta `a7f4f6a..3d4ed05`)

| Judge | Verdict | Ledger items | New findings |
|---|---|---|---|
| A | not approve | All resolved except C-6, C-9, C-12 (partially) | **R-A1 severe**: `persist-credentials: false` then `git fetch` has no credentials on private repos. **R-A2 severe**: relative `input/` paths could put the head inside the workspace, where nested `CLAUDE.md` would load. R-A3 to R-A7 warning: input expansion, unneutralized manifest strings, `/proc` reads and bot login forms, Codex turn limit, no `skipped.json` writer. R-A8, R-A9 suggestion |
| B | approve | All resolved except C-3, C-9, S-8 (partially) | R-B1 to R-B7 warning: `post` lacks `contents: read`; no `skipped.json` writer; Codex shell; relative paths (= R-A2); proposal §13 not amended; FR-9/FR-10 not synced; Codex turn limit and `AKILI_GH_BIN` form. R-B8 suggestion: a cancel can split review from summary |

**Merged:** R-A2 = R-B4 (confirmed; severity contested). R-A7 = R-B2, R-A6 = R-B7 (confirmed). R-A1 is a single-judge severe; the parent accepted it by reading §7.6 (`persist-credentials: false` + `git fetch` in the same table). Decision gate "Scoped re-judgment fails before round two" → **the parent launched the final bounded fix round.**

### Round-2 correction (applied)

| Finding | Fix |
|---|---|
| R-A1 | The head is materialized via `gh api repos/<repo>/tarball/<head.sha>` with the job token (`contents: read`), extracted outside the workspace, symlinks deleted; checkout is depth 1 (P-22) |
| R-A2 / R-B4 | Every CI path is absolute under `$RUNNER_TEMP` (`akili-input/`, `akili-review/`); requirements state that the input directory is outside the workspace |
| R-A3 | A `paths` step output; inputs use `${{ steps.paths.outputs.* }}`, never shell variables |
| R-A4 | Neutralization covers every rendered string, manifest paths included; non-conforming paths shown as code spans |
| R-A5 | `Read(//proc/**)`, `Read(//sys/**)` denies (P-24); symlinks deleted from the head tree; secret-shape redaction before rendering; bot login compared without `[bot]` (P-23 for the Codex key) |
| R-A6 / R-B7 | FR-12 item 6: a turn limit where the runtime supports it, Codex bounded by the timeout; `AKILI_GH_BIN` defined as a path, run through `process.execPath` for `.js`/`.cjs` |
| R-A7 / R-B2 | `check-skip --out` writes `skipped.json`; the artifact on a skip is `skipped.json` alone; `post` exits 0 on it |
| R-A8 | Only a thread resolved by the CI bot counts as script-resolved; a human allowlisted poster counts as human |
| R-A9 | LOC ~4,750; escalation line ~5,700 |
| R-B1 | `post` job gains `contents: read` |
| R-B3 | FR-12 item 5 split per runtime; the Codex header states the read-only-shell residual |
| R-B5 | Proposal §13 carries the dated amendment |
| R-B6 | Glossary *Marker*, FR-9 and FR-10 synced with design §5.4/§5.5, including the tag-rebuild row |
| R-B8 | `post` has its own concurrency group with no cancel; the state is rebuilt from inline tags when the marker is missing |
