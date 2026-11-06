'use strict';

// changes/akili-panel /akili-test: what the author's tests (test/akili-panel-flow.test.js) do not prove.
// Negative constraints, boundaries, the FR-7 table through a real refresh, NFR-2 ceilings at their worst case.
// Expected values are literals copied from requirements.md at 5ac821f; this file never reads docs/specs/.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const FLOW = path.join(__dirname, '..', '.claude', 'skills', 'akili-panel', 'hooks', 'flow.mjs');
const loaded = import(pathToFileURL(FLOW).href);

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'akili-panel-cover-'));
test.after(() => fs.rmSync(TMP, { recursive: true, force: true }));

let counter = 0;

// `spec` maps a relative path to its text; a path ending in `/` is an empty folder.
// `mtimes` maps a relative path to epoch seconds.
function project(spec, mtimes = {}) {
  const root = path.join(TMP, `p${counter++}`);
  fs.mkdirSync(root, { recursive: true });
  for (const [rel, text] of Object.entries(spec)) {
    const abs = path.join(root, rel);
    if (rel.endsWith('/')) { fs.mkdirSync(abs, { recursive: true }); continue; }
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, text);
  }
  for (const [rel, secs] of Object.entries(mtimes)) fs.utimesSync(path.join(root, rel), secs, secs);
  return root;
}

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

function counting(inner) {
  const calls = { list: [], exists: [], read: [] };
  return {
    calls,
    io: {
      list: (p) => { calls.list.push(p); return inner.list(p); },
      exists: (p) => { calls.exists.push(p); return inner.exists(p); },
      read: (p) => { calls.read.push(p); return inner.read(p); },
    },
  };
}

const CONSTITUTION = {
  'docs/prd.md': 'x', 'docs/ux-ui/design.md': 'x', 'docs/trd/trd.md': 'x', 'docs/infrastructure.md': 'x',
  'docs/specs/general-setup/requirements.md': 'x', 'docs/specs/general-setup/design.md': 'x',
  'docs/specs/general-setup/task.md': 'x', 'docs/specs/general-setup/family.md': 'x',
  'AGENTS.md': 'x', '.agents/leader.md': 'x', '.agents/implementer.md': 'x', '.agents/reviewer.md': 'x', '.agents/tester.md': 'x',
};

const S = 'docs/specs/changes/x';
const DONE = '| Status | `[x]` |\n';
const OPEN = '| Status | `[ ]` |\n';
const specified = (tasks) => ({ [`${S}/proposal.md`]: 'x', [`${S}/requirements.md`]: 'x', [`${S}/design.md`]: 'x', [`${S}/tasks.md`]: tasks });

const refreshOf = async (spec, kept = null, mtimes) => (await loaded).refresh(nodeIo(), project(spec, mtimes), kept);
const tokens = async (text) => (await loaded).parseTaskTokens(text);
const count = (done, open, blocked) => ({ done, open, blocked, total: done + open + blocked });

// ================================================================ FR-5 unsafe argument edges

test('FR-5 unsafe: every form that leaves docs/specs or breaks the segment rule is not kept', async () => {
  const F = await loaded;
  const bad = ['../../etc', '/tmp/x', '..', '.', 'changes/..', 'changes/.', '../changes/a', 'changes/../../etc', '//x', '/', 'a//b', 'a/',
    '..\\..\\etc', 'changes\\a', 'C:/x', 'C:\\x', '~/x', '~', '$HOME', 'a%2f..', 'a:b', 'a*', 'a?', 'a|b', 'a&b', 'a#b', 'a"b', "a'b", 'é/x', 'a\u0000b'];
  for (const arg of bad) {
    assert.equal(F.keptSpecFor('akili-execute', arg), null, JSON.stringify(arg));
    assert.equal(F.safeSpecPath(arg), null, JSON.stringify(arg));
  }
});

test('FR-5 unsafe: a value that is not a string is refused, and a newline never rides along', async () => {
  const F = await loaded;
  for (const v of [null, undefined, 0, 1, true, {}, [], ['changes/a']]) assert.equal(F.safeSpecPath(v), null, String(v));
  assert.equal(F.safeSpecPath('changes/a\n'), null);
  assert.equal(F.safeSpecPath('changes/a\nb'), null);
});

