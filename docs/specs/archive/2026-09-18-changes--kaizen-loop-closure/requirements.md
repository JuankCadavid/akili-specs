# Requirements: Kaizen Loop Closure

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/kaizen-loop-closure` |
| Depth | **Standard** |
| Type | Change |
| Approval Mode | `pre-approved (user, 2026-09-17)` — inherited from `proposal.md` |
| Status | Draft — Phase 1 |
| Date | 2026-09-17 |
| Source | `proposal.md` (approved intent 2026-09-17 by invoking `/akili-specify`; Release Classification: **minor** proposed, user may override). **Amended after the Step 2.3 reversion challenge:** the proposal's "apply-capable = default ∪ integration" is superseded by the exclusive rule in §3 — see proposal §15 |
| Format precedent | `docs/specs/archive/2026-08-22-changes--branch-safe-kaizen/requirements.md` — this repo has no `docs/specs/general-setup/` (it packages the methodology rather than consuming it) |
| Predecessor | `changes/branch-safe-kaizen` (archived 2026-08-22) — extended, not reversed; see §4 |

## 2. Executive Summary

The kaizen loop's Standardize step must **land** in the workflow real teams use. Today Apply Mode is reachable only on the pinned default branch; a team that integrates on a long-lived branch and merges to `master` on release cadence never reaches it. Measured on one consuming project: 105 retrospectives, 193 pending items, zero applied, no digest, same-week recurrences. This spec adds an optional **`Integration Branch:` pin** that makes that branch apply-capable, a **re-verify** step so the backlog cannot write stale facts, and an **upstream sink** so Methodology lessons close instead of accumulating. Every project without the new pin behaves byte-for-byte as v2.24.0.

## 3. Glossary

| Term | Meaning |
|---|---|
| **Default branch** | Unchanged from the predecessor: the `Default Branch:` pin in the constitution summary, with the kaizen skill's fallback resolution for unpinned projects |
| **Integration branch** | A long-lived branch a team integrates spec branches into and merges to the default branch on cadence. Declared only by the `Integration Branch: <name>` pin; there is **no git-based fallback** — no pin means no integration branch |
| **Apply-capable branch** | **Exactly one branch per project:** the pinned integration branch when the pin exists, otherwise the default branch. Never both — two writer branches that later merge textually is the conflict class the predecessor eliminated (Step 2.3 reversion challenge, 2026-09-17). The only context where shared files may be written and the digest refreshed |
| **Spec branch** | Any branch that is neither. Unchanged semantics: writes only files unique to that branch |
| **Branch Context** | The kaizen skill's Hard Rule resolving the checked-out branch into one of three values: `default`, `integration`, `spec` (today: two) |
| **Re-verify probe** | One check per pending item, run before the item is written: the `Target` exists at HEAD, and the specific fact the `Edit` asserts still holds (a grep, an existence check). Never a re-read of the source spec |
| **`superseded (reason)`** | New `Status`: the re-verify probe refuted the item's premise; the item is closed without being written and the reason is recorded |
| **`upstreamed (date, report)`** | New `Status`: a Methodology lesson's upstream recommendation was collected into an upstream report; the item is closed on the project side |
| **`Kind: upstream`** | New pending-item kind: a Methodology or dual lesson's proposed edit to the AKILI methodology repository, recorded by Standardize on any branch |
| **Upstream report** | A file `docs/specs/kaizen/upstream-<YYYY-MM-DD>[-N].md` written by Apply Mode on an apply-capable branch, listing every `upstream` item collected in that pass — the hand-off artifact to the methodology maintainer |
| **Digest** | Unchanged: the `## Active Lessons` table in `docs/specs/kaizen-log.md`, one writer per project, now on the apply-capable branch |

## 4. System Context & Scope

**Relationship to the predecessor.** `changes/branch-safe-kaizen` introduced branch-conditional writes with two contexts and one pin. Its design decision DD-1 (*pin first, procedure second*) is extended with a second pin of the same shape; DD-7 (*legacy fallbacks are permanent*) is honored — nothing this spec adds has a migration step. Its stated risk *"pending standardizations pile up if nobody runs the apply step on main"* is the failure this spec removes; its mitigation (the `/akili-resume` footer) could not fire because the entry files never reach `main`.

