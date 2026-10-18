# Tasks: `/akili-security` — repository security audit on Cloudflare's `security-audit` skill

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-security` |
| Depth | Full (compact) |
| Type | Change |
| Approval Mode | `gated` |
| Status | **Approved** at the specify gate, 2026-10-18 (Juan Carlos Cadavid), after judgment-day APPROVED and the gate adjustments I-1, I-2, I-3, I-5, I-8, I-9, F-1, F-2 (`judgment.md` → *Gate adjustments*) |
| Date | 2026-10-18 |
| Budget (design §11) | **12 tasks · ~650 LOC authored · 18 review rounds** — `/akili-execute` stops and escalates past 13 tasks, ~800 LOC, or 18 rounds |
| Commit prefix | `[SPEC:changes/akili-security]` — local commits only; **no push, no release, no publish** |
| Release note | Minor (new command). Recorded in T7's CHANGELOG entry; `npm run release:minor` is **not** run in this cycle |
| Verified at | `6d1e152` — baseline readings below were executed on 2026-10-18 and are quoted (KZ-changes--leader-brief-contract-2) |
| Upstream | `https://github.com/cloudflare/security-audit-skill` @ `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8`; the executing session re-clones it into an empty scratch directory if `/tmp/cf-sas.S52m/repo` is gone, and checks `git rev-parse HEAD` before copying |

## 2. Task Graph

```text
T1 (vendor skill + test/security-audit-skill.test.js)
 ├─→ T2 (command akili-security.md)            ─┐
 ├─→ T4 (install counts + doctor fixture)        │
 └─→ T5a (docs/skills page, README row, governance)
T3a ∥ T3b ∥ T3c ∥ T3d (reader scoping — one file each, independent of T1)
T2 + T3a–d ─→ T5b (docs/commands, README, flow.md, doc mirrors)
T2 ─→ T6 (AGENTS.md)
T1–T6 ─→ T7 (CHANGELOG + full verification sweep)
T7 ─→ T8 (dogfood quick run — HITL)
```

No cycles. T5b waits for T2 and T3a–d so each documented behaviour is quote-checked against shipped command text, not design text (KZ-002). T7 waits for everything for the same reason.

**`skip-eligible` tasks: none.** T3a–T3d are tiny but edit rules text read by agents (KZ-004 site); T4 edits pinned test evidence.

**Skills:** T1 `tdd` (smoke cases red first) · T2 `cognitive-doc-design` (gates and menus), `caveman` not applicable (persistent text) · T3a–d none beyond the persona defaults · T5a/T5b/T7 `cognitive-doc-design` · T8 `security-audit` (the shipped skill, via the command). No UI skill applies.

---

### T1 — Vendor `security-audit` at `c1c8a8c` + `test/security-audit-skill.test.js`

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M (~45 LOC authored in `SKILL.md` · ~140 LOC test · 18 files copied) |
| Depends on | none |
| Requirements | FR-1 (both scenarios incl. `BUT … any *.test.cjs`, `AND IT MUST … diff -r`, `AND IT MUST … body unchanged`), FR-7 (validator behaviour the gate relies on — smoke), NFR-2 |
| Design refs | §4, §7.2, DD-2, DD-3, DD-11, P-1, P-3–P-6 |
| Review | `full` — first vendored third-party payload with executable files; attribution is a licence obligation |

**Scope.**

