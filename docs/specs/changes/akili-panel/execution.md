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
