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

### T3: CDK app (synth only), infra checks, CI `infra` job (PASS)

- Date: 2026-10-27. Attempts: 2. Final status: PASS (attempt 2).
- Skills: `aws-cdk`, `aws-serverless`, `aws-auth` (knowledge only), `security-audit` (guidance mode), as listed. Effort `high` → `xhigh` (attempt 2). Implementer `sonnet`. Review mode: **parallel lens reviewers** (the task touches IAM and auth, a security surface): Reviewer A conformance + reliability/readability, Reviewer B conformance + security/risk, both `opus`.
- No AWS call was made by any agent: synth is in-process (`new cdk.App()` + `Template.fromStack`), run with `env -i` and `AWS_EC2_METADATA_DISABLED=true`; no `cdk` CLI, no `aws` CLI, no SDK, no `aws-mcp` tool. Only public npm-registry installs and public documentation reads.

#### P-rows settled at step 1 (quotes raw-verified by the Leader with `curl` on 2026-10-27)

| Row | Verdict | Quote | Source |
|---|---|---|---|
| P-10 | Verified: `AWS::BedrockAgentCore::GatewayRateLimit` (`CfnGatewayRateLimit`); rate 0 is valid; the kill switch uses `UpdateGatewayRateLimit` | "Rate value range \| 0 to 10,000,000 (0 blocks all matching traffic)" · "Updates the entries of a gateway rate limit. The dimension keys are immutable after creation." | <https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway-rate-limits.md> · <https://docs.aws.amazon.com/bedrock-agentcore-control/latest/APIReference/API_UpdateGatewayRateLimit.md> |
| P-14 | Not refuted: no per-description limit documented; the schema (≈ 3 KB) is far under the cap | "Maximum inline schema size \| 1 MB" | <https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/bedrock-agentcore-limits.md> |
| P-15 | **Partly refuted**: localhost callback accepted; PKCE recommended, not enforced | "Amazon Cognito requires `HTTPS` over `HTTP` except for `http://localhost` for testing purposes only." · "…activate only the authorization-code grant OAuth flow, and implement Proof Key for Code Exchange (PKCE)…" | <https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-client-apps.md> |
| P-16 | Verified (SDK v3 bundled); whether that minor version includes `@aws-sdk/client-bedrock-agentcore-control` stays `UNVERIFIED` → T6 invokes the kill switch once | "All supported Lambda Node.js runtimes include a specific minor version of the AWS SDK for JavaScript v3, not the latest version." | <https://docs.aws.amazon.com/lambda/latest/dg/lambda-nodejs.md> |
| P-18 | Format verified (`TagKeyValue: ["user:project$akili-mcp"]`); activation stays with T7 | "User-defined tag keys must use the `user:` prefix." · CLI example `"TagKeyValue" : [ "user:Key$value1" , "user:Key$value2" ]` | <https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-create-filters.md> · <https://docs.aws.amazon.com/cli/latest/reference/budgets/create-budget.html> |

No High row was refuted: the Gateway, its `CUSTOM_JWT` authorizer and its Lambda target are all expressible as CloudFormation L1 resources. Not a Pivot.

#### Attempt 1: FAIL

- Files changed: `infra/mcp-gateway/package.json` (17; `aws-cdk-lib` 2.274.0, `constructs` 10.8.1, `aws-cdk` 2.1146.1, exact pins), `config.json` (11), `cdk.json` (3), `bin/app.js` (44), `lib/service-stack.js` (241), `lib/deploy-role-stack.js` (64), `lib/kill-switch.js` (34), `checks/helpers.js` (45), `checks/stack.check.js` (243), `package-lock.json` (303, generated, not counted), `.github/workflows/ci.yml` (+22: `Infra synth checks` job, `node --check` for `bin/mcp-core.js` and `bin/mcp-lambda.js`), `.gitignore` (+1 `cdk.out/`).
- Implementer verification: `npm ci && npm run check` (fresh `node_modules`, `env -i`) → 19 pass, 0 fail · root `npm test` → 1276 pass, 0 fail, no infra output · `git diff --stat package.json` empty · no 12-digit literal, no `docs/specs` reference.
- Falsifier reds (observed, reverted):
  1. Concurrency 50 in `config.json` → `not ok 1 - FR-4 function: Node 22, handler, concurrency 5…`, expected 5, actual 50.
  2. `"*"` in the deploy role → `not ok 16 - FR-4 deploy role: only bootstrap-role assume and the function alias; no wildcard action or resource`.
  3. Spike stack id = prod → `not ok 14 - FR-4 spike: distinct stack and resource names, no deploy role`, expected/actual `'akili-mcp-service'`.
  4. A check renamed to `infra/mcp-gateway/test/x.test.js` with `node_modules` moved aside → root `npm test` 1277 tests, 1 fail, `Error: Cannot find module 'aws-cdk-lib'` in `# Subtest: infra/mcp-gateway/test/x.test.js` (P-9 / DD-9 on the real tree).
