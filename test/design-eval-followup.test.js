"use strict";
// @akili-spec changes/impeccable-audit-fixes/design-eval-followup
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), "utf8").replace(/\r\n/g, "\n");
const BRIDGE = [".claude", "skills", "impeccable-bridge"];

const index = (s, needle) => {
  const i = s.indexOf(needle);
  assert.ok(i >= 0, `missing: ${needle}`);
  return i;
};
// The text between two markers, the end marker searched only after the start marker.
const slice = (s, from, to) => {
  const i = index(s, from);
  const j = s.indexOf(to, i + from.length);
  assert.ok(j > i, `missing end marker after "${from}": ${to}`);
  return s.slice(i, j);
};

const bridge = () => read(...BRIDGE, "SKILL.md");
const firstVisit = () => slice(bridge(), "### First-visit pass", "### Exit codes");
const ctaItem = () => slice(firstVisit(), "3. A fold screenshot", "4. When the product has a consent banner");
const identification = () => slice(ctaItem(), "- Identification, in order:", "- Measurement:");
const consentStep = () => slice(slice(bridge(), "## Step 0", "### Engine state"), "4. **Consent.**", "**The gate, stated once:**");
const engineConsent = () => slice(bridge(), "### Engine consent", "### Who does what");
const launcherForm = () => slice(bridge(), "### Launcher form", "### Scan matrix");
const bannerItem = () => slice(firstVisit(), "4. When the product has a consent banner", "- The consent-hiding");

test("FR-1: the banner state is recorded as `not rendered: <reason>`, apart from the CTA outcome", () => {
  assert.ok(bannerItem().includes("the banner state reads `not rendered: <reason>`"), "banner state");
});

test("FR-1: only a would-be `pass` changes", () => {
  assert.ok(bannerItem().includes("only a would-be `pass` changes"), "precedence");
});

test("FR-1: a would-be pass still never reads `pass`", () => {
  assert.ok(bannerItem().includes("and never reads `pass`"), "never pass");
});

test("FR-1: a `below fold` or `covered` outcome stands", () => {
  assert.ok(bannerItem().includes("A `below fold` or `covered` outcome stands"), "outcome stands");
});

test("FR-1: the reason a missing banner cannot change those outcomes ships", () => {
  assert.ok(bannerItem().includes("cannot bring the CTA into view or uncover it"), "rationale");
});

test("FR-1: an item 3 `Unevaluated` outcome keeps its own reason", () => {
  assert.ok(bannerItem().includes("keeps its own reason"), "own reason");
});

test("FR-1: the test-ID remedy applies whatever the CTA outcome", () => {
  assert.ok(bannerItem().includes("whatever the CTA outcome"), "remedy scope");
});

test("FR-1: CTA identification never depends on the CTA's text", () => {
  assert.ok(!/\btext\b/i.test(identification()), "item 3 identification names no text match");
});

test("FR-3: the download call runs with `IMPECCABLE_BIN` unset", () => {
  assert.ok(consentStep().includes("also runs with `IMPECCABLE_BIN` unset"), "bin unset");
});

test("FR-3: the download call drops every PATH entry under ~/.impeccable, resolved against the real home before the override", () => {
  const c = consentStep();
  assert.ok(c.includes("every `PATH` entry removed whose resolved path lies under `~/.impeccable`"), "path filter");
  assert.ok(c.includes("resolved against the user's real home before the home override"), "resolution order");
});

test("FR-3: the reason ships", () => {
  assert.ok(consentStep().includes("each launcher runs `IMPECCABLE_BIN` and then an `impeccable` on `PATH` before it downloads"), "reason");
});

test("FR-3 (BUT): no other call overrides, unsets or filters; every call after the pin carries the pin, PATH and home", () => {
  const c = consentStep();
  assert.ok(c.includes("No other call overrides the home variable, unsets `IMPECCABLE_BIN` or filters `PATH`"), "no other call");
  assert.ok(c.includes("every call after the pin carries the pinned `IMPECCABLE_BIN` with the user's `PATH` and home variable"), "after the pin");
  assert.ok(!c.includes("No other call changes it"), "retired sentence gone");
});

