"use strict";
// @akili-spec changes/impeccable-audit-fixes/design-eval-contract
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
const step0 = () => slice(bridge(), "## Step 0", "### Engine state");
const verify = () => slice(step0(), "**Verify.**", "2. **Engine probe");
const exclusion = () => slice(step0(), "**Exclusion.**", "3. **Ready.**");
const ready = () => slice(step0(), "3. **Ready.**", "4. **Consent.**");
const consentStep = () => slice(step0(), "4. **Consent.**", "**The gate, stated once:**");
const engineConsent = () => slice(bridge(), "### Engine consent", "### Who does what");
const launcherForm = () => slice(bridge(), "### Launcher form", "### Scan matrix");

test("FR-1: after a consented download the pin is the written binary, `.exe` on Windows, probed directly", () => {
  const c = consentStep();
  assert.ok(index(c, "(this call is the download)") < index(c, "set the pin to"), "the pin follows the download");
  assert.ok(c.includes("set the pin to `${IMPECCABLE_HOME:-~/.impeccable}/bin/<VERSION>/impeccable`"), "pin path");
  assert.ok(c.includes("(`impeccable.exe` on Windows)"), ".exe note");
  assert.ok(c.includes("for every later launcher call in the phase"), "pin covers every later call");
  assert.ok(c.includes("run `<pin> engine-probe` directly"), "post-pin probe is direct");
  assert.ok(c.includes("a pin that does not answer records `unavailable (<first stderr line>)` instead"), "unanswered pin");
});

test("FR-1: Engine consent says IMPECCABLE_HOME alone does not isolate and names the Home override field", () => {
  const c = engineConsent();
  assert.ok(
    c.includes("`IMPECCABLE_HOME` alone does not isolate: without the pin, each launcher reads `~/.impeccable/bin/impeccable[.exe]` first, before `IMPECCABLE_HOME`."),
    "destination note",
  );
  assert.match(c, /\| Home override \| Under an exclusion, the download call alone runs with `HOME` \(or `USERPROFILE`\) set to an empty directory inside `IMPECCABLE_HOME` \|/);
});

test("FR-1: the Exclusion paragraph skips location 3 and resolved ~/.impeccable paths, requires an outside IMPECCABLE_HOME, and states the state-file limit", () => {
  const e = exclusion();
  assert.ok(e.includes("skip location 3"), "location 3");
  assert.ok(e.includes("any other candidate whose resolved path lies under `~/.impeccable`"), "resolved-path rule");
  assert.ok(e.includes("an `IMPECCABLE_BIN` or a `PATH` entry pointing there"), "examples of the resolved-path rule");
  assert.ok(e.includes("Location 4 counts only with an `IMPECCABLE_HOME` outside `~/.impeccable`"), "location 4");
  assert.ok(e.includes("The exclusion covers where the engine is found;"), "limit statement");
  assert.match(e, /state files/);
  assert.ok(e.includes("`IMPECCABLE_NO_UPDATE_CHECK=1` switches off the update check only"), "what the switch covers");
});

test("FR-1: the one download call changes the home variable, HOME for the shell launcher and USERPROFILE for the cmd launcher, inside IMPECCABLE_HOME", () => {
  const c = consentStep();
  assert.ok(c.includes("Under an exclusion, the consent question also asks"), "scoped to an exclusion");
  assert.ok(c.includes("asks for an `IMPECCABLE_HOME` outside `~/.impeccable` when none is set"), "consent asks for the home");
  assert.ok(c.includes("`unavailable (excluded location, no IMPECCABLE_HOME)` and do not download"), "no home given");
  assert.ok(c.includes("That one download call runs with the launcher's home variable set to an empty directory inside `IMPECCABLE_HOME`"), "one call, empty dir");
  assert.ok(c.includes("`HOME` for `scripts/impeccable`"), "POSIX launcher variable");
  assert.ok(c.includes("`USERPROFILE` for `scripts/impeccable.cmd`"), "Windows launcher variable (A1-W)");
});

test("FR-1: every launcher call carries IMPECCABLE_BIN= as an inline prefix (shell state may not persist)", () => {
  const r = ready();
  assert.ok(r.includes("export `IMPECCABLE_BIN=<that candidate>`"), "the export sentence stays");
  assert.ok(r.includes("Shell state may not persist between an agent's tool calls"), "why inline");
  assert.ok(r.includes("every launcher call also carries `IMPECCABLE_BIN=<pinned path>` as an inline prefix"), "item 3 prefix");
  const l = launcherForm();
  assert.ok(/^IMPECCABLE_BIN=<pinned path> DO_NOT_TRACK=1 IMPECCABLE_NO_UPDATE_CHECK=1 <skill-dir>\/scripts\/impeccable detect --json \[flags\] <targets>$/m.test(l), "launcher form prefix");
  assert.ok(l.includes("Every call carries the Step 0 pin inline"), "reworded pin sentence");
  assert.ok(!l.includes("stays pinned from Step 0"), "the export-only wording is retired");
});

