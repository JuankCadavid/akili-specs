// akili-panel engine-kit tests (changes/akili-panel T6). Run: claude plugin test <plugin folder>.
// Each `on` below stands for the engine beneath the plugin; none of them answers before the plugin's hook ran.
import { expect, mock, test } from 'claude-code/testing'

const ROOT = '/proj'
const SPEC = 'changes/demo'
const PANE = {
  plugin: 'akili-panel', component: 'Pane', requestId: 'akili',
  props: { title: 'Akili', isFocused: false, bodyColumns: 80, placement: 'dock', scroll: { offset: 0, bodyRows: 20 }, view: {} },
} as const
const SURFACES = ['terminal', 'desktop'] as const

type Calls = { registered?: boolean; fs: string[]; runs: { command: string; args: string }[]; toasts: string[] }

// A project tree: folder path -> entries. A path not listed rejects as a missing folder does.
function engine($: any, on: any, tree: Record<string, string[]>, opts: { placed?: boolean; paneListed?: boolean; onOpen?: (e: any) => void; onSet?: (e: any) => void } = {}) {
  const calls: Calls = { fs: [], runs: [], toasts: [] }
  const clk = mock.clock(on)
  const kv = new Map<string, unknown>()
  on('store.get', (_: any, e: any) => ({ value: kv.get(e.key) }))
  on('store.keys', () => ({ value: [...kv.keys()] }))
  on('store.set', (_: any, e: any) => { opts.onSet?.(e); kv.set(e.key, e.value); return { value: undefined } })
  on('store.delete', (_: any, e: any) => { kv.delete(e.key); return { value: undefined } })
  const files = new Set<string>()
  on('command.register', () => { calls.registered = true; return { value: { command: 'akili-panel' } } })
  on('session.root', () => ({ value: ROOT }))
  on('session.usage', () => ({ value: {} }))
  on('session.start', (_: any, e: any) => ({ cwd: e.cwd }))
  on('ui.toast', (_: any, e: any) => { calls.toasts.push(String(e.text ?? e.message ?? JSON.stringify(e))); return { value: undefined } })
  on('ui.log', () => ({ value: undefined }))
  on('ui.open', (_: any, e: any) => { opts.onOpen?.(e); return { value: opts.placed === false ? { isPlaced: false, reason: 'no surface' } : { isPlaced: true } } })
  on('ui.panes', () => ({ value: opts.paneListed === false ? [] : [{ id: 'akili', title: 'Akili', isFocused: true, isPlaced: true }] }))
  on('fs.list', (_: any, e: any) => {
    calls.fs.push(`list ${e.path}`)
    const hit = tree[e.path]
    if (!hit) throw new Error(`ENOENT: no such file or directory, ${e.path}`)
    return { value: hit.map((n) => ({ name: n.replace(/\/$/, ''), kind: n.endsWith('/') ? 'dir' : 'file', size: 1, mtimeMs: 1 })) }
  })
  on('fs.exists', (_: any, e: any) => { calls.fs.push(`exists ${e.path}`); return { value: files.has(e.path) } })
  on('fs.read', (_: any, e: any) => { calls.fs.push(`read ${e.path}`); throw new Error('ENOENT') })
  return { calls, clk }
}

const withSpec = { [`${ROOT}/docs/specs`]: ['changes/'], [`${ROOT}/docs/specs/changes`]: ['demo/'], [`${ROOT}/docs/specs/changes/demo`]: ['proposal.md'] }

async function open($: any, clk: any) {
  await $.session.start({ cwd: ROOT, surface: 'terminal', isInteractive: true })
  await clk.settle()
  const reply = await $.command.run({ command: 'akili-panel', args: '' })
  await clk.settle()
  return reply
}

// The command.run bottom: `answer` runs when the run reaches the engine, after the plugin's hook passed it on.
function runs(on: any, calls: Calls, answer: () => unknown = () => ({ text: 'ran' })) {
  on('command.run', (_: any, e: any) => { calls.runs.push({ command: e.command, args: e.args }); return answer() })
}

test('/akili-panel opens pane akili titled Akili, on every surface', async ($, on) => {
  let titled = ''
  const { calls, clk } = engine($, on, withSpec, { onOpen: (e) => { titled = `${e.id}|${e.title}` } })
  const reply: any = await open($, clk)
  expect(titled).toBe('akili|Akili')
  expect(reply.text).toBe('Akili pane opened.')
  expect(calls.fs.length > 0).toBe(true) // control for NFR-8: with the pane listed, refresh does read
  for (const surface of SURFACES) {
    const ui = await $.ui.mount({ ...PANE, surface })
    expect(await ui.find({ type: 'Text', text: /Spec|demo/ })).toBeDefined()
    expect((await ui.find({ key: 'next' }))?.text).toMatch(/\/akili-specify changes\/demo/)
    await ui.unmount()
  }
})

test('the not-placed reply carries the reason', async ($, on) => {
  const { clk } = engine($, on, withSpec, { placed: false })
  const reply: any = await open($, clk)
  expect(reply.text).toBe('Akili pane not shown: no surface')
})

test('NFR-8: no fs call while ui.panes lists no akili', async ($, on) => {
  const { calls, clk } = engine($, on, withSpec, { paneListed: false })
  on('turn.complete', (_: any, e: any) => ({ text: e.answer }))
  await open($, clk)
  await $.turn.complete({ turnId: 't1', answer: 'a', durationMs: 1, isAborted: false, reason: 'answer' })
  await clk.advance(65000)
  expect(calls.fs).toEqual([])
})

test('FR-16: empty states are drawn (no docs/specs folder, no active spec)', async ($, on) => {
  const missing = engine($, on, {})
  await open($, missing.clk)
  for (const surface of SURFACES) {
    const ui = await $.ui.mount({ ...PANE, surface })
    expect((await ui.find({ type: 'Text', text: /No docs\/specs\/ folder yet\./ }))?.text).toBe('No docs/specs/ folder yet.')
    await ui.unmount()
  }
})

test('FR-16: no active spec when docs/specs holds only carve-outs', async ($, on) => {
  const { clk } = engine($, on, { [`${ROOT}/docs/specs`]: ['archive/'] })
  await open($, clk)
  for (const surface of SURFACES) {
    const ui = await $.ui.mount({ ...PANE, surface })
    expect((await ui.find({ type: 'Text', text: /No active spec\./ }))?.text).toBe('No active spec.')
    await ui.unmount()
  }
})

test('FR-9: the observer returns next\'s own result, and leaves args alone', async ($, on) => {
  const { calls, clk } = engine($, on, withSpec)
  const answer = { text: 'engine answer' }
  runs(on, calls, () => answer)
  await open($, clk)
  const got = await $.command.run({ command: 'akili-execute', args: `${SPEC} --x` })
  // The kit's bottom stamps `ref` on a result, so strict object identity is not observable; the text must come through unchanged.
  expect((got as any).text).toBe(answer.text)
  expect(calls.runs).toEqual([{ command: 'akili-execute', args: `${SPEC} --x` }])
})

test('FR-9: a throwing observer still lets the command through', async ($, on) => {
  const { calls, clk } = engine($, on, withSpec, { onSet: () => { throw new Error('store down') } })
  runs(on, calls)
  await open($, clk)
  const got: any = await $.command.run({ command: 'akili-execute', args: SPEC })
  await clk.settle()
  expect(got.text).toBe('ran')
  expect(calls.runs.length).toBe(1)
})

test('FR-9: tool.call Skill records an akili- skill, and ignores another', async ($, on) => {
  const sets: string[] = []
  const { clk } = engine($, on, withSpec, { onSet: (e) => { sets.push(e.key) } })
  on('tool.call', () => ({ result: {} }))
  await open($, clk)
  await $.tool.call({ tool: 'Skill', skill: 'other-skill', args: SPEC })
  await clk.settle()
  expect(sets).toEqual([])
  await $.tool.call({ tool: 'Skill', skill: 'akili-execute', args: SPEC })
  await clk.settle()
  expect(sets).toEqual([`spec:${ROOT}`])
})

