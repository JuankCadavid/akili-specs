# Requirements: update check — an overall deadline, so a slow registry cannot hang the CLI

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `bugfix/update-check-deadline` |
| Depth | **Lite** (Bug Mode) |
| Type | Bug |
| Deliverable | software |
| Approval Mode | `pre-approved (user, 2026-10-19)` — mandate: "continue through the following gates up to archive with local commits only: no push, merge, tag, release or npm publish". Overrides the proposal's `gated`. Escalations (HALT, Pivot, budget tripwire, `FATAL_FAIL`, `PRODUCT_BUG`, destructive actions) still stop |
| Status | **Approved** — Phase 1 gate: `auto-approved (pre-approved mode)`, 2026-10-19 |
| Date | 2026-10-19 |
| Source | `proposal.md` (approved 2026-10-19, Option A, commit `1e2b44c`) plus the user's decisions: test seam = `--require` preload, no new export; deadline adjustable for tests allowed if the default stays 3 s; #52/#55 recorded as an observation only. *Amended 2026-10-19 (judgment-day J1/F1, both judges): #43–#55 were all closed unmerged at 16:24–16:25Z the same day (`gh pr view`, as run 17:04Z); the observation records that history* |
| Format precedent | `docs/specs/archive/2026-10-18-bugfix--init-ctrlc-abort/requirements.md`. No `docs/specs/general-setup/`, `docs/prd.md` or `docs/trd/` in this repo (`ls docs docs/specs`, as run 2026-10-19) |
| Verified at | `1e2b44c` |
| Deviations from proposal | none |

## 2. Executive Summary

The registry check behind the startup banner and `akili check-update` SHALL settle within ~3 s whatever the registry does. A response that drips bytes faster than the 1.5 s idle timer must no longer keep the CLI waiting. The result contract (`latest version` or nothing) and every other path stay as they are.

## 3. Glossary

| Term | Meaning |
|---|---|
| Update check | `fetchLatestVersion` → `getLatestVersion`, reached from `checkForUpdates` (interactive commands) and `runCheckUpdate` (`akili check-update`, the SessionStart hook command) |
| Deadline | Wall-clock bound on one update check, default 3000 ms |
| Slow drip | A 200 response that sends one byte every 1000 ms and never ends |
| Cut mid-body | Headers plus 13 body bytes of a declared 1000, then the socket is destroyed |

## 4. System Context & Scope

- Today `{ timeout: 1500 }` (`bin/akili.js:1874`) is an idle timer: a 1000 ms drip stays pending past an 8 s cap, a 2000 ms drip settles `null` in 1504 ms (proposal → *Reproduction*, Node 22.12.0). The real CLI (`check-update`, preload-redirected registry, as run 2026-10-19) is still pending at 6 s on Node **18.20.8, 22.12.0 and 22.23.3**.
- 404 and 200 cut mid-body already settle with exit 0, empty stderr, no crash, on those three versions (same run). The user's non-reproduction of the Sentinel #43–#55 shape is now confirmed on 18.20.8 and 22.23.3 too.
- `check-update` has no TTY gate (`bin/akili.js:1952–1953`); a failed check writes no cache (`:1914`).
- **Out of scope:** caching failures, a hook `timeout` field, the TTY gate, the misleading "is up to date" line when the check fails (`:1967`), releasing, closing or reopening any PR.

## 5. Stakeholders / Personas

| Who | Needs |
|---|---|
| Interactive CLI user on a broken proxy / TLS-intercepting network | the command to start within seconds |
| Claude Code user with `akili notifications enable` | session start not held by the hook |
| Maintainer reading `.jules/sentinel.md` | an accurate record of the fourth Sentinel batch |

## 6. Functional Requirements

### FR-1: The update check settles within the deadline

The system SHALL settle the update check with "no version" no later than the deadline (default 3000 ms) after it starts, and SHALL abort the registry request when the deadline fires.

#### Scenario: Slow drip (the reproduced hang)

- GIVEN a registry that answers 200 and then writes one byte every 1000 ms
- WHEN `akili check-update` runs with no fresh cache
- THEN the process exits `0` between 2500 ms and 5000 ms after the request reaches the registry
- AND IT MUST write no update cache
- BUT it must NOT still be running at 6000 ms (today it is)

### FR-2: Cut responses still settle at once, without a crash

