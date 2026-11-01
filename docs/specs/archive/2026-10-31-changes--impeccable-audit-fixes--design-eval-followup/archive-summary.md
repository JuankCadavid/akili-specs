# Archive Summary — design-eval-followup

**Outcome:** delivered. Three rule gaps from child 1's validation (W-1, W-2, W-4) are closed in the `impeccable-bridge` rules, with 30 new tests. Validation: PASS with 3 accepted WARN.

## 1. Document Control

| Field | Value |
|---|---|
| Original Spec Path | `changes/impeccable-audit-fixes/design-eval-followup` |
| Parent | `changes/impeccable-audit-fixes` (`family.md`, child 2 → `done`) |
| Archive Date | 2026-10-31 |
| Final Status | **Done** (validation PASS with WARN, archive-ready) |
| Branch | `JuankCadavid/impeccable-audit-fixes` (a spec branch; the apply-capable branch is `dev`). Local commits only |
| Release | Patch, recorded only |

## 2. Requirements Delivered

| ID | Gap | What ships |
|---|---|---|
| FR-1 | W-1 | A missing consent banner turns only a would-be `pass` into `Unevaluated`; `below fold` and `covered` stand (P1 / FAIL); banner state recorded beside the outcome |
| FR-2 | W-2 | The `SKILL.md` strip is byte-exact; a `node -e` reference command, executed by a test, prints the `UPSTREAM.md` hash |
| FR-3 | W-4 | Under an exclusion, the download call also unsets `IMPECCABLE_BIN` and drops excluded `PATH` entries; proven on the POSIX launcher |
| FR-4 | — | Reference field, doc sentence, two CHANGELOG clauses, a new CHANGELOG bullet, and a retired-phrase sweep |

## 3. Files Changed Summary

| File | Change |
|---|---|
| `.claude/skills/impeccable-bridge/SKILL.md` | Step 0 *Verify*, item 4, record field, *Engine consent* row, *First-visit pass* item 4 (10 lines) |
| `.claude/skills/impeccable-bridge/references/design-evaluation.md` | Template field |
| `docs/skills/impeccable-bridge.md` | Banner sentence |
| `CHANGELOG.md` | 2 clauses + 1 bullet |
| `test/design-eval-followup.test.js` | New, 27 tests |
| `test/design-eval-followup-launcher.test.js` | New, 3 tests (POSIX) |
| `test/design-eval-contract.test.js`, `test/design-eval-contract-coverage.test.js` | 4 pins updated |

The vendored `impeccable/` folder is untouched. Commits: `71a41d9` proposal · `7e204b1` specify · `269d6b1` T1 · `01e6f89` T2 · `f48122b` T3 · `08a4dd1` T4 · `97b615a` execution · `c74055f` test · `d85bda0` validate · this archive commit.

## 4. Test Evidence Summary

`npm test` 1315 → 1345, all passing. The new launcher suite reproduces W-4 (controls) and proves the rule environment runs no excluded binary (falsifier executed). There were no product bugs.

## 5. Validation Summary

0 FAIL, 0 BLOCKED, 3 WARN, all accepted:

| WARN | What it covers | Disposition |
|---|---|---|
| W-1 | The P-16 fixture outcome | The Lead's measurement |
| W-2 | Windows `.cmd` and quoting | Accepted risk |
| W-3 | LOC +16 % on tests | Accepted by JC |

Every scenario and held-out case walks to one verdict.

## 6. Accepted Warnings Or Follow-Ups

| Item | Owner |
|---|---|
| Open question: measure `/es/` at `1366x768`? | The Lead |
| Open question: does any banner layout reflow the hero upward (P-6)? | The Lead |
| W-3 of child 1 (off-edge CTA outcome) | A future spec, not started |
| Advisories (recorded in `validation-report.md` §7): *Launcher form* wording; symlinked `PATH` entries; an inert sweep pattern; three text pins | None (they do not become tasks) |

## 7. Historical Notes

- The proposal's "POSIX reference command" became `node -e`, because GNU `sed` could not be checked and Node runs on all three OSes (design Document Control).
- Judgment-day: 3 severe findings settled by re-run as factual corrections (FR-3 wording, CHANGELOG restatements, test plan); the scoped re-judgment resolved everything → `JUDGMENT: APPROVED`.
- Budget tripwire at T4 (244 vs ~210 LOC); JC accepted it.

## 8. Diagrams

None: the spec has no diagram slot.
