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
models. When models change, edit only this table. *Registry updated: 2026-07.*

**Alias-first rule: never pin a dated model name where a floating alias exists.** Claude Code's
`opus` / `sonnet` / `haiku` aliases always resolve to the latest version of each family — when
Anthropic ships a new generation, an alias-based registry needs **zero edits**. Pin a dated ID only
when you deliberately need to freeze a version, and record why next to the pin. OpenCode slugs are
concrete (no alias mechanism), which is why they carry the Fallback column and the drift check
below.

| Tier | Claude Code | OpenCode Go | Fallback |
|---|---|---|---|
| **T1 Architect** | `opus` *(alias — always latest)* | `opencode-go/kimi-k3` | `opencode-go/kimi-k2.6` / `opencode-go/deepseek-v4-pro` / `sonnet` |
| **T2 Coder** | `sonnet` | `opencode-go/glm-5.2` | `haiku` / `opencode-go/deepseek-v4-flash` |
| **T3 Auditor** | `opus` *(must differ from T2)* | `opencode-go/deepseek-v4-pro` | `sonnet` / `opencode-go/kimi-k2.6` |
| **T4 Context-Ingest** | `sonnet` (long context) | `opencode-go/deepseek-v4-flash` | `opus` / `opencode-go/deepseek-v4-pro` |
| **T5 Fast-Cheap** | `haiku` | `opencode-go/deepseek-v4-flash` | `sonnet` / `opencode-go/mimo-v2.5` |
| **T6 Multimodal** | `sonnet` (vision) | `opencode-go/qwen3.7-max` *(weak — prefer external Gemini 3.1 Pro / Claude Sonnet vision)* | `opus` |

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

**OpenCode Go.** The strongest open models anchor the highest-leverage tiers:

- **GLM-5.2 → T2 Coder.** A-tier open coder (753B, GPQA 91.2), successor to GLM-5.1, purpose-built
  for long autonomous coding runs — the recommended **default OpenCode workhorse**. (This row was
  bumped 5.1 → 5.2 as a worked example of the *Replacing a model* runbook below.)
- **Kimi K3 → T1 Architect.** S-tier open coder and the current-generation successor to K2.6 (which
  drops to the T1 fallback), continuing the Kimi line's Agent Swarm lineage built for multi-step
  decomposition — ideal for architectural trade-off reasoning and `/akili-explore`-style impact
  analysis. It is the **slowest of the pack (~33 tok/s)**, which is fine for T1 (Leader/architect =
  low-volume, latency-tolerant) but is exactly why it must **never** sit in the T2 fan-out. Concrete
  slug, no alias: confirm it against your own OpenCode roster and follow the runbook when a newer
  Kimi ships.
- **DeepSeek V4 Pro → T3 Auditor.** A-tier (SWE-bench 80.6, Terminal-Bench 67.9), 1M context, and
  crucially a *different* model than the GLM-5.2 coder — satisfying author ≠ auditor for
  `/akili-validate` and the Reviewer.
- **DeepSeek V4 Flash → T4 / T5 (and the T2 fallback).** 1M context, A-tier yet cheapest of the set
  ($0.14 / $0.28 per 1M, SWE-bench 79.0), highest rate limit — right for bulk ingestion,
  high-frequency formatting, and as a strong cheap coder fallback.
- **Qwen3.7 Max → T6.** Best-effort only (Alibaba's flagship, the most likely open multimodal
  option — Intelligence ~46, but pricey at ~$1.03/task). Open multimodal is weak; for real UI/UX
  design work prefer an external **Gemini 3.1 Pro** (A-tier vision) or **Claude Sonnet** (vision).

