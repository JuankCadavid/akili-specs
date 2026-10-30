# Tasks: changes/impeccable-design

| Field | Value |
|---|---|
| Spec Path | `changes/impeccable-design` |
| Baseline | `npm test` → 1195 pass, 0 fail at `702a584` |
| Commit prefix | `[SPEC:changes/impeccable-design]` — local commits only; no push, PR, tag, publish or release |

| ID | Task | Files | Covers |
|---|---|---|---|
| T1 | Bridge skill + evaluation reference | `.claude/skills/impeccable-bridge/**` | FR-1..FR-7, NFR-1 |
| T2 | Wire constitution, specify, propose | three command files | FR-8, FR-12 |
| T3 | Wire validate, test | two command files | FR-9, FR-10 |
| T4 | `/akili-audit design` mode | `akili-audit.md` | FR-11 |
| T5 | Realign `ui-ux-pro-max`, `frontend-design` | two SKILL.md | FR-13 |
| T6 | Docs + CHANGELOG | docs/**, README, CHANGELOG | FR-14 |
| T7 | Tests + full suite | `test/impeccable-bridge.test.js`, `test/install-cursor.test.js` | NFR-4 |
