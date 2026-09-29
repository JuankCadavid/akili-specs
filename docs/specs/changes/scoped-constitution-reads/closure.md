# Closure: Scope the Worker Personas' Constitution Read

T4 evidence — the CHANGELOG entry, the literal walk, the cross-read, and the sweeps. Read alongside `tasks.md` → T4 and `design.md` §8 (DD-9), §7.

## 1. P-14 — settled

**Question:** does the vendor's prompt-caching documentation say anything about cache sharing between separate requests?

| Field | Value |
|---|---|
| Source | Anthropic prompt-caching docs, `https://platform.claude.com/docs/en/build-with-claude/prompt-caching` (redirected from `https://docs.claude.com/en/docs/build-with-claude/prompt-caching`) |
| Date read | 2026-09-29 |
| Relied-on sentences | *"Organization and workspace isolation: Caches are isolated between organizations. Different organizations never share caches, even if they use identical prompts."* *"Exact matching: Cache hits require 100% identical prompt segments, including all text and images up to and including the block marked with cache control."* |
| Reading | Two independent workers with different briefs have different prompt prefixes; a cache hit needs a byte-identical prefix up to the cache-control marker, so sibling workers do not share a cache entry unless their prefixes are identical up to that point. This confirms the direction of P-14's reasoned (`UNVERIFIED`) claim without measuring AKILI's own workers |
| Effect on the entry | None. Per DD-9 row 7, the entry carries no sentence about cache behavior across workers, whatever this reading found — this settles P-14 as a fact for the record, without adding a clause to the shipped entry |

## 2. CHANGELOG entry

Written at `CHANGELOG.md` → `Unreleased` → `### Changed` (one bullet). Full text:

> **Implementer and Tester personas now read reference documents by section instead of whole, and the cross-worker caching claim is removed (`changes/scoped-constitution-reads`).** Both personas' item 1 first bullet — previously, byte-identical in both files: *"To maximize prompt caching, **FIRST** consult the project constitution (`CLAUDE.md`, `AGENTS.md`, `docs/trd/trd.md`, `docs/ux-ui/design.md`) in a consistent order before reading task-specific files."* — now reads the project's root guides (`CLAUDE.md`, `AGENTS.md`) whole, skipping one the project does not have, and reads each reference document (the TRD at `docs/trd/trd.md`, the UX/UI design at `docs/ux-ui/design.md`, legacy paths included) only at the sections the brief names, verbatim at the source, through a stated six-state table — sections named, `none`, the entry silent, a stale or ambiguous heading, the document absent from the project, or the work touching the document's domain anyway — so every state the entry can be in has an action and a lookup note is never mistaken for a gap. `/akili-execute` (the Implementer brief, Step 2.2) and `/akili-test` (the Tester's context slice, Phase 1) both now require the same per-document entry — named sections or the word `none`; an omitted entry is not a valid empty state — and record a worker's lookup note in a slot each report already has (`/akili-execute`'s task-entry `issues encountered`; `/akili-test`'s Summary). **Nothing updates a deployed persona automatically:** for a project scaffolded before this change, `/akili-constitution`'s Safe Update never overwrites an existing `.agents/*.md` file, only appends an upgrade block, so a maintainer of such a project must replace the quoted sentence above by hand in both `.agents/implementer.md` and `.agents/tester.md`. Until they do, `/akili-audit` reports the surviving sentence in `tester.md` as persona injection bleed — it still carries the design-token path the Tester disclaims — but does not report the surviving sentence in `implementer.md` as stale; there, only the new rule's absence is reported, under the structural-drift check. Measured on one project's (STAR) document sizes, not on token telemetry: the expected upfront load for a brief naming two to four sections is a computed **range**, not a fixed saving — about 8,338–13,668 tokens (root guides at 31,710 bytes, plus two to four named sections of 822–5,740 bytes each, at 4 bytes per token), down from about 28,037 tokens for the old four-document read (112,149 bytes ÷ 4).