**In scope:**

| Surface | Files |
|---|---|
| Kaizen skill | `.claude/skills/kaizen/SKILL.md` — Branch Context (third value), Apply Mode (reachability, re-verify step, `superseded`, upstream report, `upstreamed`), Standardize (Methodology lessons → `Kind: upstream`), `Kind`/`Status` tables, writable-set table, Standing rules |
| Commands | `.claude/commands/akili-archive.md` (Step 3 branch gate, Step 4.3 Methodology handling, Step 4.4 backlog offer and spec-branch note, Step 6 report states), `akili-resume.md` (backlog footer wording and count), `akili-constitution.md` (Step 8 `Integration Branch:` pin) |
| Personas | `.claude/templates/leader.md`, `implementer.md` — the write-discipline guardrail's "applied on the default branch" phrase (one line each) |
| Docs mirrors | `docs/commands/akili-archive.md`, `akili-resume.md`, `akili-constitution.md`, `docs/skills/kaizen.md`, `docs/skills/README.md`, `docs/commands/README.md` if wording turns false |
| Root docs | `AGENTS.md` and `CLAUDE.md` Kaizen Loop rule, `README.md`, `docs/README.md`, `docs/flow.md` — only sentences asserting *where the apply phase runs* |
| Release | `CHANGELOG.md` under Unreleased |

**Closure set for the coherence sweep (measured 2026-09-17):** 61 case-insensitive hits of `default branch` across 17 files (`.claude/commands` ×4, `kaizen/SKILL.md` 17, templates ×2, `docs/commands` ×4, `docs/skills` ×2, `docs/flow.md` 5, `README.md` 3, `docs/README.md` 1, `AGENTS.md` 1). Not every hit changes: hits describing the `Default Branch:` pin or the default-branch fallback resolution stay; hits asserting that apply, shared-file writes, or the digest refresh happen *only on the default branch* change to apply-capable wording. FR-8 owns the split.

**Out of scope (non-goals):**

- The Retrospective phase's bounds and the entry-file schema beyond the two new `Status` values and the new `Kind`.
- Retroactive normalization of any consuming project's existing entry files (five template generations coexist in the evidence project; Apply Mode must *tolerate* them — FR-7 — not fix them).
- Metrics comparability (skip waivers, harness-failure row, third-occurrence rule) — next spec.
- Gate, brief, HITL, and test-falsifiability rules from the same corpus — later specs; this one is their prerequisite.
- Multi-name `Integration Branch:` pins — one name only (proposal open question, resolved: one).
- Intake automation on this repository's side — the upstream report is read by a human.
- `/akili-audit`: the proposal's risk table assumed an existing constitution-pin drift check that `/akili-audit` would extend by one line. **Discovery:** no such check exists (`/akili-audit` checks model-registry drift only). Adding pin-drift auditing is a new capability and is deferred; the `[-<safe-branch>]` report-suffix rule stays as is (an extra suffix on an integration branch never conflicts).
- Installer, hooks, CI.

**Grep hazard (binding on every verification below):** `.claude/worktrees/` is a stale gitignored clone matching every grep; all sweeps exclude it and `docs/specs/archive/`, and exclude this spec's own folder, which quotes the superseded phrases verbatim.

## 5. Stakeholders / Personas

| Stakeholder | Interest |
|---|---|
| Team integrating on a long-lived branch | Standardizations reach guides and personas within the same cycle they were learned, without waiting for a release merge |
| Trunk-based team or solo developer on `main` | Zero change — no pin, no new behavior |
| The archiving / applying agent | One unambiguous rule for where apply runs; a bounded re-verify step; a defined place for Methodology lessons |
| Methodology maintainer (this repo) | Receives Methodology lessons as one report per apply pass instead of scattered `pending (upstream)` notes across a hundred files |
| Digest consumers (4 commands) | Unchanged read contract at unchanged cost |

## 6. Functional Requirements

### FR-1: `Integration Branch:` pin in the constitution

