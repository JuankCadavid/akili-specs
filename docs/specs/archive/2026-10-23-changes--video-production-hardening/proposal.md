# Proposal: Video Production Hardening

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/video-production-hardening` |
| Slug | `video-production-hardening` — first token of the argument (a literal path); the rest of the argument is context |
| Type | Change |
| Deliverable | software — the change edits methodology prompts, one skill, `bin/routing.js` and `bin/akili.js`; it produces no video |
| Approval Mode | pre-approved (Juan Carlos Cadavid, 2026-10-23) — covers the product decisions listed in Scope; the exceptions in `/akili-propose` Step 1 (HALT, Pivot, budget tripwire, `FATAL_FAIL`, `PRODUCT_BUG`, destructive actions) still stop |
| Requested by | Juan Carlos Cadavid, 2026-10-23 |
| Scope addition | 2026-10-23, same owner: the two escalated `/akili-quick` items (argument parsing; `akili --version`) are folded in as S16 and S17 |
| Depends on | none |
| Parallel-safe | no — edits `akili-specify.md`, `akili-execute.md`, `akili-test.md`, `akili-validate.md`, `akili-propose.md` and `bin/routing.js`, which most open specs also touch |
| Branch / worktree | `JuankCadavid/video-hardening` (this worktree, based on `dev` 8679e25); local commits only — no push |
| Source of friction | `/Users/jcadavid/orca/workspaces/akili-web-page/linkedin-video-explainer/video/.run/friction.md` (read only; that worktree is not modified) |
| Upstream issues | heygen-com/hyperframes#6136, #6137, #6138, #6139 — filed by the owner; this spec adds skill text only, no workarounds in code |

## 1. Intent

The first real `Deliverable: video` run (`linkedin-methodology-video`, 2026-10-23) went from propose to test and logged 30+ friction points. **Answer up front:** fix all of them as rule-text edits plus two small code changes:

- a Tester model derivation in `bin/routing.js` that never equals the Implementer's model;
- an `akili --version` flag.

All of it ships in one spec, so the video track's second run starts from corrected rules.

## 2. Problem / Current Behavior

| # | Today | Citation (as run, at 8679e25) |
|---|---|---|
| P1 | The consent rule lists `feedback`, `publish`, `cloud`, `lambda`, `cloudrun`. It does not list `snapshot --describe`, which the friction log says sends frames to Gemini when `GEMINI_API_KEY` is set | `.claude/skills/video-production/SKILL.md:73`; `--describe` behavior: `UNVERIFIED — confirm at source before relying on it` (user-stated + friction log; `grep -rn describe` over the installed `hyperframes-cli` skill: 0 hits) |
| P2 | No rule says to sanitize evidence or which output path to use. Only "use relative paths" is stated | `SKILL.md:74`; `references/render-evidence.md` has no `-o`/sanitize rule (read whole, 43 lines) |
| P3 | The install route names 10 skills. Upstream's eager core set is now 4 (`hyperframes`, `hyperframes-cli`, `hyperframes-registry`, `media-use`). The gate passes on the router alone | `SKILL.md:18,30`; installed `hyperframes/references/skill-lifecycle.md:7` "Core set, installed eagerly: `/hyperframes`, `/hyperframes-cli`, `/hyperframes-registry` and `/media-use`" |
| P4 | The route has no `--agent`, so `npx skills add` may install for the wrong host | `SKILL.md:30`; `npx skills@1.7.4 add --help` → `-a, --agent <agents>`; agent ids `claude-code`, `opencode`, `codex`, `cursor`, `antigravity` all appear in its `dist/` |
| P5 | The deferral table points at `hyperframes-core`, `hyperframes-animation` and `hyperframes-creative`, which are no longer in the core set | `SKILL.md:98,100,101` |
| P6 | The phase map has no row for `story.md`, `SPEC.md`, `snapshot --review`/`REVIEW.md`, or the router's music bed for films over about 15 s | `SKILL.md:43-52`; installed `hyperframes/SKILL.md:46-47`, `references/sound.md:7`, `references/review.md:44` |
| P7 | No rule covers fonts. The friction log says the compiler fetches "bundled" families from Google Fonts at compile time, and a warm cache hides the fetch | `SKILL.md` and references: `grep -n -i font` → 2 hits (`SKILL.md:83` "web fonts"; `acceptance-criteria.md:17` brand source); compiler behavior `UNVERIFIED` (friction log, upstream issue) |
| P8 | The delivery render is mandatory at `/akili-validate`. A brief that forbids it cannot finish the cycle | `akili-validate.md:141,143`; `SKILL.md:52` |
| P9 | A video proposal must fill a Requirement Delta Preview of ADDED/MODIFIED/REMOVED items, which fits a net-new asset poorly | `akili-propose.md:173,235-248` |
| P10 | The test report requires Backend Unit, Frontend Unit, Integration and E2E sections even for a video | `akili-test.md:151-159` |
| P11 | Falsifiability item 8 requires the red to be observed at baseline before the tasks gate. A greenfield artifact has no baseline | `akili-specify.md:444` |
| P12 | "Quiet tree" covers delegated agents only. Tool daemons, parallel renders, and the need for a dedicated worktree are not mentioned | `SKILL.md:82` |
| P13 | `bin/routing.js` binds the Tester to T2, the Implementer's model, and reports this as allowed. Step 8E Rule 1 calls a different Tester model "a preference, not a hard rule" | `bin/routing.js:603,848-850`; `akili-constitution.md:1020-1022`; `akili-test.md:15,54` |
| P14 | The repo `.gitignore` has `*.log`, so a render log saved as evidence cannot be committed | friction log; root `.gitignore` of the video project — `UNVERIFIED` (other worktree; user-stated) |
| P15 | `pre-approved` stops at a budget tripwire. Nothing says whether an owner's "never stop" brief can pre-approve past it, and the video run's budget was under-priced about 2.5× | `akili-propose.md` Step 1 *Approval Mode*; `akili-execute.md:297,357`; friction log (650 vs ≈1 648 LOC) |
| P16 | The rework effort bump has no terminal rung. At attempt 3 the next rung is `max`, which is barred on a cheaper tier; escalating the Implementer to `opus` collides with the `opus` Reviewer | `akili-execute.md:165`; `.claude/templates/leader.md:27` ("Don't `max` a cheaper tier") |
| P17 | The defect-class table implies `check` covers motion. The friction log says `check --at-transitions` did not see a missing exit fade; stills did | `references/acceptance-criteria.md:24-32`; installed `hyperframes-cli/references/lint-validate-inspect.md:37` |
| P18 | `specify`, `execute`, `test` and `validate` interpolate the whole `$ARGUMENTS` into `docs/specs/$ARGUMENTS/…` paths. Only `/akili-propose` has a first-token rule | `akili-specify.md:31,35,88`; `akili-execute.md:28,103-106`; `akili-test.md:30,34,98,143`; `akili-validate.md:30,34,66-72,151,175` |
| P19 | Step 1.1 always asks about Jira and Figma, even under `pre-approved` with the source supplied. A brief that mandates a literal path for a bare slug has no escape hatch | `akili-propose.md:36-38,122-123` |
| P20 | Specify says judgment-day "always runs" under `pre-approved`, but whether "Fix only" can end `APPROVED` is unstated | `akili-specify.md:73,381-387`; `.claude/skills/judgment-day/SKILL.md:42` |
| P21 | `akili --version` and `-v` exit 1 with `Unknown option` | `node bin/akili.js --version` → `ERROR: Unknown option '--version'`, exit 1 (run 2026-10-23) |

## 3. Proposed Outcome

A second video run reads one rule set, and that rule set has an answer for every friction point above. The Tester never shares the Implementer's model, and `--version` prints the version.

## 4. Scope

| ID | Item (owner's numbering) | Lands in |
|---|---|---|
| S1 | #11 consent — `snapshot --describe` joins the consent list; every `snapshot` carries `--describe false` unless the user gives per-use consent | `SKILL.md` *Privacy*, `render-evidence.md` |
| S2 | Evidence sanitizing — strip `$HOME`, cache, and other absolute paths before committing; `-o <spec>/evidence/...` required for `render` and `snapshot`; name `HYPERFRAMES_SKIP_SKILLS=1` | `render-evidence.md`, `SKILL.md` |
| S3 | #1/#2 install — the 4-skill core set; `--agent <host>` per host-table row; the gate compares the installed set against `skills-lock.json` when one exists; the deferral table no longer names removed skills | `SKILL.md` Step 0, host table, deferral table |
| S4 | #12 phase map — rows for `story.md`, `SPEC.md`, `snapshot --review`/`REVIEW.md`; a music-bed criterion for films over 15 s | `SKILL.md` phase map, `acceptance-criteria.md` |
| S5 | #9 typography — self-host every family (`@font-face` with local files); a cold-cache `check` as evidence for "local only"; note that "bundled" fonts are fetched | `SKILL.md` render rules, `render-evidence.md`, `acceptance-criteria.md` row 9 |
| S6 | #8 DECISION — `Delivery: deferred` in Document Control makes the delivery render optional; validate then does the final look on drafts and records the deferral | `akili-validate.md`, `SKILL.md`, `render-evidence.md`, `akili-propose.md`/`akili-specify.md` Document Control |
| S7 | #14 Deliverable Outline (beats, assets, constraints) replaces the Requirement Delta Preview for a video Change | `akili-propose.md`, `akili-specify.md` Step 1.2 |
| S8 | #15 video test-report sections: Render Evidence, Final-look pending, Deferred suspicions; no n/a software sections | `akili-test.md` Phase 4 |
| S9 | #10 Falsifiability item 8 — greenfield-artifact exception: the first task observes the red and quotes it in `execution.md` | `akili-specify.md:444` |
| S10 | #4 environment — a dedicated worktree (Orca if present); one render at a time; tool daemons break the quiet tree | `SKILL.md` render rules |
| S11 | #16 DECISION enforced — the Tester's model MUST differ from the Implementer's; `bin/routing.js` derives it; tests | `bin/routing.js`, `test/routing*.test.js`, `akili-constitution.md` Step 8E, `akili-test.md:15,54`, `docs/model-routing.md`, `docs/cli.md` |
| S12 | #17 DECISION — evidence logs are saved as `.txt`; no `.gitignore` change required | `render-evidence.md` |
| S13 | DECISION budget — the tripwire always stops, and an owner mandate cannot pre-approve past it. DECISION — for `Deliverable: video`, guard/gate code estimates ×2–3 at specify | `akili-propose.md`, `akili-execute.md`, `akili-specify.md` Step 2.4 |
| S14 | Rework ladder dead end at attempt 3 — define the next step | `akili-execute.md` Step 2 loop, `.claude/templates/leader.md` |
| S15 | Defect-class table — motion (entry/exit) needs stills at transition boundaries; `check --at-transitions` covers overlap and layout only | `acceptance-criteria.md` |
| S16 | Quick 1 (#5/#6/#7) — a shared first-token rule for `specify`/`execute`/`test`/`validate`; a literal-path escape in propose; Jira/Figma questions skipped under `pre-approved` when the brief supplies the source; judgment-day under `pre-approved`: "Fix only" cannot end `APPROVED`. Tests | the five commands, `judgment-day` SKILL integration note |
| S17 | Quick 2 — `akili --version` / `-v` prints the `package.json` version and exits 0; test; docs; CHANGELOG | `bin/akili.js`, `docs/cli.md`, `README.md`, `CHANGELOG.md` |

CHANGELOG `Unreleased` notes cover every package-affecting item.

## 5. Non-Goals

- Upstream HyperFrames bugs (#6136–#6139): reported upstream, no code workaround here.
- Persona drift fixes in other projects; the `video/reference/brand.html` tracking issue (owner's project).
- The `format.md:66` multi-mount host-id ambiguity and the `data-attributes.md` clip-window conflict: these are upstream doc defects.
- P-4 review-band pricing for T6 lenses and Reviewer shell access: recorded as risks, not in scope.
- No release, no push, no npm publish.

## 6. Affected Users, Systems, And Specs

| Surface | Effect |
|---|---|
| Video-spec users (all hosts) | New privacy, evidence, font, environment and delivery rules |
| Every spec user | First-token argument rule; Tester ≠ Implementer; effort-ceiling rung; tripwire wording |
| `akili routing` users | Tester wrapper `model` changes on Claude Code (`sonnet` → `opus`), OpenCode and Codex; Antigravity Tester wrapper behavior to be decided in design |
| Specs | Extends archived `changes/video-deliverable-track` and `changes/model-routing-configurator`; no open spec overlaps |

## 7. Visual Reference

- Source: None
- Notes: rules text and CLI only; no UI surface.

## 8. Requirement Delta Preview

### ADDED

- Consent: `snapshot --describe`. Evidence sanitize + `-o` rule + `.txt` logs. Font self-hosting + cold-cache evidence. `Delivery: deferred`. Deliverable Outline. Video test-report sections. Greenfield red exception. Environment rule (worktree, one render, daemons). Motion-stills defect row. Effort-ceiling rung. Video gate-code multiplier. First-token argument rule. Literal-path escape. `--version`.

### MODIFIED

- Install route (4 skills, `--agent`, lock-file gate); phase map; deferral table.
- Tester model: preference → MUST differ from the Implementer; `bin/routing.js` derivation and its report line.
- Tripwire wording: owner mandates named explicitly as unable to pre-approve it.
- Propose Step 1.1 under `pre-approved`; judgment-day terminal under `pre-approved`.

### REMOVED

- The 10-skill install list; the `Tester: same model as the Implementer … Rule 1 allows it` report line.

## 9. Approach Options

| Option | What | Trade-off |
|---|---|---|
| A — One spec, tasks split per rules file (recommended) | Every item here; tasks bounded at about 8 sites per file (specify Step 3.2 rule) | One approval and one budget. Large (≈18–22 tasks), but each task is single-file |
| B — Three specs: video skill / commands / routing+CLI | Same content as A, chunked | Three approvals and three budgets. The owner asked for one spec |
| C — Skill-only now, commands later | Ship S1–S5, S10, S12, S15 | Leaves S11, S16 and the cycle blockers (S6, S8, S9) unfixed for the next video run |

## 10. Recommended Approach

**Option A.** Every item has a known target site, and most targets are single-file. Split tasks by file so each Reviewer reads one rules document. Group the work into three PRs at specify:

1. video skill;
2. commands;
3. routing + CLI.

## 11. Risks, Dependencies, And Open Questions

| # | Risk / question | Handling |
|---|---|---|
| R1 | Budget: rules-document specs under-run review rounds (KZ-changes--kaizen-loop-closure-2, KZ-002 recurrences) | Specify Step 2.4: two review rounds per rules task; this spec is software, so the S13 ×2–3 multiplier does not apply to it |
| R2 | S11 changes generated wrapper content: existing projects see `model drift` on re-run; the Antigravity Tester may lose its wrapper | Design decides the Antigravity case; `docs/cli.md` + CHANGELOG state the drift |
| R3 | Claims from the friction log (`--describe`, Google Fonts fetch, `.gitignore *.log`) cannot be re-run here without network or the other worktree | Premise Ledger rows marked `UNVERIFIED`, `user-stated`; the text cites the upstream issues instead of asserting tool internals |
| R4 | Restatement sweeps: the Tester rule is restated in about 10 places (constitution, model-routing, README, cli) | KZ-changes--kaizen-loop-closure-2: phrase-family sweep keyed on the obligation ("author ≠ tester", "prefer … different") |
| R5 | Summary surfaces overstate the shipped text | KZ-002: quote-check every CHANGELOG clause at HEAD |
| R6 | Tests must not cite `docs/specs/changes/...` | KZ-changes--archify-diagrams-1 |
| R7 | Text-contract tests are under-budgeted | KZ-bugfix--init-ctrlc-abort-2: budget test LOC per clause |
| OQ1 | Antigravity has only `flash`/`pro` wrapper values, and the T3 pick is Argon (no wrapper). Which Tester model differs from the `flash` Implementer? | Design — skip and report, or bind `pro` |

## 12. Success Criteria

- Every friction point in the source log either maps to an S-item or is listed under Non-Goals.
- `npm test` is green, with new tests for S11, S16 and S17. Each new test has an executed falsifier.
- `akili routing` never writes a Tester wrapper whose `model` equals the Implementer's.
- `node bin/akili.js --version` prints `2.35.0` and exits 0.

## 13. Next Step

```text
/akili-specify changes/video-production-hardening
```

Change track, Standard depth. Video Mode does **not** apply (`Deliverable: software`).

Proposal gate: auto-approved (pre-approved mode), 2026-10-23.
