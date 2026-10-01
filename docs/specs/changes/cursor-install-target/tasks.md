# Tasks: Cursor as a Fifth Install Target

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/cursor-install-target` |
| Depth | Standard |
| Type | Change |
| Approval Mode | `gated` |
| Status | Draft — Phase 3 |
| Date | 2026-10-01 |
| Budget (design §9) | 8 tasks · ~700 lines (installer ~70 + fixtures/tests ~320 code; rest prose) · 16 review rounds (rules docs 2 each; code 1 each; margin 4) |
| Design review | Judgment Day round 1: 8 confirmed severe + 2 settled contradictions **fixed** (Fix only, no re-judgment) — `judgment.md` |
| Commit prefix | `[SPEC:changes/cursor-install-target]` |
| Format precedent | `docs/specs/archive/2026-09-17-changes--codex-install-target/tasks.md` |

## 2. Task Graph

```
T1 (installer: cursor entry, flags, detection, env row, init, help) ──→ T2 (installer tests + CI fixtures)
T7 (gate-script fixtures, RED on pre-change script)  ─┐
T4 (model-routing: Cursor column, rows, pins)        ─┼─→ T3 (constitution: Step 7 list, 8C, 8E, 8F script+entry, 9)
T5 (execute / test / flow per-host paragraphs)       ─┤
                                                      ├─→ T6 (mirrors, root docs, CHANGELOG, closure sweep)
                                                      └─→ T8 (live validation: Cursor IDE + CLI; may reopen T3 once — DD-12)
```

Waves: **T1 ∥ T4 ∥ T5 ∥ T7** (disjoint files) → **T2** (after T1) ∥ **T3** (after T4 and T7) → **T6** (after T1/T3/T4/T5) → **T8** (after everything). No circular dependencies. T7 precedes T3 because NFR-7's red run must execute against the **pre-change** script text.

**Global verification caveat.** Every grep below is a presence-assertion: it proves text landed, not that an agent following it behaves correctly. Prose executability has no automated check (`requirements.md` §8); the behavioral substitute is T8's live walkthrough. **A prose task may not report PASS on grep-green alone where its Done criteria name a walkthrough clause** — those clauses are queued for T8 and stay open until then.

**Concurrency.** T1/T2/T7 write `bin/akili.js`, `test/`, `scripts/ci/`; no measurement command (`install --tool all`, doctor, `npm test`, the regression script) runs while an Implementer is active (AGENTS.md concurrency rule).

**Environment masking (every task that runs the CLI).** Spawn with `HOME`, `USERPROFILE`, `CODEX_HOME`, **and `CURSOR_CONFIG_DIR`** pinned to a scratch directory; a run that touched the real `~/.agents/skills`, `~/.codex`, or `~/.cursor` invalidates the evidence (check with `find <real-root> -newer <marker>`).

**`skip-eligible` tasks: none.** Every task gets a Reviewer.

---

### T1 — Installer: `cursor` registry entry, symmetric shared-root detection, flags, env row, init, help

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | M |
| Depends on | none |
| Requirements | FR-1 (all four scenarios, every `BUT`/`AND IT MUST` — the symmetric-detection clause's **fixture** is T2's), FR-2 (layout, flags, `--local`, single-root; the shared-root/skip/dry-run **scenarios** are proven by T2), FR-3 (env row + `appliesTo` + row text; scenarios proven by T2), NFR-1, NFR-3, NFR-6 |
| Design refs | §3, §4, §5.1, §5.2, §7 rows 1–8 + the enumeration walk, DD-1, DD-2, DD-3, DD-5 |
| Review | `full` — shared detection logic touches Codex's auto-detect path; a wrong guard ships C1 in the other direction |

**Scope.** `bin/akili.js` only:

- `defaultPaths.cursor` (`CURSOR_CONFIG_DIR` when set and non-blank, else `~/.cursor` — the `CODEX_HOME` shape at `:117-126`), `defaultPaths.cursorSkills = ~/.agents/skills`.
- `TOOL_REGISTRY.cursor` per §5.1 (`commands: []`, `skills: [roots.skillsRoot]`, `resources: <root>/akili`, `legacyResources: null`, `commandsAsSkills`, `sharedSkillsRoot`, `detectByResourcesOnly`). **No other entry changes.**
- `TOOL_ROOT_ARGS.cursor`.
- `isToolInstalled` shared-root branch (`:392-405`): (a) return after the resources probe when `paths.detectByResourcesOnly`; (b) for a tool without the flag, run the command-skill probe only when no other `ALL_TOOLS` entry with `sharedSkillsRoot` resolving to the same skills root (resolved paths, `path.resolve`) has a non-empty resources dir. Keep the existing try/catch convention.
- `getArgs`: `--cursor-target`, `--cursor-skills-target`; validation list + message gain `cursor`; `--local` bases (`./.cursor`, `./.agents/skills`); `--target` with `--tool cursor` → single-root (`<path>/akili`, `<path>/skills`) as a second clause beside Codex's.
- `selectedTools` `all` and `ALL_TOOLS` append `cursor`. `toolFlagFor` untouched (`:451` derives from length).
- Post-install hint for Cursor (restart Cursor or open a new chat).
- `RECOMMENDED_ENV`: `cursor-agent` row, `appliesTo: ["cursor"]`, `withoutIt` names `agent` as the documented alias, `installHint` names both install commands (`curl https://cursor.com/install -fsS | bash`; Windows `irm 'https://cursor.com/install?win32=true' | iex`).
- `runInteractiveInit`: `5) Cursor`, `6) Both`, `7) All five`; local/global assignment for `cursorTarget`/`cursorSkillsTarget`.
- `printHelp`: `--tool` list, both flags, two examples.
- Re-run the enumeration walk after editing: `grep -n '"codex"' bin/akili.js` → every hit except `:1131` has a `"cursor"` sibling.

