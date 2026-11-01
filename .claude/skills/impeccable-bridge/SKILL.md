---
name: impeccable-bridge
description: "Trigger: UI design direction, visual craft, design review, critique, audit, polish, build, design routing, design evaluation of an existing product, /akili-audit design. The AKILI layer over the vendored Impeccable design skill: skill source, engine probe and consent gate, phase map, design source of truth, detector gate (scan matrix, first-visit pass, exit codes), Design Waivers, privacy, and fallback to ui-ux-pro-max + frontend-design when the skill source is missing."
license: MIT
metadata:
  author: Juan Carlos Cadavid — jcadavid.com
  inspired-by: "Impeccable by Paul Bakaus (Apache-2.0) — https://github.com/pbakaus/impeccable"
  binding: conditional
  version: "2.1"
---

# Impeccable Bridge — AKILI Layer over Impeccable

Use this skill whenever AKILI work touches screens, flows, visual direction or design review. It decides **which design skill leads, where each design activity lives in the AKILI flow, when the engine may be reached, and what counts as a pass**. It teaches no design rules of its own: the `impeccable` skill (`/impeccable`, `$impeccable` in Codex) owns every rule, command and reference and is always read first.

AKILI ships Impeccable **vendored, byte-identical except for a declared frontmatter block (see `NOTICE`)**, under `.claude/skills/impeccable/` (installed to every target), with `LICENSE`, `NOTICE` and `UPSTREAM.md` beside it. AKILI edits none of its instructions. What AKILI adds lives here, in this MIT file.

## Roles

| Skill | Role | Leads when |
|---|---|---|
| `impeccable` (vendored, or a user-installed copy) | **Lead**: visual direction, page mode, craft floor, rendered-page critique/audit/polish, detector | Skill source is `vendored (<version>)` or `user-installed (<version>)` |
| `ui-ux-pro-max` (packaged) | **Reference catalog** only: palettes, font pairings, styles, chart types and anti-patterns by industry. Consulted for options; never the style authority | Never leads; at ENV-0 (skill source `missing`) it supports the `frontend-design` lead with catalog options |
| `frontend-design` (packaged) | **Fallback craft guide** | Skill source is `missing` |
| `stitch-design` (packaged) | Mockup generation through Stitch | A spec asks for a Stitch mockup |
| `gsap-animation` (packaged) | Motion implementation, per the matrix | The matrix's *Motion* rule selects GSAP |

`references/design-routing.md` is the routing authority: which skill serves each design activity, per environment. Stack skills (for example `tailwind-design-system`, `shadcn-ui`) are implementation layers that reach agents through the project `## Skill Map`; they never lead the design.

Load one lead only. Two design skills giving rules at once pull the agent in different directions; the catalog and the mockup tool supply inputs, the lead decides.

## Step 0 — Skill source and engine gate (before any design work)

A design step runs these in order. Nothing in steps 1 to 4 may call the launcher except where stated.

