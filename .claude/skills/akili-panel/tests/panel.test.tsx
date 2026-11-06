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
