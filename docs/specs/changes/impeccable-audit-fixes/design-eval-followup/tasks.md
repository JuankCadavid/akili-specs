# Tasks: Close the three rule gaps left by design-eval-contract

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/impeccable-audit-fixes/design-eval-followup` |
| Status | **Approved**: tasks gate `auto-approved (pre-approved mode)`, 2026-10-31 |
| Requirements / Design | `requirements.md` (FR-1 to FR-4, NFR-1 to NFR-5); `design.md` revision 2 (judgment: `judgment.md`) |
| Baseline | `71a41d9`. `npm test` → `# tests 1315`, `# pass 1315`, `# fail 0` (run 2026-10-31) |
| Baseline readings (`grep -cF <p> .claude/skills/impeccable-bridge/SKILL.md`, run 2026-10-31) | `byte-exact`, `only a would-be`, ``IMPECCABLE_BIN` unset``, `node -e`, `whatever the CTA outcome`, `keeps its own reason`, `real home` → **0** each. `test/design-eval-followup.test.js` → `No such file or directory` |
| Commit prefix | `[SPEC:changes/impeccable-audit-fixes/design-eval-followup]`. Local commits only |
| Budget (design §12) | **4 tasks · ~210 authored LOC · ~7 review rounds.** `/akili-execute` stops and escalates past it |
| PR strategy | One PR (~210 LOC) into `dev`. Proposed only: JC's mandate allows no PR in this cycle |
| `skip-eligible` tasks | None. T1–T3 edit rules text other agents execute (`full`); T4 is `checklist` |

## Dependency graph

```text
T1 ──► T2 ──► T3 ──► T4
```

Linear: every task appends to `test/design-eval-followup.test.js`, and T1–T3 edit the same bridge file.

## Shared rules for every task

- **Test first, inside the task.** Add the task's assertions, run them red, then edit the rules text and run them green.
- **Section-scoped assertions.** Use the `slice()` shape from `test/design-eval-contract.test.js`. Read the named section only.
- **Mutation check.** For each assertion, delete or alter the sentence it pins, observe the red, and quote it in `execution.md` (NFR-3).
- **Before review: phrase-family sweep** of the obligation the task changes, over `.claude/`, `docs/`, `README.md` and `CHANGELOG.md`, minus `docs/specs/` and `.claude/skills/impeccable/`. Read every hit (KZ-changes--kaizen-loop-closure-2).
- **Vendored copy.** `git diff --stat -- .claude/skills/impeccable/` stays empty (NFR-1).
- **No spec-path citations** in shipped text or tests, except the `@akili-spec` header annotation (NFR-5).
- **Line pointers** here are for the Implementer only; never in shipped prose (KZ-005).

---

### T1: FR-1, banner precedence in *First-visit pass* item 4; create the test file

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S (~6 LOC prose, ~60 LOC tests) |
| Depends on | — |
| Requirements | FR-1 (five SHALL bullets; scenario 1 THEN, AND, BUT, AND IT MUST; scenario 2 THEN, BUT; P-16 scenario BUT "identification must NOT depend on the CTA's text"); NFR-1, NFR-3, NFR-5 |
| Design | §7.1, §7.5 rows FR-1; DD-1, DD-2; P-1, P-4, P-6 |
| Scope | `.claude/skills/impeccable-bridge/SKILL.md` *First-visit pass* item 4: one site (the not-rendered sentence becomes the §7.1 bullets as prose). New `test/design-eval-followup.test.js`: header `// @akili-spec changes/impeccable-audit-fixes/design-eval-followup`, helpers copied in shape, a guard that it reads nothing under `docs/specs/`, and the FR-1 assertions |
| Tests (8) | Banner state `not rendered: <reason>` in item 4; "only a would-be `pass` changes"; "and never reads `pass`" kept; "A `below fold` or `covered` outcome stands"; the rationale clause; "keeps its own reason"; "whatever the CTA outcome"; item 3's identification text never contains "text" (P-16 BUT guard). Plus the guard ×1 |
| Falsifier | (1) Delete "A `below fold` or `covered` outcome stands" → its assertion goes red. (2) Restore the old sentence verbatim (precedence removed) → the "only a would-be" assertion goes red. (3) Add "matching the text 'Agenda'" to item 3's identification → the P-16 guard goes red. Executed and quoted |
| Red run | Observed at baseline: `only a would-be`, `whatever the CTA outcome`, `keeps its own reason` → 0 in the bridge. Test file: `predicted — greenfield artifact (observed in T1)`; T1's `execution.md` quotes the first run failing on the FR-1 assertions, not on setup |
| Disqualifier | An assertion passes against the baseline bridge; an assertion reads the whole file; `test/design-eval-contract.test.js:234` or `:248` goes red (their substrings must survive verbatim); the priority bullet is edited (design §7.1 says no edit) |
| Consumers | `test/design-eval-contract.test.js:234`, `:248` (must stay green unchanged); `docs/skills/impeccable-bridge.md:37`, `test/design-eval-contract-coverage.test.js:69`, `CHANGELOG.md:13` (restated in T4) |
| Review | `full`: a verdict rule (P1/FAIL vs `Unevaluated`) two agents must apply identically |
| Done criteria | 9 assertions green, each with its mutation red quoted. A walkthrough in `execution.md` of the three FR-1 scenarios and one held-out case (a `covered` capture with the banner not rendered) against the shipped sentence. `npm test` green (1315 + new) |
| Skills | `impeccable-bridge` (subject), `tdd` |

