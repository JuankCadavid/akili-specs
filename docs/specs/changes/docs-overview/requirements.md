# Requirements: a simple README and one overview that shows all of AKILI

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/docs-overview` |
| Type | Change |
| Deliverable | software. The deliverable kind is **documentation** (Video Mode does not apply) |
| Depth | **Standard**. Docs restructure plus tests; no runtime behavior |
| Approval Mode | `gated`. The user's mandate for this command (2026-10-23, quoted verbatim in Spanish: "sigue con /akili-specify changes/docs-overview … Detente antes de /akili-execute"; in English: "continue with /akili-specify changes/docs-overview … stop before /akili-execute"). The Phase 1–3 continue gates of `/akili-specify` are therefore logged as `auto-approved (user mandate for /akili-specify, 2026-10-23)`. judgment-day still runs on the design. The run stops before `/akili-execute` |
| Phase 1 gate | `auto-approved (user mandate for /akili-specify, 2026-10-23)` |
| Language rule | **All documentation this spec writes or edits is in English** (README, `docs/overview.md`, every other doc, and the spec documents). User rule, 2026-10-23 |
| Out-of-bounds actions | Local commits only (`[SPEC:changes/docs-overview]`); no push, PR, tag, release or publish. The `akili-marketing` and `video-hardening` worktrees are not touched |
| Source | `proposal.md` (Approved 2026-10-23, D1–D8) |
| Verified at | `cdb4c5a` |
| Depends on | `changes/akili-marketing`, for merge order only. Execute after it merges into `dev`, then rebase (D2) |

## 2. Executive Summary

The README is cut from 948 lines to **≤ 200 lines**. Its 7 sections follow a fixed order for a new user: what AKILI is → the flow figure → install → first spec → commands at a glance → learn more → contributing and license. Every removed line gets a destination in `docs/`, recorded in a move ledger, so nothing is lost. A new `docs/overview.md` becomes the "everything AKILI ships" page. A new package-derived test keeps the inventory, the counts, the README order and length, and the jargon rule from drifting. Three existing tests that pin maintainer text in the README are re-targeted to where that text now lives. Their assertions do not change, and the README keeps their negative guards.

## 3. Glossary

| Term | Meaning in this spec |
|---|---|
| Landing README | The root `README.md` after this spec: the 7-section page defined in FR-1 |
| Overview | The new `docs/overview.md`, the full capability map (FR-11) |
| Move ledger | `docs/specs/changes/docs-overview/move-ledger.md`. One row per current README `##`/`###` section: its destination file and anchor, or the existing doc that already holds it |
| Pin | A test assertion that requires specific text at a specific doc site |
| Re-target | Change the file a pin reads, keeping its assertion text unchanged |
| Negative guard | A pin that asserts some text is **absent** (e.g. no in-target run-directory phrasing) |
| Package inventory | The set of `.claude/commands/*.md` basenames and `.claude/skills/*/` directory names, read at test time |
| Jargon term | A term on the FR-10 list |
| Fence-aware heading | A Markdown heading line outside any ` ``` ` code block |

## 4. System Context & Scope

Today (all as run at `cdb4c5a`):

| Fact | Evidence |
|---|---|
| README is 948 lines with 25 fence-aware `##` and 18 `###` headings (43 in total; the hero tagline at `:14` is one of the `###`). A raw `grep -c '^## '` gives 26 because it also counts the fenced example at `:698` | `wc -l README.md`; `awk '/^```/{f=!f} !f && /^## /' README.md \| wc -l` → 25; the same with `/^### /` → 18 |
| The first install command is at `:202`, after 3 prerequisite tables | `grep -n 'npx akili-specs init' README.md` → `202` |
| The hero has 13 badge images | `grep -c 'shields.io' README.md` → 13 |
| The figure is `assets/akili-flow.png`, centered and linked at `:48-50` (the `<a>`/`<img>` are on `:49`) | `grep -n akili-flow README.md` → `49`; `sed -n 48,50p README.md` |
| Package: 12 commands, 27 skills | `ls .claude/commands \| wc -l` → 12; `ls -d .claude/skills/*/ \| wc -l` → 27 |
| `docs/overview.md` does not exist | `ls docs/overview.md` → No such file |
| *Practical Example*, *Writing Good Requirements*, *Review Points*, *Core Concepts*, *Methodology Contract*, *Host Assumptions*, *Requirement Delta Preview*, *Spec Paths* appear in no `docs/flow.md` heading or text | `grep -c "<heading text>" docs/flow.md` → 0 for each (loop run 2026-10-23) |
| `docs/cli.md` has no *Prerequisites* and no *Local Checkout* content | `grep -ci "prerequisites\|local checkout" docs/cli.md` → 0 |
| Digit count claims exist only in `docs/cli.md`: 9 hits at `:125, 191, 192, 203, 204, 225 (×2), 242 (×2)`, all totals (`12 command skills`, `12 commands`, `27 packaged skills`) | `grep -noE "\b[0-9]+ (packaged \|slash \|AKILI )?(commands?\|command skills\|skills\|skill directories)\b" README.md docs/*.md docs/commands/*.md docs/skills/*.md CONTRIBUTING.md` → 9 |
| `docs/cli.md` already links a dead anchor `#grok-bot-grokbot` at `:21, 48, 110` (and README `:193, 229`). The heading `## Grok Bot (`--tool grokbot`)` at `:240` slugs to `grok-bot---tool-grokbot` under GitHub's rule (lowercase; drop punctuation other than `-` and space; space → `-`) | `grep -rn "grok-bot-grokbot" README.md docs CONTRIBUTING.md`; `grep -n '^## Grok' docs/cli.md` → `240` |
| `.claude/skills/diagram-design/SKILL.md:76` says Archify's install "is documented in the project README" | `sed -n 76p .claude/skills/diagram-design/SKILL.md` |
| The audit's "duplicate `## Requirement Delta Preview` at `:693`/`:698`" is **false**: `:698` is inside a ` ```markdown ` example | `sed -n 697,698p README.md` |

