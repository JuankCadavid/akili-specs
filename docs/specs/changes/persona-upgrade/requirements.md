# Requirements: Give Deployed Personas an Upgrade Path

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/persona-upgrade` |
| Depth | **Full**. The change rewrites files a project owns and git-tracks, adds a CLI mode, and ships a migration; it needs rollout, rollback and risk sections. To be re-checked at Step 2.4 |
| Type | Change |
| Approval Mode | `gated`, inherited from `proposal.md` |
| Status | **Approved** (user, 2026-09-30) — OQ-1 to OQ-5 accepted as recommended. **Amended** at the design gate, after the reversion challenge and after judgment day: see §10 |
| Date | 2026-09-30 |
| Source | `proposal.md` (approved 2026-09-30, Option B, §11 defaults) |
| Format precedent | `docs/specs/archive/2026-09-30-changes--subagent-context-budget/requirements.md`. This repo has no `docs/specs/general-setup/`, `docs/prd.md`, `docs/trd/` or `docs/ux-ui/` |
| Adjacent specs | `changes/review-intensity-trial-terms` (paused, disjoint files). Future `cursor-install-target` and `model-routing-configurator` share `akili-constitution.md` Step 8 and `bin/akili.js`: sequence, never parallel |
| Citations | Run at `2ab6bbc` unless a row says otherwise |

## 2. Executive Summary

A persona in a project's `.agents/` is copied from a packaged template and then customized. When the template changes, nothing today can tell which parts of the copy are AKILI's and which are the project's, so an upgrade is either a hand edit or an appended block beside the stale rule. This spec makes the AKILI-owned parts visible with markers, makes an upgrade a section replacement, and gives the CLI a project mode that reports and fixes drift. Personas written before the markers get a one-time migration that fences what it can identify and reports what it cannot.

**Proposal alignment:** aligned with Option B. Exploration found three things the proposal did not have; each needs the user at this gate (§9).

| # | Finding | Effect on the proposal |
|---|---|---|
| 1 | The CLI has no test runner. Node 22 ships `node:test`; the package's engine floor is Node 18, which also has it | FR-9 uses the built-in runner; no dependency is added (OQ-1) |
| 2 | Downstream personas vary in form: STAR's `implementer.md` writes its items with one space after the number, retitles two of them, and has no `## Authorship`; this repo's own is an older scaffold | The migration normalizes list numbering, matches past releases' texts, and must place the project block without `## Authorship` (FR-5) |
| 3 | Injection points sit **inside** the items the markers would fence (the test command in item 4, the design-token path in item 3, the exemplar in item 1) | FR-2's project block is not optional; the *Injection scope* table must move every injection there, or an upgrade erases them |

## 3. Glossary

| Term | Meaning here |
|---|---|
| **Template** | A packaged persona under `.claude/templates/`, installed at `<tool root>/akili/templates/` |
| **Persona** | A project's copy at `.agents/<role>.md`, customized |
| **Owned section** | A contiguous block of a persona fenced by markers, whose text AKILI maintains |
| **Marker** | An HTML comment opening and closing an owned section: `<!-- akili:section id=<id> since=<release> -->` … `<!-- /akili:section -->` |
| **Project block** | One owned-by-the-project region per persona, `<!-- akili:project -->` … `<!-- /akili:project -->`, where scaffold injections and hand additions live |
| **Project space** | Everything in a persona outside owned sections: the project block, front matter, and any unfenced text |
| **Section state** | The result of comparing one owned section of a persona with the CLI's packaged template and its digest table: one of the values FR-3 enumerates |
| **Migration** | The one-time fencing of a persona that has no markers |
| **Installed templates** | The four files under the active tool's `akili/templates/` root, refreshed by `akili update` |

## 4. System Context & Scope

**Current behavior**, each claim cited as run at `2ab6bbc`:

