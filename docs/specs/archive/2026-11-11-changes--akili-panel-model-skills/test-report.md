# Test Report: akili-panel-model-skills

**Overall: PASS.** `npm test` 1903/1903, plugin kit 106/106 on Claude Code 2.1.322 and on the 2.1.318 floor. No product bug found. Every FR-1 … FR-10 scenario has test evidence, a T5 live check, or a gap recorded earlier in the spec.

## 1. Document Control

| Field | Value |
|---|---|
| Spec | `changes/akili-panel-model-skills` |
| Date | 2026-11-11 |
| Code under test | `.claude/skills/akili-panel/hooks/flow.mjs`, `hooks/register.jsx`, `SKILL_CATALOG` (HEAD `ababb96`) |
| Leader | opus (session) |
| Tester | one subagent on opus, persona `.agents/tester.md` (no `akili-tester` wrapper in this project). The Implementer was sonnet, so author ≠ tester |
| Deliverable | `software` |

## 2. Summary

- **Suites:** 2, unit/contract (`node:test`) and plugin kit (host wiring). Both ran in one Tester, **one after the other**: a kit run leaves `.claude-plugin/types/`, which breaks the install/doctor tests in `npm test`.
- **Testers spawned:** 1, not in parallel. Nothing ran inline. Skills: none beyond the persona. Effort: default.
- **Author TDD tests cited, not rewritten:** `test/akili-panel-{flow,catalog,contract,flow-coverage,cli-coverage}.test.js`, `test/install-akili-panel.test.js`, and the author cases in `.claude/skills/akili-panel/tests/panel.test.tsx`.
- **New tests, 16:**
  - 8 node:test cases in `test/akili-panel-test-phase.test.js`;
  - 8 kit cases appended to `panel.test.tsx` under `/akili-test … (Tester suite B)`.
- **Each new test was seen failing:** a temporary edit to the product code (a falsifier) turned it red, then the edit was reverted. The product diff is empty.
- **Leader re-run (not the Tester):** `npm test` `# tests 1903 / # pass 1903 / # fail 0`, `git diff --check` clean, no kit leftovers in the tree.
- **Tester's inner loop:** 2 attempts on the kit suite. The first failure came from the test itself: the `openGroup` helper pressed the Skills toggle twice, which closed the section. Fixed in the test.
- **Run note:** after cleanup, the kit leftovers came back once, in the middle of an `npm test` run (mtime 10:11:23). That gave 4 failures: tests 238, 239, 250 and 1223, the checks that a generated `types/` is never installed. They were deleted again. A clean re-run gave 1903/1903, and the Leader's own re-run matches. Most likely a separate `--plugin-dir` Claude session regenerated them; not confirmed. This is recorded as an observation, not as a product failure.
- **Extra evidence, not shipped:** the scratchpad script `tp/cmp.mjs` compares the 1.0.0 `paneRows` from tag `v2.43.0` against this branch's untitled draw, with the added rows removed. It covered 1936 cases with 0 differences: FR-8 checked directly against the shipped plugin.

## 3. Backend Unit Tests

| Command | Result |
|---|---|
| `npm test` (baseline, before the new tests) | 1895 pass / 0 fail |
| `node --test test/akili-panel-test-phase.test.js` | 8 pass / 0 fail |
| `npm test` (final, Tester; Leader re-run) | **1903 pass / 0 fail** |

New cases in `test/akili-panel-test-phase.test.js`:

