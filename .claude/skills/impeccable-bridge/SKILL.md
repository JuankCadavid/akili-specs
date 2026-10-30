---
name: impeccable-bridge
description: "Trigger: UI design direction, visual craft, design review, critique, audit, polish, design evaluation of an existing product, /akili-audit design. Bridge between AKILI-SPECS phases and the Impeccable design skill installed in the developer's environment: detection, phase map, design source of truth, detector quality gate, privacy, and fallback to ui-ux-pro-max + frontend-design when Impeccable is absent."
license: MIT
metadata:
  author: Juan Carlos Cadavid — jcadavid.com
  inspired-by: "Impeccable by Paul Bakaus (Apache-2.0) — https://github.com/pbakaus/impeccable"
  binding: conditional
  version: "1.0"
---

# Impeccable Bridge — AKILI Lead Design Skill

Use this skill whenever AKILI work touches screens, flows, visual direction or design review. It decides **which design skill leads, where each design activity lives in the AKILI flow, and what counts as a pass**. It teaches no design rules of its own: when Impeccable is installed, its own skill (`/impeccable`, `$impeccable` in Codex) owns every rule, command and reference and is always read first.

Impeccable is **environment-provided**. It is never copied into this package or into a project by AKILI.

## Roles

| Skill | Role | Leads when |
|---|---|---|
| Impeccable (environment) | **Lead**: visual direction, page mode, craft floor, rendered-page critique/audit/polish, detector | Installed |
| `ui-ux-pro-max` (packaged) | **Reference catalog** only: palettes, font pairings, styles, chart types and anti-patterns by industry. Consulted for options; never the style authority | Never leads while Impeccable is installed |
| `frontend-design` (packaged) | **Fallback craft guide** | Impeccable absent |
| `stitch-design` (packaged) | Mockup generation through Stitch | A spec asks for a Stitch mockup |

Load one lead only. Two design skills giving rules at once pull the agent in different directions; the catalog and the mockup tool supply inputs, the lead decides.

## Step 0 — Detection (before any design work)

| Probe | Where |
|---|---|
| Project skill | `.claude/skills/impeccable/SKILL.md`, `.agents/skills/impeccable/SKILL.md`, `.cursor/skills/impeccable/SKILL.md`, `.opencode/skills/impeccable/SKILL.md`, `.agent/skills/impeccable/SKILL.md` |
| Global skill | `~/.claude/skills/impeccable/SKILL.md`, `~/.agents/skills/impeccable/SKILL.md`, `~/.gemini/config/skills/impeccable/SKILL.md` |
| Plugin | a plugin-namespaced command such as `/impeccable:impeccable` (Claude Code plugin marketplace) |
| Detector CLI | `npx --no-install impeccable --version` succeeds, or `impeccable` is on `PATH` |

Record exactly one state in the phase's report (`execution.md`, the test report, the validation report or the audit report):

| State | Meaning | Action |
|---|---|---|
| `installed` | Skill and detector available | Route to Impeccable; detector gate active |
| `skill only` | Skill found, detector unavailable | Route to Impeccable; detector rows `Unevaluated` |
| `absent` | Neither found | **Fallback, no STOP.** Print the install routes once, install nothing without consent, continue with `ui-ux-pro-max` (catalog) + `frontend-design` (craft) + `stitch-design` (mockups) exactly as before; record the gap |

Install routes (print; the user picks and consents):

| Route | Command |
|---|---|
| Installer (detects tools, asks project or global, offers the design hook) | `npx impeccable install` (scripted: `--providers=claude,codex,cursor --scope=project`) |
| Claude Code plugin | `/plugin marketplace add pbakaus/impeccable`, then install it from `/plugin` |
| Update an existing install | `npx impeccable update` |

A project `## Skill Map` row for `impeccable` is a per-developer availability note, never an assumption that it is present.

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
| Design evaluation of an existing product | `/akili-audit design` | `references/design-evaluation.md` |

## Detector gate

Run `DO_NOT_TRACK=1 npx impeccable detect --json <target>`. Source files get the pattern rules only; rendered-page rules (contrast, tiny text) need a URL, so scan the running dev server too (for example `http://localhost:5173`).

| Exit code | Result |
|---|---|
| `0` | Pass |
| `2` | Findings: **fail** unless every finding is fixed or waived. A waiver is either an upstream ignore with a reason (`npx impeccable ignores add-value <rule> <value> --reason "…"`, or an `impeccable-disable` comment) or a row in `docs/ux-ui/design.md` *Design Waivers* with the reason and who approved it |
| `1` | A target could not be scanned: **`Unevaluated`, never a pass** |

Report the command, the target, the exit code, the finding count by rule id and each waiver in the phase's report.

## Privacy and consent

- Prefix detector runs with `DO_NOT_TRACK=1` unless the user opted in to telemetry; record the choice. `npx impeccable telemetry off` or `"telemetry": false` in `.impeccable/config.json` disables it for the project.
- The design hook runs outside model approval in some hosts. Offer it; never enable it silently.
- Mockup-first direction uses image generation and may spend the user's API credit: ask before each use.
- Installing, updating or adding Impeccable as a git submodule changes the project: only with explicit consent.

## Fallback behavior (Impeccable absent)

Use `ui-ux-pro-max` for options (palette, font pairing, style by industry), `frontend-design` for direction and craft, `stitch-design` for mockups. The page-mode column, the source-of-truth rule and the design-evaluation report template still apply; detector rows read `Unevaluated (Impeccable absent)`.

## Attribution

Original AKILI-SPECS bridge by Juan Carlos Cadavid — jcadavid.com (MIT). It routes to Impeccable by Paul Bakaus (Apache-2.0, https://github.com/pbakaus/impeccable, https://impeccable.style). No Impeccable text, rule, reference or anti-pattern catalog is included in this package, and AKILI-SPECS is not affiliated with the Impeccable project.
