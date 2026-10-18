# Tasks: `diagram-design` — Interactive Methodology Diagrams via Archify

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/archify-diagrams` |
| Depth | Standard |
| Status | Draft — awaiting the specify approval gate |
| Date | 2026-10-18 |
| Baseline | `854547f` — `npm test` 259/259 pass; `grep -c diagram-design` = 0 in every target file; `.claude/skills/diagram-design` absent |
| Commit prefix | `[SPEC:changes/archify-diagrams]` — local commits only, no push |

## 2. Task List

### T1 — Author `diagram-design` skill (`SKILL.md` + `references/slot-catalog.md`)

| Field | Value |
|---|---|
| Status | [x] |
| Size | M (~180 LOC) |
| Depends on | none |
| Requirements | FR-1, FR-2, FR-3, FR-4, FR-5, FR-6, FR-7, NFR-1, NFR-2, NFR-3, NFR-4 |
| Design | §4, §5.1–5.3, §6, §7 (sections 1–8), DD-1…DD-5, DD-7, DD-8 |
| Scope | Create `.claude/skills/diagram-design/SKILL.md` with the eight sections of design §7 and the frontmatter of FR-1; create `references/slot-catalog.md` holding every row of the FR-2 table plus the §5.1 type mapping; the link line of §5.2 verbatim; the availability check of §5.3; the three outcomes of §6 |
| Tests | Static reads below |
| Verification | (1) `head -12 SKILL.md` shows `binding: conditional`, `author: Juan Carlos Cadavid — jcadavid.com`, `inspired-by` naming Archify, `tt-a1i`, `MIT`, `https://github.com/tt-a1i/archify`; `grep -cE "adapted-by\|adapted-for\|^  source:"` = 0. (2) Each FR-2 row (10) is present in `slot-catalog.md` — walk the table row by row. (3) `grep -c "Interactive view:"` ≥ 1 and matches §5.2 wording. (4) `grep -nE -- "--quality\|--json\|--repo-root\|--out-dir\|finalize "` → 0 hits (DD-5). (5) `wc -c SKILL.md` ≤ 8192; `du -k` of the directory ≤ 16 |
| Falsifier | Delete the `browser check not run` clause → verification (3)/FR-4 walk reports the missing scenario; add `--quality showcase` to the text → (4) returns 1. Baseline (run): the directory does not exist → every check fails |
| Red run | n/a — rules text; baseline absence quoted above |
| Disqualifier | A check satisfied only by the frontmatter while the body omits the obligation (e.g. "explainer" named in `description` but no guard-rail sentence) is not evidence — each FR-7 bullet must be found in section 7 by its own sentence |
| Consumers | none (new file) |
| Review | `full` — new rules document executed by agents in every target project |
| Done | All five checks pass; every FR-3/4/5/6/7 scenario clause maps to a sentence (Reviewer walks clause by clause, KZ-changes--gate-falsifiability-2) |
| Skills | `cognitive-doc-design` |

### T2 — Wire `/akili-constitution` Steps 3, 4, 5

| Field | Value |
|---|---|
| Status | [ ] |
| Size | S (~6 LOC) |
| Depends on | T1 |
| Requirements | FR-8 (rows 1–3), FR-2 scenario "TRD always carries both C4 slots" |
| Design | §6 row 1, §8 row 1, DD-2 |
| Scope | One conditional line in Step 3 (PRD), Step 4 (UX/UI), Step 5 (TRD — states C4 Context + Container always) loading `diagram-design`; no slot type, path, or `archify` named in the lines |
| Verification | `grep -n "diagram-design" .claude/commands/akili-constitution.md` → exactly 3 hits, and the nearest preceding `### Step` heading for each is Step 3, Step 4, Step 5; `grep -ci "archify" .claude/commands/akili-constitution.md` → 0 |
| Falsifier | Baseline (run at `854547f`): `grep -c diagram-design` = 0. Moving the Step 5 line under Step 6 → heading check fails |
| Red run | n/a — rules text |
| Disqualifier | A hit inside a code fence or an example block does not count as wiring |
| Consumers | none — no test parses constitution step text for skill names (`grep -rn "akili-constitution.md" test` → checked by the Implementer before edit) |
| Review | `checklist` — three one-line insertions |
| Done | Verification passes; `git diff --check` clean |
| Skills | none |

### T3 — Wire `/akili-specify` Step 2.1

| Field | Value |
|---|---|
| Status | [x] |
| Size | XS (~2 LOC) |
| Depends on | T1 |
| Requirements | FR-8 (row 4) |
| Design | §8 row 2, P-11 |
| Scope | One conditional line beside the UI and animation lines (`akili-specify.md:213–220`): an architecturally significant design loads `diagram-design` and fills the `design.md` slots the change alters |
| Verification | `grep -n "diagram-design" .claude/commands/akili-specify.md` → 1 hit inside Step 2.1 (line number between the `#### Step 2.1` and `#### Step 2.2` headings); `grep -ci archify` on the file → 0 |
| Falsifier | Baseline (run): 0 hits. Line placed in Step 3.2 → range check fails |
| Red run | n/a |
| Disqualifier | Same as T2 |
| Consumers | none |
| Review | `checklist` |
| Done | Verification passes |
| Skills | none |

