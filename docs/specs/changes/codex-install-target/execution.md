# Execution Log: OpenAI Codex CLI as a Fourth Install Target

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/codex-install-target` |
| Depth | Standard |
| Approval Mode | `gated` (inherited from `proposal.md`) |
| Started | 2026-09-16 |
| Leader model | Fable 5.1 (session model; registry T1 = `opus` — session model stronger, passed silently; packaged default registry `docs/model-routing.md` Claude Code T1 entry is the alias `opus`, no update needed) |
| Implementer model | `sonnet` (T2, registry default) — fallback sub-prompt path seeded with `.agents/implementer.md` (no Step 8E wrappers in this repo) |
| Reviewer model | `opus` (T3, registry default) — fallback sub-prompt path seeded with `.agents/reviewer.md`; author ≠ auditor held by model |
| Budget (design §9) | 7 tasks · ~560 lines · 1 review round per task + 1 reserved |
| Commit prefix | `[SPEC:changes/codex-install-target]` |
| Wave plan | Wave 1: T1 ∥ T4 ∥ T5 (disjoint files, no shared build output). Wave 2: T2 ∥ T3. Then T6, then T7 (closing gate, user present) |

## 2. Task Execution History

### T4 — `/akili-execute`, `/akili-test`, `docs/flow.md` per-host paragraphs

| Field | Value |
|---|---|
| Status | **PASS** (attempt 2 of 3) |
| Date | 2026-09-16 |
| Implementer | `sonnet`, effort `medium` (attempt 1) → `high` (attempt 2); skills: `cognitive-doc-design` (task default, kept) |
| Reviewer | `opus`, effort `high` |

**Attempt 1** — files: `.claude/commands/akili-execute.md`, `.claude/commands/akili-test.md`, `docs/flow.md` (16+/4−). Implementer verification: checks 1–4 green (`grep Codex` hits at spawn bullets, both checkpoints, Unattended, flow launch, flow tenants; `leader.md` untouched; `Last verified` at the execute checkpoint; `^model:` empty; `git diff --check` clean). Pin fetches: `developers.openai.com/codex/guides/slash-commands` → 308 → `https://learn.chatgpt.com/docs/cli/slash-commands` (`/model` — "Choose the active model (and reasoning effort, when available)"; **no standalone `/reasoning` command**); `https://learn.chatgpt.com/docs/build-skills`.