The placeholder line under `### Notes` (*"No unreleased changes yet."*) is removed; the section now reads `### Changed`.

### 2a. Range arithmetic (computed, not copied)

| Component | Bytes | ÷ 4 (tokens) |
|---|---|---|
| Root guides | 31,710 | 7,927.5 |
| + 2 sections (minimum, 822 B each) | 1,644 | 411 |
| **Low end** | 33,354 | **8,338.5 → 8,338–8,339** |
| + 4 sections (maximum, 5,740 B each) | 22,960 | 5,740 |
| **High end** | 54,670 | **13,667.5 → 13,667–13,668** |
| Old four-document read (context) | 112,149 | 28,037.25 → **~28,037** |

Sources: `requirements.md` NFR-4 (root guides 31,710 B), `requirements.md` §4 (STAR total 112,149 B; sections 822–5,740 B each).

### 2b. DD-9 row → entry clause table

| # | DD-9 content | Entry clause |
|---|---|---|
| 1 | The new read rule, one sentence | *"now reads the project's root guides … whole … and reads each reference document … only at the sections the brief names, verbatim at the source, through a stated six-state table"* |
| 2 | Both commands by name | *"`/akili-execute` (the Implementer brief, Step 2.2) and `/akili-test` (the Tester's context slice, Phase 1)"* |
| 3 | The sentence to replace, quoted | The italicized quotation, byte-identical to `3b66e40` (see §2c) |
| 4 | Safe Update appends, does not replace | *"Safe Update never overwrites an existing `.agents/*.md` file, only appends an upgrade block"* |
| 5 | What `/akili-audit` reports, per persona | *"reports the surviving sentence in `tester.md` as persona injection bleed … does not report the surviving sentence in `implementer.md` as stale; there, only the new rule's absence is reported"* |
| 6 | Expected reduction as a labeled range | *"a computed **range**, not a fixed saving — about 8,338–13,668 tokens … down from about 28,037 tokens"*, labeled *"Measured on one project's (STAR) document sizes, not on token telemetry"* |
| 7 | No fixed figure; silent on cross-worker cache behavior | Range stated, not a fixed figure; the entry carries no sentence, closing or otherwise, about cache behavior across workers — silence is the absence of such a sentence, not a sentence asserting it |

### 2c. Byte-identity check on the quoted old sentence

`git show 3b66e40:.claude/templates/implementer.md` and `…tester.md`, item 1 first bullet, both read:

> To maximize prompt caching, **FIRST** consult the project constitution (`CLAUDE.md`, `AGENTS.md`, `docs/trd/trd.md`, `docs/ux-ui/design.md`) in a consistent order before reading task-specific files.

Identical in both files at `3b66e40`. The CHANGELOG entry's quotation matches this string exactly.

## 3. Literal walk

Read as a literal-minded agent would, against the **shipped** (working-tree) text: `.claude/templates/implementer.md` item 1 (lines 13–25), `.claude/templates/tester.md` item 1 (lines 13–25), `.claude/commands/akili-execute.md` Step 2.2 (the *constitution by reference* bullet), Step 3 entry field list. Each case judged by the rule's **general sentence** — the state table plus its order-of-evaluation clause — never by hunting for a citation matching the case's own wording (none exists for H1–H3; they are held out).

### 3a. Generic walk, S1–S6, per persona

| State | Implementer (shipped) | Matches DD-3? | Tester (shipped) | Matches DD-3? |
|---|---|---|---|---|
| S1 | Read them | Yes | Read them, verbatim at the source | Yes |
| S2 | Read nothing, unless S6 | Yes | Read nothing, unless S6 | Yes |
| S3 | Resolve path (default, then legacy); section lookup for what task touches; note that the brief named none | Yes | Read nothing, unless S6 | Yes (deliberate asymmetry, FR-3) |
| S4 | Heading absent → lookup, note stale name; >1 match → read each, note | Yes | Heading absent → lookup, note stale name; >1 match → read each, note | Yes |
| S5 | Skip; no note | Yes | Skip; no note | Yes |
| S6 | Resolve path (default, then legacy); lookup before writing that code; note it | Yes | Lookup only when a scenario in the slice cites the document; note it | Yes |

