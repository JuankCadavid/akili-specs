# Validation Report — `/akili-review` (changes/akili-review)

**Verdict: PASS with 9 WARN, 0 FAIL. Not archive-ready yet.** The build, the full suite (1108/1108 on Node 22 and 18), the design decisions and the CI trust-boundary text all hold, and every FR scenario has an owner and evidence. Archiving waits on four things:

1. The user explicitly accepts T12 as deferred (W-1; tasks.md §1).
2. One product decision on the CI report surface (W-2 + W-3).
3. Five one-line text corrections (W-4, W-6, W-7, W-8, W-9).
4. PR #77 green on all six legs (W-5, a pre-existing pty flake).

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-review` |
| Date | 2026-10-26 |
| Head | `feat/akili-review-pr2` at `041f02b` (PR #77 into `dev`, open, not merged) |
| Validator | Leader `claude-opus-5-5` (build integrity, PR CI read, report) + 1 independent auditor subagent on opus (task, file, coverage, quality, design, constitution phases). Implementers were sonnet: author ≠ auditor |
| Inputs | proposal, requirements, design, judgment, tasks, execution, test-report (coverage reused, cross-checked against requirements) |
| Mandate | User, 2026-10-26: "Commit locally only; never push, merge, tag or publish … stop and report … when /akili-validate is done" |
| Clean room | DD-11 held: no `anthropics/claude-code` file opened, `/code-review` not loaded |

## 2. Summary

| Area | Result |
|---|---|
| Task completion | PASS: T1–T11 (14 entries incl. T3b, T9a–c) `[x]`, each with a Leader re-run (VERIFIED) and a Reviewer PASS; T12 `[ ]` deferred → W-1 |
| File existence | PASS: every design §4 / §9.1 site changed; "not edited" sites untouched; only unexpected files are the two `/akili-test` coverage files |
| Build integrity | PASS locally; PR CI 5/6 legs green, Ubuntu/Node 22 red on a pre-existing pty flake (W-5) |
| Requirement coverage | PASS for FR-1–FR-14 and NFR-1/3/4/6 except W-2 (FR-8), W-3 (FR-11), W-4 (FR-14), W-5 (NFR-2/5) |
| Code quality (4R) | 2 WARN (W-7, W-8); the rest are advisory |
| Design conformance | PASS for DD-1–DD-16; all recorded drift explained; W-9 (design §11 budget stale) |
| Test evidence | test-report PASS reused; W-6 (accepted-gap list incomplete) |
| Constitution impact | None recorded; none needed |

## 3. Task Completion

| Check | Verdict | Evidence |
|---|---|---|
| T1–T11 `[x]` | PASS | tasks.md blocks; execution.md has 14 `### T…: … — PASS (attempt n)` entries (T7 3 attempts; T1, T10 1) |
| T12 `[ ]` | PASS, with condition (W-1) | tasks.md §1: "The spec is not archived as complete while T12 is open, unless the user explicitly accepts it as deferred" |
| Budget at close | PASS | tasks 14/15 · rounds 27/27 (user raised 25 → 27) · LOC ~5,793 by the execution ledger; auditor measured `git diff --numstat 708020e..041f02b~1 ':!docs/specs'` +5,697 (both < ~6,200) |
| Traceability | PASS | every commit in `708020e..HEAD` prefixed `[SPEC:changes/akili-review]` (except the `dev` merge `dda3d5d`) |

## 4. File Existence

| Check | Verdict | Evidence |
|---|---|---|
| New files (command, 8 `pr-review` files, 3 `docs/ci`, 2 docs pages, 3 author test files, fixtures) | PASS | `git diff --stat 708020e..HEAD` |
| §9.1 edit sites | PASS | README, AGENTS, docs hub, overview, flow, commands README, skills README, governance, `docs/cli.md` (7), judgment-day row, 6 carve-outs, count pins, Codex doctor baseline |
| Not-edited sites | PASS | `git diff --stat 708020e..HEAD -- bin package.json package-lock.json assets .claude/templates` → empty |
| Unexpected files | PASS | `test/pr-review-scripts-coverage.test.js`, `test/akili-review-contract-coverage.test.js` (from `/akili-test`) |

## 5. Build Integrity

