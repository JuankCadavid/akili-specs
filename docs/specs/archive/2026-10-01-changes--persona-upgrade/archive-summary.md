# Archive Summary — Give Deployed Personas an Upgrade Path

**Outcome:** shipped in full. Deployed personas now carry AKILI-owned section markers and a project block; `akili doctor --agents [--fix]` reports and repairs drift against the CLI's packaged templates with a backup before every write; Safe Update replaces owned sections instead of appending. Validated 2026-10-01 with 0 FAIL after two spec amendments (A10, A11); 7 WARNs carried with named routes.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/persona-upgrade` |
| Type / Depth / Mode | Change · Full · `gated` through T2b, `pre-approved` from T3 |
| Proposed → Approved | 2026-09-30 (proposal, requirements, design, tasks — all same day) |
| Executed | 2026-09-30, `350c7eb` → `00ccaee`, 17 `[SPEC:changes/persona-upgrade]` commits on `master` |
| Validated | 2026-10-01, `3a5913e` (one more spec commit: report + amendments) |
| Archived | 2026-10-01 |
| Archive path | `docs/specs/archive/2026-10-01-changes--persona-upgrade/` |
| Release | pending — `CHANGELOG.md` `Unreleased`, proposed **minor** (v2.30.0) |

## 2. Original Spec Path

`docs/specs/changes/persona-upgrade/` — proposal, requirements, design, tasks, execution, judgment, closure, validation-report, this summary.

## 3. Archive Date

2026-10-01.

## 4. Final Status

| Measure | Value |
|---|---|
| Tasks | **14 of 14** `[x]` (13 planned + T2b added at the T2 gate for a spec gap) |
| Reviewer verdicts | 25 of 26 budgeted rounds; every task closed `PASS`; no `REVIEW_WAIVED`, `REVIEW_SKIPPED`, HALT or Pivot |
| Tests | 69 (`node:test`), `npm test`, now in CI (ubuntu/macos/windows × Node 18/22) |
| Validation | 0 FAIL (2 found, both resolved by amendment at the gate) · 7 WARN · 0 BLOCKED |
| Budget | tasks 14 vs 13 · lines 3,118 vs ~750 (cap removed at the T3 tripwire; fixtures 2,012 and `digests.json` 6,053 lines excluded) · rounds 25 vs 21 → 26 |

## 5. Requirements Delivered

| ID | Delivered | Note |
|---|---|---|
| FR-1 Section markers | ✓ | 22 sections / 19 distinct ids; growth 2,170 of 2,200 bytes |
| FR-2 Project block | ✓ | one per template; *Injection scope* writes only there; "The project block below overrides any marked section." |
| FR-3 States + `doctor --agents` | ✓ | nine section states + `.agents/` absent; dense + legacy digests (1,199 entries, 73/73/48/73 tags) |
| FR-4 `--fix` with backup | ✓ (amended A10, A11) | replace / insert / migrate / install; branch + dirty guards; `--dry-run`; backup `.agents/.backup/<role>.md.<YYYYMMDD-HHMMSS>` |
| FR-5 Migration | ✓ | exact → heading+opening-sentence; never heading alone; extent by level; record before the project block |
| FR-6 Safe Update replaces | ✓ | Step 8B bullet + *Injection scope* lead; "append a minimal upgrade block" removed everywhere |
| FR-7 Audit row | ✓ | item (c) of *Model Generation Drift* names the states and `--fix` |
| FR-8 Docs + CHANGELOG convention | ✓ | `docs/cli.md` *Persona Drift* is the one home; mirrors, README, flow updated |
| FR-9 Tests | ✓ | `node:test`, no dependency, 21 fixtures with pinned line endings, red-before-green recorded per test |
| FR-10 Rollout / rollback | ✓ (WARN R6 carried) | reversible from backup; plain `doctor` code path unchanged, its outcome on a pre-existing install needs `akili update` |
| NFR-1…7 | ✓ | NFR-4 amended A10 (majority-EOL normalization is not a deletion) |

## 6. Files Changed Summary

From `execution.md` and the commit range `350c7eb..3a5913e`:

| Area | Files |
|---|---|
| Templates | `.claude/templates/{leader,implementer,reviewer,tester}.md` (markers, project block, one bullet each); `.claude/templates/digests.json` (new, 347 kB) |
| CLI | `bin/akili.js` (`doctor --agents`, guards, backup, atomic write, `loadTemplates`, resource wiring); `bin/persona.js` (new: parser, states, fix, migration, digest helpers) |
| Release / CI | `scripts/release.js` (digest step, `since=` rewrite, pre-bump asserts); `scripts/release-status.js` (version drift); `scripts/ci/install-layout-regression.js`; `.github/workflows/ci.yml` (`npm test`); `package.json` (`test` script) |
| Tests | `test/agents-doctor.test.js`, `test/agents-doctor-io.test.js`, `test/persona-digests.test.js`; `test/fixtures/personas/` (21 fixtures + `.gitattributes`) |
| Commands | `.claude/commands/akili-constitution.md` (Step 0 policy bullet, Step 8B Safe Update, *Injection scope*, inline draft, Step 8C); `.claude/commands/akili-audit.md` (item (c), two remediation sentences, pointer removed) |
| Docs | `docs/cli.md` (*Persona Drift* section); `docs/commands/akili-constitution.md`; `docs/flow.md`; `README.md`; `CHANGELOG.md` |
| Spec folder | `closure.md` (T10 walks), `validation-report.md`, this summary |