async function pressNext($: any, clk: any, surface: (typeof SURFACES)[number]) {
  await open($, clk)
  const ui = await $.ui.mount({ ...PANE, surface })
  return ui
}

for (const surface of SURFACES) test(`FR-7: the press runs the shown command with the shown args, and records the kept spec (B1) (${surface})`, async ($, on) => {
  const sets: any[] = []
  const { calls, clk } = engine($, on, withSpec, { onSet: (e) => { sets.push(e) } })
  runs(on, calls)
  const ui = await pressNext($, clk, surface)
  await ui.press({ key: 'next' })
  await clk.settle()
  expect(calls.runs).toEqual([{ command: 'akili-specify', args: SPEC }])
  expect(sets.map((s) => s.key)).toEqual([`spec:${ROOT}`])
  expect(sets[0].value.path).toBe(SPEC)
  await ui.unmount()
})

for (const surface of SURFACES) test(`FR-7: a double press queues one run; pending clears when the run settles (${surface})`, async ($, on) => {
  const { calls, clk } = engine($, on, withSpec)
  runs(on, calls, () => clk.sleep(5000).then(() => ({ text: 'done' })))
  const ui = await pressNext($, clk, surface)
  const first = ui.press({ key: 'next' })
  await clk.settle()
  void ui.press({ key: 'next' })
  await clk.settle()
  expect(calls.runs.length).toBe(1)
  await clk.advance(5000)
  await first
  const third = ui.press({ key: 'next' })
  await clk.advance(5000)
  await third
  expect(calls.runs.length).toBe(2)
  await ui.unmount()
})

for (const surface of SURFACES) test(`FR-7 A1: pending survives a long turn; a second press after 60 s queues nothing (${surface})`, async ($, on) => {
  const { calls, clk } = engine($, on, withSpec)
  runs(on, calls, () => clk.sleep(600000).then(() => ({ text: 'done' })))
  const ui = await pressNext($, clk, surface)
  const first = ui.press({ key: 'next' })
  await clk.settle()
  await clk.advance(61000)
  void ui.press({ key: 'next' })
  await clk.settle()
  expect(calls.runs.length).toBe(1)
  await clk.advance(600000)
  await first
  await ui.unmount()
})

for (const surface of SURFACES) test(`FR-7 A1: a main-loop turn.start naming the command clears pending when the promise never settles (${surface})`, async ($, on) => {
  const { calls, clk } = engine($, on, withSpec)
  runs(on, calls, () => new Promise(() => {}))
  on('turn.start', (_: any, e: any) => ({ turnId: e.turnId }))
  const ui = await pressNext($, clk, surface)
  void ui.press({ key: 'next' })
  await clk.settle()
  await $.turn.start({ text: 'unrelated', turnId: 't0' })
  await clk.settle()
  void ui.press({ key: 'next' })
  await clk.settle()
  expect(calls.runs.length).toBe(1)
  await $.turn.start({ text: `/akili-specify ${SPEC}`, turnId: 't1', agentId: 'sub' })
  await clk.settle()
  void ui.press({ key: 'next' })
  await clk.settle()
  expect(calls.runs.length).toBe(1)
  await $.turn.start({ text: `/akili-specify ${SPEC}`, turnId: 't2' })
  await clk.settle()
  void ui.press({ key: 'next' })
  await clk.settle()
  expect(calls.runs.length).toBe(2)
})

// Evidence for the spec tension (T5 note): session.start defers startSession on the clock, so the
// command is registered only once the clock has run. The kit does not refuse an unregistered command.
test('observation: /akili-panel as the very first command after session.start', async ($, on) => {
  const { calls, clk } = engine($, on, withSpec)
  await $.session.start({ cwd: ROOT, surface: 'terminal', isInteractive: true })
  const registeredBefore = !!calls.registered
  const reply: any = await $.command.run({ command: 'akili-panel', args: '' })
  expect(reply.text).toBe('Akili pane opened.') // the hook answers whether or not the name is registered
  await clk.settle()
  expect([registeredBefore, !!calls.registered]).toEqual([false, true])
})

// ------------------------------------------------------------------------------------------------
// /akili-test (changes/akili-panel): runtime behaviour the cases above do not prove. Same bottom as
// `engine`, but the project, the open panes and the host's usage can change while the test runs.

const ALL_SURFACES = ['terminal', 'desktop', 'vscode', 'mobile'] as const

type Rig = {
  tree: Record<string, string[]>
  texts: Record<string, string>
  panes: { id: string; title: string; isFocused: boolean; isPlaced: boolean }[]
  usage: Record<string, unknown>
  panesHang?: boolean
  panesHung?: number
  kv: Map<string, any>
  fs: string[]
  store: string[]
  sets: any[]
  runs: { command: string; args: string }[]
  toasts: string[]
  opens: any[]
  closes: any[]
  registered: string[]
  writes: string[]
  clk: any
  model: string | null
  commands: string[] | null
  logs: string[]
  modelCalls: number
  listCalls: number
  modelThrows?: boolean
  listThrows?: boolean
}

const AKILI_PANE = { id: 'akili', title: 'Akili', isFocused: true, isPlaced: true }

function rig($: any, on: any, tree: Record<string, string[]>, opts: { placed?: boolean; openThrows?: string; texts?: Record<string, string>; hangKeys?: boolean; storeThrows?: boolean; noClock?: boolean } = {}): Rig {
  const r: Rig = { tree, texts: opts.texts ?? {}, panes: [opts.placed === false ? { ...AKILI_PANE, isPlaced: false } : AKILI_PANE], usage: {}, kv: new Map(), fs: [], store: [], sets: [], runs: [], toasts: [], opens: [], closes: [], registered: [], writes: [], clk: undefined, model: 'claude-haiku-5-5', commands: [], logs: [], modelCalls: 0, listCalls: 0 }
  if (opts.noClock) on('clock.after', () => { throw new Error('clock down') })
  else r.clk = mock.clock(on)
  on('store.get', (_: any, e: any) => { r.store.push(`get ${e.key}`); return { value: r.kv.get(e.key) } })
  on('store.keys', () => { r.store.push('keys'); return opts.hangKeys ? new Promise(() => {}) : { value: [...r.kv.keys()] } })
  on('store.set', (_: any, e: any) => { r.store.push(`set ${e.key}`); if (opts.storeThrows) throw new Error('store down'); r.sets.push(e); r.kv.set(e.key, e.value); return { value: undefined } })
  on('store.delete', (_: any, e: any) => { r.kv.delete(e.key); return { value: undefined } })
  on('command.register', (_: any, e: any) => { r.registered.push(e.name); return { value: { command: e.name } } })
  on('session.root', () => ({ value: ROOT }))
  on('session.usage', () => { if (r.usage.throws) throw new Error('usage down'); if (r.usage.hangs) return new Promise(() => {}); return { value: r.usage } })
  on('session.start', (_: any, e: any) => ({ cwd: e.cwd }))
  on('session.end', (_: any, e: any) => ({ sessionId: e.sessionId }))
  on('session.measure', (_: any, e: any) => ({ changed: e.changed }))
  on('turn.complete', (_: any, e: any) => ({ text: e.answer }))
  on('turn.start', (_: any, e: any) => ({ turnId: e.turnId }))
  on('ui.toast', (_: any, e: any) => { r.toasts.push(String(e.text ?? e.message ?? JSON.stringify(e))); return { value: undefined } })
  on('ui.log', (_: any, e: any) => { r.logs.push(String(e.text ?? e.message ?? JSON.stringify(e))); return { value: undefined } })
  on('session.model', () => { r.modelCalls++; if (r.modelThrows) throw new Error('model down'); return { value: r.model } })
  on('command.list', () => { r.listCalls++; if (r.listThrows) throw new Error('list down'); return { value: (r.commands ?? []).map((name) => ({ name, source: name === 'model' ? 'builtin' : 'user' })) } })
  on('ui.close', (_: any, e: any) => { r.closes.push(e); return { value: undefined } })
  on('ui.open', (_: any, e: any) => {
    r.opens.push(e)
    if (opts.openThrows) throw new Error(opts.openThrows)
    return { value: opts.placed === false ? { isPlaced: false, reason: 'no surface' } : { isPlaced: true } }
  })
  on('ui.panes', () => { if (r.panesHang) { r.panesHung = (r.panesHung ?? 0) + 1; return new Promise(() => {}) } return { value: r.panes } })
  on('fs.list', (_: any, e: any) => {
    r.fs.push(`list ${e.path}`)
    const hit = r.tree[e.path]
    if (!hit) throw new Error(`ENOENT: no such file or directory, ${e.path}`)
    return { value: hit.map((n) => ({ name: n.replace(/\/$/, ''), kind: n.endsWith('/') ? 'dir' : 'file', size: 1, mtimeMs: 1 })) }
  })
  on('fs.exists', (_: any, e: any) => { r.fs.push(`exists ${e.path}`); return { value: e.path in r.texts } })
  on('fs.read', (_: any, e: any) => {
    r.fs.push(`read ${e.path}`)
    const text = r.texts[e.path]
    if (text === undefined) throw new Error(`EACCES: permission denied, ${e.path}`)
    return { value: text }
  })
  on('fs.write', (_: any, e: any) => { r.writes.push(`fs.write ${e.path}`); return { value: undefined } })
  return r
}

