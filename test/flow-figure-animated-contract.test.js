"use strict";

// @akili-spec changes/flow-diagram-animated (/akili-test: requirement contract)
//
// Clauses the author tests (test/flow-figure-animated.test.js and the T3 pins in
// test/docs-overview*.test.js, test/flow-figure*.test.js) do not prove:
// FR-4 AND IT MUST NOT (no README line outside the figure block, as structure),
// FR-5 BUT (one figure line, no static-SVG embed left), FR-6 AND IT MUST (Node
// built-ins only), FR-7 (CHANGELOG notes, released sections untouched, stated
// size equals the asset), NFR-1 (no video or Archify asset), NFR-2 (shipping
// rules), NFR-3 (.gitattributes byte-exact SVGs), NFR-4 (no spec-path citation).
// Expected values copied from the spec at commit 88d4b67.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { builtinModules } = require("module");

const ROOT = path.join(__dirname, "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8").replace(/\r\n/g, "\n");
const RAW = "https://raw.githubusercontent.com/JuankCadavid/akili-specs/master/assets/";

function section(text, heading) {
  const start = text.indexOf(heading);
  assert.ok(start >= 0, `missing ${heading}`);
  const next = text.indexOf("\n## ", start + heading.length);
  return text.slice(start, next < 0 ? undefined : next);
}

// ----------------------------------------------------------------- FR-4 / FR-5

