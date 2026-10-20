# Validation Report — branching flow: dev integration branch and next prereleases

**Verdict: PASS WITH WARNINGS — archive-ready.** 0 FAIL · 6 WARN · 0 BLOCKED · 25 PASS. No WARN blocks the archive. Three are fixed in the archive pass (W-2, W-3, W-4), one goes to a follow-up (W-1), and two are accepted (W-5, W-6).

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/branching-flow-dev-next` |
| Depth | **Standard** |
| Approval Mode | `pre-approved (user, 2026-10-19)`. Local commits only: no push, PR, tag, release or `npm publish` |
| Date | 2026-10-19 |
| Validated at | `aa30ad7` (clean tree; `git status --short` empty before and after every command below) |
| Diff base | `3d8c123` (execution start, `execution.md` §1) |
| Auditor | T3 Auditor, Opus 5.5, fresh context. Implementers were `sonnet`, so the auditor runs on a different model from the author |
| Context read | `CLAUDE.md` → `AGENTS.md`. There is no `docs/prd.md`, `docs/ux-ui*`, `docs/trd*` or `docs/specs/general-setup/` in this repo (`ls docs docs/specs`). That is normal here: the methodology repo has no product baselines. Spec folder: proposal, requirements, design, tasks, execution, judgment, test-report. Kaizen `## Active Lessons`: KZ-002, KZ-changes--gate-falsifiability-2, KZ-changes--archify-diagrams-1, KZ-changes--kaizen-loop-closure-2, KZ-bugfix--init-ctrlc-abort-2 |
| Evidence reused | `test-report.md` (PASS, 505/505) and `execution.md` T1–T5 (Reviewer PASS, evidence re-run VERIFIED). Cross-checked, and its counts were re-derived (§8.3) |
| Format precedent | `docs/specs/archive/2026-10-19-bugfix--update-check-deadline/validation-report.md` |

## 2. Summary

| Area | Result |
|---|---|
| Tasks | PASS (5/5 `[x]`, each with execution evidence and a closing record) |
| Files | PASS (10/10 design §4 rows present; 3 test-phase files added outside §4, which is expected) |
| Build integrity | PASS (7/7 commands, as run below) |
| Requirements | PASS for FR-1–FR-5, FR-7–FR-9 and NFR-1–NFR-4 · **FR-6 WARN (W-1)**: edge-case clause |
| Design conformance | PASS with W-2 (design §7 wording drift) and W-4 (figure drift in spec docs) |
| Proposal alignment | PASS (intent, scope, non-goals, success criteria) |
| Agent guides | **WARN (W-3)**: no Constitution Impact recorded, and the root guide's module map is missing the new script |
| Test evidence | PASS with W-5 (same-model Tester pairing) and W-6 (accepted gaps, P-10 UNVERIFIED) |

### Findings

