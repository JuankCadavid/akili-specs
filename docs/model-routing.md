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
- **Reserve deep-reasoning for propose & verify.** The most expensive reasoning models earn their
  cost on architecture (`/akili-propose`) and final audit (`/akili-validate`, Reviewer), not on
  bookkeeping.
- **Fast & cheap for tasks & archive.** Partitioning a spec into tickets and summarizing closed
  work are format-following jobs — speed and cost dominate; raw intelligence adds little.

## Capability tiers

Six tiers cover the genuinely distinct demands across the AKILI-SPECS pipeline without proliferating one
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

The `/akili-execute` triad is split because each role has a different demand — and because
author ≠ auditor makes the Implementer/Reviewer split a **correctness constraint**, not a
preference. `/akili-test` is split the same way: a cheap Leader orchestrates while T2 Testers author
the suites, and a Tester ideally runs on a different model than the Implementer (author ≠ tester).

| Phase / Role | Tier(s) | Why |
|---|---|---|
| `/akili-constitution` | T4 + T1 | Ingest legacy code (long context), then reason to synthesize the baseline. |
| `/akili-propose` | T1 | Architecture and trade-offs — reserve the deep reasoner. |
| `/akili-quick` | T2 | A small, direct edit + light verification — no deep reasoning needed. |
| `/akili-specify` → requirements.md / design.md | T1 | Heavy reasoning + technical writing. |
| `/akili-specify` → tasks.md | T5 | Fast structured partitioning into tickets. |
| `/akili-specify` → UX/UI design | T6 | Only when visual design is in scope. |
| `/akili-execute` → **Leader** | T5 | Orchestration / instruction-following — writes no code. |
| `/akili-execute` → **Implementer** | T2 | Maximum coding. Shares the workhorse family with propose (ARCHITECT = BUILDER). |
| `/akili-execute` → **Reviewer** | T3 | Independent audit. **MUST resolve to a different model than the Implementer.** |
| `/akili-test` → **Leader** | T5 | Orchestration — partitions suites and delegates; writes no tests. |
| `/akili-test` → **Tester(s)** | T2 | Test authoring + verification per suite. Prefer a different model than the Implementer (author ≠ tester). |
| `/akili-validate` | T3 | Deep conformance audit. |
| `/akili-audit` | T4 + T3 | Drift detection over large context, judged critically. |
| `/akili-archive` | T5 | Cheap, fast summarization of closed work. (Kaizen Learn sub-step: T3 optional.) |
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
| **T1 Architect** | `opus` *(alias — always latest)* | `opencode-go/kimi-k2.6` | `opencode-go/deepseek-v4-pro` / `sonnet` |
| **T2 Coder** | `sonnet` | `opencode-go/glm-5.1` | `haiku` / `opencode-go/qwen3.7-max` |
| **T3 Auditor** | `opus` *(must differ from T2)* | `opencode-go/deepseek-v4-pro` | `sonnet` / `opencode-go/kimi-k2.6` |
| **T4 Context-Ingest** | `sonnet` (long context) | `opencode-go/deepseek-v4-flash` | `opus` / `opencode-go/deepseek-v4-pro` |
| **T5 Fast-Cheap** | `haiku` | `opencode-go/deepseek-v4-flash` | `sonnet` / `opencode-go/mimo-v2.5` |
| **T6 Multimodal** | `sonnet` (vision) | `opencode-go/qwen3.7-max` *(weak — prefer Claude/Gemini)* | `opus` |

### Why these models

**Claude Code.** The top-family alias (`opus`) carries the tightest plan rate limits, so it is
**reserved for T1 (propose, specify reasoning) and T3 (validate, review)** — the two phases that
most reward deep reasoning. **`sonnet` is the workhorse** for coding (T2), large-context ingestion
(T4), and vision (T6). **`haiku`** handles fast/cheap formatting, orchestration, and summarization
(T5). This concentrates the scarce top-tier budget on architecture and audit and avoids exhausting
it during execution-heavy work. Because these are aliases, the mapping survives model generations
unchanged (e.g. when the top family moves from one generation to the next, `opus` follows it).
Users on plans that expose additional tiers (e.g. a Mythos-class model above Opus) can pin it for
T1/T3 in their project registry.

**OpenCode Go.** The two strongest open models anchor the two highest-leverage tiers:

- **GLM-5.1 → T2 Coder.** The highest-rated open-source model overall (58.4% SWE-Pro, ahead of
  GPT-5.4 and Claude Opus 4.6) and purpose-built for long autonomous coding runs. It is the
  recommended **default OpenCode workhorse** and universal fallback when no specialized model is
  preferred.
- **Kimi K2.6 → T1 Architect.** One of the best open models (58.6% SWE-Pro, tied with GPT-5.5); its
  Agent Swarm is built for multi-step decomposition — ideal for architectural trade-off reasoning
  and `/akili-explore`-style impact analysis.
- **DeepSeek V4 Pro → T3 Auditor.** 1M context + a "Think Max" reasoning mode, and crucially a
  *different* model than the GLM-5.1 coder — satisfying author ≠ auditor for `/akili-validate` and the
  Reviewer.
- **DeepSeek V4 Flash → T4 / T5.** 1M context, fastest and cheapest, highest rate limit — right for
  bulk ingestion and high-frequency formatting.
- **Qwen3.7 Max → T6.** Best-effort only. Open-source multimodal is weak; for real UI/UX design work
  prefer Claude Sonnet (vision) or an external Gemini model.

All OpenCode Go slugs are taken from the [OpenCode Go model list](https://opencode.ai/docs/go).
Confirm them against your own OpenCode configuration and adjust if your roster differs.

## Enforced routing (tool-native agent bindings)

The `/akili-execute` and `/akili-test` fan-out (Implementer, Reviewer, Testers) is where most
tokens are spent — and a generic subagent **inherits the session model**, which silently breaks
author ≠ auditor when the whole session runs on one model. Both tools support a `model` field on
**agent definitions** (never on commands), so `/akili-constitution` Step 8E binds the personas
there:

| Tool | Native agent location | Model value |
|---|---|---|
| Claude Code | `.claude/agents/akili-{leader,implementer,reviewer,tester}.md` (project-level) | Alias from the registry (`model: sonnet`, `model: opus`, `model: haiku`) |
| OpenCode | Project agent config (`.opencode/agent/*.md` or the `agent` block of `opencode.json`, per your OpenCode version) | Provider slug from the registry (`model: opencode-go/glm-5.1`) |
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

## How to apply per tool

- **Claude Code:** switch with `/model` before running a phase — e.g. `/model opus` for
  `/akili-propose` and `/akili-validate`, `/model sonnet` for `/akili-execute` and `/akili-test`,
  `/model haiku` for the tasks split and `/akili-archive` — or simply respond to each command's
  model checkpoint. With Step 8E bindings in place, the execute/test triad routes itself
  (Implementer on `sonnet`, Reviewer on `opus`).
- **OpenCode:** select the `opencode-go/...` model for each phase per the registry, or use the
  Step 8E agent bindings. Keep the Reviewer/validator on a different model (`deepseek-v4-pro`)
  than the Implementer (`glm-5.1`).

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
