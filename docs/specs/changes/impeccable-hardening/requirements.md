# Requirements: Ship Impeccable inside AKILI, and harden its design gates

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/impeccable-hardening` |
| Depth | **Standard**, upper end. It vendors a third-party skill (licensing, installer delivery to six targets) and edits one AKILI skill, one reference, six commands, governance, docs and tests. There is no installer code change |
| Type | Change |
| Deliverable | `software` |
| Approval Mode | `gated`. This run stops at the Phase 1 gate (Step 1.3) |
| Status | Phase 1, **revision 2: approved** by Juan Carlos Cadavid, 2026-10-30 11:02 (UTC-5), with D-1 (minor 2.40.0), D-2 and D-3 as recommended. Phase 2 in progress. Revision 1 (`676b5d9`) was returned with **Adjust** by the maintainer on 2026-10-30 at 10:48. The adjustment: Impeccable must ship inside AKILI with its instructions |
| Date | 2026-10-30 |
| Proposal | `proposal.md` revision 2 (awaiting approval). Q1–Q4 from revision 1 carry over. D-1 to D-3 are recommended in proposal §12 and reflected below |
| Source | `~/akili-audits/2026-10-30-akili-web-design.md` (G1–G12); upstream `pbakaus/impeccable` at `df3a4ab` (read-only clone in the session scratchpad) |
| Format source | `docs/specs/archive/2026-10-26-changes--akili-review/requirements.md`. There is no `docs/specs/general-setup/` (as run 2026-10-30) |
| Verified at | AKILI `b6575d8` (plus spec commits); upstream `df3a4abe7d08` |
| Release | **Minor 2.40.0** (D-1), recorded only. No release, push, PR or publish in this cycle |
| Supersedes | `changes/impeccable-design` NFR-1 ("no file from `pbakaus/impeccable` is copied into the package") and its three skill-presence states |

## 2. Executive Summary

AKILI ships Impeccable's own skill, `impeccable` (Apache-2.0, 4.8.0), unmodified and hash-locked, with its license and notices. Every install therefore carries the same design instructions.

`impeccable-bridge` becomes the AKILI layer around it. It owns:

- the phase map and the design source of truth;
- a consent gate before Impeccable's launcher may download its engine binary;
- the gates the first dogfood run showed were missing: a mobile pass, a first-visit pass with overlays visible, exit-code readings, a multi-run Lighthouse step, baseline checks, waivers, and report fields.

The detector runs through the vendored launcher, never `npx`.

## 3. Glossary

| Term | Meaning |
|---|---|
| Vendored skill | `.claude/skills/impeccable/`: upstream's `.claude` build, byte-identical except for the declared frontmatter block |
| Upstream pin | The upstream commit, skill version and engine version recorded in `UPSTREAM.md` |
| Frontmatter block | The AKILI governance keys added to the vendored `SKILL.md` frontmatter (binding, source, adapted-by). They are the only modification, and `NOTICE` declares them |
| Launcher | `<skill-dir>/scripts/impeccable` (`impeccable.cmd` on Windows). It runs the engine and, as its last resort, downloads it |
| Engine | Impeccable's native binary (`0.1.18` at the pin). It serves `context`, `detect` and the other verbs |
| Engine probe | A check of the launcher's non-download locations: `IMPECCABLE_BIN`, the sibling `bin/<os>-<arch>/`, `~/.impeccable/bin/impeccable`, the version-pinned cache `~/.impeccable/bin/<version>/`, and `impeccable` on `PATH`, each confirmed with `engine-probe` |
| Engine consent | The user's explicit yes to let the launcher download the engine (source, size and checksum check stated). It is asked at most once per session |
| Skill source | Which Impeccable skill leads: `vendored (<version>)`, `user-installed (<version>)` (a foreign same-name skill AKILI did not overwrite), or `missing` |
| Scan matrix, first-visit pass, capture conditions, primary CTA | As in revision 1: desktop and mobile passes; a fresh-context scan with consent banners and overlays kept, plus a fold screenshot and a CTA hit-test; locale, reduced motion, viewport and consent state; the main action of a Persuade/Operate screen |
| Design Waiver, Proposed waiver, Report-only mode, Unevaluated | As in revision 1 |

## 4. System Context & Scope

Today (AKILI at `b6575d8`, upstream at `df3a4ab`):

| Fact | Evidence (as run) |
|---|---|
| AKILI ships no `impeccable` skill; the bridge routes to an externally installed one | `ls .claude/skills \| grep -x impeccable` → no output; `.claude/skills/impeccable-bridge/SKILL.md` *Roles* |
| Governance forbids vendoring Impeccable | `docs/skills/governance.md` → *Environment-provided skills*, rule 1 and the *Impeccable* paragraph |
| The npm package `impeccable@4.8.0` contains no skill text | its `package.json` `"files"`: `cli/bin/`, `skill/scripts/engine-checksums.txt`, `LICENSE` |
| Upstream's `.claude` build is 58 files, 2.2 MB | `find .claude/skills/impeccable -type f \| wc -l` → `58`; `du -sh` → `2.2M` (upstream clone) |
| The launcher downloads the engine when no candidate answers; with `IMPECCABLE_LAUNCHER_PROBE` set it refuses to download | `scripts/impeccable` "Last resort" block; the `probing` branch: "Inside another launcher's probe: no download" |
| The skill's Setup runs the launcher (`context`) once per session and defines a *Launcher unavailable* path | upstream `.claude/skills/impeccable/SKILL.md` → *Setup* |
| The npm CLI answers the engine handshake | `npx --no-install impeccable engine-probe` → `impeccable-engine 0.1.18`, exit 0 |
| Detector 4.8.0 flags `--viewport`, `--no-consent-hiding`, `--no-overlay-hiding`, `--no-design-system`; exit `1` covers a partial scan | `impeccable detect --help` (4.8.0) |
| The installer skips a foreign same-name entry and takes it over only on `install --force` | `bin/akili.js`, the ownership-policy comment above `copyDirectoryContents` ("owned" / "foreign" / "takeover"). That policy exists only on a target with an ownership record (Grok Bot); the other five targets get the `impeccable` rule of FR-3 (amended 2026-10-30, Pivot P-7, Option A approved by JC 11:56 UTC-5) |
| `npm pack` keeps executable bits on shipped scripts | `tar -tvzf` of `npm pack` → `-rwxr-xr-x … security-audit/validate-findings.cjs` |
| The current gate command, three states, viewport, overlay, performance and template gaps | revision 1 evidence: `SKILL.md` *Step 0*/*Detector gate*/*Fallback*; `design-evaluation.md` *Steps*/*Report template*; `akili-audit.md` *Design Evaluation Mode*; `akili-validate.md` *UI design review*; `akili-test.md` detector suite bullet |

**In scope:** proposal revision 2, §5.
**Out of scope:** proposal §6. That excludes, in particular: an engine binary in the package; per-host skill builds; edits to Impeccable's instructions; a performance gate in `/akili-validate` (Q2); PSI/CrUX; removing `frontend-design`/`ui-ux-pro-max`; and the root `AGENTS.md` *Skill Usage* line (kaizen pending item P3 of `changes--impeccable-design`).

## 5. Stakeholders / Personas

| Persona | Need |
|---|---|
| Developer running AKILI on a UI project | Impeccable's instructions present after `akili install`, with no second installer and no surprise download |
| Agent running a design step | One known skill source, one engine state, one command form, and a fixed pass list |
| Project owner | Consent before binaries arrive; exclusions and approved patterns respected; comparable numbers |
| Paul Bakaus / Impeccable (upstream author) | License, notices and authorship kept intact; the AKILI modification declared; no implied affiliation |
| AKILI maintainer | Cheap, verifiable upstream syncs; no drift between vendored files and the pin |

## 6. Functional Requirements

### FR-1: Vendored `impeccable` skill, verbatim

The package SHALL ship `.claude/skills/impeccable/` containing upstream's `.claude/skills/impeccable/` build at the upstream pin, plus three AKILI-provided files:

| File | Content |
|---|---|
| `LICENSE` | Upstream's Apache-2.0 `LICENSE`, unaltered |
| `NOTICE` | Upstream `NOTICE.md` content unaltered (including the ehmo MIT credit), then an AKILI section stating: vendored from `https://github.com/pbakaus/impeccable` at `<commit>` (skill `<version>`, engine `<version>`); the only modification is the frontmatter block (keys listed); AKILI-SPECS is not affiliated with the Impeccable project |
| `UPSTREAM.md` | Source URL, commit, skill version, engine version, vendor date, and one `sha256  path` line per upstream file |

