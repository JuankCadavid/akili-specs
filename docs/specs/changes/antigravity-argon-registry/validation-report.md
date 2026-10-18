# Validation Report — Antigravity registry refresh (Gemini 4 Argon)

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/antigravity-argon-registry` |
| Depth | Lite |
| Validated at | `20184cc` (clean tree, branch `JuankCadavid/argon-registry`, no upstream) |
| Implementation diff | `git diff 6e802a5..HEAD -- ':!docs/specs'` → 8 files, 97+/52- |
| Date | 2026-10-18 |
| Validator | T3 Auditor, Opus 5.5, fresh context (Implementers were `sonnet`; author ≠ auditor holds) |
| Baseline docs | `docs/prd.md`, `docs/trd/`, `docs/ux-ui/`, `docs/specs/general-setup/` do **not exist** in this repo — checked with `ls`, all "No such file or directory". Validation is against the spec folder, `AGENTS.md`, and the Kaizen `## Active Lessons` digest |
| Scope of writes | This file only. No other file edited, nothing committed, pushed, tagged, or released |

## 2. Summary

**Verdict: PASS with 6 WARN — archive-ready.** No FAIL, no BLOCKED.

The registry, docs, one-line code fix, and tests do what FR-1..FR-5 and NFR-1..3 require, and I re-ran the key claims myself rather than trusting the test report. The WARNs are about prose: rules and docs text that this change made stale or inconsistent, and spec-document figures that disagree with each other. None of them changes what `akili routing` writes.

| Result | Count |
|---|---|
| PASS | 39 |
| WARN | 6 |
| FAIL | 0 |
| BLOCKED | 0 |

| WARN | One line |
|---|---|
| W1 | Step 8E's `/agents` check still says "only `akili-leader` appears … One entry is the success condition". On the packaged roster no Leader wrapper is written, so the rules text keeps the false claim A1 removed from the code |
| W2 | `docs/commands/akili-constitution.md:98` still promises "the Reviewer wrapper pins a different model than the Implementer wrapper". No Antigravity Reviewer wrapper is written now (T2 ADVISORY 3, unresolved) |
| W3 | `docs/model-routing.md:242` says author ≠ auditor "is satisfied" with no condition. `:253` makes it depend on running the session on Argon (T1 ADVISORY 2, unresolved) |
| W4 | Figures disagree across documents: the count of rejected candidates (14 / 16, and 16 vs 19 given), and P-8's "9 hits" (the command returns 10) |
| W5 | Known debt (A2, approved): a freshly rendered `AGENTS.md` contradicts itself. The table puts Argon on T3, while the prose says "Gemini 3.1 Pro as the T3 auditor" |
| W6 | `tasks.md` T4 cites FR-3 `BUT` with a paraphrase that is not the clause's text. The site is really owned by the FR-3 scenario and `AND IT MUST` |

## 3. Task Completion

| Task | `tasks.md` | Execution evidence | Closing Reviewer | Result |
|---|---|---|---|---|
| T1 | `[x]` | `execution.md` T1: attempt 1 FAIL (the "16 spellings" sentence), attempt 2 PASS; drift `# pass 7`, falsifier red quoted; commit `2f0235f` | `opus` PASS (attempt 2) | PASS |
| T2 | `[x]` | grep baseline 2/1/1 → empty; falsifier quoted; `verify:cli` OK; commit `b00440b` | `opus` PASS | PASS |
| T3 | `[x]` | TDD red quoted; falsifier 1 (`:842`) and the Reviewer-corrected falsifier 2 (`tools`) quoted; `npm test` 259/0; commit `afea75c` | `opus` PASS | PASS |
| T4 (Pivot A4) | `[x]` | Pivot Record (user decision quoted); grep red at `afea75c` → only the 2 correct hits; falsifier quoted; commit `25a6238` | `opus` PASS | PASS |

Commit discipline: `git log 6e802a5..HEAD` shows 6 commits, all prefixed `[SPEC:changes/antigravity-argon-registry]`. `git rev-parse @{u}` returns "no upstream configured", so nothing was pushed.

## 4. File Existence

