# Tasks: Growth angles, the growth track, and the flow figure

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/growth-angles` |
| Depth | Standard |
| Type | Change |
| Deliverable | `software` |
| Approval Mode | `gated` for `/akili-execute` (proposal). The Phase 3 gate of this specify run is `auto-approved (user mandate, 2026-10-28)`; the maintainer asked to stop once this file is committed |
| Status | Phase 3 gate: `auto-approved (user mandate, 2026-10-28)` — recommended option **Continue** |
| Date | 2026-10-28 |
| Budget (design §8) | **9 tasks · ~760 LOC · ~17 review rounds** — `/akili-execute` stops and escalates past **10 tasks, ~950 LOC, or 21 rounds** |
| Commit prefix | `[SPEC:changes/growth-angles]` — local commits only; **no push, PR, merge, tag, publish or release** |
| Release note | Minor (2.38.0, D-7), recorded in T9's CHANGELOG entry; `npm run release:minor` is **not** run |
| Verified at | `8991113` — every *Red run* below was executed on 2026-10-28 |
| Baseline | `npm test` → 1153 pass, 0 fail (`3ef3412`) |
| Execute prerequisite | No deployed `.agents/` here (`ls .agents` → `No such file or directory`, as run). `/akili-execute` Step 0 deploys or checks the personas (`akili doctor --agents`) before the first spawn and treats `outdated`/`unmarked`/`missing` as a stop (KZ-changes--persona-upgrade-1) |
| Private reference | `~/akili-refs/akili-mapa-de-angulos.md` — outside the repo, read-only, **never copied**. T1's first step builds the leak-term list in the session scratchpad (`<scratchpad>/leak-terms.txt`); it is never committed (NFR-2, DD-10) |
| Parallel worktree | `methodology-mcp` is not touched by any task |
| Node runtimes | `~/.nvm/versions/node/` holds `v18.20.8` and `v22.12.0` (as run) — T9 runs `npm test` on both |

## 2. Task Graph

```text
T1 (angles-framework.md + SKILL.md + file lists) ─┐
T2 (brand-voice template + planning slot fields) ─┼─→ T3 (command part 1) ─→ T4 (command part 2) ─→ T5 (command tests)
T1 ─→ T6 (constitution + growth-track test part 1)┘                                               │
T3, T4, T5, T6 ─→ T7 (docs + growth-track test part 2) ─→ T8 (figure) ─→ T9 (CHANGELOG, sweep, dogfood HITL)
```

No cycles. T3 waits for T1/T2 because it points at their sections by name. T7 quotes shipped command text, never design text (KZ-002). T8 follows T7 because both touch `docs/flow.md` (design R-4: T8 owns line 7 and the anytime sentence only). Command edits are split in two (T3, T4) because they exceed ~8 sites in one rules document (`/akili-specify` Step 3.2).

**`skip-eligible` tasks: none.** Every task edits rules text that agents execute or tests that pin it.

**Skills:** T1, T2, T3, T4, T6, T7 `cognitive-doc-design` · T1 `social-marketing` (the method being extended) · T5 `tdd` (literal per clause + mutation) · T6 `product-manager-toolkit` (PRD section shape) · T8 `diagram-design` (figure conventions; Archify is run from the scratchpad, not a packaged skill) · T9 `social-marketing` via the command (dogfood). `caveman` applies only to transient worker messages.

## 3. Clause Ownership

| Clause | Writes | Pins / checks | Observes |
|---|---|---|---|
| FR-1 four foundation sections; pillars/tone reused, not duplicated | T2 | T5 (template literals) | T9 |
| FR-1 *Interview* THEN one question at a time per empty foundation | T2 (interview rows), T3 (`brand`) | T5 | T9 |
| FR-1 *Interview* BUT no plausible fill; empty stays empty | T2 (points to the existing "Never fill a gap" rule) | T5 | T9 |
| FR-1 *Existing file* THEN still `filled: yes`; AND IT MUST NOT rewrite; `brand`/`angles` offers | T2 (read-table row), T3 | T5 | T9 |
| FR-2 map shape (header, pillar section, approaches applied, formats, open questions) | T1 (shape), T3 (writes) | T5 | T9 |
| FR-2 *Sourced* THEN every angle cites; story bank Positions→beliefs, Scars→objections | T1, T2 (story-bank note) | T5 | T9 |
| FR-2 *Sourced* BUT no padding to 9; `needs input` | T1, T3 | T5 | T9 |
| FR-2 *Sourced* AND IT MUST types distinct | T1 | T5 | — |
| FR-2 *Per-pillar approval* THEN record + snapshot as `## Invariants`; reset to `draft` | T3 (one invariant sentence + `angles` section) | T5 | T9 |
| FR-2 *Per-pillar approval* BUT silence/praise/advance/bulk-unseen/Approval Mode never approve | T3 (pointer to `## Invariants`) | T5 | T9 |
| FR-2 *Thin brand voice* offer `brand`; `Voice: generic`; dependent angles `needs input` | T3 | T5 | — |
| FR-2 *Existing map* show changes, ask; approved → `draft` | T3 | T5 | — |
| FR-2 *No mass generation* | T1, T3 | T5 | T9 |
| FR-3 *Plan slot* Angle, Approach, 3 hooks; `needs input` | T2 (slot fields), T4 (`campaign`) | T5 | — |
| FR-3 *Plan slot* BUT no ID from a non-approved section | T4 | T5 | — |
| FR-3 *Post* header Angle/Approach; 3 hooks, user picks, only chosen reaches card | T4 | T5 | T9 |
| FR-3 *Post* AND IT MUST NOT change card fields, card or transitions | T4 | T5 (card-field list unchanged; existing tests green) | — |
| FR-3 *Refusal on unapproved angle* names the missing pillar approval | T4 (+ error row) | T5 | T9 |
| FR-3 *Social proof* asks or proposes another approach; no invented testimonial/name/figure | T1 (approach table), T4 | T5 | — |
| FR-3 *No map* `Angle: none — no angles map`; offers `angles` once | T4 | T5 | — |
| FR-4 reference content, ID scheme, generic English example, method credit | T1 | T1 (skill test) | — |
| FR-4 BUT example not derived from the private map | T1 | T1, T9 (leak check) | — |
| FR-4 AND IT MUST `AKILI-authored` first line; `SKILL.md` `angles` row | T1 | T1 (skill test) | — |
| FR-5 optional PRD section; Step 2 cited defaults → Assumptions | T6 | T6 | — |
| FR-5 BUT `filled: no`, `draft` section, unapproved post never a source | T6 | T6 | — |
| FR-5 *Optional* omitted or `none supplied`; never fabricated | T6 | T6 | — |
| FR-6 pre-fill from named PRD sections, cited; ask only gaps; confirm, never re-ask | T3 | T5 | T9 |
| FR-6 BUT no write to `docs/prd.md` | T3 | T5 | T9 |
| FR-6 *Disagree* show both, cited; user decides | T3 | T5 | — |
| FR-7 growth track in six docs; `angles` mode; data-flow table | T7 | T7 | — |
| FR-7 BUT README ≤ 2 net lines; AND IT MUST seven-anytime statements stay true | T7 | T7 | — |
| FR-8 group + members + `g1`; lanes, nodes, edges kept; `<desc>` = alt; caps | T8 | T8 | T8 (render) |
| FR-8 *Animated* unchanged motion, rest, reduced motion; staleness; BUT `g1` no motion | T8 | T8 | T8 (30 s frame) |
| FR-8 *Tests deliberately*: each change named old → new; none removed or weakened | T8 | T8 (diff walk) | — |
| FR-9 CHANGELOG content, credit, `Release class: minor`; quote only shipped | T9 | T9 | — |
| NFR-1 invariants keep every sentence; only the additive sentence | T3 | T5 (existing tests unchanged), T9 | — |
| NFR-2 no private content | every task | each task's leak grep; T9 final | maintainer at validation |
| NFR-3 English, generic | every task | review | — |
| NFR-4 no new command/skill/target; 13 files | T1 | T1 | T9 (`install --tool all --dry-run`) |
| NFR-5 test, verify, pack, diff-check | T9 | T9 | — |
| NFR-6 no shipped file/test names the spec path | every task | T6 (`test/growth-track.test.js`) | — |
| NFR-7 `figure-source.json` kept | done at specify (`8991113`); T8 updates it | T8 | — |

