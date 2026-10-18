# Validation Report — /akili-security (changes/akili-security)

**Verdict: PASS with warnings. Archive-ready once the user accepts the WARNs.** No FAIL. All 13 tasks are `[x]` with evidence. Every FR-1…FR-14 and NFR-1…NFR-6 clause is owned by a task and has evidence. Both validator and install claims were re-run on HEAD and hold. The 8 WARNs are minor: one whitespace check, one under-specified pin check, two evidence gaps (redaction unexercised, Windows CI), and four spec-document drifts that the archive can correct. No code change is required to archive.

| Result | Count | Where |
|---|---|---|
| PASS | 13 tasks · 17 of 20 requirement rows · 7 build checks · design/proposal conformance | §3, §5, §6, §8 |
| WARN | 8 (W-1 … W-8) | §11 |
| FAIL | 0 | — |
| BLOCKED | 1 — Windows CI legs (no access; the user's first push settles it, P-13) | §5 |

---

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-security` |
| Validated at | `7a9f84c` (branch `JuankCadavid/skill-security-audit`, clean tree) against base `6d1e152` |
| Date | 2026-10-18 |
| Auditor | Validation auditor (T3), Claude Opus 5.5, independent context. The implementation was authored by `sonnet` Implementers, so author ≠ auditor holds |
| Method | `/akili-validate`, Phases 0–7 |
| Constitutional context | Root `CLAUDE.md` (`@AGENTS.md`) and `AGENTS.md` were read. `docs/prd.md`, `docs/ux-ui/design.md`, `docs/trd/trd.md` and `docs/specs/general-setup/` do not exist in this repo, so they are **N/A**, not gaps |
| Spec documents read | `proposal.md`, `requirements.md`, `design.md`, `tasks.md`, `execution.md` (whole), `judgment.md`, `test-report.md` (primary coverage evidence) |
| Upstream | `/tmp/cf-sas.S52m/repo`, `git rev-parse HEAD` → `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8` (read only) |
| Writes | This file only. No commit, push, or release |

## 2. Summary

| Area | Result | One-line reason |
|---|---|---|
| Task completion | PASS | 13/13 `[x]`; each task has an entry in `execution.md` with an Implementer record, a non-author evidence re-run, and a Reviewer verdict |
| File existence | PASS | Every file in design §4 exists at HEAD. The extras are the S2 test (test phase) and the T8 index (user-approved) |
| Build integrity | PASS · 1 WARN · 1 BLOCKED | 325/325 on Node 22.12.0 and 18.20.8; `verify:cli` 12/25/8; pack 302 files with 0 `*.test.cjs`; `git diff --check` against base fails on one spec-doc blank line (W-1); Windows is not verifiable from here |
| Requirement coverage | 17 PASS · 3 WARN | FR-2 pin check is not operational (W-2); FR-8 redaction never exercised (W-3); NFR-3 Windows open (W-4) |
| Quality / 4R | Advisory only | 12 carried-forward advisories (§7) |
| Design conformance | PASS · 4 WARN | design §3 keeps the superseded routing-gate claim (W-5); stale CHANGELOG figures (W-6); stale traceability tables (W-7); review-round overrun past the user's authorization (W-8) |
| Test evidence | PASS | `test-report.md` matrix cross-checked; the 60 S2 tests re-run green |
| Constitution impact | PASS | No module guide needed; CodeGraph re-index due at archive |

## 3. Task Completion

| Task | Status | Attempts | Evidence (execution.md) | Result |
|---|---|---|---|---|
| T1 vendor + skill test | `[x]` | 1 | Checksum walk (one mismatch: `SKILL.md`), body gate exit 0, four falsifiers, Reviewer ran `diff -r` on six roots | PASS |
| T2 command | `[x]` | 3 (safety FAIL → conformance FAIL → PASS on both lenses) | Clause walks, falsifiers, amendments T-1/T-2/T-3 applied | PASS |
| T3a–T3d reader scoping | `[x]` ×4 | 1 each | Grep, four-case walk, Reviewer PASS ×4 | PASS |
| T4 counts + fixture | `[x]` | 1 | Node 18/22 at 265/265 at the time. Recorded deviation: bare Linux images fail `tasks-gate` (no `jq`), reproduced at base | PASS (deviation recorded) |
| T5a skill docs | `[x]` | 1 + reopened scope (`LICENSE` re-sync) | Quote-check at HEAD | PASS |
| T5b command docs | `[x]` | 2 | Phrase and count sweeps; Reviewer PASS | PASS |
| T6 AGENTS.md | `[x]` | 1 | `AGENTS.md:59` | PASS |
| T7 CHANGELOG + sweep | `[x]` | 1 | Six verification commands quoted | PASS (see W-6 on figures that went stale later) |
| T7a gate-phrase pivot | `[x]` | 1 | Pivot Record T7a, user-approved | PASS (see W-5 on a missed site) |
| T8 dogfood (HITL) | `[x]` | 2 (record-fidelity FAIL → PASS) | 19-row shell-command record checked against the transcript; index committed with user approval | PASS |

## 4. File Existence

| Design §4 entry | HEAD | Result |
|---|---|---|
| `.claude/commands/akili-security.md` (NEW) | 173 lines | PASS |
| `.claude/skills/security-audit/` (NEW, 19 files) | 19 files; both `.cjs` have mode `100755` | PASS |
| `akili-archive.md`, `akili-audit.md`, `kaizen/SKILL.md`, `akili-constitution.md` (EDIT) | `:83-84`, `:79`, `:69,:74`, `:39` hold `drift-*` / both kinds | PASS |
| `test/security-audit-skill.test.js` (NEW) | 6 tests | PASS |
| `test/install-cursor.test.js` (EDIT) | `218`, `12 + 218 = 230`, `25`, `12 + 25 = 37`, `COMMAND_COUNT, 12` | PASS |
| `test/fixtures/doctor-codex-baseline.txt` (EDIT) | `:18 OK akili-security.md`, `:40 OK security-audit`, `:74 ok 45` | PASS |
| `docs/skills/security-audit.md`, `docs/skills/README.md:35`, `docs/skills/governance.md:37` | present, `core` row | PASS |
| `docs/commands/akili-security.md`, `docs/commands/README.md:20,36,53`, `README.md:85,587,798,844`, `docs/flow.md:154,291-292` | present | PASS |
| `docs/commands/akili-{audit,archive,constitution}.md`, `docs/skills/kaizen.md:24`, `docs/cli.md:117,182-183,194-195,216` | updated | PASS |
| `AGENTS.md:59`, `CHANGELOG.md` Unreleased | present | PASS |
| Not in §4 | `test/akili-security-command.test.js` (S2, test phase); `docs/specs/audits/security-2026-10-18-JuankCadavid--skill-security-audit.md` (T8, user-approved) | PASS (expected) |

`git diff 6d1e152 --name-only` lists 50 files. Every non-spec path maps to a row above, and nothing else changed.

## 5. Build Integrity

All commands were re-run by this auditor at `7a9f84c`.

| Check | Output | Result |
|---|---|---|
| `npm test` (Node 22.12.0) | `# tests 325 · # pass 325 · # fail 0 · # skipped 0` | PASS |
| `node --test` (Node 18.20.8) | `# tests 325 · # pass 325 · # fail 0` | PASS |
| `npm run verify:cli` | `Summary: 12 commands \| 25 skills \| 8 resources (akili-specs v2.32.2)` | PASS |
| `npm pack --dry-run --json` | 302 files, `unpackedSize` 4,791,859 B; base `6d1e152` (measured via `git archive`) 4,494,174 B / 280 files → **+297,685 B**; `*.test.cjs` in tarball: 0 | PASS (NFR-4) |
| Real install, scratch HOME, `--tool all` | exit 0; six skill roots each hold `security-audit/` with 19 files, 0 `*.test.cjs`, `diff -r` identical to source; command lands for all five hosts; `doctor --tool all` → five hosts `HEALTHY ok 45 \| missing 0` | PASS |
| `git diff --stat 6d1e152 -- bin/ .claude/templates/ docs/model-routing.md package.json` | empty | PASS (NFR-1, NFR-2, NFR-6) |
| `git diff --check 6d1e152` | exit 2: `docs/specs/changes/akili-security/design.md:207: new blank line at EOF.` | **WARN (W-1)** |
| Windows CI (ubuntu/macos/**windows** × Node 18/22) | Not runnable here | **BLOCKED** (P-13; settled by the user's first push) |
| Linux bare images `node:18`/`node:22` | T4 record: `tasks-gate` fails because `jq` is absent; reproduces at `6d1e152` | Pre-existing, not attributable |

W-1 judgment: the blank line was added at specify (`27acfb5`), so execute did not introduce it. It is still part of this branch's diff, and the proposal's success criteria require `git diff --check` to be green. Severity is low (spec doc, whitespace). T7's "`git diff --check` → empty" was a working-tree check, so it does not contradict this.

## 6. Requirement Coverage

The coverage matrix in `test-report.md` §7 was cross-checked against `requirements.md` at clause level. The obligations in the shipped command were re-read at HEAD. "S2" means `test/akili-security-command.test.js`.

| Req | Clause(s) (quoted) | Owner | HEAD evidence | Test evidence | Result |
|---|---|---|---|---|---|
| FR-1 | *Install*: "19 files … BUT it must NOT hold any `*.test.cjs` … AND IT MUST be byte-identical … (`diff -r`)"; *Fidelity*: "all 17 non-`SKILL.md` upstream files and `LICENSE` match … AND IT MUST show `SKILL.md`'s upstream body … unchanged" | T1, T4 | `cmp`: 17 files + `LICENSE` identical; the only `SKILL.md` diff is frontmatter + description sentence + appended section; body gate `rc=0`; six roots identical (§5) | S1 (6 tests), install-cursor counts | PASS |
| FR-2 | "check that the loaded copy carries `adapted-for` … and the pinned source commit"; *Foreign copy* "BUT it must NOT silently continue"; *No Node* "BUT it must NOT run an audit whose findings cannot be validated" | T2 | `akili-security.md:37-38` | S2 ×5; T8 preflight | **WARN (W-2)**: `:37` checks "a `source` naming the pinned commit" but never states the pin, so the check cannot be falsified |
| FR-3 | "no reconnaissance, hunter or verifier agent has been spawned and no run directory exists"; "AND IT MUST stop at this gate on every run — … no pre-approved mode" | T2, T7a, T8 | `:25`, `:40`, `:44`, plan table `:46-56` (all FR-3 fields + expected yield) | S2 ×3 + 2 Pivot tests; T8 (`ls` → no run dir before **Run**) | PASS (advisory K-7: preflight aborts never reach the gate) |
| FR-4 | *Default* "BUT it must NOT run any target-controlled build, test, script, install, fixture or process"; "AND IT MUST NOT install dependencies, fetch from the network, or probe deployed endpoints on any run"; *control unconfirmed* "policy reads static-only, naming the missing control"; *who* (T-3); `akili_execution`; expected yield | T2, T8 | `:56`, `:60`, `:72`, `:76`, `:107` | S2 ×9; T8 19-row shell record; `akili_execution: "static-only"` | PASS (sandboxed branch unexercised and accepted, test-report §9) |
| FR-5 | "The command text and every delegated agent's brief MUST state this"; "AND IT MUST be eligible as a finding" | T2 | `:27` (binds the parent and Guidance review), addendum `:76` | S2 ×3; T8: addendum verbatim in 10/10 prompts | PASS |
| FR-6 | "only when the user picks it and `git check-ignore` confirms"; "BUT it must NOT ever write under `docs/specs/` except the index" (unamended) | T2 | `:58`, `:149`, `:161` | S2 ×3; T8 run dir outside the target | PASS (advisory K-1: realpath) |
| FR-7 | "produced only when both exit 0, or … `run_status: \"incomplete\"`"; "BUT it must NOT describe an unvalidated run as complete" | T1 (smoke), T2 | `:82-89`, `:151` | S1 smoke; S2 ×3; T8 both validators exit 0 (re-run by the T8 Reviewer) | PASS (advisory K-3) |
| FR-8 | allowlist; location forms (T-1); "BUT it must NOT contain an absolute home path or user name, a title, fingerprint, file path or line …"; "AND IT MUST carry a `Date of Audit` header" | T2, T8 | `:93-122`; committed index has `Date of Audit`, `<external>/run-1`, and a grep for `/Users\|/private\|/tmp\|jcadavid\|claude-501\|fingerprint\|~/\|.ext:N` finds nothing | S2 ×7; T8 index | **WARN (W-3)**: the text contract and the index hold, but the dogfood had zero records, so **redaction of an `S-n` row was never exercised**. The human gate in requirements §8 therefore saw only the empty case |
| FR-9 | "**Run** is replaced by **Guidance review**"; "BUT it must NOT produce a `confirmed` record verified by the agent that found it" | T2 | `:40`, `:68`, `:148` | S2 ×3 | PASS (branch unexercised; P-14 per-host stays UNVERIFIED by design) |
| FR-10 | print line + `S-2 → routed`; "BUT it must NOT create any spec folder…"; "BUT the printed slug and pointer must NOT contain any text taken from a finding"; "AND IT MUST warn … private fork / private advisory"; `rejected` not listed | T2, T7a, T8 | `:124-138` | S2 ×6; T8 gate reached with nothing to route | PASS (selection unexercised; see advisory A-4 on same-day slug collision) |
| FR-11 | next unused `run-<N>`; prior runs passed; "the index states how many prior runs were read" | T2 | `:72`, `:105` | S2 ×1; T8 `Prior runs read: 0` | PASS |
| FR-12 | "SHALL NOT modify target source, commit, push, or open issues/PRs"; "only writes to tracked repository content are the index file" (T-2) | T2 | `:58`, `:78`, `:167` | S2 ×2; T8 record row 17 | PASS |
| FR-13 | three readers take "`drift-*.md` files only"; *Only a security index* "falls back to legacy … BUT it must NOT read the security index as drift"; constitution README names both | T3a–T3d, T5b | `akili-archive.md:83-84`, `akili-audit.md:79`, `kaizen/SKILL.md:69,74`, `akili-constitution.md:39`; full sweep of `.claude/ bin/ scripts/` finds no unscoped reader | S2 ×11 | PASS |
| FR-14 | five governance items; page with re-sync (pin, file set, two excluded tests, why); README / commands / flow / AGENTS rows; CHANGELOG "stating the release class (minor)" | T5a, T5b, T6, T7 | all present (§4); CHANGELOG `:5` "release classified minor" | Reviewer quote-checks | PASS (figure drift → W-6) |
| NFR-1 | `git diff <base> -- bin/` empty | T4, T7 | empty | — | PASS |
| NFR-2 | `package.json` unchanged | T1, T7 | empty | — | PASS |
| NFR-3 | CI matrix green | T4 | Node 18.20.8 / 22.12.0 at 325/0 (re-run); 22.23.3 and Linux per records | — | **WARN (W-4)**: Windows unverified (P-13) |
| NFR-4 | unpacked growth ≤ 320 KB | T4, T7 | +297,685 B ≤ 327,680 B | — | PASS |
| NFR-5 | ≤ 230 lines; method stays in the skill | T2 | 173 lines | S2 `NFR-5` | PASS |
| NFR-6 | no template / model-routing diff | T7 | empty | — | PASS |

Scenario orphans: none. Each scenario line and each `BUT` / `AND IT MUST` clause above has a quoted owner, and no gap is closed by citing a different requirement. `test-report.md` records no `PRODUCT_BUG`, `FAIL`, or flaky entry. Its §9 accepted gaps are carried into W-3, W-4, and the notes above.

## 7. Linting & Code Quality

No linter is configured for Markdown or command text. `git diff --check` is the only static check (W-1). `.cjs` files are vendored byte-identical, so they are not linted as AKILI code.

**4R advisory sweep (advisory only; not spec violations).** Unresolved `ADVISORY` items from `execution.md` are carried forward here, as the method requires.

| # | Lens | Advisory | Source | Carried as |
|---|---|---|---|---|
| A-1 | Risk | Run-directory checks do not resolve symlinks (realpath) before the in-target / ignored / `docs/specs/` tests | T2 a3 safety | K-1 |
| A-2 | Reliability | Validator smoke cases are exit-code-only: a missing validator also exits 1. No valid-ledger → 0 case | T1 | K-3 |
| A-3 | Risk | In a self-audit, `<skill-dir>` validators live inside the target. The parent's helper `python3 -c` ran without isolation, with cwd inside the target | T8 | K-8 |
| A-4 | Reliability | `bugfix/security-<date>-s<n>` collides when two runs on the same date both route `S-n`. The slug carries no run number | T2 a1 safety advisory — **not in K-1…K-9 or the open-items table; surfaced here so it does not die in the trail** | new |
| A-5 | Risk | The execution-gate list of the four controls paraphrases upstream and drops "read-only toolchain", scratch-local `HOME`/temp/caches, and the loopback-only exception. A user could approve a weaker sandbox | T2 a1 safety advisory — not carried before | new |
| A-6 | Risk | A continued foreign skill copy is recorded in neither the plan nor the index. Under `sandboxed-approved`, the addendum does not name the mechanism | T2 a1 safety advisory — not carried before | new |
| A-7 | Risk | The `akili install --force` offer overwrites every installed file on every root, not only this skill | T2 a1 safety advisory — not carried before | new |
| A-8 | Risk | Preflight runs `git` in the target. A hostile local `.git/config` (`core.fsmonitor`) could execute code before the plan gate | judgment I-10 (left as info at specify) | new |
| A-9 | Readability | The index filename carries a GitHub handle (`-JuankCadavid--…`) through the `/akili-audit` branch-suffix rule. FR-8 bans user names only in content | T8 Reviewer | K-9 |
| A-10 | Readability | "Every run is **static-only**" followed by its exception, in the command `:60`, the docs page, and CHANGELOG. "terminal state" (Step 4) is undefined for Stop / Guidance review | T5b A, own sweep | new |
| A-11 | Readability | Step 5 has no wording for zero confirmed records. Adjust + Run in one message re-shows the plan without a second stop | T8 Reviewer | new |
| A-12 | Coverage | Four audit units were deferred by the quick profile (D-1 symlinked install root, D-2 skill scripts path/argv injection, D-3 indirect injection via skills, D-4 persona parser) | T8 | D-1…D-4, for a later `standard` run |

Also open for kaizen: K-2 (pin literal, raised as W-2 here), K-4, K-5, K-6, K-7.

## 8. Design Conformance

| Check | Finding | Result |
|---|---|---|
| Architecture (design §3, §7.1) | The command follows the §7.1 sections and keeps the method in the skill (thin wrapper, 173 lines) | PASS |
| Skill adaptation (§7.2, DD-11) | Frontmatter matches §7.2 key by key and the governance *Frontmatter Schema*; the description sentence is appended; the AKILI section has no extra claims | PASS |
| Reader scoping (§7.3, DD-5) | All four sites and the legacy fallback condition match | PASS |
| DD-2, DD-3, DD-7 | No `*.test.cjs` shipped; smoke tests present; no routing row; template and doc untouched | PASS |
| Amendments T-1/T-2/T-3 (forward) | FR-8 statement + scenario, FR-10 `<pointer>`, FR-12, FR-4 *who*, design §5.1 Header and Execution-policy rows, tasks §3 FR-8 row: all applied and reflected in the command `:58`, `:60`, `:107`, `:112-120`, `:135` | PASS |
| Amendments (backward) | No document cites the superseded `~`-only or `docs/specs/`-only text as current. `judgment.md` I-2/I-3 are history | PASS |
| Pivot T7a / amended DD-6 | Command, docs page, README, flow, and CHANGELOG are corrected. **`design.md:46` still reads "`Step 5  ROUTING GATE (always stops)`"**, the claim DD-6 now negates in the same document. The Pivot's closure grepped "every run" and missed the "always stops" form | **WARN (W-5)** |
| Proposal alignment | Intent, Option A, and non-goals hold. Approved deltas are recorded: tests not vendored (Q3 → DD-2), routing row deferred (Q5 → DD-7), titles/fingerprints removed from the default index (gate I-2 → DD-4). Success criteria met except "`git diff --check` green" (W-1) | PASS |
| Budget (design §11) | Tasks 13 (tripwire "past 13", so at the line, not over); LOC ~575 / ~650. Review rounds **21 / 18**. The user authorized going to 20 ("no further overrun is taken without asking", `execution.md:430`). The T8 rework took it to 21 with no recorded user decision (`execution.md:582`) | **WARN (W-8)** |

**Cross-document figure check.**

| Figure | Claimed in | Contrasted with | Result |
|---|---|---|---|
| 19 files / 17 + `LICENSE` / 18 upstream non-test / 20 upstream | requirements FR-1, design §4 and §9, docs page, CHANGELOG, execution T1, T5a reopened | HEAD `ls` 19; upstream `ls` 20 | Agree. Advisory: tasks T1 Scope "Copy the 18 upstream files … **except** the two tests" reads as 18 − 2 |
| 14 companion `.md` (4 phase + 10 domains) | proposal (gate I-8), CHANGELOG "ten domain guides" | HEAD | Agree |
| 12 commands / 25 skills / 218 / 230 / 37 / ok 45 | design §4, docs/cli.md, install-cursor, fixture, CHANGELOG | `verify:cli`, `find` (218), doctor `ok 45` | Agree |
| NFR-5 ≤ 230; design "~210"; T2 "173" | requirements, design §7.1, execution | `wc -l` 173 | Agree |
| Package growth: design §9 "+~261 KB"; T4 "+291,503 B"; T7 and CHANGELOG "4,786,016 B (+291,842 B)"; test-report NFR-4 "+291,842 B" | design, execution, CHANGELOG, test-report | HEAD +297,685 B (4,791,859 B) | Design's 261 KB counted the skill only (the command and docs also ship). That is an advisory. **CHANGELOG and test-report are stale since T7a** → W-6 |
| "`npm test` → 265 pass" | CHANGELOG `:16` | HEAD 325 (S2 added 60) | **Stale → W-6** |
| Test counts: S2 60, total 325, S1 6 | test-report | `node --test` → 60 + 6 = 66; 325 | Agree. Advisory: per-row tallies are slightly off (FR-13 has 11, not 10; NFR-5 has 1 named test, not 3), and the total is right |
| Premise Ledger "17 rows — 15 verified, 2 UNVERIFIED" | design §12 | P-1…P-17; P-13 and P-14 UNVERIFIED | Agree |
| Budget 12 tasks / 18 rounds | design §11, tasks §1, execution §1 | Actual 13 / 21 | Reported in the execution Summary; see W-8 |
| T8: 10 agents of 15; 21 coverage units (12 covered + 4 deferred + 5 out of scope) | execution T8 | Validator line "21 coverage units valid"; 4 + 5 + 1 = 10 | Agree |
| ID Index vs coverage tables | requirements §9: FR-3 → T2; FR-7 → T1, T2; FR-10 → T2 | tasks §3: FR-3, FR-10 → T2, **T8**; T8 Requirements: FR-3, FR-4, FR-7, FR-8, FR-10; T7a Requirements: FR-3, FR-10. tasks §3 has **no T7a row** | **Disagree → W-7** |

## 9. Test Evidence Summary

| Suite | Evidence | Re-run here | Result |
|---|---|---|---|
| S1: vendored skill + install payload | `test/security-audit-skill.test.js` (6, red-first), install-cursor counts, fixture | 6/6 green; real six-root install `diff -r` identical | PASS |
| S2: command text contract + reader scoping | `test/akili-security-command.test.js` (60, anchored regexes, four falsifiers executed by the Tester) | 60/60 green | PASS |
| S3: runtime (T8 dogfood, HITL) | `execution.md` T8, checked by an independent Reviewer against the transcript | Committed index inspected; forbidden-string grep clean | PASS on the exercised branches |
| Accepted gaps | test-report §9: foreign copy, no Node, sandboxed approval, in-repo `--out` refusal, validator failure, Guidance review, routing selection, detailed opt-in, re-run with priors; **redaction unexercised**; Windows; Linux `jq` | — | Carried as W-3 and W-4 plus notes |

## 10. Agent Guide / Constitution Impact

| Item | Status | Result |
|---|---|---|
| `## Constitution Impact` notes | T2: "None needing a guide: a new command file, no module or package boundary changed" | PASS |
| `AGENTS.md` | *Skill Usage* line at `:59`; `CLAUDE.md` = `@AGENTS.md`; no command list to update | PASS |
| CodeGraph | `.codegraph/` exists; re-index is due | Pending for `/akili-archive` |

## 11. Remediation

None of these blocks archiving. Each one needs the user to accept it or to approve its fix.

| ID | Level | Finding (evidence) | Remediation |
|---|---|---|---|
| W-1 | WARN | `git diff --check 6d1e152` → `design.md:207: new blank line at EOF` (exit 2) | Remove the trailing blank line of `design.md` (one-line spec edit at archive). Afterwards `git diff --check 6d1e152` → exit 0 |
| W-2 | WARN | FR-2 "the pinned source commit": `akili-security.md:37` never names the pin. After a future re-sync, a stale AKILI copy kept by skip-existing install would pass silently, which is the case FR-2's `BUT` forbids | Write the literal `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8` into Step 0.1, and add "the command's Step 0.1 pin" to the re-sync step 4 list in `docs/skills/security-audit.md`. Route through `/akili-propose` (it is rules text). Already kaizen K-2 |
| W-3 | WARN | FR-8 redaction was never exercised with an `S-n` row (0 records in run-1; T8 Disqualifier) | Accept as a recorded gap. Close it with a dogfood on a fixture repo with a planted defect (test-report §9) |
| W-4 | WARN | NFR-3: Windows legs unverified (P-13); Validation BLOCKED for that leg | The user's first push → CI run, with the result recorded |
| W-5 | WARN | `design.md:46` "ROUTING GATE (always stops)" contradicts amended DD-6 (`design.md:164`) and the command `:124` "(stops whenever reached)"; a T7a closure miss | Change it to "(stops whenever reached)" at archive; grep the "always stop" family across the spec folder |
| W-6 | WARN | `CHANGELOG.md:6` "4,786,016 B (+291,842 B)" vs HEAD 4,791,859 B (+297,685 B); `CHANGELOG.md:16` "265 pass" vs HEAD 325; test-report NFR-4 row repeats +291,842 B. These are summary claims stale at HEAD (KZ-002 family) | Refresh both figures in the Unreleased entry (or drop the byte figure and keep "within the 320 KB bound") before the release commit |
| W-7 | WARN | `requirements.md` §9 ID Index omits T8 for FR-3/FR-7/FR-10 and T7a for FR-3/FR-10; `tasks.md` §3 has no T7a row | Add the owners at archive (traceability-only edit) |
| W-8 | WARN | Review rounds 21/18. The user authorized up to 20 and "no further overrun … without asking" (`execution.md:430`); round 21 (T8 rework) has no recorded decision | The user accepts the overrun at the archive gate; kaizen records it (pairs with judgment I-4: the estimate equalled the cap) |

## 12. Archive Readiness Recommendation

**Ready to archive once the user accepts W-1…W-8.** Checklist:

- [x] All 13 tasks `[x]`, each with execution evidence
- [x] No unresolved FAIL; no `PRODUCT_BUG`
- [x] Tests cover every FR and NFR at clause level (text contract + dogfood + unit)
- [x] Execute-time drift (T-1/T-2/T-3, Pivot T7a) is recorded in the spec docs. W-5 and W-7 are leftover edits from that drift
- [ ] User accepts W-1…W-8 (or approves the doc-only fixes for W-1, W-5, W-6, W-7 during archive)
- [ ] User reviews this summary

Suggested split: W-1, W-5, and W-7 are spec-folder text fixes that `/akili-archive` can apply. W-6 belongs before the minor release commit. W-2 and advisories A-4…A-8 are rules-text changes to the command, so they need a separate `/akili-propose`, not this spec, per *Scope only grows through approval*. W-3 and W-4 close with future evidence.

```text
/akili-archive changes/akili-security
```
