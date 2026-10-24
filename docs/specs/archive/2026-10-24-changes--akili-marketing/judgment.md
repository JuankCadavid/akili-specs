# Judgment Day — `changes/akili-marketing` design

| Field | Value |
|---|---|
| Target | `design.md` + `requirements.md` + `proposal.md` @ `dc4e2e1` (immutable) |
| Judges | A and B — blind, read-only, parallel, model `sonnet` (author: `opus` — author ≠ auditor) |
| Round 1 verdicts | A: CHANGES REQUIRED (26 rows) · B: CHANGES REQUIRED (20 rows) |
| Fix authority | User mandate 2026-10-23 ("design con judgment-day y tasks"; stop only after `tasks.md`). Every confirmed severe finding is a single-answer factual or coverage correction with no scope, risk or approach change, so it was applied and logged without a stop (standing user feedback: factual corrections need no gate) |
| Fix delta | Round-1 fix commit (see `git log -- docs/specs/changes/akili-marketing/`) |

## Frozen ledger (merged)

`Both` = reported by both judges. Severity is the higher of the two; per protocol only a severe finding confirmed by both is auto-fixed, and other rows are `info`. Rows marked *fixed (architect)* were settled by the architect with one re-run or are coverage gaps against an approved requirement.

| J | A / B | Severity | Finding | Disposition |
|---|---|---|---|---|
| J-1 | A-1 / B-1 | **severe (both)** | `test/diagram-design.test.js:416` pins `27 packaged skills` in `docs/cli.md` — a consumer missing from P-6/P-7/§4 | **Fixed**: P-6, P-7, §4, requirements §4, FR-12 |
| J-2 | A-3 / B-2 | **severe (both)** | P-4's `grep -rln "LinkedIn\|Instagram" .claude/commands .claude/skills` returns `ui-ux-pro-max/data/products.csv`, not "none" | **Fixed**: P-4, requirements §4, proposal *Problem* |
| J-3 | A-6 / B-8 | **severe (both)** | The approval card omitted Hashtags, CTA and Alt text, which are posted, and the reset set did not match the card | **Fixed**: §5.4 *Card fields* (= reset set), §5.5, FR-7 table |
| J-4 | A-4 / B-3 | severe (A) / warning (B) — confirmed by both | `/akili-constitution` reads product docs under `docs/` (`akili-constitution.md:99`); P-4/DD-7 claimed no reader | **Fixed**: new P-16 (`shared-state`), §9, DD-7, requirements §4 — the read is accepted |
| J-5 | A-5 / B-12 | severe (A) / warning (B) — confirmed by both | FR-9's host match, no-fetch rule and draft refusal were missing from the design; lookalike hosts were unspecified | **Fixed**: §5.6, §5.4 `draft` row, FR-9 (https, dot-bounded host, user-supplied URL, correction path, lookalike scenario) |
| J-6 | A-2 | severe (A only) — suspect | The live-path row omitted Grok Bot (`--tool all` excludes it) and the dispatch chain | **Fixed (architect, one re-run)**: `install --tool grokbot --target $SCRATCH/gb` executed → both files present; P-1 rewritten with the chain |
| J-7 | A-7 | warning | Calendar vs §5.4 for unrecognized status | Fixed: §5.4 last row, FR-7 table |
| J-8 | A-8 / B-10 | warning (both) | FR-3 `Voice:` line in every artifact | Fixed: §5.2, FR-3 |
| J-9 | A-9 / B-11 | warning (both) | FR-4 existing-folder rule, plan approval by the user, `post` precondition, file-name collision | Fixed: §3, §5.2, §5.3, FR-4, FR-6 |
| J-10 | A-10 / B-15 | warning (both) | Month-view calendar undefined; argument precedence; no-arg; missing file; timezone fallback | Fixed: §5.2, FR-5 |
| J-11 | A-11 / B-18 | warning (both) | `review` had no model tier | Fixed: §7.1 (T3 Auditor) |
| J-12 | A-12 / B-14 | warning (both) | Invariants lacked no-git/no-source; fetch policy; repurpose source untrusted | Fixed: §3, §7.1, FR-2, FR-10 |
| J-13 | A-13 | warning | `--published` URL provenance and correction path | Fixed: §5.6, FR-9 |
| J-14 | A-14 / B-6 | warning (both) | P-11 mixed bases; command unstated | Fixed: P-11 (one basis, command quoted), DD-2 |
| J-15 | A-15 | warning | Third-party basis of upstream humanizers (Wikipedia CC BY-SA) unchecked | Fixed: new P-17 (`UNVERIFIED`, owner T1), §7.2 `humanizer.md` row |
| J-16 | A-16 | warning | *Publishing notes* = unverified facts + publishing vocabulary in a never-publish skill | Fixed: dropped (§7.2); proposal item 4 annotated *superseded* |
| J-17 | A-17 / B-5 | warning (both) | `lib/approval.py:28` → `:27`; API vs native-app limits; LinkedIn 3,000 only in dropped Python | Fixed: P-13, DD-10 |
| J-18 | A-18 / B-7 | warning (both) | Header *Verified at* vs rows; P-3 not executed; P-15 `If false` empty and fails dependence test | Fixed: §1 header, P-3 marked read-only, P-15 removed |
| J-19 | A-19 / B-16 | warning (both) | Budget cited a non-existent `tasks.md`; test LOC not per clause | Fixed: §11 (per-clause arithmetic, ~2,600 LOC, tripwire ~3,100) |
| J-20 | A-20 / B-4 | warning (both) | Enumerating sites missing (`docs/flow.md:157, 294, 466-470`, `assets/akili-flow.svg`, `README.md:65`) | Fixed: P-8 widened, §9.1 per-site table, DD-12 |
| J-21 | A-21 / B-9 | warning (both) | Approval bound to no content fingerprint; forged/malformed record accepted | Fixed: Approved snapshot (§5.3, §5.4, DD-5); residual prompt-level risk stated |
| J-22 | A-22 | suggestion | Slot change / file collision | Fixed: §5.3 |
| J-23 | A-23 / B-18 | suggestion (both) | Proposal R7 git-ignore note unrealized; quote length | Fixed: §7.1, FR-2, §5.3 (≤ 200 chars) |
| J-24 | A-24 | suggestion | `224+N` left open | Fixed: §4 actual numbers |
| J-25 | A-25 | suggestion | Governance *size justified* has no home | Fixed: FR-12 (skill page) |
| J-26 | A-26 | suggestion | CRLF normalization in new tests | Fixed: DD-14 |
| J-27 | B-13 | warning (B only) | Skill loadable without the command carries no gate text | Fixed: FR-1 standalone line, §7.2, DD-14 restatement test |
| J-28 | B-17 | suggestion | Provenance check offered to run the installer / continue with a foreign copy | Fixed: §7.3 (stop; user runs the installer) |
| J-29 | B-19 | suggestion | One `LICENSE` justified only by identical notices | Fixed: P-18, DD-16 |
| J-30 | B-20 | suggestion | KZ-changes--archify-diagrams-1: no shipped file references the active spec path | Fixed: FR-12, DD-14 |