- Evidence re-run (Leader-inline): fresh `npm ci` + `npm run check` → 19/19 · root 1276/1276, 0 infra lines · no 12-digit literal. **VERIFIED**.
- Reviewer B (security) verdict: **FAIL**, 1 issue:
  1. **Discovered Issue:** The kill-switch role is not limited to "those two resources". CDK attaches the managed policy `AWSLambdaBasicExecutionRole` (`KillSwitchServiceRole.ManagedPolicyArns`). That policy allows `logs:CreateLogGroup`, `logs:CreateLogStream` and `logs:PutLogEvents` on `Resource: "*"`. Check 16 ("no wildcard action or resource") does not catch this: `statements()` reads only inline `Policies` and `AWS::IAM::Policy`, never managed policies. The green result therefore claims a property the effective role lacks. **Violated Rule:** `design.md` §7.3, *Kill-switch Lambda* row: "Least-privilege role on those two resources only"; and FR-4, *Deploy role stack* scenario ("must NOT grant `*` … resources"). **Remediation:** explicit `iam.Role` with no managed policy, `grantWrite` on its own log group, plus the two brake statements; fail on any `ManagedPolicyArns`; red run.
- Reviewer A (conformance) verdict: **FAIL**, 3 issues:
  1. **Discovered Issue:** FR-4 still says the template holds a client with "authorization-code grant with PKCE". T3 amended design §7.3 … but left requirements.md unchanged. The two now contradict each other. **Violated Rule:** requirements.md FR-4 *Stack contents*, app-client bullet, against design.md §7.3 *App client* (as amended). **Remediation:** amend the FR-4 bullet as an execute-time spec edit. *(Leader-owned; fixed at the gate.)*
  2. **Discovered Issue:** P-10, P-14, P-16 and P-18 are settled only in the Implementer's report. execution.md has no T3 quotes, and the §12 ledger still marks all four `UNVERIFIED` … The §7.3 *Rate limits* row still offers "construct property … else L1 override … else AwsCustomResource". … the P-18 `$` joiner is documented after all. **Violated Rule:** tasks.md T3 Scope 1, "Quote each source in `execution.md`", and *Done*; design.md §12 and §7.3. **Remediation:** record quotes, update the ledger rows and the §7.3 row. *(Leader-owned; fixed at the gate and in the table above.)*
  3. **Discovered Issue:** The test titled "…code is the packed directory" only checks `S3Key.endsWith(".zip")`. Nothing ties the asset to `packageDir`, so the FR-4 term "whose code is that directory unchanged" is untested. **Violated Rule:** requirements.md FR-4, first bullet; tasks.md T3 Scope 3; reviewer.md, *presence-assertion is not a behavioral proof*. **Remediation:** assert the asset hash equals `cdk.FileSystem.fingerprint(packed.packageDir)`.
- Leader adjudication: B1 and A3 are in-scope code defects → attempt 2. A1 and A2 are spec-record work the Leader owns (Step 3, execute-time spec edits) → fixed at the gate, carried to attempt 2's Reviewers as named checks.
- runtime events: none.

#### Attempt 2: PASS

