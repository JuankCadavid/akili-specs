// akili-panel hooks module (changes/akili-panel T5, design §3, §5, §6, §8).
// Read-only toward the project (FR-10): file list, exists and read only, no process (DD-17).
// Every hook passes the event on first with `next(e)` and returns what it resolved to; the
// plugin's own work runs afterwards on the clock, so a failure here never reaches the command.
// Only the /akili-panel hook answers for itself, without next.
import { atom, read, update } from 'claude-code'
import {
  STRINGS, MAX_KEPT, refresh, keptSpecFor, keepSpec, storeKey, paneRows, turnTokens,
} from './flow.mjs'

const PANE = 'akili'
const TICK_MS = 30000
const PANE_ROWS = 16 // the full layout's height (DD-P12)
const OTHER_AKILI = /^akili-(?!panel$)/

const view = atom({ plugin: 'akili-panel', key: 'view' }, null, { shape: 'view-1' })
const tokens = atom({ plugin: 'akili-panel', key: 'tokens' }, { in: 0, out: 0 }, { shape: 'tokens-1' })
const usage = atom({ plugin: 'akili-panel', key: 'usage' }, {}, { shape: 'usage-1' })
const opened = atom({ plugin: 'akili-panel', key: 'opened' }, false)
const pending = atom({ plugin: 'akili-panel', key: 'pending' }, null)

const reasonOf = (err) => String((err && err.message) || err)
const passOn = ($, e, next) => next(e)

// ------------------------------------------------------------ refresh (the only disk reader)

const ioOver = ($) => ({
  list: (p) => $.fs.list(p),
  exists: (p) => $.fs.exists(p),
  read: (p) => $.fs.read(p),
})

// The host's record decides, not `opened`: /clear can wipe the session atoms while the pane stays up (the
// docs say nothing of what survives it), so a placed `akili` pane restores `opened`, and one gone clears it.
async function paneIsUp($) {
  const up = (await $.ui.panes()).some((pane) => pane.id === PANE && pane.isPlaced)
  if (up !== (await read($, opened))) await update($, opened, () => up)
  return up
}

async function refreshOnce($) {
  if (!(await paneIsUp($))) return
  const root = await $.session.root()
  const kept = await $.store.get(storeKey(root))
  const snapshot = await refresh(ioOver($), root, kept && typeof kept.path === 'string' ? kept.path : null)
  snapshot.refreshedAt = await $.clock.now()
  await update($, view, () => snapshot)
}

// Coalesced: one refresh in flight, one queued behind it (DD-5).
let inFlight = false
let again = false
async function runRefresh($) {
  if (inFlight) { again = true; return }
  inFlight = true
  try {
    do { again = false; await refreshOnce($) } while (again)
  } catch (err) {
    $.ui.log(`akili-panel: refresh failed: ${reasonOf(err)}`)
  } finally {
    inFlight = false
  }
}

const later = ($, work) => { try { $.clock.after(0, () => { void work().catch(() => {}) }) } catch (err) { /* fail open */ } }

// ------------------------------------------------------------ scheduled work

async function recordKept($, command, args) {
  const path = keptSpecFor(command, args)
  if (!path) return
  const root = await $.session.root()
  const key = storeKey(root)
  const keys = (await $.store.keys()).filter((k) => k.startsWith('spec:'))
  const at = await $.clock.now()
  let entries = {}
  if (keys.filter((k) => k !== key).length >= MAX_KEPT) {
    for (const k of keys) {
      const v = await $.store.get(k)
      if (v && typeof v.path === 'string') entries[k] = v
    }
  }
  const next = keepSpec(entries, root, path, at)
  await $.store.set(key, next[key])
  for (const k of Object.keys(entries)) if (!(k in next)) await $.store.delete(k)
}

async function afterRun($, command, args) {
  await recordKept($, command, args)
  await runRefresh($)
}

async function addTurn($, turnUsage) {
  const t = turnTokens(turnUsage)
  await update($, tokens, (s) => ({ in: s.in + t.in, out: s.out + t.out }))
}

const usageFrom = (context, cost) => {
  const c = context || {}
  const out = { ctxWindow: c.window }
  if (typeof c.percent === 'number') { out.ctxPercent = c.percent; out.ctxTokens = c.tokens }
  if (cost && typeof cost.usd === 'number') out.usd = cost.usd
  return out
}

async function copyUsage($, measured) {
  await update($, usage, () => usageFrom(measured.context, measured.cost))
}

async function resetSums($) {
  await update($, tokens, () => ({ in: 0, out: 0 }))
  // The fill (ctxPercent, ctxTokens) goes first, so a failed or hanging re-read leaves no stale fill; `usd` stays until it answers.
  await update($, usage, (u) => { const { ctxPercent, ctxTokens, ...rest } = u || {}; return rest })
  const measured = await $.session.usage()
  const fresh = usageFrom(measured.context, measured.cost)
  await update($, usage, () => (typeof fresh.usd === 'number' ? { ctxWindow: fresh.ctxWindow, usd: fresh.usd } : { ctxWindow: fresh.ctxWindow }))
}