| ID | Severity | Finding | Remediation |
|---|---|---|---|
| W-1 | WARN | FR-6 *"SHALL NOT require a CHANGELOG section, release notes, tag or GitHub Release for them"* is not met when `package.json` holds a prerelease that is **also published**. In that case `main` runs `checkVersion(pkg.version, currentPublished)`, which is `true` here, so the four artifact failures for the prerelease are listed **ahead of** the `git checkout -- package.json` line | **Follow-up** (small change with one test): `checkVersion(pkg.version, currentPublished && !isPrerelease(pkg.version))`. Not archive-blocking: the state is already drift under FR-6's own `AND IT MUST`, the exit code is the same, and the recovery line is printed |
| W-2 | WARN | Design §7 says a null fact fails with *"unreadable: \<first error line\>"*. The code uses fixed labels (`unreadable: current branch`, `unreadable: npm versions`, …). Only the fetch failure carries `firstLine(e)` (`scripts/release-next.js:112-143`) | **Fix at archive**: change the design text to match the code. FR-3 only asks for "a reason", so behaviour conforms |
| W-3 | WARN | `AGENTS.md:14` (*Repository Purpose*) names only `scripts/release.js`. T1 created a new maintainer tool (`scripts/release-next.js`, `npm run release:next`), but `execution.md` has no `## Constitution Impact` note | **Fix at archive** (agent-guide sync): name `scripts/release-next.js` (and `release-status.js`) on that line. Record the missed note in the kaizen retrospective |
| W-4 | WARN | Figure drift in the spec docs. `test-report.md` §2 says 31 tests were added to `branching-flow.test.js` (42 total), and §3 says the T3/T4/T5 baseline was 11. Measured: 12 at `d64225a`, so 30 were added. The suite grew by 47 (458 → 505): 16 + 30 + **1**, because `node --test` runs `test/release-cli-harness.js` as a file and counts it as a test (`ok 14 - test/release-cli-harness.js`). The `execution.md` §3 *Commits* row ends "T5 commit below" with no hash (`d64225a`; test phase `aa30ad7`) | **Fix at archive**: correct the two counts and add the hashes. Optionally rename the harness so it no longer matches the test glob (follow-up) |
| W-5 | WARN | The Testers ran on `sonnet`, the same model as the Implementers. `docs/model-routing.md:87` says to *"Prefer a different model than the Implementer"*. That is a preference, not the Reviewer's must-rule | **Accept**: it is recorded in `test-report.md`. Independence is backed by executed mutations in both suites, the `opus` Reviewer, and this `opus` audit |
| W-6 | WARN | Accepted gaps remain open. **P-10 is still UNVERIFIED**: under `strict`, the resync is needed after a merge commit. Also unverified: a real push to `dev` triggering both workflows, a real `npm publish --tag next`, and the Linux and Windows CI legs (NFR-2 was run locally on macOS with Node 22 and Node 18 only) | **Accept**: the user owns these at the first push to `dev`, the first `release:next` and the first stable release. The `sync/*` branch shape is needed either way, so P-10 being false costs nothing |

**Advisory items carried forward** (they have no effect on the verdict; see §7) include README:172 "exercised by the CI workflow on every push". That sentence predates this spec, sits outside the FR-7 release section, and is more accurate now than before. It is a `/akili-quick` candidate.

## 3. Task Completion

| Task | Status | Execution evidence | Closing record | Result |
|---|---|---|---|---|
| T1 | `[x]` | Red at assertion level against a stub. 4 falsifiers quoted red. Attempt-1 Reviewer FAIL (restore-failure test could not fail) was closed in attempt 2 by asserting on `r.errors`, with the mutation shown red. Dry run exit 1 quoted | PASS, attempt 2, `2214b03` | PASS |
| T2 | `[x]` | Red against stubs. The Implementer's falsifiers (1) and (2) were not clean, so the Reviewer re-executed all three cleanly. `release:status` before/after was compared sequentially by the Leader: exit code and output shape match, drift content is pre-existing network noise | PASS, attempt 1, `96562b9` | PASS |
| T3 | `[x]` | Red quoted (`branches: [master]`). 2 falsifiers red. Reviewer scoping mutations red | PASS, attempt 1, `8feb1a4` | PASS |
| T4 | `[x]` | Red 5 pass / 6 fail. 2 falsifiers red. Phrase sweep quoted. The spec tension the Reviewer raised was escalated to the user gate | PASS, attempt 1, `b69f504` | PASS |
| T5 | `[x]` | Attempt-1 Reviewer FAIL (guard description inverted, KZ-002) was fixed in attempt 2, with a two-line diff. The protection re-run was recorded with timestamps (KZ-002) | PASS, attempt 2, `d64225a` | PASS |

The T4 → T5 user gate is recorded (`8336c57`): the DD-15 Kaizen landing and the LOC tripwire raised to ~1200. Execution had no HALT, no `REVIEW_SKIPPED` and no `REVIEW_WAIVED`.

## 4. File Existence

`git diff --stat 3d8c123 -- . ':!docs/specs'` → 17 files changed, 1457 insertions(+), 55 deletions(-).

| Design §4 path | Change | At HEAD | Result |
|---|---|---|---|
| `scripts/release-next.js` | new | +269 | PASS |
| `scripts/release-status.js` | partition, `releaseFailures`, exports, `require.main` | +46 (net) | PASS |
| `scripts/release.js` | hint lines only | +4/−2, `console.log` only | PASS |
| `package.json` | `release:next`; `files` unchanged | +1 | PASS |
| `.github/workflows/ci.yml` | `[master, dev]` + syntax line | +2/−1 | PASS |
| `.github/workflows/release-status.yml` | `- dev` | +1 | PASS |
| `test/release-next.test.js` | new | +356 (26 tests) | PASS |
| `test/release-status.test.js` | new | +73 (7 tests) | PASS |
| `test/branching-flow.test.js` | new | +231 (42 tests) | PASS |
| `AGENTS.md`, `CONTRIBUTING.md`, `docs/release-checklist.md`, `README.md`, `CHANGELOG.md` | docs | +40/… , +22, +37, +35 (net −), +7 | PASS |

