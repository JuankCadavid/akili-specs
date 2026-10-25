# Execution Log: `changes/akili-review`

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/akili-review` |
| Started | 2026-10-25 |
| Leader | Claude Code, `claude-opus-5-5` (T1) |
| Approval Mode | `gated` (tasks.md). User mandate 2026-10-25: "Commit locally only; never push, open PRs, merge, tag or publish. Stop and report at each PR boundary and on any HALT or tripwire." Per-task continue gates inside a PR group proceed; the Leader stops at the PR boundaries (after T3, after T8, after T11). Exceptions (HALT, Pivot, tripwire, FATAL_FAIL, waiver, unearned skip) always stop |
| Scope | T1–T11 in three PR groups (T1–T3, T4–T8, T9a–T11). T12 pilot **deferred** (needs a scratch repo and API keys) |
| Budget | 14 tasks · ~4,750 LOC · 22 rounds; tripwire **> 15 tasks, > ~5,700 LOC, or > 25 rounds** (tasks.md §1, design §11) |
| Personas | `.agents/` deployed 2026-10-25 from `.claude/templates/` (gitignored, `.gitignore:8`); `node bin/akili.js doctor --agents` → every section `CURRENT`, "No persona drift blocking CI." |
| Delegation | No Step 8E wrappers in this repo → fallback spawn (`general-purpose` subagent; the worker reads its own persona). Implementer `sonnet` (T2), Reviewer `opus` (T3 role on a different model than the Implementer: author ≠ auditor) |
| Base | branch `JuankCadavid/akili-review` at `26fe7cc` |
| Baseline `npm test` | Node 22.12.0: `# tests 844 · pass 843 · fail 1` — `not ok 811 - healthy registry is unchanged and exits promptly` (`test/update-check.test.js`); re-run alone twice → `pass 4 · fail 0`. A timing test flaking under full-suite load, not a defect this spec owns |
| Commits | Local only, `[SPEC:changes/akili-review]`; no push, PR, merge, tag, release or publish (user rule) |

## 2. Task Execution History

### T1: Review schema + `validate-review.cjs` — PASS (attempt 1)

| Field | Value |
|---|---|
| Date | 2026-10-25 |
| Final status | `PASS` |
| Attempts | 1 |
| Skills / effort | `tdd`, `error-handling-patterns` (task list); high (external premise P-5 + a contract both runtimes consume) |
| spawns | Implementer (sonnet) 33 calls, 141,762 tokens, ended complete; Reviewer (opus) 16 calls, 99,829 tokens, ended complete |
| Requirements covered | FR-7 (fields, bounds, suspect rule, threshold, *Malformed findings*, *Single-judge critical*), FR-1 (file set, partly: schema + validator), NFR-2 |
| Running totals | tasks 1/14 · LOC ~923 (schema 71, validator 230, tests 309, fixtures ~313) · review rounds 1/25 |

**P-5 settled (docs only, no live API call).**

- Anthropic — https://platform.claude.com/docs/en/build-with-claude/structured-outputs. Supported: basic types (object, array, string, integer, number, boolean, null), `enum`, `const`, `anyOf`/`allOf` (limited), `$ref`/`$def`/`definitions`, `default`, `required`, `additionalProperties` ("must be set to `false` for objects"), string formats, array `minItems` of 0 or 1. Not supported: "Numerical constraints (such as `minimum`, `maximum`, `multipleOf`)", "String constraints (`minLength`, `maxLength`)", "Array constraints beyond `minItems` of 0 or 1". Limit: 16 union-type parameters (the schema has 3: `target.pr`, `target.repo`, `findings[].fix`).
- OpenAI — https://developers.openai.com/api/docs/guides/structured-outputs (the platform.openai.com URL redirects here). Types string, number, boolean, integer, object, array, enum, anyOf; root object; "all fields or function parameters must be specified as `required`"; optional = union with null; `additionalProperties: false` on every object; unsupported composition: allOf, not, dependentRequired, dependentSchemas, if, then, else.
- Codex `--output-schema` — https://learn.chatgpt.com/docs/non-interactive-mode: the example uses `required` + `additionalProperties: false`; no keyword restriction stated.
- Conclusion: the §5.1 subset uses no keyword either provider rejects → **one schema file; no Pivot**.