| # | Claim | Evidence |
|---|---|---|
| 1 | Safe Update appends and never replaces | `.claude/commands/akili-constitution.md:424` |
| 2 | Its gap detection is three examples in prose; no list of what a release changed | Same bullet; `grep -n -i "migration\|superseded sentence"` → 4 hits, all about legacy path migration |
| 3 | `akili update` refreshes the tool's config root only | `bin/akili.js:181`; `grep -n "\.agents" bin/akili.js` → only the Codex skills root |
| 4 | `akili doctor` walks the tool's resource paths and reads no project persona | `bin/akili.js:1015` `doctorTool`; `:1102` a row class "never counted toward missing/fixed, never touched by --fix" already exists |
| 5 | `/akili-audit` has no persona-drift row | `.claude/commands/akili-audit.md:55`, `:57`, `:116` |
| 6 | Templates are installed under a per-tool root | Step 8B, the four paths; `bin/akili.js:699` writes `<resources>/templates/<name>` |
| 7 | The templates carry no marker | `grep -rn -i "<!-- akili\|akili:" .claude/templates/*.md` → 0 |
| 8 | The three worker templates are structured as `## ` sections holding numbered `1. **…**` items; `leader.md` uses `## ` and `### ` sections | `grep -n "^## \|^[0-9]\.  \*\*\|^### "` over the four files |
| 9 | Scaffold injections land inside items: the test command in `implementer.md` item 4 and `tester.md` item 4, the design-token path in item 3, directory boundaries in `leader.md` | Step 8B *Injection scope* table, rows by role; the templates' item text |
| 10 | A rewritten persona keeps `##` headings and its numbered items, written with one space after the number and partly retitled; it has front matter and no `## Authorship` | STAR `.agents/implementer.md`: `grep -c "^[0-9]\. \*\*"` → 7; `grep -c Authorship` → 0; 153 diff lines against the template. *(Corrected after judgment day: the first reading used a two-space pattern and found 0.)* |
| 11 | This repository's own persona is an older scaffold, not a customized v2.29.0 copy | `.agents/implementer.md`: item 1 titled "Prompt Caching & Skills" (pre-v2.29.0); `git diff --no-index --stat` against the template → 7 insertions, 72 deletions |
| 12 | Personas are git-tracked in STAR and gitignored here | STAR `git ls-files .agents` → 4; `.gitignore:8` |
| 13 | No test runner exists for the CLI | `package.json` scripts: `verify:cli` = `node bin/akili.js list`; no `test` script; no `test/` folder |
| 14 | Node 22 is installed and the engine floor is 18; both ship `node:test` | `node --version` → v22.12.0; `package.json` `engines.node` `>=18.0.0`; `node -e "require('node:test')"` → ok |
| 15 | Personas changed in 18 commits since 2026-08-01, `implementer.md` in 8 | `git log --oneline --since=2026-08-01 -- .claude/templates` |
| 16 | A persona records the release it was scaffolded from | `UNVERIFIED — confirm at source before relying on it`. Nothing found in the templates or in STAR; other downstream folders not read. Settled at design |
| 17 | The Antigravity and Codex wrappers load the persona by path and hold no rule text | `UNVERIFIED — confirm at source before relying on it`. Step 8E scaffolds them; settled at design by reading Step 8E |

**In scope:** the four templates; `/akili-constitution` Step 8B (Safe Update, *Injection scope*); `bin/akili.js` (a project mode of `doctor`); `/akili-audit` (one row); `docs/cli.md`, `docs/commands/` mirrors, `README.md`; `CHANGELOG.md`; a test script and fixtures.

**Out of scope:** the personas' rules; the Step 8E wrappers; `akili update`'s behavior; model routing; the install targets; any automatic run of the upgrade.

## 5. Stakeholders / Personas

| Persona | Stake |
|---|---|
| Maintainer of a project with `.agents/` | Runs one command after `akili update` and keeps every customization |
| Maintainer who edited an owned section by hand | Is told before anything is replaced |
| `/akili-constitution` in Safe Update | Replaces instead of appending |
| Methodology maintainer (this repo) | Marks sections when editing a template; names ids in the CHANGELOG |
| `/akili-audit` | Reports a project on stale personas |

## 6. Functional Requirements

### FR-1: The templates carry section markers

- Every AKILI-owned block of each template SHALL be fenced by an opening marker `<!-- akili:section id=<id> since=<release> -->` and a closing marker `<!-- /akili:section -->`, on their own lines.
- `id` SHALL be stable across releases, lowercase kebab-case, unique within the file. `since` SHALL be the release in which the section's text last changed, and SHALL be updated by the release that changes it.
- Markers SHALL be invisible in rendered Markdown and SHALL NOT change any rule's meaning.
- Text outside owned sections in a template SHALL be limited to the title, the intro paragraph, the model-tier note, the `## Primary Instructions` heading, horizontal rules and blank lines, the project block, the migration record, and the authorship section.
- The four templates together SHALL grow by no more than **2,200 bytes** from the markers (about 550 tokens across four personas; about 160 per worker spawn). *Amended from 1,200: a plain draft of the 22 sections and four project blocks measures 1,925 bytes, 1,977 with blank lines around markers (design §9).*

