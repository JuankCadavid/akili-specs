# Requirements: Model Routing Configurator (`akili routing`)

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/model-routing-configurator` |
| Depth | **Standard** — a new CLI subcommand plus constitution/audit/doc edits across ~12 files; no data store, auth, or external API. The risky half is writing into a file the user owns (`AGENTS.md`) and generating five host-specific wrapper shapes |
| Type | Change |
| Approval Mode | `gated` (inherited from `proposal.md`) |
| Status | Draft — Phase 1, **amended after Judgment Day round 1** (Fix only; FR-1, FR-2, FR-3, FR-4, FR-5, FR-6, FR-8, FR-10, NFR-2, NFR-3, §4, §8 — see `judgment.md`) |
| Date | 2026-10-01 |
| Source | `proposal.md` (approved 2026-10-01, Option B; three open questions resolved — non-interactive flags in v1, answers file at `.agents/model-routing.json`, `doctor --routing` deferred). Release class: **minor** |
| Format precedent | `docs/specs/archive/2026-10-01-changes--cursor-install-target/requirements.md` — this repo has no `docs/specs/general-setup/` (it packages the methodology rather than consuming it) |
| Verified at | `8eb0227` (every `file:line` below) |
| Deviations from proposal | none at Phase 1. One refinement: unknown model ids (not in the packaged roster) take an explicit tier placement — an interactive prompt, or an `@T<n>` suffix in `--models` — because a non-interactive run has no other way to rank an id it has never seen (FR-3) |

## 2. Executive Summary

A developer runs `akili routing` in a project and, in about two questions per host plus one confirmation, gets a complete, placeholder-free `## Model Routing` section for the hosts they use and the Step 8E agent wrappers that enforce it — Reviewer on a different model than the Implementer, read-only where the host supports it. The wizard derives the six tiers from the models the user actually has (roster-first), shows the table, and writes only inside an AKILI-owned fence in `AGENTS.md`. Every answer persists in `.agents/model-routing.json`, so a re-run pre-fills and a `--yes` re-run is a no-op. The same command accepts `--hosts` / `--models` / `--yes` so `/akili-constitution` can ask the questions in chat and run it without a TTY — the constitution delegates instead of interrupting. Existing behavior of `install`, `update`, `doctor`, and `init` does not change; no runtime dependency is added; commands stay `model:`-free.

## 3. Glossary

| Term | Meaning |
|---|---|
| **Host** | One of the five install targets: Claude Code, OpenCode, Antigravity, Codex, Cursor (`claude`, `opencode`, `antigravity`, `codex`, `cursor` on the CLI) |
| **Roster** | The set of model ids a user can actually select on one host (their plan, their picker) |
| **Packaged roster** | `.claude/templates/model-registry.json` — the known models per host plus, per tier, the ordered **preference list** of fitting models (head = packaged default primary, second = fallback), shipped with the package, refreshed per release |
| **Tier** | T1 Architect · T2 Coder · T3 Auditor · T4 Context-Ingest · T5 Fast-Cheap · T6 Multimodal (`docs/model-routing.md` → *Capability tiers*) |
| **Mapping** | Per host, per tier: a primary model id, an optional fallback, and an optional note |
| **Derivation** | The deterministic rules that turn a roster into a mapping (FR-3) |
| **Registry section** | The `## Model Routing` section in the project's root `AGENTS.md` (Step 8C's artifact) |
| **Fence** | `<!-- akili:section id=model-routing since=<version> -->` … `<!-- /akili:section -->` — the grammar `bin/persona.js:10-11` already defines for personas |
| **Wrapper** | A Step 8E tool-native agent definition binding one `.agents/<role>.md` persona to a model (`.claude/agents/akili-<role>.md`, `.opencode/agent/akili-<role>.md`, `.agents/agents/akili-<role>/agent.md`, `.codex/agents/akili-<role>.toml`, `.cursor/agents/akili-<role>.md`) |
| **Restriction** | The Reviewer-only read-only binding per host: Claude Code `tools: Read, Grep, Glob`; Codex `sandbox_mode = "read-only"`; Cursor `readonly: true`; Antigravity `tools:` list (confirmed names only); OpenCode none confirmed |
| **Answers file** | `.agents/model-routing.json` — hosts, rosters, accepted mapping, restriction decisions, stamp |
| **author ≠ auditor** | The Reviewer's model differs from the Implementer's (T3 ≠ T2) — a hard rule on every host |
| **Placeholder** | `<CONFIRM SLUG>` / `<CONFIRM ID>` / `<CONFIRM>` — the registry's marker for an unconfirmed cell |

## 4. System Context & Scope

