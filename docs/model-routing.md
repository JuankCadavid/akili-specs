# Capability-Tier Model Routing

AKILI is model-agnostic: no command, skill, or persona hardcodes a model. This document is the
**human-facing guidance** for choosing which model runs which AKILI-SPECS phase, so each phase runs on a
model matched to its dominant computational demand rather than one model doing everything.

Routing operates at two levels:

- **Enforced (subagents):** `/akili-constitution` Step 8E can bind the Implementer / Reviewer /
  Tester / Leader personas to models via **tool-native agent definitions** (see
  [Enforced routing](#enforced-routing-tool-native-agent-bindings)). This is where most tokens are
  spent and where author ≠ auditor becomes structural instead of aspirational.
- **Guided (main loop):** the session model can only be switched by you (Claude Code `/model`,
  OpenCode model selector). Commands emit a one-line **model checkpoint** when the phase's tier
  points to a different model than the current session, so the switch happens at the right moment.

Nothing here is injected into command frontmatter or the installer — see
[Cross-Tool Safety](#cross-tool-safety).

## Philosophy: criteria first, model second

Each AKILI-SPECS phase declares **what it needs** (deep reasoning, coding throughput, independent
judgment, large context, speed/cost, or vision) before anyone picks a model. The model is derived
from the need, not the reverse. The registry lists a principal model plus a fallback per tier.

### Guiding principles

- **Match the dominant demand.** Route by the single most important demand of the phase, not by
  "use the smartest model everywhere."
- **ARCHITECT = BUILDER.** The model family that reasons about the design should also implement it
  (`/akili-propose` and the `/akili-execute` Implementer share the workhorse family). Less information
  is lost between design and code.
- **author ≠ auditor.** The Reviewer / validator MUST run on a **different model** than the
  Implementer. An independent auditor catches what the author rationalized away.
- **Reserve deep-reasoning for propose, specify, verify & orchestrate.** The most expensive reasoning
  models earn their cost on architecture (`/akili-propose`), the spec artifacts including **task
  decomposition** (`/akili-specify` → requirements / design / `tasks.md`), final audit
  (`/akili-validate`, Reviewer), and **live orchestration** (the `/akili-execute` / `/akili-test`
  Leader — skill selection, FAIL adjudication, pivot) — not on bookkeeping. The Leader and the task
  decomposer qualify because they *decide* (how to break the work down, who does what), even though
  they write no production code; both are low-volume, so the deep model there is cheap insurance.
- **Fast & cheap for formatting & archive.** Summarizing closed work (`/akili-archive`) and pure
  setup/formatting steps are format-following jobs — speed and cost dominate; raw intelligence adds
  little. **Note:** partitioning a spec into `tasks.md` is *not* one of these — it is decomposition
  judgment (T1), not formatting.

## Capability tiers

Six tiers cover the genuinely distinct demands across the AKILI-SPECS pipeline without proliferating one
tier per phase (which would defeat the abstraction and churn on every model release).

| Tier | Definition |
|---|---|
| **T1 Architect** | Deep reasoning for architecture, trade-offs, and intent — "think hard before code." Also covers **live orchestration judgment**: task decomposition in flight, runtime skill selection for each worker, Reviewer-FAIL adjudication, result synthesis, and escalation/pivot calls. |
| **T2 Coder** | Maximum coding throughput and instruction-following for writing and editing code and tests. |
| **T3 Auditor** | Independent critical review — conformance, bug-finding, drift; must differ from the author model. |
| **T4 Context-Ingest** | Large-context absorption of legacy codebases and baseline docs — window size over depth. |
| **T5 Fast-Cheap** | Cheap, fast structured formatting and summarization where reasoning depth is not the bottleneck. |
| **T6 Multimodal** | Visual / UI-UX design reasoning over images, screenshots, and design references. |

## Phase → tier mapping

The `/akili-execute` triad is split because each role has a different demand — and because
author ≠ auditor makes the Implementer/Reviewer split a **correctness constraint**, not a
preference. The **Leader runs on the deep-reasoning tier (T1), not a cheap one**: it writes no code,
but it makes the highest-leverage calls in the run — how to decompose, **which skill each Implementer
loads**, whether a Reviewer FAIL means rework or escalation, and when to pivot. Those are low-volume,
high-leverage decisions (the master builder directing the site, choosing each worker's tool), so a
frontier model there is cheap insurance, not waste — a weak orchestrator with strong workers
poisons the whole run. `/akili-test` is split the same way: a T1 Leader orchestrates and selects
each Tester's skills while T2 Testers author the suites, and a Tester ideally runs on a different
model than the Implementer (author ≠ tester).

| Phase / Role | Tier(s) | Why |
|---|---|---|
| `/akili-constitution` | T4 + T1 | Ingest legacy code (long context), then reason to synthesize the baseline. |
| `/akili-propose` | T1 | Architecture and trade-offs — reserve the deep reasoner. |
| `/akili-quick` | T2 | A small, direct edit + light verification — no deep reasoning needed. |
| `/akili-specify` → requirements.md / design.md | T1 | Heavy reasoning + technical writing. |
| `/akili-specify` → tasks.md | T1 | **Task decomposition is where the design becomes executable** — bad boundaries, missing dependencies, or a vague scope poison every downstream Implementer (the master builder's blueprint: if the plan is wrong, no worker saves it). Reasoning, not formatting. |
| `/akili-specify` → UX/UI design | T6 | Only when visual design is in scope. |
| `/akili-execute` → **Leader** | T1 | Orchestration judgment — decomposition in flight, **runtime skill selection for each Implementer**, FAIL adjudication, synthesis, pivot. Writes no code, but this is reasoning, not dispatch. |
| `/akili-execute` → **Implementer** | T2 | Maximum coding. Shares the workhorse family with propose (ARCHITECT = BUILDER). |
| `/akili-execute` → **Reviewer** | T3 | Independent audit. **MUST resolve to a different model than the Implementer.** |
| `/akili-test` → **Leader** | T1 | Orchestration judgment — partitions suites, **selects each Tester's skills**, adjudicates results; writes no tests. |
| `/akili-test` → **Tester(s)** | T2 | Test authoring + verification per suite. Prefer a different model than the Implementer (author ≠ tester). |
| `/akili-validate` | T3 | Deep conformance audit. |
| `/akili-audit` | T4 + T3 | Drift detection over large context, judged critically. |
| `/akili-archive` | T5 | Cheap, fast summarization of closed work. (Kaizen Learn sub-step: T3 optional.) |
| `/akili-resume` | T5 | File scanning + dashboard summarization — reasoning depth is not the bottleneck. |
| `/akili-seo` | T3 + T5 | Audit findings (T3) plus setup/formatting steps (T5). |

**author ≠ auditor enforcement.** In the registry, T2 (Coder) and T3 (Auditor) must resolve to
**different concrete models**. If they ever collapse to the same model, escalate the Reviewer one
tier (to the deeper reasoner) to preserve independence.

## Model registry

This is the single editable source of truth. Phases reference **tiers**; only this table names
models. When models change, edit only this table. *Registry updated: 2026-09.*

> **Worked example — the Opus 5 release required zero edits to this table.** When Anthropic shipped
> Claude Opus 5, the `opus` alias moved to it on its own; T1/T3 followed automatically. That is the
> alias-first rule paying off (first row of the *Replacing a model* runbook: **do nothing**). What
> a new generation *does* require is re-reading the **Effort dial** and the behavioural notes below
> — the tier mapping survives model churn, but the per-task effort defaults and the prompt-level
> guardrails do not.

**Alias-first rule: never pin a dated model name where a floating alias exists.** Claude Code's
`opus` / `sonnet` / `haiku` aliases always resolve to the latest version of each family — when
Anthropic ships a new generation, an alias-based registry needs **zero edits**. Pin a dated ID only
when you deliberately need to freeze a version, and record why next to the pin. OpenCode slugs are
concrete (no alias mechanism), which is why they carry the Fallback column and the drift check
below.

| Tier | Claude Code | OpenCode Go (requests/month @ that model's own limit — plan page monthly column) | Antigravity (family · effort ID) | Codex | Fallback |
|---|---|---|---|---|---|
| **T1 Architect** | `opus` *(alias — always latest)* | `opencode-go/deepseek-v4-pro` (5,200 @ $15) | Gemini 3.8 Flash (High) — `gemini-3.8-flash-high` | Terra; Sol where the plan allows | `opencode-go/glm-5.3` / `sonnet` |
| **T2 Coder** | `sonnet` | `opencode-go/deepseek-v4.1-flash` (32,500 @ $15; 4x promo → 130,000 @ $60 through 2026-09-20) | Gemini 3.8 Flash (Medium) — `gemini-3.8-flash-medium` | Luna | `opencode-go/deepseek-v4-flash` (65,000 @ $30) / `opencode-go/glm-5.3-flash` (31,580 @ $60) / `haiku` |
| **T3 Auditor** *(≠ T2)* | `opus` *(must differ from T2)* | `opencode-go/deepseek-v4-pro` (5,200 @ $15) *(≠ T2)* | Gemini 3.1 Pro (High) — `gemini-3.1-pro-high` *(≠ T2 family)* | Terra *(≠ Luna)*; Sol where the plan allows | `claude-sonnet-4-6` on Antigravity where exposed / `sonnet` |
| **T4 Context-Ingest** | `sonnet` (long context) | `opencode-go/deepseek-v4.1-flash` `<CONFIRM>` context window (32,500 @ $15) | Gemini 3.8 Flash (High) | Terra `<CONFIRM SLUG>` | `opencode-go/mimo-v2.5` (150,400 @ $60) / `opus` |
| **T5 Fast-Cheap** | `haiku` | `opencode-go/deepseek-v4-flash` (65,000 @ $30) | Gemini 3.8 Flash (Low) — `gemini-3.8-flash-low` | Luna | `opencode-go/qwen3.8-flash` (27,000 @ $30) / `sonnet` |
| **T6 Multimodal** | `sonnet` (vision) | `opencode-go/deepseek-v4-flash-vision-exp` (32,500 @ $15; **Exp**) | Gemini 3.8 Flash (High) `<CONFIRM ID>` vision | Terra `<CONFIRM SLUG>` — prefer cross-host dispatch | `opus` |

**Each OpenCode cell carries its own per-model monthly dollar limit and its own requests-per-month
figure** — the plan page sets the limit per model, not per plan, so there is no single cap to
assume. `opencode-go/deepseek-v4-flash` is T2's higher-volume alternative: 65,000 requests/month at
its $30 limit against `deepseek-v4.1-flash`'s 32,500 at $15. **Pins:** OpenCode figures ← plan page
<https://opencode.ai/docs/go>
(**Last verified: 2026-09-17**); Antigravity IDs ← `agy models` (**Last verified: 2026-09-17**);
Codex families ← <https://learn.chatgpt.com/docs/models> (existing pin, **Last verified:
2026-09-16**) + the T7 plan-gating paragraph below (existing).

**The figures above are the plan page's *requests-per-month* column, re-read on 2026-09-17 — not
the *requests-per-5-hour* column.** The two are easy to conflate (same table, adjacent columns) and
differ by roughly 5×, so a monthly figure sourced from a screenshot of only the 5-hour column would
understate every quota. `deepseek-v4.1-flash` additionally carries a temporary 4x promotional
multiplier on the page (`$15` → `$60`, ending **2026-09-20**); the cell above pins the durable $15
baseline and notes the expiring promo separately rather than defaulting to it.

**The Antigravity column names concrete effort-IDs, confirmed against the live roster.** Its picker
moves faster than this document, so every ID above is re-read from `agy models` rather than assumed
from a UI label — the same treatment any concrete, alias-free identifier gets under the alias-first
rule above. Confirm the family + effort mapping at `/akili-constitution` Step 8C with the same
command. T6's vision path carries `<CONFIRM ID>` because the roster does not label a model
vision-specific — see *Cross-host dispatch* for confirming the vision path per project rather than
assuming this column is automatically the strongest for it.

**The Codex column also names families, not slugs — same rule, a different reason.** Codex ships
versioned model names (`gpt-6-astra`, `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna`) rather than a
floating alias like `opus`, so pinning today's dated slug here would drift the day a new generation
ships. The table instead names the tier family — **Astra**, **Sol**, **Terra**, **Luna**, in
descending capability/cost order per the pinned page — and defers the exact dated slug to the
project's own `/model` roster, confirmed at `/akili-constitution` Step 8C exactly like the
Antigravity roster. **Last verified: 2026-09-16** against <https://learn.chatgpt.com/docs/models>.
Two cells (T4, T6) carry `<CONFIRM SLUG>` because that page states no context-window or
vision/multimodal capability for any Codex model — not because a name is missing from the roster.
T7 of the Codex install spec's live validation gathered no context-window or vision-capability
evidence for any Codex model either, so both `<CONFIRM SLUG>` cells stay as placeholders.

**Plan gating, confirmed live 2026-09-17 (codex-cli 0.154.0, ChatGPT-account login):** only
`gpt-5.6-terra` and `gpt-5.6-luna` were accepted; `gpt-6-astra` and `gpt-5.6-sol` both returned "The
'\<model\>' model is not supported when using Codex with a ChatGPT account." The registry's
defaults — Terra for T1/T3/T4/T6, Luna for T2/T5 — are exactly the pair such an account can select;
**Sol as the T1/T3 upgrade is plan-gated**, so confirm the account's own `/model` roster at
`/akili-constitution` Step 8C before writing a Sol wrapper slug. Author ≠ auditor holds on such
accounts with the default pairing itself — Reviewer `gpt-5.6-terra` ≠ Implementer `gpt-5.6-luna` —
with no upgrade required.

### Why these models

**Claude Code.** The top-family alias (`opus`) carries the tightest plan rate limits, so it is
**reserved for T1 (propose, specify reasoning, and the `/akili-execute` / `/akili-test` Leader) and
T3 (validate, review)** — the phases that most reward deep reasoning. The Leader sits here despite
writing no code: it *delegates*, so its opus token volume is small, but its calls (skill selection,
FAIL adjudication, pivot) gate the whole run — low volume, high leverage. **`sonnet` is the
workhorse** for coding (T2), large-context ingestion (T4), and vision (T6). **`haiku`** handles
fast/cheap formatting and summarization (T5) — `/akili-archive` and pure setup steps, **not** the
live orchestrator and **not** task decomposition. This concentrates the scarce top-tier budget on
architecture, task decomposition, orchestration judgment, and audit — the low-volume, high-leverage
decisions — while the high-volume execution (Implementers, Testers) stays on the `sonnet` workhorse. Because these are aliases, the mapping survives model generations
unchanged (e.g. when the top family moves from one generation to the next, `opus` follows it).
Users on plans that expose a frontier model above Opus (Fable 5 / Mythos 5) can pin it for T1/T3 —
see **Frontier escalation tier** below.

**Rate limits are per-generation, not per-family.** A new Opus generation draws on its **own**
quota rather than inheriting the previous generation's pool — Opus 5, for instance, does not share
the combined Opus 4.x bucket. So moving T1/T3 onto a newer Opus neither frees headroom on the old
pool nor inherits it: check the new generation's limits before shifting volume onto it. The
"reserve the top tier for T1/T3" rule holds regardless — it is about *where the budget earns its
cost*, not about which pool the budget comes from.

**OpenCode Go.** The strongest open models anchor the highest-leverage tiers:

The single published metric this registry re-baselines on is **requests per month at each model's
own dollar limit** (**Last verified: 2026-09-17**, <https://opencode.ai/docs/go>); no benchmark
score enters the pick. `deepseek-v4-flash` is the
higher-volume alternative to T2's `deepseek-v4.1-flash`: 65,000 requests/month at its $30 limit
against 32,500 at $15.

- **DeepSeek V4 Pro → T1 Architect, T3 Auditor.** 5,200 requests/month at the $15 limit — the same
  model anchors both tiers; author ≠ auditor holds by role (Implementer vs. Reviewer), not by a
  second OpenCode family, matching the Codex paragraph below.
- **DeepSeek V4.1 Flash → T2 Coder, T4 Context-Ingest.** 32,500 requests/month at the $15 limit.
  The page currently runs a temporary 4x promotion to the $60 limit (130,000 requests/month) that
  ends **2026-09-20**; pin the durable $15 figure, not the expiring one. `<CONFIRM>` on T4's context
  window — the page states no figure for it.
- **DeepSeek V4 Flash → T5 Fast-Cheap.** 65,000 requests/month at the $30 limit — also T2's
  higher-volume alternative, named above.
- **DeepSeek V4 Flash Vision Exp → T6 Multimodal (Exp).** 32,500 requests/month at the $15 limit.
  "Exp" here names a **plan-listed model with a published quota and config slug** — a different
  standing than an unlisted research preview (see `gpt-5.3-codex-spark` in the Codex paragraph
  below); still, for real UI/UX design work prefer *Cross-host dispatch* to Claude Code (`sonnet`,
  vision) or Antigravity (Gemini 3.8 Flash (High) `<CONFIRM ID>`, vision).
- **Single-vendor column, non-DeepSeek Fallback.** Every default above is DeepSeek — DD-2: Pro ≠
  Flash already keeps author ≠ auditor structural, at a fraction of the per-request cost of
  spreading defaults across vendors "for diversity." The Fallback column keeps `opencode-go/glm-5.3`
  (1,080/mo @ $15), `opencode-go/glm-5.3-flash` (31,580/mo @ $60), `opencode-go/mimo-v2.5`
  (150,400/mo @ $60), and `opencode-go/qwen3.8-flash` (27,000/mo @ $30) so a DeepSeek outage has a
  non-DeepSeek escape.

*(GLM 5.1 → 5.2 was the prior worked example for the* Replacing a model *runbook below; this
re-baseline is the current one.)*

All OpenCode Go slugs and figures are re-read from the
[OpenCode Go model list](https://opencode.ai/docs/go) (**Last verified: 2026-09-17**). Confirm them
against your own OpenCode configuration and adjust if your roster differs.

**Antigravity.** The roster (`agy models`, **Last verified: 2026-09-17**) currently tops out at
**Gemini 3.8 Flash** — the family this table routes to T1, T2, T4, T5, and T6, with the effort rung
carried in the ID itself (`gemini-3.8-flash-high` / `-medium` / `-low`; see *Effort dial* below for
the AKILI-rung mapping) rather than as a separate dial, since that is what the host actually
exposes. **T3 Auditor uses Gemini 3.1 Pro (High)** (`gemini-3.1-pro-high`) instead — a different
family from the T2 Flash coder — the only Pro generation the roster exposes, against a current 3.8
Flash; that roster-generation gap, not a benchmark ranking, is the whole basis for keeping Pro off the default
column even though it satisfies author ≠ auditor. Where a plan exposes it, prefer **Claude Sonnet
4.6 (Thinking)** (`claude-sonnet-4-6`, confirmed in the same roster) as the T3 upgrade over Pro 3.1.
T6's vision path carries `<CONFIRM ID>` because the roster does not label a model vision-specific;
confirm the exact ID per project.

**Codex.** The split stays inside one vendor's roster rather than crossing labs, so it leans on the
pinned page's own capability language. **Terra → T1 Architect, T3 Auditor, T4 Context-Ingest, T6
Multimodal** (T4/T6 `<CONFIRM SLUG>`): the page describes it as "balanced … everyday work," and it
is one of the two models selectable on a ChatGPT-account plan (see the plan-gating paragraph
above) — `<CONFIRM SLUG>` on T4/T6 because the page states no context-window or vision/multimodal
figure for any Codex model. **Sol** is named as the **plan-permitting upgrade** for T1/T3 — the
page's "most capable GPT-5.6 model for complex coding, computer use, research, and cybersecurity" —
where the account plan allows it; **Astra is removed from the defaults** entirely (plan-gated, per
above). **Luna → T2 Coder, T5 Fast-Cheap**: stated plainly as "fast and affordable." Author ≠
auditor holds here by *role* (Terra ≠ Luna), not by a second top-tier family — the pinned page names
no second current-generation flagship the way a cross-lab pin would — so if that ever reads as too
thin, escalate the Reviewer's `model_reasoning_effort` (see *Enforced routing*) rather than leaving
T2 = T3. **T6 Multimodal defaults to Terra, `<CONFIRM SLUG>`**: the pinned page names no
vision/multimodal capability for any Codex model, so prefer *Cross-host dispatch* to Claude Code
(`sonnet`, vision) or Antigravity (Gemini 3.8 Flash (High) `<CONFIRM ID>`, vision) for real UI/UX
design work — confirm the exact vision path per project rather than assuming one column is
strongest. The page also lists a fifth model, `gpt-5.3-codex-spark` — a text-only research preview
"optimized for near-instant, real-time coding iteration" — left out of the tier table because a
research preview is not a routing default, though it is worth trying by hand for a fast Implementer
loop once it stabilizes.

### Frontier escalation tier (opt-in — pin, not alias)

A frontier model *above* Opus — Claude **Fable 5** (`claude-fable-5`), or **Mythos 5**
(`claude-mythos-5`) on Project Glasswing — can be pinned for the highest-leverage slots as an
**opt-in ceiling for genuinely hard specs**. It is **never a default** and **never in T2** (the
high-volume fan-out): at ~2× Opus pricing (**$10 / $50** per 1M in/out vs `opus` at $5 / $25), it
only earns its cost where token volume is low and the decision gates the whole run — T1 (Architect +
the execute/test Leader) and T3 (Auditor).

**Each Opus generation raises the bar for escalating.** Opus 5 closed much of the gap on exactly the
work this tier existed for — deep reasoning, long-horizon agentic runs, and bug-finding — at half
Fable's price. Treat escalation as a decision to **re-justify on every generation**, not a standing
configuration: try the current `opus` at `xhigh` or `max` first, and pin the frontier model only if
a concrete spec demonstrably fails there. A pin inherited from a previous generation is a pin worth
re-testing.

| Slot | Default (alias) | Frontier escalation pin | Fallback |
|---|---|---|---|
| **T1 Architect / Leader** | `opus` | `claude-fable-5` *(pin — record the reason)* | `opus` |
| **T3 Auditor** | `opus` *(≠ T2)* | `claude-fable-5`, or a different-lab slug | `opus` / `sonnet` |

Two things follow from Fable having **no floating alias**:

- **It is a dated pin — record the reason** (per the alias-first rule), and it re-inherits the
  concrete-slug maintenance the aliases spare you. `/akili-audit`'s drift check watches it; the
  *Replacing a model* runbook below is how you swap it when a newer frontier model ships.
- **Always give it a Fallback to `opus`**, because Fable carries operational constraints the Opus
  alias does not: **no zero-data-retention** (requires 30-day retention — unavailable to ZDR
  projects); **minutes-long turns** (budget HITL gates and progress narration accordingly); and
  **less prescriptive prompting** (over-prescribed `.agents/*` personas can *reduce* Fable output
  quality — loosen them when routing a role to Fable).

**Refusal classifiers are no longer a Fable-only concern.** Current-generation Opus ships elevated
bio/cyber safeguards of its own and can decline a request outright, so a security-adjacent spec may
stall the Implementer or Reviewer on **either** tier. Plan for it at the methodology level rather
than treating it as an escalation-only risk: when a spec is security-adjacent, say so in the task
brief, and treat a declined task as a **Pivot Protocol** case (record it in `execution.md` and
escalate to the user) — never as a Reviewer `FAIL` to be reworked, since rework cannot fix a refusal.

**Cross-family author ≠ auditor.** Fable pairs well with a *different-lab* auditor — pin the
Implementer/Leader on `claude-fable-5` and the Reviewer on a Kimi/DeepSeek OpenCode slug (or
vice-versa). Different training lineages mean different blind spots, making the independent review
genuinely stronger than same-family-different-size.

## Effort dial (second dimension — tune within a tier)

The registry picks the **tier** (which model). **Effort** is the orthogonal dial for *how hard that
model thinks on a given task*. The tier is per-phase/role and stable; effort is **per-task and
dynamic** — the same T2 `sonnet` should run a trivial rename at `low` and a concurrency fix at
`xhigh`. Whoever spawns the worker sets it: in `/akili-execute` and `/akili-test` that is the
**Leader**, alongside its skill selection (same master-builder judgment — which tier, which skill,
how hard it thinks).

**Antigravity maps the dial onto its three effort IDs, not a separate setting.** The roster exposes
effort as distinct IDs (`-high` / `-medium` / `-low`) rather than a dial the way Codex's
`model_reasoning_effort` does, so the AKILI dial collapses onto them:

| AKILI dial | Antigravity ID suffix |
|---|---|
| `low` | `-low` |
| `medium` | `-medium` |
| `high`, `xhigh`, `max` | `-high` (the roster exposes three rungs; the top three collapse) |

Referenced from `/akili-constitution` Step 8C when confirming the exact ID with `agy models`.

**Why it matters — the intelligence↔cost curve is steeply diminishing at the top.** Measured on a
representative model (GPT-5.6 Sol, Artificial Analysis Intelligence Index):

| Effort | Intelligence | Cost/task | vs. `max` |
|---|---|---|---|
| `max` | 59 | $1.04 | — |
| `xhigh` | 58 | $0.68 | −1 pt, −35% cost |
| `high` | 56 | $0.45 | −3 pts, −57% cost |
| `medium` | 54 | $0.31 | **−5 pts (−8%), −70% cost** |

`medium`/`high` captures ~90–95% of the intelligence at ~30–45% of the cost; running everything at
`max`/`xhigh` pays a large premium for a few points. Reserve `xhigh`/`max` for genuinely hard work.

**Effort policy — by task signal:**

| Signal | Effort |
|---|---|
| Trivial / mechanical (copy, rename, style) | `low` |
| Standard task, clear scope | `medium` |
| Complex (algorithm, concurrency, security, ambiguity) | `xhigh` |
| Correctness-critical (can't be wrong, hard to revert) | `max` |

**Default effort by role** (starting point before flexing):

| Role / Phase | Default effort |
|---|---|
| T1 `/akili-propose` / `/akili-specify` (incl. `tasks.md` decomposition) / **Leader** | `high` (`xhigh` if architecturally significant) |
| T2 **Implementer / Tester** | `medium` — flex by task |
| T3 **Reviewer** / `/akili-validate` | `high` (auditor thoroughness) |
| T5 `/akili-archive` / setup steps | `low` |

**Re-baseline these defaults on every model generation — the tier mapping survives model churn, the
effort defaults do not.** The table above is calibrated for AKILI's shape: tasks arrive *already
decomposed and spec-bounded* from `/akili-specify`, which is exactly the case where a mid-range
effort holds up. Vendor guidance for a frontier model is written for the opposite case — one
open-ended agentic request with no spec — and therefore starts higher (for Claude Opus 5, the
published starting points are **`xhigh` for coding and agentic work, `high` elsewhere, then sweep
down**). Both are right for their context. The reconciliation:

- **Sweep, don't assume.** On a new generation, run the same spec at `medium`, `high`, and `xhigh`
  and keep the cheapest level whose Reviewer outcome holds. Effort defaults inherited from a
  previous generation are a guess, not a measurement.
- **Newer generations get more out of the low end, not less.** Each Opus generation has made
  `low`/`medium` stronger relative to its own ceiling — so the sweep usually confirms the T2
  `medium` default rather than pushing it up. Raise the Implementer to `xhigh` for the task
  signals in the policy table above, not by default.
- **Where a task arrives under-specified** — a `[~]` resume with thin `execution.md` context, or a
  Pivot Protocol retry — it is closer to the vendor's open-ended case. Start it at `high`/`xhigh`.

**Effort is not a verbosity dial.** On current-generation models, lowering effort does **not**
reliably shorten user-facing output — it changes how much the model *thinks*, not how much it
*writes*. If an Implementer's report or a Leader's narration is too long, fix it in the brief
(`caveman` for transient agent output, `cognitive-doc-design` for artifacts), never by dropping
effort — that buys verbose output *and* shallower reasoning. The same applies in reverse: raising
effort to get a more thorough **document** is the wrong lever; ask for the depth explicitly.

**Escalate effort on rework.** In the `/akili-execute` rework loop, a Reviewer `FAIL` bumps effort
one level on the retry (attempt 1 `medium` → attempt 2 `high` → attempt 3 `xhigh`) — cheap (only
when it already failed) and it targets the usual cause (under-thinking, not missing instructions).

**Tier ↔ effort interaction — don't `max` a cheaper tier.** Maxing a lower tier erodes its cost
advantage. Historical illustration from the **previous (4.8) generation** — kept because the numbers
were measured, not because that ladder is current: Sonnet 5 at `max` (53 intel / $1.53) approached
Opus 4.8 at `max` (56 intel / $1.80) — near-Opus price for below-Opus intelligence. The rule the
figures demonstrate is stable across generations (the current `opus` alias resolves to Opus 5): if
you find yourself wanting a cheaper tier at `max`, escalate the **tier** (to `opus` at
`high`/`medium`) instead of the effort.

**Sonnet specifics.** Sonnet respects effort strictly, especially at the low end — at `low`/`medium`
it scopes work to exactly what was asked. If you see shallow reasoning on a hard problem, **raise
the effort, don't prompt around it**. `high` is the default sweet spot; give `max_tokens` headroom
at `xhigh`/`max` (thinking consumes the budget — too tight truncates with `stop_reason: max_tokens`).

**Opus specifics.** On Opus the nuance inverts: start high and iterate **down** — more effort up
front often *reduces* total turns and total cost on agentic work, because the model plans better and
re-does less. Two consequences for the AKILI loop: (1) the **rework bump** (above) is the cheapest
place to spend effort, since it only fires after a failure; and (2) `max` is for the
correctness-critical and latency-insensitive case only — it can overthink a routine task and is
where diminishing returns bite hardest.

## Enforced routing (tool-native agent bindings)

The `/akili-execute` and `/akili-test` fan-out (Implementer, Reviewer, Testers) is where most
tokens are spent — and a generic subagent **inherits the session model**, which silently breaks
author ≠ auditor when the whole session runs on one model. Every supported host supports a `model`
field on **agent definitions** (never on commands), so `/akili-constitution` Step 8E binds the
personas there:

| Tool | Native agent location | Model value |
|---|---|---|
| Claude Code | `.claude/agents/akili-{leader,implementer,reviewer,tester}.md` (project-level) | Alias from the registry (`model: sonnet`, `model: opus`, `model: haiku`) |
| OpenCode | Project agent config (`.opencode/agent/*.md` or the `agent` block of `opencode.json`, per your OpenCode version) | Provider slug from the registry (`model: opencode-go/deepseek-v4.1-flash`) |
| Antigravity | `.agents/agents/akili-{leader,implementer,reviewer,tester}/agent.md` (project-level; flat `.agents/agents/<name>.md` is equivalent) | `model:` from the registry's Antigravity column — `inherit` / `flash` / `pro` |
| Codex | `.codex/agents/akili-{leader,implementer,reviewer,tester}.toml` (project-level) | `model =` from the registry's Codex column, plus `model_reasoning_effort =` — see below |

**Antigravity binds more than the model — and the nesting is not optional.** Two corrections to
what this document previously stated. First, agents are discovered under **`.agents/agents/`**, so a
persona left at `.agents/<role>.md` is invisible to it; that path is the whole reason the personas
appear to be ignored. Second, this host was recorded here as having no per-agent model binding —
it does, alongside three fields the other hosts have no equivalent for:

| Field | Effect |
|---|---|
| `subagent: true` | **Required** for the Leader to reach the wrapper via `invoke_subagent`. Omit it and the wrapper exists but can never be dispatched |
| `mainAgent: false` | Keeps Implementer / Reviewer / Tester out of the primary-agent picker — they are dispatch targets only |
| `tools: [...]` | A per-agent tool allow-list |

`tools` is the consequential one: it turns the Reviewer's **read-only role from an instruction into
a restriction**, so `author ≠ auditor` gains a second structural guarantee — the auditor not only
runs on a different model, it *cannot write*. Use it on the Reviewer alone, and only with tool names
confirmed against the user's version: the vendor documents that an unmapped or misspelled name
**hangs the subagent process**, which fails silently instead of erroring. When the names cannot be
confirmed, omit `tools` and keep the Reviewer read-only by instruction — a hung Reviewer is worse
than an unenforced one.

Each wrapper is thin: frontmatter (`name`, `description`, `model`) plus a body that instructs the
agent to read and fully adopt the corresponding `.agents/<role>.md` persona. The persona files in
`.agents/` remain the tool-agnostic source of truth; the wrappers only add the model binding.
`/akili-execute` and `/akili-test` prefer these named agents when they exist and fall back to
generic subagents seeded with the persona content when they don't.

**author ≠ auditor becomes structural:** `akili-reviewer` is pinned to a different model than
`akili-implementer` in the wrapper files themselves — no human discipline required.

**Codex binds effort as a native wrapper field, not a runtime instruction.**
`.codex/agents/akili-<role>.toml` carries `model_reasoning_effort` alongside `model` — the second
dial lives inside the same file, unlike Claude Code and OpenCode where effort is set per call. Map
the AKILI effort dial onto the field directly:

| AKILI dial | `model_reasoning_effort` |
|---|---|
| `low` | `low` |
| `medium` | `medium` |
| `high` | `high` |
| `xhigh` | `xhigh` |
| `max` | `max` |

**Confirmed live 2026-09-17 (codex-cli 0.154.0):** `-c model_reasoning_effort=<v>` accepted all six
rungs — `low`, `medium`, `high`, `xhigh`, `max`, `ultra` — on `gpt-5.6-luna`. The models page's own
UI enum (`Low`/`Medium`/`High`/`Extra High`/`Max`/`Ultra` — **Last verified: 2026-09-16**,
<https://learn.chatgpt.com/docs/models>) is confirmed accurate; AKILI's five-rung dial maps
`max`→`max`, and `ultra` exists above it with no AKILI rung mapped to it (server-side clamping
beyond what the CLI accepts is not observable from the CLI). **There is no standalone `/reasoning`
command** — the CLI's `/model` command "choose[s] the active model (and reasoning effort, when
available)" in one prompt (**Last verified: 2026-09-17** — third independent fetch,
<https://learn.chatgpt.com/docs/cli/slash-commands>).
The Reviewer wrapper alone also sets `sandbox_mode = "read-only"` — Codex has no documented per-agent
tool allow-list, so the sandbox is the second structural guarantee of author ≠ auditor, paralleling
Antigravity's `tools` allow-list above. Pin: <https://learn.chatgpt.com/docs/agent-configuration/subagents>
— **Last verified: 2026-09-16**. **Confirmed live 2026-09-17 (codex-cli 0.154.0):** a session run with
`sandbox_mode = "read-only"` and asked to create a file was denied — `patch rejected: writing is
blocked by read-only sandbox; rejected by user approval settings`.

## Cross-host dispatch

Everything above assumes **one active host per session**: you are in Claude Code, so you read the
Claude Code column. That assumption is no longer universal. Agent orchestrators (Orca and its kind)
let a coordinator in one host launch a worker in **another** host, hand it a task, wait for a
structured completion message, and review the result — without the human leaving the coordinator.

> **The host column is a property of the *dispatch*, not of the session.**
> A coordinator reads **its own** column for its own reasoning, and the **worker's** column when
> deciding where to send the work. The columns are not alternatives chosen at install time; they
> are doors that are all open at once.

**This reorders the fallback rule.** The `Fallback` column was written for a closed host: *if the
right model is not available here, degrade to a lesser one here*. When a dispatcher is present,
that ordering inverts:

> **Reach across hosts before degrading within one.** The right model behind one extra spawn
> usually beats a weaker model in the current session.

**The dead end this resolves.** **T6** said *"prefer external Gemini / Claude vision"* — advice with
no way to act on it, because the closed-host assumption left no route out. The preference now
becomes one: dispatch the visual phase to a host whose column carries a real vision model, and keep
the current session as coordinator.

> **Not every gap was a real one.** Antigravity was recorded here as unable to bind a model per
> agent, which made it look like a case only cross-host dispatch could rescue. It was simply
> documented wrong — the host has native per-agent binding (see *Enforced routing* above). Before
> reaching for a cross-host spawn to work around a host's stated limitation, confirm the limitation
> still holds: the spawn is not free, and this registry has been wrong about one before.

**Record the invocation, not just the model.** A registry that says *which* host to reach and not
*how* to reach it is an incomplete instruction: the agent has to guess a binary name, and the
product name is not reliably the command.

| Host | CLI invocation |
|---|---|
| Claude Code | `claude` |
| OpenCode | `opencode` |
| Antigravity | **`agy`** — not `antigravity`, not `ag` |
| Codex | `codex` — invocation is `$akili-<name>` (skills, not slash commands) |

Antigravity is the case that proves the rule: sessions have repeatedly concluded the CLI *does not
exist* after searching for the product name, and then had to walk it back. The failure is
expensive and silent-ish — it does not error, it produces a confident wrong conclusion ("this host
is not reachable") that then propagates into the plan. **Confirm each invocation with the user
rather than inferring it**, since binaries vary with install method and live outside the repo, and
record the confirmed value in the project's `## Model Routing`. One line there is cheaper than
every future session rediscovering it, which is the actual observed cost.

**A host is not the same thing as a dispatch target, and the brief differs.** Everything above
concerns **hosts** — the runtimes AKILI is installed into, which have the commands, the `.agents/`
personas and the Step 8E wrappers. An orchestrator can usually address far more runtimes than that:
a coordinator may be able to reach a dozen agent CLIs, only a few of which are hosts. Both are
legitimate workers; they require different briefs.

| | **Host** (AKILI installed) | **Dispatch target** (AKILI absent) |
|---|---|---|
| Brief | *"Read `.agents/implementer.md` and adopt it"* — a reference resolves | **Self-contained.** A path reference resolves to nothing; the worker never sees it and cannot say so |
| Carries | The whole persona, plus the spec on disk | Only what you inline: scope bounds, the verification command, **the disqualifier that makes the evidence invalid**, and the shape of the report you expect back |
| Registry | Gets a column | Gets no column — it runs no AKILI phase |

The **disqualifier** is the clause most often dropped in this translation and the most expensive to
drop: a worker that cannot read the spec has no other way to learn when its own measurement stops
being evidence, so a brief without it is precisely the gate that invites passing.

Reach for a non-host target when the capability gap justifies the heavier brief — these runtimes are
often specialists, which is the whole reason to want them. Accept that the brief costs more to write
and stays narrower than a persona; scope the task accordingly rather than expecting AKILI-shaped
judgment from a worker that has never read the constitution.

**Breadth of reach is not licence for breadth of fan-out.** Being able to address many runtimes does
not make many-at-once correct — the Delegation Ceiling binds identically. What extra runtimes buy is
**independence** (`author ≠ auditor` across model families) and **capability** (a tier your own host
serves badly), never a fleet racing one task.

**Addressability is narrower than the runtime list, and the gap fails silently.** An orchestrator's
group aliases typically cover a subset of the runtimes it can launch, and a group with no members
accepts a dispatch and delivers it nowhere. Confirm the address exists — or dispatch to a concrete
worker handle, which is what lifecycle messages require anyway.

**When it is worth it.** A cross-host spawn costs a fresh context and a round trip, so it is
justified by a **real capability gap** — vision, a specific frontier model, a domain where another
family is clearly stronger — not by a marginal tier difference. Below that bar the spawn costs more
than it buys; stay in the current host and use the Fallback column as written.

**What it does *not* change.** The tier definitions, `author ≠ auditor`, and the Delegation Ceiling
all apply unchanged to a cross-host worker — a worker in another host is still a subagent, still
bound by the *one subagent beats several* rule, and still owed a precise brief on the first spawn.
If anything `author ≠ auditor` gets easier: a worker in a different host is running different
weights by construction, which is stronger independence than a fresh context on the same model.

**Recording it.** Dispatcher availability is a property of the developer's environment, not of the
project, so the registry records the *routing preference* (which host owns which capability) and
never the tool. `/akili-constitution` Step 8C scaffolds this as a line in the project's
`## Model Routing`; commands inherit it through the model checkpoint below, which already reads
that section.

## Model checkpoints (main loop)

The session model cannot be switched programmatically, but the agent knows which model it is
running on. Every AKILI command performs a one-line **model checkpoint** during setup: read the
project's `## Model Routing` registry, compare the phase's tier to the current session model, and
if they differ, tell the user in one line (e.g. *"This phase is T1 — the registry recommends
`/model opus`; you are on haiku"*) and offer the switch in the phase's first HITL pause. The user
can always continue on the current model; the checkpoint never blocks.

**The registry is a floor, not a ceiling — check the direction before speaking.** "Different"
has two cases and only one deserves a recommendation. When the registry's model is **stronger**
for the tier than the session model, recommend the switch — that is the checkpoint working. When
the **session model is the stronger one** (most often: a newer generation running against a
registry entry that predates it), the checkpoint **passes silently and the finding is a stale
registry, not a wrong session model** — flag the entry for update at the next pause; never
recommend a downgrade. A registry pinned to a dated model (against the alias-first rule) makes
this failure mode systematic: every session on a newer model gets told to step down by a document
whose only defect is its age. The alias-first rule prevents it; the direction rule contains it
when a pin slipped through anyway.

**The checkpoint has three outcomes, not two.** Switch the session model, continue as-is, or —
when the project's registry records a cross-host routing preference for this capability and a
dispatcher is available — **dispatch the phase to the host that has the right model** and keep the
current session as coordinator. Offer the third only where it applies: it is the answer to a real
capability gap (a vision phase on a text-only session model), never to a one-tier difference.

## Surviving model churn

Models change constantly; the design absorbs that at three layers:

1. **Tiers are the stable layer.** Phases map to T1–T6 and never change when models do.
2. **Aliases are the default.** The Claude column uses floating aliases that track the latest
   generation automatically (see the alias-first rule above).
3. **Drift is detected, not discovered.** `/akili-audit` includes a **Model Registry Drift** check
   (registry entries naming models the tool no longer offers, or a project registry older than the
   packaged default), and `/akili-constitution` in Safe Update mode flags stale entries against the
   packaged default without overwriting user pins. Each AKILI release refreshes this document's
   default registry.

## Replacing a model (developer runbook)

You started the project on 2026's models; it is now 2027 and better ones exist. What you do depends
on **what kind of entry** you put in the registry. Tiers never change — you only ever touch the
model column.

| Your registry entry | What to do when a newer model ships |
|---|---|
| **Floating alias** (`opus` / `sonnet` / `haiku`, Claude Code) | **Nothing.** The alias auto-resolves to the latest generation of that family — this is exactly what alias-first buys you. Zero edits. |
| **Concrete slug** (OpenCode `opencode-go/...`, a dated Claude pin, or `claude-fable-5`) | **Edit it** — no alias mechanism absorbs the change. Follow the 3 steps below. |
| **You want to re-map a tier** (promote a new model into T1/T2/T3, e.g. GLM-5.3-Flash → T2) | Edit the tier's row, then reconcile wrappers — same 3 steps. Treat it as a *promotion to evaluate*, not an auto-swap (does it fit the tier? does it keep author ≠ auditor?). |

**The 3 steps (concrete-slug or re-map case):**

1. **Edit ONE table** — the `## Model Routing` block in your **project's** root `AGENTS.md` /
   `CLAUDE.md` (not this packaged default; see below). Change the slug(s), bump the
   `Updated: <YYYY-MM>` stamp, and record a one-line reason next to any dated pin.
2. **Reconcile the Step 8E wrappers** — `.claude/agents/akili-*.md` and `.opencode/agent/*.md`
   hard-code `model:` per role, so their value must match the new registry. Alias-based Claude
   wrappers (`model: opus`) usually need no change; concrete OpenCode slugs do.
3. **Run `/akili-audit`** — its **Model Registry Drift** check confirms the registry and wrappers
   agree and flags any slug the tool no longer offers.

**Which file do I edit — the package default or the project copy?**

- `docs/model-routing.md` (this file) is the **default new projects inherit**. Editing it does *not*
  change projects already scaffolded.
- The `## Model Routing` block inside each project's root `AGENTS.md` / `CLAUDE.md` is **what
  actually governs that project** — that is where a downstream developer edits. When you upgrade the
  AKILI package and its default registry moves ahead of your project copy, `/akili-constitution` in
  **Safe Update mode** flags the difference without overwriting your pins; you decide what to adopt.

## How to apply per tool

- **Claude Code:** switch with `/model` before running a phase — e.g. `/model opus` for
  `/akili-propose`, `/akili-validate`, and the `/akili-execute` / `/akili-test` **Leader session**
  (you orchestrate on the deep reasoner; the triad's Implementer/Tester subagents route to `sonnet`
  via their Step 8E wrappers), plus the full `/akili-specify` run (including `tasks.md` decomposition);
  `/model haiku` only for `/akili-archive` and pure setup/formatting steps — or simply respond to each
  command's model checkpoint. With Step 8E bindings in place, the execute/test triad
  routes itself (Implementer on `sonnet`, Reviewer on `opus`, Leader = your session).
- **OpenCode:** select the `opencode-go/...` model for each phase per the registry, or use the
  Step 8E agent bindings. Run the **Leader session on the T1 slug** (`opencode-go/deepseek-v4-pro`),
  and keep the Reviewer/validator on that same T3 slug (`opencode-go/deepseek-v4-pro`) — different
  from the Implementer (`opencode-go/deepseek-v4.1-flash`).
- **Codex:** switch model and reasoning effort together with `/model` before a phase — there is no
  separate `/reasoning` command; `/model` "choose[s] the active model (and reasoning effort, when
  available)" in one prompt (**Last verified: 2026-09-16**,
  <https://learn.chatgpt.com/docs/cli/slash-commands>). Use it to pick the registry's T1 family
  (**Terra**) at `high` effort for `/akili-propose`, `/akili-validate`, and the `/akili-execute` /
  `/akili-test` **Leader session** — confirm the account's own roster at Step 8C, since Sol upgrades
  T1/T3 only where the plan allows it. With Step 8E wrappers in place, the execute/test triad routes
  itself from `.codex/agents/akili-*.toml` (Implementer on **Luna**, Reviewer on **Terra**, both
  with their own `model_reasoning_effort`) — the Leader session is the one seat you still set by
  hand.

## Cross-tool safety

- **No `model:` frontmatter on commands.** Command prompts stay `description:`-only. A single
  frontmatter value cannot serve both tools anyway (Claude Code expects `opus`/`sonnet`/`haiku`;
  OpenCode expects `provider/model`), so model choice stays out of the prompts. Model bindings live
  exclusively in **agent definitions**, which are per-tool, per-project files generated with the
  user's approval in Step 8E.
- **No installer changes.** Nothing here is force-injected. `/akili-constitution` scaffolds a project
  copy of this registry into `AGENTS.md` / `CLAUDE.md` as plain Markdown — identical handling across
  Claude Code, OpenCode, Google Antigravity, and Codex.
- **Per-project override.** Edit the registry inside your project's `AGENTS.md` / `CLAUDE.md` to
  pin different models; this package's copy is only the default.
- **The registry is host-complete, always.** It belongs to the **project**, not to the session that
  scaffolded it. Keep a column for every supported host even when you only use one today: the repo
  outlives any single tool, gets opened in a different host later, and gets handed to teammates who
  use something else. A registry scaffolded from one tool that *drops* the other columns leaves the
  next session in that host with nothing to read and silently breaks its Step 8E wrappers and every
  model checkpoint. An unknown roster is a `<CONFIRM SLUG>` placeholder, never a deleted column;
  `/akili-audit` flags a missing host column as high impact.
- **Planning layers that delegate do not get a column.** Tools that orchestrate *other* agents —
  a planner or task workspace that hands work to Claude Code, OpenCode, or similar — sit **above**
  this registry rather than beside it. They choose which host executes; that host's column then
  applies unchanged, because AKILI's artifacts (`.agents/`, the baseline docs, the specs) are plain
  Markdown the delegated agent reads from the repo. Add a column only for a host that *runs the
  agent itself*. One caveat worth verifying per tool: if the layer's own planning phase does not
  read `AGENTS.md` / `CLAUDE.md`, your project context reaches the work only once the delegated
  agent starts — plan accordingly, or drive planning from a host that reads them.
