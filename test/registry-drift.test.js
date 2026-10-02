"use strict";

// T1 / FR-7 / design §5.1 + §5.4 / DD-3: the packaged roster
// (.claude/templates/model-registry.json) must agree with the registry table
// in docs/model-routing.md, and the section template
// (.claude/templates/model-routing.section.md) must stay inside its fixed
// placeholder set. The doc table is the independent source of truth: every
// expected value below is read from the doc, never from the JSON.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DOC_PATH = path.join(ROOT, "docs", "model-routing.md");
const REGISTRY_PATH = path.join(ROOT, ".claude", "templates", "model-registry.json");
const SECTION_PATH = path.join(ROOT, ".claude", "templates", "model-routing.section.md");

const TIERS = ["T1", "T2", "T3", "T4", "T5", "T6"];
// Header text prefix -> host key, in the doc's column order (columns 2-6).
const HOST_COLUMNS = [
  ["Claude Code", "claude"],
  ["OpenCode", "opencode"],
  ["Antigravity", "antigravity"],
  ["Codex", "codex"],
  ["Cursor", "cursor"],
];
// §5.1 cell grammar: the capitalized family words.
const FAMILY_WORDS = ["Astra", "Sol", "Terra", "Luna"];
const PLACEHOLDER_RE = /<CONFIRM[^>]*>/g;
// §5.4 placeholders plus the two the T1 brief adds.
const SECTION_PLACEHOLDERS = [
  "{{antigravityDialMap}}",
  "{{authorAuditorNotes}}",
  "{{cliInvocationRow}}",
  "{{crossHostLine}}",
  "{{pinReasons}}",
  "{{registryTable}}",
  "{{regenerateHint}}",
  "{{updated}}",
];

function splitRow(line) {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
}

// Anchor on the header text (P-8, C13), never on a line number.
function readRegistryTable(docText) {
  const lines = docText.split("\n");
  const headerIndex = lines.findIndex((l) => l.startsWith("| Tier | Claude Code |"));
  assert.notEqual(headerIndex, -1, "registry table header `| Tier | Claude Code |` not found in docs/model-routing.md");
  const header = splitRow(lines[headerIndex]);
  const columns = {};
  for (const [prefix, host] of HOST_COLUMNS) {
    const idx = header.findIndex((h) => h.startsWith(prefix));
    assert.notEqual(idx, -1, `column starting "${prefix}" missing from the registry header`);
    columns[host] = idx;
  }
  const fallbackIdx = header.findIndex((h) => h.startsWith("Fallback"));
  assert.notEqual(fallbackIdx, -1, "Fallback column missing from the registry header");
  const rows = {};
  for (let i = headerIndex + 2; i < lines.length && lines[i].startsWith("|"); i++) {
    const cells = splitRow(lines[i]);
    const tier = (cells[0].match(/\bT([1-6])\b/) || [])[0];
    assert.ok(tier, `row without a tier id: ${lines[i]}`);
    rows[tier] = { cells, fallback: cells[fallbackIdx] };
  }
  assert.deepEqual(Object.keys(rows), TIERS, "registry table must carry exactly rows T1-T6, in order");
  return { columns, rows };
}

