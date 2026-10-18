# Tasks: Video Deliverable Track

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/video-deliverable-track` |
| Depth | Standard |
| Tasks | 10 · est. ~550 LOC (prose) · single PR (local commits only this cycle) |
| Commit prefix | `[SPEC:changes/video-deliverable-track]` |
| Pinned upstream | `heygen-com/hyperframes@01adadb9` — every HyperFrames claim is raw-checked against it (KZ-changes--cursor-install-target-1) |

**Order:** T1 → (T2 ∥ T3 ∥ T4 ∥ T5 ∥ T6 ∥ T7) → T8 → T9 → T10. T2–T7 edit different files and may run in
parallel; each depends on T1 only for the skill name and file layout.

**Shared pre-review sweep (every rules-text task):** before the Reviewer, run the phrase-family grep for the
obligation the task changes over every in-scope file and read every hit (KZ-changes--kaizen-loop-closure-2).

---

### T1 — Author the `video-production` skill

- **Status:** [ ] · **Size:** M · **Depends on:** none
- **Requirements:** FR-3 (routing to `hyperframes`), FR-4 (both scenarios' gate text), FR-5, FR-8 (all clauses), NFR-2, NFR-3, NFR-4
- **Design:** §4, §9, DD-2, DD-3, DD-6, DD-8, DD-9; Premise P-7…P-11
- **Scope:** `SKILL.md` (frontmatter per governance original-authorship variant; availability gate with per-host install hints for all 5 hosts; phase map §9; privacy defaults; render-is-a-measurement concurrency note; deferral table → `hyperframes`, `hyperframes-core`, `hyperframes-cli`, `hyperframes-animation`, `hyperframes-creative`, `media-use`, `embedded-captions`); `references/acceptance-criteria.md` (FR-2 criteria list + video defect-class → gate table); `references/render-evidence.md` (FR-6 evidence set, FR-7 final look, FR-2 Bug Mode regression shape)
- **Tests / Verification:** (1) frontmatter walk vs `docs/skills/governance.md` schema; (2) `grep -n -E "npx hyperframes [a-z-]+" -r .claude/skills/video-production` — every subcommand ∈ {check, snapshot, render, preview, skills} and each verified in the clone; (3) `du -sk` ≤ 20 and file count = 3; (4) `grep -ril "heygen" .claude/skills/video-production` hits only attribution/install lines; (5) no upstream passage copied: for 5 distinctive upstream sentences, `grep -F` returns 0
- **Falsifier:** add `npx hyperframes lambda render` to SKILL.md → check (2) flags a non-allowed subcommand; rename `name:` to `hyperframes-bridge` → FR-8 walk fails
- **Red run:** n/a — new files, no prior state
- **Disqualifier:** a subcommand "verified" from memory rather than a grep of the clone is not evidence
- **Consumers:** none (new skill; readers added in T3–T7)
- **Review:** `full` — new packaged skill and the core of the change
- **Done:** 3 files; all five checks pass with outputs quoted in `execution.md`
- **Skills:** `cognitive-doc-design`, `brainstorming`

### T2 — Governance amendment + constitution Step 8D

- **Status:** [ ] · **Size:** S · **Depends on:** T1
- **Requirements:** FR-9 (both clauses), FR-8 (assignment row), NFR-1
- **Design:** DD-7; P-2, P-6
- **Scope:** `docs/skills/governance.md` — new clause under *Environment-provided skills*; rule 2 sentence narrowed; *Current assignment* `conditional` row gains `video-production (video deliverables)`. `.claude/commands/akili-constitution.md` Step 8D item 3 — the "run every command" sentence aligned (2 files, 3 sites — within the one-review bound)
- **Tests / Verification:** phrase-family grep `grep -rn -i -E "work without|without (it|them|that tool)|run every command|every command (works|must)" docs/skills/governance.md .claude/commands/akili-constitution.md README.md docs/flow.md AGENTS.md` — each hit states FR-9's rule or is out of topic (listed)
- **Falsifier:** leave `governance.md:29` unchanged → the grep shows an unconditional "every command must still work without it" beside the new clause → FAIL
- **Red run:** baseline grep at `4a6ac65` returns `governance.md:29` and `README.md:151` with the unconditional form (quoted in P-6)
- **Disqualifier:** a sweep keyed only on the word "hyperframes" (misses rule 2, which never names it)
- **Consumers:** `README.md:151` (fixed in T8), `docs/flow.md` conditional list (T8)
- **Review:** `checklist` — two short rules edits
- **Done:** sweep output quoted; rule 1 text ("Never copy one into `.claude/skills/`") unchanged
- **Skills:** `cognitive-doc-design`

### T3 — `/akili-propose`: Deliverable field

- **Status:** [ ] · **Size:** S · **Depends on:** T1
- **Requirements:** FR-1 (all four scenarios, incl. the `BUT` and `AND IT MUST`), NFR-1
- **Design:** DD-1, DD-4; §3 row 1; §5
- **Scope:** Step 1 — a Deliverable block after the Type table (signals, default, one shared question); Step 2 Document Control item list; Visual Reference note for video sources; Review Checklist item; Report To User item (≤ 5 sites)
- **Tests / Verification:** held-out walkthrough against the shipped text with examples stripped: (a) "make a 30s launch video" → video; (b) "fix the video player component" → software; (c) "the rendered promo cuts the last second" → Bug + video, one question max; (d) "add subtitles to interview.mp4" → video (not cited in the text); (e) "build a pitch deck" → ambiguous → asks the one question (not cited)
- **Falsifier:** delete the "requested deliverable, not a word in passing" sentence → case (b) has no rule excluding it → FAIL
- **Red run:** at baseline the text has no `Deliverable` — `grep -c "Deliverable" .claude/commands/akili-propose.md` → 0 (run before writing)
- **Disqualifier:** cases judged against the text's own examples only (inert fixture) do not count
- **Consumers:** T4 (specify reads the row), T6, T7
- **Review:** `checklist` — conditional prompt text
- **Done:** 5 cases recorded with the sentence each was decided by
- **Skills:** `cognitive-doc-design`

### T4 — `/akili-specify`: Video Mode

- **Status:** [ ] · **Size:** M · **Depends on:** T1
- **Requirements:** FR-2 (both scenarios incl. `BUT`), FR-1 default scenario (absent row = software), NFR-1
- **Design:** §3 row 2; §9 rows 1–2; P-3
- **Scope:** a `### Video Mode` block after Bug Mode (trigger, load `video-production`, criteria via `acceptance-criteria.md`, storyboard-in-design rule, Bug+Video regression shape); Phase 2 conditional line beside the animation line; Step 3.2 skill-derivation clause; one Verification Checklist item (4 sites)
- **Tests / Verification:** term walk FR-2 → shipped text; `grep -n "video-production" .claude/commands/akili-specify.md` → exactly the 4 sites; every new line contains the `Deliverable: video` condition
- **Falsifier:** drop the Bug Mode regression sentence → FR-2 scenario 2 has no owner in the text → FAIL
- **Red run:** baseline `grep -c "Video Mode\|video-production" .claude/commands/akili-specify.md` → 0
- **Disqualifier:** a presence-grep alone; the term walk is the gate
- **Consumers:** T5 (task skill lists), T6, T7
- **Review:** `full` — largest command edit, cross-mode interaction with Bug Mode
- **Done:** walk table in `execution.md`
- **Skills:** `cognitive-doc-design`