test('FR-5 unsafe: the first argument decides; a safe second one is never reached for', async () => {
  const F = await loaded;
  assert.equal(F.keptSpecFor('akili-execute', '../../etc changes/a'), null);
  assert.equal(F.keptSpecFor('akili-propose', '/tmp/x changes/a'), null);
  assert.equal(F.keptSpecFor('akili-execute', ''), null);
  assert.equal(F.keptSpecFor('akili-execute', '   '), null);
  assert.equal(F.keptSpecFor('akili-execute', undefined), null);
  assert.equal(F.keptSpecFor('akili-execute', '\tchanges/a\tmore'), 'changes/a');
});

test('FR-5 unsafe: a stored value that is unsafe is ignored and no io call follows it out of docs/specs', async () => {
  const F = await loaded;
  const root = project({ 'docs/specs/changes/a/proposal.md': 'x' });
  const c = counting(nodeIo());
  const view = await F.refresh(c.io, root, '../../etc');
  assert.equal(view.spec, 'changes/a');
  for (const p of [...c.calls.list, ...c.calls.read]) assert.ok(!p.includes('etc'), p);
  assert.deepEqual(c.calls.list.filter((p) => p.endsWith('/archive')), [], 'an unsafe kept value does not reach the archive listing');
});

test('FR-5 propose BUT: uppercase, leading or trailing hyphen, doubled hyphen and a path that is unsafe keep nothing', async () => {
  const F = await loaded;
  for (const arg of ['Add-dark', 'add_dark', '-add-dark', 'add-dark-', 'add--dark', 'add', 'x/../y', 'add-dark.', '']) {
    assert.equal(F.keptSpecFor('akili-propose', arg), null, JSON.stringify(arg));
  }
  assert.equal(F.keptSpecFor('/akili-propose', 'add-remember-me'), 'changes/add-remember-me');
});

test('FR-5 only the six named commands keep a spec, whatever the argument looks like', async () => {
  const F = await loaded;
  for (const c of ['akili-resume', 'akili-quick', 'akili-audit', 'akili-constitution', 'akili-security', 'akili-seo', 'akili-review', 'akili-marketing', 'akili-panel', 'other', '', undefined]) {
    assert.equal(F.keptSpecFor(c, 'changes/a'), null, String(c));
  }
});

// ================================================================ FR-5 order of choice

test('FR-5 step 1: a kept spec that was archived beats the branch match and recency', async () => {
  const view = await refreshOf({
    'docs/specs/archive/2026-11-01-changes--a/proposal.md': 'x',
    'docs/specs/bugfix/feat/proposal.md': 'x',
    '.git/HEAD': 'ref: refs/heads/fix/feat\n',
  }, 'changes/a');
  assert.equal(view.spec, 'changes/a');
  assert.equal(view.archived, true);
  assert.equal(view.moreActive, 1);
});

test('FR-5 step 1: a kept spec gone and never archived falls through to recency with no branch match', async () => {
  const view = await refreshOf({ 'docs/specs/changes/a/proposal.md': 'x' }, 'changes/gone');
  assert.equal(view.spec, 'changes/a');
  assert.equal(view.archived, false);
});

test('FR-5 step 2: the branch match is on the whole last segment, never a part of it', async () => {
  const view = await refreshOf({
    'docs/specs/changes/ab/proposal.md': 'x',
    'docs/specs/changes/c/proposal.md': 'x',
    '.git/HEAD': 'ref: refs/heads/feat/b\n',
  }, null, { 'docs/specs/changes/ab/proposal.md': 1_000_000, 'docs/specs/changes/c/proposal.md': 2_000_000 });
  assert.equal(view.spec, 'changes/c', 'recency decides, not a substring of the branch');
});

test('FR-5 step 2: a branch with no slash matches by its whole name; a detached HEAD matches nothing', async () => {
  const a = await refreshOf({
    'docs/specs/changes/main/proposal.md': 'x', 'docs/specs/changes/z/proposal.md': 'x', '.git/HEAD': 'ref: refs/heads/main\n',
  }, null, { 'docs/specs/changes/main/proposal.md': 1_000_000, 'docs/specs/changes/z/proposal.md': 2_000_000 });
  assert.equal(a.spec, 'changes/main');
  const b = await refreshOf({
    'docs/specs/changes/0123456/proposal.md': 'x', 'docs/specs/changes/z/proposal.md': 'x', '.git/HEAD': `${'0123456'.padEnd(40, '0')}\n`,
  }, null, { 'docs/specs/changes/0123456/proposal.md': 1_000_000, 'docs/specs/changes/z/proposal.md': 2_000_000 });
  assert.equal(b.spec, 'changes/z');
});

