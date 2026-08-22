# Requirements: Branch-Safe Kaizen & Shared-File Write Discipline

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/branch-safe-kaizen` |
| Depth | **Standard** |
| Type | Change |
| Approval Mode | `gated` (inherited from `proposal.md`) |
| Status | Draft — Phase 1 |
| Date | 2026-08-21 |
| Source | `proposal.md` (approved intent; Release Classification: **patch**, user decision) |
| Format precedent | `docs/specs/archive/2026-08-13-changes--audit-phase-tier-drift/requirements.md` — this repo has no `docs/specs/general-setup/` (it packages the methodology rather than consuming it) |

## 2. Executive Summary

Every methodology write during a spec's lifecycle must become **conflict-free by construction** under multi-developer parallel branches, governed by one principle: *on a spec branch, only write files unique to that branch; every shared-file edit happens only on the default branch, serialized.* Kaizen splits into two phases (record on branch as per-spec files, apply standardizations on main), archive's guide/TRD syncs gate on branch, audit reports become per-run files, and the `## Active Lessons` digest gains a single writer. Evidence: a live merge where 11 of 12 conflicting files were methodology artifacts. Branch-conditional writes are a **new concept** — no existing command text mentions branches in any write path (verified by repo sweep).

## 3. Glossary

| Term | Meaning |
|---|---|
| **Default branch** | The repository's primary integration branch; the only branch where shared files may be edited. Primary source: the `Default Branch:` line `/akili-constitution` pins in the constitution summary; fallback resolution (legacy projects) lives in the kaizen skill's Branch Context |
| **Spec branch** | Any branch that is not the default branch |
| **Shared file** | A file written by more than one spec's lifecycle: `.agents/*` personas, root/child `CLAUDE.md`/`AGENTS.md`, `docs/specs/general-setup/` templates, `docs/ux-ui/design.md`, `docs/trd/trd.md`, `docs/specs/kaizen-log.md` |
| **Entry file** | A per-retrospective file `docs/specs/kaizen/<safe-spec-slug>.md` (`/`→`--`; no date prefix — the date lives inside), unique per spec by exact filename |
| **Pending standardization** | A proposed 1–3-line edit recorded in an entry file with target file, exact edit, severity, and `Status: pending` |
| **Apply phase** | The default-branch-only step that presents pending standardizations through the HITL menu, makes approved edits, and flips statuses |
| **Digest** | The `## Active Lessons` table in `docs/specs/kaizen-log.md` — path and format unchanged; the only kaizen content consumers read |
| **Solo fast path** | When the retrospective already runs on the default branch, record and apply execute in one pass — today's behavior |

## 4. System Context & Scope

**In scope:**

