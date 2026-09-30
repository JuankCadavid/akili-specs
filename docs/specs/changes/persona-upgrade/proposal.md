# Proposal: Give Deployed Personas an Upgrade Path

**Recommendation:** mark the AKILI-owned sections of each persona template so an upgrade can replace them without touching what a project added, teach `/akili-constitution` Safe Update to replace those sections instead of appending beside them, and give `akili doctor` a project mode that reports and fixes persona drift. One migration step adopts the markers in personas written before them.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/persona-upgrade` |
| Slug | `persona-upgrade` — given as a path by the user; the free text after it is proposal context |
| Type | **Change** |
| Approval Mode | `gated` (no up-front end-to-end mandate given for this spec) |
| Depends on | none. Follows `changes/subagent-context-budget` (archived 2026-09-30, shipped in v2.29.0), whose CHANGELOG migration note is the symptom |
| Parallel-safe | **yes** with `changes/review-intensity-trial-terms` (disjoint files). **no** with a future `changes/cursor-install-target` or `changes/model-routing-configurator`: all three edit `/akili-constitution` Step 8 and `bin/akili.js` |
| Date | 2026-09-30 |
| Status | **Approved** (user, 2026-09-30) — §11 defaults accepted as recommended |
| Requirement source | The user's question of 2026-09-30 ("¿cómo puede un usuario hacer esto? ¿ejecutando nuevamente el akili-constitution?"). No Jira ticket. No visual reference |

## 2. Intent

A project that scaffolded its `.agents/` personas on any earlier release can bring them to the current release with one command, keeping everything the project added to them.

## 3. Problem / Current Behavior

All citations run at `71c73fd` on 2026-09-30.

| # | Claim | Evidence |
|---|---|---|
| 1 | Safe Update never replaces text in an existing persona; it appends | `.claude/commands/akili-constitution.md:424`: *"**do not overwrite** existing `.agents/*.md` files … identify gaps versus the current packaged template … and append a minimal upgrade block that preserves all existing custom instructions"* |
| 2 | The gap detection is prose for the agent to perform, with three examples and no list of what a release changed | Same bullet: *"(e.g. missing rework-loop instructions, missing PASS/FAIL output contract, missing AKILI commit standard)"*. `grep -n -i "migration\|superseded sentence" .claude/commands/akili-constitution.md` → 4 hits, all about legacy *path* migration (`:69`, `:75`, `:84`, `:1167`); none about persona text |
| 3 | A rule that a release *replaced* therefore survives beside its replacement | v2.29.0's own CHANGELOG entry: *"an already-scaffolded project keeps the unbounded loop beside the new bound until a maintainer edits it by hand"* |
| 4 | `akili update` refreshes the tool's config directory (commands, skills, templates) and never a project's `.agents/` | `bin/akili.js:181` (*"Update npm package to latest version, reinstall files"*); `grep -n "\.agents" bin/akili.js` → only `~/.agents/skills`, the Codex skills root |
| 5 | `akili doctor` checks installed files under the tool's config root, never a project's personas | `bin/akili.js:1015` `doctorTool` walks the tool's resource paths; no reference to a project `.agents/` |
| 6 | `/akili-audit` reports persona injection bleed and wrapper gaps, not persona drift against the packaged template | `.claude/commands/akili-audit.md:55` (bleed), `:57` (Antigravity wrapper gaps), `:116` (a structural check). `grep -n -i "packaged template" .claude/commands/akili-audit.md` → 1 hit, `:60`, inside *Model Generation Drift*, about calibration text and not persona drift |
| 7 | The packaged templates are installed at a known path per tool | `.claude/commands/akili-constitution.md` Step 8B: `~/.claude/akili/templates/`, `~/.config/opencode/akili/templates/`, `~/.gemini/config/akili/templates/`, `~/.codex/akili/templates/` (or `./.codex/…`) |
| 8 | Personas change often | `git log --oneline --since=2026-08-01 -- .claude/templates` → 18 commits; `implementer.md` alone in 8 |
| 9 | Deployed personas are customized by design, so a wholesale overwrite is not an option | Step 8B *Injection scope* table (project facts written into each persona by role). STAR's `.agents/implementer.md` differs from the current template by 153 diff lines: a renamed role, a YAML front matter with a coverage floor, a server-specific scope. This repository's own `.agents/implementer.md` is an older scaffold (7 insertions, 72 deletions against the template). *(Figures corrected 2026-09-30 after judgment day.)* |
| 10 | Deployed personas are git-tracked in at least one downstream project and gitignored in this one | STAR: `git ls-files .agents` → 4 files. This repo: `.gitignore:8` `.agents/` |
| 11 | No template carries a marker that says which of its parts AKILI owns | `grep -rn -i "<!-- akili\|akili:" .claude/templates/*.md` → 0 hits |
| 12 | A persona carries no record of the release it was scaffolded from | `UNVERIFIED — confirm at source before relying on it`. No front-matter field or comment was found in the templates or in STAR's copies; a downstream project may have added one by hand. Settled at `/akili-specify` design by reading two more downstream `.agents/` folders |

**Consequence.** Every release that changes a persona (8 for `implementer.md` in two months) leaves every existing project on the old rule, with the new rule either absent or appended beside it. The only remedy today is a paragraph in the CHANGELOG naming sentences to replace by hand. Nothing detects a project that has not done it.

## 4. Proposed Outcome

| Outcome | What changes for the reader |
|---|---|
| An upgrade is a replacement, not an addition | Safe Update replaces the AKILI-owned sections of a persona with the packaged ones and leaves everything else in place |
| What AKILI owns is visible in the file | Each owned section is fenced by a marker carrying its id and the release it was last changed in |
| Drift is detected, not remembered | `akili doctor` run in a project reports each persona whose owned sections differ from the CLI's packaged templates, and `--fix` replaces them |
| Old personas can adopt the markers once | A migration step recognizes pre-marker personas, locates each owned section by its heading and first sentence, and fences it — with a report of what it could not locate |
| The CHANGELOG stops carrying migration recipes | A release note says "run `akili doctor --agents --fix`" |

## 5. Scope

| Surface | Change |
|---|---|
| `.claude/templates/{leader,implementer,reviewer,tester}.md` | Section markers around AKILI-owned blocks; a `since` release per marker |
| `.claude/commands/akili-constitution.md` Step 8B | Safe Update replaces marked sections; the *Injection scope* table says where project injections live (outside owned sections, or in a named project block) |
| `bin/akili.js` | `akili doctor --agents [--fix]` (project mode, reads `./.agents/`), the section diff, the backup rule, the pre-marker migration |
| `.claude/commands/akili-audit.md` | Its existing persona structural check reports section states against the packaged templates |
| `docs/commands/`, `docs/cli.md`, `README.md` | Mirrors and CLI docs |
| `CHANGELOG.md` | `Unreleased` entry; the last hand-migration note is replaced by the command |
| Tests | `scripts/` or the CLI's existing test path — a fixture persona with custom text, an upgrade, and a byte comparison of the custom text |

## 6. Non-Goals

- **No change to what the personas say.** This spec moves rules; it does not rewrite them.
- **No regeneration of a persona from a recorded scan.** A persona stays a file the maintainer can edit; the upgrade touches only owned sections.
- **No upgrade of Antigravity wrappers or Codex agent files** beyond what `doctor` already checks; the wrappers are one-line loaders and rarely change.
- **No automatic upgrade.** `akili update` keeps refreshing the tool's config directory only; a project's personas change only when a maintainer runs the command in that project.
- **No model routing.** The registry and the configurator are separate proposals.

## 7. Affected Users, Systems, And Specs

| Affected | How |
|---|---|
| Every project with a `.agents/` folder | Gains a one-command upgrade; its next scaffold or `--fix` rewrites owned sections |
| Maintainers who edited an owned section by hand | Their edit is inside a fenced block and would be replaced: the report names it before `--fix` touches it, and `--fix` refuses without a backup |
| `/akili-constitution` Safe Update | Changes from append to replace, for marked sections |
| `/akili-audit` | One new drift row |
| This repository's own `.agents/` and STAR's | First users of the migration step |

## 8. Visual Reference

- Source: **None**
- Location: n/a
- Notes: CLI and command prose; no UI surface.

## 9. Requirement Delta Preview

### ADDED

- Section markers in the four templates, each with an id and a `since` release.
- A rule for where project injections live, so an upgrade never removes them.
- `akili doctor --agents`: per persona, per owned section, `current` / `outdated (since vX)` / `missing` / `unmarked` / `custom-edited`; exit code non-zero on drift.
- `akili doctor --agents --fix`: replaces `outdated` and `missing` sections; writes a backup first; never touches `custom-edited` without a flag that names the section.
- A pre-marker migration: adopt markers by locating each owned section by heading and opening sentence; report the sections it could not locate.
- An `/akili-audit` drift row for persona drift.

### MODIFIED

- Safe Update: "append a minimal upgrade block" → "replace owned sections; append only what has no section yet".
- The CHANGELOG convention: a persona change names its section ids; the migration recipe becomes the command.

### REMOVED

- None. The hand-migration note of v2.29.0 stays as history.

## 10. Approach Options

| | Option | Trade-off |
|---|---|---|
| **A** | **Prose only: Safe Update gets a per-release migration table (old sentence → new block) and replaces instead of appending** | No CLI change. Still an LLM reading prose; a sentence the maintainer reworded is not found, and nothing detects a project that never ran it |
| **B** | **Markers + section replacement + `doctor --agents`, with a one-time migration for pre-marker personas** ✅ | Deterministic for every persona written after this release; the migration step is the only heuristic part, and it reports what it could not do. Touches four templates, one command step, the CLI |
| **C** | **Regenerate personas from the template plus a recorded injection manifest** | Most robust upgrade, but personas become generated files: every hand edit must be recorded in the manifest or is lost, and STAR-style rewrites (renamed role, front matter) do not fit a manifest |

## 11. Recommended Approach

**Option B.** It is the smallest change after which an upgrade is mechanical: the marker turns "find what changed" from a judgment into a diff, and the CLI can then do it without a session.

**Decisions the user makes at approval.**

| Term | Proposed default | The user may set |
|---|---|---|
| Marker syntax | HTML comments, invisible when rendered: `<!-- akili:section id=<id> since=v2.30.0 -->` … `<!-- /akili:section -->` | Another syntax |
| Section granularity | One marker per numbered item of a persona (about 4–6 per file), not per sentence | Coarser or finer |
| Where project injections live | Outside owned sections, or inside one `<!-- akili:project -->` block per persona; the *Injection scope* table names the block | A different rule |
| `--fix` safety | Writes `.agents/.backup/<role>.md.<timestamp>` first; refuses to touch a `custom-edited` section unless `--section <id>` names it | Stricter or looser |
| Pre-marker migration | Runs inside `doctor --agents --fix` on a persona with no markers; locates sections by heading + first sentence; reports each miss and leaves that section alone | A separate command |
| CHANGELOG convention | A persona change names the section ids it touched | — |

## 12. Risks, Dependencies, And Open Questions

| Risk | Mitigation |
|---|---|
| **A maintainer's edit inside an owned section is replaced** | `custom-edited` state, reported before any fix; backup; explicit `--section` to override |
| **The migration mislocates a section in a heavily rewritten persona** (STAR: 153 diff lines, renamed role, retitled items) | It fences only what it matched on heading *and* opening sentence; everything else is reported as `unmarked` and left alone. Named in the report, never silently skipped (KZ-004: every state has an action) |
| **Markers cost tokens on every spawn** | Measured at the design gate: about 1,950 bytes across the four templates, some 160 tokens per worker spawn; capped at 2,200 bytes |
| **Two sources of truth for what an owned section says** (template vs the CLI's copy) | The CLI reads its own packaged templates (amended at the design gate, 2026-09-30: the installed copies could lag the CLI); it ships no second copy |
| **KZ-changes--subagent-context-budget-1**: the template edits span four rules documents | One task per template file, never one task for all four |
| **KZ-changes--subagent-context-budget-2**: a numeric cap set before the content exists | The marker overhead is measured on a draft at the design gate |
| **KZ-changes--kaizen-loop-closure-2**: Safe Update's append rule is restated elsewhere | The obligation-keyed sweep covers `docs/commands/akili-constitution.md:27`, `README.md:550` and the audit's checklist item `:1166` |
| Antigravity reads `.agents/agents/*/agent.md` wrappers that load the persona | Wrappers are out of scope; they keep loading the same file |

**Open questions**

| # | Question | Where it is settled |
|---|---|---|
| OQ-1 | The defaults in §11 | The user, at this approval |
| OQ-2 | Does `doctor --agents` need a session at all, or is a pure-CLI byte diff of sections enough for `current` / `outdated`? (It should be: the templates are files) | `/akili-specify` design |
| OQ-3 | Should `--fix` also run the *Injection scope* customization for a `missing` section, or install the bare template section and let Safe Update customize it later? | `/akili-specify` design |
| OQ-4 | Whether a persona records its scaffold release (claim 12) | `/akili-specify` design |
| OQ-5 | Test harness: the CLI has no unit test runner today (`scripts/parse_tests.js` and `verify:cli` only). A fixture-based test needs one — the smallest useful runner is a decision | `/akili-specify` design; possibly a Pivot if it grows |

## 13. Success Criteria

1. In a project scaffolded on v2.29.0, `akili doctor --agents` reports `implementer.md` as `outdated` and `--fix` leaves the file with the new bounded loop and without "until it passes" — with every project-added line byte-identical before and after.
2. On STAR's rewritten `implementer.md`, the migration fences what it can match, reports what it cannot, and changes nothing outside a fenced section.
3. `/akili-constitution` Safe Update on a marked persona replaces, and on an unmarked one runs the migration first; no appended block duplicates an existing rule.
4. `/akili-audit` reports a project whose personas are outdated.
5. The next persona-changing release note names section ids and one command, not sentences to replace by hand.

## 14. Next Step

```text
/akili-specify changes/persona-upgrade
```
