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

