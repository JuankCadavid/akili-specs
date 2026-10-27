# Requirements: local stdio MCP server (`akili mcp`)

> **Answer first.** `akili mcp` starts an MCP server on stdin/stdout from inside the installed `akili-specs` package, with no new dependency.
>
> - **Prompts:** the 14 commands.
> - **Resources:** every shipped command, skill, template and helper-script file, read-only and versioned.
> - **Tools:** three read-only project tools: `doctor_agents`, `resolve_spec_path`, `list_active_specs`.
>
> Its catalog is the package's own files, so it always matches the npm release it runs from. Stdout carries protocol messages only. It writes nothing anywhere. The CLI's other commands do not change. The release is a minor, prepared by the user after merge.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/methodology-mcp/local-stdio` |
| Parent Spec | `changes/methodology-mcp` (`family.md` row 1, `active`) |
| Depth | Standard (re-checked in design §8) |
| Type | Change |
| Deliverable | software |
| Approval Mode | `gated` for the final spec approval. Owner mandate, 2026-10-27: *"Answer process gates with the recommended option; stop only for product, cost or risk decisions, HALT, or the final spec approval."* |
| Proposal | `proposal.md` (approved with the parent, 2026-10-27). Parent OQ-1..OQ-4 at their defaults: hand-rolled JSON-RPC (no dependency), one free-text prompt argument, command text unchanged, `akili install` writes no client config |
| Release | minor (new command), prepared later under the Release Rules, not in this spec |
| Format source | `docs/specs/general-setup/` does not exist in this repository (`ls docs/specs/general-setup` → no such directory). The format follows the archived `changes/flow-diagram-animated` spec |
| Evidence baseline | `48c28ba`, Node `v22.12.0` locally; CI matrix Node 18 and 22 on Ubuntu, macOS, Windows (`.github/workflows/ci.yml:30-31`) |
| Status | Phase 1 gate: `auto-approved (owner mandate: recommended option "Continue")`, 2026-10-27 |

## 2. Executive Summary

Today the methodology reaches an AI tool only through `akili install`, which copies files into that tool's config directory. This spec adds a second channel: any MCP client starts `npx -y akili-specs mcp` and gets the commands as prompts, plus every methodology file on demand. The tool's config directory is not touched. It is local, offline-capable once the package is cached, and has no account or secret. `akili install` stays the full-fidelity path, because native skill loading is richer than reading a resource (parent R-1).

## 3. Glossary

| Term | Meaning |
|---|---|
| Server | The process started by `akili mcp` |
| Client | Any MCP host that starts the server as a subprocess and talks to it over stdio |
| Message | One JSON-RPC 2.0 object (or a batch array), UTF-8, one per line, no embedded newline (MCP 2025-11-25 *Transports*) |
| Catalog | The prompts and resources the server derives from the package directory it runs from |
| Shipped content | The files under `.claude/commands/`, `.claude/skills/`, `.claude/templates/` in the package, and the helper scripts the installer ships (`gsc_verify.py`, `parse_tests.js`) |
| Package version | `version` in the package's own `package.json` |
| Project directory | The directory a project tool inspects: the `projectDir` argument, or the server's working directory |
| Carve-outs | `docs/specs/` folders that are never a spec: `archive/`, `general-setup/`, `quick/`, `kaizen/`, `audits/`, `reviews/`, and family containers (a folder whose only spec file is `family.md`) (`.claude/commands/akili-propose.md` Step 0 item 4) |

## 4. System Context & Scope

Current state, with evidence run at `48c28ba` on 2026-10-27:

- The CLI dispatches `install`, `update`, `doctor`, `routing`, `list`, `notifications`, `help`, plus `init` and `check-update` handled before the switch. Any other command reaches `fail("Unknown command: …")` (`bin/akili.js:2884-2943`).
- Before the switch, every command except `check-update` and `routing --json` runs `checkForUpdates()` (`bin/akili.js:2896-2898`). That function returns at once when stdout is not a TTY (`bin/akili.js:2392`). Every command except `help`, `list`, `init`, `routing --json` prints the banner to stdout (`bin/akili.js:2900-2902`).
- The package has no runtime dependency (`grep -c '"dependencies"' package.json` → 0) and requires Node `>=18.0.0` (`package.json` `engines`).
- All 14 command files open with YAML frontmatter carrying `name` and `description` (`.claude/commands/akili-propose.md:1-7`; per-file check in design P-4).
- `npm pack --dry-run --json` lists 266 files under `.claude/`: the 265 files under `commands/`, `skills/` and `templates/` on disk, plus `.claude/README.md` (diff of the pack list against `find .claude/commands .claude/skills .claude/templates -type f`, run 2026-10-27). Every one of those 265 files has a text extension or is a text `LICENSE`/`NOTICE` file.
- `doctor --agents` builds each persona's section states from `parsePersona`, `sectionStates` and `resultExitCode` (`bin/persona.js`, exported at `:917`), plus `loadTemplates`/`digestsForRole`, which are private to `bin/akili.js` (`:1820-1840`). It reports them as coloured text only (`bin/akili.js:2058-2209`).
- No MCP server code exists in the package (`grep -rln "\bmcp\b" bin test scripts` → `bin/akili.js` only, at the `.mcp.json.example` copy sites).

In scope: the `mcp` subcommand, its core and transport modules, the three tools, tests, the `akili help` line, `docs/cli.md`, the README terminal table and *Learn more* row, and the CHANGELOG `Unreleased` note.
Out of scope: everything in the proposal's §5 *Explicitly out* list and the parent's Non-Goals. That covers streamable HTTP, remote hosting, write tools, client-config writing, and rewriting command text.

## 5. Stakeholders / Personas

| Persona | Need |
|---|---|
| Developer in an MCP client (Claude Code, Cursor, Codex CLI, OpenCode, Antigravity, Grok Bot) | Run AKILI commands without installing files into the tool |
| Agent inside that client | Fetch the skill or template a command names, and check project state, without guessing paths |
| Maintainer | No second artifact to release; the MCP content is the npm tarball |

## 6. Functional Requirements

### FR-1: `akili mcp` speaks MCP over stdio

`akili mcp` SHALL start a server that reads messages from stdin and writes responses to stdout. Both follow the MCP stdio transport: one message per line, UTF-8, no embedded newline. It SHALL keep running until stdin closes, then exit with code 0.

#### Scenario: Handshake

- GIVEN a client spawns `akili mcp`
- WHEN it sends `initialize` with `protocolVersion` `2025-11-25`, then the `notifications/initialized` notification
- THEN the server answers `initialize` with the same `protocolVersion`, `serverInfo` `{ name: "akili-specs", version: <package version> }`, capabilities `prompts`, `resources` and `tools` (none with `listChanged` or `subscribe`), and an `instructions` string
- AND the notification gets no response
- AND IT MUST answer with its latest supported version when the requested one is not in its supported set: `2025-11-25`, `2025-06-18`, `2025-03-26`, `2024-11-05`
- AND IT MUST answer `ping` with an empty result

#### Scenario: Stdout carries only messages

- GIVEN any session, including a failing request and a line that is not JSON
- WHEN every stdout line is parsed as JSON
- THEN every line parses, and every parsed object is a JSON-RPC 2.0 response
- BUT it must NOT print the banner, an update notice, a log line or a blank line on stdout. Diagnostics, if any, go to stderr
- AND IT MUST NOT contact the npm registry

#### Scenario: Malformed and unknown input

- GIVEN a running server
- WHEN it receives a non-JSON line → THEN it answers error `-32700` with `id: null`
- WHEN it receives an object without `jsonrpc: "2.0"` or a string `method` → THEN error `-32600`
- WHEN it receives a request for an unknown method → THEN error `-32601`, echoing the request `id`
- WHEN it receives a JSON array of messages → THEN it answers with one array of the responses for the requests in it; notifications get none, and a batch holding only notifications gets no output
- AND IT MUST echo each request's `id` exactly (number or string)
- BUT an unknown notification must NOT get a response
- AND a line split across two stdin chunks is still read as one message

#### Scenario: Shutdown

- GIVEN a running server
- WHEN the client closes stdin
- THEN the process exits with code 0 within 2 s, after writing the responses to every request it had already read

### FR-2: Commands are prompts

`prompts/list` SHALL list one prompt per `.claude/commands/*.md` file, and `prompts/get` SHALL return its text.

#### Scenario: List and get

- GIVEN the package's 14 command files
- WHEN the client calls `prompts/list`
- THEN it returns 14 prompts, one per file, sorted by name. Each has `name` and `description` taken from the file's frontmatter, and one argument `{ name: "arguments", required: false }`
- WHEN it calls `prompts/get` with `name: "akili-propose"` and `arguments: { arguments: "add-remember-me" }`
- THEN the result has one message with `role: "user"` and text content: the file's body after the frontmatter, with every `$ARGUMENTS` replaced by `add-remember-me`
- AND with no `arguments` value, every `$ARGUMENTS` is replaced by the empty string
- AND IT MUST answer an unknown prompt name with error `-32602`
- BUT the body must NOT be altered in any other way: no path rewriting (parent OQ-3), no trimming beyond removing the frontmatter block

### FR-3: Shipped content is readable as resources

`resources/list` SHALL list every shipped-content file, and `resources/read` SHALL return its exact content.

#### Scenario: List and read

- GIVEN the package at version `V`
- WHEN the client calls `resources/list`
- THEN it returns one resource per shipped-content file, with URI `akili://V/<area>/<path>`. `<area>` is one of `commands`, `skills`, `templates`, `scripts`, and `<path>` uses `/` on every OS. Each resource has a `name`, a `mimeType` and `size` in bytes
- AND the set of `commands/`, `skills/`, `templates/` URIs equals, file for file, the `.claude/commands/`, `.claude/skills/`, `.claude/templates/` entries of `npm pack --dry-run --json` for the same tree
- WHEN it calls `resources/read` on a listed URI
- THEN `contents[0].text` equals the file's bytes decoded as UTF-8, unchanged, with the same `uri` and `mimeType`
- AND a file that is not valid UTF-8 is returned as `blob` (base64) instead of `text`
- AND `resources/templates/list` returns an empty list

#### Scenario: Only listed files can be read

- GIVEN a running server
- WHEN `resources/read` gets a URI that is not in the list, for example a `..` segment, an encoded `%2e%2e`, an absolute path, a backslash path, another version, another scheme, or a file that exists in the package but outside shipped content (`package.json`, `bin/akili.js`)
- THEN it answers error `-32002` and reads no file
- BUT it must NOT resolve a URI by joining it onto a filesystem path. A URI is served only when it is a key of the catalog built at startup
- AND IT MUST NOT follow a symlink found while building the catalog. Symlinks and dotfiles are left out of the catalog

### FR-4: Read-only project tools

`tools/list` SHALL list exactly `doctor_agents`, `resolve_spec_path` and `list_active_specs`. Each has an `inputSchema` and the `readOnlyHint: true` annotation. `tools/call` SHALL run them against the project directory.

#### Scenario: `doctor_agents` matches the CLI

- GIVEN a project directory whose `.agents/` holds persona files
- WHEN the client calls `doctor_agents` with that `projectDir`
- THEN the result text is JSON with the package version and one entry per role (`leader`, `implementer`, `reviewer`, `tester`). Each entry has its file status and every section `{ id, state, matched? }`, plus an overall `drift: true|false`
- AND each section state equals what `akili doctor --agents` prints for that section, run with the same package on the same directory
- AND `drift` is `true` exactly when `akili doctor --agents` exits 1
- AND a missing `.agents/` gives `drift: true` with status `absent`, as the CLI does
- BUT it must NOT write, back up or fix any file, and offers no `fix` input

#### Scenario: `resolve_spec_path` applies the propose path rules

- GIVEN the input `argument` string
- WHEN its first whitespace-delimited token contains `/` → THEN `specPath` is that token and `rule` is `literal`
- WHEN the first token is kebab-case (`^[a-z0-9]+(-[a-z0-9]+)*$`) → THEN `specPath` is `changes/<token>` and `rule` is `bare-slug`
- WHEN neither applies → THEN `specPath` is `null` and `rule` is `free-text`, so the agent derives a slug
- AND the result names `specDir` (`docs/specs/<specPath>`), `proposalPath`, the remaining `context` text, and whether `specDir` exists in the project directory
- AND IT MUST reject, with `isError: true`, a literal path holding a `..` segment, a leading `/`, a backslash, or a drive letter

#### Scenario: `list_active_specs` lists spec folders

- GIVEN a project directory with `docs/specs/`
- WHEN the client calls `list_active_specs`
- THEN the result lists every folder under `docs/specs/`, at any depth, that holds at least one of `proposal.md`, `requirements.md`, `design.md`, `tasks.md`. Each entry has its spec path, the files present, `family: true` when it also holds `family.md`, and task counts from its `tasks.md` status cells (`[x]`, `[ ]`, `[~]`), or `null` when none are found
- BUT it must NOT list a carve-out, anything inside one, or a family container
- AND IT MUST NOT follow a symlinked directory
- AND a project with no `docs/specs/` gets an empty list, not an error

#### Scenario: Tool errors

- GIVEN a running server
- WHEN `tools/call` names an unknown tool → THEN error `-32602`
- WHEN `projectDir` is not an existing directory, or an argument has the wrong type → THEN a result with `isError: true` and a message naming the problem
- AND IT MUST NOT read files outside the project directory, apart from the package's own templates and `digests.json`

### FR-5: Documented, and nothing else changes

The CLI help, `docs/cli.md`, the README, and the CHANGELOG SHALL describe `akili mcp`. No other command's behavior or output SHALL change.

#### Scenario: Docs

- GIVEN the change is merged
- THEN `akili help` lists `mcp` with a one-line purpose
- AND `docs/cli.md` gains a section with how to start the server, what it exposes (prompts, resources with the URI form, tools), and a client setup table. Each row gives a config snippet whose format is confirmed at the vendor's documentation, or reads `not verified` with no snippet
- AND that section states plainly that skills reach the agent only when it reads them, so `akili install` stays the full-fidelity path
- AND the README *In your terminal* table gains an `akili mcp` row, and `docs/cli.md` *Commands* gains the same command
- AND `CHANGELOG.md` `Unreleased` describes the command
- BUT it must NOT claim a client renders prompts as slash commands unless the vendor docs state it

#### Scenario: No regressions

- GIVEN the change is merged
- WHEN `npm test`, `npm run verify:cli`, `npm run pack:dry-run` run
- THEN all pass, with the existing tests unchanged except the README terminal-table pin, which gains `mcp`
- AND `akili install`, `doctor`, `routing`, `list` produce the same output as before

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | No new entry in `package.json` `dependencies` or `devDependencies`. Node built-ins only, valid on Node 18 and 22 |
| NFR-2 | Startup to the `initialize` response ≤ 1 s on the CI runners. The catalog is built once at startup: file metadata, with content read on demand |
| NFR-3 | No file written, no network call, no child process spawned by the server |
| NFR-4 | `npm pack --dry-run` includes the new `bin/` modules and no test file |
| NFR-5 | No shipped file or test cites `docs/specs/changes/methodology-mcp/` (KZ-changes--archify-diagrams-1) |
| NFR-6 | `npm test`, `npm run verify:cli`, `npm run pack:dry-run` and `git diff --check` pass on all six CI legs |
| NFR-7 | Changed docs are English and follow `cognitive-doc-design` |

### Defect classes and gates

| Defect class | Gate |
|---|---|
| Non-message bytes on stdout (banner, log, blank line) | Spawned-process test: every stdout line of a scripted session parses as a JSON-RPC response (automated) |
| Wrong JSON-RPC semantics: id echo, notification answered, wrong error code, batch shape | Unit tests on the message handler, one per scenario clause (automated) |
| Line framing: a message split across chunks, several messages in one chunk | Unit test on the line reader with split and joined chunks (automated) |
| Catalog drift from the tarball | Test comparing the catalog with `npm pack --dry-run --json` (automated) |
| Path traversal or non-catalog read | Tests with each FR-3 hostile URI form, plus a spy asserting no read happened (automated) |
| `doctor_agents` diverging from `doctor --agents` | Parity test on persona fixtures in temp projects, comparing tool JSON with the CLI's per-section words and exit code (automated) |
| Spec-path or spec-listing logic wrong | Unit tests on fixture trees under the OS temp dir, never the live `docs/specs/` (automated; KZ-changes--archify-diagrams-1) |
| Process not exiting on stdin close | Spawned-process test with a 2 s bound (automated) |
| Node 18 API use, Windows path separators or CRLF | The six CI legs. Locally only Node 22.12 is available: **gap until CI runs**, owned by the PR's CI |
| Real client UX: prompts shown as commands, resources browsable, tools callable | **No automated check.** Substitute: the user's manual check in Claude Code at the `/akili-validate` HITL step. Other clients: **accepted gap**, recorded as `not verified` in the docs table |
| `npx -y akili-specs mcp` not reaching the server | A packed-tarball smoke test (`npm pack`, then `npx --yes <tgz> mcp` with `initialize` piped in), run once at T5; no `.tgz` committed |
| Docs over-claiming client support | Reviewer quote-check against the vendor-doc citations recorded in T5 (KZ-002) |
| Regression in other CLI commands | The existing suite plus `verify:cli` (automated) |

## 8. Requirement ID Index

| ID | Title | Tasks |
|---|---|---|
| FR-1 | stdio MCP server | T2 (handler), T3 (transport, CLI, process tests) |
| FR-2 | Commands as prompts | T1 (catalog), T2 (handler) |
| FR-3 | Resources | T1 (catalog, URI guard, tarball parity), T2 (handler) |
| FR-4 | Project tools | T4 |
| FR-5 | Docs, no regressions | T3 (help), T5 (docs, CHANGELOG, full verification) |
| NFR-1..7 | Non-functional | T1–T5 (see `tasks.md` coverage) |