const twoSpecs = () => ({
  [`${ROOT}/docs/specs`]: ['changes/'],
  [`${ROOT}/docs/specs/changes`]: ['a/', 'b/'],
  [`${ROOT}/docs/specs/changes/a`]: ['proposal.md'],
  [`${ROOT}/docs/specs/changes/b`]: ['proposal.md'],
})

const oneSpec = () => ({
  [`${ROOT}/docs/specs`]: ['changes/'],
  [`${ROOT}/docs/specs/changes`]: ['demo/'],
  [`${ROOT}/docs/specs/changes/demo`]: ['proposal.md'],
})

async function opened($: any, r: Rig) {
  await $.session.start({ cwd: ROOT, surface: 'terminal', isInteractive: true })
  await r.clk.settle()
  const reply = await $.command.run({ command: 'akili-panel', args: '' })
  await r.clk.settle()
  return reply
}

function bottom(on: any, r: Rig, answer: (e: any) => unknown = () => ({ text: 'ran' })) {
  on('command.run', (_: any, e: any) => { r.runs.push({ command: e.command, args: e.args }); return answer(e) })
}

// A row is the Text that holds a row's parts; a part is the Text inside it (`paneRows`). `lines` are the rows' words.
async function drawn($: any, surface: (typeof ALL_SURFACES)[number] = 'terminal', bodyColumns = 80) {
  const ui = await $.ui.mount({ ...PANE, surface, props: { ...PANE.props, bodyColumns } })
  const lines: string[] = (await ui.findAll({ type: 'Text' })).filter((t: any) => t.children.some((c: any) => typeof c !== 'string')).map((t: any) => t.text)
  const nextRaw: string | undefined = (await ui.find({ key: 'next' }))?.text
  return { ui, lines, next: nextRaw?.trim(), nextRaw }
}

// The ctx and session rows, bar glyphs and runs of spaces dropped: `ctx 42% 84k/200k · session 0 in / 0 out · $7.50`.
const tokenRows = (lines: string[]) => lines.filter((l) => /^(ctx|session)\s/.test(l)).map((l) => l.replace(/[━─]/g, '').replace(/\s+/g, ' ').trim()).join(' · ')
const tokenLine = async ($: any) => {
  const { ui, lines } = await drawn($)
  await ui.unmount()
  return tokenRows(lines)
}

const measure = (usd: number) => ({ context: { window: 200000, tokens: 84000, percent: 42 }, rateLimits: [], cost: { usd }, changed: ['context', 'cost'] })
const turn = (id: string, usage: unknown, agentId?: string) => ({ turnId: id, answer: 'a', durationMs: 1, isAborted: false, reason: 'answer', usage, ...(agentId ? { agentId } : {}) })

// ---- FR-7 Run refused, double press

for (const surface of SURFACES) test(`FR-7 run refused: a toast with the reason, the pane keeps its state, and the next press runs (${surface})`, async ($, on) => {
  const r = rig($, on, oneSpec())
  bottom(on, r, () => { throw new Error('Unknown command: akili-specify') }) // the kit rejects the call, with its own words for the reason
  await opened($, r)
  const { ui, lines } = await drawn($, surface)
  await ui.press({ key: 'next' })
  await r.clk.settle()
  expect(r.toasts.length).toBe(1)
  expect(r.toasts[0]).toMatch(/^Could not run \/akili-specify: no implementation for command\.run$/) // the rejection's message is the reason
  expect(r.closes).toEqual([])
  await ui.unmount()
  const after = await drawn($, surface)
  expect(after.lines).toEqual(lines)
  expect(after.next).toBe('Next: /akili-specify changes/demo')
  await after.ui.press({ key: 'next' })
  await r.clk.settle()
  expect(r.runs.length).toBe(2)
  await after.ui.unmount()
})

for (const surface of SURFACES) test(`FR-7 double press: two presses in the same tick queue one run (${surface})`, async ($, on) => {
  const r = rig($, on, oneSpec())
  bottom(on, r, () => new Promise(() => {}))
  await opened($, r)
  const { ui } = await drawn($, surface)
  void ui.press({ key: 'next' })
  void ui.press({ key: 'next' })
  await r.clk.settle()
  expect(r.runs).toEqual([{ command: 'akili-specify', args: SPEC }])
})

test('FR-7 A1: a turn naming a longer command does not clear the guard', async ($, on) => {
  const r = rig($, on, oneSpec())
  bottom(on, r, () => new Promise(() => {}))
  await opened($, r)
  const { ui } = await drawn($)
  void ui.press({ key: 'next' })
  await r.clk.settle()
  await $.turn.start({ text: '/akili-specify-other changes/demo', turnId: 't1' })
  await r.clk.settle()
  void ui.press({ key: 'next' })
  await r.clk.settle()
  expect(r.runs.length).toBe(1)
})

test('FR-7 A1: a settled older run does not release the guard of a newer press', async ($, on) => {
  const r = rig($, on, oneSpec())
  let release: (v: unknown) => void = () => {}
  const first = new Promise((res) => { release = res })
  bottom(on, r, () => (r.runs.length === 1 ? first : new Promise(() => {})))
  await opened($, r)
  const { ui } = await drawn($)
  void ui.press({ key: 'next' })
  await r.clk.settle()
  await $.turn.start({ text: `/akili-specify ${SPEC}`, turnId: 't1' })
  await r.clk.advance(1000)
  void ui.press({ key: 'next' })
  await r.clk.settle()
  expect(r.runs.length).toBe(2)
  release({ text: 'done' })
  await r.clk.settle()
  void ui.press({ key: 'next' })
  await r.clk.settle()
  expect(r.runs.length).toBe(2)
})

// ---- FR-8 one command, opened only when asked

test('FR-8: the plugin registers akili-panel alone and never opens the pane unasked', async ($, on) => {
  const r = rig($, on, oneSpec())
  bottom(on, r)
  await $.session.start({ cwd: ROOT, surface: 'terminal', isInteractive: true })
  await r.clk.settle()
  await $.command.run({ command: 'akili-execute', args: SPEC })
  await $.turn.complete(turn('t1', { input_tokens: 1, output_tokens: 1 }))
  await r.clk.advance(65000)
  expect(r.registered).toEqual(['akili-panel'])
  expect(r.opens).toEqual([])
})

test('FR-8: /akili-panel asked again opens the same pane, and is answered without reaching the engine', async ($, on) => {
  const r = rig($, on, oneSpec())
  bottom(on, r)
  await opened($, r)
  const again: any = await $.command.run({ command: 'akili-panel', args: '' })
  await r.clk.settle()
  expect(again.text).toBe('Akili pane opened.')
  expect(r.opens.map((e) => `${e.id}|${e.title}`)).toEqual(['akili|Akili', 'akili|Akili'])
  expect(r.runs).toEqual([])
})

