# T12 Live Smoke Evidence (project-scoped HyperFrames)

Date 2026-10-18. Authorization: Juan Carlos, T12 live test (scratch dir, no `-g`, `HYPERFRAMES_NO_TELEMETRY=1`, no global skills touched). `$S` = a scratch directory under the session scratchpad (`.../scratchpad/t12/`); not in the repo. HyperFrames CLI 0.8.172, Node v22.12.0, ffprobe 8.1, macOS arm64.

## Verdict summary

| Item | Result |
|---|---|
| Install (project-scoped, no `-g`, no `--agent`) | exit 0, 10 skills |
| `check` | exit 0 (0 errors, 1 warning, 5/5 contrast) |
| `snapshot --at 1,3` | exit 0, 3 stills (1 s, 3 s, auto end frame 4.85 s) |
| `render --quality draft` | exit 0, non-empty (64446 B) |
| Duration, real run | 5.000000 s: PASS vs target 5 s (tol 0.1) and vs `data-duration` 5 |
| Falsifier A (4 s composition vs declared 5 s) | FAIL (4.000000 vs 5) |
| Falsifier B (`data-duration` 5, file truncated to 4 s) | FAIL on both comparisons |
| Disqualifier (resolution from global stale skills) | NOT triggered for the read of skills; see Findings F1 for `skills check` |
| Global skills touched | none (mtimes of all `hyperframes*`/`media-use` dirs under `~/.claude/skills` and `~/.agents/skills` identical before/after) |
| Outside-scratch writes by HyperFrames | YES: a Chrome download (about 204 MB) plus other writes; the STOP condition for outside-scratch downloads was triggered and missed; see F2 and section 4 |

## Findings for the spec (forward pointers)

- **F1. `skills check` ignores project scope.** Run from `$S/proj`, it printed `Location  <home>/.claude/skills (claude-code)` and reported the user's GLOBAL set: `0 current, 15 outdated, 4 core not installed (hyperframes-audio, -keyframes, -studio, media-use), 3 removed upstream`, exit 1. The project-scoped install was not examined. So `skills check` cannot certify a project-scoped install; it diagnoses the global set only. SKILL.md lists it as the "Freshness diagnostic"; its scope must be stated.
- **F2. HyperFrames downloaded its own Chrome and wrote outside the project, with telemetry off.** (a) Chrome: the first `render` log (`$S/render.log`) shows the spinner line `Browser: download`, and every render launched `HeadlessChrome/152.0.7977.30` (both `render.log` and `render-fals.log`). That browser sits at `~/.cache/hyperframes/chrome/chrome-headless-shell/mac_arm-152.0.7977.30` (about 204 MB; directory birth time Oct 18 12:30:02 2026, during the first render). It is not the puppeteer shell `doctor` reported (`mac_arm-151.0.7922.47`, dated Jul 27). `doctor`'s Chrome check did not predict the download and nothing warned beforehand, so the brief's STOP condition for downloads outside scratch was triggered and missed (the Leader records this deviation in `execution.md`). It was not deleted. (b) `~/.hyperframes/` already existed (directory birth Jun 24 10:12:56 2026). This run created `install-state.json` (12:29:09) and `running/` (12:29:08) in it and updated `config.json` (12:30:40: `commandCount`, `recentRenders`). (c) `~/.cache/hyperframes/` birth 12:29:37 (this run): `fonts/inter` (Google Fonts "Inter", about 0.7 MB), `history/`, and the Chrome above. (d) The composition loads GSAP from `cdn.jsdelivr.net` (per the installed `minimal-composition.md`), so render needs network. (e) Telemetry: `~/.hyperframes/config.json` holds `"telemetryEnabled": true` (the stored preference), but the env var `HYPERFRAMES_NO_TELEMETRY=1` was set on every call; upstream `packages/cli/src/telemetry/policy.ts:31-55` (`telemetryRuntimeOverride`/`effectiveTelemetryStatus`) returns `enabled: false` when that env var is `1`/`true`/`yes`/`on`, before the stored preference is consulted. Source-read, not observed at the network level. (f) The logs of `check`, `snapshot` and both renders contain no feedback prompt, rating request or feedback send (grep for `feedback|survey|rate this`: 0 matches in each).
- **F3. No render flag sets a duration.** `render --help` has no `--duration`; length is the root `data-duration`. Falsifier A therefore changes `data-duration` to 4 (the CLI then renders 4 s) and compares it with the declared target 5 s; Falsifier B truncates the real render with `ffmpeg -t 4 -c copy` (not HyperFrames) to exercise the `data-duration` comparison.
- **F4. Install without `--agent`: only `.agents/skills` and `.claude/skills` were created.** See "Agent dirs".
- **F5. P-23 (Chrome) settled:** HyperFrames fetches its own headless shell on first render; an existing puppeteer cache is not used. See section 4.

