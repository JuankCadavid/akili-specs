# Judgment Day: changes/docs-overview design

| Field | Value |
|---|---|
| Target | `requirements.md` + `design.md` at `f54efaf` (intent: `proposal.md`) |
| Mode | judgment_day, blind dual review; two read-only judges on `sonnet` (author ≠ auditor: the design was authored on Opus) |
| Round 1 | Judge A (12 findings: 2 severe, 9 warning, 1 suggestion) · Judge B (15 findings: 3 severe, 11 warning, 1 suggestion). Both: **FIX-REQUIRED** |
| Correction | Round 1 fix applied by the architect at `<fix commit>`. The confirmed findings are single-answer factual corrections, logged, not gated (user feedback rule: a factual correction is applied and logged; a stop is owed only when scope, design or risk changes, and none did). The warnings that both judges agreed on were folded in as design strengthening, inside the approved scope |
| Status | Round 1 closed; scoped re-judgment pending |

## Frozen ledger (round 1)

| ID | Finding | A | B | Class | Disposition |
|---|---|---|---|---|---|
| JD-1 | P-11 figure citation `:45-47` does not reproduce; the figure is at `:48-50` | J-1 severe | F-01 severe | **confirmed severe** | Fixed: P-11, requirements §4 |
| JD-2 | Heading split "26 `##` / 17 `###`" is wrong: 25 / 18 (total 43 holds; 26 is the raw count including the fenced `:698`) | J-2 severe | F-04 warning | **confirmed** | Fixed: requirements §4, proposal row 1 and T1 budget row |
| JD-3 | `#grok-bot-grokbot` is a dead anchor; the heading slugs to `grok-bot---tool-grokbot`. Existing links in `docs/cli.md` and README are already dead | J-7 warning | F-02 severe | **confirmed** | Fixed: FR-11 link, FR-17 bullet (fix cli.md links), P-14 (UNVERIFIED, owner T8 + PR preview) |
| JD-4 | Test (i) strips anchors, so FR-6's "anchor resolves" and the Grok link are untested | J-7 | F-03 severe | **confirmed** | Fixed: (i) slug-aware (DD-12) |
| JD-5 | The existing alt text ("Kaizen retrospective", "Bug Track") trips FR-10 if kept | J-5 warning | F-07 warning | confirmed (warning) | Fixed: FR-4 requires a new plain alt text; DD-11; P-16 |
| JD-6 | FR-10 and DD-5/`proseOf` disagree on inline code; the "`](` anywhere on the line" rule is a false pass | J-6 warning | F-09 warning | confirmed (warning) | Fixed: FR-10 states both prose scopes; (g) requires the term inside a link text |
| JD-7 | Countable clauses have no assertion (3 badges, 5 bullets, 4 glossary rows, figure, Learn more order, hub, routing line, Grok routing cell, no `doctor --tool`) | J-8 warning | F-10 warning | confirmed (warning) | Fixed: new clause (j); (h) widened; uncountable ones are Reviewer-gated in the defect table |
| JD-8 | The count regex misses `12 command skills` (`docs/cli.md:125, 225`); the file set omits `CONTRIBUTING.md` | J-4 warning | F-11 warning | confirmed (warning) | Fixed: (d) regex and set; P-7 re-run → 9 hits |
| JD-9 | P-9 "8 files" does not reproduce: marketing modifies 12 existing files, 7 of which this spec edits | J-3 warning | F-14 warning | confirmed (warning) | Fixed: P-9, proposal; T1 re-runs counts and line numbers after the rebase |
| JD-10 | Task numbering and cross-references are inconsistent (proposal vs design; "§13"; "§2") | J-10 warning | F-12 warning | confirmed (warning) | Fixed: one task map in design §2; references corrected |
| JD-11 | The budget arithmetic does not add up (~14 per-task rounds vs ~24 stated) | J-11 warning | F-12 warning | confirmed (warning) | Fixed: per-task 18 + 2 margin = 20, tripwire 26; proposal note |
| JD-12 | P-6 line numbers off by one (`ALL_TOOLS` is at `:517`) | — | F-05 warning | suspect → verified by the architect (`grep -n "ALL_TOOLS = " bin/akili.js` → 517) | Fixed: P-6, proposal D6 |
| JD-13 | `.claude/skills/diagram-design/SKILL.md:76` says Archify is "documented in the project README"; P-2 scope missed `.claude` | — | F-06 warning | suspect → verified (`sed -n 76p`) | Recorded: P-2 widened; accepted Low risk (NFR-3 forbids `.claude` edits); `/akili-quick` follow-up |
| JD-14 | Plain wording for `/akili-audit` ("drift"), `doctor --agents` ("Persona Drift"), `routing` ("model routing") rows is unspecified while §7 said "never extended" | J-6 note | F-08 warning | confirmed (warning) | Fixed: §7 table of plain rows; banned terms paraphrased |
| JD-15 | FR-15 BUT ("only the file and site name") conflicts with the §9 structural changes | — | F-13 warning | suspect, accepted on reading | Fixed: FR-15 AND IT MUST lists S1/S2/S3 |
| JD-16 | Overview security lines must satisfy every security-docs guard | J-12 suggestion | — | info | Folded into §8 as a constraint |
| JD-17 | FR-3 / §7 marketing wording is optional although D2 fixes the order | J-9 warning | — | suspect, accepted | Fixed: FR-3 AND IT MUST names marketing |
| JD-18 | CHANGELOG `[Unreleased]` holds a placeholder; requirements quote Spanish in an English spec | — | F-15 suggestion | info | Fixed: FR-17 wording, P-15; the quote is marked verbatim and translated |

Contradictions between the judges: none (they differ only in severity on JD-2, JD-3 and JD-4).

## Premise rows the judges re-ran and confirmed

Both judges reproduced P-1, P-3, P-4, P-5 (bindings and 7+9+6+1+4), P-8 (`pass 74, fail 0`), P-10 and P-12; the 13-badge count; the README `:73-83`, `:527-552`, `:762-795` and `:813` citations; the 192-line section sum; and the DD-1 intermediate-commit greenness. Neither judge could refute P-13 (no network).