- Files changed: `lib/service-stack.js` (`lambdaRole(id, logGroup)` helper: explicit `iam.Role`, no managed policy, `grantWrite` on its own group; used by the kill switch with `KillSwitchLogs` and by the content function with `ContentLogs`, whose default role also carried `AWSLambdaBasicExecutionRole`), `checks/stack.check.js` (`statements()` fails on any `ManagedPolicyArns` outside the empty `MANAGED_POLICY_ALLOW`; the wildcard check is its own test over the prod, spike and deploy-role templates; the asset check asserts `S3Key === cdk.FileSystem.fingerprint(packed.packageDir) + ".zip"`).
- Implementer verification: `npm run check` → 20 pass, 0 fail · root `npm test` → 1276/1276, no infra output · `package.json` unchanged.
- Reds (observed, reverted byte-identical):
  - (a) managed policy re-added → `role ContentRole90291FB9 carries managed policy [... :iam::aws:policy/service-role/AWSLambdaBasicExecutionRole]` (the temporary edit was in the shared helper).
  - (b) `Resource: "*"` on `UpdateGatewayRateLimit` → only the wildcard test red (`Resource of bedrock-agentcore:UpdateGatewayRateLimit`, actual `'*'`); the action-list test stays green, so the wildcard check fires on its own. *(Leader-added check on falsifier 2's evidence quality, within the task's falsifier 2.)*
  - (c) code pointed at a one-byte-changed copy → test 1 red, actual `'592a360a…89b06f.zip'`, expected `'fc6da3e6…a96c.zip'`.
- Evidence re-run (Leader-inline): `npm run check` → 20/20 · root 1276/1276. **VERIFIED**.
- Reviewer B verdict: **PASS**. "There are three roles (content, gateway, kill switch), and none carries `ManagedPolicyArns`. The kill-switch role now matches design §7.3 … `grantWrite` … one statement, `["logs:CreateLogStream", "logs:PutLogEvents"]`, on `Fn::GetAtt <LogGroup>.Arn` … Leaving out `logs:CreateLogGroup` is correct, and safer." Content function unchanged except `Role`.
- Reviewer A verdict: **PASS**. "Attempt 2 clears all three of my attempt-1 issues, and I found no new conformance violation across the whole T3 state." Raw-checked every new §12 quote at its source.
- runtime events: none.
- spawns: Implementer (a1) 77 calls, 246,737 tokens, ended complete; Reviewer A (a1) 24 calls, 134,046 tokens, ended fail; Reviewer B (a1) 15 calls, 117,633 tokens, ended fail; Implementer (a2) 8 calls, 95,475 tokens, ended partial (assumptions only, no owed item); Reviewer A (a2, resumed) 3 calls, 143,408 tokens, ended complete; Reviewer B (a2, resumed) 2 calls, 125,182 tokens, ended complete.

**ADVISORY (4R, recorded only, not tasks):**
- Risk: the app client allows `ALLOW_USER_SRP_AUTH` (with `ALLOW_REFRESH_TOKEN_AUTH`); anyone with the public client ID can get tokens through `InitiateAuth`, skipping managed login, and the Gateway accepts them. No spec clause limits the client's auth flows (Reviewer B checked). Surfaced to the maintainer.
- Risk: the deploy role's effective power is whatever the bootstrap `cfn-exec-role` allows (AdministratorAccess by default) in the account shared with paolachicue; the `aws-mcp` environment's protection rules are the real gate (T4, T7).
- Risk: the CI `infra` job (like all of `ci.yml`) has no `permissions:` block; `persist-credentials: false` is not set.
- Resilience: the kill switch changes concurrency and rate entries outside CloudFormation; a later `cdk deploy` may restore template values and undo it. The T5 runbook should say how a release behaves while the switch is on.
- Resilience: the global limit keyed on `targetName` would become per target if a second target were added; concurrency 0 still covers it.
- Reliability: whether the runtime SDK includes `@aws-sdk/client-bedrock-agentcore-control` (P-16) is for T6; `packCheckout`/`synth` run at module load before `test.after`, so a synth throw leaks the temp dir.
- Readability: design §7.4 says `…-us-east-1` and a role wildcard; the code uses `${AWS::Region}` and three named bootstrap roles (narrower). The §12 summary counts are stale beside the appended note.

