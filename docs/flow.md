# AKILI Flow

AKILI keeps durable product, design, implementation, test, and validation context in repository files so agents do not have to infer the same project reality every session.

The workflow is inspired by OpenSpec's artifact-guided pattern, but AKILI adds a project constitution step, Claude/OpenCode skills, and explicit validation evidence before archive.

![AKILI-SPECS lifecycle: /akili-constitution sets the baseline once; each spec then runs /akili-propose, /akili-specify, /akili-execute, /akili-test, /akili-validate and /akili-archive, and a Kaizen retrospective feeds the next spec. Anytime commands: /akili-security, /akili-review (local or in CI), /akili-resume, /akili-audit, /akili-quick, /akili-seo and /akili-marketing; confirmed /akili-security findings, and confirmed critical /akili-review findings from a local run, enter the Bug Track through /akili-propose. /akili-seo and /akili-marketing form the growth track, linked to /akili-constitution: the PRD seeds the brand voice and angles, and they return as cited defaults.](../assets/akili-flow-animated.svg)

## Start Here

Use this flow for normal feature work:

1. `/akili-constitution` - create or strengthen the project baseline.
2. `/akili-propose <change-name-or-spec-path>` - capture intent, scope, and reviewable direction.
3. `/akili-specify <spec-path>` - define one feature, module, bugfix, or enhancement.
4. `/akili-execute <spec-path>` - implement the next approved task.
5. `/akili-test <spec-path>` - prove the behavior with tests and traceability.
6. `/akili-validate <spec-path>` - audit conformance before calling the work done.
7. `/akili-archive <spec-path>` - preserve completed work and remove it from active specs.

Seven anytime commands run outside this loop, at any time: `/akili-resume`, `/akili-audit`, `/akili-quick`, `/akili-seo`, `/akili-security`, `/akili-marketing` and `/akili-review`. Confirmed `/akili-security` findings, and confirmed critical `/akili-review` findings from a local run, re-enter the loop through `/akili-propose` on the Bug Track. `/akili-seo` and `/akili-marketing` form the growth track, linked to `/akili-constitution` by the dashed edge in the figure.

Run `/akili-constitution` first in a new repository, after a major product pivot, or when the baseline docs are missing. For an established repository with a good baseline, start at `/akili-propose <change-name>` or `/akili-specify <spec-path>`.

**Brand-new project? Don't re-propose the seed prompt.** After the seed drives `/akili-constitution`, the PRD *is* that intent — already reviewed. The next step is `/akili-propose <first-milestone>`, which reads the PRD and decomposes the v1 scope into bounded, ordered chunks (or `/akili-specify` directly when v1 is one bounded piece). See [Day 1 on a Brand-New Project](#day-1-on-a-brand-new-project-from-seed-prompt-to-first-spec).

Use `/akili-propose` when the change needs review before full specification. For very small, obvious work, you may start directly with `/akili-specify <spec-path>`.

## Philosophy

```text
→ constitution before feature work
→ reviewable intent before implementation
→ behavior requirements before code
→ small verified tasks over broad rewrites
→ evidence before archive
```

## Core Concepts

| Concept | Meaning |
|---|---|
| Constitution | Project-wide context that should not be rediscovered every session |
| Proposal | A lightweight review document for intent, scope, options, and risks |
| Spec path | A folder under `docs/specs/` for one bounded piece of work |
| Requirement | A testable statement of expected behavior |
| Scenario | A concrete Given/When/Then example that proves a requirement |
| Design | The technical and UX approach for satisfying requirements |
| Task | A small executable unit linked to requirements and design sections |
| Report | Evidence that the implementation was tested and validated |
| Archive | Completed AKILI-SPECS history moved under `docs/specs/archive/` |
| Kaizen | The continuous-improvement loop that turns each spec's evidence into lessons and standards |

## Day 1 on a Brand-New Project (from seed prompt to first spec)

The most common point of confusion: after the seed prompt drives `/akili-constitution` (PRD, UX/UI, TRD, infrastructure, `.agents/`), **what do you do with the seed prompt now?**

**Nothing — you never feed it to `/akili-propose`.** The PRD *is* the seed intent, structured and already approved through the constitution's own review gate. Re-proposing it would duplicate the PRD inside a `proposal.md`. The day-1 sequence is:

```text
1. Seed prompt → /akili-constitution        (Brand-new mode: PRD, design, TRD, infra, .agents/)
2. /akili-propose <first-milestone>          (Greenfield track: reads the PRD — no re-pasting —
                                              and decomposes the v1 scope into bounded changes
                                              with a RICE/MoSCoW build order, one proposal per chunk,
                                              each referencing PRD sections instead of restating them)
3. /akili-specify <first-chunk>              (requirements, design, tasks for the first slice)
4. /akili-execute → /akili-test → /akili-validate → /akili-archive
5. Repeat 3–4 per chunk, in the build order from step 2
```

If the whole v1 is genuinely one bounded piece, skip step 2 and go straight to `/akili-specify`. The proposal layer earns its cost when the MVP needs *chunking and ordering* — not as a re-statement ritual.

**Thin seed?** A one-line seed ("an app to sell cars") triggers the constitution's thin-seed protocol before any PRD is drafted: one bounded clarification round (≤7 batched questions, each with a proposed default the user can veto in a word), everything undecided lands as a **labeled Assumption** rather than invented prose, and the PRD comes out MVP-scoped with open questions instead of enterprise-shaped with fabricated certainty — downstream commands treat PRD statements as approved truth, so fabricated specificity would get *built*.

## Primary Lifecycle

```text
You: /akili-constitution
AI:  Creates or strengthens the project baseline:
     ✓ docs/prd.md
     ✓ docs/ux-ui/design.md
     ✓ docs/trd/trd.md
     ✓ docs/specs/general-setup/
     ✓ CLAUDE.md and AGENTS.md

You: /akili-propose add-remember-me
AI:  Creates docs/specs/changes/add-remember-me/proposal.md
     ✓ problem, scope, non-goals
     ✓ affected systems
     ✓ requirement delta preview
     ✓ approach options and recommendation

You: /akili-specify changes/add-remember-me
AI:  Creates or updates:
     ✓ requirements.md
     ✓ design.md
     ✓ tasks.md

You: /akili-execute changes/add-remember-me
AI:  Runs the Leader → Implementer → Reviewer harness on the next approved task
     ✓ Implementer writes code and runs verification, within a bounded self-correction loop
     ✓ Reviewer audits the diff and emits STATUS: PASS or STATUS: FAIL — skipped when Review intensity (Step 2.3) is met and no override applies, closing the task REVIEW_SKIPPED instead
     ✓ Up to 3 rework attempts on FAIL, then HALT for human guidance
     ✓ updates tasks.md
     ✓ appends execution.md with full PASS/FAIL audit trail
     ✓ commits with [SPEC:<spec-path>] and records verification evidence

You: /akili-test changes/add-remember-me
AI:  Creates test-report.md with requirement-to-test traceability (supports automated parsing via `scripts/parse_tests.js`)

You: /akili-validate changes/add-remember-me
AI:  Creates validation-report.md with PASS/WARN/FAIL/BLOCKED findings

You: /akili-archive changes/add-remember-me
AI:  Runs the Kaizen retrospective (writes docs/specs/kaizen/<safe-spec-slug>.md), moves completed work into docs/specs/archive/, and refreshes CodeGraph

Independent Auditing:
You: /akili-audit
AI:  Scans codebase and detects drift against baselines, generating docs/specs/audits/drift-<date>.md

You: /akili-security
AI:  Plans the audit behind a plan gate, writes a redacted index at docs/specs/audits/security-<date>.md, and routes each confirmed finding you select to /akili-propose (Bug Track)
```

