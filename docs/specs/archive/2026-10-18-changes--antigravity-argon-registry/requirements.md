# Requirements: Antigravity registry refresh — Gemini 4 Argon

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/antigravity-argon-registry` |
| Depth | **Lite** — registry data, docs, test fixtures; at most one code string |
| Type | Change |
| Approval Mode | `gated` (inherited from `proposal.md`) |
| Status | **Approved** — 2026-10-18 (Juan Carlos via Methodology agent, Phase 1 gate: Continue, FR-3 fallback branch kept) |
| Date | 2026-10-18 |
| Source | `proposal.md` (approved 2026-10-18: Option A; Q2 → `claude-sonnet-5-5-high`; Q3 → routed ids only; Q1 → confirm at source, else T1/T3 skip the wrapper with a documented reason) |
| Format precedent | `docs/specs/bugfix/pty-harness-ubuntu-flake/requirements.md` — this repo has no `docs/specs/general-setup/` |
| Verified at | `43bc5d6` |
| Deviations from proposal | Q1 settled **negative** (§4, C-Q1): no confirmed wrapper value binds Argon, so the user's fallback branch applies — FR-3 |

## 2. Executive Summary

The packaged Antigravity registry routes T1 Architect and T3 Auditor to `gemini-4-argon-high`, names only ids that today's `agy models` lists, and is dated 2026-10-18. Argon has no confirmed Antigravity wrapper value, so `akili routing` writes no Leader or Reviewer wrapper for Antigravity by default. It reports the skip with a reason, and the docs say why.

## 3. Glossary

| Term | Meaning |
|---|---|
| Roster | The output of `agy models` — the ids the host serves |
| Packaged registry | `.claude/templates/model-registry.json` → `hosts.antigravity` plus the Antigravity column of `docs/model-routing.md`'s tier table |
| Wrapper value | The `model:` value an Antigravity `agent.md` accepts — a **tier** (`inherit`, `flash`, `pro`), not a model id; stored as `wrapperModel` |
| Retired id | `gemini-3.1-pro-high`, `claude-sonnet-4-6` — in the packaged registry, absent from the roster |

## 4. System Context & Scope

- The roster (2026-10-18) lists 13 ids, including `gemini-4-argon-{high,medium,low}`, `gemini-3.8-flash-{high,medium,low}`, `claude-sonnet-5-5-{low,medium,high}`; it does not list `gemini-3.1-pro-high` or `claude-sonnet-4-6` — `agy models` (agy 1.4.2), run 2026-10-18, exit 0.
- **C-Q1 — wrapper values.** `agy plugin validate --strict --json` on a scratch plugin with one agent per candidate `model:` loads `flash`, `pro` and `inherit`, and rejects `argon`, `Argon`, `gemini-4-argon`, `gemini-4-argon-high`, `gemini-4`, and nine other candidates with `Invalid model tier <value>. The loader skips this agent` — run 2026-10-18, agy 1.4.2. The agy changelog says the field takes "a chosen model tier (such as `flash` or `pro`)" (`agy changelog`, line 663 of its output).
- **Which model `pro` runs on now that no Pro id is on the roster:** `UNVERIFIED — confirm at source before relying on it`. A live subagent probe was blocked in this session by the permission classifier. Owner: the user, at the HITL gate (see design).
- `bin/routing.js:646-650`: an Antigravity id without `wrapperModel` gets no wrapper; the role is skipped with `no wrapper — … has no Antigravity wrapper model (flash | pro)`.
- `test/routing.test.js` `buildPlan (i)` (≈`:1467`) asserts the packaged Antigravity roster **writes** a Reviewer wrapper; tests at `:297`, `:700`, `:1439-1458` use retired ids — `grep -n "gemini-3.1-pro-high\|claude-sonnet-4-6" test/routing.test.js`, run 2026-10-18.
- Baseline: `npm test` → `# fail 0`, run 2026-10-18 at `43bc5d6`.
- Out of scope: other hosts; the effort-dial mapping and `agy --effort`; T6 vision; `gpt-oss-120b-medium`; push/release/publish.

## 5. Stakeholders / Personas

| Who | Needs |
|---|---|
| A project running `/akili-constitution` Step 8C on Antigravity | Packaged defaults the host actually serves; an honest skip rather than a wrapper the loader would reject |
| Maintainer | `npm test` (drift test included) stays the gate between doc and JSON |

## 6. Functional Requirements

### FR-1: Packaged roster matches the live roster

`hosts.antigravity.models[]` SHALL list exactly the ids the tier table names (primary or fallback), and each SHALL appear in `agy models` output.

#### Scenario: Retired ids gone

