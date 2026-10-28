# Tasks: remote AKILI MCP on AgentCore Gateway + Lambda

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/methodology-mcp/gateway-lambda` |
| Depth | Full |
| Status | Phase 3 gate: awaiting the owner's **final spec approval** |
| Budget (design §10) | **7 tasks · ~2,900 LOC · 12 review rounds**. Stop and escalate past 9 tasks, 3,700 LOC, or 3 rounds on any task |
| Commit prefix | `[SPEC:changes/methodology-mcp/gateway-lambda]`. Agents make local commits only. No push, merge, tag, release or `npm publish`, and **no AWS command of any kind** (no CLI, CDK deploy, `sts` or SDK call against any account). `cdk synth` runs offline and is allowed |
| Baselines (as run 2026-10-27 at `174299c`) | `npm test` → 1153 tests, 1153 pass, 0 fail · `bin/mcp-*`, `scripts/mcp-*`, `infra/`, `docs/mcp.md`, `.github/workflows/mcp-deploy.yml` do not exist (`ls` → no matches) |
| Runtime | Node `v22.12.0` locally; Node 18 and Windows are owned by each PR's CI legs |
| Owner gates | T6 needs D-8(i). T7 needs D-8(ii), then D-8(iii), each recorded in `execution.md` with date and wording (FR-8) |

## 2. Task Graph

```
T1 core ──► T2 tools + handler ──► T3 CDK app + infra CI ──► T4 guard + workflow ──► T5 docs
                                          │                                            │
                                          └──► T6 spike (owner, HITL) ──────────────────┴──► T7 role + production (owner, HITL)
