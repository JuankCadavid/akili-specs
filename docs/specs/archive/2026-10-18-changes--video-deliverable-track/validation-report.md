# Validation Report — Video Deliverable Track

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/video-deliverable-track` |
| Depth | Standard |
| Deliverable | software (`requirements.md` Document Control). The video branch of `/akili-validate` (final look, `hyperframes check`) does not apply to this spec |
| Validated at | `725b04a` plus the uncommitted validate-time edits (A5) in `AGENTS.md`, `docs/flow.md`, `requirements.md`, `design.md` |
| Validator | Independent T3 validation auditor (`opus`). Author ≠ auditor: Implementers ran on `sonnet`, and this auditor wrote no product text |
| Date | 2026-10-18 |
| Inputs | `proposal.md`, `requirements.md`, `design.md`, `tasks.md` (14/14 `[x]`), `execution.md` (T1–T12, Pivot T1, A2, Pivot A3, A3, A4), `test-report.md` (primary coverage evidence), `test-walkthrough.md`, `t12-smoke-evidence.md`, `judgment.md`; `git diff master...HEAD` (20 commits, 35 files) and `git diff` (4 files) |
| Baseline docs | n/a. This repo has no `docs/prd.md`, `docs/ux-ui/design.md`, `docs/trd/trd.md` or `docs/specs/general-setup/`. The constitution is root `CLAUDE.md` → `AGENTS.md` |
| Build evidence | Run by the Leader on a quiet tree at the state above. This auditor ran no npm, HyperFrames or network command |

## 2. Summary

**Verdict: ARCHIVE-READY WITH WARNINGS.** Every FR scenario and every `BUT` / `AND IT MUST` clause is owned by a named task and is backed by shipped text. The build is green: 275/275 tests, `verify:cli`, pack and `diff --check` all pass. The three warnings are about records, not behaviour. All three can be fixed in one commit before `/akili-archive`.

| Level | Count | Items |
|---|---|---|
| FAIL | 0 | — |
| BLOCKED | 0 | — |
| WARN | 3 | **V-1** the A5 amendment has no record and its ID collides with existing IDs · **V-2** stale `Status` cells and a stale ledger phrase · **V-3** the validate-time edits are uncommitted |
| PASS | 59 | 14 tasks · 6 file groups · 6 build checks · 30 requirement clause rows · 3 design / intent checks |

The validate-time edits (A5) are correct, and they close the correction. The forward grep finds "one escalation line" only in historical records (`execution.md:431`, `test-report.md:118`). The backward grep finds that every NFR-1 citation and every design §3 quick-row citation (`tasks.md:155`, `execution.md:233`) still agrees. No other live document lists the quick gate: README has no list, and `docs/commands/akili-quick.md:24` already lists the criterion. The only gap is V-1: no amendment record exists for A5.

## 3. Task Completion

| Task | Status | Evidence (`execution.md`) | Result |
|---|---|---|---|
| T1 skill | `[x]` | Reviewer PASS, attempt 2 (after the Pivot), 2 falsifiers red | PASS |
| T2 governance | `[x]` | FAIL, then PASS (attempt 2); A2 re-review PASS | PASS |
| T3 constitution 8D | `[x]` | PASS, falsifier red | PASS |
| T4 propose | `[x]` | PASS, 6 held-out cases | PASS |
| T5 specify | `[x]` | PASS, 2 falsifiers red | PASS |
| T6 leader.md | `[x]` | PASS, scoped suite 60/60, falsifier `not ok 59` | PASS |
| T7 test | `[x]` | PASS (then reworked in A4 for F2) | PASS |
| T8 validate | `[x]` | PASS, falsifier red | PASS |
| T9 quick | `[x]` | PASS (then reworked in A4 for F1) | PASS |
| T10 docs | `[x]` | PASS, counts re-measured | PASS |
| T11 fixtures / CHANGELOG | `[x]` | FAIL, then PASS (KZ-002 sentence fixed) | PASS |
| T12 live smoke | `[x]` | FAIL, then PASS. Deviation recorded: a Chrome download outside scratch; `~/.cache/hyperframes` was deleted on the user's order; the prior state of `~/.hyperframes/config.json` cannot be verified | PASS |
| A3 pivot S1–S5 | `[x]` | PASS, 1 of 2 rounds used | PASS |
| A4 rework F1–F3 | `[x]` | PASS, 275/275, re-walk 32/32 | PASS |

Every Pivot and Amendment closed its correction with a recorded forward and backward grep: T1 (P-24), A2 (FR-9), A3 (FR-4 ×2, FR-6, DD-8, DD-10) and A4 (FR-6, DD-12). A5 is the exception (V-1).

Review rounds: 20 of 20. The tripwire fires only past 20, so it was reached but not crossed, and the user had approved crossing it beforehand. `execution.md:435` and `test-report.md:12` give the same count.

## 4. File Existence

| Group (design §4) | Present | Result |
|---|---|---|
| `.claude/skills/video-production/` — `SKILL.md`, `references/acceptance-criteria.md`, `references/render-evidence.md` | 3 files, 12,250 B | PASS |
| `.claude/commands/akili-{propose,specify,test,validate,quick,constitution}.md` | all edited | PASS |
| `.claude/templates/leader.md` | one clause in item 3 | PASS |
| `docs/skills/{governance,README,video-production}.md`, `docs/commands/akili-{propose,specify,test,validate,quick}.md`, `docs/flow.md`, `docs/cli.md`, `README.md`, `AGENTS.md`, `CHANGELOG.md` | all present / edited | PASS |
| `test/install-cursor.test.js`, `test/fixtures/doctor-codex-baseline.txt` | edited | PASS |
| `test/video-production.test.js` (added at `/akili-test`) | 16 tests | PASS |

The design names `akili-execute.md` as not edited (design §1 records the deviation from the proposal), and the diff confirms it.

## 5. Build Integrity

| Check | Result |
|---|---|
| `npm test` | PASS — 275 tests, 275 pass, 0 fail, 0 skipped (exit 0) |
| `npm run verify:cli` | PASS — `11 commands \| 25 skills \| 8 resources (akili-specs v2.32.2)` |
| `npm run pack:dry-run` | PASS — 284 files, 2.2 MB; 4 `video-production` paths (3 skill files and the doc page), as the CHANGELOG states |
| `git diff --check` | PASS — clean |
| `install --tool all --dry-run` (temp `HOME`) | PASS — exit 0; `video-production` is listed for every target |
| `doctor --tool all` (empty temp `HOME`) | PASS (baseline) — exit 1 with "220 missing file(s)". This is expected: nothing is installed in that HOME, and doctor reports an incomplete install that way (`docs/cli.md:90`). It is not evidence about the change, and none is claimed |

No lint or type-check command exists, and this repo is prose plus a Node CLI. No command is recommended: the contract tests in `test/video-production.test.js` already lint the skill's command set and size.

## 6. Requirement Coverage (scenario and clause level)

Primary evidence is `test-report.md` §7. Ownership comes from the `tasks.md` Coverage Map. This auditor re-read every clause below against the shipped text.

| Requirement / clause (quoted) | Owner | Shipped sentence (file:line) | Result |
|---|---|---|---|
| FR-1 Video request → `Type: Change`, `Deliverable: video`; Next Step names specify | T4 | `akili-propose.md:92-96` Signal row; `:272` "the next command is still `/akili-specify`… Video Mode applies" | PASS |
| FR-1 Mentions video, `BUT` "must NOT be classified `video` because the word appears" | T4 | `akili-propose.md` Signal row "Detect the requested deliverable, not a word in passing" | PASS |
| FR-1 Orthogonal, `AND IT MUST` "ask at most one classification question in total" | T4 | `akili-propose.md:99` Ambiguity row "at most that one question in total" | PASS |
| FR-1 Trivial × video: Lite proposal | T4 | `akili-propose.md:100`, `:86` exception, `:271` | PASS |
| FR-1 Trivial × video `AND` "`/akili-quick`… escalates to `/akili-propose`" | T9, A4 | `akili-quick.md:45` gate criterion "Not a video composition"; `:56` escalation | PASS |
| FR-1 Trivial × video `BUT` "must NOT edit a composition without the render evidence" | T9, A4 | `akili-quick.md:45` "however small or cosmetic"; `:53` the cosmetic-bug route requires "every gate criterion" | PASS |
| FR-1 Neither kind `BUT` "Video Mode must NOT apply" | T4 | `akili-propose.md:98` | PASS |
| FR-1 Default (absent row = software) | T4, T5 | `akili-propose.md` Default row; `akili-specify.md:63`; `akili-test.md:108`; `akili-validate.md:68` | PASS |
| FR-1 Reaches every reader | T5 | `akili-specify.md:66` "Copy the `Deliverable: video` row into `requirements.md`" | PASS |
| FR-2 Criteria with measurable value or `n/a`, plus the defect-class table | T1, T5 | `akili-specify.md:67`; `acceptance-criteria.md:7-32` (10 rows cover every FR-2 noun) | PASS |
| FR-2 Bug × video `BUT` "must NOT be replaced by a unit test of composition source alone" | T1, T5 | `akili-specify.md:69`; `acceptance-criteria.md:36` | PASS |
| FR-3 Every task lists `video-production`; the Implementer loads `hyperframes` first | T5, T6, T1 | `akili-specify.md:418`; `leader.md:25`; `SKILL.md:22` "Load it first" | PASS |
| FR-3 `AND IT MUST` record a deviation | existing rule | `leader.md:25` "record a one-line reason in `execution.md`" | PASS |
| FR-3 Delivery render only after final-look approval | T1, T8 | `SKILL.md:65,80`; `akili-validate.md` Phase 6 "Delivery render" | PASS |
| FR-3 `BUT` "no render — draft or delivery — … while a delegated agent is active" | T1, T7/A4, T8 | `SKILL.md:82`; `akili-test.md:108` "runs alone, after every other Tester has reported"; validate "never while one is active" | PASS |
| FR-4 Not installed: STOP and print the install route; `AND IT MUST` accept both router names; `BUT` no pipeline, no vendoring, no install without consent | T1 | `SKILL.md:18,23,25-32` (prints every route: a superset, advisory d) | PASS |
| FR-4 First render fetches a browser (A3): consent; home caches; network; caches ≠ skill install | A3 | `SKILL.md:83` | PASS |
| FR-4 Freshness scope (A3): `skills check` is not used to certify a project install | A3 | `SKILL.md:67` | PASS |
| FR-4 Software unaffected | T2–T9, T11 | every added block is keyed on `Deliverable: video`; `npm test` 275/275; C22, C29 | PASS |
| FR-5 Telemetry off; consent each time; `AND` feedback report NOT sent | T1, T12 | `SKILL.md:72-73`; T12 log shows 0 feedback matches | PASS |
| FR-6 Evidence set (check, beat stills, draft render, `ffprobe`, both duration comparisons, fps, non-empty file); ± 0.1 s default on both comparisons (A3/A4); drift `BUT` "must NOT pass because `check` exited 0"; missing at test time = STOP | T1, T7, A3, A4, T12 | `render-evidence.md:9-14,24-27,31`; `akili-test.md:108,111` | PASS |
| FR-7 Loads the bridge; `check` = build integrity; final look of draft frames against every criterion; "MUST NOT report PASS without it"; delivery render afterwards | T1, T8 | `akili-validate.md:68`, Phase 3, Phase 6; `render-evidence.md:33-39` | PASS |
| FR-8 Frontmatter (author, `binding: conditional`, MIT, `inspired-by`); all five checklist items; `BUT` not `hyperframes-*`, not a HeyGen product; no upstream text | T1, T2, T10 | `SKILL.md:1-10,110`; governance row `:52`; docs page and README row; CHANGELOG. Upstream-copy check executed at T1 (7 sentences, 0 hits), not re-run (accepted gap) | PASS |
| FR-9 Load-direct rule (A2); every restatement agrees | T2, T3, T10 | `governance.md:29-45`; `akili-constitution.md:732-734`; `README.md:152,829`; `docs/flow.md` skill line. The auditor re-ran the phrase-family grep: every on-topic hit states the narrowed rule | PASS |
| FR-10 Docs pages, README and `AGENTS.md` mentions, flow note, 5 command pages, `docs/cli.md` counts (25 ×3), CHANGELOG, both fixtures | T10, T11 | all present; `find .claude/skills -type f` → 202; 25 skill directories | PASS |
| NFR-1 Software path untouched (A5 wording) | T2–T9 | every added sentence in specify, the Leader, test and validate is keyed on `Deliverable: video`; the carve-outs for propose and quick match the shipped text | PASS |
| NFR-2 Instructed set only | T1 | `SKILL.md:60-68`; test 4 | PASS |
| NFR-3 ≤ 3 files, ≤ 20,000 B | T1 | 3 files, 12,250 B | PASS |
| NFR-4 Host-agnostic hints | T1 | `SKILL.md:36-39`; live run on Claude Code / macOS only (accepted risk) | PASS |
| NFR-5 Verification passes | T11 | §5 | PASS |

The table has 30 PASS rows: 25 for FR-1 to FR-10 by scenario and clause, plus NFR-1 to NFR-5. No clause was discharged by citing a different requirement.

## 7. Linting & Code Quality — 4R (advisory)

**Advisory only.** Nothing here gates archive, and none of it may become a task in this spec (AGENTS.md: *Scope only grows through approval*).

New at validate:

| Lens | Finding |
|---|---|
| Readability | The A5 carve-out names quick's "gate criterion … with its escalation line" but not A4's third quick edit, the cosmetic-bug qualifier (`akili-quick.md:53`). This is harmless, because NFR-1's obligation covers only specify, the Leader, test and validate, and for software the qualifier never changes the outcome |
| Readability | The CHANGELOG `/akili-test` bullet does not mention that the render evidence suite "runs alone" (A4/F2). This omits a fact but overstates nothing |
| Readability | `execution.md` "Summary (execution complete — T1–T12)" gives 18 review rounds. The rounds for A3 (19) and A4 (20) follow below it with no updated summary row |

Carried forward from `execution.md` and still unresolved at HEAD:

| ID | Lens | Finding |
|---|---|---|
| (b) | Reliability | `SKILL.md:103` routes "Burned-in captions" to `embedded-captions`, which upstream scopes to talking-head footage |
| (c) | Reliability | `SKILL.md:102` routes voice to `media-use`; upstream routes mixing and voice-over to `hyperframes-audio` (mitigated by the "installed skill wins" line) |
| (d) | Readability | FR-4 says "the install route for that host"; the skill prints every route (a superset) |
| (e), (f) | Risk | The project route passes no `--agent` (installs for every detected agent) and no `--copy` (symlinks) |
| (g), (h) | Readability | Lite depth vs the ten-row criteria table; ASCII `n/a - <reason>` and `Bug x video` vs `—` and `×` |
| (i), (j), (k) | Readability | The render-evidence report bullet is backed only indirectly; `docs/skills/README.md:12` and `governance.md:58` still read "(UI, animation)"; README says "route" in the singular |
| (l), (m) | Resilience | No rule says how to detect a first render; "check against `skills-lock.json`" names no procedure |
| (n), (o), (p) | Readability | The doc page's "it renders only after…" has an ambiguous subject; `acceptance-criteria.md:12` omits the ± 0.1 s default; the CHANGELOG drops "may" before "download" |
| A1–A5 | various | Walkthrough advisories (`test-walkthrough.md`), recorded only |

## 8. Design Conformance

| Check | Result |
|---|---|
| Design §3: one terminal branch per command for a video spec; archive, audit and resume fall through | PASS — matches the diff; walkthrough cases C30–C32 |
| DD-1 to DD-12 (as amended) reflected in the shipped text; DD-5 leaves `akili-execute.md` untouched | PASS |
| Proposal intent, scope and non-goals: no new command, nothing vendored, no installer change, no cloud rendering, no push or release; success criteria met (detection, one branch per surface, pack scoped under `.claude/skills`, governance checklist, green verification, live smoke with `check` exit 0 and duration 5.000000 s) | PASS |
| Cross-document figure check | **WARN (V-2)**, otherwise consistent: skill size 12,250 B (`execution.md` A4, measured); 202 files and 25 skills (CHANGELOG, `docs/cli.md`, measured); 275 tests = 259 + 16 (`execution.md`, `test-report.md`); pack 284 (T11 and the Leader run); 32/32 walkthrough; 20 rounds; ledger 24 rows (counted). The two Chrome figures, ~204 MB for the browser and 205 MB for the whole cache, measure different things, and "~200 MB" in the skill is a rounding |

**V-2 detail:**
- `requirements.md:12` still reads "Draft — awaiting the specify gate".
- `design.md:9` still reads "Draft — Judgment Day APPROVED …, awaiting the specify gate".
- `design.md:118` still calls P-23 an "open spec tension", although A3 settled S1–S5.

All three contradict `execution.md`, which records the approved execution and the A3 closure.

## 9. Test Evidence Summary

`test-report.md` reports an overall PASS after A4.

| Suite | Result |
|---|---|
| Suite 1, `node:test` contract tests | 16/16, 4 mutations red then green; the full suite is 275/275 |
| Suite 2, held-out walkthrough | 32 cases: 29 PASS / 3 FAIL on the first run, 32/32 after A4 |
| Live render evidence | Cited from T12, not re-run (the re-download is consent-gated) |

There are 0 `PRODUCT_BUG` findings. The accepted gaps are recorded in `test-report.md` §9.

## 10. Agent Guide / Constitution Impact

| Check | Result |
|---|---|
| `## Constitution Impact` notes in `execution.md` | None. T6 records "none (no module created or reshaped)". No child guides or `## Module Guides` index are owed |
| `AGENTS.md` Skill Usage bullet for `video-production` | Present (T10) — PASS |
| `AGENTS.md:27` and `docs/flow.md:94` quick-gate list (A5) | Now lists "not a video composition", in the same order as `akili-quick.md:41-46` — PASS |
| Deployed `.agents/leader.md` drift (P-17) | Expected after the next release; it is fixed through `doctor --agents --fix` at release time, not by this spec |