## 1. Install

```
cd $S && git init -q .
HYPERFRAMES_NO_TELEMETRY=1 npx --yes skills add heygen-com/hyperframes --yes --skill hyperframes --skill hyperframes-animation --skill hyperframes-audio --skill hyperframes-cli --skill hyperframes-core --skill hyperframes-creative --skill hyperframes-keyframes --skill hyperframes-registry --skill hyperframes-studio --skill media-use
exit=0
```

Output (trimmed): `Installed 10 skills`, each `./.agents/skills/<name>`, `universal: Amp, Antigravity, Antigravity CLI, Cline, Codex +12 more`, `symlinked: Claude Code`.

### Agent dirs populated (inside `$S`, none outside)

| Path | Content |
|---|---|
| `$S/.agents/skills/<10 skills>/` | real directories (canonical copy) |
| `$S/.claude/skills/<10 skills>` | symlinks `../../.agents/skills/<name>` (Claude Code) |
| `$S/skills-lock.json` | source `heygen-com/hyperframes`, per-skill `computedHash` |

Only `.agents/skills` and `.claude/skills` were created; no other agent dirs appeared. This is the documented no-`--agent` form; `--agent claude-code` was not used.

## 2. `skills check` (after install)

```
cd $S/proj; HYPERFRAMES_NO_TELEMETRY=1 npx hyperframes skills check   -> exit 1
  Location  <home>/.claude/skills (claude-code)
  0 current  15 outdated  4 core not installed  2 available on demand  3 removed upstream
  Outdated: embedded-captions faceless-explainer general-video hyperframes hyperframes-animation hyperframes-cli
            hyperframes-core hyperframes-creative hyperframes-registry motion-graphics music-to-video pr-to-video
            product-launch-video remotion-to-hyperframes slideshow
  Core not installed: hyperframes-audio hyperframes-keyframes hyperframes-studio media-use
  Removed upstream: graphic-overlays hyperframes-media website-to-video
```

It reports the global set, not the project install (F1).

## 3. Resolution path (disqualifier check)

- The composition was authored from skills read at `$S/.claude/skills/hyperframes/SKILL.md`, `.../hyperframes-core/SKILL.md`, `.../hyperframes-core/references/minimal-composition.md`, `.../hyperframes-cli/SKILL.md` and `.../references/lint-validate-inspect.md`, `.../doctor-browser.md`, `.../preview-render.md` (all via the scratch project).
- `readlink -f $S/.claude/skills/hyperframes` -> `$S/.agents/skills/hyperframes`; same for `hyperframes-core`. Not `~/.claude/skills`.
- The user's global set (`~/.claude/skills/hyperframes*`, `~/.agents/skills/hyperframes*`) is stale (it contains `hyperframes-media`, removed upstream, and lacks `media-use`); it was not read for this task, and its directory mtimes are unchanged (`GLOBAL_UNCHANGED`).
- Caveat: the CLI `skills check` itself looked at the global set (F1).

## 4. P-23 (Chrome)

`doctor --json` (exit 0, `ok:false` only for optional TTS/BGM extras) reported `Chrome ok: cache: $HOME/.cache/puppeteer/chrome-headless-shell/mac_arm-151.0.7922.47/...`, FFmpeg/FFprobe 8.1 ok, Docker running. The first `render` then printed `Browser: download` and launched `HeadlessChrome/152.0.7977.30` from `~/.cache/hyperframes/chrome/chrome-headless-shell/mac_arm-152.0.7977.30` (about 204 MB). Nothing in `doctor` predicted this and there was no pre-flight warning.