| # | Scenario | Falsifier → red |
|---|---|---|
| 1 | FR-10, every boundary: cols unknown/1/4/5/6/14/15/16/23/40/80 × rows unknown/1/n−1/n/n+1/n+2/n+3/60, 5 states | `cols >= 15` → `>= 13`: `no view cols 14 rows undefined (n 3)` |
| 2 | FR-10 BUT no title row is ever cut; `planMode` tone; AKILI bold | the same edit → `cut title row "▄▀█ █▄▀ █ █ …"`; `cols >= 3` → `cut title row "AK…"` |
| 3 | FR-10 the title never pushes Next out (Skills closed, open, group open) | the `n+1` row rule returns 2 → `Next at 17` |
| 4 | FR-10 / FR-8 header byte-identical without the title; no `Akili` and no empty row with the title | the width edit → red; an empty title row → `no empty header row where the spec would be` |
| 5 | FR-10 No spec or no docs BUT the empty-state text is unchanged | empty row dropped when titled → `noActive rows 12` |
| 6 | FR-10 Size unknown: 0, −1, NaN, null, `'20'` | `!(cols > 0)` → `cols === undefined`: `cols 0` |
| 7 | FR-6 BUT the model id is never dropped from 14 columns up (14–120 × states × 3 ids) | the narrow branch returns the label only → `id dropped ("model        ")` |
| 8 | FR-1 BUT no alias, for any id | strip `claude-` → `Expected values to be strictly equal` |

## 4. Frontend Unit Tests

The pane is drawn by the host from rows. Its UI logic is tested in §3 (rows) and §5 (host wiring). No separate frontend suite exists or is needed.

## 5. Integration Tests (plugin kit)

| Command | Result |
|---|---|
| `claude plugin test .claude/skills/akili-panel` (2.1.322), baseline | 98 pass / 0 fail |
| same, after the new cases | **106 pass / 0 fail** |
| `~/.local/share/claude/versions/2.1.318 plugin test .claude/skills/akili-panel` | **106 pass / 0 fail** |

The kit loaded the branch copy: the new cases ran and passed on both versions, and the global v1.0.0 copy does not have them.

New kit cases:

| Scenario | Falsifier → red |
|---|---|
| FR-4 Double press: skill then skill; only the running row is dim; the guard is released after | guard removed → red; every skill row dimmed while pending → red (**no author test went red**) |
| FR-4 Double press: Next then skill; Next is dim, no skill row is dim | the same two edits → red |
| FR-4 Refused: exact toast `Could not run /<skill>: <reason>`; the guard is released | `finally { clearPending }` removed → red |
| FR-2/FR-3 BUT pressing the Skills or group toggles runs nothing | the toggle also calls `press` → red |
| NFR-3 one tick asks the host once for the model and once for the command list | `refreshHost` called twice → red |
| FR-1 Model unknown: an empty id draws `model —` | `''` kept as an id → red (**only this test went red**) |
| FR-10 Narrow pane on the host: 15 / 5 / 4 columns | `cols >= 16` → expected two title rows |
| FR-10 Short terminal: at `bodyRows` 18, opening Skills and a group keeps the one-row title | the open section counted in `n` → `Expected: ["AKILI"]` |

## 6. E2E Tests

