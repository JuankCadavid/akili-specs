# Proposal — Re-baseline the default Model Routing registry on cost-per-quota

**Recommendation:** replace the OpenCode Go column with DeepSeek models across all six tiers (V4 Pro for the reasoning tiers, V4.1 Flash / V4 Flash for the volume tiers, V4 Flash Vision Exp as the first real open-vision pick), move the Antigravity column to **Gemini 3.8 Flash** as the default family with the effort variant encoded per tier, and limit the Codex column to **Terra / Luna / Sol** (Astra dropped as a default — plan-gated). Rewrite the *Why these models* prose around one pinned metric: **requests per month included under OpenCode Go's per-model dollar limit** (Kimi K3: 110; DeepSeek V4.1 Flash: 26,000). One bounded spec, **patch** release (registry refresh — no new command, target, or behavior).

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/model-routing-cost-rebaseline` |
| Slug | `model-routing-cost-rebaseline` — derived from the free-text argument ("Re-baseline the default Model Routing registry … on cost-per-quota"); the full text is proposal context, not a directory name |
| Type | Change |
| Approval Mode | gated |
| Status | **Approved** (user, 2026-09-17) — Option A with A1 |
| Date | 2026-09-17 |
| Author | /akili-propose (session model Fable 5.1 — T1) |
| Depends on | none (independent of `changes/codex-install-target`, complete on `master` at `a7ec0e9`; this proposal consumes its T7 plan-gating finding) |
| Parallel-safe | yes |
| Release Classification | **patch** — `AGENTS.md` Release Rules: "patch for small docs/fixes"; the registry is documentation the constitution scaffolds, not a command or install target. Each release is already expected to "refresh the default registry in `docs/model-routing.md`" (AGENTS.md Model Routing rule) |
| Scope Chunking | Considered and rejected: one document family, one rationale, ~9 surfaces all edited to agree with each other; splitting per host would ship an internally inconsistent registry between chunks |
| Decisions at approval | (1) OpenCode Go per-model limit assumed **$60** ⇒ T2/T4 `deepseek-v4.1-flash` (26,000/mo), fallback `deepseek-v4-flash`. (2) Antigravity T3 = **Gemini 3.1 Pro (High)** (A1); Claude Sonnet 4.6 named as the preferred upgrade where the roster exposes it. (3) Codex T1/T3 default **Terra**, Sol named as the plan-permitting upgrade |
| Depth hint for `/akili-specify` | **Lite** — prose only, no code, no data; the risk is claim accuracy (pins), gated by `/akili-audit` Model Registry Drift and the KZ-001/KZ-002 lessons |

## Intent

Make the packaged default registry route AKILI phases to the models that give the most **quota per dollar** on each host, so a project scaffolded by `/akili-constitution` Step 8C starts on affordable defaults instead of the most expensive open model in the OpenCode Go catalogue, an Antigravity Pro model two generations behind the current Flash, and Codex families the maintainer's account cannot even select.

## Problem / Current Behavior

The registry (`docs/model-routing.md` → *Model registry*, "Registry updated: 2026-07") picks by headline capability with unpinned benchmark numbers in the prose (GPQA, SWE-bench, tok/s figures cited from memory — a KZ-001/KZ-002 exposure in its own right).

| Host | Current default | What the live data says (2026-09-17) |
|---|---|---|
| OpenCode Go T1 / T4-fallback | `opencode-go/kimi-k3` | **110 requests/month** within its $15 per-model limit — the most expensive model on the plan page. A Leader session alone can exhaust it in a day |
| OpenCode Go T2 | `opencode-go/glm-5.2` | 880 requests/month at the $60 limit |
| OpenCode Go T3 | `opencode-go/deepseek-v4-pro` | 1,050 at $15 — already DeepSeek; fine |
| OpenCode Go T4/T5 | `opencode-go/deepseek-v4-flash` | 13,000 at $30 — fine; `deepseek-v4.1-flash` ("Nuevo", "4× de uso") now gives **26,000** at $60 |
| OpenCode Go T6 | `opencode-go/qwen3.7-max` *(weak)* | 170 at $30, and the prose itself calls it weak; `deepseek-v4-flash-vision-exp` exists (6,500 at $15, vision) |
| Antigravity T1/T3/T4/T6 | Gemini Pro (latest) | `agy models` lists **Gemini 3.1 Pro** as the only Pro — two generations behind **Gemini 3.8 Flash**, which is the current top of the roster and ships as three effort IDs (`gemini-3.8-flash-high/-medium/-low`) |
| Codex T1/T3 · T2 | Astra · Sol | Both return "not supported when using Codex with a ChatGPT account" (live, codex-cli 0.154.0 — `changes/codex-install-target` T7); only Terra/Luna were usable |

**Evidence (pin at specify):** OpenCode Go plan page — "a low cost $10/month subscription" with **monthly dollar limits per model ($15 / $30 / $60)**; the per-model figure is the number of requests that limit buys. Slugs confirmed on <https://opencode.ai/docs/go> (fetched 2026-09-17): `opencode-go/deepseek-v4-pro`, `deepseek-v4-flash`, `deepseek-v4.1-flash`, `deepseek-v4-flash-vision-exp`, `glm-5.3-flash`, `qwen3.8-flash`, `mimo-v2.5`, `gpt-5.6-luna`, `kimi-k3`. The page states **no** context-window or vision-capability details — those must stay `<CONFIRM SLUG>`-qualified or be pinned elsewhere. Antigravity roster via `agy models` (2026-09-17): `gemini-3.8-flash-{high,medium,low}`, `gemini-3.7-flash-*`, `gemini-3.6-flash-*`, `gemini-3.1-pro-{high,low}`, `claude-sonnet-4-6`, `claude-opus-4-6-thinking`, `gpt-oss-120b-medium`.

## Proposed Outcome

After the change, `docs/model-routing.md` and everything that copies from it agree on:

| Tier | OpenCode Go (requests/month @ per-model limit) | Antigravity (family + effort ID) | Codex |
|---|---|---|---|
| T1 Architect | `opencode-go/deepseek-v4-pro` (1,050 @ $15) | Gemini 3.8 Flash (High) | Terra — Sol where the account plan allows |
| T2 Coder | `opencode-go/deepseek-v4.1-flash` (26,000 @ $60); fallback `deepseek-v4-flash` (13,000 @ $30) | Gemini 3.8 Flash (Medium) | Luna |
| T3 Auditor *(≠ T2)* | `opencode-go/deepseek-v4-pro` | **open question** — see Approach Options | Terra *(≠ Luna)*; Sol where allowed |
| T4 Context-Ingest | `opencode-go/deepseek-v4.1-flash` `<CONFIRM>` (context window not on the plan page) | Gemini 3.8 Flash (High) | Terra `<CONFIRM SLUG>` |
| T5 Fast-Cheap | `opencode-go/deepseek-v4-flash` | Gemini 3.8 Flash (Low) | Luna |
| T6 Multimodal | `opencode-go/deepseek-v4-flash-vision-exp` (6,500 @ $15; "Exp") | Gemini 3.8 Flash (High) `<CONFIRM ID>` vision | Terra `<CONFIRM SLUG>` — prefer cross-host dispatch |

The Claude Code column is untouched (aliases). Author ≠ auditor holds per column: OpenCode Pro ≠ Flash; Codex Terra ≠ Luna; Antigravity decided by the open question.

## Scope

| Surface | Edit |
|---|---|
| `docs/model-routing.md` → *Model registry* table | OpenCode, Antigravity, Codex, Fallback columns; "Registry updated" date |
| `docs/model-routing.md` → *Why these models* | OpenCode paragraph rewritten around requests-per-month @ per-model limit, every number pinned to the plan page; drop unpinned benchmark figures (GPQA, SWE-bench, tok/s, $/task) or pin them; Antigravity paragraph: Flash 3.8 as top, effort encoded in the ID, why Pro 3.1 is not the default; Codex paragraph: Terra/Luna defaults, Sol plan-permitting, Astra removed |
| `docs/model-routing.md` → *Frontier escalation*, *Cross-host dispatch*, *How to apply per tool* (OpenCode example names `kimi-k3` / `deepseek-v4-pro` / `glm-5.2`), *Enforced routing* OpenCode row example | consistency edits only |
| `.claude/commands/akili-constitution.md` Step 8C ("Gemini Pro / Gemini Flash" family wording) and Step 8E OpenCode default slugs (implementer `glm-5.2`, reviewer `deepseek-v4-pro`, leader `kimi-k3`, tester `deepseek-v4-flash`) | align with the new column; state that Antigravity IDs carry the effort variant |
| `docs/commands/akili-constitution.md` mirror | content parity |
| `CHANGELOG.md` Unreleased | one entry, patch, naming the old → new picks and the metric |
| `/akili-audit` Model Registry Drift | no code change; the packaged default is what it compares against |

## Non-Goals

- No installer or code change (`bin/akili.js`, `scripts/`).
- No edits to any project's scaffolded `## Model Routing` registry — projects re-run `/akili-constitution` Step 8C (its "flag stale entries" branch) to pick up the new default.
- No change to tier definitions, the effort dial, or the alias-first rule.
- No Claude Code column change.
- No new benchmark research: the only ranking metric introduced is the pinned plan-page quota.

