# Validation Report — Design Skill Routing

**Verdict: WARN — close to archive-ready, not yet.** No behavioral or test defect: 11/11 tasks closed with Reviewer PASS, `npm test` 1403/0, build and pack checks green. One minor FAIL (a docs role line), three WARN conformance gaps and a release-class note need a decision, and the T10 walkthrough mismatches M-1–M-5 are an HITL item for JC. **Stopped for JC** (HITL items).

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/design-skill-routing` |
| Date | 2026-11-01 |
| HEAD audited | `6a51585` (base `ac1d0db`) |
| Auditor | independent `opus` subagent, fresh context, read-only (Implementers ran on `sonnet`: author ≠ auditor); report assembled by the Leader |
| Approval Mode | `pre-approved (JC, 2026-11-01 10:04 UTC-5, via Grok Bot)` — HITL items stop |
| Inputs | proposal, requirements rev. 2 (+ FR-10 amendment E-2), design rev. 2, tasks, judgment (fixed, not re-judged), execution, test-report |

## 2. Summary

| Area | Result |
|---|---|
| Task completion | PASS |
| File existence | PASS (approved deviations E-1, `/akili-test` coverage file) |
| Build integrity | PASS |
| Requirement coverage | 10 PASS · **FR-13 FAIL (minor)** · FR-6, FR-14 WARN · NFR-4/NFR-7 WARN (accepted gaps) |
| Quality (4R, advisory) | WARN — reliability gaps M-1–M-4, resilience gap = FR-6 |
| Design conformance & figures | PASS, with three figure WARNs |
| Proposal alignment | PASS |
| Constitution impact | PASS — none |
| Release class | WARN — CHANGELOG says patch; the spec is minor |

## 3. Task Completion

| Check | Result | Evidence |
|---|---|---|
| 11/11 `[x]` | PASS | `tasks.md`; T5 closed after E-2 (JC 11:08) |
| Execution entry + verification + closing Reviewer PASS per task | PASS | `execution.md`; T8a, T9, T10 FAIL → PASS on attempt 2; E-1 (JC 10:41) and E-2 recorded |

## 4. File Existence

| Item | Result |
|---|---|
| Design §4 files present (matrix new; bridge; 4 commands; 2 personas; 3 adapted skills; `AGENTS.md`; `CHANGELOG.md`; docs; new test; bridge test) | PASS |
| Untouched: `.claude/skills/impeccable/**`, `bin/`, `scripts/`, `akili-execute.md`, `akili-validate.md`, `digests.json` | PASS |
| Extra: `test/install-cursor.test.js` (E-1, approved), `test/design-skill-routing-coverage.test.js` (`/akili-test`) | PASS |
| Listed but unchanged on purpose: `docs/commands/akili-test.md`, `akili-audit.md` (P-10 closure, T8b) | PASS |

## 5. Build Integrity

| Command | Result |
|---|---|
| `npm test` | 1403 pass, 0 fail (Leader and auditor re-runs) |
| `npm run verify:cli` | "14 commands \| 31 skills \| 8 resources" |
| `npm run pack:dry-run` | 409 files; ships `.claude/skills/impeccable-bridge/references/design-routing.md` (12.3 kB) |
| `git diff --check` | clean |
| `node bin/akili.js install --tool all --dry-run` | runs; 98 developer-local entries differ (expected) |

## 6. Requirement Coverage

| Req | Result | Shipped text · evidence |
|---|---|---|
| FR-1 | PASS | Matrix *Matrix* (8 × 4, one lead per cell), *Supporting line*; author tests 1–3 |
| FR-2 | PASS | Matrix *Environment classification*; specify Step 2.1; coverage FR-2 tests |
| FR-3 | PASS | 9 cards, headings resolve; author tests 4–5 |
| FR-4 | PASS | *Build route* 1–4, 7; specify *Preferred UI/UX skill rule*; bridge execute row. Agent behavior: T10 only |
| FR-5 | PASS | *Build route* step 6 (AKILI scope limit); coverage FR-5 |
| FR-6 | **WARN** | Step 5 says "not run" but does not state the BUT clause (no degraded inline pass in the build thread); the test asserts the "not run" string only, so test-report §7 overstates "BUT no inline pass". Open since the T1 advisory |
| FR-7 | PASS | Matrix *Motion*; specify animation line; gsap SKILL (M-4 noted) |
| FR-8 | PASS | propose *Mockup Fallback* source-keyed; advisory: top-level Claude Design bullets readable as applying to `vendored` (T4) |
| FR-9 | PASS | cards, bridge line, governance test |
| FR-10 (amended) | PASS | Step 8D item 4 "when the project has UI", six fields, Safe Update; advisory: no explicit "no-UI → no block, not ENV-1" sentence |
| FR-11 | PASS | specify 2.1, 3.2; coverage FR-11 |
| FR-12 | PASS | `akili-seo.md` through the bridge |
| FR-13 | **FAIL (minor)** | `docs/overview.md` `frontend-design` row calls it "the implementation layer the routing matrix assigns it" — the matrix makes it the ENV-0 lead only ("Must not decide: anything while Impeccable is present"); "implementation layer" is the stack-skill term. AGENTS.md set and the stale-phrase sweep PASS |
| FR-14 | **WARN** | `ui-ux-pro-max/SKILL.md` integration table ("leads only when the Impeccable skill source is `missing`", "the main review when … `missing`"), `docs/overview.md` ("a fallback lead") and bridge *Roles* wording conflict with the matrix (ENV-0 lead = `frontend-design`; `ui-ux-pro-max` support; evaluate lead = `frontend-design` checklist review) |
| NFR-1/2/3/5/6 | PASS | tests; vendor hash test |
| NFR-4, NFR-7 | WARN (accepted) | prose obligations; test-report §9 |

## 7. Linting & Code Quality (4R — advisory)

| Lens | Finding |
|---|---|
| Readability | Clear decision rule and named sections. Nits: *Build route* heading says "vendored/user-installed" while step 7 covers ENV-0; `AGENTS.md` says `impeccable` "verbatim" vs the bridge's "byte-identical except frontmatter" |
| Reliability | T10: **M-1** no activity definitions (build-new vs build-within-system boundary); **M-2** `onboard` unreachable at ENV-3 build-new; **M-3** page-mode decision pointer only as card evidence; **M-4** no platform-motion value in the `Design route:` motion field |
| Resilience | FR-6 gap: an Implementer without subagents could read upstream's "inline substitute" as permission |
| Risk | Low — additive text, pointer-reached; vendored text not contradicted (checked *Commands*, *Modes*, *Established world*, `new-work` §3, `polish`, `animate`) |

Carried-forward ADVISORY (execution.md): T1 "direction picker" term, `new-work` not a *Commands* row, step 5 inline ban · T2 bridge line omits "only … task skill lists" · T4 Claude Design bullet placement, editor's-note wording · T6 nested parenthesis, `digests.json` at release · T8a pointer could name a section · T8b `ui-ux-pro-max` "leads when missing" tension, Stitch dropped from the constitution doc's Step 4 entry · T9 test 7 first-substring order check, hand-maintained test-5 list · T10 M-1–M-5.

## 8. Design Conformance

| Item | Result |
|---|---|
| DD-1 – DD-14 | PASS (DD-12 deviation justified by E-1 and `/akili-test`) |
| 11 tasks; 14 review rounds (4+3+3+2+2) | PASS |
| LOC ~448 vs ~650 | PASS — 641 insertions incl. the 193-line `/akili-test` coverage file (≈ 99 % of the budget across execute + test) |
| Premise Ledger "19 rows · 19 verified" | **WARN** — P-4 is refuted, not verified: "18 verified · 1 refuted" |
| "Six commands read the bridge" (design §7.2, P-15) | **WARN** — true at `a026208`; `akili-seo` now loads it → `grep -ln impeccable-bridge .claude/commands/*.md` = 7; the matrix "Used by" line omits seo |
| 1403 tests; `install-cursor` 309/323 | PASS (`find .claude/skills -type f` → 309) |
| Proposal intent, scope, non-goals, D1–D5 | PASS. Success criterion 1 (an `execution.md` showing playbook → craft floor → polish on a real UI task) cannot be shown in this repo — residual risk until a UI spec runs |

## 9. Test Evidence Summary

`test-report.md`: PASS, 1403/0, 0 product bugs; 18 contract tests for this spec (9 author + 9 Tester), every falsifier executed. Correction: §7's FR-6 "BUT no inline pass" row is covered only by the "not run" string (see FR-6 WARN). The report's "commit under test … + uncommitted" is now committed as `6a51585`.

## 10. Agent Guide / Constitution Impact

None — a new reference file inside an existing skill; no module, boundary or `## Module Guides` change. Repo `AGENTS.md` gained `## Design Skills` (in scope, FR-13).

## 11. Remediation

| # | Item | Kind | Recommendation |
|---|---|---|---|
| R-1 | FR-13: `docs/overview.md` `frontend-design` row → "lead for direction and craft only when no Impeccable skill is found (ENV-0); a quick DFII check otherwise" | single-answer factual fix (docs) | Fix now |
| R-2 | FR-14: align `ui-ux-pro-max/SKILL.md` integration rows, `docs/overview.md` "a fallback lead" and bridge *Roles* with the matrix (ENV-0: `frontend-design` leads, `ui-ux-pro-max` supports) | conformance fix (shipped skill text) | Fix now |
| R-3 | FR-6: one sentence in *Build route* step 5 — never run Impeccable's degraded inline finish pass in the build thread; add a test assertion; correct test-report §7 | conformance fix (shipped matrix + test) | Fix now |
| R-4 | CHANGELOG `### Notes` "Release class: patch" → minor (new routing behavior, Step 8D block) | release decision | JC decides |
| R-5 | Figures: Premise Ledger "18 verified · 1 refuted"; "seven commands read the bridge" + matrix "Used by" adds seo | spec/doc factual | Fix now |
| HITL | **M-1 – M-5** (T10): activity definitions; `onboard` at ENV-3; page-mode pointer; platform-motion value; one over-specified expected cell | scope — not fixable in this spec (advisory never becomes a task) | JC decides: defer to a follow-up proposal |

R-1, R-2, R-3, R-5 are small edits to shipped rules text: each would go through Implementer → non-author re-run → Reviewer before archive.

## 12. Archive Readiness Recommendation

**Not ready yet; close.** Recommended path: JC approves R-1, R-2, R-3, R-5 as a fix round (≈ 15 lines + one test assertion), decides R-4 (recommended: minor), and defers M-1–M-5 to a follow-up proposal; then re-validate the fix round and run `/akili-archive changes/design-skill-routing`.
