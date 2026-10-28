# Execution Log: `changes/growth-angles`

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/growth-angles` |
| Started | 2026-10-28 |
| Leader | Claude Code, `claude-opus-5-5` (T1) |
| Approval Mode | `gated` (proposal); continue gates auto-passed by maintainer mandate 2026-10-28 7:20 ("Run /akili-execute changes/growth-angles for T1 through T8. Answer process gates yourself with the recommended option … keep the per-task review loops"). Exceptions (HALT, Pivot, tripwire, FATAL_FAIL, waiver, product/cost/risk decision) still stop. Run stops before T9 (HITL) |
| Budget | 9 tasks · ~760 LOC · ~17 rounds; tripwire past 10 tasks, ~950 LOC, 21 rounds |
| Personas | `.agents/` deployed 2026-10-28 from `.claude/templates/` (gitignored); `node bin/akili.js doctor --agents` → all sections `CURRENT`, "No persona drift blocking CI." |
| Delegation | No Step 8E wrappers in this repo → fallback spawn (`general-purpose` subagent, worker reads its own persona). Implementer `sonnet` (T2), Reviewer `opus` (T3 role on a different model than the Implementer — author ≠ auditor) |
| Commits | Local only, `[SPEC:changes/growth-angles]`; no push, PR, merge, tag or publish |
| Private reference | `~/akili-refs/akili-mapa-de-angulos.md`, read-only; leak-term list kept in the session scratchpad only (DD-10) |
| Wave plan | T1 alone (it changes the skill file-set test T2 runs) → T2 ∥ T6 → T3 → T4 → T5 → T7 → T8 |

## 2. Task Execution History

### T1 — `angles-framework.md`, `SKILL.md` table, file lists

- **Final status:** PASS (attempt 3 of 3) · 2026-10-28
- **Requirements covered:** FR-2 (map shape, sourcing, distinct types, no mass generation), FR-3 (approach table, social proof), FR-4, NFR-2, NFR-4, NFR-6
- **Skills / effort:** `cognitive-doc-design`, `social-marketing` (as listed); Implementer `sonnet`, effort high → xhigh (attempt 2) → xhigh held (attempt 3, `effort ceiling: held xhigh`, fresh spawn with full Attempt History); Reviewer `opus`
- **Attempt 1** — files: `.claude/skills/social-marketing/references/angles-framework.md` (new, 135 lines), `SKILL.md` (`angles` row; `brand`/`campaign`/`post` rows load the file), `test/social-marketing-skill.test.js` + `test/social-marketing-install.test.js` (12 → 13), `test/install-cursor.test.js` (sentinels 244 → 245, 258 → 259 — outside the brief, accepted, see decisions). Leak list built at `<scratchpad>/leak-terms.txt` (42 terms, never in the repo). Verification: 24/24 pass. Falsifiers executed: file removed → `not ok 6 - file set is exactly the 13 expected names`, `not ok 10 - install --tool claude lands the same 13 files, byte-identical, in a temp target`; first line without `AKILI-authored` → `not ok 9 - every reference opens with an Adapted from or AKILI-authored line`. Leak falsifier: appended term in a scratch copy → one hit.
  - continuations: 1 (design §3 "body sentence on the method credit" in `SKILL.md` — owed item named in `Not Done`)
  - Evidence re-run (Leader inline): 24/24, leak grep empty → `VERIFIED`
  - Reviewer: **FAIL** — Discovered Issue: nothing pinned the `SKILL.md` `angles` row, the `campaign`/`post` rows loading `angles-framework.md`, or the method credit (integration-table loop lacked `angles`); Violated Rule: `tasks.md` §3 rows "FR-4 … method credit | T1 | T1 (skill test)" and "FR-4 AND IT MUST … `SKILL.md` `angles` row | T1 | T1 (skill test)", FR-4, KZ-changes--gate-falsifiability-2; Remediation: add `angles` to the mode list, assert the three rows load the file, anchored credit + ID-scheme literals, mutation-check each. ADVISORY: example cited `Story bank: Scars` while the template's part is "Turning points and scars"; the video title's "6.480" is a mandated string, an expected hit for any future numeric leak term.
  - runtime events: none
- **Attempt 2** — files: `test/social-marketing-skill.test.js` (+mode `angles`; rows-load test; reference literal test), `angles-framework.md` (advisory applied: `KB-O2` cites `Story bank: Turning points and scars`). Verification: 26/26. Evidence re-run (Leader inline): 26/26, leak grep empty → `VERIFIED`.
  - Reviewer: **FAIL** — Discovered Issue: the approach-row checks `^\| Expert \|`, `^\| Bridge \|`, `^\| Social proof \|` and the `## Invariants` pointer literal matched the worked-example table / Quick path as well, so the claimed mutation M6 (`'Bridge approach row'`) did not reproduce; Violated Rule: `tasks.md` §3 "FR-4 reference content … | T1 | T1 (skill test)", brief "literals are anchored", reviewer persona *Red Run & Mutation Trace*, KZ-changes--gate-falsifiability-2; Remediation: section-scope the approach rows on method-table wording, assert the social-proof never-invent clause, anchor the pointer on "This file does not restate those rules.", re-run M6 on the method row only.
  - runtime events: none