1. **Skill source.** Record one value in the phase's report (`execution.md`, the test report, the validation report or the audit report):

   | Skill source | How it is found | Consequence |
   |---|---|---|
   | `vendored (<version>)` | A project or global `impeccable/SKILL.md` with `UPSTREAM.md` beside it (the AKILI copy); `<version>` is its frontmatter `version` | Impeccable leads |
   | `user-installed (<version>)` | A same-name skill without `UPSTREAM.md` (a foreign copy the installer did not overwrite, or a plugin such as `/impeccable:impeccable`) | Impeccable leads; the user's copy is never overwritten without `install --force` |
   | `missing` | Neither found in any location below | **Fallback leads** (see *Fallback*); record the gap. No STOP |

   Locations, in order:

   1. **Next to this bridge.** The `impeccable/` folder beside this bridge's own folder, wherever the host installed AKILI skills. It is the AKILI copy whatever the target, so check it first.
   2. **Installer skill roots**, project (`--local`) then global. Each root holds `impeccable/SKILL.md`:

      | Target | Project root | Global root |
      |---|---|---|
      | Claude Code | `./.claude/skills` | `~/.claude/skills` |
      | OpenCode | `./.config/opencode/skills` | `~/.config/opencode/skills` |
      | Antigravity | `./.gemini/config/skills`, `./.gemini/skills`, `./.gemini/antigravity-cli/skills` | `~/.gemini/config/skills`, `~/.gemini/skills`, `~/.gemini/antigravity-cli/skills` |
      | Codex, Cursor | `./.agents/skills` | `~/.agents/skills` |
      | Grok Bot | `./.grokbot/workflows` | `$AKILI_GROKBOT_TARGET`, else `/home/box/agent-data/workflows` |

   3. **A plugin-namespaced command** such as `/impeccable:impeccable`.

   A root given to `akili install` through a `--*-target` flag is not in the table; the folder beside this bridge (1) covers it.

   **Verify.** For any selected copy, `vendored` or `user-installed`, record `Copy` (the absolute path of the copy it selects), `Home` (what `~` resolved to: the agent process's `HOME`, or `USERPROFILE` on Windows) and `Other copies`: every other `impeccable/SKILL.md` found in the locations above, with its version, or `none`. **Never select another copy.** Hashing applies only to a `vendored` copy (`UPSTREAM.md` present); the table keeps `vendored (<version>)` as the skill-source reading, and verification extends the recorded value. Hash every file `UPSTREAM.md` lists with any sha256 tool: `shasum -a 256`, `sha256sum`, or `certutil -hashfile <file> SHA256` on Windows (Microsoft's `certutil` reference, https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/certutil, documents `-hashfile InFile [HashAlgorithm]` and lists `SHA256`). Hash `SKILL.md` with its `metadata:` block removed, from the line `metadata:` up to, **not** including, the closing `---` fence. The strip is byte-exact: it removes only those lines, matched as whole lines, and keeps every other byte, a missing final newline included. A tool that adds or removes any other byte does not conform; the known case is a strip that appends a final newline (some `awk` forms do), which gives a different hash. A reference command that conforms, run from the vendored folder, prints the sha256 to compare with `UPSTREAM.md`: `node -e "const l=require('fs').readFileSync(process.argv[1],'latin1').split('\n'),s=l.indexOf('metadata:'),e=l.indexOf('---',s);console.log(require('crypto').createHash('sha256').update(l.slice(0,s).concat(l.slice(e)).join('\n'),'latin1').digest('hex'))" SKILL.md`. A file in the folder that is neither listed nor one of `LICENSE`, `NOTICE`, `UPSTREAM.md` counts as modified. Record `vendored (<version>, verified)` or `vendored (<version>, modified: <n> files: <first 3 names>)`. A `modified` copy still leads; the report states it as an environment finding, never a design finding.

2. **Engine probe (no download).** Try these locations in order, calling each candidate **directly** with `engine-probe`, never through the launcher, so no download path is reachable during the probe. A candidate counts only if it prints `impeccable-engine <version>` and exits `0` (on Windows the candidate name carries `.exe`).

   | # | Location |
   |---|---|
   | 1 | `IMPECCABLE_BIN`, if set and executable |
   | 2 | `<skill-dir>/scripts/bin/<os>-<arch>/impeccable` |
   | 3 | `~/.impeccable/bin/impeccable` |
   | 4 | `${IMPECCABLE_HOME:-~/.impeccable}/bin/<VERSION>/impeccable` (`<VERSION>` is the `scripts/VERSION` file of the skill) |
   | 5 | `impeccable` on `PATH` |

   Why direct: the launcher's own probe mode skips locations 3 and 5, so it would report an engine as missing when one exists. The launcher with `IMPECCABLE_BIN` set execs that binary first and never reaches its download block, which is why step 3 pins it.

   **Exclusion.** When the user excludes `~/.impeccable`, skip location 3, and skip any other candidate whose resolved path lies under `~/.impeccable`, such as an `IMPECCABLE_BIN` or a `PATH` entry pointing there (the launchers do not test the path, so only this step enforces it). Location 4 counts only with an `IMPECCABLE_HOME` outside `~/.impeccable`. Record `Excluded: ~/.impeccable`. The exclusion covers where the engine is found; it does not promise that no state files are written there. Upstream's CLI contract lists state files the engine may write under `~/.impeccable` (an update-check cache, a staleness cache, hook claims, a session index and the user config), and `IMPECCABLE_NO_UPDATE_CHECK=1` switches off the update check only. `Unverified:` which of them a detector run writes with the compiled engine.

