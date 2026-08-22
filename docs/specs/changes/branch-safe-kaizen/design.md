# Design: Branch-Safe Kaizen & Shared-File Write Discipline

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/branch-safe-kaizen` |
| Depth | Standard |
| Status | Draft — Phase 2 |
| Date | 2026-08-21 |
| Source | `requirements.md` (amended after the Step 2.3 reversion challenge — two design-gaps and one blind gate fixed pre-design) |
| Reviewers | 1 adversarial reversion challenge (subagent), findings integrated below |

## 2. Executive Summary

One new concept enters the methodology: **branch-conditional writes**. No command text mentions branches in any write path today (verified), so this design introduces the concept in exactly one place — a shared **Branch Context** procedure in the `kaizen` skill — and every other surface references it by name (KZ-005: never by line number). Kaizen becomes two-phase (Record anywhere, Apply only on the default branch, with a standalone Apply Mode entry point), archive's shared-file syncs gate on the same procedure, audit reports become per-run files, and the digest gains a single writer.

## 3. Architecture Overview

```
SPEC BRANCH (any number, parallel)          DEFAULT BRANCH (single writer)
─────────────────────────────────           ──────────────────────────────
/akili-archive <spec>                       Apply entry points (any of):
  Step 3: syncs → pending items   ──┐         a) kaizen Apply Mode (standalone,
  Step 4: Kaizen                    │            no spec argument)
    Record → entry file             │ merge   b) /akili-archive run here:
    Standardize → pending items   ──┼──────►     solo fast path + backlog offer
/akili-audit → audits/drift-*.md  ──┘         c) /akili-resume: counts pending,
                                                 recommends (read-only)
Writable set on a spec branch:              Apply phase (HITL menu):
  spec folder · its entry file ·              shared-file edits · ADR allocation ·
  family.md row flip · audits/ report         digest refresh · status flips
```

**Branch Context procedure** (canonical definition in the kaizen skill; commands consume the pin, not the procedure — CS-2/CS-7 fix): current branch via `git rev-parse --abbrev-ref HEAD`. Default branch resolution, in order: **(1) the `Default Branch:` line pinned in the project's constitution summary** (root `AGENTS.md`/`CLAUDE.md` — every command already loads these in Step 0, so archive/audit/resume compare against the pin with no skill load and no procedure duplication); (2) `git symbolic-ref refs/remotes/origin/HEAD --short` (strip `origin/` — note this ref is unset in many clones until `git remote set-head origin --auto`; an error here is normal, not exceptional); (3) if exactly **one** of `main`/`master` exists among local + `origin/` branches, use it; both existing is *unresolved*, never a guess. `git config init.defaultBranch` is **never consulted** — it describes newly created repos, not this one, and silently resolves the wrong branch. Unresolved or any failure (detached HEAD, no git) ⇒ **treat as spec branch** — deferring is always safe; applying is not (NFR-4) — and say so in one line, naming the pin as the remedy.

## 4. Extended Directory Structure

```
docs/specs/
  kaizen-log.md          # digest only (## Active Lessons); ## Entries frozen w/ pointer note
  kaizen/                # NEW — one entry file per retrospective
    changes--feature-a.md          # filename IS the safe slug; date lives inside
  audits/                # NEW — one report per audit run
    drift-2026-08-21.md
    drift-2026-08-22-feat--b.md    # branch feat/b → $SAFE_NAME feat--b, single - separator
  quick/                 # existing; enters the scan carve-out list (latent bug fix)
  general-setup/         # existing; enters the carve-out list
  archive/               # existing carve-out
```

Filename conventions reuse the archive's `$SAFE_NAME` rule (`/` → `--`) for spec slugs and branch slugs — one sanitization convention repo-wide, not two.

## 5. Data Model — the Entry File (the spec's one new contract)

`docs/specs/kaizen/<safe-spec-slug>.md` — **the filename is exactly the safe slug, no date prefix** (CS-1 fix: a date prefix forced glob-based re-run detection, and both judges proved the glob either missed its own filename or matched the wrong spec's). Re-run detection is an exact-name existence check — no glob, no ambiguity; update in place. Chronology lives in the entry's Document Control `Date` field; the apply phase reads all entries regardless of order:

```markdown
# Kaizen Entry — <spec-path>
| Field | Value |                        ← Document Control: spec, date, branch,
|---|---|                                  archive run, Approval Mode
## Metrics                               ← same table the log format has today
## Lessons                               ← ≤3; IDs KZ-<safe-spec-slug>-<n>
- **KZ-...-1 — <title>** (Target, Severity)
  - Root cause / Evidence (unchanged evidence bar)