test('FR-8: a refused open answers with the reason', async ($, on) => {
  const r = rig($, on, oneSpec(), { openThrows: 'host limit' })
  const reply: any = await opened($, r)
  expect(reply.text).toMatch(/^Akili pane not shown: /) // the kit wraps a thrown hook, so the reason's words are the kit's
  expect(r.opens.length).toBe(1)
})

// ---- FR-5 / FR-9 what an observed run changes

test('FR-9 typed command: the pane refreshes after it and FR-5 shows the kept spec', async ($, on) => {
  const r = rig($, on, twoSpecs())
  bottom(on, r)
  await opened($, r)
  const before = await drawn($)
  expect(before.next).toBe('Next: /akili-specify changes/a')
  await before.ui.unmount()
  await $.command.run({ command: 'akili-execute', args: 'changes/b' })
  await r.clk.settle()
  const after = await drawn($)
  expect(after.next).toBe('Next: /akili-specify changes/b')
  expect(after.lines[0]).toMatch(/changes\/b/)
  expect(after.lines[1]).toMatch(/\(1 more active\)/)
  await after.ui.unmount()
})

test('FR-5: the kept spec survives a new session in the same project', async ($, on) => {
  const r = rig($, on, twoSpecs())
  bottom(on, r)
  await opened($, r)
  await $.command.run({ command: 'akili-execute', args: 'changes/b' })
  await r.clk.settle()
  await opened($, r)
  const { ui, next } = await drawn($)
  expect(next).toBe('Next: /akili-specify changes/b')
  await ui.unmount()
})

test('FR-5 BUT: unsafe arguments, a sentence, /akili-resume and /akili-quick change nothing in the store', async ($, on) => {
  const r = rig($, on, oneSpec())
  bottom(on, r)
  await opened($, r)
  for (const [command, args] of [['akili-execute', '../../etc'], ['akili-execute', '/tmp/x'], ['akili-propose', 'Add dark mode to settings'], ['akili-propose', 'loan'], ['akili-resume', ''], ['akili-quick', 'fix the typo']]) {
    await $.command.run({ command, args })
    await r.clk.settle()
  }
  expect(r.sets).toEqual([])
  expect(r.runs.length).toBe(6)
})

test('FR-9 Skill run: the call passes unchanged, its answer comes back, and the kept spec is the argument', async ($, on) => {
  const r = rig($, on, oneSpec())
  const seen: any[] = []
  on('tool.call', (_: any, e: any) => { seen.push([e.tool, e.skill, e.args]); return { result: {}, text: 'skill ran' } })
  await opened($, r)
  const got: any = await $.tool.call({ tool: 'Skill', skill: 'akili-test', args: 'changes/a --x' })
  await r.clk.settle()
  expect(seen).toEqual([['Skill', 'akili-test', 'changes/a --x']])
  expect(got.text).toBe('skill ran')
  expect(r.sets[0].value.path).toBe('changes/a')
})

// ---- FR-9 / NFR-4 fail open

test('NFR-4: a run the engine rejects runs once, and still rejects', async ($, on) => {
  const r = rig($, on, oneSpec())
  bottom(on, r, () => { throw new Error('engine says no') })
  await opened($, r)
  let message = ''
  try { await $.command.run({ command: 'akili-execute', args: SPEC }) } catch (err: any) { message = err.message }
  await r.clk.settle()
  expect(r.runs.length).toBe(1)
  expect(message).toMatch(/no implementation for command\.run/) // the kit's rejection, unchanged by the hook
})

test('NFR-4: a Skill call the engine rejects runs once', async ($, on) => {
  const r = rig($, on, oneSpec())
  let ran = 0
  on('tool.call', () => { ran++; throw new Error('engine says no') })
  await opened($, r)
  try { await $.tool.call({ tool: 'Skill', skill: 'akili-test', args: SPEC }) } catch { /* the outcome is not the plugin's */ }
  await r.clk.settle()
  expect(ran).toBe(1)
})

test('FR-9 BUT: the run does not wait for the plugin: a store that never answers delays nothing', async ($, on) => {
  const r = rig($, on, oneSpec(), { hangKeys: true })
  bottom(on, r)
  await opened($, r)
  for (let i = 0; i < 3; i++) {
    const got: any = await $.command.run({ command: 'akili-execute', args: SPEC })
    expect(got.text).toBe('ran')
    await r.clk.settle()
  }
  expect(r.store.filter((s) => s === 'keys').length > 0).toBe(true) // control: the plugin did reach the hung store
  expect(r.runs.length).toBe(3)
})

test('FR-9: a store that throws leaves a Skill call and every later run alone', async ($, on) => {
  const r = rig($, on, oneSpec(), { storeThrows: true })
  on('tool.call', () => ({ result: {}, text: 'skill ran' }))
  bottom(on, r)
  await opened($, r)
  const got: any = await $.tool.call({ tool: 'Skill', skill: 'akili-test', args: SPEC })
  await r.clk.settle()
  expect(got.text).toBe('skill ran')
  expect(((await $.command.run({ command: 'akili-test', args: SPEC })) as any).text).toBe('ran')
  await r.clk.settle()
  expect(r.store.filter((s) => s.startsWith('set')).length).toBe(2) // control: both reached the failing store
})

test('NFR-4: with the clock refusing work, every hook still answers what the engine answered', async ($, on) => {
  const r = rig($, on, oneSpec(), { noClock: true })
  bottom(on, r)
  on('tool.call', () => ({ result: {}, text: 'skill ran' }))
  await $.session.start({ cwd: ROOT, surface: 'terminal', isInteractive: true })
  expect(((await $.command.run({ command: 'akili-execute', args: SPEC })) as any).text).toBe('ran')
  expect(((await $.tool.call({ tool: 'Skill', skill: 'akili-test', args: SPEC })) as any).text).toBe('skill ran')
  expect(((await $.turn.complete(turn('t1', { output_tokens: 1 }))) as any).text).toBe('a')
  expect(((await $.session.measure(measure(1) as any)) as any).changed).toEqual(['context', 'cost'])
  expect(r.runs.length).toBe(1)
})

// ---- FR-10, NFR-1 nothing written, nothing read while drawing

test('FR-10: a whole session writes no file and appends nothing', async ($, on) => {
  const r = rig($, on, oneSpec())
  bottom(on, r)
  on('tool.call', () => ({ result: {} }))
  await opened($, r)
  await $.command.run({ command: 'akili-execute', args: SPEC })
  await $.tool.call({ tool: 'Skill', skill: 'akili-test', args: SPEC })
  await $.turn.complete(turn('t1', { input_tokens: 1, output_tokens: 1 }))
  await r.clk.advance(65000)
  const { ui } = await drawn($)
  await ui.press({ key: 'next' })
  await r.clk.settle()
  await ui.unmount()
  expect(r.fs.length > 0).toBe(true)
  expect(r.fs.filter((f) => !/^(list|exists|read) /.test(f))).toEqual([])
  expect(r.writes).toEqual([])
})

test('NFR-1: drawing reads neither the disk nor the store, on any surface', async ($, on) => {
  const r = rig($, on, oneSpec())
  await opened($, r)
  const fsBefore = r.fs.length
  const storeBefore = r.store.length
  for (const surface of ALL_SURFACES) {
    const { ui, next } = await drawn($, surface)
    expect(next).toBe('Next: /akili-specify changes/demo')
    await ui.unmount()
  }
  expect(r.fs.length).toBe(fsBefore)
  expect(r.store.length).toBe(storeBefore)
})

test('NFR-5: before the first refresh the pane draws without a view, on every surface', async ($, on) => {
  const r = rig($, on, oneSpec())
  await $.session.start({ cwd: ROOT, surface: 'terminal', isInteractive: true })
  await r.clk.settle()
  for (const surface of ALL_SURFACES) {
    const { ui, lines, next } = await drawn($, surface)
    expect(lines[0]).toBe('Akili')
    expect(next).toBe(undefined)
    await ui.unmount()
  }
})

// ---- NFR-3, NFR-8 the timer

