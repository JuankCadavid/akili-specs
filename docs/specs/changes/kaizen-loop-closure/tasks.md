# Tasks: Kaizen Loop Closure

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/kaizen-loop-closure` |
| Depth | Standard |
| Type | Change |
| Approval Mode | `pre-approved (user, 2026-09-17)` |
| Status | Approved — ready for `/akili-execute` |
| Date | 2026-09-17 |
| Budget (design §12) | 6 tasks · ~230 LOC (prose) · 1 review round per task — trip on the second FAIL of any one task |
| Design review | Step 2.3 reversion challenge run (6 breakages, 4 closed pre-design); `judgment-day` not requested at Phase 2 (user chose Continue) |
| Format precedent | `docs/specs/archive/2026-08-22-changes--branch-safe-kaizen/tasks.md` |

## 2. Task Graph

```
T1 (kaizen SKILL.md: Branch Context ×3, exclusive predicate, Kind/Status, re-verify, upstream report, normalize)
 ├─→ T2 (akili-archive.md: gates on the apply-capable predicate, upstream clause, five-state report)
 ├─→ T3 (akili-resume.md: footer wording + count filter)
 ├─→ T4 (akili-constitution.md: Integration Branch pin + Safe Update; leader/implementer guardrail phrase)
 │
 T2,T3,T4 ──→ T5 (mirrors + root docs + CHANGELOG) ──→ T6 (closure greps + fixture walkthrough + packaging)
