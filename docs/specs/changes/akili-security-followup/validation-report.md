# Validation Report — `/akili-security` follow-up: pin literal, five safety advisories, Windows decision

**Verdict: PASS — archive-ready.** 0 FAIL · 2 WARN (accepted, no follow-up task needed in this spec) · 1 correction applied during validation (stale CHANGELOG test count). All five tasks `[x]` with evidence; every FR scenario and `BUT` / `AND IT MUST` clause owned and tested; build gates green.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-security-followup` |
| Date | 2026-10-19 |
| Validated at | `00922f0` + CHANGELOG correction (this commit) |
| Auditor | Claude Opus 5.5 (Implementer was `sonnet`: author ≠ auditor) |
| Baseline docs | Root `CLAUDE.md` / `AGENTS.md` read; `docs/prd.md`, `docs/ux-ui/design.md`, `docs/trd/trd.md`, `docs/specs/general-setup/` absent in this repo (as recorded in requirements Document Control) |
| Inputs | `proposal.md`, `requirements.md`, `design.md`, `tasks.md`, `execution.md`, `test-report.md` (reused as primary coverage evidence) |

## 2. Summary

| Area | Result |
|---|---|
| Task completion | PASS (5/5) |
| File existence | PASS |
| Build integrity | PASS |
| Requirement coverage | PASS (FR-1…FR-10, NFR-1…4) |
| Code quality / 4R | PASS — advisories carried forward (§7) |
| Design conformance | PASS — two execute-time design edits recorded and approved |
| Test evidence | PASS — 408/408; spec suites green on Node 18/20/22 |
| Constitution impact | PASS — none |

## 3. Task Completion

| Task | Status | Evidence | Result |
|---|---|---|---|
| T1 | `[x]` | `execution.md` T1: red run, 12 falsifiers, fixture walk, 2 lens Reviewers PASS | PASS |
| T2 | `[x]` | T2: attempt 2 after safety-lens FAIL (git in Step 4) fixed; Reviewer PASS | PASS |
| T3 | `[x]` | T3: attempt 3; NFR-2 gate; quotes byte-exact | PASS |
| T4 | `[x]` | T4: attempt 3; sweep table, every hit judged | PASS |
| T5 | `[x]` | T5: attempt 2; full verification re-run after T3/T4 committed | PASS |

## 4. File Existence

`git diff --name-only 5c944d0 HEAD` outside `docs/specs/` → `.claude/commands/akili-security.md`, `.claude/skills/security-audit/SKILL.md`, `CHANGELOG.md`, `README.md`, `docs/commands/README.md`, `docs/commands/akili-security.md`, `docs/flow.md`, `docs/skills/security-audit.md`, `test/akili-security-command.test.js`, `test/akili-security-docs.test.js`, `test/security-audit-skill.test.js`. Matches design §4 exactly, plus `test/akili-security-docs.test.js` (added by `/akili-test`, unpackaged). `upstream-request.md` present in the spec folder. **PASS**.

## 5. Build Integrity

| Command | Result |
|---|---|
| `npm test` | `# tests 408 / # fail 0` |
| `npm run verify:cli` | `12 commands \| 27 skills \| 8 resources (akili-specs v2.34.0)` |
| `npm pack --dry-run \| grep -c docs/specs` / `test/` | `0` / `0` |
| `git diff --check` | exit 0 |
| NFR-3 `git diff --stat 5c944d0 -- bin package.json docs/model-routing.md .claude/templates` | empty |
| NFR-2 vendored gate | exit 0; one `SKILL.md` hunk `@@ -207 +207 @@` (below `:202`) — from `test-report.md` §5 |
| Shared `git` grep on the command | 0 hits (exit 1) |
| NFR-1 `wc -l` | 187 ≤ 230 |

## 6. Requirement Coverage

Cross-checked `test-report.md` §7 against `requirements.md` §6 at clause granularity and against `tasks.md` §3 ownership. No `PRODUCT_BUG`, no `FAIL`.

| Req | Task owner (clause-level, tasks §3) | Test evidence | Result |
|---|---|---|---|
| FR-1 | T1, T3 | cmd stale-copy + skill pin-sync + docs re-sync step | PASS |
| FR-2 | T1, T2 | cmd ×5 + docs ×2 | PASS (G-3 minor untested sub-clause, below) |
| FR-3 | T1, T2 | cmd plan + index | PASS |
| FR-4 | T1, T4 | cmd lead/bullets/exposure + docs ×4 | PASS |
| FR-5 | T2 | cmd mechanism slot | PASS |
| FR-6 | T1, T2 | cmd ×8 + docs ×2; fixture walk + independent re-walk | PASS (run-time adherence: accepted §8) |
| FR-7 | T1, T2, T4 | cmd ×4 + docs ×3 | PASS |
| FR-8 | T2, T3, T4 | cmd ×3 + docs ×3 | PASS |
| FR-9 | T3 | cmd Windows stop + docs ×2 | PASS (Windows CI legs `UNVERIFIED` until push — accepted §8) |
| FR-10 | T1–T5 | docs R-B ×2, restatement suite, CHANGELOG quote-check (T5 full review) | PASS |
| NFR-1…4 | T1, T2, T3, T5 | §5 | PASS |

