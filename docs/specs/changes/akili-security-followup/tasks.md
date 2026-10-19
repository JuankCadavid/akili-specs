# Tasks: `/akili-security` follow-up — pin literal, five safety advisories, Windows decision

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-security-followup` |
| Depth | Standard (compact) |
| Type | Change |
| Approval Mode | `gated` |
| Status | **Approved** at the specify gate, 2026-10-19 (Juan Carlos Cadavid), after judgment-day APPROVED (round 2) and gate adjustments GA-1…GA-7 (`judgment.md`) |
| Date | 2026-10-19 |
| Budget (design §11) | **5 tasks · ~270 LOC · 12 review rounds** — `/akili-execute` stops and escalates past 6 tasks, ~350 LOC, or 14 rounds |
| Commit prefix | `[SPEC:changes/akili-security-followup]` — local commits only; **no push, no release, no publish** |
| Verified at | `5c944d0` — baseline readings below were executed on 2026-10-19 and are quoted (KZ-changes--leader-brief-contract-2) |
| Baseline | `node --test test/akili-security-command.test.js test/security-audit-skill.test.js` → `# tests 67 · # pass 67 · # fail 0` (Node v22.12.0) |

## 2. Task Graph

```text
T1 (command Steps 0–1 + tests) ─▶ T2 (command Steps 2–5, errors, checklist + tests) ─┬─▶ T3 (skill docs + SKILL.md AKILI row + upstream draft)
                                                                                      └─▶ T4 (user docs restatements)
T3, T4 ─▶ T5 (CHANGELOG + full verification + phrase-family sweep)
```

T3 and T4 are parallel-safe with each other (disjoint files).

**Pattern convention (GA-3):** inside table cells `\|` is the markdown escape for `|`. Run every pattern with a plain `|` — under BSD/macOS `grep -E`, `\|` is a literal pipe and a 0-hit check would pass vacuously.

| Task | Size | Review | Skills |
|---|---|---|---|
| T1 | M | `lenses` — safety gate (preflight, ref reading, execution gate): *safety* + *requirement conformance* | `security-audit` (guidance), `tdd`, `cognitive-doc-design` |
| T2 | M | `lenses` — disclosure boundary (index) + routing: *safety* + *requirement conformance* | `security-audit` (guidance), `tdd`, `cognitive-doc-design` |
| T3 | S | `checklist` — docs + one AKILI-section row; the draft is not shipped | `cognitive-doc-design` |
| T4 | S | `checklist` — restatements only | `cognitive-doc-design` |
| T5 | S | `full` — summary surface (KZ-002, recurrence 7+) | `cognitive-doc-design` |

No task is `skip-eligible`.

**Shared grep for `git` invocations** (T1, T2, T5): ``grep -n -E '`git [a-z-]+|git (status|check-ignore|rev-parse)' .claude/commands/akili-security.md`` (plain backticks — `\`` is a buffer anchor in GNU grep). Baseline (executed 2026-10-19): `:40` (`git status --porcelain`), `:59` (`git check-ignore -q <dir>`). Checked against samples: "Never run git in the target before **Run**, and never in Steps 4 and 5" and "no git command ran in the target before Run" → no match; "run `git status --porcelain`" and "`git check-ignore -q <dir>`" → match. After the change: **0 hits** — the prohibition and the checklist item are written without backticks and are pinned by their own tests.

---

### T1 — Command Steps 0–1 + their tests