No contradiction between the judges.

## Round 1 — scoped re-judgment (fix delta `dc4e2e1..06d71a3`)

| Judge | Verdict | Severe rows | Notes |
|---|---|---|---|
| A | **APPROVE** | J-1…J-5 resolved; J-6 partially (wrong `:204` cite) | RA-1…RA-9 (0 severe) |
| B | **APPROVE** | J-1…J-6 resolved (J-6 cite RB-1) | RB-1…RB-10 (0 severe) |

Both judges found J-17 and J-19 partially resolved (wording, not substance); no fix-caused severe defect. Info rows applied as cleanup, no further round:

| Row(s) | Fix |
|---|---|
| RA-1 / RB-1 | P-1 cites `commandsAsSkills` at `bin/akili.js:183, 191, 202, 216` (Antigravity added) |
| RA-2 / RB-2 | P-13 quotes the full LinkedIn `3,?000` grep result (11 hits, 7 files, none adapted) |
| RA-3 / RB-3 | §11 clause basis re-run: 30 THEN/BUT/AND lines at `06d71a3` + 1 added scenario + 5 = ≈ 37 clauses × ~14 lines (estimate unchanged) |
| RA-5 / RB-6 | §5.4 orphan table header removed |
| RB-4 | Glossary *Approval card* lists every card field |
| RB-5 | `repurpose` refuses on an unapproved plan (§3) |
| RA-4 | §5.4: writing modes record the read-time reset; calendar shows `approved — invalid`; FR-5 flag |
| RA-6 | §2 test-edit count matches §4 |
| RA-7 | `post --revise` named as the only in-place edit (FR-6, FR-10, §3) |
| RA-8 / RB-10 | FR-9 host list keyed to the named platform |
| RA-9 / RB-9 | Plan approval resets on edit (FR-4, §5.2) |
| RB-7 | §1 header names P-1's not-re-run half and the `UNVERIFIED` rows |
| RB-8 | Calendar argument precedence stays in FR-5; the design does not restate it — no change |

**JUDGMENT: APPROVED ✅** — round 1 of 2, terminal state `approved`.
