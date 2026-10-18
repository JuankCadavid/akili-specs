# Tasks: Video Deliverable Track

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/video-deliverable-track` |
| Depth | Standard |
| Tasks | 12 · est. ~650 LOC (prose) · single PR (local commits only this cycle) |
| Commit prefix | `[SPEC:changes/video-deliverable-track]` |
| Pinned upstream | `heygen-com/hyperframes@01adadb9` — every HyperFrames claim is raw-checked against it (KZ-changes--cursor-install-target-1) |
| Revision | Round 1 after Judgment Day (`judgment.md`): T2 split per file, quick task added, fixture/doc consumers added, falsifiers re-stated |

**Order:** T1 → (T2 ∥ T3 ∥ T4 ∥ T5 ∥ T7 ∥ T8 ∥ T9) → T6 (alone, so its scoped suite runs on a quiet tree) → T10 → T11 → T12.
T2–T9 each edit one different file; each depends on T1 for the skill name and layout.

**Quiet-tree rule:** no `npm test` / `npm run …` while a delegated agent is active (AGENTS.md Concurrency).
During the T2–T9 window, a task that needs a test runs a **scoped** suite only after its own Implementer
has returned and no other agent is running; the full suite runs at T11.

**Falsifier convention (Falsifiability item 8):** for text that does not exist yet, the falsifier is a
mutation **executed against the post-change text** in the task's Done step and its observed output quoted;
nothing below states its result in advance. Baseline greps that can only return 0 are labelled
**precondition**, not red runs.

**Shared pre-review sweep (every rules-text task):** run the obligation's phrase-family grep over every
in-scope file and read every hit before the Reviewer (KZ-changes--kaizen-loop-closure-2).

---

### T1 — Author the `video-production` skill

- **Status:** [x] · **Size:** M · **Depends on:** none
- **Requirements:** FR-3 (routing to `hyperframes`), FR-4 (both scenarios + `AND IT MUST` both router names), FR-5, FR-6/FR-7 evidence text, FR-2 criteria and Bug-on-video shape, FR-8 (all clauses), NFR-2, NFR-3, NFR-4
- **Design:** §4, §9, DD-2, DD-3, DD-6, DD-8, DD-9, DD-11, DD-12; P-7…P-11, P-14, P-18, P-19
- **Scope:** `SKILL.md` (frontmatter per governance original-authorship variant; availability gate accepting `hyperframes` or a plugin-namespaced router; install routes for the 5 hosts, project-scoped dirs only; phase map; privacy defaults; draft vs delivery render; quiet-tree note; deferral table → `hyperframes`, `hyperframes-core`, `hyperframes-cli`, `hyperframes-animation`, `hyperframes-creative`, `media-use`, `embedded-captions`); `references/acceptance-criteria.md`; `references/render-evidence.md` (`format.duration` vs target ± tolerance and vs root `data-duration`)
- **Tests / Verification:** (1) frontmatter walk vs `docs/skills/governance.md` schema; (2) `grep -n -o -E "npx hyperframes [a-z-]+( [a-z-]+)?" -r .claude/skills/video-production` — every **instructed** command ∈ NFR-2's instruct list; outward actions appear only inside the consent rule; each verified in the clone; (3) `find .claude/skills/video-production -type f -exec cat {} + | wc -c` ≤ 20000 and `find .claude/skills/video-production -type f | wc -l` = 3; (4) `grep -ril "heygen" .claude/skills/video-production` hits only attribution/install lines; (5) 5 distinctive upstream sentences `grep -F` → 0 hits
- **Falsifier:** post-change, append an instruction line "run `npx hyperframes lambda render`" outside the consent rule → check (2) must flag it; set `name: hyperframes-bridge` → FR-8 walk must fail. Observe both, quote, revert
- **Red run:** n/a — new files
- **Disqualifier:** a subcommand "verified" from memory, not from the clone; a size measured with `du` (blocks)
- **Consumers:** none (new skill)
- **Review:** `full` — new packaged skill, the core of the change
- **Done:** 3 files; five checks + two falsifiers with outputs quoted in `execution.md`
- **Skills:** `cognitive-doc-design`, `brainstorming`

### T2 — Governance amendment

- **Status:** [ ] · **Size:** S · **Depends on:** T1
- **Requirements:** FR-9 (both clauses), FR-8 (assignment row)
- **Design:** DD-7; P-2, P-6
- **Scope:** `docs/skills/governance.md` — new clause under *Environment-provided skills*; rule 2 (:27-29) narrowed; *Current assignment* `conditional` row gains `video-production (video deliverables)` (3 sites, 1 file)
- **Tests / Verification:** the P-6 phrase-family grep over governance; every on-topic hit states FR-9's rule
- **Falsifier:** post-change, restore the old :29 sentence → the grep must show an unconditional "every command must still work without it" beside the new clause; observe, quote, revert
- **Red run:** baseline (observed at `22e990b`): `governance.md:27` "Availability is per-developer…", `:29` "…every command must still work without it." — both unconditional
- **Disqualifier:** a sweep keyed on "hyperframes" (rule 2 never names it)
- **Consumers:** `README.md:151,828`, `akili-constitution.md:730-731`, `docs/flow.md` (T3, T10)
- **Review:** `checklist`
- **Done:** sweep output quoted; rule 1 ("Never copy one into `.claude/skills/`") unchanged
- **Skills:** `cognitive-doc-design`

### T3 — Constitution Step 8D alignment

- **Status:** [x] · **Size:** XS · **Depends on:** T1
- **Requirements:** FR-9 (restatement agrees)
- **Design:** DD-7; P-6
- **Scope:** `.claude/commands/akili-constitution.md:726-731` — the `hyperframes` row note names `video-production` as the AKILI route, and "must still be able to run every command" gains the video-spec stop (1–2 sites)
- **Tests / Verification:** phrase-family grep over the file
- **Falsifier:** post-change, delete the added qualifier → grep must show the unconditional form; observe, quote, revert
- **Red run:** baseline (observed at `22e990b`): `akili-constitution.md:730-731` "a teammate without that tool must still be able to run every command"
- **Disqualifier:** n/a
- **Consumers:** none
- **Review:** `checklist`
- **Done:** sweep quoted
- **Skills:** `cognitive-doc-design`

### T4 — `/akili-propose`: Deliverable field

- **Status:** [x] · **Size:** S · **Depends on:** T1
- **Requirements:** FR-1 (all six scenarios incl. each `BUT` / `AND IT MUST`), NFR-1 carve-out
- **Design:** DD-1, DD-4; §3 row 1; §5; P-15
- **Scope:** Step 1 Deliverable block (signals, default, neither-kind rule, shared question, Trivial × video stays in propose); Step 2 Document Control item; Visual Reference note; Review Checklist item; Report To User item; Next Step note that Video Mode applies (6 sites)
- **Tests / Verification:** held-out walkthrough against the shipped text with its examples stripped: (a) "make a 30s launch video" → video; (b) "fix the video player component" → software; (c) "the rendered promo cuts the last second" → Bug + video, ≤ 1 question; (d) "add subtitles to interview.mp4" → video (not cited in text); (e) "build a pitch deck" → software + noted kind (not cited); (f) "change the title colour in our promo" → Trivial + video → Lite proposal, not quick
- **Falsifier:** post-change, delete the "requested deliverable, not a word in passing" sentence → case (b) must lose its deciding sentence; observe, quote, revert
- **Red run:** precondition: `grep -c "Deliverable" .claude/commands/akili-propose.md` → 0 at `22e990b`
- **Disqualifier:** a case judged against the text's own examples (inert fixture)
- **Consumers:** `docs/commands/akili-propose.md:46,60` (T10)
- **Review:** `checklist`
- **Done:** 6 cases, each with the sentence that decided it
- **Skills:** `cognitive-doc-design`

### T5 — `/akili-specify`: Video Mode

- **Status:** [x] · **Size:** M · **Depends on:** T1
- **Requirements:** FR-2 (both scenarios incl. `BUT`), FR-1 default + "reaches every reader" scenarios, FR-3 (owner of the per-task skill list), NFR-1
- **Design:** §3 row 2; §5; §9 rows 1–2; DD-5; P-3, P-15, P-21
- **Scope:** `### Video Mode` block after Bug Mode (trigger, load `video-production`, copy `Deliverable` into `requirements.md` Document Control, criteria via `acceptance-criteria.md`, storyboard-in-design rule, Bug × video regression shape); Phase 2 line beside the animation line; Step 3.2 clause: every task of a video spec lists `video-production`; Verification Checklist item (4 sites)
- **Tests / Verification:** term walk of FR-2, FR-1 (default, reaches-every-reader) and FR-3 against the shipped text; every new line carries the `Deliverable: video` condition
- **Falsifier:** post-change, drop the copy-into-requirements sentence → FR-1 "reaches every reader" must have no owning sentence; drop the Bug × video sentence → FR-2 scenario 2 must lose its owner. Observe, quote, revert
- **Red run:** precondition: `grep -c "Video Mode\|video-production" .claude/commands/akili-specify.md` → 0
- **Disqualifier:** a presence-grep alone; the term walk is the gate
- **Consumers:** `docs/commands/akili-specify.md:76` (T10)
- **Review:** `full` — largest command edit, interacts with Bug Mode
- **Done:** walk table in `execution.md`
- **Skills:** `cognitive-doc-design`