| Field | Value |
|---|---|
| Status | `[x]` |
| Depends on | none |
| Requirements | FR-1 (stale copy: foreign-copy treatment, `BUT … a commit`, `AND IT MUST … 40-character literal`; pin sites agree — the test), FR-2 (all three scenarios: restore offered incl. `BUT … --force, an npx command …`, `AND IT MUST NOT move …`; after restore incl. `BUT … NOT run the audit in the session that loaded the foreign copy`; copy inside the target — entry **or** resolved path — incl. `BUT … NOT move anything inside the target`), FR-3 (plan half: *Skill copy* field, `pinned`), FR-4 (scenario incl. both `AND IT MUST` clauses and `BUT … paraphrase`), FR-6 (both scenarios' preflight halves: program never runs, *Target* field, dirty asked, `BUT … any other git command`; hostile content incl. directory symlinks, `.git` symlink or `gitdir:` file → `not determined`, `BUT no content … whose real path is outside … .git … reaches the plan`, `AND IT MUST admit … hex … safe charset`), FR-7 (both scenarios' refusal halves incl. `BUT … ignore rule`; contains-target; HOME inside target), NFR-1 |
| Design refs | §5.1, §7 rows 0.1, 0.3, 1 table, 1 run dir, 1 exec gate; DD-1, DD-2, DD-4, DD-5, DD-6; P-1–P-5, P-11–P-13, P-15 |
| Scope | `.claude/commands/akili-security.md` Steps 0–1: `:37` (pin + offer), `:40` (ref as data), `:47-57` table (*Target*, *Skill copy*, *Disclosure* `:56`), `:59` (run-dir rule), `:61` (exec gate) — `:39` untouched. Tests in `test/akili-security-command.test.js`: changed `:73`, `:77-78`, `:145-146`, `:203-205`, `:207-209`; new cases (pin literal, three-option offer, no `--force`/`npx` command, link-not-target, command ends after restore, no move when entry or resolved path is inside the target, `:41` lead clause, four bullets, `:48` exposure rule, no `git` before Run over the **whole** command, hex/charset admission, real-path containment in `.git`, `.git` symlink or `gitdir:` file → `not determined`, *Skill copy* row, *Disclosure* row, two-way containment). `test/security-audit-skill.test.js`: new pin-sync case |
| Tests | Write new/changed assertions first, observe them red on the baseline command, then edit the command |

| Verification | Value |
|---|---|
| Command | `node --test test/akili-security-command.test.js test/security-audit-skill.test.js` · `wc -l .claude/commands/akili-security.md` ≤ 230 · shared `git` grep → 0 hits · `grep -c c1c8a8c1471069fb0e188eeaff69b8e8db6564a8 .claude/commands/akili-security.md` ≥ 1 · `grep -c 'install --force' .claude/commands/akili-security.md` → 0 · `grep -n npx .claude/commands/akili-security.md` → each hit read and quoted: only the `npx skills add` example of a foreign source and the "no `npx` command" prohibition (baseline: `:37`, the example) · **fixture walk**: the Implementer follows the shipped Step 0.3 text by hand on five scratch fixtures — (a) P-13 traversal, (b) `refs/heads/x` a directory symlink to an outside dir holding a 40-hex file, `HEAD` = `ref: refs/heads/x/tok`, (c) `.git` a symlink to an outside repo, (d) `.git` a `gitdir:` file, (e) a benign main checkout — and records `not determined` for (a)–(d) with no outside content shown, and the commit for (e) · `grep -n -E 'ignored directory chosen\|in-target run directory' .claude/commands/akili-security.md` → 0 · clause walk (every clause in *Requirements* above) in `execution.md`, each quoted against the shipped sentence |
| Red run | Baseline readings (executed 2026-10-19): pin literal count `0`; `install --force` count `1`; `toolchain` count `0`; `Skill copy` count `0`; `OS-enforced` count `0`; `git` sites `:40`, `:59`; `:56` reads "or in the ignored directory chosen below". The Implementer quotes each new case failing on the **behavioural assertion** (an `assert.match` message), not on a missing helper |
| Falsifier | (1) Change one hex digit of the Step 0.1 literal → pin-sync red. (2) Re-insert `` `git status --porcelain` `` anywhere in the command (Step 3, not only 0–1) → no-`git` case red. (3) Delete "and toolchain" → bullets case red. (4) Delete "low" → bullets case red. (5) Delete "OS-enforced" → lead-clause case red. (6) Re-add "or ignored path" to the run-dir rule → outside-target case red. (7) Replace "the symlink itself" with "its target" → link case red. (8) Delete the charset/`..` admission sentence → admission case red. (9) Re-add `akili install --force` to the offer → no-`--force` case red. (10) Replace "entry or its resolved path" with "resolved path" → inside-target case red (and drop the destination from the containment sentence → destination case red). (11) Delete the sentence that ends the command after restore → fresh-session case red. (12) Drop "every component resolved" → real-path case red. Each executed post-change, red quoted, reverted |
| Disqualifier | A pin-sync test that compares a site with itself, or derives the expected value from the command, is a tautology — expected is `UPSTREAM_SHA`, compared with the command literal **and** `SKILL.md` `source`, after CRLF normalisation. A bullets test matching only a prefix of each bullet is not verbatim. A no-`git` test scoped to Steps 0–1 does not test "the whole command". The hex/charset and real-path rules are text: their run-time effect has no automated check (requirements §8) — the fixture walk is the substitute, and a walk by the author of the text is not independent: the Reviewer re-walks fixture (b) itself. Node 22 green alone is not CI-matrix evidence |
| Consumers | `test/akili-security-command.test.js:73,77,78,145,146,203,204,205,207,208,209` (P-6, P-15); `:211` (Error Handling row) belongs to T2 — T1 records it as an expected red if T1's edit trips it |
| Done | Clause walk PASS; both test files green; falsifiers 1–12 executed and quoted; fixture walk (a)–(e) recorded; line count quoted |

