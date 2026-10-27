# Design: local stdio MCP server (`akili mcp`)

> **Answer first.** Two new modules sit beside `bin/persona.js` and `bin/routing.js`:
>
> - **`bin/mcp-core.js`:** pure. It builds the catalog, handles messages and runs the three tools.
> - **`bin/mcp-stdio.js`:** the line reader and the stdin/stdout wiring.
>
> `bin/akili.js` dispatches `mcp` before the update check and the banner, the way `check-update` is handled today. The catalog is a map keyed by URI, built once at startup from a no-follow walk of the shipped folders. A read is served only when its URI is a key of that map, so no URI ever becomes a path. `doctor_agents` reuses the persona functions; the two digest helpers move from `bin/akili.js` into `bin/persona.js` so both callers share one copy. No new dependency, no write, no network.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/methodology-mcp/local-stdio` |
| Depth | Standard (re-checked in §8: matches) |
| Requirements | `requirements.md` (FR-1..FR-5, NFR-1..NFR-7) |
| Evidence baseline | `43f9b92` (no code change since `48c28ba`), Node `v22.12.0` |
| Skills applied | `software-architect` (module split, NFRs), `api-design-principles` (tool contracts), `error-handling-patterns` (protocol vs tool errors) |
| Status | Phase 2 gate: `auto-approved (owner mandate: recommended option "Continue" — no High-impact UNVERIFIED premise, §11)`, 2026-10-27 |

## 2. Architecture Overview

```mermaid
flowchart LR
  C[MCP client] -- "stdin: one JSON line per message" --> S[bin/mcp-stdio.js<br/>line reader + writer]
  S --> H[bin/mcp-core.js<br/>handle(message)]
  H --> K[(catalog<br/>URI → file, built at startup)]
  H --> T[tools: doctor_agents,<br/>resolve_spec_path, list_active_specs]
  T --> P[bin/persona.js<br/>parsePersona, sectionStates,<br/>resultExitCode, digest helpers]
  T --> D[(project dir: .agents/, docs/specs/)]
  K --> F[(package: .claude/commands, skills,<br/>templates; scripts/ helpers)]
  H -- "response object" --> S
  S -- "stdout: one JSON line per response" --> C
