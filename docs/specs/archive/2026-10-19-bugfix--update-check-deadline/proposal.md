# Proposal — update check: no overall deadline, a slow-drip registry hangs the CLI

## Document Control

| Field | Value |
|---|---|
| Spec Path | `bugfix/update-check-deadline` |
| Slug | `update-check-deadline` — taken from the first token of the argument (literal path `bugfix/update-check-deadline`) |
| Type | **Bug** |
| Deliverable | software |
| Approval Mode | gated |
| Severity | **LOW** (user-assessed; confirmed below — needs control of the registry response) |
| Date | 2026-10-19 |
| Author | AKILI session (proposer) |
| Status | Draft — awaiting approval |
| Related | PR #41 / commit `24fbb57` (res-stream error fix + `.jules/sentinel.md` 2026-09-20 entry); Sentinel PRs #43–#55 (fourth duplicate batch) |
| Depends on | none |
| Parallel-safe | yes (`fetchLatestVersion` + a new test file; no active spec touches the update check) |
| Release | patch — **not executed in this change**; commits local only, no push |

## Intent

Give the npm update check a hard **overall deadline** so no registry response — slow, stalled, or cut — can keep the CLI (or the Claude Code SessionStart hook) waiting longer than ~3 s, and pin that with regression tests that run against a local server.

## Problem / Current Behavior

