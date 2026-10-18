# Tasks: Antigravity registry refresh — Gemini 4 Argon

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/antigravity-argon-registry` |
| Depth | **Lite** |
| Status | **Approved** — 2026-10-18 (Juan Carlos, Phase 3 gate: Continue; Amendments A1–A3 approved) |
| Date | 2026-10-18 |
| Budget (design §15) | **3 tasks · ~100 LOC · 6 review rounds** — `/akili-execute` stops and escalates past 3 tasks, ~130 LOC, or 6 rounds |
| Commit prefix | `[SPEC:changes/antigravity-argon-registry]` — local commits only; no push, release, or publish |
| Format precedent | `docs/specs/bugfix/pty-harness-ubuntu-flake/tasks.md` |
| Verified at | `186c6a0` — every baseline reading below was **executed** on 2026-10-18 and is quoted, not predicted (KZ-changes--leader-brief-contract-2). Every mutation probe restored the file; `git status` was clean apart from the spec folder |

## 2. Task Graph

```
T1 (registry JSON + docs/model-routing.md)
 ├─→ T2 (rules/docs text: akili-constitution.md ×2, docs/commands/akili-constitution.md, docs/cli.md)
 └─→ T3 (bin/routing.js report gate + test rebase + CHANGELOG)
```

Waves: **T1** → **T2 ∥ T3**. T2 and T3 touch disjoint files, but T3's tests read T1's JSON and T2's wording cites T1's cells. No cycles.

**`skip-eligible` tasks: none.** T1 changes a contract the drift test guards. T2 edits rules text agents execute. T3 changes code and assertions.

**Skills:** T1 `cognitive-doc-design` (doc paragraph) · T2 `cognitive-doc-design` · T3 `tdd` (the report-gate assertion red first). No UI skill applies.

---

### T1 — Registry data and `docs/model-routing.md`

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S (~50 LOC: JSON ~15, doc ~35) |
| Depends on | none |
| Requirements | FR-1 (scenario, `BUT` routed ids only, `AND IT MUST` byte-equal labels); FR-2 (Antigravity column + T3 Fallback; `BUT` no other host); FR-3 doc half (`AND IT MUST` doc states Argon roles are not wrapper-bound, with the C-Q1 date); FR-4 (scenario + falsifier clause) |
| Design refs | §4, §5, DD-2, DD-3, DD-4, DD-5, A3 (upgrade sentence), P-1–P-4, P-9, P-13 |
| Review | `full` — the packaged registry is a contract read by every Antigravity project |

**Scope.**
- `.claude/templates/model-registry.json` `hosts.antigravity`: exactly the design §5 values (`models[]` in DD-5 order, `tierPreference.T1/T3`, `lastVerified: "2026-10-18"`). No other host is touched.
- `docs/model-routing.md`:
  - `:104` → *Registry updated: 2026-10*.
  - Table `:123` T1 and `:125` T3 Antigravity cells, plus the T3 Fallback cell (design §5 wording).
  - `:135` pin → `Last verified: 2026-10-18`.
  - *Antigravity* paragraph `:237-245`: Argon is the roster's top model and routes to T1/T3. Remove the "only Pro generation" and Sonnet 4.6 sentences. Add the DD-3 sentence (run the session on `gemini-4-argon-high`; an unwrapped Reviewer inherits it, and is read-only by instruction), the DD-4 reopen sentence, and the A3 upgrade sentence (re-run with `--models antigravity=<new packaged ids>`).
  - `:522` wrapper-value row: say that an Argon pick has no wrapper value, so its role is skipped.
- First step: re-run `agy models` and diff it against the `models[]` ids. Any mismatch stops the task as a Pivot.

**Verification.**

| Field | Value |
|---|---|
| Command | `node --test test/registry-drift.test.js` → `# fail 0` · `agy models` ⊇ every `hosts.antigravity.models[].id` (manual; CI cannot run `agy`) · `git grep -n -e 'gemini-3\.1' -e 'sonnet-4-6' -e '3\.1 Pro' -e 'Pro 3\.1' -e 'Sonnet' -- docs/model-routing.md` → only the Claude-column `sonnet` hits and `claude-sonnet-5-5-high`, listed in the report · `git diff --stat` shows only the two files |
| Red run | **Observed at `186c6a0`** with only the planned JSON applied: `not ok 1 … 'antigravity T3: id \`gemini-3.1-pro-high\` in the doc cell is not in models[]'` and `not ok 4 … 'antigravity T1: head "gemini-4-argon-high" does not appear in the doc cell "Gemini 3.8 Flash (High) — \`gemini-3.8-flash-high\`"'` (`# fail 2`). T1 ends with this pair green |
| Falsifier | **Executed at `186c6a0`:** change the T1 Antigravity cell id to `gemini-9-bogus` → `not ok 1 … 'antigravity T1: id \`gemini-9-bogus\` in the doc cell is not in models[]'`. Re-run the same mutation post-change and quote the red |
| Disqualifier | Green drift test with `test/routing.test.js` still red is expected at the end of T1. Under the planned JSON, 5 tests go red at baseline: 66, 69, 82, 134, 135 (`# fail 5`, observed). Those are T3's to close; T1 records the set as run and does not edit tests. A label not copied byte-for-byte from `agy models` output fails FR-1 even when the tests are green |
| Consumers | `test/registry-drift.test.js` · `test/routing.test.js` (T3) · `bin/routing.js` readers of `hosts.antigravity` (`deriveTiers`, `renderWrapper`, `renderSection`, `promptTierAdjust`) — unchanged code |

