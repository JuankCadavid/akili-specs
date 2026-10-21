# Validation Report — Grok Bot install target (`--tool grokbot`)

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/grokbot-target` |
| Date | 2026-10-21 |
| HEAD validated | `c8df012`, plus the correction-closure doc edits made in this validation |
| Auditor | An independent `opus` context (T3) wrote no code: 14 live CLI runs in a scratch HOME, read-only. Leader: build integrity, the HITL box check, the report |
| Live box check (NFR-6) | 2026-10-21 12:22 (Bogotá), run by the user on the Grok Bot box with the tarball built from `c8df012` (sha256 `5a1613cf…3eddfa`) |
| Verdict | **PASS with warnings: ready to archive** |

## 2. Summary

| Area | Result |
|---|---|
| Tasks | **PASS**: 7/7 `[x]`. Each has a Reviewer PASS and a non-author evidence re-run |
| Files | **PASS**: every file in design §4 exists |
| Build integrity | **PASS**: `npm test` 553/553, `verify:cli` 0, `pack:dry-run` 309 files, `git diff --check` clean, `release:status` reports no drift |
| Requirements | **PASS**: FR-1 … FR-8 and NFR-1 … NFR-6. NFR-6 is confirmed live on the box. One FR-1 clause was amended (see §6) |
| Code quality | **WARN** (advisory): 5 new 4R findings and 17 carried advisories. Two of them, N1 and N2, are small hint deviations from design §7 |
| Design conformance | **WARN → closed**: DD-1 … DD-12 conform in the code. Correction-closure and figure drift in the spec docs were fixed during this validation; N1/N2 remain as a follow-up |
| Live Grok Bot load | **PASS**: the box loaded `tdd` and `akili-propose` and accepted AKILI's extra frontmatter |
| FAIL findings | **0** |

## 3. Task Completion

| Task | Status | Evidence (`execution.md`) |
|---|---|---|
| T1 Target, flags, roots, registry, detection, help | PASS | Attempt 2: Reviewer PASS, re-run VERIFIED |
| T2 Ownership record and install/update policy | PASS | Attempt 1: PASS, VERIFIED |
| T2b Safe takeover (user-approved scope change) | PASS | Attempt 2: PASS, VERIFIED |
| T3 Doctor FOREIGN, BLOCKED, summary, exit | PASS | Attempt 1: PASS, VERIFIED |
| T4 Next steps, install and update | PASS | Attempt 1: PASS, VERIFIED |
| T5 Docs, claim-family sweep, CHANGELOG | PASS | Attempt 2: PASS, VERIFIED |
| T6 BUG-1 owned non-directory entries (added after `/akili-test`) | PASS | Attempt 2: PASS, VERIFIED, plus a 32-cell Reviewer matrix |

The Auditor found one wording slip: T1's "Done when" said "four falsifiers" where only three are defined. It is now corrected in `tasks.md`.

## 4. File Existence

| Design §4 item | Present |
|---|---|
| `bin/akili.js` (all code) | ✅ |
| `test/install-grokbot.test.js` | ✅ |
| `test/install-grokbot-edge.test.js` (from `/akili-test`; added to §4 in this validation) | ✅ |
| `AKILI_GROKBOT_TARGET` pins: `test/install-cursor.test.js:124`, `test/agents-doctor-io.test.js:30`, `test/agents-doctor.test.js:190/436/644`, `scripts/ci/install-layout-regression.js:537` | ✅ |
| `README.md`, `docs/cli.md`, `CHANGELOG.md`, `AGENTS.md`, `CONTRIBUTING.md`, `.claude/README.md` | ✅ |
| Box layout: `workflows/<slug>/SKILL.md`, `akili/{templates,scripts,.mcp.json.example,grokbot-owned.json}` | ✅ live on the box (install 47, doctor `ok 47`) |

## 5. Build Integrity

| Command | Result |
|---|---|
| `npm test` | 553 tests, 553 pass, 0 fail, 0 skipped |
| `npm run verify:cli` | exit 0 |
| `npm run pack:dry-run` | 309 files |
| `git diff --check` | clean |
| `npm run release:status` | "No published release drift detected" |
| `npm pack` (for the box) | `akili-specs-2.34.2.tgz`, written to the scratchpad and never committed. It carries the grokbot code (60 `grokbot` hits in `package/bin/akili.js`) |

## 6. Requirement Coverage

The primary evidence is the `test-report.md` matrix, which the Auditor cross-checked clause by clause against `requirements.md`. The Auditor also spot-checked behavior live in a scratch HOME.

| Requirement | Result | Evidence |
|---|---|---|
| FR-1 | PASS* | Author and edge tests; live help and whitelist error. *The clause "AND IT MUST print `akili doctor --tool all`" could not hold under `--dry-run` (no verify hint at baseline or at HEAD), so it is **amended** to "after a real (non-dry-run) install" |
| FR-2 | PASS | Precedence tests; live default dry run plans writes only under the two `path.resolve` defaults |
| FR-3 | PASS | Byte identity both ways; record; dry run; partial installs; hygiene |
| FR-4 | PASS | Live: foreign skipped and not recorded. Takeover: `diff -rq` identical, `notes.md` gone, no `.takeover/` left, record 38→39. Invalid record: 39 `blocked`, exit 1, record and workflows tree sha-identical, `doctor --fix` prints `BLOCKED` and never `FIXED`. T6 owned-shape matrix: 32/32. The update column is covered by static trace plus the live `rev5/u.out` |
| FR-5 | PASS | Live FOREIGN, INCOMPLETE, exit 1, `--fix` leaves foreign untouched |
| FR-6 | PASS | Live positive and negative detection (non-vacuous edge tests) |
| FR-7 | PASS | Live exact strings, 0 `rsync`/`ssh`/`scp` |
| FR-8 | PASS | Every CHANGELOG Unreleased clause is quote-checked true at HEAD; the claim family has been swept |
| NFR-1 … NFR-5 | PASS | Codex baseline; `--tool all` byte-identical; no content fork; `/home/box` never touched on the Mac; skip-by-default; the full gate is green |
| **NFR-6** | **PASS (live)** | User run on the box: `install` 47, `doctor` HEALTHY ok 47. Grok Bot loaded `tdd` and `akili-propose` by name from `/home/box/agent-data/workflows/<slug>/SKILL.md`, returned the full body, resolved the skill directory, and listed the auxiliary files (`tests.md`, `mocking.md`). Extra frontmatter (`license`, `metadata`) caused no error. **P-10 and P-11 are now VERIFIED** (design §11) |

## 7. Linting & Code Quality

The repo has no lint command; `node:test` plus `git diff --check` is the existing gate. All findings below are **advisory** and drive no grade.

**New in this audit:**

| ID | Lens | Finding | Remediation |
|---|---|---|---|
| N1 | Reliability | The invalid-record recovery text printed by `install` has no root flags (`bin/akili.js:1093`). With `--grokbot-target <w>`, it says `akili doctor --tool grokbot`, which points at the default. `doctor`'s own recovery line does carry the flags | Route it through `grokbotCommand` (follow-up) |
| N2 | Reliability | `doctor`'s generic "Run … --fix" hint drops `--grokbot-target` (`bin/akili.js:2264`) | Same as N1 (follow-up) |
| N3 | Readability | Stale "later task" comments (`:209-210`, `:432-433`) | Delete them |
| N4 | Readability | Plural mismatch in "1 grokbot entry is … replace them" (`:2274`) | Fix the wording |
| N5 | Resilience | `classifyEntry` rethrows non-ENOENT lstat errors, so `doctor` would crash uncaught | Catch, then report the entry |

**Carried from `execution.md`** (deduplicated; full list in the Auditor's detail):
- A takeover copy that fails after the record write, or a crash between the rename and the record, leaves a silent `.takeover/` orphan.
- EXDEV when the resources root is on another filesystem (documented in `docs/cli.md`).
- A failed restore error is buried in a stack trace.
- A dry-run command takeover prints `would overwrite`.
- `quote()` does not escape `"` or `$`.
- `grokbotCommand` hardcodes `--tool grokbot`.
- `isRealDirectory` treats any lstat error as a directory.
- The skip branch bypasses `policy.finish()` (safe).
- Doctor reads an owned symlink to a folder that has `SKILL.md` as OK (accepted limit).
- `README.md:209` omits Codex's second detection signal.
- The "restore also fails" branch has no test.

