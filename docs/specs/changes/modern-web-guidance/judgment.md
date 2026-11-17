# Judgment Day: `changes/modern-web-guidance` design

| Field | Value |
|---|---|
| Target | `design.md` at `bca6eeb`, judged against `requirements.md` and `proposal.md` |
| Mode | judgment_day, blind dual review, read-only judges |
| Judges | Judge A and Judge B, both Sonnet (author: Opus 5.5, so author ≠ auditor), identical prompt and scope |
| Skill resolution | AKILI `judgment-day` (Hard Rules + AKILI Integration). The `_shared/review-ledger-contract.md` and `references/prompts-and-formats.md` references are not packaged, so the ledger is persisted here per the skill's fallback |
| Round | 1 (judgment). No fix applied yet |
| Gate | Phase 2 → **Review Design**, chosen by JC 2026-11-17 |

## Summary

| Bucket | Count |
|---|---|
| Confirmed severe (both judges; at least one rated it severe, or the source contradicts a premise) | 8 |
| Confirmed warning (both judges, both below severe) | 9 |
| Suspect (one judge only) | 14 |
| Contradictions between judges | 0 (severity differences only, noted per row) |

## Confirmed severe

| ID | Finding | Judge A | Judge B | Evidence (as run by the judges) |
|---|---|---|---|---|
| S-1 | **Telemetry omitted.** At the pin, the CLI sends search queries, guide ids, OS and agent name to Google (`play.googleapis.com`) through a detached watchdog process, unless `DISABLE_TELEMETRY=1` is set. The design says "the network touch is the npm fetch" (§8.1 *Privacy*), and the consent text and P-8 omit telemetry. **P-8 is contradicted at source** | J-1 severe | J-1 severe | README `v1.0.1` *Telemetry & Privacy* (lines 628-636); tarball `modern-web.mjs` `isTelemetryEnabled`/`ClearcutLogger`; `watchdog/main.js:13` endpoint |
| S-2 | **Unlisted consumer test.** `test/impeccable-bridge.test.js` pins the bridge `version: "2.1"` (design bumps it to 2.2) and `deepStrictEqual`s the bridge `.md` file list to 3 files (design adds `modern-web.md`). Both go red; no consumer row lists it | J-2 severe | J-2 severe | `test/impeccable-bridge.test.js:33-38` |
| S-3 | **FR-3 clause dropped.** FR-3: "the route carries the MWG field, naming the pin source". The design's `platform` field holds only `mwg` or `none — <reason>` | J-7 severe | J-5 severe | `requirements.md` FR-3 vs `design.md` §8.2 |
| S-4 | **Gate bypass through the Skill Map and the brief.** A Skill Map row or a support name in a brief makes the Leader assign the skill and the Implementer load it before coding. The upstream text then runs `@latest` without the gate or the pin. No rule forbids loading MWG directly, and no premise row covers these readers (risks FR-2 BUT and FR-4 BUT) | J-4 severe | J-6 severe | `.claude/templates/leader.md:25`; `akili-execute.md:191`; `akili-specify.md:439`; `akili-constitution.md` Step 8D item 2 |
| S-5 | **Consumer rows incomplete.** The `consumer` trigger fired, but the rows are not a whole-repository search. Missing readers: <ul><li>rule 4 regexes at `test/video-production.test.js:276-281`</li><li>Step 8D item 3 and 4 tests at `design-skill-routing-coverage.test.js:117-138`, `design-skill-routing.test.js:141,213` and `backend-skill-routing-coverage.test.js:73-74,203-213`</li><li>the env-provided restatements at `AGENTS.md:53`, `docs/flow.md:656`, `docs/skills/video-production.md:20` and `governance.md:30`</li><li>the audits-folder report-kind readers at `akili-constitution.md:39,1483` (pinned by `akili-security-command.test.js:601-605`), `akili-propose.md:141` (accepts only `design-*.md`), `docs/commands/README.md:17`, `docs/flow.md:193-194` and `docs/overview.md:34`</li></ul> | J-3 severe, J-11, J-12 | J-3 severe, J-4 severe | the judges' `git grep` runs listed in their reports |
| S-6 | **ENV-0 has no home.** The route field is valid at ENV-0, but the Build route runs only "with skill source `vendored` or `user-installed`", so the new gate step is never reached at ENV-0 | J-8 severe | J-7 warning | `design-routing.md:66` |
| S-7 | **A third selector not admitted by rule 4.** `/akili-audit modern-web` (the typed mode), and the test and validate reads, reach MWG through a selector the rewritten rule 4 does not name | J-5 severe | J-13 warning | `design.md` §9 vs §8.3 |
| S-8 | **P-11 rationale contradicted.** DD-9 and P-11 say `design` mode "needs a URL or path". It also runs with no argument against the dev server or the UI source folders. Settled by the *source contradicts a premise* rule | J-19 warning | J-13 warning (part) | `.claude/commands/akili-audit.md:139` |

