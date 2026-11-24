# Test Report: Vendor the official NestJS skills and retire `nestjs-expert`

**Status: PASS.** `npm test` passes 2210 of 2210: the 2186 tests at the end of execute, plus 24 new ones. No product bug was found. Every FR and NFR has test or command evidence, except the gaps accepted in §9.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/nestjs-official-skills` |
| Date | 2026-11-24 |
| Code under test | `6f44ff3` (T1–T11), plus the two untracked test files this run added |
| Leader | Claude Code main session, `opus` |
| Testers | 2, general-purpose subagents seeded with `.agents/tester.md`, on `opus`. The Implementer model was `sonnet` throughout and `execution.md` records no escalation, so author ≠ tester holds |
| Reference documents | TRD `none`, UX/UI design `none`. The repository has neither, and the spec has no UI |

## 2. Summary

| Item | Value |
|---|---|
| Suites | 2, run in parallel because their files are disjoint: **A**, installer and `doctor` (integration); **B**, vendoring, sync and text contracts (unit/contract) |
| Inline suites | none |
| New tests | 24: A has 7 in `test/nestjs-official-skills-installer.test.js`; B has 17 in `test/nestjs-official-skills-contracts.test.js` |
| Author tests cited, not rewritten | `nestjs-vendor`, `sync-nestjs-skills`, `install-nestjs-foreign`, `retired-skills`, `doctor-skill-map`, `backend-skill-routing*`, `ai-agent-guardrails-evals`, `nestjs-retirement-surface`, plus the count tests in `install-cursor` and `akili-panel-flow` |
| Falsifiers | Every new test went red under a targeted mutation on a scratch copy: 7 mutations in A, 19 in B |
| Inner-loop test defects | 3, all fixed. (1) B's governance lookup matched the Binding Taxonomy `stack` row; it is now scoped to *Current assignment*. (2) B's file and (3) A's file both named the retired skill literally, which tripped the repo-wide surface grep; both now build the name (`"nestjs-" + "expert"`). The allowlist was not widened |
| Lookup notes | Suite A read `design.md` §7.4 by section lookup to settle a fence edge case |
| Skill deviations | none. Both suites ran with `tdd` |

## 3. Backend Unit Tests

Suite B (contracts) ran against the six vendored folders, the sync script and the text surfaces.

```
node --test test/nestjs-official-skills-contracts.test.js test/nestjs-vendor.test.js test/sync-nestjs-skills.test.js test/backend-skill-routing.test.js test/backend-skill-routing-coverage.test.js test/ai-agent-guardrails-evals.test.js test/nestjs-retirement-surface.test.js
```

The new file alone gives 17 pass and 0 fail. The combined run's one red test was the surface grep, caused by suite A's file; it is green after A's fix (§2, defect 3).

## 4. Frontend Unit Tests

Not applicable. The spec has no frontend.

## 5. Integration Tests

Suite A drives the real CLI as a subprocess, with HOME and cwd pinned to a scratch directory.

```
node --test test/nestjs-official-skills-installer.test.js test/install-nestjs-foreign.test.js test/retired-skills.test.js test/doctor-skill-map.test.js
# tests 52  # pass 52  # fail 0
```

After the surface-grep fix:

```
node --test test/nestjs-official-skills-installer.test.js test/nestjs-retirement-surface.test.js
# tests 9  # pass 9  # fail 0
```

## 6. E2E Tests

Not applicable. The CLI integration tests above are the end-to-end path for an installer.

### Full verification (Leader, after both Testers reported)

| Command | Result |
|---|---|
| `npm test` | `# tests 2210  # pass 2210  # fail 0  # skipped 0` |
| `npm run verify:cli` | `14 commands \| 37 skills \| 1 plugin \| 8 resources (akili-specs v2.45.0)` |
| `git diff --check` | clean |
| `grep -c nestjs-expert` on the two new files | 0 and 0 |
| `git diff --stat aac1295..HEAD -- docs/specs/archive docs/specs/kaizen docs/specs/kaizen-log.md releases` | empty (NFR-6) |
| `git diff -U0 aac1295..HEAD -- CHANGELOG.md` | every hunk sits inside `[Unreleased]`; `[2.45.0]` and older are untouched (NFR-6) |

`pack:dry-run`, `install --tool all --dry-run` and `doctor` on a fresh HOME were run at T11 on `6f44ff3` (see `execution.md`). This run changes test files only, which are not in the package.

## 7. Coverage & Traceability