**In scope:** `README.md`, the new `docs/overview.md`, `docs/README.md`, `docs/flow.md`, `docs/cli.md`, `docs/model-routing.md`, `docs/openspec-comparison.md`, `CONTRIBUTING.md`, the new `dotfiles/README.md`, `CHANGELOG.md`, the new `test/docs-overview.test.js`, and pin re-targets in `test/branching-flow.test.js`, `test/akili-security-docs.test.js`, `test/diagram-design.test.js`.

**Out of scope:** `.claude/**`, `bin/**`, `package.json`, `assets/**`, `docs/commands/*.md` and `docs/skills/*.md` beyond link fixes, the fixed counts in existing tests, and any behavior change.

## 5. Stakeholders / Personas

| Persona | Need |
|---|---|
| **New user** (first visit on GitHub or npm) | Understand what AKILI is, install it, run a first spec, with no unexplained terms |
| **Returning user** | Find any command, skill or capability in one click from the README |
| **Contributor / maintainer** | Find release, repository structure and dotfiles content, which moves out of the README |
| **Future spec author** | Add a command or skill and have the test say exactly which doc rows are missing |

## 6. Functional Requirements

### FR-1: README section order and heading levels

The README SHALL have exactly these fence-aware `##` headings, in this order: `## What is AKILI?`, `## How it works`, `## Install`, `## Your first spec`, `## Commands at a glance`, `## Learn more`, `## Contributing and license`. `###` headings SHALL appear only under `## Install` (`### What you need`, `### Install`, `### Check it worked`) and under `## Commands at a glance` (`### In your AI assistant`, `### In your terminal`). No `####` or deeper SHALL appear outside code blocks.

#### Scenario: Reader scans the headings

- GIVEN the landing README
- WHEN the fence-aware headings are listed
- THEN the `##` list equals the seven headings above, in order
- AND the `###` list equals the five headings above, each under its parent
- BUT it must NOT contain any other `##` or `###` heading (e.g. `## Dotfiles`, `### Releasing Package Updates`)
- AND IT MUST ignore heading-like lines inside code blocks

### FR-2: README length

The README SHALL be at most **200 lines**. The first `npx akili-specs init` SHALL appear at or before line **90**.

#### Scenario: Install is near the top

