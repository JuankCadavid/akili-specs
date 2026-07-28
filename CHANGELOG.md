# Changelog

All notable changes to this methodology repository should be documented in this file.

The format is inspired by Keep a Changelog and the repository follows semantic versioning in a lightweight way for methodology milestones.

## [Unreleased]

### Notes

- No unreleased changes yet.

## [2.17.5] - 2026-07-28

### Added

- **A wind-down protocol — the methodology could recover from a dead Leader but never helped one die well.** `/akili-resume` handles the pickup side (*"session break, accidental close"*), reading `execution.md` to rebuild the picture. Nothing handled the other side: a Leader approaching its context limit had no guidance at all, and it is the only party that can see its own budget. The asymmetry showed up in practice — a Leader out of tokens had to derive the right call unaided, correctly declining to issue a supervised dispatch it would not survive to receive. Judgment should not be required for something that predictable. `leader.md` gains **Winding down**, a *temporal* bound alongside the Delegation Ceiling's *width* bound: a rework loop is up to 3 attempts × (Implementer + Reviewer) — six delegated round trips plus adjudication — so opening one on little remaining context is not optimism but a task guaranteed to be abandoned mid-flight. The rules: finish or park what is in flight and stop starting new work; spend what remains on `execution.md`, because **the audit trail is the handoff**; park explicitly with `[~]` plus the full attempt history rather than stopping silently; and **never leave a supervised delegation outstanding** — a worker told to report to a coordinator who is gone produces work that may be complete and correct with nothing to record it, so transfer *ownership* instead (worker reports to the user) or park the task and let the next session re-spawn cleanly. Stated as the principle that ranks the trade-off: **an unwritten state is worse than an unfinished task** — an unfinished task with a complete audit trail is resumable; a finished task nobody recorded is work that will be redone. Referenced from `/akili-execute`'s loop guardrails.

### Fixed

- **The registry named which host to reach and never how to reach it.** *Cross-host dispatch* (2.17.1) told the Leader to launch a worker in another host without recording a single CLI invocation — an incomplete instruction that leaves the agent guessing a binary from a product name. Antigravity is the case that proves it: its CLI is **`agy`**, not `antigravity` or `ag`, and independent sessions have repeatedly concluded *the CLI does not exist* after searching the product name, then had to walk it back. That failure is the expensive kind — it does not error, it yields a confident wrong conclusion ("this host is unreachable") which then propagates into the plan, and it was observed being paid twice for the same fact. `docs/model-routing.md` now carries the invocation per host (`claude`, `opencode`, `agy`) and Step 8C records the confirmed values in the project registry. **Ask the user rather than probing the filesystem:** binaries vary with install method, live outside the repo, and one absent locally may simply not be installed *here* while the column stays valid for a teammate.
## [2.17.4] - 2026-07-28

### Added

- **The gate is now chosen against the defect classes the spec can produce.** `/akili-specify` Step 1.2 requires naming what this spec can get *wrong* before settling on verification commands, then mapping each class to the command that catches it. The failure it closes is quiet and expensive: a gate that reports green while the artifact is broken, so the Reviewer sees a passing verification and the task advances. Visual output is where it bites — `axe` cannot evaluate contrast over a rasterized image, and no automated checker distinguishes a *plausible but false* alt text from a true one, so an imagery spec gated on `npm test` + `axe` has no gate for its dominant defect class and a gate only for its rarest. A class with no automated check must be substituted (a human check at the HITL pause, or a phase routed to **T6 Multimodal** via *Cross-host dispatch*) or recorded as an accepted risk: an acknowledged blind spot is recoverable, an unacknowledged one consumes rework attempts. **The presence of *a* verification command is not coverage of the defects that matter.**
- **Design decisions that revert delivered behavior now get a cheap challenge — the Leader's design had no auditor.** New `/akili-specify` Step 2.3. `author ≠ auditor` covers the Implementer: the Reviewer audits its diff on a different model. Nothing covered the **Leader's own design**, which went from judgment straight to `tasks.md` — and a wrong design decision is never caught by a FAIL, because it gets *implemented correctly* and surfaces two rework rounds later as a cascade. The trigger is narrow (a DD that removes, disables or inverts something already shipped — a blend mode, fallback, guard, cache, retry) and the challenge is deliberately small: **one reviewer, one question, "what does removing this break?"** Not a `judgment-day` panel, which stays the opt-in whole-design pass. The Delegation Ceiling applies — it is a two-minute pass bought against two rework rounds and stops being worth it the moment it grows.
- **Specs now carry a budget, checked against the finished design.** New `/akili-specify` Step 2.4. Depth (`Lite`/`Standard`/`Full`) was chosen in Phase 0 — **before the design existed** — and never revisited, so a twenty-line swap could receive the machinery built for a fourteen-task chunk with nothing questioning it. `/akili-propose` already routes by size, but that also happens before the design; Step 2.4 is the re-check *after*, at the only point where the estimate is knowable and still free to act on. It states expected tasks, LOC and review rounds, offers to drop a level (or abandon the spec for `/akili-quick`) when the estimate lands far below the declared depth, and records the numbers in `design.md` as a **tripwire** — `/akili-execute` compares actuals and **stops and escalates** rather than continuing. Exceeding a budget is information, not failure; continuing past one silently is how mis-sizing becomes unrecoverable.
- **Review depth now scales to the diff, with a floor as well as a ceiling.** `reviewer.md` had a parallel-lens mode for large work and no lower bound, which produced an **excellent** eight-hundred-line review of a twenty-eight-line diff — nothing in it wrong, which is exactly why it was expensive: it reads as diligence while manufacturing downstream work out of a change too small to carry it, and the Leader then triages findings that cost more to process than the diff cost to write. Now **< 50 LOC** means one checklist pass reporting **only gate-blocking findings** with the `ADVISORY` block suppressed entirely, **50–200 LOC** the full four-lens sweep, **> 200 LOC** parallel lenses. Recorded with the reason: **thoroughness is not a constant to maximize but a budget to spend where the risk is** — treating a one-line token swap and a migration alike is not rigor, it is a failure to read the diff.
- **A concurrency protocol, because the checkout is a shared resource.** The Delegation Ceiling bounds how many workers a Leader spawns; nothing bounded how many **sessions** touch one working tree — a different axis, and the one whose damage no review can catch because it happens in the filesystem rather than the diff. Added to `leader.md` and scaffolded into project root guides by `/akili-constitution` Step 8 (it binds every session that opens the repo, including ones that never load a persona): **one AKILI session per checkout**, additional sessions on `git worktree` — the conflict case the 2.16.0 isolation rule names, now with its first empirical instance — and **never run a measurement command while a delegated agent is active**. The second is the one that gets broken, because measuring feels passive and is not: builds, benchmarks, Lighthouse and E2E compete for `node_modules`, ports, lockfiles and build output, so a measurement taken beside a running Implementer is not slow but **wrong**, and it surfaces as an inexplicable worker error rather than as the Leader's own action. Commit discipline is noted alongside it — under parallel sessions the message is the only surviving record of which session did what.

### Changed

- **An advisory can no longer grow the spec — only gate it, which it already could not.** `Advisory Never Gates` stopped advisories from causing FAILs, triggering rework, or consuming attempts, and named the escalation path. It said nothing about the **Leader minting a new task** from one, which is the other direction and the one that does the damage: a spec grew from three tasks to four mid-execution with no approval, and the added task carried the regression. The rule is now explicit that an advisory is **recorded and dies there** — no new task in the running spec, no widening of an existing task to absorb it. **A task absent from the approved `tasks.md` is scope the user never approved**, arriving with no requirement backing it, no design decision, and no budget line; advisories being the least-vetted findings of a run, that path grows scope fastest from the weakest evidence. An advisory that genuinely cannot wait is a **spec gap** — escalate via the Pivot Protocol so the user reopens the spec, which re-runs the budget and the approval gate instead of bypassing both. Mirrored into `AGENTS.md`, and it composes with the new reviewer floor: on a small diff advisories are suppressed at the source.
## [2.17.3] - 2026-07-28

### Added

- **Step 8E now says how to verify the Antigravity wrappers — the obvious check reports a false negative.** 2.17.2 generated the wrappers but named no way to confirm them, and the intuitive command misleads: **`agy agents` enumerates only global agents** (`~/.gemini/config/agents/`), takes no workspace flag, and never reports project-level ones — so an empty listing says nothing about wrappers correctly written under `.agents/agents/`. Confirmed by bisect: a wrapper that lists instantly from the global path stays invisible byte-for-byte identical in the workspace. Verification is in-session via **`/agents`**, and the step now states what a *correct* result looks like, because it reads like a failure: **only `akili-leader` appears.** That picker selects the primary agent, and Implementer / Reviewer / Tester carry `mainAgent: false` specifically to stay out of it — one entry is the success condition, four would mean the dispatch-only roles leaked into the main-agent picker.
- **Tool names must be confirmed against the installed binary, not the vendor's documentation.** Step 8E already warned that an unmapped tool name hangs the subagent silently; it now records where the bad names come from. Google's own published subagent example names `replace_file_content`, which is **absent from the shipped CLI** — so copying the vendor example verbatim is itself a way to hang the Reviewer. The confirmed read-only set used for the Reviewer wrapper is `view_file`, `grep_search`, `list_dir`; anything unverified means omitting `tools` and keeping the Reviewer read-only by instruction.
## [2.17.2] - 2026-07-27

### Fixed

- **Antigravity never saw the `.agents/` personas — the path was one level too shallow.** Antigravity discovers agents under **`.agents/agents/`** (`<name>.md` or `<name>/agent.md`), so the four personas AKILI writes to `.agents/<role>.md` were invisible to it: no error, no warning, the multi-agent loop simply ran unprimed. Step 8E now generates real Antigravity wrappers at `.agents/agents/akili-{leader,implementer,reviewer,tester}/agent.md`, thin as the other hosts' and pointing back at the same persona files. Two documentation claims were corrected alongside it — `/akili-constitution` and `docs/flow.md` both stated that Antigravity reads prompts *from `.agents/`*, which named the right mechanism (`invoke_subagent`) and the wrong location, and omitted that the wrapper must also carry **`subagent: true`** or the Leader can never reach it. `/akili-audit` gains a matching check, because every failure in this family is silent: a missing wrapper directory, a missing `subagent: true`, or a Reviewer without `mainAgent: false` all degrade the harness without erroring.
- **Antigravity does bind models per agent — the registry said it does not.** `docs/model-routing.md` recorded the host as having no per-agent model binding, and 2.17.1 refined that entry while keeping the false premise intact. The host supports `model: inherit | flash | pro` in wrapper frontmatter, so it has **full Step 8E enforcement** rather than guidance-only routing, plus three fields the other hosts have no equivalent for: `subagent`, `mainAgent`, and `tools`. **`tools` is the consequential one** — a per-agent allow-list turns the Reviewer's read-only role from an instruction into a restriction, so `author ≠ auditor` gains a second structural guarantee on this host: the auditor not only runs on a different model, it *cannot write*. Applied to the Reviewer alone and gated on confirmed tool names, since the vendor documents that an unmapped or misspelled name **hangs the subagent process** — a silent hang, not an error — so where names cannot be confirmed the field is omitted and the Reviewer stays read-only by instruction. The *Cross-host dispatch* section (2.17.1) listed this as a limitation only an external dispatcher could work around; it now carries the opposite lesson — confirm a stated limitation still holds before spawning across hosts to route around it, because this registry has been wrong about one.
## [2.17.1] - 2026-07-27

