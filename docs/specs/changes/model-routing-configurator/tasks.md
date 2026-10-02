# Tasks: Model Routing Configurator (`akili routing`)

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/model-routing-configurator` |
| Depth | Standard |
| Type | Change |
| Approval Mode | `gated` |
| Status | Draft — Phase 3 |
| Date | 2026-10-01 |
| Budget (design §10) | 8 tasks · ~1,550 LOC (`routing.js` ~420 · `akili.js` ~220 · `persona.js` 2 · JSON ~140 · template ~80 · tests ~480 · prose ~210) · 18 review rounds (code 5 × 2; rules docs 2 × 2; validation 1; margin 3) |
| Design review | Judgment Day round 1: 15 confirmed severe + 3 split + 17 warnings **fixed** (Fix only, no re-judgment) — `judgment.md` |
| Design refinement (Phase 3) | DD-14's seam lives in **`bin/routing.js`** (`collectAnswers`, `promptMultiSelect`, `promptTierAdjust` take an injected `io`), not in `bin/akili.js`: `akili.js` executes `main()` on load (`:2120`), so nothing in it is unit-testable by `require`. `akili.js` only builds the `io` (readline) and the snapshot. Design §7 amended in the same commit |
| Commit prefix | `[SPEC:changes/model-routing-configurator]` |
| Format precedent | `docs/specs/archive/2026-10-01-changes--cursor-install-target/tasks.md` |
| Verified at | `8eb0227` |

## 2. Task Graph

```
T1 (packaged data: registry JSON, section template, drift test)
 └─→ T2 (routing.js: parse + derive, tdd)
      ├─→ T3 (routing.js: render, fence, wrappers, buildPlan; persona.js exports, tdd)
      └─→ T4 (routing.js: collectAnswers + prompt helpers through io, tdd)
            T3 + T4 ─→ T5 (akili.js wiring: flags, case, runRouting, applyPlan, summary/json, help; io tests)
                        └─→ T6 (constitution Step 8C/8E/9 + checklist + mirror)
                             └─→ T7 (audit, AGENTS.md:37, model-routing.md, flow tenant, cli.md, README, CHANGELOG, closure sweep)
                                  └─→ T8 (closing validation: scratch project + constitution delegation walk)
