# Validation Report — `/akili-marketing` (changes/akili-marketing)

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-marketing` |
| Date | 2026-10-24 |
| Auditor | Opus 5.5. The Implementer ran on `sonnet`, so author ≠ auditor holds. |
| Validated at | `08da1b6` + this report and one spec correction |
| Baseline for diffs | `9a92092`, the spec-approval commit used by the T9 sweep |
| Verdict | **PASS — archive-ready** (0 FAIL, 2 WARN accepted) |

## 2. Summary

The implementation matches the approved spec, and every gate held.

- **Tasks:** 12 of 12 are `[x]`.
- **Tests:** `npm test` reports 750/750.
- **Requirement coverage:** every FR-1…FR-12 scenario and clause has an owning task (`tasks.md` §3) and either a test or the T10 observation.
- **Runtime behaviour:** FR-2…FR-11 were observed once in the T10 dogfood. All 12 steps matched their expectation.
- **Remaining risk:** recorded in requirements §8. It covers other hosts, FR-8 with a posting-capable tool present, and the fact that T10 was a single run.

| Result | Count |
|---|---|
| PASS | 12 tasks, 12 FRs, NFR-1, 2, 4, 5, 6 |
| WARN | 2: NFR-3 Windows CI not yet run; T10 observed only once and only on Claude Code |
| FAIL | 0 |
| BLOCKED | 0 |

## 3. Task Completion

| Task | Status | Evidence in `execution.md` | Result |
|---|---|---|---|
| T1 | `[x]` | Extraction map, P-17 VERIFIED; PASS on attempt 2 | PASS |
| T2 | `[x]` | 7 shared references; PASS on attempt 2 | PASS |
| T3 | `[x]` | SKILL.md, LICENSE, 9 tests; PASS | PASS |
| T4 | `[x]` | Platform references, P-13 table; PASS on attempt 3 | PASS |
| T5 | `[x]` | Command, 182 lines; PASS on attempt 2 under two lenses | PASS |
| T6 | `[x]` | Counts 224 → 236, fixture `ok 49`; PASS | PASS |
| T7 | `[x]` | 71 text-contract tests with mutation hook; PASS | PASS |
| T8a | `[x]` | Docs pages, governance; PASS on attempt 3 | PASS |
| T8b | `[x]` | README lists; PASS on attempt 2 (count amended ≥7 → ≥6, reason inline) | PASS |
| T8c | `[x]` | flow, cli, AGENTS; PASS | PASS |
| T9 | `[x]` | CHANGELOG plus verification sweep; PASS | PASS |
| T10 | `[x]` | Dogfood 12/12, verbatim in `t10-dogfood.md`, Leader re-ran the evidence. A deferral was logged, then withdrawn by the user before closing. | PASS |

Every task has a non-author evidence re-run marked VERIFIED and a Reviewer verdict. T10 was observed by the user's delegate.

## 4. File Existence

All files in the design §3 tree exist. `git diff --name-only 9a92092 HEAD`, outside `docs/specs/`, lists 31 paths:

- **Command:** `.claude/commands/akili-marketing.md`.
- **Skill:** `.claude/skills/social-marketing/` with SKILL.md, LICENSE and 10 references.
- **Docs:** 9 pages and lists, plus AGENTS.md and CHANGELOG.md.
- **Tests:** 5 test files, the doctor fixture, and the `diagram-design` pin.

No file outside the design tree changed. The two test files `/akili-test` added are covered by `test-report.md`.

## 5. Build Integrity

| Command | Result |
|---|---|
| `npm test` | 750 tests, 750 pass, 0 fail (Node 22.12.0). Node 18.20.8 was green at T9 with 735. |
| `npm run verify:cli` | `13 commands \| 28 skills \| 8 resources (akili-specs v2.35.0)` |
| `npm run pack:dry-run` | 325 files, 2.6 MB |
| `git diff --check 9a92092 HEAD` | clean |
| `git diff 9a92092 HEAD -- bin/ .claude/templates/ docs/model-routing.md package.json scripts/ assets/` | empty |

## 6. Requirement Coverage

| Req | Scenarios / clauses | Owner (`tasks.md` §3) | Evidence | Result |
|---|---|---|---|---|
| FR-1 | *Attribution survives install* (AND IT MUST byte-identical); *Vendor paths stripped* (BUT keep author and license) | T1–T4 | `social-marketing-skill.test.js` (9); `social-marketing-install.test.js` A1–A3 cover all hosts | PASS |
| FR-2 | *No or unknown mode* (BUT no file); *Write boundary* (AND IT MUST no commit, push or source edit) | T5 | Text contract; T10 steps 1 and final checks | PASS |
| FR-3 | *Drafting without a brand voice* (AND IT MUST add the `Voice:` line); *Language* | T5 | Text contract; T10 steps 2–3 | PASS |
| FR-4 | *Plan stops for review* (BUT no posts before approval); *Platform outside v1* | T5 | Text contract; T10 step 4 | PASS |
| FR-5 | *Status is read, never set* (AND IT MUST show the status exactly, flagged) | T5 | Text contract; T10 steps 11–12 | PASS |
| FR-6 | *Limits enforced* (BUT no silent overrun) | T4, T5 | Text contract; T10 limits checks on every card | PASS |
| FR-7 | *Ambiguous answer*; *Advance approval* (AND IT MUST say it once); *Edit after approval* (AND IT MUST show a new card) | T5 | Text contract with mutation checks; T10 steps 4–6 | PASS |
| FR-8 | *A posting tool is available* (BUT do not invoke it); *Credentials offered* | T5 | Text contract; T10 steps 7–8, token grep exit 1 | PASS. The precondition of the tool-present scenario was not exercised (§8). |
| FR-9 | *Recording a draft as published*; *Lookalike host* | T5 | Text contract; T10 step 9 | PASS |
| FR-10 | *Review edits nothing* | T5 | Text contract. `review` itself was not run in T10. | PASS (text) |
| FR-11 | *Injected instruction* | T5 | Text contract; T10 step 10 | PASS |
| FR-12 | Docs, governance, counts, CHANGELOG, no spec path shipped | T6, T8a–c, T9 | `akili-marketing-docs.test.js` B1–B9; pack list | PASS |
| NFR-1 / 2 / 4 | No change to `bin/`, dependencies or routing | T9 | Protected diff is empty | PASS |
| NFR-3 | CI matrix green | T9 | Local Node 22 and 18 green; Windows legs not run yet | **WARN**: unverified until the PR runs CI |
| NFR-5 | Size | T2–T5 | Command 182/≤280; SKILL.md 73/≤200; references 777/≤1,200 | PASS |
| NFR-6 | Dated and labelled limits | T3, T4 | B10–B12 | PASS |

`test-report.md` records no `PRODUCT_BUG`, `FAIL` or flaky entry.

## 7. Linting & Code Quality

The repo has no lint script. `git diff --check` and the test suite are the quality gates.

**4R advisory (not spec violations):**

- **Readability:** the command is 182 lines with its rules defined once (`## Invariants`, DD-3). Restatements are pinned by three DD-3 tests.
- **Reliability:** the text-contract tests assert phrasing, so a faithful rewording can turn them red. The mutation hooks keep them falsifiable, which is an accepted trade-off.
- **Resilience:** in T10 the agent counted characters by hand because `-p` mode had no shell. Limit counts are therefore approximate whenever the host cannot run a counter.
- **Risk:** carried-forward ADVISORY items from `execution.md`, all recorded and none promoted to tasks:
  - T5 risk lens: whether the Error Handling "request to publish" row checks status, and how approval is read across sessions.
  - T5 conformance lens: wording ("offer" vs "creates"); slug normalisation is unspecified.
