# Execution Log: Model Routing Configurator (`akili routing`)

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/model-routing-configurator` |
| Depth | Standard |
| Approval Mode | `gated` |
| Started | 2026-10-01 |
| Leader model | `claude-fable-5-1` (T1 — session model stronger than the registry's `opus` entry; registry entry flagged for refresh, no downgrade) |
| Worker models | Implementer `opus` (escalated from the registry's T2 `sonnet` — reason: T1's JSON is the derivation's ground truth and T2/T3 are logic-heavy; recorded per `leader.md` → *Delegation Discipline*) · Reviewer `fable` (T3; author ≠ auditor holds) |
| Spawn mechanism | No Step 8E wrappers in this repo (`.claude/agents/` absent) — subagents seeded with `.agents/implementer.md` / `.agents/reviewer.md` by path (host workers) |
| Persona drift | `akili doctor --agents` run before the first spawn — no blocking drift (`UNLOCATED shared-file-discipline` on leader/implementer is the maintainer's call, not `outdated`/`missing`) |
| Budget (design §10) | 8 tasks · ~1,550 LOC · 18 review rounds — tripwire at task 9, ~1,900 LOC, or round 19 |
| Baseline | `a93498d` (spec commit); every `file:line` in the spec verified at `8eb0227` |

### Pre-spawn spec amendment (T1 gate, 2026-10-01)

**Tension found while composing the T1 brief:** T1's drift-test assertion (iii) required `tierPreference[T][1]` to appear *in the host cell*, and FR-7 / design §5.1 said the shared `Fallback` column is not checked — but FR-3's Claude scenario requires fallbacks `sonnet, haiku, sonnet, opus, sonnet, opus`, none of which appear in a Claude Code host cell (each holds a single id); they live only in the row's shared `Fallback` column. Either FR-3 or the drift test had to go red.

**User decision (AskUserQuestion, pre-spawn):** *Second entry may match the Fallback column.* Amended in the same minute:

| File | Section | Edit |
|---|---|---|
| `requirements.md` | FR-7 → Drift Test scenario, THEN clause | `[0]` must appear in the host cell; `[1]` (when present) in the host cell **or** the row's shared `Fallback` column; the `Fallback` column otherwise not walked |
| `design.md` | §5.1 cell grammar, last sentence | "not checked" → "not walked as a column; consulted only as the second place a list's `[1]` may appear" |
| `tasks.md` | T1 scope, drift-test bullet (iii) | same rule |

Classed as an execute-time clarification (no approved requirement's meaning changed — FR-3's expected values and FR-7's head/second = primary/fallback intent are both preserved). Carried into the T1 Reviewer brief as a named conformance check, and once more into T2's.

**Second clarification, same gate (Leader call, no user question — the strict grammar was unsatisfiable, not ambiguous):** design §5.1's cell grammar (backticked id · family word · placeholder; "anything else ignored") left the Antigravity T4 cell (`Gemini 3.8 Flash (High)`, no backticks, no placeholder) with zero tokens, so no `tierPreference.T4` head could ever "appear in" it. Added one sentence to §5.1: for the head/second check only, an entry also appears in a cell when the cell names it by its `models[]` `label` verbatim. FR-7's checks (i)–(ii) are unchanged. Carried into the T1 and T2 Reviewer briefs with the first clarification.

## 2. Task Execution History

### T1 — Packaged data: `model-registry.json`, `model-routing.section.md`, drift test

| Field | Value |
|---|---|
| Final status | **PASS** (Reviewer, attempt 1) |
| Date | 2026-10-01 |
| Implementer attempts | 1 |
| Skills (Leader selection) | `tdd`, `cognitive-doc-design`, `caveman` — as the task listed; no deviation |
| Effort | Implementer `high` (above the `medium` default — the JSON is ground truth for every project's derivation); Reviewer `high` |
| Models | Implementer `opus` (T2 escalation recorded in Document Control) · Reviewer `fable` (T3) — author ≠ auditor holds |
| Requirements covered | FR-7 (all), FR-4 content list (template side), NFR-7 |

**Attempt 1**

- *Runtime events:* spawn failure ×1 (`Could not determine current tmux pane/window`) → rung 1 (immediate retry) recovered the attempt; attempt counter untouched.
- *Files changed:* `.claude/templates/model-registry.json` (new, 175 lines) · `.claude/templates/model-routing.section.md` (new, 93 lines) · `test/registry-drift.test.js` (new, 191 lines, 7 tests).
- *Implementer verification:* `node --test test/registry-drift.test.js` → `# tests 7 # pass 7 # fail 0`; check 2 `node -e …tierPreference…` → exit 0; check 3 `grep -c "Default Branch:\|Integration Branch:"` → `0`; check 4 → exactly `{{antigravityDialMap}} {{authorAuditorNotes}} {{cliInvocationRow}} {{crossHostLine}} {{pinReasons}} {{regenerateHint}} {{registryTable}} {{updated}}`; check 5 `pack:dry-run` grep → `2`; check 6 `npm test` → `# tests 101 # pass 101 # fail 0` (94 baseline + 7), `git diff --check` exit 0. `list` / `doctor --tool all` / `install --tool all --dry-run` captured before and after → identical.
- *Red run (quoted):* pre-data run threw `ENOENT … model-registry.json` — reported "not red". **F1** (Claude `tierPreference.T2` → `["haiku","haiku"]`): test "registry: tierPreference head is in the host cell; second is in the host cell or the row's Fallback column" — `error: 'claude T2: head "haiku" does not appear in the doc cell "`sonnet`"'`, `code: 'ERR_ASSERTION'`, `expected: true`, `actual: false`. **F2** (`docs/model-routing.md:124` Claude cell `` `haiku` ``→`` `opus` ``): same test — `error: 'claude T5: head "haiku" does not appear in the doc cell "`opus`"'`, `expected: true`, `actual: false`. Both reverted (`cmp` on the JSON; `git status` clean on the doc). Check 2 falsifier (delete `codex.tierPreference.T6`) → `Error: codex T6`, exit 1; reverted.
- *Consumers:* `grep -rn "model-registry\|model-routing.section" bin test scripts docs` → 27 hits, all under `docs/specs/` (this spec + two archive files); 0 in `bin`, `scripts`, `test`, or `docs/` outside `docs/specs`.
- *Evidence re-run (Leader-inline, non-author):* **VERIFIED** — checks 1–6 reproduced exactly (7/7; exit 0; `0`; the eight placeholders; `2`; 101/101; `diff --check` clean).
- *Reviewer verdict:* **PASS** — "All three files conform to FR-7 (statement + Drift Test scenario as amended), design §5.1 (every schema field present per host, cell grammar incl. the label-verbatim clarification), §5.4 (every left-column obligation lands as fixed prose or one of the eight placeholders; item 5 wording is verbatim; P-7 strings absent), and the T1 Scope. I reconciled all 30 host cells of `docs/model-routing.md:120-125` against `tierPreference` heads/seconds/placeholders and `models[]` by hand — zero disagreements." Both named conformance checks (the two T1-gate clarifications) hold; anchor is the header text with exact T1–T6 row assertion; test 2 asserts ≥ 1 family token per Codex (and Cursor) row; red run verified by trace (F1 reaches `appearsIn("haiku", "`sonnet`")` → no id/family/label → assertion; F2 fails only claude T5). NFR-7 pins sourced (OpenCode doc `:131-132`; Codex constitution `:810`; Cursor `:888`; Antigravity `agy models` 2026-09-17; Claude `2026-09` = doc `:101`); `pin: null` for Claude/Antigravity per P-26.
- *Implementer `Not Done / Assumptions` (verbatim — judgment calls, no owed item, no blocker; not a continuation):*
  1. **List order rule:** the cell's named model first, then the host's own id from the Fallback column, then any placeholder in the cell. OpenCode T4 = `[deepseek-v4.1-flash, mimo-v2.5, "<CONFIRM>"]`. Codex T4 and T6 = `[gpt-5.6-terra, "<CONFIRM SLUG>"]`. Antigravity T6 = `[gemini-3.8-flash-high, "<CONFIRM ID>"]`: the head is matched by label.
  2. **Cursor:** six `id: null` entries whose `family` is the phrase before the word "family" in the doc: `Claude Opus`, `Composer`, `GPT-5.6 Sol/Terra`, `Claude Sonnet`, `Composer (Fast)`, `Gemini 3.8 Flash`. The grammar treats such a phrase as one family token, so the "Sol"/"Terra" inside "GPT-5.6 Sol/Terra family" count as part of it. Outside a phrase, Astra/Sol/Terra/Luna are matched as family words. Each Cursor tier's list is `["<CONFIRM SLUG>"]`; the family text sits in `notes`. **Downstream flag for T2/T3:** with identical T2 and T3 placeholders, the "T3 ≠ T2" rule must not compare placeholders as ids, or the packaged Cursor default comes out `unsatisfiable`.
  3. **Fallback-column ids:** they become second entries only for their own host. All 6 Claude seconds match FR-3. OpenCode gets `glm-5.3`, `deepseek-v4-flash` (+ `glm-5.3-flash` third), `mimo-v2.5`, `qwen3.8-flash`, all added to `models[]`. Antigravity T3 gets `claude-sonnet-4-6`, added to `models[]` with no `wrapperModel` because none is confirmed.
  4. **Astra:** `gpt-6-astra` is in `models[]` but in no list. The doc table never names Astra, even though constitution `:509-516` mentions a "default Astra/Sol pair".
  5. **`dated`:** `false` on every packaged entry. No packaged id is a pin where an alias exists; `claude-fable-5` is opt-in and not included.
  6. **`effortRungs`:** Codex: six rungs on `gpt-5.6-luna` only, the only model confirmed live; `null` for the others. Antigravity: each id gets its single in-id rung. Claude, OpenCode, Cursor: `null`.
  7. **Pins:** `pin: null` for Claude and Antigravity (P-26: no vendor URL). Claude's `lastVerified` is `"2026-09"`, the registry stamp.
  8. **Notes:** OpenCode notes copy the doc cell text verbatim, including the T2 promo that expired 2026-09-20.
  9. **Template:** it opens with a `## Model Routing` heading inside the body. T3's replacer can strip it if the heading belongs outside the fence.
  10. **Extra checks:** I added test 5 (every non-placeholder list entry is an id in `models[]`; `crossHost.T6` names a host). It is an internal-consistency check, not a scope change.
