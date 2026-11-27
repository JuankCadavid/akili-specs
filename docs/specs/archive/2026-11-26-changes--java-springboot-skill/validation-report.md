# Validation Report — Java / Spring Boot stack skill, stack detection, skills-by-stack page

> **Verdict: PASS, 0 FAIL, 2 WARN (both accepted). Archive-ready.** All 10 tasks are done with Reviewer PASS. All 9 FRs and all 5 NFRs have evidence. Gates are green: `npm test` 2303 / 0, `verify:cli`, `pack:dry-run` and `git diff --check`. One factual correction was applied to `requirements.md` FR-1, the six-vs-seven hash count; it is logged in §11.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/java-springboot-skill` |
| Date | 2026-11-26 |
| Branch / HEAD | `feat/java-springboot-skill` @ `7b71d1a` (local only) |
| Auditor | Claude Opus 5.5 (session). The Implementer was `sonnet`, so author ≠ auditor holds |
| Approval Mode | Routine gates auto-approved on JC's mandate (2026-11-26); non-process decisions go back to JC |
| Baseline docs | `docs/prd.md`, `docs/ux-ui/design.md`, `docs/trd/trd.md` and `docs/specs/general-setup/` do not exist in this repo. `AGENTS.md` serves as the constitution |

## 2. Summary

| Check | Result |
|---|---|
| Task completion | PASS (10/10) |
| File existence | PASS, with one WARN (W-1: design §4 omits a file T7 owns) |
| Build integrity | PASS |
| Requirement coverage | PASS (FR-1 to FR-9, NFR-1 to NFR-5) |
| Code quality (4R, advisory) | no spec violation; advisories carried in §7 |
| Design conformance | PASS (DD-1 to DD-12 hold); figure check found 1 spec defect, corrected |
| Test evidence | PASS (test-report.md reused) |
| Constitution Impact | none recorded; `AGENTS.md` *Backend Skills* already names `java-springboot` |
| Open for JC | W-2: human check of the T10 walkthrough |

## 3. Task Completion

| Task | Status | Evidence |
|---|---|---|
| T1 Hash gate | PASS | 7 hashes recorded before any copy; falsifier red observed; Reviewer PASS |
| T2 Vendor | PASS | 8 files; Reviewer PASS |
| T3 Table | PASS | 2 attempts (the walkthrough found the catalog-alias gap); Reviewer PASS |
| T4 Constitution S1–S3 | PASS | 2 attempts; Reviewer PASS |
| T5 Specify, propose, audit S4–S6 | PASS | 3 attempts; Reviewer PASS |
| T6 `pr-review` filter | PASS | first pass |
| T7 Review and security S7–S8 | PASS | 2 attempts; Reviewer PASS |
| T8 Backend routing | PASS | first pass |
| T9 Docs, links, governance, CHANGELOG | PASS | first pass |
| T10 Sweep, panel, contract tests, walkthrough | PASS | first pass; Leader evidence re-run VERIFIED |

Every task entry in `execution.md` carries files changed, a red run, a falsifier, an evidence re-run and a Reviewer verdict. There is no `REVIEW_SKIPPED` or `REVIEW_WAIVED`. The budget held: 10 tasks against 10, 1,376 LOC against about 1,560, and 17 review rounds against 20.

## 4. File Existence

Every path in design §4 exists at HEAD: the 8 vendored files, `stack-detection.md`, both doc pages, and both new test files. Every modified path in §4 appears in `git diff --name-only cb2416e HEAD`, and no file was deleted.

| ID | Finding | Result |
|---|---|---|
| W-1 | `docs/commands/akili-security.md` changed (a one-line Step 2 mention), but design §4 does not list it. It **is** in the approved scope: `tasks.md` T7 owns it and `execution.md` T7 records it | WARN (design table omission, no scope drift) |
| — | `test/stack-detection-readers.test.js` (T7/T10) and `test/java-springboot-acceptance.test.js` (from `/akili-test`) are new and not in §4, which lists only "Existing tests and fixtures" and two new files | PASS (tests owned by tasks or by the test phase) |

## 5. Build Integrity

| Command | Result |
|---|---|
| `npm test` | 2303 / 0 |
| `npm run verify:cli` | 0: `14 commands \| 38 skills \| 1 plugin \| 8 resources (akili-specs v2.46.0)` |
| `npm run pack:dry-run` | 0 |
| `git diff --check` | clean |
| `git diff --stat cb2416e -- bin/` | empty (FR-9 BUT) |

## 6. Requirement Coverage

Primary evidence is the `test-report.md` §7 clause matrix, cross-checked against `requirements.md` §6. Every scenario and every `BUT` / `AND IT MUST` clause is owned by a task in the `tasks.md` *Coverage* table, and test-report §7 names a test or a record for each one.

| Requirement | Result | Note |
|---|---|---|
| FR-1 Hashes are the reviewed bytes | PASS | Evidence by record (`execution.md` T1, 7 hashes, ratings as fetched incl. `INDIRECT_PROMPT_INJECTION`). Its text was corrected (§11) |
| FR-2 Provenance | PASS | Hash, frontmatter, LICENSE and NOTICE tests. NOTICE quote-checked at HEAD: holder, pin, appended lines, ratings, no affiliation |
| FR-3 Pools, no load-direct | PASS | |
| FR-4 Detection table (6 scenarios) | PASS | Text contracts. Runtime behavior: the T10 walkthrough (W-2) |
| FR-5 Readers (10 scenarios) | PASS | `BUT` clauses: audit report-only, filters unchanged, lens rules unchanged, no vendored `security-audit` edit (diff empty), no scope narrowing |
| FR-6 Routing | PASS | No existing lead changed (test) |
| FR-7 By-stack page | PASS | Exactness against the governance `stack` row; 4 links |
| FR-8 Docs and counts | PASS | Count 38 is consistent (`verify:cli` agrees). Quote-check (KZ-002) at HEAD: "tested on Boot 4.1.1 and 3.5.16" matches upstream `SKILL.md:16`; CHANGELOG claims match the files; no security claim beyond the verdict and ratings |
| FR-9 Install and doctor | PASS | 5 targets OK and HEALTHY; grokbot planned |
| NFR-1 to NFR-5 | PASS | |

There is no eval gate: `AI Agent: no`.

## 7. Linting & Code Quality

No linter is configured beyond `git diff --check`, which is clean. The **4R sweep (advisory only)** found no spec violation.
- **Readability:** pointer sentences name the table by path, never by line (NFR-3).
- **Reliability:** contract tests have executed falsifiers.
- **Resilience:** the ask-before-fallthrough rule is in place for markerless Java.
- **Risk:** the IaC globs widen `full`-tier reviews, an over-match that DD-6 accepts.

Advisories carried forward from `execution.md` and `test-report.md` (not tasks; candidates for `/akili-quick` or a later spec):
1. **Tautological HEAD test.** `stack-detection-readers` › `verbatim brief addenda are byte-unchanged vs HEAD` compares the tree to itself once the change is committed.
2. **Wrong labels.** Tests in that file under the `P9` prefix are labelled "FR-9" but prove FR-3, NFR-3 and NFR-4.
3. **Weak NFR-4 guard.** It matches the literal path only; a `path.join` read would slip past.
4. **Hard-coded skill list.** The exactness test lists skills by hand; deriving it from `binding: stack` frontmatter would maintain itself.
5. **S3 column name.** Design §7 S3 says "*Commands read from*", while the table column is "*Run and build commands read from*".
6. **T8 card.** The *Must not decide* could also name "installing a sibling skill" (rule 9 already covers it).
7. **Brief boundary.** The `docs/commands/akili-review.md` one-liner omits the installed-package boundary.
8. **Duplicate lines.** A root version catalog shared by several modules can yield identical detection lines (cosmetic).

## 8. Design Conformance

- **Design decisions:** DD-1 to DD-12 hold at HEAD. The table lives in `software-architect/references/stack-detection.md` (DD-1). CDK is keyed on `cdk.json` alone (DD-4). The Spring marker rule includes version catalogs (DD-5). `pr-review` is `1.1.0` (DD-8) and `akili-panel` is `1.1.3` (DD-11).
- **Execute-time edits:** both are recorded in `execution.md` (the FR-4 React clause J-8, and design §9 `SENSITIVE_GLOBS` + `**/libs.versions.toml`).
- **Proposal:** intent and non-goals hold. No sibling skill was vendored, no upstream body edit was made, and nothing is Kotlin-specific.
- **Cross-document figure check:**
  - "seven pinned files" (NOTICE, `docs/skills/java-springboot.md`) agrees with requirements §3, §4 and `tasks.md` T1.
  - FR-1 said "six files … the six hashes", which contradicted §4's seven rows. **Corrected** (§11).
  - "six commands" (CHANGELOG, the table's *Readers*) agrees with the reader set.
  - The 38 skills and 16 `stack` skills agree with `verify:cli` and governance.

## 9. Test Evidence Summary

`test-report.md` records PASS: 2 suites, 1 Tester (opus) plus FR-9 run inline, 11 new acceptance tests with executed falsifiers, and 0 product bugs. The accepted gaps (FR-1 by record, the design.md halves, runtime behavior through the walkthrough, the manual `security-audit` diff, the quote-check done here in §6) all have a recorded reason.

| ID | Finding | Result |
|---|---|---|
| W-2 | The §8 defect class "an agent misapplies the table" rests on the T10 walkthrough, and JC's human check of it was deferred by mandate. The rows and fixtures are in `execution.md` T10 | WARN (accepted gap; open for JC, non-blocking) |

## 10. Agent Guide / Constitution Impact

`execution.md` has no `## Constitution Impact` section: no module was created or reshaped. The repo `AGENTS.md` *Backend Skills* list already names `java-springboot`. Nothing is pending for archive's guide sync. A CodeGraph re-index is still due at archive.

## 11. Remediation

| # | Item | Action | Status |
|---|---|---|---|
| R-1 | FR-1 counted six hashes; §4 and T1 have seven (`LICENSE`) | `requirements.md` FR-1 now reads "the seven pinned files of §4 (the six skill files and `LICENSE`)" and "records the seven hashes". Correction closure: the forward grep over the spec folder found every other "six" means the six skill files with `LICENSE` listed apart (consistent); backward, `tasks.md` T1 and `execution.md` T1 already said seven; no shipped test reads the spec folder | Applied (single-answer factual correction) |
| W-1 | Design §4 omits `docs/commands/akili-security.md` | Accept; optional one-row sync of design §4 at archive | Accepted |
| W-2 | Walkthrough human check | JC reviews `execution.md` T10 *Walkthrough* when convenient | Open for JC, non-blocking |

## 12. Archive Readiness Recommendation

**Ready.** All tasks are `[x]`, no FAIL remains, both WARNs are accepted, the tests cover every key scenario, and drift is reflected in the spec docs. Next:

```text
/akili-archive changes/java-springboot-skill
```
