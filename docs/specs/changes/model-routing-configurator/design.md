# Design: Model Routing Configurator (`akili routing`)

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/model-routing-configurator` |
| Depth | Standard (re-checked in §10 against this design — holds, at the upper edge; see the budget note) |
| Type | Change |
| Approval Mode | `gated` |
| Status | Draft — Phase 2, **amended after Judgment Day round 1** (user chose *Fix only*; `judgment.md` — C1–C15 confirmed severe, S1–S3 split, W1–W17 both-confirmed warnings, U1–U5 suspects all applied; no re-judgment) |
| Date | 2026-10-01 |
| Source | `requirements.md` (Phase 1 approved 2026-10-01, amended in the same fix round — FR-1, FR-2, FR-3, FR-4, FR-5, FR-6, FR-8, FR-10, NFR-2, NFR-3, §4, §8), `proposal.md` (one citation corrected) |
| Format precedent | `docs/specs/archive/2026-10-01-changes--cursor-install-target/design.md` |
| Verified at | `8eb0227` (every `file:line` below; judge re-runs 2026-10-01) |
| Skills applied | `cognitive-doc-design`; `software-architect` **not loaded** — no new service, data flow, or NFR class. `tdd` assigned per task in Phase 3 for `bin/routing.js` and the `akili.js` prompt seam |

## 2. Executive Summary

`akili routing` is a **plan-then-apply** command. A pure module, `bin/routing.js`, turns *answers* (hosts, rosters, placements, invocations, decisions) plus the *packaged roster* into a **write plan** — the fenced registry section, up to twenty wrapper files, and the answers file — with no I/O; `bin/akili.js` collects the answers (flags → previous answers → prompts through an injectable `ask` seam, refusing to prompt when stdin is not a TTY), applies the plan through the existing atomic/skip/dry-run conventions, and prints one summary line per file (or the whole result as JSON with `--json`, which is what `/akili-constitution` reads). Tier derivation is **preference-list intersection**: the packaged roster carries, per host and tier, the ordered list of models that fit it; a user's roster selects from those lists, so a full roster reproduces the packaged default by construction and a partial one degrades predictably; T3 skips T2's pick, and a host where author ≠ auditor cannot hold gets its registry column but **no wrappers**. The fence reuses `persona.js`'s two regexes (exported, additive) with its own six-state replacer and a **provenance check** — a fenced body that differs from what the previous answers render is a hand edit and is refused without `--force`. Wrappers are **opt-in** (`--wrappers`), as Step 8E requires. The constitution's Step 8C/8E become a delegation with the current text demoted to an inline fallback; every obligation of that text is either in the fallback or in the generator's contract tables (§5.4–§5.5), which the Reviewer sweeps term by term (KZ-changes--gate-falsifiability-2).

## 3. Architecture Overview

```
akili routing [flags]
  bin/akili.js  main():2092 switch → case "routing" → runRouting(args)                       (NEW)
     │  1. collectAnswers(args, previous, registry, io)   flags → .agents/model-routing.json → io.ask (TTY only)
     │  2. plan = routing.buildPlan(answers, registry, pkgVersion, snapshot, now)   ← pure (bin/routing.js, NEW)
     │  3. applyPlan(plan, args)   ensureDirectory (quiet) / atomicWriteFileSync / skip-existing / [dry-run]
     │  4. printRoutingSummary(plan) | printJson(plan)
     ▼
  writes:  AGENTS.md (fenced ## Model Routing)   .agents/model-routing.json
           .claude/agents/akili-*.md   .opencode/agent/akili-*.md   .agents/agents/akili-*/agent.md
           .codex/agents/akili-*.toml  .cursor/agents/akili-*.md
  reads:   .claude/templates/model-registry.json        (roster + tierPreference + wrapper shapes per host)
           .claude/templates/model-routing.section.md   (section template, {{placeholders}})
```

| Concern | Where | Why there |
|---|---|---|
| Derivation, flag grammar, rendering, fence replace, plan | `bin/routing.js` (pure, `node:path` only) | Unit-testable without a subprocess (NFR-5); mirrors `bin/persona.js`'s split |
| Prompts (through `io.ask`), TTY guard, file I/O, summary/JSON | `bin/akili.js` `runRouting` + helpers | Where `runInteractiveInit` and the write helpers already live (`:1993`, `:22`, `:389`, `:575-585`) |
| Roster data | `.claude/templates/model-registry.json` | Shipped via `files` → `.claude/templates` (P-4); read from the package dir, never installed to a target |
| Section prose | `.claude/templates/model-routing.section.md` | Maintainers edit Markdown, not a JS string. Its fixed prose has **no automated falsifier** (recorded gap — the drift test covers the table data only) |
| Fence grammar | `bin/persona.js` `SECTION_OPEN_RE` / `SECTION_CLOSE_RE`, **exported** (additive one-line change) | One grammar, one definition (NFR-8); the regexes are not exported today (`:917-937`) |
| Fallback protocol | `.claude/commands/akili-constitution.md` Step 8C/8E | The host-agnostic path when the binary is absent or predates `routing` |

## 4. Extended Directory Structure

```
bin/
  akili.js                 + 13 flags (§5.7), case "routing", runRouting (io over readline), takeSnapshot, applyPlan, printRoutingSummary/printJson
  routing.js               NEW — pure module (§7) incl. collectAnswers + prompt helpers through an injected io
  persona.js               + export SECTION_OPEN_RE, SECTION_CLOSE_RE (module.exports :917-937)
.claude/templates/
  model-registry.json      NEW — per host: models, tierPreference, wrapper shape, cliSuggestion, pins
  model-routing.section.md NEW — section template
test/
  routing.test.js          NEW — unit: deriveTiers, parseModels, renderRegistryTable, replaceFencedSection (6 states, CRLF), renderWrapper (5 hosts), buildPlan, collectAnswers with scripted io
  routing-io.test.js       NEW — subprocess: non-TTY usage error, fully specified --yes run, dry-run, idempotence, skip/force, --adopt, provenance refusal, validation-before-write, --json shape
  registry-drift.test.js   NEW — model-registry.json ↔ docs/model-routing.md registry table (header-anchored)
  fixtures/routing/        NEW — AGENTS.md variants (fenced-clean, fenced-hand-edited, unfenced, absent-section, malformed, CRLF), a pre-existing reviewer wrapper
docs/
  cli.md                   + `routing` row (:77-84), flag rows (:95-118), new "## Routing" section before "## Persona Drift" (:301)
  model-routing.md         + How to apply per tool (:760) first bullet; Cross-tool safety carve-out (:791-817)
  flow.md                  + fourth tenant row (table :354-358)
  commands/akili-constitution.md   summary doc (NOT a mirror — T6-gate correction 2026-10-01): tenant table :79-85 + Model Routing Scaffolding section
README.md                  + `routing` row in "### CLI Commands" (:428-441); mention at :53, :885-904
AGENTS.md                  :37 carve-out
<project>/                 (written at run time)
  AGENTS.md · .agents/model-routing.json · .claude/agents/ · .opencode/agent/ · .agents/agents/ · .codex/agents/ · .cursor/agents/
```

## 5. Data Model

### 5.1 `model-registry.json` (packaged)

| Field | Type | Meaning |
|---|---|---|
| `version` | int | schema version (1) |
| `crossHost.T6` | host key | default owner of T6 (`antigravity`) |
| `hosts.<host>.label` | string | "Claude Code", … |
| `hosts.<host>.cliSuggestion` | string | packaged suggestion for the CLI-invocation row (`claude` · `opencode` · `agy` · `codex` + `$akili-<name>` · `agent` + `/akili-<name>`) — **a suggestion the user confirms, never written unconfirmed** (C8) |
| `hosts.<host>.lastVerified`, `pin` | date, URL | the Step 8E / registry pin for this host's shapes (NFR-7) |
| `hosts.<host>.wrapper` | object | `location` (path pattern), `shape` ∈ {`md-yaml`, `opencode-md`, `agy-yaml`, `toml`}, `restriction` ∈ {`tools`, `sandbox`, `readonly`, `tools-confirm`, `none`}, `effortField` ∈ {`none`, `bracket`, `toml-key`, `in-id`} |
| `hosts.<host>.models[]` | list | `id` (string, or `null` for a family placeholder the user completes), `label`, `family?`, `alias` (bool), `dated` (bool — a dated id needs a recorded reason), `wrapperModel?` (Antigravity: `flash` \| `pro`), `effortRungs` (confirmed list, or `null` = unconfirmed), `planGated?` (Codex Astra/Sol) |
| `hosts.<host>.tierPreference` | map | `T1…T6` → ordered list of `id`s and/or placeholder tokens (`<CONFIRM SLUG>`, `<CONFIRM ID>`, `<CONFIRM>`). **Head = packaged default primary, second = packaged default fallback** — equal to the doc table cell by construction |
| `hosts.<host>.notes` | map | fixed per-tier notes from the doc (`(long context)`, `(vision)`, `*(≠ T2)*`) |

**Cell grammar** (what a doc cell may contain and what the drift test checks): a backticked id ``` `x` ``` → must be an `id` in `models[]`; a capitalized family word (`Terra`, `Luna`, `Sol`, `Astra`) → must be a `family` in `models[]`; a placeholder `<CONFIRM…>` → must appear in `tierPreference` at that tier; anything else (effort labels, annotations, promo text) is ignored. For the head/second check only, a `tierPreference` entry "appears in" a cell when the cell holds it as a backticked id, as its `family` word, as a placeholder token, **or names it by its `models[]` `label` verbatim** — the Antigravity T4 cell (`Gemini 3.8 Flash (High)`, no backticks) and T6 cell name the model by label alone, so without this form no head could satisfy the check (execute-time clarification, 2026-10-01, T1 gate — Leader call, recorded in `execution.md`). The test walks only the five host columns of the table whose header line starts with `| Tier | Claude Code |` (`docs/model-routing.md:118`; the only other `| Tier |` table is the definitions table at `:52` — C13); the shared `Fallback` column is **not walked** as a column (it mixes hosts — C5); it is consulted only as the second place a list's `[1]` entry may appear, because a single-id host cell (every Claude Code cell) keeps its fallback there and FR-3's expected fallbacks come from it (execute-time clarification, 2026-10-01, T1 gate — user-approved).

### 5.2 `.agents/model-routing.json` (project answers)

| Field | Content |
|---|---|
| `version` | 1 |
| `generatedBy` | package version |
| `updatedAt` | ISO date — rewritten **only** when the canonical form of **any** other field changed (DD-8) |
| `hosts[]` | selected host keys |
| `roster.<host>[]` | `{ id, source: "packaged" \| "user", tiers?: ["T1","T3"], reason? }` (`tiers` only for `source: "user"`; `reason` required when `dated: true` — alias-first "record why") |
| `cli.<host>` | confirmed invocation string, or absent (→ `<CONFIRM>` in the row) |
| `mapping.<host>.<tier>` | `{ primary, fallback, note, crossHost? }` — **may hold hosts ∉ `hosts[]`** (a column filled on an earlier run is kept — C3) |
| `wrappers` | `"yes"` \| `"no"` (Step 8E opt-in — C7) |
| `decisions.<host>` | `agentDir?` (OpenCode override), `restriction` (`applied` \| `omitted: <reason>`), `antigravityTools[]?`, `effortBracket` (`applied` \| `omitted: rung unconfirmed`) |
| `authorAuditor.<host>` | `ok` \| `cross-host: <other>` \| `unsatisfiable` |
| `unselectedHosts` | `"keep-previous-else-packaged"` |

### 5.3 Derivation (FR-3) — preference-list intersection

For host H with roster R (ids), `tierPreference` P, and user placements U (`source: "user"` ids with declared tiers, in roster order):

| Step | Rule |
|---|---|
| 1 | For each tier T: `list(T) = U.filter(tiers ∋ T) ++ P[T]` — user-placed ids go to the **head**, in the order given |
| 2 | `cands(T) = list(T).filter(x => x ∈ R or x is a placeholder)` — placeholders are always kept as candidates in list position (T2-gate clarification, 2026-10-01: every packaged list orders ids before placeholders and user placements prepend, so a present roster id always takes the primary slot; a placeholder surfaces as **primary** only when no listed id is in the roster, and as **fallback** when it is the list's next entry — which is what keeps `derive(full packaged roster) == tierDefaults` for Codex T4/T6 `[gpt-5.6-terra, <CONFIRM SLUG>]` and Antigravity T6, FR-3) |
| 3 | T2 first: `primary = cands(T2)[0]`, `fallback = cands(T2)[1] ?? "—"` |
| 4 | T3: `primary = first cands(T3) with id ≠ T2.primary`; none → `authorAuditor = unsatisfiable`, `primary = T2.primary` **in the registry only**, note `author ≠ auditor NOT satisfied — add a model or dispatch T3 cross-host`; if `--t3-cross-host H=other` → `primary = "→ other"`, `crossHost: other`, `authorAuditor = cross-host: other` |
|   | **Ids only (T2-gate clarification, 2026-10-01):** the `≠ T2.primary` comparison is between ids — a placeholder candidate (`<CONFIRM…>`) neither satisfies nor is excluded by it. `authorAuditor = ok` requires T2.primary and T3.primary to both be ids and differ; when either resolves to a placeholder the host is `unsatisfiable` (a Reviewer wrapper cannot be bound to a placeholder — S1), with T3's registry cell = `cands(T3)[0] ?? T2.primary` and the note above. Unselected hosts' columns are rendered from `tierPreference` heads (§5.4), never derived, so the packaged Cursor column (all `<CONFIRM SLUG>`) is unaffected |
| 5 | T1, T4, T5, T6: `primary = cands(T)[0]`, `fallback = cands(T)[1] ?? "—"`; empty → T4: `T2.primary` + note `no long-context model selected`; T6: `<CONFIRM>` + note `→ cross-host dispatch: <crossHost.T6>` when `crossHost.T6 ≠ H` and ∉ `hosts[]`, `→ cross-host dispatch: <crossHost.T6> (selected)` when it is selected, `no vision model selected` when H is `crossHost.T6` itself (W17); T1/T5 empty → `<CONFIRM SLUG>` |
| 6 | Notes are computed from the **final** mapping (W2): `single-model roster` when `|R| = 1`; the fixed per-tier notes from `hosts.<host>.notes` are appended |

Properties: deterministic (list order is the only order used — no numeric ranks, no ties — W2); `derive(full packaged roster) == tierDefaults` by construction (C1, C2); a user id declared for both T2 and T3 is a validation error (`--models` / prompt) because step 4 could never satisfy it.

### 5.4 Section render contract (FR-4) — every Step 8C obligation, by placeholder

| Step 8C obligation (`akili-constitution.md`) | Rendered as |
|---|---|
| item 1 (`:481-484`) philosophy + principles | fixed prose |
| item 2 (`:485-488`) six tiers | fixed |
| item 3 (`:489-496`) phase → tier mapping; execute triad + test harness split; Reviewer ≠ Implementer; Tester ≠ Implementer preference | fixed |
| item 4 (`:497-500`) registry table, 7 columns, `Updated: YYYY-MM`; alias-first; **"pin a dated model ID only when … and record why"** | `{{registryTable}}` (selected hosts from `mapping`, previously-filled hosts from `mapping`, the rest from `tierPreference` heads/seconds); `{{updated}}` (§5.2 `updatedAt` month — S3); dated ids rendered with a footnote `{{pinReasons}}` from `roster[].reason` (C9) |
| item 4 (`:501-507`) Antigravity family + effort-ID; dial → ID map (`low`→`-low`, `medium`→`-medium`, `high`/`xhigh`/`max`→`-high`) | fixed row `{{antigravityDialMap}}` (W10) |
| item 4 (`:509-516`) Codex families; plan-gating; Terra ≠ Luna default pairing | fixed note; roster entries carry `planGated` so the wizard labels Astra/Sol "(plan-gated — confirm in `/model`)" (W10) |
| item 4 (`:518-533`) Cursor families; effort bracket; confirm in the `agent` CLI | fixed note; bracket rules in §5.5 |
| item 4 (`:535-543`) **emit every host column, always** | the table always has 7 columns; an unselected, never-filled host renders `tierPreference` heads (placeholders included) |
| item 4 (`:545-562`) CLI invocation for every host; **ask the user, placeholder the rest** | `{{cliInvocationRow}}` from `cli.<host>`; absent → `<CONFIRM>`; the packaged `cliSuggestion` is only the prompt's default (C8) |
| item 4 (`:564-571`) Cross-host dispatch line and its rule | `{{crossHostLine}}` — T6 owner from `crossHost.T6` / any `crossHost` in `mapping`, plus the fixed rule sentence |
| item 5 (`:573-575`) "edit only this registry … never `model:` in commands … bindings live in the wrappers" | fixed, **amended wording** (T5 updates item 5 too): *"To change models, re-run `akili routing` — it regenerates only this fenced section — or remove the fence and edit the table by hand. Never pin a dated model name where a floating alias exists. Never add `model:` to command frontmatter; enforced bindings live only in the Step 8E agent wrappers."* |
| item 6 (`:577-591`) Effort dial (a)–(f) | fixed |
| mode policy (`:592-604`) Safe Update: never overwrite a customized registry; fill gaps only; **flag stale entries** | provenance check §5.6 (a) (C6); stale lines in the summary: any `mapping` id absent from the packaged `models[]` **and not a `source: "user"` id** (a user id is by definition outside the packaged roster — flagging it on every run would be noise; T3-gate clarification) → `stale? <id> not in packaged roster (<lastVerified>)`; Legacy "annotate actual tooling" stays constitution-side (the agent annotates after the run) |
| confirm paragraph (`:606-614`): **ask about both hosts**; rate limits per generation; **frontier escalation pin re-justification** | the host question *is* the ask (an unselected host = unanswered → placeholders, never a dropped column); fixed sentences for rate limits and pin re-justification; a dated id (`dated: true`) triggers the reason prompt (C9) |
| checklist (`:1356-1358`): section exists in `AGENTS.md`, not duplicated in `CLAUDE.md`; every host column; six tiers + `Updated:` + author ≠ auditor note + Effort dial | all produced by the template; `CLAUDE.md` checked and reported (§5.6) |
| Step 9 (`:1326`) Codex `project_doc_max_bytes` size check | out of the generator; `--json` reports the section's byte length so the constitution can run the check (U1) |

The template contains **no** `Default Branch:` / `Integration Branch:` text (P-7).

### 5.5 Wrapper render contract (FR-5) — per host, fields only

Written only when `wrappers = "yes"` (C7) and only for hosts with `authorAuditor ≠ unsatisfiable` (C11; `cross-host` writes three wrappers and skips the Reviewer). Role → tier: Leader T1, Implementer T2, Reviewer T3, **Tester T2 primary** (Step 8E default; the collapse with the Implementer is noted in the summary as Rule 1 allows — W3).

| Host | File | Fields (Leader / Implementer / Tester) | Reviewer adds | Pin |
|---|---|---|---|---|
| Claude Code | `.claude/agents/akili-<role>.md` | `name`, `description`, `model: <alias or id>` | `tools: Read, Grep, Glob` | `akili-constitution.md:677-721` (no vendor URL in Step 8E) |
| OpenCode | `.opencode/agent/akili-<role>.md` (dir overridable: `--opencode-agent-dir`); **the `opencode.json` form is out of v1** (W8) — manual via the Step 8E fallback | `name`, `description`, `model: <slug>` | nothing — summary: `OpenCode Reviewer: read-only by instruction (restriction shape unconfirmed — Step 8E rule 2)` (W9) | `akili-constitution.md:722-738` |
| Antigravity | `.agents/agents/akili-<role>/agent.md` | `name`, `description`, `model: <wrapperModel>` (`flash` \| `pro` from the roster entry — C4), `subagent: true`, `mainAgent: true` (Leader) / `false` | `tools:` list **iff** `decisions.antigravity.antigravityTools` non-empty; else omitted + reported | `akili-constitution.md:739-784` |
| Codex | `.codex/agents/akili-<role>.toml` | `name`, `description`, `developer_instructions = """…"""` (triple-quoted, references `.agents/<role>.md`), `model`, `model_reasoning_effort` (Leader `high`, Implementer `medium`, Tester `medium`) | `model_reasoning_effort = "high"`, `sandbox_mode = "read-only"` | <https://learn.chatgpt.com/docs/agent-configuration/subagents> `Last verified: 2026-09-16` (`akili-constitution.md:785-837`, pin line `:810`) |
| Cursor | `.cursor/agents/akili-<role>.md` | `name`, `description`, `model: <id>[effort=<rung>]` — bracket **only** when the roster entry's `effortRungs` contains the rung (Leader/Reviewer `high`, others `medium`); `effortRungs: null` → **no bracket**, summary `effort bracket omitted — rung unconfirmed` (S1; a `<CONFIRM>` inside a frontmatter value would break the wrapper) | `readonly: true` | <https://cursor.com/docs/context/subagents> `Last verified: 2026-10-01` (`akili-constitution.md:838-890`, pin line `:888`) |

Body for every Markdown/YAML shape: one sentence referencing `.agents/<role>.md` — never the persona content (Step 8E rule 3). Antigravity summary adds the Step 8E verification note: *"in-session `/agents` lists only `akili-leader` — that is the success condition"* (JA-42). Step 8E's example defaults (Claude tester `sonnet`, Antigravity Leader `pro`) are **superseded by the mapping**; T5 rewrites those example lines to "from the mapping" (C4).

### 5.6 Fence, provenance, and the six `AGENTS.md` states (FR-4)

EOL is detected as `persona.js:92-95` does and lines are split as `:177` does (`/\r\n|\n/`); the regexes match normalized lines; output re-emits the file's EOL (W14).

| State | Detection | Action | Token |
|---|---|---|---|
| (a) fenced, **clean** | exactly one `SECTION_OPEN_RE` with `id=model-routing` … `SECTION_CLOSE_RE`, and body == `render(previousAnswers)` | replace; keep `since=` when the new body is byte-equal, else `since=v<pkg>` | `replaced` / `unchanged` |
| (a′) fenced, **hand-edited or unknown provenance** | fenced, and body ≠ `render(previousAnswers)` or no answers file — **and body ≠ the new render** (T3-gate clarification, 2026-10-01: when the fenced body already equals what this run would write, no byte changes and there is no hand edit to protect, so the token is `unchanged`, not a refusal that would force `--force` to overwrite identical bytes) | **refuse** without `--force`; print unified diff; with `--force` → replace | `refused (hand-edited fence; --force to regenerate)` / `overwritten` |
| (b) unfenced | `^## Model Routing\s*$` outside any fence; extent to the next `^## ` or EOF (headings inside ```` ``` ```` fences ignored) | print diff; TTY → ask adopt/skip; non-TTY → adopt iff `--adopt` (W5) | `adopted` / `skipped (unfenced; --adopt to replace)` |
| (c) absent | neither | append `\n` + fenced block | `appended` |
| (d) no `AGENTS.md` | file missing | create `# Agent Guidance\n\n` + fenced block; hint `/akili-constitution` | `created` |
| (e) malformed | open without close, two `model-routing` blocks, close without open | **refuse**; nothing written to `AGENTS.md`; wrappers and answers still planned | `refused (malformed fence)` |
| (f) fenced + stray unfenced heading | (a)/(a′) plus a `^## Model Routing` outside the fence | handle as (a)/(a′); report the stray heading | `+ stray "## Model Routing" heading at line N — remove it` |
| `CLAUDE.md` holds `## Model Routing` | checked, never written | one report line | `CLAUDE.md carries a Model Routing section — move it to AGENTS.md` |

**One token vocabulary** for every planned write (W4), used by FR-1/FR-4/FR-5/FR-6 and the io tests: `created` · `replaced` · `unchanged` · `appended` · `adopted` · `overwritten` · `skipped (exists; --force to replace)` · `skipped (unfenced; --adopt to replace)` · `skipped (wrappers=no)` · `skipped (author ≠ auditor unsatisfiable)` · `refused (…)`. A wrapper skipped as existing whose `model` differs from the mapping appends `— model drift: file says X, mapping says Y` (C10). A run whose every write is `unchanged`/`skipped` prints `no changes`.

### 5.7 CLI surface additions (`getArgs`, `strict: true` — P-1)

| Flag | Type | Notes |
|---|---|---|
| `--hosts <a,b>` | string | validated against the five keys |
| `--models <host>=<id>[@T<n>[+T<m>]],…` | string, `multiple: true` | one host per flag; **last flag for a host wins**; tiers joined with `+` (W1); `@` is reserved (an id containing `@` is rejected); `@T` outside 1–6 → error; an id ∉ packaged `models[]` **requires** `@T…` (`parseModels` takes the registry — JB-22); the same id on T2 and T3 → error |
| `--cli <host>=<binary>` | string, `multiple: true` | confirmed invocation (C8) |
| `--wrappers yes\|no` | string | Step 8E opt-in (C7); interactive default prompt `[Y/n]`; `--yes` without it → `yes` |
| `--t3-cross-host <host>=<other>` | string, `multiple: true` | records the cross-host Reviewer choice (C11) |
| `--antigravity-tools <a,b>` | string | confirmed tool names; absent → omitted + reported |
| `--pin-reason <host>=<id>=<text>` | string, `multiple: true` | the recorded reason for a dated id (alias-first "record why"); required non-interactively for any packaged id with `dated: true` or any user id carrying a date stamp (`YYYYMMDD` or `YYYY-MM-DD` inside the id); a user id without a date stamp (e.g. `claude-opus-4-6`, a Cursor slug) needs none — FR-2's *Fully specified, no TTY* scenario passes Cursor user ids with no `--pin-reason` and exits 0 (T2-gate clarification, 2026-10-01) |
| `--opencode-agent-dir <path>` | string | default `.opencode/agent` |
| `--yes` | boolean | accept the derived mapping; non-TTY + still-incomplete answers → usage error |
| `--adopt` | boolean | adopt an unfenced section non-interactively (W5) |
| `--json` | boolean | print the plan result (files + tokens, placeholders per column, `authorAuditor`, restrictions, section byte length) to stdout instead of the summary (U1) |
| `--project <path>` | string | default `process.cwd()` |
| `--dry-run`, `--force` | existing | `--force` = overwrite existing wrappers **and** regenerate a hand-edited fence |

Validation runs **before** `buildPlan`; `buildPlan` runs before any write; a validation error exits via `fail()` with no file touched (FR-2). **Non-TTY rule (W6):** a usage error only when, after flags and the previous answers file, any answer is still missing.

## 6. Reversion Challenge (Step 2.3) — outcomes

No DD removes, disables, or inverts delivered behavior: Step 8C/8E text is **demoted** to a fallback, not deleted; item 5's instruction is **re-worded** (the "single place to change models" intent stands — the place is now the command or the unfenced table); the "No installer changes" bullet gains a carve-out sentence; the dirty-tree guard in `doctor --agents --fix` is left as is (DD-9). **Challenge skipped — no reversion trigger fires.**

## 7. Backend Module Design — `bin/routing.js` (pure) and the `akili.js` seam

| Function | In → Out | Owner FR |
|---|---|---|
| `parseHosts(str)` | → host keys or `{ error }` | FR-2 |
| `parseModels(list, hosts, registry)` | → `roster` map or `{ error }` (unknown host · host ∉ hosts · empty · bad `@T` · unknown id without `@T` · `@` in id · same id T2+T3 · dated id without reason in non-interactive mode) | FR-2, FR-3 |
| `parseCli(list, hosts)`, `parseCrossHost(list, hosts)` | → maps or `{ error }` | FR-2 |
| `deriveTiers(roster, hostRegistry, crossHostChoice, selectedHosts, hostKey)` | → `{ mapping, authorAuditor, notes[] }` per §5.3 | FR-3 |
| `renderRegistryTable(mappingByHost, registry, roster)` | → 7-column Markdown; Fallback cell = per-host `` `id` (host) `` list; `roster` supplies the `[pin N]` markers for dated ids (T3: `hosts` was unused and dropped) | FR-4 |
| `renderSection(template, ctx)` | `{{placeholders}}` → body | FR-4 |
| `replaceFencedSection(text, body, sinceTag, expectedBody, opts)` | → `{ text, state, token, diff? }` for (a)/(a′)/(b)/(c)/(e)/(f); `(d)` when `text === null` | FR-4 |
| `renderWrapper(host, role, mapping, decisions, registry)` | → `{ relPath, content }` or `null` (skipped role) | FR-5 |
| `canonicalAnswers(answers)` | → stable JSON without `updatedAt` | FR-6 |
| `buildPlan(answers, registry, pkgVersion, snapshot, now, opts)` | `snapshot = { agentsMd, claudeMd, existingFiles: Map<relPath, content>, previousAnswers, eol, sectionTemplate }` (the template is passed in — the module reads no file, NFR-5); `opts = { force, adopt }` → `{ writes: [{ relPath, token, content, note }], stale[], authorAuditor, placeholdersByColumn, sectionBytes, exitCode, hints[], reports[], registryTable, answers }` — `reports[]` carries the non-token summary lines (`CLAUDE.md` line, restriction/effort omissions, Antigravity `/agents` note, Tester-collapse line, cross-host dispatch, skipped roles, `no changes`); `hints[]` only the DD-9 and state-(d) hints (T3-gate amendment, 2026-10-01) | FR-1, FR-4–6 |

**Prompt seam — in `bin/routing.js`, not `akili.js`** (Phase 3 refinement: `akili.js` runs `main()` on load, `:2120`, so nothing in it is unit-testable by `require`): `collectAnswers(args, previous, registry, io, { isTTY })` — `io.ask(question, default)` is injected (`readline/promises` in production, a scripted array in tests — W11); returns a usage error instead of calling `io.ask` when `!isTTY`; `promptMultiSelect(io, title, options, preChecked)` (numbered; comma list; `Enter` keeps pre-checked — `akili init`'s numbered style, extended to comma lists: `init` itself is single-choice, `:2002-2020`); `promptTierAdjust(io, mapping, roster)`. `bin/akili.js` keeps only the I/O: `runRouting(args)` builds `io` over `readline/promises` when `process.stdin.isTTY`, `takeSnapshot(projectDir)`, `applyPlan(plan, args)` (collects directories to create and prints one aggregated line — U4), `printRoutingSummary` / `printJson`. The update check (`:2080`) is skipped when stdout is not a TTY (`:1882`), so it does not count toward NFR-2's non-TTY budget; its 1500 ms timeout (`:1828`) applies to TTY runs only.

**Hint lines** after a real write: `commit .agents/model-routing.json and the wrappers — akili doctor --agents --fix refuses a dirty .agents/` (DD-9); state (d): `run /akili-constitution to complete AGENTS.md`.

## 8. Surface Table — every consumer of the enumerations this spec extends

| Enumeration | New value | Existing consumer | What it does with the new value |
|---|---|---|---|
| `args.command` | `routing` | `main` switch `:2092-2116` | new `case "routing"` (`default:` still handles unknown commands — JB-37) |
| | | `printHelp` `:199-253` | one `Commands` line, thirteen `Options` lines, three examples |
| | | banner exclusion `:2082`; update check `:2080`/`:1882` | banner prints (as `doctor`); check runs only on a TTY |
| | | `docs/cli.md:75-84`, `:95-118` | one row; thirteen option rows; `## Routing` section |
| | | **`README.md:428-441` "### CLI Commands" table** (C12) | one row |
| `.agents/` tenants | `.agents/model-routing.json` | `akili-constitution.md:891-906`; Step 9 `:1324` "three-tenant" | fourth row; "four-tenant" wording |
| | | `docs/flow.md:354-358`; **`docs/commands/akili-constitution.md:79-85`** (C14 — a summary doc, not a mirror; T6-gate correction) | fourth row each |
| | | `agentsDirtyStatus` `:1483-1494` | counts as dirty until committed — unchanged, hinted (DD-9) |
| `.claude/templates/` files | two data files | `release.js` `ROLES` `:15`; `AGENT_TEMPLATES` `:75`, `:776-790`, `:1232-1236`, `:1078-1079`; `docs/cli.md:268-280` Packaged Resources | **not enumerated / not listed** — by design (P-4): they are inputs to `routing`, not installed resources; `docs/cli.md` *Routing* section says so |
| Step 8C/8E flow | delegation | `akili-constitution.md` Step 8C `:465-617`, Step 8E `:663-930`, Step 9 `:1309-1329` (incl. `:1326`), checklist `:1352-1358`, model-checkpoint fallback `:23`, guide rule `:79-81`; summary doc `docs/commands/akili-constitution.md` (not a mirror — T6-gate correction) | rewritten per DD-6; fallback keeps the text; item 5 re-worded; summary doc updated for consistency |
| Model Registry Drift | third signal | `akili-audit.md:56`; `docs/flow.md:407` (the mirror `docs/commands/akili-audit.md` carries no such clause — `grep -in "registry drift\|Model Routing"` → 0, U3) | one clause in the two existing sites |
| Installer rule | carve-out | `AGENTS.md:37`; `docs/model-routing.md:791-817` | one sentence each |
| `persona.js` exports | two regexes | `module.exports` `:917-937`; `test/persona-digests.test.js` | additive; existing tests unaffected |

## 9. Design Decisions

### DD-1 — Plan-then-apply, pure core
`buildPlan` is pure over a filesystem snapshot and a `now`; `applyPlan` is the only writer. Validation errors and refusals surface before any write. Rejected: inline writes — a mid-run error would leave a half-written tree.

### DD-2 — Export the fence regexes; own six-state replacer
`persona.js` parse/render need a persona's project block (P-3) and the regexes are not exported (P-19). The fix is a one-line additive export; `routing.js` imports them and implements `replaceFencedSection` for `AGENTS.md`. Rejected: copying the regexes (two definitions of one grammar — NFR-8) and generalizing `persona.js` (its callers assume personas).

### DD-3 — Roster, preference lists, and section prose as packaged data
`model-registry.json` + `model-routing.section.md` under `.claude/templates/` (shipped by `files`, P-4; not enumerated by the fixed lists — intended). Drift test anchored on the header line `| Tier | Claude Code |` (C13) using the §5.1 cell grammar over the five host columns (C5). KZ-002: the standing falsifier for "the JSON matches the doc". The section template's fixed prose has no automated falsifier — recorded in `requirements.md` §8 as an accepted gap (W12).

### DD-4 — Preference-list intersection, user placements at the head
§5.3. No ranks, no ties, no capability flags to get wrong (C1, C2, W2): the packaged lists *are* the doc's cells, so a full roster reproduces them and a partial roster takes the first available entry. Unknown ids carry an explicit placement (`@T1+T3` / prompt) — never a guessed position.

### DD-5 — author ≠ auditor unsatisfiable → registry yes, wrappers no
Step 8E Rule 1 is a MUST (C11). With one model there is no tier to escalate to, so the honest output is: the registry column (with the note), **no wrappers for that host**, three recorded ways out — add a model, `--t3-cross-host` (three wrappers, Reviewer dispatched cross-host), or leave it. `--yes` exits 0 with the `skipped (author ≠ auditor unsatisfiable)` line; the constitution relays it. Rejected: "proceed, recorded" — it rewrote a MUST as a choice.

### DD-6 — Constitution delegates; opt-in and older-CLI branches named
Step 8C: ask hosts → rosters (+ placements for unknown ids, reasons for dated ids) → invocations → *"bind the personas with native wrappers?"* → run `akili routing --project . --hosts … --models … --cli … --wrappers … --yes --json` → read stdout JSON. Three terminal branches: binary present and knows `routing`; **binary present but older** (`Unknown command: routing`, `:2115-2116` — U2) → fallback; binary absent → fallback. The inline fallback writes the same fenced section (`id=model-routing`) so a later run lands in state (a′) (no answers file → `--force` needed, which the fallback text says). Step 9 reads the JSON (files + tokens, placeholders per column, restriction state per Reviewer, `authorAuditor`, section bytes for the Codex `project_doc_max_bytes` check) and says when the fallback was used. Obligation sweep per FR-8 (KZ-changes--gate-falsifiability-2; KZ-changes--kaizen-loop-closure-2).

### DD-7 — Restrictions and effort: write only what is confirmed, report the rest
Claude Code `tools`, Codex `sandbox_mode`, Cursor `readonly` are pinned; Antigravity `tools` only from confirmed names; OpenCode none (W9 — a documented v1 limit under Rule 2, the confirmed-shape path stays in the fallback); Cursor bracket only for a confirmed rung (S1). Every omission is a summary line (Rule 2: an *unreported* omission is the defect).

### DD-8 — Idempotence by canonical comparison, dated from the answers
`updatedAt` changes only when the canonical answers change; `Updated:` in the section is the month of `updatedAt` (not the clock — S3); fence `since=` changes only when the body changes. Falsifiers (T3 tests): an unconditional timestamp; a month-boundary re-run.

### DD-9 — `doctor --agents --fix` dirty-tree guard left unchanged
`agentsDirtyStatus` (`bin/akili.js:1483-1494`) excludes only `.agents/.gitignore` and `.agents/.backup/`; an uncommitted answers file (or Antigravity wrappers — already true today) makes `--fix` refuse until committed. Kept: the guard protects persona fixes from mixing with uncommitted `.agents` changes, and widening a safety filter for convenience is the wrong trade. `routing` prints the commit hint; `docs/cli.md` says it. (The queued pin-parser bug lives in `readConstitutionPins`, `bin/akili.js:1405` — same file, different function; the sequencing concern is file-level, not this guard — JA-39.)

### DD-10 — `--project` optional, cwd default; ask, don't probe
Consistent with `doctor --agents` (cwd, `:1585`). The command never runs `agy models`, Cursor `/model`, or `codex /model`: Step 8C has the **user** run those and confirm ids (`:505`, `:524-528`); the "ask rather than probe" rule (`:560-562`) is about CLI invocations — both are honored by prompting (W10).

### DD-11 — Six `AGENTS.md` states, one token vocabulary, `CLAUDE.md` read-only
§5.6 names every terminal branch (KZ-004), including malformed and mixed states (W4). `CLAUDE.md` is never written (`:79-81`: `@AGENTS.md` shim only).

### DD-12 — Provenance check implements Safe Update
A fenced body that is not what the previous answers render is a hand edit; refusing it without `--force` and showing the diff is the generator's form of "do not overwrite a customized registry" (C6). Stale ids are reported, not edited ("flag stale entries"). The section text tells the user to regenerate or to remove the fence and own the table.

### DD-13 — OpenCode: agent directory only in v1
`.opencode/agent/*.md` (dir overridable). The `opencode.json` `agent` block needs a schema the repo cannot pin (W8, P-16): location, JSONC, body key. It stays in the Step 8E fallback; a follow-up may add it once confirmed.

### DD-14 — Interactive logic tested through a seam, not a pty
`collectAnswers` takes `io.ask`; unit tests script answers and assert prompt counts, pre-fill, adjust loops, and that the resulting `answers` equal the flag-built ones (FR-2 "byte-identical" is proven at the plan level). `spawnSync` cannot drive a TTY (P-20), so the live wizard is exercised manually in FR-11 and recorded as such in `requirements.md` §8 (W11).

### DD-15 — Rules-document tasks get two review rounds; code tasks use `tdd`
`routing.js` and the `collectAnswers` seam are logic-heavy → `tdd` with expected values from FR-3/FR-4/FR-6 scenarios; budget below.

## 10. Budget (Step 2.4 — tripwire for `/akili-execute`)

| Measure | Estimate | Basis |
|---|---|---|
| Tasks | **8** | T1 data files + drift test · T2 `routing.js` parse + derive (tdd) · T3 `routing.js` render + fence + wrappers + plan (tdd) · T4 `akili.js` flags + `collectAnswers` seam + `persona.js` export (tdd) · T5 `akili.js` apply/summary/json + io tests · T6 constitution Step 8C/8E/9 + checklist + mirror · T7 audit, root rule, docs, README, flow tenant, CHANGELOG · T8 closing validation |
| LOC | **~1,550** → **revised ~3,400 after T3** (user decision at the budget tripwire, 2026-10-01: 2,319 LOC landed after 3 tasks — per-task size, not scope; new tripwire ~4,000) | `routing.js` ~420 · `akili.js` ~220 · `persona.js` 2 · JSON ~140 · template ~80 · tests ~480 · prose ~210 |
| Review rounds | **18** | code tasks 5 × 2 = 10 (precedent: the Cursor spec consumed 18 of 16 — U5) · rules docs 2 × 2 = 4 · validation 1 · margin 3 |

Depth check: more code than the Cursor spec (8 / ~700 / 16), same risk class (no data, auth, API) → **Standard holds**, at its upper edge; splitting into two specs would separate the CLI from the constitution it serves and lose the single validation. Tripwire: `/akili-execute` escalates at task 9, ~1,900 LOC, or round 19.

## 11. Premise Ledger

**Count:** 27 rows — 26 verified, 1 `UNVERIFIED` (0 High, 1 Low).
**Blast-radius triggers:** `live-path` fires (user action `akili routing`); `shared-state` fires (`.agents/` is read by `doctor --agents`; `AGENTS.md` is read by `readConstitutionPins` and every command's model checkpoint); `consumer` fires (`args.command`, the `.agents/` tenant set, `persona.js` exports, and `.claude/templates/` gain values).

| # | Claim | Class | Citation (as run) | Verified at | If false | Settled by |
|---|---|---|---|---|---|---|
| P-1 | `getArgs` uses `util.parseArgs` with `strict: true`; an undeclared flag fails; `multiple: true` has a precedent | `data-env` | `bin/akili.js:7` · `:308-312` `strict: true, allowPositionals: true` · `:384-385` `fail(err.message)` · `:303` `section: { type: "string", multiple: true, default: [] }` | `8eb0227` | flag declarations change — Low | — |
| P-2 | No `routing` command and no write to `AGENTS.md`/`CLAUDE.md` in `bin/` | `existence` | `grep -n "routing" bin/akili.js` → 0 · `grep -rnE "(write\|append)[A-Za-z]*\(.*(AGENTS\|CLAUDE)\.md" bin/ \| wc -l` → `0` · `grep -rn "AGENTS.md\|CLAUDE.md" bin/` → `:1401` (comment), `:1406` (read) | `8eb0227` | a writer exists → reuse — Low | — |
| P-3 | `persona.js` parse/render are coupled to a single project block | `location` | `bin/persona.js:290-292` · `:381-384` · `:445` · exports `:917-937` list no generic replacer | `8eb0227` | DD-2 reuses it — Low | — |
| P-4 | Templates are enumerated by fixed lists; a JSON in `.claude/templates/` is neither hashed nor installed; `files` ships the directory | `data-env` | `scripts/release.js:15`, `:130`, `:171` · `bin/akili.js:75`, `:776-790`, `:1232-1236`, `:1078-1079` · `package.json:19` `".claude/templates"` · `scripts/ci/install-layout-regression.js:300` fixed names | `8eb0227` | glob-based → T1 relocates — Low | — |
| P-5 | Write helpers: atomic write has no dry-run/force; skip-existing and dry-run live in the copy helpers | `location` | `:22-26` · `:575-577` · `:581-585` · `:389-396` | `8eb0227` | `applyPlan` uses another helper — Low | — |
| P-6 | `agentsDirtyStatus` excludes only `.gitignore` and `.backup/`; `--fix` refuses on other uncommitted `.agents` paths | `shared-state` | `:1483-1494` (filter `:1491`) · `:1525-1530` | `8eb0227` | DD-9 hint unnecessary — Low | — |
| P-7 | `readConstitutionPins` reads `AGENTS.md` then `CLAUDE.md`, regexes `Default Branch:\s*(\S+)` / `Integration Branch:\s*(\S+)`, first match wins | `shared-state` | `:1406` · `:1415-1416` · `:1417` | `8eb0227` | template could hold those phrases — Low (avoided anyway) | — |
| P-8 | The registry table is at `docs/model-routing.md:118-125`; **one** other `\| Tier \|` table exists (`:52`, definitions); a T1/T3 pin table exists at `:295-298` with a different header | `data-env` | `grep -n "^| Tier " docs/model-routing.md` → `52:\| Tier \| Definition \|`, `118:\| Tier \| Claude Code \| …` · `:295` `\| Slot \| Default (alias) \| Frontier escalation pin \| Fallback \|` · `:101` `*Registry updated: 2026-09.*` | `8eb0227` | drift-test anchor changes — Low | — |
| P-9 | Model Routing obligations live at Step 8C `:465-617` (items `:481-590`, mode policy `:592-604`, confirm `:606-614`), Step 8E `:663-930` (tenant table `:891-906`, Rules `:912-929`), Step 9 `:1309-1329` (`:1322-1326`), checklist `:1352-1358`, model-checkpoint fallback `:23`, guide rule `:79-81` | `location` | `grep -n "^### Step 8C\|^### Step 8E\|^### Step 9\|^\*\*Rules:\*\*\|third tenant" .claude/commands/akili-constitution.md` → `465`, `663`, `1309`, `912`, `891` · `sed -n 1356,1358p` → the three `## Model Routing` checklist items · `:1326` Codex `project_doc_max_bytes` · `:23`, `:79-81` read | `8eb0227` | the FR-8 sweep misses text → **High** | T6's first step re-runs `grep -n "Model Routing" .claude/commands/akili-constitution.md` and diffs against this list |
| P-10 | `args.command` consumers: `main` switch, `printHelp`, banner exclusion, update check, `docs/cli.md` table, **`README.md` "### CLI Commands" table** | `consumer` | `bin/akili.js:2092-2116`, `:199-253`, `:2082`, `:2080`/`:1882` · `docs/cli.md:75-84` · `sed -n 428,441p README.md` → `### CLI Commands` + `\| Command \| Purpose \|` rows `install, update, list, doctor, doctor --agents, check-update, notifications` | `8eb0227` | a missed consumer → undocumented command — Low | — |
| P-11 | `.agents/` tenant tables: constitution `:891-906` and `:1324`; `docs/flow.md:354-358` (header `:354`, rows `:356-358`); mirror `docs/commands/akili-constitution.md:79-85`; `docs/cli.md` uses "tenant" for shared-root detection (`:45`, `:48`, `:204`, `:208`), not a table | `consumer` | `grep -rn "tenant" .claude/commands/akili-constitution.md docs/flow.md docs/cli.md docs/commands/akili-constitution.md README.md` → constitution `:891`, `:904`, `:906`, `:1324`; flow `:350`, `:352`; cli `:45`, `:48`, `:204`, `:208`; mirror `:79` | `8eb0227` | a fifth table → T7 misses a row — Low | — |
| P-12 | Tests drive the CLI as a subprocess with `HOME` redirected into `mkdtemp` dirs | `data-env` | `test/install-cursor.test.js:62`, `:107`, `:129-133` · `test/agents-doctor-io.test.js:30-34`, `:44`, `:50` | `8eb0227` | io tests adopt another pattern — Low | — |
| P-13 | The root rule and the doc bullet forbid installer injection, not a user-invoked command | `other` | `AGENTS.md:37` · `docs/model-routing.md:796-798` "agent definitions … generated with the user's approval in Step 8E … **No installer changes.**" | `8eb0227` | rule read as forbidding `routing` → scope changes; user approved the carve-out — Low | — |
| P-14 | `akili routing` reaches `runRouting` via `bin/akili.js` → `main` → `getArgs` positional → `switch` | `live-path` | `package.json:14` `"akili": "bin/akili.js"` · `:2070` · `:314` · `:2092` | `8eb0227` | n/a — path created by T5 | — |
| P-15 | Node ≥ 18 and `readline/promises` already required | `data-env` | `package.json:50` · `bin/akili.js:1795` | `8eb0227` | prompt helper changes — Low | — |
| P-16 | The user's OpenCode version stores project agents in `.opencode/agent/*.md` | `data-env` | `UNVERIFIED — confirm at source before relying on it` — repo evidence is prose only (`akili-constitution.md:722-723`, `docs/model-routing.md:518`, `:745`); the installer's own OpenCode layout uses `<cwd>/.config/opencode` (`bin/akili.js:331`, `:2048`) and a plural `commands` dir (`:156`) | — | wrong default dir → `--opencode-agent-dir` — Low | the wizard's OpenCode question / `--opencode-agent-dir` (user-stated at run time) |
| P-17 | Antigravity wrapper `model` takes `inherit` \| `flash` \| `pro`, not a registry id | `data-env` | `akili-constitution.md:761` "`model` \| `inherit` \| `flash` \| `pro` — the registry's Antigravity column. Leader/Reviewer `pro` (T1/T3)" · registry `:120` T1 Antigravity `gemini-3.8-flash-high` | `8eb0227` | §5.5 could copy ids — Low (wrapperModel then redundant) | — |
| P-18 | The doc table has one shared `Fallback` column; Codex cells are family words; some cells mix a family with a placeholder | `data-env` | `sed -n 118p` header ends `\| Fallback \|` · `:120` Fallback `` `opencode-go/glm-5.3` / `sonnet` `` · `:120` Codex `Terra; Sol where the plan allows` · `:123` Codex `Terra <CONFIRM SLUG>` | `8eb0227` | cell grammar simplifies — Low | — |
| P-19 | `SECTION_OPEN_RE` / `SECTION_CLOSE_RE` are not exported from `persona.js` | `existence` | `sed -n 917,937p bin/persona.js` → export list without the two names | `8eb0227` | DD-2 import needs no change — Low | — |
| P-20 | `spawnSync` gives the child a piped, non-TTY stdin; no existing test drives a prompt | `data-env` | `test/install-cursor.test.js:129-133` `spawnSync(process.execPath, …, { encoding: "utf8", ...opts })` (no `stdio: "inherit"`) · `grep -rn "isTTY\|stdin" test/` → 0 | `8eb0227` | TTY e2e automatable → DD-14 seam optional — Low | — |
| P-21 | `akili init` is single-choice (`toolAnswer.trim() === "2"`), not a comma multi-select | `data-env` | `bin/akili.js:2002-2020` | `8eb0227` | FR-1 wording only — Low | — |
| P-22 | `persona.js` detects EOL by majority and splits on `/\r\n\|\n/` | `location` | `bin/persona.js:92-95` · `:177` | `8eb0227` | W14 mechanics change — Low | — |
| P-23 | The update check is skipped when stdout is not a TTY; its network timeout is 1500 ms | `data-env` | `bin/akili.js:1882` `if (!process.stdout.isTTY) return;` · `:1828` `{ timeout: 1500 }` | `8eb0227` | NFR-2 budget for non-TTY runs — Low | — |
| P-24 | `docs/commands/akili-audit.md` carries no Model Registry Drift clause | `existence` | `grep -in "registry drift\|Model Routing" docs/commands/akili-audit.md` → 0 (exit 0, no output) | `8eb0227` | a mirror edit is owed — Low | — |
| P-25 | The frontier escalation pin table exists in the doc (`claude-fable-5`, "record the reason") | `data-env` | `docs/model-routing.md:295-298` | `8eb0227` | pin re-justification prose unnecessary — Low | — |
| P-26 | Step 8E pins: Codex subagents page `Last verified: 2026-09-16`; Cursor subagents page `Last verified: 2026-10-01`; Claude Code and Antigravity bullets carry no vendor URL | `data-env` | `akili-constitution.md:810` (Codex pin) · `:888` (Cursor pin) · `sed -n 677,784p .claude/commands/akili-constitution.md \| grep -c "https://"` → `0` | `8eb0227` | §5.5 Pin column cites a URL that exists — Low | — |
| P-27 | The default registry carries 10 placeholder cells in the five host columns (OpenCode 1, Antigravity 1, Codex 2, Cursor 6) | `data-env` | `sed -n 120,125p docs/model-routing.md \| awk -F'\|' '{for(i=3;i<=7;i++) if($i ~ /<CONFIRM/) c[i]++} END{for(i in c) print i, c[i]}'` → `4 1`, `5 1`, `6 2`, `7 6` | `8eb0227` | problem statement weakens — Low | — |
