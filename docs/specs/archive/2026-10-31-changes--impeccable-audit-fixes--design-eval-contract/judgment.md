# Judgment Day: design-eval-contract design

## Transaction

| Field | Value |
|---|---|
| Target | `design.md` sha256 `9b9c51b85857cfa1e3b7af939d3b9f4222ee2914fb102b09389b2a3dc23b90af` + `requirements.md` sha256 `d6ec2c180a01175bf9d80d00a19788684ff9b71fe168f8ac74c2b87372e3704a`, at HEAD `8268cb7` |
| Mode | judgment_day, requested by JC 2026-10-31 (Review Design at the Phase 2 gate) |
| Judges | Two blind read-only judges (A, B) on Sonnet; the design was authored on Opus (author ≠ auditor) |
| Skill resolution | `judgment-day` (its `references/` files are not packaged; contract taken from `SKILL.md`), sources: `impeccable-bridge`, its reference, `akili-audit`/`akili-validate`/`akili-constitution`, vendored `impeccable`, `/akili-specify` Step 2.2 |
| Round | 1 of 2; round-one correction applied, no re-judgment (JC chose **Fix only**, 2026-10-31) |
| State | closed: `fixed, not re-judged` |

## Counts

| Class | Count |
|---|---|
| Confirmed severe (both judges, both severe) | 2 (J-1, J-2) |
| Confirmed, severity split (one severe, one warning) | 1 (J-3) |
| Suspect severe (one judge), settled by the architect's re-run | 2 (J-4 true, J-5 true) |
| Confirmed warnings (both judges) | 9 (W-1 to W-9) |
| Single-judge warnings and suggestions (info) | 18 (I-1 to I-18) |
| Contradictions between judges | 0 |

## Confirmed severe

| ID | Judges | Finding | Evidence | Minimal fix |
|---|---|---|---|---|
| J-1 | A-1, A-2, B-3 | The first-visit outcomes do not partition the cases. `pass` is undefined. `covered` drops the "nor its descendant" tolerance, so a hit-test on the button's own `<span>` gives a false P1. FR-4's scenario (CTA top y=650 at 375x667, centre about 672) is neither `covered` nor `below fold` under FR-4's own "box starts below the viewport". There is no outcome for a missing CTA, a CTA hidden by style, or the top == H boundary. Reversion row 2 ("nothing breaks") is false | `SKILL.md:171`; requirements FR-4 *Outcomes* bullet and scenario *Below the fold, not covered* | Define `pass` (centre inside the viewport, hit-test returns the CTA or a descendant). Define `covered` (hit-test returns an element that is neither). Define `below fold` (centre at or below the bottom edge, or top ≥ H). Add `Unevaluated (no CTA found)` and `Unevaluated (CTA not visible: <style>)`. Keep the descendant clause, out of the sweep. Rewrite reversion row 2. **Needs amendment A2 to FR-4's `below fold` definition** |
| J-2 | A-4, A-5, B-4 | P-14 ("all of them, not a sample") and P-11 miss readers. The retired `First-visit pass` value `run` is never walked, and the surviving checklist item would contradict the new one | `grep -rn "Design Waivers\|First-visit pass\|first-visit pass" .claude docs README.md \| grep -v ^docs/specs/` → 22 hits. Missing: `design-evaluation.md:15, :97, :135, :147, :152`; `SKILL.md:113, :173, :176, :185`; `akili-constitution.md:212`. P-14's second grep was deferred to T1, against rule (e) | List every site in P-11 and P-14 with its mechanism. Add `run` to §7.5 and the sweep. State in §7.4 that `:97`, `:147` and `:152` are rewritten |

## Confirmed, severity split

| ID | Judges | Finding | Evidence | Minimal fix |
|---|---|---|---|---|
| J-3 | A-3 (severe), B-6 (warning) | CTA identification step 1 ("declared for the screen") has no authoring shape. Step 2 ("the design's Primary CTA policy") names a policy no AKILI template defines. Two agents can pick different CTAs. No premise row | `grep -rn -i "primary cta\|CTA policy" .claude docs README.md \| grep -v ^docs/specs/` → no policy; `akili-constitution.md` has 0 hits for `CTA` | Add a Screen Inventory column `Primary CTA` (selector or attribute) to §5.3 and the T4 constitution edit. Step 2 runs only when `docs/ux-ui/design.md` defines a Primary CTA style; otherwise step 3. Add an `existence` row. Re-rate P-16 to High |

