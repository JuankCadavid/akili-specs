# Execution Log: Guardrails and Evals for AI Agents

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/ai-agent-guardrails-evals` |
| Depth | Standard |
| Approval Mode | `gated` (inherited from `requirements.md`). Every task closes at a continue gate. HALT, Pivot, budget tripwire, waiver and an unearned skip always stop |
| Started | 2026-11-14 |
| Started at | `be917bb` (clean tree, branch `feat/ai-agent-guardrails-evals`) |
| Budget (design §12) | 13 tasks · ≈ 900 LOC · ≈ 22 review rounds. Tripwire: exceeding any of these. Compared at every task's finalize |
| Leader | Claude Code session model Opus 5.5 (`claude-opus-5-5`). Model checkpoint: `AGENTS.md` has no `## Model Routing` registry section. The `docs/model-routing.md` default maps T1 → `opus`, which matches the session, so it passes |
| Spawn path | No Step 8E wrappers (`.claude/agents/` absent) → fallback sub-prompt path. Each worker reads its persona from `.agents/`. `node bin/akili.js doctor --agents` (2026-11-14): "No persona drift blocking CI" |
| Models | Implementer `sonnet` (T2). Reviewer `opus` (T3, ≠ Implementer) |
| Environment pre-check (Step 2.1) | No task needs a running stack. T1 and T2 need web access to fetch official sources (WebFetch) |
| Commits | Local only, `[SPEC:changes/ai-agent-guardrails-evals]` prefix. No push, PR, merge, tag or publish |

## 2. Task Execution History

### T1 — Author `references/guardrails.md` — PASS

- **Date:** 2026-11-14 · **Attempts:** 1 · **Status:** PASS
- **Requirements covered:** FR-1 (S1, S2, S3, all clauses), NFR-2, NFR-3, NFR-4, NFR-5
- **Attempt 1**
  - Files changed: `.claude/skills/ai-agent-development/references/guardrails.md` (new, 133 lines, 12,277 B)
  - Skills: `ai-agent-development`, `cognitive-doc-design`, `security-audit` (guidance mode), the same as tasks.md, so no deviation. Effort: high. Ran in parallel with T2, which touches different files and shares no build state
  - P-14 settled (sources fetched 2026-11-14):
    - Anthropic *Mitigate jailbreaks and prompt injections*: `docs.anthropic.com` answered with a 301 to `platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks`. The new URL is cited.
    - Amazon Bedrock Guardrails user guide: cited as a vendor example only.
    - OWASP Top 10 for LLM Applications 2025 (`genai.owasp.org/llm-top-10/`): labeled as a standard.
    - OWASP project page: cited as the project page only.
    - No claims were dropped. The LangSmith source belongs to T2.
  - Implementer verification:
    1. The §9.1 walk finds every heading in order: Defense in depth, Layers 1–4, Voice specifics, From guide to spec, Sources. `Last verified: 2026-11-14` is at line 3.
    2. `grep -c "> Unvalidated:"` → 7.
    3. `wc -lc` → `133 12277`.
    4. The legal-drift grep has one hit, `:120`, where "act" is a verb.
    5. All sources were fetched this task.
  - Falsifiers executed (observed red, which closes the greenfield prediction):
    - F1 appended "Under the Example Statute, two-party consent is required". The grep printed `134:Under the Example Statute, two-party consent is required`.
    - F2 deleted `Last verified:`. `grep -c "^Last verified: "` → `0`.
    - Both were reverted (133 lines, 12,277 B).
  - Not Done / Assumptions (verbatim, condensed):
    - "LangSmith evaluation concepts… belongs to T2."
    - "The example `BUT it must NOT` clauses in the 'From guide to spec' table are illustrative wording that I wrote."
    - "The only legal-drift grep hit is 'act' used as a verb."
    - These are assumptions only, with no owed item, so no continuation.
  - Evidence re-run (Leader-inline): **VERIFIED**. `wc -lc` gave `133 12277`, the marker count was 7, the same single grep hit at `:120`, the same headings.
  - Reviewer (`opus`): **PASS**. "guardrails.md covers every FR-1 clause across all three scenarios and follows the §9.1 sections in order. Each of the three cited sources supports the claims made from it: I fetched all three pages myself on 2026-11-14." The Reviewer re-ran `wc`, the legal grep and `git diff --check` (clean).
  - ADVISORY (4R, recorded, never gating):
    - Readability, `:11`: the quoted "layering" suggests the source lists the three items together. Suggested wording: "advises combining strategies, closing on layering them [1]".
    - Reliability, `:85`: "Always honored; never argue the caller out of it" is a product stance stated as settled practice.
    - The report was truncated after this point. The remaining advisories were not retrieved because they don't gate.
  - spawns: Implementer (sonnet): not reported by host, ended complete. Reviewer (opus): not reported by host, ended complete.
