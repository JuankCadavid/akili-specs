"use strict";

// @akili-spec changes/flow-diagram-review (/akili-test: requirement contract)
//
// Clauses the author tests in test/flow-figure.test.js do not prove:
// FR-1 BUT (no extra lane, no unpackaged command), FR-1 AND (review beside
// security in the same colour family with a CI cue, both Bug Track edges,
// marketing sublabel), FR-1 font floor, FR-2 size caps and PNG width, FR-3
// line-21 sentence, FR-4 alt wording, FR-5 release notes.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8").replace(/\r\n/g, "\n");
const SVG = read("assets/akili-flow.svg");
const COMMANDS = fs.readdirSync(path.join(ROOT, ".claude/commands"))
  .filter((f) => /^akili-.+\.md$/.test(f)).map((f) => "/" + f.replace(/\.md$/, ""));

const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
const nodes = [...SVG.matchAll(/<g\b[^>]*data-node-id="[^"]*"[^>]*>/g)].map((m) => attrs(m[0]));
const node = (label) => nodes.find((n) => n["data-node-label"] === label) || assert.fail(`no node ${label}`);
const edges = [...SVG.matchAll(/<path\b[^>]*data-edge-from="[^"]*"[^>]*>/g)].map((m) => attrs(m[0]));
const drawn = [...SVG.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)].map((m) => m[1].replace(/<[^>]*>/g, "").trim());

function section(text, heading) {
  const start = text.indexOf(heading);
  assert.ok(start >= 0, `missing ${heading}`);
  const next = text.indexOf("\n## ", start + heading.length);
  return text.slice(start, next < 0 ? undefined : next);
}

test("FR-1 BUT: exactly the three lanes, and no drawn /akili-* name that is not a packaged command", () => {
  const lanes = drawn.filter((t) => /^\d\d \/ /.test(t));
  assert.deepEqual(lanes, ["01 / Once per project", "02 / Per-spec loop", "03 / Anytime"]);
  const names = drawn.flatMap((t) => t.match(/\/akili-[a-z-]+/g) || []);
  assert.deepEqual(names.filter((n) => !COMMANDS.includes(n)), []);
  assert.deepEqual(nodes.map((n) => n["data-node-label"]).filter((l) => l !== "Kaizen" && !COMMANDS.includes(l)), []);
});

test("FR-1 AND: /akili-review sits beside /akili-security in its colour family, with a CI cue", () => {
  const review = node("/akili-review");
  const security = node("/akili-security");
  assert.equal(review["data-node-kind"], security["data-node-kind"]);
  assert.match(review["data-node-sublabel"], /\bCI\b/);
  assert.equal(review["data-node-context"], "Anytime");
  assert.equal(security["data-node-context"], "Anytime");
});

test("FR-1 AND: both /akili-security and /akili-review have a dashed edge into /akili-propose, at least one labelled", () => {
  const bug = edges.filter((e) => e["data-edge-to"] === "propose" && ["security", "review"].includes(e["data-edge-from"]));
  assert.deepEqual(bug.map((e) => e["data-edge-from"]).sort(), ["review", "security"]);
  const dashed = new Set([...SVG.matchAll(/\.(a-[\w-]+)\s*\{[^}]*stroke-dasharray/g)].map((m) => m[1]));
  for (const e of bug) assert.ok((e.class || "").split(/\s+/).some((c) => dashed.has(c)), `edge ${e["data-edge-id"]} is not dashed`);
  assert.ok(bug.some((e) => e["data-edge-label"] === "confirmed finding → Bug Track"), "no Bug Track label on either edge");
});

// @akili-spec changes/growth-angles (FR-8): the growth group and its link
test("FR-8: a group labelled Growth track holds exactly /akili-seo and /akili-marketing, inside the Anytime lane", () => {
  const frames = [...SVG.matchAll(/<rect\b[^>]*data-composition-frame-kind="group"[^>]*>/g)].map((m) => attrs(m[0]));
  assert.equal(frames.length, 1, "expected exactly one group frame");
  const f = { x: +frames[0].x, y: +frames[0].y, w: +frames[0].width, h: +frames[0].height };
  const label = [...SVG.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)].find((m) => m[2].replace(/<[^>]*>/g, "").trim() === "Growth track");
  assert.ok(label, "no Growth track label drawn");
  const l = attrs(label[1]);
  assert.ok(+l.x >= f.x && +l.x <= f.x + f.w && Math.abs(+l.y - f.y) <= 8, "label is not on the group frame");
  const box = (id) => {
    const m = SVG.match(new RegExp(`<g\\b[^>]*data-node-id="${id}"[^>]*>[\\s\\S]*?<rect x="([\\d.]+)" y="([\\d.]+)" width="([\\d.]+)" height="([\\d.]+)"`));
    assert.ok(m, `no geometry for ${id}`);
    return { x: +m[1], y: +m[2], w: +m[3], h: +m[4] };
  };
  const inside = (b) => b.x >= f.x && b.y >= f.y && b.x + b.w <= f.x + f.w && b.y + b.h <= f.y + f.h;
  const members = nodes.map((n) => n["data-node-id"]).filter((id) => inside(box(id)));
  assert.deepEqual(members.sort(), ["marketing", "seo"]);
  assert.deepEqual(nodes.filter((n) => /Growth track/.test(n["data-node-context"] || "")).map((n) => n["data-node-label"]).sort(), ["/akili-marketing", "/akili-seo"]);
  for (const id of members) assert.equal(node(id === "seo" ? "/akili-seo" : "/akili-marketing")["data-node-context"], "Anytime › Growth track");
});