- The vendored `SKILL.md` frontmatter SHALL keep every upstream key and value (`name`, `description`, `version`, `user-invocable`, `argument-hint`, `license`) and add a `metadata` block: `author: Paul Bakaus`, `source`, `adapted-by`, `adapted-for: AKILI-SPECS`, `binding: conditional`.
- No other byte of an upstream file SHALL differ from the pin.
- The engine binary (`scripts/bin/**`) SHALL NOT be shipped.

#### Scenario: Verbatim check

- GIVEN the shipped package
- WHEN each file listed in `UPSTREAM.md` is hashed (for `SKILL.md`, after removing the frontmatter block)
- THEN every hash matches its `UPSTREAM.md` line
- BUT it must NOT contain a file under `.claude/skills/impeccable/` that is neither listed in `UPSTREAM.md` nor one of the three AKILI files
- AND IT MUST contain `LICENSE` whose text begins with "Apache License" and "Version 2.0"

### FR-2: Upstream sync and pin hygiene

The repository SHALL contain `scripts/sync-impeccable.js`. It is maintainer-only and not in `package.json` `files`.

- Given a local upstream checkout and a commit, the script copies its `.claude/skills/impeccable/` build, applies the frontmatter block, writes `LICENSE`/`NOTICE`, and rewrites `UPSTREAM.md`.
- It SHALL refuse to run when the checkout is dirty or the commit is not checked out.
- It SHALL NOT download anything; the maintainer provides the checkout.
- `docs/release-checklist.md` SHALL gain one step: compare the pin with upstream's latest release tag and record either "current" or the decision to sync or defer.

