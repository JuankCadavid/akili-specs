# Archive Summary: `changes/docs-overview`

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/docs-overview` |
| Archive Path | `docs/specs/archive/2026-10-24-changes--docs-overview/` |
| Archive Date | 2026-10-24 |
| Branch | `JuankCadavid/docs-overview` (spec branch; `Default Branch: master`, `Integration Branch: dev`) |
| Final commit before archive | `a5e09d2` |
| Commits | Local only. Nothing pushed, merged, tagged, released or published |

## 2. Original Spec Path

`docs/specs/changes/docs-overview/`

## 3. Archive Date

2026-10-24

## 4. Final Status

**Delivered: ready with accepted WARNs.** 9 of 9 tasks `[x]`, each closed by a Reviewer PASS. `/akili-test` PASS (844 / 0). `/akili-validate`: 54 PASS · 4 WARN · 0 FAIL · 0 BLOCKED. W-1…W-3 were fixed after validation; W-4 is a pending guide-sync item (§9).

## 5. Requirements Delivered

| Requirement | Delivered as |
|---|---|
| FR-1…FR-10 | `README.md` rewritten as a 158-line landing page (was 954): hero, What is AKILI?, How it works, Install, Your first spec, Commands at a glance, Learn more, Contributing and license |
| FR-11 | New `docs/overview.md`: commands, skills by purpose (5 groups, with bindings), mechanisms, install targets, optional tools, glossary, I want to… |
| FR-12 | Every README heading has a disposition in the move ledger (43 rows + 8 marketing rows), each quoted at its destination |
| FR-13 | `docs/README.md` lists the overview first, links governance, and shows the anytime commands as a table with links |
| FR-14 | `docs/model-routing.md` Grok Bot line |
| FR-15 | README pins in four tests re-targeted to the overview and `docs/flow.md`; README negative guards kept |
| FR-16 | New `test/docs-overview.test.js` (13 tests, derived from the package) |
| FR-17 | Moved content in `docs/flow.md`, `docs/cli.md`, `CONTRIBUTING.md`, the `docs/openspec-comparison.md` Roadmap and the new `dotfiles/README.md`; Grok anchors fixed; governance item 5; `docs/skills/diagram-design.md` pointer; CHANGELOG entry |
| NFR-1…NFR-6 | Verified at T9, `/akili-test` and `/akili-validate` |

## 6. Files Changed Summary

| Area | Files |
|---|---|
| New | `docs/overview.md`, `dotfiles/README.md`, `test/docs-overview.test.js`, `test/docs-overview-contract.test.js` (added by `/akili-test`) |
| Rewritten | `README.md` |
| Extended | `docs/flow.md`, `docs/cli.md`, `CONTRIBUTING.md`, `docs/openspec-comparison.md`, `docs/README.md`, `docs/model-routing.md`, `docs/skills/governance.md`, `docs/skills/diagram-design.md`, `CHANGELOG.md` |
| Tests re-targeted | `test/branching-flow.test.js`, `test/akili-security-docs.test.js`, `test/diagram-design.test.js`, `test/akili-marketing-docs.test.js` |
| Untouched (NFR-3) | `.claude/**`, `bin/**`, `package.json`, `assets/**` |
| Size | +1,268 / −951 in shipped files at T9 (budget ~1,350 / ~955), plus the 417-line contract suite from `/akili-test` |

## 7. Test Evidence Summary

`npm test` → 844 pass, 0 fail (Node v22.12.0, darwin). The total went from 819 down to 812 (T5 dropped 7 README-site token tests, per design §9 S1), then up to 825 (T8) and 844 (`/akili-test`). Mutation evidence: 6 + 9 at T5, 17 at T8, 30 at `/akili-test`, each red on its assertion. No PRODUCT_BUG.

## 8. Validation Summary

54 PASS · 4 WARN · 0 FAIL · 0 BLOCKED (`validation-report.md`). The four execute-time design amendments (design §3 ×2 and §8 at T1, §7 at T6) are recorded and consistent.

## 9. Accepted Warnings Or Follow-Ups

| Item | Status |
|---|---|
| W-1 CHANGELOG test count / contract suite | Fixed (`a5e09d2`) |
| W-2 README authorship line overstated | Fixed (`a5e09d2`) |
| W-3 `execution.md` totals (rounds 14, 5 of 5 FAILs, 39 moved) | Fixed (`a5e09d2`) |
| W-4 `AGENTS.md:16` describes the old README | Pending: `factual-sweep` item in `docs/specs/kaizen/changes--docs-overview.md`, to apply on `dev` |
| `.claude/skills/diagram-design/SKILL.md:76` still says the Archify install is "in the project README" | Accepted Low risk; `/akili-quick` follow-up |
| Rendered GitHub anchors `#practical-example`, `#grok-bot---tool-grokbot` (P-13, P-14) | Confirm in the PR preview |
| Unresolved advisories (10, listed in `validation-report.md` §7) | Recorded only; no task |
| Windows / Node 18 CI legs | Not run locally; the PR's CI covers them |

## 10. Historical Notes

- Five Reviewer FAILs, all spec-content gaps: four were FR-12 content preservation (T1, T2, T4, T6) and one was an FR-13 clause (T7). Each was closed in one rework, and the rework briefs added a mechanical per-token sweep.
- Review rounds: 14 of 26 used, with no HALT, Pivot, checkpoint or runtime event.
- `.agents/` personas were deployed from `.claude/templates/` for this run. They are gitignored.

## 11. Diagrams

None. The spec is not architecturally significant (design §1) and has no `diagrams/` folder. The figure `assets/akili-flow.png` predates `/akili-marketing`, and its alt text lists five anytime commands (design §12). Refreshing it is a separate change.
