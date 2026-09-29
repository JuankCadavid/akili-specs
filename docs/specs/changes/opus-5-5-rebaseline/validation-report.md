# Validation Report — Re-baseline AKILI for Claude Opus 5.5

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/opus-5-5-rebaseline` |
| Date | 2026-09-29 |
| Validated at | `f291f17` (baseline `31b6d31`) |
| Auditor | Claude Opus 5.5 (T3). The Implementers ran on `sonnet`, so author ≠ auditor holds. This session also led `/akili-execute`, so the independence is by model, not by context |
| Inputs | `proposal.md`, `requirements.md`, `design.md`, `tasks.md`, `execution.md`, `judgment.md`. No `test-report.md`: this is a prose-only spec with no test gate (every task has `Red run: n/a`) |
| Constitution | Root `CLAUDE.md` → `AGENTS.md`. There is no `docs/prd.md`, `docs/ux-ui/design.md`, `docs/trd/trd.md` or `docs/specs/general-setup/`; `requirements.md` Document Control records this |

## 2. Summary

**Verdict: archive-ready, 0 FAIL. The 3 WARNs raised by this audit were resolved on 2026-09-29 by `a4f1241` (`[SPEC:quick/model-routing-history-wording]`); see §11.**

| Result | Count |
|---|---|
| PASS | 4 tasks · 7 FR · 5 NFR · 5 Success Criteria · build gates |
| WARN | 3 (all prose accuracy in `docs/model-routing.md`; none changes behavior) |
| FAIL | 0 |
| BLOCKED | 0 |

All four tasks closed on a Reviewer `PASS`. The shipped diff touches exactly the five in-scope files. The gates hold on the final tree when re-run independently. The three WARNs are small wording issues in `docs/model-routing.md`, and one `/akili-quick` edit can close them all.

## 3. Task Completion

| Task | Status | Evidence in `execution.md` | Result |
|---|---|---|---|
| T1 `model-routing.md` for Opus 5.5 | `[x]` | Attempt 1; checks 1–8 plus the executed falsifier (2 reds); evidence re-run VERIFIED; Reviewer PASS | PASS |
| T2 "Don't stop short" personas | `[x]` | Attempts 1–2 with the full FAIL report; re-run VERIFIED ×2; Reviewer PASS | PASS |
| T3 `Not Done` split and bound | `[x]` | Attempt 1; four-case walk including the held-out case; re-run VERIFIED; Reviewer PASS | PASS |
| T4 CHANGELOG + closure sweep | `[x]` | Attempts 1–2 with the full FAIL report; the count misreport (5 vs 6) is recorded; Reviewer PASS | PASS |

Every entry was written before its checkbox and committed with the `[SPEC:changes/opus-5-5-rebaseline]` prefix (`53bc9d3`, `b58bbfd`, `1894da6`, `f291f17`).

## 4. File Existence

The design (§4) names no new files, only edited sections. Actual state:

| Expected (design §4) | `git diff --stat 31b6d31`, excluding the spec folder | Result |
|---|---|---|
| `docs/model-routing.md` | +88 lines changed | PASS |
| `.claude/templates/implementer.md` | +1 | PASS |
| `.claude/templates/tester.md` | +1 | PASS |
| `.claude/commands/akili-execute.md` | +9 −2 | PASS |
| `CHANGELOG.md` | +2 −2 | PASS |
| Frozen (NFR-1): `bin/`, `scripts/`, `package.json`, `reviewer.md`, `leader.md`, `akili-constitution.md`, `docs/commands/` | absent from the stat | PASS |

## 5. Build Integrity

| Command | Result |
|---|---|
| `npm run verify:cli` | PASS: `11 commands \| 24 skills \| 7 resources (akili-specs v2.27.0)` |
| `npm run pack:dry-run` | PASS: `akili-specs-2.27.0.tgz` |
| `git diff --check 31b6d31` | PASS: exit 0 |

No `docs/infrastructure.md` environment contract applies, so the boot smoke is not applicable.

## 6. Requirement Coverage

Each requirement was checked at scenario and clause level, with a gate re-run on `f291f17`.

| Req · clause | Owner | Evidence (re-run by the auditor) | Result |
|---|---|---|---|
| FR-1: `medium` start; `xhigh`/`max` for measured gains; lower effort first; names not portable; `max_tokens` headroom | T1 | *Opus specifics* carries all five in DD-1 order (read in the diff) | PASS |
| FR-1: provenance plus the `AKILI-measured: none yet` line | T1 | URL plus `fetched 2026-09-29` in *Opus specifics* and *Time signals*; `AKILI-measured` = 1 | PASS |
| FR-1 scenario, *BUT must NOT find start-high* | T1 | obligation grep across `.claude docs README.md` (without `docs/specs`) → **0** | PASS |
| FR-2: no present-tense current Opus 5; names 5.5; the worked example kept | T1 | 6 `Opus 5` hits (103, 104, 189, 273, 368, 414); all history except `:189`, see WARN-3; "resolves to Opus 5.5"; the worked example is intact plus the 5.5 clause | PASS (WARN-3) |
| FR-3: values kept, pointer added; *BUT no Opus-derived `medium`* | T1 | T1/T2/T3/T5 rows byte-identical to baseline; the pointer sentence is under the table | PASS |
| FR-4: shapes, legitimate stops, notes-with-action, carve-out; both scenarios | T2 | `Don't stop short` 1/1/0/0 (impl/tester/reviewer/leader); Pivot-Detection is rendered as flag-and-deliver; the Tester list includes `PASS`; no `FATAL_FAIL` in `tester.md` | PASS |
| FR-5: three rows, precedence, cap 2, accounting, `continuations:` line, `/goal` provision | T3 | item 0 read whole; `2 continuations` at item 0 and the `<N>` formula; the Accounting rule and Budget Tripwire lines are unchanged | PASS |
| FR-5 scenarios: *mixed*, *stops short twice* (incl. *BUT must NOT decrement*), *gated unchanged* | T3 | the `gated` row reproduces "re-spawn for the remainder, or mark `[~]` and escalate" | PASS |
| FR-6: harness-injected, advisory, Reviewer excluded, fallback; *BUT personas must NOT reference* | T1 | all four bullets are present; `elapsed` in `.claude/templates .claude/commands` → 0 | PASS |
| FR-7: CHANGELOG in user terms | T4 | the `Unreleased` → `### Changed` entry matches the shipped text (Reviewer attempt 2) | PASS |
| NFR-1: bounded surfaces | all | §4 above | PASS |
| NFR-2: provenance, nothing presented as AKILI-measured | T1, T4 | the CHANGELOG says "not a result AKILI has measured" | PASS (WARN-2) |
| NFR-3: adjacency to `scoped-constitution-reads` | T2 | line 14 byte-identical in both personas | PASS |
| NFR-4: no contradiction with neighbours | T1–T3 | Reviewer whole-paragraph walks; the T2 contradiction was fixed at attempt 2 | PASS (WARN-1) |
| NFR-5: restatement sweep keyed on the obligation | T1, T4 | obligation grep 0; the `open-ended agentic` / `for coding and agentic` sweep finds only the history line | PASS |

