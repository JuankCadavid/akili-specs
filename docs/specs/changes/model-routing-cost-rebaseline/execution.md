# Execution Log: Re-baseline the default Model Routing registry on cost-per-quota

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/model-routing-cost-rebaseline` |
| Depth | Lite |
| Approval Mode | `gated` (inherited from `proposal.md`) |
| Started | 2026-09-17 |
| Leader model | Fable 5.1 (session model; registry T1 = `opus`, session stronger — passed silently) |
| Implementer model | `sonnet` (T2) — fallback sub-prompt path seeded with `.agents/implementer.md` (no Step 8E wrappers in this repo) |
| Reviewer model | `opus` (T3), `fable` as the runtime fallback (author ≠ auditor preserved vs `sonnet`) — sub-prompt path seeded with `.agents/reviewer.md` |
| Budget (design §9) | 2 tasks · ~160 lines · 1 review round per task + 1 reserved |
| Commit prefix | `[SPEC:changes/model-routing-cost-rebaseline]` |
| User request | "quick/fast" — briefs by pointer, single Implementer per task, checklist-mode review; no gate skipped |

## 2. Task Execution History

## Pivot Record: T1

| Field | Value |
|---|---|
| Date | 2026-09-17 |
| Trigger | T1 Implementer, following the task's Source-of-truth rule, fetched <https://opencode.ai/docs/go> and found the plan page shows **two** columns — "requests per 5 hour" and "requests per month". The proposal/design figures (110 Kimi K3, 1,050 V4 Pro, 13,000 V4 Flash, 26,000 V4.1 Flash, 6,500 Vision Exp, …) were the **5-hour** column transcribed from the maintainer's screenshot. Leader re-fetched and confirmed: monthly = Kimi K3 490 ($15); V4 Pro 5,200 ($15); V4.1 Flash 32,500 (page shows the 4× promo "Ends Sep 20" at $60); V4 Flash 65,000 ($30); Vision Exp 32,500 ($15); GLM-5.2 4,300 ($60); GLM-5.3-Flash 31,580 ($60); MiMo-V2.5 150,400 ($60); Qwen3.8 Flash 27,000 ($30) |
| Defect class | Spec data wrong (unit confusion), not implementation. Exactly the defect the requirements §8 row "Quota figure transcribed wrong from the screenshot/page" names — the gate fired as designed |
| Impact on decisions | Model picks per tier **unchanged** (relative ordering identical). The user's "$60 per-model limit" assumption loses its basis: it was chosen to reach V4.1 Flash's 26,000 figure, which is the promo'd 5-hour number; V4.1 Flash's baseline is $15 and the promo (4× to $60) ends 2026-09-20. Revised direction: no single limit assumption — each cell carries its own limit and monthly figure; the promo is noted with its end date so the doc does not stale-date itself in three days |
| Amended | `requirements.md` (Glossary *Per-model limit*, Problem row, FR-1 SHALL + AND clause); `design.md` (§5.1 header + eight figure cells, pins line, §5.3 item 2, DD-1, DD-8); `tasks.md` (T1 scope bullet). `proposal.md` left as record (its figures are labelled as screenshot evidence) |
| Sweep | Forward: every 5-hour figure (`110`, `880`, `1,050`, `13,000`, `26,000`, `6,500`, `6,320`, `30,100`, `5,400`, `170`) grepped across the spec folder — remaining hits are in `proposal.md` (record) and this Pivot Record. Backward: references to "$60 assumption" in requirements/design/tasks all rewritten |
| Task state | T1 `[~]`; the Implementer's edit already uses the monthly figures and states the promo separately — attempt 1 proceeds to review against the **amended** spec once the user approves |
| User decision | **Approved** (2026-09-17) — "Aprobar y revisar T1": per-cell limits + monthly figures, promo noted; T1 attempt 1 proceeds to review against the amended spec |

### T1 — `docs/model-routing.md`: table, prose, effort map, examples, runbook, cross-host

| Field | Value |
|---|---|
| Status | **PASS** (attempt 2 of 3) |
| Date | 2026-09-17 |
| Implementer | `sonnet`, effort `high` (attempt 1) → `xhigh` (attempt 2); skills: `cognitive-doc-design` (task default) |
| Reviewer | `opus`, effort `high`, single reviewer full four-lens sweep (120+/68−) |

**Attempt 1** — `docs/model-routing.md` (120+/68−). Implementer followed the Source-of-truth rule, fetched the plan page and ran `agy models`, and surfaced the **5-hour vs monthly column** defect that became Pivot Record T1 (approved). Verification: check 1 fetched slug list (29) + roster pasted, all table slugs/IDs present; check 2 T2 ≠ T3 stated per column; check 3 zero benchmark tokens in the *Why these models* range; check 4 two `gpt-6-astra` prose survivors, none in a table row; check 5 Claude paragraphs byte-identical (after a self-caught boundary fix); check 6 five `Last verified: 2026-09-17`, `git diff --check` clean.

Reviewer verdict: **FAIL** (1 issue). Verified live by the Reviewer: every quota figure matches the page's monthly column (V4 Pro 5,200 @ $15; V4.1 Flash $15 baseline 32,500 with "$60 · 4x · Ends Sep 20" 130,000 noted separately; V4 Flash 65,000 @ $30; Vision Exp 32,500 @ $15; GLM-5.3 1,080 @ $15; GLM-5.3-Flash 31,580 @ $60; MiMo-V2.5 150,400 @ $60; Qwen3.8 Flash 27,000 @ $30); slugs verbatim in the page's config table; `agy models` IDs present; checks 3–6 re-run PASS; DD-8, effort map, qualifiers, rows 9–12 landed. Issue (verbatim claim): the diff reinstates a single "$60 limit" assumption at three sites (table header `@ $60 limit unless noted`; under-table sentence; *Why these models* opener) although no default cell is at $60 (T1–T4 $15, T5 $30) and it offers `deepseek-v4-flash` as "the $30-limit alternative … if you prefer the lower cap" — inverted ($30 > $15; it is the higher-volume alternative) and asserting a selectable cap the page does not describe ("Usage limits are defined as monthly dollar amounts … for each model"). Violated: Pivot Record T1 revised direction; FR-1 SHALL (per-cell limit); design §5.1 header; tasks T1 scope; FR-4 AND clause ("higher-volume alternative"). Remediation: header verbatim from §5.1; both sentences → each cell carries its own limit and monthly figure; drop "$60 assumption" and "Option A + A1"; alternative framed as higher volume at a higher cap, attached to T2 (or add to T4 Fallback). Leader note: the "$60" residue came from my pre-pivot brief — brief error, not Implementer drift.

ADVISORY (recorded): "cheapest tier of the set" for V4 Flash is an unpinned price ranking (say "most requests per cap" or drop); "two generations behind" is not countable from the `agy models` pin (roster shows one Pro generation); T3/T6 have no OpenCode Fallback entry (conformant to §5.1; FR-1's "per tier where one exists" reads broader).

**Attempt 2** — `docs/model-routing.md` (122+/68−). Fixes: table header = design §5.1 verbatim; under-table sentence and *Why these models* opener state that each cell carries its own per-model monthly limit and figure ("the plan page sets the limit per model, not per plan, so there is no single cap to assume"); `deepseek-v4-flash` framed as T2's higher-volume alternative (65,000 @ $30 vs 32,500 @ $15); "$60 assumption", "Option A + A1" and the "$15/$30/$60" enumeration removed. Advisories applied: T5 superlative dropped after the Implementer checked the arithmetic (V4.1 Flash, V4 Flash and Vision Exp all tie at 2,166.7 requests/$ — "most requests per dollar" would have been false, KZ-002); Antigravity line → "the only Pro generation the roster exposes, against a current 3.8 Flash". Checks 2–6 re-run green; `grep '\$60'` → six hits, all promo note or a model's own limit.

Reviewer verdict: **PASS**. All three sites remediated; per-model claim matches the page text verbatim (KZ-001 clear); FR-4 AND clause met at both sites; per-cell figures byte-identical to the attempt-1 rows verified against the raw page; checks 2–6 re-run by the Reviewer; both advisories correctly applied. ADVISORY (recorded): three edited lines wrap short of the file's column width — fold on next touch.

| Field | Value |
|---|---|
| Requirements covered | FR-1 (all clauses, monthly figures per Pivot T1), FR-2 registry half (IDs ∈ `agy models`, Pro ≠ Flash, Sonnet 4.6 upgrade, no benchmark ranking, dial → ID map), FR-3 (all clauses), FR-4 (all clauses), NFR-1, NFR-5 |
| Decisions | Pivot Record T1 (monthly column; per-cell limits; promo noted with end date); T5 superlative removed rather than re-sourced |
| Issues | Attempt 1: "$60 limit" framing carried from the Leader's pre-pivot brief — fixed |
| Queued for T2 | Step 8C/8E defaults, mirror, CHANGELOG copy the final table (monthly figures, per-cell limits) |
| Final verification | checks 1–6 green (Implementer + Reviewer independent runs); `git diff --check` clean |
| Approval gate | `gated` — user asked at the T1 landing |

### T2 — Constitution Step 8C/8E defaults, mirror parity, CHANGELOG

| Field | Value |
|---|---|
| Status | **PASS** (attempt 2 of 3) |
| Date | 2026-09-17 |
| Implementer | `sonnet`, effort `medium` (attempt 1) → `high` (attempt 2); skills: `cognitive-doc-design` (task default) |
| Reviewer | `opus`, effort `high`, checklist mode (18+/10−, three files) |

**Attempt 1** — `.claude/commands/akili-constitution.md` (Step 8C: Gemini 3.8 Flash effort-in-ID + Gemini 3.1 Pro auditor, `agy models`, dial → ID map, `<CONFIRM ID>`; Step 8E defaults leader/reviewer `deepseek-v4-pro`, implementer `deepseek-v4.1-flash`, tester `deepseek-v4-flash` + R7 clause), `docs/commands/akili-constitution.md` (parity), `CHANGELOG.md` (Unreleased → Changed, patch; "superseded" pointer on the Codex live-validation Astra/Sol sentence). Implementer checks 1–6 green; NFR-3 proxy: hand-scaffolded Step 8C table in scratchpad `mr-t2-scaffold/scaffold-model-routing.md`, zero cell differences vs `docs/model-routing.md`.

Reviewer verdict: **FAIL** (1 issue). Verified clean: (a) Step 8C wording byte-consistent with `docs/model-routing.md` *Effort dial* and table; (b) Step 8E defaults exact + R7; (c) mirror parity never stronger; (d) FR-5 grep: single `gpt-6-astra` hit is inside the plan-gating rejection quote (a refused model, not a default); (e) CHANGELOG figures all match HEAD, patch stated, 5-hour correction attributed to Pivot T1, drift paragraph present; (f) `^model:` empty, only three files, `git diff --check` clean; (g) no "$60 assumption"; NFR-3 proxy confirmed cell by cell — **caveat recorded:** it is the author's own reconstruction, not an executed Step 8C; the executed check (scratch project + `/akili-audit`) stays at the closing HITL gate. Issue (verbatim claim): both CHANGELOG cross-references are inverted — the Changed entry says the plan-gating evidence is "already on record **above**" (it is below, in *Live validation*), and the *Live validation* paragraph says "**superseded below**" (the superseding Changed entry is above; "below" walks the reader into the shipped 2.23.2 block). Violated: `cognitive-doc-design` (navigational claims must resolve); CLAUDE.md Release Discipline. Remediation: "above" → "below" at the Changed entry; "superseded below" → "superseded above".

**Attempt 2** — `CHANGELOG.md` only: line 21 "already on record above" → "below"; line 37 "superseded below" → "above". Reviewer verdict: **PASS** — both pointers resolve; the diff contains only the two word swaps; all attempt-1 findings on 8C/8E, mirror parity, FR-5 grep, figures and NFR checks stand. Carried caveat: the NFR-3 evidence is the Implementer's hand-reconstruction of Step 8C's output (zero cell differences, verified cell by cell by the Reviewer), not an executed scaffold + `/akili-audit` run — offered to the user at the closing gate as an optional executed check.

| Field | Value |
|---|---|
| Requirements covered | FR-2 Step 8C half (`agy models`, effort in the ID, dial → ID map), FR-5 (all clauses), NFR-2, NFR-4, NFR-5; NFR-3 by proxy (caveat above) |
| Decisions | "superseded above" pointer placed in the Codex live-validation paragraph (the sentence that named Astra/Sol defaults), not in the Added entry |
| Issues | Attempt 1: two inverted cross-reference words — fixed |
| Final verification | checks 1–6 green (Implementer), (a)–(g) verified by the Reviewer; `git diff --check` clean |

## 3. Summary — all tasks complete

| Task | Status | Attempts | Notes |
|---|---|---|---|
| T1 registry + prose | `[x]` | 2 | Pivot Record T1 (5-hour vs monthly column) surfaced by the Implementer's source check; attempt-1 FAIL was the Leader's pre-pivot "$60" framing |
| T2 constitution/mirror/CHANGELOG | `[x]` | 2 | attempt-1 FAIL: two inverted "above/below" pointers |

**Budget (design §9 vs actual):** tasks 2 → 2; lines ~160 → ~190 (model-routing 122+/68−, constitution 18+/10−, CHANGELOG 6+/1−, mirror 4+/2−); review rounds 3 (2 + 1 reserved) → **4**. Overrun by one round; both FAILs were single-defect, one-retry fixes.

**Open at close:** NFR-3 executed check (scratch project Step 8C + `/akili-audit` Model Registry Drift) optional — proxy PASS recorded. `/akili-audit` on existing projects will report intended drift until Step 8C is re-run (CHANGELOG states it). Release classification **patch**.

**Kaizen candidates (for `/akili-archive`):** (1) a spec figure transcribed from a screenshot is not a source — the task's Source-of-truth rule caught a unit error (5-hour vs monthly) that three review rounds of the proposal/design had not; consider making "open the page, not the screenshot" a standing specify-time rule; (2) a Leader brief written before a pivot must be re-issued after it — the "$60" residue cost one round; (3) directional cross-references ("above/below") in release notes need the referent's position checked — cheap, twice bitten across two specs.