**Leak grep (every task's Verification):** `git diff 8991113 -- . ':!docs/specs' | grep -i -F -f <scratchpad>/leak-terms.txt` → no output. Falsifier: append a term from the private map to a scratch copy of a changed file and grep it → one hit.

## 4. Tasks

### T1 — `angles-framework.md`, `SKILL.md` table, file lists

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M (~150 LOC incl. test edits) |
| Depends on | — |
| Requirements | FR-2 (map shape, sourcing, distinct types, no mass generation), FR-3 (approach table, social proof), FR-4, NFR-2, NFR-4 |
| Design refs | §2, §3, §4.2, DD-1, DD-3, DD-10, P-3, P-5 |
| Review | `full` — every mode will point to this file as the method's single owner |

**Scope.** First step: build `<scratchpad>/leak-terms.txt` from the private map (proper nouns, people, clients, programmes, figures, distinctive Spanish phrases) — never in the repo. Then write `references/angles-framework.md`: an `AKILI-authored` first line plus the method credit (Nico Azero's content method, video *Así creo 6.480 reels con Claude en 3h*, structure only, AKILI's own words, not fetched); the five foundations as inputs (pointing to `brand-voice-template.md`); four angle types with a one-line test each; ID scheme; "up to 9, never padded, `needs input`"; sourcing rule incl. story-bank *Positions*/*Scars*; five approaches table (does / do not use when — social proof needs a free-to-use fact); the `angles.md` shape (design §4.2) — statuses and approval **pointed to `/akili-marketing` `## Invariants`, not restated**; no-mass-generation rule; one generic English worked example (one pillar, invented neutral business, two or three angles per type). Update `SKILL.md`'s integration table (`angles` row; `brand`, `campaign`, `post` load the file where they use it) and the file lists in `test/social-marketing-skill.test.js` and `test/social-marketing-install.test.js` (12 → 13; "exactly the 12 expected names" test title → 13).

| Field | Value |
|---|---|
| Command | `node --test test/social-marketing-skill.test.js test/social-marketing-install.test.js`; leak grep |
| Red run (executed at baseline) | `ls .claude/skills/social-marketing/references/angles-framework.md` → `No such file or directory` |
| Falsifier | Remove `angles-framework.md` with the lists already at 13 → "file set is exactly the 13 expected names" red; change its first line to drop `AKILI-authored` → the first-line test red. `predicted — greenfield artifact (observed in T1)` |
| Disqualifier | A green suite with the file lists still at 12 proves the old set; a worked example containing any leak term fails NFR-2 whatever the tests say |
| Consumers | P-3: `test/social-marketing-skill.test.js:29-42,113`, `test/social-marketing-install.test.js:35-48`; install totals are computed (`test/install-cursor.test.js:224`) |

**Done.** Suites green with 13 files; observed reds quoted in `execution.md`; leak grep empty; restatement sweep: `grep -n "approved" angles-framework.md` hits only pointers to `## Invariants`.

### T2 — Foundations and slot fields in the skill references

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S (~50 LOC) |
| Depends on | — |
| Requirements | FR-1 (sections, interview, no plausible fill, existing file), FR-2 (story-bank note), FR-3 (slot fields) |
| Design refs | §4.1, §4.3, DD-4 |
| Review | `checklist` — additive sections; the read rule for old files is the one risk |

**Scope.** `brand-voice-template.md`: add *Ideal customer* (Who, Pains, Desires, Context), *Ideal follower*, *Offer* (Result, What makes it unique, next step → *CTA and primary link*), *Message* (Positioning, Narrative; tone → fingerprint) after *Audience*; interview: ask each empty foundation one at a time, pre-filled ones confirmed (FR-6 owner is the command); a read-table row: a `filled: yes` file without the foundations stays `filled: yes` and the foundations read as empty; story-bank line: *Positions* and *Scars* may seed beliefs and objections. `planning-and-calendar.md`: slot step 4 gains Angle (approved ID[s] or `needs input`), Approach, three hook candidates; worked-shape table gains the two columns; balance check: "every slot names an approved angle or `needs input`".

| Field | Value |
|---|---|
| Command | `grep -n "## Ideal customer\|## Ideal follower\|## Offer\|## Message" .claude/skills/social-marketing/references/brand-voice-template.md` → 4; `grep -c "Approach" .claude/skills/social-marketing/references/planning-and-calendar.md` ≥ 2; `node --test test/social-marketing-skill.test.js`; leak grep |
| Red run (executed at baseline) | `grep -c "## Ideal customer" …/brand-voice-template.md` → `0`; `grep -c -i "approach" …/planning-and-calendar.md` → `0` |
| Falsifier | Delete the read-table row for old files → T5's "old brand voice stays `filled: yes`" literal goes red (observed in T5) |
| Disqualifier | Sections present but the template's `filled: no` shipping default changed → every unedited copy would steer drafts; check the default is still `no` |
| Consumers | `test/social-marketing-skill.test.js` (file set only; no literal on these files — `grep -n "brand-voice-template" test/*.js` → list entries only) |

**Done.** Four sections + read row + slot fields present; default `filled: no` unchanged; leak grep empty.

### T3 — Command part 1: modes, Step 0, `brand`, `angles`, invariant sentence

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M (~80 LOC) |
| Depends on | T1, T2 |
| Requirements | FR-1 (brand interview, existing file), FR-2 (all scenarios), FR-6 (all), NFR-1 |
| Design refs | §3, §4.2, §5, DD-2, DD-4, P-1, P-2, P-10 |
| Review | `full` — touches `## Invariants`; two rounds budgeted |

**Scope.** Usage table: `angles` row (`angles [<pillar>]` → `angles.md`). Step 0.1: "seven modes". Step 0.3: `angles` joins the brand-voice check. `brand`: fill the foundations; when `docs/prd.md` exists, pre-fill from *Target Personas*, *Problem Statement* and *Customer Objections & Beliefs*, cited, confirm, ask only gaps, never write the PRD; on disagreement show both, cited, user decides. New `### \`angles [<pillar>]\``: loads `angles-framework.md`; sources (foundations, PRD, story bank, user message); up to 9 per type, `needs input`; per-pillar card and stop; existing map → show changes and ask, changed approved section → `draft`; thin brand voice → offer `brand`, else `Voice: generic` and dependent angles `needs input`; never posts. `## Invariants` → after the plan-approval sentence (`:63`) add **one** sentence: pillar-section approval in `angles` follows the same rules with the pillar section shown in place of the card, and a change to its lists resets it to `draft`. Error rows: unapproved pillar for an `angles`-dependent request (owned by T4) is not here; add "angles with no pillars on file → ask for pillars". Next steps: after `brand` → `angles`; after an approved pillar → `campaign`/`post`. Before review: phrase-family sweep for every restatement of the approval rules (KZ-changes--kaizen-loop-closure-2).

| Field | Value |
|---|---|
| Command | Clause walk: quote the command sentence for every T3 row of §3; `git diff 8991113 -- .claude/commands/akili-marketing.md` inside `## Invariants` shows exactly one added sentence and no removed line; leak grep |
| Red run (executed at baseline) | `grep -c "list the seven modes" .claude/commands/akili-marketing.md` → `0`; `grep -c '^### \`angles' …` → `0`; `grep -c "pillar section" …` → `0` |
| Falsifier | The Reviewer deletes the new invariant sentence from a copy and re-walks §3 → the *Per-pillar approval* row has no delivering sentence |
| Disqualifier | A walk quoting design text proves the design; an `## Invariants` diff with any `-` line fails NFR-1 regardless of intent |
| Consumers | P-2: `test/akili-marketing-command.test.js:94-95,135-138` ("six modes") — updated in T5; `docs/flow.md:447` — T7 |

**Done.** Every T3 row quoted; invariant diff = one `+` line; sweep result recorded.

### T4 — Command part 2: `campaign` and `post` selection

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S (~40 LOC) |
| Depends on | T3 |
| Requirements | FR-3 (all scenarios) |
| Design refs | §4.3, DD-5 |
| Review | `full` — refusal and card-preservation clauses |

**Scope.** `campaign`: plan slots carry Angle (approved ID[s] or `needs input`), Approach, three hook candidates per `planning-and-calendar.md`; no ID from a non-approved pillar section. `post`: header `Angle:` and `Approach:`; show three hook candidates and draft with the one the user picks; only the chosen hook reaches *Copy*; card fields, card and transitions unchanged; social proof without a free-to-use fact → ask or propose another approach, never invent; no `angles.md` → `Angle: none — no angles map`, offer `angles` once. Error row: "angle ID from a pillar section that is not validly `approved`" → refuse and name the missing pillar approval. `repurpose` unchanged.

| Field | Value |
|---|---|
| Command | Clause walk for every T4 row; `grep -n "Card fields" .claude/commands/akili-marketing.md` shows the list unchanged (`Copy, Hashtags, CTA, Alt text, Media brief`); leak grep |
| Red run (executed at baseline) | `grep -c -i "approach" .claude/commands/akili-marketing.md` → `0` |
| Falsifier | Add "Hook choice" to the card-field list in a copy → T5's card-field literal red |
| Disqualifier | A hook step that reaches the card as a new field changes the approval contract — FR-3 AND IT MUST fails even if every literal is present |
| Consumers | `test/akili-marketing-command.test.js` card-field and Error Handling literals (existing) — must stay green |

**Done.** Every T4 row quoted; existing card/transition tests green.

### T5 — Command and template tests

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M (~170 LOC) |
| Depends on | T2, T4 |
| Requirements | Pins every §3 row whose *Pins* column names T5; NFR-1 |
| Design refs | §7 n/a; DD-2; P-2 |
| Review | `checklist` — test-only; mutation evidence is the gate |

**Scope.** In `test/akili-marketing-command.test.js`: "six" → "seven" in the two FR-2 tests and the mode list (+`angles`); one literal per T3/T4 clause, anchored in its section (the `angles` block, `brand` block, `post` block, `## Invariants`); the card-field list literal unchanged. A new block of template literals (four foundation headings, old-file read row, slot fields) — in the same file or `test/social-marketing-skill.test.js`, whichever already reads references. Each new literal gets a mutation check executed once and quoted (KZ-changes--kaizen-loop-closure-2). No existing assertion is removed.

| Field | Value |
|---|---|
| Command | `node --test test/akili-marketing-command.test.js test/social-marketing-skill.test.js`; `git diff 8991113 -- test/akili-marketing-command.test.js | grep "^-" | grep -v "^---"` lists only the six→seven lines |
| Red run (executed at baseline) | Equivalent reading on the pre-T3 command: `grep -c "list the seven modes" .claude/commands/akili-marketing.md` → `0` (the new literal is red before T3) |
| Falsifier | Per literal: delete the sentence it pins from a scratch copy pointed at by the test → that test red; executed for at least the invariant sentence, the unapproved-angle refusal and the no-padding rule, quoted |
| Disqualifier | A literal that matches anywhere in the file instead of inside its section can pass on a stray mention; a mutation that leaves the test green means the literal pins nothing |
| Consumers | none beyond the edited files |

**Done.** Suites green; mutation reds quoted; removed-line diff limited to six→seven.

### T6 — `/akili-constitution` PRD section and Step 2 defaults

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M (~70 LOC incl. test) |
| Depends on | T1 |
| Requirements | FR-5 (all), NFR-6 |
| Design refs | §3, DD-6, DD-11, P-4 |
| Review | `full` — constitution text binds every project |

**Scope.** Step 2: one bullet — when `docs/marketing/brand-voice.md` reads `filled: yes`, offer its foundations (customer, offer, positioning), and the objections/beliefs of validly approved pillar sections in `docs/marketing/angles.md`, as proposed defaults citing the file; unconfirmed items land as Assumptions with that citation; `filled: no`, `draft` sections and posts are never a source. Step 3: after the nine required sections, one line: optional **Customer Objections & Beliefs**, filled only from user-supplied material, omitted or `none supplied` otherwise (thin-seed rule). Create `test/growth-track.test.js` with literals for both clauses (anchored in Step 2 and Step 3) and an NFR-6 check: no file under `.claude/`, `docs/` (excluding `docs/specs/`), `README.md` or `test/` contains `docs/specs/changes/growth-angles`.

| Field | Value |
|---|---|
| Command | `node --test test/growth-track.test.js`; the nine-section list unchanged (`sed -n '/Required PRD structure/,/Open Questions/p'` reads the same nine lines); leak grep |
| Red run (executed at baseline) | `grep -c "Customer Objections & Beliefs" .claude/commands/akili-constitution.md` → `0`; `grep -c "brand-voice" …` → `0` |
| Falsifier | Remove "`filled: no` … never a source" from a copy → its literal red. `predicted — greenfield artifact (observed in T6)` for the new test file |
| Disqualifier | The optional section added *into* the numbered nine changes the required structure — a green literal does not excuse it |
| Consumers | P-4: no test pins the PRD list |

**Done.** Test green; reds quoted; required list unchanged.

### T7 — Docs: growth track

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M (~90 LOC) |
| Depends on | T3, T4, T5, T6 |
| Requirements | FR-7 (all), NFR-3 |
| Design refs | §2 (data-flow table), §3, P-2, P-11 |
| Review | `checklist` — quote-check every clause at HEAD (KZ-002) |

**Scope.** `docs/commands/akili-marketing.md` (seven modes, `angles`, foundations, selection, method credit), `docs/skills/social-marketing.md` (new reference, 13 files), `docs/overview.md` (growth-track sentence in *Any time*; glossary row "Growth track"; *I want to…* row "map content angles"), `docs/flow.md` (`§2c` "Six modes" → seven + `angles`; a short *Growth track* paragraph with the data-flow table; artifacts row for `angles.md`; **not** line 7 or the anytime sentence — T8), `docs/README.md` (growth track named in the anytime table intro), `README.md` (≤ 2 net lines). Extend `test/growth-track.test.js` with: "growth track" present in the four overview/flow/README pages; `angles.md` row in `docs/flow.md`; README net growth ≤ 2 lines versus `8991113`.

| Field | Value |
|---|---|
| Command | `node --test test/growth-track.test.js test/akili-marketing-docs.test.js test/docs-overview*.test.js`; `git diff --stat 8991113 -- README.md`; leak grep |
| Red run (executed at baseline) | `grep -n "Growth\|growth" docs/overview.md docs/flow.md docs/README.md README.md` → exit 1 (no hit); `grep -c angles docs/commands/akili-marketing.md docs/skills/social-marketing.md` → `0`, `0` |
| Falsifier | Remove the growth sentence from `docs/overview.md` → its literal red |
| Disqualifier | A docs clause that paraphrases the command beyond what it ships (KZ-002) — each clause is quote-checked against the command at HEAD, not against the design |
| Consumers | `test/docs-overview-contract.test.js` (anytime table, FR-13), `test/akili-marketing-docs.test.js` (command listed everywhere) — must stay green |

**Done.** Tests green; every docs clause quote-checked; README net ≤ 2.

### T8 — Flow figure

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M (~70 LOC + generated assets) |
| Depends on | T7 |
| Requirements | FR-8 (all), NFR-7, FR-7 AND (seven anytime) |
| Design refs | §7 (source edits, pipeline, alt text, test table), DD-7, DD-8, DD-9, P-6, P-7, P-8, P-9, P-12, P-13, P-15 |
| Review | `full` — rendered output; the Reviewer opens the PNG |

**Scope.** First steps: settle P-8 and P-15 (below). Apply design §7's source edits to `figure-source.json`; if Archify is gone from `/private/tmp`, reinstall `tt-a1i/archify` 3.2 into the scratchpad (P-6). `archify finalize workflow` (showcase) → export `svg-light` + PNG → normalize as design §7 → `magick` to 1800 px within cap → `node scripts/animate-flow.js`. Try a non-purple variant for `g1` if one validates (design §7 *Colour*). Update `docs/flow.md` line 7 alt and the anytime sentence, and the README `<img alt>`, per design §7. Update the figure tests exactly as design §7's table lists, adding the group, members, `g1` and "no overlay references `g1`" assertions. Render checks: PNG read as an image; SVG as `<img>` in headless Chromium; one frame at ≥ 30 s compared with the static render at 0 px (no fuzz).

| Field | Value |
|---|---|
| Command | `archify validate workflow figure-source.json --quality showcase` → 0 errors, 0 warnings; `node --test test/flow-figure*.test.js test/docs-overview*.test.js`; `ls -la assets` (caps); leak grep |
| Red run (executed at baseline) | `grep -c "Growth track" assets/akili-flow.svg assets/akili-flow-animated.svg` → `0`, `0`; `grep -c 'data-edge-id="g1"' assets/akili-flow.svg` → `0` |
| Falsifier | Regenerate without the group → the new group assertion red; edit one byte of the committed animated SVG → staleness test red. Both executed and quoted |
| Disqualifier | A test edit that deletes or loosens any assertion (diff `-` lines in `test/flow-figure*.test.js` not paired with a stricter `+`) fails FR-8 whatever the suite says; a 30 s frame compared with fuzz is not evidence of rest |
| Consumers | P-9: `test/flow-figure-contract.test.js:35-97`, `test/flow-figure.test.js:46-76`, `test/flow-figure-animated.test.js`, `test/flow-figure-animated-contract.test.js:109-112`, `test/docs-overview-contract.test.js:143-168`, `test/docs-overview.test.js:455-456` |
| UNVERIFIED to settle first | P-8 (generator accepts the new export, 18 overlay elements) → refuted: smallest generator fix within this task; P-15 ("↔" renders after normalization) → refuted: reword the label |

**Done.** Validate 0/0; all figure tests green; caps met; renders read and described in `execution.md`; P-8, P-15 outcomes recorded; `figure-source.json` updated.

### T9 — CHANGELOG, sweep, dogfood (HITL)

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S (~40 LOC) |
| Depends on | T1–T8 |
| Requirements | FR-9, NFR-1, NFR-2, NFR-4, NFR-5; observes the §3 *Observes* column |
| Design refs | §8, R-1, R-2 |
| Review | `checklist` — KZ-002 quote-check; HITL observation needs the maintainer |

**Scope.** `CHANGELOG.md` `[Unreleased]`: replace "No unreleased changes yet." with the entry (seventh mode, foundations, selection, ask-once, PRD section, growth track, figure with the new animated byte size, Nico Azero credit, `Release class: minor`); `test/flow-figure-animated-contract.test.js:109-112`'s byte-size statement must match the committed file. Full sweep: `npm test` on Node 18 and 22, `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check`, `node bin/akili.js install --tool all --dry-run`, final leak grep over `git diff 8991113`. Dogfood in a scratch project (not this repo): PRD with personas → `brand` (no re-asked customer question) → `angles` with a request to "fill all 9" lacking material (expect `needs input`) → "looks good" on a pillar card (expect a clarifying question, still `draft`) → explicit approval → `post` citing an angle from a `draft` pillar (expect refusal) → `post` from an approved angle (three hooks, chosen hook only on the card).

| Field | Value |
|---|---|
| Command | The sweep commands above; each CHANGELOG clause quoted against HEAD |
| Red run (executed at baseline) | `grep -n "No unreleased changes yet" CHANGELOG.md` → `11:- No unreleased changes yet.` |
| Falsifier | State a wrong byte size in the entry → `flow-figure-animated-contract` FR-7 red |
| Disqualifier | One dogfood run of a non-deterministic agent is evidence, not proof — record it as observed once, on Claude Code only; a sweep run while another agent is active is not evidence (AGENTS.md concurrency rule) |
| Consumers | `test/flow-figure-contract.test.js:99-110` reads `[2.37.1]` or `[Unreleased]` — the dated `## [2.37.1]` section exists (`CHANGELOG.md:33`, as run), so that test reads it and is unaffected by the new `[Unreleased]` entry |

**Done.** Entry quote-checked; all sweep commands pass with counts recorded; dogfood steps recorded with outcomes; leak grep empty.

## 5. PR Strategy

~760 LOC (over ~400) → two PRs into `dev`, opened by the maintainer, not in this cycle:

| PR | Tasks | Review first |
|---|---|---|
| 1 — method + constitution + docs | T1–T7, T9's CHANGELOG lines for them | `## Invariants` diff (one sentence), `angles-framework.md` |
| 2 — figure | T8, its CHANGELOG lines | rendered PNG, figure test diff (no removed assertion) |

A single PR is acceptable if the maintainer prefers one review; the figure diff is mostly generated assets.