| Check | Evidence | Result |
|---|---|---|
| Design §4 edit sites, as amended by A1 and A2 | `git diff --stat 6e802a5..HEAD -- ':!docs/specs'` lists exactly: `.claude/commands/akili-constitution.md`, `.claude/templates/model-registry.json`, `CHANGELOG.md`, `bin/routing.js` (1 line, A1), `docs/cli.md`, `docs/commands/akili-constitution.md`, `docs/model-routing.md`, `test/routing.test.js` | PASS |
| A2: `.claude/templates/model-routing.section.md` unchanged | Not in the diff stat. `:48` still reads "Gemini 3.1 Pro as the T3 auditor" (`git grep`) | PASS |
| A4 site: Step 8E example | `.claude/commands/akili-constitution.md:838-848` → `name: akili-implementer`, `model: flash`, `subagent: true`, `mainAgent: false`, no `tools:`, persona `.agents/implementer.md` | PASS |

## 5. Build Integrity

All of these were run by me at `20184cc`.

| Command | Output | Result |
|---|---|---|
| `npm test` | `# tests 259` · `# pass 259` · `# fail 0` · `# skipped 0` | PASS |
| `npm run verify:cli` | `Summary: 11 commands \| 24 skills \| 8 resources (akili-specs v2.32.2)` | PASS |
| `npm run pack:dry-run` | `total files: 280`, package size 2.2 MB | PASS |
| `git diff --check` (worktree) and `git diff --check 6e802a5..HEAD` | both rc=0, no output | PASS |

## 6. Requirement Coverage

Coverage is checked clause by clause. "Re-run" means I executed it; it is not quoted from `test-report.md`.

| Req | Clause | Owner | Evidence | Result |
|---|---|---|---|---|
| FR-1 | Retired ids: 0 hits | T1, T2 | Re-run: `grep -rn "gemini-3.1-pro-high\|claude-sonnet-4-6" .claude/templates docs/model-routing.md bin .claude/commands` → rc=1 | PASS |
| FR-1 | `AND` Argon High and Sonnet 5.5 High in `models[]`, with `alias:false` and `dated:false` | T1 | Re-run node script: both present, `false false` | PASS |
| FR-1 | `BUT` no unrouted roster ids | T1 | Re-run: set of `tierPreference` ids (placeholders excluded) equals the `models[]` ids → `true`. 5 entries; no `-argon-low`, no `gpt-oss` | PASS |
| FR-1 | `AND IT MUST` labels byte-equal to `agy models` | T1 | Re-run `agy models` (agy 1.4.2, 13 rows, rc=0): 5/5 `served label-ok` | PASS |
| FR-2 | T1/T3 → `gemini-4-argon-high`, T2 Flash Medium | T1, T3 | Re-run scratch `akili routing` (I1): `AGENTS.md:49`/`:51` Antigravity cells are `gemini-4-argon-high`. JSON `tierPreference` diff matches design §5. Tests `(i)`, 134 green | PASS |
| FR-2 | `AND` author ≠ auditor satisfied | T3 | I1 `AGENTS.md:74` "Implementer (T2) `gemini-3.8-flash-medium` ≠ Reviewer (T3) `gemini-4-argon-high`"; `grep -c "NOT satisfied"` → 0; test `(g)` | PASS |
| FR-2 | `BUT` no other host changed | T1 | Re-run: `claude`, `opencode`, `codex`, `cursor`, `version`, `crossHost` deep-equal to `6e802a5` → all `true`. Word-diff of the doc touches only Antigravity text and the Antigravity half of the T3 Fallback cell | PASS |
| FR-3 | Implementer/Tester `flash`; Leader/Reviewer skipped, naming `gemini-4-argon-high` | T3 | I1 re-run: `created` only `akili-implementer`, `akili-tester`; `model: flash` ×2; both `no wrapper — \`gemini-4-argon-high\`…` lines; exit 0. Tests 66 and 82. (Note: `test-report.md` also cites `(i)` for Implementer/Tester, but `(i)` hits `continue` before the Implementer check on Antigravity, so 66 and I1 are the real evidence) | PASS |
| FR-3 | `BUT` no `model:` outside `inherit`/`flash`/`pro` | T1, T3 | `bin/routing.js:649-650`: the value comes only from `entry.wrapperModel`, otherwise the role is skipped. Every Antigravity `wrapperModel` in the registry is `flash` (enumerated). Re-run `agy plugin validate --strict --json` on the rendered wrappers → `"agents": 2`, `"findings": []` | PASS |
| FR-3 | `AND IT MUST` documented in `docs/model-routing.md` (paragraph + wrapper row) with the C-Q1 date | T1 (T2, T4 other sites) | `docs/model-routing.md:247-257` "Argon is not a wrapper tier … (2026-10-18)"; `:537` row. See W1/W2 for sites still stale | PASS |
| FR-3 | T4 site traceability | T4 | `tasks.md` T4 cites "FR-3 `BUT` (no instruction leads to a `model:` value that binds an unconfirmed tier…)". FR-3 `BUT` actually reads "must NOT write any `agent.md` whose `model:` is not one of `inherit`, `flash`, `pro`", and `model: pro` is inside that set. The site really falls under the FR-3 scenario ("Leader and Reviewer are skipped") and `AND IT MUST`. Coverage exists, but the clause cited is the wrong one | **WARN (W6)** |
| FR-4 | Dates `2026-10-18` | T1 | JSON `lastVerified: "2026-10-18"`; `docs/model-routing.md:135` and `:237` read `2026-10-18`; `:104` *Registry updated: 2026-10* | PASS |
| FR-4 | Prose: Argon top, 3.1 Pro / Sonnet 4.6 text dropped | T1 | `:237-245` re-read; `git grep -i '3\.1 Pro\|Sonnet 4\.6'` hits only `model-routing.section.md:48` (A2, out of scope) | PASS |
| FR-4 | Drift test passes | T1 | `node --test test/registry-drift.test.js` is part of the 259 | PASS |
| FR-4 | `AND IT MUST` falsifier still red | T1 | Re-run in a scratch `git archive` copy: T1 cell → `` `gemini-9-bogus` `` → `not ok 1 … 'antigravity T1: id \`gemini-9-bogus\` in the doc cell is not in models[]'`, `# fail 1` | PASS |
| FR-5 | Suite green | T3 | `npm test` 259/0 (§5) | PASS |
| FR-5 | `BUT` no deleted or weakened test | T3 | Re-counted: `186c6a0` 136 titles / 383 `assert.*(` / 120 `deepEqual` → HEAD 136 / 391 / 121. Falsifiers re-run in scratch: `:842` reverted → `not ok 82`; `const tools = [];` → `not ok 66`, `not ok 82` | PASS |
| NFR-1 | `verify:cli`, `pack:dry-run`, `diff --check` | T3 | §5, re-run | PASS |
| NFR-2 | CHANGELOG `Unreleased`, quote-checked, patch | T3, T4 | Every clause checked at HEAD; see §8 | PASS |
| NFR-3 | Local commits, prefixed; no push/release | all | §3 | PASS |

