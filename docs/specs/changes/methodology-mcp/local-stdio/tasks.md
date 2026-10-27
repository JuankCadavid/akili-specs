# Tasks: local stdio MCP server (`akili mcp`)

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/methodology-mcp/local-stdio` |
| Depth | Standard |
| Status | Phase 3 gate: awaiting the owner's **final spec approval** (mandate: stop at the final spec approval) |
| Budget (design §8) | **5 tasks · ~1,200 LOC · review rounds 2 per task (10)**. Stop and escalate past 6 tasks, ~1,500 LOC, or 3 rounds on any task |
| Commit prefix | `[SPEC:changes/methodology-mcp/local-stdio]`. Local commits only: no push, merge, tag, release, `npm publish`, or AWS command |
| Baselines (as run 2026-10-27 at `f4afb63` + citation fix) | `npm test` → 1153 tests, 1153 pass, 0 fail · `bin/mcp-core.js`, `bin/mcp-stdio.js`, `test/mcp-*.test.js` do not exist · `grep -c "mcp" README.md` → 0 · `node bin/akili.js mcp` → `Unknown command: mcp` (via `fail`) |
| Runtime | Node `v22.12.0` locally; Node 18 behavior is owned by the PR's CI legs (design P-14) |

## 2. Task Graph

```
T1 (catalog + URI guard + tarball parity) ──► T2 (message handler) ──► T3 (stdio transport + CLI + process tests) ──► T5 (docs + full verification)
                                                         └──────────► T4 (three tools + digest-helper move) ───────────────┘