---

### T2 — Command Steps 2–5, Error Handling, Verification Checklist + their tests

| Field | Value |
|---|---|
| Status | `[x]` |
| Depends on | T1 |
| Requirements | FR-2 (Error Handling row), FR-3 (index half: `foreign — continued by <approver>`, `BUT … NOT contain the resolved path`, `pinned`), FR-5 (scenario incl. `BUT under static-only …`), FR-6 (`AND IT MUST record … not determined … never as clean`; hostile-content `BUT` for `run-metadata.json` and the index), FR-7 (`AND IT MUST remove the repo-relative form`; Error Handling row incl. containing the target), FR-8 (scenario: two-run example, `AND IT MUST … charset … only`, `BUT … target content`), NFR-1 |
| Design refs | §5.2, §5.3, §7 rows 2 addendum, 2 metadata, 4, 5, Error Handling, Checklist; DD-3, DD-5, DD-6, DD-7; P-6, P-9, P-15 |
| Scope | `.claude/commands/akili-security.md`: Step 2 metadata sentence (`:73`) and addendum (`:77`); Step 4 header (`:106`) and location table (`:113-119`); Step 5 slug sites `:129`, `:132` and construction rule `:135`; Error Handling `:147`, `:150`; Checklist `:158`, `:160`, `:162`, `:164`, `:166` + new "no `git` before Run" item. Tests: `:211`, `:272` (title "three" → "two"), `:275`, `:308-315`, plus new cases (mechanism slot, index *Skill copy* without path, `not determined` recorded, `-r<N>` at both sites, two location forms) |
| Tests | New/changed assertions first, red on the post-T1 command, then edit |

| Verification | Value |
|---|---|
| Command | `node --test test/akili-security-command.test.js` · `wc -l` ≤ 230 · `grep -n -- '-s<n>' .claude/commands/akili-security.md` → exactly the lines `:129` and `:132` (or their post-T1 line numbers), each reading `-r<N>-s<n>`; a `-s<n>` hit without `-r<N>` fails · `grep -n -E 'Repo-relative\|ignored directory inside' .claude/commands/akili-security.md` → 0 · shared `git` grep → 0 hits · clause walk (every clause in *Requirements* above) |
| Red run | Baseline (executed 2026-10-19): `grep -n -- '-s<n>'` → `:129`, `:132`, both without `-r<N>`; `Repo-relative` row at `:118`. New cases quoted failing on the assertion |
| Falsifier | (1) Restore `-s<n>` without `-r<N>` at `:132` only → slug case red. (2) Re-add the `Repo-relative` row → two-forms case red. (3) Remove the mechanism slot from the addendum → mechanism case red. (4) Put `<resolved path>` into the index *Skill copy* text → forbidden-path case red. (5) Replace "`not determined`" with "clean" in the metadata sentence → `not determined` case red. Each executed, red quoted, reverted |
| Disqualifier | A slug check counting `-r<N>` anywhere passes with one fixed site and one stale — the check enumerates both sites. "Never as clean" and "no path" are text presences, not run-time behaviour — record that the agent's adherence has no automated check |
| Consumers | `test/akili-security-command.test.js:211,272,275,308,310,311,315`; `:238` (index filename, unchanged — must stay green) |
| Done | Clause walk PASS; test file green; falsifiers 1–5 executed and quoted |

---

### T3 — Skill docs, `SKILL.md` AKILI row, upstream request draft