## 7. Test Evidence Summary

| Source | Evidence |
|---|---|
| `npm test` | 69/69 at validation; each code task recorded red-before-green per test after review (T2 r2, T3 continuation, T4 r2, T5 continuation closed the gaps) |
| Falsifiers | executed on every task; T10's `unreadable`-guard removal showed H1 silently reading `current` |
| Closure walks (`closure.md`) | states 11/11 · fix safety 16/16 · migration 3/3 · Safe Update 2/2 · FR text term by term; held-out H1–H4 |
| `test-report.md` | **absent, accepted**: `/akili-test` was not run — FR-9's suite is the spec's own gate (execution §3, validation §9) |
| Real-world run | this repository's own `.agents/` upgraded at the validation gate (R8): 19 `CURRENT`, 1 `CUSTOM-EDITED`, 2 `UNLOCATED`, exit 0 |

## 8. Validation Summary

`validation-report.md`, 2026-10-01, Fable 5.1 as T3 Auditor (Implementer `sonnet`, Reviewers `opus`).

| Finding | Resolution |
|---|---|
| R1 FR-4 "any byte" vs design §5.1 majority-EOL writer (reproduced on a mixed-EOL persona) | **A10** — FR-2, FR-4, NFR-4 amended; `docs/cli.md` and CHANGELOG reworded; user chose the amendment over a code change |
| R10 FR-4 "twice" vs FR-5 `outdated`-after-migration (observed on this repo's `.agents/`) | **A11** — FR-4 and design §5.4 amended; `docs/cli.md` *Migration* gains the three-run explanation |
| R8 requirements §8 gate (first real run on this repo's personas) | executed; see §7 |

## 9. Accepted Warnings Or Follow-Ups

| # | Item | Route |
|---|---|---|
| R2 | untracked `.agents/` refused by the dirty guard though FR-4 says "git-tracked" (conservative; `--force` overrides) | FR-4 wording — one clause, next time the spec family is touched; behavior stays |
| R3 | `akili doctor --help` omits `--agents`, `--section`, `--allow-branch` | `/akili-quick` |
| R4 | literal "Advisory:" at `docs/cli.md` lines 324 and 326 | `/akili-quick` |
| R5 | CI has never run `npm test` (commits unpushed at archive time) | `git push`; watch the first `windows-latest` / Node 18 legs |
| R6 | FR-10 bullet 1 / design §6 "byte-for-byte" vs DD-11 outcome on a pre-existing install | FR-10 wording; CHANGELOG already states the real behavior |
| R7 | Step 8B by-hand fallback silent on "no CLI and no `digests.json`" | `/akili-quick` (one clause) or the next constitution spec |
| R9 | nothing-fenced migration drops the file's final newline | `/akili-quick` or Bug Track (one `eol` append + one assertion) |
| — | this repo's `.agents/`: `--section shared-file-discipline` to insert the missing guardrail in `leader.md` / `implementer.md`; review the heading-fenced `delegation` | maintainer, any time |
| — | 11 execution advisories recorded in `execution.md`, none absorbed (unanchored pin regex, guards fail open on git errors, monorepo `.agents/` subdirectory, same-second `EEXIST`, silent `--section` on a `current` id, stale Options table in `docs/cli.md`) | proposal material, not tasks |

## 10. Historical Notes

- **Origin.** The user's question after v2.29.0 shipped a hand-migration note: *"¿cómo puede un usuario hacer esto? ¿ejecutando nuevamente el akili-constitution?"* The proposal chose Option B (markers + CLI) over prose-only (A) and regenerate-from-manifest (C).
- **Judgment day** closed `ESCALATED` (7 severe confirmed by both judges, 2 split, 14 warnings, 3 suggestions); the user chose *Fix only*; corrections were not re-judged. The P-11 figure (STAR's persona shape) was refuted at judgment and re-measured.
- **Execute-time changes:** T2b added (fixture `.gitattributes`); approval mode `gated` → `pre-approved` from T3; budget tripwire fired twice (lines, then rounds); design §5.2 (extent of `primary-instructions`) and §5.3 (entry shape `{body, head, open}`) clarified before T4; P-13/P-14 settled by a 13-file survey.
- **Harness evidence.** Three Leader evidence re-runs caught defects no Reviewer blocked on (a test reading a gitignored file; a false `EXIT: 0` in the closure; a worker writing to the live `.agents/`, recovered from the backups the CLI had just written). Seven of 26 Implementer spawns ran past the 60-call bound with every self-count lower — the deployed persona predated the bound, which is the drift this spec exists to fix.
- **Kaizen entry:** `docs/specs/kaizen/changes--persona-upgrade.md`.
