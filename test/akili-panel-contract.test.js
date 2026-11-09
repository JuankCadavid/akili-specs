'use strict';

// @akili-spec changes/akili-panel T5
// A static read of the plugin's hooks module (register.jsx). A PRESENCE check: it cannot prove an
// observer is fail-open at run time or that the pane draws; those are T6 (engine kit) and T9 (live).
// Rules come from design §6.1 (as amended after T1) and requirements FR-7..FR-12, NFR-4, DD-17.
// It reads only plugin files, never docs/specs/ (KZ-changes--archify-diagrams-1).

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const FILE = process.env.AKILI_PANEL_REGISTER
  || path.join(__dirname, '..', '.claude', 'skills', 'akili-panel', 'hooks', 'register.jsx');
// LF-normalized: a Windows checkout (core.autocrlf) gives the module CRLF, and the line-based
// matches below would otherwise keep a trailing \r (CI windows-latest, PR #130).
const src = fs.readFileSync(FILE, 'utf8').replace(/\r\n/g, '\n');

// Hook registrations: each block starts at `  on(` inside `register`.
const blocks = src.slice(src.indexOf('export const register')).split(/\n {2}on\(/).slice(1)
  .map((text) => ({ text, event: /^'([\w.]+)'/.exec(text)[1], own: /command: 'akili-panel'/.test(text.split('\n')[0]) }));
const passing = blocks.filter((b) => b.event !== 'ui.render' && !b.own);

// The body of a top-level function: from its declaration to the first line starting with `}`.
function bodyOf(re) {
  const m = re.exec(src);
  assert.ok(m, `${re} not found`);
  const rest = src.slice(m.index);
  return rest.slice(0, rest.search(/\n\}/));
}

