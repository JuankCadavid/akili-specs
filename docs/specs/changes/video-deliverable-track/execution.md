# Execution Log: Video Deliverable Track

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/video-deliverable-track` |
| Depth | Standard |
| Approval Mode | `gated` (inherited from `requirements.md`); user run instruction 2026-10-18: "Ejecuta T1 a T11 con commits locales. Antes de T12 (instala HyperFrames desde la red) detente y pide permiso. Sin push, release, tag ni publish." — continue gates T1→T11 pre-authorized; HALT, Pivot, budget tripwire, waiver and an unearned skip still stop |
| Started | 2026-10-18 |
| Started at | `877e393` (clean tree) |
| Budget (design §12) | 12 tasks · ~650 LOC added / ~25 changed · 13 review rounds expected; tripwire 14 tasks / ~850 LOC / 20 rounds — compared at every task's finalize |
| Leader | Claude Code session model Opus 5.5 (`claude-opus-5-5`). Model checkpoint: this repo's `AGENTS.md` has no `## Model Routing` registry section; `docs/model-routing.md` default maps T1 → `opus` — session matches, pass |
| Spawn path | No Step 8E wrappers (`.claude/agents/` absent) → fallback sub-prompt path; each worker reads its persona from `.agents/`. `.agents/` is gitignored (`.gitignore:8`) and absent in this worktree; copied from the main checkout `~/Development/sdd-jc-methodology/.agents/` (untracked, ignored — no git effect). `node bin/akili.js doctor --agents` here (2026-10-18): every section `CURRENT` except `shared-file-discipline` UNLOCATED in leader/implementer — "No persona drift blocking CI" |
| Models | Implementer `sonnet` (T2), Reviewer `opus` (T3 per precedent, ≠ Implementer) |
| Upstream clone | `/private/tmp/hf-src/repo` at `01adadb9` (verified `git rev-parse`, clean) |
| Environment pre-check (Step 2.1) | T1–T11 need no running stack. T12 needs network + third-party install: stop and ask the user first |
| Commits | Local only, `[SPEC:changes/video-deliverable-track]` prefix; no push, release, tag or publish |

## 2. Task Execution History

### T1 — Author the `video-production` skill

**Attempt 1** (2026-10-18)
- Files changed: `.claude/skills/video-production/SKILL.md` (new, 6,418 B), `references/acceptance-criteria.md` (new, 2,181 B), `references/render-evidence.md` (new, 2,242 B) — total 10,841 B, 3 files
- Skills: `cognitive-doc-design`, `brainstorming` (as tasks.md lists — no deviation). Effort: high
- Implementer verification: (1) frontmatter = original-authorship variant (`license: MIT`, `author`, `inspired-by` HyperFrames by HeyGen Apache-2.0 + URL, `binding: conditional`, `version`); (2) `npx hyperframes` grep → only `check`, `snapshot --at`, `render --quality` (draft/delivery), `preview`, `skills check`, `skills update`; outward names only at `SKILL.md:72` (consent rule); (3) 3 files, 10,841 B (`wc -c`); (4) `heygen` at `SKILL.md:7` (inspired-by), `:31` (install), `:108` (attribution); (5) 7 distinctive upstream sentences `grep -F` → 0 hits
- Falsifiers executed: F1 appended ``Run `npx hyperframes lambda render` after the check.`` → check (2) printed `109:npx hyperframes lambda render`, flagged; reverted. F2 `name: hyperframes-bridge` → walk printed `FR-8 walk FAILS: name=hyperframes-bridge`; reverted
- Not Done / Assumptions (verbatim, condensed): "The project-scope dirs per host (P-11) come from the design's Premise Ledger and were not re-verified… The 'from the project root' and 'project scope' wording for `skills update`… is my reading. I did not confirm that `skills update` writes to a project dir rather than a global one." / plugin route described generically / no render run — assumptions only, no owed item → no continuation
- Evidence re-run (Leader-inline): **VERIFIED** — 3 files, 10,841 B, identical grep hits. Leader probe of the assumption at source: **refuted** — `npx hyperframes skills update` is global (`skills.ts:97-119`) → Pivot Record T1 below
- Reviewer (opus, install-route scope excluded as under amendment): **PASS** — "every obligation that falls to the skill files is in the shipped text"; upstream facts re-checked in the clone (`snapshot.ts:995`, `render.ts:159,177-182`, `skills.ts:27-29,589,710`, `policy.ts:32`, `feedback.ts:38,183,239`, cli SKILL.md:126-128, README.md:47-58)
- ADVISORY (recorded, not actioned — advisories never become tasks): (a) excluded item — `SKILL.md:30` "from the project root" / `:33` "never suggest a global directory" vs global `skills update`; handled by the Pivot. (b) `SKILL.md:101` maps "Burned-in captions" to `embedded-captions`; upstream scopes it to existing talking-head footage, composition captions go via the router (`hyperframes/SKILL.md:66,108`). (c) `SKILL.md:100` puts "audio, voice" under `media-use`; upstream routes mixing/voice-over to `hyperframes-audio` (router :109). Mitigated by the skill's "installed skill wins" line. (d) FR-4 says "the install route for that host"; the skill prints all routes (superset)
- runtime events: none

## Pivot Record: T1

| Field | Value |
|---|---|
| Date | 2026-10-18 |
| Trigger | Implementer assumption probed by the Leader at source |
| Blocker | design §9 / FR-4 named `npx hyperframes skills update` as the project-scoped agent install route; upstream `packages/cli/src/commands/skills.ts:97-119` always passes `--global --agent claude-code universal --copy --full-depth --yes` and mirrors to every other installed agent's global dir — contradicts §9 "project-scoped only", DD-10 and T12 |
| Verified alternative | skills CLI `1.7.2` `dist/cli.mjs:4887-4903`: `npx skills add <src>` without `-g` → project scope (default under `--yes`); `--skill` at `:5955` |
| Alternatives offered | Re-label (recommended) · drop `skills update` · accept global |
| User decision | **Re-label** (AskUserQuestion, 2026-10-18): agent route = `npx skills add heygen-com/hyperframes --skill <name>… --yes` without `-g`; `npx hyperframes skills update` kept, labelled a global install needing explicit consent; T12 uses the project route |
| Spec edits | `requirements.md` FR-4 "Not installed" THEN line; `design.md` §9 availability/install paragraph, P-19 (struck clause), new P-24, ledger counts (21 verified, 24 rows); `tasks.md` T12 Scope. `proposal.md:173` and `judgment.md:32` left as historical records |
| Correction closure | Forward grep `skills update|project-scoped|global` over the spec folder — remaining hits are DD-8 (command list, unaffected), DD-10 (already "never globally" — now consistent), NFR-2 (instruct list, unaffected), T1 Scope "project-scoped dirs only" (consistent), T12 title/Done (consistent). Backward: §9 is cited by T1 and P-14 — both consistent. `git diff` removed lines: exactly the four superseded statements + old counts line |
| ADR affected | none (no TRD in this repo) |
| Resume | T1 attempt 2 re-issued with the amended text (install-routes delta only) |

