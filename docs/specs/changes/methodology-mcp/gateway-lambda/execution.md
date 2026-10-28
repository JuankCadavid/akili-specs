# Execution Log: `changes/methodology-mcp/gateway-lambda`

## Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/methodology-mcp/gateway-lambda` |
| Branch | `JuankCadavid/methodology-mcp` (worktree `methodology-mcp`), started at `c05a95f` |
| Approval | Spec APPROVED by the maintainer (Juan Carlos Cadavid, 2026-10-27 7:30 PM): requirements `2e25d2f`, design `174299c`, tasks `c05a95f` |
| Approval Mode | `pre-approved` for T1–T5 only: process gates answered with the recommended option; per-task review loops kept. HALT, Pivot, budget tripwire, `FATAL_FAIL`, `PRODUCT_BUG`, destructive actions and any product/cost/risk decision stop |
| Scope of this run | T1–T5. T6 and T7 are maintainer-owned and are not started. `local-stdio` stays on hold |
| Hard rules | Local commits only; no push, PR, merge, tag or publish; no AWS command of any kind (offline `cdk synth` only); no account ID or role ARN in the repo; docs in English |
| Personas | `.agents/` absent in this worktree; deployed by copying `.claude/templates/{leader,implementer,reviewer,tester}.md` (gitignored). `node bin/akili.js doctor --agents` → "No persona drift blocking CI." (2026-10-27) |
| Spawn path | No Step 8E wrappers (`.claude/agents/` absent): fallback sub-prompts told to load `.agents/<role>.md`. Implementer on `sonnet` (T2); Reviewer on `opus` (≠ Implementer); Leader on `opus` |
| Model Routing registry | No `## Model Routing` section in this repo's root `AGENTS.md`; tiers follow `docs/model-routing.md` defaults |
| Budget (design §10) | 7 tasks · ~2,900 LOC · 12 review rounds. Tripwire: past 9 tasks, 3,700 LOC, or 3 rounds on any one task |
| Baseline | `npm test` → 1153 tests, 1153 pass, 0 fail (2026-10-27, `c05a95f`, Node v22.12.0) |

## Task Execution History

### T1: content core: catalog, path guard, rendering, paging, `list_commands`, `get_command` (PASS)

- Date: 2026-10-27. Attempts: 1. Final status: PASS.
- Skills: `tdd`, `error-handling-patterns` (as listed). Effort `high` (new path-safety code on a public endpoint; one level above the `medium` default). Implementer `sonnet`, Reviewer `opus`.

#### Attempt 1: PASS

- Files changed: `bin/mcp-core.js` (477 lines, new), `test/mcp-core.test.js` (639 lines, new, 53 tests), `test/fixtures/mcp/pkg/**` (12 files, 28 lines; `dot-claude/` is copied to `.claude` in the OS temp dir at test time, symlinks created there at test time).
- Implementer verification: `node --test test/mcp-core.test.js` → 53 pass, 0 fail · `npm test` → 1206 pass, 0 fail (1153 + 53) · `git diff --stat package.json` → empty · `git diff --check` clean. Real catalog: 267 keys, equal to the `npm pack --dry-run --json` entries of the three areas plus the two scripts.
- Falsifier reds (observed by the Implementer, each mutation applied, run, quoted, reverted; re-run 53/53 green after the last revert):
  1. `readFile` falls back to `path.join(packageDir, ".claude", key)` → test 7 (`each hostile form is not a key: readFile returns null and reads no file`) red on `assert.deepEqual(calls, [])`; the diff shows `readFileSync` attempts on `…/methodology-mcp/package.json`, `…/methodology-mcp` and `…/.claude/package.json`.
  2. `lastIndexOf("\n")` cut disabled → test 35 `commands/akili-constitution.md part 1 cuts after a line break` expected true, actual false; test 39 expected 29001, actual 30000.
  3. Only the first `$ARGUMENTS` replaced → six tests red, including test 27 (`FR-2 akili-archive (six $ARGUMENTS): all occurrences are replaced, not only the first`) and the `akili-propose` tests 25 and 26.
  4. Dotfile skip removed → test 4 (`the catalog excludes a symlink, a dotfile and any file outside the four areas`) red; actual keys include `commands/.hidden.md` and `skills/s/.dot`.
- Evidence re-run (Leader-inline, non-author): `node --test test/mcp-core.test.js` → 53/53 · `npm test` → 1206/1206 · `git diff --stat package.json` → empty. **VERIFIED**.
- Reviewer verdict: **PASS**. "T1 meets every THEN, BUT, AND and IT MUST clause in its scope … None of the three disqualifiers applies." Re-ran the file: 53/53. Swept all 14 commands for missed skill names: `judgment-day` (akili-archive) and `kaizen` (akili-security) are plain prose, correctly excluded under design §6.
- runtime events: none.
- spawns: Implementer 24 calls, 143,788 tokens, ended complete; Reviewer 10 calls, 106,539 tokens, ended complete.

