# Validation Report — Video Production Hardening

**Verdict: PASS with WARN on the reduced scope (T1–T14). Archive-ready, with conditions.** No FAIL, no BLOCKED. Every in-scope requirement clause is present in the shipped text (walked term by term against the delivered diff), `npm test` is 724/724, and all four verification commands are clean. The six WARNs are: the owner-approved deferral of T15–T21 (FR-11 code and docs, FR-18, FR-19), the contradiction it leaves inside the shipped package (MUST in `/akili-test` and the personas, "prefer" in the constitution and docs), the missing CHANGELOG entry (a release gate, not an archive gate), three FR-6 skill-side clauses that are implemented but unpinned by any test despite `test-report.md` saying otherwise, a `tester.md` edit that sits outside every persona fence so `doctor --agents --fix` can never deploy it, and two spec-document corrections (FR-13 wording, one figure label).

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/video-production-hardening` |
| Type / Deliverable | Change / software — no final look, no delivery render; `Delivery` ignored |
| Depth | Standard |
| Approval Mode | pre-approved (Juan Carlos Cadavid, 2026-10-23); the exceptions still stop |
| Scope validated | T1–T14 (PR 1 video skill + pins; PR 2 commands, personas, judgment-day, contracts), per the owner's scope cut of 2026-10-23 (`execution.md` → *Scope cut*) |
| Scope deferred | T15–T21, to a future spec. T15's unreviewed work is parked on local branch `deferred/T15-tester-derivation` (ada841b) — noted, not audited |
| Base / HEAD | b7bdb3b → 36c5925; delivered diff `git diff b7bdb3b HEAD -- . ':!docs/specs'` = 13 files, +723 −84 |
| Validator | Claude Code, `fable` (T3) — distinct from every author (Implementers `sonnet`/`opus`, Leader `opus`, Tester `haiku`) |
| Constitution read | root `CLAUDE.md` → `AGENTS.md`; `docs/prd.md`, `docs/ux-ui/design.md`, `docs/trd/trd.md`, `docs/specs/general-setup/`: n/a (absent in this repo) |
| Evidence reused | `test-report.md` §5 commands and §7 matrix (cross-checked, not re-derived); `execution.md` entries T1–T14 |
| Validator mutation walk | 15 single-site mutations on scratch copies (session scratchpad `mut/walk.json`): 8 red, 7 green (§6.2) |
| Date | 2026-10-23 |

## 2. Summary

| Area | Result | Note |
|---|---|---|
| Tasks | 14 PASS · 7 WARN (deferred) | Every `[x]` task has an `execution.md` entry with verification, falsifier, Reviewer verdict and a non-author re-run |
| Files | PASS (delivered) · WARN (deferred set absent, as recorded) | §4 |
| Build integrity | PASS | 724/724; `verify:cli`, `pack:dry-run`, `git diff --check b7bdb3b` all clean; `doctor --agents` classified in §10 |
| Requirements (FR-1–FR-19, NFR-1–6) | 20 PASS · 5 WARN · 0 FAIL · 0 BLOCKED | §6 |
| Design conformance | PASS with 2 spec-doc corrections owed | §8 |
| Test evidence | PASS, one false coverage claim corrected here | §9 |
| Findings | 8 WARN (W-1–W-8), 0 FAIL | §11 |
| Archive readiness | **Ready for the reduced scope**, conditions in §12 | |

**Why WARN and not FAIL for the deferred requirements.** FAIL means the implementation does not satisfy a requirement it claims to satisfy, or drifts without explanation. The cut is an owner decision quoted verbatim in `execution.md`, every deferred task is marked `[ ] Deferred` with its reason, `test-report.md` lists the gaps, and the procedure's own rule (Phase 6) grades an intentional, explained difference as WARN or FAIL *by risk*. The runtime rule that matters (`/akili-test` Tester model rule) is shipped and self-consistent, and the T15 code is parked, not lost. The residual risk is documentary (W-2) and release-procedural (W-3), both of which have a named owner and gate. Hence WARN with hard follow-up conditions, not FAIL.

## 3. Task Completion

| Task | Status | Attempts | Execution entry | Verification evidence | Result |
|---|---|---|---|---|---|
| T1 `SKILL.md` A | `[x]` | 1 | yes | greps 1–4 quoted, falsifier red, Reviewer PASS, re-run VERIFIED | PASS |
| T2 `SKILL.md` B | `[x]` | 1 | yes | greps, two falsifiers, byte measure 17,306 (re-measured here: 17,306) | PASS |
| T3 `render-evidence.md` | `[x]` | 1 | yes | gate greps at :27–28, falsifier red; P-24/P-29 settle clauses present | PASS |
| T4 `acceptance-criteria.md` | `[x]` | 1 | yes | four rows, falsifier red | PASS |
| T5 pins T1–T4 | `[x]` | 3 (ceiling rung fired) | yes, 3 entries | 16 → 33 tests; greenfield red observed (17 red at 34afbff); 91-mutation walk; `fable` Reviewer 13 spot mutations | PASS |
| T6 `akili-propose.md` | `[x]` | 1 | yes | five sites; falsifier prediction did not hold (recorded) | PASS |
| T7 `akili-specify.md` | `[x]` | 1 | yes | `$ARGUMENTS` 6 → 1; consumer suites green | PASS |
| T8 `akili-execute.md` | `[x]` | 1 | yes | sentence byte-identical at both sites; falsifier red | PASS |
| T9 `akili-test.md` | `[x]` | 1 | yes | `$ARGUMENTS` 6 → 1; preference sweep 0; `spawns:` 0 | PASS |
| T10 `akili-validate.md` | `[x]` | 1 | yes | `$ARGUMENTS` 11 lines → 1; falsifier red | PASS |
| T11 `leader.md` | `[x]` | 1 | yes | fences 10/10; doctor/digest suites 128/128 | PASS |
| T12 `tester.md` | `[x]` | 1 | yes | fences 10/10; same suites | PASS (see W-5) |
| T13 `judgment-day/SKILL.md` | `[x]` | 1 | yes | terminal line untouched; falsifier prediction did not hold (recorded) | PASS |
| T14 contracts T6–T13 | `[x]` | 3 (ceiling rung fired) | yes, 3 entries | 52 tests; greenfield red observed (48 red); 117-mutation walk; `fable` Reviewer 12 spot mutations | PASS |
| T15 routing derivation | `[ ]` Deferred | — | *Scope cut* row | parked ada841b, Reviewer stopped mid-audit, no verdict | WARN (W-1) |
| T16–T21 | `[ ]` Deferred | — | *Scope cut* rows | not started | WARN (W-1) |

The two falsifier predictions that did not hold (T6, T13) are recorded in their entries with Implementer and Reviewer concurrence; both verifications still caught the mutation. Not a defect in the diff; a kaizen item (already flagged there).

## 4. File Existence

Design §4 file tree against HEAD (`git diff --stat b7bdb3b HEAD`):

| Design §4 file | Expected | At HEAD | Result |
|---|---|---|---|
| `.claude/skills/video-production/SKILL.md`, `references/render-evidence.md`, `references/acceptance-criteria.md` | modified | modified (+47/−21 aggregate) | PASS |
| `.claude/commands/akili-{propose,specify,execute,test,validate}.md` | modified | modified | PASS |
| `.claude/templates/leader.md`, `tester.md` | modified | modified (3 lines, 1 line) | PASS |
| `.claude/skills/judgment-day/SKILL.md` | modified | +1 line | PASS |
| `test/video-production.test.js` (extend), `test/command-contracts.test.js` (new) | modified / new | +229 −6 / new 350 lines | PASS |
| `.claude/commands/akili-constitution.md` | modified (T16) | unchanged | WARN — deferred |
| `bin/routing.js`, `test/routing*.test.js` | modified (T15) | unchanged (`git diff --stat b7bdb3b HEAD -- bin/` empty) | WARN — deferred, parked on branch |
| `bin/akili.js`, `test/cli-version.test.js` | modified / new (T20) | unchanged / absent; `node bin/akili.js --version` → `Unknown option`, exit 1 | WARN — deferred |
| `docs/model-routing.md`, `docs/cli.md`, `README.md`, `docs/flow.md`, `docs/commands/*`, `docs/skills/*` | modified (T17–T19) | unchanged | WARN — deferred |
| `CHANGELOG.md` | modified (T21) | unchanged (`Unreleased` → "No unreleased changes yet.") | WARN (W-3) |
| `.claude/templates/model-routing.section.md` | **not** edited (design §9 Kept row, P-3) | unchanged | PASS |

## 5. Build Integrity

Run by the validator on a quiet tree (no agent active), 2026-10-23:

| Command | Result |
|---|---|
| `npm test` | `# tests 724 · # pass 724 · # fail 0 · # skipped 0` (27.0 s) |
| `npm run verify:cli` | `Summary: 12 commands \| 27 skills \| 8 resources (akili-specs v2.35.0)` |
| `npm run pack:dry-run` | `akili-specs-2.35.0.tgz`, total files 310 |
| `git diff --check b7bdb3b` | exit 0, no output (the T15 patch-file hits `test-report.md` records are gone) |
| `git diff --check` (working tree) | exit 0; `git status --porcelain` empty |
| `node bin/akili.js doctor --agents` | `leader`: `primary-instructions` OUTDATED (matched 2.34.1), `test-harness` OUTDATED (matched 2.30.0), others CURRENT; `implementer`, `reviewer`, `tester` all CURRENT; exit non-zero ("Persona drift found") — classified in §10 |

Result: **PASS.** NFR-4 holds. No environment boot contract exists (`docs/infrastructure.md` absent) and none is warranted for a rules-text spec; recorded as n/a, not a gap.

## 6. Requirement Coverage

### 6.1 Per requirement, at clause granularity

Evidence columns: *Text* = the clause located by the validator in the delivered diff; *Pin* = the automated test that goes red when the clause is removed (from `test-report.md` §7, cross-checked against the test files and the validator walk in §6.2).

| Req | Scenario / clause | Owner task | Text | Pin | Result |
|---|---|---|---|---|---|
| FR-1 | *Default snapshot* THEN flag on every line · BUT no omission · AND IT MUST consent line + #6138 + `GEMINI_API_KEY` | T2, T3 | `SKILL.md` commands rows, phase-map review row, `render-evidence.md` item 2; Privacy 2 | `video-production` FR-1 ×2 | PASS |
| FR-1 | *Consent per use* THEN · BUT no carry-over | T2 | Privacy 2 "consent for one snapshot does not cover the next" | FR-1 Consent per use | PASS |
| FR-2 | *Output flag* THEN (+ per-run subfolder, reason) · BUT no default | T2, T3 | commands rows, item 2/3, Evidence files 1 | FR-2 Output flag | PASS |
| FR-2 | *Sanitize* THEN placeholders · AND IT MUST two greps · BUT before commit | T3 | Evidence files 4 + bash block; Privacy 3 | FR-2 Sanitize | PASS |
| FR-2 | *Logs `.txt`* THEN · BUT no `.gitignore` | T3 | Evidence files 2 | FR-2 Logs | PASS |
| FR-2 | *Skill refresh* THEN five commands + reason · BUT never `skills update`/bare `skills` · AND telemetry everywhere incl. `skills` | T2 | Privacy 1 | FR-2 Skill refresh | PASS |
| FR-3 | *Route per host* THEN ids · AND project-scoped · BUT no `-g` | T1 | route row + host table | FR-3 Route per host; V6 red | PASS |
| FR-3 | *Lock mismatch* THEN both lists · AND IT MUST still pass + record · BUT not silent | T1 | Router-found row ends `. Continue` | FR-3 Lock mismatch | PASS |
| FR-3 | *No stale names* THEN · BUT · AND captions → router | T1 | deferral table | FR-3 No stale names (stricter than the "on demand" allowance — advisory) | PASS |
| FR-4 | *Film artifacts* THEN owner + storage ×3 · BUT no second approval | T2 | phase-map rows | FR-4 Film artifacts | PASS |
| FR-4 | *Music bed* THEN | T4 | row 8 | FR-4 Music bed | PASS |
| FR-5 | *Bundled is not local* THEN · AND #6137 note · BUT no warm cache | T2, T3 | Fonts row; item 7 | FR-5 Bundled; V7 red | PASS |
| FR-5 | *Brand source* THEN files + location | T4 | row 9 | FR-5 Brand source | PASS |
| FR-6 | *Deferred* THEN skip + record string · AND IT MUST final look · BUT never reported done — **validate side** | T10 | Phase 6 paragraph | contracts FR-6 Deferred | PASS |
| FR-6 | *Deferred* — **skill side**: `render-evidence.md` final-look step 4; `SKILL.md` commands delivery row, phase-map Final look row, Draft-vs-delivery row | T3, T2 | present (all four sites, read in the diff) | **none** — V1, V2, V3 stayed green; `tasks.md` coverage row names "(T14)", which reads no skill file; `test-report.md` §7 says "skill side also in `video-production.test.js`" — no such test exists | **WARN (W-4)** |
| FR-6 | *Default* THEN render after final look; unknown value → `render` + reported | T10 | Phase 6 paragraph | contracts FR-6 Default; C6 red | PASS |
| FR-6 | *Recorded downstream* THEN propose item 1 → specify Video Mode copy | T6, T7 | both sites | contracts ×2 (checklist restatement unpinned, C7 — advisory) | PASS |
| FR-7 | *Outline replaces the delta* THEN three parts with their columns · BUT no delta · AND Bug track unchanged | T6 | Outline block, item 9 | contracts FR-7 ×4 | PASS |
| FR-7 | *Specify converts it* THEN 6/beat table, 9/evidence plan, 1–4 + 10 + `Delivery` | T7 | Video Mode bullet + Step 1.2 | contracts FR-7 Specify converts | PASS |
| FR-8 | THEN three sections with contents · BUT no n/a · AND mixed keep | T9 | Phase 4 paragraph | contracts FR-8 (trigger "with no software suite" unpinned, C8 — advisory) | PASS |
| FR-9 | THEN marked + task named + `Red run`/Done · AND IT MUST observed & quoted, differing red recorded · BUT never existing targets | T7 | Step 3.2 field, item 8, checklist | contracts FR-9 ×4 | PASS |
| FR-9 | (exercised live) | T5, T14 | greenfield reds observed and quoted in both entries | — | PASS |
| FR-10 | *Daemon* THEN wait/stop + record which · BUT not beside it | T2 | Quiet tree row | FR-10 Daemon; V5, V8 red | PASS |
| FR-10 | *One render* THEN | T2 | Environment row | FR-10 One render | PASS |
| FR-10 | statement: dedicated worktree (Orca, else `git worktree`) | T2 | Environment row | **unpinned** (V4 green) — advisory, text verified | PASS |
| FR-11 | *Wrapper derivation* THEN · AND report line · BUT any host/mode | T15 | not shipped (`bin/routing.js` = b7bdb3b; `:849` still prints "Rule 1 allows it") | — | **WARN (W-1)** deferred |
| FR-11 | *No distinct model on a host* THEN · AND others unaffected | T15 | not shipped | — | **WARN (W-1)** deferred |
| FR-11 | *Runtime spawn* THEN sources + none of them + cross-host · AND IT MUST stop as exception · BUT no inline when Leader authored | T9 | Tester model rule 1–4, Run-inline row | contracts FR-11 ×3; C4 red | PASS |
| FR-11 | *Rule text* THEN MUST in `akili-test.md` (:15, :54, :86), `leader.md` :333, `tester.md` :7 | T9, T11, T12 | all five sites | contracts FR-11 rule text ×3 | PASS |
| FR-11 | *Rule text* BUT none still "preference" — constitution, `docs/model-routing.md`, `docs/cli.md`, `README.md`, `docs/flow.md`, `docs/commands/akili-test.md` | T16–T19 | **still "prefer"/"ideally"/"not a hard rule"** (§8.4) | — | **WARN (W-1, W-2)** deferred |
| FR-12 | *Owner mandate* THEN stop · AND quotes the sentence · BUT never `auto-approved` | T6, T8 | identical sentence at three sites; "never logged `auto-approved`" at both execute sites | contracts FR-12 ×3; C5 red | PASS |
| FR-12 | *Video gate multiplier* THEN 2–3× + factor recorded · BUT not software | T7 | Step 2.4 paragraph | contracts FR-12 multiplier | PASS |
| FR-13 | *Ceiling with distinct Reviewer* THEN T3 `xhigh` + Reviewer moved + recorded · BUT no `max` on T2 | T8, T11 | Effort Ceiling bullet; pseudo-code comment; leader :27 | contracts FR-13 ×3 | PASS — but see W-6 (requirement wording vs design) |
| FR-13 | *No distinct Reviewer* THEN hold `xhigh`, fresh spawn, `held xhigh` · BUT not shared · AND ceiling 3 | T8 | same bullet | contracts FR-13 hold | PASS |
| FR-13 | (exercised live) | T5, T14 | rung fired on both: Implementer → `opus` `xhigh`, Reviewer → `fable`; attempts stayed 3 | — | PASS |
| FR-14 | THEN stills before/after + final look; `check --at-transitions` not motion | T4 | Motion defect row | FR-14 Motion | PASS |
| FR-15 | THEN first-token sentence in four Arguments sections, once · BUT never in a path | T7–T10 | `$ARGUMENTS` 1 line each (validator grep); sentence byte-identical | contracts FR-15 ×16; C1 red | PASS |
| FR-16 | *Literal path* THEN mandated path wins + DC record | T6 | path rules bullet | contracts FR-16 | PASS |
| FR-16 | *Source supplied* THEN skip + log · BUT not gated / not silent | T6 | Step 1.1 paragraph | contracts FR-16 ×2 | PASS |
| FR-17 | THEN `fixed, not re-judged` + IDs, AKILI layer · BUT never `APPROVED`; skill terminal set unchanged | T7, T13 | specify Approval Mode + Step 2.5; judgment-day bullet; Hard Rules `approved \| escalated` count 1 (unchanged) | contracts FR-17 ×3 ("terminal set unchanged" unpinned, C2 — advisory) | PASS |
| FR-18 | `--version`/`-v` THEN exact version, exit 0 · BUT no `Unknown option` | T20 | not shipped (validator run: exit 1, `Unknown option '--version'`) | — | **WARN (W-1)** deferred |
| FR-19 | CHANGELOG note · docs `--version` + Tester rule · issue cites #6136–#6139 · tests · *Summary surfaces* | T21, T18–T20, T1–T2, T5/T14 | cites present (#6136, #6139 precedence sentence; #6137 Fonts + item 7; #6138 consent); tests delivered; CHANGELOG, docs, closing sweep **absent** | cites pinned | **WARN (W-1, W-3)** partial |
| NFR-1 | software specs see no change | T5, T14 | `Deliverable: video` gates: specify 7 (≥5), test 4 (≥3), validate 4 (≥4) | `video-production` NFR-1 pin | PASS |
| NFR-2 | 3 files, ≤ 20,000 bytes | T2, T5 | validator re-measure: 3 files, 17,306 bytes | NFR-2 pin | PASS |
| NFR-3 | no HyperFrames text copied; cite by issue | T1, T2 | citations by issue number and by reference *name*; no restated internals found in the diff | review only (accepted gate) | PASS |
| NFR-4 | four commands green | T21 (deferred) | §5, run by the validator | — | PASS |
| NFR-5 | tool-agnostic wording | all | host values confined to the host table and the Tester rule's parenthetical example | review only | PASS |
| NFR-6 | no test reads `docs/specs/changes` | T5, T14 | `grep -rn "docs/specs/changes" test/` → 0 | self-checks | PASS |

**Tally over the 25 requirements (FR-1–FR-19, NFR-1–6): PASS 20 · WARN 5 (FR-6, FR-11, FR-13, FR-18, FR-19) · FAIL 0 · BLOCKED 0.** A requirement with several clause rows counts once, at its worst row. The persona-fence finding (W-5) is graded at the design-conformance level (§8.2), not against a requirement: FR-11 *Rule text* asks for the template text, which is correct.

### 6.2 Validator mutation walk (Phase 4 item 5 / Phase 7 spot-check)

Fifteen mutations, each a single replacement that had to hit exactly once on a fresh scratch copy of `.claude/commands`, `.claude/templates`, `.claude/skills/judgment-day`, `.claude/skills/video-production` and `docs/skills/governance.md`, run through the suite's own root-override hook. Baseline on the untouched copy: `video-production` 33/0, `command-contracts` 52/0. Clauses were chosen where the authors' walks (built from scenario THEN/BUT/AND terms) were least likely to reach: requirement *statement* terms, skill-side mirrors of command clauses, restatements, and trigger conditions.

| # | Clause | Mutation | Expected | Observed |
|---|---|---|---|---|
| V1 | FR-6 skill side — `render-evidence.md` final-look step 4 | drop ", unless `Delivery: deferred` … stop after the approval" | gap | **green (unpinned)** |
| V2 | FR-6 skill side — commands delivery row | drop "; not run when `Delivery: deferred`" | gap | **green (unpinned)** |
| V3 | FR-6 skill side — phase-map Final look row | drop the deferral clause | gap | **green (unpinned)** |
| V4 | FR-10 statement — dedicated worktree | drop the worktree clause from the Environment row | gap | **green (unpinned)** |
| V5 | FR-10 Daemon THEN (control) | "also breaks" → "does not break" | red | red ×1 (FR-10 Daemon) |
| V6 | FR-3 AND project-scoped (control) | drop "(project-scoped)" | red | red ×2 |
| V7 | FR-5 BUT warm cache (control) | drop "a warm-cache `check` is not evidence" | red | red ×1 |
| V8 | FR-10 Daemon "record which" | drop "and record which in `execution.md`" | red | red ×1 |
| C1 | FR-15 THEN "the brief appears once" | add a second `$ARGUMENTS` in prose outside any path | red | red ×1 (occurrences 2) |
| C2 | FR-17 terminal set unchanged | Hard Rules `approved \| escalated` → `… \| fixed` | gap | **green (unpinned)**; nothing in `test/` pins the line |
| C3 | FR-13 design floor detail (Claude Code `sonnet` excluded) | drop the sentence | gap (design detail, not a requirement clause) | green (unpinned) |
| C4 | FR-11 Runtime spawn cross-host (control) | "use … cross-host dispatch" → "skip …" | red | red ×1 |
| C5 | FR-12 BUT never `auto-approved` (control) | drop the sentence at the tripwire site | red | red ×1 |
| C6 | FR-6 Default — propose default `render` (control) | `render` → `deferred` | red | red ×1 |
| C7 | FR-6 Recorded — specify checklist restatement | drop "a proposal `Delivery` row is copied beside it" | gap (restatement) | green (unpinned) |
| C8 | FR-8 trigger "with no software suite" | drop the condition | gap | green (unpinned) |

Reading: every control went red on its own assertion, so the suites are not inert. The seven greens split into one coverage gap that matters (V1–V3: a whole scenario's skill-side mirror with a false evidence claim → W-4) and four advisory gaps (V4, C2, C7, C8) where the text is present and verified by read.

## 7. Linting & Code Quality

No linter is configured for Markdown in this repo; the text contracts are the lint. The two test files follow the existing `video-production.test.js` idiom (locate the row/section first, assert inside it), carry the `@akili-spec` header, and use root-override hooks for falsifiers.

### 7.1 4R sweep — advisory (not spec violations, no grade)

| Lens | Finding |
|---|---|
| Readability | The *Effort Ceiling* bullet in `akili-execute.md` 2.4 is a single ~190-word bullet carrying the trigger, the escalate branch, the per-spawn mechanism, the floor and the hold branch. A reader at attempt 3 has to parse all of it; a two-item sub-list (escalate / hold) would read faster. Content is complete and matches design §8.4. |
| Reliability | `tester.md` :7 is outside every `akili:section` fence, so the persona-drift tooling has no digest for it (→ W-5, graded). |
| Resilience | `/akili-test` Tester rule step 2 ("another model the host offers") has no stated behavior on Antigravity when the session is on Argon and `flash`/`pro` are both Implementer candidates; the rule's step 3/4 chain still terminates (cross-host, then stop), so this is a wording gap, not a hole. |
| Risk | Until T15 lands, `akili routing` still writes a Tester wrapper bound to the Implementer's model and prints "Rule 1 allows it"; `/akili-test` step 1 then refuses that wrapper per spawn, so the wrapper is dead weight on Claude Code, OpenCode and Codex. Coherent at runtime, confusing on disk (→ W-2 family). |
| Risk | `command-contracts.test.js` `section()` takes the first heading that *starts with* the prefix (`#### 2.4` would also match a future `#### 2.4a`) and the pseudo-code locator keys on a 4-space indent; both were recorded by the T14 Reviewer. Fragile toward false reds, not toward false greens. |

### 7.2 ADVISORY findings carried forward from `execution.md` (unresolved)

| Source | Advisory |
|---|---|
| T6 A1 | Path-rules example `docs/specs/<slug>/` is a full path while `$SPEC_PATH` is relative to `docs/specs/`; FR-16 uses the same example — follow-up wording candidate |
| T6 A2 | Trivial track with `Deliverable: video`: whether its section 9 is the Outline is unstated (FR-7 scopes the Outline to the Change track) |
| T2 | `story.md` phase-map row implies rather than states where it is stored; commands-table rows omit the env prefixes Privacy 1 mandates (prior style) |
| T7 | Step 3.2 field wording ("Done criteria carry the obligation") vs item 8 ("`Red run` field and Done criteria") could match; the Outline mapping is written twice (Video Mode, Step 1.2) and may drift |
| T5 (a1–a3) | NFR-6 self-check regex catches only a `join(…"specs"` shape; `cells()` duplicates the host-row split; #26 storyboard lookup lacks an `assert.ok` guard (TypeError instead of a named message); #25 is stricter than FR-3 *No stale names* (an "installed on demand" owner row would need the pin relaxed) |
| T14 (a1–a3) | `section()` fence detection at column 0 only; `line()` anchors on the first match in the file; nothing pins "`Delivery` on a software spec is ignored"; pseudo-code locator keys on a 4-space indent; R1–R4 pin FR-11 *Rule text* assigned to T11–T13 (tests of shipped text, recorded as T14 extras); the FR-13 requirement/design wording gap (adjudicated as W-6) |
| T15 (deferred) | Open questions for the future spec: whether the belt-and-braces token needs a permanent test (no derivation path reaches it); the falsifier did not go red on the OpenCode user roster as the task predicted |
| Scope cut | Owner-reported friction: `run.sh` records a Claude session-limit exit (status 0) as a passed phase — for `/akili-archive`'s Kaizen step |

## 8. Design Conformance

### 8.1 Adjudications requested by the Leader

| # | Item | Finding | Result |
|---|---|---|---|
| 1 | FR-13 names "registry T3 fallback or cross-host dispatch" as the distinct-Reviewer sources; design §8.4 *Ceiling rung* and the shipped `akili-execute.md` name "the registry's frontier escalation pin when the host has one, or cross-host dispatch" and exclude Claude Code's T3 fallback `sonnet` | **Recorded design refinement, not unrecorded drift** — `judgment.md` §3 row A J-12 / B J-17 ("Claude Code T3 fallback `sonnet` falls below the author … Info. Adopted") and design §8.4 item 1 state the floor explicitly; DD-8 adopts it. What is stale is `requirements.md` FR-13 scenario 1's WHEN parenthetical: the round-1 amendments (design DC) touched FR-2, FR-3, FR-9, FR-11, FR-17 and §4, not FR-13. The shipped rule is *stricter* than the requirement (it adds a strength floor), so no behavior is lost | **WARN (W-6)** — correction closure owed in `requirements.md` |
| 2 | Execute-time edit to design §6 / §7.1 Cursor rows | True at HEAD: `test/routing.test.js:214` asserts `authorAuditor === "unsatisfiable"` for `cursor` on the packaged roster, and `buildPlan`'s unsatisfiable path `continue`s before any Tester report (design §6 last row). Validator sweep `T2 resolves to\|Implementer unwritten\|Cursor.*(Tester\|packaged)` over the spec folder (excluding `execution.md`): only the two amended rows (`design.md:86`, `:114`) and §7.1 step 1 (`:99`, still true). No requirement meaning changed | **PASS** |
| 3 | Cross-document figure check (T6/T13 predictions; T14 `$ARGUMENTS` 11 vs 12) | Validator count at 34afbff for `akili-validate.md`: **11 lines, 12 occurrences** (line 66 carries two). `tasks.md` T10 *Red run* "`grep -c` → 11" is a line count and correct; `tasks.md` T14 *Red run* "6/5/6/11 `$ARGUMENTS` occurrences" and design P-15 "validate 11 (`:30,…,175`)" label a line list as occurrences; `execution.md` T14 records both figures correctly. All other figures agree: tests 655 → 724 (+17 +52), T5 16 → 33, T14 350 lines, bytes 17,306 (≤ 20,000; design estimate 17,150), design §12 13 + 8 = 21 tasks, rounds 21/~38 at the cut. T6/T13 predictions are recorded as not holding, with the verification that did catch the mutation named | **WARN (W-7)**, minor — one-word label fix |
| 4 | Shipped-docs inconsistency created by the cut | Validator grep at HEAD: MUST in `akili-test.md` (:15, :57–63, :81), `leader.md:333`, `tester.md:7`; "prefer"/"ideally"/"not a hard rule" survive in `akili-constitution.md:577–578` (design Kept row — intentional), `:831`, `:1021–1022`; `docs/model-routing.md:72, 87, 189, 252, 795`; `docs/cli.md:504`; `README.md:898`; `docs/flow.md:379, 394`; `docs/commands/akili-test.md:23, 32`; and `bin/routing.js:849` still prints "Rule 1 allows it". The constitution hits are a *command* in the same package as the personas it scaffolds, so an agent running `/akili-constitution` is told the opposite of what `/akili-test` enforces. The runtime rule governs (the Tester is chosen per spawn by `/akili-test`), and the deferral is owner-approved and recorded in `execution.md` and `test-report.md` §9 | **WARN (W-2)** — must be closed (follow-up spec) before a release ships this scope; archive may proceed |
| 5 | No CHANGELOG entry | `CHANGELOG.md` `Unreleased` reads "No unreleased changes yet." AGENTS.md *Release Rules*: notes are required *before release preparation*, not before archive. `execution.md` already records the debt | **WARN (W-3)** — release gate |
| 6 | ADVISORY carry-forward | §7.2 | done |
| 7 | Scenario- and clause-level coverage with ≥ 8 validator mutations | §6.1, §6.2 (15 mutations) | done; one coverage gap found (W-4) |

### 8.2 Design sections vs shipped text

| Design section | Shipped | Result |
|---|---|---|
| §5 Document Control rows (`Delivery` default `render`, unknown → `render` + reported, software ignored) | `akili-validate.md` Phase 6; `akili-propose.md` item 1; `akili-specify.md` Video Mode | PASS |
| §8.1 skill rows (gate, route, host table, commands, privacy 1–3, phase map, render rules, deferral table, precedence) | all rows present; issue cites in bare `#n` form (C-7) | PASS |
| §8.2 `render-evidence.md` (items 2, 3, 7; *Evidence files* 1–4; step 4) | present; P-24 and P-29 settle-at-first-use clauses present | PASS |
| §8.3 `acceptance-criteria.md` rows 8–10, Motion row "an AKILI gate rule, not a tool fact" | present | PASS |
| §8.4 commands (a)–(f) incl. identical first-token sentence and owner-mandate sentence | present; sentences byte-identical (contracts pin them) | PASS |
| §8.4 *Ceiling rung* | shipped verbatim in substance; see W-6 for the requirement text | PASS |
| §8.5 personas | `leader.md` :27, :35, :333 and `tester.md` :7 as specified. §8.5 *Persona churn* claims "Deployed `.agents/` copies read `outdated` … until `--fix`": true for `leader.md` (two sections OUTDATED), **false for `tester.md`** — its edit is outside every fence, so `doctor` reads deployed copies CURRENT and `--fix` cannot carry it | **WARN (W-5)** |
| §8.5 judgment-day bullet | present; Hard Rules untouched | PASS |
| §9 Kept row (`model-routing.section.md` untouched) | `git diff --stat` empty | PASS |
| DD-6 cap kept at 20,000 | 17,306 measured | PASS |
| DD-7 bare issue numbers | #6136–#6139 all bare | PASS |
| §13 PR strategy | PR 1 and PR 2 delivered; PR 3 deferred | WARN (W-1) |
| Proposal §12 success criteria | friction → S-items mapping holds; `npm test` green with new tests for S16 (S11, S17 deferred); "routing never writes Tester = Implementer" and "`--version` prints 2.35.0" **not met** (deferred) | WARN (W-1) |

Correction closure: this validation changes no spec document (the validator's only write is this report); the corrections owed are listed in §11 with their sweeps.

## 9. Test Evidence Summary

| Item | From `test-report.md` | Validator cross-check |
|---|---|---|
| Suites / Tester | 1 suite, Tester `haiku`, inline not used (Leader `opus` had authored escalations) | consistent with the shipped Tester model rule; the test run itself exercised FR-11 *Runtime spawn* |
| Full suite | 724/724 | re-run: 724/724 |
| Author suites | 33 + 52 tests; 91 + 117 mutation walks; `fable` Reviewer 13 + 12 spot mutations | file counts confirmed (33, 52); walk files not re-read (scratchpad of the execute session); validator walk §6.2 adds 15 |
| `PRODUCT_BUG` | none | none |
| Matrix row FR-6 | "skill side also in `video-production.test.js`" | **false** — no FR-6 test exists in that file; V1–V3 green (W-4). The rest of the matrix cross-checks against the test files |
| Matrix rows FR-11/FR-18/FR-19 | NOT TESTED / PARTIAL, deferred | agrees |
| Accepted gaps §9 | FR-11 (parts), FR-18, FR-19 (parts), NFR-3/NFR-5 review-only | agrees; add W-4 and the four advisory gaps |

Carry-through per the procedure: no `PRODUCT_BUG`, no `FAIL`, no flaky entry; the `NOT TESTED` rows are deferred requirements with a recorded owner → WARN, not FAIL.

## 10. Agent Guide / Constitution Impact

| Check | Result |
|---|---|
| `## Constitution Impact` notes in `execution.md` | none (0 occurrences) — no module created or reshaped; n/a |
| Child `CLAUDE.md`/`AGENTS.md`, `## Module Guides` | none exist; n/a |
| `akili doctor --agents` on this repo's deployed `.agents/` | `leader.md` OUTDATED on `primary-instructions` (2.34.1) and `test-harness` (2.30.0): **expected** — T11 edited both sections, the deployed copy predates them (design §8.5), `--fix` will upgrade at the next release's digests. `tester.md` CURRENT: **not expected by the design** — `.agents/tester.md:7` here still reads "prefer running on a **different model than the Implementer**" while the template says MUST, and the tooling cannot see it (W-5) |
| CodeGraph | `.codegraph/` present; re-index is `/akili-archive`'s step |

## 11. Remediation

| ID | Level | Finding | Fix | Owner / gate |
|---|---|---|---|---|
| W-1 | WARN | T15–T21 deferred: FR-11 *Wrapper derivation* and *No distinct model on a host*, FR-11 *Rule text* outside `akili-test.md` and the two personas, FR-18, FR-19 (CHANGELOG, docs mirrors, closing sweep). T15 parked unreviewed at ada841b | Open the follow-up spec at archive (`/akili-propose`), seeded from `execution.md` *Scope cut* and the T15 open questions; T15's parked branch is its starting point, re-reviewed from scratch (author ≠ auditor) | owner; before the next video run or release |
| W-2 | WARN | Shipped package contradicts itself on the Tester model: MUST (`akili-test.md`, `leader.md`, `tester.md`) vs prefer (`akili-constitution.md:831, 1021–1022`; `docs/model-routing.md`; `docs/cli.md:504`; `README.md:898`; `docs/flow.md:379, 394`; `docs/commands/akili-test.md:23, 32`); `bin/routing.js:849` still prints "Rule 1 allows it" | Land T16–T19 (design §9 rows) in the follow-up; until then the CHANGELOG entry (W-3) must state that `/akili-test` governs and the docs lag | follow-up spec; **before any release** that ships this scope |
| W-3 | WARN | `CHANGELOG.md` `Unreleased` has no entry for T1–T14 | Write the entry per T21's list minus the deferred items, quote-checked at HEAD (KZ-002); state the persona `--fix` note and the W-5 manual re-copy for `tester.md` | **release gate** (AGENTS.md *Release Rules*); not an archive gate |
| W-4 | WARN | FR-6 skill-side clauses (`render-evidence.md` step 4; `SKILL.md` commands delivery row, phase-map Final look row, Draft-vs-delivery row) have no pin; `tasks.md` coverage row names "(T14)" as pinner and `test-report.md` §7 claims a `video-production.test.js` pin that does not exist | Add three assertions to `test/video-production.test.js` (step 4 "unless `Delivery: deferred`", the commands row "not run when", the phase-map row) — ~15 LOC, fits `/akili-quick`'s gate as a test-only addition or rides the follow-up spec; correct the `tasks.md` FR-6 *Deferred* owner cell and the `test-report.md` FR-6 note at archive | follow-up or `/akili-quick`; spec-doc corrections at archive |
| W-5 | WARN | `tester.md:7` edit is outside every `akili:section` fence: `doctor --agents` reads deployed copies CURRENT, `--fix` never upgrades them (this repo's `.agents/tester.md` still says "prefer"); design §8.5 claims otherwise | Either move the tier note into a fenced section (digest change; release tooling) or document a manual re-copy in CHANGELOG/`docs/cli.md` *Persona Drift*; re-copy `.agents/tester.md` here. Decide in the follow-up spec | follow-up spec; CHANGELOG note at W-3 |
| W-6 | WARN | `requirements.md` FR-13 scenario 1 WHEN still reads "(registry T3 fallback or cross-host dispatch)"; the adopted design (judgment A J-12/B J-17, §8.4, DD-8) and the shipped text require a Reviewer at least as strong — "the registry's frontier escalation pin when the host has one, or cross-host dispatch" — and exclude Claude Code's T3 fallback `sonnet` | Amend the parenthetical to the design wording; correction closure: forward grep `T3 fallback` across the spec folder (hits: `requirements.md:315`, `design.md:100` (§7.1, a different list — leave), `design.md:214` (already correct)), backward grep for citations of FR-13 scenario 1 (`tasks.md` T8/T14 coverage rows cite the scenario by name only) | archive (spec-doc correction) |
| W-7 | WARN | `tasks.md` T14 *Red run* "6/5/6/11 `$ARGUMENTS` occurrences" and design P-15 "validate 11" label a line list as occurrences; actual: 11 lines, 12 occurrences (`execution.md` has both) | Change "occurrences" → "lines" at both sites, or write "11 lines / 12 occurrences" | archive (spec-doc correction) |
| W-8 | WARN | Docs mirrors of the delivered commands and skill are stale (`docs/skills/video-production.md:29` 10-skill route without `--agent`; `docs/commands/akili-validate.md:63` no deferral; `docs/commands/*` no first-token rule; `docs/skills/judgment-day.md` no annotation) — T18 deferred | Part of W-1; listed separately because these pages describe *delivered* behavior wrongly, not deferred behavior | follow-up spec (T18) |

Advisory (no grade, recorded for the follow-up): V4 (FR-10 worktree term unpinned), C2 (judgment-day terminal set unpinned anywhere in `test/`), C7, C8; §7.1 and §7.2 items.

## 12. Archive Readiness Recommendation

**Recommendation: archive the reduced scope (T1–T14) now.**

| Readiness criterion | State |
|---|---|
| All required tasks `[x]` | T1–T14 yes; T15–T21 `[ ] Deferred` by owner decision, recorded with reasons |
| No FAIL unresolved | 0 FAIL |
| WARN accepted or with follow-up | W-1, W-2, W-5, W-8 → follow-up spec (to be opened at archive); W-3 → release gate; W-4, W-6, W-7 → spec-doc corrections at archive plus a test-only addition |
| Tests cover key requirements | 724/724; every delivered scenario pinned except the FR-6 skill-side mirror (W-4), whose text is verified here |
| Drift reflected in docs/notes | execute-time edit recorded with its sweep; scope cut recorded verbatim; the requirement/design wording gap is now recorded here (W-6) |
| User reviewed the summary | pending the owner's read of this report |

Conditions that travel with the archive, in order:

1. At `/akili-archive`: apply W-6 and W-7 to the spec documents with their sweeps, correct the FR-6 owner cell (W-4), and let the Kaizen step carry the `run.sh` friction, the two unheld falsifier predictions, and the coverage-table orphan pattern (an ID-keyed row pointing at a test file that cannot read the artifact).
2. Open the follow-up spec for T15–T21 (W-1, W-2, W-5, W-8) before the next `Deliverable: video` run.
3. **No release** from this branch until the CHANGELOG entry exists (W-3) and W-2 is closed or explicitly noted in that entry.

```text
/akili-archive changes/video-production-hardening
```
