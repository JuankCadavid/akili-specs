# Proposal: A simple README and one overview that shows all of AKILI

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/docs-overview` |
| Slug | `docs-overview`, taken from the argument's first token |
| Type | **Change**. A documentation restructure, one new inventory/structure test, and new targets for three existing README pins. No command, skill, template, installer or CLI behavior changes |
| Deliverable | software. The deliverable kind is **documentation** (neither software nor video), so Video Mode does not apply |
| Approval Mode | `gated`. The user asked to stop at the propose decision gate |
| Out-of-bounds actions | Local commits only: no push, PR, tag, release or publish. The `akili-marketing` and `video-hardening` worktrees are not touched |
| Date | 2026-10-23 (rev. 2, same day) |
| Author | AKILI session (proposer), from Juan Carlos Cadavid's audit at `dev` 8679e25 |
| Status | **Approved** — 2026-10-23 (Juan Carlos Cadavid): D1–D8 as recommended; open question answered as recommended (no sample `proposal.md` in the README, link to `docs/flow.md` → *Practical Example*). Rule added at approval: all documentation (README, `docs/overview.md` and every other doc) is written in English |
| Revision log | rev. 1 `35e9d4b`: capability overview + derived test. **rev. 2**: Juan Carlos Cadavid's new requirements (2026-10-23). The README must be simple for a new user, with a fixed section order, no unexplained jargon, and a substantially shorter length. Detail moves to `docs/`. This adds D7 (re-target the README pins) and D8 (hero). D1 now holds the exact section list and target length. The budget is re-estimated |
| Depends on | `changes/akili-marketing` (merge order only, see D2) |
| Parallel-safe | **no**. `akili-marketing` modifies 12 existing files, 7 of which this spec also edits (`README.md`, `docs/README.md`, `docs/cli.md`, `docs/flow.md`, `docs/skills/governance.md`, `test/diagram-design.test.js`, `CHANGELOG.md`). Corrected at specify, 2026-10-23: rev. 2 said "8 of the same files"; see design P-9, per `git diff --stat 8679e25...JuankCadavid/akili-marketing` run 2026-10-23 |
| Release class | patch: docs plus tests, with no new command, target or behavior |

## User requirements (rev. 2, verbatim intent)

| # | Requirement from Juan Carlos Cadavid |
|---|---|
| U1 | The README is simple and easy for a new user, not overwhelming. The information is fine, but it is too long and poorly told |
| U2 | Section order: **what AKILI is → flow diagram (keep the current one, centered) → install → first use → command summary → links to detailed docs** |
| U3 | "What it is" and "how to install" are clear and near the top |
| U4 | No unexplained jargon |
| U5 | The README is substantially shorter, with detail moved to `docs/` |
| U6 | Headings are well organized |

## Answer first: decisions to approve

| # | Decision | Recommendation | Why |
|---|---|---|---|
| D1 | README length and exact structure | **Target ≤ 200 lines (today 948, about −80%). There are exactly 7 `##` sections in the U2 order, and `###` is used only inside *Install* and *Commands*.** The full list is in [README structure (D1)](#readme-structure-d1) | One screen per section; a new user reads top to bottom without hitting maintainer content. 200 lines fits the 7 sections at their sizes below with about 10% margin |
| D2 | In-flight specs | **Specify now. Execute only after `akili-marketing` merges into `dev`, then rebase, so `/akili-marketing` and `social-marketing` appear as real rows.** No empty slots. `video-production-hardening` needs nothing: the README and overview only link to `docs/skills/video-production.md` | The README rewrite conflicts with every line marketing touches, so landing second avoids a 7-file conflict (corrected at specify; see design P-9). Empty "coming soon" slots would ship false claims if marketing slips |
| D3 | Inventory and structure test | **Add a new `test/docs-overview.test.js`, derived from the package:** (a) each `.claude/commands/*.md` and `.claude/skills/*/` appears exactly once in `docs/overview.md` under one purpose group; (b) each command appears in the README *Commands at a glance* table; (c) `docs/skills/README.md` has one row per skill; (d) every "N commands" / "N skills" claim in `README.md` and `docs/*.md` equals the derived count; (e) the README `##` headings equal the D1 list in order; (f) README ≤ 200 lines; (g) each [jargon term](#jargon-rule-u4) in the README is explained at its first use or linked to the glossary | Counts and structure stay correct after marketing (13/28) and after any later skill, without hard-coded numbers (KZ-002). (e)–(g) keep U1–U6 from eroding in later specs |
| D4 | Roadmap and "Auxiliary commands" | **Move *Planned Improvements Inspired By OpenSpec* into `docs/openspec-comparison.md` under a *Roadmap* heading. The long auxiliary paragraphs become one-line rows in *Commands at a glance*, each linking to its `docs/commands/*.md` page** | Roadmap is not reference, and a new user needs neither |
| D5 | Dotfiles (Neovim/tmux) | **Move them to a new `dotfiles/README.md`. The root README drops them entirely** | `dotfiles/` is not in `package.json` `files`, so it is not product content |
| D6 | Grok Bot gaps (`init`, routing) | **Docs only, no code change.** The overview's install-target table has one row per target (6) with init / `--tool all` / routing wrappers / doctor columns. Grok Bot: init and `--tool all` "no" by design (`bin/akili.js:517`, comment `:519-521`, DD-4 of `changes/grokbot-target`), routing "no" (`grep -ci grok bin/routing.js` → 0). One line in `docs/model-routing.md`. The README only names Grok Bot as a supported tool and links to the table | The behavior is intentional; the finding is a visibility gap |
| D7 (new) | Tests that pin maintainer text in the README | **Move each README pin to the doc that receives the content, with the same assertions.** (1) `test/branching-flow.test.js`: drop the `README.md (Releasing Package Updates)` site. `CONTRIBUTING.md` and `docs/release-checklist.md` already carry the same tokens and stay pinned, and the README keeps the negative "no direct commit-then-tag block" guard. (2) `test/akili-security-docs.test.js`: the README positive sites (slug, "run directory (always outside the target)") move to `docs/overview.md`, and the README keeps the negative "no in-target run directory" guard. (3) `test/diagram-design.test.js:409-412`: the Archify install, attribution and "never ships or installs it" assertions move to `docs/overview.md` (*Optional tools*) | U1/U4 rule out the release procedure and the security run-directory rules on a new user's page. Keeping them would cost about 60 lines of maintainer text. Moving the pins keeps every guarantee, and the negative guards still stop a weakened restatement from appearing in the README |
| D8 (new) | Hero (top of README) | **Keep the ASCII logo and title, centered. Swap the 2-line marketing tagline for one plain sentence. Cut the 13 badges to 3 (npm version, license, Node 18+). The 7 tool badges (6 hosts + CodeGraph) and 3 OS badges become one text line: "Works with Claude Code, OpenCode, Google Antigravity, OpenAI Codex CLI, Cursor and Grok Bot · macOS, Linux, Windows".** The `/akili-security` Windows caveat moves to that command's row | 13 badges are the first "overwhelming" screen (U1). The text line says the same thing and is searchable |

## README structure (D1)

Target **≤ 200 lines**; the test checks the order of headings (D3 e). Sizes are estimates.

| # | Heading | Content (plain language) | ~Lines |
|---|---|---|---|
| 0 | *(hero, no heading level 2)* | Centered ASCII logo, `# AKILI`, one-sentence tagline, 3 badges, the "Works with" line | 22 |
| 1 | `## What is AKILI?` | 3 sentences: AKILI is a set of slash commands and skills you add to your AI coding assistant. It has the assistant write down what you want (a *spec*) before coding, then build, test and check the work against it, and it learns from every change. Then **What you get**, 5 bullets (shared project context · traceable changes · built-in review and tests · it improves itself · extras: security, SEO, video, diagrams, marketing → overview link). Then a **4-term mini glossary** (*slash command*, *skill*, *spec*, *constitution*) | 28 |
| 2 | `## How it works` | The **current** `assets/akili-flow.png` figure, centered (same `<p align="center">` + link). 4 short lines: set up once with `/akili-constitution`; each change goes propose → archive; anytime commands; a link to `docs/flow.md` | 14 |
| 3 | `## Install` | `### What you need`: Node 18+, Git, one supported AI tool (3 bullets; optional tools link to `docs/cli.md`). `### Install`: `npx akili-specs init` (one line on what the wizard asks; one pnpm line). `### Check it worked`: `npx akili-specs doctor`, then restart your tool and type `/akili-`. Other targets, flags and manual install link to `docs/cli.md` | 32 |
| 4 | `## Your first spec` | 5 numbered steps, each saying what you type, what AKILI does, and which file appears: `/akili-constitution` → `/akili-propose my-feature` → `/akili-specify` → `/akili-execute` → `/akili-test`, `/akili-validate`, `/akili-archive`. Plus one line: "Tiny copy or color change? Use `/akili-quick`." Plus one line: "Coming back after a break? `/akili-resume`." | 30 |
| 5 | `## Commands at a glance` | `### In your AI assistant`: one table, 2 groups (*Every change*: 7 rows · *Any time*: 5 rows, 6 after marketing), with a "Use it to…" column in plain words and each command linking to its page. `### In your terminal`: the 8 `akili` CLI rows, one short line each, with a link to `docs/cli.md` | 42 |
| 6 | `## Learn more` | One table, "I want to… → read": everything AKILI does (`docs/overview.md`) · the full flow · every command · every skill · CLI and install targets · model routing · skill governance · OpenSpec comparison and roadmap | 16 |
| 7 | `## Contributing and license` | 2 lines → `CONTRIBUTING.md`, `docs/release-checklist.md`; MIT; author line | 8 |
| | **Total** | | **~192** |

### Jargon rule (U4)

The README uses these terms only when they are explained at first use or linked to the mini glossary or a doc: *spec, constitution, slash command, skill, Kaizen, harness, persona, model routing, tier, Bug Track, HITL, worktree, CodeGraph*. Terms like "fence", "drift", "Leader/Implementer/Reviewer", "digest" and "Apply Mode" stay out of the README and live in `docs/`. Test D3 (g) checks the first-use rule for the listed terms.

### Where the removed README content goes (move ledger summary)

The full section-by-section ledger is task T1. Nothing is deleted without a destination or a named duplicate.

| Current README section(s) | Destination |
|---|---|
| *What AKILI Covers*, *Contents*, *Dependencies* (Archify / HyperFrames) | `docs/overview.md` (capability map, optional tools) |
| *Prerequisites* tables, *Steps 1–5*, *Local Checkout / Global Install*, *Install Paths*, *Updating*, *Manual Install*, *Troubleshooting*, *CLI Commands* options and safety rules | `docs/cli.md` (most already there; merge only the differences) |
| *Releasing Package Updates* | Already in `CONTRIBUTING.md` and `docs/release-checklist.md`, so it is dropped from the README (D7) |
| *Repository Structure* | `CONTRIBUTING.md` (contributor content) |
| *Start Here* detail (project modes, brand-new projects, CodeGraph), *How To Choose The Right Depth*, *Core Concepts*, *The Kaizen Loop*, *Spec Folder Shape*, *Requirement Delta Preview*, *Writing Good Requirements*, *Review Points*, *Practical Example*, *Spec Paths*, *Methodology Contract*, *Multi-Agent Harness Engineering*, *Host Assumptions*, *Notes* | `docs/flow.md` where it is not already there; one-line entries in `docs/overview.md` |
| *Capability-Tier Model Routing* | `docs/model-routing.md` (already there) |
| *Planned Improvements Inspired By OpenSpec* / *Auxiliary commands* | `docs/openspec-comparison.md` *Roadmap* / *Commands at a glance* rows (D4) |
| *Dotfiles* | `dotfiles/README.md` (D5) |
| *Command Map*, *Docs* | Replaced by *Commands at a glance* and *Learn more* |

## Intent

A new user who opens the README understands what AKILI is, sees the flow, installs it and runs a first spec, all from the top of one short page. A returning user finds everything AKILI ships, grouped by purpose, one click away in `docs/overview.md`.

## Problem / Current Behavior

| # | Today | Evidence (as run 2026-10-23, `dev` 8679e25) |
|---|---|---|
| 1 | The README is 948 lines with 25 fence-aware `##` and 18 `###` headings (43 in total; corrected at specify from "26 `##`"). "What it is" is 2 paragraphs at `:43` and `:45` (`sed -n 43,45p README.md`), and the install command first appears at `:202`, after a 3-table prerequisites block | `wc -l README.md`; `grep -c '^## ' README.md`; `grep -n 'npx akili-specs init' README.md` |
| 2 | The order mixes audiences: install (`:140`), then maintainer release steps (`:401`), then dotfiles (`:527`), and only then *Start Here* (`:553`), concepts, and roadmap (`:797`) | `grep -n '^#' README.md` |
| 3 | `## What AKILI Covers` lists only security, video and diagrams ("Three capabilities sit beside the core spec loop"). The 3-row cut comes from archived `changes/docs-refresh-2-34` FR-3; no test pins it (`grep -rn "What AKILI Covers" test/` → 0) | `sed -n 63,71p README.md`; `docs/specs/archive/2026-10-19-changes--docs-refresh-2-34/requirements.md:83-93` |
| 4 | The hero has 13 badges in 3 rows before any prose | `sed -n 16,38p README.md` |
| 5 | Unexplained jargon appears early: "constitution-first", "Leader → Implementer → Reviewer harness", "HITL menus", "Design Impact injection", "Kaizen" | `README.md:14,592-596` |
| 6 | No page groups the 12 commands (7 loop + 5 anytime) and the 27 skills by purpose. README *Contents* is a flat file list, and `docs/skills/README.md` is alphabetical | `ls .claude/commands` → 12; `ls .claude/skills` → 27 |
| 7 | `docs/skills/governance.md` is linked from neither the README nor the hub | `cat docs/README.md`; `sed -n 52,61p README.md` |
| 8 | Some shipped capabilities live only in long prose: `/akili-seo` Phase 2B (GA4/Clarity), constitution's 3 modes, Kaizen, the harness and `.agents/` personas, `akili routing`, `doctor --agents`, CodeGraph, the Bug Track, fleet execution, Context Discipline | `README.md:807-827`; `docs/flow.md` §6–§9, `:225`, `:242` |
| 9 | There is no install-target comparison. Grok Bot is outside `init` and `--tool all` (only `docs/cli.md:21,111` says so) and absent from `docs/model-routing.md` | `grep -n -i grok docs/model-routing.md` → 0 |
| 10 | The README repeats `flow.md` (*Spec Folder Shape*, *Review Gates*-style lists). **Correction (specify, 2026-10-23):** the audit's "`## Requirement Delta Preview` twice (`:693`, `:698`)" is false — `:698` sits inside a ` ```markdown ` example block that starts at `:697`; a fence-aware heading scan lists one | `awk '/^```/{f=!f} !f && /^## /{print NR": "$0}' README.md` → one `693: ## Requirement Delta Preview`; `sed -n 697,698p README.md` |
| 11 | Roadmap and reference are mixed (*Planned Improvements* contains *Auxiliary commands*) | `sed -n 797,828p README.md` |
| 12 | The Dotfiles section ships in the README, but `dotfiles/` is not in `package.json` `files` | `README.md:527-552`; `package.json:16-28` |
| 13 | In the hub, *Quick Flow* lists the anytime commands as loose sentences | `docs/README.md` |

**Tests that pin README text today** (handled by D7):

| Test | Pinned in `README.md` | Also pinned in |
|---|---|---|
| `test/branching-flow.test.js:124-145` | `### Releasing Package Updates` holds 7 PR-flow tokens | `CONTRIBUTING.md`, `docs/release-checklist.md` (same tokens) |
| `test/akili-security-docs.test.js:47-60,118-128` | Routing slug `bugfix/security-<YYYY-MM-DD>-r<N>-s<n>`; ≥ 1 `/akili-security` line with `run directory (always outside the target)` | `docs/flow.md`, `docs/commands/README.md`, the command and skill pages |
| `test/diagram-design.test.js:409-412` | `npx skills add tt-a1i/archify`, the Archify MIT attribution, `never ships or installs it` | — (README only; D7 moves it to `docs/overview.md`) |

## Proposed Outcome

| Surface | After |
|---|---|
| `README.md` | ≤ 200 lines, 7 sections in the U2 order (D1), plain language, the current flow figure centered |
| `docs/overview.md` (new) | The full capability map: (1) commands, loop and anytime; (2) skills grouped by purpose (quality/process, frontend/design, backend/architecture, product, deliverables) with binding level; (3) the harness, Kaizen, routing, `doctor --agents`, CodeGraph, Bug Track, fleet and Context Discipline, one line each with a link; (4) the install-target comparison (D6); (5) optional tools (Archify, HyperFrames, CodeGraph, `gh`, Python for `/akili-seo`); (6) a glossary of every AKILI term; (7) an "I want to… → use" table |
| `docs/README.md` (hub) | `overview.md` first in *Start Here*; `skills/governance.md` linked; *Quick Flow* anytime commands as a table |
| `docs/flow.md`, `docs/cli.md`, `CONTRIBUTING.md` | Receive the moved README content where it is not already there (ledger T1) |
| `docs/openspec-comparison.md` | Gains a *Roadmap* section (D4) |
| `docs/model-routing.md` | One line: Grok Bot has no routing wrappers |
| `dotfiles/README.md` (new) | The Neovim/tmux restore steps (D5) |
| `test/docs-overview.test.js` (new) | D3 (a)–(g) |
| `test/branching-flow.test.js`, `test/akili-security-docs.test.js`, `test/diagram-design.test.js` | Pins moved to new targets (D7); assertions unchanged |
| `CHANGELOG.md` | One `Unreleased` → *Changed* entry |

## Scope

1. **T1: move ledger.** Write every current README section's destination (moved to X / duplicate of Y / kept) as a spec artifact, before any edit (guards against KZ-changes--gate-falsifiability-2).
2. **T2: `docs/overview.md`**, following `cognitive-doc-design`.
3. **T3: absorb into `docs/flow.md`, `docs/cli.md`, `CONTRIBUTING.md`**: only the content that is not there yet, per the ledger.
4. **T4: re-target the README pins (D7)** so that `npm test` stays green before the README shrinks.
5. **T5: rewrite the README** per D1/D8 and the jargon rule.
6. **T6: hub, roadmap move, `dotfiles/README.md`, routing line.**
7. **T7: `test/docs-overview.test.js`** (D3 a–g).
8. **T8: sweep and verification.** Restatement sweep for moved `/akili-security`, Archify and release lines (KZ-changes--kaizen-loop-closure-2); quote-check every aggregate claim at HEAD (KZ-002); link check; full verification set.
9. **T9: CHANGELOG** entry.

*Task numbers here are provisional; `design.md` §2 owns the numbering (corrected at specify).*

## Non-Goals

- No change to `.claude/commands/`, `.claude/skills/`, `.claude/templates/`, `bin/` or `package.json`.
- The lifecycle figure `assets/akili-flow.{svg,png}` is **kept as is** (U2). Adding `/akili-marketing` to it is a follow-up for that spec.
- No change to the fixed counts in existing tests (`test/diagram-design.test.js:415`, `test/install-cursor.test.js`); marketing edits them. D7 moves only the README pins.
- No weaker assertions. D7 changes where a pin points, never what it asserts.
- No rewrite of `docs/commands/*.md` or `docs/skills/*.md` beyond link fixes.
- No adding Grok Bot to `init`, `--tool all` or routing.
- No push, PR, release, tag or publish.

## Affected Users, Systems, And Specs

| Affected | How |
|---|---|
| New users (GitHub after merge to `master`, npm after the next publish) | A short README in a fixed order |
| Returning users | `docs/overview.md` as the "everything" page |
| Contributors | `CONTRIBUTING.md` gains *Repository Structure*; release steps are already there |
| `changes/akili-marketing` (worktree `akili-marketing`, `ea5c01d`) | Same files; it lands first (D2) |
| `changes/video-production-hardening` (worktree `video-hardening`) | No overlap: its branch diff touches only its spec folder; this spec only links to its docs |
| Archived `changes/docs-refresh-2-34` (FR-3, FR-5), `changes/branching-flow-dev-next` (FR-7), `changes/akili-security*` (FR-7/FR-10), `changes/archify-diagrams` (FR-9) | Their README sites are superseded or moved (MODIFIED below); the guarantees are kept in the new locations |

## Visual Reference

- Source: none for new design. The existing figure `assets/akili-flow.png` is kept and centered (U2).
- Location: `assets/akili-flow.png` (unchanged).
- Notes: documentation only. The README structure is the D1 table.

## Requirement Delta Preview

### ADDED Requirements

- The README follows the D1 7-section order, has ≤ 200 lines, and follows the jargon rule; the test checks all three (D3 e–g).
- `docs/overview.md` lists every packaged command and skill once, grouped by purpose, with a glossary, optional tools, an install-target table (6 targets) and an "I want to…" map.
- Derived inventory checks: package = overview membership = skills index rows = README command table; prose counts = package counts.
- The hub links `overview.md` and `skills/governance.md`.

### MODIFIED Requirements

- README *What AKILI Covers* (docs-refresh-2-34 FR-3) becomes the 5-bullet *What you get* in `## What is AKILI?`, linking to the full map in `docs/overview.md`. Security, video and diagrams stay reachable in one click.
- The Windows caveat (docs-refresh-2-34 FR-5) moves from beside the badges to the `/akili-security` row.
- The README release-flow pin (branching-flow-dev-next FR-7) is dropped; `CONTRIBUTING.md` and `docs/release-checklist.md` stay pinned and the README keeps the negative guard.
- The README `/akili-security` slug and run-directory pins (akili-security FR-7/FR-10) move to `docs/overview.md`; the README keeps the negative guard.
- The README Archify pins (archify-diagrams FR-9) move to `docs/overview.md`.
- The hub's *Quick Flow* anytime commands become a table.

### REMOVED Requirements

- The README *Contents* list, *Dotfiles*, the install walkthrough beyond 3 steps, *Releasing Package Updates*, *Repository Structure*, roadmap and every `flow.md` copy (all moved per the ledger, not lost).
- 10 of the 13 hero badges (D8).

## Approach Options

| Option | What | Pros | Cons |
|---|---|---|---|
| A. Trim in place | Reorder and cut the current README to ~450 lines; keep the maintainer sections | Smaller diff; no test re-targets | Misses U1/U5: still long, still mixed audiences |
| **B. Landing README (≤ 200) + `docs/overview.md` + derived test + re-targeted pins** (recommended) | D1–D8 | Meets U1–U6; every guarantee kept; structure enforced by a test | Largest diff; must land after marketing; three tests change targets |
| C. Links-only README (~80 lines) | Everything in the hub | Shortest | Loses the install and first-use path that U2/U3 put on the README; worse npm page |

## Recommended Approach

**Option B.** It is the only option that meets U1–U6 as written: a fixed order, install near the top, a first spec on the same page, and a large cut. The derived test and the moved pins keep both the new shape and every older guarantee from eroding.

### Budget (rev. 2)

Test LOC is budgeted per clause (KZ-bugfix--init-ctrlc-abort-2).

| Task | Est. LOC | Rounds |
|---|---|---|
| T1 Move ledger (43 headings) | ~90 (spec artifact) | 1 |
| T2 `docs/overview.md` | ~300 | 3 |
| T3 Absorb into `flow.md` / `cli.md` / `CONTRIBUTING.md` | ~220 | 3 |
| T4 Re-target pins in 3 tests (D7) | ~50 changed | 2 |
| T5 README rewrite | +190 / −948 | 4 |
| T6 Hub, roadmap, `dotfiles/README.md`, routing line | ~100 | 2 |
| T7 `test/docs-overview.test.js`, 7 clauses × ~40 (FR-16 now has clauses a–j; see design) | ~300 | 3 |
| T8 Sweep, link check, verification | — | 3 |
| T9 CHANGELOG | ~6 | 1 |
| **Total** | **~1,250 added / ~950 removed, 9 tasks** | **~22 rounds** (tripwire at 28). Superseded by design §13 (20 rounds, tripwire 26) |

Compared with rev. 1 (8 tasks, ~1,000/−650, ~18 rounds), the additions are D7, the bigger cut, and the structure clauses of the test.

## Risks, Dependencies, And Open Questions

| Risk / question | Mitigation |
|---|---|
| Unique README content lost (KZ-changes--gate-falsifiability-2) | The T1 ledger, walked term by term by the Reviewer; each moved section needs a destination hit at HEAD |
| A re-targeted pin quietly weakens a guarantee | D7 copies the assertions unchanged; T4 runs a mutation check (delete the phrase in the new target → red) per moved pin (KZ-changes--kaizen-loop-closure-2) |
| Plain language overstates what a command does (KZ-002) | Each "Use it to…" line comes from the command's frontmatter `description` and its docs page, quote-checked at HEAD |
| The 200-line cap pushes useful content out | The "I want to…" table and *Learn more* link to it; the cap is checked, not a guess (D3 f), and can be raised only by an approved spec |
| Merge conflict with `akili-marketing` | D2: execute after it merges; rebase before T2 |
| Marketing slips for a long time | Fallback: execute on the current `dev` with 12/27 (the derived test keeps it correct), and marketing rebases on top. Decide at execute time |
| Open question | Should the README show a short sample of a generated `proposal.md` in *Your first spec*? Recommendation: **no**, link to `docs/flow.md` → *Practical Example* to stay within 200 lines |

## Success Criteria

- The README is ≤ 200 lines, with `##` sections exactly as in D1, in order. A reader reaches the install command within the first ~70 lines.
- The current flow figure appears centered under `## How it works`.
- Every jargon term on the list is explained at first use or linked.
- `docs/overview.md` lists 100% of `.claude/commands` and `.claude/skills`, each once, grouped.
- No count claim disagrees with the package.
- The hub links `overview.md` and `governance.md`.
- Every guarantee pinned by the three tests still holds at its new target, and the README negative guards still pass.
- `npm test`, `npm run verify:cli`, `npm run pack:dry-run` and `git diff --check` all pass.

## Next Step

After you approve D1–D8 (or revise them):

```text
/akili-specify changes/docs-overview
```

Run it on a standard Change track; Video Mode does not apply. Run `/akili-execute` only after `changes/akili-marketing` merges into `dev` and this branch is rebased (D2).
