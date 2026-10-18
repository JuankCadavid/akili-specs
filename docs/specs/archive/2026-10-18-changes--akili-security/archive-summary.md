# Archive Summary — `/akili-security` (changes/akili-security)

**Outcome: delivered.** All 13 tasks are `[x]`. Tests pass 325/325 on Node 22 and Node 18. Validation is PASS with 8 WARN accepted by the user, 0 FAIL, and 1 BLOCKED (Windows CI, which waits for the first push). Commits are local only: no push, tag, release or publish.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-security` |
| Depth / Type | Full (compact) / Change |
| Approval Mode | `gated` |
| Branch | `JuankCadavid/skill-security-audit` (worktree `skill-security-audit`; spec branch) |
| Base → HEAD | `6d1e152` (proposal) → archive commit |
| Release class | **minor** (new command) — not released in this change |

## 2. Original Spec Path

`docs/specs/changes/akili-security/`

## 3. Archive Date

2026-10-18

## 4. Final Status

| Gate | Result |
|---|---|
| Tasks | 13 / 13 `[x]` (12 planned + T7a, added by the user-approved Pivot) |
| Tests (`test-report.md`) | **PASS** — 325/325 (Node 22.12.0, 18.20.8); 60 new text-contract tests; no `PRODUCT_BUG` |
| Validation (`validation-report.md`) | **PASS with warnings** — 0 FAIL · 8 WARN (all accepted) · 1 BLOCKED (Windows CI) |
| Budget | 13 tasks / ~575 LOC / **21 review rounds** against 12 / ~650 / 18 — the overrun was user-authorized step by step |

## 5. Requirements Delivered

| Requirement | Delivered by |
|---|---|
| FR-1 Vendored `security-audit` skill (19 files, MIT, pin `c1c8a8c`), upstream tests excluded | T1, T4 |
| FR-2 … FR-12 `/akili-security` command: preflight, plan gate, static-only execution gate, target-content-is-data addendum, artifact location, validator gate, redacted index, Guidance review fallback, routing gate, additive re-runs, report-only | T2, with T7a for gate wording; behaviour observed in the T8 dogfood run |
| FR-13 `docs/specs/audits/` readers take `drift-*.md` only | T3a–T3d, T5b |
| FR-14 Governance, docs, `AGENTS.md`, CHANGELOG | T5a, T5b, T6, T7 |
| NFR-1 … NFR-6 | T2, T4, T7 — NFR-3 Windows open (P-13) |

Execute-time amendments, approved by the user: T-1 (run path by location), T-2 (FR-12 counts only tracked content), T-3 (FR-4 *who*), and Pivot T7a (the plan gate stops on every run; the routing gate stops whenever it is reached).

## 6. Files Changed Summary

| Area | Files |
|---|---|
| New command | `.claude/commands/akili-security.md` (173 lines) |
| Vendored skill | `.claude/skills/security-audit/` (19 files; only `SKILL.md` adapted) |
| Reader scoping | `.claude/commands/akili-archive.md`, `akili-audit.md`, `akili-constitution.md`, `.claude/skills/kaizen/SKILL.md` |
| Tests | `test/security-audit-skill.test.js` (new), `test/akili-security-command.test.js` (new), `test/install-cursor.test.js`, `test/fixtures/doctor-codex-baseline.txt` |
| Docs | `docs/commands/akili-security.md`, `docs/skills/security-audit.md` (new); `README.md`, `docs/cli.md`, `docs/flow.md`, `docs/commands/README.md`, `docs/commands/akili-{archive,audit,constitution}.md`, `docs/skills/{README,governance,kaizen}.md` |
| Guides / release notes | `AGENTS.md` (*Skill Usage*), `CHANGELOG.md` (Unreleased) |
| Audit artifact | `docs/specs/audits/security-2026-10-18-JuankCadavid--skill-security-audit.md` (redacted index, user-approved) |

Unchanged since the base (NFR-1, NFR-2, NFR-6): `bin/`, `.claude/templates/`, `docs/model-routing.md`, `package.json`.

## 7. Test Evidence Summary

| Suite | Evidence | Result |
|---|---|---|
| S1 — skill + install payload | `security-audit-skill.test.js` (T1, written red first), install counts (T4) | PASS |
| S2 — command text contract + reader scoping | `akili-security-command.test.js`, 60 tests; 4 falsifiers turned red | PASS |
| S3 — runtime behaviour | T8 dogfood run: `--profile quick`, scoped, static-only; 0 findings, 12 units covered, 4 deferred; both validators exit 0 | PASS on the exercised branches |

## 8. Validation Summary

An independent T3 auditor re-ran tests, pack, install and doctor on HEAD. Every FR/NFR clause has an owning task and evidence. 0 FAIL. 8 WARN, dispositioned at the archive gate (see §9).

## 9. Accepted Warnings Or Follow-Ups

| Item | Disposition |
|---|---|
| W-1, W-5, W-7 (spec-doc drift) | Fixed before archive (`356a969`) |
| W-6 CHANGELOG figures (+297,685 B; 325 tests) | **Before the release commit** |
| W-2 pin literal in the provenance check; A-4…A-8 (slug collision, sandbox-control list, unrecorded foreign copy/mechanism, `--force` scope, preflight `git` in the target) | **Separate proposal** |
| D-1…D-4 (deferred audit units: `init` local-scope roots, skill executables, `SKILL.md` ingestion, `persona.js` parsing) | **Separate proposal / a later `standard` run** |
| W-3 redaction unexercised | Accepted |
| W-4 Windows CI (P-13) | Verified at the first push |
| W-8 review round 21 | Accepted by the user |
| Kaizen | `docs/specs/kaizen/changes--akili-security.md` — 2 lessons + 1 KZ-002 recurrence; 3 pending items for the apply phase on `master` |
| CodeGraph | Re-index recommended (a new command and a skill tree were added) |

## 10. Historical Notes

- The proposal chose a new command over an `/akili-audit` activation. DD-2 reversed the proposal's plan to vendor the upstream tests after P-3 showed Node 18 discovers `*.test.cjs` under `.claude/`.
- DD-7 deferred a model-routing row because a template edit would break existing projects; a follow-up bug is recorded.
- T2 needed three attempts: a safety-lens FAIL, then an FR-6 regression on the conformance lens. The spec tensions from the specify-gate adjustments were settled by amendment, not carried to closure.
- The dogfood run was interrupted by a host session limit and resumed from on-disk state without re-running any agent. Its index is the first `security-*.md` in this repository.