**Done.** Drift test green; the falsifier is re-run red and restored; `agy models` diff is quoted; the stale-term grep is clean apart from listed Claude-column hits; the 5-test red set is recorded for T3.

---

### T2 — Rules and docs text naming the retired T3 pick

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | XS (~15 LOC, 4 sites in 3 files) |
| Depends on | T1 |
| Requirements | FR-3 (`AND IT MUST` documented); FR-4 (prose drops the Gemini 3.1 Pro / Sonnet 4.6 text) — at the sites outside `docs/model-routing.md` (design P-7) |
| Design refs | §4 rows `akili-constitution.md`, `docs/commands/akili-constitution.md`, `docs/cli.md`; DD-2, DD-3; A2 (template excluded) |
| Review | `checklist` — 4 sites, one rules document (`akili-constitution.md`). Estimated 2 rounds (rules text) |

**Scope.**
- `.claude/commands/akili-constitution.md:582`: Step 8C wording becomes "**Gemini 4 Argon** for T1 and the T3 auditor".
- `.claude/commands/akili-constitution.md:855`: the Step 8E `model` row says a Gemini Flash pick is `flash`, an Argon pick has no wrapper value and its role is skipped and reported, and the packaged roster writes Implementer and Tester `flash` only. Keep `inherit \| flash \| pro` as the value set (P-2).
- `docs/commands/akili-constitution.md:94`: same change as `:582`.
- `docs/cli.md:448`: add that an Argon pick writes no wrapper.
- **Not** `.claude/templates/model-routing.section.md:48` (A2: the edit refuses existing fences, P-12). It is recorded in the CHANGELOG as known debt (T3).

**Verification.**

| Field | Value |
|---|---|
| Command | `git grep -c -e '3\.1 Pro' -e 'Reviewer \`pro\`' -e 'Sonnet 4\.6' -e 'model: flash\` or \`pro\`' -- .claude/commands/akili-constitution.md docs/commands/akili-constitution.md docs/cli.md` → no output · phrase-family sweep over the three files for `Pro` / `auditor` / `pro\`` with every hit read and judged in the report (KZ-changes--kaizen-loop-closure-2) · `npm run verify:cli` |
| Red run | **Observed at `186c6a0`:** the same `git grep -c` → `akili-constitution.md:2`, `docs/cli.md:1`, `docs/commands/akili-constitution.md:1` |
| Falsifier | Restore one site (e.g. `:582`) to its baseline text → the `git grep -c` prints `.claude/commands/akili-constitution.md:1`. Run it post-change and quote it |
| Disqualifier | A zero from the grep proves the old phrases are gone, not that the new text is right. The Reviewer reads each new sentence against DD-2/DD-3 and design §5. A site rewritten to name `pro` as Argon's wrapper value contradicts FR-3, whatever the grep says |
| Consumers | Projects running `/akili-constitution` Step 8C/8E (agent-executed text) · `docs/commands/` readers |

**Done.** Grep clean; the falsifier is quoted; each sweep hit is judged; `verify:cli` passes.

---

### T3 — `/agents` report gate, test rebase, CHANGELOG

| Field | Value |
|---|---|
| Status | `[x]` |
| Size | S (~35 LOC: `bin/routing.js` 1 line · `test/routing.test.js` ~25 · `CHANGELOG.md` ~8) |
| Depends on | T1 |
| Requirements | FR-3 (scenario: Implementer/Tester `flash`, Leader/Reviewer skipped with reasons naming `gemini-4-argon-high`; `BUT` no `model:` outside the tier set); FR-5 (scenario + `BUT` no deleted test or weakened assertion); NFR-1, NFR-2, NFR-3 |
| Design refs | A1 (DD-1 amended, DD-6 extended), A2/A3 CHANGELOG notes, P-5, P-6, P-8, P-10, P-11, P-14, P-15 |
| Review | `full` — it changes code, assertions, and a CHANGELOG entry (KZ-002) |