### Added

- **Lifecycle diagram in the README and `docs/flow.md`.** `assets/akili-flow.svg` (plus a PNG for npmjs.com, which does not reliably render external SVG) draws the methodology in the three shapes it actually has: `/akili-constitution` as a **one-time** foundation, the six-command **per-spec loop** with the Kaizen retrospective as an explicit back-edge into the next spec, and the four commands that run **outside** the loop at any time. Hand-authored rather than auto-laid-out — every generated attempt folded the chain into a 7:1 strip that a README cannot show without shrinking the labels past readability. Colour encodes the three phases (plan → build → close) and the caption carries the two invariants the boxes cannot: every step closes on a human approval gate, and `author ≠ auditor` is enforced at execute and test.
- **Antigravity is now a first-class column in the model registry.** v2.17.0 made it a CLI install target while the registry still carried two host columns, so a session running AKILI there had nothing to read — exactly the failure the *registry is host-complete* rule (2.16.0) exists to prevent, this time introduced by our own package. The column names **families** (Gemini Pro / Gemini Flash) rather than slugs on purpose: Antigravity's picker labels versions (`Gemini 3.6 Flash`) instead of exposing stable aliases, so the exact identifier is confirmed per project at Step 8C — the alias-first rule applied where no alias mechanism exists. **T6 Multimodal is the row that matters**, since it is the one tier where this column beats the other two, which is why the old *"prefer external Gemini"* note existed at all.
- **Environment-provided skills can enter the project `## Skill Map`.** A skill shipped by a *tool* rather than by AKILI — an agent orchestrator's coordination skill is the standing example — now has a documented home, with three rules in `docs/skills/governance.md`. **Never vendor one into `.claude/skills/`:** these stubs are deliberately thin because the tool's own binary serves the version-matched guide, so a copied one goes stale on the next tool release and then instructs agents to call flags that no longer exist. **Availability is per-developer, not per-project:** the Skill Map is committed and shared, so the row records *what to use when present*, never an assumption that it is — every command must still complete without it. **Attribution stays with the author.** Step 8D scaffolds such rows only after asking the user, never by inferring from the filesystem, and the packaged `leader.md` gains the matching consumer section: what a cross-host dispatch is worth (a real capability gap, or independent tasks already cleared by the Delegation Thresholds), that the Delegation Ceiling binds a cross-host worker exactly as it binds a local one, that the *fleet* pattern of racing several agents at one task violates the ceiling's first rule by design, and that an absent skill is a one-line note followed by native execution — never a blocker.

### Changed

- **The host column is a property of the dispatch, not of the session — and that reorders the fallback rule.** Everything in `docs/model-routing.md` assumed **one active host per session**: you are in Claude Code, so you read the Claude Code column. Agent orchestrators break that assumption — a coordinator in one host can launch a worker in another, hand it a task, and wait for a structured completion message. The new **Cross-host dispatch** section records the consequence: a coordinator reads **its own** column for its own reasoning and the **worker's** column when deciding where to send work; the columns are not alternatives chosen at install time but doors that are all open at once. The `Fallback` column was written for a closed host (*if the right model is not here, degrade to a lesser one here*); with a dispatcher that inverts to **reach across hosts before degrading within one**. This resolves two dead ends that were consequences of the closed-host assumption rather than real limits: **T6**'s *"prefer external Gemini"* was advice with no way to act on it and becomes a route, and **Antigravity** was recorded as *"not supported"* because `invoke_subagent` cannot bind a model per agent — but an external dispatcher never calls `invoke_subagent`, it launches the `agy` CLI as a worker, where the invocation *is* the binding. Guarded on both sides: a cross-host spawn costs a fresh context and is justified by a real capability gap, never a one-tier difference; and the tier definitions, `author ≠ auditor`, and the Delegation Ceiling all bind a cross-host worker unchanged — if anything independence improves, since a worker in another host runs different weights by construction. The **model checkpoint now has three outcomes, not two** (switch the session model, continue as-is, or dispatch the phase), inherited by all 11 commands through the registry section they already read — no per-command edits, and Step 8C scaffolds the routing *preference* while never naming a dispatcher, since orchestrator availability is a property of the developer's machine and naming a tool would date the registry and couple the project to it.

### Fixed

- **Documentation aligned to three supported hosts.** `docs/README.md`, `docs/flow.md`, `docs/commands/akili-constitution.md`, the README's Docs index, and the `/akili-constitution` verification checklist all still described model routing as spanning "Claude Code and OpenCode" after Antigravity became an install target. The checklist mattered most: it enumerated the hosts a registry must carry, so it would have passed a registry that dropped the Antigravity column — the same class of silent gap it was written to catch.
## [2.17.0] - 2026-07-27

### Added

- **Google Antigravity command skills support.** Commands in `.claude/commands/` now include `name:` in their YAML frontmatter, and `bin/akili.js` automatically installs commands as structured skills (`~/.gemini/config/skills/akili-<cmd>/SKILL.md`, `~/.gemini/skills/akili-<cmd>/SKILL.md`, and `~/.gemini/antigravity-cli/skills/akili-<cmd>/SKILL.md`) in addition to workflows when targeting Google Antigravity. This enables Google Antigravity IDE and CLI to auto-discover and list all AKILI commands as available skills.

### Fixed

- **`/akili-constitution` Step 8B no longer copies the same project context into all four personas.** The Legacy-mode instruction read *"customize **them** … inject detected design-token paths, the test command, the lint command, framework conventions, and any directory boundaries discovered"* — one list, four files, and only a subordinate clause afterwards narrowing two of them. Read literally, it writes the whole bundle into every persona, which is what it did in practice. It replaces a shared bundle with an explicit **Injection scope** table mapping each scanned fact to the personas whose role actually consumes it. The defect is not untidiness: (1) the instruction **contradicted the template it was copying** — `tester.md` states it does *not* audit design-token conformance, yet received the token path; (2) personas are re-read on **every** subagent spawn, so a redundant injection is paid on every task of every spec rather than once at scaffold time; (3) each extra copy is a place to drift, so changing the test command later leaves three personas describing one that no longer exists; and (4) irrelevant context competes with relevant context at read time. Records the row most often dropped in the other direction — the Leader gets no injections at all because it writes no code, when it specifically needs **directory boundaries** to judge whether two tasks may run in parallel (the concurrent-writers rule corrected in 2.16.0). A verification-checklist row settles it with two spot-checks: no token path in `tester.md`, directory boundaries present in `leader.md`.
- **`/akili-audit` gains a `Persona injection bleed` drift check, so the Step 8B fix reaches projects that already exist.** Safe Update mode never overwrites an existing `.agents/*.md`, so a project scaffolded before the injection-scope table would keep its bloated personas indefinitely and the fix above would only ever help new scaffolds. The check flags context repeated across all four personas, using the same two tells as the checklist, and — like every drift check — reports rather than edits: remediation is a manual trim. Surfaced by an external duplicate-file audit run against a real AKILI project, which flagged the four `.agents/` prompts before we did.
## [2.16.0] - 2026-07-26

### Added