The test phase added three files outside §4, which is normal for `/akili-test`: `test/release-cli-harness.js` (+168), `test/release-next-cli.test.js` (+146, 12 tests) and `test/release-status-cli.test.js` (+71, 4 tests). `bin/` and `.claude/` are untouched (`git diff --stat 3d8c123 -- bin .claude` → empty), as the non-goals require.

## 5. Build Integrity

| Command (as run at `aa30ad7`) | Result |
|---|---|
| `npm test` | exit 0. `tests 505 · pass 505 · fail 0 · skipped 0` (9.99 s, Node v22.12.0) |
| `~/.nvm/versions/node/v18.20.8/bin/node --test` on the five spec test files | `tests 91 · pass 91 · fail 0` (26 + 7 + 42 + 12 + 4) |
| `npm run verify:cli` | exit 0. `12 commands \| 27 skills \| 8 resources (akili-specs v2.34.1)` |
| `npm run pack:dry-run` | exit 0. 309 files, 2.5 MB. The only `release-` match is `docs/release-checklist.md`; no `scripts/release-*.js` and no `test/` (NFR-4) |
| `git diff --check` | exit 0, clean |
| `node bin/akili.js install --tool all --dry-run` | exit 0. "349 existing file(s) were preserved" (installer unchanged) |
| `node --check scripts/release-next.js`, then the same for `release-status.js` and `release.js`, run one file at a time | 0 / 0 / 0. A single `node --check a b c` checks only `a`, so each file was run separately |
| `npm run release:next -- minor --dry-run` | **exit 1, as expected** (not on `dev`). Prints `Version: 2.35.0-next.1`, `Dist-tag: next`, the publish line, `GUARD Branch: FAIL — on "JuankCadavid/branching-flow", not dev`, `Clean: OK`, `In sync: FAIL — HEAD differs from origin/dev`, `Stable source / Source published / Base ahead: OK`, `If interrupted: git checkout -- package.json`, `ERROR: refusing to publish; failed guards: Branch, In sync`. `git status --short` empty afterwards |
| `npm run release:status` | **Not run**, by instruction: it is slow and network-flaky across 65 versions. The T2 sequential before/after comparison in `execution.md` stands |
| Lint / type-check | none defined in the repo (plain CommonJS) |

## 6. Requirement Coverage

Coverage is checked at scenario and clause level. Each clause has an owning task, code evidence and test evidence.

