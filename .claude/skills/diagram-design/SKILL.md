---
name: diagram-design
description: "Trigger: diagram, diagrams, C4, Mermaid, flowchart, sequence diagram, ER diagram, state diagram, interactive diagram, Archify, diagram slot, /akili-constitution PRD/UX/TRD steps, /akili-specify architecturally significant design, /akili-archive diagram links. Fill the diagram slots of AKILI baseline and spec documents as inline Mermaid (canonical) and, only when the archify skill is available, link an interactive HTML view."
license: MIT
metadata:
  author: Juan Carlos Cadavid — jcadavid.com
  binding: conditional
  version: "1.0"
  inspired-by: "Archify by tt-a1i (MIT, https://github.com/tt-a1i/archify) — interactive diagram rendering, referenced and never copied; the C4 model (Simon Brown, c4model.com); Mermaid (mermaid.js.org)"
---

# Diagram Design — Diagram Slots, Mermaid First, Interactive When Available

Every AKILI document answers its questions with named **diagram slots**. Each slot is an inline Mermaid block (the source of truth). When the `archify` skill is available, the slot also gets an interactive HTML view linked under the block. Without it, the document is still complete.

## 1. When to Load

Load only at these steps, each by one conditional line in the command:

| Command | Step | Fill |
|---|---|---|
| `/akili-constitution` | Step 3 (PRD) | PRD slots whose condition holds |
| `/akili-constitution` | Step 4 (UX/UI) | UX/UI slots whose condition holds |
| `/akili-constitution` | Step 5 (TRD) | TRD slots (C4 Context and C4 Container always) |
| `/akili-specify` | Step 2.1, architecturally significant designs | `design.md` slots the change alters |
| `/akili-archive` | Step 2 (summary) | List the spec's diagram links; list each baseline slot the spec's design made stale as a follow-up |

Never load it outside these steps.

## 2. Slots

Read `references/slot-catalog.md` at a slot step, not before. Fill only the slots whose condition holds. A slot whose condition is false leaves nothing in the document: no empty block, no placeholder, no note. The catalog owns the conditions.

## 3. Mermaid First

Every filled slot is an inline fenced `mermaid` block in the slot's section, followed by a legend. Use the Mermaid type the catalog names. The block is the source of truth; any interactive view is derived from it. Without an interactive view, write no link line and do not state or imply that one exists.

## 4. Interactive View

1. **Availability, once per command run.** Archify is available when the host lists an `archify` skill in the session, or an `archify/SKILL.md` exists under one of these roots: `.claude/skills/`, `~/.claude/skills/`, `.agents/skills/`, `~/.agents/skills/`, `.opencode/skills/`, `~/.config/opencode/skills/`. Otherwise it is unavailable (Antigravity has no documented root, so treat it as unavailable there unless the host lists the skill). Check by reading only; never run Archify to find out.
2. **Delegate.** Follow the `archify` skill's own authoring and delivery procedure for the slot's Archify type, with the slot's Mermaid block as input, writing to the paths below. Its `SKILL.md` owns every command, option, and repair rule; this skill restates none.
3. **Paths.** Baseline documents: `docs/diagrams/<slot-id>.json` and `.html`, where the slot id comes from the catalog and already starts with `prd-`, `ux-` or `trd-` (for example `docs/diagrams/trd-c4-container.json`). Spec documents: `docs/specs/<spec-path>/diagrams/<slot-id>.json` and `.html`. One view per slot: on a re-render reuse the same paths, never timestamped copies.
4. **Link line.** Directly under the Mermaid block, one line, exact wording: `Interactive view: [<slot title>](<relative path>.html) — rendered with Archify (tt-a1i, MIT)`. When Archify reports its browser check as skipped, append ` · browser check not run`.
5. **Receipts stay out of git.** Archify writes sidecar receipt files beside each HTML. Ensure `docs/diagrams/.gitignore` and `docs/specs/<spec-path>/diagrams/.gitignore` exist and list `*.finalize.json`, `*.finalize-summary.json`, `*.delivery.json`, `*.browser-check.json`. Commit the slot `.json` and `.html`.

## 5. Outcomes and Fallback

Read the outcome from Archify's own report:

| Outcome | Action |
|---|---|
| All gates passed | Write the link line |
| Browser check skipped | Keep the HTML, write the link line with the suffix, never call the view verified |
| Failed after Archify's own repair limit | Delete any partial output for the slot, write no link line, continue the phase; do not retry beyond that limit |

Archify unavailable, or a failed delivery, never blocks the phase. The slot stands as Mermaid only. Report in one line each slot left without an interactive view and why.

## 6. Keep in Sync

When a slot's Mermaid block changes, re-render its view in the same run, or remove its link line and its `.json` and `.html`. A view that diverges from its Mermaid block is a defect. If Archify is unavailable in that run, remove, and report the removal in the command's summary.

## 7. Guard-Rails

Inside any AKILI command:

- Never offer Archify's explainer mode.
- Never write an `[archify explainer: …]` line into any rules file.
- Never install, update, snooze, or ignore Archify updates on your own initiative.
- Relay an Archify update notice at most once per command run, as information only.
- Use no third-party brand marks unless the user asks for them.
- Never state an Archify command or flag in AKILI text; delegate them to Archify's own `SKILL.md`, and name only outcomes and locations.
- Never alter the user's Archify configuration or environment variables.

## 8. Credit

Interactive views are rendered by Archify, by tt-a1i, MIT licence, https://github.com/tt-a1i/archify. It is referenced and never copied into the AKILI package; this skill ships no Archify file. Installing Archify is the user's choice and is documented in the project README, not performed here. The C4 model and Mermaid are credited in the frontmatter.