- GIVEN the packaged registry after the change
- WHEN `grep -rn "gemini-3.1-pro-high\|claude-sonnet-4-6"` runs over `.claude/templates/`, `docs/model-routing.md`, `bin/`, `.claude/commands/`
- THEN it returns 0 hits
- AND `models[]` contains `gemini-4-argon-high` (label `Gemini 4 Argon (High)`) and `claude-sonnet-5-5-high` (label `Claude Sonnet 5.5 (High)`), both `alias: false`, `dated: false`
- BUT it must NOT list roster ids no tier names (Q3), e.g. `gemini-4-argon-low`, `gpt-oss-120b-medium`
- AND IT MUST keep the labels byte-equal to the `agy models` output (KZ-changes--cursor-install-target-1)

### FR-2: Tier routing

The Antigravity column SHALL route T1 and T3 to `gemini-4-argon-high`, keep T2 `gemini-3.8-flash-medium`, T4 `gemini-3.8-flash-high`, T5 `gemini-3.8-flash-low`, T6 `gemini-3.8-flash-high` + `<CONFIRM ID>`, and set the T3 Fallback to `claude-sonnet-5-5-high` on Antigravity / `sonnet`.

#### Scenario: Derivation from the packaged roster

- GIVEN `akili routing` derives tiers for Antigravity from the packaged roster
- WHEN the mapping is computed
- THEN T1 and T3 primaries are `gemini-4-argon-high` and T2 is `gemini-3.8-flash-medium`
- AND author ≠ auditor reports satisfied (T3's bound value ≠ T2's `flash`)
- BUT it must NOT change any other host's column, cell, or `tierPreference`

### FR-3: Argon gets no unconfirmed wrapper value

An Argon entry SHALL carry no `wrapperModel` while no tier value is confirmed to run Argon. A Leader or Reviewer whose tier routes to Argon SHALL be skipped with a reason, and the docs SHALL state the reason.

#### Scenario: Wrappers on the packaged roster

- GIVEN `akili routing --hosts antigravity --wrappers yes` on the packaged roster
- WHEN the plan is built
- THEN the Implementer and Tester wrappers are created with `model: flash`
- AND the Leader and Reviewer are skipped with a reason that names `gemini-4-argon-high`
- BUT it must NOT write any `agent.md` whose `model:` is not one of `inherit`, `flash`, `pro`
- AND IT MUST be documented in `docs/model-routing.md` (Antigravity paragraph and wrapper-value row) that Argon roles are not wrapper-bound, with the C-Q1 evidence date

### FR-4: Dated and verified

`hosts.antigravity.lastVerified`, the Antigravity pin (`docs/model-routing.md` "Antigravity IDs ← `agy models`") and the *Antigravity* paragraph's date SHALL read `2026-10-18`; the paragraph SHALL describe Argon as the roster's top model and drop the Gemini 3.1 Pro / Sonnet 4.6 text.

#### Scenario: Doc and JSON agree

- GIVEN the edited doc and JSON
- WHEN `node --test test/registry-drift.test.js` runs
- THEN all its tests pass
- AND IT MUST still fail when one Antigravity cell's backticked id is changed to an id absent from `models[]` (falsifier)

### FR-5: Tests keep their intent

Every test that names a retired id SHALL be rebased to a live id and keep the outcome it asserts; `buildPlan (i)` SHALL assert the Antigravity Reviewer outcome FR-3 defines.

#### Scenario: Suite green

- GIVEN the change applied
- WHEN `npm test` runs
- THEN `# fail 0`
- BUT it must NOT delete a test or weaken an assertion to reach green

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` clean |
| NFR-2 | `CHANGELOG.md` `Unreleased` entry, every clause quote-checked against HEAD (KZ-002); classified patch |
| NFR-3 | Local commits only, prefix `[SPEC:changes/antigravity-argon-registry]`; no push, release, or publish |

### Defect classes → gate

| Defect class | Gate |
|---|---|
| Doc cell and JSON disagree | `test/registry-drift.test.js` |
| Id not served by the host | Fresh `agy models` diffed against `models[]` ids (manual, in the task) — no automated gate; CI cannot run `agy` |
| Wrapper with a value the loader rejects | `test/routing.test.js` `buildPlan (i)` + `agy plugin validate` of the rendered wrappers (manual, in the task) |
| Stale prose / dates | `grep` for `2026-09-17` (Antigravity sites), `3.1 Pro`, `Sonnet 4.6` over `docs/model-routing.md` |
| Overstated CHANGELOG | Quote-check each clause at HEAD (human, at review) — accepted as a non-automated check |

## 8. Requirement ID Index

| ID | Title |
|---|---|
| FR-1 | Packaged roster matches the live roster |
| FR-2 | Tier routing |
| FR-3 | Argon gets no unconfirmed wrapper value |
| FR-4 | Dated and verified |
| FR-5 | Tests keep their intent |
| NFR-1..3 | Verification, changelog, commit discipline |