### T4 — `/akili-archive` Step 2 summary item 11 "Diagrams"

| Field | Value |
|---|---|
| Status | [ ] |
| Size | XS (~3 LOC) |
| Depends on | T1 |
| Requirements | FR-8 (row 5), FR-8 scenario clause "leave `/akili-archive` Step 3 unchanged" |
| Design | §8 row 3, DD-6, P-10, P-12 |
| Scope | Append item 11 to the Step 2 summary list: the spec's interactive-view links, and each baseline slot the spec's design made stale listed as a follow-up; the line loads `diagram-design` only when the spec has a `diagrams/` folder or slot |
| Verification | `sed -n '/### Step 2: Create Archive Summary/,/### Step 3/p'` shows item 11; `git diff --stat` touches no line between `### Step 3` and `### Step 4`; `grep -c "Kind" .claude/commands/akili-archive.md` unchanged from baseline (count run before edit and quoted) |
| Falsifier | Adding a `diagram-sync` kind to Step 3 → Step 3 range diff non-empty |
| Red run | n/a |
| Disqualifier | Item 11 that names a write to `docs/trd/trd.md` violates DD-6 even if Step 3 is untouched |
| Consumers | P-12: `archive-summary` readers — only `akili-archive.md:109`, `:201` |
| Review | `checklist` |
| Done | Verification passes |
| Skills | none |

### T5 — Point `software-architect` views reference at `diagram-design`

| Field | Value |
|---|---|
| Status | [ ] |
| Size | XS (1 line) |
| Depends on | T1 |
| Requirements | FR-8 (last paragraph) |
| Design | §8 row 4 |
| Scope | Extend `views-documentation.md:14` sentence "Mermaid is the default renderer in AKILI docs." with a pointer to `diagram-design` for slots, storage, and the optional interactive view; the original clause stays |
| Verification | `grep -c "Mermaid is the default renderer" ` = 1 and `grep -c "diagram-design"` = 1 on the file; `git diff --stat` = 1 file, 1 line |
| Falsifier | Replacing (not extending) the sentence → first grep = 0 |
| Red run | n/a |
| Disqualifier | none beyond the grep |
| Consumers | `software-architect/SKILL.md:65` routes to this reference — content-only change, no rename |
| Review | `skip-eligible` — claim to prove at execute: the diff is a single-line extension that keeps the original clause byte-for-byte |
| Done | Verification passes |
| Skills | none |

### T6 — Governance, docs, counts, install test, CHANGELOG

| Field | Value |
|---|---|
| Status | [ ] |
| Size | M (~90 LOC) |
| Depends on | T1–T5 |
| Requirements | FR-9, FR-10, FR-1 scenario "No Archify file ships", NFR-5 |
| Design | §8 rows 5–8, P-5 |
| Scope | `governance.md` conditional row + env-provided example; `docs/skills/diagram-design.md` (page format of `stitch-design.md`); `docs/skills/README.md` row (alphabetical); `README.md` optional-Archify note with credit and licence; `docs/cli.md:183,195,216` 24→25; `test/install-cursor.test.js` literal 199 and comments 199/210/24/35 → counts **measured after T1** (`find .claude/skills -type f \| wc -l`, `ls .claude/skills \| wc -l`); `CHANGELOG.md` `[Unreleased]` entry replacing "No unreleased changes yet." |
| Verification | `npm test` all pass; `npm run verify:cli` lists `diagram-design`; `npm run pack:dry-run` unpacked delta vs baseline 4 494 174 B ≤ 20 KB; `npm pack --dry-run --json` file list grep for `archify.mjs\|renderers/\|\.schema\.json\|brand-marks\|THIRD_PARTY` → 0; `grep -rn "24 packaged" README.md docs --exclude-dir=specs` → 0 (baseline run: 3); `grep -rn "model:" .claude/skills/diagram-design` → 0; `git diff --check` clean |
| Falsifier | Leave the test literal at 199 → `npm test` fails with "expected 199 packaged skill files … counted N" (to be executed and quoted by the Implementer after T1, before the edit) |
| Red run | The install test run after T1 and before this task's edit — expected red on the 199 assertion; quote the message |
| Disqualifier | A CHANGELOG clause not quote-checked against the shipped file at HEAD is not evidence (KZ-002); counts written before T1 lands are predictions, not measurements |
| Consumers | P-5: `test/install-cursor.test.js:216,232,245,246,340,387`; `docs/cli.md:183,195,216`; archived specs mentioning "24 packaged" are history — intentionally kept |
| Review | `full` — summary surfaces carry the highest recurrence (KZ-002 ×6) |
| Done | All verification passes; every CHANGELOG clause has a quoted source line in the Implementer report |
| Skills | `cognitive-doc-design` |

