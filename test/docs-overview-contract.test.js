"use strict";

// @akili-spec changes/docs-overview
//
// Doc-contract gap tests for the landing README rewrite (Tester suite, /akili-test).
// Complements test/docs-overview.test.js (FR-16 (a)-(j)) with the FR-3..FR-9,
// FR-13, FR-14, FR-17, NFR-5 and NFR-6 clauses that suite does not prove.
// Expected literals are copied from requirements.md at spec commit 23baa72.
// Assertions are structural (headings, list items, table cells, link targets),
// never whole sentences, so harmless wording edits do not break them.
//
// No read of the spec folder: /akili-archive moves it out of changes/.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.join(__dirname, "..");
const read = (rel) => fs.readFileSync(path.join(REPO_ROOT, rel), "utf8");
const exists = (rel) => fs.existsSync(path.join(REPO_ROOT, rel));

// ---------------------------------------------------------------- helpers

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

// Raw lines of the section under `heading` (exact text, e.g. "## Install"),
// until the next heading of the same or higher level. Fence-aware for heading
// detection; the returned lines keep fence content. null when absent.
function section(md, heading) {
  const level = heading.match(/^#+/)[0].length;
  const title = heading.replace(/^#+\s*/, "");
  const raw = md.split("\n");
  const blank = stripFences(md).split("\n");
  const isHeading = (l) => l.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
  const start = blank.findIndex((l) => {
    const m = isHeading(l);
    return m && m[1].length === level && m[2] === title;
  });
  if (start < 0) return null;
  const out = [];
  for (let i = start + 1; i < raw.length; i++) {
    const m = isHeading(blank[i]);
    if (m && m[1].length <= level) break;
    out.push(raw[i]);
  }
  return out;
}

// Fenced blocks in a list of raw lines: [{info, body: [lines]}].
function fencedBlocks(lines) {
  const out = [];
  let cur = null;
  for (const line of lines) {
    const m = line.match(/^\s*(`{3,}|~{3,})(.*)$/);
    if (cur) {
      if (m && m[1][0] === cur.fence[0] && m[1].length >= cur.fence.length) {
        out.push({ info: cur.info, body: cur.body });
        cur = null;
      } else cur.body.push(line);
    } else if (m) cur = { fence: m[1], info: m[2].trim(), body: [] };
  }
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

// Tables in a list of lines (fences blanked first): [{header, rows, startIndex}].
function tablesIn(lines) {
  const blank = stripFences(lines.join("\n")).split("\n");
  const tables = [];
  let cur = null;
  blank.forEach((l, i) => {
    if (/^\s*\|/.test(l)) {
      if (!cur) {
        cur = { header: splitCells(l), rows: [], startIndex: i };
        tables.push(cur);
      } else if (!isSeparator(l)) cur.rows.push(l);
    } else cur = null;
  });
  return tables;
}

const linkTargets = (text) => [...text.matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]);

function mustSection(file, md, heading) {
  const s = section(md, heading);
  assert.ok(s, `${file} has no "${heading}" section`);
  return s;
}

const README = read("README.md");

// -------------------------------------------------------------------- FR-3

test("FR-3 What is AKILI? opens with at most 3 sentences and names marketing", () => {
  const s = mustSection("README.md", README, "## What is AKILI?");
  // Opening paragraph: the first run of non-blank lines.
  let i = 0;
  while (i < s.length && s[i].trim() === "") i++;
  const para = [];
  for (; i < s.length && s[i].trim() !== ""; i++) para.push(s[i].trim());
  assert.ok(para.length > 0, "README.md ## What is AKILI? has no opening paragraph");
  assert.ok(!/^(\||-|\*|\d+\.|\*\*What you get)/.test(para[0]),
    `README.md ## What is AKILI? opens with a list/table/label, not a paragraph: ${para[0]}`);
  const text = para.join(" ").replace(/`[^`]*`/g, "x").replace(/\]\([^)]*\)/g, "]");
  const sentences = text.split(/(?<=[.!?])\s+(?=\S)/).filter((x) => /\w/.test(x));
  assert.ok(sentences.length <= 3,
    `README.md FR-3: opening paragraph has ${sentences.length} sentences, expected <= 3: ${JSON.stringify(sentences)}`);
  assert.ok(exists(".claude/commands/akili-marketing.md"), "/akili-marketing is not packaged");
  assert.ok(/marketing/i.test(s.join("\n")), "README.md FR-3 AND IT MUST: ## What is AKILI? does not name marketing");
});

// -------------------------------------------------------------------- FR-4

test("FR-4 How it works keeps the linked flow figure with a new, present alt text", () => {
  const s = mustSection("README.md", README, "## How it works").join("\n");
  const block = s.match(/<p align="center">([\s\S]*?)<\/p>/);
  assert.ok(block, 'README.md ## How it works has no <p align="center"> block');
  const FIG = "https://raw.githubusercontent.com/JuankCadavid/akili-specs/master/assets/akili-flow.png";
  const href = block[1].match(/<a\s[^>]*href="([^"]+)"/);
  assert.ok(href && href[1] === FIG, `README.md FR-4: figure is not linked to ${FIG} (href: ${href && href[1]})`);
  const img = block[1].match(/<img\b[^>]*>/);
  assert.ok(img, "README.md FR-4: figure block has no <img>");
  const src = img[0].match(/\bsrc="([^"]+)"/);
  assert.ok(src && src[1] === FIG, `README.md FR-4: <img> src is ${src && src[1]}, expected ${FIG}`);
  const alt = img[0].match(/\balt="([^"]*)"/);
  assert.ok(alt && alt[1].trim().length > 0, "README.md FR-4: figure <img> has no alt text");
  for (const old of ["Kaizen", "Bug Track"])
    assert.ok(!alt[1].includes(old), `README.md FR-4: alt text still carries the old wording "${old}"`);
  assert.ok(linkTargets(s).includes("docs/flow.md"), "README.md FR-4: ## How it works does not link docs/flow.md");
});

// -------------------------------------------------------------------- FR-5

test("FR-5 Install: one install command, one check, a docs/cli.md link, no tables, Grok Bot only named", () => {
  const s = mustSection("README.md", README, "## Install");
  const blocks = fencedBlocks(s);
  const cmdLines = blocks.flatMap((b) => b.body.map((l) => l.trim()).filter((l) => l && !l.startsWith("#")));
  const installs = cmdLines.filter((l) => /\bakili-specs\s+init\b/.test(l));
  const checks = cmdLines.filter((l) => /\bakili-specs\s+doctor\b/.test(l));
  assert.equal(installs.length, 1, `README.md FR-5: ## Install has ${installs.length} install command lines in code blocks: ${JSON.stringify(installs)}`);
  assert.equal(checks.length, 1, `README.md FR-5: ## Install has ${checks.length} check command lines in code blocks: ${JSON.stringify(checks)}`);
  assert.equal(cmdLines.length, 2, `README.md FR-5: ## Install code blocks hold extra commands: ${JSON.stringify(cmdLines)}`);
  const text = s.join("\n");
  assert.ok(linkTargets(text).some((t) => /^docs\/cli\.md(#.*)?$/.test(t)), "README.md FR-5: ## Install does not link docs/cli.md");
  assert.equal(tablesIn(s).length, 0, "README.md FR-5 BUT: ## Install contains a table (prerequisite tables belong in docs/cli.md)");
  assert.ok(!/doctor\s+--tool/.test(text), "README.md FR-5 BUT: ## Install lists a per-tool doctor --tool command");
  assert.ok(/Grok Bot/.test(text), "README.md FR-5: ## Install does not name Grok Bot as a supported tool");
  const grokLines = s.filter((l) => /grok/i.test(l));
  for (const l of grokLines)
    assert.ok(!/grokbot|--tool|\.grok\b|~\//i.test(l), `README.md FR-5 AND IT MUST: ## Install has Grok-specific instructions: ${l.trim()}`);
});

// -------------------------------------------------------------------- FR-6

test("FR-6 Your first spec: 5 numbered steps, quick and resume lines, practical-example link, no sample document", () => {
  const s = mustSection("README.md", README, "## Your first spec");
  const blank = stripFences(s.join("\n")).split("\n");
  const steps = blank.filter((l) => /^\d+\.\s/.test(l));
  assert.equal(steps.length, 5, `README.md FR-6: ## Your first spec has ${steps.length} numbered steps, expected 5`);
  steps.forEach((l, i) =>
    assert.ok(l.startsWith(`${i + 1}. `), `README.md FR-6: step ${i + 1} is numbered "${l.match(/^\d+/)[0]}"`));
  const expected = [
    ["/akili-constitution"],
    ["/akili-propose"],
    ["/akili-specify"],
    ["/akili-execute"],
    ["/akili-test", "/akili-validate", "/akili-archive"],
  ];
  expected.forEach((cmds, i) => {
    for (const c of cmds)
      assert.ok(new RegExp("`" + c + "(\\s[^`]*)?`").test(steps[i]),
        `README.md FR-6: step ${i + 1} does not name \`${c}\`: ${steps[i]}`);
    assert.ok(/`[^`/]*\.md`|`[^`]*\/[^`]*\.md`/.test(steps[i]),
      `README.md FR-6: step ${i + 1} names no output file: ${steps[i]}`);
  });
  const rest = blank.filter((l) => !/^\d+\.\s/.test(l));
  assert.ok(rest.some((l) => /`\/akili-quick\b/.test(l)), "README.md FR-6: no /akili-quick line outside the steps");
  assert.ok(rest.some((l) => /`\/akili-resume\b/.test(l)), "README.md FR-6: no /akili-resume line outside the steps");
  assert.ok(linkTargets(s.join("\n")).includes("docs/flow.md#practical-example"),
    "README.md FR-6: ## Your first spec does not link docs/flow.md#practical-example");
  assert.equal(fencedBlocks(s).length, 0, "README.md FR-6 BUT: ## Your first spec contains a fenced block (sample document)");
  assert.ok(!s.some((l) => /^\s*>?\s*#{1,6}\s/.test(l) || /^\s*>\s*\*\*Spec/.test(l)),
    "README.md FR-6 BUT: ## Your first spec embeds document headings (sample document)");
});

// -------------------------------------------------------------------- FR-7

test("FR-7 In your AI assistant has the two group rows and the native-Windows note", () => {
  const s = mustSection("README.md", README, "### In your AI assistant");
  const [t] = tablesIn(s);
  assert.ok(t, "README.md FR-7: ### In your AI assistant has no table");
  const groups = t.rows.filter((r) => {
    const c = splitCells(r);
    return /^\*\*[^*]+\*\*$/.test(c[0]) && c.slice(1).every((x) => x === "");
  }).map((r) => splitCells(r)[0]);
  assert.deepEqual(groups, ["**Every change**", "**Any time**"],
    `README.md FR-7: group label rows are ${JSON.stringify(groups)}`);
  const sec = t.rows.find((r) => /`\/akili-security\b/.test(splitCells(r)[0]));
  assert.ok(sec, "README.md FR-7: no /akili-security row");
  assert.ok(/not supported on native Windows/i.test(splitCells(sec)[1]),
    `README.md FR-7: /akili-security row lacks the native-Windows note: ${splitCells(sec)[1]}`);
  // Every change group: the lifecycle commands, in order (literal from FR-6/FR-7).
  const gi = t.rows.findIndex((r) => splitCells(r)[0] === "**Every change**");
  const ai = t.rows.findIndex((r) => splitCells(r)[0] === "**Any time**");
  const lifecycle = t.rows.slice(gi + 1, ai).map((r) => (splitCells(r)[0].match(/`(\/akili-[a-z-]+)/) || [])[1]);
  assert.deepEqual(lifecycle, ["/akili-constitution", "/akili-propose", "/akili-specify", "/akili-execute",
    "/akili-test", "/akili-validate", "/akili-archive"], "README.md FR-7: Every change group is not the 7 lifecycle commands");
});

test("FR-7 In your terminal lists the 8 CLI subcommands and links docs/cli.md", () => {
  const s = mustSection("README.md", README, "### In your terminal");
  const [t] = tablesIn(s);
  assert.ok(t, "README.md FR-7: ### In your terminal has no table");
  const names = t.rows.map((r) => (splitCells(r)[0].match(/`akili ([a-z-]+)/) || [])[1]);
  assert.deepEqual(names, ["init", "install", "update", "list", "doctor", "routing", "check-update", "notifications"],
    `README.md FR-7: terminal rows are ${JSON.stringify(names)}`);
  const doctor = t.rows.find((r) => /`akili doctor/.test(r));
  assert.ok(/--agents/.test(doctor), "README.md FR-7: akili doctor row does not mention --agents");
  assert.ok(linkTargets(s.join("\n")).some((x) => /^docs\/cli\.md(#.*)?$/.test(x)),
    "README.md FR-7: ### In your terminal does not link docs/cli.md");
});

// -------------------------------------------------------------------- FR-9

test("FR-9 BUT: the README keeps no ### Supercharge heading", () => {
  const hit = stripFences(README).split("\n").find((l) => /^#{1,6}\s+Supercharge/i.test(l));
  assert.ok(!hit, `README.md FR-9 BUT: Supercharge heading present: ${hit}`);
});

// ------------------------------------------------------------------- FR-13

test("FR-13 docs hub anytime table has command / use it to / reference columns, each linking an existing command page", () => {
  const HUB = read("docs/README.md");
  const lines = HUB.split("\n");
  const t = tablesIn(lines).find((x) => x.header.join("|") === "Command|Use it to|Reference");
  assert.ok(t, "docs/README.md FR-13: no table with header | Command | Use it to | Reference |");
  assert.ok(t.rows.length > 0, "docs/README.md FR-13: anytime table has no rows");
  for (const r of t.rows) {
    const c = splitCells(r);
    assert.equal(c.length, 3, `docs/README.md FR-13: row does not have 3 cells: ${r}`);
    const cmd = (c[0].match(/`\/(akili-[a-z-]+)/) || [])[1];
    assert.ok(cmd, `docs/README.md FR-13: first cell names no command: ${c[0]}`);
    assert.ok(exists(`.claude/commands/${cmd}.md`), `docs/README.md FR-13: ${cmd} is not a packaged command`);
    assert.ok(c[1].length > 0, `docs/README.md FR-13: ${cmd} row has an empty "Use it to" cell`);
    const [link] = linkTargets(c[2]);
    assert.equal(link, `commands/${cmd}.md`, `docs/README.md FR-13: ${cmd} row links ${link}`);
    assert.ok(exists(`docs/${link}`), `docs/README.md FR-13: docs/${link} does not exist`);
  }
  // Documentation Map: overview first, governance linked.
  const map = mustSection("docs/README.md", HUB, "## Documentation Map").join("\n");
  const ml = linkTargets(map);
  assert.equal(ml[0], "overview.md", `docs/README.md FR-13: Documentation Map first link is ${ml[0]}`);
  assert.ok(ml.includes("skills/governance.md"), "docs/README.md FR-13: Documentation Map does not link skills/governance.md");
});

// ------------------------------------------------------------------- FR-14

test("FR-14 the Grok Bot routing line claims nothing bin/routing.js lacks", () => {
  const lines = read("docs/model-routing.md").split("\n").filter((l) => /Grok Bot/.test(l));
  assert.ok(lines.length > 0, "docs/model-routing.md FR-14: no Grok Bot line");
  const line = lines.find((l) => /no routing wrappers/.test(l));
  assert.ok(line, "docs/model-routing.md FR-14: no Grok Bot line stating no routing wrappers");
  assert.ok(/does not target|is not a target/.test(line), `docs/model-routing.md FR-14: line does not say akili routing does not target Grok Bot: ${line}`);
  for (const l of lines)
    assert.ok(/\bno\b|\bnot\b/.test(l), `docs/model-routing.md FR-14 BUT: a Grok Bot line makes a positive routing claim: ${l}`);
  const { HOST_KEYS } = require("../bin/routing.js");
  assert.ok(Array.isArray(HOST_KEYS) && HOST_KEYS.length > 0, "bin/routing.js exports no HOST_KEYS");
  assert.ok(!HOST_KEYS.some((h) => /grok/i.test(h)), `bin/routing.js HOST_KEYS includes Grok: ${HOST_KEYS.join(", ")}`);
});

// ------------------------------------------------------------------- FR-17

test("FR-17 openspec-comparison Roadmap holds 3 planned improvements", () => {
  const s = mustSection("docs/openspec-comparison.md", read("docs/openspec-comparison.md"), "## Roadmap");
  const bullets = stripFences(s.join("\n")).split("\n").filter((l) => /^\s*[-*]\s+\S/.test(l));
  assert.equal(bullets.length, 3, `docs/openspec-comparison.md FR-17: ## Roadmap has ${bullets.length} bullets, expected 3`);
});

test("FR-17 dotfiles/README.md holds the Neovim and tmux restore steps", () => {
  const md = read("dotfiles/README.md");
  for (const [h, re] of [["## Restore Neovim", /\.config\/nvim/], ["## Restore tmux", /\.tmux/]]) {
    const s = mustSection("dotfiles/README.md", md, h);
    const cmds = fencedBlocks(s).flatMap((b) => b.body).filter((l) => re.test(l));
    assert.ok(cmds.length > 0, `dotfiles/README.md FR-17: ${h} has no restore command in a code block`);
  }
});

test("FR-17 CONTRIBUTING.md holds Repository Structure and, with the checklist, the release flow", () => {
  const md = read("CONTRIBUTING.md");
  const rs = mustSection("CONTRIBUTING.md", md, "## Repository Structure");
  assert.ok(rs.some((l) => /^\s*-\s+`[^`]+`/.test(l)), "CONTRIBUTING.md FR-17: ## Repository Structure lists no paths");
  const rel = mustSection("CONTRIBUTING.md", md, "## Branches and Releases").join("\n");
  for (const re of [/release\/vX\.Y\.Z/, /npm publish/, /dev.*master/])
    assert.ok(re.test(rel), `CONTRIBUTING.md FR-17: ## Branches and Releases lacks ${re}`);
  assert.ok(linkTargets(rel).includes("docs/release-checklist.md"), "CONTRIBUTING.md FR-17: release section does not link docs/release-checklist.md");
  const cl = read("docs/release-checklist.md");
  const pub = mustSection("docs/release-checklist.md", cl, "## Publish").join("\n");
  assert.ok(/npm publish/.test(pub), "docs/release-checklist.md FR-17: ## Publish has no npm publish step");
  assert.ok(/npm run release:(patch|minor|major)/.test(cl), "docs/release-checklist.md FR-17: no npm run release:* step");
});

test("FR-17 docs/cli.md holds the 3 prerequisite tables and the local-checkout install", () => {
  const md = read("docs/cli.md");
  const pre = mustSection("docs/cli.md", md, "## Prerequisites");
  const firstSub = pre.findIndex((l) => /^###\s/.test(l));
  const top = firstSub < 0 ? pre : pre.slice(0, firstSub);
  const tables = tablesIn(top);
  assert.equal(tables.length, 3, `docs/cli.md FR-17: ## Prerequisites has ${tables.length} tables before its first ###, expected 3`);
  const labels = tables.map((t) => {
    for (let i = t.startIndex - 1; i >= 0; i--) if (top[i].trim()) return top[i].trim();
    return "";
  });
  ["Required", "Recommended", "Conditional"].forEach((lab, i) =>
    assert.ok(new RegExp(`^\\*\\*${lab}\\b`).test(labels[i]), `docs/cli.md FR-17: table ${i + 1} is labelled "${labels[i]}", expected **${lab}…**`));
  const local = mustSection("docs/cli.md", md, "### Local Checkout Install");
  assert.ok(fencedBlocks(local).some((b) => b.body.some((l) => /node bin\/akili\.js install/.test(l))),
    "docs/cli.md FR-17: ### Local Checkout Install has no `node bin/akili.js install` block");
});

test("FR-17 the dead #grok-bot-grokbot anchor is linked from no shipped doc", () => {
  for (const f of shippedDocs()) {
    const bad = linkTargets(read(f)).filter((t) => /#grok-bot-grokbot$/.test(t));
    assert.equal(bad.length, 0, `${f} FR-17: links the dead anchor: ${bad.join(", ")}`);
  }
});

test("FR-17 governance item 5 and diagram-design.md name docs/overview.md", () => {
  const g = read("docs/skills/governance.md").split("\n").find((l) => /^5\.\s/.test(l));
  assert.ok(g, "docs/skills/governance.md FR-17: no checklist item 5");
  assert.ok(/\*\*Docs \+ CHANGELOG\*\*/.test(g), `docs/skills/governance.md FR-17: item 5 is not Docs + CHANGELOG: ${g}`);
  assert.ok(/`docs\/overview\.md`|\(.*overview\.md\)/.test(g), `docs/skills/governance.md FR-17: item 5 does not name docs/overview.md: ${g}`);
  const d = read("docs/skills/diagram-design.md");
  const archify = d.split("\n").find((l) => /Archify/.test(l) && /install/i.test(l));
  assert.ok(archify, "docs/skills/diagram-design.md FR-17: no Archify install pointer line");
  assert.ok(/docs\/overview\.md/.test(archify), `docs/skills/diagram-design.md FR-17: Archify pointer does not name docs/overview.md: ${archify}`);
  assert.ok(!/root `README\.md`/.test(d), "docs/skills/diagram-design.md FR-17: still points at the root README.md");
});

test("FR-17 CHANGELOG Unreleased has a Changed entry naming docs/overview.md and no placeholder", () => {
  const s = mustSection("CHANGELOG.md", read("CHANGELOG.md"), "## [Unreleased]");
  const text = s.join("\n");
  assert.ok(!/No unreleased changes yet\./.test(text), "CHANGELOG.md FR-17: ## [Unreleased] still has the placeholder");
  const changed = mustSection("CHANGELOG.md", ["## [Unreleased]", ...s].join("\n"), "### Changed");
  const bullets = changed.filter((l) => /^\s*-\s+\S/.test(l));
  assert.ok(bullets.length > 0, "CHANGELOG.md FR-17: ### Changed has no entry");
  assert.ok(bullets.some((b) => /docs\/overview\.md/.test(b)), "CHANGELOG.md FR-17: no ### Changed entry names docs/overview.md");
});

test("FR-17 BUT: the root README has no ## Dotfiles section and no nvim", () => {
  assert.ok(!/^##\s+Dotfiles\b/im.test(README), "README.md FR-17 BUT: ## Dotfiles heading present");
  assert.ok(!/nvim/i.test(README), "README.md FR-17 BUT: README mentions nvim");
});

// ------------------------------------------------------------------- NFR-5

function shippedDocs() {
  const out = ["README.md", "CONTRIBUTING.md", "CHANGELOG.md"];
  const walk = (rel) => {
    for (const e of fs.readdirSync(path.join(REPO_ROOT, rel), { withFileTypes: true })) {
      const p = `${rel}/${e.name}`;
      if (e.isDirectory()) {
        if (p !== "docs/specs") walk(p);
      } else if (e.name.endsWith(".md")) out.push(p);
    }
  };
  walk("docs");
  return out;
}

test("NFR-5 no shipped doc links the active spec folder", () => {
  const docs = shippedDocs();
  assert.ok(docs.includes("docs/overview.md"), "NFR-5: shipped-doc walk did not find docs/overview.md");
  assert.ok(!docs.some((f) => f.startsWith("docs/specs/")), "NFR-5: shipped-doc walk entered docs/specs/");
  for (const f of docs)
    assert.ok(!/specs\/changes\/docs-overview/.test(read(f)), `${f} NFR-5: references docs/specs/changes/docs-overview`);
});

// ------------------------------------------------------------------- NFR-6

test("NFR-6 package.json files ships README, docs and assets but not dotfiles/", () => {
  const files = JSON.parse(read("package.json")).files;
  assert.ok(Array.isArray(files), "package.json NFR-6: no files array");
  for (const want of ["README.md", "docs", "assets", "!docs/specs"])
    assert.ok(files.includes(want), `package.json NFR-6: files lacks "${want}"`);
  const leak = files.filter((f) => !f.startsWith("!") && /^(\.|\*|\*\*|\.\/|dotfiles)(\/|$)/.test(f.replace(/\/\*\*?$/, "")));
  assert.equal(leak.length, 0, `package.json NFR-6: files entry would ship dotfiles/: ${leak.join(", ")}`);
  assert.ok(!files.some((f) => /dotfiles/.test(f) && !f.startsWith("!")), "package.json NFR-6: files names dotfiles");
});