Order of evaluation, both personas: (1) S5 first, after path resolution — absent only when entry path, default path, and legacy path all fail; (2) otherwise act on the matching row; (3) S6 at any later point, never in S5. Both shipped texts state this in those three numbered clauses. The original walk found no divergence from `design.md` DD-3 in any of the 12 cells; that walk and DD-3's own S3 Implementer cell shared the same dropped clause, and validation later found the defect the comparison missed (`validation-report.md` F-1, F-2), which the Leader corrected in both the shipped row and DD-3's S3 Implementer cell (`design.md` §12). Re-walked here against the corrected text, all 12 cells match `design.md` DD-3 as amended, with no divergence.

### 3b. The five specified cases

| Case | Setup | Expected (design.md DD-3, §7) | Observed (walked against shipped text) | Match? |
|---|---|---|---|---|
| H1 (held out) | Implementer. Brief names two TRD sections, silent on UX/UI. Backend task | TRD: S1, read both. Design: S3, path resolved, lookup finds nothing the task touches, reads nothing further, note in Task Completed. No `Not Done/Assumptions` | TRD entry names sections → S1, read both at source. Design entry silent → S3: resolve path (succeeds at default or legacy), section lookup for what a backend task touches finds no matching heading (DD-2: no-match ends the lookup, reads nothing further); the corrected S3 row has the worker note that the brief named none, recorded as a trailing clause in **Task Completed** per the shipped rule's explicit instruction; the same rule states the note is "never a reason to write `Not Done / Assumptions`" | Match |
| H2 (held out) | Implementer. `AGENTS.md` only; design at `docs/system-design/design.md` (legacy). Brief silent. Task changes a visible component | Missing root guide skipped. Default path fails, legacy path found, so **not** S5. S3: lookup, tokens read, note | `CLAUDE.md` skipped per "skip a root guide the project does not have." Design entry silent → S3. Path resolution: default `docs/ux-ui/design.md` fails, legacy `docs/system-design/design.md` succeeds → not S5 (order-of-evaluation rule 1 requires entry-path **and** default **and** legacy to all fail; legacy succeeds). Section lookup for what a visible-component task touches finds the design-token section, reads it, and — per the corrected S3 row's own text — notes "that the brief named none" | Match |
| H3 (held out) | Tester. Slice says `none` for both. One scenario cites a TRD section | S2, then S6: lookup at the cited section; one note line ahead of the status block | Both entries `none` → S2, read nothing, unless S6. A slice scenario cites a TRD section → S6 fires for the TRD ("Section lookup only when a scenario in the slice cites the document"): lookup at the cited section, note it. Placement: "Put it as one line ahead of the status block" | Match |
| S5 then S6 | Implementer. No design document at any path. Task touches UI | S5. S6 does not fire. No note | No entry path, default, or legacy path resolves → S5 fires first (order-of-evaluation rule 1: "S5 first, after path resolution — absent only when the entry's path, the default path, and the legacy path all fail"). Rule 3 states, verbatim, "S6 at any later point in the task, never in S5" — so a UI-touching task cannot invoke S6 while the entry sits in S5; the S5 row's own action, "Skip; no note," stands unmodified. (The shipped rule states no reasoning clause beyond this; the "nothing to look up" rationale in the Expected column is `design.md`'s own gloss, not shipped text, and is not quoted here) | Match |
| Non-host | Leader briefing a non-host Implementer, walked against `akili-execute.md` | Sections copied; entry settled to S1 or S2; the stop-and-report instruction present | Step 2.2: "the named sections, copied, stand in for reading them at the source"; "you settle the entry to named sections or `none` yourself before writing the brief"; "the brief adds a single instruction: stop and report" | Match |

