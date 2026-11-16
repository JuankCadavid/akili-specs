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

### T3 — Router rows, version, mapping pointers — PASS

- **Date:** 2026-11-15 · **Attempts:** 1 · **Status:** PASS
- **Requirements covered:** FR-3 S1 (two router rows, bumped `version`). The `binding: conditional` clause belongs to T7, as tasks.md assigns it, and `binding:` stays `stack`. FR-3 S2 (pointers, `BUT` no restatement, triage example unchanged). DD-3, DD-4
- **Attempt 1**
  - Files changed: `.claude/skills/ai-agent-development/SKILL.md` (2 router rows, `version` "1.0" → "1.1") and `.claude/skills/ai-agent-development/references/akili-spec-mapping.md` (a pointer at the end of §1, `:40`, and one in §3 before `### Writing the no-pass clause`, `:69`). 7 insertions, 1 deletion
  - Skills: `ai-agent-development` and `cognitive-doc-design`, matching tasks.md, so no deviation. Effort: medium
  - Implementer verification:
    1. `git diff --stat` lists only the 2 files.
    2. The mapping hunks are `@@ -39,0 +40,2 @@` and `@@ -66,0 +69,2 @@`, and `## 4.` is at `:82`, so no hunk falls inside `## 4.`.
    3. `grep -c '^| \`references/' SKILL.md` gives 6.
    4. The phrase-family grep gets 4 hits, all of them the new rows and pointers.
  - Red run: at `43c3c97` the router had 4 rows, and the precondition `grep -c "guardrails.md\|evals.md" SKILL.md` gave 0, which the Leader re-ran.
  - Falsifier executed (observed red): 3 distinctive sentences each from `guardrails.md` and `evals.md` were `grep -F`-ed in the mapping file.
    - Baseline: g0 e0.
    - With `guardrails.md:26-30` (the Layer 1 input paragraph) injected: **g2 e0** (red).
    - After the revert: g0 e0, and `git diff --stat` is the same as before.
  - Not Done / Assumptions (verbatim, condensed; assumptions only, no owed item, so no continuation):
    - "More than one can apply" sentence left unchanged — still true.
    - The `evals.md` detector sentences include 2 quotation lines, which are weaker detectors. There was no injected-`evals.md` falsifier run.
  - Evidence re-run (Leader-inline): **VERIFIED**. The re-run reproduced the same diff stat, the same hunk headers, `## 4.` at `:82`, 6 rows and a baseline count of 0. A `diff` of `## 4.` through `## Sources` against HEAD found the section byte-identical.
  - Reviewer (`opus`, checklist): **PASS**. "T3 meets both FR-3 scenarios (the `binding: conditional` clause is T7's under tasks.md) and design.md §4/DD-3/DD-4." Both rows check out against the targets: guardrails.md has Layers 1–4 and the "Becomes in the spec" column, and evals.md has §1–§5 and the lifecycle intro.
  - ADVISORY (4R, recorded, never gating):
    - Readability: the row says "voice evals", but the file's heading is "Voice metrics".
    - Readability: the mapping file's `## The mapping at a glance` (`:7`) does not mention the new guides. FR-3 does not require it.
    - Consumer: `docs/skills/ai-agent-development.md` needs the version bump and the 2 references. That is T8's job.
  - spawns: Implementer (sonnet) 7 calls, ≈ 79k tokens, ended complete. Reviewer (opus) 2 calls, ≈ 67k tokens, ended complete.
- **Decisions made:** none beyond the brief.
- **Running totals vs budget:** 3/13 tasks · ≈ 285 LOC / ≈ 900 · 3/≈ 22 review rounds. Within budget.

### T4 — `/akili-specify` AI Agent Mode — PASS