test('FR-5 step 3: only spec files count for recency; a newer note in a folder does not move it', async () => {
  const view = await refreshOf({
    'docs/specs/changes/a/proposal.md': 'x', 'docs/specs/changes/a/notes.txt': 'x', 'docs/specs/changes/b/proposal.md': 'x',
  }, null, { 'docs/specs/changes/a/proposal.md': 1_000_000, 'docs/specs/changes/a/notes.txt': 9_000_000, 'docs/specs/changes/b/proposal.md': 2_000_000 });
  assert.equal(view.spec, 'changes/b');
});

test('FR-5 (n more active): the count is active specs minus the displayed one; carve-outs and bare folders never count', async () => {
  const F = await loaded;
  const view = await refreshOf({
    'docs/specs/changes/a/proposal.md': 'x', 'docs/specs/changes/b/proposal.md': 'x', 'docs/specs/bugfix/c/proposal.md': 'x',
    'docs/specs/changes/bare/': '', 'docs/specs/quick/q/proposal.md': 'x', 'docs/specs/kaizen/k/proposal.md': 'x',
    'docs/specs/archive/2026-11-01-changes--old/proposal.md': 'x',
  }, 'changes/a');
  assert.equal(view.moreActive, 2);
  assert.match(F.formatHeader(view, 200), /\(2 more active\)$/);
});

test('FR-5 a bare kept folder is displayed and every active spec counts as other', async () => {
  const view = await refreshOf({ 'docs/specs/changes/new/': '', 'docs/specs/changes/a/proposal.md': 'x' }, 'changes/new');
  assert.equal(view.spec, 'changes/new');
  assert.equal(view.moreActive, 1);
});

// ================================================================ FR-6 task status tokens: negative constraints (glossary, J-4)

test('FR-6 not a token: a bracket pair that does not lead its place', async () => {
  for (const line of [
    'use [~] for blocked tasks',
    'use `[~]` for blocked tasks',
    '[x] at the start of a paragraph',
    '`[x]` at the start of a paragraph',
    '- see [x] in the list above',
    '- `see` [~]',
    '| Status | see [x] above |',
    '| Status | PASS `[x]` |',
    '| Notes | [x] |',
    '| T1 | [x] |',
    '| [x] | Status |',
    '| Task | Status |',
    '- **Status:** Draft [x]',
    '**Owner:** [x]',
    '## T1 [x] with text after it',
    '#T1 [x]',
    '> [x] quoted prose',
  ]) assert.deepEqual(await tokens(`${line}\n`), count(0, 0, 0), line);
});

test('FR-6 not a token: other characters inside the brackets', async () => {
  for (const inner of ['', '  ', 'y', 'xx', '-', '*', 'v', '✓']) {
    assert.deepEqual(await tokens(`- [${inner}] task\n| Status | [${inner}] |\n`), count(0, 0, 0), JSON.stringify(inner));
  }
});

test('FR-6 token: each place, backticks or not, trailing text or not, and case-insensitive x', async () => {
  for (const [line, want] of [
    ['| Status | `[x]` |', count(1, 0, 0)],
    ['| Status | [x] PASS attempt 2 |', count(1, 0, 0)],
    ['| **Status** | `[X]` — PASS |', count(1, 0, 0)],
    ['| Status | [ ] |', count(0, 1, 0)],
    ['| **Status** | `[~]` waiting |', count(0, 0, 1)],
    ['- [x] one', count(1, 0, 0)],
    ['- [X] one', count(1, 0, 0)],
    ['- `[~]` one', count(0, 0, 1)],
    ['- [ ] one', count(0, 1, 0)],
    ['- **Status:** [x] · T1', count(1, 0, 0)],
    ['- **Status:** `[ ]` · T1', count(0, 1, 0)],
    ['**Status:** [~]', count(0, 0, 1)],
    ['## T1: Build [x]', count(1, 0, 0)],
    ['### T2: Build `[~]`', count(0, 0, 1)],
    ['## T3: Build [ ]  ', count(0, 1, 0)],
  ]) assert.deepEqual(await tokens(`${line}\n`), want, line);
});

test('FR-6 a line in two places counts once', async () => {
  assert.deepEqual(await tokens('- [x] **Status:** [ ]\n'), count(1, 0, 0));
  assert.deepEqual(await tokens('## T1 **Status:** [x]\n'), count(1, 0, 0));
});