### T7 — Executed walkthrough against real Archify (validation evidence)

| Field | Value |
|---|---|
| Status | [ ] |
| Size | S (no shipped LOC; evidence in `execution.md`) |
| Depends on | T1–T6 |
| Requirements | FR-3, FR-4, FR-5, FR-6, FR-7 (behavioural proof); settles P-13 |
| Design | §5.2, §5.3, §6, DD-3, DD-7 |
| Scope | In a scratch project under the session scratchpad (never in this repo), with Archify `208acba` copied to its `.claude/skills/archify`: follow `diagram-design` to fill (a) a TRD C4 Container slot (cited case) and (b) a **held-out** `lifecycle` slot not used as an example in the skill; repeat (a) with `ARCHIFY_CHROME=/nonexistent` and with Archify removed; edit the Mermaid of (a) with Archify removed (FR-6). First step: record whether the host lists `archify` as a skill (P-13) |
| Verification | Per run, record: files produced vs FR-4 paths; link line vs §5.2; receipts ignored by `git check-ignore`; browser-skipped suffix present; Archify-absent run has no link and no `diagrams/` files; FR-6 run removed link + files; no rules file modified (`git status` of `~/.claude/CLAUDE.md` unchanged — checksum before/after) |
| Falsifier | Any run whose outputs differ from the skill text → FAIL naming the sentence; the held-out case must be judged against the general sentence, not an example |
| Red run | n/a |
| Disqualifier | A run where Archify was found through a path other than the one the skill names (e.g. a global install shadowing the scratch copy) — mask by checking `~/.claude/skills/archify` absence first and recording it |
| Consumers | none |
| Review | `full` — the dominant defect class (requirements §8) has no automated gate |
| Done | All four runs recorded in `execution.md`; P-13 row updated; perceptual quality left as the accepted risk |
| Skills | none |

## 3. Coverage Map (scenario / clause level)

| Requirement · scenario · clause | Task |
|---|---|
| FR-1 frontmatter fields, `binding: conditional` | T1 (1) |
| FR-1 BUT no `adapted-by`/`adapted-for`/`source` | T1 (1) |
| FR-1 MUST name Archify, tt-a1i, MIT, URL | T1 (1) |
| FR-1 "No Archify file ships" — zero matches; only AKILI-authored files | T6 pack grep; T1 scope |
| FR-2 ten catalog rows | T1 (2) |
| FR-2 TRD C4 Context + Container with legend | T1 (2), T2 Step 5 line, T7 (a) |
| FR-2 BUT no slot whose condition is false | T1 section 2; T7 (b) |
| FR-2 MUST: absence is the signal | T1 section 2 |
| FR-3 Mermaid + legend, no link, no implied view | T1 section 3; T7 Archify-absent run |
| FR-4 paths, gates passed, link line + credit | T1 section 4; T7 (a) |
| FR-4 BUT receipts not committed (`.gitignore`) | T1 section 4; T7 `git check-ignore` |
| FR-4 MUST reuse slot paths | T1 section 4; T7 re-render |
| FR-4 browser-skipped: keep + link + suffix, never verified | T1 sections 4–5; T7 browser-less run |
| FR-5 Mermaid only, continue, report line | T1 section 5; T7 Archify-absent run |
| FR-5 delete partial output; BUT no retry beyond Archify's limit | T1 section 5 (failure path not executable on demand — Reviewer walk) |
| FR-6 re-render or remove; MUST report removal | T1 section 6; T7 FR-6 run |
| FR-7 four guard-rails | T1 section 7 |
| FR-7 BUT never alter user config/env | T1 section 7; T7 checksum |
| FR-8 rows 1–3 | T2 |
| FR-8 row 4 | T3 |
| FR-8 row 5 + MUST leave Step 3 unchanged | T4 |
| FR-8 views-documentation pointer | T5 |
| FR-8 BUT no command names `archify` | T2, T3 (`grep -ci archify` = 0); T4 same check added by Reviewer |
| FR-9 all bullets | T6 |
| FR-10 all bullets | T6 |
| NFR-1, NFR-2 | T1 (5), slot catalog in `references/` |
| NFR-3 | T1 §5.3 is the only place with host roots; T2–T4 lines carry none |
| NFR-4 | T1 section 7; T6 grep for `npx` outside the README note |
| NFR-5 | T6 `model:` grep |

## 4. Estimate & Delivery Strategy

| Measure | Value |
|---|---|
| Tasks | 7 |
| Estimated LOC | ≈ 300 |
| PR strategy | Single PR (< 400 LOC, linear graph); local commits only in this run — no push |
| Parallel | T2–T5 can run in parallel after T1; T6 after T1–T5; T7 last |
| `skip-eligible` | **T5** — single-line extension keeping the original clause byte-for-byte |

## 5. Recommended First Task

**T1** — every other task points at the skill it creates.
