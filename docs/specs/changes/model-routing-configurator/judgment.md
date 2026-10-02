# Judgment Day — `changes/model-routing-configurator` design

| Field | Value |
|---|---|
| Target | `docs/specs/changes/model-routing-configurator/design.md` (immutable for round 1), context `requirements.md`, `proposal.md`; verified at `8eb0227` |
| Mode | judgment_day (blind dual review, read-only judges, author ≠ auditor: judges on `opus`, author on `fable`) |
| Round | 1 — findings merged 2026-10-01; **fix round 1 applied 2026-10-01** (user chose *Fix only*): C1–C15, S1–S3, W1–W17, U1–U5 and the suggestions applied to `design.md` (§5, §7, §8, §9, §10, §11 rewritten), `requirements.md` (FR-1, FR-2, FR-3, FR-4, FR-5, FR-6, FR-8, FR-10, NFR-2, NFR-3, §4, §8), `proposal.md` (one citation); **no re-judgment** |
| Judges | A (43 findings: 19 severe · 20 warning · 4 suggestion) · B (39 findings: 16 severe · 19 warning · 4 suggestion; 15 missing premises) |
| Skill resolution | `judgment-day` (packaged); references `_shared/review-ledger-contract.md` unavailable → ledger persisted here |
| State | **closed — ESCALATED** (fixes applied without a scoped re-judgment; the corrected design proceeds to Phase 3 on the user's decision) |

## Premise Ledger attack (both judges)

| Row | Judge A | Judge B | Merged |
|---|---|---|---|
| P-1…P-7, P-12…P-15 | CONFIRMED | CONFIRMED | confirmed |
| P-8 | CONTRADICTED (one other `\| Tier \|` table, not two; `:381-386` is `\| Role / Phase \|`) | PARTLY CONTRADICTED (same; plus an unmentioned T1/T3 table at `:295-298`) | **contradicted → severe (both)** |
| P-9 | CONFIRMED but incomplete — obligations at `:1356-1358`, `:1326`, `:23`, `:79-81`; confirm paragraph is `:606-614` | same | **incomplete → High per the row's own If-false (both)** |
| P-10 | CONTRADICTED — `README.md:428-441` is a `\| Command \| Purpose \|` table | CONTRADICTED — `README.md:432-441` | **contradicted → severe (both)** |
| P-11 | does not reproduce in full (`docs/cli.md:45,48,204,208` unlisted; flow table `:354-358`) | PARTLY CONTRADICTED (+ `docs/commands/akili-constitution.md:79-85` tenant table) | **does not reproduce → severe (both)** |
| P-16 | NOT RE-RUN (no upstream source in repo) | NOT RE-RUN; repo evidence weakens the singular `.opencode/agent/` default (`bin/akili.js:156`, `:331`, `:2048`) | stays `UNVERIFIED` |

Missing premises raised by both: Antigravity `model` domain (`inherit|flash|pro`) vs registry ids; shared `Fallback` column + cell grammar (Codex families, annotations); date source for `Updated:`/`updatedAt` in a pure `buildPlan`; fence regexes not exported from `persona.js`; `spawnSync` cannot drive the TTY wizard; packaged flags must make `opus` non-vision/non-long-context to reproduce defaults; CRLF; `--models` grammar ambiguity. Raised by B only: older installed CLI (`Unknown command`) as a third DD-6 branch; OpenCode JSON schema; TOML quoting; `project_doc_max_bytes`; update-check 1500 ms vs NFR-2.

## Frozen ledger — round 1

### Confirmed severe (both judges) → eligible for the fix actor

| ID | A / B | Finding | Fix direction (recorded for the fix actor; not applied) |
|---|---|---|---|
| C1 | JA-1 / JB-1 | §5.3 T2 rule inverted (`cost > T1.cost` matches nothing on opus/sonnet/haiku → T2 = opus, T3 = sonnet) — contradicts FR-3 scenario | Replace rank/cost heuristics with per-model **tier-fit flags** in the packaged roster (`tiers: [...]`); derive = best-ranked roster model fit for the tier; T3 = next fit ≠ T2; tie-break = roster order |
| C2 | JA-2 / JB-2 | §5.3 T4/T6 min-rank cannot reproduce the packaged default (`sonnet`) with truthful flags; Antigravity default also irreproducible | Same fix as C1; test asserts `derive(full packaged roster) == tierDefaults` per host |
| C3 | JA-3 / JB-3 | Unselected host column reset to packaged defaults — FR-4 requires keeping a previously filled column | `mapping` may hold hosts ∉ `hosts[]`; policy `keep-previous-else-packaged` |
| C4 | JA-4 / JB-8 | Antigravity wrapper `model` must be `inherit\|flash\|pro`; design copies registry ids | Roster entry carries `wrapperModel`; Step 8E's Leader `pro` example is superseded by the mapping (documented in the FR-8 sweep) |
| C5 | JA-5 + JA-6 / JB-9 | `tierDefaults` "= doc cell" and the drift test are undefined for Codex family cells, annotated cells, and the single shared `Fallback` column | Define the **cell grammar** (backticked id · family word · placeholder); drift test over main columns only; Fallback rendered per host as `` `id` (host) `` list |
| C6 | JA-7 / JB-10 | Step 8C Safe Update obligations dropped: fenced body overwritten (hand edits lost), no stale flagging, section text tells users to hand-edit the table | Provenance check: state (a) with body ≠ render(previous answers) → refuse without `--force`, show diff; section text says "regenerate with `akili routing`"; stale lines in summary |
| C7 | JA-8 / JB-4 | Step 8E opt-in ("Ask the user first … if declined, skip") dropped; proposal says the no-wrapper path survives | Wizard question + `--wrappers yes\|no` |
| C8 | JA-9 / JB-12 | CLI-invocation row rendered from packaged constants; Step 8C says ask the user, placeholder the rest | Per selected host: prompt with packaged suggestion / `--cli host=binary`; unselected → `<CONFIRM>` |
| C9 | JA-10 / JB-11 | Step 8C obligations missing from §5.4: "ask about both", rate-limits sentence, frontier pin re-justification, alias-first "record why" | Add rows: dated id → reason prompt (`roster[].reason`), rendered; fixed prose for rate limits + pin re-justification; "ask about both" = the host question + placeholders |
| C10 | JA-12 / JB-7 | FR-5 `model drift` line and Step 8E Rule 4 infeasible — snapshot has no wrapper contents | `existingFiles: Map<relPath, content>` |
| C11 | JA-13 + JA-15 / JB-5 (+ JB-6) | Rule 1 MUST turned into "proceed, recorded"; cross-host T3 unrepresented; `--yes` cannot carry the chat decision back | Host where author ≠ auditor cannot hold → **no wrappers for that host** (registry still written, note rendered); options: add model / `--t3-cross-host host=other` / skip wrappers; `--yes` exits 0 with the skip line |
| C12 | JA-16 / JB-13 | P-10 contradicted; `README.md:428-441` command table is a consumer; FR-9 README clause uncovered | Add to §8 and T6 |
| C13 | JA-18 / JB §A | P-8 contradicted (one other `\| Tier \|` table) | Correct row; anchor rule unchanged |
| C14 | JA-19 / JB-32 + §A | P-11 does not reproduce (unlisted hits; flow rows `:356-358`; mirror table `docs/commands/akili-constitution.md:79-85`) | Correct row; add mirror consumer |
| C15 | JA-20 / JB-14 | P-9 incomplete — checklist `:1356-1358`, Step 9 `:1326`, `:23`, `:79-81` outside the sweep ranges; confirm paragraph `:606-614` | Extend ranges; T5 sweep covers them |

### Severity split (both found it; one rated severe) → confirmed findings, fix with the user's consent

| ID | A / B | Finding | Fix direction |
|---|---|---|---|
| S1 | JA-11 sev / JB-17 warn | Cursor `[effort=high]` written without the `<CONFIRM>`-highest-rung obligation; pinned template has a space | Roster `effortRungs` list or null; null → **omit the bracket and report** (a `<CONFIRM>` inside a frontmatter value would break the wrapper) |
| S2 | JA-17 sev / JB-27 warn | NFR-7 uncovered — no `Last verified` + URL in the design | §5.5 gains a Pin column |
| S3 | JA-27 warn / JB-15 sev | Date source undefined in a pure `buildPlan`; `Updated:` across a month boundary breaks idempotence | `buildPlan(..., now)`; `Updated:` = month of the last answers change (from previous answers when unchanged) |

### Suspect (one judge) → recorded, not auto-fixed

| ID | Judge | Finding | Note |
|---|---|---|---|
| U1 | JA-14 | Step 9 data (files written/skipped, placeholder counts) not in the answers file | Proposed: `--json` prints the plan result to stdout; the constitution reads stdout, the answers file stays idempotent |
| U2 | JB-16 | Older installed CLI → `Unknown command` is a third DD-6 branch | Constitution probes `akili routing --help`; failure → fallback |
| U3 | JB-31 | `docs/commands/akili-audit.md` mirror has no Model Registry Drift clause → cited consumer absent | Verify; drop from §8 if absent |
| U4 | JA-35 | `ensureDirectory` prints one `would create dir` per directory → NFR-6 breached in dry-run | Aggregate dir creation lines |
| U5 | JB-38 | Budget 14 rounds sits below the precedent's actual 18/16 | Re-size at Step 2.4 after fixes |

### Both-confirmed warnings → `info` (fix with the user's consent in the same round)

| ID | A / B | Finding | Fix direction |
|---|---|---|---|
| W1 | JA-22 / MP-10 | `--models` grammar ambiguous (`@T1,T3` vs next id); ids with `@`; repeated flag per host | Tier list joined with `+`: `id@T1+T3`; last `--models` for a host wins; `@` reserved |
| W2 | JA-23 / JB-21 | Derivation edge cases: ties, user ids without cost, roster of only user ids, wrong `single-model roster` note, T6 note naming a selected host | Tier-fit flags + roster-order tie-break; notes recomputed from the final mapping |
| W3 | JA-25 / JB-20 | Tester would land on `haiku`; Step 8E default is `sonnet` | Tester = T2 primary; prefer a same-tier alternative only when one exists |
| W4 | JA-28 / JB-23 | Summary tokens inconsistent across FR-1/FR-4/FR-5/§5.6; missing states (malformed fence, fenced + unfenced) | One token vocabulary in §5.6; states (e) malformed fence → refuse, (f) both → treat as (a) and report the stray heading |
| W5 | JA-29 / JB-24 | `--force` overloaded (adopt unfenced + overwrite wrappers) | Separate `--adopt` |
| W6 | JA-30 / JB-25 | FR-1 "no TTY and no `--hosts` → usage error" contradicts FR-6 `--yes` re-run | FR-1 amended: usage error only when no flags **and** no answers file |
| W7 | JA-31 / JB-35 | Enumerations incomplete (`shape`, `effortField`, wrapper actions, `authorAuditor`) | Complete the sets |
| W8 | JA-32 / JB-19 | OpenCode `json` merge unspecified (location, JSONC, body) | **Drop `json` mode from v1**; `.opencode/agent/` dir with `--opencode-agent-dir` override; `opencode.json` form stays in the Step 8E fallback |
| W9 | JA-33 / JB-18 | OpenCode restriction "never" vs Step 8E "confirm, else omit" | Documented v1 limit under Rule 2 (omit + report); confirmed-shape path remains the manual fallback |
| W10 | JA-34 / JB-28 | DD-10 misquotes Step 8C (`agy models` is a confirmation command; "ask, don't probe" is about invocations) | Rewrite DD-10; add Antigravity dial→ID map and Codex plan-gating note rows |
| W11 | JA-36 / JB-26 | Interactive path has no automated gate (spawnSync stdin is a pipe) | Prompt seam: `collectAnswers(args, previous, registry, io)` with an injectable `ask`; unit tests script answers; TTY e2e stays manual in FR-11 (recorded) |
| W12 | JA-37 / JB-30 | "drift test ties the section template to the doc" unbacked | Remove the claim |
| W13 | JA-21 / MP-7 | Fence regexes not exported from `persona.js` | Export the two regexes (additive one-liner) and import them |
| W14 | JA-38 / MP-8 | CRLF: `SECTION_OPEN_RE` anchored `$` fails on `\r` | Normalize EOL for detection as `persona.js:92-95,177` does; re-emit with the file's EOL |
| W15 | JA-41 / JB-39 | FR-10 names `verify:cli` as showing help; it runs `list` | FR-10 amended: `akili help` carries the new line; `verify:cli` unchanged |
| W16 | JA-43 / JB-34 | The `awk '/T1 Architect/,/T6 Multimodal/'` citation in `requirements.md` §4 and `proposal.md` yields 12/1/3, not 8/1/1 (range reopens at `:297`) | Re-cite with `sed -n 120,125p` (per-column count 1/1/2/6 = 10 holds) |
| W17 | JA-26 / JB-21 | T6 cross-host note when Antigravity is selected or is the host | Note derived from the final mapping; names a host only when it is not the current one |

### Suggestions (info)

JA-39 DD-2/DD-9 rationale names the wrong file (`readConstitutionPins` is in `akili.js`) · JA-40 `updatedAt` wording "every" → "any" · JA-42 hints (Antigravity `/agents` note; TOML `"""`) · JB-36 "§9" → "§10" · JB-37 `default:` still reached · JA-24 derived fallbacks ≠ doc fallbacks (resolved by C5/C1).

## Counts contrast (merged)

| Quantity | Design | Source | Verdict |
|---|---|---|---|
| Ledger rows 16 — 15 verified / 1 UNVERIFIED | — | 11–12 confirmed, 3 contradicted or not reproducing (P-8, P-10, P-11), 1 incomplete (P-9), 1 not re-run | **"15 verified" overstated** |
| 7 tasks / ~1,300 LOC / 14 rounds | proposal ~400–600 LOC + tests; Cursor precedent 8 / 700 / 16 budgeted, 18 consumed | arithmetic holds | re-size after fixes (U5) |
| 10 of 30 placeholder cells | `sed -n 120,125p` per column 1/1/2/6 | **total holds; quoted command wrong (W16)** |
| 7 columns · 20 wrapper files · five hosts · Step 8C items 1–6 · Rules 1–4 | source | hold | — |
| Other `\| Tier \|` tables: 2 | 1 | **contradicted (C13)** |

## Verdict — round 1

Both judges, independently: **not sound as written** — the derivation core (§5.3) is inverted against FR-3, two FR clauses are contradicted (FR-4 unselected columns, FR-5 drift), seven Step 8C/8E obligations are dropped or altered, and three ledger rows fail at their source. All confirmed items have a recorded fix direction above; none exceeds the spec's scope.

## Fix round 1 — what changed (not re-judged)

| Group | Resolution |
|---|---|
| C1, C2, W2, W17 | §5.3 rewritten: preference-list intersection (no ranks/flags); `derive(full roster) == tierDefaults` by construction; notes from the final mapping |
| C3 | `mapping` keeps hosts ∉ `hosts[]`; policy `keep-previous-else-packaged` |
| C4 | `wrapperModel` per Antigravity roster entry; Step 8E example defaults marked *from the mapping* (T6) |
| C5, W12 | cell grammar defined; drift test over the five host columns, header-anchored; template prose recorded as an unguarded gap |
| C6 | provenance check (state a′), stale reporting, item 5 re-worded |
| C7 | `--wrappers yes\|no` + wizard question |
| C8 | `--cli host=binary` / prompt; unconfirmed → `<CONFIRM>` |
| C9, W10 | §5.4 rows for ask-about-both, rate limits, frontier pin, dated-id reason, Antigravity dial map, Codex plan gating |
| C10 | snapshot `existingFiles: Map<relPath, content>` |
| C11 | unsatisfiable host → registry yes, wrappers no; `--t3-cross-host`; `--yes` exits 0 with the skip token |
| C12–C15 | P-8, P-9, P-10, P-11 corrected; README table, mirror tenant table, checklist `:1356-1358`, Step 9 `:1326` added to §8 |
| S1 | Cursor bracket only for a confirmed rung, else omitted + reported |
| S2 | §5.5 Pin column (URLs + `Last verified`; constitution line ranges where no URL exists) |
| S3, W6 | `buildPlan(..., now)`; `Updated:` = month of `updatedAt`; non-TTY usage error only when answers remain incomplete after flags + previous answers |
| U1 | `--json` plan result on stdout; the constitution reads it (answers file stays idempotent) |
| U2 | DD-6 names the older-CLI branch |
| U3 | audit mirror verified absent; removed from §8 (P-24) |
| U4 | aggregated directory lines in `applyPlan` |
| U5 | budget re-sized: 8 tasks · ~1,550 LOC · 18 rounds |
| W1 | `--models` tier list joined with `+`; `@` reserved; last flag per host wins |
| W3 | Tester = T2 primary (Step 8E default), collapse noted |
| W4, W7 | one token vocabulary; enumerations completed (`shape`, `effortField`, `authorAuditor`, states (e)/(f)) |
| W5 | `--adopt` split from `--force` |
| W8, W9 | OpenCode `json` mode dropped from v1; restriction omission documented under Rule 2 |
| W11 | `collectAnswers(..., io)` seam; TTY e2e manual in FR-11 |
| W13 | the two regexes exported from `persona.js` |
| W14 | CRLF detection as `persona.js:92-95,177` |
| W15 | FR-10 wording (`akili help`, not `verify:cli`) |
| W16 | proposal + requirements citation re-run with `sed -n 120,125p` |
| JA-39, JA-40, JA-42, JB-36, JB-37 | rationale, wording, hints, cross-reference fixed |

`JUDGMENT: ESCALATED ⚠️` — round 1 findings fixed by the author; not independently re-judged (user decision: *Fix only*). `/akili-validate` and the `/akili-execute` Reviewers are the next independent checks.