**Verification.**
1. `node bin/akili.js install --tool cursor --cursor-target $T/cursor --cursor-skills-target $T/skills` ⇒ 11 `akili-*/SKILL.md` + 24 skill dirs under `$T/skills`, resources under `$T/cursor/akili`, header line reads `$T/cursor (skills → $T/skills)`, **no** `commands/` dir anywhere. **Falsifier:** a `commands` dir, or fewer than 35 `SKILL.md`.
2. `CURSOR_CONFIG_DIR=$T/alt node bin/akili.js install --tool cursor --dry-run` lists resources under `$T/alt/akili`; with `--local` under `./.cursor/akili` regardless of the env var. **Falsifier:** `~/.cursor` in the dry-run output.
3. `install --tool cursor --target $T/single` ⇒ `$T/single/akili` and `$T/single/skills/…`; nothing outside. **Falsifier:** any write under `$T/skills` or `~/.agents`.
4. `install --tool all` (all five `--*-target` flags into `$T`) ⇒ five `target:` blocks in registry order, Cursor last, verify hint `--tool all`; `--tool both` ⇒ two blocks, hint `--tool both`; `--target` with `--tool all` ⇒ the existing rejection. **Falsifier:** four blocks; a `--tool all` hint for the pair.
5. Doctor on a runner without `cursor-agent` (`PATH=/usr/bin:/bin`) ⇒ Environment row NOT FOUND, both install commands shown, exit 0; `doctor --tool claude` ⇒ no `cursor-agent` row. **Falsifier:** exit 1, or the row printed for `--tool claude`.
6. `printf '5\n2\n' | node bin/akili.js init` (scratch cwd, env pinned) ⇒ a Cursor local install (`./.agents/skills` + `./.cursor/akili`); `printf '7\n1\n'` ⇒ all five. **Falsifier:** `5` producing Both.
7. `git diff 7cd681a -- bin/akili.js` shows no changed line inside the `claude`, `opencode`, `antigravity`, `codex` entries of `TOOL_REGISTRY` or `TOOL_ROOT_ARGS` (NFR-6). `grep -n "^model:" .claude/commands/*.md` empty (NFR-3).
8. `node --check bin/akili.js`; `npm run verify:cli`; `git diff --check`.

**Red run.** n/a (no unit harness for the installer; T2 adds subprocess tests and its detection fixture is the red/green pair for the DD-2 guard).
**Disqualifier.** Any check that ran with a real home root (unpinned env) is void. Check 4's five-block count passing because `--tool all` was read from an auto-detected set is not evidence — pass `--tool all` explicitly. Check 7 read by eye is not evidence: run the diff and quote the hunks' line ranges.
**Consumers.** `scripts/ci/install-layout-regression.js` (fixture env, `SHIPPING_TARGETS` unchanged), `docs/cli.md:18` (init numbering), `.github/workflows/ci.yml` (`--tool all` now five). `grep -rn '"codex"\|codex' scripts/ci test .github` as run → 8 hits, all `install-layout-regression.js`; 0 in `test/`.

**Done.** All scope bullets land; verification 1–8 run with disqualifiers; the enumeration walk re-run shows every `"codex"` site paired except `:1131`; help and wizard reflect five targets.
**Skills.** `systematic-debugging` on any failing check; `caveman` for narration.

---

### T2 — Installer tests and CI fixtures (shared-root pair, four-state detection, partials, doctor regression)

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M |
| Depends on | T1 |
| Requirements | FR-1 auto-detection scenario (all clauses incl. **symmetric**), FR-2 all three scenarios (shared root incl. `--force` and byte-identity with Codex; skip/foreign incl. the cleanup `BUT`; dry-run/partials incl. the `commands/` `BUT`), FR-3 all three scenarios (healthy; binary absent + `appliesTo`; Codex doctor unchanged), FR-4 (every clause), NFR-1, NFR-2, NFR-4, NFR-6 |
| Design refs | §7 rows 9–10, DD-2, DD-11 (Codex spec), §6 DD-2 row |
| Review | `checklist` — test code with explicit expected values; the Reviewer walks each FR clause to its assertion |