| Field | Value |
|---|---|
| Status | `[ ]` |
| Depends on | T2 |
| Requirements | FR-1 (re-sync pin-update step names "the command's Step 0.1 pin"), FR-8 (restatements `SKILL.md:207`, `docs/skills/security-audit.md:28`), FR-9 (scenario incl. `AND IT MUST lift … candidate branch`, `BUT no AKILI wrapper …`, `AND IT MUST NOT be filed upstream by the agent`), FR-10 (these files; R-B note), NFR-2 |
| Design refs | §4, §9 re-sync row, DD-8; P-7, P-8, P-10, P-14, P-16 |
| Scope | `.claude/skills/security-audit/SKILL.md:207` only; `docs/skills/security-audit.md` `:28`, *Platform support* (`:57`, one sentence naming the lift gate), *Re-sync procedure* step 4 (`:74`) + new Windows-gate step, one sentence that the provenance check is necessary but not sufficient (R-B); new `docs/specs/changes/akili-security-followup/upstream-request.md` (problem quoted raw from `validate-coverage-ledger.cjs:721-726` and `validate-findings.cjs:604-608`; CI run 39160826587; the request: a Windows-capable read path that keeps the no-follow/non-blocking guarantee, or a documented position that Windows is unsupported) |

| Verification | Value |
|---|---|
| Command | `node --test test/security-audit-skill.test.js` · NFR-2 gate: `git diff --quiet 5c944d0 -- .claude/skills/security-audit ':!*SKILL.md'` → exit 0, and `git diff -U0 5c944d0 -- .claude/skills/security-audit/SKILL.md` → every hunk header starts at or below line 202 (`## AKILI-SPECS Integration`) · `grep -n -- '-s<n>' .claude/skills/security-audit/SKILL.md docs/skills/security-audit.md` → every hit reads `-r<N>-s<n>` · `grep -n "Step 0.1 pin" docs/skills/security-audit.md` → 1 · every quotation in `upstream-request.md` raw-verified against the file at HEAD (KZ-changes--cursor-install-target-1) |
| Red run | Baseline (executed 2026-10-19): `grep -c "Step 0.1 pin" docs/skills/security-audit.md` → 0; `-r<N>-s<n>` count 0 in both files; NFR-2 gate exit 0 |
| Falsifier | Edit one byte of `SKILL.md` above line 202 → the hunk-position check fails (quote the hunk header); edit one byte of `HUNTING.md` → NFR-2 gate exits 1. Both reverted |
| Disqualifier | A quotation in the draft taken from this spec's documents rather than the vendored file is not raw-verified. The draft is not a filed issue — no `gh` or web action is evidence here |
| Consumers | `test/security-audit-skill.test.js:80` (`source` match); the file-set list is unaffected (`upstream-request.md` is outside `.claude/`) |
| Done | Gates green and quoted; draft present; no file outside scope touched |

---

### T4 — User-facing restatements

| Field | Value |
|---|---|
| Status | `[ ]` |
| Depends on | T2 |
| Requirements | FR-4 (docs control list), FR-7 (in-target mentions removed), FR-8 (slug restatements), FR-10 (scenario: these files) |
| Design refs | §9; P-6 |
| Scope | 10 sites in four files: `docs/commands/akili-security.md:23` (preflight row: pin, no `git`, restore), `:28`, `:39`, `:48`, `:60`; `docs/flow.md:154`, `:292`; `README.md:589`, `:800`; `docs/commands/README.md:20` |

| Verification | Value |
|---|---|
| Command | Phrase-family sweep keyed on the obligation: `grep -rn -E "s<n>\|ignored in-target\|ignored directory inside\|inside the target\|check-ignore\|Repo-relative\|repo-relative\|by default\|four controls\|four upstream controls\|install --force\|dirty state\|source ref" README.md docs/flow.md docs/commands/akili-security.md docs/commands/README.md` → every hit read and either updated or recorded as intentionally kept, with the quoted reason (e.g. README `--force` install docs unrelated to this command) |
| Red run | Baseline sites (executed 2026-10-19): the P-6 hits in these files (`README.md:800`, `docs/flow.md:154,292`, `docs/commands/akili-security.md:28,39,48,60`), the "outside the target by default" hits (`README.md:589`, `docs/commands/README.md:20`), and `docs/commands/akili-security.md:23` (preflight row: "a pinned `source`", "resolves the target, source ref, dirty state") — 10 sites |
| Falsifier | Leave `docs/flow.md:292` unchanged → the sweep shows `-s<n>` without `-r<N>` and "an ignored in-target directory" (quote the hit), then fix |
| Disqualifier | A sweep that greps only the old literal misses paraphrases ("an ignored in-target directory", "outside the target by default") — the pattern above is the minimum. A hit judged "compatible" is quoted with its reason (KZ-changes--kaizen-loop-closure-2: the failure moved to judging hits) |
| Consumers | none expected — the Implementer runs `grep -rln -E "docs/flow.md\|README.md\|docs/commands" test/*.js` and quotes the result |
| Done | Sweep table in `execution.md`; every site updated or kept with reason |

---

