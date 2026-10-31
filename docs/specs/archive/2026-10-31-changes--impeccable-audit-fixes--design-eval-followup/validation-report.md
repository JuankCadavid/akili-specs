# Validation Report — design-eval-followup

**Verdict: PASS with WARN. 0 FAIL, 0 BLOCKED, 3 WARN.**

- All 4 tasks are done.
- Every build check is green: `npm test` 1345/1345, `verify:cli`, `pack:dry-run`, `git diff --check`.
- Every FR clause is owned by a task and has a test, except the P-16 fixture outcome, which is the Lead's measurement.
- The walkthrough of every scenario plus held-out cases against the shipped text gives exactly one verdict each. The W-1 case (2.40.0 `/es/`) now reads `below fold` P1 / FAIL, never `Unevaluated`.
- Archive-ready.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/impeccable-audit-fixes/design-eval-followup` |
| Date | 2026-10-31 |
| Commit validated | `c74055f` |
| Auditor | opus (the Implementers were sonnet: author ≠ auditor) |
| Approval Mode | `pre-approved (JC, 2026-10-31)` |
| Inputs | `proposal.md`, `requirements.md`, `design.md` rev 2, `judgment.md`, `tasks.md`, `execution.md`, `test-report.md` |
| Baseline docs | No `docs/prd.md`, `docs/ux-ui/design.md`, `docs/trd/trd.md` or `docs/specs/general-setup/` in this repo (methodology package); the root guides apply |

## 2. Summary

| Area | Result |
|---|---|
| Task completion | **PASS**: 4/4 `[x]`, each with an execution entry, an executed red, quoted falsifiers, a `VERIFIED` re-run and a Reviewer `PASS` |
| File existence | **PASS** |
| Build integrity | **PASS** |
| Requirement coverage | **PASS with WARN** (W-1) |
| Code quality | **PASS**: advisories only |
| Design conformance | **PASS with WARN** (W-2, W-3) |
| Test evidence | **PASS**: 1345/1345, 0 product bugs |
| Constitution impact | **PASS**: none recorded, none needed |

**WARN findings**

| # | Finding | Disposition |
|---|---|---|
| W-1 | FR-1 P-16 THEN/AND (8 viewports `pass`, banner `visible`) has no automated test. The identification part was verified by a GET (P-7a); the fold outcomes are the Lead's measurement (P-7b, user-stated) | Accepted gap (test-report §9). The walkthrough below is consistent with it |
| W-2 | `scripts/impeccable.cmd` and the `node -e` quoting under `cmd.exe`/PowerShell are not executed (no Windows host) | Accepted risk (requirements §7, design P-8) |
| W-3 | Authored LOC 244 insertions against ~210 budgeted (+16 %, tests only) | Accepted by JC 2026-10-31 (`execution.md`, *Budget Tripwire*) |

## 3. Task Completion

| Task | Status | Evidence |
|---|---|---|
| T1 FR-1 | PASS | `269d6b1`; red `# fail 6`; 3 falsifiers quoted; re-run 1324/1324; Reviewer PASS |
| T2 FR-3 | PASS | `01e6f89`; red `# fail 6`; 3 falsifiers; re-run 1331/1331; Reviewer PASS |
| T3 FR-2 | PASS | `f48122b`; First-step hashes quoted; red `# fail 5`; 2 falsifiers; re-run 1336/1336; Reviewer PASS (it ran the command under `sh`, `zsh` and `bash -H`) |
| T4 FR-4 | PASS | `08a4dd1`; red `# fail 6`; 2 falsifiers; re-run 1342/1342 + `verify:cli` + `diff --check`; Reviewer PASS |

## 4. File Existence

| Expected (design §3–§4) | Present |
|---|---|
| Bridge `SKILL.md`: *Verify*, item 4 (exclusion + record), *Engine consent* row, *First-visit pass* item 4 | Yes (`SKILL.md:58`, `:78`, `:80`, `:106`, `:199`) |
| Reference template line | Yes (`design-evaluation.md:99`) |
| `docs/skills/impeccable-bridge.md` banner sentence | Yes |
| `CHANGELOG.md` two clauses + new bullet | Yes |
| `test/design-eval-followup.test.js` (new) | Yes, 27 tests |
| `test/design-eval-followup-launcher.test.js` (new, test phase) | Yes, 3 tests |
| Vendored folder unchanged | Yes: `git diff --stat 7e204b1 -- .claude/skills/impeccable/` → empty |

## 5. Build Integrity

| Command | Result |
|---|---|
| `npm test` | `# tests 1345 # pass 1345 # fail 0` |
| `npm run verify:cli` | ok (14 commands, 31 skills, 8 resources) |
| `npm run pack:dry-run` | ok |
| `git diff --check` | clean |

## 6. Requirement Coverage

At clause granularity, from the `test-report.md` §7 matrix cross-checked against `requirements.md`:

| Requirement | Clauses | Task | Tests | Result |
|---|---|---|---|---|
| FR-1 | 5 SHALL bullets; S1 THEN/AND/BUT/AND IT MUST; S2 THEN/BUT; P-16 BUT | T1 | F (9) | PASS. S1 "must NOT read `pass`" is indirect (`stands`): advisory |
| FR-1 P-16 | THEN/AND | — | walkthrough | **WARN** (W-1) |
| FR-2 | 3 bullets; THEN/BUT/AND IT MUST | T3 | F (5, one behavioral), C range pin | PASS |
| FR-3 | 4 bullets; no-other-call; record; THEN/AND/BUT/AND IT MUST | T2 | F (7), C pins, L (3, executes the launcher) | PASS. POSIX only (W-2) |
| FR-4 | 4 restatements + new bullet + sweep | T4 | F (6) | PASS |
| NFR-1…5 | — | all | vendor test, bridge test, guards | PASS |

