# Design: a simple README and one overview that shows all of AKILI

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/docs-overview` |
| Depth | Standard |
| Requirements | `requirements.md` (FR-1…FR-17, NFR-1…NFR-6) |
| Status | **Approved**. Phase 2 gate: `auto-approved (user mandate for /akili-specify, 2026-10-23)` after judgment-day `APPROVED ✅` (round 1 fix `ce8fbb5`, round 2 both APPROVE; `judgment.md`) |
| Verified at | `dfa1be2` (premises run at `cdb4c5a`/`dfa1be2`; only spec files changed between them) |
| Architecturally significant | **No**. No module, integration, data flow, persistence or NFR change, so `software-architect` and `diagram-design` slot filling do not apply |
| Language | English (user rule, 2026-10-23) |

## 2. Executive Summary

**Task map.** This is the single numbering, owned by `tasks.md`. It supersedes the proposal's provisional T-numbers and its ~22-round estimate:

| Task | Work | DD-1 step |
|---|---|---|
| T1 | Rebase check + move ledger | 1 |
| T2 | Absorb into `docs/flow.md` | 2 |
| T3 | Absorb into `docs/cli.md` (+ dead Grok anchor fix), `CONTRIBUTING.md`, `docs/openspec-comparison.md` *Roadmap*, `dotfiles/README.md` | 2 |
| T4 | `docs/overview.md` | 3 |
| T5 | Pin re-targets (3 tests) + `docs/skills/diagram-design.md:21` | 4 |
| T6 | README rewrite | 5 |
| T7 | Hub, routing line, governance item 5 | 6 |
| T8 | `test/docs-overview.test.js` | 7 |
| T9 | CHANGELOG + final sweep and verification | 8 |

The work moves content **before** it removes it, so every intermediate commit stays green and loses nothing:

1. Write the move ledger.
2. Fill the destinations (`docs/flow.md`, `docs/cli.md`, `CONTRIBUTING.md`, `docs/openspec-comparison.md`, `dotfiles/README.md`).
3. Write `docs/overview.md`.
4. Re-target the three tests' README pins to the overview, keeping the README negative guards.
5. Only then rewrite the README to the 7-section skeleton.
6. Update the hub, the routing line and the governance checklist.
7. Add the package-derived test.
8. Write the CHANGELOG entry.

## 3. Architecture Overview

| Surface | Change | FR |
|---|---|---|
| `docs/specs/changes/docs-overview/move-ledger.md` (spec artifact, never shipped or linked) | One row per README heading (43 rows) | FR-12 |
| `docs/flow.md` | New `## Practical Example`, `## Writing Good Requirements`, `## Requirement Delta Preview`, `## Review Points`, `## Core Concepts`, `## Spec Paths` (merged into *Spec Folder Shape*), `## Methodology Contract`, `## Host Assumptions`, plus any *Start Here* / *Kaizen Loop* / *Harness* / *Depth* obligation the ledger finds missing | FR-12, FR-6 |
| `docs/cli.md` | New `## Prerequisites` (the 3 README tables), `### Local Checkout Install`, the per-host invocation note (Codex `$`, Cursor `/`, with its `Last verified` citation), plus any *Install Paths* / *Updating* / *Troubleshooting* / *Manual Install* obligation the ledger finds missing; the dead `#grok-bot-grokbot` links at `:21, 48, 110` become `#grok-bot---tool-grokbot` | FR-5, FR-12, FR-17 |
| `CONTRIBUTING.md` | New `## Repository Structure` (README `:73-83`, including the `.claude/` note) | FR-17 |
| `docs/openspec-comparison.md` | New `## Roadmap` (3 bullets) | FR-17 |
| `dotfiles/README.md` (new) | Neovim and tmux restore steps (README `:527-552`) | FR-17 |
| `docs/overview.md` (new) | The 8 parts of FR-11 (§8) | FR-11 |
| `test/branching-flow.test.js`, `test/akili-security-docs.test.js`, `test/diagram-design.test.js` | Pin re-targets (§9) | FR-15 |
| `docs/skills/diagram-design.md:21` | "the command is in the root `README.md`" → `docs/overview.md` | FR-17 |
| `README.md` | Rewritten to the §7 skeleton | FR-1…FR-10 |
| `docs/README.md` | `overview.md` first; `skills/governance.md` linked; the anytime commands as a table | FR-13 |
| `docs/model-routing.md` | One Grok Bot line | FR-14 |
| `docs/skills/governance.md` item 5 | Adds "a row in `docs/overview.md`" | FR-17 |
| `test/docs-overview.test.js` (new) | §10 | FR-16 |
| `CHANGELOG.md` | One `Unreleased` → *Changed* entry | FR-17 |

