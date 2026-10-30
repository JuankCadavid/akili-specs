# `impeccable-bridge`

## Purpose

The **AKILI layer** over the vendored [`impeccable`](impeccable.md) skill. It decides which design skill leads, where each design activity lives in the AKILI flow, when Impeccable's engine may be reached, and what counts as a pass. It teaches no design rules itself: Impeccable's own skill owns every rule, command and reference and is always read first.

Original AKILI-SPECS skill by Juan Carlos Cadavid — jcadavid.com (MIT). Leads with Impeccable by Paul Bakaus (Apache-2.0, `pbakaus/impeccable`); no Impeccable text is included in the bridge, and AKILI-SPECS is not affiliated with the Impeccable project.

## Use When

- A spec has meaningful UI/UX impact (screens, flows, visual direction, accessibility).
- You want a design evaluation of an existing product: `/akili-audit design [<url|path>]`.

## Binding

`conditional` — loaded by the UI steps of `/akili-constitution`, `/akili-propose`, `/akili-specify`, `/akili-execute` (via `tasks.md`), `/akili-test` and `/akili-validate`, and by `/akili-audit design`.

## Skill source and engine

At every design step the bridge records two separate values. The rules, locations and consequences live in `SKILL.md` under *Step 0 — Skill source and engine gate*; this page does not restate them.

| Value | What it says | Possible readings |
|---|---|---|
| Skill source | Which Impeccable skill leads | `vendored (<version>)` (the AKILI copy), `user-installed (<version>)` (your own copy, never overwritten without `install --force`), or `missing` |
| Engine state | Whether Impeccable's detector engine can run | `ready`, `installed (consented)`, `consent needed`, `declined`, `unavailable` |

Only `missing` selects the fallback (`ui-ux-pro-max` + `frontend-design` + `stitch-design`, gap recorded). An engine that is not ready never does: the skill still leads and the detector rows read `Unevaluated`. There is no STOP.

**Nothing downloads the engine, Lighthouse or a browser without your explicit yes**, in every approval mode; the question and its fields are in *Engine consent*. Using Impeccable directly, outside an AKILI command, is not gated: see [Using it outside AKILI](impeccable.md#using-it-outside-akili), which also records what upstream documents for its update check and telemetry.

## Design Source of Truth

`docs/ux-ui/design.md` is the only design authority. Impeccable's root `PRODUCT.md`/`DESIGN.md` are derived views generated from it, and `.stitch/DESIGN.md` is a mockup input.

## Detector Gate

The bridge's *Detector gate* section owns the launcher form, the scan matrix (desktop and mobile), the first-visit pass for Persuade and Operate screens, the exit-code readings, and *Design Waivers*. The detector runs through the vendored launcher, not `npx`.

## Existing-Product Evaluation

`/akili-audit design` follows `references/design-evaluation.md` (steps E0–E7, with the baseline checks and the performance step) and writes `docs/specs/audits/design-<YYYY-MM-DD>[-<safe-branch>][-N].md` with P1/P2/P3 findings, each routed to `/akili-quick` or `/akili-propose`.

## Optional upstream routes

The vendored skill arrives with `akili install`; nothing else is required. For a newer upstream than the vendored pin, the bridge's *Install routes (optional)* section lists the upstream installer, the Claude Code plugin and the update command. None runs without your consent.

## Source

- `../../.claude/skills/impeccable-bridge/SKILL.md`
- `../../.claude/skills/impeccable-bridge/references/design-evaluation.md`