## Affected Users, Systems, And Specs

| Who / what | Effect |
|---|---|
| OpenCode Go users | Default Leader/Reviewer move from Kimi K3 / GLM-5.2 to DeepSeek V4 Pro / V4.1 Flash — roughly 10× to 30× more requests per month at the same plan |
| Antigravity users | Default family becomes Gemini 3.8 Flash; `pro` stays available as the T3 option or by override |
| Codex users on ChatGPT accounts | Defaults become selectable (Terra/Luna) instead of failing with "not supported" |
| `/akili-constitution` Step 8C/8E | Scaffolds the new defaults; existing projects see them as "stale entries" on re-run |
| `/akili-audit` | Drift check compares against the new default — expect one wave of drift reports on existing projects (intended) |
| `changes/codex-install-target` (complete) | Its T7 plan-gating finding is the Codex evidence here; nothing reopened |

## Visual Reference

- Source: None
- Location: —
- Notes: documentation-only change; the three maintainer screenshots (OpenCode Go plan page ×2, a scaffolded registry "Updated: 2026-08") are evidence, not design. Their facts are transcribed in *Problem* above.

## Requirement Delta Preview

### ADDED Requirements

- The registry's selection metric is stated and pinned: **requests per month included under OpenCode Go's per-model dollar limit**, with the plan page URL and `Last verified` date next to every figure.
- Antigravity cells name the family **and** the effort variant (`Gemini 3.8 Flash (High)`), because the roster exposes effort as distinct IDs; Step 8C says how to confirm the ID with `agy models`.
- An open-vision default for OpenCode (`deepseek-v4-flash-vision-exp`) with its "Exp" status stated.