## Fast-Track for Trivial Changes

Not every change needs the full lifecycle. For a genuinely trivial, low-risk change — a button color, a title's text, a small paragraph — use `/akili-quick`:

```text
You: /akili-quick login-button-color use the brand accent token on the primary login button
AI:  ✓ checks the triviality gate (cosmetic/copy-only, no behavior/data/API/auth change,
       ≤ ~20 LOC in one component, not a video composition, design-token safe)
     ✓ makes the edit directly
     ✓ runs a light verification (lint / type-check / existing test / manual note)
     ✓ appends a one-line entry to docs/specs/quick/quick-log.md
     ✓ commits with [SPEC:quick/login-button-color]
```

If the change fails the gate (it has logic, touches data/API/auth, needs a new design token, or is bigger than a tweak), `/akili-quick` stops and escalates to `/akili-specify` (Lite) or `/akili-propose`. This keeps spec-to-code traceability intact while sparing small changes the full flow.

## Handling Bugs

Bugs are **not** treated exactly like normal changes — a bug starts from a *symptom*, not an *intent*, so the root cause must be understood before a fix is proposed. AKILI does this without a separate command: `/akili-propose` classifies the request and, when it detects a bug, follows the **Bug Track**.

```text
You: /akili-propose checkout-total-wrong the cart total is off by one item after removing a product
AI:  ✓ classifies this as a Bug (records Type: Bug)
     ✓ loads systematic-debugging
     ✓ captures: observed symptom, reproduction steps, CONFIRMED root cause, blast radius
     ✓ recommends a fix strategy and the route

You: /akili-specify bugfix/checkout-total-wrong
AI:  runs in Bug Mode — frames requirements around the corrected behavior and REQUIRES a
     regression test (red before the fix, green after) as a mandatory task
```

Routing by size:

- **Cosmetic bug** (e.g. a visible typo, wrong static label) → `/akili-quick`.
- **Bug with logic/behavior** → `/akili-propose` (diagnose) → `/akili-specify` Bug Mode (fix + regression test) → `/akili-execute` → `/akili-test` → `/akili-validate`.

The regression test is the non-negotiable evidence that the bug is actually fixed and stays fixed. `/akili-validate` then carries any unresolved `PRODUCT_BUG` from the test evidence through as a FAIL.

## Project Modes

`/akili-constitution` begins by classifying the repository into one of three modes. Each mode adjusts how aggressively the constitution drafts, scans, or preserves existing material — and how the project `.agents/` harness is scaffolded.

| Mode | Meaning | Constitution Behavior | `.agents/` Behavior |
|---|---|---|---|
| Brand-new (Seed Setup) | Little or no application code, no AKILI-SPECS docs, starting from scratch | Draft baseline from user intent, chosen stack, assumptions, and open questions | Copy default Leader / Implementer / Reviewer personas verbatim |
| Legacy (Discovery Setup) | Real code, package manifests, routes, tests exist; AKILI-SPECS baseline missing or skeletal | Inspect repository reality — code, docs, architecture, tests, package manifests, and routes (CodeGraph preferred) — before drafting baseline docs; synthesize baseline from evidence | Copy defaults then customize with detected stack, design tokens, lint and test commands |
| Active AKILI-SPECS (Safe Update) | AKILI-SPECS baseline and possibly customized `.agents/` already in place | Upgrade weak sections, fill missing files, preserve custom rules | Replace each owned section per its drift state (`akili doctor --agents --fix`, see [CLI Reference](cli.md)); never append, and custom-edited sections and the project block are never touched |

For all three modes, `/akili-constitution` creates or enhances root `CLAUDE.md` and root `AGENTS.md` so Claude Code, OpenCode, Google Antigravity, Codex, and Cursor receive the same project guidance.

For Legacy and Active-AKILI-SPECS modes, CodeGraph is preferred when `.codegraph/` exists: agents should use it for semantic code exploration, symbol lookup, callers/callees, and impact checks. If CodeGraph is missing but the CLI is available, the agent should ask before running `codegraph init -i`. If CodeGraph is unavailable or declined, normal file and content searches are used. If the `codegraph` CLI itself is not installed, the agent says so once — with the install command (`npm install -g @colbymchenry/codegraph`) — and continues. Either way the methodology proceeds with normal `Glob`, `Grep`, and file reads at the **same scan scope**: a missing graph lowers the confidence the reports record, it never shrinks the analysis.

## Artifacts