| Surface | Files |
|---|---|
| Kaizen skill | `.claude/skills/kaizen/SKILL.md` (loop contract, entry-file format, IDs, digest rule, Measure source for audit reports) |
| Commands | `.claude/commands/akili-archive.md` (Steps 0.4, 3, 4, **6** report contract, Error Handling), `akili-audit.md` (Step 3 report path **and its own Verification Checklist**, which today asserts the fixed path exists), `akili-resume.md` (Step 0 scan carve-outs, dashboard pending surface + Apply Mode recommendation), `akili-constitution.md` (scaffolding + write-discipline rule) |
| Personas | `.claude/templates/leader.md`, `implementer.md` — **append** a write-discipline guardrail (adjacent spec `changes/scoped-constitution-reads` rewrites `implementer.md` item 14 — different region; sequence, don't merge) |
| Docs mirrors | `docs/commands/akili-archive.md` (**correction**: mirror already omits the factual sweep and TRD/ADR sync), `akili-audit.md`, `akili-resume.md`, `akili-constitution.md`, `docs/commands/README.md`, `docs/skills/kaizen.md` |
| Root docs | `AGENTS.md` (Kaizen Loop rule), `README.md` (command table rows, Kaizen diagram + bullets, **auxiliary-commands audit bullet**), `docs/README.md`, `docs/flow.md` (pipeline diagram, artifact table, §8 Kaizen Loop, **§2 drift-auditing prose**), `docs/openspec-comparison.md` if wording turns false — the design's Surface Table is the authoritative per-site list; these parentheticals are orientation, not the closure set |
| Release | `CHANGELOG.md` under Unreleased (patch) |

**Out of scope (non-goals):** installer (`bin/akili.js`), hooks, CI/git-hook enforcement; the consumers' digest read contract (`/akili-propose`, `/akili-specify`, `/akili-execute`, `/akili-resume` keep reading `docs/specs/kaizen-log.md` → `## Active Lessons` unchanged); the `family.md` child-row flip (already spec-scoped); what Kaizen measures and its ≤3-lessons / 1–3-line bounds; retroactive migration of existing log entries; the `quick-log.md` append mechanism itself (its folder does enter the scan carve-out, FR-8).

**Grep hazard (binding on every verification below):** `.claude/worktrees/` is a stale gitignored clone matching every grep; all sweeps exclude it and `docs/specs/archive/`.

## 5. Stakeholders / Personas

| Stakeholder | Interest |
|---|---|
| Multi-dev team on parallel spec branches | Merges with zero methodology-file conflicts |
| Solo developer on the default branch | Zero added friction — today's flow via the solo fast path |
| The archiving agent | Unambiguous branch-conditional procedure, including detection failure |
| Digest consumers (4 commands) | Unchanged read contract at unchanged cost |
| Methodology maintainer | Pending-standardization pipeline replaces silent textual merges with visible decisions |

## 6. Functional Requirements

### FR-1: Per-spec Kaizen entry files (Record is branch-safe)

The `kaizen` skill's Record phase SHALL write one entry file per retrospective at `docs/specs/kaizen/<safe-spec-slug>.md` (the filename is exactly the spec's `$SAFE_NAME` slug — no date prefix; re-run detection is an exact-name existence check, never a glob) and SHALL NOT prepend to `## Entries` in `docs/specs/kaizen-log.md`. The entry file carries the metrics table, lessons, "Noted, not a lesson" sub-threshold signals, and each lesson's proposed standardization (target file, exact 1–3-line edit, severity, `Status: pending | applied | rejected | deferred`). Lesson IDs SHALL be `KZ-<safe-spec-slug>-<n>` (`/`→`--`, so the ID is legal in the digest column and inline citations) — the global `KZ-###` counter is retired for new lessons; existing IDs are never renumbered. A pending item MAY also be a **digest update** (`Kind: digest-update`): a recurrence of an existing lesson (`Recurrence-of: <KZ-id>`, severity raise, added source spec) — the branch-expressible form of the skill's recurrence rule, applied to the digest only at apply time. The Learn phase's duplicate/recurrence check SHALL read the digest **plus** the entry files under `docs/specs/kaizen/` (including their Noted signals), so sub-threshold recurrence chains keep accumulating across the split.

#### Scenario: Two branches archive in parallel

- GIVEN developer A archives `changes/feature-a` on branch `feat-a` and developer B archives `changes/feature-b` on branch `feat-b`, both running the retrospective
- WHEN both branches merge to the default branch
- THEN the merge introduces two distinct new files under `docs/specs/kaizen/` and zero conflicts in any kaizen artifact
- AND IT MUST derive each filename from that spec's slug, never from a shared counter or a fixed name
- BUT it must NOT write to `docs/specs/kaizen-log.md` from either branch

#### Scenario: Retrospective re-run for the same spec

- GIVEN an entry file for the spec already exists (an archive was re-run on the same branch)
- WHEN Record executes
- THEN it updates that entry file in place rather than creating a second file for the same spec

### FR-2: Standardize gates on branch (two-phase)

The Standardize phase SHALL determine whether the current branch is the default branch. On a **spec branch**, it SHALL record every proposed edit as a pending standardization in the entry file and SHALL NOT edit any shared file — the HITL apply menu does not fire. On the **default branch**, it SHALL run today's HITL menu and apply approved edits immediately (solo fast path), flipping statuses in the entry file in the same pass.

#### Scenario: High-severity lesson on a spec branch

- GIVEN a retrospective on branch `feat-a` distills a High-severity lesson targeting `.agents/leader.md`
- WHEN Standardize runs
- THEN the proposed edit is recorded `pending` in the entry file with its exact target and text
- AND the report tells the user the edit awaits the apply phase on the default branch
- BUT it must NOT edit `.agents/leader.md`, any guide, template, or the digest
- AND IT MUST still present lessons for user visibility — gating moves the *write*, not the *review*

#### Scenario: Branch detection fails

- GIVEN no `Default Branch:` pin exists and git resolution cannot determine the default branch (detached HEAD, no git repository, `origin/HEAD` unset with both `main` and `master` present)
- WHEN Standardize runs
- THEN it treats the context as a spec branch (defer everything)
- AND IT MUST say so in one line rather than failing or guessing

#### Scenario: Solo developer on the default branch

- GIVEN the retrospective runs with the default branch checked out
- WHEN Standardize runs
- THEN record and apply execute in one pass with today's HITL menu — observable behavior identical to the current flow, except the entry lands in `docs/specs/kaizen/` and statuses are stamped in the entry file

