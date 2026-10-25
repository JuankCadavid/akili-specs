# Tasks: `/akili-review` — spec-aware pull-request review, local and CI

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-review` |
| Depth | Standard |
| Type | Change |
| Deliverable | `software` |
| Approval Mode | `gated` for `/akili-execute` (proposal). This specify run stops at its Phase 3 gate, as the user asked ("Stop at the specify approval gate", 2026-10-25) |
| Status | **Approved** 2026-10-25 (Phase 3 gate, user: "Approved: tasks as written, 3-PR split into dev as you recommend (T1–T3, T4–T8, T9–T11), and the T12 pilot deferred until Juan Carlos provides a test repo and API keys") |
| PR strategy | Three PRs into `dev`, in order: **PR 1** T1–T3 (schema, validator, `post-review.cjs`); **PR 2** T4–T8 (references, `SKILL.md`, command + counts, contract tests, CI templates); **PR 3** T9a–T11 (docs, carve-outs, CHANGELOG, sweep). Each PR description follows `cognitive-doc-design` review-empathy rules (what to review first, what is out of scope, links to the previous and next PR). Opening the PRs is the user's step. **Amended 2026-10-25 (user, PR-1 boundary):** PR 1 also carries **T3b**, which moves the consumer edits forward so `npm test` is green at the PR 1 head (a provisional `pr-review/SKILL.md` plus the count, docs-row and pin edits; T5, T6 and T9a–T9c later adjust these, they do not re-add them). **Amended 2026-10-25 (user, PR-2 boundary; PR 1 merged into `dev` as `dda3d5d`):** PR 2 and PR 3 merge into **one PR** — T4–T11 on `feat/akili-review-pr2`, rebased onto `origin/dev` — so the PR's head carries the T9b/T9c docs rows and `npm test` is green there; no T8b |
| T12 pilot | **Deferred** until Juan Carlos provides a scratch GitHub repository and API keys. Until then, P-12, P-13, P-20 to P-22 runtime confirmation and the "CI template wiring" / "Host behavior" defect classes stay recorded as open (requirements §7). The spec is not archived as complete while T12 is open, unless the user explicitly accepts it as deferred |
| Date | 2026-10-25 |
| Budget (design §11, amended here) | **15 tasks** with T3b (amended 2026-10-25; the tripwire stays **> 15 tasks**); originally **14 tasks · ~4,750 LOC authored · 22 review rounds**. `/akili-execute` stops and escalates past **15 tasks, ~6,200 LOC, or 27 rounds** (round tripwire raised from 25 by the user, 2026-10-25, at the HALT before T11) (line tripwire raised from ~5,700 by the user, 2026-10-25, PR-2 boundary: ~5,540 spent at T8, ~410 left). Amended from 13 tasks and 21 rounds: the docs work is split three ways because its sites span a rules document (`AGENTS.md`) and more than ~8 sites (`/akili-specify` Step 3.2) |
| Commit prefix | `[SPEC:changes/akili-review]`. Local commits only: **no push, no PR, no release, no publish** |
| Verified at | `67652ec`. The baseline readings quoted below were executed on 2026-10-25 |
| Execute prerequisite | This repo has no deployed `.agents/` (`ls .agents` → `No such file or directory`, as run). `/akili-execute` Step 0 deploys or checks the personas (`akili doctor --agents`) before the first spawn, and treats `outdated`/`unmarked`/`missing` as a stop (KZ-changes--persona-upgrade-1) |
| Node runtimes | `~/.nvm/versions/node/` holds `v18.20.8`, `v22.12.0`, `v22.23.3` (as run). T11 runs `npm test` on 18 and 22 |
| Local tools | `actionlint` at `/opt/homebrew/bin/actionlint` (as run). It is used by T8 as an executed check, never by a shipped test (CI legs do not have it) |
| Clean room | No task opens files from `anthropics/claude-code` or any local copy of its `code-review` plugin (design DD-11) |

## 2. Task Graph

```text
T1 (schema + validator)
 ├─→ T2 (post-review: prepare + render/neutralize/redact)
 │     └─→ T3 (post-review: check-skip + post + reconcile)   ─┐
 │           └─→ T3b (PR-1 consumer alignment: provisional SKILL.md, counts, docs rows; amended 2026-10-25)
 └─→ T4 (references + NOTICE)                                 │
       └─→ T5 (SKILL.md)                                      │
             └─→ T6 (command + install counts/fixture) ←──────┘
                   ├─→ T7 (command/skill text-contract test)
                   ├─→ T8 (CI templates + docs/ci/README + CI test)
                   ├─→ T9a (docs pages + governance + judgment-day row + skills README)
                   ├─→ T9b (README, docs/README, docs/overview, docs/commands/README)
                   ├─→ T9c (docs/flow.md, docs/cli.md, AGENTS.md + 2 test pins)
                   └─→ T10 (carve-outs ×6)