T2 ─→ T9 (pivot, 2026-10-02: deriveTiers step 6 — fixed notes only for packaged primaries; T8 case 1's registry check re-runs after T9)
T6 ─→ T10 (pivot 2: Step 8C branch detection via `akili help`; preview `--yes --dry-run`; Step 9 pairing wording)   T9 ─→ T11 (pivot 2: step 6 keyed on registry membership) — T10 ∥ T11 (disjoint files)
```

Waves: **T1** → **T2** → **T3 ∥ T4** (disjoint functions in one file — sequence the commits, parallel work only in separate worktrees) → **T5** → **T6** → **T7** → **T8**. No circular dependencies. T6 waits for T5 so the flag names it documents are the ones `getArgs` accepts.

**`skip-eligible` tasks: none.** Every task edits logic, data another test depends on, or rules text other agents execute.

---

### T1 — Packaged data: `model-registry.json`, `model-routing.section.md`, drift test

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M |
| Depends on | none |
| Requirements | FR-7 (all), FR-4 content list (template side: Step 8C items 1–6 fixed prose, `{{placeholders}}` named in design §5.4), NFR-7 (pins in the JSON) |
| Design refs | §3 (data rows), §5.1 incl. cell grammar, §5.4, DD-3, P-4, P-8, P-18, P-25, P-26, P-27 |
| Review | `full` — the JSON is the derivation's ground truth; a wrong preference list ships a wrong mapping to every project |

**Scope.**

- `.claude/templates/model-registry.json` per §5.1: five hosts; `label`, `cliSuggestion`, `lastVerified`, `pin`, `wrapper{location, shape, restriction, effortField}`, `models[]` (`id`|`null`+`family`, `label`, `alias`, `dated`, `wrapperModel?`, `effortRungs`, `planGated?`), `tierPreference` T1–T6 whose head/second equal the doc cell's primary/fallback **by reading `docs/model-routing.md:120-125` cell by cell**, `notes`; `crossHost.T6 = "antigravity"`. Cursor entries: family placeholders (`id: null`) for the six families named at `:120-125`; Codex: `gpt-6-astra` (Astra, `planGated`), `gpt-5.6-sol` (Sol, `planGated`), `gpt-5.6-terra`, `gpt-5.6-luna` with `family`; Antigravity: `gemini-3.8-flash-{high,medium,low}` (`wrapperModel: flash`), `gemini-3.1-pro-high` (`wrapperModel: pro`); Claude: `opus`/`sonnet`/`haiku` (`alias: true`, `effortRungs: null`); OpenCode slugs as in the table.
- `.claude/templates/model-routing.section.md`: the Step 8C items 1–6 prose (mirroring `docs/model-routing.md` → *Philosophy*, *Capability tiers*, *Phase → tier mapping*, *Effort dial* compactly), the amended item 5 instruction (design §5.4), rate-limit and frontier-pin sentences, `{{registryTable}}`, `{{updated}}`, `{{cliInvocationRow}}`, `{{crossHostLine}}`, `{{antigravityDialMap}}`, `{{authorAuditorNotes}}`, `{{pinReasons}}`, `{{regenerateHint}}`. **No** `Default Branch:` / `Integration Branch:` strings (P-7).
- `test/registry-drift.test.js`: locate the table by the header line starting `| Tier | Claude Code |`; walk rows T1–T6, columns 2–6; apply the §5.1 cell grammar; assert (i) every backticked id / family word exists in `models[]`, (ii) every placeholder appears in that tier's `tierPreference`, (iii) `tierPreference[T][0]` appears in the host cell, and `[1]` (when present) appears in the host cell **or in that row's shared `Fallback` column** (a single-id host cell keeps its fallback there — amended at the T1 gate, 2026-10-01); the `Fallback` column is not otherwise walked. Also assert the template contains none of the P-7 strings and that every `{{placeholder}}` in the template is in the fixed set.

**Verification.**
1. `node --test test/registry-drift.test.js` ⇒ green at HEAD. **Falsifier:** change `sonnet`→`haiku` in Claude `tierPreference.T2[0]` → red naming host/tier; change `` `haiku` ``→`` `opus` `` in `docs/model-routing.md:124` Claude cell → red. Both executed and reverted.
2. `node -e "const r=require('./.claude/templates/model-registry.json'); for (const [h,v] of Object.entries(r.hosts)) for (const t of ['T1','T2','T3','T4','T5','T6']) if (!Array.isArray(v.tierPreference[t]) || !v.tierPreference[t].length) throw new Error(h+' '+t)"` ⇒ exits 0. **Falsifier:** delete `T6` from one host → throws.
3. `grep -c "Default Branch:\|Integration Branch:" .claude/templates/model-routing.section.md` ⇒ `0`.
4. `grep -o "{{[a-zA-Z]*}}" .claude/templates/model-routing.section.md | sort -u` ⇒ exactly the eight placeholders of §5.4 (quote the list).
5. `npm run pack:dry-run | grep -c "templates/model-registry.json\|templates/model-routing.section.md"` ⇒ `2` (shipped via `files`, P-4).
6. `npm test` ⇒ green (94 baseline + new); `git diff --check`.

**Red run.** Check 1's two mutations observed red **on the assertion** (host/tier named), not on a parse throw — a JSON parse error is "not red".
**Disqualifier.** A drift test that locates the table by line number (`118`) instead of the header text is not evidence (P-8: the anchor is the header). A test that passes because the cell grammar ignored a token it should have checked (e.g. treated `Terra` as annotation) is void — assert the Codex column produced ≥ 1 family match per row.
**Consumers.** `grep -rn "model-registry\|model-routing.section" bin test scripts docs` as run → 0 at HEAD (new names); the fixed-list enumerations (`bin/akili.js:75`, `:776-790`, `:1078-1079`, `:1232-1236`; `scripts/release.js:15`; `scripts/ci/install-layout-regression.js:300`) are **not** consumers — assert `node bin/akili.js list` output is unchanged (`diff <(git stash -q; node bin/akili.js list; git stash pop -q) <(node bin/akili.js list)` or equivalent on a clean checkout).

**Done.** Both files exist; checks 1–6 run with disqualifiers; the red run quoted; `list`/`doctor`/`install --dry-run` outputs unchanged.
**Skills.** `tdd` (test first for the drift test), `cognitive-doc-design` for the template prose, `caveman` for narration.

---

### T2 — `bin/routing.js`: flag grammar and derivation (tdd)

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M |
| Depends on | T1 |
| Requirements | FR-2 (Validation errors scenario — every listed error), FR-3 (all three scenarios, every `BUT`/`AND IT MUST`), NFR-5 |
| Design refs | §5.3, §5.7 (`--models`, `--cli`, `--t3-cross-host` grammars), §7 rows `parseHosts`…`deriveTiers`, `canonicalAnswers`, DD-1, DD-4, DD-5, W1, W2, W17 |
| Review | `full` — pure logic with eleven error classes and a hard rule (T3 ≠ T2) |

**Scope.** New `bin/routing.js` (CommonJS, requires only `node:path` and the two regexes from `persona.js` — the import lands in T3; this task exports):

- `parseHosts(str)`, `parseModels(list, hosts, registry)` → `{ roster }` or `{ error }` for: unknown host · host ∉ hosts · empty list · bad `@T` (not 1–6) · unknown id without `@T…` · `@` inside an id · same id on T2 and T3 · dated id without `reason` in non-interactive mode (reasons come from the wizard or from `--pin-reason <host>=<id>=<text>` — design §5.7; `parsePinReasons(list, hosts)` in this task) · duplicate host flags (last wins, no error). `parseCli(list, hosts)`, `parseCrossHost(list, hosts)`.
- `deriveTiers(roster, hostRegistry, { crossHost, selectedHosts, hostKey, crossHostT6Owner })` per §5.3 steps 1–6, returning `{ mapping, authorAuditor, notes }`.
- `canonicalAnswers(answers)` — stable key order, `updatedAt` excluded.
- `test/routing.test.js` (part 1): table-driven cases — full Claude roster = packaged column (and the same assertion looped over **every host's** full packaged roster, FR-3 "for every host"); `sonnet`-only → `unsatisfiable`, T3 note text verbatim; `opus,sonnet` → T2 sonnet, T3 opus, T5 sonnet (fallback `—`); user id `x@T1+T3` on Claude → T1 `x`, T3 `x` (≠ T2 sonnet), fallback opus; user id on T2+T3 → error; `@` in id → error; cross-host T3 → `primary "→ antigravity"`, `authorAuditor cross-host`; T6 note variants (owner unselected / selected / is the host); canonical form ignores `updatedAt` and key order.

**Verification.**
1. `node --test test/routing.test.js` ⇒ green. **Falsifier (executed):** invert step 4 to pick `cands(T3)[0]` without the `≠ T2` filter → the `sonnet`-only and the `opus,sonnet` cases go red; revert.
2. Second falsifier: swap `tierPreference.T4` head/second in a test-local registry copy → the fallback assertion goes red (proves the test reads the second entry, not just the head).
3. `node -e "require('./bin/routing.js')"` ⇒ no `main()` side effects (prints nothing, exits 0).
4. `grep -n "require(" bin/routing.js` ⇒ only `path` and (after T3) `./persona.js`.

**Red run.** Each case written before its implementation; the recorded red is the assertion's expected/actual (e.g. `expected 'opus', got 'sonnet'` for T3), by test name. A `TypeError: deriveTiers is not a function` is "not red".
**Disqualifier.** A derive test whose registry fixture is hand-typed in the test file proves the function, not the shipped data — the "every host equals the packaged column" case must load `.claude/templates/model-registry.json`. A grammar test that only checks `error` is truthy is void — assert the error names the offending value.
**Consumers.** none at HEAD (new module). `grep -rn "routing" bin test` → 0 before this task.

**Done.** Functions exported; part-1 suite green with both falsifiers observed red; no I/O in the module.
**Skills.** `tdd`, `systematic-debugging`, `caveman`.

---

### T3 — `bin/routing.js`: section render, fence replacer, wrappers, `buildPlan`; `persona.js` exports (tdd)

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | L |
| Depends on | T1, T2 |
| Requirements | FR-4 (Six states — every state and token; Unselected host keeps its column; CLI row only confirmed; `CLAUDE.md` never written), FR-5 (table rows for all five hosts; Skip-by-default incl. `model drift`; Restriction omitted and reported; `wrappers=no`; unsatisfiable/cross-host), FR-6 (`Updated:` = month of `updatedAt`; no run results in the file), NFR-3, NFR-8 |
| Design refs | §5.2, §5.4, §5.5, §5.6, §7 (`renderRegistryTable`…`buildPlan`), DD-1, DD-2, DD-7, DD-8, DD-11, DD-12, DD-13, P-3, P-7, P-19, P-22 |
| Review | `full` — writes into a user-owned file; six terminal states |

**Scope.**

- `bin/persona.js`: add `SECTION_OPEN_RE, SECTION_CLOSE_RE` to `module.exports` (`:917-937`) — nothing else changes.
- `renderRegistryTable` (7 columns always; selected + previously-filled hosts from `mapping`, others from `tierPreference` heads/seconds; Fallback cell = `` `id` (host) `` list; dated ids footnoted), `renderSection(template, ctx)` (eight placeholders; `{{cliInvocationRow}}` → `<CONFIRM>` when unconfirmed), `replaceFencedSection(text, body, sinceTag, expectedBody, opts)` (states a/a′/b/c/e/f per §5.6, EOL detection per `persona.js:92-95`, heading extent ignoring code fences, unified diff string for a′/b), `renderWrapper(host, role, mapping, decisions, registry)` for the five shapes (§5.5 fields; Reviewer restriction per host; Cursor bracket only for a confirmed rung; Antigravity `wrapperModel`; Codex `"""` body; returns `null` for a skipped role), `buildPlan(answers, registry, pkgVersion, snapshot, now)` → `{ writes[], stale[], authorAuditor, placeholdersByColumn, sectionBytes, exitCode, hints[] }` with the token vocabulary of §5.6, `skipped (exists; --force to replace)` + `— model drift: …` from `snapshot.existingFiles` contents, `skipped (wrappers=no)`, `skipped (author ≠ auditor unsatisfiable)`, `no changes` when every write is `unchanged`/`skipped`, the `CLAUDE.md` report line, the DD-9 commit hint, the state-(d) hint.
- `test/routing.test.js` (part 2) with `test/fixtures/routing/` (`agents-fenced-clean.md`, `agents-fenced-edited.md`, `agents-unfenced.md`, `agents-no-section.md`, `agents-malformed.md`, `agents-mixed.md`, `agents-crlf.md`, `claude-with-routing.md`, `reviewer-existing.md`): one case per state and token; bytes outside the fence byte-compared; CRLF file keeps `\r\n`; wrapper snapshots per host (all four roles) against §5.5; `model drift` line; `Updated:` from `updatedAt`; `since=` unchanged when body unchanged; a run with unchanged answers → every token `unchanged`; `hosts: [cursor]` with a previous Claude mapping keeps the Claude column.

**Verification.**
1. `node --test test/routing.test.js` ⇒ green. **Falsifiers (executed, each then reverted):** (i) make the replacer write the section at the top of the file → the outside-bytes case goes red; (ii) drop the `expectedBody` comparison → the a′ fixture case goes red (would be `replaced` instead of `refused`); (iii) remove `subagent: true` from the Antigravity Leader → snapshot red; (iv) use `now` for `Updated:` → the month-boundary case (`now` = next month, answers unchanged) goes red.
2. `node -e "const p=require('./bin/persona.js'); if(!(p.SECTION_OPEN_RE instanceof RegExp)) throw 1"` ⇒ 0; `node --test test/persona-digests.test.js test/agents-doctor.test.js` ⇒ unchanged green.
3. `grep -c "<CONFIRM" <(node -e "…render a Cursor Reviewer wrapper with effortRungs null…")` ⇒ `0` (no placeholder inside a frontmatter value — S1).
4. `grep -n "writeFileSync\|readFileSync\|process\.\(cwd\|stdin\|stdout\)" bin/routing.js` ⇒ 0 (NFR-5).

**Red run.** Every state case observed red on the token/bytes assertion before implementation (e.g. `expected 'refused (hand-edited fence; --force to regenerate)', got 'replaced'`). A red from a missing fixture file is "not red".
**Disqualifier.** A fence test whose fixture has no prose outside the fence cannot detect out-of-fence damage — the clean/edited fixtures must carry ≥ 3 lines before and after. A wrapper snapshot test that normalizes whitespace before comparing is void for TOML (`"""` placement matters). State (f) proven only by the (a) token is not evidence — assert the stray-heading report line too.
**Consumers.** `test/persona-digests.test.js`, `test/agents-doctor.test.js`, `test/agents-doctor-io.test.js` import `persona.js` → run them (check 2). `grep -rn "SECTION_OPEN_RE\|SECTION_CLOSE_RE" bin test` as run → `bin/persona.js:10-11` and internal uses only at HEAD.

**Done.** All six states + `CLAUDE.md` line + token vocabulary covered; five host wrapper snapshots; falsifiers i–iv observed red; persona suites unchanged.
**Skills.** `tdd`, `systematic-debugging`, `caveman`.

---

### T4 — `bin/routing.js`: `collectAnswers` and prompt helpers through an injected `io` (tdd)

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M |
| Depends on | T2 |
| Requirements | FR-1 (Two hosts happy path — prompt order and count; Adjust a tier incl. the T3 = T2 rejection; No TTY and incomplete answers — the refusal to call `io.ask`), FR-2 (Mixed input; pre-fill from previous answers, flags override), FR-3 (Unknown model id prompt; dated-id reason prompt; single-model three options), FR-6 (Pre-fill scenario) |
| Design refs | §7 (`collectAnswers`, `promptMultiSelect`, `promptTierAdjust`), DD-6 (question order the constitution mirrors), DD-14, P-20, P-21, Document Control *Design refinement* |
| Review | `full` — the question order is the contract the constitution's fallback protocol copies |

**Scope.**

- `collectAnswers(args, previous, registry, io, { isTTY })`: resolution order **flags → previous answers → `io.ask`**; when `!isTTY` and an answer is still missing → return `{ error: usage }` naming the missing flags (never calls `io.ask`). Question order (the constitution copies it in T6): hosts → per host roster (packaged options pre-checked from previous; *other* → id → tiers → reason if dated) → per host invocation (default = `previous.cli[host] ?? cliSuggestion`; `Enter` accepts, `-` leaves `<CONFIRM>`) → Antigravity tool names (only if selected) → OpenCode dir (only if selected) → wrappers `[Y/n]` → derived table + `[A]ccept / [t] / [q]` (`--yes` skips) → on `unsatisfiable`: *add a model / dispatch T3 cross-host / leave it*.
- `promptMultiSelect(io, title, options, preChecked)` — numbered, comma list, `Enter` keeps pre-checked, invalid number → re-ask once then error; `promptTierAdjust(io, mapping, roster)` — one tier per round; a pick making T3 = T2 → one-line reason, re-prompt.
- `test/routing.test.js` (part 3): scripted `io` (array of answers; records questions) — two-host happy path asks exactly 7 questions (FR-1 count), the recorded order matches the list above; `--hosts claude` skips the host question; previous answers pre-check options; `--yes` with complete flags asks 0; `isTTY: false` + missing roster → usage error, `io.ask` never called; adjust round rejecting T3 = T2 then accepting; unknown id → placement question; dated id → reason question; the answers object from the scripted run **deep-equals** the one built from the equivalent flags (FR-2 byte-identical, proven at the answers level — DD-14).

**Verification.**
1. `node --test test/routing.test.js` ⇒ green. **Falsifiers (executed):** reorder the invocation question before the roster → the order assertion goes red; drop the `isTTY` guard → the "never called" assertion goes red (the scripted `io` throws when asked).
2. `grep -n "readline\|process.stdin" bin/routing.js` ⇒ 0 — the module never touches a terminal.

**Red run.** Order/count assertions observed red before implementation (`expected 7 questions, got 0`).
**Disqualifier.** A count assertion satisfied by a prompt loop that asks the same question twice and another zero times is void — assert the ordered list, not the count alone. Deep-equality that ignores `roster[].source` or `reason` is not FR-2 evidence.
**Consumers.** none at HEAD; T5 wires `io` from `readline/promises`.

**Done.** Order contract documented in a comment block at the top of `collectAnswers` (T6 quotes it); part-3 suite green; falsifiers red.
**Skills.** `tdd`, `caveman`.

---

### T5 — `bin/akili.js` wiring: flags, `case "routing"`, `runRouting`, `applyPlan`, summary/`--json`, help; subprocess tests

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | L |
| Depends on | T3, T4 |
| Requirements | FR-1 (Dry run; No TTY and incomplete answers — exit code and message), FR-2 (Fully specified no TTY — exit 0, byte-identical; validate before first write), FR-4 state (d) hint, FR-5 Skip-by-default (file-level), FR-6 (Idempotent re-run — `git status --porcelain` empty), FR-8 (`--json` shape the constitution reads), FR-10 (`install`/`doctor` byte-identical; `akili help` line; no `dependencies`), NFR-1, NFR-2, NFR-3, NFR-4, NFR-6 |
| Design refs | §3, §5.7, §7 (`takeSnapshot`, `applyPlan`, `printRoutingSummary`/`printJson`, hints), §8 `args.command` rows, DD-1, DD-9, DD-10, P-1, P-5, P-6, P-12, P-14, P-15, P-23, U4 |
| Review | `full` — the only writer in the feature; exit codes and the JSON contract are what the constitution depends on |

**Scope.**

- `getArgs` (`:280-388`): declare `hosts`, `models` (`multiple`), `cli` (`multiple`), `wrappers`, `t3-cross-host` (`multiple`), `antigravity-tools`, `opencode-agent-dir`, `yes`, `adopt`, `json`, `project`, `pin-reason` (`multiple`, from T2's amendment) — camelCase in the returned object; `--tool` validation untouched.
- `main` switch (`:2092`): `case "routing": await runRouting(args); break;` (`main` is already `async`).
- `runRouting(args)`: resolve `projectDir`; read previous answers; `io = { ask }` over `readline/promises` only when `process.stdin.isTTY`; `collectAnswers`; `takeSnapshot(projectDir)` (`AGENTS.md`, `CLAUDE.md`, existing wrapper **contents** at the five locations, EOL); `buildPlan(..., new Date())`; `applyPlan(plan, args)` — `ensureDirectory` calls collected and printed as one `would create N dirs` / silent line (U4), `atomicWriteFileSync` for every `created`/`replaced`/`appended`/`adopted`/`overwritten`/answers-file write, nothing for `skipped`/`unchanged`/`refused`, nothing at all under `--dry-run` (prefix `[dry-run]`); exit code from the plan (`refused` on `AGENTS.md` → 1; validation error → `fail()` before any write; `unsatisfiable` under `--yes` → 0). `--json` prints the plan result (writes with tokens, `stale`, `authorAuditor`, `placeholdersByColumn`, `sectionBytes`, `hints`) and nothing else to stdout.
- `printHelp`: `routing` command line, thirteen option lines, three examples (`akili routing`, the fully specified `--yes --json` form, `akili routing --dry-run`).
- `test/routing-io.test.js` (subprocess, `HOME`/`USERPROFILE` redirected, `mkdtemp` project — P-12): non-TTY + no flags + no answers → exit ≠ 0, stderr names `--hosts`, tree unchanged; fully specified `--yes` → exit 0, files present, tokens in stdout; same run with `--json` → parseable, fields present; second `--yes` run → `no changes`, `git status --porcelain` empty in an initialized scratch repo; `--dry-run` → tree unchanged; pre-existing reviewer wrapper → byte-identical + `skipped (exists; --force to replace)` (+ drift line when its model differs); `--force` → `overwritten`; unfenced fixture → `skipped (unfenced; --adopt to replace)`, then `--adopt` → `adopted`; hand-edited fenced fixture → `refused (…)`, exit 1, `--force` → `overwritten`; invalid `--models` with valid `--hosts` → exit ≠ 0 and **no file written**; `--wrappers no` → section + answers only; single-model `--yes` → exit 0, `skipped (author ≠ auditor unsatisfiable)`; timing: the usage-error case completes < 2 s (NFR-2).

**Verification.**
1. `node --test test/routing-io.test.js` ⇒ green. **Falsifiers (executed):** move `applyPlan`'s existence check after the write → the skip case goes red; write the answers file before validation → the "no file written" case goes red; drop the `isTTY` guard in `runRouting` → the non-TTY case times out (observed as red via the test's timeout, then restored).
2. `node bin/akili.js install --tool all --dry-run --claude-target $T/c --opencode-target $T/o --antigravity-target $T/a --codex-target $T/x --codex-skills-target $T/s --cursor-target $T/u --cursor-skills-target $T/s` at HEAD vs `8eb0227` (`git stash` or a second worktree) ⇒ `diff` empty; same for `doctor --tool all` with `PATH=/usr/bin:/bin` (FR-10).
3. `node -e "const p=require('./package.json');process.exit(p.dependencies?1:0)"` ⇒ 0 (NFR-1). `grep -n "^model:" .claude/commands/*.md` ⇒ empty.
4. `node bin/akili.js help | grep -c "routing"` ⇒ ≥ 3 (command line, options, examples); `npm run verify:cli` output `diff` vs `8eb0227` ⇒ empty (FR-10 — `list`, not help).
5. `node --check bin/akili.js`; `npm test`; `git diff --check`.

**Red run.** Each io case observed red on its assertion before the wiring exists (`Unknown command: routing` in stderr counts as the **first** red for the "exit 0" cases — record it — but the skip/refuse/idempotence cases must then be re-observed red on their own assertion once the command exists, before their branch is implemented).
**Disqualifier.** Any io test that ran with a real home (unpinned `HOME`) is void. An idempotence check read by eye is not evidence — quote `git status --porcelain` output (empty). Check 2 passing because `--tool all` was auto-detected is void — pass it explicitly. Timing (NFR-2) measured once is not evidence — three runs, report the spread; if any exceeds 2 s the case is inconclusive, not failed.
**Consumers.** `scripts/ci/install-layout-regression.js` (reads `bin/akili.js` output shapes — run it), `.github/workflows/ci.yml` (`install --tool all --dry-run`, `--force`, `doctor --tool all` — unchanged commands), `docs/cli.md`, `README.md:428-441` (documented in T7). `grep -rn "Unknown command" test scripts` as run → quote hits.

**Done.** Command live; io suite green with falsifiers; checks 2–5 quoted; help updated.
**Skills.** `systematic-debugging`, `caveman`; `tdd` for the io cases where a red is observable.

---

### T6 — Constitution: Step 8C delegation + inline fallback, Step 8E generated-by note, Step 9, checklist; `docs/commands/` mirror

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M (rules document — two review rounds budgeted) |
| Depends on | T5 |
| Requirements | FR-8 (all three scenarios, every `AND IT MUST`/`BUT`), FR-4 content list (the constitution's item 5 re-wording), FR-5 (Step 8E example defaults → *from the mapping*) |
| Design refs | §5.4 (obligation table — the sweep's checklist), §5.5, §8 Step 8C/8E row, DD-6, DD-12, P-9, P-17, U2 |
| Review | `full` — rules text other agents execute; the obligation sweep is the gate |

**Scope.** `.claude/commands/akili-constitution.md` (then update the **summary doc** `docs/commands/akili-constitution.md` for consistency — T6-gate correction, 2026-10-01: it is a 133-line summary, not a mirror; `for f in docs/commands/*.md` → every one of the eleven differs from its command, none is a verbatim copy — its tenant table gains the fourth row and its *Model Routing Scaffolding* section names `akili routing` and the fallback):

- **Step 8C** (`:465-617`): new opening — *delegation*: ask in chat (hosts → rosters, placements for unknown ids, reasons for dated ids → invocations → Step 8E's wrapper question — the exact order of T4's `collectAnswers` comment block), then run `akili routing --project . --hosts … --models … --cli … --wrappers … [--t3-cross-host …] [--antigravity-tools …] [--pin-reason …] --yes --json` and read stdout; **three branches** (binary present and knows `routing` · present but `Unknown command: routing` · absent) — the last two run the **inline fallback protocol** = the current items 1–6, mode policy, and confirm paragraph, kept verbatim under a "Fallback (no `akili routing`)" heading, writing the same fence `id=model-routing` and telling the user a later `akili routing` needs `--force` on it (state a′). Item 5's instruction re-worded per design §5.4 (two prohibitions verbatim). Mode policy gains one sentence: the generator's provenance check is the Safe Update rule in code.
- **Step 8E** (`:663-930`): opening paragraph says the wrappers are generated by the same `akili routing` run when the user opts in; per-host bullets stay as the fallback and the contract; example defaults (Claude tester `sonnet`, Antigravity Leader/Reviewer `pro`) re-worded to *from the mapping (T2 / T1 and T3)*; the tenant table (`:891-906`) gains the `.agents/model-routing.json` row and "four non-colliding uses".
- **Step 9** (`:1322-1326`): read the `--json` result when present — hosts, placeholders per column, files + tokens, each Reviewer's restriction state, `authorAuditor`, `sectionBytes` for the Codex check; "three-tenant" (`:1324`) → "four-tenant"; state whether the fallback was used.
- **Verification Checklist** (`:1352-1358`): one new item — *the `## Model Routing` section carries the `akili:section id=model-routing` fence, or the summary says the fallback wrote it*.
- **Obligation sweep before spawning the Reviewer** (KZ-changes--gate-falsifiability-2, KZ-changes--kaizen-loop-closure-2): walk design §5.4's left column — every Step 8C item 1–6 clause (`:481-591`), mode policy (`:592-604`), confirm paragraph (`:606-614`), Step 8E bullets and Rules 1–4 (`:677-929`), Step 9 (`:1322-1326`), checklist (`:1352-1358`), `:23`, `:79-81` — and for each write *kept verbatim in fallback* / *moved to generator contract §5.x* / *re-worded (quote both)*; the walk is attached to the Implementer report.

**Verification.**
1. `grep -n "akili routing" .claude/commands/akili-constitution.md` ⇒ hits in Step 8C, Step 8E, Step 9 (quote line numbers). `grep -c "Unknown command: routing" …` ⇒ ≥ 1 (U2 branch).
2. Obligation walk complete: every row of design §5.4 has a disposition; **held-out case** (inert-fixture rule): the `:1326` Codex `project_doc_max_bytes` sentence and the `:23` fallback sentence are checked against the general rule "every Model Routing obligation survives", not against §5.4's citation of them.
3. `grep -c "akili routing" docs/commands/akili-constitution.md` ⇒ ≥ 1 and `grep -c "model-routing.json" docs/commands/akili-constitution.md` ⇒ ≥ 1 (summary doc updated — replaces the `diff -q` mirror check, which cannot hold: the docs page is a summary, T6-gate correction 2026-10-01). `grep -c "three-tenant\|three non-colliding" .claude/commands/akili-constitution.md docs/commands/akili-constitution.md` ⇒ `0` each.
4. `grep -n "edit only this registry table" .claude/commands/akili-constitution.md .claude/templates/model-routing.section.md docs/model-routing.md` ⇒ **0 hits** (amended after the T6 report, 2026-10-01: FR-8 re-words item 5 and item 5 lives inside the fallback; a fallback that still said "edit only this table" would send users to hand-edit a fenced section the next run refuses — the live instruction appears at both `akili-constitution.md` item 5 and the section template).

**Falsifier.** Delete one clause of Step 8C item 4 (e.g. the "placeholder the rest" sentence) from the fallback copy before the sweep → the obligation walk must report that row as *missing*; a walk that still reports every row disposed is not a gate. Executed once on a scratch copy of the file and reverted.
**Red run.** n/a (prose) — the pre-change file: `grep -c "akili routing" .claude/commands/akili-constitution.md` → `0` at `8eb0227` (run before editing; baseline recorded).
**Disqualifier.** A sweep that greps "ask the user" instead of walking each obligation is void (KZ-changes--kaizen-loop-closure-2: key on the obligation). A mirror `diff` run before the last edit is not evidence — run it last.
**Consumers.** `docs/commands/akili-constitution.md` (mirror), `docs/flow.md:350-358` and `README.md` sentences that describe Step 8C/8E (T7 sweeps them), `.claude/commands/akili-audit.md:56` (names Step 8E wrapper paths — unchanged). `grep -rn "Step 8C\|Step 8E" docs README.md .claude/commands | wc -l` as run → quote count; each hit re-read in T7.

**Done.** Three branches present; fallback verbatim; item 5 re-worded; Step 9 reads JSON; checklist item; tenant row; summary doc updated (tenant row + `akili routing` mention); sweep attached.
**Skills.** `cognitive-doc-design`, `caveman`.

---

### T7 — Audit signal, root rule carve-out, docs, README, flow tenant, CHANGELOG, closure sweep

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M (rules/docs — two review rounds budgeted) |
| Depends on | T5, T6 |
| Requirements | FR-9 (every SHALL; Aggregate-claim falsification), FR-10 (`grep "^model:"` empty), NFR-7 (pins carried into `docs/cli.md` *Routing* section where host shapes are named) |
| Design refs | §4 docs rows, §8 (every consumer row), DD-9 (hint documented), P-10, P-11, P-13, P-24 |
| Review | `full` — summary surfaces inherit the artifacts' evidence bar (KZ-002) |

**Scope.**

- `.claude/commands/akili-audit.md:56`: add the third signal (*wrappers, `.agents/model-routing.json`, and the `## Model Routing` section disagree*); `docs/flow.md:407` same clause. (`docs/commands/akili-audit.md` carries no such paragraph — P-24 — **no edit**; state it.)
- `AGENTS.md:37`: carve-out sentence per design §8; `docs/model-routing.md:791-817` *Cross-tool safety* "No installer changes" bullet: same carve-out; `docs/model-routing.md:760` *How to apply per tool*: first bullet *"Run `akili routing` once per project (re-run when your plan or roster changes) …"*.
- `docs/cli.md`: `routing` row (`:77-84`), thirteen option rows (`:95-118`, `Commands` column `routing`), new `## Routing` section before `## Persona Drift` (`:301`): the question order, the flags, the six `AGENTS.md` states and tokens, provenance/`--force`/`--adopt`, the DD-9 commit hint, the packaged data files **not** being installed resources, the OpenCode v1 limit, the Cursor rung rule.
- `README.md`: `:428-441` table gains `akili routing`; `:53` and `:885-904` mention the command.
- `docs/flow.md:354-358`: fourth tenant row; `:350` sentence "three tenants" → four.
- `CHANGELOG.md` Unreleased: **minor** entry (one paragraph; every aggregate claim backed by a grep quoted in the Implementer report — KZ-002).
- **Closure sweep** (FR-9 scenario; Correction Closure rules): `grep -rn "three tenants\|three non-colliding\|three-tenant" docs README.md .claude` → 0 after edits; `grep -rn "edit only this registry table" docs README.md .claude` → fallback copy only; `grep -rn "Step 8C" docs README.md` → each hit re-read for "ask the user for their roster" phrasing that now describes the fallback (re-word or leave with reason, listed).

**Verification.**
1. For every "all five hosts" / "every host column" / "thirteen flags" sentence added: the grep that would falsify it, quoted as run (e.g. `grep -c "^  --" <(node bin/akili.js help | sed -n '/routing/,/^$/p')` ⇒ 13).
2. `grep -n "akili routing" AGENTS.md docs/model-routing.md docs/cli.md README.md docs/flow.md CHANGELOG.md .claude/commands/akili-audit.md` ⇒ ≥ 1 hit per file (quote).
3. `grep -n "^model:" .claude/commands/*.md` ⇒ empty. `git diff --check` clean.
4. `sed -n 428,445p README.md | grep -c "akili routing"` ⇒ 1.

**Falsifier.** Remove the `routing` row from `README.md:428-441` after writing it → check 4 returns `0` (red); write "twelve flags" in `docs/cli.md` → check 1's grep returns 13 ≠ 12 (red). Both executed and reverted.
**Red run.** n/a (prose); baseline greps at `8eb0227` recorded before editing (`grep -c "akili routing" <each file>` → 0).
**Disqualifier.** A CHANGELOG clause not quote-checked against the shipped text at HEAD is void (KZ-002 recurrence 5). A sweep that stops at the first hit per file is void — read every hit.
**Consumers.** `scripts/release.js` (reads `CHANGELOG.md` Unreleased — format unchanged), `.github/workflows/ci.yml` (no doc checks). `grep -rn "Unreleased" scripts/*.js` as run → quote.

**Done.** Every file in scope edited; sweep greps quoted at 0/expected; CHANGELOG entry quote-checked.
**Skills.** `cognitive-doc-design`, `caveman`.

---

### T8 — Closing validation on a scratch project (CLI) and the constitution delegation walk (Claude Code)

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M |
| Depends on | T1–T7; **T9** for the registry-content check of case 1; **T10/T11** for the closing record (pivot 2, 2026-10-02) |
| Requirements | FR-11 (all cases listed in the requirement; Validation blocked), FR-1 interactive scenarios on a real TTY (the accepted gap of §8 — closed here), FR-8 CLI-present scenario (zero TTY prompts) |
| Design refs | §5.6 states, §5.7, DD-6, DD-14, P-20 |
| Review | `full` — the only run on a real terminal and inside a real session |

**Scope.** In `mktemp -d` (not this repo), `git init`, scaffold `.agents/{leader,implementer,reviewer,tester}.md` (copies of `.claude/templates/*.md`), an `AGENTS.md` with prose and no section. Record every command and its output in `execution.md`:

1. Interactive happy path on a real TTY: `akili routing` → `1,5` → Claude `1,2,3` → Cursor: pick a family, type an id (e.g. `claude-opus-4-6`), tiers → invocations `Enter`/`agent` → wrappers `Y` → `A`. Count prompts (expect 7 + the Cursor placement question). Inspect `AGENTS.md`, both wrapper sets, the answers file.
2. Adjust round: re-run, `t`, `T3`, pick `sonnet` → rejection line → pick `opus` → `A`.
3. `akili routing --yes` → `no changes`; `git status --porcelain` empty.
4. Hand-edit one cell inside the fence → `akili routing --yes` → `refused (hand-edited fence; --force to regenerate)`, exit 1; `--force` → `overwritten`.
5. Replace the fence with an unfenced `## Model Routing` → `--yes` → `skipped (unfenced; --adopt to replace)`; `--adopt --yes` → `adopted`.
6. `rm AGENTS.md` → `--yes` → `created` + the constitution hint. Malformed fence (delete the close marker) → `refused (malformed fence)`, wrappers still written.
7. `--dry-run` on a changed roster → tree unchanged.
8. Single-model: `--hosts claude --models claude=sonnet --yes` → exit 0, `skipped (author ≠ auditor unsatisfiable)`, no Claude wrappers; `--t3-cross-host claude=antigravity` → three wrappers, no Reviewer.
9. `printf '' | akili routing` with no answers file → usage error, < 2 s (three runs, spread reported).
10. **Constitution walk** inside a Claude Code session on the scratch project: run `/akili-constitution` up to Step 8C; observe the agent asking in chat and running `akili routing … --yes --json`; confirm zero TTY prompts and that Step 9 reports from the JSON. Also walk the "older CLI" branch by pointing `PATH` at a `8eb0227` checkout's `bin/` → `Unknown command: routing` → the agent falls back.
11. Optionally (if a Cursor CLI is available): open the scratch project in `agent`, confirm `.cursor/agents/akili-reviewer.md` is listed and `readonly` holds — record as observed or `not exercised`.

**Verification.** Each numbered case has its expected token/exit code above; the evidence is the verbatim terminal output. **Falsifier:** case 4 is the live falsifier of the provenance check (a hand edit that is *not* refused fails the spec); case 3 is the live falsifier of idempotence.
**Red run.** n/a (validation).
**Disqualifier.** Any case run inside this repository (not the scratch dir) is void. Case 10 reported from the agent's narration rather than the observed command line and JSON is void — quote the command as run and the JSON keys. Case 9 with a single timing is inconclusive.
**Consumers.** none — this task writes only `execution.md`.

**Done.** Cases 1–10 recorded (11 recorded or marked `not exercised`); any blocked case parked `[~]` with the blocker named; FR-11 closed.
**Skills.** `systematic-debugging`, `caveman`.

---

---

### T9 — `deriveTiers` step 6: fixed per-tier notes only for packaged primaries (pivot, tdd)

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S |
| Depends on | T2 (added by the T8 Pivot Record, 2026-10-02 — user-approved) |
| Requirements | FR-3 statement (notes are part of the mapping) · FR-4 (registry cells render the mapping's notes) · FR-11 case 1 (the registry a user inspects must not pair a user id with another family's note) |
| Design refs | §5.3 step 6 **as amended**, §5.1 `hosts.<host>.notes` row **as amended**, §5.4 item 4 (dated ids footnoted — unchanged) |
| Review | `full` — a derivation rule change; the registry every project renders |

**Scope.** `bin/routing.js` `deriveTiers` step 6 (`:241-248` at `c3f3f09`): append the fixed per-tier note from `hostRegistry.notes[T]` only when the tier's final `primary` is a packaged id (an `id` present in `hostRegistry.models[]` with `source: "packaged"` in the roster) or a placeholder; never when the primary is a `source: "user"` id. Computed notes (`single-model roster`; the step-4 T3 note; the step-5 T4/T6 notes) are unchanged. `test/routing.test.js` (part 1 additions): (a) Cursor roster `claude-opus-4-6@T1+T3`, `composer-2@T2+T5`, `claude-sonnet-4-6@T4+T6` → no mapping note contains `family`; (b) Claude roster `claude-opus-4-20250514@T1` (+ reason) with `opus,sonnet,haiku` → T1 note does not contain `alias — always latest`; (c) the existing `sonnet`-only case keeps `*(must differ from T2)*` (packaged id — regression guard, already present); (d) full packaged roster per host still equals the packaged column including notes (existing every-host case must stay green).

**Verification.**
1. `node --test test/routing.test.js` ⇒ green. **Falsifier (executed):** restore the unconditional append → cases (a) and (b) go red (quote expected/actual); revert.
2. `node --test test/registry-drift.test.js test/routing-io.test.js` ⇒ unchanged green; `npm test` ⇒ green; `git diff --check`.
3. Live re-check in a `mktemp -d` scratch project: the T8 baseline command (`--hosts claude,cursor --models claude=opus,sonnet,haiku --models cursor=claude-opus-4-6@T1+T3,composer-2@T2+T5,claude-sonnet-4-6@T4+T6 --cli claude=claude --cli cursor=agent --wrappers yes --yes`) → `grep -c "Sol/Terra family\|Gemini 3.8 Flash family" AGENTS.md` ⇒ 0 for the Cursor cells holding user ids; `grep -c "alias — always latest" AGENTS.md` ⇒ still ≥ 1 (the packaged `opus` T1 cell keeps it).

**Red run.** Cases (a) and (b) observed red on the note assertion before the change (`actual: '…GPT-5.6 Sol/Terra family', expected: no match`).
**Disqualifier.** A test that asserts the note is empty is wrong — computed notes may legitimately remain; assert the absence of the fixed-note text only. The every-host packaged-column case must stay green unchanged — a change there means the rule over-fired on packaged ids.
**Consumers.** `renderRegistryTable`/`tableParts` (T3) render `mapping.<tier>.note` — no change expected; `test/routing.test.js` part 2/3 cases that snapshot notes — run them (check 1 covers the file).

**Done.** Rule in code; cases (a)–(d) green with (a)/(b) observed red first; live re-check quoted.
**Skills.** `tdd`, `caveman`.

---

### T10 — Constitution Step 8C: branch detection before composing the command; preview `--yes --dry-run`; Step 9 pairing wording (pivot 2, docs-only)

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S (rules document) |
| Depends on | T6 (added by the T8 Pivot Record 2, 2026-10-02 — user-approved) |
| Requirements | FR-8 **as amended** (older-binary branch detected via `akili help` before composing the command), FR-8 *CLI present* (zero TTY prompts — the preview must not fail without `--yes`), FR-8 Step 9 report |
| Design refs | DD-6 **as amended**; §5.7 (`--yes` required without a TTY) |
| Review | `full` — rules text other agents execute |

**Scope.** `.claude/commands/akili-constitution.md` Step 8C and Step 9 (then the summary doc `docs/commands/akili-constitution.md` and `docs/cli.md` / `docs/flow.md` wherever they name the fallback trigger — grep `Unknown command: routing`):
- **Branch detection first:** before step 2, probe `akili help` — its output lists `routing` on the new binary (6 lines) and not on an older one; `akili` not resolving is the absent branch. The three-branch table keys on that probe, and names both stderr forms an agent may still see: `ERROR: Unknown option '--project'` (older strict parser — fallback) and `ERROR: Unknown command: routing` (bare `akili routing` on an older binary — fallback). The sentence "Any other `ERROR:` line … is not a fallback trigger: fix the flags" is narrowed to a binary whose help *does* list `routing`.
- **Preview:** step 2's `--dry-run` preview is `--yes --dry-run` (without a TTY the CLI requires `--yes`; the preview still writes nothing); Q7's "`--yes` once accepted" re-worded accordingly.
- **Step 9:** the wrapper-pairing sentence states what the mapping yields — the Reviewer's model differs from the Implementer's (T3 ≠ T2); the Leader (T1) may share the Reviewer's model, and the Tester (T2) the Implementer's — instead of "Leader/Implementer vs Reviewer". `note` in `writes[]` is optional (absent when nothing to report). The Fallback's "Ask the same questions" → "reuse the answers already collected".
- Obligation sweep as in T6 (every Step 8C/8E/9 clause still present after the edits; the Fallback text untouched except the one phrase).

**Verification.**
1. `grep -n "akili help" .claude/commands/akili-constitution.md` ⇒ ≥ 1 in Step 8C; `grep -c "Unknown option '--project'" …` ⇒ ≥ 1; `grep -n "yes --dry-run\|--dry-run --yes" …` ⇒ ≥ 1.
2. Live probe on both binaries (scratch shims, never this repo): `akili help | grep -c routing` ⇒ `6` on HEAD's `bin/akili.js`, `0` on a `8eb0227` worktree's; the composed command on the old shim ⇒ stderr `ERROR: Unknown option '--project'`, exit 1 (quote).
3. `grep -rn "Unknown command: routing" .claude/commands docs README.md --exclude-dir=specs` — every hit re-read: each either names the bare-command form correctly or is re-worded (list).
4. `npm test` green; `git diff --check` clean.

**Falsifier.** n/a (prose) — baseline: `grep -c "akili help" .claude/commands/akili-constitution.md` at `fdaf8eb` → quote (expected 0 in Step 8C).
**Red run.** n/a (prose).
**Disqualifier.** A branch table that keeps `Unknown command: routing` as the *only* older-binary trigger is not fixed. A sweep that greps only the identifier and not the obligation ("how the agent learns the binary is old") is void.
**Consumers.** `docs/commands/akili-constitution.md` (summary), `docs/cli.md` Routing section, `docs/flow.md` Step 8C sentences — each grepped for the trigger wording and updated where it names it.

**Done.** Probe-first branch table; both stderr forms named; preview `--yes --dry-run`; Step 9 pairing wording; `note` optional; Fallback phrase; consumers consistent; live probe quoted.
**Skills.** `cognitive-doc-design`, `caveman`.

---

### T11 — `deriveTiers` step 6: discriminator by registry membership (pivot 2, tdd)

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S |
| Depends on | T9 (added by the T8 Pivot Record 2, 2026-10-02 — user-approved) |
| Requirements | FR-3 (notes part of the mapping), FR-4 (cells render the mapping's notes), FR-1 *Adjust a tier* (a re-pick of a packaged id must not strip sibling tiers' notes — T8 case 2) |
| Design refs | §5.3 step 6 **as corrected** (registry membership), §5.1 `hosts.<host>.notes` row |
| Review | `full` |

**Scope.** `bin/routing.js` `deriveTiers` step 6: replace the `source: "user"` test with registry membership — the fixed note is dropped only when `mapping[t].primary` is an **id** (not a placeholder `<CONFIRM…>`, not a cross-host `→ <other>`) that is absent from `hostRegistry.models[].id`. `test/routing.test.js`: (e) T8 case-2 regression — Claude roster `opus` placed as `source: "user", tiers: ["T3"]` with packaged `sonnet`, `haiku` → T1 note still contains `alias — always latest` and T3 note still contains `must differ from T2`; (a)/(b) from T9 stay green (Cursor ids and the dated pin are not in `models[]`); cross-host and every-host cases untouched.

**Verification.**
1. `node --test test/routing.test.js` ⇒ green (111 + 1). **Falsifier (executed):** restore T9's `source`-based condition → case (e) red (quote expected/actual); revert.
2. `npm test` ⇒ green; `git diff --check`.
3. Live: scratch project, `--hosts claude --models claude=opus@T3,sonnet,haiku --wrappers no --yes` → `grep -c "alias — always latest" AGENTS.md` ⇒ 1 and `grep -c "must differ from T2" AGENTS.md` ⇒ ≥ 1 (Claude cells).

**Red run.** Case (e) observed red on the `match` assertion before the change (`actual: ''`).
**Disqualifier.** A fix that keeps notes by checking `tiers.includes(t)` on the user entry (per-tier source) is not the amended rule — the rule is registry membership; a Cursor user id placed on T1 must still get no `Claude Opus family` note.
**Consumers.** `renderRegistryTable`/`tableParts` (no change); T9's two tests (must stay green).

**Done.** Rule in code; case (e) green with its red observed; T9 tests green; live counts quoted.
**Skills.** `tdd`, `caveman`.

## 3. Coverage Closure (scenario / clause → owner)

| Requirement · scenario / clause | Owner |
|---|---|
| FR-1 Two hosts happy path — section + wrappers + answers + summary lines | T3 (plan), T5 (files), T8 (live) |
| FR-1 · BUT no wrapper for unselected hosts · AND IT MUST ≤ 8 prompts | T3 · T4 (count), T8 (live) |
| FR-1 Adjust a tier · T3 = T2 rejected · any of T1–T6 | T4, T8 case 2 |
| FR-1 No TTY and incomplete answers · BUT never hangs · AND IT MUST succeed from the answers file | T4 (refusal), T5 (exit/message, timing), T8 case 9 |
| FR-1 Dry run · tokens · AND IT MUST byte-identical tree | T5, T8 case 7 |
| FR-2 Fully specified · byte-identical · exit 0 · BUT no prompt | T4 (answers deep-equal), T5 (io) |
| FR-2 Validation errors (each listed) · AND IT MUST validate before first write | T2 (grammar), T5 (no partial write) |
| FR-2 Mixed input · pre-fill · flags override | T4 |
| FR-3 Full roster = packaged column, every host · AND IT MUST deterministic | T2 |
| FR-3 Single-model · no wrappers · cross-host three wrappers · `--yes` exit 0 · BUT never Reviewer = Implementer | T2 (derive), T3 (plan tokens), T5 (exit), T8 case 8 |
| FR-3 Unknown id · placement prompt / `@T` required · dated id reason | T2 (grammar), T4 (prompts) |
| FR-4 Six states (a, a′, b, c, d, e, f) · tokens · CRLF · BUT never `CLAUDE.md` | T3 (all), T5 (exit codes), T8 cases 4–6 |
| FR-4 Unselected host keeps its column · mapping outside `hosts[]` · CLI row only confirmed | T3 |
| FR-5 table rows (five hosts) · opt-in · unsatisfiable/cross-host · Tester = T2 | T3 (render), T5 (`--wrappers`) |
| FR-5 Skip-by-default · `model drift` | T3 (plan), T5 (io) |
| FR-5 Restriction omitted and reported · BUT never copied from docs · OpenCode every run | T3 |
| FR-6 Idempotent re-run · `no changes` · `Updated:` from `updatedAt` · no run results in file | T3, T5, T8 case 3 |
| FR-6 Pre-fill · BUT user ids pre-checked | T4 |
| FR-7 Drift test · AND IT MUST red on one changed id | T1 |
| FR-8 CLI present · zero TTY prompts · Step 9 from JSON · BUT no terminal | T6 (text), T5 (`--json`), T8 case 10 |
| FR-8 CLI absent / older · fallback · same fence id · Step 9 says so | T6, T8 case 10 (older branch) |
| FR-8 Obligation sweep | T6 |
| FR-9 every SHALL · Aggregate-claim falsification | T7 |
| FR-10 tests green · `install`/`doctor` identical · `help` line · no `model:` · no deps | T5, T7 |
| FR-11 all cases · Validation blocked | T8 (case 1's registry-content check after T9) |
| FR-3 notes · FR-4 cells render only the mapping's notes (fixed note only for registry-known ids — pivot, corrected) | T9, T11 |
| FR-8 older-binary branch detected before composing the command (`akili help`) · preview `--yes --dry-run` · Step 9 pairing wording | T10 |
| NFR-1 · NFR-2 · NFR-3 · NFR-4 · NFR-5 · NFR-6 · NFR-7 · NFR-8 | T5 · T5/T8 · T3/T5 · T5 (CI) · T2–T4 · T5 · T1/T7 · T3 |

No gap is discharged by citing a different requirement; every clause above names the task that proves it.

## 4. Estimated LOC and PR Strategy

**~1,550 lines** (code ~640 · data/template ~220 · tests ~480 · prose ~210), matching the design budget. The spec exceeds ~400 LOC and mixes a CLI feature with rules-document edits, so **two PRs** are recommended on `master` (this repo releases direct-to-master; PRs are optional review boundaries):

- **PR 1 — CLI (T1–T5):** data files, `routing.js`, `akili.js` wiring, tests. Review first: `routing.js` §5.3 derivation and §5.6 states. Out of scope: constitution text.
- **PR 2 — Methodology (T6–T8):** constitution delegation, docs, CHANGELOG, validation evidence. Review first: the Step 8C obligation walk. Links back to PR 1.

Descriptions follow `cognitive-doc-design` review-empathy rules (what to review first, what is out of scope, previous/next link). Commit prefix on every commit: `[SPEC:changes/model-routing-configurator]`.
