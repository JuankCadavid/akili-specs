// akili-panel hooks module (changes/akili-panel T5, design §3, §5, §6, §8).
// Read-only toward the project (FR-10): file list, exists and read only, no process (DD-17).
// Every hook passes the event on first with `next(e)` and returns what it resolved to; the
// plugin's own work runs afterwards on the clock, so a failure here never reaches the command.
// Only the /akili-panel hook answers for itself, without next.
import { atom, read, update } from 'claude-code'
import {
  STRINGS, MAX_KEPT, refresh, keptSpecFor, keepSpec, storeKey, formatNext, formatHeader,
  formatConstitution, formatPhaseLines, emptyStateText, errorLines, formatTokens, fitLine, turnTokens,
} from './flow.mjs'

const PANE = 'akili'
const TICK_MS = 30000
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

async function paneIsUp($) {
  if (!(await read($, opened))) return false
  if ((await $.ui.panes()).some((pane) => pane.id === PANE)) return true
  await update($, opened, () => false)
  return false
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

async function startSession($) {
  await $.command.register({ name: 'akili-panel', description: 'Open the Akili side pane' })
  await update($, pending, () => null)
  await copyUsage($, await $.session.usage())
  $.clock.every(TICK_MS, () => { void runRefresh($).catch(() => {}) })
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
    const opening = await $.ui.open({ id: PANE, title: 'Akili' })
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
    return ran
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const v = await read($, view)
    const sums = await read($, tokens)
    const used = await read($, usage)
    const busy = await read($, pending)
    const cols = e.props && e.props.bodyColumns
    const flow = v ? formatPhaseLines(v.phases) : []
    const empty = v ? emptyStateText(v) : null
    return (
      <Box flexDirection="column">
        <Text>{v ? formatHeader(v, cols) : 'Akili'}</Text>
        {v && <Text>{fitLine(formatConstitution(v.constitution), cols)}</Text>}
        {empty && <Text dimColor>{fitLine(empty, cols)}</Text>}
        {flow.map((line) => <Text bold={line.current}>{fitLine(line.text, cols)}</Text>)}
        {v && errorLines(v.errors, cols).map((line) => <Text dimColor>{line}</Text>)}
        <Box marginTop={1}>
          <Text dimColor>{formatTokens(used, sums, cols)}</Text>
        </Box>
        {v && v.next && (
          <Box marginTop={1}>
            <Button key="next" variant="primary" dimColor={!!busy} onPress={() => press($, v.next)}>
              {fitLine(formatNext(v.next), cols)}
            </Button>
          </Box>
        )}
      </Box>
    )
  })
}
