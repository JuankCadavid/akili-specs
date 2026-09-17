# Design: Kaizen Loop Closure

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/kaizen-loop-closure` |
| Depth | Standard |
| Status | Draft — Phase 2 |
| Date | 2026-09-17 |
| Source | `requirements.md` (amended after the Step 2.3 reversion challenge: the proposal's union rule "apply-capable = default ∪ integration" became the exclusive rule — one writer branch, chosen by the pin) |
| Reviewers | 1 adversarial reversion challenge (subagent, synchronous) — 6 breakages examined, 4 real gaps closed pre-design (DD-2, DD-5, DD-6, DD-8), 2 recorded "checked, holds" |
| Predecessor | `docs/specs/archive/2026-08-22-changes--branch-safe-kaizen/design.md` — DD-1 extended, DD-3/DD-4/DD-7/DD-8 preserved |

## 2. Executive Summary

Nothing new enters the methodology's write model. The predecessor's invariant — *shared files have one writer branch* — stays; this spec only lets a project **choose which branch that is**. A second pin of the same shape as `Default Branch:` names an integration branch; when it exists, that branch is the sole apply-capable context and the default branch becomes a merge target that records pending like any spec branch. On top of that reachability fix, Apply Mode gains two bounded steps that make the backlog trustworthy: a one-probe **re-verify** before each write (`superseded` when the premise died) and an **upstream report** that closes Methodology lessons (`upstreamed`). Every project without the pin runs v2.24.0 behavior unchanged.

## 3. Architecture Overview

```
                 Integration Branch: pinned?
                 ┌────── no ──────┐          ┌────── yes ──────┐
                 │                │          │                 │
DEFAULT BRANCH   │ apply-capable  │          │ NON-WRITING     │  ◄─ merge target only
                 │ (today's flow) │          │ records pending │     (hotfix archives defer,
                 └────────────────┘          └─────────────────┘      name the integration branch)

INTEGRATION      │ cannot occur   │          │ apply-capable   │  ◄─ THE single writer:
BRANCH           │ (no pin)       │          │ (sole writer)   │     Apply Mode · Step 3 syncs ·
                 └────────────────┘          └─────────────────┘     ADR numbering · digest · upstream report

SPEC BRANCHES    │ record pending — unchanged on both sides                              │
```

**Branch Context** (kaizen skill, Hard Rules — the one canonical definition; every other surface cites it by name, KZ-005):

1. Current branch: `git rev-parse --abbrev-ref HEAD` (unchanged).
2. Default branch: the `Default Branch:` pin, then the existing fallback chain (unchanged).
3. Integration branch: the `Integration Branch:` pin **only**. No git fallback exists or is attempted — absent pin, no integration branch.
4. Context value: `integration` if current = integration pin; else `default` if current = default branch; else `spec`. Unresolved / failure ⇒ `spec` (unchanged defer-on-failure).
5. **Apply-capable predicate:** `integration` when the integration pin exists; `default` when it does not. **Never both.** Both pins naming the same branch ⇒ the integration pin is redundant, `default` is apply-capable, one-line notice.

**Apply Mode flow** (kaizen skill), with the two inserted steps in bold:

```
1 Collect  →  2 Group by Target  →  3 HITL menu  →  **3b Re-verify** (one probe per approved item;
   fail ⇒ superseded)  →  4 Apply per Kind  →  **4b Upstream report** (collect Kind: upstream ⇒ one file,
   flip to upstreamed)  →  5 Refresh digest (**5.0 normalize first**)  →  6 Stamp statuses
```

Collect gains one named terminal branch: **unparseable item** ⇒ listed in the pass report, left `pending`, one-line note appended (KZ-004 — the fall-through is named, not implied).

## 4. Extended Directory Structure

```
docs/specs/
├── kaizen/
│   ├── <safe-spec-slug>.md              (unchanged — entry files; Status vocabulary +2, Kind +1)
│   ├── upstream-<YYYY-MM-DD>[-N].md     NEW — one per apply pass that collected ≥1 upstream item;
│   │                                     written only on the apply-capable branch; never by a spec branch
│   └── README.md                        (scaffold — never an entry file, never an upstream report)
└── kaizen-log.md                        (unchanged path/columns — created on the first apply pass on the
                                          apply-capable branch; normalized before every refresh)