### MODIFIED Requirements

- OpenCode Go column: T1 `kimi-k3` → `deepseek-v4-pro`; T2 `glm-5.2` → `deepseek-v4.1-flash` (fallback `deepseek-v4-flash`); T4 `deepseek-v4-flash` → `deepseek-v4.1-flash`; T6 `qwen3.7-max` → `deepseek-v4-flash-vision-exp`; Fallback column re-derived.
- Antigravity column: Pro → Gemini 3.8 Flash (effort per tier); T3 per the chosen option.
- Codex column: Astra removed from defaults; T1/T3/T4/T6 Terra, T2/T5 Luna, Sol named as the plan-permitting upgrade.
- Step 8E default slugs (constitution) and the *How to apply* OpenCode example follow the table.
- *Why these models* prose: unpinned benchmark numbers removed or pinned.

### REMOVED Requirements

- Kimi K3 as an AKILI default anywhere (stays a documented alternative only if pinned).
- GLM-5.2 as the "default OpenCode workhorse".
- Qwen3.7 Max as T6.
- Astra as a Codex default.

## Approach Options

| # | Option | Trade-off |
|---|---|---|
| A | **Cost-first full re-baseline** (all three columns, prose rewritten around the pinned quota metric) — *recommended* | One coherent rationale, one pin set; largest doc diff (~80–120 lines across 4 files) but every line traceable to the plan page or `agy models` |
| B | Minimal swap: only Kimi K3 → DeepSeek V4 Pro in T1/T4-fallback | Smallest diff; leaves GLM-5.2 (880 @ $60), the weak Qwen T6, the stale Pro and the unselectable Astra in place — solves one line of the problem table |
| C | Two profiles ("budget" and "performance") in the registry | Doubles every cell, every pin and the Step 8C scaffold; `/akili-audit` drift would need a profile axis — over-engineering for a document the runbook already says to edit in place |