// A Next run settled or was seen starting: release the guard, but only the press that set it (A1).
const clearPending = ($, since) => update($, pending, (cur) => (cur && cur.since === since ? null : cur))

async function afterTurnStart($, text) {
  const cur = await read($, pending)
  if (!cur || !new RegExp(`/${cur.command}(?![\\w-])`).test(text)) return
  await clearPending($, cur.since)
}

// One 30 s timer at most: a start cancels the one before it. Held in the module, so a reload that loses it
// can leave a second one running; refreshes coalesce (DD-5), so that costs a read, not a wrong figure.
let timer = null
function startTimer($) {
  try { if (timer) timer.cancel() } catch (err) { /* already gone */ }
  timer = $.clock.every(TICK_MS, () => { void runRefresh($).catch(() => {}) })
}

// After /clear (no session.start follows it): make sure a timer runs, and bring the body back now.
async function afterClear($) {
  startTimer($)
  await runRefresh($)
}

async function startSession($) {
  await $.command.register({ name: 'akili-panel', description: 'Open the Akili side pane' })
  await update($, pending, () => null)
  await copyUsage($, await $.session.usage())
  startTimer($)
}

// ------------------------------------------------------------ the Next press (FR-7, DD-8, B1)

async function press($, next) {
  const since = await $.clock.now()
  let flipped = false
  await update($, pending, (cur) => {
    flipped = cur == null
    return flipped ? { since, command: next.command } : cur
  })
  if (!flipped) return
  later($, () => afterRun($, next.command, next.args))
  try {
    await $.command.run({ command: next.command, args: next.args })
  } catch (err) {
    $.ui.toast(STRINGS.runRefused(next.command, reasonOf(err)))
  } finally {
    await clearPending($, since)
  }
}

async function openPane($) {
  try {
    const opening = await $.ui.open({ id: PANE, title: 'Akili', backgroundColor: 'transparent', rows: PANE_ROWS })
    if (!opening.isPlaced) return { text: STRINGS.paneNotShown(opening.reason) }
    await update($, opened, () => true)
    later($, () => runRefresh($))
    return { text: STRINGS.paneOpened }
  } catch (err) {
    return { text: STRINGS.paneNotShown(reasonOf(err)) }
  }
}

// ------------------------------------------------------------ hooks

export const register = (on) => {
  on('session.start', async ($, e, next) => {
    const ran = await next(e)
    later($, () => startSession($).catch((err) => $.ui.log(`akili-panel: start failed: ${reasonOf(err)}`)))
    return ran
  })

  on('command.run', { command: 'akili-panel' }, ($) => openPane($))

  on('command.run', { command: OTHER_AKILI }, async ($, e, next) => {
    const ran = await next(e)
    later($, () => afterRun($, e.command, e.args))
    return ran
  }).catch(passOn)

  on('tool.call', { tool: 'Skill' }, async ($, e, next) => {
    const ran = await next(e)
    if (/^akili-/.test(String(e.skill || ''))) later($, () => afterRun($, String(e.skill), String(e.args || '')))
    return ran
  }).catch(passOn)

  on('turn.start', async ($, e, next) => {
    const ran = await next(e)
    if (!e.agentId) later($, () => afterTurnStart($, String(e.text || '')))
    return ran
  })

  on('turn.complete', async ($, e, next) => {
    const ran = await next(e)
    later($, () => addTurn($, e.usage))
    if (!e.agentId) later($, () => runRefresh($))
    return ran
  })

  on('session.measure', async ($, e, next) => {
    const ran = await next(e)
    later($, () => copyUsage($, e))
    return ran
  })

  on('session.end', async ($, e, next) => {
    const ran = await next(e)
    if (e.reason === 'clear' || e.reason === 'resume') later($, () => resetSums($))
    if (e.reason === 'clear') later($, () => afterClear($))
    return ran
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const v = await read($, view)
    const sums = await read($, tokens)
    const used = await read($, usage)
    const busy = await read($, pending)
    const cols = e.props && e.props.bodyColumns
    const rows = paneRows({ view: v, usage: used, sums, pending: busy, cols })
    const part = (p) => <Text color={p.tone} bold={p.bold} dimColor={p.dim}>{p.text}</Text>
    const draw = (row) => {
      if (!row.next) return <Text>{row.parts.length ? row.parts.map(part) : ' '}</Text>
      if (!row.next.label) return null // 1 to 2 columns: no room for a chip (FR-7)
      if (e.surface !== 'terminal') {
        return <Button key="next" variant="primary" dimColor={row.next.pending} onPress={() => press($, v.next)}>{row.next.label}</Button>
      }
      const fill = row.next.pending ? {} : { backgroundColor: 'suggestion', color: 'inverseText', bold: true }
      return <Button key="next" plain dimColor={row.next.pending} onPress={() => press($, v.next)}><Text {...fill}>{` ${row.next.label} `}</Text></Button>
    }
    return <Box flexDirection="column">{rows.map(draw)}</Box>
  })
}