- `fetchLatestVersion` calls `https.get(url, { timeout: 1500 }, …)` — `bin/akili.js:1874`. That option is a **socket idle timeout**: it fires only after 1500 ms with no bytes. Measured on Node v22.12.0 with the function extracted verbatim from `bin/akili.js` and pointed at a local server (`scratchpad/repro.js`, `scratchpad/probe.js`, as run 2026-10-19):

  | Server behavior | Result |
  |---|---|
  | 200, then 1 byte every **1000 ms** | `STILL PENDING after 8001 ms` (exit 2) — every byte re-arms the timer |
  | 200, then 1 byte every **2000 ms** | `settled null in 1504 ms` — idle timer fires (control) |
  | 404, body cut after 13 bytes | `settled null in 5 ms`, no crash |
  | 200, body cut after 13 bytes | `settled null in 105 ms`, no crash (PR #41 fix holds) |

- The only other bound is the 50,000-byte cap (`bin/akili.js:1887`); at 1 byte/s that is 50,000 s ≈ 13.9 h — arithmetic on the cited constant.
- `main()` runs `await checkForUpdates()` before every command except `check-update` and `routing --json` — `bin/akili.js:2434`. `checkForUpdates` returns early when `!process.stdout.isTTY` — `bin/akili.js:1928`. So an interactive command hangs; piped/CI runs do not.
- **`check-update` has no TTY guard.** `runCheckUpdate` calls `getLatestVersion()` directly — `bin/akili.js:1952–1953` — and it is the command the opt-in SessionStart hook runs (`NOTIFY_HOOK_COMMAND = "akili check-update --quiet"`, `bin/akili.js:1976`), registered with no `timeout` field (`bin/akili.js:2010`). So the hang also reaches Claude Code session start, bounded only by the host's hook timeout — value `UNVERIFIED — confirm at source before relying on it`.
- On a null result the cache is not written (`if (latest) writeUpdateCache(latest)`, `bin/akili.js:1914`), so a failing check is retried on **every** run, not once per 24 h; a fresh cache returns before the network call (`bin/akili.js:1855–1856`).
- The non-200 branch returns before `res.on("error")` is attached — `bin/akili.js:1875–1878` vs `:1881`. This is the shape Sentinel PRs #43–#55 keep filing; the 404-cut row above is the non-reproduction on Node 22.12.0. The user reports the same non-reproduction on Node 18.20.8 and 22.23.3 — `UNVERIFIED` here (not re-run in this session; only 22.12.0 is installed).

## Proposed Outcome

| Situation | Today | After |
|---|---|---|
| Registry drips bytes faster than 1.5 s | pending indefinitely (≤ ~13.9 h) | `null` before the deadline (~3 s); request destroyed |
| Registry stalls / cuts mid-body (200 or 404) | `null`, no crash | unchanged: `null`, no crash |
| Healthy registry | latest version | unchanged |
| `res` error before status check | handler attached after the early return | handler attached first; Sentinel shape closed at the source |

## Scope

- `fetchLatestVersion` in `bin/akili.js`: overall deadline timer → `req.destroy()` + `resolve(null)`; a once-only settle helper that also clears the timer on every path; `res.on("error")` as the first statement of the response callback. Existing 1500 ms idle timeout and 50,000-byte cap stay.
- Regression tests (new `node:test` file) with a local server, **red on today's code, green after** — executed, not predicted (KZ-changes--leader-brief-contract-2): slow drip; 404 cut mid-body; 200 cut mid-body.
- Test seam for the registry URL — decided at `/akili-specify` (options below).
- `.jules/sentinel.md`: new entry — fourth duplicate batch (#43–#55), the reported mechanism measured non-reproducible, the real defect found next to it (no overall deadline), linked to this fix.
- `CHANGELOG.md` `[Unreleased]` note.

## Non-Goals

- No release (patch is the classification; `release:patch` runs later, separately).
- No push, no PR, no closing Sentinel PRs from this change.
- No change to the 24 h cache policy, including caching failures (negative caching is a separate behavior change).
- No `timeout` field added to the SessionStart hook registration (installer behavior change; the deadline makes it unnecessary for this bug).
- No change to the TTY gate or to which commands run the check.

## Affected Users, Systems, And Specs

| Area | Effect |
|---|---|
| Interactive CLI users behind a broken proxy / TLS-intercepting middlebox | stop hanging |
| Claude Code users with `akili notifications enable` | session-start hook bounded by the deadline |
| `bin/akili.js` `fetchLatestVersion` | only code change |
| `test/` | new regression file; `test/init-pty.test.js` + `test/fixtures/init/no-network.js` unchanged (they assert `init` makes no https call — unaffected) |
| `.jules/sentinel.md`, `CHANGELOG.md` | notes |
| `docs/cli.md:86`, `README.md:444` | describe the 24 h cache only; no timing claims to update |

## Visual Reference

- Source: None
- Location: —
- Notes: CLI networking fix; no UI surface.

## Bug Diagnosis

### Observed Symptom
- An interactive `akili <command>` (or the `check-update --quiet` session hook) prints nothing and never proceeds when the registry response trickles in slowly. No error, no stack trace.

### Reproduction Steps
1. Local HTTP server: send 200 headers, then write 1 byte every 1000 ms, never end.
2. Point the verbatim `fetchLatestVersion` body from `bin/akili.js` at it (only the URL and `https`→`http` swapped; `timeout` semantics identical).
3. Expected: settles within a few seconds. Actual: pending at the 8 s cap (`scratchpad/repro.js bin/akili.js drip` → exit 2, Node v22.12.0).
4. Control: same server at 2000 ms per byte → `null` in 1504 ms — proves the 1500 ms timer is idle-based, not total.

### Root Cause (confirmed)
- `{ timeout: 1500 }` on `https.get` is `socket.setTimeout` — an inactivity timer reset by every received chunk (control run above). `fetchLatestVersion` has **no wall-clock bound**; the only other exit is the 50,000-byte cap. A response that sends < 50,000 bytes at intervals < 1500 ms never settles, and `await checkForUpdates()` / `await runCheckUpdate()` block the command on it.

### Blast Radius

| Check | Recorded as | Result |
|---|---|---|
| **Already fixed?** | `git log --all --oneline -S"setTimeout" -- bin/akili.js` → 0 hits; every local + remote ref's `fetchLatestVersion` body grepped for `setTimeout\|deadline` (`git for-each-ref refs/heads refs/remotes` loop) → 0 hits; `gh pr diff 48/52/55` → only move `res.on("error")`, none adds a deadline — as run 2026-10-19 | **Not fixed** anywhere. Proceed |
| **Live path?** | `main()` `:2434` → `checkForUpdates()` `:1926` (branch: `isTTY` `:1928`) → `getLatestVersion()` `:1910` (branch: fresh cache `:1912`) → `fetchLatestVersion()` `:1872`. Second entry: `main()` `:2426–2427` `check-update` → `runCheckUpdate()` `:1952` → `getLatestVersion()` (no TTY branch) | **On path** for interactive commands with no fresh cache, and for `check-update` regardless of TTY |
| **Siblings on the same state** | Outbound network calls in shipped code: `grep -n "https\.\(get\|request\)\|http\.\(get\|request\)" bin/*.js scripts/*.js` → only `bin/akili.js:1874`. Other bounded waits: `execCliSync(..., { timeout: 5000 })` `bin/akili.js:1360` — a child-process wall-clock timeout, not affected | No sibling network call; fix is one function |
| **Downstream consumers** | `getLatestVersion` callers: `checkForUpdates` `:1929`, `runCheckUpdate` `:1953`; SessionStart hook `NOTIFY_HOOK_COMMAND` `:1976`; tests: `test/init-pty.test.js` via `test/fixtures/init/no-network.js` (asserts no https call during `init`); docs `docs/cli.md:86`, `README.md:444` (cache only) | Return contract (`string \| null`) unchanged — no consumer change |

- Security: availability only (hang). No data integrity or confidentiality impact. Trigger needs control of the registry response (TLS interception, a broken or hostile proxy); a fresh cache or a non-TTY run skips it for normal commands, not for `check-update`.

### Fix Strategy
- Smallest safe correction inside `fetchLatestVersion`: one `settle(value)` helper (clears the deadline timer, resolves once), a `setTimeout(…, 3000)` deadline that destroys the request and settles `null`, and `res.on("error")` moved to the first line of the response callback. Note: `resolve` is already idempotent; the guard's job is clearing the timer on every exit path so a settled check never keeps the event loop alive for 3 s.
- Route: `/akili-specify` (Lite) in **Bug Mode** — logic change, regression test required (red before, green after).

## Approach Options

| Option | What | Trade-off |
|---|---|---|
| **A. Deadline in `fetchLatestVersion`** (recommended) | `setTimeout` + `req.destroy()` + settle guard; `res.on("error")` first | Smallest diff, one function, covers both callers; works on Node 18+ |
| B. `AbortSignal.timeout(3000)` passed as `signal` | Native abort | Same effect; abort surfaces as an `error` with `AbortError` that must map to `null`; less obvious in a file that uses explicit handlers everywhere else |
| C. `Promise.race` in `getLatestVersion` | Deadline around the call | Leaves the socket open after the race is lost — the process cannot exit until the drip ends; rejected |

### Test seam (decide at specify)

| Seam | How | Trade-off |
|---|---|---|
| `--require` preload (like `test/fixtures/init/no-network.js`) | Preload wraps `https.get` to redirect to a local `http` server; drive `node bin/akili.js check-update` (no TTY gate) with `HOME` set to a temp dir so the cache is empty | Black-box, no export added; exercises the real entry path. Preload swap must keep the `(url, options, cb)` signature |
| Export `fetchLatestVersion` (URL param defaulting to the registry) | `require` from the test | Simplest test; `bin/akili.js` has no `module.exports` and runs `main()` on load — needs a `require.main === module` guard, a wider change |
| Extract source text (as the repro did) | — | Fragile; not for a kept test |

## Risks, Dependencies, And Open Questions

| # | Item |
|---|---|
| R1 | The red run must be **executed** on today's code with an outer cap, not asserted — this session's first 2 s control run was invalid (both args passed as one string → 1 ms writes) and was caught only by re-running (KZ-changes--leader-brief-contract-2). |
| R2 | Deadline value: 3 s keeps the healthy path untouched (median registry response is sub-second) but adds up to 3 s to a startup on a hung network, every run, because failures are not cached. Acceptable per Non-Goals; flag if the user wants a lower value. |
| R3 | Test timing: the drip test waits for the deadline (~3 s). If that is too slow for the suite, specify may make the deadline injectable for tests (env var or parameter) — decide with the seam. |
| R4 | `.jules/sentinel.md` / `CHANGELOG.md` claims are quote-checked at HEAD (KZ-002): the brief says #43–#55 were "closed as duplicates", but `gh pr list` as run 2026-10-19 shows **#52 and #55 still OPEN**. The entry must state the measured state; closing them is the user's call. *Update 2026-10-19 (specify, judgment-day J1/F1): all thirteen, #43–#55, were closed unmerged at 16:24–16:25Z the same day; the sentinel entry records that history.* |
| R5 | Node 18.20.8 / 22.23.3 non-reproduction of the 404-cut shape is user-reported, not re-run here; specify decides whether CI's Node matrix (18/22) running the new tests is the verification. |
| Q1 | Host default timeout for a Claude Code SessionStart hook with no `timeout` field — confirm before the sentinel entry states how long a session start can block. |

## Success Criteria

- Slow-drip test: red today (still pending past the deadline + margin), green after (`null` before ~3 s + margin).
- 404 cut mid-body and 200 cut mid-body: `null`, no uncaught exception, before and after.
- `npm test`, `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` pass.
- Process exits promptly after a settled check (no lingering deadline timer).
- `.jules/sentinel.md` entry and `CHANGELOG.md` note present and quote-checked.

## Next Step

```text
/akili-specify bugfix/update-check-deadline
```

Runs in **Bug Mode** (Lite): convert the confirmed root cause into the fix plan, pick the test seam, and require the red-then-green regression tests.