### T2: FR-3, the download call's environment under an exclusion

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S (~8 LOC prose, ~50 LOC tests) |
| Depends on | T1 |
| Requirements | FR-3 (four SHALL bullets, the no-other-call sentence, the record; scenario THEN, AND, BUT, AND IT MUST); NFR-2, NFR-3 |
| Design | §5 row 1, §7.3, §7.5 rows FR-3; DD-4, DD-5; P-3 |
| Scope | Bridge Step 0 item 4: (a) after the kept home-variable sentence, the unset and `PATH` sentence with "resolved against the user's real home before the home override" and the reason; (b) the retired "No other call changes it, and no call after the pin does." replaced by the design §7.3 sentence; (c) the record sentence `Download home override:` with the §5 shape. *Engine consent* row *Home override*: (d) the appended clause. Four sites, one file. Update the pins `test/design-eval-contract.test.js:60`, `:97`, `:106` to the new text |
| Tests (7) | Unset `IMPECCABLE_BIN`; `PATH` filter with "resolved against the user's real home before the home override"; the reason sentence; the new no-other-call sentence with its after-the-pin clause; the record shape incl. `PATH entries removed:`; the *Home override* row clause; *Launcher form* contains no `env -u` and no `PATH=` |
| Falsifier | (1) Drop "unsets `IMPECCABLE_BIN`" from the no-other-call sentence → red. (2) Delete "before the home override" → red. (3) Revert the record field to `<variable>=<dir> (one call)` → red. Executed and quoted |
| Red run | Observed at baseline: ``IMPECCABLE_BIN` unset`` and `real home` → 0 in the bridge. New assertions red before the edit, quoted |
| Disqualifier | The kept sentence pinned at `test/design-eval-contract.test.js:79` changes; the *Launcher form* gains an environment change; a pin is updated to a string that also matched the baseline |
| Consumers | `test/design-eval-contract.test.js:60`, `:79` (unchanged), `:97`, `:99`, `:106`, `:403`; reference `design-evaluation.md:99` and `CHANGELOG.md:12` (T4); `test/impeccable-bridge.test.js:102-105` (no bridge strings in commands) |
| Review | `full`: engine-isolation rules |
| Done criteria | 7 assertions green with mutation reds quoted; the three updated pins green; a walkthrough of the FR-3 scenario plus a held-out case (a `PATH` entry outside `~/.impeccable` is kept) in `execution.md`. `npm test` green |
| Skills | `impeccable-bridge`, `tdd` |

### T3: FR-2, byte-exact strip and the reference command in *Verify*

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S (~6 LOC prose, ~45 LOC tests) |
| Depends on | T2 |
| Requirements | FR-2 (three SHALL bullets; scenario THEN, BUT, AND IT MUST); NFR-3 |
| Design | §7.2, §7.5 rows FR-2; DD-3, DD-7; P-2, P-8 |
| Scope | Bridge Step 0 *Verify*: one site after the range sentence, holding the byte-exact clause, the non-conformance clause naming the appended final newline, and the `node -e` reference command (double outer quotes; no `"`, `$`, backtick, `%` or `!` inside; reads `latin1`) |
| First step | Execute the exact command string to be shipped, from `.claude/skills/impeccable`, on `SKILL.md` (expect `a2ba4387…`) and on a `$TMPDIR` copy with `\n` appended (expect a different hash). Quote both outputs in `execution.md` before editing (P-2, KZ-changes--leader-brief-contract-2) |
| Tests (5) | "byte-exact" and "a missing final newline included"; "adds or removes any other byte does not conform"; "appends a final newline"; the command is present and has no `"`, `$`, backtick, `%` or `!` inside its outer quotes; **behavioral:** the test extracts the command from *Verify*, runs it with `child_process.execFileSync(process.execPath, ['-e', <code>, 'SKILL.md'], { cwd: <vendored folder> })`, and asserts the output equals the `SKILL.md` hash in `UPSTREAM.md` |
| Falsifier | (1) Change `join('\n')` to append a trailing `'\n'` in the shipped command → the behavioral test goes red (expected `a2ba4387…`, got `6fccc12f…`). (2) Delete "or removes" → red. Executed and quoted |
| Red run | Observed at baseline: `byte-exact`, `node -e` → 0 in the bridge. New assertions red before the edit, quoted |
| Disqualifier | The behavioral test computes the hash with its own code instead of the command extracted from the bridge (a plumbing test); `test/design-eval-contract.test.js:113` goes red; the vendored diff is non-empty |
| Consumers | `test/design-eval-contract.test.js:109-115` (range pin, unchanged); `test/impeccable-vendor.test.js:64-79` (an independent strip, unchanged) |
| Review | `full`: a verification rule other agents execute |
| Done criteria | 5 assertions green with mutation reds quoted; the First-step outputs quoted. `npm test` green |
| Skills | `impeccable-bridge`, `tdd` |