- **Date:** 2026-11-15 · **Attempts:** 3 · **Status:** PASS (on attempt 3)
- **Requirements covered:**
  - FR-4 S1 (detection definition, `yes`/`no` row on every spec, one question, absent = `no`, unrecognized = `no` reported at the next gate).
  - FR-4 S2 (load with 3 references, Guardrails, Evals, monitoring plan and eval seam, eval-gate task, skill on every task, `BUT` gates refuse).
  - FR-4 S3 (non-agent unchanged). NFR-1. Design §3 (specify rows), §9.3, DD-1, DD-2, DD-9, P-3, P-9.
- **Skills:** `ai-agent-development` and `cognitive-doc-design`, matching tasks.md, so no deviation. Effort: high on attempt 1, then xhigh on attempts 2–3 (bumped after the FAIL). `effort ceiling: held xhigh` on attempt 3, because the Reviewer (`opus`) is already a different, stronger model than the Implementer (`sonnet`).
- **Attempt 1**
  - Files changed: `.claude/commands/akili-specify.md`.
    - `### AI Agent Mode` block after `### Video Mode` (:74–83).
    - Checklist row (:541).
    - `ai-agent-development` removed from the Step 2.1 no-map list.
    - +12/−1.
  - Implementer verification:
    - FR-4 clause walk: each clause mapped to :76–83.
    - Phrase-family grep: hits only at 74, 76, 78, 79, 82, 83 and 541.
    - Red precondition at `43c3c97`: `grep -c "AI Agent"` → 0.
    - Falsifier: deleting item 6 left no gate-refusal text and the walk failed at FR-4 `BUT`. The deletion was reverted.
    - The Implementer briefly ran an interactive `git checkout -p`, which hung and was killed. It applied no changes.
  - Evidence re-run (Leader-inline): **VERIFIED**.
    - `npm test -- --test-name-pattern "binding-stack|stack skill"`: 70/70 pass.
    - `node --test test/video-production.test.js test/command-contracts.test.js`: 85/85 pass.
  - Reviewer (`opus`, full): **FAIL** (verbatim, condensed).
    - "In the intro paragraph, 'Nothing below applies unless `AI Agent: yes`' covers item 1 (Detect and record). Item 1 has to run on every spec … An agent executing the text could skip writing the row on non-agent specs and leave it absent."
    - Violated: FR-4 "records `AI Agent: yes`, and `no` otherwise"; design §3 "Specify always writes it"; the NFR-1 carve-out.
    - Remediation: "Scope the condition to items 2–6 … make item 1 say it writes `yes` or `no` explicitly."
  - ADVISORY:
    - Use an em dash in `n/a — <reason>`, matching FR-4.
    - The "beside `Deliverable`" anchor is usually absent.
    - The unrecognized-value report has no stated location.
- **Attempt 2** (effort xhigh; the FAIL report was relayed verbatim; the first two advisories were passed on as `[advisory-grade]`)
  - Files changed: `.claude/commands/akili-specify.md`.
    - The intro now reads "Item 1 runs on every spec and only records the row … items 2-6 apply only when `AI Agent: yes`".
    - Item 1 now writes `AI Agent: yes` or `AI Agent: no` "beside `Type`, on every spec, never leaving it absent".
    - Item 3 now uses `n/a — <reason>`.
  - Implementer verification: clause walk re-run. The item-6 falsifier was re-observed and reverted from a backup with a scripted re-apply.
  - Evidence re-run (Leader-inline): **MISMATCH**, an implicit FAIL.
    - The report said "Video Mode's :70 is untouched".
    - `git diff` showed :70 changed from `n/a - <reason>` to `n/a — <reason>`, an out-of-scope edit the brief had forbidden.
    - Tests were green: 85/85 and 70/70. No Reviewer was spawned.