**Scope.**
- `bin/routing.js:842`: emit the `/agents … lists only \`akili-leader\`` report only when `planned.leader` exists. No other code change.
- `test/routing.test.js` (the 5 reds T1 records, plus the retired-id sites):
  - **66** (`renderWrapper Antigravity`): on the packaged roster, assert `implementer`/`tester` → `model: flash`, and `leader`/`reviewer` → no content. Move the `model: pro` + `tools:` rendering assertion onto a registry clone that gives `gemini-4-argon-high` `wrapperModel: "pro"`, the seam test `(j)` uses.
  - **69** (`renderWrapper: null for … without wrapperModel`): rebase from `claude-sonnet-4-6` to `claude-sonnet-5-5-high`.
  - **82** (`buildPlan restrictions and effort`): on the packaged roster, assert that the `/agents` line is **absent** and that both `no wrapper` lines are present. Move the `tools:` applied branch onto the same registry clone.
  - **134** (`promptTierAdjust (h)`): rebase the third roster id `gemini-3.1-pro-high` → `gemini-4-argon-high`, keeping the rejection-then-accept flow and `REASON_SHARED`.
  - **135** (`buildPlan (i)`): Antigravity's Reviewer expectation becomes "not written" (no `created` token, a `no wrapper` report). Every other host is unchanged.
  - `:297` (empty-T4 test) and `:1439-1444` `(g)`: rebase `gemini-3.1-pro-high` → `gemini-4-argon-high`, keeping each asserted outcome. `:337` is a **Cursor** user id (`claude-sonnet-4-6`) on another host and stays unchanged.
- `CHANGELOG.md` `Unreleased` (patch), one entry covering:
  - the T1/T3 routing, retired ids, and `lastVerified`
  - Argon roles getting no wrapper, and why (C-Q1)
  - the DD-3 mitigation
  - **Expected on upgrade** (A3: re-run with `--models antigravity=<new ids>`; a plain re-run degrades to author ≠ auditor NOT satisfied)
  - **known debt** (A2: `model-routing.section.md:48` still names Gemini 3.1 Pro, pending the template-evolution bug)
  - the `/agents` report fix

  Every clause is quote-checked at HEAD.

**Verification.**

| Field | Value |
|---|---|
| Command | `npm test` → `# fail 0` · `npm run verify:cli` · `npm run pack:dry-run` · `git diff --check` · scratch re-run of the P-10 command → no `/agents … akili-leader` line, exit 0 |
| Red run | **Observed at `186c6a0`** (planned JSON, current code; scratch `repro-fence`): the routing run prints `Antigravity: in-session \`/agents\` lists only \`akili-leader\` — that is the success condition` with both Leader and Reviewer `no wrapper` lines and no Leader wrapper written. Write test 82's new "line absent" assertion first and observe it red **on the assertion** before editing `bin/routing.js` |
| Falsifier | Post-change: revert `:842` to `Object.keys(planned).length > 0` → test 82 red on the absence assertion (quote it); restore. Remove `wrapperModel` from the clone in test 66 → the `tools:` assertion red (quote it); restore |
| Disqualifier | `# fail 0` reached by deleting a test, loosening `deepEqual` to `ok`, or dropping a host from `(i)` fails FR-5 whatever the count. Compare test titles and assertion counts against `186c6a0` and report them. A CHANGELOG clause not quote-checkable at HEAD is a FAIL (KZ-002) |
| Consumers | `test/routing.test.js` (tests 66, 69, 82, 134, 135, `(g)`) · `bin/akili.js` (prints `reports`) · `docs/cli.md` routing section (report wording unchanged) |

**Done.** `npm test` green with the test count unchanged; both falsifiers quoted; the scratch re-run is clean; NFR-1 commands pass; the CHANGELOG is quote-checked; commits are local and prefixed.

---

## 3. Coverage (clause level)

| Clause | Task |
|---|---|
| FR-1 scenario · `BUT` routed ids only · `AND IT MUST` labels byte-equal | T1 |
| FR-2 scenario (derivation) · author ≠ auditor satisfied · `BUT` other hosts untouched | T1 (data), T3 (tests 134/135 assert it) |
| FR-3 scenario (Implementer/Tester `flash`; Leader/Reviewer skipped naming the id) | T3 |
| FR-3 `BUT` no `model:` outside `inherit/flash/pro` | T3 (66/135 assert wrapper content); T1 (no `wrapperModel` on Argon) |
| FR-3 `AND IT MUST` documented with C-Q1 date | T1 (`docs/model-routing.md`), T2 (constitution, cli.md) |
| FR-4 dates/prose · drift test passes · `AND IT MUST` falsifier still red | T1 |
| FR-5 suite green · `BUT` no deleted/weakened test | T3 |
| NFR-1 / NFR-2 / NFR-3 | T3 (T1/T2 commit locally under NFR-3) |
