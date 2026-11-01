# Proposal: Close the three rule gaps left by design-eval-contract (W-1, W-2, W-4)

**Answer first:** three short rules-text amendments to `.claude/skills/impeccable-bridge/SKILL.md`, each with text-contract assertions:

| # | Gap | Fix |
|---|---|---|
| W-1 | Below-fold CTA + unrendered banner: the rules give no order, so a P1 can read `Unevaluated` | The CTA outcome and the banner state are recorded separately. A missing banner replaces **only** a `pass`; `below fold` and `covered` stand (P1 / FAIL). Amends FR-5 |
| W-2 | The `SKILL.md` hash depends on the strip tool (file has no trailing newline) | *Verify* becomes byte-exact: remove only the `metadata:` lines, keep every other byte, add no newline. One POSIX reference command, executed against `UPSTREAM.md` |
| W-4 | Under an exclusion, the one download call can still exec an engine under `~/.impeccable` | That call also runs with `IMPECCABLE_BIN` unset and no `PATH` entry under the excluded home. Amends FR-1 |

The P-16 fixture JC confirmed through the Lead becomes this spec's positive scenario. It covers the hero CTA "Agenda tu diagnóstico gratuito", above the fold at 8 viewports, with the cookie bar visible.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/impeccable-audit-fixes/design-eval-followup` |
| Slug | `design-eval-followup`, derived from the free-text argument ("follow-up de design-eval-contract para W-1, W-2 y W-4") |
| Parent Spec | `changes/impeccable-audit-fixes` (`family.md`, child 2; the row was added with JC's approval on 2026-10-31, and `install-stale-skills` moved to 3) |
| Type | Change (amends approved requirements FR-1, FR-2 and FR-5 of the archived child 1; no defect in shipped code) |
| Deliverable | software (rules text in one skill, text-contract tests, CHANGELOG) |
| Approval Mode | `pre-approved (JC, 2026-10-31)`. Mandate: "Aprobado por JC (mandato: seguir hasta archive) … Continúa en secuencia tomando tus opciones recomendadas sin preguntarme … Detente y avísame solo si aparece algo que requiera a JC (HITL), un aumento de alcance o otra enmienda de requisitos." Hard stops: no push, PR, merge, tag, publish, branch deletion, AWS or GitHub writes; local commits only |
| Status | **Approved** by JC, 2026-10-31, Option A |
| Requested by | Juan Carlos Cadavid, 2026-10-31. "Que Claude (Opus) decida el enfoque" |
| Source | `docs/specs/archive/2026-10-31-changes--impeccable-audit-fixes--design-eval-contract/validation-report.md`: §2 W-1, W-2, W-4, §8.2 walkthrough, §11 Remediation, and the `/akili-validate` recommendation to "do W-1 first" |
| Source questions | No Jira or Figma: the source is the validation report plus JC's brief. Rules text only, no UI |
| Visual | None (rules text) |
| Depends on | none (child 1 is archived) |
| Parallel-safe | yes. It shares only `CHANGELOG.md` `Unreleased` with `install-stale-skills` |
| Base | `6743256`, branch `JuankCadavid/impeccable-audit-fixes`, local only |
| Release | Patch (it amends existing rules and adds no command or target) |

## 2. Intent

Every first-visit verdict and every engine or copy check in Step 0 should read the same way, whichever agent or tool runs it. Child 1 made the rules strict. This follow-up removes the three places where the reader still decides the result.

## 3. Problem / Current Behavior

| # | Current behavior | Evidence |
|---|---|---|
| W-1 | First-visit item 3 checks outcomes in a fixed order and yields `below fold (y=<top>)` when the CTA's centre is at or below the bottom edge. Item 4 says that when the banner is not rendered, "the capture reads `Unevaluated (consent banner not rendered: <reason>)` and never reads `pass`". Neither says which wins on one capture | `.claude/skills/impeccable-bridge/SKILL.md` *First-visit pass*, items 3 and 4 (read 2026-10-31). Validation §8.2 row "FR-4 + FR-5 together": "A literal agent records `Unevaluated` → validate `WARN`, and the audit loses the P1" |
| W-2 | *Verify* says "Hash `SKILL.md` with its `metadata:` block removed, from the line `metadata:` up to, **not** including, the closing `---` fence", and does not say how to treat the last byte. The vendored `SKILL.md` ends in `way.` with no newline | `tail -c 20 .claude/skills/impeccable/SKILL.md \| xxd` → `…7761 792e` (no `0a`). `sed '/^metadata:/,/^---$/{/^---$/!d;}' … \| shasum -a 256` → `a2ba4387…`, which matches `UPSTREAM.md` line 22. `awk '/^metadata:/{s=1} /^---$/{s=0} !s' … \| shasum -a 256` → `6fccc12f…`, a mismatch. Run 2026-10-31 on macOS |
| W-4 | Under an exclusion, the probe skips `IMPECCABLE_BIN` or a `PATH` engine that lies under `~/.impeccable`. The download call changes only the home variable. The POSIX launcher execs `IMPECCABLE_BIN` (if executable) and then a probed `impeccable` on `PATH` **before** it reaches the download block | `scripts/impeccable` lines 90–91 (`exec "${IMPECCABLE_BIN}"`), 147–148 (`command -v impeccable … exec impeccable`), download from line 160 on. `scripts/impeccable.cmd` lines 29–31 (`IMPECCABLE_BIN`) and 96–100 (`where impeccable`, `call :probe`, run), before `:download`. Bridge Step 0 item 4, read 2026-10-31. The run then fails closed: the pin under `IMPECCABLE_HOME` does not answer → `unavailable` (validation §8.2 H-3) |
| P-16 | Archived design P-16 is `UNVERIFIED` (W-5): the CTA order picks the hero CTA on akili.com.co `/es/` | Archived `design.md` §11 P-16. Validation §8.3 (one GET of `/es/` supports it) |

None of the three yields a false `PASS` (validation §8.2 walkthrough outcome). W-1 is the costly one, because it hides a P1.

## 4. Proposed Outcome

- **W-1:** on a capture where the CTA reads `below fold` or `covered` and the banner is not rendered, the capture keeps that outcome: P1 in `/akili-audit design`, FAIL in `/akili-validate`. The banner state is recorded beside it as `not rendered: <reason>`, and the test-ID remedy is still named. A missing banner changes only `pass` into `Unevaluated (consent banner not rendered: <reason>)`. `Unevaluated (no CTA found)` and `Unevaluated (CTA not visible: …)` keep their own reason.
- **W-2:** any conforming tool gives `a2ba4387…` for the vendored `SKILL.md`. The rule is byte-exact, and one reference command that meets it is named and executed against `UPSTREAM.md`.
- **W-4:** under an exclusion, nothing under `~/.impeccable` runs, the download call included. A previously excluded engine can no longer answer the download call, so the record no longer reads `installed (consented)` for a binary that was never downloaded.
- **P-16:** verified. JC confirmed it through the Lead, and the fixture below becomes a written scenario.

## 5. Scope

| In | Where |
|---|---|
| W-1 precedence sentence, with the banner state recorded separately | Bridge *First-visit pass*, item 4, plus the priority bullet below the list |
| FR-5 amendment, FR-4 cross-reference | This spec's `requirements.md` (MODIFIED FR-5; the archived text stays frozen) |
| W-2 byte-exact rule plus a POSIX reference command | Bridge Step 0 *Verify* |
| W-4: the download call's environment (`IMPECCABLE_BIN` unset, excluded `PATH` entries removed), both launchers | Bridge Step 0 item 4 (*Consent*, exclusion paragraph), *Engine consent* table row *Home override* |
| Report fields that record the override | `references/design-evaluation.md` line 99 (`Download home override: …`) |
| P-16 fixture as the positive FR-4/FR-5 scenario; the 2.40.0 `/es/` capture as the W-1 regression scenario | This spec's `requirements.md` |
| Text-contract assertions for each amendment, plus a sweep for the superseded phrasing | `test/design-eval-contract.test.js` (and the coverage suite if a clause ID is added) |
| CHANGELOG `Unreleased` note | `CHANGELOG.md` |

## 6. Non-Goals

- **W-3** (an `off-screen` outcome, or (c) on every edge). It stays a separate future spec, as the validation report routes it.
- W-6 count drift and W-7 CHANGELOG tense. They are child 1's archive and release items, not rules gaps.
- Editing archived files. P-16 is recorded verified here, not in the archive.
- Any change to the vendored Impeccable files or launchers (`.claude/skills/impeccable/**`). The fix is in how the bridge calls them.
- Browser automation in this repo. The tests are text contracts. The fixture is a written scenario, not a live capture.
- CRLF checkouts of the vendored copy. `UNVERIFIED — confirm at source before relying on it` whether `.gitattributes` keeps `.claude/skills/impeccable/**` byte-exact on Windows (owner: `/akili-specify` Premise Ledger). If it does not, every hash diverges, not only `SKILL.md`, and that is a separate issue.

## 7. Affected Users, Systems, And Specs

| Affected | How |
|---|---|
| `/akili-audit design`, `/akili-validate` design gate | W-1 verdict precedence |
| Any Step 0 run (every design phase) | W-2 verification, W-4 download call |
| `.claude/skills/impeccable-bridge/SKILL.md`, `references/design-evaluation.md` | Rules text |
| `test/design-eval-contract.test.js`, `test/design-eval-contract-coverage.test.js`, `test/impeccable-vendor.test.js` (line 64 states the strip in its comment; read only, to keep the wording consistent) | Assertions |
| Archived `design-eval-contract` FR-1, FR-2, FR-5 | Amended by reference |
| Sibling `install-stale-skills` | No overlap except `CHANGELOG.md` |

## 8. Visual Reference

- Source: None
- Location: n/a
- Notes: rules text and tests only. The P-16 fixture is a written scenario confirmed by JC through the Lead; no screenshot is attached to this spec.

## 9. Requirement Delta Preview

### MODIFIED Requirements

- **FR-5 (W-1):** the banner assertion is a separate field of the capture. When the banner is not rendered:
  - a CTA outcome of `pass` becomes `Unevaluated (consent banner not rendered: <reason>)`;
  - `below fold` and `covered` stand, with their P1 / FAIL;
  - `Unevaluated (no CTA found | CTA not visible)` keeps its own reason.

  The banner state is always recorded, and the remedy is always named. Rationale: a banner that is absent can only remove an obstruction, so its absence cannot make a below-fold or covered CTA reachable. That claim becomes a Premise Ledger row (§12).
- **FR-2 (W-2):** the strip is byte-exact. It removes the lines from `metadata:` up to, not including, the closing fence, and leaves every other byte unchanged, including a missing final newline. A tool that adds or removes a byte does not conform. The bridge names one POSIX command that conforms.
- **FR-1 (W-4):** under an exclusion, the one download call also runs with `IMPECCABLE_BIN` unset, and with every `PATH` entry that resolves under `~/.impeccable` removed. Both launchers are covered. The BUT clause widens from "the home variable" to "the download call's environment": no other call, and no call after the pin, changes any of the three.

### ADDED Requirements (scenarios)

- **W-1 regression (2.40.0 `/es/`):** GIVEN `/es/` at `375x667`, CTA top at y=650, banner in source but not rendered. WHEN the pass runs, THEN the capture reads `below fold (y=650)` and P1 (FAIL in validate), with banner state `not rendered: <reason>`. BUT it must NOT read `Unevaluated` for the CTA. AND it must name the test-ID build.
- **P-16 positive fixture (confirmed by JC through the Lead):**
  - GIVEN akili.com.co `/es/`, a Persuade screen with no declared Primary CTA. The CTA is found by the `first main action` method: the hero link whose text **starts with** "Agenda tu diagnóstico gratuito". On `main` at `3a39bb8` it carries the suffix "· 30 min sin costo"; after release `fix-auditoria-1031` the text is exactly "Agenda tu diagnóstico gratuito".
  - WHEN the pass runs at `390x664`, `375x667`, `1024x700`, `1024x768`, `1200x700`, `1280x720`, `1280x800` and `1440x900`, with the cookie bar rendered,
  - THEN each capture reads `pass` with banner state `visible`.
  - BUT the CTA match must NOT depend on the suffix.
  - AND each viewport reports its own outcome and source.
- **W-2:** GIVEN the vendored `SKILL.md` (no trailing newline), WHEN *Verify* runs, THEN the stripped hash equals the `UPSTREAM.md` value with the reference command. BUT a tool that appends a newline must NOT be called conforming.
- **W-4:** GIVEN an exclusion, `IMPECCABLE_BIN=~/.impeccable/bin/impeccable` exported, and `~/.impeccable/bin` on `PATH`, WHEN the consented download runs, THEN neither binary is executed, and the download lands under `IMPECCABLE_HOME`. AND the record names the overridden variables.

### REMOVED Requirements

- None.

## 10. Approach Options

| Option | W-1 | W-2 | W-4 | Trade-off |
|---|---|---|---|---|
| **A. Minimal amendments** | Precedence sentence in item 4: the banner replaces only `pass` | Byte-exact rule plus one POSIX reference command | Unset `IMPECCABLE_BIN`, filter `PATH`, for the download call only | Smallest diff (~3 sentences plus one table row); keeps the outcome list and the launcher call shape; one assertion each plus the sweep |
| B. Two-field capture model | Split every capture into a `CTA` row and a `Banner` row; the gate takes the worst | Name a reference command per OS (POSIX `sed`, PowerShell) | Run the download call with a minimal fixed `PATH` | Cleaner model, but it reshapes the report format child 1 just shipped and touches the coverage suite broadly. A fixed `PATH` can hide `curl`/`shasum` and fail the download. A PowerShell strip adds an untested Windows surface |
| C. Rule only, no commands | Precedence sentence | Byte-exact rule only | "Nothing under the excluded home may run" as a principle, without naming variables | Fewest words, but it repeats the original defect: the reader still picks the mechanism, which is how W-2 and W-4 arose |

## 11. Recommended Approach

**Option A.** Each gap is one missing sentence, and Option A adds exactly that sentence:

- **W-1:** the sentence keeps the P1 visible and keeps the honest `Unevaluated` for the one case it was written for, a would-be `pass`. Recording the banner state separately (it is already a *Capture conditions* field) gives B's clarity without changing the report shape.
- **W-2:** the byte-exact rule fixes the contract. The `sed` command is a worked example that was **executed** against `UPSTREAM.md`, not a mandate. Windows keeps "any tool that meets the rule".
- **W-4:** naming the two variables is what the launchers actually read (`scripts/impeccable` lines 90 and 147; `.cmd` lines 29 and 96). Filtering only the excluded `PATH` entries keeps `curl` and `shasum` reachable.

Order inside the spec: W-1 first (it can hide a P1), then W-4, then W-2.

## 12. Risks, Dependencies, And Open Questions

| # | Item | Handling |
|---|---|---|
| R-1 | The W-1 rationale assumes a rendered banner never moves the CTA **up** (it overlays, or pushes content down) | `/akili-specify` Premise Ledger row, owner JC. If a site's banner reflows the hero upward, `below fold` without the banner could be a false P1. That direction is safe (never a false `PASS`), but it is recorded |
| R-2 | The P-16 fixture lists 8 viewports, and `1366x768`, the default desktop short-height, is not among them | **Resolved by JC, 2026-10-31:** the fixture keeps only the 8 viewports the Lead measured. `1366x768` is not added; it is an open question for the Lead, recorded in `design.md` |
| R-3 | The CTA text changes across releases (suffix on `3a39bb8`, gone after `fix-auditoria-1031`) | The scenario matches on the prefix; identification stays `first main action`, never by text |
| R-4 | The `sed` reference relies on BSD and GNU `sed` both keeping a missing final newline | Executed on macOS BSD `sed` (`a2ba4387…`). GNU `sed` `UNVERIFIED — confirm at source before relying on it` (Linux CI leg, owner: `/akili-specify` Premise Ledger) |
| R-5 | Superseded phrasing survives in-file ("No other call changes it", "reads `Unevaluated (…)` and never reads `pass`") | KZ-changes--kaizen-loop-closure-2: grep the bridge and `references/` for the old phrasing before review; add a sweep assertion |
| R-6 | The amendment drops an obligation of the original FR text | KZ-changes--gate-falsifiability-2: walk FR-1, FR-2 and FR-5 term by term against the amended text |
| R-7 | Test budget underestimated | KZ-bugfix--init-ctrlc-abort-2: budget the assertions at ~3× the rules diff |
| R-8 | A shipped test points at this spec path, which `/akili-archive` moves | KZ-changes--archify-diagrams-1: tests cite clause IDs and bridge text only |
| R-9 | A falsifier or expected hash is written before it is run | KZ-changes--leader-brief-contract-2: the hashes above were executed. Every new one is executed before it is written |

## 13. Success Criteria

- On the combined 2.40.0 case, the bridge text walks to exactly one verdict, `below fold` / P1 / FAIL. Two literal readers no longer diverge.
- The P-16 scenario walks to `pass` with banner `visible` at all 8 confirmed viewports, matching the CTA by prefix.
- The executed reference command reproduces the `UPSTREAM.md` hash, and the rule rejects a tool that adds a newline.
- Under an exclusion, the text gives no path by which a binary under `~/.impeccable` runs, the download call included, on both launchers.
- `npm test`, `npm run verify:cli`, `npm run pack:dry-run` and `git diff --check` are green. The superseded-phrase sweep finds nothing.

## 14. Next Step

```text
/akili-specify changes/impeccable-audit-fixes/design-eval-followup
```

Lite depth fits: three sentence-level amendments, no code, no new module.
