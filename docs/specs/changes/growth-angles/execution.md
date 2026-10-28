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

### T6 — `/akili-constitution` PRD section and Step 2 defaults

- **Final status:** PASS (attempt 1 of 3) · 2026-10-28 · ran in parallel with T2 (disjoint files, separate suites)
- **Requirements covered:** FR-5 (statement + both scenarios), NFR-6
- **Skills / effort:** `cognitive-doc-design`, `product-manager-toolkit` (as listed) + `tdd` (Leader-added: literal per clause + mutation for the new suite); Implementer `sonnet` effort high; Reviewer `opus`
- **Attempt 1** — files: `.claude/commands/akili-constitution.md` (+4: Step 2 bullet *Marketing seeds (optional)*; Step 3 paragraph after `9. Open Questions` for the optional **Customer Objections & Beliefs** section), `test/growth-track.test.js` (new, 6 tests: three Step 2 literals, Step 3 placement + `none supplied`/thin-seed, nine-item list without Objections, NFR-6 scan with a concatenated needle). Red run at baseline (tasks.md): `grep -c "Customer Objections & Beliefs"` → 0, `grep -c "brand-voice"` → 0. Mutations (real file, restored, shasum `8cde2b3e…` unchanged): "never a source" sentence removed → test 3 red; Step 3 optional line removed → test 4 red; `test/zz-scratch.txt` with the needle → test 6 red `+ ['test/zz-scratch.txt'] - []` (deleted). New test file: `predicted — greenfield artifact (observed in T6)`. `npm test` → 1161/1161/0 (taken while T2's Implementer was active — informational only; Leader re-run below).
  - Evidence re-run (Leader inline): `node --test test/growth-track.test.js` → 6/6; nine-section `sed` capture HEAD vs tree identical; leak grep empty → `VERIFIED`
  - Reviewer: **PASS** — FR-5 walked term by term; "any post" judged stricter than "any unapproved post" (FR-5's positive obligation grants no post as a source); "validly `approved`" stricter than "approved"; optional section outside the nine (Disqualifier not triggered); Reviewer mutations via `GT_MUTATE_ROOT`: Step 2 bullet moved to end of file → tests 1–3 red (anchored); optional line moved inside the list → tests 4–5 red; P-3 carry: `install-cursor` 12/12. ADVISORY: (RISK) the `## Invariants` pointer is complete only once T3 lands the pillar-section sentence (DD-2) — confirm at T9's sweep; (READABILITY) test 5's `indexOf("9. Open Questions") + 20` magic offset.
  - runtime events: none
- **Decisions:** the `// @akili-spec changes/growth-angles (T6)` test header follows the repo's existing convention (10+ tests carry `@akili-spec`); NFR-6 targets the `docs/specs/…` path, which the test builds by concatenation.
- **spawns:** Implementer 10 calls, 99,262 tokens, ended complete; Reviewer 6 calls, 76,793 tokens, ended complete (PASS)
- **Running totals vs budget:** tasks 2/9 · LOC +192 −12 (T1) + T6 below · review rounds 4 (T1 3, T6 1; T2 in flight) / tripwire 21 — within tripwire
- **Gate:** auto-approved (maintainer mandate 2026-10-28)

### T2 — Foundations and slot fields in the skill references

- **Final status:** PASS (attempt 2 of 3) · 2026-10-28 · ran in parallel with T6
- **Requirements covered:** FR-1 (sections, interview, no plausible fill, existing file), FR-2 (story-bank note), FR-3 (slot fields)
- **Skills / effort:** `cognitive-doc-design` (as listed); Implementer `sonnet` effort medium → high (attempt 2); Reviewer `opus`
- **Attempt 1** — files: `.claude/skills/social-marketing/references/brand-voice-template.md` (four foundation sections after *Audience*; read-table row for pre-foundation `filled: yes` files; interview step 8 for empty foundations; note that foundations are not part of the `filled` check; story-bank *Positions*/*Scars* line), `planning-and-calendar.md` (step 4 Angle/Approach/Hooks; balance-check line; worked-shape Angle + Approach columns). Read-table row text for T5: "| File present, `filled: yes`, written before the foundations existed (none of *Ideal customer*, *Ideal follower*, *Offer*, *Message*) | Stays `filled: yes`; the foundations read as empty and the file is not rewritten. `brand` or `angles` offers to add them |".
  - continuations: 1 (Leader pre-review sweep, two gaps: step 5 still carried the old free-text angle-sourcing rule beside the new step 4 field; `### Plan shape` numbered list lacked `Angle`/`Approach`/`Hooks` per design §4.3) — both fixed before review
  - Verification: heading grep 4; `grep -c "Approach"` 3; `node --test test/social-marketing-skill.test.js` 11/0; leak grep empty; shipping default `- filled: no` unchanged (line 27)
  - Evidence re-run (Leader inline): same → `VERIFIED`
  - Reviewer: **FAIL** — Discovered Issue: the no-plausible-fill sentence pointed to a "Never fill a gap" rule in `/akili-marketing` that the command does not contain (`grep -n -i "plausible\|fill a gap\|never fill\|invent" .claude/commands/akili-marketing.md` → nothing); Violated Rule: `tasks.md` §3 row "FR-1 *Interview* BUT no plausible fill; empty stays empty | T2 (points to the existing "Never fill a gap" rule)", FR-1; Remediation: extend the template's own rule in place ("foundation lines included") and point step 9 to it. ADVISORY: balance-check "source for its angle" vs `needs input`; `source:` hint only on *Pains*.
  - runtime events: none
- **Attempt 2** — files: `brand-voice-template.md` (rule reads "Never fill a gap with a plausible answer, foundation lines included: … Leave the line empty."; step 9 opens "An unanswered foundation line stays empty (see the rule below)."; `source:` hint moved to *Ideal customer* Who line "add `source:` to any line pre-filled from the PRD"), `planning-and-calendar.md` (balance check "… a source for its angle, or `needs input`"). Both advisories applied as `[advisory-grade]` one-line consistency edits inside the task's own files.
  - Evidence re-run (Leader inline): heading grep 4, Approach 3, skill test 11/0, leak grep empty → `VERIFIED`
  - Reviewer: **PASS** — issue closed (pointer resolves to the paragraph below); moved `source:` hint covers every line per design §4.1; balance-check lines consistent; `filled: no` default unchanged; `install-cursor` + skill tests 23/0 (P-3 carry holds); `git diff --check` clean. ADVISORY: none.
  - runtime events: none
- **spawns:** Implementer 8 calls, 83,338 tokens, ended complete; Implementer (resumed, continuation) 9 calls, 86,155 tokens cumulative, ended complete; Reviewer 8 calls, 81,787 tokens, ended complete (FAIL); Implementer (resumed, attempt 2) 1 call, 89,278 tokens cumulative, ended complete; Reviewer (resumed) 1 call, 84,690 tokens cumulative, ended complete (PASS)
- **Running totals vs budget:** tasks 3/9 · LOC: T1 +192 −12, T6 +103, T2 +39 −14 → +334 −26 cumulative (shipped files) · review rounds 6 / tripwire 21 — within tripwire
- **Gate:** auto-approved (maintainer mandate 2026-10-28)