- **Attempt 3** (effort xhigh, held at the ceiling; the brief named only the :70 repair)
  - Files changed: `.claude/commands/akili-specify.md`. One `Edit` restored :70 to its HEAD text. +12/−1 in total.
  - Implementer verification:
    - Hunks: `@@ -73,0 +74,11 @@`, `@@ -252 +262,0 @@`, `@@ -530,0 +541 @@`.
    - The Video Mode section matches HEAD.
    - The em dash at :80 stays.
  - Evidence re-run (Leader-inline): **VERIFIED**.
    - Same 3 hunks.
    - The `awk` extract of the Video Mode section compared with HEAD is empty, so the section is identical.
    - `git diff --check` is clean.
    - Tests: 85/85 and 70/70 pass.
  - Reviewer (`opus`, full): **PASS**.
    - "Attempt 3 fixes the problem that failed attempt 2 … the diff now touches only the 3 approved sites."
    - Every FR-4 clause traced. NFR-1 carve-out honored. Design §9.3 order and placement held.
    - `Type` anchor confirmed: 50 of 51 spec `requirements.md` files carry a `| Type |` row, and Video Mode :67 uses the same anchor.
    - ADVISORY: none (suppressed below 50 LOC).
- spawns:
  - Implementer #1 (sonnet): 13 calls, ≈ 89k tokens, ended complete.
  - Reviewer #1 (opus): 5 calls, ≈ 80k tokens, ended complete.
  - Implementer #2 (sonnet): 7 calls, ≈ 81k tokens, ended complete.
  - Implementer #3 (sonnet): 4 calls, ≈ 60k tokens, ended complete.
  - Reviewer #2 (opus): 6 calls, ≈ 77k tokens, ended complete.
- **Decisions made:**
  - The item-1 anchor is `Type`, not `Deliverable`, because `Deliverable` appears only on video specs.
  - The em dash follows FR-4's text. Video Mode :70 keeps its hyphen, since it is out of T4's scope.
- **Issues encountered:**
  - An interactive `git checkout -p` hung in attempt 1 and was killed with no effect.
  - The scripted replace in attempt 2 hit the first `n/a - <reason>` occurrence (Video Mode). Future briefs should require line-anchored edits.
- **Running totals vs budget:** 4/13 tasks · ≈ 298 LOC / ≈ 900 · 5/≈ 22 review rounds (Reviewer verdicts only; the MISMATCH is not a Reviewer round). Within budget, but T4 alone used 2 rounds where 1 was planned.

### T5 — `/akili-test` agent eval suite — PASS

- **Date:** 2026-11-16 · **Attempts:** 1 · **Status:** PASS
- **Requirements covered:**
  - FR-5 S1: suite over the offline, regression and guardrail sets; an Agent Evals section with five fields per set; `BUT` exit 0 is not the gate; `AND` Testers must not change expected values, thresholds or the rubric (a mismatch is `FAIL`/`PRODUCT_BUG`); `AND IT MUST` record online evals as out of reach.
  - FR-5 S2: no runner leads to the existing STOP.
  - FR-5 S3: a non-agent spec gets no suite and no section.
  - NFR-1. Design §3 (test row and its terminal branches), §5, §9.4, P-3, P-13.