#### Scenario: A persona is rendered

- GIVEN a marked template
- WHEN it is rendered as Markdown
- THEN no marker is visible
- AND IT MUST read exactly as the unmarked template did

### FR-2: Project injections live in the project block

- Each template SHALL carry exactly one project block, empty by default, placed after the primary instructions.
- The *Injection scope* table of Step 8B SHALL state that every injection is written into the project block, never into an owned section, and SHALL name the block.
- A persona's project block and any text outside owned sections SHALL be preserved byte for byte by every upgrade.
- A rule that an owned section states and the project block contradicts SHALL be resolved in favor of the project block, and the owned section SHALL say so in one sentence. *(This keeps a project's customization authoritative without editing owned text.)*

#### Scenario: An upgrade meets an injected test command

- GIVEN a persona whose project block holds the project's test command
- WHEN an upgrade replaces the verification section
- THEN the project block is unchanged byte for byte
- BUT the replaced section must NOT hold a test command of its own

### FR-3: Every owned section has one state, and `doctor` reports it

`akili doctor --agents` SHALL run against `./.agents/` and the CLI's **packaged** templates — the templates of the CLI's own release, by construction — and SHALL report one state per persona per template section. *Amended at the design gate: the approved text compared against the installed templates of the active tool; the packaged source removes the stale-install failure mode (design §2).*

| State | Meaning |
|---|---|
| `current` | The persona's section text equals the template's, after normalizing line endings and trailing whitespace |
| `outdated` | The persona's section equals the template as it was at the section's `since` release or earlier, and differs from the current one |
| `custom-edited` | The persona's section differs from the current template and is not a known earlier version |
| `missing` | The template has the section and the persona has no marker with that id |
| `unmarked` | The persona has no marker at all |
| `extra` | The persona has a marker whose id the template no longer has |
| `unreadable` | A marker is malformed: unclosed, nested, with a duplicate id, or the persona holds more than one project block |
| `unlocated` | The template has the section, the persona has no marker for it, and the persona's migration record lists it as not located — its old text may still be present unfenced |
| `absent` (file) | The persona file does not exist |

- A persona file that does not exist is `absent`; an `.agents/` folder that does not exist is reported as one line. Neither is reported as `missing` sections.
- A persona with no marker of any kind is `unmarked`, never `unreadable`.
- Exit code SHALL be non-zero when any section is `outdated`, `missing`, `unmarked` or `unreadable`, or a persona is `absent`; zero when every section is `current`, `custom-edited`, `extra` or `unlocated` — the last three are decisions the maintainer owns.
- The report SHALL name the CLI release whose templates were compared, and the active tool's root for information.
- Distinguishing `outdated` from `custom-edited` needs earlier versions of each section. The CLI SHALL ship a digest of every section at every release, and of every section at every earlier tagged release (a table of hashes, never the old texts), installed beside the templates; when no digest matches, the state is `custom-edited`.

#### Scenario: A v2.29.0 persona after `akili update` to the marked release

- GIVEN a persona copied verbatim from the v2.29.0 template
- WHEN `akili doctor --agents` runs
- THEN every section reports `unmarked`
- AND the exit code is non-zero
- BUT it must NOT report any section as `custom-edited`

#### Scenario: Two tools installed

- GIVEN Claude Code and OpenCode templates both installed
- WHEN `doctor --agents` runs without `--tool`
- THEN it compares against the CLI's packaged templates and names the detected tool root for information
- AND IT MUST give the same states whichever `--tool` is passed

### FR-4: `--fix` upgrades, with a backup and without touching project space

- `akili doctor --agents --fix` SHALL replace every `outdated` section with the current template text, insert every `missing` section at the template's position relative to its neighbours, run the migration (FR-5) on every `unmarked` persona, and install the packaged template for every `absent` persona.
- Before writing a persona it SHALL copy the file to `.agents/.backup/<role>.md.<timestamp>`; the backup folder SHALL be gitignored by the fix when `.agents/` is tracked and a `.gitignore` exists there or at the root (design settles the mechanism).
- It SHALL NOT change a `custom-edited` section unless `--section <id>` names it; it SHALL NOT insert an `unlocated` section unless `--section <id>` names it; it SHALL NOT change an `extra` section; it SHALL NOT change any byte of project space.
- It SHALL refuse to write when the checkout is not the apply-capable branch named by the root guide's `Default Branch:` / `Integration Branch:` pins, unless `--allow-branch` is passed; and when `.agents/` is git-tracked with uncommitted changes other than the fix's own backup and ignore file, unless `--force` is passed. The branch SHALL be resolved as the `kaizen` skill resolves it (pins, then the remote default, then the unique `main`/`master`); an unresolved branch SHALL refuse. Both refusals SHALL name their reason. *(Added after the reversion challenge and corrected after judgment day.)*
- It SHALL print, per persona, what it replaced, inserted, migrated, skipped and why.
- Running it twice SHALL leave the second run with nothing to do and exit code zero: every section `current`, `custom-edited`, `extra` or `unlocated`.
- `--dry-run` SHALL run every guard and print the full plan and exit code, and write nothing.
- A `--section` insertion of an `unlocated` section SHALL remove that id from the migration record.

#### Scenario: A hand-edited section

- GIVEN a persona whose `verification` section was edited by the maintainer
- WHEN `--fix` runs without `--section`
- THEN the section is reported `custom-edited` and left as it is
- AND the other outdated sections are replaced
- BUT the file must NOT be written before its backup exists

#### Scenario: Idempotence

- GIVEN a persona `--fix` just upgraded
- WHEN `doctor --agents` runs again
- THEN the exit code is zero
- AND IT MUST report no section as `outdated` or `missing`

### FR-5: An unmarked persona is migrated once

- For a persona with no markers, `--fix` SHALL locate each template section in the persona and fence it.
- Location SHALL be by exact match first (the persona holds the section's text of some release, any tagged release included), then by heading and opening sentence, normalized for list numbering, emoji, punctuation and case; a section located by heading alone SHALL NOT be fenced.
- A located section SHALL extend to the next section start of the same or higher level, never stopping at a lower-level heading inside it.
- A section it cannot locate SHALL be reported `not located` and left alone; no text is deleted or moved. On later runs it is `unlocated`.
- Front matter, the title, and any text between sections SHALL be preserved in place.
- After migration the persona SHALL have exactly one project block, inserted empty if none existed: after the last fenced section, or, when nothing was fenced, at the end of the file or before an authorship section when one exists.
- The migration SHALL print each section as `fenced (exact)`, `fenced (heading)` or `not located`, and SHALL record the not-located ids in one comment line immediately before the project block — AKILI-owned metadata, not project space — so a later run reports them as `unlocated` rather than `missing`.

#### Scenario: An older scaffold

- GIVEN this repository's `.agents/implementer.md`, scaffolded before v2.29.0
- WHEN the migration runs
- THEN each item whose text is some tagged release's is fenced by exact match and reported `outdated`
- AND every line that is not part of a fenced section is preserved in place

#### Scenario: A rewritten persona

- GIVEN a persona modelled on STAR's `.agents/implementer.md` (front matter, renamed role, one-space numbered items, two retitled items, no authorship section)
- WHEN the migration runs
- THEN the items it locates by exact text or by heading and opening sentence are fenced, the retitled ones reported `not located`, and one project block is placed at the end of the file
- BUT it must NOT delete, move or reorder any line
- AND IT MUST keep the front matter as the first bytes of the file

### FR-6: Safe Update replaces owned sections

- `/akili-constitution` Safe Update SHALL, for each existing persona: run the migration when it is unmarked; replace `outdated` sections; insert `missing` ones; report `custom-edited` sections and leave them.
- It SHALL NOT append an upgrade block for any rule that an owned section covers.
- It SHALL write injections only into the project block, and only when the persona does not already carry that injection anywhere; an injection found inside a `custom-edited` section SHALL be reported as a move to make by hand, never duplicated.
- It SHALL prefer running `akili doctor --agents --fix` when the CLI is available, and otherwise perform the same steps by reading the installed templates.

#### Scenario: Safe Update on a marked persona

- GIVEN a marked persona with one outdated section
- WHEN Safe Update runs
- THEN that section is replaced and nothing is appended
- BUT it must NOT rewrite the project block

### FR-7: `/akili-audit` reports persona drift

- `/akili-audit`'s existing persona structural check SHALL report personas whose sections are `outdated`, `missing` or `unmarked` — by running `akili doctor --agents` when the CLI is available, otherwise against the installed templates — with the command that fixes them.

### FR-8: Documentation and the CHANGELOG convention

- `CHANGELOG.md` `Unreleased` SHALL carry the entry and the proposed classification.
- From this release on, a CHANGELOG entry that changes a persona SHALL name the section ids it changed and SHALL NOT carry a hand-migration recipe.
- `docs/cli.md`, the `docs/commands/` mirrors of Step 8B and the audit check, and `README.md` SHALL describe the command; the sentences that say Safe Update appends or never overwrites SHALL be updated (obligation-keyed sweep: `docs/commands/akili-constitution.md:27` and `:62`, `docs/flow.md:134`, `README.md:550`, `akili-constitution.md:375` and `:1166`, `akili-audit.md:55` and `:60`).
- The path by which `/akili-constitution` drafts a persona inline, when no packaged template is available, SHALL draft it with markers and an empty project block.

### FR-9: The CLI behavior is tested

- A `npm test` script SHALL run tests with `node:test`; no dependency SHALL be added.
- Fixtures SHALL include at least: a verbatim marked persona; a persona with a custom-edited section; a persona missing a section; a pre-marker persona copied from an older tagged template; a rewritten pre-marker persona modelled on STAR's (front matter, renamed role, one-space items, retitled items, no authorship section); a persona with an unclosed marker; a persona with CRLF line endings.
- Tests SHALL assert, per FR-3 state, the reported state and exit code; per FR-4, that project space is byte-identical before and after `--fix`, that the backup exists before the write (an I/O test in a temporary directory), and both guards; per FR-5, the three location outcomes and the project-block position; idempotence; that a CRLF persona stays CRLF.
- The project's CI SHALL run the test script.
- Each test SHALL be observed red on its assertion before the code that makes it green exists.

### FR-10: Rollout, compatibility and rollback

- A project that never runs the command SHALL be unaffected: markers are comments, and `doctor` without `--agents` is unchanged.
- The command SHALL work on a persona from any earlier release through FR-5.
- A `--fix` SHALL be reversible by restoring the backup; the report SHALL say where it is.
- The CLI compares against its own packaged templates, so no installed-template check is needed; the report SHALL print the CLI release. Safe Update, which reads the installed templates in a session, SHALL say to run `akili update` first (FR-6).

## 7. Non-Functional Requirements

| ID | Requirement | Measure |
|---|---|---|
| NFR-1 | **Deterministic.** The CLI compares bytes and hashes; no model is consulted | No network call in the code path; the same input gives the same report |
| NFR-2 | **No new dependency** | `package.json` `dependencies` unchanged |
| NFR-3 | **Bounded token cost** of the markers | ≤ 2,200 bytes across the four templates (FR-1, as amended) |
| NFR-4 | **Never destructive** | No code path deletes a line of project space; every write is preceded by a backup |
| NFR-5 | **Tool-agnostic** | The four template roots of Step 8B are all supported; no host-specific tool name in prose |
| NFR-6 | **Defined once** | Section states and their actions live in `bin/akili.js` and are cited by name from the command prose; the marker syntax is defined in one place in `docs/cli.md` |
| NFR-7 | **No line-number pointers** in shipped prose (KZ-005) | grep for `:<digits>` in added prose → 0 |

## 8. Defect Classes and Gates

| Defect class this spec can produce | Gate that catches it |
|---|---|
| A byte of project space lost or moved by `--fix` or the migration | FR-9 byte-comparison tests on every fixture, red before green |
| A section state with no action, or two (KZ-004, KZ-changes--premise-ledger-1) | The FR-3 table walked against the code's branch list, plus one held-out input (a persona with two project blocks) |
| The migration fences the wrong text in a rewritten persona | The STAR-modelled fixture; a section located by heading alone is asserted not fenced |
| The old "append" rule survives in prose (KZ-changes--kaizen-loop-closure-2) | Obligation-keyed grep for "append" / "upgrade block" / "preserves all existing" over `.claude/`, `docs/`, `README.md`, every hit read |
| Injection points left inside owned sections (finding 3) | A walk of the *Injection scope* table: each row names the project block |
| A CHANGELOG or README claim that did not ship (KZ-002) | Clause-by-clause check against the shipped code and text |
| CLI regression | `npm test`, `npm run verify:cli`, `npm run pack:dry-run`, `node bin/akili.js doctor --tool all` |
| A task too large for one review (KZ-changes--subagent-context-budget-1) | One task per template file; the CLI split by mode (report / fix / migration) |

**No automated check exists for one class; accepted risk:** a real Safe Update session (an LLM following Step 8B) may still append. The gate is the literal walk of the rewritten step plus the first Safe Update run on this repository's own `.agents/` after the change.

## 9. Open Questions for This Gate

| # | Question | Recommendation |
|---|---|---|
| OQ-1 | Test runner: `node:test` (built in since Node 18, the engine floor) with `npm test` | **Yes.** No dependency, no config |
| OQ-2 | Depth Full rather than Standard | **Yes.** The change writes git-tracked files a project owns and ships a migration |
| OQ-3 | Granularity: fence at item level in the three worker templates and at `##`/`###` level in `leader.md`, with the migration matching `##` first | **Yes.** Item level is what changes release to release; the migration's fallback to headings covers rewritten personas |
| OQ-4 | The `custom-edited` / `outdated` distinction needs per-release digests shipped with the CLI (a small JSON, generated at release time by `scripts/release.js`) | **Yes.** Without it every stale section looks hand-edited and `--fix` refuses all of them |
| OQ-5 | Should the project block also be where a maintainer is told to put hand additions to a rule? | **Yes**, with the FR-2 precedence sentence, so a customization never requires editing owned text |

## 10. Amendments (2026-09-30)

| # | Amendment | Origin | Where |
|---|---|---|---|
| A1 | Marker budget 1,200 → 2,200 bytes | Design gate (measured draft) and judgment W7 | FR-1, NFR-3 |
| A2 | Comparison source: the CLI's packaged templates | Design gate | FR-3, FR-10, Glossary |
| A3 | `unlocated` state; migration record outside project space; `--section` removes the id | Reversion challenge; judgment S6 | FR-3, FR-4, FR-5 |
| A4 | Branch and dirty-tree guards; kaizen resolution; unresolved refuses | Reversion challenge; judgment S5, W3 | FR-4 |
| A5 | Exit 0 for `custom-edited`, `extra`, `unlocated`; `absent` installed by `--fix` | Judgment S8, W14 | FR-3, FR-4 |
| A6 | Dense digest plus every tagged release; installed beside the templates | Judgment S1, S2, G2 | FR-3 |
| A7 | Migration cuts by level; project-block position without an authorship section | Judgment S3, S4 | FR-5 |
| A8 | Downstream shapes re-measured; scenarios and fixtures remodelled; CRLF fixture | Judgment S7, S9, W8, W10 | §2, §4, FR-5, FR-9 |
| A9 | Sweep list completed; inline-draft path; audit's existing check; CI runs the tests; `--dry-run` semantics | Judgment W5, W9, W11, G1, G3 | FR-4, FR-7, FR-8, FR-9 |

Judgment day closed `ESCALATED`: the user chose *Fix only*; the corrections were not re-judged. Ledger: `judgment.md`.

## 11. Requirement ID Index

| ID | Title | Proposal delta |
|---|---|---|
| FR-1 | Section markers | ADDED |
| FR-2 | Project block for injections | ADDED — made mandatory by finding 3 |
| FR-3 | Section states and `doctor --agents` | ADDED |
| FR-4 | `--fix` with backup | ADDED |
| FR-5 | Migration of unmarked personas | ADDED |
| FR-6 | Safe Update replaces | MODIFIED |
| FR-7 | Audit row; the two "never an overwrite" sentences rewritten | ADDED |
| FR-8 | Docs and CHANGELOG convention | MODIFIED |
| FR-9 | Tests with `node:test` | ADDED — beyond the proposal (OQ-1) |
| FR-10 | Rollout, compatibility, rollback | ADDED (Full depth) |
| NFR-1…7 | Deterministic, no dependency, bounded, never destructive, tool-agnostic, defined once, no line pointers | — |
