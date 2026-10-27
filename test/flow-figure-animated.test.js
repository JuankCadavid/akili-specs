"use strict";

// @akili-spec changes/flow-diagram-animated (T1: animated figure locks)
//
// Structure, identity, standalone and staleness locks for the generated
// assets/akili-flow-animated.svg. Reads only assets/ and scripts/. It proves
// presence and order, never motion (rendered evidence is out of npm test).

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { animate } = require("../scripts/animate-flow.js");

const ROOT = path.join(__dirname, "..");
// Raw reads: the staleness and subsequence checks are byte-exact (no CRLF folding).
const raw = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const staticSvg = raw("assets/akili-flow.svg");
const animated = raw("assets/akili-flow-animated.svg");

const GROUP = /<g class="akili-motion"[^>]*>[\s\S]*?<\/g>/g;
const groups = animated.match(GROUP) || [];
const overlayStyle = animated.slice(animated.lastIndexOf("<style>"), animated.lastIndexOf("</svg>"));
const overlayEls = groups.flatMap((g) => g.match(/<(?:path|rect)\b[^>]*>/g) || []);
const overlayMarkup = groups.join("") + overlayStyle;
const delay = (tag) => Number(/--d:([\d.]+)s/.exec(tag)[1]);

// Independent expectation: static minus @keyframes whose name is never applied.
function staticMinusUnusedKeyframes(text) {
  const applied = [...text.matchAll(/animation(?:-name)?\s*:([^;}]*)/g)].map((m) => m[1]).join(" ");
  const blocks = [];
  for (const m of text.matchAll(/@keyframes\s+([\w-]+)\s*\{/g)) {
    let depth = 1;
    let end = m.index + m[0].length;
    for (; depth > 0; end++) depth += { "{": 1, "}": -1 }[text[end]] || 0;
    if (!applied.split(/[\s,]+/).includes(m[1])) blocks.push([m.index, end]);
  }
  return blocks.reduceRight((t, [a, b]) => t.slice(0, a) + t.slice(b), text);
}

test("staleness: the committed file equals animate(static), and a second run is identical", () => {
  const once = animate(staticSvg);
  const at = [...once].findIndex((c, i) => c !== animated[i]);
  assert.ok(once === animated, `committed file differs from animate(static) at byte ${at} (${animated.length} vs ${once.length})`);
  assert.ok(animate(staticSvg) === once, "second run differs from the first");
});

test("subsequence: minus the overlay groups and style, only unapplied keyframes differ from static", () => {
  assert.equal(groups.length, 2);
  const stripped = animated.replace(GROUP, "").replace(overlayStyle, "");
  const want = staticMinusUnusedKeyframes(staticSvg);
  assert.ok(stripped === want, `static content differs at byte ${[...want].findIndex((c, i) => c !== stripped[i])}`);
  assert.ok(stripped.length < staticSvg.length);
});

test("identity: title, desc, role, viewBox, width and height equal the static file's", () => {
  const ids = (s) => [
    /<title\b[^>]*>[\s\S]*?<\/title>/.exec(s)[0],
    /<desc\b[^>]*>[\s\S]*?<\/desc>/.exec(s)[0],
    /<svg\b[^>]*>/.exec(s)[0].match(/\s(?:role|viewBox|width|height)="[^"]*"/g),
  ];
  assert.deepEqual(ids(animated), ids(staticSvg));
});