```

T2/T3/T4 are parallel-safe after T1 (they cite names T1 defines: the `apply-capable` predicate, `integration` context, `upstream` kind, `superseded`/`upstreamed` statuses). T5 mirrors final command text. T6 is the global gate. No circular dependencies.

**Global verification caveat.** Every grep below is a **presence-assertion**: it proves text landed, not that an agent following it behaves correctly. Prose executability has no automated check (accepted risk, `requirements.md` §8) — the behavioral substitute is T6's fixture walkthrough. **A task may not report PASS on grep-green alone where its Done criteria name a walkthrough clause.**

**Grep hazard (all tasks).** Exclude `.claude/worktrees/`, `docs/specs/archive/`, and this spec's own folder (`docs/specs/changes/kaizen-loop-closure/`), which quotes the superseded phrases verbatim.

**Environment path that could pass for the wrong reason (all grep tasks).** A grep run from inside `docs/specs/changes/kaizen-loop-closure/` or against a stale worktree clone reports the pre-change tree; every grep states its working directory as the repo root and its exclusions explicitly.

---

### T1 — Kaizen skill: three-context Branch Context, exclusive writer, re-verify, upstream report

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | L |
| Depends on | none |
| Requirements | FR-2 (all four scenarios; the hotfix scenario's skill-side clauses), FR-3 (first-apply scenario incl. `AND IT MUST` identical / `BUT NOT` other branch; merge scenario; normalize clause), FR-4 (all three scenarios and every `BUT`/`AND IT MUST`), FR-5 (both scenarios: `AND IT MUST` local half independent, `BUT NOT` guide/digest, `BUT NOT` report from spec branch), FR-6 (Kind/Status tables; Collect + Stamp enumeration), NFR-3, NFR-4, NFR-5, NFR-6 |
| Design refs | §3 Branch Context + Apply Mode flow, §5, Surface rows 1–13, DD-1..DD-6, DD-8, DD-9, DD-10 |

**Scope.** Edit `.claude/skills/kaizen/SKILL.md`, by section (never by line):

- **Frontmatter `description:`** — trigger phrases untouched (DD-9: the discovery surface is unchanged). Only the trailing clause "then apply the pending backlog on the default branch" may change, to "on the apply-capable branch" (FR-8) — see verification 1 as amended 2026-09-17.
- **Activation Contract, Apply Mode paragraph** — "runs only on the default branch" → "runs only on the **apply-capable branch** (Branch Context)"; the one-line decline names the pinned branch.
- **Philosophy → Engineering Mapping, dual-lesson bullet** and **Standardize, "Methodology lessons" bullet** — the upstream recommendation becomes a `Kind: upstream` pending item (`Target: methodology`, `Edit` = proposed upstream text), recorded on any branch; still presented to the user.
- **Standardize, Branch Context table** — three rows: spec branch / default branch while an integration pin exists (records pending, names the integration branch) / apply-capable branch (menu fires).
- **Record, `Kind` table** +`upstream`; **`Status` table** +`superseded (reason)`, +`upstreamed (date, report)` — text per design §5.
- **Apply Mode**: opening reachability sentence; step 1 Collect names the **unparseable** terminal branch (list by file + position, leave `pending`, append one note, never half-apply); new **step 3b Re-verify** (one probe per approved item — Target exists at HEAD + one grep/existence check for the fact the Edit names; outcomes: proceed / `superseded (reason)` / unverifiable ⇒ present to user; never expands into an investigation); new **step 4b Upstream report** (collect `upstream` items ⇒ `docs/specs/kaizen/upstream-<YYYY-MM-DD>[-N].md` with the design §5 sections; flip to `upstreamed`; no digest rows); step 5 gains **5.0 normalize** (dedupe by `ID`, re-enforce ≤10 via the existing retirement rule) before 5.1, and 5.4's "create if absent" reads "on the apply-capable branch"; step 6 Stamp lists all five statuses.
- **Hard Rules › Branch Context** — third context `integration`, resolved from the `Integration Branch:` pin **only** (no git fallback; absent pin ⇒ cannot occur); the **apply-capable predicate** defined once: `integration` when the pin exists, else `default`, never both; both pins same name ⇒ pin redundant, one-line notice; unresolved ⇒ `spec` unchanged.
- **Hard Rules › Writable set** — rows: *spec branch, or the default branch while an integration pin exists* / *apply-capable branch*.
- **Hard Rules › Standing rules** — "The digest has one writer: Apply Mode, on the apply-capable branch"; consumers' read rule unchanged; add one line recording NFR-7's accepted residual (hotfix branches off the default branch see integration-branch standardizations at the release merge).

**Verification** (repo root; exclusions per the hazard note).
1. *(amended by the Leader at T1 attempt 2, 2026-09-17 — the original "zero change to the description line" left a where-apply-runs claim FR-8 forbids; DD-9's intent is unchanged triggers, not an unchanged line)* `git diff -U0 -- .claude/skills/kaizen/SKILL.md | grep -n "^[-+]description:"` — if the line changed, the diff pair must differ **only** in the trailing clause after "then apply the pending backlog", and every trigger phrase (`kaizen`, `retrospective`, `continuous improvement`, `mejora continua`, `/akili-archive Kaizen step`, `apply pending kaizen standardizations`, `kaizen apply`, `aplicar estandarizaciones kaizen`) is present byte-identical on both sides. Falsifier: a trigger phrase dropped or reworded (DD-9 regression); or the clause still reading "on the default branch" (FR-8 regression).
2. `grep -n "Integration Branch" .claude/skills/kaizen/SKILL.md` — every hit inside Hard Rules › Branch Context names the pin as the sole source; a hit adjacent to `symbolic-ref`, `origin/HEAD`, or a branch-name list fails. Falsifier: a sentence "if a `develop` branch exists".
3. `grep -nc "superseded\|upstreamed\|upstream-" .claude/skills/kaizen/SKILL.md` — ≥ 6, and `grep -n "upstream-" …` hits **only** inside Apply Mode (step 4b) — a report-write sentence under Standardize fails (FR-5 `BUT NOT` from spec branch).
4. `grep -niE "only on the default branch|default branch only" .claude/skills/kaizen/SKILL.md` — zero hits. Falsifier: the pre-change Apply Mode opening line.
5. `grep -niE "default ∪ integration|default or the pinned integration| either pin|any apply-capable|both pins are apply" .claude/skills/kaizen/SKILL.md` — zero hits (union semantics, DD-2).

**Disqualifiers.** All five are presence-assertions. Grep 2 green while step 3b's text says "re-read the source spec to confirm" = NFR-5 violation — read step 3b, don't count hits. Grep 4 green while the Standardize table still has two rows (no default-while-pinned row) = the hotfix scenario has no home — read the table. If the diff removes any existing `Kind` or `Status` row, or changes the digest's columns or cap, stop: those are declared invariants (predecessor DD-7, NFR-1), report instead of proceeding.

**Done.** All scope bullets land; existing bounds unchanged (≤3 lessons, 1–3-line edits, ≤10-row digest, never-block, trigger phrases); verification 1–5 run with disqualifiers; behavioral clauses (hotfix-on-default, unparseable item, unverifiable probe) queued for T6's walkthrough.

**Skills:** `cognitive-doc-design`.

---

### T2 — `/akili-archive`: gates on the apply-capable predicate, upstream clause, five-state report

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M |
| Depends on | T1 |
| Requirements | FR-2 hotfix scenario (archive side: Step 3 items 2–4 record pending, Step 4.4 offer silent, note names the integration branch, `AND IT MUST NOT` allocate ADR / digest / shared file, `BUT` spec folder + entry file + family flip stay writable), FR-3 (offer fires only on the apply-capable branch; note wording), FR-5 spec-branch scenario (Step 4.3 records the `upstream` item), FR-6 archive-report scenario (`BUT NOT` fold/uncounted), NFR-4 |
| Design refs | Surface rows 14–18, DD-2, DD-4, DD-5 |

**Scope.** Edit `.claude/commands/akili-archive.md`: **Step 3 branch gate** paragraph compares the checked-out branch against the skill's apply-capable predicate (both pins read from the root guides already loaded; cite the predicate by name; the default branch with an integration pin present is *not* apply-capable — items 2–4 record pending); **Step 4.3** adds one clause: Methodology lessons and the upstream half of dual lessons are recorded as `upstream` pending items; **Step 4.4** offer fires on the apply-capable branch; elsewhere the one-line note names the pinned branch (never the phrase "the default branch"); **Step 6 item 7** reports `applied`, `deferred`, `pending`, `superseded`, `upstreamed` by name plus the upstream report path when one was written; **Error Handling** writable-set bullet gains the default-while-pinned row.

**Verification.**
1. `grep -n "apply-capable" .claude/commands/akili-archive.md` — hits in Step 3, Step 4.4, Error Handling. Falsifier: Step 3's gate still comparing against `Default Branch:` alone.
2. `grep -n "superseded\|upstreamed" .claude/commands/akili-archive.md` — both present in Step 6 item 7. Falsifier: item 7 listing only three states (the pre-change text).
3. `grep -niE "only on the default branch|default branch only|awaiting the default-branch" .claude/commands/akili-archive.md` — zero hits.
4. `grep -n "ADR-MMM\|next free" .claude/commands/akili-archive.md` — allocation language only inside the apply-capable context; an allocation instruction reachable from the default-while-pinned path fails (challenge item 3).

**Disqualifiers.** Grep 1 counts a word: read the Step 3 gate sentence — if it restates a git resolution procedure instead of citing the predicate, DD-1 is violated though every grep passes. If the diff touches Step 5's folder move or Step 3 item 5's family flip, stop — declared branch-side invariants (predecessor FR-5).

**Done.** All five sites edited; never-block preserved; verification + disqualifiers run; the hotfix-on-default path queued for T6's walkthrough.

**Skills:** `cognitive-doc-design`.

---

### T3 — `/akili-resume`: footer names the pinned branch, counts only `pending`/`deferred`

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S |
| Depends on | T1 |
| Requirements | FR-3 resume scenario (count = 3 with 1 superseded + 2 upstreamed present; recommendation by pinned name; `BUT NOT` write any file), FR-6 enumeration at the footer site, NFR-1 (additive change only) |
| Design refs | Surface row 19, §5 status-by-site table |

**Scope.** Edit `.claude/commands/akili-resume.md` Kaizen footer paragraph: state that the count includes `pending` and `deferred` **only** and excludes `applied`, `rejected`, `superseded`, `upstreamed` (KZ-004 — name the excluded set); the recommendation reads "on `<pinned apply-capable branch name>`" resolved from the pins in the root guides already loaded (no skill load); update the example line. The read-only contract sentence stays verbatim.

**Verification.**
1. `grep -n "superseded" .claude/commands/akili-resume.md` — ≥ 1 hit inside the footer paragraph's exclusion list. Falsifier: the pre-change paragraph (counts "pending or deferred" with no exclusion list — a `superseded` item would be silently counted or silently dropped depending on the reader).
2. `grep -n "on the default branch to work them" .claude/commands/akili-resume.md` — zero hits.
3. `git diff --stat -- .claude/commands/akili-resume.md` — one hunk region; a change outside the Kaizen footer fails (NFR-1 additive-only).

**Disqualifiers.** Grep 1 proves the word landed, not that the count is right: T6's fixture (3 pending, 1 superseded, 2 upstreamed) is the behavioral check. If the diff changes the dashboard's `Kaizen: N active lessons` line or the read-only sentence, stop.

**Done.** Footer paragraph + example line updated; verification run; count semantics queued for T6.

**Skills:** `cognitive-doc-design`.

---

### T4 — `/akili-constitution`: `Integration Branch:` pin; persona guardrail phrase

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M |
| Depends on | T1 |
| Requirements | FR-1 (both scenarios; `AND IT MUST` adjacent to `Default Branch:`; `BUT NOT` unprompted / inferred from git / equal to default; Safe Update clause: add pin only when missing + rewrite adjacent discipline sentence + persona-drift line), FR-8 for the two templates (`.claude/templates/leader.md`, `implementer.md` guardrail phrase) |
| Design refs | Surface rows 20–22, DD-1, DD-7 |

**Scope.** Edit `.claude/commands/akili-constitution.md` Step 8: a new bullet immediately after the `Default Branch:` bullet — optional `Integration Branch: <name>`; detection is **a question to the user** (never a git heuristic); confirmation shows the assertion sentence ("single integration point; apply passes run here serially; merges to the default branch carry applied standardizations forward"); when to set (spec branches merge here, reaches the default branch on release cadence) and when not (trunk-based ⇒ say so in one line, write nothing); exactly one name, must differ from the default branch; Safe Update adds the pin only when absent, never rewrites an existing one, and **when it adds the pin rewrites the adjacent write-discipline sentence** to apply-capable wording and says in one line that deployed `.agents/*` personas keep the old phrase until re-scaffolded (next `/akili-audit` reports persona drift — W-1). Rewrite the existing write-discipline bullet's "applied on the default branch" to apply-capable wording. Edit the guardrail paragraph in `.claude/templates/leader.md` and `.claude/templates/implementer.md`: the same one-phrase substitution, nothing else (adjacent spec `changes/scoped-constitution-reads` rewrites `implementer.md` item 14 — different region; sequence, don't merge).

**Verification.**
1. `grep -n "Integration Branch" .claude/commands/akili-constitution.md` — ≥ 3 hits, all in Step 8; one contains "confirm" and one contains "trunk". Falsifier: a hit with `symbolic-ref` or `git branch` in the same sentence (inference from git).
2. `grep -niE "applied on the default branch" .claude/commands/akili-constitution.md .claude/templates/leader.md .claude/templates/implementer.md` — zero hits. Falsifier: the three pre-change lines.
3. `git diff --stat -- .claude/templates/` — exactly two files, one hunk each, ≤ 3 changed lines total. Falsifier: any second hunk in `implementer.md` (collision with the adjacent spec's region).

**Disqualifiers.** Grep 1 cannot see whether Safe Update's "never rewrites an existing pin" and "rewrites the adjacent sentence" are both stated — read the bullet; one without the other fails FR-1. If the edit adds a second pin name form (a list), stop — single name is a requirement.

**Done.** Step 8 bullet + discipline bullet + two persona lines land; verification run; FR-1 scenarios queued for T6's walkthrough (pin present / absent / both same).

**Skills:** `cognitive-doc-design`.

---

### T5 — Mirrors, root docs, CHANGELOG

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M |
| Depends on | T2, T3, T4 |
| Requirements | FR-8 (all sites in the §4 closure set outside the command/skill/template files; post-sweep scenario's sanctioned-hit enumeration), NFR-1 (consumer mirrors untouched) |
| Design refs | Surface rows 23–25, DD-10 |

**Scope.** Bring each mirror to parity with its rewritten command sections: `docs/commands/akili-archive.md`, `akili-resume.md`, `akili-constitution.md`; `docs/skills/kaizen.md` (Apply row, Branch Context bullet, single-writer bullet, archive bullet); `docs/skills/README.md` kaizen row; `docs/README.md` Kaizen paragraph; `docs/flow.md` artifact-table row for `kaizen-log.md` and §8 Kaizen Loop; `README.md` Kaizen diagram line and Apply bullet. Rewrite the Kaizen Loop bullet in `AGENTS.md` and `CLAUDE.md` to "on the apply-capable branch (the default branch, or the pinned integration branch when one exists — never both)". `CHANGELOG.md` Unreleased: Added (Integration Branch pin, re-verify + `superseded`, upstream report + `upstreamed`), Changed (Apply Mode reachability, exclusive writer, digest normalization, resume footer), with the classification line the user decided (proposed minor).

**Verification.**
1. The FR-8 phrase grep from `requirements.md` §8, run at repo root with the hazard exclusions — every remaining hit is enumerated in this task's Done as one of: pin description, fallback resolution, or already apply-capable wording. Falsifier: `docs/flow.md`'s artifact-table row still reading "default branch only", or `README.md`'s Apply bullet.
2. The union-semantics grep from `requirements.md` §8 — zero unsanctioned hits (the proposal's §10–§11 are sanctioned history).
3. `git diff --stat -- .claude/commands/akili-propose.md .claude/commands/akili-specify.md .claude/commands/akili-execute.md docs/commands/akili-propose.md docs/commands/akili-specify.md docs/commands/akili-execute.md` — empty (NFR-1).

**Disqualifiers.** Grep 1 finds phrases, not contradictions: a mirror can avoid the phrase and still describe two-row Branch Context while the command has three — per-surface parity read (command vs mirror) for the rewritten sections, recorded per file. `CHANGELOG.md` entries are aggregate claims (KZ-002): each bullet names a surface that T1–T4's diffs actually touched.

**Done.** All listed docs updated; sanctioned hits enumerated; consumer diff empty; CHANGELOG entry present.

**Skills:** `cognitive-doc-design`.

---

### T6 — Closure gate: two greps, fixture walkthrough, packaging

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M |
| Depends on | T5 |
| Requirements | FR-2 (all scenarios walked), FR-3 (first-apply, merge, resume scenarios walked), FR-4 unparseable + out-of-budget scenarios walked, FR-7 (legacy no-pin scenario walked; `AND IT MUST` no constitution change), FR-8 post-sweep scenario, NFR-1, NFR-2, NFR-6; the requirements §8 accepted risk (prose executability) is discharged here as far as a walkthrough can |
| Design refs | §3 flow, DD-2, DD-6, DD-8, DD-10, §12 budget |

**Scope.** (a) Run both closure greps repo-wide (FR-8 phrase grep; FR-2 union-semantics grep) and record every sanctioned hit in `execution.md`. (b) Build a throwaway fixture in the session scratchpad (never in the repo): a root guide summary with `Default Branch: master` + `Integration Branch: qa-development-2026`; three entry files — one with 3 `pending` + 1 `superseded` + 2 `upstreamed` items, one whose pending block is a YAML code block (copy the shape of the evidence project's `changes--delete-result-action.md`), one with a `guide-sync` item whose `Target` does not exist; a git repo with `master` and `qa-development-2026` branches. Walk, **as a literal agent reading only the shipped text** (no memory of this spec): Branch Context on each branch (`integration` apply-capable; `master` non-writing; a third branch `spec`); the no-pin path (remove the integration line ⇒ `master` apply-capable, byte-identical rules); Apply Mode Collect (the YAML entry lands in the unparseable branch — listed, left pending, one note); Re-verify on the missing-Target item (⇒ `superseded (reason)`); Step 4b (2 `upstreamed` items would produce one report; on `master` with the pin present the walkthrough must **decline**); `/akili-resume` footer count (= 3, names `qa-development-2026`); `/akili-archive` Step 3 + 4.4 on `master` with the pin present (records pending, no ADR, no digest, note names the integration branch). Record each step's outcome and the exact sentence that decided it. (c) `npm run verify:cli && npm run pack:dry-run && git diff --check`.

**Verification.**
1. Greps: zero unsanctioned hits in both; sanctioned list recorded. Falsifiers: named in `requirements.md` §8 rows 1 and 4.
2. Walkthrough: every listed step has a recorded outcome and a citing sentence; any step where two shipped sentences could be read to disagree is recorded as **INCONCLUSIVE**, never as PASS — that is the FAIL input for this task. Falsifier: the fixture's YAML entry silently absent from the pass report (DD-8 fall-through).
3. Packaging commands exit 0. Falsifier: a renamed packaged file.

**Disqualifiers.** A walkthrough performed from memory of this spec rather than from the shipped text proves nothing — the record must quote the sentence, not paraphrase the design. Grep-green plus a walkthrough with one INCONCLUSIVE step is a FAIL for the spec, reported to the user, not absorbed. Environment path that passes for the wrong reason: a fixture that omits `master` (so "declines on master" is never exercised) — the fixture must have both branches.

**Done.** Both greps clean with enumerated sanctions; walkthrough record complete with zero INCONCLUSIVE steps or an escalation; packaging green; fixture deleted from the scratchpad.

**Skills:** `cognitive-doc-design`, `systematic-debugging` (if a walkthrough step is INCONCLUSIVE).

---

## 3. Coverage — scenario and clause level

| Requirement · scenario / clause | Owner |
|---|---|
| FR-1 release-cadence scenario (all clauses) · trunk-based scenario · Safe Update clause | T4 (text) · T6 (walk: pin present / absent / both same) |
| FR-2 equals-pin (`AND IT MUST` by name) · no-pin (`BUT NOT` infer) · both-same | T1 · T6 |
| FR-2 hotfix-on-default (`AND IT MUST NOT` ADR/digest/shared · `BUT` spec-owned writes stay) | T1 (skill table + writable set) · T2 (Step 3/4.4) · T6 |
| FR-3 first-apply (`AND IT MUST` identical · `BUT NOT` other branch incl. master) | T1 · T6 |
| FR-3 merge-to-default (`AND IT MUST` pure merge target) | T1 · T6 |
| FR-3 resume scenario (`BUT NOT` write) | T3 · T6 |
| FR-3 normalize clause | T1 |
| FR-4 deleted-component (`AND IT MUST` reason · `BUT NOT` write-and-sweep) | T1 · T6 (missing-Target item) |
| FR-4 unparseable (`BUT NOT` skipped/guessed/half) | T1 · T6 (YAML fixture) |
| FR-4 out-of-budget (`AND IT MUST NOT` expand) | T1 |
| FR-5 apply-with-methodology (`AND IT MUST` local half · `BUT NOT` guide/digest) | T1 · T6 |
| FR-5 recorded-on-spec-branch (`BUT NOT` report from spec branch) | T1 · T2 (Step 4.3) |
| FR-6 archive-report (`BUT NOT` fold) · per-site enumeration | T2 · T1 (Collect/Stamp) · T3 (footer) |
| FR-7 legacy no-pin (`AND IT MUST` no constitution change) | T6 (no-pin walk) · T5/T6 consumer diff |
| FR-8 post-sweep (`BUT` no default-only hit) | T5 · T6 |
| NFR-1 · NFR-2 · NFR-3 · NFR-4 · NFR-5 · NFR-6 | T5+T6 · T6 · T1 · T1+T2 · T1 · T1 |
| NFR-7 accepted residual | No task — recorded in T1's Standing rules line and in requirements; accepted risk |

No gap is discharged by citing a different requirement; every row quotes the clause it owns.

## 4. Estimate and PR strategy

**Estimated LOC:** ~230 lines of prose across 25 surfaces (design §12), plus the throwaway fixture in the scratchpad (not shipped).

**PR strategy: one PR.** The skill and the three commands describe one contract and must land together — a split PR would ship a command citing a predicate the skill does not yet define. Prose-only, under ~400 LOC; the review order for the PR description (`cognitive-doc-design`): read T1's Branch Context and Apply Mode diff first, then T2, then everything else is parity.

**Recommended first task:** T1 — every other task cites names it defines.