### FR-3: Apply phase on the default branch

The apply phase SHALL have a **standalone, always-reachable entry point**: the `kaizen` skill gains **Apply Mode** as a first-class activation ("apply pending kaizen standardizations"), runnable on the default branch at any time with no spec argument — no new command is added (the `AGENTS.md` "no separate kaizen command" rule holds; this is an activation of the existing skill). Additionally: `/akili-archive`, when it happens to run on the default branch, SHALL auto-offer the apply step over the whole pending backlog after its own retrospective; `/akili-resume` (always read-only) SHALL surface the pending count and highest severity in its dashboard and recommend the exact Apply Mode invocation. The apply step presents the HITL menu (Apply all / Apply selected / Defer / adjust) over all pending items, applies approved edits, and flips each item to `applied` (with date), `rejected` (with reason), or `deferred` (chosen via Defer — the item stays in the backlog, keeps counting in `/akili-resume`, and is re-offered at every later apply pass).

#### Scenario: Pending work surfaces after merges

- GIVEN two merged entry files hold three pending standardizations, one High
- WHEN `/akili-resume` runs on the default branch
- THEN the dashboard reports "3 pending standardizations (1 High)" and recommends the apply step
- BUT `/akili-resume` must NOT edit any file — its no-write contract is untouched

#### Scenario: Contradictory pending edits

- GIVEN two entry files propose incompatible edits to the same target file
- WHEN the apply phase reaches them
- THEN both proposals are quoted side by side and the user chooses
- AND IT MUST never apply both silently nor auto-pick a winner

### FR-4: Digest single-writer and legacy freeze

`docs/specs/kaizen-log.md` SHALL keep the `## Active Lessons` digest at the same path and column format, refreshed **only** during the apply phase on the default branch (add applied lessons, record deferred ones, retire institutionalized ones, ≤10 rows). The existing `## Entries` section SHALL be frozen: a one-line note points to `docs/specs/kaizen/` for new entries; historical entries are never rewritten, renumbered, or deleted. In a project with no kaizen log at all, the apply phase creates the file with the digest section only.

#### Scenario: Consumers keep their contract

- GIVEN any of the four consumer commands loads kaizen context
- WHEN it reads `docs/specs/kaizen-log.md` → `## Active Lessons`
- THEN the table has the same columns and semantics as today
- AND IT MUST require no change in any consumer's command text beyond none — a consumer diff is a defect of this spec

#### Scenario: Legacy project, first retrospective after upgrade

- GIVEN a project whose `kaizen-log.md` has populated `## Entries` and no `docs/specs/kaizen/` directory
- WHEN the first retrospective runs on a spec branch
- THEN the directory is created with the new entry file, and `kaizen-log.md` is untouched (the freeze note lands later, in the first default-branch apply pass)
- BUT it must NOT migrate, rewrite, or delete any existing entry

### FR-5: Archive shared-file syncs gate on branch