#### Scenario: Local edit creeps in

- GIVEN a contributor edits a vendored reference file by hand
- WHEN `npm test` runs
- THEN the vendor test fails, naming the file whose hash differs from `UPSTREAM.md`

### FR-3: Delivery to every install target

`akili install` SHALL deliver `impeccable/` to all six targets (Claude Code, OpenCode, Antigravity, Codex, Cursor, Grok Bot) wherever the target receives skills, with the launcher executable (`sh`) after install.

- An existing `impeccable` skill AKILI did not install is a **foreign** entry: it is skipped and reported (its version when readable), and replaced only by an explicit `install --force` takeover, under the installer's existing ownership rule.
- On a target with no ownership record (Claude Code, OpenCode, Antigravity, Codex, Cursor), an existing `impeccable/` is AKILI's only when it holds AKILI's `UPSTREAM.md`; otherwise it is foreign. A foreign folder is skipped whole and reported as foreign with its version when readable. `install --force` replaces it whole (moved aside, then copied), never merged (amended 2026-10-30, Pivot P-7, Option A approved by JC 11:56 UTC-5).
- `akili doctor` SHALL count `impeccable` like any other packaged skill.

#### Scenario: Developer already has Impeccable

- GIVEN `~/.claude/skills/impeccable/` installed by the developer (version 4.9.0)
- WHEN `akili install --tool claude` runs without `--force`
- THEN the developer's folder is untouched and the install output names it as foreign
- AND the skill source reads `user-installed (4.9.0)` at the next design step

### FR-4: Skill source and engine states

At every design step the bridge SHALL record two things.

**Skill source.** `vendored (<version>)` | `user-installed (<version>)` | `missing`. Impeccable leads whenever the source is not `missing`. When it is `missing`, the fallback (`ui-ux-pro-max` catalog + `frontend-design` + `stitch-design`) leads, and the gap is recorded.

**Engine state:**

| Engine state | When | Consequence |
|---|---|---|
| `ready (<location>)` | The engine probe answers at one of its locations | Detector gate active |
| `consent needed` | The probe found nothing, and the platform is supported | Ask once per session (FR-5) |
| `installed (consented)` | The user said yes and the launcher's download succeeded | Detector gate active |
| `declined` | The user said no, or did not answer | The skill takes its own *Launcher unavailable* path; detector rows `Unevaluated (engine not installed)` |
| `unavailable (<reason>)` | Unsupported platform, no network, a checksum refusal, or a failed download | The same as `declined`, with the reason |

- Every command that branches on these (`/akili-constitution`, `/akili-specify`, `/akili-execute` UI tasks, `/akili-test`, `/akili-validate`, `/akili-audit design`) SHALL state what each value does there, with no three-state wording left over.
- The state is probed per phase and SHALL NOT be persisted across runs.

#### Scenario: Cached npm CLI only (the 2026-10-30 machine)