### T6 — Leader skill rule

- **Status:** [ ] · **Size:** XS · **Depends on:** T1
- **Requirements:** FR-3 (example clause; the rule itself is owned by T5)
- **Design:** DD-5; P-3, P-13, P-17
- **Scope:** `.claude/templates/leader.md:25` — add "video deliverable → `video-production`" to the swap-in examples, inside the existing bullet; items 1–4 keep their numbers
- **Tests / Verification:** `node --test test/agents-doctor.test.js` — scoped, after this Implementer returns, no other agent active
- **Falsifier:** post-change, renumber item 4 to 5 → the scoped suite must go red on the `4\. \*\*Rework Loop` extent test (P-13, judge B observed test 62); observe, quote, revert
- **Red run:** n/a — P-13 already settled by both judges
- **Disqualifier:** a partial run via `--test-name-pattern`; a run while another agent edits the tree
- **Consumers:** `test/agents-doctor.test.js` (reads the real template); `.claude/templates/digests.json` (refreshed by the next release, not here)
- **Review:** `checklist`
- **Done:** scoped suite exit 0 + falsifier red quoted
- **Skills:** none beyond defaults

### T7 — `/akili-test`: render-evidence suite

- **Status:** [ ] · **Size:** S · **Depends on:** T1
- **Requirements:** FR-6 (both scenarios incl. `BUT`), FR-4 at test time, NFR-1
- **Design:** §3 row 4; DD-11, DD-12; P-8, P-15
- **Scope:** Phase 1 step 1 suite list gains "render evidence (`Deliverable: video`, per `video-production`)"; the no-infrastructure STOP bullet names missing HyperFrames as the same STOP (2 sites)
- **Tests / Verification:** term walk FR-6; scenario walk "28.9 s vs 30 s ± 0.5" through the shipped lines + `render-evidence.md`
- **Falsifier:** post-change, remove the target-duration comparison from `render-evidence.md` → the drift scenario must pass on `check` alone (walk shows no failing sentence); observe, quote, revert
- **Red run:** precondition: `grep -c "render evidence\|video-production" .claude/commands/akili-test.md` → 0
- **Disqualifier:** n/a beyond the walk
- **Consumers:** `.claude/templates/tester.md` — read, not edited; `docs/commands/akili-test.md` (T10)
- **Review:** `checklist`
- **Done:** walk recorded
- **Skills:** `cognitive-doc-design`