`/akili-constitution` SHALL offer to write an optional literal `Integration Branch: <name>` line into the constitution summary, immediately after `Default Branch: <name>`. The pin SHALL name exactly one branch, SHALL differ from the default branch, and SHALL be **confirmed with the user before writing** together with a one-line statement of what it asserts: *this branch is the team's single integration point; apply passes run here serially, and its merges to the default branch carry applied standardizations forward.* The command SHALL state when to set it (spec branches merge here; this branch reaches the default branch on release cadence) and when not to (trunk-based flow — leave it absent). Safe Update mode adds the pin only when missing and never rewrites an existing one; **when it adds the pin it SHALL also rewrite the adjacent write-discipline sentence** in the same summary block from "applied on the default branch" to apply-capable wording — that sentence is methodology text the constitution wrote, not user content — and SHALL say in one line that the project's deployed `.agents/*` personas still carry the old phrase until re-scaffolded, so the next `/akili-audit` will report it as persona drift (the predecessor's known W-1 interaction).

#### Scenario: Team on a release-cadence integration branch

- GIVEN `/akili-constitution` runs in a project whose spec branches merge into `develop` and `develop` merges to `main` per release
- WHEN Step 8 writes the constitution summary
- THEN the user is offered `Integration Branch: develop`, shown what the pin asserts, and the line is written only on confirmation
- AND IT MUST sit next to `Default Branch: main` so both pins are read from the same block every command already loads
- AND IT MUST elicit the branch **name** from the user as a distinct step — a yes/no answer to "do you integrate on one branch first?" is not a name, and the pin cannot be written without one *(added by the T6 Pivot, 2026-09-17)*
- BUT it must NOT be written unprompted, inferred from git, or set equal to the default branch

#### Scenario: Trunk-based project

- GIVEN spec branches merge directly to `main`
- WHEN Step 8 runs
- THEN the command says in one line that no integration branch pin is needed and writes none

### FR-2: Branch Context resolves three contexts

The kaizen skill's Branch Context SHALL resolve the checked-out branch into one of `default`, `integration`, or `spec`. Resolution of `default` is unchanged (pin, then the existing git fallback chain). Resolution of `integration` SHALL use **only** the `Integration Branch:` pin — when the pin is absent, `integration` cannot occur. The predicate **apply-capable** SHALL be defined once, in Branch Context, as: *`integration` when the `Integration Branch:` pin exists; `default` when it does not; never both.* Every other surface SHALL refer to the predicate by that name (KZ-005: by name, never by line). When the integration pin exists, a checkout of the default branch SHALL resolve to `default` **and be non-writing**: every gate that today writes there records pending items instead and names the integration branch as the place to apply. Unresolved or failed resolution SHALL still yield `spec` (defer is always safe).

#### Scenario: Checked-out branch equals the integration pin

- GIVEN `Default Branch: master` and `Integration Branch: qa-development-2026` are pinned and HEAD is `qa-development-2026`
- WHEN Branch Context resolves
- THEN the context is `integration`, which is apply-capable
- AND IT MUST be reported by the pinned name in every message that today says "the default branch"

#### Scenario: No integration pin

- GIVEN only `Default Branch:` is pinned and HEAD is `develop`
- WHEN Branch Context resolves
- THEN the context is `spec` — exactly today's result
- BUT it must NOT attempt to infer an integration branch from branch names, remotes, or merge history

#### Scenario: Hotfix archived on the default branch while an integration pin exists

- GIVEN `Default Branch: master` and `Integration Branch: develop` are pinned, and a hotfix spec is archived with `master` checked out
- WHEN `/akili-archive` resolves Branch Context
- THEN the context is `default`, which is **not** apply-capable: Step 3 items 2–4 record `guide-sync` / `factual-sweep` / `trd-adr` pending items, Standardize records pending items, the Step 4.4 offer does not fire, and the one-line note names `develop`
- AND IT MUST NOT allocate an `ADR-MMM`, create or edit the digest, or write any shared file on `master`
- AND IT MUST state the non-writing rule at each of Step 3 items 2–4's **own** record-instead-of-write sub-clauses (not only in the gate paragraph above them), so a reader who lands on the item's clause alone has an instruction for the default-while-pinned case *(added by the T6 Pivot, 2026-09-17)*
- BUT the hotfix's own spec folder, entry file, and `family.md` row flip stay writable exactly as on a spec branch

#### Scenario: Both pins name the same branch

- GIVEN a hand-edited summary where both pins read `main`
- WHEN Branch Context resolves
- THEN the context is `default`, it is apply-capable, and the skill says in one line that the integration pin is redundant and ignored

### FR-3: Apply Mode and the archive gates run on the apply-capable branch

Apply Mode SHALL run on the apply-capable branch, and anywhere else SHALL decline in one line naming that branch by its pinned name. `/akili-archive` Step 3's branch gate (guide sync, factual sweep, TRD/ADR sync) and Step 4.4's backlog offer SHALL fire only on the apply-capable branch, and the Step 4.4 note elsewhere SHALL name the pinned branch rather than the phrase "the default branch". `/akili-resume`'s backlog footer SHALL recommend the Apply Mode invocation "on `<pinned name>`" and SHALL count only `pending` and `deferred` items — never `superseded` or `upstreamed`. The digest bootstrap (create `docs/specs/kaizen-log.md` with the digest section when absent) SHALL happen on the first apply pass on the apply-capable branch. Apply Mode's digest refresh SHALL first **normalize the digest it finds** — dedupe rows by `ID`, then re-enforce the 10-row cap through the existing retirement rule — so a digest inherited from a hand edit or a pre-pin merge self-heals on the next pass instead of growing.

#### Scenario: First apply pass on the integration branch

- GIVEN the evidence project's pins and a backlog of pending items in `docs/specs/kaizen/*.md` on `qa-development-2026`
- WHEN the user says "apply pending kaizen standardizations" there
- THEN Apply Mode collects, groups, presents the HITL menu, applies approved edits, creates `docs/specs/kaizen-log.md` with the digest, and stamps statuses
- AND IT MUST behave identically to today's default-branch apply pass in every step it does not add
- BUT it must NOT run on any other branch — `master` included while the integration pin exists — approval or not

#### Scenario: Merge to the default branch after applying on the integration branch

- GIVEN standardizations were applied on `qa-development-2026` and later merged to `master`
- WHEN a user says "apply pending kaizen standardizations" on `master`
- THEN Apply Mode declines in one line naming `qa-development-2026`; the merged entry files already carry `applied` statuses and the merged guides already carry the edits, so nothing is duplicated and nothing diverges
- AND IT MUST leave `master` a pure merge target for kaizen artifacts for as long as the integration pin exists

#### Scenario: `/akili-resume` on the integration branch

- GIVEN 3 `pending`, 1 `superseded`, 2 `upstreamed` items across entry files
- WHEN `/akili-resume` renders its dashboard on `qa-development-2026`
- THEN the footer reads "3 pending standardizations" and recommends the invocation on `qa-development-2026` by name
- BUT `/akili-resume` must NOT write any file — its read-only contract is untouched

### FR-4: Re-verify before write

Apply Mode SHALL run one **re-verify probe** per approved item before writing it: the `Target` path exists at HEAD, and the specific fact the `Edit` asserts is confirmed by one check (a grep for the symbol, file, or phrase the edit describes, or an existence check). An item whose probe fails SHALL end the pass as `superseded (reason)` — never written, never left `pending`. The probe SHALL be bounded to that single check; it SHALL NOT re-read the source spec, the archive, or the codebase beyond the named fact. An item the collector cannot parse (unknown `Status` encoding, missing `Target`, non-table pending block) SHALL be reported by file and item, left `pending` with a one-line note appended to the item, and never partially applied (KZ-004: the unparseable case is a named terminal branch of the collect step, not a fall-through). For a `digest-update` item, whose `Target` is a `KZ-id` and not a path, "the `Target` exists at HEAD" SHALL mean: a row with that ID in the `## Active Lessons` digest, or a lesson heading with that ID in any entry file under `docs/specs/kaizen/`; the fact probe is the item's recurrence claim (the source spec it adds names a real entry file) *(added by the T6 Pivot, 2026-09-17)*.

#### Scenario: A guide-sync item describes a deleted component

- GIVEN a `guide-sync` item says "add a row for the `<app-sidebar-toggle>` button to `shell-topbar/CLAUDE.md`" and a later spec deleted that button
- WHEN Apply Mode reaches the item
- THEN the probe (`grep` for the selector under the component's folder) finds nothing, the item becomes `superseded (component removed by <spec>)`, and no line is written
- AND IT MUST record the reason in the item so the next reader sees why it closed
- BUT it must NOT write the row and rely on a later factual sweep to remove it

#### Scenario: Legacy entry the collector cannot parse

- GIVEN an entry file whose pending items are a YAML block, or whose `Status` reads `pending (methodology — not applicable)`
- WHEN Apply Mode collects
- THEN the item is listed in the pass report as unparseable with its file and position, stays `pending`, and gains a one-line note
- BUT it must NOT be skipped silently, guessed at, or half-applied

#### Scenario: `digest-update` item, no digest yet *(added by the T6 Pivot, 2026-09-17)*

- GIVEN a `digest-update` item targeting `KZ-changes--feature-a-1`, no `docs/specs/kaizen-log.md` in the project, and an entry file `changes--feature-a.md` carrying a lesson with that ID
- WHEN Apply Mode re-verifies it
- THEN the Target probe succeeds on the entry file's lesson heading, the fact probe checks the added source spec's entry file exists, and the item proceeds to the digest refresh
- BUT it must NOT be closed as `superseded` merely because no digest file exists — the digest is created in the same pass

#### Scenario: Probe is out of budget

- GIVEN an item whose `Edit` asserts a fact no single grep or existence check can confirm ("the payload is the same as the sibling's")
- WHEN Apply Mode reaches it
- THEN it presents the item to the user as **unverifiable** with the reason, and the user decides apply / defer / reject
- AND IT MUST NOT expand the probe into an investigation to settle the question itself

### FR-5: Methodology lessons close through an upstream report

Standardize SHALL record a Methodology lesson's proposed upstream edit — and the upstream half of a dual lesson — as a pending item with `Kind: upstream`, `Target: methodology`, and the proposed edit text, on any branch. Apply Mode SHALL collect every `pending`/`deferred` `upstream` item into one **upstream report** at `docs/specs/kaizen/upstream-<YYYY-MM-DD>[-N].md` (numeric suffix on same-day collision), listing per item: lesson ID, source entry file, severity, root cause in one line, proposed upstream edit. The report SHALL be written only on the apply-capable branch. Each collected item SHALL flip to `upstreamed (<date>, <report path>)`. `upstream` items SHALL NOT add digest rows — they are not lessons the project's agents can act on locally; recurrence of a Methodology lesson is still visible through entry files. A scaffolded README is never an upstream report.

#### Scenario: Apply pass with Methodology lessons in the backlog

- GIVEN 25 `upstream` items across 20 entry files on the integration branch
- WHEN Apply Mode runs
- THEN one report file is written listing all 25, each item flips to `upstreamed`, and the pass summary names the report path as the hand-off to the methodology repository
- AND IT MUST leave the local (project) half of a dual lesson on its own `standardization` item, applied or deferred independently
- BUT it must NOT write any `upstream` item into a guide, persona, template, or the digest

#### Scenario: Methodology lesson recorded on a spec branch

- GIVEN a retrospective on `feat/x` classifies a lesson `Methodology`
- WHEN Standardize records it
- THEN the entry file carries an `upstream` pending item with the proposed edit, and the report says in one line that it awaits an apply pass on the pinned apply-capable branch
- BUT it must NOT write a report file from the spec branch

### FR-6: `Kind` and `Status` vocabularies extended once

The kaizen skill's `Kind` table SHALL gain `upstream` and its `Status` table SHALL gain `superseded (reason)` and `upstreamed (date, report)`, each with the origin and meaning stated in §3. Every site that enumerates statuses (`/akili-archive` Step 6 report item, `/akili-resume` footer count, the Apply Mode collect and stamp steps) SHALL state which of the five statuses it counts, applies, or reports (KZ-004).

#### Scenario: Archive report after an apply pass

- GIVEN an apply pass applied 4, superseded 1, upstreamed 3, and deferred 2 items
- WHEN `/akili-archive` Step 6 reports the Kaizen summary
- THEN it states all four counts by name and the report path for the upstreamed items
- BUT it must NOT fold `superseded` or `upstreamed` into "applied" or leave them uncounted

### FR-7: Backward compatibility and tolerance

A project with only `Default Branch:` pinned SHALL observe byte-identical behavior to v2.24.0 in every command this spec touches, except for wording that names the branch. A project with neither pin SHALL keep the existing fallback resolution and defer-on-failure default. Apply Mode SHALL tolerate every entry-file generation it meets (FR-4's unparseable branch); it SHALL NOT normalize, rewrite, or migrate entry files beyond stamping the items it processed. Legacy `## Entries` remain frozen (predecessor DD-7).

#### Scenario: Legacy project, no new pin

- GIVEN a project constitution written by v2.23.x with only `Default Branch: main`
- WHEN any of `/akili-archive`, `/akili-resume`, or Apply Mode runs on `main` or on a spec branch
- THEN every gate, offer, count, and write happens exactly where and as it does today
- AND IT MUST require no change to the project's constitution to keep working

### FR-8: Documentation coherence sweep

Every sentence in the §4 closure set that asserts the apply phase, shared-file writes, or the digest refresh happen "only on the default branch" SHALL be rewritten in apply-capable terms; sentences describing the `Default Branch:` pin or the default-branch fallback resolution SHALL stay. `AGENTS.md` and `CLAUDE.md` Kaizen Loop rules SHALL say "on the apply-capable branch (the default branch, or the pinned integration branch)". Mirrors SHALL reach parity with their commands in the rewritten sections (KZ-002: the "every site updated" claim is proven by the grep in §8, never asserted).

#### Scenario: Post-sweep grep

- GIVEN the sweep is complete
- WHEN the §8 phrase grep runs over the closure set
- THEN every remaining hit is one of the sanctioned forms (pin description, fallback resolution, or a sentence already in apply-capable terms) and each is enumerated in the task's done criteria
- BUT no hit may still read that apply "runs only on the default branch"

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | **Consumer read cost unchanged.** `/akili-propose`, `/akili-specify`, `/akili-execute` keep reading only `## Active Lessons`; their command text has zero kaizen-related diff. `/akili-resume`'s footer changes wording and count filter only. |
| NFR-2 | **Backward compatible, no migration.** No pin → no change. Legacy fallbacks stay permanent (predecessor DD-7). No entry file is rewritten except to stamp processed items. |
| NFR-3 | **Tool-agnostic.** Both pins are read from the root guides every command already loads; the only git call remains `git rev-parse --abbrev-ref HEAD` plus the existing default-branch fallback chain. Valid in Claude Code, OpenCode, Antigravity, Codex. |
| NFR-4 | **Never-block invariants preserved.** Kaizen never blocks the archive; unresolved Branch Context defers; a declined menu leaves items `pending`; an unparseable item is reported, never fatal. |
| NFR-5 | **Apply Mode stays bounded.** Re-verify is one probe per item; the upstream report is one file per pass; neither step reads a source spec or the codebase beyond the named fact. |
| NFR-6 | **Single writer per project — by construction, not by convention.** Exactly one branch is apply-capable at any time (FR-2's exclusive predicate); the default branch stops writing the moment an integration pin exists. Two developers applying on that one branch from separate clones is serialized by the remote the same way it is today on `main` — checked, holds. |
| NFR-7 | **Accepted residual: digest staleness inverts onto the default branch.** While an integration pin exists, a spec branch cut from the default branch (a hotfix) does not see standardizations applied on the integration branch until the next release merge. This is the predecessor's recorded "digest staleness on branches" risk with the roles swapped; it is accepted for the same reason (same visibility a developer has of any unmerged sibling work). |

## 8. Defect Classes → Gates

| Defect class this spec can produce | Gate that catches it | Falsifying input |
|---|---|---|
| A surviving assertion that apply / shared writes / digest refresh happen **only on the default branch** | `grep -rniE "only on the default branch\|default branch only\|runs only on the default\|on the default branch to work them\|applied on the default branch" .claude/commands .claude/skills/kaizen .claude/templates docs/commands docs/skills docs/flow.md docs/README.md README.md AGENTS.md CLAUDE.md --exclude-dir=worktrees` — every hit must be sanctioned and enumerated in the task's done criteria | The pre-change tree: `kaizen/SKILL.md` Apply Mode's opening line ("Runs **only on the default branch**") and `akili-resume.md`'s footer ("on the default branch to work them") are the reference falsifiers — both hit today |
| A status-enumeration site with a fall-through for the new statuses (KZ-004) | Manual enumeration: read Apply Mode collect + stamp, `/akili-archive` Step 6 item 7, `/akili-resume` footer — each must name which of the five statuses it counts/applies/reports | A site listing `pending, applied, rejected, deferred` with no clause for `superseded`/`upstreamed` — the current `/akili-resume` footer is that input today |
| Integration context inferred from git instead of the pin | `grep -n "Integration Branch" .claude/skills/kaizen/SKILL.md` — every resolution sentence names the pin as the sole source; a `symbolic-ref`/branch-name heuristic near it fails | A sentence "if a `develop` branch exists…" |
| **Union semantics surviving in text** — two writer branches (the reversion challenge's finding) | `grep -rniE "default ∪ integration\|default or the pinned integration\| either pin\|any apply-capable\|both pins are apply" .claude docs AGENTS.md CLAUDE.md README.md --exclude-dir=worktrees --exclude-dir=archive` (leading space in ` either pin` keeps "neither pin" out) plus the same grep over this spec's `requirements.md`/`design.md`/`tasks.md` — zero unsanctioned hits; the proposal's §10–§11 wording is sanctioned history, marked superseded in its §15 | This very requirements document before the 2026-09-17 amendment: FR-2 read "`default ∪ integration`" — the reference falsifier |
| Re-verify unbounded (reads spec/archive/code beyond the named fact) | Parity read of the Apply Mode re-verify step against NFR-5 at review; the step must name "one probe" and forbid escalation | Step text saying "re-read the source spec to confirm" |
| Upstream report written from a spec branch | `grep -n "upstream-" .claude/skills/kaizen/SKILL.md` — write instruction appears only inside Apply Mode; Standardize mentions only the pending item | A report-write sentence under the Standardize phase |
| Broken consumer contract | Diff of `akili-propose.md`, `akili-specify.md`, `akili-execute.md` shows zero kaizen-related change | Any changed digest-read line |
| Contradiction between skill, command, and mirrors | Per-surface parity read (command vs `docs/commands/` mirror vs `docs/skills/kaizen.md`) | A mirror still saying default-only while the command says apply-capable |
| Packaging regression | `npm run verify:cli && npm run pack:dry-run` | A renamed packaged file breaks the listing |
| Prose that reads green but cannot be executed by an agent (procedure ambiguity) | **No automated check** — substituted by a HITL walkthrough task that executes the FR-3 integration-branch scenario against a fixture with two pins, and by optional `judgment-day`; recorded as the accepted residual risk | — (accepted risk) |

## 9. Requirement ID Index

| ID | Name | Gate |
|---|---|---|
| FR-1 | `Integration Branch:` pin | parity read + constitution scenario walkthrough |
| FR-2 | Three-context Branch Context, exclusive apply-capable predicate | pin-only grep + union-semantics grep + parity read |
| FR-3 | Apply Mode / archive gates / resume on apply-capable branch | phrase grep + HITL walkthrough |
| FR-4 | Re-verify probe, `superseded`, unparseable branch | NFR-5 parity read + enumeration check |
| FR-5 | Upstream sink and report | report-write grep + parity read |
| FR-6 | `Kind`/`Status` vocabulary extended once | enumeration check (KZ-004) |
| FR-7 | Backward compatibility and tolerance | no-pin walkthrough + consumer diff |
| FR-8 | Documentation coherence sweep | phrase grep (KZ-002) |
| NFR-1..6 | Cost / compat / agnostic / never-block / bounded / single writer | diff review + parity read |