test('FR-6 Document Control: never read, in any spelling, and reading starts again at the next heading', async () => {
  const body = '| Status | [~] |\n- [ ] item\n**Status:** [x]\n';
  for (const h of ['## Document Control', '# Document Control', '## 1. Document Control', '### document control']) {
    assert.deepEqual(await tokens(`${h}\n${body}`), count(0, 0, 0), h);
    assert.deepEqual(await tokens(`${h}\n${body}## T1\n| Status | [x] |\n`), count(1, 0, 0), h);
  }
  assert.deepEqual(await tokens('## Document Control\r\n| Status | [~] |\r\n## T1\r\n| Status | [x] |\r\n'), count(1, 0, 0));
});

test('FR-6 BUT: a [~] under Document Control or in prose never reads (blocked)', async () => {
  const view = await refreshOf(specified(`## Document Control\n| Status | [~] |\n\nUse [~] for blocked tasks.\n\n## T1\n${DONE}`));
  assert.equal(view.blocked, false);
  assert.equal(view.phases.find((p) => p.id === 'execute').mark, 'done');
  assert.equal(view.phases.find((p) => p.id === 'test').mark, 'current');
});

// ================================================================ FR-6 phases: negative constraints

test('FR-6 BUT: a later file never marks a phase past an unfinished one', async () => {
  const view = await refreshOf({
    [`${S}/proposal.md`]: 'x', [`${S}/test-report.md`]: 'x', [`${S}/validation-report.md`]: 'x',
  });
  assert.deepEqual(view.phases.map((p) => p.mark), ['done', 'current', 'todo', 'todo', 'todo', 'todo']);
});

test('FR-6 BUT: execute is not done while any token is open or blocked, whatever else exists', async () => {
  const reports = { [`${S}/test-report.md`]: 'x', [`${S}/validation-report.md`]: 'x' };
  const open = await refreshOf({ ...specified(`${DONE}${DONE}${OPEN}`), ...reports });
  assert.deepEqual(open.phases.map((p) => p.mark), ['done', 'done', 'current', 'todo', 'todo', 'todo']);
  const blocked = await refreshOf({ ...specified(`${DONE}| Status | [~] |\n`), ...reports });
  assert.deepEqual(blocked.phases.map((p) => p.note), [null, null, 'blocked', null, null, null]);
});

test('FR-6 specify needs all three files; each one missing keeps it current', async () => {
  const F = await loaded;
  for (const missing of ['requirements.md', 'design.md', 'tasks.md']) {
    const files = ['proposal.md', 'requirements.md', 'design.md', 'tasks.md'].filter((f) => f !== missing);
    const d = F.derivePhases({ files, tokens: count(1, 0, 0), archived: false });
    assert.equal(d.current, 'specify', missing);
  }
});

test('FR-6 the current phase carries (blocked), including when specify is still current', async () => {
  const F = await loaded;
  const d = F.derivePhases({ files: ['proposal.md', 'tasks.md'], tokens: count(0, 0, 1), archived: false });
  assert.equal(d.current, 'specify');
  assert.equal(d.phases[1].note, 'blocked');
  assert.equal(F.formatPhaseLines(d.phases)[1].text, '   specify   ▶ (blocked)');
});

test('FR-6 (no task status) shows only on execute: a tasks.md with no token and specify still current reads plain ▶', async () => {
  const F = await loaded;
  const d = F.derivePhases({ files: ['proposal.md', 'tasks.md'], tokens: count(0, 0, 0), archived: false });
  assert.equal(d.current, 'specify');
  assert.equal(d.phases[1].note, null);
});

test('FR-6 a tasks.md that cannot be read is not done, and the phases are still drawn', async () => {
  const F = await loaded;
  const root = project(specified(DONE));
  const inner = nodeIo();
  const view = await F.refresh({ ...inner, read: async (p) => { if (p.endsWith('tasks.md')) throw new Error('EACCES: denied'); return inner.read(p); } }, root, null);
  assert.equal(view.phases[2].mark, 'current');
  assert.equal(view.phases[3].mark, 'todo');
  assert.equal(view.errors.length, 1);
});

test('FR-6 an archived spec reads no tasks.md and shows every phase ✓', async () => {
  const F = await loaded;
  const root = project({ 'docs/specs/archive/2026-11-01-changes--a/tasks.md': '| Status | [~] |\n' });
  const c = counting(nodeIo());
  const view = await F.refresh(c.io, root, 'changes/a');
  assert.ok(view.phases.every((p) => p.mark === 'done'));
  assert.equal(view.blocked, false);
  assert.deepEqual(c.calls.read.filter((p) => p.endsWith('tasks.md')), []);
});