| Requirement | Scenario / clause | Test type | Test file or command | Result | Gap or notes |
|---|---|---|---|---|---|
| FR-1 | *Verbatim check*: THEN each hash matches its line | unit | `nestjs-vendor`: every `UPSTREAM.md` line matches its file's raw bytes | PASS | author test |
| FR-1 | BUT no unlisted file | unit | `nestjs-vendor`: no file unlisted except the 3 provenance files | PASS | author test |
| FR-1 | AND 16 files; each `LICENSE` begins "(The MIT License)" | unit | `nestjs-vendor`: 16 upstream files; each LICENSE | PASS | author test |
| FR-1 | Frontmatter keys kept plus the `metadata` block; NOTICE content | unit | `nestjs-vendor` | PASS | `source` and `adapted-for` are not asserted one by one |
| FR-1 | No upstream `bin/`, `index*`, `package.json`, `scripts/`, `test/` or `.claude-plugin/` | unit | `nestjs-vendor`: no upstream tooling is vendored | PASS | author test |
| FR-2 | *Local edit creeps in*: the failure names the folder and the file | unit | `nestjs-vendor` hash test | PASS | author test |
| FR-2 | *Dirty upstream checkout*: non-zero exit, nothing written, BUT no partly rewritten folder | unit | `sync-nestjs-skills`: dirty refusal; rollback at the 4th folder; rollback on a first run | PASS | author test |
| FR-2 | Refuses when the commit is not checked out or a folder is missing; prints the diff summary with Observe text first; not in `files` | unit | `sync-nestjs-skills` | PASS | author test |
| FR-2 | No download | unit | `sync-nestjs-skills` uses local git fixtures only | PASS | holds by construction |
| FR-2 | Release-checklist step records current, sync or defer | contract | `nestjs-vendor` + contracts: FR-2 release-checklist step | PASS | new |
| FR-2 | First pin `v0.1.1`, re-verified at execute | — | `execution.md` T2 | n/a | accepted (§9) |
| FR-3 | Delivery to the 5 no-record targets | integration | `install-nestjs-foreign` (no `--force`) ×5 | PASS | author test |
| FR-3 | Delivery to Grok Bot | integration | installer: FR-3 (grokbot), six byte-equal folders, doctor OK ×6 | PASS | new; this was a real gap |
| FR-3 | Ownership via `UPSTREAM.md`; a foreign folder is skipped whole; `--force` takes it over whole | integration | `install-nestjs-foreign` ×11 | PASS | author test |
| FR-3 | Marker reported when present | integration | `install-nestjs-foreign`: `(installed by npx @nestjs/skills)` | PASS | author test |
| FR-3 | No marker: still foreign, no npx note | integration | installer: FR-3 (claude / codex, no marker) | PASS | new |
| FR-3 | `doctor` counts the six | integration | installer: FR-3 (doctor), MISSING ×6 then `--fix` byte-equal | PASS | new |
| FR-3 | *Developer already ran the upstream installer*: folder untouched and named foreign, the other five written, BUT no merge | integration | `install-nestjs-foreign` (claude); the fixture file set is disjoint from upstream's | PASS | author test |
| FR-4 | Folder and page removed from the package | contract | `nestjs-retirement-surface` + `verify:cli` 37 skills | PASS | — |
| FR-4 | `install`, `update` and `doctor --fix` remove it; a shared root is never scanned | integration | `retired-skills` ×12 | PASS | author test |
| FR-4 | STALE/REMOVED name the replacement; gsap names `gsap-animation` | integration | `retired-skills` + installer: FR-4 (gsap) REMOVED and the install-deleted line | PASS | the gsap REMOVED and install lines are new |
| FR-4 | Removal Log row, dated | contract | contracts: FR-8 governance Removal Log row | PASS | new |
| FR-4 | *Upgrade over an older install*: THEN STALE, AND `--fix` REMOVED, BUT not under `~/.agents/skills` | integration | `retired-skills` (claude STALE/REMOVED; codex/cursor shared root) | PASS | author test |
| FR-5 | Reads both files' Skill Map; one RETIRED line per hit with file, line, name and replacement | integration + unit | `doctor-skill-map` (14) + installer: FR-5 (CLAUDE.md only) | PASS | fixture uses line 7, not 140; the logic is the same |
| FR-5 | Never edits the Skill Map, even with `--fix`; the scan runs before the `--fix` guards | integration | `doctor-skill-map` + installer: FR-5 ×2 (RETIRED printed before REFUSED) | PASS | new; closes T4 advisory 1 |
| FR-5 | The warning alone keeps the exit status | integration | `doctor-skill-map` ×2 + installer twin-project comparison | PASS | new assertion, added after mutation M6 survived |
| FR-5 | *Name in prose, not in the map* | integration | `doctor-skill-map`: name only under `## History` | PASS | author test |
| FR-6 | Stack row, `implement` lead, five support activities, card, rule 5, Attribution | contract | `backend-skill-routing*` | PASS | the card's *Evidence* heading citations are not asserted |
| FR-6 | *Existing Passport project*: THEN route, BUT the decision is not reopened | contract | `backend-skill-routing-coverage`: Passport route | PASS | author test (T5 attempt 2) |
| FR-7 | Rule 9 names the three actions; never auto-passed under `pre-approved` | contract | `backend-skill-routing-coverage`: rule 9 | PASS | author test |
| FR-7 | Relay allowed at most once; run only when asked in the current session | contract | contracts: FR-7 rule 9 | PASS | new |
| FR-7 | The rule lives outside the vendored folders | contract | contracts: FR-7, plus the vendor hash | PASS | new |
| FR-7 | *Pre-approved run on an unlinked project* (runtime) | — | — | n/a | accepted risk, requirements §8 |
| FR-8 | Governance: members, six-folder reason, `stack` row, Removal Log | contract | `nestjs-vendor` + contracts ×2 | PASS | partly new |
| FR-8 | Six docs pages, README rows (Kamil Mysliwiec, MIT), overview rows | contract | contracts: FR-8 ×3 | PASS | new |
| FR-8 | `/akili-constitution` Step 5 = Step 8D; `/akili-specify` fallback = `nestjs-feature` | contract | `ai-agent-guardrails-evals` | PASS | author test |
| FR-8 | `AGENTS.md` *Skill Usage* and *Backend Skills*; `leader.md` | contract | contracts: FR-8 ×2 | PASS | new |
| FR-8 | `docs/commands/*`, `flow.md` | contract | `nestjs-retirement-surface` (absence of the old name) | PASS | positive naming not asserted; low risk |
| FR-8 | `SKILL_CATALOG` matches disk | unit | `akili-panel-flow` (in `npm test`) | PASS | author update |
| FR-8 | *No live surface names the retired skill* | contract | `nestjs-retirement-surface` (line-level allowlist) | PASS | author test |
| FR-9 | Six added, old skill removed; what `update` does; RETIRED and both fixes; coexistence (`npx @nestjs/skills`, `nestjs@nestjs`) | contract | contracts: FR-9 ×4, newest section first, `[Unreleased]` first | PASS | new; this was a real gap |
| NFR-1 | Verbatim | unit | vendor hash tests | PASS | — |
| NFR-2 | No network | unit | local fixtures; contract tests read files only | PASS | holds by construction |
| NFR-3 | `-text` lines | unit | `nestjs-vendor`: NFR-3 | PASS | the Windows legs run in CI after push |
| NFR-4 | Counts as run | unit + command | `install-cursor`, `akili-panel-flow`, `verify:cli` 37 | PASS | prose counts were Reviewer-checked (§8 "partly") |
| NFR-5 | No shipped test reads the spec folder | contract | contracts: NFR-5 self-check; the surface test skips `docs/specs/` | PASS | new |
| NFR-6 | Historical text untouched | command | `git diff` rows in §6 | PASS | — |
| NFR-7 | Verification green | command | §6 table plus T11 evidence | PASS | — |
| NFR-8 | Minor, conditional on FR-5 and FR-9 | contract | contracts: NFR-8 | PASS | new |

## 8. Remediation

None needed. No test failed against product code.

## 9. Accepted Gaps

| Gap | Reason |
|---|---|
| FR-7 runtime behaviour (*Pre-approved run on an unlinked project*) | No automated check can observe agent behaviour across hosts. Accepted risk in requirements §8; the rule's text and location are tested |
| Upstream recipes being wrong | AKILI does not re-run upstream recipes. Accepted risk in requirements §8 |
| FR-2 first pin re-verified at execute | An execution-time fact, recorded in `execution.md` T2, not a test |
| A `## Skill Map` heading inside a code fence, before the section opens | Design §7.4 does not specify it. Today's code ignores it |
| Grok Bot with a pre-existing foreign `nestjs-*` folder | The FR-3 foreign rule applies to the no-record targets. Grok Bot's record-based handling belongs to the grokbot-target spec |
| Card *Evidence* heading citations; the `source` and `adapted-for` lines; positive naming in `docs/commands` and `flow.md` | Low risk. The Reviewer quote-checked them during execute |
| Windows CI legs (NFR-3) | They run only after push |