```

T4 needs T2's `tools/call` dispatch slot. T3 and T4 touch different files apart from `bin/akili.js`: T3 adds the `mcp` branch and help line; T4 changes `loadTemplates` and the imports. Under the one-session rule they run in sequence, T3 then T4. T5 needs everything.

**PR strategy:** ~1,200 LOC (about half tests), so **two PRs into `dev`** from one feature branch:

- **PR 1 = T1–T3.** A working server with prompts and resources and no tools. Review `bin/mcp-core.js` first, then the transport.
- **PR 2 = T4–T5.** Tools, docs, CHANGELOG. It links PR 1.

Each PR description says what is out of scope (remote transport, write tools).

## 3. Coverage (clause level)

| Clause | Owner |
|---|---|
| FR-1 *Handshake*: same version · serverInfo · three capabilities without `listChanged`/`subscribe` · `instructions` · notification unanswered · AND IT MUST latest-on-unsupported · AND IT MUST `ping` → `{}` | T2 |
| FR-1 *Stdout carries only messages*: every line parses as a response · BUT no banner/notice/log/blank line · AND IT MUST NOT contact the registry | T3 |
| FR-1 *Malformed and unknown input*: `-32700`/`id null` · `-32600` · `-32601` with id · batch array, notifications dropped, all-notification batch silent · AND IT MUST echo ids · BUT unknown notification silent | T2 |
| FR-1 *Malformed*, AND a line split across chunks | T3 (line reader) |
| FR-1 *Shutdown*: exit 0 within 2 s after flushing | T3 |
| FR-2 every clause (list 14 sorted with frontmatter fields and one optional argument · get body with `$ARGUMENTS` replaced · absent → `""` · AND IT MUST `-32602` · BUT no other alteration) | T1 (frontmatter parse, body extraction), T2 (methods, errors) |
| FR-3 *List and read*: URI form with `/` · name/mimeType/size · equals the pack list file for file · text unchanged · blob for non-UTF-8 · `resources/templates/list` empty | T1 (catalog, read, parity), T2 (methods) |
| FR-3 *Only listed files*: every hostile form → `-32002` and no read · BUT never path-joined · AND IT MUST NOT follow symlinks; dotfiles excluded | T1 (guard, walk), T2 (`-32002` envelope) |
| FR-4 *`doctor_agents`*: JSON shape · states equal the CLI's · `drift` iff CLI exit 1 · missing `.agents/` · BUT no write, no `fix` input | T4 |
| FR-4 *`resolve_spec_path`*: literal · bare-slug · free-text · `specDir`/`proposalPath`/`context`/`exists` · AND IT MUST reject `..`, `/`, `\`, drive letter | T4 |
| FR-4 *`list_active_specs`*: any depth, spec files, `family`, task counts or `null` · BUT no carve-out or family container · AND IT MUST NOT follow symlinks · empty list without `docs/specs/` | T4 |
| FR-4 *Tool errors*: unknown tool `-32602` · bad `projectDir`/argument type → `isError` · AND IT MUST NOT read outside the project directory (apart from the package's templates) | T2 (unknown tool), T4 (the rest) |
| FR-4 *tools/list*: exactly three, `inputSchema`, `readOnlyHint` | T2 (list shape, from T4's descriptors once they exist: T2 ships the list with stub handlers returning `isError`, and T4 replaces the stubs) |
| FR-5 *Docs*: help line | T3 |
| FR-5 *Docs*: `docs/cli.md` section · client table with verified-or-`not verified` rows · full-fidelity statement · README row + `docs/cli.md` *Commands* row · CHANGELOG · BUT no unsourced slash-command claim | T5 |
| FR-5 *No regressions*: all pass, only the README pin changed · other commands' output unchanged | T5 (final), T3/T4 (`npm test` each) |
| NFR-1 | T1–T4 (no dependency added; T5 checks `package.json` diff) |
| NFR-2 | T3 (spawned-session timing) |
| NFR-3 | T3 (spawned session under a no-network, read-only probe), T4 (tools write nothing: before/after tree hash) |
| NFR-4 | T5 (`pack:dry-run`) |
| NFR-5 | T1–T5 (test headers and CHANGELOG cite no spec folder) |
| NFR-6 | T5 (local), PR CI (six legs) |
| NFR-7 | T5 |

## 4. Tasks

### T1: catalog, URI guard and tarball parity

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M (~170 LOC code, ~160 LOC test) |
| Depends on | none |
| Requirements | FR-2 (frontmatter, body), FR-3 (all catalog and read clauses), NFR-1, NFR-5 |
| Design refs | §4, §6 `buildCatalog`, DD-4, DD-5, DD-6, P-4, P-5, P-6, P-10, P-15 |
| Consumers | none: new files only |
| Review | `full`: new security-relevant code (the URI guard) |
| Skills | `tdd` (pure functions; expected values from the FR-2/FR-3 scenarios), `error-handling-patterns` |

**Scope.**

1. `bin/mcp-core.js` with `buildCatalog(packageDir)`, `readResource(catalog, uri)` → `{ uri, mimeType, text | blob }` or `null`, `parseFrontmatter(text)` → `{ name, description, body }`, and `renderPrompt(text, arg)`. Node built-ins only.
2. The walk follows design §4 exactly: four areas, `lstat`, no symlinks, no dotfiles, regular files only, `/` in URIs. The MIME table is design §4's. UTF-8 is checked with a fatal decoder; on failure the result is a base64 `blob`.
3. `test/mcp-core.test.js` (header cites no spec folder):
   - catalog counts: 14 prompts; resources = 265 + 2 scripts;
   - prompt names and descriptions match each file's frontmatter;
   - **parity:** the `commands/`, `skills/` and `templates/` URIs, mapped back to `.claude/<area>/<path>`, equal the `.claude/commands|skills|templates/` entries of `npm pack --dry-run --json` run with `npm_config_offline=true` (`npm` missing → fail with a message);
   - read returns the file's exact text;
   - a non-UTF-8 file in a temp package dir → `blob`;
   - **hostile URIs** each → `null`, with a `fs.readFileSync` spy recording no call: `akili://V/skills/../package.json`, `akili://V/skills/%2e%2e/x`, `akili://V//etc/passwd`, `akili://V/skills\..\x`, wrong version, `file:///…`, `akili://V/package.json`, `akili://V/README.md`;
   - a temp package dir with a symlinked file and a `.hidden` file → neither listed;
   - CRLF frontmatter parses (P-15);
   - missing frontmatter → base-name fallback;
   - `renderPrompt` replaces every `$ARGUMENTS`, uses `""` when absent, leaves the body otherwise byte-equal, and treats an argument like `$&` literally.

**Verification.**

- `node --test test/mcp-core.test.js` → all pass. `npm test` → 1153 + new, 0 fail.
- `git diff --stat package.json` → empty.

| Verification field | Value |
|---|---|
| Falsifier | (1) Replace the catalog-key lookup with `path.join(root, uriPath)` plus an existence check → the hostile-URI cases for `README.md` and `package.json` go red (they exist on disk). (2) Drop the dotfile/symlink skip → the temp-dir case red. (3) Remove one file from the walk (skip `templates/`) → the parity assertion red, naming the missing entries. (4) Replace `$ARGUMENTS` with `String.replace` and a string pattern (first match only) → the multi-occurrence case red, using `akili-archive.md`, which has 6 occurrences (`grep -c '\$ARGUMENTS'` → 6) |
| Red run | `predicted — greenfield artifact (observed in T1)`. T1's `execution.md` entry quotes the red output of falsifiers 1–4 verbatim |
| Disqualifier | A parity test whose expected list is derived from the same walk is circular; the expected list must come from `npm pack`. A hostile-URI test that only checks the return value cannot see a read that happened and was discarded, which is why the read spy is required. A green parity run with `npm` absent is impossible by design: absence is a failure |
| Consumers | none |