3. **Ready.** When a candidate answers, export `IMPECCABLE_BIN=<that candidate>` for **every** launcher call in the phase. Shell state may not persist between an agent's tool calls, so every launcher call also carries `IMPECCABLE_BIN=<pinned path>` as an inline prefix (*Launcher form*). Record `ready (<location>, engine <version>)`, and note a version different from `scripts/VERSION`.

4. **Consent.** When nothing answers and the platform is supported (the launcher resolves macOS, Linux or Windows on arm64 or x64), the state is `consent needed`: ask **once per session** (see *Engine consent*). Yes: run `<launcher> engine-probe` (this call is the download) and record `installed (consented)`, or `unavailable (<first stderr line>)`. On an unsupported platform, record `unavailable (<reason>)` and do not ask.

   Under an exclusion, the consent question also asks for an `IMPECCABLE_HOME` outside `~/.impeccable` when none is set, or the one set lies under `~/.impeccable`; if no outside home is given, record `unavailable (excluded location, no IMPECCABLE_HOME)` and do not download. That one download call runs with the launcher's home variable set to an empty directory inside `IMPECCABLE_HOME`: `HOME` for `scripts/impeccable`, `USERPROFILE` for `scripts/impeccable.cmd`. The same call also runs with `IMPECCABLE_BIN` unset and with every `PATH` entry removed whose resolved path lies under `~/.impeccable`, resolved against the user's real home before the home override: each launcher runs `IMPECCABLE_BIN` and then an `impeccable` on `PATH` before it downloads. No other call overrides the home variable, unsets `IMPECCABLE_BIN` or filters `PATH`; every call after the pin carries the pinned `IMPECCABLE_BIN` with the user's `PATH` and home variable.

   After the download succeeds, with or without an exclusion, set the pin to `${IMPECCABLE_HOME:-~/.impeccable}/bin/<VERSION>/impeccable` (`impeccable.exe` on Windows) for every later launcher call in the phase, then run `<pin> engine-probe` directly; a pin that does not answer records `unavailable (<first stderr line>)` instead. Record the header fields `IMPECCABLE_BIN: <pinned path>` and `Download home override: <variable>=<dir>; IMPECCABLE_BIN unset; PATH entries removed: <entries, or none> (one call)`; the whole field reads `none` when there is no exclusion.

**The gate, stated once:** no AKILI step invokes the launcher — any verb, including Impeccable's Setup `context` and the `build-phase` verbs its references call — before the engine state is `ready` or `installed (consented)`. Until then, Impeccable's Setup follows its own **Launcher unavailable** path (read `PRODUCT.md` and `DESIGN.md` directly, then continue; launcher failure alone blocks neither planning nor editing). The state is **probed per phase and never persisted across runs**.

### Engine state

| Engine state | When | Consequence |
|---|---|---|
| `ready (<location>, engine <version>)` | The engine probe answers at one of its locations | Detector gate active; launcher calls allowed with `IMPECCABLE_BIN` pinned |
| `consent needed` | The probe found nothing and the platform is supported | Ask once per session (*Engine consent*); no launcher call until answered |
| `installed (consented)` | The user said yes and the launcher's download succeeded | Detector gate active |
| `declined` | The user said no, or did not answer | Do not call the launcher. The skill takes its own *Launcher unavailable* path; detector rows read `Unevaluated (engine not installed)` |
| `unavailable (<reason>)` | Unsupported platform, no network, a checksum refusal, or a failed download | The same as `declined`, with the reason in the row |