## 11. Remediation

| # | Finding | Action | Route |
|---|---|---|---|
| R1 | **V-1** — `requirements.md:285` and `design.md:31` cite "A5", but neither `execution.md` nor `tasks.md` holds an A5 record. The ID also collides with the walkthrough advisories A1–A5 (`test-walkthrough.md:144`, `test-report.md:127`) | Append `## Amendment A5 (validate-time, 2026-10-18)` to `execution.md`. Include the user decision verbatim, the four edited files, and the closure greps from §2 of this report. Name it unambiguously, for example "Amendment A5 (spec)" | Leader, before the commit |
| R2 | **V-2** — stale `Status` cells (`requirements.md:12`, `design.md:9`) and "open spec tension" (`design.md:118`) | Set both Status cells to Approved and executed (A1–A5 amendments). Reword the P-23 counts phrase as settled by A3 | Leader, same commit |
| R3 | **V-3** — the validate-time edits are uncommitted (`AGENTS.md`, `docs/flow.md`, `requirements.md`, `design.md`) | Commit them with this report, R1 and R2 under `[SPEC:changes/video-deliverable-track]` | Leader |

Remediation count: **3**, all on documents. No product text changes.

## 12. Archive Readiness Recommendation

**ARCHIVE-READY WITH WARNINGS.** Apply R1–R3 in one commit, then run `/akili-archive changes/video-deliverable-track`. At archive, the Kaizen retrospective should consider these:

- The amendment-ID namespace collision (V-1).
- Status cells that are never closed after the specify gate (V-2, which also appears in earlier archives).
- The T12 deviation: the STOP condition for downloads outside scratch was triggered and missed.

```text
/akili-archive changes/video-deliverable-track
```

## Post-validation resolution (Leader, 2026-10-18)

| Item | Action | Status |
|---|---|---|
| V-1 / R1 | "A5" renamed **V1** in `requirements.md` NFR-1 and `design.md` §3; `execution.md` gains "Amendment V1 (validate-time)" with the user's decision verbatim, the four edited files and the closure greps | Resolved |
| V-2 / R2 | `requirements.md` and `design.md` Status cells set to approved/executed; P-23 counts phrase reads "resolved by amendment A3" | Resolved |
| V-3 / R3 | Validate-time edits, R1, R2 and this report committed (`a6ae062` and this follow-up) | Resolved |

**Updated recommendation: ARCHIVE-READY.** 0 FAIL, 0 open WARN; the carried-forward advisories (execution `(b)`–`(p)`, walkthrough A1–A5) remain advisory and do not gate archive.

```text
/akili-archive changes/video-deliverable-track
```