**Done.** Every verification line holds; four falsifier reds are quoted in `execution.md`; one `[SPEC:changes/methodology-mcp/local-stdio]` commit.

### T2: message handler

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M (~150 LOC code, ~170 LOC test) |
| Depends on | T1 |
| Requirements | FR-1 *Handshake*, FR-1 *Malformed and unknown input* (except chunk splitting), FR-2 methods/errors, FR-3 methods/`-32002`, FR-4 *tools/list* and unknown tool |
| Design refs | §5 (whole), §6 `createServer`, DD-7, DD-8, DD-10, P-11 |
| Consumers | none: new code |
| Review | `full`: the public protocol contract |
| Skills | `tdd`, `api-design-principles`, `error-handling-patterns` |

**Scope.**

1. `createServer({ catalog, packageDir, cwd })` → `{ handle(message) }`, implementing design §5's method table and envelope errors.
2. `SUPPORTED` versions and the negotiation rule; the `instructions` text from design §5.
3. `tools/list` returns the three descriptors (names, descriptions, schemas, `readOnlyHint: true`); `tools/call` routes to a handler table whose three entries are stubs returning `isError: true` with "not implemented" until T4.
4. Batch handling per design §6.
5. Tests (`test/mcp-core.test.js`, new `describe` block): one assertion per clause in §3 rows FR-1 *Handshake*, *Malformed and unknown input*, FR-2 methods/errors, FR-3 methods/`-32002` with `data.uri`, `resources/templates/list` empty, `tools/list` shape, unknown tool `-32602`, and the handler exception → `-32603` while the server keeps answering. Both number and string ids are echoed. A batch of `[request, notification, request]` gets 2 responses in order; a notification-only batch gets `null`.

**Verification.**

- `node --test test/mcp-core.test.js` → all pass. `npm test` → 0 fail.

| Verification field | Value |
|---|---|
| Falsifier | (1) Answer notifications with `{}` → the notification and batch-count assertions red. (2) Always answer `SUPPORTED[0]` → the `2024-11-05` echo case red. (3) Return `-32601` for an unknown prompt → the `-32602` case red. (4) Let the handler throw → the `-32603` case red, along with the follow-up request |
| Red run | `predicted — greenfield artifact (observed in T2)`; quoted in `execution.md` |
| Disqualifier | Tests that construct the expected response by calling the handler's own helpers are circular; expected objects are written literally from design §5 and the spec (P-11). Tests that check only `result` presence, not the exact `id` echo, cannot see falsifier-class id bugs |
| Consumers | none |

**Done.** Verification holds; falsifier reds are quoted; one commit.

### T3: stdio transport, `akili mcp` and process tests

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M (~90 LOC code, ~140 LOC test) |
| Depends on | T2 |
| Requirements | FR-1 *Stdout carries only messages*, FR-1 chunk-split clause, FR-1 *Shutdown*, FR-5 help line, NFR-2, NFR-3 |
| Design refs | §2, §6 `mcp-stdio.js` and `akili.js` changes, DD-3, P-1, P-2, P-9 |
| Consumers | `bin/akili.js` `main()`: every existing CLI test that spawns the CLI. The baseline suite is the consumer check (1153 must stay green). `printHelp`: no test pins its text (P-9) |
| Review | `full` |
| Skills | `tdd`, `error-handling-patterns` |

**Scope.**

1. `bin/mcp-stdio.js`: `createLineReader`, `runStdio` per design §6.
2. `bin/akili.js`: the `mcp` branch right after `check-update` in `main()`; the `printHelp` line from design §6.
3. `test/mcp-stdio.test.js`:
   - **Line reader:** one message split across 3 chunks; 3 messages in one chunk; `\r\n` endings; empty lines ignored.
   - **Spawned session:** `node bin/akili.js mcp` with `stdio: pipe`, `cwd` = a temp dir, `HOME`/`USERPROFILE` = a temp dir, and `NODE_OPTIONS` empty. It writes `initialize`, `notifications/initialized`, `ping`, `prompts/list`, a bad JSON line and `resources/read` of a listed URI, then ends stdin.
   - **Assertions:**
     - Every stdout line parses and has `jsonrpc: "2.0"` and an `id`.
     - There are exactly 5 response lines.
     - Stdout contains no banner substring (`█`) and no `Update available`.
     - The exit code is 0 within 2 s of stdin end.
     - No file was written in the temp `HOME` or `cwd`: compare a before/after listing, which covers the update cache `~/.akili-specs-update.json`.
     - The `initialize` response arrives within 1 s of spawn (NFR-2; the reading is reported, and on a cold CI runner the 1 s bound is asserted at 3 s with the measured value printed, see Disqualifier).
   - **Help:** `node bin/akili.js help` stdout contains the `mcp` line.