**Scope.**
- `test/install-cursor.test.js` (`node:test`, subprocess pattern of `test/agents-doctor-io.test.js:30-40`; every spawn pins `HOME`, `USERPROFILE`, `CODEX_HOME`, `CURSOR_CONFIG_DIR` to a `fs.mkdtempSync` dir):
  - **Shared-root pair:** `install --tool all` into one scratch home ⇒ Codex block installs; Cursor block reports 0 `install`/`overwrite` lines under the skills root and every skill file `skip existing` (210 files); sorted relative file lists of `--tool codex` alone vs `--tool cursor` alone are identical; `--force` end state equals a single-target install, zero `*.tmp`.
  - **Skip/foreign:** plant `tdd/SKILL.md` and `gsap-animation/SKILL.md` with foreign content before the run; second `install --tool cursor` without `--force` skips both and deletes neither; `doctor --tool cursor` exits 0.
  - **Dry-run/partials:** `--dry-run` writes 0 files and lists `akili-*/SKILL.md`; `--commands-only` ⇒ exactly 11 `SKILL.md`; `--skills-only` ⇒ exactly 24 dirs, no `akili-*`; no `commands/` dir in any mode.
  - **Four-state detection** (`akili update` with no `--tool`, parse the auto-detected line): foreign-only root → neither; + `akili-execute/SKILL.md` → codex yes / cursor no; + `<cursor>/akili/templates/leader.md` → cursor yes / **codex no**; + `<codex>/akili/templates/leader.md` → both.
  - **Doctor:** healthy Cursor install ⇒ all `OK`, exit 0; `doctor --tool cursor` with `PATH` stripped ⇒ NOT FOUND row, exit 0; `doctor --tool claude` ⇒ no `cursor-agent` row; **Codex regression:** `doctor --tool codex` stdout on a Codex-only fixture captured at `7cd681a` (`git stash`/worktree of the pre-change `bin/akili.js`) equals the post-change stdout byte-for-byte after ANSI strip.
  - **Byte identity (NFR-2):** `diff -r` of the installed skills tree vs `.claude/skills` + command files is empty.
- `scripts/ci/install-layout-regression.js`: extend the detection fixture (`:506-552`) to the four states, pin `CURSOR_CONFIG_DIR` beside `CODEX_HOME` (`:524`); `SHIPPING_TARGETS` unchanged.

**Verification.** `npm test` green locally with the env pinned; the regression script prints `FIXTURE OK` for all four states; CI matrix green (ubuntu/macos/windows × Node 18/22).
**Falsifier.** Revert T1's `isToolInstalled` guard (keep the rest) ⇒ state 3 reports codex detected → the detection test fails on *that* assertion. Delete `TOOL_REGISTRY.cursor.detectByResourcesOnly` ⇒ state 2 reports cursor detected → fails. Change the Codex header to drop `(skills → …)` ⇒ the identity test still passes (it compares trees, not output) — so the pair test must also assert the Cursor header string.
**Red run.** The detection test is written first and run against T1's tree with the guard temporarily removed: the expected/actual pair quoted by test name (`state 3: expected codex=false, actual true`). A `TypeError`/`ENOENT` before the assertion is not a red.
**Disqualifier.** A fixture whose foreign skills were never created (assert their presence first). A "Codex doctor unchanged" comparison whose baseline was captured after T1's edit. A windows leg where the content diff is CRLF-blind (record as `LAYOUT-IDENTICAL`, the POSIX legs carry content).
**Consumers.** `.github/workflows/ci.yml:44-53` (exercises the five-tool `all`); `test/agents-doctor-io.test.js` (pattern source, not modified).

**Done.** Tests cover every FR-1/2/3/4 clause listed above by name in a comment; red run recorded; CI green; the regression script's four-state fixture prints OK.
**Skills.** `tdd`, `systematic-debugging`, `caveman`.

---

### T7 — Gate-script fixtures: red on the pre-change script (runs before T3)

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S |
| Depends on | none (must complete **before** T3 edits the script) |
| Requirements | NFR-7 (every clause), FR-6(a) empty-content scenario (incl. the `BUT` on placement, proven by the `Edit`/`apply_patch` fixtures staying green) |
| Design refs | §5.4 script change, §6 DD-7 row, DD-7, §7 row 10a, P-7, P-13 |
| Review | `full` — the fixtures are the only automated gate for the silent-allow class; a tautological fixture here certifies the defect |

