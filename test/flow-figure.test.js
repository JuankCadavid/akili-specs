"use strict";

// @akili-spec changes/flow-diagram-review (T2: lifecycle figure locks)
//
// FR-3 / FR-4 / FR-6 and NFR-2. Reads only assets/akili-flow.svg,
// docs/flow.md and .claude/commands/. Never reads any spec folder.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8").replace(/\r\n/g, "\n");
}

const svg = read("assets/akili-flow.svg");

function decode(s) {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

// Whole trimmed text content of every <text> element, inner tags stripped.
function drawnTexts() {
  const out = [];
  const re = /<text\b[^>]*>([\s\S]*?)<\/text>/g;
  let m;
  while ((m = re.exec(svg))) {
    out.push(decode(m[1].replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim());
  }
  return out;
}

function firstElementText(tag) {
  const m = svg.match(new RegExp("<" + tag + "\\b[^>]*>([\\s\\S]*?)</" + tag + ">"));
  return m ? decode(m[1].replace(/<[^>]*>/g, "")).trim() : "";
}

test("every command name and Kaizen is drawn as the whole text of an SVG text element", () => {
  const drawn = new Set(drawnTexts());
  const names = fs
    .readdirSync(path.join(ROOT, ".claude/commands"))
    .filter((f) => /^akili-.+\.md$/.test(f))
    .map((f) => "/" + f.replace(/\.md$/, ""))
    .concat(["Kaizen"]);
  const missing = names.filter((n) => !drawn.has(n));
  assert.deepEqual(missing, []);
});

test("the SVG desc of both assets equals the docs/flow.md figure alt text", () => {
  // @akili-spec changes/flow-diagram-animated (T3): the flow line embeds the animated asset
  const m = read("docs/flow.md").match(/^!\[(.*)\]\(\.\.\/assets\/akili-flow-animated\.svg\)$/m);
  assert.ok(m, "docs/flow.md has no figure line");
  assert.equal(firstElementText("desc"), m[1]);
  const animated = read("assets/akili-flow-animated.svg").match(/<desc\b[^>]*>([\s\S]*?)<\/desc>/);
  assert.ok(animated, "assets/akili-flow-animated.svg has no <desc>");
  assert.equal(decode(animated[1].replace(/<[^>]*>/g, "")).trim(), m[1]);
});

test("the SVG is standalone and carries the expected identity", () => {
  assert.doesNotMatch(svg, /<script/);
  assert.doesNotMatch(svg, /(href|src)="https?:\/\//);
  assert.doesNotMatch(svg, /url\(\s*["']?\s*https?/i);
  assert.doesNotMatch(svg, /@import/);
  assert.doesNotMatch(svg, /prefers-color-scheme/);
  assert.match(svg, /role="img"/);
  assert.equal(firstElementText("title"), "AKILI-SPECS methodology lifecycle");
  const archify = drawnTexts().filter((t) => /archify/i.test(t));
  assert.deepEqual(archify, []);
});
