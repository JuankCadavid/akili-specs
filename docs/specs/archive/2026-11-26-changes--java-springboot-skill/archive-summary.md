# Archive Summary: changes/java-springboot-skill

> **Delivered and validated.** `java-springboot` is a vendored stack skill. One stack-detection table is read by six commands. `docs/skills/by-stack.md` is new. `pr-review` is now 1.1.0 and `akili-panel` 1.1.3. Validation: PASS, 0 FAIL, 2 WARN accepted. `npm test` 2303 / 0. Local only: nothing pushed, tagged or published.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/java-springboot-skill` |
| Branch | `feat/java-springboot-skill` (local only) |
| Baseline | `cb2416e` (origin/dev) |
| Approval Mode | gated through Phase 2; routine gates auto-approved on JC's mandate from Phase 3 on |

## 2. Original Spec Path

`docs/specs/changes/java-springboot-skill/`

## 3. Archive Date

2026-11-26

## 4. Final Status

**Complete.** 10/10 tasks are `[x]` and each closed on a Reviewer PASS. No HALT, Pivot or tripwire fired. Budget used: 10 tasks against 10, 1,376 LOC against about 1,560, and 17 review rounds against 20.

## 5. Requirements Delivered

| ID | Delivered |
|---|---|
| FR-1 | 7 pinned blobs re-hashed and recorded before any copy, with the ratings as fetched |
| FR-2 | `.claude/skills/java-springboot/`: 6 upstream files, `LICENSE`, `NOTICE`; frontmatter lines appended only |
| FR-3 | `java-springboot` in all four stack-skill pools; never load-directed |
| FR-4 | `software-architect/references/stack-detection.md`: rows for Go, Java / Spring Boot (Spring marker required, version catalogs included), NestJS, Angular, React / Next.js, Tailwind, shadcn/ui, AWS SAM / Serverless / CDK; any-stack rows; read rules; outcomes |
| FR-5 | Readers: constitution Steps 5, 8D and the run contract; specify 2.1; propose 0; audit; review Step 2 (base tree); security Step 2 |
| FR-6 | Backend routing: Java / Spring Boot stack row, `implement` matrix row, expertise card |
| FR-7 | `docs/skills/by-stack.md`, linked from 4 hubs |
| FR-8 | `docs/skills/java-springboot.md`; counts at 38 skills, 16 `stack`; CHANGELOG `Unreleased` entries |
| FR-9 | Install and doctor carry it on all targets; no installer code changed |
| NFR-1–5 | Under 50 KB; no sibling files; one definition; no spec-path reads; gates green |

## 6. Files Changed Summary

From `execution.md` and `git diff --name-only cb2416e HEAD`:
- **New skill:** 8 vendored files.
- **New reference:** `stack-detection.md`.
- **Six command files:** `akili-{constitution,specify,propose,audit,review,security}.md`.
- **`software-architect`:** `SKILL.md` and `backend-routing.md`.
- **`pr-review`:** `post-review.cjs`, `large-prs.md` and `SKILL.md` (1.1.0).
- **`akili-panel`:** `flow.mjs`, `plugin.json` and `README.md` (1.1.3).
- **Docs (15 files):** README, AGENTS.md, CHANGELOG, `docs/{overview,README,cli,flow}.md`, `docs/commands/akili-{constitution,review,security}.md` and `docs/skills/{README,governance,pr-review,java-springboot,by-stack}.md`.
- **Repo config:** `.gitattributes`.
- **Tests:** 5 new test files (`java-springboot-skill`, `stack-detection`, `stack-detection-readers`, `java-springboot-acceptance`, plus additions in `pr-review-scripts`). 9 existing tests and fixtures had their counts updated.

## 7. Test Evidence Summary

PASS (`test-report.md`). 2 suites: FR-9 inline and the contract suite by one Tester on opus. The contract suite added 11 acceptance tests, each with an executed falsifier. 0 product bugs. Accepted gaps: FR-1 by record, the design.md halves, runtime behavior via the T10 walkthrough, and a manual diff of `security-audit` (empty).

## 8. Validation Summary

PASS, 0 FAIL, 2 WARN (`validation-report.md`). R-1: FR-1's hash count was corrected from six to seven at validate.

## 9. Accepted Warnings Or Follow-Ups

| Item | Status |
|---|---|
| W-1: design §4 omitted `docs/commands/akili-security.md` | Synced at archive (one row) |
| W-2: JC's human check of the T10 walkthrough (`execution.md` T10 *Walkthrough*) | Open for JC, non-blocking |
| Release | Minor. Re-check the `docs/ci` `akili-specs` pin (P-17) when it ships; JC owns push, PR, release |
| Advisories (validation §7, 8 items) | Recorded, not tasks; `/akili-quick` or later-spec candidates |
| CodeGraph | Re-index recommended after merge |

## 10. Historical Notes

- **Phase 1 gate (JC):** scope widened to the constitution run contract, `/akili-review`, `/akili-security` and AWS CDK detection.
- **Judgment day:** 4 confirmed severe findings (J-1 to J-4), all fixed before tasks. J-2 moved review stack evidence to the base tree; J-3 added the local `git show` carve-out.
- **T10 walkthrough:** the held-out-fixture walkthrough found a Gradle catalog-alias double report that 9 text tests missed; fixed by T3 attempt 2.

## 11. Diagrams

None. The spec has no `diagrams/` folder and no diagram slot, and no baseline diagram went stale.