## Suspect severe (one judge), settled by one re-run

| ID | Judge | Finding | Architect's re-run | Minimal fix |
|---|---|---|---|---|
| J-4 | B-1 (A-9 in part) | A1 and P-2/P-3 hold only for the POSIX launcher. `impeccable.cmd` reads `USERPROFILE`, not `HOME`. The cached name on Windows carries `.exe` | `grep -n -E "USERPROFILE\|%HOME%\|IMPECCABLE_BIN" .claude/skills/impeccable/scripts/impeccable.cmd` → `:51 set "home_bin=%USERPROFILE%\.impeccable\bin\impeccable.exe"`, `:60 … IMPECCABLE_HOME=%USERPROFILE%\.impeccable`, no `%HOME%`. **Confirmed** | Add row P-2b (`impeccable.cmd:29-31, 51, 60`). A1 sets the home variable the launcher reads: `HOME` for `scripts/impeccable`, `USERPROFILE` for `impeccable.cmd`. The pin path ends in `impeccable.exe` on Windows. The `HOME:` header field records the matching variable |
| J-5 | B-2 | "Export `IMPECCABLE_BIN` … for every later call" has no mechanism on hosts whose shell state does not persist between tool calls. A later call in a fresh shell reaches `scripts/impeccable:122-124` and runs the excluded engine | This session's own Bash contract: "Shell state (env vars, functions) does not persist". **Confirmed** | Keep the pinned `export` string (test `:63`). In item 4 and the *Launcher form*, require `IMPECCABLE_BIN=<pinned path>` as an inline prefix on every launcher call. Assert it. A-9: probe the pin directly after setting it; record `unavailable` on failure |

## Confirmed warnings (both judges)

| ID | Judges | Finding | Fix |
|---|---|---|---|
| W-1 | A-6, B-13 | The FR-7 inline option contradicts the vendored critique. Inline is allowed only with no sub-agent tool, and it needs the `⚠️ DEGRADED: single-context (<reason>)` banner. A run with no `Questions skipped: <reason>` line is incomplete (`critique.md:8-16`). No premise row | Inline A only when no sub-agent tool exists, running between E2 and E3. Carry the banner into a header field. Emit `Questions skipped: report-only (/akili-audit design)`. Add a row citing `critique.md:8-16` |
| W-2 | A-12, B-11, B-21 | Dropped obligations: FR-6 "the report's priority note cites the table" (no note in the template); FR-11 does not say which cell carries the clause ID; FR-7's list name (three spellings); FR-16 `docs/skills/impeccable.md` absent from §4 | Add a priority note to the template. Name the Scope/reason cell. Use FR-7's name. List `docs/skills/impeccable.md` as checked |
| W-3 | A-17, B-12 | Sweep phrase 5 targets `design-evaluation.md:154`, which is already correct. The stale site `akili-audit.md:159` ("nothing outside `docs/specs/audits/` was edited") and step 5 `:150` are not caught | Key on lines holding `` outside `docs/specs/audits/` `` and require the exception on each |
| W-4 | A-13, B-5, B-19, B-22 | §7.5 walk gaps. Not walked: `false positive` against exit `2`, `Unevaluated (consent banner…)` against validate (no row writes `WARN`), a waived first-visit outcome in *Screens Evaluated*, the `Install`/`Coverage`/`Excluded`/`incomplete` values, `/akili-propose`'s report read, `docs/skills/impeccable-bridge.md:24`. Count clash: "five commands" (§7.5) vs "six commands and two tests" (DD-3); grep gives 6 commands and 1 test | Add the rows and fix the counts as run |
| W-5 | A-14, B-15 | Machine load: `lsof -iTCP -sTCP:LISTEN` lists every listener, so `none` never occurs and two agents differ. No `ss` alternative | Define a "dev server" filter (process names or ports), exclude the audit's own server, allow `ss -ltnp` |
| W-6 | A-11, B-18 | Exclusion gaps. A candidate at location 1 or 5 can resolve into `~/.impeccable`. With no `IMPECCABLE_HOME` the state is undefined. §2 says A1 applies "with an engine present there"; §7.1 says always | Skip candidates whose resolved path is under `~/.impeccable`. Ask for an outside `IMPECCABLE_HOME` in the consent question, else `unavailable (excluded location, no IMPECCABLE_HOME)`. Align §2 |
| W-7 | A-8, B-14 | `npm ci` conflicts with checklist `:154`. It deletes an existing `node_modules`, runs install scripts, and has no failure state | `node_modules` must be absent and git-ignored. The consent names install scripts. Add `Unevaluated (Lighthouse unavailable: npm ci failed)` and a checklist exception for a recorded consented install |
| W-8 | A-16, B-19 | Ownership and naming. Assessment A order is given to the reference (§2) and to the bridge (§7.3), against NFR-2. §5.1 renames a template sub-line FR-11 keeps as `Page modes:`. §5.3 lets `desktop` be declared while §7.2 has no source for it | One owner (the bridge). Keep `Page modes:` and rename only the E1 check. Make desktop declarable in §7.2 or drop it from §5.3 |
| W-9 | A-18, B-11 | NFR-4 has no clause-to-assertion map. Unasserted: FR-1 AND and BUT, FR-2 "modified still leads", FR-3, FR-4, FR-6 and FR-12 BUT clauses; FR-15 has no check named. Groups sum to 61 with the spec-path group, not 60. The sweep walker's LOC is not budgeted | Add the map in §7.6. Name the Reviewer as FR-15's gate. Re-sum and re-budget |

