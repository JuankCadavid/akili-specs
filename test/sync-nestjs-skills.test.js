"use strict";

// @akili-spec changes/nestjs-official-skills (T1)
//
// Locks scripts/sync-nestjs-skills.js (FR-2, NFR-2, design 7.1). Every test
// builds a throwaway git repo shaped like upstream (root LICENSE and
// package.json, skills/<six names>/) and a throwaway AKILI root; nothing here
// touches the real .claude/skills/ or the network. The script is pointed at
// the throwaway root through NESTJS_SYNC_ROOT, and its 6(b) rename fault is
// injected through NESTJS_SYNC_FAIL_RENAME_AT (test-only seams).

const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const SCRIPT = path.join(__dirname, "..", "scripts", "sync-nestjs-skills.js");
const NAMES = ["nestjs", "nestjs-feature", "nestjs-auth", "nestjs-data", "nestjs-testing", "nestjs-production"];
const SHASUM = "8c70e8b504866f6f7530b515da2c9cad6615f744";
const LICENSE_TEXT = "(The MIT License)\n\nCopyright (c) 2025 Kamil Mysliwiec\n\nPermission is hereby granted.\n";

function sha256(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function mkdtemp(label) {
  return fs.mkdtempSync(path.join(os.tmpdir(), `sync-nestjs-${label}-`));
}

function git(cwd, ...args) {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  assert.equal(r.status, 0, `git ${args.join(" ")} failed: ${r.stderr}`);
  return r.stdout.trim();
}

function skillMd(name, body, extraFront = "") {
  const compat = name === "nestjs" ? "compatibility: Node 20\n" : "";
  return `---\nname: ${name}\ndescription: ${name} skill\nlicense: MIT\n${compat}${extraFront}---\n${body}\n`;
}

// Builds an upstream repo with one commit. `variant` changes file bytes so a
// second commit differs from the first.
function makeUpstream(dir, { variant = "one", omit = [], extraFront = {}, version = "0.1.1" } = {}) {
  fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(path.join(dir, ".git"))) {
    git(dir, "init", "-q");
    git(dir, "config", "user.email", "t@example.com");
    git(dir, "config", "user.name", "t");
    git(dir, "config", "core.autocrlf", "false");
    fs.writeFileSync(path.join(dir, ".gitignore"), "*.log\n");
  }
  fs.writeFileSync(path.join(dir, "LICENSE"), LICENSE_TEXT);
  fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({ name: "@nestjs/skills", version }) + "\n");
  fs.rmSync(path.join(dir, "skills"), { recursive: true, force: true });
  for (const name of NAMES) {
    if (omit.includes(name)) continue;
    const base = path.join(dir, "skills", name);
    fs.mkdirSync(path.join(base, "references"), { recursive: true });
    fs.writeFileSync(path.join(base, "SKILL.md"), skillMd(name, `body ${name} ${variant}`, extraFront[name] || ""));
    fs.writeFileSync(path.join(base, "references", "a.md"), `ref a ${name} ${variant}\nline2\n`);
  }
  git(dir, "add", "-A");
  git(dir, "commit", "-q", "-m", `commit ${variant}`);
  return git(dir, "rev-parse", "HEAD");
}

function run(args, root, env = {}) {
  return spawnSync(process.execPath, [SCRIPT, ...args], {
    encoding: "utf8",
    env: { ...process.env, NESTJS_SYNC_ROOT: root, ...env },
  });
}

function goodArgs(from, commit) {
  return ["--from", from, "--commit", commit, "--npm-shasum", SHASUM];
}

function listTree(dir, base = dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) listTree(full, base, out);
    else out.push(path.relative(base, full).split(path.sep).join("/"));
  }
  return out.sort();
}

// Byte snapshot of the six target folders: absent folder -> absent key.
function snapshot(root) {
  const snap = {};
  for (const name of NAMES) {
    const base = path.join(root, ".claude", "skills", name);
    for (const rel of listTree(base)) snap[`${name}/${rel}`] = sha256(fs.readFileSync(path.join(base, rel)));
  }
  return snap;
}