```

- T6 can start as soon as T3 is committed, and runs in parallel with T4 and T5 because the owner runs it.
- A T6 refutation of P-11 or P-12 is a **Pivot** (`/akili-execute` *Pivot Protocol*). T4, T5 and T7 then wait for the owner.
- T7 needs a **published minor release** that contains `bin/mcp-lambda.js`, because the deploy ships the npm tarball (DD-3). That release is the owner's normal Release Rules flow, not a task here.

**PR strategy:** ~2,900 LOC, so **two PRs into `dev`** from one feature branch:

- **PR 1 = T1 + T2** (shipped package code, ~1,500 LOC with tests). Review `bin/mcp-core.js` lookups first (path safety), then paging, then the handler.
- **PR 2 = T3 + T4 + T5** (infra, workflow, docs, not shipped except `docs/mcp.md`). It links PR 1 and says the endpoint is not live until T7.
- T6/T7 change at most `docs/mcp.md` (URL and client ID) and `docs/infrastructure.md`, in a small follow-up PR.

## 3. Coverage (clause level)

| Clause | Owner |
|---|---|
| FR-1 *Catalog equals the tarball*: pack-list parity · `scripts/` exactly two · `akiliVersion` = package version · BUT no symlink/dotfile/out-of-area file · AND IT MUST metadata only | T1 |
| FR-1 *Keys are the only way in*: each hostile form → `not_found`, no read · BUT never path-joined | T1 (guard), T2 (every path-taking tool) |
| FR-2 table: seven tools, inputs and result fields | T1 (`list_commands`, `get_command`), T2 (other five) |
| FR-2 *Command text rendered*: replace · empty · appended `ARGUMENTS:` line · `skills` · `usage` on part 1 (five obligations) · BUT no other alteration | T1 |
| FR-2 *Paging*: ≤ 30,000 · `1 ≤ part ≤ parts` · byte-exact rejoin · line-break cuts · AND IT MUST ≤ 40,000 serialized, every file and part · default part 1 · out-of-range → `invalid_argument` with `parts` | T1 (pager, all-files sweep), T2 (sweep re-run through `callTool` for every tool) |
| FR-2 *Lists and lookups*: 14 commands with frontmatter and `parts` · skills with `binding`/`null` and `files` · unknown `file` lists files · seven template names · `get_file` same text · AND IT MUST `not_found` + valid names | T1 (`list_commands`), T2 (the rest) |
| FR-2 *Search*: ≤ `limit` · key/title/snippet ≤ 200/score · sort · deterministic · empty → `invalid_argument` · clamp 20 · BUT no external call | T2 |
| FR-2 *Errors and the version stamp*: `akiliVersion` always · error shape and four codes · wrong type/missing/unknown argument · unknown tool or no `___` → `unknown_tool` · BUT no throw, no stack trace or path | T2 |
| FR-3 *Gateway-shaped invocation*: dispatch · catalog once per process · one log line with five fields · BUT never logs event/arguments/query/text · missing `clientContext` → `unknown_tool` | T2 |
| FR-3 *Direct smoke invocation* | T2 (unit), T7 (real) |
| FR-4 *Stack contents*: each of the nine bullets · values from context/env, never committed · BUT no account ID/ARN/secret/`NONE` · AND IT MUST synth `stage=spike` with distinct names | T3 |
| FR-4 *Deploy role stack*: trust on the `aws-mcp` environment only · the two permission groups · BUT no `*` grants · not deployed by CI | T3 (synth), T4 (workflow deploys the service stack only) |
| FR-5 *Stable release deploys*: npm-wait ≤ 10 min · integrity · OIDC deploy of the unpacked tarball · smoke version + 14 · summary | T4 (logic and wiring), T7 (real run) |
| FR-5 *Guards fail red*: no npm version → red before AWS · integrity → red before AWS · smoke red → alias rollback + fail · BUT prerelease or non-`vX.Y.Z` never deploys · AND IT MUST skip green without the role variable | T4 |
| FR-5 *Manual redeploy*: same guards · AND IT MUST reject a non-semver version | T4 |
| FR-6 *Limits and kill switch*: per-user throttle · budget 100 % → rate 0 + concurrency 0 + email · manual switch < 1 min · reset · BUT docs say cost brake, not guarantee | T3 (resources, synth), T5 (runbook and wording), T6 (per-user throttle, manual switch timing), T7 (budget path) |
| FR-7 *Docs*: `docs/mcp.md` contents (setup command, example, seven tools, no slash commands, Node for CLI steps, privacy, client table) · `docs/infrastructure.md` five additions · checklist line · README row + CHANGELOG · placeholders until T7 · BUT no ID/ARN/secret, no unsourced client claim | T5 (T7 fills URL and client ID) |
| FR-8 *Gated rollout*: no agent AWS call · three recorded OKs · spike destroyed and recorded first | every task (no AWS call); T6, T7 (OKs, destroy, record) |
| NFR-1 | T1, T2 (no root dependency; `git diff package.json` empty), T3 (deps in `infra/` only) |
| NFR-2 | T2 (warm handler timing locally), T6 (cold start in AWS) |
| NFR-3 | T2 (fs-write, net and `child_process` spies) |
| NFR-4 | T5 (`npm pack --dry-run --json` assertion in `test/mcp-contract.test.js`) |
| NFR-5 | T1–T5 (no test or shipped file cites the spec folder; contract test greps for it) |
| NFR-6 | T3 (root `npm test` ignores infra checks), T5 (full local run), PR CI |
| NFR-7 | T5 (tracked-files scan in `test/mcp-contract.test.js`), T3 (synth template scan) |
| NFR-8 | T3 (config values that produce the bound), T5 (docs state the bound) |
| NFR-9 | T5 |

## 4. Tasks

### T1: content core: catalog, path guard, rendering, paging, `list_commands`, `get_command`

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | L (~260 LOC code, ~380 LOC test) |
| Depends on | none |
| Requirements | FR-1 (all), FR-2 (*Command text rendered*, *Paging*, `list_commands`, `get_command`), NFR-1, NFR-5 |
| Design refs | §5, §6, §7.1, DD-1, DD-6, P-2, P-3, P-4, P-6 |
| Consumers | none in tests (new file). `bin/akili.js:76` is read, never changed |
| Review | `full`: new path-safety code on a public endpoint |
| Skills | `tdd` (expected values from the FR-1/FR-2 scenarios), `error-handling-patterns` |

**Scope.**

1. `bin/mcp-core.js`:
   - `createCore`, the catalog walk (`lstat`, skip symlinks and dotfiles), `parseFrontmatter`, `renderCommand`, `pageText`;
   - `TOOL_DEFINITIONS` for all seven tools, with handlers for `list_commands` and `get_command`, the other five stubbed to `internal`;
   - the `usage` block and skill-name detection (§6).
2. `test/mcp-core.test.js`:
   - **Parity:** the catalog keys equal the `npm pack --dry-run --json` entries of the three areas plus the two scripts; the script list equals `RESOURCE_SCRIPTS` read from `bin/akili.js` as text.
   - **Hostile paths:** each FR-1 form (`..`, `%2e%2e`, absolute, backslash, `C:`, empty, `package.json`, `bin/akili.js`) → `not_found`, with an `fs.readFileSync`/`openSync` spy recording zero reads.
   - **Catalog walk:** a fixture tree under `test/fixtures/mcp/` holding a symlink (created in the OS temp dir at test time; skipped with a printed reason where symlinks are not permitted), a dotfile and an out-of-area file → excluded.
   - **Rendering:** `akili-propose` with and without `arguments`; `akili-audit` (no `$ARGUMENTS`) with `arguments` → one appended `ARGUMENTS:` line; without → unchanged; the frontmatter removed and nothing else changed (compared with the file text minus its frontmatter block).
   - **Paging sweep over every catalog file:** rejoin is byte-exact, each `text` ≤ 30,000, each serialized part result ≤ 40,000; cuts land after `\n` except on a single-line fixture longer than 30,000; a fixture with a surrogate pair at the boundary is not split.
   - **`list_commands`:** 14 entries, sorted, with frontmatter fields and `parts` (`akili-constitution` → 5).
   - **`get_command`:** `part` default, out-of-range → `invalid_argument` with `parts`; `usage` only on part 1, with its five obligations; `skills` sorted and unique.

**Verification.** `node --test test/mcp-core.test.js` → all pass · `npm test` → 0 fail · `git diff --stat package.json` → empty.

| Verification field | Value |
|---|---|
| Falsifier | (1) Resolve keys with `path.join(packageDir, '.claude', key)` instead of `Map.get` → the `package.json`/`..` cases read a file: spy count > 0, red. (2) Cut parts at exactly 30,000 without the line-break rule → the line-break assertion red on `akili-constitution`. (3) Replace only the first `$ARGUMENTS` → `akili-archive` (6 occurrences) red. (4) Remove the dotfile skip → the fixture dotfile appears, red |
| Red run | `predicted — greenfield artifact (observed in T1)`. Each of the four reds is observed by applying the mutation to the T1 code and quoted in `execution.md` before the task closes |
| Disqualifier | A parity test that builds both sides with the same walk is circular: the expected side must be `npm pack --dry-run --json` output. A hostile-path test with no read spy proves only the error code, not that no file was read. A paging test over fixtures only (not every catalog file) does not prove the ≤ 40,000 property |
| Consumers | none |

**Done.** Verification holds; four reds quoted; one commit.

### T2: remaining tools, search, errors, Lambda handler

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | L (~200 LOC code, ~420 LOC test) |
| Depends on | T1 |
| Requirements | FR-1 (*Keys*, through every tool), FR-2 (*Lists and lookups*, *Search*, *Errors*, the paging sweep through `callTool`), FR-3 (all), NFR-2 (warm), NFR-3 |
| Design refs | §5, §6 *Search*, §7.1, §7.2, DD-2, DD-5, P-5, P-13 |
| Consumers | `test/mcp-core.test.js` (T1's stubs replaced); P-8 files re-run: `test/akili-marketing-docs.test.js`, `test/diagram-design.test.js`, `test/akili-review-contract-coverage.test.js`, `test/release-status.test.js` |
| Review | `full`: public input validation and logging privacy |
| Skills | `tdd`, `error-handling-patterns` |

**Scope.**

1. `bin/mcp-core.js`:
   - `list_skills`, `get_skill`, `get_template`, `get_file`, `search`;
   - argument validation (type, required, unknown key) and the error envelope;
   - the `callTool` catch-all mapped to `internal`.
2. `bin/mcp-lambda.js`: the handler (§7.2), with the `custom`/`Custom` lookup and one JSON log line.
3. `test/mcp-core.test.js` additions:
   - every lookup clause;
   - search: ordering, determinism, 200-char snippet, clamp, empty query;
   - a table of bad inputs for every tool (wrong type, missing, unknown key, hostile path), each → the right code, with no `stack` or absolute path in the serialized result;
   - the paging sweep re-run through `callTool` for every file-returning tool.
4. `test/mcp-lambda.test.js`:
   - a Gateway-shaped event and context for each tool;
   - no `___` → `unknown_tool`; missing `clientContext` → `unknown_tool`;
   - the catalog built once (a `createCore` call counter across two invocations);
   - captured `console.log` holds exactly the five fields and never the `arguments`/`query` values (sentinel strings);
   - spies on `fs.writeFileSync`/`writeFile`, `http(s).request`, `net.connect` and `child_process.*` stay at zero calls;
   - a warm call ≤ 100 ms median over 20 calls of `get_command`, measured three times. Reported, not asserted, if the spread is wider than the effect.

**Verification.** `node --test test/mcp-core.test.js test/mcp-lambda.test.js` → all pass · `npm test` → 0 fail · `node --check bin/mcp-lambda.js`.

| Verification field | Value |
|---|---|
| Falsifier | (1) Log `JSON.stringify(event)` in the handler → the sentinel case red. (2) Let `callTool` rethrow → the bad-input table red (the handler throws). (3) Accept unknown argument keys → the unknown-key row red. (4) Sort search results by score only → the tie-ordering determinism case red. (5) Build the core inside `handler` → the build-once counter red |
| Red run | `predicted — greenfield artifact (observed in T2)`. Each red is observed with its mutation and quoted in `execution.md` |
| Disqualifier | A log-privacy test whose sentinel never reaches the handler's input proves nothing: the sentinel must be in `event.arguments` and `event.query`. A timing number from a single run, or with a spread wider than its distance to 100 ms, is reported as inconclusive, not as a pass. A unit test cannot show what Gateway sends (P-13) or how it maps the result (P-12); those stay open for T6 |
| Consumers | as in the table above |

**Done.** Verification holds; reds quoted; one commit. **PR 1 boundary.**

### T3: CDK app (synth only), infra checks, CI `infra` job

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | L (~420 LOC CDK, ~320 LOC checks, ~30 LOC CI) |
| Depends on | T2 (`TOOL_DEFINITIONS`, handler path) |
| Requirements | FR-4 (all), FR-6 (resources), NFR-1 (root unchanged), NFR-6 (discovery), NFR-7 (template scan), NFR-8 (config values) |
| Design refs | §7.3, §7.4, §7.5, §7.8, DD-4, DD-7, DD-8, DD-9, DD-11, DD-12, P-9, P-10, P-14, P-15, P-16, P-18, P-23 |
| Consumers | `.github/workflows/ci.yml` (existing `cli` job gains `node --check` lines) |
| Review | `full`: least-privilege IAM and auth configuration |
| Skills | `aws-cdk`, `aws-serverless`, `aws-auth` (knowledge only), `security-audit` (guidance mode, IAM review) |

**Scope.**

1. **First step, settle P-10, P-14, P-15, P-16, P-18** from the AWS/CDK documentation and the installed `aws-cdk-lib` type definitions, with no AWS call:
   - the rate-limit property or API, and whether it can set the global rate to 0;
   - the tool description limit;
   - the public-client PKCE and localhost callback rules;
   - whether the Node 22 runtime bundles SDK v3;
   - the budget tag-filter format.

   Quote each source in `execution.md`. A refuted row with High impact is a Pivot. The Low rows adjust the stack.
2. `infra/mcp-gateway/`:
   - `package.json` with pinned versions and a lockfile;
   - `config.json`;
   - `bin/app.js`, `lib/service-stack.js`, `lib/deploy-role-stack.js`, `lib/kill-switch.js`.
3. `infra/mcp-gateway/checks/`:
   - a helper that `npm pack`s the checkout into a temp dir and unpacks it;
   - synth of `stage=prod` and `stage=spike` with `AKILI_MCP_ALERT_EMAIL=alerts@example.invalid`;
   - `aws-cdk-lib/assertions` checks: one assertion per FR-4 bullet (runtime, handler, concurrency 5, alias, 14-day retention, pool and client settings, `CUSTOM_JWT` + `allowedClients`, target name `akili` and seven inline tools equal to `TOOL_DEFINITIONS`, both rate limits, budget 20 with 80/100 notifications, tags, `akili-mcp` names);
   - spike names ≠ prod names;
   - the role trust `sub` equals the `aws-mcp` environment, and no policy statement has `Action: "*"` or `Resource: "*"`;
   - a raw template scan: no 12-digit literal in an ARN or account field, no `NONE` authorizer, and the example email appears only where passed;
   - synth throws when the `version` context ≠ `package.json` version.
4. `.github/workflows/ci.yml`:
   - a new `infra` job (ubuntu, Node 22, `npm ci && npm run check` in `infra/mcp-gateway`);
   - `node --check` lines for `bin/mcp-core.js`, `bin/mcp-lambda.js` and `scripts/mcp-deploy-guard.js` (the last one added in T4).

**Verification.** `npm --prefix infra/mcp-gateway ci && npm --prefix infra/mcp-gateway run check` → all pass, offline synth only · root `npm test` → 1153 + T1/T2 tests, 0 fail, with no infra check in its output (P-9) · `git diff --stat package.json` → empty.

| Verification field | Value |
|---|---|
| Falsifier | (1) Set reserved concurrency to 50 in `config.json` → the concurrency assertion red. (2) Add `Action: "*"` to the deploy role → the wildcard scan red. (3) Hard-code the spike stack name equal to prod → the distinct-names check red. (4) Rename one check to `infra/mcp-gateway/test/x.test.js` → root `npm test` discovers it and fails on the missing `aws-cdk-lib`, proving DD-9's naming matters (P-9) |
| Red run | `predicted — greenfield artifact (observed in T3)` for 1–3. Falsifier 4 is the P-9 probe already observed at specify time (Node 22.12: only `test/` files discovered); T3 repeats it on the real tree and quotes it |
| Disqualifier | A synth assertion proves the template, not AWS behavior: a passing rate-limit assertion does not show throttling (that is T6), and a passing budget assertion does not show the tag is activated (that is T7). A check run with `aws-cdk-lib` resolved from a global or parent `node_modules` is not evidence for CI; run `npm ci` in `infra/mcp-gateway` first |
| Consumers | `.github/workflows/ci.yml` |

**Done.** Verification holds; P-rows settled with quotes; reds quoted; one commit.

### T4: deploy guard script and `mcp-deploy.yml`

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M (~150 LOC script, ~110 LOC workflow, ~260 LOC test) |
| Depends on | T3 |
| Requirements | FR-5 (all), FR-4 *Deploy role stack* (CI deploys only the service stack) |
| Design refs | §7.6, §7.7, DD-3, DD-10 |
| Consumers | `.github/workflows/release-notify.yml` (same trigger; unchanged, and must stay unchanged) |
| Review | `full`: CI with cloud credentials; command-injection surface |
| Skills | `tdd`, `security-audit` (guidance mode, workflow injection) |

**Scope.**

1. `scripts/mcp-deploy-guard.js` with `check-version`, `wait`, `verify` and `smoke` over injected runners (§7.6); `execFileSync` with an argument array.
2. `test/mcp-deploy-guard.test.js`:
   - **versions:** `2.38.0` ok; `2.38.0-next.1`, `v2.38.0`, `2.38`, `1.2.3; rm -rf /` rejected;
   - **wait:** the version appears on poll 3 → 0, with fake sleep; never appears → 1 after timeout, with the poll count = timeout/interval;
   - **verify:** the real sha512 of a fixture file vs a matching and a non-matching integrity string;
   - **smoke:** right version and 14 → 0; wrong version, 13 commands, or an `error` envelope → 1.
3. `.github/workflows/mcp-deploy.yml` per §7.7.
4. `test/mcp-contract.test.js` (workflow part), a text contract on the YAML:
   - the trigger and prerelease guard;
   - `environment: aws-mcp`, `id-token: write`, and no `secrets.` reference;
   - the version passes only through `env:`, with no `${{` inside any `run:` block that uses it;
   - step order: `check-version` < `wait` < `verify` < `configure-aws-credentials` < `cdk deploy` < `smoke`;
   - the role-variable skip step present; the deploy names only the service stack.

**Verification.** `node --test test/mcp-deploy-guard.test.js test/mcp-contract.test.js` → pass · `npm test` → 0 fail · `node --check scripts/mcp-deploy-guard.js`.

| Verification field | Value |
|---|---|
| Falsifier | (1) Compare integrity with `startsWith` on the first 10 chars → the non-matching-suffix fixture red. (2) Move the `configure-aws-credentials` step before `verify` → the step-order contract red. (3) Interpolate `${{ inputs.version }}` into a `run:` line → the injection contract red. (4) Accept `-next.N` in `check-version` → the prerelease row red |
| Red run | `predicted — greenfield artifact (observed in T4)`. Each red is observed with its mutation and quoted |
| Disqualifier | The YAML contract is a **presence** check: it proves the steps are written in order, not that GitHub runs them as intended or that AWS accepts the calls. The real proof is T7's first run, and until then the workflow is unexercised, which T4 states in `execution.md`. A guard test whose stub `run` ignores its arguments cannot catch a wrong `npm view` field; the stub asserts the exact argument array |
| Consumers | `.github/workflows/release-notify.yml` (unchanged: `git diff --stat` on it empty) |

**Done.** Verification holds; reds quoted; one commit.

### T5: docs, CHANGELOG, contract scans, full verification

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M (~300 LOC docs, ~120 LOC test) |
| Depends on | T4 |
| Requirements | FR-6 (docs wording), FR-7 (all), NFR-4, NFR-5, NFR-6, NFR-7, NFR-8, NFR-9 |
| Design refs | §7.5, §11, DD-8, P-7, P-8, P-17, P-21 |
| Consumers | `test/docs-overview.test.js:311,458-470` (README *Learn more* first row and `docs/README.md` *Start Here* first link: rows are appended, P-7); `test/branching-flow.test.js:126-208` (`docs/release-checklist.md` sections; the new line must keep them green) |
| Review | `full`: claims about AWS behavior, cost and clients need a quote-check (KZ-002) |
| Skills | `cognitive-doc-design` |

**Scope.**

1. **First step, settle P-21 and P-17:** cite the AWS Budgets update-frequency page and the Cognito email-sending limits page in `execution.md`, and word the docs from those quotes.
2. `docs/mcp.md`:
   - every FR-7 item, with `<gateway-url>` and `<client-id>` placeholders;
   - an *"Not live yet"* note;
   - the `callbackPort` from `config.json`;
   - the cost-brake wording of FR-6.
3. `docs/infrastructure.md`:
   - the resources;
   - the manual kill switch, the reset and the alias rollback runbooks (commands the owner runs, with `--profile CREDINOVA`);
   - cost-allocation tag activation;
   - "only the owner deploys outside CI".
4. `docs/release-checklist.md`: the *MCP Deploy* line after `gh release create`. `docs/README.md` *Start Here*: append an `MCP` link. `README.md` *Learn more*: append a row. `CHANGELOG.md` `Unreleased`: one entry, with no spec-folder path.
5. `test/mcp-contract.test.js` additions:
   - **pack list:** `npm pack --dry-run --json` contains `bin/mcp-core.js`, `bin/mcp-lambda.js` and `docs/mcp.md`, and nothing under `infra/`, `scripts/mcp-deploy-guard.js` or `test/` (NFR-4);
   - **tracked-files scan** (`git ls-files`): no `arn:aws:…:<12 digits>:` and no `"account": "<12 digits>"` (NFR-7);
   - no shipped file or test cites `docs/specs/changes/methodology-mcp` (NFR-5);
   - `docs/mcp.md` states the `callbackPort` and rate values equal to `config.json` (DD-8).
6. **Full verification:** `npm test`, `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check`, `git diff --stat package.json` empty, and the infra `check` again.

**Verification.** All of item 6 holds.

| Verification field | Value |
|---|---|
| Falsifier | (1) Put a fake `arn:aws:iam::123456789012:role/x` in `docs/mcp.md` → the NFR-7 scan red. (2) Change `callbackPort` in `config.json` only → the DD-8 docs-equality check red. (3) Insert the README row as the first *Learn more* row → `docs-overview.test.js:458` red (an existing test, observable now) |
| Red run | Falsifier 3 runs against an existing test and is observed at T5 before the final row placement, and quoted. 1–2: `predicted — greenfield artifact (observed in T5)` |
| Disqualifier | Docs passing their tests proves structure, not truth: each AWS-behavior and cost sentence needs its quoted source in `execution.md`, and the Reviewer quote-checks them. The account-ID scan proves only the patterns it encodes; a role ARN split across lines or written without `arn:` is outside it, so the Reviewer also reads the new docs whole |
| Consumers | as in the table above |

**Done.** Verification holds; sources quoted; reds quoted; one commit. **PR 2 boundary.**

### T6: sandbox spike (owner-gated, HITL)

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | owner session, ~1–2 h; ~0–40 LOC follow-up |
| Depends on | T3 (stack), the owner's **D-8(i) OK** |
| Requirements | FR-8 (spike gate, destroy, record), FR-6 (per-user throttle, manual switch), NFR-2 (cold start), and settling P-11, P-12, P-13, P-14, P-15, P-17 in AWS |
| Design refs | DD-5, DD-11, §7.5, P-11, P-12, P-13 |
| Consumers | none |
| Review | `checklist`: an owner-run procedure. The Leader audits the record against the checklist below; there is no code diff unless a fix follows, and a fix gets its own `full` review |
| Skills | `aws-cdk`, `aws-auth` (knowledge only) |

**Checklist.** The **owner** runs every AWS command with the `docs/infrastructure.md` profile. The agent may prepare commands and read pasted output, and never runs them.

1. Record the D-8(i) OK in `execution.md`.
2. Pack the branch and `cdk deploy` the spike stack (`stage=spike`).
3. `claude mcp add --transport http --client-id <spike id> --callback-port <port> akili-spike <url>`, then `/mcp`: sign up, verify the email, sign in. **P-11.**
4. Call each of the seven tools from Claude Code. Record the raw `tools/call` result shape for `get_command akili-constitution part 5` and for an error. **P-12 and P-13.**
5. An unauthenticated `curl` → 401 with `resource_metadata` (success criterion).
6. 61 calls in a minute → throttled; the manual kill switch → refused within 1 minute; reset → restored.
7. Cold-start duration from the Lambda log (NFR-2).
8. `cdk destroy` the spike stack, and confirm in the console that no `akili-mcp-spike` resource remains.

**Verification.** Every checklist item has pasted evidence in `execution.md`.

| Verification field | Value |
|---|---|
| Falsifier | Sign-in fails, or a tool result arrives truncated or wrapped differently from DD-5 → P-11 or P-12 refuted → Pivot, with the proposal §10.2 fallbacks presented to the owner |
| Red run | n/a: an environment check, not a test |
| Disqualifier | A sign-in through `mcp-remote` or any proxy does not settle P-11. A result checked only by direct Lambda invoke does not settle P-12; it must come through the Gateway to Claude Code |
| Consumers | none |

**Done.** The checklist is evidenced, the spike is destroyed, and P-rows are updated with the observed results. Any fix is committed under its own review.

### T7: OIDC role and production rollout (owner-gated, HITL)

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | owner session; ~10 LOC docs (URL, client ID) |
| Depends on | T4, T5, T6; a published minor release containing `bin/mcp-lambda.js`; the owner's **D-8(ii)** then **D-8(iii)** OKs |
| Requirements | FR-5 (real run), FR-3 *Direct smoke* (real), FR-6 (budget path, tag activation), FR-7 (URL and client ID), FR-8 |
| Design refs | §7.4, §7.7, §11, P-18, P-19, P-20, P-22, P-24 |
| Consumers | `docs/mcp.md` (placeholders replaced) |
| Review | `checklist`: owner-run procedure plus a docs diff of two values |
| Skills | `aws-cdk` |

**Checklist** (the owner runs every AWS step):

1. Record D-8(ii). Confirm the CDK bootstrap (P-20) and the OIDC provider (P-19). Deploy `akili-mcp-deploy-role` with `oidcProvider=import|create`.
2. Create the GitHub environment `aws-mcp`: protected to `v*` tags, with variable `AWS_ROLE_ARN`, and `AKILI_MCP_ALERT_EMAIL` as an environment secret or variable. Neither value is committed.
3. Activate the `project` cost-allocation tag (P-18). Confirm that no paolachicue resource carries it (P-24).
4. Record D-8(iii). Run `workflow_dispatch` with the released version → green: npm-wait, integrity, deploy, smoke. Paste the summary.
5. Failure drill: `workflow_dispatch` with a version whose smoke cannot pass is **not** run against production. The rollback path is proven by T4's tests plus one manual `update-alias` to the previous version and back, done by the owner.
6. Ask the pricing question for P-22 and record the answer.
7. Replace the placeholders in `docs/mcp.md` with the public Gateway URL and client ID, and drop the *"Not live yet"* note.

**Verification.** A green `MCP Deploy` run for the released version, and `list_commands` from Claude Code returns that `akiliVersion`.

| Verification field | Value |
|---|---|
| Falsifier | `list_commands` returns a version ≠ the release → FR-5 failed; roll back and Pivot |
| Red run | n/a: environment rollout |
| Disqualifier | A green run on a stack deployed from the checkout, not from npm, does not prove FR-5: the summary must show the npm-integrity step passing for that version |
| Consumers | `docs/mcp.md` |

**Done.** Checklist evidenced in `execution.md`, docs updated in one commit, and `family.md` row 1 left for `/akili-archive`.

## 5. Skip-eligible tasks

None. T1–T5 are `full`: new public-endpoint code, IAM and auth, a credentialed workflow, and docs with factual claims. T6–T7 are `checklist` owner procedures, not skip-eligible.