| Req | Clause | Task | Code evidence | Test evidence | Result |
|---|---|---|---|---|---|
| FR-1 | push to `master` + `dev`; keep `pull_request`, `workflow_dispatch`, inputs (`BUT`); job name and matrix byte-identical (`AND IT MUST`) | T3 | `ci.yml:10`, `release-status.yml:5-7`; job `name:` untouched | `branching-flow.test.js` (push-block scoped, Reviewer mutation) | PASS |
| FR-2 | first preview → `2.35.0-next.1`; next → `.3`; numeric `N`; other bases and preids ignored (`AND IT MUST`); missing or unknown bump → usage, exit 1 (`BUT`) | T1 | `nextPrereleaseVersion`, `parseArgs` | unit (`next.10` falsifier) + CLI (`next.3` published) | PASS |
| FR-3 | six guards, all reported; an unreadable fact fails its guard; scenario *Not on dev*: exit 1 naming Branch, bytes identical (`AND IT MUST`), no publish (`BUT`) | T1 | `evaluateGuards`, `attempt()` per fact | unit (each guard alone and together, null facts) + CLI (real git: branch, clean, in-sync) | PASS (reason wording: W-2) |
| FR-4 | argv with `--tag next`; `--otp` 6–8 digits; restore on success, failure, SIGINT, SIGTERM and SIGHUP; restore failure → recovery command + exit ≠ 0; success: bytes identical (`AND IT MUST --tag next`), no commit, tag, push or `latest` change (`BUT`); failure scenario | T1 | `release-next.js:221-247` | unit (argv, listener order, restore failure on `r.errors`) + CLI (real signals ×3, refs and tags unchanged) | PASS |
| FR-5 | dry run evaluates guards, prints plan, writes nothing, exit 1 or 0; scenario off `dev` | T1 | `:212-219` | unit + CLI + §5 live run | PASS |
| FR-6 | prereleases listed separately (`npm next:`, `npm prereleases:`), not artifact-checked; stable drift still reported (`AND IT MUST`); a leftover prerelease is drift naming `git checkout -- package.json` (`AND IT MUST`) | T2 | `partitionVersions`, `releaseFailures` | unit + CLI ×4 | **WARN (W-1)**. Scenario and both `AND IT MUST` clauses PASS. The statement's *SHALL NOT require … for them* fails in one edge case: a published prerelease held in `package.json` (`release-status.js` `main`: `failures.unshift(...checkVersion(pkg.version, currentPublished))`). This was not cleared by citing the `AND IT MUST` |
| FR-7 | flow rows Work, Preview, Stable prep, Stable ship and Resync in all four docs; merge commit ×2; pin after `Default Branch:`; no direct push, admins included; Kaizen landing via `kaizen/apply-*` + PR into `dev` (amended `AND IT MUST`); no surviving direct-to-`master` release instruction (`BUT`) | T4, T5 | `AGENTS.md:18,25,36,91-118`; CONTRIBUTING:7,53-63; checklist:7-12,42-52,74,89; README:410-418 | `branching-flow.test.js` (42), with mutations; phrase sweep re-run (below) | PASS |
| FR-8 | offline, through an injected runner; no real `npm publish`, `git fetch` or repo `package.json` write | T1, T2 | `exec` seam | unit: fake `exec`. CLI suite: fake `npm`/`gh` on `PATH`; real `git fetch` only against a temp bare origin under `os.tmpdir()` | PASS. Intent holds (no network, no write to the repo); the CLI suite is additive to the injected-runner coverage |
| FR-9 | PR-flow hints; no standalone `git tag` or `npm publish`; bump, CHANGELOG, notes and digests unchanged | T2 | `release.js:249-253` (`console.log` only) | `release-status.test.js` static read | PASS |
| NFR-1 | no new dependencies | T1–T3 | `package.json` diff = one `scripts` line | review | PASS |
| NFR-2 | six CI legs | T1–T4 | — | macOS Node 22 (505) + Node 18 (91), re-run here | PASS locally; Linux and Windows legs → W-6 |
| NFR-3 | `node --check scripts/release-next.js` in CI | T3 | `ci.yml:45` | static test | PASS |
| NFR-4 | not shipped | T1 | `files` unchanged | `pack:dry-run` (§5) | PASS |

**Phrase-family sweep, re-run here.** It is keyed on the obligation (KZ-changes--kaizen-loop-closure-2): `grep -n -i "commit the release\|git tag\|npm publish\|push\|directly"` over `AGENTS.md`, `CONTRIBUTING.md` and `docs/release-checklist.md`, plus the README *Releasing Package Updates* section. Every `git tag` and `npm publish` hit sits under "After it merges, on an up-to-date `master`" (`AGENTS.md:107-110`), "Only after the `dev` → `master` merge" (checklist:89) or the README/CONTRIBUTING "On an up-to-date `master`" step. `AGENTS.md:82,86` are flow-agnostic governance. **No direct-to-`master` release instruction survives.** The admins clause is literal in `AGENTS.md:25,91` and CONTRIBUTING:7. README and the checklist say "nothing is committed or pushed to `dev` or `master` directly" without "admins", which still satisfies "no one". This is advisory, as the T5 Reviewer also noted.

## 7. Linting & Code Quality (4R advisory sweep: Readability, Reliability, Reusability, Reasonableness)

> ADVISORY: nothing below changes the verdict or adds scope. Items that need work are listed in §2 as W-n.

