# Test Report: `changes/akili-review`

**Overall: PASS.** All 14 FRs and 6 NFRs have automated evidence or a recorded accepted gap. The full suite is green on Node 22.23.3 and 18.20.8 (`# tests 1108 · pass 1108 · fail 0`). No product bug was found. The two accepted gaps that remain open are runtime behavior that needs the deferred T12 pilot (CI wiring on real GitHub Actions, host behavior) and review quality.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-review` |
| Date | 2026-10-26 |
| Branch / head | `feat/akili-review-pr2` at `48925ab` (PR #77 into `dev`, open, not merged) + the two new test files in this commit |
| Leader | Claude Code, `claude-opus-5-5` (T1) |
| Testers | 2 × `general-purpose` subagent on **opus**, spawned in parallel. Implementer model was sonnet only (`execution.md`, no escalation), so author ≠ tester holds. No Step 8E `akili-tester` wrapper in this repo |
| Mandate | User, 2026-10-26: "Commit locally only; never push, merge, tag or publish. Answer process gates with the recommended option; stop and report on any HALT, tripwire or real product/cost/risk decision" |
| Reference sections | `docs/trd/trd.md`: none (no TRD scenario cited). `docs/ux-ui/design.md`: none (no UI behavior) |

## 2. Summary

| Item | Value |
|---|---|
| Suites | 2 — **A** scripts (backend unit + integration), **B** text contract + installer (integration) |
| Testers | 2, in parallel (disjoint new files); none inline |
| Author tests cited, not rewritten | `test/pr-review-scripts.test.js` (167, TDD red→green in T1–T3), `test/akili-review-command.test.js` (33), `test/akili-review-ci.test.js` (30), plus the consumer suites (268 tests across install, doctor, docs-overview, marketing, diagram, security-command) |
| New tests | 33: `test/pr-review-scripts-coverage.test.js` (13), `test/akili-review-contract-coverage.test.js` (20) |
| Mutation evidence | Every new test went red under a targeted mutation on a scratch copy (A: 12 mutations; B: 30, one invalid mutation re-done) — tables in §3 and §5 |
| Product bugs | 0 |
| Full suite | Node 22.23.3: `# tests 1108 · pass 1108 · fail 0 · skipped 0`; Node 18.20.8: same (Leader run). Before this report: 1075 |
| Other checks | `npm run verify:cli` → `14 commands \| 29 skills \| 8 resources (akili-specs v2.36.1)`; `npm run pack:dry-run` → 340 files, incl. 8 `pr-review` + 3 `docs/ci` files (Tester B); `git diff --check` clean; tree unchanged after the runs |
| Skills / effort | Both Testers: `tdd`, effort high; A also `systematic-debugging` (not needed) |
| Lookup notes | A: FR-8 "`--out` inside the target" is command-side (design §7.1 Step 1), not script-enforced → moved to suite B (covered by the cited command contract) |

## 3. Backend Unit Tests (Suite A — `pr-review` scripts)

Command: `node --test test/pr-review-scripts.test.js test/pr-review-scripts-coverage.test.js` (Node 22.12.0 and 18.20.8: 167/167 and 13/13 each).

| New test (coverage file) | Requirement / clause | Falsifier (scratch copy via `AKILI_POST_REVIEW_UNDER_TEST`) |
|---|---|---|
| FR-3 Re-run on same head: `check-skip` then `post` exit 0, write nothing, even with a critical under `--fail-on critical` | FR-3 BUT must NOT post or edit | M1 `skipped.json` renamed → red |
| FR-4 Lockfile-only: manifest makes `post` apply FR-3's empty-diff skip, no `gh` call | FR-4 THEN FR-3 applies | M2 lockfile filter removed → red |
| FR-4 Small but sensitive: prepare + render recommends exactly `/akili-security src/auth/session.js --profile quick` | FR-4 recommendation | M3 `--profile full` → red |
| FR-4 BUT (script side): only Node and `gh` are spawned | FR-4 must NOT run `/akili-security` | M4 `execFileSync` added → red |
| FR-7 Malformed: missing `evidence` makes `post` refuse, naming `findings[1].evidence` | FR-7 AND IT MUST | M5 validator no-op → red |
| FR-7 `threshold` in the findings document cannot lower the bar | FR-7 threshold source | M6 → red |
| FR-9 Cap: 14 non-suspect criticals still post exactly 10 inline | FR-9 Cap AND IT MUST | M7 `INLINE_CAP = 14` → red |
| FR-9 Cap: manifest / env / CLI asking for 14 is ignored | FR-9 Cap | M7, M7b env-read cap → red |
| FR-9 Cap: findings doc or base-SHA config asking for more is refused, posts nothing | FR-9 Cap | M5 → red |
| FR-9 Forged marker in `why` today cannot make tomorrow's `check-skip` skip | FR-9 only the script writes the marker | M8 `<` not escaped → red |
| FR-10 Human resolved: two more pushes, never re-posted, stays open in summary | FR-10 Human resolved | M9 → red |
| NFR-3 `AKILI_GH_BIN` unset → `gh` from `PATH` only (skips on win32: POSIX shim) | NFR-3 | M10 → red |
| NFR-3 no `gh` anywhere → `post` and `check-skip` fail closed | NFR-3 | M11 → red |

