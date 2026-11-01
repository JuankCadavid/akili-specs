# Kaizen Entry — changes/design-skill-routing

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/design-skill-routing` |
| Date | 2026-11-01 |
| Branch | `JuankCadavid/design-skill-routing` (Branch Context: **spec** — `Integration Branch: dev` pinned) |
| Archive Run | 1 |
| Approval Mode | `pre-approved (JC, 2026-11-01 10:04 UTC-5, via Grok Bot)` |

## Metrics

| Signal | Value | Source |
|---|---|---|
| Tasks executed | 11 (+ 1 validation fix round) | tasks.md, execution.md |
| Reviewer FAIL rework attempts | 3 (T8a ×1 role line contradicting a card; T9 ×1 test-5 scope + missing test-2 red; T10 ×1 comparison mis-calls) | execution.md |
| HALTs / FATAL_FAILs | 0 / 0 | execution.md |
| Pivots | 0 (two escalations: E-1 missed consumer; E-2 FR-10 tension → requirement amendment) | execution.md — Escalation E-1, E-2 |
| PRODUCT_BUGs | 0 | test-report.md |
| Judgment-day severe findings | 4 confirmed + 1 disputed (J-5), fixed, not re-judged | judgment.md |
| Validation FAIL / WARN | 1 / 3 (+ figure WARNs) → 0 / 0 after the fix round | validation-report.md |
| Tasks closed under `REVIEW_WAIVED` (by flag) | 0 | execution.md |
| Tasks closed under `REVIEW_SKIPPED` (by task) | 0 | execution.md |
| Escaped defects (§3) | 0 (validation findings hit tasks closed with a Reviewer PASS, none skip-closed) | validation-report.md |
| Budget | ~654 LOC vs ~650 (accepted by JC 12:02); 15 review rounds vs ~22 | execution.md |

## Lessons

- **KZ-changes--design-skill-routing-1 — Any new file under `.claude/skills/` breaks the packaged-file count in `test/install-cursor.test.js`.** (Product, Medium)
  - Root cause: the design's consumer search keyed on skill names (P-11 listed `install-cursor.test.js` by name) but no one read its count assertion; `SKILL_FILE_EXPECTED = 247 + 58 + 3` pins every file under `.claude/skills/`, so adding one reference file turned it red and stopped the run for a scope decision.
  - Evidence: execution.md — T1 *Reds* (2) and *Escalation E-1*; design.md Premise Ledger P-11, P-19.
  - Standardization: → P1

- **KZ-changes--design-skill-routing-2 — A requirement that scaffolds a domain-specific artifact into every project must state which projects get it.** (Methodology, Medium)
  - Root cause: FR-10 said Step 8D SHALL scaffold a `### Design routing` block with no applicability condition; for a project with no UI the ladder falls through to ENV-1 and writes false routing. The Implementer patched it with an unapproved guard, the Reviewer raised a spec tension, and the run stopped for a requirement amendment.
  - Evidence: execution.md — T5 entry and *Escalation E-2*; requirements.md FR-10 (amended, *Project with no user interface*).
  - Standardization: → P2 (upstream)

## Noted, not a lesson

- Recurrence of **KZ-changes--kaizen-loop-closure-2** (paraphrase sweep): the FR-13 sweep keyed on literal phrases; paraphrased role claims ("leads only when … `missing`", "implementation layer") survived T7/T8b review and surfaced at validation (FR-13 FAIL, FR-14 WARN) → P3 (digest-update).
- P-8's citation was run on a machine with stale global installs (`grep -c design-evaluation` → 7 from "skip existing … differs" lines); on a clean `HOME` it is 0 — judgment-day J-2. Environment-dependent citations should run on a clean environment; one occurrence, below the bar.
- Leader-authored derived evidence (T10 comparison) mis-called three cells; the override-(c) Reviewer caught it. Working as designed.
- T9 baseline red was setup-level for greenfield artifacts; executed falsifiers supplied assertion-level reds — the greenfield exception held.
- Implementer budget: wave-parallel Implementers ran `npm test` against siblings' in-flight edits and reported transient reds; the Leader's quiet-tree re-run resolved each. Below the bar.

## Pending Items

### P1

| Field | Value |
|---|---|
| Kind | standardization |
| Target | `AGENTS.md` (`## Verification`) |
| Edit | Adding or removing any file under `.claude/skills/` changes `SKILL_FILE_EXPECTED` in `test/install-cursor.test.js`; update it in the same task. |
| Severity | Medium |
| Status | pending |

### P2

| Field | Value |
|---|---|
| Kind | upstream |
| Target | methodology |
| Edit | `/akili-specify` Step 1.2 guideline: "A requirement that scaffolds a domain-specific artifact into projects (a UI block, a video section, a cloud contract) states its applicability — which projects receive it and what a project outside the domain receives — as a scenario with a `BUT it must NOT` clause." |
| Severity | Medium |
| Status | pending |

### P3

| Field | Value |
|---|---|
| Kind | digest-update |
| Target | KZ-changes--kaizen-loop-closure-2 |
| Edit | Add `changes/design-skill-routing` as a source; recurrence note: "**recurred (changes/design-skill-routing: the FR-13 stale-phrase sweep keyed on literal phrases; paraphrased role claims — `ui-ux-pro-max` \"leads only when … `missing`\", `frontend-design` \"implementation layer\" — survived T7/T8b review and surfaced at validation as FR-13 FAIL / FR-14 WARN)**" |
| Severity | Medium (unchanged) |
| Status | pending |

Constitution sync (Step 3): no `## Constitution Impact` notes; root-guide factual sweep found no falsified claim (the spec itself rewrote `AGENTS.md` `## Design Skills`); no TRD in this repository; not a family child — no `guide-sync`, `factual-sweep` or `trd-adr` items.