- **Decisions made:** none beyond the brief.
- **Running totals vs budget:** 1/13 tasks · ≈ 133 LOC / ≈ 900 · 1/≈ 22 review rounds. Within budget.

### T2 — Author `references/evals.md` — PASS

- **Date:** 2026-11-14 · **Attempts:** 1 · **Status:** PASS
- **Requirements covered:** FR-2 (S1–S4, all clauses), NFR-2, NFR-3, NFR-4, NFR-5
- **Attempt 1**
  - Files changed: `.claude/skills/ai-agent-development/references/evals.md` (new, 145 lines, 12,761 B)
  - Skills: `ai-agent-development`, `cognitive-doc-design`, the same as tasks.md, so no deviation. Effort: high. Ran in parallel with T1
  - P-14 (eval sources, fetched 2026-11-14):
    - Anthropic *develop-tests*: `docs.anthropic.com` answered with a 301 to `platform.claude.com/docs/en/test-and-evaluate/develop-tests`. The new URL is cited. The first ~100k characters were read; the remainder is code examples.
    - LangSmith *Evaluation concepts*: fetched OK.
    - Judge calibration is not sourced. It is stated as an AKILI requirement and flagged in Sources.
  - Implementer verification:
    1. The §9.2 walk finds every section in order. It adds a "Decision index" and a "Putting it in the spec" table.
    2. The number grep has one hit, `:104` ("2% of calls per week"), inside a `> Unvalidated:` block. There are 5 markers. "p50 and p95" was read by hand and is covered.
    3. `wc -lc` → 145 lines, 12,761 B.
    4. The no-pass section points to mapping §3 and adds the judge/rubric/prompt-change and audio-pipeline conditions.
    5. All sources were fetched this task.
  - Falsifiers executed (observed red, which closes the greenfield prediction):
    - Deleting the labeling sentence took the exact phrase "running the agent and accepting what it produced" from 1 match to 0. The FR-2 walk fails at the BUT clause.
    - Appending "p95 latency under 800 ms" got it flagged at line 146.
    - Both were reverted, and `cmp` shows the file identical.
  - Not Done / Assumptions (verbatim, condensed):
    - "The voice metric definitions… are AKILI's own, not taken from a fetched source."
    - "I did not edit `SKILL.md`; T3 adds the router row."
    - These are assumptions only, so no continuation.
  - Evidence re-run (Leader-inline): **VERIFIED**. `wc -lc` gave `145 12761`, the marker count was 5, the same single number hit at `:104`, the same headings, and the phrase count was 1.
  - Reviewer (`opus`): **PASS**. "`evals.md` meets every FR-2 clause, the §9.2 section order, NFR-2 to NFR-5 and T2's checks. I re-fetched both sources and found all 11 cited claims verbatim." The two additions follow the exemplar and do not widen scope.
  - ADVISORY (4R, recorded, never gating):
    - Readability, `:135`: "adds two conditions", but the judge-change condition already exists in mapping §3. Consider "restates one and adds one".
    - Reliability: the re-score trigger at `:62` names "judge, rubric or scoring code", while the no-pass bullet at `:137` names "judge, rubric or prompt". The lists disagree.
    - Risk (truncated): concerns where design §9.2's "2% of calls" example sits. The rest was not retrieved because it doesn't gate.
  - spawns: Implementer (sonnet): not reported by host, ended complete. Reviewer (opus): not reported by host, ended complete.
- **Decisions made:** T2 was finalized after the T1 gate question was posed, because T2 was already in flight when that question was asked. No new task was started.
- **Running totals vs budget:** 2/13 tasks · ≈ 278 LOC / ≈ 900 · 2/≈ 22 review rounds. Within budget.