test('NFR-3: an edit made outside the session shows within 30 s, with no event at all', async ($, on) => {
  const r = rig($, on, oneSpec(), { texts: { [`${ROOT}/docs/specs/changes/demo/tasks.md`]: '| Status | [x] |\n' } })
  await opened($, r)
  r.tree[`${ROOT}/docs/specs/changes/demo`] = ['proposal.md', 'requirements.md', 'design.md', 'tasks.md']
  await r.clk.advance(29000)
  const early = await drawn($)
  expect(early.next).toBe('Next: /akili-specify changes/demo')
  await early.ui.unmount()
  await r.clk.advance(1000)
  await r.clk.settle()
  const late = await drawn($)
  expect(late.next).toBe('Next: /akili-test changes/demo')
  await late.ui.unmount()
})

// /clear raises session.end and no session.start, and the docs do not say what the session atoms keep. The test
// `$` cannot write the plugin's atoms, so it makes the state a wipe leaves: `opened` false while the host still
// lists the pane (a tick that found it gone, then the pane back). Only a refresh the pane check lets through
// can then show the changed tree.
const TASKS_DONE = { [`${ROOT}/docs/specs/changes/demo/tasks.md`]: '| Status | [x] |\n' }
const FULL_DEMO = ['proposal.md', 'requirements.md', 'design.md', 'tasks.md']

async function staleOpened($: any, r: Rig) {
  r.panes = []
  await r.clk.advance(31000)
  r.panes = [AKILI_PANE]
  r.tree[`${ROOT}/docs/specs/changes/demo`] = FULL_DEMO
}

for (const surface of ALL_SURFACES.slice(0, 2)) test(`NFR-3 after /clear: the body comes back with no user action (${surface})`, async ($, on) => {
  const r = rig($, on, oneSpec(), { texts: TASKS_DONE })
  await opened($, r)
  await staleOpened($, r)
  await $.session.end({ reason: 'clear', sessionId: 's1' } as any)
  await r.clk.settle()
  const { ui, lines, next } = await drawn($, surface)
  expect(lines[0]).not.toBe('Akili')
  expect(lines.filter((l) => /propose|specify|execute|test|validate|archive/.test(l)).length).toBe(6)
  expect(next).toBe('Next: /akili-test changes/demo')
  await ui.unmount()
})

test('NFR-3: a pane the host still lists is refreshed by the timer within 30 s, opened or not', async ($, on) => {
  const r = rig($, on, oneSpec(), { texts: TASKS_DONE })
  await opened($, r)
  await staleOpened($, r)
  await r.clk.advance(30000)
  await r.clk.settle()
  const { ui, next } = await drawn($)
  expect(next).toBe('Next: /akili-test changes/demo')
  await ui.unmount()
})

test('FR-8, NFR-8 after /clear: a closed pane stays closed, reads no disk, and is not reopened', async ($, on) => {
  const r = rig($, on, oneSpec())
  await opened($, r)
  r.panes = []
  const opensBefore = r.opens.length
  const fsBefore = r.fs.length
  await $.session.end({ reason: 'clear', sessionId: 's1' } as any)
  await r.clk.advance(65000)
  expect(r.fs.length).toBe(fsBefore)
  expect(r.opens.length).toBe(opensBefore)
})

test('NFR-3 after /clear: repeated clears leave one timer, not a stack', async ($, on) => {
  const r = rig($, on, oneSpec())
  await opened($, r)
  const a = r.fs.length
  await r.clk.advance(30000)
  await r.clk.settle()
  const oneTick = r.fs.length - a // the reads one timer makes in 30 s
  expect(oneTick > 0).toBe(true)
  for (let i = 0; i < 3; i++) { await $.session.end({ reason: 'clear', sessionId: 's1' } as any); await r.clk.settle() }
  const b = r.fs.length
  await r.clk.advance(30000)
  await r.clk.settle()
  expect(r.fs.length - b).toBe(oneTick)
})

test('NFR-8: a closed pane reads no disk; the kept spec and the sums are still recorded, and show on reopen', async ($, on) => {
  const r = rig($, on, twoSpecs())
  bottom(on, r)
  await opened($, r)
  r.panes = []
  await r.clk.advance(31000) // the tick that finds the pane gone
  const fsBefore = r.fs.length
  await $.command.run({ command: 'akili-execute', args: 'changes/b' })
  await $.turn.complete(turn('t1', { input_tokens: 1500, output_tokens: 20 }))
  await r.clk.advance(65000)
  expect(r.fs.length).toBe(fsBefore)
  expect(r.kv.get(`spec:${ROOT}`).path).toBe('changes/b')
  r.panes = [AKILI_PANE]
  await $.command.run({ command: 'akili-panel', args: '' })
  await r.clk.settle()
  expect(r.fs.length > fsBefore).toBe(true)
  const { ui, next, lines } = await drawn($)
  expect(next).toBe('Next: /akili-specify changes/b')
  expect(tokenRows(lines)).toBe('ctx — · session 1.5k in / 20 out')
  await ui.unmount()
})

test('NFR-8: a pane the host did not place reads no disk, whatever happens', async ($, on) => {
  const r = rig($, on, twoSpecs(), { placed: false })
  bottom(on, r)
  await opened($, r)
  await $.command.run({ command: 'akili-execute', args: 'changes/b' })
  await $.turn.complete(turn('t1', { output_tokens: 1 }))
  await r.clk.advance(65000)
  expect(r.fs).toEqual([])
  expect(r.kv.get(`spec:${ROOT}`).path).toBe('changes/b')
})

// ---- FR-12 the token line from real events

test('FR-12 fresh session: no response yet, with and without a cost', async ($, on) => {
  const r = rig($, on, oneSpec())
  r.usage = { context: { window: 200000 } }
  await opened($, r)
  expect(await tokenLine($)).toBe('ctx — · session 0 in / 0 out')
  await $.session.measure({ context: { window: 200000 }, rateLimits: [], cost: { usd: 0 }, changed: ['cost'] } as any)
  await r.clk.settle()
  expect(await tokenLine($)).toBe('ctx — · session 0 in / 0 out · $0.00')
})

test('FR-12 session.start seeds ctx and $ from the host', async ($, on) => {
  const r = rig($, on, oneSpec())
  r.usage = { context: { window: 200000, tokens: 6000, percent: 3 }, cost: { usd: 7.5 } }
  await opened($, r)
  expect(await tokenLine($)).toBe('ctx 3% 6.0k/200k · session 0 in / 0 out · $7.50')
})

test('FR-12 D-9: every finished turn counts once, subagent turns included; in = input + cache-read + cache-write', async ($, on) => {
  const r = rig($, on, oneSpec())
  await opened($, r)
  await $.turn.complete(turn('t1', { input_tokens: 10, cache_read_input_tokens: 200, cache_creation_input_tokens: 1142, output_tokens: 167 }))
  await $.turn.complete(turn('t2', { input_tokens: 100, cache_read_input_tokens: 0, cache_creation_input_tokens: 48, output_tokens: 33 }, 'sub-1'))
  await $.turn.complete(turn('t3', undefined))
  await r.clk.settle()
  expect(await tokenLine($)).toBe('ctx — · session 1.5k in / 200 out')
})

test('FR-12 session.measure carries the live fill and the cost into the line', async ($, on) => {
  const r = rig($, on, oneSpec())
  await opened($, r)
  await $.session.measure(measure(0.351) as any)
  await r.clk.settle()
  expect(await tokenLine($)).toBe('ctx 42% 84k/200k · session 0 in / 0 out · $0.35')
})

for (const reason of ['clear', 'resume']) test(`FR-12 after ${reason}: the session figures start again from 0`, async ($, on) => {
  const r = rig($, on, oneSpec())
  await opened($, r)
  await $.turn.complete(turn('t1', { input_tokens: 5000, output_tokens: 700 }))
  await r.clk.settle()
  await $.session.end({ reason, sessionId: 's1' } as any)
  await r.clk.settle()
  expect(await tokenLine($)).toMatch(/session 0 in \/ 0 out/)
})