// §5.1 cell grammar: backticked id, family phrase / family word, placeholder.
// Anything else (effort labels, annotations, promo text) is ignored.
function parseCell(cell) {
  const placeholders = cell.match(PLACEHOLDER_RE) || [];
  const ids = [];
  for (const m of cell.matchAll(/`([^`]+)`/g)) {
    if (!/^<CONFIRM/.test(m[1])) ids.push(m[1]);
  }
  // Text outside backticks carries the family tokens.
  let prose = cell.replace(/`[^`]*`/g, " ");
  const families = [];
  // Cursor form: "<Family phrase> family" — the phrase is one family token;
  // family words inside it (e.g. "GPT-5.6 Sol/Terra") belong to the phrase.
  const phrase = prose.match(/^\s*([^;*`]+?)\s+family\b/);
  if (phrase) {
    families.push(phrase[1].trim());
    prose = prose.replace(phrase[0], " ");
  }
  for (const word of FAMILY_WORDS) {
    if (new RegExp(`\\b${word}\\b`).test(prose)) families.push(word);
  }
  return { ids, families, placeholders };
}

// §5.1 "appears in" for the head/second check: backticked id, family word,
// placeholder token, or the model's label verbatim.
function appearsIn(entry, cell, models) {
  const parsed = parseCell(cell);
  if (/^<CONFIRM/.test(entry)) return parsed.placeholders.includes(entry);
  if (parsed.ids.includes(entry)) return true;
  const model = models.find((m) => m.id === entry);
  if (!model) return false;
  if (model.family && parsed.families.includes(model.family)) return true;
  return Boolean(model.label) && cell.includes(model.label);
}

const docText = fs.readFileSync(DOC_PATH, "utf8");
const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
const sectionText = fs.readFileSync(SECTION_PATH, "utf8");
const table = readRegistryTable(docText);

test("registry: every backticked id and family word in a host cell exists in that host's models[]", () => {
  for (const [, host] of HOST_COLUMNS) {
    const models = registry.hosts[host].models;
    for (const tier of TIERS) {
      const cell = table.rows[tier].cells[table.columns[host]];
      const { ids, families } = parseCell(cell);
      for (const id of ids) {
        assert.ok(models.some((m) => m.id === id), `${host} ${tier}: id \`${id}\` in the doc cell is not in models[]`);
      }
      for (const family of families) {
        assert.ok(models.some((m) => m.family === family), `${host} ${tier}: family "${family}" in the doc cell is not a models[] family`);
      }
    }
  }
});

test("registry: the cell grammar reads a family token in every Codex and Cursor cell (disqualifier guard)", () => {
  for (const host of ["codex", "cursor"]) {
    for (const tier of TIERS) {
      const cell = table.rows[tier].cells[table.columns[host]];
      assert.ok(parseCell(cell).families.length >= 1, `${host} ${tier}: no family token parsed from "${cell}"`);
    }
  }
});

test("registry: every placeholder in a host cell appears in that tier's tierPreference", () => {
  for (const [, host] of HOST_COLUMNS) {
    for (const tier of TIERS) {
      const cell = table.rows[tier].cells[table.columns[host]];
      const list = registry.hosts[host].tierPreference[tier];
      for (const placeholder of parseCell(cell).placeholders) {
        assert.ok(list.includes(placeholder), `${host} ${tier}: placeholder ${placeholder} missing from tierPreference ${JSON.stringify(list)}`);
      }
    }
  }
});

test("registry: tierPreference head is in the host cell; second is in the host cell or the row's Fallback column", () => {
  for (const [, host] of HOST_COLUMNS) {
    const models = registry.hosts[host].models;
    for (const tier of TIERS) {
      const row = table.rows[tier];
      const cell = row.cells[table.columns[host]];
      const list = registry.hosts[host].tierPreference[tier];
      assert.ok(Array.isArray(list) && list.length >= 1, `${host} ${tier}: tierPreference is empty`);
      assert.ok(appearsIn(list[0], cell, models), `${host} ${tier}: head "${list[0]}" does not appear in the doc cell "${cell}"`);
      if (list.length > 1) {
        assert.ok(
          appearsIn(list[1], cell, models) || appearsIn(list[1], row.fallback, models),
          `${host} ${tier}: second "${list[1]}" appears in neither the doc cell "${cell}" nor the Fallback cell "${row.fallback}"`
        );
      }
    }
  }
});

test("registry: every non-placeholder tierPreference entry is an id in models[]; crossHost.T6 is a host", () => {
  for (const [, host] of HOST_COLUMNS) {
    const ids = registry.hosts[host].models.map((m) => m.id).filter(Boolean);
    for (const tier of TIERS) {
      for (const entry of registry.hosts[host].tierPreference[tier]) {
        if (/^<CONFIRM/.test(entry)) continue;
        assert.ok(ids.includes(entry), `${host} ${tier}: tierPreference entry "${entry}" is not a models[] id`);
      }
    }
  }
  assert.equal(registry.crossHost.T6, "antigravity");
  assert.ok(registry.hosts[registry.crossHost.T6], "crossHost.T6 names no host");
});

test("section template: no Default Branch / Integration Branch text (P-7)", () => {
  assert.equal(/Default Branch:|Integration Branch:/.test(sectionText), false);
});

test("section template: its {{placeholders}} are exactly the fixed set", () => {
  const found = [...new Set(sectionText.match(/\{\{[a-zA-Z]*\}\}/g) || [])].sort();
  assert.deepEqual(found, [...SECTION_PLACEHOLDERS].sort());
});