## 4. Frontend Unit Tests

Not applicable: the spec ships no UI (commands, a skill, scripts, CI YAML and docs).

## 5. Integration Tests (Suite B — text contract, CI templates, installer)

Command: `node --test test/akili-review-contract-coverage.test.js test/akili-review-command.test.js test/akili-review-ci.test.js` (Node 22.12.0 and 18.20.8: 83/83 each). Scratch copies via `AKILI_REVIEW_CONTRACT_ROOT_UNDER_TEST` (`git archive HEAD`); unmutated control 20/20.

| New test | Requirement / clause | Mutation → red |
|---|---|---|
| Every adapted source named by an "Adapted from" line or `inspired-by` "text adapted" is in `NOTICE` with its licence | FR-1 No proprietary content, BUT notice kept | M1 MIT notice removed |
| Nothing in `pr-review` is adapted from `anthropics/claude-code`; `inspired-by` names it only "pattern, not adapted" | FR-1 No proprietary content, THEN | M2, M3 |
| `install --tool all`, `--tool cursor`, `--tool grokbot` into temp targets: every `pr-review/` copy byte-identical | FR-1 Installs on every target, AND IT MUST | M4′ `copyTreeSync` drops `NOTICE`, M5 appended byte |
| Every persona section id named by `pr-review` and the command exists in the template and the deployed `reviewer.md` | FR-5 Persona drift | M6 id renamed, M7 command/skill mismatch |
| claude, codex: no `head/` guide, persona or command path; command from HOME; exact `--add-dir`; Codex `HOME_DIR` = HOME | FR-12 PR edits the review prompt, BUT | M10, M11 |
| `ci.md` trust table and `docs/ci/README.md` keep the HOME / never-from-head row | FR-12 PR edits the review prompt | M12 |
| claude, codex: agent step has no `env:` / token; no posting command in `review`; `post-review.cjs post` once, in `post` | FR-12 Agent tries to post, AND IT MUST | M8 `GH_TOKEN` on agent step, M9 `gh pr comment` in `review` |
| FR-14 governance core list; judgment-day row; six carve-outs; `AGENTS.md` line; docs pages + CHANGELOG figure debt (DD-12); no shipped spec-path reference | FR-14, FR-8 carve-out | M23–M28 |
| NFR-1 no installer or dependency change | NFR-1 | M29 dependency added, M30 `bin/akili.js` special-cases `pr-review` |
| Restatements: addendum byte-equal at the 3 known sites only; cap 10 at every site; `--fail-on` default `none` at 8 sites plus a scan; FR-2 usage line identical | Defect class "restated rule drifts" | M13–M22 |

Two cited author tests were also mutation-checked: `FR-5 Persona drift guard` (red when `id=lenses` is dropped) and `claude: FR-11 / FR-12.7 advisory default` (red under `--fail-on critical`).

## 6. E2E Tests

None automated. An end-to-end review needs a live model host and, for CI, a GitHub repository with secrets: that is the T12 pilot, which is **deferred** (tasks.md §1). See §9.

## 7. Coverage & Traceability

A = `test/pr-review-scripts.test.js` (author), A+ = `test/pr-review-scripts-coverage.test.js`, C = `test/akili-review-command.test.js` (author), CI = `test/akili-review-ci.test.js` (author), B+ = `test/akili-review-contract-coverage.test.js`.