## Noted, not a lesson                   ← sub-threshold signals (recurrence feed)
## Pending Items                         ← the apply phase's work queue
### P1
| Kind | standardization \| digest-update \| guide-sync \| factual-sweep \| trd-adr |
| Target | <file, or KZ-id for digest-update> |
| Edit | <verbatim 1–3 lines, or the superseding-ADR text with NO number> |
| Severity | High \| Medium \| Low |
| Status | pending \| applied (date) \| rejected (reason) \| deferred |
```

**Status semantics (B-12 fix):** `pending` — awaiting an apply pass. `applied`/`rejected` — flipped by the apply menu with date/reason. `deferred` — produced when the user picks **Defer all / Defer selected** in any apply menu (branch solo fast path included): the item stays in the backlog, keeps being counted by `/akili-resume`, and is re-offered at every subsequent apply pass; deferral is a visible postponement, never a terminal state.

Five `Kind` values cover every write the branch defers: FR-2's standardizations, FR-1's digest mutations (recurrence/severity-raise — the branch-expressible form of the skill's recurrence rule), and FR-5's three archive syncs. One schema, one apply loop.

## 6. Reversion Challenge (Step 2.3) — outcomes

| Reversion | Verdict | Resolution in this design |
|---|---|---|
| R1 — Record stops prepending to `## Entries` | DESIGN-GAP → fixed | Recurrence/`Noted` chains become `digest-update` pending items + Learn reads entry files (DD-3); archive Step 0.4 read list updated (Surface Table) |
| R2 — audit stops writing the fixed path | SAFE-WITH-LISTED-FIXES | All six uncovered sites (audit's own checklist, archive Step 0.4, `docs/flow.md` §2 prose, README auxiliary bullet, +2 grep-catchable) are Surface Table rows |
| R3 — Standardize gated on branch | DESIGN-GAP → fixed | Standalone Apply Mode (DD-2) closes the "no reachable entry point" hole; the persona guardrail exempts a spec's own deliverables (DD-6); archive Step 6 gains the `pending` report state; the §8 gate gained the immediacy-phrase grep (KZ-006) |

Deferred-lesson visibility across unmerged branches remains an **accepted risk** (same visibility as any unmerged sibling work; bounded by Apply Mode being runnable at any time and `/akili-resume` surfacing the count every session).

## 7. Surface Table

Anchors are locators as of 2026-08-21; edits reference rules **by name** in prose (KZ-005). All greps exclude `.claude/worktrees/` and `docs/specs/archive/`.

| # | File | Site (locator) | Change |
|---|---|---|---|
| 1 | `.claude/skills/kaizen/SKILL.md` | **Frontmatter `description:` (:3)** + Activation Contract (~:20) | Add Apply Mode trigger phrases to the frontmatter description — the field skill discovery matches on (CS-3); then the Apply Mode activation in the body (standalone, default-branch, no spec argument) |
| 2 | 〃 | Loop Contract **phases 1–4 (~:47–102)** | Measure's drift source row (~:59) → most recent `audits/` report, legacy fallback (SU-2); Learn reads digest + `kaizen/` entries incl. `Noted` (DD-3); Standardize gains Branch Context gate + pending recording; Record targets the entry file; dual-lesson immediacy lines ("apply/make the local edit now", ~:74, :85) go branch-conditional |
| 3 | 〃 | Kaizen Log Format (~:104–149) | Becomes: digest schema (unchanged columns) + entry-file schema (§5) + freeze note text |
| 4 | 〃 | Hard Rules (~:151–158) | "never edit outside kaizen-log.md" → branch-termed writable set; add Branch Context procedure + failure default |
| 5 | `.claude/commands/akili-archive.md` | Step 0.4 (~:81–82) | Read list → digest + `kaizen/` entries + latest `audits/` report (legacy fallbacks) |
| 6 | 〃 | Step 3 (~:123–136) | Guide sync / factual sweep / TRD-ADR sync gated by Branch Context; on spec branch → pending items (`guide-sync`/`factual-sweep`/`trd-adr`, ADR **number-free**); family flip + CodeGraph note stay branch-side |
| 7 | 〃 | Step 4.3–4.4 (~:152–158) | Standardize/Record delegate to the skill's two-phase contract; default-branch runs auto-offer the whole pending backlog |
| 8 | 〃 | Step 6 item 7 (~:176) | Report states: applied, deferred, **or pending (awaiting default-branch apply)** |
| 9 | 〃 | Error Handling (~:189–190) | Never-block restated; writable-set rule in branch terms; **the metrics-only/clean-run fallback entry writes to the spec's entry file, never to `kaizen-log.md`** (B-15 — the old fallback path was a single-writer violation from a branch) |
| 10 | `.claude/commands/akili-audit.md` | Step 3 (~:62–68) + checklist (~:124) + **Step 0 item 4 (~:30)** | Per-run path `audits/drift-<YYYY-MM-DD>[-<safe-branch>][-N].md` (single `-` separators, branch through `$SAFE_NAME`; "most recent" = the report's own `Date` header, tie-break newest filename lexically — W-2); checklist asserts the **new** path; never touches legacy file; Step 0's "active specs in `docs/specs/`" read gains the carve-out list (SU-1 — else the audit reads its own prior reports as specs) |
| 11 | `.claude/commands/akili-resume.md` **+ `akili-propose.md` (~:75) + `akili-specify.md` (~:91)** and their mirrors | resume Step 0.2 (~:30); propose/specify nearby-spec reads | One carve-out list, stated identically at every enumeration site: `archive/ general-setup/ quick/ kaizen/ audits/` + family container (CS-4/SU-1; fixes the latent `quick/` misclassification — latent because `quick/` is created lazily on first `/akili-quick` use) |
| 12 | 〃 | Kaizen footer (~:102–106) | Adds pending count + highest severity + exact Apply Mode phrase; stays read-only |
| 13 | `.claude/commands/akili-constitution.md` | **Step 0 foundation dirs (~:35–41)** + Step 8 root-guide summary (~:332) | Scaffold `kaizen/` + `audits/` (one-line README each — the README does not count as an entry file or a report; Learn and "most recent report" reads skip it, and the FR-6 legacy fallback triggers on "no report files present", not "directory empty"); write-discipline rule **and the `Default Branch: <name>` pin (DD-1)** in the constitution summary |
| 14 | `.claude/templates/leader.md`, `implementer.md` | append | Side-effect write guardrail with the own-deliverable exemption (DD-6); different region than `scoped-constitution-reads`'s item-14 rewrite |
| 15 | Docs mirrors | `docs/commands/akili-archive.md` (:52–58 **stale — bring to parity**, :61–70, :77), `akili-audit.md` (:24, :29), `akili-resume.md` (:24–27), `akili-constitution.md`, `docs/commands/README.md` (:16–17), `docs/skills/kaizen.md` (:18–19, :25) | Mirror the above |
| 16 | Root docs | `AGENTS.md:30`; `README.md` :563–564, :604–616, :764, :811; `docs/README.md:30`; `docs/flow.md` :80, :84, :153–154, :283, :403–415 | Two-phase wording; per-run report path |
| 17 | `CHANGELOG.md` | Unreleased | Patch entry (user-decided classification) |

## 8. Design Decisions

### DD-1 — Pin first, procedure second: commands consume the `Default Branch:` pin, the skill owns the fallback resolution
The judgment round proved the original "referenced by name" scheme unexecutable (CS-7: audit/resume never load the kaizen skill) and the resolution order unsound (CS-2: `init.defaultBranch` answers a different question). Revised: `/akili-constitution` pins `Default Branch: <name>` in the constitution summary of root `AGENTS.md`/`CLAUDE.md` — files every command already loads — so archive/audit/resume do one comparison (`git rev-parse --abbrev-ref HEAD` vs the pin) with no skill load and no duplicated procedure. The full resolution chain (§3) lives only in the kaizen skill and runs solely when the pin is absent (legacy projects). Unpinned + unresolved defaults safe per command: kaizen/archive defer; audit appends the branch slug (an extra suffix never conflicts); resume treats the context as a spec branch. Rejected: restating the git chain in four commands (drift), and loading the skill from report-only commands (scope creep for one comparison).

### DD-2 — Apply Mode is a skill activation, not a command
`AGENTS.md`'s standing rule says no separate kaizen command, and the reversion challenge proved archive alone is an unreachable entry point after merges (spec already archived; `<spec-path>` required). An activation of the already-packaged skill needs no installer change, no new file, and is invocable in all three hosts. `/akili-resume` recommends the exact phrase; it never applies anything itself (its no-write contract is load-bearing for NFR-1).

### DD-3 — Recurrence survives the split as data, not as a live digest write
The skill's recurrence rule ("increment note, raise severity") is a digest write and therefore branch-illegal. It becomes a `digest-update` pending item, and Learn's duplicate check reads digest + entry files (including `Noted` sections). Rejected: letting branches write the digest "just for recurrence" — reintroduces the exact conflict this spec exists to kill. Cost: Learn reads a directory of small files; bounded by retrospectives being ≤3 lessons each.

### DD-4 — One pending-item schema for all five deferred write kinds
Standardizations, digest updates, and the three archive syncs share the §5 block schema and one apply loop. Rejected: separate formats per origin (five parsers, five menus). ADR items carry **no number** until apply (kills the `ADR-MMM` race at its root — allocation is the conflict, not the append).

### DD-5 — Filenames reuse the archive `$SAFE_NAME` convention
`/`→`--` for spec and branch slugs. Entry files carry **no date prefix** — the filename is exactly the safe slug and re-run detection is an exact-name existence check (CS-1: the earlier date-prefixed + glob scheme could not match its own filenames); audit reports keep the date prefix because they are per-run, not per-spec. Rejected: a new sanitization rule (two conventions to keep aligned) and counter-based names (counters are the disease).

### DD-6 — The guardrail governs side-effect writes, not a spec's own product
Without the exemption for files named as deliverables in an approved `tasks.md`, the rule forbids this repository's own specs (personas/guides ARE the product here — the challenge cited this spec's §4 as self-contradicting). The side-effect/deliverable boundary is decided at specify time, where it is reviewable — not at write time by the agent.

### DD-7 — Legacy fallbacks are permanent, not transitional
Readers try new paths, then legacy (`kaizen-log.md` entries stay readable history; `drift-report.md` stays a valid last-resort read). Rejected: a migration step — rewriting history files on upgrade is exactly the shared-file write class this spec eliminates (NFR-2).

### DD-8 — Grouping by Target with three outcomes: merge, dedupe, or decide
At apply time, pending items group by their `Target` value — a file path **or a KZ-id** (CS-6 fix: the original file-only grouping made the design's own recurrence case unexpressible). Three rules, in order: **(a)** `digest-update` items on the same KZ-id **merge** per the skill's recurrence rule — highest proposed severity wins, source specs union, one digest row updated; never a user prompt (two branches hitting the same root cause is the expected case, not a conflict). **(b)** Byte-identical edits to the same file **deduplicate** — applied once, every contributing item flips `applied` citing the single application. **(c)** Differing edits to the same file ⇒ quoted side by side, the user decides. Rejected: any auto-merge/last-wins for case (c) — the entire point is converting silent textual merges into visible decisions (FR-3).

### DD-9 — Scan carve-outs are a closed named list (KZ-004)
`/akili-resume` Step 0.2 names all five non-spec folders explicitly; the known-failing input (`quick/`, misclassified today) becomes the regression check. Rejected: a "looks like a spec" heuristic (file-presence heuristics are the current bug).

### DD-10 — The doc sweep gate is two greps, not one (KZ-006)
Path grep + immediacy-phrase grep (`apply all|defer all|apply the local edit now|make every proposed edit now|kaizen log`), because ten of the R3 breakage sites contain neither path string. Already encoded in `requirements.md` §8.

## 9. Budget (Step 2.4 — tripwire for `/akili-execute`)

| Metric | Expected |
|---|---|
| Tasks | **6** |
| Changed/added lines | **~260** across 17 surfaces (prose; no code) |
| Review rounds | **1 per task** |

Depth re-check: Standard holds — 17 surfaces and one new cross-command concept is not Lite; no data/API/auth risk pushes it to Full. Numbers count shipped surfaces, not this document.