| # | R | Item | Source |
|---|---|---|---|
| A-1 | Reliability | SIGTERM sent to the parent alone leaves the publish running, because the no-op listener keeps Node alive. The restore still runs when the child exits. This is DD-4 intent | T1 ADVISORY (carried) |
| A-2 | Reliability | No test covers the first `writeFile` throwing. The code routes it to the publish-failure path and still restores | T1 ADVISORY (carried) |
| A-3 | Readability | `release.js` prints the `git commit` hint before "Commit on a `release/vX.Y.Z` branch …", so the order reads backwards. FR-9 is met | T2 ADVISORY (carried) |
| A-4 | Reliability | The T3 push-block match could be fooled by a comment or a `dev-old` entry inside `push:`. `release-status.yml` checks use whole-file `includes` | T3 ADVISORY (carried) |
| A-5 | Readability | `AGENTS.md` *Prereleases* text names three of the six guards. Checklist:51 names all six | T4 ADVISORY (carried) |
| A-6 | Reasonableness | The resync rationale (`AGENTS.md:113`, checklist) reads as confirmed GitHub behaviour, but rests on P-10 (UNVERIFIED) | T4/T5 ADVISORY (carried); W-6 |
| A-7 | Readability | README:172 "exercised by the CI workflow on every push" predates this spec and is outside the FR-7 section. CI runs on pushes to `master` and `dev` and on PRs, not on every push | T5 ADVISORY (carried) → `/akili-quick` candidate |
| A-8 | Reusability | `test/release-cli-harness.js` header says "(Not a test file …)", but `node --test` runs it as one, which adds 1 to the count (W-4). It has no other effect | this audit |
| A-9 | Readability | Design §10 lists DD-15 before DD-14 | this audit |
| A-10 | Reliability | `makeRoot()` temp dirs are not cleaned up in the unit tests | T1 ADVISORY (carried) |

No secrets, `.tgz`, `.npmrc` or `node_modules/` in the diff. No shipped file depends on `docs/specs/changes/…` (KZ-changes--archify-diagrams-1): the hits are `@akili-spec` slug markers and one comment (`branching-flow.test.js:108`) that names the requirements file but does not read it.

## 8. Design Conformance

### 8.1 Decisions and execute-time amendments

| Item | Code / doc evidence | Result |
|---|---|---|
| DD-1 ephemeral version, DD-3 byte restore, DD-4 listeners registered before the write | `release-next.js:173-247` | PASS |
| DD-2 `N` from the registry; DD-12 *Base ahead*; DD-5 null-safe facts | `:100-151`, `:183-200` | PASS (W-2 wording) |
| DD-7 own `bumpStable`; DD-8 `require.main` + exports + pure `releaseFailures` | `release-next.js:84`, `release-status.js:240-241` | PASS |
| DD-9 merge commit ×2 + `sync/master-into-dev`; DD-10 pin | four docs; `AGENTS.md:18` | PASS |
| DD-11 static tests read the real files; DD-13 Windows runner (`npm.cmd` only) + `--otp` validation; DD-14 hint lines only | `branching-flow.test.js`; `release-next.js:37-46,57`; `release.js` diff | PASS |
| **FR-7 Kaizen `AND IT MUST` / DD-15** (amended at the T4 gate) | `AGENTS.md:36` "…Apply Mode runs on an up-to-date `dev` checkout, its uncommitted edits move to a `kaizen/apply-<YYYY-MM-DD>` branch with `git switch -c` before the commit, and they land through a PR into `dev`"; test `branching-flow.test.js:98`; CHANGELOG names `kaizen/apply-` | PASS |
| §10 reversion item 1 amended | design.md:124 | PASS |
| **LOC tripwire ~1200** (amended) | design §12 and tasks Document Control both say ~1200; execute-phase actual 1001 (`git diff --shortstat 3d8c123 d64225a` → 946+/55−) ≤ 1200 | PASS |
| design §7 null-fact reason "unreadable: \<first error line\>" | fixed labels in code | **W-2** |

### 8.2 Proposal alignment

