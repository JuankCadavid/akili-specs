# Proposal: Antigravity Registry Refresh — Gemini 4 Argon

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/antigravity-argon-registry` |
| Slug | `antigravity-argon-registry` — derived from free-text argument |
| Type | Change |
| Approval Mode | gated |
| Date | 2026-10-18 |
| Owner | Juan Carlos Cadavid |
| Depends on | none |
| Parallel-safe | yes — touches only the Antigravity column, its JSON host block, and tests that read it |
| Status | **Approved** 2026-10-18 by Juan Carlos (via Methodology agent) — Option A; Q2 → `claude-sonnet-5-5-high`; Q3 → routed ids only; Q1 → confirm at source in specify, else T1/T3 skip the wrapper with a documented reason |
| Constraints (user) | this worktree only; local commits with `[SPEC:changes/antigravity-argon-registry]`; no push, no release, no npm publish; stop at every gate |

## Intent

Bring the packaged Antigravity registry in line with today's live roster: route the new top model, **Gemini 4 Argon**, into the tiers where strength matters, and remove ids that the roster no longer exposes.

## Problem / Current Behavior

The packaged Antigravity registry is a month stale, and two of its ids are gone from the live roster.

| # | Claim about today | Citation as run |
|---|---|---|
| C1 | `agy models` lists 13 ids: `gemini-4-argon-{high,medium,low}`, `gemini-3.8-flash-{high,medium,low}`, `claude-opus-5-5-{low,medium,high}`, `claude-sonnet-5-5-{low,medium,high}`, `gpt-oss-120b-medium` | `agy models` run 2026-10-18 in this worktree, exit 0 (same list the user verified) |
| C2 | `gemini-3.1-pro-high` and `claude-sonnet-4-6` are **not** in that list | same run, C1 |
| C3 | The packaged T3 Auditor default is `gemini-3.1-pro-high`, and the T3 Fallback is `claude-sonnet-4-6` | `.claude/templates/model-registry.json` → `hosts.antigravity.tierPreference.T3`; `docs/model-routing.md:125` |
| C4 | T1, T4 and T6 route to `gemini-3.8-flash-high`; T2 to `-medium`; T5 to `-low`; T6 carries `<CONFIRM ID>` | `model-registry.json` `hosts.antigravity.tierPreference`; `docs/model-routing.md:123-128` |
| C5 | `lastVerified` is `2026-09-17` in the JSON and in two doc pins | `model-registry.json` `hosts.antigravity.lastVerified`; `docs/model-routing.md:135`, `:237` |
| C6 | The doc prose says the roster "tops out at Gemini 3.8 Flash" and offers Claude Sonnet 4.6 as the T3 upgrade | `docs/model-routing.md:237-245` |
| C7 | An Antigravity wrapper's `model:` field accepts only `flash` or `pro`, taken from the model's `wrapperModel`; an id without `wrapperModel` gets no wrapper (skipped with a reason) | `bin/routing.js:646-650`; `.claude/commands/akili-constitution.md:855`; `docs/model-routing.md:522` |
| C8 | Which `model:` value an Antigravity `agent.md` accepts for Argon (or for a Claude id) | `UNVERIFIED — confirm at source before relying on it` (constitution `:855` derives `flash`/`pro` from the model family; the code comment at `bin/routing.js:647` records "no vendor URL") |
| C9 | `test/routing.test.js` uses `gemini-3.1-pro-high` and `claude-sonnet-4-6` as **packaged** roster entries, and resolves them against the real JSON | `test/routing.test.js:17`, `:86`, `:297`, `:337`, `:700-701`, `:1439-1458` |
| C10 | `test/registry-drift.test.js` requires every backticked id in a doc cell to exist in `models[]`, and each `tierPreference` head to appear in its cell | `test/registry-drift.test.js` tests 1, 4, 5 |
| C11 | `agy` now has an `--effort` flag (`low\|medium\|high\|xhigh\|max`) | `agy --help` run 2026-10-18 |

**Effect today:** a project that runs `akili routing` for Antigravity with the packaged defaults gets a T3 Reviewer bound to an id the host no longer serves, and never gets Argon.

## Proposed Outcome

- The packaged Antigravity roster (`models[]`) matches `agy models` as of 2026-10-18 — at least for every id the table routes to.
- T1 Architect and T3 Auditor route to **`gemini-4-argon-high`**; T3 still differs from the T2 Flash coder (author ≠ auditor).
- No packaged cell, fallback, or `tierPreference` names a retired id.
- `lastVerified` and both doc pins read `2026-10-18`; the prose describes the current roster.
- `akili routing` still writes a valid Antigravity wrapper for every role whose tier routes to Argon — or, if Argon's wrapper value cannot be confirmed, it skips with a reason, which the docs state.
- `npm test` green, drift test included.

## Scope

| In | Detail |
|---|---|
| `.claude/templates/model-registry.json` | `hosts.antigravity`: `models[]` (add Argon ids; remove retired ones; add the Claude 5.5 ids the table names), `tierPreference`, `notes`, `lastVerified` |
| `docs/model-routing.md` | Antigravity column of the tier table, the T3 Fallback cell, the `:135` pin, the *Antigravity* paragraph (`:237-245`), the T6 cross-host mentions (`:222`, `:263`) if their id changes, the wrapper `model:` value list (`:522`) if Argon adds one, *Registry updated* stamp |
| `.claude/commands/akili-constitution.md` | the `model` row at `:855` — only if Argon needs a wrapper value beyond `flash`/`pro` |
| `bin/routing.js` | only the skip text at `:649` naming `flash \| pro` — only if the value set grows |
| `test/routing.test.js` | rebase the fixtures that use retired ids as packaged entries (C9) onto live ids, keeping each test's intent (e.g. "distinct wrapper models → ok") |
| `CHANGELOG.md` | `Unreleased` entry (patch classification proposed: a data refresh with no new command or behavior) |

## Non-Goals

- No push, tag, release, or npm publish (user constraint).
- Other hosts' columns (Claude, OpenCode, Codex, Cursor) — untouched.
- The effort-dial mapping (`docs/model-routing.md:335-343`): `agy --effort` (C11) may make a separate dial possible, but that is a behavior change for a later proposal.
- Settling T6 vision: Argon's vision ability is not shown by `agy models`; T6 keeps its `<CONFIRM ID>`.
- Using `gpt-oss-120b-medium` in any tier.
- Editing any project's deployed `AGENTS.md` registry — projects pick this up by re-running `akili routing`.

## Affected Users, Systems, And Specs

| Affected | How |
|---|---|
| Projects routing Antigravity via `/akili-constitution` Step 8C / `akili routing` | New packaged defaults; T3 stops pointing at a retired id |
| `test/registry-drift.test.js`, `test/routing.test.js` | Must stay green; the second needs fixture rebasing |
| Archived `changes/model-routing-configurator` | Owns the registry contract; this change edits data, not the contract |

## Visual Reference

- Source: None
- Location: —
- Notes: Registry data and docs only; no UI surface.

## Requirement Delta Preview

### ADDED Requirements

- `models[]` carries `gemini-4-argon-high`, `-medium`, `-low` (label "Gemini 4 Argon (High/Medium/Low)", `alias: false`, `dated: false`, effort in the id) and any Claude 5.5 id the table names.
- Each Argon entry has a `wrapperModel` confirmed at source — or, if none can be confirmed, the gap is recorded and the docs say that Argon roles get no wrapper.

### MODIFIED Requirements

- T1 head: `gemini-3.8-flash-high` → `gemini-4-argon-high`.
- T3 head: `gemini-3.1-pro-high` → `gemini-4-argon-high`; T3 Fallback: `claude-sonnet-4-6` → a live Claude 5.5 id on Antigravity (see Open Question Q2).
- `lastVerified` and the doc pins: `2026-09-17` → `2026-10-18`.
- *Antigravity* paragraph: describes Argon as the roster's top model and drops the "only Pro generation" argument.

### REMOVED Requirements

- `gemini-3.1-pro-high` and `claude-sonnet-4-6` leave `models[]` and the table (C2).

## Approach Options

| Option | What changes | Pros | Cons |
|---|---|---|---|
| **A — Argon on the judgment tiers** | T1 + T3 → Argon High; T2/T4/T5 stay Flash; T6 unchanged; retired ids replaced | Smallest change that fixes the dead T3 and routes the strongest model to the work it suits; author ≠ auditor holds (Argon ≠ Flash); costs nothing on high-volume tiers | Depends on Argon's wrapper value (Q1) |
| B — Argon everywhere top (T1/T3/T4/T6) | A + T4 and T6 to Argon High | One family for every heavy tier | Long-context and vision claims for Argon are unverified — writes guesses into the registry |
| C — Cross-vendor auditor | T1 Argon; T3 `claude-opus-5-5-high` | Strongest author ≠ auditor (another vendor) | A Claude id has no `wrapperModel` → **no Reviewer wrapper is written** (C7), so T3 stops being enforced; needs the same unverified wrapper question |

## Recommended Approach

**Option A.** It replaces the only id that is actually broken (T3), puts Argon where depth matters (Leader and Reviewer), and leaves the volume tiers alone. Everything it writes is backed by today's `agy models` run except the wrapper value, which `/akili-specify` must settle first.

**Alias-first rule:** Antigravity has no floating alias; Argon ids carry a generation number but no date, so they are recorded like the existing Flash ids (`alias: false`, `dated: false`). This is not a dated pin, so no pin reason is needed. The specify phase confirms this reading.

## Risks, Dependencies, And Open Questions

| # | Item | Owner / when |
|---|---|---|
| Q1 | **Argon's `wrapperModel`.** Today's value set is `flash \| pro`, derived from the family name, with no vendor source (C7, C8). Argon is neither. A guessed value could produce a wrapper the host rejects. Settle at the source (Antigravity docs, or one throwaway `agent.md` with `model: <candidate>` dispatched through `agy`) before the design fixes it. If it cannot be confirmed: Argon entries carry no `wrapperModel`, T1/T3 roles get no wrapper (skipped with a reason), and the docs say so. | `/akili-specify` Phase 2, Premise Ledger |
| Q2 | T3 Fallback: `claude-sonnet-5-5-high` (same shape as today) or `claude-opus-5-5-high` (stronger auditor)? | user, at specify |
| Q3 | Should `models[]` list the full live roster (13 ids) or only the ids the table routes to? Today it lists only routed ids plus one fallback. | user, at specify (recommend: routed ids only, as today) |
| R1 | Rebasing `test/routing.test.js` fixtures can weaken a test by accident — each rebased test must keep its asserted outcome (e.g. `:1439` "distinct wrapper models → ok" needs two live ids with different `wrapperModel` values, which depends on Q1). | specify / execute |
| R2 | Argon's quota, plan gating and price are not visible in `agy models`. | `UNVERIFIED`; noted in the doc, not used for routing |
| KZ-002 | The CHANGELOG entry and doc prose must be quote-checked against HEAD, not written from memory. | execute |
| KZ-changes--cursor-install-target-1 | Every quoted model label comes from the raw `agy models` output, never a summary. | specify / execute |

## Success Criteria

- `node --test test/registry-drift.test.js` and `npm test` pass.
- `grep -rn "gemini-3.1-pro-high\|claude-sonnet-4-6" .claude/templates docs/model-routing.md bin` finds nothing (archive and CHANGELOG history excluded).
- Every Antigravity id in the table and in `tierPreference` appears in a fresh `agy models` run.
- A dry `akili routing --hosts antigravity` with the packaged roster shows T1/T3 → `gemini-4-argon-high`, T2 → `gemini-3.8-flash-medium`, and either a valid wrapper for each role or a skip reason that matches the docs.
- `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` clean. No push, no release.

## Next Step

```text
/akili-specify changes/antigravity-argon-registry
```

Lite depth fits: data plus docs, one contract-preserving code string at most.
