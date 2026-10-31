"use strict";
// @akili-spec changes/impeccable-audit-fixes/design-eval-followup
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), "utf8").replace(/\r\n/g, "\n");
const BRIDGE = [".claude", "skills", "impeccable-bridge"];

const index = (s, needle) => {
  const i = s.indexOf(needle);
  assert.ok(i >= 0, `missing: ${needle}`);
  return i;
};
// The text between two markers, the end marker searched only after the start marker.
const slice = (s, from, to) => {
  const i = index(s, from);
  const j = s.indexOf(to, i + from.length);
  assert.ok(j > i, `missing end marker after "${from}": ${to}`);
  return s.slice(i, j);
};

const bridge = () => read(...BRIDGE, "SKILL.md");
const firstVisit = () => slice(bridge(), "### First-visit pass", "### Exit codes");
const ctaItem = () => slice(firstVisit(), "3. A fold screenshot", "4. When the product has a consent banner");
const identification = () => slice(ctaItem(), "- Identification, in order:", "- Measurement:");
const bannerItem = () => slice(firstVisit(), "4. When the product has a consent banner", "- The consent-hiding");

test("FR-1: the banner state is recorded as `not rendered: <reason>`, apart from the CTA outcome", () => {
  assert.ok(bannerItem().includes("the banner state reads `not rendered: <reason>`"), "banner state");
});

test("FR-1: only a would-be `pass` changes", () => {
  assert.ok(bannerItem().includes("only a would-be `pass` changes"), "precedence");
});

test("FR-1: a would-be pass still never reads `pass`", () => {
  assert.ok(bannerItem().includes("and never reads `pass`"), "never pass");
});

test("FR-1: a `below fold` or `covered` outcome stands", () => {
  assert.ok(bannerItem().includes("A `below fold` or `covered` outcome stands"), "outcome stands");
});

test("FR-1: the reason a missing banner cannot change those outcomes ships", () => {
  assert.ok(bannerItem().includes("cannot bring the CTA into view or uncover it"), "rationale");
});

test("FR-1: an item 3 `Unevaluated` outcome keeps its own reason", () => {
  assert.ok(bannerItem().includes("keeps its own reason"), "own reason");
});

test("FR-1: the test-ID remedy applies whatever the CTA outcome", () => {
  assert.ok(bannerItem().includes("whatever the CTA outcome"), "remedy scope");
});

test("FR-1: CTA identification never depends on the CTA's text", () => {
  assert.ok(!/\btext\b/i.test(identification()), "item 3 identification names no text match");
});

test("Guard: this test file reads no file under the spec folder", () => {
  // The forbidden path is built from fragments so this source never contains it.
  const D = "do" + "cs";
  const S = "sp" + "ecs";
  const src = fs.readFileSync(__filename, "utf8");
  assert.ok(!src.includes(`${D}/${S}`), "no literal path into the spec folder");
  assert.ok(!new RegExp(`["']${D}["']\\s*,\\s*["']${S}["']`).test(src), "no path-segment read of the spec folder");
  assert.ok(src.includes("@akili-spec changes/impeccable-audit-fixes/design-eval-followup"), "header comment present");
});