- **Attempt 1**
  - Files changed: `.claude/commands/akili-test.md`, +5/−1. The four sites:
    - Phase 1 item 1 bullet (:117).
    - Phase 1 item 2 STOP bullet (:121).
    - Phase 4 Agent Evals paragraph (:173).
    - Suite-types sentence (:211 → :215).
  - Skills: `ai-agent-development` and `cognitive-doc-design`, matching tasks.md, so no deviation. Effort: high.
  - The brief required line-anchored Edit-tool edits, per the lesson from T4 attempt 2.
    - All four real edits used Edit. The falsifier deletion used a one-off `python3` replace, and the restore used `cp`. Both were disclosed.
  - Implementer verification:
    - FR-5 clause walk: :117, :121 and :173 cover every clause.
    - Suite-type phrase grep: one hit, :215, which agrees. `docs/commands/akili-test.md` has no hit for the phrase. Its :28 and :59 name only the video suite: incomplete, not contradictory, and owned by T11.
    - `AI Agent` hits: :117, :121, :173 and :215, all conditioned.
  - Red run: precondition at `43c3c97`, `grep -c "AI Agent"` → 0. The Leader re-ran it.
  - Falsifier executed (observed red):
    - Deleting the "must not change expected values" clause dropped its count from 1 to 0, and the walk failed at FR-5 `AND`.
    - After restoring with `cp`, `diff` of the pre- and post-falsifier diffs printed `IDENTICAL`.
  - Not Done / Assumptions (assumptions only, so no continuation):
    - The Agent Evals paragraph is placed after the video paragraph.
    - The set names are listed inside the section sentence.
  - Evidence re-run (Leader-inline): **VERIFIED**.
    - Same 4 hunks. The only removed line is the old :211 sentence.
    - `git diff --check` is clean.
    - `node --test test/video-production.test.js test/command-contracts.test.js`: 85/85.
    - `npm test -- --test-name-pattern "binding-stack|stack skill"`: 70/70.
  - Reviewer (`opus`, full): **PASS**.
    - "Every clause of FR-5's three scenarios is in the shipped text, and every new sentence is conditioned on `AI Agent: yes`, so NFR-1 holds."
    - The five fields match design §5 exactly and in order. `FAIL`/`PRODUCT_BUG` match the Tester contract (`.claude/templates/tester.md`). The set names match `evals.md` and `akili-spec-mapping.md`.
    - ADVISORY: none (suppressed below 50 LOC).
  - spawns:
    - Implementer (sonnet): 12 calls, ≈ 82k tokens, ended complete.
    - Reviewer (opus): 6 calls, ≈ 73k tokens, ended complete.
- **Decisions made:** none beyond the brief.
- **Running totals vs budget:** 5/13 tasks · ≈ 303 LOC / ≈ 900 · 6/≈ 22 review rounds. Within budget.

### T6 — `/akili-validate` agent eval gate — PASS

- **Date:** 2026-11-16 · **Attempts:** 1 · **Status:** PASS
- **Requirements covered:**
  - FR-6 S1: the ladder verbatim and in order; the verdict and its deciding row recorded; `BUT` no spec PASS while the gate is FAIL or BLOCKED; `AND IT MUST` a violation is FAIL whatever the aggregate.
  - FR-6 S2: a non-agent spec gets no gate and no entry.
  - NFR-1. Design §3 (validate row: absent → `no`; unrecognized → `no` + WARN), §5, §9.5, DD-6, DD-7, P-3.
