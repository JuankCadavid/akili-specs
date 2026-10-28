# Archive Summary: growth track and customer angles

> **Delivered, with gaps the maintainer accepted.** `/akili-marketing` gains a seventh mode, `angles`; `brand` captures four foundations and pre-fills them from the PRD; `campaign` and `post` select an approved angle, an approach and a chosen hook; `/akili-constitution` can seed the PRD from a filled brand voice; the docs and the lifecycle figure show the growth track. 9/9 tasks closed, 1195/1195 tests on Node 18 and 22. **Not run:** `/akili-test`, `/akili-validate` and the T9 hands-on dogfood — the maintainer waived the dogfood and moved it to the published 2.38.0. Release 2.38.0 (minor) is the maintainer's.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/growth-angles` |
| Archive Date | 2026-10-28 |
| Archive Path | `docs/specs/archive/2026-10-28-changes--growth-angles/` |
| Branch | `JuankCadavid/growth-angles` (Branch Context: **spec**; `Integration Branch: dev` is pinned). Local commits only |
| Approval Mode | `gated` proposal; execute and archive gates auto-passed under the maintainer's mandates of 2026-10-28 (7:20 AM, and 6:21/6:30 PM Bogota) |

## 2. Original Spec Path

`docs/specs/changes/growth-angles/`

## 3. Archive Date

2026-10-28

## 4. Final Status

**PASS with accepted gaps.** T1–T8 closed with a Reviewer PASS; T9 closed with a Reviewer PASS on its CHANGELOG and test part and its dogfood waived by the maintainer (verbatim decision in `execution.md` T9).

| Gap | Accepted by | Consequence |
|---|---|---|
| No `test-report.md` (`/akili-test` not run) | Maintainer mandate 2026-10-28 6:30 PM ("Saca la 2.38.0 estable directo") | Evidence is the per-task Reviewer re-runs and the T9 sweep |
| No `validation-report.md` (`/akili-validate` not run) | Same | No independent end-to-end validation pass |
| T9 dogfood steps 2–8 not observed | Maintainer waiver, recorded verbatim | Every *Observes* cell in `tasks.md` §3 is unobserved; the dogfood moves to the published 2.38.0 |

## 5. Requirements Delivered

| ID | Delivered | Pinned by |
|---|---|---|
| FR-1 | Four foundations in `brand-voice-template.md`; one question at a time; empty stays empty; old `filled: yes` files stay `filled: yes` | `test/akili-marketing-command.test.js` |
| FR-2 | `angles [<pillar>]` mode; map shape, sourcing, up to 9 per type, `needs input`, per-pillar approval under `## Invariants` (one added sentence) | same, `test/social-marketing-skill.test.js` |
| FR-3 | Plan slots and post headers carry Angle, Approach and three hooks; only the chosen hook reaches the card; refusal on an unapproved pillar; social proof needs a real fact | `test/akili-marketing-command.test.js` (card-field list pinned exactly) |
| FR-4 | `references/angles-framework.md`, `AKILI-authored`, Nico Azero credit, generic bike-shop example; skill ships 13 files | `test/social-marketing-skill.test.js`, `test/social-marketing-install.test.js`, `test/install-cursor.test.js` |
| FR-5 | `/akili-constitution` Step 2 cited defaults, Step 3 optional *Customer Objections & Beliefs* | `test/growth-track.test.js` |
| FR-6 | `brand` PRD read: pre-fill with citations, ask only gaps, never write the PRD, show both on conflict | `test/akili-marketing-command.test.js` |
| FR-7 | Growth track in six docs pages; README net 0 lines | `test/growth-track.test.js` |
| FR-8 | Figure regenerated: "Growth track" group, dashed `g1` constitution → marketing; animated twin regenerated (136,694 B) | `test/flow-figure-contract.test.js`, `test/flow-figure-animated.test.js` |
| FR-9 | CHANGELOG `[Unreleased]` entry, quote-checked, `Release class: minor` | `test/flow-figure-animated-contract.test.js` (byte size) |
| NFR-1..7 | Invariants keep every sentence; leak grep 0 on every task; English; no new command/skill/target; sweep green; no spec-path citation; `figure-source.json` kept | as listed in `tasks.md` §3 |

## 6. Files Changed Summary

| Area | Files | Lines vs `c836c68` |
|---|---|---|
| Command, skill, docs, tests, CHANGELOG, README | 21 (2 added: `angles-framework.md`, `test/growth-track.test.js`) | +737 −64 |
| Assets (`akili-flow.svg`, `akili-flow.png`, `akili-flow-animated.svg`) | 3 | +190 −158 |

11 commits from `f86b4a1` (T1) to the archive commit. The unplanned Archify sidecar `assets/akili-flow.svg.nodes` committed in T8 was removed at the maintainer's decision (`7d18c97`).

## 7. Test Evidence Summary

| Check | Result |
|---|---|
| `npm test` | 1195/1195 on Node 22.12.0 and 18.20.8 (baseline 1153) |
| `verify:cli`, `pack:dry-run`, `install --tool all --dry-run`, `git diff --check` | pass; pack 342 files |
| Release-cut simulation (2.38.0) | all ten CHANGELOG-reading test files 140/140 |
| Leak grep (private map terms, scratchpad only) | 0 hits on every task and at T9 |

## 8. Validation Summary

Not run (accepted gap, §4). Review rounds: 15 of a 21 tripwire; Reviewer FAILs: T1 ×2, T2, T3, T5, T7 — all fixed within the 3-attempt ceiling; no HALT, no Pivot.

## 9. Accepted Warnings Or Follow-Ups

- **Dogfood on the published 2.38.0** (steps 2–8 of T9). Run it with an isolated config dir or after `akili update`, so the global copy cannot shadow the new command.
- **Open T4 advisory:** what `post` writes in `Angle:` when a map exists but the request names no approved angle — observe it in that dogfood.
- **T8 advisories:** `g1` shares `e8`'s purple; the "Growth track" label is small (font 7); the `g1` label is checked only non-empty.
- **Release:** `npm run release:minor` (2.38.0), merge into `dev`, publish — the maintainer's.

## 10. Historical Notes

- P-3 was refuted at T1 (install-cursor counts are hard-coded); T8 found the byte-size test bound to the released `[2.37.2]` notes; both were amended at execute time and logged.
- The maintainer's first dogfood attempt ran the globally installed 2.37.0 command, which shadowed the scratch install (six modes shown).

## 11. Diagrams

- Figure source: `figure-source.json` in this folder (NFR-7). No baseline diagram slot is made stale.
