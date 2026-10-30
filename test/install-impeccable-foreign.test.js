"use strict";

// @akili-spec changes/impeccable-hardening T2b
//
// FR-3 (amended, Pivot P-7 Option A): on a target with no ownership record, an
// existing `impeccable/` is AKILI's only when it holds UPSTREAM.md; otherwise it
// is foreign -- skipped whole and reported with its version -- and replaced only
// by `install --force`, whole (moved aside, copied, aside copy deleted).
// Every test drives the real CLI as a subprocess on Claude Code `--local`, with
// HOME and cwd pinned to a scratch directory.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const AKILI_BIN = path.join(__dirname, "..", "bin", "akili.js");
const SOURCE_SKILLS = path.join(__dirname, "..", ".claude", "skills");
const VENDORED = path.join(SOURCE_SKILLS, "impeccable");

function stripAnsi(text) {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

function mkHome(t) {
  const home = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "akili-imp-foreign-")));
  t.after(() => fs.rmSync(home, { recursive: true, force: true }));
  return home;
}

function install(home, extra) {
  const r = spawnSync(process.execPath, [AKILI_BIN, "install", "--tool", "claude", "--local", ...extra], {
    cwd: home,
    encoding: "utf8",
    env: Object.assign({}, process.env, { HOME: home, USERPROFILE: home }),
  });
  return { status: r.status, out: stripAnsi((r.stdout || "") + (r.stderr || "")) };
}

// Relative path -> bytes (hex) for every file under dir.
function snapshot(dir) {
  const out = {};
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full);
      else out[path.relative(dir, full).split(path.sep).join("/")] = fs.readFileSync(full).toString("hex");
    }
  })(dir);
  return out;
}

function seedForeign(home, withUpstream) {
  const dir = path.join(home, ".claude", "skills", "impeccable");
  fs.mkdirSync(path.join(dir, "reference"), { recursive: true });
  fs.writeFileSync(
    path.join(dir, "SKILL.md"),
    "---\nname: impeccable\nversion: 4.9.0\n---\nmine\n"
  );
  fs.writeFileSync(path.join(dir, "my-notes.txt"), "developer-only\n");
  fs.writeFileSync(path.join(dir, "reference", "mine.md"), "x\n");
  if (withUpstream) fs.writeFileSync(path.join(dir, "UPSTREAM.md"), "akili copy\n");
  return dir;
}

test("@akili-spec changes/impeccable-hardening FR-3 (foreign, no --force): the developer's impeccable/ is left byte-identical and reported with its version", (t) => {
  const home = mkHome(t);
  const dir = seedForeign(home, false);
  const before = snapshot(dir);

  const run = install(home, []);

  assert.equal(run.status, 0, run.out);
  assert.match(run.out, /skip foreign .*impeccable 4\.9\.0/, "THEN the output names the foreign folder with its version");
  assert.deepEqual(snapshot(dir), before, "AND no file was changed, added or removed in the foreign folder");
  assert.deepEqual(
    fs.readdirSync(path.join(home, ".claude", "skills")).filter((n) => n.startsWith(".")),
    [],
    "AND no takeover leftovers sit in the skills root"
  );
});

test("@akili-spec changes/impeccable-hardening FR-3 (foreign, --force): the folder is replaced whole by the vendored tree with no developer-only file left", (t) => {
  const home = mkHome(t);
  const dir = seedForeign(home, false);

  const run = install(home, ["--force"]);

  assert.equal(run.status, 0, run.out);
  assert.match(run.out, /replace foreign .*impeccable/, "THEN the output reports the takeover");
  assert.deepEqual(snapshot(dir), snapshot(VENDORED), "AND the folder equals the vendored tree exactly");
  assert.equal(fs.existsSync(path.join(dir, "my-notes.txt")), false, "AND the developer-only file is gone");
  assert.equal(
    fs.existsSync(path.join(home, ".claude", ".akili-takeover")),
    false,
    "AND the moved-aside copy was deleted"
  );
});

test("@akili-spec changes/impeccable-hardening FR-3 (AKILI copy): an impeccable/ holding UPSTREAM.md keeps today's skip existing", (t) => {
  const home = mkHome(t);
  const dir = seedForeign(home, true);
  const before = snapshot(dir);

  const run = install(home, []);

  assert.equal(run.status, 0, run.out);
  assert.match(run.out, /skip existing .*impeccable/, "THEN the existing rule reports skip existing");
  assert.doesNotMatch(run.out, /skip foreign .*impeccable/, "BUT it is not reported as foreign");
  assert.deepEqual(snapshot(dir), before, "AND the folder is unchanged");
});

test("@akili-spec changes/impeccable-hardening FR-3 (other skills): another skill's existing folder keeps today's behavior", (t) => {
  const home = mkHome(t);
  const other = path.join(home, ".claude", "skills", "tdd");
  fs.mkdirSync(other, { recursive: true });
  fs.writeFileSync(path.join(other, "SKILL.md"), "user tdd\n");
  fs.writeFileSync(path.join(other, "extra.txt"), "keep\n");

  const plain = install(home, []);
  assert.equal(plain.status, 0, plain.out);
  assert.match(plain.out, /skip existing .*[\\/]tdd/, "THEN a plain install reports skip existing");
  assert.doesNotMatch(plain.out, /skip foreign/, "BUT nothing is reported as foreign");
  assert.equal(fs.readFileSync(path.join(other, "SKILL.md"), "utf8"), "user tdd\n", "AND the file is untouched");

  const forced = install(home, ["--force"]);
  assert.equal(forced.status, 0, forced.out);
  assert.match(forced.out, /overwrite .*[\\/]tdd/, "THEN --force overwrites as before");
  assert.doesNotMatch(forced.out, /replace foreign .*[\\/]tdd/, "BUT not as a takeover");
  assert.equal(
    fs.readFileSync(path.join(other, "extra.txt"), "utf8"),
    "keep\n",
    "AND the overwrite merges as before (extra file kept)"
  );
});

test("@akili-spec changes/impeccable-hardening FR-3 (dry run): writes nothing and reports the same decisions", (t) => {
  const home = mkHome(t);
  const dir = seedForeign(home, false);
  const before = snapshot(dir);

  const skip = install(home, ["--dry-run"]);
  assert.match(skip.out, /skip foreign .*impeccable 4\.9\.0/);
  const take = install(home, ["--dry-run", "--force"]);
  assert.match(take.out, /would replace foreign .*impeccable/);
  assert.deepEqual(snapshot(dir), before, "AND the dry runs changed nothing");
  assert.equal(fs.existsSync(path.join(home, ".claude", ".akili-takeover")), false);
});
