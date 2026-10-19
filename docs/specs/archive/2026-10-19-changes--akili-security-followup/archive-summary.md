# Archive Summary — `/akili-security` follow-up: pin literal, five safety advisories, Windows decision

**Outcome: Delivered and validated (PASS, 0 FAIL / 2 WARN accepted).** Local commits only on `JuankCadavid/security-followup`; no push, merge, release, tag or publish.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-security-followup` |
| Archive Path | `docs/specs/archive/2026-10-19-changes--akili-security-followup/` |
| Branch | `JuankCadavid/security-followup` (spec branch — `Default Branch: master`, no `Integration Branch:` pin) |
| Release class | Patch (recorded; not released) |

## 2. Original Spec Path

`docs/specs/changes/akili-security-followup/`

## 3. Archive Date

2026-10-19

## 4. Final Status

| Phase | Result |
|---|---|
| Execute | 5/5 tasks PASS (T1 ×1, T2 ×2, T3 ×3, T4 ×3, T5 ×2 attempts) |
| Test | PASS — 408/408; spec suites green on Node 18/20/22 |
| Validate | PASS — archive-ready |

## 5. Requirements Delivered

| ID | Delivered |
|---|---|
| FR-1 | Pin literal in Step 0.1 + pin-sync test across three sites |
| FR-2 | Restore offer (move the entry, skip-existing `--skills-only`, end command); never `--force`/`npx`; two-way containment |
| FR-3 | *Skill copy* in plan and index (no path in the index) |
| FR-4 | Upstream lead clause, four bullets and exposure rule quoted verbatim |
| FR-5 | Addendum mechanism slot |
| FR-6 | No git before Run or in Steps 4–5; `.git` read as untrusted data with hex/charset admission; `not determined` |
| FR-7 | Run directory always outside the target |
| FR-8 | Slug `bugfix/security-<YYYY-MM-DD>-r<N>-s<n>` |
| FR-9 | Windows stop unchanged; re-sync Windows gate; upstream request drafted (unfiled) |
| FR-10 | Restatements, tests, CHANGELOG; R-B limit stated |
| NFR-1…4 | 187 lines; vendored bytes intact; no `bin/`/routing change; all gates green |

## 6. Files Changed Summary

| File | Change |
|---|---|
| `.claude/commands/akili-security.md` | Steps 0–5, Error Handling, Checklist (174 → 187 lines) |
| `.claude/skills/security-audit/SKILL.md` | AKILI routing row only (`:207`) |
| `docs/skills/security-audit.md` | Slug, Platform support, re-sync step 4 + Windows gate step, R-B |
| `docs/commands/akili-security.md`, `docs/flow.md`, `README.md`, `docs/commands/README.md` | Restatements |
| `test/akili-security-command.test.js`, `test/security-audit-skill.test.js` | 61 → 89 and 6 → 7 cases (execute, TDD) |
| `test/akili-security-docs.test.js` | New, 19 cases (`/akili-test`) |
| `CHANGELOG.md` | `[Unreleased]` |
| `upstream-request.md` (this folder) | Draft for the maintainer to file |

## 7. Test Evidence Summary

408/408 `npm test`; 96 author tests + 19 doc-restatement tests on Node 18.20.8 / 20.20.1 / 22.12.0; 9/9 mutations of the new tests red. Details: `test-report.md`.

## 8. Validation Summary

PASS; 0 FAIL; WARN-1 (spec-folder path that moves at archive — repointed at archive), WARN-2 (historical line citation, accepted). One correction during validation: CHANGELOG test count 389 → 408. Details: `validation-report.md`.

## 9. Accepted Warnings Or Follow-Ups

| Item | Route |
|---|---|
| Windows CI legs | `UNVERIFIED` until the first push |
| `--out` with `..` not normalised; restore `--claude-target` without `--tool claude` | User-deferred → separate follow-up proposal |
| Other 4R advisories (`validation-report.md` §7) | Same follow-up proposal candidates |
| Upstream request | User files it against `cloudflare/security-audit-skill` |
| D-1…D-4 audit run | `/akili-security bin/akili.js bin/persona.js .claude/skills --profile standard` after merge (proposal) |
| Release | Patch, by the user, after push/merge |

## 10. Historical Notes

- Two execute-time design edits: `design.md` §7 row 4 (git-free branch suffix, after the T2 safety-lens FAIL) and §11 budget revision (~520 LOC, user-approved at the T2 gate).
- Run-time agent adherence to the rules text has no automated check (requirements §8, accepted).
- **Repoint at archive:** `docs/skills/security-audit.md:57` and `CHANGELOG.md` `[Unreleased]` Notes pointed at this folder's `upstream-request.md`; they were repointed to the archive path in the archive commit (validation WARN-1; single-answer factual fix to this spec's own deliverables).

## 11. Diagrams

No `diagrams/` folder; `design.md` §3 has one inline Mermaid flow. No baseline diagram slot made stale (this repo has no PRD/UX/TRD baseline docs).
