# `impeccable-bridge`

## Purpose

The **AKILI layer** over the vendored [`impeccable`](impeccable.md) skill. It decides which design skill leads, where each design activity lives in the AKILI flow, when Impeccable's engine may be reached, and what counts as a pass. It teaches no design rules itself: Impeccable's own skill owns every rule, command and reference and is always read first.

Original AKILI-SPECS skill by Juan Carlos Cadavid — jcadavid.com (MIT). Leads with Impeccable by Paul Bakaus (Apache-2.0, `pbakaus/impeccable`); no Impeccable text is included in the bridge, and AKILI-SPECS is not affiliated with the Impeccable project.

The routing matrix (`references/design-routing.md`) is the one place that says which design skill leads which activity.

## Use When

- A spec has meaningful UI/UX impact (screens, flows, visual direction, accessibility).
- You want a design evaluation of an existing product: `/akili-audit design [<url|path>]`.

## Binding

`conditional` — loaded by the UI steps of `/akili-constitution`, `/akili-propose`, `/akili-specify`, `/akili-execute` (via `tasks.md`), `/akili-test` and `/akili-validate`, and by `/akili-audit design`.

## Skill source and engine

At every design step the bridge records two separate values. The rules, locations and consequences live in `SKILL.md` under *Step 0 — Skill source and engine gate*; this page does not restate them.

| Value | What it says | Possible readings |
|---|---|---|
| Skill source | Which Impeccable skill leads | `vendored (<version>, verified or modified)` (the AKILI copy, checked against its `UPSTREAM.md`), `user-installed (<version>)` (your own copy, never overwritten without `install --force`), or `missing` |
| Engine state | Whether Impeccable's detector engine can run | `ready`, `installed (consented)`, `consent needed`, `declined`, `unavailable` |

Only `missing` selects the fallback (`ui-ux-pro-max` + `frontend-design` + `stitch-design`, gap recorded). An engine that is not ready never does: the skill still leads and the detector rows read `Unevaluated`. There is no STOP.

