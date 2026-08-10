# Validation Report — `ai-agent-development` Stack Skill

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/ai-agent-development-skill` |
| Validation Date | 2026-08-10 |
| Validator | Session Leader (wrote no artifact content; every artifact was independently authored by an Implementer and audited by a fresh-context Reviewer on a different model — evidence reused per the token rule, mechanical checks re-run from scratch) |
| Verdict | **READY TO ARCHIVE — 0 FAIL, 4 WARN (acceptance requested), all PASS otherwise** |

## 2. Summary

All six tasks PASS with Reviewer evidence; all mechanical gates re-run fresh at validation time and green; the two rework loops (T5, T6) closed with verified remediation. No FAIL findings. Four WARNs need user acceptance, led by one discovered *at validation*: the npm package ships the spec's internal working documents (pre-existing `files: ["docs"]` whitelist — this spec is simply the first committed spec folder).

## 3. Task Completion

| Task | Status | Attempts | Evidence |
|---|---|---|---|
| T1 SKILL.md | PASS | 1 | execution.md §T1; Reviewer verified frontmatter field-by-field at source |
| T2 framework-selection.md | PASS | 1 | execution.md §T2; 9/9 sources independently re-fetched |
| T3 langgraph-patterns.md | PASS | 1 | execution.md §T3; 9/12 pins independently re-fetched |
| T4 akili-spec-mapping.md | PASS | 1 | execution.md §T4; 3/3 sources re-fetched |
| T5 aws-deployment.md | PASS | 2 | execution.md §T5 full rework history (Lambda Durable Functions omission → remediated, re-audited) |
| T6 wiring + surfaces + changelog | PASS | 2 | execution.md §T6 full rework history (truthfulness clause on 2 surfaces → remediated, re-audited) |

## 4. File Existence (design §4 tree, re-run)

6/6 files exist; every size within its budget: SKILL.md 68/≤150 · framework-selection 102/~120 · langgraph-patterns 163/~180 · akili-spec-mapping 147/~150 · aws-deployment 65/~90 · docs page 41/~40.

## 5. Build Integrity (re-run)

| Check | Result |
|---|---|
| `npm run verify:cli` | PASS — 11 commands, **24 skills** (new skill registered), 7 resources |
| `npm run pack:dry-run` | PASS — all 5 skill files + docs page in the tarball (see WARN-1) |
| `git diff --check` | Clean |

## 6. Requirement Coverage (clause level; evidence = execution.md + fresh greps)

| Requirement | Clauses | Result |
|---|---|---|
| FR-1 frontmatter | scenario + BUT (adapted-fields grep = 0, re-run) + AND IT MUST (10 trigger keywords) | PASS |
| FR-2 matrix | both scenarios + BUT (recognition restraint, Reviewer-judged) + AND IT MUST (`Last verified:` present, re-run) | PASS |
| FR-3 spec mapping | scenario + AND IT MUST (no-pass rule at file line 5; example discharges disqualifier) | PASS |
| FR-4 deferral | both scenarios + BUT no-vendor (S-1 held "under pressure" per T5 re-audit) + AND IT MUST docs substitutes (4/4 rows, re-run wording check at T6) | PASS |
| FR-5 wiring | scenario + BUT — re-run: exactly 3 hits, all in carve-outs (1)/(2), zero load directives | PASS |
| FR-6 inventory | scenario + AND IT MUST — re-run: 6/6 surfaces, binding `stack` consistent | PASS |
| NFR-1 token economy | all six sizes in budget (§4 above) | PASS |
| NFR-2 pinned sources | `## Sources` 4/4 (re-run); every file's claims fetch-verified by Implementer AND re-fetched by Reviewer | PASS |

**Defect-class gates (requirements §8):** governance grep PASS · frontmatter diff done by Reviewer (final HITL glance still yours — WARN-4) · inventory grep PASS · `test -f` sweep PASS (T6, closes the T3/T4/T5 dangling-link advisories) · **misinformation gate (substituted, human):** exercised for real — it produced the T5 FAIL, the T2 design correction, and the T6 truthfulness FAIL. The gate demonstrably ran; residual risk on unreviewed claims accepted per requirements §8.

## 7. Quality Audit — 4R advisories carried forward (advisory, non-gating)

1. **Open:** `SKILL.md:60` says "AgentCore **Harness** versus Lambda versus ECS"; the reference compares **Runtime**. Flagged twice (T5, T6). One-word fix — `/akili-quick` candidate.
2. Anthropic pin in akili-spec-mapping.md 301-redirects cross-host (resolves today; re-pin at next revalidation).
3. langgraph-patterns.md had the highest source-churn at authoring (2/12 pins corrected); hang any future revalidation trigger there.
4. Cosmetic: bolded "standard" inside a quote (aws-deployment), positional "third row" reference + late matrix naming (SKILL.md).

## 8. Design Conformance

PASS. One intentional, recorded, user-approved deviation: design §7 CrewAI row corrected mid-execution (source-contradicted durability claim; two-direction sweep run; commit `583252e`). Proposal §5's `runtimes.md` deliverable superseded by design DD-3 (recorded in-design). Cross-document figures (budget vs actuals) agree: 6 tasks, ~586 new lines vs ~600–730, review rounds over budget by 2 — escalated at gates, causes recorded.

## 9. Test Evidence Summary

No `test-report.md` (WARN-3). For this docs-only artifact the executable gates are the greps/`test -f`/`wc -l` battery: run by Implementers in-loop, re-run independently by Reviewers per task, re-run a third time fresh in this validation (§4–§6). The dominant defect class (prose misinformation) has no automated gate by design; its substituted human gate ran and caught real defects (§6).

## 10. Agent Guide / Constitution Impact

execution.md records **none** (no module boundary or public code surface changed). Root-guide factual sweep and CodeGraph re-index fall to `/akili-archive`.

## 11. Remediation / WARN acceptance requested

| # | Finding | Level | Recommended action |
|---|---|---|---|
| 1 | **npm tarball ships `docs/specs/**`** — internal working docs (execution log, judgment, this report) publish with the package; pre-existing `files: ["docs"]` policy, first surfaced by this first-ever committed spec folder. Archiving moves, not removes, them from the tarball | WARN | User decision (packaging policy, outside spec scope): exclude `docs/specs` from `files`, or accept shipping them |
| 2 | `proposal.md` Document Control still reads "Draft — awaiting approval" though requirements.md records approval 2026-08-09 | WARN | One-line status flip, or accept as historical |
| 3 | No `test-report.md` | WARN | Accept for docs-only spec (evidence in §9), or run `/akili-test` |
| 4 | HITL frontmatter schema glance (T1 Done criterion) not yet performed by the user | WARN | 2-minute look at `SKILL.md` frontmatter vs `docs/skills/governance.md` schema |

## 12. Archive Readiness Recommendation

**READY** — zero FAIL. Archive with `/akili-archive changes/ai-agent-development-skill` once WARNs 1–4 are accepted or assigned as follow-ups. Release classification **minor** stands (`npm run release:minor` after archive).
