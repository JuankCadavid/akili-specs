# Archive Summary — branching flow: `dev` integration branch and `next` prereleases

## 1. Document Control

| Field | Value |
|---|---|
| Original Spec Path | `docs/specs/changes/branching-flow-dev-next/` |
| Archive Path | `docs/specs/archive/2026-10-19-changes--branching-flow-dev-next/` |
| Archive Date | 2026-10-19 |
| Branch | `JuankCadavid/branching-flow` — Branch Context **spec** (`Default Branch: master`, `Integration Branch: dev`) |
| Approval Mode | `pre-approved (user, 2026-10-19)` — local commits only: no push, PR, tag, release or `npm publish` |
| Final Status | **Delivered — validation PASS WITH WARNINGS, archive-ready** (0 FAIL · W-1, W-4 fixed in validation, W-2 fixed at archive, W-3 pending, W-5/W-6 accepted) |

## 2. Requirements Delivered

| Requirement | Delivered |
|---|---|
| FR-1 | `ci.yml` and `release-status.yml` run on pushes to `master` and `dev`; job name / matrix (required checks) unchanged; CI syntax step checks `scripts/release-next.js` |
| FR-2–FR-5 | `npm run release:next -- <patch\|minor\|major> [--dry-run] [--otp=<code>]` — `X.Y.Z-next.N` from the registry, six guards (Branch, Clean, In sync, Stable source, Source published, Base ahead), `npm publish --tag next`, ephemeral `package.json` version restored on success, failure and SIGINT/SIGTERM/SIGHUP |
| FR-6 | `release:status` lists `npm next:` / `npm prereleases:`, never artifact-checks prereleases (W-1 fix included), flags a leftover prerelease in `package.json` |
| FR-7 | One flow in `AGENTS.md`, `CONTRIBUTING.md`, `docs/release-checklist.md`, `README.md`: `feat/`/`fix/` → `dev` → `master` (merge commit), tag + publish + `gh release create` on `master` after the merge, `sync/master-into-dev` resync; `Integration Branch: dev` pinned; Kaizen Apply Mode lands via `kaizen/apply-<date>` + PR (amended at the T4 gate) |
| FR-8 | All tests offline: fake exec (unit), fake `npm`/`gh` + temp git repos (integration) |
| FR-9 | `release.js` next-step hints follow the PR flow |
| NFR-1–NFR-4 | No dependency; Node 18 + 22 green locally; syntax check in CI; nothing new shipped in the package |

## 3. Files Changed Summary

| Area | Files |
|---|---|
| Scripts | `scripts/release-next.js` (new), `scripts/release-status.js`, `scripts/release.js` (hints only), `package.json` (`release:next`) |
| CI | `.github/workflows/ci.yml`, `.github/workflows/release-status.yml` |
| Tests | `test/release-next.test.js`, `test/release-status.test.js`, `test/branching-flow.test.js`, `test/release-next-cli.test.js`, `test/release-status-cli.test.js`, `test/release-cli-harness.js` (all new) |
| Docs | `AGENTS.md`, `CONTRIBUTING.md`, `docs/release-checklist.md`, `README.md`, `CHANGELOG.md` |

Commits: `b458cf4` propose · `e28e106`, `15a3b61`, `3d8c123` specify · `2214b03` T1 · `96562b9` T2 · `8feb1a4` T3 · `b69f504` T4 · `8336c57` T4→T5 gate · `d64225a` T5 · `aa30ad7` test · `fa08a51` validate (+W-1) · archive commit.

## 4. Test Evidence Summary

`npm test` **506/506** (Node v22.12.0) after the W-1 fix; the five spec test files 91/91 on Node v18.20.8 at the test phase. Integration suite drives the real CLI in temp git repos with real signals; seven docs-contract mutations and eight code mutations executed red. 0 product bugs. Details: `test-report.md`.

## 5. Validation Summary

Independent opus audit: 25 PASS · 6 WARN · 0 FAIL · 0 BLOCKED; 7/7 build commands green. W-1 (FR-6 edge case) and W-4 (figures) fixed in validation; W-2 (design §7 wording) fixed here. Details: `validation-report.md`.

## 6. Accepted Warnings Or Follow-Ups

| Item | Owner / route |
|---|---|
| W-3 — `AGENTS.md:14` names only `scripts/release.js` | Pending `factual-sweep` item (kaizen entry P4) — applied on `dev` |
| W-5 — Testers on the Implementers' model (`sonnet`) | Accepted (registry says "prefer") |
| W-6 / P-10 — real `dev` push, real `npm publish --tag next`, Linux/Windows CI legs, `strict` + merge-commit resync | User, at the first push / first prerelease / first stable release |
| README.md:172 "CI workflow on every push" (pre-existing looseness) | `/akili-quick` candidate |
| `release:status` network-flaky over 65 versions (pre-existing) | Follow-up proposal candidate |
| Moving `next` after a stable release; `@next` users not seeing the stable banner (R1) | Out of scope by proposal; R1 documented in CONTRIBUTING |

## 7. Historical Notes

- User decisions: Q1 ephemeral prerelease version (never committed to `dev`); Q2 pin `Integration Branch: dev`; at the T4 gate — Kaizen Apply Mode lands via branch + PR, LOC tripwire raised to ~1200.
- Judgment-day APPROVED with 0 dual-confirmed severe findings; 16 ledger rows of architect amendments (resync deadlock, Windows `npm.cmd`, null-safe facts, signal ordering, stale-base guard).
- Rework: T1 (inert restore-failure test) and T5 (inverted guard description) — one attempt each.
- Final LOC 1001 outside `docs/specs/` at execute (estimate ~780), 1512 including the test phase.

## 8. Diagrams

No `diagrams/` folder and no baseline diagram slot touched (this repo has no PRD/UX/TRD baseline docs); the design's one Mermaid flowchart stays inline in `design.md`.