**ADVISORY (4R, recorded only, not tasks):**
- Readability: the `list_commands` description is longer than design §6's text ("…with their descriptions and part counts; then call get_command"), and `get_file` says "for example" where §6 says "e.g."; §6's column is "opens with", and the first sentence matches. Test line 514 has a no-op `- 0`.
- Reliability: `arguments: null` is accepted as absent; a required argument set to `null` is rejected.
- Resilience: user `arguments` of control characters could grow ~6× under `JSON.stringify` and push a `get_command` part past 40,000; FR-2 scopes the bound to catalog content.
- Risk: an `arguments` value with newlines makes the appended `ARGUMENTS:` line span several lines.

**Requirements covered:** FR-1 (both scenarios), FR-2 (*Command text rendered*, *Paging*, `list_commands`, `get_command`, envelope), NFR-1, NFR-5, DD-6.

**Decisions made:**
- Skill-name detection runs on the command body **before** `$ARGUMENTS` substitution, so user arguments never add skills. Design §6 says "in the rendered body"; FR-2 says "the body names". The code follows FR-2 and a test pins it; `local-stdio` reuses this reading. No spec edit (the Reviewer judged it conformant).
- The appended `ARGUMENTS: <args>` line ends with `\n`; a newline is added first if the body lacks one.
- Frontmatter is parsed lazily (the build reads only `package.json`, a test pins one read).
- `test/fixtures/mcp/pkg/bin/akili.js` is named `bin/cli.txt` so root `node --test` does not execute it.

**Issues encountered:** the Implementer wrote the core before the tests (no TDD red; the four falsifier runs are the red evidence). Not-done note in the report (an `onError` logging hook for `internal`) is outside T1's scope; it is T2's handler concern, not an owed item.

**Running totals (budget tripwire check):** tasks 1 of 7 (tripwire 9) · LOC ≈ 1,144 (T1 estimate ~640; tripwire 3,700) · review rounds 1 (T1; tripwire 3 on any task). Under the tripwire. T1 ran ~1.8× its LOC estimate (tests 639 vs ~380), the pattern KZ-bugfix--init-ctrlc-abort-2 names; watched at every gate.

**Final verification:** VERIFIED; Reviewer PASS. Continue gate: `auto-approved (pre-approved mode)`.

### T2: remaining tools, search, errors, Lambda handler (PASS)

- Date: 2026-10-27. Attempts: 3. Final status: PASS (attempt 3).
- Skills: `tdd`, `error-handling-patterns` (as listed). Effort `high` → `xhigh` (attempt 2) → `xhigh` (attempt 3; `effort ceiling: held xhigh`, fresh Implementer spawn with full Attempt History). Implementer `sonnet`, Reviewer `opus` (the same Reviewer context re-reviewed attempts 2 and 3).

#### Attempt 1: FAIL

- Files changed: `bin/mcp-core.js` (+186; five handlers, lazy inverted index, stub removed), `bin/mcp-lambda.js` (79, new), `test/mcp-core.test.js` (+573; one T1 stub test swapped), `test/mcp-lambda.test.js` (390, new, 23 tests).
- Implementer verification: two files → 121 pass (98 core, 23 lambda) · `npm test` → 1274 pass, 0 fail · `node --check bin/mcp-lambda.js` clean. Consumers (P-8): `akili-marketing-docs` 12/0, `diagram-design` 13/0, `akili-review-contract-coverage` 20/0, `release-status` 7/0.
- Falsifier reds (observed, mutation applied, quoted, reverted):
  1. Log `JSON.stringify(event)` → `error: 'log holds SENTINEL-ARGUMENTS-9f3a1c'`; as a second `console.log`: `expected: 6, actual: 12` (line count).
  2. `callTool` rethrows → bad-input table red with the thrown `unknown argument "extra"`; lambda `does not throw for bad event inputs` red with `unknown tool`.
  3. Unknown keys accepted → `list_commands {"extra":1} -> {"code":"internal",...}`, expected `invalid_argument`, actual `internal`.
  4. Search sorted by score only → tie-order test red: `templates/zed.md` before `templates/ace.md`.
  5. Core built inside `handler` → build-once test `expected: 1, actual: 0` on "built at module load".