- GIVEN no `impeccable` on `PATH`, no `~/.impeccable/bin/` engine, and `IMPECCABLE_BIN` unset
- WHEN a design step starts
- THEN the skill source is `vendored (4.8.0)` and Impeccable leads
- AND the engine state is `consent needed`
- BUT it must NOT record `absent` or route to the fallback skills

### FR-5: Engine consent gate

No AKILI step SHALL invoke the launcher (any verb, including Impeccable's Setup `context`) before the engine state is `ready` or `installed (consented)`.

- The consent question SHALL name: the source (`https://github.com/pbakaus/impeccable/releases`, tag `engine-v<version>`), the approximate size, the sha256 check against `engine-checksums.txt`, the destination (`~/.impeccable/bin/<version>/` or `IMPECCABLE_HOME`), and the no-download alternatives (`IMPECCABLE_BIN` pointing at an existing engine, e.g. the npm CLI).
- Under `Approval Mode: pre-approved`, consent is **not** implied. Downloading a binary is an outward-facing action, so it always stops for the user.
- The bridge SHALL tell the agent that until the engine is ready, Impeccable's Setup follows its own *Launcher unavailable* path.

#### Scenario: Consent declined

- GIVEN engine state `consent needed`
- WHEN the user declines
- THEN no network request is made by the launcher
- AND the skill reads `PRODUCT.md`/`DESIGN.md` directly, per its *Launcher unavailable* path
- AND detector rows read `Unevaluated (engine not installed)`

### FR-6: Detector invocation

The detector SHALL run as `DO_NOT_TRACK=1 <skill-dir>/scripts/impeccable detect --json [flags] <targets>` (`impeccable.cmd` on Windows), only after FR-5 passes.

- The package MUST NOT prescribe `npx impeccable …` or `npx lighthouse …` without `--no-install`.
- The printed upstream routes (`npx impeccable install` / `update`) remain only as optional advice for a newer upstream than the pin, and are never run without consent.

### FR-7: Exit codes

| Exit | Reading |
|---|---|
| `0` | pass |
| `2` | fail, unless every primary finding is fixed or waived (FR-12). If all are waived, it passes, and the report lists each waiver |
| `1` | `Unevaluated`, whatever the cause: an unreachable target, a partial multi-target scan, or an unknown flag on another engine version |
| `127` | `Unevaluated (engine not available)`: the launcher found and fetched no engine |
| any other | `Unevaluated` |

The first stderr line SHALL be recorded for every non-zero exit other than `2`. Findings returned with exit `1` SHALL be listed, but the pass stays `Unevaluated`.

### FR-8: Desktop and mobile passes

Every detector URL scan, in `/akili-audit design` and the `/akili-validate` design gate, SHALL run a `desktop` pass (default `1280x800`) and a `mobile` pass (`--viewport <mobile>`). `/akili-test`'s detector suite SHALL plan both.

- `<mobile>` = the mobile viewport declared in `docs/ux-ui/design.md` when present, else `390x844` (Q3); the report records the value and its source.
- Source scans stay a single pass.

### FR-9: First-visit pass (Persuade and Operate screens)

`/akili-audit design` and the `/akili-validate` design gate (Q1) SHALL run, at both FR-8 viewports, for every Persuade/Operate screen:

1. a detector scan with `--no-consent-hiding --no-overlay-hiding`;
2. a fresh browser context with no stored consent;
3. a fold screenshot and a hit-test at the primary CTA's center. The pass fails when the topmost element is neither the CTA nor its descendant.

- Capture conditions SHALL be recorded per pass.
- **Without browser automation (D-2):** the screenshot and hit-test read `Unevaluated (no browser automation)` and the detector part still runs. In `/akili-validate`, the HITL pause then asks for a manual fold check, and its result is recorded. Without one, the design gate is `WARN (unverified first visit)` and never `PASS`.
- A rejected flag reads `Unevaluated (engine <version> lacks <flag>)`.

#### Scenario: CTA covered on first visit (the 2026-10-30 P1)

- GIVEN a Persuade home page whose hero CTA sits under a consent banner on first visit at 390×844
- WHEN the first-visit pass runs
- THEN the hit-test returns the banner, which is a P1 (design mode) or a FAIL (validate)
- BUT the consent-hiding default passes MUST NOT be presented as covering the first visit

#### Scenario: Read screen

- GIVEN a Read-mode screen
- WHEN design mode runs
- THEN no first-visit pass is required, and the report says so for that screen

### FR-10: Performance step (design mode only)

`/akili-audit design` SHALL, per URL:

- **Resolution.** Resolve Lighthouse without installing: the project's `node_modules/.bin`, then `PATH`, then `npx --no-install lighthouse`. Otherwise the step reads `Unevaluated (Lighthouse unavailable)`.
- **Runs.** At least **3** mobile runs, reporting the median and range of the score and LCP.
- **Spread.** When the range is wider than the effect a recommended fix targets, state that the number cannot serve as a baseline or gate.
- **Concurrency.** Never run while a delegated agent is active.
- `/akili-validate` SHALL NOT gain a performance gate (Q2).

#### Scenario: Bimodal score

- GIVEN runs scoring 92, 89 and 64
- THEN the report shows median 89 and range 64–92
- BUT it must NOT report one run as the page score

### FR-11: Baseline checks (E1)

When `docs/ux-ui/design.md` exists, design mode SHALL, before screen review:

1. **Staleness.** Compare its last commit date with the newest commit touching the UI source directories. When the UI is newer, add a `Baseline possibly stale` header line listing both dates and up to 5 newer commits. Without git history, the check reads `Unevaluated (no git history)`.
2. **Page modes.** Flag a missing page-mode column, or a screen in scope with no mode, as baseline drift, and list the inferred modes under *Assumptions*.
3. **Derived context.** Note when root `PRODUCT.md`/`DESIGN.md` are absent, because the detector then lacks design-system context, and design-system rules may flag approved patterns.

#### Scenario: Redesign after the baseline

- GIVEN `design.md` last committed 2026-10-17 and a hero redesign on 2026-10-28
- THEN the header reads `Baseline possibly stale (design.md 2026-10-17; UI 2026-10-28)` and lists the redesign commit

### FR-12: Design Waivers

- **Row shape.** `docs/ux-ui/design.md` → *Design Waivers* rows SHALL carry rule id, scope (selector, file or value), reason, approver and date. `/akili-constitution` SHALL write new rows in that shape.
- **Matching.** Every mode SHALL match findings against the rows. A match reads `waived (design.md)`. A row matching nothing reads `unused`. Upstream ignores with a reason stay valid.
- **Proposed waivers.** In report-only mode, a finding that matches an authority-approved pattern with no row reads `Proposed waiver (<clause>)` and is never written.
- **Counting (D-3).** Proposed waivers SHALL NOT count toward P1–P3. The report header SHALL show `Proposed waivers: N`.

#### Scenario: Approved rounded top border

- GIVEN `design.md` A-06 approves rounded top borders on colored cards, with no waiver row
- THEN `border-accent-on-rounded` findings read `Proposed waiver (A-06)` and the header counts them
- BUT they must NOT appear among P1–P3
- AND IT MUST NOT write the waiver row

### FR-13: Report template fields

The design-evaluation template SHALL add the following fields, and the design-mode checklist SHALL accept a recorded user-directed location:

| Field | Content |
|---|---|
| Impeccable | Skill source + engine state (FR-4) |
| Detector | The launcher invocation, the engine version and location, and the scan-matrix table (pass × URL → exit, count) |
| Score source | `Impeccable critique` or `fallback checklist`; the two are never trended together |
| Out of scope | Owner exclusions, with their detector hits counted by rule id |
| Capture conditions | Per FR-9 |
| Performance | The FR-10 table or `Unevaluated (<reason>)` |
| Baseline | The FR-11 result |
| Proposed waivers | Count (FR-12) |
| Report location | Default path, or a user-directed path and who directed it |
| `Waived?` column | `no`, `waived (design.md)`, `waived (upstream ignore)`, `Proposed waiver (<clause>)`, `out of scope` |

### FR-14: Bridge re-scope, governance and attribution

- **Bridge.** `impeccable-bridge` SHALL keep its name and `conditional` binding, and SHALL own FR-4 to FR-9 and FR-12. Its *Roles* table SHALL name the vendored `impeccable` as the lead. Its install-route section SHALL describe the vendored skill and the optional upstream route.
- **Reference.** `design-evaluation.md` SHALL own FR-10, FR-11 and FR-13.
- **Commands and docs.** These SHALL point at the bridge and SHALL NOT restate its command strings.
- **Governance.** `docs/skills/governance.md` SHALL add the category *Vendored third-party (verbatim)*, with rules: an unmodified upstream build, declared frontmatter-only modification, `LICENSE` + `NOTICE` + `UPSTREAM.md`, a hash-locked test, and a sync via the script. Impeccable SHALL be moved there from *Environment-provided skills*, and the record SHALL state that `changes/impeccable-design` NFR-1 is superseded.
- **Attribution.** `docs/skills/README.md` and a new `docs/skills/impeccable.md` SHALL name Paul Bakaus as author, Apache-2.0, the pin, and that AKILI is not affiliated. `README.md` SHALL list the third-party component.
- **Disclosure.** The docs SHALL state that invoking `/impeccable` directly, outside an AKILI command, follows upstream behavior, including the launcher's first-run engine download (proposal R1).

#### Scenario: No surviving old phrasing

- WHEN `.claude/` and `docs/` (excluding `docs/specs/`) are searched for `npx impeccable detect`, `Unevaluated (Impeccable absent)`, the state triple `installed`/`skill only`/`absent` in a state table, and "never copies Impeccable files"
- THEN there are zero hits

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | Nothing downloads or installs the engine, Lighthouse or a browser without explicit user consent, in every approval mode |
| NFR-2 | Apache-2.0 §4 compliance: the license is included, notices are kept, the modification is declared, and no AKILI or upstream trademark use implies affiliation |
| NFR-3 | Version tolerance: another engine version's missing flag or capability yields `Unevaluated` with the reason, never a silent pass |
| NFR-4 | Size: package growth stays at or below +2.5 MB unpacked (pin baseline: +2.2 MB); the vendor test pins the file count |
| NFR-5 | Command prose never points at a rule by line number (KZ-005) |
| NFR-6 | `npm test`, `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` pass; `node bin/akili.js install --tool all --dry-run` lists `impeccable`; no test depends on `docs/specs/changes/<this spec>` |
| NFR-7 | English docs; aggregate claims are falsified by grep before they are written (KZ-002) |
| NFR-8 | Cost: the 8-screen cap stands; first-visit passes cover Persuade/Operate only; Lighthouse runs on mobile by default |

## 8. Defect Classes and Gates

| Defect class | Gate |
|---|---|
| A vendored file drifts from upstream (a hand edit, or a partial sync) | The FR-1 hash test (automated) |
| Missing license, notice or attribution | Vendor test assertions on `LICENSE`, `NOTICE`, `UPSTREAM.md`, frontmatter keys, and the docs rows |
| The skill is not delivered, or the launcher is not executable on a target | An install test into a temp dir for each of the six targets, checking presence and file mode (POSIX) |
| An AKILI step can reach the launcher before consent | A text-contract test that each consuming command routes through the bridge gate, plus a Reviewer walk of every launcher mention. **Limit:** upstream text invoked directly outside AKILI is not gated (R1, disclosed) |
| Old phrasing survives | The negative text-contract test (FR-14 scenario) plus a paraphrase sweep before Review |
| A consumer leaves an engine or skill-source value to a fall-through | A per-command text-contract test plus a Reviewer walk of each branching step |
| A rule is not executable on a real project | **No automated gate here.** Substitute: a validate-time re-walk of the 2026-10-30 run, plus one held-out case the text does not cite (a `user-installed` skill on a project with no `design.md`), judged at the HITL pause |
| Base-directory path resolution on non-Claude hosts | **Partial:** the install-layout test proves file placement only. Live agent behavior on OpenCode/Codex/Cursor/Antigravity/Grok is an **accepted risk** (R3), recorded for the first real run on each host |
| Live engine behavior (the download, the update check honoring `DO_NOT_TRACK`) | **Accepted risk** (R7): not exercised by tests, because tests never touch the network |

## 9. Requirement ID Index

| ID | Title | Covers |
|---|---|---|
| FR-1 | Vendored skill, verbatim | Maintainer intent (10:48), D1–D3 |
| FR-2 | Sync and pin hygiene | R5 |
| FR-3 | Delivery to six targets | D4, R4, R6 |
| FR-4 | Skill source + engine states | G1, G3, gap 10 |
| FR-5 | Engine consent gate | G2, gap 8, R1 |
| FR-6 | Detector invocation | G2, gap 10 |
| FR-7 | Exit codes | gap 2 |
| FR-8 | Desktop + mobile | G4, Q3 |
| FR-9 | First-visit pass | G5, Q1, D-2 |
| FR-10 | Performance step | G7, Q2 |
| FR-11 | Baseline checks | G6, G8, G12 |
| FR-12 | Design Waivers | G9, gap 9, D-3 |
| FR-13 | Template fields | G10, G11 |
| FR-14 | Bridge, governance, attribution | all |
| NFR-1..8 | — | — |