## 4. Extended Directory Structure

New files: `docs/overview.md`, `dotfiles/README.md`, `test/docs-overview.test.js`, and the spec artifact `docs/specs/changes/docs-overview/move-ledger.md`. No other new paths.

## 5–6. Data Model · API · Backend · Shared Contracts

n/a. There is no data, API, backend or runtime contract. The only "contract" is doc text read by tests, covered in §9–§10.

## 7. README skeleton (FR-1…FR-10)

| Block | Exact heading | Contents | Lines (cap) |
|---|---|---|---|
| Hero | none (centered `<div>`) | ASCII logo `<pre>`; `# AKILI`; one sentence: "Spec-driven development for AI coding assistants: plan the change, build it, test it, and learn from it." (final wording at T6, ≤ 1 sentence); 3 badges (npm version, license, Node 18+); text line: "Works with Claude Code · OpenCode · Google Antigravity · OpenAI Codex CLI · Cursor · Grok Bot — on macOS, Linux and Windows" | 22 |
| 1 | `## What is AKILI?` | ≤ 3-sentence paragraph; `**What you get**` + 5 bullets (shared project context the assistant reads every session · every change planned and traceable to a requirement · built-in review and tests before "done" · it learns from every finished change · extras: security audits, SEO, video, diagrams[, marketing] → `docs/overview.md`); glossary table `Term \| Meaning` with 4 rows: *slash command*, *skill*, *spec*, *constitution* | 28 |
| 2 | `## How it works` | The existing `<p align="center"><a …><img …akili-flow.png width="900"></a></p>` block (README `:48-50`) with a **new short alt text** (DD-11), e.g. "The AKILI flow: set up the project once, then each change is proposed, specified, built, tested, validated and archived; some commands run any time."; 4 lines: set up once with `/akili-constitution` · each change runs propose → specify → execute → test → validate → archive · anytime commands work outside that path · full flow → `docs/flow.md` | 14 |
| 3 | `## Install` → `### What you need` · `### Install` · `### Check it worked` | 3 bullets (Node.js 18+, Git, one supported AI tool); `npx akili-specs init` + one line on what the wizard asks (tool, global or project install) + one pnpm line; `npx akili-specs doctor`, restart the tool, type `/akili-` (Codex `$akili-`); "Other tools, flags, manual or offline install, updating, troubleshooting → `docs/cli.md`" | 32 |
| 4 | `## Your first spec` | 5 numbered steps (FR-6), each "type → AKILI does → you get `<file>`"; `/akili-quick` line; `/akili-resume` line; link `docs/flow.md#practical-example` | 30 |
| 5 | `## Commands at a glance` → `### In your AI assistant` · `### In your terminal` | Table `Command \| Use it to…` with two group label rows (**Every change**, **Any time**); then the CLI table (8 rows) + link `docs/cli.md` | 42 |
| 6 | `## Learn more` | Table `I want to… \| Read` (8+ rows, overview first) | 16 |
| 7 | `## Contributing and license` | `CONTRIBUTING.md`, `docs/release-checklist.md`, MIT, the authorship line | 8 |
| | | **Total cap** | **≤ 200** (estimate ~192) |

"Use it to…" wording is derived from each command's `description` frontmatter and its `docs/commands/<name>.md` *Use When* cell, rewritten in plain words. Banned terms are **paraphrased**, never copied, and no claim is added (KZ-002). Rows whose sources carry banned or unexplained words are fixed here:

| Row | Source wording | README wording (plain) |
|---|---|---|
| `/akili-audit` | "spec-to-code drift auditing" | "check that the code still matches your product and design docs" |
| `/akili-execute` | "Leader → Implementer → Reviewer harness" | "build the approved tasks one by one, each checked by an independent review" |
| `akili doctor --agents` | "Persona Drift" | "check that your project's agent instruction files are up to date (`--fix` updates them)" |
| `akili routing` | "model routing" | "choose which AI model runs each step ([model routing](docs/model-routing.md))" |

The `/akili-security` row: "audit your repository for security vulnerabilities; findings become bug specs. Not on native Windows (use WSL, Linux or macOS)". It carries **no** run-directory or slug text (DD-6).

