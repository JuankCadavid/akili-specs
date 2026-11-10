'use strict';

// changes/akili-panel-model-skills T2 (FR-5, DD-1): SKILL_CATALOG in flow.mjs is pinned to the skill folders on disk.
// The expected side is read from `.claude/skills/*/SKILL.md` frontmatter (CRLF-normalised), never from the catalog itself,
// so a catalog that drifts from the package fails by name. The test never reads docs/specs/ (KZ-changes--archify-diagrams-1).

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const SKILLS = path.join(__dirname, '..', '.claude', 'skills');
const FLOW = path.join(SKILLS, 'akili-panel', 'hooks', 'flow.mjs');
const loaded = import(pathToFileURL(FLOW).href);

// The frontmatter of one SKILL.md: top-level `name`, and `binding` read from the `metadata:` block.
function frontmatter(file) {
  const lines = fs.readFileSync(file, 'utf8').replace(/\r\n?/g, '\n').split('\n');
  assert.equal(lines[0], '---', `${file}: frontmatter opens the file`);
  const end = lines.indexOf('---', 1);
  assert.ok(end > 0, `${file}: frontmatter closes`);
  const fm = lines.slice(1, end);
  const unquote = (v) => v.trim().replace(/^["']|["']$/g, '');
  const name = fm.map((l) => /^name:\s*(.*)$/.exec(l)).find(Boolean);
  const meta = fm.indexOf('metadata:');
  let binding = null;
  for (let i = meta + 1; meta >= 0 && i < fm.length && /^\s/.test(fm[i]); i++) {
    const m = /^\s+binding:\s*(.*)$/.exec(fm[i]);
    if (m) binding = unquote(m[1]);
  }
  return { name: name ? unquote(name[1]) : null, binding };
}

// Folders that hold a SKILL.md; a plugin entry (akili-panel: `.claude-plugin/plugin.json`, no SKILL.md) is not a skill.
function onDisk() {
  const out = {};
  for (const ent of fs.readdirSync(SKILLS, { withFileTypes: true })) {
    const file = path.join(SKILLS, ent.name, 'SKILL.md');
    if (!ent.isDirectory() || !fs.existsSync(file)) continue;
    out[ent.name] = { ...frontmatter(file), file };
  }
  return out;
}

test('FR-5 every skill folder is in the catalog with the same binding (a miss names the skill)', async () => {
  const { SKILL_CATALOG } = await loaded;
  const catalog = Object.fromEntries(SKILL_CATALOG.map((e) => [e.name, e.binding]));
  const missing = [];
  const rebound = [];
  for (const [name, d] of Object.entries(onDisk())) {
    if (!(name in catalog)) missing.push(name);
    else if (catalog[name] !== d.binding) rebound.push(`${name}: catalog ${catalog[name]}, SKILL.md ${d.binding}`);
  }
  assert.deepEqual(missing, [], `skills missing from SKILL_CATALOG: ${missing.join(', ')}`);
  assert.deepEqual(rebound, [], `skills with a different binding: ${rebound.join('; ')}`);
});

test('FR-5 every catalog entry has a skill folder (a removed skill names itself)', async () => {
  const { SKILL_CATALOG } = await loaded;
  const disk = onDisk();
  const stale = SKILL_CATALOG.filter((e) => !(e.name in disk)).map((e) => e.name);
  assert.deepEqual(stale, [], `catalog entries with no skill folder: ${stale.join(', ')}`);
});

test('FR-5 the catalog has no duplicate name and the counts per binding equal the folders on disk', async () => {
  const { SKILL_CATALOG, SKILL_BINDINGS } = await loaded;
  const names = SKILL_CATALOG.map((e) => e.name);
  assert.equal(new Set(names).size, names.length, 'no name twice');
  const disk = Object.values(onDisk());
  for (const b of SKILL_BINDINGS) {
    assert.equal(SKILL_CATALOG.filter((e) => e.binding === b).length, disk.filter((d) => d.binding === b).length, b);
  }
  assert.equal(SKILL_CATALOG.length, disk.length);
});

test('FR-5 every SKILL.md names itself as its folder and declares a known binding', async () => {
  const { SKILL_BINDINGS } = await loaded;
  for (const [name, d] of Object.entries(onDisk())) {
    assert.equal(d.name, name, `${name}: frontmatter name`);
    assert.ok(SKILL_BINDINGS.includes(d.binding), `${name}: binding ${d.binding}`);
  }
});

test('FR-5 a folder without SKILL.md (the akili-panel plugin entry) is excluded from the catalog', async () => {
  const { SKILL_CATALOG } = await loaded;
  const bare = fs.readdirSync(SKILLS, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !fs.existsSync(path.join(SKILLS, e.name, 'SKILL.md')))
    .map((e) => e.name);
  assert.ok(bare.includes('akili-panel'), 'the plugin entry has no SKILL.md');
  for (const name of bare) assert.ok(!SKILL_CATALOG.some((e) => e.name === name), `${name} is not a skill`);
});

test('FR-5 the catalog is frozen, entry by entry', async () => {
  const { SKILL_CATALOG } = await loaded;
  assert.ok(Object.isFrozen(SKILL_CATALOG));
  assert.ok(SKILL_CATALOG.every((e) => Object.isFrozen(e)));
});