No gap is discharged by citing another requirement.

## 7. Linting & Code Quality

No linter applies (Markdown and `node:test`). `git diff --check` is clean.

**4R advisory findings** (carried from `execution.md` and the test report; none is a spec violation):

| Lens | Finding | Source |
|---|---|---|
| Readability | *Launcher form* "Every call carries the Step 0 pin inline" reads loosely against the pre-pin download call; item 4 settles it | T2 Reviewer |
| Readability | "with its P1 or FAIL" relies on the priority bullet to say which command reports which | T1 Reviewer |
| Reliability | "resolved path" does not say whether symlinks are followed | T2 Reviewer |
| Reliability | The third retired sweep pattern is backticked and inert at baseline; test 22 covers the line by shape | T4 Reviewer |
| Reliability | The reference command prints a wrong hash rather than an error when `metadata:` is absent; harmless (reads `modified`) | T3 Reviewer |
| Reliability | The `\btext\b` P-16 guard would trip on a future "alt text" | T1 Reviewer |
| Risk | Three text pins are not asserted ("with its P1 or FAIL", "recorded beside the CTA outcome", a direct S1 "not `Unevaluated`") | Tester |

## 8. Design Conformance

**Walkthrough against the shipped text** (`SKILL.md` at `c74055f`). The table holds the requirement scenarios and two held-out cases the text does not cite. Each case is judged against the general sentence:

| Case | Shipped text yields | Equals THEN/BUT? |
|---|---|---|
| FR-1 S1: `/es/` 375x667, CTA top 650, banner not rendered | Item 3 (c) → `below fold (y=650)`; item 4: "A `below fold` or `covered` outcome stands, with its P1 or FAIL"; banner `not rendered: <reason>`; remedy named | Yes. **W-1 of child 1 closed** |
| FR-1 S2: hit-test returns the CTA, banner not rendered | Item 3 (d) would be `pass` → "only a would-be `pass` changes" → `Unevaluated (consent banner not rendered: …)` | Yes |
| FR-1 P-16: `/es/` at the 8 viewports, cookie bar rendered | No Primary CTA column or style → `first main action` → the first `main a\|button` = "Agenda tu diagnóstico gratuito" (GET, P-7a); banner `visible` → item 4 changes nothing; each viewport reports its own item 3 outcome → `pass` per the Lead | Consistent; outcome user-stated (W-1) |
| Held-out: `covered (<header>)` + banner not rendered | `covered` stands, P1/FAIL; banner recorded beside it | Yes, determinate |
| Held-out: product with no banner (`none in product`) | Item 4 does not apply; item 3 outcomes unchanged | Yes |
| FR-2: the vendored copy | The reference command prints `a2ba4387…` = `UPSTREAM.md`; an appended newline is named non-conforming | Yes (executed by T3, its Reviewer and the test) |
| FR-3: `IMPECCABLE_BIN` and `PATH` both point into the excluded home | The download call runs with `HOME` empty, `IMPECCABLE_BIN` unset and the entry filtered → the launcher downloads; neither binary runs (L test 3) | Yes. **W-4 of child 1 closed** |
| Held-out FR-3: a `PATH` entry outside the excluded home | Kept; `curl`/`shasum` stay reachable (DD-5) | Yes |

**Cross-document figure check:**

| Figure | Documents | Agrees? |
|---|---|---|
| Ledger: 10 rows, 7 verified, 3 `UNVERIFIED` | design §11 rows, `judgment.md` re-judgment | Yes |
| Tests per task: 9, 7, 5, 6 = 27 | tasks.md, execution.md, test-report §2 | Yes |
| `npm test` 1315 → 1342 → 1345 | execution summary, test report, this report | Yes |
| Budget ~210 LOC vs 244 | design §12, execution tripwire | Differs. Recorded and accepted (W-3) |
| Review rounds ~7 vs 4 | design §12, execution | Under budget |

**Proposal alignment:**

| Proposal item | Delivered |
|---|---|
| Intent and non-goals | Kept: W-3, W-6 and W-7 are untouched, no archive or vendored edits |
| §5 scope | Delivered |
| Success criteria | All four met |
| One deviation | "one POSIX reference command" became `node -e`. It is recorded in design Document Control (resolves R-4) |
| One scope row walked and left unchanged | The priority bullet (design §7.1) |

## 9. Test Evidence Summary

From `test-report.md`: one suite, one opus Tester. 30 tests specific to this spec: 27 author TDD tests plus 3 launcher integration tests. Falsifiers were executed for each, and there are 0 product bugs. Accepted gaps: the P-16 outcome, the `.cmd` launcher, and a successful download (offline).

## 10. Agent Guide / Constitution Impact

`execution.md` records no `## Constitution Impact`. No module was created or reshaped: one skill's rules text and tests changed. Nothing is pending for `/akili-archive` beyond the usual CodeGraph re-index reminder.

## 11. Remediation

None required. The WARNs are accepted. Advisories are recorded and are not tasks (AGENTS.md, *Scope only grows through approval*).

## 12. Archive Readiness Recommendation

**Ready.** Every task is `[x]`, there are no FAILs, and the WARNs are accepted. Tests cover every clause except the documented gap.

Open questions for the Lead, carried to the archive:

1. Measure `/es/` at `1366x768`?
2. Does any banner layout reflow the hero upward (P-6)?

```text
/akili-archive changes/impeccable-audit-fixes/design-eval-followup
```
