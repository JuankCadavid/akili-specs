# T5 — Retro-fit Walkthrough Record

Persisted by the Leader from the T5 Implementer's inline report and the T5 Reviewer's verdict (2026-09-18). HEAD at walkthrough: `c3c7918`. Reader's input: the shipped `/akili-specify` Step 1.2 + Step 3.2 (Falsifiability block) and the `tdd` skill only; corpus entries read at the source.

## Greps (Implementer + Reviewer, both at repo root)

| Grep | Result |
|---|---|
| Framework names, six changed files | 1 hit — pre-existing `jsdom` in the untouched half of the presence bullet (`akili-specify.md`); zero elsewhere |
| Contradiction (`falsif`, `Red run`, `Consumers`, `Disqualifier`) | Two enumerating sites (field list; Verification Checklist), both name exactly the four fields; the block's intro states the falsifying input is "necessary and not sufficient" |
| Parallel-safety diff (`/akili-execute`, templates, execute mirror) | Empty over `9a293b8..HEAD` and over `12f437b^..HEAD` (T1–T4) |
| Packaging | `verify:cli` 0 (11 commands / 24 skills / 7 resources) · `pack:dry-run` 0 (275 files) · `git diff --check` 0 |

## Five named cases — general sentence, parenthetical stripped (Reviewer)

| # | Corpus gate | Rejected by (quoted general sentence) | `tdd` second line |
|---|---|---|---|
| 1 | `changes--toc-center-guard` KZ-2 — one "Other" center; naive and cascade counts coincide | Rule 1: "a fixture on which the named mutation leaves the reading unchanged is no gate" + "the fixture row(s) on which correct and mutated readings diverge" | flagged — *Inert fixture* |
| 2 | `changes--sp-shell-app-viewport` KZ-3 — `LOCKED_FRAME_FRAGMENT` mirrored in the spec | Rule 3: "a presence or opt-in claim is bound to the shipped artifact: a static read of the real file or a rendered measurement of the real element, never a fragment authored in the test" | flagged — *Plumbing test* |
| 3 | `bugfix--lead-center-full-catalog` KZ-1 — runner green, build red | Rule 4: "when the project's build or type-check is stricter than its test runner, any task that assigns into a typed contract includes the build/type-check command in its Verification" | not in scope (by design) |
| 4 | `result-framework-reporting--programme-results-created-by-filter` KZ-1 — sibling suite pins the key list | Rule 5: "when a task extends or changes a shared exported symbol … run one grep per changed symbol over the project's test files … and list every file that pins it in the task's `Consumers` field" | not in scope |
| 5 | `bilateral--ai-processing-feedback` L1 — zero overflow asserted on a swipe strip | Rule 6: "measure the **baseline** of the pre-existing element before any zero-overflow assertion", under the *only when* trigger | not in scope |

**Task gate: 5/5 REJECTED, 0 INCONCLUSIVE.**

## Held-out cases — not cited in the block (Reviewer, at the Leader's request)

| Case | Outcome | Deciding text / gap |
|---|---|---|
| (a) `changes--kp-cgspace-search-retry` KZ-1 — cancel test true of both `switchMap` and a leaking `mergeMap` | **REJECTED** | Rule 1's no-gate sentence; independently the `tdd` *Inert fixture* bullet. Note: the fixture is a programmed mock, not a "row" — only the second clause carried it |
| (b) `bugfix--other-fields-toc-visibility` KZ-OTV-2 — attribute selector on a property binding, matches nothing | **INCONCLUSIVE** | Rule 3 admits it (rendered read of the real element); rule 2 admits it (assertion-level red); rule 1's artifact is the *named* diverging rows — nothing obliges **executing the mutation against the post-change code**. Compounding: shipped rule 3 says "a class list" where FR-3 says "class/attribute presence" |
| (c) `bugfix--evidence-modal-sticky-actions` KZ-EVM-1 — one viewport height | **REJECTED, weakly** | Rule 6 "at least **two viewports**" rejects a one-viewport gate, but names no axis: two widths at one height satisfy the sentence and reproduce the defect. FR-6 scenario 3's "a second, shorter height that forces the intended scrolling ancestor" was dropped in shipping |

## Attempt 2 — after the T5 Pivot (HEAD `83029ff`, T6 committed)

| Check | Result |
|---|---|
| Greps 1–3 | Same single sanctioned `jsdom` hit (T6's hunk touched lines 349, 351, 354 only); two enumerating sites, same four fields; parallel-safety diff empty over `12f437b^..HEAD` (seven commits, a superset of T1–T6) |
| Re-walk, parenthetical stripped — case 1 → rule 1 | REJECTED — "a fixture on which the named mutation leaves the reading unchanged is no gate" (T6 appended to the rule; the disqualifier is intact) |
| case 2 → rule 3 | REJECTED — "never a fragment authored in the test … or a class or attribute list" |
| case 5 → rule 6 | REJECTED — "measure the **baseline** of the pre-existing element before any zero-overflow assertion" (byte-identical) |
| Held-out (b) `bugfix--other-fields-toc-visibility` KZ-OTV-2 | **REJECTED** by the general sentence — "The Done criteria require the falsifier **executed against the post-change code** … a gate that stays green under its own falsifier asserts nothing" |
| Held-out (c) `bugfix--evidence-modal-sticky-actions` KZ-EVM-1 | **REJECTED** — "use at least **two viewports** that differ on the dimension the gate depends on — … or a second, shorter height that forces the intended scrolling ancestor" (this entry is not cited in the shipped text) |
| Packaging | `verify:cli` 0 · `pack:dry-run` 0 · `git diff --check` 0 · tree clean |

**Closure gate: 0 INCONCLUSIVE across five named cases and three held-out cases.** Reviewer confirmed every quoted sentence verbatim at HEAD by fixed-string grep.