## 7. Linting & Code Quality

No linter is configured. The code delta is one condition, `bin/routing.js:842` (`planned.leader`), and it matches DD-1 as amended.

**4R sweep. These are ADVISORY unless they contradict a spec clause; the four rated WARN contradict shipped rules text.**

| # | Lens | Finding | Evidence | Result |
|---|---|---|---|---|
| W1 | Reliability | Step 8E's `/agents` verification paragraph still tells the agent to tell the user "**only `akili-leader` appears.** … One entry is the success condition." On the packaged roster the Leader is skipped, so `/agents` lists nothing, and an agent following the rules text would report a failure as success or a success as failure. A1 (P-10) fixed exactly this claim in code but did not mirror it into the rules text. The bullet's opening, "create `.agents/agents/akili-leader/agent.md`, `akili-implementer/`, `akili-reviewer/`, and `akili-tester/`", also still names all four | `.claude/commands/akili-constitution.md:833-834`, `:870-874` | WARN |
| W2 | Readability | "a structural author ≠ auditor guarantee (the Reviewer wrapper pins a different model than the Implementer wrapper)" is false for Antigravity on the packaged roster. The line predates the spec; this change made it untrue | `docs/commands/akili-constitution.md:98`; carried forward from T2 ADVISORY 3 | WARN |
| W3 | Readability | `:242` "Argon is a different family from the T2 Flash coder, so author ≠ auditor is satisfied" is unconditional. `:253` "To keep author ≠ auditor, run the session on `gemini-4-argon-high`" makes it conditional. Both are true at different layers (the registry check versus the runtime), but the text does not say which is which | `docs/model-routing.md:242`, `:253`; carried forward from T1 ADVISORY 2 | WARN |
| W5 | Risk | A2 known debt, confirmed live: a freshly rendered `AGENTS.md` has T3 = `gemini-4-argon-high` at `:51` and "Gemini 3.1 Pro as the T3 auditor" at `:58`. It is approved and recorded in the CHANGELOG, but it ships a self-contradiction to every new Antigravity project | scratch I1 `AGENTS.md:51`, `:58`; design §14 | WARN (accepted debt) |
| — | Readability | Test `(g)` title still says "distinct wrapper models"; Argon has none (T3 ADVISORY 1) | `test/routing.test.js` `(g)` | ADVISORY |
| — | Readability | `(i)` comment cites "(FR-5)" for a behaviour change that FR-3 defines | `test/routing.test.js` `(i)` | ADVISORY |
| — | Readability | CHANGELOG `### Fixed` "stand alone": the Tester same-model line also prints (T3 ADVISORY 2) | I1 output | ADVISORY |
| — | Risk | Skip text "(flash \| pro)" omits `inherit`; rejected on purpose in DD-1 | `bin/routing.js:649` | ADVISORY |
| — | Readability | Step 8E `model` row keeps `pro` in the value set with no rule for when it is written (T2 ADVISORY 2); `tools` guidance describes a Reviewer that gets no wrapper on the packaged roster (T4 ADVISORY 1) | `.claude/commands/akili-constitution.md:852-866` | ADVISORY |
| — | Readability | Quote the full upgrade command in the DD-4 reopen sentence (T1 ADVISORY 1); one ~100-column line (T1 ADVISORY 3); keep the two Implementer `description` examples in sync (T4 ADVISORY 2) | `docs/model-routing.md` | ADVISORY |

