# Test Report: akili-panel

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-panel` |
| Status | **PASS.** Both `PRODUCT_BUG`s fixed and confirmed live; recorded gaps in section 9 |
| Date | 2026-11-06 |
| Tested at | First run: `5ac821f` plus this report's tests. Final re-test: `8098a44` |
| Runtime | Claude Code **2.1.319** (the spec pins 2.1.318, NFR-6, D-10), macOS, Node 22.23.4 and Node 18.20.8 |
| Leader / Testers | Leader `claude-opus-5-5`. Testers `opus`: no `akili-tester` wrapper exists, and the only Implementer model recorded in `execution.md` is `sonnet`, so author ≠ tester holds |

## 2. Summary

**Final state at `8098a44`:** all green, live `/clear` check passed.

| Check | Result |
|---|---|
| `npm test` | **1740 pass, 0 fail**, 0 skipped |
| `claude plugin test .claude/skills/akili-panel` | **64 pass, 0 fail** |
| `claude plugin validate`, plugin and repo root | `✔ Validation passed` |
| `npm run verify:cli` | `14 commands \| 32 skills \| 1 plugin \| 8 resources` |
| `npm run pack:dry-run` | exit 0, `total files: 427`, 0 `marketplace.json` or `.claude-plugin/types` lines |
| `git diff --check`; `.claude/commands` diff against `7a697ba` | clean; empty |
| Live `/clear` check (Claude Code 2.1.319) | PASS, section 8 |

Re-test run inline by the Leader: suites unchanged, no new authoring. The tests for the two fixes were written by the Implementer and audited with mutations by the Reviewer, not by a Tester.

The table below is the first run, at `5ac821f`.

| Check | Result |
|---|---|
| `npm test` (quiet tree, after both Testers finished) | **1740 pass, 0 fail**, 0 skipped (baseline 1602, +138 new) |
| `claude plugin test .claude/skills/akili-panel` | **54 pass, 1 fail** of 55 (was 17 of 17, +38 new) |
| `claude plugin validate .claude/skills/akili-panel` | `✔ Validation passed` |
| `claude plugin validate .` | `✔ Validation passed` |
| `npm run verify:cli` | `Summary: 14 commands \| 32 skills \| 1 plugin \| 8 resources (akili-specs v2.42.0)` |
| `npm run pack:dry-run` | exit 0, `total files: 427`, 0 `marketplace.json` lines, 0 `.claude-plugin/types` lines |
| `git diff --check` | clean |
| `git diff --stat 7a697ba -- .claude/commands` | empty |

**`npm test` does not see the failure.** The engine kit runs locally only (D-4, D-5), so CI stays green with this test red.

**Delegation.** 2 suites, 2 Testers, in parallel (independent files). None inline. Testers changed no production code. Tester skill list: `systematic-debugging` on failure only; no deviation from the task lists.

**Design detector.** Skill source `vendored (4.8.0)`, copy `.claude/skills/impeccable`. Suite **not run: `Unevaluated (no rendered web target)`**. The pane is a Claude Code side pane, not a page with a URL. `~/.impeccable/bin/0.1.18` exists; the engine was not probed, since there was nothing to scan.

**T9 decisions.** D-A (b) and D-B accepted, per JC's quote in `execution.md` → *T9 close and D-A / D-B decisions*.

## 3. Backend Unit Tests

None: the spec has no backend code.

## 4. Frontend Unit Tests

Tester `tester-plugin`, `STATUS: PRODUCT_BUG`.

| Command | Result |
|---|---|
| `node --test test/akili-panel-flow.test.js test/akili-panel-contract.test.js test/akili-panel-flow-coverage.test.js` | `# tests 173`, `# pass 173`, `# fail 0` |
| `claude plugin test .claude/skills/akili-panel` | ` 54 pass`, ` 1 fail`, `Ran 55 tests across 1 file.` |

New: 65 tests in `test/akili-panel-flow-coverage.test.js`, 38 in `.claude/skills/akili-panel/tests/panel.test.tsx`.

## 5. Integration Tests

Tester `tester-cli`, `STATUS: PASS`.

| Command | Result |
|---|---|
| `node --test test/akili-panel-cli-coverage.test.js` (Node 22) | `# tests 73`, `# pass 73`, `# fail 0` |
| Same file + `test/install-akili-panel.test.js` (Node 18.20.8), final run | `# tests 116`, `# pass 116`, `# fail 0` |
| The six author files (Node 22) | `# tests 130`, `# pass 130`, `# fail 0` |

- **Mutation check:** the CLI was broken 8 ways in scratch copies; the new file caught all 8.
- **Real old installer** (`bin/` from `7a697ba`, temp homes, manual): it left `akili-panel` in all 6 non-Claude dirs. The new `doctor --tool all` exited 1 with 6 `LEAKED` lines, and new installs removed every copy and the record entry. Old code against new code differs only by `.claude/skills: akili-panel`.
- **Flake, explained:** the first Node 18 run was 115 of 116. `FR-4 --fix restores the plugin for Claude only` failed because the other Tester edited `panel.test.tsx` between copy and compare. It passed 3 of 3 in isolation, and the re-run and the final quiet `npm test` passed. Not counted as evidence; the green quiet runs are.