Proposal success criteria: all met. The criterion "maps term for term to `SKILL.md:43-44` and `RECONNAISSANCE.md:53`" was narrowed by the approved FR-4 to `SKILL.md:41-48` (lead clause, four bullets, exposure rule) — superseded by approval, not drift.

## 7. Linting & Code Quality

No linter applies (markdown + `node:test`). `git diff --check` clean.

**4R advisory findings (advisory — not spec violations):**

| Source | Finding |
|---|---|
| T1 safety | `--out /outside/new/../../<target>/x` — text does not say to normalise `..` before the containment check (user-deferred to a follow-up proposal) |
| T1 conformance | Restore for "another Claude root" names `--claude-target <dir>` without `--tool claude`, so the skip-existing install also writes other auto-detected tool roots (nothing overwritten; user-deferred) |
| T1 safety | Step 0.3 forbids git by name, not every target-configured program (e.g. version-manager shims) |
| T2 safety | `<repo-name>` in the printed `/akili-propose` pointer may carry shell metacharacters; same-date runs from different `--out` roots can both be `run-1`; no Error Handling row for the HOME-inside-target default refusal |
| T2 attempt 2 | No length cap on an admitted branch (fails safe); Step 0.3 does not itself say detached → branch `not determined` |
| T3 | `design.md` §9 and P-16 cite `test/security-audit-skill.test.js:93-96`; the short-circuit now sits at `:110-113` |
| T4 | `docs/commands/akili-security.md:41` does not spell out "detached HEAD included" |
| T5 | CHANGELOG "a dirty state that cannot be read or confirmed" is looser than the shipped "declines to state" |
| Test G-3 | FR-2 "asks the user which install owns the root" has no pinning test |
| Test G-4 | `docs/commands/akili-security.md:48` lead clause reads "providing" vs upstream "that provides" (not weaker; command byte-pinned) |

## 8. Design Conformance

| Check | Result |
|---|---|
| Command keeps Steps 0–5 shape; edits per §7 rows | PASS |
| Execute-time design edits | `design.md` §7 row 4 (git-free branch suffix, T2) and §11 budget revision — both recorded in `execution.md` with reason and user approval | PASS |
| Non-goals (no vendored patch, no shim, no routing row, no installer change, no re-sync, no filing) | PASS — NFR-2/NFR-3 gates; draft unfiled |
| Cross-document figures | **Corrected:** `CHANGELOG.md` `[Unreleased]` Notes said "`npm test` passes 389 cases" and omitted the test file `/akili-test` added → now 408 and names `test/akili-security-docs.test.js` (single-answer factual fix; sweep: "389" appears elsewhere only in `execution.md`, historical T4/T5 evidence, correct as of then). Budget figures (`design.md` §11 ~520 / `execution.md` ~496) agree; test counts 61→89 / 6→7 match runner output |
| Path that moves at archive | `docs/skills/security-audit.md:57` and CHANGELOG Notes point to `docs/specs/changes/akili-security-followup/upstream-request.md` → **WARN-1**, repoint at `/akili-archive` |
| Stale line citations | `design.md` P-16 `:93-96` → `:110-113` → **WARN-2**, historical citation "as run at `5c944d0`", correct for that commit; leave |

## 9. Test Evidence Summary

From `test-report.md`: Overall PASS; 96 author tests (Node 18/20/22 all green), 19 new doc-restatement tests (all three Nodes green), 9/9 mutations of the new tests red; `npm test` 408/408. Accepted gaps G-1 (run-time adherence), G-2 (Windows CI legs before push), G-5 (hostile-content cases via generic rules + fixture walk).

## 10. Agent Guide / Constitution Impact

`execution.md` Execution Summary: "Constitution Impact | None — no module created or reshaped". No guide sync owed. **PASS**.

## 11. Remediation

| ID | Item | Route |
|---|---|---|
| WARN-1 | Repoint `upstream-request.md` references (`docs/skills/security-audit.md:57`, CHANGELOG Notes) to the archive path | `/akili-archive` (same commit as the move) |
| WARN-2 | `design.md` P-16 line citation historical | None — accepted |
| Advisories §7 | Two user-deferred items (`..` normalisation; `--claude-target` without `--tool claude`) + others | Separate follow-up proposal (per the user's T2-gate decision); never tasks of this spec |

## 12. Archive Readiness Recommendation

**Ready to archive.** All tasks `[x]`, no FAIL, WARNs accepted or routed to archive, key scenarios tested, drift recorded in spec docs. Next:

```text
/akili-archive changes/akili-security-followup
```
