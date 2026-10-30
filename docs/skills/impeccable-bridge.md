# `impeccable-bridge`

## Purpose

AKILI-authored **bridge** that makes Impeccable the lead design skill of AKILI-SPECS. It decides which design skill leads, where each design activity lives in the AKILI flow, and what counts as a pass. It teaches no design rules itself: when Impeccable is installed, its own skill owns every rule and command and is always read first.

Original AKILI-SPECS skill by Juan Carlos Cadavid — jcadavid.com (MIT). Inspired by Impeccable by Paul Bakaus (Apache-2.0, `pbakaus/impeccable`); no Impeccable text is included, and the skill is not an Impeccable product.

## Use When

- A spec has meaningful UI/UX impact (screens, flows, visual direction, accessibility).
- You want a design evaluation of an existing product: `/akili-audit design [<url|path>]`.

## Binding

`conditional` — loaded by the UI steps of `/akili-constitution`, `/akili-propose`, `/akili-specify`, `/akili-execute` (via `tasks.md`), `/akili-test` and `/akili-validate`, and by `/akili-audit design`.

## Detection, No STOP

| State | Meaning | What runs |
|---|---|---|
| `installed` | Impeccable skill and CLI present | Impeccable leads; detector gate active |
| `skill only` | Skill present, no CLI | Impeccable leads; detector rows `Unevaluated` |
| `absent` | Neither | `ui-ux-pro-max` (catalog) + `frontend-design` + `stitch-design`; gap recorded |

AKILI never installs Impeccable without your consent. Install routes: `npx impeccable install`, or `/plugin marketplace add pbakaus/impeccable` in Claude Code; update with `npx impeccable update`.

## Design Source of Truth

`docs/ux-ui/design.md` is the only design authority. Impeccable's root `PRODUCT.md`/`DESIGN.md` are derived views generated from it, and `.stitch/DESIGN.md` is a mockup input.

## Detector Gate

`DO_NOT_TRACK=1 npx impeccable detect --json <target>` — exit `0` passes, `2` fails unless every finding is fixed or waived, `1` is `Unevaluated`. Rules on rendered pages need a URL target.

## Existing-Product Evaluation

`/akili-audit design` follows `references/design-evaluation.md` (steps E0–E7) and writes `docs/specs/audits/design-<YYYY-MM-DD>[-<safe-branch>][-N].md` with P1/P2/P3 findings, each routed to `/akili-quick` or `/akili-propose`.

## Source

- `../../.claude/skills/impeccable-bridge/SKILL.md`
- `../../.claude/skills/impeccable-bridge/references/design-evaluation.md`