## 6. E2E Tests

The live check is T9 (manual, Orca, 2026-11-06): steps 3–10 PASS, step 2 N/A, step 11 skipped, step 12 PASS. Evidence in `execution.md` → *T9 live run notes*.

## 7. Coverage & Traceability

AP = `test/install-akili-panel.test.js`, CC = `test/akili-panel-cli-coverage.test.js`, Flow = `test/akili-panel-flow.test.js`, Cover = `test/akili-panel-flow-coverage.test.js`, Kit = `.claude/skills/akili-panel/tests/panel.test.tsx`, Contract = `test/akili-panel-contract.test.js`.

| Requirement | Scenario | Test Type | Test File or Command | Result | Gap or Notes |
|---|---|---|---|---|---|
| FR-1 | Claude install, `--local`, `--skills-only` | integration | AP; CC | PASS | CC compares bytes; the author compared names |
| FR-1 | README trust note | static | CC `FR-1 W-13` | PASS | Live trust dialog not seen (gap 1) |
| FR-1 | Every other target; BUT nothing else changes | integration | AP; CC whole-tree hash; old-code probe | PASS | |
| FR-1 | `--tool all`; existing files, `--force` | integration | AP; CC | PASS | |
| FR-2 | Update | integration | CC `FR-2 Update` ×3 | PASS | POSIX only (gap 6) |
| FR-2 | Upgrade; BUT foreign folder kept | integration | AP; CC; old-code probe | PASS | |
| FR-2 | CHANGELOG note | static | CC `FR-2 CHANGELOG` | PASS | |
| FR-3 | List | integration | AP; CC; `node bin/akili.js list` | PASS | |
| FR-4 | Healthy, missing, differing, other tools, leaked | integration | AP; CC | PASS | |
| FR-5 | Last observed, branch, most recent | unit + kit | Flow; Cover; Kit | PASS | |
| FR-5 | Unsafe argument; propose; not spec-taking | unit + kit | Flow; Cover; Kit | PASS | |
| FR-6 | All scenarios incl. prose, CRLF, formats | unit | Flow; Cover | PASS | Advisory A1 |
| FR-7 | State table, 11 rows | unit | Flow; Cover | PASS | |
| FR-7 | Press; double press | kit + manual | Kit; T9 step 5 | PASS | |
| FR-7 | Run refused | kit | Kit `FR-7 run refused` | PASS | Real host wording unseen (gap 5) |
| FR-8 | Open; one command only | kit + static + manual | Kit; Contract; T9 step 3 | PASS | |
| FR-9 | Typed; Skill-tool; plugin failure | kit + manual | Kit; T9 steps 6, 7 | PASS | |
| FR-10 | No writes | kit + static | Kit; Contract | PASS | `git status` clause manual (gap 2) |
| FR-11 | Worktree, no git, subfolder and detached | unit | Flow; Cover | PASS | |
| FR-12 | Line format, shortening, fresh session | unit + kit | Cover; Kit | PASS | `9999` reads `10k` |
| FR-12 | After `/clear` or a resume: sums reset | kit | Kit | PASS | |
| FR-12 | After `/clear`: `$` stays Claude Code's total; `ctx —` | kit + live | Kit W-12, old-fill, hang; live check | PASS (fixed at `55321a4`) | Live: host restarts its cost, `$0.01` became `$0.00` |
| NFR-3, FR-6, FR-7 | Pane keeps its body after `/clear` | kit + live | Kit `NFR-3 after /clear` tests; live check | PASS (fixed at `0788c8e`) | A wiped `view` atom is covered live only |
| FR-13 | Skill inventory unchanged; carve-out | static | `test/docs-overview.test.js`; AP; CC | PASS | |
| FR-14 | Validate; root folder not packed | command + integration | `claude plugin validate .`; CC | PASS | Live `/plugin install` not run (gap 7) |
| FR-15 | Generated types | integration | AP; CC | PASS | |
| FR-16 | Empty states; read error | unit + kit + manual | Flow; Cover; Kit; T9 step 9 | PASS | |
| FR-16 | Narrow pane | unit + kit + manual | Cover; Kit; T9 step 4 (JC) | PASS | String lengths only (gap 3) |
| NFR-1, 2, 3, 5, 8 | Section 7 measures | kit + unit | Kit; Cover | PASS | NFR-3 also T9 step 8 |
| NFR-4 | Fail open | kit | Kit | PASS | Gap 4 |
| NFR-6 | Version pin | validate + README | `claude plugin validate`; README:5 | PASS | Ran on 2.1.319 |
| NFR-7 | CI matrix | static + run | CC `NFR-7`; macOS, Node 22 and 18 | PASS | Linux and Windows legs not run here |
| D-6 | Layout on a real surface | manual | T9 steps 3, 4 | PASS manual | No automated check exists, by design |
| D-9 | Double count | kit | Kit `FR-12 D-9` | PASS | The premise stays the T1 probe |

## 8. Remediation