test('FR-6 archive: the name is matched literally, and only a folder counts', async () => {
  const F = await loaded;
  assert.equal(F.isArchiveName('2026-11-01-changes--a.b', 'changes/a.b'), true);
  assert.equal(F.isArchiveName('2026-11-01-changes--aXb', 'changes/a.b'), false);
  assert.equal(F.isArchiveName('2026-1-1-changes--a', 'changes/a'), false);
  assert.equal(F.isArchiveName('2026-11-01-a--b--c', 'a/b/c'), true);
  const view = await refreshOf({ 'docs/specs/archive/2026-11-01-changes--a': 'a file', 'docs/specs/changes/z/proposal.md': 'x' }, 'changes/a');
  assert.equal(view.archived, false);
  assert.equal(view.spec, 'changes/z');
});

test('FR-6 constitution: each row is its own file; the legacy path never counts twice, and 12 of 13 is not ✓', async () => {
  const F = await loaded;
  for (const rel of Object.keys(CONSTITUTION)) {
    const { [rel]: _, ...rest } = CONSTITUTION;
    const view = await refreshOf(rest);
    assert.deepEqual(view.constitution, { present: 12, total: 13 }, rel);
    assert.equal(F.formatConstitution(view.constitution), '01 Constitution  ▶ (12/13)', rel);
  }
  const both = await refreshOf({ 'docs/ux-ui/design.md': 'x', 'docs/system-design/design.md': 'x' });
  assert.equal(both.constitution.present, 1);
});

test('FR-6 constitution: the optional CLAUDE.md is left out', async () => {
  const view = await refreshOf({ 'CLAUDE.md': 'x' });
  assert.equal(view.constitution.present, 0);
});

// ================================================================ FR-7 all 11 rows through a real refresh

const nextOf = async (spec, kept) => (await loaded).formatNext((await refreshOf(spec, kept)).next);
const OTHER = { 'docs/specs/changes/other/proposal.md': 'x' };
const ARCHIVED_A = { 'docs/specs/archive/2026-11-01-changes--a/tasks.md': DONE };

for (const [row, spec, kept, label] of [
  ['1 no docs/specs, constitution not ✓', { 'docs/prd.md': 'x' }, null, 'Next: /akili-constitution'],
  ['2 no active spec, constitution ✓', CONSTITUTION, null, 'Next: /akili-propose'],
  ['3 no active spec, constitution not ✓', { 'docs/specs/quick/quick-log.md': 'x' }, null, 'Next: /akili-constitution'],
  ['4 current phase propose', { 'docs/specs/changes/x/': '' }, 'changes/x', 'Next: /akili-propose changes/x'],
  ['5 current phase specify', { [`${S}/proposal.md`]: 'x' }, null, 'Next: /akili-specify changes/x'],
  ['6a current phase execute', specified(OPEN), null, 'Next: /akili-execute changes/x'],
  ['6b current phase execute, blocked', specified('| Status | [~] |\n'), null, 'Next: /akili-execute changes/x'],
  ['6c current phase execute, no task status', specified('no tokens\n'), null, 'Next: /akili-execute changes/x'],
  ['7 current phase test', specified(DONE), null, 'Next: /akili-test changes/x'],
  ['8 current phase validate', { ...specified(DONE), [`${S}/test-report.md`]: 'x' }, null, 'Next: /akili-validate changes/x'],
  ['9 current phase archive', { ...specified(DONE), [`${S}/test-report.md`]: 'x', [`${S}/validation-report.md`]: 'x' }, null, 'Next: /akili-archive changes/x'],
  ['10 displayed spec archived, others active', { ...ARCHIVED_A, ...OTHER }, 'changes/a', 'Next: /akili-resume'],
  ['11 displayed spec archived, none other', ARCHIVED_A, 'changes/a', 'Next: /akili-propose'],
]) {
  test(`FR-7 row ${row} -> ${label}, from files on disk`, async () => {
    assert.equal(await nextOf(spec, kept), label);
  });
}

test('FR-7 BUT: the button carries the spec as kept, with nothing added', async () => {
  const F = await loaded;
  const view = await refreshOf({ 'docs/specs/changes/fam/kid.one_2/proposal.md': 'x' }, 'changes/fam/kid.one_2');
  assert.deepEqual(view.next, { command: 'akili-specify', args: 'changes/fam/kid.one_2' });
  assert.equal(F.formatNext(view.next), 'Next: /akili-specify changes/fam/kid.one_2');
});

// ================================================================ FR-11 branch edges

const branchOf = async (spec, sub = '') => {
  const F = await loaded;
  const errors = [];
  const b = await F.readBranch(nodeIo(), path.join(project(spec), sub), errors);
  return { b, errors };
};