The system SHALL settle "no version" without an uncaught error when the registry cuts the body, for any status.

#### Scenario: 404 cut mid-body / 200 cut mid-body

- GIVEN a registry that sends a 404 (or 200) and 13 of 1000 declared bytes, then destroys the socket
- WHEN `akili check-update` runs with no fresh cache
- THEN the process exits `0` under 2500 ms after the request reaches the registry, with empty stderr and prints `is up to date.`
- AND IT MUST write no update cache
- BUT it must NOT wait for the deadline to settle (that would mask a missing response-error handler)

### FR-3: A healthy check is unchanged and exits promptly

The system SHALL keep returning the registry's `latest` and caching it, and a settled check SHALL NOT keep the process alive until the deadline.

#### Scenario: Healthy registry

- GIVEN a registry that answers 200 `{"latest":"999.0.0"}`
- WHEN `akili check-update` runs with no fresh cache
- THEN it prints the `Update available` line naming `999.0.0` and exits `0` under 2500 ms after the request reaches the registry
- AND IT MUST write the cache with `"latest":"999.0.0"`

### FR-4: Records

The system's maintainers SHALL find the fix in `CHANGELOG.md` `[Unreleased]` and a `.jules/sentinel.md` entry for the fourth Sentinel batch (#43–#55): the reported mechanism, measured non-reproducible on Node 18.20.8, 22.12.0 and 22.23.3; the real defect next to it (no overall deadline), linked to this fix; and the observation that #52 and #55 were still open when the proposal was written, and that all thirteen (#43–#55) were then closed unmerged on 2026-10-19 between 16:24Z and 16:25Z (re-checked with `gh pr view` before the entry is written).

#### Scenario: Entry quote-checks at HEAD

- GIVEN the two notes
- WHEN each clause is checked against the shipped code and `gh pr list` output
- THEN every clause holds (KZ-002)
- BUT it must NOT state a PR state that `gh pr view` does not show at write time, or a host hook timeout value

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | The tests MUST make no outside network call: every registry request reaches a local server, proven by a hit counter and the healthy control (FR-3). |
| NFR-2 | The test seam is a `--require` preload under `test/fixtures/`; `bin/akili.js` gains no export and no test-only branch. |
| NFR-3 | The default deadline is 3000 ms. No new dependency (`package.json` keeps no `dependencies`). Supported: the CI matrix `os: [ubuntu-latest, macos-latest, windows-latest]` × `node: [18, 22]` (`.github/workflows/ci.yml:30–31`); the new tests run on all six cells, with no skip. |

### Defect classes → gate

| Defect class | Gate |
|---|---|
| Check never settles under a drip (FR-1) | Drip case: exit in [2500, 5000) ms; red today at the 6000 ms cap on 18.20.8 / 22.12.0 / 22.23.3 |
| Deadline timer left armed → process lingers ~3 s (FR-3) | Cut and control cases' < 2500 ms bound (falsifier: drop the timer clear → ~3050 ms, executed) |
| Missing response-error handler hidden by the deadline (FR-2) | 200-cut < 2500 ms bound (falsifier: drop `res.on("error")` → ~3050 ms, executed) |
| Seam silently inert: tests talk to the real registry (NFR-1) | Hit counter + `999.0.0` control |
| Version- or OS-specific stream / process behavior | Local runs on 18.20.8, 22.12.0, 22.23.3 (darwin); CI `[ubuntu, macos, windows] × [18, 22]` — Windows has no local gate (design P-10) |
| False clause in CHANGELOG / sentinel entry (FR-4) | Quote-check at HEAD by the Reviewer. No automated gate: accepted, human-checked |
| Error before `res.on("error")` on a non-200 (Sentinel shape) | **No gate can make it red** — non-reproducible on all three versions. Moving the handler first is hardening; recorded as an accepted gap |

## 8. Requirement ID Index

| ID | Title |
|---|---|
| FR-1 | The update check settles within the deadline |
| FR-2 | Cut responses still settle at once, without a crash |
| FR-3 | A healthy check is unchanged and exits promptly |
| FR-4 | Records (CHANGELOG, sentinel entry) |
| NFR-1 | Tests offline |
| NFR-2 | Preload seam, no export |
| NFR-3 | 3000 ms default, no dependency, Node 18/22 |
