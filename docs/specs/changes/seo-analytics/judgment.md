# Judgment Day — `changes/seo-analytics` design

| Field | Value |
|---|---|
| Target | `design.md` + `requirements.md` + `proposal.md` at `0263f82` (frozen) |
| Mode | judgment_day — two blind read-only judges (A, B), sonnet (author: opus, author ≠ auditor) |
| Skills passed | `.claude/commands/akili-specify.md` Step 2.2 (Premise Ledger), `AGENTS.md` |
| Correction authority | User, 2026-10-22: "Aplica los fixes que salgan, haz commit local" (covers the round-1 correction ask) |
| Round | 1 of 2 |

## Round 1 — merged ledger

Findings are keyed by defect. "Both" means both judges reported the same defect, at any severity. Severe findings confirmed by both are auto-fixed. Single-judge severe findings were settled by the architect re-running the cited evidence (protocol: suspect, then one re-run). Warnings and suggestions were fixed where cheap, and are otherwise `info`.

| ID | Defect | Judges | Severity | Settled by | Fix |
|---|---|---|---|---|---|
| J-1 | The FR-11 checklist surface carried only the prohibition, `:303` was unassigned, and `:491` had no conversion/UX half; the metric list was partial | A-3 sev, B-3 sev, A-12 | **confirmed severe** | — | design §7 (checklist `:303` rewritten), §9.2 (`:491` both halves, full Glossary list), §9.3 (8 surfaces × 2) |
| J-2 | The consumer sweep was too narrow (P-3 and P-16 scope) | A-6 sev, B-14 warn | **confirmed** | re-run, whole repository | P-3 widened (whole-repo command, every hit dispositioned); P-16 widened; `docs/skills/README.md:36` and `evals.json:139` added to scope (GA-3) |
| J-3 | The Ley 1581 basis was unqualified (personal data); Decreto 1377 was dropped silently | A-1 sev, B-6 warn | **confirmed** | P-22 verified (Art. 3(c), 0 `cookie` hits) | DD-7, §9.1 item 5, requirements FR-4 row 1 (GA-1); P-22 added; P-23 (Decreto 1377 → 1074/2015) `UNVERIFIED`, owned by T1 |
| J-4 | FR-6 "record which evidence settled the state" had no site | A-4 sev, B-17 | **confirmed** | — | §5.2 link states with an evidence suffix; §7 2B.2 (v) |
| J-5 | FR-3 measurement-ID consistency had no site | A-5 sev, B-17 | **confirmed** | — | §7 2B.2 (i); §9.1 item 5; §9.3 FR-3 |
| J-6 | The GSC side of the join claimed reuse of Step 2.4 (`query,page`), which does not exist | B-1 sev | suspect → **confirmed by re-run** | `sed -n 177,186p .claude/commands/akili-seo.md` (P-24) | DD-13; §6 GSC row (own calls, 250-page cap) |
| J-7 | `shared-state` trigger fired with no row; `live-path` "none" unjustified | B-2 sev | suspect → **accepted** | design reading | P-25 (readers enumerated); live-path line justified |
| J-8 | The test design could not falsify per surface (whole-file match) | B-4 sev | suspect → **accepted** | reading of §9.3 | §9.3 heading-scoped extraction + falsification procedure |
| J-9 | `:57` "If any prerequisite is missing, stop" would block the run on a missing analytics prerequisite | B-5 sev | suspect → **confirmed by re-run** | `sed -n 55,58p .claude/commands/akili-seo.md` | §7 Prerequisites: `:57` rescoped to items 1–5; reversion challenge recorded |
| J-10 | The external ranking-rule claim (Google, Bing) had no premise row | A-2 sev | suspect → **accepted** | WebSearch: secondary sources only | P-21 `UNVERIFIED` (T1); §9.1 item 2: prohibition, not an assertion; Bing not asserted; site analytics separated from engine signals |
| J-11 | File count "five files change" was wrong | A-7, B-12 | warning (both) | — | §2 "Eight files change and two are new" (after GA-3) |
| J-12 | Assertion count "~30" understated; test LOC rests on it | A-8, B-12 | warning (both) | — | §9.3 table (~67); §11 test ~350, total ~790 |
| J-13 | requirements §4 cited "design §11" for the ledger | A-15, B-13 | warning (both) | — | corrected to §12 |
| J-14 | P-9 said "verified at the user's instruction" and omitted the project condition | A-14, B-8 | warning (both) | page re-read | P-9 reworded with the condition; FR-4 row 5 (GA-2) |
| J-15 | MCP write tool vs NFR-6 | A-10, B-9 | warning (both) | — | DD-12; P-10; §6; §7 prerequisites |
| J-16 | P-12 unsettled; "prior" not in Art. 5(3) | A-13, B-7 | warning (both) | legislation.gov.uk Art. 5(3), GDPR Art. 4, 7 | P-12 verified (EUR-Lex unreachable to all three) |
| J-17 | GA4 dimensions for FR-9 and the join were missing | A-9, B-16 | warning (both) | — | §6 adds `hostName`, `sessionSource`, `eventName`; P-27 `UNVERIFIED` (T1) |
| J-18 | FR-2 "how to obtain" missing from the state string | A-11, B-17 | warning (both) | — | §5.2 `; obtain: <action>` |
| J-19 | The click generates real hits; navigation cancel unstated | B-10, A-18 | warning (both) | — | DD-11; §5.1 test-traffic disclosure; §7 2B.2 (iv) |
| J-20 | The command line budget was tight and unitemized | A-19, B-18 | suggestion (both) | — | §7 per-site line budget, ≤ 427 |
| J-21 | Clarity error codes 400/401/403 | B-15 | suggestion | page | §7 Error Handling split |
| J-22 | A rendering-capability premise had no row | B-11 | warning | session tool list | P-26 |
| J-23 | Consent Mode "four required" is an inference | A-16 | suggestion | page quote | P-8 reworded; missing parameter reported as a signal |
| J-24 | P-15 cited `package.json` only | A-17 | suggestion | `bin/akili.js:73,806`, CI `:287` | P-15 citation |
| J-25 | FR-1 "never asked again", GTM static rule in 2B.1, the "GA4 does not receive consent state" finding | B-17, A-18 | suggestion | — | §7 Phase 0, 2B.1, 2B.2 (iii) |