**P-23 result:** HyperFrames fetches its own headless shell on first render; an existing puppeteer cache is not used, and `doctor`'s Chrome line does not reflect which browser the render will use. The "no download outside scratch" condition could not be met on a machine without that browser. This run did not try a cache-env or `HOME` redirect (not known to work; untested). It triggered the brief's STOP condition and was not stopped (deviation, see F2).

## 5. Composition (`$S/proj/index.html`)

Root `#root data-composition-id="main" data-width=1920 data-height=1080 data-duration="5"`; one `.clip` `section` (`data-start=0 data-duration=5`) with an `h1` "T12 Smoke Test" (`from` y/opacity 0.6 s at 0.2 s) and a `#bar` (`from` scaleX 0 to 1 over 3 s at 0.5 s); one paused GSAP timeline registered at `window.__timelines["main"]`. Built from `minimal-composition.md`.

## 6. `check`

```
HYPERFRAMES_NO_TELEMETRY=1 npx hyperframes check   -> exit 0
Lint: 0 error(s), 1 warning(s): nested_structure_needs_subcomposition (<section id="title-card"> contains <h1>)
Runtime 0 errors, 0 warnings | Layout 0 issues across 9 sample(s) | Motion 0 errors | Contrast 5/5 text checks pass WCAG AA
Check passed
```

## 7. Snapshots

```
HYPERFRAMES_NO_TELEMETRY=1 npx hyperframes snapshot --at 1,3 --output ../stills   -> exit 0
3 snapshots: frame-00-at-1s.png, frame-01-at-3s.png, frame-02-at-4.85s.png (auto end frame), contact-sheet.jpg
```

Viewed: 1 s shows the title and a tiny bar start; 3 s shows the bar mostly grown; 4.85 s shows the full bar. The animation advances with time.

## 8. Draft render and metadata

```
HYPERFRAMES_NO_TELEMETRY=1 npx hyperframes render --quality draft --output ../draft.mp4   -> exit 0
  "62.9 KB · 5.0s video · rendered in 9.6s ... drawelement capture · hardware gpu"
test -s draft.mp4 -> 0 ; size 64446 bytes
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate -of json draft.mp4
{ "streams": [ { "codec_name": "h264", "width": 1920, "height": 1080, "r_frame_rate": "30/1" } ],
  "format": { "duration": "5.000000" } }
```

## 9. Duration comparison (tolerance 0.1 s: the skill states none; `render-evidence.md` says "the requirement's stated tolerance", T12 uses 0.1 s)

Comparison script `compare.sh <file> <target> <data-duration> <tol>` (awk on `ffprobe format.duration`).

| Run | format.duration | vs target 5 s | vs root data-duration | Overall |
|---|---|---|---|---|
| Real draft | 5.000000 | PASS | PASS (5) | PASS |
| Falsifier A (`data-duration` 4, CLI render, declared target 5) | 4.000000 | FAIL | PASS (4) | FAIL |
| Falsifier B (`data-duration` 5, file cut to 4 s by ffmpeg) | 4.000000 | FAIL | FAIL (5) | FAIL |

Verbatim:

```
REAL: format.duration=5.000000 target=5 (tol 0.1) -> PASS | data-duration=5 (tol 0.1) -> PASS | overall=PASS
FALSIFIER A: format.duration=4.000000 target=5 (tol 0.1) -> FAIL | data-duration=4 (tol 0.1) -> PASS | overall=FAIL
FALSIFIER B: format.duration=4.000000 target=5 (tol 0.1) -> FAIL | data-duration=5 (tol 0.1) -> FAIL | overall=FAIL
```

Falsifier A render: `62.5 KB · 4.0s video`, exit 0, ffprobe `format.duration "4.000000"`, h264 1920x1080 30/1. Note this shows that A is caught only by the target comparison (a 4 s file that matches its own `data-duration` passes the second comparison), and B only by the `data-duration` one plus target: the two-comparison design is justified.

## 10. Not done

- `usage --json` not run (it reads existing credentials; outside the authorization).
- No `feedback`, `publish`, cloud/lambda/cloudrun, global `skills update`, or delivery render.
- Telemetry suppression by the env var is source-read (`policy.ts:31-55`, F2e), not observed on the network.
- Scratch outputs (`$S`) left in place; HyperFrames home dirs (F2) left in place.