## Info (one judge)

| ID | Judge | Finding |
|---|---|---|
| I-1 | A-7 | The delegated E4 brief must carry the suppression list and "no E3 output" |
| I-2 | A-10 | The `metadata:` removal range is undefined in shipped prose. Unlisted extra files are not counted as `modified` |
| I-3 | A-15 | No settle condition before the CTA measurement (entrance animations). "Banner visible" should reuse the item 3 measurement |
| I-4 | B-7 | A pinned engine run with the real `HOME` may still write `~/.impeccable` (`update-check.json`, `hook-claims` exist on this host). No row |
| I-5 | B-8 | `text-occlusion` behaviour on `aria-hidden` and its advisory status rest on the audit report (secondary). No row |
| I-6 | B-9, A (P-12) | P-12's cited test covers only the `akili-review` path. Cite KZ-changes--archify-diagrams-1 at `kaizen-log.md` and narrow the claim to the active spec path |
| I-7 | B-10, A (P-5, P-6) | Citation hygiene. `<npx cache>` is not reproducible. P-5 says "only", and the help text does not. P-4 has an elided `…`. `\|` inside `-E` patterns. P-10 is keyed on file names. P-6 cites a `.d.ts` schema, not the writer |
| I-8 | B-16 | Banner presence has no search procedure. A banner injected by a script reads `none in product` (a false green) |
| I-9 | B-17 | Does first-visit item 1 (the detector with flags) run at the short-height pair, and do its rows enter the *Scan matrix*? DD-4 is ambiguous; proposal R2 says hit-test and screenshot only |
| I-10 | A-13 | The *Screens Evaluated* cell has no format for four outcomes |
| I-11 | A (P-13), B (P-13) | P-13 says "only through the bridge"; commands hold restatements. No branch points named |
| I-12 | A (P-16) | P-16's impact is High, not Low (it changes DD-5) |
| I-13 | A-19 | Keep "decorative" in the `false positive` reason; `aria-hidden` is not a visual attribute |
| I-14 | A-20 | One P1 per screen listing its viewports, or one per viewport? |
| I-15 | A-21 | `Machine load` is per section, while FR-10's title says "beside each measurement" |
| I-16 | B-20 | Proposal §7 says `/akili-test` plans the short-height pair; the design leaves `akili-test.md:193` alone |
| I-17 | B-23, B-24 | Rows for `uptime`/`lsof` availability. §1 cites the "term-by-term walk, §7.6", but §7.6 has none |
| I-18 | B-25 | The consent question should say that A1 changes `HOME` for the download call |

## Premise Ledger verdicts