function seed(label, opts) {
  const up = mkdtemp(`${label}-up`);
  const root = mkdtemp(`${label}-root`);
  const sha = makeUpstream(up, opts);
  return { up, root, sha };
}

// Root with the six folders already at the "one" pin, plus a second upstream commit.
function pinnedRoot(label) {
  const { up, root, sha } = seed(label);
  const r = run(goodArgs(up, sha), root);
  assert.equal(r.status, 0, `seeding sync failed: ${r.stderr}`);
  const sha2 = makeUpstream(up, { variant: "two" });
  return { up, root, sha, sha2, old: snapshot(root) };
}

function assertRefused(r, pattern, root, before) {
  assert.notEqual(r.status, 0, `expected non-zero exit; stdout: ${r.stdout}`);
  assert.match(r.stderr, /^sync-nestjs-skills: /m, `refusal must come from the script; stderr: ${r.stderr}`);
  assert.match(r.stderr, pattern);
  assert.deepEqual(snapshot(root), before, "the six target folders must be byte-unchanged");
  assert.equal(fs.existsSync(path.join(root, ".nestjs-sync")), false, "no .nestjs-sync/ may be left behind");
}

test("refuses missing arguments", () => {
  const { up, root, sha2, old } = pinnedRoot("args");
  assertRefused(run(["--commit", sha2, "--npm-shasum", SHASUM], root), /--from/, root, old);
  assertRefused(run(["--from", up, "--npm-shasum", SHASUM], root), /--commit/, root, old);
  assertRefused(run(["--from", up, "--commit", sha2], root), /--npm-shasum/, root, old);
});

test("refuses a shasum that is not 40 lowercase hex", () => {
  const { up, root, sha2, old } = pinnedRoot("shasum");
  for (const bad of ["abc123", SHASUM.toUpperCase(), SHASUM + "0"]) {
    assertRefused(run(["--from", up, "--commit", sha2, "--npm-shasum", bad], root), /npm-shasum/, root, old);
  }
});

test("refuses a dirty upstream checkout and writes nothing", () => {
  const { up, root, sha2, old } = pinnedRoot("dirty");
  fs.appendFileSync(path.join(up, "skills", "nestjs", "SKILL.md"), "uncommitted\n");
  assertRefused(run(goodArgs(up, sha2), root), /dirty/, root, old);
});

test("refuses ignored content under skills/", () => {
  const { up, root, sha2, old } = pinnedRoot("ignored");
  fs.writeFileSync(path.join(up, "skills", "nestjs-auth", "debug.log"), "x\n");
  assertRefused(run(goodArgs(up, sha2), root), /dirty|ignored/, root, old);
});

test("refuses a commit that is not the checked-out HEAD", () => {
  const { up, root, sha, old } = pinnedRoot("head");
  assertRefused(run(goodArgs(up, sha), root), /HEAD/, root, old);
});

test("refuses when one folder of the official set is missing upstream", () => {
  const { up, root, old } = pinnedRoot("missing");
  const sha3 = makeUpstream(up, { variant: "three", omit: ["nestjs-data"] });
  assertRefused(run(goodArgs(up, sha3), root), /nestjs-data/, root, old);
});

test("refuses an upstream SKILL.md that already has a metadata key", () => {
  const { up, root, old } = pinnedRoot("metadata");
  const sha3 = makeUpstream(up, { variant: "three", extraFront: { "nestjs-testing": "metadata:\n  author: x\n" } });
  assertRefused(run(goodArgs(up, sha3), root), /metadata/, root, old);
});

test("refuses a leftover .nestjs-sync/ and leaves it alone", () => {
  const { up, root, sha2, old } = pinnedRoot("leftover");
  fs.mkdirSync(path.join(root, ".nestjs-sync"));
  const r = run(goodArgs(up, sha2), root);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /^sync-nestjs-skills: /m);
  assert.match(r.stderr, /\.nestjs-sync/);
  assert.deepEqual(snapshot(root), old);
  assert.equal(fs.existsSync(path.join(root, ".nestjs-sync")), true, "a leftover is named, never deleted");
});