```

- **Entry:** `akili mcp` → `bin/akili.js` `main()` → an early branch, placed before `checkForUpdates()` and `printBanner()`, calls `runStdio` (DD-3).
- **Core:** a pure function boundary. It takes a parsed message and returns a response object, `null` for a notification, or an array for a batch. It never touches stdout, so every protocol behavior is unit-testable without a process.
- **Transport:** owns byte framing only: it splits stdin into lines, parses JSON, calls the core, and writes `JSON.stringify(response) + "\n"`. `JSON.stringify` never emits a raw newline, so framing holds by construction.

## 3. Extended Directory Structure

| Path | Status | Content |
|---|---|---|
| `bin/mcp-core.js` | new | `buildCatalog(packageDir)`, `createServer({ catalog, packageDir, cwd })` → `{ handle }`, frontmatter parser, URI table, tool handlers |
| `bin/mcp-stdio.js` | new | `createLineReader(onLine)`, `runStdio({ server, stdin, stdout })` |
| `bin/persona.js` | changed | gains `loadDigests(digestsPath)` and `digestsForRole(digests, role)`, moved from `bin/akili.js` (DD-9) |
| `bin/akili.js` | changed | `mcp` branch in `main()`; `help` line; `loadTemplates()` becomes a one-line wrapper over `loadDigests`; `digestsForRole` imported |
| `test/mcp-core.test.js` | new | catalog, URI guard, handler, prompts, resources, tarball parity |
| `test/mcp-tools.test.js` | new | the three tools, doctor parity against the CLI |
| `test/mcp-stdio.test.js` | new | line reader; spawned `akili mcp` sessions (stdout purity, shutdown) |
| `test/docs-overview-contract.test.js` | changed | the *In your terminal* pin gains `mcp` (P-9) |
| `docs/cli.md`, `README.md`, `CHANGELOG.md` | changed | FR-5 |

`package.json` `files` already ships `bin` (P-3), so the new modules ship without a `files` edit, and `test/` stays out (NFR-4).

## 4. Data Model

**Catalog** (built once, immutable for the process):

| Field | Content |
|---|---|
| `version` | `version` from `<packageDir>/package.json` |
| `prompts` | sorted array of `{ name, description, file }`, one per `.claude/commands/*.md` |
| `resources` | `Map<uri, { uri, name, mimeType, size, absPath }>`, insertion-sorted by URI |

**URI form (DD-5):** `akili://<version>/<area>/<relative path with "/">`.

| Area | Source folder | Members |
|---|---|---|
| `commands` | `.claude/commands/` | every regular file |
| `skills` | `.claude/skills/` | every regular file, any depth |
| `templates` | `.claude/templates/` | every regular file |
| `scripts` | `scripts/` | only `gsc_verify.py`, `parse_tests.js` (the installer's `RESOURCE_SCRIPTS`, P-10) |

**Walk rules:** `lstat`. Symlinks are never followed and never listed. Names starting with `.` are skipped. Only regular files are listed.

**MIME by extension:**

| Extension | MIME |
|---|---|
| `.md` | `text/markdown` |
| `.json` | `application/json` |
| `.csv` | `text/csv` |
| `.py` | `text/x-python` |
| `.js`, `.cjs`, `.ts` | `text/javascript` |
| `.sh` | `text/x-shellscript` |
| anything else (`.txt`, `LICENSE`, `NOTICE`) | `text/plain` |

**Read:** `fs.readFileSync(absPath)`, then a fatal `TextDecoder('utf-8')`. It returns `text` on success and a base64 `blob` on a decode error (FR-3).

## 5. API Design (MCP surface)

| Method | Params used | Result / error |
|---|---|---|
| `initialize` | `protocolVersion` | `{ protocolVersion: negotiated, capabilities: { prompts: {}, resources: {}, tools: {} }, serverInfo: { name: "akili-specs", version }, instructions }` |
| `notifications/initialized`, `notifications/cancelled`, any other notification | — | no response |
| `ping` | — | `{}` |
| `prompts/list` | `cursor` ignored | `{ prompts: [{ name, description, arguments: [{ name: "arguments", description, required: false }] }] }`, no `nextCursor` |
| `prompts/get` | `name`, `arguments.arguments` | `{ description, messages: [{ role: "user", content: { type: "text", text } }] }`; unknown name or a non-string `arguments.arguments` → `-32602` |
| `resources/list` | `cursor` ignored | `{ resources: [{ uri, name, mimeType, size }] }` |
| `resources/templates/list` | — | `{ resourceTemplates: [] }` |
| `resources/read` | `uri` | `{ contents: [{ uri, mimeType, text \| blob }] }`; not a catalog key → `-32002` with `data: { uri }` |
| `tools/list` | — | 3 tools, each `{ name, description, inputSchema, annotations: { readOnlyHint: true } }` |
| `tools/call` | `name`, `arguments` | `{ content: [{ type: "text", text: JSON }], isError }`; unknown tool → `-32602` |
| anything else with an `id` | — | `-32601` |

**Envelope errors:**

| Input | Error |
|---|---|
| Unparseable line | `-32700`, `id: null` |
| Not an object, missing `jsonrpc: "2.0"`, or `method` not a string | `-32600`, with `id` echoed when present, else `null` |
| An exception thrown inside a handler | `-32603`, and the server keeps running |

**Version negotiation:** `SUPPORTED = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"]`. The server echoes a requested version that is in the list, and otherwise answers `SUPPORTED[0]` (P-11).

**Tool input schemas** (all `type: "object"`, `additionalProperties: false`):

| Tool | Properties | Result JSON |
|---|---|---|
| `doctor_agents` | `projectDir?: string` | `{ version, projectDir, agentsDir: "present"\|"absent", drift, roles: [{ role, file, status, sections: [{ id, state, matched? }] }] }` |
| `resolve_spec_path` | `argument: string` (required), `projectDir?: string` | `{ input, rule: "literal"\|"bare-slug"\|"free-text", specPath, specDir, proposalPath, context, exists }` |
| `list_active_specs` | `projectDir?: string` | `{ projectDir, specs: [{ specPath, files, family, tasks: { done, open, blocked } \| null }] }` |

**`instructions` text (DD-7):** one paragraph covering four points:

- Prompts are the AKILI commands.
- Before following a command, read every skill it names at `akili://<version>/skills/<skill>/SKILL.md`, and the persona templates under `akili://<version>/templates/`.
- Helper scripts referenced as `akili/scripts/…` are readable under `akili://<version>/scripts/`.
- The tools are read-only.

This mitigates parent R-1/R-2 without editing command text (parent OQ-3).

## 6. Backend Module Design

**`bin/mcp-core.js`**

- `buildCatalog(packageDir)`:
  1. Reads `package.json`.
  2. Walks the four areas (§4 rules).
  3. Parses each command's frontmatter: the first line is `---`, and the block ends at the next line that is exactly `---` (CRLF tolerated). The `name:` and `description:` values are trimmed, with one pair of surrounding quotes removed. When the frontmatter is missing, the name falls back to the file's base name and the description to `""`.
  4. Returns the catalog. The body is not kept: `prompts/get` re-reads the file, so memory stays at metadata size (NFR-2).
- `createServer({ catalog, packageDir, cwd })` returns `{ handle(message) }`:
  - `handle` accepts an object or an array.
  - For an array, it maps the elements, drops the `null`s, and returns `null` when nothing is left.
  - Each element goes through envelope validation, then a method table.
  - Requests before `initialize` are answered normally (lenient; the spec's ordering rule is a client SHOULD — P-11).
- `prompts/get` body: the text after the frontmatter's closing line ending. Every `$ARGUMENTS` is replaced, using a split/join, never a regex built from user input, by the argument or `""`. Nothing else changes (FR-2 BUT).
- **Tools** take the project directory from `projectDir` (resolved against `cwd` when relative) or `cwd`. They return `isError: true` when it is not an existing directory. Every path they read is `path.join(projectRoot, <fixed relative path>)`, or a directory entry name found by `readdirSync`, so no argument value is joined except `projectDir` itself, and that one is only `stat`ed and walked.
  - `doctor_agents`:
    1. If `<project>/.agents` is missing, returns `agentsDir: "absent"`, `drift: true`, `roles: []`.
    2. Otherwise, for each of `leader`, `implementer`, `reviewer`, `tester`, runs the same chain as the CLI (`bin/akili.js:2104-2112`): template `parsePersona` → persona `parsePersona` or `null` → `digestsForRole(loadDigests(templates/digests.json), role)` → `sectionStates`.
    3. Maps the result to `status` (`result.status` when `absent`, `unreadable` or `unmarked`, else `present`) and `sections` (`id`, `state`, `matched` when set).
    4. `drift` is true when any role's `resultExitCode` is non-zero.
  - `resolve_spec_path`:
    1. Splits on the first run of whitespace into the first token and `context`.
    2. Applies the rules in FR-4 order.
    3. The `literal` guard rejects a `..` segment, a leading `/`, any `\`, and `^[A-Za-z]:` before anything is built.
    4. `specDir` = `docs/specs/<specPath>`; `proposalPath` = `<specDir>/proposal.md`.
    5. `exists` comes from `statSync` of `<project>/<specDir>`, which is safe because of the guard.
  - `list_active_specs`:
    1. Walks `<project>/docs/specs` with `lstat`, skipping symlinks.
    2. At depth 1, skips the six carve-out names.
    3. A folder whose spec files are only `family.md` is a family container: it is not listed, but it is still walked, so its children are listed.
    4. Spec files are `proposal.md`, `requirements.md`, `design.md`, `tasks.md`.
    5. Task counts come from lines starting with `| Status |` in `tasks.md`, counting `` `[x]` `` / `` `[ ]` `` / `` `[~]` `` cells; with no such line, `tasks: null`.
    6. Output is sorted by spec path, using `/` separators.

**`bin/mcp-stdio.js`**

- `createLineReader(onLine)` keeps a string buffer. On each chunk it splits on `\n`, strips one trailing `\r` per line, keeps the unfinished tail, and ignores empty lines.
- `runStdio`:
  - Sets stdin encoding to `utf8`, and calls `JSON.parse` on each line, inside a try block (a parse error → `-32700`).
  - Calls `server.handle` and writes each non-null response with `stdout.write(JSON.stringify(r) + "\n")`.
  - On stdin `end`, resolves once every write has flushed. `akili.js` then returns from `main()`, and the process exits 0 because no handle is left open (FR-1 *Shutdown*).

**`bin/akili.js` changes**

- In `main()`, directly after the `check-update` branch: `if (args.command === "mcp") { await runMcp(); return; }`. `runMcp` builds the catalog from `PACKAGE_ROOT`, creates the server with `process.cwd()`, and awaits `runStdio` with `process.stdin`/`process.stdout`.
- `printHelp` gains `mcp       Start an MCP server on stdio (prompts, resources, read-only tools)`.
- `loadTemplates()` returns `loadDigests(path.join(SOURCE_TEMPLATES, "digests.json"))`, and `digestsForRole` comes from `./persona.js`. `runAgentsDoctor` is otherwise untouched.

## 7. Frontend / UX Component Architecture

n/a. There is no UI. The user-facing surface is the client's rendering of prompts, resources and tools, which this package does not control (the *Real client UX* defect class in `requirements.md`).

## 8. Budget (Step 2.4)

| Item | Estimate |
|---|---|
| Tasks | **5** |
| LOC | `mcp-core.js` ~380 · `mcp-stdio.js` ~70 · `akili.js` ~20 · `persona.js` ~25 moved · tests ~600 (one assertion per scenario clause, ~70 clauses; KZ-bugfix--init-ctrlc-abort-2) · docs ~100 → **~1,200** |
| Review rounds | T1 2 · T2 2 · T3 2 · T4 2 · T5 2 (README/CLI docs are review-heavy here because tests pin them) → **10** |
| Tripwire | Stop and escalate past **6 tasks**, **~1,500 LOC**, or **3 rounds on any task** |

**Depth check:** five tasks, one new subsystem, no data or auth surface, and a local-only process → Standard matches. The LOC is high for Standard because about half of it is tests; that is the clause-level test budget the Active Lesson asks for, not scope growth.

## 9. Shared Contracts or Package Extensions

- **New CLI subcommand** `mcp`: no flags. Unknown flags still fail through `parseArgs` `strict: true`, as for every command.
- **New exports from `bin/persona.js`:** `loadDigests`, `digestsForRole`. The existing exports are unchanged (P-7).
- **New public contract:** the MCP surface in §5, including the URI form, which clients may persist. Changing either later is a breaking change for MCP users and follows semver.
- **Constitution Impact (for `/akili-execute` to record):** AGENTS.md *Repository Purpose* describes `bin/persona.js`'s exports and lists the `bin/` modules. The new `mcp-core.js` / `mcp-stdio.js` and the moved digest helpers need a line at `/akili-archive`.

## 10. Design Decisions

| # | Decision | Requirement | Alternatives rejected |
|---|---|---|---|
| DD-1 | Hand-rolled JSON-RPC over newline-delimited stdio; no MCP SDK | NFR-1, parent OQ-1 | `@modelcontextprotocol/sdk`: it would be the first runtime dependency (P-3), and its Node floor against `>=18` is unchecked. The surface is 10 methods |
| DD-2 | Split into a pure core and a thin transport | FR-1..FR-4, testability | One module with I/O inside handlers: every protocol clause would then need a spawned process to test |
| DD-3 | Dispatch `mcp` before `checkForUpdates()` and `printBanner()` | FR-1 *Stdout carries only messages* | Relying on the update check's non-TTY early return (P-2): the banner prints regardless (`bin/akili.js:2900-2902`), and the check would still run its cache read |
| DD-4 | Catalog from metadata at startup; content read on demand | NFR-2, FR-3 | Reading all ~3.5 MB at startup: slower startup, no gain |
| DD-5 | URIs are exact catalog keys, built from a no-follow walk; no decoding or normalization at read | FR-3 *Only listed files* | Path-join plus `startsWith` containment: the classic traversal bug class, and it would also serve non-shipped files under `.claude/` such as `README.md` |
| DD-6 | `$ARGUMENTS` replaced by split/join; absent → `""` | FR-2 | Leaving the literal when absent: differs from how slash commands are written to be read (P-12) |
| DD-7 | An `instructions` string points the agent at skill and script URIs | parent R-1, R-2, OQ-3 | Rewriting command text at serve time: rejected by OQ-3 |
| DD-8 | Tool results are JSON text only; no `structuredContent` or `outputSchema` | FR-4 across all four protocol versions | `structuredContent`: added in 2025-06-18; omitting it keeps one result shape for every version (P-11) |
| DD-9 | Move `loadTemplates`' body (as `loadDigests(path)`) and `digestsForRole` into `bin/persona.js` | FR-4 *doctor_agents matches the CLI* | Copying them into `mcp-core.js`: two copies that can drift. Requiring `bin/akili.js`: impossible, since it runs `main()` on load and exports nothing (P-7) |
| DD-10 | Batches supported | FR-1 *Malformed and unknown input* | Rejecting arrays: `2025-03-26` is in the supported set and that version allows batching (P-11) |
| DD-11 | `projectDir` optional and defaults to the server's working directory; MCP `roots` not used | FR-4 | Requesting `roots` from the client: client support varies, and it adds a server-to-client request |
| DD-12 | Docs: a `docs/cli.md` section plus one README terminal row; client snippets only when confirmed at the vendor's docs | FR-5 | README *Install* or *Learn more* edits: `## Install` is pinned to one install command and no tables (`test/docs-overview-contract.test.js:174-185`) |

**Reversion challenge (Step 2.3):** no DD removes, disables or inverts delivered behavior. DD-9 moves two functions without changing them, and `doctor --agents` keeps its output. That is guarded by the existing `agents-doctor*` suites (P-8). No challenge is owed.

## 11. Premise Ledger

Count: 15 rows. 11 verified, 4 `UNVERIFIED`. By impact: High 0; Low 4 (P-12, P-13, P-14, P-15).

Blast-radius triggers:

- **`live-path` fires:** the user action "a client spawns `npx -y akili-specs mcp`" → P-1.
- **`shared-state` fires:** DD-9 changes where two functions that the doctor path uses are defined → P-8.
- **`consumer` fires:** the README terminal table and the help text are pinned by tests → P-9. The `bin/persona.js` export list is read by `bin/akili.js`, `scripts/release.js` and the tests → P-7.

| # | Claim | Class | Citation (as run) | Verified at | If false | Settled by |
|---|---|---|---|---|---|---|
| P-1 | The live path for `npx -y akili-specs mcp`: npm runs the package's only bin (`"akili": "bin/akili.js"`), then `main()` → `getArgs()`, where `parseArgs` takes `positionals[0]` = `mcp` with no command allow-list before the switch → the new branch | live-path | `package.json` `bin`; `bin/akili.js:372-378` (no command validation), `:2884-2941` (`main`, `default: fail`) | `43f9b92` | DD-3's entry point changes (Low) | `npx` running the single bin with the extra argument is re-checked by T5's packed-tarball smoke |
| P-2 | `checkForUpdates()` returns when stdout is not a TTY; the banner prints for every command except `help`, `list`, `init`, `routing --json` | other | `bin/akili.js:2390-2392`, `:2900-2902` | `43f9b92` | DD-3 is still needed (it only gets stronger) (Low) | — |
| P-3 | No runtime dependency; `files` ships `bin`; `engines.node` `>=18.0.0` | data-env | `grep -c '"dependencies"' package.json` → 0; `package.json` `files`, `engines` | `43f9b92` | DD-1's rationale and NFR-4 change (Low) | — |
| P-4 | All 14 command files start with `---` and close the frontmatter at line 7, each with exactly one `name:` and one `description:` line, single-line and unquoted, with no CR | data-env | per-file `awk` scan over `.claude/commands/*.md` → `end=7 name=1 desc=1` for all 14; `grep -c $'\r'` → 0 for all | `43f9b92` | DD-6's parser needs YAML features (Low) | — |
| P-5 | `npm pack --dry-run --json` lists 266 `.claude/` files = the 265 regular files under `commands/`, `skills/`, `templates/` plus `.claude/README.md`; no symlinks or dotfiles under `.claude/` | data-env | diff of the pack list against `find … -type f` (one line: `< .claude/README.md`); `find .claude -type l` → none; `find .claude -name ".*" -type f` → none | `43f9b92` | FR-3 parity needs filtering rules (Low) | — |
| P-6 | Shipped content is all text: extensions md 206, csv 24, py 6, json 5, cjs 4, txt/ts/sh 1 each, plus `LICENSE`×2 and `NOTICE` | data-env | `find .claude/skills .claude/templates -type f \| sed 's/.*\.//' \| sort \| uniq -c` | `43f9b92` | The `blob` path becomes the main path (Low) | — |
| P-7 | `bin/persona.js` exports `parsePersona`, `sectionStates`, `resultExitCode`, …; `loadTemplates` and `digestsForRole` are private to `bin/akili.js` (`:1820-1840`), which exports nothing and calls `main()` at load | consumer | `bin/persona.js:917`; `grep -n "module.exports" bin/akili.js` → none; `bin/akili.js:2941` `main();`; `grep -rn "digestsForRole\|loadTemplates" bin scripts test` → only `bin/akili.js` (definitions, `:2099`, `:2109`) | `43f9b92` | DD-9 changes (Low) | — |
| P-8 | The doctor path reads the digests once per run (`:2099`) and slices them per role (`:2109`); the `agents-doctor*` suites spawn the CLI with `cwd` set to a temp project and assert its output | shared-state | `bin/akili.js:2099-2112`; `test/agents-doctor-io.test.js:31-34` (`spawnSync`, `cwd: tmpDir`) | `43f9b92` | T4's parity harness differs (Low) | — |
| P-9 | Tests pin the README *In your terminal* table to exactly 8 subcommands, and `docs/cli.md`'s command and skill totals; no test pins `printHelp` text | consumer | `test/docs-overview-contract.test.js:250-260` (`deepEqual` of 8 names); `test/akili-marketing-docs.test.js:114-118`; `grep -rln "Usage:\|printHelp\|akili help" test` → only `akili-review-contract-coverage.test.js:308`, which reads the CHANGELOG for another command's usage; member-keyed sweep `grep -rln "check-update\|notifications enable" test/*.js` → `docs-overview-contract.test.js`, `update-check.test.js` | `43f9b92` | T5 scope grows (Low) | — |
| P-10 | The installer ships exactly two helper scripts, `RESOURCE_SCRIPTS = ["gsc_verify.py", "parse_tests.js"]`, from `scripts/` | data-env | `bin/akili.js:76`, `:89` | `43f9b92` | The `scripts` area membership changes (Low) | — |
| P-11 | MCP 2025-11-25:<br>• stdio messages are newline-delimited with no embedded newline, and the server must write nothing to stdout that is not an MCP message;<br>• the server echoes a supported requested version, else its latest;<br>• resource not found is `-32002`, invalid prompt or tool name is `-32602`;<br>• tool execution errors use `isError: true`;<br>• `structuredContent` and `outputSchema` are optional;<br>• the client SHOULD NOT send requests before `initialize` is answered | other | modelcontextprotocol.io/specification/2025-11-25: `basic/transports`, `basic/lifecycle`, `server/resources`, `server/prompts`, `server/tools`, fetched 2026-10-27 (primary source: the spec) | `43f9b92` | DD-1, DD-8, DD-10 and the error table change (Low; caught by the spec text, not code) | — |
| P-12 | Claude Code shows MCP prompts as slash commands and substitutes `""` for an absent `$ARGUMENTS` | data-env | `UNVERIFIED — confirm at source before relying on it` (training knowledge, not run) | — | DD-6's default and the docs wording change (Low) | T5 first step: Claude Code MCP docs; then the user's manual check at `/akili-validate` (Juan Carlos Cadavid) |
| P-13 | Cursor, Codex CLI, OpenCode, Antigravity and Grok Bot accept a stdio server entry, each in its own documented config format | data-env | `UNVERIFIED — confirm at source before relying on it` | — | Docs rows read `not verified` (Low) | T5 first step: each vendor's docs; unconfirmed rows ship as `not verified` |
| P-14 | Every Node API the design uses (`TextDecoder` `fatal`, `fs` `lstat`/`readdir`, `readline`-free string splitting, `String.prototype.split/join`) behaves the same on Node 18 | data-env | `UNVERIFIED — confirm at source before relying on it`. Local runtime is Node 22.12 only; rule (f): the CI matrix spans 18 and 22 | — | A task adjusts an API (Low) | The PR's CI legs (Node 18 on three OSes); owner: T3's and T4's PR run, read by the user before merge |
| P-15 | On a Windows checkout with `core.autocrlf=true`, `.claude/**` arrives with CRLF (not covered by `.gitattributes`), so frontmatter and line handling must accept `\r\n` | data-env | `UNVERIFIED — confirm at source before relying on it`. `.gitattributes` lists `test/fixtures/** -text` and two SVGs only (read 2026-10-27); the Windows checkout itself was not run | — | DD-6's CRLF tolerance would be unnecessary, not wrong (Low) | T1 adds a CRLF frontmatter unit case; the Windows CI legs run it |

## 12. Risks

| # | Risk | Mitigation |
|---|---|---|
| R-1 | Clients may never read the skills a prompt names (parent R-1) | DD-7 `instructions`; the docs say plainly that `akili install` is the full-fidelity path |
| R-2 | A long-running server holds a stale catalog after `npm i -g akili-specs@new` | Accepted. The client restarts the server; URIs carry the version, so a stale read is visible |
| R-3 | The parity test against `npm pack --dry-run --json` is slow or flaky offline | It needs no network (P-5 ran it in ~0.8 s); the test sets `npm_config_offline=true`. If `npm` is not on PATH, the test fails with a message, never skips silently |
| R-4 | Batch support widens the surface for little use | Small and fully unit-tested (DD-10) |