**Proposal Success Criteria:** 1 PASS (the grep above) · 2 PASS (the role values are unchanged, so every restating surface agrees) · 3 PASS (the legitimate stops are consistent with the truthful partial and the Pivot bullet) · 4 PASS (the `gated` row) · 5 PASS (§5).

## 7. Linting & Code Quality

The linters (`git diff --check`) are clean. The spec contains no code.

**4R advisory findings.** These are advisory only and do not drive the verdict:

| Lens | Finding | Source |
|---|---|---|
| Risk | *Opus specifics* now says to reserve `xhigh`/`max` for measured gains. The same *Effort dial* still prescribes unmeasured `xhigh` in four places: policy table Complex/Correctness-critical, role-table "architecturally significant", the under-specified rule, and rework attempt 3. DD-1 reconciled only two sites | T1 Reviewer ADVISORY 1 (carried forward) |
| Reliability | A `Not Done` field with **no** owed item (assumptions-only or inconclusive) blocks `[x]` and never continues, but names no next action. An unattended `pre-approved` run could idle on it until the turn bound | T3 Reviewer note (carried forward) |
| Readability | Minor text beyond DD-1/DD-2/DD-5 (a "second confirmation" clause, meta-commentary on kept points, a "no persona emits this line" paragraph) | T1 Reviewer ADVISORY 4 (carried forward) |
| Risk | This repo's own untracked `.agents/implementer.md` / `tester.md` lack the new rule (0 hits); they already differed from the templates before this spec. Dogfooding sessions keep the old persona until `/akili-constitution` re-syncs them | Found by the auditor |

## 8. Design Conformance

| Check | Result |
|---|---|
| DD-1: 7-point order, kept points (a)/(b), no sibling section | PASS |
| DD-2 site table (`:103`, `:363`, `:392`, `:188`/`:272` kept, `:275` clause, `:374–375` re-anchored) | PASS (WARN-1, WARN-3) |
| DD-3: sibling bullet after the truthful-partial bullet; Tester's own outcomes only; anchor phrase | PASS. Pivot-Detection handling was refined at T2 attempt 2 and recorded in `execution.md` |
| DD-4: precedence, accounting, `continuations:` line, `/goal` formula | PASS |
| DD-5: *Time signals* before `## Review intensity`, only in `model-routing.md` | PASS |
| DD-6 non-changes | PASS |
| Cross-document figures | Design §9 budgeted ~75 lines and 6 rounds; actual was ~90 lines and 7 rounds. Both tripwires fired, were recorded, and were accepted by the user. The baselines in `tasks.md` (B1 = 2, B3–B8 = 0) are consistent with the design's P-1 and P-3. No contradicted figure was found |
| Proposal intent, scope and non-goals | Aligned. The role values are frozen, `reviewer.md` and `leader.md` are untouched, and no installer change was made |

