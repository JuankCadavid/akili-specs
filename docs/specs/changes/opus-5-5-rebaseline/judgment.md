# Judgment Day: `changes/opus-5-5-rebaseline` design

| Field | Value |
|---|---|
| Target | `design.md` (draft, Step 2.5), judged against `requirements.md` + `proposal.md`, at HEAD `31b6d31` plus the uncommitted spec files |
| Mode | judgment_day: two blind, read-only judges (`sonnet`, Explore), identical prompt and scope. Author: `opus` (author ≠ auditor) |
| Round | 1 of 2 |
| Status | **Closed**: round-1 fix applied under the user's **Fix only** choice (2026-09-29); scoped re-judgment declined by the user |
| Skill resolution | `judgment-day` (packaged). The `references/` files are not packaged, so the protocol was derived from the Hard Rules |

## Frozen ledger (round 1)

| ID | Severity | Judges | State | Location | Finding |
|---|---|---|---|---|---|
| JD-1 | **severe** | A (J1) + B (F1) | **confirmed** | `design.md` P-3 | The citation does not reproduce: the recorded grep returns **70** hits, not 5. Architect re-run: the command as recorded omitted the `docs/specs/` exclusion it was actually run with, **and** dropped the two patterns that match `model-routing.md:354,356`. With the exclusion (the four recorded patterns), it returns 4 hits: `reviewer.md:7`, `akili-constitution.md:554`, `:779`, and **`docs/commands/akili-constitution.md:96`**, a mirror the row did not list. The premise's conclusion (values frozen, so no stale copy) still holds |
| JD-2 | **severe** | A (J2) + B (F2) | **confirmed** | `design.md` DD-3 | The tester bullet would name `FATAL_FAIL` as a Tester outcome. `tester.md` defines only `PASS`/`FAIL`/`PRODUCT_BUG` (`grep -n FATAL_FAIL .claude/templates/tester.md` → 0), and FR-4 names only `PRODUCT_BUG`/`AUTOMATION_DEFERRED`. It would ship a false sentence next to the output contract |
| JD-3 | **severe** | A (J3) + B (F3) | **confirmed** | `design.md` DD-4 | The three content classes are written as mutually exclusive, but `implementer.md:44` defines the field as owed work **plus** judgment calls in the same field. There is no rule for a mixed report |
| JD-4 | warning | B (F4) | suspect → info | `akili-execute.md:380` | Restates item 0's `[x]`-blocking obligation and is not in §4 or P-10. Both judges agree it stays true after the edit |
| JD-5 | warning | B (F5) | suspect → info | DD-3 | Placement between `implementer.md:24` and `:25` (the Pivot-deferral bullet) is unspecified |
| JD-6 | suggestion | B (F6) | info | DD-3 | `AUTOMATION_DEFERRED` is defined in tester item 3, not item 4 |
| JD-7 | warning | A (J4) | suspect → info | §9 Budget | "Restatement drift cost a rework round in 3 of the last 4 specs" has no citation |
| JD-8 | suggestion | A (J5) | info | §8 | No DD covers `CHANGELOG.md` |

**Counts:** 3 confirmed severe · 0 contradictions · 3 suspect (single-judge warnings) · 2 info.

**Premise rows confirmed by both judges:** P-1, P-2, P-4 to P-13. Judge A fetched the vendor page and confirmed every vendor-attributed claim (the `medium` default, reserving xhigh/max for measured gains, the four stop shapes word for word, "two or three" continuations, the `elapsed` format, the Reviewer-exclusion rationale).

## Round-1 fix (confirmed severe IDs only; applied 2026-09-29)

| ID | Fix |
|---|---|
| JD-1 | Rewrite the P-3 citation with the command as actually run (all six patterns, `--include='*.md'`, the `docs/specs/` exclusion) and its real hit list, including `docs/commands/akili-constitution.md:96`. Add that mirror to DD-6's non-change list, with its reason (Codex row, values frozen) |
| JD-2 | DD-3 tester obligations: legitimate stops = `PRODUCT_BUG`, a `FAIL` with `AUTOMATION_DEFERRED`, and the bounded inner-loop exhaustion already defined in item 4. Remove `FATAL_FAIL` |
| JD-3 | DD-4 gains a precedence rule for mixed content: **any named blocker → `[~]`**; otherwise **any unblocked owed item → continuation-eligible** (the continuation brief names only the owed items, and the assumptions are carried into `execution.md` as today); only a field with **no owed item** is never a continuation. Mirrored into FR-5 |

## Fix delta (applied)

| ID | Where | Result |
|---|---|---|
| JD-1 | `design.md` P-3, DD-6 | The citation is now the command as run (6 patterns, `--include='*.md'`, the `docs/specs/` exclusion) → 6 hits, re-run before writing. The mirror `docs/commands/akili-constitution.md:96` is listed in DD-6 |
| JD-2 | `design.md` DD-3; `requirements.md` FR-4 | The Tester's legitimate stops come only from its own contract. `FATAL_FAIL` appears once, in the sentence excluding it |
| JD-3 | `design.md` DD-4; `requirements.md` FR-5 | A precedence rule for mixed content, plus a new FR-5 scenario (*a report mixes an owed item with an assumption*) |

JD-4 to JD-8 stay `info` and were not applied (the protocol applies auto-fixes only to confirmed-severe IDs).

## Terminal receipt

Round 1 of 2 · 3 confirmed severe, all fixed · 0 contradictions · 3 suspect → info · 2 info · 0 scoped re-judgments (declined by the user).

JUDGMENT: ESCALATED ⚠️ — the fixes were not re-judged; the user took the decision (**Fix only**). This is recorded as a human decision, not as a judge approval.