test('FR-12: a session.end for any other reason leaves the sums alone', async ($, on) => {
  const r = rig($, on, oneSpec())
  await opened($, r)
  await $.turn.complete(turn('t1', { input_tokens: 5000, output_tokens: 700 }))
  await r.clk.settle()
  await $.session.end({ reason: 'other', sessionId: 's1' } as any)
  await r.clk.settle()
  expect(await tokenLine($)).toMatch(/session 5\.0k in \/ 700 out/)
})

// The host raises no session.start after /clear (`SessionEndInput.reason`) and no measure until a figure moves,
// so nothing else refills the `$` part here. The host's own total is still reported by `$.session.usage()`.
test('FR-12 after /clear AND: the $ part stays Claude Code\'s own total (W-12)', async ($, on) => {
  const r = rig($, on, oneSpec())
  r.usage = { context: { window: 200000 }, cost: { usd: 7.5 } }
  await opened($, r)
  await $.session.measure(measure(7.5) as any)
  await r.clk.settle()
  await $.session.end({ reason: 'clear', sessionId: 's1' } as any)
  await r.clk.settle()
  expect(await tokenLine($)).toBe('ctx — · session 0 in / 0 out · $7.50')
})

test('FR-12 after /clear: a host still reporting the old fill still shows ctx —', async ($, on) => {
  const r = rig($, on, oneSpec())
  r.usage = { context: { window: 200000, tokens: 84000, percent: 42 }, cost: { usd: 7.5 } }
  await opened($, r)
  await $.session.measure(measure(7.5) as any)
  await r.clk.settle()
  expect(await tokenLine($)).toMatch(/ctx 42% 84k\/200k/)
  await $.session.end({ reason: 'clear', sessionId: 's1' } as any)
  await r.clk.settle()
  expect(await tokenLine($)).toBe('ctx — · session 0 in / 0 out · $7.50')
})

test('NFR-4: a $.session.usage() that never settles delays nothing and leaves no stale fill', async ($, on) => {
  let ran = 0
  on('tool.call', () => { ran++; throw new Error('engine says no') })
  const r = rig($, on, oneSpec())
  r.usage = { context: { window: 200000, tokens: 84000, percent: 42 }, cost: { usd: 7.5 } }
  await opened($, r)
  await $.session.measure(measure(7.5) as any)
  await $.turn.complete(turn('t1', { input_tokens: 5000, output_tokens: 700 }))
  await r.clk.settle()
  r.usage = { hangs: true }
  await $.session.end({ reason: 'clear', sessionId: 's1' } as any)
  await r.clk.settle()
  const reply: any = await $.command.run({ command: 'akili-panel', args: '' })
  expect(reply.text).toBe('Akili pane opened.')
  try { await $.tool.call({ tool: 'Skill', skill: 'akili-test', args: SPEC }) } catch { /* the outcome is not the plugin's */ }
  await r.clk.settle()
  expect(ran).toBe(1)
  expect(await tokenLine($)).toBe('ctx — · session 0 in / 0 out · $7.50')
})

test('NFR-4: $.session.usage() rejecting during the reset leaves commands and tool calls alone, the sums at 0', async ($, on) => {
  let ran = 0
  on('tool.call', () => { ran++; throw new Error('engine says no') })
  const r = rig($, on, oneSpec())
  await opened($, r)
  await $.turn.complete(turn('t1', { input_tokens: 5000, output_tokens: 700 }))
  await r.clk.settle()
  r.usage = { throws: true }
  await $.session.end({ reason: 'clear', sessionId: 's1' } as any)
  await r.clk.settle()
  const reply: any = await $.command.run({ command: 'akili-panel', args: '' })
  expect(reply.text).toBe('Akili pane opened.')
  try { await $.tool.call({ tool: 'Skill', skill: 'akili-test', args: SPEC }) } catch { /* the outcome is not the plugin's */ }
  await r.clk.settle()
  expect(ran).toBe(1)
  expect(await tokenLine($)).toMatch(/session 0 in \/ 0 out/)
})

test('FR-12 after a resume followed by session.start: the $ part is the host\'s total, the sums 0', async ($, on) => {
  const r = rig($, on, oneSpec())
  r.usage = { context: { window: 200000 }, cost: { usd: 7.5 } }
  await opened($, r)
  await $.turn.complete(turn('t1', { input_tokens: 5000, output_tokens: 700 }))
  await r.clk.settle()
  await $.session.end({ reason: 'resume', sessionId: 's1' } as any)
  await $.session.start({ cwd: ROOT, surface: 'terminal', isInteractive: true })
  await r.clk.settle()
  expect(await tokenLine($)).toBe('ctx — · session 0 in / 0 out · $7.50')
})

test('FR-12 after /clear: the next measure fills the line again', async ($, on) => {
  const r = rig($, on, oneSpec())
  await opened($, r)
  await $.session.end({ reason: 'clear', sessionId: 's1' } as any)
  await r.clk.settle()
  await $.session.measure(measure(7.5) as any)
  await r.clk.settle()
  expect(await tokenLine($)).toBe('ctx 42% 84k/200k · session 0 in / 0 out · $7.50')
})

// ---- changes/akili-panel-polish T3: the transparent pane and the rows

test('FR-1: the one open asks for a transparent body and the full layout\'s rows; a surface that ignores it still draws (FR-4)', async ($, on) => {
  const r = rig($, on, oneSpec())
  await opened($, r)
  expect(r.opens.length).toBe(1)
  expect(r.opens[0].backgroundColor).toBe('transparent')
  expect(r.opens[0].rows).toBe(19)
  const { ui, lines } = await drawn($, 'mobile')
  expect(lines.length > 10 && r.toasts.length === 0).toBe(true) // BUT no error or toast about the background
  await ui.unmount()
})

for (const surface of ALL_SURFACES) test(`FR-6 the Next button: a chip on the terminal, the surface's primary elsewhere; a blank row above it (${surface})`, async ($, on) => {
  const r = rig($, on, oneSpec())
  bottom(on, r, () => new Promise(() => {}))
  await opened($, r)
  const first = await drawn($, surface)
  const btn: any = await first.ui.find({ key: 'next' })
  const chip = surface === 'terminal'
  expect(first.nextRaw).toBe(chip ? ' Next: /akili-specify changes/demo ' : 'Next: /akili-specify changes/demo')
  expect(btn.props.plain === true).toBe(chip)
  expect(btn.props.variant === 'primary').toBe(!chip)
  if (chip) expect(btn.children[0].props).toMatchObject({ backgroundColor: 'suggestion', color: 'inverseText', bold: true })
  expect((await first.ui.findAll({ type: 'Text', text: /^ $/ })).length).toBe(1) // the blank row
  const kids = (await first.ui.find({ type: 'Box' })).children
  expect(kids.at(-1).type).toBe('Button') // no Skills listed: Next closes the pane
  expect(JSON.stringify(kids.at(-1))).toMatch(/Next: /)
  void first.ui.press({ key: 'next' })
  await r.clk.settle()
  expect(r.runs).toEqual([{ command: 'akili-specify', args: SPEC }]) // the press runs once
  await first.ui.unmount()
  const busy = await drawn($, surface)
  const dim: any = await busy.ui.find({ key: 'next' })
  expect(dim.props.dimColor).toBe(true)
  expect(busy.next).toBe('Next: /akili-specify changes/demo') // the words do not change
  if (chip) expect(JSON.stringify(dim.children)).not.toMatch(/suggestion/) // no fill while pending
  await busy.ui.unmount()
})

test('FR-6 BUT: no padded chip at 1 to 2 columns, where the row is cut to the width (FR-7)', async ($, on) => {
  const r = rig($, on, oneSpec())
  await opened($, r)
  for (const width of [1, 2]) {
    const { ui, lines, nextRaw } = await drawn($, 'terminal', width)
    expect(nextRaw).toBeUndefined()
    for (const line of lines) expect(line.length <= width).toBe(true)
    await ui.unmount()
  }
})

for (const surface of SURFACES) test(`FR-8: a read failure is a row in the error tone (${surface})`, async ($, on) => {
  const r = rig($, on, { ...oneSpec(), [`${ROOT}/docs/specs/changes/demo`]: ['proposal.md', 'requirements.md', 'design.md', 'tasks.md'] })
  await opened($, r)
  const { ui } = await drawn($, surface, 200)
  const row: any = await ui.find({ type: 'Text', text: /^Could not read / })
  expect(row.children[0].props.color).toBe('error')
  await ui.unmount()
})