test('FR-11 the nearest .git wins over one further up', async () => {
  const { b } = await branchOf({ '.git/HEAD': 'ref: refs/heads/outer\n', 'pkg/.git/HEAD': 'ref: refs/heads/inner\n', 'pkg/app/x': 'x' }, 'pkg/app');
  assert.equal(b.name, 'inner');
});

test('FR-11 a relative gitdir is resolved against the .git file\'s folder, not the session folder', async () => {
  const { b } = await branchOf({ 'wt/.git': 'gitdir: ../meta/wt\n', 'wt/pkg/app/x': 'x', 'meta/wt/HEAD': 'ref: refs/heads/feat/wt\n' }, 'wt/pkg/app');
  assert.equal(b.name, 'feat/wt');
});

test('FR-11 CRLF in the .git file and in HEAD, and no newline at all, read the same', async () => {
  assert.equal((await branchOf({ '.git': 'gitdir: meta\r\n', 'meta/HEAD': 'ref: refs/heads/a/b\r\n' })).b.name, 'a/b');
  assert.equal((await branchOf({ '.git/HEAD': 'ref: refs/heads/a/b' })).b.name, 'a/b');
});

test('FR-11 a .git file with no gitdir line, and a HEAD that is short or empty, show (no git)', async () => {
  const F = await loaded;
  assert.equal(F.branchLabel((await branchOf({ '.git': 'garbage\n' })).b), '(no git)');
  assert.equal(F.branchLabel((await branchOf({ '.git/HEAD': '0123456\n' })).b), '(no git)');
  assert.equal(F.branchLabel((await branchOf({ '.git/HEAD': '' })).b), '(no git)');
  assert.equal(F.branchLabel((await branchOf({ '.git/HEAD': `${'g'.repeat(40)}\n` })).b), '(no git)');
});

test('FR-11 the detached header carries the first 7 characters and no more', async () => {
  const F = await loaded;
  const sha = '89abcdef0123456789abcdef0123456789abcdef';
  const { b } = await branchOf({ '.git/HEAD': `${sha}\n` });
  const h = F.formatHeader({ spec: 'changes/x', branch: b, moreActive: 0, archived: false }, 200);
  assert.match(h, /detached @89abcde$/);
});

test('FR-11 BUT: the walk stops at 20 levels and a .git above them is not found', async () => {
  const F = await loaded;
  const deep = `/${Array.from({ length: 25 }, (_, i) => `d${i}`).join('/')}`;
  const c = counting({ exists: async (p) => p === '/d0/d1/.git', read: async () => 'ref: refs/heads/too-far\n', list: async () => [] });
  assert.equal((await F.readBranch(c.io, deep, [])).kind, 'none');
  assert.equal(c.calls.exists.length, 20);
  assert.deepEqual(c.calls.read, []);
});

// ================================================================ FR-12 number and line boundaries

test('FR-12 shortening at every boundary', async () => {
  const F = await loaded;
  for (const [n, s] of [[0, '0'], [1, '1'], [999, '999'], [1000, '1.0k'], [1049, '1.0k'], [1050, '1.1k'], [9949, '9.9k'], [9999, '10k'], [10000, '10k'], [10499, '10k'], [10500, '11k'],
    [99999, '100k'], [100000, '100k'], [999499, '999k'], [999500, '1.0M'], [999999, '1.0M'], [1000000, '1.0M'], [1049999, '1.0M'], [1050000, '1.1M'], [10000000, '10.0M'], [999900000, '999.9M']]) {
    assert.equal(F.shortenCount(n), s, String(n));
  }
});

test('FR-12 BUT: no boundary reads 1000k, and a figure that is not a number reads 0', async () => {
  const F = await loaded;
  for (let n = 999000; n <= 1000100; n += 1) assert.doesNotMatch(F.shortenCount(n), /^1000/, String(n));
  for (const v of [undefined, null, NaN, 'x']) assert.equal(F.shortenCount(v), '0', String(v));
});

test('FR-12 the $ part has two decimals and is left out only when no cost is reported', async () => {
  const F = await loaded;
  const line = (usd) => F.formatTokens({ usd }, { in: 0, out: 0 });
  assert.equal(line(1), 'Tokens: ctx — · session 0 in / 0 out · $1.00');
  assert.equal(line(12.345678), 'Tokens: ctx — · session 0 in / 0 out · $12.35');
  assert.equal(line(undefined), 'Tokens: ctx — · session 0 in / 0 out');
  assert.equal(line(null), 'Tokens: ctx — · session 0 in / 0 out');
});

