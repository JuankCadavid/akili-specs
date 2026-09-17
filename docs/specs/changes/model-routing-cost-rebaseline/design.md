# Design: Re-baseline the default Model Routing registry on cost-per-quota

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/model-routing-cost-rebaseline` |
| Depth | Lite |
| Type | Change |
| Approval Mode | `gated` |
| Status | Approved (user, 2026-09-17) — Step 2.3 challenge integrated; judgment-day not run |
| Date | 2026-09-17 |
| Source | `requirements.md` (FR-1..FR-5, NFR-1..5) |
| Architecture significance | None — documentation data; no module, flow, or topology. `software-architect` not loaded |
| Format precedent | `docs/specs/changes/codex-install-target/design.md` |

## 2. Executive Summary

One data edit and one prose rewrite, propagated to the two places that copy it. The tier table becomes the table in §5.1; the *Why these models* prose is rebuilt around a single pinned metric (requests per month under OpenCode Go's per-model limit) and loses every unpinned number; the constitution's Step 8E default slugs and Step 8C family wording follow; the mirror follows at content parity; the CHANGELOG names old → new and warns about intended drift. Nothing executable changes.

## 3. Architecture Overview (document flow)

```
opencode.ai/docs/go  ──pin──┐
agy models (roster)  ──pin──┼─→  docs/model-routing.md §Model registry  (single editable source)
learn.chatgpt.com/docs/models ┘            │
                                           ├─→ /akili-constitution Step 8C  (copies table into project AGENTS.md/CLAUDE.md)
                                           ├─→ /akili-constitution Step 8E  (default wrapper slugs)
                                           ├─→ docs/commands/akili-constitution.md  (condensed mirror)
                                           └─→ /akili-audit Model Registry Drift  (compares project copy vs default)
