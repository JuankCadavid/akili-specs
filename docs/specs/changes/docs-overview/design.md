# Design: a simple README and one overview that shows all of AKILI

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/docs-overview` |
| Depth | Standard |
| Requirements | `requirements.md` (FR-1…FR-17, NFR-1…NFR-6) |
| Status | Draft. The Phase 2 gate is pending judgment-day (§13) |
| Verified at | `dfa1be2` (premises run at `cdb4c5a`/`dfa1be2`; only spec files changed between them) |
| Architecturally significant | **No**. No module, integration, data flow, persistence or NFR change, so `software-architect` and `diagram-design` slot filling do not apply |
| Language | English (user rule, 2026-10-23) |

## 2. Executive Summary

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
| `docs/cli.md` | New `## Prerequisites` (the 3 README tables), `### Local Checkout Install`, the per-host invocation note (Codex `$`, Cursor `/`, with its `Last verified` citation), plus any *Install Paths* / *Updating* / *Troubleshooting* / *Manual Install* obligation the ledger finds missing | FR-5, FR-12, FR-17 |
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
| 2 | `## How it works` | The existing `<p align="center"><a …><img …akili-flow.png width="900"></a></p>` block (alt text kept or shortened, never extended); 4 lines: set up once with `/akili-constitution` · each change runs propose → specify → execute → test → validate → archive · anytime commands work outside that path · full flow → `docs/flow.md` | 14 |
| 3 | `## Install` → `### What you need` · `### Install` · `### Check it worked` | 3 bullets (Node.js 18+, Git, one supported AI tool); `npx akili-specs init` + one line on what the wizard asks (tool, global or project install) + one pnpm line; `npx akili-specs doctor`, restart the tool, type `/akili-` (Codex `$akili-`); "Other tools, flags, manual or offline install, updating, troubleshooting → `docs/cli.md`" | 32 |
| 4 | `## Your first spec` | 5 numbered steps (FR-6), each "type → AKILI does → you get `<file>`"; `/akili-quick` line; `/akili-resume` line; link `docs/flow.md#practical-example` | 30 |
| 5 | `## Commands at a glance` → `### In your AI assistant` · `### In your terminal` | Table `Command \| Use it to…` with two group label rows (**Every change**, **Any time**); then the CLI table (8 rows) + link `docs/cli.md` | 42 |
| 6 | `## Learn more` | Table `I want to… \| Read` (8+ rows, overview first) | 16 |
| 7 | `## Contributing and license` | `CONTRIBUTING.md`, `docs/release-checklist.md`, MIT, the authorship line | 8 |
| | | **Total cap** | **≤ 200** (estimate ~192) |

"Use it to…" wording is taken from each command's `description` frontmatter and its `docs/commands/<name>.md` *Use When* cell, rewritten in plain words, never extended (KZ-002). The `/akili-security` row: "audit your repository for security vulnerabilities; findings become bug specs. Not on native Windows (use WSL, Linux or macOS)". It carries **no** run-directory or slug text (DD-6).

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

The `/akili-security` row in §2 carries the pinned positive text (DD-6): it states that full findings stay in the run directory (always outside the target) and that confirmed findings are routed to `/akili-propose bugfix/security-<YYYY-MM-DD>-r<N>-s<n>`, using the exact wording the README carries today at `:813`.

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

The assertion text, regexes, token lists and messages stay unchanged. Only the file read and the site key change.

| Test | Today | After |
|---|---|---|
| `test/branching-flow.test.js:124-128` `flowDocs` | 3 sites, including `"README.md (Releasing Package Updates)"` (section reader) | Remove the README entry from `flowDocs`; the 7-token loop runs on `CONTRIBUTING.md` and `docs/release-checklist.md` |
| `test/branching-flow.test.js:196-203` negative loop | `AGENTS.md` + `...flowDocs` | `AGENTS.md`, `"README.md": () => doc("README.md")` (**whole file**), `...flowDocs` |
| `test/akili-security-docs.test.js:47-53` `SLUG_SITES` | Includes `"README.md": README` | Split into `SLUG_PRESENCE_SITES` (README replaced by `"docs/overview.md": OVERVIEW`) for the presence test `:69`, and `SLUG_SHAPE_SITES` (= presence sites **plus** `"README.md": README`) for the two shape tests `:75`, `:89` |
| `test/akili-security-docs.test.js:56-63` `RUN_DIR_SITES` | Includes the README security lines | Keep the README entry and add `"docs/overview.md (/akili-security lines)"`, since the negative phrase family must still read the README |
| `test/akili-security-docs.test.js:118-124` (≥ 1 run-directory line per site) | `README.md` site | Replace the README with `docs/overview.md`, and add a README check that every `run directory` line, **if any**, says "always outside the target" (same regex; the presence requirement is dropped only for the README) |
| `test/akili-security-docs.test.js:200-206` (no git) | README security lines | Unchanged, plus `docs/overview.md (/akili-security lines)` |
| `test/diagram-design.test.js:409-412` | `README.md` | The same three asserts read `docs/overview.md` (variable renamed `overview`) |