`/akili-archive` Step 3's agent guide sync, factual-claims sweep, and TRD & ADR sync SHALL run only on the default branch. On a spec branch, each would-be edit SHALL be recorded as a pending item in the spec's kaizen entry file (same schema as FR-2's pending standardizations, tagged by origin: `guide-sync | factual-sweep | trd-adr`). ADR numbers SHALL be allocated at apply time on the default branch, never on a spec branch. The Step 3 `family.md` child-row flip and Step 2's `archive-summary.md` (written inside the spec's own folder) stay branch-side — they are spec-scoped. The Step 5 folder move to `docs/specs/archive/` stays branch-side unchanged. Two adjacent contracts update with this: **Step 0.4's read list** becomes digest + `docs/specs/kaizen/` entry files + the most recent report under `docs/specs/audits/` (legacy paths as fallback), and **Step 6's report item 7** gains the third standardization state — `applied, deferred, or pending (awaiting the default-branch apply phase)`.

#### Scenario: Pivot superseded an ADR, archived on a branch

- GIVEN `execution.md` records a pivot overturning a TRD architecture decision
- WHEN `/akili-archive` runs on branch `feat-a`
- THEN a pending `trd-adr` item captures the superseding decision and the old ADR it names — with **no number allocated**
- AND at apply time on the default branch, the next free `ADR-MMM` is assigned, appended to the TRD, and the old entry flipped to `superseded by ADR-MMM`
- BUT it must NOT edit `docs/trd/trd.md`, any `CLAUDE.md`/`AGENTS.md`, from the spec branch

#### Scenario: Error-handling guardrail stays coherent

- GIVEN the archive's standing rule "never edit files outside the kaizen log without approval"
- WHEN the command text is updated
- THEN the rule is restated in branch terms: on a spec branch the writable set is the spec folder + its entry file + the `family.md` flip; on the default branch it additionally includes HITL-approved shared files
- AND IT MUST keep the never-block invariant: a declined menu or missing input still yields a metrics-only entry and the archive continues

### FR-6: Audit reports become per-run files

`/akili-audit` SHALL write its report to `docs/specs/audits/drift-<YYYY-MM-DD>[-<safe-branch>][-N].md` — single `-` separators, the branch slug passed through the `$SAFE_NAME` rule (`/`→`--`), branch suffix added when not on the default branch **or when the default branch cannot be resolved** (an extra suffix never conflicts), numeric suffix on same-name collision. "Most recent" SHALL be determined by the `Date` header inside each report, tie-broken by newest filename in lexical order — never by filesystem mtime (worthless after checkout). Readers of the drift report (kaizen Measure's drift source; any command citing it) SHALL take the most recent report file in `docs/specs/audits/` and fall back to legacy `docs/specs/drift-report.md` when **no report files are present** (a scaffolded README/`.gitkeep` does not count as a report). The audit SHALL NOT modify or delete an existing legacy `drift-report.md`.

#### Scenario: Two branches audit in the same week

- GIVEN audits run on `feat-a` and `feat-b` days apart
- WHEN both branches merge
- THEN two report files coexist under `docs/specs/audits/` with zero conflicts
- BUT neither run must NOT overwrite the other's report nor the legacy file

### FR-7: Constitution scaffolds the discipline

`/akili-constitution` SHALL scaffold `docs/specs/kaizen/` and `docs/specs/audits/` (with a `.gitkeep` or one-line README each — scaffold files never count as entry files or reports for any reader), SHALL pin **`Default Branch: <name>`** in the constitution summary it writes into root `AGENTS.md`/`CLAUDE.md` (the primary source every command's branch test compares against — see design DD-1), and SHALL state the shared-file write rule in the same summary. The packaged personas `leader.md` and `implementer.md` SHALL gain an appended guardrail scoped to **lifecycle side-effect writes**: on a spec branch, kaizen standardizations, archive syncs, and audit outputs never edit shared guides, personas, templates, or the TRD. Files that a spec's **approved `tasks.md` names as its own deliverable are exempt** — they are the spec's product, protected by the normal review flow, not a side effect (without this exemption the rule would forbid this very repository's work, where personas and guides are the product). Safe Update mode adds what is missing and never overwrites customized personas (existing contract).

#### Scenario: New project constitution

- GIVEN `/akili-constitution` runs on a fresh project
- WHEN scaffolding completes
- THEN both directories exist and the write rule is present in the summary and personas
- AND IT MUST remain a text/scaffold change only — no hook, no installer flag

### FR-8: Spec-folder scans carve out non-spec directories

Every enumeration of `docs/specs/` SHALL name its non-spec carve-outs explicitly: `archive/` (already excluded), `general-setup/`, `quick/`, `kaizen/`, `audits/`, plus the existing family-container carve-out. The four live enumeration sites, each with the identical list: `/akili-resume` Step 0.2 (primary — any non-spec subdirectory is misclassified as an "incomplete spec" via its error path; **`quick/` triggers this the moment any `/akili-quick` run creates it** — latent-and-conditional, since the folder is created lazily); `/akili-propose`'s related-spec read; `/akili-specify`'s nearby-spec read; and `/akili-audit` Step 0's active-spec read (which, uncorrected, would ingest the audit's **own prior reports** as specs after FR-6). `/akili-archive` enumerates no folders (it takes one spec path and moves one folder) — it needs no carve-out and this requirement claims none for it. (Applies Active Lesson **KZ-004**: enumerate the scan's terminal branches; state which branch each new folder role lands in.)

#### Scenario: Dashboard after this spec ships

- GIVEN `docs/specs/` contains `kaizen/`, `audits/`, `quick/`, `general-setup/`, `archive/`, one family container, and two real specs
- WHEN `/akili-resume` scans
- THEN exactly the two real specs (plus the family heading) render, and the pending-standardization footer counts from `kaizen/`
- BUT it must NOT list `kaizen/`, `audits/`, `quick/`, or `general-setup/` as incomplete specs

### FR-9: Documentation coherence sweep

All mirrors and root docs listed in §4 SHALL be updated so no document still asserts the superseded behavior (append-to-log Record, fixed drift-report path, unconditional Standardize edits). This includes **correcting** `docs/commands/akili-archive.md`, whose Step 3 summary already omits the factual-claims sweep and TRD/ADR sync (pre-existing staleness — bring the mirror to parity while rewriting the section). `AGENTS.md`'s Kaizen Loop rule (line ~30) SHALL be rewritten in two-phase terms. (Applies Active Lesson **KZ-002**: before claiming "all references updated", run the grep that would falsify it.)

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | **Consumer read cost unchanged.** The digest stays one table at one stable path; no consumer command's read list grows. Verification: diff of the four consumer commands shows zero changes to their kaizen read instructions (except `/akili-resume`'s additive pending-count footer). |
| NFR-2 | **Backward compatible.** A legacy project (old log format, no new directories) runs every command without error before any retrospective creates the new layout; legacy read fallbacks are permanent, not transitional. |
| NFR-3 | **Tool-agnostic.** Branch detection is expressed as plain `git` (current branch vs. default branch), valid in Claude Code, OpenCode, and Antigravity; no host-specific API. |
| NFR-4 | **Never-block invariants preserved.** Kaizen still never blocks the archive; branch-detection failure defers instead of erroring; a declined apply menu leaves items `pending`, never lost. |

## 8. Defect Classes → Gates

| Defect class this spec can produce | Gate that catches it | Falsifying input |
|---|---|---|
| A surviving reference to superseded behavior (append-to-log, fixed drift path, unconditional Standardize) | Two greps, both required — path references: `grep -rn "kaizen-log\|drift-report" .claude/ docs/ AGENTS.md CLAUDE.md README.md --exclude-dir=worktrees --exclude-dir=archive --exclude-dir=branch-safe-kaizen`; **immediacy phrases** (which contain neither path string — the reversion challenge proved the path grep alone is blind to them, KZ-006): `grep -rni "apply all\|defer all\|the local edit now\|every proposed edit now\|kaizen log" <same targets>` — the pattern `the local edit now` deliberately catches both the "apply…" (skill Learn phase) and "make…" (skill Standardize phase) variants, the miss Judgment Day proved (CS-5). Every hit of either grep must be sanctioned and enumerated in the task's done criteria; the spec's own folder is excluded because it quotes the phrases verbatim | Path grep: an unsanctioned hit (e.g. `docs/flow.md:80` still saying "appends kaizen-log.md"). Phrase grep: an unconditional immediacy claim surviving in either variant — the "make the local edit now" line at the skill's Standardize phase is the reference falsifier, and the pre-fix pattern demonstrably missed it |
| A `docs/specs/` scan with a fall-through branch (KZ-004) | Manual enumeration check: read each of the four scan sites (resume, propose, specify, audit) and confirm all five carve-out names land in a named branch | A folder name absent from every terminal branch — the current resume text fails this check the moment a lazily-created `quick/` exists (latent-and-conditional: no `quick/` exists in this repo today), proving the check can fail |
| Broken consumer contract | Grep the four consumer commands for their digest read (`kaizen-log.md` + `Active Lessons`) — must be byte-identical pre/post except resume's additive footer | Any changed consumer read line fails |
| Contradiction between command, skill, and mirrors | Per-surface parity read (command vs. its `docs/commands/` mirror vs. `docs/skills/kaizen.md`) at review | A mirror asserting the old flow while the command asserts the new one |
| Packaging regression | `npm run verify:cli` && `npm run pack:dry-run` | A removed/renamed packaged file breaks the CLI listing |
| Prose that reads green but cannot be executed (procedure ambiguity) | **No automated check exists** — substituted by the HITL gates of this spec (Phase 2/3 review, optional `judgment-day`) and recorded here as the accepted residual risk | — (accepted risk, acknowledged blind spot) |

## 9. Requirement ID Index

| ID | Name | Gate |
|---|---|---|
| FR-1 | Per-spec entry files | grep sweep + parity read |
| FR-2 | Branch-gated Standardize | parity read + scenario walkthrough at HITL |
| FR-3 | Apply phase on default branch | parity read + scenario walkthrough |
| FR-4 | Digest single-writer + freeze | consumer-contract grep |
| FR-5 | Archive syncs gated | parity read + grep sweep |
| FR-6 | Per-run audit reports | grep sweep |
| FR-7 | Constitution scaffolding | parity read |
| FR-8 | Scan carve-outs | KZ-004 enumeration check |
| FR-9 | Doc coherence sweep | grep sweep (KZ-002) |
| NFR-1..4 | Cost / compat / agnostic / never-block | diff review + parity read |