Contradictions between the judges: none.

## Gate adjustments to `requirements.md`

| ID | Change |
|---|---|
| GA-1 | FR-4 row 1 basis: Ley 1581 applies "where the analytics processing involves datos personales (Art. 3(c))" and is never cited as a cookie-banner mandate; ePrivacy Art. 5(3) and GDPR Art. 4(11)/7 named |
| GA-2 | FR-4 row 5: the Clarity consent signal is required "where the Clarity project is configured to require cookie consent" |
| GA-3 | Scope and FR-14 add `docs/skills/README.md:36`, `README.md`, and widening `evals.json` case 9 |

Corrections were swept forward (old values grepped across the spec folder: "seven", "five files", "~30", "design §11", "prohibition only", "EUR-Lex") and backward (referrers to the changed sections re-read).

## Round 1 result

Round 1 corrections applied in `05c5c85`.

## Round 2 — scoped re-judgment of `0263f82..05c5c85`

| Judge | Rows | Verdict |
|---|---|---|
| A | J-1…J-25, GA-1…GA-3: all resolved except J-2 partial and J-17 partial (acceptable: P-27 `UNVERIFIED` with fallback and owner) | APPROVE |
| B | All resolved except J-2 partial | NOT APPROVE (one trivial fix, R-B-1) |

| ID | Defect | Judges | Severity | Fix |
|---|---|---|---|---|
| R-1 | P-3 claimed "every hit dispositioned" but omitted `README.md:48` and `docs/skills/README.md:28,40,43` | R-A-1 warn, R-B-1 sev | **confirmed** | P-3 hit list completed and dispositioned (stay true); re-run at `05c5c85` |
| R-2 | design §1 Status said "fixes J-1…J-20" | R-A-2, R-B-2 | suggestion (both) | corrected |
| R-3 | requirements FR-4 phrase "inconsistent with prior consent" — Art. 5(3) does not use "prior" (P-12) | R-A-3 | suggestion | "inconsistent with the consent requirement under …" |

Round 2 corrections are text-only and match the judges' minimal fixes, verbatim in substance. Judge A's APPROVE stands. Judge B stated it "would approve once that row is corrected", and R-1 is that correction. No severe item remains, and no third round is permitted.

**JUDGMENT: APPROVED ✅**: round 2 of 2; confirmed severe in round 1: 5 (J-1…J-5), plus 5 single-judge severe settled by re-run (J-6…J-10); round 2: 1 confirmed (R-1), fixed; contradictions: 0.
