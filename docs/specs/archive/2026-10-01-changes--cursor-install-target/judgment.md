# Judgment Day — `changes/cursor-install-target` design review

| Field | Value |
|---|---|
| Target | `design.md` (Phase 2 draft, 2026-10-01) reviewed with `requirements.md`; `proposal.md` as context — immutable during judgment |
| Mode | `judgment_day` — two blind read-only judges, identical scope and criteria, parallel |
| Judges | Judge A, Judge B — both `opus` (author: Fable 5.1 — author ≠ auditor) |
| Spawn note | First launch of both judges failed at the harness (tmux pane); the single retry succeeded. No inline fallback was needed |
| Round | 1 — findings merged; **fix round not yet run** (awaiting the user's decision) |
| Skills resolved | `judgment-day`, `cognitive-doc-design`; project skills: none matched |

## Round 1 — merged ledger

**Counts:** confirmed severe **8** (both judges) · settled by architect re-run **2** (judges disagreed; raw-source re-run settled both as severe) · suspect **5** (one judge) · both-judge warnings **7** · INFO (single-judge warnings + suggestions) **17**.

### Confirmed severe (both judges) — eligible for the bounded fix actor

| ID | A | B | Finding | Resolution to apply |
|---|---|---|---|---|
| C1 | S1 | F-1 | **Detection cross-talk is only half closed.** DD-2 keeps Codex's command-skill probe (`isToolInstalled:400-404`), so a Cursor-only install (which writes `akili-*/SKILL.md` into the shared root) makes a bare `akili update` auto-detect **Codex** and write `~/.codex/akili`. FR-1 says "and vice-versa"; the FR-4 fixture tests one direction | Add the reverse direction to DD-2 and a fourth fixture state; resolve the tension with NFR-6 / the existing CI assertion (`:543-545`): Codex detection must gain a Cursor-exclusion or the requirement records the direction as an accepted risk |
| C2 | S2 | F-2 | **Empty-content deny is mis-scoped.** Placed "after extraction" on "a recognized write tool", it also fires for a Claude Code `Edit` with `new_string: ""` and a removal-only Codex `apply_patch` (both legitimately `exit 0` today) — contradicting "Edit/Codex untouched" and NFR-7 | Scope the deny to the `Write` arm only; extend §6 and the NFR-7 fixture set with an Edit-deletion and an apply_patch removal-only fixture |
| C3 | S3 | F-7 | **P-9 citation is false.** The subagents page states: "When multiple locations contain subagents with the same name, `.cursor/` takes precedence over `.claude/` or `.codex/`." The precedence half is documented; only the `model: opus` alias half is unverified | Split P-9; mark precedence verified with the quote; re-scope DD-4's fallback to the alias case; drop the "Review Design" driver |
| C4 | S4 | F-6 | **P-7 line citations wrong.** `:928-931` is the Edit branch; the Write `content` read is `:933-935`; the comparison is `:967` (`:965` = `esac`, `:966` = `count_x()`) | Re-cite in P-7, §6, DD-7, and FR-6 |
| C5 | S5 | F-9 | **P-15 counts wrong.** The cited scripts/ci + ci.yml + test pipeline returns **8** (all in the regression script), not 7; `test/*.js` has **0** `codex` hits — the "1 incidental" line is the FR-9 sweep keep (`agents-doctor.test.js:569`), not a `codex` consumer | Correct to 8 / 0; move the test-file mention to the FR-9 keeps |
| C6 | S6 | F-8 | **P-13 recorded output wrong.** The grep returns 869, 870, 977, 978, **1045, 1069** (the JSON fences also match `^   ```$`) | Record all six and explain, or anchor the pattern |
| C7 | S8 | F-5 | **Missing premise (High): is a Cursor `Write` payload the whole post-edit file?** DD-7 compares `count_x(new)` with the whole file on disk; a fragment payload yields the same silent allow DD-7 exists to close. No row | Add P-16 (`data-env`, High, `UNVERIFIED`); FR-10 tests an `[x]` flip on a file that already holds `[x]`; fallback: deny when the payload shape cannot be shown to be full-file |
| C8 | S7 (severe) | F-11 (warning) | **Missed consumer:** the Step 7 per-host template-source list (`akili-constitution.md:411-416`) names `~/.codex/akili/templates` etc. and has no Cursor line; the §7 walk and the FR-9 pattern both miss it | Add a §7 row + T3 obligation (canonical + mirror), with the `CURSOR_CONFIG_DIR` note. Severity split (A severe, B warning); both report the defect — treated as confirmed |

### Settled by architect re-run (judges contradicted each other)

| ID | A | B | Contradiction | Re-run as executed | Verdict |
|---|---|---|---|---|---|
| X1 | P-6 "CONFIRMED sample shows `new_content`" | F-3 severe: "0 occurrences in raw HTML" | Whether the hooks page documents a `Write` payload with `new_content` | `curl -sL https://cursor.com/docs/agent/hooks` → 1,302,332 bytes; Python strip + `re.finditer('new_content')` → **0 matches**; the only `file_path` payload samples are `afterFileEdit` (`edits[]`), `beforeReadFile`, `beforeTabFileRead` | **B is right — severe.** Cursor documents no `preToolUse` Write fields. P-6 is re-rated **High**; DD-7's "reads `new_content // content`" becomes a candidate list settled only by the FR-10 raw capture; the Write-arm empty-content deny is the floor that holds regardless |
| X2 | W1 (fail-open on other exit codes) | F-4 severe: allow path emits no JSON | Whether the gate's `exit 0` with empty stdout is honored as *allow* on Cursor | Same page: "For permission hooks (… `preToolUse`), invalid JSON or a response that doesn't match the hook's schema blocks the action"; `failClosed` row: "hook failures (crash, timeout, non-zero exit code, **no output**) block the action instead of allowing it through … Permission hooks block on invalid JSON or an invalid response even when this is false"; third-party page sample allows with `echo '{"permission": "allow"}'; exit 0` | **Severe (unverified contract, both outcomes bad).** Empty stdout is either a *failure* (fail-open: every allow silently passes — acceptable) or an *invalid response* (every tasks.md write blocked). Add P-17 (`data-env`, High, `UNVERIFIED`); design records the two candidate mechanisms (emit `{"permission":"allow"}` on Cursor-shaped payloads; or `failClosed: true` on the native entry) and T8 selects; FR-6's "enforced on Cursor" is conditional on T8 |

### Suspect (one judge) — recorded, not auto-fixed

| ID | Judge | Finding | Disposition |
|---|---|---|---|
| U1 | B F-10 | P-11 quotes "Binary name: `agent`" — the page shows `agent` only as the run command; `cursor-agent` never mentioned | Cheap citation fix — included in the Adjust pass |
| U2 | A W2 | The native fallback command points at `.claude/hooks/akili-tasks-gate.sh`, which a Codex+Cursor project without the Claude scaffold may not have → exit 127, fail-open | Included: DD-6 states script-location resolution (reuse existing copy or write `.cursor/hooks/` copy) |
| U3 | A W6 / P-new-4 | `readonly: true` = "no file edits, no state-changing shell commands"; whether the Reviewer can still run verification commands is unrowed | Included as P-18 (`UNVERIFIED`, Low — the Leader passes the diff and evidence; Reviewer runs no command by contract per Step 8E Claude Code bullet) and an FR-10 observation |
| U4 | B F-13 | §5.4 host-data row drops the "old content" source (table column is old/new) | Included — cheap |
| U5 | B F-28 | §5.4 carries a jq expression and an object literal (code suppression) | Included — rewrite as prose |

### Both-judge warnings — INFO by protocol; included in the Adjust pass because each is a citation/consistency correction

| ID | A | B | Finding |
|---|---|---|---|
| W-a | W5 | F-19 | Line citations: `TOOL_REGISTRY` :135; `getArgs` :251; `RECOMMENDED_ENV` :1190; `appliesTo` filter :1225; `runInteractiveInit` :1905; throw at :575 (not :568); Step 8C "all four" :523-524; Codex merge :1051-1074; honesty note :1099-1106 |
| W-b | W4 | F-15 | FR-9 baseline unit/scope inconsistent (70 = occurrences **with** `releases/`; excluding it: 61 occ / 18 files per B, 54 lines / 19 files per A) — restate with the exact command and unit |
| W-c | W7 | F-17 | Init renumbering moves inputs `5`/`6`; `:1929-1930` and `docs/cli.md:18` missing from the walk; CHANGELOG note |
| W-d | W8 | F-18 | T7 (gate fixtures) must precede T3 (script edit) for red-before; ownership of fixtures split between §7 #10 and T7; 14 rounds vs the precedent's 19 |
| W-e | W9 | F-23 | New fixtures must pin `CURSOR_CONFIG_DIR` to the scratch home (the Codex fixture pins `CODEX_HOME`) |
| W-f | W1 | F-16 | Native entry should consider `failClosed: true`; honesty note names the fail-open default |
| W-g | W3 | F-14 | DD-6's "no scaffold / imports off" trigger is undefined: Step 8F always writes the Claude entry when accepted, and the import toggle is a Cursor UI setting the agent cannot read — rule must be "ask the user" |

### INFO — single-judge suggestions (recorded; not applied unless noted)

A: G1 (probe `cursor-agent` then `agent`; Windows hint) · G2 (`CURSOR_CONFIG_DIR` is a CLI-config override) · G3 (fail loudly when `jq` absent) · G4 (host-neutral deny message) · G5 (skill-name precedence across `~/.claude/skills` vs `~/.agents/skills` — add P-19 `UNVERIFIED` Low) · G6 (other commands' model-checkpoint lines are deliberate keeps). B: F-12 (P-6 impact High — applied via X1) · F-20/F-21 (citations — applied via W-a) · F-22 (define "35 skipped" as directories vs 210 files) · F-24 (pricing URL for P-11) · F-25 (`.agents/skills` tenant row cell text stale: "Codex repo-scope skills / `--tool codex --local`") · F-26 (`goal`/`loop`/`autopilot` built-ins → FR-10 list) · F-27 (`doctor --tool codex` before/after fixture). Cheap ones (G2, G4, G5, F-22, F-24, F-25, F-26, F-27) are applied in the Adjust pass; G1, G3, G6 recorded only.

## Decision

**User chose: Fix only** (2026-10-01). No scoped re-judgment was run; the lineage closes at round 1.

### Fix delta (round 1, applied by the architect inline — the fix actor's bounded scope was C1–C8, X1, X2; the Adjust pass added the "included" suspects and both-judge warnings)

| ID | Applied in |
|---|---|
| C1 | design DD-2 rewritten as a symmetric rule (Cursor: resources only; Codex's command-skill probe suppressed while a sibling tenant's resources root is populated); §3, §5.1, §6, §7 row 4; requirements FR-1 (new `AND IT MUST be symmetric` clause), FR-4 (four-state fixture) |
| C2 | design §5.4 and DD-7: deny scoped to the `Write` arm; §6 reversion row covers `Edit` empty `new_string` and removal-only `apply_patch` as unchanged; requirements FR-6(a), empty-content scenario (`Write` only, `BUT` clause), NFR-7 fixtures |
| C3 | design P-9 re-cited with the verbatim precedence sentence (verified); alias half split into P-9b (Low); DD-4 re-scoped; requirements FR-5 overlap clause |
| C4 | `:933-935` / `:967` / `:929-932` in design P-7, §5.4, §6, DD-7 and requirements §4, FR-6 |
| C5 | design P-15 and §7 walk: 8 hits in the regression script, 0 in `test/`; the test-file line moved to the FR-9 keeps |
| C6 | design P-13 records all six grep lines and explains the two JSON fences |
| C7 | design P-16 (High, `UNVERIFIED`), DD-7 fallback, §5.4; requirements FR-6 gate scenario (tasks.md that already holds `[x]`), FR-10, §8 |
| C8 | design §7 row 12 + P-21; requirements §4 Constitution row, FR-9 sweep note |
| X1 | design P-6 re-cited to the raw page (0 occurrences), Impact High, abort path named; DD-7 candidate list; requirements FR-6(a) |
| X2 | design P-17 (High, `UNVERIFIED`), §5.4 allow-path paragraph, DD-7 two candidate mechanisms; requirements FR-6(c) honesty note "pending live validation", gate scenario allow clause, §8 rows |
| U1 | design P-11 quotes the page's run command, not "Binary name" |
| U2 | design DD-6 script-location resolution; requirements FR-6(b) |
| U3 | design P-18, §5.3 `readonly` cell; requirements FR-5 new clause, FR-10 |
| U4 | design §5.4 host-data row keeps old/new content |
| U5 | design §5.4 rewritten as prose (no jq expression, no object literal) |
| W-a | all cited anchors corrected (`:251`, `:135`, `:575`, `:1190`, `:1225`, `:1905`, `:523-524`, `:1051-1074`, `:1099-1106`) in design and requirements §4 |
| W-b | requirements FR-9 baseline restated with the exact `git grep` command: 53 lines / 18 files / 61 occurrences excl. `releases/`; `releases/` 6 lines / 9 occurrences kept; design DD-10 |
| W-c | design §5.2 and §7 walk list `:1929-1930` and `docs/cli.md:18`; requirements FR-1 init scenario and CHANGELOG note |
| W-d | design §9: T7 → T3 ordering, fixtures split T2 (installer) / T7 (gate), rounds raised 14 → 16 with the reason |
| W-e | design §7 rows 9–10; requirements FR-4 (`CODEX_HOME` + `CURSOR_CONFIG_DIR` pinned) |
| W-f | design §5.4 native entry `failClosed: true`; requirements FR-6(b), corrupt/foreign scenario, §8 |
| W-g | design DD-6 one-question rule (Claude entry first; ask about the import toggle); requirements FR-6(b) |
| INFO applied | G2 (DD-3 wording), G4 (host-neutral reason), G5 (P-19), F-22 (35 dirs / 210 files), F-24 (pricing URL in §5.5), F-25 (tenant-row cell text, FR-8), F-26 (built-ins in FR-10), F-27 (`doctor --tool codex` before/after, FR-4), P-new-2/P-new-4 of Judge B → P-20 (imported-hook `cwd`, High) |
| INFO recorded only | G1 (probe `cursor-agent` then `agent` — DD-5 names both; a two-binary probe would need a `RECOMMENDED_ENV` shape change, out of scope), G3 (handled: the gate test fails loudly on ubuntu/macos when `jq` is absent — §7 row 10a), G6 (recorded as deliberate keeps in FR-9) |

Premise Ledger after the fix: 21 rows — 13 verified, 8 `UNVERIFIED` (High: P-6, P-16, P-17, P-20; Low: P-9b, P-12, P-18, P-19). The High rows are all gate-contract facts owned by T8; the design's floor (Write-arm fail-closed) holds regardless of their outcome, and FR-6(c) withholds the "enforced on Cursor" claim until T8.

**JUDGMENT: APPROVED ✅** — with the design amended as above and no re-judgment (user's choice). Confirmed severe 8/8 fixed; settled 2/2 fixed; suspects 5/5 included; both-judge warnings 7/7 included.
