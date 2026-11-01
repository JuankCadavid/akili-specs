"use strict";

// @akili-spec changes/go-backend-routing/golang-skill
//
// T4 -- hash lock and wiring contract for the vendored `golang-pro` skill
// (FR-2, FR-3, FR-4, NFR-1, NFR-2; design DD-2, DD-3). Hashes are computed over
// RAW bytes (fs.readFileSync with no encoding): git blob SHA-1 of
// `blob <len>\0<bytes>`, no line-ending normalization, no git subprocess.

const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SKILL = path.join(ROOT, ".claude", "skills", "golang-pro");
const PIN = "078a25cc5bfd8011459be7b91d004e900c1d02d3";

const SHAS = {
  "references/concurrency.md": "d14ef44263c7b76460150b65df980ace9c60dbb0",
  "references/generics.md": "4e6165937bbca2782a1b98bb346f176706fb2a18",
  "references/interfaces.md": "41856f9cacc67e1648925e8cb6b75fc49ef3c41a",
  "references/project-structure.md": "eb599b949a04b640100614d84ce123efafffcdb5",
  "references/testing.md": "3696a2ceab70841b17a3f836f2404c204166d3e5",
  LICENSE: "b77bf2ab726c6e7cb5a81a9d3b7dc38266ebfd3d",
};
const SKILL_MD_SHA = "99ef50f7eba4c884af255a061143bbcf3c7f65e7";

function blobSha(buf) {
  return crypto
    .createHash("sha1")
    .update(Buffer.concat([Buffer.from(`blob ${buf.length}\0`), buf]))
    .digest("hex");
}
const raw = (rel) => fs.readFileSync(path.join(SKILL, rel));
const repo = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

// Text of a section: from `startRe` match to the next line matching `endRe`.
function section(text, startRe, endRe) {
  const lines = text.split("\n");
  const start = lines.findIndex((l) => startRe.test(l));
  assert.ok(start >= 0, `section start not found: ${startRe}`);
  let end = -1;
  for (let i = start + 1; i < lines.length; i++) {
    if (endRe.test(lines[i])) { end = i; break; }
  }
  assert.ok(end >= 0, `section end not found: ${endRe}`);
  return lines.slice(start, end).join("\n");
}

const ADDED_RE = [
  /^ {2}source: https:\/\/github\.com\/Jeffallan\S*$/,
  /^ {2}adapted-by: .+$/,
  /^ {2}adapted-for: .+$/,
  /^ {2}binding: stack$/,
];

function skillLines() {
  return raw("SKILL.md").toString("utf8").split("\n");
}

test("@akili-spec changes/go-backend-routing/golang-skill FR-2: folder holds exactly 8 files", () => {
  assert.ok(fs.existsSync(SKILL), "golang-pro folder is missing");
  const files = walk(SKILL).map((p) => path.relative(SKILL, p).split(path.sep).join("/")).sort();
  assert.deepEqual(files, [
    "LICENSE",
    "NOTICE",
    "SKILL.md",
    "references/concurrency.md",
    "references/generics.md",
    "references/interfaces.md",
    "references/project-structure.md",
    "references/testing.md",
  ]);
});

for (const [rel, sha] of Object.entries(SHAS)) {
  test(`@akili-spec changes/go-backend-routing/golang-skill FR-2: ${rel} equals its pinned blob SHA`, () => {
    assert.equal(blobSha(raw(rel)), sha);
  });
}

test("@akili-spec changes/go-backend-routing/golang-skill FR-2 DD-3: the four added lines follow related-skills and nothing else changed", () => {
  const lines = skillLines();
  const at = lines.findIndex((l) => /^ {2}related-skills:/.test(l));
  assert.ok(at >= 0, "related-skills line not found");
  ADDED_RE.forEach((re, i) => {
    assert.match(lines[at + 1 + i], re, `added line ${i + 1} wrong or out of order`);
  });
  const stripped = lines.filter((_, i) => i < at + 1 || i > at + 4).join("\n");
  assert.equal(blobSha(Buffer.from(stripped, "utf8")), SKILL_MD_SHA);
});

test("@akili-spec changes/go-backend-routing/golang-skill FR-2: SKILL.md frontmatter carries the schema keys", () => {
  const text = raw("SKILL.md").toString("utf8");
  const fm = text.split("\n---\n")[0];
  assert.match(fm, /^name: golang-pro$/m);
  assert.match(fm, /^description: \S/m);
  assert.match(fm, /^license: MIT$/m);
  assert.match(fm, /^ {2}author: https:\/\/github\.com\/Jeffallan$/m);
  assert.match(fm, /^ {2}version: "1\.1\.1"$/m);
  assert.match(fm, /^ {2}source: https:\/\/github\.com\/Jeffallan\S+$/m);
  assert.match(fm, /^ {2}adapted-by: \S/m);
  assert.match(fm, /^ {2}adapted-for: \S/m);
  assert.match(fm, /^ {2}binding: stack$/m);
});