test("FR-1 (BUT): the home variable never changes for any call other than the one download call, nor after the pin", () => {
  const c = consentStep();
  assert.ok(c.includes("No other call changes it, and no call after the pin does."), "no other call, none after the pin");
  const l = launcherForm();
  assert.doesNotMatch(l, /\bHOME=|USERPROFILE=/, "the launcher form never sets a home variable");
});

test("FR-1 (AND IT MUST): the report records Excluded: and IMPECCABLE_BIN: (and the download home override)", () => {
  assert.ok(exclusion().includes("Record `Excluded: ~/.impeccable`"), "Excluded field");
  const c = consentStep();
  assert.ok(c.includes("`IMPECCABLE_BIN: <pinned path>`"), "IMPECCABLE_BIN field");
  assert.ok(c.includes("`Download home override: <variable>=<dir> (one call)`"), "Download home override field");
});

test("FR-2: the Verify paragraph hashes every UPSTREAM.md file, with SKILL.md minus its metadata: block (up to, not including, the closing fence)", () => {
  const v = verify();
  assert.ok(v.includes("Hash every file `UPSTREAM.md` lists"), "hash every listed file");
  assert.ok(v.includes("`shasum -a 256`, `sha256sum`, or `certutil -hashfile <file> SHA256` on Windows"), "sha256 tools");
  assert.ok(v.includes("with its `metadata:` block removed, from the line `metadata:` up to, **not** including, the closing `---` fence"), "metadata range");
  assert.ok(v.includes("neither listed nor one of `LICENSE`, `NOTICE`, `UPSTREAM.md` counts as modified"), "unlisted file counts as modified");
});

test("FR-2: the recorded value is vendored (<version>, verified) or vendored (<version>, modified: <n> files: <first 3 names>)", () => {
  const v = verify();
  assert.ok(v.includes("`vendored (<version>, verified)`"), "verified");
  assert.ok(v.includes("`vendored (<version>, modified: <n> files: <first 3 names>)`"), "modified");
  assert.ok(v.includes("the table keeps `vendored (<version>)`"), "the table value stays");
});

test("FR-2: Copy, Home and Other copies are recorded for any selected copy, vendored or user-installed, ahead of the vendored-only hashing", () => {
  const v = verify();
  const any = index(v, "For any selected copy, `vendored` or `user-installed`, record `Copy`");
  assert.ok(any < index(v, "Hashing applies only to a `vendored` copy"), "the record sentence precedes the vendored-only scope");
  assert.ok(any < index(v, "`Other copies`") && any < index(v, "**Never select another copy.**"), "record and never-select sit under the any-copy opener");
});

test("FR-1: an IMPECCABLE_HOME set inside ~/.impeccable is asked for again under an exclusion, never used for the download", () => {
  const c = consentStep();
  assert.ok(c.includes("when none is set, or the one set lies under `~/.impeccable`; if no outside home is given, record `unavailable (excluded location, no IMPECCABLE_HOME)`"), "inside-home case");
});

test("FR-2: Verify records Copy (absolute path) and Home (HOME, or USERPROFILE on Windows)", () => {
  const v = verify();
  assert.ok(v.includes("`Copy` (the absolute path of the copy it selects)"), "Copy");
  assert.ok(v.includes("`Home` (what `~` resolved to: the agent process's `HOME`, or `USERPROFILE` on Windows)"), "Home");
});

test("FR-2: Verify lists every other impeccable/SKILL.md found, with its version", () => {
  const v = verify();
  assert.ok(v.includes("`Other copies`: every other `impeccable/SKILL.md` found in the locations above, with its version, or `none`"), "Other copies");
});

test("FR-2 (BUT): another copy is never selected", () => {
  assert.ok(verify().includes("**Never select another copy.**"), "never select another copy");
});

test("FR-2 (AND IT MUST): a modified copy still leads and the report states it as an environment finding, never a design finding", () => {
  const v = verify();
  assert.ok(v.includes("A `modified` copy still leads; the report states it as an environment finding, never a design finding."), "modified copy leads");
});

test("Guard: this test file reads no file under the spec folder", () => {
  // The forbidden path is built from fragments so this source never contains it.
  const D = "do" + "cs";
  const S = "sp" + "ecs";
  const src = fs.readFileSync(__filename, "utf8");
  assert.ok(!src.includes(`${D}/${S}`), "no literal path into the spec folder");
  assert.ok(!new RegExp(`["']${D}["']\\s*,\\s*["']${S}["']`).test(src), "no path-segment read of the spec folder");
  assert.ok(src.includes("@akili-spec changes/impeccable-audit-fixes/design-eval-contract"), "header comment present");
});