```

## 4. Extended Directory Structure

No new files. Edited: `docs/model-routing.md`, `.claude/commands/akili-constitution.md`, `docs/commands/akili-constitution.md`, `CHANGELOG.md`.

## 5. Data Model

### 5.1 The new registry table (target state)

| Tier | Claude Code | OpenCode Go (req/mo @ $60 limit unless noted) | Antigravity (family · effort ID) | Codex | Fallback |
|---|---|---|---|---|---|
| T1 Architect | `opus` | `opencode-go/deepseek-v4-pro` (1,050 @ $15) | Gemini 3.8 Flash (High) — `gemini-3.8-flash-high` | Terra; Sol where the plan allows | `opencode-go/glm-5.3` / `sonnet` |
| T2 Coder | `sonnet` | `opencode-go/deepseek-v4.1-flash` (26,000) | Gemini 3.8 Flash (Medium) — `gemini-3.8-flash-medium` | Luna | `opencode-go/deepseek-v4-flash` (13,000 @ $30) / `opencode-go/glm-5.3-flash` (6,320) / `haiku` |
| T3 Auditor *(≠ T2)* | `opus` | `opencode-go/deepseek-v4-pro` *(≠ T2)* | Gemini 3.1 Pro (High) — `gemini-3.1-pro-high` *(≠ T2 family)* | Terra *(≠ Luna)*; Sol where the plan allows | `claude-sonnet-4-6` on Antigravity where exposed / `sonnet` |
| T4 Context-Ingest | `sonnet` | `opencode-go/deepseek-v4.1-flash` `<CONFIRM>` context window | Gemini 3.8 Flash (High) | Terra `<CONFIRM SLUG>` | `opencode-go/mimo-v2.5` (30,100) / `opus` |
| T5 Fast-Cheap | `haiku` | `opencode-go/deepseek-v4-flash` (13,000 @ $30) | Gemini 3.8 Flash (Low) — `gemini-3.8-flash-low` | Luna | `opencode-go/qwen3.8-flash` (5,400 @ $30) / `sonnet` |
| T6 Multimodal | `sonnet` | `opencode-go/deepseek-v4-flash-vision-exp` (6,500 @ $15; **Exp**) | Gemini 3.8 Flash (High) `<CONFIRM ID>` vision | Terra `<CONFIRM SLUG>` — prefer cross-host dispatch | `opus` |

Pins: OpenCode figures ← plan page <https://opencode.ai/docs/go> (`Last verified: <edit date>`); Antigravity IDs ← `agy models` (`Last verified: <edit date>`); Codex families ← <https://learn.chatgpt.com/docs/models> (existing pin) + the T7 plan-gating paragraph (existing). "Registry updated" → edit date.

### 5.2 Effort dial → Antigravity effort ID

| AKILI dial | Antigravity ID suffix |
|---|---|
| `low` | `-low` |
| `medium` | `-medium` |
| `high`, `xhigh`, `max` | `-high` (the roster exposes three rungs; the top three collapse) |

Stated once in *Effort dial* and referenced from Step 8C.

### 5.3 *Why these models* — target structure

1. Claude Code paragraph — **unchanged**. *Rate limits are per-generation* — **unchanged**.
2. **OpenCode Go** — opens with the metric and the $60 assumption; one bullet per tier naming slug + requests/month; one sentence for the $30 alternative (`deepseek-v4-flash` for T2/T4); one sentence on the single-vendor column and why the Fallback column keeps `glm-5.3`, `glm-5.3-flash`, `mimo-v2.5`, `qwen3.8-flash`; T6 "Exp" caveat + cross-host note. No benchmark figures.
3. **Antigravity** — roster generation as the basis (3.8 Flash current; 3.1 Pro two generations back), effort-in-ID rule, T3 = Pro for different weights, Claude Sonnet 4.6 (Thinking) as the preferred T3 upgrade where exposed, `<CONFIRM ID>` vision on T6.
4. **Codex** — existing paragraph trimmed: Terra/Luna defaults, Sol upgrade, Astra removed from defaults; plan-gating paragraph kept as is.

## 6. Reversion Challenge (Step 2.3)

Reversions in this design (removing or replacing something already shipped): R1 Kimi K3 leaves T1/T4-fallback; R2 GLM-5.2 leaves T2 ("default OpenCode workhorse"); R3 Qwen3.7 Max leaves T6; R4 Gemini Pro leaves Antigravity T1/T4/T6; R5 Astra leaves Codex defaults; R6 benchmark figures leave the prose; R7 Step 8E default slugs change. Challenge outcome: **see §6.1 (filled after the one-question review).**

### 6.1 Outcomes (one-question challenge, `sonnet`, 2026-09-17)

| R | What removing it breaks | Design response |
|---|---|---|
| R1 Kimi K3 leaves T1 | Nothing structural; the "slowest of the pack / Agent Swarm" rationale dies with its bullet. **But** the *Replacing a model* runbook's example "e.g. Kimi K3 → T1" goes stale (promoted model no longer in the table) | Surface row 9: rewrite the runbook example to a model in the new table |
| R2 GLM-5.2 leaves T2 | The parenthetical "(bumped 5.1 → 5.2 as a worked example of the runbook)" is the runbook's **only** concrete-slug worked example (the Opus example covers the alias "do nothing" case) | Surface row 10: keep the worked example as history ("GLM 5.1 → 5.2 was the prior worked example; this re-baseline is the current one") so the runbook keeps a concrete-slug case |
| R3 Qwen3.7 Max → `deepseek-v4-flash-vision-exp` | **Contradiction:** the same doc excludes `gpt-5.3-codex-spark` because "a research preview is not a routing default" | **DD-8** (below): distinguish a plan-listed experimental model with a published quota from an unlisted research preview; state the distinction in the T6 bullet, keep the cross-host note as the recommended path for real UI/UX work |
| R4 Gemini Pro leaves Antigravity T1/T4/T6 | Two sentences become false: "prefer Cross-host dispatch to … Antigravity (Gemini Pro, vision)" and "T6 is the row that matters here: … the best of the four" | Surface row 11: rewrite both — cross-host names Gemini 3.8 Flash (High) `<CONFIRM ID>` vision; the "best of the four" claim is dropped (Pro → Flash is a generation change for vision that nobody has verified) and replaced by "confirm per project" |
| R5 Astra leaves Codex defaults | Two silently stale sentences: "Astra → T1 Architect and T3 Auditor" and the plan-gating clause "rather than the registry's default Astra/Sol pair" | Surface row 12: both rewritten (Terra/Luna default pair; Sol/Astra as plan-permitting upgrades) |
| R6 Benchmark figures leave the prose | Single-use figures; nothing else cites them. **Scope guard:** the *Effort dial* section's GPT-5.6 Sol table is pinned separately and is **not** in R6's sweep | FR-4 scope limited to *Why these models*; noted in tasks |
| R7 Step 8E default slugs change | Nothing for existing projects (already-written files). Leader and Reviewer defaults become the same slug (`deepseek-v4-pro`) — not a guarantee break (author ≠ auditor is Implementer vs Reviewer) but reads oddly | Surface row 6 gains one clarifying clause ("Leader and Reviewer share the T1/T3 model; the Implementer differs") |

Verdict: R3 and R4 required design changes (DD-8, row 11); R1, R2, R5 required surface rows; R6, R7 needed no design change.

## 7. Surface Table

| # | File | Edit |
|---|---|---|
| 1 | `docs/model-routing.md` → *Model registry* | Replace the table with §5.1; "Registry updated: 2026-09"; add the $60-limit sentence and pins under the table |
| 2 | `docs/model-routing.md` → *Why these models* | Rewrite per §5.3 |
| 3 | `docs/model-routing.md` → *Effort dial* | Add §5.2 (three lines) |
| 4 | `docs/model-routing.md` → *Enforced routing*, *How to apply per tool*, *Cross-host dispatch*, *Frontier escalation* | Replace example slugs (`kimi-k3`, `glm-5.2`, `deepseek-v4-pro` as reviewer stays) with the new ones; no structural change |
| 5 | `.claude/commands/akili-constitution.md` Step 8C | Family wording "Gemini Pro / Gemini Flash" → "Gemini 3.8 Flash (effort in the ID) / Gemini 3.1 Pro"; "confirm with `agy models`" |
| 6 | `.claude/commands/akili-constitution.md` Step 8E | Default OpenCode slugs: leader/reviewer `deepseek-v4-pro`, implementer `deepseek-v4.1-flash`, tester `deepseek-v4-flash` |
| 7 | `docs/commands/akili-constitution.md` | Content parity with 5–6 |
| 8 | `CHANGELOG.md` Unreleased → Changed | One entry: metric, old → new per host, patch, intended drift on existing projects |
| 9 | `docs/model-routing.md` → *Replacing a model* runbook example | "e.g. Kimi K3 → T1" → an example from the new table (R1) |
| 10 | `docs/model-routing.md` → *Why these models* worked-example parenthetical | Keep as history: GLM 5.1 → 5.2 was the prior worked example, this re-baseline the current one (R2) |
| 11 | `docs/model-routing.md` → *Why these models* T6 sentences + *Cross-host dispatch* vision line | "prefer … Antigravity (Gemini Pro, vision)" → Gemini 3.8 Flash (High) `<CONFIRM ID>` vision; drop "best of the four", say "confirm per project" (R4) |
| 12 | `docs/model-routing.md` → Codex paragraph + plan-gating clause | "Astra → T1/T3" and "the registry's default Astra/Sol pair" → Terra/Luna default pair, Sol/Astra as plan-permitting upgrades (R5) |

## 8. Design Decisions

- **DD-1 — One selection metric, pinned.** Requests per month under the per-model limit, from the plan page. Rejected: mixing benchmark scores from memory (unpinned; the KZ-001/KZ-002 exposure in the current text) and vendor pricing pages (a different unit than the plan users actually buy).
- **DD-2 — Single-vendor OpenCode column with a non-DeepSeek Fallback.** Pro ≠ Flash keeps author ≠ auditor structurally; the Fallback column keeps `glm-5.3`, `glm-5.3-flash`, `mimo-v2.5`, `qwen3.8-flash` so a DeepSeek outage has an escape. Rejected: spreading defaults across vendors "for diversity" at 5–20× the per-request cost.
- **DD-3 — Antigravity effort lives in the ID.** The roster exposes `-high/-medium/-low`; naming the family + effort per tier is the alias-first rule applied to what the host actually exposes. §5.2 collapses the top three AKILI rungs onto `-high`.
- **DD-4 — Antigravity T3 = Gemini 3.1 Pro (High) (proposal A1).** Different weights than the Flash coder; low-volume role tolerates the older generation. Rejected A3 (Flash High: same model, weaker independence); A2 (Claude Sonnet 4.6) named as the preferred upgrade where the plan exposes it, not the default (plan-dependent).
- **DD-5 — Codex default Terra, Sol as upgrade, Astra removed.** Selectable on ChatGPT accounts (T7 evidence); Sol/Astra are plan-gated. Rejected: Sol default (fails with "not supported" until changed).
- **DD-6 — Unpinned benchmarks removed, not re-sourced.** Re-sourcing seven figures across four vendors is research this spec does not budget; the metric in DD-1 replaces them. Any future benchmark claim needs its own pin.
- **DD-8 — "Exp" on the plan ≠ "research preview" off it.** `deepseek-v4-flash-vision-exp` is listed on the plan page with a published quota (6,500 @ $15) and a config slug; `gpt-5.3-codex-spark` was excluded because it is a research preview with no routing standing. The T6 bullet states this distinction explicitly and keeps cross-host dispatch (Antigravity Gemini 3.8 Flash `<CONFIRM ID>`, Claude `sonnet`) as the recommended path for real UI/UX work. Rejected: leaving T6 on `qwen3.7-max` (170 requests @ $30, self-described weak) or leaving the cell empty (an empty default cell is the drift audit's failure mode).
- **DD-7 — Patch release.** Registry refresh is documentation the release process already expects; no command, target, or behavior changes.

## 9. Budget (Step 2.4 — tripwire for `/akili-execute`)

| Metric | Expected |
|---|---|
| Tasks | **2** (registry + prose; constitution + mirror + CHANGELOG) |
| Changed lines | **~160** (model-routing ~110 incl. rows 9–12; constitution ~15; mirror ~10; CHANGELOG ~15; effort-dial ~5) |
| Review rounds | **1 per task**, plus one reserved for pin precision (three of the previous spec's FAILs were pin wording) |

Depth check: Lite matches (2 tasks, prose only). Not Standard: no code, no scenarios beyond claim accuracy.
