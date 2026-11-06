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
const loaded = import(pathToFileURL(FLOW).href); // W-14: a file URL loads on Windows drive letters

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
    'keptSpecFor', 'safeSpecPath', 'formatHeader', 'formatTokens', 'formatNext', 'formatPhaseLines', 'shortenCount', 'shortenMiddle']) {
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
  assert.equal(F.formatHeader(view, 200), 'Akili · changes/a · ⎇ feat/b (1 more active)');
});

test('FR-5 header omits (n more active) when no other spec is active', async () => {
  const F = await loaded;
  const { view } = await run('specify-progress', null);
  assert.equal(view.moreActive, 0);
  assert.equal(F.formatHeader(view, 200), 'Akili · changes/x · (no git)');
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
  assert.equal(F.formatHeader(view, 200), 'Akili · changes/a · (no git) · archived');
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
  assert.equal(F.formatConstitution(view.constitution), '01 Constitution  ✓');
});

test('FR-6 constitution: none of the files -> not reached (○)', async () => {
  const F = await loaded;
  const { view } = await run('empty-project', null);
  assert.deepEqual(view.constitution, { present: 0, total: 13 });
  assert.equal(F.formatConstitution(view.constitution), '01 Constitution  ○');
});

test('FR-6 constitution: some of the files -> ▶ (k/13)', async () => {
  const F = await loaded;
  const { view } = await run('constitution-partial', null);
  assert.deepEqual(view.constitution, { present: 5, total: 13 });
  assert.equal(F.formatConstitution(view.constitution), '01 Constitution  ▶ (5/13)');
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
  assert.doesNotMatch(F.formatPhaseLines(view.phases).map((l) => l.text).join('\n'), /blocked/);
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
  assert.equal(F.formatPhaseLines(view.phases)[2].text, '   execute   ▶ (blocked)');
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
  assert.equal(F.formatPhaseLines(view.phases)[2].text, '   execute   ▶ (no task status)');
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

test('FR-6/§8 flow lines: labels padded to one column, marks after, current phase flagged for bold', async () => {
  const F = await loaded;
  const { view } = await run('phase-ladder', 'changes/s-specify');
  assert.deepEqual(F.formatPhaseLines(view.phases), [
    { text: '02 propose   ✓', current: false },
    { text: '   specify   ▶', current: true },
    { text: '   execute   ○', current: false },
    { text: '   test      ○', current: false },
    { text: '   validate  ○', current: false },
    { text: '   archive   ○', current: false },
  ]);
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
  assert.equal(F.formatConstitution(view.constitution), '01 Constitution  ○');
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
  assert.equal(F.formatHeader({ spec: 'changes/x', branch, moreActive: 0, archived: false }, 200), 'Akili · changes/x · ⎇ JuankCadavid/akili-panel');
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
  assert.equal(F.formatHeader({ spec: 'changes/x', branch, moreActive: 0, archived: false }, 200), 'Akili · changes/x · (no git)');
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

test('FR-12 token line: ctx <p>% (<used>/<window>) · session <in> in / <out> out · $<usd>', async () => {
  const F = await loaded;
  assert.equal(
    F.formatTokens({ ctxPercent: 42, ctxTokens: 84000, ctxWindow: 200000, usd: 0.351 }, { in: 1234, out: 300 }),
    'Tokens: ctx 42% (84k/200k) · session 1.2k in / 300 out · $0.35',
  );
});

test('FR-12 fresh session: Tokens: ctx — · session 0 in / 0 out, then · $0.00 when the cost is reported', async () => {
  const F = await loaded;
  assert.equal(F.formatTokens({}, { in: 0, out: 0 }), 'Tokens: ctx — · session 0 in / 0 out');
  assert.equal(F.formatTokens({ usd: 0 }, { in: 0, out: 0 }), 'Tokens: ctx — · session 0 in / 0 out · $0.00');
  assert.equal(F.formatTokens(undefined, undefined), 'Tokens: ctx — · session 0 in / 0 out');
});

test('FR-12 after /clear or a resume: session figures restart at 0 while $ stays the host total', async () => {
  const F = await loaded;
  assert.equal(F.formatTokens({ ctxPercent: 3, ctxTokens: 6000, ctxWindow: 200000, usd: 7.5 }, { in: 0, out: 0 }),
    'Tokens: ctx 3% (6.0k/200k) · session 0 in / 0 out · $7.50');
});

test('FR-12/§8 narrow pane drops parts right to left: $ first, then session', async () => {
  const F = await loaded;
  const u = { ctxPercent: 42, ctxTokens: 84000, ctxWindow: 200000, usd: 0.35 };
  const s = { in: 1234, out: 300 };
  const full = F.formatTokens(u, s);
  assert.equal(full, 'Tokens: ctx 42% (84k/200k) · session 1.2k in / 300 out · $0.35');
  assert.equal(F.formatTokens(u, s, full.length), full);
  assert.equal(F.formatTokens(u, s, full.length - 1), 'Tokens: ctx 42% (84k/200k) · session 1.2k in / 300 out');
  assert.equal(F.formatTokens(u, s, 40), 'Tokens: ctx 42% (84k/200k)');
  assert.ok(String(F.formatTokens(u, s, 10)).length <= 10 && F.formatTokens(u, s, 10), 'fits 10 columns');
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
  const h = F.formatHeader(view, 40);
  assert.ok(h.length <= 40, h);
  assert.match(h, /…/);
  assert.ok(h.startsWith('Akili · ') && h.endsWith('(2 more active)'), h);
});

test('FR-16 no line wraps past the pane width: header and every error line fit at every width', async () => {
  const F = await loaded;
  const view = { spec: 'changes/akili-panel-long-name-here', branch: { kind: 'branch', name: 'JuankCadavid/akili-panel' }, moreActive: 2, archived: true };
  for (let cols = 1; cols <= 120; cols++) {
    const h = F.formatHeader(view, cols);
    assert.ok(typeof h === 'string' && h.length > 0 && h.length <= cols, `header at ${cols}`);
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