test("success: hashes equal git-object bytes, the shasum argument is recorded, provenance is written", () => {
  const { up, root, sha } = seed("ok");
  const r = run(goodArgs(up, sha), root);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(fs.existsSync(path.join(root, ".nestjs-sync")), false);
  let upstreamFiles = 0;
  for (const name of NAMES) {
    const dir = path.join(root, ".claude", "skills", name);
    const listed = git(up, "ls-tree", "-r", "--name-only", sha, "--", `skills/${name}/`).split("\n");
    const upstreamMd = fs.readFileSync(path.join(dir, "UPSTREAM.md"), "utf8");
    assert.ok(upstreamMd.includes(`| npm shasum | ${SHASUM} |`), `${name}: shasum row`);
    assert.ok(upstreamMd.includes(`| Commit | ${sha} |`), `${name}: commit row`);
    assert.ok(upstreamMd.includes("| Tag | v0.1.1 |"), `${name}: tag row`);
    assert.ok(upstreamMd.includes("| npm version | 0.1.1 |"), `${name}: npm version row`);
    assert.ok(upstreamMd.includes("## Modification") && upstreamMd.includes("## Checksums"));
    const lines = upstreamMd.match(/^[0-9a-f]{64} {2}\S.*$/gm) || [];
    assert.equal(lines.length, listed.length, `${name}: one checksum line per upstream file`);
    for (const full of listed) {
      const rel = full.slice(`skills/${name}/`.length);
      const blob = spawnSync("git", ["show", `${sha}:${full}`], { cwd: up }).stdout;
      assert.ok(lines.includes(`${sha256(blob)}  ${rel}`), `${name}/${rel}: hash line equals git blob hash`);
      const shipped = fs.readFileSync(path.join(dir, rel));
      if (rel === "SKILL.md") {
        const text = shipped.toString("utf8");
        const metaStart = text.indexOf("metadata:\n");
        const end = text.indexOf("\n---\n", 3) + 1;
        const block = text.slice(metaStart, end);
        assert.match(block, /author: Kamil Mysliwiec \(NestJS\)/);
        assert.match(block, /source: https:\/\/github\.com\/nestjs\/agent-skills \(\w{7}, v0\.1\.1\)/);
        assert.match(block, /adapted-for: AKILI-SPECS/);
        assert.match(block, /binding: stack/);
        assert.ok(metaStart > text.indexOf("license: MIT"), "metadata is the last key");
        assert.ok(block.endsWith("\n") && text.slice(end).startsWith("---\n"), "inserted before the closing fence");
        const restored = Buffer.from(text.slice(0, metaStart) + text.slice(end), "utf8");
        assert.deepEqual(restored, blob, "removing the block restores the upstream bytes");
      } else {
        assert.deepEqual(shipped, blob, `${name}/${rel} is byte-identical to upstream`);
      }
    }
    upstreamFiles += listed.length;
    const onDisk = listTree(dir);
    assert.deepEqual(
      onDisk,
      [...listed.map((f) => f.slice(`skills/${name}/`.length)), "LICENSE", "NOTICE", "UPSTREAM.md"].sort(),
      `${name}: upstream files plus exactly three provenance files`
    );
    assert.deepEqual(fs.readFileSync(path.join(dir, "LICENSE")), Buffer.from(LICENSE_TEXT));
    const notice = fs.readFileSync(path.join(dir, "NOTICE"), "utf8");
    assert.ok(notice.includes("https://github.com/nestjs/agent-skills") && notice.includes(sha) && notice.includes("v0.1.1"));
    assert.ok(notice.includes("Copyright (c) 2025 Kamil Mysliwiec"));
    assert.match(notice, /not affiliated with the NestJS project/);
  }
  assert.equal(upstreamFiles, 12);
  assert.match(r.stdout, /SKILL_FILE_EXPECTED/, "reminder lists the files to update by hand");
});