## 10. Test design: `test/docs-overview.test.js` (FR-16)

`node:test` + `assert/strict`, in the style of the existing suites (`read()`, the `REPO_ROOT` path join). Helper seams, each a small pure function so mutations target one place:

| Helper | Returns | Used by |
|---|---|---|
| `inventory()` | `{commands: [...basename without .md], skills: [...dir names]}` from `fs.readdirSync`, sorted | (a)–(d), (h) |
| `stripFences(md)` | The text with fenced blocks blanked (line count kept) | (e), (g) |
| `headings(md, level)` | `[{line, text}]` for fence-aware headings | (e) |
| `tableRows(md, underHeading)` | The rows of the tables under a heading, until the next heading of the same or higher level | (a)–(c), (h) |
| `firstCellName(row)` | The backticked name in the first cell (`` `/akili-x` `` or `` `skill` ``), link-aware | (a)–(c) |
| `skillBinding(name)` | `metadata.binding` from `.claude/skills/<name>/SKILL.md` | (a) |
| `proseOf(line)` | The line with inline code spans and link URLs removed | (g) |

| Clause | Assertion | Failure message names |
|---|---|---|
| (a) | Overview `## Commands` rows = inventory commands (as `/name`), each once; `## Skills by purpose` rows = inventory skills, each once, across the 5 fixed `###` groups; each Binding cell = `skillBinding` | missing / duplicate / extra name, the group(s), the binding pair |
| (b) | README `### In your AI assistant` rows ⊇ inventory commands, and each row's link target exists | missing command; broken link |
| (c) | `docs/skills/README.md` *Skill Inventory* rows = inventory skills | missing / extra |
| (d) | Every `\b(\d+) (?:packaged \|slash )?(commands\|skills)\b` hit in the FR-16 doc set equals the total, unless the line has a subset qualifier | file:line, found vs derived |
| (e) | README `##` list = the 7 FR-1 headings in order; `###` list = the 5 FR-1 headings under their parents; no `####` | the first mismatch |
| (f) | README lines ≤ 200; first `npx akili-specs init` line ≤ 90; no `<details>` | the count / line |
| (g) | For each explained term found in `proseOf` README lines: it is in the README glossary table, or its first-occurrence line has a `](`. Banned terms: 0 hits in `proseOf` lines; whole word, plural allowed, case-insensitive | term + line |
| (h) | Overview `## Install targets` has 6 rows; the Grok Bot row's *In init* and *In --tool all* cells read `no`; `bin/akili.js` `ALL_TOOLS` literal excludes `"grokbot"`; `bin/routing.js` has no `/grok/i` | the cell / the code fact |
| (i) | Every relative `](path)` in README and overview (no `http`, anchor stripped) exists on disk | file + target |

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

Count: **13** premises. **12 verified**, **1 `UNVERIFIED`** (Low: 1, High: 0).
Blast-radius triggers: **`consumer`** fires (the README, a doc read by tests and by other docs, changes shape; the skill and command sets are enumerated by the new test). `live-path` and `shared-state` do not apply: there is no user action or branch point in code, and no shared runtime state. Docs have no dispatch chain.