- **Test-side incident (`test-report.md` §2):** the Tester wrote 15 stray files into the real HOME. The cleanup is the user's decision.

## 8. Design Conformance

- Command structure matches design §3: Invariants, then Step 0 (load plus provenance check), then six modes. Approval card fields, state table and the `--published` host rule match §5.3–5.6.
- **Recorded deviation:** the Limits check also lists heuristic caps, and a draft over a heuristic cap is shortened or reported. This is the Leader decision recorded in `execution.md` at T4/T5; it is consistent with FR-6.
- **Cross-document figure check:** `requirements.md` §4 said the install count goes "224 → 228", which is a 4-file stub figure. Design P-6, T6 and the code all say 224 → 236 for the shipped 12-file skill.
  - Corrected in `requirements.md` §4 at validation.
  - Correction closure: a forward grep for `→ 228` finds only that line. `tasks.md`'s red run already labels 228 as the stub output. No backward reference asserts 228 as the final figure.
- Other figures agree across documents and code: 13 commands, 28 skills, IG 4 / LI 6 / FB 0 hard limits, 735 + 15 = 750 tests, 325 packed files.
- **Proposal alignment:** all non-goals held. There is no API, scheduling, image generation, other platform, routing row or figure regeneration (protected diff empty, NFR-4).

## 9. Test Evidence Summary

The evidence is in `test-report.md`:

- 750/750 automated tests pass. 95 of them are this spec's: 9 skill, 71 command-contract, 3 install, 12 docs.
- 7 mutation checks were run on the new docs suite.
- The T10 dogfood passed 12/12 steps. Its transcript is verbatim in `t10-dogfood.md`, and the Leader re-ran the three checks.

## 10. Agent Guide / Constitution Impact

`execution.md` has no `## Constitution Impact` section. No module was created or reshaped. The root `AGENTS.md` *Skill Usage* line for `social-marketing` was added in T8c. Nothing is pending for `/akili-archive` guide sync.

## 11. Remediation

| # | Item | Severity | Action |
|---|---|---|---|
| 1 | Windows CI legs (NFR-3) | WARN | Covered by the PR's CI. Confirm all six checks are green before merging. |
| 2 | T10 observed once, Claude Code only, no posting tool present | WARN (accepted, recorded in requirements §8) | Optional: repeat the dogfood on another host, or with a posting-capable MCP present, before a release. |
| 3 | Stale "224 → 228" figure | Fixed at validation | — |
| 4 | Stray HOME install from `/akili-test` | Outside the product | The user decides whether to delete the 15 paths. |

## 12. Archive Readiness Recommendation

**Ready to archive.** All 12 tasks are done, there are no FAIL findings, both WARNs are accepted with a route, tests cover every scenario, and drift is reflected in the spec documents.

```text
/akili-archive changes/akili-marketing
```