**Verification.**

- `node --test test/mcp-stdio.test.js` → all pass. `npm test` → 0 fail.
- `node bin/akili.js mcp < /dev/null; echo $?` → `0` and empty stdout.

| Verification field | Value |
|---|---|
| Falsifier | (1) Move the `mcp` branch below `printBanner()` → the banner assertion red. (2) Add a `console.log("ready")` in `runStdio` → the parse-every-line assertion red. (3) Drop the tail-buffer logic (parse each chunk) → the 3-chunk line-reader case red. (4) Keep a `setInterval` alive → the exit-within-2 s assertion red |
| Red run | `predicted — greenfield artifact (observed in T3)`. Falsifier 1 is observable in part at baseline: `node bin/akili.js mcp` today prints the banner before `Unknown command`. T3 quotes all four reds in `execution.md` |
| Disqualifier | A timing reading taken while another agent or build is running is not evidence (AGENTS.md *Concurrency*); measure in a quiet tree. If three runs differ by more than 500 ms, report the spread instead of asserting the 1 s bound, and keep the CI bound at 3 s. A spawned test that inherits the developer's `HOME` can pass because a warm update cache short-circuits the check; the temp `HOME` masks it. A green on Node 22 says nothing about Node 18 (P-14): CI owns that |
| Consumers | every CLI-spawning suite (via `main()`), covered by the 1153 baseline |

**Done.** Verification holds; four reds are quoted; one commit. PR 1 boundary.

### T4: the three tools and the digest-helper move

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | M (~170 LOC code incl. ~25 moved, ~180 LOC test) |
| Depends on | T2 (T3 for ordering only) |
| Requirements | FR-4 (all except *tools/list* shape and unknown tool), NFR-3 (tools write nothing) |
| Design refs | §5 tool table, §6 tools, DD-9, DD-11, P-7, P-8 |
| Consumers | `bin/persona.js` exports: `bin/akili.js`, `scripts/release.js`, `test/agents-doctor*.test.js`, `test/persona-digests.test.js` (existing exports unchanged, two added). `loadTemplates`/`digestsForRole` readers: `bin/akili.js:2099`, `:2109` only (P-7). The `agents-doctor*` suites are part of the verification |
| Review | `full` |
| Skills | `tdd`, `api-design-principles` |

**Scope.**

1. Move the body of `loadTemplates` into `bin/persona.js` as `loadDigests(digestsPath)`, and `digestsForRole` unchanged; export both. In `bin/akili.js`, `loadTemplates()` becomes a one-line wrapper and `digestsForRole` is imported.
2. Replace T2's three stubs with design §6's handlers.
3. `test/mcp-tools.test.js` (header cites no spec folder):
   - **doctor parity:** for each of at least four fixture setups in temp projects, built from `test/fixtures/personas/` (`verbatim-marked.md` as all four roles, `missing-section.md`, `custom-edited.md`, `outdated-and-custom-edited.md`, and no `.agents/`), the tool's `{role, section id, state}` triples equal the triples parsed from `akili doctor --agents` stdout (ANSI stripped, section lines `STATE  id`), and `drift` equals (CLI exit === 1);
   - no `fix` property in the schema, and a tree hash of the temp project is unchanged after the call;
   - **resolve:** `add-remember-me`, `bugfix/login-redirect`, a free-text sentence, `../x`, `/abs`, `a\b`, `C:x`, and `exists` true/false;
   - **list:** a temp tree with `changes/a` (tasks with `[x]`, `[ ]`, `[~]` status cells), `bugfix/b` (proposal only), a family container `changes/fam/family.md` with child `changes/fam/c`, a parent with `proposal.md` + `family.md`, each carve-out holding a `proposal.md`, a symlinked dir → the exact expected list; no `docs/specs/` → `[]`;
   - **errors:** `projectDir` missing, `projectDir` a file, an argument of the wrong type → `isError: true`.

**Verification.**

