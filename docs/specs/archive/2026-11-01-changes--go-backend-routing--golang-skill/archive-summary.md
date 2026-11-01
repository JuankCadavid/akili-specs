# Archive Summary — Go stack skill (`golang-pro`)

> **Outcome: delivered.** `golang-pro` (Jeffallan, MIT) ships as the 32nd packaged skill, binding `stack`. It is vendored byte-identical at `078a25c` with `LICENSE` and `NOTICE` and hash-locked by a contract test. It was security-reviewed before admission, and JC kept the scanner-flagged documentation link inert (Option A). Validation is PASS with 3 accepted WARNs.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/go-backend-routing/golang-skill` |
| Parent Spec | `changes/go-backend-routing` (family child 1 of 2) |
| Archive Date | 2026-11-01 |
| Branch | `JuankCadavid/go-backend-routing` (spec branch; `Integration Branch: dev` pinned) |
| Approval Mode | pre-approved (JC 9:56) plus HITL decisions at 10:21, 10:44 and 11:08 |
| Commits | `7067fe9` proposals … `77a93f3` validate (local only, not pushed) |

## 2. Final Status

| Phase | Result |
|---|---|
| Specify (Lite) | judgment-day APPROVED after 2 confirmed severe findings were fixed (CRLF, governance row) |
| Execute | 5/5 tasks PASS; 9 review rounds (budget raised by JC 6→8→9); ≈300 LOC authored vs ~330 |
| Test | PASS, 1249/0 (+1 FR-4 docs-page test at this phase) |
| Validate | PASS, 3 WARN (accepted), 0 FAIL; 2 figure corrections |

## 3. Requirements Delivered

| ID | Delivered |
|---|---|
| FR-1 | Security verdict before vendoring, with the battery quoted verbatim; Trust Hub reason found (an `EXTERNAL_DOWNLOADS` flag on upstream's own GitHub Pages docs URL) |
| FR-2 | 8-file folder, upstream bytes locked, `LICENSE` + `NOTICE`, `.gitattributes -text` |
| FR-3 | `golang-pro` in the four stack-skill candidate pools; never load-directed |
| FR-4 | Docs page with samber note, inventory/overview/governance rows, 31→32 counts, CHANGELOG `Unreleased` |
| FR-5 | Installed and `OK` on every target; `bin/` unchanged |
| NFR-1–3 | 52,775 B; no samber byte; all gates green |

## 4. Files Changed

| Area | Files |
|---|---|
| Package content | `.claude/skills/golang-pro/` (8), `.gitattributes` |
| Command text | `.claude/commands/akili-constitution.md`, `.claude/commands/akili-specify.md`, `docs/commands/akili-constitution.md` |
| Docs | `docs/skills/golang-pro.md` (new), `docs/skills/README.md`, `docs/overview.md`, `docs/skills/governance.md`, `docs/cli.md`, `CHANGELOG.md` |
| Tests | `test/golang-skill.test.js` (new, 16), `test/install-cursor.test.js`, `test/akili-marketing-docs.test.js`, `test/diagram-design.test.js`, `test/fixtures/doctor-codex-baseline.txt` |

## 5. Test Evidence

`test-report.md`: 1 suite inline. Hash and pool falsifiers were observed red (T4, plus 2 at test). Install and doctor ran on all targets, and every installed copy is byte-identical to the source.

## 6. Validation Summary

`validation-report.md`: PASS. WARNs:
- W-1: budget raised twice (accepted).
- W-2: the flagged link ships inert (accepted, Option A).
- W-3: CHANGELOG bullet 2 wording, to split at release prep.

## 7. Accepted Warnings and Follow-Ups

| Item | Owner |
|---|---|
| W-3: split CHANGELOG bullet 2 at release prep | the release preparer (JC) |
| Release: minor (proposal Q1) | JC; not part of this run |
| Sibling `changes/go-backend-routing/backend-skill-routing` | waits for `changes/design-skill-routing` in `dev`; not started |
| CodeGraph re-index (`.codegraph/` present; new test file) | recommended to JC |
| Push/PR into `dev` | JC |

## 8. Historical Notes

- The skills.sh "Fail" was traced to a URL-reputation flag on upstream's own documentation link, not to content.
- `samber/cc-skills-golang` was rejected for vendoring on its own "install them together" advice.
- `.agents/` was copied from the main checkout into this worktree and `--fix`ed locally, the same as in `changes/impeccable-hardening`.

## 9. Diagrams

n/a: the spec has no diagram slots and no `diagrams/` folder.