| Surface | Files and current behavior (cited) |
|---|---|
| CLI entry | `bin/akili.js` — `printHelp` (`:199-253`) lists `install, update, doctor, list, check-update, notifications, help`; `getArgs` (`:280-388`) uses `util.parseArgs` with `strict: true` (`:308-312`) — an undeclared flag fails at `:384-385`, so every new flag is declared; `command = positionals[0] || "help"` (`:314`); `main` `switch (args.command)` (`:2092-2116`, `default:` → `Unknown command`); `runInteractiveInit` (`:1993-2066`) is a `readline/promises` wizard with a 1–7 host menu and no non-TTY guard of its own (`isTTY` is checked only at `:1882`, inside the update-check path). `grep -n "routing" bin/akili.js` → no match: there is no entry point to configure model routing today |
| Pure helpers | `bin/persona.js` — fence regexes (`:10-11`), `parsePersona` (`:175`), `applyFix` (`:410`), `sectionStates` (`:566`), `module.exports` (`:917`); coupled to persona structure: `parsePersona` flags a file `unreadable` unless it holds exactly one project block (`:290-292`), `renderSegments` emits project markers (`:381-384`), `applyFix` inserts relative to the project block (`:445`) — so only the **fence grammar** is reusable for `AGENTS.md`, not the parse/replace functions (scout, 2026-10-01) |
| Tests | `test/*.test.js` (`node:test`; 94 tests at v2.31.0; the CLI is driven as a subprocess with `HOME` redirected — `test/agents-doctor-io.test.js`); fixtures under `test/fixtures/` |
| Package | `package.json` `files` (`:16-30`) includes `bin`, `.claude/templates`, `docs` (minus `docs/specs`) — a JSON under `.claude/templates/` ships without a `files` change; `engines.node >= 18` |
| Release | `scripts/release.js` enumerates a fixed `ROLES = ["leader", "implementer", "reviewer", "tester"]` (`:15`, `:130`, `:171`) and writes `since=` as `v<version>` only for changed sections (`:190-191`) — a `model-registry.json` beside the templates is neither enumerated nor hashed. `install`/`doctor`/`list` likewise copy templates by the fixed `AGENT_TEMPLATES` list plus `digests.json` (`bin/akili.js:75`, `:776-790`, `:1232-1236`, `:1078-1079`), so the roster JSON is read from the package directory by `routing`, never installed into a target |
| Constitution | `.claude/commands/akili-constitution.md` — Step 8C (`:465-617`; "Confirm the user's available models…" `:606-608`; emit-every-host rule; CLI-invocation row; cross-host line; effort dial item 6; mode policy `:592-604`), Step 8E (`:663-930`; per-host bullets; rules `:912-930`), Step 9 (`:1309-1329`), Verification Checklist (`:1352-1353`). Summary doc: `docs/commands/akili-constitution.md` (133 lines — a summary, not a mirror; T6-gate correction 2026-10-01) |
| Consumers of the registry | `/akili-execute` spawn mechanics prefer named wrappers (`.claude/commands/akili-execute.md:58-61`); `/akili-test` (`:54`, `:86`); model checkpoints in every command read `## Model Routing` from root `AGENTS.md`/`CLAUDE.md`; `/akili-audit` *Model Registry Drift* (`.claude/commands/akili-audit.md:56`) |
| Default registry | `docs/model-routing.md` table (`:118-125`): 10 of 30 host cells carry a placeholder — OpenCode 1, Antigravity 1, Codex 2, Cursor 6 (`sed -n 120,125p docs/model-routing.md \| grep -o "<CONFIRM[^>]*>" \| sort \| uniq -c` → `8 <CONFIRM SLUG>`, `1 <CONFIRM ID>`, `1 <CONFIRM>`; per column via `awk -F'\|'` over the same rows → 1/1/2/6; run 2026-10-01, corrected per judgment W16); *How to apply per tool* (`:760-789`); *Cross-tool safety* (`:791-817`: "No installer changes. Nothing here is force-injected") |
| README | `README.md:428-441` "### CLI Commands" `\| Command \| Purpose \|` table — a consumer of the command set (judgment C12) |
| Root rule | `AGENTS.md:37` — "never inject models in the installer — a single value cannot serve both Claude Code … and OpenCode …" — written against `model:` in command frontmatter and force-injection by `install` |
| Docs | `docs/cli.md` (`## Commands` table `:73-85`, `## Options` `:93`, `## Persona Drift` `:301`), `README.md:53`, `README.md:885-904` (*Capability-Tier Model Routing*), `docs/flow.md:350-407`, `CHANGELOG.md` Unreleased (empty — "No unreleased changes yet.") |
| Out of scope | `akili doctor --routing`; JSON as canonical registry (Approach C); live roster probing (`agy models`, Cursor `/model`); changes to `.agents/<role>.md` persona bodies; `install`/`update` behavior; `model:` in any command; a new runtime dependency |

## 5. Stakeholders / Personas

| Stakeholder | Interest |
|---|---|
| Developer on one host | Configure routing in minutes, no placeholders for their host, re-run when the plan changes |
| Developer on two+ hosts (e.g. Claude Code + Cursor) | One run covers both; the unused three columns stay present with defaults so a teammate's host still has a column |
| Teammate on a different host, same repo | Finds the five-column section and can run `akili routing` to fill their own column without touching the others |
| The agent running `/akili-constitution` | Asks in chat, runs one non-interactive command, reads one JSON for the Step 9 summary — never sends the user to a terminal |
| `/akili-execute` / `/akili-test` Leaders | Find wrappers more often; nothing else changes |
| Methodology maintainer | Roster defaults live in one data file with a drift test against the human doc; release checklist refreshes both |