test("@akili-spec changes/go-backend-routing/golang-skill FR-2: NOTICE carries the provenance facts", () => {
  const n = raw("NOTICE").toString("utf8");
  assert.ok(n.includes("GitHub user Jeffallan"), "holder");
  assert.ok(n.includes("https://github.com/Jeffallan/claude-skills"), "source URL");
  assert.ok(n.includes(PIN), "pin");
  assert.match(n, /upstream `LICENSE` names no copyright holder/, "holder-name source");
  assert.match(n, /only modification is in the `SKILL\.md` frontmatter/, "frontmatter-only modification");
  assert.match(n, /not affiliated with the upstream/, "non-affiliation");
});

test("@akili-spec changes/go-backend-routing/golang-skill FR-3: golang-pro is in the four candidate pools", () => {
  const cons = repo(".claude/commands/akili-constitution.md");
  const step5 = section(cons, /^### Step 5:/, /^### Step 6/);
  assert.match(step5, /^- `golang-pro`$/m, "constitution Step 5 list");
  const skillMap = section(cons, /^1\. A table `Skill \| Applies To/, /^2\. /);
  assert.match(skillMap, /Candidates shipped with AKILI:[^.]*`golang-pro`/, "constitution Step 8D candidates");
  const spec = repo(".claude/commands/akili-specify.md");
  const fallback = section(spec, /^Use additional stack skills as needed/, /^#### Step 2\.2/);
  assert.match(fallback, /^- `golang-pro`$/m, "specify Step 2.1 fallback list");
  const doc = repo("docs/commands/akili-constitution.md");
  const line = doc.split("\n").find((l) => l.startsWith("- Stack skills matching the repo"));
  assert.ok(line && line.includes("`golang-pro`"), "docs/commands stack-skills line");
});

test("@akili-spec changes/go-backend-routing/golang-skill FR-4: governance stack row lists golang-pro", () => {
  const row = repo("docs/skills/governance.md").split("\n").find((l) => /^\| `stack` \| `angular-developer`/.test(l));
  assert.ok(row, "stack row of Current assignment not found");
  assert.ok(row.includes("`golang-pro`"));
});

test("@akili-spec changes/go-backend-routing/golang-skill NFR-2: no samber path under .claude/skills", () => {
  const hits = walk(path.join(ROOT, ".claude", "skills")).filter((p) => /samber/i.test(p));
  assert.deepEqual(hits, []);
});

test("@akili-spec changes/go-backend-routing/golang-skill FR-2: .gitattributes marks the folder -text", () => {
  assert.ok(repo(".gitattributes").split("\n").includes(".claude/skills/golang-pro/** -text"));
});

test("@akili-spec changes/go-backend-routing/golang-skill NFR-1 (advisory): folder under 60 KB", () => {
  const total = walk(SKILL).reduce((s, p) => s + fs.statSync(p).size, 0);
  assert.ok(total < 60 * 1024, `total ${total} B`);
});

// /akili-test (Leader inline, author != tester): FR-4 AND IT MUST (samber note)
// and BUT (no security claim beyond the T1 verdict) had no automated gate.
test("@akili-spec changes/go-backend-routing/golang-skill FR-4: docs page carries the facts and the samber note, and bounds its security claim", () => {
  const page = fs.readFileSync(path.join(ROOT, "docs", "skills", "golang-pro.md"), "utf8");
  for (const fact of ["GitHub user Jeffallan", "MIT", "`stack`", PIN, '"Go 1.21+"']) {
    assert.ok(page.includes(fact), `docs/skills/golang-pro.md lacks ${fact}`);
  }
  const samber = page.slice(page.indexOf("## Optional complement: samber"));
  assert.ok(samber.startsWith("## Optional complement: samber"), "samber section missing");
  assert.match(samber, /optional/i);
  assert.match(samber, /samber's own installer/);
  assert.ok(samber.includes("For best results, install all general-purpose skills together."), "samber install-together advice not quoted");
  assert.match(samber, /AKILI never vendors it/);
  assert.match(page, /claims no security property beyond the T1 verdict/);
  assert.doesNotMatch(page, /\b(safe|secure|verified safe|no risk)\b/i, "page asserts a security property beyond the verdict");
});