Record both the skill source and the engine state at every design step. A machine whose only engine is a cached `npx` copy has no probe location, so it reads `vendored (<version>)` + `consent needed`: never record the fallback for it, and never route to the fallback skills. The no-download way to reuse an existing engine is to point `IMPECCABLE_BIN` at it.

### Engine consent

Ask once per session, in one question that names all of:

| Field | Content |
|---|---|
| Source | `https://github.com/pbakaus/impeccable/releases`, tag `engine-v<version>` (`<version>` from `scripts/VERSION`) |
| Size | about 17 MB (darwin-arm64; other platforms similar) |
| Check | sha256 of the download compared with `engine-checksums.txt` in the skill folder; a mismatch refuses the download |
| Destination | `~/.impeccable/bin/<version>/` or `IMPECCABLE_HOME`. `IMPECCABLE_HOME` alone does not isolate: without the pin, each launcher reads `~/.impeccable/bin/impeccable[.exe]` first, before `IMPECCABLE_HOME`. |
| Home override | Under an exclusion, the download call alone runs with `HOME` (or `USERPROFILE`) set to an empty directory inside `IMPECCABLE_HOME`, with `IMPECCABLE_BIN` unset and no `PATH` entry under `~/.impeccable` |
| No-download alternatives | `IMPECCABLE_BIN` pointing at an existing engine, e.g. the npm CLI; or a global `impeccable` the user installs themselves |

**Consent is never implied.** Under `Approval Mode: pre-approved`, downloading a binary is an outward-facing action, so it **always stops for the user** like any other. Nothing downloads or installs the engine, Lighthouse or a browser without an explicit yes, in every approval mode. If the user declines, the launcher makes no network request and the state is `declined`. A later phase in the same session that probes again and still finds nothing records `declined` without asking again; a new session asks again.

### Who does what in each state

This table is held **once**, here. Each command states its own row in one line and points at this section; it does not restate it.

| Consumer step | `vendored` / `user-installed` | `missing` | `ready` / `installed (consented)` | `consent needed` | `declined` / `unavailable` |
|---|---|---|---|---|---|
| `/akili-constitution` Step 4 (lead design skill) | Impeccable leads; `init`/`document` produce the derived `PRODUCT.md`/`DESIGN.md` | Fallback chain | Context loader may run | The gate asks only if Impeccable's Setup is about to run | Impeccable's *Launcher unavailable* path |
| `/akili-specify` Step 2.1 | Impeccable leads `shape` | Fallback | — | Same | Same |
| `/akili-propose` Visual Reference | The direction picker is offered | Not offered | — | — | — |
| `/akili-execute` UI tasks (via the task skill list) | The Implementer builds code-led with the task's `Design route:` playbook, reads the craft floor before edits and runs `polish` (`references/design-routing.md` → *Build route*) | `frontend-design` | — | Asks on first launcher use | Craft floor read directly |
| `/akili-test` detector suite | The suite is planned | Planned only if an engine exists | Runs | Asks before planning, or records `Unevaluated` | `Unevaluated (engine not installed)` |
| `/akili-validate` design gate | Critique/audit + detector + scan matrix + first-visit pass | Checklist review + detector if an engine exists | Gate active | Asks | Detector rows `Unevaluated`; the gate cannot `PASS` on them |
| `/akili-audit design` | As validate, report-only | As validate | — | Asks | `Unevaluated` rows |

A project `## Skill Map` row for `impeccable` is a per-developer availability note, never an assumption that the skill or the engine is present.

## Design source of truth

**`docs/ux-ui/design.md` is the single design authority** (legacy fallback `docs/system-design/design.md`). Every other design file is derived from it or feeds it:

| File | Role | Rule |
|---|---|---|
| `docs/ux-ui/design.md` | Authority: tokens, typography, page mode per screen, design waivers | Changed only by `/akili-constitution` or an approved spec |
| `PRODUCT.md`, `DESIGN.md` (root, Impeccable context) | Derived views | Generated from `docs/prd.md` and `docs/ux-ui/design.md`; first line `<!-- Derived from docs/prd.md and docs/ux-ui/design.md — edit there -->`. Never edited by hand; regenerated when the authority changes |
| `.stitch/DESIGN.md`, `docs/specs/<spec>/mockup/` | Mockup input for one spec | Folded into `docs/ux-ui/design.md` when the spec's design is approved |

On conflict `docs/ux-ui/design.md` wins and the difference is reported as **Visual/Design Token Mismatch** drift. When Impeccable's `init` or `document` would write `PRODUCT.md`/`DESIGN.md` from scratch, feed it the authority instead of letting it infer.

## Phase map

| Impeccable activity | AKILI owner | Rule |
|---|---|---|
| `init` / `document` (context files) | `/akili-constitution` Step 4 | Produce the derived `PRODUCT.md`/`DESIGN.md` from the authority |
| Page mode (Persuade, Operate, Read, Experience) | `/akili-constitution` Step 4, `/akili-specify` design | Record one mode per screen in `docs/ux-ui/design.md` (screen inventory) or in the spec's `design.md` |
| `shape` and the direction picker (comp-led or code-led) | `/akili-propose` Visual Reference, `/akili-specify` design | The chosen direction is recorded as the Visual Reference; its approval is the design gate's approval, no second approval |
| Build (playbook → craft floor → polish) | `/akili-execute` UI tasks | The Implementer builds code-led with the task's `Design route:` playbook, reads the craft floor before edits and runs `polish` (`references/design-routing.md` → *Build route*); the task's skill list names `impeccable-bridge` |
| Detector suite | `/akili-test` | See *Detector gate*; evidence only |
| `critique`, `audit` (and `polish`, `harden`, `clarify` when findings call for them) | `/akili-validate` UI design review | Findings either fixed or waived with a reason before the spec passes |
| Design evaluation of an existing product | `/akili-audit design` | `references/design-evaluation.md` (it owns the report template, the performance step and the baseline checks) |

## Suppressed in `/akili-audit design`

`/akili-audit design` is report-only. An agent following Impeccable's `critique` skill there skips three steps and cites this list:

| Skipped step | Why |
|---|---|
| persisting the snapshot (`.impeccable/critique/`) | It writes into the repo |
| starting `live-server` or any inject | It starts a server or edits a project file |
| the closing user questions | The report is the deliverable; the run ends with `Questions skipped: report-only (/akili-audit design)` instead |

A literal executor reaching the snapshot step skips *Persist the Snapshot*, citing this list: it never writes `.impeccable/critique/` and never starts `live-server`.

Assessment A runs as an isolated sub-agent given no detector output. Inline is allowed only when no sub-agent tool exists: it then runs between E2 and E3, and `Score source` records `degraded (single-context: <reason>)`, which carries upstream's `⚠️ DEGRADED: single-context (<reason>)` banner. A delegated critique brief reproduces this list.

## Detector gate

The gate is active only when the engine state is `ready` or `installed (consented)` (*Engine state*). In every other state the detector rows read `Unevaluated (engine not installed)` and nothing here runs.

### Launcher form

```
IMPECCABLE_BIN=<pinned path> DO_NOT_TRACK=1 IMPECCABLE_NO_UPDATE_CHECK=1 <skill-dir>/scripts/impeccable detect --json [flags] <targets>
```

