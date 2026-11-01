# Validation Report — Go stack skill (`golang-pro`)

> **Verdict: PASS, with 3 WARN, archive-ready.** All 5 tasks are `[x]` with Reviewer PASS evidence. Every FR and NFR clause has evidence. Build gates are green: `npm test` 1249/0, `verify:cli` exit 0, `pack:dry-run` ships the folder, `git diff --check` clean. Two figure contradictions in the spec documents were corrected here. The WARNs are accepted process facts (budget raised twice, one HITL decision on a scanner-flagged link) and one CHANGELOG wording advisory.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/go-backend-routing/golang-skill` |
| Date | 2026-11-01 |
| HEAD | `09d9c7b` + this phase's spec-doc corrections |
| Auditor | Claude Opus 5.5. Every Implementer ran on `sonnet`, so author ≠ auditor holds |
| Approval Mode | pre-approved (JC 9:56); HITL decisions by JC at 10:21 (Option A), 10:44 (8 rounds), 11:08 (9 rounds / ~330 LOC) |
| Inputs | proposal, requirements, design, judgment, tasks, execution, test-report |

## 2. Summary

| Area | Result |
|---|---|
| Task completion | PASS: 5/5 `[x]`, each with a Reviewer PASS |
| File existence | PASS |
| Build integrity | PASS |
| Requirement coverage | PASS: FR-1–FR-5, NFR-1–NFR-3, at scenario and clause level |
| Code quality / 4R | PASS; advisories carried below |
| Design conformance | PASS; 2 figure corrections applied (§8) |
| Process | WARN ×2 (budget raised twice; HITL on the flagged link). Both decided by JC |
| CHANGELOG wording | WARN (advisory, KZ-002 class) |

## 3. Task Completion

| Task | Status | Evidence |
|---|---|---|
| T1 Security review | PASS, attempt 2 | `execution.md` T1: hashes VERIFIED; battery quoted verbatim and diffed IDENTICAL; perl C1/C1b; falsifiers; JC Option A |
| T2 Vendor folder | PASS, attempt 2 | 6 blob hashes = §4, strip-hash `99ef50f…`, 8 files, `-text` |
| T3a Command pools | PASS, attempt 1 | 4 hits, 0 load-direct |
| T3b Docs, counts, fixtures | PASS, attempt 2 | suite green; dry-run and doctor |
| T4 Contract test, CHANGELOG | PASS, attempt 2 (round 9) | 15 tests, 4 falsifier reds, guard proof |

## 4. File Existence

| Design §4 path | Present |
|---|---|
| `.claude/skills/golang-pro/` (`SKILL.md`, `LICENSE`, `NOTICE`, 5 references): 8 files | yes |
| `docs/skills/golang-pro.md` | yes |
| `test/golang-skill.test.js` | yes (16 tests after `/akili-test`) |
| `.gitattributes` `-text` line | yes |
| Modified: 3 command/doc pool files, 3 inventory docs, `docs/cli.md`, 3 test files, 1 fixture, `CHANGELOG.md` | yes |
| `bin/` | unchanged (FR-5 BUT) |

## 5. Build Integrity

| Command | Result |
|---|---|
| `npm test` | 1249 pass / 0 fail (`/akili-test`, quiet tree) |
| `npm run verify:cli` | exit 0; "14 commands \| 32 skills \| 8 resources" |
| `npm run pack:dry-run` | lists the 8 `golang-pro` files and `docs/skills/golang-pro.md`; 416 files, 3.6 MB |
| `git diff --check` | clean |
| Lint / type-check | none defined in `package.json`. This is the repo's standing state, not a gap this spec opened |

## 6. Requirement Coverage

Primary evidence is `test-report.md` §7, cross-checked against `requirements.md`.

| Requirement | Clause | Task | Evidence | Result |
|---|---|---|---|---|
| FR-1 | Pass scenario | T1 | verdict, battery, hashes, Reviewer | PASS |
| FR-1 | BUT no byte before verdict | T1→T2 order | T2 started after the T1 verdict and JC's decision (`git log`: T1 commits `99cdcc6` (verdict, HITL stop) and `e7978a6` (PASS) both precede the T2 vendor commit `f3c9036`) | PASS |
| FR-1 | AND IT MUST Trust Hub disposition | T1 | P-6 settled; raw-verified quotes | PASS |
| FR-1 | Fail scenario | T1 | Stop path exercised as a HITL stop; JC chose A | PASS |
| FR-2 | Body kept; BUT no line changed; AND IT MUST schema | T2, T4 | tests 1–9 | PASS |
| FR-2 | License/notice; AND IT MUST holder-name source | T2, T4 | tests 2–7, 10 | PASS |
| FR-3 | Pools; BUT no load-direct | T3a, T4 | test 11 (guarded sections); grep → 0 | PASS |
| FR-4 | Page, rows, governance, counts, CHANGELOG | T3b, T4 | tests 12, 16; `docs-overview`; Reviewer quote-check | PASS |
| FR-4 | AND IT MUST samber note | T3b | test 16 | PASS |
| FR-4 | BUT no security claim beyond verdict | T3b, T4 | test 16 heuristic + 3 Reviewer quote-checks | PASS |
| FR-5 | Every target; existing tests; BUT no installer change | T3b | dry-run 7 paths; doctor `OK golang-pro` ×5, `ok 54`; 6 installed copies byte-identical; `bin/` unchanged | PASS |
| NFR-1 | < 60 KB | T2, T4 | 52,775 B; test 15 | PASS |
| NFR-2 | no samber | T4 | test 13 | PASS |
| NFR-3 | gates | T4 | §5 | PASS |

No `PRODUCT_BUG`, no unremediated gap. The accepted gaps in `test-report.md` §9 (FR-1 judgment class; the FR-4 BUT heuristic) each carry a named substitute.

## 7. Linting & Code Quality

No linter is defined. Advisory findings below are carried forward from `execution.md`; they are **advisory** and drive no verdict.

| Source | Lens | Finding |
|---|---|---|
| T1 Reviewer | Reliability | `battery.sh` (scratch) reads a `grep -P` error as 0 hits. Any future vendoring review should check grep's exit status |
| T1 Reviewer | Risk | Upstream example content: `mockgen@latest` (archived module; successor `go.uber.org/mock`), Dockerfile on `alpine:latest` running as root and binding `0.0.0.0`. None of it is phrased as an agent directive |
| T3b Reviewer | Readability | `docs/skills/README.md` row sits after `kaizen`, not alphabetically. The page answer-first "never through command text" vs FR-3 "never load-directed". The Author string differs between the row ("Jeffallan") and the page ("GitHub user Jeffallan") |
| T4 Reviewer | Risk (KZ-002) | CHANGELOG bullet 2: "states Risk Level CRITICAL (audited Oct 27, 2026), on the finding quoted in the AKILI T1 record…" can read as CRITICAL resting on that finding. **WARN** below |
| T4 Reviewer | Readability | CHANGELOG bullet 4 "hash-locks the vendored folder" → "hash-locks the upstream bytes" (NOTICE and the added lines are pattern-checked, not hashed) |
| T4 Reviewer | Reliability | The frontmatter test splits on `"\n---\n"`; a CRLF file is already caught by the hash tests |
| Validator | Risk | `.agents/` was copied from the main checkout and `--fix`ed locally, which leaves leader `delegation` CUSTOM-EDITED and `shared-file-discipline` UNLOCATED. Same state as `changes/impeccable-hardening`; the maintainer's call |

## 8. Design Conformance

| Check | Result |
|---|---|
| DD-1 review before any `.claude/skills/` write; covers 7 files | PASS |
| DD-2 raw-byte blob lock + `-text` | PASS |
| DD-3 keys appended after `related-skills` | PASS |
| DD-4 samber in docs only, no Skill Map row | PASS |
| DD-5 counts/fixtures in T3b; T2 red as falsifier | PASS. Observed reds included 2 fixture readers the predicted list omitted; they were in P-2 and recorded as observed |
| Premise Ledger | P-5 settled (fallback name); P-6 settled (reason found); no premise refuted |
| Proposal alignment | Option A delivered; non-goals held (no samber byte, no body edit, no routing matrix); success criteria met |

**Cross-document figure check, with corrections applied here (correction closure run):**

| Figure | Contradiction | Correction |
|---|---|---|
| Folder file count | `proposal.md` §7 said "New folder (7 files)"; its own §13 and design §3 say 6 upstream + `LICENSE` + `NOTICE` = 8; shipped 8 | `proposal.md` §7 → 8, annotated |
| Vendored bytes | `tasks.md` (×2) and `design.md` §10 said "49,639 B vendored", which is the six skill files only. `LICENSE` (1,056 B) is also vendored (requirements §4) | Reworded to "49,639 B upstream skill files + 1,056 B `LICENSE`"; design §2 "≈49 KB" → "≈50 KB" |

Forward sweep (`grep -rn -E "7 files|49,639 B vendored|\b49 KB"`): the remaining hits are T1's "7 files" (6 skill files + `LICENSE`, correct), proposal "~49 KB" (the six skill files, correct), and `execution.md` (append-only history, kept as written). Backward sweep: no document cites the corrected proposal row.

Other figures checked: 31→32 skills; 308→316 files; 53→54 doctor `ok`; 1233→1248→1249 tests; the budget chain 6→8→9 rounds and ~260→~330 LOC. All consistent across `requirements.md`, `design.md`, `tasks.md` and `execution.md`.

## 9. Test Evidence Summary

`test-report.md`: PASS, 1 suite inline, 16 contract tests plus the inventory suites. The added FR-4 test had both falsifiers observed red. Install and doctor ran on 5 reporting targets plus the shared root.

## 10. Agent Guide / Constitution Impact

`execution.md`: Constitution Impact none; no module created or reshaped. Root `AGENTS.md` *Skill Usage* lists domain skills by example only, so no guide is stale. A CodeGraph re-index is recommended at archive (new test file).

## 11. Remediation

| # | Level | Item | Recommendation |
|---|---|---|---|
| W-1 | WARN (accepted) | Review budget exceeded twice (6→8→9 rounds, ~260→~330 LOC) | Decided by JC (10:44, 11:08). Kaizen input: all FAILs were authored-wording or test-anchor defects (KZ-002 recurrence) |
| W-2 | WARN (accepted) | Ships a link a third-party scanner labels malicious (`SKILL.md:129`) | JC Option A (10:21); recorded in NOTICE, docs page and CHANGELOG |
| W-3 | WARN (advisory) | CHANGELOG bullet 2 comma clause | Split the sentence at release prep ("…states Risk Level CRITICAL (audited Oct 27, 2026). The finding quoted in the AKILI T1 record is `EXTERNAL_DOWNLOADS`, on…"). Not applied here: it would change reviewed shipped text without a review |

No FAIL.

## 12. Archive Readiness Recommendation

**Archive-ready.** All tasks are `[x]`, there is no FAIL, the WARNs are accepted or carry a follow-up, tests cover every clause, and the drift corrections are recorded.

```text
/akili-archive changes/go-backend-routing/golang-skill
```

Release: minor (JC, proposal Q1). Not part of this run: no push, PR, merge, tag or publish.