- `node --test test/mcp-tools.test.js test/agents-doctor.test.js test/agents-doctor-io.test.js test/persona-digests.test.js` → all pass. `npm test` → 0 fail.

| Verification field | Value |
|---|---|
| Falsifier | (1) In the tool, map `custom-edited` to `current` → the parity case for `custom-edited.md` red. (2) Delete the depth-1 carve-out check → the `archive/`-holds-`proposal.md` case red. (3) Drop the `..` guard → the `../x` case red. (4) Revert the move in `bin/akili.js` only (keep a private copy that returns `{}` for releases) → the existing `agents-doctor` suites go red, showing those suites watch the moved code |
| Red run | `predicted — greenfield artifact (observed in T4)` for 1–3; falsifier 4 runs against existing suites and its red is quoted too |
| Disqualifier | Parity computed by calling the same helper on both sides is circular; the CLI side must be the spawned CLI's printed words. A carve-out test whose tree holds no spec file inside the carve-out cannot fail; each carve-out fixture holds a `proposal.md` |
| Consumers | `bin/akili.js`, `scripts/release.js`, `test/agents-doctor.test.js`, `test/agents-doctor-io.test.js`, `test/persona-digests.test.js` |

**Done.** Verification holds; reds are quoted; one commit.

### T5: docs, CHANGELOG and full verification

| Field | Value |
|---|---|
| Status | `[ ]` |
| Size | S (~100 LOC docs, ~5 LOC test pin) |
| Depends on | T3, T4 |
| Requirements | FR-5 (all), NFR-4, NFR-6, NFR-7 |
| Design refs | DD-12, P-9, P-12, P-13 |
| Consumers | `test/docs-overview-contract.test.js:250-260` (the *In your terminal* pin: 8 → 9 names); `test/akili-marketing-docs.test.js:114-118` (`docs/cli.md` totals; unchanged and must stay green); `test/docs-overview*.test.js` heading checks |
| Review | `full`: docs claims need a quote-check |
| Skills | `cognitive-doc-design` |

**Scope.**

1. **First step, settle P-12 and P-13:** read each vendor's MCP config docs (Claude Code, Cursor, Codex CLI, OpenCode, Antigravity, Grok Bot) and quote the URL and the config shape in `execution.md`. A client without a found source gets a `not verified` row and no snippet.
2. `docs/cli.md`:
   - a new section `## MCP Server (`akili mcp`)`, placed after *Routing*, covering start, exposure (prompts, `akili://<version>/…` resources, three read-only tools), the client table, and the full-fidelity note;
   - a `| \`akili mcp\` | … |` row in `## Commands`.
3. `README.md` *In your terminal*: an `akili mcp` row; update the test pin to the 9 names.
4. `CHANGELOG.md` `Unreleased`: one entry, with no spec-folder path (NFR-5).
5. **Packed smoke, settles P-1:**
   - `npm pack` into the scratchpad;
   - pipe an `initialize` line into `npx --yes <scratchpad tgz> mcp`;
   - quote the response line;
   - delete the `.tgz`, so none is committed.
6. **Full verification:** `npm test`, `npm run verify:cli`, `npm run pack:dry-run` (lists `bin/mcp-core.js` and `bin/mcp-stdio.js`, no `test/`), `git diff --check`, `git diff --stat package.json` empty.

**Verification.** All of item 6 holds; the smoke response is quoted.

| Verification field | Value |
|---|---|
| Falsifier | (1) Add the README row without updating the pin → `docs-overview-contract` FR-7 red (`deepEqual` of 8 names). (2) Write "shows as a slash command in Cursor" without a source → the Reviewer's quote-check fails it |
| Red run | Falsifier 1 is observed at T5 by adding the row before the pin, and quoted. Falsifier 2 is a review check, not a test |
| Disqualifier | A smoke run through `npx akili-specs` without the tarball path resolves the **published** 2.37.2 from the registry, which has no `mcp`. That is a red for the wrong reason, or a green from a global install; only the local `.tgz` path is evidence. Docs passing their tests prove structure, not truth: the vendor quotes are the evidence for client rows |
| Consumers | `test/docs-overview-contract.test.js`, `test/akili-marketing-docs.test.js`, `test/docs-overview.test.js` |

**Done.** Item 6 green; vendor quotes and the smoke response are in `execution.md`; one commit. PR 2 boundary.

## 5. Skip-eligible tasks

None. Every task is `full`: T1–T4 are new code on a public protocol surface (one of them a security guard), and T5 makes documentation claims about third-party clients that need a quote-check.