- *Spawns:* Implementer 32 calls (self-count 27), 145,083 tokens, ended complete; Reviewer 16 calls, 104,888 tokens, ended complete.

**ADVISORY (4R, final Reviewer verdict — recorded, never gating, never a task):**
- Readability: `cliSuggestion` for Codex/Cursor embeds prose (`codex — commands invoked as $akili-<name>`); §5.1/C8 makes it the prompt's default the user confirms, so an `Enter` would record the sentence as the invocation. Consider a bare binary plus a separate command-form field before T4's wizard consumes it.
- Reliability: `appearsIn` label match is `cell.includes(label)` (substring, case-sensitive) — safe for today's labels; a future label that is a substring of another cell's text would pass spuriously.
- Risk: Codex T4/T6 and OpenCode T4 carry a placeholder in the second/third slot; under §5.3 step 2 a full Codex roster renders T4 fallback `<CONFIRM SLUG>` while OpenCode T4's `<CONFIRM>` never surfaces — T2's FR-3 full-roster test should assert these shapes explicitly.
- Reliability: Antigravity `claude-sonnet-4-6` has no `wrapperModel`; the §5.5 Antigravity renderer (T3) must tolerate the absence.
- [advisory-grade] labels equal the doc's human names; Cursor labels append " family". No action.
- Readability: OpenCode T2 note mirrors the doc's expired promo — correct as a mirror; staleness belongs to `docs/model-routing.md`.

**Forward pointers (carried into the named task's brief at compose time — context, not scope):** T2 — Cursor lists are all `["<CONFIRM SLUG>"]`: T3 ≠ T2 must compare ids, not placeholders; full-roster test should pin Codex T4 fallback `<CONFIRM SLUG>` and OpenCode T4's placeholder non-surfacing. T3 — Antigravity renderer tolerates a missing `wrapperModel`; template body opens with the `## Model Routing` heading (fence encloses it). T4 — `cliSuggestion` for Codex/Cursor is composite prose per §5.1; the prompt default must present the binary, not the sentence.

**Decisions made:** two execute-time spec clarifications at the gate (Document Control, above) — carried as named Reviewer checks here; carry once more into T2's Reviewer brief, then drop. **Issues encountered:** one transient spawn failure (above). Lookup note: TRD and UX/UI design not in project (S5). **Final verification:** `npm test` 101/101; `git diff --check` clean; `list`/`doctor`/`install --dry-run` unchanged.