## 6. Functional Requirements

### FR-1: `akili routing` — interactive wizard

The CLI SHALL provide an `akili routing` subcommand that, when stdin is a TTY, runs a `readline` wizard: (1) host multi-select, (2) per selected host a model multi-select over the packaged roster plus *other (type id)*, (3) a derived tier table per host (FR-3), (4) `[A]ccept / [t] adjust a tier / [q] quit`, (5) write (FR-4, FR-5, FR-6) and print a summary. Multi-select input is comma-separated numbers (`1,3,5`) — `akili init`'s numbered style (`bin/akili.js:2002-2020`, itself single-choice) extended to comma lists; no runtime dependency is added. Before writing wrappers the wizard asks Step 8E's opt-in question (*bind the personas with native wrappers? [Y/n]*) and, per selected host, the CLI invocation (packaged suggestion as the default — accepted, typed, or left `<CONFIRM>`). The prompt logic runs behind an injectable `ask` seam so it is unit-testable without a TTY (design DD-14); the live TTY path is exercised in FR-11.

#### Scenario: Two hosts, happy path

- GIVEN a project with `.agents/{leader,implementer,reviewer,tester}.md`, an `AGENTS.md` without a `## Model Routing` section, and no wrappers
- WHEN the user runs `akili routing`, selects `1,5` (Claude Code, Cursor), selects `1,2,3` for Claude Code and three ids for Cursor, and accepts the derived table
- THEN `AGENTS.md` gains a fenced `## Model Routing` section with all five host columns, Claude Code and Cursor filled from the roster, the other three with packaged defaults/placeholders
- AND `.claude/agents/akili-{leader,implementer,reviewer,tester}.md` and `.cursor/agents/akili-{leader,implementer,reviewer,tester}.md` exist with the mapped models; the Reviewer wrappers carry `tools: Read, Grep, Glob` and `readonly: true` respectively
- AND `.agents/model-routing.json` records the answers
- AND the summary lists every file written, every file skipped, and the hosts kept at defaults — one line each
- BUT it must NOT write any wrapper for OpenCode, Antigravity, or Codex
- AND IT MUST complete in ≤ 8 prompts for two hosts when no tier is adjusted and every id is packaged (hosts · 2 rosters · 2 invocations · wrappers opt-in · confirm = 7; Antigravity adds its tool-name question, a dated id adds its reason question, an unknown id adds its placement question)

#### Scenario: Adjust a tier

- GIVEN the derived table is shown
- WHEN the user chooses `t`, names `T3`, and picks a different roster model
- THEN the table is re-rendered with the change and the author ≠ auditor check re-run; a choice that makes T3 = T2 is rejected with a one-line reason and the prompt repeats
- AND IT MUST allow adjusting any of T1–T6 for any selected host, one tier per `t` round

#### Scenario: No TTY and incomplete answers

