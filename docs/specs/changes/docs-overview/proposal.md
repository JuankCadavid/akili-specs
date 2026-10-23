# Proposal: One overview that shows all of AKILI

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/docs-overview` |
| Slug | `docs-overview`, taken from the argument's first token |
| Type | **Change**. Documentation restructure plus one new inventory test. No command, skill, template, installer or CLI behavior changes |
| Deliverable | software. The deliverable kind is **documentation** (neither software nor video), so Video Mode does not apply |
| Approval Mode | `gated`. The user asked to stop at the propose decision gate |
| Out-of-bounds actions | Local commits only: no push, PR, tag, release or publish. The `akili-marketing` and `video-hardening` worktrees are not touched |
| Date | 2026-10-23 |
| Author | AKILI session (proposer), from Juan Carlos Cadavid's audit at `dev` 8679e25 |
| Status | **Draft**, awaiting decisions D1–D6 |
| Depends on | `changes/akili-marketing` (merge order only, see D2) |
| Parallel-safe | **no**. `akili-marketing` edits 8 of the same files (`README.md`, `docs/README.md`, `docs/cli.md`, `docs/flow.md`, `docs/commands/README.md`, `docs/skills/README.md`, `docs/skills/governance.md`, `test/diagram-design.test.js`), per `git diff --stat 8679e25...JuankCadavid/akili-marketing` run 2026-10-23 |
| Release class | patch (docs plus a test; no new command, target or behavior), per the semver discipline |

## Answer first: decisions to approve

| # | Decision | Recommendation | Why |
|---|---|---|---|
| D1 | README vs hub structure | **The README becomes a short landing page: hero, a one-screen "What AKILI does" table that covers every capability group, a 3-step quick start, and links. A new `docs/overview.md` holds the full capability map.** Install detail goes to `docs/cli.md`, and methodology detail to `docs/flow.md` | Readers decide from the first screen. Today the first screen says "three capabilities", and the remaining 880 lines repeat `flow.md` and `cli.md` |
| D2 | In-flight specs (`akili-marketing`, `video-production-hardening`) | **Specify now, but execute only after `akili-marketing` merges into `dev`. Rebase this branch, then include `/akili-marketing` and `social-marketing` as real rows. Leave no empty slots.** `video-production-hardening` needs no slot: the overview links to `docs/skills/video-production.md` and never restates render details | Marketing touches the same 8 files, so landing second avoids an 8-file conflict. Empty "coming soon" slots would ship false claims if marketing slips |
| D3 | Counts and inventory | **Add a new `test/docs-overview.test.js` that derives the inventory from the package** (`.claude/commands/*.md`, `.claude/skills/*/`). Every command and skill appears exactly once in `docs/overview.md` under one purpose group. `docs/skills/README.md` has one row per skill. Any "N commands" or "N skills" claim in `README.md` and `docs/*.md` equals the derived count | When marketing lands (13/28), the counts fix themselves or the test fails. No hard-coded numbers. Follows KZ-002 |
| D4 | Roadmap and "Auxiliary commands" | **Move "Planned Improvements Inspired By OpenSpec" into `docs/openspec-comparison.md` under a "Roadmap" heading. Replace "Auxiliary commands" with the anytime-command rows of the overview table.** Each long paragraph is cut to one line plus a link to its `docs/commands/*.md` page | Mixing roadmap with reference makes shipped and planned work hard to tell apart |
| D5 | Dotfiles (Neovim/tmux) | **Move the section to a new `dotfiles/README.md` and remove it from the root README** (the line in Repository Structure stays) | `dotfiles/` is not in `package.json` `files`, so it is not product content, yet the README ships on npm |
| D6 | Grok Bot gaps (`init`, routing) | **Docs only: state the limit, change no code.** The install-targets table in the overview gets one row per target (6) with init / `--tool all` / routing wrappers / doctor columns. Grok Bot reads "no" for init and `--tool all` (by design, `bin/akili.js:516-521`, DD-4 of `changes/grokbot-target`) and "no" for routing (`grep -ci grok bin/routing.js` → 0). `docs/model-routing.md` gets one line saying the same | The behavior is intentional. The finding is a visibility gap, not a bug |

## Intent

Someone who opens the README or the docs hub should see **everything AKILI ships**, grouped by purpose, within one screen. They should also find the command or skill for what they want to do in one more click.

## Problem / Current Behavior

| # | Today | Evidence (as run 2026-10-23, `dev` 8679e25) |
|---|---|---|
| 1 | `## What AKILI Covers` lists only security, video and diagrams ("Three capabilities sit beside the core spec loop") | `sed -n 63,71p README.md` |
| 2 | The 3-row cut was set by `changes/docs-refresh-2-34` FR-3 ("one row each for security audits, video deliverables and diagrams"). That is an archived requirement, not a live test: `grep -rn "What AKILI Covers" test/` → 0 hits | `docs/specs/archive/2026-10-19-changes--docs-refresh-2-34/requirements.md:83-93` |
| 3 | No page groups the 12 commands (7 loop + 5 anytime) or the 27 skills by purpose. `README.md` *Contents* is a flat file list, and `docs/skills/README.md` is alphabetical | `ls .claude/commands` → 12; `ls .claude/skills` → 27; `sed -n 85,139p README.md` |
| 4 | `docs/skills/governance.md` exists but is linked from neither the README *Docs* list nor the hub's *Start Here* / *Documentation Map* | `cat docs/README.md`; `sed -n 52,61p README.md` |
| 5 | Shipped capabilities sit only in long prose: `/akili-seo` Phase 2B analytics (GA4/Clarity), the 3 constitution modes, the Kaizen Loop, the multi-agent harness and `.agents/` personas, `akili routing`, `akili doctor --agents`, CodeGraph, the Bug Track, fleet execution, Context Discipline | `README.md:807-827` (auxiliary paragraphs); `docs/flow.md` §6–§9, `:225`, `:242` |
| 6 | There is no install-target comparison. Grok Bot is excluded from `init` and `--tool all` (documented only inside `docs/cli.md:21,111`) and is absent from `docs/model-routing.md` | `grep -n -i grok docs/model-routing.md` → 0 |
| 7 | The README *CLI Commands* table (8 rows) starts at line 443, after about 300 lines of install steps | `grep -n '^### CLI Commands' README.md` → 443 |
| 8 | README is 948 lines and repeats `flow.md`. `## Requirement Delta Preview` is two headings in a row at `:693` and `:698`. *Spec Folder Shape*, *Writing Good Requirements* and *Review Points* repeat flow content | `grep -n '^#' README.md` |
| 9 | Roadmap and reference are mixed: *Planned Improvements Inspired By OpenSpec* contains *Auxiliary commands* (reference) | `sed -n 797,828p README.md` |
| 10 | The Dotfiles section (Neovim/tmux restore) is in the shipped README, but `dotfiles/` is not in `package.json` `files` | `README.md:527-552`; `package.json:16-28` |
| 11 | In the hub, *Quick Flow* lists the anytime commands as loose sentences, one per line | `docs/README.md` *Quick Flow* |

**Strings that tests pin in `README.md`** (the restructure must keep them):

| Test | Pinned content |
|---|---|
| `test/akili-security-docs.test.js` | Routing slug `bugfix/security-<YYYY-MM-DD>-r<N>-s<n>`; at least one `/akili-security` line saying `run directory (always outside the target)`; no in-target run-directory phrasing |
| `test/branching-flow.test.js:127` | A `### Releasing Package Updates` section with the PR-flow release block |
| `test/diagram-design.test.js:409-412` | `npx skills add tt-a1i/archify`, the Archify attribution with its MIT licence, and `never ships or installs it` |
| `test/diagram-design.test.js:415` | `docs/cli.md` says `27 packaged skills` (marketing changes it, see D2/D3) |

## Proposed Outcome

| Surface | After |
|---|---|
| `README.md` (~300 lines, down from 948) | Hero; **What AKILI does**: one table with about 8 grouped rows (spec loop · anytime commands · multi-agent harness · Kaizen · model routing · quality skills · domain skills · deliverables: security/SEO/video/diagrams/marketing); Quick start in 3 steps; a *Which command do I need?* mini-map; CLI summary table moved up; install targets in brief; links. The pinned strings above stay, in a reference section |
| `docs/overview.md` (new) | The full capability map: (1) commands grouped into loop and anytime, each with a one-line purpose and a link; (2) skills grouped by purpose (quality/process, frontend/design, backend/architecture, product, deliverables), with binding level and link; (3) the multi-agent harness, Kaizen, routing, `doctor --agents`, CodeGraph, Bug Track, fleet and Context Discipline, one line each with a link to its section in `flow.md`/`cli.md`; (4) the install-target comparison (D6); (5) the CLI command summary; (6) a **"I want to… → use"** table |
| `docs/README.md` (hub) | `overview.md` first in *Start Here*; `skills/governance.md` added to *Start Here* and the *Documentation Map*; *Quick Flow* anytime commands as a table |
| `docs/flow.md` | Takes in the README-only content that has no copy there yet (decided per section during specify, after a diff check). Nothing is lost |
| `docs/cli.md` | Takes in README-only install content (Local Checkout, Global Install, Troubleshooting) where it differs |
| `docs/openspec-comparison.md` | Gains a *Roadmap* section (D4) |
| `docs/model-routing.md` | One line: Grok Bot has no routing wrappers |
| `dotfiles/README.md` (new) | The Neovim/tmux restore steps (D5) |
| `test/docs-overview.test.js` (new) | The derived inventory and count contract (D3) |
| `CHANGELOG.md` | One `Unreleased` → *Changed* entry |

## Scope

1. Write `docs/overview.md`, following `cognitive-doc-design`: lead with the answer, tables, progressive disclosure.
2. Restructure `README.md`. Do a section-by-section move ledger first (each section moved to X, cut as a duplicate of Y, or kept), so no unique content is lost (KZ-changes--gate-falsifiability-2 failure mode). Fix the duplicate `## Requirement Delta Preview`.
3. Absorb the moved content into `docs/flow.md` / `docs/cli.md` only where it is not already there.
4. Hub edits (`docs/README.md`), the roadmap move, `dotfiles/README.md`, and the Grok Bot line in `docs/model-routing.md`.
5. Write `test/docs-overview.test.js`, deriving everything from the package.
6. Restatement sweep: every `/akili-security`, Archify and release line that moves must keep its pinned phrasing (KZ-changes--kaizen-loop-closure-2). Every aggregate claim is checked with a quote-check at HEAD (KZ-002).
7. Add the CHANGELOG note.

## Non-Goals

- No change to `.claude/commands/`, `.claude/skills/`, `.claude/templates/`, `bin/` or `package.json`.
- No change to existing tests' fixed counts (`test/diagram-design.test.js`, `test/install-cursor.test.js`). Marketing edits them, and touching them here would cause conflicts.
- No change to the lifecycle figure `assets/akili-flow.{svg,png}`. It already shows the 5 anytime commands. `/akili-marketing` is added to the figure by its own spec or a follow-up.
- No rewrite of `docs/commands/*.md` or `docs/skills/*.md` pages beyond link fixes.
- No adding Grok Bot to `init`, `--tool all` or routing (that is a product decision, not docs).
- No push, PR, release, tag or publish.

## Affected Users, Systems, And Specs

| Affected | How |
|---|---|
| GitHub readers (after merge to `master`) and npm readers (after the next publish) | New README and new overview page |
| `changes/akili-marketing` (worktree `akili-marketing`, `ea5c01d`) | Same files. It lands first (D2) |
| `changes/video-production-hardening` (worktree `video-hardening`) | No overlap so far: its branch diff touches only its spec folder. It will change `docs/skills/video-production.md` and render docs, which this spec only links to |
| `changes/docs-refresh-2-34` (archived) | Its FR-3 "three capabilities" section is superseded (see MODIFIED) |
| Tests that pin README strings | Must stay green (table above) |

## Visual Reference

- Source: None.
- Location: n/a.
- Notes: documentation only. The README layout is a table and section structure, not a visual design. The lifecycle figure is unchanged (Non-Goals).

## Requirement Delta Preview

### ADDED Requirements

- `docs/overview.md` lists every packaged command and skill exactly once, grouped by purpose, with a link.
- A task → command/skill map ("I want to…").
- An install-target comparison table covering all 6 targets, including Grok Bot's limits.
- A derived inventory test: package contents = overview membership = skills index rows; prose counts = package counts.
- Hub links to `overview.md` and `skills/governance.md`.

### MODIFIED Requirements

- README *What AKILI Covers* (`changes/docs-refresh-2-34` FR-3, three rows) becomes **What AKILI does**, covering every capability group. Security, video and diagrams keep their links and the Windows caveat.
- README goes from full reference to landing page. Detailed sections move to `docs/flow.md`, `docs/cli.md` and `docs/openspec-comparison.md`.
- The hub's *Quick Flow* anytime commands go from loose sentences to a table.

### REMOVED Requirements

- The README *Contents* flat file list (replaced by the grouped overview, which the test checks).
- The README *Dotfiles* section (moved to `dotfiles/README.md`).
- README copies of `flow.md` sections, including the duplicate `## Requirement Delta Preview` heading.

## Approach Options

| Option | What | Pros | Cons |
|---|---|---|---|
| A. Expand the table only | Add rows to *What AKILI Covers*; leave the rest | ~40 LOC, no conflicts | The 948-line README and its duplicates stay; there is still no grouped skill map; counts can still drift |
| **B. Short README + `docs/overview.md` + derived test** (recommended) | D1–D6 | One source of truth for "everything AKILI does", enforced by a test; the README becomes readable | Large README diff; must land after marketing; the move ledger needs care |
| C. Move everything into the hub; README is links only | README ~80 lines | Smallest README | The npm page loses the pitch and install basics, and the tests that pin README strings would need edits |

## Recommended Approach

**Option B.** It is the smallest option that fixes the root problem: no single grouped inventory exists, and nothing keeps one honest. A alone fixes only the symptom. C breaks pinned tests and weakens the npm landing page. The derived test is what keeps the overview right after marketing (13/28) and every later skill.

### Budget

Test LOC is budgeted per clause (KZ-bugfix--init-ctrlc-abort-2).

| Task | Est. LOC | Rounds |
|---|---|---|
| T1 README move ledger (section → destination / duplicate-of / keep) | ~60 (spec artifact) | 1 |
| T2 `docs/overview.md` | ~260 | 3 |
| T3 README restructure | +180 / −650 | 4 |
| T4 Absorb into `flow.md` / `cli.md` | ~120 | 2 |
| T5 Hub, roadmap move, `dotfiles/README.md`, routing line | ~90 | 2 |
| T6 `test/docs-overview.test.js` (about 8 clauses × ~35) | ~280 | 3 |
| T7 Restatement and count sweep, link check, full verification | — | 2 |
| T8 CHANGELOG | ~6 | 1 |
| **Total** | **~1,000 added / ~650 removed, 8 tasks** | **~18 rounds** (tripwire at 24) |

## Risks, Dependencies, And Open Questions

| Risk / question | Mitigation |
|---|---|
| Unique README content lost in the move (KZ-changes--gate-falsifiability-2) | T1 move ledger, walked term by term by the Reviewer. Each moved section needs a matching destination hit |
| Moved `/akili-security` or Archify lines weaken their pinned phrasing (KZ-changes--kaizen-loop-closure-2) | Run `npm test` after every README task; move pinned lines verbatim |
| Overview prose overstates what a command or skill does (KZ-002) | Each one-liner comes from the command or skill frontmatter `description` or its docs page and is quote-checked at HEAD |
| Merge conflict with `akili-marketing` | D2: execute after it merges; rebase before T2 |
| Marketing slips for a long time | Fallback: execute on the current `dev` with 12/27 (the derived test makes it correct now), then let marketing rebase on top. Its README diff is 10 lines. Decide at execute time |
| Release class | Patch (docs + test). If a later approval adds behavior, re-classify |
| Open question | Should the README keep the full install walkthrough (Steps 1–5)? Recommendation: keep a 3-step quick start and link to `docs/cli.md` for the rest |

## Success Criteria

- The first screen of the README names every capability group. A reader finds `/akili-marketing` (after D2), `/akili-seo` analytics, `akili routing` and the harness without scrolling past install steps.
- `docs/overview.md` lists 100% of `.claude/commands` and `.claude/skills`, each once, grouped, checked by `test/docs-overview.test.js`.
- No count claim in `README.md` or `docs/*.md` disagrees with the package (checked by the test).
- The hub links `overview.md` and `governance.md`.
- `npm test`, `npm run verify:cli`, `npm run pack:dry-run` and `git diff --check` all pass. Every pinned README string survives.
- The README is ≤ 350 lines, with no duplicated headings.

## Next Step

After you approve D1–D6 (or revise them):

```text
/akili-specify changes/docs-overview
```

Run it on a standard Change track; Video Mode does not apply. Run `/akili-execute` only after `changes/akili-marketing` merges into `dev` and this branch is rebased (D2).