| Artifact | Created By | Purpose |
|---|---|---|
| `docs/prd.md` | `/akili-constitution` | Product purpose, personas, goals, scope, success metrics |
| `docs/ux-ui/design.md` | `/akili-constitution` | UX system, flows, screen inventory, tokens, accessibility expectations |
| `docs/trd/trd.md` | `/akili-constitution` | Technical architecture, modules, data, APIs, integrations, testing strategy |
| `docs/specs/general-setup/` | `/akili-constitution` | Project-specific templates for future specs (includes the `family.md` manifest schema) |
| `docs/specs/<spec-path>/proposal.md` | `/akili-propose` | Reviewable intent, scope, options, and risks |
| `docs/specs/<spec-path>/requirements.md` | `/akili-specify` | Behavior contracts and scenarios |
| `docs/specs/<spec-path>/design.md` | `/akili-specify` | Implementation approach and trade-offs |
| `docs/specs/<spec-path>/tasks.md` | `/akili-specify` | Small executable tasks with verification |
| `docs/specs/<spec-path>/execution.md` | `/akili-execute` | Task execution history and evidence |
| `docs/specs/<spec-path>/test-report.md` | `/akili-test` | Requirement-to-test matrix and coverage gaps |
| `docs/specs/<spec-path>/validation-report.md` | `/akili-validate` | Final conformance audit |
| `docs/specs/audits/drift-<YYYY-MM-DD>[-<safe-branch>][-N].md` | `/akili-audit` | One report per audit run: conformance auditing of documentation vs. codebase reality. Readers take the most recent `drift-*.md` by `Date of Audit` header, falling back to legacy `docs/specs/drift-report.md` only when the directory holds no `drift-*.md` file |
| `docs/specs/audits/security-<YYYY-MM-DD>[-<safe-branch>][-N].md` | `/akili-security` | One redacted index per audit run: counts by verdict and severity, and opaque `S-n` rows for `confirmed` / `needs_validation` records. Full findings stay in the run directory (always outside the target); never a drift source |
| `docs/marketing/angles.md` | `/akili-marketing` | The map of customer angles, one section per content pillar, approved per pillar; `campaign` and `post` cite its approved IDs. Unpublished draft content, outside the spec lifecycle |
| `docs/marketing/brand-voice.md`, `campaigns/<slug>/{brief,plan,calendar}.md`, `calendar-<YYYY-MM>.md`, `posts/<YYYY-MM-DD>-<slug>.md` | `/akili-marketing` | Unpublished social marketing drafts (brand voice, campaigns, calendar, posts), outside the spec lifecycle; never published by the command |
| `~/.akili/reviews/<repo>/<pr-<n>\|range-<short-sha>>/run-<k>/` (outside the target); `docs/specs/reviews/review-<YYYY-MM-DD>-<pr-<n>\|<safe-branch>>[-N].md` only with `--record` (or `history: true` in `.akili/review.yml`) | `/akili-review` | A local run's run directory holds `findings.json`, `REVIEW.md` and the prepared diff files (`--ci` writes nothing); the `docs/specs/reviews/` history file is opt-in and not a spec. Nothing under `docs/specs/` changes unless history is enabled (`--record` or `history: true`) |
| `docs/specs/kaizen/<safe-spec-slug>.md` | `/akili-archive` (Kaizen Record, any branch) | One entry file per spec: metrics, root-cause lessons, sub-threshold signals, and the pending-standardization queue |
| `docs/specs/kaizen-log.md` | the `kaizen` skill's Apply Mode (the apply-capable branch only — the digest's single writer) | The `## Active Lessons` digest read by `/akili-propose`, `/akili-specify`, `/akili-execute`, and `/akili-resume`; its legacy `## Entries` section is frozen history |
| `docs/specs/archive/.../archive-summary.md` | `/akili-archive` | Historical closure record |

## Review Gates

AKILI keeps humans in control at each important transition.

| Gate | Before Moving On, Confirm |
|---|---|
| Constitution | Baseline docs reflect the actual product and architecture |
| Proposal | Problem, scope, non-goals, and recommended approach are approved |
| Requirements | Observable behavior and scenarios are testable |
| Design | Technical approach fits the current repository |
| Tasks | Work is small enough to execute and verify incrementally |
| Execution | Each completed task has verification evidence |
| Testing | Key requirements have automated or accepted manual evidence |
| Validation | No unresolved FAIL findings remain |
| Archive | Warnings and follow-ups are accepted; Kaizen lessons are recorded and standardizations approved or deferred |

## Review Points

Before implementation, review:

- whether the problem and scope are clear
- whether every requirement has at least one scenario
- whether design decisions explain trade-offs instead of only listing files
- whether tasks are small enough to execute independently
- whether every task has verification criteria

Before completion, review:

- whether all intended tasks are complete
- whether tests cover the key scenarios
- whether validation found unresolved failures
- whether the spec should be updated based on implementation discoveries

## Documentation Depth

Use the lightest documentation that still makes the work clear and verifiable.

| Depth | Use For | Capture |
|---|---|---|
| Quick (`/akili-quick`) | Genuinely trivial cosmetic/copy changes (button color, title text, small paragraph) | No spec docs — a one-line `quick-log.md` entry + `[SPEC:quick/<name>]` commit; escalates if not trivial |
| Lite | Small bugfixes, copy updates, narrow UI tweaks | Problem, affected requirement, scenario, focused task, verification command |
| Standard | Normal features and enhancements | Requirements, scenarios, design decisions, tasks, tests |
| Full | Risky, cross-cutting, API, data, auth, migration, or SEO work | Business context, alternatives, data/API contracts, rollout, risks, observability, rollback, explicit traceability |
| Full plus constitution review | Cross-cutting architecture | Updates to project baseline docs and affected specs |

Lite mode does not skip rigor. It keeps the documents short, but every requirement still needs a testable scenario, every task still needs a done criterion, and validation still needs evidence. `/akili-quick` is the only path that skips the spec documents — gated to genuinely trivial changes, and it auto-escalates anything larger to `/akili-specify` (Lite) or `/akili-propose`.

## Spec Folder Shape

Each feature or change lives in one folder:

```text
docs/specs/<spec-path>/
├── proposal.md           # created by /akili-propose, optional but recommended
├── requirements.md
├── design.md
├── tasks.md
├── execution.md          # created by /akili-execute
├── test-report.md        # created by /akili-test
├── validation-report.md  # created by /akili-validate
└── archive-summary.md    # created by /akili-archive before moving
```

Commands accept a relative path under `docs/specs/`, not only a flat module name — for example `loan`, `enhancements/renewals` or `admin/user-management`. Choose paths that describe the domain and intent. When `/akili-propose add-remember-me` receives a bare change name, it defaults to `docs/specs/changes/add-remember-me/`. When it receives a nested path such as `bugfix/login-redirect`, it uses that path directly.

Common spec paths:

```text
docs/specs/loan/
docs/specs/changes/add-remember-me/
docs/specs/enhancements/renewals/
docs/specs/admin/user-management/
docs/specs/bugfix/login-redirect/
docs/specs/seo/example.com/
```

## Requirement Delta Preview

Proposals can include a lightweight delta preview. This makes reviews faster for brownfield work:

```markdown
## Requirement Delta Preview

### ADDED Requirements

- The system SHALL allow users to opt into extended sessions.

### MODIFIED Requirements

- Session expiration changes from a fixed timeout to configurable timeout policies.

### REMOVED Requirements

- Legacy session persistence behavior is removed after migration.
```

During `/akili-specify`, these previews become full requirements, scenarios, design decisions, and tasks.

## Writing Good Requirements

Write requirements as behavior contracts, not implementation plans.

Use this shape when possible:

```markdown
### Requirement: Session Expiration

The system SHALL expire inactive user sessions after the configured timeout.

#### Scenario: Idle timeout

- GIVEN an authenticated user has an active session
- WHEN the session remains inactive past the configured timeout
- THEN the system invalidates the session
- AND the user must authenticate again before accessing protected pages
- BUT it must NOT invalidate the session if a keep-alive ping was received
- AND IT MUST log the expiration event in the audit trail
```

Good requirements are:

- observable by a user, system, API client, or operator
- measurable enough to test
- equipped with rigorous negative constraints (`BUT it must NOT`) and strict validations (`AND IT MUST`) for boundary cases
- independent from internal class names or library choices
- linked to at least one implementation task
- covered by test evidence or an explicit accepted gap

## Shortcut Paths

For a small, obvious change in a repository with a strong baseline, you may start at `/akili-specify <spec-path>`.

For unclear, risky, cross-functional, or stakeholder-sensitive work, start at `/akili-propose <change-name-or-spec-path>`.

For a new repository, stale documentation, or a major product pivot, start at `/akili-constitution`.

## Practical Example

For a new admin user-management feature:

```text
/akili-constitution
/akili-propose admin/user-management
/akili-specify admin/user-management
/akili-execute admin/user-management
/akili-test admin/user-management
/akili-validate admin/user-management
/akili-archive admin/user-management
```

For a small login redirect bugfix in an established repo:

```text
/akili-specify bugfix/login-redirect
/akili-execute bugfix/login-redirect
/akili-test bugfix/login-redirect
/akili-validate bugfix/login-redirect
/akili-archive bugfix/login-redirect
```

For a reviewable named change using the default `changes/` path:

```text
/akili-propose add-remember-me
/akili-specify changes/add-remember-me
/akili-execute changes/add-remember-me
/akili-test changes/add-remember-me
/akili-validate changes/add-remember-me
/akili-archive changes/add-remember-me
```

---

## Context Discipline (when to /compact, when to /clear)

AKILI's file-based design exists precisely so that **conversation context is disposable at phase boundaries**: everything durable — specs, `execution.md`, `tasks.md`, guides, the kaizen entry files and their digest — lives in the repository, and `/akili-resume` rebuilds a session from files alone. That inverts the usual economics: resetting context is nearly free *at a boundary* and expensive *mid-task*, so the discipline is about **where**, not whether.

The agent **cannot** run `/compact` or `/clear` — those are user commands in the host. What the methodology does instead is have commands **recommend the right action at the right moment** (context checkpoints), the same pattern as model checkpoints:

| Moment | Checkpoint says | Why it is safe |
|---|---|---|
| After `/akili-archive` | `/clear`, then fresh session for new work | The cleanest boundary in the methodology — the spec is closed and fully externalized |
| After `/akili-specify` approval | `/clear`, then `/akili-execute <spec-path>` fresh | Execution reloads everything from the spec files; nothing it needs lives only in chat |
| `/akili-execute` Step 5 (between tasks) | `/compact` (keep session) or park + `/clear` + `/akili-resume` | Task state is fully in `execution.md`/`tasks.md`; between tasks the conversation holds nothing irreplaceable |
| Mid-task, context critically low | Not a checkpoint — the Leader's **wind-down protocol** governs: finish or park `[~]` with full history, write the audit trail, stop | Mid-loop is exactly where resetting destroys working state |

Host specifics: Claude Code has `/compact` (trim, keep session) and `/clear` (full reset) plus automatic compaction as a safety net. Other hosts have their own equivalents — per the methodology's own rule, **name them only when confirmed for the user's installed version, never by guessing**.

---

## Multi-Spec Parallel Execution (fleet of sessions)

When one large proposal decomposes into several **independent** specs, they can be attacked in parallel — each spec in its own git worktree and branch, each running a **complete AKILI session** (its own Leader → Implementer → Reviewer loop), coordinated from a principal CLI. This is a different axis than the Leader's task fan-out: the unit of parallelism is a whole spec, and the coordinator is a **dispatcher of specs, not a Leader of tasks**.

```text
Principal CLI (coordinator/dispatcher)
├── worktree spec-a  (branch: spec/a) → full AKILI session: /akili-execute a
├── worktree spec-b  (branch: spec/b) → full AKILI session: /akili-execute b
└── worktree spec-c  (branch: spec/c) → full AKILI session: /akili-execute c
     … then serial merges back, in dependency order
```

**Preconditions — all four, or the pattern does not apply:**

