# Capability-Tier Model Routing

JCSPECS is model-agnostic: no command, skill, or persona hardcodes a model. This document is the
**human-facing guidance** for choosing which model runs which SDD phase, so each phase runs on a
model matched to its dominant computational demand rather than one model doing everything.

It is **guidance-first**: you switch models yourself per tool (Claude Code `/model`, OpenCode
model selector). Nothing here is injected into command frontmatter or the installer — see
[Cross-Tool Safety](#cross-tool-safety).

## Philosophy: criteria first, model second

Each SDD phase declares **what it needs** (deep reasoning, coding throughput, independent
judgment, large context, speed/cost, or vision) before anyone picks a model. The model is derived
from the need, not the reverse. The registry lists a principal model plus a fallback per tier.

### Guiding principles

- **Match the dominant demand.** Route by the single most important demand of the phase, not by
  "use the smartest model everywhere."
- **ARCHITECT = BUILDER.** The model family that reasons about the design should also implement it
  (`/sdd-propose` and the `/sdd-execute` Implementer share the workhorse family). Less information
  is lost between design and code.
- **author ≠ auditor.** The Reviewer / validator MUST run on a **different model** than the
  Implementer. An independent auditor catches what the author rationalized away.
- **Reserve deep-reasoning for propose & verify.** The most expensive reasoning models earn their
  cost on architecture (`/sdd-propose`) and final audit (`/sdd-validate`, Reviewer), not on
  bookkeeping.
- **Fast & cheap for tasks & archive.** Partitioning a spec into tickets and summarizing closed
  work are format-following jobs — speed and cost dominate; raw intelligence adds little.

## Capability tiers

Six tiers cover the genuinely distinct demands across the SDD pipeline without proliferating one
tier per phase (which would defeat the abstraction and churn on every model release).

| Tier | Definition |
|---|---|
| **T1 Architect** | Deep reasoning for architecture, trade-offs, and intent — "think hard before code." |
| **T2 Coder** | Maximum coding throughput and instruction-following for writing and editing code and tests. |
| **T3 Auditor** | Independent critical review — conformance, bug-finding, drift; must differ from the author model. |
| **T4 Context-Ingest** | Large-context absorption of legacy codebases and baseline docs — window size over depth. |
| **T5 Fast-Cheap** | Cheap, fast structured formatting and summarization where reasoning depth is not the bottleneck. |
| **T6 Multimodal** | Visual / UI-UX design reasoning over images, screenshots, and design references. |

## Phase → tier mapping

The `/sdd-execute` triad is split because each role has a different demand — and because
author ≠ auditor makes the Implementer/Reviewer split a **correctness constraint**, not a
preference.

| Phase / Role | Tier(s) | Why |
|---|---|---|
| `/sdd-constitution` | T4 + T1 | Ingest legacy code (long context), then reason to synthesize the baseline. |
| `/sdd-propose` | T1 | Architecture and trade-offs — reserve the deep reasoner. |
| `/sdd-specify` → requirements.md / design.md | T1 | Heavy reasoning + technical writing. |
| `/sdd-specify` → tasks.md | T5 | Fast structured partitioning into tickets. |
| `/sdd-specify` → UX/UI design | T6 | Only when visual design is in scope. |
| `/sdd-execute` → **Leader** | T5 | Orchestration / instruction-following — writes no code. |
| `/sdd-execute` → **Implementer** | T2 | Maximum coding. Shares the workhorse family with propose (ARCHITECT = BUILDER). |
| `/sdd-execute` → **Reviewer** | T3 | Independent audit. **MUST resolve to a different model than the Implementer.** |
| `/sdd-test` | T2 | Test authoring + verification. |
| `/sdd-validate` | T3 | Deep conformance audit. |
| `/sdd-audit` | T4 + T3 | Drift detection over large context, judged critically. |
| `/sdd-archive` | T5 | Cheap, fast summarization of closed work. |
| `/sdd-seo` | T3 + T5 | Audit findings (T3) plus setup/formatting steps (T5). |

**author ≠ auditor enforcement.** In the registry, T2 (Coder) and T3 (Auditor) must resolve to
**different concrete models**. If they ever collapse to the same model, escalate the Reviewer one
tier (to the deeper reasoner) to preserve independence.

## Model registry

This is the single editable source of truth. Phases reference **tiers**; only this table names
concrete models. When models change, edit only this table.

| Tier | Claude Code (PRO) | OpenCode Go | Fallback |
|---|---|---|---|
| **T1 Architect** | Opus 4.8 | `opencode-go/kimi-k2.6` | `opencode-go/deepseek-v4-pro` / Sonnet 4.6 |
| **T2 Coder** | Sonnet 4.6 | `opencode-go/glm-5.1` | Haiku 4.5 / `opencode-go/qwen3.7-max` |
| **T3 Auditor** | Opus 4.8 *(must differ from T2)* | `opencode-go/deepseek-v4-pro` | Sonnet 4.6 / `opencode-go/kimi-k2.6` |
| **T4 Context-Ingest** | Sonnet 4.6 (1M context) | `opencode-go/deepseek-v4-flash` | Opus 4.8 / `opencode-go/deepseek-v4-pro` |
| **T5 Fast-Cheap** | Haiku 4.5 | `opencode-go/deepseek-v4-flash` | Sonnet 4.6 / `opencode-go/mimo-v2.5` |
| **T6 Multimodal** | Sonnet 4.6 (vision) | `opencode-go/qwen3.7-max` *(weak — prefer Claude/Gemini)* | Opus 4.8 |

### Why these models

**Claude Code (PRO).** Opus 4.8 carries the tightest PRO rate limits, so it is **reserved for
T1 (propose, specify reasoning) and T3 (validate, review)** — the two phases that most reward deep
reasoning. **Sonnet 4.6 is the workhorse** for coding (T2), large-context ingestion via its 1M
window (T4), and vision (T6). **Haiku 4.5** handles fast/cheap formatting, orchestration, and
summarization (T5). This concentrates scarce Opus budget on architecture and audit and avoids
exhausting it during execution-heavy work.

**OpenCode Go.** The two strongest open models anchor the two highest-leverage tiers:

- **GLM-5.1 → T2 Coder.** The highest-rated open-source model overall (58.4% SWE-Pro, ahead of
  GPT-5.4 and Claude Opus 4.6) and purpose-built for long autonomous coding runs. It is the
  recommended **default OpenCode workhorse** and universal fallback when no specialized model is
  preferred.
- **Kimi K2.6 → T1 Architect.** One of the best open models (58.6% SWE-Pro, tied with GPT-5.5); its
  Agent Swarm is built for multi-step decomposition — ideal for architectural trade-off reasoning
  and `/sdd-explore`-style impact analysis.
- **DeepSeek V4 Pro → T3 Auditor.** 1M context + a "Think Max" reasoning mode, and crucially a
  *different* model than the GLM-5.1 coder — satisfying author ≠ auditor for `/sdd-validate` and the
  Reviewer.
- **DeepSeek V4 Flash → T4 / T5.** 1M context, fastest and cheapest, highest rate limit — right for
  bulk ingestion and high-frequency formatting.
- **Qwen3.7 Max → T6.** Best-effort only. Open-source multimodal is weak; for real UI/UX design work
  prefer Claude Sonnet (vision) or an external Gemini model.

All OpenCode Go slugs are taken from the [OpenCode Go model list](https://opencode.ai/docs/go).
Confirm them against your own OpenCode configuration and adjust if your roster differs.

## How to apply per tool

- **Claude Code (PRO):** switch with `/model` before running a phase — e.g. `/model opus` for
  `/sdd-propose` and `/sdd-validate`, `/model sonnet` for `/sdd-execute` and `/sdd-test`,
  `/model haiku` for the tasks split and `/sdd-archive`. For the `/sdd-execute` triad, run the
  Implementer on Sonnet and the Reviewer on Opus so author ≠ auditor holds.
- **OpenCode:** select the `opencode-go/...` model for each phase per the registry. Keep the
  Reviewer/validator on a different model (`deepseek-v4-pro`) than the Implementer (`glm-5.1`).

## Cross-tool safety

- **No `model:` frontmatter.** Command prompts stay `description:`-only. A single frontmatter value
  cannot serve both tools anyway (Claude Code expects `opus`/`sonnet`/`haiku`; OpenCode expects
  `provider/model`), so model choice stays out of the prompts.
- **No installer changes.** Nothing here is force-injected. `/sdd-constitution` scaffolds a project
  copy of this registry into `AGENTS.md` / `CLAUDE.md` as plain Markdown — identical handling across
  Claude Code, OpenCode, and Google Antigravity.
- **Per-project override.** Edit the registry inside your project's `AGENTS.md` / `CLAUDE.md` to
  pin different models; this package's copy is only the default.
