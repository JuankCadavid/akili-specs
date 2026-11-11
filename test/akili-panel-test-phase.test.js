'use strict';

// /akili-test changes/akili-panel-model-skills (Tester suite A): the clauses the author tests do not sweep.
// Expected values are literals copied from requirements.md FR-6 / FR-10 at commit ababb96; this file never reads docs/specs/.
// Views come from flow.mjs's own `refresh` over an in-memory project, so the rows are the rows a real refresh would draw.

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const FLOW = path.join(__dirname, '..', '.claude', 'skills', 'akili-panel', 'hooks', 'flow.mjs');
const loaded = import(pathToFileURL(FLOW).href);

// FR-10 literals (requirements.md FR-10 *Wide and tall*, *Narrow pane*).
const BRAND_1 = '▄▀█ █▄▀ █ █   █';
const BRAND_2 = '█▀█ █ █ █ █▄▄ █';
const WHOLE_TITLES = [BRAND_1, BRAND_2, 'AKILI'];

const ROOT = '/p';
function memIo(files) {
  const store = new Map(Object.entries(files));
  const dirs = new Set();
  for (const k of store.keys()) {
    const parts = k.split('/');
    for (let i = 1; i < parts.length; i++) dirs.add(parts.slice(0, i).join('/'));
  }
  const enoent = (p) => Object.assign(new Error(`ENOENT: no such file or directory, '${p}'`), { code: 'ENOENT' });
  return {
    async list(p) {
      if (!dirs.has(p)) throw enoent(p);
      const out = new Map();
      for (const k of [...store.keys(), ...dirs]) {
        if (!k.startsWith(`${p}/`)) continue;
        const rest = k.slice(p.length + 1).split('/');
        out.set(rest[0], rest.length > 1 || dirs.has(k) ? 'dir' : 'file');
      }
      return [...out].map(([name, kind]) => ({ name, kind, size: 0, mtimeMs: 0 }));
    },
    async exists(p) { return store.has(p) || dirs.has(p); },
    async read(p) {
      if (!store.has(p)) throw dirs.has(p) ? Object.assign(new Error(`EISDIR: ${p}`), { code: 'EISDIR' }) : enoent(p);
      const v = store.get(p);
      if (v instanceof Error) throw v;
      return v;
    },
  };
}

const LONG_BRANCH = 'feat/an-extraordinarily-long-branch-name-for-the-narrow-pane';
const git = { [`${ROOT}/.git/HEAD`]: `ref: refs/heads/${LONG_BRANCH}\n` };
const TREES = {
  spec: { ...git, [`${ROOT}/docs/specs/changes/akili-panel-model-skills/proposal.md`]: 'x', [`${ROOT}/docs/specs/changes/akili-panel-model-skills/requirements.md`]: 'x' },
  // tasks.md exists but its read fails, so the view carries an error row (n grows).
  errors: { ...git, [`${ROOT}/docs/specs/changes/x/proposal.md`]: 'x', [`${ROOT}/docs/specs/changes/x/tasks.md`]: Object.assign(new Error('EACCES: permission denied'), { code: 'EACCES' }) },
  noActive: { ...git, [`${ROOT}/docs/specs/archive/2026-01-01-changes-old/proposal.md`]: 'x' },
  noDocs: { ...git, [`${ROOT}/README.md`]: 'x' },
};
const viewOf = async (F, name) => {
  const view = await F.refresh(memIo(TREES[name]), ROOT, null);
  const want = { spec: ['ok', 0], errors: ['ok', 1], noActive: ['no-active', 0], noDocs: ['no-specs', 0] }[name];
  assert.deepEqual([view.status, view.errors.length > 0 ? 1 : 0], want, `fixture ${name} is the state it names`);
  return view;
};

const HOST = { model: 'claude-opus-5-5', skills: ['brainstorming', 'kaizen', 'tdd', 'golang-pro'] };
const USAGE = { ctxPercent: 42, ctxTokens: 84000, ctxWindow: 200000, usd: 0.35 };
const SUMS = { in: 1234, out: 300 };
const textOf = (row) => row.parts.map((p) => p.text).join('');
const brand = (rows) => rows.filter((r) => r.id.startsWith('brand-'));