- Copy the 18 upstream files of `skills/security-audit/` **except** `validate-findings.test.cjs` and `validate-coverage-ledger.test.cjs` into `.claude/skills/security-audit/`; copy upstream repo `LICENSE` to `.claude/skills/security-audit/LICENSE`.
- `SKILL.md`: add the frontmatter keys of design §7.2, append the `description` sentence, append `## AKILI-SPECS Integration` (Level 2 table + adaptation rules). Body from `# Security Audit` to the last anti-pattern untouched.
- Record in `execution.md`: `shasum -a 256` of every vendored file vs `$SCRATCH/upstream-sha256.txt` (18 upstream lines) and of `LICENSE` (`e598e694…6391`).
- New `test/security-audit-skill.test.js` (`tdd`, written red first): (a) file set equals the 19 expected names, no `*.test.cjs`; (b) `SKILL.md` frontmatter has `license: MIT`, `metadata.author` `Cloudflare, Inc.`, `source` containing `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8`, `adapted-for: "AKILI-SPECS"`, `binding: core`; (c) `LICENSE` contains `Copyright (c) 2025-2026 Cloudflare, Inc.`; (d) validator smoke via `spawnSync(process.execPath, [validator, tmpfile])`: findings `[]` → 0, findings `[{"verdict":"confirmed"}]` → 1, ledger `{}` → 1; (e) install payload: `install --tool claude --claude-target <tmp>` → `<tmp>/skills/security-audit` holds the same 19 files.

**Verification.**