function figureContract(readme) {
  const s = section(readme, "## How it works");
  const fails = [];
  const blocks = s.match(/<p align="center">[\s\S]*?<\/p>/g) || [];
  if (blocks.length !== 1) fails.push(`${blocks.length} <p align="center"> blocks`);
  const outside = s.replace(/<p align="center">[\s\S]*?<\/p>/g, "");
  const html = outside.match(/<\/?[a-z][^>]*>/gi) || [];
  if (html.length) fails.push(`HTML outside the figure block: ${html.join(" ")}`);
  if (/akili-flow/.test(outside)) fails.push("figure asset referenced outside the block");
  if (blocks[0]) {
    const tags = (blocks[0].match(/<\/?[a-z]+/gi) || []).map((t) => t.toLowerCase());
    const want = ["<p", "<a", "<picture", "<source", "<img", "</picture", "</a", "</p"];
    if (tags.join(" ") !== want.join(" ")) fails.push(`block tags ${tags.join(" ")}`);
    const urls = blocks[0].match(/https?:\/\/[^"\s]+/g) || [];
    const ok = [RAW + "akili-flow.png", RAW + "akili-flow-animated.svg"];
    const stray = urls.filter((u) => !ok.includes(u));
    if (stray.length) fails.push(`non-master or unexpected URL: ${stray.join(" ")}`);
  }
  return fails;
}

test("@akili-spec changes/flow-diagram-animated FR-4 AND IT MUST NOT: How it works holds one figure block of exactly a > picture > source + img, and no other figure markup", () => {
  assert.deepEqual(figureContract(read("README.md")), []);
});

test("@akili-spec changes/flow-diagram-animated FR-4 falsifier: an extra line outside the block or inside it is caught", () => {
  const readme = read("README.md");
  const end = "</picture>\n  </a>\n</p>\n";
  assert.ok(readme.includes(end), "mutation anchor missing");
  const extraOutside = readme.replace(end, end + '<img src="x.gif">\n');
  assert.notDeepEqual(figureContract(extraOutside), []);
  const extraInside = readme.replace("</picture>", '<source srcset="y.png">\n    </picture>');
  assert.notDeepEqual(figureContract(extraInside), []);
});

test("@akili-spec changes/flow-diagram-animated FR-5 BUT: docs/flow.md has exactly one figure line, line 7, and no static-SVG embed remains", () => {
  const lines = read("docs/flow.md").split("\n");
  const figs = lines.map((l, i) => [i + 1, l]).filter(([, l]) => /akili-flow/.test(l));
  assert.deepEqual(figs.map(([n]) => n), [7]);
  assert.match(figs[0][1], /^!\[[^\]]+\]\(\.\.\/assets\/akili-flow-animated\.svg\)$/);
  assert.equal(lines.filter((l) => /^!\[/.test(l)).length, 1);
});

// ---------------------------------------------------------------------- FR-6

test("@akili-spec changes/flow-diagram-animated FR-6 AND IT MUST: the generator requires only Node built-ins", () => {
  const src = read("scripts/animate-flow.js");
  const reqs = [...src.matchAll(/\brequire\(\s*["']([^"']+)["']\s*\)/g)].map((m) => m[1]);
  assert.ok(reqs.length > 0, "no require() found");
  const bad = reqs.filter((r) => !builtinModules.includes(r.replace(/^node:/, "")));
  assert.deepEqual(bad, []);
  assert.doesNotMatch(src, /\bimport\s*\(|^\s*import\s/m, "ESM import in generator");
});

// ---------------------------------------------------------------------- FR-7

const LOG = read("CHANGELOG.md");
// Stays true after the release script moves [Unreleased] into a dated 2.37.2 section.
const RELEASED = LOG.split("\n").find((l) => /^## \[2\.37\.2\] - \d{4}-\d{2}-\d{2}$/.test(l));
const NOTES = section(LOG, RELEASED || "## [Unreleased]");

test("@akili-spec changes/flow-diagram-animated FR-7 THEN: the notes name the figure, generator, staleness test, <picture>, flow.md embed and the patch class", () => {
  assert.doesNotMatch(NOTES, /No unreleased changes yet\./);
  for (const s of ["`assets/akili-flow-animated.svg`", "`scripts/animate-flow.js`", "`test/flow-figure-animated.test.js`",
    "`<picture>`", "`docs/flow.md`", "prefers-reduced-motion: reduce", "Release class: patch"])
    assert.ok(NOTES.includes(s), `notes lack ${s}`);
  assert.match(NOTES, /click-through link is unchanged/);
  assert.match(NOTES, /staleness test/);
});

test("@akili-spec changes/flow-diagram-animated FR-7 AND: says the static SVG and PNG are unchanged, and when GitHub (master) and npm (2.37.2) show it", () => {
  assert.match(NOTES, /static `assets\/akili-flow\.svg` and `assets\/akili-flow\.png` are unchanged/);
  assert.match(NOTES, /GitHub shows the animation once `master` updates/);
  assert.match(NOTES, /npm[^.]*once 2\.37\.2 is published/);
});

test("@akili-spec changes/flow-diagram-animated FR-7 AND IT MUST: the stated byte size of the animated SVG equals the committed file (KZ-002)", () => {
  // @akili-spec changes/growth-angles (T9): sections are taken in document order (newest first:
  // [Unreleased], then the dated sections top-down) and the FIRST one stating a size is held to the
  // committed file, so the check survives the release cut that turns [Unreleased] into a dated section.
  const SIZE = /`assets\/akili-flow-animated\.svg` \((\d[\d,]*) bytes\)/;
  const heads = [...LOG.matchAll(/^## \[[^\]]+\][^\n]*$/gm)].map((h) => h[0]);
  let m = null;
  for (const h of heads) {
    m = section(LOG, h).match(SIZE);
    if (m) break;
  }
  assert.ok(m, "notes state no byte size for the animated SVG");
  const actual = fs.statSync(path.join(ROOT, "assets/akili-flow-animated.svg")).size;
  assert.equal(Number(m[1].replace(/,/g, "")), actual);
});

test("@akili-spec changes/flow-diagram-animated FR-7 BUT: no section released before 2.37.2 mentions the animated figure or its generator", () => {
  // @akili-spec changes/growth-angles (T9): a dated section for a later release may name the figure.
  const older = (v) => {
    const [a, b, c] = v.split(".").map(Number);
    return a !== 2 ? a < 2 : b !== 37 ? b < 37 : c < 2;
  };
  const heads = [...LOG.matchAll(/^## \[(\d+\.\d+\.\d+)\][^\n]*$/gm)].filter((m) => older(m[1])).map((m) => m[0]);
  assert.ok(heads.length > 0);
  for (const h of heads) assert.doesNotMatch(section(LOG, h), /akili-flow-animated|animate-flow/, h);
});

// ---------------------------------------------------------------------- NFRs

test("@akili-spec changes/flow-diagram-animated NFR-1: no MP4, GIF, WebM or Archify HTML under assets/", () => {
  const bad = fs.readdirSync(path.join(ROOT, "assets")).filter((f) => /\.(mp4|gif|webm|mov|html?)$/i.test(f));
  assert.deepEqual(bad, []);
});

test("@akili-spec changes/flow-diagram-animated NFR-2: package files ship assets/ and never the generator", () => {
  const files = JSON.parse(read("package.json")).files;
  assert.ok(files.includes("assets"), "assets not shipped");
  assert.ok(fs.existsSync(path.join(ROOT, "assets/akili-flow-animated.svg")));
  const shipsGenerator = files.some((f) => f === "scripts" || f === "scripts/" || f === "scripts/animate-flow.js" || /^scripts\/\*/.test(f));
  assert.equal(shipsGenerator, false, `files: ${files.join(", ")}`);
  assert.doesNotMatch(read(".npmignore"), /^!?assets/m, ".npmignore touches assets");
});

test("@akili-spec changes/flow-diagram-animated NFR-3: .gitattributes keeps both figure SVGs byte-exact (-text)", () => {
  const attrs = read(".gitattributes").split("\n").map((l) => l.trim().split(/\s+/));
  for (const f of ["assets/akili-flow.svg", "assets/akili-flow-animated.svg"])
    assert.ok(attrs.some(([p, ...a]) => p === f && a.includes("-text")), `${f} lacks -text`);
});

test("@akili-spec changes/flow-diagram-animated NFR-4: no test or shipped file cites the spec folder path", () => {
  const needle = "docs/specs/" + "changes/flow-diagram-animated";
  const files = JSON.parse(read("package.json")).files.filter((f) => !f.startsWith("!"));
  const roots = [...files, "test", "scripts", ".gitattributes"];
  const hits = [];
  const walk = (rel) => {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) return;
    if (rel === "docs/specs" || rel.includes("node_modules")) return;
    if (fs.statSync(abs).isDirectory()) return fs.readdirSync(abs).forEach((f) => walk(path.posix.join(rel, f)));
    if (/\.(png|jpe?g|gif|ico|woff2?|ttf|zip|tgz)$/i.test(rel)) return;
    if (fs.readFileSync(abs, "utf8").includes(needle)) hits.push(rel);
  };
  roots.forEach(walk);
  assert.deepEqual(hits, []);
});