**Attempt 1.** Files (new): `.claude/skills/pr-review/review-schema.json`, `.claude/skills/pr-review/validate-review.cjs`, `test/pr-review-scripts.test.js`, `test/fixtures/pr-review/{valid-review,manifest,malformed-missing-evidence,malformed-confidence-120,single-judge-critical,path-traversal}.json`. Red run (tests first, stub validator `process.exit(0)`): `# tests 60 / # pass 13 / # fail 47`, e.g. `not ok 2 - scenario Malformed findings: missing evidence names finding 1 and \`evidence\`` — `Expected values to be strictly equal: 0 !== 1`. Falsifiers (executed, reverted, `cmp`-confirmed): (a) remove `confidence > 100` → `not ok 3, 6, 54` on `assert.equal(r.status, 1)`; (b) remove suspect ⇒ not-critical → `not ok 4`; (c) first attempt **inert** (the file-in-manifest rule rejected `../../etc/passwd` on its own) → path-shape fixtures re-run without a manifest → `not ok 5, 32, 33`. Extra: leading-slash removal → `not ok 34`; charset removal → `not ok 29–31`. Verification: suite 60/60 on Node 22.12.0 and 18.20.8; schema parses; forbidden-keyword grep `0`; `O_NOFOLLOW` grep `0`; `git diff --check` clean. Leader re-run: **VERIFIED** (`# pass 60 # fail 0`, `parse-ok`, `0`, `0`). Reviewer: **PASS** — every §5.2 row has an illegal-value fixture asserting exit code and the exact `findings[1].<field>`; strict subset walked by a test; no agent `fingerprint` (rejected as unexpected property); Node-core only; no `docs/specs/` read; Reviewer re-ran falsifiers (a)–(c) in a scratch copy.

**Judgment calls (Implementer, carried verbatim in substance).** Exit 2 = bad argument, unreadable document/manifest, or manifest not JSON; a document that is not JSON exits 1. Threshold: `--threshold` wins, else manifest `threshold`, else no floor. `..` rejected as a path segment (`a..b` stays legal). Manifest/file-set rules apply only with `--manifest`. Lens enum `spec, correctness, tests, maintainability, security, docs` (Leader confirmed against requirements §3 Glossary row *Lens*).

**ADVISORY (final verdict).** Risk (plan level): T1's `Consumers: none` is incomplete — any file under `.claude/skills/` turns the `install-cursor`/`install-grokbot` counts and doctor red, so **PR 1 (T1–T3) would carry red CI checks until T6 (PR 2)**, and branch protection requires the six checks green; Reviewer calls it a spec gap for the Pivot Protocol, not a T1 edit. Reliability: a non-integer `manifest.threshold` (e.g. `"80"`) is silently ignored (fails open) — exit 2 would be safer. Tests: `--threshold works without a manifest` asserts status only; no non-integer `line_end` test. Reliability: semantic checks run only after the schema passes (header says "every violation printed"). Readability: `show()` may split a surrogate pair at 60 code units.

**Issues encountered.** `npm test` after T1: 904 tests, 13 fail — `docs-overview` 376/378/379, `install-cursor` 394/398/400–404, `install-grokbot` 444/446/449. Reviewer confirmed causality (a copy without `.claude/skills/pr-review/` → those files 58/0; in the tree: `expected 236 packaged skill files … counted 238`, doctor exits 1). Owned by T6/T9b; not edited. **Leader decision:** the PR-1 CI-red gap is a spec tension (PR strategy vs branch protection); it does not change T2/T3's work, so it is presented to the user at the PR-1 boundary as a one-line amendment proposal (KZ-changes--persona-upgrade-3), not carried to closure.

**Final verification.** `node --test test/pr-review-scripts.test.js` → `# pass 60 # fail 0`.