- Timing (NFR-2): warm `get_command akili-constitution`, 20 calls × 3, one process: medians 0.67 / 0.64 / 0.63 ms (spread 0.04) in-suite; 0.81 / 0.78 / 0.75 ms (spread 0.06) standalone. Pass for the in-process budget; Lambda cold start stays with T6.
- Evidence re-run (Leader-inline): 121/121 · 1274/1274 · `node --check` ok · `package.json` unchanged. **VERIFIED**.
- Reviewer verdict: **FAIL** (2 issues):
  1. **Discovered Issue:** Search indexes the whole raw file at body weight: `put(tokenize(text), SEARCH_WEIGHTS.body)` in `getSearchIndex`, where `text` still includes the frontmatter. So frontmatter keys and values (`description`, `metadata`, `binding`, `license`, `author`, and so on) score as body matches in every command and skill. The snippet is taken from the body only (`snippetFor` scans `parseFrontmatter(text).body`), so those hits come back with the opening text and no match in it. Measured on the real package: `search {query:"description"}` returns every command at score 1 with snippets like `# Archive AKILI-SPECS Spec Archive…`. 48 results over 14 probe queries had a snippet holding no match, and every one came from a frontmatter-key token. **Violated Rule:** design.md §6 *Search* ("1 for **body text**"); requirements.md FR-2 *Search* ("a `snippet` of at most 200 characters **around the first match**"). **Remediation:** tokenize `fm.body` for the weight-1 field; add a fixture test that frontmatter keys do not match and every non-path hit's snippet holds a query token.
  2. **Discovered Issue:** In `NFR-3 invoking every tool…`, `loadHandler()` runs before `installSpies(counts)`. The module-scope `createCore` (the Lambda init and catalog build) therefore runs outside the spy window. The comment says the opposite. NFR-3's "no file write / no network / no process" is therefore unproven for the init path. **Violated Rule:** requirements.md §7 NFR-3; T2 scope (4) "spies at zero". **Remediation:** call `installSpies(counts)` before `loadHandler()`.
- Spec tension flagged by the Reviewer (advisory, settled as a Pivot-lightest amendment, see *Decisions*): requirements FR-3 said "stderr/CloudWatch", design §7.2 says `console.log` (stdout).
- runtime events: none.

#### Attempt 2: FAIL

- Files changed: `bin/mcp-core.js` (one line: body weight indexes `fm.body`), `test/mcp-core.test.js` (+17: frontmatter-key test), `test/mcp-lambda.test.js` (spies installed before `loadHandler()`).
- Implementer verification: two files → 122 pass · `npm test` → 1275 pass, 0 fail · `node --check` clean.
- Reds: (a) fix 1 reverted → `frontmatter key "description" must not match`, actual `[{ path: 'commands/fm.md', score: 1, snippet: '# Heading plain body words', title: 'fm' }]`. (b) correct order + a temporary module-scope `fs.writeFileSync` → NFR-3 red, actual `{ 'fs.writeFileSync': 1 }`; temporary write removed, file byte-identical.
- Not Done / Assumptions (verbatim): "I did not get a clean read on the wrong-order half of red (b). … The quoted red above is from the correct order, which is the one that proves coverage." / "Search hits that match only on `description` or `name` still get the opening-body snippet, which may hold no query token. That is the existing design fallback … so I left it." / "A first `sed -i` attempt failed on macOS syntax. It had no effect." — no owed item, no blocker: not a continuation.
- Evidence re-run (Leader-inline): 122/122 · 1275/1275 · `node --check` ok. **VERIFIED**.
- Reviewer verdict: **FAIL** (1 issue; attempt-1 issues and the FR-3 amendment confirmed closed):
  1. **Discovered Issue:** A hit whose only text match is in the frontmatter `description` or `name` still gets the opening-body snippet. `snippetFor` scans only the body. On the real package … (667 queries, 9,536 results). 190 results had a snippet holding no match, where the path did not hold the word either. Example: `search {query:"trigger"}` returns `skills/caveman/SKILL.md` (score 3, a description hit) with the snippet `# Caveman — Token-Economy Communication for Transi…`. … Design §6 defines no snippet fallback. Only a path-only hit has no text to quote. **Violated Rule:** requirements.md FR-2 *Search*: "a `snippet` of at most 200 characters around the first match". **Remediation:** build the snippet from `description` or `name` around the first matching token when the body has none; keep the opening-body fallback only for path-only hits; add a fixture test.
- runtime events: none.

#### Attempt 3: PASS

