'use strict';

// changes/akili-panel T4: the pure rules behind the pane (.claude/skills/akili-panel/hooks/flow.mjs).
// Expected values come from requirements.md (FR-5, FR-6, FR-7, FR-11, FR-12, FR-16, NFR-2).
// Fixtures live under test/fixtures/akili-panel/. Entries named `dot-<x>` there are
// materialized as `.<x>` in a temp copy (git would swallow a real `.git`, and `.agents/`
// is ignored by this repo); `@ROOT@` inside a `dot-git` file becomes the temp root.
// The tests never read the live docs/specs tree (KZ-changes--archify-diagrams-1).

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const FLOW = path.join(__dirname, '..', '.claude', 'skills', 'akili-panel', 'hooks', 'flow.mjs');
const FIXTURES = path.join(__dirname, 'fixtures', 'akili-panel');
const loaded = import(pathToFileURL(FLOW).href);
// The two header rows of a view, as text (T3: the rows replaced the string formatters).
const header = (F, view, cols = 200) => {
  const rows = F.paneRows({ view: { constitution: { present: 13, total: 13 }, phases: [], errors: [], ...view }, usage: {}, sums: null, cols });
  return ['title', 'branch'].map((id) => rows.find((r) => r.id === id).parts.map((q) => q.text).join(''));
}; // W-14: a file URL loads on Windows drive letters

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'akili-panel-flow-'));
test.after(() => fs.rmSync(TMP, { recursive: true, force: true }));

// ---------------------------------------------------------------- fixtures and io

let counter = 0;
function copyTree(src, dst, root) {
  fs.mkdirSync(dst, { recursive: true });
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    const name = ent.name.startsWith('dot-') ? `.${ent.name.slice(4)}` : ent.name;
    const from = path.join(src, ent.name);
    const to = path.join(dst, name);
    if (ent.isDirectory()) copyTree(from, to, root);
    else {
      let data = fs.readFileSync(from);
      if (name === '.git') data = Buffer.from(data.toString('utf8').replace(/@ROOT@/g, root.replace(/\\/g, '/')));
      fs.writeFileSync(to, data);
    }
  }
}

// opts.mtimes: { 'docs/specs/changes/a/proposal.md': epochSeconds }
function materialize(name, opts = {}) {
  const root = path.join(TMP, `${name}-${counter++}`);
  copyTree(path.join(FIXTURES, name), root, root);
  for (const [rel, secs] of Object.entries(opts.mtimes || {})) fs.utimesSync(path.join(root, rel), secs, secs);
  return root;
}

// The same entry shape as the host's FsEntry: { name, kind, size, mtimeMs } (types:5150-5160).
function nodeIo() {
  return {
    async list(p) {
      const ents = await fsp.readdir(p, { withFileTypes: true });
      return Promise.all(ents.map(async (e) => {
        const kind = e.isDirectory() ? 'dir' : e.isFile() ? 'file' : 'other';
        if (kind !== 'file') return { name: e.name, kind, size: 0, mtimeMs: 0 };
        const st = await fsp.stat(path.join(p, e.name));
        return { name: e.name, kind, size: st.size, mtimeMs: st.mtimeMs };
      }));
    },
    async exists(p) { try { await fsp.access(p); return true; } catch { return false; } },
    read: (p) => fsp.readFile(p, 'utf8'),
  };
}

// In-memory io over forward-slash paths (also serves Windows-style roots).
function memIo(files) {
  const norm = (p) => String(p).replace(/\\/g, '/');
  const store = new Map(Object.entries(files).map(([k, v]) => [norm(k), v]));
  const dirs = new Set();
  for (const k of store.keys()) {
    const parts = k.split('/');
    for (let i = 1; i < parts.length; i++) dirs.add(parts.slice(0, i).join('/'));
  }
  const enoent = (p) => Object.assign(new Error(`ENOENT: no such file or directory, '${p}'`), { code: 'ENOENT' });
  return {
    async list(p) {
      const d = norm(p);
      if (!dirs.has(d)) throw enoent(p);
      const out = new Map();
      for (const k of [...store.keys(), ...dirs]) {
        if (!k.startsWith(`${d}/`)) continue;
        const rest = k.slice(d.length + 1).split('/');
        out.set(rest[0], rest.length > 1 || dirs.has(k) ? 'dir' : 'file');
      }
      return [...out].map(([name, kind]) => ({ name, kind, size: 0, mtimeMs: 0 }));
    },
    async exists(p) { const n = norm(p); return store.has(n) || dirs.has(n); },
    async read(p) {
      const n = norm(p);
      if (!store.has(n)) throw dirs.has(n) ? Object.assign(new Error(`EISDIR: ${p}`), { code: 'EISDIR' }) : enoent(p);
      return store.get(n);
    },
  };
}

// Counts calls and records every path that is not absolute (the T4 absolute-path rule, J-5).
function counting(inner) {
  const calls = { list: [], exists: [], read: [], relative: [] };
  const note = (kind, p) => {
    calls[kind].push(p);
    const abs = path.isAbsolute(p) || /^[A-Za-z]:[\\/]/.test(p);
    if (!abs) calls.relative.push(`${kind}:${p}`);
  };
  return {
    calls,
    io: {
      list: (p) => { note('list', p); return inner.list(p); },
      exists: (p) => { note('exists', p); return inner.exists(p); },
      read: (p) => { note('read', p); return inner.read(p); },
    },
  };
}

async function run(name, kept, opts) {
  const F = await loaded;
  const root = materialize(name, opts);
  const c = counting(nodeIo());
  const view = await F.refresh(c.io, root, kept);
  assert.ok(view, 'refresh returned a snapshot');
  assert.deepEqual(c.calls.relative, [], 'every path handed to io is absolute');
  return { view, calls: c.calls, root };
}

const marks = (view) => view.phases.map((p) => `${p.id}${{ done: '✓', current: '▶', todo: '○' }[p.mark]}${p.note ? `(${p.note})` : ''}`).join(' ');
const sample = (n) => {
  const text = fs.readFileSync(path.join(FIXTURES, 'tasks-samples', n), 'utf8');
  assert.ok(text.trim().length > 0, `tasks-samples/${n} is empty: an emptied fixture proves nothing`);
  return text;
};

// ================================================================ module shape (DD-2, NFR-2: 0 processes)