## Confirmed warnings

| ID | Finding | A | B |
|---|---|---|---|
| W-1 | Build route numbering: inserting a step makes "step 7" step 8. Placing search and retrieve after step 4 also breaks step 4's "craft floor immediately before UI edits" | J-9 | J-8 |
| W-2 | No outcome for a failure after `ready`: offline, no network, a read-only npm cache, or a valid pin that does not exist. Upstream documents `NPM_CONFIG_CACHE` and `--offline` | J-13 | J-11 |
| W-3 | DD-3's "the only per-task field every UI phase already reads" is overstated: test, validate and audit never read the route line | J-18 | J-18 |
| W-4 | The design's own words would fail `design-eval-contract.test.js` pattern 7: each line with "outside `docs/specs/audits/`" must also say "user-directed" | J-12 | J-14 |
| W-5 | Budget says ≈3× per clause, but 520/280 ≈ 1.9×. 3× (KZ-bugfix--init-ctrlc-abort-2) is ~840 | J-21 | J-17 |
| W-6 | The `@latest` contract test must exclude `docs/specs/` (the spec files contain the string). Shipped docs must not link the active spec path for the security record (KZ-changes--archify-diagrams-1) | J-22 | J-16 |
| W-7 | **P-9 settled at source:** `--skill-version` is a free string. When the caller is more than 5 days older than the bundled `skill-version.txt` the CLI prints a stderr "update" nudge (at 60+ days it tells the agent to insist on an upgrade), and it never fails. Treat that stderr as untrusted tool output, never acted on (e.g. never run `@latest update`). DD-8's mismatch report line is unneeded | J-23 / P-9 | J-12 |
| W-8 | §8.5's claim that "plugin routes install upstream's current version, not the pin" has no row or citation. FR-10 says a host with no verified route is unverified or left out, yet Cursor and OpenCode are listed via the generic route | J-20 | J-15 |
| W-9 | The Skill Map table is `Skill \| Applies To \| When to load`. The `pin` cell location and its grammar are undefined, and the invalid-pin report line is promised (DD-7) but absent from the gate table. The fit with the Implementer completion report's fixed fields is unspecified | J-16, J-24 | J-6 (part), J-19 |

## Suspect (one judge; recorded as info, not auto-fixed)

