# Tasks: OpenAI Codex CLI as a Fourth Install Target

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/codex-install-target` |
| Depth | Standard |
| Type | Change |
| Approval Mode | `gated` |
| Status | Draft — Phase 3 |
| Date | 2026-09-16 |
| Budget (design §9) | 7 tasks · ~560 lines (installer ~150 + regression script/CI ~95 code; rest prose) · 1 review round per task + 1 reserved |
| Design review | Judgment Day round 1: 5 confirmed severe + 3 verified suspects **fixed** (user chose Fix only; no re-judgment) — see `judgment.md` |
| Commit prefix | `[SPEC:changes/codex-install-target]` |

## 2. Task Graph

```
T1 (installer: registry flags, codex entry, args, doctor, init, help)
 ├─→ T2 (regression script + CI step)          ─┐
T5 (model-routing: Codex column, rows, pins)    │
 └─→ T3 (constitution 8C/8E/8F/9)              ─┤
T4 (execute / test / flow per-host paragraphs) ─┤
                                                ├─→ T6 (mirrors, root docs, CHANGELOG, closure sweep)
                                                └─→ T7 (live validation in Codex; may reopen T3 once — DD-12)
```

T1, T4, T5 are parallel-safe (disjoint files). T2 follows T1 (it exercises the new flags). T3 follows T5 (8E defaults cite the registry column). T6 follows T1/T3/T4/T5 (mirrors final text). T7 follows everything and is the closing gate. No circular dependencies.

**Global verification caveat.** Every grep below is a presence-assertion: it proves text landed, not that an agent following it behaves correctly. Prose executability has no automated check (accepted risk, `requirements.md` §8); the behavioral substitute is T7's live walkthrough. **A prose task may not report PASS on grep-green alone where its Done criteria name a walkthrough clause** — those clauses are queued for T7 and stay open until then.

**Concurrency.** T1 and T2 write `bin/akili.js` and `scripts/ci/`; no measurement command (`install --tool all`, doctor, regression script) runs while an Implementer is active (AGENTS.md concurrency rule).

---

### T1 — Installer: capability-flag registry, `codex` target, doctor, init, help

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | L |
| Depends on | none |
| Requirements | FR-1 (all four scenarios, every `BUT`/`AND IT MUST`), FR-2 (all three scenarios + clauses), FR-3 (all three scenarios + `BUT`), FR-4 (code half — the gate is T2), NFR-1, NFR-3, NFR-6 |
| Design refs | §3, §4, §5.1, §5.2, §7 rows 1–11, DD-1, DD-2, DD-4, DD-5, DD-11 |

**Scope.** `bin/akili.js` only:

- `defaultPaths.codex = ~/.codex`, `defaultPaths.codexSkills = ~/.agents/skills`.
- `TOOL_REGISTRY` entries take a `roots` object; add `commandsAsSkills: true` to `antigravity`; add the `codex` entry per §5.1 (`commands: []`, `skills: [skillsRoot]`, `resources: root/akili`, `legacyResources: null`, `commandsAsSkills: true`, `sharedSkillsRoot: true`).
- `getArgs`: `--codex-target`, `--codex-skills-target`; validation list gains `codex`; `--local` bases (`./.codex`, `./.agents/skills`); `--target` with `--tool codex` ⇒ single-root layout (`<path>/akili`, `<path>/skills`, DD-2).
- `selectedTools`/`ALL_TOOLS`: `all` = `claude, opencode, antigravity, codex`; `both` unchanged. `toolFlagFor`: `all` only for the full set; otherwise callers print one `doctor --tool <t>` hint per tool.
- `isToolInstalled`: when `sharedSkillsRoot`, probe = resources dir non-empty OR any `<skills>/akili-<cmd>/SKILL.md` exists for `cmd ∈ listCommands()`; never the raw skills dir.
- `getToolRegistryInfo`: build `roots`; Codex header prints config home and `skills → <root>`.
- `installTool`: `if (paths.commandsAsSkills)` replaces the Antigravity branch.
- `doctorTool --fix`: no `paths.commands[0]` access when `commands` is empty; restore command skills via the flag; delete the second Antigravity branch (CS-1).
- `cleanupLegacyFiles` + doctor STALE scan: skip `LEGACY_SKILLS` loops when `sharedSkillsRoot` (CS-2). Doctor prints one informational line if `~/.codex/skills/akili-*` exists (W-9).
- `RECOMMENDED_ENV`: `codex` row with `appliesTo: ["codex"]`; `checkEnvironment(tools)` filters; `withoutIt` names the vendor-ENOENT symptom and the `.cmd` caveat.
- Post-install hints: Codex restart line. `runInteractiveInit`: option 4 Codex, 5 Both, 6 All four; local/global assignment for both Codex roots. `printHelp`: `--tool` list, both new flags, examples.

**Verification.**
1. `node bin/akili.js install --tool codex --codex-target $T/codex --codex-skills-target $T/skills` on a temp home ⇒ 11 `akili-*/SKILL.md` + 24 skill dirs under `$T/skills`, resources under `$T/codex/akili`, **no** `commands/` dir anywhere (`find $T -type d -name commands` empty). Falsifier: a `commands` dir, or fewer than 35 `SKILL.md`.
2. Re-run without `--force` ⇒ every line `skip existing`, tree mtime unchanged; with `--force` ⇒ overwritten, zero `*.tmp` leftovers. Falsifier: any `install`/`overwrite` line on the second run.
3. Plant a foreign skill `$T/skills/gsap-core/SKILL.md` and `$T/skills/tdd/SKILL.md` (foreign content) ⇒ install without `--force` skips both and deletes neither; `doctor --tool codex` reports no `STALE` and exits 0. Falsifier: `gsap-core` gone, or exit 1.
4. `doctor --tool codex --fix` after deleting `$T/skills/akili-execute` ⇒ `FIXED`, file restored, no exception. Falsifier: a thrown `TypeError` from `path.join(undefined…)`.
5. Detection fixture: `$T/skills` populated with 5 foreign dirs, no `akili-*`, no `$T/codex/akili` ⇒ `akili update` (no `--tool`) does **not** list codex as auto-detected; add one `akili-execute/SKILL.md` ⇒ it does. Falsifier: codex detected in the first state.
6. `install --tool codex --target $T/single` ⇒ `$T/single/akili` and `$T/single/skills/...`; nothing outside `$T/single`. Falsifier: any write under `~/.agents`.
7. `--dry-run` writes nothing (`find $T -type f | wc -l` = 0) and lists `akili-*/SKILL.md` paths. `--commands-only` ⇒ exactly 11 `SKILL.md`; `--skills-only` ⇒ exactly 24 dirs, no `akili-*`.
8. `install --tool all --*-target <tmp>` ⇒ four `target:` blocks in registry order; verify hint `--tool all`. `install --tool both` ⇒ two blocks, hint `--tool both`. Auto-detected `{claude, antigravity}` fixture ⇒ two per-tool hints, no `--tool all`. Falsifier: `--tool all` hint printed for the pair.
9. Doctor on a runner without `codex` ⇒ Environment row NOT FOUND, exit 0; with `--tool claude` only ⇒ no `codex` row at all.
10. `grep -c 'tool === "antigravity"' bin/akili.js` = 0; `grep -n "^model:" .claude/commands/*.md` empty (NFR-3, NFR-6).
11. `npm run verify:cli`, `node --check bin/akili.js`, `git diff --check`.

**Disqualifiers.** Checks 1–9 run against **temp roots**; a run that touched the real `~/.agents/skills` or `~/.codex` invalidates the evidence (inspect with `find ~/.agents/skills -newer <marker>`). Check 3 passing because the foreign dirs were never created is not evidence — assert their presence before the install. Check 5 must be run in both states; one state alone proves nothing.

**Done.** All scope bullets land; the three shipping targets' install/doctor code paths are unchanged except through the flag (T2 proves it); verification 1–11 run with disqualifiers; help text and wizard reflect four targets.

**Skills.** `systematic-debugging` on any failing check; `caveman` for progress narration. No unit harness exists for the installer (`tdd` not applicable; verification is the scripted matrix above).

---

### T2 — Regression script + CI step (FR-4 gate, detection fixture)

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M |
| Depends on | T1 |
| Requirements | FR-4 scenario (all clauses incl. `BUT` SKIP), FR-1 auto-detection `BUT` (fixture), NFR-4 |
| Design refs | §7 row 24, DD-1 (gate), §8 defect table rows 1–4 |

**Scope.** New `scripts/ci/install-layout-regression.js` (Node, no deps, Windows-safe paths): for each of `claude`, `opencode`, `antigravity`: run `npx --yes akili-specs@2.23.2 install --tool <t> --target <tmp-a>` and `node bin/akili.js install --tool <t> --target <tmp-b>`; compare sorted relative file lists and SHA-256 per file; print a unified list of differences and exit 1 on any. Wrap the npx call: on network/registry failure print `SKIP: registry unreachable (<error>)` and exit 0. Then run the T1 check-5 detection fixture in-process and fail on a false positive. Add a `ci.yml` step after the symlink probe. Document the script in `docs/cli.md`'s CI/verification section (one paragraph).

**Verification.**
1. Run locally: three `IDENTICAL` lines, fixture `OK`, exit 0. Falsifier: temporarily rename a packaged skill dir ⇒ script must exit 1 naming the missing path; revert.
2. Simulate registry failure (`npm_config_registry=http://127.0.0.1:9` env) ⇒ `SKIP` line, exit 0.
3. CI run on all six matrix legs green, step visible in the log with three `IDENTICAL` (or `SKIP` with reason).

**Disqualifiers.** Three `IDENTICAL` lines produced because both sides were the working tree (npx resolving to a local link) is not evidence: the script must print the resolved version of side A (`npx … --version` or the banner) and it must read `2.23.2`. A `SKIP` on every CI leg means the gate never ran — report it as inconclusive, not PASS.

**Done.** Script + CI step merged; local run and CI evidence pasted into `execution.md`; `docs/cli.md` paragraph present.

**Skills.** `systematic-debugging` on failures; `caveman` narration.

---

### T3 — Constitution: Step 8C four hosts, 8E Codex wrappers, 8F Codex gate, Step 9

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | L |
| Depends on | T5 (registry column names the 8E defaults) |
| Requirements | FR-5 (scenario + `BUT`/`AND IT MUST`), FR-6 (both scenarios + `AND IT MUST`/`BUT`), FR-7 (Step 8C clause), FR-8 tenant scenario (table lives here and in flow.md), FR-9 Step 9 byte-cap line, NFR-3, NFR-5 |
| Design refs | §4 tenant table, §5.3, §5.4, §7 rows 11a–14, DD-6, DD-7, DD-8, DD-12 |

**Scope.** `.claude/commands/akili-constitution.md`:

- **Step 8C:** host list → four; "all three are install targets" → four; CLI-invocation rule gains `codex`; checklist line "all three are CLI install targets" → four (S-1).
- **Step 8E Codex bullet:** `.codex/agents/akili-{leader,implementer,reviewer,tester}.toml`; field table from §5.3 (name, description, developer_instructions → persona reference, model from the Codex column, model_reasoning_effort defaults, Reviewer `sandbox_mode = "read-only"`, mcp_servers omitted); effort mapping table (W-11) with "confirm enum live"; the model-driven-spawn note (DD-7: request the named role, wait for the consolidated result); pins (`Last verified: <date>` + subagents URL); `Unverified:` markers on `sandbox_mode` and spawn phrasing until T7.
- **Step 8F:** title drops "Claude Code only"; Codex variant: `.codex/hooks.json` shape, merge rules (read first, abort on invalid JSON, never clobber, idempotent), script location rule (`.codex/hooks/` unless `.claude/hooks/` copy exists), the **host-data table** (tool names, payload paths per host — Claude Code values filled from the existing script; Codex values `Unverified:` pending T7), the **fail-closed rule** for unparseable `tasks.md` writes, denial mechanism "decided live"; honesty note → enforced on Claude Code and Codex, instructional on OpenCode and Antigravity. The script text gains the host-table read and the fail-closed branch; denial text stays on stderr (W-10).
- **Step 9 + checklist:** summary names Codex wrappers, the Reviewer's "read-only by sandbox" state, the hook; tenant table (§4); one-line `AGENTS.md` byte-size check for Codex projects naming the config key to raise (R4).

**Verification.**
1. `grep -n "all three" .claude/commands/akili-constitution.md` ⇒ zero hits in Steps 8C/8E/9 and the checklist (each surviving hit must be justified inline). Falsifier: the checklist line still reads three.
2. `grep -c "sandbox_mode" …` ≥ 2 (field table + Step 9 wording); `grep -n "read-only" …` shows the Reviewer state named in Step 9. Falsifier: `sandbox_mode` present only in the table.
3. `grep -n "Last verified" …` ≥ 3 new pins (8E, 8F, tenant table); `grep -n "Unverified:" …` marks exactly the three live-decided items. Falsifier: a Codex behavior sentence with neither.
4. Fail-closed: read the scaffolded script text — for a `tasks.md` path with no extractable content the branch must exit 2 with a message, never `exit 0`. Falsifier: a `case` fall-through to `exit 0` still reachable for a `tasks.md` path.
5. Shell-syntax check of the scaffolded script (`bash -n` on the extracted block).

**Disqualifiers.** Greps 1–3 are presence-assertions. Whether an agent can follow the Codex 8E/8F text is proven only by T7's walkthrough; this task's PASS is provisional on that. A pin whose URL was not opened during this task is not a pin — record the fetch.

**Done.** All four steps updated; script block edited with the host table and fail-closed branch; pins recorded with fetch evidence; walkthrough clauses queued for T7.

**Skills.** `cognitive-doc-design` (tables over prose, progressive disclosure).

---

### T4 — `/akili-execute`, `/akili-test`, `docs/flow.md` per-host paragraphs

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M |
| Depends on | none |
| Requirements | FR-8 (Leader-inside-Codex scenario incl. `BUT` Unattended; tenant scenario — flow.md half), NFR-3, NFR-5 |
| Design refs | §7 rows 15, 16, 18, DD-7, DD-8 |

**Scope.**
- `akili-execute.md`: spawn-mechanics bullet for Codex (wrappers present ⇒ request `akili-implementer` / `akili-reviewer` by name with the brief; Codex spawns, routes, waits; consume the consolidated result; fallback without wrappers = sub-prompt seeded with the persona, as today); model checkpoint switch wording adds "`/model` and `/reasoning` in Codex" with a pin; Unattended Mode: "no verified equivalent" for Codex (OpenCode wording).
- `akili-test.md`: Tester spawn names Codex wrappers; its model checkpoint enumeration adds Codex (W-12).
- `docs/flow.md`: per-host launch paragraph adds "Codex: no claim"; `.agents/` resolution paragraph gains the Codex tenant (`.agents/skills/`) and the tenant table.
- `leader.md`: **no edit** (S-2) — assert.

**Verification.**
1. `grep -n "Codex" .claude/commands/akili-execute.md .claude/commands/akili-test.md docs/flow.md` ⇒ hits at the spawn bullet, both checkpoints, Unattended, flow launch, flow tenants. Falsifier: `akili-test.md` checkpoint line without Codex.
2. `grep -n "Codex" .claude/templates/leader.md` ⇒ empty (no edit). Falsifier: a hit.
3. `grep -n "Last verified" …execute.md` ≥ 1 next to the switch wording; `Unverified:` on the spawn phrasing.
4. `grep -n "^model:" .claude/commands/*.md` empty.

**Disqualifiers.** Presence-only; the spawn instruction's executability is T7's clause. If the pin URL was not opened, the claim is unpinned regardless of the text.

**Done.** Three files updated; leader.md untouched; walkthrough clause queued for T7.

**Skills.** `cognitive-doc-design`.

---

### T5 — `docs/model-routing.md`: Codex column, enforced-routing row, how-to-apply, CLI row

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S |
| Depends on | none |
| Requirements | FR-7 (registry half; scenario `BUT` no unconfirmed model), NFR-5 |
| Design refs | §7 row 19, DD-3, DD-8 |

**Scope.** Tier table gains a Codex column T1–T6 filled per DD-3 from the official Codex models page on the day of the edit (alias-first; families if no alias), each cell `<CONFIRM SLUG>`-marked where the roster could not be confirmed; `Why these models` paragraph for Codex; *Enforced routing* row (`.codex/agents/akili-*.toml`, `model` + `model_reasoning_effort`); *How to apply per tool* Codex bullet (`/model`, `/reasoning`); CLI-invocation row `codex`; cross-host host list; pin with URL + date at the column.

**Verification.**
1. Column present for all six tiers; no cell empty; Reviewer tier (T3) value ≠ Implementer tier (T2) value. Falsifier: T2 = T3.
2. Every Codex cell either matches a name on the pinned page (record the fetch) or carries `<CONFIRM SLUG>`. Falsifier: a bare model name absent from the fetched page.
3. `grep -n "codex" docs/model-routing.md` shows the CLI row and the enforced-routing row.

**Disqualifiers.** The user's `config.toml` value is not a source (DD-3). A page fetched from memory or a third-party blog is not the pinned page.

**Done.** Column, rows, bullet, pin landed; T7 re-confirms against the live `/model` roster and flips `<CONFIRM SLUG>` cells.

**Skills.** `cognitive-doc-design`.

---

### T6 — Mirrors, root docs, CHANGELOG, closure sweep

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M |
| Depends on | T1, T3, T4, T5 |
| Requirements | FR-9 (scenario + both `AND IT MUST` clauses — Step 9 line is T3's, asserted here), FR-1 `init`/help docs, FR-2 flag docs, NFR-5 |
| Design refs | §7 rows 20–23, DD-10 |

**Scope.** `docs/cli.md` (targets, flags incl. `--target` single-root note, layouts, detection paragraph, wizard, regression script paragraph if T2 did not add it); `docs/commands/akili-constitution.md`, `akili-execute.md`, `akili-test.md` mirrors at parity with T3/T4; `docs/commands/README.md`, `docs/README.md`, `README.md` (badge, prerequisites row, install matrix, "all four targets" note, invocation note `$akili-*`), `.claude/README.md` (intro + table), `CONTRIBUTING.md`, `AGENTS.md` Model Routing rule host list; `CHANGELOG.md` Unreleased → Added, minor, one entry in the repo's long-form style naming the deviations (no legacy cleanup; `--target` single-root) and the `Unverified:` items pending T7.

**Verification.**
1. Named pattern set (DD-10) over `*.md`, `bin/akili.js`, `scripts/` ⇒ every hit updated or justified in `execution.md`; known previous misses (`.claude/README.md:3,13`, `docs/cli.md:147`, `README.md:169`, wizard "All three") resolved. Falsifier: any hit without a justification line.
2. Install-target tables read by eye: `README.md`, `docs/cli.md`, `.claude/README.md` each list four rows.
3. Mirror parity: `diff <(sed -n '/Step 8E/,/Step 9/p' .claude/commands/akili-constitution.md) <(same on docs/commands/…)` empty for the edited steps (and the same for execute/test edited sections). Falsifier: any diff line.
4. `doctor --tool codex` on a fresh temp install reports 11/11 commands (the KZ-002 falsifier for the README claim).

**Disqualifiers.** A sweep run before T3/T4 final text is not closure — re-run after their last commit. "Justified" means a written reason per surviving hit, not silence.

**Done.** Sweep log in `execution.md`; parity diffs empty; CHANGELOG entry present.

**Skills.** `cognitive-doc-design`.

---

### T7 — Live validation in a current Codex CLI (closing gate; may reopen T3)

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M |
| Depends on | T1–T6 |
| Requirements | FR-10 (scenario incl. blocked case), FR-5 `AND IT MUST` (spawn model-driven + Reviewer cannot write), FR-6 scenario (gate fires; raw payload), FR-7 `BUT` (roster), FR-8 `BUT` (Unattended), design §4 tenant claim, DD-9 menu check |
| Design refs | §5.3, §5.4, DD-3, DD-7, DD-9, DD-12 |

**Scope.** Prerequisite (user): `npm install -g @openai/codex@latest` (local 0.66.0 is broken: vendor ENOENT); record `codex --version`. Then, in a scratch project with `akili install --tool codex --local` + a constitution run accepting 8E and 8F:

1. `/skills` lists `akili-*` and packaged skills; count visible AKILI entries vs 35; `$akili-propose` loads.
2. `/model` roster: confirm T5's column; flip `<CONFIRM SLUG>` cells; record aliases seen. `/reasoning` enum: confirm the W-11 mapping; adjust the table.
3. Run `/akili-execute` on a one-task spec: the Leader requests `akili-implementer`, then `akili-reviewer`; record how the spawn happened and how the result returned; confirm the Reviewer's model ≠ Implementer's and that the Reviewer could not write (attempt a write; expect denial).
4. Hook: capture the raw `PreToolUse` payload (script logs stdin to a temp file for this run only); attempt a `[x]` flip without PASS evidence ⇒ denied; record which denial mechanism worked. Fill the host-data table; remove `Unverified:` markers or replace them with the confirmed values. If tool names/paths differ from the table, **reopen T3** with a bounded delta (DD-12) and re-run this step.
5. Tenant claim: `.agents/leader.md` and `.agents/agents/` are not listed by `/skills`.
6. Unattended: check whether Codex exposes a goal/loop feature; if yes and verified, T4's "no verified equivalent" becomes a pinned claim — otherwise leave it.

**Verification.** Evidence block in `execution.md` with the Codex version and one line per item above (observed value, PASS/FAIL/inconclusive). Falsifiers are the items themselves: `akili-*` absent from `/skills`; Reviewer able to write; `[x]` write succeeding; a table value that did not match the payload.

**Disqualifiers.** A run on Codex 0.66.0 or any pre-skills release is not evidence (the surfaces do not exist there). Evidence from a session where the wrappers were not written (8E declined) does not cover step 3. If the reinstall is impossible, park `[~]` with the blocker (FR-10 blocked scenario), keep `Unverified:` markers, do not archive.

**Done.** All six items recorded; T3 reopened and closed if step 4 demanded it; `Unverified:` markers resolved or explicitly kept with reason; CHANGELOG entry amended to match.

**Skills.** `systematic-debugging` for any failing step; `caveman` for narration. Requires the user present (interactive Codex session).

---

## 3. Coverage Closure (scenario/clause → owning task)

| Requirement | Scenario / clause | Owner |
|---|---|---|
| FR-1 | Explicit install (THEN block, hints, `BUT` no writes elsewhere, `AND IT MUST` reject `--target`+`all`) | T1 (checks 1, 8) |
| FR-1 | `all` and `both` (order, `both` pair, `AND IT MUST` hint rule) | T1 (check 8) |
| FR-1 | Auto-detection (THEN, `BUT` shared root, `AND IT MUST` default) | T1 (check 5); fixture automated in T2 |
| FR-1 | Interactive init (option, local mapping) | T1 (wizard); docs T6 |
| FR-2 | Skip-by-default and force (THEN, AND atomic, `BUT` foreign skill) | T1 (checks 2, 3) |
| FR-2 | Dry run (THEN, `AND IT MUST` skill paths) | T1 (check 7) |
| FR-2 | Partial installs (commands-only, skills-only, `BUT` no commands dir) | T1 (checks 1, 7) |
| FR-2 | `--target` single-root layout | T1 (check 6); docs T6 |
| FR-3 | Healthy install (OK rows, exit 0, env version) | T1 (check 9), T7 (real binary) |
| FR-3 | Binary absent/broken (`BUT` no exit-code flip) | T1 (check 9) |
| FR-3 | Legacy manual copies (informational line) | T1 (W-9 line) |
| FR-4 | Three targets unchanged (THEN identical, `AND IT MUST` Windows, `BUT` SKIP on registry failure) | T2 |
| FR-5 | Constitution on Codex (THEN prefer wrappers + Step 9 names files/models/read-only; `BUT` no model in commands/installer; `AND IT MUST` model-driven spawn documented + pinned) | T3 (text), T7 (steps 3, 5), T1/T4 (NFR-3 greps) |
| FR-6 | Gate fires (THEN denied + message; `AND IT MUST` live + raw payload + host table + fail-closed; `BUT` no exit-0 fall-through) | T3 (text, fail-closed branch), T7 (step 4) |
| FR-6 | Corrupt hooks file | T3 |
| FR-7 | Audit sees no drift (THEN agree; `BUT` no unconfirmed name); Step 8C four columns | T5, T3 (8C), T7 (step 2) |
| FR-8 | Leader inside Codex (spawn text, checkpoint wording, `BUT` Unattended) | T4, T7 (steps 3, 6) |
| FR-8 | `.agents/` three tenants (table in flow + 8E) | T4, T3, T7 (step 5) |
| FR-9 | Aggregate claim falsification (`doctor` 11/11; `AND IT MUST` pattern-set sweep; `AND` Step 9 byte-cap line) | T6 (sweep, check 4), T3 (Step 9 line) |
| FR-10 | Live validation evidence; Validation blocked (`[~]`, `Unverified:`, no archive) | T7 |
| NFR-1 | Skip-by-default | T1 (check 2, 3) |
| NFR-2 | No fork of skill content | T1 (check 1: `diff -r .claude/skills $T/skills/<skill>` per skill empty) |
| NFR-3 | Host-neutral commands | T1 (check 10), T4 (check 4) |
| NFR-4 | CI matrix green | T2 (check 3) |
| NFR-5 | Claims dated | T3, T4, T5 (pin greps), T7 (marker resolution) |
| NFR-6 | Registry simpler | T1 (check 10) |

No clause is discharged by citing a different requirement; every row names the exact check.

## 4. Estimated LOC and PR Strategy

| Bucket | Lines |
|---|---|
| `bin/akili.js` | ~150 |
| `scripts/ci/install-layout-regression.js` + `ci.yml` | ~95 |
| Constitution (8C/8E/8F/9 + script block) | ~110 |
| execute / test / flow | ~35 |
| model-routing | ~30 |
| Mirrors, root docs, CONTRIBUTING, CHANGELOG | ~140 |
| **Total** | **~560** (matches design §9, re-summed at Phase 3) |

This repo ships direct-to-master with `[SPEC:…]` commits (release flow), so the PR split is advisory. If PRs are used: **PR 1** = T1 + T2 (installer + regression gate; reviewable by running the matrix), **PR 2** = T3 + T4 + T5 + T6 (methodology + docs; review the constitution diff first, mirrors are mechanical), **PR 3** = T7 evidence commit (execution.md, `Unverified:` resolutions, CHANGELOG amendment). Chained PR descriptions follow `cognitive-doc-design` review-empathy rules (what to review first, out of scope, links to previous/next).

**Recommended first task:** T1 (everything else either exercises it or documents it). T4 and T5 can run in parallel with it on separate worktrees if desired; T5 before T3.
