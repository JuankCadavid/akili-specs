# T6 Fixture Walkthrough — Kaizen Loop Closure

Fixture: `/private/tmp/claude-501/-Users-jcadavid-Development-sdd-jc-methodology/defa4689-272d-4a8f-8e53-0e21c4cacfa4/scratchpad/t6/fixture` (throwaway git repo, never in the project repo). Branches: `master` (Default Branch pin), `qa-development-2026` (Integration Branch pin), `feat/x` (plain spec branch). `AGENTS.md` carries:

```
- Default Branch: master
- Integration Branch: qa-development-2026
```

`docs/specs/kaizen/` holds: `changes--entry-a.md` (3 pending incl. one `Kind: upstream` + 1 `superseded (reason)` + 2 `upstreamed (2026-09-17, .../upstream-2026-09-17.md)`), `changes--entry-b-yaml.md` (Pending Items as a YAML code block, mimicking `changes--delete-result-action.md`'s shape), `changes--entry-c.md` (a `guide-sync` item with a non-existent `Target`, and a `digest-update` item whose `Target` is `KZ-002`), and a scaffolded `README.md`.

Method: read only the shipped command/skill text quoted below; resolve each step against the fixture's literal values; never resolve from memory of the spec's intent.

---

## 1. Branch Context per branch

Source: `.claude/skills/kaizen/SKILL.md` Hard Rules › Branch Context, item 6: *"**Context value:** `integration` when the current branch equals the integration pin from step 5; else `default` when it equals the default branch resolved in steps 2–4; else `spec`."*

| Branch | Current branch (`git rev-parse --abbrev-ref HEAD`) | Resolution | Outcome |
|---|---|---|---|
| `qa-development-2026` | `qa-development-2026` | equals `Integration Branch:` pin | `integration` — **apply-capable** |
| `master` | `master` | equals `Default Branch:` pin, integration pin exists | `default` — **non-writing** (line 304: *"When the integration pin exists, a checkout of the default branch resolves to `default` and is **non-writing**"*) |
| `feat/x` | `feat/x` | matches neither pin | `spec` |

**Outcome: PASS** — matches the expected `integration`/`default`/`spec` triad exactly.

---

## 2. No-pin variants

**(a) Remove only `Integration Branch:`.** Per SKILL.md line 304: *"`integration` when the `Integration Branch:` pin exists; `default` when it does not."* With no integration pin, `master`'s context is `default` and — because no pin exists — `default` **is** the apply-capable branch (the non-writing clause is conditioned on *"when the integration pin exists"*, which is now false). Rules become byte-equivalent to a project that only ever pinned `Default Branch:` (FR-7 legacy path), because every non-writing clause in the skill and commands is gated on "while an `Integration Branch:` pin exists" — verified live against the fixture: `git symbolic-ref refs/remotes/origin/HEAD --short` fails (no remote) and the unique-`main`/`master` step is never reached because the pin already resolved `default` in step 2.

**Outcome: PASS.**

**(b) Remove both pins.** Simulated against the fixture:

```
$ git symbolic-ref refs/remotes/origin/HEAD --short
fatal: ref refs/remotes/origin/HEAD is not a symbolic ref   → step 3 fails, "fall through quietly" (SKILL.md line 295)
$ git branch --format='%(refname:short)' | grep -cE '^(main|master)$'
1   → step 4, "the unique main/master rule", decides: master
```

The deciding step is **step 4, the unique `main`/`master` rule** (SKILL.md line 296: *"if exactly one of `main` or `master` exists, that is the default branch"*) — step 3 (`origin/HEAD`) fell through with no result. `/akili-resume`'s footer: line 108, *"when neither pin exists, name it generically as 'the default branch' rather than a specific name."*

**Outcome: PASS** — deciding step named, footer wording confirmed.

---

## 3. Apply Mode Collect on `qa-development-2026`

Source: SKILL.md step 1, *"An item the collector cannot parse (an unknown `Status` encoding, a missing `Target`, a **non-table pending block**) is this step's own named outcome, not a fall-through: list it in the pass report by file and position, leave its `Status` as `pending`, append one one-line note to the item, and move on."*

Entry-filename lexical order (verified: `ls docs/specs/kaizen/*.md | sort`, README excluded per the skill's own scaffolding rule):

1. `changes--entry-a.md`
2. `changes--entry-b-yaml.md` ← YAML block, non-table pending block
3. `changes--entry-c.md`

`changes--entry-b-yaml.md`'s `P1` is a YAML fenced block, not a Markdown table — it matches "non-table pending block" verbatim. It is listed in the pass report as file `changes--entry-b-yaml.md`, position `P1`; `Status` stays `pending`; one one-line note is appended; it is never guessed at or half-applied.

**Outcome: PASS.**

---

## 4. Step 2 grouping — `upstream` exemption

Source: SKILL.md step 2, *"`upstream` items are exempt from all three — however many share the `methodology` target, and however their `Edit` text differs, every `upstream` item groups under `methodology` and is collected **whole**, unmerged, in step 4b."*

`changes--entry-a.md`'s `P2` (pending, `Kind: upstream`) is not run through Merge/Dedupe/Decide; it passes straight to step 4b's collection regardless of any other `upstream` item's `Edit` text.

**Outcome: PASS.**

---

## 5. Step 3b Re-verify

Source: SKILL.md step 3b: *"confirm the `Target` still exists at HEAD, then confirm the one specific fact the `Edit` names with one grep or existence check... Three outcomes only: the probe holds → proceed; the probe is refuted → `superseded (reason)`; the fact cannot be settled by a single check → present as **unverifiable**."* Exemption clause: *"`upstream` items are exempt from this probe: their `Target` is the literal `methodology`, not a path... they pass to step 4b unprobed."*

**(a) Missing-Target `guide-sync` item** (`changes--entry-c.md` P1, `Target: client/src/deleted-module/CLAUDE.md`): verified against the fixture —

```
$ ls client/src/deleted-module/CLAUDE.md
ls: client/src/deleted-module/CLAUDE.md: No such file or directory
```

The `Target` does not exist at HEAD → probe refuted → **`superseded (reason)`**, reason naming the missing path. **PASS**, quoted sentence above.

**(b) `upstream` item** (`changes--entry-a.md` P2): exempted per the quoted clause — passes to step 4b unprobed. **PASS.**

**(c) `digest-update` item with a `KZ-id` Target** (`changes--entry-c.md` P2, `Target: KZ-002`): here the shipped text disagrees with itself. Step 3b's generic instruction is *"confirm the `Target` still exists at HEAD"* — written with a file path in mind (the neighboring examples are all paths). The `Kind` table (line 193) defines `digest-update` as *"A recurrence of an existing lesson (phase 2) — `Target` is the `KZ-id`, **not a file**"*, and the Learn phase (line 85) says the recurrence check looks *"in the digest **or** in another entry file, under **either** ID grammar."* Verified against the fixture: no `docs/specs/kaizen-log.md` exists at all (`find . -iname kaizen-log.md` returns nothing), and `KZ-002` appears nowhere else in any entry file (`grep -rn "KZ-002" .` matches only the `Target` field itself). A literal reader following *only* step 3b's phrase has no instruction for **where** to look for a non-path `Target` — the digest, another entry file's lesson heading, or both — and the fixture is constructed so that neither search surface contains `KZ-002`, so the two candidate readings agree on *this* fixture's answer (not found either way) but would disagree in general (a `KZ-id` that exists as an entry-file lesson heading but has no digest yet — the normal state before the first-ever apply pass — would read "exists" under one clause and "does not exist" under the other).

**Outcome: INCONCLUSIVE.** Quoted disagreement: SKILL.md step 3b ("confirm the `Target` still exists at HEAD") vs. the `Kind` table + Learn-phase clause ("`Target` is the `KZ-id`, not a file" / "in the digest or in another entry file, under either ID grammar"). This is the forward pointer from the T1 Reviewer, confirmed live against the fixture, not resolved by the shipped text.

---

## 6. Step 4b Upstream report

Source: SKILL.md step 4b: *"Collect every approved `upstream` item into one file, `docs/specs/kaizen/upstream-<YYYY-MM-DD>[-N].md`... written only on the apply-capable branch."*

On `qa-development-2026` (apply-capable), approving `changes--entry-a.md` P2 (the pending `upstream` item) would collect it into a report; since `upstream-2026-09-17.md` already exists in the fixture (from a prior pass, referenced by P5/P6's `upstreamed (2026-09-17, .../upstream-2026-09-17.md)` status), the same-day-collision clause applies and the new report would be `upstream-2026-09-17-2.md`. Not written into the repo or literally re-run here (no live agent loop to execute) — described per the quoted step, consistent with the already-materialized illustrative report at `docs/specs/kaizen/upstream-2026-09-17.md` in the fixture.

**On `master` (pin present):** SKILL.md Activation Contract: *"Invoked anywhere else, it declines in one line naming the apply-capable branch — its pinned name when the `Integration Branch:` pin exists, otherwise the resolved default branch ('Apply Mode runs only on `<apply-capable branch>` — see Branch Context; the pending backlog stays recorded and is re-offered there')."* On `master`, this reads: *"Apply Mode runs only on `qa-development-2026` — see Branch Context; the pending backlog stays recorded and is re-offered there."* Apply Mode **declines**, naming `qa-development-2026`.

**Outcome: PASS.**

---

## 7. `/akili-resume` footer

Source: `.claude/commands/akili-resume.md` line 108: *"count every item whose `Status` is `pending` or `deferred` across all entry files — and only those two; explicitly exclude `applied`, `rejected`, `superseded`, and `upstreamed` items from the count."*

Computed against the **full three-file fixture** (the literal instruction: "across all entry files"): `changes--entry-a.md` P1/P2/P3 (3 pending) + `changes--entry-b-yaml.md` P1 (1 pending) + `changes--entry-c.md` P1/P2 (2 pending) = **6 pending**, 0 deferred. `superseded` (1, entry-a P4) and `upstreamed` (2, entry-a P5/P6) are excluded per the quoted clause — verified they are *not* in the 6.

Restricting to `changes--entry-a.md` alone (which is the file built to mirror FR-3's resume scenario exactly — *"GIVEN 3 `pending`, 1 `superseded`, 2 `upstreamed` items across entry files"*) the count is exactly **3**, matching the scenario's expected footer text, *"3 pending standardizations."* The discrepancy against the full-fixture total (6) is a fixture-composition artifact (entry-b/entry-c add pending items built for other steps), not an ambiguity in the shipped counting rule — the rule itself ("across all entry files", excluding four named statuses) is unambiguous and was applied literally both ways above.

Recommendation naming: line 108, *"recommend the exact Apply Mode invocation naming the apply-capable branch by its pinned name — the `Integration Branch:` pin... when it exists"* → **`qa-development-2026`**. With both pins removed: *"when neither pin exists, name it generically as 'the default branch'"* (already quoted in §2).

**Outcome: PASS** (count-rule literal application confirmed; the "= 3" figure holds for the FR-3-shaped sub-fixture `changes--entry-a.md`, and is reported alongside the honest full-fixture total of 6 rather than silently forced to 3).

---

## 8. `/akili-archive` Step 3 and Step 4.4 on `master` with the pin present

Source, branch gate (line 129): *"The default branch while an `Integration Branch:` pin exists is **not** apply-capable — it is held to the same non-writing rule as a spec branch."* Line 131: *"Off the apply-capable branch — a spec branch, or the default branch while an `Integration Branch:` pin holds — items 2–4 make no edit at all. Each records what it *would* have written as a typed pending item."* On `master`: items 2–4 record pending, no shared file is touched.

**No ADR allocated, no digest created:** consistent with the branch gate above and with the digest's single-writer rule (Standing rules: *"The digest has one writer: Apply Mode, on the apply-capable branch"*).

**Note names `qa-development-2026`:** line 169, *"the offer does not fire: say in one line that the recorded items await the apply phase on `<pinned apply-capable branch name>`, naming that branch by name rather than the phrase 'the default branch'."* → names `qa-development-2026`.

**Sub-clause check (forward pointer from the T2 Reviewer):** items 2, 3, and 4's own operative sentences are each scoped literally to *"On a spec branch:"* —
- item 2 (line 139): *"**On a spec branch:** determine the same edits, then record each one as a `guide-sync` pending item..."*
- item 3 (line 140): *"On a spec branch, each falsified claim becomes a `factual-sweep` pending item..."*
- item 4 (line 141): *"**On a spec branch:** record a `trd-adr` pending item carrying the superseding decision text... with **no ADR number of its own**..."*

`master` with the `Integration Branch:` pin present is, by the branch gate's own wording two paragraphs earlier, explicitly **not** a spec branch — it is "the default branch while an `Integration Branch:` pin holds." A literal reader who reads item 2/3/4's sentence in isolation (each says "On a spec branch:", not "off the apply-capable branch") has no textual instruction for what item 2, 3, or 4 does on `master`-with-pin specifically — the general branch-gate paragraph (line 129/131) says items 2–4 make no edit there, but the per-item operationalizing sentence that a reader executes step-by-step names only "a spec branch." The two levels of text (command-wide gate vs. per-item clause) can be read to disagree about which branches the per-item pending-recording behavior is written for.

**Outcome: INCONCLUSIVE** on the sub-clause reading (the top-level gate is unambiguous; the per-item operational sentences are not cross-referenced to it). Confirmed live: this is not resolved by re-reading the surrounding text more carefully — it requires the top-level paragraph's authority over the itemized "on a spec branch" phrasing to be stated, and it is not stated.

---

## 9. `/akili-constitution` Step 8 — FR-1 release-cadence scenario

Source (`.claude/commands/akili-constitution.md` Step 8):
- Line 358: *"**Detection is a question to the user, never inferred:** ask directly **whether** spec branches merge into one branch first, and that branch reaches the default branch on a release cadence. No heuristic resolves the `Integration Branch:` pin from a branch-name list or merge history — only the user knows which branch integrates."*
- Line 359: *"**When to set the `Integration Branch:` pin:** spec branches merge into **the named branch**, and that branch reaches the default branch on release cadence."*

Line 358's instruction is grammatically a yes/no question ("ask directly whether…") — it yields a boolean (do spec branches merge into one branch first, on a release cadence), not a branch name. Line 359 then refers to "the named branch" as if the name were already in hand, and the closing clause of 358 ("only the user knows which branch integrates") states *why* the name must come from the user without instructing the agent to ask for it explicitly. requirements.md's own scenario (§6 FR-1, *"THEN the user is offered `Integration Branch: develop`"*) presupposes the name `develop` is already known by the time the offer is made, but the shipped Step 8 bullet's literal text supplies only the yes/no gating question, not an explicit "ask for the branch's name" instruction.

**Outcome: INCONCLUSIVE** (forward pointer from the T4 Reviewer, confirmed) — the shipped bullet yields a yes/no determination of *whether* to offer the pin; it does not, on its own sentence, instruct eliciting the branch **name** as a separate explicit question. A literal agent following only line 358 could confirm "yes, spec branches merge into one branch" without a textual cue to then ask "which branch, by name?"

---

## Summary

| # | Step | Outcome |
|---|---|---|
| 1 | Branch Context ×3 | PASS |
| 2 | No-pin variants (a)/(b) | PASS |
| 3 | Apply Mode Collect — YAML unparseable branch | PASS |
| 4 | Step 2 grouping — upstream exemption | PASS |
| 5a | Re-verify — missing-Target guide-sync | PASS |
| 5b | Re-verify — upstream item unprobed | PASS |
| 5c | Re-verify — digest-update KZ-id Target | **INCONCLUSIVE** |
| 6 | Step 4b upstream report + decline on master | PASS |
| 7 | `/akili-resume` footer count + naming | PASS |
| 8 | `/akili-archive` Step 3/4.4 on master-with-pin | **INCONCLUSIVE** (sub-clause) |
| 9 | `/akili-constitution` Step 8 FR-1 scenario | **INCONCLUSIVE** |

**3 of 11 sub-steps are INCONCLUSIVE.** Per the task's disqualifiers, this is a FAIL for the spec's closure gate (grep-green plus any INCONCLUSIVE step is a FAIL, not absorbed into PASS), to be reported to the user rather than silently resolved by this walkthrough.

---

## Attempt 2 — Re-walk of the three formerly INCONCLUSIVE steps

Re-run against the working tree at commit `5c1b18c` (T7: "walkthrough closures — digest-update re-verify, per-item off-apply-capable clauses, pin name elicitation"), on the **same, unmodified** fixture. Method unchanged: quote only the shipped text, resolve against the fixture's literal values.

### (a) Step 3b re-verify — `digest-update` item, `KZ-id` Target, no digest file

New paragraph, SKILL.md (appended after the `upstream`-exemption sentence): *"For a `digest-update` item, the `Target` is a `KZ-id`, not a path: 'exists at HEAD' means a row with that ID in the `## Active Lessons` digest, or a lesson heading with that ID in any entry file under `docs/specs/kaizen/`; the fact probe is the item's recurrence claim (the source spec the item adds names a real entry file). An absent `docs/specs/kaizen-log.md` alone never supersedes it — the digest is created in the same pass."*

This closes the attempt-1 disagreement: the text now states one disjunctive existence test (digest row OR entry-file lesson heading) and one explicit non-cause (a missing digest file, by itself, is never grounds for supersession, because the digest is bootstrapped in the same pass). No second sentence contradicts this — **the ambiguity is resolved; outcome PASS on the text itself.**

Applying it to this fixture's concrete value: `changes--entry-c.md` P2's `Target` is `KZ-002`. Verified live:

```
$ find . -iname kaizen-log.md            → no digest file (as expected pre-apply)
$ grep -rn "^- \*\*KZ-" docs/specs/kaizen/*.md
docs/specs/kaizen/changes--entry-a.md:21: KZ-changes--entry-a-1
docs/specs/kaizen/changes--entry-b-yaml.md:15: KZ-changes--entry-b-yaml-1
```

Neither disjunct holds for `KZ-002` — no digest row (none exists) *and* no lesson heading anywhere reads `KZ-002` (the fixture's only two headings use the new `KZ-<safe-spec-slug>-<n>` grammar). The new sentence's exemption covers only the digest-absent half; it does not except a target absent from *both* locations. So the concrete, deterministic result on this fixture is `superseded (reason: KZ-002 matches no digest row and no entry-file lesson heading)`, **not** "proceeds" — this is a fixture-composition fact (my `KZ-002` value happens to be orphaned), not a residual textual defect. The Leader's stated expectation assumed a matching heading that this specific fixture value does not have; reporting the literal result rather than the expected one.

**Outcome: PASS** (the two-sentence disagreement from attempt 1 is closed — the text is now internally consistent and executable to one determinate answer on any input, including this fixture's own `superseded` result).

### (b) `/akili-archive` Step 3 items 2–4 on `master` with the pin present

New per-item openers (identical phrase, verbatim, in all three):

- Item 2: *"**Off the apply-capable branch** (a spec branch, or the default branch while an `Integration Branch:` pin exists)**:** determine the same edits, then record each one as a `guide-sync` pending item naming the guide and the exact lines. Create no guide, touch no index."*
- Item 3: *"**Off the apply-capable branch** (a spec branch, or the default branch while an `Integration Branch:` pin exists)**:** each falsified claim becomes a `factual-sweep` pending item quoting the stale sentence and its replacement; the guide is left untouched."*
- Item 4: *"**Off the apply-capable branch** (a spec branch, or the default branch while an `Integration Branch:` pin exists)**:** record a `trd-adr` pending item carrying the superseding decision text and the identifier of the ADR it supersedes, with **no ADR number of its own**..."*

Each item's own operative sentence now names the exact same population as the branch-gate paragraph two paragraphs above (line 129/131: *"the default branch while an `Integration Branch:` pin holds"*) — byte-for-byte the same parenthetical in all three items and in the gate. On `master` (Default Branch, `Integration Branch: qa-development-2026` pinned): each item, read alone, unambiguously instructs record-pending, create/touch nothing, and (item 4) allocate no `ADR-MMM`. No cross-reference to the outer paragraph is required any more; no disagreement remains between the gate and the per-item clauses.

**Outcome: PASS.**

### (c) `/akili-constitution` Step 8 pin bullet — FR-1 release-cadence scenario

New sentence inserted mid-bullet: *"**Detection is a question to the user, never inferred:** ask directly whether spec branches merge into one branch first, and that branch reaches the default branch on a release cadence. **When the answer is yes, ask for the branch name as its own explicit step — a yes/no answer is not a name, and the pin is written with that name only.** No heuristic resolves the `Integration Branch:` pin from a branch-name list or merge history — only the user knows which branch integrates."*

Walking the FR-1 scenario (requirements.md §6, *"GIVEN spec branches merge into `develop` and `develop` merges to `main` per release... THEN the user is offered `Integration Branch: develop`"*): the bullet now names two explicit steps in sequence — (1) the yes/no gating question, (2) *"ask for the branch name as its own explicit step"* when the answer is yes — so the branch NAME (`develop`) is elicited by a named, textual instruction, not left to be inferred from "only the user knows which branch integrates." The scenario's expected offer (`Integration Branch: develop`) is now reachable by following the bullet's own two steps in order, with no gap between confirming intent and knowing the name.

**Outcome: PASS.**

### Attempt-2 summary

| Step | Attempt 1 | Attempt 2 |
|---|---|---|
| Step 3b re-verify, `digest-update`/`KZ-id` | INCONCLUSIVE | **PASS** (text resolved; this fixture's concrete `KZ-002` value still yields `superseded`, not "proceeds" — reported as-is) |
| `/akili-archive` Step 3 items 2–4 on master-with-pin | INCONCLUSIVE | **PASS** |
| `/akili-constitution` Step 8 FR-1 pin-name elicitation | INCONCLUSIVE | **PASS** |

**0 of 11 sub-steps are INCONCLUSIVE after T7.** Combined with the two closure greps (both clean, same sanctioned 7-hit set in the spec's own folder) and clean packaging, the closure gate no longer has an unresolved-ambiguity finding.