| Field | Value |
|---|---|
| Command | `node --test test/security-audit-skill.test.js` · `npm test` · upstream checksum walk (`shasum -a 256 .claude/skills/security-audit/* \| sort` vs upstream, `SKILL.md` the only mismatch) · body gate: `diff <(sed -n '/^# Security Audit/,$p' upstream/SKILL.md) <(sed -n '/^# Security Audit/,$p' .claude/skills/security-audit/SKILL.md \| sed '/^## AKILI-SPECS Integration/,$d' \| awk '{a[NR]=$0} END{n=NR; while(n>0 && a[n]=="") n--; for(i=1;i<=n;i++) print a[i]}')` → empty, exit 0. **Executed at spec time** (judgment-day J-A2): on a scratch adaptation of upstream `SKILL.md` (3 frontmatter lines added + blank line + `## AKILI-SPECS Integration`) → exit 0; same file with one body byte changed → exit 1. The first draft's `sed '$d'` form left the separator blank line (`187a188 >`, exit 1) and is withdrawn |
| Red run (executed at baseline) | `ls .claude/skills/security-audit` → `No such file or directory` (so every case of the new test is red before the copy); validator smoke expectations executed on the upstream clone: `[]` → exit 0, `[{"verdict":"confirmed"}]` → exit 1, ledger `{}` → exit 1 (Node 18.20.8 and 22.23.3) |
| Falsifier | (1) copy `validate-findings.test.cjs` in → case (a) red. (2) delete `LICENSE` → (a) and (c) red. (3) edit one byte of `HUNTING.md` → checksum walk shows a second mismatch. (4) remove the pin from `source` → (b) red. Each executed post-change, red quoted |
| Disqualifier | A file-set check that reads the list from the directory it asserts (tautology) proves nothing — the 19 names are literals in the test. A smoke case run only on the session's Node is not CI-matrix evidence; Windows stays `UNVERIFIED` (P-13) until the user's first push |
| Consumers | `test/install-cursor.test.js` (`:245` assertion — the stale comments at `:216,:227,:232,:246,:340,:387` are T4's list) and `test/fixtures/doctor-codex-baseline.txt` go red here and are fixed in T4 (P-10) — T1's closure records them as expected reds, not regressions |

**Done.** Test file green; checksum walk recorded with exactly one mismatch (`SKILL.md`); the four falsifiers executed and quoted; `git diff --stat` shows no file outside `.claude/skills/security-audit/`, `test/security-audit-skill.test.js`, and the spec folder.

---

### T2 — `.claude/commands/akili-security.md`

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | L (~210 lines) |
| Depends on | T1 |
| Requirements | FR-2 (both scenarios), FR-3 (scenario, `AND IT MUST stop … no pre-approved mode`), FR-4 (both scenarios incl. `BUT … must NOT run`, `AND IT MUST NOT install … network … endpoints`), FR-5 (scenario + `AND IT MUST be eligible as a finding`), FR-6 (scenario, `BUT … except the index`), FR-7 (scenario), FR-8 (scenario: allowed fields, forbidden list, `Date of Audit`), FR-9 (scenario), FR-10 (scenario: print, `routed`, no creation, disclosure warning), FR-11, FR-12, NFR-5 |
| Design refs | §3, §5, §6, §7.1, DD-4, DD-6–DD-10, P-11, P-12, P-14, P-15 |
| Review | `lenses` — safety gate (execution of untrusted code) + disclosure boundary: lenses *safety* and *requirement conformance* |

**Scope.** Write the command per design §7.1. First step: settle P-14 — the capability check is phrased as a test the agent performs on its own host ("can you spawn an independent sub-agent?"), not a host list; record the outcome in `execution.md`. Index path rule references `/akili-audit` Step 3 by name. Brief addendum quoted once and required in every delegated prompt. Verification checklist one box per FR-2…FR-12 terminal obligation. Measure line count after drafting (NFR-5); over 230 → cut prose, never obligations.

**Verification.**

| Field | Value |
|---|---|
| Command | `wc -l .claude/commands/akili-security.md` ≤ 230 · `node bin/akili.js list \| grep akili-security` → 1 hit · clause walk: a table in `execution.md` mapping every scenario line and every `BUT`/`AND IT MUST` clause of FR-2…FR-12 to the quoted command sentence that delivers it · `grep -nE "drift-report\|most recent report" .claude/commands/akili-security.md` → 0 (the command never reads drift) |
| Red run | `ls .claude/commands/akili-security.md` → `No such file or directory` (baseline, 2026-10-18); `node bin/akili.js list` lists 11 commands |
| Falsifier | Clause walk is the gate: delete the FR-4 "no installs/network" sentence → the walk's FR-4 `AND IT MUST NOT` row has no quote (red). Mechanical aid: `grep -c 'bugfix/security-' .claude/commands/akili-security.md` ≥ 1 and `grep -c '~/' .claude/commands/akili-security.md` ≥ 1 (I-3, I-2 literals). Delete the "always stops" sentence → FR-3 row red. Insert "title" into the index allowed list → FR-8 `BUT` row contradicts. Each mutation applied to a scratch copy and the walk re-run, result quoted |
| Disqualifier | A walk that cites a sentence by paraphrase rather than quotation is not evidence (KZ-changes--gate-falsifiability-2). A presence grep for a keyword ("sandbox") proves presence, not the gate — the walk quotes the full obligation |
| Consumers | Installer enumeration (P-2) · `test/install-cursor.test.js` / doctor fixture (T4) · docs pages (T5b) |

**Done.** File exists, ≤ 230 lines, clause walk complete with no empty row, three falsifiers executed and quoted, P-14 outcome recorded.

---

### T3a — `akili-archive.md`: drift source → `drift-*.md`

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | XS (2 lines) |
| Depends on | none |
| Requirements | FR-13 (scenario incl. `BUT it must NOT read the security index as drift`) |
| Design refs | §7.3 row 1 + legacy-fallback paragraph, DD-5, P-7 |
| Review | `checklist` |

**Scope.** `.claude/commands/akili-archive.md:83-84` per design §7.3 (most recent `drift-*.md`; legacy fallback when no `drift-*.md` file).

**Verification.**

| Field | Value |
|---|---|
| Command | `grep -n "drift-\*" .claude/commands/akili-archive.md` → hits at the two lines; walk: with `audits/` = {`README.md`, `security-2026-10-18.md`} the text resolves to "no drift report → legacy fallback" |
| Red run | Baseline `grep -c "drift-" .claude/commands/akili-archive.md` → `1` (the legacy `drift-report.md` name only, `:84`) — no scoping exists |
| Falsifier | Revert `:83` only → the walk's input resolves the security index as "most recent report" (red); quote it |
| Disqualifier | A grep hit for `drift-*` that sits in a sentence about something else is presence, not the rule — read the hit |
| Consumers | `docs/commands/akili-archive.md:68` restates the rule ("the most recent report under `docs/specs/audits/` …") — mandatory edit in T5b; `docs/flow.md:424-425` (T5b) |

**Done.** Two lines changed, walk and falsifier quoted.

---

### T3b — `akili-audit.md`: *Reading reports back* → `drift-*.md`

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | XS (1–2 lines) |
| Depends on | none |
| Requirements | FR-13 |
| Design refs | §7.3 row 2, DD-5 + reversion challenge, P-7, P-16 |
| Review | `checklist` |

**Scope.** `.claude/commands/akili-audit.md:79` per design §7.3; "holds no report file at all" → "holds no `drift-*.md` file". Step 3's write path (`:68`) unchanged.

**Verification.**

| Field | Value |
|---|---|
| Command | `sed -n 79p .claude/commands/akili-audit.md` shows `drift-*`; walk with the T3a input |
| Red run | Baseline `grep -c "drift-" .claude/commands/akili-audit.md` → `4` (`:44` "drift-judging", `:68` write path, `:79` legacy `drift-report.md`, `:135` checklist path — none a filter) |
| Falsifier | Revert the edit → walk red (security index taken as most recent) |
| Disqualifier | As T3a |
| Consumers | `docs/commands/akili-audit.md:34` (T5b) |

**Done.** As T3a.

---

### T3c — `kaizen/SKILL.md`: *Drift attributable* source → `drift-*.md`

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | XS (2 lines) |
| Depends on | none |
| Requirements | FR-13 |
| Design refs | §7.3 row 3, P-7 |
| Review | `checklist` |

**Scope.** `.claude/skills/kaizen/SKILL.md:69` and `:74` per design §7.3.

**Verification.**

| Field | Value |
|---|---|
| Command | `grep -n "drift-\*" .claude/skills/kaizen/SKILL.md` → `:69`, `:74`; walk with the T3a input |
| Red run | Baseline `grep -c "drift-" .claude/skills/kaizen/SKILL.md` → `2` (both the legacy `drift-report.md` name) |
| Falsifier | Revert `:74` only → its definition again admits any report file (red in the walk) |
| Disqualifier | As T3a |
| Consumers | `docs/skills/kaizen.md:24` restates the source ("drift (the most recent report under `docs/specs/audits/` …)") — mandatory edit in T5b |

**Done.** As T3a.

---

### T3d — `akili-constitution.md`: `audits/` scaffold README names both kinds

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | XS (1 line) |
| Depends on | none |
| Requirements | FR-13 (last sentence) |
| Design refs | §7.3 row 4, P-7 |
| Review | `checklist` |

**Scope.** `.claude/commands/akili-constitution.md:39`. Read `:40` and `:1443`; edit only if they restate the folder's role as drift-only.

**Verification.**

| Field | Value |
|---|---|
| Command | `sed -n 39,40p` and `sed -n 1443p` quoted in the closure |
| Red run | Baseline `:39` reads *one drift report per `/akili-audit` run.* (quoted, 2026-10-18) |
| Falsifier | Phrase-family sweep `grep -n "one drift report\|drift report per" .claude/commands/*.md docs/**/*.md` before review (KZ-changes--kaizen-loop-closure-2): any surviving drift-only role statement is red |
| Disqualifier | As T3a |
| Consumers | `docs/commands/akili-constitution.md:43,53` (T5b) |

**Done.** Edited line quoted; sweep result quoted.

---

### T4 — Install counts and doctor fixture

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S (~12 lines) |
| Depends on | T1, T2 |
| Requirements | FR-1 (*Install on every host*), NFR-1, NFR-3, NFR-4 |
| Design refs | §9, P-1, P-2, P-10 |
| Review | `checklist` |

**Scope.** `test/install-cursor.test.js`: 199 → 218 (`:245` + message), 11 → 12 (`:249`), comment `11 + 24 = 35` → `12 + 25 = 37` (`:238`), `210` comment → `230` (`:340`), `:387` comment counts, plus the comments at `:216` (199), `:227` (`11 + 199 = 210` → `12 + 218 = 230`), `:232` (24 → 25) and the `:246` message; close with `grep -nE "199|210|\b24\b|\b11\b" test/install-cursor.test.js` → no stale hit (the `\b11\b` term covers `:249`'s `COMMAND_COUNT, 11`); any derived constant read, not guessed. `test/fixtures/doctor-codex-baseline.txt`: add `OK akili-security.md` and `OK security-audit` in sorted position.

**Verification.**

| Field | Value |
|---|---|
| Command | `npm test` → 0 fail; same on Node 18.20.8 (`~/.nvm/.../v18.20.8/bin/node --test`) and in `docker run --rm --network none node:18` / `node:22`; `node bin/akili.js install --tool all --dry-run` (scratch HOME) lists `akili-security` and `security-audit` per host; `npm run pack:dry-run` unpacked-size delta ≤ 320 KB vs baseline (measure baseline first at `6d1e152`); `git diff --stat -- bin/` empty |
| Red run | `npm test` on `$SCRATCH/pkg` (command + skill added, counts unchanged) → `# fail 2`: `not ok 65 … expected 199 … counted 218`, `not ok 75 … doctor-codex-baseline` (executed 2026-10-18) |
| Falsifier | Leave the fixture unedited → `not ok 75` returns; set 217 → `not ok 65` |
| Disqualifier | A green run on Node 22 alone does not cover P-3's Node 18 behaviour — the Node 18 run is required. A warm `node_modules`/global `akili` must not stand in for `bin/akili.js` (`which akili` irrelevant — tests spawn `bin/akili.js`) |
| Consumers | All of `test/` (full suite run) |

**Done.** Suite green on the three local Node versions and both Linux images; pack delta and `bin/` diff quoted; Windows recorded `UNVERIFIED` (P-13).

---

### T5a — `docs/skills/security-audit.md`, `docs/skills/README.md`, `docs/skills/governance.md`

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S (~70 lines) |
| Depends on | T1 |
| Requirements | FR-14 (skill page incl. re-sync procedure; README row; governance `core` row) |
| Design refs | DD-2, DD-11, §7.2 |
| Review | `checklist` |

**Scope.** Page: what/when/binding/attribution/licence, file set, why the two tests are excluded (P-3), re-sync procedure (clone at new commit into an empty dir → diff → copy minus tests → keep `SKILL.md` frontmatter + AKILI section → update pin in frontmatter, test, page, CHANGELOG). README row truthful (Binding `core`). Governance *Current assignment* `core` row gains `security-audit` (security). Governance checklist items 1–5 answered in the page with links.

**Verification.**

| Field | Value |
|---|---|
| Command | Quote-check each factual clause against HEAD (KZ-002): file count 19, pin, licence line; `grep -n "security-audit" docs/skills/README.md docs/skills/governance.md` → one row each |
| Red run | Baseline: `ls docs/skills/security-audit.md` → no such file; `grep -c security-audit docs/skills/governance.md` → `0` |
| Falsifier | State "20 files" in the page → quote-check red against `ls .claude/skills/security-audit \| wc -l` |
| Disqualifier | A clause verified against the design instead of the shipped files is not verified |
| Consumers | none beyond the docs |

**Done.** Three files, every clause quote-checked.

---

### T5b — Command docs, README, `docs/flow.md`, doc mirrors of T3

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M (~110 lines) |
| Depends on | T2, T3a–T3d |
| Requirements | FR-14 (command page, commands README row, README list/table, flow.md), FR-13 (doc mirrors), FR-4/FR-8 residual-risk statement |
| Design refs | §9 consumers, P-7 |
| Review | `checklist` |

**Scope.** New `docs/commands/akili-security.md` (incl. residual risk: agent behaviour cannot be machine-enforced; static-only default; disclosure note). Rows in `docs/commands/README.md` and `README.md` (command list `:84`, table `:583` neighbourhood, description list `:792` neighbourhood). `docs/flow.md` artifact table (`:153`) + standalone-commands narrative (`:284` neighbourhood) + `:424-425` drift-source wording → `drift-*`. `docs/commands/akili-audit.md:34`, `docs/commands/akili-archive.md:68` and `docs/skills/kaizen.md:24` (both restate the drift source — mandatory `drift-*` rewrite), `docs/commands/akili-constitution.md:43,53`. Count restatements in `docs/cli.md:117,182,194,216` (11 → 12 commands) and `:183,195,216` (24 → 25 skills).

**Verification.**

| Field | Value |
|---|---|
| Command | Phrase-family sweep over `docs/ README.md` for `most recent report`, `one drift report`, `audits/`, `drift-report` → every hit read and either updated or recorded as correct; count sweep `grep -rnE "\b(11\|24)\b" docs/ README.md` (excluding `docs/specs/`) → every command/skill-count hit updated or recorded as unrelated; quote-check each new clause against the shipped command (T2) |
| Red run | Baseline: `ls docs/commands/akili-security.md` → no such file; `grep -c "drift-\*" docs/flow.md` → `0` |
| Falsifier | Leave `docs/flow.md:424-425` (or `docs/commands/akili-archive.md:68`, or `docs/skills/kaizen.md:24`) unedited → sweep shows an unscoped "most recent report under `docs/specs/audits/`" (red). Leave `docs/cli.md:182` unedited → count sweep shows "the 11 commands" (red) |
| Disqualifier | As T5a |
| Consumers | none beyond the docs |

**Done.** Sweep table recorded with every hit's disposition.

---

### T6 — `AGENTS.md`

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | XS (~4 lines) |
| Depends on | T2 |
| Requirements | FR-14 (AGENTS.md *Skill Usage* line) |
| Design refs | DD-1, DD-7 |
| Review | `checklist` (rules document read by every session) |

**Scope.** *Skill Usage*: "Use `security-audit` for repository vulnerability discovery; `/akili-security` loads it (full audit mode); guidance mode for focused security questions." *Repository Purpose* `.claude/commands/` bullet unchanged (no command list there — verify).

**Verification.**

| Field | Value |
|---|---|
| Command | `grep -n "security-audit\|akili-security" AGENTS.md` → the new line(s) only; `CLAUDE.md` is `@AGENTS.md` (no second edit) |
| Red run | Baseline `grep -c "security-audit" AGENTS.md` → `0` |
| Falsifier | Write "core and conditional" → contradicts governance row (T5a) in the Reviewer's cross-read |
| Disqualifier | As T5a |
| Consumers | Every session (read-only) |

**Done.** Line quoted.

---

### T7 — `CHANGELOG.md` + full verification sweep

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S (~20 lines) |
| Depends on | T1–T6 |
| Requirements | FR-14 (CHANGELOG with release class), NFR-1–NFR-4, NFR-6 |
| Design refs | DD-2, DD-7, §11 |
| Review | `full` — KZ-002 recurrence site (summary clauses) |

**Scope.** `Unreleased` entry: new command, vendored skill (author, licence, pin, excluded tests and why), reader scoping, deferred routing row + follow-up bug, **release class: minor (not released in this change)**. Then run AGENTS.md *Verification*: `npm test`, `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check`, `node bin/akili.js install --tool all --dry-run` and `node bin/akili.js doctor --tool all` against a scratch HOME. Record P-13 open for the user's first CI run.

**Verification.**

| Field | Value |
|---|---|
| Command | The six commands above, outputs quoted; `git diff 6d1e152 -- bin/ .claude/templates/ docs/model-routing.md package.json` → empty (NFR-1, NFR-2, NFR-6); each CHANGELOG clause quote-checked at HEAD |
| Red run | Baseline `grep -c "akili-security" CHANGELOG.md` → `0` |
| Falsifier | A clause claiming "installs on all five hosts with tests" → red against T1 (no tests shipped) |
| Disqualifier | `npm test` green on one Node version is not the matrix (see T4) |
| Consumers | `scripts/release.js` reads `Unreleased` at the next release (not run here) |

**Done.** Entry quote-checked; all six outputs quoted; diff empty.

---

### T8 — Dogfood: `/akili-security --profile quick` on this repository (HITL)

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | — (a run, no code) |
| Depends on | T7 |
| Requirements | FR-3, FR-4 (default-run scenario), FR-7, FR-8 (default index scenario), FR-10 |
| Design refs | §3, §5 |
| Review | `full` — the only behavioural evidence for the two non-automatable defect classes |

**Scope.** **Whether T8 runs at all is Juan Carlos Cadavid's decision** — it is not executed without his explicit go-ahead at its own HITL pause. If approved: **no install** — this worktree's own `.claude/commands/akili-security.md` and `.claude/skills/security-audit/` (shipped by T1/T2) are what the session host loads, so the user's real HOME is never written; run `/akili-security --profile quick --budget 15 --out <session scratchpad>/security-run` so the run directory also stays out of HOME. The plan gate is presented **to the user**; static-only. Observe: no agent before **Run**; no target code executed (record every shell command the run issued); validators exit 0 or `incomplete` recorded; index written with redacted fields only; routing gate shown. The index file is committed only if the user approves its content; confirmed findings are routed only on the user's selection (each becomes a separate future proposal — never part of this spec, per *Scope only grows through approval*).

**Verification.**

| Field | Value |
|---|---|
| Command | The run itself; `cat docs/specs/audits/security-*.md`; validator outputs from the run dir |
| Red run | n/a — behavioural observation, no pre-change state to run |
| Falsifier | Index contains any forbidden field (§5.1) → FAIL; any target-controlled command in the run's shell log → FAIL |
| Disqualifier | A run that stopped at the budget gate without a terminal state is **inconclusive**, not PASS — report it as such. A clean index on a run with zero findings does not prove redaction — record "redaction unexercised" if no confirmed/needs_validation record exists |
| Consumers | none |

**Done.** Observations table in `execution.md`; user decision on committing the index recorded.

---

## 3. Coverage Closure (scenario / clause → task)

| Requirement clause | Task |
|---|---|
| FR-1 *Install on every host* (19 files, validators, schema, LICENSE; `BUT` no `*.test.cjs`; `AND IT MUST` `diff -r`) | T1 (e), T4 |
| FR-1 *Upstream fidelity* (17 + LICENSE match; `AND IT MUST` body unchanged) | T1 |
| FR-2 *Foreign copy* (+ `BUT` not silent) · *No Node.js* (+ `BUT` no unvalidated run) | T2 |
| FR-3 *Nothing before approval* (+ `AND IT MUST` always stop) | T2, T8 |
| FR-4 *Default run* (+ `BUT` no execution; `AND IT MUST NOT` installs/network/endpoints) · *control unconfirmed* · `run-metadata.json` `akili_execution` + expected-yield statement (P-17) | T2, T8 |
| FR-5 *Injected instruction* (+ `AND IT MUST` eligible as finding) | T2 |
| FR-6 *In-repo output not ignored* (+ `BUT` only the index under `docs/specs/`) | T2 |
| FR-7 *Validator fails* (+ `BUT` not complete) | T2; validator behaviour T1 (d) |
| FR-8 *Default index content* (+ `BUT` forbidden list incl. absolute home path / user name; `AND IT MUST` `Date of Audit`); `~`-relative path; accepted-disclosure advice | T2, T8 |
| FR-9 *Host without sub-agents* (+ `BUT` no self-verified confirmed) | T2 |
| FR-10 *Selection* (+ `BUT` creates nothing; `BUT` slug/pointer from date + `S-n` only; `AND IT MUST` disclosure warning) | T2, T8 |
| FR-11, FR-12 | T2 |
| FR-13 *Only a security index present* (+ `BUT` not read as drift) | T3a, T3b, T3c; README sentence T3d; mirrors T5b |
| FR-14 (page + re-sync, README row, governance, command page, commands README, README, flow.md, AGENTS.md, CHANGELOG + release class) | T5a, T5b, T6, T7 |
| NFR-1, NFR-2, NFR-4, NFR-6 | T4, T7 |
| NFR-3 | T4 (local + Linux), P-13 Windows open |
| NFR-5 | T2 |