## 8. Design Conformance

| Check | Result |
|---|---|
| DD-1 … DD-12 against the code | PASS. Includes T2b move aside → record → copy → delete with restore on record failure (`bin/akili.js:819-842`), and T6 clearing owned non-directories only under `force` |
| Design §7 "hints built from the resolved roots" | WARN. N1 and N2 deviate; queued as a follow-up, not a scope change here |
| Amendments carried consistently | PASS: T2b delete wording, T4 network clause, T6. The superseded phrases "intact outside" and "open any network connection" have 0 hits; "remove, then record" appears only at `tasks.md:103`, marked superseded |
| Correction closure — proposal | **Fixed in this validation.** `proposal.md` no longer offers "the staging path for a remote box" or "stage + `rsync`" as live options; its Status and Option A carry the Q1 → box-only note |
| Figures across documents | **Fixed in this validation.** Task count 7 (was 5/6) in design §12, `tasks.md` Document Control and graph, and `execution.md`. Review rounds: 11 actual against 10 approved. `npm test` 553 (was 539) in the execution summary. Premise count line 13/13 verified. LOC ≈1,628 reproduces (`git diff --numstat c265b03` +1,921/−66, minus the 359-line Tester suite). 27 skills, 12 commands, six targets, `all` = five: all true at HEAD |
| Proposal alignment | PASS. Scope, non-goals and success criteria are met. Q1 changed to box only by the user. Live box success criterion met |
| Budget | WARN (informational): ≈1,628 LOC against ~1,600, and 11 review rounds against 10 approved. The user approved each raise and T6; the 11th round is reported here |