1. **Spec-level independence, decided at decomposition time, persisted in `family.md`, not at dispatch time.** When the specs originate from a chunked proposal, their `Parallel-safe` and `Depends on` columns in the parent `family.md` manifest (schema: `/akili-constitution` Step 7 general-setup templates) are the source for this precondition — the coordinator reads them, it does not re-derive independence. The underlying test is still the two-part one: disjoint files AND no shared build output/ports/dependency coupling *between the changes*. Specs that touch a shared contract go serial, in dependency order; specs with no manifest (flat specs) still need this judgment made explicitly before dispatch.
2. **`Approval Mode: pre-approved`** recorded in each spec's Document Control. A background session with interactive gates waits forever for a human who is not watching that terminal. Exceptions (HALT, Pivot, budget tripwire, `FATAL_FAIL`) still stop — see the escalation rule below.
   **Per-host launch:** in Claude Code, start each child with `claude -p "/goal <condition>"`, using the canonical condition from the Unattended Mode block in `/akili-execute` Step 5 rather than a rewritten one — the loop runs to completion in that single invocation ([docs](https://code.claude.com/docs/en/goal.md)). In Google Antigravity, put the spec-completion goal and the same exception contract in the dispatch brief: the agent pursues the mission autonomously and produces artifacts, and completion is verified by you from those artifacts — the platform evaluates no completion condition ([source](https://antigravity.google/blog/introducing-google-antigravity)). For OpenCode there is no verified equivalent, so this guidance makes no claim. For Codex, `/goal` gives Codex a persistent target to track while a larger task runs, and Codex "keeps the goal attached to the active chat while work continues" (<https://learn.chatgpt.com/docs/cli/slash-commands>, `Last verified: 2026-09-17`) — not a condition-evaluated loop that starts another turn — there is no verified equivalent for autonomous multi-turn dispatch; this guidance makes no claim beyond ordinary invocation, where a command installed as a skill is invoked `$akili-<name>` (`Last verified: 2026-09-16` — https://learn.chatgpt.com/docs/build-skills: "type `$` to mention a skill"). For Cursor there is likewise no verified unattended equivalent — its `goal`/`loop`/`autopilot` built-ins are observed to exist (cursor-agent 2026.09.26-dd393fe, 2026-10-01), but no cited source documents one looping on a condition — so this guidance makes no claim beyond ordinary invocation, where a command installed as a skill is invoked `/akili-<name>` (<https://cursor.com/docs/context/skills>, `Last verified: 2026-10-01`: "Skills can also be manually invoked by typing `/` in Agent chat").
3. **Worktree cost amortized.** Each worktree pays a fresh install/build. A 2-task spec does not earn one; a 10-task spec does.
4. **A dispatch mechanism with the delivery chain honored** — Orca orchestration when the project's Skill Map lists it (preferred: structured messages, worker_done waits), or terminal-driven sessions (tmux, agent CLIs) as the low-level transport. Same rules either way.

**The coordinator's contract (dispatcher, not Leader):**

| The coordinator does | The coordinator does NOT |
|---|---|
| Verify each target session is live, dispatch each spec with its return path declared (supervised vs handoff, said out loud) | Adjudicate Reviewer FAILs inside a child session — that is the child Leader's job |
| Enforce the delivery chain per child: send verified at the target (`terminal show`-equivalent), **idle ≠ delivered** (poke once on idle-without-report) | Read child `execution.md` files cover to cover — it consumes each child's bounded completion report |
| Receive per-spec completion reports (bounded summaries: final status, tasks done, verification evidence pointer, branch name) | Re-derive or re-verify the child's work — commit to the delegation |
| Escalate child exceptions (HALT / Pivot / tripwire) to the user — exceptions always reach a human, `pre-approved` never absorbs them | Absorb a HALT silently or "fix" a child's blocker itself |
| Order and execute the **serial merge phase** in dependency order, with an integration verification after each merge | Merge in parallel, or merge a branch whose spec did not reach a PASS/validated state |

**Width and waves at spec scale:** the same landing physics binds. Implementation parallelizes; **integration does not** — N branches means N serial merges plus integration verification, and each child's completion lands in the coordinator's one context. Default **2 concurrent spec sessions, at most 3**; a proposal that chunks into six specs runs as waves (2–3, merge, next wave), never as a six-wide fleet. Wave composition and merge order follow the `family.md` manifest's `#` (build order) and `Depends on` columns, not folder-discovery order. Merges happen between waves, so each wave starts from a master that already contains the previous wave — which also catches cross-spec drift early, while it is one merge old instead of six.

**Recovery is per-worktree and already solved:** a dead or interrupted child session is resumed in place with `/akili-resume` in its worktree — its `execution.md` is the handoff, exactly as in single-session work. The coordinator's own state is small by design (dispatch log + reports received), so it should be trivially reconstructible; keep it in a file, not in conversation.

---

## Advanced Engineering Capabilities

To support robust, long-term development cycles, AKILI includes the following specialized workflows:

### 1. Spec-to-Code Traceability (Git & Comments)
To establish high-traceability between spec files and source code:
* **Commit Messages:** Every commit made during `/akili-execute` must be prefixed with `[SPEC:<spec-path>]` (e.g. `git commit -m "[SPEC:changes/add-remember-me] implement secure cookie storage"`).
* **Comment Tracing:** For complex algorithms, API entry points, or core models, developers/agents should place a reference comment: `// @akili-spec <spec-path>`.

### 2. Specification Drift Auditing (`/akili-audit`)
Run `/akili-audit` independently to verify that the active codebase reflects active documentation. The command writes one report per run at `docs/specs/audits/drift-<YYYY-MM-DD>[-<safe-branch>][-N].md` — the branch slug added when the run is off the default branch or the default branch cannot be resolved, a numeric suffix on a same-day collision — so parallel runs coexist instead of overwriting one another. Readers take the most recent `drift-*.md` report by its `Date of Audit` header (ties broken by the newest filename, never filesystem mtime) and fall back to a legacy `docs/specs/drift-report.md` only when the directory holds no `drift-*.md` file; a `security-*.md` index in the same directory is never read as a drift report. Each report details:
* **Stale Specifications:** Documented endpoints/modules missing from code.
* **Undocumented Code:** Active code additions completely missing from the PRD, UX/UI design, or TRD docs.
* **Styling/Architecture Violations:** Active code violating styling tokens or engineering guidelines.
* **Agent Guide Drift:** Modules lacking a needed child `CLAUDE.md`/`AGENTS.md`, child guides missing from the parent's `## Module Guides` index, or root-guide structure descriptions that no longer match the codebase.

### 2b. Repository Security Auditing (`/akili-security`)
Run `/akili-security` independently, outside the spec lifecycle, for a gated security audit of the repository. The plan gate stops on every run, and the routing gate stops whenever it is reached (only a run that writes an index reaches it); the run is static-only unless sandboxed execution is approved for that run. Full findings stay in a run directory (always outside the target); the only tracked repository content the command writes is a redacted index at `docs/specs/audits/security-<YYYY-MM-DD>[-<safe-branch>][-N].md`. That index sits beside the drift reports but is never a drift source. Each confirmed finding the user selects is routed to a Bug proposal (`/akili-propose bugfix/security-<YYYY-MM-DD>-r<N>-s<n>`), which then follows the Bug Track. See [the command page](commands/akili-security.md) for residual risk and disclosure. It is not supported on native Windows (the vendored validators fail closed there); run it from WSL, Linux or macOS.

### 2c. Social Marketing (`/akili-marketing`)
Run `/akili-marketing <mode>` independently, outside the spec lifecycle, to draft social marketing for LinkedIn, Instagram and Facebook as reviewable Markdown under `docs/marketing/`. Seven modes: `brand` (brand voice and the foundations: ideal customer, ideal follower, offer, message), `angles` (the map of customer angles per content pillar), `campaign` (brief and plan), `calendar`, `post`, `review` and `repurpose`. The files it writes are `brand-voice.md`, `angles.md`, `campaigns/<slug>/{brief,plan,calendar}.md`, `calendar-<YYYY-MM>.md` and `posts/<YYYY-MM-DD>-<slug>.md`. A `campaign` plan slot names an approved angle ID (optionally a second), an approach out of five and three hook candidates; `post` records the approved angle ID(s) and an approach, and drafts with the one hook you pick of three. Neither cites an angle from a pillar section that is not validly `approved`, and no mode drafts a post for every angle times every approach. It drafts only and never publishes: each post ends at a copy-paste block that you place by hand. See [the command page](commands/akili-marketing.md) for the gate and the full mode reference.

**Growth track.** `/akili-seo` and `/akili-marketing` are the growth track: a documentation grouping of two anytime commands, not a command, so the count of anytime commands does not change. What flows between the growth track and the baseline:

| From | To | What flows |
|---|---|---|
| `docs/prd.md` (*Target Personas*, *Problem Statement*, *Customer Objections & Beliefs* if present) | `brand-voice.md` foundations and `angles.md` | `brand` pre-fills the foundations from those sections, each line citing its section, and asks you to confirm or edit; `angles` cites them as sources. Marketing never writes to the PRD |
| `brand-voice.md` (`filled: yes`) and `angles.md` (validly `approved` pillar sections) | `/akili-constitution` Step 2 | Foundations (customer, offer, positioning) and the objections and beliefs of approved pillars are offered as proposed defaults that cite the file; what you do not confirm lands as an Assumption. A `filled: no` voice, a `draft` pillar section and any post are never a source |
| User-supplied material (including a filled brand voice or an approved angles map) | `docs/prd.md` *Customer Objections & Beliefs* | `/akili-constitution` Step 3 may write this optional section only from material you supplied, with its source; with none it is omitted or reads `none supplied` |
| `/akili-seo` report | none | No data flows from the SEO report into marketing or the baseline |

### 2d. Pull-Request Review (`/akili-review`)
Run `/akili-review [<pr> | <base>..<head> | --staged]` independently, outside the spec lifecycle, to review a pull request, a commit range or the staged changes against its specs with the packaged `pr-review` skill: a filtered and tiered diff, one lens reviewer per lens and chunk, verified findings, and one summary comment. A local run writes the review to a run directory outside the target (the `--ci` form returns it as structured output and writes and posts nothing); PR comments are posted only with `--comment`, behind a confirmation gate, and only through the packaged scripts. It reviews only: it never edits target source, runs target code, commits, pushes, approves a PR or requests changes. A `docs/specs/reviews/` history file is written only with `--record` (or `history: true` in `.akili/review.yml`). Confirmed critical findings can be routed to a Bug proposal through `/akili-propose` in a local run. See [the command page](commands/akili-review.md) and [the skill page](skills/pr-review.md).

### 3. The Pivot Protocol
If discovery during `/akili-execute` invalidates requirements or design rules:
1. Mark the current task in `tasks.md` as `[~]` (blocked).
2. Append a `## Pivot Record: <Task ID>` under `execution.md` explaining the conflict, technical constraints, and proposed options.
3. Update `requirements.md`, `design.md`, and/or `tasks.md` in the spec folder.
4. Obtain user sign-off on the pivot before resuming execution.

### 4. CodeGraph Refresh Trigger
When compiling the `archive-summary.md` and moving folders to the archive via `/akili-archive`:
* The agent detects if `.codegraph/` configuration folders are present.
* The agent reminds or executes the re-indexing command (e.g., `codegraph index`) to guarantee semantic search utilities remain highly functional for subsequent sessions.

### 5. Automated Test Reporting (`scripts/parse_tests.js`)
Rather than manually compiling assertion results during `/akili-test`:
1. Execute tests outputting to JSON (e.g. `jest --json --outputFile=jest-results.json` or `vitest --reporter=json`).
2. Run `node <path-to-akili>/scripts/parse_tests.js jest-results.json` to generate the AKILI matrix table automatically for inclusion inside `test-report.md`.

### 6. Multi-Agent Harness (`/akili-execute` Triad and `/akili-test` Testers)

`/akili-execute` is implemented as a multi-agent orchestration rather than a single-agent script. The Leader role does not write production code; it delegates implementation and audit to two subordinate roles, then enforces a strict PASS/FAIL gate before the task advances.

**Roles** — all three live in the project's `.agents/` directory, scaffolded by `/akili-constitution`:

| Role | File | Responsibilities |
|---|---|---|
| Leader | `.agents/leader.md` | Picks the next eligible task, delegates work, enforces the rework loop, updates `tasks.md` and `execution.md`, commits with `[SPEC:<spec-path>]` |
| Implementer | `.agents/implementer.md` | Writes code strictly within task scope, applies design tokens from `docs/ux-ui/design.md`, runs the verification command before reporting |
| Reviewer | `.agents/reviewer.md` | Read-only diff audit against requirements, design tokens, and the TRD; outputs a structured PASS or FAIL with *Discovered Issue*, *Violated Rule*, and *Remediation Suggestion* |

**Loop:**

```text
Leader picks the next task → spawns Implementer with task + persona
Implementer writes code, runs verification → reports back
if the Implementer reports STATUS: CHECKPOINT: no Reviewer; Leader respawns a fresh Implementer with the report, at most twice per task; a third checkpoint → HALT
Leader extracts git diff → spawns Reviewer with diff + persona, unless Review intensity (Step 2.3) is met and no override applies
Reviewer returns STATUS: PASS, STATUS: FAIL, or STATUS: FATAL_FAIL

if PASS, or Review intensity is met with no override → append execution.md, then update tasks.md, commit, advance (closes as REVIEW_SKIPPED when no Reviewer ran)
if FAIL and attempts < 3 → respawn Implementer with the Reviewer's structured findings
if FATAL_FAIL → abort loop immediately, mark task [~], trigger Pivot Protocol
if 3 consecutive FAILs → HALT, mark task [~], present audit trail
```

**Why this exists:**

- **Eliminates confirmation bias.** The same agent that writes code does not also approve it.
- **Keeps each context tight.** Each role sees only the slice of spec it needs.
- **Hard PASS/FAIL gate.** Design tokens, requirements conformance, and stability are enforced before the task is marked `[x]`.

**Guardrails & Token Optimization:**

- **Maximum retries.** A hard ceiling of 3 rework attempts per task.
- **Fail-Fast (FATAL_FAIL).** Reviewer aborts the loop on critical architectural violations to save tokens.
- **Diff-Only Review.** The Reviewer reads only the git diff to drastically reduce context window size.
- **Structured feedback.** The Reviewer's FAIL report is forwarded unchanged to the next Implementer spawn.
- **Pivot Protocol takes precedence.** If discovery proves the spec itself is wrong, the loop stops immediately; rework retries are not consumed on a broken spec.

**Cross-tool compatibility:**

The `.agents/` directory is pure Markdown + YAML frontmatter and is resolved relative to the active workspace, so the harness runs under Claude Code, OpenCode, Google Antigravity, Codex, and Cursor. Claude Code and OpenCode delegate through the Step 8E wrappers when present — each wrapper loads its own `.agents/<role>.md`, so the Leader neither re-reads nor re-sends persona content — and fall back to sub-prompt contexts seeded with the persona files when no wrappers exist. **Antigravity resolves agents one level deeper** — it discovers them under `.agents/agents/` and invokes them with `invoke_subagent`, which also requires `subagent: true` in the wrapper's frontmatter, so a persona left at the root of `.agents/` is invisible to it. [Step 8E](commands/akili-constitution.md) generates the nested wrappers, which stay thin and point back at the same persona files. **Codex resolves a third tenant** — its repo-scope Agent Skills root is `.agents/skills/`, holding the AKILI commands and packaged skills installed with `akili install --tool codex --local`; Codex scans `.agents/skills` in every directory from the current working directory up to the repository root, plus the user-scope `$HOME/.agents/skills` (`Last verified: 2026-09-16` — https://learn.chatgpt.com/docs/build-skills). **Confirmed live 2026-09-17 (codex-cli 0.154.0):** asked to enumerate every non-`akili-` skill it can see, Codex did not surface `.agents/<role>.md` (or an `akili-<role>` name) as a skill — the tenant is collision-free. **Cursor adds no tenant of its own:** it reads the existing `.agents/skills/` tenant (above) plus `.claude/skills`, `.claude/agents`, and `.codex/agents` through its documented compatibility roots, and its own Step 8E wrappers live under the separate `.cursor/agents/` path (<https://cursor.com/docs/context/skills>, `Last verified: 2026-10-01`: "For compatibility, Cursor also loads skills from Claude and Codex directories").

One repo can hold all four tenants without collision — no file name is shared:

| Path | Tenant | Written by |
|---|---|---|
| `.agents/<role>.md` | AKILI personas (all hosts) | `/akili-constitution` Step 7 |
| `.agents/agents/akili-<role>/agent.md` | Antigravity wrappers | Step 8E (Antigravity) |
| `.agents/skills/<name>/SKILL.md` | Codex and Cursor repo-scope skills | `akili install --tool codex --local` or `--tool cursor --local` |
| `.agents/model-routing.json` | Model-routing answers (all hosts) — what a later `akili routing` run re-reads | `akili routing` (Step 8C); the inline fallback writes none |

**`/akili-test` — Leader → Tester(s):**

`/akili-test` uses the same Leader pattern with a fourth persona, `.agents/tester.md`, and a token-aware **Deployment Rule**. The Leader partitions testing into suites (backend unit, frontend unit, integration, E2E) and decides how many Testers to spawn:

| Situation | Action |
|---|---|
| Lite depth or a single trivial suite | Run **inline** — no spawn (cheaper than delegating) |
| Standard/Full with one substantial suite | One Tester |
| Multiple **independent** suites | One Tester per suite, **in parallel** |
| Suites sharing files/fixtures | Testers run sequentially |

Each Tester gets only its suite's requirements, scenarios, and test command (never the full spec set), explicitly covers negative constraints and strict validations, runs a bounded 3-attempt self-correction inner loop, and returns `STATUS: PASS`, `STATUS: FAIL`, or `STATUS: PRODUCT_BUG` — keeping a correct test red on a genuine product defect instead of rewriting it to pass. The Leader aggregates the per-suite coverage slices into the `test-report.md` requirement-to-test matrix. Ideally a Tester runs on a different model than the Implementer that wrote the code (author ≠ tester).

### 7. Capability-Tier Model Routing

Each AKILI-SPECS phase has a different dominant demand, so AKILI routes phases to models by **capability
tier** rather than using one model everywhere. Six tiers — **T1 Architect, T2 Coder, T3 Auditor,
T4 Context-Ingest, T5 Fast-Cheap, T6 Multimodal** — map to the phases:

| Phase / Role | Tier |
|---|---|
| `/akili-constitution` | T4 + T1 |
| `/akili-propose`, `/akili-specify` (requirements/design/tasks) | T1 |
| `/akili-quick` | T2 |
| `/akili-specify` (UX/UI design) | T6 |
| `/akili-execute` Leader / Implementer / Reviewer | T1 / T2 / T3 |
| `/akili-test` Leader / Tester(s) | T1 / T2 |
| `/akili-validate` | T3 |
| `/akili-audit` | T4 + T3 |
| `/akili-archive` | T5 |

A single editable registry binds each tier to a model **per tool** (Claude Code, OpenCode, Antigravity, Codex, and Cursor),
using **floating aliases** (`opus`/`sonnet`/`haiku`) wherever they exist so the registry survives
model generations without edits. `/akili-constitution` (Step 8C) asks the routing questions in chat
and runs `akili routing`, which writes a fenced `## Model Routing` copy into the project's root
`AGENTS.md` (an inline fallback writes the same section by hand when the CLI is absent or older).

Routing operates at two levels:

* **Enforced (subagents):** `/akili-constitution` Step 8E can generate tool-native agent wrappers
  (`.claude/agents/akili-{leader,implementer,reviewer,tester}.md` in Claude Code, agent config in
  OpenCode) that pin each persona to its tier's model. `/akili-execute` and `/akili-test` prefer
  those named agents — so **author ≠ auditor** (Reviewer model ≠ Implementer model) holds by
  configuration on the fan-out where most tokens are spent.
* **Guided (main loop):** every command emits a one-line, never-blocking **model checkpoint** in
  its setup step when the phase's tier maps to a different model than the current session.

No `model:` frontmatter on commands and no installer changes. `/akili-audit` reports **Model
Registry Drift** (stale model names, dated pins where an alias exists, wrappers contradicting the
registry, and wrappers, `.agents/model-routing.json`, and the `## Model Routing` section disagreeing
after an `akili routing` run). See [model-routing.md](model-routing.md) for the tiers, principles, and the default
registry.

### 8. The Kaizen Loop

Other methodologies execute specs. **AKILI learns from every spec.**

AKILI embeds Kaizen (改善 — *kai* change, *zen* better) — continuous improvement through small, disciplined steps — as an executable
retrospective inside `/akili-archive`, powered by the packaged `kaizen` skill (authored by
Juan Carlos Cadavid — jcadavid.com, inspired by the Kaizen Institute glossary, Robert Maurer's small-steps method, and INTI's *Emprendiendo Kaizen*). Every `/akili-archive` automatically runs a bounded retrospective — no extra command, no extra ceremony. The loop runs in **two phases with two different homes**, so
parallel branches never contend for the same file.

```text
┌─────────┐    ┌─────────┐    ┌──────────────┐    ┌──────────┐
│ MEASURE │ ─▶ │  LEARN  │ ─▶ │ STANDARDIZE  │ ─▶ │  RECORD  │
│ rework, │    │ 0–3 root│    │ propose the  │    │ one entry│
│ pivots, │    │ -cause  │    │ 1–3 line edit│    │ file per │
│ bugs    │    │ lessons │    │ branch-gated │    │ spec     │
└─────────┘    └─────────┘    └──────────────┘    └──────────┘
   every /akili-archive, on any branch · docs/specs/kaizen/<slug>.md
                              │  pending items
                              ▼
                    ┌──────────────────────┐
                    │      APPLY MODE      │
                    │ HITL menu · approved │
                    │ edits · digest       │
                    └──────────────────────┘
   apply-capable branch · refreshes ## Active Lessons for the next spec
```

**Retrospective phase — any branch.** Every archive runs one bounded pass:

* **Measure:** hunt waste (MUDA) in the spec's own evidence — Reviewer rework attempts, pivots,
  PRODUCT_BUGs, severe judgment-day findings, validation WARN/FAIL, drift (the most recent
  `drift-*.md` report under `docs/specs/audits/`; a `security-*.md` index is not a drift source).
* **Learn:** distill 0–3 lessons, each with a named root cause and cited evidence (Gemba: real facts, never speculation). Generic lessons
  are banned; a clean spec records a one-line clean-run entry instead. A root cause that already
  exists becomes a `digest-update` pending item, never a duplicate lesson or a live digest edit.
* **Standardize:** propose one 1–3 line edit per lesson to constitution guides, `general-setup`
  templates, design tokens, or `.agents/` personas — small steps, never rewrites. The proposals are always presented for review;
  whether they are *written* is gated on the branch — **no shared file is edited from a spec
  branch, or from the default branch while an `Integration Branch:` pin exists, approved or not**,
  and on the apply-capable branch every such edit still requires approval.
* **Record:** write one entry file per spec at `docs/specs/kaizen/<safe-spec-slug>.md`, carrying the
  metrics, the lessons, the sub-threshold `## Noted, not a lesson` signals, and the pending-item
  queue. Two branches archiving in parallel produce two distinct files and zero conflicts.

**Apply phase — the apply-capable branch only** (the pinned integration branch when the
`Integration Branch:` pin exists, otherwise the default branch — never both). Reached through the
skill's **Apply Mode** ("apply pending kaizen standardizations"), offered automatically by
`/akili-archive` when it already runs there, and surfaced with its count and highest severity by
`/akili-resume`. It works the whole backlog through the approval menu, re-verifies each approved
item before writing it (closing a refuted one as `superseded` instead), applies what was approved,
allocates ADR numbers for `trd-adr` items at that moment, collects approved Methodology items into
one upstream report (flipping them to `upstreamed`), and refreshes `docs/specs/kaizen-log.md`'s
capped `## Active Lessons` digest (10 rows max, normalized first) — the only part other commands
read, and written by this phase alone.

Lessons target the **Product** (this project), the **Methodology** itself — recorded as a
`Kind: upstream` pending item on any branch, collected into one upstream report at apply time and
flipped to `upstreamed` — or both, so the methodology learns from every tool built with it. The
retrospective never blocks the archive. This is the meaning behind the name: *akili* is Swahili for intelligence, and intelligence that does not learn is not intelligence.

### 9. Skill Binding (Governance)

The packaged skills are curated under a three-level binding taxonomy (see `docs/skills/governance.md`),
which answers *when and how each skill loads*:

* **core** — hard-wired to a precise command step: `kaizen` in `/akili-archive`, `judgment-day` in
  `/akili-specify`'s Review Design gate, `cognitive-doc-design` for every human-facing document,
  `brainstorming` for exploration, `product-manager-toolkit` in `/akili-constitution`,
  `systematic-debugging` in bug flows, `seo-audit` in `/akili-seo`, `social-marketing` in `/akili-marketing`, `pr-review` in `/akili-review`.
* **conditional** — loaded when the work touches its domain: `ui-ux-pro-max` / `frontend-design` /
  `stitch-design` for UI work, `gsap-animation` for animation work, `video-production` for a spec whose Document Control records `Deliverable: video` (it stops at the availability gate when the environment-provided `hyperframes` router is missing).
* **stack** — framework/platform skills (`angular-developer`, `nestjs-expert`, `shadcn-ui`,
  `aws-serverless`, …) are never hardcoded into commands. `/akili-constitution` Step 8D writes a
  `## Skill Map` into the project's `AGENTS.md`/`CLAUDE.md` from the detected stack;
  `/akili-specify` derives each task's required skills from that map; the Leader passes them to the
  Implementer/Tester via dynamic skill loading.

Every skill preserves its original author and license; AKILI adaptation is recorded as `adapted-by`
in the skill frontmatter. Curation by Juan Carlos Cadavid — jcadavid.com.

### 10. Video Deliverables

A spec whose `Deliverable` is `video` runs the same lifecycle with video-specific gates. The packaged `video-production` skill bridges AKILI phases to HyperFrames, which you install yourself; the skill stops at its availability gate when HyperFrames is missing. Details: [video-production](skills/video-production.md).

* `/akili-propose` records `Deliverable: video` beside `Type`.
* `/akili-specify` runs in Video Mode.
* `/akili-test` plans a render evidence suite in place of unit and E2E suites.
* `/akili-validate` requires a final look at the draft render, then the delivery render.

### 11. Diagram Slots

Baseline and design documents carry named diagram slots. The packaged `diagram-design` skill fills each as inline Mermaid (canonical) and, when Archify is installed, links an interactive view. Archify is optional and user-installed; without it the slot stands as Mermaid. Details: [diagram-design](skills/diagram-design.md).

* `/akili-constitution` Steps 3-5 fill the PRD, UX/UI and TRD slots whose condition holds (the TRD's C4 Context and C4 Container are always filled).
* `/akili-specify` Step 2.1 fills `design.md` slots when the design is architecturally significant.
* `/akili-archive` Step 2 loads the skill only when the spec has a `diagrams/` folder or slot, to link the spec's views and list baseline slots the design made stale as follow-ups; it fills none.

## Methodology Contract

- **User-Facing Summaries:** All major commands (`/akili-propose`, `/akili-specify`, `/akili-execute`, `/akili-validate`, `/akili-test`, `/akili-constitution`) generate a short, digestible summary on the screen before proceeding to the next step, ensuring developers always understand what the agent just did.
- `/akili-constitution` establishes the project baseline docs (`docs/prd.md`, `docs/ux-ui/design.md`, `docs/trd/trd.md`, `docs/infrastructure.md`) and `docs/specs/general-setup/` templates, and scaffolds the project `.agents/` harness (Leader, Implementer, Reviewer, Tester).
- `/akili-propose` creates a lightweight proposal before full specification. Evaluates massive instructions for **Scope Chunking** to split work into manageable modules. Integrates with **Figma MCP** and **Jira MCP** to extract visual context, requirements, and user stories.
- `/akili-specify` must follow those templates when generating module specs. Enforces **Human-in-the-loop (HITL)** approval pauses after Requirements, Design, and Tasks. Promotes rigorous BDD scenarios (`BUT it must NOT`, `AND IT MUST`), allows blind adversarial design reviews via the `judgment-day` skill, outputs a final **Lines of Code (LOC) estimate** to recommend a safe Pull Request strategy, and explicitly injects **Design Impact** rules (from Figma contexts) into UI tasks and components.
- `/akili-execute` orchestrates a Leader → Implementer → Reviewer rework loop (max 3 retries) to implement tasks from an approved spec path.
- `/akili-test` runs a Leader → Tester(s) harness: the Leader partitions testing into suites and delegates each to a Tester subagent (inline for trivial/Lite work; one Tester per independent suite, in parallel, otherwise). It validates requirement-to-test traceability, explicitly checking for negative constraints and strict boundaries.
- `/akili-validate` audits implementation conformance against the spec (including rigorous boundary validations) and constitutional baseline.
- `/akili-archive` preserves completed specs under `docs/specs/archive/` after validation, runs the Kaizen retrospective (measure → learn → standardize → record) into one entry file at `docs/specs/kaizen/<safe-spec-slug>.md`, syncs agent guides (child `CLAUDE.md`/`AGENTS.md` + the parent `## Module Guides` index) from the spec's `## Constitution Impact` notes, and recommends a CodeGraph re-index. Off the apply-capable branch (a spec branch, or the default branch while an `Integration Branch:` pin exists) the guide, factual-sweep, and TRD/ADR edits are recorded as pending items instead of written, and applied later on the apply-capable branch.
- `/akili-security` operates outside the main spec lifecycle: it audits the repository with the `security-audit` skill, the only tracked repository content it writes is a redacted index under `docs/specs/audits/`, and hands confirmed findings to the Bug Track through `/akili-propose`. It never modifies target source or commits.
- `/akili-marketing` operates outside the main spec lifecycle: it drafts social marketing for LinkedIn, Instagram and Facebook as Markdown under `docs/marketing/` with the packaged `social-marketing` skill, and never publishes. See [the command page](commands/akili-marketing.md).
- `/akili-review` operates outside the main spec lifecycle: it reviews a pull request, a commit range or staged changes with the packaged `pr-review` skill, in a local run writes its review to a run directory outside the target, posts a PR comment only with `--comment` after a confirmation gate, and never edits, approves or blocks. See [the command page](commands/akili-review.md).
- `/akili-seo` operates outside the main spec lifecycle: it provisions Google Search Console ownership for a domain and produces a standalone SEO audit under `docs/specs/seo/<domain>/`. Run it any time after deployment; rerun after major content or schema changes.

**Provenance** (how this repository was first populated; not methodology rules):

- Commands were sourced from the current global Claude command setup.
- Skills were copied with their bundled references and helper assets.

## Host Assumptions

- The host Claude environment can ask follow-up questions to the user during command execution.
- The host environment can load local skills referenced by the commands.
- Repository-specific build, lint, and test commands should be preferred over hardcoded stack assumptions.