test('FR-12 ctx: the fill rounds to a whole percent and the window shortens the same way', async () => {
  const F = await loaded;
  assert.equal(F.formatTokens({ ctxPercent: 12.4, ctxTokens: 124000, ctxWindow: 1000000 }, { in: 2500000, out: 999 }),
    'Tokens: ctx 12% (124k/1.0M) · session 2.5M in / 999 out');
  assert.equal(F.formatTokens({ ctxWindow: 200000 }, null), 'Tokens: ctx — · session 0 in / 0 out', 'a window without a fill is not a fill');
});

test('FR-12 turnTokens ignores what is not a finite number', async () => {
  const F = await loaded;
  assert.deepEqual(F.turnTokens({ input_tokens: '5', output_tokens: NaN, cache_read_input_tokens: Infinity, cache_creation_input_tokens: null }), { in: 0, out: 0 });
});

// ================================================================ FR-16 widths and text

test('FR-16 no line passes the pane width, for every line the pane draws, at every width', async () => {
  const F = await loaded;
  const view = await refreshOf({ 'docs/specs/changes/a-very-long-spec-name-for-the-narrow-pane/proposal.md': 'x', 'docs/specs/changes/b/proposal.md': 'x', '.git/HEAD': 'ref: refs/heads/feature/a-very-long-branch-name-as-well\n' }, 'changes/a-very-long-spec-name-for-the-narrow-pane');
  const usage = { ctxPercent: 42, ctxTokens: 84000, ctxWindow: 200000, usd: 12.34 };
  for (let cols = 1; cols <= 140; cols++) {
    const lines = [
      F.formatHeader(view, cols),
      F.fitLine(F.formatConstitution(view.constitution), cols),
      ...F.formatPhaseLines(view.phases).map((l) => F.fitLine(l.text, cols)),
      F.formatTokens(usage, { in: 1234567, out: 98765 }, cols),
      F.fitLine(F.formatNext(view.next), cols),
      ...F.errorLines([{ path: '/a/very/long/path/tasks.md', reason: 'EACCES:\npermission denied' }], cols),
    ];
    for (const line of lines) {
      assert.ok(line.length <= cols, `${cols}: ${line}`);
      assert.ok(!/[\r\n]/.test(line), `${cols}: a line break`);
    }
  }
});

test('FR-16 the spec path keeps both ends when shortened, and only the middle goes', async () => {
  const F = await loaded;
  const spec = 'changes/a-very-long-spec-name-for-the-narrow-pane';
  for (let cols = 30; cols <= 60; cols++) {
    const h = F.formatHeader({ spec, branch: { kind: 'none' }, moreActive: 0, archived: false }, cols);
    assert.ok(h.startsWith('Akili · chan') || h.startsWith('Akili · ch'), h);
    assert.match(h, /…/, h);
  }
  assert.equal(F.shortenMiddle('abcdefghij', 5), 'ab…ij');
  assert.equal(F.shortenMiddle('abcdefghij', 2), 'a…');
  assert.equal(F.shortenMiddle('abcdefghij', 1), '…');
  assert.equal(F.shortenMiddle('abcdefghij', 0), '');
  assert.equal(F.shortenMiddle('abc', 3), 'abc');
});

test('FR-16 a wide pane changes nothing, and no width given means no cut', async () => {
  const F = await loaded;
  const view = { spec: 'changes/x', branch: { kind: 'branch', name: 'a/b' }, moreActive: 1, archived: false };
  assert.equal(F.formatHeader(view, 400), 'Akili · changes/x · ⎇ a/b (1 more active)');
  assert.equal(F.formatHeader(view, undefined), 'Akili · changes/x · ⎇ a/b (1 more active)');
  assert.equal(F.fitLine('x'.repeat(500), undefined).length, 500);
});

test('FR-16 a docs/specs that cannot be listed for another reason is a read error, not a lost pane', async () => {
  const F = await loaded;
  const root = project({ 'docs/specs/changes/a/proposal.md': 'x', 'docs/prd.md': 'x' });
  const inner = nodeIo();
  const view = await F.refresh({ ...inner, list: async (p) => { if (p.endsWith('/docs/specs')) throw new Error('EACCES: denied'); return inner.list(p); } }, root, null);
  assert.deepEqual(view.errors.map((e) => e.reason), ['EACCES: denied']);
  assert.equal(view.constitution.present, 1);
  assert.equal(F.formatNext(view.next), 'Next: /akili-constitution');
});

