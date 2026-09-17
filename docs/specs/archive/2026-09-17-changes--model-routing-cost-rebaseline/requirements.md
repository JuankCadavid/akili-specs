# Requirements: Re-baseline the default Model Routing registry on cost-per-quota

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/model-routing-cost-rebaseline` |
| Depth | **Lite** — documentation only; the risk is claim accuracy, gated by greps against pinned sources and `/akili-audit` Model Registry Drift |
| Type | Change |
| Approval Mode | `gated` (inherited from `proposal.md`) |
| Status | Approved (user, 2026-09-17) |
| Date | 2026-09-17 |
| Source | `proposal.md` (approved 2026-09-17; Option A + A1; $60 per-model limit; Codex Terra default; Release Classification **patch**) |
| Format precedent | `docs/specs/changes/codex-install-target/requirements.md` — this repo has no `docs/specs/general-setup/` |

## 2. Executive Summary

The packaged default registry in `docs/model-routing.md` (and everything that copies from it: `/akili-constitution` Step 8C/8E defaults, the docs mirror) routes OpenCode Go to DeepSeek across all six tiers, Antigravity to Gemini 3.8 Flash with the effort variant in the ID (Gemini 3.1 Pro as the T3 auditor), and Codex to Terra/Luna with Sol as the plan-permitting upgrade. Every model cell is a slug or ID present on a pinned source; every quota figure is pinned to the OpenCode Go plan page; unpinned benchmark numbers leave the prose. Author ≠ auditor (T2 ≠ T3) holds in every column.

## 3. Glossary

| Term | Meaning |
|---|---|
| **Per-model limit** | OpenCode Go's monthly dollar cap per model ($15 / $30 / $60) inside the $10/month subscription; the plan page shows two columns — **requests per 5 hour** and **requests per month** — for what that cap buys. The registry uses the **monthly** column (Pivot Record T1: the proposal's figures were the 5-hour column) |
| **Registry default** | The tier table in `docs/model-routing.md` → *Model registry*, copied by `/akili-constitution` Step 8C into each project's `## Model Routing` |
| **Effort ID** | An Antigravity model identifier that includes the reasoning effort (`gemini-3.8-flash-high`) — the roster exposes effort as distinct IDs, not a separate dial |
| **Pin** | `Last verified: <date>` + URL (or the command that produced the roster, e.g. `agy models`) next to a claim |

## 4. System Context & Scope

| Surface | Edit |
|---|---|
| `docs/model-routing.md` | *Model registry* table (OpenCode, Antigravity, Codex, Fallback columns; "Registry updated" date); *Why these models* (OpenCode, Antigravity, Codex paragraphs); consistency lines in *Frontier escalation*, *Enforced routing*, *Cross-host dispatch*, *How to apply per tool* |
| `.claude/commands/akili-constitution.md` | Step 8C family wording ("Gemini Pro / Gemini Flash") and how Antigravity effort IDs are confirmed; Step 8E OpenCode default slugs |
| `docs/commands/akili-constitution.md` | Mirror at content parity |
| `CHANGELOG.md` | Unreleased → Changed, **patch** |
| Out of scope | `bin/akili.js`, `scripts/`, any project's scaffolded registry, tier definitions, the effort dial, the alias-first rule, the Claude Code column |

## 5. Stakeholders / Personas

| Stakeholder | Interest |
|---|---|
| OpenCode Go user | Defaults that do not exhaust a 110-request quota in a day |
| Antigravity user | The current top Flash as default; a genuinely different model auditing |
| Codex user on a ChatGPT account | Defaults the account can actually select |
| `/akili-constitution` | Scaffolds the new defaults; re-runs flag old ones as stale |
| `/akili-audit` | Compares projects against the new default; a wave of intended drift reports |

## 6. Functional Requirements

### FR-1: OpenCode Go column re-baselined on requests-per-month

