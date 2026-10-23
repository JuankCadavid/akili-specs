# Tasks: Video Production Hardening

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/video-production-hardening` |
| Depth | Standard |
| Type / Deliverable | Change / software |
| Approval Mode | pre-approved (Juan Carlos Cadavid, 2026-10-23); the exceptions still stop |
| Tasks | 21 · est. ~1,250 LOC · ~38 review rounds (design §12, the budget tripwire) · 3 PRs (design §13) |
| Commit prefix | `[SPEC:changes/video-production-hardening]` |
| Task map | design §15 (binding) |
| Baselines | Every *Red run* below was observed at 34afbff. That commit differs from 8679e25 only under `docs/specs/`, so the readings are the shipped files' state |
| Phase 3 gate | auto-approved (pre-approved mode), 2026-10-23 |

### Order

1. **PR 1:** T1 → T2 run sequentially (same file). T3 ∥ T4 run beside them (different files). T5 runs after T1–T4.
2. **PR 2:** T6 ∥ T7 ∥ T8 ∥ T9 ∥ T10 ∥ T11 ∥ T12 ∥ T13, one file each. T14 runs after T6–T13.
3. **PR 3:** T15 → T16 → T17 → T18 → T19 → T20 → T21.
   - T16–T19 restate the derivation T15 ships, so they run after it.
   - T20 runs after T19, because both edit `docs/cli.md` and `README.md`.

The parallel width cap is 2–4 (`akili-execute.md` Step 1).

### Shared conventions

**Quiet-tree rule:** no `npm test` or `npm run …` while a delegated agent is active (AGENTS.md *Concurrency*). Scoped suites run after the task's own Implementer returns. The full suite runs at T21.

**Falsifier convention:**
- A falsifier is a mutation executed **against the post-change text or code** in the task's Done step, with the observed output quoted in `execution.md`. No result below is stated in advance.
- A baseline reading of `0` for a clause that does not exist yet is a **precondition**. It is not a red run.
- New test files are greenfield artifacts. Their *Red run* field reads `predicted — greenfield artifact (observed in <task>)`, and the task observes and quotes the red. This is the FR-9 shape this spec ships; until T7 lands it, the convention is recorded here.

**Shared pre-review sweep (every rules-text task):**
- Run the obligation's phrase-family grep over every in-scope file and read every hit before the Reviewer (KZ-changes--kaizen-loop-closure-2).
- Quote-check every summary clause at HEAD (KZ-002).

**No spec-path reads in tests:** no test reads `docs/specs/changes/...` (KZ-changes--archify-diagrams-1).

---

### T1 — `SKILL.md` part A: gate, install route, host table, deferral table

- **Status:** [x] · **Size:** S · **Depends on:** none
- **Requirements:** FR-3 (all three scenarios, every THEN/BUT/AND); FR-19 (cite #6136, #6139); NFR-2, NFR-3, NFR-5
- **Design:** §8.1 rows *Step 0 gate*, *Install route*, *Host table*, *Deferral table*; DD-7; P-4, P-5, P-19, P-27
- **Scope:** `.claude/skills/video-production/SKILL.md`, about 6 sites:
  - Step 0: the lock-file check in the router-found row.
  - Install route: the 4-skill core set plus `--agent <id>`. It keeps `--yes`, `--skill hyperframes `, "project-scoped", and no `-g`.
  - Host table: one row per host with its agent id and directory.
  - Deferral table: re-pointed rows, captions → router.
  - Precedence sentence: #6136 and #6139 in bare `#n` form.
- **Tests / Verification:**
  1. `grep -n -- "--agent" SKILL.md` names the five ids.
  2. `grep -c -E "hyperframes-(core|animation|creative)|embedded-captions" SKILL.md` → 0.
  3. `grep -c -E "heygen-com" SKILL.md` stays confined to the install-route and Attribution lines.
  4. Byte measure together with T2: `find .claude/skills/video-production -type f -exec cat {} + | wc -c`.
- **Falsifier:** post-change, re-add `--skill hyperframes-core` to the route → check (2) reads 1. Observe, quote, revert.
- **Red run:** at 34afbff, `grep -c -- "--agent" SKILL.md` → 0. `grep -c "hyperframes-core" SKILL.md` → 2. `grep -c embedded-captions SKILL.md` → 1.
- **Disqualifier:** an agent id taken from memory rather than `npx skills@1.7.4 add --help` / P-4. A byte count from `du`.
- **Consumers:** `test/video-production.test.js:128-143` (HeyGen placement), `:190-200` (gate), `:202-214` (route), `:235-241` (host rows, updated in T5); `docs/skills/video-production.md:29` (T18).
- **Review:** `full` — install route and gate are the skill's entry point.
- **Done:**
  - Checks and falsifier quoted.
  - The FR-3 lock-mismatch rule states both lists, the warning, and the `execution.md` record.
- **Skills:** `video-production`, `cognitive-doc-design`

### T2 — `SKILL.md` part B: commands, privacy, phase map, render rules

- **Status:** [x] · **Size:** M · **Depends on:** T1 (same file)
- **Requirements:**
  - FR-1: both scenarios; consent-line MUST; per-use consent.
  - FR-2: output flag and per-run subfolder; *Skill refresh* scenario THEN/BUT/AND.
  - FR-4: film-artifacts scenario plus its BUT.
  - FR-5: *Bundled is not local* THEN and note.
  - FR-6: skill side (phase map, `:65`, `:80`).
  - FR-10: both scenarios.
  - FR-19: cite #6137, #6138.
  - NFR-2, NFR-3.