```

Root `AGENTS.md` / `CLAUDE.md` constitution summary:

```
Default Branch: master
Integration Branch: qa-development-2026      NEW — optional, exactly one name, ≠ default, user-confirmed
```

## 5. Data Model — the entry-file contract, extended once

**Pending-item `Kind`** (kaizen skill table) gains one row:

| Kind | Origin |
|---|---|
| `upstream` | A Methodology lesson's proposed edit to the AKILI methodology repository, or the upstream half of a dual lesson. `Target` is the literal `methodology`; `Edit` is the proposed upstream text. Recorded by Standardize on any branch |

**Pending-item `Status`** gains two rows:

| Status | Meaning |
|---|---|
| `superseded (reason)` | The re-verify probe refuted the item's premise at apply time; closed without writing; the reason names what changed and, when known, which spec changed it |
| `upstreamed (date, report)` | Collected into the named upstream report; closed on the project side. Terminal for `upstream` items only |

Which statuses each site handles — stated at the site (FR-6, KZ-004):

| Site | Counts / applies / reports |
|---|---|
| Apply Mode step 1 Collect | works `pending`, `deferred`; lists unparseable |
| Apply Mode step 6 Stamp | writes `applied`, `rejected`, `deferred`, `superseded`, `upstreamed` |
| `/akili-archive` Step 6 item 7 | reports all five counts by name plus the upstream report path |
| `/akili-resume` footer | counts `pending`, `deferred` only |

**Upstream report** (defined once, in the kaizen skill's Apply Mode):

| Section | Content |
|---|---|
| Header | Project, apply-capable branch, date, methodology version installed, count |
| One row per item | Lesson ID · source entry file · severity · one-line root cause · proposed upstream edit (verbatim from the item) |
| Footer | The invocation the maintainer runs to intake it (`/akili-propose` with the report as context) — a recommendation, not automation |

## 6. API Design

Not applicable — no code interface. The "API" of this change is the **constitution pin contract**: two literal lines in a block every command already loads, read by string match, consumed only by the kaizen skill's Branch Context and by the three commands that today compare against `Default Branch:`.

## 7. Backend Module Design — Surface Table

Sites are named by section, never by line (KZ-005). Each row is one bounded edit; T-numbers are assigned in `tasks.md`.

| # | File | Section | Change |
|---|---|---|---|
| 1 | `.claude/skills/kaizen/SKILL.md` | Frontmatter `description:` | No new trigger phrase — Apply Mode invocations unchanged (the discovery field is untouched; verified against CS-3 of the predecessor) |
| 2 | 〃 | Activation Contract, Apply Mode paragraph | "runs only on the default branch" → "runs only on the apply-capable branch (Branch Context)"; the decline line names the pinned branch |
| 3 | 〃 | Philosophy → Engineering Mapping, dual-lesson bullet | Upstream half → `Kind: upstream` pending item |
| 4 | 〃 | Standardize, "Methodology lessons" bullet | "record the proposal and recommend upstreaming" → record a `Kind: upstream` item with the proposed edit; the report still presents it |
| 5 | 〃 | Standardize, Branch Context table | Two rows become three: spec / default-non-writing (when the integration pin exists) / apply-capable |
| 6 | 〃 | Record, `Kind` and `Status` tables | +`upstream`; +`superseded`, +`upstreamed` (§5 text) |
| 7 | 〃 | Apply Mode, opening paragraph + step 1 | Reachability rewritten; Collect names the unparseable terminal branch |
| 8 | 〃 | Apply Mode, new step 3b **Re-verify** | One probe per approved item; bounded (NFR-5); outcomes: proceed / `superseded (reason)` / **unverifiable ⇒ user decides**; never escalates into investigation |
| 9 | 〃 | Apply Mode, new step 4b **Upstream report** | Collect `upstream` items, write `upstream-<date>[-N].md`, flip to `upstreamed`; no digest rows |
| 10 | 〃 | Apply Mode, step 5 | New 5.0 **normalize** (dedupe by ID, re-enforce cap) before 5.1; "create if absent" now reads "on the apply-capable branch" |
| 11 | 〃 | Hard Rules › Branch Context | Third context, integration pin as sole source, exclusive apply-capable predicate, same-name redundancy notice |
| 12 | 〃 | Hard Rules › Writable set | Rows: spec **or default-when-integration-pinned** / apply-capable |
| 13 | 〃 | Hard Rules › Standing rules | "one writer: Apply Mode, on the default branch" → "on the apply-capable branch"; consumers' rule unchanged |
| 14 | `.claude/commands/akili-archive.md` | Step 3 branch gate paragraph | Compare against **both** pins per the skill's apply-capable predicate; wording cites the predicate by name |
| 15 | 〃 | Step 4.3 | Methodology lessons → `upstream` item (one clause) |
| 16 | 〃 | Step 4.4 offer + spec-branch note | Offer fires on the apply-capable branch; the note names the pinned branch |
| 17 | 〃 | Step 6 item 7 | Five states by name + upstream report path |
| 18 | 〃 | Error Handling, writable-set bullet | Default-when-integration-pinned row |
| 19 | `.claude/commands/akili-resume.md` | Kaizen footer paragraph + example line | Count filter stated (`pending`, `deferred` only); "on the default branch" → "on `<pinned name>`" |
| 20 | `.claude/commands/akili-constitution.md` | Step 8, after the `Default Branch:` bullet | New bullet: optional `Integration Branch:` pin — detection is a question to the user (never git), confirmation with the assertion sentence, when to set / not set, single name, ≠ default; Safe Update adds pin + rewrites the adjacent discipline sentence + says the persona-drift line (FR-1) |
| 21 | 〃 | Step 8, write-discipline bullet | "applied on the default branch" → apply-capable wording |
| 22 | `.claude/templates/leader.md`, `implementer.md` | Write-discipline guardrail paragraph | Same one-phrase substitution |
| 23 | `AGENTS.md`, `CLAUDE.md` (this repo) | Kaizen Loop bullet | Apply phase sentence in apply-capable terms |
| 24 | `docs/commands/akili-archive.md`, `akili-resume.md`, `akili-constitution.md`; `docs/skills/kaizen.md`; `docs/skills/README.md` row; `docs/README.md`; `docs/flow.md` (artifact table row + §8 Kaizen Loop); `README.md` (Kaizen diagram + Apply bullet) | Sentences asserting where apply runs | Apply-capable wording; the FR-8 sanctioned-hit list is the closure set |
| 25 | `CHANGELOG.md` | Unreleased | Added / Changed entries; classification per user decision |

Consumer commands `/akili-propose`, `/akili-specify`, `/akili-execute`: **no row** — their kaizen read is untouched (NFR-1); a diff there is a defect of this spec.

## 8. Frontend / UX Component Architecture

Not applicable.

## 9. Shared Contracts

| Contract | Before | After |
|---|---|---|
| Constitution pin block | `Default Branch: <name>` | + optional `Integration Branch: <name>` (single, ≠ default) |
| Branch Context values | `default`, `spec` | `default`, `integration`, `spec` + the `apply-capable` predicate |
| `Kind` | 5 values | 6 (`upstream`) |
| `Status` | 4 values | 6 (`superseded`, `upstreamed`) |
| Digest (`kaizen-log.md`) | path, columns, cap | unchanged; writer moves to the apply-capable branch; normalized before refresh |
| New artifact | — | `docs/specs/kaizen/upstream-<date>[-N].md` |

## 10. Design Decisions

### DD-1 — A second pin of the same shape, read from the same block (extends predecessor DD-1)
The predecessor chose "pin first, procedure second" so commands compare one string they already loaded. An integration branch is declared the same way — one literal line — and consumed by the same three comparison sites. Rejected: a git-derived heuristic for "the integration branch" (name lists like `develop`/`staging`, merge-history inference): every candidate resolves the wrong branch in some real repo, and the evidence project itself has `staging`, `qa-development-2026`, and `master` all live. **Only the user knows which branch integrates.** (KZ-001: the predecessor's design was read past DD-1 — DD-7 forbids migration steps, honored here.)

### DD-2 — Exclusive writer, chosen by the pin: `integration` if pinned, else `default` (reversion challenge)
The proposal's union rule would have made a hotfix archive on `master` apply live (Step 3 syncs and the Step 4.4 offer fire automatically there today) while `develop` applied its own backlog — divergent persona edits merged textually, `ADR-MMM` allocated twice, the digest bootstrapped on both sides. The invariant `branch-safe-kaizen` bought was *one writer*, not *the default branch*. With the pin present the default branch is demoted to a non-writing context; it records pending exactly like a spec branch and names the integration branch. Rejected: keeping the union and adding merge-time reconciliation — that is the textual-merge failure with extra steps.

### DD-3 — Re-verify is one probe, never an investigation (NFR-5)
`KZ-STC-2` showed a one-day-old item turning false. The fix is a check *at the moment of writing*, and the cheapest check that can refute an item is one grep or existence test for the fact the `Edit` names. A probe that cannot be phrased as one check makes the item **unverifiable** and hands the decision to the user — Apply Mode never reads the spec, the archive, or the codebase beyond that fact. Rejected: linking pivots to dependent pending items at pivot time (a cross-file index no branch-safe write can maintain) and a full factual sweep per item (unbounded; the archive already owns that sweep at its own gate).

### DD-4 — `superseded` is a terminal status with a reason; `upstreamed` is terminal for `upstream` items only
Both close an item visibly. `superseded` carries *why*, so the next reader does not re-propose it (the same reason `rejected` carries one). `upstreamed` records the report path, so the hand-off is traceable from the entry file. The proposal's open question (`upstreamed` vs `handed-off`) is resolved as `upstreamed`: the status describes the project-side act, which is complete; intake on this repository's side is a separate, human act and is named in the report footer, not pretended by the status.

### DD-5 — The upstream report is a per-pass file, and `upstream` items add no digest rows
A per-pass file named by date is conflict-free by construction (same mechanism as `audits/drift-<date>`) and can only be written on the apply-capable branch — the same single-writer rule as the digest, so two same-day reports on two branches cannot occur (challenge item 4). `upstream` items do not enter `## Active Lessons`: the digest is what the project's own agents read to change *their* behavior, and a lesson about the methodology cannot be acted on locally. Recurrence of a Methodology lesson stays visible through the entry files' existing recurrence feed. Rejected: appending to one `upstream.md` (a shared file appended from every pass — the append-anchor conflict class the predecessor removed for the log).

