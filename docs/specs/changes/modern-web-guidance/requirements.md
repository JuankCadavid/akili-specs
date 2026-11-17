# Requirements: Modern Web Guidance for web UI work (`modern-web-guidance`)

> **Answer first.** Eleven behaviors. Before anything is wired, a recorded security verdict on the pinned upstream (FR-1). Governance admits Modern Web Guidance (MWG) as an environment-provided skill, reached only through recorded selectors (a web UI task's route, or a typed audit mode) and never through a skills list (FR-2). The design matrix gives MWG one job, platform implementation for web UI, under Impeccable's lead (FR-3). Every AKILI-directed MWG call passes a gate covering availability, Node ≥ 22, consent and telemetry, and survives a failed call (FR-4), and uses an exact version: an AKILI default, overridable per project (FR-5). MWG's disclosure lands in task evidence, never in spec documents or gate messages (FR-6). Specify, execute, test and validate reach MWG through the bridge (FR-7). `/akili-audit` gains an opt-in, report-only `legacy-scan` (FR-8). `/akili-constitution` can write a Skill Map row (FR-9). `akili install` ships and installs nothing new; the docs give per-tool install routes (FR-10). Docs and CHANGELOG state only verified facts (FR-11). Projects without a web UI see no change.

## 1. Document Control

| Field | Value |
|---|---|
| Spec Path | `changes/modern-web-guidance` |
| Type | Change |
| Deliverable | software |
| Depth | Standard. Rules text across one skill reference, governance, six commands and docs; plus a third-party supply-chain gate. No data, API or auth change |
| Approval Mode | `gated`. JC, 2026-11-17: "If any gate, question, or approval comes up, stop and ask clearly with the options; do not decide it yourself." |
| Source | `proposal.md`, approved by JC 2026-11-17 08:08 UTC-5: D1 Option B, D2 default + override, D3 `/akili-audit` only, D4 brief is the source |
| Branch / baseline | `feat/modern-web-guidance` at `fb682eb` (from `dev` `decf0fc`); `npm test` 2012 pass / 0 fail on Node 22.23.4 (run 2026-11-17) |
| Change from proposal | The proposal's Scope named a `docs/skills/modern-web-guidance.md` page. Phase 1 found that environment-provided skills have no such page and that `test/docs-overview.test.js` holds `docs/skills/` to the packaged folders (§4 C3, C4). The docs home moves to `docs/skills/impeccable-bridge.md` plus the environment-tool rows (FR-11) |
| Upstream pin | `GoogleChrome/modern-web-guidance` tag `v1.0.1` = commit `64a6d708f5a43f2cd3fde5d4d7db3905ba1bdf65`; npm `modern-web-guidance@1.0.1` (integrity `sha512-5ztUh5F1…fIiGzg==`, shasum `06a05ddadd0f87f29881b16705faf55c2a5dc83a`) |
| Phase 1 gate | Continue — approved by JC, 2026-11-17 |
| Phase 2 corrections | C11 narrowed, C12 added, FR-11 BUT clause aligned: Antigravity's route and the eval figures were found in upstream README `v1.0.1` during design exploration (factual corrections, logged here) |
| Judgment-day fix round 1 amendments (pending JC at the Phase 2 gate) | JC chose **Fix only** with warnings included (2026-11-17). Amended: Glossary *Selector*; C13 added; FR-1 AND (telemetry); FR-2 (three selectors, no skills-list path); FR-4 (`consent needed` names telemetry, no answer = declined, new `call failed` state, telemetry opt-out on every call); FR-11 BUT (MDN citable). Source: `judgment.md` S-1, S-4, S-7, W-2, X-3, X-12; design P-8, P-24, P-25 |

## 2. Executive Summary

AKILI routes design (Impeccable) and framework idioms (stack skills), but nothing covers which native web platform feature to use, with which fallback. MWG fills that gap. It is third-party and runs a networked npm CLI, so AKILI admits it as a referenced, environment-provided skill: reviewed first, gated per call, version-pinned, and reached only by web UI work.

## 3. Glossary

| Term | Meaning |
|---|---|
| MWG | Modern Web Guidance: the upstream skill (`SKILL.md`) plus its npm CLI (`search`, `retrieve`, `list`, `legacy-scan`) |
| Pin | The exact MWG version an AKILI-directed call uses: AKILI's default, or the project's override (FR-5) |
| AKILI-directed call | An MWG CLI invocation that an AKILI command, skill reference or persona tells the agent to run |
| Web UI task | A UI task whose surface renders in a browser (HTML/CSS/client-side JS, any framework). A native iOS or Android screen (ENV-3) is not one |
| MWG gate | The availability, Node, consent and telemetry check of FR-4, with its failure outcome |
| Disclosure | The `### Modern Web Guidance` section upstream `SKILL.md` *Step 4* asks for at the end of a response |
| Selector | A recorded choice that lets a step reach MWG: a web UI task's route field (FR-3) and that spec's test/validate reads of the guide ids it recorded, or a command mode the user types (`/akili-audit modern-web`, FR-8) |

## 4. System Context & Scope

Current behavior (each claim cited as run on 2026-11-17 at `fb682eb`, or marked):

| # | Today | Evidence |
|---|---|---|
| C1 | The design matrix names a lead per activity and lists supporting skills; it names no platform-implementation skill | `.claude/skills/impeccable-bridge/references/design-routing.md` → *Matrix*, *Supporting line*, *Expertise cards* |
| C2 | Command text may load-direct an environment-provided skill only behind a `Deliverable` selector plus that skill's own availability gate; the one instance is `Deliverable: video` → `video-production` → `hyperframes` | `docs/skills/governance.md` → *Binding Taxonomy*, environment-provided rule 4 |
| C3 | Environment-provided skills are documented as rows in `docs/overview.md` (optional tools table) and `docs/cli.md` (conditional dependencies). None has a `docs/skills/<name>.md` page | `docs/overview.md:150`; `docs/cli.md:31-32`; `ls docs/skills` shows no `archify.md`, `hyperframes.md` or `playwright-cli.md` |
| C4 | `test/docs-overview.test.js` holds `docs/skills/` pages and inventory rows to the packaged skill folders | `test/docs-overview.test.js:249-307` |
| C5 | The installer writes to per-user tool directories; it has no per-project filter | `bin/akili.js:115-140` |
| C6 | AKILI CI runs Node 18 and 22; `engines.node >=18.0.0` | `.github/workflows/ci.yml:31`; `package.json:51-52` |
| C7 | `/akili-audit` has two modes: drift (default) and `design`; both are report-only and write under `docs/specs/audits/` | `.claude/commands/akili-audit.md:20`, *Design Evaluation Mode* |
| C8 | Upstream `SKILL.md` at the pin: 9,801 B, blob `7483c781ee0045cea7558cff21513ae0ef468669`. It invokes `npx -y modern-web-guidance@latest` for every command and says "MANDATORY: Execute FIRST for all HTML/CSS and clientside JS tasks" | `gh api "repos/GoogleChrome/modern-web-guidance/contents/skills/modern-web-guidance/SKILL.md?ref=64a6d708…"` |
| C9 | Upstream license Apache-2.0 (`LICENSE` blob `d645695673349e3947e8e5ae42332d0ac3164cd7`, 11,358 B); `engines.node >=22.0.0`; the npm package is 281 files, 16,720,506 B unpacked | `gh api …/LICENSE?ref=64a6d708…`; `npm view modern-web-guidance@1.0.1 engines dist` |
| C10 | Upstream ships plugin manifests for Claude Code (`.claude-plugin/marketplace.json`, marketplace `googlechrome`), Codex, Cursor, `.agents/plugins` and `.grok-plugin` | `gh api …/git/trees/v1.0.1?recursive=1` and manifest reads |
| C11 | Upstream README `v1.0.1` *Alternative Installation Methods* gives routes for Claude Code, Codex and Antigravity (`agy plugin install …`), a generic `npx skills add` route, and a "Grok Build CLI" route. It has no Cursor- or OpenCode-specific route. Whether "Grok Build" is AKILI's Grok Bot target is `UNVERIFIED — confirm at source before relying on it` | README.md at `64a6d708…`, read 2026-11-17 (design P-10) |
| C12 | Upstream README `v1.0.1` *Recent eval results snapshot* reports 52–60% unguided → 82–96% guided on Google's own simulated tasks (Nov 4–8 rows); README line 9 names Chrome, Edge, Firefox and MDN as stewards | README.md at `64a6d708…` (design P-15, P-24) |
| C13 | The CLI at the pin sends usage telemetry (search queries, guide ids, agent name) to Google unless `DISABLE_TELEMETRY` is `1` or `true` | npm tarball `modern-web.mjs` `isTelemetryEnabled`, `watchdog/main.js` endpoint; README *Telemetry & Privacy* (design P-8) |

**In scope:** governance, the bridge's routing and a new reference file, pointer lines in `/akili-specify`, `/akili-execute` (through task skill lists and the Build route), `/akili-test`, `/akili-validate`, `/akili-audit`, `/akili-constitution` Step 8D, docs, CHANGELOG, tests.

**Out of scope:** copying any MWG byte into the package; any installer or doctor code change; a `docs/skills/modern-web-guidance.md` page (C3, C4: the docs home is the bridge's page and the environment-tool rows, FR-11); a `legacy-scan` step in `/akili-constitution` (D3); a release.

## 5. Stakeholders

| Who | Needs |
|---|---|
| Teams building web UIs with AKILI | Modern platform code, with fallbacks, when MWG is installed; nothing breaks when it is not |
| Teams without a web UI, or native-only | No new prompts, no new steps |
| Brownfield web teams | A list of modernization opportunities they can turn into proposals |
| JC (maintainer) | Third-party content and network calls admitted only after review and consent; no `@latest`; AKILI's Node 18 floor kept |

## 6. Functional Requirements

### FR-1: Security verdict before wiring

The spec SHALL record a security verdict on the pinned upstream before any AKILI text routes to MWG.

#### Scenario: Review passes

- GIVEN `SKILL.md` and `LICENSE` fetched at the pin, each matching its blob SHA (C8, C9), and the npm tarball `modern-web-guidance@1.0.1` matching its recorded integrity
- WHEN they are reviewed for prompt injection, instructions to fetch or run remote content, auto-install flags, network and telemetry behavior, credential handling, destructive commands, and hidden or encoded content
- THEN the verdict, every scan command verbatim, its exit status, the hits and their classification are recorded in `execution.md`
- AND the "MANDATORY: Execute FIRST" trigger (C8), the unpinned `npx -y …@latest` form, the CLI's network fetch, its usage telemetry (C13) and its stderr update prompts are each classified, with the AKILI requirement that handles them named (FR-3, FR-4, FR-5)
- BUT it must NOT add any routing, gate or docs text that names MWG before the verdict is recorded
- AND IT MUST treat a scanner exit status of 2 as "not run", never as 0 hits, and check hidden characters with a tool that supports the pattern on the host (perl, not BSD `grep -P`)

#### Scenario: Review fails

- GIVEN any finding the review classifies as unsafe and not handled by FR-3 to FR-6
- WHEN the verdict is `FAIL`
- THEN the run stops for JC through the Pivot Protocol, and no MWG wiring lands

### FR-2: Governance admits MWG as environment-provided and lets a route select it

`docs/skills/governance.md` SHALL list MWG among the environment-provided skills and SHALL permit a web UI task's route to select it behind the MWG gate.

#### Scenario: Category and selector

- GIVEN the governance file
- WHEN its environment-provided rules are read
- THEN MWG is named as environment-provided (Google Chrome, Apache-2.0), referenced and never vendored
- AND rule 4 names three permitted selectors: a spec's `Deliverable` row (unchanged); a web UI task's route field selecting MWG (FR-3), with that spec's test and validate reads of the guide ids it recorded; and a command mode the user types (FR-8). Each reaches the skill only through a packaged bridge that runs the skill's gate first
- AND IT MUST state the outcome of a missing skill per selector: a `Deliverable`-selected skill still stops at its gate; the route and typed-mode selectors continue without it (FR-4)
- BUT it must NOT let any command load-direct MWG outside the bridge, must NOT admit MWG to the *Vendored third-party (verbatim)* category, and MWG must NOT be named in a task's skills list, a Leader brief's lead or support names, or a Skill Map row as a skill to assign or load (a Skill Map MWG row is an availability and pin note only)
- AND every restatement of rule 4's old single-instance claim (for example "Today's instance", or `docs/cli.md`'s environment-provided row) is updated to match, keyed on the obligation, not on the word `video`

### FR-3: One job in the design matrix: platform implementation for web UI

The design routing matrix SHALL give MWG a supporting role, platform implementation, for web UI tasks only, and SHALL never make it a lead.

#### Scenario: Web UI task

- GIVEN a UI task whose surface renders in a browser, in ENV-0, ENV-1 or ENV-2
- WHEN its route is written at `/akili-specify`
- THEN the route carries the MWG field, naming the pin source
- AND the expertise card says MWG decides native platform features and their fallbacks (dialog, popover, anchor positioning, container queries, forms, accessibility semantics, Core Web Vitals) and must not decide the aesthetic, page mode, direction or framework idiom
- AND Impeccable (or `frontend-design` at ENV-0) stays the activity's lead

#### Scenario: Not a web UI task

- GIVEN a backend task, a non-UI task, or an ENV-3 native screen
- WHEN its route is written
- THEN the MWG field is absent, or reads `none — <reason>` on a UI route
- BUT it must NOT load MWG, run its gate, or print its install routes

### FR-4: The MWG gate runs before every AKILI-directed call

Before an AKILI-directed MWG call, the agent SHALL run the MWG gate and act on its outcome.

#### Scenario: Gate outcomes

- GIVEN a step that reaches MWG through its selector
- WHEN the gate runs
- THEN it records exactly one state in the phase's report:

  | State | Condition | Action |
  |---|---|---|
  | `ready` | Skill loadable (standalone or plugin-namespaced), Node ≥ 22, consent given this session | Load MWG; make the pinned call (FR-5) |
  | `consent needed` | Skill and Node present, no answer yet this session | Ask once per session, naming the network fetch, the pinned package and the usage telemetry AKILI turns off; take the row the answer selects |
  | `declined` | User declined, or did not answer | `not run: declined`; continue |
  | `node < 22` | Node absent or older than 22 | `not run: Node <version> (needs ≥ 22)`; continue |
  | `missing` | Skill not loadable | `not run: skill not installed`; print the install routes (FR-10) once per session; continue |
  | `call failed` | A call after `ready` fails (offline, no network, read-only npm cache, unpublished pin) | Retry once with the upstream-documented remedy; then `not run: call failed (<reason>)`; continue |

- AND every state except `ready` lets the step finish with Impeccable or its fallback and the stack skills, as today
- AND IT MUST turn the CLI's usage telemetry off on every AKILI-directed call (C13), unless the user opted in when asked
- BUT it must NOT make any MWG call before `ready`, install anything without consent, treat a pre-approved approval mode as consent, or fall back to an unpinned call after a failure
- AND IT MUST NOT fail, stop or block a task, test suite, validation or audit because MWG is not `ready`

### FR-5: Exact-version pin, default plus project override

Every AKILI-directed MWG call SHALL name an exact version.

#### Scenario: Default pin

- GIVEN no project override
- WHEN the agent makes an AKILI-directed call
- THEN the package is named `modern-web-guidance@<AKILI default>`, today `1.0.1`
- AND the AKILI default changes only through a spec

#### Scenario: Project override

- GIVEN the project `## Skill Map` MWG row records an exact version
- WHEN the agent makes an AKILI-directed call
- THEN that version is used, and the phase report names it as the pin source
- AND IT MUST accept only an exact `MAJOR.MINOR.PATCH` (optionally with a prerelease suffix); a range, a dist-tag (`latest`, `next`) or an empty value falls back to the AKILI default and is reported

#### Scenario: Upstream text says `@latest`

- GIVEN MWG's own `SKILL.md` tells the agent to run `npx -y modern-web-guidance@latest …`
- WHEN the call is AKILI-directed
- THEN the pinned form replaces `@latest`, and AKILI's rule takes precedence for that call
- BUT no AKILI-shipped file may contain the string `modern-web-guidance@latest`

### FR-6: Disclosure and trigger stay inside AKILI's contracts

#### Scenario: Disclosure placement

- GIVEN an AKILI step where MWG guides were retrieved, or searched and none applied
- WHEN the step reports
- THEN the disclosure (guide ids, what each changed, or why none applied) goes into the Implementer's completion report and from there into `execution.md`, or into the evidence section of the test, validation or audit report
- BUT it must NOT be appended to `requirements.md`, `design.md`, `tasks.md`, a HITL gate message, a commit message or a PR description

#### Scenario: Trigger containment

- GIVEN MWG's "MANDATORY: Execute FIRST" description (C8)
- WHEN an AKILI step is not on a web UI route
- THEN MWG is not loaded, whatever its description says

### FR-7: Phase wiring through the bridge

Each phase SHALL reach MWG only through the bridge and only for web UI work, with one pointer line per site.

#### Scenario: Per phase

- GIVEN a spec with web UI tasks
- WHEN each phase runs
- THEN `/akili-specify` writes the MWG field in each web UI task's route (FR-3)
- AND `/akili-execute`'s Build route runs the gate and, when `ready`, searches and retrieves the guides for the task's platform capabilities before UI edits, then checks the code against them (upstream *Step 3*), and the completion report carries the disclosure (FR-6)
- AND `/akili-test` gives a frontend or E2E Tester the guide ids recorded in `execution.md` as a source for platform-behavior assertions, when there are any
- AND `/akili-validate`'s UI design review checks the built code against the guides recorded in `execution.md` and reports contradictions as findings
- BUT no command copies the gate table, the pin rule or a matrix row; each names the bridge file and section
- AND IT MUST leave specs with no web UI task unchanged in every phase

### FR-8: Opt-in brownfield inventory in `/akili-audit`

`/akili-audit` SHALL offer MWG's `legacy-scan` as an opt-in, report-only inventory for projects with web UI code.

#### Scenario: Scan runs

- GIVEN a project with web UI source and the MWG gate `ready`
- WHEN the user opts in
- THEN `legacy-scan <path> --json` runs with the pin
- AND each finding is verified against its `keepWhen` / `dropWhen` rubric, false positives dropped and counted
- AND a report is written under `docs/specs/audits/` stating the pin, the path scanned, the gate state, the kept and dropped counts, and that `legacy-scan` covers only a subset of the guides (upstream: about 20%)
- AND the report routes findings to `/akili-propose` (groups) or `/akili-quick` (trivial), never to tasks of a running spec
- BUT it must NOT edit any file outside `docs/specs/audits/`, run upstream's *Modernize* step, or run without the user's opt-in

#### Scenario: Not applicable or not ready

- GIVEN no web UI source, or a gate state other than `ready`
- WHEN `/akili-audit` runs
- THEN the scan is not offered, or is recorded `not run: <state>`, and the audit otherwise behaves as today

### FR-9: Skill Map row from `/akili-constitution`

`/akili-constitution` Step 8D SHALL be able to write an MWG row for a project with a web UI.

#### Scenario: Web UI project

- GIVEN a project whose UX/UI evidence shows a browser-rendered UI
- WHEN Step 8D builds the `## Skill Map`
- THEN it may write an MWG row marked environment-provided ("use when present"), with an optional exact-version field (FR-5)
- BUT it must NOT write the row for a project with no web UI, or assert the skill is installed

### FR-10: Install behavior

#### Scenario: No package or installer change

- GIVEN any target (Claude Code, OpenCode, Antigravity, Codex, Cursor, Grok Bot)
- WHEN `akili install` or `akili doctor` runs
- THEN no MWG file is installed, removed or checked, and the skill and file counts move only by what this spec adds to the package (one bridge reference file)

#### Scenario: Install routes

- GIVEN the gate's `missing` state or the docs
- WHEN install routes are printed
- THEN they name upstream's own routes per host, each verified at the pin, with the version pinned where the route accepts one
- AND a host whose route is not verified (C11) is listed as unverified or left out, never asserted

### FR-11: Docs and CHANGELOG state only verified facts

#### Scenario: Docs

- GIVEN the shipped docs
- WHEN they are read
- THEN `docs/skills/impeccable-bridge.md` describes MWG's role, gate, pin and security record; `docs/overview.md` and `docs/cli.md` carry an environment-tool row; the `AGENTS.md` *Design Skills* list names it; `CHANGELOG.md` `Unreleased` has an entry
- AND each states the license as Apache-2.0 and attributes MWG to Google Chrome
- BUT it must NOT state a Grok Bot route unless a primary source is cited; the eval figures and MDN stewardship may appear only cited to C12 and labelled as upstream's own statements; and it must NOT claim a security property beyond the FR-1 verdict

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | AKILI keeps `engines.node >=18.0.0` and its Node 18 and 22 CI legs. No AKILI test runs the MWG CLI or makes a network call |
| NFR-2 | No MWG byte (`SKILL.md`, guides, CLI, `LICENSE`) enters the repository |
| NFR-3 | Each rule is held once: the gate, pin and disclosure rules in the bridge's MWG reference; the role in `design-routing.md`; commands carry pointer lines only |
| NFR-4 | `npm test`, `npm run verify:cli`, `npm run pack:dry-run`, `git diff --check` green |

## 8. Defect classes and gates

| Defect class | Gate | Automated? |
|---|---|---|
| Unsafe upstream content admitted | FR-1 review (first task) + Reviewer re-read of the verdict | No. Agent review; the residual risk is stated as "reviewed at the pin" |
| `@latest` or unpinned call in shipped text | Contract test: no `modern-web-guidance@latest` in any packaged or docs file; every directed invocation names `@<version>` | Yes |
| MWG reached by non-web or native work | Contract test on the matrix and route-line rules; Reviewer walk of each command pointer | Partly. The test checks the text; whether an agent obeys it is not testable here (accepted risk) |
| Gate state missing, or a non-`ready` state that blocks | Contract test over the gate table (six states, "continue" on the five that are not `ready`) | Yes |
| Rule copied into a command instead of pointed at | Contract test: commands name the reference file and contain no gate-table row | Yes |
| Old rule 4 claim survives a restatement | Obligation-keyed sweep before review (KZ-changes--kaizen-loop-closure-2) + restatement contract test | Partly |
| Stale skill or file count | `npm test` (`install-cursor` `SKILL_FILE_EXPECTED`, docs-overview inventory) | Yes |
| Overstated or unverified docs or CHANGELOG claim | Reviewer quote-check at HEAD (KZ-002) + contract test forbidding the unconfirmed claims and requiring Apache-2.0 | Partly |
| Disclosure written into a spec document or gate | Contract test on the placement rule text; Reviewer | Partly. Agent behavior is not testable here (accepted risk) |

## 9. Requirement ID Index

| ID | Title |
|---|---|
| FR-1 | Security verdict before wiring |
| FR-2 | Governance category and selector |
| FR-3 | Matrix role: platform implementation, web UI only |
| FR-4 | MWG gate |
| FR-5 | Exact-version pin, default + override |
| FR-6 | Disclosure and trigger containment |
| FR-7 | Phase wiring through the bridge |
| FR-8 | Opt-in `legacy-scan` in `/akili-audit` |
| FR-9 | Skill Map row |
| FR-10 | Install behavior and routes |
| FR-11 | Verified docs and CHANGELOG |
| NFR-1–4 | Node floor, nothing vendored, rules held once, green gates |

Task mapping is added in `tasks.md` (Phase 3).
