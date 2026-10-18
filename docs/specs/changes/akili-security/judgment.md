# Judgment Day — `changes/akili-security` design review

| Field | Value |
|---|---|
| Target | `requirements.md`, `design.md`, `tasks.md` (+ `proposal.md` as intent) at `a31f876` |
| Mode | judgment_day — two blind read-only judges, same prompt, model `sonnet` (author: `opus` — author ≠ auditor) |
| Requested by | Juan Carlos Cadavid, 2026-10-18 ("Revisa el diseño con judgment-day … Aplica las correcciones que salgan") |
| Round 1 verdicts | Judge A: `FAIL (2 severe)` · Judge B: `FAIL (2 severe)` (both interrupted once by an account rate limit and resumed from their saved state) |
| Skill resolution | `judgment-day` (user skill); no project-specific judge skill |

## Frozen ledger (round 1)

| ID | Status | Judge A | Judge B | Finding | Disposition |
|---|---|---|---|---|---|
| C-1 | **confirmed severe** | J-1 severe | J-2 severe | P-7 / §9 / T3a / T3c miss two restatements of the drift source: `docs/commands/akili-archive.md:68`, `docs/skills/kaizen.md:24`; T3a's "none restates" false (KZ-004) | **Fixed** — P-7 row, §9, §4, T3a/T3c Consumers, T5b scope, sweep and falsifier |
| C-2 | **confirmed defect, severity contradiction** (A severe, B suggestion) | J-2 severe (executed: `187a188 >`, exit 1) | J-9 suggestion | T1 body-diff gate `sed '$d'` leaves the separator blank line → correct vendor fails | **Fixed** — new gate executed at spec time: correct adaptation → exit 0, body-byte mutation → exit 1. Both judges named the same defect; fixed because the evidence is executed, severity left as recorded |
| S-1 | suspect severe (one judge) → **settled by architect re-run** | — (J-10 warning: test comments `:216/:227/:232`) | J-1 severe | Count restatements outside tests: `docs/cli.md:117,182,183,194,195,216` (11 commands / 24 skills) in no consumer list | Re-run `grep -nE "\b(11\|24\|199\|210)\b" docs/cli.md README.md docs/README.md docs/commands/README.md docs/skills/README.md` confirmed exactly those six lines → **Fixed** in P-10, §9, T5b scope + count sweep; test comments added to T4 |
| I-1 | info (warning, both) | J-8 | J-3 | Tarball delta quoted from `du -sk` blocks; real bytes ≈ 261 KB (259 803 + 1 078), not ~290 KB; NFR-4 cap holds | Not auto-fixed (protocol) — offered at the gate |
| I-2 | info (warning, both) | J-5 | J-5 | Index carries the absolute run path (leaks home/username) and per-severity counts of unfixed vulns | Offered at the gate |
| I-3 | info (warning, both) | J-6 | J-6 | Routing slug/pointer derived from finding titles (untrusted content) — no sanitisation rule | Offered at the gate |
| I-4 | info (warning, both) | J-7 | J-8 | Review-round estimate (18) equals the escalation cap — one rework round trips it | Offered at the gate |
| I-5 | info (warning, both) | J-4 | J-4 | Upstream fixes `run-metadata.json` `execution_policy: "sandboxed-source-and-local-only"`; static-only mapping undefined; static-only yields few `confirmed` (validator needs `execution.observed_result`) | Offered at the gate |
| I-6 | info (warning, both) | J-11 | J-7 | T2/T3 falsifiers are self-graded clause walks; no mechanical CI guard for the reader scoping | Offered at the gate |
| I-7 | info (warning, A) | J-3 | J-10 (suggestion) | P-14 could cite AGENTS.md / Step 8E wrapper formats | Offered at the gate |
| I-8 | info (warning, A) | J-9 | — | `proposal.md:48` says "13 companion `.md`"; upstream has 14 | Offered at the gate |
| I-9 | info (warning, A) | J-12 | — | T8 "fresh install into the session host" writes the user's real HOME; run dir outside repo ungated | Offered at the gate |
| I-10 | info (suggestion, A) | J-13 | — | Preflight `git` commands in a hostile clone can run `core.fsmonitor` | Offered at the gate |
| I-11 | info (suggestion, A) | J-15 | — | Document Control says verified at `6d1e152`; target is `a31f876` (cited lines unchanged) | Offered at the gate |
| — | confirmed premises | P-1, P-2, P-3 (re-run, A), P-5, P-6 (partly re-run, A), P-9, P-12, P-15, P-16; DD-2 and DD-7 judged justified by both | | | |