| # | Claim | Class | Citation (as run) | Verified at | If false | Settled by |
|---|---|---|---|---|---|---|
| P-1 | Exactly 3 test files pin README text: `branching-flow` (`:127` section), `akili-security-docs` (`:34,49,58,121,204`), `diagram-design` (`:409-412`). `tasks-gate:328` writes a temp README and `release-next:190` is a status string, so neither pins it | consumer | `grep -ln "README.md" test/*.js` → 6 files (the 3 above + `akili-security-command` (audits `README.md`, a different file), `tasks-gate`, `release-next`); per-file `grep -n README` read | `cdb4c5a` | A missed pin goes red at T6 (High: a task added) | — |
| P-2 | Non-test readers of README content: none in `scripts`/`bin`/`.github`; repo docs link no README anchor; one doc claim (`docs/skills/diagram-design.md:21`) names the README as Archify's home | consumer | `grep -rn "README" scripts bin .github` → 0; `grep -rn "README.md#" docs .claude CONTRIBUTING.md` → 0; `grep -rn "root README\|README\.md" docs/skills docs/commands docs/*.md CONTRIBUTING.md` → `diagram-design.md:21` (others are `docs/specs/*/README.md` scaffolds) | `cdb4c5a` | Another stale pointer ships (Low) | — |
| P-3 | *Practical Example, Writing Good Requirements, Review Points, Core Concepts, Methodology Contract, Host Assumptions, Requirement Delta Preview, Spec Paths* are absent from `docs/flow.md` | existence | `grep -c "<text>" docs/flow.md` → 0 for each of the 8 | `cdb4c5a` | T2 shrinks (Low) | — |
| P-4 | `docs/cli.md` has no prerequisites tables and no local-checkout install | existence | `grep -ci "prerequisites\|local checkout" docs/cli.md` → 0 | `cdb4c5a` | T3 shrinks (Low) | — |
| P-5 | Package: 12 commands, 27 skills. Bindings as in §8 | data-env | `ls .claude/commands \| wc -l` → 12; `ls -d .claude/skills/*/ \| wc -l` → 27; loop `grep -m1 -E '^\s*binding:'` per `SKILL.md` | `cdb4c5a` | Group table rows change (Low) | — |
| P-6 | `ALL_TOOLS` excludes `grokbot` (`bin/akili.js:516`, DD-4 comment `:518-521`); `bin/routing.js` has 0 `grok` references | location | `sed -n 510,522p bin/akili.js`; `grep -ci grok bin/routing.js` → 0 | `cdb4c5a` | D6 rows read wrong (High: FR-11/FR-14 content) | — |
| P-7 | Digit count claims in the FR-16 doc set: only `docs/cli.md:191,192,203,204,225,242`, all totals (12/27) | consumer | `grep -noE "\b[0-9]+ (packaged \|slash \|AKILI )?(commands\|skills\|skill directories)\b" README.md docs/*.md docs/commands/*.md docs/skills/*.md CONTRIBUTING.md` → those 7 hits | `cdb4c5a` | Clause (d) needs more qualifiers (Low) | — |
| P-8 | `CONTRIBUTING.md` and `docs/release-checklist.md` already satisfy the 7 branching-flow tokens, so dropping the README site loses no positive coverage | other | `node --test test/branching-flow.test.js test/akili-security-docs.test.js test/diagram-design.test.js` → `pass 74, fail 0` (Node v22.12.0); the token loop covers both files | `dfa1be2` | D7 weakens a guarantee (High) | — |
| P-9 | `akili-marketing` touches 8 shared docs/tests and its tests pin **no** README text | consumer | `git diff --stat 8679e25...JuankCadavid/akili-marketing` (8 files); `git show JuankCadavid/akili-marketing:test/akili-marketing-command.test.js \| grep -c README` → 0 (same for `social-marketing-skill`) | branch `ea5c01d` | The rebase needs more test re-targets (Low) | — |
| P-10 | `package.json` `files` ships `README.md` and `docs` (minus `docs/specs`) and not `dotfiles/` | data-env | `sed -n 16,28p package.json` | `cdb4c5a` | D5 premise wrong (Low) | — |
| P-11 | The README's only figure is `assets/akili-flow.png` at `:45-47`, centered and linked | location | `sed -n 45,47p README.md` | `cdb4c5a` | FR-4 wording changes (Low) | — |
| P-12 | `:698` `## Requirement Delta Preview` is inside a fenced example (`:697`), not a duplicate heading | existence | `sed -n 697,698p README.md`; the fence-aware awk lists one `693:` | `cdb4c5a` | Nothing (the correction is already logged in the proposal) | — |
| P-13 | GitHub renders `## Practical Example` with the anchor `#practical-example` | data-env | `UNVERIFIED — confirm at source before relying on it` | — | FR-6's link 404s on GitHub (Low) | T6: the anchor is derived by GitHub's lowercase-hyphen rule; confirmed by the user's PR preview (HITL) |

Hand-off: P-1, P-2, P-7 and P-9 are copied into the owning tasks' `Consumers` fields (T5, T6, T8). P-13 is owned by T6 and the PR preview.

## 13. Budget

| Expected | Value |
|---|---|
| Tasks | 9 |
| LOC | ~1,250 added / ~950 removed (README −948 / +~190 is most of it) |
| Review rounds | ~24: 2 for each doc-heavy task (T2, T3, T4, T6), 2 for the test task, 1 for the rest, plus margin. **Tripwire: 30** |

The estimate matches Standard depth.