## 8. Overview page (FR-11)

`docs/overview.md`, in order:

| # | `##` heading | Format |
|---|---|---|
| 1 | `## What AKILI is` | One paragraph |
| 2 | `## Commands` | `### Every change` table and `### Any time` table: `Command \| Use it to \| Page` |
| 3 | `## Skills by purpose` | One `###` per group (fixed names below); each a table `Skill \| Binding \| Use it for` |
| 4 | `## How AKILI works under the hood` | Table `Mechanism \| One line \| Read more` with the 13 FR-11 items |
| 5 | `## Install targets` | Table `Target \| Default path \| In init \| In --tool all \| Routing wrappers \| doctor` (6 rows) |
| 6 | `## Optional tools` | Table `Tool \| Used by \| Without it`: CodeGraph, `gh`, Python (+ google libs), HyperFrames, Archify. The Archify row carries the three pinned strings (§9) |
| 7 | `## Glossary` | Table `Term \| Meaning`, covering every FR-10 explained term plus *proposal, requirement, scenario, task, archive, anytime command, Pivot Protocol, Leader/Implementer/Reviewer/Tester* |
| 8 | `## I want to…` | Table `I want to… \| Use` |

The `/akili-security` row in part 2 (*Commands*) carries the pinned positive text (DD-6): it states that full findings stay in the run directory (always outside the target) and that confirmed findings are routed to `/akili-propose bugfix/security-<YYYY-MM-DD>-r<N>-s<n>`, using the exact wording the README carries today at `:813`. **Constraint on every overview line that matches `akili-security|security-audit|audits/security-`** (the command row, the `security-audit` skill row, the glossary, the `I want to…` table): any `run directory` mention reads `run directory (always outside the target)`; there is no `git status|check-ignore|rev-parse` text; there is no phrase from the in-target family (`outside the target by default`, `repo-relative`, `ignored path` …, `test/akili-security-docs.test.js:96-105`); and any `bugfix/security-…` slug is exactly `bugfix/security-<YYYY-MM-DD>-r<N>-s<n>`.

**Skill groups.** The assignment is fixed, and every skill is in exactly one group. Binding comes from `metadata.binding`, as run at `cdb4c5a`:

| Group | Skills (binding) |
|---|---|
| Quality and process | `brainstorming` (core), `caveman` (core), `cognitive-doc-design` (core), `judgment-day` (core), `kaizen` (core), `systematic-debugging` (core), `tdd` (conditional) |
| Frontend and design | `angular-developer` (stack), `frontend-design` (conditional), `gsap-animation` (conditional), `react-doctor` (stack), `shadcn-ui` (stack), `stitch-design` (conditional), `tailwind-design-system` (stack), `ui-ux-pro-max` (conditional), `vercel-react-best-practices` (stack) |
| Backend and architecture | `ai-agent-development` (stack), `api-design-principles` (stack), `aws-serverless` (stack), `error-handling-patterns` (stack), `nestjs-expert` (stack), `software-architect` (core) |
| Product | `product-manager-toolkit` (core) |
| Deliverables | `diagram-design` (conditional), `security-audit` (core), `seo-audit` (core), `video-production` (conditional); `social-marketing` after the rebase (D2), with its binding read from its `SKILL.md` |

Totals: 7 + 9 + 6 + 1 + 4 = 27 (28 after marketing).

## 9. Pin re-targets (FR-15)

The regexes, token lists and messages stay unchanged. The only structural changes allowed (FR-15 AND IT MUST) are the three marked **S1** (site file), **S2** (presence/shape split) and **S3** (conditional README check) below.