test('registers akili-panel, and only akili-panel (FR-8)', () => {
  const names = [...src.matchAll(/\$\.command\.register\(\s*\{\s*name:\s*(['"])([^'"]+)\1/g)].map((m) => m[2]);
  assert.deepEqual(names, ['akili-panel']);
  assert.equal((src.match(/\$\.command\.register\(/g) || []).length, 1, 'a register call with a non-literal name');
});

test('no project write, no prompt or transcript write, no process (FR-10, DD-17)', () => {
  const fsCalls = [...src.matchAll(/\$\.fs\.(\w+)/g)].map((m) => m[1]);
  assert.ok(fsCalls.length > 0);
  for (const call of fsCalls) assert.ok(['list', 'exists', 'read'].includes(call), `$.fs.${call}`);
  for (const banned of ['$.prompt.', '$.session.append', '$.process']) assert.ok(!src.includes(banned), banned);
});

test('every hook but /akili-panel passes the event on first and returns its result (W-4, NFR-4)', () => {
  assert.ok(!/\bnext\(\s*\{/.test(src), 'next({ ... }) rewrites an event');
  assert.deepEqual(blocks.map((b) => b.event).sort(), [
    'command.run', 'command.run', 'session.end', 'session.measure', 'session.start',
    'tool.call', 'turn.complete', 'turn.start', 'ui.render']);
  for (const b of passing) {
    const first = b.text.indexOf('await next(e)');
    assert.ok(first > 0, `${b.event}: no await next(e)`);
    assert.ok(/const ran = await next\(e\)/.test(b.text), `${b.event}: result not kept`);
    assert.equal((b.text.match(/\bawait\b/g) || []).length, 1, `${b.event}: awaits besides next(e): work runs in the dispatch`);
    for (const line of b.text.split('\n')) {
      const call = /\b(startSession|afterRun|afterTurnStart|addTurn|copyUsage|resetSums|runRefresh)\(/.exec(line);
      if (call) assert.ok(/later\(\$, \(\) => $/.test(line.slice(0, call.index)), `${b.event}: ${call[1]} outside later()`);
    }
    assert.deepEqual([...b.text.matchAll(/\breturn\b[^\n]*/g)].map((m) => m[0]), ['return ran'], `${b.event}: returns something else`);
  }
});

test('every command.run and tool.call hook has a .catch that answers next(e) (W-4)', () => {
  const gated = passing.filter((b) => b.event === 'command.run' || b.event === 'tool.call');
  assert.equal(gated.length, 2);
  for (const b of gated) assert.ok(/\}\)\.catch\(passOn\)/.test(b.text), `${b.event}: no .catch`);
  assert.ok(/const passOn = \(\$, e, next\) => next\(e\)/.test(src));
});

test('the tool.call hook acts only on akili- skills (design 6.1)', () => {
  const call = blocks.find((b) => b.event === 'tool.call').text;
  assert.ok(/if \(\/\^akili-\/\.test\(String\(e\.skill \|\| ''\)\)\) later\(/.test(call));
});

test('pending is written only through update (W-5)', () => {
  assert.ok(!/\$\.state\.set/.test(src), '$.state.set');
  assert.ok(/update\(\$, pending, \(cur\) =>/.test(bodyOf(/async function press\(/)));
});

test('disk is read only in the refresh, which checks the pane is up first (W-10)', () => {
  const io = bodyOf(/const ioOver = /);
  assert.equal([...src.matchAll(/\$\.fs\./g)].length, [...io.matchAll(/\$\.fs\./g)].length, '$.fs outside ioOver');
  assert.equal((src.match(/ioOver\(/g) || []).length, 1, 'ioOver used once');
  const once = bodyOf(/async function refreshOnce\(/);
  assert.ok(once.indexOf('paneIsUp($)') >= 0 && once.indexOf('paneIsUp($)') < once.indexOf('ioOver($)'));
  assert.ok(bodyOf(/async function paneIsUp\(/).includes('$.ui.panes()'));
});

test('ui.render reads atoms only, and $.command.run is only in the press handler (NFR-1, DD-8)', () => {
  const render = blocks.find((b) => b.event === 'ui.render').text;
  for (const banned of ['$.fs', '$.process', '$.state.set', '$.store', '$.command.run']) assert.ok(!render.includes(banned), banned);
  assert.equal((src.match(/\$\.command\.run\(/g) || []).length, 1);
  assert.ok(bodyOf(/async function press\(/).includes('$.command.run('));
});

test('amended hooks: turn.start passes the event on first; a press runs and records the kept spec (A1, B1)', () => {
  const start = blocks.find((b) => b.event === 'turn.start').text;
  assert.ok(start.indexOf('await next(e)') < start.indexOf('afterTurnStart'));
  const press = bodyOf(/async function press\(/);
  assert.ok(press.includes('$.command.run(') && /later\(\$, \(\) => afterRun\(\$, next\.command, next\.args\)\)/.test(press));
  assert.ok(/^async function afterRun[^]*?recordKept/m.test(src));
});

test('the /akili-panel hook answers for itself without next (FR-8, DD-7)', () => {
  const own = blocks.find((b) => b.own).text;
  assert.ok(!own.includes('next'));
  assert.ok(!/\$\.ui\.open/.test(blocks.filter((b) => b.event === 'session.start')[0].text), 'opened unasked');
  assert.ok(!bodyOf(/async function startSession\(/).includes('$.ui.open'), 'opened unasked');
});

// ---- changes/akili-panel-polish T3 (presence checks: whether a surface honours the request is T1 and T5)

const HOOKS = path.dirname(FILE);
const hookFiles = fs.readdirSync(HOOKS).filter((f) => /\.(mjs|jsx?|tsx?|json)$/.test(f));
const THEME = new Set(['inactive', 'success', 'suggestion', 'warning', 'error', 'subtle', 'inverseText', 'transparent']);

test('NFR-1: every tone, color and backgroundColor literal under hooks/ is a theme key or transparent; no hex, no rgb()/hsl()', () => {
  assert.ok(hookFiles.includes('flow.mjs') && hookFiles.includes('register.jsx'));
  let seen = 0;
  for (const f of hookFiles) {
    const text = fs.readFileSync(path.join(HOOKS, f), 'utf8');
    assert.doesNotMatch(text, /#[0-9a-fA-F]{3,8}\b/, `${f}: a hex colour`);
    assert.doesNotMatch(text, /\b(?:rgba?|hsla?)\(/, `${f}: a colour function`);
    assert.doesNotMatch(text, /(['"`])(?:red|green|blue|yellow|orange|purple|pink|cyan|magenta|lime|teal|navy|gr[ae]y|white|black|brown|gold|silver|maroon|olive|aqua)\1/i, `${f}: a colour name`);
    for (const m of text.matchAll(/\b(?:tone|\w*[cC]olor)\s*[:=]\s*\{?\s*(['"`])([^'"`]*)\1/g)) {
      seen++;
      assert.ok(THEME.has(m[2]), `${f}: ${m[0]} is not a theme key`);
    }
  }
  assert.ok(seen > 10, 'the literals were found');
});

test('FR-5: no new call: no $.ui.status, no $.audio, one $.ui.toast( (the refused run) in the whole module', () => {
  assert.doesNotMatch(src, /\$\.ui\.status\b/);
  assert.doesNotMatch(src, /\$\.audio\b/);
  assert.equal((src.match(/\$\.ui\.toast\(/g) || []).length, 1);
  assert.ok(bodyOf(/async function press\(/).includes('$.ui.toast('));
});

test('FR-1: the one $.ui.open asks for backgroundColor transparent and the rows of the full layout (DD-P1, DD-P12)', () => {
  const calls = [...src.matchAll(/\$\.ui\.open\(([^)]*)\)/g)].map((m) => m[1]);
  assert.equal(calls.length, 1);
  assert.match(calls[0], /backgroundColor: 'transparent'/);
  assert.match(calls[0], /\brows: \w+/);
});

test('FR-9: no new atom beyond the five the pane reads (view, tokens, usage, opened, pending)', () => {
  assert.deepEqual([...src.matchAll(/atom\(\{ plugin: 'akili-panel', key: '(\w+)' \}/g)].map((m) => m[1]), ['view', 'tokens', 'usage', 'opened', 'pending']);
});

// ---- changes/akili-panel-polish /akili-test (literals from requirements.md at fbcc995; never reads docs/specs/)

test('NFR-4: ui.render reaches the host only through $.ui.resolve and read($, <atom>); every other call is the pure paneRows or the press handler', () => {
  const render = blocks.find((b) => b.event === 'ui.render').text;
  assert.deepEqual([...new Set([...render.matchAll(/\$\.([\w.]+)/g)].map((m) => m[1]))], ['ui.resolve'], 'a host call besides $.ui.resolve');
  assert.deepEqual([...render.matchAll(/\bread\(\$, (\w+)\)/g)].map((m) => m[1]).sort(), ['pending', 'tokens', 'usage', 'view']);
  const takers = [...render.matchAll(/\b(\w+)\(\$\s*[,)]/g)].map((m) => m[1]);
  assert.deepEqual([...new Set(takers)].sort(), ['press', 'read'], 'a function handed $ in the render');
  for (const line of render.split('\n').filter((l) => /\bpress\(\$/.test(l))) assert.match(line, /onPress=\{\(\) => press\(\$, v\.next\)\}/, 'press outside onPress');
  assert.ok(/import \{[^}]*\bpaneRows\b[^}]*\} from '\.\/flow\.mjs'/.test(src), 'paneRows comes from flow.mjs');
});

test('FR-4 Inline pane: the rows asked for equal the rows the full layout draws, so Next is the last asked-for row', async () => {
  const { pathToFileURL } = require('node:url');
  const F = await import(pathToFileURL(path.join(HOOKS, 'flow.mjs')).href);
  const asked = Number(/const PANE_ROWS = (\d+)/.exec(src)[1]);
  assert.match([...src.matchAll(/\$\.ui\.open\(([^)]*)\)/g)][0][1], /\brows: PANE_ROWS\b/);
  const phases = F.PHASES.map((id, i) => ({ id, mark: i < 2 ? 'done' : i === 2 ? 'current' : 'todo', note: i === 2 ? 'blocked' : null }));
  const view = { status: 'ok', spec: 'changes/x', archived: false, moreActive: 1, constitution: { present: 5, total: 13 }, phases, errors: [], branch: { kind: 'branch', name: 'feat/x', sha: '' } };
  view.next = F.nextButton(view);
  const rows = F.paneRows({ view, usage: { ctxPercent: 42, ctxTokens: 84000, ctxWindow: 200000, usd: 0.35 }, sums: { in: 1, out: 1 }, pending: null, cols: 80 });
  assert.equal(rows.length, asked);
  assert.equal(rows.at(-1).id, 'next');
});
