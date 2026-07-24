# Changelog

All notable changes to this methodology repository should be documented in this file.

The format is inspired by Keep a Changelog and the repository follows semantic versioning in a lightweight way for methodology milestones.

## [Unreleased]

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