| Requirement | Scenario | Test Type | Test File or Command | Result | Gap or Notes |
|---|---|---|---|---|---|
| FR-1 | No proprietary content | text | C "FR-1 No proprietary content BUT notice kept"; B+ (2 tests) | PASS | Upstream content not compared (DD-11 clean room) — provenance statements tested |
| FR-1 | Installs on every target | install | C (`--tool claude`); B+ (all, cursor, grokbot; byte-identical) | PASS | |
| FR-2 | PR number without `gh` | text | C "FR-2 PR number without gh THEN + BUT" | PASS | |
| FR-2 | The diff is the PR author's own session | text | C "FR-2 Author's own session THEN + AND IT MUST" | PASS | |
| FR-2 | Grammar, targets, read-only boundary | text | C (3 tests); B+ usage restatement | PASS | |
| FR-3 | Re-run on the same head | unit + integration | A "scenario Re-run on the same head…"; A+ FR-3 | PASS | |
| FR-3 | Skip table, `--force`, forged marker, empty diff | unit | A (11 tests) | PASS | |
| FR-4 | Lockfile-only PR | unit + integration | A "scenario Lockfile-only PR…"; A+ FR-4 | PASS | |
| FR-4 | Small but sensitive (incl. BUT) | unit + integration | A "scenario Small but sensitive…"; A+ (2 tests) | PASS | Agent-side "must NOT load `security-audit`": host behavior, §9 |
| FR-5 | Persona drift | text | C "FR-5 Persona drift guard"; B+ FR-5 | PASS | |
| FR-6 | Out-of-scope change; Claimed obligation missing | text | C "FR-6 Out-of-scope… Claimed obligation missing…", "FR-6 four mapping sources" | PASS | Whether a model applies the lens: §9 |
| FR-7 | Malformed findings (incl. AND IT MUST) | unit + integration | A (2 scenario tests + Invalid input); A+ FR-7 (2) | PASS | |
| FR-7 | Single-judge critical (incl. BUT) | unit + integration | A "scenario Single-judge critical…", FR-11 exit table | PASS | |
| FR-8 | History is off by default | text | C "FR-8 REVIEW.md order + History off by default THEN + BUT" | PASS | |
| FR-8 | `--out` inside the target | text | C (command contract) | PASS | Command-side rule; not script-enforced (lookup note) |
| FR-9 | Cap (incl. AND IT MUST) | integration | A "scenario Cap…", re-post cap; A+ (3 tests) | PASS | |
| FR-9 | Forged marker and mentions | unit + integration | A (2 tests); A+ round trip | PASS | |
| FR-9 | Invalid input | integration | A "scenario Invalid input…" | PASS | |
| FR-10 | Human resolved; rows 1–10 | integration | A (14 tests); A+ two-push test | PASS | |
| FR-11 | Advisory default; exit table; break glass | integration | A (4+ tests); CI advisory default | PASS | |
| FR-12 | PR edits the review prompt | YAML text | CI (3 tests); B+ (3 tests) | PASS | Runtime: §9 |
| FR-12 | Agent tries to post | YAML text | CI (3 tests); B+ (2 tests) | PASS | Runtime: §9 |
| FR-13 | CI never routes | text | C "FR-13 routing…" | PASS | |
| FR-14 | Docs, governance, consumers, CHANGELOG | text | consumer suites (268); CI README test; B+ (6 tests) | PASS | |
| NFR-1 | No installer / dependency change | git + text | B+ NFR-1; `git diff --stat 708020e..HEAD -- bin/ package.json` empty | PASS | |
| NFR-2 | Node 18 + 22, no `O_NOFOLLOW` | run + static | full suite on both; A (2 static tests) | PASS | macOS only here; Linux and Windows legs run in PR CI |
| NFR-3 | Offline, `gh` via `PATH` / `AKILI_GH_BIN` | integration | A NFR-3; A+ (2 tests) | PASS | |
| NFR-4 | Size caps | text | C "NFR-4 size caps" | PASS | |
| NFR-5 | Suite green | run | `npm test` ×2 Nodes, `verify:cli`, `pack:dry-run`, `git diff --check` | PASS | |
| NFR-6 | Cost bounded by configuration | YAML text | CI "FR-12.6 cost controls", `--max-turns 40` | PASS | |

## 8. Remediation

No failures, so no remediation is due. Tester inner-loop fixes were test defects only, each fixed and re-run in round 1: a missing `--base`/`--head` in a `prepare` call, a static regex that matched `RegExp.exec`, a `--add-dir` regex split on `${{ … }}` spaces, a governance-table read that hit two `core` rows, and older CHANGELOG entries excluded from the carve-out scan.

**Release item (not a test failure):** both CI templates pin `akili-specs@2.37.0`; `package.json` is 2.36.1. The release must publish exactly 2.37.0, or the templates install a version that does not exist.

## 9. Accepted Gaps

| Gap | Why not automated | Substitute / owner |
|---|---|---|
| CI runtime wiring (trigger, permissions, job split, install, tarball input, posting on a real PR) | No offline GitHub Actions runtime; needs a scratch repo and API keys | YAML text contract (CI, B+). **T12 pilot (deferred)**; P-12, P-22, P-23 open there |
| Host behavior: sub-agent spawning, skill discovery from HOME, honoring the data addendum, agent-side "must NOT" clauses (no `/akili-security` run, no `security-audit` load) | Model behavior; no deterministic check | Deterministic boundary (read-only `review` job, validated posting) + T12 pilot. Residual prompt-injection risk accepted (requirements §7) |
| Agent-side clauses with text-only evidence: FR-2 *PR number without `gh`* BUT (no other fetch), the FR-2 read-only boundary, FR-13 *CI never routes*, FR-8 *History is off by default* | Model behavior; only the command text can be pinned | Text contract (`test/akili-review-command.test.js`) + T12 pilot. *(Added 2026-10-26, validation W-6)* |
| Review quality (noise, false positives) | Unmeasurable in this spec (requirements §7) | Kaizen metric over the pilot: comments resolved vs dismissed |
| NFR-2 on Linux and Windows | Local machine is macOS | The six `CLI on <os> / Node <18\|22>` checks on PR #77 |
| FR-1 content comparison against the upstream code-review plugin | Clean room (DD-11) forbids opening it | Provenance statements tested (B+) |