| Test | Today | After |
|---|---|---|
| `test/branching-flow.test.js:124-128` `flowDocs` | 3 sites, including `"README.md (Releasing Package Updates)"` (section reader) | **S1** (site removed; CONTRIBUTING and release-checklist stay): remove the README entry from `flowDocs`; the 7-token loop runs on `CONTRIBUTING.md` and `docs/release-checklist.md` |
| `test/branching-flow.test.js:196-203` negative loop | `AGENTS.md` + `...flowDocs` | **S1** (site file: the README section becomes the whole README): `AGENTS.md`, `"README.md": () => doc("README.md")` (**whole file**), `...flowDocs` |
| `test/akili-security-docs.test.js:47-53` `SLUG_SITES` | Includes `"README.md": README` | **S2**: split into `SLUG_PRESENCE_SITES` (README replaced by `"docs/overview.md": OVERVIEW`) for the presence test `:69`, and `SLUG_SHAPE_SITES` (= presence sites **plus** `"README.md": README`) for the two shape tests `:75`, `:89` |
| `test/akili-security-docs.test.js:56-63` `RUN_DIR_SITES` | Includes the README security lines | **S1** (site added): keep the README entry and add `"docs/overview.md (/akili-security lines)"`, since the negative phrase family must still read the README |
| `test/akili-security-docs.test.js:118-124` (≥ 1 run-directory line per site) | `README.md` site | **S1**: replace the README with `docs/overview.md`. **S3**: add a README check that every `run directory` line, **if any**, says "always outside the target" (same regex; the presence requirement is dropped only for the README) |
| `test/akili-security-docs.test.js:200-206` (no git) | README security lines | **S1** (site added): unchanged, plus `docs/overview.md (/akili-security lines)` |
| `test/diagram-design.test.js:409-412` | `README.md` | **S1**: the same three asserts read `docs/overview.md` (variable renamed `overview`). After the rebase, marketing's edit at `:413-417` sits beside these lines, so T5 re-reads the file at the rebased HEAD |

## 10. Test design: `test/docs-overview.test.js` (FR-16)

`node:test` + `assert/strict`, in the style of the existing suites (`read()`, the `REPO_ROOT` path join). Helper seams, each a small pure function so mutations target one place (`slug(text)` added for (i); `proseOf(line, opts)` also strips `href`/`src` values and keeps `alt` text):

| Helper | Returns | Used by |
|---|---|---|
| `inventory()` | `{commands: [...basename without .md], skills: [...dir names]}` from `fs.readdirSync`, sorted | (a)–(d), (h) |
| `stripFences(md)` | The text with fenced blocks blanked (line count kept) | (e), (g) |
| `headings(md, level)` | `[{line, text}]` for fence-aware headings | (e) |
| `tableRows(md, underHeading)` | The rows of the tables under a heading, until the next heading of the same or higher level | (a)–(c), (h) |
| `firstCellName(row)` | The backticked name in the first cell (`` `/akili-x` `` or `` `skill` ``), link-aware | (a)–(c) |
| `skillBinding(name)` | `metadata.binding` from `.claude/skills/<name>/SKILL.md` | (a) |
| `proseOf(line, {stripInlineCode})` | The line with URLs (`](…)`, `href`/`src`) removed, inline code removed when `stripInlineCode`, and `alt` text kept | (g) |

| Clause | Assertion | Failure message names |
|---|---|---|
| (a) | Overview `## Commands` rows = inventory commands (as `/name`), each once; `## Skills by purpose` rows = inventory skills, each once, across the 5 fixed `###` groups; each Binding cell = `skillBinding` | missing / duplicate / extra name, the group(s), the binding pair |
| (b) | README `### In your AI assistant` rows ⊇ inventory commands, and each row's link target exists | missing command; broken link |
| (c) | `docs/skills/README.md` *Skill Inventory* rows = inventory skills | missing / extra |
| (d) | Every `\b(\d+) (?:packaged \|slash \|AKILI )?(commands?\|command skills\|skills\|skill directories)\b` hit in the FR-16 doc set (incl. `CONTRIBUTING.md`) equals the command total (`command`, `commands`, `command skills`) or the skill total (otherwise), unless the line has a subset qualifier | file:line, found vs derived |
| (e) | README `##` list = the 7 FR-1 headings in order; `###` list = the 5 FR-1 headings under their parents; no `####` | the first mismatch |
| (f) | README lines ≤ 200; first `npx akili-specs init` line ≤ 90; no `<details>` | the count / line |
| (g) | Explained terms: for each one found in `proseOf(line, {stripInlineCode: true})`, it is in the README glossary table, or its first occurrence lies inside a link text `[…]`. Banned terms: 0 hits in `proseOf(line, {stripInlineCode: false})`. Both use whole words, allow a plural, and are case-insensitive; `alt` text counts as prose | term + line |
| (h) | Overview `## Install targets` has 6 rows; the Grok Bot row's *In init*, *In --tool all* and *Routing wrappers* cells read `no` and it links `docs/cli.md#grok-bot---tool-grokbot`; the `bin/akili.js` `ALL_TOOLS` literal excludes `"grokbot"`; `bin/routing.js` has no `/grok/i` | the cell / the code fact |
| (i) | Every relative `](path#anchor)` in README, overview and `docs/README.md` (no `http`) exists on disk; when it has an anchor, the anchor equals `slug(h)` for some fence-aware heading `h` of the target. `slug` follows GitHub's rule: lowercase; drop characters other than letters, digits, space, `-` and `_`; space → `-`; duplicate slugs get `-1`, `-2` | file + target (+ anchor) |
| (j) | `shields.io` count = 3; the hero text line names the 6 tools and 3 OSes; 5 bullets under `**What you get**`; 4 rows in the README glossary; `akili-flow.png` `src` inside `<p align="center">`; no `doctor --tool` in the README; the first *Learn more* row links `docs/overview.md`; `docs/README.md` *Start Here* first link is `overview.md`, it links `skills/governance.md`, and the anytime commands are table rows; `docs/model-routing.md` has a line with `Grok Bot` and `no routing wrappers` | the clause |

