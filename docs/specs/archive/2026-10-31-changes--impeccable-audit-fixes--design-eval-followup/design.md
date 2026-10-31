# Design: Close the three rule gaps left by design-eval-contract

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/impeccable-audit-fixes/design-eval-followup` |
| Requirements | `requirements.md` (Phase 1 gate `auto-approved (pre-approved mode)`, 2026-10-31; FR-3 and FR-4 corrected after judgment-day) |
| Revision | 2: judgment-day round 1 findings applied (`judgment.md`) |
| Status | **Approved**: `JUDGMENT: APPROVED` (`judgment.md`, round 1 plus scoped re-judgment), then the Phase 2 gate `auto-approved (pre-approved mode)`, 2026-10-31 |
| Approval Mode | `pre-approved (JC, 2026-10-31)` |
| Verified at | `71a41d9` |
| Deviation from proposal | The proposal named "one POSIX reference command" for W-2 (§4, §11) and listed GNU `sed` as R-4. The design names a `node -e` command instead (DD-3). It runs on all three operating systems, needs only the runtime AKILI already requires, and was executed. GNU `sed` could not be checked here (Docker daemon not running, 2026-10-31). Same intent, a narrower mechanism: not a scope change |

## 2. Executive Summary

Three sentence-level amendments in the bridge, each pinned by new section-scoped assertions in a new test file. The existing pins of the replaced sentences are updated. One reference template field, one doc sentence and two existing CHANGELOG sentences are restated, a new CHANGELOG entry is added, and a sweep assertion keeps the retired sentences out of shipped text.

## 3. Architecture Overview

| Layer | Change |
|---|---|
| Bridge `SKILL.md` Step 0 *Verify* | FR-2: byte-exact clause, non-conformance clause, reference command (§7.2) |
| Bridge Step 0 item 4 (exclusion paragraph and record sentence), *Engine consent* row *Home override* | FR-3: the download call's environment (§7.3) |
| Bridge *First-visit pass* item 4 | FR-1: precedence (§7.1) |
| Reference template `Download home override:` | FR-3 value shape (§5) |
| `docs/skills/impeccable-bridge.md` *Detector Gate*; `CHANGELOG.md` `Unreleased` (two existing sentences plus one new bullet) | FR-4 (§7.4) |
| `test/design-eval-followup.test.js` (new); `test/design-eval-contract.test.js` and `test/design-eval-contract-coverage.test.js` (pins updated) | NFR-3 (§7.5) |

## 4. Extended Directory Structure

Only the new file `test/design-eval-followup.test.js`. No new directory.

## 5. Data Model

Report values only:

| Field | Before | After |
|---|---|---|
| Header `Download home override:` (bridge item 4 record sentence; reference template) | `<variable>=<dir> (one call)` \| `none` | `<variable>=<dir>; IMPECCABLE_BIN unset; PATH entries removed: <entries, or none> (one call)` when there is an exclusion; the whole field reads `none` when there is no exclusion. `PATH entries removed: none` is how an exclusion with nothing to filter is recorded. The label stays (DD-4) |
| Capture CTA outcome | unchanged values | unchanged values. Only the precedence changes (DD-1) |
| Capture `Banner` | `visible`, `not rendered: <reason>`, `none in product` | unchanged. It is already a separate field (P-4) |

## 6. API Design

n/a: no API.

## 7. Backend Module Design

### 7.1 FR-1, bridge *First-visit pass* item 4

The sentence "If it is not rendered, the capture reads `Unevaluated (consent banner not rendered: <reason>)` and never reads `pass`" becomes:

- When the banner is not rendered, the banner state reads `not rendered: <reason>`, and only a would-be `pass` changes: the capture reads `Unevaluated (consent banner not rendered: <reason>)` and never reads `pass`.
- A `below fold` or `covered` outcome stands, with its P1 or FAIL, because a banner that is absent cannot bring the CTA into view or uncover it.
- An item 3 `Unevaluated` outcome keeps its own reason in the capture row; the banner state is recorded beside it (J-A10).
- The remedy sentence stays and applies whatever the CTA outcome.

Pins kept verbatim: "the capture reads `Unevaluated (consent banner not rendered: <reason>)`" (`test/design-eval-contract.test.js:234`) and "and never reads `pass`" (`:248`).

**No edit to the priority bullet** below the list (J-B7). It already makes `covered` and `below fold` a P1 or FAIL, and `Unevaluated` a `WARN`. The proposal's scope row named it, but the design walked it and found nothing to change.

### 7.2 FR-2, bridge Step 0 *Verify*

After the range sentence, add:

- the strip is byte-exact: it removes only those lines, where `metadata:` and the closing `---` each match as a whole line, and keeps every other byte, a missing final newline included;
- a tool that adds or removes any other byte does not conform; the known case is a strip that appends a final newline (some `awk` forms do), which gives a different hash (J-A6, J-B2);
- the reference command is one `node -e` string. It reads the file as `latin1`, so every byte round-trips (J-A7, J-B4), splits it on `\n`, removes the lines from the first whole-line `metadata:` up to, not including, the next whole-line `---`, joins the rest with `\n`, and prints the sha256 hex. It runs from the vendored folder with `SKILL.md` as its argument. Quoting: double outer quotes, and no `"`, `$`, backtick, `%` or `!` inside (`!` triggers history expansion in an interactive shell, D-2), so `sh`, `cmd.exe` and PowerShell pass it unchanged (J-A5, P-8).