test("second sync prints the per-file diff summary against the current pin", () => {
  const { up, root, sha2 } = pinnedRoot("diff");
  const r = run(goodArgs(up, sha2), root);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /nestjs-feature: .*changed: .*references\/a\.md/s);
  assert.match(r.stdout, /nestjs-feature: .*changed: .*SKILL\.md/s);
});

test("Observe text changes are printed first", () => {
  const { up, root } = pinnedRoot("observe");
  const body = fs.readFileSync(path.join(up, "skills", "nestjs-auth", "references", "a.md"), "utf8");
  fs.writeFileSync(path.join(up, "skills", "nestjs-auth", "references", "a.md"), body + "Observe the output first.\n");
  git(up, "add", "-A");
  git(up, "commit", "-q", "-m", "observe");
  const sha3 = git(up, "rev-parse", "HEAD");
  const r = run(goodArgs(up, sha3), root);
  assert.equal(r.status, 0, r.stderr);
  const first = r.stdout.split("\n").findIndex((l) => /observe/i.test(l) && l.includes("nestjs-auth/references/a.md"));
  const summary = r.stdout.split("\n").findIndex((l) => /^nestjs-auth: /.test(l));
  assert.ok(first >= 0 && first < summary, "an OBSERVE line precedes the per-folder summary");
});

test("rollback: a rename failure on the 4th folder leaves all six at the old pin", () => {
  const { up, root, sha2, old } = pinnedRoot("rollback");
  const r = run(goodArgs(up, sha2), root, { NESTJS_SYNC_FAIL_RENAME_AT: "4" });
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /^sync-nestjs-skills: /m);
  assert.match(r.stderr, /injected rename failure/);
  assert.match(r.stderr, /rolled back: removed 3 new folder\(s\), restored 6 old folder\(s\)/, "failure hit 6(b) after three folders moved");
  assert.deepEqual(snapshot(root), old, "all six folders are at the old pin, byte for byte");
  assert.equal(fs.existsSync(path.join(root, ".nestjs-sync")), false, ".nestjs-sync/ removed after rollback");
});

test("rollback on a first run: no current folders, a failure leaves none", () => {
  const { up, root, sha } = seed("first");
  const r = run(goodArgs(up, sha), root, { NESTJS_SYNC_FAIL_RENAME_AT: "4" });
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /rolled back: removed 3 new folder\(s\), restored 0 old folder\(s\)/);
  assert.deepEqual(snapshot(root), {});
  for (const name of NAMES) assert.equal(fs.existsSync(path.join(root, ".claude", "skills", name)), false, name);
  assert.equal(fs.existsSync(path.join(root, ".nestjs-sync")), false);
});

test("bytes come from git objects: autocrlf=true with CRLF in the working tree still hashes the LF blob", () => {
  const { up, root, sha } = seed("crlf");
  git(up, "config", "core.autocrlf", "true");
  fs.rmSync(path.join(up, "skills", "nestjs", "references", "a.md"));
  git(up, "checkout", "--", "skills/nestjs/references/a.md");
  const wt = fs.readFileSync(path.join(up, "skills", "nestjs", "references", "a.md"));
  assert.ok(wt.includes("\r\n"), "precondition: the working tree copy has CRLF");
  assert.equal(git(up, "status", "--porcelain"), "", "precondition: checkout is clean");
  const r = run(goodArgs(up, sha), root);
  assert.equal(r.status, 0, r.stderr);
  const lf = Buffer.from("ref a nestjs one\nline2\n");
  const shipped = fs.readFileSync(path.join(root, ".claude", "skills", "nestjs", "references", "a.md"));
  assert.deepEqual(shipped, lf);
  const md = fs.readFileSync(path.join(root, ".claude", "skills", "nestjs", "UPSTREAM.md"), "utf8");
  assert.ok(md.includes(`${sha256(lf)}  references/a.md`));
});

test("package.json files does not ship the sync script (P-6)", () => {
  const files = require("../package.json").files;
  assert.ok(!files.some((f) => f.includes("sync-nestjs-skills")), JSON.stringify(files));
});
