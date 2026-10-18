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
