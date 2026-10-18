# Archive Summary — Antigravity registry refresh (Gemini 4 Argon)

**Delivered and validated.** The packaged Antigravity registry routes T1/T3 to `gemini-4-argon-high`, the retired ids are gone, and Argon roles are honestly skipped instead of being bound to an unconfirmed wrapper tier. Final validation: **PASS** — 44 PASS / 3 WARN (carried) / 0 FAIL at `33ddd3c`.

## 1. Document Control

| Field | Value |
|---|---|
| Spec | `changes/antigravity-argon-registry` |
| Type / Depth / Approval | Change · Lite · gated |
| Archived | 2026-10-18, from branch `JuankCadavid/argon-registry` (a spec branch — `Default Branch: master`, no integration pin) |
| Last implementation commit | `33ddd3c` (T5); validation re-run `431c865` |
| Push / release / publish | None — local commits only, at the user's instruction |

## 2. Original Spec Path

`docs/specs/changes/antigravity-argon-registry/`

## 3. Archive Date

2026-10-18

## 4. Final Status

| Phase | Result | Commit |
|---|---|---|
| Proposal | Approved (Option A) | `43bc5d6` |
| Requirements / Design / Tasks | Approved; design Amendments A1–A5 | `b8289f6`, `186c6a0`, `6e802a5`, `fd83477` (A4), `3425294` (A5) |
| Execute | 5/5 tasks PASS — T1 (2 attempts), T2, T3, T4, T5 (2 attempts) | `2f0235f`, `b00440b`, `afea75c`, `25a6238`, `33ddd3c` |
| Test | PASS — 259/259 unit, 4/4 CLI integration | `20184cc` |
| Validate | PASS with 6 WARN → re-validated PASS, W1–W3 fixed, W4–W6 carried | `1c6600a`, `431c865` |

## 5. Requirements Delivered

| ID | Delivered |
|---|---|
| FR-1 | `models[]` lists exactly the 5 routed ids, all served by `agy models`, with labels byte-equal to its output; retired `gemini-3.1-pro-high` / `claude-sonnet-4-6` removed |
| FR-2 | T1/T3 → `gemini-4-argon-high`; T3 Fallback `claude-sonnet-5-5-high` / `sonnet`; other hosts deep-equal to the baseline |
| FR-3 | Argon has no `wrapperModel` (`agy plugin validate` accepts only `inherit`/`flash`/`pro`). Leader and Reviewer are skipped with a reason; Implementer and Tester get `flash`. Documented in `docs/model-routing.md`, Step 8C/8E (prose and example), `docs/commands`, and `docs/cli.md` |
| FR-4 | `lastVerified` and doc pins set to 2026-10-18; the drift test still goes red on a bad id |
| FR-5 | Retired-id tests rebased; 136 → 136 titles, no assertion loosened |
| NFR-1..3 | Verification green; CHANGELOG `Unreleased` (patch) quote-checked; local `[SPEC:…]` commits only |

## 6. Files Changed Summary

| File | Change | Task |
|---|---|---|
| `.claude/templates/model-registry.json` | `hosts.antigravity` roster, tiers, `lastVerified` | T1 |
| `docs/model-routing.md` | T1/T3 cells, pins, Antigravity paragraphs ("Argon is not a wrapper tier", "Upgrading an existing Antigravity project"), wrapper-value row, `:242` condition | T1, T5 |
| `.claude/commands/akili-constitution.md` | Step 8C wording; Step 8E `model` row, example wrapper (Implementer `flash`), wrapper list, `/agents` check | T2, T4, T5 |
| `docs/commands/akili-constitution.md` | `:94` T3 wording; `:98` Reviewer-wrapper guarantee qualified | T2, T5 |
| `docs/cli.md` | `:448` Argon picks write no wrapper | T2 |
| `bin/routing.js` | `:842` `/agents` report only when a Leader wrapper is planned | T3 |
| `test/routing.test.js` | Rebased tests 66, 69, 82, 134, 135 `(i)`, `(g)`, empty-T4; registry-clone seam for `pro`/`tools:` | T3 |
| `CHANGELOG.md` | `Unreleased` `### Changed` + `### Fixed` | T3, T4, T5 |

The implementation diff from `6e802a5` is about 175 changed lines.

## 7. Test Evidence Summary

`test-report.md`: PASS. `npm test` 259/259, drift test 7/7 with falsifier red, CLI integration 4/4 (fresh project, `agy plugin validate` of the rendered wrappers, idempotent re-run, retired id rejected). Five accepted gaps (A–E): `agy`-dependent roster checks, dates, the `pro` probe, template debt, and the silent degrade.

## 8. Validation Summary

`validation-report.md`, re-validated at `33ddd3c` by an independent Opus validator: **PASS** — 44 PASS, 3 WARN, 0 FAIL, 0 BLOCKED. W1–W3 (stale Step 8E `/agents` and wrapper-list prose, the `docs/commands:98` guarantee, the unconditional `:242`) were fixed by T5 via Pivot A5.

## 9. Accepted Warnings Or Follow-Ups

| Item | Disposition |
|---|---|
| W4 — figure drift across the spec documents (14 vs 16 candidates, "16 given" vs 19, 9 vs 10 grep hits) | Carried → Kaizen (`digest-update` on KZ-002) |
| W5 — `.claude/templates/model-routing.section.md:48` still says "Gemini 3.1 Pro as the T3 auditor" (A2 known debt) | Follow-up: the queued template-evolution Bug (editing the template refuses existing fences) |
| W6 — T4 cites FR-3 `BUT` by paraphrase | Carried → Kaizen "noted" |
| Silent degrade on a plain re-run of an existing Antigravity project (A3, P-14) | Follow-up: separate Bug proposal; upgrade path documented |
| DD-4 — which model `model: pro` runs on | Follow-up: the user's live probe; if it is Argon, set `wrapperModel: "pro"` on `gemini-4-argon-high` |
| Execution advisories (T1 ×3, T2 ×3, T3 ×3, T4 ×2) | Recorded in `execution.md`; not actioned |

## 10. Historical Notes

- Q1 was settled at specify by a primary source: `agy plugin validate` on a scratch plugin. A live `pro` probe was blocked by the session's permission classifier.
- Two Pivots after the tasks gate:
  - A4 came from a T2 Reviewer advisory: the Step 8E example YAML still showed a `pro` Reviewer.
  - A5 came from validation W1–W3.
  - Both trace to a design-time consumer sweep (P-7) keyed on a backticked identifier instead of the obligation.
- T5's FAIL came from the Leader's own DD-8 wording. A parenthetical sat after the clause about the opposite role set, and the Implementer copied it verbatim.
- `.agents/` is gitignored and was absent in this worktree. It was copied from the main checkout before the first spawn.