No count of commands or skills is hard-coded (FR-16).

## 11. Design Decisions

| ID | Decision | Rejected alternative | Why |
|---|---|---|---|
| DD-1 | **Order of work: fill destinations → overview → re-target pins → shrink the README** | Rewrite the README first, then move content | Every commit stays green and holds every obligation somewhere. The reverse leaves commits where pinned text exists nowhere (NFR-1) |
| DD-2 | The move ledger is a spec artifact with a quoted destination per obligation | Trust heading matches | A heading match certified dropped content three times (KZ-changes--gate-falsifiability-2, the `changes/agents-md-canonical` heading-granularity case) |
| DD-3 | Membership is by **table row first cell**, not by substring | `includes(name)` | Substring passes a name that is only mentioned in prose (FR-11 BUT). This also gives the falsifier a place to diverge (§12 P-5) |
| DD-4 | Count claims are checked for **digits only**, with subset qualifiers exempt | Also parse number words | The baseline has no digit subset claims and one word claim (`README.md:567` "Five anytime commands", which the rewrite removes). Parsing words adds a fragile grammar for a case that will not exist |
| DD-5 | The jargon check strips inline code and link URLs, and only then matches whole words | Raw text | `` `docs/specs/` `` and `/akili-specify` would otherwise count as "spec" (DD falsifier: §12) |
| DD-6 | The `/akili-security` slug and run-directory **positive** pins live in the overview; the README keeps every **negative** guard | Keep them in the README | U1/U4: a new user's page should not carry run-directory rules. Negative guards still stop a weakened restatement from appearing there (FR-15) |
| DD-7 | `social-marketing` and `/akili-marketing` rows are written **after the rebase**, from their shipped pages | Write them now from the branch | Their text can change before merge, and the derived test fails until they are listed, so they cannot be forgotten |
| DD-8 | The overview glossary is the full glossary; the README glossary has 4 terms | One glossary only | README brevity (FR-2). The overview is one click away |
| DD-9 | The hero keeps 3 of its 13 `shields.io` badges (10 removed: 7 tool, 3 OS) | Keep the tool badges | D8, approved. The text line keeps the information |
| DD-10 | Governance checklist item 5 gains the overview row | Rely on the failing test | A rule a contributor reads beats a red test they have to interpret |
| DD-11 | Replace the figure's alt text with a short plain one | Keep it and exempt HTML from the jargon check | The alt text is what a screen-reader user hears first, so U4 applies to it too (judgment J-5/F-07) |
| DD-12 | Check anchors with an in-test GitHub-style slugger | Leave anchors to the PR preview | One dead anchor (`#grok-bot-grokbot`, in five links) already ships, so a human preview has missed them (J-7/F-02/F-03) |

### Reversion challenge (Step 2.3): "what does removing this break?"

The DDs that remove delivered content are the README sections (docs-refresh-2-34 FR-3/FR-4/FR-5), the 10 badges and the *Contents* list.