### T1 — closing entry

| Field | Value |
|---|---|
| Final status | **PASS** (Reviewer `STATUS: PASS`, attempt 2, post-Pivot) |
| Date | 2026-10-18 |
| Implementer attempts | 2 (attempt 2 = Pivot re-issue, not a FAIL — no rework attempt consumed) |
| Review intensity | Reviewer **owed**: `Review: full`; override (a) — the skill defines obligations other agents execute |
| Requirements covered | FR-2…FR-8 (skill side), NFR-2, NFR-3, NFR-4; FR-4 as amended 2026-10-18 |

**Attempt 2** (2026-10-18)
- Files changed: `.claude/skills/video-production/SKILL.md` only — install-routes table (:26-32), :34 (global-dir exception), :67 (`skills check` row). Total 3 files, 11,549 B
- Skills: `cognitive-doc-design`. Effort: high (post-Pivot)
- Implementer verification: 3 files; 11,549 B; `npx hyperframes` hits = check, snapshot, render, preview, skills check, plus `skills update` only at :32 (global, consent-gated); `skills update|global|-g` hits :30, :32, :34, :67 — all consistent with §9/P-24; `heygen` only on install/attribution lines. Core `--skill` list = upstream `FALLBACK_CORE_SKILLS` (`packages/cli/src/utils/skillsManifest.ts:150-161`, 10 names)
- Falsifier executed: route 4 relabelled "`npx hyperframes skills update` from the project root" → `grep -n "skills update"` → `32:| Core set | \`npx hyperframes skills update\` from the project root |` (unlabelled project-root claim contradicting P-24); reverted
- Not Done / Assumptions (verbatim, condensed): "I did not re-read the spec text for §9, P-24, P-19 or FR-4. I worked from your brief's description of the amendment." / "The `--skill` list is generated from upstream's pinned fallback core, not from the live manifest." — assumptions only; the Reviewer audited against the amended source text
- Evidence re-run (Leader-inline): **VERIFIED** — 3 files, 11,549 B, same hits; `FALLBACK_CORE_SKILLS` read at source
- Reviewer (opus, resumed with attempt-1 context): **PASS** — route form matches §9/FR-4 (`--skill <name>… --yes` without `-g`); scope verified in skills CLI 1.7.2 (`cli.mjs:4887-4890`, `:5941-5955`); global behaviour confirmed (`skills.ts:113-120`, :97-101); FR-4 obligations, NFR-3/4 intact; execute-time edit checks (design §9 as amended, FR-4 THEN as amended) conform
- ADVISORY (recorded, not actioned): (e) the project route passes no `--agent`; under `--yes` skills CLI 1.7.2 installs to every detected agent plus universal (`cli.mjs:4875-4879`), or all agents when none detected (:4863-4865) — `--agent <host-id>` would make it host-specific. (f) without `--copy` the CLI symlinks (:4906); `skills check` may then read skills as not current. (b)/(c) carried from attempt 1 (captions → `embedded-captions` scope; voice/mixing → `hyperframes-audio`)
- **Forward pointer → T12:** advisories (e) and (f) bear on the live smoke run — T12 should observe which agent dirs the project route populates and what `skills check` reports; record, do not widen T12
- runtime events: none
- spawns: implementer 16 calls, 110 539 tokens, ended partial (assumptions only); reviewer 12 calls, 91 815 tokens, ended complete (PASS, scope-excluded); implementer (attempt 2) 11 calls, 68 321 tokens, ended partial (assumptions only); reviewer (resumed) 4 calls, 99 613 tokens cumulative, ended complete
- decisions made: execute-time spec edits — see Pivot Record T1 (requirements FR-4 THEN; design §9, P-19, P-24, counts; tasks T12 Scope), user-approved
- Running totals vs budget: tasks 1/12 · LOC ~188 skill lines + 11/7 spec lines (~199 / ~650) · review rounds 2 (budget 2 for T1; total 2/13, tripwire 20) — within budget

### T3 — Constitution Step 8D alignment

| Field | Value |
|---|---|
| Final status | **PASS** (Reviewer `STATUS: PASS`, attempt 1) |
| Date | 2026-10-18 |
| Implementer attempts | 1 (parallel wave T2–T5; disjoint files, no build) |
| Review intensity | Reviewer **owed**: verification is a grep plus on/off-topic judgment (condition 2 fails); override (a) — restates a rule other readers execute |
| Requirements covered | FR-9 (restatement agrees) |