### T5 — Leader skill rule

- **Status:** [ ] · **Size:** XS · **Depends on:** T1
- **Requirements:** FR-3 (scenario 1 incl. `AND IT MUST`; scenario 2 quiet-tree clause by reference to the bridge), NFR-1
- **Design:** DD-5; P-3, P-13
- **Scope:** `.claude/templates/leader.md:25` — add "video deliverable → `video-production`" to the swap-in examples (1 site, inside section `primary-instructions`)
- **Tests / Verification:** **first step — settle P-13:** `npm test` after the edit; `agents-doctor` migratePersona tests green
- **Falsifier:** insert the clause as a new numbered item → migratePersona extent test (`test/agents-doctor.test.js` ~:1008) changes reading → observe red, revert to in-bullet form
- **Red run:** n/a — single in-bullet clause; P-13 settles by the green run
- **Disqualifier:** a green `npm test` on a stale `node_modules` or a partial run (`--test-name-pattern`) is not the gate
- **Consumers:** `test/agents-doctor.test.js` (reads the real template), `.claude/templates/digests.json` (refreshed by the next release, not here)
- **Review:** `checklist` — one clause, but persona drift implications
- **Done:** `npm test` exit 0 quoted; P-13 row flipped to verified in `design.md`
- **Skills:** none beyond defaults