The string is executed before it is written, on the vendored copy and on a copy with `\n` appended (KZ-changes--leader-brief-contract-2; P-2).

### 7.3 FR-3, bridge Step 0 item 4 and *Engine consent*

- **Exclusion paragraph.** The sentence "That one download call runs with the launcher's home variable set to an empty directory inside `IMPECCABLE_HOME`: `HOME` for …, `USERPROFILE` for …" stays verbatim, because `test/design-eval-contract.test.js:79` pins it (J-A11). After it, add:
  - the same call also runs with `IMPECCABLE_BIN` unset and with every `PATH` entry removed whose resolved path lies under `~/.impeccable`, resolved against the user's real home before the home override (J-A4);
  - the reason: each launcher runs `IMPECCABLE_BIN` and then an `impeccable` on `PATH` before it downloads.
- **Retired sentence.** "No other call changes it, and no call after the pin does." becomes: "No other call overrides the home variable, unsets `IMPECCABLE_BIN` or filters `PATH`; every call after the pin carries the pinned `IMPECCABLE_BIN` with the user's `PATH` and home variable." (J-B1: the first draft's "changes any of the three" contradicted the pin.)
- **Record sentence.** The `Download home override:` field takes the §5 shape.
- ***Engine consent* row *Home override*.** Append ", with `IMPECCABLE_BIN` unset and no `PATH` entry under `~/.impeccable`" before the closing cell bar. The regex at `test/design-eval-contract.test.js:60` requires the cell to end after `IMPECCABLE_HOME`, so that pin is updated.

### 7.4 FR-4, restatements

| Site | Today | After |
|---|---|---|
| Reference `design-evaluation.md` template line `Download home override:` | `<variable>=<dir> (one call) \| none` | The §5 shape |
| `docs/skills/impeccable-bridge.md` *Detector Gate* | "A capture whose consent banner is not rendered reads `Unevaluated` and never `pass`." | "A consent banner that is not rendered turns only a would-be `pass` into `Unevaluated`; `covered` and `below fold` stand." |
| `CHANGELOG.md` `Unreleased`, *Engine isolation* bullet | "under an exclusion only the one download call changes the home variable" | "under an exclusion only the one download call changes the home variable, unsets `IMPECCABLE_BIN` and drops excluded `PATH` entries" |
| `CHANGELOG.md` `Unreleased`, *first-visit* bullet | "A consent banner must be seen on screen, otherwise the capture reads `Unevaluated (consent banner not rendered: <reason>)`" | "A consent banner must be seen on screen; when it is not, a would-be `pass` reads `Unevaluated (consent banner not rendered: <reason>)`, while `covered` and `below fold` stand" |
| `CHANGELOG.md` `Unreleased`, new bullet | — | W-2: byte-exact strip and the reference command |

Each "Today" string was read at `71a41d9` (J-A1: the P-5 greps missed the CHANGELOG lines because their wording differs).

### 7.5 Test plan (NFR-3)

The new file `test/design-eval-followup.test.js` copies the `read`, `index` and `slice` helper shapes from `test/design-eval-contract.test.js`. Every assertion reads the named section only.

| Clause | Assertion (section) |
|---|---|
| FR-1 bullet 1: banner state recorded separately | Item 4 states "the banner state reads `not rendered: <reason>`" |
| FR-1 bullet 2 + scenario 2 BUT: only `pass` changes, never reads `pass` | Item 4 contains "only a would-be `pass` changes" and still "and never reads `pass`" |
| FR-1 bullet 3 + scenario 1 THEN/BUT: `below fold`/`covered` stand, with the reason | Item 4 contains "A `below fold` or `covered` outcome stands" and "cannot bring the CTA into view or uncover it" |
| FR-1 bullet 4: item 3 `Unevaluated` keeps its reason | Item 4 contains "keeps its own reason" |
| FR-1 bullet 5: remedy for any outcome | Item 4 contains "whatever the CTA outcome" |
| FR-1 P-16 BUT: identification does not depend on text | Item 3's identification order names no text match (it never contains "text"): a regression guard. The fixture itself is the `/akili-validate` walkthrough |
| FR-2 bullet 1 | *Verify* contains "byte-exact" and "a missing final newline included" |
| FR-2 bullet 2 + BUT | *Verify* contains "adds or removes any other byte does not conform" and "appends a final newline" |
| FR-2 bullet 3 | *Verify* contains the `node -e` string. The test **executes** that string, as extracted from the bridge, against the vendored folder and asserts that it prints the `UPSTREAM.md` `SKILL.md` hash. A behavioral check, not presence (Falsifiability 3) |
| FR-2 AND IT MUST: range rule kept | The existing pin `test/design-eval-contract.test.js:113` stays green |
| FR-3 bullets 2–4 | Item 4 exclusion paragraph contains "`IMPECCABLE_BIN` unset", "resolved against the user's real home before the home override", and the reason sentence |
| FR-3 BUT | Item 4 contains "No other call overrides the home variable, unsets `IMPECCABLE_BIN` or filters `PATH`" and the after-the-pin clause. *Launcher form* still never sets a home variable (the existing `:99` assertion) and never contains `env -u` |
| FR-3 AND IT MUST: record | The record sentence and the reference template carry the §5 shape |
| FR-4 restatements | Doc sentence, reference line, both CHANGELOG sentences, new CHANGELOG bullet |
| FR-4 sweep | The walker in `test/design-eval-contract.test.js` is private to that file, so the new file reimplements it in the same shape (`.claude`, `docs`, `README.md`, minus `docs/specs/` and `.claude/skills/impeccable/`) **and adds `CHANGELOG.md`** (D-1). No file in that scope keeps "No other call changes it", "reads `Unevaluated` and never `pass`", "`Download home override: <variable>=<dir> (one call)`" or "otherwise the capture reads `Unevaluated (consent banner not rendered" |

## 8. Frontend / UX Component Architecture

n/a: rules text only. The P-16 fixture is a walkthrough scenario (requirements FR-1), not UI work.

## 9. Shared Contracts or Package Extensions

- The bridge is the single owner (NFR-2). The reference field, the doc sentence and the CHANGELOG restate it.
- No command gains a bridge string.

## 10. Design Decisions

| ID | Decision | Rejected | Reason |
|---|---|---|---|
| DD-1 | The banner state is a separate field. A missing banner downgrades only `pass`; `below fold` and `covered` stand | (a) Always `Unevaluated` when there is no banner: it loses the P1 (the W-1 defect). (b) A two-row capture model: it reshapes the report format child 1 just shipped | It keeps the P1 visible and the honest `Unevaluated` for the one case it was written for. The banner field already exists (P-4) |
| DD-2 | The rationale sentence ships in the bridge | Precedence with no reason | A reason lets a reader apply the rule to a case it does not cite. It rests on P-6 |
| DD-3 | The W-2 reference command is `node -e`, reading `latin1` | POSIX `sed` (GNU unchecked, P-2b; absent on Windows); a script file in the bridge folder | Node is AKILI's runtime on every host, and the command prints the hash with no OS-specific hashing tool. A one-liner adds no shipped file |
| DD-4 | Keep the `Download home override:` label and widen its value | Rename to `Download call override:` | A rename churns pins and the reference for a cosmetic gain |
| DD-5 | Filter only the `PATH` entries under `~/.impeccable` | A fixed minimal `PATH` for the download call | A fixed `PATH` can hide `curl`/`wget` (`scripts/impeccable:160-163`) and `shasum`/`sha256sum` (`:69-72`), which the launcher needs |
| DD-6 | New assertions go in a new test file; only replaced-sentence pins change in the old ones | Append to `test/design-eval-contract.test.js` | Its `@akili-spec` header names child 1 |
| DD-7 | The FR-2 test executes the bridge's command string | A presence check only | A presence check proves the string is there, not that it reproduces the hash |

**Reversion challenge (Step 2.3).** The only reversion is in DD-1: "a capture without a banner never reads anything but `Unevaluated`" now applies to the `pass` case only. *What does removing this break?* An agent that relied on "every capture without a banner is `Unevaluated`" now records a `below fold` P1 that the first-visit evidence does not fully cover. That is the intended outcome (JC's brief: "debe seguir siendo P1, no unverified"), and it produces no false `PASS`. Answer recorded; no change.

## 11. Premise Ledger

Count: 10 rows. 7 verified, 3 `UNVERIFIED` (all Low).
Blast-radius triggers: `consumer` fires (the change edits sentences and a report field that tests, docs and the CHANGELOG restate). `live-path` and `shared-state` do not apply: there is no user action and no shared runtime state, only rules text.

| # | Claim | Class | Citation (as run) | Verified at | If false | Settled by |
|---|---|---|---|---|---|---|
| P-1 | Items 3 and 4 of *First-visit pass* state no precedence between a CTA outcome and a missing banner | `location` | `sed -n '196,199p' .claude/skills/impeccable-bridge/SKILL.md` (run 2026-10-31 by both judges); archived validation §8.2 "FR-4 + FR-5 together" | `71a41d9` | FR-1 is unnecessary (High) | — |
| P-2 | The vendored `SKILL.md` has no final newline. The `latin1` node strip prints `a2ba4387…` (the `UPSTREAM.md` value), and the same strip on a copy with `\n` appended prints `6fccc12f…` | `data-env` | `tail -c 20 … \| xxd` → `7761 792e`; node strip in `.claude/skills/impeccable` → `a2ba4387401c…6e4e`; with `\n` appended → `6fccc12fd4b3…4dc6244`. Node v22.12.0, macOS; reproduced by both judges. The CI matrix also runs Node 18: the FR-2 test executes the command on every leg (§7.5), which settles it there | `71a41d9` | DD-3 changes (High) | — (Node 18: the T3 test on CI, after push, which is outside this cycle) |
| P-2b | GNU `sed` keeps a missing final newline as BSD `sed` does | `data-env` | `UNVERIFIED — confirm at source before relying on it` | — | Nothing ships on it after DD-3 (Low) | No owner needed in this spec: DD-3 removed the dependence. Recorded for the proposal's R-4 |
| P-3 | Both launchers run `IMPECCABLE_BIN`, then a probed `impeccable` on `PATH`, before their download block. `IMPECCABLE_LAUNCHER_PROBE` comes only from the environment, so the `PATH` exec is reachable on the download call | `location` | `scripts/impeccable:90-91`, `:147-148`, download block from `:151`; `:15`, `:34` (probe flag); `scripts/impeccable.cmd:29-31`, `:96-100` (`where impeccable` follows `PATH`) | `71a41d9` | FR-3 changes (High) | — |
| P-4 | The banner state is already recorded per capture, separately from the CTA | `existence` | Bridge "Record the capture conditions … banner state (`visible`, `not rendered: <reason>`, `none in product`)"; `design-evaluation.md:136-139` `Banner` column | `71a41d9` | DD-1 adds a field (Low) | — |
| P-5 | The pins and restatements of the changed sentences are exactly these | `consumer` | `grep -rnF '<p>' .claude docs test CHANGELOG.md README.md \| grep -v '^docs/specs/' \| grep -v '^.claude/skills/impeccable/'` for `and never reads \`pass\``, `never \`pass\``, `No other call changes it`, `Download home override`, `block removed`, `the download call alone runs`, run 2026-10-31 → bridge `:58`, `:78`, `:80`, `:106`, `:199`; reference `:99`; `docs/skills/impeccable-bridge.md:37`; `test/design-eval-contract.test.js:60`, `:79`, `:97`, `:106`, `:113`, `:234`, `:248`, `:403`; `test/design-eval-contract-coverage.test.js:69`; `test/impeccable-vendor.test.js:64` (a comment, unchanged). **Plus** `CHANGELOG.md:12` and `:13`, which the six patterns miss because their wording differs (`sed -n '12,13p' CHANGELOG.md`, J-A1) | `71a41d9` | A pin breaks unplanned (Low) | Copied into each task's `Consumers` |
| P-6 | Rendering a consent banner never brings a below-fold CTA into view and never removes another element covering it | `other` | `UNVERIFIED — confirm at source before relying on it` (a general claim about banner layouts; no primary source covers every site) | — | DD-2's rationale sentence is narrowed. The direction stays safe, never a false `PASS` (Low) | The Lead (open question 2); `/akili-validate` walks a held-out case |
| P-7a | On akili.com.co `/es/` the first `main a\|button` is the hero CTA whose text starts with "Agenda tu diagnóstico gratuito", and the page carries a consent banner | `data-env` | `curl -sL https://akili.com.co/es/` (2026-10-31, 95,459 bytes), first `<a\|button>` after `<main` → "Agenda tu diagnóstico gratuito"; `data-consent-banner` present (both reproduced by judge B) | `71a41d9` | The fixture's identification changes; nothing shipped depends on it (Low) | — |
| P-7b | At the 8 viewports, with the cookie bar rendered, the CTA reads `pass` | `data-env` | `UNVERIFIED — confirm at source before relying on it`: the Lead's measurement, stated by JC (user-stated, citation rule (d)) | — | The fixture's expected outcome changes; nothing shipped depends on it (Low) | The Lead (user-stated); walked at `/akili-validate` |
| P-8 | The command's quoting (double outer quotes; no `"`, `$`, backtick, `%` or `!` inside) passes unchanged through `sh`, `cmd.exe` and PowerShell | `data-env` | Verified on `zsh` (macOS) only by executing it; `cmd.exe` and PowerShell `UNVERIFIED — confirm at source before relying on it` | `71a41d9` | The Windows example needs a variant (Low) | Accepted risk (requirements §7); first Windows user of *Verify* |

The count line counts P-8 as verified because it was executed on `zsh`. Its Windows half stays open as an accepted risk. Open items with an owner: P-6, P-7b, and P-8 (Windows half). P-2b is `UNVERIFIED` but needs no owner (N-1, D-3).

**Open questions for the Lead** (not blocking):

1. Should `1366x768`, the default desktop short-height, be measured on `/es/`? JC kept it out of the fixture.
2. P-6: does any banner layout in the Lead's projects reflow the hero upward?

## 12. Budget (Step 2.4)

| Measure | Estimate |
|---|---|
| Tasks | 4 |
| Authored LOC | ~210: rules prose ~25, reference, doc and CHANGELOG ~15, tests ~170 (KZ-bugfix--init-ctrlc-abort-2: tests budgeted at about 3× the first guess) |
| Review rounds | ~7: 2 each for T1–T3 (rules text other agents execute), 1 for T4 |

Depth: Standard fits. One task per amendment keeps each review to a single rules file (Step 3.2 split rule).
