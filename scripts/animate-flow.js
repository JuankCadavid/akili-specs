"use strict";

// Builds assets/akili-flow-animated.svg from assets/akili-flow.svg: an opacity-0
// overlay (edge traces, node outlines, Bug Track pulses) animated by CSS, plus
// removal of the static file's unapplied @keyframes. Node built-ins only.
// Run: node scripts/animate-flow.js

const fs = require("fs");
const path = require("path");

const LOOP = ["constitution", "propose", "specify", "execute", "test", "validate", "archive", "kaizen"];
const SLOT = 0.9; // seconds per loop edge
const PULSE = 7.4; // Bug Track pulse start, after e8's run

const num = (n) => String(Math.round(n * 10) / 10);
const attr = (tag, name) => {
  const m = new RegExp("\\s" + name + '="([^"]*)"').exec(tag);
  return m ? m[1] : null;
};
const need = (value, hook) => {
  if (value === null || value === undefined) throw new Error("missing hook: " + hook);
  return value;
};
const stepOf = (tag, hook) => {
  const m = /--step:\s*(\d+)/.exec(need(attr(tag, "style"), hook + " --step"));
  return Number(need(m && m[1], hook + " --step"));
};
const edgeTag = (svg, id) => {
  const m = new RegExp('<path\\b[^>]*\\sdata-edge-id="' + id + '"[^>]*>').exec(svg);
  return need(m && m[0], 'path data-edge-id="' + id + '"');
};

// Remove every @keyframes block whose name no animation/animation-name declaration uses.
function dropUnusedKeyframes(svg) {
  const used = [];
  for (const m of svg.matchAll(/(?<![\w-])animation(?:-name)?\s*:\s*([^;}]*)/g)) used.push(m[1]);
  const usedText = used.join(" ");
  let out = "";
  let from = 0;
  const re = /@keyframes\s+([\w-]+)\s*\{/g;
  let m;
  while ((m = re.exec(svg))) {
    let depth = 1;
    let i = re.lastIndex;
    while (depth > 0 && i < svg.length) depth += svg[i] === "{" ? 1 : svg[i] === "}" ? -1 : 0, i++;
    const isUsed = new RegExp("(^|[\\s,])" + m[1].replace(/-/g, "\\-") + "(?=[\\s,;]|$)").test(usedText);
    if (!isUsed) {
      out += svg.slice(from, m.index);
      from = i;
    }
    re.lastIndex = i;
  }
  return out + svg.slice(from);
}

const CSS = `<style>
.mo-t,.mo-n,.mo-b{fill:none;stroke:var(--arrow-emphasis);animation-duration:9s;animation-delay:var(--d);animation-iteration-count:3;animation-fill-mode:none}
.mo-t{stroke-width:3;stroke-dasharray:1;stroke-dashoffset:1;stroke-linecap:butt;animation-name:mo-trace;animation-timing-function:linear}
.mo-n{stroke-width:2.5;animation-name:mo-glow;animation-timing-function:ease-in-out}
.mo-b{stroke:var(--security-stroke);stroke-width:3;animation-name:mo-bug;animation-timing-function:ease-in-out}
@keyframes mo-trace{0%{stroke-dashoffset:1;opacity:.9}6.667%{stroke-dashoffset:0;opacity:.9}10%{stroke-dashoffset:0;opacity:0}100%{stroke-dashoffset:0;opacity:0}}
@keyframes mo-glow{0%{opacity:0}3.333%{opacity:.9}8.889%{opacity:0}100%{opacity:0}}
@keyframes mo-bug{0%{opacity:0}4.444%{opacity:.5}11.111%{opacity:0}100%{opacity:0}}
@media (prefers-reduced-motion: reduce){.akili-motion,.akili-motion *{animation:none}}
</style>`;

function animate(svgText) {
  const svg = dropUnusedKeyframes(svgText);
  const G = '<g class="akili-motion" aria-hidden="true" pointer-events="none">';

  const traces = [];
  for (let n = 1; n <= 8; n++) {
    const tag = edgeTag(svg, "e" + n);
    const d = need(attr(tag, "d"), "e" + n + " d");
    traces.push(`<path class="mo-t" d="${d}" pathLength="1" opacity="0" style="--d:${num(stepOf(tag, "e" + n) * SLOT)}s"/>`);
  }
  const pulses = ["s1", "s2"].map(
    (id) => `<path class="mo-b" d="${need(attr(edgeTag(svg, id), "d"), id + " d")}" opacity="0" style="--d:${PULSE}s"/>`
  );

  let lastNode = -1;
  const glows = LOOP.map((id) => {
    const g = svg.indexOf(`<g id="node-${id}"`);
    need(g < 0 ? null : g, `<g id="node-${id}">`);
    lastNode = Math.max(lastNode, g);
    const rest = svg.slice(g);
    const next = rest.indexOf('<g id="node-', 1);
    const m = /<rect\b[^>]*\sdata-animate="node"[^>]*>/.exec(next < 0 ? rest : rest.slice(0, next));
    const tag = need(m && m[0], `${id} rect data-animate="node"`);
    const k = stepOf(tag, id + ' data-animate="node"');
    const geo = ["x", "y", "width", "height", "rx"]
      .map((a) => `${a}="${need(attr(tag, a), id + " " + a)}"`)
      .join(" ");
    return `<rect class="mo-n" ${geo} opacity="0" style="--d:${num(k === 0 ? 0 : (k - 1) * SLOT + 0.6)}s"/>`;
  });

  const edges = [...svg.matchAll(/<path\b[^>]*\sdata-edge-id="[es]\d+"[^>]*>/g)];
  const lastEdge = need(edges.length ? edges[edges.length - 1] : null, "last static edge path");
  const traceAt = lastEdge.index + lastEdge[0].length;
  const labelAt = svg.indexOf("<g data-edge-from", lastNode);
  need(labelAt < 0 ? null : labelAt, "edge-label group <g data-edge-from");
  const end = svg.lastIndexOf("</svg>");
  need(end < 0 ? null : end, "</svg>");
  if (!(traceAt < labelAt && labelAt < end)) throw new Error("missing hook: edge, node and label order");

  return (
    svg.slice(0, traceAt) + G + traces.concat(pulses).join("") + "</g>" +
    svg.slice(traceAt, labelAt) + G + glows.join("") + "</g>" +
    svg.slice(labelAt, end) + CSS + svg.slice(end)
  );
}

module.exports = { animate };

if (require.main === module) {
  const assets = path.join(__dirname, "..", "assets");
  try {
    const out = animate(fs.readFileSync(path.join(assets, "akili-flow.svg"), "utf8"));
    fs.writeFileSync(path.join(assets, "akili-flow-animated.svg"), out);
  } catch (e) {
    console.error("animate-flow: " + e.message);
    process.exitCode = 1;
  }
}