| Removed | What could break | Finding | Addressed by |
|---|---|---|---|
| Pinned README text | 3 test files | Found (P-1) | DD-6, §9 |
| Docs that point into the README | `docs/skills/diagram-design.md:21` claim | Found (P-2) | FR-17 bullet, T5 |
| Inbound anchors (`README.md#…`) from repo docs | Broken deep links | `grep -rn "README.md#" docs .claude CONTRIBUTING.md` → 0 | — |
| Inbound anchors from outside the repo (blog posts, npm) | `#cli-commands`, `#the-kaizen-loop` etc. stop resolving | Unknown. **Accepted, Low**: `#install` survives; the content survives in `docs/` | Recorded as an accepted risk |
| *Contents* list as the skill-membership check | docs-refresh-2-34 FR-4 intent ("README inventory equals the package") | Superseded by test (a)–(c), which is stronger (automated) | §10 |
| Windows caveat beside the badge | docs-refresh-2-34 FR-5 | Moves to the `/akili-security` row (FR-7) | §7 |

The judgment-day judges receive the same question.

## 12. Premise Ledger

Count: **16** premises. **14 verified**, **2 `UNVERIFIED`** (Low: 2, High: 0). Rev. 2 after judgment-day round 1: P-2, P-6, P-7, P-9 and P-11 were corrected, and P-14…P-16 were added.
Blast-radius triggers: **`consumer`** fires (the README, a doc read by tests and by other docs, changes shape; the skill and command sets are enumerated by the new test). `live-path` and `shared-state` do not apply: there is no user action or branch point in code, and no shared runtime state. Docs have no dispatch chain.

