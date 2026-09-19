# Judgment Day — `changes/review-intensity-routing`

## Transaction

| Field | Value |
|---|---|
| Target | `requirements.md` + `design.md`, immutable at commit `1e2b51f` |
| Mode | `judgment_day` — blind dual review, selected by the user at the Step 2.5 gate |
| Reason offered | `design.md` §11 carried an open `UNVERIFIED` premise of **High** Impact (P-14), which the shipped Step 2.5 rule says makes **Review Design** the recommendation |
| Judges | Two, blind and parallel, both on `sonnet` — a different model than the design's author (`opus`), satisfying author ≠ auditor |
| Round | 1 of at most 2 |
| Status | **escalated to the user for the round-one correction decision** (Decision Gates: "Both judges confirm severe finding → Ask before round-one correction") |

## Ledger-first attack (the shipped rule, exercised)

Both judges attacked `design.md` §11 before reading the design decisions, as the `judgment-day` Hard Rule now requires.

| Rows | Outcome |
|---|---|
| P-1, P-2, P-3, P-4, P-5, P-6, P-7, P-8, P-9, P-10, P-12 | **Reproduced exactly** at their cited lines and commands, by both judges independently |
| P-11 | Grep count (6) reproduces; the **interpretation built on it does not** — see S-1 |
| P-13 | Arithmetic is internally consistent but **two addends are wrong at source** — see S-2 |
| P-14 (`UNVERIFIED`, High) | Correctly left open. Neither judge refuted it; both spot-checked it against archived FAIL cases and found the predicate correctly forces review. **But its settling plan is undermined by S-3** |
| Depended-on premise with no row | None found by either judge |

## Findings

### Confirmed by both judges

| ID | Severity | Finding | Settled |
|---|---|---|---|
| **S-1** | severe | Falsifier execution is reported as **"five of ten tasks"** (`proposal.md` §3, `requirements.md` §4, ledger P-11). Mapping the six grep hits to their enclosing task headers places them in **four** distinct tasks: T1 (×2), T2, T4, T7 (×2) | **Upheld.** Leader re-run maps lines 31, 46 → T1; 114 → T2; 141 → T4; 195, 231 → T7 |
| **S-2** | severe | The validation corpus is stated as **"~59 archived task records"** (`requirements.md` §1, ledger P-13). Per-spec header counts total **54**, with two wrong addends: `gate-falsifiability` **6** (claimed 9) and `leader-brief-contract` **8** (claimed 10) | **Upheld.** Leader re-run: 6+1+6+5+6+7+2+6+7+8 = 54 |
| **S-3** | severe (A) / warning (B) | `design.md` §3 says "One definition, **nine** citing surfaces" while its own table lists the Definition row plus **eight** others | **Upheld.** Adjudicated **severe**: it is an internal count contradiction, the class the count-contrast rule exists for |

### Reported by one judge, settled by a single Leader re-run

The protocol records a one-judge finding as **suspect with its command as run**, so the architect settles it with one re-run rather than auto-fixing. Both were settled and both stand.

| ID | Severity | Finding | Settled |
|---|---|---|---|
| **S-4** | severe | **The held-out corpus is mostly unusable for the predicate.** FR-1 reads the `Falsifier` / `Consumers` / `Disqualifier` task fields, which `changes/gate-falsifiability` introduced on 2026-09-18. Eight of the ten archived specs predate it and carry **zero** `Consumers` fields, so their task records cannot be run through the predicate as specified. P-13 and P-14 lean on that corpus as the mechanism's proof, and the ledger never discloses the gap | **Upheld, with a correction to the judge's own figure.** `grep -c "Consumers" docs/specs/archive/*/tasks.md` → 0 for eight specs; `gate-falsifiability` 9, `leader-brief-contract` 13. The usable **held-out** corpus is the **14 task records** of those two specs (6 + 8), not the ~7 Judge B estimated and not the 54 the design implies |
| **S-5** | severe | `design.md` §4's edited-files list **omits `docs/model-routing.md`**, though §3's Routing row, §7.1 row 15, and FR-7 all name it as an edited surface | **Upheld.** `sed` over §4 → 0 hits for `model-routing` |

### Recorded as information — not fixed in a correction round

| ID | Severity | Finding |
|---|---|---|
| I-1 | warning (A) | FR-1 Scenario 3 has the Leader fall back to a normal review when a `skip-eligible` claim is not earned, "surfaced at the task's continue gate" — but under `pre-approved` mode that gate auto-passes on PASS, so the plan-versus-report mismatch could go unreported, quietly weakening FR-9's trial measurement, which needs the mismatch rate |
| I-2 | suggestion (B) | The mirror `docs/commands/akili-execute.md` independently restates closure-state prose at four sites; FR-11 covers it generically, but §7.2's walk does not itemise it |
| I-3 | suggestion (A) | Consumer walk independently confirmed complete: `akili-validate.md`, `akili-test.md`, `akili-quick.md`, `akili-audit.md` and the mirrors were checked by both judges; none besides the listed rows key on the closure-state set |

## Counts

| Class | Count |
|---|---|
| Severe, confirmed by both judges | 3 (S-1, S-2, S-3) |
| Severe, one judge + Leader re-run upheld | 2 (S-4, S-5) |
| Contradictions between judges | 0 |
| Information rows | 3 |

## Verdict

**`JUDGMENT: ESCALATED ⚠️`** — pending the user's round-one correction decision.

The design's *mechanism* survived the attack. Both judges independently confirmed the consumer walk is complete, that eleven of fourteen premise rows reproduce verbatim at source, and that the predicate correctly forces review on the archived FAIL cases they could test it against — so NFR-6 is not refuted.

What did not survive is the document's **quantitative self-defence**. Three of the five severe findings are counting errors in figures the spec uses to justify itself, and the fourth, S-4, is the one that matters most: the held-out corpus this design leans on to *prove* its predicate is roughly **14 usable records, not 54**, because the fields the predicate reads did not exist before 2026-09-18. That does not break the predicate, but it materially shrinks the evidence available to the closure gate, and the ledger should have disclosed it.

**Noted for the retrospective:** this is the first spec authored under the Premise Ledger, and its ledger's *location*, *consumer* and *existence* rows all held. Every defect found was in a **derived count** — the same class that produced three of four rework attempts in the `premise-ledger` run itself.
