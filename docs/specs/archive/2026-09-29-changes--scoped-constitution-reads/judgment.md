# Judgment: Scope the Worker Personas' Constitution Read

**Round 1 result: 1 severe finding confirmed by both judges, and 2 more raised by both and rated severe by one. The user chose *Fix only*: all were corrected in `design.md` and `requirements.md`, and the corrections were not re-judged.**

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/scoped-constitution-reads` |
| Mode | `judgment_day`, requested by the user at the Step 2.5 gate, 2026-09-29 |
| Target | `requirements.md` (approved) and `design.md` (draft), with `proposal.md` as context |
| Target fingerprint | `requirements.md` `b12107e0…`, `design.md` `6e0602b3…`, `proposal.md` `31ec12a4…` (SHA-256), working tree over HEAD `3b66e40` |
| Judges | Two, blind to each other, read-only, on `opus`. The design was authored on `fable` |
| Round | 1 of at most 2 |
| State | **Closed — `escalated` to the user, who chose *Fix only* on 2026-09-29.** Corrections applied; no re-judgment run, by the user's choice |
| Runtime events | First spawn of both judges failed (`Could not determine current tmux pane/window`); retried once without agent names and succeeded. Judge B wrote one scratch file outside the repository for a byte estimate, against its read-only instruction; nothing in the repository was touched |

## 2. Counts

| Class | Count |
|---|---|
| Severe, confirmed by both judges | **1** |
| Raised by both judges, severe to one and warning to the other | **2** |
| Warnings raised by both judges | 6 |
| Findings raised by one judge (suspect) | 7 |
| Contradictions between the judges | 0 |
| Premise Ledger rows confirmed by both | 10 of 15 |

## 3. Premise Ledger, as attacked

| Row | Judge A | Judge B | Merged |
|---|---|---|---|
| P-1 | Confirmed; the Tester's chain is not walked | Confirmed; `akili-constitution.md:418` also allows an inline-drafted persona | Confirmed, **incomplete** |
| P-2 | Confirmed | Confirmed, wider sweep included | Confirmed |
| P-3 | Confirmed | Confirmed | Confirmed |
| P-4 | Confirmed | Confirmed, but a non-host worker reads the entry with no persona | Confirmed, **incomplete** |
| P-5 | Confirmed | Confirmed | Confirmed |
| P-6 | Confirmed | Confirmed | Confirmed |
| P-7 | Confirmed | Confirmed | Confirmed |
| P-8 | Confirmed at the cited rows; see J-2 | Confirmed | Confirmed |
| P-9 | Confirmed | Confirmed | Confirmed |
| P-10 | Confirmed (the field exists) | **Contradicted as used**: in archived tasks the field holds spec-design references, not TRD or UX sections | **Suspect** — one judge. See J-10 |
| P-11 | Confirmed | Confirmed | Confirmed |
| P-12 | Confirmed | Confirmed | Confirmed |
| P-13 | Not re-run; the figure is a session aggregate, not per worker | Not re-run; same reading | `UNVERIFIED` stands, and the claim is **misworded** |
| P-14 | Not re-run; not refuted | Not re-run; its *Settled by* is not a check that can settle it | `UNVERIFIED` stands; owner is weak |
| P-15 | Contradicted in part by `akili-audit.md:55` | Confirmed at `:60`; `:55` bears on DD-9 | Citation holds; the **conclusion drawn from it does not** |

**Premises with no row, named by both judges:** the audit's injection-bleed check (`akili-audit.md:55`); §3 step 5's "unchanged machinery"; the UX Testing Guidance in `akili-test.md`; the non-host reader or the Tester's live path.

## 4. Findings

### Severe, confirmed by both judges

| ID | Finding | Evidence | Judges |
|---|---|---|---|
| **J-1** | **A project that keeps a reference document only at its legacy path is skipped silently.** S5 is evaluated first. When the brief is silent (S3), or says `none` and the work touches the domain (S6), no entry supplies a path, so the worker tests the default path, finds nothing, and takes "Skip; no note". That is the outcome FR-3 forbids: *"BUT it must NOT ship styling without having read the project's tokens"* | `design.md` §7: *"The Leader resolves the legacy fallbacks … so the persona never guesses a path"*; DD-3: *"S5 first"*; `akili-execute.md:94`: *"(legacy fallback: `docs/system-design/design.md`)"* | A F-2 · B F-1 |

### Raised by both, severity split

| ID | Finding | Evidence | Judges |
|---|---|---|---|
| **J-2** | **Two readers of the Tester persona's content have no row, and DD-9 misstates the audit.** Both checks say `tester.md` must not carry the design-token path. The packaged file carries it today. The design never decides whether the new Tester rule names that path | `akili-audit.md:55`: *"a design-token path in `tester.md` (which explicitly does not audit tokens)"*; `akili-constitution.md:1161`: *"`tester.md` must **not** carry the design-token path"* | A F-1 **severe** · B F-4 warning |
| **J-3** | **FR-8 clauses have no delivering decision.** DD-9 reads as the full content of the CHANGELOG entry and omits: naming both commands, the range with its label, and *"must NOT promise a token saving as a fixed figure"* | `design.md` DD-9 | B F-2 **severe** · A F-7 warning |

### Warnings raised by both judges

| ID | Finding | Judges |
|---|---|---|
| J-4 | Nothing carries the lookup note past the worker's report. §3 step 5 says "Unchanged machinery"; the `execution.md` entry fields and the test-report sections have no slot for it | A missing (b) · B F-3 |
| J-5 | DD-4 says the assumptions-only gap in item 0 "is not widened". The no-match lookup that forces a guess is a new, routine route into it, and can leave a task unable to close | A F-5 · B F-8 |
| J-6 | The Tester's `none` default contradicts a surviving neighbour. `akili-test.md` asks for *"visual consistency with `docs/ux-ui/design.md`"* whenever a spec has meaningful UI behavior; the Tester's S6 fires only when a scenario cites the document | A F-6 · B F-7 |
| J-7 | The non-host case is incomplete. It gets copied sections but no state table, and cannot read the root guides FR-1 requires | A F-8 · B F-6 |
| J-8 | A heading that appears twice in a document has no rule | A F-10 · B F-9 |
| J-9 | The Implementer's note placement sits beside *"Brief 1-sentence summary"* and *"never bury a gap in the summary above"*; a brief-and-work mismatch reads as a gap | A F-4 · B F-11 |

### Raised by one judge (suspect — not auto-fixed)

| ID | Finding | Command or source, as run | Judge |
|---|---|---|---|
| J-10 | P-10 is wrong as used: *design references* holds spec-design references | `docs/specs/archive/2026-08-13-changes--audit-phase-tier-drift/tasks.md:40`: *"\| Design refs \| §3 authority table, DD-1, DD-4, DD-5, DD-7 \|"* | B |
| J-11 | S5 then S6 gives two note rules: "no note" and "says so in its note" | `design.md` DD-3, DD-2 | A |
| J-12 | `tester.md:15` *"unless strictly required to write a valid test"* competes with the new "Read nothing, unless S6" | `tester.md:15` | A |
| J-13 | DD-6 does not say an omitted slice entry is invalid | `design.md` DD-6; FR-5 | A |
| J-14 | Two wrong section references: *Cross-tool spawn* is a heading of `docs/commands/akili-test.md`, and the pointer rule sits under *Token discipline*; *Cross-host dispatch* is defined in `docs/model-routing.md`, not `/akili-execute` | `docs/commands/akili-test.md:28`; `akili-test.md:61`; `docs/model-routing.md:553` | B |
| J-15 | The Tester's column would copy "Same", which has no referent once each persona carries its own column | `design.md` DD-3 | B |
| J-16 | A deployed persona may be drafted inline and never come from the packaged template | `akili-constitution.md:418` | B |

## 5. Counts the judges checked

| Figure | Result |
|---|---|
| Ledger count line: 13 verified, 2 `UNVERIFIED`, 0 High, 2 Low | Holds |
| 112,149 bytes; 31,710 root bytes; about 28k tokens | Hold |
| "9k–13k tokens" for two to four sections | Approximate. The arithmetic gives about 8.3k–13.7k |
| "Four packaged files change" (`design.md` §2) | **Fails.** Five: `CHANGELOG.md` is in `package.json` `files`. Both judges |
| `grep -n -i "trd\|ux-ui" akili-test.md` hit list in `requirements.md` §4 | **Fails.** Six hits; `:108` is omitted, and it sits inside Phase 1 item 2. Both judges |
| "*Pointer briefs* bullet six lines below" (DD-1) | **Fails.** Five lines below in `implementer.md`; `tester.md` has no such bullet. Judge A |
| 17× | The arithmetic holds; the figure is per session, not per worker. Both judges |
| NFR-1, 1,500 bytes per persona | Tight. Estimates of about +1.2k (B) and 1.4k–1.7k (A) for the Implementer. The design gives no byte estimate |
| Budget: 4 tasks, about 40 lines, 6 rounds | Plausible; T1's 24 lines is likely low |

## 6. Orchestrator's re-read

J-1, J-2, J-6 and J-7 were re-read at their cited sources by the orchestrator on 2026-09-29 at `3b66e40`, and the quotations reproduce. `package.json` `files` lists `CHANGELOG.md`, so the file count in §5 holds. No other finding has been re-read yet.

## 7. Correction

**User decision, 2026-09-29: *Fix only*.** Scope offered and accepted: J-1, J-2, J-3 and the six shared warnings J-4 to J-9.

| Set | Corrected | Where |
|---|---|---|
| J-1 to J-9 | Yes, all nine | `design.md` §11 maps each to its section; `requirements.md` §10 lists the requirement amendments |
| J-10, J-14 | Yes. Each was settled by the orchestrator's own re-run at the cited source before it was corrected | `design.md` P-10, §3, DD-6; `requirements.md` §3 |
| J-11, J-13, J-15, J-16 | Yes. Each fell out of a correction above or was a wording fix | `design.md` DD-3, DD-6, P-1 |
| J-12 | Yes | `design.md` DD-3 |
| Failed counts (§5) | Yes | Both documents |

**Fix actor:** the orchestrator, on `fable`, the design's author. No separate fix agent was spawned.

**Not verified independently.** No judge has read the corrected documents. The corrections amend approved requirements (NFR-1's cap, FR-5's UI-suite rule, the note's record) and add three edit sites to the design, so the corrected design is larger than the one that was judged.

## 8. Terminal State

`JUDGMENT: ESCALATED ⚠️` — severe findings were confirmed and corrected without a re-judgment, by the user's choice. The design's approval is the user's at the Step 2.5 gate.