T1–T10 ─→ T11 (CHANGELOG + full verification sweep, Node 18 + 22)
T11 ─→ T12 (pilot + dogfood: HITL)
```

There are no cycles. T6 waits for T3 because the command names the script subcommands. T7 waits for T6 and pins the command text; T8 pins the YAML. T9a–T9c and T11 quote shipped text, never design text (KZ-002).

**`skip-eligible` tasks: none.** T10 is mechanical, but it edits four rules documents. T6's count edit changes pinned test evidence.

**Skills.**

| Tasks | Skills |
|---|---|
| T1, T2, T3 | `tdd` (red first; expected values from requirements scenarios), `error-handling-patterns` (CLI exit paths) |
| T4, T5, T6 | `cognitive-doc-design` |
| T7, T8 | `tdd` (one literal per clause plus a mutation) |
| T9a–T9c, T11 | `cognitive-doc-design` |
| T12 | `pr-review` (the shipped skill, through the command) |

`caveman` is for transient worker messages only. No UI skill applies.

## 3. Clause Ownership

Every scenario clause and table rule has a task that writes it. Command and skill text also has a task that pins it (T7, or T8 for YAML). Runtime behavior has a task that observes it (T12).

| Clause | Writes | Pins / checks | Observes |
|---|---|---|---|
| FR-1 file set, original-authorship frontmatter, `inspired-by` pins, `NOTICE`, `Adapted from` / `AKILI-authored` lines, Integration section, standalone line | T4, T5 | T7 | — |
| FR-1 *No proprietary content* THEN + BUT notice kept | T4, T5 | T7 (NOTICE names both permissive sources; `inspired-by` marks `code-review` "pattern, not adapted") | — |
| FR-1 *Installs on every target* THEN + AND IT MUST byte-identical | T6 | T6 (counts/fixture), T7 (install diff) | T11 (`install --tool all --dry-run`, `--tool grokbot`) |
| FR-2 invocation, target table, read-only boundary | T6 | T7 | T12 |
| FR-2 *PR number without `gh`* THEN + BUT no other fetch | T6 | T7 | T12 |
| FR-2 *Author's own session* THEN + AND IT MUST still run | T6 | T7 | — |
| FR-3 skip table (5 rows) incl. identity-checked marker via `check-skip` | T3 (script), T6 (text) | T3 tests, T7 | T12 |
| FR-3 *Re-run on the same head* THEN + BUT no post | T3 | T3 tests | T12 |
| FR-4 filter, tier table, sensitive paths, `prepare` determinism, base-SHA config | T2, T4 | T2 tests, T7 | — |
| FR-4 *Lockfile-only PR* THEN | T2 | T2 tests | — |
| FR-4 *Small but sensitive* THEN + BUT no full audit | T2, T6 | T2 tests, T7 | — |
| FR-5 single-lens spawn, persona resolution table, addendum, report contract, host fallback | T4, T6 | T7 (incl. persona drift guard) | T12 |
| FR-5 *Persona drift* THEN + BUT no copy of persona text | T5, T6 | T7 (drift guard + no-copy check) | — |
| FR-6 four mapping sources, FR walk, unspecified change, `@akili-spec`, quick gate, no-spec note | T4 | T7 | T12 (dogfood) |
| FR-6 *Out-of-scope change* THEN + AND IT MUST cite | T4 | T7 | T12 |
| FR-6 *Claimed obligation missing* THEN + BUT not suggestion | T4 | T7 | — |
| FR-7 fields, script-computed fingerprint, drop list, trusted threshold, tier verification, validation gate | T1, T3, T4, T6 | T1/T3 tests, T7 | — |
| FR-7 *Malformed findings* THEN + AND IT MUST block posting | T1, T3 | T1, T3 tests | — |
| FR-7 *Single-judge critical* THEN + BUT not counted | T1 (suspect rule), T3 (exit) | T1, T3 tests | — |
| FR-8 run dir + two-way rule, `REVIEW.md` order, history allowlist + README, carve-out ×6 | T2 (render), T6, T10 | T2 tests, T7, T10 grep | T12 |
| FR-8 *History off by default* THEN + BUT run dir written | T6 | T7 | T12 |
| FR-8 *`--out` inside the target* THEN | T6 | T7 | — |
| FR-9 bullets: upsert + identity allowlist + local "CI owns it", ≤ 10 inline + ordering, hunk pre-check + retry, size cap, summary-only, permalinks, marker + tags, neutralization, single `COMMENT` review; local confirmation gate | T2, T3, T6 | T2, T3 tests, T7 (cap restatement) | T12 |
| FR-9 *Cap* THEN + AND IT MUST hold | T3 | T3 tests | T12 |
| FR-9 *Forged marker and mentions* THEN + BUT not dropped | T2 | T2 tests | — |
| FR-9 *Invalid input* THEN | T3 | T3 tests | — |
| FR-10 reconcile table (10 rows incl. CI-bot vs human, tag rebuild) | T3 | T3 tests (one fixture per row) | T12 (second push) |
| FR-10 *Human resolved* THEN + BUT listed open | T3 | T3 tests | T12 |
| FR-11 exit table, validation-failure rule, break-glass label | T3 | T3 tests | T12 |
| FR-11 *Advisory default* THEN + AND IT MUST post | T3 | T3 tests | T12 |
| FR-12 items 1–8, data addendum (canonical in the command) | T6 (addendum), T8 | T7 (addendum restatements), T8 (YAML contract) | T12 |
| FR-12 *PR edits the review prompt* THEN + BUT no head instructions / no auto-load | T8 | T8 | T12 (planted edits) |
| FR-12 *Agent tries to post* THEN + AND IT MUST post via `post` | T8 | T8 | T12 |
| FR-13 routing slug, no spec created, local only, no warning/suggestion | T6 | T7 | — |
| FR-13 *CI never routes* THEN | T6 | T7 | — |
| FR-14 docs pages, `docs/ci/README.md`, lists/counts/figure-debt, governance, judgment-day row, carve-outs, AGENTS, CHANGELOG, no active-spec path | T8, T9a, T9b, T9c, T10, T11 | T9b/T9c (docs tests), T11 sweep | — |
| NFR-1 | — | T11 (`git diff --stat bin/ package.json` empty) | — |
| NFR-2 | T1, T2, T3 | T11 (Node 18 + 22; `grep -c O_NOFOLLOW` → 0) | — |
| NFR-3 | T3 | T3 tests (fake `gh` only) | — |
| NFR-4 | T5, T6 | T7 (line caps) | — |
| NFR-5 | — | T11 | — |
| NFR-6 | T8 | T8 | — |

---

### T1 — Review schema + `validate-review.cjs`

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M (~110 schema + ~200 validator + ~260 tests and fixtures) |
| Depends on | none |
| Requirements | FR-7 (fields, suspect rule, threshold, *Malformed findings*, *Single-judge critical*), FR-1 (file set, partly), NFR-2 |
| Design refs | §5.1, §5.2, §6 (validate row); P-5; DD-3 |
| Review | `full`: logic plus the schema contract both runtimes consume |

**Scope.**

1. **First step: settle P-5.** Read Anthropic's structured-outputs docs and OpenAI's structured-outputs / Codex `--output-schema` docs, and record the URLs and the supported-keyword lists in `execution.md`. If OpenAI strict mode rejects the §5.1 subset, that is a Pivot (two schema files), not a quiet edit.
2. Write `.claude/skills/pr-review/review-schema.json` in the strict subset (§5.1): every property required, `additionalProperties: false`, nullable optionals, and only `type`/`enum`/`properties`/`required`/`items`/`additionalProperties`.
3. Write `validate-review.cjs` (CLI `validate <doc> [--manifest] [--threshold]`, exits 0/1/2) with every §5.2 rule: the bounds, the suspect ⇒ not-critical rule, line order, unique ids, the `file` charset with no `..` and no leading `/`, the file being in the manifest, the tier matching the manifest, and confidence ≥ threshold.
4. It must not use `O_NOFOLLOW` and must not depend on anything outside Node core.
5. Write the validator part of `test/pr-review-scripts.test.js`, with fixtures under `test/fixtures/pr-review/`.

**Verification.**

| Field | Value |
|---|---|
| Command | `node --test test/pr-review-scripts.test.js`; `node -e 'JSON.parse(require("fs").readFileSync(".claude/skills/pr-review/review-schema.json","utf8"))'`; `grep -cE '"(minimum\|maximum\|minLength\|maxLength\|minItems\|pattern)"' .claude/skills/pr-review/review-schema.json` → `0`; `grep -c O_NOFOLLOW .claude/skills/pr-review/validate-review.cjs` → `0` |
| Red run | `predicted — greenfield artifact (observed in T1)`. The test for *Malformed findings* (missing `evidence`, `confidence: 120`) must be observed failing on its exit-code assertion before the validator exists, and the red quoted verbatim in `execution.md` |
| Falsifier | (a) Remove the `confidence` upper-bound check → the `confidence: 120` fixture must go red. (b) Remove the suspect ⇒ not-critical check → the `{severity: critical, suspect: true}` fixture must go red. (c) Allow `..` in `file` → the `../../etc/passwd` fixture must go red. Each is executed after the change, its red quoted, then reverted |
| Disqualifier | A test that only checks that `validate` exits non-zero, without asserting the named index and field, proves nothing about the error contract. Fixtures written to pass the current code (each field tested once at its legal value) are inert |
| Consumers | none (new files) |

**Done.** P-5 settled with URLs. The schema parses, with 0 forbidden keywords. Every §5.2 rule has a fixture. Falsifiers (a)–(c) were observed red and reverted. The suite is green.

---

### T2 — `post-review.cjs`: `prepare`, `render`, neutralization, redaction

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | L (~340 script + ~300 tests and fixtures) |
| Depends on | T1 |
| Requirements | FR-4 (filter, tier, sensitive paths, *Lockfile-only PR*, *Small but sensitive*), FR-8 (`REVIEW.md` order, history allowlist), FR-9 (neutralization, size caps, permalinks, *Forged marker and mentions*), NFR-2, NFR-3 |
| Design refs | §5.3, §5.6, §6 (prepare, render rows), §7.5, DD-15; `references/large-prs.md` defaults (T4 writes the doc; T2 writes the code and is the source the doc quotes) |
| Review | `full`: injection-facing rendering code |

**Scope.**

- **`prepare`.**
  - Parse a unified diff and apply the noise filter: lockfiles, vendored, minified, source maps and generated files are dropped; migrations are kept.
  - Read the flat-key `.akili/review.yml` without a YAML library. An unknown key is an error and exits 2.
  - Compute the tier (FR-4 table) and match the sensitive globs.
  - Chunk under the per-chunk budget.
  - Write `files/*.patch`, `context.md` and `manifest.json` (§5.3).
- **`render` and `--history`.**
  - Render in the §7.5 order.
  - Neutralize every rendered string, agent- or manifest-sourced: `<`, `>`, `@`, `#n`, non-repo links and images, and long backtick runs. Each field is truncated to its validator maximum.
  - Show a path that fails the charset as an escaped code span.
  - Apply secret-shape redaction.
  - Use full-SHA permalinks.
  - Cap the summary at 60,000 characters and each inline body at 4,000.
- **Tests.** Write the prepare and render parts of `test/pr-review-scripts.test.js`.

**Verification.**

| Field | Value |
|---|---|
| Command | `node --test test/pr-review-scripts.test.js` |
| Red run | `predicted — greenfield artifact (observed in T2)`. The *Forged marker and mentions* test must be observed failing on its "no live `<!--` in the output" assertion against a stub `render` that echoes input, and the red quoted in `execution.md` |
| Falsifier | (a) Drop the `<`/`>` escape → the forged-marker fixture's output contains `<!-- akili-review:v1` and goes red. (b) Remove `package-lock.json` from the noise list → the lockfile-only fixture's manifest is non-empty and the skip assertion goes red. (c) Remove the sensitive glob `**/auth/**` → a 6-line `src/auth/login.js` fixture (no session- or token-like name) tiers as `trivial` and goes red; remove the session file-name glob → a 6-line `src/session.js` fixture tiers as `trivial` and goes red (amended 2026-10-25 at execute: the original wording paired `**/auth/**` with `session.js`, which only stays red if FR-4's "sessions and tokens" class is left uncovered). (d) Remove the `ghp_` redaction pattern → a fixture evidence holding `ghp_` followed by 36 alphanumerics renders verbatim and goes red. Each is executed after the change, quoted, then reverted |
| Disqualifier | A neutralization test that checks only `@` and not the marker form, or a render test that compares against output the script itself produced (a snapshot regenerated from the code), cannot fail on the defect |
| Consumers | none (new files) |

**Done.** Falsifiers (a)–(d) were observed red and reverted. The §7.5 order is asserted on one full fixture. Both caps are asserted at limit and limit + 1.

---

### T3 — `post-review.cjs`: `check-skip`, `post`, reconcile, exit

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | L (~360 script + ~400 tests, fixtures and `fake-gh.js`) |
| Depends on | T2 |
| Requirements | FR-3 (skip table, *Re-run on the same head*), FR-7 (block on invalid; fingerprint), FR-9 (upsert, identity allowlist, local "CI owns it", cap + ordering, hunk pre-check + retry, single `COMMENT` review, marker + tags, *Cap*, *Invalid input*), FR-10 (all 10 rows, *Human resolved*), FR-11 (exit table, break glass, *Advisory default*), NFR-3 |
| Design refs | §5.2 (fingerprint), §5.4, §5.5, §6 (check-skip, post rows), DD-3, DD-7, DD-8, DD-16; P-14, P-15 |
| Review | `full`: posting logic and the trust rules |

**Scope.**

1. **First step: settle P-14 and P-15** from GitHub's REST docs (create a review; issue comments; review comments) and GraphQL docs (`reviewThreads`, `resolveReviewThread`, `resolvedBy`). Record the URLs, the request shape, the 422 behavior and the author/resolver fields in `execution.md`. A refutation goes to the Pivot Protocol.
2. **GitHub CLI resolution.** `AKILI_GH_BIN` is a path, run via `process.execPath` for `.js`/`.cjs`; otherwise `gh`. Every call is `gh api` with `--input -`.
3. **`check-skip`.** Implement the FR-3 table with the identity allowlist (login compared without `[bot]`); write `prior.json` and, on a skip, `skipped.json`.
4. **`post`**, in the §6 order:
   - check the target binding;
   - load the base-SHA config through the contents API;
   - validate;
   - fingerprint;
   - map hunks;
   - reconcile (§5.5);
   - post one `COMMENT` review, hard-coded, with ≤ 10 inline comments, retrying with none on rejection;
   - upsert the summary with the marker;
   - resolve fixed threads;
   - exit per FR-11, including `akili-review:advisory` and `skipped.json`.
5. **Tests.** Write `test/fixtures/pr-review/fake-gh.js`, which records calls and serves canned responses, and the check-skip/post parts of the test file: one fixture per FR-10 row.

**Verification.**

| Field | Value |
|---|---|
| Command | `node --test test/pr-review-scripts.test.js` |
| Red run | `predicted — greenfield artifact (observed in T3)`. The *Cap* test (14 findings → exactly 10 inline) must be observed failing on its count assertion against a stub that posts all findings, and the red quoted |
| Falsifier | (a) Change the cap to 11 → *Cap* goes red. (b) Make the event come from input → a fixture with `"event":"APPROVE"` injected into the document makes the fake `gh` record `APPROVE`, and the hard-coded-event assertion goes red. (c) Trust a marker from any author → the forged-marker comment by `mallory` makes `check-skip` print `skip=true`, and the test goes red. (d) Treat a bot-resolved thread as human-resolved → that FR-10 row's re-post assertion goes red. (e) Exit 1 under `--fail-on none` on a validation failure → the advisory test goes red. (f) Take `head_sha` from the document → the mismatching-artifact fixture posts, and the binding assertion goes red. Each is executed after the change, quoted, then reverted |
| Disqualifier | Tests that assert only the fake `gh`'s call count, not the request bodies (event, comment lines, marker JSON), pass on wrong payloads. A green run with a real `gh` on `PATH` and `AKILI_GH_BIN` unset is not evidence: the tests must set `AKILI_GH_BIN` and assert that the fake recorded every call |
| Consumers | none (new files) |

**Done.** P-14 and P-15 settled with URLs. All 10 FR-10 rows have a fixture. Falsifiers (a)–(f) were observed red and reverted. No test reaches the network.

---

### T3b — PR-1 consumer alignment (amendment, 2026-10-25)

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S (~60: provisional `SKILL.md` ~20, counts/fixture ~15, docs rows ~6, `docs/cli.md` ×4, test pins ~6) |
| Depends on | T3 |
| Requirements | FR-1 *Installs on every target* (partly: the skill directory installs and doctor is healthy), FR-14 (lists and counts, the skill's share only) |
| Design refs | §9.1 rows `test/install-cursor.test.js`, `doctor-codex-baseline.txt`, `docs/skills/README.md:38`, `docs/overview.md`, `docs/cli.md`, `test/akili-marketing-docs.test.js:114-115`, `test/diagram-design.test.js:417`; `docs/skills/governance.md` *Frontmatter Schema* and *Original-authorship variant* |
| Review | `full`: changes pinned test evidence and adds an installed skill file |
| Origin | User decision at the PR-1 boundary, 2026-10-25: "move the T6 skill-count edits … into PR 1 so the full npm test is green", then "Provisional SKILL.md (Recommended)" |

**Scope.**

- **Provisional `SKILL.md`.** Write `.claude/skills/pr-review/SKILL.md` with the governance frontmatter (`name: pr-review`, `description`, `license: MIT`, `metadata.author: "Juan Carlos Cadavid — jcadavid.com"`, `metadata.binding: core`, `metadata.version`) and a short body. The body says that only the review scripts and schema ship so far, that `/akili-review` and the method arrive with T4–T6, and the standalone line: the scripts review only, never edit, approve or block, and posting happens only via `post-review.cjs`. T5 replaces the body and completes the frontmatter (`inspired-by`, version `1.0.0`).
- **Counts and fixture.** Update the `test/install-cursor.test.js` skill-file and skill-directory literals and comments (`:228`, `:239`, `:246-247`, `:341`, `:388`) and any `test/install-grokbot.test.js` literal, recomputed from the tree at this task's HEAD. Regenerate `test/fixtures/doctor-codex-baseline.txt` the way the cursor-install-target spec recorded. The command count stays 13 (the command lands in T6).
- **Docs rows for the skill.** Add `pr-review` to `docs/overview.md` `## Skills by purpose` (binding `core`) and to `docs/skills/README.md` `## Skill Inventory`, matching neighbouring rows. In `docs/cli.md`, change "28 packaged skills" → "29 packaged skills" at its 4 sites (`:327`, `:339`, `:360`, `:377`) and any other 28-skill total. Update `test/akili-marketing-docs.test.js:111-115` (skill total 29; add `28 packaged` to any stale-total check) and `test/diagram-design.test.js:417` (`/29 packaged skills/`).
- **Out of scope:** the command, any 13 → 14 command total, `Six` → `Seven`, `docs/flow.md`, governance core list, judgment-day row, `docs/commands/*`, `README.md`. Those stay with T6/T9a–T9c.

**Verification.**

| Field | Value |
|---|---|
| Command | `npm test` → `# fail 0` on Node 22 and 18.20.8 (the `update-check` load flake excepted only if it passes alone); `node bin/akili.js doctor --tool all` → exit 0 and no `MISSING`; `grep -c "28 packaged" docs/cli.md` → 0; `find .claude/skills -type f \| wc -l` equals the new install-cursor literal |
| Red run | Observed at T3's HEAD (`81aa9a2`, as run 2026-10-25): 13 `not ok`, e.g. `expected 236 packaged skill files under .claude/skills; counted 239 instead`, doctor `MISSING pr-review`, `missing inventory row for skill pr-review`, `docs/cli.md:327: "28 packaged skills" found 28, derived 29 skills` |
| Falsifier | (a) Delete the provisional `SKILL.md` → doctor `MISSING pr-review` and the install tests go red. (b) Revert the install-cursor file-count literal → `expected <n> … counted <m>` goes red. (c) Remove the `docs/skills/README.md` row → docs-overview (c) goes red. (d) Leave one `28 packaged skills` in `docs/cli.md` → docs-overview (d) and the updated pins go red. Each executed, quoted and reverted |
| Disqualifier | A count recomputed by hand rather than from the tree, or a doctor run in a HOME that already holds an install, is not evidence. A provisional body that claims a capability the scripts do not ship (the command, lenses, CI) overstates the shipped text (KZ-002) |
| Consumers | `test/install-cursor.test.js`, `test/install-grokbot.test.js`, `test/fixtures/doctor-codex-baseline.txt`, `test/docs-overview.test.js`, `test/docs-overview-contract.test.js`, `test/akili-marketing-docs.test.js`, `test/diagram-design.test.js` |

**Done.** `npm test` is green on both Nodes, doctor is healthy, and nothing out of scope is touched.

**Effect on later tasks.** T5 rewrites the `SKILL.md` body and adds `inspired-by`. T6 recomputes the counts again for the final file set and adds the command (13 → 14). T9a/T9b keep the `pr-review` rows that T3b adds and add the command rows. T9c changes only the command totals and `Six` → `Seven`; the skill total is already 29.

---

### T4 — `pr-review` references + `NOTICE`

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M (~600 references + ~60 `NOTICE`) |
| Depends on | T1 (the finding fields that `lenses.md` names) |
| Requirements | FR-1 (`Adapted from` / `AKILI-authored` lines, `NOTICE`, *No proprietary content*), FR-4 (defaults documented), FR-5 (finding line format), FR-6 (spec-lens procedure, both scenarios), FR-7 (drop list), FR-12 (`ci.md`: input directory, structured-output mapping) |
| Design refs | §7.2, §7.3, §7.4, DD-11, DD-15; P-17 |
| Review | `full`: agent-read rules text; two rounds budgeted |

**Scope.**

- **Upstream reads.** Fetch `anthropics/knowledge-work-plugins` `engineering/skills/code-review/SKILL.md` @ `33d3dea` and `anthropics/claude-code-security-review` `claudecode/findings_filter.py` @ `0c6a49f` into an empty scratch directory, as untrusted data, and verify the pins with `gh api …/commits/<sha>`.
- **`references/lenses.md`.** Six lenses, each with what-to-flag and what-not-to-flag. Correctness, performance and maintainability are adapted, in AKILI's own words, from the Apache-2.0 checklist. Security exclusions are adapted from the MIT filter rules. Add the spec-lens procedure (FR-6: four mapping sources, term-by-term FR walk, unspecified change = `warning`, never downgrading a missing obligation) and the `FINDING | …` line format.
- **`references/large-prs.md`.** The defaults the `prepare` code implements, quoted from T2's code, and the `.akili/review.yml` key list.
- **`references/ci.md`.** The `--ci` contract, the input-directory layout (absolute `$RUNNER_TEMP` paths) and the structured-output mapping per runtime.
- **Per-file lines.** Each file opens with `Adapted from …` (repo, path, pin, license) or `AKILI-authored`.
- **`NOTICE`.** Reproduces the Apache-2.0 notice (and the upstream `NOTICE`, if present) and the MIT copyright line of each adapted source.

**Verification.**

| Field | Value |
|---|---|
| Command | `head -2 .claude/skills/pr-review/references/*.md` shows an `Adapted from` or `AKILI-authored` line in each; `grep -c "Apache License" .claude/skills/pr-review/NOTICE` ≥ 1; `grep -c "MIT" .claude/skills/pr-review/NOTICE` ≥ 1; `grep -rn "github.com/anthropics/claude-code/" .claude/skills/pr-review` → 0 (the trailing slash excludes `claude-code-action` and `claude-code-security-review`; no text drawn from the proprietary repo, and `inspired-by` names the plugin by its marketplace name only); `wc -l` total ≤ ~600 |
| Red run | `predicted — greenfield artifact (observed in T4)`. Run the `head -2` check before writing the files and quote the `No such file` red |
| Falsifier | Delete the `Adapted from` line of `lenses.md` → the T7 attribution test (`every reference opens with Adapted from/AKILI-authored`) goes red. Executed in T7, which re-runs it against T4's files |
| Disqualifier | An `Adapted from` line that names a pin which `gh api …/commits/<sha>` cannot resolve is not attribution. A `lenses.md` that restates `reviewer.md` checklist text instead of naming its sections fails FR-5's BUT |
| Consumers | none (new files) |

**Done.** Pins verified. Every file has its provenance line. `NOTICE` carries both notices. There is no proprietary-source text. The size is within budget.

---

### T5 — `pr-review/SKILL.md`

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M (~250) |
| Depends on | T4 |
| Requirements | FR-1 (frontmatter: original-authorship variant, `inspired-by` with pins and "pattern, not adapted" for the proprietary plugin; Integration section; standalone line), FR-5 (references `reviewer.md` sections by id), NFR-4 |
| Design refs | §7.2, DD-2, DD-11; `docs/skills/governance.md` *Frontmatter Schema* and *Original-authorship variant* |
| Review | `full`: agent-read rules text |

**Scope.** Write `SKILL.md`:

- **Frontmatter:** `name`, `description`, `license: MIT`, `metadata.author: "Juan Carlos Cadavid — jcadavid.com"`, `binding: core`, `version: "1.0.0"`, and an `inspired-by` list with URLs and pins.
- **The pipeline spine**, which points to each reference.
- **The finding contract summary**, which points to the schema; numbers are not restated.
- **The standalone line:** reviews only; never edits, approves or blocks; posting only via `post-review.cjs`.
- **`## AKILI-SPECS Integration`**, mapping each `/akili-review` step to the reference it loads.
- **The Reviewer persona**, referenced by section id (`lenses`, `review-output`), never by line number (KZ-005).

**Verification.**

| Field | Value |
|---|---|
| Command | `wc -l .claude/skills/pr-review/SKILL.md` ≤ 250; `grep -n "binding: core\|inspired-by\|## AKILI-SPECS Integration" .claude/skills/pr-review/SKILL.md` → 3 hits; `grep -nE "reviewer\.md:[0-9]" .claude/skills/pr-review/SKILL.md` → 0 |
| Red run | `predicted — greenfield artifact (observed in T5)`. Quote the `No such file` result of the `grep` before writing |
| Falsifier | Replace a section-id reference with `reviewer.md:57` → the T7 drift-guard "no line-number pointer" assertion goes red (executed in T7) |
| Disqualifier | A standalone line that says "reviews only" but omits "posting only via `post-review.cjs`" passes a keyword grep and fails FR-1 |
| Consumers | none (new file) |

**Done.** The size is within the cap, the frontmatter is per governance, the Integration table covers every command step, and the persona is referenced by id.

---

### T6 — Command `akili-review.md` + install counts and fixture

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | L (~200 command + ~40 counts/fixture) |
| Depends on | T3, T5 |
| Requirements | FR-2 (all, both scenarios), FR-3 (text), FR-4 (*Small but sensitive* BUT), FR-5 (persona table, addendum, host fallback), FR-7 (drop list, tier verification), FR-8 (run dir, two-way rule, history, both scenarios), FR-9 (local confirmation gate; cap restated once), FR-12 (canonical addendum), FR-13 (all), FR-1 *Installs on every target* |
| Design refs | §7.1, DD-2, DD-3, DD-9, DD-14, DD-16; §9.1 rows `test/install-cursor.test.js`, `doctor-codex-baseline.txt`; P-1, P-6, P-16 |
| Review | `full`: agent-read rules text; two rounds budgeted |

**Scope.**

- **The command file**, in the §7.1 section order, with:
  - frontmatter (`name`, `description`, `license: MIT`, `metadata.author`);
  - the Usage table;
  - Step 0 with the model checkpoint;
  - Steps 0–5;
  - the Error Handling table;
  - a Verification Checklist keyed FR-2..FR-13;
  - Authorship.
- **References by name.** It references `/akili-security` Step 0 item 4 and Step 1's run-directory rule by name. The data addendum is written verbatim (the canonical copy); every other copy is checked against it by T7.
- **Counts and fixture.** Then update `test/install-cursor.test.js` (`:228`, `:246-247`, `:250`, `:341`, `:388`: the 13/236/249/28 literals, recomputed from the shipped tree) and regenerate `test/fixtures/doctor-codex-baseline.txt` the way the cursor-install-target spec recorded.

**Verification.**

| Field | Value |
|---|---|
| Command | `wc -l .claude/commands/akili-review.md` ≤ 230; `npm test` → only the five `docs-overview` tests (`not ok` (a)–(d)) remain red (owned by T9b); `node bin/akili.js install --tool all --dry-run` lists `akili-review` and `pr-review` for every target; `HOME=$SCRATCH/h node bin/akili.js install --tool all` then `diff -r .claude/skills/pr-review $SCRATCH/h/.agents/skills/pr-review` → no output |
| Red run | Observed at baseline in the scratch package with stubs (design P-6): `not ok 394 … expected 236 packaged skill files under .claude/skills; counted 237 instead` |
| Falsifier | Revert the `install-cursor.test.js` literal edit with the real files present → `not ok … expected 236 … counted 244` (the expected figure is recomputed and quoted in `execution.md`) |
| Disqualifier | A count recomputed by hand rather than from `find .claude/skills -type f \| wc -l` at the task's HEAD is not evidence. A green `install` in a HOME that already holds an AKILI install proves nothing (skip-existing); the HOME must be empty |
| Consumers | `test/install-cursor.test.js`, `test/install-grokbot.test.js`, `test/fixtures/doctor-codex-baseline.txt`, `test/docs-overview.test.js` (a)–(d) (stays red until T9b), `test/akili-marketing-docs.test.js:114-115` and `test/diagram-design.test.js:417` (T9c) |

**Done.** The command is within its cap. Install counts and the fixture are green. The install diff is empty. The remaining red tests are exactly the five `docs-overview` ones.

---

### T7 — Command and skill text-contract test (`test/akili-review-command.test.js`)

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | L (~650) |
| Depends on | T6 |
| Requirements | Pins the text clauses of FR-1, FR-2, FR-5, FR-6, FR-8, FR-9 (cap restatement), FR-12 (addendum restatements), FR-13; NFR-4 |
| Design refs | DD-3, DD-13; the precedent `test/akili-security-command.test.js:1-40` (CRLF-normalizing `read()`, anchored `block()`) |
| Review | `checklist`: a test of approved text; mutation evidence carries it |

**Scope.**

- **Clause literals.** One literal per THEN/BUT/AND IT MUST clause and table row owned by command or skill text, each anchored to its step or section block and each written from the requirement, never read from the file under test.
- **Persona drift guard.** `reviewer.md` still has `id=lenses` with "single named lens" and `id=review-output` with "`STATUS:`". `pr-review` has no `reviewer.md:<digits>` pointer and does not copy the persona checklist (a ≥ 12-word shingle check against `reviewer.md` → 0 matches).
- **Restatements.** The addendum is byte-equal in the command, `lenses.md` and `ci.md`. The "10 inline" cap appears as the same number in the command, `SKILL.md`, `docs/ci/README.md` (once T8 lands; skipped with a printed reason until then) and `post-review.cjs`'s constant.
- **Attribution and size.** Every reference has its provenance line, `NOTICE` names both sources, the command is ≤ 230 lines and `SKILL.md` is ≤ 250.

**Verification.**

| Field | Value |
|---|---|
| Command | `node --test test/akili-review-command.test.js` |
| Red run | Before the test exists, delete the addendum's last sentence in a scratch copy of the command and run the T7 test there. The restatement assertion must be red, and the red is quoted. The precondition is greenfield: `predicted — greenfield artifact (observed in T7)` |
| Falsifier | Executed after the change, each reverted: (a) delete the FR-2 *PR number without gh* BUT sentence → its test goes red; (b) change "10" to "12" in `SKILL.md` → the cap restatement goes red; (c) rename `id=lenses` in a scratch copy of `reviewer.md` → the drift guard goes red; (d) T4's and T5's falsifiers are re-run here |
| Disqualifier | A literal copied from the file under test asserts nothing (KZ-changes--kaizen-loop-closure-2). A test whose `block()` anchor matches the whole file lets a stray keyword satisfy it. Test LOC is budgeted per clause; a test far under ~14 lines per clause probably skipped mutation checks (KZ-bugfix--init-ctrlc-abort-2) |
| Consumers | none |

**Done.** Every command and skill clause in §3 has a literal. Falsifiers (a)–(d) were observed red and reverted. The suite is green.

---

### T8 — CI templates + `docs/ci/README.md` + `test/akili-review-ci.test.js`

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | L (~280 templates + ~130 README + ~220 test) |
| Depends on | T6 |
| Requirements | FR-12 (items 1–8, both scenarios), FR-11 (advisory default line), FR-14 (`docs/ci/README.md`), NFR-6 |
| Design refs | §3 (job diagram), §7.6 (every row), DD-4, DD-5, DD-6; P-3, P-4, P-19 to P-24 |
| Review | `full`: trust-boundary configuration; two rounds budgeted |

**Scope.**

1. **First step: settle P-20, P-21, P-22, P-23 and P-24, and re-read P-4** at the pinned commits. Sources:
   - the Claude Code `--add-dir` memory-loading docs and the permission path syntax;
   - `claude-code-action` agent-mode token needs (`src/modes/agent` at `925afb5`);
   - grep the action source for `HOME`/`CLAUDE_CONFIG_DIR` (P-12 pre-check);
   - the GitHub tarball endpoint docs;
   - `codex-action` `docs/security.md`, `action.yml` and AGENTS.md discovery at `bdf19a4`.

   Record the URLs and quotes in `execution.md`. A refutation goes to the Pivot Protocol.
2. **Fill pins.** Use `gh api` for `actions/checkout`, `actions/setup-node`, `actions/upload-artifact`, `actions/download-artifact`, `claude-code-action` and `codex-action`, each with its tag comment.
3. **Write both templates** per the §7.6 table, with every value reaching `run:` through `env:`.
4. **Write `docs/ci/README.md`:** setup for both runtimes, secrets, the pilot procedure, turning on `--fail-on critical`, the residual risk, and "Require approval for all external contributors".
5. **Write the YAML text-contract test**, with literals per §7.6 row. It parses no YAML, so it adds no dependency.

**Verification.**

| Field | Value |
|---|---|
| Command | `node --test test/akili-review-ci.test.js`; `actionlint docs/ci/akili-review.claude.yml docs/ci/akili-review.codex.yml` → exit 0 (local, executed check); `grep -c "pull_request_target" docs/ci/*.yml` → 0; `grep -cE "uses: [^@]+@[0-9a-f]{40}" docs/ci/akili-review.claude.yml` ≥ 5 |
| Red run | `predicted — greenfield artifact (observed in T8)`. Run the test with an empty template stub and quote the red on the `github_token` assertion |
| Falsifier | Each executed after the change and reverted: (a) delete `github_token: ${{ secrets.GITHUB_TOKEN }}` → the token assertion goes red; (b) add `actions/checkout` to the `post` job → the no-checkout assertion goes red; (c) change `ref: …base.sha` to `head.sha` → red; (d) add `Bash` to `--allowedTools` → red; (e) write the head under `${{ github.workspace }}` → the outside-workspace assertion goes red; (f) add `--local` to an install line → red |
| Disqualifier | A test that greps for a key anywhere in the file, not within its job block, passes when the key sits in the wrong job, so the test must slice by job. `actionlint` passing proves syntax, not the trust boundary. The two scenarios' runtime behavior is not provable here (T12 observes it) |
| Consumers | none (new files) |

**Done.** The premises are settled or Pivoted. Pins are filled. Falsifiers (a)–(f) were observed red and reverted. `actionlint` is clean.

---

### T9a — Docs pages, governance, skills README, judgment-day row

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M (~200) |
| Depends on | T6 |
| Requirements | FR-14 (docs pages, governance core list, judgment-day row, skills README row) |
| Design refs | §9.1 (rows `docs/skills/README.md:38`, `governance.md`, `judgment-day/SKILL.md:75`) |
| Review | `checklist` |

**Scope.**

- Create `docs/commands/akili-review.md` and `docs/skills/pr-review.md`, quoting the shipped command text, not the design.
- Add the `pr-review` row to `docs/skills/README.md` (Binding `core`, author AKILI, adapted sources named).
- Add `pr-review` (review) to the `docs/skills/governance.md` *Current assignment* core list.
- Add an `/akili-review` row to the `judgment-day` Integration table: full tier, criticals, blind protocol, no fix rounds.

**Verification.**

| Field | Value |
|---|---|
| Command | `grep -c "pr-review" docs/skills/README.md docs/skills/governance.md .claude/skills/judgment-day/SKILL.md` → ≥ 1 each; `node --test test/docs-overview-contract.test.js` stays green |
| Red run | Observed at baseline (as run 2026-10-25): `grep -c akili-review docs/skills/governance.md .claude/skills/judgment-day/SKILL.md docs/skills/README.md` → `0`, `0`, `0` |
| Falsifier | Remove the new `docs/skills/README.md` row → `test/docs-overview.test.js` (c) "Skill Inventory has one row per skill" goes red (it is red at baseline with the stub and must be green after this task). Executed and reverted |
| Disqualifier | A docs sentence that paraphrases the design rather than quoting the shipped command can overstate it (KZ-002); each clause is quote-checked at HEAD |
| Consumers | `test/docs-overview.test.js` (c), `test/docs-overview-contract.test.js` |

**Done.** The pages exist, the rows are added, each clause is quote-checked, and `docs-overview` (c) is green.

---

### T9b — README, `docs/README.md`, `docs/overview.md`, `docs/commands/README.md`

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S (~60) |
| Depends on | T6 |
| Requirements | FR-14 (lists and counts) |
| Design refs | §9.1 rows `README.md:122`, `docs/README.md:43`, `docs/overview.md:38, :96, :159, :204`, `docs/commands/README.md:21, :37, :55` |
| Review | `checklist` |

**Scope.** Add `/akili-review` and `pr-review` rows at each listed site, matching the neighbouring rows' shape.

**Verification.**

| Field | Value |
|---|---|
| Command | `node --test test/docs-overview.test.js test/docs-overview-contract.test.js` → all green |
| Red run | Observed at baseline with the stub (design P-6): `not ok 375 - (a) docs/overview.md ## Commands lists every packaged command exactly once` |
| Falsifier | Remove the new `docs/overview.md` `## Commands` row → test (a) goes red again. Executed and reverted |
| Disqualifier | A green run with the stub's frontmatter rather than the shipped command's is not evidence; T6 must have landed first |
| Consumers | `test/docs-overview.test.js` (a), (b), (d); `test/docs-overview-contract.test.js` |

**Done.** All four files are edited, and both docs suites are green.

---

### T9c — `docs/flow.md`, `docs/cli.md`, `AGENTS.md` + pinned tests

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M (~110) |
| Depends on | T6 |
| Requirements | FR-14 ("Seven anytime commands", totals, AGENTS *Skill Usage*, figure kept as debt) |
| Design refs | §9.1 rows `docs/flow.md:21, :195, :445 (new 2d), :640, :680`, `docs/cli.md:247, 326, 327, 338, 339, 360, 377`, `AGENTS.md:64`, `test/akili-marketing-docs.test.js:100, :114-115`, `test/diagram-design.test.js:417`; DD-12 |
| Review | `full`: `AGENTS.md` is a rules document |

**Scope.**

- In `docs/flow.md`: `:21` "Six" → "Seven", with `/akili-review` added to the list; a `### 2d. Pull-Request Review (/akili-review)` section; `:195` artifacts row (run directory, `docs/specs/reviews/` opt-in); `:640` core-binding list; `:680` bullets.
- In `docs/cli.md`: the totals 13 → 14 and 28 → 29 at all 7 sites.
- In `AGENTS.md`: one `pr-review` line under *Skill Usage*.
- In the tests: update `akili-marketing-docs.test.js:100` (`Seven anytime commands`) and `:114-115` (`(the 14 commands, installed as skills`, `(the 29 packaged skills`), and the stale-total `doesNotMatch` list to include 13/28; update `diagram-design.test.js:417` to `/29 packaged skills/`, adding `28 packaged` to its `doesNotMatch` list.
- Do not touch the figure or its alt text.

**Verification.**

| Field | Value |
|---|---|
| Command | `grep -c "^Seven anytime commands" docs/flow.md` → 1; `grep -cE "\b(13 command\|28 packaged)" docs/cli.md` → 0; `node --test test/akili-marketing-docs.test.js test/diagram-design.test.js` → green |
| Red run | Observed at baseline (as run 2026-10-25): `grep -c "^Seven anytime commands" docs/flow.md` → `0`; `grep -c "14 commands\|29 packaged" docs/cli.md` → `0` |
| Falsifier | Edit `docs/cli.md` without the test edits → `akili-marketing-docs` "cli.md command total" and `diagram-design` `/28 packaged skills/` go red (observed, then the test edits applied). Leaving one `28 packaged skills` in `docs/cli.md` must make the new `doesNotMatch` go red |
| Disqualifier | A `Seven` sentence that lists six names passes the count grep; the test asserts the seven names |
| Consumers | `test/akili-marketing-docs.test.js`, `test/diagram-design.test.js`, `test/docs-overview.test.js` (d) |

**Done.** All sites are edited, the pinned tests are updated and green, and the figure is untouched (`git diff --stat assets/` is empty).

---

### T10 — Carve-outs (6 sites)

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S (~12) |
| Depends on | T6 |
| Requirements | FR-8 (carve-out), FR-14 (carve-outs) |
| Design refs | DD-10 (deliberate one-task exception, reason recorded), P-9 |
| Review | `checklist`: identical one-token edits |

**Scope.** Add `reviews/` after `audits/` in the carve-out list at `.claude/commands/akili-{audit,resume,specify,propose}.md` and `docs/commands/akili-{audit,resume}.md`.

**Verification.**

| Field | Value |
|---|---|
| Command | `grep -rlE "quick/.{0,6}, .{0,3}kaizen/" .claude docs --include='*.md' \| grep -v docs/specs/ \| xargs grep -L "reviews/"` → empty (every carve-out site carries `reviews/`); the same grep without `-L` lists exactly 6 files |
| Red run | Observed at baseline (as run 2026-10-25): each of the 6 files → `0` hits for the list followed by `reviews/` |
| Falsifier | Revert one site → the `xargs grep -L` lists that file. Executed and reverted |
| Disqualifier | A grep keyed on one phrasing missed a site at specify time (judgment-day C-1); the check keys on the list itself |
| Consumers | none (no test pins the list, P-9) |

**Done.** There are 6 sites edited, and the `-L` output is empty.

---

### T11 — CHANGELOG + full verification sweep

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S (~25 + sweep) |
| Depends on | T1–T10 |
| Requirements | FR-14 (CHANGELOG, no active-spec path, figure debt stated), NFR-1, NFR-2, NFR-5 |
| Design refs | DD-12, DD-13 |
| Review | `checklist` |

**Scope.**

- Add a `CHANGELOG.md` > Unreleased entry (minor-worthy: new command and skill, CI templates, the figure-debt note), quote-checking every clause against the shipped text at HEAD (KZ-002).
- Re-run every count stated in the CHANGELOG and docs after the tests are final.
- Run the full verification sweep.

**Verification.**

| Field | Value |
|---|---|
| Command | `npm test` on Node 18.20.8 and 22.23.3; `npm run verify:cli`; `npm run pack:dry-run` (lists `.claude/skills/pr-review/*` and `docs/ci/*`); `git diff --check`; `node bin/akili.js install --tool all --dry-run`; `node bin/akili.js doctor --tool all`; `git diff --stat 708020e -- bin/ package.json package-lock.json` → empty; `grep -rn "docs/specs/changes/akili-review" --include='*' . \| grep -vE "^(\./)?docs/specs/\|node_modules"` → 0; `grep -c O_NOFOLLOW .claude/skills/pr-review/*.cjs` → 0 |
| Red run | n/a (no new test) |
| Falsifier | Insert a reference to `docs/specs/changes/akili-review/` into `docs/ci/README.md` → the active-path grep reports 1 (executed and reverted) |
| Disqualifier | A green `npm test` on one Node only does not cover NFR-2. A CHANGELOG count copied from `execution.md` rather than re-run at HEAD is not evidence |
| Consumers | — |

**Done.** Every command is green on both Nodes, the pack lists the new files, `bin/` is unchanged, and the CHANGELOG is quote-checked.

---

### T12 — Pilot and dogfood (HITL)

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M (~0 shipped; a record in `execution.md`) |
| Depends on | T11 |
| Requirements | Observes FR-2, FR-3, FR-5, FR-6, FR-8, FR-9, FR-10, FR-11, FR-12 at runtime; settles P-12, P-13 |
| Design refs | §7.6, DD-5, DD-6, DD-9; the NFR defect-class table rows "CI template wiring" and "Host behavior" |
| Review | `checklist`: observation record |

**Scope.** This is a **HITL pause**: the user provides a scratch GitHub repository and API keys, and nothing is pushed to this repo.

- **(a) Local dogfood.** `/akili-review` on this branch against `dev`. The spec coverage table must map `[SPEC:changes/akili-review]` commits to their FRs. A planted out-of-scope edit (scratch branch only) must be flagged.
- **(b) Claude pilot**, on the scratch repo with `docs/ci/akili-review.claude.yml`:
  - PR 1 opens: one summary and ≤ 10 inline comments.
  - Push 2 fixes one finding: it is listed as fixed and its thread resolved.
  - Push 3 is at the same head (re-run): skipped.
  - The `akili-review:advisory` label forces advisory.
  - The planted `AGENTS.md`/`.agents/reviewer.md`/command edits must not change the verdict, and the log shows the base files loaded.
  - The job log shows the HOME command file read (P-12).
- **(c) Codex pilot** if an OpenAI key is available: same flow; record whether sub-agents ran (P-13).

**Verification.**

| Field | Value |
|---|---|
| Command | The links to the scratch PRs and Actions runs, quoted in `execution.md` with the summary comment text and the inline count per push |
| Red run | n/a (observation) |
| Falsifier | Pilot step (b) with the `github_token` line removed from a scratch copy of the template: the review job must fail on its permissions (no `id-token`), or the log must show the App token's write scope. Either way the hardening is shown to be load-bearing |
| Disqualifier | A pilot on a repository where the PR author is also the only admin, with no planted injection, proves the happy path only and must say so. A Codex leg not run is recorded as `not run — no key`, never as a pass |
| Consumers | — |

**Done.** P-12 is settled. P-13 is settled or recorded `not run`. Every observation is quoted, and any deviation goes to the Pivot Protocol.