No automated E2E suite exists. A real host run, a confirmed `/model` switch, scrolling, and the look in light and dark were proven in the **T5 live check** (`execution.md` → T5, steps 1–19, with JC's light/dark sign-off). No harness can drive these (requirements §8).

## 7. Coverage & Traceability

| Req | Scenario | Type | Test or command | Result | Gap or notes |
|---|---|---|---|---|---|
| FR-1 | Shown; BUT no alias; AND same column and tone | unit | flow `FR-1 Shown…` ×3; TP #8 | PASS | look: T5 |
| FR-1 | Model changes; AND re-read after `/clear` | kit | `FR-1 Model changes…/model`, `FR-1 AND … after /clear` | PASS | live switch: T5 step 11; *resume* = W-1 gap |
| FR-1 | Model unknown; BUT not hidden, no toast | unit + kit | flow ×2; kit rejected-call case; TP kit empty id | PASS | |
| FR-2 | Closed; BUT no skill before the press | unit + kit | flow `FR-2 Closed…` ×3; kit ×2 | PASS | |
| FR-2 | Open and close; AND the groups close | unit + kit | flow; kit `FR-2/FR-3 Open and close…`; TP kit toggles | PASS | |
| FR-2 | Nothing listed; AND no error line | unit + kit | flow ×2; kit rejected `$.command.list` | PASS | |
| FR-3 | Open a group | unit + kit | flow `FR-3 Open a group…`, order test | PASS | |
| FR-3 | Open another; BUT never two open | unit + kit | flow; kit | PASS | |
| FR-3 | Close the open group | unit | flow ×2 | PASS | |
| FR-4 | Run; AND the section stays | kit | `FR-4 Run…` | PASS | real run: T5 steps 7, 9, 10 |
| FR-4 | Double press; AND dim | unit + kit | flow ×2; kit; TP kit ×2 | PASS | |
| FR-4 | Refused | kit | `FR-4 Refused…`; TP kit exact text | PASS | not produced live (T5) |
| FR-5 | Catalog matches the package; BUT the expected side is read from disk | unit | `akili-panel-catalog.test.js` ×6 | PASS | |
| FR-5 | Not installed here | unit | flow ×2 | PASS | |
| FR-5 | Read only; AND no process | kit + contract | kit `FR-5 Read only…`; contract | PASS | |
| FR-6 | Model id too long; BUT not dropped ≥ 14 columns | unit | flow ×3; TP #7 | PASS | |
| FR-6 | Skills rows too long | unit | flow ×5 | PASS | |
| FR-7 | Tallest open state; BUT the person's size stays | unit + kit + live | flow growth case; kit size-stays case; T5 steps 3, 6, 13 | PASS | scroll reach: live only |
| FR-8 | Same facts; BUT no `/akili-*` change | unit + scratch | flow ×3; TP #4; `cmp.mjs` 0/1936 | PASS | `.claude/commands` diff empty |
| FR-9 | No stale text; version 1.1.0 | review | T4/T6 Reviewer quote-checks | n/a here | `/akili-validate` re-checks it |
| FR-10 | Wide and tall | unit + kit | flow ×2; kit bodyRows 52; TP #1, #2 | PASS | |
| FR-10 | Narrow pane (23/15/14/5/4) | unit + kit | flow ×5; kit 14; TP kit 15/5/4; TP #1, #2, #4 | PASS | 23 checked live (T5) |
| FR-10 | Short terminal | unit + kit | flow ×7; kit 17/18, P-13; TP #3; TP kit 18 open | PASS | resize checked live (T5 steps 18–19) |
| FR-10 | Size unknown | unit | flow ×3; TP #6 | PASS | |
| FR-10 | No spec or no docs | unit | flow ×2; TP #4, #5 | PASS | |
| FR-10 | Height asked (21) | contract + kit | contract rows pin; kit `rows` 21 | PASS | |
| NFR-1 | Theme keys; title in `planMode` | unit + kit + contract | contract; flow; kit; TP #2 | PASS | light/dark: JC at T5 |
| NFR-2 | Render reads atoms only | contract | ×2 | PASS | |
| NFR-3 | One host call each per refresh | kit | TP `NFR-3 one tick…` | PASS | new coverage |
| NFR-4 | 2.1.318 floor; degrades on a rejected call | kit | whole kit on 2.1.318 | PASS | see gap 2 |
| NFR-5 | `next(e)` first; observers `.catch` | contract | ×2 | PASS | |

## 8. Remediation

None needed: no failures and no product bugs.

## 9. Accepted Gaps

| # | Gap | Why accepted |
|---|---|---|
| 1 | FR-1 *re-read after resume* | W-1, recorded earlier and not applied by JC's decision. T5 step 12 could not tell a re-read from the startup default |
| 2 | NFR-4 on a host where `$.session.model` or `$.command.list` is missing, not rejecting | The kit cannot remove an operation from `$`. Per P-11 such a host does not exist at the 2.1.318 floor. Reviewer advisory 3 stands: a synchronous throw would empty both fields, not only the missing one |
| 3 | A real skill run, the `/model` dialog, scroll reach, the look in light and dark | Live only; proven in T5 with JC's sign-off |