### T8 — `/akili-validate`: gate, final look, delivery render

- **Status:** [ ] · **Size:** S · **Depends on:** T1
- **Requirements:** FR-7 (incl. MUST NOT PASS without the look; loads the bridge), FR-3 render-after-approval, NFR-1
- **Design:** §3 row 5; §9 last two rows; DD-11; P-15
- **Scope:** Phase 0 or 3 — load `video-production`; Phase 3 — `hyperframes check` as build integrity; Phase 6 — final look (human check at the HITL pause, or a tier-T6 Multimodal review routed per the registry's *Cross-host dispatch*, as `/akili-specify`'s defect-class rule already states) against each criterion and the storyboard, then the delivery render (2–3 sites; validate has no HITL anchor today — the text is new)
- **Tests / Verification:** term walk FR-7 and FR-3 scenario 2
- **Falsifier:** post-change, make the final look "recommended" → FR-7's MUST NOT PASS must lose its owner; observe, quote, revert
- **Red run:** precondition: `grep -c "Deliverable: video" .claude/commands/akili-validate.md` → 0
- **Disqualifier:** n/a
- **Consumers:** `docs/commands/akili-validate.md` (T10)
- **Review:** `checklist`
- **Done:** walk recorded
- **Skills:** `cognitive-doc-design`

