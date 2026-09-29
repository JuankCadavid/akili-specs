# Test Report: Scope the Worker Personas' Constitution Read

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/scoped-constitution-reads` |
| Date | 2026-09-29 |
| Tree under test | `6dacabb` on `master`, clean |
| Red baseline | The package at `3b66e40`, extracted with `git archive` |
| Depth | Standard |
| Run by | The Leader, inline. No Tester was spawned |
| Requested by | User, 2026-09-29: "run /akili-test once T4 passes" |

## 2. Summary

**Overall status: PASS, with two accepted gaps.**

The package delivers the new rules to every install target. What a worker *does* with the new text is not tested, because this repository has no harness that can run a worker against a persona.

| Measure | Result |
|---|---|
| Suites run | 1 (integration: package delivery) |
| Testers spawned | 0. The suite ran inline |
| Assertions | 217 passed, 0 failed |
| Installed files asserted | 26, across 4 targets |
| Red baseline at `3b66e40` | 178 of the same 217 assertions failed |
| Product bugs found | 0 |
| Lookup notes held by a Tester's report | None. No Tester ran |
| Requirements with test evidence | FR-1 to FR-8, in part (see §7) |
| Accepted gaps | 2 (see §9) |

**Why one suite, run inline.** The spec ships prose in five files: no code, no UI, no API. This repository has no test runner, no test folder and no `test` script. Its test commands are the installer's own: `verify:cli`, `pack:dry-run`, `install` and `doctor`. One suite built on those commands is trivial to run, so the Deployment Rule puts it inline.

**Skills and effort.** None assigned, since no Tester was spawned. No deviation to record.

**One defect in the suite itself, fixed during the run.** The first version matched installed files by name and skipped the Codex and Antigravity skill copies, which are named `SKILL.md`. It reported 165 assertions green. After the fix the suite covers 26 files with 217 assertions. A second defect was in the Leader's shell command, which passed the installer's options as one argument; the installer rejected it and installed nothing, and the command was corrected before any result was recorded.

## 3. Backend Unit Tests

Not applicable. The spec changes no code.

## 4. Frontend Unit Tests

Not applicable. The spec has no UI surface (`design.md` §6).

## 5. Integration Tests

### Suite: package delivery

**What it proves:** a user who installs this package receives the new persona rules and the new command rules, on each of the four targets.

**Commands run:**

| # | Command | Result |
|---|---|---|
| 1 | `npm run verify:cli` | exit 0. 11 commands, 24 skills, 7 resources; lists `akili-execute`, `akili-test`, `templates/implementer.md`, `templates/tester.md` |
| 2 | `npm run pack:dry-run` | exit 0. 275 files; the five shipped files are in the package |
| 3 | `node bin/akili.js install --tool all`, each target pointed at a scratch directory, first with `--dry-run` | exit 0. 271 files installed: Claude 42, OpenCode 42, Antigravity 145, Codex 42. Every path in the dry run resolved inside the scratch directory |
| 4 | `node bin/akili.js doctor --tool all`, same targets | exit 0. All four targets HEALTHY, 0 missing |
| 5 | Assertion script over the installed files | exit 0. 217 passed, 0 failed |
| 6 | The same script over an install of the package at `3b66e40` | exit 1. 178 failed, 39 passed |
| 7 | `git diff --check` | exit 0 |

No user configuration directory was written to. The installed `~/.claude/commands/akili-execute.md` kept its earlier modification time.

**Installed files asserted, by target:**

| Target | Personas | Command copies |
|---|---|---|
| Claude Code | 2 | 2 |
| OpenCode | 2 | 2 |
| Antigravity | 2 | 12 (workflows and skills, 6 locations) |
| Codex | 2 | 2 (skills) |

**Assertions, per installed file:**

| File | Assertion | Requirement | Red at `3b66e40` |
|---|---|---|---|
| `implementer.md`, `tester.md` | The old four-document sentence is absent | FR-1, FR-6 | Yes |
| | The word "caching" is absent | FR-6 | Yes |
| | The heading reads "Context & Skills" | DD-7 | Yes |
| | Rows S1 to S6 are each present | FR-3 | Yes |
| | The installed file is byte-identical to the packaged source | delivery | No (guard) |
| `implementer.md` | A legacy path is named | FR-3, S5 | Yes |
| | "verbatim at the source" is present | FR-2 | **No (weak)** |
| `tester.md` | "verbatim at the source" is present | FR-2 | Yes |
| | No `ux-ui` path and no `trd` path | FR-3 | Yes |
| `akili-execute` | "not a valid empty state" appears once | FR-4 | Yes |
| | "paths only" and "caching-friendly" are absent | FR-4 | Yes |
| | "or the word `none`" is present | FR-4 | Yes |
| | "lookup note" is present | FR-4 | Yes |
| | "stop and report" is present | FR-4, non-host | **No (weak)** |
| | The Step 0 caching sentence is kept | FR-6 | No (guard) |
| `akili-test` | "not a valid empty state" appears once | FR-5 | Yes |
| | The UI-suite rule is present | FR-5 | Yes |
| | "`none` is not valid for that suite" is present | FR-5 | Yes |
| | "the path the project uses" is present | FR-5 | Yes |
| | "lookup note" is present | FR-5 | Yes |
| | The Phase 0 caching sentence is kept | FR-6 | No (guard) |

**Two weak assertions.** Both pass on the pre-spec package, so they prove nothing about this change:

| Assertion | Why it is weak |
|---|---|
| `implementer.md` has "verbatim at the source" | The *Pointer briefs* bullet already held the phrase at `3b66e40` |
| `akili-execute` has "stop and report" | The phrase already appeared once at `3b66e40`; it now appears twice |

The obligations behind them are covered by the Reviewer verdicts recorded in `execution.md` (T1 attempt 3, T2 attempt 2), not by this suite.

## 6. E2E Tests

Not applicable. No user journey changes.

## 7. Coverage & Traceability

**What this evidence is.** Every assertion is a presence or absence check on installed text. It proves the package **delivers** the rule. It does not prove the rule's **effect** on a worker.

| Requirement | Scenario | Test Type | Test File or Command | Result | Gap or Notes |
|---|---|---|---|---|---|
| FR-1 | A worker starts a task | Integration | Suite, personas: old sentence absent | PASS | Delivery only. Worker behavior: gap G-1 |
| FR-2 | The brief names two TRD sections | Integration | Suite: "verbatim at the source" | PASS | Weak for `implementer.md`. Behavior: G-1 |
| FR-3 | A silent brief and a UI task (S3) | Integration | Suite: rows S1 to S6 present | PASS | Row presence only. Behavior: G-1. Read evidence: `closure.md` §3, case H2 |
| FR-3 | `none` stated, then the task touches UI (S2 → S6) | Integration | Same | PASS | Same. Read evidence: `closure.md` §3 |
| FR-3 | A stale section name (S4) | Integration | Same | PASS | Same |
| FR-3 | A project with no reference documents (S5) | Integration | Suite: legacy path named | PASS | Same. Read evidence: `closure.md` §3, "S5 then S6" and its executed falsifier |
| FR-3 | A Tester with a silent slice (S3, Tester) | Integration | Suite: Tester names no path | PASS | Same. Read evidence: `closure.md` §3, case H3 |
| FR-4 | A backend task in a project with both documents | Integration | Suite, `akili-execute`: entry rule, word `none`, lookup note | PASS | Leader behavior when composing a brief: G-1 |
| FR-5 | A UI suite whose scenarios cite no design section | Integration | Suite, `akili-test`: UI-suite rule | PASS | Leader behavior when composing a slice: G-1 |
| FR-5 | An E2E suite that asserts visual behavior | Integration | Suite, `akili-test`: path carried | PASS | Same |
| FR-6 | A later author reads the rule | Integration | Suite: "caching" absent in personas; Step 0 and Phase 0 sentences kept | PASS | Fully covered: the scenario is itself a grep |
| FR-7 | — | Integration | `shasum -a 256` on `reviewer.md` and `leader.md`, in `execution.md` T4 | PASS | Not re-run here; verified at `6dacabb` during execute |
| FR-8 | A maintainer of an older project | — | — | Not tested | `CHANGELOG.md` is a document. Covered by the T4 Reviewer verdict |
| NFR-1 | — | Integration | `wc -c`, in `execution.md` T1 | PASS | 10,631 of 10,805 and 8,867 of 8,951 bytes |
| NFR-4 | — | — | — | Not tested | A computed range, not a measurement: gap G-2 |

**Negative constraints (`BUT it must NOT`) with an automated check:**

| Constraint | Check |
|---|---|
| FR-1: must NOT be told to read the reference documents whole | The old sentence is absent from every installed persona |
| FR-6: must NOT remove the Step 0 caching sentence | The sentence is present in every installed command copy |
| FR-3: the Tester persona names no reference path | `ux-ui` and `trd` both read 0 in every installed `tester.md` |

The other negative constraints describe what a worker or a Leader must not **do**. They fall under gap G-1.

## 8. Remediation

No failure to remediate. No product bug was found.

| Item | Action |
|---|---|
| The two weak assertions | None owed by this spec. If the suite is ever kept, replace each with a check that is red on the pre-spec package |
| The suite script | It lives in the session scratchpad and is not in the repository. Adding a test folder or a `test` script is a stack decision for a spec task, not for this command |

## 9. Accepted Gaps

| # | Gap | Why automation is not practical | Substitute |
|---|---|---|---|
| G-1 | Whether a real worker, given the new persona, reads by section, and whether a Leader, given the new command text, writes the entry | No harness in this repository runs an agent against a persona or a command. Building one is test infrastructure, which this command does not decide | The literal walk in `closure.md` §3, with its executed falsifier, re-walked independently by two Reviewers. Observation on the next spec run in a project that has both reference documents |
| G-2 | The token saving itself | The range in the CHANGELOG is computed from one project's document sizes. No token telemetry was collected | None in this spec. `requirements.md` §8 records both this and Success Criterion 5 for the Kaizen retrospective of the next two specs |

Both gaps were accepted at the requirements gate (`requirements.md` §8, *No automated check exists for two classes*). This run adds no new gap.

**Also noted:** `docs/infrastructure.md` does not exist, so there is no `## Local Environment` contract. This suite needs no running stack, so nothing was blocked.