### T4: FR-4, restatements, CHANGELOG and the sweep

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S (~12 LOC prose, ~30 LOC tests) |
| Depends on | T3 |
| Requirements | FR-4 (each restatement; retired sentences absent); NFR-2, NFR-4 |
| Design | §7.4 (all five rows), §7.5 rows FR-4; P-5 |
| Scope | Reference `design-evaluation.md` template line `Download home override:`; `docs/skills/impeccable-bridge.md` *Detector Gate* banner sentence; `CHANGELOG.md` `Unreleased`: the *Engine isolation* sentence, the *first-visit* sentence, and one new bullet (W-1, W-2, W-4). Update the pin `test/design-eval-contract-coverage.test.js:69`. Add the restatement and sweep assertions to `test/design-eval-followup.test.js`. The sweep walker is reimplemented in that file (the one in `design-eval-contract.test.js` is private), with `CHANGELOG.md` added to its scope (design §7.5, D-1) |
| Tests (6) | Reference line shape; doc sentence; CHANGELOG *Engine isolation* clause; CHANGELOG *first-visit* clause; the new bullet; the sweep for the four retired strings (design §7.5 FR-4 sweep) |
| Falsifier | (1) Re-insert "No other call changes it" in the bridge → the sweep goes red. (2) Restore the old doc sentence → the doc assertion and the sweep go red. Executed and quoted |
| Red run | Observed at baseline: `sed -n '12,13p' CHANGELOG.md` carries both retired clauses; `docs/skills/impeccable-bridge.md:37` carries "reads `Unevaluated` and never `pass`" |
| Disqualifier | The sweep scope omits `CHANGELOG.md`; the sweep passes against the baseline tree |
| Consumers | `test/design-eval-contract-coverage.test.js:53-57` (the `Unreleased` pins must stay green), `:69` (updated) |
| Review | `checklist`: restatements with a mechanical sweep |
| Done criteria | 6 assertions green with reds quoted. `npm test`, `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` green (NFR-4). Measured LOC recorded against the budget |
| Skills | `cognitive-doc-design` (CHANGELOG prose) |

## Coverage

| Clause | Task |
|---|---|
| FR-1 bullets 1–5; scenario 1 THEN/AND/BUT/AND IT MUST; scenario 2 THEN/BUT; P-16 BUT | T1 (the P-16 THEN and its AND are walkthrough-only, at `/akili-validate`: they rest on the Lead's measurement, P-7b) |
| FR-2 bullets 1–3; scenario THEN/BUT/AND IT MUST | T3 (AND IT MUST through the kept `:113` pin) |
| FR-3 bullets 1–4, the no-other-call sentence, record; scenario THEN/AND/BUT/AND IT MUST | T2 (THEN and AND as text plus the walkthrough; no executed download, NFR-3 of child 1 forbids one without consent) |
| FR-4 each restatement and the sweep | T4 |
| NFR-1, NFR-3, NFR-5 | Every task (shared rules) |
| NFR-2 | T2 (the commands check), T4 |
| NFR-4 | T4 |
