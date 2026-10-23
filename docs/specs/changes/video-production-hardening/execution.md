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
