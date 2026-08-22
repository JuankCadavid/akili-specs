# Judgment Day Ledger — changes/branch-safe-kaizen

| Field | Value |
|---|---|
| Target | `proposal.md` + `requirements.md` + `design.md` (immutable set, 2026-08-21) |
| Mode | judgment_day, round 1 |
| Judges | 2 blind, parallel, read-only, opus (author ≠ auditor) |
| Raw counts | Judge A: 6 SEV / 12 WARN / 7 SUG · Judge B: 8 SEV / 15 WARN / 4 SUG |
| Merged | **7 confirmed severe · 2 suspect severe · 0 substantive contradictions · rest INFO** |
| State | **Round-one correction APPLIED (user chose "Fix only" — no re-judgment). Terminal: approved-with-fixes** |

## Round-One Fix Record (2026-08-21)

User-approved fix set, applied inline by the orchestrator (bounded to the listed IDs; the spec docs were authored this session, so no context transfer to a fix actor was warranted):

| ID | Fix applied |
|---|---|
| CS-1 | Entry filename → `<safe-spec-slug>.md`, no date prefix; re-run = exact-name existence check, glob eliminated (design §4/§5, FR-1, glossary, proposal) |
| CS-2 | Resolution order rebuilt: `Default Branch:` pin (constitution summary) → `origin/HEAD` → unique `main`/`master`; `init.defaultBranch` **never consulted**; both-exist = unresolved = defer (design §3, DD-1, FR-2 scenario, FR-7, glossary) |
| CS-3 | Surface row 1 now edits SKILL.md frontmatter `description:` (:3) — the discovery field — plus the body activation |
| CS-4 + SU-1 | Row 11 expanded to all four enumeration sites (resume, propose, specify, audit Step 0) + mirrors; FR-8 rewritten — archive clause removed as vacuous, audit self-read hazard named |
| CS-5 | Phrase-grep pattern → `the local edit now` / `every proposed edit now` variants that catch both skill lines; spec's own folder excluded from both greps (also resolves B-23) |
| CS-6 | DD-8 → group by Target (file or KZ-id) with three outcomes: digest-updates on same KZ-id **merge**; identical edits **dedupe**; differing edits **decide** (also resolves A-11, B-18a) |
| CS-7 | Commands consume the pin (loaded with root guides in Step 0), never the skill; per-command safe defaults when unpinned+unresolved (kaizen/archive defer, audit adds slug, resume treats as spec branch) |
| SU-2 | Row 2 range extended to phases 1–4 (~:47–102) incl. Measure's drift source |
| B-15 | Row 9: never-block fallback entry writes to the spec's entry file, never `kaizen-log.md` |
| B-12 | `deferred` status: produced by Defer in any apply menu; stays in backlog, re-offered (design §5, FR-3) |
| W-2 | Audit filename `drift-<date>[-<safe-branch>][-N].md`, single `-`, branch via `$SAFE_NAME`; "most recent" = report's `Date` header, lexical tie-break (FR-6, row 10, §4 example) |
| W-4 | Row 13 locator corrected: Step 0 foundation dirs (~:35–41) + Step 8 root-guide summary |
| A-10 | Scaffold README/`.gitkeep` never counts as entry/report; legacy fallback triggers on "no report files present" (FR-6, FR-7, row 13) |
| B-16 | "quick/ fails today" corrected to latent-and-conditional (lazily created) in FR-8 and §8 row 2 |
| W-3 / B-26 / A-19 | Correction-closure sweep into `proposal.md`: Step 2→Step 3, filename + ID grammar unified to `KZ-<safe-spec-slug>-<n>`, Apply Mode added to proposal scope |

Remaining INFO items (W-1 persona-drift interaction, W-5..W-8, A-13, B-19..B-21, B-27, remaining suggestions) stay recorded above; candidates for `tasks.md` done-criteria or a future spec, not silently discharged.

## Confirmed Severe (both judges — fix candidates)