No case's observed outcome diverged from its Expected column. H1 and H2 are re-walked in this attempt against the corrected S3 row (`.claude/templates/implementer.md`, "note that the brief named none"): H1's note now explicitly carries that clause alongside the no-match report; H2's outcome, which `validation-report.md` §8 found unsupported by the pre-correction shipped text (F-2), is now literally true of the shipped row and the quote above is drawn from it directly.

### 3c. Executed falsifier

On a scratch copy (`/private/tmp/.../scratchpad/t4/implementer-mutated.md`, never the working tree), every legacy-path mention was stripped from item 1: the TRD/UX-UI parenthetical legacy paths, both "Resolve the path (default, then legacy)" instances (→ "default only"), and the order-of-evaluation clause ("the entry's path, the default path, and the legacy path all fail" → "the entry's path and the default path fail").

Re-walking **H2** against the mutated copy: default path `docs/ux-ui/design.md` still fails; with no legacy path to try, order-of-evaluation rule (1) is satisfied (entry path absent, default path fails, and there is no third leg to check) — the document is concluded **absent**. Outcome moves from **S3** (lookup, tokens read, note) to **S5, "Skip; no note"** — exactly the required movement. The walk is not an inert fixture: removing the legacy path is what keeps H2 out of S5 in the shipped text, and the mutation demonstrates that dependency. Scratch copy discarded after the observation (not committed, not left in the repo).

## 4. Cross-read