| Aspect | Result |
|---|---|
| Intent (tooling and docs match the protected `dev`/`master` model) | PASS |
| Scope (workflows, `release-next.js`, `release-status.js`, tests, four docs, pin, CHANGELOG) | PASS. Plus FR-9 `release.js` hints, added at judgment (J7) and recorded |
| Non-goals (no push/PR/tag/publish/settings; no `akili update` change; no prerelease CHANGELOG or GitHub Release; no CI publish; stable bump unchanged) | PASS (`bin/` untouched; `release.js` diff is `console.log` only; branch has no upstream) |
| Success criteria | PASS. The dry-run criterion says "prints `2.35.0-next.1` … and publishes nothing"; shipped behaviour prints it and **exits 1** off `dev`. The criterion does not mention the exit code, and FR-5's scenario requires exit 1, so this is consistent. "Stable-collision refusal" shipped as the stronger *Base ahead* guard (J11). "`release:status` reports `-next.N` as prereleases" is proven by unit and CLI tests only: no `-next` version is published yet, and `release:status` was not run (§5) |

### 8.3 Cross-document figure check

| Figure | Claimed (where) | Measured | Result |
|---|---|---|---|
| Tasks | 5 (design §12, tasks, execution) | 5 `[x]` | PASS |
| Review rounds | 8 estimated (design §12: 2+1+1+2+2); 7 actual (execution: 2+1+1+1+2) | 7 verdicts in execution | PASS |
| Premises | "16 verified · 1 UNVERIFIED" (design §11) | P-1–P-17, P-10 UNVERIFIED | PASS. Judgment's 13 per judge predates P-14–P-17, which judgment J4, J5 and J9 added |
| Guards | six (requirements FR-3, design §7, CHANGELOG, checklist) | `evaluateGuards` → 6; live dry run printed 6 | PASS (A-5) |
| LOC | ~780 estimate; tripwire ~1000 → ~1200; actual 1001 at T5 (execution) | execute: 946+/55− = 1001 ✓. HEAD incl. test phase: 1457+/55− = 1512 | PASS. Test LOC at HEAD ≈ 1045 vs ~340 estimated (≈3.1×), which recurs KZ-bugfix--init-ctrlc-abort-2. This is kaizen input, not a defect |
| Script / test LOC | 269 + ~356 (execution T1) | 269, 356 | PASS |
| Tests after execute | 458 (execution §3); 451 after T1–T3; +6 T4; +1 T5 | `node --test` at a `git archive d64225a` snapshot → 458 ✓; `branching-flow.test.js` 5 → 11 → 12 at `8feb1a4` / `b69f504` / `d64225a` ✓ | PASS |
| Tests after test phase | 505; "B: 31 added (42 total)"; "T3/T4/T5 part 11"; A 16 | 505 ✓; 42 total ✓, but 12 → 42 = **30** added; A 12 + 4 = 16 ✓; Δ 47 = 16 + 30 + 1 harness file | **W-4** |
| Node 18 | 91/91 (test-report) | 91/91, re-run | PASS |
| Commits | execution §3 "T5 commit below" | `d64225a` (T5), `aa30ad7` (test) | **W-4** |

## 9. Test Evidence Summary

| Item | Value |
|---|---|
| `test-report.md` status | PASS: 505/505, 0 product bugs, 2 Testers in parallel (A: CLI integration; B: FR-7 docs contract) |
| Mutation evidence | Suite A: removing `--tag next`, the signal listeners, the restore, or the `stable` wiring in `main` each turned tests red. Suite B: 7 doc mutations each turned tests red and were restored byte-exact |
| Flake check | Suite A 3× 16/16, polled markers, no blind sleeps |
| Re-verified by this audit | `npm test` 505/505; Node 18 91/91; per-file counts 26 / 7 / 42 / 12 / 4 |
| Model pairing | Testers `sonnet` = Implementers `sonnet` → **W-5** (accepted) |
| Accepted gaps | real `dev` push; real `npm publish --tag next`; P-10; Windows runner and signals (Suite A skips on win32 with a printed reason) → **W-6** |

## 10. Agent Guide / Constitution Impact

