# Execution Log: changes/akili-panel

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-panel` |
| Approval | Design and tasks approved by JC (Juan Carlos Cadavid), 2026-11-05 ~20:27 America/Bogota: «Apruebo diseño y tasks, sigue con /akili-execute changes/akili-panel» |
| Approval Mode | `gated` (unchanged; not pre-approved) |
| Owner mandate | Run `/akili-execute`, starting with T1. Stop on a fallen High premise (P-24, P-34), at T9 (live HITL), and at every methodology gate. Local commits only: no push, PR, merge, tag, release or publish. No global installs; `~/.claude/skills` probe (T1 placement b) needs a separate OK from JC |
| Branch / worktree | `JuankCadavid/akili-panel` at `/Users/jcadavid/orca/workspaces/sdd-jc-methodology/akili-panel` |
| Baseline | `7a697ba`; `npm test` 1450 pass / 0 fail (tasks.md Document Control) |
| Session | Leader on `claude-opus-5-5` (T1 tier). Started 2026-11-05 ~20:30 America/Bogota |
| Workers | No Step 8E wrappers in this repo → fallback sub-prompts: Implementer `sonnet` (T2), Reviewer `opus` (author ≠ auditor), each told to read its `.agents/` persona first |
| Personas | `.agents/` was absent in this worktree (gitignored, per-machine). Scaffolded 2026-11-05 by copying `.claude/templates/{leader,implementer,reviewer,tester}.md` (the canonical source `/akili-constitution` copies). `node bin/akili.js doctor --agents` → every section `CURRENT`, "No persona drift blocking CI" |
| Budget (design §12) | 9 tasks · ~2,100 LOC · 15 review rounds |

## Task Execution History

### T1: Settle the open premises with a live probe — `[~]` PIVOT GATE (attempt 1 FAIL; awaiting JC)

- **Date:** 2026-11-05 (America/Bogota ~20:30–20:50)
- **Final status:** `pivot` — stopped by the owner mandate's rule «If T1 shows a High premise fails (P-24 or P-34) and that changes the design: STOP immediately … ask JC whether to pivot / revise design / stop». P-34 partly fell (see Reviewer issues 1–2), and P-24(b) is still unverified (issue 4)
- **Requirements covered (evidence only):** FR-1 delivery premise (P-24 a), FR-7 dispatch premise (P-34), FR-12 / D-9 (P-25), FR-15 (P-26)
- **Skills:** `systematic-debugging` (as listed). Implementer effort `high` (live environment, timing-sensitive). Model: Implementer `sonnet`, Reviewer `opus`
- **Leader narrowing in the brief:** placement (b) not run, because JC had not given the separate OK to write into `~/.claude/skills`. The Leader checked a throwaway `HOME` first: `HOME=<tmp> security find-generic-password -s "Claude Code-credentials"` returned not visible, so such a session would not be logged in, and that route was ruled out. `CLAUDE_CONFIG_DIR` was not used either. The child was launched with the nesting env stripped (`env -u CLAUDECODE …`), under `/usr/bin/expect`, with `--model haiku --debug-file`; no `-p`, no `--plugin-dir`, no `CLAUDE_CODE_PLUGIN_DIRS`

#### Attempt 1

- **Files changed (repo):** none. Probe tree `/tmp/akili-t1.0PjE/proj` (git-initialised; project command `.claude/commands/akili-probe.md`; probe `proj/.claude/skills/akili-probe/{.claude-plugin/plugin.json, hooks/hooks.json, hooks/register.js}`), deleted after the run. Raw evidence kept at `/tmp/akili-t1-evidence.txt` (191 lines: `events.log`, debug excerpts, `drive.exp`, the module). The excerpts below are copied from it
- **Side effect outside the repo:** the Implementer accepted Claude Code's own trust dialog, so `~/.claude.json` now holds a `"/private/tmp/akili-t1.0PjE/proj"` project entry (line 4987). It was not hand-edited, and nothing was created under `~/.claude/skills`. Claude Code also wrote its normal transcripts for that path under `~/.claude/projects/`
- **Implementer verification (Claude Code 2.1.318):**
  - **P-24(a) adoption, project skills folder, interactive:** before trust, the debug log has `hooks modules not loaded until workspace trust is accepted`. After trust:
    - `clearPluginCache: invalidating loadAllPlugins cache (post-trust: re-discover project @skills-dir plugins)`
    - `hooks module akili-probe@skills-dir loaded (worker, environment 2, tier user); events: session.start,turn.start,command.run,skill.prompt,tool.call,turn.complete`
    - `plugin.register: akili-probe (user, akili-probe@skills-dir), judged by cc-plugin-sec-default: admitted`

    `events.log` was written, with `session.start … isInteractive:true`. This explains the specify-time negative (untrusted project, `-p`): adoption starts at workspace trust
  - **P-18 / P-19 / P-20, now observed interactively:**
    - typed `/akili-probe x` → `1793928847422 command.run akili-probe args="x" origin={"kind":"composer"}`
    - Skill tool → `tool.call Skill input={"skill":"akili-probe","args":"y"}`, with no `command.run`
    - `skill.prompt bypassed by cc-plugin-sec-default (tier user); beneath runs`
  - **Falsifier (observed):** with `plugin.json` removed, a fresh log path and a new session: `ls /tmp/akili-t1.0PjE/events-falsifier.log: No such file or directory`, and no `hooks module akili-probe` line. Caution: `Read hooks.json for plugin akili-probe (enabled=true)` still appears without `plugin.json`, so that line is **not** adoption evidence
  - **P-26:** `find …/akili-probe/.claude-plugin -maxdepth 3`, run mid-session and again after exit, shows only `plugin.json`. No `types/` was written
  - **P-25 (per-turn `usage`):**
    - The main turn that spawned the subagent: `1793928897506 turn.complete agent=main … output_tokens:167 … cache_creation_input_tokens:1142`
    - The subagent's turn: `1793928901475 turn.complete agent=af8b04fe83308aef5 … output_tokens:295 … cache_creation_input_tokens:41892`
    - The hand-back main turn: output 41, cache-creation 461
    - The subagent ran in the background: the parent turn completed first
  - **P-34 (from a `$.clock.after` timer):**

    | Call | Called | Settled | Turn |
    |---|---|---|---|
    | Idle timer, 20 s after `session.start` | `1793928824108` | `1793928824595 … RESOLVED after 487ms value={}` | Its run's `turn.start` at `1793928824609` |
    | Mid-turn timer | `1793928826215` | `RESOLVED after 1815ms value={}` at `1793928828030` | The running turn's `turn.complete` came first, at `1793928827571`; the queued run's `turn.start` followed at `1793928828033` |

    - Both runs executed the markdown command (answer `PONG`), with no rejection. Debug: `$.command.run (akili-probe): 39 chars queued`
    - **The plugin's own `command.run` observer is skipped for its own call:** `hooks module akili-probe@skills-dir command.run skipped: re-entry (the plugin's own code raised it; origin akili-probe)`
  - `claude plugin validate <probe>` was reported as "passed with warnings" (author, README, LICENSE, icon). That output is not in the evidence file
- **Evidence re-run (non-author, Leader-inline):** `VERIFIED`, by comparison. Every line quoted in the Implementer report was grepped in `/tmp/akili-t1-evidence.txt`, and each was found: the adoption line, the post-trust line, the trust line, `admitted`, `origin={"kind":"composer"}`, `tool.call Skill`, `isInteractive`, the bypass line, the re-entry line, `39 chars queued`, the `RESOLVED` lines, the subagent id, and the falsifier `ls`. One exception: the `plugin validate` result is reported only. The live session was not repeated, because the probe tree had been deleted per the Done criteria. The Leader also confirmed: no `/tmp/akili-t1.*` left, no probe in `~/.claude/skills`, and no `akili-t1` process running
- **Reviewer verdict (opus, `checklist`): `FAIL`**, verbatim:

> STATUS: FAIL
> SUMMARY: The evidence is real and the raw lines back it up. P-24(a) and P-26 hold as stated, and the disqualifiers were respected. Three verdicts still claim more than the logs show, and one approved design clause conflicts with what was observed. All of this can be fixed in the `execution.md` entry and at the gate, which has not been written yet (`execution.md` has no T1 row, so the Done criteria are still open). No new probe is needed unless P-25 must cover foreground subagents. There is no test gate here, so the red-run trace does not apply. P-24(b) is honestly reported as not run.
>
> Checks that passed:
> - **Disqualifiers:** `drive.exp` runs `claude --model haiku --debug-file` under an expect pty, with no `-p` and no `--plugin-dir`. `CLAUDE_CODE_PLUGIN_DIRS` is not explicitly unset. Even so, the adoption id `akili-probe@skills-dir` and the line `folders of plugins none` show the plugin was loaded from the skills folder, not some other way. The log also has `isInteractive:true`.
> - **Falsifier:** observed. There is no `events-falsifier.log`, and the Implementer correctly marks `Read hooks.json … (enabled=true)` as not counting as adoption evidence.
> - **P-26 refuted:** the `find` output supports it.
>
> ISSUES:
> 1. **Discovered Issue:** "P-34 verified" goes beyond the evidence. The promise settles when the command leaves the queue, so its settle time is however long the running turn takes: 487 ms when idle, 1815 ms mid-turn, where the turn lasted 3.4 s. Nothing shows that wait is bounded for long turns. That breaks the 60 s `pending` rule. Suppose a press happens during an `/akili-execute` turn longer than 60 s. `pending` clears at 60 s, a second press queues a second run, and FR-7's Double press scenario fails.
>    * **Violated Rule:** design.md:352 (P-34 "settles in a bounded time"; Breaks-if "the 60 s `pending` bound may be wrong"); design.md:146, :177; requirements.md:349-350.
>    * **Remediation Suggestion:** Record P-34 as: the command ran ✓, the promise settled ✓, and it settles at dequeue, so the wait is bounded only by the busy turn. Raise the `pending` bound at the gate before T5. For example, clear it on the queued command's `turn.start` instead of after 60 s.
>
> 2. **Discovered Issue:** The design assumes something the logs contradict. The plugin's own `$.command.run` call never passes through its own `command.run` observer: `command.run skipped: re-entry (the plugin's own code raised it; origin akili-probe)`. Two approved clauses rely on that path:
>    - design.md:59 `PR -->|$.command.run| CR` and :49 `CR --> OBS`
>    - P-34 (design.md:352) "`command.run` chain (this plugin's observer included)"
>
>    The observer in design.md:171 is what saves the kept spec. So a pressed Next is never recorded under FR-5 rule 1, while the same command typed by the person is recorded. That conflicts with requirements.md:331, "run that command as if the person typed it", wherever kept-spec behaviour is concerned. Refresh still happens through `turn.complete`, so the impact is limited to the kept spec.
>    * **Violated Rule:** design.md:49/59/171/352 compared with requirements.md:197-199 and :331.
>    * **Remediation Suggestion:** Record this as a spec tension and amend DD-8 at the gate before T5. Either `onPress` saves the kept spec itself using FR-5's rule, or FR-5/FR-7 say that presses are not "observed". Then fix the §3 diagram.
>
> 3. **Discovered Issue:** The "P-25 no double count" result rests on a subagent that ran in the background. The parent turn finished first ("The subagent is still running"). That arrangement cannot show whether a foreground, blocking Agent call folds the subagent's usage into the parent turn's `turn.complete`. Separately, the claim that `$.session.usage().cost` is a "cumulative ledger including the subagent" does not hold up even roughly. I fitted per-token prices to the five main-loop turns and the cost increments do not fit any non-negative price set. The turn that spawned the subagent added 0.0067. The subagent's own turn added only 0.0011, despite 41,892 cache-creation tokens, which is about 0.008 at the rate implied by turn 1.
>    * **Violated Rule:** design.md:343 P-25 (statement covers all subagents) and DD-9.
>    * **Remediation Suggestion:** Either re-run with a foreground subagent, or record P-25 as verified for background subagents only. Drop the cost-ledger claim or label it as unproven.
>
> 4. **Discovered Issue (Leader gate):** DD-1 is still unsettled. Placement (a) shows that the project folder works after the workspace is trusted. DD-1 ships to `~/.claude/skills/akili-panel` (design.md:288), and placement (b) was not observed. The only hint is that the skills loader scans `user=…/.claude/skills`. T2–T9 depend on DD-1.
>    * **Violated Rule:** tasks.md T1 Done criteria (verdict needed for both (a) and (b)); design.md:342 (High).
>    * **Remediation Suggestion:** Record P-24(b) as UNVERIFIED. Before T2, get JC's OK to run (b), or his explicit acceptance of building T2 on top of the open premise.
>
> ADVISORY:
> - Reliability: The negative falsifier result would be stronger with `grep -c 'hooks module akili-probe'` = 0 recorded for session 2, plus one line showing that session reached ready.
> - Readability: The quoted `register.js` is the falsifier build (`events-falsifier.log`). Note that session 1 used the same module with `events.log`, which debug line 413 corroborates.
> - Risk: Session 1 shows `Loading skills from` at 01:36:16 and an unexplained `command.run settled` at 01:36:18. If the plugin was edited while that session was still running, P-26's "after exit" `find` may have come before a reload. P-26 is Low, so this is noted only.
> - Bonus: P-18, P-19 and P-20 are now observed interactively (`origin: composer`, Skill → `tool.call` with no `command.run`, `skill.prompt` bypassed). Upgrade their "-p only" caveat.
> - Not in the evidence file: the `claude plugin validate` result.

- **Leader adjudication:** all four issues are in scope and accepted. None of them is Implementer rework on the evidence, which holds. Issues 1, 2 and 4 are design / owner decisions. Issue 3 is settled either by one more probe session or by the requirements' own D-9 fallback. The attempt counter stands at 1 of 3. No attempt 2 is spawned before JC answers, because the mandate's stop rule applies first
- **Verdicts as recorded:**

  | Premise | Verdict | Evidence |
  |---|---|---|
  | P-24 (a), project `.claude/skills/<name>`, interactive | **Verified, after workspace trust** | adoption line, `admitted`, log written; falsifier observed |
  | P-24 (b), `~/.claude/skills/<name>` | **UNVERIFIED, not run** (JC's OK not given) | — |
  | P-25 | **Verified for background subagents only:** each `turn.complete` `usage` holds its own loop. Foreground (blocking) subagents are unobserved. The cost-ledger claim is withdrawn as unproven | per-turn lines above |
  | P-26 | **Refuted:** no `types/` written into the skills-folder plugin in this session. DD-16 stays (harmless, cheaper than needed; Low) | `find` output |
  | P-34 | **Partly refuted.** The command runs as typed (✓), and the promise settles (✓) when the command is dequeued, so the wait is bounded only by the running turn (✗ for the 60 s bound). The plugin's own `command.run` observer is skipped for its own call (✗ for "this plugin's observer included") | timing table, re-entry line |
  | P-18 / P-19 / P-20 | Now observed interactively (they were `-p` only before) | lines above |
- **ADVISORY (recorded, not acted on):** the four advisory lines above
- **Spawns:** Implementer `sonnet` 27 calls, 109,710 tokens, ended complete. Reviewer `opus` 10 calls, 86,762 tokens, ended complete (verdict FAIL)
- **Running totals vs budget:** tasks 0 / 9 closed · LOC 0 / ~2,100 · review rounds 1 / 15 (T1 budgeted 1; a second T1 round is now owed). The tripwire has not been passed

## Pivot Record: T1

**Blocker.** T1 settled P-24(a), P-25 (background only), P-26 and the run half of P-34. Three findings change approved design text or need JC, and the owner mandate stops the run on them:

| # | Finding | Approved text it contradicts | Options | Leader recommendation |
|---|---|---|---|---|
| A | A press's `$.command.run` settles when its command is **dequeued**, which happens after the running turn ends. A press made during a turn longer than 60 s would see `pending` time out, and a second press would queue a second run | DD-8 and §5.2 `pending` row ("treated as unset 60 s after `since`"); §6.1 Next `onPress` row; P-34 "settles in a bounded time"; FR-7 Double press | **A1:** `pending` clears on settle (resolve or reject), plus a fallback clear on the first main-loop `turn.start` after `since` whose text names `/<command>` (covers a promise dropped by a hot reload; `turn.start` text was observed as `<command-message>akili-probe</command-message>\n<command-name>/akili-probe …`). Still reset at `session.start`; no fixed time bound. This adds a `turn.start` hook (pass-through, `next(e)` first, like the others). **A2:** keep a time bound but raise it (e.g. 15 min): simpler, but a second press during a longer turn still queues twice | **A1** |
| B | The plugin's own `$.command.run` is **not** seen by its own `command.run` observer (`command.run skipped: re-entry`). A pressed Next therefore never records the kept spec, while a typed one does | design §3 diagram (`PR -->|$.command.run| CR`, `CR --> OBS`); P-34 "(this plugin's observer included)"; design §6.1 observer row (records the kept spec); requirements FR-7 "as if the person typed it" vs FR-5 step 1 | **B1:** the press handler records the kept spec itself, with FR-5 step 1's rule and the safe-path rule (the args are the displayed spec, so this only re-confirms it), on the clock after the call; fix the §3 diagram and P-34. **B2:** amend FR-5 / FR-7: a Next press is not an observed command, and the kept spec is unchanged on press | **B1** (keeps "as if typed" true for the pane) |
| C | P-24(b) is unverified. DD-1 ships the plugin to `~/.claude/skills/akili-panel` (`install --tool claude`); only the project folder (`--local`) was observed. A project-folder plugin also needs **workspace trust** before it loads | DD-1 depends on P-24 (High); T2 depends on "T1 (P-24 confirmed)" | **C1:** JC OKs one more interactive probe with the probe at `~/.claude/skills/akili-probe/`, removed afterwards (same session can settle P-25 for a foreground subagent). **C2:** JC accepts building T2–T4 on P-24(a) alone, with (b) carried to T9's global-copy check. **C3:** pivot DD-1 now (marketplace-only, or `CLAUDE_CODE_PLUGIN_DIRS`) | **C1** (one ~5-minute haiku session; settles DD-1 before the installer is built) |
| D | P-25 is settled for background subagents only | DD-9 ("subagents included"; double-count risk settled by T1) | **D1:** settle it in the C1 session with a foreground subagent. **D2:** take requirements D-9's approved fallback: an accepted risk, with the line labelled as the sum of turns | **D1** if C1 runs, else **D2** |

**Factual corrections queued with the amendment (single-answer, no decision):** P-18, P-19 and P-20 "observed under `-p` only" become observed interactively (2.1.318, `origin: composer`). P-26 becomes refuted for this session. The README / docs trust note (W-13) gains the observed fact that a project-folder plugin loads only after workspace trust (`hooks modules not loaded until workspace trust is accepted`).

**What does not change:** T2–T4 (installer, `list` / `doctor`, `flow.mjs`) depend on none of A, B or D. They depend on DD-1 (C) only through the dependency T2 → T1. No spec document has been amended yet: the Pivot Protocol's spec edits and Correction Closure sweep wait for JC's choice.

**Question to JC:** approve A1 / B1 / C1 / D1, or name others. Once the choices are approved, the Leader amends `design.md` (DD-8, §3, §5.2, §6.1, P-18/19/20/24/25/26/34) and `requirements.md` as needed, runs the Correction Closure sweep, and finishes T1 (the C1 probe, if chosen, then the Reviewer's second round). After that, T2 can start.

### Pivot Record: T1 — JC's decision

- **Decided by:** JC (Juan Carlos Cadavid), 2026-11-05 ~20:50 America/Bogota: «Apruebo A1, B1, C1 y D1, incluida la prueba en ~/.claude/skills/akili-probe/»
- **A1:** `pending` clears on settle (resolve or reject), with a fallback clear on the first main-loop `turn.start` after `since` whose text names `/<command>`. It is still reset at `session.start`, with no fixed 60 s bound. A pass-through `turn.start` hook is added
- **B1:** the press handler records the kept spec itself (FR-5 step 1, safe-path rule). The §3 diagram and P-34 are corrected
- **C1:** one interactive probe with the probe at `~/.claude/skills/akili-probe/`, and that folder removed afterwards. Nothing else under `~/.claude` is touched
- **D1:** P-25 is settled for a foreground (blocking) subagent in the same C1 session
- **Leader safety narrowing for C1:** a user-level plugin loads in **every** Claude Code session JC starts while it is present. So the C1 probe:
  - acts only when `$.session.root()` is the probe project, and is a no-op anywhere else
  - has no `$.command.run` timer (P-34 is already settled), so it can never inject a command into another session
  - stays installed for the shortest window possible

#### Attempt 2 (after JC's decision; continuation for D1)

- **Files changed (repo):** none by the Implementer.
- **Probes run (outside the repo):**
  - C1 at placement (b), `~/.claude/skills/akili-probe/`. It was removed by a `trap` after the falsifier session.
  - Continuation for D1 at placement (a), `/private/tmp/akili-t1.0PjE/proj/.claude/skills/akili-probe/`.
- **Module guard:** the module acts only when `$.session.root()` is the probe project. It has no `$.command.run`, `$.clock`, `$.process`, `$.prompt` or `$.ui`, and every hook returns `next(e)` unchanged.
- **Raw evidence:** `/tmp/akili-t1c1-evidence.txt` (198 lines, a `=== CONTINUATION ===` section included).
- **C1, P-24(b): verified.**
  - Debug lines:
    - `Read hooks.json for plugin akili-probe (enabled=true): /Users/jcadavid/.claude/skills/akili-probe/hooks/hooks.json`
    - `hooks module akili-probe@skills-dir loaded (worker, environment 2, tier user); events: session.start,turn.start,tool.call,turn.complete`
    - `plugin.register: akili-probe (user, akili-probe@skills-dir), judged by cc-plugin-sec-default: admitted`
  - The log was written with no trust step: `1793930040183 session.start root=/private/tmp/akili-t1.0PjE/proj … "isInteractive":true`.
  - Falsifier (plugin.json removed): `grep -c 'hooks module akili-probe'` = 0, and no log file. The session reached ready (`"status":"ready"`) and answered PONG.
- **D1, P-25 for a foreground subagent: verified (no double count).**
  - **How foreground was reached.** In the C1 session the Agent tool launched in the background on both tries ("Backgrounded agent", `tool_dispatch_end tool=Agent outcome=ok durationMs=18`). A continuation, which consumes no attempt, re-ran it at placement (a) with `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1`. That gave `tool_dispatch_end … durationMs=6329`.
  - **Order:** the subagent's `turn.complete` came at `1793930551709`, before the parent's at `1793930554562`.
  - **Usage, parent vs subagent:** output 358 vs 525; cache-creation 56155 vs 46299. The parent's cache-creation is about the cold-prompt baseline of 55481. Folding the subagent in would give about 100k.
  - **Limit (inference):** per-request usage inside a turn is not visible.
- **continuations:** 1 (P-25 foreground, owed after the C1 session's two background launches).
- **Cleanup:**
  - Leader-inline: `ls -d ~/.claude/skills/akili-probe` reports `No such file or directory`.
  - `/tmp/akili-t1c1` and `/tmp/akili-t1c2` are gone; `/tmp/akili-t1.0PjE` is empty.
  - No probe process is running.
  - No new `~/.claude.json` entry: the existing trust entry for `/private/tmp/akili-t1.0PjE/proj` was reused.
- **Evidence re-run (non-author, Leader-inline):** `VERIFIED` by comparison. The adoption path line, `loaded`, `admitted`, `isInteractive`, the env var, `durationMs=6329`, both `turn.complete` timestamps, the four usage figures and the ready line were each found by grep in `/tmp/akili-t1c1-evidence.txt`.
- **Execute-time spec edits (Pivot Protocol step 3, on JC's decision; Correction Closure run):**

  | File | What changed |
  |---|---|
  | `design.md` | Document Control; §3 diagram (adds `turn.start`; the press runs the command and records the kept spec, B1); §5.2 `pending` (A1); §6.1 new `turn.start` row and `onPress` row (A1, B1); *Every hook passes the event on first* (adds `turn.start`); DD-1; DD-8; DD-9 reason; §11 count line and rows P-18, P-19, P-20, P-24, P-25, P-26, P-34 |
  | `requirements.md` | Document Control; §4.1 assumption (P-24 verified); FR-1 trust note (observed); FR-7 (a press records the kept spec, B1; double press has no fixed bound, A1); D-9 (settled) |
  | `tasks.md` | Document Control; T5 Requirements and Scope (A1, B1); T6 Requirements and Falsifier (A1, B1); Coverage (two FR-7 rows) |

  Sweeps:
  - **Forward:** `60 s` across the spec folder leaves only the new A1 test wording in T6 and `judgment.md`'s W-5 history (left as history).
  - **Backward:** `P-34`, `DD-8`, `observer included`, `UNVERIFIED` leave only P-27 unverified.
  - **Removals:** `git diff -U0`; every removed line is a replaced row or sentence.
- **Reviewer verdict, round 2 (opus, `checklist`): `FAIL`.** It closed round-1 issues 1–4. Two new issues were in the Leader's amendment text, verbatim:

> 1. **Discovered Issue:** Four places say a `~/.claude/skills` plugin "loads with no trust step": requirements §4.1, P-24(b) ("active at `session.start` with no trust step"), DD-1's "(the latter only after workspace trust)", and the Attempt 2 record. The C1 session ran in `/private/tmp/akili-t1.0PjE/proj` (evidence line 4). That workspace was already trusted: Attempt 1 left the `~/.claude.json` entry and Attempt 2 says it "was reused". So no trust dialog could have appeared. Nothing shows how a user-level plugin behaves in an untrusted workspace. Attempt 1's line `hooks modules not loaded until workspace trust is accepted` suggests the gate may apply to every hooks module, not only project-folder ones. — **Violated Rule:** brief check 3 (no inference stated as fact). Also requirements.md §4.1, the row amended to "Verified in T1", and design.md §11 P-24, whose Citation reads "as run". — **Remediation Suggestion:** Reword all four places to: "(b) observed in an already-trusted workspace; untrusted-workspace behaviour unobserved (T9)". DD-1 stands; P-24(b) adoption is still verified. Optionally add a T9 check in an untrusted project.
> 2. **Discovered Issue:** The `pending` shape differs between two sections. §5.2 (design.md:149) still says `{ since }`. The amended §6.1 `onPress` row (design.md:181) stores `pending = { since, command }`, and the `turn.start` fallback reads `<pending command>`. T5 builds `types/index.d.ts` (PluginState) from §5.2, so the declared type would lack `command`. — **Violated Rule:** design.md §5.2 `pending` row against §6.1 `onPress` / `turn.start` rows; brief check 2 (no amendment may conflict with an untouched clause). — **Remediation Suggestion:** Change §5.2 Holds to `{ since, command }`, the command the press queued. Optionally give `pending` a shape tag.
>
> ADVISORY: close the "awaiting JC" status and add one consolidated verdict table; design §13's first risk row and the requirements glossary "Observed command" predate B1; under B1 a rejected press still records the kept spec — decide whether it should.

#### Attempt 3 (Leader fixes its own amendment text; no Implementer spawn needed: the evidence stands)

- **Fixes:** issue 1 is fixed in requirements §4.1, design P-24 and DD-1. The user-folder plugin was observed in an already-trusted workspace; untrusted-workspace behaviour is unobserved. **Correction to the Attempt 2 bullet above** ("The log was written with no trust step"): that workspace was already trusted, so the line shows only that no trust dialog appeared. Issue 2 is fixed in §5.2 `pending`, which now holds `{ since, command }`. The optional T9 check in an untrusted project is **not** added: it is not in the approved task, so it would be new scope.
- **ADVISORY (recorded; not acted on):** the glossary "Observed command", the §13 risk row, and B1 on a rejected press.
- **Reviewer verdict, round 3 (opus, `checklist`): `PASS`.** "Both round-2 issues are now closed … No live clause uses the old shape … T1 can close." ADVISORY: none new.

#### T1 closeout — `PASS` (attempt 3), 2026-11-05

| Premise | Final verdict |
|---|---|
| P-24 (a), project `.claude/skills/<name>` | **Verified**, after workspace trust |
| P-24 (b), `~/.claude/skills/<name>` | **Verified** (adopted, `tier user`, `admitted`), observed in an already-trusted workspace; untrusted-workspace behaviour unobserved |
| P-25 | **Verified: no double count**, for background (default) and foreground (`CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1`) subagents. DD-9 unamended |
| P-26 | **Refuted** (no `types/` written); DD-16 kept as a guard |
| P-34 | **Verified as amended:** runs as typed; settles at dequeue; own observer skipped on re-entry. DD-8 amended (A1, B1) |
| P-18 / P-19 / P-20 | Observed interactively |

- **Probe cleanup:** `ls -d ~/.claude/skills/akili-probe` → `No such file or directory`. No `/tmp/akili-t1*` probe trees are left (`/tmp/akili-t1.0PjE` is empty). The evidence files `/tmp/akili-t1-evidence.txt` and `/tmp/akili-t1c1-evidence.txt` are kept for audit.
- **Spawns:**
  - Implementer `sonnet`, attempt 1: 27 calls, 109,710 tokens, ended complete.
  - Implementer `sonnet`, attempt 2: 35 calls, 120,652 tokens, ended partial (`Not Done`: foreground P-25).
  - Implementer `sonnet`, continuation: 38 calls, 127,278 tokens, ended complete.
  - Reviewer `opus`, round 1: 10 calls, 86,762 tokens, ended complete (FAIL).
  - Reviewer `opus`, round 2: 10 calls, 115,629 tokens, ended complete (FAIL).
  - Reviewer `opus`, round 3 (resumed): 2 calls, 121,414 tokens cumulative, ended complete (PASS).
- **Running totals vs budget (design §12):** tasks 1 / 9 · LOC 0 (spec edits only) / ~2,100 · review rounds 3 / 15. T1 was budgeted 1 round and used 3: two FAILs, both closed. The total stays under budget, so the tripwire has not been passed. The overrun is noted for kaizen.

### T2: Installer recognizes plugin entries and installs them for Claude only — `PASS` (attempt 1)

- **Date:** 2026-11-05.
- **Requirements covered:** FR-1 (all four scenarios), FR-2 (update; upgrade from an old installer), FR-13 (count stays 32, the test half), FR-15 (`.gitignore`, pack, install).
- **Skills and models:** skill `tdd`. Implementer `sonnet` at effort `high`, raised from medium because the task touches the install path of all six targets. Reviewer `opus` (`full`, lens checklist).

#### Attempt 1

- **Files changed:** 12 files, +615 / −12.
  - `bin/akili.js` (+151): `isPluginEntry`, `listSkills` / `listPlugins`, a silent `"plugin"` policy verdict composed in front of the inner policy, `copyPlugins` / `copyPluginTreeSync` (skips `.claude-plugin/types`), and `removeLeakedPlugin`.
  - `package.json`: `files` negation `!.claude/skills/*/.claude-plugin/types`.
  - `.gitignore`: same pattern.
  - Existing tests: `test/install-cursor.test.js`, `test/install-grokbot.test.js`, `test/install-grokbot-edge.test.js` and `test/docs-overview.test.js` now apply the two-file predicate.
  - New: `test/install-akili-panel.test.js` (400 lines, 24 tests).
  - New scaffold under `.claude/skills/akili-panel/`: `.claude-plugin/plugin.json`, `hooks/hooks.json`, `hooks/register.jsx` (empty `register`), `README.md`.
- **Red run (observed, before the change):** 16 of the 24 new tests fail. Examples:
  - `opencode: .config/opencode/skills holds exactly the skills`
  - `… akili-panel must be removed: true !== false`
  - `types/ is not copied: true !== false`
  - `git check-ignore must report … as ignored (exit 0); got 1`

  The existing cursor, grokbot and stale-skills suites have 27 failures. Baseline reds R1–R3 are as recorded in Document Control.
- **Falsifiers (observed red, each run against every target suite, then reverted):**

  | # | Mutation | Failures | Example |
  |---|---|---|---|
  | 1 | Policy is a pass-through | 26 | `opencode: .config/opencode/skills holds exactly the skills (plus command-skills)` |
  | 2 | `isPluginEntry` always returns false | 42 | `doctor --tool cursor` (`FR-3 (Healthy install scenario)`) and the doctor `MISSING` tests |
  | 3 | Leak removal disabled | 7 | `opencode: …/skills/akili-panel must be removed: true !== false` |
  | 4 | Folder identified by name only | 3 | `.config/opencode/skills/akili-panel must not be removed (no plugin.json)` |
  | 5 | `files` negation dropped | 1 | FR-15 temp-copy pack test; the pack lists `.claude/skills/akili-panel/.claude-plugin/types/claude-code/index.d.ts` |

- **Implementer verification:**
  - `npm test`: 1474 pass, 0 fail (baseline 1450).
  - `npm run verify:cli`: green, `Summary: 14 commands | 32 skills | 8 resources`.
  - `git diff --check`: clean.
  - `git diff --stat 7a697ba -- .claude/commands`: empty.
  - `node scripts/ci/install-layout-regression.js`: exit 0, with no edit.
- **Evidence re-run (non-author, Leader-inline): `VERIFIED`.**
  - Task test command: `# tests 118 # pass 118 # fail 0`.
  - `npm test`: `# tests 1474 # pass 1474 # fail 0`.
  - `npm pack --dry-run` lists the four scaffold files:
    - `npm notice 274B .claude/skills/akili-panel/.claude-plugin/plugin.json`
    - `36B …/hooks/hooks.json`
    - `238B …/hooks/register.jsx`
    - `682B …/README.md`

    `grep -c "types/"` returns 0.
  - `claude plugin validate .claude/skills/akili-panel`: `✔ Validation passed`. One advisory says the README has no marketplace install line; T8 owns the marketplace file.
  - Layout regression: exit 0.
- **Reviewer verdict (opus, `full`): `PASS`.**
  - The diff meets FR-1, FR-2, FR-13 and FR-15, and follows design §7.1–§7.4, DD-10, DD-16 and DD-18. There are no failing issues.
  - **Byte-identical output for non-Claude users.** The Reviewer extracted the `7a697ba` installer and diffed stdout and the installed file lists for `opencode`, `antigravity`, `codex`, `cursor` and `grokbot` (`--force`, `--dry-run` and `--skills-only` included). They are byte-identical. For `claude` and `all`, the only difference is the plugin line and its four files.
  - **§7.4 checks:** a symlink, a malformed manifest, a different `name`, or a folder holding `SKILL.md` are each left alone. The `REMOVED` line appears once per dir. Codex and Cursor share one root and the copy is removed once. Grok Bot's record entry is dropped before the folder. Removal runs with `--skills-only` and not with `--commands-only`.
  - **KZ-004:** no branch in §7.3 lets the plugin fall through.
- **ADVISORY (4R, recorded; not acted on):**
  1. A copy kept because the Grok Bot record is invalid has no `kept akili-panel` line of its own.
  2. A name the record lists whose folder is already gone stays in `folders`.
  3. The FR-2 static check reads a fixed 6000-character slice of the source.
  4. A dev checkout that has a generated `types/` can read `differs` on skip-existing. T3 adds the ignore list that closes this.
  5. The README's marketplace line points at a file that does not exist yet; T8 adds it.
  6. Exclude the pre-existing `.run/` from commits.
- **Decisions:**
  - Execute-time correction to `tasks.md` T2 Falsifier (2), per the Reviewer and design §9: `docs-overview` re-implements the predicate, so it cannot go red when `bin/akili.js`'s `isPluginEntry` is mutated. Falsifier (2) still has observed reds, the 42 install and doctor failures. This is a factual fix to the task text and no requirement changes.
  - **Forward pointer to T3:** the plugin copy's skip-existing compare must pass the new `compareEntry` ignore list (`.claude-plugin/types`). Advisory 4 depends on it.
- **Spawns:**
  - Implementer `sonnet`: 44 calls, 143,824 tokens, ended complete.
  - Reviewer `opus`: 27 calls, 112,566 tokens, ended complete (PASS).
- **Running totals vs budget:** tasks 2 / 9 · LOC ~627 / ~2,100 · review rounds 4 / 15. Within budget.

### T3: `list` and `doctor` show the plugin — in progress

#### Attempt 1 — Reviewer `FAIL`

- **Files changed:**
  - `bin/akili.js`: +45 net. `runList` gets the `Plugins:` block and the plugin count. `doctorTool` gets the Claude plugin check and `LEAKED` for the other tools. `PLUGIN_COMPARE_OPTIONS` is added, and `copyPlugins` now passes it (T2's forward pointer, closed).
  - `bin/install-compare.js`: `compareEntry` takes an optional ignore list, applied in `walkSource`.
  - `test/install-akili-panel.test.js`: +20 tests.
  - `test/install-compare.test.js`: +1 test.
- **Implementer verification:**
  - The four named suites: 90 / 90. `npm test`: 1491 / 1491.
  - Red run: 11 tests red against the T2 code.
  - Falsifiers (1)–(6), each observed red:
    - (1) `not ok 38 - FR-3 list…`
    - (2) 13 fail
    - (3) `not ok 42 - FR-15 doctor ignores types/`
    - (4) `not ok 41 - FR-4 differing plugin…`
    - (5) LEAKED tests 44 / 46 / 48 / 50 / 52
    - (6) `not ok 42`, `not ok 68 - ignore option…`
- **`Not Done / Assumptions` (verbatim):**
  - "Beyond the spec, `--fix` restores a missing plugin only when no `akili-panel` folder exists at all. A folder with no `plugin.json` is reported `MISSING` and left alone, since it could be someone else's. This is a judgment call. The cost is that a plugin whose `plugin.json` alone was deleted is not auto-fixed."
  - "With an invalid Grok Bot record, `removeLeakedPlugin` removes nothing. Doctor then keeps printing `LEAKED`, even under `--fix`."
  - The Implementer did not run `npm run pack:dry-run`. The Leader's re-run covers it.
- **Evidence re-run (non-author, Leader-inline): `VERIFIED`.**
  - Suites 90 / 90; `npm test` 1491 / 1491.
  - `node bin/akili.js list` prints `Plugins:\n  akili-panel`, then `Summary: 14 commands | 32 skills | 1 plugin | 8 resources (akili-specs v2.42.0)`.
  - `npm pack --dry-run`: four `akili-panel` files and 0 `types/`.
  - `git diff --check` is clean; the `.claude/commands` diff is empty.
- **Reviewer verdict (opus, `full`): `FAIL`**, verbatim:

> 1. **Discovered Issue:** When an `akili-panel/` folder exists in the Claude skills dir but has no `.claude-plugin/plugin.json`, doctor reports `MISSING akili-panel` and `--fix` never restores it. I reproduced it: install for claude, delete only `plugin.json`, run `doctor --tool claude --fix`. The output is `MISSING akili-panel`, `missing 1 | fixed 0`, and the hint "Run akili doctor --tool claude --fix to auto-repair the 1 missing file(s)". That hint points at the command that just failed. A plain `doctor` then exits 1, and nothing short of deleting the folder by hand clears it.
>    * **Violated Rule:** `requirements.md` FR-4 statement says the plugin is present "when `<claude skills dir>/akili-panel/.claude-plugin/plugin.json` exists", and "As for a skill, `--fix` SHALL restore a **missing** plugin for Claude". Doctor already calls this entry missing by that definition. "As for a skill" means the skills loop in the same function, which restores whenever `SKILL.md` is absent, even when the folder exists. P-31's "writes only absent entries" points at `:1666`, which is the Grok Bot ownership path. Claude has no ownership record and no FOREIGN state in design §6.3 or §7.3. §7.4's foreign rule covers only non-Claude dirs.
>    * **Remediation Suggestion:** In the Claude branch, when the folder exists without `plugin.json` and without `SKILL.md`, have `--fix` write only the plugin files that are absent at the target and never overwrite a file that is present. The plugin comes back as FR-4 requires, any edited file is then reported `DIFFERS` on the next run, and the "never written" clause still holds. A folder that carries `SKILL.md` can stay untouched, but give it its own line, not a bare `MISSING` with a promise that `--fix` will repair it. Add a test: delete `plugin.json` only, `--fix` brings it back, an edited README keeps its bytes. If the Leader prefers the current narrowing, it changes an FR-4 SHALL. That goes to JC through the Pivot Protocol, not into this loop.
>
> ADVISORY:
> - RELIABILITY: Second assumption (invalid Grok Bot record). Leaving the copy matches the established rule: `dropOwned` throws on an invalid record, and `checkOwnedEntry` prints `BLOCKED`. So it is consistent and not a FAIL. But under `--fix` the line still reads plain `LEAKED`, and the summary still suggests `--fix`. Printing `BLOCKED akili-panel (invalid ownership record; nothing is written)`, as the skills path does, would explain why.
> - READABILITY: A leaked copy is counted in `missing`, so the summary says "auto-repair the 1 missing file(s)" for something `--fix` removes. FR-4 only asks that it "counts a problem", so this is wording only.
> - RISK: The `<n> plugins` plural (W-9) has no test, since only one plugin exists. The ternary is trivially right; a pure-function test would pin it.
> - RELIABILITY: The foreign-folder test (`plg-doc-foreign-`) does not call `assertSkillsInstalled`. It creates the opencode skills path itself, so it is not vacuous, but it falls outside the disqualifier's pattern.

- **Leader adjudication:** the issue is in scope and accepted; it follows FR-4's own text, so no Pivot is needed. The second assumption is consistent with the rule (advisory only).
- **Spawns:** Implementer `sonnet`, 31 calls, 108,011 tokens, ended partial (`Not Done / Assumptions`). Reviewer `opus`, 11 calls, 86,523 tokens, ended complete (FAIL).
- **Attempt 2:** effort raised from medium to high; the same worker, which still has its context, is resumed by message with the FAIL report verbatim.

#### Attempt 2 — Reviewer `PASS`

- **Files changed:** `bin/akili.js`. The Claude branch of `doctorTool` gains `copyPluginAbsentSync`, which on `--fix` writes only absent files, never overwrites, skips `.claude-plugin/types` and prints `FIXED akili-panel`. A folder that holds `SKILL.md` gets `BLOCKED akili-panel (the folder holds a SKILL.md, so it is not the plugin; nothing is written)` and counts as `foreign`. `test/install-akili-panel.test.js` gains three tests:
  - `FR-4 folder without plugin.json: --fix restores the absent file and keeps an edited one (then DIFFERS)`
  - `… restored from a package with types/: types/ is not written`
  - `FR-4 folder with a SKILL.md and no plugin.json: BLOCKED line, nothing written, no auto-repair promise`
- **Red against attempt 1:** `The input did not match the regular expression /FIXED\s+akili-panel/`, observed in all three tests.
- **Implementer verification:**
  - The four suites: 93 / 93. `npm test`: 1494 / 1494.
  - The pack lists four `akili-panel` files.
  - Falsifier (4) observed red again: `not ok 3 - FR-4 differing plugin: reported DIFFERS; --fix does not overwrite the edited file`.
- **Evidence re-run (non-author, Leader-inline): `VERIFIED`.**
  - The four suites: `# tests 93 # pass 93 # fail 0`. `npm test`: `# tests 1494 # pass 1494 # fail 0`.
  - The pack count is 4; `git diff --check` is clean.
  - Repro in a temp `HOME`: install for claude, delete `plugin.json`, append to `README.md`, then run `doctor --tool claude --fix`. It prints `FIXED akili-panel`. The next `doctor` prints `DIFFERS akili-panel (README.md)`, and the README keeps the edit.
- **Reviewer verdict, round 2 (opus, `full`, re-audit of the whole diff because this is a rework): `PASS`.**
  - "Round 1's FAIL is fixed and the rest of the diff still conforms."
  - It walked FR-4 scenario by scenario, both BUT clauses included.
  - The `BLOCKED` / `foreign` counting does not conflict with design §6.3, which says nothing about the case. It reuses the doctor's existing `foreign` contract ("not missing (`--fix` cannot repair them), but they fail the run all the same").
- **ADVISORY (recorded; not acted on):**
  - In the `BLOCKED` case, Claude has no `foreign` column, so `Next steps:` prints empty.
  - `copyPluginAbsentSync` can print `FIXED` over a symlinked or non-directory node it skipped.
  - The round-1 advisories still stand: `LEAKED` vs `BLOCKED` on an invalid Grok Bot record, the summary's `missing` wording, the plural test, and the foreign-folder test pattern.
- **Decisions:**
  - **Judgment call, recorded for `/akili-validate`:** a Claude-dir `akili-panel/` folder that holds a `SKILL.md` is not the plugin. Doctor reports it `BLOCKED` and `--fix` writes nothing there. This narrows FR-4's literal "restore a missing plugin" for that one case, under the installer-safety rule in `AGENTS.md`. The Reviewer judged it consistent with the spec, and design §6.3 says nothing about the case.
  - Invalid Grok Bot record: the leaked copy is kept, matching `checkOwnedEntry` (advisory only).
- **Spawns:**
  - Implementer `sonnet`, attempt 2 (resumed): 6 calls, 121,033 tokens cumulative, ended complete.
  - Reviewer `opus`, round 2 (resumed): 4 calls, 99,773 tokens cumulative, ended complete (PASS).
- **Running totals vs budget:** tasks 3 / 9 · LOC ~1,060 / ~2,100 · review rounds 6 / 15. T3 was budgeted 2 rounds and used 2. Within budget.

### T4: Pure rules module (`flow.mjs`) — `[~]` stopped at the budget tripwire (attempt 1 FAIL; awaiting JC)

- **Date:** 2026-11-05 (America/Bogota ~21:40–22:30). Requirements: FR-5, FR-6, FR-7 (state table), FR-11, FR-12, FR-16, NFR-2. Skill `tdd`. Implementer `sonnet` at effort `high` (logic core); Reviewer `opus` (`full`).
- **Running-total correction:** T3's entry gave the LOC as "~1,060". The measured figure through T3 is **917** (`git diff --shortstat 7a697ba` excluding `docs/specs`: +900 / −17).

#### Attempt 1

- **Runtime event:** the host `--print` process reached `CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS` and stopped the background Implementer partway through. stderr: "Background tasks still running 10m after the last turn (subagent "T4 pure rules module flow.mjs"); stopping them".
  - Ladder: rung 1, tree probe. Partial edits found: `flow.mjs` (547 lines), the test file (810 lines) and 132 fixtures, all intact. Then rung 3, resume by message (the worker's transcript survived).
  - `runtime events: provider-limit/host stop ×1 → rung 3`. No attempt was consumed.
- **Files changed (uncommitted):**
  - `.claude/skills/akili-panel/hooks/flow.mjs`: new, 547 lines. Pure ES module with no Node imports.
  - `test/akili-panel-flow.test.js`: new, 810 lines, 96 tests.
  - `test/fixtures/akili-panel/`: new, 132 files, 387 lines. A nested `.git` is stored as `dot-git`; `dot-agents` stands in for `.agents`. Both are renamed in a temp dir at test time, with `@ROOT@` replaced by the absolute `gitdir:`. The CRLF file is protected by `test/fixtures/** -text`.
  - `test/install-akili-panel.test.js`: ±16 lines. **Leader decision:** a consumer fix outside T4's Scope, made under T4's Common verification ("`npm test` green"). T2's FR-15 test pinned the packed plugin list to the four scaffold files, and its "no types" check matched any `/types/` path. Now:
    - the expected list is derived from the source plugin folder minus `.claude-plugin/types/`;
    - the four scaffold files are still asserted present;
    - the types check is narrowed to `/.claude-plugin/types/`, because design §4 ships a plugin-level `types/index.d.ts` in T5.

    Falsifier T2-(5) was observed red again: `not ok 22 - FR-15 …` with `'.claude/skills/akili-panel/.claude-plugin/types/claude-code/index.d.ts'` packed.
- **Red run (observed):** 95 of 96 tests red against a stub that exports every function returning nothing, all `ERR_ASSERTION`. The one pass is the purity guard. The tests were written first, as the task row requires.
- **Falsifiers (observed red, then reverted).** One disqualifier catch: the first CRLF fixture did not go red under its mutation, so a second heading was added and the red was observed. Full log: `/tmp/akili-t4-falsifiers.txt`.

  | Mutation | Tests red | First red test |
  |---|---|---|
  | count `[~]` anywhere | 3 | "FR-6 prose is not a status…" |
  | phase by file presence | 1 | "FR-6 out-of-order file…" |
  | drop legacy alternates | 2 | "FR-6 legacy baseline…" |
  | accept `..` | 3 | "FR-5 unsafe argument…" |
  | keep a one-word propose argument | 1 | "FR-5 propose arguments BUT…" |
  | token must be the whole cell | 7 | — |
  | split on `\n` only | 1 | "FR-6 real status formats AND CRLF…" |
  | pass a relative path to io | 38 | — |
  | list `archive/` on every refresh | 3 | "NFR-2 a refresh with the kept spec present lists no archive/…" |
  | read Document Control | 4 | — |
  | add a Node import | 1 | — |

- **Implementer verification:**
  - Flow tests: 96 / 96 on Node 22.
  - `npm test`: 1590 / 1590 after the consumer fix.
  - `git diff --check`: clean. `.claude/commands` diff: empty.
- **`Not Done / Assumptions` (verbatim):**
  - "The code and test line budgets are exceeded, as noted in section 2."
  - "**Dropped design item:** `view.refreshedAt` (design §5.2) is not in `refresh`; T5 should add it, since `flow.mjs` stays pure."
  - "Choices on points the spec leaves open:
    - Document Control skipping ends at the next heading of any level, so a `### T1` directly after it still counts its tokens.
    - `docs/specs` missing is detected by an ENOENT-like list error, with no extra `exists` call.
    - A trailing `/` in an argument is rejected, following the safe-path rule literally.
    - Branch reads try `.git` first, then `HEAD`, so reads stay at 2 or fewer."
  - "**Spec-gap flag:** the spec's NFR-2 "folders visited" count is ambiguous. I pinned spec folders as listed (to find spec files) and carve-outs as not listed."
  - "Reviewer attention: the spec cannot represent "no `docs/specs` and constitution ✓" with real files, since the 13 files include `docs/specs/general-setup/*`. That case is tested with an in-memory io where `list` throws ENOENT."
- **Evidence re-run (non-author, Leader-inline): `VERIFIED`.**
  - `node --test test/akili-panel-flow.test.js`: `# tests 96 # pass 96 # fail 0` on Node 22. Same on Node **v18.20.8** (`npx -y node@18`).
  - `install-akili-panel`: `# tests 43 # pass 43 # fail 0`. The `^test(` count is unchanged at 20 (`6bbcf02` vs the working tree).
  - `npm test`: `# tests 1590 # pass 1590 # fail 0`.
  - `git diff --check`: clean. `.claude/commands` diff: empty. `flow.mjs` has no `node:` / `fs` / `path` import.
- **Reviewer verdict (opus, `full`): `FAIL`**, verbatim:

> SUMMARY: `flow.mjs` follows the spec closely. I checked the safe-path rule, the propose forms (J-1), the four token places, the `/` → `--` archive match, the 13 files plus 2 legacy alternates (they match `akili-constitution.md:46-61`), the phase rule, all 13 Next rows including W-1, the number thresholds, the strings table and middle truncation. Two FR-16 obligations are not met, both one-line fixes. […] **Real data:** `parseTaskTokens` over all 47 archived `tasks.md`. Only `impeccable-design` has 0 tokens, which matches P-17. […] **Live run:** `refresh` on this worktree gives the correct view: execute ▶, `Next: /akili-execute changes/akili-panel`.
>
> ISSUES:
> 1. **Discovered Issue:** An unreadable `HEAD` is dropped silently. `readBranch` calls `tryRead(io, headPath, null)`. I reproduced it: a dangling `gitdir:` gives `(no git)` with `errors = []`.
>    * **Violated Rule:** `requirements.md` FR-16, row "A read fails → `Could not read <path>: <reason>`". Also `design.md` §6.2: "A failing call is caught per path and recorded in `errors[]`". FR-11 sets the header text, `(no git)`. It does not exempt the error line.
>    * **Remediation Suggestion:** Pass `errors` to the `HEAD` read. Keep the `.git` probe read silent, since it is expected to fail on a folder. In the FR-11 unreadable-HEAD test: assert that `git-dangling` records exactly one entry whose path ends `/meta/missing/HEAD`; assert that `git-bad-head` (readable, garbage content) records none.
> 2. **Discovered Issue:** `errorLines` does not keep the line single. I reproduced it: a reason `line1\nline2` comes out as `Could not read /x: line1\nline2`. `$.fs` rejection messages are not guaranteed to be single-line.
>    * **Violated Rule:** `requirements.md` FR-16: "`Could not read <path>: <reason>` on one line".
>    * **Remediation Suggestion:** Collapse whitespace in the reason (`replace(/\s+/g, ' ')`) in `readError` or `errorLines`. Add a test with a multi-line reason.
>
> **Assumptions:**
> - **Document Control skip ends at any heading:** correct, and the data backs it. `2026-10-18-changes--video-deliverable-track/tasks.md` puts `### T1 …` directly under `## Document Control`. Skipping the whole section would read 0 tokens there. Record this evidence in `execution.md`.
> - **ENOENT detection:** an acceptable narrowing. T5 must confirm how `$.fs.list` rejects (code or message). If it differs, a missing `docs/specs` will also show an error line.
> - **Trailing `/` rejected:** a literal reading of the rule, acceptable. Minor spec gap: a path with a trailing `/` from tab completion keeps nothing.
> - **Reading `.git` first, then `HEAD`:** stays at 3 reads or fewer, within NFR-2.
> - **NFR-2 "folders visited":** spec folders have to be listed to be classified, so the reading is consistent.
> - **"No `docs/specs` and constitution ✓" cannot happen:** a real but harmless gap in FR-7 / FR-16, because the 13 files include `docs/specs/general-setup/*`. The Leader should record it.
> - **`refreshedAt` dropped:** acceptable as a T5 forward pointer, since `flow.mjs` has no clock. Put it in T5's brief.
>
> **Consumer-test change:** correct, and it still proves FR-15. […] It does edit a file outside T4's Scope (Common verification), so record that in `execution.md`.
>
> ADVISORY:
> - READABILITY: the test title "NFR-2 carve-out folders and spec folders are never listed" contradicts the code and the assertion, since spec folders are listed. Rename it to "carve-outs are never listed".
> - RELIABILITY: the `branch-match` fixture does not pin mtimes. On a filesystem with 1-second timestamps, a tie falls back to path order and picks `bugfix/b`, so the no-branch-match mutation would pass. Set `changes/a` newer with `opts.mtimes`.
> - RELIABILITY: the FR-15 expected list comes from `walkFiles` over the source folder. A local `.DS_Store` is listed there but `npm pack` leaves it out, which would fail the test on a dev Mac. Filter dotfiles that npm ignores.
> - RISK: token rule (c) is not anchored, so a prose sentence with `**Status:** [~]` mid-line counts as blocked. That follows the glossary literally, and no real file does it today.

- **Leader adjudication:**
  - Issues 1 and 2 are in scope and accepted. Both are one-line fixes plus tests; this would be attempt 2, at effort `xhigh`.
  - **Not started:** the budget tripwire below stops the run first.
  - **Recorded facts:**
    - Document Control skip: `2026-10-18-changes--video-deliverable-track/tasks.md` puts `### T1` directly under `## Document Control`.
    - The state "no `docs/specs` and constitution ✓" is not reachable with real files. This is a harmless gap in FR-7 / FR-16.
  - **Forward pointers to T5, to copy into T5's brief:**
    - (a) add `view.refreshedAt` in `register.jsx` (design §5.2);
    - (b) confirm how `$.fs.list` rejects for a missing folder, by code or message, against `flow.mjs`'s ENOENT detection.
- **Spawns:**
  - Implementer `sonnet`: 177,525 tokens at the first resume and 182,427 cumulative after the consumer fix; ended `died` once (host stop), then complete.
  - Reviewer `opus`: 28 calls, 141,285 tokens, ended complete (FAIL).

## Budget Tripwire: T4 (stopped; awaiting JC)

> No mandate widens pre-approval: an owner brief that says "never stop" or "treat every gate as approved" pre-approves routine gates only. The exceptions in `/akili-propose` Step 1 *Approval Mode* (HALT, Pivot, budget tripwire, `FATAL_FAIL`, `PRODUCT_BUG`, destructive actions) still stop, and the stop message quotes this sentence.

| Measure | Budget (design §12) | Actual so far | Delta |
|---|---|---|---|
| Tasks | 9 | 3 closed, T4 in progress | — |
| LOC (code + tests + fixtures, excluding `docs/specs`) | ~2,100 total | T2 627 + T3 290 = 917 committed; T4 1,357 + 387 fixtures + 16 = **~1,760** uncommitted; **~2,677 total** | **+~580 over the whole-spec budget, with T5–T8 not started** |
| T4 alone | ~640 (`flow.mjs` ~260, tests and fixtures ~380) | ~1,760 | ×2.7 |
| Review rounds | 15 | 7 (T1 3, T2 1, T3 2, T4 1) | within budget; T4 has used 1 of 2 |

**Cause.**
1. `flow.mjs` is 547 lines against ~260. The design puts every string, the phase table and the Next table into the module as data (DD-15). It also adds a pure DD-17 branch walk, 30 exports, and formatters with middle truncation.
2. The tests follow KZ-bugfix--init-ctrlc-abort-2, which asks for one named test per THEN / BUT / AND IT MUST clause: 96 tests, 810 lines. Fixtures were not budgeted at all (387 lines).
3. The same lesson recurs: tests were budgeted at about a third of what ships.

**Projection if continued.**

| Item | Estimate |
|---|---|
| T4 rework | ~+30 |
| T5 (budget ~350) | ~600 |
| T6 (~200) | ~350 |
| T7 | ~25 |
| T8 (~180) | ~250 |
| **Total** | **~3,900 LOC**, about 1.9× the budget |

Review rounds are projected at ~16–18 against 15.

**Options for JC:**
- **(1) Raise the budget and continue (recommended).** Set LOC ~4,000 and review rounds 18. Finish T4 attempt 2 (the two FR-16 fixes), then T5 → T8, and stop before T9 as mandated. The overrun is in tests and in data tables the design asked for, not in scope creep.
- **(2) Continue, but cap test volume** for T5 and T6 at the row budgets (contract and engine-kit tests only). Cheaper, but it goes against the per-clause lesson.
- **(3) Stop here and re-specify** T5–T8 with re-sized budgets (`/akili-specify` amendment), then resume.

**State left for the resume:**
- T4's work is **uncommitted** in the tree:
  - `flow.mjs`
  - `test/akili-panel-flow.test.js`
  - `test/fixtures/akili-panel/`
  - the ±16-line change to `test/install-akili-panel.test.js`

  `git add -N` was applied to the new files for the review diff.
- `npm test` is 1590 / 1590 green with this tree.
- On resume, T4 attempt 2 starts from these files and fixes Reviewer issues 1 and 2 verbatim.

### Budget Tripwire: T4 — closed by JC

- **Decided by:** JC (Juan Carlos Cadavid), 2026-11-06 ~03:44 America/Bogota: «Apruebo opción 1: subir presupuesto a ~4,000 LOC y 18 rounds y continuar»
- **Effect:** option (1). The whole-spec budget is raised to **~4,000 LOC** and **18 review rounds**, from ~2,100 and 15.
  - Recorded in `tasks.md` Document Control (the *Budget* row) and in `design.md` §12 (a note above the original estimate, which stays as the record of what was planned).
  - The run continues with T4 attempt 2, then T5 → T8, and stops before T9.
- **Correction Closure:** `grep -n "2,100\|15 review"` across the spec folder. The surviving hits are the original §12 estimate, which is kept as the planned record under the new note, and the history in `execution.md`. No other document cites the budget.

#### T4 attempt 2 — Reviewer `FAIL` (fixture regression)

- Effort was raised from high to **xhigh**, in a fresh Implementer `sonnet` spawn in the foreground.
- Fixes, in `flow.mjs`:
  - `:324`: `readBranch` reads `HEAD` with `tryRead(io, headPath, errors)`; the `.git` probe stays silent.
  - `:528`: `errorLines` collapses whitespace in the reason. `:98` `errReason` does the same, which is redundant and flagged as such.
- Tests added:
  - `FR-11/FR-16 an unreadable HEAD is recorded in errors[]; a readable but garbage HEAD is not`
  - `FR-16 a multi-line reason is collapsed: the error stays on one line`
- Reds observed against attempt 1:
  - `0 !== 1`
  - actual `'Could not read /x: line1\nline2\r\n  line3'`
- The issue-1 falsifier was observed red again: reverting the `errors` argument turns test 77 red.
- **Leader order:** trim the fixtures that end in a blank line, so the Common verification `git diff --check` passes. The worker trimmed eight. Two of them, `tasks-samples/fmt-document-control.md` and `fmt-none.md`, were emptied to 1 byte.
- **Evidence re-run (Leader-inline): `VERIFIED`.**
  - Flow tests: 98/98 on Node 22, and on Node 18.
  - `npm test`: 1592/1592.
  - `git diff --check`: flags only `fmt-all-crlf.md`.
- **Reviewer round 2 (opus): `FAIL`**, verbatim issue:

> Trimming wiped two fixtures. `tasks-samples/fmt-document-control.md` and `tasks-samples/fmt-none.md` are each now 1 byte (`\n`). Their index entries are intent-to-add empty blobs, so git holds no copy of the old content. The test "FR-6 real status formats: `## Document Control` is never read (Draft — Phase 3 and a [x] row count nothing)" now parses an empty string. It stays green under the Document Control-read mutation. The `fmt-none` parse assertion no longer reads the real no-token excerpt from P-17. […] **Violated Rule:** `tasks.md` T4 Disqualifier: "A fixture on which the named mutation does not change the reading". Also T4 Scope […] and FR-6 *Real status formats*. **Remediation Suggestion:** restore both files, ending each in a single `\n` […]; add a non-empty guard to `sample()` […]; re-observe test 38 red under the Document Control-read mutation.

- The Reviewer confirmed both FR-16 fixes and found no regression: every FR-11 case keeps `errors = []`, except `git-dangling`.
- The root cause is the Leader's own order to trim the fixtures (Leader-caused). It was recorded for kaizen.

#### T4 attempt 3 — Reviewer `PASS`

- **Effort ceiling: held xhigh.** The registry names no Reviewer model I can verify as at least as strong as `opus`, so attempt 3 is a fresh `sonnet` spawn at xhigh with the full attempt history.
- **Restored fixtures:** `fmt-document-control.md` (172 B) and `fmt-none.md` (887 B), taken from the Reviewer's restore file. Every non-blank line of `fmt-none` matches a whole line in `docs/specs/archive/2026-10-30-changes--impeccable-design/tasks.md`.
- **New guard:** `sample()` (`test/akili-panel-flow.test.js:130`) asserts the fixture is non-empty. Observed red: `'tasks-samples/fmt-none.md is empty: an emptied fixture proves nothing'`.
- **Falsifiers observed red, then reverted:**
  - Document Control read: `not ok 38 - FR-6 real status formats: ## Document Control is never read …` (`done: 1` vs `0`).
  - Counting `| T<n> |` rows as tasks: `not ok 40 - FR-6 no status at all …` (`open: 7` vs `0`).
- **Evidence re-run (non-author, Leader-inline): `VERIFIED`.**
  - Sizes: 172 and 887.
  - `find test/fixtures/akili-panel -type f -size -2c` returns nothing.
  - Flow tests: `# pass 98 # fail 0` on Node 22, and on Node 18.
  - `npm test`: `# tests 1592 # pass 1592 # fail 0`.
  - `git diff --check`: flags only `fmt-all-crlf.md`, the CRLF copy the task requires. The repo precedent is `test/fixtures/routing/agents-crlf.md`, committed with 22 such warnings.
- **Reviewer round 3 (opus): `PASS`.** "The round-2 issue is fixed and nothing regressed. T4 now meets the FR-5, FR-6, FR-7, FR-11, FR-12, FR-16 and NFR-2 clauses it covers." The Reviewer re-ran the mutation itself in a temp copy.
- **ADVISORY (recorded; not acted on):**
  - The NFR-2 test title says spec folders are never listed; it should say carve-outs.
  - The `branch-match` fixture does not pin mtimes.
  - `.DS_Store` in the FR-15 expected list.
  - A `.git` file with no `gitdir:` gives a confusing `.git/HEAD: ENOTDIR` path.
  - Token rule (c) is not anchored.
- **Decisions recorded:**
  - **Consumer test outside T4's scope.** `test/install-akili-panel.test.js` was edited under the Common verification "npm test green".
  - **Document Control skip.** The skip ends at the next heading of any level. Evidence: `2026-10-18-changes--video-deliverable-track/tasks.md` puts `### T1` directly under `## Document Control`.
  - **Unreachable state.** The FR-7 / FR-16 state "no `docs/specs/` and constitution ✓" cannot be reached with real files, because the 13 constitution files include `docs/specs/general-setup/*`.
  - **Forward pointers to T5:** (a) `view.refreshedAt` in `register.jsx`; (b) confirm how `$.fs.list` rejects for a missing folder, by code or message, against `flow.mjs`'s ENOENT detection.
- **Spawns:**
  - Implementer `sonnet`, attempt 2: 9 calls, 60,771 tokens, then a resume (62,755 cumulative); ended complete.
  - Implementer `sonnet`, attempt 3: 10 calls, 63,384 tokens; ended complete.
  - Reviewer `opus`, round 2 (resume): 6 calls, 157,843 cumulative; ended complete (FAIL).
  - Reviewer `opus`, round 3 (resume): 2 calls, 160,801 cumulative; ended complete (PASS).
- **Running totals vs the raised budget:**
  - Tasks: 4 of 9.
  - LOC:  148 files changed, 2662 insertions(+), 17 deletions(-) (excluding `docs/specs`, including fixtures), against ~4,000.
  - Review rounds: 9 of 18 (T1 3, T2 1, T3 2, T4 3).
  - Within budget.

### T5: Hooks module: pane, `/akili-panel`, observers, Next — in progress

#### Attempt 1 — Implementer report logged (design route)

- **Skills:** `impeccable-bridge` (→ `references/design-routing.md`), `cognitive-doc-design` (README). Implementer `sonnet`, effort `high`, foreground.
- **Design route (T5 Done criteria):**
  - playbooks run: **`layout`, `clarify`** (ENV-2, mode Operate, motion none; clarify checked every user-facing string against `STRINGS`)
  - **`polish light`:**
    - It found a bold header, which was made plain so that bold marks only the current phase (design §8).
    - Narrow widths are cut by `fitLine` / `formatTokens`.
    - A pending press shows dim through the `Button` `dimColor` prop.
    - No rendered check was possible, so layout is left to T9.
  - **`finish review: not run (AKILI execute)`**
- **Files:**

  | File | Change | LOC |
  |---|---|---|
  | `hooks/register.jsx` | replaces the empty module | 238 |
  | `test/akili-panel-contract.test.js` | new | 99 |
  | `types/index.d.ts` | new: `PluginState` for the five atoms | 29 |
  | `README.md` | full | 46 |

  Two edits outside the Scope list, each with the Implementer's reason:
  - `plugin.json` gains `"types": "./types/index.d.ts"`. `claude plugin validate` fails with "`akili-panel.view` is not declared" without it.
  - `flow.mjs` gains three `STRINGS` entries, `paneOpened`, `paneNotShown(reason)` and `runRefused(command, reason)`, for FR-7 / FR-8 text not yet in the table (DD-15). The flow test stays at 98 / 98.
- **Forward pointers answered:**
  - (a) `view.refreshedAt` is set in `refreshOnce` from `$.clock.now()`.
  - (b) The types do not settle how `$.fs.list` rejects for a missing folder: `types:3367` says only "an OS refusal with its errno". The adapter passes the rejection through, and `flow.mjs` `isNotFound` accepts `code === 'ENOENT'` or an ENOENT-like message. Recorded as `UNVERIFIED — confirm at source before relying on it`; observed in T6 / T9.
- **Red run:** run against T2's empty module, it gives `not ok 1 - registers akili-panel, and only akili-panel (FR-8)` with actual `[]` vs `['akili-panel']`, and `# fail 9`.
- **Falsifiers:** each was observed red on a copy selected through `AKILI_PANEL_REGISTER`, so the live, hot-reloaded file was never mutated.

  | Mutation | Red |
  |---|---|
  | second `$.command.register` | `not ok 1` |
  | `$.fs.write` | `not ok 2` |
  | `$.process.run` | `not ok 2` |
  | `turn.complete` returns its own object | `not ok 3` |
  | `pending` set through `$.state.set` | `not ok 5` |
  | `.catch` removed from `tool.call` | `not ok 4`, and `validate` reports `❯ ./register.jsx gating hook without .catch: tool.call{tool=Skill}` |

- **Evidence re-run (non-author, Leader-inline): `VERIFIED`.**
  - Contract test: `# tests 9 # pass 9 # fail 0`. Flow test: `# pass 98 # fail 0`.
  - `claude plugin validate .claude/skills/akili-panel`: `✔ Validation passed`. Its lines read `answers its own command: command.run{command=akili-panel}`, `gating hook with .catch: command.run{command=/"^akili-(?!panel$)"/}` and `gating hook with .catch: tool.call{tool=Skill}`, plus the `ICON_MISSING` warning. There is no `without .catch` line.
  - `npm test`: `# tests 1601 # pass 1601 # fail 0`.
  - `npm pack --dry-run` lists `plugin.json`, `flow.mjs`, `hooks.json`, `register.jsx`, `README.md` and `types/index.d.ts`, with 0 `.claude-plugin/types`.
  - `git diff --check` is clean, and the `.claude/commands` diff is empty.
- **Reviewer verdict (opus, `full`): `FAIL`**, verbatim. The summary confirms that every API call matches `claude-code.d.ts` with nothing invented, and that A1, B1, DD-5/NFR-8, FR-8, FR-10, FR-12 and NFR-1 hold.

> 1. **Discovered Issue:** The `session.start` hook does its own work inside the dispatch, not on the clock. `await startSession($)` runs after `next(e)`, so the hook does not return until registration, the `pending` reset, the `usage` seed and the timer setup finish. The file header claims "the plugin's own work runs afterwards on the clock", which is false for this hook. The contract test also lets this through, because it accepts `startSession(` as valid post-`next` work. **Violated Rule:** design.md §6.1, *Every hook passes the event on first*. **Remediation Suggestion:** Schedule it with `later($, () => startSession($))` (keep the `.catch` log). Or the Leader records a design note that `session.start` is exempt (reference.md:204-212) and fixes the header comment.
> 2. **Discovered Issue:** The `tool.call` Skill hook never checks for the `akili-` prefix. `afterRun` runs for every Skill call, so any skill triggers a refresh while the pane is up. **Violated Rule:** design.md §6.1, `tool.call` row: "`e.skill` starting `akili-` checked in the body". **Remediation Suggestion:** Guard the body with `if (/^akili-/.test(String(e.skill || ''))) later(...)`, and add a contract assertion for it.
> 3. **Discovered Issue:** The README token example shows `(120k/1M)`. The shipped output is `(120k/1.0M)`. **Violated Rule:** KZ-002; FR-12. **Remediation Suggestion:** Change the README example to `1.0M`.
> 4. **Discovered Issue:** The README tells the reader to "widen the terminal and run it again" after `Akili pane not shown`. The types say that is never the cause for a typed command: an open the person asked for "is placed at any width" (UiOpenResult, `types:15478ff`). **Violated Rule:** KZ-002; FR-8. **Remediation Suggestion:** Say the reason names why, for example no surface that shows panes is attached. Drop the widen advice.
> 5. **Discovered Issue:** The `plugin.json` `"types"` edit is outside Scope, and its recorded justification does not reproduce. With `types` removed, `claude plugin validate` reports `✔ Validation passed`. That contradicts execution.md's "fails with `akili-panel.view` is not declared". **Violated Rule:** tasks.md Common verification; KZ-002. **Remediation Suggestion:** Revert the field. Or keep it, but correct the recorded reason and have the Leader accept it as a deviation. The `flow.mjs` STRINGS edit is justified (DD-15) and stays.
>
> ADVISORY:
> - Reliability: the press records the kept spec before `$.command.run`, so a refused run still records.
> - Reliability: rejections around `press`'s `try`/`finally` can go unhandled.
> - Resilience: a hot reload drops the timers, and `session.start` does not fire again (NFR-3; observe in T6/T9).
> - Readability: the README says "the last `/akili-*` command", which should say "spec-taking".
> - Risk: the README marketplace line depends on T8.
> - The three new STRINGS are not pinned by the flow tests.

- **Leader adjudication:**
  - All five issues are in scope and accepted.
  - Issue 1: follow the design as written (on the clock). No exemption is recorded.
  - Issue 5: revert the field. **Correction to the attempt-1 log line above:** the "validate fails without it" reason did not reproduce.
- **Spawns:**
  - Implementer `sonnet`: 52 calls, 173,586 tokens, ended complete.
  - Reviewer `opus`: 36 calls, 168,868 tokens, ended complete (FAIL).
- **Attempt 2:** effort raised high → xhigh; the same worker is resumed by message with the report verbatim.

#### T5 attempt 2: Reviewer `PASS`

- **Fixes (same worker, resumed, effort xhigh):**
  1. `session.start` → `later($, () => startSession($).catch(… $.ui.log …))` (`register.jsx:167`). The header comment is corrected.
  2. The `tool.call` body is guarded by `/^akili-/.test(String(e.skill || ''))`.
  3. The README token example now reads `(120k/1.0M)`.
  4. The README "widen" advice is replaced: the reason names why, e.g. no surface that shows panes is attached.
  5. The `plugin.json` `"types"` field is reverted; the file is byte-identical to `36220a8`.
- **Contract test tightened:** a pass-through hook may `await` only `next(e)`, and helper calls must sit inside `later(…)`. It has a new `tool.call` guard test.
- **Reds observed** (on copies selected through `AKILI_PANEL_REGISTER`):
  - `not ok 3 - … session.start: awaits besides next(e): work runs in the dispatch`
  - `not ok 5 - the tool.call hook acts only on akili- skills (design 6.1)`
- **Evidence re-run (non-author, Leader-inline): `VERIFIED`:**
  - contract test `# pass 10 # fail 0`; flow test `# pass 98 # fail 0`
  - `claude plugin validate .claude/skills/akili-panel` → `✔ Validation passed`, with no `without .catch` line
  - `npm test` → `# tests 1602 # pass 1602 # fail 0`
  - `plugin.json` is unchanged against `36220a8`; README line 35 reads `1.0M`; `git diff --check` is clean
- **Reviewer round 2 (opus, `full`, whole diff re-audited): `PASS`.** "All five round-1 issues are fixed… There is no FAIL issue."
- **Spec tension, raised by the Reviewer.** Recorded for JC at the next gate, the stop before T9. The Reviewer's text, verbatim:

> - `reference.md:209-211`: `session.start` "is awaited before the first prompt (so a `$.tool.register` awaited there is listed by turn one)". The same promise applies to `$.command.register`.
> - `types:3221-3231`: `$.command.register` lists the command "in the typeahead from the next keystroke on".
> - With the register moved to `$.clock.after(0)`, it lands only after `session.start` has returned. Nothing in the types guarantees it lands before the first prompt.
> - For a person typing interactively, the gap is milliseconds, so the practical risk is nil.
> - The real risk is a prompt given on the command line, `claude "/akili-panel"`. That prompt is sent as soon as the awaited start finishes, so it can reach the command before it exists ("unknown command"). Calling `$.command.register` from a timer has also not been observed live (T1 never tried it).
> - Design §6.1, *Every hook passes the event on first*, demands the clock for `session.start`, while reference.md:209-211 ties the turn-one guarantee to awaiting inside it. Pick one: **(a)** amend §6.1 so `session.start` may await `$.command.register` (only that) after `next(e)`; **(b)** keep it on the clock and accept the gap for a command-line prompt. Either way, T9 should test `claude "/akili-panel"` live.

- **ADVISORY (recorded; not acted on):**
  - the contract test checks only the helper names it lists, no longer checks order, and its `tool.call` test is a spelling check
  - `press` records the kept spec before the run settles, and leaves some rejections unhandled
  - a hot reload drops the 30 s timer
  - the README marketplace line depends on T8
  - the three new STRINGS are not pinned by tests
- **Requirements covered:** FR-7 (wiring, B1, A1), FR-8, FR-9, FR-10, FR-11 (io), FR-12 (sources), FR-16 (render), NFR-1, NFR-3, NFR-4, NFR-5, NFR-8 (contract level; behaviour is T6 / T9).
- **Spawns:**
  - Implementer `sonnet`, attempt 2 (resumed): 4 calls, 181,347 tokens cumulative, ended complete.
  - Reviewer `opus`, round 2 (resumed): 3 calls, 175,840 tokens cumulative, ended complete (PASS).