- GIVEN the landing README
- WHEN its lines are counted
- THEN the count is ≤ 200
- AND the first line containing `npx akili-specs init` has a line number ≤ 90
- BUT it must NOT meet the cap by folding content into `<details>` blocks (no `<details>` element in the README, tested)
- AND IT MUST NOT meet the cap by packing several sentences into one long line (Reviewer-gated: not machine-checked)

### FR-3: What is AKILI?

`## What is AKILI?` SHALL open with at most 3 sentences, in plain language, saying that AKILI adds slash commands and skills to an AI coding assistant, makes the assistant write a spec before coding, then build, test and check the work against it, and learn from each change. It SHALL then list **What you get** as exactly 5 bullets, the last naming the extra deliverables (security, SEO, video, diagrams, and marketing once `/akili-marketing` is packaged) and linking `docs/overview.md`. It SHALL end with a mini glossary table defining *slash command*, *skill*, *spec*, *constitution*.

#### Scenario: A new user reads the first section

- GIVEN the landing README
- WHEN the reader finishes `## What is AKILI?`
- THEN the opening paragraph has ≤ 3 sentences
- AND the *What you get* list has 5 bullets, one of them linking `docs/overview.md`
- AND the glossary table has rows for exactly those 4 terms
- AND IT MUST name marketing: execution runs after the `akili-marketing` rebase (D2), so `/akili-marketing` is packaged when this text is written
- BUT it must NOT name a capability the package does not ship

### FR-4: How it works

`## How it works` SHALL show the existing `assets/akili-flow.png`, centered (`<p align="center">`), linked to its full-size raw URL, with a **new, shorter alt text** in plain words. The alt text makes no claim the figure lacks and uses no explained term (FR-10) other than the 4 README glossary terms, so the existing alt text (which says "Kaizen retrospective" and "Bug Track") is replaced. It SHALL add at most 4 lines of explanation and a link to `docs/flow.md`.

#### Scenario: Figure kept

- GIVEN the landing README
- WHEN the section renders
- THEN the image source is `https://raw.githubusercontent.com/JuankCadavid/akili-specs/master/assets/akili-flow.png` inside a `<p align="center">`
- AND the `alt` text passes the FR-10 check
- BUT it must NOT modify `assets/akili-flow.png` or `assets/akili-flow.svg` (`git diff --stat -- assets/` empty)

### FR-5: Install

`## Install` SHALL state the requirements (Node.js 18+, Git, one supported AI tool) and the one install command `npx akili-specs init` with what the wizard asks. It SHALL give one pnpm line (`pnpm dlx akili-specs …`), the check `npx akili-specs doctor`, and the instruction to restart the tool and type `/akili-` (Codex: `$akili-`). Everything else (per-target flags, manual install, local checkout, global install, install paths, updating, troubleshooting, optional tools) SHALL be reached by a link to `docs/cli.md`.

#### Scenario: First install

- GIVEN a new user with Node 18+
- WHEN they follow `## Install`
- THEN they run one command to install and one to check
- AND they find a link to `docs/cli.md` for anything else
- BUT it must NOT list per-tool `doctor --tool <x>` commands or prerequisite tables
- AND IT MUST name Grok Bot only as a supported tool, with its install path reached through the link

### FR-6: Your first spec

`## Your first spec` SHALL give 5 numbered steps, each naming what you type, what AKILI does, and which file appears: (1) `/akili-constitution`, (2) `/akili-propose <name>`, (3) `/akili-specify <spec-path>`, (4) `/akili-execute <spec-path>`, (5) `/akili-test`, `/akili-validate`, `/akili-archive`. It SHALL add one line for `/akili-quick` (tiny copy or color change), one line for `/akili-resume` (coming back after a break), and a link to `docs/flow.md#practical-example`.

#### Scenario: First spec

