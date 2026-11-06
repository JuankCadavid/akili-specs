# Validation Report — akili-panel

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-panel` |
| Date | 2026-11-06 |
| Validated at | `8098a44` |
| Auditor | `claude-opus-5-5`. The code was written by `sonnet`, so author ≠ auditor holds |
| Runtime | Claude Code 2.1.319, macOS, Node 22.23.4 |

## 2. Summary

**Verdict: PASS with 4 WARN, 0 FAIL.** Every requirement has evidence, and both `PRODUCT_BUG`s are fixed and confirmed live. The WARNs are not yet accepted by JC, so archive readiness waits on that (section 12).

| Result | Count |
|---|---|
| PASS | All tasks; FR-1 … FR-16; NFR-1 … NFR-8; success criteria 1–6 |
| WARN | 4: design gate unevaluated, unobserved live paths, CI legs not run, residual fail-open mutation |
| FAIL | 0 |
| BLOCKED | 0 |

## 3. Task Completion

| Task | Result | Evidence |
|---|---|---|
| T1 … T8 | PASS | `[x]`, entries and Reviewer verdicts in `execution.md` |
| T9 | PASS | `[x]`, closed by JC 2026-11-06 11:41 AM America/Bogota; steps 2 and 11 not observed at T9. Step 2 was seen later in the live `/clear` check |

Review rounds: 20 of 20, budget raised by JC. The two fixes after `/akili-test` are outside the task list; `execution.md` records them with JC's decisions.

## 4. File Existence

| Check | Result |
|---|---|
| Design §4 tree: all NEW and EDIT entries | PASS. All present in `git diff 7a697ba` |
| `.claude-plugin/types/` not committed | PASS. `.gitignore:12`, `package.json:19` |
| Added beyond §4 | `test/akili-panel-cli-coverage.test.js`, `test/akili-panel-flow-coverage.test.js`: `/akili-test` output, expected |

## 5. Build Integrity

The repo has no build or lint step; these are its checks.

| Command | Result |
|---|---|
| `npm test` | `# tests 1740`, `# pass 1740`, `# fail 0` |
| `claude plugin test .claude/skills/akili-panel` | `64 pass`, `0 fail` |
| `claude plugin validate .claude/skills/akili-panel`; `claude plugin validate .` | `✔ Validation passed` |
| `npm run verify:cli` | `14 commands \| 32 skills \| 1 plugin \| 8 resources` |
| `npm run pack:dry-run` | exit 0, `total files: 427` |
| `git diff --check` | clean |

No `docs/infrastructure.md`: the repo has no local stack, so no boot smoke applies.

## 6. Requirement Coverage

Coverage is reused from `test-report.md` §7 and checked against `tasks.md` → *Coverage (scenario and clause level)*, which names an owner per clause.

| Requirement | Result | Notes |
|---|---|---|
| FR-1 … FR-4, FR-13, FR-15 | PASS | `BUT` clauses by whole-tree hash, 8 CLI mutations caught, real old-installer probe |
| FR-5, FR-6, FR-11, FR-16 | PASS | A1 advisory on `parseTaskTokens` edges |
| FR-7, FR-8, FR-10 | PASS | Press confirmed by JC at T9. Real host refusal wording unseen (WARN 2) |
| FR-9 | PASS | Hung, throwing and rejecting cases, including `$.ui.panes()` and `$.session.usage()` hangs. WARN 4 |
| FR-12 | PASS | `ctx —` and `$` confirmed live; clause clarified on JC's 2A. Resume not live (WARN 2) |
| FR-14 | PASS | `claude plugin validate .`, pack excludes the root folder. `/plugin install` not live (WARN 2) |
| NFR-1 … NFR-6, NFR-8 | PASS | NFR-3 confirmed live after `/clear`, within 17 s |
| NFR-7 | **WARN** | macOS, Node 22 and 18 only; Linux and Windows legs need the PR's CI (WARN 3) |

Recorded `PRODUCT_BUG`s: 2, both fixed and re-verified. No test is kept red.

Proposal success criteria:

| # | Result | Evidence |
|---|---|---|
| 1, 2 | PASS | Section 5 |
| 3 | PASS | `install --dry-run` names `akili-panel` for `claude` only; 0 hits for the 5 other tools; per-target tests in AP |
| 4 | PASS | Clean temp install: `OK akili-panel`, 0 `MISSING akili-panel` lines; `Plugins:` heading |
| 5 | PASS | T9 and the live `/clear` check, through the install path. The proposal's `--plugin-dir` wording is superseded by T9's Disqualifier |
| 6 | PASS | `.claude/commands` diff empty; contract test `registers akili-panel, and only akili-panel` |

## 7. Linting & Code Quality

No linter exists in the repo.

### Design Review

| Field | Value |
|---|---|
| Skill source | `vendored (4.8.0)`, copy `.claude/skills/impeccable` |
| Engine | `ready`: `impeccable-engine 0.1.18`, `~/.impeccable/bin/0.1.18/impeccable` |
| Scan matrix | **`Unevaluated (no rendered web target)`**. The pane is a Claude Code side pane with no URL or dev server |
| Critique / audit | Not run. The proposal's Visual Reference is `None`. JC's eyes at T9 steps 4 and 5; polish is the separate `changes/akili-panel-polish` spec |
| Waivers | None |
| Gate | **WARN** (WARN 1) |

### 4R advisories (not spec violations)

| Lens | Note |
|---|---|
| Reliability | `parseTaskTokens` reads a false `[~]` in three edge shapes (A1); none in 47 archived `tasks.md` files |
| Reliability | Resume wiping `view` would leave the body blank until the next tick, within NFR-3 |
| Resilience | A re-read that outlasts a full response overwrites a newer measure until the next one |
| Readability | `opened` no longer decides anything and could be dropped; the comment at `register.jsx:128-129` overstates coalescing across a hot reload |
| Risk | `panel.test.tsx` grew well past its T6 size and ships in the package (D-B accepted the file) |

The per-task advisories stay recorded in `execution.md`; none became a task.

## 8. Design Conformance

| Check | Result |
|---|---|
| Design §5.2, §6.1, DD-5, DD-9 match the code after both fixes | PASS, checked by the Reviewer at round 20 |
| `.jsx` instead of the proposal's `register.tsx` | PASS. Recorded deviation, DD-3 |
| Budget figures | PASS. 20 rounds in `tasks.md` and design §12 |
| Skill count 32 and summary line across docs, tests and CLI | PASS |
| Version pin | PASS. README 2.1.318; `docs/plugins/akili-panel.md` says tests ran on 2.1.319 |
| Non-goals | PASS. No command registered beyond `/akili-panel`, no project writes, no other target |
| Budget note | Execution LOC within ~4,000. Total diff is over it only through `/akili-test`'s tests, which the budget does not count |

## 9. Test Evidence Summary

`test-report.md`: **PASS**, 2 Testers, 1740 node tests and 64 kit tests, two live `/clear` runs. Gaps are in its section 9.

## 10. Agent Guide / Constitution Impact

`execution.md` has no `## Constitution Impact` notes. `AGENTS.md` already names the plugin entry in *Repository Purpose*, from T8. No child guide is needed. PASS.

## 11. Remediation

| # | WARN | Why | Suggested handling |
|---|---|---|---|
| 1 | Design gate unevaluated | No web target for the detector; no critique or audit | Accept; `changes/akili-panel-polish` covers visual work |
| 2 | Paths not observed live | Cursor (P-27), `/plugin install` from the marketplace, resume, real host refusal wording | Accept for v1, or check after release |
| 3 | CI legs not run | Linux and Windows need a PR; 5 tests skip on Windows | The PR's six checks settle it; no push in this cycle |
| 4 | Residual fail-open mutation | Removing the `try` in `later` survives: the kit turns a hook throw into a rejection. The clause itself is proven by other cases | Accept |

## 12. Archive Readiness Recommendation

**Ready once JC accepts the 4 WARNs.** All tasks are `[x]`, no FAIL remains, and drift is reflected in the documents. The readiness rule also requires each WARN to be accepted or have a follow-up, and the user to have reviewed this summary; neither has happened yet.

```text
/akili-archive changes/akili-panel
```