| ID | Finding | Sources | Substance |
|---|---|---|---|
| CS-1 | Re-run glob `*--<safe-spec-slug>.md` cannot match the design's own example filename (date's single `-` precedes the slug) → every re-archive duplicates the entry file; and for flat slugs the glob matches the WRONG spec (`*--feature-a.md` matches `changes--feature-a`) | A-1, B-1 | design §5 vs §4; falsifies FR-1 "unique per spec by construction" + re-run scenario |
| CS-2 | Branch Context default-branch resolution silently resolves the WRONG branch: `symbolic-ref origin/HEAD` fails in this very repo (not a symbolic ref — a condition the design doesn't list), and fallback 2 `git config init.defaultBranch` is a new-repo setting, not a property of the repo (global `main` + repo default `master` ⇒ the real default branch is classified spec branch ⇒ apply defers forever, no error). No `main`+`master` tiebreak | A-2, B-2 | design §3; NFR-4's fail-safe doesn't trigger because nothing "fails" |
| CS-3 | Apply Mode's activation phrase is never added to the skill's frontmatter `description:` (SKILL.md:3) — the field that drives skill discovery; Surface Table row 1 edits only the body's Activation Contract, which is read AFTER load. Reproduces the exact unreachability DD-2 claims to close | A-3, B-3 | design row 1 / DD-2 |
| CS-4 | FR-8's carve-out mandate is orphaned in the design: only row 11 (resume) exists; `/akili-propose` related-spec read (akili-propose.md:75) has no row; FR-8's `/akili-archive` clause is vacuous (archive enumerates nothing) | A-4, B-4 (A-18 folds in) | requirements FR-8 vs design §7 |
| CS-5 | The immediacy-phrase grep cannot fail on the exact falsifier the same table row names: SKILL.md:85 says "**make** the local edit now", pattern has only "**apply** the local edit now" + "make every proposed edit now"; verified run misses :85. The KZ-006 gate has the KZ-006 blind spot | A-6, B-7 | requirements §8 row 1 / DD-10 |
| CS-6 | DD-8's ">1 item on one file ⇒ user decides" mishandles the design's own recurrence case: `digest-update` items target a KZ-id, not a file; two branches filing the same recurrence should MERGE (skill's recurrence rule), not prompt as contradiction; identical duplicate edits unhandled (append once or twice?) | B-6 SEV + A-11 WARN (substance corroborated; severity split) | design DD-8/DD-3/§5 |
| CS-7 | `/akili-audit` (branch-slug suffix) and `/akili-resume` (default-branch condition) must execute Branch Context but never load the kaizen skill where DD-1 exclusively defines it; no row adds the load or an inline copy | B-8 SEV + A-14 WARN (substance corroborated; severity split) | design DD-1 / rows 10–12, FR-6/FR-3 |

## Suspect Severe (one judge — parent-verified TRUE, not auto-fixed per protocol)

| ID | Finding | Source | Parent verification |
|---|---|---|---|
| SU-1 | Two more live `docs/specs/` enumerations uncovered: `akili-audit.md:30` (Step 0 "any active specs" — post-FR-6 the audit would read its own prior reports as specs) and `akili-specify.md:91` ("nearby or dependent specs") | A-5 | Both quotes verified against the working tree |
| SU-2 | The kaizen skill's Measure drift source (SKILL.md:59) falls outside all four Surface Table ranges for SKILL.md (~:20, :63–102, :104–149, :151–158) | B-5 | Row ranges are as written in design §7; :59 is in phase 1 |

## Corroborated Warnings (INFO — recorded, not in the severe fix set)

| ID | Finding | Sources |
|---|---|---|
| W-1 | Appending the persona guardrail makes every deployed `.agents/leader|implementer.md` register as structural drift on the next `/akili-audit`; interaction unnamed | A-7, B-14 |
| W-2 | Audit filename separator contradicts itself (§4 `--feat-b` vs FR-6/row-10 single `-`); "most recent file" has no defined ordering (lexical vs mtime, same-date ties) | A-8, A-9, B-17 |
| W-3 | proposal.md locates archive syncs at Step 2; repo and the other two docs say Step 3 | A-17, B-9 |
| W-4 | Surface row 13 locator wrong: constitution dirs live in Step 0 (:35–41), not "Step 2 dirs (~:36)"; "+ summary step" has no locator | A-15, B-10 |
| W-5 | "17 surfaces" counts table rows (18+ distinct files); ~260-line budget underived | A-20, B-11 |
| W-6 | Patch classification framed against a "default minor for methodology behavior changes" rule that AGENTS.md does not state | A-25, B-22 |
| W-7 | Constitution's own Verification Checklist (:862–878) not extended for the two new scaffolded dirs — the exact parallel of the audit-checklist case the spec DID catch | A-16, B-13c |
| W-8 | Apply Mode degenerate cases unspecified: empty backlog; invoked on a spec branch; resume dashboard on a spec branch | A-12, B-18 |

## Single-Judge INFO (warnings)

A-10 scaffolded `.gitkeep`/README defeats FR-6's "absent **or empty**" fallback and pollutes FR-1's Learn read · A-13 Learn's entry-file read set grows unboundedly (DD-3 bounds file size, not count) · B-12 `deferred` Status is producible by no step yet FR-4 consumes it · B-15 archive's never-block fallback (akili-archive.md:189) still writes kaizen-log.md from a spec branch; row 9 doesn't redirect it to the entry file — a single-writer violation as written · B-16 "`quick/` triggers the bug **today**" is false in this repo (no `quick/` exists; latent-and-conditional, not live) · B-19 digest completeness contract changes for consumers (deferred lessons no longer arrive at archive time) while NFR-1 frames the invariant as read cost only · B-20 merged-backlog digest semantics (≤10-row eviction, simultaneous digest-update + new row) unspecified · B-21 multi-`trd-adr` allocation order / missing TRD / stale old-ADR reference unspecified · B-23 §8 greps self-hit the spec's own folder (8 hits) — burden self-inflation · B-13a/b/d `docs/skills/README.md:30`, `docs/openspec-comparison.md:30` (assessed-vs-dropped ambiguity), `docs/specs/kaizen-log.md:3–6` header · B-27 constitution's inline-draft persona fallback (:393) never receives the guardrail

## Suggestions (INFO)

A-19/A-23 lesson-ID grammar differs across the three docs (`/` illegal in digest IDs; old-vs-new grammar recurrence unstated) · A-21 openspec-comparison two-list ambiguity · A-22 phrase-grep hits outside the Surface Table (verified list) will fail the gate as written · A-24 own-deliverable exemption has no recording mechanism; interaction with Scope Discipline unstated · B-24 "11 of 12" evidence unverifiable · B-25 "six sites"/"ten sites" counts have no enumeration · B-26 Apply Mode invisible in the approved proposal intent

## Clean verdicts (both judges)

No violation of: "no separate kaizen command", consumers-read-only-the-digest (all four read lines untouched), never-block invariant (as *required* — B-15 notes the *fallback path* text), skill governance. The design's claim "no command text mentions branches in any write path" — VERIFIED by Judge B. All DDs trace to requirements; no orphan DDs.