- GIVEN the landing README
- WHEN the reader follows the steps
- THEN each step names a command and an output file or effect
- AND the `docs/flow.md#practical-example` anchor resolves
- BUT it must NOT include a sample `proposal.md` or any other generated document (approved answer to the proposal's open question)

### FR-7: Commands at a glance

`### In your AI assistant` SHALL be one table with a row for **every** packaged command, in two groups ("Every change" for the 7 lifecycle commands, "Any time" for the rest). Each row has the command, linked to `docs/commands/<name>.md`, and a plain "Use it to…" line. The `/akili-security` row SHALL say it is not supported on native Windows. `### In your terminal` SHALL list the `akili` CLI subcommands `init`, `install`, `update`, `list`, `doctor` (with `--agents`), `routing`, `check-update`, `notifications`, one short line each, plus a link to `docs/cli.md`.

#### Scenario: A command added later

- GIVEN a package with a new `.claude/commands/akili-x.md`
- WHEN `npm test` runs
- THEN the test fails, naming `akili-x` as missing from the README command table and from `docs/overview.md`
- AND each row's link target exists
- BUT it must NOT describe a command with a claim its `docs/commands/<name>.md` page does not make

### FR-8: Learn more, contributing and license

`## Learn more` SHALL be one "I want to… → read" table linking at least `docs/overview.md`, `docs/flow.md`, `docs/commands/README.md`, `docs/skills/README.md`, `docs/cli.md`, `docs/model-routing.md`, `docs/skills/governance.md`, `docs/openspec-comparison.md`. `## Contributing and license` SHALL link `CONTRIBUTING.md` and `docs/release-checklist.md`, name the MIT license, and keep the authorship line (Juan Carlos Cadavid, jcadavid.com).

#### Scenario: Deep link

- GIVEN the landing README
- WHEN the reader opens any *Learn more* link
- THEN the target file exists
- AND `docs/overview.md` is the first row

### FR-9: Hero

The hero SHALL keep the centered ASCII logo and `# AKILI`, replace the `###` tagline and bold line with **one plain sentence**, show exactly **3** badges (npm version, license, Node.js 18+), and add one text line naming the 6 tools and 3 operating systems.

#### Scenario: First screen

- GIVEN the landing README
- WHEN the hero renders
- THEN `shields.io` appears exactly 3 times
- AND the text line names Claude Code, OpenCode, Google Antigravity, OpenAI Codex CLI, Cursor, Grok Bot, macOS, Linux and Windows
- BUT it must NOT keep the `### Supercharge…` heading (FR-1 forbids it)

### FR-10: Jargon rule

Each **explained term** (*spec, constitution, slash command, skill, Kaizen, harness, persona, model routing, tier, Bug Track, HITL, worktree, CodeGraph*) that appears in README prose SHALL either be defined in the README glossary table (FR-3) or, at its first occurrence, sit inside the text of a Markdown link (`[… term …](…)`). For this check, *prose* excludes fenced code blocks, inline code spans and URLs (Markdown link targets, `href`/`src` values), and includes `alt` attribute text. The **README-banned terms** (*fence, drift, Leader, Implementer, Reviewer, digest, Apply Mode*) SHALL NOT appear in the README outside fenced code blocks and URLs. **Inline code is not exempt for banned terms.**

#### Scenario: Unexplained term

- GIVEN the landing README with `harness` used in prose, not inside a link text, and absent from the glossary
- WHEN `npm test` runs
- THEN the test fails, naming `harness` and its line
- AND a README containing `Reviewer` in prose fails, naming the banned term
- AND IT MUST match whole words (a term or its plural `-s` form), case-insensitively, for both lists. So `reviewer` in a sentence is caught, and `specification` does not count as `spec`

### FR-11: Overview page

`docs/overview.md` SHALL contain, in this order: (1) what AKILI is, in one paragraph; (2) **Commands**: lifecycle and anytime, every packaged command exactly once, linked; (3) **Skills by purpose**: every packaged skill exactly once, under exactly one of the groups *Quality and process*, *Frontend and design*, *Backend and architecture*, *Product*, *Deliverables*, each with its binding level (`core`/`conditional`/`stack`, as declared in its `SKILL.md`) and a link to `docs/skills/<name>.md`; (4) **How AKILI works under the hood**: one line each, with a link, for the multi-agent harness, `.agents/` personas, the Kaizen Loop, model routing (`akili routing`), `akili doctor --agents`, CodeGraph, the Bug Track, `/akili-quick`'s triviality gate, the Pivot Protocol, fleet execution, Context Discipline, constitution's 3 project modes, and `/akili-seo`'s analytics phase (GA4/Clarity); (5) **Install targets**: one row per target (Claude Code, OpenCode, Google Antigravity, OpenAI Codex CLI, Cursor, Grok Bot) with the columns default path · in `init` · in `--tool all` · routing wrappers · `doctor`; (6) **Optional tools**: CodeGraph, `gh`, Python for `/akili-seo` verification, HyperFrames (through `video-production`), Archify (through `diagram-design`); (7) **Glossary** of every AKILI term the README or overview uses; (8) an **"I want to… → use"** table.

#### Scenario: Skill added later

- GIVEN a package with a new `.claude/skills/new-skill/`
- WHEN `npm test` runs
- THEN the test fails, naming `new-skill` as missing from `docs/overview.md` and `docs/skills/README.md`
- AND a skill listed under two groups fails, naming both groups
- AND a binding cell that differs from the `SKILL.md` `metadata.binding` fails
- BUT it must NOT accept a skill name that appears only inside prose (membership is by table row)

#### Scenario: Grok Bot limits

- GIVEN the install-target table
- WHEN the reader reads the Grok Bot row
- THEN `init` and `--tool all` read "no", routing wrappers read "no", and the row links `docs/cli.md#grok-bot---tool-grokbot` (the anchor of `docs/cli.md:240`)
- AND IT MUST match the code: `ALL_TOOLS` in `bin/akili.js` excludes `grokbot`, and `bin/routing.js` has no `grok` reference (the test checks both)

### FR-12: No content lost

Every current README `##`/`###` section (43 fence-aware headings at `cdb4c5a`) SHALL have a row in the move ledger with exactly one disposition: **kept** (with its new README heading), **moved** (destination file + anchor), **already in** (existing file + anchor holding the same content), or **dropped** (with a reason, only for text that is false or about the README itself). Each moved or already-in destination SHALL hold the section's obligations at HEAD: every command, path, flag, rule and claim the section stated.

#### Scenario: Practical Example moves

- GIVEN README *Practical Example* (`:762-795`)
- WHEN the move completes
- THEN `docs/flow.md` has a `## Practical Example` section with the three command sequences
- AND FR-6's link resolves to it
- BUT it must NOT mark a section "already in" on the strength of a heading match alone: the ledger row quotes the destination text that holds each obligation

### FR-13: Docs hub

`docs/README.md` SHALL list `overview.md` first in *Start Here* and in the *Documentation Map*, SHALL link `skills/governance.md` in both, and SHALL present the anytime commands as a table (command · use it to · link) instead of loose sentences.

#### Scenario: Hub reader

- GIVEN `docs/README.md`
- WHEN the reader opens *Start Here*
- THEN the first link is `overview.md`
- AND `skills/governance.md` is linked
- AND the anytime commands appear as table rows

### FR-14: Grok Bot routing line

`docs/model-routing.md` SHALL state in one line that Grok Bot has no routing wrappers and is not a target of `akili routing`.

#### Scenario: Routing reader

- GIVEN `docs/model-routing.md`
- WHEN searched for `Grok Bot`
- THEN one line states it has no routing wrappers
- BUT it must NOT claim a behavior `bin/routing.js` does not have

### FR-15: Pins re-targeted, never weakened

Each README pin SHALL be re-targeted with its assertion text unchanged:

| Test | Positive pin moves to | Negative guard on README |
|---|---|---|
| `test/branching-flow.test.js` (7 release-flow tokens in `### Releasing Package Updates`) | dropped for README; `CONTRIBUTING.md` and `docs/release-checklist.md` keep it | the "no direct chore(release) commit followed by git tag block" check runs on the **whole** README |
| `test/akili-security-docs.test.js` (slug presence; ≥ 1 run-directory line with "always outside the target") | `docs/overview.md` | the slug-shape checks (no `-s<n>` without `-r<N>`, no non-template suffix), the in-target phrase family, and the no-git check all still read the README |
| `test/diagram-design.test.js:409-412` (Archify install, attribution, "never ships or installs it") | `docs/overview.md` | — |

#### Scenario: A weakened restatement reappears in the README

- GIVEN the landing README with a new line `/akili-security … run directory in an ignored in-target directory`
- WHEN `npm test` runs
- THEN `test/akili-security-docs.test.js` fails, naming `README.md`
- AND removing the slug from `docs/overview.md` fails the slug presence test, naming `docs/overview.md`
- AND removing `never ships or installs it` from `docs/overview.md` fails the diagram-design test
- BUT it must NOT change any regex, token list or message text of an existing assertion
- AND IT MUST limit structural changes to the three that design §9 lists: which file a site reads; splitting a site map into presence and shape sets; and the README run-directory presence check becoming conditional (every README `run directory` line, if any, still says "always outside the target") because its positive pin moved to `docs/overview.md`

### FR-16: Derived inventory and structure test

`test/docs-overview.test.js` SHALL read the package inventory at test time and assert: (a) overview membership (FR-11); (b) README command table membership (FR-7); (c) `docs/skills/README.md` has one inventory row per skill; (d) every digit claim `<N> [packaged |slash |AKILI ](command|commands|command skills|skills|skill directories)` in `README.md`, `docs/*.md`, `docs/commands/*.md`, `docs/skills/*.md` and `CONTRIBUTING.md` equals the derived total (commands for `command`/`commands`/`command skills`, skills otherwise), unless the same line contains a subset qualifier (`lifecycle`, `loop`, `anytime`, `core`, `conditional`, `stack`, `group`); (e) FR-1 heading order; (f) FR-2 length, install position, no `<details>`; (g) FR-10 jargon rule; (h) FR-11 Grok Bot row (all three "no" cells, its link) and the code check; (i) every relative link in `README.md`, `docs/overview.md` and `docs/README.md` resolves to an existing file **and**, when it has a `#anchor`, to a heading of that file under the GitHub slug rule; (j) the countable README and hub clauses: exactly 3 `shields.io`; the hero line names the 6 tools and 3 OSes; 5 *What you get* bullets; 4 glossary rows; the figure `src` inside `<p align="center">`; no `doctor --tool` in the README; `docs/overview.md` first in *Learn more*; `docs/README.md` *Start Here* first link `overview.md`, a `skills/governance.md` link, and the anytime commands as table rows; the `docs/model-routing.md` Grok Bot line. It SHALL hard-code no count of commands or skills.

#### Scenario: Marketing lands

- GIVEN `akili-marketing` merged (13 commands, 28 skills) and the overview rows added
- WHEN `npm test` runs
- THEN the test passes without edits to `test/docs-overview.test.js`
- AND a `docs/cli.md` line still saying `12 commands` or `12 command skills` fails, naming the file and line

### FR-17: Moved content, roadmap, dotfiles, CHANGELOG

- `docs/openspec-comparison.md` SHALL gain a `## Roadmap` section holding the 3 planned improvements.
- `dotfiles/README.md` SHALL hold the Neovim and tmux restore steps.
- `CONTRIBUTING.md` SHALL hold *Repository Structure*.
- `docs/cli.md` SHALL hold the prerequisite tables and the local-checkout install.
- Docs that point at moved README content SHALL point at its new home: `docs/skills/diagram-design.md:21` ("the command is in the root `README.md`") names `docs/overview.md` instead. `.claude/skills/diagram-design/SKILL.md:76` ("documented in the project README") is out of scope (NFR-3). It stays reachable because the README *Learn more* table links the overview's *Optional tools*. This is recorded as an accepted Low risk with a `/akili-quick` follow-up.
- The dead `#grok-bot-grokbot` anchors in `docs/cli.md` (`:21, 48, 110`) SHALL be corrected to `#grok-bot---tool-grokbot`.
- `docs/skills/governance.md` acceptance checklist item 5 (*Docs + CHANGELOG*) SHALL also require the skill's row in `docs/overview.md`, so a new skill's author learns about the obligation from the checklist, not only from a failing test.
- `CHANGELOG.md` `## [Unreleased]` SHALL replace its `### Notes` / "No unreleased changes yet." placeholder (or, after the rebase, join the entries marketing added) with one *Changed* entry describing the landing README, `docs/overview.md`, the new test and the re-targeted pins. Every clause SHALL be quote-checked at HEAD (KZ-002).

#### Scenario: Contributor looks for the release flow

- GIVEN the landing README
- WHEN a contributor follows `## Contributing and license`
- THEN `CONTRIBUTING.md` and `docs/release-checklist.md` hold the release flow
- AND `CONTRIBUTING.md` holds the repository structure
- BUT the root README must NOT contain `## Dotfiles` or `nvim`

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | `npm test`, `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` all pass at every task end that edits a pinned doc or a test |
| NFR-2 | **English only.** Every changed or new doc line is in English. Gate: the Reviewer reads the diff, plus `git diff -U0 -- '*.md' \| grep -niE '\b(el\|los\|las\|qué\|también\|para\|está\|cómo\|usuario)\b'` → 0 hits on `+` lines (heuristic, see defect classes) |
| NFR-3 | File scope per §4; `git diff --stat cdb4c5a -- .claude bin package.json assets` empty |
| NFR-4 | Local commits only, prefix `[SPEC:changes/docs-overview]`; no push/tag/release/publish |
| NFR-5 | No shipped file links `docs/specs/changes/docs-overview/` (KZ-changes--archify-diagrams-1). The move ledger is a spec artifact and is never linked from shipped docs |
| NFR-6 | `npm run pack:dry-run` still lists `README.md`, `docs/overview.md`, `assets/akili-flow.png`, and does not list `dotfiles/` |

### Defect classes and their gates

| Defect class | Gate |
|---|---|
| Inventory or count mismatch | `test/docs-overview.test.js` (a)–(d), derived from the package |
| README order, length or heading drift | `test/docs-overview.test.js` (e)–(f) |
| Unexplained jargon or banned term | `test/docs-overview.test.js` (g) |
| Prose not plain, definitions unclear, FR-3 paragraph over 3 sentences, several sentences packed into one line (FR-2 AND IT MUST) | **No automated check.** Substitute: the `full` Reviewer reads the README whole at the README-rewrite task, and the user reviews it at the PR |
| Unique README content lost in a move | Move ledger walk (FR-12): each row's destination quote checked at HEAD by the Reviewer. No automated check can prove semantic equivalence, so this is a human/agent check, recorded per row |
| Re-targeted pin weakened | Mutation per pin (FR-15 scenario), executed and quoted in the task |
| Restatement drift on `/akili-security` or Archify lines | `node --test test/akili-security-docs.test.js test/diagram-design.test.js` after every task that moves such a line |
| Overstated claim in a "Use it to…" line, an overview line or the CHANGELOG (KZ-002) | Quote-check against the command/skill page or frontmatter at HEAD (Reviewer). No automated check |
| Broken relative link or anchor | `test/docs-overview.test.js` (i) for README, overview and hub, slug-aware; link check in task verification for the other edited docs |
| Countable layout clause regresses (badges, bullets, glossary rows, figure, hub order, routing line) | `test/docs-overview.test.js` (j) |
| A shipped `.claude` text still points Archify readers to "the project README" | **Accepted risk (Low)**, out of scope (NFR-3). Follow-up: `/akili-quick` on `.claude/skills/diagram-design/SKILL.md:76` |
| Non-English text | NFR-2 heuristic grep, plus the Reviewer. **Accepted risk:** the heuristic misses Spanish without those words; the Reviewer reading is the real gate |
| Rendered README looks wrong on GitHub (centering, table width) | No automated check reads rendered GitHub Markdown. Substitute: the user previews the branch on GitHub at the PR (after this spec, user-owned push), recorded as an accepted risk for local execution |

## 8. Requirement ID Index

| ID | Title |
|---|---|
| FR-1 | README section order and heading levels |
| FR-2 | README length |
| FR-3 | What is AKILI? |
| FR-4 | How it works |
| FR-5 | Install |
| FR-6 | Your first spec |
| FR-7 | Commands at a glance |
| FR-8 | Learn more, contributing and license |
| FR-9 | Hero |
| FR-10 | Jargon rule |
| FR-11 | Overview page |
| FR-12 | No content lost |
| FR-13 | Docs hub |
| FR-14 | Grok Bot routing line |
| FR-15 | Pins re-targeted, never weakened |
| FR-16 | Derived inventory and structure test |
| FR-17 | Moved content, roadmap, dotfiles, CHANGELOG |
| NFR-1…6 | Verification, English, file scope, commits, no active-spec links, package contents |