### T9 — `/akili-quick`: escalate video edits

- **Status:** [ ] · **Size:** XS · **Depends on:** T1
- **Requirements:** FR-1 Trivial × video scenario (`AND` quick escalates, `BUT` no composition edit without evidence)
- **Design:** §3 quick row; DD-4
- **Scope:** `.claude/commands/akili-quick.md` escalation gate — one line: an edit to a video composition → `/akili-propose` (1 site)
- **Tests / Verification:** walk the gate with "change the title colour in promo/index.html" → escalates; "fix a typo in the README" → unchanged quick path
- **Falsifier:** post-change, remove the line → the first case must pass the triviality gate; observe, quote, revert
- **Red run:** baseline (observed at `22e990b`): `akili-quick.md:41` admits "color/spacing/style-token tweaks" with no deliverable check, so the first case passes today
- **Disqualifier:** n/a
- **Consumers:** `docs/commands/akili-quick.md` (T10)
- **Review:** `checklist`
- **Done:** both cases recorded
- **Skills:** none beyond defaults

### T10 — Docs surfaces

- **Status:** [ ] · **Size:** M · **Depends on:** T1–T9
- **Requirements:** FR-10 (docs clauses), FR-9 (README restatements), FR-8 (truthful index row)
- **Design:** §4 docs row; P-6, P-15, P-16
- **Scope:** `docs/skills/video-production.md` (new); `docs/skills/README.md` row; `README.md` skill list + `:151` + `:828`; `AGENTS.md` Skill Usage bullet; `docs/flow.md` conditional list; `docs/commands/akili-{propose,specify,test,validate,quick}.md`; `docs/cli.md:183,195,216` counts
- **Tests / Verification:** quote-check every clause against HEAD (KZ-002); P-6 phrase-family grep re-run; `grep -rn "24 packaged skills" docs README.md` → 0
- **Falsifier:** post-change, write "AKILI installs HyperFrames" into the doc page → quote-check must find no installer code backing it; observe, quote, revert
- **Red run:** baseline: `grep -n "24 packaged skills" docs/cli.md` → 3 hits (observed at `22e990b`)
- **Disqualifier:** a clause checked against the design instead of the shipped text
- **Consumers:** none
- **Review:** `checklist`
- **Done:** each claim with its HEAD citation in `execution.md`
- **Skills:** `cognitive-doc-design`

### T11 — Fixtures, CHANGELOG, package verification

