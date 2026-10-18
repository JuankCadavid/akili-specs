# Judgment Day — `changes/video-deliverable-track`

## Transaction

| Field | Value |
|---|---|
| Target | `proposal.md`, `requirements.md`, `design.md`, `tasks.md` at `22e990b` (immutable) |
| Requested by | Juan Carlos Cadavid, 2026-10-18 — "revisión del diseño con judgment-day (por P-13); aplica los ajustes" |
| Judges | A and B, blind, parallel, read-only brief, model `sonnet` (author ran on Opus — author ≠ auditor) |
| Upstream reference | `heygen-com/hyperframes@01adadb9` |
| Protocol notes | Judge B briefly ran `git checkout --detach 4a6ac65` in the worktree and restored it — a breach of the read-only brief; the orchestrator verified HEAD `22e990b`, clean status, no stash entries before any edit. The fix actor was the orchestrator, working inline. |
| Round 1 fix delta | commit after `22e990b` (this file's commit) |

## Round 1 — merged ledger

**Disposition rule:** the skill auto-fixes only severe findings that both judges confirm. The user asked for the adjustments to be applied, so findings that both judges raised at WARNING are also applied, as a specify Adjust round. A finding from one judge stays **suspect**. Suspects are applied only when the orchestrator settled them at the source, and that check is noted in the row.

| ID | Finding | A | B | Status | Fix |
|---|---|---|---|---|---|
| J-1 | Premise count line "11 verified" contradicts 14 rows | A-1 severe | B-3 severe | **confirmed severe** | count line recomputed (now 23 rows: 20 · 2 · 1 refuted) |
| J-2 | `consumer` trigger fired with no `consumer` row; `live-path` / `shared-state` also fire | A-2 severe | B-1 severe | **confirmed severe** | P-15, P-16, P-17 (`consumer`), P-21 (`live-path`), P-22 (`shared-state`) added |
| J-3 | P-14 refuted: skills CLI 1.7.2 moved Codex's global dir | ledger: refuted | B-4 severe | **confirmed severe** | P-14 marked refuted and absorbed; install hints name project-scoped dirs only (design §9) |
| J-4 | Skill-set consumers missing: `test/fixtures/doctor-codex-baseline.txt`, `docs/cli.md` "24 packaged skills", test comments | A-10 WARN | B-2 severe | **confirmed** (orchestrator re-ran `grep -rln vercel-react-best-practices test/` → fixture; `grep -n "24 packaged skills" docs/cli.md` → 3) | P-16; T10 and T11 scope |
| J-5 | `Deliverable` copy into `requirements.md` has no owner | A-3 severe | B-10 WARN | **confirmed** | FR-1 "reaches every reader" scenario; T5 scope; P-21 |
| J-6 | T5 (now T6) falsifier inert; P-13 settleable now | A-4 severe | B-16 SUGG, P-13 confirmed by scratch `npm test` | **confirmed** | P-13 verified; falsifier = renumber item 4 (observed red by B) |
| J-7 | `npm test` cannot be green mid-window and must not run beside agents | A-5 severe | — | suspect (applied: grounded in AGENTS.md Concurrency + `:245` literal) | quiet-tree rule; scoped suite in T6; full suite at T11 with pre-edit red |
| J-8 | NFR-2 allow-list contradicts FR-5's named outward actions | A-6 | B-6 | **confirmed WARNING** | NFR-2 / DD-8 split: instruct list vs consent-only names; P-18 |
| J-9 | T2 spans two rules documents | A-9 | B-7 | **confirmed WARNING** | split into T2 (governance) and T3 (constitution) |
| J-10 | Missed restatements: `README.md:828`, `docs/commands/*` | A-10 | B-8, B-9 | **confirmed WARNING** | P-6 widened; T10 scope; FR-9 phrase family widened |
| J-11 | Render timing contradiction (output needed at test, render only after approval) | A-11 | B-5 | **confirmed WARNING** | Draft vs delivery render defined (glossary, FR-3, FR-6, FR-7, DD-11) |
| J-12 | Trivial × video routes to quick, which has no render gate; deck has no value | A-8 | B-11 | **confirmed WARNING** | FR-1 scenarios added; DD-4; new T9 (quick escalation line) |
| J-13 | Availability gate misses plugin-namespaced router; install hint wrong for agents | A-12 | B-13 | **confirmed WARNING** | FR-4 `AND IT MUST`; P-19; `npx hyperframes skills update` as the agent route; validate loads the bridge (FR-7) |
| J-14 | Falsifiers written as predicted outcomes | A-13 | B-15 (part) | **confirmed WARNING** | falsifier convention block; baselines quoted where observable; precondition label |
| J-15 | Budget says 17 rounds although T10 is skip-eligible; DD-5 drift claim | A-15 | B-15 | **confirmed WARNING** | budget recomputed (20 rounds / 12 tasks); DD-5 restated with P-17 |
| J-16 | FR-3 "every task" owned by an optional Leader example | A-15 (part) | B-12 | **confirmed WARNING** | FR-3 reworded; T5 owns the rule, T6 the example |
| J-17 | NFR-1 can't hold for propose detection text; T3 omitted Next Step | A-7 | — | suspect (applied: true by construction) | NFR-1 carve-outs; Next Step counted in T4 |
| J-18 | `du -sk` measures blocks; proposal said 3–4 references | A-14 | — | suspect (applied) | `wc -c` ≤ 20000; proposal §10 cell amended |
| J-19 | KZ-004 per-command terminal branches not enumerated; proposal §6 vs DD-5 | — | B-14 | suspect (applied) | design §3 lists every command's branch; deviation row in Document Control; P-20 (audit) `UNVERIFIED`, Low |
| J-20 | Compare `format.duration` with target and `data-duration`; Skill Map row precedence | A-16 SUGG | — | info (applied) | DD-12; §9 precedence note |
| J-21 | Q3 (doctor probe) unrecorded; persona drift consumer | — | B-17 SUGG | info (applied) | requirements Document Control; P-17 |

**Counts:** 4 confirmed severe (J-1–J-4) · 3 more both-judge confirmations with split severity (J-5, J-6, and J-4's WARNING half) · 9 confirmed WARNING · 5 suspect (all settled at the source and applied) · 2 info · 0 contradictions.

## Round 1 — scoped re-judgment

See the section below, appended after the re-judges return.