## 9. Test Evidence Summary

| Suite | Tests | Result |
|---|---|---|
| `test/install-grokbot.test.js` (author, TDD) | 33 | 33 pass |
| `test/install-grokbot-edge.test.js` (Tester + T6) | 14 | 14 pass |
| Rest of the repository | 506 | 506 pass |
| Live box (manual, NFR-6) | — | PASS |

Accepted gaps (`test-report.md` §9): spawning `update` (static trace plus a live run), the "restore also fails" branch, and Linux-only partial-delete behavior (covered by the CI legs).

## 10. Agent Guide / Constitution Impact

No `## Constitution Impact` block was recorded: no new module, and no moved boundary. `AGENTS.md`, `CONTRIBUTING.md` and `.claude/README.md` now name six install targets (T5). No child guide is needed. A CodeGraph re-index is pending for `/akili-archive`, because `bin/akili.js` changed heavily.

## 11. Remediation

| # | Item | Severity | Route |
|---|---|---|---|
| 1 | FR-1 dry-run clause | WARN | **Done**: amended in `requirements.md` |
| 2 | Proposal staging references and Status | WARN | **Done** |
| 3 | Task count, rounds, test count, T1 wording, design §4, P-10/P-11 | WARN | **Done** |
| 4 | N1, N2: hints missing root flags | WARN (advisory) | Follow-up `/akili-quick` or a small fix spec; does not block the archive |
| 5 | N3–N5 and the carried advisories | Advisory | Kaizen / backlog |

## 12. Archive Readiness Recommendation

**Ready to archive.**
- All 7 tasks are done, and 0 FAIL findings remain.
- The spec-doc WARNs were closed in this validation.
- The remaining WARNs (N1/N2 and the informational budget overrun) are accepted, with follow-up routes.
- The live Grok Bot check passed.

```text
/akili-archive changes/grokbot-target
```