| Check | Finding | Result |
|---|---|---|
| `## Constitution Impact` in `execution.md` | none recorded | — |
| Did a task create a module or change a public surface? | **Yes.** T1 added `scripts/release-next.js` and the `npm run release:next` maintainer command. T2 gave `release-status.js` a module surface (`module.exports`, `require.main`). `AGENTS.md:14` (*Repository Purpose*) still reads "`scripts/` contains helper scripts, including `scripts/release.js`, which prepares controlled npm package releases." | **W-3** |
| Rules sections | `AGENTS.md` *Development Rules* (Branch model), *Release Rules*, *Prereleases (`next`)*, *Kaizen Loop* sentence and the pin were all updated in-spec (T4/T5) | PASS |
| `CLAUDE.md` | imports `@AGENTS.md` only; no edit needed | PASS |
| Module guides | none affected (no `## Module Guides` index change needed) | PASS |
| Memory note *Release flow (direct-to-master)* | obsolete per proposal *Affected* table; refresh at archive | archive action |

## 11. Remediation

| ID | Action | When | Owner |
|---|---|---|---|
| W-1 | Exempt a prerelease `pkg.version` from `checkVersion(…, true)` and add one CLI or unit test. Route it as a small Change (or Bug Track) proposal | Follow-up, not archive-blocking | maintainer |
| W-2 | Change design §7 to "fails its guard with `unreadable: <fact>` (a fetch failure carries its first error line)" | `/akili-archive` | archive pass |
| W-3 | Add `scripts/release-next.js` (`npm run release:next`, prereleases under `next`) and `scripts/release-status.js` to `AGENTS.md:14`; note the missed Constitution Impact in the kaizen retrospective | `/akili-archive` agent-guide sync | archive pass |
| W-4 | Fix `test-report.md` §2/§3 (30 added, baseline 12, harness file counted as 1); add `d64225a` and `aa30ad7` to `execution.md` §3 *Commits* | `/akili-archive` | archive pass |
| W-5 | None: accepted and recorded | — | — |
| W-6 | Confirm on the first push to `dev` (both workflows fire, six checks green); confirm the first `release:next` with `npm view akili-specs dist-tags`; settle P-10 at the first stable release | post-merge | user |

**Kaizen input** (for `/akili-archive`, not scope): test LOC ran ≈3× the estimate (KZ-bugfix--init-ctrlc-abort-2 recurrence); no Constitution Impact note for a new script (W-3); the design §10 reversion challenge missed the protection rule (fixed by DD-15 at the T4 gate); `node --test` counts helper files under `test/` (W-4).

## 12. Archive Readiness Recommendation

**Ready to archive.** There are no FAIL or BLOCKED items. Every FR, NFR and scenario clause has an owner and evidence, and 7/7 build commands pass at `aa30ad7`. Apply W-2, W-3 and W-4 in the archive pass. Open W-1 as a follow-up and leave W-6 with the user. Kaizen Apply Mode now runs on `dev` through `kaizen/apply-*` + PR (DD-15), not on this spec branch.

```text
/akili-archive changes/branching-flow-dev-next
```

## Post-validation Resolution (2026-10-19)

| Finding | Status | Evidence |
|---|---|---|
| **W-1** | **Resolved before archive** (Leader decision, logged: a single-answer fix to an approved clause, no scope change — not deferred) | `scripts/release-status.js:220` → `checkVersion(pkg.version, currentPublished && !isPrerelease(pkg.version))`; new test in `test/release-status-cli.test.js` ("a prerelease in package.json that IS published on npm demands no artifacts, only the leftover drift line") — red before the fix on `/2\.35\.0-next\.1: missing/` (four artifact lines), green after, revert → red. `npm test` **506/506**. Implementer `sonnet` → evidence re-run (Leader) VERIFIED → Reviewer `opus` **PASS** (stable `pkg.version` still artifact-checked; existing stable-drift CLI tests still red on missing artifacts). ADVISORY: the "Current version" block still prints MISSING lines and asks `gh` for a prerelease tag (display-only, pre-existing) |
| **W-4** | **Resolved** | `test-report.md` §2 → "30 added", §3 baseline → 12, full-suite delta explained (+16 A, +30 B, +1 harness file); `execution.md` §3 Commits → `d64225a` T5 · `aa30ad7` test phase |
| W-2, W-3 | Open → `/akili-archive` | design §7 wording; `AGENTS.md:14` scripts list (Constitution & Graph Sync) |
| W-5, W-6 | Accepted | as stated above |

Updated verdict: **PASS WITH WARNINGS — archive-ready.** 0 FAIL · 4 WARN open (W-2, W-3 for the archive pass; W-5, W-6 accepted) · 0 BLOCKED. Full suite at the fix: 506/506.