// All the inputs one sweep visits: every state, Skills closed and open with a group.
async function states(F) {
  const out = [{ name: 'no view', view: null }];
  for (const name of Object.keys(TREES)) out.push({ name, view: await viewOf(F, name) });
  return out;
}
const draw = (F, s, over) => F.paneRows({ view: s.view, usage: USAGE, sums: SUMS, host: HOST, skillsUi: { open: false, group: null }, ...over });
// n: the rows down to Next drawn with no title at that width (a height of 1 never holds one).
const nAt = (F, s, cols, ui) => {
  const rows = draw(F, s, { cols, rows: 1, ...(ui ? { skillsUi: ui } : {}) });
  const next = rows.findIndex((r) => r.id === 'next');
  return next >= 0 ? next + 1 : rows.findIndex((r) => r.id === 'rule-skills') >= 0 ? rows.findIndex((r) => r.id === 'rule-skills') : rows.length;
};
// The size FR-10 states, as literal boundaries: width 15+ → 2, 5..14 → 1, under 5 → 0; height n+2 → 2, n+1 → 1, n or less → 0.
const expectedSize = (cols, rows, n) => {
  const w = cols === undefined ? 2 : cols >= 15 ? 2 : cols >= 5 ? 1 : 0;
  const h = rows === undefined ? 2 : rows >= n + 2 ? 2 : rows === n + 1 ? 1 : 0;
  return Math.min(w, h);
};

test('TP FR-10 sweep: the size is the smaller of the width and height rules at every boundary, for every state', async () => {
  const F = await loaded;
  for (const s of await states(F)) {
    for (const cols of [undefined, 1, 4, 5, 6, 14, 15, 16, 23, 40, 80]) {
      const n = nAt(F, s, cols);
      for (const rows of [undefined, 1, n - 1, n, n + 1, n + 2, n + 3, 60]) {
        if (rows !== undefined && rows < 1) continue;
        const got = brand(draw(F, s, { cols, rows })).length;
        assert.equal(got, expectedSize(cols, rows, n), `${s.name} cols ${cols} rows ${rows} (n ${n})`);
      }
    }
  }
});

test('TP FR-10 BUT no title row is ever cut: every title row is one of the two half-block rows or AKILI, whole, at the top', async () => {
  const F = await loaded;
  for (const s of await states(F)) {
    for (let cols = 1; cols <= 60; cols++) {
      const n = nAt(F, s, cols);
      for (const rows of [undefined, n, n + 1, n + 2, 60]) {
        const all = draw(F, s, { cols, rows });
        const b = brand(all);
        b.forEach((r, i) => {
          assert.ok(WHOLE_TITLES.includes(textOf(r)), `${s.name} cols ${cols} rows ${rows}: cut title row ${JSON.stringify(textOf(r))}`);
          assert.equal(all[i], r, `${s.name} cols ${cols}: title rows lead the pane`);
          assert.ok(r.parts.every((p) => p.tone === 'planMode'), `${s.name} cols ${cols}: title tone planMode`);
        });
        if (b.length === 2) assert.deepEqual(b.map(textOf), [BRAND_1, BRAND_2]);
        if (b.length === 1) assert.deepEqual([textOf(b[0]), b[0].parts[0].bold], ['AKILI', true]);
      }
    }
  }
});

test('TP FR-10 the title never pushes Next out of the opening view: with rows >= n, Next stays within the visible rows', async () => {
  const F = await loaded;
  for (const s of await states(F)) {
    if (!s.view || !s.view.next) continue;
    for (const cols of [undefined, 4, 5, 14, 15, 23, 80]) {
      const n = nAt(F, s, cols);
      for (let rows = n; rows <= n + 6; rows++) {
        for (const ui of [{ open: false, group: null }, { open: true, group: null }, { open: true, group: 'core' }]) {
          const all = draw(F, s, { cols, rows, skillsUi: ui });
          const at = all.findIndex((r) => r.id === 'next');
          assert.ok(at >= 0 && at < rows, `${s.name} cols ${cols} rows ${rows} ${JSON.stringify(ui)}: Next at ${at}`);
        }
      }
      // rows = n: no title, and Next is exactly the last visible row (as 1.0.0).
      const exact = draw(F, s, { cols, rows: n });
      assert.equal(exact[n - 1].id, 'next', `${s.name} cols ${cols}: Next last at rows = n`);
    }
  }
});