All OpenCode Go slugs are taken from the [OpenCode Go model list](https://opencode.ai/docs/go).
Confirm them against your own OpenCode configuration and adjust if your roster differs.

### Frontier escalation tier (opt-in — pin, not alias)

A frontier model *above* Opus — Claude **Fable 5** (`claude-fable-5`), or **Mythos 5**
(`claude-mythos-5`) on Project Glasswing — can be pinned for the highest-leverage slots as an
**opt-in ceiling for genuinely hard specs**. It is **never a default** and **never in T2** (the
high-volume fan-out): at ~2× Opus pricing (**$10 / $50** per 1M in/out vs `opus` at $5 / $25), it
only earns its cost where token volume is low and the decision gates the whole run — T1 (Architect +
the execute/test Leader) and T3 (Auditor).

| Slot | Default (alias) | Frontier escalation pin | Fallback |
|---|---|---|---|
| **T1 Architect / Leader** | `opus` | `claude-fable-5` *(pin — record the reason)* | `opus` |
| **T3 Auditor** | `opus` *(≠ T2)* | `claude-fable-5`, or a different-lab slug | `opus` / `sonnet` |

Two things follow from Fable having **no floating alias**:

- **It is a dated pin — record the reason** (per the alias-first rule), and it re-inherits the
  concrete-slug maintenance the aliases spare you. `/akili-audit`'s drift check watches it; the
  *Replacing a model* runbook below is how you swap it when a newer frontier model ships.
- **Always give it a Fallback to `opus`**, because Fable carries operational constraints Opus does
  not: a **refusal classifier** on bio/cyber that can false-positive on legitimate security-adjacent
  specs (a Fable Implementer/Reviewer may decline valid work); **no zero-data-retention** (requires
  30-day retention — unavailable to ZDR projects); **minutes-long turns** (budget HITL gates and
  progress narration accordingly); and **less prescriptive prompting** (over-prescribed `.agents/*`
  personas can *reduce* Fable output quality — loosen them when routing a role to Fable).

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

**Escalate effort on rework.** In the `/akili-execute` rework loop, a Reviewer `FAIL` bumps effort
one level on the retry (attempt 1 `medium` → attempt 2 `high` → attempt 3 `xhigh`) — cheap (only
when it already failed) and it targets the usual cause (under-thinking, not missing instructions).

**Tier ↔ effort interaction — don't `max` a cheaper tier.** Maxing a lower tier erodes its cost
advantage: Sonnet 5 at `max` (53 intel / $1.53) approaches Opus 4.8 at `max` (56 intel / $1.80) —
near-Opus price for below-Opus intelligence. If you find yourself wanting a cheaper tier at `max`,
escalate the **tier** (to `opus` at `high`/`medium`) instead of the effort.

**Sonnet specifics.** Sonnet respects effort strictly, especially at the low end — at `low`/`medium`
it scopes work to exactly what was asked. If you see shallow reasoning on a hard problem, **raise
the effort, don't prompt around it**. `high` is the default sweet spot; give `max_tokens` headroom
at `xhigh`/`max` (thinking consumes the budget — too tight truncates with `stop_reason: max_tokens`).
On Opus/frontier the nuance inverts slightly: start at `high` and iterate — more effort up front
often *reduces* total turns and cost on agentic work.

## Enforced routing (tool-native agent bindings)

The `/akili-execute` and `/akili-test` fan-out (Implementer, Reviewer, Testers) is where most
tokens are spent — and a generic subagent **inherits the session model**, which silently breaks
author ≠ auditor when the whole session runs on one model. Both tools support a `model` field on
**agent definitions** (never on commands), so `/akili-constitution` Step 8E binds the personas
there:

| Tool | Native agent location | Model value |
|---|---|---|
| Claude Code | `.claude/agents/akili-{leader,implementer,reviewer,tester}.md` (project-level) | Alias from the registry (`model: sonnet`, `model: opus`, `model: haiku`) |
| OpenCode | Project agent config (`.opencode/agent/*.md` or the `agent` block of `opencode.json`, per your OpenCode version) | Provider slug from the registry (`model: opencode-go/glm-5.2`) |
| Antigravity | Not supported — `invoke_subagent` has no per-agent model binding | Guidance-only fallback |

Each wrapper is thin: frontmatter (`name`, `description`, `model`) plus a body that instructs the
agent to read and fully adopt the corresponding `.agents/<role>.md` persona. The persona files in
`.agents/` remain the tool-agnostic source of truth; the wrappers only add the model binding.
`/akili-execute` and `/akili-test` prefer these named agents when they exist and fall back to
generic subagents seeded with the persona content when they don't.

**author ≠ auditor becomes structural:** `akili-reviewer` is pinned to a different model than
`akili-implementer` in the wrapper files themselves — no human discipline required.

## Model checkpoints (main loop)

The session model cannot be switched programmatically, but the agent knows which model it is
running on. Every AKILI command performs a one-line **model checkpoint** during setup: read the
project's `## Model Routing` registry, compare the phase's tier to the current session model, and
if they differ, tell the user in one line (e.g. *"This phase is T1 — the registry recommends
`/model opus`; you are on haiku"*) and offer the switch in the phase's first HITL pause. The user
can always continue on the current model; the checkpoint never blocks.

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
| **You want to re-map a tier** (promote a new model into T1/T2/T3, e.g. Kimi K3 → T1) | Edit the tier's row, then reconcile wrappers — same 3 steps. Treat it as a *promotion to evaluate*, not an auto-swap (does it fit the tier? does it keep author ≠ auditor?). |

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
  Step 8E agent bindings. Run the **Leader session on the T1 slug** (`opencode-go/kimi-k3`), and
  keep the Reviewer/validator on a different model (`deepseek-v4-pro`) than the Implementer
  (`glm-5.2`).

## Cross-tool safety

- **No `model:` frontmatter on commands.** Command prompts stay `description:`-only. A single
  frontmatter value cannot serve both tools anyway (Claude Code expects `opus`/`sonnet`/`haiku`;
  OpenCode expects `provider/model`), so model choice stays out of the prompts. Model bindings live
  exclusively in **agent definitions**, which are per-tool, per-project files generated with the
  user's approval in Step 8E.
- **No installer changes.** Nothing here is force-injected. `/akili-constitution` scaffolds a project
  copy of this registry into `AGENTS.md` / `CLAUDE.md` as plain Markdown — identical handling across
  Claude Code, OpenCode, and Google Antigravity.
- **Per-project override.** Edit the registry inside your project's `AGENTS.md` / `CLAUDE.md` to
  pin different models; this package's copy is only the default.
