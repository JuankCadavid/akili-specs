# Requirements: Close the three rule gaps left by design-eval-contract

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/impeccable-audit-fixes/design-eval-followup` |
| Parent Spec | `changes/impeccable-audit-fixes` (`family.md`, child 2) |
| Depth | **Standard, small.** Three amendments to one skill's rules text, one report-template field, one doc restatement, text-contract tests. No code, no installer change, no vendored edit |
| Type | Change |
| Deliverable | `software` |
| Approval Mode | `pre-approved (JC, 2026-10-31)`; mandate quoted in `proposal.md` Document Control. Hard stops: no push, PR, merge, tag, publish, branch deletion, AWS or GitHub writes |
| Status | **Approved**: Phase 1 gate `auto-approved (pre-approved mode)`, 2026-10-31. FR-3 and FR-4 corrected after judgment-day (J-B1, J-A1), factual corrections logged in `judgment.md` |
| Proposal | `proposal.md`, approved by JC 2026-10-31, Option A. R-2 resolved by JC: the P-16 fixture keeps the 8 viewports the Lead measured |
| Source | Archived child 1 `validation-report.md` §2 (W-1, W-2, W-4), §8.2, §8.3, §11 |
| Amends | Archived child 1 FR-1, FR-2 and FR-5 (the archive stays frozen; this file holds the amended text) |
| Format source | Archived child 1 `requirements.md`. There is no `docs/specs/general-setup/` (`ls docs/specs/general-setup` → "No such file or directory", 2026-10-31) |
| Verified at | `71a41d9` |
| Release | Patch, recorded only |

## 2. Executive Summary

Child 1 made the design-evaluation rules strict. Its validation found three places where two literal readers still get different results:

- **FR-1 (W-1, amends FR-5):** a missing consent banner turns only a would-be `pass` into `Unevaluated`. `below fold` and `covered` stand with their P1 / FAIL.
- **FR-2 (W-2, amends FR-2):** the `SKILL.md` strip before hashing is byte-exact. One cross-platform reference command is named and executed.
- **FR-3 (W-4, amends FR-1):** under an exclusion, the one download call also runs without `IMPECCABLE_BIN` and without excluded `PATH` entries.
- **FR-4:** every shipped restatement follows.

## 3. Glossary

| Term | Meaning |
|---|---|
| Bridge | `.claude/skills/impeccable-bridge/SKILL.md` |
| Reference | `.claude/skills/impeccable-bridge/references/design-evaluation.md` |
| CTA outcome | The item 3 result of a first-visit capture: `pass`, `covered (<el>)`, `below fold (y=<top>)`, `Unevaluated (no CTA found)`, `Unevaluated (CTA not visible: <style>)` |
| Banner state | `visible`, `not rendered: <reason>`, `none in product` (already a *Capture conditions* field) |
| Exclusion | The user excludes `~/.impeccable` (bridge Step 0 *Exclusion*) |
| Download call | The one consented `<launcher> engine-probe` call that may download (bridge Step 0 item 4) |

## 4. System Context & Scope

At `71a41d9`:

| Fact | Evidence (as run) |
|---|---|
| Item 3 checks five outcomes in order. Item 4 says that when the banner is not rendered "the capture reads `Unevaluated (consent banner not rendered: <reason>)` and never reads `pass`". Neither states a precedence | Bridge *First-visit pass* items 3 and 4 |
| The vendored `SKILL.md` ends without a newline. The bridge does not say how to treat the last byte when stripping | `tail -c 20 .claude/skills/impeccable/SKILL.md \| xxd` → last bytes `7761 792e`; bridge Step 0 *Verify* |
| Stripping with BSD `sed` gives the `UPSTREAM.md` hash `a2ba4387…`. `awk` gives `6fccc12f…`. The Node strip in `test/impeccable-vendor.test.js:66-79` matches | Run 2026-10-31, macOS, Node v22.12.0 |
| The POSIX launcher execs `IMPECCABLE_BIN` (`scripts/impeccable:90-91`) and a probed `impeccable` on `PATH` (`:147-148`) before its download block (`:160` on). The cmd launcher does the same (`scripts/impeccable.cmd:29-31`, `:96-100`) | Read 2026-10-31 |
| Under an exclusion, the download call changes only the home variable | Bridge Step 0 item 4, second paragraph |
| `docs/skills/impeccable-bridge.md` restates "A capture whose consent banner is not rendered reads `Unevaluated` and never `pass`", pinned by `test/design-eval-contract-coverage.test.js:69` | Read 2026-10-31 |

**In scope:** proposal §5. **Out of scope:** proposal §6 (W-3, W-6, W-7, archive edits, vendored files, browser automation, CRLF checkouts).

## 5. Stakeholders / Personas

| Persona | Need |
|---|---|
| Agent running `/akili-audit design` or the `/akili-validate` design gate | One verdict per capture, whoever reads the rules |
| Project owner | A hidden P1 never reads as `Unevaluated`; an excluded engine never runs |
| AKILI maintainer | A verification that does not depend on the tool |

## 6. Functional Requirements

### FR-1: A missing banner replaces only a `pass` (W-1; amends child 1 FR-5)

**Before:** "If it is not rendered, the capture reads `Unevaluated (consent banner not rendered: <reason>)` and never reads `pass`." Item 3 and item 4 give no order.

**After:** the bridge SHALL:

- record the banner state for every capture, separately from the CTA outcome;
- when the banner is not rendered, change only a CTA outcome of `pass`: that capture reads `Unevaluated (consent banner not rendered: <reason>)` and never reads `pass`;
- keep a `below fold` or `covered` outcome, with its P1 in `/akili-audit design` and FAIL in `/akili-validate`, when the banner is not rendered, and give the reason: a banner that is absent cannot bring the CTA into view or uncover it;
- keep an item 3 `Unevaluated` outcome with its own reason;
- name the test-ID remedy whenever the banner is not rendered, whatever the CTA outcome.

#### Scenario: Below the fold, banner not rendered (the 2.40.0 `/es/` capture)

- GIVEN `/es/` at `375x667`, CTA top at y=650 (height ≥ 34), banner in source but not rendered
- WHEN the first-visit pass runs
- THEN the capture reads `below fold (y=650)`: P1 in `/akili-audit design`, FAIL in `/akili-validate`
- AND the banner state reads `not rendered: <reason>`, and the report names the test-ID build
- BUT it must NOT read `Unevaluated` for the CTA outcome
- AND IT MUST NOT read `pass`

#### Scenario: Would-be pass, banner not rendered

- GIVEN a CTA whose hit-test returns the CTA, with the banner not rendered
- WHEN the pass runs
- THEN the capture reads `Unevaluated (consent banner not rendered: <reason>)`
- BUT it must NOT read `pass`

#### Scenario: P-16 positive fixture (confirmed by JC through the Lead)

- GIVEN akili.com.co `/es/`, a Persuade screen with no declared Primary CTA and no Primary CTA style, so the method is `first main action`. The CTA is the hero link whose text **starts with** "Agenda tu diagnóstico gratuito": on `main` at `3a39bb8` it carries "· 30 min sin costo"; after release `fix-auditoria-1031` it reads exactly "Agenda tu diagnóstico gratuito"
- WHEN the pass runs at `390x664`, `375x667`, `1024x700`, `1024x768`, `1200x700`, `1280x720`, `1280x800` and `1440x900`, with the cookie bar rendered
- THEN each capture reads `pass`, banner state `visible`
- BUT the identification must NOT depend on the CTA's text or its suffix
- AND IT MUST report each viewport's own outcome
- Note: `1366x768` (the default desktop short-height) is not in the fixture, by JC's decision. It is an open question for the Lead (design §11)

### FR-2: Byte-exact `SKILL.md` strip (W-2; amends child 1 FR-2)

**Before:** "Hash `SKILL.md` with its `metadata:` block removed, from the line `metadata:` up to, **not** including, the closing `---` fence." Nothing is said about the other bytes.

**After:** the bridge SHALL:

- state that the strip is byte-exact: it removes only the lines from `metadata:` up to, not including, the closing fence, and leaves every other byte as it is, including a missing final newline;
- state that a tool that adds or removes any other byte does not conform, and name the trailing newline as the known case;
- name one reference command that conforms, runs on macOS, Linux and Windows, and prints the hash.

#### Scenario: The vendored copy, no trailing newline

- GIVEN the vendored `SKILL.md` as shipped
- WHEN *Verify* runs the reference command
- THEN the printed hash equals the `SKILL.md` line of `UPSTREAM.md`, and the copy reads `vendored (<version>, verified)`
- BUT a strip that appends a newline must NOT be called conforming
- AND IT MUST keep the existing range rule (from `metadata:` up to, not including, the closing fence)

### FR-3: The download call runs nothing under the excluded home (W-4; amends child 1 FR-1)

**Before:** under an exclusion, "That one download call runs with the launcher's home variable set to an empty directory inside `IMPECCABLE_HOME` … No other call changes it, and no call after the pin does."

**After:** under an exclusion, the bridge SHALL run the one download call:

- with the home variable set as before (`HOME` for `scripts/impeccable`, `USERPROFILE` for `scripts/impeccable.cmd`);
- with `IMPECCABLE_BIN` unset;
- with every `PATH` entry that resolves under the excluded `~/.impeccable` removed, resolved against the user's real home before the home override;
- and give the reason: each launcher runs `IMPECCABLE_BIN` and then an `impeccable` on `PATH` before it downloads.

No other call overrides the home variable, unsets `IMPECCABLE_BIN` or filters `PATH`. Every call after the pin carries the pinned `IMPECCABLE_BIN` with the user's `PATH` and home variable. The report records all three. (Corrected 2026-10-31 after judgment-day J-B1: the first draft read "No other call, and no call after the pin, changes any of the three", which contradicts the pin.)

#### Scenario: Excluded engine exported and on PATH

- GIVEN an exclusion, `IMPECCABLE_BIN=~/.impeccable/bin/impeccable` exported, `~/.impeccable/bin` on `PATH`, and consent to download into `IMPECCABLE_HOME=/tmp/x`
- WHEN Step 0 runs the download call
- THEN neither excluded binary runs, and the download lands in `/tmp/x/bin/<VERSION>/`
- AND every later launcher call runs with `IMPECCABLE_BIN` pinned to it and with the user's `PATH` and home variable
- BUT it must NOT override the home variable, unset `IMPECCABLE_BIN` or filter `PATH` for any call other than the download call
- AND IT MUST record the home override, the unset `IMPECCABLE_BIN` and the removed `PATH` entries

### FR-4: Restatements follow

Every shipped restatement of an amended rule SHALL match it: the reference's report-template field for the download call, the `docs/skills/impeccable-bridge.md` banner sentence, the two existing `CHANGELOG.md` `Unreleased` sentences that restate the replaced rules ("under an exclusion only the one download call changes the home variable"; "A consent banner must be seen on screen, otherwise the capture reads `Unevaluated (consent banner not rendered: <reason>)`"), and a new `Unreleased` entry. The retired sentences SHALL be absent from shipped text, which a sweep assertion checks. (The CHANGELOG sentences were added 2026-10-31 after judgment-day J-A1.)

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | No byte under `.claude/skills/impeccable/` changes; `test/impeccable-vendor.test.js` stays green |
| NFR-2 | Single owner: the rules live in the bridge; the reference, the doc and the CHANGELOG restate them. No command gains a bridge command string (`test/impeccable-bridge.test.js:102-105`) |
| NFR-3 | One text-contract assertion per new `SHALL`, `BUT` and `AND IT MUST` clause, each with an executed mutation that turns it red |
| NFR-4 | `npm test`, `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` pass |
| NFR-5 | No shipped file or test cites this spec's path (KZ-changes--archify-diagrams-1) |

### Defect classes and their gates

| Defect class | Gate |
|---|---|
| A required clause missing from the shipped text | Section-scoped text-contract tests (NFR-3), plus the Reviewer's term-by-term walk of FR-1 to FR-3 (KZ-changes--gate-falsifiability-2) |
| A retired sentence surviving | A phrase-family sweep before review, plus a sweep assertion (KZ-changes--kaizen-loop-closure-2) |
| A reference command that does not reproduce the hash | **Executed** in T3 against the vendored copy, and against a copy with a newline appended (must differ); output quoted |
| An edit to the vendored copy | `test/impeccable-vendor.test.js`, `git diff --stat -- .claude/skills/impeccable/` |
| A rule two agents still read differently | **No automated check.** Substitute: the `/akili-validate` walkthrough of the FR-1 to FR-3 scenarios against the shipped text, plus held-out cases (a `covered` capture without a banner; a `PATH` entry outside the excluded home) |
| The reference command behaving differently on Windows | **Accepted risk**: no Windows host in this cycle. The command is written with double outer quotes and no `"`, `$`, backtick, `%` or `!` inside, so `sh`, `cmd.exe` and PowerShell pass it unchanged (design P-8, `UNVERIFIED` on Windows); CI's Windows leg runs the vendor test, not the command |

## 8. Requirement ID Index

| ID | Gap | Owner file(s) |
|---|---|---|
| FR-1 | W-1 | bridge *First-visit pass* item 4 |
| FR-2 | W-2 | bridge Step 0 *Verify* |
| FR-3 | W-4 | bridge Step 0 item 4, *Engine consent* |
| FR-4 | — | reference, `docs/skills/impeccable-bridge.md`, `CHANGELOG.md` |
