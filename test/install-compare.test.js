"use strict";
// @akili-spec changes/impeccable-audit-fixes/install-stale-skills
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { compareEntry, formatDiffers } = require("../bin/install-compare.js");

function scratch(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "akili-cmp-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}
function put(root, rel, content) {
  const p = path.join(root, ...rel.split("/"));
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
  return p;
}
function trySymlink(t, target, link, type) {
  try {
    fs.symlinkSync(target, link, type);
    return true;
  } catch (err) {
    t.skip(`symlinks cannot be created here (${err.code})`);
    return false;
  }
}

test("file identical", (t) => {
  const d = scratch(t);
  const s = put(d, "src/a.md", "hello\n");
  const g = put(d, "dst/a.md", "hello\n");
  assert.deepEqual(compareEntry(s, g), { state: "identical", differing: [] });
});

test("file differs by one byte, named by base name", (t) => {
  const d = scratch(t);
  const s = put(d, "src/a.md", "hello\n");
  const g = put(d, "dst/a.md", "hellp\n");
  assert.deepEqual(compareEntry(s, g), { state: "differs", differing: ["a.md"] });
});

test("file source, target is a directory", (t) => {
  const d = scratch(t);
  const s = put(d, "src/a.md", "x");
  const g = path.join(d, "dst", "a.md");
  fs.mkdirSync(g, { recursive: true });
  assert.deepEqual(compareEntry(s, g), { state: "differs", differing: ["a.md"] });
});

test("file source, target is a symlink to equal bytes", (t) => {
  const d = scratch(t);
  const s = put(d, "src/a.md", "x");
  const real = put(d, "real/a.md", "x");
  fs.mkdirSync(path.join(d, "dst"));
  const g = path.join(d, "dst", "a.md");
  if (!trySymlink(t, real, g)) return;
  assert.deepEqual(compareEntry(s, g), { state: "differs", differing: ["a.md"] });
});

test("CRLF versus LF reads differs", (t) => {
  const d = scratch(t);
  const s = put(d, "src/a.md", "one\ntwo\n");
  const g = put(d, "dst/a.md", "one\r\ntwo\r\n");
  assert.equal(compareEntry(s, g).state, "differs");
});

test("directory identical", (t) => {
  const d = scratch(t);
  put(d, "src/sk/SKILL.md", "a");
  put(d, "src/sk/refs/x.md", "b");
  put(d, "dst/sk/SKILL.md", "a");
  put(d, "dst/sk/refs/x.md", "b");
  assert.deepEqual(compareEntry(path.join(d, "src/sk"), path.join(d, "dst/sk")), {
    state: "identical",
    differing: [],
  });
});

test("directory with one differing nested file names it with slashes", (t) => {
  const d = scratch(t);
  put(d, "src/sk/SKILL.md", "a");
  put(d, "src/sk/refs/x.md", "b");
  put(d, "dst/sk/SKILL.md", "a");
  put(d, "dst/sk/refs/x.md", "B");
  assert.deepEqual(compareEntry(path.join(d, "src/sk"), path.join(d, "dst/sk")), {
    state: "differs",
    differing: ["refs/x.md"],
  });
});

test("directory missing a package file", (t) => {
  const d = scratch(t);
  put(d, "src/sk/SKILL.md", "a");
  put(d, "src/sk/more.md", "b");
  put(d, "dst/sk/SKILL.md", "a");
  assert.deepEqual(compareEntry(path.join(d, "src/sk"), path.join(d, "dst/sk")), {
    state: "differs",
    differing: ["more.md"],
  });
});

test("extra target files never make a directory differ", (t) => {
  const d = scratch(t);
  put(d, "src/sk/SKILL.md", "a");
  put(d, "dst/sk/SKILL.md", "a");
  put(d, "dst/sk/notes.txt", "mine");
  put(d, "dst/sk/deep/extra.txt", "mine");
  assert.deepEqual(compareEntry(path.join(d, "src/sk"), path.join(d, "dst/sk")), {
    state: "identical",
    differing: [],
  });
});

test("directory source, target is a file", (t) => {
  const d = scratch(t);
  put(d, "src/sk/SKILL.md", "a");
  put(d, "dst/sk", "i am a file");
  assert.deepEqual(compareEntry(path.join(d, "src/sk"), path.join(d, "dst/sk")), {
    state: "differs",
    differing: ["sk"],
  });
});

test("directory source, target is a symlink to an identical directory", (t) => {
  const d = scratch(t);
  put(d, "src/sk/SKILL.md", "a");
  put(d, "real/sk/SKILL.md", "a");
  fs.mkdirSync(path.join(d, "dst"));
  const g = path.join(d, "dst", "sk");
  if (!trySymlink(t, path.join(d, "real/sk"), g, "dir")) return;
  assert.deepEqual(compareEntry(path.join(d, "src/sk"), g), {
    state: "differs",
    differing: ["sk"],
  });
});

test("differing paths come out sorted", (t) => {
  const d = scratch(t);
  for (const n of ["z.md", "a.md", "m/b.md"]) put(d, `src/sk/${n}`, "1");
  for (const n of ["z.md", "a.md", "m/b.md"]) put(d, `dst/sk/${n}`, "2");
  assert.deepEqual(compareEntry(path.join(d, "src/sk"), path.join(d, "dst/sk")).differing, [
    "a.md",
    "m/b.md",
    "z.md",
  ]);
});

test("formatDiffers caps at 5 names", () => {
  assert.equal(formatDiffers(["a", "b", "c"]), "a, b, c");
  assert.equal(formatDiffers(["a", "b", "c", "d", "e"]), "a, b, c, d, e");
  assert.equal(
    formatDiffers(["a", "b", "c", "d", "e", "f", "g", "h"]),
    "a, b, c, d, e, +3 more"
  );
});

test("a source-side missing path throws", (t) => {
  const d = scratch(t);
  const g = put(d, "dst/a.md", "x");
  assert.throws(() => compareEntry(path.join(d, "src/missing.md"), g));
});