- Files changed: `bin/mcp-core.js` (`snippetFor` scans body → `description` → `name`, `makeSnippet` around the first token; opening-body fallback only for path-only hits), `test/mcp-core.test.js` (new fixture test for description-only, name-only and heading-only hits; the path-only fixture's `name: gamma` renamed `delta` so `gamma` stays path-only).
- Implementer verification: two files → 123 pass · `npm test` → 1276 pass, 0 fail · `node --check` ok.
- Red before the fix: `description hit snippet: # Opening heading nothing relevant in this body`, expected true, actual false.
- Real-package sanity (throwaway script in the session scratchpad, not in the repo): 673 queries, 9,638 results; non-path hits with no token in the snippet: 193 before, 0 after.
- Not Done / Assumptions (verbatim): "The sanity script treats a hit as path-only when the query word is a substring of the path, so it is slightly lenient there." / "When both description and name match, the description wins." — no owed item: not a continuation.
- Evidence re-run (Leader-inline): 123/123 · 1276/1276 · `node --check` ok · sanity script `bad: 0`. **VERIFIED**.
- Reviewer verdict: **PASS**. "Attempt 3 closes the last FAIL … I audited the whole T2 diff state, not only the 51-line delta, and found no remaining in-scope FAIL. FR-1, FR-2, FR-3 (as amended), NFR-2 and NFR-3 are met, and P-12/P-13 stay open for T6 as the task allows." Reviewer's own stricter sanity script (whole path tokens): 667 queries, 9,536 results, 0 bad. The `gamma` → `delta` rename keeps the path-only test exact.
- runtime events: none.
- spawns: Implementer (a1) 24 calls, 159,397 tokens, ended complete; Reviewer (a1) 10 calls, 112,847 tokens, ended fail; Implementer (a2) 8 calls, 83,481 tokens, ended partial (Not Done / Assumptions, no owed item); Reviewer (a2, resumed) 2 calls, 117,745 tokens, ended fail; Implementer (a3) 11 calls, 86,747 tokens, ended partial (assumptions only); Reviewer (a3, resumed) 1 call, 121,385 tokens, ended complete.

**ADVISORY (4R, recorded only, not tasks):**
- Reliability: when name and description both match, the snippet quotes the description; a literal file-order reading of "first match" would quote the name. Either holds a match.
- Readability: the test titled "get_command … with and without arguments" sweeps only the no-argument case (T1 covers the with-arguments case).
- Reliability (attempt 1): `list_skills` reports the frontmatter `name` while `get_skill` keys on the directory name (equal for all 29 today); a directory with no catalog files would be dropped from `list_skills`.
- Resilience (attempt 1): heading detection also matches `# comment` lines in fenced code blocks.
- Risk (attempt 1): `requestId` comes from client context and is capped at 128 chars.

**Requirements covered:** FR-1 (*Keys* through every tool), FR-2 (*Lists and lookups*, *Search*, *Errors and the version stamp*, paging sweep through `callTool`), FR-3 (both scenarios, as amended), NFR-2 (warm, in-process), NFR-3.

**Decisions made:**
- **Execute-time spec edit (2026-10-27, at attempt 1's gate):** `requirements.md` FR-3 *Gateway-shaped invocation*, line 164: "logs one line per call to stderr/CloudWatch" → "logs one line per call to CloudWatch (stdout, `console.log`; amended 2026-10-27 at T2 to match design §7.2)". Reason: the Reviewer showed FR-3 and design §7.2 could not both hold. In the Lambda Node runtime both streams reach CloudWatch, so the obligation (one line, five fields, no event or text) is unchanged; the stream named now matches the design. Settled under the maintainer's mandate (recommended option); carried to attempts 2 and 3's Reviewer as a named conformance check, and carried once more into T3's Reviewer brief.
- `get_file` on a `commands/` key returns the same text as `get_command` with no arguments; other areas are raw (FR-2 "the same text the specific tool would return").
- Search: a token counts the highest weight among the fields it appears in, and each distinct query token counts once; a query with no token of 2+ characters returns `results: []`, only empty or whitespace is `invalid_argument`; `limit < 1` is `invalid_argument`.
- Snippet: ≤ 200 chars around the first query token in body → description → name; path-only hits show the opening body.
- Log line: `tool` is a known tool name or `"unknown"`; `part` an integer or `null`; `requestId` capped at 128 chars. The handler is `async` and wraps the context lookup in try/catch.

**Issues encountered:** two review rounds were spent on search details the scenarios did not pin (frontmatter at body weight, then description-only snippets). Open by design for T6: P-12 (Gateway result mapping, the `toGatewayResult` seam) and P-13 (`context.clientContext.custom` in the Node runtime).

**Running totals (budget tripwire check):** tasks 2 of 7 (tripwire 9) · LOC ≈ 2,406 (T1 1,144 + T2 ≈ 1,262; tripwire 3,700) · review rounds T1 1, T2 3 (tripwire: past 3 on one task, so T2 reached it and did not exceed it). Under the tripwire. **Projection:** T1 and T2 ran ~1.9× their combined estimate (~1,260). The remaining T3–T5 estimate is ~1,710 LOC, so even at estimate the run reaches ~4,100 and will cross 3,700 during T3 or T4. That stop is reported at the gate where it happens.

**Final verification:** VERIFIED; Reviewer PASS. Continue gate: `auto-approved (pre-approved mode)`.