The registry SHALL set the OpenCode Go column to `opencode-go/deepseek-v4-pro` (T1, T3), `opencode-go/deepseek-v4.1-flash` (T2, T4), `opencode-go/deepseek-v4-flash` (T5), `opencode-go/deepseek-v4-flash-vision-exp` (T6), SHALL give each cell its own per-model monthly dollar limit and its **requests-per-month** figure (the plan page's monthly column, never its per-5-hour column) pinned to the plan page, and SHALL note the `deepseek-v4.1-flash` 4× promo (to $60, ends 2026-09-20) separately from its $15 baseline (Pivot Record T1).

#### Scenario: Every cell is a live slug with a pinned quota

- GIVEN the OpenCode Go model list at <https://opencode.ai/docs/go> fetched on the edit date
- WHEN each OpenCode cell of the table is read
- THEN the slug appears verbatim on that page and the cell (or its *Why these models* bullet) carries the requests-per-month figure with `Last verified: <date>` + URL
- AND T3 (`deepseek-v4-pro`) differs from T2 (`deepseek-v4.1-flash`), stated in the cell
- AND the Fallback column names at least one non-DeepSeek OpenCode model per tier where one exists on the page (`glm-5.3-flash`, `mimo-v2.5`), so a vendor outage has an escape
- BUT it must NOT keep `kimi-k3`, `glm-5.2`, or `qwen3.7-max` as a default in any tier (the Fallback column may keep them only with their quota figure pinned)
- AND IT MUST mark T4 `<CONFIRM>` for context window unless a vendor page is pinned for it, and mark T6 as experimental ("Exp") with the cross-host dispatch note kept

### FR-2: Antigravity column names the family and the effort ID

The registry SHALL set Antigravity to Gemini 3.8 Flash with the effort variant per tier — T1 High, T2 Medium, T4 High, T5 Low, T6 High — and T3 to **Gemini 3.1 Pro (High)**; `/akili-constitution` Step 8C SHALL say the exact ID is confirmed with `agy models` and that the ID carries the effort.

#### Scenario: Roster-confirmed IDs, distinct auditor

- GIVEN the `agy models` output on the edit date
- WHEN each Antigravity cell is read
- THEN its family + effort maps to an ID present in that output (`gemini-3.8-flash-high`, `-medium`, `-low`, `gemini-3.1-pro-high`), with the roster pinned (`Last verified: <date>` — `agy models`)
- AND T3 is a different model family than T2 (Pro vs Flash), stated in the cell
- AND the prose names Claude Sonnet 4.6 (Thinking) as the preferred T3 upgrade where a plan exposes it, and says why Pro 3.1 is not the default family (two generations behind Flash 3.8 on the roster)
- BUT it must NOT claim any benchmark ranking for Flash vs Pro — the only stated basis is the roster generation and the maintainer's cost preference
- AND IT MUST explain how the five-rung AKILI Effort dial maps onto the three Antigravity effort IDs (`low`→Low, `medium`→Medium, `high`/`xhigh`/`max`→High)

### FR-3: Codex column limited to Terra / Luna / Sol

The registry SHALL set Codex to Terra (T1, T3, T4, T6) and Luna (T2, T5), SHALL name Sol as the plan-permitting upgrade for T1/T3, and SHALL remove Astra from the defaults.

#### Scenario: Selectable on a ChatGPT account

- GIVEN the plan-gating evidence from `changes/codex-install-target` T7 (Terra/Luna accepted; Astra/Sol "not supported when using Codex with a ChatGPT account", codex-cli 0.154.0, 2026-09-17)
- WHEN the Codex column is read
- THEN no default cell names Astra; T1/T3 say Terra with Sol as the upgrade "where the account plan allows"; T3 (Terra) differs from T2 (Luna), stated in the cell
- AND the existing plan-gating paragraph is kept and referenced, not duplicated
- BUT it must NOT delete the `<CONFIRM SLUG>` qualifiers on T4/T6 (no context-window/vision evidence exists)
- AND IT MUST keep the models-page pin (<https://learn.chatgpt.com/docs/models>) for the family names

### FR-4: Prose states only pinned or removed figures

*Why these models* SHALL be rewritten around the requests-per-month metric; every numeric claim (quota, price, benchmark, tok/s, context window) SHALL carry a pin or be removed.

#### Scenario: No number without a source

- GIVEN the edited `docs/model-routing.md`
- WHEN every line of *Why these models* containing a digit is inspected
- THEN each figure is either within a sentence carrying `Last verified` + a source, or is a tier/version label (T1…T6, 3.8, V4.1), or is gone
- AND the OpenCode paragraph opens with the metric (requests per month at each model's own limit) and names `deepseek-v4-flash` (65,000 @ $30) as the higher-volume alternative to `deepseek-v4.1-flash` (32,500 @ $15) in one sentence
- BUT it must NOT retain "GPQA", "SWE-bench", "Terminal-Bench", "tok/s", "$/task", "Intelligence ~46" or similar unpinned benchmark language from the current text
- AND IT MUST keep the Claude Code paragraph and the *Rate limits are per-generation* paragraph unchanged

### FR-5: Constitution defaults, mirror, and CHANGELOG follow the registry

`/akili-constitution` Step 8E's OpenCode default slugs and Step 8C's Antigravity family wording SHALL match the new table; `docs/commands/akili-constitution.md` SHALL carry the same facts (content parity; mirrors are condensed prose); `CHANGELOG.md` SHALL gain a patch entry naming old → new picks, the metric, and that existing project registries will show as stale.

#### Scenario: One source, no orphaned old pick

- GIVEN the finished edit
- WHEN `grep -n "kimi-k3\|glm-5\.2\|qwen3\.7-max\|gpt-6-astra\|Gemini Pro (latest)"` runs over `docs/model-routing.md`, `.claude/commands/akili-constitution.md`, `docs/commands/akili-constitution.md`, `README.md`, `docs/README.md`, `.claude/README.md`
- THEN every hit is either inside a pinned Fallback/upgrade mention, a historical CHANGELOG/releases line, or a "was" sentence in the runbook — never a default cell or a default slug
- AND Step 8E's default slugs read leader/reviewer `deepseek-v4-pro`, implementer `deepseek-v4.1-flash`, tester `deepseek-v4-flash`
- BUT it must NOT add `model:` to any command frontmatter (NFR-2)
- AND IT MUST record in the CHANGELOG that `/akili-audit` will report Model Registry Drift on projects scaffolded before this release until Step 8C is re-run (intended)

## 7. Non-Functional Requirements

| ID | Requirement | Verification |
|---|---|---|
| NFR-1 | **Alias-first preserved.** Claude Code column untouched; OpenCode slugs concrete by necessity, Antigravity/Codex families + confirm-per-project rule unchanged | `git diff` shows no Claude Code cell change |
| NFR-2 | **Host-neutral commands.** No `model:` in command frontmatter | `grep -n "^model:" .claude/commands/*.md` empty |
| NFR-3 | **Drift agreement.** A registry scaffolded by Step 8C from the new default is reported as in agreement by `/akili-audit` Model Registry Drift | Manual check at the closing HITL pause (scratch project) — no automated harness exists |
| NFR-4 | **No code.** `bin/akili.js`, `scripts/` untouched | `git diff --stat` |
| NFR-5 | **Claims dated.** Every new model/quota claim carries `Last verified` + source | FR-4 digit inspection |

## 8. Defect Classes → Gates

| Defect class | Gate | Falsifying input |
|---|---|---|
| A cell names a slug/ID not on its source | Compare each cell against the fetched page list / `agy models` output pasted into `execution.md` | A cell like `deepseek-v4.1-pro` (not on the page) |
| T2 = T3 in a column | Read the six-row table by eye; state inequality in the cell | Same slug in T2 and T3 |
| Unpinned number survives in prose | Grep lines with digits in *Why these models*; each must sit in a pinned sentence | A "SWE-bench 80.6" line without a source |
| Old default survives somewhere | FR-5 grep over the six files | `kimi-k3` in a default cell of the mirror |
| Mirror states a claim more strongly than the source | Fact-by-fact parity read (mirrors are condensed) | Mirror says "Pro is weaker" where the source says "older" |
| Fresh scaffold disagrees with the packaged default | **No automated check** — substitute: scratch project Step 8C + `/akili-audit` at the HITL pause | The audit's drift table showing a non-empty delta |
| Quota figure transcribed wrong from the screenshot/page | Re-read the plan page at edit time and pin it; the screenshot is not a source | A figure that the page does not show |

Accepted risk: the plan page's quotas change without notice; the pin turns that into visible staleness.

## 9. Requirement ID Index

| ID | Title | Owner surface |
|---|---|---|
| FR-1 | OpenCode column + quota pins | `docs/model-routing.md` |
| FR-2 | Antigravity family + effort ID; T3 Pro | `docs/model-routing.md`, constitution Step 8C |
| FR-3 | Codex Terra/Luna/Sol | `docs/model-routing.md` |
| FR-4 | Pinned-or-removed prose | `docs/model-routing.md` |
| FR-5 | Constitution defaults, mirror, CHANGELOG, old-pick sweep | constitution, mirror, CHANGELOG |
| NFR-1..5 | alias-first, host-neutral, drift agreement, no code, dated claims | cross-cutting |
