"use strict";

// @akili-spec changes/docs-overview
//
// Derived-inventory and structure conformance for the landing README, the
// docs hub and docs/overview.md (FR-16 clauses (a)-(j)). Membership and counts
// are derived from the package at test time (.claude/commands/*.md and
// .claude/skills/*/SKILL.md), so a command or skill added later fails here,
// naming the missing file and row. No count of commands or skills is hard-coded.
//
// No read of the spec folder: /akili-archive moves it out of changes/.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.join(__dirname, "..");
const read = (rel) => fs.readFileSync(path.join(REPO_ROOT, rel), "utf8").replace(/\r\n/g, "\n");
const exists = (rel) => fs.existsSync(path.join(REPO_ROOT, rel));

// ---------------------------------------------------------------- helpers

function inventory() {
  const commands = fs
    .readdirSync(path.join(REPO_ROOT, ".claude", "commands"))
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.slice(0, -3))
    .sort();
  const skills = fs
    .readdirSync(path.join(REPO_ROOT, ".claude", "skills"), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
  return { commands, skills };
}

// Blank fenced code blocks, keeping the line count.
function stripFences(md) {
  let fence = null;
  return md
    .split("\n")
    .map((line) => {
      const m = line.match(/^\s*(`{3,}|~{3,})/);
      if (fence) {
        if (m && m[1][0] === fence[0] && m[1].length >= fence.length) fence = null;
        return "";
      }
      if (m) {
        fence = m[1];
        return "";
      }
      return line;
    })
    .join("\n");
}

// Fence-aware headings of exactly `level` hashes: [{line, text}] (1-based line).
function headings(md, level) {
  const out = [];
  stripFences(md)
    .split("\n")
    .forEach((line, i) => {
      const m = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
      if (m && m[1].length === level) out.push({ line: i + 1, text: m[2] });
    });
  return out;
}

function splitCells(row) {
  return row
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split(/(?<!\\)\|/)
    .map((c) => c.trim());
}

const isSeparator = (row) => /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?$/.test(row.trim());

// The tables under a heading (e.g. "## Commands"), until the next heading of
// the same or higher level: [{header: [cells], rows: [row strings]}].
function tablesUnder(md, underHeading) {
  const level = underHeading.match(/^#+/)[0].length;
  const title = underHeading.replace(/^#+\s*/, "");
  const lines = stripFences(md).split("\n");
  const start = lines.findIndex((l) => {
    const m = l.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
    return m && m[1].length === level && m[2] === title;
  });
  if (start < 0) return [];
  const tables = [];
  let cur = null;
  for (let i = start + 1; i < lines.length; i++) {
    const h = lines[i].match(/^(#{1,6})\s/);
    if (h && h[1].length <= level) break;
    if (/^\s*\|/.test(lines[i])) {
      if (!cur) {
        cur = { header: splitCells(lines[i]), rows: [] };
        tables.push(cur);
      } else if (!isSeparator(lines[i])) cur.rows.push(lines[i]);
    } else cur = null;
  }
  return tables;
}

const tableRows = (md, underHeading) =>
  tablesUnder(md, underHeading).flatMap((t) => t.rows);

// The backticked name in the first cell, link-aware (the backticks sit inside
// the link text), first whitespace token only. null when the cell has none.
function firstCellName(row) {
  const m = splitCells(row)[0].match(/`([^`]+)`/);
  return m ? m[1].trim().split(/\s+/)[0] : null;
}

// The last Markdown link target in the first cell, or null.
function firstCellLink(row) {
  const all = [...splitCells(row)[0].matchAll(/\]\(([^)\s]+)\)/g)];
  return all.length ? all[all.length - 1][1] : null;
}

function skillBinding(name) {
  const fm = read(`.claude/skills/${name}/SKILL.md`).split(/^---\s*$/m)[1] || "";
  const m = fm.match(/^\s+binding:\s*["']?(\w+)/m);
  return m ? m[1] : null;
}

// URLs ("](...)", href/src values, bare URLs) removed; inline code removed on
// request; alt text kept.
function proseOf(line, opts = {}) {
  let s = line
    .replace(/\]\([^)]*\)/g, "]")
    .replace(/\b(?:href|src)="[^"]*"/g, "")
    .replace(/https?:\/\/\S+/g, "");
  if (opts.stripInlineCode) s = s.replace(/`[^`]*`/g, "");
  return s;
}

// GitHub heading slug for a heading's text.
function baseSlug(text) {
  return text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .toLowerCase()
    .replace(/[^\p{L}\p{N} _-]/gu, "")
    .replace(/ /g, "-");
}
function slugs(md) {
  const seen = new Map();
  const out = new Set();
  const all = [];
  for (let level = 1; level <= 6; level++) all.push(...headings(md, level));
  all.sort((a, b) => a.line - b.line);
  for (const h of all) {
    const b = baseSlug(h.text);
    const n = seen.get(b) || 0;
    seen.set(b, n + 1);
    out.add(n === 0 ? b : `${b}-${n}`);
  }
  return out;
}
function slug(text) {
  return baseSlug(text);
}

const termRegex = (term) =>
  new RegExp(`(?<![A-Za-z0-9])${term.replace(/ /g, "\\s+")}s?(?![A-Za-z0-9])`, "i");

const EXPLAINED = [
  "spec", "constitution", "slash command", "skill", "Kaizen", "harness", "persona",
  "model routing", "tier", "Bug Track", "HITL", "worktree", "CodeGraph",
];
const BANNED = ["fence", "drift", "Leader", "Implementer", "Reviewer", "digest", "Apply Mode"];

const problemsOk = (problems, head) =>
  assert.ok(problems.length === 0, `${head}\n  ${problems.join("\n  ")}`);

const README = read("README.md");
const OVERVIEW = read("docs/overview.md");
const HUB = read("docs/README.md");
const INV = inventory();

// ----------------------------------------------------- helper self-checks

test("helpers: slug, firstCellName, proseOf and term matching behave", () => {
  assert.equal(slug("Grok Bot (`--tool grokbot`)"), "grok-bot---tool-grokbot");
  assert.equal(slug("10. Video deliverables"), "10-video-deliverables");
  assert.deepEqual([...slugs("# A\n## Install\n### Install\n```\n## Install\n```\n")], ["a", "install", "install-1"]);
  assert.equal(firstCellName("| `/akili-marketing <mode> [args]` | x |"), "/akili-marketing");
  assert.equal(firstCellName("| [`tdd`](skills/tdd.md) | core |"), "tdd");
  assert.equal(firstCellName("| [`/akili-security [<path>…]`](docs/commands/akili-security.md) | x |"), "/akili-security");
  assert.equal(firstCellName("| **Every change** | |"), null);
  assert.equal(proseOf('<img alt="a harness" src="http://x/harness.png">'), '<img alt="a harness" >');
  assert.ok(termRegex("Reviewer").test("the reviewers agree"));
  assert.ok(!termRegex("spec").test("a specification"));
  assert.ok(termRegex("Apply Mode").test("apply  mode"));
});

// -------------------------------------------------------------------- (a)

test("(a) docs/overview.md ## Commands lists every packaged command exactly once", () => {
  const names = tableRows(OVERVIEW, "## Commands").map(firstCellName).filter(Boolean);
  const problems = [];
  for (const c of INV.commands)
    if (!names.includes(`/${c}`)) problems.push(`missing row for /${c} (.claude/commands/${c}.md)`);
  for (const n of new Set(names)) {
    if (!INV.commands.includes(n.slice(1))) problems.push(`extra row ${n} has no .claude/commands/${n.slice(1)}.md`);
    if (names.filter((x) => x === n).length > 1) problems.push(`duplicate row ${n}`);
  }
  problemsOk(problems, "docs/overview.md ## Commands does not match .claude/commands/:");
});

test("(a) docs/overview.md ## Skills by purpose lists every skill once, in the fixed groups, with its binding", () => {
  const GROUPS = [
    "Quality and process", "Frontend and design", "Backend and architecture", "Product", "Deliverables",
  ];
  const groupNames = [];
  const section = stripFences(OVERVIEW).split("\n");
  const secStart = section.findIndex((l) => l === "## Skills by purpose");
  const problems = [];
  const found = [];
  let group = null;
  for (let i = secStart + 1; i < section.length && secStart >= 0; i++) {
    if (/^## /.test(section[i])) break;
    const g = section[i].match(/^### (.*?)\s*$/);
    if (g) {
      group = g[1];
      groupNames.push(g[1]);
    }
    if (g || !/^\|/.test(section[i]) || isSeparator(section[i])) continue;
    const cells = splitCells(section[i]);
    const name = firstCellName(section[i]);
    if (!name || /^skill$/i.test(cells[0].replace(/[`*]/g, ""))) continue;
    found.push({ name, group, binding: cells[1].replace(/[`*]/g, "").trim() });
  }
  if (secStart < 0) problems.push("## Skills by purpose heading not found");
  for (const g of GROUPS) if (!groupNames.includes(g)) problems.push(`group "${g}" has no table`);
  for (const g of groupNames) if (!GROUPS.includes(g)) problems.push(`unexpected group "${g}"`);
  for (const s of INV.skills) {
    const rows = found.filter((f) => f.name === s);
    if (rows.length === 0) problems.push(`missing row for skill ${s} (.claude/skills/${s}/SKILL.md)`);
    if (rows.length > 1) problems.push(`skill ${s} listed ${rows.length} times, in groups: ${rows.map((r) => r.group).join(", ")}`);
    for (const r of rows) {
      const want = skillBinding(s);
      if (r.binding !== want) problems.push(`skill ${s}: binding cell "${r.binding}", SKILL.md declares "${want}"`);
    }
  }
  for (const f of found) if (!INV.skills.includes(f.name)) problems.push(`extra row ${f.name} (group ${f.group}) has no .claude/skills/${f.name}/`);
  problemsOk(problems, "docs/overview.md ## Skills by purpose does not match .claude/skills/:");
});

// -------------------------------------------------------------------- (b)

test("(b) README ### In your AI assistant has a row for every command, each link resolving", () => {
  const rows = tableRows(README, "### In your AI assistant").filter((r) => firstCellName(r));
  const names = rows.map(firstCellName);
  const problems = [];
  for (const c of INV.commands)
    if (!names.includes(`/${c}`)) problems.push(`README command table is missing /${c} (.claude/commands/${c}.md)`);
  for (const r of rows) {
    const link = firstCellLink(r);
    if (!link) problems.push(`row ${firstCellName(r)} has no link`);
    else if (!exists(link.split("#")[0])) problems.push(`row ${firstCellName(r)}: broken link ${link}`);
  }
  problemsOk(problems, "README ### In your AI assistant:");
});

// -------------------------------------------------------------------- (c)

test("(c) docs/skills/README.md Skill Inventory has one row per skill", () => {
  const names = tableRows(read("docs/skills/README.md"), "## Skill Inventory").map(firstCellName).filter(Boolean);
  const problems = [];
  for (const s of INV.skills) {
    const n = names.filter((x) => x === s).length;
    if (n === 0) problems.push(`missing inventory row for skill ${s} (.claude/skills/${s}/SKILL.md)`);
    if (n > 1) problems.push(`skill ${s} has ${n} inventory rows`);
  }
  for (const n of names) if (!INV.skills.includes(n)) problems.push(`extra inventory row ${n}`);
  problemsOk(problems, "docs/skills/README.md ## Skill Inventory:");
});

// -------------------------------------------------------------------- (d)

test("(d) every '<N> commands|skills' claim equals the derived total", () => {
  const files = ["README.md", "CONTRIBUTING.md"];
  for (const dir of ["docs", "docs/commands", "docs/skills"])
    for (const f of fs.readdirSync(path.join(REPO_ROOT, dir)).sort())
      if (f.endsWith(".md")) files.push(`${dir}/${f}`);
  const re = /\b(\d+) (?:(?:packaged|slash|AKILI) )?(command skills|commands?|skills|skill directories)\b/g;
  const subset = /\b(lifecycle|loop|anytime|core|conditional|stack|group)\b/i;
  const problems = [];
  for (const f of files) {
    read(f).split("\n").forEach((line, i) => {
      if (subset.test(line)) return;
      for (const m of line.matchAll(re)) {
        const isCmd = /^command/.test(m[2]);
        const want = isCmd ? INV.commands.length : INV.skills.length;
        if (Number(m[1]) !== want)
          problems.push(`${f}:${i + 1}: "${m[0]}" found ${m[1]}, derived ${want} ${isCmd ? "commands" : "skills"}`);
      }
    });
  }
  problemsOk(problems, "Stale count claims:");
});

// -------------------------------------------------------------------- (e)

test("(e) README heading structure matches FR-1", () => {
  const H2 = [
    "What is AKILI?", "How it works", "Install", "Your first spec",
    "Commands at a glance", "Learn more", "Contributing and license",
  ];
  const H3 = [
    ["Install", "What you need"], ["Install", "Install"], ["Install", "Check it worked"],
    ["Commands at a glance", "In your AI assistant"], ["Commands at a glance", "In your terminal"],
  ];
  const got2 = headings(README, 2).map((h) => h.text);
  const got3 = [];
  let parent = null;
  stripFences(README).split("\n").forEach((l) => {
    const m = l.match(/^(#{2,3})\s+(.*?)\s*$/);
    if (!m) return;
    if (m[1] === "##") parent = m[2];
    else got3.push([parent, m[2]]);
  });
  const first = (a, b) => {
    for (let i = 0; i < Math.max(a.length, b.length); i++)
      if (JSON.stringify(a[i]) !== JSON.stringify(b[i]))
        return `at position ${i + 1}: expected ${JSON.stringify(b[i])}, found ${JSON.stringify(a[i])}`;
    return null;
  };
  const m2 = first(got2, H2);
  assert.ok(!m2, `README ## headings differ ${m2}`);
  const m3 = first(got3, H3);
  assert.ok(!m3, `README ### headings differ ${m3}`);
  const h4 = headings(README, 4);
  assert.ok(h4.length === 0, `README has #### heading(s): ${h4.map((h) => `line ${h.line} ${h.text}`).join("; ")}`);
});

// -------------------------------------------------------------------- (f)

test("(f) README length, install position and no <details>", () => {
  const lines = README.replace(/\n$/, "").split("\n");
  assert.ok(lines.length <= 200, `README has ${lines.length} lines, cap is 200`);
  const idx = lines.findIndex((l) => l.includes("npx akili-specs init"));
  assert.ok(idx >= 0, "README has no `npx akili-specs init` line");
  assert.ok(idx + 1 <= 90, `first \`npx akili-specs init\` is at line ${idx + 1}, cap is 90`);
  const d = lines.findIndex((l) => /<details/i.test(l));
  assert.ok(d < 0, `README line ${d + 1} uses <details>`);
});

// -------------------------------------------------------------------- (g)

test("(g) jargon: explained terms are glossed or linked; banned terms are absent", () => {
  const raw = stripFences(README).split("\n");
  const glossary = tableRows(README, "## What is AKILI?")
    .map((r) => splitCells(r)[0].replace(/[`*]/g, "").toLowerCase());
  const problems = [];
  for (const term of EXPLAINED) {
    if (glossary.includes(term.toLowerCase())) continue;
    const re = termRegex(term);
    for (let i = 0; i < raw.length; i++) {
      const prose = proseOf(raw[i], { stripInlineCode: true });
      const m = re.exec(prose);
      if (!m) continue;
      const before = prose.slice(0, m.index);
      const inLink = (before.match(/\[/g) || []).length > (before.match(/\]/g) || []).length;
      if (!inLink) problems.push(`unexplained term "${term}" at README.md:${i + 1}: ${raw[i].trim().slice(0, 90)}`);
      break; // only the first occurrence is judged
    }
  }
  for (const term of BANNED) {
    const re = termRegex(term);
    raw.forEach((l, i) => {
      if (re.test(proseOf(l, { stripInlineCode: false })))
        problems.push(`banned term "${term}" at README.md:${i + 1}: ${l.trim().slice(0, 90)}`);
    });
  }
  problemsOk(problems, "README jargon rule:");
});

// -------------------------------------------------------------------- (h)

test("(h) Grok Bot is covered by none of init, --tool all or routing wrappers", () => {
  const [t] = tablesUnder(OVERVIEW, "## Install targets");
  assert.ok(t, "docs/overview.md has no ## Install targets table");
  assert.ok(t.rows.length === 6, `## Install targets has ${t.rows.length} rows, expected 6`);
  const col = (name) => {
    const i = t.header.findIndex((h) => h.replace(/`/g, "") === name);
    assert.ok(i >= 0, `## Install targets has no "${name}" column (header: ${t.header.join(" | ")})`);
    return i;
  };
  const grok = t.rows.find((r) => /Grok Bot/.test(splitCells(r)[0]));
  assert.ok(grok, "## Install targets has no Grok Bot row");
  const cells = splitCells(grok);
  for (const name of ["In init", "In --tool all", "Routing wrappers"])
    assert.equal(cells[col(name)], "no", `Grok Bot "${name}" cell reads "${cells[col(name)]}", expected "no"`);
  assert.ok(/\((?:docs\/)?cli\.md#grok-bot---tool-grokbot\)/.test(cells[0]),
    `Grok Bot row does not link cli.md#grok-bot---tool-grokbot: ${cells[0]}`);
  const lit = read("bin/akili.js").match(/const ALL_TOOLS = \[([^\]]*)\]/);
  assert.ok(lit, "bin/akili.js has no ALL_TOOLS literal");
  assert.ok(!/"grokbot"/.test(lit[1]), `bin/akili.js ALL_TOOLS includes "grokbot": [${lit[1]}]`);
  assert.ok(!/grok/i.test(read("bin/routing.js")), "bin/routing.js mentions grok");
});

// -------------------------------------------------------------------- (i)

test("(i) every relative link in README, overview and docs hub resolves, anchors included", () => {
  const problems = [];
  for (const file of ["README.md", "docs/overview.md", "docs/README.md"]) {
    const dir = path.posix.dirname(file);
    const text = stripFences(read(file));
    text.split("\n").forEach((line, i) => {
      const targets = [
        ...[...line.matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]),
        ...[...line.matchAll(/\bhref="([^"]+)"/g)].map((m) => m[1]),
      ];
      for (const t of targets) {
        if (/^(https?:|mailto:)/.test(t)) continue;
        const [p, anchor] = t.split("#");
        const rel = p === "" ? file : path.posix.normalize(path.posix.join(dir, p));
        if (!exists(rel)) {
          problems.push(`${file}:${i + 1}: ${t} -> ${rel} does not exist`);
          continue;
        }
        if (anchor && rel.endsWith(".md") && !slugs(read(rel)).has(anchor))
          problems.push(`${file}:${i + 1}: ${t} -> no heading in ${rel} slugs to "${anchor}"`);
      }
    });
  }
  problemsOk(problems, "Broken relative links:");
});

// -------------------------------------------------------------------- (j)

test("(j) README countable clauses", () => {
  const shields = (README.match(/shields\.io/g) || []).length;
  assert.ok(shields === 3, `README has ${shields} shields.io badges, expected 3`);
  const hero = README.split("\n").find((l) => /^Works with /.test(l)) || "";
  for (const n of ["Claude Code", "OpenCode", "Google Antigravity", "OpenAI Codex CLI", "Cursor", "Grok Bot", "macOS", "Linux", "Windows"])
    assert.ok(hero.includes(n), `hero text line does not name ${n}: "${hero}"`);
  const lines = README.split("\n");
  const wyg = lines.findIndex((l) => l.trim() === "**What you get**");
  assert.ok(wyg >= 0, "README has no **What you get** line");
  let bullets = 0;
  for (let i = wyg + 1; i < lines.length; i++) {
    if (lines[i].trim() === "" && bullets === 0) continue;
    if (/^- /.test(lines[i])) bullets++;
    else break;
  }
  assert.ok(bullets === 5, `**What you get** has ${bullets} bullets, expected 5`);
  const gl = tableRows(README, "## What is AKILI?").length;
  assert.ok(gl === 4, `README glossary has ${gl} rows, expected 4`);
  const fig = README.match(/<p align="center">[\s\S]*?<\/p>/g) || [];
  assert.ok(fig.some((b) => /\bsrc="[^"]*akili-flow\.png"/.test(b)),
    'akili-flow.png src is not inside a <p align="center"> block');
  assert.ok(!README.includes("doctor --tool"), "README mentions `doctor --tool`");
  const learn = tableRows(README, "## Learn more")[0] || "";
  assert.ok(/\]\(docs\/overview\.md\)/.test(learn), `first Learn more row does not link docs/overview.md: ${learn}`);
});

test("(j) docs hub and model-routing clauses", () => {
  const start = stripFences(HUB).split("\n");
  const s = start.findIndex((l) => l === "## Start Here");
  assert.ok(s >= 0, "docs/README.md has no ## Start Here");
  const block = [];
  for (let i = s + 1; i < start.length && !/^## /.test(start[i]); i++) block.push(start[i]);
  const links = block.join("\n").match(/\]\(([^)\s]+)\)/g) || [];
  assert.ok(links[0] === "](overview.md)", `Start Here first link is ${links[0]}, expected overview.md`);
  assert.ok(links.includes("](skills/governance.md)"), "Start Here does not link skills/governance.md");
  const anytime = tableRows(OVERVIEW, "### Any time").map(firstCellName).filter(Boolean);
  const hubRows = stripFences(HUB).split("\n").filter((l) => /^\s*\|/.test(l)).map(firstCellName);
  for (const c of anytime)
    assert.ok(hubRows.includes(c), `docs/README.md has no table row for anytime command ${c}`);
  const mr = read("docs/model-routing.md").split("\n").find((l) => /Grok Bot/.test(l) && /no routing wrappers/.test(l));
  assert.ok(mr, 'docs/model-routing.md has no line with "Grok Bot" and "no routing wrappers"');
});