### T5 — CHANGELOG, full verification, final sweep

| Field | Value |
|---|---|
| Status | `[ ]` |
| Depends on | T3, T4 |
| Requirements | FR-10 (`CHANGELOG.md` `[Unreleased]` describes only what ships), NFR-2, NFR-3, NFR-4 |
| Design refs | §4, §11 |
| Scope | `CHANGELOG.md` `[Unreleased]` (replace "No unreleased changes yet."); no released entry edited (P-7) |

| Verification | Value |
|---|---|
| Command | `npm test` · `npm run verify:cli` · `npm run pack:dry-run` (`npm pack --dry-run 2>&1 \| grep -c docs/specs` → 0) · `git diff --check` · `git diff --stat 5c944d0 -- bin package.json docs/model-routing.md .claude/templates` → empty (NFR-3) · T3's NFR-2 gate re-run · shared `git` grep · repo-wide phrase-family sweep (T4's pattern over `README.md docs .claude test`, excluding `docs/specs/`) → all hits accounted for · each CHANGELOG clause quote-checked against HEAD, including the sentences around it (KZ-002) |
| Red run | Baseline: `[Unreleased]` reads "No unreleased changes yet." |
| Falsifier | Write one clause claiming "no `git` runs during an audit" (false — FR-6 covers before Run and Steps 4–5; R-A) → quote-check fails it; replace with the scoped claim |
| Disqualifier | `npm test` green with a stale CHANGELOG proves nothing about the CHANGELOG. A sweep run before T3/T4 committed is not the final sweep |
| Consumers | The Implementer runs `grep -rn "CHANGELOG" test/*.js` and quotes the result (the archived FR-9 case asserts `[Unreleased]` survives the release script) |
| Done | All commands green and quoted; CHANGELOG clauses each mapped to a shipped sentence |

## 3. Coverage (scenario and clause granularity)

| Clause | Owner |
|---|---|
| FR-1 stale copy: foreign-copy treatment, `BUT … a commit`, `AND IT MUST … 40-character literal` | T1 |
| FR-1 pin sites agree: the test | T1 |
| FR-1 re-sync step names "the command's Step 0.1 pin" | T3 |
| FR-2 restore offered: path/link/destination/install, `BUT … --force, npx`, `AND IT MUST NOT move … without restore` | T1 (Step 0.1); T2 (Error Handling row) |
| FR-2 after restore: command ends, `BUT … NOT run the audit in the session that loaded the foreign copy` | T1 |
| FR-2 copy inside the target (entry or resolved path): two options, `BUT … NOT move anything inside the target` | T1 |
| FR-3 *Skill copy* plan field; `pinned` in the plan | T1 |
| FR-3 index field, `BUT … NOT contain the resolved path`, `pinned` in the index | T2 |
| FR-4 scenario, both `AND IT MUST` clauses (`:41` lead + bullets; `:48` exposure), `BUT … paraphrase` | T1 (command); T4 (docs list) |
| FR-5 scenario, `BUT under static-only …` | T2 |
| FR-6 hostile config: program never runs, *Target* field, dirty asked, `BUT … any other git command` | T1 |
| FR-6 hostile config: `AND IT MUST record not determined … never as clean` | T2 |
| FR-6 hostile content (traversal, symlinked file or directory, `.git` symlink or `gitdir:` file, oversize): `not determined`, `AND IT MUST admit … hex … charset` | T1 |
| FR-6 hostile content: `BUT no content … reaches the plan` | T1 (plan); T2 (`run-metadata.json`, index) |
| FR-7 inside target: refusal, `BUT … ignore rule` | T1 |
| FR-7 `AND IT MUST remove the repo-relative form` | T2 (command); T4 (docs) |
| FR-7 contains target / HOME inside target: refusal | T1 (rule); T2 (Error Handling row) |
| FR-8 two-run example, `AND IT MUST … charset … only`, `BUT … target content` | T2 |
| FR-8 restatements | T3 (`SKILL.md`, skill doc); T4 (user docs) |
| FR-9 stop unchanged, `AND IT MUST lift … candidate branch`, `BUT no AKILI wrapper …`, `AND IT MUST NOT be filed upstream by the agent` | T3 |
| FR-10 restatements; R-B note | T3, T4 |
| FR-10 tests pin the new sentences | T1, T2 |
| FR-10 CHANGELOG | T5 |
| NFR-1 | T1, T2 |
| NFR-2 | T3, T5 |
| NFR-3, NFR-4 | T5 |