// ---- FR-16 in the drawn pane

for (const surface of SURFACES) test(`FR-16 a read fails: one Could not read line, the rest of the pane still drawn (${surface})`, async ($, on) => {
  const tasks = `${ROOT}/docs/specs/changes/demo/tasks.md`
  const r = rig($, on, { ...oneSpec(), [`${ROOT}/docs/specs/changes/demo`]: ['proposal.md', 'requirements.md', 'design.md', 'tasks.md'] })
  await opened($, r)
  const { ui, lines, next } = await drawn($, surface, 200)
  const errors = lines.filter((l) => l.startsWith('Could not read'))
  expect(errors.length).toBe(1)
  expect(errors[0].startsWith(`Could not read ${tasks}: `)).toBe(true)
  expect(/[\r\n]/.test(errors[0])).toBe(false) // the kit's reason spans lines: this proves the collapse too
  expect(lines.filter((l) => /propose|specify|execute|test|validate|archive/.test(l) && !l.startsWith('Could')).length).toBe(6)
  expect(next).toBe('Next: /akili-execute changes/demo')
  await ui.unmount()
})

for (const surface of SURFACES) test(`FR-16 narrow pane: every drawn string and the button fit (${surface}); the painted result is a human check (D-6)`, async ($, on) => {
  const long = 'a-very-long-spec-name-that-cannot-fit'
  const r = rig($, on, {
    [`${ROOT}/docs/specs`]: ['changes/'],
    [`${ROOT}/docs/specs/changes`]: [`${long}/`, 'b/'],
    [`${ROOT}/docs/specs/changes/${long}`]: ['proposal.md'],
    [`${ROOT}/docs/specs/changes/b`]: ['proposal.md'],
  })
  r.usage = { context: { window: 200000, tokens: 84000, percent: 42 }, cost: { usd: 12.34 } }
  await opened($, r)
  for (const width of [24, 40, 50]) {
    const { ui, lines, nextRaw } = await drawn($, surface, width)
    for (const line of [...lines, nextRaw ?? '']) expect(line.length <= width).toBe(true)
    expect(lines[0]).toMatch(/…/)
    await ui.unmount()
  }
})

test('FR-9 BUT: with $.ui.panes() never settling, session.end clear resolves, and /akili-panel and a Skill call still run', async ($, on) => {
  const r = rig($, on, oneSpec())
  const seen: any[] = []
  on('tool.call', (_: any, e: any) => { seen.push([e.tool, e.skill, e.args]); return { result: {}, text: 'skill ran' } })
  await opened($, r)
  r.panesHang = true
  let ended = false
  void $.session.end({ reason: 'clear', sessionId: 's1' } as any).then(() => { ended = true })
  await r.clk.settle()
  expect(ended).toBe(true)
  expect((r.panesHung ?? 0) > 0).toBe(true) // control: the plugin's own work did reach the hung call
  const reply: any = await $.command.run({ command: 'akili-panel', args: '' })
  expect(reply.text).toBe('Akili pane opened.')
  const got: any = await $.tool.call({ tool: 'Skill', skill: 'akili-test', args: SPEC })
  expect(got.text).toBe('skill ran')
  expect(seen).toEqual([['Skill', 'akili-test', SPEC]])
})

for (const surface of SURFACES) test(`FR-2/FR-4 drawn as built: bold Akili and current row, the whole chain in order with the error before the second rule (${surface})`, async ($, on) => {
  const r = rig($, on, { ...oneSpec(), [`${ROOT}/docs/specs/changes/demo`]: ['proposal.md', 'requirements.md', 'design.md', 'tasks.md'] })
  await opened($, r)
  const { ui, lines } = await drawn($, surface, 200)
  const bold = (await ui.findAll({ type: 'Text' })).filter((t: any) => t.props.bold === true).map((t: any) => t.text)
  expect(bold).toContain('Akili')
  expect(bold.some((t: string) => /execute/.test(t))).toBe(true)
  const chain = [/^Akili/, /^\(no git\)|^\S+$/, /^─+$/, /^01 Constitution/, /^02 Cycle/, ...['propose', 'specify', 'execute', 'test', 'validate', 'archive'].map((p) => new RegExp(`^   ${p}\\s`)), /^Could not read /, /^─+$/, /^ctx\s/, /^session\s/, /^model\s/]
  expect(lines.length).toBe(chain.length)
  chain.forEach((re, i) => expect(lines[i]).toMatch(re))
  await ui.unmount()
})

test('FR-4 drawn as built: the empty-state text is dim', async ($, on) => {
  const r = rig($, on, {})
  await opened($, r)
  const { ui } = await drawn($)
  const row: any = await ui.find({ type: 'Text', text: /No docs\/specs\/ folder yet\./ })
  expect(row.children[0].props.dimColor).toBe(true)
  await ui.unmount()
})

// ---- changes/akili-panel-polish /akili-test: clauses the T3 tests above do not assert (literals from requirements.md at fbcc995)

for (const surface of ALL_SURFACES) test(`FR-4 Inline pane: the rows asked for are the rows the closed full layout draws, Next inside them (${surface})`, async ($, on) => {
  const r = rig($, on, oneSpec())
  r.usage = { context: { window: 200000, tokens: 84000, percent: 42 }, cost: { usd: 0.35 } }
  r.commands = ['kaizen', 'tdd']
  await opened($, r)
  const ui = await $.ui.mount({ ...PANE, surface })
  const root: any = await ui.find({ type: 'Box' })
  expect(root.children.length).toBe(r.opens[0].rows)
  const at = root.children.findIndex((c: any) => c.type === 'Button' && /Next: /.test(JSON.stringify(c)))
  expect(at > 0 && at < root.children.length - 1).toBe(true) // Next is inside the asked rows, and no longer the last
  await ui.unmount()
})

test('FR-4 Inline pane BUT a size the person set stays theirs: after the open, nothing the plugin does on its own asks for a size again', async ($, on) => {
  const r = rig($, on, oneSpec())
  bottom(on, r)
  await opened($, r)
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await ui.press({ key: 'next' })
  await r.clk.settle()
  await ui.unmount()
  await $.command.run({ command: 'akili-execute', args: SPEC })
  await $.turn.start({ text: `/akili-execute ${SPEC}`, turnId: 't0' })
  await $.turn.complete(turn('t1', { input_tokens: 1, output_tokens: 1 }))
  await $.session.measure(measure(1) as any)
  await $.session.end({ reason: 'clear', sessionId: 's1' } as any)
  await r.clk.advance(65000)
  for (const surface of ALL_SURFACES) for (const width of [20, 80]) { const d = await drawn($, surface, width); await d.ui.unmount() }
  expect(r.opens.length).toBe(1)
  expect(r.closes).toEqual([])
})

test('FR-1 A surface keeps its own look: every row draws on every surface BUT no reply, toast or row mentions the background', async ($, on) => {
  const r = rig($, on, oneSpec())
  const reply: any = await opened($, r)
  expect(reply.text).toBe('Akili pane opened.')
  for (const surface of ALL_SURFACES) {
    const { ui, lines, next } = await drawn($, surface)
    expect(lines.length).toBe(15) // header 2, rule, constitution, cycle, 6 phases, rule, ctx, session, model
    expect(next).toBe('Next: /akili-specify changes/demo')
    expect(lines.filter((l) => /background|transparent/i.test(l))).toEqual([])
    await ui.unmount()
  }
  expect(r.toasts).toEqual([])
  expect(/background|transparent/i.test(reply.text)).toBe(false)
})

// ---- changes/akili-panel-model-skills T3: the model row, the Skills section, their presses (FR-1..FR-5, DD-2..DD-7)

const LISTED = ['kaizen', 'tdd', 'caveman', 'nestjs-expert', 'model', 'not-in-catalog']
const keys = async (ui: any) => (await ui.findAll({ type: 'Button' })).map((b: any) => b.key)

