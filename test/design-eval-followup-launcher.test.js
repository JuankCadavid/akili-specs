"use strict";
// @akili-spec changes/impeccable-audit-fixes/design-eval-followup
//
// FR-3 scenario THEN, behaviorally: under an exclusion the bridge runs the one download call with
// IMPECCABLE_BIN unset, every PATH entry under the excluded ~/.impeccable removed (resolved against
// the real home) and the home variable pointed at an empty directory. This file runs the vendored
// POSIX launcher in that environment and proves no excluded binary runs; two controls reproduce the
// W-4 defect (the old rule changed only the home variable) and show the PATH filter is needed.
//
// "Runs" means the excluded binary is executed at all, including the launcher's engine-probe
// handshake (probe_ok calls the candidate with IMPECCABLE_LAUNCHER_PROBE=1): a probe executes the
// excluded code just as an exec does. The fake records every invocation in a marker file.
//
// Offline: IMPECCABLE_DOWNLOAD_BASE is file:///nonexistent, so curl (or wget, which rejects the
// scheme) fails without touching the network. curl/shasum stay on PATH.
//
// The launcher's bytes are copied (with VERSION and engine-checksums.txt) into the temp dir so a
// gitignored sibling engine (scripts/bin/<os>-<arch>/impeccable) on a developer machine cannot be
// exec'd first and mask the result; the code under test is the shipped file, byte for byte.
//
// Skipped on win32: the .cmd launcher stays an accepted gap.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");
const SCRIPTS = path.join(ROOT, ".claude", "skills", "impeccable", "scripts");
const SKIP = process.platform === "win32" ? "win32: the POSIX launcher is not run; the .cmd launcher is an accepted gap" : "";
if (SKIP) console.log(`# skip design-eval-followup-launcher: ${SKIP}`);

let tmp;
let fx;

test.before(() => {
  if (SKIP) return;
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "akili-launcher-"));
  const skill = path.join(tmp, "skill", "scripts");
  fs.mkdirSync(skill, { recursive: true });
  for (const f of ["impeccable", "VERSION", "engine-checksums.txt"]) {
    fs.copyFileSync(path.join(SCRIPTS, f), path.join(skill, f));
  }
  fs.chmodSync(path.join(skill, "impeccable"), 0o755);

  const R = path.join(tmp, "real-home"); // the user's real home, holding the excluded engine
  const E = path.join(tmp, "empty-home"); // the override home of the download call
  const H = path.join(tmp, "impeccable-home"); // IMPECCABLE_HOME, outside R/.impeccable
  const excludedBinDir = path.join(R, ".impeccable", "bin");
  const excludedBin = path.join(excludedBinDir, "impeccable");
  const marker = path.join(tmp, "excluded-ran.log");
  fs.mkdirSync(excludedBinDir, { recursive: true });
  fs.mkdirSync(E);
  fs.mkdirSync(H);
  fs.writeFileSync(
    excludedBin,
    `#!/bin/sh\nprintf '%s probe=%s\\n' "$*" "\${IMPECCABLE_LAUNCHER_PROBE:-}" >> '${marker}'\necho 'impeccable-engine 0.0.0'\n`,
  );
  fs.chmodSync(excludedBin, 0o755);

  // The user's PATH, minus any directory that already holds an `impeccable` (an installed engine
  // would answer the PATH probe and mask the result). curl/shasum stay reachable.
  const basePath = (process.env.PATH || "")
    .split(path.delimiter)
    .filter((d) => d && !fs.existsSync(path.join(d, "impeccable")));
  const version = fs.readFileSync(path.join(skill, "VERSION"), "utf8").trim();
  fx = { launcher: path.join(skill, "impeccable"), R, E, H, excludedBinDir, excludedBin, marker, basePath, version };
});

test.after(() => {
  if (tmp) fs.rmSync(tmp, { recursive: true, force: true });
});

// One launcher call. `bin`: export IMPECCABLE_BIN to the excluded binary; `onPath`: keep the
// excluded bin directory on PATH. HOME is always the empty override home.
function run({ bin, onPath }) {
  fs.rmSync(fx.marker, { force: true });
  fs.rmSync(path.join(fx.H, "bin"), { recursive: true, force: true });
  const env = {};
  for (const [k, v] of Object.entries(process.env)) if (!k.startsWith("IMPECCABLE_")) env[k] = v;
  env.HOME = fx.E;
  env.IMPECCABLE_HOME = fx.H;
  env.IMPECCABLE_DOWNLOAD_BASE = "file:///nonexistent";
  env.PATH = (onPath ? [fx.excludedBinDir, ...fx.basePath] : fx.basePath).join(path.delimiter);
  if (bin) env.IMPECCABLE_BIN = fx.excludedBin;
  const r = spawnSync("sh", [fx.launcher, "engine-probe"], { env, encoding: "utf8", timeout: 20000 });
  const ran = fs.existsSync(fx.marker) ? fs.readFileSync(fx.marker, "utf8") : null;
  return { ...r, ran };
}

test("FR-3 control (W-4 reproduced): only HOME overridden, IMPECCABLE_BIN exported and on PATH: the excluded binary runs", (t) => {
  if (SKIP) return t.skip(SKIP);
  const r = run({ bin: true, onPath: true });
  assert.ifError(r.error);
  assert.notStrictEqual(r.ran, null, "the excluded binary ran (marker written)");
  assert.strictEqual(r.ran, "engine-probe probe=\n", "exec'd through IMPECCABLE_BIN without a probe");
  assert.strictEqual(r.status, 0);
  assert.strictEqual(r.stdout.trim(), "impeccable-engine 0.0.0");
});

test("FR-3 control: IMPECCABLE_BIN unset but the excluded bin still on PATH: the excluded binary runs, so the PATH filter is needed", (t) => {
  if (SKIP) return t.skip(SKIP);
  const r = run({ bin: false, onPath: true });
  assert.ifError(r.error);
  assert.notStrictEqual(r.ran, null, "the excluded binary ran (marker written)");
  assert.strictEqual(r.ran, "engine-probe probe=1\nengine-probe probe=\n", "probed on PATH, then exec'd");
  assert.strictEqual(r.status, 0);
});

test("FR-3 THEN: the rule's environment (HOME empty, IMPECCABLE_BIN unset, excluded PATH entry removed): neither excluded binary runs and the call falls through to the download into IMPECCABLE_HOME", (t) => {
  if (SKIP) return t.skip(SKIP);
  const r = run({ bin: false, onPath: false });
  assert.ifError(r.error);
  assert.strictEqual(r.ran, null, `the excluded binary must not run; marker:\n${r.ran}`);
  assert.notStrictEqual(r.status, 0, "the offline download fails, so the launcher exits non-zero");
  assert.ok(
    r.stderr.includes(`could not download engine ${fx.version} from file:///nonexistent/engine-v${fx.version}/`),
    `the launcher reached its download block; stderr:\n${r.stderr}`,
  );
  assert.ok(fs.existsSync(path.join(fx.H, "bin", fx.version)), "the download staged under IMPECCABLE_HOME/bin/<VERSION>/");
  assert.deepStrictEqual(fs.readdirSync(path.join(fx.H, "bin", fx.version)), [], "no partial file left behind");
});