- **Attempt 1**
  - Files changed: `.claude/commands/akili-validate.md`, +15/−1, three sites:
    - Phase 0 load bullet (:70), directly under the `Deliverable: video` bullet.
    - Phase 4 **Agent eval gate** paragraph and ladder (:115–126).
    - Report item 6 parenthetical (:189).
  - Skills: `ai-agent-development` and `cognitive-doc-design`, matching tasks.md, so no deviation. Effort: high. Edits were line-anchored with the Edit tool. The falsifier was restored with `cp`.
  - Implementer verification:
    - Ladder extract `diff` against FR-6: IDENTICAL (6 rows).
    - Clause walk: :70, :115–126 and :189.
    - Report list count: 12 items.
    - `AI Agent` hits at :70, :115, :126 and :189, all conditioned.
  - Red run: precondition at `43c3c97`, `grep -c "AI Agent"` → 0.
  - Falsifier executed (observed red): swapping the BLOCKED row's verdict to FAIL made the cell comparison flag it.
    - Comparison output: `5c5 < | A no-pass condition triggered | **BLOCKED** | > | A no-pass condition triggered | **FAIL** |`
    - Restored, and `cmp` confirmed the file byte-identical.
  - Not Done / Assumptions (assumptions only, so no continuation):
    - Phase 4 has no video paragraph; the video text is in Phases 0, 3 and 6. The gate was therefore placed at the end of Phase 4, as design §9.5 requires.
    - Report item 6 carries the gate as a parenthetical.
  - Evidence re-run (Leader-inline): **VERIFIED**.
    - Same 3 hunks. The only removed line is `6. Requirement Coverage`, which is re-added with the parenthetical.
    - The ladder rows match FR-6 once leading indentation is stripped.
    - `git diff --check` is clean.
    - `node --test test/command-contracts.test.js test/video-production.test.js`: 85/85.
    - `npm test -- --test-name-pattern "binding-stack|stack skill"`: 70/70.
  - Reviewer (`opus`, full): **PASS**.
    - "The 6 rows match FR-6 exactly in cells and order (`diff` → IDENTICAL), and the monitoring-plan row is there in 4th position. The report list still has 12 items."
    - Phase 0 placement confirmed (the hunk-header context is only git's label).
    - BLOCKED is an existing result level (:46), consistent with DD-7.
    - Phase 4 placement accepted.
    - Consumer `docs/commands/akili-validate.md:59` does not contradict (T11).
    - ISSUES: none.
  - spawns:
    - Implementer (sonnet): 14 calls, ≈ 85k tokens, ended complete.
    - Reviewer (opus): 7 calls, ≈ 75k tokens, ended complete.
- **Decisions made:** none beyond the brief.
- **Running totals vs budget:** 6/13 tasks · ≈ 319 LOC / ≈ 900 · 7/≈ 22 review rounds. Within budget.

### T7 — Binding flip with its code and test consumers — PASS

- **Date:** 2026-11-16 · **Attempts:** 1 · **Status:** PASS
- **Requirements covered:**
  - FR-7: T7's four restatements, which are `SKILL.md`, the panel `SKILL_CATALOG`, the panel test binding list and `docs/overview.md`.
  - FR-8: the fixtures. The Codex baseline is untouched.
  - DD-8, P-5, P-7, P-8, P-15.
- **Attempt 1**
  - Files changed (+14/−13):
    - `SKILL.md`: `binding: conditional` (:8).
    - `flow.mjs`: the binding changed in place (:634).
    - `docs/overview.md`: the binding cell (:78).
    - `test/akili-panel-flow.test.js`: `SKILL_NAMES` lists (:1435–1436) and the derived group counts (:1509, :1531–1533, :1752).
    - `test/install-cursor.test.js`: `+ 2` with a comment, plus the assertion message naming `guardrails.md`/`evals.md` (:255–257, :260).
  - Skills: `cognitive-doc-design`, matching tasks.md, so no deviation. Effort: medium. Edits were made with the Edit tool, line-anchored.
  - Implementer verification: `node --test test/akili-panel-catalog.test.js test/akili-panel-flow.test.js test/docs-overview.test.js test/install-cursor.test.js` → 268/268 pass.
  - Falsifier (the reds re-observed, each with its own edit reverted, then restored):
    - Catalog reverted to `stack`: 8 failures. They include `skills with a different binding: ai-agent-development: catalog stack, SKILL.md conditional` and `not ok 198 - FR-3 the catalog is stored in alphabetical order…`.
    - Overview cell reverted: `skill ai-agent-development: binding cell "stack", SKILL.md declares "conditional"`.
    - `+ 2` reverted: `expected 318 (…) packaged skill files under .claude/skills; counted 320 instead`.
    - After the restores, the diff was byte-identical to the pre-falsifier diff.
  - Not Done / Assumptions (assumptions only, so no continuation):
    - `flow.mjs` keeps `ai-agent-development` first and changes only its binding. The catalog is one alphabetical list grouped by `e.binding`, so there is no "conditional block" to move the entry into, and test 198 enforces the sort.
    - The panel-flow group counts were updated as derived expected values: conditional 9→10, stack 11→10, slice width 9→10, next index +10→+11.
  - Evidence re-run (Leader-inline): **VERIFIED**.
    - `git diff --stat`: only the 5 files. `git diff --check` is clean.
    - Full `npm test` (P-15): 1903 tests, 1903 pass, 0 fail, 0 skipped.
    - `git status --porcelain test/fixtures` is empty.
  - Reviewer (`opus`, checklist): **PASS**.
    - It confirmed the catalog-order reading against `flow.mjs:629-630` and test `:1545-1551`.
    - It confirmed the derived counts against the catalog on disk: core 12, conditional 10, stack 10, 32 in total.
    - 320 is pinned with `assert.equal`, and the four test files re-ran 268/268.
    - ISSUES: none.
  - ADVISORY (recorded only; the Reviewer suppressed formal advisories below 50 LOC): comments at `install-cursor.test.js:234`, `:250` and `:355` still say 318/332, where the totals are now 320/334. They are stale but harmless.
  - spawns:
    - Implementer (sonnet): 32 calls, ≈ 81k tokens, ended complete.
    - Reviewer (opus): 5 calls, ≈ 73k tokens, ended complete.
- **Decisions made:** the task text says to "move the entry into the conditional block". It was read as "set its binding to conditional in place", because the catalog has no per-binding block and the sort test forbids moving it. This matches DD-8 ("changes one data value").
- **Running totals vs budget:** 7/13 tasks · ≈ 346 LOC / ≈ 900 · 8/≈ 22 review rounds. Within budget.

### T8 — Docs and governance restatements — PASS

- **Date:** 2026-11-16 · **Attempts:** 2 · **Status:** PASS (attempt 2)
- **Requirements covered:**
  - FR-7, the restatements T8 owns: governance *Current assignment*; `docs/skills/README.md`; and on `docs/skills/ai-agent-development.md` the binding, *Best Paired Commands* naming the selector-gated steps, and *References* +2 rows.
  - FR-7 `BUT`: no Skill-Map-only sentence remains.
  - DD-8, DD-9, P-4, P-11.
- **Skills:** `cognitive-doc-design`, matching tasks.md, so no deviation. Effort: medium, then high on attempt 2. Edits were line-anchored with the Edit tool.
- **Attempt 1**
  - Files changed:
    - `docs/skills/governance.md` (:69–70): the name moved to the `conditional` row with "(AI agent specs)".
    - `docs/skills/README.md` (:21): binding `conditional`; *Wired In* names specify AI Agent Mode, the test agent eval suite and the validate agent eval gate, each "when `AI Agent: yes`"; *Use For* now adds "with guardrail and eval references".
    - `docs/skills/ai-agent-development.md`: header binding; *References* +2 rows copied from SKILL.md:61–62; *Best Paired Commands* has specify, test and validate bullets, and an execute bullet that no longer says "from the project `## Skill Map`".
    - +10/−6.
  - Implementer verification:
    - `node --test test/docs-overview.test.js`: 13/13.
    - The sweep, outside `docs/specs/` history, leaves:
      - `docs/commands/akili-constitution.md:123` (T10);
      - `backend-routing.md:36`, `:48` (routing leads);
      - `backend-routing.md:70` and `AGENTS.md:95` (T9).
  - Red run (baseline `43c3c97`): `governance.md:70` under `stack`; `README.md:21` cell `stack`.
  - Falsifier executed (observed red): re-adding the name to the governance `stack` row made the sweep hit `docs/skills/governance.md:70`. After restoring, the diff was IDENTICAL.
  - Evidence re-run (Leader-inline): **VERIFIED**. Same sweep result, `git diff --check` clean, docs-overview 13/13.
  - Reviewer (`opus`, checklist): **FAIL** (verbatim, condensed).
    - "`docs/skills/ai-agent-development.md`, first bullet under *Best Paired Commands*, was left unchanged: '`/akili-constitution` — Step 5 TRD and the Step 8D Skill Map, when the project builds agents.' This contradicts the approved end state."
    - Violated: FR-7 ("the skill leaves the Step 8D Skill Map candidates") and DD-9.
    - Remediation: "Rewrite the bullet to match DD-9 … Remove 'and the Step 8D Skill Map'."
    - The Reviewer judged the README *Use For* addition in scope.
- **Attempt 2** (effort high; the FAIL report was relayed verbatim)
  - Files changed: `docs/skills/ai-agent-development.md`, one bullet (:37), now "`/akili-constitution` — Step 5 TRD, through its conditional line when the product includes an AI agent." The total is now +11/−7 across 3 files.
  - Implementer verification:
    - `grep -n "Skill Map"` on the page returns nothing.
    - The sweep over `docs/skills/` returns nothing.
    - docs-overview: 13/13.
  - Evidence re-run (Leader-inline): **VERIFIED**. Same results, and `git diff --check` is clean.
  - Reviewer (`opus`, checklist): **PASS**. "Attempt 2 fixes the only issue from attempt 1 … matches the approved DD-9 end state." ISSUES: none.
- **Forward pointer → T10:** the skill page's `/akili-constitution` bullet (:37) describes T10's end state. T10's review must check that the command text matches it: the Step 5 conditional line is present and Step 8D no longer lists the skill.
- spawns:
  - Implementer #1 (sonnet): 14 calls, ≈ 81k tokens, ended complete.
  - Reviewer #1 (opus): 6 calls, ≈ 74k tokens, ended complete.
  - Implementer #2 (sonnet): 5 calls, ≈ 66k tokens, ended complete.
  - Reviewer #2 (opus): 2 calls, ≈ 67k tokens, ended complete.
- **Decisions made:** none beyond the brief.
- **Running totals vs budget:** 8/13 tasks · ≈ 357 LOC / ≈ 900 · 10/≈ 22 review rounds. Within budget.

### T9 — Guide and routing labels — PASS

- **Date:** 2026-11-16 · **Attempts:** 1 · **Status:** PASS
- **Requirements covered:** FR-7 (`AGENTS.md` *Backend Skills*, `backend-routing.md`), its THEN clause and its BUT clause. DD-8, P-4.
- **Attempt 1**
  - Files changed (2+/2−):
    - `AGENTS.md:95`: "stack skill:" → "conditional skill:".
    - `.claude/skills/software-architect/references/backend-routing.md:70`: "(stack)" → "(conditional)".
    - Each was a line-anchored Edit. No nested guide exists under `software-architect/`.
  - Skills: `cognitive-doc-design`, matching tasks.md, so no deviation. Effort: low.
  - Implementer verification: `node --test test/backend-skill-routing.test.js` → 14/14. `npm test -- --test-name-pattern "backend-skill-routing"` → 99/99.
  - Red run (baseline `43c3c97`): `:70` "| `ai-agent-development` (stack) |"; `AGENTS.md:95` "— stack skill:".
  - Falsifier executed (observed red):
    - Reverting `:70` made `grep -n "ai-agent-development\` (stack)"` return 1 hit: `70:| \`ai-agent-development\` (stack) | …`.
    - After restoring with `cp`, the diff was IDENTICAL.
  - Evidence re-run (Leader-inline): **VERIFIED**. Hunks `@@ -70 +70 @@` and `@@ -95 +95 @@`, `git diff --check` clean, backend-skill-routing 14/14.
  - Reviewer (`opus`, checklist): **PASS**.
    - Both edits change one token each, and no lead cell changed (`:34-54` untouched).
    - FR-7 `BUT` holds. `backend-routing.md:72` ("Stack skills reach agents only through the project `## Skill Map`") and `AGENTS.md:85` now apply only to stack-marked skills, so they no longer cover this skill.
    - ISSUES: none.
  - ADVISORY (recorded only): `backend-routing.md:25`, in the routing-matrix table headed "Stack skill" (`:20`), lists `ai-agent-development (decisions)`. That cell names a routing role, not the binding, so FR-7 does not cover it.
  - spawns:
    - Implementer (sonnet): 8 calls, ≈ 68k tokens, ended complete.
    - Reviewer (opus): 2 calls, ≈ 75k tokens, ended complete.
- **Decisions made:** none beyond the brief.
- **Running totals vs budget:** 9/13 tasks · ≈ 359 LOC / ≈ 900 · 11/≈ 22 review rounds. Within budget.