### T6 — `/akili-test`: render-evidence suite

- **Status:** [ ] · **Size:** S · **Depends on:** T1
- **Requirements:** FR-6 (both scenarios incl. `BUT`), FR-4 (stop at test time), NFR-1
- **Design:** §3 row 4; P-8
- **Scope:** Phase 1 step 1 suite list gains "render evidence (`Deliverable: video`, per `video-production`)"; the no-infrastructure STOP bullet names missing HyperFrames as the same STOP (2 sites)
- **Tests / Verification:** term walk FR-6; scenario walk "28.9 s vs 30 s ± 0.5" against `render-evidence.md` + the shipped lines
- **Falsifier:** remove the `ffprobe` duration comparison from `render-evidence.md` → the drift scenario passes on `check` alone → FAIL
- **Red run:** baseline `grep -c "render evidence\|video-production" .claude/commands/akili-test.md` → 0
- **Disqualifier:** n/a beyond the walk
- **Consumers:** `.claude/templates/tester.md` — read, not edited (Tester loads the skills the Leader assigns)
- **Review:** `checklist`
- **Done:** walk recorded
- **Skills:** `cognitive-doc-design`

### T7 — `/akili-validate`: build gate + final look

- **Status:** [ ] · **Size:** S · **Depends on:** T1
- **Requirements:** FR-7 (scenario incl. MUST NOT PASS without the look), NFR-1
- **Design:** §3 row 5; §9 last row
- **Scope:** Phase 3 — `hyperframes check` as the build-integrity command for video; Phase 6 — final look (HITL / T6) against each acceptance criterion and the storyboard (2 sites)
- **Tests / Verification:** term walk FR-7; check the T6 route names the registry's *Cross-host dispatch* as specify already does
- **Falsifier:** make the final look "recommended" → FR-7's MUST NOT PASS clause has no owner → FAIL
- **Red run:** baseline `grep -c "Deliverable: video" .claude/commands/akili-validate.md` → 0
- **Disqualifier:** n/a
- **Consumers:** none
- **Review:** `checklist`
- **Done:** walk recorded
- **Skills:** `cognitive-doc-design`

### T8 — Docs surfaces

- **Status:** [ ] · **Size:** S · **Depends on:** T1–T7
- **Requirements:** FR-10 (docs clauses), FR-9 (README restatement), FR-8 (truthful index row)
- **Design:** §4 docs row; P-6
- **Scope:** `docs/skills/video-production.md` (Purpose + attribution / Use When / Binding / Best Paired Commands / Source); `docs/skills/README.md` row; `README.md` skill list + line 151 restatement; `AGENTS.md` Skill Usage bullet; `docs/flow.md` conditional list
- **Tests / Verification:** quote-check every clause against HEAD (KZ-002); FR-9 phrase-family grep re-run over all five files
- **Falsifier:** a README claim "installs HyperFrames" → quote-check finds no installer code → FAIL
- **Red run:** n/a — docs
- **Disqualifier:** a clause checked against the design instead of the shipped text
- **Consumers:** none
- **Review:** `checklist`
- **Done:** each claim has its HEAD citation in `execution.md`
- **Skills:** `cognitive-doc-design`

### T9 — Fixtures, CHANGELOG, package verification