- **Two new `/akili-audit` drift checks for the registry.** **Missing host column (high impact)** — flags a registry carrying fewer host columns than the packaged default, names the defaults that would restore it, and states the fix is placeholders rather than a deleted column. **Tier/model mismatch** — flags a model sitting in a tier whose dominant demand it does not serve: a small-context model in T4 Context-Ingest, a non-vision model in T6 Multimodal, a slow deep-reasoner in the high-volume T2 fan-out, or T2 and T3 collapsing to the same model (breaking `author ≠ auditor`). Found in the wild as **adjacent tiers swapped with each other**, which is why the check compares entries against the tier definitions and the *Why these models* rationale rather than against slugs alone — a registry can be perfectly well-formed and still route a phase to a model that cannot do the job.
- **Planning layers documented as a distinct routing concern.** `docs/model-routing.md` now records that tools which orchestrate *other* agents (a planner or task workspace that delegates to Claude Code, OpenCode, or similar) sit **above** the registry rather than beside it: they choose which host executes, and that host's column applies unchanged because AKILI's artifacts are plain Markdown the delegated agent reads from the repo. A column is added only for a host that runs the agent itself. Includes the caveat to verify per tool — if the layer's own planning phase does not read `AGENTS.md` / `CLAUDE.md`, project context only reaches the work once the delegated agent starts.
- **`docs/slack-notifications.md` — webhook setup, rotation, and troubleshooting.** Step-by-step creation of the Slack incoming webhook, how to store it without leaking it, how to rotate it, how to point at a different channel, and the two documented extension points for adding a **second** channel (one secret holding a comma-separated list vs. one secret per channel, with the trade-off stated). Records the credential-handling rules learned the hard way: a webhook URL is a bearer credential, `gh secret set --body "<url>"` puts it in shell history, and a mistyped `gh secret set <url>` sends it to the GitHub API as a URL path where it lands in request logs — so **revoking in Slack**, not overwriting the secret, is what actually invalidates a leaked URL. The troubleshooting table leads with the non-obvious failure: **a green workflow run is not proof the message arrived**, because the script exits `0` when the secret is unset by design. Linked from `docs/README.md`, and the release checklist now points here instead of duplicating the setup.
- **Slack release notifications.** New `scripts/notify-slack.js` + `.github/workflows/release-notify.yml` post a release summary to a Slack channel. The workflow fires on **`release: published`** — the last step of the flow, *after* `npm publish` — rather than on tag push, so a release that never reached npm is never announced. The summary is built from `releases/vX.Y.Z.md`, the same notes attached to the GitHub Release, so Slack can never disagree with what shipped: it digests each `### Added` / `### Changed` / `### Fixed` section down to the **bold headline** of every bullet (the repo's changelog convention) and links out for detail, keeping the message inside Slack's 3000-character-per-block limit instead of truncating mid-word. Legacy pre-2.x entries that predate the headline convention fall back to the bullet text, capped per bullet so one long entry cannot consume the section budget. **The webhook is never committed** — it lives in the `SLACK_WEBHOOK_URL` repository secret, and the script exits 0 when it is unset so forks and unconfigured clones do not get failed release runs. Preview locally with `npm run notify:slack -- --dry-run`, re-send from the Actions tab via *Release Notify → Run workflow*. Setup and verification steps added to `docs/release-checklist.md`.

### Changed

- **Worktree isolation is a conflict remedy, not a parallelism mechanism.** The `Delegation Thresholds` row governing concurrent writers read *"use isolated worktrees where the tool supports them"*, prescribing the expensive mechanism as the default for any parallel work. It now reads that a separate worktree is for **concrete file conflicts, not for parallelism itself**, with a note stating the rule from both directions — *parallelize only where there is no conflict*, and *isolate only where there is one*. Both halves are load-bearing: two Implementers on genuinely independent files share the working tree safely and should, because a separate checkout costs a fresh install, a fresh build, a merge to reconcile, and it splits the audit trail the Leader owns. Isolation earns its cost when tasks genuinely collide on the same files, when one rewrites shared state another reads, or when a task must be abandoned wholesale without contaminating the branch. Corrected after checking the rule against a shipping fleet orchestrator (Orca), whose own agent guidance reaches the identical conclusion from the opposite direction: *"For parallel work, create one fresh agent terminal per worker in the same required worktree… Independent tasks, parallel execution, convenience, or a preference for separate checkouts are not isolation requirements."*

### Fixed

- **`/akili-constitution` now verifies its own output — a skipped scaffold step no longer passes silently.** The command had **no `## Verification Checklist`**, and its Step 9 summary enumerated the PRD, UX/UI design, TRD, infrastructure and `.agents/` state but **never mentioned Model Routing, the Skill Map, or the Step 8E wrappers**. The `## Outcome` section required the registry; nothing checked or reported it. Net effect: Step 8C could be skipped — or its table printed to the conversation without ever being written to the root guides — and the run still closed as a success. Adds a verification checklist covering the baseline docs, `.agents/`, **a `## Model Routing` section in `AGENTS.md` *and* `CLAUDE.md`** (both files; `docs/model-routing.md` is the packaged reference and deliberately not copied into projects), host-column completeness, the six tiers plus effort dial, the Skill Map, and Safe Update's no-overwrite guarantee. Step 9 now reports the registry, Skill Map and wrappers explicitly — including which host columns were written and which `<CONFIRM SLUG>` placeholders were left — and must report a **skipped** step as plainly as one that ran.
- **The model registry is now host-complete — a registry scaffolded from one tool no longer drops the other host's column.** Step 8C specified the columns but never said *emit every host, including the ones you are not running in*, so a `/akili-constitution` run from OpenCode could produce a `Tier | OpenCode | Fallback` table with the Claude Code column deleted. **The registry belongs to the project, not to the session that scaffolded it**: the repo outlives any one tool, gets reopened in a different host, and gets handed to teammates who use something else — so a dropped column leaves the next session with nothing to read and silently breaks its Step 8E wrappers and every command's model checkpoint. An unknown roster is now explicitly a `<CONFIRM SLUG>` placeholder, **never a deleted column**. Safe Update mode treats a missing host column as a gap it restores (with packaged defaults or placeholders) while leaving every existing value untouched, and the model-confirmation step now asks about both hosts even when the user is visibly working in only one. Mirrored as a Cross-Tool Safety rule in `docs/model-routing.md`.
## [2.15.0] - 2026-07-26

### Added

- **GEO (Generative Engine Optimization) in `seo-audit` — visibility inside AI answers, grounded in measured evidence.** New `## Generative Engine Optimization (GEO)` section plus a `references/geo.md` evidence file following the same claims-plus-sources convention as `international-seo.md`. The headline finding, from the peer-reviewed GEO study (Aggarwal et al., **KDD 2024**, GEO-bench: ~10,000 queries across nine datasets), is that **the largest gains come from evidence, not markup**: adding verifiable statistics, credible quotations, and outbound citations each yields ~30–40%, fluency/readability ~15–30%, and **keyword stuffing is negligible or negative**. Gains are largest for content that ranks but does not dominate (up to **+115.1%** at position 5 — the "Equalizer Effect"), which is most audit subjects. Also documented: **passage-level extraction** and the resulting **self-containment test** (a paragraph must survive being lifted out of the page — anaphora like "this approach" breaks extraction, and no classic on-page check catches it), definitional sentences, entity resolution, freshness weighting, and the structured-data citation correlation (65% of AI-Mode-cited pages, 71% of ChatGPT-cited pages) explicitly labelled as correlation, not causation. Every claim carries a `[PRIMARY]` / `[INDUSTRY]` **source tier**, and findings must carry that tier forward so an industry estimate is never presented to a client as measured fact. Wired into `/akili-seo` as **Step 2.8** with a matching report section and verification-checklist rows.
- **AI-crawler directive auditing.** The `Robots.txt` checks now separate **training** agents (`GPTBot`, `ClaudeBot`, `Google-Extended`) from **retrieval** agents (`OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`) and user-triggered fetchers. The consequential finding: **a blanket AI-bot block removes the site from AI answers as well as from training corpora** — a state many sites are in by accident. Records that `Google-Extended` is a robots.txt token that never appears in logs (so auditing for it there always yields a false negative) and that blocking it does not affect `Googlebot` or AI Overviews, and that robots.txt is advisory — where the requirement is genuine prevention, escalate to WAF/bot management.
- **Structured Data audit section** — a real gap: the skill previously explained *how to detect* schema (the JS-injection limitation) but had no checklist for auditing it. Adds per-purpose type selection, validation, the visible-content match requirement (invisible or contradictory markup is a spam-policy violation, not an optimization), truthful `dateModified`, `sameAs` entity nodes, and consistent `@id` graph wiring. Closes the upstream `schema` sibling-skill gap in-skill.

### Changed

- **Engagement metrics rewritten from ranking factors to diagnostics — correcting a myth the skill propagated.** The `User Engagement Signals` section listed time on page, bounce rate, pages per session, and return visits as things to audit, implying they are ranking factors. Google has denied this for roughly a decade (Mueller: *"We don't use bounce rate in search rankings"*; Illyes: *"we don't use analytics/bounce rate in search ranking"*). The section now states that plainly, **bans findings of the form "improve bounce rate to improve rankings"** as a causal claim Google has explicitly denied that damages the credibility of correct findings beside it, and reframes each metric as a diagnostic that localizes a content problem whose fix is the content.
- **`Disallow` is not `noindex`.** New robots.txt check for one of the most consequential confusions in technical SEO: a disallowed URL can still be indexed from external links and surfaces as "Indexed, though blocked by robots.txt"; removing a page from the index requires *allowing* the crawl and serving `noindex`, and a `noindex` line inside `robots.txt` is unsupported and ignored.
- **`llms.txt` is explicitly ruled out as a visibility tactic, against prevailing advice.** Evidence: ~8.7% adoption of the top 1,000 domains (June 2026), ~40% of existing files are empty plugin stubs, no major AI crawler has committed to consuming the format, crawler-log analyses show the retrieval agents skip it and crawl HTML directly, and in one citation-frequency model **removing the variable improved prediction accuracy** — it contributed noise. Both the skill and `/akili-seo` now list "missing `llms.txt`" as a finding that must **not** be raised, while noting the format's legitimate use as business-to-agent context for IDE agents and MCP servers — a developer-experience call, not a search one.
- **`seo-audit` priority order gains an explicit GEO boundary.** GEO is a layer applied on top of ranking, not a sixth priority: roughly three quarters of AI Overview citations come from pages already in the top 10, so a GEO fix never displaces a classic-SEO fix, and GEO items rank below blocking classic findings in the remediation plan. Skill version 2.0.0 → 2.1.0; trigger keywords extended (AI Overviews, AI search, GEO, answer engine optimization, `llms.txt`, GPTBot, ClaudeBot); upstream `schema`/`ai-seo` sibling-gap note updated now that both are covered in-skill.
## [2.14.0] - 2026-07-25

### Added

- **Delegation Ceiling — the missing upper bound on orchestrator fan-out.** The `Delegation Thresholds` table added in 2.13.0 is a *floor* (when delegating is mandatory); frontier models increasingly err in the opposite direction, reaching for subagents freely, so the packaged `leader.md` gains a **Delegation Ceiling** section: one subagent beats several for a single modest task (parallelism is for independent tracks, never for slicing one task), **commit to the delegation** (never re-derive a subagent's result), brief precisely on the first spawn (launch → wait → re-brief burns a context cycle), bounded fan-out, and **never delegate your own verification**. The section carries an explicit carve-out: *the Implementer → Reviewer gate is `author ≠ auditor` independence, not self-verification, and is never collapsed for efficiency* — without it, a ceiling rule banning "subagents to double-check yourself" reads as license to drop the Reviewer. Referenced from `/akili-execute` and scaffolded via `/akili-constitution` Step 8B. Leader Instruction #2 now bounds parallelism by the count of genuinely independent tasks in `tasks.md`.
- **Implementer scope discipline is now bidirectional, with a `Not Done / Assumptions` report field.** Instruction #2 only guarded against scope *creep*; current-generation models also expand scope and can report completion on partial work. It becomes **Scope Discipline (Both Directions)**: don't widen (no unrequested refactors, abstractions, or impossible-case error handling), **don't narrow either** (finish the whole task at the intended scope), **report completion only when actually complete**, and when the task as specified looks wrong, say so in a sentence but still deliver it as written — changing the spec is the Leader's Pivot Protocol call. The completion report gains an optional field 4 (**omitted entirely when the task is clean**) naming what was not delivered and any judgment call made; `leader.md`'s orchestration sequence consumes it — a task carrying an outstanding gap never reaches `[x]`, even on a Reviewer `PASS`.
- **Model Generation Drift check in `/akili-audit`.** Aliases absorb a new model generation silently, so the registry can be current while everything calibrated around it has gone stale. The new check flags (report-only, as with all drift checks): a **frontier escalation pin** whose recorded reason predates the current `opus` generation; an `Updated:` stamp older than the current generation (effort defaults never swept); and `.agents/*.md` personas missing guardrails the packaged templates have since gained (Delegation Ceiling, bidirectional Scope Discipline).

### Changed

- **Effort dial re-baselined as a per-generation calibration, not a constant.** `docs/model-routing.md` now states the split explicitly: the tier mapping survives model churn, **effort defaults do not**. AKILI's defaults (T2 Implementer `medium`) are calibrated for its shape — tasks arrive *already decomposed and spec-bounded* from `/akili-specify` — whereas vendor guidance for a frontier model is written for one open-ended agentic request with no spec, and therefore starts higher (Claude Opus 5's published starting points are `xhigh` for coding/agentic, `high` elsewhere, then sweep down). The reconciliation is three rules: **sweep don't assume** (run a real spec at `medium`/`high`/`xhigh` on every generation and keep the cheapest level whose Reviewer outcome holds), newer generations get *more* out of the low end so the sweep usually confirms `medium`, and an **under-specified task** (a `[~]` resume with thin `execution.md` context, or a post-Pivot retry) starts one level higher because it resembles the open-ended case. New **Opus specifics** paragraph (start high and iterate *down* — more effort up front reduces total turns on agentic work; the rework bump is the cheapest place to spend effort since it only fires after a failure). Mirrored into the `/akili-constitution` Step 8C scaffold as items (e) and (f).
- **Effort is not a verbosity dial.** New explicit rule in `docs/model-routing.md` and the Step 8C scaffold: on current-generation models, lowering effort does **not** reliably shorten user-facing output — it changes how much the model *thinks*, not how much it *writes*. Long Implementer reports and Leader narration are fixed in the brief (`caveman` for transient agent output, `cognitive-doc-design` for artifacts), never by dropping effort, which otherwise buys verbose output *and* shallower reasoning. The `tier ↔ effort` illustration is now labelled as generation-specific data supporting a generation-stable rule.
- **Frontier escalation tier corrected and repositioned.** The section claimed Fable carries *"a refusal classifier Opus does not"* — no longer true: current-generation Opus ships elevated bio/cyber safeguards of its own and can decline a request outright. That claim is removed from the Fable-only constraints list (which keeps no-ZDR, minutes-long turns, and less-prescriptive prompting) and replaced by a methodology-level rule: a declined security-adjacent task is a **Pivot Protocol** case recorded in `execution.md`, **never a Reviewer `FAIL` to be reworked** — rework cannot fix a refusal. The tier is also repositioned as a **decision to re-justify on every generation** rather than a standing configuration, since each Opus generation narrows the gap the pin was bought to close: try the alias at `xhigh`/`max` first.
- **Rate limits documented as per-generation, not per-family.** `docs/model-routing.md` and the `/akili-constitution` Step 8C model-confirmation step now record that a new top-tier generation draws on its **own** quota rather than inheriting the previous generation's pool, so moving T1/T3 onto it neither frees headroom on the old pool nor inherits it. The "reserve the top tier for T1/T3" rule is unchanged — it is about where the budget earns its cost, not which pool it comes from.

### Notes

- **The model registry itself required zero edits for the Opus 5 release** — the `opus` alias resolved to it automatically and T1/T3 followed, which is the first row of the *Replacing a model* runbook (*do nothing*). This is recorded in `docs/model-routing.md` as a worked example of the alias-first rule, alongside the corollary this release makes explicit: what a new generation *does* invalidate is the per-task effort calibration and the prompt-level guardrails, not the tier mapping.
## [2.13.1] - 2026-07-24

### Added

- **Local Environment contract — the constitutional baseline now captures how to start the local stack.** `/akili-constitution` Step 6 evolves `docs/infrastructure.md` from a deployment-only blueprint into an environments blueprint (laptop → PROD): new **Step 6B** scaffolds a `## Local Environment` section as a **contract, not a tool** — Docker Compose as the recommended primary route plus a mandatory no-Docker fallback, a pre-check (e.g. `docker info`; on failure offer to start Docker or use the fallback, never block silently), seed/reset commands, health check, and URLs/ports. Legacy projects derive the contract from evidence (compose files, `package.json` scripts); brand-new projects are offered a dev compose scaffold. The section records the **boundary rule**: the local environment is disposable (agents may start/seed/reset it freely) while cloud/PROD deployments stay governed by the blueprint's components/IaC/CI-CD sections and are never improvised by agents. Consumers: `/akili-execute` Step 2.1 (environment-dependent verification consults the contract and runs the pre-check before spawning the Implementer), `/akili-test` Phase 1 (integration/E2E context slices carry the contract; pre-check resolves at planning time, not mid-suite), `/akili-validate` Phase 3 (optional boot smoke — boot failure FAIL, missing contract WARN), and the Step 8 root guides point agents at the contract. Design recorded in `docs/plans/2026-07-24-local-environment-contract.md`.
## [2.13.0] - 2026-07-24

### Added

- **Delegation Thresholds — quantified inline-vs-delegate rules for orchestrating agents.** New *Delegation Thresholds* section in the packaged `leader.md` persona (single source of truth): inline only for 1-file checks and puntual verifications; research reading **4+ full files** → spawn a scout/Explore subagent; writing **2+ non-trivial files** → Implementer; tests/builds → subagent; diff review → fresh-context Reviewer; parallel writers only for fully independent tasks. CodeGraph lookups explicitly do **not** count toward the read threshold. Referenced from `/akili-execute` (Leader's own research), `/akili-specify` (Explore steps), `/akili-constitution` (legacy-project analysis), and `/akili-audit` (codebase scan, per-area scouts). Inspired by the convergent `gentle-ai` orchestrator→minion pattern; design recorded in `docs/plans/2026-07-24-delegation-thresholds-review-lenses.md`.
- **4R execution review lenses (readability, reliability, resilience, risk) — advisory layer on the Reviewer.** The packaged `reviewer.md` persona now sweeps the diff through four lenses after the spec-conformance audit; findings that are not spec violations return in a new `ADVISORY` block that is recorded in `execution.md` but **never gates**: spec conformance remains the only PASS/FAIL gate, and advisory findings never consume rework attempts (new *Advisory Never Gates* guardrail in `/akili-execute`). Mode is selected by the existing effort dial — single Reviewer with lens checklist by default; **parallel lens-scoped Reviewers** at `xhigh`/`max` effort or on security/migration/data-loss surfaces, with the Leader adjudicating lens FAIL scope before consuming an attempt. `/akili-validate` Phase 5 runs the same 4R sweep as advisory report content and carries forward unresolved `ADVISORY` findings from `execution.md`.

### Fixed

- **`akili update` now works for pnpm installations.** The updater previously hardcoded npm: detection probed only `npm list`, so a `pnpm add -g akili-specs` install was misdetected as an ephemeral npx run and told to reinstall with npm (and would have created a duplicate npm-managed copy). `detectInstallType()` now probes both npm and pnpm trees (preferring the manager that invoked the process via `npm_config_user_agent`), the update runs the matching command (`pnpm add -g akili-specs@latest` / local equivalent), and the post-update changelog resolution uses the owning manager's `root`. README and `docs/cli.md` document the pnpm equivalents (`pnpm dlx`, `pnpm add -g` + one-time `pnpm setup`).
## [2.12.0] - 2026-07-24

### Changed

- **Methodology audit — effort dial and Leader authority propagated to their remaining surfaces.** A four-front audit (commands, personas, skills governance, docs coherence) after v2.11.0 found the new capabilities had landed in `/akili-execute` but not its siblings. Fixed: **(a)** `/akili-constitution` Step 8C now scaffolds the **Effort dial** into each project's `## Model Routing` (item 6: effort-by-signal table, per-role defaults, rework escalation, tier↔effort rule) — previously `/akili-execute` referenced a section fresh projects never had; **(b)** `/akili-test` gains per-suite **effort selection** (Phase 1), **effort escalation on the Tester inner loop**, and the same active skill-selection authority as execute; **(c)** worker personas now acknowledge the dial — `implementer.md`/`tester.md` honor the Leader's effort brief (and state the Leader's skill assignment supersedes the task list), `reviewer.md` states its default effort `high`; **(d)** `leader.md` gains a **"When Orchestrating `/akili-test`"** section (was execute-only — never mentioned Testers or author ≠ tester); **(e)** Step 8E adds the missing **OpenCode tester wrapper default** (`opencode-go/deepseek-v4-flash` — the T2 *fallback* rather than the primary, so the Tester lands on a different model than the Implementer) plus a soft author ≠ tester guard in Rule 1.
- **Command-consistency fixes from the audit.** `/akili-resume` gains the standardized model checkpoint every sibling has, and joins the phase→tier table as an explicit T5 row; `/akili-audit`'s checkpoint now surfaces `opus` for the T3 drift-judging portion (it only named the T4 scan model); `cognitive-doc-design` is now cited by all five report-producing commands that lacked it (`propose`/`audit`/`seo`/`validate`/`test`); `/akili-quick` gains the `docs/system-design/design.md` legacy fallback every other design-reader carries.
- **Skills governance: rule-vs-practice contradiction resolved with documented carve-outs.** The absolute "stack skills never hard-referenced in command text" rule contradicted four command sites. `governance.md` now distinguishes **load-directing** (violation) from three carve-outs: the constitution's candidate-pool/bootstrap lists, no-map fallback lists that defer to the Skill Map first, and Skill-Map-deferring illustrative examples. The two genuine violations were purged: `/akili-validate` and `/akili-test` now point stack-skill selection at the project `## Skill Map` instead of fixed lists. `docs/skills/README.md` aligned.
- **Skill attribution completed.** `react-doctor` (`license: MIT`) and `stitch-design` (`license: Apache-2.0`) — both verified against their upstream repositories; `shadcn-ui`'s off-schema `curated-by` normalized to `adapted-by` with an explicit unverified-license warning.
- **Stale docs corrected.** `README.md` no longer claims fast/cheap models handle the tasks split (the exact belief v2.11.0 reversed — now: deep reasoning for propose/specify incl. `tasks.md`/validate/Leader, fast/cheap only for archive+formatting, plus the Effort dial); README and `docs/cli.md` now document the v2.10.1 installer **auto-detect** behavior (bare `install`/`update`/`doctor` act on all installed targets); README's Contents lists all 22 skills (added `caveman`, `software-architect`); `docs/commands/README.md` includes Antigravity; `model-routing.md` wording fix ("the strongest open models").
## [2.11.0] - 2026-07-24

### Changed

- **`/akili-specify` → `tasks.md` decomposition promoted T5 → T1.** Task decomposition was mapped to T5 Fast-Cheap ("fast structured partitioning into tickets") — the same category error as the old T5 Leader: it treats *not writing prose* as *not requiring reasoning*. Breaking a design into executable tasks with correct boundaries, dependencies, and scope is where the spec becomes executable; a bad decomposition poisons every downstream Implementer (the master builder's blueprint). It is now **T1**, consistent with `requirements.md`/`design.md` (already T1) — low-volume, high-leverage, deep-reasoner work. Updated `docs/model-routing.md` (phase mapping, guiding principles, "Why these models", effort dial, per-tool apply), `docs/flow.md`, the `/akili-specify` Phase-3 model checkpoint, and the `/akili-constitution` scaffold description. `haiku`/T5 now scopes to `/akili-archive` and pure setup/formatting only.
- **Registry refreshed against current benchmark data.** T2 Coder (OpenCode) bumped `opencode-go/glm-5.1` → `opencode-go/glm-5.2` (A-tier, 753B, GPQA 91.2) — a second worked example of the *Replacing a model* runbook; T2's cheap fallback set to `opencode-go/deepseek-v4-flash` (A-tier, $0.14/$0.28, SWE-bench 79.0). "Why these models" now cites real numbers (Kimi K3 S-tier but ~33 tok/s — fine for the low-volume T1 Leader/architect, never T2; DeepSeek V4 Pro SWE 80.6 / Terminal-Bench 67.9; Qwen3.7 Max ~46 intelligence, kept as the best-effort T6 open option with external Gemini 3.1 Pro / Claude Sonnet preferred for real vision). Updated `docs/model-routing.md` and the `/akili-constitution` Step 8E OpenCode implementer wrapper default.
- **OpenCode T1 Architect re-mapped to Kimi K3.** The OpenCode Go column now anchors T1 (Architect + the execute/test Leader) on `opencode-go/kimi-k3`, with the previous `opencode-go/kimi-k2.6` demoted to the T1 fallback — a worked application of the *Replacing a model* runbook (edit the registry row → reconcile the Step 8E OpenCode leader wrapper default → `/akili-audit`). Updated `docs/model-routing.md` (registry table, "Why these models", per-tool apply guidance) and the `/akili-constitution` Step 8E OpenCode wrapper default. Kimi K3 is a concrete slug with no alias — confirm it against your own OpenCode roster.
- **Leader/orchestrator promoted to the deep-reasoning tier (T1), with runtime skill-selection authority.** Model Routing previously mapped the `/akili-execute` and `/akili-test` **Leader** to **T5 Fast-Cheap** (`haiku`) on the rationale "orchestration / instruction-following — writes no code." That conflated *not producing an artifact* with *not requiring reasoning*: the orchestrator makes the run's highest-leverage calls — how to decompose, which skill each worker loads, whether a Reviewer FAIL means rework or escalation, and when to pivot. These are low-volume, high-leverage decisions (the master builder directing the site), so a frontier model there is cheap insurance. The Leader is now **T1** across `docs/model-routing.md` (tier definition, phase→tier mapping, model-selection rationale, and per-tool apply guidance for Claude Code and OpenCode), the `/akili-execute` and `/akili-test` **model checkpoints** (which now recommend `/model opus` for the Leader session instead of `/model haiku`), and the `.agents/leader.md` persona. `haiku`/T5 stays scoped to the genuinely mechanical steps — the `tasks.md` partition and `/akili-archive` — and the Implementer (T2) / Reviewer (T3) tiers and `author ≠ auditor` rule are unchanged. No new tier was added: T1's definition was broadened to include live orchestration judgment (per the registry's anti-proliferation rule).
- **Leader skill selection is now active, not pass-through.** The Leader's delegation discipline (`.agents/leader.md` Instruction #3 and `/akili-execute` Spawn-Implementer step) changed from "extract the task's recommended skills, fall back to the `## Skill Map` when none" to **the Leader selecting the optimal skill set for each task at runtime** — treating the task's list and the Skill Map as defaults it may augment, narrow, or override with a one-line reason recorded in `execution.md`. Task-time skill assignment still stands; this adds Leader authority to act on it during execution.

### Added

- **Effort dial — second routing dimension in `docs/model-routing.md`, with Leader authority.** The registry picks the *tier* (which model); effort is the orthogonal, **per-task** dial for how hard that model thinks. New "Effort dial" section documents: the empirically steep intelligence↔cost curve (a representative ladder shows `max` → `medium` loses ~8% intelligence for ~70% cost — so `medium`/`high` is the value sweet spot, `xhigh`/`max` reserved for genuinely hard work); an effort policy by task signal (trivial → `low`, complex → `xhigh`, correctness-critical → `max`); default effort by role; **escalate effort one level on every rework attempt**; the **tier ↔ effort interaction** (don't `max` a cheaper tier — Sonnet 5 at `max` approaches Opus 4.8's price for less intelligence; escalate the tier instead); and Sonnet specifics (respects effort strictly — raise it rather than prompt around shallow reasoning; give `max_tokens` headroom at `xhigh`/`max`). Wired into the Leader's authority: `.agents/leader.md` (Instruction #3 now "Active Skill + Effort Selection" plus effort-bump on rework in the guardrails) and `/akili-execute` (Spawn-Implementer effort selection + effort bump in the rework loop).
- **Frontier escalation tier (Fable 5 / Mythos 5) in `docs/model-routing.md`.** A new opt-in section documents pinning a frontier model *above* Opus (`claude-fable-5`, or `claude-mythos-5` on Project Glasswing) for the highest-leverage slots — **T1 (Architect + the execute/test Leader) and T3 (Auditor)** — as a ceiling for genuinely hard specs. Explicitly **never a default and never in T2** (~2× Opus pricing, $10/$50 vs $5/$25, only pays where volume is low and the decision gates the run). Records the operational contract: it is a **dated pin with a required reason** (no floating alias, so it re-inherits concrete-slug drift maintenance — watched by `/akili-audit`); **always fall back to `opus`** for its refusal classifier (bio/cyber false-positives on security-adjacent specs), no-ZDR requirement, minutes-long turns, and less-prescriptive prompting; and it enables **cross-family `author ≠ auditor`** (Fable implementer/leader + Kimi/DeepSeek reviewer, or vice-versa) for stronger independent review.
- **"Replacing a model" developer runbook in `docs/model-routing.md`.** A first-class section that turns the previously-scattered model-swap mechanism into a followable procedure for when newer models ship after a project is scaffolded. Covers the three cases (floating alias → zero edits; concrete slug like OpenCode `opencode-go/*` or a `claude-fable-5` pin → edit; re-mapping a tier → promotion to evaluate), the 3-step procedure (edit the one `## Model Routing` table → reconcile the Step 8E agent wrappers → run `/akili-audit`'s Model Registry Drift check), and the package-default-vs-project-copy distinction (editing the packaged registry only affects new projects; the project's `AGENTS.md`/`CLAUDE.md` copy governs, and `/akili-constitution` Safe Update mode flags drift without overwriting pins).
## [2.10.1] - 2026-07-23

### Changed

- **Installer auto-detects installed targets (`bin/akili.js`):** when `--tool` is omitted, `install`, `update`, and `doctor` now scan disk for already-installed targets (`~/.claude`, `~/.config/opencode`, `~/.gemini`) and act on **all** of them instead of silently defaulting to `claude`. A bare `akili update` therefore refreshes every installed tool — fixing the case where new commands (e.g. `akili-quick`, `akili-resume`) landed in Claude Code but never reached OpenCode. An explicit `--tool <name>` still wins; a first-time run with nothing installed still defaults to `claude`. Auto-detected runs print which targets were found, and the update/verify summaries report the resolved tool set and a matching `akili doctor --tool …` hint.
## [2.10.0] - 2026-07-22

### Added

- **New `caveman` skill** (by Julius Brussee, MIT — github.com/juliusbrussee/caveman; adapted for AKILI-SPECS): token-economy communication style (~65% output-token reduction in upstream benchmarks) scoped by an AKILI **Scope Contract** to *transient agent output only* — inter-agent messages in the `/akili-execute` triad and `/akili-test` Leader↔Tester communication at `full`, user-visible progress narration at `lite`. Explicitly OFF for persistent artifacts (PRD/TRD/specs/`execution.md`/`test-report.md`/PRs/Kaizen log — `cognitive-doc-design` territory), HITL approval gates, Pivot/`PRODUCT_BUG` escalations, and verbatim evidence (Reviewer FAIL reports, error strings, test output — the Structured Feedback rule wins). Boundary rule recorded in both skills: *"cognitive-doc-design owns artifacts; caveman owns transient agent output."* Wired into `/akili-execute` (Multi-Agent Triad) and `/akili-test` (Token discipline).

- **New `software-architect` skill** (by Juan Carlos Cadavid — jcadavid.com, MIT; original AKILI authorship): senior-software-architect skill built around the **Decision Spine** — Scenario → Tactic → Tier & Style → Pattern → View & Record. Captures non-functional requirements as six-part, measurable quality-attribute scenarios (SEI format) with a mandatory security/performance/scalability/availability sweep; sizes the architecture through a **robust-vs-lite gate** (evidence-based escalation recorded as ADRs, infrastructure derives from the tier); selects architecture styles (hexagonal, clean, modular monolith, microservices, event-driven, serverless) and GoF design patterns only when bound to named problems; documents with C4 views (legend required) and compact 8-field ADRs. Progressive disclosure via `references/` (nfr-scenarios, architecture-styles, design-patterns, views-documentation, agentic-ai — the latter covering single/multi-agent patterns, RAG/vector decisions, and LLM-specific NFRs). Wired into the methodology: `/akili-constitution` Step 5 (required skill for the TRD; the TRD structure gains `Architecture Overview & Decisions` and `Quality Attribute Scenarios (Non-Functional Requirements)` sections) and Step 6 (infrastructure cites the tier decision), and `/akili-specify` Phase 2 for architecturally significant features. Inspired by SEI (Bass/Clements/Kazman; Views & Beyond), the C4 model (Simon Brown), Refactoring.Guru (Alexander Shvets), Clean/Hexagonal architecture, and Google Cloud agentic AI guides.
## [2.9.0] - 2026-07-20

### Added

- **Model Routing 2.0 — enforced for subagents, guided for the main loop:**
  - **Tool-native agent wrappers (`/akili-constitution` Step 8E):** with user approval, the constitution now binds the `.agents/` personas to the Model Routing registry via native agent definitions — `.claude/agents/akili-{leader,implementer,reviewer,tester}.md` in Claude Code (alias-based `model:`) and agent config in OpenCode (provider slugs). `/akili-execute` and `/akili-test` prefer these named agents, so the multi-agent fan-out (where most tokens are spent) routes automatically and **author ≠ auditor becomes structural** — the Reviewer wrapper pins a different model than the Implementer wrapper. Wrappers are thin references to `.agents/`; personas remain the single source of truth. Antigravity stays guidance-only (no per-agent model binding).
  - **Model checkpoints in every command:** all 10 commands (`propose`, `specify`, `execute`, `test`, `validate`, `archive`, `audit`, `quick`, `seo`, `constitution`) perform a one-line, never-blocking check during setup — if the phase's tier maps to a different model than the current session, the user is told (e.g. "This phase is T1 — the registry recommends `/model opus`") and offered the switch at the first approval pause.
  - **Model Registry Drift check in `/akili-audit`:** new drift category and Conformance Matrix row — registry entries naming models the tool no longer offers, dated pins where a floating alias exists, missing tiers/author ≠ auditor notes versus the packaged default, and Step 8E wrappers contradicting the registry. Report-only.

### Changed

- **Alias-first model registry (survives model churn):** `docs/model-routing.md` and the Step 8C scaffold now mandate floating aliases (`opus`/`sonnet`/`haiku` in Claude Code — they always resolve to the latest generation, so new model families require zero registry edits); dated model pins require a recorded reason. The default registry was rewritten alias-first with an `Updated:` stamp; OpenCode slugs (no alias mechanism) keep the Fallback column and are covered by the drift check. Safe Update mode now also flags stale registry entries against the packaged default without touching user pins.
## [2.8.0] - 2026-07-20

### Added

- **Skill governance (binding taxonomy + acceptance checklist):** new `docs/skills/governance.md` establishes the curation rule for the packaged skill set. Every skill now declares `metadata.binding` — `core` (hard-wired to a command step), `conditional` (loaded when the work touches its domain), or `stack` (never referenced in command text; reaches agents via the project Skill Map) — plus original author/license and `adapted-by`. New skills enter only through the acceptance checklist (need + binding + attribution + size + docs/CHANGELOG).
- **Project Skill Map:** `/akili-constitution` Step 8D scaffolds a `## Skill Map` section into the project's root `AGENTS.md`/`CLAUDE.md` from the detected stack; `/akili-specify` derives each task's required skills from that map, and the `/akili-execute` Leader falls back to it when a task lists no skills.
- **New unified `gsap-animation` skill** (author GSAP/GreenSock, MIT; adapted for AKILI-SPECS): replaces the 8 sibling `gsap-*` skills with one conditional skill — a compact router `SKILL.md` plus `references/` files (timeline, scrolltrigger, plugins, react, frameworks, performance, utils) following progressive disclosure. Wired into `/akili-specify` and `/akili-execute` for animation work.
- **AKILI-SPECS Integration sections** added to the deeply-wired skills: `brainstorming` (AKILI artifacts override its generic `docs/plans/` flow), `judgment-day` (ledger persisted as `judgment.md` in the spec folder, author ≠ auditor note), `cognitive-doc-design` (document map per command), `systematic-debugging` (Bug Track / Bug Mode / PRODUCT_BUG / Kaizen 5W1H mapping), `seo-audit` (finding format + escalation rule), and `ui-ux-pro-max` (per-phase usage map).

### Changed

- **Skill attribution normalized across the package:** every kept skill's frontmatter now carries the standard schema (`license`, `metadata.author`, `source`, `adapted-by`, `adapted-for`, `binding`, `version`), preserving original authors — including newly researched attributions: `ui-ux-pro-max` → nextlevelbuilder, `seo-audit` → Corey Haines, `brainstorming` → Jesse Vincent (obra/superpowers), `nestjs-expert` → Daniel Avila, `react-doctor` → Million.dev, `stitch-design` → Google Labs, `product-manager-toolkit` → Alireza Rezvani, `api-design-principles`/`error-handling-patterns`/`tailwind-design-system` → Seth Hobson (wshobson/agents), `frontend-design` → Anthropic — plus the already-attributed Google, Vercel, GSAP, gentleman-programming, and vibeship. Only `shadcn-ui` remains `community (origin unverified)`.
- **Truthful skill inventory:** `docs/skills/README.md` rebuilt with Binding and Origin columns and command associations that match the real command wiring (the previous table claimed command integrations that did not exist for `angular-developer` and the `gsap-*` family).
- **`angular-developer` reclassified as a stack skill:** kept in the package, reachable via the project Skill Map and the constitution/specify stack lists (previously packaged but never referenced anywhere).
- **Dangling references removed:** `seo-audit` no longer points to unpackaged sibling skills (`programmatic-seo`, `schema`, `ai-seo`, `cro`, `analytics`); `judgment-day` documents the fallback for its unpackaged shared-ledger references.

### Removed

- **The 8 `gsap-*` skill directories and their doc pages** (`gsap-core`, `gsap-frameworks`, `gsap-performance`, `gsap-plugins`, `gsap-react`, `gsap-scrolltrigger`, `gsap-timeline`, `gsap-utils`), fused into `gsap-animation`. **Existing installs are migrated automatically:** the installer's legacy cleanup now also removes stale legacy skill directories on every `akili install` run (counted in the `legacy cleaned` summary column, previewed in `--dry-run`), and `akili doctor` reports them as `STALE` with `--fix` removing them. Upgrade path for existing users: `akili update` (or `npm i -g akili-specs`) then `akili install --tool <tool>` — old gsap-* dirs are deleted and `gsap-animation` is installed in the same run.
## [2.7.1] - 2026-07-20

### Added

- **Authorship section in commands and templates:** Every command in `.claude/commands/` and every agent role template in `.claude/templates/` now ends with an `## Authorship` section crediting the AKILI-SPECS methodology to Juan Carlos Cadavid ([jcadavid.com](https://jcadavid.com)).
- **Authorship in README, LICENSE, and package metadata:** The README gains an `## Authorship` section, the MIT LICENSE copyright line uses the full author name and site, and `package.json` declares the `author` field.
- **License metadata in commands:** Every command in `.claude/commands/` declares `license: MIT` and `metadata.author` in its frontmatter (matching the convention used by community skills), and the `## Authorship` footer of commands and templates states the MIT License. Third-party skills bundled in `.claude/skills/` keep their original authors and licenses untouched.
- **Community governance files:** `CONTRIBUTING.md` (PR-only workflow, changelog discipline, and security rules for editing agent-executed prompt files), `SECURITY.md` (private vulnerability reporting with prompt-injection and installer threat scope), and `.github/CODEOWNERS` (maintainer review required on every change).
## [2.7.0] - 2026-07-20

### Added
- **New packaged `cognitive-doc-design` skill** (by gentleman-programming, Apache-2.0): six patterns for docs that reduce cognitive load (lead with the answer, progressive disclosure, chunking, signposting, recognition over recall, review empathy). Wired into the methodology: `/akili-constitution` (PRD writing), `/akili-specify` (all spec documents + chained-PR descriptions), `/akili-execute` (PR and review docs), and `/akili-archive` (archive summary and Kaizen log entries).

### Changed
- **`product-manager-toolkit` adapted to AKILI-SPECS:** new **AKILI-SPECS Integration** section maps each tool to its exact moment in the flow — Customer Interview Guide + Hypothesis Template as the question script for `/akili-constitution` Step 2 (with the interview analyzer offered when transcripts exist), North Star Metric / jobs-to-be-done / Hypothesis Template to fill the canonical 9-section PRD in Step 3, and RICE/MoSCoW to order scope chunks when `/akili-propose` or `/akili-specify` split an epic into multiple specs. The PRD templates reference now marks the AKILI structure as canonical, and Go-to-Market content is explicitly out of scope for constitution work.
- **Clear end-of-run summaries in every CLI command:** `akili install` now closes with an **Install Summary** block (per-tool `installed | overwritten | skipped | legacy cleaned` counts with target paths, totals when installing for multiple tools, an explicit dry-run banner, and contextual next steps — `--force` hint, OpenCode restart, `akili doctor` verification). `akili doctor` closes with a **Doctor Summary** (per-tool `HEALTHY | REPAIRED | INCOMPLETE` status with `ok | missing | fixed` counts and repair suggestions). `akili update` closes with an **Update Summary** (version before → after, install type, and how to verify). `akili list` prints a totals line (commands | skills | resources + package version). Overwrites are now counted separately from fresh installs.
## [2.6.0] - 2026-07-20

### Added
- **The Kaizen Loop in `/akili-archive`:** every archive now runs a bounded continuous-improvement retrospective — **Measure** (rework attempts, pivots, PRODUCT_BUGs, severe judgment-day findings, validation WARN/FAIL, drift) → **Learn** (0–3 root-cause lessons with cited evidence; generic lessons banned) → **Standardize** (minimal 1–3 line edits to constitution guides, general-setup templates, design tokens, or `.agents/` personas — always HITL-approved) → **Record** (append to the new accumulative `docs/specs/kaizen-log.md`, with a capped `## Active Lessons` digest). No new command: Kaizen is a step inside `/akili-archive` and never blocks archiving. Lessons target the **Product** or the **Methodology** itself (flagged for upstreaming to this repo).
- **New packaged `kaizen` skill** (`.claude/skills/kaizen/SKILL.md`), authored by Juan Carlos Cadavid — jcadavid.com, inspired by the Kaizen Institute glossary, Robert Maurer's small-steps method, and INTI's *Emprendiendo Kaizen* (2019). It encodes the philosophy-to-engineering mapping (PDCA, MUDA, Jidoka, Gemba/3 GEN, 5W1H, LUP), the loop contract, and the kaizen-log format.
- **Kaizen-aware commands:** `/akili-propose`, `/akili-specify`, and `/akili-execute` read the `## Active Lessons` digest so past mistakes shape new specs and task delegation; `/akili-resume` shows the active-lesson count in its dashboard.
## [2.5.1] - 2026-07-19

### Added
- **`akili update` now shows what changed:** After updating the npm package and reinstalling files, `akili update` prints a `What changed (<old> → <new>)` summary sourced from the installed package's `CHANGELOG.md`, listing every version section between the previously installed version and the new one. If the package was already up to date, it says so instead.
## [2.5.0] - 2026-07-19

### Added
- **Request classification & Bug Track in `/akili-propose`:** `/akili-propose` is now the single entry point that classifies each request as **Bug**, **Change**, or **Trivial** (inferring from the request, asking one question when ambiguous) and routes it — no new per-type command. Bugs follow a diagnosis-first **Bug Track**: the proposal captures the observed symptom, reproduction steps, and a **confirmed root cause** (via `systematic-debugging`) in a new **Bug Diagnosis** section instead of the Requirement Delta Preview, and records `Type:` in Document Control.
- **`/akili-specify` Bug Mode:** when a spec is a bug, specify frames requirements around the corrected behavior and **requires a regression test** as a mandatory task — red before the fix, green after — so a bug is provably fixed and stays fixed.
- **`/akili-quick` trivial fast-track command:** A new single-step command for genuinely trivial, low-risk changes (button color, title text, small paragraph). It makes the edit directly, runs a light verification, records a one-line entry in `docs/specs/quick/quick-log.md`, and commits with a `[SPEC:quick/<name>]` prefix — skipping the full `requirements` → `design` → `tasks` → `execution` → `test-report` → `validation-report` set while preserving spec-to-code traceability. A strict triviality gate (cosmetic/copy-only, no behavior/data/API/auth/contract change, ≤ ~20 LOC in one component, design-token safe) **auto-escalates** anything larger to `/akili-specify` (Lite) or `/akili-propose`.
- **`/akili-test` Leader → Tester(s) multi-agent harness:** `/akili-test` is no longer a single-agent script. The main session acts as a Leader that partitions testing into suites (backend unit, frontend unit, integration, E2E) and delegates each to a focused **Tester** subagent. A new `.agents/tester.md` persona (packaged under `.claude/templates/tester.md` and deployed by `/akili-constitution`) authors one suite from a thin per-suite context, explicitly covers negative constraints (`BUT it must NOT`) and strict validations (`AND IT MUST`), runs a bounded 3-attempt self-correction inner loop, and emits a `PASS` / `FAIL` / `PRODUCT_BUG` contract — keeping a correct test red on a genuine product defect instead of rewriting it to pass.
- **Token-aware Deployment Rule:** the Leader spawns the fewest Testers needed — inline (no spawn) for Lite/trivial single-suite work, one Tester per **independent** suite (in parallel when they touch different files), and sequential Testers when suites share files. Each Tester's context is discarded on completion so per-suite contexts never accumulate.
- **Mockup fallback in `/akili-propose`:** When a UI change arrives with no Figma link, image, or existing design, the proposal step now offers an opt-in, recommended path to generate a mockup directly in the agent via the `stitch-design` skill. Accepted mockups are saved under `docs/specs/<spec-path>/mockup/` (or `.stitch/designs` / `.stitch/DESIGN.md`) and recorded in a new **Visual Reference** proposal section.

### Changed
- **`/akili-specify` consumes generated mockups:** The specify step now reads the proposal's **Visual Reference** and treats an agent-generated mockup (or `.stitch/DESIGN.md`) as approved visual design context — the same as a Figma link — driving the `Design Impact` guidance across requirements, design, and tasks.
- **`/akili-validate` reuses test evidence and new context:** Validation now reads `test-report.md` and **reuses its requirement-to-test matrix and `PASS`/`FAIL`/`PRODUCT_BUG` verdicts** as primary coverage evidence instead of re-deriving it (a token saving that closes the test→validate loop); an unresolved `PRODUCT_BUG` forces a FAIL. Validation also audits UI against the proposal's **Visual Reference** (Figma or generated mockup) and adds a lightweight **Agent Guide / Constitution Impact** check that flags stale child guides / `## Module Guides` index as WARN for `/akili-archive`.
- **Model routing for `/akili-test` split into Leader (T5) and Tester(s) (T2)**, with a note to prefer a Tester model different from the Implementer (author ≠ tester). Updated `docs/model-routing.md`, `/akili-constitution` scaffolding, and the docs hub accordingly.
- **`/akili-constitution` now scaffolds four `.agents/` personas** (`leader`, `implementer`, `reviewer`, `tester`) and the installer deploys `tester.md` alongside the existing templates.
## [2.4.2] - 2026-07-19

### Changed
- **Update banner now suggests `akili update`:** The auto-update checker banner now recommends running `akili update` instead of `npm install -g akili-specs`, since `akili update` handles both the npm package update and file reinstallation.
## [2.4.1] - 2026-07-19

### Fixed
- **`akili update` now updates the npm package:** Previously `akili update` only reinstalled files from the already-installed version. Now it detects the installation type (global, local, or npx), runs `npm install -g akili-specs@latest` or `npm install akili-specs@latest` accordingly, and then reinstalls files with `--force`.
## [2.4.0] - 2026-07-19

### Added
- **`/akili-resume` command:** New session recovery command that scans all active specs under `docs/specs/` and presents a multi-spec dashboard with phase, progress bars, last action, blockers, and next command recommendation. If only one spec is active, goes directly to a detailed briefing. No arguments required.

### Fixed
- **Documentation drift corrections:** Added `/akili-audit` to README (Contents, Command Map, Auxiliary commands), `docs/commands/README.md` (Command Map, Source Files, Normal Sequence), and `docs/README.md` (Quick Flow). Created `docs/commands/akili-audit.md` reference page.
- **`judgment-day` skill documentation:** Added `judgment-day` to README skills list, AGENTS.md skill usage, and CLAUDE.md skill usage. Created `docs/skills/judgment-day.md` reference page.
- **Plan document rebranding:** Renamed `docs/plans/2026-05-26-multi-agent-sdd-orchestration-design.md` to `2026-05-26-multi-agent-akili-orchestration-design.md` to align with the v2.0.0 AKILI rebranding.
## [2.3.0] - 2026-07-19

### Added
- **Auto-Update Checker:** The `akili` CLI now automatically checks the NPM registry in the background (zero dependencies, 1500ms timeout) to see if a newer version is available. If an update exists, it prominently displays a stylish banner reminding the user to update, ensuring teams always stay on the latest methodology release.

### Fixed
- Changed the CLI behavior so that running `akili` with no arguments defaults to showing the `help` menu instead of launching the interactive `init` wizard. The wizard must now be explicitly invoked via `akili init` (or `npx akili-specs init`).
## [2.2.2] - 2026-07-19

### Fixed
- Replaced `pnpm add -g` with the classic `npm install -g` in the global installation documentation to prevent the `ERR_PNPM_NO_GLOBAL_BIN_DIR` error that occurs in environments without a pre-configured PNPM home directory.
## [2.2.1] - 2026-07-19

### Fixed
- Updated `package.json` repository URLs to point to the new renamed GitHub repository `JuankCadavid/akili-specs`.
## [2.2.0] - 2026-07-19

### Added
- **Legacy Cleanup:** The `akili install` and `akili update` commands now automatically detect and remove legacy `sdd-jc` files and directories (`commands/sdd-*.md` and the `sdd-jc/` template folder) to ensure a clean environment post-rebranding without duplicate slash commands.
## [2.1.1] - 2026-07-18

### Fixed
- Fixed the GitHub repository URL in `package.json` to point to the correct `JuankCadavid/sdd-jc-methodology` repository instead of the non-existent `akili-specs` repo.
## [2.1.0] - 2026-07-18

### Added
- **Interactive Setup Wizard:** Running the CLI without arguments (or using the `akili init` command) now launches an interactive setup wizard that asks which tools to target and whether to install globally or locally.
- **Local Project Installation:** Added the `--local` (`-l`) flag to the CLI. This allows users to install the methodology artifacts directly into their local project workspace (e.g., `./.claude` and `./.config/opencode`) instead of the global home directories, ensuring project-specific isolation when needed.
## [2.0.1] - 2026-07-18

### Fixed
- Fixed remaining `akili-methodology` package references in documentation to correctly point to `akili-specs`.
- Updated the ASCII art in the README to reflect the new AKILI branding instead of the old JCSPECS banner.
## [2.0.0] - 2026-07-18

### Changed
- **Massive Rebranding:** The methodology and CLI have been officially rebranded to **AKILI** and **AKILI-SPECS** (formerly JCSPECS / SDD JC) in honor of Dante 🐶.
- **CLI Rename:** The command line tool is now invoked as `akili` (e.g., `akili install`, `akili doctor`).
- **Command Rename:** All slash commands have been renamed from `/sdd-*` to `/akili-*` (e.g., `/akili-propose`, `/akili-execute`).
- **NPM Package:** The package name is now `akili-specs`.
- Updated all internal documentation, templates, and references to reflect the new brand and CLI instructions.
## [1.0.0] - 2026-07-16

### Added
- **Harness Upgrades (v1.0 Candidate):**
  - **Automatic Rollback:** The Leader now executes `git restore .` and `git clean -fd` automatically upon declaring a `HALT` to ensure the repository remains in a clean state before executing the Pivot Protocol.
  - **Anti-Looping Memory:** The Leader now passes an "Attempt History" summary to the Implementer during rework loops to prevent it from repeating failed approaches.
  - **Dynamic Skill Loading:** The Leader now explicitly commands the Implementer to load necessary methodology skills (e.g., `shadcn-ui`) using the `skill` tool before writing code.
  - **Strict Self-Correction (Pre-Review):** The Implementer is now strictly prohibited from reporting completion to the Leader if the local verification command fails. It must self-correct in an inner loop first, drastically saving Reviewer tokens.
  - **Parallel Execution:** The Leader can now spawn multiple Implementers simultaneously if the eligible tasks are completely independent (touching different domains).
## [0.11.0] - 2026-07-16

### Added
- Rewrote the `akili` CLI argument parser to use the native Node.js `util.parseArgs` (Node >= 18.0.0) for stronger type safety, default values, and better error handling.
- Added native ANSI colors to the CLI interface for high-visibility terminal output (`akili doctor` and `akili list`).
- Added an auto-repair `--fix` flag to `akili doctor` which instantly installs any missing commands, skills, or templates detected during the audit without requiring a full `--force` update.

### Changed
- Refactored the `akili` CLI core architecture to use a unified `TOOL_REGISTRY` pattern, eliminating duplicate tool-specific conditionals and vastly improving the scalability of adding future IDE/Tool targets.
- Improved CLI cross-platform compatibility (Windows-first) by strictly normalizing all console path outputs and `~` directory resolutions to work flawlessly in PowerShell and CMD.
- Removed the circular self-dependency from `package.json` to guarantee zero-dependency execution for faster `npx`/`pnpm dlx` global installs.
## [0.10.2] - 2026-07-16

### Changed
- Refined prompt caching across all commands and templates: reading constitutional baseline docs FIRST in a consistent order drastically reduces API token cost.
- Reinforced model tier assignments (`> **Recommended model tier:**`) across commands so users only expend expensive T1/T3 tokens when deep reasoning is actually required, avoiding token waste on format-following tasks like `/akili-archive`.
- Expanded `.codegraph/` integration: agents are now explicitly instructed to use `codegraph_search` and `codegraph_context` over full file reads (`grep`/`glob`) during `/akili-propose` and `/akili-specify`, significantly reducing input tokens.
## [0.10.1] - 2026-07-16

### Changed
- Refined `/akili-specify` rules: Mode "Lite" now strictly enforces extreme brevity (1-2 bullet points, minimal output tokens) and code snippet generation is explicitly banned in `design.md` to conserve tokens.
- Refined the multi-agent harness in `/akili-execute` and `.claude/templates/reviewer.md` for token optimization: the Reviewer now enforces a strict **Diff-Only** audit constraint (reading only the git diff, not full source files) and supports a new **`STATUS: FATAL_FAIL`** (Fail-Fast) verdict to immediately abort the rework loop on unviable approaches without exhausting the 3-attempt ceiling.
## [0.10.0] - 2026-07-16

### Added
- Integrated Figma MCP and Jira MCP awareness into `/akili-propose` (Step 1) to extract requirements and visual context from existing tickets and designs.
- Added "Design Impact" rules to `/akili-specify` ensuring UI states, Frontend Component Architecture, and atomic frontend tasks are generated when Figma or visual design context is present.
- Added explicit "Report To User" short summaries across all major commands (`/akili-propose`, `/akili-specify`, `/akili-execute`, `/akili-validate`, `/akili-test`, `/akili-constitution`) so users receive a clear, digestible recap ("summary facil de entender de lo que se hizo") before the next step.
## [0.9.4] - 2026-07-13

### Changed
- Refined the Design and Tasks presentation steps in `/akili-specify` to explicitly display clear summaries on the screen (architecture, API endpoints, high-level task lists) so the user can understand what was generated without having to read the full markdown documents.
## [0.9.3] - 2026-07-13

### Changed
- Refined the Requirements presentation step in `/akili-specify` to explicitly display a summary of the generated scenarios and rules on the screen before prompting the user with the approval menu.
## [0.9.2] - 2026-07-12

### Changed
- Updated README.md to fully document recent methodology enhancements (Scope Chunking, BDD, HITL menus, Judgment Day skill, Infrastructure blueprint, and LOC Estimation).
## [0.9.1] - 2026-07-12

### Added
- Added `docs/infrastructure.md` generation to `/akili-constitution` (new Step 6) to establish deployment environments and cloud architecture rules early.
- Added Estimated Lines of Code (LOC) and PR Strategy recommendations to the Tasks presentation menu in `/akili-specify` to prevent oversized Pull Requests.

### Changed
- Updated `/akili-constitution` to explicitly ask for infrastructure expectations (AWS, GCP, Vercel, etc.) during the context clarification phase if they are not provided.
## [0.9.0] - 2026-07-12

### Added
- Integrated the `judgment-day` skill into the methodology and added it as an explicit option in the `/akili-specify` design phase approval menu, including post-judgment decision routing.
- Added "Human-in-the-loop" approval menus at the end of each phase (Requirements, Design, Tasks) in `/akili-specify` to give the user explicit control before proceeding.
- Added strict BDD scenario handling (`BUT it must NOT`, `AND IT MUST`) to `/akili-specify`, `/akili-test`, and `/akili-validate` for rigorous negative constraint and boundary validation tracking.
- Added Scope Chunking support to `/akili-propose` and `/akili-specify` using the `brainstorming` skill to evaluate large requests and split them into manageable modules.

### Changed
- Updated `/akili-constitution` to use the `brainstorming` skill at Step 0 to determine if the project is new or legacy, and added an explicit prompt to initialize CodeGraph when analyzing existing projects.
## [0.8.0] - 2026-07-11

### Added

- Packaged the `seo-audit` skill (from [marketingskills](https://github.com/coreyhaines31/marketingskills), v2.0.0) under `.claude/skills/seo-audit/` with its `references/` and `evals/`, and added its human-facing page at `docs/skills/seo-audit.md`.

### Changed

- `/akili-seo` Phase 2 now requires loading the `seo-audit` skill: findings use its Issue / Impact / Evidence / Fix / Priority format, are weighted by its priority order (crawlability → technical → on-page → content → authority), and its schema-detection limitation (static fetches cannot see JS-injected JSON-LD) and International SEO checklist apply throughout. Added Step 2.7 (on-page audit of the render-sampled pages) and a matching `On-Page SEO Findings` report section.
## [0.7.0] - 2026-07-10

### Added

- Added a nested agent-guide inheritance convention across the lifecycle: `/akili-constitution` (Step 7) defines it — modules with divergent conventions get a thin child `CLAUDE.md`/`AGENTS.md`, always referenced from a `## Module Guides` index in the root guides; `/akili-execute` (Step 3) records `## Constitution Impact` notes in `execution.md` when a task creates or reshapes a module; `/akili-archive` (new Step 3: Constitution & Graph Sync) consumes those notes to create/update child guides, refresh the parent index, and recommend a CodeGraph re-index; `/akili-audit` gained an **Agent Guide Drift** category and a conformance-matrix row. The Leader persona template (`.claude/templates/leader.md`) carries the same Constitution Impact duty.

### Changed

- **Breaking (naming):** Renamed the two constitution baseline documents to remove the System Design / Detailed Design ambiguity. The UX/UI blueprint moved from `docs/system-design/design.md` to `docs/ux-ui/design.md` (now the "UX/UI Design Document"), and the technical blueprint moved from `docs/detailed-design/detailed-design.md` to `docs/trd/trd.md` (now the "TRD — Technical Requirements Document"). Document structures are unchanged; only names and paths changed.
- Updated every command, persona template, and doc page to the new names and paths (`.claude/commands/`, `.claude/templates/{leader,implementer,reviewer}.md`, `README.md`, `AGENTS.md`, `docs/flow.md`, `docs/model-routing.md`, `docs/commands/`, `docs/skills/`).
- Added legacy-path handling: commands that read the baseline fall back to the old `docs/system-design/` and `docs/detailed-design/` paths when the new ones are missing, and `/akili-constitution` (Active AKILI-SPECS mode) offers a `git mv` migration to the new layout.
## [0.6.0] - 2026-06-09

### Added

- Added capability-tier model routing guidance under `docs/model-routing.md`: six tiers (Architect, Coder, Auditor, Context-Ingest, Fast-Cheap, Multimodal), a phase→tier mapping for every AKILI-SPECS phase (with the `/akili-execute` triad split), and an editable per-tool model registry for Claude Code (PRO) and OpenCode Go.
- Added a `## Recommended Model Tier` note to the `.claude/templates/{leader,implementer,reviewer}.md` personas, reinforcing the author ≠ auditor constraint (Reviewer model ≠ Implementer model).

### Changed

- Updated `/akili-constitution` with Step 7C to scaffold a non-destructive `## Model Routing` registry into each project's `AGENTS.md` / `CLAUDE.md`.
- Documented the capability-tier model routing in `README.md`, `docs/flow.md`, `docs/README.md`, and the `/akili-constitution` command reference, and added a governance rule to `AGENTS.md` that model selection is guidance-only (no `model:` frontmatter, no installer injection).
## [0.5.0] - 2026-05-26

### Added

- Added a AKILI multi-agent execution triad (Leader → Implementer → Reviewer) with default personas packaged under `.claude/templates/{leader,implementer,reviewer}.md`.
- Added the `akili` installer support for deploying agent templates to `<tool>/akili/templates/` and doctor diagnostics that check them.
- Added a design document for the multi-agent orchestration under `docs/plans/2026-05-26-multi-agent-akili-orchestration-design.md`.

### Changed

- Updated `/akili-execute` to orchestrate the Leader → Implementer → Reviewer rework loop with a hard 3-attempt ceiling, structured FAIL feedback (Discovered Issue / Violated Rule / Remediation Suggestion), HALT escalation, and a richer `execution.md` audit-trail format.
- Updated `/akili-constitution` with a 3-mode classification (Brand-new / Legacy / Active AKILI-SPECS), non-destructive `.agents/` scaffolding policy, and cross-tool compatibility guidance for Claude Code, OpenCode, and Antigravity.
## [0.4.0] - 2026-05-23

### Added

- Added support for Google Antigravity (IDE and CLI) in the `akili` installer and doctor diagnostics checks.
- Added a new AKILI command `/akili-audit` to detect drift between active codebase reality and active design specifications.
- Added a new AKILI automated test parser utility (`scripts/parse_tests.js`) to parse Jest/Vitest JSON test suite output and build Markdown matrices inside `test-report.md` automatically.

### Changed

- Updated `/akili-execute` with AKILI Spec Reference git commit format conventions and a formal Pivot Protocol loop.
- Updated `/akili-test` with guidelines on using the automated test parser helper.
- Updated `/akili-archive` to refresh and re-index CodeGraph databases when archiving completed specs.
- Enriched `docs/flow.md` and `AGENTS.md` to document and govern AKILI advanced engineering features.
## [0.3.3] - 2026-05-18

### Changed

- Added a `docs/` documentation hub with flow, CLI, command, skill, and OpenSpec comparison references.

## [0.3.2] - 2026-05-18

### Changed

- Added the `AKILI` ASCII banner to the CLI output.
- Replaced the README badge image with a Markdown hero that combines the `AKILI` ASCII mark, methodology positioning, and support badges.
- Updated the README skills inventory to include `angular-developer` and the GSAP skill suite.

## [0.3.1] - 2026-05-18

### Changed

- Added explicit release governance policy for controlled repository and npm package updates.
- Added `npm run release:status` automation to detect drift across local release notes, npm versions, tags, and GitHub Releases.
- Added a `Release Status` GitHub Actions workflow for automated release drift checks.
- Added CodeGraph guidance for existing-project constitution analysis.
- Updated `/akili-constitution` to distinguish new vs existing projects and maintain both `CLAUDE.md` and `AGENTS.md`.
- Initialized CodeGraph configuration for this methodology repository.

## [0.3.0] - 2026-05-18

### Changed

- Added `angular-developer` skill for Angular projects and documented when to use it.
- Expanded README installation instructions with step-by-step flows for Claude, OpenCode, both-tool installation, verification, updates, local checkout usage, and troubleshooting.
- Added controlled release helper scripts for patch, minor, and major version preparation.
- Added official GSAP skills for core animations, timelines, ScrollTrigger, React, Vue/Svelte frameworks, plugins, performance, and utilities.
- Documented release discipline in README, release checklist, `AGENTS.md`, and `CLAUDE.md`.
- Documented required use of relevant packaged skills in `AGENTS.md` and `CLAUDE.md`.

### Fixed

- Preserved executable CLI metadata for the published `akili` binary.

## [0.2.0] - 2026-05-17

### Added

- `/akili-propose` command prompt for lightweight change proposals before full specification.
- `/akili-archive` command prompt for preserving completed specs under `docs/specs/archive/` after validation.
- Node package metadata and `akili` CLI for installing, updating, listing, and checking bundled commands and skills.
- `akili --tool` support for installing into Claude, OpenCode, or both.
- MIT license for public package distribution.
- README guidance for applying AKILI-SPECS with Lite, Standard, and Full documentation depth.
- Practical spec folder shape, requirement scenario examples, review points, and command map.
- OpenSpec-inspired proposal, requirement delta preview, and archive lifecycle guidance.

### Changed

- Updated README flow to include optional proposal and final archive steps.
- Updated README install instructions for Claude and OpenCode targets, `pnpm dlx`, global install, local checkout usage, dry-run, force, and target options.
- Clarified `/akili-specify` around bounded specs, behavior-first requirements, Given/When/Then scenarios, and task quality rules.
- Clarified `/akili-specify` to consume `proposal.md` when it exists and convert delta previews into full requirements.
- Clarified `/akili-execute` around incremental task execution, scope control, execution evidence, and spec-drift handling.
- Clarified `/akili-test` around requirement-to-test traceability, scenario coverage, accepted gaps, and test evidence.
- Clarified `/akili-validate` around PASS/WARN/FAIL/BLOCKED results, archive readiness, conformance evidence, and remediation guidance.
- Clarified `/akili-validate` to recommend `/akili-archive <spec-path>` when work is ready to close.

## [0.1.0] - 2026-04-27

### Added

- Initial reusable AKILI-SPECS command set:
  - `akili-constitution`
  - `akili-specify`
  - `akili-execute`
  - `akili-test`
  - `akili-validate`
- Bundled Claude skills required by the methodology, including `ui-ux-pro-max`
- Constitution-first workflow for project-level documentation baselines
- Nested spec path support such as `enhancements/renewals`
- Portable methodology README with install and restore instructions
- Environment snapshots for Neovim and tmux under `dotfiles/`

### Changed

- Aligned command behavior around project constitutional docs and `docs/specs/general-setup/`
- Removed stale project-specific assumptions from the AKILI-SPECS prompts
- Standardized command guidance around reusable spec-path workflows instead of flat module-only paths

### Notes

- This is the first stable reusable baseline of the AKILI-SPECS methodology repository.