### DD-6 — Digest self-normalizes before every refresh
The exclusive writer closes the *creation* path for a duplicated digest, but a digest can still arrive damaged: a hand edit, or a project that merged two digests before adopting the pin. Step 5.0 dedupes rows by `ID` and re-runs the existing retirement rule so the next apply pass heals it instead of growing past the cap. One rule, applied idempotently; no migration.

### DD-7 — Safe Update rewrites the discipline sentence it wrote, and says what it cannot rewrite
Adding `Integration Branch:` beside a summary sentence that still says "applied on the default branch" would ship a self-contradicting constitution. The sentence is methodology text the constitution wrote, so Safe Update may rewrite it (it is not user content); deployed `.agents/*` personas are user-owned copies (Safe Update never overwrites customized personas — existing contract), so the command says in one line that they keep the old phrase and will register as persona drift on the next `/akili-audit` (the predecessor's known W-1 interaction). Rejected: silently leaving both texts, or overwriting personas.

### DD-8 — Unparseable items are a named terminal branch of Collect (KZ-004)
The evidence corpus carries five template generations, YAML pending blocks, and status strings like `pending (methodology — not applicable)`. A collector that "scans for `Status: pending`" falls through silently on all of them. Collect therefore names the branch: report file + position, leave `pending`, append one note, never half-apply. The known-failing input (a YAML pending block from `changes--delete-result-action.md` in the evidence project) is the regression check for the walkthrough.

### DD-9 — No new trigger, no new command, no installer change
Apply Mode's invocation phrases are unchanged (the skill's `description:` field — the discovery surface — is not edited). The `AGENTS.md` rule "no separate kaizen command" holds. All behavior is skill and command text (NFR-3).