- **Attempt 3** — files: `test/social-marketing-skill.test.js` only (`sec(heading)` helper; every literal section-scoped and `grep -cF` = 1). 25 mutations on the real files, each restored (shasum before = after: `angles-framework.md` `f0075e48…`, `SKILL.md` `1d1fc86b…`), each observed red on its named message, e.g. Bridge method row only → `Bridge approach row (method table)`; Social proof clause → `Social proof row forbids invented testimonials, client names and figures`; pointer sentence removed → `map-shape section does not restate the invariants`; `angles` row loses the file → `angles row loads angles-framework.md`. Script: `<scratchpad>/mut.py`. The attempt-2 M6 claim is superseded by these observations.
  - Evidence re-run (Leader inline): `node --test test/social-marketing-skill.test.js test/social-marketing-install.test.js test/install-cursor.test.js` → 26/26/0; leak grep empty; shasums match → `VERIFIED`
  - Reviewer: **PASS** — every new literal is section-scoped; the Reviewer re-ran M6, Expert row, pointer sentence and the social-proof clause on scratch copies and saw each red on its named message (the scratch install byte-compare `not ok 9` fails on an unmutated scratch copy too, an artefact of the scratch location); nothing existing weakened. ADVISORY: record the attempt-3 observations, not the attempt-2 claim (done above).
  - runtime events: none
- **Decisions:** (1) **Execute-time spec edit** — `design.md` P-3 row and §9 bullet: P-3 refuted, because `test/install-cursor.test.js` asserts the computed total against hard-coded sentinels; T1's sentinel update is the only change that keeps that consumer green (factual correction, no requirement meaning changed). Carried into the next Reviewer brief as a named conformance check. (2) The design §3 `SKILL.md` body credit sentence was added by continuation.
- **Restatement sweep** (`approv|snapshot|silence|praise|bulk|auto-pass` on `angles-framework.md`): 3 hits — status names / `Approved snapshot` field in the shape table, the pointer to `/akili-marketing` `## Invariants`, the example's `Approval: —`. No restated rule.
- **spawns:** Implementer 18 calls, 118,182 tokens, ended partial (Not Done: owed body sentence); Implementer (resumed, continuation) 19 calls cumulative, 121,018 tokens cumulative, ended complete; Reviewer 8 calls, 88,819 tokens, ended complete (FAIL); Implementer (resumed, attempt 2) 4 calls, 127,556 tokens cumulative, ended complete; Reviewer (resumed) 3 calls, 95,158 tokens cumulative, ended complete (FAIL); Implementer (fresh, attempt 3) 5 calls, 79,208 tokens, ended complete; Reviewer (resumed) 2 calls, 99,881 tokens cumulative, ended complete (PASS)
- **Running totals vs budget:** tasks 1/9 · LOC +192 −12 (shipped files, excl. `docs/specs`) · review rounds 3 (budget for T1: 2; total 3/17, tripwire 21) — within tripwire
- **Gate:** auto-approved (maintainer mandate 2026-10-28)