test('FR-1 Model changes: the row shows the id once refreshed, and again after /model, with no turn in between', async ($, on) => {
  const r = rig($, on, oneSpec())
  bottom(on, r)
  await opened($, r)
  let d = await drawn($)
  expect(d.lines.some((l) => /^model\s+claude-haiku-5-5$/.test(l))).toBe(true)
  await d.ui.unmount()
  r.model = 'claude-opus-5-1'
  await $.command.run({ command: 'model', args: 'opus' })
  await r.clk.settle()
  d = await drawn($)
  expect(d.lines.some((l) => /^model\s+claude-opus-5-1$/.test(l))).toBe(true)
  await d.ui.unmount()
})

test('FR-1 AND the model is read again after /clear', async ($, on) => {
  const r = rig($, on, oneSpec())
  await opened($, r)
  r.model = 'claude-sonnet-5-5'
  await $.session.end({ reason: 'clear', sessionId: 's1' } as any)
  await r.clk.settle()
  const d = await drawn($)
  expect(d.lines.some((l) => /^model\s+claude-sonnet-5-5$/.test(l))).toBe(true)
  await d.ui.unmount()
})

test('FR-1 Model unknown: a rejected $.session.model draws model — and logs once; the rest of the pane still draws', async ($, on) => {
  const r = rig($, on, oneSpec())
  r.modelThrows = true
  r.commands = LISTED
  await opened($, r)
  const d = await drawn($)
  expect(d.lines.some((l) => /^model\s+—$/.test(l))).toBe(true)
  expect(d.lines.some((l) => /^ctx\s/.test(l))).toBe(true)
  expect(await keys(d.ui)).toContain('skills') // the command list still answered
  expect(r.logs.filter((l) => /model read failed/.test(l)).length).toBe(1)
  await d.ui.unmount()
})

test('FR-2 Nothing listed: a rejected $.command.list draws no Skills section and logs once; the model row stays', async ($, on) => {
  const r = rig($, on, oneSpec())
  r.listThrows = true
  await opened($, r)
  const d = await drawn($)
  expect(await keys(d.ui)).toEqual(['next'])
  expect(d.lines.some((l) => /Skills/.test(l))).toBe(false)
  expect(d.lines.some((l) => /^model\s+claude-haiku-5-5$/.test(l))).toBe(true)
  expect(r.logs.filter((l) => /command list failed/.test(l)).length).toBe(1)
  await d.ui.unmount()
})

test('FR-2 Closed: Skills (4) shows closed with its mark; only listed, catalogued names count (model and not-in-catalog do not)', async ($, on) => {
  const r = rig($, on, oneSpec())
  r.commands = LISTED
  await opened($, r)
  const d = await drawn($)
  expect(d.lines.at(-1)).toBe('Skills (4) ▸')
  expect(await keys(d.ui)).toEqual(['next', 'skills'])
  await d.ui.unmount()
})

test('FR-2/FR-3 Open and close, one group at a time: the toggle opens the groups, a group opens its skills, a second group closes the first', async ($, on) => {
  const r = rig($, on, oneSpec())
  r.commands = LISTED
  await opened($, r)
  const press = async (key: string) => {
    const d = await drawn($)
    await d.ui.press({ key })
    await r.clk.settle()
    await d.ui.unmount()
    const after = await drawn($)
    const k = await keys(after.ui)
    await after.ui.unmount()
    return k
  }
  expect(await press('skills')).toEqual(['next', 'skills', 'skills-group-core', 'skills-group-conditional', 'skills-group-stack'])
  const core = (await press('skills-group-core')).filter((k: string) => k.startsWith('skill-'))
  expect(core).toEqual(['skill-caveman', 'skill-kaizen'])
  const stack = (await press('skills-group-stack')).filter((k: string) => k.startsWith('skill-'))
  expect(stack).toEqual(['skill-nestjs-expert']) // the first group closed, the second opened
  expect(await press('skills')).toEqual(['next', 'skills'])
})

test('FR-2 Closed at every pane open: an open section is closed again by a reopen and by a new session', async ($, on) => {
  const r = rig($, on, oneSpec())
  r.commands = LISTED
  await opened($, r)
  let d = await drawn($)
  await d.ui.press({ key: 'skills' })
  await r.clk.settle()
  await d.ui.unmount()
  d = await drawn($)
  expect((await keys(d.ui)).length > 2).toBe(true) // control: it was open
  await d.ui.unmount()
  await $.command.run({ command: 'akili-panel', args: '' }) // reopen
  await r.clk.settle()
  d = await drawn($)
  expect(await keys(d.ui)).toEqual(['next', 'skills'])
  await d.ui.press({ key: 'skills' })
  await r.clk.settle()
  await d.ui.unmount()
  await $.session.start({ cwd: ROOT, surface: 'terminal', isInteractive: true })
  await r.clk.settle()
  d = await drawn($)
  expect(await keys(d.ui)).toEqual(['next', 'skills'])
  await d.ui.unmount()
})

async function openGroup($: any, r: Rig, group: string) {
  const a = await drawn($)
  await a.ui.press({ key: 'skills' })
  await r.clk.settle()
  await a.ui.unmount()
  const b = await drawn($)
  await b.ui.press({ key: `skills-group-${group}` })
  await r.clk.settle()
  await b.ui.unmount()
}

test('FR-4 Run: a skill press runs the bare name with no args once; AND the section stays open', async ($, on) => {
  const r = rig($, on, oneSpec())
  r.commands = ['kaizen']
  bottom(on, r)
  await opened($, r)
  await openGroup($, r, 'core')
  const d = await drawn($)
  await d.ui.press({ key: 'skill-kaizen' })
  await r.clk.settle()
  await d.ui.unmount()
  expect(r.runs).toEqual([{ command: 'kaizen', args: '' }])
  const after = await drawn($)
  expect(await keys(after.ui)).toContain('skill-kaizen')
  await after.ui.unmount()
})

test('FR-4 Double press across Next and a skill queues one run; AND the skill row is dim while it runs', async ($, on) => {
  const r = rig($, on, oneSpec())
  r.commands = ['kaizen']
  bottom(on, r, () => r.clk.sleep(5000).then(() => ({ text: 'done' })))
  await opened($, r)
  await openGroup($, r, 'core')
  const d = await drawn($)
  const first = d.ui.press({ key: 'skill-kaizen' })
  await r.clk.settle()
  void d.ui.press({ key: 'next' })
  void d.ui.press({ key: 'skill-kaizen' })
  await r.clk.settle()
  expect(r.runs).toEqual([{ command: 'kaizen', args: '' }])
  await d.ui.unmount()
  const busy = await drawn($)
  const row: any = await busy.ui.find({ key: 'skill-kaizen' })
  expect(JSON.stringify(row.children)).toMatch(/"dimColor":true/)
  await busy.ui.unmount()
  await r.clk.advance(5000)
  await first
})

test('FR-4 Refused: a rejected skill run toasts the reason, and the section stays open', async ($, on) => {
  const r = rig($, on, oneSpec())
  r.commands = ['kaizen']
  bottom(on, r, () => { throw new Error('no command named /kaizen in this session') })
  await opened($, r)
  await openGroup($, r, 'core')
  const d = await drawn($)
  await d.ui.press({ key: 'skill-kaizen' })
  await r.clk.settle()
  expect(r.toasts.length).toBe(1)
  expect(r.toasts[0]).toMatch(/Could not run \/kaizen: /)
  await d.ui.unmount()
  const after = await drawn($)
  expect(await keys(after.ui)).toContain('skill-kaizen')
  await after.ui.unmount()
})

test('FR-5 Read only: refreshing the host reads no file outside the project and starts no process', async ($, on) => {
  const r = rig($, on, oneSpec())
  r.commands = LISTED
  await opened($, r)
  await r.clk.advance(35000)
  expect(r.fs.filter((l) => /skills|\.claude|SKILL/.test(l))).toEqual([]) // the catalog is a constant: no skill folder is read
  expect(r.writes).toEqual([])
  expect(r.modelCalls > 0 && r.listCalls > 0).toBe(true)
})
