# Judgment Day: design-eval-followup design

| Field | Value |
|---|---|
| Target | `design.md` revision 1 + `requirements.md`, at `71a41d9` (uncommitted draft) |
| Mode | `judgment_day`, two blind read-only judges (Sonnet; author Opus), under `pre-approved (JC, 2026-10-31)` |
| Round 1 | 2026-10-31. Both judges: `FINDINGS`. No false `PASS` found by either |

## Frozen ledger (round 1)

`A-` = judge A, `B-` = judge B. The status is the parent's merge.

| ID | Sev. | Finding | Status | Action |
|---|---|---|---|---|
| A-J1 | severe | CHANGELOG `Unreleased` lines 12–13 restate the replaced rules; P-5's greps missed them | Suspect (one judge), **settled by the parent's re-run** (`sed -n '8,16p' CHANGELOG.md`) | Factual correction: FR-4, design §7.4, P-5 |
| A-J2 / B-J3 | severe / warning | No sweep assertion, no doc-sentence text, no clause→assertion map | **Confirmed** (both) | Design §7.4, §7.5 |
| B-J1 | severe | "No other call … changes any of the three" contradicts the pin of `IMPECCABLE_BIN` after the download | Suspect (one judge), **settled by reading** bridge Step 0 item 3 and requirements FR-3's scenario | Factual correction: FR-3 wording, design §7.3 |
| A-J6 / B-J2 | warning | FR-2's "removes any other byte" not planned | Confirmed | §7.2 |
| A-J5 / B-J4 | warning | `node -e` quoting across shells; utf8 round-trip | Confirmed | §7.2 (`latin1`, quoting rule), P-8, requirements §7 risk row |
| A-J9 / B-J5 | warning | Status claimed approval before judgment existed | Confirmed | §1 Status |
| A-J8 / B-J6 | warning / suggestion | P-7 counted verified with a user-stated half | Confirmed | Split into P-7a / P-7b |
| A-J3 | warning | `Download home override` value ambiguous when nothing is filtered | Info | §5 shape made explicit |
| A-J4 | warning | "under" vs "resolves under"; resolution before the home override | Info | §7.3, FR-3 |
| A-J7 | warning | Whole-line match for `metadata:` / `---` | Info | §7.2 |
| A-J10, A-J11, B-J7, B-J8 | suggestion | Item 3 `Unevaluated` row; pin `:79`; priority bullet untouched; `:151` cite | Info | §7.1, §7.3, P-3, P-5 |

The two severe single-judge findings were facts with a single right answer, so the parent settled them with one re-run. They are logged as factual corrections (`pre-approved`: no scope change, no new requirement), not as auto-fixes of an unconfirmed finding.

## Round 1 fix delta

`design.md` revision 2, `requirements.md` FR-3, FR-4 and the §7 risk row. Scoped re-judgment: see below.

## Scoped re-judgment (round 1 delta)

Both judges saw only the frozen ledger and design revision 2. **Every ledger ID resolved** (A and B).

Defects caused by the fix, none of them severe:

| ID | Sev. | Finding | Action |
|---|---|---|---|
| N-1 / D-3 | warning / suggestion | The note under §11 named a different list of three than the count line | Note reworded |
| D-1 | warning | The sweep walker is private to `design-eval-contract.test.js` and does not cover `CHANGELOG.md` | §7.5 and T4: reimplement the walker and add `CHANGELOG.md` |
| D-2 | suggestion | The quoting rule omits `!` (history expansion) | `!` added to the ban list (design, requirements §7, T3) |
| N-2 | suggestion | The pins `:60` and coverage `:69` are reminders for `Consumers` | Already in T2 and T4 `Consumers` |

No severe finding remains, no fix round 2 is needed, and the lineage closes.

JUDGMENT: APPROVED ✅