test("standalone: no script, SMIL, external fetch, @import or colour-scheme rule", () => {
  assert.doesNotMatch(animated, /<script/i);
  assert.doesNotMatch(animated, /<(animate|animateTransform|animateMotion|set)\b/);
  assert.doesNotMatch(animated, /(?:href|src)\s*=\s*["']\s*https?:/i);
  assert.doesNotMatch(animated, /url\(\s*["']?\s*https?:/i);
  assert.doesNotMatch(animated, /@import/);
  assert.doesNotMatch(animated, /prefers-color-scheme/);
});

test("standalone: size is at most 153,600 B", () => {
  assert.ok(Buffer.byteLength(animated) <= 153600, String(Buffer.byteLength(animated)));
});

test("overlay: 10 traces and 8 outlines, each invisible by opacity attribute", () => {
  assert.equal(overlayEls.length, 18);
  for (const el of overlayEls) assert.match(el, /\sopacity="0"/);
});

test("overlay: isolated from static rules (mo- classes only, no data-edge/node/animate)", () => {
  for (const el of overlayEls) assert.match(el, /^<(?:path|rect) class="mo-[a-z]"/);
  assert.doesNotMatch(groups.join(""), /data-(edge|node|animate)/);
});

test("overlay: both groups are aria-hidden and sit before the first edge-label group", () => {
  const firstLabel = animated.indexOf("<g data-edge-from");
  for (const g of groups) {
    assert.match(g, /^<g class="akili-motion" aria-hidden="true" pointer-events="none">/);
    assert.ok(animated.indexOf(g) < firstLabel);
  }
});

test("overlay: no element for an Anytime node", () => {
  const rects = overlayEls.filter((e) => e.startsWith("<rect"));
  assert.equal(rects.length, 8);
  for (const id of ["review", "security", "resume", "seo", "audit", "marketing", "quick"]) {
    const m = new RegExp(`<g id="node-${id}"[\\s\\S]*?<rect([^>]*)data-animate="node"`).exec(staticSvg);
    assert.ok(m, id);
    const x = /\sx="([^"]*)"/.exec(m[1])[1], y = /\sy="([^"]*)"/.exec(m[1])[1];
    assert.ok(!rects.some((r) => r.includes(` x="${x}" y="${y}"`)), id);
  }
});

test("overlay: reduced-motion block stops every overlay animation", () => {
  assert.match(overlayStyle, /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.akili-motion,\s*\.akili-motion \*\s*\{\s*animation:\s*none/);
});

test("overlay: three iterations, never infinite, no fill-mode carry-over", () => {
  assert.match(overlayStyle, /animation-iteration-count:\s*3\b/);
  assert.doesNotMatch(overlayMarkup, /infinite/);
  assert.match(overlayStyle, /animation-fill-mode:\s*none/);
});

test("order: trace starts ascend with --step and e8 is last", () => {
  const traces = overlayEls.filter((e) => e.startsWith('<path class="mo-t"'));
  assert.deepEqual(traces.map(delay), [0, 0.9, 1.8, 2.7, 3.6, 4.5, 5.4, 6.3]);
});

test("order: glow starts follow each node's inbound edge; constitution first", () => {
  const glows = overlayEls.filter((e) => e.startsWith('<rect class="mo-n"')).map(delay);
  assert.deepEqual(glows, [0, 0.6, 1.5, 2.4, 3.3, 4.2, 5.1, 6]);
});

test("order: Bug Track pulses start after e8's trace starts", () => {
  const pulses = overlayEls.filter((e) => e.startsWith('<path class="mo-b"')).map(delay);
  assert.equal(pulses.length, 2);
  for (const p of pulses) assert.ok(p > 6.3, String(p));
});

// Keyframe parser for the overlay sets: [{ pct, opacity, dash }] per name.
function parseKeyframes(style) {
  const out = {};
  for (const m of style.matchAll(/@keyframes\s+(mo-[\w-]+)\s*\{((?:[^{}]|\{[^}]*\})*)\}/g)) {
    out[m[1]] = [...m[2].matchAll(/([\d.]+)%\s*\{([^}]*)\}/g)].map((s) => {
      const dash = /stroke-dashoffset:\s*([\d.]+)/.exec(s[2]);
      return {
        pct: Number(s[1]),
        opacity: Number(/opacity:\s*([\d.]+)/.exec(s[2])[1]),
        dash: dash ? Number(dash[1]) : undefined,
      };
    });
  }
  return out;
}
const keyframes = parseKeyframes(overlayStyle);
const cycle = Number(/animation-duration:\s*([\d.]+)s/.exec(overlayStyle)[1]);

test("motion: cycle length is 8 to 10 s", () => {
  assert.ok(cycle >= 8 && cycle <= 10, `animation-duration ${cycle}s outside 8-10 s`);
});

test("motion: opacity ceilings are 0.9 (trace, glow) and 0.5 (Bug Track), Bug Track below loop", () => {
  assert.deepEqual(Object.keys(keyframes).sort(), ["mo-bug", "mo-glow", "mo-trace"]);
  const max = (n) => Math.max(...keyframes[n].map((k) => k.opacity));
  assert.equal(max("mo-trace"), 0.9, "mo-trace ceiling");
  assert.equal(max("mo-glow"), 0.9, "mo-glow ceiling");
  assert.equal(max("mo-bug"), 0.5, "mo-bug ceiling");
  assert.ok(max("mo-bug") < max("mo-glow"), "Bug Track must stay below the loop ceiling");
});

// Flash bound: every set rises once and falls once per cycle, each >= 300 ms.
// Math.round absorbs the design's 0.3 s = 1/30 of 9 s (299.97 ms).
// mo-glow / mo-bug start invisible, so their rise is a timed opacity fade.
// mo-trace starts at its ceiling by design: its rise is the stroke draw
// (stroke-dashoffset 1 -> 0), which must itself be timed >= 300 ms.
function flashFailures(kf, cycleS) {
  const fails = [];
  const ms = (a, b) => ((b.pct - a.pct) / 100) * cycleS * 1000;
  const slow = (name, what, a, b) => {
    if (Math.round(ms(a, b)) < 300) fails.push(`${name}: ${what} lasts ${Math.round(ms(a, b))} ms (< 300 ms)`);
  };
  for (const [name, stops] of Object.entries(kf)) {
    let rises = 0;
    let falls = 0;
    if (name === "mo-trace") {
      const end = stops.findIndex((s) => s.dash === 0);
      if (stops[0].dash !== 1 || stops[0].opacity <= 0 || end < 1) {
        fails.push(`${name}: must start drawn-out (stroke-dashoffset:1) at its ceiling and reach stroke-dashoffset:0`);
      } else {
        rises = 1;
        slow(name, `stroke draw to ${stops[end].pct}%`, stops[0], stops[end]);
      }
    } else if (stops[0].opacity !== 0) {
      fails.push(`${name}: first stop is ${stops[0].opacity}, must start invisible (opacity 0)`);
    }
    for (let i = 1; i < stops.length; i++) {
      const d = stops[i].opacity - stops[i - 1].opacity;
      if (d === 0) continue;
      d > 0 ? rises++ : falls++;
      slow(name, `opacity change at ${stops[i].pct}%`, stops[i - 1], stops[i]);
    }
    if (rises !== 1) fails.push(`${name}: rises ${rises}`);
    if (falls !== 1) fails.push(`${name}: falls ${falls}`);
  }
  return fails;
}

test("motion: flash bound, one rise and one fall per set, each opacity change at least 300 ms", () => {
  assert.deepEqual(flashFailures(keyframes, cycle), []);
});

test("motion: flash bound rejects an instant glow jump, an instantly drawn trace and squeezed fades", () => {
  const mutate = (from, to) => {
    assert.ok(overlayStyle.includes(from), `mutation anchor missing: ${from}`);
    return flashFailures(parseKeyframes(overlayStyle.replace(from, to)), cycle);
  };
  assert.notDeepEqual(mutate("@keyframes mo-glow{0%{opacity:0}", "@keyframes mo-glow{0%{opacity:.9}"), []);
  assert.notDeepEqual(mutate("@keyframes mo-trace{0%{stroke-dashoffset:1;opacity:.9}", "@keyframes mo-trace{0%{stroke-dashoffset:0;opacity:.9}"), []);
  assert.notDeepEqual(mutate("8.889%{opacity:0}", "3.8%{opacity:0}"), []);
  assert.notDeepEqual(mutate("6.667%{stroke-dashoffset:0", "2%{stroke-dashoffset:0"), []);
});

test("hook failure: animate throws naming the hook when the propose node rect loses data-animate", () => {
  const broken = staticSvg.replace(/(<g id="node-propose"[\s\S]*?<rect[^>]*?) data-animate="node"/, "$1");
  assert.notEqual(broken, staticSvg);
  assert.throws(() => animate(broken), /propose rect data-animate="node"/);
});

test("hook failure: the CLI exits 1 and writes no output file", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "animate-flow-"));
  try {
    fs.mkdirSync(path.join(tmp, "scripts"));
    fs.mkdirSync(path.join(tmp, "assets"));
    fs.copyFileSync(path.join(ROOT, "scripts/animate-flow.js"), path.join(tmp, "scripts/animate-flow.js"));
    fs.writeFileSync(path.join(tmp, "assets/akili-flow.svg"), staticSvg.replace(/ data-edge-id="e3"/, ""));
    const r = spawnSync(process.execPath, [path.join(tmp, "scripts/animate-flow.js")], { encoding: "utf8" });
    assert.equal(r.status, 1);
    assert.match(r.stderr, /e3/);
    assert.equal(fs.existsSync(path.join(tmp, "assets/akili-flow-animated.svg")), false);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