### WARN findings

| ID | Finding | Why WARN, not FAIL |
|---|---|---|
| **WARN-1** | The reconciliation paragraph (`docs/model-routing.md` ~:370–372) says "the premise that used to motivate sweeping T1/T3 upward no longer holds". The old text argued the **opposite**: AKILI's defaults sit *below* the vendor's and should not be pushed up. The sentence misdescribes the history it replaces (NFR-4, FR-1 accuracy) | It gives no instruction, and the operative rules around it ("awaits the sweep", *Sweep, don't assume*) are correct |
| **WARN-2** | NFR-2 says every vendor figure carries the URL and date. The historical Opus 5 pairing (`xhigh`/`high`, ~:368–369) carries neither, and the Opus 5.5 `medium` figure in the same sentence carries them only by cross-reference to *Opus specifics* | The 5.5 figure is sourced one section away. The Opus 5 figure is labelled history and was never fetched on 2026-09-29, so a date would be false; a source link without a date would satisfy the intent |
| **WARN-3** | FR-2's scenario requires every `Opus 5` hit to read as "past tense or an explicit previous-generation reference". `:189` reads "Opus 5, for instance, **does not share**…", which is present tense and not labelled previous-generation | It is a still-true quota fact, not a current-generation claim. The T1 Reviewer judged it conformant; this audit reads the scenario's wording literally |

## 9. Test Evidence Summary

There is no `test-report.md`. Prose-only methodology changes have no executable test gate: each task declares `Red run: n/a (no test gate)`, and requirements §8 accepts behavioral effect as unmeasurable in this repo. The evidence of record is:

| Kind | Where |
|---|---|
| Executed falsifiers (reds observed) | T1 (2 reds), T2 (1 red): `execution.md` |
| Walk falsifiers incl. a held-out case | T3 (four cases): `execution.md` |
| Non-author evidence re-runs | Every attempt: `VERIFIED` (one count misreport at T4 attempt 1, corrected) |
| Independent gate re-run | This report, §5–6 |

Result: **PASS** for a spec of this kind. `/akili-test` adds nothing here, because there is no runnable surface.

## 10. Agent Guide / Constitution Impact

There are no `## Constitution Impact` blocks. No module was created or reshaped, and no child guide or `## Module Guides` entry is owed. The CodeGraph re-index at archive is routine (prose files only). See §7 for the local `.agents/` persona drift.

## 11. Remediation

| # | Finding | Recommendation | Route |
|---|---|---|---|
| 1 | WARN-1 | Reword to: "…so the vendor's starting point is no longer above AKILI's mid-range — the old reconciliation, which held AKILI's defaults *below* the vendor's, no longer needs that gap to justify it." | `/akili-quick` (copy-only, one paragraph) |
| 2 | WARN-2 | Add the source link beside the historical Opus 5 pairing, or drop the specific values and keep "the previous generation's higher starting points" | same `/akili-quick` |
| 3 | WARN-3 | `:189`: "does not share" → "did not inherit", or prefix "(previous generation)" | same `/akili-quick` |
| 4 | Advisory: unmeasured `xhigh` prescriptions | Kaizen retrospective at archive, then a proposal if it holds | `/akili-archive` → kaizen |
| 5 | Advisory: a no-owed-item `Not Done` has no next action | Kaizen, or a follow-up `/akili-propose` | `/akili-archive` → kaizen |
| 6 | Advisory: local `.agents/` lacks the new rule | Re-sync the personas via `/akili-constitution` | after archive |

**Resolution (2026-09-29):** rows 1–3 were fixed in `a4f1241` via `/akili-quick`:
- WARN-1: the sentence now says the old reconciliation held AKILI *below* the vendor.
- WARN-2: the 5.5 `medium` figure carries its URL and date inline; the unsourced Opus 5 values are dropped, and the CHANGELOG parenthetical is aligned.
- WARN-3: `:189` now reads "did not share … when it shipped".

The re-run on the fixed tree: obligation grep 0; all `Opus 5` hits past tense; role table unchanged; `verify:cli` and `git diff --check` pass. Rows 4–6 remain advisory for the archive.

## 12. Archive Readiness Recommendation

**Ready to archive.** All tasks are `[x]`, there are no FAILs, the build gates pass, and WARN-1..3 are resolved. The two paths originally offered were:

- **Fix first (recommended):** one `/akili-quick` edit closes WARN-1..3 (about 4 lines, one file), then archive.
- **Accept the WARNs:** archive now and carry WARN-1..3 into the kaizen entry.

```text
/akili-archive changes/opus-5-5-rebaseline
```