## Correction round 1

Fix actor: the orchestrating session (inline — spec text only). Delta: `design.md` §4, §9, P-7, P-10; `tasks.md` T1 Command, T3a/T3c Consumers, T4 Scope, T5b Scope/Command/Falsifier. Correction-closure sweep: `grep -rn "none restates\|if it restates\|checked in T5b\|sed '\$d')\` → empty"` over the spec folder → 0 hits.

## Scoped re-judgment (round 1)

| Ledger ID | Judge A | Judge B |
|---|---|---|
| C-1 | resolved (both restatements now in P-7, §9, §4, T3a/T3c, T5b) | resolved |
| C-2 | resolved — new gate exit 0 on scratch adaptation; body mutations (first paragraph, last anti-pattern) exit 1 | resolved — empty vs non-empty diff on correct vs mutated adaptation |
| S-1 | resolved — wider search over `docs/ README.md bin/ scripts/ .github/` finds the same six `docs/cli.md` lines | resolved |

Fix-caused findings (info, non-blocking): **F-1** (A warning; B noted the same as harmless) — T4 closing grep cannot see `:249` (`COMMAND_COUNT, 11`), named explicitly in T4 Scope; **F-2** (A suggestion) — T1 Consumers lists `:245,249,340,387` while T4/§9 also name `:216,:227,:232,:246`. Both offered at the gate with I-1…I-11.

Re-judgment verdicts: Judge A `PASS (0 severe)` · Judge B `PASS`.

**JUDGMENT: APPROVED ✅** — round 1 of 2; no severe finding open.

## Gate adjustments (approved by the user at the specify gate, 2026-10-18)

Juan Carlos Cadavid approved applying these info items as a **user-approved gate adjustment** (not judge-verified fixes; no re-judgment was requested):

| ID | Adjustment | Where |
|---|---|---|
| I-1 | Tarball delta restated in bytes: ~261 KB (259 803 B + 1 078 B `LICENSE`) | `design.md` §9 |
| I-2 | Index run path `~`-relative; absolute home path / user name added to FR-8's forbidden list; counts by severity declared accepted disclosure, with "do not commit while confirmed findings are open" advice | `requirements.md` FR-8; `design.md` §5.1; `tasks.md` coverage |
| I-3 | Routing slug `bugfix/security-<YYYY-MM-DD>-s<n>`, pointer = `~`-relative run dir + `S-n`, charset `[a-z0-9-]`; new FR-10 `BUT` clause: no text from a finding | `requirements.md` FR-10; `design.md` §3, §5.1, §7.1; `tasks.md` T2 falsifier, coverage |
| I-5 | `run-metadata.json` keeps upstream's fixed `execution_policy` and gains `akili_execution`; plan gate states the expected yield (mostly `needs_validation` under static-only); new premise row P-17 | `requirements.md` FR-4; `design.md` P-17 (+ count line); `tasks.md` coverage |
| I-8 | 14 companion `.md` (4 phase docs + 10 domains) | `proposal.md` |
| I-9 | T8: runs only on Juan Carlos's explicit go-ahead; no install (the worktree's own `.claude/` is loaded), `--out` under the session scratchpad — the real HOME is never written | `tasks.md` T8 |
| F-1 | T4 closing grep gains `\b11\b` (covers `:249`) | `tasks.md` T4 |
| F-2 | T1 Consumers aligned with T4's comment list | `tasks.md` T1 |

Not applied (left as info): I-4 (budget headroom), I-6, I-7, I-10, I-11.