**Nothing downloads the engine, Lighthouse or a browser without your explicit yes**, in every approval mode; the question and its fields are in *Engine consent*. Using Impeccable directly, outside an AKILI command, is not gated: see [Using it outside AKILI](impeccable.md#using-it-outside-akili), which also records what upstream documents for its update check and telemetry.

## Design Source of Truth

`docs/ux-ui/design.md` is the only design authority. Impeccable's root `PRODUCT.md`/`DESIGN.md` are derived views generated from it, and `.stitch/DESIGN.md` is a mockup input.

## Detector Gate

The bridge's *Detector gate* section owns the launcher form, the scan matrix (desktop and mobile), the first-visit pass for Persuade and Operate screens, the exit-code readings, and *Design Waivers*. The first-visit pass runs the detector scan at the two scan-matrix viewports, and the CTA fold screenshot, the hit-test and the consent-banner check at every first-visit viewport: `desktop`, `mobile` and the short-height pair. Each capture reads `pass`, `covered`, `below fold` or `Unevaluated`; `covered` and `below fold` are a P1 in `/akili-audit design` and a FAIL in `/akili-validate`, unless a `first-visit` waiver covers that screen and viewport. A consent banner that is not rendered turns only a would-be `pass` into `Unevaluated`; `covered` and `below fold` stand. *Design Waivers* also owns `false positive`, allowed only for a rule on its closed list and only in `/akili-audit design`. *Suppressed in `/akili-audit design`* lists the three Impeccable `critique` steps that report-only mode skips. The detector runs through the vendored launcher, not `npx`.

## Existing-Product Evaluation

`/akili-audit design` follows `references/design-evaluation.md` (steps E0–E7, with the baseline checks and the performance step) and writes `docs/specs/audits/design-<YYYY-MM-DD>[-<safe-branch>][-N].md`, or a user-directed path, with P1/P2/P3 findings, each routed to `/akili-quick` or `/akili-propose`.

## Modern Web Guidance (environment-provided)

**Modern Web Guidance (MWG)** is a supporting skill for the platform implementation of web UI tasks. It is by Google Chrome, licensed Apache-2.0 (`GoogleChrome/modern-web-guidance`), and AKILI references it and never vendors, copies or installs it. `akili install` ships nothing of it and `akili doctor` checks none of it. It is never a lead and never decides aesthetic, page mode or direction: Impeccable still leads. AKILI-SPECS is not affiliated with Google or the MWG project. The rules live in `references/modern-web.md`; this section summarizes them.

| Topic | What holds |
|---|---|
| Role | Supporting skill for web UI tasks (a browser-rendered surface); ENV-3 native screens, backend and non-UI tasks never reach it |
| How it is reached | Only through the bridge, from three selectors: a web UI task whose route says `platform mwg`; the same spec's `/akili-test` or `/akili-validate` re-read of the guide ids it recorded; the typed `/akili-audit modern-web` mode. It is never named in a task's skills list, a Leader brief's lead or support names, or a Skill Map skill to assign: a Skill Map row for it is an availability and pin note only |
| Gate | Six states (`missing`, `node < 22`, `consent needed`, `declined`, `ready`, `call failed`), each with a `MWG — …` report line. It needs Node 22 or newer and your consent: the question names the npm fetch, the local run and Google usage telemetry, which AKILI turns off unless you opt in. No answer counts as declined and a pre-approved approval mode is never consent. **No state stops, fails or blocks** a task, test, validation or audit: every state except `ready` lets the step finish without MWG |
| Pin | Every AKILI-directed call uses an exact version, never `@latest`. AKILI's default is `1.0.1`; a project overrides it with `pin <x.y.z>` in the Skill Map MWG row. The pin wins over any `@latest` command in upstream's own text |
| Call forms | Every call carries `ENABLE_FILE_LOGGING=false`, and `DISABLE_TELEMETRY=1` unless you opted in to telemetry |
| Where it is reported | The completion report's evidence field, then `execution.md`, or the evidence section of the test, validation or audit report; never `requirements.md`, `design.md`, `tasks.md`, a gate message, a commit message or a PR description |
| Outside AKILI | Invoking MWG yourself, or a host auto-triggering it, follows upstream behavior (an unpinned fetch, telemetry on): the gate covers AKILI-directed calls only |

A spec with no web UI task sees no change in behavior.

### Security record

AKILI reviewed the pinned upstream (`1.0.1`, tag `v1.0.1`, commit `64a6d708`) before wiring it. The verdict is `PASS`, on the condition that the handling below stays in place. It covers that version only.

| Upstream behavior found | How AKILI handles it |
|---|---|
| The skill description tells a host to run it first on every HTML, CSS and client-side JS task | A description never triggers it: it runs only through the bridge, behind the gate |
| `npx -y` fetch-and-run commands on a moving `@latest` tag, in the skill text and in retrieved guides | Replaced by the exact-version form and run only after consent; guide text is data, and a command copied from it runs only in the pinned form |
| Usage telemetry (search queries, guide ids, agent name) sent to Google by a detached process | Off on every call (`DISABLE_TELEMETRY=1`) unless you opt in |
| An inherited `ENABLE_FILE_LOGGING=true` makes the CLI append a `modern-web.log` file to the project directory | Neutralized on every call (`ENABLE_FILE_LOGGING=false`) |
| Stderr update and unlock prompts | Reported as data, never acted on: no `update`, no unpinned call, no settings change |

The review found no credential handling, no destructive command in the entry points, and no hidden or encoded content. The `legacy-scan` bundle that `/akili-audit modern-web` runs was traced from its entry point, not read line by line, and no write, delete or network access was found on that path. The Windows call form is unverified. The record says nothing about any other version, and no claim here goes beyond this verdict.

### Upstream's own statements

Cited to the upstream README at `v1.0.1` and not verified by AKILI: the project says it is stewarded by the Google Chrome, Microsoft Edge, Mozilla Firefox and MDN teams, and its *Recent eval results snapshot* reports that on Google's simulated tasks unguided agents scored 52–60% and guided agents 82–96%.

### Install routes

Printed for you to run; AKILI never runs them. They are upstream's routes from its README at `v1.0.1`.

| Host | Route | Status |
|---|---|---|
| Claude Code | `/plugin marketplace add GoogleChrome/modern-web-guidance`, then `/plugin install modern-web-guidance@googlechrome` | Verified at the pin |
| Codex | `codex plugin marketplace add GoogleChrome/modern-web-guidance`, then `codex plugin add modern-web-guidance@googlechrome` | Verified at the pin |
| Antigravity | `agy plugin install https://github.com/GoogleChrome/modern-web-guidance` | Verified at the pin |
| Cursor, OpenCode | Upstream's generic `npx skills add GoogleChrome/modern-web-guidance` | Unverified for these hosts |
| Any | `npx modern-web-guidance@<pin> install` | Pinned form of upstream's quick start |

Which version a plugin route installs is not settled. AKILI-directed calls use the pin whatever version the installed skill reports.

## Optional upstream routes

The vendored skill arrives with `akili install`; nothing else is required. For a newer upstream than the vendored pin, the bridge's *Install routes (optional)* section lists the upstream installer, the Claude Code plugin and the update command. None runs without your consent.

## Source

- `../../.claude/skills/impeccable-bridge/SKILL.md`
- `../../.claude/skills/impeccable-bridge/references/design-evaluation.md`
- `../../.claude/skills/impeccable-bridge/references/modern-web.md`