**Scope.** `test/tasks-gate.test.js`:
- Extract the script from `.claude/commands/akili-constitution.md` between the `   ```bash` fence following "Write the gate script" and the next `   ```` fence (block `:869-978` at `7cd681a`; the extractor asserts the first line is `#!/bin/bash` and the last is `exit 0`, so the two JSON fences at `:1045`/`:1069` can never be picked), de-indent 3 spaces, write to a temp file, `chmod +x`.
- Scratch spec dir `docs/specs/x/` with `tasks.md` holding one `[x]` and one `[ ]`, and `execution.md` **without** `PASS`.
- Fixtures (stdin JSON → expected exit code **after** T3; **before** T3, F2 and F3 exit 0 — the red; F1 already exits 2 at `7cd681a` because the `Write` arm reads `content` today, so it is a baseline wrapped the same way — *amended at execute time 2026-10-01, see `execution.md` T7 decisions*):
  | # | Host / tool | `tool_input` | After T3 |
  |---|---|---|---|
  | F1 | Cursor `Write`, `content` = tasks.md with a second `[x]` | `file_path`, `content` | 2 |
  | F2 | Cursor `Write`, `new_content` = same | `file_path`, `new_content` | 2 |
  | F3 | Cursor `Write`, neither field | `file_path` only | 2 |
  | F4 | Claude Code `Edit`, `old_string: "[ ]"`, `new_string: "[x]"` | — | 2 (unchanged) |
  | F5 | Claude Code `Edit`, `new_string: ""` (deletion) | — | 0 (unchanged) |
  | F6 | Claude Code `Write`, `content` with no new `[x]` | — | 0 (unchanged) |
  | F7 | Codex `apply_patch`, removal-only hunk on tasks.md | `command` | 0 (unchanged) |
  | F8 | Codex `apply_patch`, adds `[x]` | `command` | 2 (unchanged) |
  | F9 | F1 with `execution.md` containing `PASS` | — | 0 |
  | F10 | F3 but `file_path` outside `docs/specs/` | — | 0 |
- `jq` guard: on `process.platform !== "win32"`, a missing `jq` **fails** the test with a named reason; on win32 it skips with the reason printed.

**Verification.** `node --test test/tasks-gate.test.js` on the pre-change script: F2–F3 → exit 0 (red, quoted per fixture as `expected 2, actual 0`), F1 → 2 (baseline — already denied today), F4–F10 → their listed codes (baseline). After T3: all ten at their listed codes.
**Falsifier.** On the post-T3 script, revert the empty-content branch ⇒ F3 exits 0 → red. Move the deny after `esac` ⇒ F5 and F7 exit 2 → red. Remove the `new_content` candidate ⇒ F2 exits 2 for the wrong reason (empty content) — so F2's assertion also checks stderr does **not** contain "no readable new content".
**Red run.** F2–F3 observed `0` on the pre-change script, by fixture name, before T3 starts; F1 observed `2` (baseline); recorded in `execution.md` with the quoted pairs.
**Disqualifier.** A red that is a `jq: command not found` or an extraction failure is not a red. A green F5/F7 whose fixture never reached the `Edit`/`apply_patch` arm (wrong `tool_name`) proves nothing — assert the arm via a stderr marker or a deliberately failing variant.
**Consumers.** `.claude/commands/akili-constitution.md:869-978` (extraction source), `docs/commands/akili-constitution.md` mirror (T6 keeps it identical; the test extracts from the canonical file only).

**Done.** Ten fixtures, red run recorded for F2–F3, baseline recorded for F1 and F4–F10, `jq` guard behaves as specified, `npm test` includes the file.
**Skills.** `tdd`, `systematic-debugging`, `caveman`.

---

### T4 — Model Routing registry: Cursor column, enforced-routing row, effort mapping, invocation row, pins

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S |
| Depends on | none |
| Requirements | FR-7 (registry half; the Step 8C half is T3), NFR-5 |
| Design refs | §5.5, DD-8, DD-9, §7 row 19 |
| Review | `full` — the registry is what `/akili-audit` and every project's Step 8C copy are compared against; a wrong cell propagates |

