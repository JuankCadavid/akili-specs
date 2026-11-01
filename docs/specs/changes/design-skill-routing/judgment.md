# Judgment Day — `changes/design-skill-routing`

| Field | Value |
|---|---|
| Target | `requirements.md` + `design.md` (+ `proposal.md` for consistency) at commit `0f5e22d` (immutable) |
| Mode | judgment_day, round 1 (no fix round run) |
| Judges | A and B, blind, read-only, parallel, model `sonnet` (author: `opus` — author ≠ auditor) |
| Skill resolution | `judgment-day` (packaged; `references/` not packaged → contract from SKILL.md); judges read `AGENTS.md`, `impeccable-bridge`, vendored `impeccable` references, tests, personas |
| Orchestrator spot-checks | B-1/A-4 confirmed (`HOME=<empty> node bin/akili.js install --tool all --dry-run \| grep -c design-evaluation` → `0`; `grep -c impeccable-bridge` → `7`). A-5/B-5 confirmed (`test/impeccable-bridge.test.js:33` `version: "2\.0"`, `:37` file list). B-3's "quote not in vendored text" **refuted**: `new-work.md:41` contains "Never run the script for a local extension or a precisely specified narrow request" — its tier-mapping half stands (merged into J-5) |
| Status | **Awaiting JC** — Decision gate "both judges confirm severe → ask before round-one correction" |

## Counts

| Class | Count |
|---|---|
| Confirmed severe (both judges) | 4 |
| Confirmed, severity disputed (one severe, one warning) | 1 |
| Suspect (one judge only, severe) | 1 |
| Confirmed warnings (both judges) | 6 |
| Single-judge warnings / suggestions (`info`) | 11 |

## Confirmed severe (both judges)

| ID | Judges | Finding | Fix proposal |
|---|---|---|---|
| J-1 | A-1, B-2 | P-4 is **contradicted**, not unverified: `new-work.md:144` says the finish review "never runs inside the build thread" and allows an inline substitute only for "a harness with no subagent capability at all". DD-5 runs it inside the Implementer | Move the finish review out of the Implementer: the Leader runs it after the completion report in a fresh context (rubric `degraded/finish-reviewer.md`), or record it as skipped and covered by `polish` + the AKILI Reviewer. Re-class P-4 as refuted |
| J-2 | A-4, B-1 | P-8 citation does not reproduce on a clean machine (`0`, not `7`); the claim (whole skill folder copied) holds | Re-cite with a clean-`HOME` dry-run (bridge listed as a directory ×7) and the installer's recursive copy |
| J-3 | A-3, B-4 | `.claude/templates/leader.md:25` tells the Leader to swap in "UI → `ui-ux-pro-max`, animation → `gsap-animation`" — the opposite of the matrix, on the live path. NFR-6 (no persona edit) and FR-13 (no surviving old phrasing) contradict each other. `tester.md:38` has a similar example | Drop NFR-6's absolute form; edit the Leader example line (and the Tester example) — `release.js` handles `digests.json`/`since=`. Add the phrasing to the sweep |
| J-4 | A-5, B-5 | Two existing assertions go red: `impeccable-bridge.test.js:33` (`version "2.0"` vs §9's 2.1) and `:37` (exact bridge `.md` file list vs new `design-routing.md`). DD-12 says existing tests are untouched | Add both assertions to the contract-test task; rewrite DD-12 / §7.3 |

## Confirmed, severity disputed — needs JC

| ID | Judges | Finding | Fix proposal |
|---|---|---|---|
| J-5 | B-6 (severe), B-3 (severe, tier half), A-6 (warning) | `new-work`/`polish` inside an Implementer subagent: `new-work` §2 asks the user questions before building; Persuade/Experience builds are comp-led when image generation exists (consent inside a task); the documenter writes `DESIGN.md` at finish (conflicts with "derived, never hand-edited"); E1 "create or replace the world" requires `concept-seed` before code; E2 whole-surface builds use the surface tier, not *Extend*. No premise row covers it | Pin execute to the **code-led** path; answers to `new-work`'s questions come from `design.md`, unanswerable ones → Pivot; the roll/deal runs once at specify (`shape` + `new-work` direction) and its outcome is recorded in `design.md`; documenter does not run (authority is `docs/ux-ui/design.md`); map E2 whole-surface to the surface tier; add a premise row |

## Suspect (one judge, severe — not auto-fixed)

| ID | Judge | Finding |
|---|---|---|
| S-1 | A-2 | The finish reviewer's input packet (direction contract with `seed:`, QUALITY BAR card, desktop + mobile screenshots) cannot be assembled when the roll was skipped and nobody captures screenshots; check 0/4 would force `recapture` or a material fix. Resolved together with J-1 |

## Confirmed warnings (both judges) — `info`, fixed with the severe round if JC chooses Fix

| ID | Judges | Finding |
|---|---|---|
| W-1 | A-7, B-7 | E0 `foundation`/`evaluate` cells name two leads; E1 `build-within-system` is "—" — against FR-1 |
| W-2 | A-10, B-9 | P-15 "seven command steps": six commands read the bridge; execute only via task skill lists |
| W-3 | A-15, B-11 | `design.md` Status cited `judgment.md` before it existed (true from this file on) |
| W-4 | A-8, B-15 | Missed consumers: `docs/skills/README.md`, `docs/skills/governance.md` (conditional row pinned by `diagram-design.test.js`), `docs/skills/impeccable.md`, `docs/commands/akili-test.md`, `docs/commands/akili-audit.md`, `akili-validate.md:119`; sweep patterns too narrow |
| W-5 | A-9, B-13 | Evidence path: only the Leader appends to `execution.md`; the Reviewer reads only brief-named entries → put evidence in the completion report + Done criteria + brief pointers |
| W-6 | A-12, B-13 | The 60-tool-call Implementer bound is not budgeted against Setup + playbook + craft floor + polish; `Design route:` line should say "load `impeccable-bridge`" itself |

## Single-judge findings — `info`

| ID | Finding |
|---|---|
| A-11 | Matrix "AKILI phase" column duplicates the bridge Phase map (second owner) |
| A-13 | GSAP criterion should read "when CSS/WAAPI cannot express it cleanly" (`animate.md`) |
| A-14 | No generic card for other UI stack skills; `readdirSync` cross-check undefined |
| B-8 | E0–E3 labels collide with `design-evaluation.md` steps E0–E7 → rename (e.g. `ENV-0..3`) |
| B-10 | Proposal says "5 commands + 2 personas" and governance table; design says 4 commands, 0 personas, no governance — reconcile |
| B-12 | Polish full/light is an AKILI scope limit, not an upstream mode — label it so |
| B-14 | Picker at propose + `shape` at specify = two direction rounds; picker needs `PRODUCT.md` |
| B-16 | Held-once test checks rows, not cards (NFR-1 says both) |
| B-17 | `user-installed` copies may lack 4.8.0 reference names; existing installs skip a differing bridge folder without `--force` (CHANGELOG note) |
| B-18 | E0 "records the gap" has no Done-criteria home |
| A-15b | `:\d+` line-pointer regex false-positives on ports/times |

## Terminal state

Not reached. Round-one correction needs JC's decision (Fix and Re-judge / Fix only / Continue / Stop / custom), including J-5's severity.
