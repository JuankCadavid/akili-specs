# Judgment Day — `changes/branching-flow-dev-next` design

| Field | Value |
|---|---|
| Target | `requirements.md` + `design.md` (+ `proposal.md`) at `e28e106` |
| Mode | judgment_day, blind dual review, read-only judges |
| Judges | Judge A, Judge B — both Sonnet (author: Opus — author ≠ auditor) |
| Date | 2026-10-19 |
| Skill resolution | `judgment-day` (packaged); shared ledger contract and prompt references not packaged → contract from SKILL.md alone |
| Result | **JUDGMENT: APPROVED ✅** — 0 severe findings confirmed by both judges; no fix round needed |

## Frozen ledger

| ID | Finding | A | B | Classification | Disposition |
|---|---|---|---|---|---|
| J1 | `ci.yml:12-14` cited for the push trigger; actual `:9-10` | — | SEVERE (F-1) | suspect → **settled at source** (`cat -n ci.yml` → 9 `push:`, 10 `branches: [master]`) | Corrected in proposal, requirements, design P-2 |
| J2 | P-13 cites `bin/akili.js:893` as reading the repo version; it reads an installed copy | SEVERE (F-1) | confirmed `:893` (no severity) | suspect → **settled at source** (`sed -n 885,895p`) | P-13 reworded |
| J3 | Resync `master` → `dev` PR deadlocks under `strict` once `dev` advances; merge method unspecified | WARNING (F-3) | SEVERE (F-2) | confirmed by both, severity split → info + architect amendment | DD-9 + FR-7: `sync/master-into-dev` branch from `dev`, merge commit on both PRs |
| J4 | `execFileSync("npm")` fails on Windows; `--otp` through a shell | WARNING (F-4) | WARNING (F-5) | info | DD-13, P-16, FR-4 `--otp` 6–8 digits |
| J5 | Throwing facts (`origin/dev` absent, non-stable version) break "report all guards" | WARNING (F-5) | WARNING (F-6) | info | DD-5 null-safe facts, P-15; prefix parsing instead of a regex built from the version |
| J6 | Restore covers only SIGINT; listener registered after the write | WARNING (F-6) | WARNING (F-4) | info | DD-4: SIGINT/SIGTERM/SIGHUP before the write; P-7 re-probed SIGTERM/SIGHUP; recovery hint |
| J7 | `release.js` hints (`git tag`, `npm publish` right after bump) contradict the flow | WARNING (F-7) | WARNING (F-10) | info | New FR-9 / DD-14 (hint lines only) |
| J8 | Status claimed approval before `judgment.md` existed | WARNING (F-2) | WARNING (F-9) | info | Status now cites this file |
| J9 | Missing rows: merge settings / linear history, `release.js` branch guard, digests version, `--tag next` safety | WARNING (F-8) | WARNING (F-8, F-13) | info | P-1 extended, P-14, P-17 added. `--tag next` safety is enforced by the argv test (FR-4), not a premise |
| J10 | P-9 inexact (which test reads which README; two test files unlisted) | WARNING (F-9) | WARNING (F-11) | info | P-9 rewritten with line numbers |
| J11 | Stale `dev` (package behind npm) passes "base unpublished" | SUGGESTION (F-10) | SUGGESTION (F-12) | info | DD-12 guard *Base ahead* |
| J12 | `release-status` must flag a prerelease left in `package.json`; FR-6 drift path untested | SUGGESTION (F-10) | SUGGESTION (F-14) | info | FR-6 `AND IT MUST`; DD-8 `releaseFailures` pure + tested |
| J13 | Interruption has no row in Defect Classes | — | WARNING (F-7) | info | requirements §8 rows added |
| J14 | Count line ambiguous (Low/High) | — | WARNING (F-8) | info | "by Impact" wording |
| J15 | Restore failure must be loud | — | SUGGESTION (F-15) | info | FR-4 + §7: recovery command, exit 1 |
| J16 | `digests.json` stable version stamps `@next` migrations (A's reading via `table.version`) | WARNING (F-8a) | SUGGESTION (F-13, no runtime comparison found) | settled at source: `bin/akili.js:1710` passes `currentVersion`, so the prerelease string is used | P-14 records it as not a defect |

## Premise attack summary

A: 10 confirmed, 1 refuted (P-13 citation), 2 not re-run (P-7, P-10). B: 11 confirmed, 1 refuted (P-2 line numbers), 1 not re-run (P-10). Neither could refute P-10; it stays `UNVERIFIED`, owned by the user at the first stable release.

## Correction work units

None under the protocol (no dual-confirmed severe). Architect amendments listed in the Disposition column were applied before the Phase 2 gate; no scoped re-judgment was required.

JUDGMENT: APPROVED ✅