- **Status:** [ ] · **Size:** S · **Depends on:** T8
- **Requirements:** FR-10 (CHANGELOG + fixtures), NFR-5
- **Design:** P-4
- **Scope:** `test/install-cursor.test.js` counts (files, dirs, ops + comments) set to the **measured** values; `CHANGELOG.md` Unreleased entry (no version bump)
- **Tests / Verification:** `npm test`; `npm run verify:cli`; `npm run pack:dry-run` (diff vs baseline lists only `video-production/` files added); `git diff --check`
- **Falsifier:** leave 199 in place → `npm test` must go red on the `:243-249` assertion; the actual message is observed and quoted at the red run, not predicted here (Falsifiability item 8)
- **Red run:** run `npm test` after T1 and before the fixture edit; quote the red
- **Disqualifier:** counts typed from the plan instead of from `find … | wc -l`
- **Consumers:** `scripts/ci/install-layout-regression.js` (mirrors paths, not counts — read to confirm)
- **Review:** `checklist`
- **Done:** four commands exit 0, outputs quoted
- **Skills:** none beyond defaults

### T10 — Live smoke validation (HyperFrames installed project-scoped)

- **Status:** [ ] · **Size:** S · **Depends on:** T9
- **Requirements:** FR-4 (not-installed stop observed), FR-5 (telemetry off), FR-6 (evidence set produced), NFR-4 (Claude Code host only — others accepted risk)
- **Design:** DD-10; P-12, P-14
- **Scope:** in a scratch dir: (1) confirm a session-free read of `video-production` stops when no `hyperframes` skill is in the project; (2) `npx skills add heygen-com/hyperframes` project-scoped (core set) — **asks the user first** (network + third-party install); (3) build a 5-second smoke composition per the installed skills, `HYPERFRAMES_NO_TELEMETRY=1 npx hyperframes check`, `snapshot --at`, `render --quality draft`, `ffprobe`; record P-14 host dirs
- **Tests / Verification:** evidence set per `render-evidence.md`; `ffprobe` duration within tolerance of the declared 5 s
- **Falsifier:** declare 5 s, render a 4 s composition → the duration comparison reports FAIL
- **Red run:** the falsifier above, executed once
- **Disqualifier:** a run that used the user's global (stale) skill copy instead of the project-scoped install; check `skills` resolution path in the output
- **Consumers:** none
- **Review:** `skip-eligible` — produces evidence only, no packaged file changes; claim to prove: `git diff --stat` shows only `docs/specs/changes/video-deliverable-track/`
- **Done:** evidence in `execution.md`; no global install touched
- **Skills:** `video-production`, `hyperframes` (environment)

---

## Coverage Map (scenario / clause → task)

| Requirement clause | Task |
|---|---|
| FR-1 video, software-mentions-video (`BUT`), orthogonal (`AND IT MUST` ≤ 1 question) | T3 |
| FR-1 default (absent row = software) | T3 (propose text), T4 (specify read) |
| FR-2 criteria + defect table | T1 (`acceptance-criteria.md`), T4 |
| FR-2 Bug Mode on video (`BUT` not a unit test) | T1 (`render-evidence.md`), T4 |
| FR-3 skills assigned + deviation rule | T5, T1 (routing) |
| FR-3 render approval-gated, quiet tree (`BUT`) | T1 (concurrency note), T7 (render after look) |
| FR-4 not installed (`BUT` no vendoring / no hand-built pipeline) | T1, T10 |
| FR-4 software unaffected | T2–T7 (NFR-1 condition on every line), T9 (`npm test`) |
| FR-5 telemetry off, no feedback | T1, T10 |
| FR-6 evidence set, duration drift (`BUT`), missing at test time | T1, T6, T10 |
| FR-7 final look MUST precede PASS | T1, T7 |
| FR-8 frontmatter, no third-party text, name (`BUT`) | T1, T2 (assignment row), T8 (index row) |
| FR-9 restatements agree | T2, T8 |
| FR-10 docs, CHANGELOG, fixtures | T8, T9 |
| NFR-1…5 | T2–T7 · T1 · T1 · T1 · T9 |