- **Status:** [ ] · **Size:** S · **Depends on:** T10
- **Requirements:** FR-10 (CHANGELOG + fixtures), NFR-5; P-22 shared-state grep
- **Design:** P-4, P-16, P-22
- **Scope:** `test/install-cursor.test.js` literal (`:245`) and comments (`:216,232,340,387`) set to measured values; `test/fixtures/doctor-codex-baseline.txt` skill list gains `video-production` in the installer's order; `CHANGELOG.md` Unreleased entry (no version bump)
- **Tests / Verification:** first `npm test` **before** the fixture edits — quote the reds as observed; then edit; then `npm test`, `npm run verify:cli`, `npm run pack:dry-run` (only `video-production/` added under `.claude/skills`), `git diff --check`; `grep -rn "Deliverable: video" .claude` matches P-22's enumeration
- **Falsifier:** the pre-edit `npm test` run above is the red; post-edit, re-insert the old literal → red again; observe, quote, revert
- **Red run:** the pre-edit run (judge B observed `not ok 65`, `not ok 75` in a scratch copy — to be re-observed here)
- **Disqualifier:** counts typed from the plan instead of `find … | wc -l`; a run during any agent activity
- **Consumers:** `scripts/ci/install-layout-regression.js` (paths, not counts — read to confirm)
- **Review:** `checklist`
- **Done:** all commands exit 0, outputs quoted
- **Skills:** none beyond defaults

### T12 — Live smoke validation (project-scoped HyperFrames)

- **Status:** [ ] · **Size:** S · **Depends on:** T11
- **Requirements:** FR-4 (gate + install route), FR-5 (telemetry off), FR-6 (evidence set), NFR-4 (Claude Code host only — others accepted risk)
- **Design:** DD-10, DD-11; P-12, P-19, P-23
- **Scope:** in a scratch dir, **after asking the user** (network + third-party install): settle P-23 (Chrome); `npx skills add heygen-com/hyperframes --skill <core set>… --yes` without `-g` (project-scoped; never `npx hyperframes skills update`, which is global — P-24, amended 2026-10-18); a 5-second smoke composition per the installed skills; `HYPERFRAMES_NO_TELEMETRY=1` `check`, `snapshot --at`, `render --quality draft`, `ffprobe`; confirm the skill resolution path is the scratch project, not `~/.claude/skills`
- **Tests / Verification:** evidence set per `render-evidence.md`; `format.duration` within tolerance of 5 s and equal to `data-duration`
- **Falsifier:** declare 5 s, render a 4 s composition → the duration comparison must report FAIL; observe, quote
- **Red run:** the falsifier, executed once
- **Disqualifier:** a run resolved from the user's global (stale) skills
- **Consumers:** none
- **Review:** `skip-eligible` — evidence only; claim to prove: `git diff --stat` touches only `docs/specs/changes/video-deliverable-track/`
- **Done:** evidence in `execution.md`; no global install touched
- **Skills:** `video-production`, `hyperframes` (environment)

---

## Coverage Map (scenario / clause → task)

| Requirement clause | Task |
|---|---|
| FR-1 video, software-mentions-video (`BUT`), orthogonal (`AND IT MUST` ≤ 1 question) | T4 |
| FR-1 Trivial × video (Lite proposal; quick escalates; `BUT` no edit without evidence) | T4, T9 |
| FR-1 neither kind (`BUT` no Video Mode) | T4 |
| FR-1 default (absent row = software) | T4 (propose), T5 (specify read) |
| FR-1 reaches every reader (copy into `requirements.md`) | T5 |
| FR-2 criteria + defect table | T1, T5 |
| FR-2 Bug × video (`BUT` not a unit test) | T1, T5 |
| FR-3 per-task skill list + Leader assigns + deviation rule | T5 (rule), T6 (example) |
| FR-3 delivery render after approval; no render during agent activity (`BUT`) | T1, T8 |
| FR-4 not installed (`BUT` no vendoring/pipeline; `AND IT MUST` both router names) | T1, T12 |
| FR-4 software unaffected | T2–T9 (NFR-1), T11 (`npm test`) |
| FR-5 telemetry off, no feedback | T1, T12 |
| FR-6 evidence set with draft render; duration drift (`BUT`); missing at test time | T1, T7, T12 |
| FR-7 loads bridge; final look MUST precede PASS | T1, T8 |
| FR-8 frontmatter, no third-party text, name (`BUT`) | T1, T2, T10 |
| FR-9 restatements agree | T2, T3, T10 |
| FR-10 docs, `docs/commands`, `docs/cli.md`, CHANGELOG, both fixtures | T10, T11 |
| NFR-1 · NFR-2 · NFR-3 · NFR-4 · NFR-5 | T2–T9 · T1 · T1 · T1 · T11 |
