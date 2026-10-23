# Execution: Video Production Hardening

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/video-production-hardening` |
| Approval Mode | pre-approved (Juan Carlos Cadavid, 2026-10-23); the exceptions still stop |
| Owner brief (2026-10-23) | "Presupuesto aprobado por Juan Carlos: 21 tareas, ~1.250 LOC, ~38 rondas de revisión, 3 PRs; si se excede, detente y escala. Antes del primer spawn corre `akili doctor --agents` y despliega .agents si hace falta. Ejecuta T1 y T3/T4 en paralelo. Commits locales, sin push. Al terminar sigue con /akili-test y /akili-validate. Si aparece un paso HITL, detente y reporta." |
| Budget (design §12) | 21 tasks · ~1,250 LOC · ~38 review rounds · 3 PRs |
| Base commit | b7bdb3b |
| Leader | Claude Code, `opus` (T1) |
| Implementer / Reviewer | `sonnet` (T2) / `opus` (T3) — fallback sub-prompts (no Step 8E wrappers in this repo); workers read `.agents/*.md` themselves |
| Personas | `.agents/` absent at start (gitignored); deployed from `.claude/templates/` (leader, implementer, reviewer, tester). `akili doctor --agents` (v2.35.0): every section `CURRENT`, "No persona drift blocking CI." |

## Task Execution History

### T4 — `acceptance-criteria.md` — PASS (2026-10-23)

| Field | Value |
|---|---|
| Final status | PASS, attempt 1 of 3 |
| Requirements | FR-4 *Music bed*; FR-5 *Brand source names files*; FR-6 (row 10); FR-14 (THEN) |
| Files changed | `.claude/skills/video-production/references/acceptance-criteria.md` (+4 −3) |
| Skills / effort | `cognitive-doc-design` (the edited `video-production` file was read as source, not loaded); effort `low` |
| Verification | `grep -n -E "^\| (8\|9\|10) \|\|^\| Motion"` → rows 8, 9, 10 at lines 16–18 and the Motion row at line 32. Baseline: `grep -ci "music bed"` 0, `grep -c "^\| Motion"` 0; post-change 1 and 1 |
| Falsifier | Implementer deleted ", not motion" → `grep -c "not motion"` 0, row no longer limits `check --at-transitions`; restored → 1 |
| Evidence re-run | Leader inline: VERIFIED (same four rows; music bed 1; not motion 1) |
| Reviewer | `opus`, lens checklist, PASS: "All four rows match the source text, clause by clause … Its gate is not `check`, so the disqualifier does not apply … NFR-2: the 3 skill files total 14,440 bytes against the 20,000 cap." No ADVISORY |
| runtime events | none |
| spawns | Implementer `sonnet` not reported by host, ended complete; Reviewer `opus` not reported by host, ended complete |
| Decisions | Ran beside T1 and T3 (disjoint files, text-only, no build output) per the owner brief |
| Running totals | tasks 1/21 · LOC +4 −3 · review rounds 1/~38 |
| Approval | auto-approved (pre-approved mode) |

### T3 — `render-evidence.md` — PASS (2026-10-23)

| Field | Value |
|---|---|
| Final status | PASS, attempt 1 of 3 |
| Requirements | FR-1 (evidence snapshot flag); FR-2 (output flag, sanitize, `.txt`); FR-5 (BUT not warm cache); FR-6 (final-look step 4); NFR-3 |
| Files changed | `.claude/skills/video-production/references/render-evidence.md` (+17 −4) |
| Skills / effort | `cognitive-doc-design`; effort `medium` |
| Verification | (1) gate greps at lines 27 `grep -rn "$HOME" <spec>/evidence/` and 28 `grep -rnE "/(private/)?var/folders/\|/tmp/" <spec>/evidence/`; (2) `grep -c "\.txt"` → 1; (3) `Delivery: deferred` at line 51 (step 4). Baseline `.txt` 0, `evidence/` 0, `Delivery: deferred` 0 |
| Falsifier | Implementer deleted the `var/folders` line → check (1) showed line 27 only; restored → `grep -c 'var/folders'` 1 |
| Evidence re-run | Leader inline: VERIFIED (lines 27, 28; 1; line 51) |
| Tests | `node --test test/video-production.test.js` 15 pass / 1 fail; the fail is test 10 (NFR-4 host rows), caused by T1's intended host-table shape, owned by T5; duration test green |
| Reviewer | `opus`, lens checklist, PASS: "The T3 diff … meets every clause T3 owns … Disqualifier (P-24): line 17 carries the path with `UNVERIFIED — confirm at source before relying on it` … settle-at-first-use clause". No ADVISORY |
| Not Done / Assumptions (verbatim, no owed item) | "I did not measure the byte cap across all three skill files; this file only grew by about 1.3 KB." · "Evidence-files item 3 repeats the `UNVERIFIED` marker for `--output` resolution as P-29 requires." · "No git commands were run." — Leader measured: 14,440 bytes |
| runtime events | none |
| spawns | Implementer `sonnet` not reported by host, ended partial (assumptions only); Reviewer `opus` not reported by host, ended complete |
| Running totals | tasks 2/21 · review rounds 2/~38 |
| Approval | auto-approved (pre-approved mode) |

### T1 — `SKILL.md` part A: gate, install route, host table, deferral table — PASS (2026-10-23)

| Field | Value |
|---|---|
| Final status | PASS, attempt 1 of 3 |
| Requirements | FR-3 (all scenarios); FR-19 (#6136, #6139); NFR-2, NFR-3, NFR-5 |
| Files changed | `.claude/skills/video-production/SKILL.md` (+12 −11) |
| Skills / effort | `cognitive-doc-design`; effort `medium` |
| Verification | (1) `grep -n -- "--agent"` → line 30 (route `npx skills add heygen-com/hyperframes --yes --agent <id> --skill hyperframes --skill hyperframes-cli --skill hyperframes-registry --skill media-use`) and line 36 (table header); five host rows `claude-code` → `.claude/skills`, `opencode`/`codex`/`cursor`/`antigravity` → `.agents/skills`. (2) stale-name grep → 0. (3) `heygen-com` on lines 7 (inspired-by), 30 (route), 31 (Interactive picker, unchanged). (4) bytes, 3 files: 12,707 at T1 report; 14,440 with T3+T4 |
| Falsifier | re-added `--skill hyperframes-core` → check (2) read 1; restored → 0 |
| Evidence re-run | Leader inline: VERIFIED |
| Tests | `node --test test/video-production.test.js` 15 pass / 1 fail: `not ok 10 - NFR-4: project-scoped host directories cover Claude Code, OpenCode, Codex, Cursor, Antigravity` (expects the old combined row; tasks.md assigns `:235-241` to T5) |
| Reviewer | `opus`, lens checklist, PASS: "T1 meets FR-3, FR-19 (citation part), DD-7 and NFR-2/3/5, checked term by term … The ids match P-4 exactly … Captions now go to the router `hyperframes` and its references." No ADVISORY |
| Decisions | Agent ids taken from P-4 (design ledger, observed 2026-10-23), not re-run — the Disqualifier admits P-4 as source |
| runtime events | none |
| spawns | Implementer `sonnet` not reported by host, ended complete; Reviewer `opus` not reported by host, ended complete |
| Running totals | tasks 3/21 · LOC +33 −18 · review rounds 3/~38 |
| Approval | auto-approved (pre-approved mode) |

### T6 — `akili-propose.md` — PASS (2026-10-23)

| Field | Value |
|---|---|
| Final status | PASS, attempt 1 of 3 |
| Requirements | FR-6 *Recorded where downstream reads it* (propose); FR-7 *Outline replaces the delta*; FR-12 *Owner mandate*; FR-16 both scenarios |
| Files changed | `.claude/commands/akili-propose.md` |
| Skills / effort | `cognitive-doc-design`; effort `medium` |
| Verification | grep hits: :37 path rules (`literal path mandated by the brief`), :107 Approval Mode (`No mandate widens`), :126 Step 1.1 (`source questions skipped`), :168 item 1 (`Delivery: render \| deferred`), :176 item 9 and :238–254 new *Deliverable Outline* block; :240, :305 prose and checklist. Baseline 0/0/0 |
| Falsifier | Executed on a copy: removing "Never skip them under `gated`, or when the brief is silent on either source." leaves the gated and silent-brief cases **unstated**, not the skip unconditional (the remaining rule is still conditioned on `pre-approved` and on both sources named). The task's predicted outcome did not occur as worded; Reviewer concurs: "a task-text issue, not a defect in the diff" |
| Evidence re-run | Leader inline: VERIFIED (same hits; owner-mandate sentence matches design §8.4 blockquote verbatim, followed by the separate quote-instruction sentence) |
| Reviewer | `opus`, lens checklist, PASS: added checklist items "are in scope. Neither adds an obligation"; "The identical-at-three-sites contract holds"; FR-16 and FR-7 "pass term by term" |
| ADVISORY | A1 (Readability, Risk): the path-rules example `docs/specs/<slug>/` is a full path while `$SPEC_PATH` is relative to `docs/specs/`; FR-16 uses the same example, so not a FAIL — follow-up candidate. A2: the Trivial track with video does not say whether its section 9 is the Outline; FR-7 scopes the Outline to the Change track — noted only |
| Issues | Falsifier prediction written at specify time and never executed (KZ-changes--leader-brief-contract-2 recurrence) — kaizen candidate |
| runtime events | none |
| spawns | Implementer `sonnet` not reported by host, ended complete; Reviewer `opus` not reported by host, ended complete |
| Running totals | tasks 4/21 · review rounds 4/~38 |
| Approval | auto-approved (pre-approved mode) |

### T2 — `SKILL.md` part B: commands, privacy, phase map, render rules — PASS (2026-10-23)

| Field | Value |
|---|---|
| Final status | PASS, attempt 1 of 3 |
| Requirements | FR-1; FR-2 *Output flag*, *Skill refresh*; FR-4 *Film artifacts*; FR-5 *Bundled is not local*; FR-6 skill side; FR-10; FR-19 (#6137, #6138); NFR-2, NFR-3 |
| Files changed | `.claude/skills/video-production/SKILL.md` |
| Skills / effort | `cognitive-doc-design`; effort `medium` |
| Verification | (1) snapshot lines without `--describe false`: prose only — SKILL.md:53, :99, render-evidence.md:21, :56, acceptance-criteria.md:37. (2) `SKIP_SKILLS` only at Privacy 1 (:79). (3) **Byte measure (DD-6): 17,306** for the 3 files (cap 20,000; SKILL.md 11,043). (4) P-6 "reported in #6138 to send frames to a third-party model when `GEMINI_API_KEY` is set"; P-7 "#6137 reports they may be fetched from Google Fonts at compile time"; P-28 "a HyperFrames warm-check process was observed in the source run" |
| Falsifiers | dropped `--describe false` from the `snapshot --at` row → check (1) listed `SKILL.md:69`; added a `HYPERFRAMES_SKIP_SKILLS=1 … skills update` row → check (2) listed `:74`; both reverted |
| Evidence re-run | Leader inline: VERIFIED (same grep output; 17,306 bytes) |
| Tests | `node --test test/video-production.test.js` 15 pass / 1 fail (test 10, NFR-4 host rows — T5). No `npx hyperframes init` command line added, so T5's allowed-subcommand set needs no `init` |
| Reviewer | `opus`, lens checklist, PASS: "meets FR-1, FR-2 *Output flag* and *Skill refresh*, FR-4 *Film artifacts*, FR-5 *Bundled is not local*, the skill side of FR-6, both FR-10 scenarios, the FR-19 citations #6137 and #6138, and NFR-2/NFR-3, DD-6 and DD-7" (re-ran the byte and grep checks) |
| ADVISORY | Readability: the `story.md` phase-map row implies rather than states where it is stored. Readability: commands-table rows omit the env prefixes, which Privacy 1 carries by rule (prior style) |
| Decisions | Added a `snapshot --review --describe false --output <spec>/evidence/review/<task>/` commands-table row (design §8.1 Phase map row names this invocation) |
| runtime events | none |
| spawns | Implementer `sonnet` not reported by host, ended complete; Reviewer `opus` not reported by host, ended complete |
| Running totals | tasks 5/21 · review rounds 5/~38 |
| Approval | auto-approved (pre-approved mode) |

### T8 — `akili-execute.md` — PASS (2026-10-23)

| Field | Value |
|---|---|
| Final status | PASS, attempt 1 of 3 |
| Requirements | FR-12 *Owner mandate*; FR-13 both scenarios; FR-15 (execute) |
| Files changed | `.claude/commands/akili-execute.md` |
| Skills / effort | `cognitive-doc-design`; effort `medium` |
| Verification | (1) `grep -c '\$ARGUMENTS'` → 1 (Arguments, line 28; baseline 5); `$SPEC_PATH` bullet at 29, paths at 104–107. (2) hits at 167 (loop comment), 295 (Loop Rules *Effort Ceiling* bullet), 300 (Budget Tripwire), 360 (Approval Mode); exact owner-mandate sentence `grep -F` → 2 lines |
| Falsifier | on a throwaway copy, removing "never route the Reviewer to a weaker model than the escalated Implementer; " → "weaker model" count 1 → 0; real file untouched |
| Evidence re-run | Leader inline: VERIFIED |
| Reviewer | `opus`, lens checklist, PASS: "The Arguments bullet at line 28 matches the design's *First-token wording* blockquote character for character … The *Owner-mandate sentence* matches the design blockquote exactly at both execute sites … Disqualifier. Not triggered" |
| Decisions | Bullet titled "Effort Ceiling" (body carries "ceiling rung", the name T11 cites); each owner-mandate site adds "never logged `auto-approved`" (FR-12 BUT) |
| runtime events | none |
| spawns | Implementer `sonnet` not reported by host, ended complete; Reviewer `opus` not reported by host, ended complete |
| Running totals | tasks 6/21 · review rounds 6/~38 |
| Approval | auto-approved (pre-approved mode) |

### T7 — `akili-specify.md` — PASS (2026-10-23)

| Field | Value |
|---|---|
| Final status | PASS, attempt 1 of 3 |
| Requirements | FR-6 *Recorded where downstream reads it*; FR-7 *Specify converts it*; FR-9; FR-12 *Video gate multiplier*; FR-15 (specify); FR-17 |
| Files changed | `.claude/commands/akili-specify.md` (+19 −12) |
| Skills / effort | `cognitive-doc-design`; effort `medium` |
| Verification | (1) `grep -c '\$ARGUMENTS'` → 1 (Arguments, :31; baseline 6). (2) hits :76 Approval Mode, :372 Step 2.4 *Video gate multiplier*, :391 Step 2.5 *Fix only*, :421 Step 3.2 fields, :451 item 8, :519 checklist. greenfield 3, `fixed, not re-judged` 2, `Deliverable: video` 7 |
| Falsifier | scratch copy with `docs/specs/$ARGUMENTS/proposal.md` restored → check (1) read 2; scratch deleted, real file 1 |
| Evidence re-run | Leader inline: VERIFIED; Arguments first-token bullet byte-identical to `akili-execute.md`'s |
| Consumer suites (quiet tree: no Implementer active) | `node --test test/video-production.test.js test/diagram-design.test.js` → tests 29, pass 28, fail 1: `not ok 23 - NFR-4: project-scoped host directories cover Claude Code, OpenCode, Codex, Cursor, Antigravity` (T1 host-table shape, owned by T5); every `akili-specify.md` pin green |
| Reviewer | `opus`, lens checklist, PASS: "meets FR-6, FR-7, FR-9, FR-12, FR-15 and FR-17 … The disqualifier does not apply: item 8, the Step 3.2 `Red run` field and the checklist clause all carry the greenfield exception … the Arguments bullet (:31) has the same md5 in all four commands" |
| ADVISORY | Readability: Step 3.2 says the observing task's "Done criteria carry the obligation" while item 8 says "`Red run` field and Done criteria" — wording could match. Readability: the Outline mapping is written twice (Video Mode and Step 1.2, as design (b)+(d) requires) and may drift |
| runtime events | none |
| spawns | Implementer `sonnet` not reported by host, ended complete; Reviewer `opus` not reported by host, ended complete |
| Running totals | tasks 7/21 · review rounds 7/~38 |
| Approval | auto-approved (pre-approved mode) |

### T9 — `akili-test.md` — PASS (2026-10-23)

| Field | Value |
|---|---|
| Final status | PASS, attempt 1 of 3 |
| Requirements | FR-8; FR-11 *Runtime spawn*, *Rule text*; FR-15 (test) |
| Files changed | `.claude/commands/akili-test.md` |
| Skills / effort | `cognitive-doc-design`; effort `medium` |
| Verification | (1) `grep -c '\$ARGUMENTS'` → 1 (:30; baseline 6). (2) `prefer.*tester\|ideally` → one hit, :70 "Prefer pointers over copies inside the slice" (design §9: not a Tester-model claim) → 0 model-preference hits. (3) "Final-look pending" once, Phase 4 (:169). (4) `spawns:` 0; Implementer models = "registry's T2 pick or the `akili-implementer` wrapper's `model` binding, plus every model escalation recorded in `execution.md`". `Deliverable: video` 4 |
| Falsifier | restored "Prefer a Tester model that differs from the Implementer (author ≠ tester)" in the tier note → check (2) also hit :15; reverted |
| Evidence re-run | Leader inline: VERIFIED; Arguments bullet byte-identical to `akili-execute.md`'s |
| Reviewer | `opus`, lens checklist, PASS: "meets FR-8, FR-11 *Runtime spawn* and *Rule text*, and FR-15 … step 4 says **stop** … 'never auto-passed under `pre-approved`, joining the HALT, Pivot, budget tripwire, `FATAL_FAIL`, and `PRODUCT_BUG` exceptions'"; §9 sweep hits all classified |
| Decisions | Implementer added a clause to the Antigravity delegation bullet (outside the briefed site list) pointing to the every-host *Tester model rule*; Reviewer: "a conformant restatement, not widening … adds no new obligation or task" |
| runtime events | none |
| spawns | Implementer `sonnet` not reported by host, ended complete; Reviewer `opus` not reported by host, ended complete |
| Running totals | tasks 8/21 · review rounds 8/~38 |
| Approval | auto-approved (pre-approved mode) |

### T10 — `akili-validate.md` — PASS (2026-10-23)

| Field | Value |
|---|---|
| Final status | PASS, attempt 1 of 3 |
| Requirements | FR-6 *Deferred*, *Default*; FR-15 (validate) |
| Files changed | `.claude/commands/akili-validate.md` |
| Skills / effort | `cognitive-doc-design`; effort `low`–`medium` |
| Verification | (1) `grep -c '\$ARGUMENTS'` → 1 (:30; baseline 11). (2) `Delivery: deferred` at :144, delivery-render paragraph. (3) `/akili-archive $SPEC_PATH` at :176. `Deliverable: video` 4 |
| Falsifier | deleted "which never states the delivery render ran" → phrase count 1 → 0; restored from backup → 1 |
| Evidence re-run | Leader inline: VERIFIED; Arguments bullet byte-identical to `akili-execute.md`'s |
| Reviewer | `opus`, lens checklist, PASS: "Record `Delivery: deferred — final look on draft render <path>` in the report. This matches the §8.4(b) string byte for byte … Disqualifier not triggered: the final look is not skipped … §5 fall-through: met" |
| runtime events | none |
| spawns | Implementer `sonnet` not reported by host, ended complete; Reviewer `opus` not reported by host, ended complete |
| Running totals | tasks 9/21 · review rounds 9/~38 |
| Approval | auto-approved (pre-approved mode) |

### T13 — `judgment-day/SKILL.md` — PASS (2026-10-23)

| Field | Value |
|---|---|
| Final status | PASS, attempt 1 of 3 |
| Requirements | FR-17 (THEN, BUT); terminal set unchanged |
| Files changed | `.claude/skills/judgment-day/SKILL.md` (+1, *AKILI-SPECS Integration* adaptation rules, :86) |
| Skills / effort | `cognitive-doc-design`; effort `low` |
| Verification | `grep -c "approved \| escalated"` 1 before / 1 after (Hard Rules :42, untouched); `fixed, not re-judged` 0 → 1, only :86 (section starts :75) |
| Falsifier | appended the annotation to the Hard Rules terminal line (:42) → check (1) stayed 1, check (2) showed :42 outside the integration section; restored. The task's predicted outcome ("check (1) changes") was wrong — check (2) is the one that trips; the verification still catches the move (Implementer and Reviewer concur) |
| Evidence re-run | Leader inline: VERIFIED |
| Reviewer | `opus`, lens checklist, PASS: "meets every term of FR-17 … `approved \| escalated`: HEAD 1, working tree 1, both at Hard Rules :42 … `fixed, not re-judged`: appears only at :86" |
| Issues | Second specify-time falsifier prediction that did not hold when executed (after T6) — KZ-changes--leader-brief-contract-2 recurrence, kaizen candidate |
| runtime events | none |
| spawns | Implementer `sonnet` not reported by host, ended complete; Reviewer `opus` not reported by host, ended complete |
| Running totals | tasks 10/21 · review rounds 10/~38 |
| Approval | auto-approved (pre-approved mode) |

### T11 — `.claude/templates/leader.md` — PASS (2026-10-23)

| Field | Value |
|---|---|
| Final status | PASS, attempt 1 of 3 |
| Requirements | FR-11 *Rule text* (test-harness item 2); FR-13 (Leader restatement) |
| Files changed | `.claude/templates/leader.md` (3 lines: Instruction 3 "On a rework retry, take `/akili-execute`'s ceiling rung."; Instruction 4 "effort bumped one level per retry, up to the tier's ceiling"; test-harness item 2 "the Tester's model MUST differ from every Implementer model (`/akili-test` names the sources and the stop)") |
| Skills / effort | `cognitive-doc-design`; effort `low` |
| Verification | `grep -c "not a hard rule"` 1 → 0; `akili:section` markers 10 before / 10 after; suites on a quiet tree (Leader, no Implementer active): `node --test test/agents-doctor*.test.js test/persona-digests.test.js test/install*.test.js` → tests 128, pass 128, fail 0 |
| Falsifier | restored "A preference, not a hard rule —" → 1; restored from backup → 0 |
| Evidence re-run | Leader inline: VERIFIED |
| Reviewer | `opus`, lens checklist, PASS: "matches design §8.5 line by line … 'Ceiling rung' is the shipped name in `akili-execute.md` … Fences: 10 `akili:section` markers at HEAD and 10 in the working tree". ADVISORY: none |
| Notes | Deployed `.agents/leader.md` copies now read `outdated` in `akili doctor --agents` until `--fix` (design §8.5; CHANGELOG in T21) |
| runtime events | none |
| spawns | Implementer `sonnet` not reported by host, ended complete; Reviewer `opus` (shared with T12) not reported by host, ended complete |
| Running totals | tasks 11/21 · review rounds 11/~38 |
| Approval | auto-approved (pre-approved mode) |

### T12 — `.claude/templates/tester.md` — PASS (2026-10-23)

| Field | Value |
|---|---|
| Final status | PASS, attempt 1 of 3 |
| Requirements | FR-11 *Rule text* (tier note) |
| Files changed | `.claude/templates/tester.md` (:7 now "The Tester runs on a **model different from the Implementer's**, which the Leader guarantees (author ≠ tester reduces confirmation bias)."; T2 role tier kept) |
| Skills / effort | `cognitive-doc-design`; effort `low` |
| Verification | `grep -n -i "prefer running"` 1 → 0; markers 10/10; same 128/128 suite run as T11 |
| Falsifier | restored the "prefer running" wording → 1; restored → 0 |
| Evidence re-run | Leader inline: VERIFIED |
| Reviewer | `opus`, lens checklist, PASS: "This is the exact §8.5 replacement … the two personas state one rule, as DD-9 requires". ADVISORY: none |
| runtime events | none |
| spawns | Implementer `sonnet` not reported by host, ended complete; Reviewer shared with T11 |
| Running totals | tasks 12/21 · review rounds 12/~38 |
| Approval | auto-approved (pre-approved mode) |

### T5 — `test/video-production.test.js` — attempt 1 FAIL (2026-10-23)

| Field | Value |
|---|---|
| Attempt 1 | Implementer `sonnet`, effort `high`, skill `tdd`. 16 → 33 tests (+219 −6), 33/33 green. Red at 34afbff: 17 red (amended host-rows test + 16 new pins). Mutations: consent → #17; `--describe false` on `snapshot --review` → #17; `skills update` in SKIP_SKILLS list → #22 (first run stayed green; regex fixed); one sanitize grep → #20; Motion gate `check` → #32; Cursor `--agent` cleared → #10 |
| Evidence re-run | Leader inline: VERIFIED (tests 33, pass 33, fail 0) |
| Reviewer verdict | `opus`, FAIL — two THEN terms unpinned (removing them keeps the suite green): (1) FR-2 *Skill refresh* THEN reason ": without it `init` checks GitHub and refreshes skills" — deleted, suite 33/33; (2) FR-4 *Film artifacts* THEN "where each artifact is stored" — `SPEC.md` "stored at the composition root" → "stored anywhere", suite 33/33; `story.md` storage unpinned. Reviewer mutations that went red as expected: FR-2 *Logs* BUT → #21, FR-10 *One render* → #31, FR-3 *Lock* BUT → #24, beat-stills flag → #17 |
| ADVISORY | NFR-6 self-check only catches a `join(…"specs")` shape; `cells()` duplicates the host-rows test's split; #23 `route.match(...)[1]` throws a TypeError instead of a named assertion |
| runtime events | none |
| spawns | Implementer `sonnet` not reported by host, ended complete; Reviewer `opus` not reported by host, ended fail |
| Next | attempt 2, effort `xhigh` (one level up; T2 ceiling), Reviewer report verbatim |
| Running totals | review rounds 13/~38 |

### T5 — attempt 2 FAIL (2026-10-23)

| Field | Value |
|---|---|
| Attempt 2 | Implementer `sonnet`, effort `xhigh`, skill `tdd`, fresh spawn with the attempt-1 Reviewer report verbatim. #22 pins the SKIP_SKILLS reason; #26 pins `story.md` and `SPEC.md` storage; #23 asserts the route match first (advisory). Mutations: reason deleted → #22 `expected the stated reason for SKIP_SKILLS`; `stored anywhere` → #26 `expected SPEC.md storage`; `; then requirements.md` removed → #26 `expected story.md storage` |
| Evidence re-run | Leader inline (quiet tree): VERIFIED — tests 33, pass 33, fail 0 |
| Reviewer verdict | `opus`, FAIL — attempt-1 issues closed (mutations re-run red), two more unpinned: (1) FR-3 *Lock mismatch* "AND IT MUST still pass on a found router" — `Continue` → `Stop` in the router-found row leaves 33/33; (2) FR-4 *Film artifacts* storage of `REVIEW.md` — deleting "with `REVIEW.md` copied there" leaves 33/33. Other spot mutations red as expected (Codex `--agent` id → #10; "the `skills` commands are included" → #22; SKIP_SKILLS on `skills check` → #22; "creates no approval of its own" → #26) |
| ADVISORY | NFR-6 self-check shape (stands); two row parsers; telemetry-on-every-command pinned through the rule sentence only (acceptable as written) |
| runtime events | none |
| spawns | Implementer `sonnet` not reported by host, ended complete; Reviewer `opus` not reported by host, ended fail |
| Running totals | review rounds 15/~38 |
| Decision — attempt 3 | Effort already sat at the T2 ceiling (`xhigh`) before this retry, so `/akili-execute`'s ceiling rung fires (Loop Rules *Effort Ceiling*). A Reviewer model distinct from the T3 pick (`opus`) and at least as strong exists on this host — `fable` (the frontier escalation above Opus named in `docs/model-routing.md`) — so: **escalate with a distinct auditor**. Implementer escalated to T3 `opus` at effort `xhigh` (reason: two consecutive FAILs on unpinned clauses at the T2 ceiling); Reviewer `fable`. Attempt ceiling stays 3 |

### T14 — `test/command-contracts.test.js` — attempt 1 FAIL (2026-10-23)

| Field | Value |
|---|---|
| Attempt 1 | Implementer `sonnet`, effort `high`, skill `tdd`. New file, 338 lines (the worker reported "482 LOC"; `wc -l` reads 338), 48 tests, green. Red at 34afbff: all 48 red; `$ARGUMENTS` 6/5/6/12 (task text predicted 11 for validate — Leader: 11 lines, 12 occurrences at 34afbff; both figures true, the task counted lines). Mutations: validate path → 10, 11; owner-mandate copy → 15; "Prefer" beside MUST in tier note → 22; drop "under `gated`" → 45; 15 more, one per contract, each red only on its own test |
| Evidence re-run | Leader inline (quiet tree): VERIFIED — tests 48, pass 48, fail 0; no `docs/specs/changes` string in the file |
| Reviewer verdict | `opus`, FAIL — (1) FR-7 THEN partly pinned: beat columns (time, content, intent) and asset columns (source, license/owner) unpinned — removing `Intent`, or cutting the assets header to `\| Asset \|`, stays 48/48; (2) FR-8 THEN partly pinned: section contents unpinned — deleting "each with timestamp and still path" or "(the evidence-set table)" stays 48/48. Nine Reviewer spot mutations elsewhere each went red on their own test |
| ADVISORY | `section()` fence detection at column 0 only; `line()` anchors on the first matching line in the file; nothing pins "`Delivery` on a software spec is ignored" (not assigned to T14 — recorded only) |
| runtime events | none |
| spawns | Implementer `sonnet` not reported by host, ended complete; Reviewer `opus` not reported by host, ended fail |
| Next | attempt 2, effort `xhigh`, Reviewer report verbatim |
| Running totals | review rounds 16/~38 |

### T14 — attempt 2 FAIL (2026-10-23)

| Field | Value |
|---|---|
| Attempt 2 | Implementer `sonnet`, effort `xhigh`, skill `tdd`, Reviewer report verbatim. Test 35 pins the beats/assets table headers and the full constraints line; test 28 pins each section's parenthesised content. Walk: 47 single-term removals, all red |
| Evidence re-run | Leader inline (quiet tree): VERIFIED — tests 48, pass 48, fail 0 |
| Reviewer verdict | `opus`, FAIL — attempt-1 issues closed (mutations re-run red); three THEN terms unpinned, each mutation 48/48 green: (1) FR-11 *Runtime spawn* THEN — "the Tester's model MUST be none of the Implementer models that wrote the code under test." replaced by "the Tester should ideally differ."; (2) FR-6 *Default* THEN — "only after the final look is approved, " deleted; (3) FR-12 *Video multiplier* THEN — ", parity tools" deleted (swallowed by `.*` in test 40) |
| ADVISORY | FR-13 WHEN sources (frontier pin / cross-host dispatch) unpinned (WHEN, not THEN); specify Copy-Delivery `(render \| deferred)` unpinned (not required by FR-6 *Recorded* THEN); attempt-1 advisories stand |
| runtime events | none |
| spawns | Implementer `sonnet` not reported by host, ended complete; Reviewer `opus` not reported by host, ended fail |
| Running totals | review rounds 18/~38 (T5 attempt 3 verdict pending) |
| Decision — attempt 3 | Effort at the T2 ceiling (`xhigh`) before this retry → ceiling rung: escalate with a distinct auditor. Implementer escalated to T3 `opus`, effort `xhigh` (reason: two consecutive FAILs on unpinned THEN terms at the T2 ceiling); Reviewer `fable`. Attempt ceiling stays 3 |

### T5 — `test/video-production.test.js`: pins for T1–T4 — PASS on attempt 3 (2026-10-23)

| Field | Value |
|---|---|
| Final status | PASS, attempt 3 of 3 |
| Requirements | FR-1, FR-2, FR-3, FR-4, FR-5, FR-10, FR-14 (every clause T1–T4 own); NFR-1, NFR-2, NFR-6 |
| Files changed | `test/video-production.test.js` (+229 −6); tests 16 → 33 |
| Attempts | 1 FAIL and 2 FAIL (entries above). Attempt 3: Implementer `opus` (T3, escalated by the ceiling rung), effort `xhigh`, skill `tdd`. #24 pins the router-found outcome cell ending `. Continue`; #26 pins exact owner cells and storage for `story.md`, `SPEC.md`, `snapshot --review`/`REVIEW.md`, `--describe false` on the review line, the storyboard rule; #28 extended to "fetched from Google Fonts at compile time" (found by its own walk). Term walk built from the requirement text: 91 single-term mutations on scratch roots, RED 91 / green 0 (`a3/walk.js`, `a3/walk.out` in the session scratchpad) |
| Red run (greenfield, observed in T5) | attempt 1, 34afbff skill files in a scratch root: 17 red (amended host-rows test + 16 new pins), e.g. `SKILL.md:63 snapshot line has no --output`, `expected heading "## Evidence files"`, `deferral owner "hyperframes-core" is not in the core set` |
| Evidence re-run | Leader inline (quiet tree): VERIFIED — tests 33, pass 33, fail 0 |
| Reviewer | `fable` (distinct auditor, ceiling rung), PASS: "Every THEN/BUT/AND clause in the T5 coverage rows … now has a row/line/item-located assertion … both prior FAIL terms are closed". Read the 91-mutation walk critically and ran 13 independent spot mutations, all red on the intended assertion |
| ADVISORY | #26 storyboard lookup lacks an `assert.ok` guard (type error instead of named message on a renamed row); #25 is stricter than FR-3 *No stale names* (an on-demand owner row would need the pin relaxed); NFR-6 self-check regex catches only `join(…"specs"` |
| Decisions | Ceiling rung exercised for the first time (the rule T8 shipped in this spec): attempt 3 escalated the Implementer to `opus` `xhigh` and the Reviewer to `fable` |
| runtime events | none |
| spawns | attempt 3 Implementer `opus` not reported by host, ended complete; Reviewer `fable` not reported by host, ended complete |
| Running totals | tasks 13/21 · LOC (tests) +229 · review rounds 19/~38 |
| Approval | auto-approved (pre-approved mode) |