test("FR-8: edge g1 runs from /akili-constitution to /akili-marketing, dashed and labelled", () => {
  const g1 = edges.filter((e) => e["data-edge-id"] === "g1");
  assert.equal(g1.length, 1);
  assert.equal(g1[0]["data-edge-from"], "constitution");
  assert.equal(g1[0]["data-edge-to"], "marketing");
  assert.ok((g1[0]["data-edge-label"] || "").trim().length > 0, "g1 has no label");
  const dashed = new Set([...SVG.matchAll(/\.(a-[\w-]+)\s*\{[^}]*stroke-dasharray/g)].map((m) => m[1]));
  assert.ok((g1[0].class || "").split(/\s+/).some((c) => dashed.has(c)), "g1 is not dashed");
});

test("FR-1 AND: /akili-marketing says it drafts and never publishes", () => {
  const s = node("/akili-marketing")["data-node-sublabel"];
  assert.match(s, /draft/i);
  assert.match(s, /never publishes/);
});

test("FR-1 AND IT MUST: font floor at 900 px (all text >= 5.5, node labels >= 8)", () => {
  const width = +SVG.match(/viewBox="0 0 ([\d.]+) /)[1];
  const sizes = [...SVG.matchAll(/<text\b[^>]*font-size="([\d.]+)"/g)].map((m) => +m[1]);
  const labels = [...SVG.matchAll(/<text\b[^>]*>/g)].map((m) => attrs(m[0]))
    .filter((a) => "data-node-label" in a).map((a) => +a["font-size"]);
  assert.ok(labels.length >= COMMANDS.length, `only ${labels.length} node-label texts`);
  assert.ok(Math.min(...sizes) * 900 / width >= 5.5, `min font ${Math.min(...sizes)} at width ${width}`);
  assert.ok(Math.min(...labels) * 900 / width >= 8, `min label font ${Math.min(...labels)} at width ${width}`);
});

test("FR-2 AND IT MUST: PNG is 1800 px wide and both assets fit their size caps", () => {
  const png = fs.readFileSync(path.join(ROOT, "assets/akili-flow.png"));
  assert.equal(png.toString("latin1", 12, 16), "IHDR");
  assert.equal(png.readUInt32BE(16), 1800);
  assert.ok(png.length <= 409600, `PNG ${png.length} B`);
  assert.ok(fs.statSync(path.join(ROOT, "assets/akili-flow.svg")).size <= 153600, "SVG over 153,600 B");
});

test("FR-3: the anytime sentence keeps its prefix and names both Bug Track sources, review from a local run", () => {
  const line = read("docs/flow.md").split("\n").find((l) => l.startsWith("Seven anytime commands run outside this loop")) || assert.fail("no anytime sentence");
  assert.match(line, /Confirmed `\/akili-security` findings, and confirmed critical `\/akili-review` findings from a local run, re-enter the loop through `\/akili-propose` on the Bug Track\./);
  const alt = read("docs/flow.md").match(/^!\[(.*)\]\(\.\.\/assets\/akili-flow-animated\.svg\)$/m)[1];
  for (const c of ["security", "review", "resume", "audit", "quick", "seo", "marketing"]) assert.ok(alt.includes(`/akili-${c}`), `alt lacks /akili-${c}`);
  assert.match(alt, /\/akili-review findings from a local run, enter the Bug Track/);
  assert.match(alt, /\/akili-seo and \/akili-marketing form the growth track, linked to \/akili-constitution: the PRD seeds the brand voice and angles, and they return as cited defaults\./);
});

test("FR-4: the README figure alt says seven commands run any time, naming the security audit and the CI-capable PR review", () => {
  const img = read("README.md").match(/<img alt="([^"]*)"\s+src="[^"]*akili-flow-animated\.svg"/) || assert.fail("no figure img");
  assert.match(img[1], /seven commands run any time/);
  assert.match(img[1], /security audit/);
  assert.match(img[1], /pull-request review that can also run in CI/);
  assert.match(img[1], /growth track/);
});

test("FR-5: [Unreleased] records the refresh as a patch; 2.37.0 and its release notes drop the figure debt", () => {
  // Stays true after the release script moves [Unreleased] into a dated 2.37.1 section.
  const log = read("CHANGELOG.md");
  const released = log.split("\n").find((l) => /^## \[2\.37\.1\] - \d{4}-\d{2}-\d{2}$/.test(l));
  const u = section(log, released || "## [Unreleased]");
  assert.doesNotMatch(u, /No unreleased changes yet\./);
  for (const s of ["`/akili-review`", "`/akili-marketing`", "Release class: patch", "`master`", "`releases/v2.37.0.md`", "`test/flow-figure.test.js`"])
    assert.ok(u.includes(s), `[Unreleased] lacks ${s}`);
  assert.doesNotMatch(u, /GitHub Release/, "[Unreleased] mentions the GitHub Release body");
  assert.doesNotMatch(section(log, "## [2.37.0]"), /Known debt: the lifecycle figure/);
  assert.doesNotMatch(read("releases/v2.37.0.md"), /Known debt: the lifecycle figure/);
});