test("FR-3 (AND IT MUST): the record carries the widened override field", () => {
  const c = consentStep();
  assert.ok(c.includes("`Download home override: <variable>=<dir>; IMPECCABLE_BIN unset; PATH entries removed: <entries, or none> (one call)`"), "record shape");
  assert.ok(c.includes("PATH entries removed:"), "PATH entries field");
  assert.ok(/field reads `none` when there is no exclusion/.test(c), "none without exclusion");
});

test("FR-3: the Engine consent Home override row names IMPECCABLE_BIN and PATH", () => {
  assert.match(engineConsent(), /\| Home override \|[^\n]*, with `IMPECCABLE_BIN` unset and no `PATH` entry under `~\/\.impeccable` \|/);
});

test("FR-3 (BUT): Launcher form gains no environment change", () => {
  const l = launcherForm();
  assert.ok(!l.includes("env -u"), "no env -u");
  assert.ok(!/\bPATH=/.test(l), "no PATH=");
});

test("Guard: this test file reads no file under the spec folder", () => {
  // The forbidden path is built from fragments so this source never contains it.
  const D = "do" + "cs";
  const S = "sp" + "ecs";
  const src = fs.readFileSync(__filename, "utf8");
  assert.ok(!src.includes(`${D}/${S}`), "no literal path into the spec folder");
  assert.ok(!new RegExp(`["']${D}["']\\s*,\\s*["']${S}["']`).test(src), "no path-segment read of the spec folder");
  assert.ok(src.includes("@akili-spec changes/impeccable-audit-fixes/design-eval-followup"), "header comment present");
});

const verifyPara = () => slice(slice(bridge(), "## Step 0", "### Engine state"), "**Verify.**", "2. **Engine probe");
// The shipped reference command: the backticked span that starts with `node -e`.
const refCommand = () => {
  const m = /`(node -e [^`]*)`/.exec(verifyPara());
  assert.ok(m, "a backticked `node -e` reference command ships in Verify");
  return m[1];
};
// The JS between the command's outer double quotes.
const refCode = () => {
  const c = refCommand();
  const i = c.indexOf('"');
  const j = c.lastIndexOf('"');
  assert.ok(i >= 0 && j > i, "the command has outer double quotes");
  return c.slice(i + 1, j);
};

test("FR-2: the strip is byte-exact and keeps a missing final newline", () => {
  const v = verifyPara();
  assert.ok(v.includes("byte-exact"), "byte-exact");
  assert.ok(v.includes("a missing final newline included"), "missing final newline");
});

test("FR-2: a tool that adds or removes any other byte does not conform", () => {
  assert.ok(verifyPara().includes("adds or removes any other byte does not conform"), "non-conformance");
});

test("FR-2: the known case is a strip that appends a final newline", () => {
  assert.ok(verifyPara().includes("appends a final newline"), "known case");
});

test("FR-2: the reference command has no quote-hostile character inside its outer double quotes", () => {
  const code = refCode();
  for (const ch of ['"', "$", "`", "%", "!"]) {
    assert.ok(!code.includes(ch), `no ${ch} inside the command`);
  }
});

test("FR-2: executing the shipped command on the vendored SKILL.md prints the UPSTREAM.md hash", () => {
  const cwd = path.join(ROOT, ".claude", "skills", "impeccable");
  const m = /^([0-9a-f]{64}) {2}SKILL\.md$/m.exec(read(".claude", "skills", "impeccable", "UPSTREAM.md"));
  assert.ok(m, "UPSTREAM.md lists a SKILL.md hash");
  const out = require("node:child_process").execFileSync(process.execPath, ["-e", refCode(), "SKILL.md"], { cwd, encoding: "utf8" });
  assert.strictEqual(out.trim(), m[1]);
});