Reviewer verdict: **FAIL** (2 issues). `/model` wording adjudicated as conforming (page supports it; DD-8 requires stating what the source states — spec's literal "`/reasoning`" is not on the page). Issues, verbatim:

1. **Discovered Issue:** The tenant pin in `docs/flow.md:349` asserts two things the pinned page does not state. It claims Codex "scans **only** `<root>/.agents/skills/*/SKILL.md`" and "does not read `.agents/<role>.md` persona files directly". The fetched page states *"Codex reads skills from repository, user, admin, and system locations. For repositories, Codex scans `.agents/skills` in every directory from your current working directory up to the repository root"* and enumerates `$HOME/.agents/skills`, `/etc/codex/skills`, and bundled system skills. It never states the scan is exclusive, and it is silent on root-level `.agents/*.md`. The sentence carries no `Unverified:` marker.
   - **Violated Rule:** `design.md` §4 (W-8: "Until the live check, `--local` for Codex carries `Unverified:` on this claim"); `requirements.md` NFR-5; `design.md` DD-8 (KZ-001).
   - **Remediation:** Split the sentence: keep the pinned half as the page words it; mark the exclusivity/negative half `Unverified:` pending T7 step 5.
2. **Discovered Issue:** The launch paragraph at `docs/flow.md:254` adds an unpinned Codex behavior claim: *"a command installed as a skill is invoked `$akili-<name>` (skills are invoked with `$`)"* — neither `Last verified` + URL nor `Unverified:`, inside a sentence whose purpose is "no claim".
   - **Violated Rule:** `requirements.md` NFR-5; `design.md` §7 row 18 ("per-host launch paragraph (Codex: no claim)").
   - **Remediation:** Drop the invocation clause, or pin it to a page stating the `$` syntax with `Last verified: 2026-09-16` + URL.

Decision (Leader): spec text names "`/model` and `/reasoning`"; the pinned source has no `/reasoning` command. Not a pivot — a docs claim corrected at the source per DD-8/NFR-5. T5 aligned in the same wave (relayed). T3's Step 8E effort-mapping text must not claim `/reasoning` either — forward pointer for T3's brief.

**Attempt 2** — same three files (16+/4−, net). Fixes: `docs/flow.md` tenant sentence now states only what the page states (repo-scope scan of `.agents/skills` from cwd up to repo root, plus user-scope `$HOME/.agents/skills`; `Last verified: 2026-09-16` — https://learn.chatgpt.com/docs/build-skills) and carries `**Unverified:**` on the negative claim (Codex not documented to read `.agents/<role>.md`), pointing at T7 step 5; the `$akili-<name>` invocation clause is pinned to the same page ("type `$` to mention a skill"); both model checkpoints now say "when available" (page wording). Implementer verification: checks 1–4 green, `git diff --check` clean.

Reviewer verdict: **PASS**. Summary: both issues closed against the source, not just reworded — tenant pin tracks the page and the exclusivity claim carries `Unverified:` + T7 pointer per design §4/NFR-5; `$` invocation verified on the page ("run `/skills` or type `$` to mention a skill"); spawn bullets match DD-7 with `Unverified:` intact; Unattended uses the OpenCode "no verified equivalent" wording per FR-8 BUT; tenant table reproduces design §4 row for row; no `leader.md` hunk, no `model:` frontmatter.

| Field | Value |
|---|---|
| Requirements covered | FR-8 (Leader-inside-Codex scenario incl. BUT Unattended; tenant scenario, flow.md half), NFR-3, NFR-5 |
| Decisions | `/model` wording states the source (no standalone `/reasoning`); `$` invocation pinned rather than dropped (page states it) |
| Issues | Attempt 1 over-claimed a negative the source is silent on (KZ-001 class) — fixed |
| Queued for T7 | Spawn-instruction executability (step 3); tenant `Unverified:` (step 5); Unattended equivalent (step 6) |
| Final verification | checks 1–4 green; `git diff --check` clean |
| Approval gate | `gated` — user asked at the wave-1 landing |

### T5 — `docs/model-routing.md`: Codex column, enforced-routing row, how-to-apply, CLI row

| Field | Value |
|---|---|
| Status | in progress (attempt 2 open) |
| Date | 2026-09-16 |
| Implementer | `sonnet`, effort `medium` (attempt 1) → `high` (attempt 2); skills: `cognitive-doc-design` (task default, kept) |
| Reviewer | `opus`, effort `high` |

**Attempt 1** — file: `docs/model-routing.md` (73+/8−). Implementer verification: check 1 six tiers filled, T2 `Sol` ≠ T3 `Astra`; check 2 fetched `https://learn.chatgpt.com/docs/models` (2026-09-16): roster `gpt-6-astra`, `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna`, `gpt-5.3-codex-spark` (preview, not mapped); families used (no floating alias exists — DD-3); `<CONFIRM SLUG>` on T4 (no context window stated) and T6 (no vision stated); effort enum on page Low/Medium/High/Extra High/Max/Ultra; check 3 CLI row + enforced-routing row present; `git diff --check` clean. Corrected mid-attempt after the T4 relay: no standalone `/reasoning` command (fetched `https://learn.chatgpt.com/docs/cli/slash-commands` independently).

Reviewer verdict: **FAIL** (2 issues). Verified clean: subagents pin real (`https://learn.chatgpt.com/docs/agent-configuration/subagents` states `name`, `description`, `developer_instructions` + `config.toml` keys `model`, `model_reasoning_effort`, `sandbox_mode`, `mcp_servers`; no tool allowlist); every Codex cell on the pinned page, quotes verbatim; `<CONFIRM SLUG>` cells justified; T2 ≠ T3; effort table matches design §5.3; `/reasoning` deviation correct (spec text stale); cross-host host list = CLI-invocation table, landed. Issues, verbatim:

1. **Discovered Issue:** The Codex row in *Enforced routing* and the `sandbox_mode` sentence below it document a TOML file using YAML/frontmatter colon syntax: `model:`, `model_reasoning_effort:`, `sandbox_mode: "read-only"`. `.codex/agents/akili-<role>.toml` is TOML; a reader following this text writes an unparseable wrapper.
   - **Violated Rule:** `design.md` §5.3 (`sandbox_mode = "read-only"`); pinned subagents page uses assignment form; DD-8.
   - **Remediation:** `model =`, `model_reasoning_effort =`, `sandbox_mode = "read-only"`.
2. **Discovered Issue:** Adding a fourth host column made a preserved sentence false: "**T6 is the row that matters here:** it is the one tier where this column is the best of the three."
   - **Violated Rule:** `tasks.md` T5 Scope; Reviewer Stability & Integrity check. Not a DD-10 sweep pattern, so T6 would not catch it.
   - **Remediation:** "best of the four" near line 130.

ADVISORY (recorded, no rework): (Risk) "names no second flagship" overstates — page lists `gpt-5.5` "Previous-generation flagship" and `gpt-5.4` "Flagship model for professional work"; suggest "no second current-generation flagship". (Readability) *Enforced routing* intro still says "Both tools support a `model` field" with four rows — pre-existing; **forward pointer to T6's sweep** (not a DD-10 pattern).