**Antigravity T3 sub-options (author ≠ auditor must hold):**

| # | T3 pick | Trade-off |
|---|---|---|
| A1 | `Gemini 3.1 Pro (High)` — the only non-Flash Gemini | Different weights ⇒ author ≠ auditor holds structurally; the maintainer's point stands that Pro is older, but the Auditor is low-volume and the older Pro is still a strong reviewer |
| A2 | `Claude Sonnet 4.6 (Thinking)` — present in the Antigravity roster | Cross-lab audit, the strongest independence; depends on the user's Antigravity plan exposing Claude models (confirm per project) |
| A3 | `Gemini 3.8 Flash (High)` with a documented exception (same model as T2 at a different effort) | Cheapest, but effort ≠ weights: author ≠ auditor is weakened to "same model, deeper thinking" — the registry would have to say so plainly |

## Recommended Approach

**Option A with A1 as the Antigravity default and A2 named as the preferred upgrade where the roster exposes it.** It is the smallest path that removes every line of the problem table at once, keeps author ≠ auditor structural on all four hosts, and replaces memory-cited benchmarks with one verifiable metric. A3 is recorded as rejected unless the user prefers to trade independence for cost.

## Risks, Dependencies, And Open Questions

| Item | Note |
|---|---|
| **Plan-limit tier assumption** | `deepseek-v4.1-flash` gives 26,000 requests only under the **$60** per-model limit; at $15/$30 the better pick may be `deepseek-v4-flash` (13,000 @ $30). The registry should name the assumption or list both |
| Single-vendor OpenCode column | All six OpenCode cells become DeepSeek; author ≠ auditor still holds (Pro ≠ Flash are different models). The Fallback column keeps a non-DeepSeek option (`glm-5.3-flash`, 6,320 @ $60; `mimo-v2.5`, 30,100 @ $60) for vendor outages |
| "Exp" vision model | `deepseek-v4-flash-vision-exp` is experimental; T6 keeps the cross-host dispatch note (Antigravity Flash 3.8 / Claude Sonnet) |
| Context windows unknown | The plan page states none; T4 cells carry `<CONFIRM>` unless pinned from the vendor page |
| Antigravity effort IDs | Three IDs per family; Step 8C must say the ID includes the effort and how the Effort dial maps onto it (High/Medium/Low vs the five-rung AKILI dial) |
| Existing projects | Every scaffolded registry becomes "stale" by design; `/akili-audit` will report drift until Step 8C is re-run — state this in the CHANGELOG |
| KZ-001 / KZ-002 | The current prose cites benchmark numbers with no pin; the rewrite must either pin each figure or drop it — an aggregate claim ("cheapest of the set") needs the grep that would falsify it (the plan page) |
| Open question 1 | Which per-model limit tier does the maintainer target as the registry's assumption: $15, $30, or $60? |
| Open question 2 | Antigravity T3: A1 (Pro 3.1), A2 (Claude Sonnet 4.6), or A3 (Flash High, documented exception)? |
| Open question 3 | Codex T1/T3 default: Terra (selectable everywhere) or Sol (better, plan-gated)? Proposal assumes Terra with Sol named as the upgrade |

## Success Criteria

- Every model cell in `docs/model-routing.md` is a slug or ID present on the pinned source (plan page for OpenCode; `agy models` output for Antigravity; Codex models page) with `Last verified: <date>`.
- T2 ≠ T3 in every column, stated in the table.
- Kimi K3, GLM-5.2 (as default), Qwen3.7 Max and Astra no longer appear as defaults anywhere in `docs/model-routing.md`, the constitution, or the mirror (`grep` is the falsifier).
- `/akili-constitution` Step 8C on a scratch project scaffolds a registry that `/akili-audit` Model Registry Drift reports as **in agreement** with the packaged default.
- CHANGELOG Unreleased entry present, classified patch.

## Next Step

```text
/akili-specify changes/model-routing-cost-rebaseline
```

Change track, **Lite** depth suggested (documentation-only; risk is claim accuracy). Answer the three open questions first — they change the table, not the approach.
