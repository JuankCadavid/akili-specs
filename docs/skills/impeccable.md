# `impeccable`

**Binding `conditional`** — AKILI's lead design skill, shipped as a verbatim third-party copy of Paul Bakaus's [Impeccable](https://github.com/pbakaus/impeccable). The AKILI rules around it live in [`impeccable-bridge`](impeccable-bridge.md); this page covers what is vendored and how it is kept.

AKILI-SPECS is not affiliated with the Impeccable project. Impeccable is by Paul Bakaus and is not an AKILI work.

## Purpose

Impeccable owns the design rules, commands and references: visual direction, page mode, craft floor, critique, audit and polish. AKILI ships it so every install carries the same design instructions, whichever of the six targets you use.

## Use When

- A spec has UI/UX impact: the UI steps of the AKILI commands load [`impeccable-bridge`](impeccable-bridge.md), which tells the agent to lead with this skill.
- You want to run an Impeccable command yourself, for example `/impeccable critique`. Read *Using it outside AKILI* first.

## Attribution and licence

| Item | Value |
|---|---|
| Author | Paul Bakaus |
| Source | https://github.com/pbakaus/impeccable (the upstream `.claude` build) |
| Licence | Apache-2.0, `LICENSE` preserved beside the skill |
| Pin | Upstream commit `df3a4abe7d0840d5f60324812c432e00b66a4e75`, skill 4.8.0, engine 0.1.18. `.claude/skills/impeccable/UPSTREAM.md` is authoritative if this line and it ever differ |
| Modification | One: an AKILI `metadata` block in the `SKILL.md` frontmatter (author, source, adapted-by, adapted-for, binding). Declared in `NOTICE`; no other file is changed |
| Affiliation | None. AKILI-SPECS is not affiliated with the Impeccable project |
| Adapted by | Juan Carlos Cadavid — jcadavid.com, for AKILI-SPECS (curation only; `adapted-by` never replaces the author) |

## What ships

`.claude/skills/impeccable/` holds 61 files: upstream's 58 plus `LICENSE`, `NOTICE` and `UPSTREAM.md`. `NOTICE` carries upstream's third-party notices (platform design references distilled from ehmo's MIT-licensed `platform-design-skills`) and AKILI's modification statement. `UPSTREAM.md` records the pin and a checksum per upstream file.

The engine binary is **not** in the package. The vendored launcher (`scripts/impeccable`) can download it on first run; when AKILI steps may reach it is the bridge's call, under its *Step 0 — Skill source and engine gate* and *Engine consent* sections.

## Install behavior

- `akili install` copies the folder to all six targets (Claude Code, OpenCode, Antigravity, Codex, Cursor, Grok Bot) wherever the target receives skills, and the launcher is executable afterward. `akili doctor` counts `impeccable` like any other packaged skill.
- An `impeccable/` you installed yourself is never overwritten silently. On Claude Code, OpenCode, Antigravity, Codex and Cursor, an existing `impeccable/` is AKILI's only when it holds AKILI's `UPSTREAM.md`; otherwise it is skipped as foreign (with its version when readable). `akili install --force` replaces it whole, never merged. Grok Bot follows the installer's ownership record instead.
- A foreign copy still leads: the bridge records the skill source as `user-installed (<version>)`.

## Using it outside AKILI

Invoking `/impeccable` directly, outside an AKILI command, follows upstream behavior: the bridge's gate governs AKILI steps only. That includes the launcher's first-run engine download. Upstream also warns that in Claude Code installed command hooks run even when you deny the model's own commands, so a hook can trigger that download; review installed hooks before unattended runs (upstream `README.md`, the paragraph beginning "Hooks run outside model approval").

### Update check and telemetry

Read at the pin (`df3a4ab`) in upstream's own docs; the engine source itself was not read.

| Behavior | What upstream documents | Source at the pin |
|---|---|---|
| Update check | `impeccable context` asks `<host>/api/version` for the latest skill version, at most once per 24 hours, with a 1200 ms timeout, and errors are swallowed. It is skipped when `IMPECCABLE_NO_UPDATE_CHECK` is set or `updateCheck` is `false` in `.impeccable/config.json`. **`DO_NOT_TRACK` is not among its switches** | `docs/CLI-CONTRACT.md`, section `context.mjs` -> `impeccable context`, bullets *Update cache* and *Env vars read* |
| Telemetry | When a new design starts, the skill fetches visual directions from the impeccable.style catalog; turning telemetry off does not stop that request, it stops the anonymous record of which directions were shown and chosen. Off switches: `npx impeccable telemetry off`, `DO_NOT_TRACK=1`, or `"telemetry": false` in `.impeccable/config.json` | `README.md`, paragraph "Telemetry."; `docs/CLI-CONTRACT.md`, bullets *Telemetry ping* and `impeccable telemetry off\|on\|status` |

**Consequence.** `DO_NOT_TRACK=1` stops the telemetry record; per the contract it does not stop the update check, which `IMPECCABLE_NO_UPDATE_CHECK=1` does; AKILI runs set that switch on every launcher run. The prefix rule for AKILI runs is in the bridge's *Privacy and consent* section; this page does not restate it. `Unverified:` whether the compiled engine at `0.1.18` behaves exactly as the contract describes. Confirm at source before relying on a negative.

## Pin hygiene and re-sync

- `test/impeccable-vendor.test.js` recomputes every checksum in `UPSTREAM.md` over raw bytes and names any file that differs, so a hand edit fails `npm test`.
- `.gitattributes` marks the folder `-text` so the vendored bytes, including the CRLF `impeccable.cmd`, stay exact on every checkout.
- Re-sync is `scripts/sync-impeccable.js` (maintainer-only, not published in the package): run it against a clean local upstream checkout at the commit you want. It copies the build, applies the frontmatter block, writes `LICENSE`, `NOTICE` and `UPSTREAM.md`, and downloads nothing.
- At release, compare the pin with upstream's latest release tag; the step is in [`release-checklist.md`](../release-checklist.md).
- After a sync, update `CHANGELOG.md` and the counts tests. The Pin row above must match `UPSTREAM.md`.

## Acceptance checklist (governance)

| # | Item | Answer |
|---|---|---|
| 1 | Need | The UI steps of `/akili-constitution`, `/akili-propose`, `/akili-specify`, `/akili-execute`, `/akili-test`, `/akili-validate` and `/akili-audit design`, through `impeccable-bridge` |
| 2 | Binding declared | `conditional`, in `metadata.binding`; reached through the bridge, listed in [governance.md](governance.md) *Current assignment* |
| 3 | Attribution | Author, source, licence, modification and non-affiliation above; `LICENSE` and `NOTICE` ship with the skill |
| 4 | Size | One skill with `reference/` (progressive disclosure); 61 files; the growth bound is in the spec's size requirement |
| 5 | Docs + CHANGELOG | This page; the row in [README.md](README.md); a row in [overview.md](../overview.md); the CHANGELOG entry is owned by the spec's release task |

The category rules this skill is held to are in [governance.md](governance.md) under *Vendored third-party (verbatim)*.

## Source

- `../../.claude/skills/impeccable/SKILL.md`
- `../../.claude/skills/impeccable/UPSTREAM.md`
- `../../.claude/skills/impeccable/NOTICE`