| Row | Judge A | Judge B | Merged |
|---|---|---|---|
| P-1 | confirmed | confirmed (POSIX) | confirmed; Windows twin missing (J-4) |
| P-2 | confirmed | contradicted for Windows | J-4 |
| P-3 | confirmed, incomplete (`.exe`) | confirmed (POSIX) | J-4 |
| P-4 | confirmed | confirmed | confirmed (hygiene I-7) |
| P-5 | partly re-run | partly confirmed | hygiene I-7 |
| P-6 | confirmed, weak | confirmed | I-7 |
| P-7 | confirmed | confirmed | confirmed |
| P-8 | confirmed | confirmed | confirmed; W-1 row missing |
| P-9 | confirmed | confirmed | confirmed |
| P-10 | confirmed | confirmed, method weak | confirmed (I-7) |
| P-11 | contradicted (incomplete) | incomplete | J-2 |
| P-12 | weak | partly confirmed | I-6 |
| P-13 | wording contradicted | thin | I-11 |
| P-14 | contradicted | contradicted | J-2 |
| P-15 | not re-run | not re-run | stays UNVERIFIED |
| P-16 | not re-run, impact mis-rated | not re-run | I-12, J-3 |

Missing rows named by the judges: Primary CTA policy (J-3), `impeccable.cmd` (J-4), `critique.md:8-16` (W-1), candidates resolving under `~/.impeccable` (W-6), `~/.impeccable` writes by a pinned engine (I-4), `text-occlusion` behaviour (I-5).

## Correction (round 1, Fix only)

JC's decision, 2026-10-31: fix J-1 to J-5 (J-3 included) and W-1 to W-9, with amendments A2 (FR-4) and A1-W (FR-1), without re-judgment; budget ~850 LOC approved.

| ID | Where fixed |
|---|---|
| J-1 | requirements FR-4 (A2 outcomes); design §7.2 item 3 (five ordered outcomes, descendant tolerance kept), §5.2, reversion row 2 |
| J-2 | design P-11, P-14 (full site lists, run before writing), §5.2 (`run` retired), §7.4 checklist rewrites, §7.5, §7.6 sweep (4) |
| J-3 | requirements FR-4 (A2 CTA order); design §5.3 (`Primary CTA` column, optional Primary CTA style), §7.2, DD-5, P-17; P-16 re-rated High |
| J-4 | requirements FR-1/FR-2 (A1-W, `USERPROFILE`); design §7.1 item 4, *Engine consent*, DD-2, P-2b, `.exe` pin |
| J-5 | design §7.1 item 3 and *Launcher form* (inline `IMPECCABLE_BIN=` on every call), pin probed after download, DD-1 |
| W-1 | design §7.3 *Suppressed in `/akili-audit design`* (sub-agent first, inline only without the tool, degraded, `Questions skipped:`), §7.4 E2b, DD-9, P-18 |
| W-2 | design §5.2 priority note, §5.3 (ID in the Reason cell), FR-7's list name used, §4 `docs/skills/impeccable.md` checked |
| W-3 | design §7.6 sweep pattern 7 (every design-mode `outside docs/specs/audits/` line names the exception) |
| W-4 | design §7.5 rewritten (six commands, one test, docs readings, propose, `waived` first-visit, exit `2`, informational values); §4 adds `akili-propose.md`, docs readings |
| W-5 | design §7.4 machine-load sources and dev-server filter, `ss -ltnp` |
| W-6 | design §7.1 item 2 (resolved-path rule), item 4 (no `IMPECCABLE_HOME` → ask, else `unavailable`), P-19; §2 aligned |
| W-7 | design §7.4 E3b (`node_modules` absent and git-ignored, install scripts in consent, failure state), checklist exception |
| W-8 | design §2/§7.3 (one owner: bridge), §5.1 (`Page modes` name kept), §7.2 (`desktop` declarable) |
| W-9 | design §7.6 clause-to-assertion map (68), FR-15 Reviewer gate, §12 re-budget |

Info items folded in where they touched a fixed cell: I-2 (`metadata:` range), I-6 (P-12 citation), I-7 (P-4, P-5 hygiene), I-9 (DD-4), I-10 (cell format), I-11 (P-13 branch points), I-12 (P-16 High), I-13 (`decorative`), I-4 (P-20 row). Others stay info.

## Terminal record

`fixed, not re-judged`: J-1, J-2, J-3, J-4, J-5, W-1, W-2, W-3, W-4, W-5, W-6, W-7, W-8, W-9. No `JUDGMENT: APPROVED` is recorded for this design.