## 8. Design Conformance

| Item | Evidence | Result |
|---|---|---|
| DD-1 (amended A1): one code edit, the `/agents` line only with `planned.leader` | diff `bin/routing.js:842`; falsifier re-run red | PASS |
| DD-2: Argon has no `wrapperModel` | JSON entry has no `wrapperModel` key | PASS |
| DD-3: mitigation documented | `docs/model-routing.md:253-255`; CHANGELOG "Mitigation" | PASS |
| DD-4: reopen path sentence | `docs/model-routing.md:255-257` | PASS |
| DD-5: order Argon → Flash ×3 → Claude | JSON `models[]` | PASS |
| DD-6 (extended): rebase by role; registry-clone seam | tests 66, 82 clone `wrapperModel = "pro"`; 69 → `claude-sonnet-5-5-high`; `:297`, `(g)`, `(h)` → Argon; `:337` Cursor id untouched | PASS |
| DD-7 (A4): example → Implementer `flash`, no `tools:` | `.claude/commands/akili-constitution.md:838-848` | PASS |
| CHANGELOG quote-check (KZ-002) | Each `Unreleased` clause checked at HEAD: the ids, fallback, and `lastVerified` match the JSON; "rejected every Argon spelling tried" matches design P-3; "Implementer and Tester keep their `flash` wrappers" and the `/agents` fix match I1; the Step 8E example clause matches `:838-848`; "Known debt … `model-routing.section.md` still names Gemini 3.1 Pro" matches `:48`. The "plain re-run … degrades" clause rests on design P-14 (scratch `repro-fence3`), which I did not re-run because it needs the pre-change registry | PASS |
| Proposal alignment: intent, scope, non-goals | Other hosts, effort dial, T6, `gpt-oss`, and project `AGENTS.md` are untouched. Two literal differences, both superseded by approved decisions: (a) the Proposed Outcome says "still writes a valid Antigravity wrapper for every role whose tier routes to Argon"; what shipped is the "or … skips with a reason, which the docs state" branch (Q1 negative, FR-3); (b) the ADDED Requirements list `gemini-4-argon-{high,medium,low}`; only `-high` shipped (Q3, FR-1 `BUT`). Every success criterion passes literally, the wrapper criterion through its "or a skip reason" branch | PASS (noted) |
| Cross-document figure check | See below | **WARN (W4)** |

**W4: figures that contradict each other.**