| # | Claim | Class | Citation (as run) | Verified at | If false | Settled by |
|---|---|---|---|---|---|---|
| P-1 | Exactly 3 test files pin README text: `branching-flow` (`:127` section), `akili-security-docs` (`:34,49,58,121,204`), `diagram-design` (`:409-412`). `tasks-gate:328` writes a temp README and `release-next:190` is a status string, so neither pins it | consumer | `grep -ln "README.md" test/*.js` → 6 files (the 3 above + `akili-security-command` (audits `README.md`, a different file), `tasks-gate`, `release-next`); per-file `grep -n README` read | `cdb4c5a` | A missed pin goes red at T6 (High: a task added) | — |
| P-2 | Non-test readers of README content: none in `scripts`/`bin`/`.github`; repo docs link no README anchor; two shipped claims name the README as Archify's home: `docs/skills/diagram-design.md:21` (in scope, T5) and `.claude/skills/diagram-design/SKILL.md:76` (out of scope, accepted Low + `/akili-quick` follow-up); `docs/openspec-comparison.md:11` ("README hero plus links to docs/") stays true | consumer | `grep -rn "README" scripts bin .github` → 0; `grep -rn "README.md#" docs .claude CONTRIBUTING.md` → 0; `grep -rn "root README\|project README\|README\.md" docs/skills docs/commands docs/*.md CONTRIBUTING.md .claude/skills .claude/commands AGENTS.md` → those hits plus `docs/specs/*/README.md` scaffold mentions | `f54efaf` | Another stale pointer ships (Low) | — |
| P-3 | *Practical Example, Writing Good Requirements, Review Points, Core Concepts, Methodology Contract, Host Assumptions, Requirement Delta Preview, Spec Paths* are absent from `docs/flow.md` | existence | `grep -c "<text>" docs/flow.md` → 0 for each of the 8 | `cdb4c5a` | T2 shrinks (Low) | — |
| P-4 | `docs/cli.md` has no prerequisites tables and no local-checkout install | existence | `grep -ci "prerequisites\|local checkout" docs/cli.md` → 0 | `cdb4c5a` | T3 shrinks (Low) | — |
| P-5 | Package: 12 commands, 27 skills. Bindings as in §8 | data-env | `ls .claude/commands \| wc -l` → 12; `ls -d .claude/skills/*/ \| wc -l` → 27; loop `grep -m1 -E '^\s*binding:'` per `SKILL.md` | `cdb4c5a` | Group table rows change (Low) | — |
| P-6 | `ALL_TOOLS` excludes `grokbot` (`bin/akili.js:517`, DD-4 comment `:519-521`); `bin/routing.js` has 0 `grok` references | location | `grep -n "ALL_TOOLS = " bin/akili.js` → `517`; `grep -ci grok bin/routing.js` → 0 | `f54efaf` | D6 rows read wrong (High: FR-11/FR-14 content) | — |
| P-7 | Digit count claims in the FR-16 doc set: 9 hits, only in `docs/cli.md` (`:125, 191, 192, 203, 204, 225 ×2, 242 ×2`), all totals (12/27). The rev. 1 regex missed the two `12 command skills` hits | consumer | `grep -noE "\b[0-9]+ (packaged \|slash \|AKILI )?(commands?\|command skills\|skills\|skill directories)\b" README.md docs/*.md docs/commands/*.md docs/skills/*.md CONTRIBUTING.md` → 9 hits | `f54efaf` | Clause (d) needs more qualifiers (Low) | — |
| P-8 | `CONTRIBUTING.md` and `docs/release-checklist.md` already satisfy the 7 branching-flow tokens, so dropping the README site loses no positive coverage | other | `node --test test/branching-flow.test.js test/akili-security-docs.test.js test/diagram-design.test.js` → `pass 74, fail 0` (Node v22.12.0); the token loop covers both files | `dfa1be2` | D7 weakens a guarantee (High) | — |
| P-9 | `akili-marketing` modifies 12 existing files (`AGENTS.md`, `CHANGELOG.md`, `README.md`, `docs/README.md`, `docs/cli.md`, `docs/commands/README.md`, `docs/flow.md`, `docs/skills/README.md`, `docs/skills/governance.md`, `test/diagram-design.test.js`, `test/fixtures/doctor-codex-baseline.txt`, `test/install-cursor.test.js`), and its tests pin **no** README text. After the rebase, P-5, P-7, the 43-row ledger and every cited line number are re-run (T1) | consumer | `git diff --name-status 8679e25...JuankCadavid/akili-marketing \| grep -v '^A'` → 12; `git show JuankCadavid/akili-marketing:test/akili-marketing-command.test.js \| grep -c README` → 0 (same for `social-marketing-skill`) | branch `ea5c01d` | The rebase needs more test re-targets (Low) | — |
| P-10 | `package.json` `files` ships `README.md` and `docs` (minus `docs/specs`) and not `dotfiles/` | data-env | `sed -n 16,28p package.json` | `cdb4c5a` | D5 premise wrong (Low) | — |
| P-11 | The README's only figure is `assets/akili-flow.png` at `:48-50`, centered and linked (`<a>`/`<img>` on `:49`) | location | `grep -n akili-flow README.md` → `49`; `sed -n 48,50p README.md` | `f54efaf` | FR-4 wording changes (Low) | — |
| P-12 | `:698` `## Requirement Delta Preview` is inside a fenced example (`:697`), not a duplicate heading | existence | `sed -n 697,698p README.md`; the fence-aware awk lists one `693:` | `cdb4c5a` | Nothing (the correction is already logged in the proposal) | — |
| P-13 | GitHub renders `## Practical Example` with the anchor `#practical-example` | data-env | `UNVERIFIED — confirm at source before relying on it` | — | FR-6's link does not land on GitHub (Low) | T8 clause (i) slugger (local rule), then the user's PR preview (rendered source) |
| P-14 | `docs/cli.md:240` `## Grok Bot (`--tool grokbot`)` slugs to `grok-bot---tool-grokbot`, so the existing `#grok-bot-grokbot` links (`docs/cli.md:21, 48, 110`; README `:193, 229`) are dead | data-env | `UNVERIFIED — confirm at source before relying on it` (rule applied by both judges and the architect; no rendered page fetched) | — | The FR-11 Grok link and T3's fix target the wrong anchor (Low) | T8 clause (i) slugger, then the PR preview |
| P-15 | `CHANGELOG.md` `## [Unreleased]` holds only the `### Notes` / "No unreleased changes yet." placeholder | existence | `sed -n 7,11p CHANGELOG.md` | `f54efaf` | T9 merges into the existing entries instead (Low; marketing adds entries before the rebase) | — |
| P-16 | The README figure's alt text contains the explained terms "Kaizen" and "Bug Track" | data-env | `sed -n 49p README.md` | `f54efaf` | DD-11 is unnecessary (Low) | — |

Hand-off: P-1 → T5 `Consumers`; P-2 → T5 and T6; P-7 → T3 and T8; P-9 → T1. P-13 and P-14 are owned by T8 (slugger) and then the PR preview.

## 13. Budget

| Expected | Value |
|---|---|
| Tasks | 9 |
| LOC | ~1,330 added / ~950 removed. The README is −948 / +~190; the test grows to ~380 with (i) slugger and (j) |
| Review rounds | **20**: per-task T1 1, T2 2, T3 2, T4 2, T5 2, T6 3, T7 1, T8 3, T9 2 = 18, plus 2 margin. **Tripwire: 26** |

The estimate matches Standard depth. This supersedes the proposal's ~22-round / tripwire 28 estimate (judgment J-11/F-12).