`<skill-dir>` is the folder holding the `impeccable` `SKILL.md`; on Windows call `scripts/impeccable.cmd` with `IMPECCABLE_BIN` and both variables set in its environment. `DO_NOT_TRACK=1` is dropped only when the user opted in to telemetry (*Privacy and consent*); `IMPECCABLE_NO_UPDATE_CHECK=1` is never dropped. Every call carries the Step 0 pin inline as `IMPECCABLE_BIN=<pinned path>`; never rely on an earlier `export` alone. Use no `npx` form for the detector or for Lighthouse unless it carries `--no-install`. The one exception is the optional upstream routes under *Install routes*, which are never run without consent.

### Scan matrix

| Scan | Targets | Passes |
|---|---|---|
| Source scan | Source files: pattern rules only | One pass |
| URL scan | The running dev server or deployed URL (for example `http://localhost:5173`); rendered-page rules (contrast, tiny text) need a URL | `desktop` (default `1280x800`) **and** `mobile` (`--viewport <mobile>`) |

- Every detector URL scan, in `/akili-audit design` and the `/akili-validate` design gate, runs both passes. `/akili-test`'s detector suite plans both. The matrix stays at **two** passes: the short-height pair is browser-only (see *First-visit pass*).
- Every viewport is `WxH`. A `docs/ux-ui/design.md` value with a width but no height is recorded as `incomplete (<value>)`, and the default is used.
- `desktop` takes its value from *Responsive Behavior* in `docs/ux-ui/design.md` when declared, else `1280x800`. `<mobile>` is the mobile viewport declared in `docs/ux-ui/design.md` when present, else `390x844`. The report records each value and its source.
- Report the scan matrix as a table: pass × URL → exit code, finding count.

### First-visit pass (Persuade and Operate screens)

`/akili-audit design` and the `/akili-validate` design gate run, for every Persuade and Operate screen, item 1 at the two scan-matrix viewports and items 2 to 4 at **every first-visit viewport**: `desktop`, `mobile` and the **short-height pair**, default `1366x768` (desktop) and `375x667` (mobile), overridable in `docs/ux-ui/design.md`. The report records each first-visit viewport with its source.

1. A detector scan with `--no-consent-hiding --no-overlay-hiding`.
2. A fresh browser context with no stored consent.
3. A fold screenshot and a hit-test at the centre of the primary CTA's box (the main action of the screen).
   - Identification, in order: (1) the CTA declared for the screen in the Screen Inventory's `Primary CTA` column of `docs/ux-ui/design.md` (a selector or attribute); (2) only when `docs/ux-ui/design.md` defines a Primary CTA style, the first element in `main` with that style; (3) the first `main a|button`. Record the method (`declared`, `primary style` or `first main action`) in the capture conditions, and list a non-declared CTA under *Assumptions*.
   - Measurement: visibility comes from computed style (`display`, `visibility`, `opacity`) plus the bounding box against the viewport, never from `offsetParent`. The hit-test is at the box centre.
   - Outcomes, checked in this order: (a) no candidate: `Unevaluated (no CTA found)`; (b) computed style hides it, or its box has zero size: `Unevaluated (CTA not visible: <style>)`; (c) the box centre is at or below the viewport's bottom edge (a box top at or below that edge included): `below fold (y=<top>)`; (d) the hit-test returns the CTA or one of its descendants: `pass`; (e) otherwise, the hit-test returns another element: `covered (<topmost element>)`. `below fold` is never reported as `covered` and never counted as an overlay defect.
4. When the product has a consent banner (named in `docs/ux-ui/design.md`, or found in the UI source), each capture asserts it is visible, using the item 3 measurement applied to the banner. If it is not rendered, the banner state reads `not rendered: <reason>`, recorded beside the CTA outcome, and only a would-be `pass` changes: the capture reads `Unevaluated (consent banner not rendered: <reason>)` and never reads `pass`. A `below fold` or `covered` outcome stands, with its P1 or FAIL, because a banner that is absent cannot bring the CTA into view or uncover it. An item 3 `Unevaluated` outcome keeps its own reason. The report, whatever the CTA outcome, names the remedy: a build that renders the banner with **test** identifiers, never production ones. The detector's first-visit flags count as banner evidence only where the capture confirmed the banner on screen; otherwise the report states that the detector pass added no first-visit evidence.

