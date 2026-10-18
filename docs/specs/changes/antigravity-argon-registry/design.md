# Design: Antigravity registry refresh — Gemini 4 Argon

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/antigravity-argon-registry` |
| Depth | Lite (re-checked in §11 — Budget) |
| Approval Mode | `gated` |
| Status | **Approved** — 2026-10-18 (Juan Carlos via Methodology agent, Phase 2 gate: Continue; judgment-day not run) |
| Date | 2026-10-18 |
| Requirements | `requirements.md` (approved 2026-10-18, `b8289f6`) |
| Verified at | `b8289f6` |
| Deviations from proposal | **Scope widened by a phrase-family sweep** (KZ-changes--kaizen-loop-closure-2): four rules/doc sites outside the proposal's list state "Gemini 3.1 Pro as the T3 auditor" or "Reviewer `pro`" (P-7). `bin/routing.js` is **not** edited — the existing skip path already meets FR-3 (P-5) |

## 2. Executive Summary

This is a data and docs change; no runtime code changes. The JSON roster and the doc table move together so the drift test stays the gate. Argon entries carry no `wrapperModel`, so the existing skip path in `renderWrapper` handles Leader and Reviewer. The design replaces the enforcement it gives up with a documented mitigation (DD-3), and records how to reopen FR-3 if `pro` is later shown to run Argon (DD-4).

## 3. Architecture Overview

No change to `bin/routing.js`, `bin/akili.js` or the installer. The data flows as today: `model-registry.json` → `deriveTiers` → `renderWrapper` / `renderSection` → the project's `AGENTS.md` and `.agents/agents/`.

## 4. Extended Directory Structure — edit sites

| File | Sites | FR |
|---|---|---|
| `.claude/templates/model-registry.json` | `hosts.antigravity`: `models[]`, `tierPreference.T1/T3`, `lastVerified` | FR-1, FR-2, FR-4 |
| `docs/model-routing.md` | `:104` *Registry updated*; table `:123` (T1), `:125` (T3 + Fallback); pin `:135`; *Antigravity* paragraph `:237-245`; wrapper value row `:522` | FR-2, FR-3, FR-4 |
| `.claude/templates/model-routing.section.md` | `:48` "Gemini 3.1 Pro as the T3 auditor" | FR-4 |
| `.claude/commands/akili-constitution.md` | `:582` (Step 8C Antigravity column wording); `:855` (Step 8E `model` row: "on the packaged roster: Reviewer `pro`…") | FR-3, FR-4 |
| `docs/commands/akili-constitution.md` | `:94` "**Gemini 3.1 Pro** as the T3 auditor" | FR-4 |
| `docs/cli.md` | `:448` "`model: flash` or `pro`" — add the Argon skip note | FR-3 |
| `test/routing.test.js` | `:297`, `:337`, `:700-701`, `:1439-1458`, `buildPlan (i)` `:1467-1482` | FR-5 |
| `CHANGELOG.md` | `Unreleased` | NFR-2 |

Untouched on purpose: `releases/*.md` and dated CHANGELOG entries (history); `docs/specs/archive/**`.

## 5. Data Model — `hosts.antigravity` after the change

| Field | Value |
|---|---|
| `lastVerified` | `2026-10-18` |
| `models[]` (Q3: routed ids only, in this order) | `gemini-4-argon-high` (label `Gemini 4 Argon (High)`, no `wrapperModel`, `effortRungs: ["high"]`); `gemini-3.8-flash-high` / `-medium` / `-low` (unchanged, `wrapperModel: "flash"`); `claude-sonnet-5-5-high` (label `Claude Sonnet 5.5 (High)`, no `wrapperModel`, `effortRungs: ["high"]`). All are `alias: false`, `dated: false` |
| `tierPreference` | T1 `[gemini-4-argon-high]`; T2 unchanged; T3 `[gemini-4-argon-high, claude-sonnet-5-5-high]`; T4, T5, T6 unchanged |
| `notes` | T3 `*(≠ T2 family)*` kept; T6 unchanged |

Doc cells: T1 `Gemini 4 Argon (High) — \`gemini-4-argon-high\``; T3 `Gemini 4 Argon (High) — \`gemini-4-argon-high\` *(≠ T2 family)*`; T3 Fallback `\`claude-sonnet-5-5-high\` on Antigravity where exposed / \`sonnet\``. The drift test checks that each T3 entry appears in a cell: the head in the Antigravity cell, the second in the Fallback cell.

## 6. API Design

n/a — the CLI surface is unchanged. On the packaged roster, `akili routing` output changes only in its Antigravity report: two `no wrapper — \`gemini-4-argon-high\` has no Antigravity wrapper model (flash | pro)` lines (Leader, Reviewer), and the Reviewer wrapper is no longer written.

## 7. Backend Module Design

No edit. `renderWrapper`'s `agy-yaml` branch already returns `skipText` for an entry without `wrapperModel` (`bin/routing.js:649`). `deriveTiers` compares author and auditor through `boundModel`, which falls back to the id when there is no `wrapperModel` (`:176-178`). So T3 `gemini-4-argon-high` ≠ T2 `flash`, and the result is `ok`.

## 8. Frontend / UX

n/a.

## 9. Shared Contracts

`model-routing.section.md` is rendered into every project's `AGENTS.md`. Only literal text changes (`:48`); its `{{placeholder}}` set is unchanged, and the drift test's placeholder check still applies.

## 10. Design Decisions

| DD | Decision | Why / rejected |
|---|---|---|
| DD-1 | Edit data and docs only; leave `bin/routing.js` alone | The skip path already meets FR-3 (P-5). Rejected: editing the skip text to name `inherit`. That is true, but cosmetic, and it would add a code change and a test change |
| DD-2 | Argon entries carry **no** `wrapperModel` | C-Q1: the loader rejects every Argon spelling as a tier (P-3); which model `pro` runs on is unknown (P-4). Rejected: `wrapperModel: "pro"`, which would make the wrapper run an unconfirmed model while the registry says Argon (user decision Q1) |
| DD-3 | **Reversion mitigation:** the doc states that on Antigravity, author ≠ auditor holds when the **session runs on `gemini-4-argon-high`** (T1). An unwrapped Reviewer is a generic subagent that inherits the session model (`docs/model-routing.md:512-514`), so it runs on Argon ≠ the `flash` Implementer. The Reviewer's `tools` read-only restriction is not applied; the Reviewer is read-only by instruction, the same fallback the doc already gives when tool names are unconfirmed (`:542-544`) | Step 2.3 challenge, below |
| DD-4 | **Reopen path, recorded:** if Juan Carlos confirms live that a `model: pro` subagent runs on Gemini 4 Argon, FR-3 may be reopened (Pivot / new quick change) to set `wrapperModel: "pro"` on `gemini-4-argon-high`. That restores the Leader and Reviewer wrappers and the `tools` restriction. The `docs/model-routing.md` *Antigravity* paragraph carries one sentence saying so | User instruction at the Phase 1 gate |
| DD-5 | `models[]` order: Argon first, then Flash, then the Claude fallback | Matches roster order; harmless for derivation (tiers come from `tierPreference`) |
| DD-6 | Rebase tests by role, not by name: a test that needed "an id bound to a distinct wrapper value" uses `gemini-4-argon-high` (bound = its id); a test that needed "an id with no `wrapperModel`" uses `claude-sonnet-5-5-high`; `buildPlan (i)` expects the Antigravity Reviewer token `skipped`-with-report instead of `created` | FR-5. Each rebased test keeps its asserted outcome except `(i)`'s Antigravity row, which FR-3 changes on purpose |

**Step 2.3 reversion challenge — DD-2/DD-3.** This reverts behavior that already ships: today the packaged roster writes an Antigravity Reviewer wrapper with `model: pro` and, when tool names are confirmed, a `tools` restriction (`test/routing.test.js` `buildPlan (i)` pins it). *What does removing it break?*
1. **author ≠ auditor enforcement.** A generic Reviewer inherits the session model. If the session runs on Flash, the Reviewer and the `flash` Implementer share a model. → Addressed by DD-3: the doc names the session model (Argon, T1) that keeps the pair distinct, and the skip report already tells the user which roles are unwrapped.
2. **Structural read-only.** `tools` cannot be applied without a wrapper. → Accepted; this reuses the doc's existing fallback (read-only by instruction). DD-4 is the route back.
3. **`--antigravity-tools` question.** It is still asked when Antigravity is selected but has no wrapper to apply to on the packaged roster. → Low; it still applies if the user routes T3 to a `flash`/`pro`-bound id. No change.

## 11. Budget (Step 2.4 tripwire)

| Measure | Estimate |
|---|---|
| Tasks | 3 |
| LOC | ~90 (JSON ~15, doc table and prose ~35, rules/docs sites ~15, tests ~20, CHANGELOG ~5) |
| Review rounds | 5 (T1 data+doc: 1; T2 rules text: 2; T3 tests+CHANGELOG: 2) |

Sizing note: Lite usually means one task. This needs three because the rules-text sites need their own review (Step 3.2 split rule). That is above the usual Lite task count but well under Standard's scale, so Lite stays.

## 12. Premise Ledger

**Count:** 8 verified, 1 `UNVERIFIED` (1 Low, 0 High).
**Blast-radius triggers:** `consumer` fires (stored field `wrapperModel` / `models[]` read by `bin/routing.js`, tests, the section template); `shared-state` fires (`hosts.antigravity` is read by `deriveTiers`, `renderWrapper`, `renderSection`, `promptTierAdjust`); `live-path` fires (user action: `akili routing --hosts antigravity`).

| # | Claim | Class | Citation (as run) | Verified at | If false | Settled by |
|---|---|---|---|---|---|---|
| P-1 | The roster lists `gemini-4-argon-high` labelled `Gemini 4 Argon (High)` and `claude-sonnet-5-5-high` labelled `Claude Sonnet 5.5 (High)`, and lists neither `gemini-3.1-pro-high` nor `claude-sonnet-4-6` | data-env | `agy models` (agy 1.4.2, macOS), run 2026-10-18, exit 0, 13 lines | `43bc5d6` | FR-1/FR-2 values change — High | — |
| P-2 | A `model:` value in an `agent.md` is a tier, and `flash`, `pro`, `inherit` load | data-env | `agy plugin validate <scratch> --strict --json`: `"agents": 2` for {flash, pro, argon, gemini-4-argon-high, zzbogus}; `"agents": 1` for a 14-value set whose only loaded member is `inherit` | `b8289f6` | DD-2 reopens — High | — |
| P-3 | No Argon spelling is accepted as a tier | data-env | same command; `Invalid model tier` for `argon`, `gemini-4-argon-high`, `zzbogus` (run 1) and `Argon`, `gemini-4-argon`, `gemini-4`, `ultra`, `max`, `heavy`, `deep`, `frontier`, `opus`, `sonnet`, `claude`, `lite`, `flash-lite` (run 2). Negative claim: covers only these 16 spellings | `b8289f6` | DD-2 → set `wrapperModel` to the accepted value — High | — |
| P-4 | Which model a `model: pro` subagent runs on | data-env | `UNVERIFIED — confirm at source before relying on it` (live probe blocked by the session's permission classifier) | — | DD-4 applies; nothing in this spec changes — Low | Juan Carlos, live probe after this spec (DD-4) |
| P-5 | An Antigravity id without `wrapperModel` makes `renderWrapper` skip the role with `no wrapper — \`<id>\` has no Antigravity wrapper model (flash \| pro)`, reported per role | live-path | `bin/routing.js:646-650` (`agy-yaml` branch), report push `:808`; chain: `akili routing` → `buildPlan` → `renderWrapper` | `b8289f6` | DD-1 fails; a code task is needed — High | — |
| P-6 | `deriveTiers` compares author ≠ auditor on `boundModel`, which returns the id when there is no `wrapperModel` | shared-state | `bin/routing.js:176-178`; test `deriveTiers (g)` `:1439-1444` passes today with a no-registry id at T3 | `b8289f6` | FR-2's "satisfied" fails — High | — |
| P-7 | Sites outside the proposal state the retired T3 pick or "Reviewer `pro`": `akili-constitution.md:582`, `:855`; `model-routing.section.md:48`; `docs/commands/akili-constitution.md:94`; `docs/cli.md:448` | consumer | `git grep -n -e '\`pro\`' -e 'flash \| pro' -e 'flash \\\| pro' -e '3\.1 Pro' -e 'Sonnet 4\.6' -e 'sonnet-4-6' -e 'gemini-3\.1' -- ':!docs/specs' ':!CHANGELOG.md'` → those sites plus registry/doc/test/`bin` comments and `releases/*` (history, excluded) | `b8289f6` | A stale site ships — Low | — |
| P-8 | Tests that name retired ids or pin the Antigravity Reviewer wrapper: `test/routing.test.js:297`, `:337`, `:700-701`, `:1439-1458`, and `buildPlan (i)` | consumer | `grep -n "gemini-3.1-pro-high\|claude-sonnet-4-6" test/routing.test.js` → 9 hits; `(i)` read at `:1467-1482`; `test/registry-drift.test.js` reads the doc and JSON generically | `b8289f6` | FR-5 misses a test — Low | — |
| P-9 | A generic subagent inherits the session model; the doc's fallback for unconfirmed `tools` names is "read-only by instruction" | other | `docs/model-routing.md:512-514`, `:542-544` | `b8289f6` | DD-3's mitigation is wrong — High | — |

## 13. Amendment A1 — APPROVED at the Phase 3 gate (2026-10-18)

Found while running the T4 falsifier at baseline, after the Phase 2 gate. **P-10 refutes DD-1** ("no code change"). Per the Pivot rule, this is not a quiet edit to the approved design: it is held here for the user's sign-off.

| # | Claim | Class | Citation (as run) | Verified at | If false | Settled by |
|---|---|---|---|---|---|---|
| P-10 | `buildPlan` emits `Antigravity: in-session \`/agents\` lists only \`akili-leader\` — that is the success condition` whenever **any** Antigravity wrapper is planned (`Object.keys(planned).length > 0`), not only when the Leader is | live-path | `bin/routing.js:842-844`; pinned by `test/routing.test.js:840`. With FR-3, Implementer and Tester are planned, but the Leader is not, so the line would claim a success condition that cannot occur | `186c6a0` | — (refutes DD-1) | — |
| P-11 | Removing `wrapperModel` from the packaged T3 entry turns exactly three `test/routing.test.js` tests red: `renderWrapper Antigravity…` (66), `buildPlan restrictions and effort…` (82), `buildPlan (i)` (135) | consumer | Mutation run at `186c6a0`: drop `wrapperModel` from `gemini-3.1-pro-high`; `node --test test/routing.test.js` → `# pass 133`, `# fail 3`, the three `not ok` lines named; reverted | `186c6a0` | T4 scope misses a test — Low | — |

- **DD-1 (amended):** one code edit. The Antigravity `/agents` success-condition report is emitted only when the **Leader** wrapper is planned (`planned.leader`). No other code changes; the skip lines already report the unwrapped Leader and Reviewer.
- **DD-6 (extended):** tests 66 and 82 keep their coverage of the `pro`/`tools` rendering by using a **registry clone** that gives the T3 id a `pro` binding — the seam test `(j)` already uses (`JSON.parse(JSON.stringify(REGISTRY))`). Their packaged-roster assertions change to the FR-3 outcome.
- **Budget (amended):** tasks 3 → **4**. The rules text splits per rules document (Step 3.2): command vs. section template. LOC ~90 → **~100**. Review rounds 5 → **7**.

**P-10 confirmed live** (scratch project `/private/tmp/claude-501/-Users-jcadavid-orca-workspaces-sdd-jc-methodology-argon-registry/cc1b34a7-4eec-4147-a0fb-c85fd5f8d486/scratchpad/repro-fence`): after the registry change, `akili routing --hosts antigravity --models antigravity=gemini-4-argon-high,gemini-3.8-flash-high,gemini-3.8-flash-medium,gemini-3.8-flash-low,claude-sonnet-5-5-high --cli antigravity=agy --wrappers yes --yes` prints both `no wrapper — \`gemini-4-argon-high\`…` lines **and** `Antigravity: in-session \`/agents\` lists only \`akili-leader\` — that is the success condition`, with no Leader wrapper written. Exit 0. Registry restored afterwards.

## 14. Amendment A2 — APPROVED (2026-10-18): drop the section-template edit

| # | Claim | Class | Citation (as run) | Verified at | If false | Settled by |
|---|---|---|---|---|---|---|
| P-12 | Editing `.claude/templates/model-routing.section.md:48` makes every existing project's `akili routing` re-run refuse its fence | consumer | Scratch `/private/tmp/claude-501/-Users-jcadavid-orca-workspaces-sdd-jc-methodology-argon-registry/cc1b34a7-4eec-4147-a0fb-c85fd5f8d486/scratchpad/repro-fence2`: route once at `186c6a0` (exit 0); same flags again with only the :48 text changed → `refused (hand-edited fence; --force to regenerate)  AGENTS.md`, exit 1; template restored. Cause on record: `bin/routing.js:775` renders `expectedBody` from the previous answers with the **new** template (memory *pending-routing-template-evolution-bug*) | `186c6a0` | — | — |
| P-13 | A registry **data** change alone does not trip that refusal | consumer | Same scratch flow with only the planned `hosts.antigravity` JSON edit applied → `replaced  AGENTS.md`, exit 0 | `186c6a0` | A1/A3 add a fence risk — High | — |

- **Decision:** leave `model-routing.section.md:48` unchanged. New projects keep receiving the stale sentence "Gemini 3.1 Pro as the T3 auditor". It is recorded as known debt and goes into the queued template-evolution Bug spec, to be fixed together with the `/akili-security` row. The tier **table** rendered into `AGENTS.md` comes from the registry, so it is correct; only that prose line is stale.
- Because `docs/cli.md:448` is a doc, not a rules document, it joins T2. **Tasks: 4 → 3.**

## 15. Amendment A3 — APPROVED (2026-10-18; the defect itself queued as a separate Bug): existing Antigravity projects degrade on re-run

| # | Claim | Class | Citation (as run) | Verified at | If false | Settled by |
|---|---|---|---|---|---|---|
| P-14 | A project scaffolded with the packaged Antigravity ids that re-runs `akili routing` from its answers file after this change silently loses the retired ids. T3 collapses to `gemini-3.8-flash-medium`, author ≠ auditor becomes NOT satisfied, all four wrappers are `skipped (author ≠ auditor unsatisfiable)`, `AGENTS.md` is `replaced` with that note, there is no `stale?` line, and the exit is 0 | live-path | Scratch `/private/tmp/claude-501/-Users-jcadavid-orca-workspaces-sdd-jc-methodology-argon-registry/cc1b34a7-4eec-4147-a0fb-c85fd5f8d486/scratchpad/repro-fence3`: route with `gemini-3.8-flash-{high,medium,low},gemini-3.1-pro-high,claude-sonnet-4-6` at `186c6a0`; apply the planned JSON; re-run `--hosts antigravity --cli antigravity=agy --wrappers yes --yes` (no `--models`). Chain: answers file → `isNonMemberId` filter `bin/routing.js:258-259` drops ids absent from the packaged roster → mapping without them → `stale` loop `:861-871` only scans mapping ids. Registry restored | `186c6a0` | — | — |
| P-15 | Re-running with the old ids passed explicitly fails fast: `id \`gemini-3.1-pro-high\` is not in the packaged Antigravity roster — add a placement…`, exit 1 | live-path | Same scratch flow (`repro-fence`, RUN2a) | `186c6a0` | — | — |

- **Decision (recommended):** document the upgrade path; do not fix the code here. `CHANGELOG.md` gets an *Expected on upgrade* note telling Antigravity projects to re-run with `--models antigravity=<new packaged ids>` (the command in P-10). `docs/model-routing.md`'s Antigravity paragraph says the same. The silent degrade itself (dropped packaged ids produce no `stale?` line and exit 0) is a configurator defect that **predates** this spec. It is queued as a separate Bug proposal, not absorbed here ("scope only grows through approval").
- **Budget (A1+A2+A3):** 3 tasks, ~100 LOC, 6 review rounds.

## 16. Amendment A4 — APPROVED by the user 2026-10-18 (Pivot after T3; T2 ADVISORY 1)

| # | Claim | Class | Citation (as run) | Verified at | If false | Settled by |
|---|---|---|---|---|---|---|
| P-16 | The Step 8E Antigravity example wrapper in `/akili-constitution` shows `name: akili-reviewer` with `model: pro`. Step 8E is also the manual fallback when `akili routing` is unavailable, so an agent copying the example writes a `pro` Reviewer for an Argon-routed T3, which is what FR-3 forbids | consumer | `.claude/commands/akili-constitution.md:838-850` (read at `afea75c`). `git grep -n -e 'model: pro' -e 'model:pro' -- ':!docs/specs' ':!releases' ':!CHANGELOG.md'` → `akili-constitution.md:842` (the example), `docs/model-routing.md:256` (DD-4 reopen sentence — correct), `test/routing.test.js:670-671` (registry-clone fixture — correct). P-7's sweep missed it because its pattern required a backticked `` `pro` `` | `afea75c` | — | — |

- **DD-7:** the example becomes the **Implementer** wrapper (`name: akili-implementer`, `description` for the Implementer, `model: flash`, `subagent: true`, `mainAgent: false`) and drops the `tools:` list, because `tools` applies to the Reviewer alone. Nothing else changes. The field table's `tools` row and the "Apply `tools` to the Reviewer and nowhere else" paragraph below the example still describe the Reviewer-only field, so the example no longer has to illustrate it. Rejected: keeping a Reviewer example with `model: flash`, because on the packaged roster that would bind the auditor to the Implementer's model and break author ≠ auditor.
- **Budget (A4):** tasks 3 → **4**, LOC ~100 → **~150** (actual 138 before T4), review rounds 6 (unchanged; T4 estimates 1–2, and 4 are used so far).