| ID | Judge | Finding |
|---|---|---|
| X-1 | A J-6 (severe) | The trigger line says `live-path` and `shared-state` do not apply, but the design adds a user action (`/akili-audit modern-web`) and a flag (`platform`) read by several surfaces |
| X-2 | A J-10 | The card evidence cell `references/modern-web.md` → *Role* does not resolve under the test's lookup (`design-skill-routing.test.js:116-134`), and it is circular (AKILI's own file) |
| X-3 | A J-14 | `consent needed` with no answer (headless) is unresolved; probe scope (per phase or per session) and who asks from a subagent are unstated; the state names collide with the bridge engine's states |
| X-4 | A J-15 | Test and validate checks need guide text, which needs `retrieve`: an AKILI-directed call that requires the gate. The diagram shows no gate on those paths |
| X-5 | A J-17 | A host with MWG installed may auto-trigger it outside AKILI's gate (`@latest`); the bridge's *Disclosure (outside this gate)* pattern has no MWG equivalent |
| X-6 | A J-25 | P-14's "every file under `.claude/skills`" is inexact (320 vs 327 incl. the plugin's 7); `install-cursor.test.js` comments carry stale totals |
| X-7 | A J-26 | Mermaid labels and literal strings are borderline under *Code Suppression* |
| X-8 | A J-27 | P-7 omits the Windows `npx.cmd`, `pnpx`, `NPM_CONFIG_CACHE` and `--offline` premises the call forms use |
| X-9 | B J-9 | The route-line **Done criteria** evidence sentence is not edited, so the Reviewer is never told to check the MWG line |
| X-10 | B J-10 | The report-line form (`MWG: not run — declined`) differs from FR-4's literal `not run: declined`, and §8.3 uses the FR form |
| X-11 | B J-19 | Upstream "Reactive Policy Discovery" (suggests editing `AGENTS.md`/`CLAUDE.md`) and the CLI's `set-allow-*` unlock prompts (which name `@latest`) are not addressed |
| X-12 | B J-20 | README `v1.0.1` line 9 states MDN stewardship, so FR-11's MDN exclusion may be lifted with that citation |
| X-13 | A P-5 | The P-5 citation range 249-307 spans four tests; no page-level test was found |
| X-14 | A, B P-3 | P-3 confirmed for "specify writes the line"; the read-side claim is W-3 |

## Premise Ledger verdicts (merged)

| Row | A | B | Merged |
|---|---|---|---|
| P-1, P-2, P-4, P-6, P-7, P-10, P-12, P-13, P-14, P-15, P-17 | confirmed (P-10 stays UNVERIFIED) | confirmed (P-10 stays UNVERIFIED) | confirmed; P-12/P-13 incomplete as consumer rows (S-5) |
| P-3 | partly | partly | write side confirmed; read-side claim → W-3 |
| P-5 | partly | confirmed | confirmed; citation range loose (X-13) |
| P-8 | contradicted in part | contradicted in part | **contradicted** → S-1 |
| P-9 | settled at source | settled at source | settle as verified → W-7 |
| P-11 | partly contradicted | partly contradicted | **contradicted** (rationale) → S-8 |
| P-16 | incomplete | not reproducible as complete | → S-5 |

## Round 1 correction

| Field | Value |
|---|---|
| JC decision | **Fix only**, with confirmed warnings included (2026-11-17) |
| Fix actor | The orchestrating session, inline (no fix subagent) |
| Scope fixed | S-1 to S-8 and W-1 to W-9; suspects X-3, X-4, X-5, X-9, X-10, X-11 and X-12 closed in passing because they shared a fix site. Map: `design.md` §14 |
| Re-verified at source before fixing | Tarball shasum `06a05dda…` matches npm; tarball `SKILL.md` blob = `7483c781…`; telemetry `modern-web.mjs:712`, `watchdog/main.js:13`; `getSkillUpdateLevel` `:833-839`; README line 9 (MDN); consumer greps as run (design P-16, P-23, P-27) |
| Requirement amendments | FR-1, FR-2, FR-4, FR-11, Glossary, C12, C13 (logged in `requirements.md` Document Control; pending JC at the Phase 2 gate) |
| Not addressed | X-1 (closed by P-26/P-27 rows), X-2 (card evidence path fixed in §8.2), X-6, X-7, X-8, X-13, X-14 remain info |

## Status

fixed, not re-judged: S-1, S-2, S-3, S-4, S-5, S-6, S-7, S-8, W-1, W-2, W-3, W-4, W-5, W-6, W-7, W-8, W-9