**Requirements covered:** FR-4 (both scenarios, synth), FR-6 (resources), NFR-1, NFR-6 (P-9 probe), NFR-7 (template scan), NFR-8 (config values).

**Decisions made:**
- **Execute-time spec edits (2026-10-27, T3):**
  - `design.md` §7.3 *App client*: "PKCE (Cognito enforces it for public clients, P-15)" → "PKCE is used by the client: Cognito supports PKCE but does not enforce it for public clients (corrected 2026-10-27 at T3, P-15); the stack's enforceable controls are code grant only, no secret and `allowedClients`, and the client's PKCE use is checked at T6". Reason: factual correction from the P-15 source.
  - `requirements.md` FR-4 *Stack contents*, app-client bullet: "authorization-code grant with PKCE" → "authorization-code grant only, with PKCE used by the client (Cognito does not enforce PKCE for public clients, P-15; amended 2026-10-27 at T3, the client's PKCE use is checked at T6)". Reason: keep FR-4 and §7.3 consistent (Reviewer A issue 1). The obligation on the template (code grant, no secret, public client) is unchanged.
  - `design.md` DD-8: "synth checks and the docs test read it" → "the stack and the docs test read it, and the synth checks pin the owner-decided values as literals…". Reason: T3 falsifier 1 (a `config.json` edit goes red) cannot hold if the checks read the config.
  - `design.md` §7.3 *Rate limits*: the fallback chain replaced by `AWS::BedrockAgentCore::GatewayRateLimit`, with the `targetName` key for the global limit.
  - `design.md` §12: P-10, P-14, P-15, P-16, P-18 rows updated with quotes; summary line note appended.
  - These are carried once more into T4's Reviewer brief.