### DD-10 — The coherence gate is a phrase grep plus a union-semantics grep (KZ-006, KZ-002)
Two greps, both required: the FR-8 phrase grep for surviving "only on the default branch" assertions, and the FR-2 union-semantics grep for surviving "default ∪ integration" wording — the second exists because the reversion challenge proved the first cannot see it. Each has a named pre-fix falsifier (the Apply Mode opening line; this spec's own pre-amendment FR-2).

## 11. Reversion Challenge (Step 2.3) — outcomes

| # | Breakage examined | Verdict | Closed by |
|---|---|---|---|
| 1 | Divergent shared-file edits on two writer branches, merged textually | **Real gap** in the proposal's union rule | DD-2 (exclusive writer), FR-2 hotfix scenario |
| 1b | Two developers applying on the same integration branch from separate clones | Holds — serialized by the remote, identical to today's `main` exposure | NFR-6 |
| 2 | Digest created/edited on both branches; cap retirement diverges | Real gap under the union | DD-2 + DD-6 (normalize) |
| 3 | Duplicate `ADR-MMM` from two apply-capable branches | Real gap under the union | DD-2 (default branch stops allocating when pinned) |
| 4 | Status double-apply after merge; same-day upstream report collision | Holds under the exclusive rule | DD-2, DD-5 |
| 5 | `/akili-audit` `[-<safe-branch>]` suffix on an integration branch; other commands' branch tests | Holds — extra suffix never collides; execute/specify/propose/quick have no branch test | Recorded, requirements §4 |
| 6 | Root guides and personas already deployed with "applied on the default branch" | Real gap | DD-7, FR-1 |
| — | Accepted residual: hotfix branches off the default branch do not see integration-branch standardizations until the release merge | Accepted | NFR-7 |

## 12. Budget (Step 2.4 — tripwire for `/akili-execute`)

| Metric | Expected |
|---|---|
| Tasks | **6** |
| Changed/added lines | **~230** across 25 surface rows (prose; no code) — skill ~110, archive ~35, constitution ~25, resume ~8, templates ~2, root/mirror docs ~40, CHANGELOG ~10 |
| Review rounds | **1 per task** — trip on the second FAIL of any one task |

Depth re-check: **Standard holds.** Twenty-five surface rows and one extended cross-command concept is not Lite; no data/API/auth risk pushes it to Full. The predecessor shipped 17 surfaces at ~260 lines in 6 tasks — this design is the same shape with a smaller skill delta (the two-phase contract already exists; this spec edits its parameters).
