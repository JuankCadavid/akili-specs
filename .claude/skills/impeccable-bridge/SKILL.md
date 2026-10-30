---
name: impeccable-bridge
description: "Trigger: UI design direction, visual craft, design review, critique, audit, polish, design evaluation of an existing product, /akili-audit design. The AKILI layer over the vendored Impeccable design skill: skill source, engine probe and consent gate, phase map, design source of truth, detector gate (scan matrix, first-visit pass, exit codes), Design Waivers, privacy, and fallback to ui-ux-pro-max + frontend-design when the skill source is missing."
license: MIT
metadata:
  author: Juan Carlos Cadavid — jcadavid.com
  inspired-by: "Impeccable by Paul Bakaus (Apache-2.0) — https://github.com/pbakaus/impeccable"
  binding: conditional
  version: "2.0"
---

# Impeccable Bridge — AKILI Layer over Impeccable

Use this skill whenever AKILI work touches screens, flows, visual direction or design review. It decides **which design skill leads, where each design activity lives in the AKILI flow, when the engine may be reached, and what counts as a pass**. It teaches no design rules of its own: the `impeccable` skill (`/impeccable`, `$impeccable` in Codex) owns every rule, command and reference and is always read first.

AKILI ships Impeccable **vendored, byte-identical except for a declared frontmatter block (see `NOTICE`)**, under `.claude/skills/impeccable/` (installed to every target), with `LICENSE`, `NOTICE` and `UPSTREAM.md` beside it. AKILI edits none of its instructions. What AKILI adds lives here, in this MIT file.

## Roles

| Skill | Role | Leads when |
|---|---|---|
| `impeccable` (vendored, or a user-installed copy) | **Lead**: visual direction, page mode, craft floor, rendered-page critique/audit/polish, detector | Skill source is `vendored (<version>)` or `user-installed (<version>)` |
| `ui-ux-pro-max` (packaged) | **Reference catalog** only: palettes, font pairings, styles, chart types and anti-patterns by industry. Consulted for options; never the style authority | Never leads while the skill source is not `missing` |
| `frontend-design` (packaged) | **Fallback craft guide** | Skill source is `missing` |
| `stitch-design` (packaged) | Mockup generation through Stitch | A spec asks for a Stitch mockup |

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

2. **Engine probe (no download).** Try these locations in order, calling each candidate **directly** with `engine-probe`, never through the launcher, so no download path is reachable during the probe. A candidate counts only if it prints `impeccable-engine <version>` and exits `0` (on Windows the candidate name carries `.exe`).

   | # | Location |
   |---|---|
   | 1 | `IMPECCABLE_BIN`, if set and executable |
   | 2 | `<skill-dir>/scripts/bin/<os>-<arch>/impeccable` |
   | 3 | `~/.impeccable/bin/impeccable` |
   | 4 | `${IMPECCABLE_HOME:-~/.impeccable}/bin/<VERSION>/impeccable` (`<VERSION>` is the `scripts/VERSION` file of the skill) |
   | 5 | `impeccable` on `PATH` |

   Why direct: the launcher's own probe mode skips locations 3 and 5, so it would report an engine as missing when one exists. The launcher with `IMPECCABLE_BIN` set execs that binary first and never reaches its download block, which is why step 3 pins it.

3. **Ready.** When a candidate answers, export `IMPECCABLE_BIN=<that candidate>` for **every** launcher call in the phase. Record `ready (<location>, engine <version>)`, and note a version different from `scripts/VERSION`.

4. **Consent.** When nothing answers and the platform is supported (the launcher resolves macOS, Linux or Windows on arm64 or x64), the state is `consent needed`: ask **once per session** (see *Engine consent*). Yes: run `<launcher> engine-probe` (this call is the download) and record `installed (consented)`, or `unavailable (<first stderr line>)`. On an unsupported platform, record `unavailable (<reason>)` and do not ask.

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
| Destination | `~/.impeccable/bin/<version>/` or `IMPECCABLE_HOME` |
| No-download alternatives | `IMPECCABLE_BIN` pointing at an existing engine, e.g. the npm CLI; or a global `impeccable` the user installs themselves |

**Consent is never implied.** Under `Approval Mode: pre-approved`, downloading a binary is an outward-facing action, so it **always stops for the user** like any other. Nothing downloads or installs the engine, Lighthouse or a browser without an explicit yes, in every approval mode. If the user declines, the launcher makes no network request and the state is `declined`. A later phase in the same session that probes again and still finds nothing records `declined` without asking again; a new session asks again.

### Who does what in each state

This table is held **once**, here. Each command states its own row in one line and points at this section; it does not restate it.

| Consumer step | `vendored` / `user-installed` | `missing` | `ready` / `installed (consented)` | `consent needed` | `declined` / `unavailable` |
|---|---|---|---|---|---|
| `/akili-constitution` Step 4 (lead design skill) | Impeccable leads; `init`/`document` produce the derived `PRODUCT.md`/`DESIGN.md` | Fallback chain | Context loader may run | The gate asks only if Impeccable's Setup is about to run | Impeccable's *Launcher unavailable* path |
| `/akili-specify` Step 2.1 | Impeccable leads `shape` | Fallback | — | Same | Same |
| `/akili-propose` Visual Reference | The direction picker is offered | Not offered | — | — | — |
| `/akili-execute` UI tasks (via the task skill list) | The Implementer loads Impeccable's craft floor | `frontend-design` | — | Asks on first launcher use | Craft floor read directly |
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
| Craft floor before UI edits | `/akili-execute` UI tasks | The Implementer loads Impeccable for every UI task; the task's skill list names `impeccable-bridge` |
| Detector suite | `/akili-test` | See *Detector gate*; evidence only |
| `critique`, `audit` (and `polish`, `harden`, `clarify` when findings call for them) | `/akili-validate` UI design review | Findings either fixed or waived with a reason before the spec passes |
| Design evaluation of an existing product | `/akili-audit design` | `references/design-evaluation.md` (it owns the report template, the performance step and the baseline checks) |