- Stack names: `akili-mcp-service` (prod), `akili-mcp-deploy-role`, `akili-mcp-spike-service` (no deploy-role stack for the spike). T4's workflow and T5's docs name these.
- Global rate limit: dimension `targetName` = `akili` (the API needs a dimension key); coverage of `tools/list`/`ping` is for T6.
- Deploy role: three explicit bootstrap-role ARNs built from `${AWS::AccountId}` / `${AWS::Region}` (narrower than §7.4's wildcard); `oidcProvider` defaults to `import`.
- `CfnManagedLoginBranding` with Cognito defaults is included: Reviewer A cited the Cognito managed-login page ("Managed login isn't available for an app client created with an AWS SDK until you create one with a CreateManagedLoginBranding request"), so D-6 requires it. Budget `ResourceTags` included for FR-4 "every taggable resource".
- CI: `node --check` for the two existing bin files only; a guarded third line would break the Windows (PowerShell) leg, so **T4 adds `node --check scripts/mcp-deploy-guard.js`** (forward pointer to T4).

**Issues encountered:** none beyond the review findings. Open for the maintainer (T6/T7): P-11, P-12, P-13, the P-16 client check, `tools/list` coverage of the global limit, P-18 activation.

**Running totals (budget tripwire check):** tasks 3 of 7 (tripwire 9) · LOC ≈ 3,155 (T1 1,144 + T2 ≈ 1,262 + T3 749; lockfile 303 not counted; tripwire 3,700) · review rounds T1 1, T2 3, T3 2 (two parallel lens reviewers per round). Under the tripwire, with ≈ 545 LOC of headroom against T4's ~520 estimate and T5's ~420. T4 is expected to cross 3,700; the stop is taken at T4's gate if it does.

**Final verification:** VERIFIED; Reviewers A and B PASS. Continue gate: `auto-approved (pre-approved mode)`.

### T4: deploy guard script and `mcp-deploy.yml` (PASS)

- Date: 2026-10-27. Attempts: 1. Final status: PASS.
- Skills: `tdd`, `security-audit` (guidance mode, workflow injection), as listed. Effort `high`. Implementer `sonnet`. Review mode: **parallel lens reviewers** (credentialed CI and a command-injection surface): Reviewer A conformance + reliability/readability, Reviewer B conformance + security/risk, both `opus`.
- No agent ran the workflow, an AWS command, an npm registry call from the tests, or the GitHub API.

#### Attempt 1: PASS

- Files changed: `scripts/mcp-deploy-guard.js` (91, new), `.github/workflows/mcp-deploy.yml` (132, new), `test/mcp-deploy-guard.test.js` (88, new), `test/mcp-contract.test.js` (79, new; workflow part), `test/fixtures/mcp/guard-fixture.bin` (1 line, 21 bytes; `.bin` because `.gitignore` ignores `*.tgz`), `.github/workflows/ci.yml` (+1: `node --check scripts/mcp-deploy-guard.js`, closing T3's forward pointer).
- Implementer verification: two files → 14 pass, 0 fail · `npm test` → 1290 pass, 0 fail (1276 + 14) · `node --check scripts/mcp-deploy-guard.js` clean · `git diff --stat .github/workflows/release-notify.yml` empty. Both guard stubs assert the exact `npm view akili-specs@2.38.0 version --registry=https://registry.npmjs.org/` argument array (and the `dist.integrity` form).
- Falsifier reds (observed, reverted):
  1. Integrity compared with `startsWith` on the first 10 chars → `not ok 5 - verify compares the full sha512 integrity of the file`, expected 1, actual 0.
  2. `configure-aws-credentials` moved before the wait step → `not ok 6 - steps run in order: check-version, wait, verify, credentials, cdk deploy, smoke`.
  3. `${{ inputs.version }}` interpolated into the `wait` run line → `not ok 4 - no run: block interpolates an expression`.
  4. `-next.N` accepted by the version regex → `not ok 1 - check-version accepts only X.Y.Z`, expected false, actual true.
- Evidence re-run (Leader-inline): 14/14 · 1290/1290 · `node --check` ok · `release-notify.yml` diff empty · no `secrets.` in `mcp-deploy.yml`. **VERIFIED**.
- Reviewer A verdict: **PASS**. "T4 meets FR-5 and the CI half of FR-4 *Deploy role stack*." Checked the smoke shape against the real handler (plain envelope, 14 commands); all four execute-time spec edits consistent or untouched.
- Reviewer B verdict: **PASS**. "…the diff has no exploitable injection path and no spec violation." Probed `check-version "1.2.3\n"` → exit 2 and `verify` on `1.2.3; id` → exit 2; no `pull_request` trigger; the OIDC `sub` carries no ref, so the `aws-mcp` environment's `v*` tag rule (T7 step 2) is the real boundary.
- runtime events: none.
- spawns: Implementer 16 calls, 103,293 tokens, ended partial (assumptions only, no owed item); Reviewer A 7 calls, 93,818 tokens, ended complete; Reviewer B 5 calls, 84,800 tokens, ended complete.

**Unexercised workflow (Disqualifier, stated as T4 requires):** the YAML contract is a presence check. It proves the steps are written in order and shape, not that GitHub runs them as intended or that AWS accepts the calls. Unverified until T7's first run: the client-context encoding (P-13, T6), the `--cli-binary-format` and `--payload '{}'` invoke flags, the `tar --strip-components=1` layout, and `npx cdk` resolving from `infra/mcp-gateway`'s `npm ci`.

**ADVISORY (4R, recorded only, not tasks):**
- Risk: `npm ci` in `infra/mcp-gateway` runs after `configure-aws-credentials`, so dependency install scripts run with live deploy credentials (and the bootstrap exec role may be AdministratorAccess). `npm ci --ignore-scripts`, or installing before the credentials step, would close it. Surfaced to the maintainer.
- Risk: `aws-actions/configure-aws-credentials@v4` is pinned by tag, not commit SHA, while it runs with `id-token: write`.
- Risk (T7): create the `aws-mcp` protection as a **tag** rule (`v*`), not a branch pattern; consider a required reviewer; a manual dispatch must pick a `v*` tag as its ref.
- Reliability: `wait` bounds the poll count (40 × 15 s), not wall-clock; with npm latency it can run slightly past FR-5's 10 minutes, and `execFileSync` has no `timeout`, the job no `timeout-minutes`.
- Reliability: `get-alias … 2>/dev/null || true` turns AccessDenied or a throttle into an empty previous version, so a red smoke would report "nothing to roll back" on an existing stack.
- Reliability: `main()`'s positional-argument mapping has no tests.
- Resilience: an unset `vars.AKILI_MCP_ALERT_EMAIL` fails red inside `cdk deploy`, after credentials; a failed `cdk deploy` skips smoke and relies on CloudFormation rollback; an alias rollback drifts from CloudFormation until the next deploy; GitHub concurrency replaces a pending run.
- Readability: `workflow_dispatch` checks out `github.ref`; the Summary step calls `get-alias` even after an early failure; a non-`vX.Y.Z` tag fails red even when no role is configured.

**Requirements covered:** FR-5 (*Stable release deploys*, *Guards fail red and keep the previous version*, *Manual redeploy or rollback*: logic and wiring; the real run is T7), FR-4 *Deploy role stack* (CI deploys only `akili-mcp-service`).

**Decisions made:**
- `alertEmail` reaches `cdk deploy` as `AKILI_MCP_ALERT_EMAIL: ${{ vars.AKILI_MCP_ALERT_EMAIL }}` on the deploy step only (FR-5 and §7.7 are silent; `vars.` keeps the no-`secrets.` contract). The maintainer adds that variable to the `aws-mcp` environment at T7.
- The version is validated by `check-version` before it is written to `GITHUB_ENV`; a release tag without a leading `v` is rejected.
- The role gate is a step output (`steps.gate.outputs.deploy`) gating every later step, not a job-level `if:` (environment-scoped variables are not readable there).
- Workflow is 132 lines against the 110 estimate (rollback and summary steps).

**Issues encountered:** a stray copy of the script landed in a pre-existing `/tmp/x` from an early command; the Implementer deleted its file and left the directory's other contents alone.

**Running totals (budget tripwire check):** tasks 4 of 7 (tripwire 9) · LOC ≈ 3,547 (T1 1,144 + T2 ≈ 1,262 + T3 749 + T4 392; lockfile not counted; tripwire 3,700) · review rounds T1 1, T2 3, T3 2, T4 1. **Under the tripwire by ≈ 153 LOC.** T5's scope (~300 LOC docs + ~120 LOC test) cannot fit in 153 LOC, so T5 is certain to push the run past 3,700. **Budget tripwire: stop before T5 and escalate to the maintainer** (see *Stop: budget tripwire before T5* below).

**Final verification:** VERIFIED; Reviewers A and B PASS. Not auto-approved past this gate: budget tripwire stop.

## Stop: budget tripwire before T5 (2026-10-27)

> "No mandate widens pre-approval: an owner brief that says "never stop" or "treat every gate as approved" pre-approves routine gates only. The exceptions in `/akili-propose` Step 1 *Approval Mode* (HALT, Pivot, budget tripwire, `FATAL_FAIL`, `PRODUCT_BUG`, destructive actions) still stop, and the stop message quotes this sentence." (`/akili-execute` Step 2.4, *Budget Tripwire*)

| Measure | Budget (design §10) | Tripwire | Actual after T4 | T5 estimate | Projected after T5 |
|---|---|---|---|---|---|
| Tasks | 7 | 9 | 4 done | +1 | 5 of 7 |
| LOC | ~2,900 | 3,700 | ≈ 3,547 | ~420 | ≈ 3,970 (≈ +270 past the tripwire) |
| Review rounds | 12 | 3 on one task | 7 (T2 reached 3, did not exceed) | 2 | 9 |

**Cause:** root test code. T1 and T2 shipped ≈ 1,640 LOC of tests against ≈ 800 estimated, the pattern KZ-bugfix--init-ctrlc-abort-2 records (one assertion per clause). Production code ran close to estimate (core + handler ≈ 731 vs 440; CDK ≈ 700 vs 740; guard + workflow 223 vs 260).

**Decision owed to the maintainer:** continue with T5 at an expected ≈ 3,970 LOC, or stop here. Nothing past T4 has started.
