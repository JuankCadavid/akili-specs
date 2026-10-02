## Model Routing

**Criteria first, model second:** each phase declares what it needs, the tier names that need, and only the registry below names models. Principles: match the dominant demand; ARCHITECT = BUILDER; **author ≠ auditor**; reserve deep reasoning for propose, specify, verify, **and the orchestrating Leader**; fast & cheap for archive and formatting only — **`tasks.md` decomposition is T1, not cheap formatting**.

### Capability tiers

| Tier | Definition |
|---|---|
| **T1 Architect** | Deep reasoning for architecture, trade-offs, intent, **task decomposition**, and **live orchestration judgment** (decomposition in flight, runtime skill selection, FAIL adjudication, pivot). |
| **T2 Coder** | Maximum coding throughput and instruction-following for writing and editing code and tests. |
| **T3 Auditor** | Independent critical review — conformance, bug-finding, drift; must differ from the author model. |
| **T4 Context-Ingest** | Large-context absorption of legacy codebases and baseline docs — window size over depth. |
| **T5 Fast-Cheap** | Cheap, fast structured formatting and summarization. |
| **T6 Multimodal** | Visual / UI-UX reasoning over images, screenshots, and design references. |

### Phase → tier mapping

| Phase / Role | Tier(s) |
|---|---|
| `/akili-constitution` | T4 + T1 |
| `/akili-propose` | T1 |
| `/akili-quick` | T2 |
| `/akili-specify` → requirements.md / design.md / tasks.md | T1 |
| `/akili-specify` → UX/UI design | T6 |
| `/akili-execute` → **Leader** (writes no code; selects skills, adjudicates FAILs, decides pivots) | T1 |
| `/akili-execute` → **Implementer** | T2 |
| `/akili-execute` → **Reviewer** | T3 |
| `/akili-execute` → **Verifier** (evidence re-run) | T5 |
| `/akili-test` → **Leader** (orchestration; writes no tests) | T1 |
| `/akili-test` → **Tester(s)** (test authoring) | T2 |
| `/akili-validate` | T3 |
| `/akili-audit` | T4 + T3 |
| `/akili-archive`, `/akili-resume` | T5 |
| `/akili-seo` | T3 + T5 |

**The Reviewer model MUST differ from the Implementer model** (author ≠ auditor): T2 and T3 resolve to different concrete models; if they collapse, escalate the Reviewer one tier. Prefer a Tester model different from the Implementer's (author ≠ tester).

### Model registry

Updated: {{updated}}

**Alias-first rule:** the Claude Code column uses floating aliases (`opus`, `sonnet`, `haiku`), so it survives model churn with zero edits. Pin a dated model ID only when you deliberately want to freeze a version, and record why next to the pin. OpenCode slugs are concrete (no alias mechanism); a roster that is unknown takes a `<CONFIRM SLUG>` placeholder rather than a guess.

{{registryTable}}

{{pinReasons}}

**Antigravity** names the family and effort ID: Gemini 3.8 Flash for the volume tiers, Gemini 3.1 Pro as the T3 auditor, confirmed with `agy models`. Dial → ID map:

{{antigravityDialMap}}

**Codex** names a tier family (Astra, Sol, Terra, Luna); the exact slug for the wrapper's `model =` is confirmed against the project's own `/model` roster **and account plan** — Astra and Sol are plan-gated. Where they are gated, keep author ≠ auditor with Reviewer `gpt-5.6-terra` ≠ Implementer `gpt-5.6-luna`.

**Cursor** names a tier family, not a slug — the roster is multi-vendor with no floating alias besides `auto`. Confirm the exact ID against the `/model` picker in the `agent` CLI; an effort parameter maps the dial as `low`→`[effort=low]`, `medium`→`[effort=medium]`, `high`/`xhigh`/`max`→`[effort=high]` `<CONFIRM>`; a model whose picker shows no effort parameter takes no bracket.

**Every host column stays, including hosts this session is not running in** — the registry belongs to the project, not to the session that wrote it. An unknown roster is a `<CONFIRM SLUG>` placeholder, never a dropped column.

{{authorAuditorNotes}}

**CLI invocation per host** (confirmed with the user, never probed; unconfirmed values stay `<CONFIRM>`):

{{cliInvocationRow}}

**Cross-host dispatch:** {{crossHostLine}} The line records the routing preference only, never the dispatcher. Reach across hosts before degrading within one, but only for a real capability gap — a cross-host spawn costs a fresh context, which a one-tier difference does not repay.

To change models, re-run `akili routing` — it regenerates only this fenced section — or remove the fence and edit the table by hand. Never pin a dated model name where a floating alias exists. Never add `model:` to command frontmatter; enforced bindings live only in the Step 8E agent wrappers.

{{regenerateHint}}

**Rate limits are per-generation, not per-family:** a new top-tier generation draws on its own quota, so moving T1/T3 onto it neither frees nor inherits headroom. **A frontier escalation pin** (e.g. `claude-fable-5` on T1/T3) is re-justified whenever the `opus` alias advances a generation: try the alias at `xhigh`/`max` before renewing the pin, and record the reason for the pin.

### Effort dial

Effort is the second, **per-task** routing dimension, orthogonal to the tier: the tier picks the model, effort picks how hard it thinks on *this* task. The `/akili-execute` and `/akili-test` Leaders read this subsection to set each worker's effort.

| Signal | Effort |
|---|---|
| Trivial / mechanical (copy, rename, style) | `low` |
| Standard task, clear scope | `medium` |
| Complex (algorithm, concurrency, security, ambiguity) | `xhigh` |
| Correctness-critical (can't be wrong, hard to revert) | `max` |

| Role / Phase | Default effort |
|---|---|
| T1 `/akili-propose` / `/akili-specify` / **Leader** | `high` |
| T2 **Implementer / Tester** | `medium` — flex by task |
| T3 **Reviewer** / `/akili-validate` | `high` |
| T5 `/akili-archive` / setup steps | `low` |

- **Rework:** bump effort one level on every retry.
- **Tier ↔ effort:** never `max` a cheaper tier — escalate the tier instead.
- **Re-baseline:** effort defaults are per-generation — sweep them (`medium`/`high`/`xhigh` on a real spec) whenever the model generation changes; the tier mapping survives churn, these defaults do not. A task that arrives under-specified (a `[~]` resume or a post-Pivot retry) starts one level higher.
- **Effort is not a verbosity dial:** lowering effort does not reliably shorten output — fix long reports in the brief (`caveman` / `cognitive-doc-design`), never by dropping effort.
