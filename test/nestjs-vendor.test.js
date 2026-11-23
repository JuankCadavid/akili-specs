"use strict";

// @akili-spec changes/nestjs-official-skills (T2)
//
// Vendor lock for the six verbatim official NestJS skill folders (FR-1, FR-2
// "Local edit creeps in", NFR-1, NFR-3). Everything is read from the shipped
// files, never from docs/specs/. Hashes are computed over RAW bytes and come
// from each folder's UPSTREAM.md, never from the vendored file itself: for
// SKILL.md the AKILI `metadata:` block is removed first, so the comparison is
// against the upstream bytes recorded at vendoring time.

const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.join(__dirname, "..");
const SKILLS = path.join(REPO_ROOT, ".claude", "skills");
const NAMES = ["nestjs", "nestjs-feature", "nestjs-auth", "nestjs-data", "nestjs-testing", "nestjs-production"];
const PROVENANCE = ["UPSTREAM.md", "LICENSE", "NOTICE"];
const FORBIDDEN = ["bin", "index.js", "index.d.ts", "package.json", "scripts", "test", ".claude-plugin"];

function sha256(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function walk(dir, base = dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, base));
    else out.push(path.relative(base, full).split(path.sep).join("/"));
  }
  return out.sort();
}

function folder(name) {
  return path.join(SKILLS, name);
}

function upstreamEntries(name) {
  const text = fs.readFileSync(path.join(folder(name), "UPSTREAM.md"), "utf8");
  const m = /```text\r?\n([\s\S]*?)```/.exec(text);
  assert.notEqual(m, null, `${name}/UPSTREAM.md has no \`\`\`text checksum block`);
  return m[1]
    .split(/\r?\n/)
    .filter((l) => l.trim() !== "")
    .map((l) => {
      const p = /^([0-9a-f]{64})  (.+)$/.exec(l);
      assert.notEqual(p, null, `${name}/UPSTREAM.md: malformed checksum line: ${l}`);
      return { hash: p[1], file: p[2] };
    });
}

// SKILL.md bytes with the AKILI `metadata:` block removed: from the `metadata:`
// line up to (not including) the closing frontmatter fence.
function skillWithoutMetadata(name) {
  const text = fs.readFileSync(path.join(folder(name), "SKILL.md"), "utf8");
  const lines = text.split("\n");
  const start = lines.findIndex((l) => l === "metadata:");
  assert.notEqual(start, -1, `${name}/SKILL.md frontmatter has no metadata: block`);
  let end = -1;
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i] === "---") {
      end = i;
      break;
    }
  }
  assert.notEqual(end, -1, `${name}/SKILL.md has no closing frontmatter fence after metadata:`);
  return Buffer.from(lines.slice(0, start).concat(lines.slice(end)).join("\n"), "utf8");
}

function frontmatter(name) {
  const text = fs.readFileSync(path.join(folder(name), "SKILL.md"), "utf8");
  const m = /^---\n([\s\S]*?)\n---\n/.exec(text);
  assert.notEqual(m, null, `${name}/SKILL.md has no frontmatter`);
  return m[1].split("\n");
}

function topKeys(name) {
  return frontmatter(name)
    .filter((l) => /^[A-Za-z][\w-]*:/.test(l))
    .map((l) => l.split(":")[0]);
}

test("@akili-spec changes/nestjs-official-skills FR-1 every UPSTREAM.md line matches its file's raw bytes, per folder", () => {
  for (const name of NAMES) {
    const entries = upstreamEntries(name);
    assert.ok(entries.length > 0, `${name}/UPSTREAM.md lists no files`);
    for (const { hash, file } of entries) {
      const bytes = file === "SKILL.md" ? skillWithoutMetadata(name) : fs.readFileSync(path.join(folder(name), ...file.split("/")));
      assert.equal(sha256(bytes), hash, `hash mismatch for ${name}/${file}`);
    }
  }
});

test("@akili-spec changes/nestjs-official-skills FR-2 no file is unlisted except the 3 provenance files (local edit creeps in)", () => {
  for (const name of NAMES) {
    const listed = new Set(upstreamEntries(name).map((e) => e.file));
    const unlisted = walk(folder(name)).filter((f) => !listed.has(f) && !PROVENANCE.includes(f));
    assert.deepEqual(unlisted, [], `${name}: files not in UPSTREAM.md: ${unlisted.join(", ")}`);
    for (const p of PROVENANCE) assert.ok(fs.existsSync(path.join(folder(name), p)), `${name} is missing ${p}`);
  }
});

test("@akili-spec changes/nestjs-official-skills FR-1 16 upstream files are listed across the six folders", () => {
  const total = NAMES.reduce((n, name) => n + upstreamEntries(name).length, 0);
  assert.equal(total, 16);
  const onDisk = NAMES.reduce((n, name) => n + walk(folder(name)).length, 0);
  assert.equal(onDisk, 16 + 3 * NAMES.length);
});

test("@akili-spec changes/nestjs-official-skills FR-1 no upstream tooling is vendored", () => {
  for (const name of NAMES) {
    for (const f of FORBIDDEN) assert.equal(fs.existsSync(path.join(folder(name), f)), false, `${name}/${f} exists`);
  }
});

test("@akili-spec changes/nestjs-official-skills NFR-1 each LICENSE is the upstream MIT text", () => {
  for (const name of NAMES) {
    const license = fs.readFileSync(path.join(folder(name), "LICENSE"), "utf8");
    assert.ok(license.startsWith("(The MIT License)"), `${name}/LICENSE does not begin "(The MIT License)"`);
  }
});

test("@akili-spec changes/nestjs-official-skills NFR-1 each NOTICE names the pinned commit and states non-affiliation", () => {
  for (const name of NAMES) {
    const upstream = fs.readFileSync(path.join(folder(name), "UPSTREAM.md"), "utf8");
    const commit = /\| Commit \| ([0-9a-f]{40}) \|/.exec(upstream);
    assert.notEqual(commit, null, `${name}/UPSTREAM.md has no 40-hex Commit row`);
    const notice = fs.readFileSync(path.join(folder(name), "NOTICE"), "utf8");
    assert.ok(notice.includes(commit[1]), `${name}/NOTICE does not name ${commit[1]}`);
    assert.ok(notice.includes("AKILI-SPECS is not affiliated with the NestJS project."), `${name}/NOTICE lacks the non-affiliation line`);
  }
});

test("@akili-spec changes/nestjs-official-skills FR-1 frontmatter keys are the upstream keys plus metadata, with the AKILI block", () => {
  for (const name of NAMES) {
    const upstream = ["name", "description", "license"].concat(name === "nestjs" ? ["compatibility"] : []);
    assert.deepEqual(topKeys(name), [...upstream, "metadata"], `${name} frontmatter keys`);
    const fm = frontmatter(name);
    assert.ok(fm.includes("  binding: stack"), `${name}: no '  binding: stack'`);
    assert.ok(fm.includes("  author: Kamil Mysliwiec (NestJS)"), `${name}: author line`);
    assert.ok(fm.includes("  adapted-by: Juan Carlos Cadavid — jcadavid.com"), `${name}: adapted-by line`);
  }
});

test("@akili-spec changes/nestjs-official-skills NFR-3 .gitattributes declares the six trees -text", () => {
  const attrs = fs.readFileSync(path.join(REPO_ROOT, ".gitattributes"), "utf8").split(/\r?\n/);
  for (const name of NAMES) {
    assert.ok(attrs.includes(`.claude/skills/${name}/** -text`), `.gitattributes has no '-text' line for ${name}`);
  }
});
