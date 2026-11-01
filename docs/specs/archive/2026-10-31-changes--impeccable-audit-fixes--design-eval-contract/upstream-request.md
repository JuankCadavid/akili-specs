# Upstream request to Impeccable (DRAFT, not filed)

**Status: draft. Nothing has been filed.** JC files it, if at all. Target: `pbakaus/impeccable` (vendored pin `df3a4ab`, engine 0.1.18, as recorded in `.claude/skills/impeccable/UPSTREAM.md`). Source: AKILI-SPECS audit of 2.40.0 (gaps M1, M5b, M14). Line numbers were re-read at HEAD on 2026-10-31 and belong to the vendored launcher at that pin.

| # | Item | Class | AKILI workaround today |
|---|---|---|---|
| 1 | Launcher order ignores `IMPECCABLE_HOME` | behavior | pin `IMPECCABLE_BIN` inline on every call |
| 2 | `--no-consent-hiding` knows only known CMPs | behavior / docs | browser capture asserts the banner; detector flags count only for a confirmed banner |
| 3 | `text-occlusion` fires inside `aria-hidden="true"` | false positive | report-only `false positive` value on a closed list |

## 1. Launcher runs `~/.impeccable/bin/impeccable` before `IMPECCABLE_HOME` (M1)

**Repro (POSIX)**

1. Install an engine at `~/.impeccable/bin/impeccable` (any version that passes `engine-probe`).
2. Unset `IMPECCABLE_BIN`. Set `IMPECCABLE_HOME=/tmp/x` (an empty directory).
3. Run `.claude/skills/impeccable/scripts/impeccable engine-probe`.

**Observed:** the launcher `exec`s `$HOME/.impeccable/bin/impeccable`; `/tmp/x` is never read. **Expected:** an explicitly set `IMPECCABLE_HOME` is the cache the launcher uses, or the docs say it is not an isolation switch. Only `IMPECCABLE_BIN` beats the home binary.

**Citation (`scripts/impeccable`, read 2026-10-31):**

- `:90-91`: `if [ -n "${IMPECCABLE_BIN:-}" ] && [ -x "${IMPECCABLE_BIN}" ]; then exec "${IMPECCABLE_BIN}" "$@"`.
- `:122-124`: `home_bin="${HOME:-/nonexistent}/.impeccable/bin/impeccable$exe"`, then `if [ -z "$probing" ] && [ -x "$home_bin" ] && probe_ok "$home_bin"; then exec "$home_bin" "$@"`.
- `:127-128`: only after that, `cache_root="${IMPECCABLE_HOME:-${HOME:-/nonexistent}/.impeccable}"`.
- `scripts/impeccable.cmd` (Windows): `:29-31` tries `IMPECCABLE_BIN`; `:51` `home_bin=%USERPROFILE%\.impeccable\bin\impeccable.exe`; `:60` `IMPECCABLE_HOME=%USERPROFILE%\.impeccable`. It reads `USERPROFILE`, not `HOME`.

**Proposed fix:** when `IMPECCABLE_HOME` is set, skip the home binary (or try `$IMPECCABLE_HOME/bin/...` first); otherwise state in the launcher header and the docs that `IMPECCABLE_HOME` does not isolate. Apply the same order to `impeccable.cmd`.

## 2. First-visit detector flags ignore custom consent banners (M5b)

**Repro**

1. Serve a page with a hand-written cookie banner (not OneTrust or Cookiebot) that covers the primary CTA on first visit.
2. Run `impeccable detect --json --no-consent-hiding --no-overlay-hiding <url>`.
3. Compare with the browser first visit.

**Observed (AKILI audit):** the two flags add no evidence for a custom banner; the first-visit result matched the default scan. **Expected:** either the flags apply to any banner-like overlay, or the help says plainly that they affect only the known managers.

**Citation:** `detect --help` of engine 0.1.18 (darwin-arm64) was re-run on 2026-10-31: `--no-consent-hiding  URL scans: keep known consent managers' banners (OneTrust, Cookiebot, ...) on the page instead of hiding them before the scan` and `--no-overlay-hiding  URL scans: keep product tours (driver.js) and preloaders still covering the page instead of hiding them before the scan`. The help is silent on custom banners. `engine-probe` printed `impeccable-engine 0.1.18`, exit 0.

`UNVERIFIED — confirm at source before relying on it:` the observed behavior with a custom banner. It comes from the audit report, and this draft did not re-run it against a fixture page.

**Proposed fix:** document the limit in `--help`, and add a flag or a generic heuristic (fixed-position, full-width overlay with a consent-like button) so a custom banner can be kept on the page.

## 3. `text-occlusion` fires inside `aria-hidden="true"` subtrees (M14)

**Repro**

1. Serve a page with decorative cards inside an element with `aria-hidden="true"`, with text overlapping another element.
2. Run `impeccable detect --json <url>`.

**Observed (AKILI audit):** 96 `text-occlusion` hits on decorative `aria-hidden` cards. The only waivers are an upstream ignore (a repo edit) or a design clause. **Expected:** text in an `aria-hidden="true"` subtree is not exposed to users of assistive tech and is decorative by declaration, so the rule skips it or reports it as advisory.

**Citation:** none re-run. `UNVERIFIED — confirm at source before relying on it:` the 96-hit count and the rule's current behavior; both are from the audit report. Verify with `impeccable detect --list-rules --json` and one scan of a fixture page.

**Proposed fix:** skip nodes with an `aria-hidden="true"` ancestor in `text-occlusion`, or classify those hits as advisory so they never change the exit code.