### Fixed: pane body lost after `/clear`

JC's 1A, fixed at `0788c8e`, Reviewer PASS at round 20. Repeated live check: the full body stays at 2 s, 8 s and 36 s after `/clear`, with `Tokens: ctx — · session 0 in / 0 out · $0.00`; deleting `tasks.md` afterwards moved the pane to `specify ▶` within 17 s. Original finding:

Run 2026-11-06 ~14:50–14:53 America/Bogota, Orca tab `Akili /clear live check`, Claude Code 2.1.319, `--model haiku`, scratch `/tmp/akili-clear`, code at `55321a4`, no bypass.

| Moment | Token line (verbatim) | Pane body |
|---|---|---|
| Pane open | `Tokens: ctx — · session 0 in / 0 out · $0.00` | Full |
| After one response | `Tokens: ctx 6% (56k/1.0M) · session 56k in / 77 out · $0.01` | Full |
| After `/clear`, 1.5 s to 37 s, no new prompt | `Tokens: ctx — · session 0 in / 0 out · $0.00` | **Only the title `Akili` and the token line** |
| After the next response, and 37 s later | `Tokens: ctx 6% (56k/1.0M) · session 56k in / 5 out · $0.01` | **Still only the title and token line** |
| After typing `/akili-panel` | Same | Full again |

| Field | Value |
|---|---|
| Violated | NFR-3 (never stale by more than 30 s); FR-6, FR-7 (both blocks and the Next button) |
| Recovery | Only `/akili-panel`. Neither the 30 s timer nor a new response restores it |
| Likely cause, never confirmed; the fix holds either way | `/clear` wipes the session atoms `view` and `opened` while the host keeps the pane; `opened` false stops every refresh (`register.jsx:34`) |
| Why it was missed | T9 never ran `/clear`; the kit keeps atoms across its simulated `session.end` |

### Fixed: `$` disappears after `/clear`

JC's option A, fixed at `55321a4`, Reviewer PASS at round 19. Original finding:

| Field | Value |
|---|---|
| Requirement | FR-12, *After `/clear` or a resume*: "AND the `$` part stays Claude Code's own total, which for a resumed session counts from its first launch (W-12)" (`requirements.md:440`) |
| Failing test | `FR-12 after /clear AND: the $ part stays Claude Code's own total (W-12)`, kept red |
| Expected | `/ · \$7\.50$/` |
| Received | `"Tokens: ctx — · session 0 in / 0 out"` |
| Cause | `resetSums` (`register.jsx:109-112`) also empties `usage`, and the host raises no `session.start` after `/clear` |
| Duration | Bounded: the next `session.measure` refills the line (`FR-12 after /clear: the next measure fills the line again`, green) |
| Spec conflict | Design §5.2 chose this behaviour: "cleared with `tokens` and re-read by the next measure". Requirement and design disagree, so the fix is either code or spec |
| Live evidence | None: T9 did not exercise `/clear` |

## 9. Accepted Gaps

Recorded here, none accepted by JC yet beyond closing T9.

| # | Gap | Why not automated | Covered by |
|---|---|---|---|
| 1 | Trust dialog (T9 step 2) | Closed: seen in the live `/clear` check, and the plugin loaded after accepting it | Live check |
| 2 | FR-10 `git status` clause | Needs a real session | T9 |
| 3 | Painted layout, double-width characters (D-6) | The kit has no pixels | T9 steps 3, 4 |
| 4 | `later`'s synchronous catch (NFR-4) | The kit turns a hook throw into a rejection; removing the `try` survived mutation | Not covered |
| 5 | Real host refusal wording (FR-7) | The kit rejects with its own message | Not observed live |
| 6 | 5 CC tests skip on Windows (3 `FR-2 Update`, 2 symlink) | POSIX symlinks or a shell stub | Author source grep and the shared `install --force` path |
| 7 | Live `/plugin install` from the marketplace (FR-14) | Needs a published repo | `claude plugin validate .` only |
| 8 | Live resume; whether a resume raises `session.start` | Needs a real session; not in the types | `/clear` now observed live; resume is not |
| 9 | P-27 (Cursor, T9 step 11) | Skipped as optional | Not observed |

| 10 | Closed: `await afterClear($)` inline now reds `FR-9 BUT: with $.ui.panes() never settling, session.end clear resolves, and /akili-panel and a Skill call still run` | — | Kit test added by `tester-plugin` |

### Advisories (recorded, not acted on)

| # | Advisory |
|---|---|
| A1 | `parseTaskTokens` reads a false `[~]` in three edge shapes: a `### sub` heading under Document Control, a `- [~]` inside a code fence, and a mid-sentence `**Status:** [~]`. None occurs in the 47 archived `tasks.md` files. Effect if one does: a false `(blocked)` |
| A2 | `panel.test.tsx` grew by 546 lines and ships in the package (D-B) |
| A3 | Author comments say "packaged four"; the plugin has 7 files. The asserts derive from source and are correct |
| A4 | Author asserts of the form `run.stdout.includes(PLUGIN)` would fail if `TMPDIR` contained `akili-panel` |
