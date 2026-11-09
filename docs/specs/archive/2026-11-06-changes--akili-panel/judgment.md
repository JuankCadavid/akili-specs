# Judgment Day: changes/akili-panel design

## Document Control

| Field | Value |
|---|---|
| Target | `requirements.md` + `design.md` as written 2026-11-05 at `7a697ba`, before any fix (frozen for round 1); `proposal.md` as context |
| Mode | `judgment_day`, `/akili-specify` Step 2.5 **Review Design** |
| Who asked | JC's mandate (2026-11-05): "Run judgment-day on the design as the skill requires … Fix findings per skill if you can without asking JC to approve the design." This mandate is the answer to the skill's "ask before round-one correction" gate |
| Judges | Two blind, read-only judges, run in parallel with the same prompt, scope and skill paths. Model **Sonnet**; the design author is Opus (author ≠ auditor) |
| Round | 1 of at most 2. Round 2 **not run**, by JC's choice |
| State | **Closed: `fixed, not re-judged`.** JC (Juan Carlos Cadavid) answered the review gate 2026-11-05 ~20:07 America/Bogota with «Fix only» (option 2: apply the fixes for A-1, A-2 and the warnings both judges raised; no re-judgment). Fixed in round 1: J-1 … J-5, A-1, A-2, W-1 … W-14. The skill's terminal states (`APPROVED` / `ESCALATED`) are not claimed: no re-judgment ran |
| JC's answer | «Fix only» — JC, 2026-11-05 ~20:07 America/Bogota |

## Counts

| Judge | Severe | Warning | Suggestion |
|---|---|---|---|
| A | 3 | 12 | 6 |
| B | 5 | 14 | 10 |

| Merged | Count | IDs |
|---|---|---|
| Confirmed: both judges report the defect, at least one rates it severe | 5 | J-1 … J-5 |
| Suspect: severe from one judge only | 2 | A-1, A-2 |
| Contradictions | 0 | — |
| Info: warning or suggestion | the rest | see *Info* |

**On the merge rule.** For J-2 … J-5 one judge rated the defect severe and the other rated the same defect a warning or suggestion. Both judges found each defect, and each fix has one answer read from the source, so the rows are treated as confirmed. Where the ratings differ, the severity follows the higher one.

## Confirmed findings and round-1 fixes

| ID | Judges | Finding | Settled at source (as run) | Fix applied |
|---|---|---|---|---|
| J-1 | A-3 severe, B-1 severe | The kept spec was "the first argument" of a spec-taking command. `/akili-propose` takes a bare slug, which maps to `changes/<slug>`, or a sentence, so the kept value would never match a folder. A sentence would also overwrite a valid kept spec | `.claude/commands/akili-propose.md:32-38` | **requirements:** glossary *Spec-taking command*, FR-5 step 1, new scenario *Propose arguments*. **design:** §5.1 and new P-30. **tasks:** T4, T6 and the coverage rows |
| J-2 | B-3 severe, A-8 warning | FR-4 said `--fix` restores a "missing or differing" plugin "the same way it restores a skill". Skills' `--fix` never writes a differing entry | `bin/akili.js:1666`, `:1677-1679` | **requirements:** FR-4 restores missing only and reports differing as `DIFFERS`; new scenario *Differing plugin*. **design:** §6.3, §7.3 and new P-31. **tasks:** T3 falsifier (4) and the coverage row |
| J-3 | B-4 severe, A-5 warning | NFR-2 allowed one process, while §6.2 allowed two | `git rev-parse` cannot return both values in one call (P-22, as run); `.git` of this worktree → `gitdir: …/worktrees/akili-panel`, whose `HEAD` → `ref: refs/heads/JuankCadavid/akili-panel` | Took B's better fix: **no process at all**. The branch is read from `.git` files (new DD-17), which also clears B-13 (exit-code 128 ambiguity) and B-22 (`$.process` exists only in the CLI). **requirements:** FR-11 rewritten, new scenario *Subfolder and detached*, NFR-2 gets numeric ceilings (this also clears B-19). **design:** §3, §5.3, §6.1, §6.2, DD-17, P-21/P-22 withdrawn, new P-33. **tasks:** T1, T4, T5 and the coverage rows |
| J-4 | B-2 severe, A-6 warning | The token rule missed the formats real `tasks.md` files use: backticks, trailing text, `**Status:**` values, heading tokens, and no tokens at all | Corpus scan of 47 archived `tasks.md` files (P-17 row) | **requirements:** glossary *Task status token* (four places, backticks optional, trailing text allowed, `## Document Control` skipped), FR-6 adds `▶ (no task status)`, new scenarios *Real status formats* (with CRLF) and *No status at all*. **design:** §5.3, P-17. **tasks:** T4 fixtures and falsifiers |
| J-5 | B-5 severe, A-17 suggestion | The design said io paths were "relative to the project root", but `$.fs` resolves relative paths against the working directory, and a timer reads the session's directory | `types:3378`, `:3392`, `:3423` | **design:** §6.2 now passes only absolute paths, built from `await $.session.root()` read at the start of each refresh; new P-32. **tasks:** the T4 io wrapper asserts every path is absolute; there is a falsifier for it |