test('TP FR-10 / FR-8 with no title the header rows are byte-identical to the untitled (1.0.0) draw; with one, no Akili prefix and no empty header row', async () => {
  const F = await loaded;
  for (const s of await states(F)) {
    if (!s.view) continue;
    for (let cols = 1; cols <= 60; cols++) {
      const base = draw(F, s, { cols, rows: 1 }).filter((r) => r.id === 'title' || r.id === 'branch');
      const n = nAt(F, s, cols);
      // width under 5, or rows = n: no title — header as 1.0.0 draws it at that width.
      for (const rows of cols < 5 ? [undefined, n + 2, n] : [n]) {
        const head = draw(F, s, { cols, rows }).filter((r) => r.id === 'title' || r.id === 'branch');
        assert.deepEqual(head, base, `${s.name} cols ${cols} rows ${rows}`);
      }
      if (cols >= 5) {
        const titled = draw(F, s, { cols, rows: n + 2 });
        const title = titled.find((r) => r.id === 'title');
        if (s.view.spec) {
          assert.ok(title && !textOf(title).startsWith('Akili'), `${s.name} cols ${cols}: spec alone`);
          assert.ok(textOf(title).length > 0, `${s.name} cols ${cols}: no empty header row`);
        } else {
          assert.equal(title, undefined, `${s.name} cols ${cols}: no empty header row where the spec would be`);
        }
      }
    }
  }
});

test('TP FR-10 No spec or no docs BUT the empty-state text is unchanged at every title size', async () => {
  const F = await loaded;
  const want = { noActive: 'No active spec.', noDocs: 'No docs/specs/ folder yet.' };
  for (const [name, text] of Object.entries(want)) {
    const s = { name, view: await viewOf(F, name) };
    const n = nAt(F, s, 80);
    for (const rows of [n, n + 1, n + 2]) {
      const empty = draw(F, s, { cols: 80, rows }).find((r) => r.id === 'empty');
      assert.equal(empty && textOf(empty), text, `${name} rows ${rows}`);
      assert.equal(empty.parts[0].dim, true);
    }
  }
});

test('TP FR-10 Size unknown: a zero, negative or non-number measure sets no limit, and the other measure still applies', async () => {
  const F = await loaded;
  const s = { name: 'spec', view: await viewOf(F, 'spec') };
  for (const bad of [0, -1, NaN, null, '20']) {
    assert.equal(brand(draw(F, s, { cols: bad, rows: 60 })).length, 2, `cols ${bad}`);
    assert.equal(brand(draw(F, s, { cols: 14, rows: bad })).length, 1, `cols 14 rows ${bad}`);
    assert.equal(brand(draw(F, s, { cols: 4, rows: bad })).length, 0, `cols 4 rows ${bad}`);
    assert.equal(F.titleSize({ cols: bad, rows: bad, n: 10 }), 2, `both ${bad}`);
  }
  const n = nAt(F, s, undefined);
  assert.equal(brand(draw(F, s, { cols: 0, rows: n + 1 })).length, 1, 'cols 0: rows alone decide');
});

test('TP FR-6 BUT the model id is never dropped from 14 columns up, in every state, short and long ids, with a title or not', async () => {
  const F = await loaded;
  const ids = ['claude-opus-5-5', 'claude-haiku-5-5', `claude-${'x'.repeat(70)}-end`];
  for (const s of await states(F)) {
    for (const id of ids) {
      for (let cols = 14; cols <= 120; cols++) {
        for (const rows of [1, undefined]) {
          const row = draw(F, s, { cols, rows, host: { ...HOST, model: id } }).find((r) => r.id === 'model');
          const text = textOf(row);
          assert.ok(text.length <= cols, `${s.name} ${id} cols ${cols}: wider than the pane`);
          // the id stays: its head and tail are both in the row (cut in the middle, never at the end).
          const idPart = text.startsWith('model') ? text.slice(5).trimStart() : text;
          assert.ok(idPart.length >= 6 || idPart === id, `${s.name} ${id} cols ${cols}: id dropped (${JSON.stringify(text)})`);
          assert.ok(idPart.startsWith(id.slice(0, Math.min(3, id.length))), `${s.name} ${id} cols ${cols}: head kept (${text})`);
          assert.ok(idPart.endsWith(id.slice(-1)), `${s.name} ${id} cols ${cols}: tail kept (${text})`);
          if (idPart !== id) assert.ok(idPart.includes('…'), `${s.name} ${id} cols ${cols}: cut is marked`);
        }
      }
    }
  }
});

test('TP FR-1 Shown BUT no alias: at full width the id is drawn as returned, for any id string', async () => {
  const F = await loaded;
  const s = { name: 'spec', view: await viewOf(F, 'spec') };
  for (const id of ['claude-opus-5-5', 'opus', 'claude-sonnet-5-5[1m]', 'us.anthropic.claude-haiku-5-5-v1:0']) {
    const row = draw(F, s, { cols: undefined, rows: 1, host: { ...HOST, model: id } }).find((r) => r.id === 'model');
    assert.equal(textOf(row), `${'model'.padEnd(17)}${id}`);
  }
});