- **Design:** §8.1 rows *Commands table*, *Privacy 1–3*, *Phase map*, *Render rules*; DD-6, DD-7; P-6, P-7, P-16, P-17, P-20, P-23, P-28
- **Scope:** `SKILL.md`, about 8 sites:
  - Commands table: `snapshot … --describe false --output <spec>/evidence/stills/<task>-<label>/`; `render … --output`; the delivery row's deferral.
  - Privacy 1: telemetry on every command; skip-skills on `check`/`snapshot`/`render`/`preview`/`init`; never on `skills update` or bare `skills`; `skills check` telemetry only.
  - Privacy 2: consent line gains `snapshot --describe` (#6138).
  - Privacy 3: sanitize pointer.
  - Phase map: four rows.
  - Render rules: `:80` deferral, Fonts, Environment, quiet-tree daemon. The daemon is worded "observed in the source run" (P-28).
- **Tests / Verification:**
  1. Every `snapshot` line in the three skill files carries `--describe false`: `grep -rn "snapshot" .claude/skills/video-production | grep -v -- "--describe false"` leaves only the consent-line and prose mentions.
  2. `grep -n "SKIP_SKILLS" SKILL.md` matches the FR-2 placement.
  3. Byte measure (DD-6): the three files total ≤ 20,000. Over the cap → Pivot with the measured size.
  4. P-6, P-7 and P-28 are worded as user-stated or issue-cited, never as tool fact.
- **Falsifier:** post-change:
  - Drop `--describe false` from the commands-table snapshot row → check (1) lists it.
  - Put `HYPERFRAMES_SKIP_SKILLS=1` on the `skills update` row → check (2) shows it on a forbidden row.
  - Observe both, quote, revert.
- **Red run:** at 34afbff:
  - `grep -rc -- "--describe false"` over the skill → 0/0/0; `grep -c "snapshot --describe" SKILL.md` → 0.
  - `grep -rc SKIP_SKILLS` → 0/0/0.
  - `grep -c -E "story.md|SPEC.md|REVIEW.md" SKILL.md` → 0; `grep -ci daemon` → 0; `grep -ci worktree` → 0.
  - `grep -rc font-face` → 0/0/0.
  - `wc -c` total → 12,250.
- **Disqualifier:** a byte count taken before T1's edits land. A `--describe` wording that asserts Gemini behaviour as fact.
- **Consumers:** `test/video-production.test.js:145-150` (cap), `:152-175` (subcommand set; `npx hyperframes init` must enter the allowed set in T5 if instructed), `:177-188` (consent line), `:216-233`; `docs/skills/video-production.md` (T18).
- **Review:** `full`
- **Done:**
  - Checks, both falsifiers and the measured byte total quoted.
  - P-6, P-7 and P-28 wording recorded.
- **Skills:** `video-production`, `cognitive-doc-design`

### T3 — `render-evidence.md`

- **Status:** [x] · **Size:** S · **Depends on:** none
- **Requirements:**
  - FR-1: evidence-set snapshot carries the flag.
  - FR-2: output flag; sanitize THEN/AND IT MUST/BUT; `.txt` THEN/BUT.
  - FR-5: BUT not warm cache (item 7).
  - FR-6: final-look step 4.
  - NFR-3.
- **Design:** §8.2; P-17, P-23, P-24, P-29
- **Scope:** `references/render-evidence.md`, about 5 sites:
  - Evidence items 2 and 3: output paths and per-run folder.
  - Item 7: cold-cache `check`, with the settle-at-first-use clause for P-24.
  - *Evidence files* block: location, `.txt`, sanitize with the two gate greps, and "commands run from the repository root" (P-29).
  - Final look step 4: deferral.
- **Tests / Verification:**
  1. `grep -n -E 'grep -rn "\$HOME"|var/folders' render-evidence.md` shows both gate greps.
  2. `grep -c "\.txt" render-evidence.md` ≥ 1.
  3. `grep -n "Delivery: deferred" render-evidence.md` appears in step 4.
- **Falsifier:** post-change, delete the temp-prefix grep → check (1) shows one gate only. Observe, quote, revert.
- **Red run:** at 34afbff: `grep -c "\.txt"` → 0; `grep -rc "evidence/"` → 0; `grep -c "Delivery: deferred"` → 0.
- **Disqualifier:** the cache path stated without the `UNVERIFIED` settle clause.
- **Consumers:** `test/video-production.test.js:243-252` (duration block: unchanged, must stay green).
- **Review:** `checklist`
- **Done:** checks and falsifier quoted; the duration block untouched.
- **Skills:** `video-production`, `cognitive-doc-design`

### T4 — `acceptance-criteria.md`

- **Status:** [x] · **Size:** XS · **Depends on:** none
- **Requirements:** FR-4 *Music bed*; FR-5 *Brand source names files*; FR-6 (row 10); FR-14 (THEN)
- **Design:** §8.3; P-16, P-18
- **Scope:** `references/acceptance-criteria.md`: rows 8, 9 and 10, plus the new *Motion* defect row (4 sites).
- **Tests / Verification:** `grep -n -E "^\| (8|9|10) \||^\| Motion" acceptance-criteria.md` shows four rows carrying the new obligations.
- **Falsifier:** post-change, delete "not motion" from the Motion row → the row no longer limits `check --at-transitions`. Observe, quote, revert.
- **Red run:** at 34afbff: `grep -ci "music bed"` → 0; `grep -c "^| Motion"` → 0.
- **Disqualifier:** a Motion row whose gate is `check`.
- **Consumers:** none outside the skill (T5 pins).
- **Review:** `checklist`
- **Done:** walk quoted.
- **Skills:** `video-production`, `cognitive-doc-design`

### T5 — `test/video-production.test.js`: pins for T1–T4

- **Status:** [ ] · **Size:** M (~200 LOC) · **Depends on:** T1, T2, T3, T4
- **Requirements:** every clause T1–T4 own (coverage table below); NFR-1 (counts stay ≥ the bounds); NFR-2; NFR-6
- **Design:** §8.1–§8.3; P-1; DD-6, DD-11
- **Scope:** extend `test/video-production.test.js`:
  - New pins: one assertion per THEN/BUT/AND clause.
  - Amended pins: `:235-241` (host rows split), and `:152-175` (allowed subcommand set gains `init` only if T2 instructs it).
  - The cap stays 20,000 and 3 files.
  - The FR-8 HeyGen placement test is unchanged.
- **Tests / Verification:** `node --test test/video-production.test.js` is green on the post-change skill.
- **Falsifier:** run each new pin against a scratch copy via `VIDEO_PRODUCTION_TEST_ROOT` with the matching clause removed:
  - consent `snapshot --describe`;
  - `--describe false` on one snapshot row;
  - `SKIP_SKILLS` placed on `skills update`;
  - one gate grep;
  - the Motion row;
  - `--agent` on one host row.
  - Each must go red on its assertion, not on setup. Quote each.
- **Red run:** predicted — greenfield artifact (observed in T5): the new assertions are red against the 34afbff skill, whose baselines are quoted in T1–T4.
- **Disqualifier:** a pin that only asserts a word occurs anywhere in the file (KZ-changes--gate-falsifiability-2). A red from a missing file or setup.
- **Consumers:** the test file itself; `npm test` count (655 at 34afbff).
- **Review:** `full`
- **Done:**
  - Suite green.
  - Each mutation's red quoted with its assertion message.
  - New test count recorded.
- **Skills:** `tdd`, `video-production`

---

### T6 — `akili-propose.md`

- **Status:** [x] · **Size:** S · **Depends on:** none
- **Requirements:** FR-6 *Recorded where downstream reads it* (propose side); FR-7 *Outline replaces the delta* (THEN/BUT/AND); FR-12 *Owner mandate* (sentence, quote instruction); FR-16 both scenarios (THEN, BUT not under gated)
- **Design:** §8.4 `akili-propose.md` (a)–(e); owner-mandate sentence
- **Scope:** five sites:
  - path rules (literal path);
  - Step 1 Approval Mode bullet (owner-mandate sentence);
  - Step 1.1 (pre-approved source skip and its log line);
  - Step 2 item 9 plus the new Deliverable Outline block;
  - Step 2 item 1 (`Delivery`).
- **Tests / Verification:** `grep -n -E "No mandate widens|Deliverable Outline|source questions skipped|literal path mandated by the brief|Delivery: render" akili-propose.md` hits each site once in its section.
- **Falsifier:** post-change, remove "BUT … under `gated`" from Step 1.1 → the skip rule reads unconditional. Observe, quote, revert.
- **Red run:** at 34afbff: `grep -c "No mandate widens"` → 0; `grep -c "Deliverable Outline"` → 0; `grep -c "source questions skipped"` → 0. `grep -n -i mandate` → `:105`, `:282`, both pre-existing (Approval Mode definition and checklist).
- **Disqualifier:** a sweep keyed only on "Requirement Delta Preview". The Bug track's Bug Diagnosis must stay untouched.
- **Consumers:** `docs/commands/akili-propose.md` (T18).
- **Review:** `checklist`
- **Done:** walk and falsifier quoted.
- **Skills:** `cognitive-doc-design`

### T7 — `akili-specify.md`

- **Status:** [ ] · **Size:** M · **Depends on:** none
- **Requirements:**
  - FR-6 *Recorded where downstream reads it*.
  - FR-7 *Specify converts it*.
  - FR-9 (THEN, AND IT MUST, BUT).
  - FR-12 *Video gate multiplier* (THEN, BUT not software).
  - FR-15 (specify).
  - FR-17 (THEN, BUT).
- **Design:** §8.4 `akili-specify.md` (a)–(f); first-token wording
- **Scope:** about 8 sites:
  - Arguments sentence, plus `$ARGUMENTS` → `$SPEC_PATH` at `:35,88,97,99,104` (one mechanical site).
  - Video Mode (`Delivery` copy, Outline conversion).
  - Approval Mode paragraph.
  - Step 1.2 conversion bullet.
  - Step 3.2 `Red run` field.
  - Falsifiability item 8.
  - Step 2.4 multiplier.
  - Step 2.5 second menu.
  - Verification Checklist clause.
- **Tests / Verification:**
  1. `grep -c '\$ARGUMENTS' akili-specify.md` → 1, inside `## Arguments`.
  2. `grep -n -E "greenfield|fixed, not re-judged|2–3" akili-specify.md` hits each target section.
- **Falsifier:** post-change, restore one `docs/specs/$ARGUMENTS/` path → check (1) reads 2. Observe, quote, revert.
- **Red run:** at 34afbff: `grep -c '\$ARGUMENTS'` → 6 (`:31,35,88,97,99,104`); `grep -ci greenfield` → 0; `grep -c "fixed, not re-judged"` → 0; `grep -c SPEC_PATH` → 0.
- **Disqualifier:** an item-8 edit that leaves the `Red run` field and the checklist requiring an observed red with no greenfield clause (judgment A J-25).
- **Consumers:** `test/video-production.test.js:254-266` (specify `Deliverable: video` count ≥ 5; Video Mode default sentence); `test/diagram-design.test.js:339-369,521-537` (reads `akili-specify.md`; must stay green); `docs/commands/akili-specify.md` (T18).
- **Review:** `full` — this command governs every spec.
- **Done:**
  - Checks and falsifier quoted.
  - Both consumer suites green after the edit, run on a quiet tree.
- **Skills:** `cognitive-doc-design`

### T8 — `akili-execute.md`

- **Status:** [x] · **Size:** S · **Depends on:** none
- **Requirements:**
  - FR-12 *Owner mandate*: THEN stop, AND quotes, BUT not `auto-approved`.
  - FR-13: both scenarios, every clause.
  - FR-15 (execute).
- **Design:** §8.4 `akili-execute.md` (a)–(c); the ceiling rung; owner-mandate sentence; DD-8
- **Scope:** about 5 sites:
  - Arguments sentence, plus `$ARGUMENTS` → `$SPEC_PATH` at `:103-106`.
  - Loop pseudo-code `effort = bump…` comment.
  - Loop Rules sentence: ceiling rung, non-runtime trigger, Reviewer model choice, no weaker auditor, attempts stay 3.
  - Budget Tripwire bullet.
  - Approval Mode paragraph.
- **Tests / Verification:**
  1. `grep -c '\$ARGUMENTS'` → 1 in Arguments.
  2. `grep -n -E "ceiling rung|held xhigh|No mandate widens"` hits the loop and both Approval sites.
- **Falsifier:** post-change, delete "never route the Reviewer to a weaker model" → FR-13 *Ceiling with a distinct Reviewer model* loses its floor in the walk. Observe, quote, revert.
- **Red run:** at 34afbff: `grep -c '\$ARGUMENTS'` → 5; `grep -c -E "ceiling rung|held xhigh"` → 0; `grep -c "No mandate widens"` → 0.
- **Disqualifier:** a rung that changes the 3-attempt ceiling or permits `max` on T2.
- **Consumers:** `docs/commands/akili-execute.md` (T18); `.claude/templates/leader.md` (T11 cites the rung by name).
- **Review:** `full`
- **Done:** walk and falsifier quoted.
- **Skills:** `cognitive-doc-design`

### T9 — `akili-test.md`

- **Status:** [ ] · **Size:** S · **Depends on:** none
- **Requirements:**
  - FR-8: THEN, BUT no n/a, AND mixed keep.
  - FR-11 *Runtime spawn*: THEN, AND IT MUST stop as an exception, BUT inline.
  - FR-11 *Rule text* (`:15,54,86`).
  - FR-15 (test).
- **Design:** §8.4 `akili-test.md` (a)–(e); §9 row 1; DD-3; P-21
- **Scope:** about 7 sites:
  - Arguments, plus `:34,98-100,143`.
  - Tier note `:15`.
  - Delegation bullet `:54`.
  - Model-checkpoint sentence `:86`.
  - Deployment Rule *Run inline* row.
  - Exception sentence.
  - Phase 4 video sections.
- **Tests / Verification:**
  1. `grep -c '\$ARGUMENTS'` → 1.
  2. `grep -n -i -E "prefer.*tester|ideally"` → 0 model-preference hits.
  3. `grep -n "Final-look pending"` lands in Phase 4.
  4. The Implementer-model sources name the registry T2 or the wrapper plus escalations, never `spawns:`.
- **Falsifier:** post-change, restore "Prefer a Tester model that differs" at `:15` → check (2) reads 1. Observe, quote, revert.
- **Red run:** at 34afbff: `grep -c '\$ARGUMENTS'` → 6; `grep -c "Final-look pending"` → 0; `:15` and `:54` read "Prefer"; `:86` reads "wrapper (T2)".
- **Disqualifier:** a runtime rule that reads the Implementer model from the `spawns:` line (P-21).
- **Consumers:** `test/video-production.test.js:254-260` (test count ≥ 3); `docs/commands/akili-test.md` (T18).
- **Review:** `full`
- **Done:** walk and falsifier quoted.
- **Skills:** `cognitive-doc-design`

### T10 — `akili-validate.md`

- **Status:** [ ] · **Size:** S · **Depends on:** none
- **Requirements:** FR-6 *Deferred* (THEN, AND IT MUST, BUT) and *Default*; FR-15 (validate)
- **Design:** §8.4 `akili-validate.md` (a), (b); §5 fall-through for unknown `Delivery` values
- **Scope:** 2 sites:
  - Arguments, plus the mechanical `$ARGUMENTS` → `$SPEC_PATH` replacement at `:34,36,66-72,151,175`.
  - Delivery-render paragraph `:143`, with the fall-through.
- **Tests / Verification:**
  1. `grep -c '\$ARGUMENTS'` → 1.
  2. `grep -n "Delivery: deferred"` sits in the delivery-render paragraph.
  3. `/akili-archive $SPEC_PATH` at the end.
- **Falsifier:** post-change, delete "never states the delivery render ran" → the FR-6 BUT is unguarded in the walk. Observe, quote, revert.
- **Red run:** at 34afbff: `grep -c '\$ARGUMENTS'` → 11; `grep -c "Delivery: deferred"` → 0.
- **Disqualifier:** a deferral that also skips the final look.
- **Consumers:** `test/video-production.test.js:254-260` (validate count ≥ 4); `docs/commands/akili-validate.md`, `docs/flow.md:489` (T18, T19).
- **Review:** `checklist`
- **Done:** walk and falsifier quoted.
- **Skills:** `cognitive-doc-design`

### T11 — `.claude/templates/leader.md`

- **Status:** [ ] · **Size:** XS · **Depends on:** T8 (the rung's name), T9 (the Tester rule's wording)
- **Requirements:** FR-11 *Rule text* (`:333`); FR-13 (Leader restatement)
- **Design:** §8.5; DD-9; P-26
- **Scope:** 3 sites — `:27`, `:35`, `:333` ("A preference, not a hard rule" removed).
- **Tests / Verification:**
  1. `grep -c "not a hard rule" leader.md` → 0.
  2. `node --test test/agents-doctor*.test.js test/persona-digests.test.js test/install*.test.js` green, on a quiet tree.
- **Falsifier:** post-change, restore the `:333` sentence → check (1) reads 1. Observe, quote, revert.
- **Red run:** at 34afbff: `grep -c "not a hard rule" leader.md` → 1 (`:333`).
- **Disqualifier:** a doctor-suite run with another agent active.
- **Consumers:** `test/agents-doctor.test.js:1004` (leader section extents), `test/persona-digests.test.js`, `test/agents-doctor-io.test.js:73`; deployed `.agents/leader.md` copies (`doctor --agents` reads `outdated`; CHANGELOG in T21).
- **Review:** `checklist`
- **Done:** suite output and falsifier quoted; the section fences are untouched.
- **Skills:** `cognitive-doc-design`

### T12 — `.claude/templates/tester.md`

- **Status:** [ ] · **Size:** XS · **Depends on:** T9
- **Requirements:** FR-11 *Rule text* (`:7`)
- **Design:** §8.5; DD-9; P-26
- **Scope:** 1 site, `:7`.
- **Tests / Verification:** `grep -n -i "prefer running" tester.md` → 0; same doctor and digest suite as T11.
- **Falsifier:** post-change, restore "prefer running" → the grep reads 1. Observe, quote, revert.
- **Red run:** at 34afbff: `tester.md:7` reads "prefer running on a **different model than the Implementer**".
- **Disqualifier:** n/a
- **Consumers:** same as T11, for `tester.md`.
- **Review:** `checklist`
- **Done:** suite output and falsifier quoted.
- **Skills:** `cognitive-doc-design`

### T13 — `.claude/skills/judgment-day/SKILL.md`

- **Status:** [ ] · **Size:** XS · **Depends on:** T7 (annotation wording)
- **Requirements:** FR-17 (THEN, BUT); the skill's terminal set stays unchanged
- **Design:** §8.5 `judgment-day`; C-4
- **Scope:** 1 site — one adaptation-rule bullet. The Hard Rules are untouched.
- **Tests / Verification:** `grep -c "approved | escalated" SKILL.md` keeps its 34afbff value; `grep -n "fixed, not re-judged"` appears in the *AKILI-SPECS Integration* section only.
- **Falsifier:** post-change, move the bullet's annotation into the Hard Rules terminal line → check (1) changes. Observe, quote, revert.
- **Red run:** at 34afbff: `grep -c "fixed, not re-judged"` → 0.
- **Disqualifier:** any edit outside the integration section.
- **Consumers:** `docs/skills/judgment-day.md` (T18).
- **Review:** `checklist`
- **Done:** walk quoted.
- **Skills:** `cognitive-doc-design`

### T14 — `test/command-contracts.test.js`: contracts for T6–T13

- **Status:** [ ] · **Size:** M (~250 LOC) · **Depends on:** T6–T13
- **Requirements:** every clause T6–T13 own (coverage table); FR-15 BUT (no `$ARGUMENTS` in any path in the four commands); NFR-1; NFR-6
- **Design:** §8.4, §8.5; DD-4, DD-11
- **Scope:** new `test/command-contracts.test.js`, with the same root-override hook as `video-production.test.js` (`COMMAND_CONTRACTS_TEST_ROOT`). Contents:
  - The four commands: `$ARGUMENTS` occurs exactly once, inside `## Arguments`, and no `docs/specs/$ARGUMENTS` remains.
  - The first-token sentence is identical across the four.
  - The owner-mandate sentence is identical at its three sites.
  - The ceiling rung, the Tester MUST sources and exception, the video report sections, the greenfield clause and field, the `Delivery: deferred` paragraph, the propose Outline, literal path and source skip, and the judgment-day annotation are each pinned in their section.
- **Tests / Verification:** `node --test test/command-contracts.test.js` is green.
- **Falsifier:** one mutation per contract on a scratch root:
  - re-add one `docs/specs/$ARGUMENTS/` to `akili-validate.md`;
  - alter one copy of the owner-mandate sentence;
  - restore "Prefer" in `akili-test.md:15`;
  - drop "not under `gated`" in propose.
  - Each must go red on its assertion. Quote each.
- **Red run:** predicted — greenfield artifact (observed in T14). Against 34afbff the first-token contract reads 6/5/6/11 `$ARGUMENTS` occurrences (specify/execute/test/validate).
- **Disqualifier:** an "anywhere in the file" presence assertion. A test that reads `docs/specs/changes/...`.
- **Consumers:** `npm test` count.
- **Review:** `full`
- **Done:** suite green; each mutation's red quoted.
- **Skills:** `tdd`

---

### T15 — `bin/routing.js` Tester derivation + routing tests

- **Status:** [ ] · **Size:** M (~60 code + ~150 test LOC) · **Depends on:** none
- **Requirements:**
  - FR-11 *Wrapper derivation*: THEN, AND report line, BUT any host and any mode.
  - FR-11 *No distinct model on a host*: THEN, AND others unaffected.
  - FR-19 tests.
- **Design:** §6 (all Tester rows), §7.1 (location, steps 1–6, packaged-roster table); DD-1, DD-2; P-2, P-13, P-14
- **Scope:**
  - `planWrapper` Tester branch.
  - `buildPlan`: belt and braces with the `skipped (author ≠ tester unsatisfiable)` token, the written and skip report lines, and the stale-file line.
  - Removes the `:848-850` line and updates the `:603` comment.
  - Tests updated: `test/routing.test.js:313-318, 638, 646, 658-663, 688, 697, 718-724, 742-746, 801, 842-852`; `test/routing-io.test.js:154, 214, 235`.
  - New enumeration test: five hosts × {packaged roster, user roster, cross-host T3, author ≠ auditor unsatisfiable, `wrappers=no`} × {plan, `renderWrapper`}. It asserts the Tester bound model ≠ the Implementer's whenever a Tester is written.
- **Tests / Verification:**
  1. `node --test test/routing*.test.js` green.
  2. The P-14 dry-run command (design §11) prints the four expected Tester lines from the §7.1 table, quoted.
- **Falsifier:** post-change, make step 3 return the first candidate without the bound-model comparison → the enumeration test goes red on the OpenCode user roster (`routing.test.js:313-318`: T3 = T2) and the cross-host sonnet-only case (`:801`). The belt-and-braces check alone must still stop the write: assert the token. Observe, quote, revert.
- **Red run:** at 34afbff (P-14, observed): the dry run prints `Claude Code Tester: same model as the Implementer (\`sonnet\`, T2 primary) — Step 8E default; Rule 1 allows it`, plus the same line for OpenCode, Antigravity and Codex. So a "Tester bound model ≠ Implementer" assertion is red on the shipped code.
- **Disqualifier:**
  - A red from a renamed fixture rather than the comparison.
  - Changes to the Reviewer path: `renderWrapper` output for `reviewer` must be byte-identical before and after, and is asserted.
- **Consumers:** listed in Scope (P-2); `bin/akili.js:2857` (`buildPlan` caller); the `--json` output shape (unchanged).
- **Review:** `full` — code, author ≠ auditor contract.
- **Done:**
  - Suites green.
  - Falsifier red quoted.
  - The §7.1 table re-observed and quoted.
  - Reviewer byte-identity asserted.
- **Skills:** `tdd`

### T16 — `akili-constitution.md` Step 8B/8E/9 restatements

- **Status:** [ ] · **Size:** S · **Depends on:** T15 (observed models)
- **Requirements:** FR-11 *Rule text*
- **Design:** §9 rows for `akili-constitution.md`; the Kept row (`:576-578` unchanged)
- **Scope:** about 7 sites — `:459`, `:791-793`, `:827-832`, `:844-846`, `:864`, `:1020-1022`, `:1429`.
- **Tests / Verification:** the §9 sweep over the file; every hit is a §9 row with its action applied, or the Kept `:576-578`.
- **Falsifier:** post-change, restore "a preference, not a hard rule" at Rule 1 → the sweep shows it. Observe, quote, revert.
- **Red run:** at 34afbff: `grep -c "not a hard rule" akili-constitution.md` → 1 (`:1022`).
- **Disqualifier:** example models that differ from T15's observed packaged outcome.
- **Consumers:** `docs/commands/akili-constitution.md:100` (classified not-a-model-claim; re-read).
- **Review:** `checklist`
- **Done:** sweep quoted.
- **Skills:** `cognitive-doc-design`

### T17 — `docs/model-routing.md`

- **Status:** [ ] · **Size:** S · **Depends on:** T15
- **Requirements:** FR-11 *Rule text*; FR-19
- **Design:** §9 row `docs/model-routing.md`; DD-9 (the section template is not edited; P-3)
- **Scope:** `:71-72`, `:87`, `:189`, `:252`, `:795`.
- **Tests / Verification:**
  1. The §9 sweep over the file.
  2. `git diff --stat .claude/templates/model-routing.section.md` → empty.
  3. `node --test test/registry-drift.test.js` green.
- **Falsifier:** post-change, restore "stays on the `sonnet` workhorse" for Testers → the sweep shows the stale claim. Observe, quote, revert.
- **Red run:** at 34afbff: `:72` "(author ≠ tester)" as a preference; `:87` "Prefer a different model"; `:189` "(Implementers, Testers) stays on the `sonnet` workhorse".
- **Disqualifier:** an edit to the registry table (drift test) or to the section template.
- **Consumers:** `test/registry-drift.test.js`.
- **Review:** `checklist`
- **Done:** sweep and drift suite quoted.
- **Skills:** `cognitive-doc-design`

### T18 — Docs mirrors

- **Status:** [ ] · **Size:** S · **Depends on:** T1–T4, T6–T10, T13
- **Requirements:** FR-19; FR-11 *Rule text* (`docs/commands/akili-test.md:23,32`)
- **Design:** §4 Docs row; §9 rows
- **Scope:**
  - `docs/commands/akili-{propose,specify,execute,test,validate}.md`: Outline, `Delivery`, first-token, Tester MUST, video report sections, ceiling rung.
  - `docs/skills/video-production.md`: route `:29`, privacy, deferral.
  - `docs/skills/judgment-day.md`: annotation.
- **Tests / Verification:** per file, quote-check each changed sentence against its source command at HEAD (KZ-002).
- **Falsifier:** post-change, revert `docs/skills/video-production.md:29` to the 10-skill route → the quote-check against `SKILL.md` fails. Observe, quote, revert.
- **Red run:** at 34afbff: `docs/commands/akili-test.md:23` "Testers prefer a different model"; `docs/skills/video-production.md:29` repeats the 10-skill route.
- **Disqualifier:** a docs sentence that restates more than its source says.
- **Consumers:** `test/akili-security-docs.test.js` (the only test that reads `docs/commands/*`, per `grep -ln "docs/commands"` over `test/`; must stay green).
- **Review:** `checklist`
- **Done:** quote-check table quoted.
- **Skills:** `cognitive-doc-design`

### T19 — `README.md`, `docs/cli.md`, `docs/flow.md` (Tester and video)

- **Status:** [ ] · **Size:** S · **Depends on:** T15, T10
- **Requirements:** FR-11 *Rule text*; FR-6 (`docs/flow.md:489`); FR-19
- **Design:** §9 rows `docs/cli.md:504`, `README.md:898`, `docs/flow.md:379,394`; §6 drifted-file row (the `--force` statement in `docs/cli.md`)
- **Scope:**
  - `docs/cli.md:504`, plus the drift sentence in *Wrappers per host*.
  - `README.md:898`.
  - `docs/flow.md:379`, `:394`, `:489`.
- **Tests / Verification:** the §9 sweep over the three files; quote-check against T15's report lines.
- **Falsifier:** post-change, restore "Ideally a Tester" in `flow.md:379` → the sweep shows it. Observe, quote, revert.
- **Red run:** at 34afbff: `README.md:898` and `docs/flow.md:379` read "Ideally a Tester runs on a different model"; `docs/cli.md:504` reads "Tester T2".
- **Disqualifier:** n/a
- **Consumers:** none pinned by tests (whole-repo grep for the changed sentences at T21).
- **Review:** `checklist`
- **Done:** sweep quoted.
- **Skills:** `cognitive-doc-design`

### T20 — `akili --version`

- **Status:** [ ] · **Size:** S (~25 code + ~60 test LOC) · **Depends on:** T19 (same docs files)
- **Requirements:** FR-18 (THEN, BUT); FR-19 (docs)
- **Design:** §6 `--version` row; §7.2; DD-10; P-9–P-12
- **Scope:**
  - `bin/akili.js`: option `version` with short `v`; early return in `getArgs` before the validations; `main` branch before `checkForUpdates`; one `printHelp` line.
  - New `test/cli-version.test.js`: spawns `--version`, `-v`, `--version install`, `--version --help`, and `--version --tool bogus`. Each asserts stdout `== <package.json version>\n`, exit 0, empty stderr, and no `Unknown option`. For no-network, the test preloads `test/fixtures/update-check/registry-redirect.js` (the `update-check.test.js` seam) and asserts 0 registry hits. That assertion is **inert** in a spawned non-TTY process, because `checkForUpdates` returns early without a TTY (`bin/akili.js:2392`). So the property rests on code order (the `main` branch runs before `checkForUpdates`): the Reviewer checks that order, and a comment in the test records the gap.
  - `docs/cli.md` *Commands* table row and `README.md` usage line.
- **Tests / Verification:** `node --test test/cli-version.test.js` green; `node bin/akili.js --version` prints `2.35.0`.
- **Falsifier:** post-change, move the version branch after the validations → `--version --tool bogus` exits 1. Observe, quote, revert.
- **Red run:** at 34afbff (P-9, observed): `node bin/akili.js --version` → `ERROR: Unknown option '--version'`, exit 1; `-v` → `ERROR: Unknown option '-v'`, exit 1.
- **Disqualifier:** an assertion on `includes("2.35.0")` instead of exact equality with the version read from `package.json`. A no-network claim backed only by the inert hit counter.
- **Consumers:** `test/update-check.test.js` (startup path; must stay green); `npm run verify:cli`.
- **Review:** `checklist`
- **Done:** suite green; falsifier red quoted; the no-network seam stated.
- **Skills:** `tdd`

### T21 — CHANGELOG + closing sweep

- **Status:** [ ] · **Size:** S · **Depends on:** T1–T20
- **Requirements:** FR-19 (all clauses, including *Summary surfaces match HEAD*); NFR-4
- **Design:** §9 Kept (debt) row; §6 drifted-file row; §8.5 persona churn
- **Scope:** `CHANGELOG.md` `Unreleased`. Entries cover:
  - the skill hardening;
  - commands;
  - Tester ≠ Implementer: wrapper changes per host, the Antigravity skip, stale and drifted files, `--force`;
  - persona edits: `doctor --agents` reads `outdated` → `--fix`;
  - the first-token rule and its residual commands;
  - `--version`;
  - the section-template debt.

  Then the closing §9 phrase-family sweep, plus `npm test`, `npm run verify:cli`, `npm run pack:dry-run` and `git diff --check`.
- **Tests / Verification:** the four commands above, on a quiet tree; every CHANGELOG clause quote-checked at HEAD; test counts re-run after the last suite change.
- **Falsifier:** post-change, add a CHANGELOG clause claiming the section template was updated → the quote-check against `git diff 8679e25 -- .claude/templates/model-routing.section.md` (empty) refutes it. Observe, quote, revert.
- **Red run:** at 34afbff: `CHANGELOG.md` `Unreleased` has no entry for this spec.
- **Disqualifier:** a test total copied from an earlier task (KZ-002 recurrence).
- **Consumers:** release tooling (`npm run release:status` reads the CHANGELOG; not run here).
- **Review:** `full` — summary surface (KZ-002).
- **Done:**
  - Four commands' outputs quoted.
  - The sweep shows only §9-classified hits.
  - The budget totals (tasks, LOC, rounds) written into `execution.md` against design §12.
- **Skills:** `cognitive-doc-design`

---

## Coverage (scenario and clause level)

| Requirement | Clause | Owner |
|---|---|---|
| FR-1 *Default snapshot* | THEN flag · BUT every line · AND IT MUST consent line | T2, T3 · T2, T3 (T5 pins) · T2 (T5) |
| FR-1 *Consent per use* | THEN · BUT | T2 (T5) |
| FR-2 *Output flag* | THEN (incl. per-run subfolder) · BUT no default | T2, T3 (T5) |
| FR-2 *Sanitize* | THEN · AND IT MUST two greps · BUT before commit | T3 (T5) |
| FR-2 *Logs `.txt`* | THEN · BUT no `.gitignore` | T3 (T5) |
| FR-2 *Skill refresh* | THEN · BUT not on `skills update`/bare `skills` · AND telemetry everywhere | T2 (T5) |
| FR-3 *Route per host* | THEN ids · AND project-scoped · BUT no `-g` | T1 (T5) |
| FR-3 *Lock mismatch* | THEN both lists · AND IT MUST pass + record · BUT not silent | T1 (T5) |
| FR-3 *No stale names* | THEN · BUT · AND captions → router | T1 (T5) |
| FR-4 *Film artifacts* | THEN · BUT no second approval | T2 (T5) |
| FR-4 *Music bed* | THEN | T4 (T5) |
| FR-5 *Bundled is not local* | THEN · AND note #6137 · BUT no warm cache | T2 · T2 · T3 (T5) |
| FR-5 *Brand source* | THEN | T4 (T5) |
| FR-6 *Deferred* | THEN · AND IT MUST final look · BUT not reported done | T10, T3 (T14) |
| FR-6 *Default* | THEN | T10 (T14) |
| FR-6 *Recorded downstream* | THEN | T6, T7 (T14) |
| FR-7 *Outline replaces delta* | THEN · BUT · AND Bug unchanged | T6 (T14) |
| FR-7 *Specify converts* | THEN | T7 (T14) |
| FR-8 | THEN · BUT no n/a · AND mixed | T9 (T14) |
| FR-9 | THEN · AND IT MUST observed · BUT existing targets | T7 (T14) |
| FR-10 *Daemon* | THEN · BUT | T2 (T5) |
| FR-10 *One render* | THEN | T2 (T5) |
| FR-11 *Wrapper derivation* | THEN · AND report line · BUT any host/mode | T15 |
| FR-11 *No distinct model* | THEN · AND others unaffected | T15 |
| FR-11 *Runtime spawn* | THEN · AND IT MUST exception stop · BUT inline | T9 (T14), T11 |
| FR-11 *Rule text* | THEN MUST · BUT no "preference" outside Kept | T9, T11, T12, T16–T19; closing sweep T21 |
| FR-12 *Owner mandate* | THEN stop · AND quotes · BUT not auto-approved | T6, T8 (T14) |
| FR-12 *Video multiplier* | THEN · BUT not software | T7 (T14) |
| FR-13 *Distinct Reviewer* | THEN · BUT no `max` | T8, T11 (T14) |
| FR-13 *No distinct Reviewer* | THEN · BUT not shared · AND ceiling 3 | T8 (T14) |
| FR-14 | THEN | T4 (T5) |
| FR-15 | THEN · BUT | T7, T8, T9, T10 (T14) |
| FR-16 *Literal path* | THEN | T6 (T14) |
| FR-16 *Source supplied* | THEN · BUT not gated/silent | T6 (T14) |
| FR-17 | THEN · BUT | T7, T13 (T14) |
| FR-18 | THEN · BUT | T20 |
| FR-19 | CHANGELOG · docs · issue cites · tests · *Summary surfaces* | T21 · T18–T20 · T1, T2 · T5, T14, T15, T20 · T21 |
| NFR-1 | software specs unaffected | T5, T14 (count bounds), T21 |
| NFR-2 | 3 files, cap re-measured | T2 (measure), T5 (pin) |
| NFR-3 | no HyperFrames text copied | T1, T2 (reviewer walk) |
| NFR-4 | four commands green | T21 |
| NFR-5 | tool-agnostic wording | every rules task's review |
| NFR-6 | no `docs/specs/changes` reads | T5, T14, T15, T20 |

## `skip-eligible` tasks

None. Every task carries `checklist` or `full`.