**Author sync made in the same pass** (not judge-driven; this is Correction Closure):

- Task IDs in `design.md` §12 and in `requirements.md` §8 now match `tasks.md` (T1–T9). This was A-7.
- The code LOC subtotal now reads ~680. This was A-7 and B-28.
- The budget now reads 9 tasks and 15 review rounds.

**Sweeps run after the fixes:**

- forward: `grep -n "process\|rev-parse\|git command\|one process\|T7\|first argument\|or differing"` over the three documents;
- backward: every reader of FR-4, FR-5, FR-6, FR-11 and NFR-2 in `design.md` and `tasks.md`.

The hits that remain are the intended ones: DD-17's rejected alternative, the withdrawn P-21 and P-22 rows, and the *Not used* row for `$.process`.

## Suspect findings (one judge; fixed on JC's «Fix only»)

| ID | Judge | Finding | Architect's single re-run | Fix applied (2026-11-05, after «Fix only») |
|---|---|---|---|---|
| A-1 | A, severe | `akili update` runs `npm install -g akili-specs@latest` and then calls `runInstall` **inside the old process**. The first update from 2.42.0 or earlier would copy `akili-panel/` into every target with the **old** installer: opencode, antigravity, the codex/cursor shared root, and grokbot, recorded as owned there. Nothing removes those copies later, and the new tests cannot see this | **Reproduces.** `bin/akili.js:1467-1478`: the package update is followed by `args.force = true; runInstall(args);` in the running process. Judge B's related B-7 (warning) says FR-2 has no executable gate | **requirements:** FR-2 retitled and extended, with a new scenario *Upgrade from an old installer* (BUT foreign folder kept); FR-4 has a new scenario *Leaked copy*; §4.1 row; D-2. **design:** §7.4 (identification, install removal, doctor `LEAKED` and `--fix`, Grok Bot record, shared root, upgrade note), DD-18, §6.3, §7.3 rows, §13 risk, P-35, P-39. **tasks:** T2 (removal, seeded-leak and foreign-folder tests, falsifiers 3–4), T3 (`LEAKED`, falsifier 5), T8 (CHANGELOG note) |
| A-2 | A, severe | The trigger line names "pressing Next" as a user action, but no `live-path` row covers the dispatch `onPress` → `$.command.run` → the markdown command. Nothing settles when `$.command.run` resolves for a prompt command | **Reproduces** as a missing row. B-20 (suggestion) raises the same timing gap | **design:** P-34 (`UNVERIFIED`, High, live-path, dispatch chain named; T1 then T9), on the trigger line; DD-8 depends on it, with the `$.prompt.fill` fallback. **tasks:** T1 probe step and Done criteria (amend DD-8 at the next gate if refuted), T9 live button |

## Info (warnings and suggestions)

**Reported by both judges: folded in on JC's «Fix only»**, numbered W-n where the documents cite them:

| W | IDs | Point |
|---|---|---|
| W-1 | A-4 / B-12 | FR-7 says "same map as `/akili-resume` Step 4". The pane keys on the first unfinished phase and resume keys on the last phase reached; the outcomes agree. Reword the claim, and justify the extra `propose → /akili-propose <spec>` row |
| W-2 | A-9 / B-9 | Name the seam that skips `.claude-plugin/types/`. A policy sees only top-level names, and `copyTreeSync` and `compareEntry` (`bin/install-compare.js`) have no filter. Composed policies must forward `.detail`, `.finish` and `.restore` |
| W-3 | A-10 / B-8 / B-29 | Run the FR-15 test on a temporary copy of the package, because a live `types/` folder races the parallel tests that count `.claude/skills`. Add a ledger row for the `files` negation glob |
| W-4 | A-11 / B-17 | Every hook (`turn.complete`, `session.measure`, `session.end`, not only commands) calls `next(e)` first and schedules its work; the contract test asserts this and forbids `next({` |
| W-5 | A-12 / B-11 | `pending` is written with an atomic `update`, reset at `session.start`, and cleared after a bounded wait |
| W-6 | A-13 / B-18 | Two more consumers: `scripts/ci/install-layout-regression.js` (mirrors `SOURCE_SKILLS`) and `test/fixtures/doctor-codex-baseline.txt`. Add them to P-9, §4 and T2 *Consumers* |
| W-11 | A-14 / B-6 | P-18, P-19 and P-21 were probed under `-p` only. Say so in the rows, and record the exact probe command lines |
| W-7, W-8 | A-15 / B-14 | The plugin version and updates via the marketplace; the same plugin loaded twice (global, project and marketplace copies) |
| W-14 | A-16 / B-25 | Windows: `import(pathToFileURL(…))` in the flow tests, and `gitdir:` paths |
| W-10 | A-18 / B-10 | Gate refresh on `opened` and a live pane (`$.ui.panes()`), not only the timer; branch the `/akili-panel` reply on `isPlaced` |
| W-9 | A-19 / B-27 | Record `register.jsx` as a deviation from the proposal's `register.tsx`. Pin the `1 plugin` / `plugins` summary wording |
| W-12 | A-20 / B-15 | Reset `tokens` and `usage` on `/clear` **and** on resume; state what a resumed session shows |
| W-13 | A-21 / B-24 | P-27's scope: Cursor reads the global `~/.claude/skills` too. A project-folder plugin loads only after the project is trusted |

**Where each W-fix landed:** W-1 FR-7 wording and T4; W-2 design §7.2, DD-10, T2/T3 (`bin/install-compare.js` ignore option); W-3 FR-15 scenario on a temp copy, P-36 (the `files` negation glob verified with `npm pack --dry-run`, npm 10.9.9), T2; W-4 the *Every hook passes the event on first* rule in §6.1 and T5's contract test; W-5 the `pending` atom (atomic `update`, reset, 60 s bound); W-6 P-9 and T2 *Consumers*; W-7 DD-14 plus a `docs/release-checklist.md` step (T8); W-8 DD-19; W-9 DD-3 deviation, `1 plugin` / `<n> plugins`; W-10 DD-5 gating, NFR-8, the `isPlaced` reply, P-37; W-11 P-18, P-19, P-20 marked `-p` only, with the exact probe commands, and P-24's negative command; W-12 reset on `clear` and `resume`, P-38; W-13 P-27 widened and moved to T9, README trust note; W-14 `pathToFileURL` in the flow test.

**Reported by one judge — not folded in** (JC's «Fix only» named the both-judge warnings):

- B-7: FR-2 needs a gate.
- B-16: justify the ENV-2 reading.
- B-20: record the kept spec before `next`.
- B-21: the regex lookahead was not probed.
- B-23: FR-12's reliance on subagent turns.
- B-26: validate needs README and license only for the directory profile.

These are moot after J-3 or J-5: A-11's `$.process` argv allowlist, A-17, B-13, B-19 and B-22.

## Premise Ledger outcome

- **Both judges** reproduced the count line, 29 rows with 4 `UNVERIFIED`.
- **No citation failed to reproduce.** Both judges marked P-18 and P-23 `not re-run`, because the probe log keeps only the last run. A also marked P-21 and P-22 `not re-run`, and B marked P-19. Each `not re-run` row was corroborated from the types file instead.
- **Rows missing for premises the design depended on:** these became P-30 (J-1), P-31 (J-2) and P-32 (J-5). A-2's missing live-path row is still suspect.
- **After round 1:** 33 rows, 2 of them withdrawn (P-21, P-22), 27 verified, 4 `UNVERIFIED` (P-24 High; P-25, P-26 and P-27 Low).
- **After the «Fix only» pass:** 40 rows, 2 withdrawn, 33 verified, 5 `UNVERIFIED` (P-24 and P-34 High; P-25, P-26, P-27 Low). New rows: P-34 (A-2), P-35 and P-39 (A-1), P-36 (W-3), P-37 (W-10), P-38 (W-12), P-40 (W-2).

## Closing

`fixed, not re-judged` — J-1, J-2, J-3, J-4, J-5, A-1, A-2, W-1 … W-14.

No round 2 was run: JC chose «Fix only» (2026-11-05 ~20:07 America/Bogota). This transaction is closed and is never recorded as `JUDGMENT: APPROVED`. The design and tasks still wait for JC's own approval at the next gate.