- GIVEN stdin is not a TTY (`printf '' | akili routing`, or an agent's shell tool)
- WHEN, after flags and the previous answers file (FR-6), any answer is still missing
- THEN the command prints a usage error naming the non-interactive form (`--hosts`, `--models`, `--cli`, `--wrappers`, `--yes`) and exits non-zero without writing
- BUT it must NOT block waiting for input or hang
- AND IT MUST succeed without prompting when the answers file completes the picture (`akili routing --yes` re-run — FR-6)

#### Scenario: Dry run

- GIVEN any valid run with `--dry-run`
- THEN every planned write is printed with its path and its token from the shared vocabulary (design §5.6: `created` · `replaced` · `unchanged` · `appended` · `adopted` · `overwritten` · `skipped (…)` · `refused (…)`), prefixed `[dry-run]`, and the derived table is printed
- AND IT MUST leave the tree byte-identical (`git status --porcelain` unchanged; `.agents/model-routing.json` not created)

### FR-2: Non-interactive form and mixed input

The CLI SHALL accept `--hosts <h1,h2>`; `--models <host>=<id>[@T<n>[+T<m>]],…` (repeatable, one host per flag, last flag per host wins; tiers joined with `+`; `@` reserved); `--cli <host>=<binary>` (repeatable); `--wrappers yes|no`; `--t3-cross-host <host>=<other>` (repeatable); `--antigravity-tools <a,b>`; `--opencode-agent-dir <path>`; `--pin-reason <host>=<id>=<text>` (repeatable — the recorded reason for a dated id); `--yes` (accept the derived mapping without the confirm prompt); `--adopt` (adopt an unfenced section non-interactively); `--json` (print the plan result to stdout); `--project <path>` (default: cwd); `--dry-run`; and `--force`. Flags pre-answer prompts; when stdin is a TTY, the wizard asks only what the flags left unanswered. When every answer is supplied and `--yes` is given, no prompt is shown.

#### Scenario: Fully specified, no TTY

- GIVEN `akili routing --hosts claude,cursor --models claude=opus,sonnet,haiku --models cursor=<id1>@T1+T3,<id2>@T2+T5,<id3>@T3 --cli claude=claude --cli cursor=agent --wrappers yes --yes` with stdin not a TTY
- THEN the result is byte-identical to the interactive happy path with the same answers
- AND exit code is `0`
- BUT it must NOT prompt for anything

#### Scenario: Validation errors

- GIVEN `--hosts claude,vscode`, or `--models codex=…` without `codex` in `--hosts`, or `--models claude=` (empty), or an `@T9` suffix, or an id absent from the packaged roster without an `@T…` placement, or one id placed on both T2 and T3, or a dated id without a reason
- THEN the command exits non-zero with one error line naming the offending value and the accepted set, before any write
- AND IT MUST validate all flags before the first write — never a partial write followed by an error

#### Scenario: Mixed input

- GIVEN a TTY and `--hosts claude` only
- WHEN the command runs
- THEN it skips the host question, asks the Claude Code roster, invocation, and wrappers questions and the confirm, and writes
- AND IT MUST pre-fill prompts from `.agents/model-routing.json` when it exists (FR-6), flags overriding the file

### FR-3: Deterministic tier derivation

Given a host's roster, the configurator SHALL derive the six tiers by **preference-list intersection**: the packaged roster carries, per host and tier, the ordered list of fitting models (head = packaged default primary, second = packaged default fallback); user-placed ids are prepended to the lists of their declared tiers; each tier takes the first list entry present in the roster, **T3 takes the first entry ≠ T2's pick** (hard rule — when none exists the host is `unsatisfiable`, FR-5), the fallback is the second present entry or `—`; an empty T4 falls back to T2's pick with the note `no long-context model selected`, an empty T6 to `<CONFIRM>` with a cross-host note (naming the packaged T6 owner only when it is another host). The derivation is a pure function with no I/O and no numeric ranks (design §5.3).

#### Scenario: Full Claude Code roster

- GIVEN roster `opus, sonnet, haiku`
- THEN T1 `opus`, T2 `sonnet`, T3 `opus`, T4 `sonnet`, T5 `haiku`, T6 `sonnet`, with fallbacks `sonnet`, `haiku`, `sonnet`, `opus`, `sonnet`, `opus` — equal to the packaged default column by construction, for **every** host's full packaged roster (the unit test asserts it per host)
- AND IT MUST produce the same output for the same input every time (no randomness, no environment reads)

#### Scenario: Single-model roster

- GIVEN roster `sonnet` only
- THEN the registry column is derived with the T3 cell carrying the note `author ≠ auditor NOT satisfied — add a model or dispatch T3 cross-host`, and the wizard offers three ways out — *add a model*, *dispatch T3 cross-host* (recorded as `→ <other host>`), *leave it*
- AND IT MUST write **no wrappers for that host** while author ≠ auditor cannot hold (Step 8E Rule 1 is a MUST); with the cross-host choice it writes Leader, Implementer, and Tester and skips the Reviewer, noting the dispatch
- AND IT MUST, under `--yes`, exit `0` with the summary line `skipped (author ≠ auditor unsatisfiable)` for that host so the constitution can relay the choice (`--t3-cross-host` carries the chat decision back)
- BUT it must NOT write a Reviewer wrapper whose model equals the Implementer's — on any host, in any mode

#### Scenario: Unknown model id

- GIVEN *other* with id `my-new-model` interactively, or `--models cursor=my-new-model`
- THEN interactive mode asks one question: *which tier(s) does this model serve? (1–6, comma-separated)*; non-interactive mode requires the `@T<n>[+T<m>]` suffix and errors without it; a dated id (not a floating alias) additionally asks for the reason for pinning it — `--pin-reason <host>=<id>=<text>` non-interactively, required — (alias-first "record why"), rendered as a footnote in the registry
- AND IT MUST record the id in the answers file with `source: "user"` and the given tiers, never a guessed rank

### FR-4: `## Model Routing` section writer

The configurator SHALL write the registry section inside the fence `<!-- akili:section id=model-routing since=<package version> -->` … `<!-- /akili:section -->` in the project's root `AGENTS.md`, SHALL never write to `CLAUDE.md`, and SHALL honor Step 8C's Safe Update rule through a **provenance check**: a fenced body that differs from what the previous answers render (or has no answers file) is a hand edit and is refused without `--force`, with the diff shown; stale ids (present in the mapping, absent from the packaged roster) are reported, never edited. The section SHALL contain every element Step 8C item list requires: the one-line philosophy, the six tiers, the phase → tier mapping (execute triad and test harness split, Reviewer ≠ Implementer note), the registry table with columns `Tier | Claude Code | OpenCode | Antigravity | Codex | Cursor | Fallback` and an `Updated: <YYYY-MM>` stamp, the CLI-invocation row for every host, the *Cross-host dispatch* line, the "edit only this registry" instruction, and the compact *Effort dial* subsection (a–f). **All five host columns are always present**: a host not selected keeps the packaged default cell (or its placeholder) — never a dropped column.

#### Scenario: Six states of `AGENTS.md`

- GIVEN (a) a clean fenced `model-routing` section (body = render of the previous answers), (a′) a fenced section that was hand-edited or has no answers file, (b) an unfenced `## Model Routing` heading (older constitution), (c) no section, (d) no `AGENTS.md`, (e) a malformed fence (open without close, two blocks, close without open), or (f) a fenced section plus a stray unfenced heading
- THEN (a) only the fenced block is replaced, bytes outside it untouched (`replaced` / `unchanged`); (a′) refused with the diff shown unless `--force` (`refused (hand-edited fence; --force to regenerate)` / `overwritten`) — except that a fenced body already byte-equal to this run's render is `unchanged` (nothing to write, nothing to protect; T3-gate clarification, 2026-10-01); (b) the diff is shown, a TTY asks *adopt / skip*, a non-TTY adopts only with `--adopt` (`adopted` / `skipped (unfenced; --adopt to replace)`); (c) appended (`appended`); (d) created with a one-line header, the fenced section, and a `/akili-constitution` hint (`created`); (e) refused, nothing written to `AGENTS.md`, wrappers and answers still planned (`refused (malformed fence)`); (f) handled as (a)/(a′) plus a report of the stray heading's line
- AND IT MUST print exactly one of those tokens for `AGENTS.md`, and detect the fence on CRLF files the way `persona.js` does (EOL preserved on output)
- BUT it must NOT touch `CLAUDE.md` in any state, even when it holds a `## Model Routing` section (report it as `CLAUDE.md carries a Model Routing section — move it to AGENTS.md`)

#### Scenario: Unselected host keeps its column

- GIVEN `--hosts claude`
- THEN the table carries OpenCode, Antigravity, Codex, Cursor cells from the packaged roster's tier defaults, placeholders included
- AND IT MUST keep a previously **filled** column for an unselected host when the answers file holds a mapping for it (a second run for Cursor must not reset an earlier Claude Code column to defaults) — the answers file's `mapping` may therefore hold hosts outside `hosts[]`
- AND IT MUST render the CLI-invocation row only from invocations the user confirmed (`cli.<host>`); an unconfirmed or unselected host's cell is `<CONFIRM>`, never the packaged suggestion

### FR-5: Step 8E wrappers for selected hosts

When wrappers are opted in (`--wrappers yes`, or the wizard's Step 8E question), for each selected host whose author ≠ auditor holds the configurator SHALL write the four wrappers `akili-{leader,implementer,reviewer,tester}` in the host's location with the host's shape, model-bound from the mapping (Leader T1, Implementer T2, Reviewer T3, Tester T2 primary — the Step 8E default; the collapse with the Implementer is noted in the summary, as Rule 1 allows), a body that references `.agents/<role>.md` and never inlines it, and the Reviewer-only restriction per host. A host marked `unsatisfiable` gets no wrappers (`skipped (author ≠ auditor unsatisfiable)`); a `cross-host` host gets three and skips the Reviewer. Existing wrapper files SHALL be skipped unless `--force`. `--wrappers no` skips every wrapper (`skipped (wrappers=no)`) — the guidance-only path.

| Host | Location | Shape | Reviewer restriction | Extra |
|---|---|---|---|---|
| Claude Code | `.claude/agents/akili-<role>.md` | Markdown + YAML (`name`, `description`, `model`) | `tools: Read, Grep, Glob` | — |
| OpenCode | `.opencode/agent/akili-<role>.md` (dir overridable with `--opencode-agent-dir`; the `opencode.json` `agent` block is **out of v1** — Step 8E fallback) | Markdown + YAML (`name`, `description`, `model`) | **none written** — reported as *read-only by instruction (restriction shape unconfirmed — Step 8E rule 2)* | dir recorded in the answers file |
| Antigravity | `.agents/agents/akili-<role>/agent.md` | YAML (`name`, `description`, `model` ∈ `flash` \| `pro` — the roster entry's `wrapperModel`, never the registry id, `subagent: true`, `mainAgent` false for non-Leader) | `tools:` only when the user confirms the names against the installed binary (one question; `--antigravity-tools view_file,grep_search` non-interactively); otherwise **omitted and reported** | nested path mandatory |
| Codex | `.codex/agents/akili-<role>.toml` | TOML (`name`, `description`, `developer_instructions`, `model`, `model_reasoning_effort`) | `sandbox_mode = "read-only"` | effort defaults Leader/Reviewer `high`, Implementer/Tester `medium` |
| Cursor | `.cursor/agents/akili-<role>.md` | Markdown + YAML (`name`, `description`, `model` with optional `[effort=…]`) | `readonly: true` | effort bracket only when the roster entry's confirmed `effortRungs` contains the rung; otherwise **no bracket** and the summary says `effort bracket omitted — rung unconfirmed` (a `<CONFIRM>` inside a frontmatter value would break the wrapper) |

#### Scenario: Skip-by-default

- GIVEN `.claude/agents/akili-reviewer.md` already exists
- WHEN `akili routing --hosts claude … --yes` runs
- THEN the other three Claude Code wrappers are written, the Reviewer file is left byte-identical and listed as `skipped (exists; --force to replace)`
- AND IT MUST, when the existing wrapper's `model:` differs from the new mapping, append `— model drift: file says X, mapping says Y` to that line (report only; the plan's snapshot therefore carries existing wrapper **contents**, not only paths)

#### Scenario: Restriction omitted and reported

- GIVEN Antigravity selected and the user answers *don't know* to the tool-name question
- THEN the Reviewer wrapper is written **without** `tools:` and the summary line reads `Antigravity Reviewer: read-only by instruction (tools omitted — names unconfirmed)`
- BUT it must NOT write a `tools:` list copied from documentation
- AND IT MUST apply the same reporting rule to OpenCode in every run

### FR-6: Answers file and idempotent re-run

The configurator SHALL write `.agents/model-routing.json` holding: `version` (schema), `generatedBy` (package version), `updatedAt` (rewritten only when any other field's canonical form changed), `hosts` (selected), per host `roster` (ids with `source: "packaged" | "user"`, declared `tiers` for user ids, `reason` for dated ids), `cli` (confirmed invocations), `mapping` (T1–T6 → `primary`, `fallback`, `note`, `crossHost?`; may include hosts outside `hosts[]`), `wrappers` (`yes`|`no`), per host `decisions` (agent dir, restriction, confirmed tool names, effort bracket) and `authorAuditor`, and `unselectedHosts: "keep-previous-else-packaged"`. The section's `Updated:` stamp SHALL be the month of `updatedAt`, not of the run. On re-run, every prompt SHALL be pre-filled from the file; `--yes` with an unchanged file SHALL produce no diff. The file SHALL NOT record run results (files written/skipped) — those go to stdout (`--json`) so the file stays idempotent.

#### Scenario: Idempotent re-run

- GIVEN a completed run and a clean tree
- WHEN `akili routing --yes` runs again
- THEN `git status --porcelain` is empty afterwards (section, wrappers, answers file all byte-identical — `updatedAt` is rewritten only when any answer changed)
- AND IT MUST print `no changes` in the summary

#### Scenario: Pre-fill

- GIVEN an answers file with `hosts: ["claude"]`
- WHEN the interactive wizard runs
- THEN the host question shows `[x] 1) Claude Code` pre-checked and `Enter` keeps it; the roster question shows the previous ids pre-checked
- BUT it must NOT require re-typing a `source: "user"` id — it appears as a pre-checked option

### FR-7: Packaged roster and drift test

The package SHALL ship `.claude/templates/model-registry.json`: per host `lastVerified` and pin, the wrapper shape, a `models` list (`id` or family placeholder, `label`, `family?`, `alias`, `dated`, `wrapperModel?`, `effortRungs`, `planGated?`), and `tierPreference` (T1–T6 → ordered ids/placeholders whose head and second equal the `docs/model-routing.md` cell's primary and fallback at the same release). A `node:test` SHALL fail when the two disagree, using the cell grammar of design §5.1 (backticked id · family word · placeholder) over the five host columns.

#### Scenario: Drift test

- GIVEN the registry table in `docs/model-routing.md` (`:118-125` at `8eb0227`; the only other `| Tier |` table — the definitions table at `:52` — is **not** the anchor; the test anchors on the header line starting `| Tier | Claude Code |`)
- WHEN `npm test` runs
- THEN for every host column and tier row, each backticked id and each family word in the doc cell exists in that host's `models`, each placeholder appears in that tier's `tierPreference`, the list's head appears in the corresponding host cell, and the list's second entry (when present) appears in that host cell **or in the row's shared `Fallback` column** — where a single-id host cell keeps its fallback (FR-3's Claude fallbacks `sonnet, haiku, sonnet, opus, sonnet, opus` all live there); the shared `Fallback` column is otherwise not walked as a column (execute-time clarification, 2026-10-01, T1 gate)
- AND IT MUST go red when one id is changed in either file (falsifier executed once in the task's red run)

### FR-8: `/akili-constitution` delegates to `akili routing`

Step 8C SHALL be rewritten to: ask the Step 8C questions in chat (hosts → per-host roster, placements for unknown ids, reasons for dated ids → invocations → Step 8E's wrapper opt-in → confirm), then run `akili routing --project . --hosts … --models … --cli … --wrappers … --yes --json` and read the JSON on stdout; when the `akili` binary is unavailable **or predates `routing`** (`Unknown command: routing`), follow an **inline fallback protocol** with the same questions in the same order and write the same artifacts by hand (the current Step 8C/8E templates, retained as the fallback), using the same fence id. Step 8E SHALL state that the wrappers are generated by the same run and keep its per-host tables as the fallback and as the contract the generator implements, with its example defaults (Claude tester `sonnet`, Antigravity Leader `pro`) re-worded as *from the mapping*. Step 8C item 5's instruction SHALL be re-worded to name `akili routing` as the way to change models (or removing the fence to hand-edit) while keeping its two prohibitions verbatim. Step 9 SHALL read the JSON result when present and say when the fallback was used. **Every obligation of the current Step 8C/8E survives** — emit-every-host, CLI-invocation row, cross-host line, alias-first rule, effort dial, mode policy (Safe Update never overwrites a customized registry → `akili routing` without `--force` skips an unfenced section), Rules 1–4 of Step 8E.

#### Scenario: Constitution on Claude Code, CLI present

- GIVEN a Claude Code session running `/akili-constitution` on a project where `akili` resolves on `PATH`
- WHEN Step 8C runs
- THEN the agent asks hosts and rosters via its question tool, runs the one non-interactive command, and continues with zero TTY prompts
- AND IT MUST report in Step 9 the hosts configured, placeholder count per column, wrapper files written/skipped with their tokens, each Reviewer's restriction state, `authorAuditor` per host, and the section's byte length (for the Codex `project_doc_max_bytes` check), read from the `--json` output
- BUT it must NOT send the user to a terminal to run the wizard interactively

#### Scenario: CLI absent

- GIVEN `akili` does not resolve
- THEN Step 8C runs the inline fallback protocol and writes the fenced section itself (same fence id), so a later `akili routing` run recognizes it as state (a′) of FR-4 (no answers file → `--force` to regenerate, which the fallback text says)
- AND IT MUST say in Step 9 that the fallback was used

#### Scenario: Obligation sweep

- GIVEN the rewritten Step 8C/8E text
- THEN a term-by-term walk of the current Step 8C items 1–6 (`:481-591`), the mode policy (`:592-604`), the confirm paragraph (`:606-614`), Step 8E's per-host bullets and Rules 1–4 (`:677-929`), Step 9 (`:1322-1326`), and the checklist (`:1352-1358`) finds each obligation in the new text or in the generator's contract tables (design §5.4, §5.5) — none dropped (KZ-changes--gate-falsifiability-2)

### FR-9: Documentation, audit, and root-rule coherence

`akili help` and `docs/cli.md` SHALL document `routing` and its flags; `docs/model-routing.md` → *How to apply per tool* SHALL name the command as the first step; `README.md` SHALL mention it where it introduces Model Routing (`:53`, `:885-904`); `/akili-audit` *Model Registry Drift* SHALL add the signal *wrappers, answers file, and registry section disagree*; `AGENTS.md:37` SHALL be amended to *"never inject models in the installer — `akili routing` writes them only at the user's request, into agent wrappers and the project registry, never into commands"*; `docs/model-routing.md` *Cross-tool safety* "No installer changes" bullet SHALL gain the same carve-out; `CHANGELOG.md` Unreleased SHALL carry a **minor** entry.

#### Scenario: Aggregate-claim falsification (KZ-002)

- GIVEN any sentence of the form "every host / every wrapper / all five columns" added by this spec
- THEN the task that writes it quotes the grep that would falsify it, as run

### FR-10: Zero regression, host-neutral commands, zero dependencies

`npm test` SHALL stay green with the new suites added; `npm run verify:cli` (`akili list`) output SHALL be unchanged; `akili help` SHALL gain the `routing` line and its flags; `node bin/akili.js install --tool all --dry-run` and `doctor --tool all` SHALL be byte-identical to `8eb0227` on a fixture home; `grep -n "^model:" .claude/commands/*.md` SHALL stay empty; `package.json` SHALL gain no `dependencies`.

### FR-11: Closing validation on a scratch project

Before the spec is complete, the shipped command SHALL be exercised on a scratch project (not this repo): the interactive happy path (two hosts), the non-interactive form, the `--dry-run`, the idempotent re-run, the single-model refusal under `--yes`, and the FR-4 states (a)–(d); plus the FR-8 delegation walked once inside a Claude Code session. Evidence (commands and outputs) SHALL be recorded in `execution.md`.

#### Scenario: Validation blocked

- GIVEN a case cannot be exercised
- THEN the task parks `[~]` with the blocker named and the spec is not archived complete

## 7. Non-Functional Requirements

| ID | Requirement | Verification |
|---|---|---|
| NFR-1 | **No runtime dependency.** `package.json` has no `dependencies` key after the change | `node -e "const p=require('./package.json');process.exit(p.dependencies?1:0)"` |
| NFR-2 | **Never hangs.** Any run with stdin not a TTY and incomplete answers exits non-zero within 2 s (the update check is skipped when stdout is not a TTY, `bin/akili.js:1882`, so its 1500 ms timeout does not apply) | `printf '' \| timeout 5 node bin/akili.js routing; echo $?` → non-zero, < 5 s |
| NFR-3 | **Atomic, scoped writes.** Files are written with the existing atomic helper; nothing outside `AGENTS.md`'s fence, the five wrapper directories (`.claude/agents/`, `.opencode/agent/` or its override, `.agents/agents/`, `.codex/agents/`, `.cursor/agents/`), and `.agents/model-routing.json` changes | `git status --porcelain` after a run lists only those paths |
| NFR-4 | **Cross-platform.** Paths built with `path.join`; CI matrix (ubuntu/macos/windows × Node 18/22) green; `readline/promises` is available on Node ≥ 17 | CI run |
| NFR-5 | **Pure core.** Derivation and rendering live in `bin/routing.js` as functions with no I/O, unit-tested without a subprocess | `test/routing.test.js` requires the module directly |
| NFR-6 | **Output discipline.** Summary ≤ 1 line per file + 1 per host + 1 for `AGENTS.md`; `--dry-run` prefixed `[dry-run]` | eyeball on fixture output, asserted in the io test |
| NFR-7 | **Claims dated.** Every host-shape claim the generator implements cites the Step 8E pin it derives from (`Last verified` + URL in `design.md`) | review |
| NFR-8 | **Fence compatibility.** The `model-routing` fence uses the exact grammar `bin/persona.js:10-11` accepts, so `doctor --agents` never misparses an `AGENTS.md` it does not read and future tooling can | `node -e` regex test in the unit suite |

## 8. Defect Classes → Gates

| Defect class this spec can produce | Gate that catches it | Falsifying input |
|---|---|---|
| Wrong derivation (T3 = T2; wrong T5; T6 guessed) | `test/routing.test.js` table-driven cases per FR-3, incl. single-model and unknown-id | mutate the T3 rule to ignore the `≠ T2` constraint → red |
| Section written outside the fence / bytes outside changed | io test: fixture `AGENTS.md` with prose before and after; byte-compare outside the fence | write the section at the top instead of inside the fence → red |
| Dropped column (host not selected disappears) | unit assertion: rendered header has 7 columns and every row has 7 cells | drop the Cursor cell when unselected → red |
| Wrapper overwritten without `--force` | io test: pre-existing wrapper byte-identical after run | remove the existence check → red |
| Non-TTY hang | NFR-2 timeout test | remove the `isTTY` guard → test times out → red |
| Hang on Antigravity misnamed tool (runtime, in the host) | **no automated gate** — substitute: generator never writes `tools:` without the user's confirmed names (FR-5), and the summary reports omission | n/a — design-time refusal |
| Packaged roster stale vs doc | drift test (FR-7) | change one id in either file → red |
| Constitution text drops an obligation | **no automated gate** — substitute: term-by-term sweep at the Reviewer (FR-8 obligation scenario), two review rounds per rules task | a deleted item 4 clause the sweep must find |
| Docs overclaim ("every host…") | grep quoted in the task (KZ-002) | a host missing from the enumeration |
| Non-interactive partial write before validation error | io test: invalid `--models` with a valid `--hosts` → tree unchanged | validate after first write → red |
| Idempotence broken (`updatedAt` always rewritten) | io test: second `--yes` run → `git status --porcelain` empty | unconditional timestamp → red |
| Wrong host shape (TOML colons, missing `subagent: true`) | unit snapshot per host of all four wrappers against the Step 8E field tables | remove `subagent: true` → red |
| Interactive TTY path (prompt order, pre-fill, adjust loop) | unit tests through the injectable `ask` seam (prompt count, answers equality with the flag-built answers); the live TTY session itself has **no automated gate** — exercised manually in FR-11 and recorded as an accepted gap | a scripted answer sequence that skips a prompt → red |
| Section template fixed prose drifts from `docs/model-routing.md` | **no automated gate** — the drift test covers the table data only; recorded as an accepted gap, re-read at each release (release checklist) | — |
| Real-host acceptance of the generated wrapper (model id accepted, `readonly` honored) | **no automated gate here** — covered on Claude Code by FR-11's scratch run; other hosts rely on the pins recorded in the archived Codex/Cursor specs; recorded as **accepted risk** for OpenCode/Antigravity in this spec | — |

## 9. Requirement ID Index

| ID | Title | Scenarios |
|---|---|---|
| FR-1 | Interactive wizard | Two hosts happy path · Adjust a tier · No TTY and no flags · Dry run |
| FR-2 | Non-interactive form and mixed input | Fully specified · Validation errors · Mixed input |
| FR-3 | Deterministic tier derivation | Full Claude roster · Single-model roster · Unknown model id |
| FR-4 | Registry section writer | Six states of `AGENTS.md` · Unselected host keeps its column |
| FR-5 | Step 8E wrappers | Skip-by-default · Restriction omitted and reported |
| FR-6 | Answers file and idempotent re-run | Idempotent re-run · Pre-fill |
| FR-7 | Packaged roster and drift test | Drift test |
| FR-8 | Constitution delegates | CLI present · CLI absent · Obligation sweep |
| FR-9 | Docs, audit, root-rule coherence | Aggregate-claim falsification |
| FR-10 | Zero regression, host-neutral, zero deps | — |
| FR-11 | Closing validation | Validation blocked |
| NFR-1…8 | Deps · never hangs · atomic scoped writes · cross-platform · pure core · output · dated claims · fence compatibility | — |