| Figure | Where | Contradiction |
|---|---|---|
| Rejected wrapper candidates | `requirements.md` §4: "rejects `argon`, `Argon`, `gemini-4-argon`, `gemini-4-argon-high`, `gemini-4`, and **nine** other candidates" = 14 | design P-3 lists 3 + 13 = **16** (5 Argon + 11 others); `docs/model-routing.md:248` says 16 |
| Candidates "given" | `docs/model-routing.md:248` "rejected all 16 candidate values **it was given**" | design P-2: run 1 had 5 values, run 2 had 14. That is **19 given**, of which `flash`, `pro`, `inherit` loaded and 16 were rejected. The sentence the T1 Reviewer fixed still overstates what was given |
| Retired-id hits in tests | design P-8: `grep -n "gemini-3.1-pro-high\|claude-sonnet-4-6" test/routing.test.js` → "**9** hits" | re-run at `b8289f6`: **10** lines (297, 337, 700, 701, 1439, 1440, 1442, 1449, 1455, 1458) |

**Figures that agree.**

- Tests 259 / 136 (re-run).
- 136 = 131 + 5 red.
- Assertions 383 → 391, `deepEqual` 120 → 121 (re-counted).
- 13 roster ids (re-run).
- 4 T2 sites in 3 files.
- Review rounds 5/6.
- Budget 4 tasks / ~150 LOC / 6 rounds, consistent across `tasks.md`, `execution.md`, and design §16.
- pack: 280 files.
- 5 accepted gaps.

Not a finding: `execution.md` LOC 151 is the sum of the per-commit stats (`34+19`, `4+4`, `55+22`, `5+8`, re-run). The net diff is 149 because T4 rewrote a CHANGELOG line T3 had added.

Design-internal note: §2, §3 and §7 still say "no runtime code changes" / "No edit". §13 A1 records that it refutes DD-1. The amendments are appended rather than inlined, which is the repo's pattern, so this is not counted.

## 9. Test Evidence Summary

| Evidence | Source | Re-run by validator |
|---|---|---|
| Unit 259/259 | `npm test` | yes |
| Drift falsifier red | scratch copy | yes |
| `:842` and `tools` falsifiers red | scratch copy | yes |
| I1 fresh routing (packaged ids) | scratch `validate-i1` | yes, exit 0, matches the test report |
| I2 `agy plugin validate` | scratch plugin | yes, `"agents": 2`, `"findings": []` (needs a `plugin.json`; `.agents` alone errors with "no plugin.json found") |
| I3 idempotence | scratch | yes, `no changes` |
| I4 retired id fails fast | `test-report.md` | not re-run (P-15 evidence) |
| Roster and labels | `agy models` | yes, 5/5 |
| Accepted gaps A–E | `test-report.md` §9 | reviewed. Gap C (which model `pro` runs) remains the user's live probe (DD-4) |

## 10. Agent Guide / Constitution Impact

`execution.md` has no `## Constitution Impact` block. None was needed: no module was created or reshaped, the code delta is one condition in an existing function, and `AGENTS.md`'s description of `bin/routing.js`, the registry, and the templates is still accurate. **PASS.**

## 11. Remediation

None of these blocks the archive. Each WARN is recorded, not fixed (validator scope).

| WARN | Suggested route | Owner |
|---|---|---|
| W1 | `/akili-quick`-sized rules edit, or fold into the queued template-evolution / A3 Bug spec: make the `/agents` paragraph conditional on a Leader wrapper being written, and say which of the four wrappers Step 8E creates when a role is skipped | user decides |
| W2, W3 | Copy edits in `docs/` (qualify the Antigravity case; add the forward reference to the session-model condition) | user decides |
| W4 | Correct `requirements.md` §4 ("nine" → "eleven"), design P-8 ("9" → "10"), and the doc's "it was given" → "16 rejected of 19 tried" at archive or in a quick change | user decides |
| W5 | Already queued: the template-evolution Bug (design A2) | queued |
| W6 | Traceability note only; record at archive | Kaizen candidate |

## 12. Archive Readiness Recommendation

**Ready to archive.** Every task is `[x]` with Reviewer PASS, every FR/NFR clause has evidence I re-ran, and the build is green. Carry W1–W6 and the ADVISORY items into the Kaizen retrospective. W1 and W4 are the strongest lesson candidates:

- **W1:** a code fix whose claim also lives in rules text needs a sweep of the rules text (KZ-changes--kaizen-loop-closure-2 family).
- **W4:** counts restated across spec documents (KZ-002 family).
