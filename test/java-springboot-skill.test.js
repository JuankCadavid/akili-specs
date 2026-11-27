"use strict";

// @akili-spec changes/java-springboot-skill
//
// T2 -- hash lock for the vendored `java-springboot` skill (FR-2, NFR-1,
// NFR-2; design DD-2, DD-3). Hashes are computed over RAW bytes
// (fs.readFileSync with no encoding): git blob SHA-1 of `blob <len>\0<bytes>`,
// no line-ending normalization, no git subprocess. The SHAs are hard-coded
// here: tests never read docs/specs/ (NFR-4).

const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SKILLS = path.join(ROOT, ".claude", "skills");
const SKILL = path.join(SKILLS, "java-springboot");
const PIN = "93fc8b9ee3ef56b9b5e7261e6ce92d314cb2c1cf";
const SOURCE = `https://github.com/github/awesome-copilot/tree/${PIN}/skills/java-springboot`;

const SHAS = {
  "references/aot-and-startup.md": "bdebfab601c65bd14bcd6ba8ad1322197872d829",
  "references/configuration.md": "500624d3e2d0c42c186932658733e2469b7544e4",
  "references/data.md": "e66458facf39cb04df86210da94efef797143bbf",
  "references/messaging-caching.md": "ecfd728c0c1cd7498105e348610f2d082e983631",
  "references/rest-api.md": "69226559eebfd6823659a7ffbb356292d87c43e1",
  LICENSE: "89bc5e962c9944cdb050887062afdaaf89be504a",
};
const SKILL_MD_SHA = "3729077eaf60351e7d4d7a46464e6f5d2797bd74";

function blobSha(buf) {
  return crypto
    .createHash("sha1")
    .update(Buffer.concat([Buffer.from(`blob ${buf.length}\0`), buf]))
    .digest("hex");
}
const raw = (rel) => fs.readFileSync(path.join(SKILL, rel));

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

const ADDED = [
  "license: MIT",
  "metadata:",
  "  author: github/awesome-copilot contributors (Copyright GitHub, Inc.)",
  `  source: ${SOURCE}`,
  '  adapted-by: "Juan Carlos Cadavid — jcadavid.com"',
  '  adapted-for: "AKILI-SPECS"',
  "  binding: stack",
  '  version: "1.0"',
];

const P = "@akili-spec changes/java-springboot-skill";

test(`${P} FR-2: folder holds exactly 8 files`, () => {
  assert.ok(fs.existsSync(SKILL), "java-springboot folder is missing");
  const files = walk(SKILL).map((p) => path.relative(SKILL, p).split(path.sep).join("/")).sort();
  assert.deepEqual(files, [
    "LICENSE",
    "NOTICE",
    "SKILL.md",
    "references/aot-and-startup.md",
    "references/configuration.md",
    "references/data.md",
    "references/messaging-caching.md",
    "references/rest-api.md",
  ]);
});

for (const [rel, sha] of Object.entries(SHAS)) {
  test(`${P} FR-2: ${rel} equals its pinned blob SHA`, () => {
    assert.equal(blobSha(raw(rel)), sha);
  });
}

test(`${P} FR-2 DD-2: the appended lines sit before the closing --- and nothing else changed`, () => {
  const lines = raw("SKILL.md").toString("utf8").split("\n");
  assert.equal(lines[0], "---");
  const close = lines.indexOf("---", 1);
  assert.ok(close > 0, "closing --- not found");
  assert.deepEqual(lines.slice(close - ADDED.length, close), ADDED);
  const stripped = lines.filter((_, i) => i < close - ADDED.length || i >= close).join("\n");
  assert.equal(blobSha(Buffer.from(stripped, "utf8")), SKILL_MD_SHA);
});

test(`${P} FR-2: SKILL.md frontmatter carries the schema keys`, () => {
  const fm = raw("SKILL.md").toString("utf8").split("\n---\n")[0];
  assert.match(fm, /^name: java-springboot$/m);
  assert.match(fm, /^description: \S/m);
  assert.match(fm, /^license: MIT$/m);
  assert.match(fm, /^ {2}author: github\/awesome-copilot contributors \(Copyright GitHub, Inc\.\)$/m);
  assert.match(fm, /^ {2}version: "1\.0"$/m);
  assert.ok(fm.includes(`\n  source: ${SOURCE}\n`), "source");
  assert.match(fm, /^ {2}adapted-by: \S/m);
  assert.match(fm, /^ {2}adapted-for: \S/m);
  assert.match(fm, /^ {2}binding: stack$/m);
});

test(`${P} FR-2: NOTICE carries the provenance facts`, () => {
  const n = raw("NOTICE").toString("utf8");
  assert.ok(n.includes("GitHub, Inc."), "holder");
  assert.ok(n.includes("Copyright GitHub, Inc."), "LICENSE line quoted");
  assert.ok(n.includes(SOURCE), "source URL");
  assert.ok(n.includes(PIN), "pin");
  for (const l of ADDED.filter((x) => x.startsWith("  ") || x === "license: MIT")) {
    assert.ok(n.includes(l.trim()), `appended line: ${l}`);
  }
  assert.match(n, /governance default/, "version rationale");
  assert.match(n, /PASS/, "pre-check verdict");
  assert.match(n, /INDIRECT_PROMPT_INJECTION/, "Trust Hub finding");
  assert.match(n, /Socket/, "Socket rating");
  assert.match(n, /Snyk/, "Snyk rating");
  assert.match(n, /not affiliated with the upstream/, "non-affiliation");
  assert.match(n, /pin moves only through a new AKILI spec/, "pin policy");
});

test(`${P} FR-2: .gitattributes declares the tree byte-exact`, () => {
  const ga = fs.readFileSync(path.join(ROOT, ".gitattributes"), "utf8").split(/\r?\n/);
  assert.ok(ga.includes(".claude/skills/java-springboot/** -text"));
});

test(`${P} NFR-1: folder stays under 50 KB`, () => {
  const total = walk(SKILL).reduce((n, p) => n + fs.statSync(p).size, 0);
  assert.ok(total < 50 * 1024, `folder is ${total} B`);
});

test(`${P} NFR-2: no sibling skill folder under .claude/skills`, () => {
  const siblings = [
    "spring-boot-testing",
    "spring-security",
    "spring-observability",
    "java-hibernate-jpa",
    "create-spring-boot-java-project",
    "java-add-graalvm-native-image-support",
    "spring-boot-4-migration",
  ];
  const present = fs.readdirSync(SKILLS).filter((d) => siblings.includes(d));
  assert.deepEqual(present, []);
});