test('DD-2/NFR-2: flow.mjs is pure: no import, no require, no process, no `$`', () => {
  const src = fs.readFileSync(FLOW, 'utf8').replace(/\/\/.*$/gm, '');
  assert.ok(src.length > 500, 'flow.mjs holds the rules');
  assert.doesNotMatch(src, /^\s*import\s/m);
  assert.doesNotMatch(src, /\brequire\s*\(/);
  assert.doesNotMatch(src, /child_process|\bprocess\b|\$\.(?:fs|process)/);
});

test('DD-2: flow.mjs exports the scan, the rules, the formatters and the strings table', async () => {
  const F = await loaded;
  for (const fn of ['refresh', 'scanSpecs', 'readBranch', 'readConstitution', 'parseTaskTokens', 'derivePhases', 'nextButton',
    'keptSpecFor', 'safeSpecPath', 'paneRows', 'formatNext', 'shortenCount', 'shortenMiddle']) {
    assert.equal(typeof F[fn], 'function', fn);
  }
  assert.equal(typeof F.STRINGS, 'object');
  assert.equal(typeof F.NEXT_TABLE, 'object');
});

// ================================================================ FR-5

test('FR-5 last observed command wins: /akili-execute changes/a shows changes/a and (1 more active)', async () => {
  const F = await loaded;
  const { view } = await run('last-observed', 'changes/a');
  assert.equal(view.spec, 'changes/a');
  assert.equal(view.moreActive, 1);
  assert.deepEqual(header(F, view), ['Akili  changes/a', '⎇ feat/b (1 more active)']);
});

test('FR-5 header omits (n more active) when no other spec is active', async () => {
  const F = await loaded;
  const { view } = await run('specify-progress', null);
  assert.equal(view.moreActive, 0);
  assert.deepEqual(header(F, view), ['Akili  changes/x', '(no git)']);
});

test('FR-5 a kept spec that is gone and not archived is ignored (falls to branch match)', async () => {
  const { view } = await run('branch-match', 'changes/gone');
  assert.equal(view.spec, 'bugfix/b');
});

test('FR-5 branch match: branch fix/b with changes/a and bugfix/b shows bugfix/b', async () => {
  const { view } = await run('branch-match', null);
  assert.equal(view.spec, 'bugfix/b');
  assert.equal(view.moreActive, 1);
});

test('FR-5 branch match with several specs of that name: the most recently modified', async () => {
  const older = { 'docs/specs/changes/b/proposal.md': 1_000_000, 'docs/specs/bugfix/b/proposal.md': 2_000_000 };
  assert.equal((await run('branch-several', null, { mtimes: older })).view.spec, 'bugfix/b');
  const flipped = { 'docs/specs/changes/b/proposal.md': 2_000_000, 'docs/specs/bugfix/b/proposal.md': 1_000_000 };
  assert.equal((await run('branch-several', null, { mtimes: flipped })).view.spec, 'changes/b');
});

test('FR-5 most recent: no observed command, no branch match: the spec whose spec files changed last', async () => {
  const aOlder = { 'docs/specs/changes/a/proposal.md': 1_000_000, 'docs/specs/changes/b/proposal.md': 2_000_000 };
  assert.equal((await run('most-recent', null, { mtimes: aOlder })).view.spec, 'changes/b');
  const bOlder = { 'docs/specs/changes/a/proposal.md': 2_000_000, 'docs/specs/changes/b/proposal.md': 1_000_000 };
  assert.equal((await run('most-recent', null, { mtimes: bOlder })).view.spec, 'changes/a');
});

test('FR-5 unsafe argument: /akili-execute ../../etc and /akili-execute /tmp/x are not kept', async () => {
  const F = await loaded;
  assert.equal(F.keptSpecFor('akili-execute', '../../etc'), null);
  assert.equal(F.keptSpecFor('akili-execute', '/tmp/x'), null);
});

test('FR-5 safe-path rule: only relative segments of letters, digits, . _ - and no . or .. segment', async () => {
  const F = await loaded;
  for (const bad of ['..', 'changes/../x', './x', 'changes/./x', 'changes//x', 'changes/x/', '\\tmp\\x', 'C:\\x', 'a b', 'changes/x;rm', 'changes/é', '$HOME/x', '']) {
    assert.equal(F.safeSpecPath(bad), null, JSON.stringify(bad));
  }
  for (const good of ['changes/x', 'bugfix/login-loop', 'a.b_c-d/E1', 'x', '...']) {
    assert.equal(F.safeSpecPath(good), good, good);
  }
});

test('FR-5 every spec-taking command keeps its first argument as written', async () => {
  const F = await loaded;
  for (const c of ['akili-specify', 'akili-execute', 'akili-test', 'akili-validate', 'akili-archive', '/akili-execute']) {
    assert.equal(F.keptSpecFor(c, 'changes/a extra words'), 'changes/a', c);
  }
});

test('FR-5 propose arguments: add-remember-me keep users signed in -> changes/add-remember-me', async () => {
  const F = await loaded;
  assert.equal(F.keptSpecFor('akili-propose', 'add-remember-me keep users signed in'), 'changes/add-remember-me');
});

test('FR-5 propose arguments: a path with / keeps that path', async () => {
  const F = await loaded;
  assert.equal(F.keptSpecFor('akili-propose', 'bugfix/login-loop'), 'bugfix/login-loop');
  assert.equal(F.keptSpecFor('akili-propose', '../x/y'), null);
});

test('FR-5 propose arguments BUT: a sentence and a one-word slug keep nothing', async () => {
  const F = await loaded;
  assert.equal(F.keptSpecFor('akili-propose', 'Add dark mode to settings'), null);
  assert.equal(F.keptSpecFor('akili-propose', 'loan'), null);
  assert.equal(F.keptSpecFor('akili-propose', 'Add-on support for X'), null);
  assert.equal(F.keptSpecFor('akili-propose', ''), null);
});

test('FR-5 not a spec-taking command: /akili-resume and /akili-quick keep nothing', async () => {
  const F = await loaded;
  assert.equal(F.keptSpecFor('akili-resume', ''), null);
  assert.equal(F.keptSpecFor('akili-quick', 'fix the typo'), null);
  assert.equal(F.keptSpecFor('akili-audit', 'changes/a'), null);
  assert.equal(F.keptSpecFor('akili-resume', 'changes/a'), null);
});

test('FR-5/DD-6 the store is one key per project root, bounded to 50 keys, oldest dropped', async () => {
  const F = await loaded;
  assert.equal(F.storeKey('/p/one'), 'spec:/p/one');
  assert.notEqual(F.storeKey('/p/one'), F.storeKey('/p/two'));
  let kept = {};
  for (let i = 0; i < 55; i++) kept = F.keepSpec(kept, `/p/${i}`, 'changes/x', i + 1);
  assert.equal(Object.keys(kept).length, 50);
  assert.equal(kept['spec:/p/0'], undefined);
  assert.deepEqual(kept['spec:/p/54'], { path: 'changes/x', at: 55 });
});

// ================================================================ spec discovery (glossary, design 5.3)

const specPaths = async (name) => {
  const F = await loaded;
  const c = counting(nodeIo());
  const scan = await F.scanSpecs(c.io, materialize(name), []);
  assert.ok(scan, 'scanSpecs returned a scan');
  assert.deepEqual(c.calls.relative, []);
  return scan.specs.map((s) => s.path);
};

test('discovery: taxonomy folders nest, specs found down to 4 levels, deeper ones are not entered', async () => {
  assert.deepEqual(await specPaths('nested-taxonomy'), ['bugfix/y', 'changes/x', 'features/deep/er/z']);
});

test('discovery carve-outs: archive, general-setup, quick, kaizen, audits, reviews are never specs', async () => {
  assert.deepEqual(await specPaths('carve-outs'), ['changes/fam/kid', 'changes/real']);
});

test('discovery family container: a folder whose only spec-like file is family.md is entered, not a spec', async () => {
  const F = await loaded;
  const scan = await F.scanSpecs(nodeIo(), materialize('family-container'), []);
  assert.ok(scan, 'scanSpecs returned a scan');
  assert.deepEqual(scan.specs.map((s) => s.path), ['fam/one', 'fam/two']);
  assert.deepEqual(scan.bare, [], 'a lone family.md folder is not a bare spec folder either');
});

test('discovery: the spec file set is the seven names; recency is the max mtimeMs of those files', async () => {
  const F = await loaded;
  assert.deepEqual(F.SPEC_FILES && [...F.SPEC_FILES], ['proposal.md', 'requirements.md', 'design.md', 'tasks.md', 'execution.md', 'test-report.md', 'validation-report.md']);
  const root = materialize('last-observed', { mtimes: { 'docs/specs/changes/a/proposal.md': 3_000_000 } });
  const scan = await F.scanSpecs(nodeIo(), root, []);
  assert.ok(scan, 'scanSpecs returned a scan');
  assert.equal(scan.specs.find((s) => s.path === 'changes/a').mtimeMs, 3_000_000_000);
});

test('FR-6 archive row: folder gone + archive holds YYYY-MM-DD-<spec path with / as -->: archived, every phase done', async () => {
  const F = await loaded;
  const { view } = await run('archived-alone', 'changes/a');
  assert.equal(view.archived, true);
  assert.equal(view.spec, 'changes/a');
  assert.equal(marks(view), 'propose✓ specify✓ execute✓ test✓ validate✓ archive✓');
  assert.deepEqual(header(F, view), ['Akili  changes/a', '(no git) · archived']);
});

test('FR-6 archive match is the exact name: decoys (ab suffix, prefix text, other taxonomy) do not match', async () => {
  const F = await loaded;
  const { view } = await run('archive-decoy-only', 'changes/a');
  assert.equal(view.archived, false);
  assert.equal(view.status, 'no-active');
  assert.equal(F.isArchiveName('2026-11-01-changes--a', 'changes/a'), true);
  assert.equal(F.isArchiveName('2026-11-01-changes--ab', 'changes/a'), false);
  assert.equal(F.isArchiveName('old-2026-11-01-changes--a', 'changes/a'), false);
  assert.equal(F.isArchiveName('2026-11-01-bugfix--a', 'changes/a'), false);
  assert.equal(F.isArchiveName('2026-11-01-changesXXa', 'changes/a'), false);
  assert.equal(F.archiveSafeName('changes/a'), 'changes--a');
});

// ================================================================ FR-6 constitution

test('FR-6 constitution: all 13 files -> done (✓)', async () => {
  const F = await loaded;
  const { view } = await run('constitution-full', null);
  assert.deepEqual(view.constitution, { present: 13, total: 13 });
});

test('FR-6 constitution: none of the files -> not reached (○)', async () => {
  const F = await loaded;
  const { view } = await run('empty-project', null);
  assert.deepEqual(view.constitution, { present: 0, total: 13 });
});

test('FR-6 constitution: some of the files -> ▶ (k/13)', async () => {
  const F = await loaded;
  const { view } = await run('constitution-partial', null);
  assert.deepEqual(view.constitution, { present: 5, total: 13 });
});

test('FR-6 legacy baseline: docs/system-design/design.md alone counts as present', async () => {
  const { view } = await run('legacy-baseline', null);
  assert.deepEqual(view.constitution, { present: 1, total: 13 });
});

test('FR-6 legacy baseline: both legacy alternates complete the 13 (✓)', async () => {
  const { view } = await run('constitution-legacy-full', null);
  assert.deepEqual(view.constitution, { present: 13, total: 13 });
});

test('FR-6 constitution table is the 13 rows of akili-constitution (2 and 3 carry a legacy alternate)', async () => {
  const F = await loaded;
  assert.equal(F.CONSTITUTION_FILES && F.CONSTITUTION_FILES.length, 13);
  assert.deepEqual(F.CONSTITUTION_FILES.filter((r) => r.legacy).map((r) => [r.path, r.legacy]), [
    ['docs/ux-ui/design.md', 'docs/system-design/design.md'],
    ['docs/trd/trd.md', 'docs/detailed-design/detailed-design.md'],
  ]);
});

// ================================================================ FR-6 phases

test('FR-6 specify in progress: proposal + requirements -> propose ✓, specify ▶, the rest ○', async () => {
  const { view } = await run('specify-progress', 'changes/x');
  assert.equal(marks(view), 'propose✓ specify▶ execute○ test○ validate○ archive○');
});

test('FR-6 prose is not a status: every Status cell [x] and prose saying `[~]` -> execute ✓, not (blocked)', async () => {
  const F = await loaded;
  const { view } = await run('prose-status', 'changes/x');
  assert.equal(view.blocked, false);
  assert.equal(marks(view), 'propose✓ specify✓ execute✓ test▶ validate○ archive○');
  assert.doesNotMatch(pane(F, { view }).map(textOf).join('\n'), /blocked/);
});

test('FR-6 prose is not a status: bracket pairs in prose and in table rows of other columns count nothing', async () => {
  const F = await loaded;
  assert.deepEqual(F.parseTaskTokens(sample('fmt-prose.md')), { done: 0, open: 0, blocked: 0, total: 0 });
});

test('FR-6 blocked: one Status cell [~] -> execute reads ▶ (blocked)', async () => {
  const F = await loaded;
  const { view } = await run('blocked', 'changes/x');
  assert.equal(view.blocked, true);
  assert.equal(marks(view), 'propose✓ specify✓ execute▶(blocked) test○ validate○ archive○');
});

test('FR-6 out-of-order file: test-report.md with a task [ ] -> execute ▶ and test ○, never ✓ past it', async () => {
  const { view } = await run('out-of-order', 'changes/x');
  assert.equal(marks(view), 'propose✓ specify✓ execute▶ test○ validate○ archive○');
});

test('FR-6 real status formats: a Status table cell, backticked or bare, with trailing text', async () => {
  const F = await loaded;
  assert.deepEqual(F.parseTaskTokens(sample('fmt-table.md')), { done: 4, open: 1, blocked: 1, total: 6 });
});

test('FR-6 real status formats: a list item', async () => {
  const F = await loaded;
  assert.deepEqual(F.parseTaskTokens(sample('fmt-list.md')), { done: 3, open: 1, blocked: 0, total: 4 });
});

test('FR-6 real status formats: the value after **Status:**', async () => {
  const F = await loaded;
  assert.deepEqual(F.parseTaskTokens(sample('fmt-status-value.md')), { done: 2, open: 1, blocked: 0, total: 3 });
});

test('FR-6 real status formats: the end of a task heading', async () => {
  const F = await loaded;
  assert.deepEqual(F.parseTaskTokens(sample('fmt-heading.md')), { done: 2, open: 1, blocked: 0, total: 3 });
});

test('FR-6 real status formats: ## Document Control is never read (Draft — Phase 3 and a [x] row count nothing)', async () => {
  const F = await loaded;
  assert.deepEqual(F.parseTaskTokens(sample('fmt-document-control.md')), { done: 0, open: 0, blocked: 0, total: 0 });
});

test('FR-6 real status formats AND CRLF: the same file with CRLF line endings counts the same as with LF', async () => {
  const F = await loaded;
  const lf = sample('fmt-all-lf.md');
  const crlf = sample('fmt-all-crlf.md');
  assert.ok(crlf.includes('\r\n') && !lf.includes('\r'), 'fixture line endings are what they claim');
  assert.deepEqual(F.parseTaskTokens(lf), { done: 3, open: 1, blocked: 1, total: 5 });
  assert.deepEqual(F.parseTaskTokens(crlf), { done: 3, open: 1, blocked: 1, total: 5 });
});

test('FR-6 no status at all: requirements + design + a tasks.md with no token -> execute ▶ (no task status)', async () => {
  const F = await loaded;
  assert.deepEqual(F.parseTaskTokens(sample('fmt-none.md')), { done: 0, open: 0, blocked: 0, total: 0 });
  const { view } = await run('no-status', 'changes/x');
  assert.equal(marks(view), 'propose✓ specify✓ execute▶(no-task-status) test○ validate○ archive○');
});

test('FR-6 no status at all BUT: execute is never marked ✓ without a token', async () => {
  const { view } = await run('no-status', 'changes/x');
  assert.notEqual(view.phases.find((p) => p.id === 'execute').mark, 'done');
});

const LADDER = [
  ['propose', 'changes/s-propose', 'propose▶ specify○ execute○ test○ validate○ archive○'],
  ['specify', 'changes/s-specify', 'propose✓ specify▶ execute○ test○ validate○ archive○'],
  ['execute', 'changes/s-execute', 'propose✓ specify✓ execute▶ test○ validate○ archive○'],
  ['test', 'changes/s-test', 'propose✓ specify✓ execute✓ test▶ validate○ archive○'],
  ['validate', 'changes/s-validate', 'propose✓ specify✓ execute✓ test✓ validate▶ archive○'],
  ['archive', 'changes/s-archive', 'propose✓ specify✓ execute✓ test✓ validate✓ archive▶'],
];
for (const [phase, spec, expected] of LADDER) {
  test(`FR-6 phase table: current phase ${phase} (first phase not done, later ones not reached)`, async () => {
    const { view } = await run('phase-ladder', spec);
    assert.equal(marks(view), expected);
  });
}

test('FR-6 propose is done when proposal, requirements, design or tasks exists (specified without a proposal counts)', async () => {
  const F = await loaded;
  const noTokens = { total: 0, done: 0, open: 0, blocked: 0 };
  for (const f of ['proposal.md', 'requirements.md', 'design.md', 'tasks.md']) {
    const d = F.derivePhases({ files: [f], tokens: noTokens, archived: false });
    assert.ok(d, 'derivePhases returned phases');
    assert.equal(d.phases[0].mark, 'done', f);
  }
  assert.equal((F.derivePhases({ files: ['execution.md'], tokens: null, archived: false }) || { phases: [{}] }).phases[0].mark, 'current');
  assert.equal((F.derivePhases({ files: [], tokens: null, archived: false }) || { phases: [{}] }).phases[0].mark, 'current');
});

test('FR-6 the phase list is propose, specify, execute, test, validate, archive, in that order', async () => {
  const F = await loaded;
  assert.deepEqual(F.PHASES && [...F.PHASES], ['propose', 'specify', 'execute', 'test', 'validate', 'archive']);
});

// ================================================================ FR-7 next table

const V = (over) => ({ status: 'ok', spec: 'changes/x', archived: false, moreActive: 0, constitution: { present: 13, total: 13 }, phases: [], ...over });
const at = (id) => ['propose', 'specify', 'execute', 'test', 'validate', 'archive'].map((p, i, all) => ({ id: p, mark: i < all.indexOf(id) ? 'done' : i === all.indexOf(id) ? 'current' : 'todo', note: null }));
const NEXT_ROWS = [
  ['no docs/specs and constitution not ✓', V({ status: 'no-specs', spec: null, constitution: { present: 2, total: 13 } }), 'Next: /akili-constitution'],
  ['no docs/specs and constitution ✓ (FR-16)', V({ status: 'no-specs', spec: null }), 'Next: /akili-propose'],
  ['no active spec, constitution ✓', V({ status: 'no-active', spec: null }), 'Next: /akili-propose'],
  ['no active spec, constitution not ✓', V({ status: 'no-active', spec: null, constitution: { present: 0, total: 13 } }), 'Next: /akili-constitution'],
  ['current phase propose', V({ phases: at('propose') }), 'Next: /akili-propose changes/x'],
  ['current phase specify', V({ phases: at('specify') }), 'Next: /akili-specify changes/x'],
  ['current phase execute (not blocked)', V({ phases: at('execute') }), 'Next: /akili-execute changes/x'],
  ['current phase execute (blocked)', V({ phases: at('execute').map((p) => (p.mark === 'current' ? { ...p, note: 'blocked' } : p)) }), 'Next: /akili-execute changes/x'],
  ['current phase test', V({ phases: at('test') }), 'Next: /akili-test changes/x'],
  ['current phase validate', V({ phases: at('validate') }), 'Next: /akili-validate changes/x'],
  ['current phase archive', V({ phases: at('archive') }), 'Next: /akili-archive changes/x'],
  ['displayed spec archived, other active specs exist', V({ archived: true, moreActive: 2 }), 'Next: /akili-resume'],
  ['displayed spec archived, none other active', V({ archived: true, moreActive: 0 }), 'Next: /akili-propose'],
];
for (const [state, view, label] of NEXT_ROWS) {
  test(`FR-7 state table: ${state} -> ${label}`, async () => {
    const F = await loaded;
    assert.equal(F.formatNext(F.nextButton(view)), label);
  });
}

test('FR-7 button text has no trailing space when the command takes no spec', async () => {
  const F = await loaded;
  assert.equal(F.formatNext({ command: 'akili-resume', args: '' }), 'Next: /akili-resume');
  assert.equal(F.formatNext(null), '');
});

test('FR-7 propose row: a kept spec folder with no spec file yet -> Next: /akili-propose <spec> (W-1)', async () => {
  const F = await loaded;
  const { view } = await run('phase-ladder', 'changes/s-propose');
  assert.equal(view.spec, 'changes/s-propose');
  assert.equal(F.formatNext(view.next), 'Next: /akili-propose changes/s-propose');
});

test('FR-7 propose row: a folder with no spec file is never displayed unless kept', async () => {
  const { view } = await run('phase-ladder', null);
  assert.notEqual(view.spec, 'changes/s-propose');
  assert.equal(view.moreActive, 4, 'the bare folder is not an active spec: 5 specs, one displayed');
});

test('FR-7 integration: the displayed spec decides the button (blocked tasks -> /akili-execute)', async () => {
  const F = await loaded;
  const { view } = await run('blocked', 'changes/x');
  assert.equal(F.formatNext(view.next), 'Next: /akili-execute changes/x');
});

test('FR-7 integration: archived spec with another active one -> /akili-resume; alone -> /akili-propose', async () => {
  const F = await loaded;
  assert.equal(F.formatNext((await run('archived-others', 'changes/a')).view.next), 'Next: /akili-resume');
  assert.equal(F.formatNext((await run('archived-alone', 'changes/a')).view.next), 'Next: /akili-propose');
});

test('FR-16 new project: no docs/specs -> text, constitution ○ and Next: /akili-constitution', async () => {
  const F = await loaded;
  const { view } = await run('empty-project', null);
  assert.equal(view.status, 'no-specs');
  assert.equal(F.emptyStateText(view), 'No docs/specs/ folder yet.');
  assert.equal(F.formatNext(view.next), 'Next: /akili-constitution');
  assert.deepEqual(view.phases, []);
});

test('FR-16 new project: with a complete constitution the button is /akili-propose', async () => {
  const F = await loaded;
  const files = {};
  assert.ok(F.CONSTITUTION_FILES, 'constitution table exported');
  for (const r of F.CONSTITUTION_FILES) files[`/p/${r.path}`] = 'x';
  const inner = memIo(files);
  // all 13 files exist, yet docs/specs cannot be listed (the table row "No docs/specs and constitution ✓")
  const io = { ...inner, list: async (p) => { if (p === '/p/docs/specs') throw Object.assign(new Error('ENOENT: nope'), { code: 'ENOENT' }); return inner.list(p); } };
  const view = await F.refresh(io, '/p', null);
  assert.equal(view.status, 'no-specs');
  assert.deepEqual(view.errors, [], 'a missing docs/specs is a state, not an error');
  assert.equal(F.formatNext(view.next), 'Next: /akili-propose');
});

test('FR-16 empty project with docs/specs but no active spec: No active spec. and the right button', async () => {
  const F = await loaded;
  const a = (await run('no-active', null)).view;
  assert.equal(F.emptyStateText(a), 'No active spec.');
  assert.equal(F.formatNext(a.next), 'Next: /akili-constitution');
  const b = (await run('constitution-full', null)).view;
  assert.equal(b.status, 'no-active');
  assert.equal(F.formatNext(b.next), 'Next: /akili-propose');
});

// ================================================================ FR-11 branch

const readBranch = async (name, sub) => {
  const F = await loaded;
  const root = materialize(name);
  const c = counting(nodeIo());
  const branch = await F.readBranch(c.io, sub ? path.join(root, sub) : root, []);
  assert.deepEqual(c.calls.relative, []);
  return { branch, calls: c.calls };
};

test('FR-11 .git folder: ref: refs/heads/<name> shows ⎇ <name>', async () => {
  const F = await loaded;
  const { branch } = await readBranch('git-folder');
  assert.deepEqual(branch, { kind: 'branch', name: 'JuankCadavid/akili-panel', sha: '' });
  assert.deepEqual(header(F, { spec: 'changes/x', branch, moreActive: 0, archived: false }), ['Akili  changes/x', '⎇ JuankCadavid/akili-panel']);
});

test('FR-11 worktree: .git file with an absolute gitdir: reads that directory\'s HEAD', async () => {
  const { branch } = await readBranch('git-worktree-abs');
  assert.deepEqual(branch, { kind: 'branch', name: 'JuankCadavid/akili-panel', sha: '' });
});

test('FR-11 worktree: a relative gitdir: is resolved against the .git file\'s folder', async () => {
  const { branch } = await readBranch('git-worktree-rel');
  assert.deepEqual(branch, { kind: 'branch', name: 'JuankCadavid/akili-panel', sha: '' });
});

test('FR-11 no git: not a repository -> (no git)', async () => {
  const F = await loaded;
  const branch = await F.readBranch(memIo({ '/p/docs/prd.md': 'x' }), '/p/docs', []);
  assert.deepEqual(branch, { kind: 'none', name: '', sha: '' });
  assert.equal(F.branchLabel(branch), '(no git)');
  assert.deepEqual(header(F, { spec: 'changes/x', branch, moreActive: 0, archived: false }), ['Akili  changes/x', '(no git)']);
});

test('FR-11 unreadable or unrecognized HEAD, or a gitdir that does not exist -> (no git)', async () => {
  assert.deepEqual((await readBranch('git-bad-head')).branch, { kind: 'none', name: '', sha: '' });
  assert.deepEqual((await readBranch('git-dangling')).branch, { kind: 'none', name: '', sha: '' });
});

test('FR-11/FR-16 an unreadable HEAD is recorded in errors[]; a readable but garbage HEAD is not', async () => {
  const F = await loaded;
  const dangling = materialize('git-dangling');
  const errs = [];
  const b = await F.readBranch(nodeIo(), dangling, errs);
  assert.deepEqual(b, { kind: 'none', name: '', sha: '' });
  assert.equal(errs.length, 1);
  assert.ok(errs[0].path.replace(/\\/g, '/').endsWith('/meta/missing/HEAD'), `path was ${errs[0].path}`);
  const bad = materialize('git-bad-head');
  const errs2 = [];
  await F.readBranch(nodeIo(), bad, errs2);
  assert.deepEqual(errs2, []);
});

test('FR-16 a multi-line reason is collapsed: the error stays on one line', async () => {
  const F = await loaded;
  const lines = F.errorLines([{ path: '/x', reason: 'line1\nline2\r\n  line3' }], 500);
  assert.deepEqual(lines, ['Could not read /x: line1 line2 line3']);
});

test('FR-11 subfolder and detached: session in repo/packages/app, HEAD holds a commit id -> detached @<first 7>', async () => {
  const F = await loaded;
  const { branch } = await readBranch('git-subfolder', path.join('packages', 'app'));
  assert.deepEqual(branch, { kind: 'detached', name: '', sha: '0123456' });
  assert.equal(F.branchLabel(branch), 'detached @0123456');
});

test('FR-11 detached at the project root, and a 64-hex id', async () => {
  const F = await loaded;
  assert.deepEqual((await readBranch('git-detached')).branch, { kind: 'detached', name: '', sha: '0123456' });
  assert.deepEqual(F.parseHead(`${'ab'.repeat(32)}\n`), { kind: 'detached', name: '', sha: 'abababa' });
  assert.deepEqual(F.parseHead('ref: refs/remotes/origin/x\n'), { kind: 'none', name: '', sha: '' });
});

test('FR-11 Windows roots: backslash and drive-letter paths are cut as strings', async () => {
  const F = await loaded;
  const io = memIo({ 'C:/work/repo/.git/HEAD': 'ref: refs/heads/feat/win\n', 'C:/work/repo/packages/app/x.txt': 'x' });
  const c = counting(io);
  assert.deepEqual(await F.readBranch(c.io, 'C:\\work\\repo\\packages\\app', []), { kind: 'branch', name: 'feat/win', sha: '' });
  assert.deepEqual(c.calls.relative, []);
  assert.deepEqual(F.ancestors('C:\\a\\b'), ['C:/a/b', 'C:/a', 'C:']);
  assert.deepEqual(F.ancestors('/a/b'), ['/a/b', '/a', '']);
  assert.equal(F.joinPath('C:\\a\\b\\', 'docs/prd.md'), 'C:\\a\\b/docs/prd.md');
});

// ================================================================ FR-12 formatters

test('FR-12 numbers: below 1,000 as is, then k (one decimal under 10k), then M (one decimal)', async () => {
  const F = await loaded;
  const table = [[0, '0'], [999, '999'], [1000, '1.0k'], [1234, '1.2k'], [9949, '9.9k'], [9950, '10k'], [12345, '12k'],
    [999499, '999k'], [999999, '1.0M'], [1234567, '1.2M'], [12345678, '12.3M']];
  for (const [n, s] of table) assert.equal(F.shortenCount(n), s, String(n));
});

test('FR-12 session in = input + cache-read + cache-write, out = output; missing parts are 0', async () => {
  const F = await loaded;
  assert.deepEqual(F.turnTokens({ input_tokens: 10, cache_read_input_tokens: 200, cache_creation_input_tokens: 1142, output_tokens: 167 }), { in: 1352, out: 167 });
  assert.deepEqual(F.turnTokens({ output_tokens: 41 }), { in: 0, out: 41 });
  assert.deepEqual(F.turnTokens(undefined), { in: 0, out: 0 });
});

// ================================================================ FR-16 strings and truncation

test('FR-16 strings table: the English texts are data, pinned in one place', async () => {
  const F = await loaded;
  assert.ok(F.STRINGS, 'STRINGS exported');
  assert.equal(F.STRINGS.noSpecsFolder, 'No docs/specs/ folder yet.');
  assert.equal(F.STRINGS.noActive, 'No active spec.');
  assert.equal(F.STRINGS.readError('/p/docs/specs/x/tasks.md', 'EACCES: permission denied'), 'Could not read /p/docs/specs/x/tasks.md: EACCES: permission denied');
  assert.equal(F.STRINGS.moreActive(2), '(2 more active)');
  assert.equal(F.STRINGS.noGit, '(no git)');
  assert.equal(F.STRINGS.blocked, '(blocked)');
  assert.equal(F.STRINGS.noTaskStatus, '(no task status)');
  assert.equal(F.STRINGS.ctxMissing, 'ctx —');
});

test('FR-16 a read fails: one `Could not read <path>: <reason>` line, the rest of the pane still drawn', async () => {
  const F = await loaded;
  const root = materialize('phase-ladder');
  const inner = nodeIo();
  const io = { ...inner, read: async (p) => { if (p.endsWith('tasks.md')) throw new Error('EACCES: permission denied'); return inner.read(p); } };
  const view = await F.refresh(io, root, 'changes/s-execute');
  assert.ok(view, 'refresh survived a failing read');
  assert.equal(view.errors.length, 1);
  assert.equal(view.errors[0].path, `${root}/docs/specs/changes/s-execute/tasks.md`);
  assert.deepEqual(F.errorLines(view.errors, 500), [`Could not read ${root}/docs/specs/changes/s-execute/tasks.md: EACCES: permission denied`]);
  assert.equal(view.spec, 'changes/s-execute');
  assert.equal(view.phases.length, 6);
});

test('FR-16 a failing list or exists never throws out of refresh; the path and reason land in errors[]', async () => {
  const F = await loaded;
  const root = materialize('phase-ladder');
  const inner = nodeIo();
  const io = {
    list: async (p) => { if (p.endsWith('/changes/s-test')) throw new Error('EIO: boom'); return inner.list(p); },
    exists: async (p) => { if (p.endsWith('/docs/prd.md')) throw new Error('EPERM: nope'); return inner.exists(p); },
    read: inner.read,
  };
  const view = await F.refresh(io, root, null);
  assert.ok(view);
  assert.deepEqual(view.errors.map((e) => e.reason).sort(), ['EIO: boom', 'EPERM: nope']);
  assert.ok(F.errorLines([1, 2, 3, 4, 5].map((i) => ({ path: `/p${i}`, reason: 'r' })), 500).length === 3, 'at most 3 error lines');
});

test('FR-16 pane narrower than the header: the spec path is shortened in the middle with …', async () => {
  const F = await loaded;
  assert.equal(F.shortenMiddle('changes/akili-panel', 10), 'chang…anel');
  assert.equal(F.shortenMiddle('changes/akili-panel', 19), 'changes/akili-panel');
  const view = { spec: 'changes/akili-panel-long-name-here', branch: { kind: 'branch', name: 'JuankCadavid/akili-panel' }, moreActive: 2, archived: false };
  const [title, branch] = header(F, view, 40);
  assert.ok(title.length <= 40 && branch.length <= 40, `${title} | ${branch}`);
  assert.match(title, /…/);
  assert.ok(title.startsWith('Akili  ') && branch.endsWith('(2 more active)'), `${title} | ${branch}`);
});

test('FR-16 no line wraps past the pane width: header and every error line fit at every width', async () => {
  const F = await loaded;
  const view = { spec: 'changes/akili-panel-long-name-here', branch: { kind: 'branch', name: 'JuankCadavid/akili-panel' }, moreActive: 2, archived: true };
  const completed = { constitution: { present: 13, total: 13 }, phases: [], errors: [] };
  for (let cols = 1; cols <= 120; cols++) {
    for (const row of F.paneRows({ view: { ...completed, ...view }, usage: {}, sums: null, cols })) {
      const text = row.parts.map((q) => q.text).join('');
      assert.ok(text.length <= cols && (row.id === 'gap' || text.length > 0), `${row.id} at ${cols}`);
    }
    const e = F.errorLines([{ path: '/some/long/path/to/tasks.md', reason: 'EACCES: permission denied' }], cols);
    assert.ok(Array.isArray(e) && e[0].length <= cols, `error at ${cols}`);
  }
  assert.equal(F.fitLine('abcdef', 4), 'abc…');
  assert.equal(F.fitLine('abc', 4), 'abc');
});

// ================================================================ NFR-2 ceilings

test('NFR-2 absolute paths: every path handed to io is absolute (root joined with the relative part)', async () => {
  for (const [fx, kept] of [['phase-ladder', 'changes/s-execute'], ['git-worktree-rel', null], ['archived-alone', 'changes/a'], ['empty-project', null]]) {
    const { calls } = await run(fx, kept);
    assert.ok(calls.list.length + calls.exists.length > 0);
    assert.deepEqual(calls.relative, [], fx);
  }
});

test('NFR-2 a refresh with the kept spec present lists no archive/ and stays under every ceiling', async () => {
  const { calls, root } = await run('phase-ladder', 'changes/s-execute');
  // visited under docs/specs: the root, changes/, and 6 spec folders = 8 listings
  assert.ok(calls.list.length <= 8, `list ${calls.list.length}`);
  assert.deepEqual(calls.list.filter((p) => /\/docs\/specs\/archive$/.test(p)), [], `no archive listing (root ${root})`);
  assert.ok(calls.exists.length <= 35, `exists ${calls.exists.length}`);
  assert.ok(calls.read.length <= 3, `read ${calls.read.length}`);
});

test('NFR-2 archive/ is listed once, only when the kept spec folder is missing, and never entered below', async () => {
  const { calls } = await run('archived-alone', 'changes/a');
  assert.equal(calls.list.filter((p) => /\/docs\/specs\/archive$/.test(p)).length, 1);
  assert.deepEqual(calls.list.filter((p) => /\/docs\/specs\/archive\//.test(p)), []);
  const none = await run('archived-alone', null);
  assert.deepEqual(none.calls.list.filter((p) => /\/docs\/specs\/archive/.test(p)), []);
});

test('NFR-2 carve-out folders and spec folders are never listed (only the root and containers are)', async () => {
  const { calls, root } = await run('carve-outs', null);
  const rel = calls.list.map((p) => path.relative(path.join(root, 'docs', 'specs'), p).split(path.sep).join('/') || '.');
  for (const c of ['archive', 'general-setup', 'quick', 'kaizen', 'audits', 'reviews']) assert.ok(!rel.includes(c), c);
  assert.ok(calls.list.length <= 6, `list ${calls.list.length}: ${rel}`);
});

test('NFR-2 ceilings with a worktree: reads <= 3 (tasks.md, a .git file, HEAD), `.git` searches <= 20', async () => {
  const F = await loaded;
  const root = materialize('git-worktree-rel');
  const tasks = path.join(root, 'docs', 'specs', 'changes', 'x', 'tasks.md');
  fs.mkdirSync(path.dirname(tasks), { recursive: true });
  fs.writeFileSync(tasks, '| Status | `[x]` |\n');
  const c = counting(nodeIo());
  const view = await F.refresh(c.io, root, 'changes/x');
  assert.ok(view, 'refresh returned a snapshot');
  assert.equal(view.branch.name, 'JuankCadavid/akili-panel');
  assert.equal(c.calls.read.length, 3);
  const deep = `/${Array.from({ length: 30 }, (_, i) => `d${i}`).join('/')}`;
  const m = counting(memIo({ [`${deep}/x.txt`]: 'x' }));
  assert.equal((await F.readBranch(m.io, deep, [])).kind, 'none');
  assert.equal(m.calls.exists.filter((p) => p.endsWith('/.git')).length, 20);
  assert.ok(m.calls.read.length <= 3);
});

test('NFR-2 0 processes: the io has list, exists and read and nothing else to call', async () => {
  const F = await loaded;
  const c = counting(nodeIo());
  assert.deepEqual(Object.keys(c.io).sort(), ['exists', 'list', 'read']);
  await F.refresh(c.io, materialize('phase-ladder'), null);
  assert.ok(c.calls.list.length + c.calls.exists.length + c.calls.read.length > 0);
});

// ================================================================ changes/akili-panel-polish T2: the row builders
// Expected values come from changes/akili-panel-polish requirements.md (FR-2 to FR-8, NFR-2). `paneRows` is the one
// function the pane maps to elements: rows of `{ id, parts: [{ text, tone?, bold?, dim? }] }`, in the order drawn.

const U42 = { ctxPercent: 42, ctxTokens: 84000, ctxWindow: 200000, usd: 0.35 };
const U100 = { ctxPercent: 100, ctxTokens: 200000, ctxWindow: 200000, usd: 0.35 };
const SUMS = { in: 1234, out: 300 };
const pct = (p) => ({ ctxPercent: p, ctxTokens: 84000, ctxWindow: 200000 });
const pane = (F, over) => F.paneRows({ view: null, usage: {}, sums: { in: 0, out: 0 }, pending: null, cols: 200, ...over });
const rowOf = (rows, id) => rows.find((r) => r.id === id);
const textOf = (row) => row.parts.map((p) => p.text).join('');
const ids = (rows) => rows.map((r) => r.id);
const barParts = (row) => row.parts.filter((p) => /^[━─]+$/.test(p.text));
const filled = (row) => row.parts.filter((p) => /^━+$/.test(p.text)).reduce((n, p) => n + p.text.length, 0);
const cells = (row) => barParts(row).reduce((n, p) => n + p.text.length, 0);
const phaseRow = (rows, id) => rowOf(rows, `phase-${id}`);
const viewOf = async (fx, kept) => (await run(fx, kept)).view;
const ctxRowAt = async (p, cols = 200) => rowOf(pane(await loaded, { usage: pct(p), cols }), 'ctx');

test('T2 module shape: paneRows, ladderStep and fitParts are exported functions', async () => {
  const F = await loaded;
  for (const fn of ['paneRows', 'ladderStep', 'fitParts']) assert.equal(typeof F[fn], 'function', fn);
});

// ---------------------------------------------------------------- FR-2 colour by state

test('FR-2 a spec in execute: a done phase reads ✓ in success with its label inactive', async () => {
  const F = await loaded;
  const rows = pane(F, { view: await viewOf('blocked', 'changes/x') });
  const [label, mark] = phaseRow(rows, 'propose').parts;
  assert.deepEqual(mark, { text: '✓', tone: 'success' });
  assert.equal(label.text.trim(), 'propose');
  assert.equal(label.tone, 'inactive');
});

test('FR-2 a spec in execute: a not-reached phase reads ○ in inactive with its label inactive', async () => {
  const F = await loaded;
  const rows = pane(F, { view: await viewOf('blocked', 'changes/x') });
  const [label, mark] = phaseRow(rows, 'test').parts;
  assert.deepEqual(mark, { text: '○', tone: 'inactive' });
  assert.equal(label.tone, 'inactive');
});

test('FR-2 a spec in execute: the current phase reads ▶ in suggestion, bold, with its label suggestion and bold', async () => {
  const F = await loaded;
  const rows = pane(F, { view: await viewOf('phase-ladder', 'changes/s-execute') });
  const [label, mark] = phaseRow(rows, 'execute').parts;
  assert.deepEqual(mark, { text: '▶', tone: 'suggestion', bold: true });
  assert.equal(label.text.trim(), 'execute');
  assert.deepEqual([label.tone, label.bold], ['suggestion', true]);
});

test('FR-2 blocked: the current row reads ▶ (blocked) in warning, bold, label warning and bold', async () => {
  const F = await loaded;
  const rows = pane(F, { view: await viewOf('blocked', 'changes/x') });
  const [label, mark] = phaseRow(rows, 'execute').parts;
  assert.deepEqual(mark, { text: '▶ (blocked)', tone: 'warning', bold: true });
  assert.deepEqual([label.tone, label.bold], ['warning', true]);
});

test('FR-2 blocked AND IT MUST read the same words with colour removed: the row text states the state', async () => {
  const F = await loaded;
  const rows = pane(F, { view: await viewOf('blocked', 'changes/x'), cols: 28 });
  assert.match(textOf(phaseRow(rows, 'execute')), /execute\s+▶ \(blocked\)$/);
});

test('FR-2 no task status: the current row reads ▶ (no task status) in warning, bold, label warning and bold', async () => {
  const F = await loaded;
  const rows = pane(F, { view: await viewOf('no-status', 'changes/x') });
  const [label, mark] = phaseRow(rows, 'execute').parts;
  assert.deepEqual(mark, { text: '▶ (no task status)', tone: 'warning', bold: true });
  assert.deepEqual([label.tone, label.bold], ['warning', true]);
});

test('FR-2 BUT the marks are still ✓, ▶ and ○ with no fourth glyph', async () => {
  const F = await loaded;
  const rows = pane(F, { view: await viewOf('blocked', 'changes/x') });
  const glyphs = ['propose', 'specify', 'execute', 'test', 'validate', 'archive'].map((id) => phaseRow(rows, id).parts[1].text[0]);
  assert.deepEqual(glyphs, ['✓', '✓', '▶', '○', '○', '○']);
});

test('FR-2 a blocked note on specify takes the warning tone too (blocked reaches specify or execute only)', async () => {
  const F = await loaded;
  const view = await viewOf('blocked-specify', 'changes/x');
  assert.equal(view.phases[1].note, 'blocked');
  const [, mark] = phaseRow(pane(F, { view }), 'specify').parts;
  assert.deepEqual(mark, { text: '▶ (blocked)', tone: 'warning', bold: true });
});

test('FR-2 constitution all present: ✓ in success, label inactive', async () => {
  const F = await loaded;
  const rows = pane(F, { view: await viewOf('constitution-full', null) });
  const [label, mark] = rowOf(rows, 'constitution').parts;
  assert.deepEqual(mark, { text: '✓', tone: 'success' });
  assert.equal(label.tone, 'inactive');
});

test('FR-2 constitution some present: ▶ (k/13) in suggestion, not bold, label inactive', async () => {
  const F = await loaded;
  const view = await viewOf('constitution-partial', null);
  const [label, mark] = rowOf(pane(F, { view }), 'constitution').parts;
  assert.deepEqual(mark, { text: `▶ (${view.constitution.present}/13)`, tone: 'suggestion' });
  assert.ok(view.constitution.present > 0 && view.constitution.present < 13);
  assert.equal(label.tone, 'inactive');
});

test('FR-2 constitution none present: ○ in inactive, label inactive', async () => {
  const F = await loaded;
  const rows = pane(F, { view: await viewOf('empty-project', null) });
  const [label, mark] = rowOf(rows, 'constitution').parts;
  assert.deepEqual(mark, { text: '○', tone: 'inactive' });
  assert.equal(label.tone, 'inactive');
});

// ---------------------------------------------------------------- FR-3 cycle progress

test('FR-3 mid-cycle: the row ends 2/6', async () => {
  const F = await loaded;
  const rows = pane(F, { view: await viewOf('phase-ladder', 'changes/s-execute') });
  assert.match(textOf(rowOf(rows, 'cycle')), / 2\/6$/);
});

test('FR-3 mid-cycle AND the shares read done, done, current, then three empty', async () => {
  const F = await loaded;
  const shares = barParts(rowOf(pane(F, { view: await viewOf('phase-ladder', 'changes/s-execute') }), 'cycle'));
  assert.deepEqual(shares, [
    { text: '━━', tone: 'success' }, { text: '━━', tone: 'success' }, { text: '━━', tone: 'suggestion', bold: true },
    { text: '──', tone: 'subtle' }, { text: '──', tone: 'subtle' }, { text: '──', tone: 'subtle' },
  ]);
});

test('FR-3 the label is 02 Cycle, at the start of the row', async () => {
  const F = await loaded;
  const rows = pane(F, { view: await viewOf('phase-ladder', 'changes/s-execute') });
  assert.equal(rowOf(rows, 'cycle').parts[0].text.trimEnd(), '02 Cycle');
  assert.ok(!textOf(phaseRow(rows, 'propose')).includes('02'), 'the 02 label left the propose row');
});

test('FR-3 blocked: the current share uses the warning tone (on execute and on specify)', async () => {
  const F = await loaded;
  const onExecute = barParts(rowOf(pane(F, { view: await viewOf('blocked', 'changes/x') }), 'cycle'));
  assert.deepEqual(onExecute[2], { text: '━━', tone: 'warning', bold: true });
  const onSpecify = barParts(rowOf(pane(F, { view: await viewOf('blocked-specify', 'changes/x') }), 'cycle'));
  assert.deepEqual(onSpecify[1], { text: '━━', tone: 'warning', bold: true });
});

test('FR-3 no task status: the current share uses the warning tone', async () => {
  const F = await loaded;
  const shares = barParts(rowOf(pane(F, { view: await viewOf('no-status', 'changes/x') }), 'cycle'));
  assert.deepEqual(shares[2], { text: '━━', tone: 'warning', bold: true });
});

test('FR-3 archived: the row ends 6/6 and every share is done', async () => {
  const F = await loaded;
  const row = rowOf(pane(F, { view: await viewOf('archived-alone', 'changes/a') }), 'cycle');
  assert.match(textOf(row), / 6\/6$/);
  assert.deepEqual(barParts(row), Array.from({ length: 6 }, () => ({ text: '━━', tone: 'success' })));
});

test('FR-3 no spec to show: no cycle row, and the empty text stays as parent FR-16 states it', async () => {
  const F = await loaded;
  const none = pane(F, { view: await viewOf('empty-project', null) });
  assert.equal(rowOf(none, 'cycle'), undefined);
  assert.equal(textOf(rowOf(none, 'empty')), 'No docs/specs/ folder yet.');
  const idle = pane(F, { view: await viewOf('no-active', null) });
  assert.equal(rowOf(idle, 'cycle'), undefined);
  assert.equal(textOf(rowOf(idle, 'empty')), 'No active spec.');
});

// ---------------------------------------------------------------- FR-4 hierarchy

test('FR-4 block order: header, rule, constitution and cycle, flow, error rows, rule, tokens, a blank row, Next', async () => {
  const F = await loaded;
  const view = { ...(await viewOf('blocked', 'changes/x')), errors: [{ path: '/p/a.md', reason: 'EACCES' }] };
  assert.deepEqual(ids(pane(F, { view, usage: U42, sums: SUMS })), [
    'title', 'branch', 'rule-top', 'constitution', 'cycle',
    'phase-propose', 'phase-specify', 'phase-execute', 'phase-test', 'phase-validate', 'phase-archive',
    'error-0', 'rule-tokens', 'ctx', 'session', 'model', 'gap', 'next',
  ]);
});

test('FR-4 header row 1: Akili in bold, two spaces, the spec path', async () => {
  const F = await loaded;
  const row = rowOf(pane(F, { view: V({ spec: 'changes/x', branch: { kind: 'none' } }) }), 'title');
  assert.deepEqual(row.parts, [{ text: 'Akili', bold: true }, { text: '  changes/x' }]);
});

test('FR-4 header row 2: the branch label in inactive, then · archived, then (n more active)', async () => {
  const F = await loaded;
  const view = V({ spec: 'changes/x', archived: true, moreActive: 2, branch: { kind: 'branch', name: 'feat/b', sha: '' } });
  const row = rowOf(pane(F, { view }), 'branch');
  assert.equal(textOf(row), '⎇ feat/b · archived (2 more active)');
  assert.ok(row.parts.every((p) => p.tone === 'inactive'));
});

test('FR-4 header row 2 leaves out · archived and the tail when neither applies', async () => {
  const F = await loaded;
  const row = rowOf(pane(F, { view: V({ branch: { kind: 'branch', name: 'feat/b', sha: '' } }) }), 'branch');
  assert.equal(textOf(row), '⎇ feat/b');
});

test('FR-4 rule: ─ repeated to the row width, in subtle', async () => {
  const F = await loaded;
  const rule = rowOf(pane(F, { view: V(), cols: 30 }), 'rule-top');
  assert.deepEqual(rule.parts, [{ text: '─'.repeat(30), tone: 'subtle' }]);
});

test('FR-4 the second rule sits after the error rows and before the token block', async () => {
  const F = await loaded;
  const rows = pane(F, { view: V({ phases: at('execute'), errors: [{ path: '/p', reason: 'r' }] }) });
  assert.ok(ids(rows).indexOf('error-0') < ids(rows).indexOf('rule-tokens'));
  assert.ok(ids(rows).indexOf('rule-tokens') < ids(rows).indexOf('ctx'));
});

test('FR-4 flow: every mark and both bars start in one column, 17 characters in', async () => {
  const F = await loaded;
  const rows = pane(F, { view: await viewOf('phase-ladder', 'changes/s-execute'), usage: U42, sums: SUMS });
  for (const id of ['constitution', 'cycle', 'phase-propose', 'phase-execute', 'phase-archive', 'ctx', 'session']) {
    assert.equal(rowOf(rows, id).parts[0].text.length, 17, id);
  }
});

test('FR-4 header before the first refresh: Akili and the token block', async () => {
  const F = await loaded;
  assert.deepEqual(ids(pane(F, {})), ['title', 'ctx', 'session', 'model']);
  assert.equal(textOf(rowOf(pane(F, {}), 'title')), 'Akili');
});

test('FR-4 header before the first refresh BUT no rule above an empty flow block', async () => {
  const F = await loaded;
  assert.ok(!ids(pane(F, {})).some((id) => id.startsWith('rule')));
});

test('FR-4 no repository: header row 2 reads (no git)', async () => {
  const F = await loaded;
  assert.equal(textOf(rowOf(pane(F, { view: await viewOf('specify-progress', null) }), 'branch')), '(no git)');
});

test('FR-4 a detached HEAD reads detached @<sha> with no ⎇', async () => {
  const F = await loaded;
  const row = rowOf(pane(F, { view: V({ branch: { kind: 'detached', name: '', sha: '0123456' } }) }), 'branch');
  assert.equal(textOf(row), 'detached @0123456');
});

test('FR-4 the 02 label is on the Cycle row and the propose row starts at the indent', async () => {
  const F = await loaded;
  const rows = pane(F, { view: await viewOf('phase-ladder', 'changes/s-specify') });
  assert.equal(textOf(phaseRow(rows, 'propose')).slice(0, 10), '   propose');
});

// ---------------------------------------------------------------- FR-5 token block

test('FR-5 the ctx row: a bar, <p>%, then <used>/<window>', async () => {
  const F = await loaded;
  const row = rowOf(pane(F, { usage: U42 }), 'ctx');
  assert.deepEqual(row.parts.slice(1), [
    { text: '━━━━━', tone: 'suggestion' }, { text: '───────', tone: 'subtle' }, { text: ' 42%' }, { text: '  84k/200k' },
  ]);
  assert.equal(row.parts[0].text, 'ctx'.padEnd(17));
});

test('FR-5 the session row: <in> in / <out> out, then · $<usd>', async () => {
  const F = await loaded;
  const row = rowOf(pane(F, { usage: U42, sums: SUMS }), 'session');
  assert.equal(row.parts[0].text, 'session'.padEnd(17));
  assert.equal(textOf(row).slice(17), '1.2k in / 300 out · $0.35');
});

test('FR-5 sums and shortening stay: session in = the sums as shortened by shortenCount', async () => {
  const F = await loaded;
  const row = rowOf(pane(F, { sums: { in: 1500000, out: 999 }, usage: pct(10) }), 'session');
  assert.equal(textOf(row).slice(17), '1.5M in / 999 out');
});

test('FR-5 fresh session: the ctx row value is — with no bar', async () => {
  const F = await loaded;
  const row = rowOf(pane(F, { usage: {} }), 'ctx');
  assert.equal(textOf(row).slice(17), '—');
  assert.deepEqual(barParts(row), []);
});

test('FR-5 fresh session: the session row value is 0 in / 0 out and the $ part is left out', async () => {
  const F = await loaded;
  assert.equal(textOf(rowOf(pane(F, { usage: {} }), 'session')).slice(17), '0 in / 0 out');
});

test('FR-5 the Tokens: prefix is removed', async () => {
  const F = await loaded;
  const rows = pane(F, { view: await viewOf('blocked', 'changes/x'), usage: U42, sums: SUMS });
  assert.ok(!rows.some((r) => textOf(r).includes('Tokens:')));
});

for (const [p, tone] of [[79, 'suggestion'], [80, 'warning'], [94, 'warning'], [95, 'error'], [96, 'error']]) {
  test(`FR-5 thresholds: <p> of ${p} fills in ${tone}`, async () => {
    const row = await ctxRowAt(p);
    assert.equal(row.parts.find((x) => /^━+$/.test(x.text)).tone, tone);
  });
}

test('FR-5 thresholds: a raw fill of 79.6 reads 80% in warning', async () => {
  const row = await ctxRowAt(79.6);
  assert.match(textOf(row), / 80%/);
  assert.equal(row.parts.find((x) => /^━+$/.test(x.text)).tone, 'warning');
});

test('FR-5 the empty part of the bar is subtle', async () => {
  const row = await ctxRowAt(42);
  assert.equal(row.parts.find((x) => /^─+$/.test(x.text)).tone, 'subtle');
});

test('FR-5 fill: <p> as a share of 12 cells, rounded', async () => {
  assert.equal(filled(await ctxRowAt(50)), 6);
  assert.equal(filled(await ctxRowAt(42)), 5);
  assert.equal(cells(await ctxRowAt(42)), 12);
});

test('FR-5 fill: any <p> above 0 fills at least one cell', async () => {
  assert.equal(filled(await ctxRowAt(1)), 1);
  assert.equal(filled(await ctxRowAt(0)), 0);
});

test('FR-5 fill and minimum use <p> rounded: 20.6 fills 3 cells, 0.3 reads 0% with none', async () => {
  assert.equal(filled(await ctxRowAt(20.6)), 3);
  const low = await ctxRowAt(0.3);
  assert.equal(filled(low), 0);
  assert.match(textOf(low), / 0%/);
});

test('FR-5 fill: <p> of 100 or more fills the whole bar', async () => {
  assert.equal(filled(await ctxRowAt(100)), 12);
  assert.equal(filled(await ctxRowAt(130)), 12);
  assert.equal(cells(await ctxRowAt(130)), 12);
});

test('FR-5 high context fill: the error tone and nothing more (a row, no extra rows)', async () => {
  const F = await loaded;
  assert.deepEqual(ids(pane(F, { usage: pct(96) })), ['title', 'ctx', 'session', 'model']);
});

// ---------------------------------------------------------------- FR-6 Next

test('FR-6 the Next row carries the command, args and the label Next: /<command> <args>', async () => {
  const F = await loaded;
  const row = rowOf(pane(F, { view: await viewOf('blocked', 'changes/x') }), 'next');
  assert.deepEqual(row.next, { command: 'akili-execute', args: 'changes/x', label: 'Next: /akili-execute changes/x', pending: false });
});

test('FR-6 run in progress: the same words, flagged pending', async () => {
  const F = await loaded;
  const view = await viewOf('blocked', 'changes/x');
  const ready = rowOf(pane(F, { view }), 'next').next;
  const busy = rowOf(pane(F, { view, pending: { since: 1, command: 'akili-execute' } }), 'next').next;
  assert.equal(busy.pending, true);
  assert.equal(busy.label, ready.label);
});

test('FR-6 the label is cut to the width less 2 (the chip adds one space at each end)', async () => {
  const F = await loaded;
  const next = rowOf(pane(F, { view: await viewOf('blocked', 'changes/x'), cols: 20 }), 'next').next;
  assert.equal(next.label.length, 18);
  assert.ok(next.label.endsWith('…'));
});

test('FR-6 a blank row sits above Next', async () => {
  const F = await loaded;
  const rows = pane(F, { view: await viewOf('blocked', 'changes/x') });
  assert.deepEqual(rowOf(rows, 'gap'), { id: 'gap', parts: [] });
  assert.equal(ids(rows).indexOf('gap') + 1, ids(rows).indexOf('next'));
});

test('FR-6 no next step: no button row and no blank row', async () => {
  const F = await loaded;
  const rows = pane(F, { view: V({ phases: at('execute'), next: null }) });
  assert.equal(rowOf(rows, 'next'), undefined);
  assert.equal(rowOf(rows, 'gap'), undefined);
});

// ---------------------------------------------------------------- FR-7 narrow panes: the ladder

const LADDER_VIEW = async () => ({ ...(await viewOf('blocked', 'changes/x')), constitution: { present: 13, total: 13 } });
const NARROW = { usage: U100, sums: SUMS };

test('FR-7 step 1 holds nothing back while every row fits: 45 columns', async () => {
  const F = await loaded;
  const view = await LADDER_VIEW();
  assert.equal(F.ladderStep({ view, ...NARROW, cols: 45 }), 1);
  const rows = pane(F, { view, ...NARROW, cols: 45 });
  assert.match(textOf(rowOf(rows, 'session')), /\$0\.35$/);
  assert.match(textOf(rowOf(rows, 'ctx')), /200k\/200k$/);
});

test('FR-7 the order: at a width between steps 3 and 4 the session row and <used>/<window> are both gone', async () => {
  const F = await loaded;
  const view = await LADDER_VIEW();
  assert.equal(F.ladderStep({ view, ...NARROW, cols: 44 }), 4);
  const rows = pane(F, { view, ...NARROW, cols: 44 });
  assert.equal(rowOf(rows, 'session'), undefined);
  assert.match(textOf(rowOf(rows, 'ctx')), / 100%$/);
});

test('FR-7 step 2 drops · $<usd> first: the session row survives without it', async () => {
  const F = await loaded;
  const input = { view: V({ status: 'no-active', spec: null, branch: { kind: 'none' } }), usage: { usd: 0.35 }, sums: { in: 1, out: 2 }, pending: null, cols: 36 };
  assert.equal(F.ladderStep(input), 2);
  assert.equal(textOf(rowOf(F.paneRows(input), 'session')).slice(17), '1 in / 2 out');
});

test('FR-7 step 5 halves both bars to 6 cells', async () => {
  const F = await loaded;
  const rows = pane(F, { view: await LADDER_VIEW(), ...NARROW, cols: 30 });
  assert.equal(cells(rowOf(rows, 'ctx')), 6);
  assert.equal(cells(rowOf(rows, 'cycle')), 6);
  assert.equal(rowOf(rows, 'ctx').parts[0].text.length, 17);
});

test('FR-7 step 5 halved cycle bar gives each phase one cell', async () => {
  const F = await loaded;
  const rows = pane(F, { view: await LADDER_VIEW(), ...NARROW, cols: 30 });
  assert.deepEqual(barParts(rowOf(rows, 'cycle')).map((p) => p.text), ['━', '━', '━', '─', '─', '─']);
});

test('FR-7 step 6 moves the mark column from 17 to 13 and the constitution label becomes 01 Constit…', async () => {
  const F = await loaded;
  const rows = pane(F, { view: await LADDER_VIEW(), ...NARROW, cols: 26 });
  assert.equal(F.ladderStep({ view: await LADDER_VIEW(), ...NARROW, cols: 26 }), 6);
  assert.equal(rowOf(rows, 'constitution').parts[0].text, '01 Constit…  ');
  assert.equal(rowOf(rows, 'phase-execute').parts[0].text.length, 13);
});

test('FR-7 step 7 takes both bars away; <done>/6 and <p>% stay', async () => {
  const F = await loaded;
  const rows = pane(F, { view: await LADDER_VIEW(), ...NARROW, cols: 20 });
  assert.equal(F.ladderStep({ view: await LADDER_VIEW(), ...NARROW, cols: 20 }), 7);
  assert.deepEqual(barParts(rowOf(rows, 'cycle')).concat(barParts(rowOf(rows, 'ctx'))), []);
  assert.equal(textOf(rowOf(rows, 'cycle')).slice(13), '2/6');
  assert.equal(textOf(rowOf(rows, 'ctx')).slice(13), '100%');
});

test('FR-7 the guarantee at 31 columns: ▶ (no task status) reads whole', async () => {
  const F = await loaded;
  const rows = pane(F, { view: await viewOf('no-status', 'changes/x'), ...NARROW, cols: 31 });
  assert.match(textOf(phaseRow(rows, 'execute')), /▶ \(no task status\)$/);
});

test('FR-7 the guarantee at 24 columns: ▶ (blocked), 2/6 and 100% are whole', async () => {
  const F = await loaded;
  const rows = pane(F, { view: await LADDER_VIEW(), ...NARROW, cols: 24 });
  assert.match(textOf(phaseRow(rows, 'execute')), /▶ \(blocked\)$/);
  assert.match(textOf(rowOf(rows, 'cycle')), / 2\/6$/);
  assert.match(textOf(rowOf(rows, 'ctx')), / 100%$/);
});

test('FR-7 the guarantee at 24 columns: ▶ (k/13) is whole', async () => {
  const F = await loaded;
  const view = V({ phases: at('execute'), constitution: { present: 5, total: 13 }, branch: { kind: 'none' } });
  assert.match(textOf(rowOf(pane(F, { view, cols: 24 }), 'constitution')), /▶ \(5\/13\)$/);
});

test('FR-7 the guarantee at 17 columns: <done>/6 and <p>% are whole', async () => {
  const F = await loaded;
  const rows = pane(F, { view: await LADDER_VIEW(), ...NARROW, cols: 17 });
  assert.match(textOf(rowOf(rows, 'cycle')), /2\/6$/);
  assert.match(textOf(rowOf(rows, 'ctx')), /100%$/);
});

test('FR-7 the guarantee at 14 columns: every mark is whole, blocked and constitution rows included', async () => {
  const F = await loaded;
  const rows = pane(F, { view: await LADDER_VIEW(), ...NARROW, cols: 14 });
  const marks = ['constitution', 'phase-propose', 'phase-specify', 'phase-execute', 'phase-test', 'phase-validate', 'phase-archive']
    .map((id) => textOf(rowOf(rows, id))[13]);
  assert.deepEqual(marks, ['✓', '✓', '✓', '▶', '○', '○', '○']);
});

test('FR-7 at exactly 14 columns a partial constitution row keeps its ▶ as the last cell', async () => {
  const F = await loaded;
  const view = V({ phases: at('execute'), constitution: { present: 5, total: 13 }, branch: { kind: 'none' } });
  const text = textOf(rowOf(pane(F, { view, cols: 14 }), 'constitution'));
  assert.equal(text.length, 14);
  assert.equal(text[13], '▶');
});

test('FR-7 at exactly 14 columns a noted row keeps its mark and omits the …; at 15 it reads ▶…', async () => {
  const F = await loaded;
  const at14 = textOf(phaseRow(pane(F, { view: await LADDER_VIEW(), ...NARROW, cols: 14 }), 'execute'));
  assert.equal(at14.slice(13), '▶');
  assert.ok(!at14.includes('…'));
  assert.equal(textOf(phaseRow(pane(F, { view: await LADDER_VIEW(), ...NARROW, cols: 15 }), 'execute')).slice(13), '▶…');
});

test('FR-7 step 3 takes the session row but keeps <used>/<window>: 37 columns', async () => {
  const F = await loaded;
  const input = { view: V({ status: 'no-active', spec: null, branch: { kind: 'none' } }), usage: { ctxPercent: 5, ctxTokens: 1, ctxWindow: 2 }, sums: { in: 123456789, out: 98800000 }, pending: null, cols: 37 };
  assert.equal(F.ladderStep(input), 3);
  const rows = F.paneRows(input);
  assert.equal(rowOf(rows, 'session'), undefined);
  assert.match(textOf(rowOf(rows, 'ctx')), / 1\/2$/);
});

test('FR-7 a row still too wide after the last step is cut at its end with …', async () => {
  const F = await loaded;
  const rows = pane(F, { view: await LADDER_VIEW(), ...NARROW, cols: 20 });
  assert.equal(textOf(phaseRow(rows, 'execute')), '   execute   ▶ (blo…');
});

test('FR-7 under 60 columns: at 30 columns every row fits and ▶ (blocked), 2/6 and <p>% are readable', async () => {
  const F = await loaded;
  const rows = pane(F, { view: await LADDER_VIEW(), ...NARROW, cols: 30 });
  assert.ok(rows.every((r) => textOf(r).length <= 30));
  assert.match(textOf(phaseRow(rows, 'execute')), /▶ \(blocked\)/);
  assert.match(textOf(rowOf(rows, 'cycle')), /2\/6/);
  assert.match(textOf(rowOf(rows, 'ctx')), /100%/);
});

test('FR-7 at 24 columns: the marks sit at column 13 and the bars have 6 cells', async () => {
  const F = await loaded;
  const rows = pane(F, { view: await LADDER_VIEW(), ...NARROW, cols: 24 });
  assert.equal(phaseRow(rows, 'execute').parts[0].text.length, 13);
  assert.equal(cells(rowOf(rows, 'cycle')), 6);
  assert.equal(cells(rowOf(rows, 'ctx')), 6);
});

test('FR-7 below 24 columns: at 20 the blocked row is cut with … BUT its mark, 2/6 and <p>% are whole', async () => {
  const F = await loaded;
  const rows = pane(F, { view: await LADDER_VIEW(), ...NARROW, cols: 20 });
  const blocked = textOf(phaseRow(rows, 'execute'));
  assert.ok(blocked.endsWith('…'));
  assert.equal(blocked[13], '▶');
  assert.match(textOf(rowOf(rows, 'cycle')), /2\/6$/);
  assert.match(textOf(rowOf(rows, 'ctx')), /100%$/);
});

test('FR-7 any width: no row is wider than the width, from 1 to 120, for every state and the longest names', async () => {
  const F = await loaded;
  const longErrors = [1, 2, 3, 4].map((i) => ({ path: `/some/long/path/to/docs/specs/changes/tasks-${i}.md`, reason: 'EACCES: permission denied' }));
  const long = 'changes/an-extraordinarily-long-spec-name-for-the-polish-width-sweep';
  const states = [
    ['long-names', await viewOf('long-names', long)],
    ['blocked', await viewOf('blocked', 'changes/x')],
    ['blocked-specify', await viewOf('blocked-specify', 'changes/x')],
    ['no-status', await viewOf('no-status', 'changes/x')],
    ['current', await viewOf('phase-ladder', 'changes/s-execute')],
    ['archived', { ...(await viewOf('archived-alone', 'changes/a')), moreActive: 12 }],
    ['partial constitution', V({ phases: at('specify'), constitution: { present: 5, total: 13 }, branch: { kind: 'detached', name: '', sha: '0123456' } })],
    ['no-specs', await viewOf('empty-project', null)],
    ['no-active', await viewOf('no-active', null)],
    ['first draw', null],
  ];
  let cuts = 0;
  for (const [name, base] of states) {
    const view = base && { ...base, errors: longErrors };
    for (let cols = 1; cols <= 120; cols++) {
      const rows = F.paneRows({ view, usage: U100, sums: { in: 12345678, out: 987654 }, pending: null, cols });
      for (const r of rows) {
        const t = textOf(r);
        assert.ok(t.length <= cols, `${name} at ${cols}: ${r.id} is ${t.length} wide`);
        if (t.endsWith('…')) cuts++;
        for (const p of r.parts) assert.ok([undefined, 'success', 'inactive', 'suggestion', 'warning', 'error', 'subtle'].includes(p.tone), `${p.tone} is a theme key`);
        if (r.id === 'next' && cols >= 3) assert.ok(r.next.label.length + 2 <= cols, `${name} at ${cols}: the chip fits`);
      }
      if (view && cols >= 6) assert.equal(textOf(rowOf(rows, 'title')).slice(0, 5), 'Akili', `${name} at ${cols}`);
    }
  }
  assert.ok(cuts > 500, `the sweep forces cuts (${cuts})`);
});

test('FR-7 any width: the longest spec path and branch are shortened in the middle, not at the end', async () => {
  const F = await loaded;
  const long = 'changes/an-extraordinarily-long-spec-name-for-the-polish-width-sweep';
  const rows = pane(F, { view: await viewOf('long-names', long), cols: 40 });
  assert.match(textOf(rowOf(rows, 'title')), /^Akili {2}changes\/.*….*sweep$/);
  assert.match(textOf(rowOf(rows, 'branch')), /…/);
  assert.ok(textOf(rowOf(rows, 'branch')).endsWith('(2 more active)'));
});

for (const cols of [undefined, 0, -3, NaN]) {
  test(`FR-7 no width given (${String(cols)}): the ladder stays at step 1 and no row is cut`, async () => {
    const F = await loaded;
    const long = 'changes/an-extraordinarily-long-spec-name-for-the-polish-width-sweep';
    const view = await viewOf('long-names', long);
    const input = { view, usage: U100, sums: SUMS, pending: null, cols };
    assert.equal(F.ladderStep(input), 1);
    const rows = F.paneRows(input);
    assert.ok(rows.every((r) => !textOf(r).includes('…')));
    assert.equal(textOf(rowOf(rows, 'title')), `Akili  ${long}`);
    assert.equal(textOf(rowOf(rows, 'rule-top')), '─'.repeat(40));
    assert.equal(rowOf(rows, 'next').next.label, 'Next: /akili-execute ' + long);
  });
}

test('FR-7 fitParts cuts from the end, keeps the first parts whole and ends with …', async () => {
  const F = await loaded;
  assert.deepEqual(F.fitParts([{ text: 'abc', tone: 'success' }, { text: 'defgh', tone: 'error' }], 6), [{ text: 'abc', tone: 'success' }, { text: 'de', tone: 'error' }, { text: '…', tone: 'error' }]);
  assert.deepEqual(F.fitParts([{ text: 'abc' }], 1), [{ text: '…' }]);
  assert.deepEqual(F.fitParts([{ text: 'abc' }], 3), [{ text: 'abc' }]);
});

// ---------------------------------------------------------------- FR-8 read failures and empty text

test('FR-8 a read fails: its row uses the error tone with the parent wording', async () => {
  const F = await loaded;
  const view = { ...(await viewOf('blocked', 'changes/x')), errors: [{ path: '/p/tasks.md', reason: 'EACCES: permission denied' }] };
  const row = rowOf(pane(F, { view }), 'error-0');
  assert.deepEqual(row.parts, [{ text: 'Could not read /p/tasks.md: EACCES: permission denied', tone: 'error' }]);
});

test('FR-8 a read fails AND the rest of the pane still draws; at most three error rows', async () => {
  const F = await loaded;
  const errors = [1, 2, 3, 4, 5].map((i) => ({ path: `/p${i}`, reason: 'r' }));
  const rows = pane(F, { view: { ...(await viewOf('blocked', 'changes/x')), errors }, usage: U42, sums: SUMS });
  assert.deepEqual(ids(rows).filter((id) => id.startsWith('error')), ['error-0', 'error-1', 'error-2']);
  assert.ok(rowOf(rows, 'next') && rowOf(rows, 'ctx'));
});

test('FR-8 empty-state text stays dim, wording unchanged', async () => {
  const F = await loaded;
  const row = rowOf(pane(F, { view: await viewOf('empty-project', null) }), 'empty');
  assert.deepEqual(row.parts, [{ text: 'No docs/specs/ folder yet.', dim: true }]);
});

test('FR-8 the empty states draw header, rule, constitution, empty text, rule, tokens and Next', async () => {
  const F = await loaded;
  assert.deepEqual(ids(pane(F, { view: await viewOf('empty-project', null) })), [
    'title', 'branch', 'rule-top', 'constitution', 'empty', 'rule-tokens', 'ctx', 'session', 'model', 'gap', 'next',
  ]);
});

test('FR-12 a reported cost of 0 reads $0.00, and a missing usage reads ctx — with no $ (paneRows)', async () => {
  const F = await loaded;
  const last = (usage) => textOf(rowOf(pane(F, { usage }), 'session'));
  assert.match(last({ usd: 0 }), /0 in \/ 0 out · \$0\.00$/);
  for (const usage of [null, undefined]) {
    assert.match(textOf(rowOf(pane(F, { usage }), 'ctx')), /ctx\s+—$/);
    assert.doesNotMatch(last(usage), /\$/);
  }
});

// ---------------------------------------------------------------- changes/akili-panel-model-skills T2: model row and Skills section
// Expected values come from requirements.md FR-1..FR-8 and design.md §8; the names are literals, not the catalog.

const OPUS = 'claude-opus-5-5';
const LONG_MODEL = 'claude-an-extraordinarily-long-model-identifier-for-the-narrow-pane-case-1';
const SKILL_NAMES = {
  core: ['brainstorming', 'caveman', 'cognitive-doc-design', 'judgment-day', 'kaizen', 'pr-review', 'product-manager-toolkit', 'security-audit', 'seo-audit', 'social-marketing', 'software-architect', 'systematic-debugging'],
  conditional: ['diagram-design', 'frontend-design', 'gsap-animation', 'impeccable', 'impeccable-bridge', 'stitch-design', 'tdd', 'ui-ux-pro-max', 'video-production'],
  stack: ['ai-agent-development', 'angular-developer', 'api-design-principles', 'aws-serverless', 'error-handling-patterns', 'golang-pro', 'nestjs-expert', 'react-doctor', 'shadcn-ui', 'tailwind-design-system', 'vercel-react-best-practices'],
};
const ALL_NAMES = [...SKILL_NAMES.core, ...SKILL_NAMES.conditional, ...SKILL_NAMES.stack];
const HOST_ALL = { model: OPUS, skills: ALL_NAMES };
const CLOSED = { open: false, group: null };
const OPEN = (group = null) => ({ open: true, group });
const skillPane = async (over) => pane(await loaded, { view: await viewOf('blocked', 'changes/x'), usage: U42, sums: SUMS, host: HOST_ALL, skillsUi: CLOSED, ...over });
const ADDED = ['model', 'rule-skills', 'skills'];

// FR-1 model row

test('FR-1 Shown: a row reads model, then the id as returned, after the session row', async () => {
  const rows = await skillPane({ host: { model: OPUS, skills: null } });
  const row = rowOf(rows, 'model');
  assert.equal(textOf(row), `model            ${OPUS}`);
  assert.equal(ids(rows).indexOf('model'), ids(rows).indexOf('session') + 1);
});

test('FR-1 Shown BUT no alias: a full id at full width is never renamed or shortened', async () => {
  for (const id of ['claude-haiku-5-5', 'claude-opus-4-1-20250805', LONG_MODEL]) {
    const row = rowOf(await skillPane({ host: { model: id, skills: null }, cols: 200 }), 'model');
    assert.equal(row.parts[1].text, id);
  }
});

test('FR-1 Shown AND same label column and tone: the label is as wide as ctx and session, no tone on any part', async () => {
  const rows = await skillPane({ host: { model: OPUS, skills: null } });
  const model = rowOf(rows, 'model');
  assert.equal(model.parts[0].text.length, rowOf(rows, 'ctx').parts[0].text.length);
  assert.equal(model.parts[0].text.length, rowOf(rows, 'session').parts[0].text.length);
  assert.equal(model.parts[0].text.trimEnd(), 'model');
  for (const p of model.parts) assert.equal(p.tone, undefined);
  assert.deepEqual(model.parts[0], { text: 'model            ' });
});

test('FR-1 Model unknown: a null, empty or missing model reads model —', async () => {
  const F = await loaded;
  for (const host of [{ model: null, skills: null }, { model: '', skills: null }, { skills: null }, null, undefined]) {
    assert.equal(textOf(rowOf(pane(F, { host }), 'model')), 'model            —', JSON.stringify(host));
  }
});

test('FR-1 Model unknown BUT no hide and no toast: the rest of the pane and Next still draw, no error row', async () => {
  const rows = await skillPane({ host: { model: null, skills: ALL_NAMES } });
  for (const id of ['title', 'constitution', 'cycle', 'ctx', 'session', 'next', 'skills']) assert.ok(rowOf(rows, id), id);
  assert.ok(!ids(rows).some((id) => id.startsWith('error')));
});

// FR-2 Skills row

test('FR-2 Closed: Skills (<n>) ▸ after Next, behind its own rule, <n> counting the listed skills', async () => {
  const rows = await skillPane({ host: { model: OPUS, skills: ['tdd', 'kaizen', 'caveman'] } });
  assert.equal(textOf(rowOf(rows, 'skills')), 'Skills (3) ▸');
  assert.deepEqual(ids(rows).slice(ids(rows).indexOf('next')), ['next', 'rule-skills', 'skills']);
  assert.deepEqual(rowOf(rows, 'rule-skills').parts, [{ text: '─'.repeat(200), tone: 'subtle' }]);
  assert.equal(textOf(rowOf(await skillPane(), 'skills')), 'Skills (32) ▸');
});

test('FR-2 Closed BUT no skill before the press: no group row, no skill row, no skill name', async () => {
  const rows = await skillPane();
  assert.ok(!ids(rows).some((id) => id.startsWith('skills-group') || id.startsWith('skill-')));
  for (const n of ALL_NAMES) assert.ok(!rows.some((r) => textOf(r).includes(n)), n);
});

test('FR-2 Closed even when a group was left set: the section closed shows nothing below Skills', async () => {
  const rows = await skillPane({ skillsUi: { open: false, group: 'core' } });
  assert.ok(!ids(rows).some((id) => id.startsWith('skills-group') || id.startsWith('skill-')));
});

test('FR-2 Open and close: open reads ▾ with the group rows, each closed; closed reads ▸ again', async () => {
  const open = await skillPane({ skillsUi: OPEN() });
  assert.equal(textOf(rowOf(open, 'skills')), 'Skills (32) ▾');
  assert.deepEqual(ids(open).filter((id) => id.startsWith('skills-group')), ['skills-group-core', 'skills-group-conditional', 'skills-group-stack']);
  assert.deepEqual(['core', 'conditional', 'stack'].map((b) => textOf(rowOf(open, `skills-group-${b}`))), ['  core (12) ▸', '  conditional (9) ▸', '  stack (11) ▸']);
  assert.equal(textOf(rowOf(await skillPane({ skillsUi: CLOSED }), 'skills')), 'Skills (32) ▸');
});

test('FR-2 Nothing listed: no Skills row and no rule when none is runnable or the list is unknown', async () => {
  for (const skills of [[], null, undefined, ['model', 'akili-propose', 'not-a-skill']]) {
    const rows = await skillPane({ host: { model: OPUS, skills }, skillsUi: OPEN('core') });
    assert.ok(!ids(rows).some((id) => id === 'rule-skills' || id === 'skills' || id.startsWith('skills-') || id.startsWith('skill-')), JSON.stringify(skills));
  }
});

test('FR-2 Nothing listed AND no error line: the rest of the pane is unchanged', async () => {
  const none = await skillPane({ host: { model: OPUS, skills: [] } });
  assert.ok(!ids(none).some((id) => id.startsWith('error')));
  assert.deepEqual(ids(none), ids(await skillPane({ host: { model: OPUS, skills: null }, skillsUi: OPEN() })));
});

// FR-3 groups

test('FR-3 Open a group: its skills follow its row, one per row, alphabetical, four spaces in', async () => {
  const rows = await skillPane({ skillsUi: OPEN('conditional') });
  const at = ids(rows).indexOf('skills-group-conditional');
  assert.equal(textOf(rows[at]), '  conditional (9) ▾');
  assert.deepEqual(rows.slice(at + 1, at + 10).map(textOf), SKILL_NAMES.conditional.map((n) => `    ${n}`));
  assert.equal(ids(rows)[at + 10], 'skills-group-stack');
});

test('FR-3 groups are in the order core, conditional, stack and skills are alphabetical inside each', async () => {
  for (const b of ['core', 'conditional', 'stack']) {
    const rows = await skillPane({ skillsUi: OPEN(b) });
    const names = ids(rows).filter((id) => id.startsWith('skill-')).map((id) => id.slice(6));
    assert.deepEqual(names, SKILL_NAMES[b], b);
    assert.deepEqual(names, [...names].sort(), `${b} is sorted`);
  }
});

test('FR-3 the catalog is stored in alphabetical order, so each listed group is too', async () => {
  const F = await loaded;
  const all = F.SKILL_CATALOG.map((e) => e.name);
  assert.deepEqual(all, [...all].sort());
  const g = F.listedSkills(ALL_NAMES);
  for (const b of ['core', 'conditional', 'stack']) assert.deepEqual(g[b].map((e) => e.name), SKILL_NAMES[b], b);
});

test('FR-3 Open another group BUT never two open: only the asked group shows ▾ and skill rows', async () => {
  for (const [group, others] of [['core', ['conditional', 'stack']], ['conditional', ['core', 'stack']], ['stack', ['core', 'conditional']]]) {
    const rows = await skillPane({ skillsUi: OPEN(group) });
    assert.ok(textOf(rowOf(rows, `skills-group-${group}`)).endsWith('▾'), group);
    for (const o of others) assert.ok(textOf(rowOf(rows, `skills-group-${o}`)).endsWith('▸'), `${o} closed while ${group} is open`);
    assert.equal(ids(rows).filter((id) => id.startsWith('skills-group')).filter((id) => textOf(rowOf(rows, id)).endsWith('▾')).length, 1);
    assert.deepEqual(ids(rows).filter((id) => id.startsWith('skill-')).map((id) => id.slice(6)), SKILL_NAMES[group]);
  }
});

test('FR-3 Close the open group: with no group set, every group reads ▸ and no skill shows', async () => {
  const rows = await skillPane({ skillsUi: OPEN(null) });
  assert.ok(ids(rows).filter((id) => id.startsWith('skills-group')).every((id) => textOf(rowOf(rows, id)).endsWith('▸')));
  assert.ok(!ids(rows).some((id) => id.startsWith('skill-')));
});

test('FR-3 an empty group is not drawn, and an open group that is empty shows nothing', async () => {
  const rows = await skillPane({ host: { model: OPUS, skills: ['tdd', 'kaizen'] }, skillsUi: OPEN('stack') });
  assert.deepEqual(ids(rows).filter((id) => id.startsWith('skills-group')), ['skills-group-core', 'skills-group-conditional']);
  assert.ok(!ids(rows).some((id) => id.startsWith('skill-')));
  assert.equal(textOf(rowOf(rows, 'skills')), 'Skills (2) ▾');
});

// FR-4 (row part), FR-5

test('FR-4 Double press: the pending skill row is dim and the others are not; Next still flags pending', async () => {
  const rows = await skillPane({ skillsUi: OPEN('conditional'), pending: { since: 1, command: 'tdd' } });
  assert.equal(rowOf(rows, 'skill-tdd').parts[0].dim, true);
  assert.equal(rowOf(rows, 'skill-impeccable').parts[0].dim, undefined);
  assert.equal(rowOf(rows, 'next').next.pending, true);
  assert.equal(rowOf((await skillPane({ skillsUi: OPEN('conditional') })), 'skill-tdd').parts[0].dim, undefined);
});

test('FR-4 a pending Next dims no skill row', async () => {
  const rows = await skillPane({ skillsUi: OPEN('conditional'), pending: { since: 1, command: 'akili-execute' } });
  assert.ok(rows.filter((r) => r.id.startsWith('skill-')).every((r) => r.parts[0].dim === undefined));
});

test('FR-4 press fields: Skills, a group and a skill carry what register maps to a handler', async () => {
  const rows = await skillPane({ skillsUi: OPEN('core') });
  assert.deepEqual(rowOf(rows, 'skills').press, { kind: 'skills' });
  assert.deepEqual(rowOf(rows, 'skills-group-stack').press, { kind: 'group', binding: 'stack' });
  assert.deepEqual(rowOf(rows, 'skill-kaizen').press, { kind: 'skill', name: 'kaizen' });
  assert.equal(rowOf(rows, 'next').press, undefined);
  assert.equal(rowOf(rows, 'model').press, undefined);
});

test('FR-5 Not installed here: kaizen missing from the list is not listed and not counted', async () => {
  const rows = await skillPane({ host: { model: OPUS, skills: ALL_NAMES.filter((n) => n !== 'kaizen') }, skillsUi: OPEN('core') });
  assert.equal(textOf(rowOf(rows, 'skills')), 'Skills (31) ▾');
  assert.equal(textOf(rowOf(rows, 'skills-group-core')), '  core (11) ▾');
  assert.equal(rowOf(rows, 'skill-kaizen'), undefined);
});

test('FR-5 only catalog skills are listed: other commands in the list never show', async () => {
  const rows = await skillPane({ host: { model: OPUS, skills: ['tdd', 'model', 'akili-propose', 'clear'] }, skillsUi: OPEN('conditional') });
  assert.equal(textOf(rowOf(rows, 'skills')), 'Skills (1) ▾');
  assert.deepEqual(ids(rows).filter((id) => id.startsWith('skill-')), ['skill-tdd']);
});

// FR-6 narrow panes

test('FR-6 Model id too long: after the label column, the id is cut in the middle with …', async () => {
  const F = await loaded;
  const view = await viewOf('blocked', 'changes/x');
  const row = rowOf(pane(F, { view, usage: U42, sums: SUMS, host: { model: LONG_MODEL }, cols: 40 }), 'model');
  assert.equal(row.parts[0].text.length, 17);
  assert.equal(textOf(row).length, 40);
  assert.ok(row.parts[1].text.includes('…') && !row.parts[1].text.endsWith('…'));
  assert.ok(row.parts[1].text.startsWith('claude-'));
  assert.ok(row.parts[1].text.endsWith('-1'));
});

test('FR-6 Model id too long BUT not dropped at 14 columns or more: the label goes first, the id stays', async () => {
  const F = await loaded;
  for (let cols = 14; cols <= 120; cols++) {
    const text = textOf(rowOf(pane(F, { view: null, usage: U100, sums: SUMS, host: { model: LONG_MODEL }, cols }), 'model'));
    assert.ok(text.length > 0 && text.length <= cols, `${cols}: ${text}`);
    if (cols < 17 + LONG_MODEL.length) assert.ok(text.includes('…'), `${cols}: ${text}`);
    else assert.ok(text.endsWith(LONG_MODEL), `${cols}: ${text}`);
  }
  assert.equal(textOf(rowOf(pane(F, { view: null, usage: U100, sums: SUMS, host: { model: 'claude-haiku-5-5' }, cols: 14 }), 'model')), 'claude-…ku-5-5');
});

test('FR-6 the model label is dropped only when the id would get fewer than 6 columns', async () => {
  const F = await loaded;
  const at = (cols) => pane(F, { view: null, usage: { ctxPercent: 5 }, sums: SUMS, host: { model: LONG_MODEL }, cols });
  assert.ok(textOf(rowOf(at(40), 'model')).startsWith('model'));
  assert.ok(!textOf(rowOf(at(14), 'model')).startsWith('model'));
  assert.equal(textOf(rowOf(at(14), 'model')).length, 14);
});

test('FR-6 ladder steps unchanged: a 60-character model id moves no pre-existing row at any width', async () => {
  const F = await loaded;
  const sixty = 'claude-' + 'x'.repeat(53);
  assert.equal(sixty.length, 60);
  const view = await LADDER_VIEW();
  for (let cols = 1; cols <= 120; cols++) {
    const base = { view, usage: U100, sums: SUMS, cols };
    assert.equal(F.ladderStep(base), F.ladderStep({ ...base, host: { model: sixty } }), `step at ${cols}`);
    const strip = (rows) => rows.filter((r) => !ADDED.includes(r.id) && !r.id.startsWith('skill'));
    assert.deepEqual(strip(F.paneRows({ ...base, host: { model: sixty, skills: ALL_NAMES }, skillsUi: OPEN('core') })), strip(F.paneRows(base)), `rows at ${cols}`);
  }
});

test('FR-6 Skills rows too long: a marked row keeps its mark at every width, 14 columns included', async () => {
  const F = await loaded;
  const at = (cols) => pane(F, { host: HOST_ALL, skillsUi: OPEN('conditional'), cols });
  const row14 = rowOf(at(14), 'skills-group-conditional');
  assert.equal(textOf(row14).length, 14);
  assert.ok(textOf(row14).endsWith('…' + ' ▾'), textOf(row14));
  assert.equal(textOf(rowOf(pane(F, { host: HOST_ALL, skillsUi: OPEN(), cols: 14 }), 'skills-group-conditional')), '  condition… ▸');
  for (let cols = 3; cols <= 25; cols++) {
    for (const id of ['skills', 'skills-group-core', 'skills-group-conditional', 'skills-group-stack']) {
      const t = textOf(rowOf(at(cols), id));
      assert.ok(t.length <= cols && /[▸▾]$/.test(t), `${id} at ${cols}: ${t}`);
    }
  }
  for (const cols of [1, 2]) assert.equal(textOf(rowOf(at(cols), 'skills')), '▾');
});

test('FR-6 Skills rows too long: a skill row is cut at the end with …, and the mark is cut by nothing', async () => {
  const F = await loaded;
  const row = rowOf(pane(F, { host: HOST_ALL, skillsUi: OPEN('core'), cols: 12 }), 'skill-product-manager-toolkit');
  assert.equal(textOf(row), '    product…');
  assert.equal(textOf(rowOf(pane(F, { host: HOST_ALL, skillsUi: OPEN('core'), cols: 200 }), 'skill-product-manager-toolkit')), '    product-manager-toolkit');
});

test('FR-6 Skills rows AND ladder steps unchanged: the Skills section moves no pre-existing row', async () => {
  const F = await loaded;
  const view = await LADDER_VIEW();
  const strip = (rows) => rows.filter((r) => !r.id.startsWith('skill') && r.id !== 'rule-skills');
  for (const cols of [14, 17, 24, 30, 45, 60, 80]) {
    const base = { view, usage: U100, sums: SUMS, cols };
    assert.equal(F.ladderStep({ ...base, host: HOST_ALL, skillsUi: OPEN('stack') }), F.ladderStep(base), cols);
    assert.deepEqual(strip(F.paneRows({ ...base, host: HOST_ALL, skillsUi: OPEN('stack') })), strip(F.paneRows({ ...base, host: { model: OPUS } })), cols);
  }
});

test('FR-6 any width, 1 to 120, over the open states: no row is wider than the width, tones are theme keys', async () => {
  const F = await loaded;
  const view = { ...(await viewOf('long-names', 'changes/an-extraordinarily-long-spec-name-for-the-polish-width-sweep')), errors: [] };
  const states = [CLOSED, OPEN(), OPEN('core'), OPEN('conditional'), OPEN('stack'), { open: false, group: 'core' }];
  let cuts = 0;
  for (const skillsUi of states) {
    for (let cols = 1; cols <= 120; cols++) {
      const rows = F.paneRows({ view, usage: U100, sums: { in: 12345678, out: 987654 }, pending: { since: 1, command: 'tdd' }, cols, host: { model: LONG_MODEL, skills: ALL_NAMES }, skillsUi });
      for (const r of rows) {
        const t = textOf(r);
        assert.ok(t.length <= cols, `${JSON.stringify(skillsUi)} at ${cols}: ${r.id} is ${t.length} wide`);
        if (t.endsWith('…')) cuts++;
        for (const p of r.parts) assert.ok([undefined, 'success', 'inactive', 'suggestion', 'warning', 'error', 'subtle'].includes(p.tone), `${p.tone} is a theme key`);
        if (r.id === 'skills' || r.id.startsWith('skills-group')) assert.ok(/[▸▾]$/.test(t), `${r.id} at ${cols} keeps its mark: ${t}`);
      }
      assert.ok(rowOf(rows, 'model'), `model at ${cols}`);
    }
  }
  assert.ok(cuts > 500, `the sweep forces cuts (${cuts})`);
});

// FR-7, FR-8, NFR-1

test('FR-7 closed, the pane grows by exactly three rows: model, a rule and Skills', async () => {
  const closed = await skillPane();
  assert.deepEqual(ids(closed), [
    'title', 'branch', 'rule-top', 'constitution', 'cycle',
    'phase-propose', 'phase-specify', 'phase-execute', 'phase-test', 'phase-validate', 'phase-archive',
    'rule-tokens', 'ctx', 'session', 'model', 'gap', 'next', 'rule-skills', 'skills',
  ]);
  assert.equal(closed.length, 19);
});

test('FR-8 Same facts: with the Skills row closed every pre-existing row is identical to the pane without host', async () => {
  const F = await loaded;
  for (const [fx, kept] of [['blocked', 'changes/x'], ['phase-ladder', 'changes/s-execute'], ['empty-project', null]]) {
    const view = await viewOf(fx, kept);
    const base = pane(F, { view, usage: U42, sums: SUMS });
    const withHost = pane(F, { view, usage: U42, sums: SUMS, host: HOST_ALL, skillsUi: CLOSED });
    assert.deepEqual(withHost.filter((r) => !ADDED.includes(r.id)), base.filter((r) => !ADDED.includes(r.id)), fx);
    assert.deepEqual(ids(withHost).filter((id) => ADDED.includes(id)), ADDED);
  }
});

test('FR-8 Same facts: the Next row text and press data are untouched by the Skills section', async () => {
  const rows = await skillPane({ skillsUi: OPEN('core') });
  assert.deepEqual(rowOf(rows, 'next').next, { command: 'akili-execute', args: 'changes/x', label: 'Next: /akili-execute changes/x', pending: false });
});

test('FR-8 omitting host and skillsUi (the 1.0.0 call) draws no Skills section and model —', async () => {
  const F = await loaded;
  const rows = pane(F, { view: await viewOf('blocked', 'changes/x'), usage: U42, sums: SUMS });
  assert.deepEqual(ids(rows).filter((id) => ADDED.includes(id)), ['model']);
  assert.equal(textOf(rowOf(rows, 'model')), 'model            —');
});

test('NFR-1 marks carry the state without colour: the glyph is in the text and the tones are theme keys only', async () => {
  const rows = await skillPane({ skillsUi: OPEN('core') });
  assert.deepEqual(rowOf(rows, 'skills').parts, [{ text: 'Skills (32) ' }, { text: '▾', tone: 'inactive' }]);
  assert.deepEqual(rowOf(rows, 'skills-group-core').parts, [{ text: '  core (12) ' }, { text: '▾', tone: 'inactive' }]);
  assert.deepEqual(rowOf(rows, 'skills-group-stack').parts, [{ text: '  stack (11) ', tone: 'inactive' }, { text: '▸', tone: 'inactive' }]);
  assert.deepEqual(rowOf(rows, 'skill-caveman').parts, [{ text: '    caveman' }]);
});
