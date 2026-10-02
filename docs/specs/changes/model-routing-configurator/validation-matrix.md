# /akili-validate — clause-level matrix: `changes/model-routing-configurator` @ `3470c73`

Auditor: Fable (Implementers ran on `opus`). No `test-report.md` exists (no `/akili-test` run) — test evidence derived directly from `test/routing.test.js` (R), `test/routing-io.test.js` (IO), `test/registry-drift.test.js` (D), T8 evidence files (T8), and the auditor's own scratch probes (P, run in `mktemp -d`, never in the repo). `npm test` at HEAD: 226/226 pass (31 s).

Levels: PASS · WARN · FAIL · BLOCKED.

## FR-1 — interactive wizard

| Clause | Owner | Code evidence | Test / live evidence | Verdict |
|---|---|---|---|---|
| Statement: TTY wizard, 5 steps, comma multi-select, no dependency, Step 8E opt-in question, per-host CLI invocation, injectable `ask` seam | T4, T5 | `routing.js:920-943` `promptMultiSelect`/`promptOne`; `:1158-1370` `collectAnswers` (steps 1–8); `akili.js:2249-2252` `io.ask` over `readline/promises`, TTY-only | R `promptMultiSelect` ×2; R `collectAnswers: FR-1 two hosts … exactly 7 questions, in the DD-6 order`; T8 case 1 (expect pty, prompts drawn); `package.json` `dependencies` undefined | PASS |
| Two hosts happy path: fenced section, 5 columns, 8 wrappers, Reviewer `tools:`/`readonly: true`, answers file, summary lines | T3, T5, T8 | `buildPlan :711-878`; `planWrapper :621-675` (`tools: Read, Grep, Glob` / `readonly: true` Reviewer-only) | IO `fully specified --yes (FR-2)`; T8 case 1/1b files; P3 (live: 8 wrappers, Reviewer `model: opus` + `tools`, Cursor Reviewer `readonly: true`) | PASS |
| BUT must NOT write any wrapper for OpenCode, Antigravity, Codex | T3 | `buildPlan :774` loops `for (const h of hosts)` only | P3: `.opencode`, `.codex`, `.agents/agents` absent after a claude+cursor run; T8 case 1 | PASS |
| AND ≤ 8 prompts for two hosts, no adjust, every id packaged | T4, T8 | `collectAnswers` order: hosts · 2 rosters · 2 invocations · wrappers · confirm | R `exactly 7 questions` (Claude Code + Codex); T8 case 1 = 9 prompts **because Cursor has no packaged ids** (outside the clause's condition; Reviewer ruling recorded) | PASS |
| Adjust a tier: `t`, named tier, re-render, author ≠ auditor re-run, T3 = T2 rejected with one-line reason, repeat; any T1–T6, any host, one per round | T4, T8 | `:945-986` `promptTierAdjust`/`adjustRejection`/`placeOnTier`; confirm loop `:1308-1325` | R `FR-1 adjust — … rejected with a one-line reason and re-asked`; R `adjust works on any selected host and any tier`; T8 case 2 verbatim rejection line | PASS |
| No TTY + incomplete: usage error naming non-interactive form, non-zero, no write | T4, T5, T8 | `:1172-1184` non-TTY guard, `USAGE_FORM :877`; `akili.js:2255` `fail()` | IO `non-TTY, no flags…`; R `no TTY + missing roster … io.ask never called`; T8 case 9; P1 (exit 1, 102 ms, 0 paths) | PASS |
| BUT must NOT block / hang | T5, T8 | `isTTY` gate `:2249`; `rl` created only on a TTY | IO NFR-2 timing; T8 case 9 75–127 ms; Reviewer re-run 99–133 ms; P1 102 ms | PASS |
| AND succeeds without prompting when the answers file completes the picture (`--yes`) | T4, T5 | `usePrev :1163`, `knownHosts` from `prev.hosts :1179` | R `no TTY, the previous answers file completes the picture -> --yes succeeds`; IO idempotent re-run; P4 | PASS |
| Dry run: every planned write printed with path + shared-vocabulary token, `[dry-run]` prefix, table printed | T5, T8 | `applyPlan :2190-2206` prefix; `printRoutingSummary :2215-2217` table | IO `--dry-run: every line prefixed…`; T8 case 7; P5 | PASS |
| AND tree byte-identical; answers file not created | T5, T8 | `applyPlan` writes nothing under `dryRun` | IO same; T8 case 7 shasum; P5 porcelain 0 | PASS |

## FR-2 — non-interactive form and mixed input

| Clause | Owner | Code | Test / live | Verdict |
|---|---|---|---|---|
| Statement: 14 flags (12 new) declared; last `--models` per host wins; `+` joins tiers; `@` reserved; flags pre-answer; `--yes` + complete → no prompt | T2, T5 | `akili.js:324-337` declarations (strict parser), `:393-404` camelCase; `routing.js:110-166` `parseModels` | R `parseModels` ×13; R `--yes with complete flags asks 0 questions (TTY or not)`; `akili help` 13 option rows | PASS |
| Fully specified, no TTY → byte-identical to interactive, exit 0 | T4, T5 | plan-level equality (DD-14) | R `FR-2 the scripted happy path deep-equals the answers built from the equivalent flags`; R `FR-1 Claude Code + Cursor with three typed ids deep-equals FR-2's fully-specified flags`; IO `fully specified --yes` exit 0; P3 | PASS |
| BUT must NOT prompt | T4 | `yes` short-circuits every prompt | R `asks 0 questions`; T8 case 10A stdin `/dev/null`, zero prompts | PASS |
| Validation errors (7 listed inputs) → one error line naming value + accepted set | T2 | `parseHosts :22-33`, `parseModels` error branches `:124-151`, `parseCrossHost`, `parsePinReasons` | R one test per listed input (`claude,vscode`, `codex=…` ∉ hosts, `claude=` empty, `@T9`, unknown id without `@T`, T2+T3, dated without reason) | PASS |
| AND validate all flags before the first write — never a partial write then error | T2, T5 | `collectAnswers` returns `{error}` → `fail()` before `takeSnapshot`/`buildPlan`/`applyPlan` (`akili.js:2254-2270`); `checkRoutingPaths` before `applyPlan` | IO `validation error (FR-2): … writes no file`; P2 (valid `--hosts`, bad `--models cursor=foo` → 0 paths) | PASS |
| Mixed input: `--hosts claude` on a TTY skips host question, asks roster/invocation/wrappers/confirm | T4 | `:1187-1200` | R `FR-2 mixed input — --hosts claude skips the host question…` | PASS |
| AND pre-fill from answers file, flags override | T4 | `prevRoster`, `prevHosts`, `prevCli`, `prevTools`, `prevDir` | R `FR-6 pre-fill…`; R `flags override the previous answers file` | PASS |

## FR-3 — deterministic tier derivation

| Clause | Owner | Code | Test / live | Verdict |
|---|---|---|---|---|
| Statement: preference-list intersection; user ids prepended; first present; T3 first ≠ T2 (hard rule, else `unsatisfiable`); fallback second present or `—`; empty T4 → T2 + note; empty T6 → `<CONFIRM>` + cross-host note (owner named only when another host); pure, no ranks | T2, T9, T11 | `deriveTiers :185-257` steps 1–6 | R `deriveTiers` ×17; R `bin/routing.js is pure: requires only path (and ./persona.js)…` | PASS |
| Full Claude roster → packaged column; **every** host's full roster = packaged column | T2 | step 2 keeps placeholders in position | R `FR-3 full Claude Code roster -> the scenario's primaries and fallbacks`; R `for every host, the full packaged roster derives the packaged column` | PASS |
| AND same output every time, no environment reads | T2 | no `process`/`Date`/`Math.random` in module | R `deterministic — same input, same output; input not mutated`; purity test | PASS |
| Single-model roster: T3 note verbatim; wizard offers add / cross-host / leave | T2, T4 | `NOTE_UNSATISFIABLE :167`; confirm loop step 8 `:1327-1350` | R `single-model roster sonnet -> unsatisfiable, T3 note verbatim`; R `accept offers add / cross-host / leave`; T8 case 1 step 8 fired live | PASS |
| AND no wrappers for that host while unsatisfiable; cross-host → Leader/Implementer/Tester, Reviewer skipped + noted | T3, T5, T8 | `buildPlan :783-791` | R `buildPlan single-model roster -> skipped … ×4`; R `cross-host T3: three wrappers, no Reviewer`; IO `single model under --yes`; T8 case 8a/8b | PASS |
| AND `--yes` exits 0 with `skipped (author ≠ auditor unsatisfiable)` | T5, T8 | `exitCode` only 1 on `refused` `:872` | IO `single model under --yes (DD-5): exit 0`; T8 case 8 | PASS |
| **BUT must NOT write a Reviewer wrapper whose model equals the Implementer's — on any host, in any mode** | T2, T3 | `deriveTiers` compares **registry ids** (`:214`); `planWrapper` agy-yaml maps the id to `entry.wrapperModel` (`:641`) **after** the check | R `T2's pick placed at the T3 head (sonnet@T3) is skipped`; **P-A (auditor probe):** `--hosts antigravity --models antigravity=gemini-3.8-flash-medium,gemini-3.8-flash-high@T3 --wrappers yes --yes` → `authorAuditor: ok`, `akili-reviewer/agent.md` `model: flash`, `akili-implementer/agent.md` `model: flash` | **FAIL** (user-placement path; packaged default unaffected) |
| Unknown id: interactive placement question; non-interactive `@T` required; dated id asks/requires reason; footnote rendered | T2, T4, T3 | `parseModels :135-151`; `fillReason :1024`; `promptRoster`; `collectPins/cellValue :476-494` | R `unknown id via *other* -> one placement question`; R `dated id -> reason question`; R `dated id: rendered with a pin marker and its recorded reason (C9)` | PASS |
| AND recorded with `source: "user"` and given tiers, never a guessed rank | T2, T4 | `entry = { id, source: "user", tiers }` `:145` | R `recorded source user with the given tiers`; P3 answers file | PASS |

## FR-4 — `## Model Routing` section writer

| Clause | Owner | Code | Test / live | Verdict |
|---|---|---|---|---|
| Fence `id=model-routing since=<pkg>`; root `AGENTS.md`; never `CLAUDE.md`; provenance check; stale ids reported not edited | T3 | `replaceFencedSection :403-449`; `sinceTag = v${pkgVersion}` `:756`; stale `:850-861`; `takeSnapshot` reads `CLAUDE.md` only | R replacer ×14; R `stale ids … reported, never edited`; P7 fence line | PASS |
| Section elements (philosophy, six tiers, phase→tier, 7-column table + `Updated:`, CLI row every host, cross-host line, "edit only" instruction, Effort dial a–f) | T1, T3 | `.claude/templates/model-routing.section.md`; `sectionContext :533` 8 placeholders | R `renderSection: fills the eight template placeholders`; D `section template: its {{placeholders}} are exactly the fixed set`; T8 case 1 dump | PASS |
| All five columns always present | T3 | `tableColumns :468` iterates `HOST_KEYS` | R `renderRegistryTable: no mapping -> 7 columns`; R `buildPlan section: … 7 columns` | PASS |
| Six states (a)(a′)(b)(c)(d)(e)(f) with the named tokens; (a′) byte-equal → `unchanged` (T3-gate) | T3, T5, T8 | `:403-449` | R replacer tests for each state; IO states (a′),(b); T8 cases 4, 5, 6a, 6b | PASS |
| (b) TTY asks adopt/skip | T5 | `runRouting :2262-2268` | no unit test (caller-side prompt, DD-14 seam does not reach it); no T8 case on a TTY; **P-adopt (auditor, expect pty):** diff printed, prompt `[a]dopt / [s]kip? [s]`, `a` → fence written, `## Other` kept | PASS (auditor-live) |
| AND exactly one token for `AGENTS.md`; CRLF detected, EOL preserved | T3 | `detectEol :285`, `splitLines :293`, `fencedBlock(…, eol)` | R `CRLF file -> fence detected, output keeps \r\n` | PASS |
| BUT must NOT touch `CLAUDE.md` in any state; report line when it holds a section | T3 | `buildPlan :766-767` report only; no write path names `CLAUDE.md` | R `buildPlan CLAUDE.md with a Model Routing section -> one report line, never a write`; P3 live: report printed, `git diff -- CLAUDE.md` empty | PASS |
| Unselected host keeps packaged cells incl. placeholders | T3 | `packagedColumn :457` | R `renderRegistryTable: no mapping -> packaged default cells` | PASS |
| AND keep a previously filled column for an unselected host (mapping may hold hosts ∉ `hosts[]`) | T3 | `perHost :696-709` keep-previous-else-packaged | R `hosts: [cursor] after a Claude run keeps the Claude column and drops its CLI cell` | PASS |
| AND CLI row only from confirmed `cli.<host>`; else `<CONFIRM>` never the suggestion | T3, T4 | `sectionContext` CLI row | R `CLI row confirmed-only`; P7 live row: `claude` · `<CONFIRM>` ×3 · `agent` | PASS |

## FR-5 — Step 8E wrappers

| Clause | Owner | Code | Test / live | Verdict |
|---|---|---|---|---|
| Four wrappers per selected satisfiable host; Leader T1 / Implementer T2 / Reviewer T3 / Tester T2 (collapse noted); body references `.agents/<role>.md`, never inlines | T3, T5 | `ROLE_TIER`, `personaSentence :604`; Tester-collapse report `:815` | R `renderWrapper` ×5 hosts; R `Tester collapse noted`; P3 live report line | PASS |
| Unsatisfiable → no wrappers; cross-host → three | T3 | `:783-791` | R + IO + T8 case 8 (see FR-3) | PASS |
| Existing wrappers skipped unless `--force` | T3, T5, T8 | `:800-806` | IO `skip-by-default … --force overwrites`; R same | PASS |
| `--wrappers no` → `skipped (wrappers=no)` | T3, T5 | `:779-781` | IO `--wrappers no`; R | PASS |
| Table: Claude `tools: Read, Grep, Glob`; OpenCode none + reported, dir overridable; Antigravity `wrapperModel`, `subagent: true`, `mainAgent`, nested path; Codex TOML fields + `sandbox_mode`, efforts; Cursor `readonly: true`, bracket only for confirmed rung | T3 | `planWrapper :621-675` | R one snapshot test per host; R `null for a cross-host Reviewer, a placeholder tier, an Antigravity id without wrapperModel` | PASS |
| Skip-by-default scenario + `— model drift: file says X, mapping says Y` | T3, T5 | `declaredModel :683`; `:802-805` | IO `skipped with drift`; R same | PASS |
| Restriction omitted and reported (Antigravity *don't know*) | T3 | `dec.restriction = "omitted: names unconfirmed"` `:731`; report `:809` | R `restrictions and effort: omitted + reported`; P-A live: `Antigravity Reviewer: read-only by instruction (tools omitted — names unconfirmed)` | PASS |
| BUT must NOT write a `tools:` list copied from documentation | T3 | only `dec.antigravityTools` (user-supplied) reaches `tools:` `:644`; `grep view_file\|grep_search bin/` → 0 | R Antigravity `tools only when confirmed` | PASS |
| AND same reporting rule for OpenCode in every run | T3 | `:806-808` (fires whenever the Reviewer wrapper is planned, incl. `unchanged`/`skipped`) | R `renderWrapper OpenCode: … no Reviewer restriction`; R buildPlan restrictions test | PASS |

## FR-6 — answers file and idempotence

| Clause | Owner | Code | Test / live | Verdict |
|---|---|---|---|---|
| Fields (§5.2); `updatedAt` only on canonical change; `Updated:` = month of `updatedAt` | T3 | `core :736-747`, `canonicalAnswers :270`, `changed :749` | R `canonicalAnswers` ×2; R `Updated: from updatedAt`; R `idempotent re-run across a month boundary` | PASS |
| Re-run pre-fills every prompt | T4 | prev* lookups | R FR-6 pre-fill | PASS |
| `--yes` unchanged → no diff; `no changes` printed | T3, T5, T8 | `:865` | IO `idempotent re-run (FR-6): … no changes; porcelain empty`; T8 case 3; P4 | PASS |
| SHALL NOT record run results | T3 | `finalAnswers` carries no `writes`/tokens | R `answers file: only §5.2 fields, no run results` | PASS |
| BUT must NOT require re-typing a `source: "user"` id | T4 | `promptRoster` pre-checks `current` entries | R `previous ids (user id included) pre-checked, never re-typed`; T8 case 2 P3 | PASS |

## FR-7 — packaged roster and drift test

| Clause | Owner | Code | Test / live | Verdict |
|---|---|---|---|---|
| Ship `model-registry.json` with the named fields | T1 | file present, fields per §5.1 | D 5 registry tests | PASS |
| Drift test over five host columns, header anchor `\| Tier \| Claude Code \|`; head in host cell; second in host cell or Fallback column | T1 | `test/registry-drift.test.js:114-182` | D tests ×5 pass | PASS |
| AND goes red when one id changes in either file | T1 | — | execution T1 red run; **auditor mutation (HEAD extract):** JSON `mimo-v2.5→v2.6` → `# fail 1`; doc `haiku→haiku2` → `# fail 2` | PASS |

## FR-8 — constitution delegates

| Clause | Owner | Code / text | Evidence | Verdict |
|---|---|---|---|---|
| Step 8C: ask in chat, run `akili routing … --yes --json`, read JSON; probe `akili help` **before composing**; both stderr forms named; inline Fallback same fence id; Step 8E "generated by the same run", examples "from the mapping"; item 5 re-worded with both prohibitions verbatim; Step 9 reads JSON and says when Fallback used | T6, T10 | `akili-constitution.md:467-551` (probe `:496-500`, branch table `:516-519`, Fallback `:539-551`), `:651-654` item 5, `:758` Step 8E, `:781/:817/:855` "from the mapping", `:1416-1420` Step 9, checklist `:1453` | T8 case 10A (zero prompts, 11 keys, Step 9 from JSON); case 10B (older binary → `Unknown option '--project'`, Fallback by hand, a′ proof); T10 two-shim probe | PASS |
| BUT must NOT send the user to a terminal | T6 | `:479` "Never send the user to a terminal…" | case 10A | PASS |
| CLI absent → Fallback, same fence id, later run = (a′), Step 9 says so | T6, T8 | `:539-551`, `:1416` | case 10B Fallback + a′ (`refused…`, `--force` → `overwritten`) | PASS |
| Obligation sweep | T6 | — | execution T6 sweep (falsifier run first) | PASS (not re-walked by auditor; recorded) |
| Branch B re-walk after T10 | T8 | — | **not re-walked live** — verified by component only (recorded gap, execution closing record) | WARN |

## FR-9 — docs, audit, root rule

| Clause | Evidence | Verdict |
|---|---|---|
| `akili help` + `docs/cli.md` document `routing` and flags | `akili.js:210, 237-250`; `docs/cli.md:82, 120-132, 315-452` | PASS |
| `docs/model-routing.md` *How to apply* names the command first | `:772` "First, every host: run `akili routing`…" | PASS |
| README mentions at `:53`, `:885-904` | `README.md:53, 439, 896` | PASS |
| `/akili-audit` third signal | `akili-audit.md:56` "…wrappers, `.agents/model-routing.json` …, and the fenced `## Model Routing` section disagree with one another" | PASS |
| `AGENTS.md:37` carve-out; `docs/model-routing.md` "No installer changes" carve-out | `AGENTS.md:37`; `docs/model-routing.md:814-817` | PASS |
| CHANGELOG minor entry | `## [Unreleased] › Added` names release class minor | PASS |
| Aggregate-claim falsification (KZ-002) | execution T7 greps quoted | PASS |

## FR-10 — zero regression

| Clause | Evidence | Verdict |
|---|---|---|
| `npm test` green | 226/226 at HEAD (auditor run) | PASS |
| `verify:cli` (`akili list`) unchanged | auditor: `git archive 8eb0227` vs HEAD, fixture `HOME` → `list` IDENTICAL | PASS |
| `help` gains routing line + flags | `akili.js:210, 237-250` | PASS |
| `install --tool all --dry-run`, `doctor --tool all` byte-identical to `8eb0227` | auditor diff on fixture `HOME`: both IDENTICAL | PASS |
| `grep -n "^model:" .claude/commands/*.md` empty | 0 | PASS |
| no `dependencies` | `p.dependencies === undefined` | PASS |

## FR-11 — closing validation

| Clause | Evidence | Verdict |
|---|---|---|
| Cases: interactive two-host, non-interactive, dry-run, idempotent, single-model `--yes`, states (a)–(d), FR-8 delegation in a Claude Code session; evidence in `execution.md` | T8 entries + two evidence files (cases 1–11); Reviewer non-author re-run | PASS |
| Validation blocked → `[~]` | not triggered | n/a |
| Note: requirements §8 "Real-host acceptance … covered on Claude Code by FR-11's scratch run" — no case loads the generated Claude wrapper in a Claude Code session | recorded gap (closing record) | WARN |

## NFR-1…8

| ID | Evidence | Verdict |
|---|---|---|
| NFR-1 no deps | `package.json` no `dependencies` key | PASS |
| NFR-2 never hangs, < 2 s | IO timing test asserts < 5 s hang guard and reports ms; live 75–133 ms (T8, Reviewer, auditor 102 ms) | PASS |
| NFR-3 atomic, scoped writes | `atomicWriteFileSync` in `applyPlan :2198`; `checkRoutingPaths :2178`; P3 porcelain lists only `AGENTS.md`, `.agents/model-routing.json`, `.claude/`, `.cursor/` | PASS |
| NFR-4 cross-platform CI matrix green | `ci.yml` matrix ubuntu/macos/windows × 18/22 runs `npm test`; **HEAD is 18 commits ahead of `origin/master` — no CI run exists for any commit of this spec** (last CI on master: `e270428` v2.31.0) | BLOCKED → WARN until pushed |
| NFR-5 pure core | R purity test (`path` + `./persona.js` only) | PASS |
| NFR-6 output ≤ 1 line/file + 1/host + 1 AGENTS.md | one token line per file holds; **reports exceed 1/host** (Cursor: effort-bracket + Tester-collapse = 2; Antigravity up to 3) — design §7 `reports[]` enumerates them, NFR text not amended | WARN (low) |
| NFR-7 claims dated | `planWrapper` comments cite Step 8E pins + `Last verified` URLs; design §5.5 Pin column | PASS |
| NFR-8 fence grammar = `persona.js` regexes | `persona.js` exports `SECTION_OPEN_RE`/`SECTION_CLOSE_RE`; R `the fence it writes is the grammar persona.js parses (NFR-8)` | PASS |