- Files changed: `.claude/commands/akili-constitution.md` (+5/−2; Step 8D item 3, two sites)
- Skills: `cognitive-doc-design` (as listed). Effort: low
- New text: "…launch-video content; its row's note names `video-production` as the AKILI route (the packaged bridge skill that carries the availability gate)." and "…must still be able to run every command, except that a spec whose `Deliverable` selects the skill (`Deliverable: video`) stops at `video-production`'s availability gate."
- Implementer verification: phrase-family grep → `:732` per-developer (on-topic), `:733` "run every command, except that…" (on-topic), `:859` Antigravity `subagent: true` (off-topic; P-6's `:856` before the shift)
- Red run (baseline at `22e990b`): `:730-731` unconditional "must still be able to run every command"
- Falsifier executed: qualifier removed → grep `733: run every command. Never copy the skill into the repository...` (unconditional); restored
- Not Done / Assumptions (verbatim, condensed): "I wrote 'stops at `video-production`'s availability gate' from your brief and did not re-read FR-9 or DD-7 at source. The wording of 'the AKILI route' in the first site is mine." — assumptions only; the Reviewer checked both against FR-9 / design §9
- Evidence re-run (Leader-inline): **VERIFIED** — same diff, same three grep hits
- Reviewer (opus): **PASS** — row note matches design §9 (row stays the availability note, bridge owns the phase mapping); restated rule matches FR-9 "Restatements agree"; no unqualified hit left in the file. ISSUES: none. ADVISORY: none
- runtime events: none
- spawns: implementer 7 calls, 63 239 tokens, ended partial (assumptions only); reviewer 4 calls, 63 604 tokens, ended complete
- Running totals vs budget: tasks 2/12 · LOC ~213 · review rounds 3/13 (tripwire 20) — within budget

### T2 — Governance amendment (in progress)

**Attempt 1** (2026-10-18)
- Files changed: `docs/skills/governance.md` (+12/−3): "Three rules" → "Four rules"; rule 2 narrowed ("every command still runs without it. The one narrowing is rule 4…"); new rule 4 (selector + gate); `conditional` row gains `video-production` (video deliverables)
- Skills: `cognitive-doc-design`. Effort: medium
- Implementer verification: P-6 sweep → `:27` per-developer (on-topic), `:29` narrowed rule (on-topic), `:52` `core` rule of thumb (off-topic). Falsifier executed: old sentence restored → `29: ...every command must still work without it.` directly above rule 4; reverted
- Evidence re-run (Leader-inline): **VERIFIED**
- Reviewer (opus): **FAIL** — 1 issue, verbatim:
  > 1. **Discovered Issue:** Rule 4 is about *environment-provided* skills, but its example says the selector "picks it (today `Deliverable: video` …, which picks `video-production`)". `video-production` is the packaged, AKILI-authored bridge skill. It is not environment-provided, and the same file's *Current assignment* table lists it as a shipped `conditional` skill. The environment-provided skill behind the gate is `hyperframes`: the router that design §9's availability gate checks for, either standalone or as plugin `/hyperframes:hyperframes`. As written, a reader concludes either that `video-production` is environment-provided, which contradicts the table and rule 3's "acceptance checklist applies only to skills we ship", or that the selector never reaches `hyperframes` at all. Either way, rule 4 does not precisely say *when a command may name* the environment-provided skill.
  > * **Violated Rule:** `requirements.md` FR-9 …; `requirements.md` §3 Glossary (Bridge skill vs Environment-provided skill); `design.md` §9.
  > * **Remediation Suggestion:** Rewrite the parenthetical to keep the two skills apart … make clause (b) name the `hyperframes` availability gate … keep rule 2's narrowing sentence consistent … re-run the P-6 sweep.
- runtime events: none

### T4 — `/akili-propose`: Deliverable field

| Field | Value |
|---|---|
| Final status | **PASS** (Reviewer `STATUS: PASS`, attempt 1) |
| Date | 2026-10-18 |
| Implementer attempts | 1 |
| Review intensity | Reviewer **owed**: walkthrough is judgment (condition 2 fails); override (a), (b) — adds a field to a shared contract (Document Control) |
| Requirements covered | FR-1 (Video request, Software-mentions-video, Orthogonal, Trivial × video propose half, Neither kind, Default), NFR-1 carve-out |

- Files changed: `.claude/commands/akili-propose.md` (+22/−8): Step 1 Deliverable block (Signal, Default, Neither kind, Ambiguity, Trivial × video); Step 2 Document Control item; Visual Reference note; Next Step Trivial exception + `Deliverable: video` bullet; Review Checklist item; Report To User items 3, 7. Sweep-driven consistency edits: Trivial row exception, Bug Track fix strategy, Fix Strategy template, Bug-track Next Step (each `Deliverable: video`-scoped)
- Skills: `cognitive-doc-design`. Effort: medium
- Precondition: `git show 22e990b:.claude/commands/akili-propose.md | grep -c Deliverable` → 0; after → 12
- Held-out walk (examples stripped; cases d, e not cited in the text): (a) → video, Signal row; (b) → software, "Detect the requested deliverable, not a word in passing."; (c) → Bug + video, Signal + Ambiguity row "at most that one question in total"; (d) → video, Signal; (e) → software + kind noted, Neither-kind row; (f) → Trivial + video → Lite proposal, Trivial × video row "never recommend `/akili-quick`… overrides the Trivial row above"
- Falsifier executed: sentence deleted → Signal row left `| Signal | Record \`video\` when what the user wants produced, changed, or repaired is a rendered video file or a composition that renders to one |`; case (b) loses its explicit anti-keyword rule (FR-1 `BUT` carrier) but still resolves to software via the narrow Signal definition + Default row — the sentence is the guard, not the sole path; restored (`grep -c "not a word in passing"` → 1)
- Not Done / Assumptions (verbatim, condensed): "The ambiguity-question wording is a suggested phrasing, not a fixed string." / "I added the Bug-track and Fix Strategy `/akili-quick` exclusions beyond the six listed sites. They are needed so that Trivial × video stays consistent." — Reviewer judged each extra site required by FR-1 / DD-4, not a widening
- Evidence re-run (Leader-inline): **VERIFIED** — count 12, sentence present, +22/−8
- Reviewer (opus): **PASS** — walk re-done with examples stripped, all six cases decided by shipped sentences; FR-1 term by term; NFR-1: only the detection block, Document Control, checklist and report items are unconditional (the allowed carve-out). ADVISORY: suppressed (< 50 LOC)
- runtime events: none
- spawns: implementer 10 calls, 83 700 tokens, ended partial (assumptions only); reviewer 6 calls, 72 587 tokens, ended complete
- Running totals vs budget: tasks 3/12 · LOC ~243 · review rounds 4/13 (+1 T2 FAIL = 5) — within budget

### T5 — `/akili-specify`: Video Mode

| Field | Value |
|---|---|
| Final status | **PASS** (Reviewer `STATUS: PASS`, attempt 1) |
| Date | 2026-10-18 |
| Implementer attempts | 1 |
| Review intensity | Reviewer **owed**: `Review: full`; term walk is judgment; override (a) |
| Requirements covered | FR-1 (Default, Reaches every reader), FR-2 (both scenarios incl. `BUT`), FR-3 (per-task skill list rule), NFR-1 |

- Files changed: `.claude/commands/akili-specify.md` (+16): `### Video Mode` block after Bug Mode (:63-69); Phase 2 line (:232); Step 3.2 clause (:418); Verification Checklist item (:506) — each carries `Deliverable: video`
- Skills: `cognitive-doc-design`. Effort: high
- Precondition: `grep -c "Video Mode\|video-production"` → 0 before, 8 after
- Term walk: FR-1 Default ← "An absent `Deliverable` row means `software`: Video Mode does not apply and nothing below changes."; Reaches every reader ← "Copy the `Deliverable: video` row into `requirements.md` Document Control…"; FR-2 S1 ← "each criterion carries a measurable value or an explicit `n/a - <reason>`, and the defect-class table maps each video defect class to its gate"; FR-2 S2 + `BUT` ← "Bug x video: … frame or metadata check at the failing timestamp … A unit test of composition source alone does not satisfy the Bug Mode regression requirement."; FR-3 ← "every task of the spec lists `video-production` in its skills"
- Falsifiers executed: F1 copy sentence removed → only the opener (:63) and checklist (:505) mention the row; neither instructs a copy — FR-1 "reaches every reader" loses its owner; F2 Bug × video removed → `grep "frame or metadata|ffprobe|failing timestamp|unit test of composition"` → no output; both reverted (`cmp` identical, count 8)
- Not Done / Assumptions (verbatim, condensed): "Prose uses `n/a - <reason>` with a plain hyphen, not an em dash." / "Bug Mode's own text has no video pointer. The Video Mode block alone owns the carve-out" — assumptions only
- Evidence re-run (Leader-inline): **VERIFIED** — count 8; `Deliverable: video` at :63, :66, :232, :418, :506
- Reviewer (opus): **PASS** — FR walk term by term; `acceptance-criteria.md` rows 1–10 cover every FR-2 noun; P-21 live path closed; KZ-004 landings stated (Bug Mode orthogonal, Lite "on top of the chosen depth", Phase 2 gate = storyboard approval, Phase 3 additive). ISSUES: none
- ADVISORY (recorded, not actioned): (g) Lite's "1-2 bullet points for requirements" vs Video Mode's ten-row criteria table — "on top of the chosen depth" resolves it, a clarifying clause could help; (h) ASCII `n/a - <reason>` / `Bug x video` vs `—` / `×` in FR-2 and `acceptance-criteria.md` — cosmetic, literal greps for the reference form would miss it
- runtime events: none
- spawns: implementer 10 calls, 77 780 tokens, ended partial (assumptions only); reviewer 11 calls, 82 811 tokens, ended complete
- Running totals vs budget: tasks 4/12 · LOC ~259 · review rounds 6/13 (tripwire 20) — within budget

**Attempt 2** (2026-10-18, rework after FAIL — Implementer resumed with the FAIL report verbatim; effort medium → high)
- Files changed: `docs/skills/governance.md` (cumulative +14/−3). Rule 2 tail: "…every command still runs without it. The one narrowing is rule 4: a spec whose `Deliverable` selects an environment-provided skill stops at that skill's availability gate instead of proceeding." Rule 4: "Today's instance: `Deliverable: video` in the spec's Document Control loads the packaged bridge skill `video-production` (AKILI-authored, listed below), and the bridge, not the command, runs the availability gate for the environment-provided `hyperframes` router (standalone, or plugin-namespaced) and routes to it."
- Implementer verification: P-6 sweep → `:27`, `:29` on-topic; `:54` off-topic. Falsifier executed: old sentence restored → `29: ...and every command must still work without it.` directly above `32: 4. **Command text may name one only behind a selector and a gate.**`; reverted
- Not Done / Assumptions: "Rule 4 says the bridge, not the command, runs the gate. That follows design §9, but the other files' wording is not mine to check" — assumption only
- Evidence re-run (Leader-inline): **VERIFIED** — same hits, +14/−3
- Reviewer (opus, resumed): **PASS** — skills kept apart; rule 2 and rule 4 agree with FR-9; rule 1 unchanged; "Four rules" correct; `conditional` row per FR-8; intro examples, wiring norm and rules of thumb do not contradict rule 4
- ADVISORY → **spec tension** (per *Pivot Detection*, settled at the next gate, not carried): `/akili-constitution` Step 8D is command text that names `hyperframes` (and `orchestration`, `playwright-cli`) as Skill Map examples with no `Deliverable` selector; read literally, FR-9's "only behind a recorded `Deliverable` selector" and rule 4 forbid that. Reviewer's resolutions: scope rule 4 to *load-directing* mentions (the `stack` rule's own wording) or add a Skill Map-builder carve-out
- runtime events: none

| Field | Value |
|---|---|
| Final status | **PASS** (Reviewer `STATUS: PASS`, attempt 2) |
| Date | 2026-10-18 |
| Implementer attempts | 2 (one rework attempt consumed) |
| Review intensity | Reviewer **owed**: verification is a grep plus judgment; override (a); attempt 2 also override (e) rework |
| Requirements covered | FR-9 (governance clause + rule 2 narrowing), FR-8 (assignment row) |
| spawns | implementer 7 calls, 71 664 tokens, ended complete; reviewer 7 calls, 68 373 tokens, ended fail; implementer (resumed) 4 calls, 78 464 tokens cumulative, ended complete; reviewer (resumed) 2 calls, 72 358 tokens cumulative, ended complete |
| Running totals vs budget | tasks 5/12 · LOC ~273 · review rounds 8/13 (2 for T2) — within budget (tripwire 20) |

### T7 — `/akili-test`: render-evidence suite

| Field | Value |
|---|---|
| Final status | **PASS** (Reviewer `T7 STATUS: PASS`, attempt 1) |
| Date | 2026-10-18 |
| Implementer attempts | 1 (wave 2: T7 ∥ T8 ∥ T9, disjoint files, no build) |
| Review intensity | Reviewer **owed**: walk is judgment; override (a) |
| Requirements covered | FR-6 (both scenarios incl. `BUT`), FR-4 at test time, NFR-1 |

- Files changed: `.claude/commands/akili-test.md` (+3/−1): Phase 1 step 1 sub-bullet "When `requirements.md` Document Control has `Deliverable: video` (an absent row means software), plan a **render evidence** suite for the video tasks in place of unit/E2E, per `video-production`…"; STOP bullet "**Missing HyperFrames is the same STOP** (applies only when `Deliverable: video`)…"; sweep fix: "four software suite types … ; the `Deliverable: video` render evidence suite is separate"
- Skills: `cognitive-doc-design`. Effort: medium
- Precondition: `grep -c "render evidence\|video-production"` → 0 before, 3 after
- Scenario walk: 28.9 s vs 30 s ± 0.5 → row 6 "Duration" + "Duration comparison": |30 − 28.9| = 1.1 > 0.5 → FAIL citing 28.9, 30, 0.5; "A zero exit from `check` never offsets a duration failure."
- Falsifier executed: "Duration comparison" section of `render-evidence.md` deleted → row 6 "see below" points at nothing; no sentence fails the drift case, which passes on `check` alone; restored byte-exact (`git diff --quiet -- .claude/skills/video-production` → 0)
- Not Done / Assumptions: the "four suite types" sweep fix goes beyond the two named sites — Reviewer: required (the old sentence would become false), not a widening
- Evidence re-run (Leader-inline): **VERIFIED** — count 3; skill dir unchanged (exit 0)
- Reviewer (opus, combined T7/T8/T9 spawn — deviation: one Reviewer, three separate verdicts, for three sub-50-LOC diffs; Delegation Ceiling): **PASS** — FR-6 term by term across the command line and `render-evidence.md` rows 1–6; NFR-1 holds. ISSUES: none. ADVISORY: omitted (< 50 LOC)
- runtime events: none
- spawns: implementer 7 calls, 71 442 tokens, ended complete; reviewer (shared T7/T8/T9) — see T9

### T8 — `/akili-validate`: gate, final look, delivery render

| Field | Value |
|---|---|
| Final status | **PASS** (Reviewer `T8 STATUS: PASS`, attempt 1) |
| Date | 2026-10-18 |
| Implementer attempts | 1 |
| Review intensity | Reviewer **owed**: walk is judgment; override (a) |
| Requirements covered | FR-7 (incl. MUST NOT PASS; loads the bridge), FR-3 scenario 2 (render after approval, never beside an active agent), FR-4 at validate time, NFR-1 |

- Files changed: `.claude/commands/akili-validate.md` (+7): Phase 0 bullet (load `video-production`; gate stop → BLOCKED); Phase 3 (`hyperframes check` as build integrity, "not approval"); Phase 6 "Final look" ("validate MUST NOT report PASS for the spec without a final look, whatever else is green" — human at the HITL pause or T6 Multimodal per *Cross-host dispatch*, citing `/akili-specify`'s defect-class rule by name); Phase 6 "Delivery render" (only after approval; never while a delegated agent is active)
- Skills: `cognitive-doc-design`. Effort: medium
- Precondition: `grep -c "Deliverable: video"` → 0 before, 4 after
- Falsifier executed: "a final look is recommended before PASS" → no "MUST NOT" on a final-look/PASS line — FR-7's MUST NOT PASS loses its owner; reverted (`grep -c "validate MUST NOT report PASS"` → 1)
- Not Done / Assumptions: "Treating an unrecorded look as BLOCKED rather than FAIL is my judgment call." — Reviewer: agrees with FR-7 (BLOCKED is not PASS) and the result-levels table
- Evidence re-run (Leader-inline): **VERIFIED** — 4 lines, MUST NOT count 1, +7
- Reviewer (opus, shared spawn): **PASS** — FR-7 walk complete; T6 citation real (`akili-specify.md` defect-class rule); FR-3 S2 `BUT` covered. ISSUES: none
- runtime events: none
- spawns: implementer 8 calls, 73 765 tokens, ended partial (assumption only); reviewer shared — see T9

### T9 — `/akili-quick`: escalate video edits

| Field | Value |
|---|---|
| Final status | **PASS** (Reviewer `T9 STATUS: PASS`, attempt 1) |
| Date | 2026-10-18 |
| Implementer attempts | 1 |
| Review intensity | Reviewer **owed**: walk is judgment; override (a) — an escalation rule other readers execute |
| Requirements covered | FR-1 Trivial × video (`AND` quick escalates, `BUT` no composition edit without evidence) |

- Files changed: `.claude/commands/akili-quick.md` (+1), Automatic Escalation: "- Edits a **video** composition (a HyperFrames composition, or a file that renders to the video deliverable) → `/akili-propose <change-name>`; a video edit needs render evidence that `/akili-quick` cannot produce, so it is never fast-tracked."
- Skills: none beyond defaults. Effort: low
- Red run (baseline at `22e990b`): the cosmetic criterion admits "color/spacing/style-token tweaks" with no deliverable check — case 1 passed
- Walk: "change the title colour in promo/index.html" → escalates (the new bullet); "fix a typo in the README" → not a composition, quick path unchanged
- Falsifier executed (on a filtered copy, live file untouched): without the line, case 1 passes every gate criterion
- Not Done / Assumptions: "I assumed 'a file that renders to the video deliverable' is enough for quick to recognise a composition without a spec."
- Evidence re-run (Leader-inline): **VERIFIED** — +1, line present
- Reviewer (opus, shared spawn): **PASS** — matches design §3 quick row and DD-4; the NFR-1 carve-out. ISSUES: none. Observation (carried as information, not an advisory task): the Automatic Escalation list opens "If the change fails **any** gate criterion" and the five Triviality Gate criteria name no deliverable check, so a strict reading never reaches the bullet; its own "never fast-tracked" wording and the neighbouring standalone triggers make it work in practice; the design prescribes exactly one line — a gate-criterion line would need a spec amendment
- runtime events: none
- spawns: implementer 5 calls, 59 405 tokens, ended partial (assumption only); reviewer (shared T7/T8/T9) not reported by host at write time, ended complete
- Running totals vs budget: tasks 8/12 · LOC ~285 · review rounds 11/13 (T7/T8/T9 count one verdict each; T2 A2 re-review pending) — within budget (tripwire 20)

## Amendment A2 (spec tension, T2 Reviewer) — 2026-10-18

| Field | Value |
|---|---|
| Tension | FR-9 / governance rule 4 ("an environment-provided skill is named in command text only behind a `Deliverable` selector + gate") vs pre-existing `/akili-constitution` Step 8D, command text naming `hyperframes`, `orchestration`, `playwright-cli` as Skill Map examples with no selector |
| Options offered | scope to *load-directed* mentions (recommended) · Skill Map carve-out · leave as advisory |
| User decision | **Scope to load-directed** (AskUserQuestion, 2026-10-18) |
| Spec edits | `requirements.md` FR-9 statement (load-direct; illustrative and Skill Map-builder mentions are not load-directing); `design.md` DD-7 Decision cell. `proposal.md:65,230` left as historical records. Removed lines in `git diff`: exactly the old FR-9 statement and old DD-7 row |
| Product edit | `docs/skills/governance.md` rule 4 re-issued to the T2 Implementer (resumed): "Command text may load-direct one only behind a selector and a gate. A command step may **load-direct** an environment-provided skill (tell the agent to load or run it) only when (a)… (b)… Illustrative and Skill Map-builder mentions (for example the examples in `/akili-constitution` Step 8D that name `hyperframes`, `orchestration` or `playwright-cli`) direct no load and are not restricted." (+7/−4) |
| Implementer verification | P-6 sweep `:27`, `:29` on-topic, `:57` off-topic; `load-direct` at `:34-35` (rule 4) and `:59` (stack rule) — same meaning. Falsifier executed: qualifier + exemption removed → "An environment-provided skill is named in command text only when (a)…" — forbids Step 8D's `hyperframes` example; reverted |
| Evidence re-run | **VERIFIED** (Leader-inline): +7/−4; `load-direct` hits; Step 8D names confirmed at `akili-constitution.md` ~:720-728 |
| Reviewer | opus (T2 Reviewer, resumed): **PASS** — rule 4 matches amended FR-9/DD-7 term by term; exemptions mirror the stack rule's carve-outs (1) and (3); nothing in governance contradicts it. Named conformance checks (FR-9 as amended, DD-7 as amended) conform |
| Accounting | No rework attempt consumed (amendment re-issue, not a FAIL); +1 review round for T2 (total review rounds 12/13; tripwire 20) |
| spawns | implementer (resumed) 4 calls, 84 036 tokens cumulative, ended complete; reviewer (resumed) 2 calls, 75 373 tokens cumulative, ended complete; T7/T8/T9 shared reviewer 7 calls, 74 948 tokens, ended complete |

### T6 — Leader skill rule

| Field | Value |
|---|---|
| Final status | **PASS** (Reviewer `STATUS: PASS`, attempt 1) |
| Date | 2026-10-18 |
| Implementer attempts | 1 (ran alone — quiet tree for the scoped suite) |
| Review intensity | Reviewer **owed**: `Consumers` ≠ `none` (condition 3 fails); override (a) — persona obligation |
| Requirements covered | FR-3 (example clause; rule owned by T5) |

- Files changed: `.claude/templates/leader.md` (+1/−1), item 3 first bullet: "…animation → `gsap-animation`, video deliverable → `video-production`, logic-heavy task where test-first pays → `tdd`, etc.)"
- Skills: none beyond defaults. Effort: low
- Implementer verification: `node --test test/agents-doctor.test.js` (full file) → tests 60, pass 60, fail 0
- Falsifier executed: item 4 renumbered to 5 → `not ok 59 - migratePersona: leader.md's primary-instructions is cut by the §5.2 row's extent (next ##), not the generic item rule — items 1-4 fenced as one block`, assertion `'item 4 must be inside the fenced span, not cut off at item 2'`; reverted; 60/60 green
- Not Done / Assumptions: exit code not captured by the Implementer (inferred from 0 failures) — closed by the Leader re-run
- Evidence re-run (Leader-inline, quiet tree): **VERIFIED** — `exit=0`, `# tests 60`, `# pass 60`, `# fail 0`
- Reviewer (opus): **PASS** — DD-5 secondary path; fence intact; `digests.json` untouched (P-17); NFR-1 holds (a list item conditional by its own wording, no effect on software tasks). ISSUES: none
- runtime events: none
- spawns: implementer 4 calls, 56 318 tokens, ended partial (assumption only); reviewer not reported by host at write time, ended complete
- Constitution impact: none (no module created or reshaped); deployed `.agents/leader.md` copies read OUTDATED after the next release (P-17) — release-time, via `doctor --agents --fix`
- Running totals vs budget: tasks 9/12 · LOC ~286 + spec amendments · review rounds 13/13 expected (tripwire 20); remaining T10, T11 → expected 15 — over the 13 estimate by the two amendment re-reviews, under the tripwire

### T10 — Docs surfaces

| Field | Value |
|---|---|
| Final status | **PASS** (Reviewer `STATUS: PASS`, attempt 1) |
| Date | 2026-10-18 |
| Implementer attempts | 1 (ran alone) |
| Review intensity | Reviewer **owed**: quote-check is judgment; override (c) — derived evidence (counts, aggregate claims) |
| Requirements covered | FR-10 (docs clauses), FR-9 (README restatements), FR-8 (truthful index row) |

- Files changed: new `docs/skills/video-production.md` (~60 lines, shape of `gsap-animation.md`); `docs/skills/README.md`, `README.md` (skill list + both FR-9 restatements), `AGENTS.md` (Skill Usage bullet), `docs/flow.md`, `docs/cli.md` (3 counts), `docs/commands/akili-{propose,specify,test,validate,quick}.md` — tracked +25/−7
- Skills: `cognitive-doc-design`. Effort: high
- Red run (baseline at `22e990b`): `grep -n "24 packaged skills" docs/cli.md` → 3 hits
- Implementer verification: counts re-measured at `7a152bb` — `ls -d .claude/skills/*/ | wc -l` → 25, `find .claude/skills -type f | wc -l` → 202; `docs/cli.md` "25 packaged skills" ×3; "24 packaged skills|24 skills" in live docs → 0; claim table with a HEAD citation per clause (SKILL.md Step 0 / Privacy / Render rules / frontmatter; `akili-propose.md:92,99,100,165,272`; `akili-specify.md:63-69,232,418`; `akili-test.md:108,111`; `akili-validate.md:68,92,141,143`; `akili-quick.md:55`; governance rules 2/4; `akili-constitution.md:732-734`); P-6 sweep on-topic `README.md:152,829`, `governance.md:27,29`, `akili-constitution.md:732-733` (FR-9 rule), off-topic `README.md:128,132,141`, `governance.md:57`, `akili-constitution.md:859`
- Falsifier executed: "AKILI installs HyperFrames" appended → `grep -n -i hyperframes bin/akili.js bin/routing.js bin/persona.js scripts/*.js` → no lines (no installer backing); removed
- Not Done / Assumptions: `docs/commands/akili-{test,validate}.md` had no skills-wiring section — short "Video specs" paragraphs + one render-evidence bullet added; archive untouched; `npm test` left to T11
- Evidence re-run (Leader-inline): **VERIFIED** — 10 modified + 1 new; 0 stale-count hits; 3 "25 packaged skills"; `git diff --check` clean; falsifier line absent
- Reviewer (opus): **PASS** — every behaviour sentence quote-checked against HEAD, none overstated or unsourced; counts re-measured (25 / 202; 27 skill pages = 25 + README + governance); FR-10 surfaces complete; FR-9 restatements match governance rule 2
- ADVISORY (recorded, not actioned): (i) the "render evidence" bullet in `docs/commands/akili-test.md`'s report list is backed only indirectly (the command's Output list and Phase 4 report sections have no render-evidence entry; backing is the planned suite feeding the requirement-to-test matrix); (j) `docs/skills/README.md` and `governance.md` still describe `conditional` as "(UI, animation)" beside tables that now include `video-production`; (k) `README.md` "prints the install route" (singular) vs SKILL.md printing all routes — matches the command's own wording
- runtime events: none
- spawns: implementer 13 calls, 93 860 tokens, ended partial (assumptions only); reviewer not reported by host at write time, ended complete
- Running totals vs budget: tasks 10/12 · LOC ~286 product + ~85 docs ≈ 371 (~650 est.) · review rounds 14 (13 expected; +2 amendment re-reviews, T2 FAIL) — under the 20 tripwire

### T11 — Fixtures, CHANGELOG, package verification (in progress)

**Attempt 1** (2026-10-18)
- Files changed: `test/install-cursor.test.js` (+8/−8: literal 199 → 202; comments 213 / 25 / 36 / 202), `test/fixtures/doctor-codex-baseline.txt` (+2/−1: `  OK video-production` after `vercel-react-best-practices`; summary `ok 43` → `ok 44`; LF preserved), `CHANGELOG.md` (+13/−2, Unreleased)
- Skills: `cognitive-doc-design`. Effort: medium
- Red run (pre-edit `npm test`): 259 tests, 257 pass, 2 fail — `not ok 65` "expected 199 packaged skill files under .claude/skills; counted 202 instead"; `not ok 75` Codex doctor baseline byte-identical (summary `ok 44` vs fixture `ok 43`, missing `OK video-production`)
- Measured: `find .claude/skills -type f | wc -l` → 202; `ls .claude/skills | wc -l` → 25; `ls .claude/commands | wc -l` → 11 (213 shared-root files, 36 operations)
- Post-edit: `npm test` 259/259/0; `verify:cli` `11 commands | 25 skills | 8 resources (akili-specs v2.32.2)`; `pack:dry-run` 284 files, under `.claude/skills` only `video-production/` (3 files); `git diff --check` exit 0
- Falsifier executed: 199 re-inserted → `not ok 65`, 258 pass / 1 fail; reverted
- Consumer: `scripts/ci/install-layout-regression.js` path-based — unchanged
- P-22 grep: see the settled P-22 row (execute-time edit to `design.md` §11 by the Leader: enumeration recorded as observed; quick line and `leader.md` example carry no literal; counts line reworded to "21 verified · 1 settled partially true (P-22) · 1 `UNVERIFIED`" after the Reviewer's note)
- Evidence re-run (Leader-inline, quiet tree): **VERIFIED** — `npm test` exit 0 259/259/0; verify:cli summary as above; pack exit 0; diff --check clean
- Reviewer (opus): **FAIL** — 1 issue, verbatim:
  > 1. **Discovered Issue:** In CHANGELOG `### Changed`, the sentence "The package gains only `.claude/skills/video-production/`." is false. `package.json` `files` ships `docs` and excludes only `docs/specs`, and this branch adds `docs/skills/video-production.md`, a packaged file. The entry also contradicts itself: its own `### Added` bullet says "Docs updated: the `video-production` skill page". The task's verification scoped the claim to "only `video-production/` added under `.claude/skills`", and the CHANGELOG dropped that scope. This is the KZ-002 overstatement class.
  > * **Violated Rule:** FR-10 (CHANGELOG notes must describe the shipped change) and task T11's verification line ("pack:dry-run (only `video-production/` added under `.claude/skills`)"). AGENTS.md Release Rules require accurate `CHANGELOG.md` notes.
  > * **Remediation Suggestion:** Scope the sentence to what was measured, for example: "Under `.claude/skills` the package gains only `video-production/`; `docs/skills/video-production.md` is the one other new packaged file." Before claiming it, confirm against the `pack:dry-run` listing that no other new path is added.
  Reviewer on the P-22 edit: enumeration matches HEAD exactly; "partially true — accepted" honest; neither unliteral block breaches NFR-1, FR-1 or FR-3
- runtime events: none

**Attempt 2** (2026-10-18, rework after FAIL — Implementer resumed with the FAIL report verbatim; effort medium → high)
- Files changed: `CHANGELOG.md` only. Corrected sentence: "Of the packaged files, four are new: `.claude/skills/video-production/` (`SKILL.md`, `references/acceptance-criteria.md`, `references/render-evidence.md`) and `docs/skills/video-production.md`; every other packaged change is an edit to an existing file."
- Implementer verification: `npm pack --dry-run --json` path list (284) vs `git diff --name-status master` → `A` only for those four, all others `M`, no `D`; `git diff --check` exit 0
- Not Done / Assumptions: "the comparison is against local master, which I assume is the release base"
- Evidence re-run (Leader-inline): **VERIFIED** — `git diff --name-status master | grep ^A` → the four + six `docs/specs/changes/video-deliverable-track/*` (excluded by `package.json` `files` `!docs/specs`); diff --check clean
- Reviewer (opus, resumed): **PASS** — four new packaged files confirmed (`'docs', '!docs/specs'`); ledger counts add up to 24; CHANGELOG under `[Unreleased]`, no version claimed; first-audit fixture/count findings unchanged. ISSUES: none
- runtime events: none

| Field | Value |
|---|---|
| Final status | **PASS** (Reviewer `STATUS: PASS`, attempt 2) |
| Date | 2026-10-18 |
| Implementer attempts | 2 (one rework attempt consumed) |
| Review intensity | Reviewer **owed**: override (c) derived evidence (counts, CHANGELOG aggregate claims); attempt 2 also (e) rework |
| Requirements covered | FR-10 (CHANGELOG + both fixtures), NFR-5 (`npm test`, `verify:cli`, `pack:dry-run`, `git diff --check` all pass); P-22 settled |
| decisions made | execute-time spec edit: `design.md` §11 P-22 row settled with the observed enumeration (partially true, accepted) and the ledger counts line — meaning of no requirement changed; carried to the Reviewer as a named check |
| spawns | implementer 17 calls, 95 439 tokens, ended complete; reviewer 9 calls, 79 199 tokens, ended fail; implementer (resumed) 3 calls, 98 094 tokens cumulative, ended complete; reviewer (resumed) not reported by host at write time, ended complete |
| Running totals vs budget | tasks 11/12 · LOC ≈ 371 + 36 (T11) ≈ 407 (~650 est.) · review rounds 16 (13 expected: +2 amendment re-reviews, +1 T2 FAIL, +1 T11 FAIL) — under the 20 tripwire |

### T12 — Live smoke validation (project-scoped HyperFrames)

| Field | Value |
|---|---|
| Final status | **PASS** (Reviewer `STATUS: PASS`, attempt 2) — with a recorded deviation and open spec tensions (below) |
| Date | 2026-10-18 |
| User authorization | "Juan Carlos AUTORIZA T12 (prueba en vivo de HyperFrames) con las condiciones descritas: carpeta temporal, sin -g, HYPERFRAMES_NO_TELEMETRY=1, sin tocar skills globales." (2026-10-18) |
| Implementer attempts | 2 (one rework attempt consumed — evidence-file misstatements) |
| Review intensity | `Review: skip-eligible` claimed; **not earned** — evidence includes a visual judgment of stills (condition 2) and override (c) (derived evidence a later gate consumes). Reviewer spawned. Reported at this gate per Step 2.3 |
| Requirements covered | FR-4 (gate + amended install route), FR-5 (telemetry off by env override, no feedback sent), FR-6 (evidence set items 1–6, both comparisons), NFR-4 (Claude Code on macOS only) |

**Attempt 1** (2026-10-18)
- Files changed: `docs/specs/changes/video-deliverable-track/t12-smoke-evidence.md` (new; the only repo file). Scratch project: session scratchpad `t12/`
- Skills: `video-production` (+ installed `hyperframes` set read from the scratch project). Effort: high. Ran alone (quiet tree)
- Run (all with `HYPERFRAMES_NO_TELEMETRY=1`): `npx skills add heygen-com/hyperframes --skill <10 core> --yes` (no `-g`, no `--agent`) exit 0 → `.agents/skills/<10>` (real dirs) + `.claude/skills/<10>` (symlinks) + `skills-lock.json` only; `doctor --json` exit 0; `check` exit 0 (0 errors, 1 warning `nested_structure_needs_subcomposition`); `snapshot --at 1,3` exit 0 (3 stills); `render --quality draft` exit 0, 64,446 B; `ffprobe` h264 1920x1080 30/1, `format.duration` 5.000000 → PASS vs target 5 s ± 0.1 s (tolerance chosen by the Implementer; the skill states none) and vs `data-duration` 5
- Falsifiers executed: A (`data-duration` 4, declared target 5) → 4.000000 FAIL vs target, PASS vs `data-duration`; B (`data-duration` 5, file cut to 4 s with `ffmpeg -t 4`) → 4.000000 FAIL vs both. `render` has no duration flag; A and B are complementary
- `skills check` exit 1: reads `~/.claude/skills` (global) and ignores the project install
- Evidence re-run (Leader-inline): global skill-dir snapshot before/after (`~/.claude/skills`, `~/.agents/skills`, `~/.codex/skills`, `~/.cursor/skills`, `~/.config/opencode/skills`, depth 2) — only diff: mtimes of two `~/.claude/skills/synced/<uuid>` entries (Claude Code's own synced-skills folder; no HyperFrames names) → **no global skill install touched**. Out-of-scratch writes found: `~/.cache/hyperframes/` created (205 MB); `~/.hyperframes/` pre-existing (birth 2026-06-24), `config.json` updated. `HYPERFRAMES_NO_TELEMETRY` overrides the stored `telemetryEnabled: true` (`policy.ts:31-55`)
- Reviewer (opus): **FAIL** — 2 issues (verbatim summary): (1) evidence F2 claimed `~/.hyperframes/` was "Created during this run" — `stat` shows birth 2026-06-24; (2) §4/F2 said "a usable Chrome existed locally (no download needed to render)" and the 204 MB origin "was not traced" — `render.log` shows `◇  Browser: download` and `HeadlessChrome/152.0.7977.30` at `~/.cache/hyperframes/chrome/chrome-headless-shell/mac_arm-152.0.7977.30`; the brief's STOP condition was triggered and missed; P-23 settled on a false premise
- runtime events: none

**Attempt 2** (rework; Implementer resumed with the FAIL verbatim; effort high; no commands beyond `stat`/`grep`/reads)
- Files changed: `t12-smoke-evidence.md` — F2 `~/.hyperframes` corrected; §4/F2 rewritten from `render.log`; P-23 settled "HyperFrames fetches its own headless shell on first render; an existing puppeteer cache is not used"; telemetry cites `policy.ts:31-55` (source-read); feedback: 0 matches for `feedback|survey|rate this` in all four logs; F4 heading reworded
- Evidence re-run (Leader-inline): **VERIFIED** — `152.0.7977.30` ×2; old misstatements absent; `Browser: download` in `render.log`
- Reviewer (opus, resumed): **PASS** — both issues fixed; FR-5 feedback clause closed; everything else from attempt 1 stands
- runtime events: none

**Deviation (recorded):** the brief ordered "if a download outside the scratch dir is unavoidable, STOP and report". The first render downloaded Chrome (~204 MB) into `~/.cache/hyperframes/` with no pre-flight warning; the Implementer did not stop and left it in place. No global **skill** install was touched; the user's home now holds `~/.cache/hyperframes/` (new) and an updated `~/.hyperframes/config.json`. Cleanup is the user's decision (asked at this gate).

**Spec tensions (settled at the next gate, not carried):** (S1) `SKILL.md` names `npx hyperframes skills check` the "Freshness diagnostic", but it reads only the global dir and cannot certify a project install; (S2) DD-10 "never globally" / scratch-only vs HyperFrames writing `~/.hyperframes` and `~/.cache/hyperframes` regardless of project scope; (S3) the first render downloads a browser without asking — FR-4 "install anything without consent"; (S4) render needs network (GSAP from cdn.jsdelivr.net, Inter from Google Fonts); (S5) no default duration tolerance when a requirement states none; (S6) `render` has no duration flag (informational)
- decisions made: execute-time spec edit — `design.md` §11 P-23 settled (refuted as stated) and counts line updated
- spawns: implementer 19 calls, 113 985 tokens, ended complete; reviewer 7 calls, 75 038 tokens, ended fail; implementer (resumed) 6 calls, 125 738 tokens cumulative, ended complete; reviewer (resumed) not reported by host at write time, ended complete
- Running totals vs budget: tasks 12/12 · LOC ≈ 407 product/docs + evidence file · review rounds 18 (13 expected; tripwire 20 — not exceeded, 2 left)

## Summary (execution complete — T1–T12)

| Measure | Budget | Actual |
|---|---|---|
| Tasks | 12 | 12 (no tasks added) |
| LOC | ~650 added / ~25 changed | ≈ 410 product/docs + spec amendments + evidence |
| Review rounds | 13 expected · tripwire 20 | 18 — 3 FAIL rounds (T2, T11, T12), 2 amendment re-reviews (T1 pivot delta counted in T1, A2), within tripwire |
| Rework attempts consumed | — | 3 (T2, T11, T12), none beyond attempt 2 |
| Amendments | — | Pivot T1 (`skills update` is global → P-24), A2 (FR-9 load-direct scope); P-22, P-23 settled |

Open at this gate: spec tensions S1–S5 and the `~/.cache/hyperframes` cleanup decision.