| Concept | `/akili-execute` | `/akili-test` | `implementer.md` | `tester.md` | Agreement |
|---|---|---|---|---|---|
| `none` | "the sections … or the word `none`" | "the path the project uses (the Leader resolves it, legacy paths included) and the named sections, or the word `none`" | S2: read nothing, unless S6 | S2: read nothing, unless S6 | All four agree: `none` = read nothing from that document unless S6 later fires |
| Silence / omitted entry | "an omitted entry is not a valid empty state" (forbidden to write) | "An omitted entry is not a valid empty state" (same wording) | S3: resolve path, lookup for what the task touches, note that the brief named none | S3: read nothing, unless S6 | Both commands agree the Leader must never omit the entry. Both personas still define an action for the state should one arrive (older brief, etc.), and the actions differ by design (FR-3: "The S3 difference between the two workers is deliberate") — not a disagreement, a stated asymmetry |
| Stale section name | Not mentioned (`grep -n -i stale` → 0 hits on the concept; the file's other "stale" hits are the unrelated CodeGraph/model-registry staleness rules) | Not mentioned (same) | S4: "Heading absent: section lookup for the intended one, note the stale name. More than one match: read each, note it" | Identical wording to Implementer's S4 row | Neither command addresses S4 at all — it is owned entirely by the personas, and the two personas use byte-identical wording. No contradiction: the commands are silent, not disagreeing |

## 5. Mirror sweep

```
grep -n -i "paths only\|by reference\|reference document\|lookup note\|issues encountered" docs/commands/akili-execute.md docs/commands/akili-test.md
```

**0 hits.** Neither `docs/commands/` mirror restates any of the five edited sentences (the two brief bullets, the Step 3 field-list clause, the Phase 1 slice item, the Phase 4 Summary clause). Recorded as zero per scope item 5; no `docs/commands/` edit is owed, and none was made.

## 6. Summary-surface check (KZ-002)

Every clause of the CHANGELOG entry checked against the shipped text it describes — see §2b's row-by-row table for the seven DD-9 clauses, plus:

| Entry clause | Checked against |
|---|---|
| "an omitted entry is not a valid empty state" | `akili-execute.md` (T2 check 4 = 1), `akili-test.md` (T3 check 1 = 1) |
| "record a worker's lookup note … `issues encountered` … Summary" | `akili-execute.md:359`, `akili-test.md` Phase 4 sentence (both read at source, §2 above) |
| Byte-identical quotation of the old sentence | `git show 3b66e40` on both files (§2c) |
| "Safe Update never overwrites … only appends" | `akili-constitution.md:424` (read at source) |
| "`/akili-audit` reports … `tester.md` … persona injection bleed" | `akili-audit.md:55` (read at source) |
| "does not report … `implementer.md` … as stale; only the new rule's absence" | `akili-audit.md:60`, clause (c) (read at source: reports what the deployed persona **lacks**, never that surviving old content is stale) |
| Range arithmetic | §2a above, recomputed independently from `requirements.md` NFR-4 and §4 |

No clause was found unsupported by the shipped text or by a primary source read directly.

## 7. Verification checks (final tree)

| # | Check | Result |
|---|---|---|
| 1 | `grep -c "No unreleased changes yet" CHANGELOG.md` | `0` (required 0; B12 = 1) |
| 2 | `grep -c "consult the project constitution" CHANGELOG.md` | `1` (required ≥1; B14 = 0) |
| 3 | T1 checks 1–9, T2 checks 1–5, T3 checks 1–3 re-run | All pass — see §7a |
| 4 | `git diff --stat 3b66e40` | Lists exactly `CHANGELOG.md`, `.claude/templates/implementer.md`, `.claude/templates/tester.md`, `.claude/commands/akili-execute.md`, `.claude/commands/akili-test.md`, plus `docs/specs/changes/**` (including the sibling `changes/review-intensity-trial-terms/proposal.md`, itself under the allowed `docs/specs/changes/**` glob). No frozen path appears |
| 4b | `git status --porcelain` | ` M CHANGELOG.md` at the time of the check (before `closure.md` was written); `closure.md` is untracked until the Leader commits, per the note in the work order |
| 5 | `shasum -a 256 .claude/templates/reviewer.md .claude/templates/leader.md` | `e93dafb8633a3e09d3d7…` / `a5f0bbf7e5de5f3901d3…` — matches B10 exactly |
| 6 | `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` | All exit 0 |

### 7a. Re-run detail

**T1** (checks 1–9; check 10 and 11 also re-run for completeness):
1. `consult the project constitution` in both personas → 0/0. 2. `-i caching` → 0/0. 3. `Context & Skills` → 1/1. 4. `ux-ui`/`trd` in `tester.md` → 0/0. 5. `system-design\|detailed-design` in `implementer.md` → 1. 6. `-i "section lookup"` → 4/3 (≥1/1). 7. `S1`..`S6` present ≥1 in each persona (counts 1/1, 1/1, 1/1, 1/1, 2/2, 3/4). 8. `wc -c`: `implementer.md` 10,654 (≤10,805; grown from 10,631 by the reopened T1's S3-cell correction); `tester.md` 8,867 (≤8,951). 9. `\.md:[0-9]+` → 0/0. 10. No `Grep|Glob|Bash|Read tool` in added lines. 11. `git diff --stat 3b66e40` for `.claude/templates` lists exactly the two persona files; shasum matches B10.

**T2** (checks 1–5; 6–7 also re-run): 1. `paths only` → 0. 2. `caching-friendly` → 0. 3. `` and `trd.md` — path `` → 0. 4. `not a valid empty state` → 1. 5. `-i "lookup note"` → 1. 6. `^- \*\*\([a-e]\) ` → 5 (unchanged). 7. diffstat lists `akili-execute.md` only.

**T3** (checks 1–3; 4–5 also re-run): 1. `not a valid empty state` → 1. 2. `-i "lookup note"` → 1. 3. `-i "reference document"` → 1. 4. `git diff 3b66e40 -- akili-test.md` carries no hunk touching `## UX Testing Guidance` or the *Token discipline* block (confirmed by reading the diff: the two hunks are Phase 1 item 2 and the Phase 4 Summary sentence only). 5. diffstat lists `akili-test.md` only.

No check diverged from its required value.

## 8. Success Criteria (proposal.md §13)

| # | Criterion | Evaluation | Evidence |
|---|---|---|---|
| 1 | Personas no longer instruct an unconditional full read of the two reference documents | **Met** | T1 checks 1, 2, 4, 5 (§7a); item 1 read whole in both files (§3a) |
| 2 | `/akili-execute`'s brief lists require the task's TRD/design sections | **Met** | T2 checks 4, 5; Step 2.2 bullet text (§3b, Non-host row and H1/H2 walks) |
| 3 | The fallback for a section-less brief is stated and unambiguous when walked literally | **Met** | §3, all 12 generic states and all 5 named cases walked with no divergence from `design.md` DD-3; executed falsifier (§3c) shows the walk is sensitive to the rule's actual content, not an inert fixture |
| 4 | Upfront load on STAR drops from ~29k tokens to **under ~12k** (proposal wording) | **Not met, as literally worded — reported plainly, not adjusted.** Computed range is **8,338–13,668 tokens**; the high end (13,668) exceeds the proposal's "under ~12k" ceiling by about 1,668 tokens. `requirements.md` §2 finding 3 / FR-8 already supersede the proposal's ceiling with a range, "~9k–13k tokens" — my computed range (8,338–13,668) is close to that restated range but not identical: about 662 tokens under its stated low end (9,000 − 8,338 = 662) and about 668 tokens over its stated high end (13,668 − 13,000 = 668). The CHANGELOG entry states the range I computed (§2a), not either prior figure | §2a arithmetic; `requirements.md` §2 finding 3, NFR-4, §4 |
| 5 | No regression in Reviewer FAILs citing constitution/design-token violations over the next two specs | **Not evaluable in this spec** (`requirements.md` §8: "It is only observable over later specs. Recorded for the Kaizen retrospective of the next two specs. It is not a validation gate for this one") | — |

## 9. Disqualifier conditions (as read, tasks.md T4)

- *"void if a case was judged by finding its own citation in the text and not by the general sentence"* — not triggered: H1/H2/H3 are not named anywhere in the shipped text; each was judged by applying the six-state table and its order-of-evaluation clause to the setup, not by searching for matching prose.
- *"if a held-out case turns out to be cited by the shipped text"* — not triggered: confirmed by reading item 1 in full in both personas; no scenario resembling H1, H2, or H3 is spelled out there.
- *"if an expected outcome above was adjusted to match what the text does"* — not triggered: all five Expected-column entries are copied verbatim from `tasks.md`'s own table; none was edited during this task. All five and all twelve generic-state cells matched their expected outcome as written.
- *"A CHANGELOG entry that states a fixed saving … contradicts FR-8 and DD-9"* — not triggered: the entry states a range and calls it a range, not a fixed figure.
- *"…or that says `/akili-audit` reports nothing"* — not triggered: the entry states what `/akili-audit` does report, per persona (§2b row 5).
- *"Check 6 proves the package installs; it proves nothing about the rule"* — noted: §7's check 6 is evidence of packaging only, not of the walk's correctness, which rests on §3 and §3c.

## 10. Frozen findings from T1–T3 (observed, not fixed)

The original T4 walk found no defect in the T1/T2/T3 shipped text: all 12 generic-state cells and all 5 named cases matched `design.md` DD-3/§7 as it stood then, and the cross-read (§4) found the S3 asymmetry between personas to be the deliberate one `requirements.md` names, not a contradiction. Validation later found a defect that walk had not: the shipped S3 Implementer row, and DD-3's own S3 Implementer cell, both dropped FR-3's clause requiring the report to state the brief named no section (`validation-report.md` F-1, F-2). The row and the DD-3 cell were corrected (`design.md` §12), and this walk (§3a, §4 above) is re-run against the corrected text with no remaining divergence. One defect is recorded here, closed by that correction — not frozen.