- The consent-hiding default passes are never presented as covering the first visit.
- On Persuade and Operate screens, `covered` or `below fold` at any first-visit viewport is a **P1** in `/akili-audit design` and a **FAIL** in `/akili-validate`, unless a *Design Waivers* row with Rule `first-visit` covers that screen and viewport. An `Unevaluated` outcome is never a pass: in `/akili-validate` the gate reads `WARN (unverified first visit)` until a manual or automated capture gives an outcome. A screen's first visit is never reported as passed on the strength of the `1280x800` pass alone: every first-visit viewport reports its own outcome.
- Record the capture conditions per capture (screen × first-visit viewport): locale, reduced motion, viewport, consent state, CTA method and banner state (`visible`, `not rendered: <reason>`, `none in product`).
- **Read** screens need no first-visit pass; the report says so for that screen.
- **Without browser automation:** the screenshot and hit-test read `Unevaluated (no browser automation)` at every first-visit viewport (the short-height captures included) and the detector part still runs. In `/akili-validate` the HITL pause asks for a manual fold check at every first-visit viewport and records its result. Without one, the design gate is `WARN (unverified first visit)` and never `PASS`. Use whatever browser automation the host has; Impeccable's `live-browser.js` is its own interactive tool, not AKILI's measurement harness.
- **A rejected flag** (an engine version that lacks it) reads `Unevaluated (engine <version> lacks <flag>)`, never a silent pass.

### Exit codes

| Exit | Reading |
|---|---|
| `0` | Pass |
| `2` | Fail, unless every primary finding is fixed or waived (*Design Waivers*). If all are waived, it passes, and the report lists each waiver |
| `1` | `Unevaluated`, whatever the cause: an unreachable target, a partial multi-target scan, or an unknown flag on another engine version |
| `127` | `Unevaluated (engine not available)`: the launcher found and fetched no engine |
| any other | `Unevaluated` |

Record the **first stderr line** for every non-zero exit other than `2`. Findings returned with exit `1` are listed, but the pass stays `Unevaluated`.

Report the command, the target, the viewport, the exit code, the finding count by rule id and each waiver in the phase's report. Another engine version's missing flag or capability yields `Unevaluated` with the reason, never a silent pass.

## Design Waivers