test('FR-16 refresh never throws, with every io call failing', async () => {
  const F = await loaded;
  const boom = async () => { throw new Error('EIO: boom'); };
  const view = await F.refresh({ list: boom, exists: boom, read: boom }, '/p', 'changes/a');
  assert.equal(view.status, 'no-specs');
  assert.ok(view.errors.length > 0);
  assert.deepEqual(view.branch, { kind: 'none', name: '', sha: '' });
  assert.equal(F.formatNext(view.next), 'Next: /akili-constitution');
});

test('FR-16 every pane string is English, in one table (D7)', async () => {
  const F = await loaded;
  const texts = Object.values(F.STRINGS).map((v) => (typeof v === 'function' ? v('a', 'b') : v));
  for (const t of texts) assert.doesNotMatch(String(t), /[áéíóúñ¿¡]/i, String(t));
  assert.equal(F.STRINGS.paneOpened, 'Akili pane opened.');
  assert.equal(F.STRINGS.paneNotShown('no surface'), 'Akili pane not shown: no surface');
});

// ================================================================ NFR-2 ceilings at the worst case

test('NFR-2 exists: 15 for the baseline (13 + 2 legacy) and 20 for the .git walk is the worst case, and never more', async () => {
  const F = await loaded;
  const deep = `/${Array.from({ length: 30 }, (_, i) => `d${i}`).join('/')}`;
  const c = counting({ list: async () => { throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' }); }, exists: async () => false, read: async () => '' });
  await F.refresh(c.io, deep, 'changes/a');
  assert.equal(c.calls.exists.filter((p) => !p.endsWith('/.git')).length, 15);
  assert.equal(c.calls.exists.filter((p) => p.endsWith('/.git')).length, 20);
  assert.equal(c.calls.exists.length, 35);
  assert.equal(c.calls.read.length, 0);
});

test('NFR-2 read: a .git folder, a spec with tasks.md: three reads at most', async () => {
  const F = await loaded;
  const root = project({ ...specified(DONE), '.git/HEAD': 'ref: refs/heads/a\n' });
  const c = counting(nodeIo());
  await F.refresh(c.io, root, 'changes/x');
  assert.ok(c.calls.read.length <= 3, String(c.calls.read.length));
  assert.equal(c.calls.read.filter((p) => p.endsWith('tasks.md')).length, 1);
});

test('NFR-2 read: only the displayed spec\'s tasks.md is read, however many specs are active', async () => {
  const F = await loaded;
  const spec = {};
  for (let i = 0; i < 12; i++) spec[`docs/specs/changes/s${i}/tasks.md`] = DONE;
  const c = counting(nodeIo());
  await F.refresh(c.io, project(spec), 'changes/s3');
  assert.deepEqual(c.calls.read.filter((p) => p.endsWith('tasks.md')).map((p) => p.split('/').slice(-2)[0]), ['s3']);
});

test('NFR-2 list: exactly one per folder visited, plus one for archive/ only when the kept spec is missing', async () => {
  const F = await loaded;
  const spec = {
    'docs/specs/changes/a/proposal.md': 'x', 'docs/specs/changes/fam/family.md': 'x', 'docs/specs/changes/fam/kid/proposal.md': 'x',
    'docs/specs/bugfix/b/proposal.md': 'x', 'docs/specs/archive/2026-11-01-changes--z/proposal.md': 'x', 'docs/specs/quick/quick-log.md': 'x',
  };
  // visited: docs/specs, changes, bugfix, changes/a, changes/fam, changes/fam/kid, bugfix/b = 7
  const root = project(spec);
  const present = counting(nodeIo());
  await F.refresh(present.io, root, 'changes/a');
  assert.equal(present.calls.list.length, 7);
  assert.equal(new Set(present.calls.list).size, 7, 'no folder is listed twice');
  const none = counting(nodeIo());
  await F.refresh(none.io, root, null);
  assert.equal(none.calls.list.length, 7);
  const missing = counting(nodeIo());
  await F.refresh(missing.io, root, 'changes/z');
  assert.equal(missing.calls.list.length, 8);
  assert.equal(missing.calls.list.filter((p) => p.includes('/archive')).length, 1);
  assert.ok(missing.calls.list.every((p) => !/\/archive\/.+/.test(p)), 'never inside archive/');
});

test('NFR-2 a bare kept folder is not missing: archive/ stays unlisted', async () => {
  const F = await loaded;
  const c = counting(nodeIo());
  await F.refresh(c.io, project({ 'docs/specs/changes/new/': '', 'docs/specs/archive/x/proposal.md': 'x' }), 'changes/new');
  assert.deepEqual(c.calls.list.filter((p) => p.includes('/archive')), []);
});