**Scope.** `docs/model-routing.md`:
- Tier table (`:118-125`): a **Cursor (family · effort param)** column between Codex and Fallback; cells per DD-8, every slug `<CONFIRM SLUG>`; `*(≠ T2 — different vendor)*` on T3.
- *Enforced routing* table (`:488-493`): `.cursor/agents/akili-{leader,implementer,reviewer,tester}.md` row — `model:` concrete ID + optional `[effort=…]`; Reviewer `readonly: true`.
- Effort subsection: the Cursor mapping table (§5.5) with the `<CONFIRM>` rung note.
- *How to apply per tool*: Cursor bullet (`/model` in the `agent` CLI, pinned; the IDE half `UNVERIFIED` until sourced — *amended at execute time 2026-10-01, see `execution.md` T5*).
- CLI-invocation table: `cursor` row — `agent` (also `cursor-agent`), commands invoked `/akili-<name>`.
- *Why these models*: Cursor paragraph (multi-vendor roster; cross-vendor author ≠ auditor; plan gating; no floating alias besides `auto`).
- Pins: every Cursor claim `Last verified: 2026-10-01` + URL (<https://cursor.com/docs/models>, <https://cursor.com/docs/context/subagents>, <https://cursor.com/docs/cli/overview>).

**Verification.** `grep -c "Cursor" docs/model-routing.md` ≥ 8 and each of the six sites above quoted; `grep -n "Last verified: 2026-10-01" docs/model-routing.md` ≥ 3; the tier table has 7 columns on every row (`awk -F'|' 'NR>=118 && NR<=126 {print NF}'` all equal).
**Falsifier.** Delete the T3-cell `≠ T2` marker ⇒ the Reviewer's walk of FR-7's "author ≠ auditor across vendors" fails. Put a slug without `<CONFIRM SLUG>` ⇒ FR-7's `BUT` clause fails.
**Red run.** n/a (no test gate).
**Disqualifier.** A column count that passes because the row count range was wrong after insertion — re-anchor the row range after editing, then run the awk.
**Consumers.** `.claude/commands/akili-constitution.md` Step 8C (T3 cites the column), `/akili-audit` Model Registry Drift (reads the table), `docs/README.md:10,43` (T6).

**Done.** Six sites present and quoted; pins present; table well-formed; no slug asserted beyond the pricing page.
**Skills.** `cognitive-doc-design`, `caveman`.

---

### T3 — Constitution: Step 7 template list, Step 8C five hosts, Step 8E Cursor bullet, Step 8F script + entry + honesty note, Step 9 + checklist

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | L |
| Depends on | T4 (8E defaults cite the column), T7 (fixtures must be red before this edit) |
| Requirements | FR-5 (scenario + every clause), FR-6 (a, b, c; empty-content scenario green; corrupt/foreign scenario as prose walkthrough), FR-7 (Step 8C half), FR-8 tenant-row cell (`:818`), FR-9 (Step 7 list `:411-416`), NFR-5, NFR-7 (green half) |
| Design refs | §4, §5.3, §5.4, §5.5, DD-4, DD-6, DD-7, DD-9, DD-12, §7 rows 11–15, P-6, P-9, P-9b, P-16, P-17, P-18, P-20, P-21 |
| Review | `full` — rules document other agents execute; 2 rounds budgeted |

**Scope.** `.claude/commands/akili-constitution.md` only (mirror is T6):
- **Step 7 (`:411-416`):** Cursor line — `./.cursor/akili/templates/…` (local) / `$CURSOR_CONFIG_DIR` if set, else `~/.cursor/akili/templates/…` (global).
- **Step 8C (`:523-524`):** "all four" → five hosts naming Cursor; invocation rule gains Cursor (`agent`; `/akili-<name>` — pin).
- **Step 8E:** Cursor bullet after Codex: file list, the field table (§5.3), `readonly: true` on the Reviewer only with the "no file edits, no state-changing shell commands" quote and the no-command-needed note (P-18), the precedence sentence quoted (P-9), the alias caveat with the `UNVERIFIED` marker (P-9b), the depth-limit sentence (P-8), effort mapping (§5.5), rules 1–4 unchanged. Tenant table row `:818` cell text → both tenants / both `--local` commands.
- **Step 8F:** (1) script `Write` arm (`:933-935`): candidate reads `content` then `new_content`; empty-content deny for tasks.md targets with the host-neutral reason, **inside the `Write` arm**; `Edit` arm and `apply_patch` untouched byte-for-byte. (2) Terminal-branch enumeration (`:980-990`): +1 `exit 2`. (3) Host-data table (`:1005-1008`): Cursor row per §5.4 (old = file on disk; new = unverified field, candidates named). (4) New sub-step after the Codex one: the Cursor one-question rule (DD-6) — Claude entry first; ask about the import toggle; native entry only on off/unknown with `version: 1`, `matcher: "Write"`, `failClosed: true`, resolved script path (existing `.claude/hooks/` → existing `.codex/hooks/` → write `.cursor/hooks/`); all four merge clauses restated; pin. (5) Honesty note (`:1099-1106`): enforced on Claude Code and Codex; **pending live validation** on Cursor (three contracts named); instructional on OpenCode and Antigravity; the imported path's fail-open default named. (6) Mode policy: never overwrite an existing `.cursor/hooks.json` entry.
- **Step 9 (`:1128-1131`) + checklist (`:1158-1160`):** Cursor wrapper summary (four files, two models, Reviewer `readonly: true`), hook summary (import-toggle answer; which entry exists; "pending live validation").
- Pre-review restatement sweep (KZ-changes--kaizen-loop-closure-2): grep the file for `four`, `all four`, `Claude Code and Codex`, `two host entries`, `one script, two host` and judge every hit — `:866` "one script, two host entries" becomes three.

**Verification.**
1. `node --test test/tasks-gate.test.js` ⇒ F1–F10 all at their post-T3 codes (T7 flips green). **Falsifier:** F3 → 0, or F5/F7 → 2.
2. Diff of the fenced script vs `7cd681a`: hunks only inside the `Write` arm (`git diff -U0 7cd681a -- .claude/commands/akili-constitution.md` restricted to `:869-978` shows no `-` line in `:929-932` or in the `apply_patch` branch).
3. Each of the eleven scope sites quoted in the Reviewer brief with its line at HEAD; `grep -c "Last verified: 2026-10-01" .claude/commands/akili-constitution.md` ≥ 5; `grep -n "UNVERIFIED — confirm at source" .claude/commands/akili-constitution.md` ≥ 1 (the alias caveat).
4. Restatement sweep hits listed with a disposition each.
5. Walkthrough (held-out case, queued to T8): a Cursor-only project with no `.claude/settings.json` — the text must lead the agent to write the Claude entry first, ask the question, then act on the answer; a project whose `.cursor/hooks.json` is invalid JSON — the text must stop it.

**Red run.** T7's F2–F3 red (recorded before this task) → green here, quoted per fixture; F1 stays green (baseline).
**Disqualifier.** Check 1 green with F2–F3 never having been red (T7 not run first) is not evidence of the fix — it is evidence the fixture is inert. Check 2 passing because the diff range was mis-anchored after insertion — re-anchor first.
**Consumers.** `test/tasks-gate.test.js` (extracts the block — the fence must still start with `#!/bin/bash` and end with `exit 0`), `docs/commands/akili-constitution.md` (T6 mirror), `docs/flow.md:358` (T5 keeps the tenant cell in step), `docs/cli.md` Step 8F prose (T6).

**Done.** All scope sites land; verification 1–4 run with disqualifiers; check 5's walkthrough clauses recorded as open until T8; the `Write`-arm-only constraint proven by check 2.
**Skills.** `cognitive-doc-design`, `systematic-debugging`, `caveman`.

---

### T5 — Per-host guidance: `/akili-execute`, `/akili-test`, `docs/flow.md`

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S |
| Depends on | none |
| Requirements | FR-8 (Leader-inside-Cursor scenario incl. the Unattended `BUT`; tenants scenario incl. the flow.md cell `:358`), NFR-3, NFR-5 |
| Design refs | §7 rows 16–18, DD-9, P-8 |
| Review | `checklist` — three bounded sites per file, each a sibling of an existing Codex paragraph |

**Scope.**
- `.claude/commands/akili-execute.md`: spawn bullet after Codex (`:60`): with `.cursor/agents/` wrappers present, invoke the named subagent (`/akili-implementer` mention or by role; Cursor's Task tool launches it; several Task calls in one message run in parallel); the depth limit sentence; otherwise fall back to a sub-prompt seeded with the persona. Model checkpoint (`:88`): "`/model` in Cursor". Unattended Mode (`:366`): "no verified equivalent for Cursor; its `goal`/`loop`/`autopilot` built-ins are recorded by the install spec's live validation, not relied on." Pins.
- `.claude/commands/akili-test.md`: Tester spawn bullet (`:56`) and checkpoint wording (`:85`), same shape.
- `docs/flow.md`: per-host launch (`:254`) Cursor sentence; `.agents/` paragraph (`:350`) — Cursor reads `.agents/skills` plus `.claude/skills`, `.claude/agents`, `.codex/agents` via compatibility roots, adds no tenant; tenant-row cell (`:358`) → both tenants; registry sentence (`:391`) five hosts.

**Verification.** `grep -n -i cursor` on each file ≥ 3, 2, 4 respectively, each hit quoted; `grep -n "^model:" .claude/commands/*.md` empty; `grep -c "Last verified: 2026-10-01"` ≥ 1 per file.
**Falsifier.** Remove the depth-limit sentence ⇒ the Reviewer's walk of FR-8's spawn obligation fails. Write "Cursor's `loop` runs unattended" ⇒ the Unattended `BUT` fails.
**Red run.** n/a (no test gate).
**Disqualifier.** A grep count met by the word "cursor" in an unrelated sense (e.g. "text cursor") — quote each hit.
**Consumers.** `docs/commands/akili-execute.md`, `docs/commands/akili-test.md` (T6 mirrors), `.claude/templates/leader.md` (enumerates no hosts — no edit; verify with `grep -ci codex .claude/templates/leader.md` → 0).

**Done.** All sites land and are quoted; mirrors queued for T6.
**Skills.** `cognitive-doc-design`, `caveman`.

---

### T6 — Mirrors, root docs, CHANGELOG, closure sweep

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M |
| Depends on | T1, T3, T4, T5 |
| Requirements | FR-9 (scenario + every `AND IT MUST`), FR-1 init-renumbering note, FR-3 row text in docs, NFR-2 (CHANGELOG wording), NFR-5 |
| Design refs | §7 rows 20–22, DD-10, DD-11 |
| Review | `full` — summary surfaces inherit the artifacts' evidence bar (KZ-002, five recurrences); every clause is quote-checked at HEAD |

**Scope.**
- Mirrors at parity: `docs/commands/akili-constitution.md`, `docs/commands/akili-execute.md`, `docs/commands/akili-test.md` — `diff` against the canonical files' changed sections empty.
- `docs/cli.md`: `--tool cursor` row, `--cursor-target`, `--cursor-skills-target`, `--local` mapping, install-target block, init numbering (`:18`: 5 Cursor / 6 Both / 7 All five — note the input change), Doctor section (`cursor-agent` row), **new section** "Shared and compatibility skill roots (Codex, Cursor, Claude Code)" naming the DD-2 detection rule and the Claude Code + Cursor overlap (P-19), CI section (four-state fixture), troubleshooting restart line.
- `README.md`: badge; intro sentences (`:14`, `:40`); canonical note (`:61`); prerequisites row (`:135`); target table row + "All" cell (`:164-171`); doctor example; restart line (`:242`); invocation note (`:246`).
- `docs/README.md:3,10,43`, `docs/commands/README.md:3`, `.claude/README.md:3-10` (table row + "four tools"), `AGENTS.md:3,7,11,37`, `CONTRIBUTING.md` (1 hit).
- `CHANGELOG.md` Unreleased: minor entry — new target, shared root, detection rule, env row, init renumbering (`5`/`6` change meaning), gate `Write`-arm change, Step 8E/8F Cursor, registry column, "pending live validation" wording; **no clause states an outcome T8 has not produced**.
- **Closure sweep (FR-9):** run exactly `git grep -nE "<pattern>" -- '*.md' '*.js' '*.yml' ':!docs/specs' ':!releases'` (baseline 53 lines / 18 files); every remaining line is either updated or listed with a justification (keeps: `.claude/skills/**` 3 lines; `test/agents-doctor.test.js:569`); plus the obligation-keyed pass over sentences obliging "all install targets" without a number.

**Verification.** The sweep command's output after the task, pasted in full, with each surviving line dispositioned; `diff` of each mirror's changed sections vs canonical = empty; `doctor --tool cursor` on a fresh scratch install reports 11/11 commands (the KZ-002 falsifier for "every command is installed as a Cursor skill"); each CHANGELOG clause quote-checked against the shipped text at HEAD (file + line per clause).
**Falsifier.** Leave `AGENTS.md:7` "all four install targets" ⇒ the sweep lists it. Write "enforced on Cursor" in the CHANGELOG ⇒ the quote-check against `akili-constitution.md`'s honesty note fails.
**Red run.** n/a.
**Disqualifier.** A sweep run with a different pattern or scope than FR-9's is not the sweep — paste the command. A CHANGELOG clause verified against the *design* rather than the shipped file is not verified.
**Consumers.** `scripts/release.js` (reads CHANGELOG Unreleased at release time — format unchanged), `docs/specs/kaizen-log.md` keeps (none).

**Done.** Sweep output clean or dispositioned; mirrors identical; CHANGELOG clauses quote-checked; `doctor` 11/11 recorded.
**Skills.** `cognitive-doc-design`, `caveman`.

---

### T8 — Live validation in Cursor (IDE and CLI separately)

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M |
| Depends on | T1–T7 |
| Requirements | FR-10 (every item in the list; blocked scenario), FR-6 gate scenario (deny **and** allow; candidate mechanisms), FR-5 effort/alias observations, FR-8 walkthrough clauses queued by T3/T5, settles P-6, P-9b, P-12, P-16, P-17, P-18, P-19, P-20 |
| Design refs | DD-7 (candidate mechanisms, fallback), DD-12, §10 `UNVERIFIED` rows |
| Review | `checklist` — evidence collection; the Reviewer checks each ledger row has an observation, not a summary |

**Scope.** On this machine (Cursor IDE + `cursor-agent` 2026.09.26 or newer; record both versions and `which agent cursor-agent`):
1. `akili install --tool cursor` (real home, after a backup listing of `~/.agents/skills` and `~/.cursor`); `doctor --tool cursor` 11/11 + 24/24.
2. IDE and CLI, each: `/` picker shows `akili-propose`, `akili-execute`; one loads; whether any `/akili-*` fires unasked across a 10-turn session; duplicate-skill display when `~/.claude/skills/tdd` and `~/.agents/skills/tdd` both exist (P-19); picker truncation with the 40+ foreign skills present.
3. A scratch project with `/akili-constitution` Step 8E (Cursor) and Step 8F (Claude entry; answer the import question "on"): Reviewer spawned on a model ≠ Implementer; `readonly: true` denies a write; whether a read-only verification command runs (P-18); alias case — a second scratch project with only `.claude/agents/` wrappers (P-9b).
4. Gate: add a `preToolUse` logging hook beside the imported entry to capture the **raw payload** (every top-level field, `tool_input` keys, `cwd` — P-6, P-16, P-20); flip one `[x]` on a `tasks.md` that already holds `[x]` entries **without** PASS → expect deny; **with** PASS → expect allow (P-17). If the allow is blocked, try DD-7's mechanisms in order and record which Cursor honors. If the no-PASS write succeeds, record the payload shape and reopen T3 once (DD-12).
5. CLI (`agent`): repeat 3–4 headlessly where possible (`-p`); record divergences.
6. Built-ins `goal`/`loop`/`autopilot`: describe observed behavior; no Unattended Mode claim unless one loops a condition.
7. Write every observation into `execution.md` under `## Live validation`, one line per ledger row (`P-n: <observed> — <verdict>`), and flip the corresponding markers in the constitution/docs (`UNVERIFIED` → pinned observation, or kept with the reason) and the honesty note ("pending" → "enforced" only if 4 produced both outcomes).

**Verification.** Each FR-10 list item has an observation with a version stamp; each `UNVERIFIED` row has a verdict line; the honesty note's final wording matches the observed outcome.
**Falsifier.** A gate "deny" observed on a `tasks.md` with **no** prior `[x]` proves nothing about P-16 — the fixture must already hold `[x]` entries. An "allow" observed without PASS evidence present is a FAIL of the gate, not a pass of P-17.
**Red run.** n/a (observational).
**Disqualifier.** Any observation without the Cursor version. A payload capture from a *native* hook when the question is the *imported* path. A session where the import toggle state was not checked first.
**Consumers.** `.claude/commands/akili-constitution.md` markers (T3's text), `docs/cli.md` (T6), `CHANGELOG.md` (final wording), `docs/specs/changes/cursor-install-target/design.md` §10 (closed rows noted in `execution.md`, never edited in the approved design).

**Done.** All observations recorded; markers flipped or kept with reason; T3 reopened at most once; blocked items parked `[~]` with the blocker named.
**Skills.** `systematic-debugging`, `caveman`.

---

## 3. Coverage Closure (scenario / clause → owner)

| Requirement | Scenario / clause | Owner |
|---|---|---|
| FR-1 | Explicit install (block, hints, `BUT` no other homes, `AND` `--target`+`all` rejected) | T1 (code) · T2 (test) |
| FR-1 | `all` and `both` (order, pair, hint rule incl. `{codex, cursor}` pair) | T1 · T2 |
| FR-1 | Auto-detection (resources; `BUT` skills-root/command-skill; **symmetric**; first-run default) | T1 (guard) · T2 (four states) |
| FR-1 | Interactive init (5/6/7, input change recorded, local mapping) | T1 · T6 (CHANGELOG, `docs/cli.md:18`) |
| FR-2 | Shared root (`--tool all` once; `--force`; `BUT` no second copy; identity with Codex) | T2 |
| FR-2 | Skip/foreign (`BUT` no deletion) | T2 |
| FR-2 | Dry-run/partials (`BUT` no `commands/`) | T2 |
| FR-3 | Healthy · binary absent (`BUT` exit, `AND` no row for claude, row text) · Codex doctor unchanged | T1 (row) · T2 (tests) |
| FR-4 | Shipping targets unchanged; pair fixture (a–c); four states; env pinned; doctor before/after; `BUT` SKIP; Windows | T2 |
| FR-5 | Constitution on Cursor (prefer wrappers; `BUT` no `model:`; precedence + alias `UNVERIFIED`; `readonly` note) | T3 · T8 (alias, readonly observations) |
| FR-5 | Effort mapping (`BUT` no unconfirmed rungs) | T3 · T4 · T8 |
| FR-6 (a) | `Write` arm candidates; empty-content deny; `Edit`/`apply_patch` unchanged | T7 (red) · T3 (green) |
| FR-6 (b) | Claude entry first; one question; native entry shape; resolved script; merge clauses; Step 9 record | T3 · T8 (walkthrough) |
| FR-6 (c) | Honesty note "pending" → flipped by FR-10 | T3 · T8 |
| FR-6 | Gate fires (deny; allow; raw payload; `BUT` no fall-through; candidate mechanisms) | T8 (live) · T7 (`BUT`, offline) |
| FR-6 | Empty-content (`Write` only; existing fixtures same codes; `BUT` placement) | T7 · T3 |
| FR-6 | Corrupt/foreign hooks file (abort; append with `failClosed`; foreign survives) | T3 (text) · T8 (walkthrough) |
| FR-7 | Registry column, rows, bullets, pins; Step 8C five hosts; `BUT` no unconfirmed name | T4 · T3 (8C) |
| FR-7 | Audit sees no drift | T4 (table) — audit itself out of scope |
| FR-8 | Leader inside Cursor (spawn, `/model`, `BUT` Unattended) | T5 |
| FR-8 | Tenants unchanged (no row; cell text `:818` / `:358`) | T3 (`:818`) · T5 (`:358`) |
| FR-9 | Pins; five targets; `docs/cli.md` overlap section; sweep with exact command and keeps; Step 7 list; checkpoint keeps | T6 · T3 (Step 7 list) |
| FR-10 | Every list item; blocked scenario | T8 |
| NFR-1 … NFR-7 | per the index | T2 (1, 2, 4, 6) · T1 (3, 6) · T6 (5) · T7/T3 (7) |

No clause is discharged by citing a different requirement; every row names the clause it covers.

## 4. Estimated LOC and PR Strategy

**~700 lines** (code ≈ 390: installer ~70, installer tests ~150, gate tests ~90, regression fixture ~80; prose ≈ 310). Above the ~400-line threshold, but this repository ships direct-to-master with per-task `[SPEC:…]` commits (release flow), so a single branch with **two reviewable boundaries** is recommended rather than two PRs: **boundary 1 — installer + tests** (T1, T2, T7: code only, CI-verifiable), **boundary 2 — methodology + docs** (T3, T4, T5, T6), with T8 closing. If the user prefers PRs, split on exactly those boundaries; PR 2's description names what to review first (Step 8F script arm, Step 8E bullet), what is out of scope (T8 evidence), and links PR 1.
