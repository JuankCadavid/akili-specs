# Tasks: Re-baseline the default Model Routing registry on cost-per-quota

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/model-routing-cost-rebaseline` |
| Depth | Lite |
| Type | Change |
| Approval Mode | `gated` |
| Status | Approved (user, 2026-09-17) |
| Date | 2026-09-17 |
| Budget (design §9) | 2 tasks · ~160 lines · 1 review round per task + 1 reserved (pin precision) |
| Design review | Step 2.3 reversion challenge run (R1–R7; R3/R4 fixed via DD-8 and surface row 11); judgment-day not run (user chose Continue) |
| Commit prefix | `[SPEC:changes/model-routing-cost-rebaseline]` |

## 2. Task Graph

```
T1 (docs/model-routing.md: table, prose, effort map, examples, runbook, cross-host)
 └─→ T2 (constitution Step 8C/8E defaults, mirror parity, CHANGELOG)
```

T2 follows T1 because its slugs and wording are copied from T1's final table. No parallelism.

**Global verification caveat.** Every grep below is a presence-assertion: it proves text landed or text left, not that a project scaffolded from it behaves correctly. The behavioral substitute is the closing HITL check (NFR-3): scaffold Step 8C in a scratch project and run `/akili-audit` Model Registry Drift against it.

**Source-of-truth rule (KZ-001/KZ-002).** The maintainer's screenshots are not a source. Every figure and slug is re-read from <https://opencode.ai/docs/go> and `agy models` on the edit date and pinned with that date. A pin whose URL/command was not opened/run during the task is not a pin — record the fetch/run in the report.

---

### T1 — `docs/model-routing.md`: table, prose, effort map, examples, runbook, cross-host

| Field | Value |
|---|---|
| Status | `[~]` |
| Size | M |
| Depends on | none |
| Requirements | FR-1 (scenario, all clauses), FR-2 (scenario, all clauses — registry half), FR-3 (scenario, all clauses), FR-4 (scenario, all clauses), NFR-1, NFR-5 |
| Design refs | §5.1, §5.2, §5.3, §6.1 (R1–R6), §7 rows 1–4, 9–12, DD-1..DD-6, DD-8 |

**Scope.** `docs/model-routing.md` only:

- *Model registry*: replace the tier table with design §5.1 (all six rows, five columns + Fallback); "Registry updated: 2026-09"; under the table one sentence stating that each OpenCode cell carries its own per-model monthly dollar limit and its **requests per month** (the page also shows a per-5-hour column — never mix them), the V4.1 Flash 4× promo (to $60, ends 2026-09-20) noted separately from its $15 baseline, plus the three pins (plan page; `agy models`; Codex models page).
- *Why these models*: rewrite the OpenCode, Antigravity and Codex paragraphs per §5.3; keep the Claude Code and *Rate limits are per-generation* paragraphs byte-identical; keep the GLM 5.1→5.2 worked-example parenthetical as history (row 10); T6 bullet carries the DD-8 "Exp on the plan ≠ research preview" sentence and the cross-host note; drop every unpinned benchmark figure (FR-4 list).
- *Effort dial*: add the §5.2 dial → Antigravity ID map (three lines). Do **not** touch the GPT-5.6 Sol table in that section (R6 scope guard).
- *Enforced routing*, *How to apply per tool*, *Cross-host dispatch*, *Frontier escalation*: replace example slugs with the new ones; cross-host vision line → Gemini 3.8 Flash (High) `<CONFIRM ID>` vision; drop "best of the four" → "confirm per project" (row 11).
- Codex paragraph + plan-gating clause: Terra/Luna default pair, Sol/Astra as plan-permitting upgrades (row 12); keep the `<CONFIRM SLUG>` T4/T6 qualifiers and the existing models-page pin.
- *Replacing a model* runbook example → a model in the new table (row 9).

**Verification.**
1. Fetch <https://opencode.ai/docs/go> and run `agy models` on the edit date; paste both lists in the report. Every OpenCode cell slug ∈ page list; every Antigravity ID ∈ `agy models` output. Falsifier: a cell whose slug/ID is in neither list (e.g. `deepseek-v4.1-pro`).
2. Table read by eye: T2 ≠ T3 in every column, inequality stated in the T3 cells (OpenCode Pro vs Flash; Antigravity Pro vs Flash; Codex Terra vs Luna). Falsifier: identical T2/T3 slug in any column.
3. `grep -nE "[0-9]" docs/model-routing.md | sed -n '/### Why these models/,/### Frontier escalation/p'` — every line with a digit is a pinned sentence, a tier/version label, or the kept GLM history line. Falsifier: `GPQA|SWE-bench|Terminal-Bench|tok/s|\$/task|Intelligence ~` surviving in that range (`grep -nE` must return 0).
4. `grep -n "kimi-k3\|glm-5\.2\|qwen3\.7-max\|gpt-6-astra\|Gemini Pro (latest)\|Gemini Pro, vision\|best of the four\|default Astra/Sol" docs/model-routing.md` — every surviving hit is a pinned Fallback mention, the row-10 history line, or a "was" sentence; none is a default cell. Falsifier: a hit inside the tier table rows.
5. `diff <(git show HEAD:docs/model-routing.md | sed -n '/^\*\*Claude Code\.\*\*/,/^\*\*OpenCode Go\.\*\*/p') <(sed -n '/^\*\*Claude Code\.\*\*/,/^\*\*OpenCode Go\.\*\*/p' docs/model-routing.md)` empty (Claude Code + rate-limits paragraphs unchanged). Falsifier: any diff line.
6. `grep -n "Last verified: 2026-09" docs/model-routing.md` ≥ 3 new pins (plan page; `agy models`; cross-host/T6). `git diff --check` clean.

**Disqualifiers.** Check 1 passing because the page fetch was skipped and the list typed from the screenshot is not evidence — the fetched list must be in the report. Check 3 passing because a figure was moved into the *Effort dial* section instead of pinned or removed is not a pass. Check 4 is presence-only: it cannot tell a "was" sentence from a default; the Reviewer reads the table rows.

**Done.** All scope bullets land; checks 1–6 with disqualifiers; the row-9/10/11/12 sites edited; Claude Code column and paragraphs untouched.

**Skills.** `cognitive-doc-design` (tables over prose; lead with the metric).

---

### T2 — Constitution Step 8C/8E defaults, mirror parity, CHANGELOG

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S |
| Depends on | T1 |
| Requirements | FR-2 (Step 8C half: `agy models` confirmation, effort in the ID), FR-5 (scenario, all clauses), NFR-2, NFR-4, NFR-5 |
| Design refs | §5.2, §6.1 (R7), §7 rows 5–8, DD-3, DD-7 |

**Scope.**
- `.claude/commands/akili-constitution.md` Step 8C: Antigravity family wording → "Gemini 3.8 Flash (effort in the ID: `-high/-medium/-low`) / Gemini 3.1 Pro"; confirmation command `agy models`; reference the dial → ID map. Step 8E default OpenCode slugs: leader/reviewer `opencode-go/deepseek-v4-pro`, implementer `opencode-go/deepseek-v4.1-flash`, tester `opencode-go/deepseek-v4-flash`, with the R7 clarifying clause (Leader and Reviewer share the T1/T3 model; author ≠ auditor is Implementer vs Reviewer).
- `docs/commands/akili-constitution.md`: content parity for both edits (condensed prose; carry the slugs and the `agy models` fact).
- `CHANGELOG.md` Unreleased → Changed (patch): the metric, old → new picks per host (OpenCode kimi-k3/glm-5.2/qwen3.7-max → deepseek-v4-pro/v4.1-flash/vision-exp; Antigravity Pro → 3.8 Flash with Pro 3.1 as auditor; Codex Astra/Sol defaults → Terra/Luna with Sol as upgrade), the $60 assumption, and that `/akili-audit` will report drift on registries scaffolded before this release until Step 8C is re-run.

**Verification.**
1. `grep -n "kimi-k3\|glm-5\.2\|qwen3\.7-max\|gpt-6-astra" .claude/commands/akili-constitution.md docs/commands/akili-constitution.md README.md docs/README.md .claude/README.md` — zero hits as defaults (a "was" sentence is allowed only inside the CHANGELOG). Falsifier: `kimi-k3` surviving in the Step 8E default list.
2. `grep -n "deepseek-v4\.1-flash\|deepseek-v4-pro\|agy models" .claude/commands/akili-constitution.md docs/commands/akili-constitution.md` — Step 8E defaults and the `agy models` confirmation present in both files. Falsifier: the mirror missing either.
3. Mirror fact parity: every Codex/Antigravity/OpenCode fact stated in the constitution edits appears in the mirror with the same qualifiers (`<CONFIRM ID>`, "where the plan exposes it"); a mirror sentence stronger than its source is a FAIL (KZ-001 class — the codex spec's T6 pattern).
4. `grep -n "^model:" .claude/commands/*.md` empty (NFR-2). `git diff --stat` shows no `bin/` or `scripts/` change (NFR-4). `git diff --check` clean.
5. CHANGELOG entry present under Unreleased, says "patch", names the drift consequence. Falsifier: `grep -n "Model Registry Drift\|stale" CHANGELOG.md` in the Unreleased block empty.

**Disqualifiers.** Checks 1–2 are presence-assertions; the Step 8C text's executability (can an agent confirm an Antigravity ID from it?) has no automated check — substitute: the closing HITL scratch scaffold (NFR-3), where the user or Leader runs Step 8C by hand and `/akili-audit` compares the result against `docs/model-routing.md`; a non-empty drift table on a fresh scaffold means T1/T2 disagree and reopens T2.

**Done.** Constitution, mirror and CHANGELOG land; checks 1–5; NFR-3 scratch check recorded in `execution.md` (PASS, or the drift delta if it fails).

**Skills.** `cognitive-doc-design`.

---

## 3. Coverage Closure (scenario / clause → owning task)

| Requirement | Scenario / clause | Owner |
|---|---|---|
| FR-1 | Every cell a live slug with pinned quota (THEN, AND T2≠T3, AND non-DeepSeek fallback, BUT no old defaults, AND IT MUST T4 `<CONFIRM>` + T6 Exp) | T1 (checks 1, 2, 4; T6 bullet) |
| FR-2 | Roster-confirmed IDs, distinct auditor (THEN IDs ∈ `agy models`, AND Pro ≠ Flash, AND Sonnet 4.6 upgrade + why not Pro, BUT no benchmark ranking, AND IT MUST dial → ID map) | T1 (checks 1, 2, 3; *Effort dial* map); Step 8C half → T2 (check 2) |
| FR-3 | Selectable on a ChatGPT account (THEN no Astra default + Terra/Sol + Terra ≠ Luna, AND plan-gating paragraph kept, BUT `<CONFIRM SLUG>` kept, AND IT MUST models-page pin kept) | T1 (check 2, 4; row 12) |
| FR-4 | No number without a source (THEN pinned/label/gone, AND metric + $60 + $30 sentence, BUT no benchmark language, AND IT MUST Claude paragraphs unchanged) | T1 (checks 3, 5) |
| FR-5 | One source, no orphaned old pick (THEN grep over six files, AND Step 8E slugs, BUT no `model:`, AND IT MUST CHANGELOG drift note) | T2 (checks 1, 2, 4, 5) |
| NFR-1 | Alias-first / Claude column untouched | T1 (check 5) |
| NFR-2 | No `model:` frontmatter | T2 (check 4) |
| NFR-3 | Fresh scaffold agrees with the default | Closing HITL check (T2 Done) |
| NFR-4 | No code | T2 (check 4) |
| NFR-5 | Claims dated | T1 (check 6), T2 (check 3) |

No clause is discharged by citing a different requirement.

## 4. Estimated LOC and PR Strategy

| Bucket | Lines |
|---|---|
| `docs/model-routing.md` | ~110 |
| Constitution + mirror | ~25 |
| CHANGELOG | ~15 |
| **Total** | **~150–160** (design §9) |

Direct-to-master `[SPEC:…]` commits (repo release flow); one commit per task. No PR split needed.

**Recommended first task:** T1.
