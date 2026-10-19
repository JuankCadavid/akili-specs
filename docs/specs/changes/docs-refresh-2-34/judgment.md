# Judgment Day — `changes/docs-refresh-2-34` design

| Field | Value |
|---|---|
| Target | `requirements.md` + `design.md` at `729d39f` (immutable) |
| Judges | Two blind read-only judges (Explore, model `sonnet`; author model `opus` — author ≠ auditor) |
| Mode | `/akili-specify` Step 2.5 under `pre-approved` (judgment-day always runs) |
| Round 1 fixes | applied by the orchestrator at the next commit after `729d39f` |

## Ledger (round 1)

| ID | Judge A | Judge B | Agreed severity | Finding | Fix |
|---|---|---|---|---|---|
| L-1 | J-A4 warning | B-01 severe | **confirmed** (both found it; severity split) | Design Status cited a `judgment.md` that did not exist | This file; Status names round 1 + fixes |
| L-2 | J-A2 warning | B-02 severe | **confirmed** | Archify embeds ~95 KB of base64 `@font-face` into the SVG: "no web-font import" was unsatisfiable, the SVG had no size cap, base64 lines would trip the LOC budget | Self-containment restated (no script, no http(s) URL, no `@import`; `data:` fonts allowed); NFR-4 SVG ≤ 150 KB; budget counts assets as files, not LOC |
| L-3 | J-A1 warning | B-03 severe | **confirmed** | P-5 mechanism mis-stated: light SVG is the `svg-light` menu item (default is dual-theme); PNG follows the current viewer theme; export injects no `<title>`/`<desc>` | P-5 rewritten with source lines; export path names `svg-light`, forces light before PNG, injects `role="img"`/`<title>`/`<desc>`; DD-5 re-based |
| L-4 | — | B-04 warning | suspect → applied as factual | DD-4's silent hand-SVG fallback contradicts the user's Archify decision | DD-4 and FR-1: stop and ask the user |
| L-5 | J-A9 | B-05 | confirmed (warning) | "T6" ambiguous; no task table behind "4 tasks" | "tier-T6"; task table added to design §12 |
| L-6 | — | B-06 warning | applied | FR-1 scenario not observable (README `<img>` loads `master` raw URL); "no clipped text" subjective | GIVEN the working-tree assets; measurable font-size floor (≥ 10 px at 900 px) |
| L-7 | J-A3 | B-07 | confirmed (warning) | CHANGELOG placeholder removal unstated; "npm shows the new README only after publish" is wrong for the figure (raw URL follows `master`) | Design §3 and FR-8 reworded; P-10 added |
| L-8 | J-A7, J-A10 | B-08 | confirmed (warning) | New `/akili-security` lines enter `securityLines()` scope with no row; `release.js` and `docs/commands/README.md:36` consumers missing | P-9, P-10, P-11; per-task `node --test test/akili-security-docs.test.js` |
| L-9 | J-A5 | — | applied | FR-7 anchored on "Step 2.1" sections the command pages do not have | Anchors: constitution *Skill Map Scaffolding*, specify *Key Rules*, archive *Archive Summary* |
| L-10 | J-A6 | B-11 | confirmed (warning) | Archive Step 2 loads `diagram-design` only when the spec has slots (`.claude/commands/akili-archive.md:124`) | Qualifier added to FR-1, FR-6, FR-7 and the figure table |
| L-11 | J-A8 | — | applied | Commands list in *Contents* is lifecycle-ordered, not alphabetical | Design §3 row reworded |
| L-12 | — | B-09 | applied | P-2/§4 line ranges disagreed; P-7 "exactly two" true only within its scope; verified-at stale | Ranges aligned to `72-118`; P-7 scope stated; re-stamped `729d39f` |
| L-13 | — | B-10 | applied | FR-4's count clause vacuous (no in-scope count exists); pack check for assets | FR-4: any new count needs the membership check; NFR-4: pack lists both assets |

Contradictions: none on substance — the split is severity only (A: warning, B: severe) for L-1…L-3. All three are factual, single-answer corrections, applied and logged rather than escalated (user feedback: factual corrections need no gate).

## Round 2 (scoped re-judgment)

Recorded below after it runs.