| Command | Result |
|---|---|
| `npm test` (Node 22.23.3) | `# tests 1108 · pass 1108 · fail 0` |
| `npm test` (Node 18.20.8) | `# tests 1108 · pass 1108 · fail 0` |
| `npm run verify:cli` | `14 commands \| 29 skills \| 8 resources (akili-specs v2.36.1)` |
| `npm run pack:dry-run` | 340 files; lists the 8 `.claude/skills/pr-review/*` files and the 3 `docs/ci/*` files |
| `git diff --check 708020e..HEAD` | clean |
| `node bin/akili.js install --tool all --dry-run` | `TOTAL installed 17 \| overwritten 0 \| skipped 366` |
| `node bin/akili.js doctor --tool all` | `INCOMPLETE ok 49 \| missing 2` per tool, because the host HOME predates this change (environment, not repo) |
| `actionlint docs/ci/*.yml` | exit 0 |
| PR #77 checks (`gh pr checks 77`, head `041f02b`) | 5/6 `CLI on <os> / Node <v>` pass; **`ubuntu-latest / Node 22` fail**: `not ok 475 - pty init FR-1 (b): Ctrl-C at the scope question …` and `not ok 798 - pty FR-5: Ctrl-C at the host question …` (`harness: no RC= line in the transcript`); `release-status`, `snyk` pass |
| Flake evidence | `dev` at `dda3d5d` (PR #75 merge, no akili-review code beyond PR 1) failed the same way on Ubuntu Node 18 and 22 (`not ok 391 - pty init FR-1 (a)…`, `not ok 700 - pty FR-1 / FR-5: keyboard happy path…`); run on `48925ab` failed a third pty test. A different pty test fails each run → pre-existing harness flake |

## 6. Requirement Coverage

Clause-level ownership is from tasks.md §3; test evidence is reused from test-report.md §7 and cross-checked against requirements.md.

| Requirement | Owner | Evidence | Verdict |
|---|---|---|---|
| FR-1 (incl. *No proprietary content* BUT, *Installs on every target* AND) | T4, T5, T6 / T7 | command contract + coverage tests (byte-identical on all targets; M1–M5) | PASS |
| FR-2 (grammar, targets, read-only boundary; *PR without gh* BUT; *Author's own session* AND) | T6 / T7 | text contract only (agent-side) | PASS; gap list incomplete → W-6 |
| FR-3 (skip table; *Re-run same head* BUT) | T3 | 11 author tests + coverage M1 | PASS |
| FR-4 (*Lockfile-only*; *Small but sensitive* BUT) | T2, T6 | author + coverage M2–M4; agent-side BUT in accepted gaps | PASS |
| FR-5 (*Persona drift* BUT) | T5, T6 / T7 | drift guard + coverage M6–M7 | PASS |
| FR-6 (both scenarios, AND + BUT) | T4 / T7 | text contract; runtime → T12 | PASS |
| FR-7 (*Malformed* AND; *Single-judge* BUT; threshold source) | T1, T3 | author + coverage M5–M6 | PASS |
| FR-8 (run dir, history, carve-out, `--out`) | T2, T6, T10 | contract + author. Clause "Each review SHALL write `REVIEW.md` and `findings.json` … and `$RUNNER_TEMP/akili-review` in CI" is not met in CI: `--ci` "writes nothing" and the `post` job renders only the PR comment | **WARN W-2** |
| FR-9 (*Cap* AND; *Forged marker* BUT; *Invalid input*) | T2, T3 | author + coverage M7–M8 | PASS |
| FR-10 (10 rows; *Human resolved* BUT) | T3 | 14 author tests + two-push coverage test | PASS |
| FR-11 (exit table, break glass, *Advisory default* AND) | T3 | author + CI advisory test. Clause "Under `none` it exits 0 and the job summary reports the failure": no script or template writes `$GITHUB_STEP_SUMMARY` (`grep -rn GITHUB_STEP_SUMMARY .claude/skills/pr-review docs/ci` → 0); failure reaches stderr only; no test | **WARN W-3** |
| FR-12 (items 1–8; *PR edits prompt* BUT; *Agent tries to post* AND) | T8 | YAML contract (author + coverage M8–M12); runtime → T12 | PASS (text) |
| FR-13 (*CI never routes*) | T6 / T7 | text contract | PASS |
| FR-14 (docs, counts, governance, carve-outs, AGENTS, CHANGELOG, no spec path) | T8–T11 | consumer suites + coverage tests. CHANGELOG Notes: "Three new files … 1075" vs 5 files / 1108 at HEAD | **WARN W-4** |
| NFR-1, NFR-3, NFR-4 (137 / 87 / 355 lines), NFR-6 | — | verified | PASS |
| NFR-2, NFR-5 ("green in all six legs") | T11 | 5/6 legs; Ubuntu/Node 22 pty flake | **WARN W-5** |

## 7. Linting & Code Quality

| Item | Lens | Verdict |
|---|---|---|
| `.claude/skills/pr-review/references/ci.md` trust table: "The agent has no Bash, no write tool, no network tool and no posting tool" for both runtimes; FR-12 item 5 says the Codex sandbox "can still run read-only shell commands" (the README was corrected in T8; ci.md was not) | Risk / accuracy | **WARN W-7** |
| `.claude/commands/akili-review.md` opener says it "restates only the cap", yet it also restates the skip list, the filter list and the `REVIEW.md` order (KZ-002 class) | Readability | **WARN W-8** |
| Under `--fail-on none`, an empty or invalid `structured_output` leaves the check green with only a log line (same root as W-3) | Reliability | Advisory (via W-3) |
| `post` guards (`skipped.json` / `files: []` exit 0 before any `gh` call), hard-coded `COMMENT`, review before summary (DD-8), schema safe inside the single-quoted `--json-schema` | Reliability / Risk | PASS |

**Advisory carry-forward from execution.md (unresolved, never gating):**
- **T1:** a non-integer `manifest.threshold` fails open; there is no `line_end` type test.
- **T2:** GFM bare-URL autolinks are not neutralized; ZWJ/ZWNJ are stripped from displayed text; lowercase compounds stay `trivial`; the `prepare --out .` `rmSync` is unguarded.
- **T3:** `allowlistOf` strips `[bot]` from every entry; an interrupted post can duplicate inline comments; the "fixed" line says the thread was resolved even when the resolve call failed.
- **T4:** the full Apache LICENSE is not shipped; "plain support" vs step 5; `ci.md` "return nothing" vs the required schema.
- **T6:** `--comment` on a range or `--staged` target has no PR; the skill version pin; `git show` cannot tell an unfetched base from a missing file; an empty `review.yml` on failure; the run directory is created only after Step 0.7.
- **T8:** sort the permission lists before comparing; add a negative `git fetch/checkout` check on `review`; the ~128 KB `structured_output` env limit; `configureGitAuth` and the `restore-config` base tip (both for T12).
- **T9a:** two `inspired-by` items are missing from the docs attribution table.
- **T9c:** §2d has no CI pointer.

## 8. Design Conformance

| Item | Verdict |
|---|---|
| DD-1 – DD-16 | PASS. DD-6: base checkout, head tarball under `$RUNNER_TEMP`, symlinks deleted. DD-8 holds. DD-12: `assets/` untouched, CHANGELOG states the figure and alt-text debt |
| Recorded drift (`--input <dir>`, T3b, the PR-1 and PR-2+3 strategy amendments, the T2 falsifier split, the T11 grep regex, the artifact staging dir, `classify_inline_comments: "false"`) | PASS: each is logged in execution.md with its reason |
| Design §6 `post` row omits `--local`, which the command uses (`post --dry-run --local`, DD-16 implementation) | Advisory: update design §6 at archive |
| **Design §11** still says "Tasks **14**" and "stops and escalates past **15 tasks, ~5,700 LOC, or 25 rounds**"; tasks.md §1 has 15 tasks / ~6,200 / 27 | **WARN W-9** (cross-document figure) |
| Caps 10 / 60000 / 4000; tiers 10 / 100 / 20; threshold 80; chunk budget 12000; field maxima; 14 commands; 29 skills; 244 skill files; test counts 167/33/30/13/20 | PASS: consistent across requirements, design, tasks, `large-prs.md`, `post-review.cjs` constants, validator `LIMITS`, docs and tests |
| Proposal intent and non-goals | PASS. Success criteria: install, doctor, suite, exit codes, "Seven" everywhere except the figure — PASS; dogfood `REVIEW.md` and the CI pilot are **open (T12)**. Advisory: "validator rejects an 11th inline comment" is enforced by `post`, not the validator; the proposal's S6 "Bash limited to gh" (tightened to no Bash) and S9 `akili-review-docs.test.js` (never created) are not logged as proposal corrections |
| Release pin | Both templates pin `akili-specs@2.37.0`; `package.json` is 2.36.1. `docs/ci/README.md`'s "pinned to an exact release that contains `/akili-review`" becomes true only once 2.37.0 is published |

## 9. Test Evidence Summary

test-report.md (2026-10-26): PASS. 2 suites, 2 opus Testers in parallel, 33 new tests each falsified by a mutation, 0 product bugs. Audit re-run: `node --test` over the 5 akili-review test files → `# tests 263 · pass 263 · fail 0`. **W-6:** test-report §9 lists FR-4's agent-side negatives as host-behavior gaps, but not the other clauses whose only evidence is text: FR-2's BUT (no other fetch), the FR-2 read-only boundary, FR-13 *CI never routes*, and FR-8 *History off*.

## 10. Agent Guide / Constitution Impact

execution.md has no `## Constitution Impact` section. The only rules-document edit is the FR-14 `AGENTS.md` *Skill Usage* line, which shipped. No module needs a child guide. Optional for `/akili-archive`: name the shipped `docs/ci/` templates in `AGENTS.md` *Repository Purpose*.

## 11. Remediation

| ID | Finding | Class | Recommended route |
|---|---|---|---|
| W-1 | T12 open; archiving needs the user's explicit acceptance of the deferral | Decision (user) | Record the acceptance in tasks.md / execution.md, or run T12 |
| W-2 | FR-8: CI writes no `REVIEW.md` to `$RUNNER_TEMP/akili-review` | **Decision (product)**, paired with W-3 | (a) Amend FR-8 and FR-11: in CI the PR summary comment is the report and failures go to the job log. Or (b) add a `post`-job step that writes the rendered summary and any validation failure to `$GITHUB_STEP_SUMMARY`, with a test. (a) is text-only; (b) changes templates and scripts |
| W-3 | FR-11: under `none`, "the job summary reports the failure" is not implemented or tested | Decision (product), with W-2 | Same as W-2 |
| W-4 | CHANGELOG Notes: "Three new files … 1075 tests" vs 5 / 1108 | Text fix | Update the Notes line |
| W-5 | Ubuntu / Node 22 leg red on the pre-existing pty flake | Ops | Re-run the leg before merge; the flake is a separate Bug-track item (pty harness, also red on `dev`) |
| W-6 | test-report §9 accepted-gap list incomplete | Text fix | Add the four text-only clauses |
| W-7 | `references/ci.md` says Codex has "no Bash" | Text fix (shipped) | Split the row per runtime, as `docs/ci/README.md` does |
| W-8 | Command opener "restates only the cap" is false | Text fix (shipped) | Reword, e.g. "decides nothing the scripts decide" |
| W-9 | Design §11 budget figures contradict tasks.md §1 | Text fix (spec) | Mark §11 "superseded by tasks.md §1 (amended 2026-10-25)" or update the figures |

W-4, W-6, W-7, W-8 and W-9 are single-answer corrections. W-7 and W-8 touch shipped files, so they go through an Implementer and Reviewer pass on this branch. W-2/W-3 is the only real choice.

## 12. Archive Readiness Recommendation

**Not yet.** Archive with `/akili-archive changes/akili-review` once:

1. The user accepts T12 as deferred (W-1).
2. W-2/W-3 is decided and applied.
3. W-4, W-6, W-7, W-8 and W-9 are fixed.
4. PR #77 is green on all six legs (W-5).

Release prep must also publish exactly 2.37.0 so the template pins resolve. The T12 premises P-12, P-13, P-22 and P-23 stay accepted runtime risks until the pilot runs.

## 13. Remediation Applied (2026-10-26)

User decisions: W-1 accepted (T12 deferred), W-2/W-3 option (a), fix W-4, W-6, W-7, W-8, W-9. Details in execution.md *Post-validation remediation*.

| WARN | Status |
|---|---|
| W-1 | Closed: T12 deferral accepted and recorded in tasks.md |
| W-2, W-3 | Closed: FR-8 and FR-11 corrected to match what ships (PR comment is the only CI report; failures in the job log); proposal note added by correction closure |
| W-4, W-6, W-9 | Closed: CHANGELOG, test-report §9, design §11 corrected |
| W-7, W-8 | Closed: R1 Implementer → Reviewer PASS |
| W-5 | Open (ops): re-run PR #77's Ubuntu / Node 22 leg; pre-existing pty flake |

Post-remediation: `npm test` 1108/1108 on Node 22.23.3 and 18.20.8; `verify:cli` 14 commands, 29 skills. **Archive readiness: ready for `/akili-archive changes/akili-review`** once PR #77's six legs are green (W-5).