A waiver is either an upstream ignore with a reason (an `impeccable-disable` comment, or the engine's `ignores add-value <rule> <value> --reason "…"`; both stay valid) or a row in `docs/ux-ui/design.md` *Design Waivers*.

| Rule | How it works |
|---|---|
| Row shape | Rule id, scope (selector, file or value), reason, approver, date. `/akili-constitution` writes new rows in this shape; the clause it rests on is cited in the reason (`per 8-06`). A first-visit waiver uses Rule `first-visit` and scope `<screen> @ <WxH>` |
| Matching | Every mode matches findings against the rows. A match reads `waived (design.md)`. A row matching nothing reads `unused` |
| Proposed waiver | In report-only mode (`/akili-audit design`), a finding that matches an authority-approved pattern with **no** row reads `Proposed waiver (<clause>)`. It is never written to the authority |
| Counting | Proposed waivers do **not** count toward P1–P3. The report header shows `Proposed waivers: N` |
| False positive | `false positive (<reason>; <evidence>)` is allowed only for a rule on the closed list below, and only in `/akili-audit design`; `/akili-validate` has no `false positive`: a finding there is fixed or waived. It is counted in `False positives: N` in the report header and never appears among P1–P3. Any other rule needs a waiver or stays a finding (`low-contrast` is never on it). Each value needs the evidence the closed list names; without it the hit stays a finding. For exit `2`, the audit's reading of the scan matrix counts it as waived; validate's reading is unchanged |

Closed list for `false positive`:

| Rule id | Allowed `false positive` reason | Required evidence |
|---|---|---|
| `text-occlusion` | `decorative, aria-hidden`: the occluded text sits inside an element with `aria-hidden="true"` | the selector of that `aria-hidden` ancestor |

The list starts with one row. Adding a row changes the bridge, so it needs a spec.

Example: `design.md` approves rounded top borders on colored cards (clause 8-06) with no waiver row. `border-accent-on-rounded` findings read `Proposed waiver (8-06)` and are counted in the header, they do not appear among P1–P3, and the row is not written. With no clause IDs in the baseline, a proposed waiver cites `§<section> l.<line>` instead (for example `Proposed waiver (§7 l.144)`).

## Privacy and consent

- Prefix every launcher run an AKILI step makes or directs, including Impeccable's Setup `context` call, with `IMPECCABLE_NO_UPDATE_CHECK=1`, unconditionally. Also prefix `DO_NOT_TRACK=1` unless the user opted in to telemetry; record the choice. On Windows set the same variables in the environment of `scripts/impeccable.cmd`. The engine's update check ignores `DO_NOT_TRACK`; only `IMPECCABLE_NO_UPDATE_CHECK` (or `updateCheck: false` in `.impeccable/config.json`) switches it off (upstream `docs/CLI-CONTRACT.md`, section `context.mjs` -> `impeccable context`, bullets *Update cache* and *Env vars read*; detail in `docs/skills/impeccable.md`). `"telemetry": false` and `updateCheck: false` in `.impeccable/config.json` remain the user's choices for the project.
- Downloading the engine, Lighthouse or a browser needs explicit consent in every approval mode (*Engine consent*).
- The design hook runs outside model approval in some hosts. Offer it; never enable it silently.
- Mockup-first direction uses image generation and may spend the user's API credit: ask before each use.
- Installing, updating or adding Impeccable as a git submodule changes the project: only with explicit consent.
- **Disclosure (outside this gate).** Invoking `/impeccable` directly, outside an AKILI command, follows upstream behavior, including the launcher's first-run engine download. The gate above governs AKILI steps only; upstream text run on its own is not gated.

## Install routes (optional)

The vendored skill arrives with `akili install`; nothing here is required to use it. These routes are optional advice for a newer upstream than the vendored pin (see `UPSTREAM.md`); print them once, and run none without consent.

| Route | Command |
|---|---|
| Upstream installer (detects tools, asks project or global, offers the design hook) | `npx impeccable install` (scripted: `--providers=claude,codex,cursor --scope=project`) |
| Claude Code plugin | `/plugin marketplace add pbakaus/impeccable`, then install it from `/plugin` |
| Update an existing upstream install | `npx impeccable update` |

## Fallback (skill source `missing`)

Keyed on the **skill source**, not the engine: only `missing` falls back. `frontend-design` leads direction and craft; `ui-ux-pro-max` supports with options (palette, font pairing, style by industry), `stitch-design` for mockups. The page-mode column, the source-of-truth rule and the design-evaluation report template still apply. Detector rows follow the engine state, never the skill source: with no engine they read `Unevaluated (engine not installed)`. An engine state of `consent needed`, `declined` or `unavailable` never selects the fallback.

## Attribution

Original AKILI-SPECS bridge by Juan Carlos Cadavid — jcadavid.com (MIT). It leads with Impeccable by Paul Bakaus (Apache-2.0, https://github.com/pbakaus/impeccable, https://impeccable.style), whose skill AKILI ships as a vendored copy under `.claude/skills/impeccable/`: upstream's build, unmodified apart from the declared frontmatter block, with its `LICENSE`, `NOTICE` and `UPSTREAM.md` (pin and checksums). This bridge contains no Impeccable text, rule, reference or anti-pattern catalog of its own, and AKILI-SPECS is not affiliated with the Impeccable project.