## Detector gate

The gate is active only when the engine state is `ready` or `installed (consented)` (*Engine state*). In every other state the detector rows read `Unevaluated (engine not installed)` and nothing here runs.

### Launcher form

```
DO_NOT_TRACK=1 IMPECCABLE_NO_UPDATE_CHECK=1 <skill-dir>/scripts/impeccable detect --json [flags] <targets>
```

`<skill-dir>` is the folder holding the `impeccable` `SKILL.md`; on Windows call `scripts/impeccable.cmd` with both variables set in its environment. `DO_NOT_TRACK=1` is dropped only when the user opted in to telemetry (*Privacy and consent*); `IMPECCABLE_NO_UPDATE_CHECK=1` is never dropped. `IMPECCABLE_BIN` stays pinned from Step 0. Use no `npx` form for the detector or for Lighthouse unless it carries `--no-install`. The one exception is the optional upstream routes under *Install routes*, which are never run without consent.

### Scan matrix

| Scan | Targets | Passes |
|---|---|---|
| Source scan | Source files: pattern rules only | One pass |
| URL scan | The running dev server or deployed URL (for example `http://localhost:5173`); rendered-page rules (contrast, tiny text) need a URL | `desktop` (default `1280x800`) **and** `mobile` (`--viewport <mobile>`) |

- Every detector URL scan, in `/akili-audit design` and the `/akili-validate` design gate, runs both passes. `/akili-test`'s detector suite plans both.
- `<mobile>` is the mobile viewport declared in `docs/ux-ui/design.md` when present, else `390x844`. The report records the value and its source.
- Report the scan matrix as a table: pass × URL → exit code, finding count.

### First-visit pass (Persuade and Operate screens)

`/akili-audit design` and the `/akili-validate` design gate run, at **both** viewports, for every Persuade and Operate screen:

1. A detector scan with `--no-consent-hiding --no-overlay-hiding`.
2. A fresh browser context with no stored consent.
3. A fold screenshot and a hit-test at the primary CTA's center (the main action of the screen). The pass **fails** when the topmost element is neither the CTA nor its descendant.

- The consent-hiding default passes are never presented as covering the first visit.
- A hero CTA under a consent banner at `390x844` returns the banner from the hit-test: that is a P1 in design mode and a FAIL in validate.
- Record the capture conditions per pass: locale, reduced motion, viewport and consent state.
- **Read** screens need no first-visit pass; the report says so for that screen.
- **Without browser automation:** the screenshot and hit-test read `Unevaluated (no browser automation)` and the detector part still runs. In `/akili-validate` the HITL pause asks for a manual fold check and records its result. Without one, the design gate is `WARN (unverified first visit)` and never `PASS`. Use whatever browser automation the host has; Impeccable's `live-browser.js` is its own interactive tool, not AKILI's measurement harness.
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
| Row shape | Rule id, scope (selector, file or value), reason, approver, date. `/akili-constitution` writes new rows in this shape |
| Matching | Every mode matches findings against the rows. A match reads `waived (design.md)`. A row matching nothing reads `unused` |
| Proposed waiver | In report-only mode (`/akili-audit design`), a finding that matches an authority-approved pattern with **no** row reads `Proposed waiver (<clause>)`. It is never written to the authority |
| Counting | Proposed waivers do **not** count toward P1–P3. The report header shows `Proposed waivers: N` |

Example: `design.md` approves rounded top borders on colored cards (clause A-06) with no waiver row. `border-accent-on-rounded` findings read `Proposed waiver (A-06)` and are counted in the header, they do not appear among P1–P3, and the row is not written.

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

Keyed on the **skill source**, not the engine: only `missing` falls back. Use `ui-ux-pro-max` for options (palette, font pairing, style by industry), `frontend-design` for direction and craft, `stitch-design` for mockups. The page-mode column, the source-of-truth rule and the design-evaluation report template still apply. Detector rows follow the engine state, never the skill source: with no engine they read `Unevaluated (engine not installed)`. An engine state of `consent needed`, `declined` or `unavailable` never selects the fallback.

## Attribution

Original AKILI-SPECS bridge by Juan Carlos Cadavid — jcadavid.com (MIT). It leads with Impeccable by Paul Bakaus (Apache-2.0, https://github.com/pbakaus/impeccable, https://impeccable.style), whose skill AKILI ships as a vendored copy under `.claude/skills/impeccable/`: upstream's build, unmodified apart from the declared frontmatter block, with its `LICENSE`, `NOTICE` and `UPSTREAM.md` (pin and checksums). This bridge contains no Impeccable text, rule, reference or anti-pattern catalog of its own, and AKILI-SPECS is not affiliated with the Impeccable project.
