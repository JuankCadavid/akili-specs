# Archive Summary — akili-panel-model-skills

**Delivered.** The Akili pane (plugin 1.1.0) now shows the session's `model`, a collapsed Skills list whose presses run AKILI's skills, and a small AKILI title sized to fit the pane (amendment A1). All 6 tasks are done. Tests pass (`npm test` 1903/1903; plugin kit 106/106 on 2.1.322 and 2.1.318). Validation: PASS with 4 WARN, all accepted by JC.

## 1. Document Control

| Field | Value |
|---|---|
| Spec | `changes/akili-panel-model-skills` |
| Owner | JC (Juan Carlos Cadavid) |
| Branch | `JuankCadavid/akili-panel-model-skills` (spec branch; apply-capable branch `dev`) |
| Approval Mode | gated |
| Commits | 11 on the branch since `origin/dev`, all local; nothing pushed, merged, released or tagged |

## 2. Original Spec Path

`docs/specs/changes/akili-panel-model-skills/`

## 3. Archive Date

2026-11-11

## 4. Final Status

| Phase | Result |
|---|---|
| Execute | T1–T6 `[x]`. T5 closed without a 9th review round, by JC's choice («Opción B: cierra T5 sin la ronda 9 y haz commit») |
| Test | PASS, 0 PRODUCT_BUG (`test-report.md`) |
| Validate | PASS, 4 WARN, 0 FAIL (`validation-report.md`) |
| JC acceptance | «Sí, acepto las 4 advertencias; sigue con /akili-archive changes/akili-panel-model-skills» |

## 5. Requirements Delivered

| Req | Delivered |
|---|---|
| FR-1 | `model` row with the full model id; refreshed on `/model` and after `/clear`; `model —` when unknown |
| FR-2, FR-3 | `Skills (N)` row, closed by default; groups `core` / `conditional` / `stack`, one open at a time |
| FR-4 | A press on a skill runs it; double press guarded and dimmed; a refused run shows a toast |
| FR-5 | Listed skills = `SKILL_CATALOG` ∩ installed commands; read only |
| FR-6 | Narrow panes: the model id is never dropped from 14 columns up |
| FR-7 | Height: asks for 21 rows; the person's size stays theirs |
| FR-8 | Everything else unchanged from 1.0.0 (checked over 1936 cases) |
| FR-9 | Docs, README, CHANGELOG, governance line, version 1.1.0 |
| FR-10 (A1) | AKILI title: two rows from 15 columns, one bold row from 5 to 14 columns or when only one row is spare, none otherwise; it never pushes Next out of view |

## 6. Files Changed Summary

1,515 lines added and 73 deleted outside `docs/specs/` (`git diff --stat origin/dev...HEAD`), across 14 files:

| Area | Files |
|---|---|
| Plugin code | `hooks/flow.mjs` (+161), `hooks/register.jsx` (+39), `types/index.d.ts`, `.claude-plugin/plugin.json` (1.1.0) |
| Tests | `test/akili-panel-flow.test.js`, `-catalog`, `-contract`, `-flow-coverage`, `-test-phase` (new); `tests/panel.test.tsx` |
| Docs | plugin `README.md`, `docs/plugins/akili-panel.md`, `docs/skills/governance.md`, `CHANGELOG.md` Unreleased |

Budget: ~750 LOC raised to ~850 at T3 and to ~980 by A1. JC accepted ≈1,228 at the T6 gate. Tests made up most of the overrun.

## 7. Test Evidence Summary

The suite went from 1895 to 1903 tests; the plugin kit went from 98 to 106 cases, all passing on both host versions. The 16 new Tester cases were each shown red by a temporary edit to the product code, which was then reverted. Live-only behavior (a real skill run, the `/model` dialog, scrolling, light and dark) was checked in T5, with JC's sign-off «Sí, lo vi en claro y oscuro».

## 8. Validation Summary

7 WARN at audit time. Three figure WARNs were corrected after the audit (`design.md` §8.6 rows 21, §11 premise count 13, the budget row in the `execution.md` Document Control), leaving PASS with 4 WARN.

## 9. Accepted Warnings Or Follow-Ups

| # | Item | Status |
|---|---|---|
| 1 | T5 closed without a 9th review round | Accepted (JC, option B) |
| 2 | FR-1 model not re-read after resume (judgment W-1) | Accepted; follow-up candidate |
| 3 | NFR-4: a missing `$.session.model` / `$.command.list` throws synchronously and empties both fields | Accepted; one-line hardening candidate (`Promise.resolve().then(...)`) |
| 4 | Design detector cannot scan a terminal pane | Accepted; JC's light/dark sign-off stands in for it |
| — | Next: push + PR into `dev` (CI), then a minor release including plugin 1.1.0 | JC |

## 10. Historical Notes

- **Amendment A1:** JC asked for an AKILI title mid-execution («Mételo en el cambio actual»). It went through an approved amendment (FR-10, DD-9, T6), not scope creep.
- One spec tension at T2 was settled at JC's gate. There were 2 budget tripwires, both accepted by JC.
- During the T5 look, JC pressed Next by accident. That ran `/akili-execute`, which he stopped; nothing was edited.
- `claude --plugin-dir` and `claude plugin test` leave `.claude/skills/akili-panel/tsconfig.json` and `.claude-plugin/types/` behind. `.claude-plugin/types/` makes the install tests fail until it is deleted (Kaizen *Noted*).

## 11. Diagrams

The spec has no `diagrams/` folder or diagram slot. No baseline diagram was made stale.
