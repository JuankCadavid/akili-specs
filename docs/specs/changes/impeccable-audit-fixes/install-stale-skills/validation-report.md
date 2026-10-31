# Validation Report — install-stale-skills

**Verdict: PASS with 3 WARN (all accepted or routed to follow-up). Archive-ready.** Every task is `[x]` with a Reviewer PASS and a VERIFIED evidence re-run; every FR-1–FR-5 clause and NFR has evidence except the accepted FR-2 `update` gap; build integrity is green.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/impeccable-audit-fixes/install-stale-skills` |
| Date | 2026-10-31 |
| Base | `0699780` (test) |
| Validator | opus (Implementer sonnet; author ≠ auditor) |
| Approval Mode | `pre-approved`. Gate: `auto-approved (pre-approved mode)` |

## 2. Summary

| Result | Count |
|---|---|
| PASS | Tasks 4/4, FR-1, FR-3, FR-4, FR-5, NFR-1–NFR-5, build integrity |
| WARN | 3 (W-1 FR-2 `update` untested; W-2 pre-existing `docs/cli.md:486` falsehood for `update`; W-3 budget overrun) |
| FAIL / BLOCKED | 0 / 0 |

## 3. Task Completion

| Task | Status | Evidence |
|---|---|---|
| T1 | `[x]` PASS (1 attempt) | execution.md T1, `01318f9` |
| T2 | `[x]` PASS (1 attempt) | execution.md T2, `854b568` |
| T3 | `[x]` PASS (1 attempt) | execution.md T3, `3e6a6ff` |
| T4 | `[x]` PASS (2 attempts) | execution.md T4, `09bcdc2` |

## 4. File Existence

`bin/install-compare.js` (new), `bin/akili.js` (modified), `test/install-compare.test.js`, `test/install-stale-skills.test.js`, `test/install-stale-skills-gaps.test.js` (new), `docs/cli.md`, `CHANGELOG.md`, `test/design-eval-contract-coverage.test.js` (modified). `test/fixtures/doctor-codex-baseline.txt` unchanged, as T3 required. PASS.

## 5. Build Integrity

| Command | Result |
|---|---|
| `npm test` | `# tests 1385 # pass 1385 # fail 0` |
| `npm run verify:cli` | `Summary: 14 commands \| 31 skills \| 8 resources (akili-specs v2.40.0)` |
| `npm run pack:dry-run` | `package size: 3.6 MB`, `total files: 408` (407 + `bin/install-compare.js`) |
| `git diff --check master...HEAD` (bin, test, docs/cli.md, CHANGELOG.md) | clean |
| Scratch HOME: `install --tool all --dry-run`; `install --tool all`; edit `tdd/SKILL.md`; `doctor --tool all` | exit 0; exit 0; `DIFFERS tdd (SKILL.md)`, `CLAUDE HEALTHY ok 52 … differs 1`, other rows unchanged shape, "No missing files. 1 entry differs…", hint; `doctor --tool claude` exit 0 |
| Scratch HOME: `install --tool claude` after the edit | `skip existing …/skills/tdd (differs: SKILL.md)`, `skipped 53 (identical 52, differs 1)`, `Home: <scratch>`, replace hint |

## 6. Requirement Coverage

Reuses `test-report.md` §7 (cross-checked against `requirements.md` at clause level).

| Req | Clauses | Owner task | Evidence | Result |
|---|---|---|---|---|
| FR-1 | 5 SHALL bullets; S1, S2 | T1, T2 | install-compare (14); install-stale-skills S1/S2; gaps 1, 3 | PASS |
| FR-2 | 6 bullets; S1 (THEN/BUT/AND IT MUST), S2 | T2 | install-stale-skills; gaps 1, 2 | **WARN** (W-1): bullet 5 "`update` behavior SHALL NOT change" has no direct test |
| FR-3 | 7 bullets; scenario THEN / BUT must NOT exit non-zero / AND IT MUST NOT rewrite under `--fix` | T3 | install-stale-skills doctor tests; gaps 1; §5 smoke | PASS |
| FR-4 | `Home:` rule, `--local` and all-outside negatives; docs half | T2, T4 | install-stale-skills; gaps 4; docs text test | PASS |
| FR-5 | every named site | T4 | 4 text tests, coverage pin; Reviewer KZ-002 quote check | PASS |
| NFR-1–NFR-5 | — | all | test-report §7 | PASS |

## 7. Linting & Code Quality (4R, advisory)

Carried from `execution.md`, not spec violations:
- (R) The install hint says "replace them" for one entry; the doctor hint says "it". The two hints word the flag clause differently.
- (R) design §6 says the doctor hint is "outside" the exit block; in precedence case 1 it prints inside it, before `exitCode = 1`. Behavior is correct.
- (Rel) A mixed Antigravity `DIFFERS` line drops the "not compared" note; a symlinked nested target subdirectory with equal bytes reads `identical` (FR-1 names only the entry's own target).
- (Res) A broken `impeccable` symlink: doctor uses `existsSync`, install `lstat`.
- (Cov) Some T4 doc sentences have no test pin (Safety Rules, `skipped N (identical I, differs D)`, "`--fix` never overwrites").

## 8. Design Conformance

| Item | Result |
|---|---|
| DD-1–DD-9, §7.1–§7.4 | Conform (Reviewer walks, T1–T4) |
| Execute-time design edit: §7.2 `update` sentence (update's Install Summary gains `Home:`) | Recorded in execution.md T2, checked by the T3 Reviewer. Requirement meaning unchanged. PASS |
| Proposal intent (tell a stale skill from a current one, no write without `--force`) | Holds |
| Cross-document figures | Budget 650 / 752 / ~775 agree across tasks.md, execution.md and this report. WARN W-3: the overrun (+16 %, tests) was accepted by a decision delegated by JC (16:51 UTC-5, option chosen by JC's assistant) |
| W-2 (pre-existing) | `docs/cli.md:486` "Without `--force`, existing files are skipped" is false for `update`, which always forces (`bin/akili.js:1498`). FR-5 assumed it true and T4 extended the sentence. Follow-up candidate, outside this spec |

## 9. Test Evidence Summary

`test-report.md`: PASS, one Tester (opus), 4 gap tests with 4 executed mutations, 0 `PRODUCT_BUG`.

## 10. Agent Guide / Constitution Impact

`bin/install-compare.js` is a new module in `bin/`. `AGENTS.md` *Repository Purpose* lists `bin/routing.js` and `bin/persona.js` but not this module. On this spec branch that is a `factual-sweep` pending item for `/akili-archive`, not an edit.

## 11. Remediation

| ID | Action |
|---|---|
| W-1 | Accept: the `update` second half is the `--force` path (covered); a direct test needs a package-manager stub seam |
| W-2 | Follow-up: correct `docs/cli.md:486` for `update` in a later change |
| W-3 | Accepted (16:51 decision) |

## 12. Archive Readiness Recommendation

Ready: `/akili-archive changes/impeccable-audit-fixes/install-stale-skills`.
